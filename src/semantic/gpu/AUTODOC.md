---
module_name: gpu
description: "Unified GPU worker for FAISS vector indexing and CUDA similarity operations"
status: active
language: typescript
---

# GPU

> Provides a unified GPU client that combines FAISS vector indexing and CUDA similarity operations, with runtime-aware execution (direct for Node.js, subprocess for Bun) and CPU fallback.

## Overview

The gpu module implements a unified GPU worker architecture that combines FAISS (vector indexing) and CUDA (similarity computation) operations in a single interface. The native FAISS addon (`ultracode_cuda.node` compiled with `ENABLE_FAISS_CPU`) replaces `faiss-napi` entirely in the GPU worker pipeline. FAISS indexes are managed internally by C++ (keyed by `projectKey`) — TypeScript only tracks metadata and ID maps via `IndexEntry`. Under Bun, a Node.js subprocess handles NAPI-dependent operations via Named Pipe IPC. The module includes adaptive thresholds that dynamically choose between CPU and GPU execution based on vector count and dimensions. CUDA operations include cosine similarity, batch cosine similarity, Euclidean distance, and vector normalization. The module also supports an embeddings pipeline for unified vector + content storage.

## Data Flow

- **Inputs**: FAISS index configuration, vectors (Float32Array/number[]), query vectors, CUDA operation parameters.
- **Processing**: GpuClient routes requests to direct NAPI calls (Node.js) or subprocess via Named Pipe IPC (Bun); adaptive thresholds select CPU vs GPU execution path.
- **Outputs**: FAISS search results (id, distance, score), CUDA similarity scores, normalized vectors, comprehensive statistics.

## Public API

| Export | Type | Description | Location |
|--------|------|-------------|----------|
| `getGpuClient` | function | Singleton factory for IGpuClient (auto-detects runtime) | [`gpu-client.ts`](./gpu-client.ts) |
| `shutdownGpuClient` | function | Graceful shutdown of GPU worker | [`gpu-client.ts`](./gpu-client.ts) |
| `IGpuClient` | interface | Unified interface for FAISS + CUDA + embeddings operations | [`gpu-client.ts`](./gpu-client.ts) |
| `GpuWorkerRequest` | type | Union of all IPC request types (FAISS, CUDA, embeddings, lifecycle) | [`types.ts:179-213`](./types.ts) |
| `GpuWorkerResponse` | type | Union of all IPC response types | [`types.ts:393-428`](./types.ts) |
| `FaissIndexConfig` | interface | FAISS index configuration (dimensions, type, HNSW/IVF params) | [`types.ts:14-26`](./types.ts) |
| `FaissSearchResult` | interface | Search result with id, distance, and normalized score | [`types.ts:223-227`](./types.ts) |
| `CudaDeviceInfo` | interface | CUDA device information (name, compute capability, memory) | [`types.ts:32-38`](./types.ts) |
| `GpuStatsResponse` | interface | Combined FAISS + CUDA statistics | [`types.ts:373-387`](./types.ts) |
| `GpuWorkerState` | interface | Complete worker state including FAISS, CUDA, and content cache | [`types.ts:430-447`](./types.ts) |

## Dependencies

### Internal Modules

| Module | Purpose |
|--------|---------|
| `logging` | Structured logging |
| `shared/storage-paths` | Data directory resolution |
| `utils/simd-vector-ops` | CPU fallback for cosine similarity and L2 normalization |
| `utils/runtime` | Runtime detection and sleep utility |

### External Packages

| Package | Purpose |
|---------|---------|
| `ultracode_cuda.node` | Native CUDA addon with optional FAISS CPU (`ENABLE_FAISS_CPU`) and GPU (`ENABLE_FAISS_GPU`) support. Replaces `faiss-napi` in the GPU worker pipeline. |

## Behavioral Properties

| Property | Value |
|----------|-------|
| IPC transport | Named Pipes (Windows) / Unix domain sockets (Linux/macOS) |
| CUDA Blackwell support | Automatically skipped for compute capability >= 12.0 |
| CPU fallback | Automatic when CUDA is unavailable; uses SIMD-optimized operations |

## Error Handling

GPU client gracefully degrades to CPU when CUDA is unavailable or fails to initialize. Named Pipe transport implements reconnection logic for subprocess communication failures. Subprocess crashes are detected and logged. All GPU operations return typed error responses rather than throwing.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Bun MCP Process                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │ vector-store │───▶│ gpu-client   │    │ OVMS Native  │      │
│  │ pattern-search│───▶│ (unified)    │    │ (embeddings) │      │
│  │ semantic-merge│───▶│              │    └──────────────┘      │
│  └──────────────┘    └──────┬───────┘                          │
│                             │ spawn("node")                     │
└─────────────────────────────┼───────────────────────────────────┘
                              │ IPC (stdin/stdout JSON)
