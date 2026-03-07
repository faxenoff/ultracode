/**
 * Parsing Subprocess Pool
 *
 * Subprocess-based parser pool for memory isolation.
 * Each parser runs in a separate process (spawn), accumulates memory during parsing,
 * and is killed after batch completion to release memory back to OS.
 *
 * Architecture (same as faiss-client):
 * - Under Bun: spawns bun subprocess (IPC via V8 native serialization)
 * - Under Node.js: spawns node subprocess
 *
 * Benefits over Web Workers:
 * - Memory is released when process dies (OS reclaims it)
 * - Visible as separate processes in Task Manager
 * - Can set memory limits and auto-restart on OOM
 */

import type { ChildProcess } from "node:child_process";
import { stat } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { log, logMemory } from "../../logging/index.js";
import type { ParseResult, ParserOptions } from "../../types/parser.js";
import type { EmbeddingPoolStats, WorkerEmbeddingConfig } from "../../types/semantic.js";
import {
  type BinaryEmbedding,
  type EmbeddingsCallback,
  type EmbeddingTextItem,
  type EmbeddingTextsCallback,
  killProcess,
  type ParseRequest,
  type ParseResponse,
  type QueuedTask,
  type SpawnContext,
  type StreamingResultCallback,
  type SubprocessPoolOptions,
  type SubprocessPoolStats,
  type SubprocessState,
  spawnProcess,
} from "./subprocess-pool/index.js";

// Re-export types for backward compatibility
export type {
  BinaryEmbedding,
  EmbeddingsCallback,
  EmbeddingTextItem,
  EmbeddingTextsCallback,
  StreamingResultCallback,
  SubprocessPoolOptions,
  SubprocessPoolStats,
};

// =============================================================================
// EXTENDED WORKER RESPONSE TYPES
// =============================================================================

/**
 * Worker initialized response (with embeddings configured)
 */
interface InitializedResponse {
  type: "initialized";
  embeddingEnabled?: boolean;
}

/**
 * Embeddings ready response (binary embeddings from worker)
 */
interface EmbeddingsReadyResponse {
  type: "embeddings.ready";
  count?: number;
  embeddings?: BinaryEmbedding[];
}

/**
 * Embedding texts response (for centralized generation)
 */
interface EmbeddingTextsResponse {
  type: "embeddings.texts";
  count?: number;
  texts?: EmbeddingTextItem[];
}

/**
 * Extended parse response type with embedding messages
 */
type ExtendedParseResponse = ParseResponse | InitializedResponse | EmbeddingsReadyResponse | EmbeddingTextsResponse;

/**
 * Type guard for initialized response
 */
function isInitializedResponse(response: ExtendedParseResponse): response is InitializedResponse {
  return response.type === "initialized";
}

/**
 * Type guard for embeddings ready response
 */
function isEmbeddingsReadyResponse(response: ExtendedParseResponse): response is EmbeddingsReadyResponse {
  return response.type === "embeddings.ready";
}

/**
 * Type guard for embedding texts response
 */
function isEmbeddingTextsResponse(response: ExtendedParseResponse): response is EmbeddingTextsResponse {
  return response.type === "embeddings.texts";
}

// =============================================================================
// PARSING SUBPROCESS POOL
// =============================================================================

export class ParsingSubprocessPool {
  private language: string;
  private workers: Map<number, SubprocessState> = new Map();
  private taskQueue: QueuedTask[] = [];

  private completedTasks = 0;
  private failedTasks = 0;
  private totalProcessingTime = 0;
  private totalFilesProcessed = 0;
  private processRestarts = 0;

  private readonly workerScript: string;
  private readonly poolSize: number;
  private readonly memoryLimitMB: number;
  private readonly killAfterBatch: boolean;
  private readonly maxFilesPerChunk: number;
  private embeddingConfig?: WorkerEmbeddingConfig | undefined;
  private readonly onEmbeddings?: EmbeddingsCallback | undefined;
  private readonly onEmbeddingTexts?: EmbeddingTextsCallback | undefined;
  private readonly onStreamingResult?: StreamingResultCallback | undefined;
  private readonly streamingMode: boolean;

  // Keepalive mode: keep worker 0 alive for fast incremental processing
  private keepaliveMode: boolean;
  private readonly keepaliveMemoryLimitMB: number;

  // Batch processing mode: don't kill workers while batch is in progress
  private isBatchProcessing = false;

  // Embedding statistics aggregation (across all workers)
  private embeddingStatsAgg = {
    startTime: 0,
    totalVectors: 0,
    totalBatches: 0,
    workersUsed: new Set<string>(),
  };

  private isShuttingDown = false;
  private isBun: boolean;

  constructor(language: string, options: SubprocessPoolOptions = {}) {
    this.language = language;
    this.isBun = typeof Bun !== "undefined";

    // Pool size is determined dynamically in initialize() based on file count
    // Default is 1, will be adjusted when we know how many files
    this.poolSize = options.poolSize || 1;
    this.memoryLimitMB = options.memoryLimitMB || 1024; // 1GB default
    this.killAfterBatch = options.killAfterBatch ?? true; // Kill after batch by default
    this.maxFilesPerChunk = options.maxFilesPerChunk || 40; // Optimal: 18 chunks for 523 files, -19% vs 100
    this.keepaliveMode = options.keepaliveMode ?? false;
    this.keepaliveMemoryLimitMB = options.keepaliveMemoryLimitMB || 1024; // 1GB for keepalive worker
    this.embeddingConfig = options.embeddingConfig;
    this.onEmbeddings = options.onEmbeddings;
    this.onEmbeddingTexts = options.onEmbeddingTexts;
    this.streamingMode = options.streamingMode ?? false;
    this.onStreamingResult = options.onStreamingResult;

    // Resolve paths
    // After bundling, import.meta.url points to chunk file in dist/chunks/, not agents/workers/
    // So we find dist root by checking for chunks or agents directory
    const currentDir = dirname(fileURLToPath(import.meta.url));
    let distRoot = currentDir;
    if (currentDir.includes("chunks")) {
      // Bundled: currentDir is dist/chunks, go up one level
      distRoot = dirname(currentDir);
    } else if (currentDir.includes("agents")) {
      // Development or unbundled: currentDir is agents/workers, go up two levels
      distRoot = dirname(dirname(currentDir));
    }
    this.workerScript = join(distRoot, "agents", "workers", "generic-language-worker.js");
  }

