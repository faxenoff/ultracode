import type { ConductorOrchestrator } from "../../agents/conductor-orchestrator.js";
import type { BranchManager } from "../../core/branch-manager.js";
import { log } from "../../logging/index.js";
import { ConflictDetector } from "../analysis/conflict-detector.js";
import { IntentClassifier } from "../analysis/intent-classifier.js";
import { type EmbeddingGeneratorFn, LazyEmbeddingCache } from "../indexing/lazy-embedding-cache.js";
import { MultiVersionIndexer } from "../indexing/multi-version-indexer.js";
import type { GitFileChange, GitIntegration } from "../integration/git-integration.js";
import { FastPathMatcher } from "../matching/fast-path-matcher.js";
import { SemanticMatcher } from "../matching/semantic-matcher.js";
import type { ChangeIntent } from "../models/change-intent.js";
import type { CodeUnit } from "../models/code-unit.js";
import type { MergeAction, MergeResult, MergeStats } from "../models/merge-result.js";
import { ConflictSeverity, ConflictType, type SemanticConflict } from "../models/semantic-conflict.js";
import type { VersionedIndex } from "../models/versioned-index.js";

/**
 * Three-Way Merger - Main 3-way merge engine
 *
 * Performs semantic merge in 5 phases:
 * 1. Multi-Version Indexing - indexing base + branchA + branchB
 * 2. Fast Path Matching - O(1) matching via hashes
 * 3. Semantic Matching - vector similarity for unmapped units
 * 4. Intent Classification - determining change intents
 * 5. Conflict Detection - detecting and resolving conflicts
 */

export interface ThreeWayMergerConfig {
  // Fast Path settings
  fastPathEnabled: boolean; // default: true

  // Semantic matching settings
  semanticMatchingEnabled: boolean; // default: true
  semanticThreshold: number; // default: 0.7
  embeddingGenerator?: EmbeddingGeneratorFn | undefined;

  // Intent classification settings
  classifyIntents: boolean; // default: true

  // Conflict detection settings
  detectConflicts: boolean; // default: true
  autoResolveConflicts: boolean; // default: false (requires manual review)
}

export class ThreeWayMerger {
  private branchManager: BranchManager;
  private gitIntegration: GitIntegration;
  private conductor: ConductorOrchestrator | null;
  private config: ThreeWayMergerConfig;

  // Components
  private multiVersionIndexer: MultiVersionIndexer;
  private fastPathMatcher: FastPathMatcher;
  private semanticMatcher: SemanticMatcher;
  private intentClassifier: IntentClassifier;
  private conflictDetector: ConflictDetector;

  constructor(
    _branchManager: BranchManager,
    _gitIntegration: GitIntegration,
    _conductor: ConductorOrchestrator | null,
    config: Partial<ThreeWayMergerConfig> = {},
  ) {
    this.branchManager = _branchManager;
    this.gitIntegration = _gitIntegration;
    this.conductor = _conductor;

    // Default config
    this.config = {
      fastPathEnabled: true,
      semanticMatchingEnabled: true,
      semanticThreshold: 0.7,
      classifyIntents: true,
      detectConflicts: true,
      autoResolveConflicts: false,
      ...config,
    };

    // Initialize components
    this.multiVersionIndexer = new MultiVersionIndexer(this.branchManager, this.gitIntegration, this.conductor);
    this.fastPathMatcher = new FastPathMatcher();
    this.semanticMatcher = new SemanticMatcher();
    this.intentClassifier = new IntentClassifier();
    this.conflictDetector = new ConflictDetector();
  }

