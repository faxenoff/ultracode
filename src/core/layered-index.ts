/**
 * Layered Index Interface - Three-Layer Architecture
 *
 * Provides unified interface for querying code entities across multiple layers:
 * - Layer 0 (Base): Main branch entities (shared, read-only)
 * - Layer 1 (Branch Deltas): Per-branch changes (shared, mostly read-only)
 * - Layer 2 (Working Deltas): Per-client uncommitted changes [FUTURE]
 *
 * Based on: ultrasharp-tools-mcp (.NET) implementation
 * @see Dev.Docs/LAYERED_INDEXING_IMPLEMENTATION_PLAN.md
 */

import type { BranchDelta, LayeredIndexConfig, VectorDelta, WorkingDelta } from "../types/layered.js";
import type { Entity, Relationship } from "../types/storage.js";

// =============================================================================
// MAIN INTERFACE
// =============================================================================

export interface ILayeredIndex {
  // =========================================================================
  // Layer 0: Base Index Operations
  // =========================================================================

  /**
   * Build base index from directory (Layer 0)
   * This is the foundation for all layered operations.
   *
   * @param directory - Working directory to index
   */
  buildFromDirectory(directory: string): Promise<void>;

  /**
   * Is the base index built and ready?
   */
  isBuilt(): boolean;

  /**
   * Total number of entities in base index
   * Note: Does not include delta entities for performance
   */
  getTotalEntities(): number;

  // =========================================================================
  // Layered Query Operations
  // =========================================================================

  /**
   * Query entities with three-layer merging
   *
   * Query composition:
   * Result = Layer0.query(pattern)
   *        ∪ Layer1.applyDelta(branch)
   *        ∪ Layer2.applyDelta(clientId)  [FUTURE]
   *        - DeletedEntities
   *
   * @param branch - Branch name (null = main branch)
   * @param clientId - Client ID for Layer 2 [FUTURE, optional]
   * @param pattern - Search pattern (name, type, etc.)
   * @returns Merged entities from all applicable layers
   */
  queryEntities(branch: string | null, clientId: string | null, pattern: string): Promise<Entity[]>;

  /**
   * Query relationships with three-layer merging
   *
   * @param branch - Branch name (null = main branch)
   * @param clientId - Client ID for Layer 2 [FUTURE, optional]
   * @param sourceId - Source entity ID
   * @param targetId - Target entity ID (optional)
   * @returns Merged relationships from all applicable layers
   */
  queryRelationships(
    branch: string | null,
    clientId: string | null,
    sourceId: string,
    targetId?: string,
  ): Promise<Relationship[]>;

  // =========================================================================
  // Layer 1: Branch Delta Management
  // =========================================================================

  /**
   * Ensure branch delta exists (create if missing)
   * Automatically computes delta from git diff if needed
   *
   * @param branch - Branch name
   * @returns Branch delta (loaded from cache or computed)
   */
  ensureBranchDelta(branch: string): Promise<BranchDelta>;

  /**
   * Get branch delta (from cache or storage)
   * Returns null if not found
   *
   * @param branch - Branch name
   * @returns Branch delta or null
   */
  getBranchDelta(branch: string): Promise<BranchDelta | null>;

  /**
   * Set/replace branch delta
   *
   * @param branch - Branch name
   * @param delta - New branch delta
   */
  setBranchDelta(branch: string, delta: BranchDelta): Promise<void>;

  /**
   * Delete branch delta
   *
   * @param branch - Branch name
   */
  deleteBranchDelta(branch: string): Promise<void>;

  /**
   * Get all cached branch names
   */
  getCachedBranches(): Promise<string[]>;

  // =========================================================================
  // Layer 2: Working Delta Management [FUTURE]
  // =========================================================================

  /**
   * Get working delta for a client
   *
   * Layer 2 — see .autodoc/todo/BACKLOG.md#6
   * @future Phase 5+
   *
   * @param clientId - Client ID
   * @param branch - Branch name
   * @returns Working delta or null
   */
  getWorkingDelta(clientId: string, branch: string): Promise<WorkingDelta | null>;

