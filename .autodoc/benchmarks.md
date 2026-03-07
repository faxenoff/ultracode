# Benchmarks

Consolidated benchmark data for UltraCode Server: embedding providers, models, LLM performance, and runtime comparisons.

## Embedding Providers

Comparison of embedding providers by speed, configuration, and GPU requirements.

| Provider | Speed | GPU | Protocol | Batch | Notes |
|----------|-------|-----|----------|-------|-------|
| **vLLM** | **1352 emb/s** | NVIDIA CUDA | OpenAI API (`/v1/embeddings`) | Yes | Highest throughput, continuous batching, paged attention |
| **TEI** | **1169 emb/s** (peak 2442) | NVIDIA CUDA | `/embed` | Yes | HuggingFace models, Blackwell requires `120-latest` image |
| **llama.cpp** | **441 emb/s** | CUDA/Vulkan/CPU | OpenAI API (`/v1/embeddings`) | Yes | Native GGUF, low VRAM (0.4 GB dedicated) |
| **OVMS Native** | **260-326 emb/s** | Intel iGPU/CPU | OpenAI V3 API (`/v3/embeddings`) | Yes | Intel optimized, MediaPipe graph, auto lifecycle |
| **Ollama** | varies (55-71 chunks/s) | CUDA/CPU | `/api/embeddings` | No | Simplest setup, no batch support |
| **OpenAI** | cloud | Cloud | OpenAI API (`/v1/embeddings`) | Yes | Pay per token, no local resources |

### Provider Benchmark Details

**vLLM** (RTX 5090, multilingual-e5-small):
- Speed: 1352 emb/s (optimized), baseline ~1260 emb/s
- 3.6x faster than llama.cpp
- Config: `max-num-batched-tokens=16384, max-num-seqs=256`
- Client: `batchSize=200, concurrency=12, encodingFormat=base64`

**TEI** (RTX 5090, multilingual-e5-small, image `120-latest`):
- Accumulator speed: 1169 emb/s overall, peak 2442 emb/s
- Worker embedding: 924 emb/s (7911 embeddings in 8.6s)
- FAISS flush: 8206 vectors in 531ms (15,440/s)
- Full index: 800 files in 10.2 sec
- Config: `queueBatchSize=50, parallelBatches=4`

**llama.cpp** (centralized mode, multilingual-e5-small Q8):
- Speed: 441 emb/s (centralized optimized)
- Previous: 371 emb/s (RTX 5060 Laptop)
- Config: `ctx=4096, parallel=8, queueBatchSize=72, PARALLEL_BATCHES=12`
- VRAM: 0.4 GB dedicated + 1.1 GB shared

**OVMS Native** (Intel iGPU + CPU, centralized mode):
- Speed: 260-326 emb/s (e5-small, GPU-compiled, optimized 3:5 GPU:CPU ratio)
- e5-base at same ratio: ~120 emb/s
- FAISS flush: 14,781/s
- Previous distributed mode: ~21 emb/s (deprecated)

**Optimal GPU:CPU ratio for OVMS:**

| Ratio GPU:CPU | Speed | Notes |
|---------------|-------|-------|
| 6:2 | 94/s | Baseline |
| 5:3 | 105/s | +12% |
| **3:5** | **120/s** | Optimal |
| 2:6 | 91/s | Too much CPU |
| GPU only | 72/s | iGPU overloaded |

## Embedding Models

### Benchmark 2025-12-12 (RTX 5060 Blackwell, Intel CPU)

Full benchmark across all providers. Test dataset: 100 entities from ultracode.