  /**
   * Perform 3-way merge
   *
   * @param branchA - Name of the first branch to merge
   * @param branchB - Name of the second branch to merge
   * @returns MergeResult with matched units, conflicts, and merge actions
   */
  async performMerge(branchA: string, branchB: string): Promise<MergeResult> {
    log.i("3WAYMERGE", `[ThreeWayMerger] Starting 3-way merge: ${branchA} + ${branchB}`);
    const startTime = Date.now();

    // === Phase 1: Multi-Version Indexing ===
    log.i("3WAYMERGE", "[ThreeWayMerger] Phase 1: Indexing 3 branches...");
    const indexResult = await this.multiVersionIndexer.indexThreeBranches(branchA, branchB);

    const { base, branchA: indexA, branchB: indexB, mergeBase } = indexResult;

    log.i(
      "3WAYMERGE",
      `[ThreeWayMerger] Indexed: base=${base.stats.totalUnits}, A=${indexA.stats.totalUnits}, B=${indexB.stats.totalUnits}`,
    );

    // === Phase 1.5: Get git file changes for rename detection ===
    log.i("3WAYMERGE", "[ThreeWayMerger] Phase 1.5: Detecting file changes from git...");
    const changesA = await this.gitIntegration.getChangedFilesBetween(mergeBase, branchA);
    const changesB = await this.gitIntegration.getChangedFilesBetween(mergeBase, branchB);
    const renamedInA = changesA.filter((c) => c.status === "renamed");
    const renamedInB = changesB.filter((c) => c.status === "renamed");
    log.i(
      "3WAYMERGE",
      `[ThreeWayMerger] Git changes: A=${changesA.length} (${renamedInA.length} renamed), B=${changesB.length} (${renamedInB.length} renamed)`,
    );

    // === Phase 2: Fast Path Matching ===
    log.i("3WAYMERGE", "[ThreeWayMerger] Phase 2: Fast Path matching...");
    const { matchedUnits, unmatchedA, unmatchedB } = await this.fastPathMatch(base, indexA, indexB);

    log.i(
      "3WAYMERGE",
      `[ThreeWayMerger] Fast Path: ${matchedUnits.length} matched, ${unmatchedA.length} unmapped in A, ${unmatchedB.length} unmapped in B`,
    );

    // === Phase 2.5: Detect added/deleted units ===
    log.i("3WAYMERGE", "[ThreeWayMerger] Phase 2.5: Detecting added/deleted units...");
    const { addedInA, addedInB, deletedUnits, renamedUnits } = this.detectAddedDeletedRenamed(
      base,
      indexA,
      indexB,
      unmatchedA,
      unmatchedB,
      renamedInA,
      renamedInB,
    );
    log.i(
      "3WAYMERGE",
      `[ThreeWayMerger] Added: A=${addedInA.length}, B=${addedInB.length}, Deleted=${deletedUnits.length}, Renamed=${renamedUnits.length}`,
    );

    // === Phase 3: Semantic Matching ===
    // Filter out already-classified units from semantic matching
    const addedIds = new Set([...addedInA.map((u) => u.id), ...addedInB.map((u) => u.id)]);
    const renamedIds = new Set(renamedUnits.map((r) => r.unit.id));
    const remainingUnmatchedA = unmatchedA.filter((u) => !addedIds.has(u.id) && !renamedIds.has(u.id));
    const remainingUnmatchedB = unmatchedB.filter((u) => !addedIds.has(u.id) && !renamedIds.has(u.id));

    let semanticMatches: typeof matchedUnits = [];
    if (this.config.semanticMatchingEnabled && (remainingUnmatchedA.length > 0 || remainingUnmatchedB.length > 0)) {
      log.i("3WAYMERGE", "[ThreeWayMerger] Phase 3: Semantic matching...");
      semanticMatches = await this.semanticMatch(base, remainingUnmatchedA, remainingUnmatchedB);
      log.i("3WAYMERGE", `[ThreeWayMerger] Semantic: ${semanticMatches.length} matched`);
    }

    const allMatches = [...matchedUnits, ...semanticMatches];

    // === Phase 4: Intent Classification ===
    let intents: Map<string, { branchAIntent?: ChangeIntent | undefined; branchBIntent?: ChangeIntent }> = new Map();

    if (this.config.classifyIntents) {
      log.i("3WAYMERGE", "[ThreeWayMerger] Phase 4: Classifying intents...");
      intents = this.classifyIntents(allMatches);
      log.i("3WAYMERGE", `[ThreeWayMerger] Classified intents for ${intents.size} unit pairs`);
    }

    // === Phase 5: Conflict Detection ===
    let conflicts: SemanticConflict[] = [];

    if (this.config.detectConflicts) {
      log.i("3WAYMERGE", "[ThreeWayMerger] Phase 5: Detecting conflicts...");
      conflicts = this.detectConflicts(allMatches, intents);
      // Add delete-modify conflicts
      const deleteModifyConflicts = this.detectDeleteModifyConflicts(deletedUnits);
      conflicts = [...conflicts, ...deleteModifyConflicts];
      log.i("3WAYMERGE", `[ThreeWayMerger] Detected ${conflicts.length} conflicts`);
    }

    // === Generate Merge Actions ===
    const mergeActions = this.generateMergeActions(
      allMatches,
      conflicts,
      addedInA,
      addedInB,
      deletedUnits,
      renamedUnits,
    );

    const stats: MergeStats = {
      totalUnitsInBase: base.stats.totalUnits,
      totalUnitsInA: indexA.stats.totalUnits,
      totalUnitsInB: indexB.stats.totalUnits,
      matchedCount: allMatches.length,
      conflictCount: conflicts.length,
      autoMergedCount: mergeActions.filter((a) => a.type === "auto-merge").length,
      manualReviewCount: mergeActions.filter((a) => a.type === "manual-review").length,
      addedFromACount: addedInA.length,
      addedFromBCount: addedInB.length,
      deletedCount: deletedUnits.length,
      renamedCount: renamedUnits.length,
      mergeTimeMs: Date.now() - startTime,
    };

    const result: MergeResult = {
      branchA,
      branchB,
      mergeBase,
      baseIndex: base,
      branchAIndex: indexA,
      branchBIndex: indexB,
      matchedUnits: allMatches,
      addedInA,
      addedInB,
      deletedUnits,
      renamedUnits,
      conflicts,
      mergeActions,
      stats,
    };

    log.i(
      "3WAYMERGE",
      `[ThreeWayMerger] Merge completed in ${stats.mergeTimeMs}ms: ` +
        `${stats.autoMergedCount} auto-merged, ${stats.conflictCount} conflicts, ` +
        `${stats.addedFromACount + stats.addedFromBCount} added, ${stats.deletedCount} deleted, ${stats.renamedCount} renamed`,
    );

    return result;
  }