┌─────────────────────────────▼───────────────────────────────────┐
│                  Node.js GPU Worker                             │
│  ┌──────────────────────────────────────────────────────┐      │
│  │        ultracode_cuda.node (native addon)            │      │
│  │                                                      │      │
│  │  CUDA ops          Native FAISS (CPU)  FAISS GPU     │      │
│  │  - cosineSimilarity  - faissIndexCreate  - gpuIvf*   │      │
│  │  - batchCosine       - faissIndexTrain               │      │
│  │  - euclidean         - faissIndexAdd/Search           │      │
│  │  - normalize         - faissIndexSave/Load            │      │
│  │                      - faissIndexBatchSearch           │      │
│  │                      - faissIndexRemove/Reset/Stats    │      │
│  │  hasNativeFaiss=true when ENABLE_FAISS_CPU compiled  │      │
│  └──────────────────────────────────────────────────────┘      │
│                                                                 │
│  Multi-Index Pool: indexes keyed by projectKey (hash:branch)   │
│  LRU eviction when pool > MAX_LOADED_INDEXES (default 10)      │
│  IVF auto-training: buffer vectors until nlist*39, then train  │
└─────────────────────────────────────────────────────────────────┘
```

## IPC Protocol

### CUDA commands
```typescript
type CudaCommands =
  | { type: "cuda.info" }
  | { type: "cuda.cosine"; a: number[]; b: number[] }
  | { type: "cuda.batchCosine"; query: number[]; database: number[][] }
  | { type: "cuda.euclidean"; a: number[]; b: number[] }
  | { type: "cuda.normalize"; vectors: number[][] };
```

### Faiss commands (via native addon)
```typescript
// All faiss.* IPC messages carry projectKey field
type FaissCommands =
  | { type: "faiss.init"; config: FaissIndexConfig; projectKey: string; loadPath?: string }
  | { type: "faiss.add"; ids: string[]; vectors: number[]; projectKey: string }
  | { type: "faiss.search"; vector: number[]; k: number; projectKey: string }
  | { type: "faiss.batchSearch"; vectors: number[]; nQueries: number; k: number; projectKey: string }
  | { type: "faiss.train"; vectors: number[]; nVectors: number; projectKey: string }
  | { type: "faiss.save"; path: string; projectKey: string }
  | { type: "faiss.load"; path: string; projectKey: string }
  | { type: "faiss.remove"; ids: string[]; projectKey: string }
  | { type: "faiss.stats"; projectKey?: string };
```

## Implementation Notes

### Native FAISS Addon Integration
- `gpu-worker.ts` loads `ultracode_cuda.node` and checks `hasNativeFaiss` flag. If true, the addon is cast to `NativeFaissAddon` (defined in `types.ts`).
- `faiss-handlers.ts` uses `nativeFaiss.faissIndexCreate/Train/Add/Search/Save/Load` instead of `faiss-napi` methods. `IndexEntry` no longer holds a `FaissIndex` object — the C++ addon manages index state internally by `projectKey`.
- `embeddings-handlers.ts` uses `nativeFaiss` + `state.activeProjectKey` for all FAISS operations.
- IVF auto-training: vectors are buffered in TypeScript (`trainingBuffer` in `IndexEntry`) until `nlist * 39` threshold, then `faissIndexTrain()` + `faissIndexAdd()` are called to train and bulk-add.
- LRU eviction: when pool exceeds `MAX_LOADED_INDEXES=10`, oldest index is saved to disk (`faissIndexSave`) and removed from memory (`faissIndexRemove`).

### Addon Loading Path
Worker searches for `ultracode_cuda.node` in order:
1. `external-libs/cuda-{platform}-x64/` (canonical build output)
2. `dist/native/cuda/` (copied during `npm run build` via tsup)
3. `build/Release/` (raw cmake-js output)

### CPU-Only Mode
When `deviceCount === 0` (no NVIDIA GPU) but `hasNativeFaiss === true`, the worker still initializes successfully with CPU-only FAISS. All vector operations fall back to SIMD-accelerated CPU implementations.

## Known Limitations

- Named Pipe IPC adds serialization overhead for large vector batches compared to direct calls.
- Single GPU worker process may become a bottleneck under very high concurrency.
- `faiss-napi` is still used as legacy fallback in `faiss-client.ts` (in-process path). The GPU worker pipeline no longer uses it.

## Exports



## Files

| File | Description |
|------|-------------|
| `adaptive-thresholds.ts` | Dynamic CPU vs GPU threshold selection based on vector dimensions and batch size |
| `cuda-handlers.ts` | CUDA operation handlers for cosine, euclidean, normalization, and batch operations. `CUDAAddon` interface extended with optional `NativeFaissAddon` methods. |
| `embeddings-handlers.ts` | Embeddings pipeline handlers for unified vector + content storage. Uses `nativeFaiss` + `activeProjectKey` instead of faiss-napi. |
| `faiss-handlers.ts` | FAISS operation handlers via native addon multi-index pool. Manages `IndexEntry` per projectKey, IVF auto-training buffer, LRU eviction. No faiss-napi dependency. |
| `gpu-client.ts` | Runtime-aware IGpuClient with direct (Node.js) and subprocess (Bun) modes |
| `gpu-worker.ts` | Node.js subprocess entry point. Loads `ultracode_cuda.node`, detects `hasNativeFaiss`, casts to `NativeFaissAddon`. Falls back to CPU-only FAISS when no GPU. |
| `index.ts` | Re-exports gpu-client and types |
| `named-pipe-transport.ts` | Named Pipe / Unix socket IPC transport with packet framing |
| `request-helpers.ts` | Request serialization helpers for Float32Array and batch vectors |
| `type-guards.ts` | Type guard utilities for GPU response types |
| `types.ts` | Complete IPC protocol types for FAISS, CUDA, embeddings, and lifecycle operations. Defines `NativeFaissAddon` interface and `IndexEntry` (no `index` field — C++ manages indexes internally). |
