/**
 * Incremental Update Queue - Batching & Debouncing for File Changes
 *
 * Batches file change events within a configurable window to minimize index updates.
 * Prevents redundant indexing when multiple files change rapidly.
 *
 * Key features:
 * - Debouncing: Batches changes within 300ms window
 * - Deduplication: Single update per file path
 * - Fallback: Full rebuild if >100 files changed
 * - Branch-aware: Applies updates to correct delta layer
 *
 * Based on: ultrasharp-tools-mcp IncrementalUpdateQueue.cs
 * @see Dev.Docs/LAYERED_INDEXING_IMPLEMENTATION_PLAN.md
 */

import { EventEmitter } from "node:events";
import type { ILayeredIndex } from "../core/layered-index.js";
import { log } from "../logging/index.js";
import { sleep } from "../utils/runtime-detection.js";

// =============================================================================
// TYPES
// =============================================================================

export type FileChangeType = "added" | "modified" | "deleted" | "renamed";

export interface FileChangeEvent {
  /** File path relative to repository root */
  filePath: string;

  /** Type of change */
  changeType: FileChangeType;

  /** Old path (for renamed files) */
  oldPath?: string | undefined;

  /** Timestamp of change */
  timestamp: number;

  /** Branch name (if known) */
  branch?: string | undefined;

  /** Client ID for Layer 2 [FUTURE] */
  clientId?: string;
}

export interface IncrementalUpdateConfig {
  /** Debounce window in milliseconds (default: 300ms) */
  debounceWindowMs: number;

  /** Max batch size before fallback to full rebuild (default: 100) */
  maxBatchSize: number;

  /** Enable incremental updates (default: true) */
  enabled: boolean;

  /** Enable debug logging (default: false) */
  debug: boolean;
}

export interface BatchProcessingResult {
  /** Number of files processed */
  filesProcessed: number;

  /** Processing time in milliseconds */
  processingTimeMs: number;

  /** Whether full rebuild was triggered */
  fullRebuild: boolean;

  /** Errors encountered */
  errors: Array<{ file: string; error: string }>;
}

export interface QueueStats {
  totalBatches: number;
  totalFilesProcessed: number;
  totalErrors: number;
  lastBatchTime: number;
}

// =============================================================================
// INCREMENTAL UPDATE QUEUE CLASS
// =============================================================================

export class IncrementalUpdateQueue extends EventEmitter {
  private layeredIndex: ILayeredIndex;
  private config: IncrementalUpdateConfig;

  // Queue state
  private pendingChanges: Map<string, FileChangeEvent> = new Map();
  private debounceAbortController: AbortController | null = null;
  private isProcessing = false;
  private processingPromise: Promise<void> | null = null;

  // Statistics
  private stats: QueueStats = {
    totalBatches: 0,
    totalFilesProcessed: 0,
    totalErrors: 0,
    lastBatchTime: 0,
  };

  constructor(layeredIndex: ILayeredIndex, config?: Partial<IncrementalUpdateConfig>) {
    super();

    this.layeredIndex = layeredIndex;

    // Merge config with defaults
    this.config = {
      debounceWindowMs: config?.debounceWindowMs ?? 300,
      maxBatchSize: config?.maxBatchSize ?? 100,
      enabled: config?.enabled ?? true,
      debug: config?.debug ?? false,
    };

    if (this.config.debug) {
      log.i(
        "INCQUEUE",
        `[IncrementalUpdateQueue] Initialized with ` +
          `debounce=${this.config.debounceWindowMs}ms, ` +
          `maxBatch=${this.config.maxBatchSize}`,
      );
    }
  }

  // =========================================================================
  // ENQUEUE OPERATIONS
  // =========================================================================

  /**
   * Enqueue a file change event
   *
   * @param event - File change event
   */
  enqueue(event: FileChangeEvent): void {
    if (!this.config.enabled) {
      return;
    }

    // Deduplicate by file path (keep latest change)
    this.pendingChanges.set(event.filePath, event);

    if (this.config.debug) {
      log.i("INCQUEUE", `[IncrementalUpdateQueue] Enqueued: ${event.changeType} ${event.filePath}`);
    }

    // Reset debounce timer
    this.resetDebounceTimer();

    // Emit event
    this.emit("enqueued", event);
  }

  /**
   * Enqueue multiple file changes
   *
   * @param events - Array of file change events
   */
  enqueueBatch(events: FileChangeEvent[]): void {
    if (!this.config.enabled) {
      return;
    }

    for (const event of events) {
      this.pendingChanges.set(event.filePath, event);
    }

    if (this.config.debug) {
      log.i("INCQUEUE", `[IncrementalUpdateQueue] Enqueued batch: ${events.length} files`);
    }

    this.resetDebounceTimer();
    this.emit("batch-enqueued", events);
  }

  // =========================================================================
  // DEBOUNCE TIMER MANAGEMENT
  // =========================================================================

  /**
   * Reset debounce timer
   */
  private resetDebounceTimer(): void {
    // Abort existing timer
    if (this.debounceAbortController) {
      this.debounceAbortController.abort();
    }

    // Create new abort controller and set timer using async sleep (Bun compatible)
    const abortController = new AbortController();
    this.debounceAbortController = abortController;

    (async () => {
      await sleep(this.config.debounceWindowMs);
      if (!abortController.signal.aborted) {
        this.processBatch().catch((error) => {
          log.e("INCQUEUE", "batch_process_fail", { err: String(error) });
          this.emit("error", error);
        });
      }
    })();
  }

