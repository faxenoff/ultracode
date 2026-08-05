# Tools Module

## 🤖 Overview

This module provides tools for managing and analyzing agent metrics, including performance snapshots, resource usage, and knowledge bus summaries. It is used by developers and system administrators to monitor and optimize agent performance.

## 🤖 Architecture

```
  +-------------------+
  | Agent Metrics     |
  | (agent-metrics.ts)|
  +-------------------+
    |               |
    v               v
+-----------------+ +-----------------+
| Agent Summary   | | Resource Summary |
| (agent-summary.ts)| | (res-summary.ts) |
+-----------------+ +-----------------+
    |               |
    v               v
+-----------------+ +-----------------+
| Conductor Internal| | Bus Summary     |
| (conductor-internal.ts)| | (bus-summary.ts) |
+-----------------+ +-----------------+
```

## 🤖 Flow

```
  +-------------------+
  | Agent Metrics     |
  | (agent-metrics.ts)|
  +-------------------+
    |               |
    v               v
+-----------------+ +-----------------+
| Agent Summary   | | Resource Summary |
| (agent-summary.ts)| | (res-summary.ts) |
+-----------------+ +-----------------+
    |               |
    v               v
+-----------------+ +-----------------+
| Conductor Internal| | Bus Summary     |
| (conductor-internal.ts)| | (bus-summary.ts) |
+-----------------+ +-----------------+
```

## 🤖 Entity Listing

### Function
- **addCloneToStats** — Adds a clone to the statistics `jscpd.ts:451-465`
- **affectedFiles** — A list of files affected by the modification `impact-analyzer.ts:193-193`
- **allowedFormats** — A set of allowed file formats `jscpd.ts:253-253`
- **allRels** — Represents all relations in the graph storage `impact-analyzer.ts:321-321`
- **analysisLoader** — Returns a function that imports the analysis tool handlers `tool-registry.ts:154-154`
- **autodocLoader** — A lazy-loaded tool handler for autodoc, loaded on first use via dynamic imports `tool-registry.ts:215-215`
- **blankStats** — Represents statistics for blank lines `jscpd.ts:431-444`
- **branchLoader** — Returns a function that imports the branch tool handlers `tool-registry.ts:169-169`
- **buildJscpdOptions** — Constructs Jscpd run options based on provided parameters `jscpd.ts:138-154`
- **camelKey** — Converts snake_case keys to camelCase `base-tool-handler.ts:320-320`
- **cells** — Maps each cell to its formatted string representation `text-formatter.ts:169-169`
- **cells** — Maps column names to their corresponding string values `text-formatter.ts:253-253`
- **cleanupBranches** — Not present in the provided code `branch-tools.ts:156-173`
- **collectAgentMetrics** — Collects and returns metrics for agents `agent-metrics.ts:88-126`
- **colWidths** — Calculates the width of each column based on the length of its name `text-formatter.ts:128-128`
- **compileGlob** — Compiles a glob pattern for file matching `jscpd.ts:160-181`
- **compileReport** — Compiles a report of clone detection `jscpd.ts:467-517`
- **computeFingerprints** — Computes fingerprints for code snippets `jscpd.ts:356-379`
- **createSafeResponse** — Create a safe response with truncation `response-limits.ts:209-232`
- **dbSchemaLoader** — Returns a function that imports the DB schema tool handlers `tool-registry.ts:165-165`
- **details** — Represents details of a clone detection `jscpd.ts:589-601`
- **detectClones** — Detects clones in code `jscpd.ts:381-425`
- **diagramLoader** — A lazy-loaded tool handler for diagram, loaded on first use via dynamic imports `tool-registry.ts:241-241`
- **extractSnippet** — Extracts a snippet of code `jscpd.ts:523-539`
- **fileLoader** — Returns a function that imports the file tool handlers `tool-registry.ts:184-184`
- **formatAsMarkdown** — Convert any JSON data to markdown format `text-formatter.ts:188-226`
- **formatAsText** — Convert any JSON data to terminal-friendly plain text `text-formatter.ts:39-58`
- **formatImpactForResponse** — Formats the impact analysis result for API response `impact-analyzer.ts:617-643`
- **formatMarkdownObject** — Format object as markdown with bold keys `text-formatter.ts:267-275`
- **formatMarkdownTable** — Format array of objects as a markdown table `text-formatter.ts:231-262`
- **formatTextObject** — Format object as text with indented key-value pairs `text-formatter.ts:63-93`
- **formatTextTable** — Format array of objects as a fixed-width column table `text-formatter.ts:99-178`
- **gatherFiles** — Gathers files from a directory based on a pattern `jscpd.ts:247-282`
- **getBranchStatus** — Not present in the provided code `branch-tools.ts:100-151`
- **getChangedFiles** — Not present in the provided code `branch-tools.ts:178-199`
- **getGraphStats** — Retrieves statistics about the graph, including entities, relationships, and files `graph-query.ts:28-39`
- **getIndexDescription** — Returns the current index description `tool-definitions.ts:18-20`
- **getToolsList** — Returns a list of tool definitions `tool-definitions.ts:131-702`
- **graphMetricsLoader** — A lazy-loaded tool handler for graph metrics, loaded on first use via dynamic imports `tool-registry.ts:248-248`
- **headerCells** — Creates header cells by formatting column names and their widths `text-formatter.ts:160-160`
- **highRisk** — Represents a high-risk impact analysis result `impact-analyzer.ts:539-539`
- **historyLoader** — A lazy-loaded tool handler for history, loaded on first use via dynamic imports `tool-registry.ts:261-261`
- **items** — Maps each value to a string representation `text-formatter.ts:81-81`
- **keyToUpper** — Convert key to uppercase `text-formatter.ts:286-288`
- **likePattern** — Returns a pattern for SQL LIKE queries `graph-query.ts:3-5`
- **lineCount** — Counts the number of lines in a file `jscpd.ts:213-219`
- **listBranches** — List all indexed branches for a repository `branch-tools.ts:22-66`
- **makeFilter** — Creates a filter function for file matching `jscpd.ts:185-189`
- **mergeLoader** — A lazy-loaded tool handler for merge, loaded on first use via dynamic imports `tool-registry.ts:200-200`
- **newContent** — Creates new content `base-tool-handler.ts:215-275`
- **otherIds** — Stores other identifiers related to an entity `impact-analyzer.ts:365-365`
- **paginate** — Function to apply pagination to an array `response-limits.ts:50-68`
- **parseOutputFormat** — Parses the output format from tool arguments `base-tool-handler.ts:44-49`
- **parseSizeSpec** — Parses a size specification string `jscpd.ts:197-202`
- **patternLoader** — A lazy-loaded tool handler for pattern, loaded on first use via dynamic imports `tool-registry.ts:256-256`
- **queryGraphEntities** — Executes a query on the graph storage and returns entities, relationships, and statistics `graph-query.ts:7-26`
- **ratio** — Represents the ratio of clones `jscpd.ts:446-449`
- **resolveExtension** — Resolves the file extension for a given path `jscpd.ts:208-211`
- **row** — Maps column names to their corresponding string values `text-formatter.ts:123-123`
- **runJscpdCloneDetection** — Runs JSCPD clone detection `jscpd.ts:545-617`
- **scanDir** — Scans a directory for files matching a pattern `jscpd.ts:221-245`
- **semanticLoader** — Returns a function that imports the semantic tool handlers `tool-registry.ts:145-145`
- **sepWidth** — Calculates the width of the separator line between header and data rows `text-formatter.ts:164-164`
- **setIndexStatus** — Updates the dynamic description of the index status `tool-definitions.ts:14-16`
- **snapshotLoader** — Returns a function that imports the snapshot tool handlers `tool-registry.ts:177-177`
- **stacktraceLoader** — A lazy-loaded tool handler for stacktrace, loaded on first use via dynamic imports `tool-registry.ts:233-233`
- **summarize** — Generates a summary of an agent's current state and metrics `agent-metrics.ts:68-86`
- **switchBranch** — Switch to a different branch `branch-tools.ts:71-95`
- **taintLoader** — A lazy-loaded tool handler for taint, loaded on first use via dynamic imports `tool-registry.ts:237-237`
- **tokenise** — Tokenizes a file's content `jscpd.ts:297-338`
- **total** — Computes the total width of the row, including gaps between columns `text-formatter.ts:137-137`
- **totalAffected** — Calculates the total number of affected entities `impact-analyzer.ts:571-571`
- **tracingLoader** — A lazy-loaded tool handler for tracing, loaded on first use via dynamic imports `tool-registry.ts:207-207`
- **truncateArray** — Truncate array to a safe size `response-limits.ts:128-153`
- **truncateData** — Truncate data to a safe size `response-limits.ts:113-123`
- **truncateObject** — Truncate object to a safe size `response-limits.ts:158-203`
- **truncateResponse** — Truncate response to a safe size `response-limits.ts:84-107`
- **uniqueFiles** — Stores a set of unique file names `impact-analyzer.ts:526-526`
- **validationLoader** — A lazy-loaded tool handler for validation, loaded on first use via dynamic imports `tool-registry.ts:195-195`
- **valueToStr** — Convert value to string `text-formatter.ts:294-308`
- **withPagination** — Apply pagination to a response `response-limits.ts:254-262`
- **withProjectPath** — Extends a schema with a project path parameter for cross-project operations `base-schemas.ts:30-34`
- **worktreeLoader** — A lazy-loaded tool handler for worktree, loaded on first use via dynamic imports `tool-registry.ts:268-268`
- **writeColumn** — Formats a string to fit within a specified width, truncating if necessary `text-formatter.ts:315-323`
- **zigCompatLoader** — A lazy-loaded tool handler for zig compatibility, loaded on first use via dynamic imports `tool-registry.ts:275-275`
- **zodToJsonSchema** — Converts a Zod schema to a JSON schema `tool-definitions.ts:113-120`

