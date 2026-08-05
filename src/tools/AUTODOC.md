# Tools Module

MCP tool infrastructure with type-safe handlers, schemas, utilities for code analysis and metrics collection.

## Overview

Central MCP tool infrastructure providing the bridge between MCP protocol and internal subsystems (agents, semantic search, graph storage, code analysis, AutoDoc). The module contains `ToolRegistry` with lazy-loaded handler groups (~80% deferred imports), `BaseToolHandler` abstract base class with built-in response limiting and argument validation, and 60+ handler implementations organized into 12 lazy-loaded categories plus 6 eager-loaded utilities. Reduces cold start from ~2s to <500ms via deferred loading; enforces 50KB response limits via binary-search truncation and serializes heavy analysis tools through a concurrency queue to prevent memory spikes.

## Flow

```
MCP Request (tool_name, args)
  ↓
ToolRegistry.getHandler(toolName, context)
  ├─ Check eager-loaded cache (help, index, graph, entity, metrics)
  └─ If miss: LazyHandlerLoader → Promise<Constructor> → instantiate
  ↓
Handler.handle(args)
  ├─ parseArgs(args) → Zod schema validation
  ├─ execute(args) → business logic
  │   ├─ resolveProjectPath() → session/context/fallback
  │   ├─ ensureGraphStorage() → GraphStorage (SQLite native)
  │   ├─ getSemanticAgent() → SemanticAgent / VectorStore
  │   └─ execute core logic (search, analysis, modification, etc.)
  ├─ applyResponseLimits() → truncateResponse() if >50KB
  └─ return ToolResult { content: [{ type: "text", text }] }
  ↓
Transport-level check: enforceResponseLimit (Buffer.byteLength)
  └─ Serialize to MCP response
```

## Entities

### Public API

| Entity | Type | Location | Purpose |
|--------|------|----------|---------|
| `BaseToolHandler<TArgs>` | abstract class | `base-tool-handler.ts:63-311` | Base class for all handlers; implements parseArgs, execute, and response limiting lifecycle with automatic argument validation and response truncation. |
| `ToolResult` | interface | `base-tool-handler.ts:26-31` | MCP response envelope containing typed content array with text payloads. |
| `ToolContext` | interface | `base-tool-handler.ts:33-61` | Per-request context injected into all handlers; provides session access, conductor instance, graph storage factory, and semantic agent factory. |
| `ToolRegistry` | class | `tool-registry.ts:43-229` | Central handler registry managing handler registration, lazy loading via deferred imports, and per-request instantiation. |
| `ImpactAnalyzer` | class | `impact-analyzer.ts:69-445` | Code change impact analysis engine computing direct callers, state mutations, and breaking changes for refactoring decisions. |
| `ImpactAnalysisResult` | interface | `impact-analyzer.ts:21-54` | Impact analysis output containing direct callers, state impact mutations, breaking changes, and affected file list. |
| `AgentMetricsSnapshot` | interface | `agent-metrics.ts:68-86` | Aggregated performance metrics snapshot from Conductor, agents, KnowledgeBus, and ResourceManager. |
| `collectAgentMetrics()` | async function | `agent-metrics.ts:88-126` | Collects and aggregates real-time performance metrics from system components into a single snapshot. |
| `MAX_RESPONSE_SIZE_BYTES` | const | `response-limits.ts:11-11` | Soft limit constant (50,000 bytes) triggering automatic response truncation. |
| `paginate<T>()` | function | `response-limits.ts:50-68` | Slices array with offset/limit and returns pagination metadata (total, offset, limit, truncated). |
| `truncateResponse()` | function | `response-limits.ts:84-107` | Binary-search JSON truncation preserving essential fields (id, name, type) within byte limits. |
| `projectPathParam` | Zod schema | `base-schemas.ts:13-18` | Optional project path parameter auto-resolved via session or fallback. |
| `PaginationParams` | Zod schema | `base-schemas.ts:39-42` | Standard offset/limit pagination schema for list-type tools. |
| `branchParam` | Zod schema | `base-schemas.ts:47-47` | Optional branch name parameter for branch-aware tool operations. |

