/**
 * Semantic Tracing Types
 *
 * Types for static code flow analysis, backwards tracing, and decision point detection.
 * Enables understanding of code behavior without runtime execution.
 *
 * Architecture References:
 * - Storage Types: src/types/storage.ts
 * - Chaos Analysis: src/types/chaos-analysis.ts
 * - Parser Types: src/types/parser.ts
 */

// =============================================================================
// 1. COMMON TYPES
// =============================================================================

/**
 * Confidence level for trace results
 */
export type ConfidenceLevel = "high" | "medium" | "low";

/**
 * Impact level for decision points
 */
export type ImpactLevel = "critical" | "high" | "medium" | "low";

/**
 * Probability that a call happens
 */
export type CallProbability = "always" | "conditional" | "rare";

/**
 * Type of action in a trace step
 */
export type TraceActionType =
  | "call" // Function/method call
  | "condition" // if/switch/ternary
  | "setState" // State mutation
  | "await" // Async await point
  | "return" // Return statement
  | "throw" // Exception throw
  | "loop" // Loop entry
  | "guard"; // Guard condition (early return)

/**
 * Type of data flow action
 */
export type DataFlowActionType =
  | "parse" // Parse/decode data
  | "transform" // Transform/map data
  | "branch" // Conditional branch based on data
  | "setState" // Set state from data
  | "fetch" // API/file fetch
  | "validate" // Data validation
  | "emit"; // Emit event/output

/**
 * Type of decision point
 */
export type DecisionPointType =
  | "validation" // Input validation
  | "api_response" // API response handling
  | "state_mutation" // State change
  | "guard" // Guard condition
  | "loop" // Loop control
  | "error_handling" // try-catch
  | "feature_flag"; // Feature toggle

// =============================================================================
// 2. TRACE FLOW TYPES (A → B analysis)
// =============================================================================

/**
 * Parameters for trace_flow tool
 */
export interface TraceFlowParams {
  /** Starting point (semantic search query or entity name) */
  from: string;
  /** Ending point (semantic search query or entity name) */
  to: string;
  /** Track state changes along the path */
  trackStates?: boolean;
  /** Track conditions (if/switch/case) */
  trackConditions?: boolean;
  /** Maximum depth of analysis */
  maxDepth?: number | undefined;
  /** Output format */
  format?: "sequence" | "tree" | "graph" | "mermaid";
}

/**
 * State change along a trace path
 */
export interface StateChange {
  /** Variable name */
  variable: string;
  /** Previous value (if known) */
  from?: string;
  /** New value (if known) */
  to?: string;
  /** Whether this is a mutation or assignment */
  isMutation?: boolean;
}

/**
 * Single step in a trace path
 */
export interface TraceStep {
  /** Order in the sequence (1-based) */
  order: number;
  /** Entity name (function/method/class) */
  entity: string;
  /** Entity ID in graph */
  entityId: string;
  /** File path */
  file: string;
  /** Line number */
  line: number;
  /** Type of action */
  action: TraceActionType;

  // For action === 'condition'
  /** Condition expression */
  condition?: string | undefined;
  /** Possible branches: outcome → next action description */
  branches?: Record<string, string> | undefined;

  // For action === 'setState'
  /** State changes made */
  stateChanges?: StateChange[] | undefined;

  // For action === 'await'
  /** Whether this step involves await */
  awaits?: boolean | undefined;
  /** What is being awaited */
  awaitTarget?: string | undefined;

  // Additional context
  /** Preconditions required for this step */
  preconditions?: string[] | undefined;
  /** Postconditions after this step */
  postconditions?: string[] | undefined;
  /** Documentation/comments */
  documentation?: string | undefined;
  /** Code snippet */
  code?: string | undefined;
}

/**
 * Complete trace path from A to B
 */
export interface TracePath {
  /** Unique path identifier */
  id: string;
  /** Confidence in this path (0-1) */
  confidence: number;
  /** Steps in the path */
  steps: TraceStep[];
  /** Human-readable summary */
  summary: string;
  /** Warnings about this path */
  warnings?: string[];
}

