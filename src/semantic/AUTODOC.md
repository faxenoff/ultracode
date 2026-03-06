---
module_name: semantic
description: Semantic analysis pipeline — embedding generation, vector indexing (Faiss HNSW), hybrid search (RRF), caching, GPU acceleration, and code similarity detection
status: active
language: TypeScript
entry_point: embedding-generator.ts
exports:
  - EmbeddingGenerator
  - VectorStore
  - HybridSearchEngine
  - SemanticCache
  - EmbeddingAccumulator
  - EmbeddingRouter
  - CodeAnalyzer
  - GlobalEmbeddingCache
  - LayeredFaissProvider
  - FaissProvider
  - getFaissClient
  - getGpuClient
  - createProvider
  - chunkCode
dependencies:
  - faiss-napi
  - lru-cache
  - ../logging
  - ../storage/libsql-graph-adapter
  - ../utils/simd-vector-ops
  - ../agents/query-agent
tags: [embeddings, vector-search, faiss, cuda, hybrid-search, rrf, semantic-cache, code-analysis]
---

## Overview

Full pipeline for semantic code analysis: embedding generation via pluggable providers (OVMS, TEI, Ollama, vLLM, MLX, llama.cpp), vector storage and search via Faiss (in-memory HNSW), hybrid search combining structural and semantic results with Reciprocal Rank Fusion (RRF), and code similarity detection. Architecture v6 introduces layered Faiss (base branch + delta) for multi-project support with `ProjectContext`. Adaptive thresholds select CPU vs CUDA execution paths. Three-tier caching: `EmbeddingGenerator` local LRU, `SemanticCache` global LRU with TTL, and `GlobalEmbeddingCache` for built-in types and framework patterns.

```
┌────────────────────────────────────────────────────────────────┐
│                    semantic module                              │
├────────────────────────────────────────────────────────────────┤
│  embedding-generator.ts ◄── providers/ ◄── TEI/OVMS/Ollama     │
│         │                                                       │
│         ▼                                                       │
│  vector-store.ts ────────► faiss/ (hot index, in-memory)       │
│         │                      │                                │
│         ▼                      ▼                                │
│  hybrid-search.ts         gpu/ (CUDA + Faiss via subprocess)   │
│         │                                                       │
│         ▼                                                       │
│  libsql-adapter.ts ────► LibSQL DiskANN (cold storage)         │
└────────────────────────────────────────────────────────────────┘
```

## Data Flow

### Inputs

| Source | Type | Description |
|--------|------|-------------|
| Source code entities | `ParsedEntity` | AST-parsed code entities from parsers |
| Text queries | `string` | Natural language search queries |
| Project context | `ProjectContext` | Active project path, hash, branch |
| Provider config | `ProviderFactoryOptions` | Embedding provider selection and settings |

### Processing

| Step | Component | Operation |
|------|-----------|-----------|
| 1. Generate | `EmbeddingGenerator` | Text to 384-dim vector via provider (LRU cache check first) |
| 2. Accumulate | `EmbeddingAccumulator` | Buffer embeddings, auto-flush at threshold (500) |
| 3. Index | `FaissProvider` / `LayeredFaissProvider` | Add vectors to Faiss HNSW in-memory index |
| 4. Search | `VectorStore.adaptiveSearch()` | Strategy selection: Faiss HNSW / CUDA / batch |
| 5. Hybrid merge | `HybridSearchEngine` | Parallel structural + semantic search, RRF merge |

### Outputs

| Output | Type | Consumer |
|--------|------|----------|
| Embeddings | `Float32Array` (384-dim) | VectorStore, FaissProvider |
| Search results | `SimilarityResult[]` | MCP tools (semantic_search, find_similar_code) |
| Hybrid results | `HybridResult[]` | MCP tools (hybrid search) |
| Cache stats | `CacheStats` | Observability / metrics endpoint |

## Public API

