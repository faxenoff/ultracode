/**
 * Configuration Type Definitions
 *
 * Type definitions for the YAML configuration system.
 * Extracted from yaml-config.ts for better modularity.
 */

// =============================================================================
// MCP CONFIGURATION
// =============================================================================

export interface MCPConfig {
  embedding?: {
    model?: string | undefined;
    provider?: "ollama" | "openai" | "cloudru" | "huggingface" | "tei" | "ovms" | "auto" | undefined;
    apiKey?: string | undefined;
    enabled?: boolean | undefined;

    // Two-stage retrieval with reranker
    useReranker?: boolean | undefined;
    rerankerModel?: string | undefined;
    rerankerTopK?: number | undefined;
    rerankerFinalK?: number | undefined;

    // Language hint for optimization
    queryLanguage?: "english" | "multilingual" | undefined;

    // Two-phase mode: dump embeddings to disk, then insert to DB
    // Improves stability by separating CPU-intensive embedding from DB writes
    twoPhaseMode?: boolean | undefined;

    // Use layered FAISS index: base (first branch) + delta (changes only) + tombstones
    // Reduces disk usage for feature branches by storing only differences from base
    useLayeredIndex?: boolean | undefined;

    // Provider-specific configurations
    ollama?: {
      baseUrl?: string | undefined;
      timeout?: number | undefined;
      timeoutMs?: number | undefined;
      concurrency?: number | undefined;
      headers?: Record<string, string> | undefined;
      autoPull?: boolean | undefined;
      warmupText?: string | undefined;
      checkServer?: boolean | undefined;
      pullTimeoutMs?: number | undefined;
    };
    openai?: {
      baseUrl?: string | undefined;
      apiKey?: string | undefined;
      timeout?: number | undefined;
      timeoutMs?: number | undefined;
      concurrency?: number | undefined;
      maxBatchSize?: number | undefined;
    };
    cloudru?: {
      baseUrl?: string | undefined;
      apiKey?: string | undefined;
      timeout?: number | undefined;
      timeoutMs?: number | undefined;
      concurrency?: number | undefined;
      maxBatchSize?: number | undefined;
    };
    huggingface?: {
      apiKey?: string | undefined;
      baseUrl?: string | undefined;
      timeout?: number | undefined;
      timeoutMs?: number | undefined;
      concurrency?: number | undefined;
      warmupText?: string | undefined;
    };
    tei?: {
      baseUrl?: string | undefined;
      timeoutMs?: number | undefined;
      concurrency?: number | undefined;
      checkServer?: boolean | undefined;
    };
  };
  server?: { host?: string | undefined; port?: number | undefined; timeout?: number | undefined };
  agents?: {
    maxConcurrent?: number | undefined;
    defaultTimeout?: number | undefined;
    useParser?: boolean | undefined; // MCP_USE_PARSER
    devIndexBatch?: number | undefined; // MCP_DEV_INDEX_BATCH
  };
  semantic?: {
    cacheWarmupLimit?: number | undefined;
    popularEntitiesTopic?: string | undefined;
  };
  autodoc?:
    | {
        /** Enable AutoDoc watcher for automatic documentation updates */
        watcherEnabled?: boolean | undefined;
        /** Debounce delay in milliseconds (default: 45000) */
        debounceMs?: number | undefined;
        /** Minimum debounce delay in milliseconds (default: 30000) */
        minDebounceMs?: number | undefined;
        /** Maximum debounce delay in milliseconds (default: 60000) */
        maxDebounceMs?: number | undefined;
        /** Use LLM for description generation */
        useLlm?: boolean | undefined;
        /** LLM configuration for AutoDoc */
        llmConfig?:
          | {
              provider: "ollama" | "openai" | "tgi";
              model?: string | undefined;
              endpoint?: string | undefined;
            }
          | undefined;
      }
    | undefined;
}

// =============================================================================
// EMBEDDING CONFIGURATION
// =============================================================================

