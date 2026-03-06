/**
 * CUDA-accelerated vector operations for embeddings
 *
 * Provides GPU-accelerated computations using NVIDIA CUDA.
 * Performance: 100-200x faster than CPU for 8192-dim vectors.
 *
 * @module ultracode-cuda-addon
 */

export interface CUDADeviceInfo {
  /** Number of CUDA devices available */
  deviceCount: number;
  /** GPU device name (e.g., "NVIDIA GeForce GTX 1650 Ti") */
  deviceName?: string;
  /** CUDA compute capability (e.g., "7.5") */
  computeCapability?: string;
  /** Total GPU memory in MB */
  totalMemoryMB?: number;
  /** Number of streaming multiprocessors */
  multiProcessorCount?: number;
}

/**
 * Compute cosine similarity between two vectors on GPU
 *
 * @param vec_a - First embedding vector
 * @param vec_b - Second embedding vector (same length as vec_a)
 * @returns Cosine similarity score (0-1)
 *
 * @example
 * ```typescript
 * const vec_a = new Array(8192).fill(0).map(() => Math.random());
 * const vec_b = new Array(8192).fill(0).map(() => Math.random());
 * const similarity = cosineSimilarity(vec_a, vec_b);
 * console.log('Similarity:', similarity); // e.g., 0.8523
 * ```
 *
 * @performance ~0.1-0.2ms for 8192-dim vectors (100-200x faster than CPU)
 */
export function cosineSimilarity(vec_a: number[], vec_b: number[]): number;

/**
 * Compute batch cosine similarities on GPU (parallel computation)
 *
 * @param vecs_a - Array of first vectors
 * @param vecs_b - Array of second vectors (same count and dimension as vecs_a)
 * @returns Array of similarity scores
 *
 * @example
 * ```typescript
 * const embeddings_query = [[...], [...], [...]]; // 3 query vectors
 * const embeddings_docs = [[...], [...], [...]];  // 3 document vectors
 *
 * const similarities = batchCosineSimilarity(embeddings_query, embeddings_docs);
 * console.log('Batch results:', similarities); // [0.85, 0.72, 0.91]
 * ```
 *
 * @performance ~5-10ms for 100 pairs of 8192-dim vectors
 */
export function batchCosineSimilarity(vecs_a: number[][], vecs_b: number[][]): number[];

/**
 * Compute Euclidean distance (L2) between two vectors on GPU
 *
 * @param vec_a - First vector
 * @param vec_b - Second vector (same length as vec_a)
 * @returns Euclidean distance
 *
 * @example
 * ```typescript
 * const distance = euclideanDistance(vec_a, vec_b);
 * console.log('L2 Distance:', distance); // e.g., 12.45
 * ```
 */
export function euclideanDistance(vec_a: number[], vec_b: number[]): number;

/**
 * Normalize vectors to unit length (L2 norm = 1) on GPU
 *
 * @param vectors - Array of vectors to normalize (modified in-place semantically)
 * @returns Array of normalized vectors
 *
 * @example
 * ```typescript
 * const vectors = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
 * const normalized = normalizeVectors(vectors);
 * // Each vector now has L2 norm = 1
 * ```
 */
export function normalizeVectors(vectors: number[][]): number[][];

/**
 * Get CUDA device information
 *
 * @returns Device info object with GPU details
 *
 * @example
 * ```typescript
 * const info = getDeviceInfo();
 * if (info.deviceCount > 0) {
 *   console.log(`GPU: ${info.deviceName}`);
 *   console.log(`Compute: ${info.computeCapability}`);
 *   console.log(`Memory: ${info.totalMemoryMB} MB`);
 * } else {
 *   console.log('No CUDA devices found');
 * }
 * ```
 */
export function getDeviceInfo(): CUDADeviceInfo;

// =============================================================================
// GPU FAISS IVF Operations
// Available when compiled with ENABLE_FAISS_GPU=ON
// =============================================================================

/** Whether GPU FAISS support is compiled in */
export const hasGpuFaiss: boolean;

/** Whether native CPU FAISS support is compiled in (replaces faiss-napi) */
export const hasNativeFaiss: boolean;