| Export | Kind | Description | Location |
|--------|------|-------------|----------|
| `EmbeddingGenerator` | class | Embedding generation with local LRU cache and provider fallback | [`embedding-generator.ts:79-337`](./embedding-generator.ts) |
| `VectorStore` | class | Faiss index management with adaptive search strategy | [`vector-store.ts:51-1355`](./vector-store.ts) |
| `HybridSearchEngine` | class | Structural + semantic search with RRF fusion | [`hybrid-search.ts:100-451`](./hybrid-search.ts) |
| `SemanticCache` | class | Global LRU cache with TTL for embeddings and search results | [`semantic-cache.ts:77-372`](./semantic-cache.ts) |
| `EmbeddingAccumulator` | class | Buffered batch insertion into Faiss (flush threshold 500) | [`embedding-accumulator.ts:79-667`](./embedding-accumulator.ts) |
| `EmbeddingRouter` | class | GPU-aware batch routing for embedding operations | [`embedding-router.ts:51-402`](./embedding-router.ts) |
| `CodeAnalyzer` | class | Code similarity detection, clone finding, refactoring suggestions | [`code-analyzer.ts:126-126`](./code-analyzer.ts) |
| `GlobalEmbeddingCache` | class | Singleton cache for built-in types and framework patterns | [`global-embedding-cache.ts:49-298`](./global-embedding-cache.ts) |
| `LayeredFaissProvider` | class | Base + delta Faiss index for multi-project support (v6) | [`faiss/layered-faiss-provider.ts:91-861`](./faiss/layered-faiss-provider.ts) |
| `getFaissClient()` | function | Singleton Faiss NAPI client (runtime-aware) | [`faiss/faiss-client.ts:489-496`](./faiss/faiss-client.ts) |
| `initializeFaissProvider()` | function | Initialize and return Faiss provider singleton | [`faiss/faiss-provider.ts:765-769`](./faiss/faiss-provider.ts) |
| `getGpuClient()` | function | Singleton GPU client (Faiss + CUDA unified) | [`gpu/gpu-client.ts:828-834`](./gpu/gpu-client.ts) |
| `createProvider()` | function | Factory for embedding providers (OVMS, TEI, Ollama, etc.) | [`providers/factory.ts:218-218`](./providers/factory.ts) |
| `chunkCode()` | function | Split code into semantic chunks with overlap | [`smart-chunker.ts:162-162`](./smart-chunker.ts) |
| `getRecommendedStrategy()` | function | Adaptive CPU/GPU strategy recommendation | [`gpu/adaptive-thresholds.ts:233-270`](./gpu/adaptive-thresholds.ts) |

## Dependencies

### Internal

| Module | Usage |
|--------|-------|
| `../logging` | Structured logging (log.i, log.e, log.w, log.d, log.t) |
| `../types/semantic` | `VectorEmbedding`, `SimilarityResult`, `HybridResult` |
| `../types/parser` | `ParsedEntity` for code analysis |
| `../types/storage` | `Entity`, `ProjectContext` |
| `../storage/libsql-graph-adapter` | `GraphStorage` for entity metadata persistence |
| `../utils/simd-vector-ops` | SIMD-accelerated `cosineSimilarity`, `normalize` |
| `../utils/fast-hash` | `hashText` for cache keys |
| `../agents/query-agent` | `QueryAgent` for structural search in hybrid mode |
| `../nlp/query-expander` | `QueryExpander` for two-pass semantic search |
| `../config/constants` | `CACHE_CONSTANTS`, `DEFAULT_CONFIG` |

### External

| Package | Usage |
|---------|-------|
| `ultracode_cuda.node` | Native FAISS addon (CPU + optional GPU). Primary FAISS backend in GPU worker pipeline. Replaces `faiss-napi`. |
| `faiss-napi` | **Legacy** NAPI bindings for Faiss (used only in `faiss-client.ts` in-process fallback) |
| `lru-cache` | LRU cache with TTL for `SemanticCache` |
| gRPC (runtime) | OVMS Native provider communication |

## Configuration

| Parameter | Default | Description |
|-----------|---------|-------------|
| `EMBEDDING_DEBUG` | `false` | Enable debug logs in EmbeddingGenerator |
| `VECTOR_STORE_DEBUG` | `false` | Enable debug logs in VectorStore |
| `ADAPTIVE_DEBUG` | `false` | Log GPU/CPU strategy selection |
| `MCP_DEBUG_DISABLE_SEMANTIC` | `0` | Disable semantic warmup |
| Embedding model | `all-MiniLM-L6-v2` | 384 dimensions, configurable per provider |
| Flush threshold | `500` | EmbeddingAccumulator auto-flush count |
| Queue batch size | `200` | Texts per OVMS request |
| Parallel batches | `12` | Max concurrent OVMS requests |
| LRU cache max | `10000` | EmbeddingGenerator local cache entries |

## Behavioral Properties

### Async

All embedding generation, search, and Faiss operations are fully async. `EmbeddingAccumulator.flushAsync()` is fire-and-forget. `FaissProvider.pendingSave` persists index in background. `HybridSearchEngine` executes structural and semantic search in parallel via `Promise.all`. Lazy singleton initialization uses guarded `initPromise` pattern.

### Thread Safety

