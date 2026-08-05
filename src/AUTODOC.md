# UltraCode — Root

## 🤖 Overview

The `bun-proxy.ts` module is a lightweight proxy that runs under Bun, isolating the MCP server from the embedded Bun environment. It spawns the actual MCP server in a separate Bun process, proxying stdin and stdout while discarding stderr. The `index.ts` module is the main entry point for the MCP server, implementing 8 new semantic-aware tools for code graph analysis. This module is used by the UltraCode Server to provide advanced code analysis capabilities.

## 🤖 Architecture

```
bun-proxy.ts
├── spawns a child process
│   └── runs index.js
├── proxies stdin → child.stdin
├── proxies child.stdout → stdout
└── discards child.stderr
```

## 🤖 Flow

```
index.ts
├── checks for --pipe flag
│   └── sets env variable
├── overrides console
│   └── prevents JSON-RPC corruption
├── initializes global extensions
│   └── defines type alias
└── starts server with 8 new semantic tools
```

## 🤖 Entity Listing

### Function
- **appendElapsed** — Appends elapsed time to the content array of a result object, either by modifying the text or appending as metadata `index.ts:748-765`
- **briefArgs** — Provides brief arguments for the MCP server `index.ts:711-726`
- **callRequest** — Calls a request function for the MCP server `index.ts:1075-1082`
- **cancelShutdown** — Cancels a scheduled shutdown for the MCP server `index.ts:1483-1489`
- **checkTimeout** — Checks if a timeout has occurred `index.ts:688-697`
- **compareVersions** — Compare two version strings `skills-installer.ts:92-94`
- **copyDirSync** — Copies a directory synchronously `skills-installer.ts:183-200`
- **createAutoIndexContext** — Creates an auto-index context for the MCP server `index.ts:1115-1125`
- **createMcpServer** — Creates the MCP server instance `index.ts:565-677`
- **createSafeEnvironment** — Function to provide safe defaults for environment variables `index.ts:73-87`
- **currentSkillNames** — Retrieves the names of currently installed skills `skills-installer.ts:209-209`
- **enforceResponseLimit** — Parses the response content and truncates it if it exceeds the maximum size, adding metadata for truncated responses `index.ts:794-832`
- **executeToolCall** — Checks if the current project is being indexed and blocks the tool call if it is, returning an error message and status information `index.ts:843-1068`
- **forceReinstallSkills** — Forces the reinstallation of skills `skills-installer.ts:384-410`
- **getConductor** — Retrieves the conductor for the MCP server `index.ts:476-485`
- **getDevAgent** — Retrieves the development agent for the MCP server `index.ts:538-542`
- **getDoraAgent** — Retrieves the Dora agent for the MCP server `index.ts:544-548`
- **getInstallationStatus** — Retrieves the installation status of skills `skills-installer.ts:342-379`
- **getOrInitServiceContainer** — Gets or initializes the service container for the MCP server `index.ts:498-508`
- **getPackageSkillsDir** — Get the package's claude-skills directory path `skills-installer.ts:59-64`
- **getSemanticAgent** — Retrieves the semantic agent for the MCP server `index.ts:514-536`
- **getUserClaudeDir** — Get the user's Claude directory (~/.claude/) `skills-installer.ts:76-78`
- **getUserSkillsDir** — Get the user's Claude skills directory (~/.claude/skills/) `skills-installer.ts:69-71`
- **installSkillsIfNeeded** — Installs skills if needed based on the current version and the latest version `skills-installer.ts:240-337`
- **main** — Main function for the MCP server `index.ts:1304-1827`
- **needsUpdate** — Determines if a package needs an update based on version and updatedAt fields `skills-installer.ts:150-178`
- **newContent** — Maps over the response content to create a new content array with truncated or modified items if they exceed the maximum size `index.ts:807-829`
- **noop** — Function to suppress console output in quiet mode `index.ts:55-55`
- **noop** — Defines a no-operation function `index.ts:63-63`
- **normalizeInputPath** — Normalizes the input path for the MCP server `index.ts:325-325`
- **normalizeInputPath** — Normalizes the input path by expanding home and resolving directory `index.ts:326-326`
- **normalizeInputPath** — Normalizes the input path by expanding the home directory and resolving the path relative to the directory `index.ts:327-332`
- **parseVersion** — Parse version string into parts `skills-installer.ts:83-86`
- **parts** — Parts of the version string `skills-installer.ts:84-84`
- **performGracefulShutdown** — Performs a graceful shutdown of the MCP server `index.ts:1337-1454`
- **poll** — Polls for updates in the MCP server `index.ts:1258-1297`
- **processDebugRequests** — Processes debug requests for the MCP server `index.ts:1073-1106`
- **readInstalledManifest** — Read the installed manifest `skills-installer.ts:115-126`
- **readPackageManifest** — Read the package manifest `skills-installer.ts:99-110`
- **removeOldSkills** — Removes old skills from the user's Claude skills directory `skills-installer.ts:205-227`
- **sanitizeResponseSurrogates** — Sanitizes response surrogates for the MCP server `index.ts:735-742`
- **scheduleDeferredAutoIndex** — Schedules a deferred auto-index for the MCP server `index.ts:1246-1301`
- **scheduleShutdown** — Schedules a shutdown for the MCP server `index.ts:1461-1478`
- **startBackgroundServices** — Starts background services for the MCP server `index.ts:1132-1232`
- **timeoutPromise** — Creates a promise with a timeout `index.ts:686-699`
- **toolContext** — Provides methods to get graph storage, SQLite manager, branch manager, snapshot manager, knowledge bus, service container, and auto-index context `index.ts:958-963`
- **toolContext** — Returns null for the SQLite manager, as it is now using libsql via getGraphStorage() `index.ts:964-964`
- **toolContext** — Retrieves the branch manager using the DevAgent's IndexerAgent `index.ts:966-974`
- **toolContext** — Retrieves the snapshot manager using the service container's version manager `index.ts:975-978`
- **toolContext** — Returns the knowledge bus `index.ts:979-979`
- **toolContext** — Returns the service container `index.ts:980-980`
- **toolContext** — Creates an auto-index context with an optional override path `index.ts:983-983`
- **tools** — Contains the tools used by the MCP server `index.ts:653-653`
- **uninstallSkills** — Function to uninstall installed skills `skills-installer.ts:415-453`
- **withTimeout** — Applies a timeout to a function call `index.ts:683-706`
- **writeInstalledManifest** — Writes an installed manifest file with additional metadata `skills-installer.ts:131-145`