/** Create a GPU IVF,SQ index */
export function gpuIvfCreate(
  projectKey: string,
  dims: number,
  nlist: number,
  sqBits: number,
  metric?: string,
): { success: boolean; projectKey: string; dims: number; nlist: number; sqBits: number };

/** Train the GPU IVF index */
export function gpuIvfTrain(
  projectKey: string,
  vectors: Float32Array,
  count: number,
): { success: boolean; trainedOn: number };

/** Add vectors to the GPU IVF index */
export function gpuIvfAdd(
  projectKey: string,
  vectors: Float32Array,
  count: number,
): { success: boolean; addedCount: number; totalVectors: number };

/** Search the GPU IVF index (single query) */
export function gpuIvfSearch(
  projectKey: string,
  query: Float32Array,
  k: number,
): { labels: BigInt64Array; distances: Float32Array };

/** Batch search the GPU IVF index (multiple queries) */
export function gpuIvfBatchSearch(
  projectKey: string,
  queries: Float32Array,
  nQueries: number,
  k: number,
): { labels: BigInt64Array; distances: Float32Array; nQueries: number; k: number };

/** Save GPU index to disk (GPU→CPU transfer + write) */
export function gpuIvfSave(
  projectKey: string,
  path: string,
): { success: boolean; path: string };

/** Load index from disk to GPU (read + CPU→GPU transfer) */
export function gpuIvfLoad(
  projectKey: string,
  path: string,
): { success: boolean; path: string; loadedVectors: number };

/** Remove index from GPU memory */
export function gpuIvfRemove(projectKey: string): { success: boolean };

/** Get stats for GPU indexes */
export function gpuIvfStats(
  projectKey?: string,
): Array<{
  projectKey: string;
  ntotal: number;
  dims: number;
  nlist: number;
  gpuMemoryMB: number;
  isTrained: boolean;
}>;

// =============================================================================
// Native FAISS CPU Operations — full faiss-napi replacement
// Available when compiled with ENABLE_FAISS_CPU=ON
// Supports: Flat, HNSW, IVF, IVF+SQ, IVF+PQ via factory strings
// =============================================================================

/** Create a FAISS index using factory string */
export function faissIndexCreate(
  projectKey: string,
  dims: number,
  factoryString: string,
  metric?: string,
): { success: boolean; projectKey: string; dims: number; factory: string; indexType: string; isTrained: boolean };

/** Train index (required for IVF-based indexes) */
export function faissIndexTrain(
  projectKey: string,
  vectors: Float32Array | number[],
  count: number,
): { success: boolean; trainedOn: number; isTrained: boolean };

/** Add vectors to index */
export function faissIndexAdd(
  projectKey: string,
  vectors: Float32Array | number[],
  count: number,
): { success: boolean; addedCount: number; totalVectors: number };

/** Search index (single query) */
export function faissIndexSearch(
  projectKey: string,
  query: Float32Array | number[],
  k: number,
  nprobe?: number,
): { labels: BigInt64Array; distances: Float32Array };

/** Batch search index (multiple queries) */
export function faissIndexBatchSearch(
  projectKey: string,
  queries: Float32Array,
  nQueries: number,
  k: number,
  nprobe?: number,
): { labels: BigInt64Array; distances: Float32Array; nQueries: number; k: number };

/** Save index to disk */
export function faissIndexSave(
  projectKey: string,
  path: string,
): { success: boolean; path: string };

/** Load index from disk */
export function faissIndexLoad(
  projectKey: string,
  path: string,
): { success: boolean; path: string; loadedVectors: number; isTrained: boolean; dims: number; indexType: string };

/** Remove index from memory */
export function faissIndexRemove(projectKey: string): { success: boolean };

/** Reset index (remove all vectors, keep trained state) */
export function faissIndexReset(projectKey: string): { success: boolean };

/** Get stats for indexes */
export function faissIndexStats(
  projectKey?: string,
): Array<{
  projectKey: string;
  ntotal: number;
  dims: number;
  indexType: string;
  factory: string;
  memoryMB: number;
  isTrained: boolean;
  nlist: number;
  nprobe: number;
}>;
