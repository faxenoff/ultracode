/**
 * LibSQL Graph Adapter - Shared Types and Configuration
 *
 * Contains all shared types, configuration interfaces, constants,
 * and utility functions used by the libsql operations modules.
 */

import type { Client } from "@libsql/client";
// Note: No DEFAULT_BRANCH import - branch must be explicitly provided

// =============================================================================
// CONFIGURATION
// =============================================================================

export interface LibSQLGraphConfig {
  /** Vector dimensions (default: 384 for all-MiniLM-L6-v2) */
  dimensions?: number;
  /** Distance metric for vector search */
  metric?: "cosine" | "l2";
  /** Compression level for neighbor storage */
  compression?: "float8" | "float16" | "float32";
  /** DiskANN search list size (higher = better recall, slower) */
  searchL?: number | undefined;
  /** DiskANN insert list size (higher = better quality, slower build) */
  insertL?: number | undefined;
  /** DiskANN max neighbors (lower = smaller index, less memory) */
  maxNeighbors?: number;
}

export const DEFAULT_CONFIG: Required<LibSQLGraphConfig> = {
  dimensions: 384,
  metric: "cosine",
  compression: "float8", // 40-50% less memory than float32
  searchL: 150,
  insertL: 30, // Reduced for lower memory peak during batch inserts
  maxNeighbors: 12, // Reduced from 24 to lower DiskANN disk footprint (~12KB per neighbor, ~3x data overhead)
};

// =============================================================================
// MULTI-DIMENSION SUPPORT
// =============================================================================

/** Supported embedding dimensions (maps to column names) */
export const SUPPORTED_DIMENSIONS = [384, 768, 1024, 4096] as const;
export type SupportedDimension = (typeof SUPPORTED_DIMENSIONS)[number];

/**
 * Get the embedding column name for a given dimension.
 * Throws if dimension is not supported.
 */
export function getEmbeddingColumn(dimensions: number): string {
  if (!SUPPORTED_DIMENSIONS.includes(dimensions as SupportedDimension)) {
    throw new Error(`Unsupported embedding dimension: ${dimensions}. Supported: ${SUPPORTED_DIMENSIONS.join(", ")}`);
  }
  return `embedding_${dimensions}`;
}

/**
 * Normalize dimensions to nearest supported value (rounds up).
 * E.g., 512 → 768, 900 → 1024
 */
export function normalizeToSupportedDimension(dimensions: number): SupportedDimension {
  for (const supported of SUPPORTED_DIMENSIONS) {
    if (dimensions <= supported) return supported;
  }
  return 4096; // Max supported
}

// =============================================================================
// PROJECT CONTEXT
// =============================================================================

export interface ProjectContext {
  projectHash: string;
  branchName: string;
  /** Base branch for layered reads (e.g., 'main', 'dev'). If set, read operations include base + current. */
  baseBranch?: string | undefined;
  /** Embedding dimensions for this project (default: from global config) */
  dimensions?: SupportedDimension | undefined;
}

export const DEFAULT_PROJECT_CONTEXT: ProjectContext = {
  projectHash: "_unset_",
  branchName: "_unset_",
};

// =============================================================================
// CACHE CONFIGURATION
// =============================================================================

export const CACHE_CONFIG = {
  /** Embedding cache: store frequently accessed embeddings in memory */
  embeddingCache: {
    max: 5000, // Max embeddings to cache
    ttl: 1000 * 60 * 10, // 10 minutes TTL
  },
  /** Search result cache: cache recent similarity searches */
  searchCache: {
    max: 500, // Max search results to cache
    ttl: 1000 * 60 * 2, // 2 minutes TTL (shorter as data changes)
  },
  /** Metadata cache: parsed metadata objects */
  metadataCache: {
    max: 10000,
    ttl: 1000 * 60 * 5, // 5 minutes TTL
  },
  /** Batch processing concurrency - reduced to prevent native crashes */
  batchConcurrency: 1, // Sequential to avoid libsql native issues with parallel writes
} as const;

// =============================================================================
// DATABASE CORRUPTION ERROR
// =============================================================================

/**
 * Special error class for database corruption.
 * When thrown, callers should trigger database recreation.
 */
export class DatabaseCorruptionError extends Error {
  constructor(
    message: string,
    public readonly originalError?: Error,
  ) {
    super(`DATABASE_CORRUPT: ${message}`);
    this.name = "DatabaseCorruptionError";
  }
}

/**
 * Check if an error indicates database corruption
 */
export function isCorruptionError(error: unknown): boolean {
  const msg = (error as Error)?.message || String(error);
  return (
    msg.includes("SQLITE_CORRUPT") ||
    msg.includes("database disk image is malformed") ||
    msg.includes("file is not a database") ||
    msg.includes("database or disk is full")
  );
}

// =============================================================================
// SHARED TYPES FOR OPERATIONS
// =============================================================================

/**
 * Delegate type for accessing client from main adapter
 */
export type ClientGetter = () => Client | null;

/**
 * Delegate type for accessing project context from main adapter
 */
export type ContextGetter = () => ProjectContext;

/**
 * Delegate type for encoding metadata (CBOR serialization)
 */
export type MetadataEncoder = (metadata: Record<string, unknown> | null | undefined) => Buffer | null;

/**
 * Delegate type for decoding metadata (CBOR deserialization)
 */
export type MetadataDecoder = (data: Buffer | Uint8Array | string | null) => Record<string, unknown> | undefined;
