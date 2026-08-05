# CUDA Module

## Overview

The CUDA module provides GPU-accelerated vector operations for computing similarity metrics on NVIDIA GPUs. It delivers 100–200x performance improvements over CPU implementations by offloading high-dimensional embedding computations to CUDA-enabled devices. The module exposes device information interfaces and functions for both single-vector and batch-oriented similarity calculations. All operations are TypeScript-bound native extensions compiled against the CUDA Compute Toolkit.

## Flow

```
Input Vectors (GPU or Host Memory)
    ↓
GPU Device Availability Check (CUDADeviceInfo)
    ↓
Transfer to GPU Global Memory
    ↓
Launch CUDA Kernels
    ├─ cosineSimilarity: single pair
    └─ batchCosineSimilarity: multiple pairs in parallel
    ↓
Synchronize Device → Host
    ↓
Output: Similarity Score (0–1) or Score Array
```

## Entities

### Modules

**ultracode-cuda-addon** — `package.json:1-1`

Native CUDA addon package providing GPU-accelerated vector similarity operations for Node.js.

### Interfaces

**CUDADeviceInfo** — ~~`external-tools/native/cuda/src/index.d.ts:10-16`~~ (deleted)

Exposes NVIDIA GPU device metadata and capabilities: device count, model identifier, compute architecture version, total memory, and multiprocessor count for runtime capability negotiation.

### Functions

**cosineSimilarity** — ~~`external-tools/native/cuda/src/index.d.ts:18-27`~~ (deleted)

Computes cosine similarity between two equal-length vectors on the GPU, returning a normalized score in [0, 1] range; typical latency 0.1–0.2ms for 8192-dimensional vectors.

**batchCosineSimilarity** — ~~`external-tools/native/cuda/src/index.d.ts:29-40`~~ (deleted)

Computes cosine similarities for multiple vector pairs in parallel on the GPU, scaling throughput with batch size while maintaining constant per-operation latency.

## Dependencies

### External

- **NVIDIA CUDA Driver** — runtime GPU device management and kernel execution
- **CUDA Compute Toolkit** — build-time compilation of `.cu` kernels to PTX/binary

### Internal

- None; module is self-contained as a native extension with TypeScript type declarations