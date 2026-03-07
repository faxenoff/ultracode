/**
 * Pattern Detection System — Types & Interfaces
 *
 * Two-stage pipeline: Structural Detector (fast metadata/graph) → Semantic Validator (embedding similarity)
 */

// ─── Category & Severity ───────────────────────────────────────────

export type PatternCategory = "anti-pattern" | "best-pattern" | "code-smell" | "optimization";

export type PatternSeverity = "critical" | "high" | "medium" | "low" | "info";

// ─── Structural Criteria ───────────────────────────────────────────

export interface RelationshipCriteria {
  type: string; // RelationType: "calls", "imports", "extends", etc.
  direction: "incoming" | "outgoing";
  minCount?: number | undefined;
  maxCount?: number | undefined;
  /** Cross-file ratio: % of relationships crossing file boundaries */
  crossFileRatio?: { min?: number | undefined; max?: number | undefined } | undefined;
}

export interface StructuralCriteria {
  // Entity filter
  entityTypes?: string[] | undefined;

  // Modifiers
  requiredModifiers?: string[] | undefined;
  forbiddenModifiers?: string[] | undefined;

  // Return type (regex)
  returnTypeMatch?: string | undefined;
  returnTypeNotMatch?: string | undefined;

  // Parameters
  minParams?: number | undefined;
  maxParams?: number | undefined;
  paramTypeRequired?: string | undefined; // Must have param of this type
  paramTypeAbsent?: string | undefined; // Must NOT have param of this type

  // Metrics (from entity.metadata.metrics)
  minCyclomatic?: number | undefined;
  maxCyclomatic?: number | undefined;
  minCognitive?: number | undefined;
  minNesting?: number | undefined;
  minLOC?: number | undefined;
  maxLOC?: number | undefined;

  // ControlFlow (from entity.metadata.controlFlow)
  hasLoops?: boolean | undefined;
  hasExceptions?: boolean | undefined;
  hasAwaits?: boolean | undefined;
  minBranches?: number | undefined;

  // Calls (from entity.metadata.calls)
  minCallCount?: number | undefined;
  callsInclude?: string[] | undefined; // Entity must call these (regex matched)
  callsExclude?: string[] | undefined; // Entity must NOT call these

  // Decorators/attributes
  decoratorMatch?: string[] | undefined; // regex patterns

  // Inheritance
  hasNoInheritance?: boolean | undefined; // Must NOT have base classes/interfaces

  // File path filter (regex)
  filePathNotMatch?: string | undefined; // Skip entities whose filePath matches this regex

  // Name (regex)
  nameMatch?: string | undefined;
  nameNotMatch?: string | undefined;

  // Graph-based (require relationship queries)
  relationships?: RelationshipCriteria[] | undefined;
}

// ─── Pattern Definition ────────────────────────────────────────────

export interface PatternDefinition {
  id: string; // "ts:async-void", "common:god-function"
  language: string; // "typescript" | "python" | "csharp" | "java" | "go" | "common"
  category: PatternCategory;
  severity: PatternSeverity;
  name: string;
  description: string;
  suggestion: string;
  bigO?:
    | {
        before: string; // "O(n²)"
        after: string; // "O(n)"
      }
    | undefined;
  benchmark?: string | undefined; // "10x faster", "50% less memory"
  tags: string[];
  enabled: boolean;

  // Structural criteria (fast path)
  structural?: StructuralCriteria | undefined;

  // Custom detector function name
  customDetector?: string | undefined; // e.g., "checkPromiseNoCatch"

  // Semantic validation config
  exemplarIds?: string[] | undefined;
  minSemanticSimilarity: number; // 0 = skip semantic check

  // Scoring
  minStructuralConfidence: number; // Default 0.6
}

// ─── Exemplar ──────────────────────────────────────────────────────

export interface PatternExemplar {
  id: string; // "ts:async-void:bad1"
  patternId: string;
  language: string;
  code: string; // ≤400 chars
  description: string;
}

// ─── Match Result ──────────────────────────────────────────────────

export interface PatternMatch {
  patternId: string;
  pattern: PatternDefinition;
  entityId: string;
  entityName: string;
  entityType: string;
  filePath: string;
  line: number;
  structuralConfidence: number; // 0-1
  semanticSimilarity: number; // 0-1 (1.0 if semantic skipped)
  combinedScore: number; // weighted blend
  matchedCriteria: string[];
  closestExemplar?: { id: string; similarity: number; description: string } | undefined;
  codeSnippet?: string | undefined;
}

// ─── Scan Result ───────────────────────────────────────────────────

export interface PatternScanResult {
  antiPatterns: PatternMatch[];
  bestPatterns: PatternMatch[];
  codeSmells: PatternMatch[];
  optimizations: PatternMatch[];
  summary: {
    totalEntitiesScanned: number;
    antiPatternCount: number;
    bestPatternCount: number;
    codeSmellCount: number;
    optimizationCount: number;
    topIssues: Array<{ patternId: string; count: number; severity: PatternSeverity }>;
    healthScore: number; // 0-100
  };
}

// ─── Scan Options ──────────────────────────────────────────────────

export interface PatternScanOptions {
  projectPath: string;
  filePath?: string | undefined;
  language?: string | undefined;
  category?: PatternCategory | "all";
  tags?: string[] | undefined;
  minConfidence?: number;
  severity?: PatternSeverity | "all";
  offset?: number;
  limit?: number;
  /** Max entities to fetch from DB. Default: 10000. */
  entityLimit?: number;
  /** Pattern IDs to suppress (skip). For known false positives. */
  suppressPatterns?: string[] | undefined;
}

// ─── Custom Detector ───────────────────────────────────────────────

export interface CustomDetectorResult {
  match: boolean;
  confidence: number;
  matchedCriteria?: string[];
}

export type CustomDetectorFn = (entity: import("../../types/storage.js").Entity) => CustomDetectorResult;

// ─── Structural Candidate (internal) ──────────────────────────────

export interface StructuralCandidate {
  entity: import("../../types/storage.js").Entity;
  pattern: PatternDefinition;
  confidence: number;
  matchedCriteria: string[];
}
