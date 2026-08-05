# Backends

## 🤖 Overview

This module provides a unified interface for various GPU backends, enabling efficient vector operations across different hardware platforms. It supports CUDA, Metal, WebGPU, WASM SIMD, and JS backends, catering to developers and data scientists who need high-performance vector computations.

## 🤖 Architecture

```
       +---------------------+
       |     Base Backend    |
       |     (Abstract)      |
       |     Interface       |
       +---------------------+
               |
               v
       +---------------------+
       |     CUDA Backend    |
       |     (NVIDIA GPU)    |
       +---------------------+
               |
               v
       +---------------------+
       |     Metal Backend   |
       |     (Apple GPU)     |
       +---------------------+
               |
               v
       +---------------------+
       |     WebGPU Backend  |
       |     (Universal)     |
       +---------------------+
               |
               v
       +---------------------+
       |     WASM Backend    |
       |     (CPU SIMD)      |
       +---------------------+
               |
               v
       +---------------------+
       |     JS Backend      |
       |     (CPU baseline)  |
       +---------------------+
```

## 🤖 Flow

```
       +---------------------+
       |     Base Backend    |
       |     (Abstract)      |
       |     Interface       |
       +---------------------+
               |
               v
       +---------------------+
       |     Backend Selection|
       |     (Based on type) |
       +---------------------+
               |
               v
       +---------------------+
       |     Backend Initialization|
       |     (Async)          |
       +---------------------+
               |
               v
       +---------------------+
       |     Vector Operations|
       |     (Async)          |
       +---------------------+
               |
               v
       +---------------------+
       |     Memory Management|
       |     (Optional)       |
       +---------------------+
               |
               v
       +---------------------+
       |     Backend Cleanup  |
       |     (Async)          |
       +---------------------+
```

## 🤖 Entity Listing

### Function
- **input** — Converts each vector in the `vectors` array to an array of numbers `cuda-backend.ts:174-174`
- **input** — Input parameter for vector operations `metal-backend.ts:170-170`

### Method
- **batchCosineSimilarity** — Method to compute batch cosine similarity between two sets of vectors `cuda-backend.ts:135-156`
- **batchCosineSimilarity** — Not present in the provided code `gpu-worker-backend.ts:104-110`
- **batchCosineSimilarity** — Computes the cosine similarity for a batch of vectors and returns the results `js-backend.ts:42-52`
- **batchCosineSimilarity** — Method to compute batch cosine similarity between multiple vectors `metal-backend.ts:131-152`
- **batchCosineSimilarity** — Computes batch cosine similarity between a query vector and a database of vectors `wasm-backend.ts:76-94`
- **batchCosineSimilarity** — Computes the cosine similarity between multiple vectors in a batch `webgpu-backend.ts:300-390`
- **close** — Sets `initialized` to false and logs a message indicating the backend has been closed `cuda-backend.ts:180-183`
- **close** — Not present in the provided code `gpu-worker-backend.ts:112-117`
- **close** — Does not perform any cleanup and returns void `js-backend.ts:54-56`
- **close** — Method to close the backend `metal-backend.ts:176-179`
- **close** — Closes the WASM backend by setting `this.ops` to null and logging a message `wasm-backend.ts:96-99`
- **close** — Closes the WebGPU backend `webgpu-backend.ts:392-400`
- **constructor** — Initializes a new instance of the WebGPU backend `webgpu-backend.ts:216-216`
- **cosineSimilarity** — Method to compute cosine similarity between two vectors `cuda-backend.ts:123-133`, `metal-backend.ts:119-129`
- **cosineSimilarity** — Not present in the provided code `gpu-worker-backend.ts:96-102`
- **cosineSimilarity** — Computes the cosine similarity between two vectors using an optimized implementation `js-backend.ts:37-40`
- **cosineSimilarity** — Computes cosine similarity between two vectors `wasm-backend.ts:67-74`
- **cosineSimilarity** — Computes the cosine similarity between two vectors `webgpu-backend.ts:294-298`
- **euclideanDistance** — Method to compute Euclidean distance between two vectors `cuda-backend.ts:158-167`, `metal-backend.ts:154-163`
- **getAdapter** — Retrieves the WebGPU adapter `webgpu-backend.ts:229-248`
- **getCapabilities** — Method to get capabilities of the CUDA backend `cuda-backend.ts:113-121`
- **getCapabilities** — Not present in the provided code `gpu-worker-backend.ts:86-94`
- **getCapabilities** — Returns backend capabilities including max vector count, max dimension, and other properties `js-backend.ts:27-35`
- **getCapabilities** — Method to get backend capabilities `metal-backend.ts:106-117`
- **getCapabilities** — Returns capabilities of the WASM backend `wasm-backend.ts:57-65`
- **getCapabilities** — Retrieves the capabilities of the WebGPU backend `webgpu-backend.ts:284-292`
- **initialize** — Method to initialize the CUDA backend `cuda-backend.ts:97-111`
- **initialize** — Initializes the GPU backend if not already initialized `gpu-worker-backend.ts:69-84`
- **initialize** — Logs initialization information and returns void `js-backend.ts:23-25`
- **initialize** — Method to initialize the backend `metal-backend.ts:91-104`
- **initialize** — Initializes the WASM backend `wasm-backend.ts:46-55`
- **initialize** — Initializes the WebGPU backend `webgpu-backend.ts:250-282`
- **isAvailable** — Method to check if the CUDA backend is available `cuda-backend.ts:52-95`
- **isAvailable** — Checks if the GPU backend is available `gpu-worker-backend.ts:36-67`
- **isAvailable** — Returns true, indicating the backend is always available `js-backend.ts:19-21`
- **isAvailable** — Method to check if the backend is available `metal-backend.ts:52-89`
- **isAvailable** — Checks if the WASM module is available `wasm-backend.ts:34-44`
- **isAvailable** — Checks if the WebGPU backend is available `webgpu-backend.ts:218-227`
- **normalizeVectors** — Method to normalize a set of vectors `cuda-backend.ts:169-178`
- **normalizeVectors** — Method to normalize vectors `metal-backend.ts:165-174`

