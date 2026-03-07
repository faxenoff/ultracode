/**
 * Layered Indexing Types - Three-Layer Architecture
 *
 * Architecture:
 * - Layer 0 (Base): Main branch entities, shared, read-only
 * - Layer 1 (Branch Deltas): Per-branch changes, shared, mostly read-only
 * - Layer 2 (Working Deltas): Per-client uncommitted changes, mutable [FUTURE]
 *
 * Based on: ultrasharp-tools-mcp (.NET) implementation
 * @see Dev.Docs/LAYERED_INDEXING_IMPLEMENTATION_PLAN.md
 */

import type { Entity, Relationship } from "./storage.js";

// =============================================================================
// ENTITY DELTA - Tracks changes to entities
// =============================================================================

export interface EntityDelta {
  /** Entities added in this layer (not present in parent layer) */
  added: Map<string, Entity>;

  /** Entities modified in this layer (present in parent but changed) */
  modified: Map<string, Entity>;

  /** Entity IDs deleted in this layer (present in parent but removed) */
  deleted: Set<string>;
}

// =============================================================================
// RELATIONSHIP DELTA - Tracks changes to relationships
// =============================================================================

export interface RelationshipDelta {
  /** Relationships added in this layer */
  added: Map<string, Relationship>;

  /** Relationships modified in this layer */
  modified: Map<string, Relationship>;

  /** Relationship IDs deleted in this layer */
  deleted: Set<string>;
}

// =============================================================================
// BRANCH DELTA (Layer 1) - Per-branch changes
// =============================================================================

export interface BranchDelta {
  /** Branch name (e.g., "feature/auth") */
  branchName: string;

  /** Base commit SHA from which this delta was computed */
  baseCommitSha: string;

  /** Entity changes */
  entityDelta: EntityDelta;

  /** Relationship changes */
  relationshipDelta: RelationshipDelta;

  /** Last modification timestamp */
  lastModified: number;

  /** Total number of changes */
  readonly totalChanges: number;
}

// =============================================================================
// WORKING DELTA (Layer 2) - Per-client uncommitted changes [FUTURE]
// =============================================================================

/**
 * Working Delta - Uncommitted changes for a specific client
 *
 * Layer 2 — see .autodoc/todo/BACKLOG.md#6
 * This will be needed for:
 * - Multi-client isolation (server scenarios)
 * - Uncommitted changes tracking
 * - Real-time collaboration
 *
 * @future Phase 5+
 */
export interface WorkingDelta {
  /** Client ID (e.g., process ID, session ID) */
  clientId: string;

  /** Branch name this working delta belongs to */
  branchName: string;

  /** Entity changes (uncommitted) */
  entityDelta: EntityDelta;

  /** Relationship changes (uncommitted) */
  relationshipDelta: RelationshipDelta;

  /** Last modification timestamp */
  lastModified: number;

  /** Total number of uncommitted changes */
  readonly totalChanges: number;
}

// =============================================================================
// VECTOR DELTA - Tracks changes to vector embeddings
// =============================================================================

export interface VectorDelta {
  /** Branch name */
  branchName: string;

  /** Base commit SHA */
  baseCommitSha: string;

  /** Added embeddings (entityId → embedding vector) */
  addedEmbeddings: Map<string, Float32Array>;

  /** Modified embeddings (entityId → embedding vector) */
  modifiedEmbeddings: Map<string, Float32Array>;

  /** Deleted embedding IDs */
  deletedEmbeddingIds: Set<string>;

  /** Last modification timestamp */
  lastModified: number;

  /** Total number of vector changes */
  readonly totalChanges: number;
}

// =============================================================================
// LAYERED INDEX CONFIGURATION
// =============================================================================

export interface LayeredIndexConfig {
  /** Maximum number of branch deltas to keep in memory (LRU cache) */
  maxBranchDeltas: number;

  /** Enable SQLite persistence for branch deltas */
  enablePersistence: boolean;

  /** Enable vector delta layering */
  enableVectorDeltas: boolean;

  /** Working directory for cache storage */
  workingDirectory: string;

  /** Delta compaction threshold (trigger compaction above this many changes) */
  compactionThreshold?: number;

  /** Enable automatic cleanup of orphaned deltas */
  enableOrphanedCleanup?: boolean;

  /** Background scheduler intervals (minutes) */
  backgroundScheduler?: {
    compactionIntervalMinutes?: number;
    cleanupIntervalMinutes?: number;
  };

  // Layer 2 — see .autodoc/todo/BACKLOG.md#6
  /** Enable Layer 2 (working deltas) - for multi-client scenarios [FUTURE] */
  enableWorkingDeltas?: boolean;

  /** Maximum number of working deltas per branch [FUTURE] */
  maxWorkingDeltas?: number;
}

// =============================================================================
// PRESET CONFIGURATIONS
// =============================================================================