/**
 * Summary of states affected by trace
 */
export interface StatesSummary {
  /** States that are modified */
  modified: string[];
  /** States that are read */
  read: string[];
  /** Critical states (affect control flow) */
  critical: string[];
}

/**
 * Summary of conditions in trace
 */
export interface ConditionsSummary {
  /** Number of guard conditions */
  guards: number;
  /** Total number of branches */
  branches: number;
  /** Critical conditions that block paths */
  criticalConditions: string[];
}

/**
 * Result of trace_flow analysis
 */
export interface TraceFlowResult {
  /** Original from parameter */
  from: string;
  /** Original to parameter */
  to: string;
  /** All found paths */
  paths: TracePath[];
  /** Summary of state changes */
  statesSummary: StatesSummary;
  /** Summary of conditions */
  conditionsSummary: ConditionsSummary;
  /** Mermaid diagram (if format === 'mermaid') */
  mermaid?: string | undefined;
  /** Debug info for troubleshooting */
  _debug?: {
    sourceEntityId: string;
    sourceEntityName: string;
    targetEntityId: string;
    targetEntityName: string;
    graphStats: { nodes: number; edges: number; loadTimeMs: number; memoryMB: number };
    linearTraceSummary: string;
    nodesVisited: number;
    found: boolean;
    timeMs: number;
  };
}

// =============================================================================
// 3. TRACE BACKWARDS TYPES (Why X doesn't work?)
// =============================================================================

/**
 * Question type for backwards analysis
 */
export type BackwardsQuestion = "why_not_called" | "what_affects" | "dependencies";

/**
 * Parameters for trace_backwards tool
 */
export interface TraceBackwardsParams {
  /** Target method/function (semantic search query or name) */
  target: string;
  /** Type of analysis */
  question: BackwardsQuestion;
  /** Depth of backward analysis */
  depth?: number;
  /** Analyze state dependencies */
  includeStates?: boolean;
  /** Analyze side effects */
  includeEffects?: boolean;
}

/**
 * Caller information
 */
export interface CallerInfo {
  /** Caller name */
  name: string;
  /** Entity ID */
  entityId: string;
  /** File path */
  file: string;
  /** Line number */
  line: number;
  /** Condition under which call happens */
  condition?: string | undefined;
  /** Probability of call */
  probability: CallProbability;
  /** Code context */
  code?: string;
}

/**
 * Condition that may block execution
 */
export interface BlockingCondition {
  /** Condition expression */
  condition: string;
  /** Where the condition is checked */
  location: string;
  /** Current value (if known statically) */
  currentValue: string;
  /** Recommendation to fix */
  recommendation: string;
}

/**
 * State that the target depends on
 */
export interface StateDependency {
  /** State variable name */
  state: string;
  /** Entities that modify this state */
  modifiedBy: string[];
  /** Required value for target to work */
  requiredValue?: string;
  /** Type of the state */
  stateType?: string;
}

/**
 * Chain of calls leading to target
 */
export interface CallChain {
  /** String representation: ['A → B → C'] */
  chain: string[];
  /** Guards along the chain */
  guards: string[];
  /** Likelihood of this chain executing */
  likelihood: ConfidenceLevel;
  /** Entry point of the chain */
  entryPoint?: string | undefined;
}

/**
 * Diagnosis from backwards analysis
 */
export interface Diagnosis {
  /** Possible reasons for the issue */
  possibleReasons: string[];
  /** Suggested debug points */
  suggestedDebugPoints: string[];
  /** Most likely cause */
  mostLikely?: string | undefined;
}

/**
 * Result of trace_backwards analysis
 */
export interface TraceBackwardsResult {
  /** Target information */
  target: {
    name: string;
    entityId: string;
    file: string;
    signature: string;
  };
  /** All callers of the target */
  callers: CallerInfo[];
  /** Conditions that may block execution */
  blockingConditions: BlockingCondition[];
  /** States the target depends on */
  statesDependencies: StateDependency[];
  /** Call chains leading to target */
  callChains: CallChain[];
  /** Diagnosis */
  diagnosis: Diagnosis;
}