| Rank | Provider | Model | Chunks/s | ms/chunk | Context | Dims | Quality Gap | Languages | Recommendation |
|------|----------|-------|----------|----------|---------|------|-------------|-----------|----------------|
| 1 | **OpenVINO CPU** | multilingual-e5-base | **583** | 1.7 | 512 | 384 | **0.608** | MULTI (94) | Best overall choice |
| 2 | OpenVINO CPU | distiluse-base-multilingual | 534 | 1.9 | 512 | 384 | **0.608** | MULTI (15) | Fast multilingual |
| 3 | OpenVINO CPU | all-MiniLM-L6-v2 INT8 | 510 | 2.0 | 256 | 384 | 0.601 | EN | Best EN-only speed |
| 4 | TEI GPU | BGE-M3 (batch 128) | 342 | - | 8192 | 1024 | 0.307 | MULTI (100+) | 8K context |
| 5 | OpenVINO CPU | bge-small-en-v1.5 INT8 | 92 | 10.9 | 512 | 384 | - | EN | Balance |
| 6 | OpenVINO CPU | paraphrase-multilingual | 89 | 11.2 | 512 | 384 | 0.558 | MULTI (50+) | Alternative multi |
| 7 | OpenVINO CPU | gte-small INT8 | 89 | 11.2 | 512 | 384 | - | EN | Balance |
| 8 | Ollama GPU | granite-embedding:30m | 71 | - | 512 | 384 | 0.312 | EN | Fast Ollama |
| 9 | Ollama GPU | all-minilm | 55 | - | 512 | 384 | **0.601** | EN | Best quality Ollama |
| 10 | Ollama GPU | snowflake-arctic-embed2 | 4 | - | 8192 | 1024 | 0.426 | MULTI | Too slow |

**Quality Gap** = difference between similarity for similar vs different code. Higher is better.

**Not recommended:**

| Model | Reason |
|-------|--------|
| multilingual-e5-small (OpenVINO) | Very low quality gap (0.09) |
| granite-embedding:278m (Ollama) | BROKEN - does not return embeddings |
| nomic-embed-text (Ollama) | Poor quality (gap 0.207) |
| snowflake-arctic-embed2 (Ollama) | Too slow (4 chunks/s) |

### Quality Discrimination Results

| Model | Avg Positive | Avg Negative | Gap | Dims | Languages |
|-------|-------------|-------------|-----|------|-----------|
| all-minilm (Ollama) | 0.771 | 0.170 | **0.601** | 384 | EN |
| all-MiniLM-L6-v2 (OpenVINO) | 0.771 | 0.170 | **0.601** | 384 | EN |
| multilingual-e5-base (OpenVINO) | - | - | **0.608** | 384 | MULTI |
| snowflake-arctic-embed2 | 0.692 | 0.266 | 0.426 | 1024 | MULTI |
| granite-embedding:30m | 0.557 | 0.245 | 0.312 | 384 | EN |
| BGE-M3 (TEI) | 0.595 | 0.288 | 0.307 | 1024 | MULTI (100+) |
| nomic-embed-text | 0.516 | 0.309 | 0.207 | 768 | EN |

### Optimal Batch Sizes

| Provider | Model | Optimal Batch |
|----------|-------|---------------|
| OpenVINO | all-MiniLM-L6-v2 | 32 |
| OpenVINO | Other models | 16 |
| TEI | BGE-M3 | 128 |
| TEI | BGE-small-en | 64 |
| Ollama | all-minilm | 1 (no batch) |
| Ollama | granite-embedding | 1 (no batch) |

### TEI BGE-M3 Batch Size Scaling

| Batch Size | Items/s | Notes |
|------------|---------|-------|
| 1 | 11 | No batching |
| 8 | 77 | Small batch |
| 32 | 213 | Good |
| 64 | 288 | Better |
| **128** | **342** | **Optimal** |
| 256 | 340 | Plateau |
| 512 | 338 | Diminishing returns |

### Recommendations by Use Case

| Use Case | Model | Provider | Speed |
|----------|-------|----------|-------|
| Development (fast indexing) | all-MiniLM-L6-v2 INT8 | OpenVINO | 510 chunks/s |
| Production (quality + speed) | multilingual-e5-base | OpenVINO | 583 chunks/s |
| Production (8K context) | BGE-M3 (batch 128) | TEI | 342 chunks/s |
| Multilingual (RU/CN) | multilingual-e5-base | OpenVINO | 583 chunks/s |
| Simple setup | granite-embedding:30m | Ollama | 71 chunks/s |
| Best quality (EN) | all-minilm | Ollama | 55 chunks/s |

## Code-Specific Embedding Models (2025 Landscape)

State-of-the-art models specifically trained or optimized for code semantic search.

