---
module_name: search
description: "Multi-mode pattern search engine with entity, content, semantic, and hybrid search over the code graph"
status: active
language: typescript
entry_point: pattern-search.ts
exports: [PatternSearch, PatternSearchQuery, PatternSearchResult]
dependencies: [storage, semantic, analysis, logging, utils]
tags: [search, regex, semantic-search, vector-similarity, simd, hybrid-search]
---

# Search Module

> Multi-mode code search engine combining regex entity matching, content filtering, SIMD-accelerated vector similarity, and hybrid ranking over the indexed code graph.

## Overview

The module provides four search modes through a single `PatternSearch` class: **entity** (regex name matching against the graph), **content** (body text filtering with optional semantic similarity), **semantic** (vector store cosine similarity with SIMD acceleration), and **hybrid** (merged, deduplicated, score-ranked union of all three). It is instantiated lazily via `ServiceContainer.getPatternSearch()` and receives `GraphStorage`, `VectorStore`, and `TechnologyDetector` as constructor dependencies. Embedding generation initializes on first use; if unavailable, semantic search falls back to entity name matching with a 0.5 penalty score.

## Data Flow

### Inputs
| Source | Data | Type |
|--------|------|------|
| MCP tool handler | `PatternSearchQuery` (pattern, mode, scope, contentFilter, limit) | Structured query |
| `GraphStorage` | Indexed entities with locations and metadata | Database |
| `VectorStore` | Pre-computed embedding vectors | In-memory FAISS / libsql |

### Processing
1. Route query to mode-specific handler (entity / content / semantic / hybrid)
2. Build scope filters (entity types, file paths, framework-aware file resolution)
3. Execute graph queries or vector similarity search
4. Apply content filters (substring, regex, semantic threshold >= 0.7)
5. Merge, deduplicate by entity ID, sort by score descending, apply limit

### Outputs
| Target | Data | Type |
|--------|------|------|
| Caller | `PatternSearchResult[]` with entity, matchType, score, snippet | Array |

## Public API

| Export | Type | Description | Location |
|--------|------|-------------|----------|
| `PatternSearch` | class | Main search engine with four modes and lazy embedding init | [`pattern-search.ts:72-406`](./pattern-search.ts) |
| `PatternSearchQuery` | interface | Query config: pattern, mode, scope filters, content filters, limit | [`pattern-search.ts:40-54`](./pattern-search.ts) |
| `PatternSearchResult` | interface | Result with entity, matchType, score, optional snippet and highlights | [`pattern-search.ts:56-66`](./pattern-search.ts) |

### Key Methods

| Method | Signature | Description |
|--------|-----------|-------------|
| `initialize` | `() => Promise<void>` | Load EmbeddingGenerator for semantic search; logs warning on failure |
| `search` | `(query: PatternSearchQuery) => Promise<PatternSearchResult[]>` | Dispatch to mode-specific handler |

## Dependencies

### Internal Modules
| Module | Import | Purpose |
|--------|--------|---------|
| `storage` | `GraphStorage` (via types) | Entity queries: `findEntities`, `getEntity`, `searchEntities` |
| `semantic` | `VectorStore`, `EmbeddingGenerator` | Vector similarity search and embedding generation |
| `analysis` | `TechnologyDetector` | Framework-aware file filtering via `detectStack()` |
| `logging` | `log` | Structured logging (info, warn, error) |
| `utils` | `readLineRange`, `cosineSimilarity` | File content reading and SIMD-accelerated cosine similarity |

### External Packages
| Package | Purpose |
|---------|---------|
| (none) | All dependencies are internal modules or Node.js built-ins |

## Configuration

| Parameter | Default | Description |
|-----------|---------|-------------|
| `query.mode` | (required) | `"entity"` / `"content"` / `"semantic"` / `"hybrid"` |
| `query.limit` | `100` | Max results returned (semantic mode defaults to `10`) |
| `query.scope.entityTypes` | all | Filter by `EntityType[]` |
| `query.scope.files` | all | Filter by file path list |
| `query.scope.frameworks` | all | Filter by framework names (requires TechnologyDetector) |
| `query.contentFilter.contains` | none | Substring match on entity body |
| `query.contentFilter.regex` | none | Regex match on entity body (pre-compiled once) |
| `query.contentFilter.semantic` | none | Semantic similarity threshold >= 0.7 |

## Behavioral Properties

