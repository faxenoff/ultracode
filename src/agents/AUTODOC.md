---
module_name: agents
description: Multi-agent system for task orchestration, parsing, indexing, semantic analysis, and query processing
status: active
language: TypeScript
entry_point: conductor-orchestrator.ts
exports:
  - BaseAgent
  - ConductorOrchestrator
  - CoordinatorAgent
  - DevAgent
  - DoraAgent
  - IndexerAgent
  - MergeAgent
  - ParserAgent
  - QueryAgent
  - SemanticAgent
  - ResourceAdjustmentMixin
  - devAgent
  - doraAgent
dependencies:
  - node:events
  - node:crypto
  - nanoid
  - p-limit
  - src/logging
  - src/types
  - src/config
  - src/core/knowledge-bus
  - src/storage
  - src/semantic
  - src/merge
tags: [agents, orchestration, indexing, parsing, semantic, event-driven, task-queue]
---

# agents

## Overview

EventEmitter-based multi-agent architecture for code indexing, parsing, semantic analysis, and graph queries. Eight specialized agent types inherit from `BaseAgent` with async task queues, backpressure control, and FIFO processing. `ConductorOrchestrator` manages agent lifecycle, health monitoring, and task delegation based on complexity analysis. Supports both Bun and Node.js runtimes with KnowledgeBus integration for event-driven communication.

## Submodules

| Submodule | Description |
|-----------|-------------|
| [conductor/](./conductor/AUTODOC.md) | Task orchestration, complexity analysis, method proposals |
| [dev/](./dev/AUTODOC.md) | File collection, extension classification, heuristic parsing |
| [indexer/](./indexer/AUTODOC.md) | Entity resolution, relationship building, git event handlers |
| [semantic/](./semantic/AUTODOC.md) | Cache warmup, embedding processing, vector index management |
| [workers/](./workers/AUTODOC.md) | Worker pools, subprocess management, language detection |
| [strategies/](./strategies/AUTODOC.md) | Delegation strategy for task routing |

## Data Flow

### Inputs

| Source | Type | Description |
|--------|------|-------------|
| MCP tool calls | `AgentTask` | Tasks routed via ConductorOrchestrator |
| Git events | branch/file changes | Triggers incremental reindexing via KnowledgeBus |
| YAML config | `ConductorConfig` | Per-agent concurrency, memory, priority settings |

### Processing

| Step | Component | Description |
|------|-----------|-------------|
| 1. Accept | `ConductorOrchestrator` | Task complexity analysis (1-10 scale) |
| 2. Route | `CoordinatorAgent` | Least-loaded / round-robin / priority selection |
| 3. Queue | `BaseAgent.enqueue()` | FIFO async queue with maxQueueSize backpressure |
| 4. Execute | Agent-specific `processTask()` | Parsing, indexing, embedding, querying |
| 5. Emit | EventEmitter | `task:completed` or `task:failed` events |

### Outputs

| Target | Type | Description |
|--------|------|-------------|
| GraphStorage | Entities, Relationships | Indexed code graph via IndexerAgent |
| VectorStore | Embeddings | Semantic vectors via SemanticAgent |
| KnowledgeBus | Events | PARSE_COMPLETE, FILE_CHANGED, CACHE_UPDATED |
| Caller | `Promise<unknown>` | Task result or AgentBusyError |

## Public API

| Export | Type | Description | Location |
|--------|------|-------------|----------|
| `BaseAgent` | abstract class | Task queue, EventEmitter, Agent interface | [`base.ts:27-394`](./base.ts) |
| `ConductorOrchestrator` | class | Agent lifecycle, health, delegation | [`conductor-orchestrator.ts:41-458`](./conductor-orchestrator.ts) |
| `CoordinatorAgent` | class | Load balancer, AgentPool impl | [`coordinator.ts:146-436`](./coordinator.ts) |
| `DevAgent` | class | Code indexing, delegates to Parser/Indexer | [`dev-agent.ts:87-1816`](./dev-agent.ts) |
| `DoraAgent` | class | Research and exploration tasks | [`dora-agent.ts:46-254`](./dora-agent.ts) |
| `IndexerAgent` | class | Graph indexing, git events, branch-aware | [`indexer-agent.ts:105-105`](./indexer-agent.ts) |
| `MergeAgent` | class | 3-way semantic merge, AI conflict resolution | [`merge-agent.ts:63-441`](./merge-agent.ts) |
| `ParserAgent` | class | Multi-language parsing via tree-sitter/Roslyn | [`parser-agent.ts:490-1865`](./parser-agent.ts) |
| `QueryAgent` | class | Graph queries, impact analysis, hotspots | [`query-agent.ts:35-217`](./query-agent.ts) |
| `SemanticAgent` | class | Embeddings, hybrid search, code analysis | [`semantic-agent.ts:147-1797`](./semantic-agent.ts) |
| `ResourceAdjustmentMixin` | class | Dynamic resource adjustment mixin | [`resource-adjustment-mixin.ts:19-43`](./resource-adjustment-mixin.ts) |
| `ResourceAdjustmentCapable` | interface | Marker for adjustable agents | [`resource-adjustment-mixin.ts:10-17`](./resource-adjustment-mixin.ts) |
| `isEventfulAgent` | function | Type guard for EventEmitter agents | [`coordinator.ts:67-74`](./coordinator.ts) |
| `devAgent` | singleton | Global DevAgent instance | [`dev-agent.ts:1819-1819`](./dev-agent.ts) |
| `doraAgent` | singleton | Global DoraAgent instance | [`dora-agent.ts:257-257`](./dora-agent.ts) |