| Model | Context | Dims | Size | Speed (GPU) | MTEB Retrieval | License | Notes |
|-------|---------|------|------|-------------|----------------|---------|-------|
| **jina-embeddings-v2-base-code** | 8,192 | 768 | 322MB | ~8,000 tok/s | ~55 | Apache 2.0 | Best open code-specific model |
| **modernbert-embed-base** | 8,192 | 768 | ~550MB | ~10,000 tok/s | ~53+ | - | New architecture, code-trained, 4x faster |
| **CodeRankEmbed** | 8,192 | 768 | ~550MB | ~7,000 tok/s | ~55+ | MIT | Best efficiency for code |
| **Nomic Embed Code** | 2,048 | - | 7B | - | SOTA CodeSearchNet | Apache 2.0 | 81.7% Python CodeSearchNet |
| **Voyage-code-3** (API) | 32,000 | 2048 | N/A | N/A | SOTA | API only | +14% over OpenAI, $0.22/M tokens |
| **BGE-M3** | 8,192 | 1024 | 1.1GB | ~3,500 tok/s | ~55+ | - | Best multilingual, hybrid retrieval |
| **snowflake-arctic-embed-l-v2.0** | 8,192 | 1024 | ~600MB | ~5,000 tok/s | 57.1 | - | Matryoshka + quantization |
| **gte-large-en-v1.5** | 8,192 | 1024 | 870MB | ~4,500 tok/s | 65.39 | Apache 2.0 | Highest quality English |
| all-MiniLM-L6-v2 | 512 | 384 | 90MB | ~14,000 tok/s | 41-43 | - | Fastest, quality tradeoff |

**Key insight**: General-purpose text embedders underperform code-specific models by 10-20%. For serious code search, use jina-embeddings-v2-base-code or Voyage-code-3 instead of repurposing text embedders like MiniLM.

## LLM Models for AutoDoc

Models benchmarked for documentation generation with AutoDoc module.

### LLM Benchmark (2025-12-07, SemanticAgent 1253 lines)

| Model | Provider | Size | tok/s | TTFT | Total | Output | Quality |
|-------|----------|------|-------|------|-------|--------|---------|
| **qwen3-coder:30b** | Ollama | 18GB | 12 | 32.87s | 75.6s | 3638 chars | Excellent |
| deepseek-coder:6.7b | Ollama | 3.8GB | 10 | 12.71s | 51.3s | 1966 chars | Good |

### OpenVINO LLM Models

| Model | Size | Context | CPU Speed | Recommendation |
|-------|------|---------|-----------|----------------|
| **Qwen2.5-Coder-7B INT4** | 4GB | 32K | ~10 tok/s | Best for code |
| **Phi-4-mini INT4** | 2.5GB | 16K | ~20 tok/s | Fast + quality |
| **Phi-3-mini-128K INT4** | 2GB | 128K | ~18 tok/s | Ultra long context |
| **Qwen2.5-0.5B GGUF** | 350MB | 32K | ~90 tok/s | Ultra compact |
| **Qwen3-4B NPU INT4** | 2.5GB | 8K | ~22 tok/s NPU | NPU optimized |

**Selection guide:**
- **Best Quality**: qwen3-coder:30b (12 tok/s, 18GB VRAM)
- **Faster**: deepseek-coder:6.7b (2x faster TTFT, 4GB VRAM)
- **Limited memory (<4GB)**: Qwen2.5-0.5B via GGUF (350MB, 90 tok/s)
- **NPU (Intel Core Ultra)**: Qwen3-4B (official optimization, ~15W)

## Node.js vs Bun Runtime

**Test Environment:** Node.js v24.11.1, Bun v1.3.2, Windows 11, November 2024

### Summary

| Category | Bun Performance |
|----------|-----------------|
| File Reading | 1.3-1.8x faster |
| File Writing (FileSink) | 3.3-4.3x faster |
| Directory Ops | 1.4-3.8x faster |
| Glob Search | 1.4-1.6x faster |
| Startup Time | 1.5-1.8x faster |
| HTTP Fetch | 1.7x faster |
| SHA-256 (CryptoHasher) | 2.8x faster |
| SQLite | ~same (I/O bound) |

**Overall**: Bun is faster in all categories except shell execution.

### Detailed Results

**File Read:**

