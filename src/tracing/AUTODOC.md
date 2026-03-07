---
module_name: tracing
description: "Static code flow analysis for understanding execution paths, data transformations, and state dependencies"
status: active
language: typescript
entry_point: index.ts
exports:
  - TraceEngine
  - PathBuilder
  - ConditionAnalyzer
  - DataFlowAnalyzer
  - StateTracker
  - OutputFormatter
dependencies:
  - graphology
  - graphology-shortest-path
  - src/types/storage.ts
  - src/logging/index.js
  - src/storage/graph-storage.ts
tags:
  - static-analysis
  - code-flow
  - data-flow
  - state-tracking
  - ngrx
  - tracing
---

# Semantic Tracing Module

## Overview

Static analysis module providing five core analysis capabilities: **trace_flow** (A to B execution paths), **trace_backwards** (why a method is not called), **trace_data_flow** (data transformation tracking), **analyze_state_impact** (state change ripple effects), and **find_decision_points** (branching detection). Uses an optimized graphology-based in-memory graph for O(V+E) traversal instead of repeated storage queries. The `TraceEngine` is the main coordinator, delegating to `PathBuilder`/`GraphologyPathBuilder` for graph traversal, `StateTracker` for state analysis, `ConditionAnalyzer` for decision points, `DataFlowAnalyzer` for data flows, and `OutputFormatter` for results rendering. NgRx-specific tracing is provided via `NgRxTraceEngine`. All analysis is async and operates on the entity/relationship graph from `GraphStorage`.

## Data Flow

```
GraphStorage (entities + relationships)
    |
TraceEngine (coordinator)
    |--- GraphologyPathBuilder (optimized in-memory graph, graphology)
    |--- PathBuilder (legacy BFS/DFS fallback)
    |--- StateTracker (state change detection)
    |--- ConditionAnalyzer (decision points)
    |--- DataFlowAnalyzer (data source/transform tracing)
    +--- OutputFormatter (text / mermaid / json)
    |
Results: TraceFlowResult, TraceBackwardsResult, TraceDataFlowResult,
         AnalyzeStateImpactResult, FindDecisionPointsResult
```

## Public API

| Export | Kind | Description | Location |
|--------|------|-------------|----------|
| `TraceEngine` | class | Main engine: `traceFlow()`, `traceBackwards()`, `getGraphStats()` | [`trace-engine.ts:48-48`](./trace-engine.ts) |
| `PathBuilder` | class | BFS/DFS traversal: `findPathsForward()`, `findPathsBackward()`, `getCallers()` | [`path-builder.ts:48-732`](./path-builder.ts) |
| `GraphologyPathBuilder` | class | Optimized graph: `loadGraph()`, `traceLinearFlow()`, `findPaths()` | [`graphology-path-builder.ts:118-894`](./graphology-path-builder.ts) |
| `ConditionAnalyzer` | class | Decision points: `findDecisionPoints()`, `analyzeConditions()` | [`condition-analyzer.ts:35-35`](./condition-analyzer.ts) |
| `DataFlowAnalyzer` | class | Data tracing: `traceDataFlow()`, `buildBehaviorMatrix()` | [`data-flow-analyzer.ts:58-495`](./data-flow-analyzer.ts) |
| `StateTracker` | class | State analysis: `detectStateChanges()`, `analyzeStateImpact()` | [`state-tracker.ts:38-511`](./state-tracker.ts) |
| `OutputFormatter` | class | Formatting: `formatTraceFlowAsText()`, `formatMermaidDiagram()` | [`output-formatter.ts:24-24`](./output-formatter.ts) |
| `NgRxTraceEngine` | class | NgRx-specific action/reducer/selector chain tracing | [`ngrx-trace-engine.ts:98-449`](./ngrx-trace-engine.ts) |
| `TraceFlowParams` | interface | Params: `from`, `to`, `trackStates?`, `maxDepth?`, `format?` | [`types.ts:76-89`](./types.ts) |
| `TraceFlowResult` | interface | Result: `paths[]`, `statesSummary`, `conditionsSummary`, `_debug?` | [`types.ts:192-217`](./types.ts) |
| `TraceBackwardsParams` | interface | Params: `target`, `question`, `depth?`, `includeStates?` | [`types.ts:231-242`](./types.ts) |
| `TraceBackwardsResult` | interface | Result: `callers[]`, `blockingConditions[]`, `diagnosis` | [`types.ts:321-339`](./types.ts) |
| `TraceDataFlowParams` | interface | Params: `entryPoint`, `targetState`, `dataSources?` | [`types.ts:348-357`](./types.ts) |
| `AnalyzeStateImpactParams` | interface | Params: `state`, `scenarios[]`, `scope?` | [`types.ts:442-452`](./types.ts) |
| `FindDecisionPointsParams` | interface | Params: `scenario`, `includeGuards?`, `groupBy?` | [`types.ts:523-532`](./types.ts) |

## Dependencies

| Dependency | Kind | Purpose |
|------------|------|---------|
| `graphology` | external | In-memory graph library for optimized traversal |
| `graphology-shortest-path` | external | Bidirectional shortest path algorithm |
| `src/types/storage.ts` | internal | `Entity`, `GraphStorage`, `Relationship`, `RelationType` |
| `src/logging/index.js` | internal | Logging service (`log.i`, `log.d`) |
| `src/storage/graph-storage.ts` | internal | Graph storage interface |
| `SemanticSearchService` | optional | Entity resolution via semantic similarity search |

## Configuration