  /**
   * Initialize the subprocess pool
   */
  async initialize(): Promise<void> {
    const initPromises: Promise<void>[] = [];

    for (let i = 0; i < this.poolSize; i++) {
      initPromises.push(this.spawnWorker(i));
    }

    await Promise.all(initPromises);
    log.i("SUBPROCESS", `Initialized ${this.poolSize} subprocesses`, {
      language: this.language,
      runtime: this.isBun ? "bun" : "node",
      killAfterBatch: this.killAfterBatch,
      memoryLimitMB: this.memoryLimitMB,
    });
  }

  /**
   * Spawn a new subprocess worker
   */
  private async spawnWorker(workerId: number): Promise<void> {
    const state: SubprocessState = {
      id: workerId,
      process: null,
      busy: false,
      tasksProcessed: 0,
      totalProcessingTime: 0,
      memoryUsage: 0,
      pendingTasks: new Map(), // Map<taskId, {resolve, reject}> for concurrent task handling
      pendingResolve: null, // Legacy, kept for compatibility
      pendingReject: null, // Legacy, kept for compatibility
      readyResolve: null,
      readyReject: null,
      pendingPingResolve: null,
      intentionalKill: false,
    };

    this.workers.set(workerId, state);

    const context: SpawnContext = {
      language: this.language,
      workerScript: this.workerScript,
      isBun: this.isBun,
      isShuttingDown: () => this.isShuttingDown,
      onMessage: (wid, msg) => this.handleResponse(wid, msg),
      onUnexpectedExit: (wid, code) => this.handleWorkerExit(wid, code),
    };

    try {
      await spawnProcess(workerId, state, context);
      await this.waitForReady(workerId);
      log.d("SUBPROCESS", `Subprocess ${workerId} ready`, { language: this.language });
    } catch (error) {
      log.e("SUBPROCESS", `Failed to spawn worker ${workerId}`, {
        error: (error as Error).message,
        language: this.language,
      });
      throw error;
    }
  }

  /**
   * Wait for subprocess to signal ready (event-driven via callbacks)
   */
  private async waitForReady(workerId: number): Promise<void> {
    const state = this.workers.get(workerId);
    if (!state || !state.process) return;

    return new Promise((resolve, reject) => {
      state.readyResolve = resolve;
      state.readyReject = reject;
    });
  }