### Supporting Types — Clone Detection

| Entity | Type | Location | Purpose |
|--------|------|----------|---------|
| `TokenLocation` | interface | `jscpd.ts:20-24` | Represents the position and line number of a token in source code. |
| `CloneDuplication` | interface | `jscpd.ts:26-32` | Contains duplication counts and percentages for a detected code clone pair. |
| `IClone` | interface | `jscpd.ts:34-40` | Represents a detected code clone with locations and token/line counts. |
| `DetectionOptions` | interface | `jscpd.ts:42-55` | Configuration options controlling clone detection behavior including minimum lines, token counts, and file filters. |
| `FileEntry` | interface | `jscpd.ts:57-60` | Represents a file entry with its path and content for clone detection analysis. |
| `JscpdRunOptions` | interface | `jscpd.ts:62-71` | Options for running the JSCPD clone detection engine including patterns, min lines, and language settings. |
| `JscpdCloneDetail` | interface | `jscpd.ts:73-77` | Detailed information about a specific code clone including file paths and line ranges. |
| `JscpdCloneSummary` | interface | `jscpd.ts:79-88` | Summary statistics of detected clones including counts, duplicate lines, and language breakdowns. |
| `JscpdCloneResult` | interface | `jscpd.ts:90-94` | Complete result object from clone detection containing summary and detailed clone list. |
| `FormatStats` | interface | `jscpd.ts:100-111` | Statistics for a specific file format including duplicate and total line counts. |
| `StatReport` | interface | `jscpd.ts:113-117` | Statistical report of clone detection results grouped by file format. |
| `GlobFilter` | type | `jscpd.ts:183-183` | Function type for filtering files based on path and globbing rules. |
| `NormLine` | interface | `jscpd.ts:288-295` | Normalized source code line with original, trimmed, and processed representations for tokenization. |
| `Fingerprint` | interface | `jscpd.ts:344-354` | Compact representation of a token sequence using first/last tokens and rolling hash for efficient clone matching. |

### Supporting Types — Branch & Graph Schemas

| Entity | Type | Location | Purpose |
|--------|------|----------|---------|
| `ListBranchesSchema` | Zod schema | `branch-schemas.ts:13-15` | Schema for list_branches parameters with optional sort and filter options. |
| `SwitchBranchSchema` | Zod schema | `branch-schemas.ts:17-20` | Schema for switch_branch parameters specifying target branch and checkout behavior. |
| `GetBranchStatusSchema` | Zod schema | `branch-schemas.ts:22-24` | Schema for get_branch_status parameters to retrieve branch state and metadata. |
| `CleanupBranchesSchema` | Zod schema | `branch-schemas.ts:26-28` | Schema for cleanup_branches parameters controlling stale branch removal. |
| `GetChangedFilesSchema` | Zod schema | `branch-schemas.ts:30-33` | Schema for get_changed_files parameters to list modifications on current branch. |
| `ToolDefinition` | interface | `tool-definitions.ts:98-102` | Metadata definition for a tool including name, description, input schema, and category. |

### Supporting Functions — Clone Detection