| Parameter | Default | Purpose |
|-----------|---------|---------|
| `maxDepth` | 15 | Maximum traversal depth |
| `maxPaths` | 5 (engine) / 10 (builder) | Maximum paths returned |
| `useOptimized` | `true` | Enable graphology-based optimization |
| `minSimilarity` | 0.6 | Semantic search similarity threshold |
| `CONDITION_WEIGHT` | 0.3 | Path penalty for conditional branches |
| `CALL_WEIGHT` | 0.1 | Path penalty for call hops |
| `ASYNC_WEIGHT` | 0.2 | Path penalty for async boundaries |

## Behavioral Properties

Entity resolution supports file-qualified format (`src/file.ts:symbol`), falling back through exact name, suffix match, partial match, then semantic search. External/import stubs are excluded; real code types are prioritized. `PathBuilder` caches adjacency graphs keyed by `${ids}:${maxDepth}` and processes nodes in batches of 16. `StateTracker` classifies state via setter (`^set[A-Z]`), getter (`^get[A-Z]`), and boolean (`^(is|has|should|can|will)[A-Z]`) patterns. `ConditionAnalyzer` detects guard patterns (if-return), validation patterns (`valid|check|verify|assert`), and caches decision points per scenario. `DataFlowAnalyzer` classifies sources (API, storage, props, state, config, user_input) and transformations (parse, map, validate, normalize, merge) via regex patterns. The optimized mode loads the full graph once, then reuses it for subsequent calls.

## Error Handling

`TraceEngine` throws `Error("Could not find source/target entity: ${name}")` when entities are unresolvable. `DataFlowAnalyzer` throws `Error("Entry point not found: ${entryPoint}")`. Semantic search failures are caught silently for graceful degradation. When optimized mode fails, the engine falls back to legacy `PathBuilder`. Batch entity fetches fall back to individual `getEntity()` calls on failure. All caches expose `clearCache()` or `clear()` methods for invalidation.

## Observability

`TraceFlowResult` includes a `_debug` field with `sourceEntityId`, `targetEntityId`, `graphStats` (`nodes`, `edges`, `loadTimeMs`, `memoryMB`), `nodesVisited`, `found`, and `timeMs`. Info-level logs emit `"graph_loaded"` (load time, node/edge counts) and `"trace_done"` / `"back_trace_done"` (completion time, nodes visited). Debug-level logs emit `"resolved"` (entity resolution details) and `"multiple_suffix_matches"` (disambiguation warnings). `GraphologyPathBuilder.getStats()` returns live graph statistics.

## Known Limitations

1. First `traceFlow()` call incurs graph load latency (~100-500ms); subsequent calls reuse the cache.
2. `maxPaths` cap means complex codebases may have more valid paths than returned.
3. Semantic search is optional; entity resolution degrades without it.
4. Static analysis cannot detect runtime-only conditions; state values are marked "unknown".
5. NgRx support covers common patterns (actions, reducers, selectors, effects) but may miss custom patterns.
6. Visited-set cycle detection may reduce accuracy in highly cyclic architectures.
7. Full graph is loaded into memory; large codebases (10k+ entities) may consume 100+ MB.

## TypeScript Notes

Union types enforce valid values for `ConfidenceLevel`, `ImpactLevel`, `CallProbability`, `TraceActionType`, `DataFlowActionType`, and `DecisionPointType`. All analysis methods are `async` with `Promise.all()` for batch operations. Most result fields use optional properties (`?`); `_debug` is always present on `TraceFlowResult`. The `GraphStorage` interface is used as an abstraction for pluggable storage backends. `Entity` uses generic metadata typing via `Record<string, any>`.

## Exports

- `ConditionAnalyzer`
- `DataFlowAnalyzer`
- `clearAllGraphCaches`
- `getCachedGraphBuilder`
- `getTraceUsageCount`
- `incrementTraceUsage`
- `invalidateAndPreload`
- `OutputFormatter`
- `PathBuilder`
- `StateTracker`
- `TraceEngine`

## Files

| File | Lines | Purpose |
|------|-------|---------|
| [`index.ts`](./index.ts) | 39 | Module re-exports for all classes and types |
| [`types.ts`](./types.ts) | 660 | All interfaces and type aliases for tracing params/results |
| [`trace-engine.ts`](./trace-engine.ts) | 995 | Main coordinator: entity resolution, flow/backwards tracing |
| [`path-builder.ts`](./path-builder.ts) | 738 | BFS/DFS graph traversal with adjacency caching |
| [`graphology-path-builder.ts`](./graphology-path-builder.ts) | 900 | Optimized in-memory graph via graphology library |
| [`condition-analyzer.ts`](./condition-analyzer.ts) | 617 | Decision point detection, guard/validation analysis |
| [`data-flow-analyzer.ts`](./data-flow-analyzer.ts) | 501 | Data source classification and transformation tracing |
| [`state-tracker.ts`](./state-tracker.ts) | 517 | State change detection and impact analysis |
| [`output-formatter.ts`](./output-formatter.ts) | 571 | Text, Mermaid diagram, and JSON output formatting |
| [`ngrx-trace-engine.ts`](./ngrx-trace-engine.ts) | 455 | NgRx action/reducer/selector/effect chain tracing |
| [`ngrx-resolution.ts`](./ngrx-resolution.ts) | 201 | NgRx entity resolution and relationship type constants |
| [`path-enrichment.ts`](./path-enrichment.ts) | 189 | Path enrichment utilities: confidence, summaries, warnings |