## Dependencies

### Internal

| Module | Usage |
|--------|-------|
| `src/logging` | Structured logging: log.i(), log.e(), log.d(), log.t(), log.w() |
| `src/types/agent.ts` | AgentType, AgentStatus, Agent, AgentTask, AgentPool |
| `src/types/errors.ts` | AgentBusyError, AgentBusyDetails |
| `src/types/parser.ts` | ParsedEntity, EntityRelationship, ParseResult |
| `src/types/storage.ts` | GraphStorage, Entity, Relationship, EntityType |
| `src/config/yaml-config.ts` | getConfig(), ConfigLoader.getInstance() |
| `src/core/knowledge-bus.ts` | knowledgeBus.subscribe(), publish() |
| `src/core/branch-manager.ts` | BranchManager for git branch tracking |
| `src/storage/graph-storage-factory.ts` | getGraphStorage(), DatabaseCorruptionError |
| `src/utils/circuit-breaker.ts` | CircuitBreaker for SemanticAgent |
| `src/semantic/` | EmbeddingGenerator, VectorStore, HybridSearchEngine |
| `src/merge/` | ThreeWayMerger, AIConflictResolver, GitIntegration |

### External

| Package | Usage |
|---------|-------|
| `node:events` | EventEmitter base for all agents |
| `node:crypto` | randomUUID() for task/agent IDs |
| `node:fs` | readFileSync, statSync for file operations |
| `nanoid` | Short unique IDs |
| `p-limit` | Concurrency limiter in QueryAgent |

## Configuration

| Key | Default | Description |
|-----|---------|-------------|
| `conductor.maxConcurrency` | 100 | Max concurrent tasks for orchestrator |
| `conductor.complexity.threshold` | 8 | Score triggering mandatory delegation |
| `conductor.loadBalancingStrategy` | `least-loaded` | `least-loaded`, `round-robin`, `priority` |
| `devAgent.maxConcurrency` | 3 | DevAgent parallel task limit |
| `indexer.maxConcurrency` | 8 | IndexerAgent parallel task limit |
| `indexer.batchSize` | 1000 | Entities per indexing batch |
| `semanticAgent.maxConcurrency` | 5 | SemanticAgent parallel task limit |
| `semanticAgent.batchSize` | 8 | Embeddings per generation batch |
| `queryAgent.maxConcurrency` | 10 | QueryAgent parallel task limit |
| `parser.agent.workerPoolSize` | 8 | Tree-sitter worker pool size |
| `git.debounceMs` | 60000 | Embedding generation debounce after git events |

## Behavioral Properties

- **Task Queue**: Dual mode -- `process()` for immediate execution, `enqueue()` for async FIFO with backpressure (maxQueueSize=1000).
- **Health Monitoring**: Heartbeat every 10s, health check every 30s, stale agent detection at 60s idle.
- **Load Balancing**: Least-loaded (default), round-robin, or priority-based agent selection.
- **Delegation**: Tasks scored 1-10; threshold (default 8) triggers mandatory delegation to sub-agents.
- **Batch Indexing**: Flushes every 200 files (BATCH_FLUSH_THRESHOLD), idle flush after 10s of inactivity.
- **Two-Phase Embedding**: SemanticAgent dumps to disk then inserts to DB (Bun+OpenVINO workaround).
- **Circuit Breaker**: SemanticAgent uses CircuitBreaker to prevent cascading embedding failures.
- **Semantic Merge**: Fast-path hash matching (90%+), semantic matching for refactored code, AI conflict resolution.
- **Singletons**: devAgent, doraAgent, ConfigLoader, GraphStorage, GlobalEmbeddingCache persist across sessions.
- **Bun Compatibility**: Async loops replace setInterval; memory monitoring disabled for OpenVINO safety.

## Error Handling