| Entity | Type | Location | Purpose |
|--------|------|----------|---------|
| `runJscpdCloneDetection()` | async function | `jscpd.ts:545-617` | Main entry point for JSCPD clone detection; orchestrates file gathering, tokenization, fingerprinting, and clone matching. |
| `buildJscpdOptions()` | function | `jscpd.ts:138-154` | Constructs JSCPD DetectionOptions from JscpdRunOptions with normalized paths and filters. |
| `compileGlob()` | function | `jscpd.ts:160-181` | Compiles glob patterns into optimized regex matchers for efficient file filtering. |
| `makeFilter()` | function | `jscpd.ts:185-189` | Creates a file path filter function based on compiled glob patterns and accept/reject rules. |
| `parseSizeSpec()` | function | `jscpd.ts:197-202` | Parses human-readable size specifications (e.g., "1MB") to byte counts. |
| `resolveExtension()` | function | `jscpd.ts:208-211` | Maps file extensions to programming language identifiers for tokenizer selection. |
| `lineCount()` | function | `jscpd.ts:213-219` | Counts the number of lines in source code content. |
| `scanDir()` | function | `jscpd.ts:221-245` | Recursively scans directory tree yielding matching files within size and format constraints. |
| `gatherFiles()` | function | `jscpd.ts:247-282` | Gathers files from specified paths applying size, format, and globbing filters. |
| `tokenise()` | function | `jscpd.ts:297-338` | Tokenizes source code into sequences of normalized tokens preserving line and column information. |
| `computeFingerprints()` | function | `jscpd.ts:356-379` | Computes rolling hash fingerprints for sliding windows of tokens enabling efficient clone detection. |
| `detectClones()` | function | `jscpd.ts:381-425` | Identifies matching fingerprint sequences across files producing candidate clone regions. |
| `blankStats()` | function | `jscpd.ts:431-444` | Creates an empty statistics object for accumulating clone detection metrics. |
| `ratio()` | function | `jscpd.ts:446-449` | Calculates duplication ratio from duplicate and total token counts. |
| `addCloneToStats()` | function | `jscpd.ts:451-465` | Aggregates clone information into running statistics by file format. |
| `compileReport()` | function | `jscpd.ts:467-517` | Transforms raw detected clones into structured report with statistics and formatted output. |
| `extractSnippet()` | function | `jscpd.ts:523-539` | Extracts code snippet from source file at specified line range for clone display. |

### Supporting Functions — Branch Operations

| Entity | Type | Location | Purpose |
|--------|------|----------|---------|
| `listBranches()` | async function | `branch-tools.ts:22-66` | Lists all branches in the repository with current/active indicators and metadata. |
| `switchBranch()` | async function | `branch-tools.ts:71-95` | Switches the working directory to a different branch with optional index staging. |
| `getBranchStatus()` | async function | `branch-tools.ts:100-151` | Retrieves status information for a branch including last commit, tracking state, and graph metadata. |
| `cleanupBranches()` | async function | `branch-tools.ts:156-173` | Removes stale branch references and cleans up local tracking branches. |
| `getChangedFiles()` | async function | `branch-tools.ts:178-199` | Lists files changed on the current branch relative to merge base. |

### Supporting Functions — Graph & Tool Definition Utilities

| Entity | Type | Location | Purpose |
|--------|------|----------|---------|
| `queryGraphEntities()` | async function | `graph-query.ts:7-26` | Queries graph storage for entities matching SQL patterns with optional pagination. |
| `getGraphStats()` | function | `graph-query.ts:28-39` | Retrieves aggregate statistics about the graph including entity type counts. |
| `likePattern()` | function | `graph-query.ts:3-5` | Converts glob patterns to SQL LIKE expressions for entity name matching. |
| `zodToJsonSchema()` | function | `tool-definitions.ts:89-96` | Converts Zod schema objects to JSON Schema format for tool documentation. |
| `getToolsList()` | function | `tool-definitions.ts:107-663` | Generates comprehensive list of all available tools with metadata, schemas, and usage information. |

### Tool Definition Collections

| Entity | Type | Location | Purpose |
|--------|------|----------|---------|
| `branchToolDefinitions` | const | `branch-schemas.ts:36-117` | Metadata definitions for all branch-related tools including schemas and help text. |
| `traceToolDefinitions` | const | `trace-schemas.ts:8-158` | Metadata definitions for code tracing tools including forward/backward trace operations. |
| `LIMITS` | const | `jscpd.ts:10-14` | Constants defining minimum thresholds for clone detection (lines, tokens, files). |
| `DEFAULTS` | const | `jscpd.ts:123-136` | Default configuration values for clone detection including window size and similarity ratio. |

### Handlers — Eager-Loaded (6 files)

