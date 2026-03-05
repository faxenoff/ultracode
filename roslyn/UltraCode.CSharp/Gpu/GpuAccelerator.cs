using ILGPU;
using ILGPU.Runtime;

namespace UltraCode.CSharp.Gpu;

/// <summary>
/// Manages GPU accelerator lifecycle with automatic device selection.
/// Priority: CUDA -> OpenCL -> CPU fallback via GetPreferredDevice.
/// </summary>
public sealed class GpuAccelerator : IDisposable
{
    private readonly ILogger<GpuAccelerator> _logger;
    private readonly object _lock = new();
    private Context? _context;
    private Accelerator? _accelerator;
    private bool _disposed;

    public const int GpuBatchThreshold = 20;

    public GpuAccelerator(ILogger<GpuAccelerator> logger)
    {
        _logger = logger;
    }

    public string DeviceName => _accelerator?.Name ?? "not initialized";

    public Accelerator GetOrCreate()
    {
        if (_accelerator != null) return _accelerator;

        lock (_lock)
        {
            if (_accelerator != null) return _accelerator;

            _context = Context.Create(b => b.AllAccelerators().EnableAlgorithms());

            // ILGPU picks best GPU automatically; falls back to CPU if no GPU
            var preferred = _context.GetPreferredDevice(preferCPU: false);
            _accelerator = preferred.CreateAccelerator(_context);
            _logger.LogInformation("[GPU] Accelerator initialized: {Name} ({Type})", _accelerator.Name, _accelerator.AcceleratorType);

            return _accelerator;
        }
    }

    public bool ShouldUseGpu(int fileCount) => fileCount >= GpuBatchThreshold;

    public void Dispose()
    {
        if (_disposed) return;
        _disposed = true;
        _accelerator?.Dispose();
        _context?.Dispose();
    }
}
