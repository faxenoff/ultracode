import { log } from "../../logging/index.js";
import { hashText } from "../../utils/fast-hash.js";
import type { CodeUnit } from "../models/code-unit.js";
import {
  ConflictSeverity,
  ConflictType,
  type Resolution,
  ResolutionStrategy,
  type SemanticConflict,
} from "../models/semantic-conflict.js";
import type { AIConflictResolver } from "./ai-conflict-resolver.js";

/**
 * Conflict Resolver - Resolves conflicts during merge
 *
 * Generates conflict resolution suggestions:
 * - Automatic resolution for simple cases
 * - AI-assisted suggestions for complex conflicts (via embeddings)
 * - Preview merged code for different strategies
 * - Confidence scoring for each suggestion
 */

export interface ConflictResolverConfig {
  // AI integration (optional)
  aiEnabled: boolean; // default: false
  aiResolver?: AIConflictResolver | undefined; // AI resolver for semantic analysis

  // Resolution preferences
  preferBranchA: boolean; // default: false - prioritize branchA when conditions are equal
  preferNewerCode: boolean; // default: true - prioritize newer code
  minConfidenceThreshold: number; // default: 0.5 - minimum confidence for auto-resolve
}

export class ConflictResolver {
  private config: ConflictResolverConfig;
  private aiResolver?: AIConflictResolver | undefined;

  constructor(_config: Partial<ConflictResolverConfig> = {}) {
    this.config = {
      aiEnabled: false,
      preferBranchA: false,
      preferNewerCode: true,
      minConfidenceThreshold: 0.5,
      ..._config,
    };

    this.aiResolver = _config.aiResolver;
  }

  /**
   * Resolve a conflict
   *
   * @param conflict - Conflict to resolve
   * @returns Resolution with the proposed solution
   */
  async resolveConflict(conflict: SemanticConflict): Promise<Resolution> {
    // If AI is enabled and available - use AI analysis
    if (this.config.aiEnabled && this.aiResolver) {
      try {
        const aiAnalysis = await this.aiResolver.analyzeConflict(conflict);

        // If AI confidence is above threshold - use AI resolution
        if (aiAnalysis.confidence >= this.config.minConfidenceThreshold) {
          return this.aiResolver.createResolution(aiAnalysis);
        }

        // AI is not confident - continue with fallback logic
        log.d("CONFLICTRES", "ai_low_confidence", {
          confidence: aiAnalysis.confidence,
          threshold: this.config.minConfidenceThreshold,
        });
      } catch (error) {
        log.w("CONFLICTRES", "ai_fail", { err: String(error) });
      }
    }

    // Fallback: traditional resolution logic

    // If the conflict is already marked as auto-resolvable
    if (conflict.autoResolvable) {
      return this.autoResolve(conflict);
    }

    // If the conflict is critical - manual review only
    if (conflict.severity === ConflictSeverity.Critical) {
      return this.createManualReviewResolution(conflict, "Critical conflict requires manual review");
    }

    // Try to resolve based on conflict type
    switch (conflict.type) {
      case ConflictType.OverlappingChanges:
        return this.resolveOverlappingChanges(conflict);

      case ConflictType.IncompatibleIntents:
        return this.resolveIncompatibleIntents(conflict);

      case ConflictType.APIBreakingChange:
        return this.resolveAPIBreakingChange(conflict);

      case ConflictType.LogicConflict:
        return this.resolveLogicConflict(conflict);

      case ConflictType.MovedAndModified:
        return this.resolveMovedAndModified(conflict);

      default:
        return this.createManualReviewResolution(conflict, "Unknown conflict type");
    }
  }

  /**
   * Automatic resolution for auto-resolvable conflicts
   */
  private autoResolve(conflict: SemanticConflict): Resolution {
    const { branchAIntent, branchBIntent } = conflict;

    // If both intents are compatible and Low severity - try to merge
    if (branchAIntent && branchBIntent && conflict.severity === ConflictSeverity.Low) {
      // If both BugFix or both Refactoring - merge both
      if (
        (branchAIntent.type === "BugFix" && branchBIntent.type === "BugFix") ||
        (branchAIntent.type === "Refactoring" && branchBIntent.type === "Refactoring")
      ) {
        return this.mergeBothChanges(conflict);
      }

      // BugFix + Refactoring - merge both (usually compatible)
      if (
        (branchAIntent.type === "BugFix" && branchBIntent.type === "Refactoring") ||
        (branchAIntent.type === "Refactoring" && branchBIntent.type === "BugFix")
      ) {
        return this.mergeBothChanges(conflict);
      }
    }

    // Default: manual review
    return this.createManualReviewResolution(conflict, "Auto-resolve failed");
  }

