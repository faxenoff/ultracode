# Taint

## 🤖 Overview

The `taint` module is designed to analyze and track the flow of potentially tainted data within a software application. It identifies sources of untrusted input and sinks where this data might be used, helping developers understand and mitigate security risks such as injection attacks. This module is primarily used by developers and security analysts to ensure data integrity and prevent vulnerabilities.

## 🤖 Architecture

```
  +---------------------+
  |     TaintFlowAnalyzer |
  +---------------------+
          |
          v
  +---------------------+
  |     TaintFormatter   |
  +---------------------+
          |
          v
  +---------------------+
  |     TaintCategory    |
  +---------------------+
          |
          v
  +---------------------+
  |     SourcePattern    |
  +---------------------+
          |
          v
  +---------------------+
  |     SinkPattern      |
  +---------------------+
          |
          v
  +---------------------+
  |     SanitizerPattern |
  +---------------------+
```

## 🤖 Flow

```
  +---------------------+
  |     TaintFlowAnalyzer |
  +---------------------+
          |
          v
  +---------------------+
  |     TaintFormatter   |
  +---------------------+
          |
          v
  +----------------
  |     TaintCategory |
  +----------------+
          |
          v
  +----------------+
  |     SourcePattern |
  +----------------+
          |
          v
  +----------------+
  |     SinkPattern  |
  +----------------+
          |
          v
  +----------------+
  |     SanitizerPattern |
  +----------------+
```

## 🤖 Entity Listing

### Function
- **buildCombinedRegex** — Builds a combined regular expression pattern from sources `catalogs.ts:440-443`
- **categorySinks** — Filters sinks based on the target category `taint-flow-analyzer.ts:128-128`
- **classifyAsSanitizer** — Represents a sanitizer pattern for sanitizing untrusted data `catalogs.ts:478-488`
- **classifyAsSink** — Represents a sink pattern for untrusted data output points `catalogs.ts:466-476`
- **classifyAsSource** — Classifies a pattern as a source pattern `catalogs.ts:456-464`
- **entities** — A list of entities in the graph, filtered based on test file patterns `taint-flow-analyzer.ts:66-66`
- **entityMap** — Creates a map of all entities by their IDs `taint-flow-analyzer.ts:249-249`
- **hasTaintRelevance** — Determines if the pattern has taint relevance `catalogs.ts:452-454`
- **lookupSemantic** — Looks up a semantic by method name, handling both exact and suffix matches `flow-semantics.ts:186-198`
- **matchingCategories** — Filters categories that match the target category `taint-flow-analyzer.ts:181-181`
- **propagateTaint** — Propagates taint information based on semantic mappings and source taint status `flow-semantics.ts:212-237`
- **relevantSanitizers** — Filters sanitizers that protect against the specified category `taint-flow-analyzer.ts:200-200`
- **sanitized** — Filters vulnerabilities that are sanitized `taint-formatter.ts:31-31`
- **sanitizer** — Finds a sanitizer based on the entity ID `taint-flow-analyzer.ts:564-564`
- **sources** — An array of source patterns used to build the combined regular expression `catalogs.ts:441-441`
- **unsanitized** — Filters vulnerabilities that are not sanitized `taint-formatter.ts:30-30`

### Method
- **analyze** — Analyzes the taint flow in the graph based on provided parameters `taint-flow-analyzer.ts:51-272`
- **buildFlowSteps** — Builds a list of taint flow steps for a set of entity IDs, including their roles and metadata `taint-flow-analyzer.ts:532-557`
- **calculateConfidence** — Calculates the confidence level of a taint flow based on the length of the flow and whether it is sanitized `taint-flow-analyzer.ts:653-665`
- **calculateSeverity** — Calculates the severity of a taint category based on whether it is sanitized and the length of the taint flow path `taint-flow-analyzer.ts:631-651`
- **computeReachableSet** — Computes the set of reachable nodes from a given source node within a specified depth in a graph `taint-flow-analyzer.ts:282-313`
- **constructor** — Initializes the TaintFlowAnalyzer with a graph storage instance `taint-flow-analyzer.ts:41-49`
- **discoverAll** — Identifies all taint sources, sinks, and sanitizers from a list of entities, updating their metadata with taint classifications `taint-flow-analyzer.ts:381-526`
- **findSanitizersOnPath** — Finds all sanitizers along a given taint flow path `taint-flow-analyzer.ts:559-570`
- **formatAsJSON** — Converts taint analysis results into a JSON string `taint-formatter.ts:63-65`
- **formatAsText** — Generates a text-based summary of taint analysis results `taint-formatter.ts:4-55`
- **formatVulnerability** — Formats individual vulnerability details into a string `taint-formatter.ts:67-89`
- **persistTaintClassifications** — Persists newly classified taint sources, sinks, and sanitizers to the database, updating their metadata `taint-flow-analyzer.ts:576-625`
- **reconstructPath** — Reconstructs the path from a source node to a target node in a graph, using a breadth-first search approach `taint-flow-analyzer.ts:319-375`
- **suggestSanitizers** — Suggests sanitization strategies for a given taint category `taint-flow-analyzer.ts:667-700`
- **toSummary** — Creates a concise summary string of taint analysis results `taint-formatter.ts:57-61`

