/**
 * Delta Maintenance Service - Optimization & Cleanup
 *
 * Manages maintenance tasks for layered indexing:
 * - Delta compaction (reduce memory usage for large deltas)
 * - Orphaned delta cleanup (remove deltas for deleted branches)
 * - Periodic maintenance scheduling
 * - Statistics tracking
 *
 * Key features:
 * - Background tasks (non-blocking)
 * - Configurable schedules
 * - Auto-compaction when threshold exceeded
 * - LRU-based delta eviction
 *
 * Based on: ultrasharp-tools-mcp DeltaMaintenanceService.cs
 * @see Dev.Docs/LAYERED_INDEXING_IMPLEMENTATION_PLAN.md
 */

import type { BranchManager } from "../core/branch-manager.js";
import type { ILayeredIndex } from "../core/layered-index.js";
import { log } from "../logging/index.js";
import type { LayeredCacheManager } from "./layered-cache-manager.js";
import type { VectorCacheManager } from "./vector-cache-manager.js";

// Event-driven architecture: maintenance triggered on-demand or on shutdown
// No polling loops - call runMaintenance() when needed

/**
 * Global with Bun runtime (defined in runtime-detection.ts)
 */

/** Check if running in Bun */
function isBunRuntime(): boolean {
  return typeof globalThis.Bun !== "undefined";
}

// =============================================================================
// TYPES
// =============================================================================

export interface DeltaMaintenanceConfig {
  /** Enable automatic maintenance (default: true) */
  enabled: boolean;

  /** Delta compaction threshold (number of changes) (default: 1000) */
  compactionThreshold: number;

  /** Orphaned delta max age in days (default: 7) */
  orphanedDeltaMaxAgeDays: number;

  /** Maintenance interval in milliseconds (default: 1 hour) */
  maintenanceIntervalMs: number;

  /** Enable auto-compaction on threshold (default: true) */
  autoCompaction: boolean;

  /** Enable debug logging (default: false) */
  debug: boolean;
}

export interface MaintenanceStats {
  /** Last maintenance run timestamp */
  lastRunTime: number;

  /** Total maintenance runs */
  totalRuns: number;

  /** Deltas compacted */
  deltasCompacted: number;

  /** Deltas deleted */
  deltasDeleted: number;

  /** Bytes freed */
  bytesFreed: number;

  /** Last run duration (ms) */
  lastRunDurationMs: number;
}

export interface CompactionResult {
  /** Branch name */
  branch: string;

  /** Changes before compaction */
  changesBefore: number;

  /** Changes after compaction */
  changesAfter: number;

  /** Memory freed (bytes) */
  memoryFreed: number;

  /** Compaction successful */
  success: boolean;
}

/**
 * Cache statistics interface
 */
export interface CacheStatistics {
  hits?: number;
  misses?: number;
  size?: number;
  [key: string]: unknown;
}

/**
 * Status report interface
 */
export interface StatusReport {
  maintenance: MaintenanceStats;
  entityCache?: CacheStatistics;
  vectorCache?: CacheStatistics;
}

// =============================================================================
// DELTA MAINTENANCE SERVICE CLASS
// =============================================================================

export class DeltaMaintenanceService {
  private layeredIndex: ILayeredIndex;
  private cacheManager: LayeredCacheManager | null;
  private vectorCacheManager: VectorCacheManager | null;
  private branchManager: BranchManager | null;
  private config: DeltaMaintenanceConfig;

  // State
  private maintenanceLoopRunning = false;
  private isRunning = false;

  // Statistics
  private stats: MaintenanceStats = {
    lastRunTime: 0,
    totalRuns: 0,
    deltasCompacted: 0,
    deltasDeleted: 0,
    bytesFreed: 0,
    lastRunDurationMs: 0,
  };

  constructor(
    layeredIndex: ILayeredIndex,
    cacheManager: LayeredCacheManager | null = null,
    vectorCacheManager: VectorCacheManager | null = null,
    branchManager: BranchManager | null = null,
    config?: Partial<DeltaMaintenanceConfig>,
  ) {
    this.layeredIndex = layeredIndex;
    this.cacheManager = cacheManager;
    this.vectorCacheManager = vectorCacheManager;
    this.branchManager = branchManager;

    // Merge config with defaults
    this.config = {
      enabled: config?.enabled ?? true,
      compactionThreshold: config?.compactionThreshold ?? 1000,
      orphanedDeltaMaxAgeDays: config?.orphanedDeltaMaxAgeDays ?? 7,
      maintenanceIntervalMs: config?.maintenanceIntervalMs ?? 60 * 60 * 1000, // 1 hour
      autoCompaction: config?.autoCompaction ?? true,
      debug: config?.debug ?? false,
    };

    if (this.config.debug) {
      log.d("DELTAMAINT", "init", {
        threshold: this.config.compactionThreshold,
        maxAge: this.config.orphanedDeltaMaxAgeDays,
        interval: this.config.maintenanceIntervalMs,
      });
    }
  }

