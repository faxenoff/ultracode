# Tool Performance Benchmarks

Measured on 2026-03-02 against the UltraCode codebase itself.
Source: `ulog` (`BASETOOL.mcp_response` events) + internal span logs.

## Environment

| Parameter | Value |
|-----------|-------|
| Project | `D:\github\ultracode` |
| Files indexed | 819 source files (1155 total, excludes `node_modules`, `dist`, `build`) |
| Source LOC | **271 036** lines TypeScript (`src/**/*.ts`) + **579** lines Python (`src/parsers/python-ast-cli.py`) |
| Entities | 29 918 |
| Relationships | 77 504 |
| Graph nodes | 37 596 (includes import stubs and external refs) |
| Graph edges | 75 144 |
| Embedding model | `intfloat/multilingual-e5-small`, 384 dims, via TEI |
| Runtime | Node.js / Bun, Windows 11 |

---

## One-Time Startup Costs (per MCP process lifetime)

These are paid **once** at server startup or on first use, then amortized.

| Component | Cost | When |
|-----------|------|------|
| MCP server init (storage, DI, agents) | **18 ms** | Process start |
| TEI embedding provider warmup | **170 ms** | Process start (parallel) |
| GPU worker startup (named pipe) | **343 ms** | Process start (parallel) |
| FAISS base index load (`base_loaded`) | **~300 ms** | First semantic query |
| Graphology graph load — cold OS cache | **1 200–1 300 ms** | First `trace_*` call per session |
| Graphology graph load — warm OS cache | **630–650 ms** | Subsequent `trace_*` calls (OS page cache) |
| Pattern registry load (6 YAML rule files, 69 patterns, 40 exemplars) | **~213 ms** | First `detect_patterns` call |

---

## Tool Performance (measured `durationms`)

All times from `BASETOOL.mcp_response` log events. "Total" includes network serialization overhead.

### Index

| Tool | Args | Total (ms) | Notes |
|------|------|-----------|-------|
| `index` | `reset=true, incremental=false, 14 exclude patterns` | **6 653** | Full reindex: 819 files, parse 10.5 s + flush + commit. Dominated by parser workers (6× TS workers). |

#### Auto-index phase breakdown — optimized (clean DB, 829 files, 26 187 entities)

```
Phase                               Duration    Notes
──────────────────────────────────────────────────────────────
[1] File scan (bun glob)              416 ms   1 157 files
    Pool rebuild                    (parallel)  runs concurrently with file scan

[2] Pre-spawn 10 TS workers           690 ms   full target count upfront (A+B)
                                               eliminates ensureWorkers latency

[3] Parsing + DB writes             4 034 ms   TS 581 files, 10 workers (B)
    └─ DB batch flush (270 files)  (overlap)   batch writes start DURING parsing (D)

[4] Final batch flush                 358 ms   remaining entities → SQLite

[5] Data files                         41 ms   172 data files

[6] Swagger links                     272 ms

[7] FAISS flush ∥ Graph commit        801 ms   parallel Promise.all (E)
    ├─ accumulator.flush()            ~800 ms  9 369 vectors (C: 74 HTTP requests)
    └─ createGraphCommit()            ~795 ms  commit e870e179, 26 187 entities

[8] Keepalive                           1 ms
──────────────────────────────────────────────────────────────
TOTAL                               6 653 ms   
```

### Search

| Tool | Args | Total (ms) | Notes |
|------|------|-----------|-------|
| `semantic_search` | `query=…, limit=20` | **328** | Includes embedding of query (TEI, ~20 ms) + FAISS ANN search + SQLite enrichment. Returns 20/200 results. |
| `pattern_search` | `mode=regex, limit=20` | **~80*** | Regex-only mode via DB `LIKE`. Estimated from hybrid split. |
| `pattern_search` | `mode=hybrid, semanticQuery=…, limit=20` | **597** | Regex match + embedding generation for semantic reranking. ~270 ms for embedding init (`embgen_init`). |
| `pattern_search` | `mode=semantic, limit=20` | **~350*** | Semantic-only: embedding + FAISS. Estimated. |
| `cross_language_search` | default args | **123** | Searches across all indexed languages. |
| `find_similar_code` | default args | **58** | Fast vector similarity lookup. |
| `find_related_concepts` | `entityId=…, limit=15` | **803** | Vector similarity search for related entities; 15/200 results. |
| `find_duplicates` | default args | **191** | Structural clone detection via graph hashing. |
| `jscpd_detect_clones` | `paths=[src], formats=[ts], minLines=8, minTokens=50` | **1 418** | Token-based clone detection across all 581 TS source files. 0 duplicates found (clean codebase). |
| `get_members` | ~~`filePath=src/core/pipe-transport.ts`~~ (deleted) | **78–80** | AST entity listing; 34 entities returned. |
| `check_entity_patterns` | default args | **114** | Pattern check for single entity. |
| `query` | natural language query | **117** | SQLite structured query with NL parsing. |
| `detect_technology_stack` | default args | **127** | Stack detection from file extensions + imports. |

