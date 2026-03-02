/**
 * Development Agent - Handles implementation and indexing tasks
 * This agent is responsible for code development, indexing, and implementation tasks
 * that are delegated by the Conductor orchestrator
 */

import { readFileSync, statSync } from "node:fs";
import { cpus } from "node:os";
import { basename, extname } from "node:path";
import { buildWorkerEmbeddingConfig } from "../config/worker-embedding-config.js";
import { ConfigLoader, getConfig } from "../config/yaml-config.js";
import { type KnowledgeEntry, knowledgeBus } from "../core/knowledge-bus.js";
import { log } from "../logging/index.js";
import { getCurrentIndexingDirectory, setCurrentIndexingDirectory } from "../shared/indexing-context.js";
import { getCurrentGitBranch } from "../shared/storage-paths.js";
import { getGraphStorage, setGlobalProjectContext } from "../storage/graph-storage-factory.js";
// SQLiteManager removed - using libsql via GraphStorage
import { type AgentMessage, type AgentTask, AgentType } from "../types/agent.js";
import type { EntityRelationship, ParsedEntity, ParseResult, ParserOptions } from "../types/parser.js";
import { hashText } from "../utils/fast-hash.js";
import { tryGarbageCollect } from "../utils/runtime-detection.js";
import { BaseAgent } from "./base.js";
import { createHeuristicEntities } from "./dev/heuristic-parser.js";
import { collectFilesAsync, isCodeExtension, isDataExtension } from "./dev/index.js";
import { IndexerAgent } from "./indexer-agent.js";
// Temporarily disable ParserAgent due to web-tree-sitter ESM issues
import { ParserAgent } from "./parser-agent.js";
import { type ResourceAdjustmentCapable, ResourceAdjustmentMixin } from "./resource-adjustment-mixin.js";

// Re-export for backward compatibility
export { ALL_SUPPORTED_EXTENSIONS } from "./dev/index.js";

// Helper: yield to event loop between indexing chunks (allows vectors.written callbacks to process)
const yieldToEventLoop = (): Promise<void> => new Promise((resolve) => setImmediate(resolve));

function getDevAgentConfig() {
  const config = getConfig();
  return {
    maxConcurrency: config.devAgent?.maxConcurrency ?? 3,
    memoryLimit: config.devAgent?.memoryLimit ?? 256,
    priority: config.devAgent?.priority ?? 7,
  };
}

// =============================================================================
// PAYLOAD TYPES FOR TASK HANDLERS
// =============================================================================

interface IndexTaskPayload {
  directory: string;
  incremental?: boolean;
  excludePatterns?: string[];
  batchMode?: boolean;
}

interface ImplementationTaskPayload {
  description: string;
}

interface RefactorTaskPayload {
  target: string;
}

interface IndexingResult {
  filesProcessed: number;
  entitiesExtracted: number;
  relationshipsCreated: number;
  codeFiles?: number;
  dataFiles?: number;
  deletedEntityIds?: string[];
  totalFiles?: number;
  incrementalStats?: {
    changedFiles: number;
    newFiles: number;
    deletedFiles: number;
    skippedFiles: number;
    deletedEntities: number;
  };
  perfTimings?: Record<string, number>;
}

interface IndexingTaskResult {
  entitiesIndexed?: number;
  relationshipsCreated?: number;
}

export class DevAgent extends BaseAgent implements ResourceAdjustmentCapable {
  private parserAgent: ParserAgent | null = null;
  private indexerAgent: IndexerAgent | null = null;
  private indexBatchSize: number;
  private defaultBatchSize: number;
  private readonly defaultMaxConcurrency: number;
  private readonly defaultMemoryLimit: number;
  private resourceMixin = new ResourceAdjustmentMixin();
  // Mutex: serialize indexing tasks to prevent concurrent setProjectContext corruption
  private indexingLock: Promise<void> = Promise.resolve();

  constructor(_agentId?: string) {
    const agentConfig = getDevAgentConfig();
    super(AgentType.DEV, {
      maxConcurrency: agentConfig.maxConcurrency,
      memoryLimit: agentConfig.memoryLimit,
      priority: agentConfig.priority,
    });

    this.defaultMaxConcurrency = this.capabilities.maxConcurrency;
    this.defaultMemoryLimit = this.capabilities.memoryLimit;
    this.defaultBatchSize = 100;
    this.indexBatchSize = this.defaultBatchSize;
  }

  /**
   * Get the IndexerAgent instance.
   * Used by metrics handlers to access watcher status.
   */
  getIndexerAgent(): IndexerAgent | null {
    return this.indexerAgent;
  }

  protected async onInitialize(): Promise<void> {
    try {
      const configLoader = ConfigLoader.getInstance();
      this.defaultBatchSize = configLoader.getDevIndexBatchSize();
      this.indexBatchSize = this.defaultBatchSize;
      const useParser = configLoader.shouldUseParser();
      if (useParser) {
        try {
          this.parserAgent = new ParserAgent();
          await this.parserAgent.initialize();
          log.i("DEVAGENT", "parser_init_ok");
        } catch (e) {
          log.w("DEVAGENT", "parser_unavail", { err: String(e) });
          this.parserAgent = null;
        }
      }

      // Initialize IndexerAgent with current indexing directory context
      const currentDir = getCurrentIndexingDirectory() || process.cwd();
      log.i("DEVAGENT", "indexer_ctx", { dir: currentDir });
      this.indexerAgent = new IndexerAgent();
      await this.indexerAgent.initialize();
      // Set project context on GLOBAL GraphStorage singleton with current git branch
      const branch = getCurrentGitBranch(currentDir);
      setGlobalProjectContext(currentDir, branch);
      log.i("DEVAGENT", "global_ctx_set", { dir: currentDir, branch });
      log.i("DEVAGENT", "indexer_init_ok");
    } catch (error) {
      log.e("DEVAGENT", "subagent_init_fail", { err: String(error) });
      throw error;
    }

    // Subscribe to relevant knowledge bus topics
    knowledgeBus.subscribe(this.id, "task:implementation", async (entry: KnowledgeEntry) => {
      const data = entry.data as { targetAgent: string; taskId: string; priority?: number; [k: string]: unknown };
      if (data.targetAgent === "dev-agent") {
        const task: AgentTask = {
          id: data.taskId,
          type: "implementation",
          priority: data.priority || 5,
          payload: data,
          createdAt: Date.now(),
        };
        await this.process(task);
      }
    });

    knowledgeBus.subscribe(this.id, "resources:adjusted", (entry) => this.handleResourceAdjustment(entry));

    // Subscribe to file change events for incremental reindexing (from GitWatcher)
    // Protected against circular loop: only process events from git-watcher source
    knowledgeBus.subscribe(this.id, "indexer:files:changed", async (entry: KnowledgeEntry) => {
      const data = entry.data as { files: string[]; repositoryPath?: string; source?: string };
      // Only process events from git-watcher to avoid circular loop
      if (data.files && data.files.length > 0 && data.source?.startsWith("git-watcher")) {
        log.d("DEVAGENT", "file_change_evt", { cnt: data.files.length, src: data.source });
        await this.handleIncrementalReindex(data.files, data.repositoryPath);
      }
    });

    log.i("DEVAGENT", "init_ready");
  }

  protected canProcessTask(task: AgentTask): boolean {
    // DevAgent can handle index, implementation, refactor, dev, and parse tasks
    return (
      task.type === "index" ||
      task.type === "implementation" ||
      task.type === "refactor" ||
      task.type === "dev" ||
      task.type === "parse"
    );
  }

  protected async handleMessage(message: AgentMessage): Promise<void> {
    log.d("DEVAGENT", "recv_msg", { from: message.from, type: message.type });
    // Handle inter-agent messages if needed
  }

  protected async processTask(task: AgentTask): Promise<unknown> {
    log.d("DEVAGENT", "proc_task", { id: task.id, type: task.type });

    try {
      switch (task.type) {
        case "index":
          return await this.handleIndexTask(task);

        case "implementation":
          return await this.handleImplementationTask(task);

        case "refactor":
          return await this.handleRefactorTask(task);

        case "parse":
          return await this.handleParseTask(task);

        default:
          // For any other task type, delegate to appropriate agents
          return await this.delegateTask(task);
      }
    } catch (error) {
      log.e("DEVAGENT", "task_error", { err: String(error) });
      throw error;
    }
  }

