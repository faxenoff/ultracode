/**
 * Semantic Tracing Module
 *
 * Static code flow analysis for understanding code behavior without runtime.
 *
 * Tools:
 * - trace_flow: Trace execution from A to B
 * - trace_backwards: Find why method isn't called
 * - trace_data_flow: Track how data affects behavior
 * - analyze_state_impact: Understand state change effects
 * - find_decision_points: Identify all branching decisions
 *
 * Architecture References:
 * - Types: src/tracing/types.ts
 * - Storage: src/storage/graph-storage.ts
 */

// =============================================================================
// 1. TYPE EXPORTS
// =============================================================================

export * from "./types.js";

// =============================================================================
// 2. CLASS EXPORTS
// =============================================================================

export { ConditionAnalyzer } from "./condition-analyzer.js";
export { DataFlowAnalyzer } from "./data-flow-analyzer.js";
export {
  clearAllGraphCaches,
  getCachedGraphBuilder,
  getTraceUsageCount,
  incrementTraceUsage,
  invalidateAndPreload,
} from "./graph-cache.js";
export { OutputFormatter } from "./output-formatter.js";
export { PathBuilder } from "./path-builder.js";
export { StateTracker } from "./state-tracker.js";
export { TraceEngine } from "./trace-engine.js";

// =============================================================================
// 3. DEFAULT EXPORT
// =============================================================================

export { TraceEngine as default } from "./trace-engine.js";