  /**
   * Phase 2: Fast Path Matching
   */
  private async fastPathMatch(
    base: VersionedIndex,
    indexA: VersionedIndex,
    indexB: VersionedIndex,
  ): Promise<{
    matchedUnits: Array<{ baseUnit: CodeUnit | null; branchAUnit: CodeUnit; branchBUnit: CodeUnit }>;
    unmatchedA: CodeUnit[];
    unmatchedB: CodeUnit[];
  }> {
    const matchedUnits: Array<{
      baseUnit: CodeUnit | null;
      branchAUnit: CodeUnit;
      branchBUnit: CodeUnit;
    }> = [];
    const unmatchedA: CodeUnit[] = [];
    const unmatchedB: CodeUnit[] = [];

    const unitsA = Array.from(indexA.units.values());
    const unitsB = Array.from(indexB.units.values());

    // Match units from branchA
    for (const unitA of unitsA) {
      const matchResult = this.fastPathMatcher.findMatch(unitA, indexB);

      if (matchResult) {
        const baseUnit = base.units.get(unitA.id) || null;
        matchedUnits.push({
          baseUnit,
          branchAUnit: unitA,
          branchBUnit: matchResult.baseUnit!,
        });
      } else {
        unmatchedA.push(unitA);
      }
    }

    // Match units from branchB (only those not yet matched)
    const matchedBIds = new Set(matchedUnits.map((m) => m.branchBUnit.id));
    for (const unitB of unitsB) {
      if (!matchedBIds.has(unitB.id)) {
        unmatchedB.push(unitB);
      }
    }

    return { matchedUnits, unmatchedA, unmatchedB };
  }