### Interface
- **InstalledManifest** — Installed manifest with additional metadata `skills-installer.ts:48-51`
- **SkillsManifest** — Manifest structure for version tracking `skills-installer.ts:33-43`

### Type_alias
- **DebugRequest** — Represents a debug request for the MCP server `index.ts:296-299`
- **DevAgentWithIndexer** — Represents an object with an optional method to get an indexer agent, which may have a method to get a branch manager `index.ts:970-970`
- **DevAgentWithIndexer** — Represents a DevAgent with an indexer for the MCP server `index.ts:1772-1777`
- **GlobalWithKnowledgeBus** — Type alias for global with knowledge bus `index.ts:30-32`

### Import_decl
- **./addons/index.js** — Imports `./addons/index.js` from `./addons/index.js`. `index.ts:147-147`
- **./agents/conductor-orchestrator.js** — Imports `./agents/conductor-orchestrator.js` from `./agents/conductor-orchestrator.js`. `index.ts:107-107`
- **./agents/dev/file-extensions.js** — Imports `./agents/dev/file-extensions.js` from `./agents/dev/file-extensions.js`. `index.ts:108-108`
- **./autodoc/index.js** — Imports `./autodoc/index.js` from `./autodoc/index.js`. `index.ts:110-110`
- **./cli/args-parser.js** — Imports `./cli/args-parser.js` from `./cli/args-parser.js`. `index.ts:112-112`
- **./config/yaml-config.js** — Imports `./config/yaml-config.js` from `./config/yaml-config.js`. `index.ts:113-113`
- **./core/agent-registry.js** — Imports `./core/agent-registry.js` from `./core/agent-registry.js`. `index.ts:114-114`
- **./core/auto-indexer.js** — Imports `./core/auto-indexer.js`. `index.ts:116-121`
- **./core/client-session.js** — Imports `./core/client-session.js` from `./core/client-session.js`. `index.ts:149-149`
- **./core/di-container.js** — Imports `./core/di-container.js` from `./core/di-container.js`. `index.ts:123-123`
- **./core/environment-setup.js** — Imports `./core/environment-setup.js` from `./core/environment-setup.js`. `index.ts:181-181`
- **./core/indexing-state.js** — Imports `./core/indexing-state.js`. `index.ts:125-136`
- **./core/knowledge-bus.js** — Imports `./core/knowledge-bus.js` from `./core/knowledge-bus.js`. `index.ts:137-137`
- **./core/pipe-transport.js** — Imports `./core/pipe-transport.js` from `./core/pipe-transport.js`. `index.ts:150-150`
- **./core/resource-manager.js** — Imports `./core/resource-manager.js` from `./core/resource-manager.js`. `index.ts:151-151`
- **./core/service-container.js** — Imports `./core/service-container.js` from `./core/service-container.js`. `index.ts:183-183`
- **./core/shutdown-handlers.js** — Imports `./core/shutdown-handlers.js` from `./core/shutdown-handlers.js`. `index.ts:184-184`
- **./core/startup-checks.js** — Imports `./core/startup-checks.js` from `./core/startup-checks.js`. `index.ts:185-185`
- **./core/startup-utils.js** — Imports `./core/startup-utils.js`. `index.ts:187-194`
- **./layered/index.js** — Imports `./layered/index.js` from `./layered/index.js`. `index.ts:153-153`
- **./logging/index.js** — Imports `./logging/index.js` from `./logging/index.js`. `index.ts:195-195`, `skills-installer.ts:28-28`
- **./logging/memory-logger.js** — Imports `./logging/memory-logger.js` from `./logging/memory-logger.js`. `index.ts:196-196`
- **./semantic/embedding-warmup.js** — Imports `./semantic/embedding-warmup.js` from `./semantic/embedding-warmup.js`. `index.ts:197-197`
- **./semantic/faiss/faiss-provider.js** — Imports `./semantic/faiss/faiss-provider.js` from `./semantic/faiss/faiss-provider.js`. `index.ts:154-154`
- **./semantic/gpu/gpu-client.js** — Imports `./semantic/gpu/gpu-client.js` from `./semantic/gpu/gpu-client.js`. `index.ts:155-155`
- **./semantic/ovms-native-manager.js** — Imports `./semantic/ovms-native-manager.js` from `./semantic/ovms-native-manager.js`. `index.ts:157-157`
- **./shared/indexing-context.js** — Imports `./shared/indexing-context.js` from `./shared/indexing-context.js`. `index.ts:292-292`
- **./shared/storage-paths.js** — Imports `./shared/storage-paths.js` from `./shared/storage-paths.js`. `index.ts:159-159`
- **./skills-installer.js** — Imports `./skills-installer.js` from `./skills-installer.js`. `index.ts:139-139`
- **./storage/graph-storage-factory.js** — Imports `./storage/graph-storage-factory.js` from `./storage/graph-storage-factory.js`. `index.ts:160-160`
- **./storage/graph-storage-libsql.js** — Imports `./storage/graph-storage-libsql.js` from `./storage/graph-storage-libsql.js`. `index.ts:161-161`
- **./storage/libsql/request-context.js** — Imports `./storage/libsql/request-context.js` from `./storage/libsql/request-context.js`. `index.ts:162-162`
- **./tools/base-tool-handler.js** — Imports `./tools/base-tool-handler.js` from `./tools/base-tool-handler.js`. `index.ts:163-163`
- **./tools/response-limits.js** — Imports `./tools/response-limits.js` from `./tools/response-limits.js`. `index.ts:164-164`
- **./tools/tool-definitions.js** — Imports `./tools/tool-definitions.js` from `./tools/tool-definitions.js`. `index.ts:165-165`
- **./tools/tool-registry.js** — Imports `./tools/tool-registry.js` from `./tools/tool-registry.js`. `index.ts:166-166`
- **./types/agent.js** — Imports `./types/agent.js` from `./types/agent.js`. `index.ts:198-198`, `index.ts:199-199`
- **./types/errors.js** — Imports `./types/errors.js` from `./types/errors.js`. `index.ts:200-200`
- **./utils/config-paths.js** — Imports `./utils/config-paths.js` from `./utils/config-paths.js`. `index.ts:201-201`
- **./utils/fast-hash.js** — Imports `./utils/fast-hash.js` from `./utils/fast-hash.js`. `index.ts:202-202`
- **./utils/logger.js** — Imports `./utils/logger.js` from `./utils/logger.js`. `index.ts:203-203`
- **./utils/runtime-detection.js** — Imports `./utils/runtime-detection.js` from `./utils/runtime-detection.js`. `index.ts:204-204`
- **@modelcontextprotocol/sdk/server/index.js** — Imports `@modelcontextprotocol/sdk/server/index.js` from `@modelcontextprotocol/sdk/server/index.js`. `index.ts:96-96`
- **@modelcontextprotocol/sdk/server/stdio.js** — Imports `@modelcontextprotocol/sdk/server/stdio.js` from `@modelcontextprotocol/sdk/server/stdio.js`. `index.ts:97-97`
- **@modelcontextprotocol/sdk/types.js** — Imports `@modelcontextprotocol/sdk/types.js`. `index.ts:98-103`
- **node:child_process** — Imports `node:child_process` from `node:child_process`. `bun-proxy.ts:22-22`
- **node:fs** — Imports `node:fs` from `node:fs`. `index.ts:92-92`
- **node:fs** — Imports `node:fs`. `skills-installer.ts:15-24`
- **node:os** — Imports `node:os` from `node:os`. `skills-installer.ts:25-25`
- **node:path** — Imports `node:path` from `node:path`. `bun-proxy.ts:23-23`, `index.ts:93-93`, `skills-installer.ts:26-26`
- **node:url** — Imports `node:url` from `node:url`. `bun-proxy.ts:24-24`, `index.ts:94-94`, `skills-installer.ts:27-27`
- **p-limit** — Imports `p-limit` from `p-limit`. `index.ts:145-145`
- **zod** — Imports `zod` from `zod`. `index.ts:105-105`

