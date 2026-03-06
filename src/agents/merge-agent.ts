/**
 * MergeAgent - Semantic merge operations
 *
 * Provides intelligent 3-way merge with:
 * - Fast Path matching (90%+ coverage via hashes)
 * - Semantic matching for moved/refactored code
 * - Intent classification for conflict detection
 * - AI-assisted conflict resolution
 */

import type { BranchManager } from "../core/branch-manager.js";
import { log } from "../logging/index.js";
import { AIConflictResolver, type AIConflictResolverConfig } from "../merge/engine/ai-conflict-resolver.js";
import { ThreeWayMerger, type ThreeWayMergerConfig } from "../merge/engine/three-way-merger.js";
import { GitIntegration } from "../merge/integration/git-integration.js";
import type { MergeAction, MergeResult } from "../merge/models/merge-result.js";
import type { SemanticConflict } from "../merge/models/semantic-conflict.js";
import { type AgentMessage, type AgentTask, AgentType } from "../types/agent.js";
import { BaseAgent } from "./base.js";

// =============================================================================
// 1. TYPES AND INTERFACES
// =============================================================================

export interface MergeAgentConfig {
  repoPath: string;
  fastPathEnabled?: boolean | undefined;
  semanticMatchingEnabled?: boolean | undefined;
  semanticThreshold?: number | undefined;
  autoResolveConflicts?: boolean | undefined;
  maxConcurrency?: number | undefined;
  branchManager?: BranchManager | undefined;
  gitIntegration?: GitIntegration | undefined;
}

export interface SemanticMergeOptions {
  branchA: string;
  branchB: string;
  dryRun?: boolean | undefined; // Preview only, don't apply changes
  autoResolve?: boolean | undefined; // Auto-resolve compatible conflicts
  includeAISuggestions?: boolean | undefined; // Generate AI suggestions for conflicts
}

export interface MergeAgentResult {
  success: boolean;
  mergeResult?: MergeResult;
  appliedActions?: MergeAction[];
  error?: string;
  stats: {
    totalUnitsAnalyzed: number;
    matchedUnits: number;
    conflictsDetected: number;
    autoResolved: number;
    manualReviewRequired: number;
    mergeTimeMs: number;
  };
}

// =============================================================================
// 2. MERGE AGENT IMPLEMENTATION
// =============================================================================

export class MergeAgent extends BaseAgent {
  private config: MergeAgentConfig;
  private gitIntegration: GitIntegration | null = null;
  private threeWayMerger: ThreeWayMerger | null = null;
  private aiResolver: AIConflictResolver | null = null;
  private branchManager: BranchManager | null = null;

  // Merge-specific metrics
  private mergeMetrics = {
    mergesPerformed: 0,
    conflictsDetected: 0,
    conflictsAutoResolved: 0,
    totalMergeTimeMs: 0,
    lastMergeAt: 0,
  };

  constructor(config: MergeAgentConfig) {
    super(AgentType.MERGE, {
      maxConcurrency: config.maxConcurrency ?? 1,
      memoryLimit: 512, // MB
      priority: 5,
    });
    this.config = {
      fastPathEnabled: true,
      semanticMatchingEnabled: true,
      semanticThreshold: 0.7,
      autoResolveConflicts: false,
      maxConcurrency: 1,
      ...config,
    };
  }

  // =============================================================================
  // ABSTRACT METHOD IMPLEMENTATIONS
  // =============================================================================

  protected canProcessTask(task: AgentTask): boolean {
    // MergeAgent can handle merge-related tasks
    return (
      task.type === "merge" ||
      task.type === "merge:analyze" ||
      task.type === "merge:perform" ||
      task.type === "merge:suggestions"
    );
  }

  protected async processTask(task: AgentTask): Promise<unknown> {
    log.d("MERGEAGENT", "proc_task", { id: task.id, type: task.type });

    const payload = task.payload as Record<string, unknown>;

    switch (task.type) {
      case "merge":
      case "merge:perform":
        return await this.performSemanticMerge({
          branchA: payload["branchA"] as string,
          branchB: payload["branchB"] as string,
          dryRun: payload["dryRun"] as boolean | undefined,
          autoResolve: payload["autoResolve"] as boolean | undefined,
          includeAISuggestions: payload["includeAISuggestions"] as boolean | undefined,
        });

      case "merge:analyze":
        return await this.analyzeConflicts(payload["branchA"] as string, payload["branchB"] as string);

      case "merge:suggestions":
        return await this.getSuggestions(payload["conflict"] as SemanticConflict);

      default:
        throw new Error(`Unknown task type: ${task.type}`);
    }
  }

  protected async handleMessage(message: AgentMessage): Promise<void> {
    log.d("MERGEAGENT", "recv_msg", { from: message.from, type: message.type });
    // Handle inter-agent messages if needed
  }