  // =========================================================================
  // BATCH PROCESSING
  // =========================================================================

  /**
   * Process pending batch of changes
   */
  private async processBatch(): Promise<void> {
    // Prevent concurrent processing
    if (this.isProcessing) {
      if (this.config.debug) {
        log.i("INCQUEUE", `[IncrementalUpdateQueue] Already processing, skipping`);
      }
      return;
    }

    const batchSize = this.pendingChanges.size;

    if (batchSize === 0) {
      return;
    }

    this.isProcessing = true;
    const startTime = Date.now();

    if (this.config.debug) {
      log.i("INCQUEUE", `[IncrementalUpdateQueue] Processing batch: ${batchSize} files`);
    }

    // Extract changes (clone to allow new changes during processing)
    const changesToProcess = Array.from(this.pendingChanges.values());
    this.pendingChanges.clear();

    const result: BatchProcessingResult = {
      filesProcessed: 0,
      processingTimeMs: 0,
      fullRebuild: false,
      errors: [],
    };

    try {
      // Check if batch size exceeds threshold
      if (batchSize > this.config.maxBatchSize) {
        log.w(
          "INCQUEUE",
          `[IncrementalUpdateQueue] Batch size ${batchSize} exceeds max ${this.config.maxBatchSize}, ` +
            `triggering full rebuild`,
        );

        result.fullRebuild = true;
        this.emit("full-rebuild-triggered", { reason: "batch-size-exceeded", batchSize });
      }

      // Process each file change
      for (const change of changesToProcess) {
        try {
          await this.processFileChange(change);
          result.filesProcessed++;
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          result.errors.push({
            file: change.filePath,
            error: errorMsg,
          });

          log.e("INCQUEUE", "file_process_fail", { err: String(error), file: change.filePath });
        }
      }

      // Update statistics
      this.stats.totalBatches++;
      this.stats.totalFilesProcessed += result.filesProcessed;
      this.stats.totalErrors += result.errors.length;
      this.stats.lastBatchTime = Date.now();

      result.processingTimeMs = Date.now() - startTime;

      if (this.config.debug) {
        log.i(
          "INCQUEUE",
          `[IncrementalUpdateQueue] Batch processed: ` +
            `${result.filesProcessed}/${batchSize} files in ${result.processingTimeMs}ms, ` +
            `${result.errors.length} errors`,
        );
      }

      this.emit("batch-processed", result);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Process a single file change
   *
   * @param change - File change event
   */
  private async processFileChange(change: FileChangeEvent): Promise<void> {
    const { filePath, changeType, branch, clientId } = change;

    switch (changeType) {
      case "added":
      case "modified":
        // Update entities from file
        await this.layeredIndex.updateEntitiesFromFile(filePath, branch || null, clientId || null);
        break;

      case "deleted":
        // Remove entities from file
        await this.layeredIndex.removeEntitiesFromFile(filePath, branch || null, clientId || null);
        break;

      case "renamed":
        // Delete old, add new
        if (change.oldPath) {
          await this.layeredIndex.removeEntitiesFromFile(change.oldPath, branch || null, clientId || null);
        }
        await this.layeredIndex.updateEntitiesFromFile(filePath, branch || null, clientId || null);
        break;
    }
  }

  // =========================================================================
  // MANUAL CONTROL
  // =========================================================================

  /**
   * Flush pending changes immediately (bypass debounce)
   */
  async flush(): Promise<void> {
    if (this.debounceAbortController) {
      this.debounceAbortController.abort();
      this.debounceAbortController = null;
    }

    if (this.isProcessing && this.processingPromise) {
      // Wait for current processing to finish
      await this.processingPromise;
    }

    await this.processBatch();
  }

  /**
   * Clear all pending changes without processing
   */
  clear(): void {
    if (this.debounceAbortController) {
      this.debounceAbortController.abort();
      this.debounceAbortController = null;
    }

    const count = this.pendingChanges.size;
    this.pendingChanges.clear();

    if (this.config.debug) {
      log.i("INCQUEUE", `[IncrementalUpdateQueue] Cleared ${count} pending changes`);
    }

    this.emit("cleared", { count });
  }

  // =========================================================================
  // STATUS & STATISTICS
  // =========================================================================

  /**
   * Get current queue status
   */
  getStatus(): {
    pendingChanges: number;
    isProcessing: boolean;
    stats: QueueStats;
  } {
    return {
      pendingChanges: this.pendingChanges.size,
      isProcessing: this.isProcessing,
      stats: { ...this.stats },
    };
  }

  /**
   * Get pending file paths
   */
  getPendingFiles(): string[] {
    return Array.from(this.pendingChanges.keys());
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.stats = {
      totalBatches: 0,
      totalFilesProcessed: 0,
      totalErrors: 0,
      lastBatchTime: 0,
    };

    this.emit("stats-reset");
  }

  // =========================================================================
  // LIFECYCLE
  // =========================================================================

  /**
   * Shutdown queue gracefully
   */
  async shutdown(): Promise<void> {
    log.i("INCQUEUE", "[IncrementalUpdateQueue] Shutting down...");

    // Flush pending changes
    await this.flush();

    // Abort timer
    if (this.debounceAbortController) {
      this.debounceAbortController.abort();
      this.debounceAbortController = null;
    }

    // Remove all listeners
    this.removeAllListeners();

    log.i("INCQUEUE", "[IncrementalUpdateQueue] Shutdown complete");
  }
}
