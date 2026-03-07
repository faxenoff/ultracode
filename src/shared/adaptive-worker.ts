/**
 * Adaptive Worker System
 *
 * Provides optimal worker implementation based on runtime:
 * - Node.js: worker_threads (native, stable)
 * - Bun: Web Worker API with smol mode (reduced memory)
 *
 * Features:
 * - Runtime detection
 * - Concurrency limiting
 * - Automatic fallback on errors
 * - Memory-efficient smol mode for Bun
 */

import { EventEmitter } from "node:events";
import { cpus } from "node:os";
import { log } from "../logging/index.js";
import { sleep } from "../utils/runtime-detection.js";
import { detectRuntime, type Runtime } from "./runtime-detect.js";

// =============================================================================
// Types
// =============================================================================

export interface WorkerMessage {
  type: string;
  taskId?: string;
  payload?: unknown;
  error?: string;
  stack?: string;
}

export interface WorkerTask {
  id: string;
  type: string;
  payload: unknown;
}

export interface AdaptiveWorkerOptions {
  /** Maximum concurrent workers (default: CPU cores - 1) */
  maxWorkers?: number;
  /** Worker script path */
  scriptPath: string;
  /** Task timeout in ms (default: 60000) */
  timeout?: number | undefined;
  /** Enable smol mode for Bun (reduced memory, default: true) */
  smolMode?: boolean;
  /** Retry failed tasks (default: 1) */
  retries?: number;
}

// Node.js Worker type
type NodeWorker = import("node:worker_threads").Worker;

// Bun Worker interface (Web Worker API methods)
interface BunWorker {
  addEventListener(type: string, listener: (event: MessageEvent | ErrorEvent) => void): void;
  removeEventListener(type: string, listener: (event: MessageEvent | ErrorEvent) => void): void;
  postMessage(message: unknown): void;
  terminate(): void;
}

type AnyWorker = BunWorker | NodeWorker;

interface PooledWorker {
  worker: AnyWorker;
  busy: boolean;
  taskId: string | null;
  createdAt: number;
}

// =============================================================================
// Adaptive Worker Pool
// =============================================================================

export class AdaptiveWorkerPool extends EventEmitter {
  private readonly runtime: Runtime;
  private readonly options: Required<AdaptiveWorkerOptions>;
  private readonly workers: PooledWorker[] = [];
  private readonly taskQueue: Array<{
    task: WorkerTask;
    resolve: (result: unknown) => void;
    reject: (error: Error) => void;
    retries: number;
  }> = [];
  private isShuttingDown = false;
  private nodeWorkerModule: typeof import("node:worker_threads") | null = null;

  constructor(options: AdaptiveWorkerOptions) {
    super();
    this.runtime = detectRuntime();
    this.options = {
      maxWorkers: options.maxWorkers ?? Math.max(2, cpus().length - 1),
      scriptPath: options.scriptPath,
      timeout: options.timeout ?? 60000,
      smolMode: options.smolMode ?? true,
      retries: options.retries ?? 1,
    };

    log.i(
      "ADAPTWORK",
      `[AdaptiveWorkerPool] Initialized: runtime=${this.runtime}, maxWorkers=${this.options.maxWorkers}, smolMode=${this.options.smolMode}`,
    );
  }

  /**
   * Execute a task using a worker from the pool
   */
  async execute<T = unknown>(task: WorkerTask): Promise<T> {
    if (this.isShuttingDown) {
      throw new Error("Worker pool is shutting down");
    }

    return new Promise((resolve, reject) => {
      this.taskQueue.push({
        task,
        resolve: resolve as (result: unknown) => void,
        reject,
        retries: 0,
      });
      this.processQueue();
    });
  }

  /**
   * Execute multiple tasks in parallel
   */
  async executeAll<T = unknown>(tasks: WorkerTask[]): Promise<T[]> {
    return Promise.all(tasks.map((task) => this.execute<T>(task)));
  }