| Entity | Type | Location | Purpose |
|--------|------|----------|---------|
| `get_entity`, `find_entity` handlers | handlers | `handlers/entity-tool-handlers.ts:1-313` | Entity lookup and search operations in graph storage; eagerly loaded for quick entity queries. |
| `reset_graph`, `clean_index`, `get_graph`, `stats`, `health` handlers | handlers | `handlers/graph-tool-handlers.ts:1-264` | Graph storage management, diagnostics, and health checks; eagerly loaded for storage operations. |
| `index` handler | handler | `handlers/index-tool-handler.ts:1-418` | Incremental or full codebase reindexing with progress reporting; eagerly loaded for indexing coordination. |
| `get_metrics`, `get_version`, `agent_metrics`, `bus`, `watcher` handlers | handlers | `handlers/metrics-tool-handlers.ts:1-485` | System health, conductor metrics, and resource monitoring; eagerly loaded for diagnostics. |
| `get_help` handler | handler | `handlers/help-tool-handler.ts:1-104` | Loads and returns formatted help text from prompts directory by topic; eagerly loaded for quick help access. |
| `get_tools_for_task` handler | handler | `handlers/get-tools-for-task-handler.ts:1-184` | Recommends relevant tools based on task description via semantic matching; eagerly loaded for tool recommendations. |

### Handlers — Lazy-Loaded Groups (12 groups)

| Entity | Type | Location | Purpose |
|--------|------|----------|---------|
| `semantic_search`, `pattern_search`, `symbol_search`, `find_references`, `find_implementations`, `detect_complexity` handlers | handlers | `handlers/semantic-tool-handlers.ts:1-1206` | Semantic code search, pattern matching, and complexity analysis; lazy-loaded to reduce startup latency. |
| `analyze_hotspots`, `analyze_refactoring`, `detect_technology_stack`, `detect_code_clones`, `code_quality_metrics`, `codebase_insights` handlers | handlers | `handlers/analysis-tool-handlers.ts:1-825` | Code analysis, metrics, and technology detection; lazy-loaded to defer heavy AST analysis. |
| `modify_code`, `copy_file`, `rename_symbol`, `split_large_file`, `merge_files`, `move_file`, `delete_file`, `preview_changes` handlers | handlers | `handlers/file-tool-handlers.ts:1-811` | File system and code modification operations with preview support; lazy-loaded to avoid filesystem overhead at startup. |
| Helper functions for file tools | utility | `handlers/file-tool-utils.ts:1-119` | Setup utilities for semantic agents and directory operations; lazy-loaded with file handlers. |
| `list_branches`, `switch_branch`, `create_branch`, `delete_branch`, `branch_status` handlers | handlers | `handlers/branch-tool-handlers.ts:1-377` | Git branch management operations; lazy-loaded to defer git operations. |
| `validate_file`, `validate_directory` handlers | handlers | `handlers/validation-tool-handlers.ts:1-542` | Code quality validation using Biome and oxlint linters; lazy-loaded to avoid linter initialization overhead. |
| `show_merge_conflicts`, `resolve_merge_conflict`, `merge_status`, `list_unmerged_files` handlers | handlers | `handlers/merge-tool-handlers.ts:1-330` | Merge conflict resolution and status reporting; lazy-loaded to defer merge tool operations. |
| `trace_flow`, `trace_backwards`, `trace_data_flow`, `analyze_state_impact` handlers | handlers | ~~`handlers/trace-tool-handlers.ts:1-428`~~ (deleted) | Code flow tracing and state impact analysis; lazy-loaded to defer graph traversal operations. |
| `list_snapshots`, `create_snapshot`, `restore_snapshot`, `diff_snapshot`, `delete_snapshot` handlers | handlers | `handlers/snapshot-tool-handlers.ts:1-403` | Snapshot management for safe code modification and rollback; lazy-loaded with file handlers. |
| `format_code`, `lint_code`, `check_types` handlers | handlers | ~~`handlers/code-quality-tool-handlers.ts:1-298`~~ (deleted) | Code formatting and linting operations; lazy-loaded to defer formatter/linter startup. |
| `undo`, `get_undo_stack` handlers | handlers | ~~`handlers/undo-tool-handlers.ts:1-184`~~ (deleted) | Undo/rollback operations tracking recent file changes; lazy-loaded with modification tools. |
| `analyze_code_impact` handler | handler | ~~`handlers/code-impact-handler.ts:1-156`~~ (deleted) | Comprehensive impact analysis for code changes including breaking changes; lazy-loaded for heavy analysis. |

