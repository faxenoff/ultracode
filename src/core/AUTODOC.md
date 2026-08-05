---
module_name: core
description: "System foundation providing DI, pub/sub messaging, resource monitoring, Git-aware indexing, and multi-client isolation"
status: active
language: typescript
entry_point: null
exports: [KnowledgeBus, DIContainer, GitWatcher, ResourceManager, BranchManager, FileWatcher, ClientSession, ServiceContainer, registerAllAgents, performGlobalShutdown]
dependencies: [logging, types, storage, shared, agents, semantic, analysis, modification, autodoc, config, utils, search]
tags: [dependency-injection, event-driven, state-management, resource-monitoring, git-aware, multi-client, async-first]
---

# Core

> The architectural foundation of UltraCode, providing dependency injection, inter-component pub/sub messaging, adaptive resource monitoring, Git-aware branch management, and multi-client session isolation.

## Overview

The `core` module is the system's backbone, coordinating all major subsystems. It manages object lifecycles through a DI container with circular dependency detection, enables decoupled communication via a Bloom-filter-optimized knowledge bus, and monitors CPU/memory pressure with adaptive throttling. Git-aware indexing tracks branch switches and file changes with debouncing and bulk-mode detection. Multi-client isolation (pipe mode) is handled through per-client sessions, while graceful shutdown ensures proper cleanup of all resources.

## Data Flow

### Inputs

| Source | Data | Type |
|--------|------|------|
| Git repository | Branch changes, file diffs | `BranchChangeCallback`, `FileChange[]` |
| OS metrics | CPU load, memory usage | `os.loadavg()`, `os.freemem()` |
| Agent requests | Service resolution, resource allocation | `DIContainer.resolve()`, `ResourceManager.requestAllocation()` |
| Client connections | Session config, project paths | `ClientSessionConfig` |

### Processing

1. **Environment setup** -- `checkQuietMode()` and `createSafeEnvironment()` configure console output and env vars
2. **Service container init** -- `initServiceContainer()` lazily registers VersionManager, CodeModifier, PatternSearch, etc.
3. **Agent registration** -- `registerAllAgents()` imports 7 agent types with lazy factory patterns
4. **Git watching** -- `GitWatcher` polls `.git/HEAD` for branch changes and debounces file changes (60s window, 1000-file bulk threshold)
5. **Resource monitoring** -- `ResourceManager` captures snapshots every 2s (adaptive 1-10s), emits throttle/critical events at >80% pressure
6. **Knowledge distribution** -- `KnowledgeBus` routes topic-based messages with Bloom filter fast-path and TTL expiry
7. **Shutdown orchestration** -- `performGlobalShutdown()` disposes conductor, index manager, FAISS, GPU client, then DI container in reverse order

### Outputs

| Target | Data | Type |
|--------|------|------|
| Agents | Resolved instances, messages | `Agent`, `KnowledgeEntry` |
| Indexing pipeline | Changed file lists, branch metadata | `FileChange[]`, `BranchMetadata` |
| MCP transport | Pipe/socket streams | `PipeTransport` |
| System | Throttle signals, shutdown | Events via `EventEmitter` |

## Public API

| Export | Type | Description | Location |
|--------|------|-------------|----------|
| `KnowledgeBus` | Class | Pub/sub engine with Bloom filter and TTL support | [`knowledge-bus.ts:29-331`](./knowledge-bus.ts) |
| `knowledgeBus` | Instance | Singleton knowledge bus | [`knowledge-bus.ts:334-334`](./knowledge-bus.ts) |
| `DIContainer` | Class | DI with circular dependency detection | [`di-container.ts:73-379`](./di-container.ts) |
| `getGlobalContainer()` | Function | Get or create the global DI container | [`di-container.ts:443-448`](./di-container.ts) |
| `GitWatcher` | Class | Git branch and commit change detection with debounce | [`git-watcher.ts:71-739`](./git-watcher.ts) |
| `ResourceManager` | Class | Adaptive CPU/memory monitoring and allocation | [`resource-manager.ts:45-456`](./resource-manager.ts) |
| `resourceManager` | Instance | Singleton resource manager | [`resource-manager.ts:459-459`](./resource-manager.ts) |
| `BranchManager` | Class | Per-branch database paths and LRU eviction | [`branch-manager.ts:85-448`](./branch-manager.ts) |
| `FileWatcher` | Class | Debounced file change detection (Bun/Node) | [`file-watcher.ts:57-390`](./file-watcher.ts) |
| `ClientSession` | Class | Per-client state isolation for pipe mode | [`client-session.ts:59-276`](./client-session.ts) |
| `ServiceContainer` | Class | Lazy service initialization container | [`service-container.ts:48-419`](./service-container.ts) |
| `registerAllAgents()` | Function | Register 7 agent types into DI container | [`agent-registry.ts:22-96`](./agent-registry.ts) |
| `performGlobalShutdown()` | Function | Graceful shutdown with resource cleanup | [`shutdown-handlers.ts:78-139`](./shutdown-handlers.ts) |
| `performAutoIndex()` | Function | Auto-detect and index supported projects | [`auto-indexer.ts:273-445`](./auto-indexer.ts) |
| `setupConsoleOverride()` | Function | Quiet mode console override for --pipe | [`environment-setup.ts:19-43`](./environment-setup.ts) |