| Test | Node.js | Bun | Speedup |
|------|---------|-----|---------|
| readText (1KB) | 0.164ms | 0.090ms | 1.8x |
| readText (100KB) | 0.208ms | 0.159ms | 1.3x |
| readText (1MB) | 0.732ms | 0.456ms | 1.6x |

**File Write:**

| Test | Node.js | Bun (FileSink) | Speedup |
|------|---------|----------------|---------|
| writeFile (1KB) | 0.282ms | 0.284ms | ~same |
| writeFile (100KB) | 0.435ms | 0.131ms | 3.3x |
| writeFile (1MB) | 1.430ms | 0.332ms | 4.3x |

**Directory Operations:**

| Test | Node.js | Bun | Speedup |
|------|---------|-----|---------|
| readdir | 0.105ms | 0.075ms | 1.4x |
| stat | 0.071ms | 0.050ms | 1.4x |
| fileExists | 0.073ms | 0.019ms | 3.8x |

**Glob Search:**

| Test | Node.js | Bun | Speedup |
|------|---------|-----|---------|
| glob (**/*.ts) | 1.082ms | 0.758ms | 1.4x |
| glob (**/*) | 1.026ms | 0.633ms | 1.6x |

**Other:**

| Test | Node.js | Bun | Speedup |
|------|---------|-----|---------|
| Startup time | 77.7ms | 42.9-53.3ms | 1.5-1.8x |
| HTTP fetch (JSON) | 0.432ms | 0.250ms | 1.7x |
| SHA-256 (node:crypto) | 0.012ms | 0.009ms | 1.3x |
| SHA-256 (CryptoHasher) | - | 0.004ms | 2.8x vs Node |

**SQLite** (I/O bound, similar performance):

| Test | better-sqlite3 (Node) | bun:sqlite (Bun) |
|------|----------------------|------------------|
| insert (100 rows) | 188.6ms | 195.6ms |
| select | 0.212ms | 0.220ms |
| transaction (50 rows) | 1.795ms | 1.968ms |

**Batch File Reading (optimal concurrency):**

| Concurrency | Time (100 files) | Notes |
|-------------|-------------------|-------|
| 1 (sequential) | 21ms | Baseline |
| 4 | 2.7ms | Good |
| **8-16** | **1.2ms** | **Optimal** |
| 32+ | 1.0-2.2ms | Diminishing returns |

Speedup: 9x faster with parallel reads (concurrency 8-16).

## Storage Architecture

### Multi-DB Split (v6, 2026-03-06)

Unified `unified-storage.db` replaced with 4 independent databases for parallel I/O.
Index writes to `graph.db` no longer block reads from `semantic.db`/`cache.db`.

| Database | Tables | Size | Purpose |
|----------|--------|------|---------|
| **graph.db** | entities, relationships, files, file_generations, tombstones, name_tokens, project_metadata | 64 MB | Write-heavy during indexing |
| **semantic.db** | cooccurrence, term_frequency | 12 MB | Query expansion (read-heavy) |
| **versioning.db** | prolly_nodes, graph_commits, branch_heads | 277 MB | Content-addressed versioning |
| **cache.db** | embedding_cache, query_cache, performance_metrics | 28 KB | Global caches, TTL-based |
| **Total** | | **353 MB** | 26.7K entities, 68.9K rels, 841 files |

**Initialization timings (cold start):**

| Stage | Time |
|-------|------|
| MultiDbManager.initialize() (4 clients parallel) | 15 ms |
| createTables() (4 DBs parallel) | 3 ms |
| Prolly components init | 5 ms |
| **Total storage init** | **25 ms** |
| flush() (all 4 DBs) | 4 ms |

All DBs: `journal_mode=OFF`, `synchronous=OFF`, `cache_size=-8192` (8 MB per DB).

## Indexing Performance

### Current (v6.4, staging tables, multi-DB, IVF,SQ8)

**Append-only staging tables** for bulk indexing (>500 files): heap INSERT O(1), no B-tree PK lookup. Commit via `INSERT OR REPLACE INTO main SELECT FROM staging` + recreate indexes in one pass.

#### UltraCode (self-indexing)

