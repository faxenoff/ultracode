# UltraCode Architecture

## Overview

**UltraCode** is a multi-agent LiteRAG MCP server for advanced code graph analysis with semantic capabilities. The server implements 30+ MCP methods for analyzing codebases in 10 programming languages.

**Key capabilities:**
- Multi-agent architecture with coordination through ConductorOrchestrator
- Semantic search based on vector embeddings
- Support for 10 programming languages through native parsers
- Incremental indexing with Git branch support
- AutoDoc — automatic documentation generation

## Core Components

### ConductorOrchestrator

[→ src/agents/conductor-orchestrator.ts](../src/agents/conductor-orchestrator.ts) | [📖 AUTODOC](../src/agents/AUTODOC.md)

Central coordinator of all agents. Distributes tasks among specialized agents, manages their lifecycle, and provides backpressure under overload.

**Key methods:**
| Method | Line | Description |
|--------|------|-------------|
| `register()` | [:193](../src/agents/conductor-orchestrator.ts#L193) | Register an agent in the orchestrator |
| `processTask()` | [:164](../src/agents/conductor-orchestrator.ts#L164) | Delegate a task to an agent |
| `checkAgentHealth()` | [:276](../src/agents/conductor-orchestrator.ts#L276) | Monitor agent health status |

**Dependencies:**
- [KnowledgeBus](#knowledgebus) — pub/sub bus for inter-agent communication
- [ResourceManager](#resourcemanager) — memory/CPU limit management
- [DIContainer](#dicontainer) — Dependency Injection

### Agents

[📖 Full Agents AUTODOC](../src/agents/AUTODOC.md)

| Agent | File | Role | Details |
|-------|------|------|---------|
| **ParserAgent** | [→ parser-agent.ts](../src/agents/parser-agent.ts) | AST parsing through native parsers | 10 languages |
| **IndexerAgent** | [→ indexer-agent.ts](../src/agents/indexer-agent.ts) | Indexing into SQLite, batching | [→ indexer/](../src/agents/indexer/AUTODOC.md) |
| **SemanticAgent** | [→ semantic-agent.ts](../src/agents/semantic-agent.ts) | Embeddings, vector search | [→ semantic/](../src/agents/semantic/AUTODOC.md) |
| **QueryAgent** | [→ query-agent.ts](../src/agents/query-agent.ts) | Graph queries | hybrid search |
| **DoraAgent** | [→ dora-agent.ts](../src/agents/dora-agent.ts) | Metrics analysis | complexity |
| **DevAgent** | [→ dev-agent.ts](../src/agents/dev-agent.ts) | Incremental indexing | [→ dev/](../src/agents/dev/AUTODOC.md) |
| **MergeAgent** | [→ merge-agent.ts](../src/agents/merge-agent.ts) | Semantic merge | AI suggestions |

All agents inherit from `BaseAgent` ([→ base.ts:15](../src/agents/base.ts#L15)) with a unified lifecycle.

### KnowledgeBus

[→ knowledge-bus.ts](../src/core/knowledge-bus.ts) | [📖 Core AUTODOC](../src/core/AUTODOC.md)

Pub/sub bus for asynchronous communication between agents.

| Method | Line | Description |
|--------|------|-------------|
| `publish()` | [:53](../src/core/knowledge-bus.ts#L53) | Publish to a topic |
| `subscribe()` | [:93](../src/core/knowledge-bus.ts#L93) | Subscribe to a topic |

**Topics:**
- `entity:parsed` — ParserAgent → IndexerAgent, SemanticAgent
- `entity:modified` — DevAgent → SemanticAgent
- `index:completed` — IndexerAgent → SemanticAgent
- `semantic:embeddings:complete` — SemanticAgent → QueryAgent

### ResourceManager

[→ resource-manager.ts](../src/core/resource-manager.ts)

System resource management:
- Memory and CPU limits
- Backpressure under agent overload
- Dynamic concurrency tuning

### DIContainer

[→ di-container.ts](../src/core/di-container.ts)

Dependency Injection container:
- Singleton/Transient service lifetimes
- Circular dependency detection
- Type-safe agent resolution
- Automatic disposal on shutdown

### Storage Layer

[📖 Full Storage AUTODOC](../src/storage/AUTODOC.md)

| Component | File | Key Method |
|-----------|------|------------|
| **GraphStorageLibSQL** | [→ graph-storage-libsql.ts](../src/storage/graph-storage-libsql.ts) | [`setProject():92`](../src/storage/graph-storage-libsql.ts#L92), [`getAllRelationships():407`](../src/storage/graph-storage-libsql.ts#L407) |
| **LibSQLGraphAdapter** | ~~[→ libsql-graph-adapter.ts](../src/storage/libsql-graph-adapter.ts)~~ (deleted) | [→ libsql/](../src/storage/libsql/AUTODOC.md) |
| **VectorStore** | [→ vector-store.ts](../src/semantic/vector-store.ts) | cosine search |
| **BatchOperations** | [→ batch-operations-libsql.ts](../src/storage/batch-operations-libsql.ts) | batch INSERT |
| **CacheManager** | [→ cache-manager.ts](../src/storage/cache-manager.ts) | LRU cache |

### Branch Layers Storage

The system supports **layered storage** for working with Git branches:

```
main branch (base layer)
    │
    ├── feature/auth (layer 1)
    │       │
    │       └── feature/auth-oauth (layer 2)
    │
    └── feature/api (layer 1)
```

**How it works:**
- Each branch creates its own "layer" on top of the parent
- **Tombstones** — deletion markers: if an entity is deleted in a feature branch, it is marked as a tombstone rather than removed from the base layer
- **Inheritance**: queries aggregate data from all layers accounting for tombstones
- **CTE optimization**: `getAllRelationships()` uses Common Table Expressions for efficient querying

```sql
-- Example CTE for layered query
WITH RECURSIVE branch_chain AS (
  SELECT branch_id, parent_id FROM branches WHERE branch_id = ?
  UNION ALL
  SELECT b.branch_id, b.parent_id FROM branches b
  JOIN branch_chain bc ON b.branch_id = bc.parent_id
)
SELECT e.* FROM entities e
JOIN branch_chain bc ON e.branch_id = bc.branch_id
WHERE e.id NOT IN (SELECT entity_id FROM tombstones WHERE branch_id = ?)
```

### Semantic Layer

[📖 AUTODOC semantic agent](../src/agents/semantic/AUTODOC.md)

| Component | File | Description |
|-----------|------|-------------|
| **EmbeddingGenerator** | [→ embedding-generator.ts](../src/semantic/embedding-generator.ts) | Embedding generation |
| **HybridSearch** | [→ hybrid-search.ts](../src/semantic/hybrid-search.ts) | Vector + text search |
| **SmartChunker** | [→ smart-chunker.ts](../src/semantic/smart-chunker.ts) | AST-aware chunking |
| **VectorIndexManager** | [→ vector-index-manager.ts](../src/agents/semantic/vector-index-manager.ts) | FAISS indexes |

**Embedding providers** ([→ providers/](../src/semantic/providers/)):

| Provider | File | Speed | Device |
|----------|------|-------|--------|
| OVMS | [ovms-provider.ts](../src/semantic/providers/ovms-provider.ts) | 1000+ ch/s | CPU/GPU |
| TEI | [tei-provider.ts](../src/semantic/providers/tei-provider.ts) | 1000+ ch/s | GPU |
| Ollama | [ollama-provider.ts](../src/semantic/providers/ollama-provider.ts) | 100-300 ch/s | CPU/GPU |
| Transformers | ~~[transformers-provider.ts](../src/semantic/providers/transformers-provider.ts)~~ (deleted) | 200 ch/s | CPU |
| vLLM | ~~[vllm-provider.ts](../src/semantic/providers/vllm-provider.ts)~~ (deleted) | 500+ ch/s | GPU |

**AutoDoc Enrichment** ([→ autodoc/AUTODOC.md](../src/autodoc/AUTODOC.md)): Semantic search is enriched with documentation — results include descriptions from `.autodoc/` files.

### Parser Layer

[→ src/parsers/](../src/parsers/)

Support for 10 languages through native parsers:

| Language | Parser | Runtime |
|----------|--------|---------|
| TypeScript/JavaScript | TypeScript Compiler API | Node.js |
| Python | `ast` module + Pyright | Python 3.8+ |
| Java | JavaParser | JRE 11+ |
| Kotlin | kotlin-compiler-embeddable | JRE 11+ |
| Go | go/parser | Go 1.18+ |
| Rust | syn + rust-analyzer | Rust |
| C/C++ | clang -ast-dump | Clang |
| Swift | SwiftSyntax | Swift |
| C# | Roslyn | .NET |
| Bash | tree-sitter | Node.js |

## Data Flows

```
┌─────────────────────────────────────────────────────────────────────┐
│                         MCP Client Request                          │
└─────────────────────────────┬───────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      MCP Server (src/index.ts)                      │
│                    Tool routing & validation                        │
└─────────────────────────────┬───────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    ConductorOrchestrator                            │
│              Task delegation & agent coordination                   │
└───────┬─────────────┬─────────────┬─────────────┬───────────────────┘
        │             │             │             │
        ▼             ▼             ▼             ▼
   ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐
   │ Parser  │  │ Indexer │  │Semantic │  │  Query  │
   │  Agent  │  │  Agent  │  │  Agent  │  │  Agent  │
   └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘
        │             │             │             │
        └──────────────────┬────────┴─────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    SQLite Storage Layer                             │
│           GraphStorage + VectorStore (vectors.db)                   │
└─────────────────────────────────────────────────────────────────────┘
```

## Multi-Project Support

The server supports working with multiple projects simultaneously:

- Each project has an isolated index (separate database)
- Switching between projects via `setProject()`
- Cross-project search support via `semantic_search` with the `projectPath` parameter

## Module Structure

### src/
- **agents**: ~25 files — multi-agent system (conductor, workers, semantic)
- **analysis**: ~5 files — code analysis (chaos, complexity, hotspots)
- **autodoc**: ~15 files — auto-documentation (generator, llm, parser)
- **cli**: 1 file — CLI commands
- **config**: 3 files — configuration
- **core**: 8 files — system core (DI, Bus, Resource Manager)
- **cpu**: 1 file — CPU detection
- **diagrams**: 7 files — architecture diagram pipeline (IR, renderers, collector)
- **gpu**: 1 file — GPU detection and backends
- **layered**: 12 files — layered branch indexing
- **merge**: 3 files — semantic merge
- **modification**: 3 files — code modification
- **parsers**: 37 files — language parsers
- **query**: 4 files — graph queries
- **semantic**: 9 files — semantic layer
- **storage**: ~10 files — Native SQLite storage with branch layers
- **tools**: ~25 files — MCP tool handlers
- **types**: 11 files — TypeScript types
- **utils**: 15 files — utilities

## Key Decisions

| Decision | Rationale |
|----------|-----------|
| SQLite instead of PostgreSQL | Simplicity, no external dependencies, portability |
| Native parsers | Full typing, precise AST, no node-gyp issues |
| Multi-agent architecture | Separation of concerns, parallel processing |
| Pub/Sub via KnowledgeBus | Loose agent coupling, scalability |
| OVMS/TEI for embeddings | High-performance inference, 1000+ chunks/s |
| Subprocess pool with Map-tracking | Protection from race conditions during IPC, Bun/Node.js support |

## Agents Architecture

~~[→ docs/architecture/agents.md](../docs/architecture/agents.md)~~ (deleted)

The multi-agent system coordinates through `ConductorOrchestrator`, which manages task delegation, load distribution, and lifecycle management for all agents.

### Agent Details

**ParserAgent** -- Coordinates AST parsing through a worker pool. Scans files by language, manages `LanguageWorkerPool`, dispatches files to workers, and collects parse results. For batches larger than 50 files, parsing is delegated to the worker pool; smaller batches are parsed synchronously.

**IndexerAgent** -- Stores entities and relationships in the graph database. Performs batch inserts within transactions (chunks of 1000), manages relationships, handles file-level operations (delete, update), and supports incremental indexing. Publishes `indexer:complete` events via KnowledgeBus.

**SemanticAgent** -- Manages the vector store and semantic search. Loads dump files into FAISS, performs cosine similarity search, hybrid search (vector + keyword), and code clone detection. Importantly, SemanticAgent does NOT generate embeddings directly -- workers generate them and write to dump files. The main process only loads the pre-generated vectors.

**QueryAgent** -- Executes queries against the graph database. Supports entity queries (by name, type, path), relationship traversal, call graph analysis, and impact analysis.

**DevAgent** -- Handles development operations and file watching. Detects file changes with debounce (300ms), triggers incremental re-indexing through ParserAgent and IndexerAgent, manages code modifications, and handles snapshot management.

**DoraAgent** -- Specialized metrics analysis agent for cyclomatic complexity, cognitive complexity, code hotspots, and coupling analysis.

### Agent Communication

Agents communicate through the KnowledgeBus pub/sub system:

| Event | Publisher | Subscribers | Data |
|-------|-----------|-------------|------|
| `indexer:complete` | IndexerAgent | SemanticAgent | `{ files, entities }` |
| `semantic:embeddings:complete` | SemanticAgent | DevAgent | `{ generated, skipped }` |
| `parser:files:parsed` | ParserAgent | IndexerAgent | `{ results }` |
| `git:branch:changed` | GitWatcher | IndexerAgent | `{ branch, files }` |
| `git:files:changed` | GitWatcher | DevAgent | `{ files }` |

### Resource Management and Backpressure

The `ResourceManager` provides centralized resource management with memory and CPU limits. When agents are overloaded, they return `AgentBusyError` with `retryAfterMs` hints, implementing a backpressure mechanism.

### Dependency Injection

Agents are managed through the `DIContainer` with automatic registration via `AgentRegistry`. Agents use lazy initialization -- they are created only on first request. The container supports singleton/transient lifetimes and circular dependency detection.

### Agent Lifecycle

```
1. Server Start
   -> DIContainer.initialize()
   -> ConductorOrchestrator.start()
   -> AgentRegistry.registerAll()

2. Index Request
   -> ParserAgent.parse() -> spawn workers
   -> Workers: parse + generate embeddings -> dump files
   -> IndexerAgent.storeEntities()
   -> SemanticAgent.generateEmbeddingsFromStorage() -> load dumps

3. Search Request
   -> QueryAgent.query() (graph search)
   -> SemanticAgent.search() (vector search)
   -> Merge results

4. File Change
   -> GitWatcher.onFileChange()
   -> DevAgent.handleFileChange()
   -> Incremental re-index

5. Server Shutdown
   -> ConductorOrchestrator.stop()
   -> Workers.terminate()
   -> DIContainer.dispose()
```

## Embedding Pipeline

~~[→ docs/architecture/embedding-pipeline.md](../docs/architecture/embedding-pipeline.md)~~ (deleted)

### Centralized Architecture (v2.6+)

Workers send texts to the Main process via IPC. The Main process generates embeddings centrally with optimal batching and no HTTP contention. This architecture provides:

- A single batch stream to the embedding API (vLLM/OVMS/OpenAI) instead of N workers competing
- Optimal batching -- Main collects more texts before sending
- Better rate limiting -- Main controls concurrency
- No HTTP connection contention between workers
- **8x speedup** in parsing (16 to 130+ files/sec for TypeScript)

### Worker Embedding Flow

1. **Receive task** -- Worker receives a batch of files with language type
2. **Parse file** -- `UnifiedParser.parse()` extracts entities from source code
3. **Filter entity types** -- Only high-value types get embeddings (class, function, interface, type, enum). Low-value types (import, export, module, constant, variable) and duplicates (method, property in classes) are excluded
4. **Local deduplication** -- Worker maintains a `generatedEntityIds` Set to prevent duplicate embedding generation
5. **Build embedding text** -- Constructs text from entity name, type, signature, code snippet (truncated to model context), documentation, and return type
6. **Send texts to Main** -- Every 10 files, collected texts are sent to Main via IPC (`embeddings.texts` message)
7. **Continue parsing** -- Worker continues while Main generates embeddings in parallel via the `EmbeddingAccumulator`
8. **Final flush** -- At end of batch, remaining texts are sent to Main

### Two-Level Deduplication

- **Level 1 (Worker Local)**: Per-worker `generatedEntityIds` Set prevents duplicate HTTP calls to the embedding service
- **Level 2 (FAISS Global)**: The `FaissProvider.idMap` prevents duplicate vectors in the HNSW index during `loadFromDumpFiles()`

### Performance (Centralized Mode)

| Metric | Decentralized | Centralized |
|--------|--------------|-------------|
| Files/sec (TypeScript) | 16 | 130-140 |
| Total time (523 files) | 7.8s | 3.1s |
| HTTP contention | High (6 workers to vLLM) | None (Main to vLLM) |

Embedding API throughput: vLLM GPU ~8,000 emb/s, OVMS CPU ~1,000 emb/s, OpenAI ~500 emb/s.

## Layered Indexing

~~[→ docs/architecture/layered-indexing.md](../docs/architecture/layered-indexing.md)~~ (deleted)

### Three-Layer Architecture

The layered indexing system provides efficient branch-aware storage with incremental updates, adapted from the ultrasharp-tools-mcp (.NET) implementation.

```
Layer 0: Base Index (main branch, shared, read-only)
  - Code entities & relationships (shared)
  - Vector embeddings (base, shared)
  - SQLite storage (persistent)

Layer 1: Branch Deltas (per-branch, shared, mostly read-only)
  - Added/Modified/Deleted entities
  - Vector delta embeddings
  - SQLite per-branch cache

Layer 2: Working Directory (per-client, mutable) [FUTURE]
  - Uncommitted changes (not yet indexed)
  - Vector working delta
  - In-memory only (optional persistence)
```

### Query Composition

Queries aggregate data across all layers:

```
Entity search:
  Result = Layer0.query(pattern)
         + Layer1.applyDelta(branch)
         + Layer2.applyDelta(clientId)   // FUTURE
         - DeletedEntities

Vector search:
  VectorResult = Layer0.searchVectors(queryEmbedding, topK)
               + Layer1.searchVectors(branch, queryEmbedding)
               + Layer2.searchVectors(clientId, queryEmbedding)  // FUTURE
               - DeletedVectors
```

### Implementation Components

| Component | File | Purpose |
|-----------|------|---------|
| `BranchDelta` | `src/layered/branch-delta.ts` | Entity delta management (added/modified/deleted) |
| `LayeredGraphIndex` | `src/layered/layered-graph-index.ts` | Two-level query system (Base + Branch) |
| `GitDeltaComputer` | `src/layered/git-delta-computer.ts` | Git diff integration for computing deltas |
| `LayeredCacheManager` | `src/layered/layered-cache-manager.ts` | SQLite persistence for entity deltas |
| `IncrementalUpdateQueue` | `src/layered/incremental-update-queue.ts` | Batching queue with debounce (300ms) |
| `FileChangeIntegration` | `src/layered/file-change-integration.ts` | GitWatcher integration |
| `VectorDelta` | `src/layered/vector-delta.ts` | Vector embedding delta management |
| `LayeredVectorStore` | `src/layered/layered-vector-store.ts` | Layered semantic search |
| `VectorCacheManager` | `src/layered/vector-cache-manager.ts` | SQLite persistence for vector deltas |
| `DeltaMaintenanceService` | `src/layered/delta-maintenance-service.ts` | Compaction and cleanup |
| `LayeredIndexManager` | `src/layered/layered-index-manager.ts` | Main facade |

### Persistence

- Entity deltas stored in `.ultracode/layered/deltas.db`
- Vector deltas stored in `.ultracode/layered/vector-deltas.db`
- JSON serialization for Maps/Sets, binary BLOB for vector embeddings (Float32Array)

### Optimizations

- LRU cache for branch deltas (default: 10 branches)
- File change batching with 300ms debounce
- Automatic compaction of large deltas (threshold: 1000 changes)
- Background maintenance (cleanup, vacuum) every hour
- Adaptive vector backend selection: <10K files uses in-memory fallback, 10K-50K uses sqlite-vec, >50K uses vectorlite

### Performance Targets

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Branch switch | Full rebuild (~10-30s) | Load delta (<100ms) | 100-300x faster |
| Incremental update (1 file) | Full rebuild (~10-30s) | 100-500ms | 20-300x faster |
| Memory (10 branches) | 10x full index | Base + 10 deltas | ~60-80% reduction |
| Disk space (10 branches) | 10x full DB | Base + 10 small deltas | ~70-85% reduction |

## Prolly Tree (Versioned Graph Storage)

~~[→ docs/architecture/prolly-tree.md](../docs/architecture/prolly-tree.md)~~ (deleted)

### Overview

Prolly Tree (Probabilistic B-Tree) provides graph versioning with efficient diff between versions. It enables:

- **Fast startup** -- root hash verification instead of full scan
- **O(log n) branch sync** -- efficient diff instead of tombstone queries
- **Time travel** -- queries to historical graph states
- **Deduplication** -- structural sharing between versions (same unchanged subtrees are stored once)

### Components

| Component | File | Purpose |
|-----------|------|---------|
| `ProllyNodeStore` | `src/storage/prolly/node-store.ts` | Content-addressed storage for tree nodes (xxHash64) |
| `ProllyTree` | `src/storage/prolly/prolly-tree.ts` | B-tree with probabilistic chunking |
| `CommitManager` | `src/storage/prolly/commit-manager.ts` | Graph version management |
| `BranchDiffCache` | `src/storage/prolly/branch-diff-cache.ts` | O(1) branch diff checks |
| `TimeTravelManager` | `src/storage/prolly/time-travel.ts` | Historical state queries |

### Diff Algorithm (O(log n))

The diff algorithm compares two tree roots recursively. If hashes are equal, subtrees are identical and skipped entirely. Only nodes on the path to changed leaves are traversed, yielding O(k log n) performance where k is the number of changes.

### Structural Sharing

When one entity changes, only nodes on the path from leaf to root are created as new nodes. All other nodes are reused across commits, providing significant storage deduplication.

### Performance

| Operation | Complexity | Description |
|-----------|------------|-------------|
| Build tree | O(n log n) | Build from n entities |
| Get by key | O(log n) | Find single entity |
| Insert/Delete | O(log n) | Create new version |
| Diff | O(k log n) | k = number of changes |
| Branch check | O(1) | Via BranchDiffCache |

### Storage Overhead

- ~10 bytes per entity for prolly nodes
- ~200 bytes per commit
- For 100K entities: ~10 MB prolly nodes + 200 KB for 1000 commits

### MCP Tools Integration

- `list_commits` -- list graph version snapshots
- `get_entity_history` -- entity change history across commits
- `diff_commits` -- compare two graph versions
- `checkout_commit` -- time travel to view graph at a specific commit

## Roslyn Addon

~~[→ docs/architecture/roslyn-addon.md](../docs/architecture/roslyn-addon.md)~~ (deleted)

### Overview

Ultrasharp.Addon is a lightweight C# daemon process that provides Roslyn capabilities to the TypeScript process via Named Pipe IPC. TypeScript owns storage/embeddings/MCP; C# owns parsing/analysis/validation. Requires .NET 10+ Runtime.

### Architecture

```
ultracode (TypeScript Main Process)
  |
  |-- RoslynAddonClient (src/addons/roslyn-client.ts)
  |     Spawn: dotnet exec Ultrasharp.Addon.dll --pipe <name>
  |     Binary framing: [4 bytes BE length][JSON payload UTF-8]
  |     Phase tracking, auto-restart (max 3), event handling
  |
  | Named Pipe IPC: \\.\pipe\UltraCode_Roslyn_<uuid>
  |
  v
Ultrasharp.Addon (C# / .NET 10)
  Phase 1 (instant):    PipeServer ready, syntax parsing available
  Phase 2 (5-30s):      Solution loaded, semantic analysis available
  Phase 3 (background): Continuous validation with debounce
```

### Phased Initialization

| Phase | When | Available Methods | RAM |
|-------|------|-------------------|-----|
| **1** | Instant (~1s) | `parse`, `parseBatch`, `status` | ~50 MB |
| **2** | Background (5-30s) | All Phase 1 + `findReferences`, `getDefinition`, `getCallGraph`, `traceFlow`, `traceBackwards`, `enrich`, `validate`, `modifyCode`, `renameSymbol`, `applyCodeFix`, `formatCode` | ~300-500 MB |
| **3** | Continuous | Background validation with debounce (500ms) | Same |

### IPC Protocol

Binary framing compatible with `src/shared/ipc-protocol.ts`: 4 bytes Big Endian payload length followed by JSON payload in UTF-8. Supports request/response and push events (e.g., `phaseChanged`).

### Available Methods (Phase 2 -- Semantic)

| Method | Description |
|--------|-------------|
| `loadSolution` | Load .sln file |
| `findReferences` | Find all references to a symbol |
| `getDefinition` | Get definition source code |
| `getCallGraph` | Callers and/or callees |
| `getImplementations` | Find interface/abstract implementations |
| `traceFlow` | Forward execution trace |
| `traceBackwards` | Reverse trace from crash point |
| `enrich` / `enrichBatch` | Resolve FQN, base types via SemanticModel |
| `validate` | Get diagnostics (compiler + analyzer) |
| `modifyCode` | Find-and-replace in workspace |
| `renameSymbol` | Rename across solution |
| `applyCodeFix` | Auto-fix diagnostics |
| `formatCode` | Code formatting |

### Lifecycle and Process Management

- **Startup**: TS spawns the addon with `dotnet exec`, addon creates NamedPipeServerStream, TS connects, Phase 1 is ready immediately, Phase 2 loads in background
- **Auto-restart**: If the addon crashes, TS restarts up to 3 times with 2-second delays
- **Orphan detection**: Addon monitors parent PID every 3 seconds and self-terminates if the parent dies
- **Shutdown**: Client calls `shutdown()` destroying the socket and killing the process

### Addon Discovery

TS searches for `Ultrasharp.Addon.dll` in this order:
1. `dist/roslyn-addon/Ultrasharp.Addon.dll` (next to index.js)
2. `external-libs/roslyn-addon/Ultrasharp.Addon.dll` (dev)
3. `../ultrasharp-tools-mcp/Run.Publish/Addon/Ultrasharp.Addon.dll` (dev, sibling repo)
4. `../ultrasharp-tools-mcp/Run.Publish/Droid/Addon/Ultrasharp.Addon.dll` (bundled with Droid)

If the DLL is not found, the addon does not start, and C# parsing is unavailable (graceful degradation).

### Memory Profile

| State | Addon Processes | RAM (addon) |
|-------|----------------|-------------|
| 1 active solution | 1 | 300-500 MB |
| Solution idle (5 min) | 0 | 0 MB |
| Addon not found | 0 | 0 MB |

## Architecture Diagram Pipeline

[→ src/diagrams/](../src/diagrams/) | [📖 AUTODOC](../src/diagrams/AUTODOC.md) | [📖 Tool docs](.autodoc/features/diagrams.md)

The diagram module generates visual architecture representations from the code graph in Mermaid, Graphviz DOT, and D2 formats.

### Pipeline

```
GraphStorage (entities + relationships)
    │
    ▼
SchemaCollector (BFS + enrichment)
    │  Phase 1: Structural BFS via CONTAINS
    │  Phase 2: Inter-node edges with relationship lifting
    │  Phase 3: Data flow via TraceEngine.getBatchNodeContext()
    │  Phase 4: Field mapping via regex (L3)
    │
    ▼
DiagramIR (format-agnostic)
    │
    ├── MermaidRenderer  → flowchart / classDiagram
    ├── GraphvizRenderer → digraph DOT (record shapes, clusters)
    └── D2Renderer       → D2 language (native nesting)
```

### Components

| Component | File | Purpose |
|-----------|------|---------|
| **DiagramIR** | [→ diagram-ir.ts](../src/diagrams/diagram-ir.ts) | Format-agnostic types: nodes, edges, groups, data annotations |
| **SchemaCollector** | [→ schema-collector.ts](../src/diagrams/schema-collector.ts) | BFS graph traversal, data flow enrichment, LRU caching |
| **FieldMapper** | [→ field-mapper.ts](../src/diagrams/field-mapper.ts) | Regex source code analysis for field-level mapping (L3) |
| **MermaidRenderer** | [→ mermaid-renderer.ts](../src/diagrams/renderers/mermaid-renderer.ts) | Mermaid flowchart + classDiagram |
| **GraphvizRenderer** | [→ graphviz-renderer.ts](../src/diagrams/renderers/graphviz-renderer.ts) | Graphviz DOT with record shapes |
| **D2Renderer** | [→ d2-renderer.ts](../src/diagrams/renderers/d2-renderer.ts) | D2 with native nesting |
| **DiagramToolHandler** | [→ diagram-tool-handler.ts](../src/tools/handlers/diagram-tool-handler.ts) | MCP tool handler |

### Data Flow Levels

| Level | Enrichment | SQL Queries |
|-------|-----------|-------------|
| **0** | Structure only | 0 extra |
| **1** | Basic types + conditional hints | +2 (entities batch + relationships) |
| **2** | L1 + dashed edges for conditionals | +2 (same as L1) |
| **3** | L2 + field mapping via source regex | +2 + file reads |

### Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| Own BFS, not `getSubgraph()` | `getSubgraph` follows ALL relationship types, pulling in too many unrelated nodes |
| Relationship lifting | At depth=2, CALLS exist between methods (depth=3), not classes — lifting makes class-level diagrams useful |
| `getBatchNodeContext()` (2 SQL) | Avoids N+1 query pattern for data flow enrichment |
| DiagramIR as intermediate | One collection pass serves all 3 renderers; enables LRU caching |
| Source entity filtering | Excludes scripts/, tests/, generated/, docs/ to show only architectural code |

### Performance

- Max 500 nodes, 1000 edges per diagram
- 10-second timeout via `context.withTimeout()`
- LRU cache: TTL 5min, max 20 entries — repeat calls <200ms
- Typical first-call latency: 1-2 seconds

## Related Documents

- [→ PROCESSES.md](./PROCESSES.md) — technical processes
- [→ DEPENDENCIES.md](./DEPENDENCIES.md) — dependencies
- [→ DEPLOYMENT.md](./DEPLOYMENT.md) — build and deployment
- [→ GLOSSARY.md](./GLOSSARY.md) — terms and definitions