  /**
   * Resolve OverlappingChanges
   */
  private resolveOverlappingChanges(conflict: SemanticConflict): Resolution {
    const { baseUnit, branchAUnit, branchBUnit } = conflict;

    // If changes are identical - take either (considering preferBranchA)
    if (branchAUnit.contentHash === branchBUnit.contentHash) {
      const strategy = this.config.preferBranchA ? ResolutionStrategy.TakeBranchA : ResolutionStrategy.TakeBranchB;
      const mergedCode = this.config.preferBranchA ? branchAUnit.content : branchBUnit.content;

      return {
        strategy,
        confidence: 1.0,
        mergedCode,
        explanation: "Both branches made identical changes",
      };
    }

    // If one is unchanged relative to base - take the other
    if (baseUnit) {
      const branchAUnchanged = baseUnit.contentHash === branchAUnit.contentHash;
      const branchBUnchanged = baseUnit.contentHash === branchBUnit.contentHash;

      if (branchAUnchanged && !branchBUnchanged) {
        return {
          strategy: ResolutionStrategy.TakeBranchB,
          confidence: 0.95,
          mergedCode: branchBUnit.content,
          explanation: "Only branchB modified this unit",
        };
      }

      if (branchBUnchanged && !branchAUnchanged) {
        return {
          strategy: ResolutionStrategy.TakeBranchA,
          confidence: 0.95,
          mergedCode: branchAUnit.content,
          explanation: "Only branchA modified this unit",
        };
      }
    }

    // Both modified - try merge or manual review
    if (conflict.severity === ConflictSeverity.Low) {
      return this.mergeBothChanges(conflict);
    }

    return this.createManualReviewResolution(conflict, "Both branches modified the unit differently");
  }

  /**
   * Resolve IncompatibleIntents
   */
  private resolveIncompatibleIntents(conflict: SemanticConflict): Resolution {
    const { branchAIntent, branchBIntent } = conflict;

    // APIChange always requires manual review
    if (branchAIntent?.type === "APIChange" || branchBIntent?.type === "APIChange") {
      return this.createManualReviewResolution(conflict, "API changes require manual review");
    }

    // If one is FeatureAddition, the other BugFix - can try merge
    if (
      (branchAIntent?.type === "FeatureAddition" && branchBIntent?.type === "BugFix") ||
      (branchAIntent?.type === "BugFix" && branchBIntent?.type === "FeatureAddition")
    ) {
      return this.mergeBothChanges(conflict);
    }

    return this.createManualReviewResolution(conflict, "Incompatible change intents detected");
  }

  /**
   * Resolve APIBreakingChange
   */
  private resolveAPIBreakingChange(conflict: SemanticConflict): Resolution {
    // API breaking changes always require manual review
    return this.createManualReviewResolution(conflict, "API breaking changes require careful manual review");
  }

  /**
   * Resolve LogicConflict
   */
  private resolveLogicConflict(conflict: SemanticConflict): Resolution {
    // Logic conflicts require manual review
    return this.createManualReviewResolution(conflict, "Logic conflicts require domain expertise");
  }

  /**
   * Resolve MovedAndModified
   */
  private resolveMovedAndModified(conflict: SemanticConflict): Resolution {
    // If the file was moved and modified - manual review
    return this.createManualReviewResolution(conflict, "File was both moved and modified");
  }

  /**
   * Attempt to merge both versions
   */
  private mergeBothChanges(conflict: SemanticConflict): Resolution {
    const { branchAUnit, branchBUnit, baseUnit } = conflict;

    // Simple strategy: try to combine changes
    // For production, diff3 or tree-merge can be used
    const mergedCode = this.attemptSimpleMerge(baseUnit?.content || "", branchAUnit.content, branchBUnit.content);

    if (mergedCode) {
      const confidence = 0.7;

      // Check minimum confidence threshold
      if (confidence < this.config.minConfidenceThreshold) {
        return this.createManualReviewResolution(
          conflict,
          `Confidence ${confidence} below threshold ${this.config.minConfidenceThreshold}`,
        );
      }

      return {
        strategy: ResolutionStrategy.MergeBoth,
        confidence,
        mergedCode,
        explanation: "Automatically merged both changes",
      };
    }

    // If simple merge failed - manual review
    return this.createManualReviewResolution(conflict, "Automatic merge failed");
  }

