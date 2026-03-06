# CUDA Native Addon for UltraCode

GPU-accelerated vector operations and FAISS GPU index management using NVIDIA CUDA.

## Features

- **Cosine Similarity**: Single and batch GPU-accelerated cosine similarity computation
- **Euclidean Distance**: L2 distance calculation on GPU
- **Vector Normalization**: Batch normalization (L2 norm = 1)
- **Native FAISS CPU** (optional): CPU-based FAISS via `index_factory` — supports ALL index types (Flat, HNSW, IVF, SQ, PQ, and combinations). Replaces `faiss-napi` entirely in the GPU worker pipeline. Compiled with `ENABLE_FAISS_CPU`.
- **FAISS GPU IVF** (optional): GPU-accelerated IVF,SQ8 index — create, train, add, search, save/load. Compiled with `ENABLE_FAISS_GPU`.
- **Multi-Index Pool**: Multiple FAISS indexes managed internally by `projectKey` (C++ side). TypeScript only tracks metadata + ID maps.
- **Automatic Device Detection**: Detects and uses available NVIDIA GPU; falls back to CPU-only FAISS when no GPU present

## Supported GPU Architectures

Default build targets **RTX 4060+** GPUs:

| Architecture | Compute Capability | GPUs |
|---|---|---|
| Ada Lovelace | `sm_89` | RTX 4060, 4070, 4080, 4090 |
| Blackwell | `sm_120` | RTX 5060, 5070, 5080, 5090 |

To support older GPUs, add architectures to `CMakeLists.txt` or pass `-CudaArch` to build scripts:

| Architecture | Compute Capability | GPUs |
|---|---|---|
| Turing | `sm_75` | GTX 1650 Ti, RTX 2060-2080 |
| Ampere | `sm_80` / `sm_86` | A100 / RTX 3060-3090 |

> **DLL size scales with architecture count**: 2 architectures = ~73 MB, 7 architectures = ~248 MB.
> Each architecture roughly adds ~25-35 MB of GPU template code.

## Requirements

- **NVIDIA GPU**: RTX 4060 or newer (Compute Capability 8.9+)
- **CUDA Toolkit**: 12.x or 13.x
- **CMake**: 3.18+
- **cmake-js**: `npm install -g cmake-js`
- **Node.js**: 18+
- **Visual Studio Build Tools** 2022+ (Windows) or **GCC/G++** (Linux)
- **vcpkg** with OpenBLAS (for FAISS GPU build only)

## Build

### Step 1: Build FAISS GPU Library (one-time)

FAISS is built from source with GPU support. The script auto-detects the latest stable release.

**Windows** (requires VS Developer Command Prompt or wrapper):
```batch
:: Use the wrapper that sets up vcvarsall.bat environment
scripts\_build-faiss-gpu-run.bat
```

Or manually:
```powershell
# From VS Developer Command Prompt (x64)
$env:CUDA_PATH = "C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v13.1"
$env:VCPKG_ROOT = "C:\vcpkg"
.\scripts\build-faiss-gpu.ps1
```

**Parameters:**
```powershell
.\scripts\build-faiss-gpu.ps1
    [-Clean]                    # Re-clone and rebuild from scratch
    [-FaissTag v1.14.1]        # Pin specific version (default: auto-detect latest)
    [-CudaArch "89;120"]       # CUDA architectures (default: "89;120")
```

**Output:**
```
external-libs/faiss-gpu-win32-x64/
    bin/faiss.dll              # ~73 MB (with 2 architectures)
    lib/faiss.lib              # ~19 MB (import library)
    include/faiss/             # C++ headers
    include/faiss/gpu/         # GPU-specific headers
```

**Linux/WSL:**
```bash
./scripts/build-faiss-gpu.sh
```

### Step 2: Build CUDA Addon

**Windows** (with Native FAISS CPU — replaces faiss-napi):
```powershell
.\scripts\build-cuda.ps1 -FaissCpu [-Clean]
```

**Windows** (with both CPU and GPU FAISS):
```powershell
.\scripts\build-cuda.ps1 -FaissCpu -FaissGpu [-Clean]
```

