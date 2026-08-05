# Workers

> Provides subprocess-based and thread-based worker pools for parallel code parsing across 14+ languages, with integrated embedding generation, language detection, and dynamic worker scaling.

## Overview

The workers module is the parallel processing backbone for code indexing. It provides two pool architectures: `ParsingSubprocessPool` (subprocess-based with V8 native IPC, memory isolation via process kill-after-batch) and `LanguageWorkerPool`/`WorkerPoolManager` (thread-based via worker_threads or Bun Web Workers). The universal `generic-language-worker` dynamically loads language-specific analyzers (TS, JS, Python, Go, Rust, C/C++, Java, Kotlin, Swift, Zig, Bash, PowerShell, JSON) and supports streaming parse results, in-worker embedding generation (distributed via HTTP or centralized via Main process), and generated code detection. Worker pools feature dynamic scaling, complexity-aware file distribution, keepalive mode for incremental updates, and memory management with ping/pong monitoring.

## Submodules

| Submodule | Description |
|-----------|-------------|
| [subprocess-pool/](./subprocess-pool/AUTODOC.md) | Types, interfaces, and subprocess spawning for parsing pools |

## Data Flow

- **Inputs**: File paths grouped by language, parser options, embedding configuration.
- **Processing**: Distributes files across workers using size+complexity-aware load balancing, each worker reads files (with prefetch overlap), detects language, loads analyzer, parses to AST entities, optionally generates embeddings via HTTP client or collects texts for centralized generation.
- **Outputs**: `ParseResult[]` with entities and relationships per file, binary embeddings or text items sent via IPC to main process.

## Public API

| Export | Type | Description | Location |
|--------|------|-------------|----------|
| `ParsingSubprocessPool` | class | Subprocess pool with memory isolation and dynamic scaling | [`parsing-subprocess-pool.ts:113-1505`](./parsing-subprocess-pool.ts) |
| `WorkerPoolManager` | class | Thread-based worker pool with task queuing | [`worker-pool-manager.ts:63-407`](./worker-pool-manager.ts) |
| `LanguageWorkerPool` | class | Language-specific thread pool with runtime detection | [`language-worker-pool.ts:156-763`](./language-worker-pool.ts) |
| `PythonWorkerPool` | class | Specialized pool for Python with 4-layer timing | [`python-worker-pool.ts:126-522`](./python-worker-pool.ts) |
| `WorkerGlobalCache` | class | Global cache for worker-wide state, analyzers, and embeddings | [`worker-global-cache.ts:17-85`](./worker-global-cache.ts) |
| `detectLanguage` | function | Detects language from file extension | [`language-detection.ts:80-83`](./language-detection.ts) |
| `LANGUAGE_MAP` | const | Extension-to-language mapping | [`language-detection.ts:12-53`](./language-detection.ts) |
| `SUPPORTED_LANGUAGES` | const | List of all supported language identifiers | [`language-detection.ts:58-83`](./language-detection.ts) |
| `getAnalyzer` | function | Gets or creates cached language analyzer | [`analyzer-loader.ts:23-54`](./analyzer-loader.ts) |
| `getWorkerGlobalCache` | function | Retrieves or initializes the global worker cache instance | [`worker-global-cache.ts:90-93`](./worker-global-cache.ts) |
| `warmupAnalyzer` | function | Pre-warms ANTLR parsers for JIT compilation | [`analyzer-loader.ts:59-295`](./analyzer-loader.ts) |
| `SUPPORTED_WORKER_LANGUAGES` | const | Languages supported by the generic worker | [`analyzer-loader.ts:287-309`](./analyzer-loader.ts) |
| `WorkerEmbeddingClient` | class | Lightweight HTTP client for embedding generation in workers | [`worker-embedding-client.ts:60-325`](./worker-embedding-client.ts) |
| `workerLog` | function | File-based logging from worker processes | [`worker-logging.ts:53-74`](./worker-logging.ts) |

## Dependencies

### Internal Modules

| Module | Purpose |
|--------|---------|
| `parsers/*` | Language-specific parsers (UnifiedParser, PythonNativeParser, etc.) |
| `types/parser` | ParseResult, ParserOptions types |
| `types/semantic` | WorkerEmbeddingConfig, EmbeddingPoolStats types |
| `logging` | Structured logging from main process |
| `shared/runtime-detect` | Bun vs Node.js runtime detection |
| `workers/subprocess-pool` | Subprocess spawning and type definitions |

### External Packages

| Package | Purpose |
|---------|---------|
| `undici` | HTTP keep-alive connection pooling for embedding clients |

## Behavioral Properties

| Property | Value |
|----------|-------|
| Supported languages | 14 (TS, JS, Python, Go, Rust, C, C++, Java, Kotlin, Swift, Zig, Bash, PowerShell, JSON) |
| Worker scaling | Dynamic 1-8 workers based on file count |
| Embedding providers | TEI, OVMS, Ollama, OpenAI, vLLM, llama.cpp |
| IPC serialization | V8 native structured clone (Bun and Node.js) |

## Error Handling

Worker crashes are caught and pending tasks are rejected with descriptive errors. Subprocess unexpected exits trigger automatic respawn if work remains in the queue. Task timeouts reject promises after configurable delays. Embedding failures for individual batches are logged and skipped. Generated code (ANTLR, Protobuf, minified) is automatically detected and skipped.

## Known Limitations

- `PythonWorkerPool` and `python-worker.ts` are legacy thread-based workers; Python parsing now primarily uses `ParsingSubprocessPool` with batch mode.
- `WorkerPoolManager` resolves worker script path relative to bundled dist directory, which may break in non-standard build setups.
- Keepalive memory monitoring relies on ping/pong with a 2-second timeout, which may miss rapid memory spikes.

## Files

| File | Description |
|------|-------------|
| `parsing-subprocess-pool.ts` | Subprocess pool with dynamic scaling, memory isolation, and embedding support |
| `generic-language-worker.ts` | Universal worker supporting all languages, embedding generation, and 3 runtime modes |
| `language-worker-pool.ts` | Thread-based pool with runtime-aware worker creation (Bun/Node.js) |
| `worker-pool-manager.ts` | Thread-based pool manager with task queuing and load balancing |
| `parser-worker.ts` | Tree-sitter-based parser worker thread for batch file parsing |
| `python-worker-pool.ts` | Specialized Python pool with 4-layer timing support |
| `python-worker.ts` | Dedicated Python worker with 4-layer analysis architecture |
| `embedding-processor.ts` | Worker-side embedding generation, deduplication, and IPC transfer |
| `worker-embedding-client.ts` | Lightweight HTTP embedding client supporting 6 providers |
| `language-detection.ts` | File extension to programming language detection |
| `analyzer-loader.ts` | Dynamic language analyzer loading with caching and warmup |
| `worker-logging.ts` | File-based logging from worker/subprocess processes |
| `worker-global-cache.ts` | Global cache for managing worker-wide state and shared resources |