### Class
- **CUDABackend** — Class implementing the CUDA native backend for vector operations `cuda-backend.ts:44-184`
- **GpuWorkerBackend** — Represents a backend for CUDA operations via Node.js subprocess `gpu-worker-backend.ts:22-118`
- **JSBackend** — Represents a pure JavaScript backend with loop unrolling optimization, always available, and provides a speedup over naive implementations `js-backend.ts:14-57`
- **MetalBackend** — Class for Metal native backend, implementing VectorBackend interface `metal-backend.ts:38-180`
- **WASMBackend** — Class implementing VectorBackend interface for WASM SIMD backend `wasm-backend.ts:27-100`
- **WebGPUBackend** — Implements the VectorBackend interface for WebGPU `webgpu-backend.ts:206-401`

### Interface
- **BackendCapabilities** — Interface representing capabilities of a vector backend `base.ts:32-38`
- **CUDAAddon** — Interface for CUDA native addon (Node.js N-API) with methods for vector operations `cuda-backend.ts:28-40`
- **GPUBuffer** — Interface representing a GPU buffer `base.ts:40-45`
- **MetalAddon** — Interface for Metal native addon (Node.js N-API) - matches binding.mm exports `metal-backend.ts:22-34`
- **VectorBackend** — Abstract interface for different vector operation backends `base.ts:12-30`
- **WASMModule** — Interface for WASM module `wasm-backend.ts:21-23`
- **WASMVectorOpsInstance** — Interface for WASM SIMD operations `wasm-backend.ts:16-19`
- **WebGPUAdapter** — Manages device creation and provides adapter limits `webgpu-backend.ts:191-197`
- **WebGPUBindGroup** — Represents a bind group for GPU operations `webgpu-backend.ts:100-102`
- **WebGPUBindGroupDescriptor** — Defines a bind group descriptor with a label, layout, and entries `webgpu-backend.ts:172-176`
- **WebGPUBindGroupEntry** — Represents a binding group entry with a binding index and a buffer resource `webgpu-backend.ts:162-167`
- **WebGPUBindGroupLayout** — Represents a bind group layout for GPU operations `webgpu-backend.ts:93-95`
- **WebGPUBuffer** — Represents a buffer for GPU operations `webgpu-backend.ts:68-73`
- **WebGPUBufferDescriptor** — Represents a buffer descriptor for GPU operations `webgpu-backend.ts:132-137`
- **WebGPUCommandBuffer** — Represents a command buffer for GPU operations `webgpu-backend.ts:117-119`
- **WebGPUCommandEncoder** — Represents a command encoder for GPU operations `webgpu-backend.ts:124-127`
- **WebGPUComputePass** — Represents a compute pass for GPU operations `webgpu-backend.ts:107-112`
- **WebGPUComputePipeline** — Represents a compute pipeline for GPU operations `webgpu-backend.ts:85-88`
- **WebGPUComputePipelineDescriptor** — Represents a compute pipeline descriptor for GPU operations `webgpu-backend.ts:150-157`
- **WebGPUDevice** — Provides methods to create buffers, shader modules, compute pipelines, bind groups, and command encoders `webgpu-backend.ts:178-189`
- **WebGPUGlobal** — Offers a method to request an adapter `webgpu-backend.ts:202-204`
- **WebGPUShaderModule** — Represents a shader module with an optional label `webgpu-backend.ts:78-80`
- **WebGPUShaderModuleDescriptor** — Represents a shader module descriptor for GPU operations `webgpu-backend.ts:142-145`