  /**
   * Phase 3: Semantic Matching
   */
  private async semanticMatch(
    base: VersionedIndex,
    unmatchedA: CodeUnit[],
    unmatchedB: CodeUnit[],
  ): Promise<Array<{ baseUnit: CodeUnit | null; branchAUnit: CodeUnit; branchBUnit: CodeUnit }>> {
    // Generate embeddings for unmatched units (lazy)
    if (this.config.embeddingGenerator) {
      const cache = new LazyEmbeddingCache(this.config.embeddingGenerator);

      await cache.generateEmbeddings(base, unmatchedA);
      await cache.generateEmbeddings(base, unmatchedB);
    }

    // Semantic matching
    const matches: Array<{
      baseUnit: CodeUnit | null;
      branchAUnit: CodeUnit;
      branchBUnit: CodeUnit;
    }> = [];

    // Create temporary index for unmatchedB
    const tempIndexB: VersionedIndex = {
      ...base,
      units: new Map(unmatchedB.map((u) => [u.id, u])),
    };

    for (const unitA of unmatchedA) {
      const matchResult = this.semanticMatcher.findMatch(unitA, tempIndexB, this.config.semanticThreshold);

      if (matchResult) {
        const baseUnit = base.units.get(unitA.id) || null;
        matches.push({
          baseUnit,
          branchAUnit: unitA,
          branchBUnit: matchResult.baseUnit!,
        });
      }
    }

    return matches;
  }

  /**
   * Phase 4: Intent Classification
   */
  private classifyIntents(
    matches: Array<{ baseUnit: CodeUnit | null; branchAUnit: CodeUnit; branchBUnit: CodeUnit }>,
  ): Map<string, { branchAIntent?: ChangeIntent | undefined; branchBIntent?: ChangeIntent }> {
    const intents = new Map<string, { branchAIntent?: ChangeIntent | undefined; branchBIntent?: ChangeIntent }>();

    for (const match of matches) {
      const branchAIntent = this.intentClassifier.classifyIntent(match.baseUnit, match.branchAUnit);
      const branchBIntent = this.intentClassifier.classifyIntent(match.baseUnit, match.branchBUnit);

      intents.set(match.branchAUnit.id, { branchAIntent, branchBIntent });
    }

    return intents;
  }

  /**
   * Phase 5: Conflict Detection
   */
  private detectConflicts(
    matches: Array<{ baseUnit: CodeUnit | null; branchAUnit: CodeUnit; branchBUnit: CodeUnit }>,
    intents: Map<string, { branchAIntent?: ChangeIntent | undefined; branchBIntent?: ChangeIntent }>,
  ): SemanticConflict[] {
    const conflictsToDetect = matches.map((match) => {
      const intentPair = intents.get(match.branchAUnit.id);
      return {
        ...match,
        branchAIntent: intentPair?.branchAIntent,
        branchBIntent: intentPair?.branchBIntent,
      };
    });

    return this.conflictDetector.detectConflicts(conflictsToDetect);
  }