**Windows** (with FAISS GPU only):
```batch
:: Use the wrapper
scripts\_build-cuda-faiss-run.bat
```

Or manually:
```powershell
.\scripts\build-cuda.ps1 -FaissGpu [-Clean]
```

**Without FAISS** (vector ops only):
```powershell
.\scripts\build-cuda.ps1
```

### Linux / WSL Build

Build the addon for Linux using WSL2 (Ubuntu). This is required for npm packages that ship both win32 and linux binaries.

**Prerequisites (one-time):**
```bash
# Inside WSL (Ubuntu 24.04)
sudo apt-get update
sudo apt-get install -y cmake build-essential libfaiss-dev libopenblas-dev
# CUDA Toolkit must be installed (e.g. cuda-toolkit-13-1)
```

**Build with Native FAISS CPU:**
```bash
# From Windows (invokes WSL automatically):
wsl -d Ubuntu-24.04 -e bash -c '
  export PATH="/usr/local/cuda/bin:$PATH"
  export CUDA_PATH="/usr/local/cuda"
  cd /mnt/d/github/ultracode
  bash scripts/build-linux-wsl.sh --faiss-cpu --clean
'
```

**Script flags:**
```bash
scripts/build-linux-wsl.sh
    [--clean]       # Remove previous build
    [--faiss-cpu]   # Enable native FAISS CPU (replaces faiss-napi)
    [--faiss-gpu]   # Enable FAISS GPU (requires FAISS GPU libs)
    [--no-cuda]     # Build without CUDA (FAISS CPU only, no GPU vector ops)
```

**Output:**
```
external-libs/cuda-linux-x64/
    ultracode_cuda.node   # ~9 MB (CUDA + FAISS CPU statically linked)
    libopenblas.so.0      # ~49 MB (BLAS runtime)
    libgfortran.so.5      # ~3.4 MB (Fortran runtime, dep of openblas)
    libgomp.so.1          # ~353 KB (OpenMP runtime)
```

**FAISS linking on Linux:**
- CMake first looks in `external-libs/faiss-gpu-linux-x64/` (project-local FAISS built from source)
- Falls back to system FAISS via `find_library(faiss)` (e.g. `apt install libfaiss-dev`)
- System `libfaiss.a` is statically linked — the addon is self-contained (no `libfaiss.so` needed at runtime)
- OpenMP (`libgomp`) and BLAS (`libopenblas`) are dynamically linked — `.so` files must be shipped alongside

**Runtime .so dependencies** (must be in `LD_LIBRARY_PATH` or alongside the addon):

| Library | Source | Required |
|---------|--------|----------|
| `libcudart.so.13` | CUDA Toolkit | Only for GPU ops (CPU FAISS works without) |
| `libopenblas.so.0` | `apt install libopenblas-dev` | Yes — BLAS for FAISS |
| `libgfortran.so.5` | GCC runtime | Yes — dependency of openblas |
| `libgomp.so.1` | GCC runtime | Yes — OpenMP for FAISS parallelism |

### Windows Output

```
external-libs/cuda-win32-x64/ultracode_cuda.node   # canonical location
dist/native/cuda/ultracode_cuda.node                # copied during npm run build
```

The addon is loaded by the GPU worker from these paths (in order):
1. `external-libs/cuda-{platform}-x64/`
2. `dist/native/cuda/`
3. `build/Release/`

### Build Wrappers

For environments without VS Developer Command Prompt (e.g. bash, plain cmd.exe),
use the `.bat` wrappers that call `vcvarsall.bat x64` to set up the MSVC environment:

| Script | Platform | Purpose |
|--------|----------|---------|
| `scripts/_build-faiss-gpu-run.bat` | Windows | Build FAISS from source with GPU |
| `scripts/_build-cuda-faiss-run.bat` | Windows | Build CUDA addon with FAISS GPU |
| `scripts/_build-linux-wsl-run.sh` | WSL/Linux | Build CUDA addon with FAISS CPU (run inside WSL) |
| `scripts/_build-linux-wsl-run.cmd` | Windows→WSL | Windows wrapper that invokes WSL build |

Edit these files to match your VS/CUDA paths if they differ from defaults.

