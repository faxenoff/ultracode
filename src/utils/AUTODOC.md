---
module_name: utils
description: "Shared utility library with data structures, I/O helpers, runtime detection, and performance primitives"
status: active
language: typescript
---

# Utils

> Shared utility library providing data structures (Bloom filter, circuit breaker), file operations, hashing, logging, parallel execution, vector operations, runtime detection, and shell helpers used throughout the project.

## Overview

The utils module is a collection of internal utilities shared across the entire project. It includes high-performance data structures (Bloom filter for O(1) membership testing, circuit breaker for fault tolerance), file system operations (glob, file reading, config path management), fast hashing (xxHash-style), Float32Array pooling for embedding operations, parallel task execution, SIMD-accelerated vector operations, similarity worker pools, runtime detection (Bun vs Node.js), shell command execution, and structured logging infrastructure.

## Data Flow

- **Inputs:** Various -- file paths, string data for hashing, vectors for similarity, shell commands for execution.
- **Processing:** Utility-specific operations (hashing, filtering, pooling, subprocess management).
- **Outputs:** Processed results returned to callers across the codebase.

## Public API

| Export | Type | Description | Location |
|--------|------|-------------|----------|
| `BloomFilter` | class | Probabilistic O(1) membership testing | [`bloom-filter.ts:12-81`](./bloom-filter.ts) |
| `CircuitBreaker` | class | Three-state fault tolerance pattern | [`circuit-breaker.ts:15-15`](./circuit-breaker.ts) |
| `extractComments` | function | Extracts comments from source code | [`comment-extractor.ts`](./comment-extractor.ts) |
| `getConfigDir` | function | Returns platform-specific config directory | [`config-paths.ts`](./config-paths.ts) |
| `loadSemanticConfig` | function | Loads semantic-config.json | [`config-paths.ts`](./config-paths.ts) |
| `saveSemanticConfig` | function | Saves semantic-config.json | [`config-paths.ts`](./config-paths.ts) |
| `detectLinterConfig` | function | Detects project linter configuration | [`config-detector.ts`](./config-detector.ts) |
| `isError` | function | Type guard for Error objects in catch blocks | [`error-handling.ts`](./error-handling.ts) |
| `toError` | function | Safe unknown-to-Error conversion | [`error-handling.ts`](./error-handling.ts) |
| `fastHash` | function | Fast string hashing (xxHash-style) | [`fast-hash.ts`](./fast-hash.ts) |
| `Float32Pool` | class | Float32Array object pool for embeddings | [`float32-pool.ts`](./float32-pool.ts) |
| `globMatch` | function | File glob pattern matching | [`glob.ts`](./glob.ts) |
| `isBun` | function | Detects Bun runtime | [`runtime-detection.ts`](./runtime-detection.ts) |
| `exec` | function | Shell command execution wrapper | [`shell.ts`](./shell.ts) |
| `SimilarityWorkerPool` | class | Worker pool for parallel similarity computation | [`similarity-worker-pool.ts`](./similarity-worker-pool.ts) |

## Dependencies

### Internal Modules

| Module | Purpose |
|--------|---------|
| `logging` | Structured logging used by circuit breaker and other utilities |

### External Packages

| Package | Purpose |
|---------|---------|
| `lru-cache` | LRU caching in config detector |
| `node:child_process` | Shell command execution |
| `node:worker_threads` | Parallel worker management |

## Behavioral Properties

| Property | Value |
|----------|-------|
| Bloom filter defaults | 256 bits, 3 hash functions, ~5% FPR at 50 items |
| Circuit breaker states | CLOSED, OPEN, HALF_OPEN |
| Float32Pool strategy | Pre-allocated arrays with reuse for zero-allocation embedding ops |

## Error Handling

`isError()` and `toError()` provide safe error handling for `unknown` catch variables. Circuit breaker tracks failure counts and opens automatically after threshold. Shell execution returns structured results with stdout/stderr separation.

## Known Limitations

- SIMD vector operations require specific WASM module availability.
- Similarity worker pool creates Node.js worker threads which are not available in all runtimes.
- Bloom filter has inherent false positives; not suitable for exact membership testing.

## Files

| File | Description |
|------|-------------|
| `bloom-filter.ts` | Probabilistic set membership with configurable false positive rate |
| `circuit-breaker.ts` | Three-state circuit breaker for cascading failure protection |
| `comment-extractor.ts` | Source code comment extraction for documentation |
| `config-detector.ts` | Detects project linter configs (Biome, ESLint, oxlint) |
| `config-paths.ts` | Platform-specific config directory and semantic config I/O |
| `error-handling.ts` | Type-safe error utilities for `unknown` catch variables |
| `fast-hash.ts` | Fast string hashing for deduplication and indexing |
| `fast-json.ts` | Optimized JSON serialization helpers |
| `file-ops.ts` | File system operation utilities |
| `float32-pool.ts` | Float32Array pool for zero-allocation embedding operations |
| `glob.ts` | File glob pattern matching |
| `jvm-detection.ts` | JVM runtime detection for Java/Kotlin tools |
| `logger.ts` | Structured logging implementation |
| `logger-types.ts` | Logging type definitions |
| `ollama-checker.ts` | Ollama service availability checking |
| `parallel.ts` | Parallel task execution utilities |
| `provider-logger.ts` | Embedding provider event logging |
| `quiet-console.ts` | Console output suppression for pipe mode |
| `runtime.ts` | Runtime environment utilities |
| `runtime-detection.ts` | Bun vs Node.js runtime detection |
| `shell.ts` | Shell command execution wrapper |
| `simd-vector-ops.ts` | SIMD-accelerated vector operations |
| `similarity-worker.ts` | Single similarity computation worker |
| `similarity-worker-pool.ts` | Worker pool for parallel similarity |
| `stream-helpers.ts` | Data stream helper functions |