  /**
   * Phase 2.5: Detect added, deleted, and renamed units
   */
  private detectAddedDeletedRenamed(
    base: VersionedIndex,
    indexA: VersionedIndex,
    indexB: VersionedIndex,
    unmatchedA: CodeUnit[],
    unmatchedB: CodeUnit[],
    renamedInA: GitFileChange[],
    renamedInB: GitFileChange[],
  ): {
    addedInA: CodeUnit[];
    addedInB: CodeUnit[];
    deletedUnits: Array<{
      baseUnit: CodeUnit;
      deletedIn: "branchA" | "branchB";
      modifiedIn?: "branchA" | "branchB" | undefined;
    }>;
    renamedUnits: Array<{ oldPath: string; newPath: string; unit: CodeUnit; branch: "branchA" | "branchB" }>;
  } {
    const addedInA: CodeUnit[] = [];
    const addedInB: CodeUnit[] = [];
    const deletedUnits: Array<{
      baseUnit: CodeUnit;
      deletedIn: "branchA" | "branchB";
      modifiedIn?: "branchA" | "branchB" | undefined;
    }> = [];
    const renamedUnits: Array<{ oldPath: string; newPath: string; unit: CodeUnit; branch: "branchA" | "branchB" }> = [];

    // Build lookup maps for renamed files
    const renameMapA = new Map(renamedInA.map((r) => [r.oldPath, r.path]));
    const renameMapB = new Map(renamedInB.map((r) => [r.oldPath, r.path]));
    const renameNewPathsA = new Set(renamedInA.map((r) => r.path));
    const renameNewPathsB = new Set(renamedInB.map((r) => r.path));

    // Detect added units in branchA (not in base, not a renamed file)
    for (const unit of unmatchedA) {
      const existsInBase = base.units.has(unit.id) || (unit.filePath && this.findUnitByPath(base, unit.filePath));

      if (!existsInBase) {
        // Check if this is a renamed file destination
        const isRenameDestination = unit.filePath && renameNewPathsA.has(unit.filePath);
        if (isRenameDestination) {
          // Find the original path
          for (const [oldPath, newPath] of renameMapA) {
            if (newPath === unit.filePath && oldPath) {
              renamedUnits.push({ oldPath, newPath, unit, branch: "branchA" });
              break;
            }
          }
        } else {
          addedInA.push(unit);
        }
      }
    }

    // Detect added units in branchB (not in base, not a renamed file)
    for (const unit of unmatchedB) {
      const existsInBase = base.units.has(unit.id) || (unit.filePath && this.findUnitByPath(base, unit.filePath));

      if (!existsInBase) {
        // Check if this is a renamed file destination
        const isRenameDestination = unit.filePath && renameNewPathsB.has(unit.filePath);
        if (isRenameDestination) {
          // Find the original path
          for (const [oldPath, newPath] of renameMapB) {
            if (newPath === unit.filePath && oldPath) {
              renamedUnits.push({ oldPath, newPath, unit, branch: "branchB" });
              break;
            }
          }
        } else {
          addedInB.push(unit);
        }
      }
    }

    // Detect deleted units (in base but not in one of the branches)
    for (const [unitId, baseUnit] of base.units) {
      const existsInA = indexA.units.has(unitId) || this.findUnitByPath(indexA, baseUnit.filePath);
      const existsInB = indexB.units.has(unitId) || this.findUnitByPath(indexB, baseUnit.filePath);

      // Check if it's a renamed file (not truly deleted)
      const isRenamedInA = renameMapA.has(baseUnit.filePath);
      const isRenamedInB = renameMapB.has(baseUnit.filePath);

      if (!existsInA && !isRenamedInA && existsInB) {
        // Deleted in branchA, check if modified in branchB
        const unitInB = indexB.units.get(unitId) || this.findUnitByPath(indexB, baseUnit.filePath);
        const modifiedInB = unitInB && unitInB.contentHash !== baseUnit.contentHash;
        deletedUnits.push({
          baseUnit,
          deletedIn: "branchA",
          ...(modifiedInB ? { modifiedIn: "branchB" as const } : {}),
        });
      } else if (!existsInB && !isRenamedInB && existsInA) {
        // Deleted in branchB, check if modified in branchA
        const unitInA = indexA.units.get(unitId) || this.findUnitByPath(indexA, baseUnit.filePath);
        const modifiedInA = unitInA && unitInA.contentHash !== baseUnit.contentHash;
        deletedUnits.push({
          baseUnit,
          deletedIn: "branchB",
          ...(modifiedInA ? { modifiedIn: "branchA" as const } : {}),
        });
      }
    }

    return { addedInA, addedInB, deletedUnits, renamedUnits };
  }

  /**
   * Find unit by file path in an index
   */
  private findUnitByPath(index: VersionedIndex, filePath: string | undefined): CodeUnit | undefined {
    if (!filePath) return undefined;
    const unitIds = index.filePathIndex.get(filePath);
    if (unitIds && unitIds.length > 0 && unitIds[0]) {
      return index.units.get(unitIds[0]);
    }
    return undefined;
  }