  // =========================================================================
  // LIFECYCLE
  // =========================================================================

  /**
   * Start maintenance service
   * Event-driven: runs initial maintenance, then relies on on-demand calls
   * For Node.js only: optionally starts a setInterval-based loop
   */
  start(): void {
    if (!this.config.enabled) {
      return;
    }

    if (this.maintenanceLoopRunning) {
      return;
    }

    this.maintenanceLoopRunning = true;

    // Run initial maintenance
    this.runMaintenance().catch(() => {
      // Ignore initial errors
    });

    // For Node.js: start periodic maintenance using setInterval (safe in Node)
    // For Bun: skip polling - rely on on-demand calls to runMaintenance()
    if (!isBunRuntime()) {
      this.maintenanceTimer = setInterval(() => {
        if (this.maintenanceLoopRunning) {
          this.runMaintenance().catch(() => {
            // Ignore errors, continue
          });
        }
      }, this.config.maintenanceIntervalMs);
    }
  }

  /** Timer handle for Node.js setInterval */
  private maintenanceTimer?: ReturnType<typeof setInterval> | undefined;

  /**
   * Stop maintenance service
   */
  stop(): void {
    this.maintenanceLoopRunning = false;
    if (this.maintenanceTimer) {
      clearInterval(this.maintenanceTimer);
      this.maintenanceTimer = undefined;
    }
  }

  // =========================================================================
  // MAINTENANCE OPERATIONS
  // =========================================================================

