---
module_name: faiss
description: "High-performance vector indexing via FAISS with layered base/delta architecture"
status: active
language: typescript
---

# Faiss

> Provides high-performance vector similarity search using Facebook AI Similarity Search (FAISS) with support for HNSW, IVF, and flat index types, plus a layered base/delta architecture for efficient branch switching.

## Overview

The faiss module implements vector indexing for the semantic search pipeline. **Primary path**: the GPU worker uses the native FAISS addon (`ultracode_cuda.node` with `ENABLE_FAISS_CPU`) — see `src/semantic/gpu/` for details. **Legacy fallback**: `FaissNapiClient` wraps the `faiss-napi` NAPI bindings for the in-process path (`faiss-client.ts`), working directly under both Node.js and Bun runtimes without subprocess overhead. FaissProvider manages a single in-memory FAISS index with auto-save, L2 normalization, and per-project/branch context switching. LayeredFaissProvider extends this with a two-layer architecture: a full base index for the main branch and small delta indexes for feature branches, achieving ~90% storage reduction. Base branch detection automatically identifies the primary branch from git metadata.

## Data Flow

- **Inputs**: VectorEmbedding objects (id + Float32Array), query vectors, project/branch context.
- **Processing**: Vectors are L2-normalized (SIMD-accelerated), added to FAISS HNSW index, persisted to disk with ID mappings; searches return scored results filtered by tombstones on feature branches.
- **Outputs**: SimilarityResult arrays (id + score), LayeredSearchResult arrays with source annotation (base/delta).

## Public API

| Export | Type | Description | Location |
|--------|------|-------------|----------|
| `getFaissClient` | function | Singleton factory for IFaissClient (faiss-napi based) | [`faiss-client.ts:496-503`](./faiss-client.ts) |
| `IFaissClient` | interface | Common interface for FAISS operations (init, add, search, save, load) | [`faiss-client.ts:59-72`](./faiss-client.ts) |
| `FaissNapiClient` | class | Direct faiss-napi NAPI client for all runtimes | [`faiss-client.ts:78-478`](./faiss-client.ts) |
| `getFaissProvider` | function | Singleton factory for FaissProvider | [`faiss-provider.ts:758-763`](./faiss-provider.ts) |
| `initializeFaissProvider` | function | Creates and initializes FaissProvider | [`faiss-provider.ts:765-769`](./faiss-provider.ts) |
| `FaissProvider` | class | In-memory FAISS index with auto-save and project context | [`faiss-provider.ts:62-750`](./faiss-provider.ts) |
| `LayeredFaissProvider` | class | Two-layer (base + delta) index with tombstone support | [`layered-faiss-provider.ts:91-861`](./layered-faiss-provider.ts) |
| `getLayeredFaissProvider` | function | Singleton factory for LayeredFaissProvider | [`layered-faiss-provider.ts:872-877`](./layered-faiss-provider.ts) |
| `IFaissProvider` | interface | Common interface for both standard and layered providers | [`provider-interface.ts:13-103`](./provider-interface.ts) |
| `IVectorProvider` | interface | Minimal interface for EmbeddingAccumulator (addBatch, getExistingIds, remove, save) | [`types.ts:24-35`](./types.ts) |
| `FaissIndexConfig` | interface | Index configuration (dimensions, type, HNSW/IVF parameters) | [`types.ts:35-58`](./types.ts) |

## Dependencies

### Internal Modules

| Module | Purpose |
|--------|---------|
| `semantic/gpu` | IGpuClient for unified FAISS + CUDA operations |
| `logging` | Structured logging |
| `shared/storage-paths` | Project directory and index file path resolution |
| `types/semantic` | VectorEmbedding and SimilarityResult types |
| `utils/simd-vector-ops` | SIMD-accelerated L2 normalization |
| `utils/runtime` | Runtime detection (Bun vs Node.js) |

### External Packages