  /**
   * Detect delete-modify conflicts
   */
  private detectDeleteModifyConflicts(
    deletedUnits: Array<{
      baseUnit: CodeUnit;
      deletedIn: "branchA" | "branchB";
      modifiedIn?: "branchA" | "branchB" | undefined;
    }>,
  ): SemanticConflict[] {
    const conflicts: SemanticConflict[] = [];

    for (const deleted of deletedUnits) {
      if (deleted.modifiedIn) {
        // This is a delete-modify conflict
        conflicts.push({
          id: `conflict-delete-modify-${deleted.baseUnit.id}`,
          type: ConflictType.DeleteModify,
          severity: ConflictSeverity.High,
          description: `File deleted in ${deleted.deletedIn} but modified in ${deleted.modifiedIn}`,
          baseUnit: deleted.baseUnit,
          branchAUnit: deleted.baseUnit, // Use base as placeholder
          branchBUnit: deleted.baseUnit,
          conflictingRegions: [],
          autoResolvable: false,
        });
      }
    }

    return conflicts;
  }

  /**
   * Generate Merge Actions
   */
  private generateMergeActions(
    matches: Array<{ baseUnit: CodeUnit | null; branchAUnit: CodeUnit; branchBUnit: CodeUnit }>,
    conflicts: SemanticConflict[],
    addedInA: CodeUnit[],
    addedInB: CodeUnit[],
    deletedUnits: Array<{
      baseUnit: CodeUnit;
      deletedIn: "branchA" | "branchB";
      modifiedIn?: "branchA" | "branchB" | undefined;
    }>,
    renamedUnits: Array<{ oldPath: string; newPath: string; unit: CodeUnit; branch: "branchA" | "branchB" }>,
  ): MergeAction[] {
    const actions: MergeAction[] = [];
    const conflictIds = new Set(conflicts.map((c) => c.branchAUnit.id));

    // === Handle matched units ===
    for (const match of matches) {
      // If conflict exists for this unit - manual review
      if (conflictIds.has(match.branchAUnit.id)) {
        const conflict = conflicts.find((c) => c.branchAUnit.id === match.branchAUnit.id);

        actions.push({
          type: "manual-review",
          unitId: match.branchAUnit.id,
          description: `Conflict detected: ${conflict?.description}`,
          conflict,
        });
        continue;
      }

      // If both branches made identical changes - auto-merge
      if (match.branchAUnit.contentHash === match.branchBUnit.contentHash) {
        actions.push({
          type: "auto-merge",
          unitId: match.branchAUnit.id,
          description: "Identical changes in both branches",
          mergedUnit: match.branchAUnit, // Use either (they're identical)
        });
        continue;
      }

      // Default: manual review for non-identical changes
      actions.push({
        type: "manual-review",
        unitId: match.branchAUnit.id,
        description: "Different changes in both branches",
      });
    }

    // === Handle added files ===
    for (const unit of addedInA) {
      actions.push({
        type: "add-from-branchA",
        unitId: unit.id,
        description: `New file added in branchA: ${unit.filePath}`,
        mergedUnit: unit,
        sourceBranch: "branchA",
      });
    }

    for (const unit of addedInB) {
      actions.push({
        type: "add-from-branchB",
        unitId: unit.id,
        description: `New file added in branchB: ${unit.filePath}`,
        mergedUnit: unit,
        sourceBranch: "branchB",
      });
    }

    // === Handle deleted files ===
    for (const deleted of deletedUnits) {
      if (deleted.modifiedIn) {
        // Delete-modify conflict - already handled in conflicts
        actions.push({
          type: "conflict-delete-modify",
          unitId: deleted.baseUnit.id,
          description: `Conflict: deleted in ${deleted.deletedIn}, modified in ${deleted.modifiedIn}`,
        });
      } else {
        // Clean delete - no modifications in other branch
        actions.push({
          type: deleted.deletedIn === "branchA" ? "delete-from-branchA" : "delete-from-branchB",
          unitId: deleted.baseUnit.id,
          description: `File deleted in ${deleted.deletedIn}: ${deleted.baseUnit.filePath}`,
        });
      }
    }

    // === Handle renamed files ===
    for (const renamed of renamedUnits) {
      actions.push({
        type: "rename",
        unitId: renamed.unit.id,
        description: `File renamed in ${renamed.branch}: ${renamed.oldPath} -> ${renamed.newPath}`,
        mergedUnit: renamed.unit,
        renameInfo: {
          oldPath: renamed.oldPath,
          newPath: renamed.newPath,
          sourceBranch: renamed.branch,
        },
      });
    }

    return actions;
  }
}