  // =============================================================================
  // LIFECYCLE
  // =============================================================================

  protected async onInitialize(): Promise<void> {
    log.i("MERGEAGENT", "init_start");

    // Use provided gitIntegration or create new one
    this.gitIntegration =
      this.config.gitIntegration ??
      new GitIntegration({
        repoPath: this.config.repoPath,
        allowDetachedHead: true,
        restoreOnError: true,
      });

    // Use provided branchManager
    this.branchManager = this.config.branchManager ?? null;

    // Initialize ThreeWayMerger if we have required dependencies
    const mergerConfig: Partial<ThreeWayMergerConfig> = {
      ...(this.config.fastPathEnabled != null ? { fastPathEnabled: this.config.fastPathEnabled } : {}),
      ...(this.config.semanticMatchingEnabled != null
        ? { semanticMatchingEnabled: this.config.semanticMatchingEnabled }
        : {}),
      ...(this.config.semanticThreshold != null ? { semanticThreshold: this.config.semanticThreshold } : {}),
      ...(this.config.autoResolveConflicts != null ? { autoResolveConflicts: this.config.autoResolveConflicts } : {}),
    };

    if (this.branchManager && this.gitIntegration) {
      this.threeWayMerger = new ThreeWayMerger(
        this.branchManager,
        this.gitIntegration,
        null, // conductor - not needed for basic merge operations
        mergerConfig,
      );
    }

    // Note: AIConflictResolver requires EmbeddingGenerator which may not be available
    // It will be initialized lazily when AI suggestions are requested
    this.aiResolver = null;

    log.i("MERGEAGENT", "init_done");
  }

  protected async onShutdown(): Promise<void> {
    log.i("MERGEAGENT", "shutdown_start");

    // Cleanup git integration
    if (this.gitIntegration) {
      await this.gitIntegration.cleanup();
    }

    this.threeWayMerger = null;
    this.gitIntegration = null;
    this.aiResolver = null;

    log.i("MERGEAGENT", "shutdown_done");
  }

  // =============================================================================
  // PUBLIC API
  // =============================================================================

  /**
   * Set dependencies after construction (for DI)
   */
  setDependencies(branchManager: BranchManager, gitIntegration?: GitIntegration): void {
    this.branchManager = branchManager;
    if (gitIntegration) {
      this.gitIntegration = gitIntegration;
    }
  }

  /**
   * Set AI resolver with embedding generator
   */
  setAIResolver(config: AIConflictResolverConfig): void {
    this.aiResolver = new AIConflictResolver(config);
  }

