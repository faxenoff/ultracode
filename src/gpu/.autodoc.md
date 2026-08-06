# gpu

## 🤖 Overview

The `backend-selector.ts` module is responsible for selecting the optimal vector backend based on the runtime environment and hardware capabilities. It prioritizes CUDA Native for Node.js and CUDA Worker for Bun, with fallbacks to other backends if the preferred options are unavailable. This module is used by applications that require high-performance vector operations, ensuring the best possible backend is selected for the current environment.

## 🤖 Architecture

```
       +---------------------+
       |     Backend Selector |
       |     (Singleton)     |
       |     (Runtime-aware) |
       |     (Fallbacks)     |
       +---------------------+
           |       |
           v       v
       +---------------------+
       |     Backend Detection |
       |     (GPU Detection)  |
       |     (Runtime Check)  |
       +---------------------+
           |
           v
       +---------------------+
       |     Backend Selection |
       |     (Priority order) |
       |     (CUDA Native, etc)|
       +---------------------+
           |
           v
       +---------------------+
       |     Backend Factory  |
       |     (JSBackend, etc) |
       +---------------------+
```

## 🤖 Flow

```
       +---------------------+
       |     Backend Selector |
       |     (Singleton)     |
       |     (Runtime-aware) |
       |     (Fallbacks)     |
       +---------------------+
           |       |
           v       v
       +---------------------+
       |     Backend Detection |
       |     (GPU Detection)  |
       |     (Runtime Check)  |
       +---------------------+
           |
           v
       +---------------------+
       |     Backend Selection |
       |     (Priority order) |
       |     (CUDA Native, etc)|
       +---------------------+
           |
           v
       +---------------------+
       |     Backend Factory  |
       |     (JSBackend, etc) |
       +---------------------+
           |
           v
       +---------------------+
       |     Selected Backend |
       |     (Used for operations)|
       +---------------------+
```

## 🤖 Entity Listing

### Function
- **backend** — Represents the selected backend `backend-selector.ts:192-192`
- **isBunRuntime** — Determines if the runtime is Bun `backend-selector.ts:26-28`

### Method
- **close** — Closes the backend selector `backend-selector.ts:227-234`
- **constructor** — Private constructor for BackendSelector `backend-selector.ts:35-35`
- **getAvailableBackends** — Retrieves a list of available backends `backend-selector.ts:207-209`
- **getBackend** — Retrieves the selected backend `backend-selector.ts:182-184`
- **getInfo** — Retrieves information about the selected backend `backend-selector.ts:214-222`
- **getInstance** — Returns the singleton instance of BackendSelector `backend-selector.ts:37-42`
- **initialize** — Initializes and selects the optimal backend `backend-selector.ts:47-177`
- **switchBackend** — Switches to a different backend `backend-selector.ts:190-202`

### Class
- **BackendSelector** — Manages the selection of optimal vector backend `backend-selector.ts:30-235`

### Import_decl
- **../logging/index.js** — Imports `../logging/index.js` from `../logging/index.js`. `backend-selector.ts:20-20`
- **./backends/base.js** — Imports `./backends/base.js` from `./backends/base.js`. `backend-selector.ts:21-21`
- **./backends/js-backend.js** — Imports `./backends/js-backend.js` from `./backends/js-backend.js`. `backend-selector.ts:22-22`
- **./detection/gpu-detector.js** — Imports `./detection/gpu-detector.js` from `./detection/gpu-detector.js`. `backend-selector.ts:23-23`
- **node:os** — Imports `node:os` from `node:os`. `backend-selector.ts:19-19`

### Property
- **available** — Indicates if a backend is available `backend-selector.ts:216-216`
- **availableBackends** — List of available vector backends `backend-selector.ts:33-33`
- **factory** — Factory function for creating a backend `backend-selector.ts:68-68`
- **instance** — Static instance of BackendSelector `backend-selector.ts:31-31`
- **name** — Name of the selected backend `backend-selector.ts:66-66`
- **priority** — Priority of the selected backend `backend-selector.ts:67-67`
- **selected** — Indicates if a backend is selected `backend-selector.ts:215-215`
- **selectedBackend** — Current selected vector backend `backend-selector.ts:32-32`