  private async handleIndexTask(task: AgentTask): Promise<unknown> {
    // Serialize indexing: wait for any previous indexing to complete.
    // Without this, concurrent auto-indexing (server + client) corrupts shared
    // project context on IndexerAgent/BatchOperations, causing relationships
    // to be stored under the wrong project_hash.
    const prevLock = this.indexingLock;
    let releaseLock: () => void;
    this.indexingLock = new Promise<void>((resolve) => {
      releaseLock = resolve;
    });
    await prevLock;

    const payload = task.payload as IndexTaskPayload;
    log.i("DEVAGENT", "index_start", { dir: payload.directory });

    try {
      if (!this.indexerAgent) {
        throw new Error("Indexer agent not initialized");
      }

      // v3: Set project context on GLOBAL GraphStorage singleton before indexing
      const indexBranch = getCurrentGitBranch(payload.directory);
      setGlobalProjectContext(payload.directory, indexBranch);
      // v3: Also set context on IndexerAgent (for BatchOperations)
      this.indexerAgent.setProjectContext(payload.directory);
      // v6: CRITICAL - Update global ProjectContextManager so getCurrentIndexingDirectory() returns correct path
      // Without this, code using getCurrentIndexingDirectory() (e.g., vector provider setup) gets wrong project!
      setCurrentIndexingDirectory(payload.directory);
      log.d("DEVAGENT", "set_ctx", { dir: payload.directory, branch: indexBranch });

      const result = {
        status: "started",
        directory: payload.directory,
        incremental: payload.incremental || false,
        excludePatterns: payload.excludePatterns || [],
        batchMode: payload.batchMode || false,
        timestamp: Date.now(),
        filesProcessed: 0,
        entitiesExtracted: 0,
        relationshipsCreated: 0,
      };

      // Publish indexing started event
      // Publish indexing started event (topic, data, source)
      knowledgeBus.publish("indexing:started", result, this.id);

      // Perform real indexing using parser and indexer agents
      const indexingResult = await this.performRealIndexing(payload);

      return {
        ...result,
        ...indexingResult,
        status: "completed",
        message: `Real indexing completed for ${payload.directory}`,
      };
    } finally {
      releaseLock!();
    }
  }

  private async handleImplementationTask(task: AgentTask): Promise<unknown> {
    const payload = task.payload as ImplementationTaskPayload;
    log.i("DEVAGENT", "impl_start", { desc: payload.description || "task" });

    // Implementation tasks would involve code generation, modifications, etc.
    // For now, we'll return a success response
    return {
      status: "completed",
      taskId: task.id,
      implementation: {
        description: payload.description,
        targetAgent: "dev-agent",
        completed: true,
        timestamp: Date.now(),
      },
    };
  }

  private async handleRefactorTask(task: AgentTask): Promise<unknown> {
    const payload = task.payload as RefactorTaskPayload;
    log.i("DEVAGENT", "refactor_start", { target: payload.target || "code" });

    return {
      status: "completed",
      taskId: task.id,
      refactoring: {
        target: payload.target,
        suggestions: [],
        completed: true,
        timestamp: Date.now(),
      },
    };
  }

  /**
   * Handle parse task - parse a single file and return entities
   */
  private async handleParseTask(task: AgentTask): Promise<unknown> {
    const payload = task.payload as { filePath?: string };
    const filePath = payload.filePath;

    if (!filePath) {
      throw new Error("Parse task requires filePath in payload");
    }

    log.d("DEVAGENT", "parse_file", { file: filePath });

    if (!this.parserAgent) {
      log.w("DEVAGENT", "parser_unavail_empty");
      return {
        filePath,
        entities: [],
        relationships: [],
        error: "Parser not initialized",
        timestamp: Date.now(),
      };
    }

    try {
      // Use ParserAgent's parseFile directly for single file parsing
      const result = await this.parserAgent.parseFile(filePath, {});

      log.d("DEVAGENT", "parsed_ok", { file: filePath, cnt: result.entities?.length || 0 });

      return {
        filePath,
        entities: result.entities || [],
        relationships: result.relationships || [],
        timestamp: Date.now(),
      };
    } catch (error) {
      log.e("DEVAGENT", "parse_err", { file: filePath, err: String(error) });
      // Return empty result instead of crashing
      return {
        filePath,
        entities: [],
        relationships: [],
        error: String(error),
        timestamp: Date.now(),
      };
    }
  }

  private async delegateTask(task: AgentTask): Promise<unknown> {
    log.d("DEVAGENT", "delegate_task", { id: task.id });

    // For now, just return success
    // In a full implementation, this would coordinate with other agents
    return {
      status: "delegated",
      taskId: task.id,
      message: `Task ${task.id} delegated for processing`,
      timestamp: Date.now(),
    };
  }

  /**
   * Compare mtime of files against stored index to compute changed/new/deleted sets.
   * Deletes entities and file info for changed/deleted files in preparation for re-indexing.
   */
  private async prepareIncrementalDiff(
    allFiles: string[],
    totalCollected: number,
  ): Promise<{
    filesToProcess: string[];
    deletedEntityIds: string[];
    earlyReturn: IndexingResult | null;
  }> {
    const storage = await getGraphStorage();
    const indexedFiles = await storage.getAllIndexedFiles();
    const deletedEntityIds: string[] = [];

    if (indexedFiles.size === 0) {
      return { filesToProcess: allFiles, deletedEntityIds, earlyReturn: null };
    }

    const changedFiles: string[] = [];
    const newFiles: string[] = [];
    const deletedFiles: string[] = [];

    // Find changed and new files
    for (const file of allFiles) {
      const normalizedPath = file.replace(/\\/g, "/");
      const lastIndexed = indexedFiles.get(normalizedPath);

      if (lastIndexed === undefined) {
        newFiles.push(file);
      } else {
        try {
          const stats = statSync(file);
          const mtime = stats.mtimeMs;
          if (mtime > lastIndexed) {
            changedFiles.push(file);
          }
        } catch {
          // File stat failed, skip
        }
      }
    }

    // Find deleted files (in index but not on disk)
    const currentFilesSet = new Set(allFiles.map((f) => f.replace(/\\/g, "/")));
    for (const [indexedPath] of indexedFiles) {
      if (!currentFilesSet.has(indexedPath)) {
        deletedFiles.push(indexedPath);
      }
    }

    // Delete entities for changed and deleted files (before reindexing)
    const filesToClean = [...changedFiles, ...deletedFiles];
    if (filesToClean.length > 0) {
      log.i("DEVAGENT", "Cleaning entities for changed/deleted files", {
        changed: changedFiles.length,
        deleted: deletedFiles.length,
      });

      for (const file of filesToClean) {
        try {
          const ids = await storage.deleteEntitiesByFilePath(file);
          deletedEntityIds.push(...ids);
          await storage.deleteFileInfo(file);
        } catch (error) {
          log.w("DEVAGENT", "Failed to clean entities for file", {
            file,
            error: (error as Error).message,
          });
        }
      }

      log.i("DEVAGENT", "Entities cleaned", {
        entityCount: deletedEntityIds.length,
      });
    }

    const filesToProcess = [...changedFiles, ...newFiles];

    log.i("DEVAGENT", "Smart incremental", {
      total: totalCollected,
      changed: changedFiles.length,
      new: newFiles.length,
      deleted: deletedFiles.length,
      toProcess: filesToProcess.length,
      entitiesDeleted: deletedEntityIds.length,
    });

    if (filesToProcess.length === 0) {
      return {
        filesToProcess: [],
        deletedEntityIds,
        earlyReturn: {
          filesProcessed: 0,
          entitiesExtracted: 0,
          relationshipsCreated: 0,
          incrementalStats: {
            changedFiles: 0,
            newFiles: 0,
            deletedFiles: deletedFiles.length,
            skippedFiles: totalCollected,
            deletedEntities: deletedEntityIds.length,
          },
        },
      };
    }

    return { filesToProcess, deletedEntityIds, earlyReturn: null };
  }

