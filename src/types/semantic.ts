/**
 * Semantic search and vector operation type definitions.
 *
 * Provides types for embedding generation, similarity search,
 * clone detection, cross-language lookup, and refactoring hints.
 * Default vector dimensionality comes from all-MiniLM-L6-v2 (384-d).
 *
 * Related modules:
 *   - src/config/constants.ts (VECTOR_CONSTANTS, CACHE_CONSTANTS)
 *   - src/semantic/ (runtime implementations)
 */

import { CACHE_CONSTANTS, VECTOR_CONSTANTS } from "../config/constants.js";

// ---------------------------------------------------------------------------
// Numeric constants
// ---------------------------------------------------------------------------

export const VECTOR_DIMENSIONS = VECTOR_CONSTANTS.DEFAULT_VECTOR_DIMENSIONS; // all-MiniLM-L6-v2 dimensions
export const DEFAULT_SIMILARITY_THRESHOLD = VECTOR_CONSTANTS.DEFAULT_SIMILARITY_THRESHOLD;
export const MAX_BATCH_SIZE = VECTOR_CONSTANTS.MAX_BATCH_SIZE; // Optimal for 4-core CPU
export const MAX_CACHE_ENTRIES = CACHE_CONSTANTS.MAX_CACHE_ENTRIES;

// ---------------------------------------------------------------------------
// Embedding representation
// ---------------------------------------------------------------------------

/** A single vector embedding tied to a content string. */
export interface VectorEmbedding {
  id: string;
  vector: Float32Array;
  content: string;
  createdAt: number;
  metadata?: Record<string, unknown> | undefined;
}

// ---------------------------------------------------------------------------
// Search results
// ---------------------------------------------------------------------------

/** One entry returned by a cosine-similarity search. */
export interface SimilarityResult {
  id: string;
  similarity: number;
  content: string;
  metadata?: Record<string, unknown> | undefined;
}

/** Combined result from both structural graph and semantic search. */
export interface HybridResult {
  id: string;
  score: number;
  source: "structural" | "semantic" | "hybrid";
  metadata?: Record<string, unknown> | undefined;
  content?: string | undefined;
}

/** Aggregated output of a semantic search request. */
export interface SemanticResult {
  query: string;
  processingTime: number;
  results: SimilarityResult[];
}

// ---------------------------------------------------------------------------
// Semantic analysis
// ---------------------------------------------------------------------------

/** High-level semantic breakdown of a code fragment. */
export interface SemanticAnalysis {
  summary: string;
  complexity: number;
  semanticType: "function" | "class" | "module" | "utility" | "test";
  entities: string[];
  concepts: string[];
}

// ---------------------------------------------------------------------------
// Code similarity and clone detection
// ---------------------------------------------------------------------------

/** A code fragment that is similar to a query fragment. */
export interface SimilarCode {
  id: string;
  similarity: number;
  path: string;
  content: string;
  type: "exact" | "near" | "semantic";
  /** Entity name when available */
  name?: string | undefined;
  /** First line of the matching fragment */
  startLine?: number | undefined;
  /** Last line of the matching fragment */
  endLine?: number | undefined;
}

/** Group of code fragments that are clones of each other. */
export interface CloneGroup {
  id: string;
  avgSimilarity: number;
  cloneType: "type1" | "type2" | "type3" | "type4"; // Exact, renamed, gapped, semantic
  members: SimilarCode[];
}

// ---------------------------------------------------------------------------
// Cross-language search
// ---------------------------------------------------------------------------

/** Result item from a query that spans multiple languages. */
export interface CrossLangResult {
  id: string;
  similarity: number;
  language: string;
  path: string;
  content: string;
  /** Entity name when available */
  name?: string | undefined;
  /** First line of the matching fragment */
  startLine?: number | undefined;
  /** Last line of the matching fragment */
  endLine?: number | undefined;
}

// ---------------------------------------------------------------------------
// Refactoring
// ---------------------------------------------------------------------------

/** An actionable refactoring proposal with confidence score. */
export interface RefactoringSuggestion {
  type: "extract" | "rename" | "move" | "combine" | "simplify";
  impact: "low" | "medium" | "high";
  confidence: number;
  description: string;
  code?: string | undefined;
}

// ---------------------------------------------------------------------------
// Result fusion
// ---------------------------------------------------------------------------

/** Parameters for Reciprocal Rank Fusion of structural + semantic lists. */
export interface FusionOptions {
  k: number; // RRF constant (default 60)
  limit: number;
  structuralWeight: number;
  semanticWeight: number;
}