### Method
- **analyzeModificationImpact** — Analyzes the impact of a modification to an entity `impact-analyzer.ts:96-130`
- **analyzeNewFileImpact** — Analyzes the impact of a new file being added `impact-analyzer.ts:135-180`
- **analyzeRenameImpact** — Analyzes the impact of renaming an entity `impact-analyzer.ts:185-222`
- **analyzeStateImpact** — Analyzes the impact on states modified by the code `impact-analyzer.ts:382-425`
- **applyResponseLimits** — Applies response size limits `base-tool-handler.ts:210-278`
- **calculateConfidence** — Determines the confidence level of the impact analysis `impact-analyzer.ts:583-595`
- **constructor** — Constructor for BaseToolHandler `base-tool-handler.ts:86-86`
- **constructor** — Initializes the ImpactAnalyzer with storage and optional semantic search `impact-analyzer.ts:80-91`
- **constructor** — Initializes the ToolRegistry with default handlers `tool-registry.ts:47-49`
- **convertToOutputFormat** — Converts the content of a ToolResult to a specified output format, handling JSON, markdown, and text modes `base-tool-handler.ts:344-373`
- **detectBreakingChanges** — Detects potential breaking changes in the code `impact-analyzer.ts:427-516`
- **detectSwaggerContractBreaks** — Detects contract breaks in Swagger documentation `impact-analyzer.ts:228-304`
- **emptyResult** — Represents an empty impact analysis result `impact-analyzer.ts:597-607`
- **ensureGraphStorageForProject** — Ensures graph storage for the project `base-tool-handler.ts:151-156`
- **ensureSemanticAgentForProject** — Ensures semantic agent for the project `base-tool-handler.ts:162-186`
- **findAllReferences** — Finds all references to the entity `impact-analyzer.ts:361-380`
- **findDirectCallers** — Finds direct callers of the modified entity `impact-analyzer.ts:310-359`
- **generateReviewSuggestions** — Generates review suggestions based on the analysis `impact-analyzer.ts:518-552`
- **generateSummary** — Generates a human-readable summary of the impact analysis `impact-analyzer.ts:554-581`
- **getHandler** — Retrieves a handler instance for a tool, supporting lazy loading `tool-registry.ts:69-87`
- **getProjectContext** — Retrieves project context `base-tool-handler.ts:96-98`
- **getProjectStoragePaths** — Retrieves project storage paths `base-tool-handler.ts:134-137`
- **getRegisteredTools** — Returns an array of all registered tool names `tool-registry.ts:99-101`
- **handle** — Executes a tool handler, processes arguments, and returns the result formatted according to the specified output format `base-tool-handler.ts:378-425`
- **has** — Checks if a tool is registered either immediately or lazily `tool-registry.ts:92-94`
- **isProjectIndexed** — Checks if the project is indexed `base-tool-handler.ts:142-145`
- **normalizeArgs** — Normalizes and converts arguments to a consistent format, preserving both snake_case and camelCase keys `base-tool-handler.ts:315-331`
- **register** — Registers an immediately-loaded tool handler `tool-registry.ts:54-56`
- **registerDefaultHandlers** — Registers default handlers for various tools, including both immediate and lazy-loaded tools `tool-registry.ts:106-287`
- **registerLazy** — Registers a lazy-loaded tool handler `tool-registry.ts:62-64`
- **resolveProjectPath** — Resolves project path `base-tool-handler.ts:108-129`
- **responseSize** — Calculates the total size of the text content in a ToolResult `base-tool-handler.ts:302-308`
- **sanitizeUtf** — Sanitizes UTF input `base-tool-handler.ts:202-205`
- **summarizeArgs** — Parses _format parameter from tool args `base-tool-handler.ts:283-297`