| Error | Source | Recovery |
|-------|--------|----------|
| `AgentBusyError` | BaseAgent.process() | Retry after `retryAfterMs`; includes queue/memory details |
| Task execution errors | Agent-specific processTask() | Emitted via `task:failed`; propagated to caller |
| Parser init failure | DevAgent | Graceful degradation to heuristic parser (warning logged) |
| Indexer init failure | DevAgent | Fatal; throws with error log |
| `DatabaseCorruptionError` | IndexerAgent | Handled by `handleDatabaseCorruption()` |
| Embedding failures | SemanticAgent | Circuit breaker prevents cascading; auto-recovery |
| Queue full | BaseAgent.enqueue() | AgentBusyError with backpressure signal |

## Observability

| Category | Mechanism | Details |
|----------|-----------|---------|
| Logging | `log.{d,t,i,w,e}(category, code, data)` | Categories: BASEAGENT, CONDUCTOR, DEVAGENT, INDEXER, SEMANTIC, MERGE |
| Metrics | `getMetrics(): AgentMetrics` | tasksProcessed, tasksSucceeded, tasksFailed, avgProcessingTime |
| Events | EventEmitter | `task:completed`, `task:failed`, `agent:registered`, `heartbeat` |
| KnowledgeBus | publish/subscribe | PARSE_COMPLETE, FILE_CHANGED, CACHE_UPDATED topics |
| Query metrics | `QueryAgent.getQueryMetrics()` | totalQueries, avgQueryTime, cacheHitRate |
| Conductor metrics | `performanceMetrics` | totalTasks, avgProcessingTime, overheadReduction, cacheHitRate |

## Known Limitations

1. **Memory monitoring disabled** -- Bun+OpenVINO crash workaround; limits advisory only.
2. **CPU usage estimated** -- Reports 50% when BUSY, 5% when IDLE; no actual process tracking.
3. **Parser optional** -- web-tree-sitter ESM issues; falls back to heuristic parser losing AST detail.
4. **OpenVINO concurrency** -- Mutex prevents concurrent native calls; two-phase mode has perf impact.
5. **Branch LRU eviction** -- maxTotalBranches=50; oldest branches evicted, losing historical index data.
6. **setInterval disabled for Bun** -- Async loops used; not available during startup crashes.
7. **Bypass detection heuristic** -- `isDirectImplementation()` may not catch all delegation bypass attempts.

## TypeScript Notes

### Event Map

| Event | Emitter | Payload |
|-------|---------|---------|
| `task:completed` | BaseAgent | `{ agentId, task }` |
| `task:failed` | BaseAgent | `{ agentId, task, error }` |
| `agent:registered` | ConductorOrchestrator | `agentId: string` |
| `agent:unhealthy` | ConductorOrchestrator | `agentId: string` |
| `heartbeat` | ConductorOrchestrator | `{ agentId, status, timestamp }` |
| `task:routed:completed` | CoordinatorAgent | `taskData` |
| `task:routed:failed` | CoordinatorAgent | `taskData` |

### Module Boundary

- `Agent` interface from `src/types/agent.ts` defines the contract all agents implement.
- `AgentPool` interface implemented by `CoordinatorAgent` for agent registration and routing.
- `ResourceAdjustmentCapable` interface marks agents supporting dynamic concurrency/batch adjustment.
- `isEventfulAgent()` type guard narrows `Agent` to agents with `.on()` for event subscription.
- `AgentType` enum: COORDINATOR, DEV, DORA, INDEXER, MERGE, PARSER, QUERY, SEMANTIC.
- `AgentStatus` enum: IDLE, BUSY, ERROR, SHUTDOWN.

## Files

| File | Lines | Description |
|------|-------|-------------|
| [`base.ts`](./base.ts) | 394 | Abstract base class; task queue, async processing, EventEmitter |
| [`conductor-orchestrator.ts`](./conductor-orchestrator.ts) | 458 | Central orchestrator; agent lifecycle, health, delegation |
| [`coordinator.ts`](./coordinator.ts) | 436 | Load balancer and fallback agent; implements AgentPool |
| [`dev-agent.ts`](./dev-agent.ts) | 1819 | Code indexing; delegates to Parser and Indexer agents |
| [`dora-agent.ts`](./dora-agent.ts) | 257 | Research and exploration tasks |
| [`indexer-agent.ts`](./indexer-agent.ts) | 1557 | Graph indexing; relationships, entity resolution, git events |
| [`merge-agent.ts`](./merge-agent.ts) | 441 | Semantic 3-way merge; conflict resolution |
| [`parser-agent.ts`](./parser-agent.ts) | 1865 | Multi-language parsing; tree-sitter, Roslyn, workers |
| [`query-agent.ts`](./query-agent.ts) | 348 | Graph queries; impact analysis, hotspots, cycles |
| [`resource-adjustment-mixin.ts`](./resource-adjustment-mixin.ts) | 68 | Dynamic resource adjustment; Template Method pattern |
| [`semantic-agent.ts`](./semantic-agent.ts) | 2172 | Embeddings, hybrid search, code analysis, caching |
