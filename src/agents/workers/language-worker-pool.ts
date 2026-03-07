/**
 * Generic Language Worker Pool Manager
 *
 * Universal pool that can be instantiated for any language.
 * Manages worker threads specialized for specific programming languages.
 *
 * Usage:
 *   const pythonPool = new LanguageWorkerPool("python", { poolSize: 4 });
 *   const rustPool = new LanguageWorkerPool("rust", { poolSize: 4 });
 */

import { cpus } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { log } from "../../logging/index.js";
import { detectRuntime, type Runtime } from "../../shared/runtime-detect.js";
import type { ParseResult, ParserOptions } from "../../types/parser.js";

// Runtime-aware worker type
type NodeWorker = import("node:worker_threads").Worker;

// Bun Worker extends the standard Worker with these methods
interface BunWorker {
  addEventListener(type: string, listener: (event: MessageEvent | ErrorEvent) => void): void;
  removeEventListener(type: string, listener: (event: MessageEvent | ErrorEvent) => void): void;
  postMessage(message: unknown): void;
  terminate(): void;
}

type AnyWorker = BunWorker | NodeWorker;

// =============================================================================
// TYPES
// =============================================================================

/**
 * Bun global interface for runtime detection
 */
interface BunGlobal {
  Bun?: {
    sleep?: (ms: number) => Promise<void>;
  };
}

/**
 * Worker ready message
 */
interface WorkerReadyMessage {
  type: "ready";
  workerId?: string;
}

/**
 * Worker result message
 */
interface WorkerResultMessage {
  type: "result";
  id: string;
  results: ParseResult[];
}

/**
 * Worker error message
 */
interface WorkerErrorMessage {
  type: "error";
  taskId?: string;
  id?: string;
  error: string;
}

/**
 * Worker embeddings ready message
 */
interface WorkerEmbeddingsReadyMessage {
  type: "embeddings.ready";
  embeddings?: unknown[];
  count?: number;
}

/**
 * Task result payload
 */
interface TaskResultPayload {
  id: string;
  taskId?: string; // Backward compatibility
  results: ParseResult[];
  stats?: {
    totalTime: number;
    filesProcessed: number;
  };
}

/**
 * Union type for worker messages
 */
type WorkerMessage = WorkerReadyMessage | WorkerResultMessage | WorkerErrorMessage | WorkerEmbeddingsReadyMessage;

interface WorkerState {
  id: number;
  worker: AnyWorker;
  busy: boolean;
  tasksProcessed: number;
  totalProcessingTime: number;
  lastTaskTime: number;
}

interface PendingTask {
  id: string;
  files: string[];
  options?: ParserOptions | undefined;
  resolve: (results: ParseResult[]) => void;
  reject: (error: Error) => void;
  timeoutAbort?: boolean | undefined;
}

export interface LanguagePoolStats {
  language: string;
  totalWorkers: number;
  activeWorkers: number;
  idleWorkers: number;
  queuedTasks: number;
  completedTasks: number;
  failedTasks: number;
  avgProcessingTime: number;
  filesProcessed: number;
}

/**
 * Binary embedding received from worker via transferList
 */
export interface BinaryEmbedding {
  id: string;
  vectorBuffer: ArrayBuffer;
  content: string;
  metadata?: Record<string, unknown>;
}

/**
 * Callback for receiving embeddings from workers
 * Called when worker sends "embeddings.ready" message
 */
export type EmbeddingsCallback = (embeddings: BinaryEmbedding[]) => void;

export interface LanguagePoolOptions {
  poolSize?: number | undefined;
  taskTimeout?: number | undefined;
  workerScript?: string | undefined; // Optional custom worker script path
  onEmbeddings?: EmbeddingsCallback | undefined; // Callback for binary embeddings
}

// =============================================================================
// LANGUAGE WORKER POOL MANAGER
// =============================================================================

export class LanguageWorkerPool {
  private language: string;
  private workers: Map<number, WorkerState> = new Map();
  private pendingTasks: Map<string, PendingTask> = new Map();
  private taskQueue: PendingTask[] = [];
  private completedTasks = 0;
  private failedTasks = 0;
  private totalProcessingTime = 0;
  private totalFilesProcessed = 0;

  private readonly workerScript: string;
  private readonly poolSize: number;
  private readonly taskTimeout: number;
  private readonly onEmbeddings?: EmbeddingsCallback | undefined;

  // Runtime-aware worker creation
  private readonly runtime: Runtime;
  private nodeWorkerModule: typeof import("node:worker_threads") | null = null;