## Data Flow

```
BackendSelector.initialize()
  │
  ├─ GPUDetector.detect() ─► nvidia-smi / native addon / WebGPU adapter
  │     └─ returns GPUInfo { vendor, model, cc, cuda, webgpu }
  │
  ├─ Build candidates list sorted by priority
  │
  └─ For each candidate:
       ├─ factory() ─► dynamic import of backend module
       ├─ isAvailable() ─► hardware/runtime check
       ├─ initialize() ─► load native addon / WGSL shader / WASM
       └─ on failure ─► log warning, try next candidate

Bun Process                           Node.js Subprocess
┌─────────────────┐                   ┌─────────────────┐
│ GpuWorkerBackend│   IPC JSON        │ gpu-worker.ts   │
│                 │ ──────────────►   │  - CUDA addon   │
│ cosineSimilarity│                   │  - faiss-node   │
└─────────────────┘                   └─────────────────┘
```

## Public API

### Singleton Selector

| Export | Description | Source |
|--------|-------------|--------|
| `BackendSelector` | Singleton class managing GPU detection, backend initialization, and priority-based selection with lifecycle management. | [`backend-selector.ts:30-235`](./backend-selector.ts) |

### BackendSelector Methods

| Method | Description | Source |
|--------|-------------|--------|
| `getInstance()` | Returns the singleton BackendSelector instance, creating it if needed. | [`backend-selector.ts:30-235`](./backend-selector.ts) |
| `initialize()` | Detects GPU hardware, builds priority-ordered backend candidates, and initializes the first available backend with success logging. | [`backend-selector.ts:47-177`](./backend-selector.ts) |
| `getBackend()` | Returns the currently selected VectorBackend implementation. | [`backend-selector.ts:182-184`](./backend-selector.ts) |
| `switchBackend(type)` | Asynchronously switches to a specific backend by name and re-initializes it. | [`backend-selector.ts:190-202`](./backend-selector.ts) |
| `getAvailableBackends()` | Returns array of all successfully initialized backend instances. | [`backend-selector.ts:207-209`](./backend-selector.ts) |
| `getInfo()` | Returns diagnostic object containing selected backend and list of available backends with their capabilities. | [`backend-selector.ts:214-217`](./backend-selector.ts) |
| `close()` | Asynchronously closes all backends, releases GPU resources, and resets the selector state. | [`backend-selector.ts:30-235`](./backend-selector.ts) |

### Core Interfaces

| Export | Description | Source |
|--------|-------------|--------|
| `VectorBackend` | Unified interface implemented by all backends, defining vector operations (cosineSimilarity, batchCosineSimilarity, euclideanDistance, normalizeVectors) and lifecycle methods (initialize, close, getCapabilities, isAvailable). | [`backends/base.ts:12-30`](./backends/base.ts) |
| `BackendCapabilities` | Reports backend capabilities including maximum vector count, maximum dimension, async support, normalization support, available memory, and backend identifier. | [`backends/base.ts:32-38`](./backends/base.ts) |
| `GPUBuffer` | GPU memory buffer handle with buffer reference, data type, shape, and device identifier for managing GPU-allocated memory. | [`backends/base.ts:40-45`](./backends/base.ts) |
| `GPUInfo` | GPU hardware detection result containing vendor name, model identifier, compute capability, CUDA availability, and WebGPU adapter availability. | [`detection/gpu-detector.ts:72-81`](./detection/gpu-detector.ts) |

### Detection and Utilities

