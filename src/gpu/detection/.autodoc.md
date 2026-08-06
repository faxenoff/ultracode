# Detection

## 🤖 Overview

The `gpu-detector.ts` module automatically detects available GPU capabilities, including CUDA and WebGPU, and caches results for performance. It is used by applications that require GPU detection for compatibility or performance optimization.

## 🤖 Architecture

```
GPU Detection Module
├── CUDA Detection
│   └── nvidia-smi or native addon
├── WebGPU Detection
│   └── adapter query
└── Compute Capability Detection
    └── NVIDIA only
```

## 🤖 Flow

```
GPU Detection Flow
├── Check environment variables for WebGPU enable/disable
├── Detect CUDA capabilities using nvidia-smi or native addon
├── Detect WebGPU capabilities via adapter query
├── Detect compute capability for NVIDIA GPUs
└── Cache results for subsequent use
```

## 🤖 Entity Listing

### Function
- **[name, cc, memory]** — Splits the output string into name, compute capability, and memory `gpu-detector.ts:237-237`

### Method
- **checkBackendAvailability** — Checks the availability of the backend `gpu-detector.ts:327-340`
- **clearCache** — Clears the cached GPU information `gpu-detector.ts:345-347`
- **detect** — Detects available GPU capabilities `gpu-detector.ts:89-167`
- **detectCUDA** — Detects CUDA availability `gpu-detector.ts:201-247`
- **detectWebGPU** — Detects WebGPU availability `gpu-detector.ts:252-311`
- **getCachedInfo** — Retrieves cached GPU information `gpu-detector.ts:352-354`
- **isWebGPUSafe** — Checks if WebGPU is safe to use `gpu-detector.ts:173-196`
- **parseVendor** — Parses the vendor information from the detected GPU `gpu-detector.ts:316-322`
- **testWebGPUCompatibility** — Tests the compatibility of WebGPU `gpu-detector.ts:360-395`

### Class
- **GPUDetector** — A class for detecting GPU capabilities `gpu-detector.ts:83-396`

### Interface
- **GPU** — Represents a GPU interface with a method to request an adapter `gpu-detector.ts:59-61`
- **GPUAdapter** — An interface for requesting and retrieving information about a GPU adapter `gpu-detector.ts:48-57`
- **GPUAdapterInfo** — Represents information about a GPU adapter, including vendor, device, and description `gpu-detector.ts:42-46`
- **GPUInfo** — An interface for GPU information, including vendor, model, compute capability, memory, and availability details `gpu-detector.ts:72-81`
- **WebGPUModule** — An interface for WebGPU modules, including GPU and requestAdapter methods `gpu-detector.ts:63-66`

### Type_alias
- **NavigatorWithGPU** — A navigator object with GPU properties `gpu-detector.ts:68-70`

### Import_decl
- **../../logging/index.js** — Imports `../../logging/index.js` from `../../logging/index.js`. `gpu-detector.ts:21-21`
- **node:child_process** — Imports `node:child_process` from `node:child_process`. `gpu-detector.ts:20-20`