  /**
   * Initialize the embedding pipeline: select provider (TEI/OVMS/llamacpp/vLLM),
   * start llama-server if needed, create centralized EmbeddingGenerator.
   */
  private async initEmbeddingPipeline(
    embeddingConfig: NonNullable<ReturnType<typeof buildWorkerEmbeddingConfig>>,
    _payload: IndexTaskPayload,
  ): Promise<void> {
    // For llamacpp: start server in background
    if (embeddingConfig.provider === "llamacpp") {
      const { llamacppEmbeddingManager } = await import("../semantic/llamacpp-server-manager.js");
      const { loadSemanticConfig, getDataDir } = await import("../utils/config-paths.js");
      const { existsSync, readdirSync } = await import("node:fs");
      const { join } = await import("node:path");

      const semanticConfig = loadSemanticConfig();
      const llamacppConfig = semanticConfig?.embedding?.llamacpp;

      if (llamacppConfig && !llamacppEmbeddingManager.getState().isRunning) {
        const dataDir = getDataDir();
        const searchPaths = [
          join(dataDir, "hf-cache", "multilingual-e5-base-Q8_0.gguf"),
          join(dataDir, "llamacpp", "models", "multilingual-e5-base-Q8_0.gguf"),
          join(dataDir, "models", "multilingual-e5-base-Q8_0.gguf"),
        ];

        let modelPath: string | null = null;
        for (const p of searchPaths) {
          if (existsSync(p)) {
            modelPath = p;
            break;
          }
        }

        if (!modelPath) {
          const hfCache = join(dataDir, "hf-cache");
          if (existsSync(hfCache)) {
            try {
              const files = readdirSync(hfCache);
              const gguf = files.find((f) => f.endsWith(".gguf"));
              if (gguf) modelPath = join(hfCache, gguf);
            } catch {
              // Ignore
            }
          }
        }

        if (modelPath) {
          log.i("DEVAGENT", "Starting llama-server for workers...", { port: 8085, model: modelPath });
          const started = await llamacppEmbeddingManager.ensureRunning({
            modelPath,
            mode: "embedding",
            port: 8085,
            contextSize: llamacppConfig.context_size || 512,
            nGpuLayers: llamacppConfig.n_gpu_layers ?? 99,
          });
          if (started) {
            log.i("DEVAGENT", "llama-server ready for workers");
          } else {
            log.w("DEVAGENT", "llama-server start failed - embeddings may not work");
          }
        }
      }
    }

    // For centralized embedding mode (OVMS/llamacpp): create EmbeddingGenerator in Main
    if (embeddingConfig.centralizedEmbeddings && this.parserAgent) {
      try {
        const { EmbeddingGenerator } = await import("../semantic/embedding-generator.js");
        const { buildEmbeddingGeneratorOptions } = await import("../agents/semantic/provider-config.js");
        const { loadSemanticConfig } = await import("../utils/config-paths.js");
        const { getConfig } = await import("../config/yaml-config.js");

        const semanticConfig = loadSemanticConfig();
        const yamlConfig = getConfig();

        const generatorOptions = buildEmbeddingGeneratorOptions(
          embeddingConfig.provider as import("./semantic/provider-config.js").ProviderKind,
          embeddingConfig.modelName,
          embeddingConfig.batchSize,
          semanticConfig,
          yamlConfig,
        );

        const embeddingGenerator = new EmbeddingGenerator(generatorOptions);

        // Initialize with timeout so TEI unavailability doesn't block indexing.
        // 90s gives enough time for docker restart + model reload if container was hung.
        const initTimeoutMs = 90_000;
        try {
          await Promise.race([
            embeddingGenerator.initialize(),
            new Promise<never>((_, reject) =>
              setTimeout(() => reject(new Error(`TEI init timeout after ${initTimeoutMs}ms`)), initTimeoutMs),
            ),
          ]);
        } catch (initErr) {
          log.w(
            "DEVAGENT",
            "Centralized EmbeddingGenerator init timeout/fail, indexing will proceed without embeddings",
            {
              err: (initErr as Error).message,
            },
          );
        }

        await this.parserAgent.setEmbeddingGenerator(embeddingGenerator);
        log.i("DEVAGENT", "Centralized EmbeddingGenerator configured", {
          provider: embeddingConfig.provider,
          model: embeddingConfig.modelName,
        });
      } catch (error) {
        log.e("DEVAGENT", "Failed to initialize centralized EmbeddingGenerator", {
          error: (error as Error).message,
        });
      }
    }
  }

  /**
   * Initialize the vector provider (LayeredFaiss or Faiss) and configure it
   * on the parser agent. Removes old embeddings for deleted entities in incremental mode.
   */
  private async initVectorProvider(payload: IndexTaskPayload, deletedEntityIds: string[]): Promise<void> {
    if (!this.parserAgent) return;

    const { getProjectHash, getCurrentGitBranchOrDefault } = await import("../shared/storage-paths.js");
    const configLoader = ConfigLoader.getInstance();
    const embConfig = configLoader.getEmbeddingConfig();
    const useLayeredIndex = embConfig.useLayeredIndex;
    const projectHash = getProjectHash(payload.directory);
    const currentBranch = getCurrentGitBranchOrDefault(payload.directory);

    let vectorProvider: import("../semantic/faiss/types.js").IVectorProvider | null = null;

    try {
      if (useLayeredIndex) {
        const { getLayeredFaissProvider } = await import("../semantic/faiss/layered-faiss-provider.js");
        const provider = getLayeredFaissProvider();

        if ("initialize" in provider && typeof provider.initialize === "function") {
          log.d("DEVAGENT", "Initializing LayeredFaissProvider", {
            dir: payload.directory,
            projectHash,
            branch: currentBranch,
          });
          await provider.initialize(payload.directory, projectHash, currentBranch);
        }
        vectorProvider = provider;
      } else {
        const { initializeFaissProvider } = await import("../semantic/faiss/faiss-provider.js");
        const provider = await initializeFaissProvider();
        if (provider) {
          await provider.setProjectContext(projectHash, currentBranch);
          vectorProvider = provider;
        }
      }
    } catch (e) {
      log.w("DEVAGENT", "Failed to get vector provider", { error: String(e) });
    }

    if (vectorProvider) {
      log.d("DEVAGENT", "vector_provider_branch", {
        branch: currentBranch,
        layered: useLayeredIndex,
      });
      this.parserAgent.setVectorProvider(vectorProvider);
      log.i("DEVAGENT", "Vector provider configured", {
        projectHash,
        dir: payload.directory,
        layered: useLayeredIndex,
      });

      // Smart Incremental: remove embeddings for deleted entities
      if (deletedEntityIds.length > 0) {
        try {
          const embeddingIds = deletedEntityIds.map((id) => (id.startsWith("ent:") ? id : `ent:${id}`));
          await vectorProvider.remove(embeddingIds);
          log.i("DEVAGENT", "Removed embeddings for changed/deleted files", {
            count: embeddingIds.length,
          });
        } catch (error) {
          log.w("DEVAGENT", "Failed to remove embeddings", {
            error: (error as Error).message,
          });
        }
      }
    } else {
      log.w("DEVAGENT", "Vector provider not available - embeddings will not be saved");
    }
  }

  /**
   * Flush pending embeddings to FAISS, create Prolly Tree commit,
   * switch to keepalive mode, run GC.
   */
  private async postIndexingCleanup(
    _codeFiles: string[],
    filesProcessed: number,
    totalEntities: number,
    perfStart: number,
    perfTimings: Record<string, number>,
    _effectiveBatchSize: number,
    _dataFiles: string[],
  ): Promise<void> {
    // Flush embeddings to FAISS and create graph commit in parallel (independent storage)
    perfTimings["embFlush_start"] = Date.now() - perfStart;
    perfTimings["commit_start"] = Date.now() - perfStart;

    const faissFlushPromise = (async () => {
      if (!this.parserAgent) return;
      const accumulator = this.parserAgent.getAccumulator();
      if (!accumulator) return;
      const pendingCount = accumulator.getPendingCount();
      if (pendingCount > 0) {
        log.i("DEVAGENT", "Flushing pending embeddings to FAISS", { pending: pendingCount });
        try {
          const flushed = await accumulator.flush();
          log.i("DEVAGENT", "Embeddings flushed to FAISS", { flushed });
        } catch (err) {
          log.e("DEVAGENT", "Failed to flush embeddings", { error: (err as Error).message });
        }
      }
      const stats = accumulator.getStats();
      log.i("DEVAGENT", "Embedding accumulator stats", {
        accumulated: stats.accumulated,
        flushed: stats.flushed,
        flushCount: stats.flushCount,
        totalBytes: stats.totalBytes,
      });
    })();

    const graphCommitPromise = (async () => {
      try {
        const storage = await getGraphStorage();
        const adapter = (storage as any).getLibSQLAdapter?.();
        if (adapter?.createGraphCommit) {
          const commitHash = await adapter.createGraphCommit(`Index: ${filesProcessed} files`);
          if (commitHash) {
            log.i("DEVAGENT", "graph_commit_created", {
              commit: commitHash.slice(0, 8),
              files: filesProcessed,
              entities: totalEntities,
            });
          }
          // GC: keep last 20 commits per branch, clean orphaned Prolly nodes
          adapter.pruneAndGC?.(20)?.catch?.((err: unknown) => log.w("DEVAGENT", "prune_gc_fail", { err: String(err) }));
        }
      } catch (err) {
        log.w("DEVAGENT", "graph_commit_failed", { error: (err as Error).message });
      }
    })();

    await Promise.all([faissFlushPromise, graphCommitPromise]);

    perfTimings["embFlush_end"] = Date.now() - perfStart;
    perfTimings["commit_end"] = Date.now() - perfStart;

    // Switch to keepalive mode
    perfTimings["keepalive_start"] = Date.now() - perfStart;
    if (this.parserAgent) {
      try {
        const memoryBeforeMB = this.parserAgent.getTotalMemoryMB();
        log.i("DEVAGENT", "Switching to keepalive mode (spawning ONE worker for incremental updates)", {
          memoryMB: memoryBeforeMB,
        });

        await this.parserAgent.enableKeepaliveMode();

        const memoryAfterMB = this.parserAgent.getTotalMemoryMB();
        log.i("DEVAGENT", "Keepalive mode enabled, ready for incremental updates", {
          memoryBeforeMB,
          memoryAfterMB,
        });
        log.flush();
      } catch (err) {
        log.w("DEVAGENT", "Failed to enable keepalive mode, falling back to shutdown", {
          error: (err as Error).message,
        });
        try {
          await this.parserAgent.shutdown();
          this.parserAgent = null;
        } catch {
          // ignore
        }
      }
    }
    perfTimings["keepalive_end"] = Date.now() - perfStart;

    // Force garbage collection after indexing to reclaim memory
    if (tryGarbageCollect(true)) {
      log.i("DEVAGENT", "gc_after_index");
    }
  }