| Export | Description | Source |
|--------|-------------|--------|
| `GPUDetector` | Static utility class for hardware GPU detection, WebGPU compatibility validation, and architecture blacklist management with caching. | [`detection/gpu-detector.ts:1-403`](./detection/gpu-detector.ts) |
| `WEBGPU_UNSAFE_MIN_CC` | Compute capability threshold constant used to identify and exclude unsafe GPU architectures from WebGPU candidates. | [`detection/gpu-detector.ts`](./detection/gpu-detector.ts) |
| `WEBGPU_UNSTABLE_ARCHITECTURES` | Array of GPU architecture codes (e.g., Blackwell 12.0) known to crash WebGPU or CUDA and excluded from backend selection. | [`detection/gpu-detector.ts`](./detection/gpu-detector.ts) |

## Backend Implementations

| Backend | Priority | Platform | Description | Source |
|---------|----------|----------|-------------|--------|
| `CudaBackend` | 100 | Node.js on NVIDIA | Native CUDA via N-API addon; highest performance but requires NVIDIA GPU and Node.js runtime. | [`backends/cuda-backend.ts:1-184`](./backends/cuda-backend.ts) |
| `GpuWorkerBackend` | 98–100 | Bun on NVIDIA | CUDA via Node.js subprocess IPC; enables CUDA support under Bun runtime which lacks N-API module loading. | [`backends/gpu-worker-backend.ts:1-118`](./backends/gpu-worker-backend.ts) |
| `MetalBackend` | 95 | macOS ARM64 | Native Metal via N-API addon; second-highest priority, Apple Silicon exclusive, requires macOS. | [`backends/metal-backend.ts:1-180`](./backends/metal-backend.ts) |
| `WebGpuBackend` | 80 | Universal | WebGPU compute shader (WGSL) for cross-platform GPU acceleration; excluded on Blackwell unless `WEBGPU_FORCE_ENABLE=1`. | [`backends/webgpu-backend.ts:1-401`](./backends/webgpu-backend.ts) |
| `WasmBackend` | 50 | Universal | WASM SIMD (Rust wasm-pack) for CPU-level acceleration; synchronous, no async operations. | [`backends/wasm-backend.ts:1-100`](./backends/wasm-backend.ts) |
| `JsBackend` | 1 | Universal | Pure JavaScript with loop unrolling; always available fallback when all other backends fail. | [`backends/js-backend.ts:1-57`](./backends/js-backend.ts) |

## Dependencies

### External
- `node:os` — Runtime platform and architecture detection for Node.js vs Bun awareness
- `node:child_process` — Subprocess IPC for GpuWorkerBackend CUDA relay under Bun
- `webgpu` (optional) — WebGPU API support when runtime provides it

### Internal
- `logging` — Contextual log output with module prefixes (GPUBACKEND, GPUDETECT, CUDABACKEND, etc.)
- `semantic/gpu/gpu-client` — GPU-accelerated client utilities
- `utils/simd-vector-ops` — SIMD optimizations for vector operations

## Error Handling and Graceful Degradation

**GPU Detection** — `GPUDetector.detect()` runs with `timeout: 2000ms`, `windowsHide: true`, stderr suppressed to prevent process noise.

**Backend Initialization** — Each candidate backend attempts `initialize()` in priority order; failures log warnings and continue to next candidate without throwing.

**Blackwell (RTX 50xx) Safety** — Architectures with CC ≥ 12.0 are excluded from WebGPU and CUDA to prevent crashes; override with environment variable `WEBGPU_FORCE_ENABLE=1`.

**WebGPU Adapter** — `GPUAdapter` request returns null gracefully if no GPU adapter is found.

**IPC Resilience** — `GpuWorkerBackend` client start failures cause fallback to next backend.

**Guaranteed Fallback** — `JsBackend` (pure JS) is always initialized last; theoretically impossible for all backends to fail.

## Observability

Logging via contextual `log` module with module-specific prefixes:

| Prefix | Scope | Key Events |
|--------|-------|------------|
| `GPUBACKEND` | BackendSelector | GPU detection, backend selection, capability reports, initialization failures |
| `GPUDETECT` | GPUDetector | CUDA detection (nvidia-smi or addon), WebGPU availability, Blackwell exclusions, forced enable |
| `CUDABACKEND` | CudaBackend | N-API addon loading, device info retrieval |
| `GPUWORKER` | GpuWorkerBackend | Subprocess IPC startup, CUDA info relay, worker communication |
| `METALBACKEND` | MetalBackend | N-API addon loading, device info retrieval |
| `WEBGPUBACKEND` | WebGpuBackend | WebGPU adapter request, shader compilation, buffer allocation |
| `WASMBACKEND` | WasmBackend | WASM module loading and initialization |
| `JSBACKEND` | JsBackend | Initialization and fallback events |

**Diagnostic Methods** — `BackendSelector.getInfo()`, `GPUDetector.getCachedInfo()`, `GPUDetector.testWebGPUCompatibility()`.

## Known Limitations

| Limitation | Description |
|------------|-------------|
| Blackwell incompatibility | RTX 50xx (CC 12.0+) crashes WebGPU Dawn shader compiler and CUDA native addon; excluded by default. |
| Bun NAPI gap | Bun runtime cannot load N-API (Node.js native) modules directly; requires subprocess bridge via GpuWorkerBackend. |
| Per-process GPU cache | GPU hardware info cached once at initialization; hot-plugged GPUs not detected during runtime. |
| WebGPU shader scope | WGSL compute shader specialized for batch cosine similarity; other operations use scalar fallback. |
| Metal platform lock | Metal backend requires macOS with ARM64 architecture (Apple Silicon only). |
| WASM synchronous | WASM backend has `supportsAsync: false`; async API is emulated with Promise wrappers. |
| WebGPU workgroup limit | Compute shader uses 256 threads per workgroup; limits batch sizes. |
| nvidia-smi dependency | GPU detection without native addon requires nvidia-smi binary in system PATH. |
| Float32Array conversion | CUDA and Metal backends require `Array.from()` conversion from input arrays (minor perf cost). |

## TypeScript Notes

- `VectorBackend` interface enforces strict method signatures across all implementations.
- Backend types use discriminated unions via `type` field with `as const` assertions for type narrowing.
- Native addon interfaces (`CUDAAddon`, `MetalAddon`) declared locally to avoid global namespace conflicts.
- All vector operations return `Promise` for API uniformity, even when backend is synchronous.
- WebGPU types (`GPUAdapter`, `GPU`, `GPUBuffer`, `GPUDevice`) declared locally to prevent type collisions with global WebGPU definitions.

## Files

| File | Lines | Description |
|------|-------|-------------|
| [`backend-selector.ts`](./backend-selector.ts) | 236 | Singleton BackendSelector with priority-based GPU detection and backend initialization. |
| [`backends/base.ts`](./backends/base.ts) | 46 | VectorBackend interface, BackendCapabilities, GPUBuffer, and GPUInfo type definitions. |
| [`backends/cuda-backend.ts`](./backends/cuda-backend.ts) | 184 | CUDA Native backend via N-API module; Node.js only, priority 100. |
| [`backends/gpu-worker-backend.ts`](./backends/gpu-worker-backend.ts) | 118 | CUDA Worker backend via subprocess IPC for Bun compatibility; priority 98–100. |
| [`backends/js-backend.ts`](./backends/js-backend.ts) | 57 | Pure JavaScript backend with loop unrolling; priority 1 fallback. |
| [`backends/metal-backend.ts`](./backends/metal-backend.ts) | 180 | Metal Native backend via N-API module; Apple Silicon only, priority 95. |
| [`backends/wasm-backend.ts`](./backends/wasm-backend.ts) | 100 | WASM SIMD backend (Rust-compiled); priority 50. |
| [`backends/webgpu-backend.ts`](./backends/webgpu-backend.ts) | 401 | WebGPU Compute backend with WGSL shader; universal, priority 80, Blackwell-aware. |
| [`detection/gpu-detector.ts`](./detection/gpu-detector.ts) | 403 | GPU hardware detection, WebGPU compatibility testing, Blackwell architecture blacklist. |
```