Single-threaded (Node.js/Bun event loop). GPU worker runs as a subprocess for CUDA operations. Faiss NAPI client is single-instance singleton. No shared mutable state across workers; IPC via JSON messages or named pipes (`NamedPipeTransport`).

### Idempotency

`EmbeddingGenerator.generate()` is idempotent (LRU cached). `VectorStore.addBatch()` overwrites existing IDs. `FaissProvider.initialize()` is guarded (no-op on re-call). Provider creation via factory is not idempotent (creates new instance each time).

### Side Effects

Faiss index persisted to disk on flush. LibSQL metadata written on context switch. OVMS/TEI/Ollama HTTP calls to external services. Subprocess spawned for GPU worker. Embedding dump files written to data directory.

### State (Hot/Cold Paths)

```
New embeddings ──► Faiss (hot, in-memory, HNSW)
                         │
                         │ periodic flush
                         ▼
Old embeddings ──► LibSQL DiskANN (cold, persistent)

Search = Faiss results + DiskANN results → merge by score
```

**Hot path:** New embeddings indexed in Faiss HNSW (O(log n) search, <1ms). **Cold path:** Periodic flush to disk; on restart, Faiss index rebuilt from persistent storage. **Layered (v6):** Base index (read-only, loaded on context switch) + delta index (writable, merged on flush).

## Error Handling

All provider calls wrapped in try/catch with structured logging. `EmbeddingGenerator` throws if no provider configured (`"No embedding provider available"`). `VectorStore` logs errors on LayeredFaissProvider initialization failure and continues with degraded search. `EmbeddingRouter` propagates flush errors after logging. 168+ try/catch blocks covering provider init, Faiss operations, HTTP requests, and file I/O. Logging levels: `log.e` (critical), `log.w` (degraded), `log.i` (lifecycle), `log.d` (detail), `log.t` (trace/timing).

## Observability

| Component | Method | Metrics |
|-----------|--------|---------|
| `EmbeddingGenerator` | `getCacheStats()` | size, hits, misses, hitRate |
| `SemanticCache` | `getStats()` | size, hits, misses, evictions, hitRate, memoryUsage |
| `VectorStore` | `getStats()` | vectorCount, indexSize, lastIndexTime, indexDuration |
| `HybridSearchEngine` | `getMetrics()` | totalSearches, avgSearchTime, avgResultCount |
| `EmbeddingRouter` | `getStats()` | totalAdded, totalFlushed, flushCount, avgFlushTimeMs, pendingCount |

Log channels: `EMBEDDING`, `VECTOR`, `HYBRID`, `CACHE`, `ACCUMULATOR`, `ROUTER`, `ADAPTIVE`, `FAISS`, `GPU`, `FACTORY`.

## Known Limitations

1. **Memory:** EmbeddingGenerator LRU cache ~15MB at capacity (10K entries x 384 floats). Faiss HNSW optimal for <1M vectors; beyond that, switch to IVF.
2. **Provider dependency:** If the configured provider (OVMS/TEI/Ollama) is unavailable, embedding generation blocks. No automatic fallback to built-in Xenova model.
3. **QueryAgent coupling:** HybridSearchEngine requires QueryAgent for structural search; returns empty structural results if not configured.
4. **Layered index (v6):** LayeredFaissProvider is evolving; project context switches may be slow with large base indexes.
5. **RRF pre-computation:** Float32Array optimization is memory-efficient but may slow down for result sets >1000 items.

## TypeScript Notes

### Event Map

No EventEmitter usage. Communication with GPU worker uses JSON IPC messages (`GpuWorkerRequest` / `GpuWorkerResponse` discriminated unions). Named pipe transport available for high-throughput scenarios.

### Module Boundary

```typescript
// Discriminated union for strategy selection
type IndexStrategy = "libsql-diskann" | "faiss-hnsw" | "faiss-ivf" | "hybrid";
type SearchStrategy = "libsql" | "faiss" | "cuda-bruteforce" | "hybrid";

// Generic cache accessor
SemanticCache.get<T = CacheValue>(key: string): T | undefined;

// Lazy singleton guard pattern
private initPromise: Promise<void> | null = null;
async initialize(): Promise<void> {
  if (this.initPromise) return this.initPromise;
  this.initPromise = this.initializeInternal();
  return this.initPromise;
}
```

Key type exports: `EmbeddingProvider` (interface, `providers/base.ts:87`), `IFaissClient` (interface, `faiss/faiss-client.ts:59`), `IGpuClient` (interface, `gpu/gpu-client.ts:70`), `IVectorProvider` (interface, `faiss/types.ts:24`).

## Files

