/**
 * Kotlin ANTLR Parser Types
 *
 * Type definitions for Kotlin parsing context and extracted information.
 * Provides shared types for all Kotlin parser modules.
 */

import type { EntityRelationship, ParsedEntity } from "../../types/parser.js";

// =============================================================================
// PARSER CONTEXT
// =============================================================================

/**
 * Context passed through all parsing functions
 */
export interface ParserContext {
  filePath: string;
  packageName: string;
  entities: ParsedEntity[];
  relationships: EntityRelationship[];
  currentClass: string | null;
  imports: Map<string, string>;
}

// =============================================================================
// LOCATION INFO
// =============================================================================

/**
 * Location information for AST nodes
 */
export type LocationInfo = {
  start: { line: number; column: number; index: number };
  end: { line: number; column: number; index: number };
};

// =============================================================================
// CALL EXTRACTION TYPES
// =============================================================================

/**
 * Information about a method/function call
 */
export interface CallInfo {
  /** Name of the called function/method */
  name: string;
  /** Target object for method calls (this, obj, ClassName) */
  target?: string;
  /** Location of the call */
  location: LocationInfo;
  /** Whether this is an await/suspend call */
  isAwait?: boolean;
  /** Whether this is safe call (?.) */
  isSafeCall?: boolean;
  /** Whether this is a constructor call */
  isNew?: boolean;
  /** Number of arguments */
  argumentCount: number;
  /** Type arguments for generic calls */
  typeArguments?: string[];
  /** Whether this is an extension function call */
  isExtensionCall?: boolean;
  /** Receiver type for extension functions */
  receiverType?: string;
}

// =============================================================================
// ANNOTATION INFO
// =============================================================================

/**
 * Annotation information extracted from modifiers
 */
export interface AnnotationInfo {
  name: string;
  arguments?: string[] | undefined;
  isBuiltin?: boolean | undefined;
}

// =============================================================================
// INHERITANCE INFO
// =============================================================================

/**
 * Inheritance information for classes/interfaces
 */
export interface InheritanceInfo {
  baseClasses: string[];
  interfaces: string[];
}

// =============================================================================
// PARAMETER INFO
// =============================================================================

/**
 * Parameter information for functions/constructors
 */
export interface ParameterInfo {
  name: string;
  type?: string | undefined;
  optional?: boolean | undefined;
  defaultValue?: string | undefined;
  isVararg?: boolean | undefined;
}

// =============================================================================
// CONTROL FLOW TYPES
// =============================================================================

/**
 * Branch information in control flow
 */
export interface BranchInfo {
  type: "if" | "else" | "else-if" | "when" | "when-entry" | "elvis" | "ternary";
  condition?: string | undefined;
  location: LocationInfo;
}

/**
 * Loop information in control flow
 */
export interface LoopInfo {
  type: "for" | "while" | "do-while";
  location: LocationInfo;
}

/**
 * Exception handling information
 */
export interface ExceptionInfo {
  type: "try" | "catch" | "finally" | "throw";
  catchType?: string | undefined;
  location: LocationInfo;
}

/**
 * Return statement information
 */
export interface ReturnInfo {
  location: LocationInfo;
  hasValue: boolean;
  label?: string | undefined; // For labeled returns
}

/**
 * Complete control flow structure
 */
export interface ControlFlowInfo {
  branches: BranchInfo[];
  loops: LoopInfo[];
  exceptions: ExceptionInfo[];
  returns: ReturnInfo[];
  awaits: Array<{
    location: LocationInfo;
    expression: string;
  }>;
}

// =============================================================================
// DOCUMENTATION TYPES (KDoc)
// =============================================================================

/**
 * KDoc parameter documentation
 */
export interface KDocParam {
  name: string;
  type?: string | undefined;
  description?: string | undefined;
}

/**
 * Parsed KDoc documentation
 */
export interface KDocInfo {
  description?: string | undefined;
  params?: KDocParam[] | undefined;
  returns?:
    | {
        type?: string | undefined;
        description?: string | undefined;
      }
    | undefined;
  throws?:
    | Array<{
        type?: string | undefined;
        description?: string | undefined;
      }>
    | undefined;
  property?:
    | Array<{
        name: string;
        description?: string | undefined;
      }>
    | undefined;
  receiver?: string | undefined;
  sample?: string[] | undefined;
  see?: string[] | undefined;
  since?: string | undefined;
  author?: string | undefined;
  deprecated?: string | boolean | undefined;
  suppress?: string[] | undefined;
}

// =============================================================================
// COROUTINE TYPES
// =============================================================================

/**
 * Coroutine-specific information
 */
export interface CoroutineInfo {
  isSuspend: boolean;
  hasLaunch?: boolean | undefined;
  hasAsync?: boolean | undefined;
  hasFlow?: boolean | undefined;
  hasWithContext?: boolean | undefined;
  dispatcherUsed?: string | undefined;
  scopeType?: "CoroutineScope" | "GlobalScope" | "viewModelScope" | "lifecycleScope" | "other" | undefined;
}

// =============================================================================
// COMPLEXITY METRICS
// =============================================================================

/**
 * Code complexity metrics for a function/method
 */
export interface ComplexityMetrics {
  cyclomatic: number;
  cognitive: number;
  linesOfCode: number;
  linesOfLogic: number;
  nestingDepth: number;
  parameterCount: number;
  returnCount: number;
}

// =============================================================================
// FRAMEWORK PATTERN TYPES
// =============================================================================

/**
 * Android ViewModel pattern info
 */
export interface ViewModelInfo {
  stateFlows: string[];
  liveData: string[];
  savedStateHandle?: boolean | undefined;
}

/**
 * Ktor routing pattern info
 */
export interface KtorRouteInfo {
  method: "get" | "post" | "put" | "delete" | "patch" | "head" | "options";
  path: string;
  location: LocationInfo;
}

// =============================================================================
// ANTLR CONTEXT TYPES
// =============================================================================

/**
 * ANTLR Token interface
 */
export interface AntlrToken {
  line?: number;
  column?: number;
  start?: number;
  stop?: number;
  text?: string;
}

/**
 * Generic ANTLR context with location info
 */
export interface AntlrContext {
  start?: AntlrToken;
  stop?: AntlrToken;
  _start?: AntlrToken;
  _stop?: AntlrToken;
  getText?: () => string;
}

/**
 * ANTLR context with children
 */
export interface AntlrContextWithChildren extends AntlrContext {
  children?: AntlrContext[];
  getChildCount?: () => number;
  getChild?: (i: number) => AntlrContext | null;
}