*Estimated by subtracting embedding cost from hybrid timing.

### Tracing

Tracing tools load a Graphology in-memory directed graph from SQLite on each call.
Graph load dominates total time, especially on the first call.

| Tool | Args | Total (ms) | Graph load (ms) | BFS / logic (ms) | Nodes visited |
|------|------|-----------|----------------|-----------------|---------------|
| `trace_flow` | `maxDepth=3`, 1-hop path | **1 570** ¹ | 1 301 | 117 | 3 |
| `trace_flow` | `maxDepth=5`, 4-hop path | **1 482** ¹ | 1 204 | 118 | 28 |
| `trace_flow` | `maxDepth=8`, no path found | **1 524** ¹ | 1 228 | 166 | 18 |
| `trace_flow` | `maxDepth=10`, 4-hop path (warm) | **783** ² | 636 | 69 | 28 |
| `trace_backwards` | `depth=5` | **795** ² | 648 | ~147 | — |
| `trace_data_flow` | `trackTransformations=true` | **192** ² | 630 | ~50 | 4 sources |
| `analyze_state_impact` | default args | **487** | — | — | — |
| `find_decision_points` | default args | **315** | — | — | — |

¹ Cold graph load (first `trace_*` call in session, cold OS page cache after reindex).
² Warm graph load (OS page cache already warm from prior calls).

**Key insight:** ~85% of `trace_flow` time on cold calls is graph load, not BFS. BFS itself costs 70–170 ms for graphs with 37 k nodes / 75 k edges.

### Analysis

| Tool | Args | Total (ms) | Internal breakdown |
|------|------|-----------|-------------------|
| `detect_patterns` | `category=all, minConfidence=0.6, entityLimit=5000` | **422** | Pattern registry load ~213 ms (1st call) + `STRUCTURAL_DETECTOR` 218 ms (5000 entities × 23 patterns → 2358 candidates) + `SEMANTIC_VALIDATOR` 4 ms (1565 semantic confirmations) |
| `detect_patterns` | subsequent call (registry cached) | **~209*** | Only structural + semantic scan |
| `analyze_code_impact` | `depth=3` | **2 645** | Graph traversal to depth 3; found 2548 impacted entities. Dominated by multi-hop SQLite lookups. |
| `analyze_hotspots` | `metric=all, limit=20, includeHistoricalMetrics=true, lookbackDays=30` | **1 274** | Loads git history via Prolly Tree + complexity metrics for top-20 of 5000 entities |
| `suggest_refactoring` | default args | **110** | Fast heuristic analysis; no deep graph traversal. |
| `analyze_state_chaos` | default args | **31 771** | Exhaustive cross-entity state dependency scan; O(entities²). |
| `analyze_swagger_impact` | default args | **549** | Swagger/OpenAPI endpoint impact analysis. |
| `taint_analysis` | `category=sql_injection, maxDepth=5, limit=5` | **1 076** | Fixed (no crash). 0 vulnerabilities found — clean codebase. |
| `list_entity_relationships` | `entityId=…, depth=1` | **94** | Single-hop relationship lookup from SQLite. |

*Estimated by subtracting one-time registry load from first-call time.

### Graph Metrics

| Tool | Args | Total (ms) | Notes |
|------|------|-----------|-------|
| `graph_metrics` | `metric=pagerank, topN=20` | **802** | PageRank on 37 596 nodes. mean=0.000027, max=0.016 (Promise stub). |
| `graph_metrics` | `metric=louvain, topN=20, minCommunitySize=5` | **899** | Louvain community detection: 88 communities, modularity=0.721, 37 683 nodes. |
| `graph_metrics` | `metric=centrality, topN=20` | **844** | Degree centrality computation. |
| `graph_metrics` | `metric=bus_factor, topN=20` | **2 035** | Bus factor requires file ownership + contributor analysis; slowest metric. |
| `graph_metrics` | `metric=betweenness` | not measured | Requires fresh run |
| `get_graph` | default args | **124** | Returns graph summary (nodes/edges/metadata). |
| `get_graph_stats` | default args | **101–104** | Lightweight graph statistics. |
| `get_graph_health` | default args | **372** | Health check includes orphan/cycle detection. |