export const LayeredIndexConfigPresets = {
  /**
   * Default configuration for single-user development
   */
  default: (workingDirectory: string): LayeredIndexConfig => ({
    maxBranchDeltas: 20,
    enablePersistence: true,
    enableVectorDeltas: true,
    workingDirectory,
    compactionThreshold: 1000,
    enableOrphanedCleanup: true,
    backgroundScheduler: {
      compactionIntervalMinutes: 30,
      cleanupIntervalMinutes: 60,
    },
    // Layer 2 disabled for MVP
    enableWorkingDeltas: false,
    maxWorkingDeltas: 10,
  }),

  /**
   * Development configuration (aggressive cleanup, smaller cache)
   */
  development: (workingDirectory: string): LayeredIndexConfig => ({
    maxBranchDeltas: 10,
    enablePersistence: true,
    enableVectorDeltas: true,
    workingDirectory,
    compactionThreshold: 500,
    enableOrphanedCleanup: true,
    backgroundScheduler: {
      compactionIntervalMinutes: 15,
      cleanupIntervalMinutes: 30,
    },
    enableWorkingDeltas: false,
    maxWorkingDeltas: 5,
  }),

  /**
   * Production configuration (larger cache, less aggressive cleanup)
   */
  production: (workingDirectory: string): LayeredIndexConfig => ({
    maxBranchDeltas: 50,
    enablePersistence: true,
    enableVectorDeltas: true,
    workingDirectory,
    compactionThreshold: 2000,
    enableOrphanedCleanup: true,
    backgroundScheduler: {
      compactionIntervalMinutes: 60,
      cleanupIntervalMinutes: 120,
    },
    enableWorkingDeltas: false,
    maxWorkingDeltas: 20,
  }),

  /**
   * Future: Multi-client server configuration [FUTURE]
   */
  server: (workingDirectory: string): LayeredIndexConfig => ({
    maxBranchDeltas: 100,
    enablePersistence: true,
    enableVectorDeltas: true,
    workingDirectory,
    compactionThreshold: 1500,
    enableOrphanedCleanup: true,
    backgroundScheduler: {
      compactionIntervalMinutes: 45,
      cleanupIntervalMinutes: 90,
    },
    // Layer 2 ENABLED for server scenarios
    enableWorkingDeltas: true,
    maxWorkingDeltas: 50,
  }),
};

// =============================================================================
// FILE CHANGE EVENTS - For incremental indexing
// =============================================================================

export type FileChangeType = "added" | "modified" | "deleted";

export interface FileUpdate {
  /** Type of change */
  type: FileChangeType;

  /** Absolute file path */
  filePath: string;

  /** Timestamp of change */
  timestamp: number;

  /** Optional: Git commit SHA (if from git operation) */
  commitSha?: string;
}

// =============================================================================
// GIT DIFF ANALYSIS - For delta computation
// =============================================================================

export interface GitFileChange {
  /** File path relative to repository root */
  path: string;

  /** Change status */
  status: "added" | "modified" | "deleted" | "renamed";

  /** Old path (for renamed files) */
  oldPath?: string | undefined;

  /** Number of additions */
  additions?: number;

  /** Number of deletions */
  deletions?: number;
}

export interface GitDiffResult {
  /** Changed files */
  files: GitFileChange[];

  /** Source branch */
  sourceBranch: string;

  /** Target branch (usually 'main') */
  targetBranch: string;

  /** Merge base commit SHA */
  mergeBaseSha: string;

  /** Total files changed */
  totalFiles: number;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Create empty EntityDelta
 */
export function createEmptyEntityDelta(): EntityDelta {
  return {
    added: new Map(),
    modified: new Map(),
    deleted: new Set(),
  };
}

/**
 * Create empty RelationshipDelta
 */
export function createEmptyRelationshipDelta(): RelationshipDelta {
  return {
    added: new Map(),
    modified: new Map(),
    deleted: new Set(),
  };
}

/**
 * Create empty BranchDelta
 */
export function createEmptyBranchDelta(branchName: string, baseCommitSha: string = ""): BranchDelta {
  return {
    branchName,
    baseCommitSha,
    entityDelta: createEmptyEntityDelta(),
    relationshipDelta: createEmptyRelationshipDelta(),
    lastModified: Date.now(),
    get totalChanges() {
      return (
        this.entityDelta.added.size +
        this.entityDelta.modified.size +
        this.entityDelta.deleted.size +
        this.relationshipDelta.added.size +
        this.relationshipDelta.modified.size +
        this.relationshipDelta.deleted.size
      );
    },
  };
}

/**
 * Create empty VectorDelta
 */
export function createEmptyVectorDelta(branchName: string, baseCommitSha: string = ""): VectorDelta {
  return {
    branchName,
    baseCommitSha,
    addedEmbeddings: new Map(),
    modifiedEmbeddings: new Map(),
    deletedEmbeddingIds: new Set(),
    lastModified: Date.now(),
    get totalChanges() {
      return this.addedEmbeddings.size + this.modifiedEmbeddings.size + this.deletedEmbeddingIds.size;
    },
  };
}

// Layer 2 — see .autodoc/todo/BACKLOG.md#6
/**
 * Create empty WorkingDelta [FUTURE]
 */
export function createEmptyWorkingDelta(clientId: string, branchName: string): WorkingDelta {
  return {
    clientId,
    branchName,
    entityDelta: createEmptyEntityDelta(),
    relationshipDelta: createEmptyRelationshipDelta(),
    lastModified: Date.now(),
    get totalChanges() {
      return (
        this.entityDelta.added.size +
        this.entityDelta.modified.size +
        this.entityDelta.deleted.size +
        this.relationshipDelta.added.size +
        this.relationshipDelta.modified.size +
        this.relationshipDelta.deleted.size
      );
    },
  };
}