**Quick build from Windows:**
```cmd
REM Windows addon (PowerShell):
scripts\build-cuda.ps1 -FaissCpu -Clean

REM Linux addon (via WSL):
wsl -d Ubuntu-24.04 -e bash /mnt/d/github/ultracode/scripts/_build-linux-wsl-run.sh --clean
```

### npm Package — Multi-Platform

To ship both platforms in npm:

```
dist/native/cuda/
    ultracode_cuda.node        # win32 or linux (tsup copies from external-libs/)
```

`tsup.config.ts` automatically copies the addon + DLLs/`.so` files from `external-libs/cuda-{platform}-x64/` to `dist/native/cuda/` during `npm run build`. For cross-platform npm packages, build on each platform separately and merge the `dist/` outputs, or use platform-specific optional dependencies (`@ultracode/cuda-win32-x64`, `@ultracode/cuda-linux-x64`).

## Updating FAISS Version

The build script **auto-detects the latest stable FAISS release** via `git ls-remote`.
When a new version is released:

### Automatic Update

```powershell
# Clean rebuild with latest version (auto-detected)
.\scripts\build-faiss-gpu.ps1 -Clean
```

The script will:
1. Detect the latest `vX.Y.Z` tag from `github.com/facebookresearch/faiss`
2. Clone with `--depth 1`
3. Apply MSVC/Win32 compatibility patches
4. Build and install

### Pin a Specific Version

```powershell
.\scripts\build-faiss-gpu.ps1 -Clean -FaissTag v1.14.1
```

### MSVC/Win32 Patches

FAISS is developed primarily for Linux/GCC. The build script applies 4 patches for Windows:

| # | Fix | Files | Issue |
|---|-----|-------|-------|
| 1 | `small` -> `isSmall` | `gpu/utils/MergeNetworkWarp.cuh` | Windows SDK `#define small char` conflicts with variable name |
| 2 | `size_t` -> `int64_t` | 4 OpenMP `.cpp` files | MSVC OpenMP requires signed loop variable |
| 3 | `.template view<2>` | `gpu/impl/PQCodeDistances-inl.cuh` | NVCC template disambiguation |
| 4 | Remove `__restrict` | `distances_avx2.cpp`, `distances_simd.cpp` | MSVC includes `__restrict` in name mangling (GCC/Clang don't), causing LNK2019 |

Patches are applied in two ways:
- **`git apply`** using `scripts/faiss-gpu-msvc-win32.patch` (exact match, fast)
- **`sed` fallback** (pattern-based, works across FAISS versions even if line numbers shift)

### When Patches Break After Update

If a new FAISS version changes the patched files significantly:

1. **Try building first** — the `sed` fallback is version-agnostic and often works
2. If `sed` fails, inspect the error:
   - Patch 1: search for `bool small` in `MergeNetworkWarp.cuh` — rename to `isSmall`
   - Patch 2: search for `#pragma omp parallel` followed by `for (size_t` — change to `int64_t`
   - Patch 3: search for `.view<2>` in CUDA files — add `.template` keyword
   - Patch 4: search for `__restrict` mismatches between `.h` declarations and `.cpp` definitions
3. Update `scripts/faiss-gpu-msvc-win32.patch`:
   ```bash
   cd build/faiss-gpu/faiss
   # Make fixes manually, then:
   git diff > ../../../scripts/faiss-gpu-msvc-win32.patch
   ```

### Build Configuration Notes

| Setting | Value | Why |
|---------|-------|-----|
| `FAISS_OPT_LEVEL` | `generic` | `avx2` creates a separate `faiss_avx2.dll` that fails to link on MSVC due to `__restrict` mangling bug |
| `FAISS_ENABLE_RAFT` | `OFF` | Not used by UltraCode |
| `FAISS_ENABLE_CUVS` | `OFF` | Not used by UltraCode |
| `FAISS_ENABLE_PYTHON` | `OFF` | No Python bindings needed |
| `BUILD_TESTING` | `OFF` | Skip test compilation |
| Generator | `Ninja` | Parallel builds, faster than MSBuild for CUDA |
| `-allow-unsupported-compiler` | Required | CUDA 13.x doesn't officially support VS 2026 |

## Performance

| Operation | CPU (Pure JS) | WASM SIMD | **CUDA** |
|-----------|---------------|-----------|----------|
| Cosine similarity (8192-dim) | ~10ms | ~2-3ms | **~0.1-0.2ms** |
| Batch similarities (100 pairs) | ~1000ms | ~200-300ms | **~5-10ms** |
| Speedup | 1x (baseline) | 4-8x | **100-200x** |

## API

### Vector Operations

#### `cosineSimilarity(vec_a: number[], vec_b: number[]): number`
Computes cosine similarity between two vectors on GPU.

#### `batchCosineSimilarity(vecs_a: number[][], vecs_b: number[][]): number[]`
Computes multiple cosine similarities in parallel on GPU.

#### `euclideanDistance(vec_a: number[], vec_b: number[]): number`
Computes Euclidean (L2) distance on GPU.

#### `normalizeVectors(vectors: number[][]): number[][]`
Normalizes vectors to unit length (L2 norm = 1) on GPU.

#### `getDeviceInfo(): object`
Returns CUDA device information (name, compute capability, memory, SM count).

### Native FAISS CPU Operations (when compiled with `ENABLE_FAISS_CPU`)

These methods replace `faiss-napi` in the GPU worker pipeline. Indexes are managed internally by C++ — TypeScript only tracks metadata and ID maps.

#### `hasNativeFaiss: boolean`
`true` if the addon was compiled with `ENABLE_FAISS_CPU`.

#### `faissIndexCreate(projectKey: string, dims: number, factoryString: string, metric?: string): object`
Creates a FAISS index using `index_factory`. Supports any factory string: `"Flat"`, `"HNSW32"`, `"IVF256,SQ8"`, `"IVF1024,PQ16"`, etc. `metric` is `"L2"` or `"IP"` (default: `"L2"`).

#### `faissIndexTrain(projectKey: string, vectors: Float32Array | number[], count: number): object`
Trains the index (required for IVF-based indexes). All FAISS exceptions are caught and converted to JS errors — no process crash.

#### `faissIndexAdd(projectKey: string, vectors: Float32Array | number[], count: number): object`
Adds vectors to a trained index.

#### `faissIndexSearch(projectKey: string, query: Float32Array | number[], k: number, nprobe?: number): { labels: BigInt64Array, distances: Float32Array }`
Searches for k nearest neighbors. Optional `nprobe` for IVF indexes.

#### `faissIndexBatchSearch(projectKey: string, queries: Float32Array, nQueries: number, k: number, nprobe?: number): { labels: BigInt64Array, distances: Float32Array, nQueries: number, k: number }`
Batch search — multiple queries in a single call.

#### `faissIndexSave(projectKey: string, path: string): object`
Saves index to disk via `faiss::write_index`.

#### `faissIndexLoad(projectKey: string, path: string): object`
Loads index from disk via `faiss::read_index`. Returns `{ loadedVectors, isTrained, dims, indexType }`.

#### `faissIndexRemove(projectKey: string): object`
Removes index from memory.

#### `faissIndexReset(projectKey: string): object`
Clears all vectors from the index (keeps structure).

#### `faissIndexStats(projectKey?: string): Array<object>`
Returns stats for one or all loaded indexes.

### FAISS GPU IVF Operations (when compiled with `ENABLE_FAISS_GPU`)

#### `hasGpuFaiss: boolean`
`true` if the addon was compiled with FAISS GPU support.

#### `gpuIvfCreate(projectKey: string, dims: number, nlist: number, sqBits: number, metric: string): void`
Creates a GPU IVF,SQ index for a project. `metric` is `"L2"` or `"IP"`.

#### `gpuIvfTrain(projectKey: string, vectors: Float32Array, count: number): void`
Trains the IVF index with representative vectors. Minimum `39 * nlist` vectors recommended.

#### `gpuIvfAdd(projectKey: string, vectors: Float32Array, count: number): void`
Adds vectors to a trained index.

#### `gpuIvfSearch(projectKey: string, query: Float32Array, k: number): { labels: BigInt64Array, distances: Float32Array }`
Searches for k nearest neighbors on GPU.

#### `gpuIvfBatchSearch(projectKey: string, queries: Float32Array, nQueries: number, k: number): { labels: BigInt64Array, distances: Float32Array }`
Batch search — the main GPU performance advantage.

#### `gpuIvfSave(projectKey: string, path: string): void`
Saves GPU index to disk (GPU -> CPU copy, then `faiss::write_index`).

#### `gpuIvfLoad(projectKey: string, path: string): void`
Loads index from disk to GPU (`faiss::read_index` -> CPU to GPU copy).

#### `gpuIvfRemove(projectKey: string): void`
Removes index from GPU memory.

#### `gpuIvfStats(projectKey?: string): { projectKey: string, ntotal: number, dims: number, gpuMemoryMB: number }[]`
Returns stats for one or all loaded GPU indexes.

## Architecture

### Source Files

| File | Compiled by | Purpose |
|------|-------------|---------|
| `src/vector_ops.cu` | NVCC | CUDA kernels: cosine similarity, L2 distance, normalization |
| `src/embedding_kernels.cu` | NVCC | Embedding-specific GPU operations |
| `src/addon.cpp` | MSVC | N-API addon entry point |
| `src/binding.cpp` | MSVC | N-API function exports for CUDA, CPU FAISS, and GPU FAISS |
| `src/cpu_ivf_ops.cpp` | MSVC | **Native FAISS CPU**: ALL index types via `index_factory` (Flat/HNSW/IVF/SQ/PQ). Replaces faiss-napi. |
| `src/gpu_ivf_ops.cpp` | MSVC | FAISS GPU IVF operations (C++ API, not CUDA kernels) |

> Both `cpu_ivf_ops.cpp` and `gpu_ivf_ops.cpp` are `.cpp` (not `.cu`) because NVCC cannot compile `<napi.h>` templates.
> They call FAISS C++ API which internally manages CUDA operations (for GPU) or CPU operations.

### Build System (`CMakeLists.txt`)

- **cmake-js** with Visual Studio generator
- CUDA architectures: `89, 120` (Ada + Blackwell)
- `ENABLE_FAISS_CPU` option links `faiss.lib` and adds `ULTRACODE_FAISS_CPU=1` define (replaces faiss-napi)
- `ENABLE_FAISS_GPU` option links `faiss.lib` and adds `ULTRACODE_FAISS_GPU=1` define
- FAISS GPU code is bundled in main `faiss.lib` (no separate `faiss_gpu.lib` since FAISS v1.11)
- Output binary: `ultracode_cuda.node`

## Troubleshooting

### "CUDA Toolkit not found"
Set `CUDA_PATH` environment variable:
```powershell
$env:CUDA_PATH = "C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v13.1"
```

### "No CMAKE_CXX_COMPILER could be found"
Run from VS Developer Command Prompt, or use the `.bat` wrappers that call `vcvarsall.bat`.

### "CUDA VS Integration not found"
Copy CUDA props/targets from CUDA SDK to VS BuildCustomizations:
```
%CUDA_PATH%\extras\visual_studio_integration\MSBuildExtensions\*
  -> C:\Program Files\Microsoft Visual Studio\<ver>\<edition>\MSBuild\Microsoft\VC\v180\BuildCustomizations\
```

### FAISS DLL too large
Reduce CUDA architectures. Each architecture adds ~25-35 MB:
```powershell
# Build for your GPU only (check with nvidia-smi --query-gpu=compute_cap)
.\scripts\build-faiss-gpu.ps1 -Clean -CudaArch "120"   # RTX 5060 only = ~50 MB
```

### "LNK2019: unresolved external symbol fvec_madd"
This happens with `FAISS_OPT_LEVEL=avx2` on MSVC. Use `generic` (already the default).

## References

- [FAISS GitHub](https://github.com/facebookresearch/faiss)
- [CUDA Programming Guide](https://docs.nvidia.com/cuda/cuda-c-programming-guide/)
- [N-API Documentation](https://nodejs.org/api/n-api.html)
- [cmake-js](https://github.com/cmake-js/cmake-js)
- [CUDA Compute Capabilities](https://developer.nvidia.com/cuda-gpus)

## License

MIT - Same as parent project