  /**
   * Format 15+ timing measurements into a structured performance summary log.
   */
  private buildPerfSummary(
    perfTimings: Record<string, number>,
    _codeFiles: string[],
    _dataFiles: string[],
    _filesProcessed: number,
    _totalEntities: number,
    _totalRelationships: number,
    _effectiveBatchSize: number,
    perfStart: number,
  ): void {
    perfTimings["total"] = Date.now() - perfStart;
    log.i("DEVAGENT", "PERF_SUMMARY", {
      collectFiles: (perfTimings["collectFiles_end"] ?? 0) - (perfTimings["collectFiles_start"] ?? 0),
      destroyPools: (perfTimings["destroyPools_end"] ?? 0) - (perfTimings["destroyPools_start"] ?? 0),
      preSpawn: (perfTimings["preSpawn_end"] ?? 0) - (perfTimings["preSpawn_start"] ?? 0),
      parsing: (perfTimings["parsing_end"] ?? 0) - (perfTimings["parsing_start"] ?? 0),
      flush: (perfTimings["flush_end"] ?? 0) - (perfTimings["flush_start"] ?? 0),
      dataFiles: (perfTimings["dataFiles_end"] ?? 0) - (perfTimings["dataFiles_start"] ?? 0),
      swaggerLink: (perfTimings["swaggerLink_end"] ?? 0) - (perfTimings["swaggerLink_start"] ?? 0),
      embFlush: (perfTimings["embFlush_end"] ?? 0) - (perfTimings["embFlush_start"] ?? 0),
      keepalive: (perfTimings["keepalive_end"] ?? 0) - (perfTimings["keepalive_start"] ?? 0),
      total: perfTimings["total"],
    });
  }