  /**
   * Handle response from subprocess
   */
  private handleResponse(workerId: number, response: ExtendedParseResponse): void {
    const state = this.workers.get(workerId);
    if (!state) return;

    // Handle ready signal
    if (response.type === "ready") {
      // Send init message with embedding config
      if (this.embeddingConfig && state.process) {
        try {
          const proc = state.process as ChildProcess;
          // Create worker-specific config with workerIndex for endpoint assignment
          const workerConfig: WorkerEmbeddingConfig = {
            ...this.embeddingConfig,
            workerIndex: workerId, // For dedicated endpoint per worker
          };
          proc.send({
            type: "init",
            embeddingConfig: workerConfig,
          });
          log.d("SUBPROCESS", `Sent embedding config to worker ${workerId}, waiting for initialized`, {
            language: this.language,
            provider: this.embeddingConfig.provider,
            workerIndex: workerId,
          });
          // DON'T resolve yet - wait for "initialized" response
          return;
        } catch (error) {
          log.w("SUBPROCESS", `Failed to send embedding config to worker ${workerId}`, {
            error: (error as Error).message,
          });
          // Fall through to resolve without embeddings
        }
      }

      // No embedding config - resolve immediately
      if (state.readyResolve) {
        state.readyResolve();
        state.readyResolve = null;
        state.readyReject = null;
      }
      return;
    }

    // Handle initialized response (embeddings configured) - NOW we're ready
    if (isInitializedResponse(response)) {
      log.d("SUBPROCESS", `Worker ${workerId} initialized with embeddings`, {
        language: this.language,
        embeddingEnabled: response.embeddingEnabled,
      });
      // NOW resolve the ready promise - worker is fully initialized
      if (state.readyResolve) {
        state.readyResolve();
        state.readyResolve = null;
        state.readyReject = null;
      }
      return;
    }

    // Handle pong (memory response)
    if (response.type === "pong") {
      if (state.pendingPingResolve && response.memoryMB !== undefined) {
        // Update cached memory with real-time value
        state.memoryUsage = response.memoryMB * 1024 * 1024; // Convert MB to bytes
        state.pendingPingResolve(response.memoryMB);
        state.pendingPingResolve = null;
      }
      return;
    }

    // Handle embeddings.ready (binary embeddings from worker)
    if (isEmbeddingsReadyResponse(response)) {
      const count = response.count || response.embeddings?.length || 0;

      // Aggregate embedding statistics
      if (count > 0) {
        if (this.embeddingStatsAgg.startTime === 0) {
          this.embeddingStatsAgg.startTime = Date.now();
        }
        this.embeddingStatsAgg.totalVectors += count;
        this.embeddingStatsAgg.totalBatches += 1;
        this.embeddingStatsAgg.workersUsed.add(String(workerId));
      }

      if (this.onEmbeddings && response.embeddings && response.embeddings.length > 0) {
        log.i("SUBPROCESS", `Received embeddings.ready from worker`, {
          workerId,
          language: this.language,
          count,
          hasCallback: !!this.onEmbeddings,
        });
        this.onEmbeddings(response.embeddings);
      } else {
        log.w("SUBPROCESS", `embeddings.ready: NOT calling callback`, {
          workerId,
          hasCallback: !!this.onEmbeddings,
          embeddingsLength: response.embeddings?.length,
        });
      }
      return;
    }

    // Handle embeddings.texts (texts for centralized embedding generation via gRPC)
    // Used by OVMS provider for better throughput
    if (isEmbeddingTextsResponse(response)) {
      const count = response.count || response.texts?.length || 0;

      // Debug: check if texts array arrived
      log.i("SUBPROCESS", "embeddings.texts received", {
        workerId,
        count,
        hasTextsArray: Array.isArray(response.texts),
        textsLength: response.texts?.length ?? 0,
        keys: Object.keys(response),
      });

      // Aggregate embedding statistics (texts will become embeddings in Main)
      if (count > 0) {
        if (this.embeddingStatsAgg.startTime === 0) {
          this.embeddingStatsAgg.startTime = Date.now();
        }
        this.embeddingStatsAgg.totalVectors += count;
        this.embeddingStatsAgg.totalBatches += 1;
        this.embeddingStatsAgg.workersUsed.add(String(workerId));
      }

      if (response.texts && response.texts.length > 0) {
        log.i("SUBPROCESS", `Received ${count} embedding texts from worker ${workerId}`, {
          language: this.language,
          count,
          hasCallback: !!this.onEmbeddingTexts,
        });
        if (this.onEmbeddingTexts) {
          this.onEmbeddingTexts(response.texts);
        } else {
          log.w("SUBPROCESS", "No onEmbeddingTexts callback, texts lost!", { count });
        }
      }
      return;
    }

    // Handle streaming_result (individual file result via IPC)
    if (response.type === "streaming_result") {
      if (this.onStreamingResult && response.result && response.taskId !== undefined) {
        this.onStreamingResult(response.result, response.taskId, response.fileIndex ?? 0, response.totalFiles ?? 0);
      }
      return;
    }

    if (response.type === "result") {
      const taskId = response.id;

      // Look up pending task by taskId (fixes race condition with concurrent results)
      const pendingTask = taskId ? state.pendingTasks.get(taskId) : null;

      // DEBUG: Log what we received from worker with timing
      const workerTimeMs = response.stats?.totalTime ?? 0;
      const roundTripMs = pendingTask?.sendTime ? Date.now() - pendingTask.sendTime : 0;
      const ipcOverheadMs = roundTripMs - workerTimeMs;
      const fileCount = pendingTask?.fileCount ?? response.stats?.filesProcessed ?? 0;
      log.i("SUBPROCESS", "result_received", {
        workerId,
        language: this.language,
        taskId,
        files: fileCount,
        resultsLength: response.results?.length ?? 0,
        workerTimeMs, // Time worker spent parsing
        roundTripMs, // Total time from send to receive
        ipcOverheadMs, // Difference = IPC + serialization overhead
        filesPerSec: workerTimeMs > 0 ? Math.round((fileCount / workerTimeMs) * 1000) : 0,
        memoryMB: Math.round((response.stats?.memoryUsed ?? 0) / 1024 / 1024),
      });

      // Update stats
      state.tasksProcessed++;
      if (response.stats) {
        state.totalProcessingTime += response.stats.totalTime;
        state.memoryUsage = response.stats.memoryUsed;
        this.totalProcessingTime += response.stats.totalTime;
        this.totalFilesProcessed += response.stats.filesProcessed;
      }
      this.completedTasks++;

      // Resolve pending promise by taskId (no more race condition!)
      if (pendingTask && response.results) {
        pendingTask.resolve(response.results);
        if (taskId) state.pendingTasks.delete(taskId);
      } else if (!pendingTask && taskId) {
        // This shouldn't happen - log for debugging
        log.w("SUBPROCESS", "result_received_no_pending_task", {
          workerId,
          taskId,
          language: this.language,
          pendingTaskIds: Array.from(state.pendingTasks.keys()),
        });
      }

      // Worker is idle only when no pending tasks remain
      state.busy = state.pendingTasks.size > 0;

      // OPTIMIZATION: Don't kill workers during batch processing
      // This prevents 3+ second respawn delays between chunks
      if (this.isBatchProcessing) {
        // Batch in progress - keep worker alive, just process next task if any
        this.processNextTask(workerId);
        return;
      }

      // Kill process after batch if configured (for memory isolation)
      if (this.killAfterBatch) {
        // Only respawn if there are more tasks in queue
        if (this.taskQueue.length > 0) {
          this.killAndRespawn(workerId);
        } else {
          // Keepalive mode: keep worker 0 alive for fast incremental processing
          const isKeepaliveWorker = this.keepaliveMode && workerId === 0;
          const memoryMB = Math.round(state.memoryUsage / 1024 / 1024);

          if (isKeepaliveWorker) {
            // Check keepalive memory limit (default 1GB)
            if (state.memoryUsage > this.keepaliveMemoryLimitMB * 1024 * 1024) {
              log.i("SUBPROCESS", `Keepalive worker memory limit exceeded, restarting`, {
                language: this.language,
                memoryMB,
                limitMB: this.keepaliveMemoryLimitMB,
              });
              this.killAndRespawn(workerId);
            } else {
              // Keep worker 0 alive for fast incremental processing
              log.d("SUBPROCESS", `Keepalive worker ${workerId} staying alive`, {
                language: this.language,
                memoryMB,
              });
            }
          } else {
            // Just kill, don't respawn - will spawn lazily when new task arrives
            this.killWorkerOnly(workerId);
          }
        }
      } else {
        // Check memory limit
        if (state.memoryUsage > this.memoryLimitMB * 1024 * 1024) {
          log.i("SUBPROCESS", `Memory limit exceeded, restarting worker ${workerId}`, {
            memoryMB: Math.round(state.memoryUsage / 1024 / 1024),
            limitMB: this.memoryLimitMB,
          });
          this.killAndRespawn(workerId);
        } else {
          // Process next task
          this.processNextTask(workerId);
        }
      }
    } else if (response.type === "error") {
      this.failedTasks++;
      const taskId = response.id;
      const pendingTask = taskId ? state.pendingTasks.get(taskId) : null;

      if (pendingTask) {
        pendingTask.reject(new Error(response.error || "Unknown error"));
        if (taskId) state.pendingTasks.delete(taskId);
      }

      state.busy = state.pendingTasks.size > 0;
      this.processNextTask(workerId);
    }
  }

  /**
   * Kill subprocess without respawning (for memory isolation when queue is empty)
   */
  private killWorkerOnly(workerId: number): void {
    const state = this.workers.get(workerId);
    if (!state || this.isShuttingDown) return;

    log.d("SUBPROCESS", `Killing worker ${workerId} (no respawn - queue empty)`, {
      language: this.language,
      pendingTasksCount: state.pendingTasks.size,
    });

    // Warn if there are pending tasks (shouldn't happen when queue is empty)
    if (state.pendingTasks.size > 0) {
      log.w("SUBPROCESS", "killing_worker_with_pending_tasks", {
        workerId,
        language: this.language,
        pendingTaskIds: Array.from(state.pendingTasks.keys()),
      });
      // Reject pending tasks before killing
      const killError = new Error(`Worker ${workerId} killed with pending tasks`);
      for (const pendingTask of state.pendingTasks.values()) {
        pendingTask.reject(killError);
      }
      state.pendingTasks.clear();
    }

    state.intentionalKill = true;
    killProcess(state.process);
    state.process = null;
    state.busy = false;
    state.memoryUsage = 0;
  }