See [`agent-registry.ts`](./agent-registry.ts), [`shutdown-handlers.ts`](./shutdown-handlers.ts), [`environment-setup.ts`](./environment-setup.ts), [`startup-checks.ts`](./startup-checks.ts), [`startup-utils.ts`](./startup-utils.ts), [`indexing-state.ts`](./indexing-state.ts) for additional exports.

## Dependencies

### Internal Modules

| Module | Purpose | Interaction |
|--------|---------|-------------|
| `logging` | Structured logging (`log.i`, `log.e`, `log.d`) | All core files import `../logging/index` |
| `types/agent` | Agent, AgentType, AgentMessage, ResourceConstraints | DI container, knowledge bus, resource manager |
| `config/yaml-config` | AppConfig type | DI container agent capability resolution |
| `storage/graph-storage-factory` | Graph database creation | Service container lazy init |
| `shared/storage-paths` | `getProjectHash()`, path helpers | Branch manager, client session |
| `utils/bloom-filter` | BloomFilter for O(1) topic lookups | Knowledge bus |
| `agents/*` | 7 agent type implementations | Agent registry (lazy dynamic imports) |
| `semantic/faiss` | FAISS provider shutdown | Shutdown handlers |

### External Packages

| Package | Purpose |
|---------|---------|
| `node:events` | EventEmitter base for KnowledgeBus, ResourceManager, FileWatcher |
| `node:child_process` | Git command execution (`execSync`) |
| `node:fs` | File operations for config, metadata, watchers |
| `node:os` | System metrics: `totalmem`, `freemem`, `loadavg` |
| `node:path` | Path utilities |
| `node:net` | Pipe/socket transport |
| `fast-glob` | File pattern matching for auto-indexer |

## Configuration

| Parameter | Default | Description |
|-----------|---------|-------------|
| `MCP_QUIET_MODE` | `"false"` | Suppress console output in --pipe mode |
| `MCP_DEBUG_DISABLE_SEMANTIC` | `"1"` | Skip semantic indexing |
| `MCP_EMBEDDING_ENABLED` | `"true"` | Enable/disable embedding generation |
| `MCP_EMBEDDING_PROVIDER` | `"transformers"` | Embedding backend selection |
| `maxMemoryMB` | 50% system RAM | ResourceManager max memory constraint |
| `maxCpuPercent` | 95% | ResourceManager max CPU constraint |
| `maxConcurrentAgents` | `cpus * 3` (cap 20) | Max concurrent agent count |
| `debounceMs` | 60000 | GitWatcher file change debounce window |
| `bulkModeThreshold` | 1000 | File count threshold triggering full reindex |
| `evictionStrategy` | `"LRU"` | BranchManager cleanup policy |

## Behavioral Properties

| Property | Value |
|----------|-------|
| Async | Yes -- all resolve/init paths are async; KnowledgeBus handlers execute sequentially via `await` in loop |
| Thread Safety | Safe for single-threaded Node.js; Map/EventEmitter ops are synchronous; no file locking in BranchManager |
| Idempotency | DIContainer.dispose() is idempotent (disposed flag); publish() creates distinct entries per call |
| Side Effects | Emits events, writes metadata/registry JSON to disk, spawns Git child processes, requests GC |
| State | Singleton pattern for KnowledgeBus, ResourceManager, DIContainer; ClientSession is per-client instance |

## Error Handling

Core components use defensive try/catch with continuation semantics: errors in one subscriber/service do not block others. KnowledgeBus catches handler exceptions and emits `subscription:error` events. DIContainer throws on unregistered services and circular dependencies (with cycle path in message) but catches individual dispose failures. GitWatcher and BranchManager return empty/null on git command failures and continue polling.

| Error | When | Recovery |
|-------|------|----------|
| Circular dependency detected | `DIContainer.resolve()` finds cycle in resolution stack | Throws with full cycle path; caller must fix registration |
| Service not registered | `DIContainer.resolve()` with unknown name | Throws `Error`; caller catches |
| Handler exception | `KnowledgeBus` subscriber throws | Caught, emits `subscription:error`, continues next subscriber |
| Git command failure | `GitWatcher.getChangedFiles()` exec error | Returns empty array, logs warning |
| Metadata read failure | `BranchManager.getBranchMetadata()` | Returns null, logs error |
| Bun.watch unavailable | `FileWatcher.start()` | Falls back to `fs.watch()` |

## Observability