### Import_decl
- **../../logging/index.js** — Imports `../../logging/index.js` from `../../logging/index.js`. `cuda-backend.ts:24-24`, `gpu-worker-backend.ts:18-18`, `js-backend.ts:10-10`, `metal-backend.ts:18-18`, `wasm-backend.ts:12-12`, `webgpu-backend.ts:12-12`
- **../../semantic/gpu/gpu-client.js** — Imports `../../semantic/gpu/gpu-client.js` from `../../semantic/gpu/gpu-client.js`. `gpu-worker-backend.ts:19-19`
- **../../utils/simd-vector-ops.js** — Imports `../../utils/simd-vector-ops.js` from `../../utils/simd-vector-ops.js`. `js-backend.ts:11-11`
- **../detection/gpu-detector.js** — Imports `../detection/gpu-detector.js` from `../detection/gpu-detector.js`. `webgpu-backend.ts:13-13`
- **./base.js** — Imports `./base.js` from `./base.js`. `cuda-backend.ts:25-25`, `gpu-worker-backend.ts:20-20`, `js-backend.ts:12-12`, `metal-backend.ts:19-19`, `wasm-backend.ts:13-13`, `webgpu-backend.ts:14-14`
- **node:os** — Imports `node:os` from `node:os`. `metal-backend.ts:17-17`

