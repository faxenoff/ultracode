/**
 * Prolly Tree Types and Interfaces
 *
 * Prolly Tree = Content-addressed B-tree + Merkle hashing + Probabilistic chunking
 *
 * Key properties:
 * - Nodes are identified by content hash (xxHash64)
 * - Identical subtrees are reused (structural sharing)
 * - Diff between versions = O(log n) comparison of roots
 *
 * @see docs/PROLLY_TREE.md for architecture details
 */

// =============================================================================
// NODE TYPES
// =============================================================================

/**
 * Node type in the Prolly Tree
 */
export type ProllyNodeType = "internal" | "leaf" | "file_tree";

/**
 * A node in the Prolly Tree (content-addressed)
 */
export interface ProllyNode {
  /** Content hash (xxHash64) - serves as the node's identity */
  contentHash: string;

  /** Type of node: internal (branch), leaf (data), or file_tree (for FS Merkle) */
  type: ProllyNodeType;

  /** For leaf nodes: serialized data (CBOR encoded) */
  data?: Uint8Array | undefined;

  /** For internal nodes: ordered list of child content hashes */
  childrenHashes?: string[] | undefined;

  /** B-tree key range: start key (inclusive) */
  keyRangeStart?: string | undefined;

  /** B-tree key range: end key (inclusive) */
  keyRangeEnd?: string | undefined;

  /** Number of entries in this subtree (for statistics) */
  entryCount?: number | undefined;

  /** Timestamp when node was created */
  createdAt: number;
}

/**
 * Entry stored in a leaf node
 */
export interface ProllyEntry {
  /** Unique key for this entry (entity ID, file path, etc.) */
  key: string;

  /** Serialized value (CBOR encoded) */
  value: Uint8Array;

  /** Hash of the value (for change detection) */
  valueHash: string;
}

/**
 * Serialized format for leaf node data
 */
export interface LeafNodeData {
  entries: ProllyEntry[];
}

/**
 * Serialized format for internal node data
 */
export interface InternalNodeData {
  children: Array<{
    hash: string;
    keyRangeStart: string;
    keyRangeEnd: string;
    entryCount: number;
  }>;
}

// =============================================================================
// COMMIT TYPES
// =============================================================================

/**
 * A commit represents a snapshot of the graph at a point in time
 */
export interface GraphCommit {
  /** Commit hash (xxHash64 of parent + root + timestamp) */
  commitHash: string;

  /** Project hash for isolation */
  projectHash: string;

  /** Branch name */
  branchName: string;

  /** Parent commit hash (null for initial commit) */
  parentHash: string | null;

  /** Root node hash of the Prolly Tree */
  rootNodeHash: string;

  /** Root hash of the file system Merkle tree */
  fileTreeHash: string | null;

  /** Optional commit message */
  message?: string | undefined;

  /** Number of entities in this commit */
  entityCount: number;

  /** Number of relationships in this commit */
  relationshipCount: number;

  /** Timestamp when commit was created */
  createdAt: number;
}

/**
 * Branch head pointer
 */
export interface BranchHead {
  projectHash: string;
  branchName: string;
  commitHash: string;
  updatedAt: number;
}

// =============================================================================
// DIFF TYPES
// =============================================================================

/**
 * Entry change in a diff
 */
export interface EntryChange {
  key: string;
  oldValue?: Uint8Array | undefined;
  newValue?: Uint8Array | undefined;
  oldHash?: string | undefined;
  newHash?: string | undefined;
}

/**
 * Result of diffing two Prolly Trees
 */
export interface TreeDiff {
  /** Entries that exist only in the new tree */
  added: EntryChange[];

  /** Entries that exist in both but with different values */
  modified: EntryChange[];

  /** Entries that exist only in the old tree */
  deleted: EntryChange[];

  /** Statistics */
  stats: {
    nodesCompared: number;
    nodesSkipped: number; // Identical subtrees
    timeMs: number;
  };
}

/**
 * File change in a file system diff
 */
export interface FileChange {
  path: string;
  type: "add" | "modify" | "delete";
  oldHash?: string;
  newHash?: string;
}

/**
 * Result of diffing file system Merkle trees
 */
export interface FileDiff {
  changes: FileChange[];
  stats: {
    dirsCompared: number;
    dirsSkipped: number;
    timeMs: number;
  };
}

/**
 * Diff between two commits
 */
export interface CommitDiff {
  /** Source commit */
  fromCommit: GraphCommit;