// =============================================================================
// 4. TRACE DATA FLOW TYPES (What data affects behavior?)
// =============================================================================

/**
 * Parameters for trace_data_flow tool
 */
export interface TraceDataFlowParams {
  /** Entry point (e.g., "AppInit()") */
  entryPoint: string;
  /** Target state to trace (e.g., "startPage") */
  targetState: string;
  /** Data sources to analyze (semantic search queries) */
  dataSources?: string[] | undefined;
  /** Track data transformations */
  trackTransformations?: boolean;
}

/**
 * Single step in data flow
 */
export interface DataFlowStep {
  /** Order in the flow */
  step: number;
  /** Location (file:line) */
  location: string;
  /** Type of action */
  action: DataFlowActionType;
  /** Input data description */
  input?: string;
  /** Output data description */
  output?: string;
  /** Transformation applied */
  transformation?: string;

  // For action === 'branch'
  /** Condition for branching */
  condition?: string | undefined;
  /** Branches: condition → next action */
  branches?: Record<string, string>;

  /** Code snippet */
  code?: string;
}

/**
 * Complete data flow from source to target
 */
export interface DataFlow {
  /** Data source name */
  source: string;
  /** Steps in the flow */
  flow: DataFlowStep[];
  /** Whether this flow affects the target */
  affectsTarget: boolean;
  /** Critical conditions in this flow */
  criticalConditions: string[];
}

/**
 * Behavior combination based on inputs
 */
export interface BehaviorCombination {
  /** Input values */
  inputs: Record<string, unknown>;
  /** Resulting state */
  result: Record<string, unknown>;
  /** Path description */
  path: string;
}

/**
 * Result of trace_data_flow analysis
 */
export interface TraceDataFlowResult {
  /** Entry point analyzed */
  entryPoint: string;
  /** Target state analyzed */
  targetState: string;
  /** All data flows found */
  dataFlows: DataFlow[];
  /** Behavior matrix */
  behaviorMatrix: {
    combinations: BehaviorCombination[];
  };
  /** Summary */
  summary: {
    dataSourcesAnalyzed: number;
    branchingPoints: number;
    possibleOutcomes: number;
    criticalDecisions: string[];
  };
}

// =============================================================================
// 5. ANALYZE STATE IMPACT TYPES
// =============================================================================

/**
 * Parameters for analyze_state_impact tool
 */
export interface AnalyzeStateImpactParams {
  /** State variable to analyze (e.g., "user.isAuthenticated") */
  state: string;
  /** Scenarios to analyze */
  scenarios: Array<{
    value: unknown;
    label: string;
  }>;
  /** Scope of analysis (semantic search query) */
  scope?: string | undefined;
}

/**
 * How state is used
 */
export interface StateUsage {
  /** Location (file:line) */
  location: string;
  /** Type of usage */
  usage: "condition" | "assignment" | "read" | "parameter";
  /** Code snippet */
  code: string;
  /** Entity name */
  entityName?: string;
}

/**
 * Analysis of a specific scenario
 */
export interface ScenarioAnalysis {
  /** Paths that are reachable */
  reachablePaths: string[];
  /** Paths that are blocked */
  blockedPaths: string[];
  /** Features that are enabled */
  enabledFeatures: string[];
  /** State changes that occur */
  stateChanges: string[];
}

/**
 * Conflict detected in state usage
 */
export interface StateConflict {
  /** Description of conflict */
  description: string;
  /** Location of conflict */
  location: string;
  /** Risk level */
  risk: string;
  /** Recommendation */
  recommendation: string;
}

/**
 * Result of analyze_state_impact
 */
