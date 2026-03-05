using ILGPU;
using ILGPU.Runtime;

namespace UltraCode.CSharp.Gpu;

/// <summary>
/// ILGPU kernels for batch code metrics computation.
/// </summary>
public sealed class GpuMetricsKernel : IDisposable
{
    private readonly GpuAccelerator _gpu;
    private readonly ILogger<GpuMetricsKernel> _logger;

    private Action<Index1D, ArrayView<int>, ArrayView<int>, ArrayView<int>, ArrayView<int>, ArrayView<int>>? _complexityKernel;
    private Action<Index1D, ArrayView<int>, ArrayView<int>, ArrayView<int>, ArrayView<ulong>>? _simHashKernel;
    private bool _compiled;

    public GpuMetricsKernel(GpuAccelerator gpu, ILogger<GpuMetricsKernel> logger)
    {
        _gpu = gpu;
        _logger = logger;
    }

    private void EnsureCompiled()
    {
        if (_compiled) return;
        var acc = _gpu.GetOrCreate();
        _complexityKernel = acc.LoadAutoGroupedStreamKernel<Index1D, ArrayView<int>, ArrayView<int>, ArrayView<int>, ArrayView<int>, ArrayView<int>>(ComplexityKernelImpl);
        _simHashKernel = acc.LoadAutoGroupedStreamKernel<Index1D, ArrayView<int>, ArrayView<int>, ArrayView<int>, ArrayView<ulong>>(SimHashKernelImpl);
        _compiled = true;
    }

    /// <summary>
    /// Batch compute cyclomatic complexity for all methods on GPU.
    /// </summary>
    public int[] BatchComplexity(int[] nodeKinds, int[] starts, int[] ends, int[] complexityKindsSorted)
    {
        if (starts.Length == 0) return [];

        EnsureCompiled();
        var acc = _gpu.GetOrCreate();
        int methodCount = starts.Length;

        using var nodeKindsBuf = acc.Allocate1D(nodeKinds);
        using var startsBuf = acc.Allocate1D(starts);
        using var endsBuf = acc.Allocate1D(ends);
        using var complexityKindsBuf = acc.Allocate1D(complexityKindsSorted);
        using var resultsBuf = acc.Allocate1D<int>(methodCount);
        resultsBuf.MemSetToZero();

        _complexityKernel!(methodCount, nodeKindsBuf.View, startsBuf.View, endsBuf.View, complexityKindsBuf.View, resultsBuf.View);
        acc.Synchronize();

        var results = resultsBuf.GetAsArray1D();
        _logger.LogDebug("[GPU] Batch complexity computed for {Count} methods", methodCount);
        return results;
    }

    /// <summary>
    /// Batch compute SimHash for token sequences on GPU for clone detection.
    /// </summary>
    public ulong[] BatchSimHash(int[] tokenKinds, int[] starts, int[] ends)
    {
        if (starts.Length == 0) return [];

        EnsureCompiled();
        var acc = _gpu.GetOrCreate();
        int methodCount = starts.Length;

        using var tokensBuf = acc.Allocate1D(tokenKinds);
        using var startsBuf = acc.Allocate1D(starts);
        using var endsBuf = acc.Allocate1D(ends);
        using var resultsBuf = acc.Allocate1D<ulong>(methodCount);
        resultsBuf.MemSetToZero();

        _simHashKernel!(methodCount, tokensBuf.View, startsBuf.View, endsBuf.View, resultsBuf.View);
        acc.Synchronize();

        var results = resultsBuf.GetAsArray1D();
        _logger.LogDebug("[GPU] Batch SimHash computed for {Count} methods", methodCount);
        return results;
    }

    /// <summary>
    /// GPU kernel: cyclomatic complexity per method.
    /// Each thread processes one method's node range.
    /// </summary>
    private static void ComplexityKernelImpl(
        Index1D index,
        ArrayView<int> nodeKinds,
        ArrayView<int> starts,
        ArrayView<int> ends,
        ArrayView<int> complexityKinds,
        ArrayView<int> results)
    {
        int complexity = 1; // base complexity
        int start = starts[index];
        int end = ends[index];
        int kindCount = (int)complexityKinds.Length;

        for (int i = start; i < end; i++)
        {
            int kind = nodeKinds[i];
            // Binary search in sorted complexity kinds
            int lo = 0, hi = kindCount - 1;
            while (lo <= hi)
            {
                int mid = (lo + hi) / 2;
                int midVal = complexityKinds[mid];
                if (midVal == kind)
                {
                    complexity++;
                    break;
                }
                if (midVal < kind) lo = mid + 1;
                else hi = mid - 1;
            }
        }
        results[index] = complexity;
    }

    /// <summary>
    /// GPU kernel: SimHash per method based on token kinds.
    /// Uses FNV-1a style hashing to produce a 64-bit fingerprint per method.
    /// </summary>
    private static void SimHashKernelImpl(
        Index1D index,
        ArrayView<int> tokenKinds,
        ArrayView<int> starts,
        ArrayView<int> ends,
        ArrayView<ulong> results)
    {
        int start = starts[index];
        int end = ends[index];

        // SimHash: accumulate bit weights
        // For each n-gram (3-gram of token kinds), hash it and adjust bit weights
        long bitWeights0 = 0, bitWeights1 = 0, bitWeights2 = 0, bitWeights3 = 0;
        int length = end - start;

        if (length < 3)
        {
            // Too short for n-grams — simple hash
            ulong h = 14695981039346656037UL;
            for (int i = start; i < end; i++)
            {
                h ^= (ulong)tokenKinds[i];
                h *= 1099511628211UL;
            }
            results[index] = h;
            return;
        }

        for (int i = start; i <= end - 3; i++)
        {
            // FNV-1a hash of 3-gram
            ulong h = 14695981039346656037UL;
            h ^= (ulong)tokenKinds[i];
            h *= 1099511628211UL;
            h ^= (ulong)tokenKinds[i + 1];
            h *= 1099511628211UL;
            h ^= (ulong)tokenKinds[i + 2];
            h *= 1099511628211UL;

            // Accumulate bit weights (split 64-bit into 4x16-bit groups)
            int w0 = (int)(h & 0xFFFF);
            int w1 = (int)((h >> 16) & 0xFFFF);
            int w2 = (int)((h >> 32) & 0xFFFF);
            int w3 = (int)((h >> 48) & 0xFFFF);

            bitWeights0 += (w0 > 32768) ? 1 : -1;
            bitWeights1 += (w1 > 32768) ? 1 : -1;
            bitWeights2 += (w2 > 32768) ? 1 : -1;
            bitWeights3 += (w3 > 32768) ? 1 : -1;
        }

        // Construct final hash from sign of bit weights
        ulong result = 0;
        if (bitWeights0 > 0) result |= 0x000000000000FFFFUL;
        if (bitWeights1 > 0) result |= 0x00000000FFFF0000UL;
        if (bitWeights2 > 0) result |= 0x0000FFFF00000000UL;
        if (bitWeights3 > 0) result |= 0xFFFF000000000000UL;

        results[index] = result;
    }

    public void Dispose()
    {
        // Kernels are owned by accelerator, no explicit dispose needed
    }
}