### Class
- **BaseToolHandler** — Base interface for MCP tool handlers `base-tool-handler.ts:82-426`
- **ImpactAnalyzer** — Class for the impact analyzer, which stores the graph storage and semantic search `impact-analyzer.ts:69-608`
- **ToolRegistry** — A class for managing tool handlers with lazy loading `tool-registry.ts:43-288`

### Interface
- **AgentExt** — An interface extending the Agent interface with an optional currentTask property `agent-metrics.ts:6-8`
- **AgentMetricsSnapshot** — Captures a snapshot of agent metrics at a specific timestamp `agent-metrics.ts:51-66`
- **AgentSummary** — An interface representing a summary of an agent, including its ID, type, status, and resource usage `agent-metrics.ts:25-36`
- **BusSummary** — Summarizes the state of the knowledge bus `agent-metrics.ts:44-49`
- **CloneDuplication** — Represents a duplication of code between two files, including source ID, start and end positions, and a fragment `jscpd.ts:26-32`
- **ConductorInternal** — An interface representing internal state of a conductor, including agents, pending tasks, and approval requirements `agent-metrics.ts:17-23`
- **DetectionOptions** — Options for detecting code clones, including minimum and maximum lines, size, tokens, and paths `jscpd.ts:42-55`
- **FileEntry** — An object representing a file entry with path and content `jscpd.ts:57-60`
- **IClone** — An interface representing a clone of code, including its format, whether it's new, found date, and two duplication details `jscpd.ts:34-40`
- **ImpactAnalysisResult** — Represents the result of an impact analysis, including direct callers, state impact, breaking changes, and review suggestions `impact-analyzer.ts:21-54`
- **ImpactAnalyzerOptions** — Options for the impact analyzer, including max caller depth, state analysis, and min confidence `impact-analyzer.ts:56-63`
- **JscpdCloneDetail** — An object containing details about a clone `jscpd.ts:73-77`
- **JscpdCloneResult** — Represents the result of a Jscpd clone detection `jscpd.ts:90-94`
- **JscpdCloneSummary** — An object containing a summary of clones `jscpd.ts:79-88`
- **JscpdRunOptions** — An object containing options for running Jscpd `jscpd.ts:62-71`
- **PaginatedResult** — Paginated result wrapper `response-limits.ts:42-45`
- **PaginationMeta** — Pagination metadata returned with paginated results `response-limits.ts:31-37`
- **PerfSnapshot** — An interface representing performance metrics of an agent `agent-metrics.ts:10-15`
- **ResSummary** — Summarizes resource usage and constraints for an agent `agent-metrics.ts:38-42`
- **TokenLocation** — Represents the location of a token within a file, including line, column, and position `jscpd.ts:20-24`
- **ToolContext** — An interface for managing the context of a tool execution, including request ID, configuration, and session `base-tool-handler.ts:51-80`
- **ToolDefinition** — Represents a tool with a name, description, and input schema `tool-definitions.ts:122-126`
- **ToolResult** — Represents the result of a tool execution, containing an array of text content `base-tool-handler.ts:28-33`
- **TruncationResult** — Truncation result interface `response-limits.ts:73-78`

### Type_alias
- **Fingerprint** — A fingerprint for a file `jscpd.ts:344-354`
- **FormatStats** — Represents statistics related to the formatting of the code `jscpd.ts:100-111`
- **GlobFilter** — A function to filter files based on a glob pattern `jscpd.ts:183-183`
- **LazyHandlerLoader** — A function that returns a promise of a tool handler constructor `tool-registry.ts:41-41`
- **NormLine** — A normalized line representation `jscpd.ts:288-295`
- **OutputFormat** — A type-safe enum for specifying the output format of tool responses `base-tool-handler.ts:41-41`
- **StatReport** — Represents a report of the code analysis statistics `jscpd.ts:113-117`
- **ToolHandlerConstructor** — A constructor function for base tool handlers `tool-registry.ts:40-40`