  /**
   * Update working delta for a client
   *
   * Layer 2 — see .autodoc/todo/BACKLOG.md#6
   * @future Phase 5+
   *
   * @param clientId - Client ID
   * @param branch - Branch name
   * @param delta - Working delta
   */
  setWorkingDelta(clientId: string, branch: string, delta: WorkingDelta): Promise<void>;

  /**
   * Clear working delta for a client
   *
   * Layer 2 — see .autodoc/todo/BACKLOG.md#6
   * @future Phase 5+
   *
   * @param clientId - Client ID
   * @param branch - Branch name
   */
  clearWorkingDelta(clientId: string, branch: string): Promise<void>;

  /**
   * Check if client has uncommitted changes
   *
   * Layer 2 — see .autodoc/todo/BACKLOG.md#6
   * @future Phase 5+
   *
   * @param clientId - Client ID
   * @param branch - Branch name
   * @returns True if has uncommitted changes
   */
  hasUncommittedChanges(clientId: string, branch: string): Promise<boolean>;

  // =========================================================================
  // Incremental Updates
  // =========================================================================

  /**
   * Update entities from a single file (incremental)
   *
   * @param filePath - File path to update
   * @param branch - Branch name (for delta update)
   * @param clientId - Client ID for Layer 2 [FUTURE, optional]
   */
  updateEntitiesFromFile(filePath: string, branch: string | null, clientId: string | null): Promise<void>;

  /**
   * Remove entities from a file (file deleted)
   *
   * @param filePath - File path
   * @param branch - Branch name (for delta update)
   * @param clientId - Client ID for Layer 2 [FUTURE, optional]
   */
  removeEntitiesFromFile(filePath: string, branch: string | null, clientId: string | null): Promise<void>;

  // =========================================================================
  // Configuration & Lifecycle
  // =========================================================================

  /**
   * Get current configuration
   */
  getConfig(): LayeredIndexConfig;

  /**
   * Initialize the layered index
   * Sets up persistence, LRU caches, background tasks
   */
  initialize(): Promise<void>;

  /**
   * Shutdown gracefully
   * Saves all deltas, stops background tasks
   */
  shutdown(): Promise<void>;
}

// =============================================================================
// VECTOR LAYERED INDEX INTERFACE (for semantic search)
// =============================================================================

export interface ILayeredVectorIndex {
  /**
   * Search similar vectors with three-layer merging
   *
   * @param branch - Branch name (null = main branch)
   * @param clientId - Client ID for Layer 2 [FUTURE, optional]
   * @param queryEmbedding - Query embedding vector
   * @param topK - Number of results to return
   * @returns Merged similarity results from all layers
   */
  searchSimilar(
    branch: string | null,
    clientId: string | null,
    queryEmbedding: Float32Array,
    topK: number,
  ): Promise<Array<{ id: string; similarity: number }>>;

  /**
   * Get vector delta for a branch
   *
   * @param branch - Branch name
   * @returns Vector delta or null
   */
  getVectorDelta(branch: string): Promise<VectorDelta | null>;

  /**
   * Set/replace vector delta
   *
   * @param branch - Branch name
   * @param delta - Vector delta
   */
  setVectorDelta(branch: string, delta: VectorDelta): Promise<void>;

  /**
   * Generate embeddings for branch delta
   * Lazy generation - only for changed entities
   *
   * @param branch - Branch name
   * @param entityDelta - Entity delta to generate embeddings for
   */
  generateDeltaEmbeddings(branch: string, entityIds: string[]): Promise<void>;
}

// =============================================================================
// HELPER TYPES
// =============================================================================

/**
 * Query result with layer information (for debugging)
 */
export interface LayeredQueryResult<T> {
  /** Result data */
  data: T[];

  /** Layer contributions */
  layers: {
    layer0Count: number;
    layer1Count: number;
    layer2Count: number;
  };

  /** Query performance metrics */
  metrics: {
    layer0TimeMs: number;
    layer1TimeMs: number;
    layer2TimeMs: number;
    totalTimeMs: number;
  };
}
