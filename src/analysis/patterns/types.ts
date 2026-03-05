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
  minCount?: number;
  maxCount?: number;
  /** Cross-file ratio: % of relationships crossing file boundaries */
  crossFileRatio?: { min?: number; max?: number };
}

export interface StructuralCriteria {
  // Entity filter
  entityTypes?: string[];

  // Modifiers
  requiredModifiers?: string[];
  forbiddenModifiers?: string[];

  // Return type (regex)
  returnTypeMatch?: string;
  returnTypeNotMatch?: string;

  // Parameters
  minParams?: number;
  maxParams?: number;
  paramTypeRequired?: string; // Must have param of this type
  paramTypeAbsent?: string; // Must NOT have param of this type

  // Metrics (from entity.metadata.metrics)
  minCyclomatic?: number;
  maxCyclomatic?: number;
  minCognitive?: number;
  minNesting?: number;
  minLOC?: number;
  maxLOC?: number;

  // ControlFlow (from entity.metadata.controlFlow)
  hasLoops?: boolean;
  hasExceptions?: boolean;
  hasAwaits?: boolean;
  minBranches?: number;

  // Calls (from entity.metadata.calls)
  minCallCount?: number;
  callsInclude?: string[]; // Entity must call these (regex matched)
  callsExclude?: string[]; // Entity must NOT call these

  // Decorators/attributes
  decoratorMatch?: string[]; // regex patterns

  // Inheritance
  hasNoInheritance?: boolean; // Must NOT have base classes/interfaces

  // File path filter (regex)
  filePathNotMatch?: string; // Skip entities whose filePath matches this regex

  // Name (regex)
  nameMatch?: string;
  nameNotMatch?: string;

  // Graph-based (require relationship queries)
  relationships?: RelationshipCriteria[];
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
  bigO?: {
    before: string; // "O(n²)"
    after: string; // "O(n)"
  };
  benchmark?: string; // "10x faster", "50% less memory"
  tags: string[];
  enabled: boolean;

  // Structural criteria (fast path)
  structural?: StructuralCriteria;

  // Custom detector function name
  customDetector?: string; // e.g., "checkPromiseNoCatch"

  // Semantic validation config
  exemplarIds?: string[];
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
  closestExemplar?: { id: string; similarity: number; description: string };
  codeSnippet?: string;
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
  filePath?: string;
  language?: string;
  category?: PatternCategory | "all";
  tags?: string[];
  minConfidence?: number;
  severity?: PatternSeverity | "all";
  offset?: number;
  limit?: number;
  /** Max entities to fetch from DB. Default: 10000. */
  entityLimit?: number;
  /** Pattern IDs to suppress (skip). For known false positives. */
  suppressPatterns?: string[];
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