  /**
   * Shutdown the worker pool
   */
  async shutdown(): Promise<void> {
    this.isShuttingDown = true;
    log.i("ADAPTWORK", `[AdaptiveWorkerPool] Shutting down ${this.workers.length} workers...`);

    const terminatePromises = this.workers.map(async (pw) => {
      try {
        if (this.runtime === "bun") {
          (pw.worker as BunWorker).terminate();
        } else {
          await (pw.worker as NodeWorker).terminate();
        }
      } catch {
        // Ignore termination errors
      }
    });

    await Promise.all(terminatePromises);
    this.workers.length = 0;
    this.taskQueue.length = 0;

    log.i("ADAPTWORK", "[AdaptiveWorkerPool] Shutdown complete");
  }

  /**
   * Get pool statistics
   */
  getStats() {
    const busy = this.workers.filter((w) => w.busy).length;
    return {
      runtime: this.runtime,
      totalWorkers: this.workers.length,
      busyWorkers: busy,
      idleWorkers: this.workers.length - busy,
      queuedTasks: this.taskQueue.length,
      maxWorkers: this.options.maxWorkers,
    };
  }

  // ===========================================================================
  // Private Methods
  // ===========================================================================

  private async processQueue(): Promise<void> {
    if (this.taskQueue.length === 0) return;

    // Find or create an idle worker
    let pooledWorker = this.workers.find((w) => !w.busy);

    if (!pooledWorker && this.workers.length < this.options.maxWorkers) {
      try {
        pooledWorker = await this.createWorker();
        this.workers.push(pooledWorker);
      } catch (error) {
        log.e("ADAPTWORK", "worker_create_fail", { err: String(error) });
        // Fallback: process in main thread
        const queuedTask = this.taskQueue.shift();
        if (queuedTask) {
          queuedTask.reject(new Error(`Worker creation failed: ${(error as Error).message}`));
        }
        return;
      }
    }

    if (!pooledWorker) {
      // All workers busy, wait for one to become available
      return;
    }

    const queuedTask = this.taskQueue.shift();
    if (!queuedTask) return;

    pooledWorker.busy = true;
    pooledWorker.taskId = queuedTask.task.id;

    // Set timeout using AbortController pattern (Bun compatible)
    const abortController = new AbortController();

    (async () => {
      await sleep(this.options.timeout ?? 30000);
      if (!abortController.signal.aborted && pooledWorker!.taskId === queuedTask.task.id) {
        log.w("ADAPTWORK", `[AdaptiveWorkerPool] Task ${queuedTask.task.id} timed out`);
        this.handleWorkerError(pooledWorker!, new Error("Task timeout"));
        queuedTask.reject(new Error("Task timeout"));
      }
    })();

    // Send task to worker
    try {
      const message: WorkerMessage = {
        type: "task",
        taskId: queuedTask.task.id,
        payload: queuedTask.task,
      };

      if (this.runtime === "bun") {
        (pooledWorker.worker as BunWorker).postMessage(message);
      } else {
        (pooledWorker.worker as NodeWorker).postMessage(message);
      }

      // Wait for result (handled by message listener)
      const result = await new Promise<unknown>((resolve, reject) => {
        const handler = (msg: WorkerMessage) => {
          if (msg.taskId === queuedTask.task.id) {
            abortController.abort();
            pooledWorker!.busy = false;
            pooledWorker!.taskId = null;

            if (msg.type === "result") {
              resolve(msg.payload);
            } else if (msg.type === "error") {
              reject(new Error(msg.error || "Unknown worker error"));
            }

            // Remove this specific handler
            if (this.runtime === "bun") {
              (pooledWorker!.worker as BunWorker).removeEventListener("message", wrappedHandler);
            } else {
              (pooledWorker!.worker as NodeWorker).off("message", handler);
            }

            // Process next task
            this.processQueue();
          }
        };

        // Wrapped handler for Bun (extracts data from MessageEvent)
        const wrappedHandler = (e: MessageEvent | ErrorEvent) => {
          const msgEvent = e as { data?: WorkerMessage };
          if (msgEvent.data) handler(msgEvent.data);
        };

        if (this.runtime === "bun") {
          (pooledWorker!.worker as BunWorker).addEventListener("message", wrappedHandler);
        } else {
          (pooledWorker!.worker as NodeWorker).on("message", handler);
        }
      });

      queuedTask.resolve(result);
    } catch (error) {
      abortController.abort();
      pooledWorker.busy = false;
      pooledWorker.taskId = null;

      // Retry logic
      if (queuedTask.retries < this.options.retries) {
        log.w(
          "ADAPTWORK",
          `[AdaptiveWorkerPool] Task ${queuedTask.task.id} failed, retrying (${queuedTask.retries + 1}/${this.options.retries})`,
        );
        queuedTask.retries++;
        this.taskQueue.unshift(queuedTask);
        this.processQueue();
      } else {
        queuedTask.reject(error as Error);
      }
    }
  }