| File | Description |
|------|-------------|
| `embedding-generator.ts` | Core embedding generation with LRU cache and provider dispatch |
| `vector-store.ts` | Faiss index management, adaptive search strategy selection |
| `hybrid-search.ts` | Structural + semantic search with RRF score merging |
| `semantic-cache.ts` | Global LRU cache with TTL (embeddings, search, general) |
| `embedding-accumulator.ts` | Buffered batch insertion with debounced async flush |
| `embedding-router.ts` | GPU-aware embedding batch routing and flush coordination |
| `code-analyzer.ts` | Semantic code similarity, clone detection, refactoring |
| `smart-chunker.ts` | Code chunking with overlap for large entities |
| `entity-expander.ts` | Expand large classes into method-level entities |
| `global-embedding-cache.ts` | Pre-computed embeddings for built-in types |
| `embedding-warmup.ts` | Background provider warmup on startup |
| `embedding-dump.ts` | Serialize/deserialize embeddings for debugging |
| `ovms-native-manager.ts` | OVMS (OpenVINO Model Server) lifecycle management |
| `llamacpp-server-manager.ts` | llama.cpp server lifecycle management |
| `mlx-server-manager.ts` | MLX server lifecycle (macOS ARM64 Metal GPU) |
| `faiss/faiss-client.ts` | Unified Faiss NAPI client (runtime-aware singleton) |
| `faiss/faiss-provider.ts` | Hot/cold hybrid Faiss index provider |
| `faiss/layered-faiss-provider.ts` | Base + delta layered index for multi-project (v6) |
| `faiss/base-branch-detector.ts` | Detect base branch for layered index initialization |
| `faiss/types.ts` | IPC protocol types for Faiss operations |
| `faiss/layered-types.ts` | Types for layered index config, delta, paths |
| `faiss/provider-interface.ts` | `IFaissProvider` interface contract |
| `gpu/gpu-client.ts` | Unified GPU client (Faiss + CUDA) with auto-runtime detection |
| `gpu/gpu-worker.ts` | Node.js subprocess for CUDA addon operations |
| `gpu/adaptive-thresholds.ts` | CPU/GPU strategy selection based on vector count and dimensions |
| `gpu/faiss-handlers.ts` | Faiss operation handlers for GPU worker |
| `gpu/cuda-handlers.ts` | CUDA similarity handlers (cosine, euclidean, normalize) |
| `gpu/embeddings-handlers.ts` | Embedding batch operations in GPU worker |
| `gpu/named-pipe-transport.ts` | Named pipe IPC for high-throughput GPU communication |
| `gpu/types.ts` | Unified IPC protocol (Faiss + CUDA request/response) |
| `gpu/type-guards.ts` | Type guard functions for IPC message discrimination |
| `gpu/request-helpers.ts` | Vector extraction helpers for IPC requests |
| `providers/base.ts` | `EmbeddingProvider` interface and shared types |
| `providers/factory.ts` | Provider factory with priority-based selection |
| `providers/ovms-provider.ts` | OVMS gRPC provider (highest priority) |
| `providers/tei-provider.ts` | TEI Docker HTTP provider |
| `providers/ollama-provider.ts` | Ollama local HTTP provider |
| `providers/vllm-provider.ts` | vLLM Docker OpenAI-compatible provider |
| `providers/mlx-provider.ts` | MLX provider (macOS Metal GPU) |
| `providers/llamacpp-provider.ts` | llama.cpp HTTP provider |
| `providers/openai-provider.ts` | OpenAI API remote provider |
| `providers/huggingface-provider.ts` | HuggingFace API remote provider |
| `providers/cloudru-provider.ts` | Cloud.ru API provider |
| `providers/http-engine.ts` | Shared HTTP engine with retry and timeout |
| `providers/ovms-grpc-client.ts` | gRPC client for OVMS native communication |
| `providers/ovms-container.ts` | Docker container management for OVMS |
| `providers/ovms-utils.ts` | OVMS helper utilities (normalize, model map, warmup) |
| `global-cache/index.ts` | Aggregate all global cache entries |
| `global-cache/types.ts` | Global cache entry type definitions |
| `global-cache/data/javascript.ts` | JavaScript built-in type embeddings |
| `global-cache/data/python.ts` | Python built-in type embeddings |
| `global-cache/data/frameworks.ts` | React, Angular, NestJS pattern embeddings |
| `global-cache/data/go-rust.ts` | Go and Rust built-in type embeddings |
| `global-cache/data/java-kotlin.ts` | Java and Kotlin built-in type embeddings |
| `global-cache/data/index.ts` | Aggregate data module entries |