| Event | Level | When |
|-------|-------|------|
| `knowledge:published` | info | Entry published to a topic |
| `subscription:error` | error | Subscriber handler threw an exception |
| `monitoring:started` / `stopped` | info | Resource monitoring lifecycle |
| `throttle:enabled` / `disabled` | warn | System pressure crosses 80% threshold |
| `memory:critical` / `cpu:critical` | error | Resource pressure exceeds critical level |
| `allocation:denied` | warn | Resource request rejected due to constraints |
| `branch_changed` | info | Git branch switch detected |
| `new_commit` | info | New commit detected on current branch |
| `disposed` | info | DI container fully disposed |

## Known Limitations

- **Layer 2 (Working Deltas) not implemented** -- LayeredIndex defines a 3-layer interface but Layer 2 is marked `[FUTURE]` in [`layered-index.ts`](./layered-index.ts)
- **No file locking in BranchManager** -- Registry JSON written directly; potential race condition in concurrent write scenarios
- **Knowledge Bus TTL is lazy** -- Expired entries only cleaned on `query()`, not proactively removed
- **Regex cache unbounded** -- KnowledgeBus pattern cache can grow indefinitely with many unique subscription patterns
- **fs.watch() unreliable on Windows** -- GitWatcher falls back to polling for branch changes on Windows
- **No persistent debounce state** -- If server crashes during the debounce window, pending file changes are lost

## TypeScript Notes

### Event Map

| Event | Payload | When |
|-------|---------|------|
| `knowledge:published` | `KnowledgeEntry` | Topic entry created |
| `subscription:created` | `Subscription` | New subscription registered |
| `subscription:removed` | `string` (subscriptionId) | Subscription unsubscribed |
| `subscription:error` | `{ subscription: Subscription, error: Error }` | Handler threw |
| `message:sent` | `AgentMessage` | Direct agent message sent |
| `topic:cleared` | `string` (topic) | Topic entries cleared |
| `throttle:enabled` | `{ memory: boolean, cpu: boolean }` | Pressure > 80% |
| `allocation:denied` | `{ agentId: string, reason: string, requested: number, available: number }` | Resource request rejected |
| `snapshot:captured` | `ResourceSnapshot` | Monitoring tick completed |

### Module Boundary

The module has no `index.ts` barrel file; each file exports directly. Public surface: `KnowledgeBus`, `DIContainer`, `GitWatcher`, `ResourceManager`, `BranchManager`, `FileWatcher`, `ClientSession`, `ServiceContainer` classes plus their singleton instances (`knowledgeBus`, `resourceManager`) and key functions (`registerAllAgents`, `getGlobalContainer`, `getServiceContainer`, `initServiceContainer`, `performGlobalShutdown`, `performAutoIndex`). Internal helpers like `BloomFilter` usage and `resolutionStack` tracking are not exposed. `ServiceDescriptor` is exported for advanced DI usage only.

## Files

| File | Description |
|------|-------------|
| [`agent-registry.ts`](./agent-registry.ts) | Agent factory registration for 7 agent types with lazy dynamic imports |
| [`auto-indexer.ts`](./auto-indexer.ts) | Auto-detection of supported projects and index orchestration |
| [`branch-manager.ts`](./branch-manager.ts) | Per-branch database paths, metadata persistence, and LRU eviction |
| [`client-session.ts`](./client-session.ts) | Per-client state isolation for pipe mode with session registry |
| [`di-container.ts`](./di-container.ts) | Dependency injection container with circular dependency detection |
| [`environment-setup.ts`](./environment-setup.ts) | Quiet mode, safe environment creation, version info |
| [`file-merkle.ts`](./file-merkle.ts) | Content-hash-based Merkle tree for incremental file tracking |
| [`file-watcher.ts`](./file-watcher.ts) | Debounced file change detection with Bun/Node fallback |
| [`git-watcher.ts`](./git-watcher.ts) | Git branch polling, commit detection, and debounced file change callbacks |
| [`indexing-state.ts`](./indexing-state.ts) | Per-project indexing state tracking and timer suspension |
| [`knowledge-bus.ts`](./knowledge-bus.ts) | Pub/sub knowledge bus with Bloom filter optimization and TTL |
| [`layered-index.ts`](./layered-index.ts) | 3-layer index interface (Layer 2 future) |
| [`merkle-file-tracker.ts`](./merkle-file-tracker.ts) | File content tracking via Merkle hashes for incremental indexing |
| [`pipe-transport.ts`](./pipe-transport.ts) | Named pipe/socket transport for multi-client MCP communication |
| [`resource-manager.ts`](./resource-manager.ts) | Adaptive CPU/memory monitoring with throttle and allocation control |
| [`service-container.ts`](./service-container.ts) | Lazy service initialization with global container access |
| [`shutdown-handlers.ts`](./shutdown-handlers.ts) | Graceful shutdown orchestration with signal handlers |
| [`startup-checks.ts`](./startup-checks.ts) | Ollama availability check and orphaned embeddings cleanup |
| [`startup-utils.ts`](./startup-utils.ts) | Timing utilities, log file I/O, and timestamp formatting |