  private async performRealIndexing(payload: IndexTaskPayload): Promise<IndexingResult> {
    const directory = payload.directory;
    const excludePatterns = payload.excludePatterns || [];
    const perfStart = Date.now();
    const perfTimings: Record<string, number> = {};

    log.i("DEVAGENT", "Starting indexing", {
      directory,
      excludePatternsCount: excludePatterns.length,
      samplePatterns: excludePatterns.slice(0, 5),
    });

    // Smart Incremental: filter to only changed/new files
    const isIncremental = payload.incremental === true;

    // OPTIMIZATION: Run collectFiles in PARALLEL with preSpawn preparation
    // For full reindex: destroyPools + setPoolMode + setEmbeddingConfig run alongside collectFiles
    // This saves ~300-400ms by overlapping I/O-bound operations
    perfTimings["collectFiles_start"] = Date.now() - perfStart;
    const collectPromise = collectFilesAsync(directory, { excludePatterns, agentId: this.id });

    // Prepare preSpawn in parallel with collectFiles (only for full reindex)
    let preSpawnPreparePromise: Promise<{
      embeddingConfig: ReturnType<typeof buildWorkerEmbeddingConfig>;
    } | null> | null = null;
    if (!isIncremental && this.parserAgent) {
      perfTimings["preSpawnPrepare_start"] = Date.now() - perfStart;
      preSpawnPreparePromise = (async () => {
        // 1. Destroy existing worker pools
        log.i("DEVAGENT", "Destroying existing worker pools for full reindex (parallel with collectFiles)");
        await this.parserAgent!.destroyWorkerPools();

        // 2. Set pool mode — per-language pools run in parallel (Promise.all)
        // Faster for initial indexing: N languages × M workers = high parallelism
        await this.parserAgent!.setPoolMode("per-language");

        // 3. Configure embedding
        const embeddingConfig = buildWorkerEmbeddingConfig();
        if (embeddingConfig) {
          this.parserAgent!.setEmbeddingConfig(embeddingConfig);
          log.i("DEVAGENT", "Embedding config passed to parser", {
            provider: embeddingConfig.provider,
            model: embeddingConfig.modelName,
          });
        }

        return { embeddingConfig };
      })();
    }

    // Wait for collectFiles
    const collectResult = await collectPromise;
    let allFiles = collectResult.files;
    perfTimings["collectFiles_end"] = Date.now() - perfStart;
    log.i("DEVAGENT", "Files collected", {
      count: allFiles.length,
      ms: perfTimings["collectFiles_end"]! - perfTimings["collectFiles_start"]!,
    });

    // Wait for preSpawn preparation (if running)
    let preSpawnPrepareResult: { embeddingConfig: ReturnType<typeof buildWorkerEmbeddingConfig> } | null = null;
    if (preSpawnPreparePromise) {
      preSpawnPrepareResult = await preSpawnPreparePromise;
      perfTimings["preSpawnPrepare_end"] = Date.now() - perfStart;
      log.i("DEVAGENT", "PreSpawn preparation done (parallel)", {
        ms: perfTimings["preSpawnPrepare_end"]! - perfTimings["preSpawnPrepare_start"]!,
      });
    }
    let deletedEntityIds: string[] = [];

    if (isIncremental && allFiles.length > 0) {
      const diff = await this.prepareIncrementalDiff(allFiles, collectResult.files.length);
      deletedEntityIds = diff.deletedEntityIds;
      if (diff.earlyReturn) {
        log.i("DEVAGENT", "No files changed, skipping indexing");
        return diff.earlyReturn;
      }
      allFiles = diff.filesToProcess;
    }

    // Separate code files (AST parsing) from data files (heuristic entities)
    const codeFiles: string[] = [];
    const dataFiles: string[] = [];
    for (const file of allFiles) {
      const ext = extname(file).toLowerCase();
      if (isCodeExtension(ext)) {
        codeFiles.push(file);
      } else {
        dataFiles.push(file);
      }
    }
    log.i("DEVAGENT", "Files separated", {
      codeFiles: codeFiles.length,
      dataFiles: dataFiles.length,
    });

    const isDebugMode = process.env["MCP_DEBUG_MODE"] === "1";
    // All files go to parser in ONE batch - parser distributes to workers via chunks
    // No artificial batching needed here, ParserAgent handles parallelization
    const effectiveBatchSize = Infinity;

    log.i("DEVAGENT", "parser_batch", { files: codeFiles.length });
    const parseOptions: ParserOptions = isDebugMode
      ? {
          batchSize: Math.max(1, Math.min(3, effectiveBatchSize)),
          useCache: false,
        }
      : {};
    let totalEntities = 0;
    let totalRelationships = 0;
    let filesProcessed = 0;

    // Capture initial indexer stats to calculate delta at the end
    const initialIndexerStats = this.indexerAgent?.getIndexingStats() ?? {
      entitiesIndexed: 0,
      relationshipsCreated: 0,
      filesProcessed: 0,
      totalIndexTime: 0,
      lastIndexTime: 0,
    };

    // Pool mode configuration:
    // - Full reindex: already configured in parallel (preSpawnPrepareResult)
    // - Incremental: configure now (universal pool with keepalive)
    let preSpawnPromise: Promise<void> | null = null;
    if (this.parserAgent) {
      if (isIncremental) {
        // Incremental: use universal pool (keepalive, fast for small changes)
        await this.parserAgent.setPoolMode("universal");
        log.i("DEVAGENT", "Pool mode configured", { mode: "universal", isIncremental });
      } else {
        // Full reindex: pool mode already set in parallel preparation (per-language)
        log.i("DEVAGENT", "Pool mode configured", { mode: "per-language", isIncremental });
      }
    }

    // Get embedding config (from parallel preparation or build new for incremental)
    const embeddingConfig = preSpawnPrepareResult?.embeddingConfig ?? buildWorkerEmbeddingConfig();

    // Configure embedding and preSpawn
    if (this.parserAgent && embeddingConfig) {
      // For incremental mode: set embedding config now (wasn't done in parallel)
      if (isIncremental) {
        this.parserAgent.setEmbeddingConfig(embeddingConfig);
        log.i("DEVAGENT", "Embedding config passed to parser", {
          provider: embeddingConfig.provider,
          model: embeddingConfig.modelName,
        });
      }

      // PRE-SPAWN: Start worker pools with embedding config already set
      // llamacpp server start + centralized EmbeddingGenerator run in parallel
      const pipelinePromise = this.initEmbeddingPipeline(embeddingConfig, payload);

      if (!isIncremental && codeFiles.length > 0) {
        perfTimings["preSpawn_start"] = Date.now() - perfStart;
        preSpawnPromise = this.parserAgent.preSpawnPools(codeFiles);
      }

      // Wait for embedding pipeline (llamacpp server, centralized generator)
      await pipelinePromise;

      // Configure vector provider (LayeredFaiss or Faiss) + remove deleted embeddings
      await this.initVectorProvider(payload, deletedEntityIds);
    }

    // Enable streaming mode: index results as they arrive from workers
    // BATCH ACCUMULATOR: Queue data and flush in batches to reduce DB operations
    // Instead of 492 separate DB calls, we do ~10 batch calls (50 files each)
    const streamingIndexedFiles = new Set<string>();

    let totalStreamingQueueMs = 0; // Time main thread spends in streaming callback (queueForIndexing)
    let streamingCallbackCount = 0;

    if (this.parserAgent && this.indexerAgent) {
      // Streaming callback - queues for batch indexing (instant, non-blocking)
      this.parserAgent.setStreamingMode(true, (result, _taskId, _fileIndex, _totalFiles) => {
        if (!result.filePath || !result.entities || result.entities.length === 0) {
          return;
        }

        // Mark as streaming immediately
        streamingIndexedFiles.add(result.filePath);

        // Measure time spent in queueForIndexing on main thread
        const queueStart = Date.now();
        this.indexerAgent!.queueForIndexing(result.entities, result.filePath, result.relationships || []);
        totalStreamingQueueMs += Date.now() - queueStart;
        streamingCallbackCount++;
      });
      log.i("DEVAGENT", "Streaming mode enabled (batch accumulator)");
    }

    // Wait for pre-spawned workers to be ready before parsing
    if (preSpawnPromise) {
      await preSpawnPromise;
      perfTimings["preSpawn_end"] = Date.now() - perfStart;
    }

    // Process CODE files through ParserAgent (AST parsing with worker pools)
    perfTimings["parsing_start"] = Date.now() - perfStart;
    let totalWorkerParseMs = 0; // Time workers spend parsing (wall-clock from main's perspective)
    let totalMainProcessMs = 0; // Time main thread spends processing results
    let totalMainIndexMs = 0; // Time main thread spends indexing to graph
    const files = codeFiles; // Use only code files for parsing
    for (let i = 0; i < files.length; i += effectiveBatchSize) {
      const batch = files.slice(i, Math.min(i + effectiveBatchSize, files.length));

      try {
        if (this.parserAgent) {
          // DEBUG: Log batch extensions before parsing
          const batchExtStats: Record<string, number> = {};
          for (const f of batch) {
            const ext = extname(f).toLowerCase() || "(no ext)";
            batchExtStats[ext] = (batchExtStats[ext] || 0) + 1;
          }
          log.i("DEVAGENT", "Sending batch to parser", {
            batchSize: batch.length,
            batchIndex: i,
            extensions: batchExtStats,
          });

          const parseTask: AgentTask = {
            id: `parse-${Date.now()}-${i}`,
            type: "parse:batch",
            priority: 8,
            payload: { files: batch, options: parseOptions },
            createdAt: Date.now(),
          };

          const parseStart = Date.now();
          const results = (await this.parserAgent.process(parseTask)) as ParseResult[];
          const parseMs = Date.now() - parseStart;
          totalWorkerParseMs += parseMs;
          const processStart = Date.now();

          // DEBUG: Log parse results count
          log.i("DEVAGENT", "Parser batch completed", {
            batchSent: batch.length,
            resultsReceived: results?.length || 0,
            batchIndex: i,
            parseMs,
            filesPerSec: Math.round((batch.length / parseMs) * 1000),
          });
          log.flush(); // Ensure batch completion is visible in logs

          // VERBOSE DEBUG: Analyze results structure
          let resultsWithFilePath = 0;
          let resultsWithEntities = 0;
          let resultsWithEmptyEntities = 0;
          let totalEntityCount = 0;
          for (const res of results || []) {
            if (res?.filePath) resultsWithFilePath++;
            if (Array.isArray(res?.entities)) {
              if (res.entities.length > 0) {
                resultsWithEntities++;
                totalEntityCount += res.entities.length;
              } else {
                resultsWithEmptyEntities++;
              }
            }
          }
          log.d("DEVAGENT", "batch_parse_analysis", {
            batch: i,
            results: results?.length || 0,
            withPath: resultsWithFilePath,
            withEnts: resultsWithEntities,
            empty: resultsWithEmptyEntities,
            total: totalEntityCount,
          });

          const byFile = new Map<string, { entities: ParsedEntity[]; relationships: EntityRelationship[] }>();

          for (const res of results || []) {
            const fp = res?.filePath;
            if (!fp) continue;
            const slot = byFile.get(fp) ?? { entities: [], relationships: [] };

            if (Array.isArray(res.entities)) {
              slot.entities.push(...res.entities);
            }

            if (Array.isArray(res.relationships)) {
              for (const r of res.relationships) {
                if (r?.from && r.to && r.type) {
                  slot.relationships.push({
                    from: r.from,
                    to: r.to,
                    type: r.type,
                    targetFile: fp,
                  });
                }
              }
            }

            byFile.set(fp, slot);
          }

          // DEBUG: Count total relationships extracted from parse results
          let totalRelationshipsExtracted = 0;
          let resultsWithRelationships = 0;
          for (const res of results || []) {
            if (Array.isArray(res?.relationships) && res.relationships.length > 0) {
              resultsWithRelationships++;
              totalRelationshipsExtracted += res.relationships.length;
            }
          }
          log.d("DEVAGENT", "batch_rels", {
            batch: i,
            withRels: resultsWithRelationships,
            total: totalRelationshipsExtracted,
          });

          // DEBUG: Log how many unique files have results (totalEntityCount already calculated above)
          log.i("DEVAGENT", "Files ready for indexing", {
            uniqueFiles: byFile.size,
            batchIndex: i,
            totalEntities: totalEntityCount,
            totalRelationships: totalRelationshipsExtracted,
          });

          log.d("DEVAGENT", "batch_summary", {
            batch: i,
            sent: batch.length,
            results: results?.length || 0,
            unique: byFile.size,
          });

          totalMainProcessMs += Date.now() - processStart;
          const indexStart = Date.now();

          // PARALLEL indexing with frequent yields to allow IPC callbacks
          // OPTIMIZATION 1: Reduced from 32 to 8 for more frequent event loop yields
          const INDEXING_CONCURRENCY = 8;

          // Filter out files already indexed via streaming
          const fileEntries = Array.from(byFile.entries()).filter(([file]) => !streamingIndexedFiles.has(file));

          if (fileEntries.length > 0) {
            log.i("DEVAGENT", "Post-batch indexing (non-streamed files)", {
              total: byFile.size,
              alreadyStreamed: streamingIndexedFiles.size,
              remaining: fileEntries.length,
            });
          }

          // OPTIMIZATION 2: Process files with yields INSIDE the loop, not just between chunks
          // This allows vectors.written callbacks to process between individual file indexings
          let pendingPromises: Promise<{ result: IndexingTaskResult | null; error: Error | null }>[] = [];
          let pendingCount = 0;

          for (const [file, group] of fileEntries) {
            const indexTask: AgentTask = {
              id: `index-entities-${Date.now()}-${i}-${file}`,
              type: "index:entities",
              priority: 7,
              payload: {
                entities: group.entities,
                relationships: group.relationships,
                filePath: file,
              },
              createdAt: Date.now(),
            };

            const promise = (async () => {
              try {
                const indexResult = await this.indexerAgent?.enqueue(indexTask);
                return { result: indexResult as IndexingTaskResult | null, error: null };
              } catch (err) {
                log.w("DEVAGENT", "index_file_fail", { file, err: (err as Error).message });
                return { result: null, error: err as Error };
              }
            })();

            pendingPromises.push(promise);
            pendingCount++;

            // When we hit concurrency limit, wait for all and yield
            if (pendingCount >= INDEXING_CONCURRENCY) {
              const results = await Promise.all(pendingPromises);
              for (const { result } of results) {
                if (result) {
                  totalEntities += result.entitiesIndexed || 0;
                  totalRelationships += result.relationshipsCreated || 0;
                  filesProcessed += 1;
                }
              }
              pendingPromises = [];
              pendingCount = 0;
              // Yield to event loop - allows vectors.written callbacks to process
              await yieldToEventLoop();
            }
          }

          // Process remaining files
          if (pendingPromises.length > 0) {
            const results = await Promise.all(pendingPromises);
            for (const { result } of results) {
              if (result) {
                totalEntities += result.entitiesIndexed || 0;
                totalRelationships += result.relationshipsCreated || 0;
                filesProcessed += 1;
              }
            }
          }

          totalMainIndexMs += Date.now() - indexStart;

          // NOTE: Streaming results are added after the main loop completes
          // to avoid double-counting (moved outside the batch loop)

          // DISABLED: gc() crashes Bun when called during OpenVINO native operations
          // if (isDebugMode) {
          //   global.gc?.();
          // }
        } else {
          const entities: ParsedEntity[] = [];
          const relationships: EntityRelationship[] = [];

          for (const file of batch) {
            const extWithDot = extname(file).toLowerCase();
            const fileName = basename(file);
            const fileNameNoExt = fileName.replace(/\.[^/.]+$/, "");
            const ext = extWithDot.slice(1) || fileName; // For dotfiles like .gitignore

            // Determine file type
            const isCode = isCodeExtension(extWithDot);
            const isData = isDataExtension(extWithDot) || isDataExtension("." + fileName.toLowerCase());

            if (!isCode && !isData) {
              continue;
            }

            // For data files, compute contentHash for semantic merge
            let contentHash: string | undefined;
            let fileContent: string | undefined;
            if (isData) {
              try {
                fileContent = readFileSync(file, "utf-8");
                contentHash = hashText(fileContent);
              } catch {
                // Failed to read file - skip hash
              }
            }

            // file entity - create for all files
            entities.push({
              name: fileName,
              type: "file",
              filePath: file,
              language: ext, // Top-level language for TechnologyDetector
              location: { start: { line: 1, column: 0, index: 0 }, end: { line: 1, column: 0, index: 0 } },
              metadata: {
                language: ext,
                path: file,
                isDataFile: isData,
                contentHash, // For semantic merge
              },
            });

            // For data files, do not create additional entities (module, class, function)
            if (isData) {
              continue;
            }

            // module entity - for ALL code files (fallback when parserAgent is unavailable)
            // This is minimal indexing so that files are visible in search
            entities.push({
              name: fileNameNoExt,
              type: "module",
              filePath: file,
              language: ext, // Top-level language for TechnologyDetector
              location: { start: { line: 1, column: 0, index: 0 }, end: { line: 100, column: 0, index: 0 } },
              metadata: { language: ext, moduleType: "file" },
            });

            // Python: classes by convention start with an uppercase letter
            if (ext === "py" && /^[A-Z]/.test(fileNameNoExt)) {
              entities.push({
                name: fileNameNoExt,
                type: "class",
                filePath: file,
                language: "python",
                location: { start: { line: 5, column: 0, index: 0 }, end: { line: 50, column: 0, index: 0 } },
                metadata: { language: "python", visibility: "public" },
              });
            }

            // Kotlin/Java: classes by convention start with an uppercase letter
            if ((ext === "kt" || ext === "kts" || ext === "java") && /^[A-Z]/.test(fileNameNoExt)) {
              entities.push({
                name: fileNameNoExt,
                type: "class",
                filePath: file,
                language: ext === "java" ? "java" : "kotlin",
                location: { start: { line: 5, column: 0, index: 0 }, end: { line: 50, column: 0, index: 0 } },
                metadata: { language: ext, visibility: "public" },
              });
            }

            // JS/TS: exported functions for non-test files
            if ((ext === "js" || ext === "ts") && !file.includes(".test.") && !file.includes(".spec.")) {
              entities.push({
                name: `export_default`,
                type: "function",
                filePath: file,
                language: ext === "ts" ? "typescript" : "javascript",
                location: { start: { line: 10, column: 0, index: 0 }, end: { line: 30, column: 0, index: 0 } },
                metadata: { language: ext, exported: true },
              });
            }
          }

          // file -> module
          for (const entity of entities) {
            if (entity.type === "file") {
              const moduleEntity = entities.find((e) => e.type === "module" && e.filePath === entity.filePath);
              if (moduleEntity) {
                relationships.push({
                  from: entity.name,
                  to: moduleEntity.name,
                  type: "contains",
                });
              }
            }
          }
          // module -> class/function
          for (const entity of entities) {
            if (entity.type === "module") {
              const related = entities.filter(
                (e) => (e.type === "class" || e.type === "function") && e.filePath === entity.filePath,
              );
              for (const rel of related) {
                relationships.push({
                  from: entity.name,
                  to: rel.name,
                  type: rel.type === "class" ? "defines_class" : "defines_function",
                  sourceFile: entity.filePath,
                });
              }
            }
          }
          // class -> methods
          for (const entity of entities) {
            if (entity.type === "class") {
              const funcs = entities.filter((e) => e.type === "function" && e.filePath === entity.filePath);
              for (const f of funcs) {
                relationships.push({ from: entity.name, to: f.name, type: "has_method", sourceFile: entity.filePath });
              }
            }
          }

          const byFile = new Map<string, { entities: ParsedEntity[]; relationships: EntityRelationship[] }>();
          for (const e of entities) {
            if (!e.filePath) continue;
            const slot = byFile.get(e.filePath) ?? { entities: [], relationships: [] };
            slot.entities.push(e);
            byFile.set(e.filePath, slot);
          }
          for (const r of relationships) {
            const fp = r.sourceFile || null;
            if (!fp) continue;
            const slot = byFile.get(fp) ?? { entities: [], relationships: [] };
            slot.relationships.push({ from: r.from, to: r.to, type: r.type, targetFile: r.targetFile });
            byFile.set(fp, slot);
          }

          for (const [file, group] of byFile.entries()) {
            if (!group.entities.length) continue;
            const indexTask: AgentTask = {
              id: `index-entities-${Date.now()}-${i}-${file}`,
              type: "index:entities",
              priority: 7,
              payload: { entities: group.entities, relationships: group.relationships, filePath: file },
              createdAt: Date.now(),
            };
            try {
              const indexResult = await this.indexerAgent?.process(indexTask);
              const indexed = indexResult as IndexingTaskResult | undefined;
              if (indexed) {
                totalEntities += indexed.entitiesIndexed || 0;
                totalRelationships += indexed.relationshipsCreated || 0;
                filesProcessed += 1;
              }
            } catch (err) {
              log.w("DEVAGENT", "idx_fail", { file, err: String(err) });
            }
          }
        }
      } catch (error) {
        log.e("DEVAGENT", "batch_err", {
          batch: i,
          cnt: batch.length,
          err: error instanceof Error ? error.message : String(error),
        });
        // Continue processing next batch despite error
      }

      if ((i + effectiveBatchSize) % 500 === 0 || i + effectiveBatchSize >= files.length) {
        log.i("DEVAGENT", "progress", { done: filesProcessed, total: files.length });
      }
    }

    // Disable streaming mode after code files parsing is complete
    perfTimings["parsing_end"] = Date.now() - perfStart;

    // Detailed breakdown of "parsing" phase - shows main thread bottleneck
    const totalParsingPhase = (perfTimings["parsing_end"] ?? 0) - (perfTimings["parsing_start"] ?? 0);
    // Note: streamingQueueMs runs INSIDE workerParseMs (concurrent on event loop during IPC waits)
    // So real worker-only time ≈ workerParseMs - streamingQueueMs
    const estimatedPureWorkerMs = Math.max(0, totalWorkerParseMs - totalStreamingQueueMs);
    log.i("DEVAGENT", "PARSING_PHASE_BREAKDOWN", {
      totalMs: totalParsingPhase,
      workerParseMs: totalWorkerParseMs,
      streamingQueueMs: totalStreamingQueueMs,
      streamingCallbacks: streamingCallbackCount,
      estimatedPureWorkerMs,
      mainProcessMs: totalMainProcessMs,
      mainIndexMs: totalMainIndexMs,
      overheadMs: totalParsingPhase - totalWorkerParseMs - totalMainProcessMs - totalMainIndexMs,
      pureWorkerPct: totalParsingPhase > 0 ? `${Math.round((estimatedPureWorkerMs / totalParsingPhase) * 100)}%` : "0%",
      streamingPct: totalParsingPhase > 0 ? `${Math.round((totalStreamingQueueMs / totalParsingPhase) * 100)}%` : "0%",
      mainProcessPct: totalParsingPhase > 0 ? `${Math.round((totalMainProcessMs / totalParsingPhase) * 100)}%` : "0%",
      mainIndexPct: totalParsingPhase > 0 ? `${Math.round((totalMainIndexMs / totalParsingPhase) * 100)}%` : "0%",
    });
    if (this.parserAgent) {
      this.parserAgent.setStreamingMode(false);
    }

    // Flush any remaining queued data from batch accumulator
    perfTimings["flush_start"] = Date.now() - perfStart;
    let streamingEntities = 0;
    let streamingRelationships = 0;
    if (this.indexerAgent) {
      const pendingStats = this.indexerAgent.getPendingBatchStats();
      if (pendingStats.files > 0) {
        log.i("DEVAGENT", "Flushing remaining batch accumulator", pendingStats);
      }
      await this.indexerAgent.flushPendingBatch();

      // Get delta stats from all streaming flushes (cumulative - initial)
      const finalStats = this.indexerAgent.getIndexingStats();
      streamingEntities = finalStats.entitiesIndexed - initialIndexerStats.entitiesIndexed;
      streamingRelationships = finalStats.relationshipsCreated - initialIndexerStats.relationshipsCreated;

      log.i("DEVAGENT", "Streaming mode disabled, code parsing complete", {
        streamedFiles: streamingIndexedFiles.size,
        deltaEntities: streamingEntities,
        deltaRelationships: streamingRelationships,
      });
    }

    // Use delta streaming stats (this indexing run only)
    totalEntities = streamingEntities;
    totalRelationships = streamingRelationships;
    filesProcessed += streamingIndexedFiles.size;

    // Process DATA files with heuristic entities (no AST, just file-level indexing)
    // Use parallel processing for better performance
    perfTimings["flush_end"] = Date.now() - perfStart;
    if (dataFiles.length > 0) {
      perfTimings["dataFiles_start"] = Date.now() - perfStart;
      const dataResult = await this.processDataFilesParallel(dataFiles);
      totalEntities += dataResult.entities;
      filesProcessed += dataResult.files;
      perfTimings["dataFiles_end"] = Date.now() - perfStart;
    }

    // Post-indexing: Resolve Swagger ↔ Code links (only if swagger entities exist)
    perfTimings["swaggerLink_start"] = Date.now() - perfStart;
    try {
      const { resolveSwaggerLinks } = await import("./dev/indexing-pipeline.js");
      const swaggerRels = await resolveSwaggerLinks();
      if (swaggerRels > 0) {
        totalRelationships += swaggerRels;
        log.i("DEVAGENT", "swagger_links_created", { count: swaggerRels });
      }
    } catch (err) {
      log.w("DEVAGENT", "swagger_link_skip", { error: (err as Error).message });
    }
    perfTimings["swaggerLink_end"] = Date.now() - perfStart;

    perfTimings["indexing_end"] = Date.now() - perfStart;
    log.i("DEVAGENT", "index_done", {
      files: filesProcessed,
      total: allFiles.length,
      entities: totalEntities,
      rels: totalRelationships,
      totalMs: perfTimings["indexing_end"],
    });

    // FULL INDEXING COMPLETE: Switch to keepalive mode for fast incremental processing
    log.i("DEVAGENT", "=== ALL BATCH PROCESSING COMPLETE ===", {
      totalBatches: Math.ceil(codeFiles.length / effectiveBatchSize),
      codeFiles: codeFiles.length,
      dataFiles: dataFiles.length,
      filesProcessed,
      totalEntities,
      totalRelationships,
      perfTimings,
    });
    log.flush();

    // Flush embeddings, create Prolly commit, switch to keepalive, GC
    await this.postIndexingCleanup(
      codeFiles,
      filesProcessed,
      totalEntities,
      perfStart,
      perfTimings,
      effectiveBatchSize,
      dataFiles,
    );

    // Build and log performance summary
    this.buildPerfSummary(
      perfTimings,
      codeFiles,
      dataFiles,
      filesProcessed,
      totalEntities,
      totalRelationships,
      effectiveBatchSize,
      perfStart,
    );

    return {
      filesProcessed,
      entitiesExtracted: totalEntities,
      relationshipsCreated: totalRelationships,
      totalFiles: allFiles.length,
      perfTimings, // Detailed timing breakdown
    };
  }

