/**
 * Worker Pool Manager
 *
 * Manages a pool of worker threads for parallel processing.
 * Handles task distribution, load balancing, and result aggregation.
 */

import { cpus } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Worker } from "node:worker_threads";
import { log } from "../../logging/index.js";
import type { ParseResult, ParserOptions } from "../../types/parser.js";
import { sleep } from "../../utils/runtime-detection.js";

// =============================================================================
// TYPES
// =============================================================================

interface WorkerMessage {
  type: "ready" | "initialized" | "result" | "error";
  taskId?: string;
  payload?: {
    taskId: string;
    results: ParseResult[];
    stats: { totalTime: number };
  };
  error?: string;
}

interface WorkerState {
  id: number;
  worker: Worker;
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
  abortController?: AbortController | undefined;
}

interface PoolStats {
  totalWorkers: number;
  activeWorkers: number;
  idleWorkers: number;
  queuedTasks: number;
  completedTasks: number;
  failedTasks: number;
  avgProcessingTime: number;
}

// =============================================================================
// WORKER POOL MANAGER
// =============================================================================

export class WorkerPoolManager {
  private workers: Map<number, WorkerState> = new Map();
  private pendingTasks: Map<string, PendingTask> = new Map();
  private taskQueue: PendingTask[] = [];
  private completedTasks = 0;
  private failedTasks = 0;
  private totalProcessingTime = 0;

  private readonly workerScript: string;
  private readonly poolSize: number;
  private readonly taskTimeout: number;

  constructor(
    options: {
      poolSize?: number;
      taskTimeout?: number;
    } = {},
  ) {
    this.poolSize = options.poolSize || Math.min(cpus().length, 4);
    this.taskTimeout = options.taskTimeout || 30000; // 30 seconds

    // Resolve worker script path
    // After bundling, this manager is in dist/ (bundled into index.js)
    // Worker script is compiled separately to dist/agents/workers/parser-worker.js
    const currentDir = dirname(fileURLToPath(import.meta.url));
    this.workerScript = join(currentDir, "agents", "workers", "parser-worker.js");
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
    log.i("WORKERPOOL", "init_done", { cnt: this.poolSize });
  }

  /**
   * Create a new worker
   */
  private async createWorker(workerId: number): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const worker = new Worker(this.workerScript, {
          workerData: { workerId },
        });

        const state: WorkerState = {
          id: workerId,
          worker,
          busy: false,
          tasksProcessed: 0,
          totalProcessingTime: 0,
          lastTaskTime: 0,
        };

        // Handle worker messages
        worker.on("message", (message) => {
          this.handleWorkerMessage(workerId, message);
        });

        // Handle worker errors
        worker.on("error", (error: Error) => {
          log.e("WORKERPOOL", "worker_err", { id: workerId, err: String(error) });
          this.handleWorkerError(workerId, error);
        });

        // Handle worker exit
        worker.on("exit", (code) => {
          if (code !== 0) {
            log.w("WORKERPOOL", "worker_exit", { id: workerId, code });
          }
          this.workers.delete(workerId);
        });

        // Wait for ready signal with timeout
        const abortController = new AbortController();

        const readyHandler = (message: WorkerMessage) => {
          if (message.type === "ready") {
            abortController.abort();
            this.workers.set(workerId, state);
            worker.off("message", readyHandler);
            resolve();
          }
        };
        worker.on("message", readyHandler);