// Resolved embedding configuration returned to callers
export interface EmbeddingConfigResolved {
  model: string;
  provider: "ollama" | "openai" | "cloudru" | "huggingface" | "tei" | "ovms" | "auto" | string;
  apiKey: string;
  enabled: boolean;

  // Two-stage retrieval with reranker
  useReranker: boolean;
  rerankerModel: string;
  rerankerTopK: number;
  rerankerFinalK: number;

  // Language hint for optimization
  queryLanguage: "english" | "multilingual";

  // Two-phase mode: dump embeddings to disk, then insert to DB
  // Improves stability by separating CPU-intensive embedding from DB writes
  twoPhaseMode: boolean;

  // Use layered FAISS index: base (first branch) + delta (changes only) + tombstones
  // Reduces disk usage for feature branches by storing only differences from base
  useLayeredIndex: boolean;

  // Provider-specific configurations
  ollama?:
    | {
        baseUrl?: string | undefined;
        timeout?: number | undefined;
        timeoutMs?: number | undefined;
        concurrency?: number | undefined;
        headers?: Record<string, string> | undefined;
        autoPull?: boolean | undefined;
        warmupText?: string | undefined;
        checkServer?: boolean | undefined;
        pullTimeoutMs?: number | undefined;
      }
    | undefined;
  openai?:
    | {
        baseUrl?: string | undefined;
        apiKey?: string | undefined;
        timeout?: number | undefined;
        timeoutMs?: number | undefined;
        concurrency?: number | undefined;
        maxBatchSize?: number | undefined;
      }
    | undefined;
  cloudru?:
    | {
        baseUrl?: string | undefined;
        apiKey?: string | undefined;
        timeout?: number | undefined;
        timeoutMs?: number | undefined;
        concurrency?: number | undefined;
        maxBatchSize?: number | undefined;
      }
    | undefined;
  huggingface?:
    | {
        apiKey?: string | undefined;
        baseUrl?: string | undefined;
        timeout?: number | undefined;
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
}

// =============================================================================
// DATABASE AND LOGGING CONFIGURATION
// =============================================================================

export interface DatabaseConfig {
  path?: string | undefined;
  mode?: "WAL" | "DELETE" | "TRUNCATE" | undefined;
  cacheSize?: number | undefined;
  mmapSize?: number | undefined;
  synchronous?: "OFF" | "NORMAL" | "FULL" | undefined;
  tempStore?: "DEFAULT" | "FILE" | "MEMORY" | undefined;
}

export interface LoggingConfig {
  level?: "debug" | "info" | "warn" | "error" | undefined;
  format?: "json" | "text" | undefined;
  outputFile?: string | undefined;
  maxFileSize?: string | undefined;
  maxFiles?: number | undefined;
  enableConsole?: boolean | undefined;
}

// =============================================================================
// PARSER AND INDEXER CONFIGURATION
// =============================================================================

export interface ParserConfig {
  treeSitter?: {
    enabled?: boolean | undefined;
    languageConfigs?: string[] | undefined;
    maxFileSize?: number | undefined;
    timeout?: number | undefined;
    bufferSize?: number | undefined;
  };
  incremental?:
    | { enabled?: boolean | undefined; cacheSize?: number | undefined; cacheTTL?: number | undefined }
    | undefined;
  agent?:
    | {
        maxConcurrency?: number | undefined;
        memoryLimit?: number | undefined;
        priority?: number | undefined;
        batchSize?: number | undefined;
        cacheSize?: number | undefined;
        workerPoolSize?: number | undefined;
      }
    | undefined;
}

export interface IndexerConfig {
  maxConcurrency?: number | undefined;
  memoryLimit?: number | undefined;
  priority?: number | undefined;
  batchSize?: number | undefined;
  cacheSize?: number | undefined;
  cacheTTL?: number | undefined;
}

// =============================================================================
// AGENT CONFIGURATION
// =============================================================================

export interface AgentRuntimeConfig {
  maxConcurrency?: number | undefined;
  memoryLimit?: number | undefined;
  priority?: number | undefined;
}

export type DevAgentConfig = AgentRuntimeConfig;
export type DoraAgentConfig = AgentRuntimeConfig;

export interface QueryAgentConfig extends AgentRuntimeConfig {
  simpleQueryTimeout?: number | undefined;
  complexQueryTimeout?: number | undefined;
  cacheWarmupSize?: number | undefined;
}

export interface SemanticAgentConfig extends AgentRuntimeConfig {
  queueBatchSize?: number | undefined;
  batchSize?: number | undefined;
  modelPath?: string | undefined;
}

export interface AgentResourceConstraints {
  maxMemoryMB: number;
  maxCpuPercent: number;
  maxConcurrentAgents: number;
  maxTaskQueueSize: number;
}

export interface CoordinatorConfig extends AgentRuntimeConfig {
  taskQueueLimit?: number | undefined;
  loadBalancingStrategy?: "round-robin" | "least-loaded" | "priority" | undefined;
  resourceConstraints: AgentResourceConstraints;
}

export interface ConductorConfig extends CoordinatorConfig {
  complexityThreshold?: number | undefined;
  mandatoryDelegation?: boolean | undefined;
}

// =============================================================================
// INDEXING AND GIT CONFIGURATION
// =============================================================================

export interface IndexingConfig {
  // branchAware removed - auto-detected via .git directory
  autoSwitchOnBranchChange?: boolean | undefined;
  maxBranchesPerRepo?: number | undefined;
  maxTotalBranches?: number | undefined;
  evictionStrategy?: "LRU" | "LFU" | "FIFO" | undefined;
  cleanupIntervalMs?: number | undefined;
  incrementalThreshold?: number | undefined;
  dataDir?: string | undefined;
  /** Auto-index on startup if supported files detected (default: true) */
  autoIndex?: boolean | undefined;
  /** Supported file extensions for auto-index detection */
  autoIndexExtensions?: string[] | undefined;
}

export interface GitConfig {
  enabled?: boolean | undefined;
  watchBranchChanges?: boolean | undefined;
  /** Watch uncommitted file changes via git status polling (default: true) */
  watchUncommitted?: boolean | undefined;
  /** Interval for uncommitted changes polling in ms (default: 10000) */
  uncommittedPollIntervalMs?: number | undefined;
  /** Include untracked (new) files in uncommitted watch (default: true) */
  includeUntracked?: boolean | undefined;
  autoReindex?: boolean | undefined;
  diffMode?: "incremental" | "full" | undefined;
  pollIntervalMs?: number | undefined;
  /** Debounce delay for embedding generation in ms (default: 60000 = 1 min) */
  debounceMs?: number | undefined;
  /** Threshold for bulk mode (drop/rebuild index). Files > threshold = bulk mode (default: 1000) */
  bulkModeThreshold?: number | undefined;
}

// =============================================================================
// VECTOR BACKEND CONFIGURATION
// =============================================================================

export interface VectorBackendConfig {
  libsql?: {
    metric?: "cosine" | "l2" | undefined;
    compression?: "float8" | "float16" | "float32" | undefined;
    searchL?: number | undefined;
    insertL?: number | undefined;
  };
}

// =============================================================================
// MAIN APPLICATION CONFIGURATION
// =============================================================================

export interface AppConfig {
  mcp: MCPConfig;
  database: DatabaseConfig;
  logging: LoggingConfig;
  parser: ParserConfig;
  indexer: IndexerConfig;
  indexing: IndexingConfig;
  git: GitConfig;
  vectorBackend?: VectorBackendConfig | undefined;
  devAgent: DevAgentConfig;
  doraAgent: DoraAgentConfig;
  queryAgent: QueryAgentConfig;
  semanticAgent: SemanticAgentConfig;
  coordinator: CoordinatorConfig;
  conductor: ConductorConfig;
  environment: string;
  debug: boolean;
}
