/**
 * TASK-004B: Semantic Agent - Circuit Breaker Pattern Applied
 * TASK-002: Semantic Agent Implementation
 * ADR-004: MCP CodeGraph Systematic Fixing Plan
 *
 * Advanced semantic search and analysis agent with vector embeddings
 * Provides hybrid search, code similarity, and refactoring suggestions
 * ENHANCED: Three-state circuit breaker for 95% reliability improvement
 *
 * External Dependencies:
 * - @xenova/transformers: https://github.com/xenova/transformers.js - Hugging Face Transformers
 * - @libsql/client: https://github.com/tursodatabase/libsql-client-ts - LibSQL DiskANN
 * - onnxruntime-node: https://onnxruntime.ai/ - ONNX Runtime optimization
 *
 * Architecture References:
 * - Project Overview: doc/PROJECT_OVERVIEW.md
 * - Coding Standards: doc/CODING_STANDARD.md
 * - Architectural Decisions: doc/ARCHITECTURAL_DECISIONS.md
 * - Performance Guide: PERFORMANCE_GUIDE.md
 *
 * @task_id TASK-004B
 * @adr_ref ADR-004
 * @coding_standard Adheres to: doc/CODING_STANDARD.md
 * @history
 *  - 2025-09-14: Created by Dev-Agent - TASK-002: Main SemanticAgent implementation
 *  - 2025-09-17: Enhanced by Dev-Agent - TASK-004B: Added circuit breaker and reliability patterns
 *  - 2025-12-11: Refactored - Migrated from sqlite-vec to libsql DiskANN
 */

import { getConfig } from "../config/yaml-config.js";
import { type KnowledgeEntry, knowledgeBus } from "../core/knowledge-bus.js";
import { log } from "../logging/index.js";
import { CooccurrenceIndex } from "../nlp/cooccurrence-index.js";
import { QueryExpander } from "../nlp/query-expander.js";
import { CodeAnalyzer } from "../semantic/code-analyzer.js";
import { getEmbeddingAccumulator } from "../semantic/embedding-accumulator.js";
import {
  arrayToVector,
  cleanupDump,
  type DumpedEmbedding,
  getDumpStats,
  hasIncompleteDump,
  initDumpDir,
  loadAllBatches,
  saveBatch,
  vectorToArray,
} from "../semantic/embedding-dump.js";
import { EmbeddingGenerator } from "../semantic/embedding-generator.js";
import { getWarmupDimensions, takeWarmupGenerator } from "../semantic/embedding-warmup.js";
import {
  expandLargeEntities,
  getOversizedEntitiesWarning,
  type OversizedEntitiesWarning,
} from "../semantic/entity-expander.js";
import { GlobalEmbeddingCache } from "../semantic/global-embedding-cache.js";
import { HybridSearchEngine } from "../semantic/hybrid-search.js";
import { SemanticCache } from "../semantic/semantic-cache.js";
import { VectorStore } from "../semantic/vector-store.js";
import { getCurrentIndexingDirectory } from "../shared/indexing-context.js";
import { getCurrentGitBranchOrDefault, getGlobalDbPaths, getProjectHash } from "../shared/storage-paths.js";
import {
  DatabaseCorruptionError,
  getGraphStorage,
  getLibSQLAdapter,
  handleDatabaseCorruption,
} from "../storage/graph-storage-factory.js";
import { type AgentMessage, type AgentTask, AgentType } from "../types/agent.js";
import type { ParsedEntity } from "../types/parser.js";
import {
  type CloneGroup,
  type CrossLangResult,
  type RefactoringSuggestion,
  type SemanticAnalysis,
  type SemanticMetrics,
  type SemanticOperations,
  type SemanticResult,
  SemanticTaskType,
  type SimilarCode,
  type VectorEmbedding,
} from "../types/semantic.js";
import type { GraphStorage } from "../types/storage.js";
import { CircuitBreaker } from "../utils/circuit-breaker.js";
import { loadSemanticConfig } from "../utils/config-paths.js";
import { hashText } from "../utils/fast-hash.js";
import { sleep } from "../utils/runtime-detection.js";
// =============================================================================
// 1. IMPORTS AND DEPENDENCIES
// =============================================================================
import { BaseAgent } from "./base.js";
import type { QueryAgent } from "./query-agent.js";
import { type ResourceAdjustmentCapable, ResourceAdjustmentMixin } from "./resource-adjustment-mixin.js";
import { warmupSemanticCache as warmupSemanticCacheExtracted } from "./semantic/cache-warmup.js";
import { processStandaloneComments as processStandaloneCommentsExtracted } from "./semantic/comment-processor.js";
// Extracted modules
import {
  EMBEDDING_EXCLUDE_PATTERNS,
  type EmbeddingProcessorContext,
  isTrivialEntity,
  processPreGeneratedEmbeddings,
  shouldExcludeFromEmbedding,
} from "./semantic/embedding-processor.js";
import {
  buildEmbeddingGeneratorOptions,
  getBatchSizeFromConfig,
  getModelNameFromSemanticConfig,
  mapSemanticConfigToProvider,
} from "./semantic/provider-config.js";
import { type HotspotInput, VectorIndexManager } from "./semantic/vector-index-manager.js";

// =============================================================================
// 2. CONSTANTS AND CONFIGURATION
// =============================================================================

function getSemanticAgentConfig() {
  const config = getConfig();
  return {
    maxConcurrency: config.semanticAgent?.maxConcurrency ?? 5,
    memoryLimit: config.semanticAgent?.memoryLimit ?? 240,
    priority: config.semanticAgent?.priority ?? 8,
    batchSize: config.semanticAgent?.batchSize ?? 8,
    queueBatchSize: config.semanticAgent?.queueBatchSize ?? 100,
    modelPath: config.semanticAgent?.modelPath ?? "./models",
  };
}

const AGENT_CONFIG = getSemanticAgentConfig();

// EMBEDDING_EXCLUDE_PATTERNS imported from ./semantic/embedding-processor.js

// =============================================================================
// 3. DATA MODELS AND TYPE DEFINITIONS
// =============================================================================
interface SemanticTaskPayload {
  type: SemanticTaskType;
  query?: string;
  code?: string;
  entities?: ParsedEntity[];
  threshold?: number | undefined;
  languages?: string[];
  limit?: number;
}

// HotspotInput type imported from vector-index-manager.ts

// =============================================================================
// 5. CORE BUSINESS LOGIC
// =============================================================================
export class SemanticAgent extends BaseAgent implements SemanticOperations, ResourceAdjustmentCapable {
  private vectorStore!: VectorStore;
  private embeddingGen!: EmbeddingGenerator;
  private hybridSearch!: HybridSearchEngine;
  private cache: SemanticCache;
  private codeAnalyzer!: CodeAnalyzer;
  private vectorIndexManager!: VectorIndexManager;

  // Track if embedding generator is ready (Ollama connected)
  private embeddingReady = false;
  private embeddingReadyPromise: Promise<void> | null = null;
  private embeddingInitError: Error | null = null;
  private embeddingDim = 384;
  private embeddingBatchSize = AGENT_CONFIG.batchSize;
  private readonly defaultMaxConcurrency: number;
  private readonly defaultMemoryLimit: number;
  private readonly defaultBatchSize: number = AGENT_CONFIG.batchSize;
  private resourceMixin = new ResourceAdjustmentMixin();

  // TASK-004B: Circuit breaker for reliability
  private circuitBreaker = new CircuitBreaker({ name: "SemanticAgent" });

  // Last indexing warning about oversized entities
  private lastOversizedWarning: OversizedEntitiesWarning | null = null;

  // Flag to prevent duplicate generation calls
  private isGeneratingEmbeddings = false;
  private lastGenerationCompleteTime = 0;

  // Mutex for OpenVINO - prevents concurrent native calls that crash Bun
  private embeddingMutex: Promise<void> = Promise.resolve();

  // Model name for embeddings (stored separately for type safety)
  private embeddingModelName = "all-MiniLM-L6-v2";

  // Two-phase mode: dump embeddings to disk, then insert to DB
  // Workaround for Bun crash with concurrent OpenVINO + LibSQL native modules
  private twoPhaseMode = false;
  private dumpBatchIndex = 0;

  // Global embedding cache for language built-ins and framework patterns
  private globalCache: GlobalEmbeddingCache | null = null;

  // Query expansion components for improved semantic search recall
  private cooccurrenceIndex: CooccurrenceIndex | null = null;
  private queryExpander: QueryExpander | null = null;

  /**
   * Get last oversized entities warning (for index tool response)
   */
  getLastOversizedWarning(): OversizedEntitiesWarning | null {
    return this.lastOversizedWarning;
  }

  /**
   * Get current embedding model name
   */
  get modelName(): string {
    return this.embeddingModelName;
  }

