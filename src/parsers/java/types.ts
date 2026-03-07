/**
 * Java ANTLR Parser Types
 *
 * Type definitions for Java parsing context and extracted information.
 * Provides shared types for all Java parser modules.
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
  /** Whether this is a constructor call (new) */
  isNew?: boolean;
  /** Whether this is a static call */
  isStatic?: boolean;
  /** Whether this is a super call */
  isSuper?: boolean;
  /** Number of arguments */
  argumentCount: number;
  /** Type arguments for generic calls */
  typeArguments?: string[];
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
 * Parameter information for methods/constructors
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
  type: "if" | "else" | "else-if" | "switch" | "case" | "default" | "ternary";
  condition?: string | undefined;
  location: LocationInfo;
}

/**
 * Loop information in control flow
 */
export interface LoopInfo {
  type: "for" | "for-each" | "while" | "do-while";
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
}

/**
 * Complete control flow structure
 */
export interface ControlFlowInfo {
  branches: BranchInfo[];
  loops: LoopInfo[];
  exceptions: ExceptionInfo[];
  returns: ReturnInfo[];
}

// =============================================================================
// DOCUMENTATION TYPES (JavaDoc)
// =============================================================================

/**
 * JavaDoc parameter documentation
 */
export interface JavaDocParam {
  name: string;
  type?: string | undefined;
  description?: string | undefined;
}

/**
 * Parsed JavaDoc documentation
 */
export interface JavaDocInfo {
  description?: string | undefined;
  params?: JavaDocParam[] | undefined;
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
  see?: string[] | undefined;
  since?: string | undefined;
  author?: string | undefined;
  version?: string | undefined;
  deprecated?: string | boolean | undefined;
}

// =============================================================================
// COMPLEXITY METRICS
// =============================================================================

/**
 * Code complexity metrics for a method
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
 * Spring annotation information
 */
export interface SpringAnnotationInfo {
  type: "controller" | "service" | "repository" | "component" | "configuration" | "bean";
  path?: string | undefined;
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | undefined;
  qualifiers?: string[] | undefined;
}

/**
 * JPA entity information
 */
export interface JpaEntityInfo {
  tableName?: string | undefined;
  relationships: Array<{
    type: "OneToMany" | "ManyToOne" | "OneToOne" | "ManyToMany";
    targetEntity?: string | undefined;
    mappedBy?: string | undefined;
  }>;
  isEntity: boolean;
}

/**
 * Lombok annotation information
 */
export interface LombokInfo {
  hasData?: boolean | undefined;
  hasBuilder?: boolean | undefined;
  hasGetter?: boolean | undefined;
  hasSetter?: boolean | undefined;
  hasSlf4j?: boolean | undefined;
  hasAllArgsConstructor?: boolean | undefined;
  hasNoArgsConstructor?: boolean | undefined;
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