### Property
- **adapter** — Represents a WebGPU adapter for the device `webgpu-backend.ts:212-212`
- **backend** — Backend type of the GPU buffer `base.ts:43-43`
- **bindGroupLayout** — Represents a bind group layout for WebGPU `webgpu-backend.ts:214-214`
- **binding** — Indicates the binding index for a buffer resource `webgpu-backend.ts:163-163`
- **buffer** — Represents a buffer resource for a binding group entry `webgpu-backend.ts:165-165`
- **client** — Holds a reference to the GPU client `gpu-worker-backend.ts:27-27`
- **code** — Code for the shader module `webgpu-backend.ts:144-144`
- **compute** — Contains a shader module and entry point for a compute pipeline `webgpu-backend.ts:153-156`
- **computeCapability** — Compute capability of the CUDA device `cuda-backend.ts:36-36`
- **computeCapability** — Stores the compute capability of the GPU device `gpu-worker-backend.ts:31-31`
- **device** — Stores the WebGPU device instance `webgpu-backend.ts:211-211`
- **deviceCount** — Number of CUDA devices available `cuda-backend.ts:34-34`
- **deviceInfo** — Information about the CUDA device, including device count, name, compute capability, total memory, and multi-processor count `cuda-backend.ts:49-49`
- **deviceInfo** — Stores information about the GPU device `gpu-worker-backend.ts:29-34`
- **deviceInfo** — Device information from Metal native addon `metal-backend.ts:43-49`
- **deviceName** — Name of the CUDA device `cuda-backend.ts:35-35`
- **deviceName** — Stores the name of the GPU device `gpu-worker-backend.ts:30-30`
- **deviceName** — Device name from Metal native addon `metal-backend.ts:28-28`
- **entries** — Stores an array of bind group entries for WebGPU `webgpu-backend.ts:175-175`
- **entryPoint** — Specifies the entry point for a compute pipeline `webgpu-backend.ts:155-155`
- **GPU** — Represents the WebGPU API `webgpu-backend.ts:232-232`
- **gpu** — Represents the WebGPU API `webgpu-backend.ts:240-240`
- **handle** — Backend-specific handle for the GPU buffer `base.ts:44-44`
- **id** — Unique identifier for the GPU buffer `base.ts:41-41`
- **initialized** — Boolean indicating whether the CUDA backend has been initialized `cuda-backend.ts:50-50`
- **initialized** — Indicates whether the backend has been initialized `gpu-worker-backend.ts:28-28`
- **initialized** — Boolean indicating if the backend is initialized `metal-backend.ts:50-50`
- **label** — Optional label for the shader module `webgpu-backend.ts:79-79`, `webgpu-backend.ts:86-86`, `webgpu-backend.ts:94-94`, `webgpu-backend.ts:101-101`, `webgpu-backend.ts:118-118`, `webgpu-backend.ts:133-133`, `webgpu-backend.ts:143-143`
- **label** — A label for the WebGPU Shader Module `webgpu-backend.ts:151-151`, `webgpu-backend.ts:173-173`
- **layout** — Specifies the layout for a bind group `webgpu-backend.ts:152-152`
- **layout** — Represents the bind group layout for WebGPU `webgpu-backend.ts:174-174`
- **limits** — Contains maximum storage buffer binding size and compute workgroup size `webgpu-backend.ts:193-196`
- **mappedAtCreation** — Indicates if the buffer is mapped at creation `webgpu-backend.ts:136-136`
- **maxBufferLength** — Maximum buffer length from Metal native addon `metal-backend.ts:31-31`
- **maxComputeWorkgroupSizeX** — Represents the maximum compute workgroup size in the x dimension `webgpu-backend.ts:195-195`
- **maxDimension** — Maximum dimension of a vector `base.ts:34-34`
- **maxStorageBufferBindingSize** — Represents the maximum storage buffer binding size `webgpu-backend.ts:194-194`
- **maxThreadgroupMemory** — Maximum threadgroup memory from Metal native addon `metal-backend.ts:30-30`
- **maxVectorCount** — Maximum number of vectors per batch `base.ts:33-33`
- **memoryMB** — Available memory in megabytes for the backend `base.ts:37-37`
- **module** — Represents a shader module for a compute pipeline `webgpu-backend.ts:154-154`
- **multiProcessorCount** — Number of multi-processors in the CUDA device `cuda-backend.ts:38-38`
- **multiProcessorCount** — Stores the number of multi-processors on the GPU device `gpu-worker-backend.ts:33-33`
- **name** — Name of the vector backend `base.ts:13-13`
- **name** — Name of the backend, set to "CUDA Native" `cuda-backend.ts:45-45`
- **name** — Stores the name of the backend as "CUDA (Worker)" `gpu-worker-backend.ts:23-23`
- **name** — Stores the name of the backend as "Pure JS (Loop Unrolling)" `js-backend.ts:15-15`
- **name** — Name of the Metal backend `metal-backend.ts:39-39`
- **name** — Name of the WASM SIMD backend `wasm-backend.ts:28-28`
- **name** — Sets the name of the WebGPU backend to "WebGPU Compute" `webgpu-backend.ts:207-207`
- **ops** — Reference to WASM SIMD operations `wasm-backend.ts:32-32`
- **pipeline** — Represents a WebGPU pipeline for compute shaders `webgpu-backend.ts:213-213`
- **priority** — Priority of the vector backend, with higher values indicating better performance `base.ts:15-15`
- **priority** — Priority of the backend, set to 100 `cuda-backend.ts:47-47`
- **priority** — Sets the priority of the backend to 98 `gpu-worker-backend.ts:25-25`
- **priority** — Sets the priority of the backend to 1, indicating it is the lowest priority (baseline) `js-backend.ts:17-17`
- **priority** — Priority of the backend, set to 95 `metal-backend.ts:41-41`
- **priority** — Priority of the backend `wasm-backend.ts:30-30`
- **priority** — Sets the priority of the WebGPU backend to 80 `webgpu-backend.ts:209-209`
- **queue** — Provides methods to submit command buffers and write to buffers `webgpu-backend.ts:184-187`
- **registryID** — Registry ID from Metal native addon `metal-backend.ts:29-29`
- **requestAdapter** — Requests a WebGPU adapter `webgpu-backend.ts:232-232`
- **resource** — Contains a buffer resource for a binding group entry `webgpu-backend.ts:164-166`
- **size** — Size of the GPU buffer `base.ts:42-42`
- **size** — Size of the buffer `webgpu-backend.ts:134-134`
- **supportsAsync** — Boolean indicating if the backend supports asynchronous operations `base.ts:36-36`
- **supportsBatching** — Boolean indicating if the backend supports batch operations `base.ts:35-35`
- **totalMemoryMB** — Total memory in MB of the CUDA device `cuda-backend.ts:37-37`
- **totalMemoryMB** — Stores the total memory of the GPU device in megabytes `gpu-worker-backend.ts:32-32`
- **type** — Type of the vector backend, such as CUDA, Metal, WebGPU, WASM, or JS `base.ts:14-14`
- **type** — Type of the backend, set to "cuda" `cuda-backend.ts:46-46`
- **type** — Specifies the type of the backend as "cuda" `gpu-worker-backend.ts:24-24`
- **type** — Defines the type of the backend as "js" `js-backend.ts:16-16`
- **type** — Type of the backend, set to "metal" `metal-backend.ts:40-40`
- **type** — Type of the backend as "wasm" `wasm-backend.ts:29-29`
- **type** — Sets the type of the WebGPU backend to "webgpu" `webgpu-backend.ts:208-208`
- **unifiedMemory** — Unified memory flag from Metal native addon `metal-backend.ts:32-32`
- **usage** — Usage of the buffer `webgpu-backend.ts:135-135`
- **WASMVectorOps** — Class for WASM SIMD operations `wasm-backend.ts:22-22`