export interface AnalyzeStateImpactResult {
  /** State that was analyzed */
  state: string;
  /** All usages of the state */
  usages: StateUsage[];
  /** Analysis per scenario */
  scenarioAnalysis: Record<string, ScenarioAnalysis>;
  /** Conflicts detected */
  conflicts: StateConflict[];
  /** Ripple effects */
  rippleEffects: {
    directEffects: number;
    indirectEffects: number;
    affectedComponents: string[];
  };
}

// =============================================================================
// 6. FIND DECISION POINTS TYPES
// =============================================================================

/**
 * Parameters for find_decision_points tool
 */
export interface FindDecisionPointsParams {
  /** Scenario to analyze (semantic search query) */
  scenario: string;
  /** Include guard conditions */
  includeGuards?: boolean;
  /** Include side effects */
  includeEffects?: boolean;
  /** How to group results */
  groupBy?: "impact" | "location" | "type";
}

/**
 * A decision point in the code
 */
export interface DecisionPoint {
  /** Unique ID */
  id: string;
  /** Location (file:line) */
  location: string;
  /** Type of decision */
  type: DecisionPointType;
  /** Condition (if applicable) */
  condition?: string | undefined;
  /** Action (if applicable) */
  action?: string;
  /** Possible outcomes */
  outcomes: Record<string, string>;
  /** Side effects */
  effects?: string[];
  /** Impact level */
  impact: ImpactLevel;
  /** Data this depends on */
  dataDepends: string[];
  /** What triggers this decision */
  triggeredBy?: string;
  /** Code snippet */
  code?: string;
}

/**
 * Result of find_decision_points
 */
export interface FindDecisionPointsResult {
  /** Scenario analyzed */
  scenario: string;
  /** Entry points for the scenario */
  entryPoints: Array<{ name: string; file: string }>;
  /** All decision points found */
  decisionPoints: DecisionPoint[];
  /** Flow diagram */
  flowDiagram: {
    mermaid: string;
  };
  /** Summary */
  summary: {
    totalDecisionPoints: number;
    criticalPoints: number;
    possibleOutcomes: number;
    statesModified: string[];
  };
}

// =============================================================================
// 7. INTERNAL TYPES (for PathBuilder, etc.)
// =============================================================================

/**
 * Raw path from graph traversal
 */
export interface RawPath {
  /** Entity IDs in path */
  entityIds: string[];
  /** Relationships traversed */
  relationships: string[];
  /** Total weight/cost */
  weight: number;
  /** Number of conditions encountered */
  conditionCount: number;
}

/**
 * Graph node for traversal
 */
export interface GraphNode {
  id: string;
  name: string;
  type: string;
  file: string;
  line: number;
  /** Outgoing edges (calls) */
  outgoing: string[];
  /** Incoming edges (callers) */
  incoming: string[];
  /** Control flow info */
  controlFlow?: {
    branches?: Array<{ condition: string; target?: string }>;
    loops?: Array<{ type: string; condition?: string }>;
    awaits?: Array<{ target?: string }>;
    exceptions?: Array<{ type: string }>;
  };
  /** Calls made */
  calls?: Array<{ name: string; target?: string | undefined; isAwait?: boolean }>;
  /** Complexity metrics */
  complexity?: {
    cyclomatic?: number;
    cognitive?: number;
  };
}

/**
 * Adjacency list representation for fast traversal
 */
export interface AdjacencyGraph {
  /** Node ID → GraphNode */
  nodes: Map<string, GraphNode>;
  /** Forward edges: from → [to] */
  forward: Map<string, string[]>;
  /** Backward edges: to → [from] */
  backward: Map<string, string[]>;
  /** Edge weights */
  weights: Map<string, number>;
}

/**
 * Options for path finding algorithms
 */
export interface PathFindingOptions {
  /** Maximum depth */
  maxDepth: number;
  /** Maximum paths to find */
  maxPaths: number;
  /** Follow only CALLS relationships */
  callsOnly?: boolean;
  /** Include conditional paths */
  includeConditional?: boolean;
  /** Weight threshold for pruning */
  weightThreshold?: number;
}