| Property | Value |
|----------|-------|
| Async | Yes -- all search methods are async; embedding init is lazy |
| State | `embeddingGenerator` cached after first `initialize()` call |
| Thread Safety | Stateless per-query; only shared state is the cached embedding generator |
| Idempotency | `search()` is idempotent for identical queries and unchanged graph |
| Side Effects | File reads via `readLineRange` for content search; structured logging |
| Performance | SIMD-accelerated cosine similarity; pre-compiled regex; Set-based O(1) scope filtering |

## Error Handling

| Error | When | Recovery |
|-------|------|----------|
| Embedding init failure | `initialize()` | Log warning, set generator to null; semantic falls back to entity search |
| VectorStore unavailable | `searchSemantic()` | Log warning, return empty results |
| EmbeddingGenerator unavailable | `searchSemantic()` after retry | Log warning, fall back to `fallbackEntitySearch` with score 0.5 |
| Entity file read failure | `getEntityContent()` | Log warning, return empty string (entity skipped in content filter) |
| Similarity computation failure | `computeSemanticSimilarity()` | Log error, fall back to case-insensitive string matching |
| Unknown search mode | `search()` | Throw `Error("Unknown search mode: ...")` |

## Observability

| Event | Level | When |
|-------|-------|------|
| `PATTERNSEARCH.embgen_init` | info | Embedding generator initialized successfully |
| `PATTERNSEARCH.embgen_init_fail` | warn | Embedding generator failed to initialize |
| `PATTERNSEARCH.vectorstore_unavail` | warn | Semantic search called without VectorStore |
| `PATTERNSEARCH.embgen_unavail_fallback` | warn | Falling back to entity search (no embeddings) |
| `PATTERNSEARCH.semantic_results` | info | Semantic search completed: vectorStoreHits, resolvedEntities, missed |
| `PATTERNSEARCH.semantic_fail` | error | Semantic search threw an exception |
| `PATTERNSEARCH.entity_read_fail` | warn | Failed to read entity content from file |
| `PATTERNSEARCH.sim_compute_fail` | error | Cosine similarity computation failed |

## Implementation Notes

### Semantic Search — Batch Entity Resolution
`searchSemantic()` receives `SimilarityResult[]` from `VectorStore.search()`, which are already enriched with entity metadata (`filePath`, `name`, `type`) from LibSQL. However, vector store IDs use `"ent:filePath:type:name"` format while GraphStorage expects 16-char hash IDs.

**Resolution strategy** (avoids 200+ individual `getEntity()` calls):
1. Extract `filePath`/`name`/`type` from enriched metadata (or parse from vector ID as fallback)
2. Group results by `filePath` — typically 30-50 unique files out of 200 results
3. Batch-fetch all entities per file via `findEntities({filePath})` in parallel
4. Build `entityLookup` Map keyed by `"filePath:type:name"` for O(1) resolution
5. Match each vector result to its entity via the lookup

This approach reduced entity resolution from O(N) DB queries to O(unique_files) queries.

**Observability**: `PATTERNSEARCH.semantic_results` log entry shows `vectorStoreHits`, `resolvedEntities`, and `missed` counts for debugging.

## Known Limitations

- No index.ts barrel file; consumers import directly from `pattern-search.ts`
- Semantic search depends on EmbeddingGenerator availability; degrades silently to entity matching
- Content search loads all candidate entities first (`pattern: ".*"`), which can be expensive on large graphs
- Framework filtering requires TechnologyDetector and scans all import entities linearly
- Snippet generation uses a fixed 50-char context window before and after the match
- Hybrid mode runs entity + content + semantic sequentially (no parallelism)
- Cosine similarity normalization maps [-1, 1] to [0, 1], which compresses score resolution

## TypeScript Notes

`PatternSearch` receives its dependencies via constructor injection (`GraphStorage`, `VectorStore | null`, `TechnologyDetector | null`). The nullable VectorStore and TechnologyDetector allow graceful degradation. Internal `EntityFilters` interface is not exported. `EntityType` is imported from `types/storage.ts` and cast via `as EntityType` for import entity queries. The class is instantiated in `ServiceContainer.getPatternSearch()` at `src/core/service-container.ts`.

## Files

| File | Description |
|------|-------------|
| [`pattern-search.ts`](./pattern-search.ts) | Main implementation (407 lines): PatternSearch class with four search modes, content filtering, SIMD similarity, and result merging |