### Key Design Patterns

- **Soft 50KB limit via binary-search truncation**: Preserves essential fields (id, name, type, count).
- **Session isolation**: ToolContext carries session; projectPath resolves: explicit argument > session.projectPath > fallback directory.
- **Concurrency control**: Heavy tools (taint_analysis, graph_metrics, analyze_hotspots) serialized via pLimit(1) queue to prevent memory spikes.
- **Transport safety**: enforceResponseLimit double-checks Buffer.byteLength after handler execution to catch serialization growth.
- **Pagination**: Standard offset/limit pattern with PaginationMeta (total, offset, limit, truncated flag).
- **Argument validation**: All handlers use Zod schemas for type-safe, documented parameter parsing.

### Added Entities

- **formatAsText** — `text-formatter.ts:39-58`
- **formatTextObject** — `text-formatter.ts:63-93`
- **formatTextTable** — `text-formatter.ts:99-178`
- **formatAsMarkdown** — `text-formatter.ts:188-226`
- **formatMarkdownTable** — `text-formatter.ts:231-262`
- **formatMarkdownObject** — `text-formatter.ts:267-275`
- **keyToUpper** — `text-formatter.ts:286-288`
- **valueToStr** — `text-formatter.ts:294-308`
- **writeColumn** — `text-formatter.ts:315-323`
- **MAX_WIDTH** — `text-formatter.ts:23-23`
- **SKIP_KEYS** — `text-formatter.ts:26-26`
- **MAX_TABLE_ROWS** — `text-formatter.ts:29-29`
- **obj** — `text-formatter.ts:48-48`
- **errMsg** — `text-formatter.ts:52-52`
- **lines** — `text-formatter.ts:64-64`
- **pad** — `text-formatter.ts:65-65`
- **upper** — `text-formatter.ts:71-71`
- **items** — `text-formatter.ts:81-81`
- **first** — `text-formatter.ts:102-102`
- **colNames** — `text-formatter.ts:109-109`
- **rows** — `text-formatter.ts:118-118`
- **displayItems** — `text-formatter.ts:119-119`
- **obj** — `text-formatter.ts:122-122`
- **row** — `text-formatter.ts:123-123`
- **colWidths** — `text-formatter.ts:128-128`
- **gap** — `text-formatter.ts:136-136`
- **total** — `text-formatter.ts:137-137`
- **excess** — `text-formatter.ts:139-139`
- **take** — `text-formatter.ts:148-148`
- **shrink** — `text-formatter.ts:149-149`
- **lines** — `text-formatter.ts:157-157`
- **headerCells** — `text-formatter.ts:160-160`
- **sepWidth** — `text-formatter.ts:164-164`
- **cells** — `text-formatter.ts:169-169`
- **obj** — `text-formatter.ts:196-196`
- **errMsg** — `text-formatter.ts:200-200`
- **lines** — `text-formatter.ts:204-204`
- **upper** — `text-formatter.ts:211-211`
- **upper** — `text-formatter.ts:217-217`
- **first** — `text-formatter.ts:233-233`
- **colNames** — `text-formatter.ts:237-237`
- **lines** — `text-formatter.ts:243-243`
- **displayItems** — `text-formatter.ts:249-249`
- **obj** — `text-formatter.ts:252-252`
- **cells** — `text-formatter.ts:253-253`
- **lines** — `text-formatter.ts:268-268`
- **ci** — `text-formatter.ts:130-130`
- **shrinkable** — `text-formatter.ts:140-140`
- **remaining** — `text-formatter.ts:145-145`
- **i** — `text-formatter.ts:146-146`