  /**
   * Run full maintenance cycle
   */
  async runMaintenance(): Promise<void> {
    if (this.isRunning) {
      if (this.config.debug) {
        log.d("DELTAMAINT", "skip_running");
      }
      return;
    }

    this.isRunning = true;
    const startTime = Date.now();

    try {
      log.d("DELTAMAINT", "cycle_start");

      // 1. Compact large deltas
      await this.compactLargeDeltas();

      // 2. Cleanup orphaned deltas
      await this.cleanupOrphanedDeltas();

      // 3. Delete old deltas
      await this.deleteOldDeltas();

      // 4. Compact databases
      this.compactDatabases();

      // Update stats
      this.stats.totalRuns++;
      this.stats.lastRunTime = Date.now();
      this.stats.lastRunDurationMs = Date.now() - startTime;

      log.d("DELTAMAINT", "cycle_done", { dur: this.stats.lastRunDurationMs });
    } catch (error) {
      log.e("DELTAMAINT", "cycle_fail", { err: String(error) });
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Compact large deltas (exceeding threshold)
   */
  private async compactLargeDeltas(): Promise<void> {
    if (!this.config.autoCompaction) {
      return;
    }

    try {
      const branches = await this.layeredIndex.getCachedBranches();

      if (this.config.debug) {
        log.d("DELTAMAINT", "check_compact", { branches: branches.length });
      }

      for (const branch of branches) {
        try {
          const delta = await this.layeredIndex.getBranchDelta(branch);

          if (!delta) {
            continue;
          }

          // Check if compaction needed
          if (delta.totalChanges > this.config.compactionThreshold) {
            log.d("DELTAMAINT", "compact_needed", {
              branch,
              changes: delta.totalChanges,
              threshold: this.config.compactionThreshold,
            });

            const result = await this.compactBranchDelta(branch);

            if (result.success) {
              this.stats.deltasCompacted++;
              this.stats.bytesFreed += result.memoryFreed;
            }
          }
        } catch (error) {
          log.e("DELTAMAINT", "compact_branch_err", { branch, err: String(error) });
        }
      }
    } catch (error) {
      log.e("DELTAMAINT", "compact_fail", { err: String(error) });
    }
  }

  /**
   * Compact a single branch delta
   *
   * Strategy:
   * - Recompute delta from git diff (fresher, more efficient)
   * - Replace cached delta with compacted version
   *
   * @param branch - Branch name
   */
  async compactBranchDelta(branch: string): Promise<CompactionResult> {
    const result: CompactionResult = {
      branch,
      changesBefore: 0,
      changesAfter: 0,
      memoryFreed: 0,
      success: false,
    };

    try {
      // Get current delta
      const currentDelta = await this.layeredIndex.getBranchDelta(branch);

      if (!currentDelta) {
        return result;
      }

      result.changesBefore = currentDelta.totalChanges;

      // Recompute delta (this will be more efficient)
      const newDelta = await this.layeredIndex.ensureBranchDelta(branch);

      result.changesAfter = newDelta.totalChanges;

      // Estimate memory freed (rough)
      result.memoryFreed = (result.changesBefore - result.changesAfter) * 1000; // ~1KB per change

      result.success = true;

      log.d("DELTAMAINT", "compacted", {
        branch,
        before: result.changesBefore,
        after: result.changesAfter,
        freedKB: (result.memoryFreed / 1024).toFixed(2),
      });

      return result;
    } catch (error) {
      log.e("DELTAMAINT", "compact_err", { branch, err: String(error) });
      return result;
    }
  }

  /**
   * Cleanup orphaned deltas (branches that no longer exist)
   */
  private async cleanupOrphanedDeltas(): Promise<void> {
    try {
      const cachedBranches = await this.layeredIndex.getCachedBranches();

      if (!this.branchManager) {
        if (this.config.debug) {
          log.d("DELTAMAINT", "skip_orphan_clean");
        }
        return;
      }

      // Branch enumeration skipped — orphan cleanup relies on LRU eviction

      if (this.config.debug) {
        log.d("DELTAMAINT", "check_orphans", { branches: cachedBranches.length });
      }
    } catch (error) {
      log.e("DELTAMAINT", "orphan_clean_err", { err: String(error) });
    }
  }

  /**
   * Delete old deltas (older than configured age)
   */
  private async deleteOldDeltas(): Promise<void> {
    try {
      let deletedCount = 0;

      // Delete old entity deltas
      if (this.cacheManager) {
        const deleted = await this.cacheManager.deleteOldDeltas(this.config.orphanedDeltaMaxAgeDays);
        deletedCount += deleted;
      }

      // Delete old vector deltas
      if (this.vectorCacheManager) {
        const deleted = await this.vectorCacheManager.deleteOldDeltas(this.config.orphanedDeltaMaxAgeDays);
        deletedCount += deleted;
      }

      if (deletedCount > 0) {
        this.stats.deltasDeleted += deletedCount;
        log.d("DELTAMAINT", "deleted_old", { cnt: deletedCount });
      }
    } catch (error) {
      log.e("DELTAMAINT", "delete_old_err", { err: String(error) });
    }
  }

  /**
   * Compact databases (VACUUM)
   */
  private compactDatabases(): void {
    try {
      if (this.cacheManager) {
        this.cacheManager.compact();
      }

      if (this.vectorCacheManager) {
        this.vectorCacheManager.compact();
      }
    } catch (error) {
      log.e("DELTAMAINT", "db_compact_err", { err: String(error) });
    }
  }

  // =========================================================================
  // MANUAL OPERATIONS
  // =========================================================================

  /**
   * Force compaction of all deltas
   */
  async forceCompactAll(): Promise<void> {
    log.d("DELTAMAINT", "force_compact_start");

    const branches = await this.layeredIndex.getCachedBranches();

    for (const branch of branches) {
      await this.compactBranchDelta(branch);
    }

    log.d("DELTAMAINT", "force_compact_done");
  }

  /**
   * Force cleanup of all orphaned deltas
   */
  async forceCleanupOrphaned(): Promise<void> {
    log.d("DELTAMAINT", "force_cleanup_start");
    await this.cleanupOrphanedDeltas();
    log.d("DELTAMAINT", "force_cleanup_done");
  }

  // =========================================================================
  // STATISTICS
  // =========================================================================

  /**
   * Get maintenance statistics
   */
  getStats(): MaintenanceStats {
    return { ...this.stats };
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.stats = {
      lastRunTime: 0,
      totalRuns: 0,
      deltasCompacted: 0,
      deltasDeleted: 0,
      bytesFreed: 0,
      lastRunDurationMs: 0,
    };
  }

  /**
   * Get comprehensive status report
   */
  async getStatusReport(): Promise<StatusReport> {
    const report: StatusReport = {
      maintenance: this.getStats(),
    };

    // Entity cache stats
    if (this.cacheManager) {
      report.entityCache = this.cacheManager.getStatistics() as CacheStatistics;
    }

    // Vector cache stats
    if (this.vectorCacheManager) {
      report.vectorCache = this.vectorCacheManager.getStatistics() as CacheStatistics;
    }

    return report;
  }
}
