---
module_name: src
description: "Root entry point for UltraCode server — multi-agent code intelligence platform"
status: active
language: typescript
entry_point: index.ts
exports: [getCurrentIndexingDirectory, getIndexingStatus, isIndexing, isProjectIndexing, setIndexingState, areTimersSuspended, resumeTimers, registerAsyncLoopStarter]
dependencies: [agents, autodoc, cli, config, core, logging, semantic, shared, storage, tools, types, utils, addons]
tags: [mcp-server, entry-point, multi-agent, pipe-transport, lifecycle]
---

# UltraCode — Root

> Main entry point for the MCP server: initializes configuration, storage, agents, tools, and manages the full server lifecycle with stdio and pipe transports.

## Overview

`src/index.ts` is a 1500+ line orchestrator that bootstraps the entire MCP server. It supports two transport modes: **stdio** (single client, default) and **pipe** (multi-client with per-session isolation). The startup sequence initializes configuration, SQLite graph storage, GPU/embedding workers, a DI container with multi-agent architecture (Conductor, Semantic, Dev, Dora agents), and 47+ MCP tools with lazy handler loading. Auto-indexing runs in the background after server ready.

## Data Flow

### Inputs
| Source | Data | Type |
|--------|------|------|
| `process.argv` | `--pipe`, `--config`, `--no-auto-index`, directory | CLI args |
| `process.env` | `MCP_*`, `DATABASE_*`, `LOG_*` (100+ vars) | Environment |
| stdin / Named Pipes | JSON-RPC 2.0 tool requests | MCP protocol |
| File system | `ultracode-config.yaml`, `semantic-config.json` | Config files |

### Processing
1. Early console override and safe environment creation (protect JSON-RPC stdout)
2. xxHash WASM init, storage directories, CLI args parsing
3. Config YAML loading, validation, logger initialization
4. SQLite GraphStorage init, GPU/OVMS/Roslyn workers start (non-blocking)
5. DI Container setup, agent registration, Conductor lazy init
6. MCP server connect (stdio or pipe), tool registry ready
7. Auto-indexing check and background execution via `setImmediate`

### Outputs
| Target | Data | Type |
|--------|------|------|
| MCP Client | Tool results, errors | JSON-RPC 2.0 |
| File system | Structured logs | `~/.ultracode/logs/` |
| Child processes | GPU worker, Roslyn addon, embedding services | IPC |

## Public API

| Export | Type | Description | Location |
|--------|------|-------------|----------|
| `getCurrentIndexingDirectory` | function | Get current project directory being indexed | [`index.ts:284-284`](./index.ts) |
| `getIndexingStatus` | function | Get indexing state with elapsed time and per-project info | [`index.ts:162-170`](./index.ts) |
| `isIndexing` | function | Check if any project is currently indexing | [`index.ts:162-170`](./index.ts) |
| `isProjectIndexing` | function | Check if a specific project directory is indexing | [`index.ts:162-170`](./index.ts) |
| `setIndexingState` | function | Set indexing state for a project directory | [`index.ts:162-170`](./index.ts) |
| `areTimersSuspended` | function | Legacy: always returns false | [`index.ts:162-170`](./index.ts) |
| `resumeTimers` | function | Legacy: no-op | [`index.ts:162-170`](./index.ts) |
| `registerAsyncLoopStarter` | function | Legacy: no-op | [`index.ts:162-170`](./index.ts) |

All 8 exports are re-exported from ~~`core/indexing-state.js`~~ (deleted) and ~~`shared/indexing-context.js`~~ (deleted).

## Dependencies

### Internal Modules
| Module | Purpose | Interaction |
|--------|---------|-------------|
| `agents` | ConductorOrchestrator, Dev/Semantic/Dora agents | Agent lifecycle, tool delegation |
| `config` | YAML config, constants, validation | `initializeConfig()`, `getConfig()` |
| `core` | KnowledgeBus, DI container, agent registry, resource manager | Singleton infrastructure |
| `storage` | GraphStorage factory (native SQLite) | Database initialization |
| `tools` | ToolRegistry, tool definitions | Tool lookup and execution |
| `logging` | Structured logger | All logging throughout |
| `semantic` | Embedding warmup, GPU client, FAISS, OVMS | Background initialization |
| `shared` | Storage paths, indexing context | Directory management |
| `autodoc` | AutoDoc watcher and manager | Background file watching |
| `cli` | Args parser | CLI argument processing |
| `addons` | Roslyn C# parser | Optional addon lifecycle |