        // Async timeout using sleep pattern (Bun compatible)
        (async () => {
          await sleep(5000);
          if (!abortController.signal.aborted && !this.workers.has(workerId)) {
            worker.off("message", readyHandler);
            worker.terminate();
            reject(new Error(`Worker ${workerId} initialization timeout`));
          }
        })();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Submit a parsing task to the pool
   */
  async submitTask(files: string[], options?: ParserOptions): Promise<ParseResult[]> {
    const taskId = `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    return new Promise((resolve, reject) => {
      const abortController = new AbortController();

      const task: PendingTask = {
        id: taskId,
        files,
        options,
        resolve,
        reject,
        abortController,
      };

      // Set task timeout using async sleep pattern (Bun compatible)
      (async () => {
        await sleep(this.taskTimeout);
        if (!abortController.signal.aborted) {
          this.handleTaskTimeout(taskId);
        }
      })();

      this.pendingTasks.set(taskId, task);

      // Try to assign to idle worker, otherwise queue
      const assigned = this.tryAssignTask(task);
      if (!assigned) {
        this.taskQueue.push(task);
      }
    });
  }

  /**
   * Try to assign task to an idle worker
   */
  private tryAssignTask(task: PendingTask): boolean {
    for (const [workerId, state] of this.workers) {
      if (!state.busy) {
        this.assignTaskToWorker(workerId, task);
        return true;
      }
    }
    return false;
  }

  /**
   * Assign task to specific worker
   */
  private assignTaskToWorker(workerId: number, task: PendingTask): void {
    const state = this.workers.get(workerId);
    if (!state) return;

    state.busy = true;
    state.lastTaskTime = Date.now();

    state.worker.postMessage({
      type: "task",
      payload: {
        id: task.id,
        files: task.files,
        options: task.options,
      },
    });
  }

  /**
   * Handle message from worker
   */
  private handleWorkerMessage(workerId: number, message: WorkerMessage): void {
    const state = this.workers.get(workerId);
    if (!state) return;

    switch (message.type) {
      case "result": {
        const result = message.payload;
        if (!result) break;

        const task = this.pendingTasks.get(result.taskId);

        if (task) {
          // Abort timeout
          if (task.abortController) {
            task.abortController.abort();
          }

          // Update stats
          state.busy = false;
          state.tasksProcessed++;
          state.totalProcessingTime += result.stats.totalTime;
          this.completedTasks++;
          this.totalProcessingTime += result.stats.totalTime;

          // Resolve task
          task.resolve(result.results);
          this.pendingTasks.delete(result.taskId);

          // Assign next task from queue
          if (this.taskQueue.length > 0) {
            const nextTask = this.taskQueue.shift();
            if (nextTask) {
              this.assignTaskToWorker(workerId, nextTask);
            }
          }
        }
        break;
      }

      case "error": {
        if (!message.taskId) break;

        const task = this.pendingTasks.get(message.taskId);
        if (task) {
          if (task.abortController) {
            task.abortController.abort();
          }

          this.failedTasks++;
          task.reject(new Error(message.error));
          this.pendingTasks.delete(message.taskId);
        }

        state.busy = false;

        // Assign next task
        if (this.taskQueue.length > 0) {
          const nextTask = this.taskQueue.shift();
          if (nextTask) {
            this.assignTaskToWorker(workerId, nextTask);
          }
        }
        break;
      }

      case "initialized":
        log.d("WORKERPOOL", "worker_ready", { id: workerId });
        break;

      case "ready":
        // Already handled in createWorker
        break;

      default:
        log.w("WORKERPOOL", "unknown_msg", { type: message.type });
    }
  }

  /**
   * Handle worker error
   */
  private handleWorkerError(workerId: number, error: Error): void {
    const state = this.workers.get(workerId);
    if (!state) return;

    log.e("WORKERPOOL", "handle_err", { id: workerId, err: error.message });

    // Mark worker as not busy
    state.busy = false;
  }

  /**
   * Handle task timeout
   */
  private handleTaskTimeout(taskId: string): void {
    const task = this.pendingTasks.get(taskId);
    if (task) {
      this.failedTasks++;
      task.reject(new Error(`Task ${taskId} timeout after ${this.taskTimeout}ms`));
      this.pendingTasks.delete(taskId);
    }
  }

  /**
   * Get pool statistics
   */
  getStats(): PoolStats {
    let activeWorkers = 0;
    let idleWorkers = 0;

    for (const state of this.workers.values()) {
      if (state.busy) {
        activeWorkers++;
      } else {
        idleWorkers++;
      }
    }

    return {
      totalWorkers: this.workers.size,
      activeWorkers,
      idleWorkers,
      queuedTasks: this.taskQueue.length,
      completedTasks: this.completedTasks,
      failedTasks: this.failedTasks,
      avgProcessingTime: this.completedTasks > 0 ? this.totalProcessingTime / this.completedTasks : 0,
    };
  }

  /**
   * Shutdown the worker pool
   */
  async shutdown(): Promise<void> {
    log.i("WORKERPOOL", "shutdown_start", { cnt: this.workers.size });

    // Reject all pending tasks
    for (const task of this.pendingTasks.values()) {
      if (task.abortController) {
        task.abortController.abort();
      }
      task.reject(new Error("Worker pool shutting down"));
    }
    this.pendingTasks.clear();
    this.taskQueue = [];

    // Terminate all workers
    const terminationPromises: Promise<void>[] = [];

    for (const state of this.workers.values()) {
      state.worker.postMessage({ type: "shutdown" });
      terminationPromises.push(
        state.worker.terminate().then(() => {
          log.d("WORKERPOOL", "worker_term", { id: state.id });
        }),
      );
    }

    await Promise.all(terminationPromises);
    this.workers.clear();

    log.i("WORKERPOOL", "shutdown_done");
  }
}