  private async createWorker(): Promise<PooledWorker> {
    let worker: AnyWorker;

    if (this.runtime === "bun") {
      // Bun: Use Web Worker API with smol mode
      worker = new (Worker as unknown as new (path: string, options?: { type?: string; smol?: boolean }) => BunWorker)(
        this.options.scriptPath,
        {
          type: "module",
          smol: this.options.smolMode, // Bun-specific option
        },
      );

      log.i("ADAPTWORK", `[AdaptiveWorkerPool] Created Bun worker (smol=${this.options.smolMode})`);
    } else {
      // Node.js: Use worker_threads
      if (!this.nodeWorkerModule) {
        this.nodeWorkerModule = await import("node:worker_threads");
      }
      worker = new this.nodeWorkerModule.Worker(this.options.scriptPath);

      log.i("ADAPTWORK", "[AdaptiveWorkerPool] Created Node.js worker");
    }

    // Setup error handler
    const errorHandler = (error: MessageEvent | ErrorEvent) => {
      const errEvent = error as { message?: string };
      const err = new Error(errEvent.message || "Unknown worker error");
      log.e("ADAPTWORK", "worker_error", { err: err.message });
      this.emit("worker-error", err);
    };

    if (this.runtime === "bun") {
      (worker as BunWorker).addEventListener("error", errorHandler);
    } else {
      (worker as NodeWorker).on("error", errorHandler);
    }

    return {
      worker,
      busy: false,
      taskId: null,
      createdAt: Date.now(),
    };
  }

  private handleWorkerError(pooledWorker: PooledWorker, error: Error): void {
    log.e("ADAPTWORK", "task_error", { taskId: pooledWorker.taskId, err: error.message });

    // Remove failed worker from pool
    const index = this.workers.indexOf(pooledWorker);
    if (index !== -1) {
      this.workers.splice(index, 1);
      try {
        if (this.runtime === "bun") {
          (pooledWorker.worker as BunWorker).terminate();
        } else {
          (pooledWorker.worker as NodeWorker).terminate();
        }
      } catch {
        // Ignore
      }
    }

    this.emit("worker-error", error);
  }
}

// =============================================================================
// Factory Function
// =============================================================================

let defaultPool: AdaptiveWorkerPool | null = null;

/**
 * Get or create the default worker pool
 */
export function getWorkerPool(options?: Partial<AdaptiveWorkerOptions>): AdaptiveWorkerPool {
  if (!defaultPool && options?.scriptPath) {
    defaultPool = new AdaptiveWorkerPool(options as AdaptiveWorkerOptions);
  }
  if (!defaultPool) {
    throw new Error("Worker pool not initialized. Provide scriptPath option.");
  }
  return defaultPool;
}

/**
 * Shutdown the default worker pool
 */
export async function shutdownWorkerPool(): Promise<void> {
  if (defaultPool) {
    await defaultPool.shutdown();
    defaultPool = null;
  }
}