### Class
- **TaintFlowAnalyzer** — Represents a class for analyzing taint flow in a graph `taint-flow-analyzer.ts:36-701`
- **TaintFormatter** — A class for formatting taint analysis results into text, JSON, and vulnerability summaries `taint-formatter.ts:3-90`

### Interface
- **FlowMapping** — Represents how data flows between arguments and return value `flow-semantics.ts:19-24`
- **FlowSemantic** — Defines how taint propagates through a function call, including mappings, source, sink, and sanitizer flags `flow-semantics.ts:26-32`
- **SanitizerPattern** — Represents a pattern for sanitizing untrusted data with protections against taint categories `catalogs.ts:18-23`
- **SinkPattern** — Represents a pattern for untrusted data output points with categories and priority `catalogs.ts:10-16`
- **SourcePattern** — Represents a pattern for untrusted data entry points with a priority `catalogs.ts:3-8`
- **TaintAnalysisParams** — Parameters for a taint analysis, including project path, category, max depth, and include tests `types.ts:63-68`
- **TaintAnalysisResult** — The result of a taint analysis, including vulnerabilities, sources, sinks, sanitizers, and a summary `types.ts:70-89`
- **TaintFlowStep** — Represents a step in a taint flow, including its order, entity ID, name, file, line, and role `types.ts:43-50`
- **TaintSanitizer** — Describes a sanitizer that can protect against taint vulnerabilities `types.ts:32-39`
- **TaintSink** — Describes the sink of a taint vulnerability, including its location and type `types.ts:22-30`
- **TaintSource** — Describes the source of a taint vulnerability, including its location and type `types.ts:12-20`
- **TaintVulnerability** — Represents a vulnerability in the code, including its category, severity, source, sink, flow, and other metadata `types.ts:52-61`

### Type_alias
- **TaintCategory** — Represents the category of a taint vulnerability `types.ts:1-8`
- **TaintFlowRole** — Represents the role of a taint flow step, such as source, passthrough, sanitizer, or sink `types.ts:41-41`
- **TaintSeverity** — Defines the severity level of a taint vulnerability `types.ts:10-10`

### Import_decl
- **../../logging/index.js** — Imports `../../logging/index.js` from `../../logging/index.js`. `taint-flow-analyzer.ts:2-2`
- **../../tracing/graphology-path-builder.js** — Imports `../../tracing/graphology-path-builder.js` from `../../tracing/graphology-path-builder.js`. `taint-flow-analyzer.ts:3-3`, `taint-flow-analyzer.ts:4-4`
- **../../types/storage.js** — Imports `../../types/storage.js` from `../../types/storage.js`. `taint-flow-analyzer.ts:5-5`
- **./catalogs.js** — Imports `./catalogs.js` from `./catalogs.js`. `taint-flow-analyzer.ts:6-6`
- **./types.js** — Imports `./types.js` from `./types.js`. `catalogs.ts:1-1`, `taint-formatter.ts:1-1`
- **./types.js** — Imports `./types.js`. `taint-flow-analyzer.ts:7-17`
- **graphology** — Imports `graphology` from `graphology`. `taint-flow-analyzer.ts:1-1`