  constructor(language: string, options: LanguagePoolOptions = {}) {
    this.language = language;
    this.runtime = detectRuntime();

    // Pool size configuration based on language performance characteristics
    const defaultPoolSizes: Record<string, number> = {
      python: Math.min(cpus().length, 4), // Slow: 266ms/file → max parallelism
      rust: Math.min(cpus().length, 4), // Medium: 30-40ms/file → good parallelism
      csharp: Math.min(cpus().length, 4), // Medium: 25-30ms/file → good parallelism
      cpp: Math.min(cpus().length, 3), // Fast: 20-25ms/file → moderate parallelism
      java: Math.min(cpus().length, 3), // Medium: 25-30ms/file → moderate parallelism
      go: Math.min(cpus().length, 2), // Fast: 15-20ms/file → light parallelism
      c: Math.min(cpus().length, 2), // Fast: 10-15ms/file → light parallelism
      typescript: Math.min(cpus().length, 3), // Medium: 15-20ms/file → moderate
      javascript: Math.min(cpus().length, 3), // Medium: 15-20ms/file → moderate
      vba: Math.min(cpus().length, 2), // Fast: 10-15ms/file → light parallelism
    };

    this.poolSize = options.poolSize || defaultPoolSizes[language] || Math.min(cpus().length, 2);

    // Timeout configuration based on language complexity
    const defaultTimeouts: Record<string, number> = {
      python: 45000, // 45s for 4-layer analysis
      rust: 35000, // 35s for trait/macro analysis
      csharp: 30000, // 30s for LINQ/async
      cpp: 30000, // 30s for templates
      java: 30000, // 30s for generics
      go: 25000, // 25s for goroutines
      c: 20000, // 20s for basic parsing
      typescript: 30000, // 30s for complex types
      javascript: 25000, // 25s for ES6+
      vba: 20000, // 20s for regex-based
    };

    this.taskTimeout = options.taskTimeout || defaultTimeouts[language] || 30000;
    this.onEmbeddings = options.onEmbeddings;

    // Resolve worker script path
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
    const workerPath = join(distRoot, "agents", "workers", "generic-language-worker.js");

    this.workerScript = options.workerScript || workerPath;
  }

  /**
   * Initialize the worker pool
   */
  async initialize(): Promise<void> {
    const initPromises: Promise<void>[] = [];

    for (let i = 0; i < this.poolSize; i++) {
      initPromises.push(this.createWorker(i));
    }

    await Promise.all(initPromises);
    log.i("WORKERPOOL", `Initialized ${this.poolSize} workers`, {
      language: this.language,
      runtime: this.runtime,
      smol: this.runtime === "bun",
    });
  }

  /**
   * Runtime-aware sleep - uses Bun.sleep for Bun, setTimeout for Node.js
   */
  private async sleep(ms: number): Promise<void> {
    const bunGlobal = globalThis as BunGlobal;
    if (bunGlobal.Bun?.sleep && typeof bunGlobal.Bun.sleep === "function") {
      await bunGlobal.Bun.sleep(ms);
    } else {
      await new Promise((resolve) => setTimeout(resolve, ms));
    }
  }