### Import_decl
- **../agents/conductor-orchestrator.js** — Imports `../agents/conductor-orchestrator.js` from `../agents/conductor-orchestrator.js`. `agent-metrics.ts:1-1`, `base-tool-handler.ts:15-15`
- **../agents/semantic-agent.js** — Imports `../agents/semantic-agent.js` from `../agents/semantic-agent.js`. `base-tool-handler.ts:16-16`
- **../core/auto-indexer.js** — Imports `../core/auto-indexer.js` from `../core/auto-indexer.js`. `base-tool-handler.ts:17-17`
- **../core/branch-manager.js** — Imports `../core/branch-manager.js` from `../core/branch-manager.js`. `base-tool-handler.ts:18-18`, `branch-tools.ts:12-12`
- **../core/client-session.js** — Imports `../core/client-session.js` from `../core/client-session.js`. `base-tool-handler.ts:19-19`
- **../core/git-watcher.js** — Imports `../core/git-watcher.js` from `../core/git-watcher.js`. `branch-tools.ts:13-13`
- **../core/knowledge-bus.js** — Imports `../core/knowledge-bus.js` from `../core/knowledge-bus.js`. `agent-metrics.ts:2-2`, `base-tool-handler.ts:20-20`
- **../core/resource-manager.js** — Imports `../core/resource-manager.js` from `../core/resource-manager.js`. `agent-metrics.ts:3-3`
- **../logging/index.js** — Imports `../logging/index.js` from `../logging/index.js`. `base-tool-handler.ts:21-21`
- **../shared/project-context.js** — Imports `../shared/project-context.js` from `../shared/project-context.js`. `base-tool-handler.ts:22-22`
- **../types/agent.js** — Imports `../types/agent.js` from `../types/agent.js`. `agent-metrics.ts:4-4`
- **../types/storage.js** — Imports `../types/storage.js` from `../types/storage.js`. `base-tool-handler.ts:23-23`, `graph-query.ts:1-1`, `impact-analyzer.ts:14-14`, `impact-analyzer.ts:15-15`
- **../utils/fast-hash.js** — Imports `../utils/fast-hash.js` from `../utils/fast-hash.js`. `jscpd.ts:4-4`
- **../versioning/version-manager.js** — Imports `../versioning/version-manager.js` from `../versioning/version-manager.js`. `base-tool-handler.ts:24-24`
- **./base-tool-handler.js** — Imports `./base-tool-handler.js` from `./base-tool-handler.js`. `tool-registry.ts:12-12`
- **./branch-schemas.js** — Imports `./branch-schemas.js` from `./branch-schemas.js`. `tool-definitions.ts:22-22`
- **./handlers/entity-tool-handlers.js** — Imports `./handlers/entity-tool-handlers.js`. `tool-registry.ts:13-17`
- **./handlers/get-tools-for-task-handler.js** — Imports `./handlers/get-tools-for-task-handler.js` from `./handlers/get-tools-for-task-handler.js`. `tool-registry.ts:18-18`
- **./handlers/graph-tool-handlers.js** — Imports `./handlers/graph-tool-handlers.js`. `tool-registry.ts:22-28`
- **./handlers/help-tool-handler.js** — Imports `./handlers/help-tool-handler.js` from `./handlers/help-tool-handler.js`. `tool-registry.ts:29-29`
- **./handlers/index-tool-handler.js** — Imports `./handlers/index-tool-handler.js` from `./handlers/index-tool-handler.js`. `tool-registry.ts:30-30`
- **./handlers/metrics-tool-handlers.js** — Imports `./handlers/metrics-tool-handlers.js`. `tool-registry.ts:31-38`
- **./response-limits.js** — Imports `./response-limits.js` from `./response-limits.js`. `base-tool-handler.ts:25-25`
- **./schemas/index.js** — Imports `./schemas/index.js`. `tool-definitions.ts:23-90`
- **./schemas/missing-tool-schemas.js** — Imports `./schemas/missing-tool-schemas.js`. `tool-definitions.ts:91-101`
- **./schemas/worktree-schemas.js** — Imports `./schemas/worktree-schemas.js`. `tool-definitions.ts:102-107`
- **./text-formatter.js** — Imports `./text-formatter.js` from `./text-formatter.js`. `base-tool-handler.ts:26-26`
- **./trace-schemas.js** — Imports `./trace-schemas.js` from `./trace-schemas.js`. `tool-definitions.ts:108-108`
- **node:fs** — Imports `node:fs` from `node:fs`. `jscpd.ts:1-1`
- **node:path** — Imports `node:path` from `node:path`. `jscpd.ts:2-2`
- **zod** — Imports `zod` from `zod`. `base-schemas.ts:8-8`, `branch-schemas.ts:7-7`, `tool-definitions.ts:7-7`