### External Packages
| Package | Purpose |
|---------|---------|
| `@modelcontextprotocol/sdk` | MCP Server, transports, schemas |
| `zod` | CallToolRequestSchema validation |

## Configuration

| Parameter | Default | Description |
|-----------|---------|-------------|
| `--pipe` | off | Enable pipe transport for multi-client mode |
| `--config <path>` | auto | Override config file path |
| `--no-auto-index` | off | Disable auto-indexing on startup |
| `MCP_QUIET_MODE` | `"false"` | Suppress console output (auto-set in pipe mode) |
| `MCP_DEBUG_MODE` | undefined | Enable debug logging and disable caches |
| `indexing.autoIndex` | `false` | Auto-index project on startup |

## Behavioral Properties

| Property | Value |
|----------|-------|
| Async | Yes — heavy async/await throughout; GPU/Roslyn/embedding start non-blocking |
| Thread Safety | Per-project indexing lock via Map; SQLite journal_mode=OFF for storage; singletons via DI |
| Idempotency | `setIndexingState` is idempotent; `performAutoIndex` is not (mutates storage) |
| Side Effects | Console override, global env setup, child process spawn, DB writes, log files |
| State | Multiple singletons: knowledgeBus, resourceManager, GraphStorage, conductor |

## Error Handling

Global exception handlers catch `uncaughtException` (exit 1) and `unhandledRejection` (log only). Tool execution wraps handlers in try/catch with `AgentBusyError` special handling. Config validation failure causes `process.exit(1)`. GPU/Roslyn/embedding failures are non-fatal — logged and degraded gracefully.

| Error | When | Recovery |
|-------|------|----------|
| Config validation failure | Startup | `process.exit(1)` |
| Unknown tool name | Tool request | `{success: false, error: message}` |
| Indexing in progress | Tool request during index | `{errorType: "indexing_in_progress"}` |
| Agent busy | Queue full or memory limit | `{errorType: "agent_busy"}` |
| Tool timeout | Handler exceeds timeout | Promise rejection, logged |
| Uncaught exception | Any | Write to log file, `process.exit(1)` |

## Observability

| Event | Level | When |
|-------|-------|------|
| `STARTUP:server_starting` | info | Server initialization begins |
| `STARTUP:architecture` | info | Multi-agent architecture type logged |
| `MCP:server_ready` | info | Server connected and accepting requests |
| `MCP:request` | info | Each incoming tool request |
| `MCP:error` | error | Tool execution failure |
| `INDEXER:autoindex_start` | info | Auto-indexing begins for a project |
| `INDEXER:tool_blocked` | info | Tool blocked by active indexing |
| `PIPE:client_connected` | info | New pipe client connected |
| `PIPE:shutdown_scheduled` | info | Graceful shutdown initiated |
| `GPU:worker_started` | info | GPU worker process ready |

## Known Limitations

- Single write lock per project — no concurrent indexing of same project
- Console override is global — affects all `console.log` calls across modules
- Auto-indexing runs via `setImmediate` — early tool requests may miss new files
- Per-client session isolation is incomplete — GraphStorage is still shared globally
- Graceful shutdown delay is hard-coded at 2000ms for reconnect scenarios
- No request deduplication — duplicate tool requests execute twice
- Embedding vector dimensions fixed at startup — model changes require restart

## TypeScript Notes

### Event Map
Knowledge Bus uses dynamic string topics (no typed event map):
- `index:completed` — indexing finished for a project
- `parse:complete` — parsing batch completed

### Module Boundary
`index.ts` re-exports 8 indexing state functions. All other functionality (server setup, tool execution, auto-indexing) is internal to `main()`. Agents are accessed via lazy async getters to avoid circular dependencies.

## Exports

- `areTimersSuspended`
- `getIndexingStatus`
- `isIndexing`
- `isPostIndexing`
- `isProjectIndexing`
- `registerAsyncLoopStarter`
- `resumeTimers`
- `setIndexingState`
- `waitForPostIndexing`
- `getCurrentIndexingDirectory`

## Files

| File | Description |
|------|-------------|
| [`index.ts`](./index.ts) | Main MCP server entry point (1535 lines) |
| `bun-proxy.ts` | Bun runtime polyfills |
| `pipe-preload.ts` | Pipe transport preload script |
| `skills-installer.ts` | Claude Code skills auto-installer |