  private handleResourceAdjustment(entry: KnowledgeEntry): void {
    this.resourceMixin.handleResourceAdjustment.call(this, entry);
  }

  adjustConcurrency(newLimit: number): void {
    const adjusted = Math.max(1, Math.min(this.defaultMaxConcurrency * 2, Math.floor(newLimit)));
    if (this.capabilities.maxConcurrency !== adjusted) {
      log.d("DEVAGENT", "adj_concurrency", { from: this.capabilities.maxConcurrency, to: adjusted });
      this.capabilities.maxConcurrency = adjusted;
    }
  }

  adjustBatchSize(newMemoryLimit: number): void {
    const ratio = Math.max(0.5, Math.min(2, newMemoryLimit / this.defaultMemoryLimit));
    const newBatchSize = Math.max(10, Math.round(this.defaultBatchSize * ratio));
    if (this.indexBatchSize !== newBatchSize) {
      log.d("DEVAGENT", "adj_batch", { from: this.indexBatchSize, to: newBatchSize });
      this.indexBatchSize = newBatchSize;
    }
  }

  /**
   * Handle incremental reindexing for changed files
   * Called when GitWatcher detects uncommitted file changes
   */
  private async handleIncrementalReindex(files: string[], _repositoryPath?: string): Promise<void> {
    if (!this.parserAgent || !this.indexerAgent) {
      log.w("DEVAGENT", "skip_reindex_no_agents");
      return;
    }

    const startTime = Date.now();
    log.i("DEVAGENT", "incr_reindex_start", { files: files.length });

    // Separate files into supported (full parsing) and other (heuristic entities)
    const supportedExtensions = [
      ".ts",
      ".tsx",
      ".js",
      ".jsx",
      ".mjs",
      ".cjs",
      ".py",
      ".go",
      ".rs",
      ".java",
      ".kt",
      ".tpl",
    ];
    const supportedFiles: string[] = [];
    const otherFiles: string[] = [];

    for (const f of files) {
      const ext = f.slice(f.lastIndexOf(".")).toLowerCase();
      if (supportedExtensions.includes(ext)) {
        supportedFiles.push(f);
      } else {
        otherFiles.push(f);
      }
    }

    if (supportedFiles.length === 0 && otherFiles.length === 0) {
      log.i("DEVAGENT", "no_files_to_reindex");
      return;
    }

    log.i("DEVAGENT", "reindex_breakdown", {
      supported: supportedFiles.length,
      heuristic: otherFiles.length,
      supportedSample: supportedFiles.slice(0, 3).map((f) => f.split(/[\\/]/).pop()),
    });

    let successCount = 0;
    let errorCount = 0;

    // Configure embeddings for incremental indexing (if not already configured)
    const embeddingConfig = buildWorkerEmbeddingConfig();
    if (embeddingConfig && this.parserAgent) {
      this.parserAgent.setEmbeddingConfig(embeddingConfig);
      log.d("DEVAGENT", "incr_embedding_config", { provider: embeddingConfig.provider });

      // Configure vector provider for incremental indexing
      const configLoader = ConfigLoader.getInstance();
      const embConfig = configLoader.getEmbeddingConfig();
      const useLayeredIndex = embConfig.useLayeredIndex;
      const currentDir = getCurrentIndexingDirectory() || process.cwd();
      const { getProjectHash, getCurrentGitBranchOrDefault } = await import("../shared/storage-paths.js");
      const projectHash = getProjectHash(currentDir);
      const currentBranch = getCurrentGitBranchOrDefault(currentDir);

      try {
        if (useLayeredIndex) {
          const { getLayeredFaissProvider } = await import("../semantic/faiss/layered-faiss-provider.js");
          const provider = getLayeredFaissProvider();
          // Note: isInitialized is private, try to initialize unconditionally
          if ("initialize" in provider && typeof provider.initialize === "function") {
            await provider.initialize(currentDir, projectHash, currentBranch);
          }
          this.parserAgent.setVectorProvider(provider);
          log.i("DEVAGENT", "incr_vector_provider", { branch: currentBranch, layered: true });
        } else {
          const { initializeFaissProvider } = await import("../semantic/faiss/faiss-provider.js");
          const provider = await initializeFaissProvider();
          if (provider) {
            await provider.setProjectContext(projectHash, currentBranch);
            this.parserAgent.setVectorProvider(provider);
            log.i("DEVAGENT", "incr_vector_provider", { branch: currentBranch, layered: false });
          }
        }
      } catch (e) {
        log.w("DEVAGENT", "incr_vector_provider_fail", { error: String(e) });
      }

      // Configure EmbeddingGenerator for centralized mode (CRITICAL for incremental indexing)
      log.d("DEVAGENT", "incr_embedding_config", {
        provider: embeddingConfig.provider,
        centralized: embeddingConfig.centralizedEmbeddings,
        batchSize: embeddingConfig.batchSize,
      });
      if (embeddingConfig.centralizedEmbeddings) {
        try {
          const { EmbeddingGenerator } = await import("../semantic/embedding-generator.js");
          const { buildEmbeddingGeneratorOptions } = await import("../agents/semantic/provider-config.js");
          const { loadSemanticConfig } = await import("../utils/config-paths.js");
          const { getConfig } = await import("../config/yaml-config.js");

          // Load configs for EmbeddingGenerator
          const semanticConfig = loadSemanticConfig();
          const yamlConfig = getConfig();

          // Build options for EmbeddingGenerator
          const generatorOptions = buildEmbeddingGeneratorOptions(
            embeddingConfig.provider as import("./semantic/provider-config.js").ProviderKind,
            embeddingConfig.modelName,
            embeddingConfig.batchSize,
            semanticConfig,
            yamlConfig,
          );

          const embeddingGenerator = new EmbeddingGenerator(generatorOptions);
          await embeddingGenerator.initialize();

          await this.parserAgent.setEmbeddingGenerator(embeddingGenerator);
          log.i("DEVAGENT", "incr_embedding_generator", {
            provider: embeddingConfig.provider,
            model: embeddingConfig.modelName,
          });
        } catch (error) {
          log.w("DEVAGENT", "incr_embedding_generator_fail", {
            error: (error as Error).message,
          });
        }
      }
    }

    // Process all supported files in one batch for efficiency
    if (supportedFiles.length > 0) {
      try {
        // Parse all files in a single batch
        log.i("DEVAGENT", "incr_parseBatch_start", { files: supportedFiles.length });
        const parseResults = await this.parserAgent.parseBatch(supportedFiles, {});
        log.i("DEVAGENT", "incr_parseBatch_done", { files: supportedFiles.length, results: parseResults.length });

        // Index each result
        for (const parseResult of parseResults) {
          if (parseResult.entities && parseResult.entities.length > 0) {
            try {
              await this.indexerAgent.indexEntities(
                parseResult.entities,
                parseResult.filePath,
                parseResult.relationships,
              );
              successCount++;
            } catch (indexError) {
              log.e("DEVAGENT", "index_fail", { file: parseResult.filePath, err: String(indexError) });
              errorCount++;
            }
          }
        }
      } catch (error) {
        log.e("DEVAGENT", "batch_parse_fail", { files: supportedFiles.length, err: String(error) });
        errorCount += supportedFiles.length;
      }
    }

    // Process non-supported files with heuristic entities (lightweight, no parser needed)
    for (const filePath of otherFiles) {
      try {
        const heuristicResult = createHeuristicEntities(filePath);
        if (heuristicResult.entities.length > 0) {
          await this.indexerAgent.indexEntities(heuristicResult.entities, filePath, heuristicResult.relationships);
          successCount++;
        }
      } catch (error) {
        log.e("DEVAGENT", "heuristic_fail", { file: filePath, err: String(error) });
        errorCount++;
      }
    }

    const elapsed = Date.now() - startTime;
    log.i("DEVAGENT", "incr_reindex_done", { success: successCount, errors: errorCount, ms: elapsed });

    // Flush any pending embeddings to FAISS
    if (this.parserAgent) {
      const accumulator = this.parserAgent.getAccumulator();
      if (accumulator) {
        const pendingCount = accumulator.getPendingCount();
        if (pendingCount > 0) {
          log.i("DEVAGENT", "Flushing incremental embeddings to FAISS", { pending: pendingCount });
          try {
            const flushed = await accumulator.flush();
            log.i("DEVAGENT", "Incremental embeddings flushed", { flushed });
          } catch (err) {
            log.e("DEVAGENT", "Failed to flush incremental embeddings", { error: (err as Error).message });
          }
        }
        // Also need to save the index to disk
        try {
          const configLoader = ConfigLoader.getInstance();
          const embConfig = configLoader.getEmbeddingConfig();
          const useLayeredIndex = embConfig.useLayeredIndex;

          if (useLayeredIndex) {
            const { getLayeredFaissProvider } = await import("../semantic/faiss/layered-faiss-provider.js");
            const provider = getLayeredFaissProvider();
            // Note: isInitialized is private, try to save unconditionally
            if ("save" in provider && typeof provider.save === "function") {
              await provider.save();
              log.i("DEVAGENT", "Saved layered FAISS index after incremental");
            }
          }
        } catch (saveErr) {
          log.w("DEVAGENT", "Failed to save FAISS index after incremental", {
            error: (saveErr as Error).message,
          });
        }
      }
    }

    // Create graph commit after incremental indexing (Prolly Tree versioning)
    try {
      const storage = await getGraphStorage();
      const adapter = (storage as any).getLibSQLAdapter?.();
      if (adapter?.createGraphCommit && successCount > 0) {
        const commitHash = await adapter.createGraphCommit(`Incremental: ${successCount} files`);
        if (commitHash) {
          log.i("DEVAGENT", "incr_commit_created", {
            commit: commitHash.slice(0, 8),
            files: successCount,
          });
        }
        // GC: keep last 20 commits per branch, clean orphaned Prolly nodes
        adapter
          .pruneAndGC?.(20)
          ?.catch?.((err: unknown) => log.w("DEVAGENT", "incr_prune_gc_fail", { err: String(err) }));
      }
    } catch (err) {
      log.w("DEVAGENT", "incr_commit_failed", { error: (err as Error).message });
    }

    // INCREMENTAL: Kill workers only if memory > 1GB (keep alive for next changes)
    if (this.parserAgent) {
      try {
        const killed = await this.parserAgent.killIfMemoryHigh(1024);
        if (killed) {
          this.parserAgent = null;
          log.i("DEVAGENT", "Parser workers killed (memory > 1GB after incremental)");
        }
      } catch (_err) {
        // Ignore memory check errors for incremental
      }
    }

    // Force garbage collection after incremental reindex
    if (tryGarbageCollect(true)) {
      log.d("DEVAGENT", "gc_after_incremental");
    }

    // Publish completion event (without source to avoid circular loop)
    knowledgeBus.publish(
      "indexer:incremental:complete",
      {
        filesProcessed: successCount,
        errors: errorCount,
        elapsedMs: elapsed,
        source: "dev-agent", // Different source to distinguish from git-watcher
      },
      this.id,
    );
  }

