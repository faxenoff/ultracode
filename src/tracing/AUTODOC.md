# Tracing Module

Static code flow analysis for understanding code behavior without runtime execution

## Overview

The Tracing module provides static code flow analysis without runtime execution, enabling five core analysis patterns: **trace_flow** (forward execution paths from A to B), **trace_backwards** (reverse analysis to find why a method isn't called), **trace_data_flow** (track data transformations through execution), **analyze_state_impact** (ripple effects of state changes), and **find_decision_points** (branching and guard detection). The `TraceEngine` is the primary coordinator, delegating traversal to `GraphologyPathBuilder` (optimized in-memory graph using graphology) or `PathBuilder` (fallback BFS/DFS), while specialized analyzers handle state (`StateTracker`), conditions (`ConditionAnalyzer`), and data sources (`DataFlowAnalyzer`). NgRx patterns are handled by dedicated `NgRxTraceEngine`. All analysis operates on the entity/relationship graph from `GraphStorage` and produces formatted results via `OutputFormatter`.

## Flow

```
GraphStorage (entities, relationships)
         ↓
   TraceEngine (request coordinator)
    /    |    \    |    \
   /     |     \   |     \
  ↓      ↓      ↓  ↓      ↓
GraphologyPathBuilder  StateTracker  ConditionAnalyzer  DataFlowAnalyzer  PathBuilder
(optimized traversal)  (state change) (decision points)  (data sources)     (BFS/DFS)
         |                |                  |                |                |
         └────────────────┴──────────────────┴────────────────┘
                          ↓
                  OutputFormatter
                   (text/mermaid/json)
                          ↓
         TraceFlowResult / TraceBackwardsResult /
         TraceDataFlowResult / StateImpactResult /
         DecisionPointsResult
```

## Entity Listing

### Primary Classes (Engines & Analyzers)

| Entity | Kind | Description | Location |
|--------|------|-------------|----------|
| `TraceEngine` | class | Main coordination engine for all tracing operations; orchestrates `traceFlow()`, `traceBackwards()`, `traceDataFlow()`, `analyzeStateImpact()`, `findDecisionPoints()`; provides `getGraphStats()` and batch context retrieval. | `trace-engine.ts:48-48` |
| `GraphologyPathBuilder` | class | High-performance path traversal using in-memory graphology graph; loads full graph once, supports `loadGraph()`, `traceLinearFlow()`, `findPaths()`, `computePathMetrics()` with O(V+E) complexity for batch operations. | `graphology-path-builder.ts:118-894` |
| `PathBuilder` | class | BFS/DFS-based traversal with caching; methods include `findPathsForward()`, `findPathsBackward()`, `getCallers()`, `getCursorHierarchy()`; processes nodes in batches of 16 and caches adjacency graphs by scope. | `path-builder.ts:48-732` |
| `StateTracker` | class | Detects state changes and analyzes ripple effects; classifies state via setter/getter/boolean patterns; provides `detectStateChanges()`, `analyzeStateImpact()`, `traceStateFlow()`, `buildStateImpactMatrix()`. | `state-tracker.ts:38-511` |
| `ConditionAnalyzer` | class | Identifies branching logic, guards, and decision points; detects guard patterns (if-return), validation patterns (valid/check/verify), and caches decisions per scenario via `findDecisionPoints()`, `analyzeConditions()`. | `condition-analyzer.ts:35-611` |
| `DataFlowAnalyzer` | class | Traces data sources and transformations; classifies sources (API, storage, props, state, config, user_input) and transformations (parse, map, validate, normalize); provides `traceDataFlow()`, `buildBehaviorMatrix()`, `findDataSources()`. | `data-flow-analyzer.ts:58-495` |
| `OutputFormatter` | class | Renders analysis results in multiple formats; implements `formatTraceFlowAsText()`, `formatMermaidDiagram()`, `formatAsJSON()`, `formatDecisionPoints()` with indentation and styling. | `output-formatter.ts:24-585` |
| `NgRxTraceEngine` | class | NgRx-specific tracing for action→reducer→selector chains; provides `traceActionToEffects()`, `traceActionToReducer()`, `traceReducerToSelectors()`, `analyzeStoreImpact()`; understands dispatches, effects, and store subscriptions. | `ngrx-trace-engine.ts:98-449` |

### Interfaces & Parameter Types

| Entity | Kind | Description | Location |
|--------|------|-------------|----------|
| `NodeFlowContext` | interface | Per-entity execution context; contains `inputTypes`, `outputType`, `hasTransformation`, `conditionalHint`, `callers[]`, `callees[]`; used by `TraceEngine.getNodeFlowContext()`. | `trace-engine.ts:53-62` |
| `TraceFlowParams` | interface | Input parameters for `traceFlow()`; specifies `from`, `to` entity names/ids, optional `trackStates`, `maxDepth`, `format`, `useOptimized` flag. | `types.ts:76-89` |
| `TraceFlowResult` | interface | Output from `traceFlow()`; contains `paths[]` (execution sequences), `statesSummary`, `conditionsSummary`, optional `_debug`. | `types.ts:192-217` |
| `TraceBackwardsParams` | interface | Input for `traceBackwards()` reverse analysis; specifies `target` entity, `question` (diagnosis), optional `depth`, `includeStates`, `useOptimized`. | `types.ts:231-242` |
| `TraceBackwardsResult` | interface | Output from reverse analysis; lists `callers[]`, `blockingConditions[]`, diagnostic `blockingConditionsReason`, `diagnosis` explaining why method is unreachable. | `types.ts:321-339` |
| `TraceDataFlowParams` | interface | Input for `traceDataFlow()`; specifies `entryPoint`, `targetState`, optional `dataSources[]`, `maxDepth`, `scope`. | `types.ts:348-357` |
| `TraceDataFlowResult` | interface | Output from data flow analysis; contains `flows[]` (source→transform→state chains), `dataSummary`, `riskAssessment`, optional warnings. | `types.ts:358-380` |
| `AnalyzeStateImpactParams` | interface | Input for `analyzeStateImpact()`; specifies `state`, `scenarios[]`, optional `scope`, `maxDepth`, `trackActors`. | `types.ts:442-452` |
| `AnalyzeStateImpactResult` | interface | Output from state impact analysis; lists `impactAreas[]`, `cascades[]`, risk level, affected entities/selectors. | `types.ts:453-476` |
| `FindDecisionPointsParams` | interface | Input for `findDecisionPoints()`; specifies `scenario`, optional `includeGuards`, `groupBy` strategy (none/byType/byLevel), `minImpactLevel`. | `types.ts:523-532` |
| `FindDecisionPointsResult` | interface | Output from decision point detection; lists `decisionPoints[]`, `controlFlowMap`, `criticality` summary. | `types.ts:533-546` |

### Supporting Types & Enums

| Entity | Kind | Description | Location |
|--------|------|-------------|----------|
| `PathTrace` | interface | Single execution path with `nodes[]`, `edges[]`, `conditions[]`, `confidence`, `warningsCount`. | `types.ts:127-146` |
| `DecisionPoint` | interface | Identified branching decision; specifies `id`, `condition`, `impactLevel`, `type`, affected `entities[]`, resolved values. | `types.ts:489-489` |
| `StateChange` | interface | State modification record; contains `entity`, `property`, `previousValue`, `newValue`, `triggeredBy`, cascade info. | `types.ts:547-547` |
| `DataFlowEdge` | interface | Data source or transformation in sequence; specifies `from`, `to`, `type` (source/transform/sink), `confidence`, metadata. | `types.ts:381-405` |
| `ConditionsSummary` | interface | Summary of conditions encountered; lists `condition[]` entries with `type`, `frequency`, `impactLevel`. | `types.ts:218-230` |
| `ImpactLevel` | type | Severity classification: `critical` \| `high` \| `medium` \| `low`. | `types.ts:21` |
| `DecisionPointType` | type | Classification: `guard` \| `validation` \| `async_boundary` \| `state_check` \| `conditional_call`. | `types.ts:29` |

### Utilities & Helpers

| Entity | Kind | Description | Location |
|--------|------|-------------|----------|
| `clearAllGraphCaches()` | function | Clears all cached graphology graphs and analyzer caches; call after major codebase changes. | `graph-cache.ts` |
| `getCachedGraphBuilder()` | function | Retrieves existing cached `GraphologyPathBuilder` or `null` if cache miss. | `graph-cache.ts` |
| `invalidateAndPreload()` | function | Invalidates cache and preloads graph for subsequent operations; useful before batch analysis. | `graph-cache.ts` |
| `getTraceUsageCount()` | function | Returns number of trace operations executed in current session. | `graph-cache.ts` |
| `incrementTraceUsage()` | function | Increments trace operation counter (internal usage tracking). | `graph-cache.ts` |
| `NgRxResolution` | class | Resolves NgRx patterns (actions, effects, reducers, selectors); identifies relationships between store members. | `ngrx-resolution.ts:199-201` |
| `enrichPathWithMetadata()` | function | Adds confidence scores, summaries, and warnings to `PathTrace` output. | `path-enrichment.ts:187-189` |


### Added Entities

- **Builder** — `cfg-builder.ts:95-109`
- **BitSet** — `reaching-definitions.ts:45-111`
- **CfgNode** — `cfg-builder.ts:31-38`
- **CfgEdge** — `cfg-builder.ts:40-44`
- **MethodCfg** — `cfg-builder.ts:46-51`
- **VariableDep** — `condition-trace.ts:24-30`
- **VariableTraceResult** — `condition-trace.ts:32-38`
- **Condition** — `condition-types.ts:49-56`
- **Contradiction** — `condition-types.ts:60-64`
- **NarrowedType** — `condition-types.ts:66-70`
- **ConditionResult** — `condition-types.ts:72-78`
- **Definition** — `reaching-definitions.ts:24-29`
- **ReachingDefResult** — `reaching-definitions.ts:31-39`
- **ConditionDependency** — `condition-trace.ts:15-22`
- **classifyLine** — `cfg-builder.ts:78-89`
- **buildCfgFromSource** — `cfg-builder.ts:132-237`
- **getSuccessors** — `cfg-builder.ts:242-244`
- **getPredecessors** — `cfg-builder.ts:249-251`
- **analyzeVariableDepsTextBased** — `condition-trace.ts:52-102`
- **classifyLine** — `condition-trace.ts:110-124`
- **measureIndent** — `condition-trace.ts:126-134`
- **extractConditionsBackward** — `condition-trace.ts:136-160`
- **escapeRegex** — `condition-trace.ts:162-164`
- **negateOp** — `condition-types.ts:31-47`
- **extractSimpleIdent** — `condition-types.ts:95-98`
- **extractCondition** — `condition-types.ts:103-248`
- **areContradictory** — `condition-types.ts:254-278`
- **detectContradictions** — `condition-types.ts:283-292`
- **detectDeadBranches** — `condition-types.ts:297-299`
- **extractNarrowedTypes** — `condition-types.ts:304-308`
- **analyzeConditions** — `condition-types.ts:314-338`
- **extractDefinitionsFromLines** — `reaching-definitions.ts:159-206`
- **extractParameterDefs** — `reaching-definitions.ts:209-236`
- **solveReachingDefinitions** — `reaching-definitions.ts:251-343`
- **defReachesNode** — `reaching-definitions.ts:352-356`
- **defsReachingNode** — `reaching-definitions.ts:361-373`
- **addNode** — `cfg-builder.ts:100-104`
- **addEdge** — `cfg-builder.ts:106-108`
- **constructor** — `reaching-definitions.ts:49-52`
- **empty** — `reaching-definitions.ts:54-56`
- **clone** — `reaching-definitions.ts:58-62`
- **set** — `reaching-definitions.ts:64-66`
- **unset** — `reaching-definitions.ts:68-70`
- **isSet** — `reaching-definitions.ts:72-74`
- **union** — `reaching-definitions.ts:77-81`
- **difference** — `reaching-definitions.ts:84-90`
- **equals** — `reaching-definitions.ts:93-98`
- **[Symbol.iterator]** — `reaching-definitions.ts:101-110`
- **IF_PATTERN** — `cfg-builder.ts:68-68`
- **ELSE_IF_PATTERN** — `cfg-builder.ts:69-69`
- **ELSE_PATTERN** — `cfg-builder.ts:70-70`
- **LOOP_PATTERN** — `cfg-builder.ts:71-71`
- **RETURN_PATTERN** — `cfg-builder.ts:72-72`
- **THROW_PATTERN** — `cfg-builder.ts:73-73`
- **TRY_PATTERN** — `cfg-builder.ts:74-74`
- **CATCH_PATTERN** — `cfg-builder.ts:75-75`
- **SKIP_PATTERN** — `cfg-builder.ts:76-76`
- **id** — `cfg-builder.ts:101-101`
- **MAX_LINES** — `cfg-builder.ts:115-115`
- **builder** — `cfg-builder.ts:133-133`
- **entryId** — `cfg-builder.ts:134-134`
- **exitId** — `cfg-builder.ts:135-135`
- **safeLines** — `cfg-builder.ts:140-140`
- **strategy** — `cfg-builder.ts:144-144`
- **stmtId** — `cfg-builder.ts:151-151`
- **mergeId** — `cfg-builder.ts:158-158`
- **trueId** — `cfg-builder.ts:159-159`
- **falseId** — `cfg-builder.ts:162-162`
- **stmtId** — `cfg-builder.ts:174-174`
- **headerId** — `cfg-builder.ts:181-181`
- **mergeId** — `cfg-builder.ts:184-184`
- **backId** — `cfg-builder.ts:185-185`
- **retId** — `cfg-builder.ts:194-194`
- **throwId** — `cfg-builder.ts:202-202`
- **stmtId** — `cfg-builder.ts:210-210`
- **catchId** — `cfg-builder.ts:217-217`
- **alreadyExits** — `cfg-builder.ts:226-226`
- **Existence** — `condition-trace.ts:17-17`
- **Value** — `condition-trace.ts:19-19`
- **Unconditional** — `condition-trace.ts:21-21`
- **COND_KEYWORDS** — `condition-trace.ts:44-44`
- **MAX_BACKWARD_LINES** — `condition-trace.ts:45-45`
- **MAX_CONDITIONS** — `condition-trace.ts:46-46`
- **lines** — `condition-trace.ts:59-59`
- **result** — `condition-trace.ts:60-66`
- **line** — `condition-trace.ts:70-70`
- **trimmed** — `condition-trace.ts:73-73`
- **defKind** — `condition-trace.ts:74-74`
- **indent** — `condition-trace.ts:78-78`
- **conditions** — `condition-trace.ts:81-81`
- **dep** — `condition-trace.ts:83-94`
- **conditions** — `condition-trace.ts:137-137`
- **line** — `condition-trace.ts:141-141`
- **trimmed** — `condition-trace.ts:144-144`
- **lineIndent** — `condition-trace.ts:148-148`
- **firstWord** — `condition-trace.ts:152-152`
- **negations** — `condition-types.ts:32-45`
- **CONSTANT_TRUE** — `condition-types.ts:84-84`
- **CONSTANT_FALSE** — `condition-types.ts:85-85`
- **IDENT_RE** — `condition-types.ts:87-87`
- **TYPEOF_RE** — `condition-types.ts:88-88`
- **INSTANCEOF_RE** — `condition-types.ts:89-89`
- **NULL_CHECK_RE** — `condition-types.ts:90-90`
- **NULL_CHECK_REV_RE** — `condition-types.ts:91-91`
- **PYTHON_IS_NONE_RE** — `condition-types.ts:92-92`
- **BINARY_CMP_RE** — `condition-types.ts:93-93`
- **m** — `condition-types.ts:96-96`
- **trimmed** — `condition-types.ts:109-112`
- **inner** — `condition-types.ts:129-133`
- **cond** — `condition-types.ts:135-135`
- **ident** — `condition-types.ts:140-140`
- **typeofMatch** — `condition-types.ts:154-154`
- **instMatch** — `condition-types.ts:167-167`
- **pyNoneMatch** — `condition-types.ts:180-180`
- **isNot** — `condition-types.ts:182-182`
- **nullMatch** — `condition-types.ts:194-194`
- **variable** — `condition-types.ts:196-196`
- **isEq** — `condition-types.ts:197-197`
- **baseOp** — `condition-types.ts:198-198`
- **binMatch** — `condition-types.ts:210-210`
- **opMap** — `condition-types.ts:212-221`
- **baseOp** — `condition-types.ts:222-222`
- **ident** — `condition-types.ts:236-236`
- **aVal** — `condition-types.ts:272-272`
- **bVal** — `condition-types.ts:273-273`
- **contradictions** — `condition-types.ts:284-284`
- **reason** — `condition-types.ts:287-287`
- **conditions** — `condition-types.ts:315-315`
- **isTrueBranch** — `condition-types.ts:319-319`
- **line** — `condition-types.ts:320-320`
- **condMatch** — `condition-types.ts:323-323`
- **cond** — `condition-types.ts:325-325`
- **contradictions** — `condition-types.ts:330-330`
- **deadBranches** — `condition-types.ts:331-331`
- **narrowedTypes** — `condition-types.ts:332-332`
- **pathFeasibility** — `condition-types.ts:334-335`
- **copy** — `reaching-definitions.ts:59-59`
- **result** — `reaching-definitions.ts:85-85`
- **bit** — `reaching-definitions.ts:105-105`
- **DECL_PATTERN** — `reaching-definitions.ts:117-117`
- **ASSIGN_PATTERN** — `reaching-definitions.ts:118-118`
- **FOR_BINDING_PATTERN** — `reaching-definitions.ts:119-119`
- **CATCH_BINDING_PATTERN** — `reaching-definitions.ts:120-120`
- **IMPORT_PATTERN** — `reaching-definitions.ts:121-121`
- **PARAM_PATTERN** — `reaching-definitions.ts:122-122`
- **KEYWORDS** — `reaching-definitions.ts:124-157`
- **defs** — `reaching-definitions.ts:160-160`
- **lineIdx** — `reaching-definitions.ts:164-164`
- **line** — `reaching-definitions.ts:166-166`
- **declMatch** — `reaching-definitions.ts:169-169`
- **forMatch** — `reaching-definitions.ts:176-176`
- **catchMatch** — `reaching-definitions.ts:183-183`
- **catchVar** — `reaching-definitions.ts:184-184`
- **importMatch** — `reaching-definitions.ts:191-191`
- **importVar** — `reaching-definitions.ts:192-192`
- **assignMatch** — `reaching-definitions.ts:199-199`
- **defs** — `reaching-definitions.ts:210-210`
- **paramMatch** — `reaching-definitions.ts:211-211`
- **paramList** — `reaching-definitions.ts:214-214`
- **colonIdx** — `reaching-definitions.ts:218-218`
- **eqIdx** — `reaching-definitions.ts:221-221`
- **spaceIdx** — `reaching-definitions.ts:226-226`
- **varMatch** — `reaching-definitions.ts:229-229`
- **MAX_ITERATIONS** — `reaching-definitions.ts:242-242`
- **nodeCount** — `reaching-definitions.ts:252-252`
- **nodeIdToIdx** — `reaching-definitions.ts:255-255`
- **paramDefs** — `reaching-definitions.ts:261-261`
- **stmtDefs** — `reaching-definitions.ts:262-262`
- **definitions** — `reaching-definitions.ts:263-263`
- **defCount** — `reaching-definitions.ts:264-264`
- **genSets** — `reaching-definitions.ts:276-276`
- **killSets** — `reaching-definitions.ts:277-277`
- **def** — `reaching-definitions.ts:284-284`
- **nodeIdx** — `reaching-definitions.ts:285-285`
- **predecessors** — `reaching-definitions.ts:299-299`
- **fromIdx** — `reaching-definitions.ts:302-302`
- **toIdx** — `reaching-definitions.ts:303-303`
- **reachingIn** — `reaching-definitions.ts:310-310`
- **reachingOut** — `reaching-definitions.ts:311-311`
- **newIn** — `reaching-definitions.ts:322-322`
- **inMinusKill** — `reaching-definitions.ts:328-328`
- **newOut** — `reaching-definitions.ts:329-329`
- **idx** — `reaching-definitions.ts:353-353`
- **idx** — `reaching-definitions.ts:362-362`
- **inSet** — `reaching-definitions.ts:365-365`
- **matches** — `reaching-definitions.ts:366-366`
- **current** — `cfg-builder.ts:141-141`
- **i** — `cfg-builder.ts:143-143`
- **i** — `condition-trace.ts:69-69`
- **indent** — `condition-trace.ts:127-127`
- **scannedLines** — `condition-trace.ts:138-138`
- **i** — `condition-trace.ts:140-140`
- **i** — `condition-types.ts:285-285`
- **j** — `condition-types.ts:286-286`
- **i** — `reaching-definitions.ts:78-78`
- **i** — `reaching-definitions.ts:86-86`
- **i** — `reaching-definitions.ts:94-94`
- **w** — `reaching-definitions.ts:102-102`
- **word** — `reaching-definitions.ts:103-103`
- **p** — `reaching-definitions.ts:216-216`
- **i** — `reaching-definitions.ts:256-256`
- **i** — `reaching-definitions.ts:278-278`
- **di** — `reaching-definitions.ts:283-283`
- **oi** — `reaching-definitions.ts:291-291`
- **i** — `reaching-definitions.ts:300-300`
- **i** — `reaching-definitions.ts:312-312`
- **iteration** — `reaching-definitions.ts:317-317`
- **changed** — `reaching-definitions.ts:318-318`
- **n** — `reaching-definitions.ts:320-320`
- **CfgNodeType** — `cfg-builder.ts:17-27`
- **CfgEdgeType** — `cfg-builder.ts:29-29`
- **CfgStrategy** — `cfg-builder.ts:57-66`
- **DefKind** — `condition-trace.ts:108-108`
- **CondOp** — `condition-types.ts:17-29`
- **PathFeasibility** — `condition-types.ts:58-58`
- **DefKind** — `reaching-definitions.ts:22-22`

## Dependencies

### External Libraries

| Dependency | Purpose |
|------------|---------|
| `graphology` | In-memory graph library for optimized O(V+E) path traversal and batch operations. |
| `graphology-shortest-path` | Bidirectional shortest-path algorithm for efficient forward/backward analysis. |

### Internal Dependencies

| Dependency | Purpose | Location |
|------------|---------|----------|
| `GraphStorage` | Core entity/relationship graph interface; provides node and edge access. | `src/types/storage.ts` |
| `Entity`, `Relationship`, `RelationType` | Storage types defining code entities and their relationships. | `src/types/storage.ts` |
| `logging` | Debug and info logging service for trace operations. | ~~`src/logging/index.js`~~ (deleted) |
| `SemanticSearchService` | Optional service for entity resolution via semantic similarity when exact matches fail. | `src/semantic/...` |

## Configuration & Constants

### Optimization Settings

| Parameter | Default | Purpose |
|-----------|---------|---------|
| `useOptimized` | `true` | Enable graphology-based fast path builder instead of BFS fallback. |
| `maxDepth` | 15 | Maximum traversal depth to prevent infinite cycles and bound complexity. |
| `maxPaths` | 5–10 | Maximum execution paths returned per analysis (engine: 5, builder: 10). |
| `CONDITION_WEIGHT` | 0.3 | Path score penalty for conditional branches; lowers confidence. |
| `CALL_WEIGHT` | 0.1 | Path score penalty for inter-function calls. |
| `ASYNC_WEIGHT` | 0.2 | Path score penalty for async boundaries (promises, async/await). |
| `minSimilarity` | 0.6 | Semantic search threshold for fuzzy entity resolution. |

### Pattern Recognition

| Pattern | Purpose |
|---------|---------|
| Guard patterns: `/^if\s*\([^)]+\)\s*(return\|throw)/` | Detects early-exit guards. |
| Validation patterns: `/valid\|check\|verify\|assert/i` | Identifies validation logic. |
| Setter patterns: `/^set[A-Z]/` | Recognizes state setters. |
| Getter patterns: `/^get[A-Z]/` | Recognizes state getters. |
| Boolean patterns: `/^(is\|has\|should\|can\|will)[A-Z]/` | Identifies boolean properties. |

## Key Behavioral Properties

- **Entity Resolution**: Supports file-qualified format (`src/file.ts:symbol`); falls back through exact name match → suffix match → partial match → semantic search; excludes external/import stubs; prioritizes real code definitions.
- **Graph Caching**: `PathBuilder` caches adjacency graphs keyed by `${nodeIds}:${maxDepth}`; processes nodes in batches of 16 for efficiency; `GraphologyPathBuilder` loads full graph once and reuses for subsequent calls.
- **State Classification**: `StateTracker` uses regex patterns to classify entities (setter, getter, boolean) and tracks property mutations with change history.
- **Condition Detection**: `ConditionAnalyzer` identifies guards (if-return), validation (valid/verify), and caches decision points per scenario to avoid reanalysis.
- **Data Source Classification**: `DataFlowAnalyzer` categorizes sources (API, storage, props, state, config, user_input) and transformations (parse, map, validate, normalize, merge) via regex matching.
- **Optimized vs. Fallback Mode**: Optimized mode (default) loads graphology graph once; fallback uses BFS/DFS with caching; both produce identical results, optimized is 5–10x faster for batch operations.

## Error Handling

- **Unresolvable Entities**: `TraceEngine` throws `Error("Could not find source/target entity: ${name}")` when source or target cannot be resolved through all fallback strategies.
- **Data Flow Resolution**: `DataFlowAnalyzer` throws errors when entry point or target state is unresolvable; includes available entity suggestions in error message.
- **Circular Dependencies**: Both `PathBuilder` and `GraphologyPathBuilder` detect cycles and mark edges as circular; traced paths halt at cycle detection to prevent infinite output.
- **Empty Results**: Analysis methods return empty arrays (not errors) when no paths/decisions/flows are found, allowing downstream consumers to handle no-result cases gracefully.