/**
 * Chaos Analysis - Types and interfaces for state sprawl detection
 *
 * Analyzes code for scattered state management patterns and suggests refactoring strategies.
 * Focuses on TypeScript/JavaScript and Angular projects.
 */

// ============================================================================
// Core Types
// ============================================================================

/**
 * Operation type on state variable
 */
export type StateOperationType =
  | "read" // Reading state value
  | "write" // Modifying state value
  | "check" // Conditional check (if/switch)
  | "store" // Local storage/copy
  | "initialize" // Initial creation
  | "pass" // Passing to another function/component
  | "subscribe" // RxJS subscription
  | "emit"; // EventEmitter/Subject.next()

/**
 * Angular-specific state management pattern
 */
export type AngularStatePattern =
  | "input" // @Input() property
  | "output" // @Output() EventEmitter
  | "service" // Injectable service
  | "behavior_subject" // BehaviorSubject
  | "signal" // Angular Signal
  | "template_ref" // Template variable
  | "view_child" // @ViewChild()
  | "local_storage"; // localStorage/sessionStorage

/**
 * Technology detection result
 */
export interface TechnologyContext {
  framework: "angular" | "react" | "vue" | "vanilla" | "unknown";
  version?: string;
  stateManagement?: string[]; // e.g., ["ngrx", "rxjs", "signals"]
  componentType?: "class" | "functional" | "unknown";
}

// ============================================================================
// State Detection
// ============================================================================

/**
 * Single location where state is accessed/modified
 */
export interface StateOperation {
  file: string;
  line: number;
  column: number;
  entityId?: string | undefined; // From Code Graph RAG
  entityName: string; // Function/class/component name
  operationType: StateOperationType;
  angularPattern?: AngularStatePattern;
  code: string; // Code snippet
  context: string; // Surrounding context (3 lines)
  isDefensive?: boolean; // Has null checks, type guards, etc.
  depth: number; // Distance from origin (0 = source)
}

/**
 * Detected state variable pattern
 */
export interface StatePattern {
  identifier: string; // Variable name (e.g., "token", "userId")
  type?: string | undefined; // TypeScript type
  scope: "global" | "module" | "component" | "local";
  operations: StateOperation[]; // All operations on this state
  relatedIdentifiers: string[]; // Similar names (e.g., ["_token", "tokenValue", "savedToken"])
}

// ============================================================================
// Origin Tracing
// ============================================================================

/**
 * Origin point where state is first created
 */
export interface StateOrigin {
  file: string;
  line: number;
  entityId?: string | undefined;
  entityName: string;
  type: "initialization" | "import" | "parameter" | "service_injection";
  angularPattern?: AngularStatePattern;
  code: string;
  importChain?: string[]; // Trace back through imports
}

// ============================================================================
// Flow Mapping
// ============================================================================

/**
 * Node in state propagation graph
 */
export interface StateFlowNode {
  id: string; // Unique node ID
  file: string;
  entityId?: string | undefined;
  entityName: string;
  operationType: StateOperationType;
  angularPattern?: AngularStatePattern;
  depth: number; // Distance from origin
  isDefensive: boolean; // Has protective code
  hasMutation: boolean; // Modifies state
  consumers: number; // How many nodes depend on this
}

/**
 * Edge in state propagation graph
 */
export interface StateFlowEdge {
  from: string; // Source node ID
  to: string; // Target node ID
  type: "data_flow" | "control_flow" | "import" | "injection";
  label?: string; // Description (e.g., "via @Input()")
}

/**
 * Complete state flow map
 */
export interface StateFlowMap {
  stateIdentifier: string;
  origin: StateOrigin;
  nodes: StateFlowNode[];
  edges: StateFlowEdge[];
  totalOperations: number;
  mutationPoints: number; // Number of places that modify state
  maxDepth: number; // Maximum distance from origin
}

// ============================================================================
// Chaos Metrics
// ============================================================================