### Property
- **action** — Represents the action to be taken, such as installing or updating skills `skills-installer.ts:241-241`
- **config** — Configures the MCP server `index.ts:1133-1133`
- **content** — Stores the content for the MCP server `index.ts:735-735`
- **content** — Appends elapsed time to the content array of a result object `index.ts:748-748`
- **content** — Represents a result object with a content array containing text elements `index.ts:796-796`
- **content** — Returns a result object with a content array containing text elements `index.ts:797-797`
- **debug** — Suppresses console.debug output `pipe-preload.ts:33-33`
- **description** — Description of the skill `skills-installer.ts:36-36`
- **description** — Stores the description of the skill `skills-installer.ts:39-39`
- **directory** — Sets the directory for the MCP server `index.ts:1134-1134`
- **error** — Suppresses console.error output `pipe-preload.ts:29-29`
- **error** — Represents an error object or message `skills-installer.ts:388-388`
- **errors** — Array or list of error messages `skills-installer.ts:415-415`
- **getBranchManager** — Represents an optional method to get a branch manager `index.ts:970-970`
- **getIndexerAgent** — Represents an optional method to get an indexer agent `index.ts:970-970`
- **getIndexerAgent** — Gets the indexer agent for the MCP server `index.ts:1773-1776`
- **info** — Suppresses console.info output `pipe-preload.ts:32-32`
- **installed** — Indicates whether a skill is installed `skills-installer.ts:343-343`
- **installedAt** — Indicates the time when a skill was installed `skills-installer.ts:345-345`
- **installedAt** — Date when the manifest was installed `skills-installer.ts:49-49`
- **installedFrom** — Source of the installed manifest `skills-installer.ts:50-50`
- **knowledgeBus** — Represents an unknown value for the knowledge bus `index.ts:31-31`
- **log** — Suppresses console.log output `pipe-preload.ts:31-31`
- **minClaudeCodeVersion** — Minimum Claude Code version required `skills-installer.ts:41-41`
- **name** — Name of the skill `skills-installer.ts:34-34`
- **name** — Stores the name of the skill `skills-installer.ts:38-38`
- **needsUpdate** — Determines if an update is needed based on the current version and the latest version `skills-installer.ts:154-154`
- **needsUpdate** — Indicates whether an update is needed `skills-installer.ts:348-348`
- **packageVersion** — Represents the version of the package `skills-installer.ts:347-347`
- **parsed** — Parses raw input data into a structured format `index.ts:298-298`
- **pipeServerMode** — Sets the pipe server mode for the MCP server `index.ts:1135-1135`
- **processStartTime** — Records the start time of the MCP server process `index.ts:1136-1136`
- **raw** — Stores raw input data for the MCP server `index.ts:297-297`
- **reason** — Provides the reason for an update `skills-installer.ts:155-155`
- **reason** — Represents the reason for an update `skills-installer.ts:244-244`
- **removed** — Indicates whether a skill was removed `skills-installer.ts:245-245`
- **removed** — Indicates a skill has been removed `skills-installer.ts:415-415`
- **setProjectContext** — Sets the project context for the MCP server `index.ts:1774-1774`
- **setRepositoryPath** — Sets the repository path for the MCP server `index.ts:1775-1775`
- **skills** — Represents the list of skills to be installed or updated `skills-installer.ts:243-243`
- **skills** — Contains an array of skill names `skills-installer.ts:346-346`
- **skills** — Array of skill objects with name and description `skills-installer.ts:37-40`, `skills-installer.ts:387-387`
- **success** — Indicates whether an action was successful `skills-installer.ts:385-385`
- **text** — Sanitizes the response surrogates by modifying the content array `index.ts:735-735`
- **text** — Appends elapsed time to the content array of a result object `index.ts:748-748`
- **text** — Represents a result object with a content array containing text elements `index.ts:796-796`
- **text** — Returns a result object with a content array containing text elements `index.ts:797-797`
- **type** — Type alias for global with knowledge bus `index.ts:735-735`
- **type** — Appends elapsed time to the result content array `index.ts:748-748`
- **type** — Represents the result content array with text type elements `index.ts:796-796`
- **type** — Returns an object with content as an array of text elements `index.ts:797-797`
- **updatedAt** — Date when the manifest was last updated `skills-installer.ts:42-42`
- **updateReason** — Provides the reason for an update `skills-installer.ts:349-349`
- **version** — Represents the version of the skill or the package `skills-installer.ts:242-242`
- **version** — Stores the version of the package `skills-installer.ts:344-344`
- **version** — Version of the skill `skills-installer.ts:35-35`, `skills-installer.ts:386-386`
- **warn** — Suppresses console.warn output `pipe-preload.ts:30-30`

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