  /**
   * Create a new worker (runtime-aware)
   * - Node.js: worker_threads (native, stable)
   * - Bun: Web Worker API with smol mode (reduced memory)
   */
  private async createWorker(workerId: number): Promise<void> {
    let worker: AnyWorker;

    if (this.runtime === "bun") {
      // Bun: Use Web Worker API with smol mode for reduced memory
      // Bun Worker constructor accepts non-standard options
      interface BunWorkerOptions extends WorkerOptions {
        smol?: boolean;
      }
      type BunWorkerConstructor = new (scriptURL: string | URL, options?: BunWorkerOptions) => BunWorker;

      worker = new (Worker as unknown as BunWorkerConstructor)(this.workerScript, {
        type: "module",
        smol: true, // Bun-specific option for reduced memory footprint
      });
      log.d("WORKERPOOL", `Created Bun worker ${workerId}`, { language: this.language, smol: true });
    } else {
      // Node.js: Use worker_threads (native, stable)
      if (!this.nodeWorkerModule) {
        this.nodeWorkerModule = await import("node:worker_threads");
      }
      worker = new this.nodeWorkerModule.Worker(this.workerScript, {
        workerData: {
          workerId: `${this.language}-${workerId}`,
          language: this.language,
        },
      });
      log.d("WORKERPOOL", `Created Node.js worker ${workerId}`, { language: this.language });
    }

    const state: WorkerState = {
      id: workerId,
      worker,
      busy: false,
      tasksProcessed: 0,
      totalProcessingTime: 0,
      lastTaskTime: 0,
    };

    // Runtime-aware event handlers
    const setupEventHandlers = () => {
      if (this.runtime === "bun") {
        const bunWorker = worker as BunWorker;
        bunWorker.addEventListener("message", (event) => {
          const msgEvent = event as { data: unknown };
          this.handleWorkerMessage(workerId, msgEvent.data as WorkerMessage);
        });
        bunWorker.addEventListener("error", (event) => {
          const errorEvent = event as { message?: string };
          log.e("WORKERPOOL", `Worker ${workerId} error: ${errorEvent.message}`, { language: this.language });
          this.handleWorkerError(workerId, new Error(errorEvent.message || "Unknown worker error"));
        });
      } else {
        const nodeWorker = worker as NodeWorker;
        nodeWorker.on("message", (message) => {
          this.handleWorkerMessage(workerId, message);
        });
        nodeWorker.on("error", (error: Error) => {
          log.e("WORKERPOOL", `Worker ${workerId} error: ${error.message}`, { language: this.language });
          this.handleWorkerError(workerId, error);
        });
        nodeWorker.on("exit", (code) => {
          if (code !== 0) {
            log.e("WORKERPOOL", `Worker ${workerId} exited with code ${code}`, { language: this.language });
          }
          this.workers.delete(workerId);
        });
      }
    };

    setupEventHandlers();

    // Wait for ready signal (runtime-aware, no setTimeout for Bun compatibility)
    await new Promise<void>((resolveReady, rejectReady) => {
      let resolved = false;

      // Timeout check via polling with runtime-aware sleep
      const startTime = Date.now();
      const checkTimeout = async () => {
        while (!resolved && Date.now() - startTime < 10000) {
          await this.sleep(10); // Real sleep without busy-wait
        }
        if (!resolved) {
          if (!this.workers.has(workerId)) {
            if (this.runtime === "bun") {
              (worker as BunWorker).terminate();
            } else {
              (worker as NodeWorker).terminate();
            }
            rejectReady(new Error(`Worker ${workerId} initialization timeout`));
          }
        }
      };
      checkTimeout();

      if (this.runtime === "bun") {
        const bunWorker = worker as BunWorker;
        const readyHandler = (event: MessageEvent | ErrorEvent) => {
          if ("data" in event) {
            const message = event.data as WorkerMessage;
            if (message.type === "ready") {
              resolved = true;
              this.workers.set(workerId, state);
              bunWorker.removeEventListener("message", readyHandler);
              resolveReady();
            }
          }
        };
        bunWorker.addEventListener("message", readyHandler);
      } else {
        const nodeWorker = worker as NodeWorker;
        const readyHandler = (message: WorkerMessage) => {
          if (message.type === "ready") {
            resolved = true;
            this.workers.set(workerId, state);
            nodeWorker.off("message", readyHandler);
            resolveReady();
          }
        };
        nodeWorker.on("message", readyHandler);
      }
    });
  }

  /**
   * Submit a parsing task to the pool with automatic chunking
   *
   * Distributes files across ALL available workers for maximum parallelism.
   * Chunks are created based on pool size and distributed evenly.
   */
  async submitTask(files: string[], options?: ParserOptions): Promise<ParseResult[]> {
    if (files.length === 0) {
      return [];
    }

    // Get pool stats for chunking
    const stats = this.getStats();
    const workerCount = stats.totalWorkers;

    // If too few files for parallel processing (< 2 per worker), use single worker
    const minFilesPerWorker = 2;
    if (files.length < minFilesPerWorker) {
      return this.submitSingleTask(files, options);
    }

    // Calculate optimal chunk size
    const idealWorkerCount = Math.min(workerCount, Math.floor(files.length / minFilesPerWorker) || 1);
    const chunkSize = Math.ceil(files.length / idealWorkerCount);

    // Split into chunks
    const chunks: string[][] = [];
    for (let i = 0; i < files.length; i += chunkSize) {
      chunks.push(files.slice(i, i + chunkSize));
    }

    log.i("WORKERPOOL", `Chunking ${files.length} files into ${chunks.length} tasks`, {
      language: this.language,
    });

    // Submit all chunks in parallel
    const chunkPromises = chunks.map((chunk) => this.submitSingleTask(chunk, options));

    // Wait for all workers to complete
    const results = await Promise.all(chunkPromises);

    // Flatten results
    return results.flat();
  }