/**
 * Coupling analysis between components via state
 */
export interface CouplingMetrics {
  score: number; // 0-100 (higher = more coupled)
  affectedComponents: number; // Number of components using this state
  sharedStateCount: number; // How many different states are shared
  bidirectionalBindings: number; // Two-way bindings (@Input + @Output)
}

/**
 * Defensive coding patterns detected
 */
export interface DefensivePatterns {
  nullChecks: number; // if (state !== null)
  typeGuards: number; // typeof checks
  defaultValues: number; // state || defaultValue
  tryCatch: number; // Error handling around state
  localCopies: number; // const saved = state
}

/**
 * Risk assessment
 */
export type DivergenceRisk = "low" | "medium" | "high" | "critical";

/**
 * Complete chaos metrics for a state variable
 */
export interface ChaosMetrics {
  stateIdentifier: string;
  coupling: CouplingMetrics;
  defensive: DefensivePatterns;
  mutationSpread: {
    totalMutations: number;
    filesWithMutations: number;
    componentsWithMutations: number;
    averageMutationsPerComponent: number;
  };
  divergenceRisk: DivergenceRisk;
  complexity: {
    cyclomaticComplexity: number; // From Code Graph if available
    cognitiveComplexity: number;
  };
  score: number; // Overall chaos score 0-100
}

// ============================================================================
// Refactoring Suggestions
// ============================================================================

/**
 * Recommended refactoring strategy
 */
export type RefactoringStrategy =
  | "StateManager" // Centralized state manager class
  | "Context" // Context API / DI container
  | "EventBus" // Event-driven architecture
  | "StateMachine" // Explicit state machine (XState)
  | "Signal" // Angular Signals
  | "Store" // NgRx/Redux store
  | "Service" // Angular service with BehaviorSubject
  | "DI_Lifetime" // C#: Fix DI lifetime (Singleton→Scoped)
  | "Channel" // C#: System.Threading.Channels for producer-consumer
  | "ImmutableState"; // C#: Record types + immutable collections

/**
 * Single refactoring step
 */
export interface RefactoringStep {
  phase: number;
  description: string;
  files: string[];
  estimatedEffort: "low" | "medium" | "high";
  breakingChange: boolean;
  operations: Array<{
    type: "extract" | "centralize" | "remove" | "replace" | "rename";
    target: string;
    replacement?: string;
    reason: string;
  }>;
}

/**
 * Proposed new component/service
 */
export interface ProposedComponent {
  name: string;
  type: "service" | "store" | "context" | "manager";
  responsibility: string;
  interface: string; // TypeScript interface/class definition
  consumers: string[]; // Components that will use this
  benefits: string[];
}

/**
 * Expected benefits from refactoring
 */
export interface RefactoringBenefits {
  reducedCoupling: number; // Percentage reduction
  reducedMutations: number; // Number of mutation points removed
  reducedComplexity: number; // Complexity reduction %
  improvedTestability: boolean;
  improvedMaintainability: boolean;
  estimatedLOCChange: number; // Lines of code change (+ or -)
}

/**
 * Complete refactoring plan
 */
export interface RefactoringPlan {
  stateIdentifier: string;
  currentMetrics: ChaosMetrics;
  strategy: RefactoringStrategy;
  reasoning: string; // Why this strategy was chosen
  steps: RefactoringStep[];
  newComponents: ProposedComponent[];
  benefits: RefactoringBenefits;
  risks: string[]; // Potential issues
  prerequisites: string[]; // What needs to be done first
}

// ============================================================================
// Analysis Results
// ============================================================================

/**
 * AI-friendly compact summary for token efficiency
 */