### Property
- **adapter** — Stores the adapter information of the detected GPU `gpu-detector.ts:254-254`
- **cachedInfo** — Stores cached GPU information `gpu-detector.ts:84-84`
- **computeCapability** — Optionally stores the compute capability of the GPU, specific to NVIDIA `gpu-detector.ts:75-75`
- **computeCapability** — Stores the compute capability of the detected GPU `gpu-detector.ts:203-203`
- **computeCapability** — Represents the compute capability of the GPU, specific to NVIDIA `gpu-detector.ts:362-362`
- **computeCapability** — Variable holding the compute capability of CUDA information `gpu-detector.ts:369-369`
- **cudaAvailable** — Indicates whether CUDA is available `gpu-detector.ts:77-77`
- **cudaDetected** — Indicates if CUDA was detected `gpu-detector.ts:361-361`
- **description** — A description of the GPU `gpu-detector.ts:45-45`
- **description** — Optional string property for GPU description `gpu-detector.ts:52-52`
- **device** — The device name of the GPU `gpu-detector.ts:44-44`
- **envOverride** — Overrides the environment variables for WebGPU detection `gpu-detector.ts:366-366`
- **GPU** — An interface for requesting and retrieving information about a GPU `gpu-detector.ts:64-64`
- **gpu** — The GPU property of the navigator object `gpu-detector.ts:69-69`
- **limits** — The limits of the GPU, including maxBufferSize `gpu-detector.ts:53-56`
- **maxBufferSize** — The maximum buffer size supported by the GPU `gpu-detector.ts:54-54`
- **memoryMB** — Stores the memory size of the GPU in megabytes `gpu-detector.ts:76-76`
- **memoryMB** — Stores the memory in MB of the detected GPU `gpu-detector.ts:255-255`
- **model** — Stores the model name of the GPU `gpu-detector.ts:74-74`
- **model** — Stores the model name of the detected GPU `gpu-detector.ts:363-363`
- **name** — The name of the GPU `gpu-detector.ts:51-51`
- **name** — Stores the name of the detected GPU `gpu-detector.ts:202-202`
- **name** — Variable holding the name of CUDA information `gpu-detector.ts:369-369`
- **reason** — Provides the reason for WebGPU safety `gpu-detector.ts:173-173`
- **requestAdapter** — A method to request and retrieve information about a GPU `gpu-detector.ts:60-60`
- **requestAdapter** — Optional method to request a GPU adapter `gpu-detector.ts:65-65`
- **requestAdapterInfo** — A method to request and retrieve information about a GPU adapter `gpu-detector.ts:49-49`
- **safe** — Indicates if WebGPU is safe `gpu-detector.ts:173-173`
- **skipReason** — Provides the reason why WebGPU detection was skipped `gpu-detector.ts:365-365`
- **totalMemory** — Stores the total memory of the detected GPU `gpu-detector.ts:204-204`
- **totalMemory** — Stores the total memory of the detected GPU in megabytes `gpu-detector.ts:369-369`
- **vendor** — The vendor of the GPU `gpu-detector.ts:43-43`
- **vendor** — Stores the vendor of the detected GPU `gpu-detector.ts:50-50`
- **vendor** — Enum value indicating the GPU vendor `gpu-detector.ts:73-73`
- **vendor** — String property indicating the GPU vendor `gpu-detector.ts:253-253`
- **webgpuAvailable** — Indicates whether WebGPU is available `gpu-detector.ts:78-78`
- **webgpuSafe** — Indicates whether WebGPU is safe to use based on the GPU architecture `gpu-detector.ts:364-364`
- **webgpuSkipped** — Indicates whether WebGPU was skipped `gpu-detector.ts:79-79`
- **webgpuSkipReason** — Provides the reason why WebGPU was skipped `gpu-detector.ts:80-80`

## Data Flow

- **Inputs:** System GPU hardware (nvidia-smi output, native addon device info, WebGPU adapter query).
- **Processing:** Sequential CUDA detection followed by conditional WebGPU detection with safety checks.
- **Outputs:** `GPUInfo` object with vendor, model, compute capability, memory, and backend availability flags.

## Public API

| Export | Type | Description | Location |
|--------|------|-------------|----------|
| `GPUDetector` | class | Static GPU detection with caching and safety checks | [`gpu-detector.ts:83-396`](./gpu-detector.ts) |
| `GPUInfo` | interface | Detected GPU information (vendor, model, CC, memory, availability) | [`gpu-detector.ts:72-81`](./gpu-detector.ts) |
| `WEBGPU_UNSAFE_MIN_CC` | const | Minimum compute capability that causes WebGPU crashes (12.0) | [`gpu-detector.ts:31-31`](./gpu-detector.ts) |
| `WEBGPU_UNSTABLE_ARCHITECTURES` | const | Known unstable GPU architecture name patterns | [`gpu-detector.ts:36-36`](./gpu-detector.ts) |

## Dependencies

### Internal Modules

| Module | Purpose |
|--------|---------|
| `logging` | Detection result and warning logging |

### External Packages

| Package | Purpose |
|---------|---------|
| `node:child_process` | nvidia-smi execution |
| `webgpu` | WebGPU/Dawn bindings for Node.js (optional) |

## Behavioral Properties

| Property | Value |
|----------|-------|
| Detection caching | Results cached in static field, `clearCache()` to reset |
| nvidia-smi timeout | 2000ms |
| Environment overrides | `WEBGPU_FORCE_ENABLE=1`, `WEBGPU_FORCE_DISABLE=1` |

## Error Handling

All detection methods catch exceptions and return `null` for unavailable capabilities. WebGPU detection is entirely skipped (not attempted) for unsafe architectures to prevent process crashes. Missing nvidia-smi is treated as "no CUDA" without errors.

## Known Limitations

- CUDA detection only works with NVIDIA GPUs via nvidia-smi or the native addon.
- WebGPU adapter memory estimation relies on `maxBufferSize` which may not reflect actual VRAM.
- AMD and Intel GPU detection depends on WebGPU availability and provides limited detail.

## Files

| File | Description |
|------|-------------|
| `gpu-detector.ts` | `GPUDetector` class with CUDA, WebGPU detection and Blackwell safety checks |