  /**
   * Kill subprocess and respawn
   */
  private async killAndRespawn(workerId: number): Promise<void> {
    const state = this.workers.get(workerId);
    if (!state || this.isShuttingDown) return;

    log.d("SUBPROCESS", `Killing and respawning worker ${workerId}`, { language: this.language });

    state.intentionalKill = true;
    killProcess(state.process);
    state.process = null;
    this.processRestarts++;

    try {
      await this.spawnWorker(workerId);
      this.processNextTask(workerId);
    } catch (error) {
      log.e("SUBPROCESS", `Failed to respawn worker ${workerId}`, {
        error: (error as Error).message,
      });
    }
  }

  /**
   * Handle worker exit
   */
  private handleWorkerExit(workerId: number, code: number | null): void {
    const state = this.workers.get(workerId);
    if (!state || this.isShuttingDown) return;

    // Reject pending ready callback
    if (state.readyReject) {
      state.readyReject(new Error(`Worker ${workerId} exited with code ${code} before ready`));
      state.readyResolve = null;
      state.readyReject = null;
    }

    // Reject ALL pending tasks (fixes orphaned promises on worker crash)
    const exitError = new Error(`Worker ${workerId} exited with code ${code}`);
    for (const [taskId, pendingTask] of state.pendingTasks) {
      log.w("SUBPROCESS", "rejecting_orphaned_task", {
        workerId,
        taskId,
        language: this.language,
        exitCode: code,
      });
      pendingTask.reject(exitError);
    }
    state.pendingTasks.clear();

    state.busy = false;
    state.process = null;

    // Only respawn if there's active work (batch processing or queued tasks)
    // Don't respawn idle workers after batch completes - they'll be killed anyway
    if (this.isBatchProcessing || this.taskQueue.length > 0) {
      this.spawnWorker(workerId).then(() => {
        this.processNextTask(workerId);
      });
    } else {
      // No work to do - remove worker from pool instead of respawning
      this.workers.delete(workerId);
      log.i("SUBPROCESS", `Worker ${workerId} crashed with no pending work, removed from pool`, {
        language: this.language,
        remainingWorkers: this.workers.size,
      });
    }
  }

  /**
   * Calculate optimal worker count based on file count
   * Dynamic scaling: more files → more workers (up to max)
   * When embeddings are enabled, limit workers to avoid overwhelming vLLM/embedding server
   */
  private getOptimalWorkerCount(fileCount: number): number {
    // When embeddings are enabled, TEI handles up to 16 concurrent requests (concurrency=16)
    // 10 workers × queueBatchSize=128 stays within TEI capacity; was 8 before +2 bump
    const maxWorkers = this.embeddingConfig ? 10 : 10;

    // Scaling thresholds - adjusted for embedding-limited mode
    if (fileCount < 10) return 1;
    if (fileCount < 30) return 2;
    if (fileCount < 60) return Math.min(3, maxWorkers);
    if (fileCount < 100) return Math.min(4, maxWorkers);
    if (fileCount < 150) return Math.min(6, maxWorkers);
    if (fileCount < 250) return Math.min(8, maxWorkers);
    if (fileCount < 400) return Math.min(9, maxWorkers);
    return maxWorkers;
  }

  /**
   * Ensure we have enough workers for the task
   * Spawns additional workers if needed
   */
  private async ensureWorkers(targetCount: number): Promise<void> {
    const currentCount = this.workers.size;
    if (currentCount >= targetCount) {
      log.d("SUBPROCESS", `Workers already sufficient`, {
        language: this.language,
        current: currentCount,
        target: targetCount,
      });
      return;
    }

    log.i("SUBPROCESS", `Spawning additional workers`, {
      language: this.language,
      current: currentCount,
      target: targetCount,
      spawning: targetCount - currentCount,
    });

    const spawnPromises: Promise<void>[] = [];
    for (let i = currentCount; i < targetCount; i++) {
      spawnPromises.push(this.spawnWorker(i));
    }

    await Promise.all(spawnPromises);

    // Verify all workers are ready
    const readyWorkers = Array.from(this.workers.values()).filter((w) => w.process && !w.busy).length;
    log.i("SUBPROCESS", `Workers ready after spawn`, {
      language: this.language,
      total: this.workers.size,
      ready: readyWorkers,
    });
  }

  /**
   * Scale down workers to target count after batch completes
   * Kills excess workers (keeps worker 0 if in keepalive mode)
   */
  private async scaleDownWorkers(targetCount: number): Promise<void> {
    const currentCount = this.workers.size;
    if (currentCount <= targetCount) {
      return;
    }

    log.i("SUBPROCESS", `Scaling down workers`, {
      language: this.language,
      current: currentCount,
      target: targetCount,
      killing: currentCount - targetCount,
    });

    // Kill workers from highest ID to lowest, but keep worker 0 in keepalive mode
    const workerIds = Array.from(this.workers.keys()).sort((a, b) => b - a);
    let killed = 0;

    for (const workerId of workerIds) {
      if (this.workers.size <= targetCount) break;

      // In keepalive mode, always keep worker 0 alive
      if (this.keepaliveMode && workerId === 0) continue;

      const state = this.workers.get(workerId);
      // Only kill idle workers (no pending tasks)
      if (state?.process && state.pendingTasks.size === 0) {
        killProcess(state.process as ChildProcess);
        this.workers.delete(workerId);
        killed++;
      }
    }

    log.i("SUBPROCESS", `Scale down complete`, {
      language: this.language,
      killed,
      remaining: this.workers.size,
    });
  }

