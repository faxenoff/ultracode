/**
 * Faiss IPC Protocol Types
 *
 * Defines the message protocol between Bun (parent) and Node.js Faiss worker (child).
 * Communication happens via stdin/stdout JSON messages.
 */

// =============================================================================
// Index Configuration
// =============================================================================

export type FaissIndexType = "flat" | "hnsw" | "ivf" | "ivfpq" | "ivfsq";

// =============================================================================
// Common Provider Interface (used by EmbeddingAccumulator)
// =============================================================================

import type { VectorEmbedding } from "../../types/semantic.js";

/**
 * Common interface for FAISS providers (FaissProvider and LayeredFaissProvider).
 * Used by EmbeddingAccumulator to add embeddings regardless of which provider is active.
 */
export interface IVectorProvider {
  /** Add a batch of embeddings to the index */
  addBatch(embeddings: VectorEmbedding[]): Promise<unknown>;
  /** Check which IDs already exist in the index */
  getExistingIds(ids: string[]): Set<string>;
  /** Remove vectors by ID */
  remove(ids: string[]): Promise<unknown>;
  /** Save the index to disk */
  save(): Promise<void>;
}

export interface FaissIndexConfig {
  /** Vector dimensions (must match embedding model) */
  dimensions: number;
  /** Index type: flat (exact), hnsw (fast ANN), ivf (clustered), ivfpq (compressed) */
  indexType: FaissIndexType;
  /** Distance metric */
  metric: "l2" | "ip" | "cosine";
  /** HNSW: M parameter - number of connections per layer (default: 32) */
  hnswM?: number;
  /** HNSW: efConstruction - size of dynamic candidate list (default: 200) */
  hnswEfConstruction?: number;
  /** HNSW: efSearch - size of search candidate list (default: 64) */
  hnswEfSearch?: number;
  /** IVF: number of clusters (default: sqrt(n)) */
  ivfNlist?: number;
  /** IVF: number of clusters to search (default: 10) */
  ivfNprobe?: number;
  /** IVFPQ: number of subquantizers (default: 8) */
  pqM?: number;
  /** IVFPQ: bits per subquantizer (default: 8) */
  pqNbits?: number;
  /** IVF,SQ: scalar quantization bits (default: 8) */
  sqBits?: number;
  /** OpenMP threads (default: all cores) */
  numThreads?: number;
}

// =============================================================================
// IPC Request Messages
// =============================================================================

export interface FaissInitRequest {
  type: "init";
  config: FaissIndexConfig;
  /** Optional path to load existing index */
  loadPath?: string | undefined;
}

export interface FaissAddRequest {
  type: "add";
  /** Vector IDs (must be unique) */
  ids: string[];
  /** Vectors as flat Float32Array (ids.length * dimensions) */
  vectors: number[];
}

export interface FaissSearchRequest {
  type: "search";
  /** Query vector */
  vector: number[];
  /** Number of results */
  k: number;
  /** Optional: filter by IDs */
  filterIds?: string[] | undefined;
}

export interface FaissBatchSearchRequest {
  type: "batchSearch";
  /** Query vectors as flat array (queries * dimensions) */
  vectors: number[];
  /** Number of query vectors */
  nQueries: number;
  /** Number of results per query */
  k: number;
}

export interface FaissRemoveRequest {
  type: "remove";
  /** Vector IDs to remove */
  ids: string[];
}

export interface FaissSaveRequest {
  type: "save";
  /** Path to save index */
  path: string;
}

export interface FaissLoadRequest {
  type: "load";
  /** Path to load index */
  path: string;
}

export interface FaissTrainRequest {
  type: "train";
  /** Training vectors for IVF/PQ indexes */
  vectors: number[];
  /** Number of training vectors */
  nVectors: number;
}

export interface FaissStatsRequest {
  type: "stats";
}

export interface FaissShutdownRequest {
  type: "shutdown";
}

export type FaissRequest =
  | FaissInitRequest
  | FaissAddRequest
  | FaissSearchRequest
  | FaissBatchSearchRequest
  | FaissRemoveRequest
  | FaissSaveRequest
  | FaissLoadRequest
  | FaissTrainRequest
  | FaissStatsRequest
  | FaissShutdownRequest;

// =============================================================================
// IPC Response Messages
// =============================================================================

export interface FaissSuccessResponse {
  success: true;
  requestId?: string | undefined;
}

export interface FaissErrorResponse {
  success: false;
  error: string;
  requestId?: string | undefined;
}

export interface FaissSearchResult {
  id: string;
  distance: number;
  score: number; // Normalized similarity score 0-1
}

export interface FaissSearchResponse extends FaissSuccessResponse {
  type: "search";
  results: FaissSearchResult[];
  searchTimeMs: number;
}

export interface FaissBatchSearchResponse extends FaissSuccessResponse {
  type: "batchSearch";
  /** Results per query */
  results: FaissSearchResult[][];
  searchTimeMs: number;
}

export interface FaissStatsResponse extends FaissSuccessResponse {
  type: "stats";
  stats: {
    indexType: FaissIndexType;
    dimensions: number;
    totalVectors: number;
    memoryUsageMB: number;
    isTrained: boolean;
    /** HNSW specific */
    hnswM?: number;
    hnswEfConstruction?: number;
    /** IVF specific */
    ivfNlist?: number;
    ivfNprobe?: number;
  };
}

export interface FaissInitResponse extends FaissSuccessResponse {
  type: "init";
  indexType: FaissIndexType;
  dimensions: number;
  loadedVectors?: number;
}

export interface FaissAddResponse extends FaissSuccessResponse {
  type: "add";
  addedCount: number;
  totalVectors: number;
  addTimeMs: number;
}

export interface FaissRemoveResponse extends FaissSuccessResponse {
  type: "remove";
  removedCount: number;
  totalVectors: number;
}

export interface FaissSaveResponse extends FaissSuccessResponse {
  type: "save";
  path: string;
  sizeBytes: number;
}

export interface FaissLoadResponse extends FaissSuccessResponse {
  type: "load";
  path: string;
  loadedVectors: number;
}

export interface FaissTrainResponse extends FaissSuccessResponse {
  type: "train";
  trainedOn: number;
  trainTimeMs: number;
}

export type FaissResponse =
  | FaissErrorResponse
  | FaissSearchResponse
  | FaissBatchSearchResponse
  | FaissStatsResponse
  | FaissInitResponse
  | FaissAddResponse
  | FaissRemoveResponse
  | FaissSaveResponse
  | FaissLoadResponse
  | FaissTrainResponse
  | FaissSuccessResponse;

// =============================================================================
// Worker State
// =============================================================================

export interface FaissWorkerState {
  isInitialized: boolean;
  indexType: FaissIndexType | null;
  dimensions: number;
  totalVectors: number;
  isTrained: boolean;
  idMap: Map<string, number>; // string ID -> internal faiss ID
  reverseIdMap: Map<number, string>; // internal faiss ID -> string ID
}