  /**
   * Submit a single task without chunking (internal use)
   */
  private async submitSingleTask(files: string[], options?: ParserOptions): Promise<ParseResult[]> {
    const taskId = `${this.language}-task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    return new Promise((resolve, reject) => {
      const task: PendingTask = {
        id: taskId,
        files,
        options,
        resolve,
        reject,
        timeoutAbort: false,
      };

      this.pendingTasks.set(taskId, task);

      // Task timeout via polling with runtime-aware sleep
      const startTime = Date.now();
      const checkTaskTimeout = async () => {
        while (!task.timeoutAbort && Date.now() - startTime < this.taskTimeout) {
          await this.sleep(50); // Real sleep without busy-wait
          if (!this.pendingTasks.has(taskId)) return; // Task completed
        }
        if (this.pendingTasks.has(taskId) && !task.timeoutAbort) {
          this.handleTaskTimeout(taskId);
        }
      };
      checkTaskTimeout();

      // Try to assign to idle worker, otherwise queue
      const assigned = this.tryAssignTask(task);
      if (!assigned) {
        this.taskQueue.push(task);
      }
    });
  }

  /**
   * Try to assign task to an idle worker (load balancing)
   */
  private tryAssignTask(task: PendingTask): boolean {
    // Find least loaded worker
    let minLoad = Number.MAX_SAFE_INTEGER;
    let targetWorkerId: number | null = null;

    for (const [workerId, state] of this.workers) {
      if (!state.busy && state.tasksProcessed < minLoad) {
        minLoad = state.tasksProcessed;
        targetWorkerId = workerId;
      }
    }

    if (targetWorkerId !== null) {
      this.assignTaskToWorker(targetWorkerId, task);
      return true;
    }

    return false;
  }

  /**
   * Assign task to specific worker (runtime-aware)
   */
  private assignTaskToWorker(workerId: number, task: PendingTask): void {
    const state = this.workers.get(workerId);
    if (!state) return;

    state.busy = true;
    // CRITICAL: Log files being processed BEFORE sending to worker
    // This helps identify which file causes worker crashes/timeouts
    log.t("WORKERPOOL", `[${this.language}] Worker ${workerId} processing files`, {
      taskId: task.id,
      fileCount: task.files.length,
      files: task.files.map((f) => f.split(/[/]/).pop()).slice(0, 10),
      workerLoad: state.tasksProcessed,
    });
    state.lastTaskTime = Date.now();

    const message = {
      type: "task",
      payload: {
        id: task.id,
        files: task.files,
        language: this.language,
        options: task.options,
      },
    };

    // Runtime-aware message posting
    if (this.runtime === "bun") {
      (state.worker as BunWorker).postMessage(message);
    } else {
      (state.worker as NodeWorker).postMessage(message);
    }
  }

  /**
   * Handle worker message
   */
  private handleWorkerMessage(workerId: number, message: WorkerMessage): void {
    const state = this.workers.get(workerId);
    if (!state) return;

    if (message.type === "result") {
      this.handleTaskComplete(workerId, { id: message.id, results: message.results });
    } else if (message.type === "error") {
      const taskId = message.taskId || message.id;
      if (taskId) {
        this.handleTaskError(taskId, new Error(message.error));
      }
    } else if (message.type === "embeddings.ready") {
      // Binary embeddings received from worker via transferList
      if (message.embeddings) {
        this.handleEmbeddingsReady(message.embeddings as unknown as BinaryEmbedding[], message.count ?? 0);
      }
    }
  }

  /**
   * Handle embeddings received from worker
   * Calls onEmbeddings callback to route to FAISS accumulator
   */
  private handleEmbeddingsReady(embeddings: BinaryEmbedding[], count: number): void {
    if (!this.onEmbeddings || !embeddings || embeddings.length === 0) {
      return;
    }

    log.d("WORKERPOOL", `Received ${count} embeddings from worker`, {
      language: this.language,
      count,
    });

    // Route embeddings to callback (FAISS accumulator)
    this.onEmbeddings(embeddings);
  }

  /**
   * Handle task completion
   */
  private handleTaskComplete(workerId: number, result: TaskResultPayload): void {
    const state = this.workers.get(workerId);
    if (!state) return;

    const task = this.pendingTasks.get(result.id);
    if (!task) return;

    // Cancel timeout check
    task.timeoutAbort = true;

    // Update worker state
    state.busy = false;
    state.tasksProcessed++;

    // Update pool stats
    this.completedTasks++;
    if (result.stats) {
      this.totalProcessingTime += result.stats.totalTime;
      this.totalFilesProcessed += result.stats.filesProcessed;
    }

    // Resolve task
    task.resolve(result.results);
    this.pendingTasks.delete(result.taskId || result.id);

    // Process next task from queue
    this.processNextTask(workerId);
  }

  /**
   * Handle task error
   */
  private handleTaskError(taskId: string, error: Error): void {
    const task = this.pendingTasks.get(taskId);
    if (!task) return;

    // Cancel timeout check
    task.timeoutAbort = true;

    this.failedTasks++;
    task.reject(error);
    this.pendingTasks.delete(taskId);
  }

  /**
   * Handle worker error
   */
  private handleWorkerError(workerId: number, error: Error): void {
    const state = this.workers.get(workerId);
    if (!state) return;
    // CRITICAL: Log worker crash and flush logs
    log.e("WORKERPOOL", `Worker ${workerId} crashed`, {
      workerId,
      error: error.message,
      stack: error.stack,
      language: this.language,
    });
    log.flush();

    // Mark worker as idle
    state.busy = false;

    // Find any pending task assigned to this worker and requeue
    for (const task of this.taskQueue) {
      // Try to assign to another worker
      this.tryAssignTask(task);
    }
  }

  /**
   * Handle task timeout
   */
  private handleTaskTimeout(taskId: string): void {
    const task = this.pendingTasks.get(taskId);
    log.e("WORKERPOOL", `Task timeout`, {
      taskId,
      fileCount: task?.files.length,
      files: task?.files.map((f) => f.split(/[/]/).pop()),
      timeout: this.taskTimeout,
    });
    log.flush();
    this.handleTaskError(taskId, new Error(`Task timeout (${this.taskTimeout}ms) for language: ${this.language}`));
  }

  /**
   * Process next task from queue
   */
  private processNextTask(workerId: number): void {
    if (this.taskQueue.length === 0) return;

    const task = this.taskQueue.shift();
    if (task) {
      this.assignTaskToWorker(workerId, task);
    }
  }

  /**
   * Get pool statistics
   */
  getStats(): LanguagePoolStats {
    let activeWorkers = 0;
    for (const w of this.workers.values()) if (w.busy) activeWorkers++;
    const idleWorkers = this.workers.size - activeWorkers;

    return {
      language: this.language,
      totalWorkers: this.workers.size,
      activeWorkers,
      idleWorkers,
      queuedTasks: this.taskQueue.length,
      completedTasks: this.completedTasks,
      failedTasks: this.failedTasks,
      avgProcessingTime: this.completedTasks > 0 ? this.totalProcessingTime / this.completedTasks : 0,
      filesProcessed: this.totalFilesProcessed,
    };
  }

  /**
   * Get language
   */
  getLanguage(): string {
    return this.language;
  }

  /**
   * Shutdown the pool (runtime-aware)
   */
  async shutdown(): Promise<void> {
    const shutdownPromises: Promise<void>[] = [];

    for (const [_workerId, state] of this.workers) {
      shutdownPromises.push(
        new Promise((resolve) => {
          let resolved = false;

          // Timeout via polling with runtime-aware sleep
          const startTime = Date.now();
          const checkShutdownTimeout = async () => {
            while (!resolved && Date.now() - startTime < 5000) {
              await this.sleep(50); // Real sleep without busy-wait
            }
            if (!resolved) {
              if (this.runtime === "bun") {
                (state.worker as BunWorker).terminate();
              } else {
                (state.worker as NodeWorker).terminate();
              }
              resolve();
            }
          };
          checkShutdownTimeout();

          if (this.runtime === "bun") {
            const bunWorker = state.worker as BunWorker;
            bunWorker.postMessage({ type: "shutdown" });
            // Bun workers don't have "exit" event, just terminate after delay
            const terminateStart = Date.now();
            const delayedTerminate = async () => {
              while (Date.now() - terminateStart < 1000) {
                await this.sleep(50); // Real sleep without busy-wait
              }
              resolved = true;
              bunWorker.terminate();
              resolve();
            };
            delayedTerminate();
          } else {
            const nodeWorker = state.worker as NodeWorker;
            nodeWorker.postMessage({ type: "shutdown" });
            nodeWorker.once("exit", () => {
              resolved = true;
              resolve();
            });
          }
        }),
      );
    }

    await Promise.all(shutdownPromises);
    this.workers.clear();
    log.i("WORKERPOOL", `Shutdown complete`, { language: this.language, runtime: this.runtime });
  }

  /**
   * Check if pool is ready
   */
  isReady(): boolean {
    return this.workers.size === this.poolSize;
  }
}