// ---------------------------------------------------------------------------
// Vector storage
// ---------------------------------------------------------------------------

/**
 * Only libsql DiskANN is supported as a vector backend.
 */
export type VectorBackend = "libsql";

/** Settings for the underlying vector store. */
export interface VectorStoreConfig {
  dimensions: number;
  dbPath: string;
  walMode?: boolean | undefined;
  cacheSize?: number | undefined;
  workingDirectory?: string | undefined;

  /** Enable layered FAISS index (base + delta + tombstones) */
  useLayeredIndex?: boolean | undefined;

  /** LibSQL DiskANN-specific overrides */
  libsql?:
    | {
        metric?: "cosine" | "l2" | undefined; // Default: cosine
        compression?: "float8" | "float16" | "float32" | undefined; // Default: float32
        insertL?: number | undefined; // Neighbors visited during insert (default: 70)
        searchL?: number | undefined; // Neighbors visited during search (default: 200)
      }
    | undefined;
}

// ---------------------------------------------------------------------------
// Embedding provider kinds
// ---------------------------------------------------------------------------

/** Supported embedding provider identifiers. */
export type EmbeddingProviderKind =
  | "auto"
  | "cloudru"
  | "huggingface"
  | "llamacpp"
  | "mlx"
  | "ollama"
  | "openai"
  | "ovms"
  | "tei"
  | "vllm";

// ---------------------------------------------------------------------------
// Worker embedding configuration
// ---------------------------------------------------------------------------

/**
 * Serializable subset of embedding settings that can cross an IPC boundary.
 * Workers use this to bootstrap their own EmbeddingGenerator instance.
 */
export interface WorkerEmbeddingConfig {
  /** Whether workers should generate embeddings at all */
  enabled: boolean;
  /** Which provider to use (ollama, tei, ovms, openai, ...) */
  provider: EmbeddingProviderKind;
  /** Name of the model for the selected provider */
  modelName: string;
  /** Context window of the model in tokens (e.g. 512 for e5-small) */
  contextTokens: number;
  /** Legacy max-token limit for text truncation */
  maxTokens: number;
  /** How many items per batch when generating embeddings */
  batchSize: number;
  /** Texts per HTTP request in centralized mode (default 128) */
  queueBatchSize?: number | undefined;
  /** Output vector dimensionality (e.g. 384 for e5-small) */
  dimensions?: number | undefined;
  /** 0-based index used for endpoint assignment across workers */
  workerIndex?: number | undefined;
  /**
   * When true, workers delegate embedding generation to the main process
   * via centralized queue (useful for OVMS gRPC throughput).
   */
  centralizedEmbeddings?: boolean | undefined;
  /** Provider-level transport and auth options (must be serializable) */
  providerOptions?:
    | {
        baseUrl?: string | undefined;
        apiKey?: string | undefined;
        timeoutMs?: number | undefined;
        concurrency?: number | undefined;
        maxBatchSize?: number | undefined;
        useEmbeddingsApi?: boolean | undefined;
        encodingFormat?: "float" | "base64" | undefined;
        protocol?: "rest" | "grpc" | undefined;
        grpcPort?: number | undefined;
        /** Endpoints available for round-robin load balancing */
        endpoints?: string[] | undefined;
        contextSize?: number | undefined;
        nGpuLayers?: number | undefined;
      }
    | undefined;
}

// ---------------------------------------------------------------------------
// Embedding pool statistics
// ---------------------------------------------------------------------------

/** Aggregated performance counters across all embedding workers. */
export interface EmbeddingPoolStats {
  /** Embeddings generated in total */
  total: number;
  /** Wall-clock time from first to last batch (ms) */
  durationMs: number;
  /** Embeddings per second */
  speedPerSec: number;
  /** How many workers participated */
  workers: number;
  /** Total HTTP/gRPC batch requests sent */
  batches: number;
  /** Name of the provider that was used */
  provider?: string | undefined;
}

// ---------------------------------------------------------------------------
// Full embedding configuration
// ---------------------------------------------------------------------------

/** Complete embedding configuration including per-provider option blocks. */
export interface EmbeddingConfig {
  modelName: string;
  batchSize: number;
  quantized: boolean;
  localPath?: string | undefined;
  /** Texts per HTTP request in centralized mode (default 128) */
  queueBatchSize?: number | undefined;

  provider?: EmbeddingProviderKind | undefined; // default: 'memory'

  ollama?:
    | {
        baseUrl?: string | undefined;
        timeoutMs?: number | undefined;
        concurrency?: number | undefined;
        headers?: Record<string, string> | undefined;
        autoPull?: boolean | undefined;
        checkServer?: boolean | undefined;
        warmupText?: string | undefined;
        pullTimeoutMs?: number | undefined;
      }
    | undefined;