### Property
- **_cachedClassifications** — Represents cached classifications for the analysis `types.ts:87-87`
- **_elapsedMs** — Represents the elapsed time in milliseconds for the analysis `types.ts:86-86`
- **_limitReached** — Indicates whether the maximum number of vulnerabilities has been reached `types.ts:81-81`
- **_maxVulnerabilities** — Represents the maximum number of vulnerabilities allowed in the analysis `types.ts:82-82`
- **_sinksTotal** — Represents the total number of sinks in the analysis `types.ts:84-84`
- **_sourcesTotal** — Represents the total number of sources in the analysis `types.ts:83-83`
- **_timeoutReached** — Indicates whether the analysis has timed out `types.ts:85-85`
- **byCategory** — Counts the number of vulnerabilities by their categories `types.ts:78-78`
- **bySeverity** — Counts the number of vulnerabilities by their severity levels `types.ts:77-77`
- **cachedCount** — A count of newly classified entities in the taint analysis `taint-flow-analyzer.ts:385-385`
- **categories** — An array of taint categories associated with the untrusted data output point `catalogs.ts:13-13`
- **categories** — Lists the taint categories this sink pattern protects against `catalogs.ts:468-468`
- **categories** — Lists the categories that the taint flow analyzer protects against `taint-flow-analyzer.ts:406-406`
- **categories** — Categories of taint vulnerabilities that the taint sink protects against `types.ts:28-28`
- **category** — The category of a taint vulnerability `types.ts:53-53`
- **category** — Represents the category or a fallback value `types.ts:65-65`
- **confidence** — The confidence level of a taint vulnerability `types.ts:60-60`
- **description** — A brief description of the untrusted data entry point `catalogs.ts:6-6`
- **description** — Provides a brief description of the pattern `catalogs.ts:14-14`
- **description** — Stores the description of a catalog entry `catalogs.ts:22-22`
- **description** — Classifies code as a source with type, description, and priority `catalogs.ts:456-456`
- **description** — Classifies code as a source with type, categories, description, and priority `catalogs.ts:468-468`
- **description** — Returns a description object with type, protectsAgainst, and description fields `catalogs.ts:480-480`
- **description** — Provides an optional description for the taint flow analyzer `taint-flow-analyzer.ts:405-405`
- **description** — Description of the taint source `types.ts:18-18`
- **dst** — Indicates the destination of taint, with -1 for return value and 0..N for argument indices `flow-semantics.ts:23-23`
- **entityId** — The unique identifier for a taint flow step `types.ts:45-45`
- **file** — File path where the taint source, sink, or sanitizer is located `types.ts:15-15`
- **file** — The file path where a taint flow step is located `types.ts:25-25`
- **file** — Specifies the file path `types.ts:35-35`
- **file** — Indicates the file name where the entity is located `types.ts:47-47`
- **flow** — The flow of a taint vulnerability `types.ts:57-57`
- **id** — Unique identifier for a taint source, sink, or sanitizer `types.ts:13-13`
- **id** — Represents a unique identifier `types.ts:23-23`
- **id** — Represents a unique identifier as a string `types.ts:33-33`
- **includeTests** — Whether to include tests in a taint analysis `types.ts:67-67`
- **isSanitizer** — Indicates whether the function is a sanitizer, removing taint `flow-semantics.ts:29-29`
- **isSink** — Indicates whether the function is a sink, dangerous if tainted data reaches it `flow-semantics.ts:31-31`
- **isSource** — Indicates whether the function is a source, introducing tainted data `flow-semantics.ts:30-30`
- **line** — Line number in the file where the taint source, sink, or sanitizer is located `types.ts:16-16`
- **line** — The line number in the file where a taint flow step is located `types.ts:26-26`
- **line** — Indicates the line number `types.ts:36-36`
- **line** — Specifies the line number within the file where the entity is defined `types.ts:48-48`
- **mappings** — An array of FlowMapping objects that describe how taint flows within the function `flow-semantics.ts:28-28`
- **maxDepth** — The maximum depth for a taint analysis `types.ts:66-66`
- **metadata** — Merges metadata into the entity's metadata `taint-flow-analyzer.ts:618-618`
- **methodName** — The name of the function being analyzed `flow-semantics.ts:27-27`
- **missingSanitizers** — The list of missing sanitizers for a taint vulnerability `types.ts:59-59`
- **name** — Name of a taint source, sink, or sanitizer `types.ts:14-14`
- **name** — The name of a taint flow step `types.ts:24-24`
- **name** — Stores the name of an entity `types.ts:34-34`
- **name** — Stores the name of an entity as a string `types.ts:46-46`
- **newlyClassified** — A set of newly classified entities `taint-flow-analyzer.ts:386-386`
- **order** — The order of a taint flow step `types.ts:44-44`
- **pathBuilder** — Builds paths in the graph for taint analysis `taint-flow-analyzer.ts:38-38`
- **pattern** — A regular expression pattern for identifying untrusted data entry points `catalogs.ts:4-4`
- **pattern** — Represents a regular expression pattern `catalogs.ts:11-11`
- **pattern** — Builds a combined regular expression from an array of patterns `catalogs.ts:19-19`, `catalogs.ts:440-440`
- **priority** — The priority of the untrusted data entry point, with 1 being the highest `catalogs.ts:7-7`
- **priority** — Determines the priority of the pattern, with higher values indicating more critical untrusted data entry points `catalogs.ts:15-15`
- **priority** — Classifies code as a source with type, description, and priority `catalogs.ts:456-456`
- **priority** — Classifies code as a source with type, categories, description, and priority `catalogs.ts:468-468`
- **priority** — Determines the priority of the taint flow analyzer `taint-flow-analyzer.ts:408-408`
- **priority** — Priority level of the taint source `types.ts:19-19`
- **priority** — Indicates the priority level `types.ts:29-29`
- **projectPath** — The path to the project for a taint analysis `types.ts:64-64`
- **protectsAgainst** — An array of taint categories that the sanitizer protects against `catalogs.ts:21-21`
- **protectsAgainst** — Lists the taint categories this sanitizer pattern protects against `catalogs.ts:480-480`
- **protectsAgainst** — Specifies the categories that the taint flow analyzer protects against `taint-flow-analyzer.ts:407-407`
- **protectsAgainst** — Categories of taint vulnerabilities that the taint sanitizer protects against `types.ts:38-38`
- **role** — Represents the role of the taint flow analyzer `taint-flow-analyzer.ts:403-403`
- **role** — The role of a taint flow step `types.ts:49-49`
- **sanitized** — Indicates whether a taint vulnerability is sanitized `types.ts:58-58`
- **sanitizedFlows** — Counts the number of flows that have been sanitized `types.ts:79-79`
- **sanitizerIdSet** — A set of sanitizer IDs used in the taint analysis `taint-flow-analyzer.ts:39-39`
- **sanitizers** — A list of sanitizer entities identified in the taint analysis `taint-flow-analyzer.ts:384-384`
- **sanitizers** — Represents a sanitizer in a taint analysis, detailing its type and the categories it protects against `types.ts:74-74`
- **sanitizerType** — Type of the taint sanitizer `types.ts:37-37`
- **severity** — The severity level of a taint vulnerability `types.ts:54-54`
- **sink** — The sink of a taint vulnerability `types.ts:56-56`
- **sinks** — A list of sink entities identified in the taint analysis `taint-flow-analyzer.ts:383-383`
- **sinks** — Represents a sink in a taint analysis, detailing its type, categories, and priority `types.ts:73-73`
- **sinkType** — Type of the taint sink `types.ts:27-27`
- **source** — The source of a taint vulnerability `types.ts:55-55`
- **sources** — A list of source entities identified in the taint analysis `taint-flow-analyzer.ts:382-382`
- **sources** — Represents a list of taint sources `types.ts:72-72`
- **sourceType** — Type of the taint source `types.ts:17-17`
- **src** — Indicates the source of taint, with -1 for return value and 0..N for argument indices `flow-semantics.ts:21-21`
- **storage** — Stores the graph storage instance used by the TaintFlowAnalyzer `taint-flow-analyzer.ts:37-37`
- **summary** — Provides a summary of the taint analysis, including total vulnerabilities, by severity, by category, and flow statistics `types.ts:75-88`
- **totalVulnerabilities** — Counts the total number of vulnerabilities in the taint analysis `types.ts:76-76`
- **type** — The type of untrusted data entry point `catalogs.ts:5-5`
- **type** — Specifies the type of the pattern `catalogs.ts:12-12`
- **type** — Stores the type of a catalog entry `catalogs.ts:20-20`
- **type** — Classifies code as a source with type, description, and priority `catalogs.ts:456-456`
- **type** — Classifies code as a source with type, categories, description, and priority `catalogs.ts:468-468`
- **type** — Classifies code as a source with type, protectsAgainst, description, and priority `catalogs.ts:480-480`
- **type** — Specifies the type of the taint flow analyzer `taint-flow-analyzer.ts:404-404`
- **unsanitizedFlows** — Counts the number of flows that have not been sanitized `types.ts:80-80`
- **vulnerabilities** — Represents a list of taint vulnerabilities `types.ts:71-71`

## Dependencies

**Internal:**
- `response-limits.ts` — Provides `paginate()` utility function and `SAFE_LIMITS.taintVulnerabilities` configuration for result pagination and controlling maximum page size.
- `index.ts` (handler layer) — Enforces `MAX_RESPONSE_SIZE_BYTES` (50KB) transport safety limit on serialized responses and injects `_responseMeta` metadata for truncated result indication.

**Pattern catalog architecture:**
- Regex-based pattern matching using pre-compiled patterns for efficient source, sink, and sanitizer detection.
- Analysis routing through `pLimit(1)` queue ensuring serialized analysis execution to prevent concurrent memory spikes on heavyweight analysis operations.