  /**
   * Kill all idle workers and remove them from the pool.
   * Used after batch completes for non-keepalive pools to immediately free memory.
   * Sets intentionalKill to prevent unexpected exit handlers from respawning.
   */
  private killAllIdleWorkers(): void {
    const workerIds = Array.from(this.workers.keys());
    let killed = 0;

    for (const workerId of workerIds) {
      const state = this.workers.get(workerId);
      if (state && state.pendingTasks.size === 0) {
        state.intentionalKill = true;
        killProcess(state.process);
        this.workers.delete(workerId);
        killed++;
      }
    }

    if (killed > 0) {
      log.i("SUBPROCESS", `Killed all ${killed} idle workers after batch`, {
        language: this.language,
        remaining: this.workers.size,
      });
    }
  }

  /**
   * Estimate file parsing complexity based on filename patterns.
   * Returns a multiplier (0.0 - 1.5) to adjust file size for load balancing.
   *
   * Heuristics:
   * - .d.ts files: type declarations only → 0.3x
   * - index.ts/js: usually just exports → 0.4x
   * - test/spec/mock files: simpler structure → 0.6x
   * - generated/schema files: auto-generated → 0.5x
   * - config files: simple structure → 0.4x
   * - Regular source: 1.0x (baseline)
   */
  private estimateComplexity(filePath: string): number {
    const lowerPath = filePath.toLowerCase();
    const fileName = lowerPath.split(/[/\\]/).pop() || "";

    // Type declaration files - very simple to parse
    if (fileName.endsWith(".d.ts")) {
      return 0.3;
    }

    // Index files - usually just re-exports
    if (fileName === "index.ts" || fileName === "index.js" || fileName === "index.tsx" || fileName === "index.jsx") {
      return 0.4;
    }

    // Config files - simple structure
    if (
      fileName.includes("config") ||
      fileName.includes(".config.") ||
      fileName === "tsconfig.json" ||
      fileName === "package.json"
    ) {
      return 0.4;
    }

    // Test/spec/mock files - typically simpler
    if (
      fileName.includes(".test.") ||
      fileName.includes(".spec.") ||
      fileName.includes(".mock.") ||
      fileName.includes("__test__") ||
      fileName.includes("__mock__") ||
      lowerPath.includes("/test/") ||
      lowerPath.includes("/tests/") ||
      lowerPath.includes("/__tests__/")
    ) {
      return 0.6;
    }

    // Generated/schema files - auto-generated, repetitive
    if (
      fileName.includes(".generated.") ||
      fileName.includes(".schema.") ||
      fileName.includes(".types.") ||
      lowerPath.includes("/generated/") ||
      lowerPath.includes("/proto/")
    ) {
      return 0.5;
    }

    // Regular source files - baseline complexity
    return 1.0;
  }

  /**
   * Streaming load balancer: processes files in batches for low latency.
   *
   * Algorithm (Batched Streaming Greedy with Complexity):
   * 1. Process files in small batches (STAT_BATCH_SIZE)
   * 2. For each batch: parallel stat → estimate complexity → sort by weighted size → greedy assign
   * 3. Workers start receiving files after first batch (~30ms)
   *
   * Complexity heuristics adjust file "weight" based on filename patterns:
   * - .d.ts, index.ts, config files: lower weight (faster to parse)
   * - test/spec files: lower weight (simpler structure)
   * - Regular source: baseline weight
   *
   * Benefits:
   * - Low latency: parsing starts after first batch, not after all files
   * - Better balance: considers both size AND estimated complexity
   * - Fast stat: parallel within each batch
   */
  private async distributeFilesBySizeAsync(files: string[], workerCount: number): Promise<string[][]> {
    if (workerCount <= 1 || files.length <= workerCount) {
      return [files];
    }

    const STAT_BATCH_SIZE = 100; // stat 100 files at a time (parallel) for faster distribution
    const MAX_FILES_PER_CHUNK = 90; // Cap max files per worker to prevent bottleneck (6 workers × 90 = 540)
    const chunks: string[][] = Array.from({ length: workerCount }, () => []);
    const chunkWeights: number[] = Array(workerCount).fill(0); // weighted sizes

    const startTime = Date.now();
    let totalStatTime = 0;
    let batchCount = 0;

    // Helper: find worker with minimum weighted load (respecting MAX_FILES_PER_CHUNK)
    const findMinWorker = (): number => {
      let minIdx = 0;
      let minWeight = Infinity;
      for (let i = 0; i < workerCount; i++) {
        // Skip workers that reached max files limit
        if (chunks[i]!.length >= MAX_FILES_PER_CHUNK) continue;
        const w = chunkWeights[i] ?? 0;
        if (w < minWeight) {
          minWeight = w;
          minIdx = i;
        }
      }
      // If all workers at max, fall back to least loaded (overflow mode)
      if (minWeight === Infinity) {
        minIdx = 0;
        minWeight = chunkWeights[0] ?? 0;
        for (let i = 1; i < workerCount; i++) {
          if ((chunkWeights[i] ?? 0) < minWeight) {
            minWeight = chunkWeights[i] ?? 0;
            minIdx = i;
          }
        }
      }
      return minIdx;
    };

    // Process files in streaming batches
    for (let i = 0; i < files.length; i += STAT_BATCH_SIZE) {
      const batch = files.slice(i, i + STAT_BATCH_SIZE);
      batchCount++;

      // Parallel stat for this batch
      const statStart = Date.now();
      const weightedBatch = await Promise.all(
        batch.map(async (file) => {
          try {
            const s = await stat(file);
            const complexity = this.estimateComplexity(file);
            const weight = Math.round(s.size * complexity);
            return { file, size: s.size, complexity, weight };
          } catch {
            return { file, size: 0, complexity: 1.0, weight: 0 };
          }
        }),
      );
      totalStatTime += Date.now() - statStart;

      // Sort batch by weighted size descending (local optimization)
      weightedBatch.sort((a, b) => b.weight - a.weight);

      // Greedy assign: each file goes to worker with current minimum weighted load
      for (const { file, weight } of weightedBatch) {
        const minIdx = findMinWorker();
        chunks[minIdx]!.push(file);
        chunkWeights[minIdx] = (chunkWeights[minIdx] ?? 0) + weight;
      }
    }

    const totalTime = Date.now() - startTime;

    // Log distribution stats
    const nonEmptyChunks = chunks.filter((c) => c.length > 0);
    const totalWeight = chunkWeights.reduce((a, b) => a + b, 0);
    const avgWeight = nonEmptyChunks.length > 0 ? totalWeight / nonEmptyChunks.length : 0;
    const maxDeviation = avgWeight > 0 ? Math.max(...chunkWeights.map((w) => Math.abs(w - avgWeight))) : 0;

    log.i("SUBPROCESS", `Streaming file distribution (complexity-aware)`, {
      language: this.language,
      workers: workerCount,
      files: files.length,
      batches: batchCount,
      batchSize: STAT_BATCH_SIZE,
      chunksUsed: nonEmptyChunks.length,
      fileCounts: nonEmptyChunks.map((c) => c.length).join(","),
      chunkWeightsKB: chunkWeights.map((w) => Math.round(w / 1024)).join(","),
      balanceDeviation: avgWeight > 0 ? `${Math.round((maxDeviation / avgWeight) * 100)}%` : "0%",
      statTimeMs: totalStatTime,
      totalTimeMs: totalTime,
    });

    return nonEmptyChunks;
  }