[github.com/anthropics/ultracode](https://github.com/anthropics/ultracode) — 275K LOC, 832 files, 27K entities, 69K rels

| Metric | v6.4 (staging) | v6.3 (no staging) | Delta |
|--------|----------------|-------------------|-------|
| **Total index_done** | **8.6 sec** | 9.8 sec | **-12%** |
| **Parsing** | 3.1 sec | 3.5 sec | ~same |
| **DB flush (2 batches)** | 3.6 sec (2.9s + 0.7s) | 5.2 sec (4.1s + 1.1s) | **-31%** |
| **commitStaging** | 0.65 sec | — | new |
| **Total flush+commit** | **4.2 sec** | **5.2 sec** | **-19%** |
| **Embedding flush** | 0.8 sec | 0.7 sec | ~same |

#### VS Code

[github.com/microsoft/vscode](https://github.com/microsoft/vscode) — 1.9M LOC, 7198 files, 253K entities, 838K rels

| Metric | v6.4 (staging) | v6.3 (no staging) | Delta |
|--------|----------------|-------------------|-------|
| **Total index_done** | **82-97 sec** | 205 sec | **2.1-2.5x faster** |
| **Parsing (14 workers)** | ~14 sec | ~42 sec | difference in flush overlap |
| **DB flush (8 batches)** | ~31 sec (4-6s each, stable) | ~159 sec (14→32s, degrading) | **5.1x faster** |
| **commitStaging** | ~11 sec | — | new |
| **Total flush+commit** | **~42 sec** | **~159 sec** | **3.8x faster** |
| **Embedding flush** | ~32 sec | ~32 sec | ~same |

**Why staging is faster:**
- Staging tables have no PRIMARY KEY → heap append O(1) per row (no B-tree page splits)
- Main table indexes dropped during indexing → no index maintenance during flush
- Cross-flush duplicates handled by `INSERT OR REPLACE INTO` during commit
- Stable per-batch times (4-6s vs 14→32s degradation in v6.3)

### Previous (v6.3, 843 files, 12.0K entities, IVF,SQ8, .ultracodeignore)

| Metric | Value |
|--------|-------|
| **Total index_done** | **4.6 sec** |
| **Collect files** | 401 ms (843 files, bun_glob, 19802 excluded by ignore) |
| **Pre-spawn parsers** | 734 ms (4 pools: TS×10, JS×2, PS×2, Bash×2) |
| **Parsing (code)** | 2879 ms (683 files, pure worker 81%) |
| **Streaming coverage** | 94% (630/670 files indexed during parsing) |
| **Post-batch index** | 376 ms (40 remaining files) |
| **Data files** | 160 files (**parallel with parsing**, hidden) |
| **DB flush** | ~350 ms (15852 ent, 27115 rels) |
| **Embedding generation** | ~5.7s (9442 vectors, 1655/s TEI, overlaps parsing) |
| **FAISS flush** | 324 ms (9442 vectors, **29165/s**) |
| **Prolly commit** | instant |
| **PMI recalculation** | 4.3 sec (63K pairs, background) |
| **auto_index_done** | 13.5 sec (total including FAISS+PMI) |
| **Incremental (1-3 files)** | 48-115 ms |

### Previous (v6.1, 844 files, 27K entities)

| Metric | Value |
|--------|-------|
| **Total index_done** | 8.1 sec |
| **Parsing (code)** | 5815 ms (695 files, C-pool 191 files × 8 workers) |
| **FAISS flush** | 848 ms (9494 vectors, 11199/s) |
| **Data files** | 82 ms (parallel with parsing) |

### Previous (v6.0, 841 files)

| Metric | Value |
|--------|-------|
| **Total index_done** | 8.8 sec |
| **Data files** | 726 ms (sequential, after parsing) |
| **Watcher ready** | +16.5s (blocked by FAISS save) |
| **FAISS save** | 5.2 sec (blocking) |

### Previous (v5, 523 TS files)

| Metric | Value |
|--------|-------|
| **Total indexing time** | 3.1 sec |
| **Parsing speed** | ~169 files/sec |
| **Data files (JSON/YAML)** | 892 files/sec (34x speedup: 6.7s to 195ms) |
| **Streaming coverage** | 91-95% of files |

## MCP Tool Performance

### Current (v6.4, staging tables, multi-DB)

Benchmarked on two projects. All server-side `durationms` from log.

**UltraCode**: [github.com/anthropics/ultracode](https://github.com/anthropics/ultracode) — 275K LOC, 832 files, 29K entities, 59K rels
**VS Code**: [github.com/microsoft/vscode](https://github.com/microsoft/vscode) — 1.9M LOC, 7198 files, 223K entities, 576K rels

#### Search Tools

| Tool | Mode | UltraCode | VS Code | Scale | Notes |
|------|------|-----------|---------|-------|-------|
| `find_similar_code` | vector | **61 ms** | 79 ms | 1.3x | FAISS IVF,SQ8 |
| `cross_language_search` | vector | **73 ms** | 58 ms¹ | ~same | 10 languages |
| `get_members` | AST | **82 ms** | 130 ms | 1.6x | 72 entities (FaissProvider) |
| `query` | graph NL | **89 ms** | 181 ms | 2.0x | 5 rels found |
| `detect_technology_stack` | graph | **120 ms** | — | — | Languages, frameworks |
| `pattern_search` | entity (regex) | **238 ms** | 710 ms | 3.0x | SIMD regex, 29K vs 223K entities |
| `pattern_search` | semantic | **224 ms** | 405 ms | 1.8x | TEI embed + FAISS |
| `semantic_search` | FAISS | **461 ms** | 259 ms² | — | Query expansion + enrichment |

¹ VS Code FAISS not loaded (ran on ultracode vectors)
² Second run, cached cooccurrence

#### Analysis Tools

| Tool | UltraCode | VS Code | Scale | Notes |
|------|-----------|---------|-------|-------|
| `get_metrics` | **144 ms** | 2088 ms | 14.5x | Memory 2.2GB RSS for VS Code |
| `analyze_hotspots` | **134 ms** | 216 ms | 1.6x | Top-10 complexity |
| `suggest_refactoring` | **139 ms** | 354 ms | 2.5x | 7 suggestions |
| `check_entity_patterns` | **188 ms** | — | — | 2 matches (class entity) |
| `find_related_concepts` | **176 ms** | — | — | FAISS-based, 10 results |
| `find_duplicates` | **189 ms** | — | — | 0 groups (minSimilarity=0.8) |
| `detect_patterns` | **310 ms** | 396 ms | 1.3x | 10K entities scanned |
| `analyze_code_impact` | **510 ms** | 1621 ms | 3.2x | depth=2, batch BFS |

#### Tracing Tools

| Tool | UltraCode | VS Code | Scale | Notes |
|------|-----------|---------|-------|-------|
| `trace_data_flow` | **169 ms** | — | — | handleRequest → response |
| `list_entity_relationships` | **100 ms** | 295 ms | 3.0x | depth=1, 41 vs 195 rels |
| `get_entity_history` | **120 ms** | — | — | Prolly Tree, 1 change |
| `find_decision_points` | **266 ms** | 751 ms | 2.8x | Scenario analysis |
| `trace_flow` | **557 ms**¹ | 6589 ms | 9.9x | 29K vs 223K nodes graph load |
| `trace_backwards` | **~560 ms**¹ | 6943 ms | 9.7x | what_affects, graph load dominant |
| `analyze_state_impact` | **823 ms** | 31463 ms | 38.2x | 37 vs 100+ usages, 2 scenarios |

¹ **Adaptive graph cache**: After ≥2 trace calls on a project, graph is cached in memory and auto-preloaded in background after reindex. Subsequent `trace_flow`/`trace_backwards` calls skip graph loading entirely (**~0 ms** instead of 557-6589 ms). Usage count is persisted in `project_metadata.trace_usage_count` and survives server restarts.

#### Security & Clone Detection

| Tool | UltraCode | VS Code | Scale | Notes |
|------|-----------|---------|-------|-------|
| `taint_analysis` | **945 ms** | 204 ms | 0.2x | 18 sources, 0 sinks both |
| `jscpd_detect_clones` | **1235 ms** | 860 ms | 0.7x | Different scan scope |

#### Graph Metrics

| Tool | UltraCode | VS Code | Scale | Notes |
|------|-----------|---------|-------|-------|
| `graph_metrics(pagerank)` | **684 ms** | 7061 ms | 10.3x | 27K vs 223K nodes |
| `graph_metrics(louvain)` | **742 ms** | 7580 ms | 10.2x | 227 vs 2412 communities |

#### Info Tools

| Tool | UltraCode | VS Code | Notes |
|------|-----------|---------|-------|
| `get_version` | **2 ms** | 30 ms | Instant (30ms = parallel load) |
| `get_graph_stats` | **226 ms** | 2274 ms | 10x — DB size dependent |
| `get_graph_health` | **397 ms** | 4461 ms | 11.2x — DB size dependent |

#### Performance Tiers (v6.4) — UltraCode (29K entities)

| Tier | Time | Tools |
|------|------|-------|
| **Instant** (<100 ms) | 2-89 ms | `get_version`, `find_similar_code`, `cross_language_search`, `get_members`, `query` |
| **Fast** (100-250 ms) | 100-238 ms | `list_entity_relationships`, `detect_technology_stack`, `get_entity_history`, `analyze_hotspots`, `suggest_refactoring`, `check_entity_patterns`, `trace_data_flow`, `find_related_concepts`, `find_duplicates`, `get_graph_stats`, `pattern_search(entity)`, `pattern_search(semantic)` |
| **Medium** (250-1000 ms) | 266-945 ms | `find_decision_points`, `detect_patterns`, `get_graph_health`, `semantic_search`, `analyze_code_impact`, `trace_flow`, `graph_metrics(pagerank)`, `graph_metrics(louvain)`, `trace_backwards`, `analyze_state_impact`, `taint_analysis` |
| **Heavy** (1000+ ms) | 1235 ms | `jscpd_detect_clones` |

#### Scaling: UltraCode (29K) → VS Code (223K) — 7.7x entities

| Category | Avg Scale Factor | Notes |
|----------|-----------------|-------|
| Search (regex) | 3.0x | Linear in entity count |
| Search (vector) | 1.3-1.8x | FAISS sublinear (IVF) |
| Analysis | 1.3-3.2x | Depends on graph traversal depth |
| Tracing (graph load) | **9.7-10.3x** | Graphology in-memory, O(n) load; **0ms with adaptive cache** (≥2 uses) |
| State analysis | **38.2x** | O(usages × graph) — superlinear |
| Graph metrics | **10.2-10.3x** | Full graph algorithms O(n+e) |
| Info (DB stats) | **10-11.2x** | Full table scan |

### Previous (v6.3, batch SQL, 27K entities)

| Tool | Time | Notes |
|------|------|-------|
| `find_similar_code` | ~65 ms | 5 results, threshold 0.5 |
| `cross_language_search` | ~75 ms | 20 results, 10 languages |
| `query` | ~95 ms | 5 rels found |
| `get_members` | 109 ms | Single file, 33 entities |
| `pattern_search(entity)` | 147 ms | SIMD regex |
| `pattern_search(semantic)` | 188 ms | batch SQL, -43% vs v6.2 |
| `semantic_search` | 216 ms | batch enrichment, -30% vs v6.2 |
| `analyze_hotspots` | 123 ms | -15% vs v6.2 |
| `analyze_code_impact` | 141 ms | batch BFS |
| `detect_patterns` | ~170 ms | 10K entities |
| `trace_flow` | 578 ms | 25K nodes |
| `trace_backwards` | ~740 ms | what_affects |
| `graph_metrics(pagerank)` | ~610 ms | 25K nodes |
| `graph_metrics(louvain)` | ~620 ms | 245 communities |
| `taint_analysis` | ~900 ms | 20 sources |
| `analyze_state_chaos` | 19411 ms | Race detection |

### Previous (v6.2, 12K entities, 30K rels)

| Tool | Time | Notes |
|------|------|-------|
| `get_metrics` | 46 ms | Memory, uptime, graph stats |
| `find_similar_code` | 60 ms | Code snippet → FAISS search |
| `cross_language_search` | 70 ms | FAISS search across all languages |
| `query` | 90 ms | Graph NL query |
| `get_members` | 99 ms | Single file, function filter |
| `list_entity_relationships` | 101 ms | depth=2 |
| `find_related_concepts` | 106 ms | Conceptually related code |
| `suggest_refactoring` | 110 ms | Extract/simplify/rename |
| `analyze_code_impact` | 118 ms | depth=2 |
| `check_entity_patterns` | 123 ms | Anti-patterns per entity |
| `get_graph` | 125 ms | Entity listing |
| `get_entity_history` | 135 ms | Prolly Tree |
| `pattern_search(entity)` | 142 ms | SIMD regex |
| `analyze_hotspots` | 144 ms | top-5 complexity |
| `detect_technology_stack` | 164 ms | Languages, frameworks |
| `detect_patterns` | 167 ms | Anti-patterns scan |
| `find_decision_points` | 170 ms | Scenario analysis |
| `find_duplicates` | 217 ms | Semantic clone detection |
| `analyze_state_impact` | 302 ms | 2 scenarios |
| `semantic_search` | 307 ms | FAISS IVF,SQ8 + enrichment |
| `pattern_search(semantic)` | 331 ms | TEI embed + FAISS + entity resolution |
| `analyze_swagger_impact` | 478 ms | API spec |
| `trace_flow` | 502 ms | A→B path (25K nodes) |
| `graph_metrics(louvain)` | 598 ms | 232 communities |
| `graph_metrics(pagerank)` | 603 ms | Top-20 importance |
| `jscpd_detect_clones` | 711 ms | Token-based clones |
| `trace_backwards` | 734 ms | what_affects |
| `taint_analysis` | 895 ms | Sources→sinks |
| `analyze_state_chaos` | 22244 ms | Race conditions |

## Historical Results

### 2025-12-12

**Test environment**: RTX 5060 (Blackwell), Intel CPU, Windows

Top OpenVINO CPU results:
- multilingual-e5-base: 583 chunks/s, quality gap 0.608
- distiluse-base-multilingual: 534 chunks/s, quality gap 0.608
- all-MiniLM-L6-v2 INT8: 510 chunks/s, quality gap 0.601

Top GPU results:
- TEI BGE-M3 (batch 128): 342 chunks/s, 8K context
- Ollama granite-embedding:30m: 71 chunks/s
- Ollama all-minilm: 55 chunks/s, quality gap 0.601

Key findings:
- multilingual-e5-base dethroned all-MiniLM-L6-v2 as top overall pick (higher speed + quality + multilingual)
- multilingual-e5-small showed very low quality gap (0.09) and is NOT recommended
- BGE-M3 optimal batch size is 128 (diminishing returns above 256)

### 2025-12-07

**Test environment**: RTX 5090 + i9, 100 entities (largest: SemanticAgent 1253 lines), Smart Chunker

| Rank | Provider | Model | Chunks/s | ms/chunk | tok/s | Context | Recommendation |
|------|----------|-------|----------|----------|-------|---------|----------------|
| 1 | OpenVINO CPU | all-MiniLM-L6-v2 | 474 | 2.1 | 80,507 | 256 | Fastest overall |
| 2 | OpenVINO CPU | paraphrase-multilingual | 161 | 6.2 | 16,089 | 128 | 50+ languages |
| 3 | Ollama GPU | granite-embedding:30m | 123 | 8.1 | 34,685 | 512 | Fast Ollama |
| 4 | OpenVINO CPU | gte-small | 87 | 11.5 | 24,400 | 512 | Quality |
| 5 | OpenVINO CPU | multilingual-e5-small | 69 | 14.6 | 19,290 | 512 | 94 languages |
| 6 | Ollama GPU | snowflake-arctic-embed2 | 15 | 65.4 | 9,968 | 8192 | Best 8K |
| 7 | Ollama GPU | nomic-embed-text | 2 | 580.8 | 1,123 | 8192 | Not recommended |

## TODO

- [ ] Benchmark EmbeddingGemma-300M (SOTA <500M params, 768D, 100+ languages)
- [ ] Benchmark Qwen3-Embedding-0.6B (code search model, 1024D)
- [ ] Re-benchmark vLLM on Blackwell with `120-latest` image
- [ ] Benchmark jina-embeddings-v2-base-code on OpenVINO/TEI
- [ ] Benchmark modernbert-embed-base on OpenVINO/TEI
- [ ] Benchmark CodeRankEmbed (137M params, outperforms 1.3B models)