export interface ChaosAnalysisSummary {
  overview: {
    stateIdentifier: string;
    totalFiles: number;
    totalOperations: number;
    chaosScore: number; // 0-100
    divergenceRisk: DivergenceRisk;
    raceRisk: RaceRisk; // Race condition risk level
    writers: number; // Number of mutation points
    conflicts: number; // Number of detected race conflicts
  };
  hotspots: Array<{
    // Top 5 most problematic locations
    file: string;
    entity: string;
    issues: string[];
    priority: "high" | "medium" | "low";
  }>;
  raceConflicts: Array<{
    // Detected race conditions
    pattern: RacePatternType;
    severity: RaceRisk;
    locations: string[]; // "file:line" format
    suggestion: string;
  }>;
  quickFixes: string[]; // Simple improvements
  refactoringStrategy: RefactoringStrategy;
  estimatedEffort: string;
}

/**
 * Complete detailed analysis result
 */
export interface ChaosAnalysisResult {
  statePattern: StatePattern;
  flowMap: StateFlowMap;
  metrics: ChaosMetrics;
  raceAnalysis: RaceAnalysis; // Race condition detection results
  refactoringPlan: RefactoringPlan;
  summary: ChaosAnalysisSummary;
  timestamp: string;
}

// ============================================================================
// Analysis Options
// ============================================================================

/**
 * Configuration for chaos analysis
 */
export interface ChaosAnalysisOptions {
  scope: "file" | "module" | "project";
  stateIdentifiers?: string[] | undefined; // Specific identifiers to analyze
  autoDetect?: boolean; // Auto-detect state patterns
  includeVisualization?: boolean; // Generate graph visualization
  generateRefactoringPlan?: boolean;
  useEmbeddings?: boolean; // Use semantic similarity for grouping
  maxDepth?: number | undefined; // Maximum trace depth (default: 10)
  excludePatterns?: string[] | undefined; // Files to exclude
  technology?: TechnologyContext; // Override auto-detection
}

// ============================================================================
// Race Condition Detection
// ============================================================================

/**
 * Type of race condition pattern
 */
export type RacePatternType =
  | "check-then-act" // if (state) { ...modify state }
  | "read-modify-write" // x = state; x++; state = x
  | "competing-mutations" // Multiple writers without sync
  | "competing-resets" // Multiple places reset same state
  | "async-boundary" // Async operations on shared state
  | "event-handler-race"; // Event handlers competing for state

/**
 * Risk level for race condition
 */
export type RaceRisk = "none" | "low" | "medium" | "high" | "critical";

/**
 * Single mutation point in code
 */
export interface MutationPoint {
  file: string;
  line: number;
  entityId?: string | undefined;
  entityName: string; // Function/method containing the mutation
  mutationType: "write" | "reset" | "increment" | "toggle" | "conditional-write";
  condition?: string | undefined; // Guard condition if present (e.g., "if (isProcessing)")
  isAsync: boolean; // Inside async function or callback
  hasLock: boolean; // Protected by mutex/semaphore/lock pattern
  code: string; // Code snippet
}

/**
 * Detected race condition conflict
 */
export interface RaceConflict {
  pattern: RacePatternType;
  severity: RaceRisk;
  stateIdentifier: string;
  description: string;
  locations: MutationPoint[];
  sharedCondition?: string; // Same condition used in multiple places
  explanation: string; // Why this is a race
  suggestion: string; // How to fix
}

/**
 * Race detection analysis for a state variable
 */
export interface RaceAnalysis {
  stateIdentifier: string;
  readers: number; // Total read locations
  writers: number; // Total write locations
  asyncWriters: number; // Writers in async context
  unprotectedWriters: number; // Writers without synchronization
  raceRisk: RaceRisk;
  raceReason?: string | undefined; // Human-readable explanation
  conflicts: RaceConflict[];
  mutations: MutationPoint[];
}

/**
 * Formula inputs for race risk calculation
 */
export interface RaceRiskFactors {
  writerCount: number;
  asyncBoundaries: number;
  sharedConditions: number; // Same condition in multiple mutations
  oppositeConditions: number; // Opposite conditions (if x vs if !x)
  hasLocks: boolean;
  resetPoints: number; // Places that reset/clear the state
}