### Diagnostics / Metadata

| Tool | Total (ms) | Notes |
|------|-----------|-------|
| `get_version` | **1** | Reads package.json version. |
| `get_metrics` | **60** | Process metrics (memory, uptime, request count). |
| `get_agent_metrics` | **0** | In-memory counter read; negligible overhead. |
| `get_bus_stats` | **0** | In-memory counter read; negligible overhead. |
| `get_watcher_status` | **41** | Checks GitWatcher file-watch state. |

### AutoDoc

| Tool | Total (ms) | Notes |
|------|-----------|-------|
| `autodoc_status` | **6** | Reads `.autodoc/` index metadata from disk. |
| `autodoc_search` | **1** (text) / **24** (semantic) | Text search: direct string match in `.autodoc/`. Semantic: embedding + vector lookup. |
| `autodoc_validate` | **312** | Validates all `.autodoc/` entries against current indexed entities. |
| `autodoc_detect_language` | **327** | Auto-detects project language from file extensions + parse results. |
| `list_snapshots` | **31** | Lists `.autodoc/snapshots/` directory entries. |
| `autodoc_get` | not measured | — |
| `autodoc_save` | not measured | Write operation |
| `autodoc_init` | not measured | Write operation |
| `autodoc_sync` | not measured | Write operation |
| `autodoc_generate` | not measured | LLM-backed generation; cost varies |
| `autodoc_changelog` | not measured | — |
| `autodoc_install_hooks` | not measured | Write operation |

### Git

| Tool | Total (ms) | Notes |
|------|-----------|-------|
| `list_branches` | **39** | `git branch` wrapper via SQLite metadata. |
| `get_branch_status` | **39** | Current branch + uncommitted changes summary. |
| `list_commits` | **85** | `git log` with metadata; default 20 commits. |
| `diff_commits` | **185** | Unified diff between two commit SHAs. |
| `get_entity_history` | **92** | Entity-level git history from Prolly Tree. |
| `get_changed_files` | not measured | — |
| `switch_branch` | not measured | Write operation (modifies working tree) |
| `cleanup_branches` | not measured | Write operation |

### Snapshot / Modify

These tools perform write operations; not benchmarked in read-only sessions.

| Tool | Notes |
|------|-------|
| `create_snapshot` | Creates `.autodoc/snapshots/` backup |
| `undo` | Restores from snapshot |
| `cleanup_snapshots` | Deletes old snapshots |
| `checkout_commit` | Checks out a git commit |
| `modify_code` | AI-guided code modification with snapshot |
| `copy_file` | File copy with entity re-registration |
| `rename_file` | File rename + reference updates |
| `split_file` | Splits file into multiple files |
| `synthesize_files` | Merges multiple files into one |
| `create_file` | Creates new file + registers entities |
| `rename_symbol` | Symbol rename across all references |
| `add_member` | Adds method/field to existing entity |
| `validate_file` | Pre-commit validation of a single file |
| `validate_directory` | Pre-commit validation of a directory |
| `semantic_merge` | Semantic 3-way merge |
| `analyze_merge_conflicts` | Analyzes merge conflict context |
| `get_merge_suggestions` | Suggests conflict resolution |
| `get_semantic_merge_info` | Returns semantic diff metadata |
| `reset_graph` | Drops and rebuilds in-memory graph |

### Help / Discovery

| Tool | Total (ms) | Notes |
|------|-----------|-------|
| `get_help` | not measured | Returns static markdown docs |
| `get_tools_for_task` | not measured | Recommendation engine over tool registry |

---

## Summary: Fastest to Slowest (all measured tools)