### Property
- **absolute** — A boolean indicating whether to use absolute paths `jscpd.ts:52-52`
- **affectedEntities** — Entities that depend on the state modified by the code change `impact-analyzer.ts:35-35`
- **affectsContract** — Indicates whether the modification affects the contract `impact-analyzer.ts:229-229`
- **agents** — A property representing a map of agents in a conductor `agent-metrics.ts:18-18`
- **agents** — Represents a collection of agents with their current tasks and performance metrics `agent-metrics.ts:63-63`
- **analyzed** — Indicates whether the impact analysis was performed `impact-analyzer.ts:23-23`
- **analyzeStates** — Boolean indicating whether to include state impact analysis `impact-analyzer.ts:60-60`
- **approvalRequired** — A property representing approval requirements in a conductor `agent-metrics.ts:21-21`
- **approvalsPending** — Counts the number of pending approvals `agent-metrics.ts:60-60`
- **averageProcessingTime** — Calculates the average processing time for tasks `agent-metrics.ts:56-56`
- **avgProcessingTime** — A property representing the average processing time of tasks by an agent `agent-metrics.ts:12-12`
- **bareExceptCount** — Counts the number of bare except blocks in the code `impact-analyzer.ts:477-477`
- **branches** — Array of branch objects containing metadata `branch-tools.ts:26-38`
- **breakingChanges** — Array of potential breaking changes, each with a description, location, and severity `impact-analyzer.ts:40-44`
- **byType** — Records the count of entities or relationships by type `graph-query.ts:29-29`
- **byType** — Represents the counts of relationships by type `graph-query.ts:30-30`
- **cacheHitRate** — A property representing the cache hit rate of an agent `agent-metrics.ts:14-14`
- **cacheHitRate** — Tracks the rate of cache hits for tasks `agent-metrics.ts:58-58`
- **capabilities** — A property representing the capabilities of an agent, including max concurrency, memory limit, and priority `agent-metrics.ts:32-32`
- **change** — A change that caused the rule violation `impact-analyzer.ts:232-232`
- **change** — Denotes a change in the codebase that needs analysis `impact-analyzer.ts:243-243`
- **clone** — An object representing a clone duplication `jscpd.ts:74-74`
- **cloneCount** — Represents the number of clones found in the code `jscpd.ts:86-86`
- **clones** — Stores the list of clones found in the code `jscpd.ts:87-87`
- **clones** — Contains an array of IClone objects `jscpd.ts:91-91`
- **clones** — Represents the number of clones `jscpd.ts:104-104`
- **colEnd** — The end column in a file `jscpd.ts:292-292`
- **colStart** — The start column in a file `jscpd.ts:291-291`
- **column** — The column number of a token `jscpd.ts:22-22`
- **conductor** — Manages agents and their performance metrics `agent-metrics.ts:53-62`
- **conductor** — Manages agents, their tasks, and performance metrics `agent-metrics.ts:89-89`
- **confidence** — Confidence level of the analysis, ranging from 0 to 1 `impact-analyzer.ts:53-53`
- **config** — The configuration for the tool `base-tool-handler.ts:53-53`
- **constraints** — Defines the resource constraints for an agent `agent-metrics.ts:40-40`
- **content** — An array of objects with type and text properties `base-tool-handler.ts:29-32`
- **content** — A string representing the content of a file `jscpd.ts:59-59`
- **contractBreaks** — A list of contract breaks detected `impact-analyzer.ts:230-235`
- **cpuUsagePercent** — A property representing the CPU usage of an agent in percent `agent-metrics.ts:31-31`
- **createAutoIndexContext** — Creates an auto-index context `base-tool-handler.ts:79-79`
- **currentBranch** — Current branch name `branch-tools.ts:39-39`
- **currentBranch** — Represents the current branch name or null `branch-tools.ts:104-104`
- **currentTask** — An optional property representing the current task of an agent `agent-metrics.ts:7-7`
- **currentTaskType** — Indicates the type of the current task being processed by an agent `agent-metrics.ts:34-34`
- **currentUsage** — Represents the current resource usage for an agent `agent-metrics.ts:41-41`
- **data** — Data array in the paginated result `response-limits.ts:43-43`
- **databaseExists** — Not present in the provided code `branch-tools.ts:114-114`
- **databasePath** — Represents the path to the database for a branch `branch-tools.ts:113-113`
- **dbPath** — Database path of the branch `branch-tools.ts:28-28`
- **deletedCount** — Not present in the provided code `branch-tools.ts:160-160`
- **description** — Description of a potential breaking change `impact-analyzer.ts:41-41`
- **description** — Provides a brief description of the tool `tool-definitions.ts:124-124`
- **detectionDate** — Stores the date when the code analysis was performed `jscpd.ts:114-114`
- **digest** — A digest value for a file `jscpd.ts:345-345`
- **directCallers** — Array of direct callers of the modified entity, each with name, file, and line number `impact-analyzer.ts:26-30`
- **directImplementationAttempts** — A property representing the number of direct implementation attempts in a conductor `agent-metrics.ts:22-22`
- **directImplementationAttempts** — Tracks the number of direct implementation attempts made by agents `agent-metrics.ts:61-61`
- **directory** — Directory path for the current project `base-tool-handler.ts:108-108`
- **duplicatedLines** — Stores the count of duplicated lines found in the code `jscpd.ts:82-82`
- **duplicatedLines** — Stores the number of duplicated lines `jscpd.ts:105-105`
- **duplicatedTokens** — Stores the count of duplicated tokens found in the code `jscpd.ts:83-83`
- **duplicatedTokens** — Stores the number of duplicated tokens `jscpd.ts:106-106`
- **duplicationA** — The first duplication detail `jscpd.ts:38-38`
- **duplicationB** — The second duplication detail `jscpd.ts:39-39`
- **duplicationPercentage** — Calculates the percentage of duplication in the code `jscpd.ts:84-84`
- **duplicationTokensPercentage** — Calculates the percentage of token duplication in the code `jscpd.ts:85-85`
- **end** — The end location of a duplication `jscpd.ts:29-29`
- **endpoint** — The endpoint where the change was made `impact-analyzer.ts:233-233`
- **endpoint** — Refers to a specific point of entry or function in the code `impact-analyzer.ts:244-244`
- **entities** — Represents entities in the graph `graph-query.ts:12-12`
- **entities** — Represents the total number of entities and their counts by type `graph-query.ts:29-29`
- **entityCount** — Represents the count of entities in a branch's metadata `branch-tools.ts:108-108`
- **entityCount** — Count of entities in the branch `branch-tools.ts:34-34`
- **entityId** — An identifier for an entity in the graph storage `impact-analyzer.ts:76-76`
- **entityId** — Returns an array of entities with their IDs and similarity scores `impact-analyzer.ts:86-86`
- **entry** — Represents an entry in the file system `jscpd.ts:382-382`
- **entry** — Represents a file entry with tokens and format `jscpd.ts:468-468`
- **entry** — Initializes an empty array of file data entries `jscpd.ts:572-572`
- **entryCount** — Counts the number of entries in the knowledge bus `agent-metrics.ts:46-46`
- **evalExecCount** — Counts the number of eval executions in the code `impact-analyzer.ts:477-477`
- **file** — The file path of the entity being analyzed `impact-analyzer.ts:137-137`
- **file** — Stores the file path of an entity `impact-analyzer.ts:361-361`
- **file** — File path of the entity being analyzed `impact-analyzer.ts:28-28`, `impact-analyzer.ts:370-370`
- **fileCount** — Represents the count of files in a branch's metadata `branch-tools.ts:110-110`
- **fileCount** — Count of files in the branch `branch-tools.ts:36-36`
- **files** — Not present in the provided code `branch-tools.ts:183-186`
- **files** — Represents files in the graph `graph-query.ts:31-31`
- **fmt** — The file format `jscpd.ts:347-347`
- **forceUnwrapCount** — Counts the number of force unwrap operations in the code `impact-analyzer.ts:497-497`
- **format** — The format of the clone `jscpd.ts:35-35`
- **format** — A string format for output `jscpd.ts:50-50`
- **format** — Represents the format of the code `jscpd.ts:382-382`
- **format** — Represents a file entry with tokens and format `jscpd.ts:468-468`
- **format** — Represents the format of the file data `jscpd.ts:572-572`
- **formats** — An array of strings representing formats `jscpd.ts:66-66`
- **formats** — An array of file formats to consider `jscpd.ts:116-116`
- **foundDate** — The date when the clone was found `jscpd.ts:37-37`
- **fragment** — The fragment of the duplicated code `jscpd.ts:31-31`
- **fromCol** — Represents the starting column number of a token `jscpd.ts:350-350`
- **fromLine** — Represents the starting line number of a token `jscpd.ts:348-348`
- **fromPos** — Represents the starting position of a token `jscpd.ts:352-352`
- **generatedFromSwagger** — Indicates that the entity was generated from a Swagger specification `impact-analyzer.ts:237-237`
- **getBranchManager** — Returns a branch manager instance `base-tool-handler.ts:73-73`
- **getConductor** — A function to get the conductor orchestrator `base-tool-handler.ts:69-69`
- **getGraphStorage** — A function to get the graph storage `base-tool-handler.ts:70-70`
- **getKnowledgeBus** — Returns a knowledge bus instance `base-tool-handler.ts:75-75`
- **getSemanticAgent** — Returns a semantic agent instance `base-tool-handler.ts:72-72`
- **getServiceContainer** — Returns a service container instance `base-tool-handler.ts:76-76`
- **getSnapshotManager** — Returns a snapshot manager instance `base-tool-handler.ts:74-74`
- **getSQLiteManager** — Returns a SQLite manager instance `base-tool-handler.ts:71-71`
- **handlers** — A map of immediately-loaded tool handlers `tool-registry.ts:44-44`
- **hash** — A hash value for a file `jscpd.ts:289-289`
- **hasMore** — Indicates if there are more items to fetch `response-limits.ts:35-35`
- **id** — A property representing the ID of an agent `agent-metrics.ts:26-26`
- **ignore** — An array of strings to ignore `jscpd.ts:49-49`
- **ignore** — Stores an array of strings to be ignored `jscpd.ts:65-65`
- **ignoreCase** — A boolean indicating whether to ignore case `jscpd.ts:54-54`
- **ignoreCase** — Indicates whether case should be ignored `jscpd.ts:70-70`
- **indexVersion** — Not present in the provided code `branch-tools.ts:111-111`
- **inputSchema** — Defines the schema for the input to the tool `tool-definitions.ts:125-125`
- **isGeneratedCode** — Indicates whether the code is generated `impact-analyzer.ts:236-236`
- **isNew** — Indicates whether the clone is new `jscpd.ts:36-36`
- **knowledgeBus** — Handles the knowledge bus, including topic count, entry count, and message queue size `agent-metrics.ts:65-65`
- **knowledgeBus** — Stores the knowledge bus instance for the agent `agent-metrics.ts:91-91`
- **lastAccessed** — Last accessed timestamp of the branch `branch-tools.ts:29-29`
- **lastActivity** — Records the timestamp of the last activity for an agent `agent-metrics.ts:35-35`
- **lastCommitHash** — Last commit hash of the branch `branch-tools.ts:32-32`
- **lastCommitHash** — Stores the hash of the last commit or null `branch-tools.ts:105-105`
- **lastIndexedAt** — Last indexed timestamp of the branch `branch-tools.ts:33-33`
- **lastIndexedAt** — Stores the timestamp of the last index operation `branch-tools.ts:107-107`
- **lazyHandlers** — A map of lazy-loaded tool handlers `tool-registry.ts:45-45`
- **limit** — A property representing the maximum number of results for semantic search `impact-analyzer.ts:75-75`
- **limit** — Represents the maximum number of entities to consider `impact-analyzer.ts:85-85`
- **limit** — Limit for pagination `response-limits.ts:33-33`
- **line** — Stores the line number of an entity `impact-analyzer.ts:361-361`
- **line** — Line number of the entity being analyzed `impact-analyzer.ts:29-29`, `impact-analyzer.ts:370-370`
- **line** — The line number of a token `jscpd.ts:21-21`
- **lineNum** — The line number in a file `jscpd.ts:290-290`
- **lines** — Stores the number of lines analyzed in the code `jscpd.ts:101-101`
- **location** — Location of a potential breaking change `impact-analyzer.ts:42-42`
- **maxCallerDepth** — Maximum depth for caller search `impact-analyzer.ts:58-58`
- **maxConcurrency** — Represents the maximum number of concurrent tasks an agent can handle `agent-metrics.ts:32-32`
- **maxLines** — The maximum number of lines for a clone `jscpd.ts:44-44`
- **maxLines** — A number representing the maximum number of lines `jscpd.ts:68-68`
- **maxResponseSize** — Maximum response size in bytes `base-tool-handler.ts:84-84`
- **maxSize** — The maximum size of a clone `jscpd.ts:45-45`
- **maxSize** — Maximum size for safe response `response-limits.ts:212-212`
- **memoryLimitMB** — Specifies the maximum memory usage in megabytes for an agent `agent-metrics.ts:32-32`
- **memoryUsageMB** — A property representing the memory usage of an agent in megabytes `agent-metrics.ts:30-30`
- **message** — Stores a message related to branch operations `branch-tools.ts:161-161`
- **message** — Message indicating the result of the branch switch `branch-tools.ts:79-79`
- **message** — A message describing the rule violation `impact-analyzer.ts:234-234`
- **message** — Contains a message or note related to the analysis `impact-analyzer.ts:245-245`
- **messageQueueSize** — Represents the size of the message queue in the knowledge bus `agent-metrics.ts:48-48`
- **metadata** — Metadata of the branch, including last commit hash, last indexed at, entity count, relationship count, and file count `branch-tools.ts:31-37`
- **metadata** — Contains metadata about the branch, including last indexed time, entity count, relationship count, file count, and index version `branch-tools.ts:106-112`
- **metrics** — Stores performance metrics for an agent `agent-metrics.ts:33-33`
- **minConfidence** — Minimum confidence to include in results `impact-analyzer.ts:62-62`
- **minLines** — The minimum number of lines for a clone `jscpd.ts:43-43`
- **minLines** — A number representing the minimum number of lines `jscpd.ts:67-67`
- **minSimilarity** — A property representing the minimum similarity threshold for semantic search `impact-analyzer.ts:75-75`
- **minSimilarity** — Specifies the minimum similarity threshold for entities `impact-analyzer.ts:85-85`
- **minTokens** — The minimum number of tokens for a clone `jscpd.ts:46-46`
- **minTokens** — A number representing the minimum number of tokens `jscpd.ts:69-69`
- **name** — Name of the branch `branch-tools.ts:27-27`
- **name** — The name of the entity being analyzed `impact-analyzer.ts:137-137`
- **name** — Stores the name of an entity `impact-analyzer.ts:361-361`
- **name** — Name of the entity being analyzed `impact-analyzer.ts:27-27`, `impact-analyzer.ts:370-370`
- **name** — Specifies the name of the tool `tool-definitions.ts:123-123`
- **newBranch** — New branch name after switching `branch-tools.ts:78-78`
- **newClones** — Stores the count of new clones found in the code `jscpd.ts:110-110`
- **newDuplicatedLines** — Stores the count of new duplicated lines found in the code `jscpd.ts:109-109`
- **nextOffset** — Next offset for pagination `response-limits.ts:36-36`
- **normalizeInputPath** — Normalizes an input path `base-tool-handler.ts:77-77`
- **noSymlinks** — A boolean indicating whether to ignore symbolic links `jscpd.ts:53-53`
- **offset** — Offset for pagination `response-limits.ts:32-32`
- **openWithoutWithCount** — Counts the number of open without with blocks in the code `impact-analyzer.ts:477-477`
- **originalSize** — Original size of the text `response-limits.ts:76-76`
- **overheadReduction** — A property representing the overhead reduction achieved by an agent `agent-metrics.ts:13-13`
- **overheadReduction** — Measures the reduction in overhead for tasks `agent-metrics.ts:57-57`
- **pagination** — Pagination metadata in the paginated result `response-limits.ts:44-44`
- **pagination** — Returns a response object with pagination metadata `response-limits.ts:257-257`
- **paramMutationCount** — Counts the number of parameter mutations in the code `impact-analyzer.ts:456-456`
- **path** — Not present in the provided code `branch-tools.ts:184-184`
- **path** — The path to the file `jscpd.ts:47-47`
- **path** — A string representing a file path `jscpd.ts:58-58`
- **paths** — An array of strings representing file paths `jscpd.ts:63-63`
- **pattern** — A string pattern to match files `jscpd.ts:48-48`
- **pattern** — Represents a string or undefined pattern `jscpd.ts:64-64`
- **pendingTasks** — A property representing pending tasks in a conductor `agent-metrics.ts:20-20`
- **pendingTasks** — Counts the number of pending tasks `agent-metrics.ts:59-59`
- **percentage** — Represents the percentage of duplication in the code `jscpd.ts:107-107`
- **percentageTokens** — Represents the percentage of token duplication in the code `jscpd.ts:108-108`
- **posEnd** — The end position in a file `jscpd.ts:294-294`
- **position** — The position of a token `jscpd.ts:23-23`
- **posStart** — The start position in a file `jscpd.ts:293-293`
- **previousBranch** — Previous branch name before switching `branch-tools.ts:77-77`
- **priority** — Indicates the priority level of an agent `agent-metrics.ts:32-32`
- **projectPath** — Project path for the current request `base-tool-handler.ts:108-108`
- **projectPath** — The project path for the request `base-tool-handler.ts:67-67`
- **queueLength** — A property representing the length of the task queue of an agent `agent-metrics.ts:29-29`
- **range** — The range of a duplication `jscpd.ts:30-30`
- **registeredAgents** — Counts the number of registered agents `agent-metrics.ts:54-54`
- **relationshipCount** — Represents the count of relationships in a branch's metadata `branch-tools.ts:109-109`
- **relationshipCount** — Count of relationships in the branch `branch-tools.ts:35-35`
- **relationships** — Represents relationships in the graph `graph-query.ts:13-13`
- **relationships** — Represents the total number of relationships and their counts by type `graph-query.ts:30-30`
- **requestId** — A unique identifier for the request `base-tool-handler.ts:52-52`
- **resourceManager** — Manages resource allocation and usage for agents `agent-metrics.ts:90-90`
- **resources** — Manages and tracks resource usage and constraints for agents `agent-metrics.ts:64-64`
- **reviewSuggestions** — Array of suggested review points `impact-analyzer.ts:47-47`
- **risk** — Risk level of the state impact, either low, medium, or high `impact-analyzer.ts:36-36`
- **rule** — A rule that was violated `impact-analyzer.ts:231-231`
- **rule** — Represents a rule or constraint in the code analysis `impact-analyzer.ts:242-242`
- **semanticSearch** — A function for semantic search with options for limit and minSimilarity `impact-analyzer.ts:71-78`
- **session** — A per-client session with isolated project state `base-tool-handler.ts:61-61`
- **severity** — Severity of a potential breaking change, either warning or error `impact-analyzer.ts:43-43`
- **silent** — A boolean indicating whether to suppress output `jscpd.ts:51-51`
- **similarity** — A measure of similarity between entities `impact-analyzer.ts:76-76`
- **similarity** — Returns an array of entities with their names, file paths, and similarity scores `impact-analyzer.ts:86-86`
- **similarity** — Stores an array of objects representing similar code with name, file, and similarity `impact-analyzer.ts:137-137`
- **sizeBytes** — Size of the branch in bytes `branch-tools.ts:30-30`
- **snippetA** — A string representing a snippet from one file `jscpd.ts:75-75`
- **snippetB** — A string representing a snippet from another file `jscpd.ts:76-76`
- **sourceId** — The unique identifier of the source file `jscpd.ts:27-27`
- **sources** — Stores the list of source files analyzed `jscpd.ts:103-103`
- **sources** — A list of source files to analyze `jscpd.ts:116-116`
- **srcPath** — The source file path `jscpd.ts:346-346`
- **start** — The start location of a duplication `jscpd.ts:28-28`
- **state** — State that is impacted by the code change `impact-analyzer.ts:34-34`
- **stateImpact** — Array of state impact details, including affected entities, risk, and state `impact-analyzer.ts:33-37`
- **statistic** — Represents a statistical summary of the code analysis `jscpd.ts:92-92`
- **stats** — Contains statistics about the number of entities and relationships `graph-query.ts:14-14`
- **status** — A property representing the status of an agent `agent-metrics.ts:28-28`
- **status** — Not present in the provided code `branch-tools.ts:185-185`
- **storage** — Graph storage used by the impact analyzer `impact-analyzer.ts:70-70`
- **subscriptionCount** — Counts the number of subscriptions in the knowledge bus `agent-metrics.ts:47-47`
- **success** — Boolean indicating success of the branch switch `branch-tools.ts:76-76`
- **summary** — Human-readable summary of the impact analysis `impact-analyzer.ts:50-50`
- **summary** — Provides a summary of the code analysis `jscpd.ts:93-93`
- **text** — Text content `base-tool-handler.ts:227-227`
- **text** — The actual text content of the result `base-tool-handler.ts:31-31`
- **text** — Truncated text `response-limits.ts:74-74`
- **throttled** — Indicates whether an agent is throttled due to resource constraints `agent-metrics.ts:39-39`
- **timestamp** — Records the timestamp of the metrics snapshot `agent-metrics.ts:52-52`
- **toCol** — Represents the ending column number of a token `jscpd.ts:351-351`
- **tokens** — Stores the number of tokens analyzed in the code `jscpd.ts:102-102`
- **tokens** — Represents tokens in the code `jscpd.ts:382-382`
- **tokens** — Represents a file entry with tokens and format `jscpd.ts:468-468`
- **tokens** — Initializes an empty array of file data entries `jscpd.ts:572-572`
- **toLine** — Represents the ending line number of a token `jscpd.ts:349-349`
- **topicCount** — Counts the number of topics in the knowledge bus `agent-metrics.ts:45-45`
- **toPos** — Represents the ending position of a token `jscpd.ts:353-353`
- **total** — Total number of entities or relationships `graph-query.ts:29-29`
- **total** — Represents the total number of relationships `graph-query.ts:30-30`
- **total** — Represents the total number of files `graph-query.ts:31-31`
- **total** — Represents the total number of files analyzed `jscpd.ts:115-115`
- **total** — A counter for total files processed `jscpd.ts:116-116`
- **total** — Total number of items `response-limits.ts:34-34`
- **totalEntities** — Total number of entities in the graph `graph-query.ts:14-14`
- **totalFiles** — Not present in the provided code `branch-tools.ts:187-187`
- **totalLinesAnalyzed** — A number representing the total lines analyzed `jscpd.ts:80-80`
- **totalRelationships** — Total number of relationships in the graph `graph-query.ts:14-14`
- **totalTasks** — A property representing the total number of tasks processed by an agent `agent-metrics.ts:11-11`
- **totalTasks** — Tracks the total number of tasks processed by agents `agent-metrics.ts:55-55`
- **totalTokensAnalyzed** — Represents the total number of tokens analyzed in the code `jscpd.ts:81-81`
- **truncatedSize** — Truncated size of the text `response-limits.ts:77-77`
- **type** — A property representing the type of an agent `agent-metrics.ts:7-7`
- **type** — Represents the type of the agent `agent-metrics.ts:27-27`
- **type** — Type of content `base-tool-handler.ts:227-227`
- **type** — The type of content, either "text" or "json" or "markdown" `base-tool-handler.ts:30-30`
- **typeAssertionCount** — Counts the number of type assertions in the code `impact-analyzer.ts:456-456`
- **unsafeCastCount** — Counts the number of unsafe casts in the code `impact-analyzer.ts:497-497`
- **wasTruncated** — Indicates if the text was truncated `response-limits.ts:75-75`
- **withTimeout** — Wraps a promise with a timeout `base-tool-handler.ts:78-78`

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
| `collectAgentMetrics()` | async function | `agent-metrics.ts:41-166` | Collects and aggregates real-time performance metrics from system components into a single snapshot. |
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
| `Fingerprint` | interface | `jscpd.ts:323-351` | Compact representation of a token sequence using first/last tokens and rolling hash for efficient clone matching. |

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
| `getChangedFiles()` | async function | `branch-tools.ts:163-196` | Lists files changed on the current branch relative to merge base. |

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