## Data Flow

- **Inputs:** Float32Array vectors (query and database vectors) from the semantic search system.
- **Processing:** Backend-specific cosine similarity computation -- CUDA native addon, Metal shaders, WebGPU compute shaders, WASM SIMD instructions, or JS loops.
- **Outputs:** Similarity scores as numbers or Float32Array batches.

## Public API

| Export | Type | Description | Location |
|--------|------|-------------|----------|
| `VectorBackend` | interface | Common contract for all vector backends | [`base.ts:12-30`](./base.ts) |
| `BackendCapabilities` | interface | Backend memory and batching capabilities | [`base.ts:32-38`](./base.ts) |
| `GPUBuffer` | interface | Backend-specific GPU buffer handle | [`base.ts:40-45`](./base.ts) |

## Dependencies

### Internal Modules

| Module | Purpose |
|--------|---------|
| `gpu/detection` | GPU capability detection for backend availability checks |
| `logging` | Performance and availability logging |

### External Packages

| Package | Purpose |
|---------|---------|
| `webgpu` | WebGPU/Dawn bindings for Node.js (optional) |
| Native CUDA addon | NAPI-based CUDA vector operations (optional) |

## VectorBackend Interface

```typescript
interface VectorBackend {
  readonly name: string;
  readonly priority: number;
  isAvailable(): Promise<boolean>;
  cosineSimilarity(a: Float32Array, b: Float32Array): Promise<number>;
  batchCosineSimilarity(query: Float32Array, database: Float32Array[]): Promise<Float32Array>;
  euclideanDistance(a: Float32Array, b: Float32Array): Promise<number>;
  normalizeVectors(vectors: Float32Array[]): Promise<Float32Array[]>;
  initialize(): Promise<void>;
  dispose(): Promise<void>;
}
```

## Selection Priorities

| Condition | Selected Backend |
|---------|-------------------|
| Node.js + CUDA + CC < 12.0 | CudaBackend (100) |
| Bun + CUDA available | GpuWorkerBackend (100) |
| Node.js + CUDA available | GpuWorkerBackend (98) |
| macOS + Apple Silicon | MetalBackend (95) |
| WebGPU available | WebGpuBackend (90) |
| WASM SIMD support | WasmBackend (80) |
| Fallback | JsBackend (10) |

## Behavioral Properties

| Property | Value |
|----------|-------|
| Backend priorities | CUDA: 100, GpuWorker: 98-100, Metal: 95, WebGPU: 90, WASM: 80, JS: 10 |
| Bun compatibility | GpuWorkerBackend uses Node.js subprocess for CUDA in Bun |
| Blackwell safety | WebGPU auto-disabled for NVIDIA CC >= 12.0 |

## Error Handling

Each backend's `isAvailable()` catches all errors and returns `false` if the backend cannot initialize. The `BackendSelector` iterates through backends by descending priority until one succeeds. GPU Worker Backend handles subprocess IPC failures gracefully with automatic cleanup.

## Known Limitations

- CUDA backend requires native addon compilation and only works in Node.js (not Bun directly).
- WebGPU crashes on NVIDIA Blackwell architecture (RTX 50xx) due to Dawn limitations.
- WASM SIMD requires the external wasm module in `external-tools/wasm/vector-ops-simd/`.

## Files

| File | Description |
|------|-------------|
| `base.ts` | `VectorBackend`, `BackendCapabilities`, and `GPUBuffer` interface definitions |
| `cuda-backend.ts` | CUDA via native NAPI addon (Node.js only, priority 100) |
| `gpu-worker-backend.ts` | CUDA via Node.js subprocess for Bun compatibility (priority 98-100) |
| `metal-backend.ts` | Metal API for Apple Silicon macOS (priority 95) |
| `webgpu-backend.ts` | WebGPU API for all GPU vendors (priority 90) |
| `wasm-backend.ts` | WebAssembly with 128-bit SIMD optimizations (priority 80) |
| `js-backend.ts` | Pure JavaScript fallback, always available (priority 10) |