  /**
   * Submit a parsing task
   */
  async submitTask(files: string[], options?: ParserOptions): Promise<ParseResult[]> {
    if (files.length === 0) return [];

    const taskStart = Date.now();
    const perf: Record<string, number> = {};

    // Mark batch processing started - prevents workers from being killed mid-batch
    this.isBatchProcessing = true;

    // Dynamic worker scaling based on file count
    // Keepalive mode with few files = incremental indexing -> 1 worker
    // Many files (full indexing) = dynamic scaling regardless of mode
    const workersBefore = this.workers.size;
    let workersAfter = workersBefore;

    const INCREMENTAL_THRESHOLD = 20; // Below this = incremental mode (1 worker)
    const isIncrementalMode = this.keepaliveMode && files.length < INCREMENTAL_THRESHOLD;

    perf["ensureWorkers_start"] = Date.now() - taskStart;
    if (isIncrementalMode) {
      // Incremental mode: use fixed poolSize (1 worker), no scaling
      await this.ensureWorkers(this.poolSize);
      workersAfter = this.workers.size;
      log.d("SUBPROCESS", `Incremental mode: fixed pool`, {
        language: this.language,
        poolSize: this.poolSize,
        files: files.length,
      });
    } else {
      // Full indexing mode: dynamic scaling based on file count
      const optimalWorkers = this.getOptimalWorkerCount(files.length);
      await this.ensureWorkers(optimalWorkers);
      workersAfter = this.workers.size;
    }
    perf["ensureWorkers_end"] = Date.now() - taskStart;

    log.i("SUBPROCESS", `submitTask scaling`, {
      language: this.language,
      files: files.length,
      mode: isIncrementalMode ? "incremental" : "full",
      targetWorkers: isIncrementalMode ? this.poolSize : this.getOptimalWorkerCount(files.length),
      workersBefore,
      workersAfter,
    });

    // Distribute files using size-based round-robin for balanced load
    // This replaces the old sequential slice approach
    // Now async with parallel stat() for better performance
    perf["distribute_start"] = Date.now() - taskStart;
    const chunks = await this.distributeFilesBySizeAsync(files, this.workers.size);
    perf["distribute_end"] = Date.now() - taskStart;

    // Apply maxFilesPerChunk limit - split large chunks if needed
    const limitedChunks: string[][] = [];
    for (const chunk of chunks) {
      if (chunk.length <= this.maxFilesPerChunk) {
        limitedChunks.push(chunk);
      } else {
        // Split oversized chunk
        for (let i = 0; i < chunk.length; i += this.maxFilesPerChunk) {
          limitedChunks.push(chunk.slice(i, i + this.maxFilesPerChunk));
        }
      }
    }

    log.i("SUBPROCESS", `Chunking files (size-balanced)`, {
      language: this.language,
      files: files.length,
      chunks: limitedChunks.length,
      maxFilesPerChunk: this.maxFilesPerChunk,
    });

    // Submit all chunks IN PARALLEL to different workers
    perf["workers_start"] = Date.now() - taskStart;
    const chunkTimings: number[] = [];
    const promises = limitedChunks.map((chunk, idx) => {
      const chunkStart = Date.now();
      log.d("SUBPROCESS", `Submitting chunk ${idx}`, { language: this.language, files: chunk.length });
      return this.submitSingleTask(chunk, options).then((result) => {
        chunkTimings.push(Date.now() - chunkStart);
        return result;
      });
    });

    try {
      const results = await Promise.all(promises);
      perf["workers_end"] = Date.now() - taskStart;
      perf["total"] = Date.now() - taskStart;

      // Log detailed timing breakdown
      const sortedChunkTimings = [...chunkTimings].sort((a, b) => b - a);
      log.i("SUBPROCESS", "POOL_PERF", {
        language: this.language,
        files: files.length,
        workers: this.workers.size,
        chunks: limitedChunks.length,
        ensureWorkersMs: perf["ensureWorkers_end"]! - perf["ensureWorkers_start"]!,
        distributeMs: perf["distribute_end"]! - perf["distribute_start"]!,
        workersMs: perf["workers_end"]! - perf["workers_start"]!,
        totalMs: perf["total"],
        maxChunkMs: sortedChunkTimings[0] ?? 0,
        minChunkMs: sortedChunkTimings[sortedChunkTimings.length - 1] ?? 0,
        avgChunkMs:
          chunkTimings.length > 0 ? Math.round(chunkTimings.reduce((a, b) => a + b, 0) / chunkTimings.length) : 0,
      });

      return results.flat();
    } finally {
      // Mark batch processing complete - workers can now be killed if needed
      this.isBatchProcessing = false;

      // Log memory after batch completion
      logMemory("SUBPROCESS", {
        language: this.language,
        workers: this.workers.size,
        taskQueue: this.taskQueue.length,
        workersUsed: this.embeddingStatsAgg.workersUsed.size,
      });

      // Cleanup workers after batch completion
      if (this.keepaliveMode && this.workers.size > 1) {
        // Keepalive mode: scale down to 1 worker for incremental updates
        await this.scaleDownWorkers(1);
      } else if (!this.keepaliveMode) {
        // Non-keepalive pool (per-language): kill ALL idle workers immediately
        // These workers have no more work and waste memory sitting idle
        this.killAllIdleWorkers();
      }
    }
  }