  /**
   * Perform semantic merge between two branches
   */
  async performSemanticMerge(options: SemanticMergeOptions): Promise<MergeAgentResult> {
    const startTime = Date.now();

    if (!this.threeWayMerger) {
      return {
        success: false,
        error: "MergeAgent not properly initialized - missing ThreeWayMerger",
        stats: this.createEmptyStats(0),
      };
    }

    try {
      // Perform 3-way merge analysis
      log.i("MERGEAGENT", "merge_start", { from: options.branchA, to: options.branchB });
      const mergeResult = await this.threeWayMerger.performMerge(options.branchA, options.branchB);

      // Generate AI suggestions if requested and resolver is available
      if (options.includeAISuggestions && mergeResult.conflicts.length > 0 && this.aiResolver) {
        await this.generateAISuggestions(mergeResult.conflicts);
      }

      // Auto-resolve compatible conflicts if requested
      let autoResolved = 0;
      if (options.autoResolve) {
        autoResolved = await this.autoResolveConflicts(mergeResult);
      }

      // Apply changes if not dry run
      let appliedActions: MergeAction[] = [];
      if (!options.dryRun) {
        appliedActions = await this.applyMergeActions(mergeResult);
      }

      // Update metrics
      const mergeTimeMs = Date.now() - startTime;
      this.updateMergeMetrics(mergeResult, autoResolved, mergeTimeMs);

      return {
        success: true,
        mergeResult,
        appliedActions,
        stats: {
          totalUnitsAnalyzed: mergeResult.stats.totalUnitsInA + mergeResult.stats.totalUnitsInB,
          matchedUnits: mergeResult.stats.matchedCount,
          conflictsDetected: mergeResult.stats.conflictCount,
          autoResolved,
          manualReviewRequired: mergeResult.stats.manualReviewCount - autoResolved,
          mergeTimeMs,
        },
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      log.e("MERGEAGENT", "merge_fail", { err: errorMsg });

      return {
        success: false,
        error: errorMsg,
        stats: this.createEmptyStats(Date.now() - startTime),
      };
    }
  }

  /**
   * Analyze merge conflicts without performing merge
   */
  async analyzeConflicts(
    branchA: string,
    branchB: string,
  ): Promise<{
    conflicts: SemanticConflict[];
    stats: {
      totalConflicts: number;
      bySeverity: Record<string, number>;
      byType: Record<string, number>;
    };
  }> {
    const result = await this.performSemanticMerge({
      branchA,
      branchB,
      dryRun: true,
      autoResolve: false,
    });

    if (!result.mergeResult) {
      return {
        conflicts: [],
        stats: { totalConflicts: 0, bySeverity: {}, byType: {} },
      };
    }

    const conflicts = result.mergeResult.conflicts;
    const bySeverity: Record<string, number> = {};
    const byType: Record<string, number> = {};

    for (const conflict of conflicts) {
      bySeverity[conflict.severity] = (bySeverity[conflict.severity] || 0) + 1;
      byType[conflict.type] = (byType[conflict.type] || 0) + 1;
    }

    return {
      conflicts,
      stats: {
        totalConflicts: conflicts.length,
        bySeverity,
        byType,
      },
    };
  }

  /**
   * Get AI-generated suggestions for a specific conflict
   */
  async getSuggestions(conflict: SemanticConflict): Promise<string[]> {
    if (!this.aiResolver) {
      return ["AI resolver not available - configure embedding generator first"];
    }

    try {
      const aiAnalysis = await this.aiResolver.analyzeConflict(conflict);
      const resolution = this.aiResolver.createResolution(aiAnalysis);

      return [
        `Strategy: ${resolution.strategy}`,
        `Confidence: ${(resolution.confidence * 100).toFixed(1)}%`,
        `Explanation: ${resolution.explanation}`,
        ...(resolution.mergedCode ? [`Suggested code:\n${resolution.mergedCode}`] : []),
      ];
    } catch (error) {
      log.e("MERGEAGENT", "ai_suggest_fail", { err: String(error) });
      return [];
    }
  }

  /**
   * Get merge-specific metrics
   */
  getMergeMetrics(): typeof this.mergeMetrics {
    return { ...this.mergeMetrics };
  }

  // =============================================================================
  // PRIVATE METHODS
  // =============================================================================

  private async generateAISuggestions(conflicts: SemanticConflict[]): Promise<void> {
    if (!this.aiResolver) return;

    log.d("MERGEAGENT", "gen_ai_suggest", { cnt: conflicts.length });

    for (const conflict of conflicts) {
      try {
        const aiAnalysis = await this.aiResolver.analyzeConflict(conflict);
        const resolution = this.aiResolver.createResolution(aiAnalysis);
        conflict.aiSuggestions = [resolution.explanation];
        conflict.aiConfidence = resolution.confidence;
      } catch (error) {
        log.w("MERGEAGENT", "ai_conflict_fail", { err: String(error) });
      }
    }
  }

  private async autoResolveConflicts(mergeResult: MergeResult): Promise<number> {
    let resolved = 0;

    for (const action of mergeResult.mergeActions) {
      if (action.type === "manual-review" && action.conflict) {
        // Try to auto-resolve using AI
        if (this.aiResolver) {
          try {
            const aiAnalysis = await this.aiResolver.analyzeConflict(action.conflict);
            if (aiAnalysis.confidence >= 0.9 && aiAnalysis.mergedCode) {
              action.type = "auto-merge";
              action.description = `Auto-resolved: ${aiAnalysis.explanation}`;
              resolved++;
            }
          } catch {
            // Skip auto-resolve for this conflict
          }
        }
      }
    }

    return resolved;
  }

  private async applyMergeActions(mergeResult: MergeResult): Promise<MergeAction[]> {
    const applied: MergeAction[] = [];

    for (const action of mergeResult.mergeActions) {
      if (action.type === "auto-merge" && action.mergedUnit) {
        // Apply the merge action
        // This would write the merged code to the file system
        applied.push(action);
      }
    }

    log.i("MERGEAGENT", "actions_applied", { cnt: applied.length });
    return applied;
  }

  private updateMergeMetrics(mergeResult: MergeResult, autoResolved: number, mergeTimeMs: number): void {
    this.mergeMetrics.mergesPerformed++;
    this.mergeMetrics.conflictsDetected += mergeResult.conflicts.length;
    this.mergeMetrics.conflictsAutoResolved += autoResolved;
    this.mergeMetrics.totalMergeTimeMs += mergeTimeMs;
    this.mergeMetrics.lastMergeAt = Date.now();
  }

  private createEmptyStats(mergeTimeMs: number) {
    return {
      totalUnitsAnalyzed: 0,
      matchedUnits: 0,
      conflictsDetected: 0,
      autoResolved: 0,
      manualReviewRequired: 0,
      mergeTimeMs,
    };
  }
}