  /**
   * Process data files in parallel with batch insert
   * OPTIMIZATION: Instead of sequential await per file, we:
   * 1. Create heuristic entities for all files in parallel (CPU-bound, fast)
   * 2. Group by file and batch insert via indexerAgent
   * 3. Use Promise.all with chunking for controlled parallelism
   */
  private async processDataFilesParallel(dataFiles: string[]): Promise<{ entities: number; files: number }> {
    if (dataFiles.length === 0 || !this.indexerAgent) {
      return { entities: 0, files: 0 };
    }

    const startTime = Date.now();
    log.i("DEVAGENT", "Processing data files in PARALLEL", {
      count: dataFiles.length,
    });

    // Step 1: Create heuristic entities for ALL files in parallel
    // createHeuristicEntities is synchronous and fast - just creates module entity
    const CHUNK_SIZE = Math.max(32, cpus().length * 4);
    const allResults: ParseResult[] = [];

    for (let i = 0; i < dataFiles.length; i += CHUNK_SIZE) {
      const chunk = dataFiles.slice(i, i + CHUNK_SIZE);

      // Process chunk in parallel
      const chunkResults = await Promise.all(
        chunk.map(async (file) => {
          try {
            return createHeuristicEntities(file);
          } catch {
            return null;
          }
        }),
      );

      // Collect non-null results
      for (const result of chunkResults) {
        if (result && result.entities.length > 0) {
          allResults.push(result);
        }
      }
    }

    // Step 2: Batch insert all entities via indexerAgent
    // Group by file for proper file tracking
    const INDEXING_CHUNK_SIZE = Math.max(32, cpus().length * 2);
    let totalEntities = 0;
    let filesProcessed = 0;

    // Process indexing in parallel chunks
    for (let i = 0; i < allResults.length; i += INDEXING_CHUNK_SIZE) {
      const chunk = allResults.slice(i, i + INDEXING_CHUNK_SIZE);

      const indexPromises = chunk.map(async (result) => {
        try {
          const indexResult = await this.indexerAgent!.indexEntities(
            result.entities,
            result.filePath,
            result.relationships,
          );
          return { entities: indexResult.entitiesIndexed, success: true };
        } catch {
          return { entities: 0, success: false };
        }
      });

      const results = await Promise.all(indexPromises);
      for (const r of results) {
        if (r.success) {
          totalEntities += r.entities;
          filesProcessed++;
        }
      }
    }

    const elapsed = Date.now() - startTime;
    log.i("DEVAGENT", "Data files processed in PARALLEL", {
      files: filesProcessed,
      entities: totalEntities,
      elapsedMs: elapsed,
      filesPerSec: Math.round((filesProcessed / elapsed) * 1000),
    });

    return { entities: totalEntities, files: filesProcessed };
  }

  /**
   * Get embedding generation statistics from parser agent
   */
  getEmbeddingStats(): import("../types/semantic.js").EmbeddingPoolStats | null {
    return this.parserAgent?.getEmbeddingPoolStats?.() ?? null;
  }

  protected async onShutdown(): Promise<void> {
    log.i("DEVAGENT", "shutdown_start");

    // Shutdown sub-agents
    if (this.parserAgent) {
      await this.parserAgent.shutdown();
    }
    if (this.indexerAgent) {
      await this.indexerAgent.shutdown();
    }
  }
}

// Export singleton instance
export const devAgent = new DevAgent();