  /**
   * Submit single task to a worker
   */
  private submitSingleTask(files: string[], options?: ParserOptions): Promise<ParseResult[]> {
    const taskId = `${this.language}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    return new Promise((resolve, reject) => {
      const task = { id: taskId, files, options, resolve, reject };

      // Debug: log worker states
      const workerStates = Array.from(this.workers.entries()).map(([id, s]) => `${id}:${s.busy ? "busy" : "idle"}`);
      log.d("SUBPROCESS", `submitSingleTask`, {
        language: this.language,
        workers: workerStates.join(","),
      });

      // Find idle worker (with active process)
      for (const [workerId, state] of this.workers) {
        if (!state.busy && state.process) {
          log.d("SUBPROCESS", `Assigning to worker ${workerId}`, { language: this.language });
          this.assignTask(workerId, task);
          return;
        }
      }

      // Try lazy spawn: find worker slot without process and spawn it
      for (const [workerId, state] of this.workers) {
        if (!state.busy && !state.process) {
          log.d("SUBPROCESS", `Lazy spawning worker ${workerId}`, { language: this.language });
          this.spawnWorker(workerId)
            .then(() => this.assignTask(workerId, task))
            .catch((err) => {
              log.e("SUBPROCESS", `Lazy spawn failed for worker ${workerId}`, {
                error: (err as Error).message,
              });
              task.reject(err as Error);
            });
          return;
        }
      }

      // Queue task if no worker slot available
      log.w("SUBPROCESS", `No idle worker, queuing task`, {
        language: this.language,
        queueSize: this.taskQueue.length + 1,
      });
      this.taskQueue.push(task);
    });
  }

  /**
   * Assign task to worker
   */
  private assignTask(
    workerId: number,
    task: {
      id: string;
      files: string[];
      options?: ParserOptions | undefined;
      resolve: (results: ParseResult[]) => void;
      reject: (error: Error) => void;
    },
  ): void {
    const state = this.workers.get(workerId);
    if (!state || !state.process) return;

    state.busy = true;
    // Store task in pendingTasks Map by taskId (fixes race condition)
    // Include sendTime for IPC overhead measurement
    state.pendingTasks.set(task.id, {
      resolve: task.resolve,
      reject: task.reject,
      sendTime: Date.now(),
      fileCount: task.files.length,
    });

    const request: ParseRequest = {
      type: "parse",
      id: task.id,
      files: task.files,
      language: this.language,
      options: task.options,
      streamingMode: this.streamingMode,
    };

    // Send via V8 native IPC
    const proc = state.process as ChildProcess;
    proc.send(request);

    log.t("SUBPROCESS", `[${this.language}] Worker ${workerId} processing files`, {
      taskId: task.id,
      fileCount: task.files.length,
      pendingTasksCount: state.pendingTasks.size,
    });
  }

  /**
   * Process next task from queue
   */
  private processNextTask(workerId: number): void {
    if (this.taskQueue.length === 0) return;

    const state = this.workers.get(workerId);
    if (!state || state.busy || !state.process) return;

    const task = this.taskQueue.shift();
    if (task) {
      this.assignTask(workerId, task);
    }
  }

  /**
   * Get pool statistics
   */
  getStats(): SubprocessPoolStats {
    let activeWorkers = 0;
    for (const w of this.workers.values()) if (w.busy) activeWorkers++;

    return {
      language: this.language,
      totalWorkers: this.workers.size,
      activeWorkers,
      idleWorkers: this.workers.size - activeWorkers,
      queuedTasks: this.taskQueue.length,
      completedTasks: this.completedTasks,
      failedTasks: this.failedTasks,
      avgProcessingTime: this.completedTasks > 0 ? this.totalProcessingTime / this.completedTasks : 0,
      filesProcessed: this.totalFilesProcessed,
      processRestarts: this.processRestarts,
    };
  }

  /**
   * Get embedding generation statistics
   * Aggregated from all vectors.written messages
   */
  getEmbeddingStats(): EmbeddingPoolStats {
    const dur = this.embeddingStatsAgg.startTime > 0 ? Date.now() - this.embeddingStatsAgg.startTime : 0;
    const speed = dur > 0 ? Math.round((this.embeddingStatsAgg.totalVectors / dur) * 1000) : 0;

    return {
      total: this.embeddingStatsAgg.totalVectors,
      durationMs: dur,
      speedPerSec: speed,
      workers: this.embeddingStatsAgg.workersUsed.size,
      batches: this.embeddingStatsAgg.totalBatches,
    };
  }

  /**
   * Reset embedding statistics (call before new indexing session)
   * Clears workersUsed Set to prevent memory leak from accumulating worker IDs
   */
  resetEmbeddingStats(): void {
    // Clear existing Set before creating new one (explicit cleanup)
    this.embeddingStatsAgg.workersUsed.clear();

    this.embeddingStatsAgg = {
      startTime: 0,
      totalVectors: 0,
      totalBatches: 0,
      workersUsed: new Set<string>(),
    };

    log.d("SUBPROCESS", "embedding_stats_reset", { language: this.language });
  }

  /**
   * Shutdown pool
   */
  async shutdown(): Promise<void> {
    this.isShuttingDown = true;

    for (const state of this.workers.values()) {
      killProcess(state.process);
    }

    this.workers.clear();
    log.i("SUBPROCESS", "Pool shutdown complete", { language: this.language });
  }

  /**
   * Check if pool is ready
   */
  isReady(): boolean {
    return this.workers.size === this.poolSize;
  }

  getLanguage(): string {
    return this.language;
  }

  /**
   * Send ping to worker and wait for pong with memory info
   * Timeout after 2 seconds if worker doesn't respond
   */
  private pingWorkerMemory(workerId: number): Promise<number> {
    const state = this.workers.get(workerId);
    if (!state || !state.process) {
      return Promise.resolve(0);
    }

    return new Promise((resolve) => {
      // Set up timeout - resolve with cached value if no response
      const timeout = setTimeout(() => {
        state.pendingPingResolve = null;
        resolve(Math.round((state.memoryUsage || 0) / 1024 / 1024));
      }, 2000);

      state.pendingPingResolve = (memoryMB: number) => {
        clearTimeout(timeout);
        resolve(memoryMB);
      };

      // Send ping via V8 IPC
      const proc = state.process as ChildProcess;
      try {
        proc.send({ type: "ping", id: `ping-${workerId}-${Date.now()}` });
      } catch {
        clearTimeout(timeout);
        state.pendingPingResolve = null;
        resolve(Math.round((state.memoryUsage || 0) / 1024 / 1024));
      }
    });
  }

  /**
   * Refresh memory usage for all workers via ping/pong
   * Returns total memory in MB
   */
  async refreshAllWorkersMemory(): Promise<number> {
    const pingPromises: Promise<number>[] = [];
    for (const workerId of this.workers.keys()) {
      pingPromises.push(this.pingWorkerMemory(workerId));
    }
    const memories = await Promise.all(pingPromises);
    return memories.reduce((sum, mb) => sum + mb, 0);
  }

  /**
   * Get total memory usage of all workers in MB (cached values)
   * For real-time memory, use refreshAllWorkersMemory() first.
   */
  getTotalMemoryMB(): number {
    let totalBytes = 0;
    for (const state of this.workers.values()) {
      totalBytes += state.memoryUsage || 0;
    }
    return Math.round(totalBytes / 1024 / 1024);
  }

  /**
   * Enable or disable keepalive mode.
   * When enabled, worker 0 stays alive after tasks complete for fast incremental processing.
   * Call this after bulk indexing to switch to incremental mode.
   */
  setKeepaliveMode(enabled: boolean): void {
    const wasEnabled = this.keepaliveMode;
    this.keepaliveMode = enabled;

    if (enabled && !wasEnabled) {
      log.i("SUBPROCESS", `Keepalive mode enabled`, {
        language: this.language,
        memoryLimitMB: this.keepaliveMemoryLimitMB,
      });
    } else if (!enabled && wasEnabled) {
      log.i("SUBPROCESS", `Keepalive mode disabled`, {
        language: this.language,
      });
    }
  }

  /**
   * Check if keepalive mode is enabled
   */
  isKeepaliveMode(): boolean {
    return this.keepaliveMode;
  }

  /**
   * Get count of active (spawned) workers
   */
  getActiveWorkerCount(): number {
    let count = 0;
    for (const state of this.workers.values()) {
      if (state.process !== null) {
        count++;
      }
    }
    return count;
  }

  /**
   * Ensure keepalive worker (worker 0) is running.
   * Call this after enabling keepalive mode to spawn the worker if needed.
   * Also kills all non-keepalive workers to free memory.
   */
  async ensureKeepaliveWorker(): Promise<void> {
    if (!this.keepaliveMode) {
      log.w("SUBPROCESS", "ensureKeepaliveWorker called but keepalive mode not enabled", {
        language: this.language,
      });
      return;
    }

    // Kill all workers except worker 0 (keepalive)
    const killedWorkers: number[] = [];
    for (const [workerId, state] of this.workers) {
      if (workerId !== 0 && state.process !== null) {
        state.intentionalKill = true;
        killProcess(state.process);
        state.process = null;
        state.busy = false;
        state.memoryUsage = 0;
        killedWorkers.push(workerId);
      }
    }

    if (killedWorkers.length > 0) {
      log.i("SUBPROCESS", "Killed non-keepalive workers", {
        language: this.language,
        killedWorkers: killedWorkers.join(","),
      });
    }

    const state = this.workers.get(0);
    if (state && state.process !== null) {
      // Worker 0 already running with active process
      log.d("SUBPROCESS", "Keepalive worker already running", {
        language: this.language,
        pid: state.process?.pid,
      });
      return;
    }

    log.i("SUBPROCESS", "Spawning KEEPALIVE worker (for incremental updates, not batch)", {
      language: this.language,
    });

    await this.spawnWorker(0);

    log.i("SUBPROCESS", "KEEPALIVE worker ready (idle, waiting for incremental tasks)", {
      language: this.language,
      pid: this.workers.get(0)?.process?.pid,
    });
  }

  /**
   * Kill all workers if total memory exceeds threshold.
   * Uses real-time ping/pong to get accurate memory from workers.
   * Returns true if workers were killed.
   *
   * Use case: After indexing, call killIfMemoryHigh(1024) to release memory
   * if workers accumulated more than 1GB.
   */
  async killIfMemoryHigh(thresholdMB: number): Promise<boolean> {
    // Get real-time memory via ping/pong
    const totalMB = await this.refreshAllWorkersMemory();

    if (totalMB > thresholdMB) {
      log.i("SUBPROCESS", `Memory ${totalMB}MB > ${thresholdMB}MB threshold, killing pool`, {
        language: this.language,
        totalMemoryMB: totalMB,
        workerCount: this.workers.size,
      });
      await this.shutdown();
      return true;
    } else {
      log.d("SUBPROCESS", `Memory ${totalMB}MB <= ${thresholdMB}MB, keeping pool alive`, {
        language: this.language,
      });
      return false;
    }
  }

  /**
   * Configure embedding generation for all existing workers.
   * Call this when embedding config becomes available after pool initialization.
   * Workers will start generating embeddings after receiving the config.
   */
  async configureEmbeddings(config?: WorkerEmbeddingConfig): Promise<void> {
    // Save config for new workers that may be spawned later
    this.embeddingConfig = config;

    if (!config) {
      log.i("SUBPROCESS", `Clearing embedding config for ${this.workers.size} workers`, {
        language: this.language,
      });
      return;
    }

    log.i("SUBPROCESS", `Configuring embeddings for ${this.workers.size} workers`, {
      language: this.language,
      provider: config.provider,
      enabled: config.enabled,
    });

    for (const [workerId, state] of this.workers) {
      if (state.process) {
        try {
          const proc = state.process as ChildProcess;
          // Create worker-specific config with workerIndex for endpoint assignment
          const workerConfig: WorkerEmbeddingConfig = {
            ...config,
            workerIndex: workerId, // For dedicated endpoint per worker
          };
          proc.send({
            type: "configure-embeddings",
            config: workerConfig,
          });
        } catch (error) {
          log.w("SUBPROCESS", `Failed to configure embeddings for worker ${workerId}`, {
            error: (error as Error).message,
          });
        }
      }
    }
  }

  /**
   * Check if embedding generation is enabled for this pool
   */
  hasEmbeddingConfig(): boolean {
    return !!this.embeddingConfig?.enabled;
  }
}