  /** Target commit */
  toCommit: GraphCommit;

  /** Tree diff for entities/relationships */
  treeDiff: TreeDiff;

  /** File diff */
  fileDiff: FileDiff | null;

  /** Commits in the path from source to target */
  commitPath: GraphCommit[];
}

// =============================================================================
// VERIFICATION TYPES
// =============================================================================

/**
 * Result of verifying tree integrity
 */
export interface VerifyResult {
  /** Whether the tree is valid */
  valid: boolean;

  /** Total number of nodes in the tree */
  nodeCount: number;

  /** Number of orphaned nodes (not reachable from root) */
  orphanedNodes: number;

  /** Number of missing nodes (referenced but not found) */
  missingNodes: number;

  /** Errors found during verification */
  errors: VerifyError[];

  /** Time taken for verification */
  timeMs: number;
}

/**
 * Error found during verification
 */
export interface VerifyError {
  type: "missing_node" | "invalid_hash" | "orphaned" | "corruption";
  nodeHash?: string;
  parentHash?: string;
  message: string;
}

// =============================================================================
// CONFIGURATION TYPES
// =============================================================================

/**
 * Configuration for Prolly Tree operations
 */
export interface ProllyTreeConfig {
  /**
   * Chunk pattern for probabilistic splitting.
   * Lower value = larger chunks (fewer nodes, less granular diff)
   * Higher value = smaller chunks (more nodes, more granular diff)
   * Default: 0xFFF (~4KB average chunk size)
   */
  chunkPattern?: number;

  /**
   * Minimum number of entries per leaf node.
   * Prevents excessive fragmentation.
   * Default: 4
   */
  minLeafEntries?: number;

  /**
   * Maximum number of entries per leaf node.
   * Forces split even if chunk boundary not reached.
   * Default: 256
   */
  maxLeafEntries?: number;

  /**
   * Whether to enable LRU cache for nodes.
   * Default: true
   */
  enableCache?: boolean;

  /**
   * Maximum nodes to keep in cache.
   * Default: 1000
   */
  cacheSize?: number;
}

/**
 * Default configuration
 */
export const DEFAULT_PROLLY_CONFIG: Required<ProllyTreeConfig> = {
  chunkPattern: 0xfff, // ~4KB average chunks
  minLeafEntries: 4,
  maxLeafEntries: 256,
  enableCache: true,
  cacheSize: 1000,
};

// =============================================================================
// BRANCH DIFF CACHE TYPES
// =============================================================================

/**
 * Cached diff between current branch and base branch.
 * Used to avoid tombstone queries on every read.
 */
export interface BranchDiffCache {
  /** Base branch name */
  baseBranch: string;

  /** Current branch name */
  currentBranch: string;

  /** Entity IDs added on current branch */
  addedIds: Set<string>;

  /** Entity IDs modified on current branch */
  modifiedIds: Set<string>;

  /** Entity IDs deleted on current branch */
  deletedIds: Set<string>;

  /** Commit hash when this cache was computed */
  validUntilCommit: string;

  /** When the cache was created */
  createdAt: number;
}

// =============================================================================
// TIME TRAVEL TYPES
// =============================================================================

/**
 * Snapshot of graph state at a specific commit
 */
export interface GraphSnapshot {
  commit: GraphCommit;
  entityCount: number;
  relationshipCount: number;
  fileCount: number;
}

/**
 * History entry for an entity
 */
export interface EntityChange {
  commitHash: string;
  timestamp: number;
  changeType: "add" | "modify" | "delete";
  oldValue?: Uint8Array;
  newValue?: Uint8Array;
}

// =============================================================================
// FILE MERKLE TREE TYPES
// =============================================================================

/**
 * Node in the file system Merkle tree
 */
export interface FileMerkleNode {
  /** Unique ID */
  id: string;

  /** Project hash for isolation */
  projectHash: string;

  /** Branch name */
  branchName: string;

  /** File or directory path */
  path: string;

  /** Merkle hash (content hash for files, combined hash for directories) */
  hash: string;

  /** Parent directory path (null for root) */
  parentPath: string | null;

  /** Whether this is a leaf (file) or internal (directory) node */
  isLeaf: boolean;

  /** Number of children (for directories) */
  childrenCount: number;

  /** Last updated timestamp */
  updatedAt: number;
}

/**
 * File info for Merkle tree building
 */
export interface MerkleFileInfo {
  path: string;
  hash: string;
  size?: number;
  mtime?: number;
}