  openai?:
    | {
        baseUrl?: string | undefined;
        apiKey?: string | undefined;
        timeoutMs?: number | undefined;
        maxBatchSize?: number | undefined;
        concurrency?: number | undefined;
      }
    | undefined;

  cloudru?:
    | {
        baseUrl?: string | undefined;
        apiKey?: string | undefined;
        timeoutMs?: number | undefined;
        maxBatchSize?: number | undefined;
        concurrency?: number | undefined;
      }
    | undefined;

  huggingface?:
    | {
        apiKey?: string | undefined;
        baseUrl?: string | undefined;
        timeoutMs?: number | undefined;
        concurrency?: number | undefined;
        warmupText?: string | undefined;
      }
    | undefined;

  tei?:
    | {
        baseUrl?: string | undefined;
        timeoutMs?: number | undefined;
        concurrency?: number | undefined;
        checkServer?: boolean | undefined;
      }
    | undefined;

  ovms?:
    | {
        baseUrl?: string | undefined;
        timeoutMs?: number | undefined;
        concurrency?: number | undefined;
        checkServer?: boolean | undefined;
        miniBatchSize?: number | undefined; // Internal batch size for OVMS server (default: 8)
        useEmbeddingsApi?: boolean | undefined; // /v3/embeddings OpenAI-compatible endpoint (default: true)
        encodingFormat?: "float" | "base64" | undefined; // Response encoding for embeddings API (default: base64)
        protocol?: "rest" | "grpc" | undefined; // "rest" = HTTP/JSON, "grpc" = binary protobuf (~30 % faster)
        grpcPort?: number | undefined; // gRPC port (default: 9000)
        endpoints?: string[] | undefined; // Round-robin targets: ["embeddings-cpu", "embeddings-gpu"]
      }
    | undefined;

  vllm?:
    | {
        baseUrl?: string | undefined;
        timeoutMs?: number | undefined;
        concurrency?: number | undefined;
        maxBatchSize?: number | undefined;
        encodingFormat?: "float" | "base64" | undefined;
      }
    | undefined;

  llamacpp?:
    | {
        baseUrl?: string | undefined;
        timeoutMs?: number | undefined;
        concurrency?: number | undefined;
        maxBatchSize?: number | undefined;
        nGpuLayers?: number | undefined;
        contextSize?: number | undefined;
        checkServer?: boolean | undefined;
        /** Spawn llama-server automatically when not running (default: true) */
        autoStart?: boolean | undefined;
      }
    | undefined;

  mlx?:
    | {
        baseUrl?: string | undefined;
        timeoutMs?: number | undefined;
        concurrency?: number | undefined;
        maxBatchSize?: number | undefined;
        checkServer?: boolean | undefined;
        autoStart?: boolean | undefined;
      }
    | undefined;
}

// ---------------------------------------------------------------------------
// Semantic operations contract
// ---------------------------------------------------------------------------

/** Interface that a semantic agent must satisfy. */
export interface SemanticOperations {
  // Similarity search
  semanticSearch(query: string, limit?: number): Promise<SemanticResult>;

  // Clone and similarity detection
  findSimilarCode(code: string, threshold?: number): Promise<SimilarCode[]>;
  detectClones(minSimilarity?: number): Promise<CloneGroup[]>;

  // Deep analysis
  analyzeCodeSemantics(code: string): Promise<SemanticAnalysis>;
  generateCodeEmbedding(code: string): Promise<Float32Array>;

  // Multi-language lookup
  crossLanguageSearch(query: string, languages: string[]): Promise<CrossLangResult[]>;

  // Refactoring hints
  suggestRefactoring(code: string): Promise<RefactoringSuggestion[]>;
}

// ---------------------------------------------------------------------------
// Task classification
// ---------------------------------------------------------------------------

/** Discriminator for semantic work items dispatched to workers. */
export enum SemanticTaskType {
  EMBED = "embed",
  SEARCH = "search",
  ANALYZE = "analyze",
  CLONE_DETECT = "clone_detect",
  REFACTOR = "refactor",
}

// ---------------------------------------------------------------------------
// Metrics
// ---------------------------------------------------------------------------

/** Runtime counters for the semantic subsystem. */
export interface SemanticMetrics {
  vectorsStored: number;
  embeddingsGenerated: number;
  searchesPerformed: number;
  cacheHitRate: number;
  avgEmbeddingTime: number;
  avgSearchTime: number;
}
