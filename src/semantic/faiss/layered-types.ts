/**
 * Layered FAISS Index Types
 *
 * Architecture:
 * - Base index: First fully indexed branch becomes the base
 * - Delta index: Feature branches store only changes from base
 * - Tombstones: Track deletions that exist in base but not in branch
 *
 * Benefits:
 * - Reduced storage: ~90% smaller for feature branches with few changes
 * - Fast branch switching: Only load small delta, not full index
 * - Consistent search: Composite search across base + delta - tombstones
 */

// =============================================================================
// CONFIGURATION
// =============================================================================

/**
 * Configuration for a layered index
 */
export interface LayeredIndexConfig {
  /** Project hash for identifying the project */
  projectHash: string;
  /** Branch name of the base index (null = not yet determined) */
  baseBranch: string | null;
  /** Number of vectors in the base index */
  baseVectorCount: number;
  /** Timestamp when base was last updated */
  baseTimestamp: number;
  /** Index dimensions (e.g., 384 for all-MiniLM-L6-v2) */
  dimensions: number;
  /** Index type (hnsw, flat, etc.) */
  indexType: "hnsw" | "flat" | "ivf" | "ivfpq" | "ivfsq";
}

/**
 * Delta information for a feature branch
 */
export interface BranchDelta {
  /** Branch name */
  branchName: string;
  /** IDs of added/modified entities in delta */
  addedIds: Set<string>;
  /** IDs of entities that exist in base but should be excluded */
  tombstones: Set<string>;
  /** Number of vectors in delta index */
  deltaVectorCount: number;
  /** Timestamp when delta was last updated */
  lastUpdated: number;
}

// =============================================================================
// SEARCH RESULTS
// =============================================================================

/**
 * Search result with source information
 */
export interface LayeredSearchResult {
  /** Entity ID */
  id: string;
  /** Similarity score (0-1) */
  similarity: number;
  /** Source of the result */
  source: "base" | "delta";
}

// =============================================================================
// INDEX METADATA
// =============================================================================

/**
 * Metadata stored alongside the base index
 */
export interface BaseIndexMetadata {
  /** Branch that was indexed to create base */
  baseBranch: string;
  /** Total vectors in base */
  vectorCount: number;
  /** Creation timestamp */
  createdAt: number;
  /** Last update timestamp */
  updatedAt: number;
  /** Embedding dimensions */
  dimensions: number;
  /** Index type */
  indexType: "hnsw" | "flat" | "ivf" | "ivfpq" | "ivfsq";
  /** Git commit hash when base was created (optional) */
  baseCommit?: string;
}

/**
 * Metadata stored alongside a delta index
 */
export interface DeltaIndexMetadata {
  /** Branch name */
  branchName: string;
  /** Base branch this delta is relative to */
  baseBranch: string;
  /** Vectors in delta */
  deltaVectorCount: number;
  /** Number of tombstones */
  tombstoneCount: number;
  /** Creation timestamp */
  createdAt: number;
  /** Last update timestamp */
  updatedAt: number;
  /** Git commit hash when delta was last updated (optional) */
  lastCommit?: string;
}

// =============================================================================
// FILE PATHS
// =============================================================================

/**
 * File paths for layered index storage
 */
export interface LayeredIndexPaths {
  /** Base index binary file */
  baseIndexPath: string;
  /** Base index ID mapping */
  baseIdsPath: string;
  /** Base index metadata */
  baseMetaPath: string;
  /** Delta index binary (branch-specific) */
  deltaIndexPath: string;
  /** Delta index ID mapping */
  deltaIdsPath: string;
  /** Delta metadata */
  deltaMetaPath: string;
  /** Tombstones JSON file */
  tombstonesPath: string;
}

// =============================================================================
// OPERATIONS
// =============================================================================

/**
 * Result of a vector add operation
 */
export interface AddVectorResult {
  /** Whether add was successful */
  success: boolean;
  /** Where the vector was added */
  target: "base" | "delta";
  /** Error message if failed */
  error?: string;
}

/**
 * Result of a vector remove operation
 */
export interface RemoveVectorResult {
  /** Whether remove was successful */
  success: boolean;
  /** How it was handled */
  action: "removed_from_base" | "removed_from_delta" | "added_tombstone" | "not_found";
}

/**
 * Statistics for a layered index
 */
export interface LayeredIndexStats {
  /** Total searchable vectors (base + delta - tombstones) */
  totalVectors: number;
  /** Vectors in base index */
  baseVectors: number;
  /** Vectors in delta index */
  deltaVectors: number;
  /** Number of tombstones */
  tombstones: number;
  /** Current branch */
  currentBranch: string | null;
  /** Base branch */
  baseBranch: string | null;
  /** Whether on base branch (delta not loaded) */
  isOnBaseBranch: boolean;
}

// =============================================================================
// EVENTS
// =============================================================================

/**
 * Event emitted when layered index state changes
 */
export interface LayeredIndexEvent {
  type: "base_created" | "base_updated" | "delta_created" | "delta_updated" | "branch_switched" | "tombstone_added";
  projectHash: string;
  branchName: string;
  timestamp: number;
  details?: Record<string, unknown>;
}