| # | Tool | Total (ms) | Category |
|---|------|-----------|----------|
| 1 | `get_agent_metrics` | **0** | Diagnostics |
| 2 | `get_bus_stats` | **0** | Diagnostics |
| 3 | `autodoc_search` (text) | **1** | AutoDoc |
| 4 | `get_version` | **1** | Diagnostics |
| 5 | `autodoc_status` | **6** | AutoDoc |
| 6 | `list_snapshots` | **31** | AutoDoc |
| 7 | `list_branches` | **39** | Git |
| 8 | `get_branch_status` | **39** | Git |
| 9 | `get_watcher_status` | **41** | Diagnostics |
| 10 | `find_similar_code` | **58** | Search |
| 11 | `get_metrics` | **60** | Diagnostics |
| 12 | `get_members` | **78–80** | Search |
| 13 | `list_commits` | **85** | Git |
| 14 | `get_entity_history` | **92** | Git |
| 15 | `list_entity_relationships` | **94** | Analysis |
| 16 | `get_graph_stats` | **101–104** | Graph |
| 17 | `suggest_refactoring` | **110** | Analysis |
| 18 | `check_entity_patterns` | **114** | Search |
| 19 | `query` | **117** | Search |
| 20 | `cross_language_search` | **123** | Search |
| 21 | `get_graph` | **124** | Graph |
| 22 | `detect_technology_stack` | **127** | Search |
| 23 | `diff_commits` | **185** | Git |
| 24 | `find_duplicates` | **191** | Search |
| 25 | `trace_data_flow` | **192** | Tracing |
| 26 | `autodoc_search` (semantic) | **~24** | AutoDoc |
| 27 | `autodoc_validate` | **312** | AutoDoc |
| 28 | `find_decision_points` | **315** | Tracing |
| 29 | `autodoc_detect_language` | **327** | AutoDoc |
| 30 | `semantic_search` | **328** | Search |
| 31 | `get_graph_health` | **372** | Graph |
| 32 | `detect_patterns` | **422** | Analysis |
| 33 | `analyze_state_impact` | **487** | Tracing |
| 34 | `analyze_swagger_impact` | **549** | Analysis |
| 35 | `pattern_search` (hybrid) | **597** | Search |
| 36 | `trace_flow` (warm) | **783** | Tracing |
| 37 | `trace_backwards` (warm) | **795** | Tracing |
| 38 | `graph_metrics` (pagerank) | **802** | Graph |
| 39 | `find_related_concepts` | **803** | Search |
| 40 | `graph_metrics` (centrality) | **844** | Graph |
| 41 | `graph_metrics` (louvain) | **899** | Graph |
| 42 | `taint_analysis` | **1 076** | Analysis |
| 43 | `analyze_hotspots` | **1 274** | Analysis |
| 44 | `jscpd_detect_clones` | **1 418** | Search |
| 45 | `trace_flow` (cold) | **1 482–1 570** | Tracing |
| 46 | `graph_metrics` (bus_factor) | **2 035** | Graph |
| 47 | `analyze_code_impact` | **2 645** | Analysis |
| 48 | `index` (full reset) | **15 467** | Indexing |
| 49 | `analyze_state_chaos` | **31 771** | Analysis |

---

## Notes

- **`analyze_state_chaos` is the slowest query tool** (31.8 s). It performs an exhaustive O(entities²) cross-entity state dependency scan — avoid on large codebases without `filePath` filter.
- `taint_analysis`  runs at 1 076 ms with bounded depth (`maxDepth=5`). 
- **Graph load is the dominant cost** for all tracing tools (85% of cold-call time). Graphology loads the full 37 k node / 75 k edge graph from SQLite on every call — there is no cross-call graph cache in the current process. OS page cache reduces this from ~1 250 ms (cold) to ~640 ms (warm) on subsequent calls.
- **`detect_patterns`** is fast because the `evalCache` (keyed by `entityId::patternId`) eliminates redundant structural evaluations. 5000 entities × 23 patterns in 224 ms internal time.
- **`analyze_code_impact` at depth=3** is the slowest query tool (2.6 s) because it performs multi-hop graph traversal and resolves 2548 impacted entities with SQLite lookups at each level.
- **`jscpd_detect_clones`** takes 1.4 s to tokenize 581 TS files regardless of duplicate count — the cost is O(files × avg_tokens).
- **`index` (auto startup, optimized)** takes **6 653 ms** (down from 9 223 ms baseline, −28%). TypeScript parsed with 10 workers; FAISS flush and graph commit run in parallel (`Promise.all`); TEI batch size raised to 128; DB flush threshold raised to 270 files. Parsing phase (4 034 ms, 90% CPU-bound on workers) is now the dominant cost.
- **`graph_metrics` bus_factor** is 2× slower than other metrics (2 035 ms vs 802–899 ms) because it requires loading git contributor history per file in addition to graph topology.