| Package | Purpose |
|---------|---------|
| `faiss-napi` | **Legacy** NAPI bindings for FAISS C++ library (used only in `faiss-client.ts` in-process fallback). GPU worker pipeline uses native FAISS addon instead. |

## Behavioral Properties

| Property | Value |
|----------|-------|
| Default index type | HNSW with M=32, efConstruction=200, efSearch=64 |
| Auto-save threshold | 5000 embeddings (FaissProvider), 50000 (LayeredFaissProvider) |
| Dimension mismatch handling | Old index files deleted and fresh index created |

## Error Handling

FaissProvider catches initialization failures and returns false. FaissNapiClient tries standard import first, then createRequire fallback for bundled environments. LayeredFaissProvider saves state before project switches to prevent data loss. Background auto-save failures are logged as warnings without interrupting the pipeline.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      Bun MCP Process                            │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │ semantic-    │    │ faiss-       │    │ vector-      │      │
│  │ agent.ts     │───▶│ client.ts    │    │ store.ts     │      │
│  └──────────────┘    └──────┬───────┘    └──────────────┘      │
│                             │ spawn("node")                     │
└─────────────────────────────┼───────────────────────────────────┘
                              │ IPC (stdin/stdout JSON)
┌─────────────────────────────▼───────────────────────────────────┐
│                    Node.js Subprocess                           │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │ faiss-       │───▶│ faiss-node   │───▶│ libfaiss     │      │
│  │ worker.ts    │    │ (NAPI)       │    │ (C++ native) │      │
│  └──────────────┘    └──────────────┘    └──────────────┘      │
│                                                │                │
│                                          ┌─────▼─────┐          │
│                                          │ OpenMP    │          │
│                                          │ (all CPU) │          │
│                                          └───────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

## Index Types

| Type | Description | When to use |
|-----|----------|-------------------|
| `flat` | Exact search (brute force) | <10k vectors, 100% accuracy needed |
| `hnsw` | Hierarchical NSW graph | <1M vectors, speed/accuracy balance |
| `ivf` | Inverted File Index | >1M vectors, clustering |
| `ivfpq` | IVF + Product Quantization | >1M vectors, memory constrained |

## Hot/Cold Architecture

```
New embeddings ──► Faiss (hot, in-memory)
                         │
                         │ periodic flush (every N minutes)
                         ▼
Old embeddings ──► Faiss on disk (cold, persistent)

Search = Faiss results → enrich metadata from SQLite
```

## Performance Targets

| Metric | Target | Note |
|---------|------|------------|
| Add latency | <1ms/vector | Batch mode |
| Search latency | <5ms for k=10 | HNSW index |
| Memory | <2GB for 1M vectors | 768-dim, float32 |
| Throughput | >10k vectors/sec | OpenMP |

## Known Limitations

- FAISS does not support direct vector removal; "removal" only deletes ID mappings (stale vectors remain in index).
- LayeredFaissProvider simplified approach stores delta vectors in the base index rather than a separate FAISS instance.
- Max delta size triggers auto-merge to base to prevent memory leaks (threshold: 5000 vectors).

## Exports



## Files

| File | Description |
|------|-------------|
| `base-branch-detector.ts` | Detects the base branch for layered index from git metadata and config |
| `faiss-client.ts` | **Legacy** FaissNapiClient with ID mapping, batch operations, and singleton factory. GPU worker pipeline uses native FAISS addon instead. |
| `faiss-provider.ts` | In-memory FAISS provider with auto-save, project context, and ID set tracking |
| `IMPLEMENTATION_PLAN.md` | Implementation plan and stage status documentation |
| `index.ts` | Re-exports faiss-client, faiss-provider, and types |
| `layered-faiss-provider.ts` | Two-layer base/delta provider with tombstones and branch switching |
| `layered-types.ts` | Types for layered architecture: BaseIndexMetadata, DeltaIndexMetadata, LayeredSearchResult |
| `provider-interface.ts` | IFaissProvider common interface and FaissProviderOptions configuration |
| `types.ts` | FAISS IPC protocol types, index configuration, request/response message types |