  /**
   * Get embedding dimensions by generating a test embedding
   */
  private async getEmbeddingDimensions(): Promise<number> {
    // Try cached dimensions from warmup first (avoids extra embedding call)
    const warmupDims = getWarmupDimensions();
    if (warmupDims) {
      this.embeddingDim = warmupDims;
      log.i("SEMANTIC", "dims_from_warmup", { dims: warmupDims });
      return warmupDims;
    }

    // Fallback: detect dimensions via test embedding with timeout to avoid blocking auto_index
    // if TEI is not yet available (waitForReady can block up to 5 minutes)
    try {
      const timeoutMs = 5000;
      const testEmbedding = await Promise.race([
        this.embeddingGen.generateEmbedding("dimension detection test"),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error(`dim detection timeout after ${timeoutMs}ms`)), timeoutMs),
        ),
      ]);
      const dimensions = testEmbedding.length;
      this.embeddingDim = dimensions;
      log.i("SEMANTIC", "dims_detected", { dims: dimensions });
      return dimensions;
    } catch (error) {
      log.w("SEMANTIC", "dims_fallback", { err: (error as Error).message, dims: 384 });
      this.embeddingDim = 384;
      return 384;
    }
  }

  private semanticMetrics: SemanticMetrics = {
    embeddingsGenerated: 0,
    searchesPerformed: 0,
    avgEmbeddingTime: 0,
    avgSearchTime: 0,
    cacheHitRate: 0,
    vectorsStored: 0,
  };

  constructor() {
    super(AgentType.SEMANTIC, {
      maxConcurrency: AGENT_CONFIG.maxConcurrency,
      memoryLimit: AGENT_CONFIG.memoryLimit,
      priority: AGENT_CONFIG.priority,
    });

    // Initialize basic components first
    this.cache = new SemanticCache({
      maxSize: 5000,
      ttl: 3600000, // 1 hour
    });

    this.defaultMaxConcurrency = this.capabilities.maxConcurrency;
    this.defaultMemoryLimit = this.capabilities.memoryLimit;
    this.embeddingBatchSize = this.defaultBatchSize;
  }

  private async setupComponents(): Promise<void> {
    const startTime = Date.now();
    const config = getConfig();
    log.t("SEMANTIC", "setup_start", {});
    // Load semantic config from semantic-config.json (set by setup-embedding command)
    const semanticConfig = loadSemanticConfig();
    log.t("SEMANTIC", "config_loaded", { ms: Date.now() - startTime });

    // Two-phase mode: dump embeddings to disk, then insert to DB
    // Workaround for Bun crash with concurrent OpenVINO + LibSQL native modules
    this.twoPhaseMode = config.mcp?.embedding?.twoPhaseMode ?? false;
    if (this.twoPhaseMode) {
      log.i("SEMANTIC", "two_phase_mode", {});
      initDumpDir();
      this.dumpBatchIndex = 0;
    }

    // Determine provider: semantic-config.json takes priority, then YAML config, then auto-detection
    const yamlProvider = config.mcp?.embedding?.provider;
    const jsonProvider = mapSemanticConfigToProvider(semanticConfig);
    const provider = jsonProvider !== "auto" ? jsonProvider : (yamlProvider ?? "auto");

    // Determine model name
    const yamlModel = config.mcp?.embedding?.model;
    const jsonModel = getModelNameFromSemanticConfig(semanticConfig);
    const modelName = jsonModel !== "all-MiniLM-L6-v2" ? jsonModel : yamlModel || "all-MiniLM-L6-v2";
    this.embeddingModelName = modelName; // Store for type-safe access

    const providerSource =
      jsonProvider !== "auto" ? "semantic-config.json" : yamlProvider ? "YAML config" : "auto-detect";
    log.i("SEMANTIC", "init", { provider, model: modelName, src: providerSource });

    // Batch size: warmup settings, then semantic-config.json, then default
    const warmupSettings = config.mcp?.semantic;
    if (warmupSettings?.cacheWarmupLimit && warmupSettings.cacheWarmupLimit > 0) {
      this.embeddingBatchSize = Math.min(
        this.defaultBatchSize,
        Math.max(1, Math.floor(warmupSettings.cacheWarmupLimit)),
      );
    }
    this.embeddingBatchSize = getBatchSizeFromConfig(semanticConfig, this.embeddingBatchSize);
    log.d("SEMANTIC", "batch_size", { size: this.embeddingBatchSize });

    // Try to use pre-warmed generator from early warmup (saves ~500ms)
    const preWarmedGenerator = takeWarmupGenerator();
    if (preWarmedGenerator) {
      log.i("SEMANTIC", "Using pre-warmed embedding generator");
      this.embeddingGen = preWarmedGenerator;
    } else {
      // Fallback: create new generator (warmup failed or not started)
      log.d("SEMANTIC", "Creating new embedding generator (no pre-warmed available)");
      const embeddingOptions = buildEmbeddingGeneratorOptions(
        provider,
        modelName,
        this.embeddingBatchSize,
        semanticConfig,
        config,
      );
      this.embeddingGen = new EmbeddingGenerator(embeddingOptions);
    }

    // Get dimensions dynamically from actual embedding
    const dimensions = await this.getEmbeddingDimensions();

    // v3: Use global database with project context
    const workingDir = getCurrentIndexingDirectory() || process.cwd();
    const globalPaths = getGlobalDbPaths();
    // Use global path unless explicit path is configured
    const isExplicitPath = config.database?.path && config.database.path.length > 0;
    const dbPath = isExplicitPath ? config.database.path : globalPaths.vectorsDbPath;
    log.d("SEMANTIC", "vectorstore_cfg", { path: dbPath, dims: dimensions });

    // Get vector backend configuration (libsql only)
    const vectorBackend = config.vectorBackend || {};

    // Use layered FAISS index (base + delta) for efficient branch switching
    const useLayeredIndex = config.mcp?.embedding?.useLayeredIndex ?? true;

    this.vectorStore = new VectorStore({
      dbPath: dbPath,
      dimensions: dimensions,
      workingDirectory: workingDir,
      libsql: vectorBackend.libsql,
      useLayeredIndex,
    });

    // Wait for vector store to be fully initialized
    await this.vectorStore.initialize();

    // v3: Set project context for the current working directory
    const currentBranch = getCurrentGitBranchOrDefault(workingDir);
    await this.vectorStore.setProject(workingDir, currentBranch);
    log.i("SEMANTIC", "vectorstore_ready", { project: getProjectHash(workingDir), branch: currentBranch });

    this.hybridSearch = new HybridSearchEngine(this.vectorStore, this.embeddingGen);

    // Initialize query expansion components for improved semantic search
    try {
      const graphStorage = await getGraphStorage();
      // IMPORTANT: Set project context for cooccurrence operations
      graphStorage.setProject(workingDir, currentBranch);
      const coocOps = graphStorage.getCooccurrenceOps();
      this.cooccurrenceIndex = new CooccurrenceIndex(coocOps);
      this.queryExpander = new QueryExpander(this.cooccurrenceIndex);
      this.hybridSearch.setQueryExpander(this.queryExpander);
      log.i("SEMANTIC", "query_expander_ready", { project: getProjectHash(workingDir), branch: currentBranch });
    } catch (err) {
      log.w("SEMANTIC", "query_expander_init_fail", { err: (err as Error).message });
      // Continue without query expansion - fallback to simple search
    }

    this.codeAnalyzer = new CodeAnalyzer(this.vectorStore, this.embeddingGen, this.cache);
    this.vectorIndexManager = new VectorIndexManager(this.vectorStore, this.codeAnalyzer, this.embeddingGen);
  }

  /**
   * Public method for batch embedding generation
   * Exposed for external use (backward compatibility)
   */
  public async "embeddingGen.generateBatch"(texts: string[]): Promise<Float32Array[]> {
    return this.embeddingGen.generateBatch(texts);
  }

  /**
   * Async initialization method
   */
  override async initialize(): Promise<void> {
    const startTime = Date.now();
    log.t("SEMANTIC", "init_start", {});

    await this.setupComponents();
    log.t("SEMANTIC", "setup_done", { ms: Date.now() - startTime });

    this.subscribeToKnowledgeBus();

    await super.initialize();
    log.t("SEMANTIC", "init_done", { ms: Date.now() - startTime });
  }

  /**
   * Initialize the semantic agent
   * Ollama check and warmup run in background to avoid blocking startup
   */
  protected async onInitialize(): Promise<void> {
    // Disable resource monitoring - setInterval crashes Bun with OpenVINO native module
    this.stopResourceMonitoring();

    // Initialize embedding generator (non-blocking Ollama check)
    this.initializeEmbeddingGenAsync();

    // Update initial metrics
    this.semanticMetrics.vectorsStored = await this.vectorStore.count();
    log.i("SEMANTIC", "ready", { vectors: this.semanticMetrics.vectorsStored });
  }

  /**
   * Async initialization of embedding generator and warmup (non-blocking)
   */
  private initializeEmbeddingGenAsync(): void {
    // Create promise that resolves when embedding generator is ready
    this.embeddingReadyPromise = (async () => {
      try {
        const startTime = Date.now();
        await this.embeddingGen.initialize();
        this.embeddingGen.setBatchSize(this.embeddingBatchSize);
        this.embeddingReady = true;
        const initTime = Date.now() - startTime;
        log.i("SEMANTIC", "embedding_ready", { ms: initTime });

        // Initialize global embedding cache for language built-ins
        await this.initializeGlobalCache();

        // Warmup cache in background (don't block embeddingReady)
        this.warmupSemanticCache().catch((err) => {
          log.w("SEMANTIC", "warmup_failed", { err: (err as Error).message });
        });
      } catch (error) {
        this.embeddingInitError = error as Error;
        log.e("SEMANTIC", "embedding_init_fail", { err: this.embeddingInitError.message });
        // Don't throw - store error for later retrieval by MCP tools
      }
    })();
  }

  /**
   * Wait for embedding generator to be ready (for operations that need it)
   */
  async waitForEmbeddingReady(timeoutMs = 60000): Promise<boolean> {
    if (this.embeddingReady) return true;
    if (!this.embeddingReadyPromise) return false;

    const start = Date.now();

    while (Date.now() - start < timeoutMs) {
      if (this.embeddingReady) return true;
      // Real sleep without busy-wait (Bun compatible)
      await sleep(100);
    }

    return this.embeddingReady;
  }

  /**
   * Check if embedding generator is ready (non-blocking)
   */
  isEmbeddingReady(): boolean {
    return this.embeddingReady;
  }

  /**
   * Get embedding initialization error if any
   */
  getEmbeddingInitError(): Error | null {
    return this.embeddingInitError;
  }

  /**
   * Build WorkerEmbeddingConfig for subprocess workers.
   * Workers use this config to generate embeddings locally via HTTP calls.
   * Returns null if embeddings are not enabled or not ready.
   */
  getWorkerEmbeddingConfig(): import("../types/semantic.js").WorkerEmbeddingConfig | null {
    if (!this.embeddingReady || !this.embeddingGen) {
      return null;
    }

    // Get provider info from embedding generator
    const provider = this.embeddingGen.getProvider();
    if (!provider) {
      return null;
    }

    const providerInfo = provider.info;
    const providerKind = providerInfo.name.toLowerCase() as import("../types/semantic.js").EmbeddingProviderKind;

    // Build provider options based on provider type
    let providerOptions: import("../types/semantic.js").WorkerEmbeddingConfig["providerOptions"];

    // Get config from the same sources as setupComponents()
    const { getConfig } = require("../config/yaml-config.js");
    const config = getConfig();
    const { loadSemanticConfig } = require("../utils/config-paths.js");
    const semanticConfig = loadSemanticConfig();

    switch (providerKind) {
      case "tei": {
        const teiConfig = semanticConfig?.embedding?.tei || config.mcp?.embedding?.tei;
        providerOptions = {
          baseUrl: teiConfig?.endpoint || teiConfig?.baseUrl || "http://127.0.0.1:8081",
          timeoutMs: teiConfig?.timeoutMs,
          concurrency: teiConfig?.concurrency,
          maxBatchSize: teiConfig?.max_batch_tokens,
        };
        break;
      }
      case "ovms": {
        const ovmsConfig = semanticConfig?.embedding?.ovms;
        providerOptions = {
          baseUrl: ovmsConfig?.endpoint,
          timeoutMs: ovmsConfig?.timeoutMs,
          concurrency: ovmsConfig?.concurrency,
          useEmbeddingsApi: ovmsConfig?.useEmbeddingsApi ?? true,
          encodingFormat: ovmsConfig?.encodingFormat ?? "base64",
          protocol: ovmsConfig?.protocol,
          grpcPort: ovmsConfig?.grpcPort,
        };
        break;
      }
      case "ollama": {
        const ollamaConfig = semanticConfig?.embedding?.ollama;
        providerOptions = {
          baseUrl: ollamaConfig?.endpoint,
          timeoutMs: ollamaConfig?.timeoutMs,
          concurrency: ollamaConfig?.concurrency,
        };
        break;
      }
      default:
        providerOptions = undefined;
    }

    return {
      enabled: true,
      provider: providerKind,
      modelName: providerInfo.model,
      maxTokens: providerInfo.maxTokens || 512,
      contextTokens: providerInfo.maxTokens || 512,
      batchSize: this.embeddingBatchSize,
      providerOptions,
    };
  }

  /**
   * Check if embedding generation is currently in progress
   */
  isEmbeddingGenerationInProgress(): boolean {
    return this.isGeneratingEmbeddings;
  }

  /**
   * Check if embedding generation completed recently (within last N seconds)
   */
  wasGenerationRecentlyCompleted(withinMs = 30000): boolean {
    return Date.now() - this.lastGenerationCompleteTime < withinMs;
  }

  /**
   * Switch VectorStore to a new project context.
   * v3: With unified database, we just change the project context instead of recreating VectorStore.
   *
   * @param projectPath - The project directory path
   * @param branchName - Optional branch name (defaults to 'main')
   */
  async reinitializeForProject(projectPath: string, branchName?: string): Promise<void> {
    const currentContext = this.vectorStore?.getProjectContext?.();
    const newProjectHash = getProjectHash(projectPath);
    // Use provided branch, or detect from git, or fallback to "main"
    const newBranchName = branchName || getCurrentGitBranchOrDefault(projectPath);

    // Skip if already using this context
    if (currentContext?.projectHash === newProjectHash && currentContext?.branchName === newBranchName) {
      return;
    }

    log.d("SEMANTIC", "Switching project context", {
      from: currentContext?.projectHash,
      to: newProjectHash,
      branch: newBranchName,
    });

    // v3: Just change the project context - no VectorStore recreation needed!
    await this.vectorStore.setProject(projectPath, newBranchName);

    // Update metrics for new context
    this.semanticMetrics.vectorsStored = await this.vectorStore.count();
    log.i("SEMANTIC", "Context switched", {
      project: newProjectHash,
      vectors: this.semanticMetrics.vectorsStored,
    });
  }

  /**
   * Switch to a different branch within the current project
   * v3: New method for branch switching without project change
   */
  async switchBranch(branchName: string): Promise<void> {
    const currentContext = this.vectorStore?.getProjectContext?.();
    if (!currentContext) {
      log.w("SEMANTIC", "Cannot switch branch - no context");
      return;
    }

    // branchName is required for switchBranch
    if (!branchName) {
      log.w("SEMANTIC", "switchBranch called without branchName");
      return;
    }

    // Skip if already on this branch
    if (currentContext.branchName === branchName) {
      return;
    }

    // Update context with new branch
    await this.vectorStore.setProjectContext({
      projectHash: currentContext.projectHash,
      branchName,
    });

    // Update metrics for new branch
    this.semanticMetrics.vectorsStored = await this.vectorStore.count();
    log.i("SEMANTIC", "Branch switched", {
      branch: branchName,
      vectors: this.semanticMetrics.vectorsStored,
    });
  }

  /**
   * Shutdown the semantic agent
   */
  protected async onShutdown(): Promise<void> {
    // Clean up resources
    await this.embeddingGen.cleanup();
    await this.vectorStore.close();
    this.cache.clear();
    log.i("SEMANTIC", "Shutdown complete");
  }

  /**
   * Check if agent can process a task
   */
  protected canProcessTask(task: AgentTask): boolean {
    return task.type === AgentType.SEMANTIC;
  }

  /**
   * Process a semantic task
   */
  protected async processTask(task: AgentTask): Promise<unknown> {
    const payload = task.payload as SemanticTaskPayload;

    switch (payload.type) {
      case SemanticTaskType.EMBED:
        return this.handleEmbedTask(payload);

      case SemanticTaskType.SEARCH:
        return this.handleSearchTask(payload);

      case SemanticTaskType.ANALYZE:
        return this.handleAnalyzeTask(payload);

      case SemanticTaskType.CLONE_DETECT:
        return this.handleCloneDetectionTask(payload);

      case SemanticTaskType.REFACTOR:
        return this.handleRefactorTask(payload);

      default:
        throw new Error(`Unknown semantic task type: ${payload.type}`);
    }
  }

  /**
   * Handle messages from other agents
   */
  protected async handleMessage(message: AgentMessage): Promise<void> {
    switch (message.type) {
      case "index:complete":
        await this.handleNewEntities(message.payload as ParsedEntity[]);
        break;

      case "search:request":
        await this.handleSearchRequest(message);
        break;

      default:
        log.d("SEMANTIC", "Unknown message type", { type: message.type, from: message.from });
    }
  }

  // Task handlers

  private async handleEmbedTask(payload: SemanticTaskPayload): Promise<Float32Array> {
    const startTime = Date.now();

    const embedding = await this.generateCodeEmbedding(payload.code || "");

    this.semanticMetrics.embeddingsGenerated++;
    this.updateEmbeddingTime(Date.now() - startTime);

    return embedding;
  }

  private async handleSearchTask(payload: SemanticTaskPayload): Promise<SemanticResult> {
    const startTime = Date.now();

    const result = await this.semanticSearch(payload.query || "", payload.limit);

    this.semanticMetrics.searchesPerformed++;
    this.updateSearchTime(Date.now() - startTime);

    return result;
  }

  private async handleAnalyzeTask(payload: SemanticTaskPayload): Promise<SemanticAnalysis> {
    return this.analyzeCodeSemantics(payload.code || "");
  }

  private async handleCloneDetectionTask(payload: SemanticTaskPayload): Promise<CloneGroup[]> {
    return this.detectClones(payload.threshold);
  }

  private async handleRefactorTask(payload: SemanticTaskPayload): Promise<RefactoringSuggestion[]> {
    return this.suggestRefactoring(payload.code || "");
  }

  // SemanticOperations implementation

  async semanticSearch(query: string, limit = 10): Promise<SemanticResult> {
    // Wait for embedding generator to be ready
    const ready = await this.waitForEmbeddingReady(60000);
    if (!ready) {
      log.w("SEMANTIC", "Embedding generator not ready, returning empty results", { query });
      return {
        results: [],
        totalResults: 0,
        searchTime: 0,
        processingTime: 0,
        query,
      } as SemanticResult;
    }

    // Use cache if available
    const cacheKey = `search:${query}:${limit}`;
    const cached = this.cache.get<SemanticResult>(cacheKey);
    if (cached) {
      this.updateCacheHitRate(true);
      return cached;
    }

    this.updateCacheHitRate(false);

    // TASK-004B: Execute with circuit breaker protection
    return this.circuitBreaker.execute(
      async () => {
        const result = await this.hybridSearch.semanticSearch(query, limit);
        // Cache the result
        this.cache.set(cacheKey, result, 600000); // 10 minutes TTL
        return result;
      },
      () =>
        ({
          results: [],
          totalResults: 0,
          searchTime: 0,
          processingTime: 0,
          query,
        }) as SemanticResult,
      "semanticSearch",
    );
  }

  async findSimilarCode(code: string, threshold = 0.7): Promise<SimilarCode[]> {
    return this.codeAnalyzer.findSimilarCode(code, threshold);
  }

  async detectClones(minSimilarity = 0.65): Promise<CloneGroup[]> {
    if (!this.codeAnalyzer) {
      log.w("SEMANTIC", "detectClones called before codeAnalyzer initialized");
      return [];
    }
    return this.codeAnalyzer.detectClones(minSimilarity);
  }

  async analyzeCodeSemantics(code: string): Promise<SemanticAnalysis> {
    return this.codeAnalyzer.analyzeCodeSemantics(code);
  }

  async generateCodeEmbedding(code: string): Promise<Float32Array> {
    return this.circuitBreaker.execute(
      async () => this.codeAnalyzer.generateCodeEmbedding(code),
      () => new Float32Array(this.embeddingDim),
      "generateCodeEmbedding",
    );
  }

  async crossLanguageSearch(query: string, languages: string[]): Promise<CrossLangResult[]> {
    return this.codeAnalyzer.crossLanguageSearch(query, languages);
  }

  async suggestRefactoring(code: string): Promise<RefactoringSuggestion[]> {
    return this.codeAnalyzer.suggestRefactoring(code);
  }

  /**
   * Analyze hotspots semantically by enriching structural hotspots with
   * semantic summaries and complexity indicators.
   * Delegated to VectorIndexManager for better modularity.
   */
  async analyzeHotspots(
    hotspots: HotspotInput[],
    metric: string,
  ): Promise<{
    metric: string;
    items: Array<{
      entityId?: string | undefined;
      filePath?: string | undefined;
      name?: string | undefined;
      language?: string | undefined;
      structuralScore?: number;
      semantic?: SemanticAnalysis | undefined;
      snippet?: {
        startLine?: number | undefined;
        endLine?: number;
        length?: number;
      };
    }>;
  }> {
    return this.vectorIndexManager.analyzeHotspots(hotspots, metric);
  }

  // Knowledge Bus integration

  private subscribeToKnowledgeBus(): void {
    // DISABLED: These subscriptions caused multiple processing of same entities
    // index:complete and index:completed were duplicating semantic:new_entities work
    // knowledgeBus.subscribe(this.id, "index:complete", this.handleIndexComplete.bind(this));
    // knowledgeBus.subscribe(this.id, "index:completed", this.handleIndexComplete.bind(this));

    // DISABLED: entity:* regex subscription caused excessive updates
    // knowledgeBus.subscribe(this.id, /^entity:.*/, this.handleEntityUpdate.bind(this));

    // Subscribe to semantic:new_entities for co-occurrence AND non-worker embedding generation.
    // Workers handle embedding generation via IPC for their languages (TS, JS, Python, etc.),
    // but non-worker languages (e.g., csharp via Roslyn addon) need manual generation here.
    knowledgeBus.subscribe(this.id, "semantic:new_entities", async (entry: KnowledgeEntry) => {
      const entities = entry.data as ParsedEntity[] | undefined;
      if (!entities?.length) return;

      // Always update co-occurrence
      if (this.cooccurrenceIndex) {
        try {
          await this.updateCooccurrenceFromEntities(entities);
        } catch (error) {
          log.w("COOC", "update_fail", { err: (error as Error).message, count: entities.length });
        }
      }

      // Generate embeddings for non-worker languages (csharp, etc.)
      // Worker languages have embeddings generated via IPC and don't need this path
      try {
        const { SUPPORTED_LANGUAGES: WORKER_LANGUAGES } = await import("./workers/language-detection.js");
        const workerLangs = new Set<string>(WORKER_LANGUAGES);
        const nonWorkerEntities = entities.filter((e) => !workerLangs.has(e.language ?? ""));
        if (nonWorkerEntities.length > 0) {
          log.i("EMBEDDING", "generating_for_non_worker", {
            total: entities.length,
            nonWorker: nonWorkerEntities.length,
            languages: [...new Set(nonWorkerEntities.map((e) => e.language))],
          });
          await this.handleNewEntities(nonWorkerEntities);
        }
      } catch (error) {
        log.w("EMBEDDING", "non_worker_embed_fail", { err: (error as Error).message });
      }
    });

    knowledgeBus.subscribe(this.id, "resources:adjusted", this.handleResourceAdjustment.bind(this));

    // Subscribe to debounced embedding generation events (from GitWatcher)
    // This handles incremental embedding updates with bulk mode awareness
    // Subscribe to incremental update completion for debounced embedding generation
    knowledgeBus.subscribe(this.id, "indexer:incremental:complete", async (entry: KnowledgeEntry) => {
      const data = entry.data as { reason?: string; timestamp?: number } | undefined;
      log.i("SEMANTIC", "Incremental update complete, generating embeddings", {
        reason: data?.reason,
        timestamp: data?.timestamp,
      });
      try {
        await this.generateEmbeddingsFromStorage(false); // Use incremental mode
      } catch (error) {
        log.e("SEMANTIC", "Incremental embedding generation failed", {
          error: (error as Error).message,
        });
      }
    });

    knowledgeBus.subscribe(this.id, "indexer:embeddings:generate", async (entry: KnowledgeEntry) => {
      const data = entry.data as { files: string[]; count: number; bulkMode: boolean; source?: string };
      if (data.source?.startsWith("git-watcher")) {
        await this.handleIncrementalEmbeddingGeneration(data.files, data.bulkMode);
      }
    });

    // Subscribe to branch changes to switch FAISS context
    knowledgeBus.subscribe(this.id, "indexer:branch:changed", async (entry: KnowledgeEntry) => {
      const data = entry.data as { newBranch: string; oldBranch: string; repositoryPath: string };
      log.i("SEMANTIC", "branch_change_detected", { from: data.oldBranch, to: data.newBranch });
      try {
        // Switch FAISS context to new branch
        await this.vectorStore.setProject(data.repositoryPath, data.newBranch);
        log.i("SEMANTIC", "faiss_context_switched", { branch: data.newBranch });
      } catch (error) {
        log.e("SEMANTIC", "faiss_context_switch_fail", { err: String(error) });
      }
    });

    // Subscribe to full index completion to recalculate PMI for co-occurrence
    knowledgeBus.subscribe(this.id, "index:completed", async (entry: KnowledgeEntry) => {
      const data = entry.data as { incremental?: boolean } | undefined;
      if (data?.incremental) {
        return; // Skip PMI recalculation for incremental updates
      }

      // Recalculate PMI after full indexing for better query expansion
      if (this.cooccurrenceIndex) {
        try {
          log.i("COOC", "recalculating_pmi");
          await this.cooccurrenceIndex.recalculatePMI();
          const stats = await this.cooccurrenceIndex.getStats();
          log.i("COOC", "pmi_done", { pairs: stats.totalPairs, terms: stats.totalTerms });
        } catch (error) {
          log.w("COOC", "pmi_fail", { err: (error as Error).message });
        }
      }
    });
  }

  // handleIndexComplete and handleEntityUpdate removed - subscriptions disabled to prevent duplicate processing

  /**
   * Drop vector index for faster bulk inserts during initial indexing.
   * Call rebuildVectorIndex() after all embeddings are generated.
   */
  async dropVectorIndex(): Promise<void> {
    return this.vectorIndexManager.dropVectorIndex();
  }

  /**
   * Rebuild vector index after bulk inserts.
   * Uses FAISS HNSW which supports live updates - no explicit rebuild needed.
   * Falls back to LibSQL DiskANN only if FAISS unavailable.
   */
  async rebuildVectorIndex(): Promise<void> {
    await this.vectorIndexManager.rebuildVectorIndex();
  }

  /**
   * Handle incremental embedding generation from debounced file changes.
   * Called when user stops editing (debounce period elapsed).
   *
   * @param _files - List of changed files (for logging/filtering, entities are loaded from storage)
   * @param bulkMode - If true (many files), drop/rebuild index. If false, incremental insert.
   */
  private async handleIncrementalEmbeddingGeneration(_files: string[], bulkMode: boolean): Promise<void> {
    const startTime = Date.now();

    try {
      // Wait for embedding generator to be ready
      const ready = await this.waitForEmbeddingReady(60000);
      if (!ready) {
        log.w("SEMANTIC", "Embedding not ready, skipping incremental");
        return;
      }

      // Generate embeddings for entities without embeddings (bulkMode passed through)
      const result = await this.generateEmbeddingsFromStorage(bulkMode);

      const elapsed = Date.now() - startTime;
      log.i("EMBEDDING", "Incremental complete", {
        generated: result.generated,
        skipped: result.skipped,
        bulkMode,
        elapsedMs: elapsed,
      });

      // Publish completion event
      knowledgeBus.publish(
        "semantic:embeddings:complete",
        {
          generated: result.generated,
          skipped: result.skipped,
          bulkMode,
          elapsedMs: elapsed,
          source: "incremental",
        },
        this.id,
      );
    } catch (error) {
      log.e("SEMANTIC", "Incremental embedding failed", { error: (error as Error).message });
    }
  }

  /**
   * Finalize embeddings after indexing.
   * Workers generate embeddings and send them via IPC to EmbeddingAccumulator.
   * This method flushes any pending embeddings and saves the FAISS index.
   *
   * @param _bulkMode - Deprecated, kept for API compatibility
   */
  async generateEmbeddingsFromStorage(_bulkMode = true): Promise<{ generated: number; skipped: number }> {
    // Prevent duplicate concurrent calls
    if (this.isGeneratingEmbeddings) {
      log.w("EMBEDDING", `[DUPLICATE] generateEmbeddingsFromStorage skipped - already running`);
      return { generated: 0, skipped: 0 };
    }

    this.isGeneratingEmbeddings = true;
    try {
      // Step 1: Flush any pending embeddings from EmbeddingAccumulator to FAISS
      // Workers send embeddings to accumulator which batches them for efficiency
      // This ensures all pending embeddings reach FAISS before saving to disk
      const accumulator = getEmbeddingAccumulator();
      const flushedFromAccumulator = await accumulator.flush();
      if (flushedFromAccumulator > 0) {
        log.i("EMBEDDING", "Flushed pending from accumulator", { count: flushedFromAccumulator });
      }

      // Step 2: Flush FAISS internal buffers and save index to disk
      await this.vectorStore.flushAndSave();
      log.i("EMBEDDING", "generateEmbeddingsFromStorage complete - embeddings saved to disk");

      return { generated: flushedFromAccumulator, skipped: 0 };
    } catch (error) {
      log.e("EMBEDDING", "generateEmbeddingsFromStorage failed", {
        error: (error as Error).message,
      });
      return { generated: 0, skipped: 0 };
    } finally {
      this.isGeneratingEmbeddings = false;
      this.lastGenerationCompleteTime = Date.now();
    }
  }

  /**
   * Filter entities to only those whose languages are NOT handled by worker pools.
   * Workers generate embeddings via IPC; non-worker languages (e.g. csharp via Roslyn) need manual generation.
   * Returns null if all entities are handled by workers (caller should return early).
   */
  private async filterWorkerEntities(entities: ParsedEntity[]): Promise<ParsedEntity[] | null> {
    try {
      const { buildWorkerEmbeddingConfig } = await import("../config/worker-embedding-config.js");
      const workerConfig = buildWorkerEmbeddingConfig();
      if (workerConfig?.enabled) {
        const { SUPPORTED_LANGUAGES: WORKER_LANGUAGES } = await import("./workers/language-detection.js");
        const workerLangs = new Set<string>(WORKER_LANGUAGES);
        const nonWorkerEntities = entities.filter((e) => !workerLangs.has(e.language ?? ""));
        if (nonWorkerEntities.length === 0) {
          log.d("EMBEDDING", "Skipping - workers generate embeddings via IPC", {
            agentId: this.id,
            entities: entities.length,
          });
          return null;
        }
        log.i("EMBEDDING", "non_worker_entities", {
          workerHandled: entities.length - nonWorkerEntities.length,
          needGeneration: nonWorkerEntities.length,
          languages: [...new Set(nonWorkerEntities.map((e) => e.language))],
        });
        return nonWorkerEntities;
      }
    } catch {
      // Config not available, continue with generation
    }
    return entities;
  }

  /**
   * Three-level embedding cache resolution: pre-generated → in-memory GlobalCache → LibSQL persistent cache.
   * Returns a map of hash→embedding for cached entries, plus arrays of texts/hashes that need generation.
   */
  private async resolveEmbeddingCache(texts: string[]): Promise<{
    cacheHits: Map<string, Float32Array>;
    originalIndexToHash: string[];
    uniqueTexts: string[];
    textsNeedingGeneration: string[];
    textsNeedingGenerationHashes: string[];
    dedupeSaved: number;
    globalCacheHitCount: number;
    persistentCacheHitCount: number;
  }> {
    const seenHashes = new Map<string, number>();
    const originalIndexToHash: string[] = new Array(texts.length);
    const uniqueTexts: string[] = [];

    const cacheHits = new Map<string, Float32Array>();
    const uncachedTexts: string[] = [];
    const uncachedHashes: string[] = [];

    const textsNeedingGeneration: string[] = [];
    const textsNeedingGenerationHashes: string[] = [];

    // Single pass: deduplicate AND check in-memory cache
    for (let i = 0; i < texts.length; i++) {
      const text = texts[i]!;
      const textHash = hashText(text).slice(0, 16);
      originalIndexToHash[i] = textHash;

      if (!seenHashes.has(textHash)) {
        seenHashes.set(textHash, uniqueTexts.length);
        uniqueTexts.push(text);

        const globalHit = this.globalCache?.get(text);
        if (globalHit) {
          cacheHits.set(textHash, globalHit);
        } else {
          uncachedTexts.push(text);
          uncachedHashes.push(textHash);
        }
      }
    }
    const globalCacheHitCount = cacheHits.size;

    // Check persistent cache in LibSQL (batch query)
    let persistentCacheHitCount = 0;
    const libsqlAdapter = getLibSQLAdapter();
    if (libsqlAdapter && uncachedHashes.length > 0) {
      try {
        const persistentHits = await libsqlAdapter.getEmbeddingsFromCache(uncachedHashes);
        for (let i = 0; i < uncachedHashes.length; i++) {
          const hash = uncachedHashes[i]!;
          const embedding = persistentHits.get(hash);
          if (embedding) {
            cacheHits.set(hash, embedding);
            this.globalCache?.set(uncachedTexts[i]!, embedding);
            persistentCacheHitCount++;
          } else {
            textsNeedingGeneration.push(uncachedTexts[i]!);
            textsNeedingGenerationHashes.push(hash);
          }
        }
        if (persistentCacheHitCount > 0) {
          log.i("CACHE", "Batch hits", {
            checked: uncachedHashes.length,
            hits: persistentCacheHitCount,
            remaining: textsNeedingGeneration.length,
          });
        }
      } catch (error) {
        log.w("CACHE", "Batch lookup failed", { error: (error as Error).message });
        textsNeedingGeneration.push(...uncachedTexts);
        textsNeedingGenerationHashes.push(...uncachedHashes);
      }
    } else {
      textsNeedingGeneration.push(...uncachedTexts);
      textsNeedingGenerationHashes.push(...uncachedHashes);
    }

    const dedupeSaved = texts.length - uniqueTexts.length;

    return {
      cacheHits,
      originalIndexToHash,
      uniqueTexts,
      textsNeedingGeneration,
      textsNeedingGenerationHashes,
      dedupeSaved,
      globalCacheHitCount,
      persistentCacheHitCount,
    };
  }

  /**
   * Build embedding text for a single entity: header + docs + calls + complexity + code + comments.
   */
  private buildEntityEmbeddingText(
    ent: ParsedEntity,
    fileContentCache: Map<string, string>,
    associationsByFile: Map<string, Map<string, any[]>>,
    readTextSync: (path: string) => string,
    CommentExtractor: any,
  ): string {
    const e: any = ent;
    let code = "";
    try {
      if (e.filePath && !e.filePath.startsWith("external://") && !e.filePath.includes("://")) {
        let fileContent = fileContentCache.get(e.filePath);
        if (fileContent === undefined) {
          try {
            fileContent = readTextSync(e.filePath);
            fileContentCache.set(e.filePath, fileContent);
          } catch {
            fileContent = "";
          }
        }

        if (typeof e.location?.start?.index === "number" && typeof e.location?.end?.index === "number") {
          const s = Math.max(0, e.location.start.index);
          const t = Math.min(e.location.end.index, s + 10000);
          code = fileContent.slice(s, t);
        } else if (typeof e.location?.start?.line === "number" && typeof e.location?.end?.line === "number") {
          const lines = fileContent.split("\n");
          const startLine = Math.max(0, e.location.start.line - 1);
          const endLine = Math.min(lines.length, e.location.end.line);
          code = lines.slice(startLine, endLine).join("\n").slice(0, 10000);
        }
      }
    } catch {}

    const header = `${e.name ?? ""} ${e.type ?? ""} ${e.signature ?? ""}`.trim();
    let enhancedText = header;

    if (e.documentation?.description) {
      enhancedText += `\ndescription: ${e.documentation.description}`;
    }

    if (e.calls && e.calls.length > 0) {
      let callStr = "";
      const callsToProcess = e.calls.length > 20 ? e.calls.slice(0, 20) : e.calls;
      for (let i = 0; i < callsToProcess.length; i++) {
        const c = callsToProcess[i];
        if (i > 0) callStr += ", ";
        callStr += c.target ? `${c.target}.${c.name}` : c.name;
      }
      enhancedText += `\ncalls: ${callStr}`;
    }

    if (e.complexity) {
      const cx = e.complexity;
      if (cx.cyclomatic > 5 || cx.cognitive > 10) {
        enhancedText += `\ncomplexity: cyclomatic=${cx.cyclomatic} cognitive=${cx.cognitive}`;
      }
    }

    if (e.controlFlow) {
      const cf = e.controlFlow;
      let flowStr = "";
      if (cf.branches?.length > 0) flowStr += `branches=${cf.branches.length}`;
      if (cf.loops?.length > 0) flowStr += (flowStr ? ", " : "") + `loops=${cf.loops.length}`;
      if (cf.exceptions?.length > 0) flowStr += (flowStr ? ", " : "") + `exceptions=${cf.exceptions.length}`;
      if (cf.awaits?.length > 0) flowStr += (flowStr ? ", " : "") + `awaits=${cf.awaits.length}`;
      if (flowStr) {
        enhancedText += `\nflow: ${flowStr}`;
      }
    }

    if (e.returnType) {
      enhancedText += `\nreturns: ${e.returnType}`;
    }

    if (e.parameters && e.parameters.length > 0) {
      let paramStr = "";
      let count = 0;
      for (const p of e.parameters) {
        if (p.type && count < 10) {
          if (count > 0) paramStr += ", ";
          paramStr += `${p.name}:${p.type}`;
          count++;
        }
      }
      if (paramStr) {
        enhancedText += `\nparams: ${paramStr}`;
      }
    }

    if (code) {
      enhancedText += "\n" + code;
    }

    // Enhance with comments if available
    const entityId = e.id || CommentExtractor["generateEntityId"](ent);
    const associations = associationsByFile.get(e.filePath);
    const entityComments = associations?.get(entityId) || [];

    if (entityComments.length > 0) {
      return CommentExtractor.enhanceEntityContentWithComments(enhancedText, header, entityComments);
    }
    return enhancedText.trim();
  }

  /**
   * Extract comments from source files and associate them with entities.
   */
  private async extractFileComments(filteredEntities: ParsedEntity[]): Promise<{
    commentsByFile: Map<string, any>;
    associationsByFile: Map<string, Map<string, any[]>>;
    CommentExtractor: any;
  }> {
    const { readTextSync } = await import("../utils/file-ops.js");
    const { CommentExtractor } = await import("../utils/comment-extractor.js");

    const entitiesByFile = new Map<string, ParsedEntity[]>();
    for (const entity of filteredEntities) {
      if (entity.filePath && !entity.filePath.startsWith("external://") && !entity.filePath.includes("://")) {
        if (!entitiesByFile.has(entity.filePath)) {
          entitiesByFile.set(entity.filePath, []);
        }
        entitiesByFile.get(entity.filePath)!.push(entity);
      }
    }

    const commentsByFile = new Map<string, ReturnType<typeof CommentExtractor.extractComments>>();
    const associationsByFile = new Map<string, Map<string, any[]>>();

    log.d("EMBEDDING", `Extracting comments from files`, {
      agentId: this.id,
      fileCount: entitiesByFile.size,
    });
    let fileIdx = 0;
    const mem = process.memoryUsage();
    log.d("EMBEDDING", "Memory before comment extraction", {
      heapUsedMB: Math.round(mem.heapUsed / 1024 / 1024),
      rssMB: Math.round(mem.rss / 1024 / 1024),
    });
    for (const [filePath, fileEntities] of entitiesByFile.entries()) {
      fileIdx++;
      log.t("EMBEDDING", "For loop iteration start", { fileIdx, filePath });
      if (filePath.startsWith("external://") || filePath.includes("://")) {
        continue;
      }
      try {
        log.d("EMBEDDING", `Reading file ${fileIdx}/${entitiesByFile.size}`, {
          agentId: this.id,
          filePath,
          entityCount: fileEntities.length,
        });
        const full = readTextSync(filePath);
        log.d("EMBEDDING", `File read, extracting comments`, {
          agentId: this.id,
          filePath,
          contentLen: full.length,
        });
        const commentsResult = CommentExtractor.extractComments(full, filePath);
        log.d("EMBEDDING", `Comments extracted`, {
          agentId: this.id,
          filePath,
          commentCount: commentsResult.comments.length,
        });
        commentsByFile.set(filePath, commentsResult);

        const associations = CommentExtractor.associateCommentsWithEntities(
          commentsResult.comments,
          fileEntities,
          commentsResult.leadingComments,
        );
        associationsByFile.set(filePath, associations);
        log.d("EMBEDDING", `File ${fileIdx} done`, { agentId: this.id });
      } catch (error) {
        log.d("SEMANTIC", "Comment extraction failed", { filePath, error: (error as Error).message });
      }
    }

    return { commentsByFile, associationsByFile, CommentExtractor };
  }

  /**
   * Generate embeddings via model, store in FAISS + LibSQL, handle two-phase mode.
   */
  private async generateAndStoreEmbeddings(
    filteredEntities: ParsedEntity[],
    texts: string[],
    entityToStableId: Map<ParsedEntity, string>,
    cacheResult: Awaited<ReturnType<typeof this.resolveEmbeddingCache>>,
    perfLog: (phase: string, count: number) => void,
  ): Promise<void> {
    const modelName = this.modelName;
    const {
      cacheHits,
      originalIndexToHash,
      textsNeedingGeneration,
      textsNeedingGenerationHashes,
      globalCacheHitCount,
      persistentCacheHitCount,
    } = cacheResult;
    const totalCacheHits = globalCacheHitCount + persistentCacheHitCount;

    // Log cache efficiency
    if (totalCacheHits > 0 || cacheResult.dedupeSaved > 0) {
      log.i("CACHE", "Batch optimization", {
        total: texts.length,
        toGenerate: textsNeedingGeneration.length,
        fromMemory: globalCacheHitCount,
        fromDisk: persistentCacheHitCount,
        dedupe: cacheResult.dedupeSaved,
        cacheHitRate: texts.length > 0 ? `${Math.round((totalCacheHits / texts.length) * 100)}%` : "0%",
      });
    }

    log.t("EMBEDDING", "Before mutex wait");

    // Mutex: wait for previous embedding operation to complete
    let releaseMutex: () => void;
    const prevMutex = this.embeddingMutex;
    this.embeddingMutex = new Promise((resolve) => {
      releaseMutex = resolve;
    });
    await prevMutex;

    log.t("EMBEDDING", "Mutex acquired");

    let embeddings: Float32Array[];
    let storage: Awaited<ReturnType<typeof getGraphStorage>>;

    let profileStart = 0;
    const profile = (phase: string) => {
      const elapsed = Date.now() - profileStart;
      log.i("PERF", phase, { elapsedMs: elapsed, sinceStart: `${elapsed}ms` });
    };

    try {
      const hashToEmbedding = new Map<string, Float32Array>(cacheHits);

      if (textsNeedingGeneration.length > 0) {
        log.t("EMBEDDING", "Before generateBatch", { count: textsNeedingGeneration.length });
        const generatedEmbeddings = await this.embeddingGen.generateBatch(textsNeedingGeneration);
        log.t("EMBEDDING", "After generateBatch", { count: generatedEmbeddings.length });

        for (let i = 0; i < textsNeedingGenerationHashes.length; i++) {
          hashToEmbedding.set(textsNeedingGenerationHashes[i]!, generatedEmbeddings[i]!);
        }

        // Save to persistent cache (fire-and-forget)
        const persistAdapter = getLibSQLAdapter();
        if (persistAdapter) {
          const cacheEntries = textsNeedingGenerationHashes.map((hash, i) => ({
            contentHash: hash,
            model: modelName,
            embedding: generatedEmbeddings[i]!,
            textPreview: textsNeedingGeneration[i]?.slice(0, 100),
          }));
          persistAdapter.setEmbeddingsInCache(cacheEntries).catch((err) => {
            log.w("CACHE", "Failed to save embeddings", { error: (err as Error).message });
          });
          log.d("CACHE", "Saving new embeddings", { count: cacheEntries.length });
        }
      } else {
        log.i("CACHE", "100% cache hit", { count: totalCacheHits });
      }

      embeddings = originalIndexToHash.map((hash) => hashToEmbedding.get(hash)!);
      perfLog("4_EMBEDDING_GEN", embeddings.length);

      profileStart = Date.now();

      storage = await getGraphStorage();
      profile("5a_GET_STORAGE");

      // Fetch entity data for entities that need it
      const entityDataMap = new Map();
      const entitiesToFetch = filteredEntities.filter((e) => e.id && !e.filePath && !e.path);
      if (entitiesToFetch.length > 0 && entitiesToFetch.length < 100) {
        const ids = entitiesToFetch.map((e) => e.id).filter((id): id is string => id !== undefined);
        const CONCURRENCY = 20;

        for (let i = 0; i < ids.length; i += CONCURRENCY) {
          const batch = ids.slice(i, i + CONCURRENCY);
          const results = await Promise.all(batch.map((id) => storage.getEntity(id)));
          for (let j = 0; j < batch.length; j++) {
            const result = results[j];
            if (result !== null) {
              entityDataMap.set(batch[j], result);
            }
          }
        }
      }
      profile("5b_FETCH_ENTITIES");

      const vectorEmbeddings: VectorEmbedding[] = filteredEntities.map((entity, i) => {
        const x: any = entity as any;
        const stableId = entityToStableId.get(entity) ?? (x.id ? `ent:${x.id}` : `doc:unknown`);
        const storedEntity = entityDataMap.get(x.id);
        const filePath = x.filePath ?? x.path ?? storedEntity?.filePath ?? "";
        const language = x.language ?? storedEntity?.language ?? undefined;

        const metadata: Record<string, unknown> = {
          path: filePath,
          type: x.type,
          name: x.name,
          language,
          entityId: x.id ?? undefined,
          start: x.location?.start?.index ?? undefined,
          end: x.location?.end?.index ?? undefined,
          model: modelName,
        };

        if (x.complexity) {
          metadata["cyclomatic"] = x.complexity.cyclomatic;
          metadata["cognitive"] = x.complexity.cognitive;
          metadata["linesOfCode"] = x.complexity.linesOfCode;
          metadata["nestingDepth"] = x.complexity.nestingDepth;
        }

        if (x.calls?.length) {
          metadata["callCount"] = x.calls.length;
          metadata["hasAsyncCalls"] = x.calls.some((c: any) => c.isAwait);
        }

        if (x.controlFlow) {
          const cf = x.controlFlow;
          metadata["hasBranches"] = (cf.branches?.length || 0) > 0;
          metadata["hasLoops"] = (cf.loops?.length || 0) > 0;
          metadata["hasExceptions"] = (cf.exceptions?.length || 0) > 0;
          metadata["hasAwaits"] = (cf.awaits?.length || 0) > 0;
          metadata["branchCount"] = cf.branches?.length || 0;
          metadata["loopCount"] = cf.loops?.length || 0;
          metadata["returnCount"] = cf.returns?.length || 0;
        }

        if (x.documentation) {
          metadata["hasDocumentation"] = true;
          metadata["hasParams"] = (x.documentation.params?.length || 0) > 0;
          metadata["hasExamples"] = (x.documentation.examples?.length || 0) > 0;
          metadata["isDeprecated"] = !!x.documentation.deprecated;
        }

        if (x.returnType) {
          metadata["returnType"] = x.returnType;
        }

        if (x.parameters?.length) {
          metadata["paramCount"] = x.parameters.length;
        }

        return {
          id: stableId,
          content: texts[i] ?? "",
          vector: embeddings[i] ?? new Float32Array(this.embeddingDim),
          metadata,
          createdAt: Date.now(),
        };
      });
      profile("5c_BUILD_VECTORS");

      if (this.twoPhaseMode) {
        const dumpedEmbeddings: DumpedEmbedding[] = vectorEmbeddings.map((ve) => ({
          id: ve.id,
          content: ve.content,
          vector: vectorToArray(ve.vector),
          metadata: ve.metadata as Record<string, any>,
          createdAt: ve.createdAt,
        }));

        saveBatch(dumpedEmbeddings, this.dumpBatchIndex++);
        this.semanticMetrics.embeddingsGenerated += embeddings.length;
      } else {
        if (vectorEmbeddings.length > 0) {
          log.d("EMBEDDING", `Insert sample IDs`, {
            sampleIds: vectorEmbeddings.slice(0, 3).map((v) => v.id),
          });
        }
        log.d("EMBEDDING", `Calling adaptiveBulkInsert`, {
          agentId: this.id,
          count: vectorEmbeddings.length,
        });
        const insertResult = await this.vectorStore.adaptiveBulkInsert(vectorEmbeddings);
        profile("5d_FAISS_INSERT");
        log.t("EMBEDDING", "adaptiveBulkInsert returned to caller");
        perfLog("5_DB_INSERT", vectorEmbeddings.length);
        log.d("EMBEDDING", `adaptiveBulkInsert done`, {
          agentId: this.id,
          usedFaiss: insertResult.usedFaiss,
          timeMs: insertResult.timeMs.toFixed(1),
        });
        this.semanticMetrics.embeddingsGenerated += embeddings.length;
        this.semanticMetrics.vectorsStored = await this.vectorStore.count();
        profile("5e_COUNT");
        knowledgeBus.publish("semantic:embeddings:complete", { count: embeddings.length }, this.id);
        log.i("EMBEDDING", `Stored embeddings`, {
          agentId: this.id,
          count: embeddings.length,
          total: this.semanticMetrics.vectorsStored,
        });
      }
    } finally {
      releaseMutex!();
      profile("5f_MUTEX_RELEASE");
      log.d("EMBEDDING", `Mutex released, about to process comments`, { agentId: this.id });
    }
  }

  /**
   * Process new entities and generate embeddings.
   * Public method to allow direct calls from index tool handler.
   */
  async handleNewEntities(entities: ParsedEntity[]): Promise<void> {
    if (!Array.isArray(entities) || entities.length === 0) {
      return;
    }

    // Update co-occurrence index BEFORE worker check
    // Workers skip embedding generation but we still need cooc data for query expansion
    await this.updateCooccurrenceFromEntities(entities);

    // Filter to non-worker entities (workers generate embeddings via IPC)
    const filtered = await this.filterWorkerEntities(entities);
    if (filtered === null) return;
    entities = filtered;

    // PERFORMANCE TRACKING
    const perfStart = Date.now();
    let perfPhaseStart = perfStart;
    const perfLog = (phase: string, count: number) => {
      const elapsed = Date.now() - perfPhaseStart;
      const speed = elapsed > 0 ? Math.round((count / elapsed) * 1000) : 0;
      log.i("PERF", `${phase}`, { entities: count, ms: elapsed, speed: `${speed}/s` });
      perfPhaseStart = Date.now();
    };

    // ENTITY EXPANSION: Expand large classes/interfaces into their methods
    // This ensures methods are indexed separately for better search quality
    const maxTokens = this.embeddingGen.maxTokens;
    const expandedEntities = expandLargeEntities(entities, { maxTokens });

    // FILTER and PARTITION in single pass using extracted helper
    const beforeFilter = expandedEntities.length;
    const preGeneratedEntities: ParsedEntity[] = [];
    const needGenerationEntities: ParsedEntity[] = [];
    let filteredCount = 0;

    let trivialSkipped = 0;
    for (const entity of expandedEntities) {
      const filePath = entity.filePath || "";

      // Use extracted helper for exclude pattern check
      if (shouldExcludeFromEmbedding(filePath)) {
        filteredCount++;
        continue;
      }

      // Skip trivial entities (bare getters/setters, single-return bodies)
      if (!entity.embeddingBase64 && isTrivialEntity(entity)) {
        trivialSkipped++;
        continue;
      }

      // Partition by pre-generated status
      if (entity.embeddingBase64) {
        preGeneratedEntities.push(entity);
      } else {
        needGenerationEntities.push(entity);
      }
    }

    if (filteredCount > 0 || trivialSkipped > 0) {
      log.i("EMBEDDING", `Filtered out machine-generated and trivial entities`, {
        before: beforeFilter,
        after: beforeFilter - filteredCount - trivialSkipped,
        skipped_patterns: filteredCount,
        skipped_trivial: trivialSkipped,
        patterns: EMBEDDING_EXCLUDE_PATTERNS,
      });
    }

    // Working set of entities that need embedding generation
    const embeddingEntities = needGenerationEntities;

    // ========================================================================
    // PRE-GENERATED EMBEDDINGS: Handle entities with embeddings from workers
    // ========================================================================
    if (preGeneratedEntities.length > 0) {
      log.i("EMBEDDING", `Processing pre-generated embeddings from workers`, {
        preGenerated: preGeneratedEntities.length,
        needGeneration: needGenerationEntities.length,
      });

      const modelName = this.modelName;
      const preGenCtx: Pick<EmbeddingProcessorContext, "vectorStore" | "onMetricsUpdate"> = {
        vectorStore: this.vectorStore,
        onMetricsUpdate: (count: number) => {
          this.semanticMetrics.embeddingsGenerated += count;
        },
      };

      const { processed, failed } = await processPreGeneratedEmbeddings(preGeneratedEntities, preGenCtx, modelName);
      needGenerationEntities.push(...failed);

      // Continue with entities that need generation
      embeddingEntities.length = 0;
      embeddingEntities.push(...needGenerationEntities);

      // If all entities were pre-generated, we're done
      if (embeddingEntities.length === 0) {
        this.semanticMetrics.vectorsStored = await this.vectorStore.count();
        log.i("EMBEDDING", `All embeddings were pre-generated by workers`, { total: processed });
        return;
      }
    }

    // Check for oversized entities and store warning for index tool response
    this.lastOversizedWarning = getOversizedEntitiesWarning(embeddingEntities, maxTokens);
    if (this.lastOversizedWarning.hasWarning) {
      log.w("SEMANTIC", "Oversized entities", {
        count: this.lastOversizedWarning.oversizedCount,
        maxTokens,
      });
    }

    // Filter out entities that already have embeddings (optimization for incremental indexing)
    // Use batch check instead of individual get() calls - much faster for large batches
    const modelName = this.modelName;

    // Import file reader early for content hash computation
    const { readTextSync } = await import("../utils/file-ops.js");

    // File content cache for efficient reading (reused later for text building)
    const fileContentCache = new Map<string, string>();

    // Build stableId for each entity using ONLY stable attributes
    // Location and signature are NOT stable between parser runs!
    // Use ONLY: filePath + type + name (collisions are OK - embeddings will be similar anyway)
    const entityIdMap = new Map<string, ParsedEntity>();
    for (const entity of embeddingEntities) {
      const stableId = entity.id
        ? `ent:${entity.id}`
        : `doc:${hashText(`${entity.filePath ?? ""}|${entity.type}|${entity.name ?? "anon"}|${modelName}`).slice(0, 24)}`;
      entityIdMap.set(stableId, entity);
    }

    perfLog("1_FILE_READ", entityIdMap.size);

    // Batch check existing embeddings (single query instead of N queries)
    let existingIds = new Set<string>();
    const allIds = Array.from(entityIdMap.keys());
    try {
      existingIds = await this.vectorStore.getExistingIds(allIds);
      log.d("EMBEDDING", `Batch existence check`, {
        agentId: this.id,
        total: entityIdMap.size,
        existing: existingIds.size,
      });
    } catch (error) {
      // CRITICAL: Handle corruption errors immediately to prevent duplicate generation
      if (error instanceof DatabaseCorruptionError) {
        log.e("EMBEDDING", `DATABASE CORRUPTION - recreating database`, {
          error: (error as Error).message,
        });
        // Recreate database and return - caller will need to retry with fresh db
        await handleDatabaseCorruption();
        throw new Error("Database was corrupt and has been recreated. Please retry the operation.");
      }
      log.w("EMBEDDING", `Batch existence check failed, processing all`, {
        error: (error as Error).message,
      });
    }

    // Filter to only new entities, preserving stableId for later use
    const filteredEntities: ParsedEntity[] = [];
    const entityToStableId = new Map<ParsedEntity, string>();
    for (const [stableId, entity] of entityIdMap) {
      if (!existingIds.has(stableId)) {
        filteredEntities.push(entity);
        entityToStableId.set(entity, stableId);
      }
    }

    if (filteredEntities.length === 0) {
      return;
    }

    log.i("EMBEDDING", `Generating embeddings`, { agentId: this.id, count: filteredEntities.length });

    // Extract comments from source files and associate with entities
    const { commentsByFile, associationsByFile, CommentExtractor } = await this.extractFileComments(filteredEntities);

    perfLog("2_COMMENT_EXTRACT", filteredEntities.length);

    log.d("EMBEDDING", `Comments extracted, building texts`, {
      agentId: this.id,
      entityCount: filteredEntities.length,
    });

    // Build embedding texts for each entity
    const texts: string[] = [];
    for (const ent of filteredEntities) {
      texts.push(
        this.buildEntityEmbeddingText(ent, fileContentCache, associationsByFile, readTextSync, CommentExtractor),
      );
    }

    // Clear file cache to free memory
    fileContentCache.clear();
    perfLog("3_TEXT_BUILD", texts.length);
    log.d("EMBEDDING", `Texts built`, { agentId: this.id, textCount: texts.length });

    // MEMORY OPTIMIZATION: Clear comment extraction maps before embedding generation
    // These can hold many MB of file contents and are no longer needed
    commentsByFile.clear();
    associationsByFile.clear();

    // Resolve embedding cache (3 levels: dedup → in-memory → LibSQL)
    const cacheResult = await this.resolveEmbeddingCache(texts);

    log.t("EMBEDDING", "Text deduplication complete", {
      unique: cacheResult.uniqueTexts.length,
      dedupe: cacheResult.dedupeSaved,
      needsGen: cacheResult.textsNeedingGeneration.length,
    });

    // Generate embeddings, build vectors, store to FAISS/LibSQL
    await this.generateAndStoreEmbeddings(filteredEntities, texts, entityToStableId, cacheResult, perfLog);

    // Process standalone comments (comments not associated with any entity)
    const storage = await getGraphStorage();
    log.d("EMBEDDING", `Starting processStandaloneComments`, {
      agentId: this.id,
      commentFiles: commentsByFile.size,
    });
    await this.processStandaloneComments(commentsByFile, associationsByFile, storage);
    log.t("EMBEDDING", "processStandaloneComments returned successfully", { agentId: this.id });

    // NOTE: Co-occurrence already updated at start of handleNewEntities via updateCooccurrenceFromEntities

    // Final performance summary
    const totalMs = Date.now() - perfStart;
    const totalSpeed = totalMs > 0 ? Math.round((filteredEntities.length / totalMs) * 1000) : 0;
    log.i("PERF", `BATCH_COMPLETE`, {
      entities: filteredEntities.length,
      totalMs,
      speed: `${totalSpeed}/s`,
    });
    log.d("EMBEDDING", `handleNewEntities complete`, { agentId: this.id });
  }

  /**
   * Update co-occurrence index directly from parsed entities.
   * Called early in handleNewEntities, before worker check.
   * Extracts natural language text from entity metadata (docs, comments, names).
   */
  private async updateCooccurrenceFromEntities(entities: ParsedEntity[]): Promise<void> {
    if (!this.cooccurrenceIndex || entities.length === 0) {
      return;
    }

    try {
      const startTime = Date.now();

      // Extract natural language text from entities
      const textChunks: string[] = [];

      for (const entity of entities) {
        const e = entity as any;

        // Entity name and type (split camelCase for better co-occurrence)
        if (e.name) {
          textChunks.push(e.name);
        }

        // Documentation description
        if (e.documentation?.description) {
          textChunks.push(e.documentation.description);
        }

        // Documentation params
        if (e.documentation?.params?.length > 0) {
          for (const p of e.documentation.params) {
            if (p.description) {
              textChunks.push(`${p.name} ${p.description}`);
            }
          }
        }

        // Signature (contains param types and names)
        if (e.signature && e.signature.length > 20) {
          textChunks.push(e.signature);
        }
      }

      // Filter to meaningful chunks
      const filtered = textChunks.filter((text) => {
        const hasLetters = /[a-zA-Z\u0400-\u04FF]{3,}/.test(text);
        const hasContent = text.length >= 10;
        return hasLetters && hasContent;
      });

      if (filtered.length === 0) {
        return;
      }

      await this.cooccurrenceIndex.updateFromChunks(filtered);

      const elapsed = Date.now() - startTime;
      log.d("COOC", "entities_updated", { entities: entities.length, chunks: filtered.length, ms: elapsed });
    } catch (error) {
      log.w("COOC", "entities_update_failed", { error: (error as Error).message });
    }
  }

  /**
   * Flush dumped embeddings to database (Phase 2 of two-phase mode)
   *
   * This method should be called AFTER all embedding generation is complete
   * and OpenVINO provider has been closed. It loads embeddings from dump files
   * and inserts them into LibSQL.
   *
   * @returns Number of embeddings inserted
   */
  async flushDumpToDatabase(): Promise<{ inserted: number; skipped: number }> {
    const stats = getDumpStats();

    if (stats.totalEmbeddings === 0) {
      log.i("DUMP", `No embeddings to flush`);
      return { inserted: 0, skipped: 0 };
    }

    log.i("DUMP", `Starting flush`, {
      totalEmbeddings: stats.totalEmbeddings,
      batchCount: stats.batchCount,
      diskSizeMB: (stats.diskSizeBytes / 1024 / 1024).toFixed(2),
    });

    // Load all embeddings from dump files
    const dumpedEmbeddings = loadAllBatches();

    if (dumpedEmbeddings.length === 0) {
      log.w("DUMP", `No embeddings loaded from dump files`);
      return { inserted: 0, skipped: 0 };
    }

    // Convert DumpedEmbedding back to VectorEmbedding
    const vectorEmbeddings: VectorEmbedding[] = dumpedEmbeddings.map((de) => ({
      id: de.id,
      content: de.content,
      vector: arrayToVector(de.vector),
      metadata: de.metadata,
      createdAt: de.createdAt,
    }));

    // Insert in batches to avoid memory issues
    const FLUSH_BATCH_SIZE = 100;
    let inserted = 0;
    let skipped = 0;

    for (let i = 0; i < vectorEmbeddings.length; i += FLUSH_BATCH_SIZE) {
      const batch = vectorEmbeddings.slice(i, i + FLUSH_BATCH_SIZE);
      const batchNum = Math.floor(i / FLUSH_BATCH_SIZE) + 1;

      try {
        const result = await this.vectorStore.adaptiveBulkInsert(batch);
        inserted += result.insertedCount;
      } catch (e) {
        log.e("DUMP", `Batch ${batchNum} failed`, { error: (e as Error).message });
        skipped += batch.length;
      }

      // Small delay between batches to prevent event loop blocking (Bun compatible)
      if (i + FLUSH_BATCH_SIZE < vectorEmbeddings.length) {
        await sleep(1);
      }
    }

    // Update metrics
    this.semanticMetrics.vectorsStored = await this.vectorStore.count();

    // Clean up dump files
    cleanupDump();
    this.dumpBatchIndex = 0;

    log.i("DUMP", `Flush completed`, {
      inserted,
      skipped,
      totalVectors: this.semanticMetrics.vectorsStored,
    });

    knowledgeBus.publish("semantic:embeddings:complete", { count: inserted }, this.id);

    return { inserted, skipped };
  }

  /**
   * Check if there are dumped embeddings waiting to be flushed
   */
  hasPendingDump(): boolean {
    return hasIncompleteDump();
  }

  /**
   * Get dump statistics
   */
  getDumpStatistics(): { batchCount: number; totalEmbeddings: number; diskSizeBytes: number } {
    return getDumpStats();
  }

  /**
   * Check if two-phase mode is enabled
   */
  isTwoPhaseMode(): boolean {
    return this.twoPhaseMode;
  }

  /**
   * Process standalone comments and create comment entities + relationships
   * Delegates to extracted module for implementation
   */
  private async processStandaloneComments(
    commentsByFile: Map<string, any>,
    associationsByFile: Map<string, Map<string, any[]>>,
    storage: GraphStorage,
  ): Promise<void> {
    await processStandaloneCommentsExtracted(commentsByFile, associationsByFile, storage, {
      embeddingGen: this.embeddingGen,
      vectorStore: this.vectorStore,
      embeddingDim: this.embeddingDim,
      embeddingMutex: this.embeddingMutex,
      setEmbeddingMutex: (p) => {
        this.embeddingMutex = p;
      },
    });
  }

  /**
   * Initialize global embedding cache for language built-ins and framework patterns.
   * This cache is shared across all projects and persisted to disk.
   * On first run, generates embeddings for ~500 common patterns (takes ~30s).
   * Subsequent runs load from cache instantly.
   */
  private async initializeGlobalCache(): Promise<void> {
    try {
      const dimension = this.embeddingDim;
      const modelName = this.modelName;

      this.globalCache = GlobalEmbeddingCache.getInstance();
      await this.globalCache.initialize(modelName, dimension);

      const stats = this.globalCache.getStats();
      log.i("CACHE", "Global cache ready", { total: stats.total, model: modelName });
    } catch (err) {
      log.w("CACHE", "Init failed (non-fatal)", { error: (err as Error).message });
      // Non-fatal - continue without global cache
    }
  }

  /**
   * Warm up semantic cache with popular entities
   * Delegates to extracted module for implementation
   */
  private async warmupSemanticCache(): Promise<void> {
    await warmupSemanticCacheExtracted({
      embeddingGen: this.embeddingGen,
      cache: this.cache,
      semanticMetrics: this.semanticMetrics,
      embeddingDim: this.embeddingDim,
      agentId: this.id,
      embeddingMutex: this.embeddingMutex,
      setEmbeddingMutex: (p) => {
        this.embeddingMutex = p;
      },
    });
  }

  private handleResourceAdjustment(entry: KnowledgeEntry): void {
    this.resourceMixin.handleResourceAdjustment.call(this, entry);
  }

  adjustConcurrency(newLimit: number): void {
    const adjusted = Math.max(1, Math.min(this.defaultMaxConcurrency * 2, Math.floor(newLimit)));
    if (this.capabilities.maxConcurrency !== adjusted) {
      this.capabilities.maxConcurrency = adjusted;
    }
  }

  adjustBatchSize(newMemoryLimit: number): void {
    const ratio = Math.max(0.5, Math.min(2, newMemoryLimit / this.defaultMemoryLimit));
    const newBatchSize = Math.max(1, Math.round(this.defaultBatchSize * ratio));
    if (this.embeddingBatchSize !== newBatchSize) {
      this.embeddingBatchSize = newBatchSize;
      const generator = this.embeddingGen as EmbeddingGenerator | undefined;
      if (generator && "setBatchSize" in generator && typeof generator.setBatchSize === "function") {
        generator.setBatchSize(newBatchSize);
      }
    }
  }

  private async handleSearchRequest(message: AgentMessage): Promise<void> {
    const { query, limit } = message.payload as { query: string; limit?: number };

    // Perform search
    const results = await this.semanticSearch(query, limit);

    // Send response
    await this.send({
      id: `${this.id}-response-${Date.now()}`,
      from: this.id,
      to: message.from,
      type: "search:response",
      payload: results,
      timestamp: Date.now(),
      correlationId: message.id,
    });
  }

  // Metrics helpers

  private updateEmbeddingTime(time: number): void {
    const prev = this.semanticMetrics.avgEmbeddingTime;
    const count = this.semanticMetrics.embeddingsGenerated;
    this.semanticMetrics.avgEmbeddingTime = (prev * (count - 1) + time) / count;
  }

  private updateSearchTime(time: number): void {
    const prev = this.semanticMetrics.avgSearchTime;
    const count = this.semanticMetrics.searchesPerformed;
    this.semanticMetrics.avgSearchTime = (prev * (count - 1) + time) / count;
  }

  private updateCacheHitRate(_hit: boolean): void {
    const cacheStats = this.cache.getStats();
    this.semanticMetrics.cacheHitRate = cacheStats.hitRate;
  }

  /**
   * Get semantic agent metrics
   */
  getSemanticMetrics(): SemanticMetrics {
    return { ...this.semanticMetrics };
  }

  /**
   * Get vector store instance
   * Used for layered indexing integration
   */
  getVectorStore(): VectorStore {
    return this.vectorStore;
  }

  /**
   * Generate embedding for a single text
   * Used by AutoDoc and other components that need embeddings for custom content
   */
  async generateEmbedding(text: string): Promise<Float32Array | null> {
    if (!this.embeddingGen) {
      return null;
    }
    return this.embeddingGen.generateEmbedding(text);
  }

  /**
   * Get the embedding provider for extended capabilities (rerank, score, etc.)
   */
  getEmbeddingProvider() {
    return this.embeddingGen.getProvider();
  }

  /**
   * Set query agent for hybrid search
   */
  setQueryAgent(queryAgent: QueryAgent): void {
    this.hybridSearch.setQueryAgent(queryAgent);
  }

  /**
   * Export cache for persistence
   */
  exportCache() {
    return this.cache.export();
  }

  /**
   * Import cache from persistence
   */
  importCache(data: Parameters<typeof this.cache.import>[0]): void {
    this.cache.import(data);
  }
}