  /**
   * Simple merge algorithm
   *
   * Attempts to combine changes from branchA and branchB.
   * Returns null if automatic merge is not possible.
   */
  private attemptSimpleMerge(baseContent: string, branchAContent: string, branchBContent: string): string | null {
    // If base is empty - choose the longer version
    if (!baseContent) {
      return branchAContent.length > branchBContent.length ? branchAContent : branchBContent;
    }

    // Simple heuristic: if changes don't overlap by lines
    const baseLines = baseContent.split("\n");
    const branchALines = branchAContent.split("\n");
    const branchBLines = branchBContent.split("\n");

    // If sizes differ significantly - cannot automatically merge
    const maxLen = Math.max(baseLines.length, branchALines.length, branchBLines.length);
    const minLen = Math.min(baseLines.length, branchALines.length, branchBLines.length);

    if (maxLen > minLen * 1.5) {
      // Too different - manual review
      return null;
    }

    // For simplicity return null (a more advanced diff3 is needed)
    // See .autodoc/todo/BACKLOG.md#1
    return null;
  }

  /**
   * Create Resolution for manual review
   */
  private createManualReviewResolution(conflict: SemanticConflict, reason: string): Resolution {
    // Provide preview of both versions
    const preview = this.generateConflictMarkers(conflict);

    return {
      strategy: ResolutionStrategy.ManualReview,
      confidence: 0.0,
      mergedCode: preview,
      explanation: reason,
    };
  }

  /**
   * Generate conflict markers in Git style
   */
  private generateConflictMarkers(conflict: SemanticConflict): string {
    const { branchAUnit, branchBUnit, baseUnit } = conflict;

    let result = "";

    result += `<<<<<<< branchA: ${branchAUnit.fullyQualifiedName}\n`;
    result += branchAUnit.content;
    result += "\n";

    if (baseUnit) {
      result += `||||||| base\n`;
      result += baseUnit.content;
      result += "\n";
    }

    result += `=======\n`;
    result += branchBUnit.content;
    result += "\n";
    result += `>>>>>>> branchB: ${branchBUnit.fullyQualifiedName}\n`;

    return result;
  }

  /**
   * Batch resolution for multiple conflicts
   */
  async resolveConflicts(conflicts: SemanticConflict[]): Promise<Map<string, Resolution>> {
    const resolutions = new Map<string, Resolution>();

    for (const conflict of conflicts) {
      const resolution = await this.resolveConflict(conflict);
      resolutions.set(conflict.id, resolution);
    }

    return resolutions;
  }

  /**
   * Get preview for different strategies
   *
   * @param conflict - Conflict
   * @param strategy - Resolution strategy
   * @returns Preview merged code
   */
  getPreview(conflict: SemanticConflict, strategy: ResolutionStrategy): string {
    switch (strategy) {
      case ResolutionStrategy.TakeBranchA:
        return conflict.branchAUnit.content;

      case ResolutionStrategy.TakeBranchB:
        return conflict.branchBUnit.content;

      case ResolutionStrategy.MergeBoth:
        return (
          this.attemptSimpleMerge(
            conflict.baseUnit?.content || "",
            conflict.branchAUnit.content,
            conflict.branchBUnit.content,
          ) || this.generateConflictMarkers(conflict)
        );

      case ResolutionStrategy.ManualReview:
        return this.generateConflictMarkers(conflict);

      default:
        return this.generateConflictMarkers(conflict);
    }
  }

  /**
   * Apply resolution to code unit
   *
   * @param conflict - Conflict
   * @param resolution - Resolution to apply
   * @returns Merged code unit
   */
  applyResolution(conflict: SemanticConflict, resolution: Resolution): CodeUnit {
    const baseUnit = conflict.branchAUnit; // Use branchA as base for merged unit

    return {
      ...baseUnit,
      content: resolution.mergedCode,
      contentHash: this.computeHash(resolution.mergedCode),
      metadata: {
        ...baseUnit.metadata,
        mergeResolution: {
          strategy: resolution.strategy,
          confidence: resolution.confidence,
          timestamp: new Date().toISOString(),
        },
      },
    };
  }

  /**
   * Compute hash
   */
  private computeHash(content: string): string {
    return hashText(content);
  }
}
