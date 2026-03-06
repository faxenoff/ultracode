import type { ConductorOrchestrator } from "../../agents/conductor-orchestrator.js";
import { getOrCreateAgent } from "../../core/agent-registry.js";
import type { BranchManager } from "../../core/branch-manager.js";
import { getGlobalContainer } from "../../core/di-container.js";
import { log } from "../../logging/index.js";
import type { Agent } from "../../types/agent.js";
import { AgentType } from "../../types/agent.js";
import type { GitIntegration } from "../integration/git-integration.js";
import type { CodeUnit, CodeUnitType } from "../models/code-unit.js";
import type { VersionedIndex } from "../models/versioned-index.js";

// =============================================================================
// TYPE EXTENSIONS FOR INTERNAL APIS
// =============================================================================

/**
 * Task params for DevAgent indexing
 */
interface IndexCodebaseParams {
  directory: string;
  incremental: boolean;
  fullScan: boolean;
  excludePatterns: string[];
  reset: boolean;
}

/**
 * Result from DevAgent indexing
 */
interface DevAgentIndexResult {
  entities?: DevAgentEntity[];
  [key: string]: unknown;
}

/**
 * DevAgent with execute method
 */
interface DevAgentWithExecute extends Agent {
  execute?(params: { task: string; params: IndexCodebaseParams }): Promise<DevAgentIndexResult>;
}

/**
 * Entity from DevAgent
 */
interface DevAgentEntity {
  id: string;
  type: string;
  filePath?: string;
  name?: string;
  fullyQualifiedName?: string;
  startLine?: number;
  endLine?: number;
  content?: string;
  structuralHash?: string;
  signature?: string;
  language?: string;
  parentId?: string;
  childIds?: string[];
  metadata?: Record<string, unknown>;
}

/**
 * ConductorOrchestrator with GraphStorage accessor
 */
interface ConductorWithStorage extends ConductorOrchestrator {
  getGraphStorage?(): GraphStorage | null;
}

/**
 * GraphStorage interface
 */
interface GraphStorage {
  getAllEntities?(): Promise<DevAgentEntity[]>;
  [key: string]: unknown;
}

/**
 * VersionedIndex with temporary cache flag
 */
interface VersionedIndexWithCache extends VersionedIndex {
  _fromCache?: boolean;
}

/**
 * Multi-Version Indexer - Parallel indexing for 3-way merge
 *
 * Indexes base + branchA + branchB in sequence:
 * 1. Save current branch
 * 2. Checkout and index each branch
 * 3. Cache indexes in per-branch databases
 * 4. Restore original branch
 *
 * Supports incremental indexing (only changed files).
 */

// =============================================================================
// 1. TYPES AND INTERFACES
// =============================================================================

export interface MultiVersionIndexResult {
  base: VersionedIndex;
  branchA: VersionedIndex;
  branchB: VersionedIndex;
  mergeBase: string; // Common ancestor commit hash
  stats: {
    totalUnits: number;
    totalFiles: number;
    indexingTimeMs: number;
    cacheHits: number; // How many branches loaded from cache
  };
}

export interface IndexingOptions {
  incremental?: boolean; // Use incremental indexing (default: true)
  fullScan?: boolean; // Force full scan even if cache exists (default: false)
  excludePatterns?: string[]; // Patterns to exclude from indexing
  reset?: boolean; // Reset databases before indexing (default: false)
}

// =============================================================================
// 2. MULTI-VERSION INDEXER IMPLEMENTATION
// =============================================================================

export class MultiVersionIndexer {
  private branchManager: BranchManager;
  private gitIntegration: GitIntegration;
  private conductor: ConductorOrchestrator | null;

  constructor(branchManager: BranchManager, gitIntegration: GitIntegration, conductor: ConductorOrchestrator | null) {
    this.branchManager = branchManager;
    this.gitIntegration = gitIntegration;
    this.conductor = conductor;
  }

  /**
   * Index 3 branches for merge: base, branchA, branchB
   *
   * This is the main entry point for Phase 4.
   */
  async indexThreeBranches(
    branchA: string,
    branchB: string,
    options: IndexingOptions = {},
  ): Promise<MultiVersionIndexResult> {
    const startTime = Date.now();
    let cacheHits = 0;

    log.i("MULTIVIDX", `[MultiVersionIndexer] Starting 3-way indexing: ${branchA} + ${branchB}`);

    try {
      // 1. Find merge base (common ancestor)
      const mergeBase = this.gitIntegration.getMergeBase(branchA, branchB);
      if (!mergeBase) {
        throw new Error(`No merge base found between ${branchA} and ${branchB}`);
      }

      log.i("MULTIVIDX", `[MultiVersionIndexer] Merge base: ${mergeBase.slice(0, 8)}`);

      // 2. Index base commit
      const baseIndex = await this.indexBranch(mergeBase, "base", options);
      if (this.wasCacheHit(baseIndex)) cacheHits++;

      // 3. Index branchA
      const branchAIndex = await this.indexBranch(branchA, branchA, options);
      if (this.wasCacheHit(branchAIndex)) cacheHits++;

      // 4. Index branchB
      const branchBIndex = await this.indexBranch(branchB, branchB, options);
      if (this.wasCacheHit(branchBIndex)) cacheHits++;

      // 5. Restore original branch
      await this.gitIntegration.restoreOriginalBranch();

      // 6. Compute statistics
      const totalUnits = baseIndex.stats.totalUnits + branchAIndex.stats.totalUnits + branchBIndex.stats.totalUnits;

      const totalFiles =
        (baseIndex.stats.byFile?.size || 0) +
        (branchAIndex.stats.byFile?.size || 0) +
        (branchBIndex.stats.byFile?.size || 0);

      const indexingTimeMs = Date.now() - startTime;

      log.i("MULTIVIDX", `[MultiVersionIndexer] Completed in ${indexingTimeMs}ms`);
      log.i("MULTIVIDX", `[MultiVersionIndexer] Total units: ${totalUnits}, Cache hits: ${cacheHits}/3`);

      return {
        base: baseIndex,
        branchA: branchAIndex,
        branchB: branchBIndex,
        mergeBase,
        stats: {
          totalUnits,
          totalFiles,
          indexingTimeMs,
          cacheHits,
        },
      };
    } catch (error) {
      // Cleanup on error
      await this.gitIntegration.cleanup();
      throw error;
    }
  }

  /**
   * Index a single branch
   *
   * Strategy:
   * 1. Check if branch DB exists and is up-to-date
   * 2. If yes → load from cache
   * 3. If no → checkout branch, run full index, save to cache
   */
  private async indexBranch(branch: string, label: string, options: IndexingOptions): Promise<VersionedIndex> {
    log.i("MULTIVIDX", `[MultiVersionIndexer] Indexing ${label}...`);

    // Check if we can use cached index
    if (!options.fullScan && !options.reset) {
      const cachedIndex = await this.loadCachedIndex(branch);
      if (cachedIndex) {
        log.i("MULTIVIDX", `[MultiVersionIndexer] Loaded ${label} from cache`);
        return cachedIndex;
      }
    }

    // Need to index from scratch
    const startTime = Date.now();

    // 1. Checkout branch
    await this.gitIntegration.checkoutBranch(branch);

    // 2. Get DevAgent for indexing
    if (!this.conductor) {
      throw new Error("ConductorOrchestrator is required for fresh indexing");
    }
    const container = getGlobalContainer();
    const devAgent = await getOrCreateAgent(container, this.conductor, AgentType.DEV);

    // 3. Run indexing
    const index = await this.runIndexing(devAgent, branch, options);

    // 4. Save to cache
    await this.saveCachedIndex(branch, index);

    const elapsed = Date.now() - startTime;
    log.i("MULTIVIDX", `[MultiVersionIndexer] Indexed ${label} in ${elapsed}ms (${index.stats.totalUnits} units)`);

    return index;
  }

  /**
   * Run actual indexing using DevAgent
   */
  private async runIndexing(
    devAgent: DevAgentWithExecute,
    branch: string,
    options: IndexingOptions,
  ): Promise<VersionedIndex> {
    // Get current repo path from git integration using public getter
    const repoPath = this.gitIntegration.repoPath;

    // Use DevAgent to perform indexing
    const result = await devAgent.execute?.({
      task: "index_codebase",
      params: {
        directory: repoPath,
        incremental: options.incremental ?? true,
        fullScan: options.fullScan ?? false,
        excludePatterns: options.excludePatterns || [],
        reset: options.reset ?? false,
      },
    });

    // Build VersionedIndex from DevAgent result
    const index: VersionedIndex = {
      branch,
      indexedAt: new Date(),
      units: new Map(),
      contentHashIndex: new Map(),
      structuralHashIndex: new Map(),
      signatureIndex: new Map(),
      filePathIndex: new Map(),
      stats: {
        totalUnits: 0,
        byType: new Map(),
        byLanguage: new Map(),
        byFile: new Map(),
      },
    };

    // Populate index from DevAgent result if available
    if (result?.entities) {
      for (const entity of result.entities) {
        const codeUnit = this.entityToCodeUnit(entity);
        this.addUnitToIndex(index, codeUnit);
      }
    } else {
      // Fallback: load from GraphStorage via conductor
      await this.populateIndexFromStorage(index);
    }

    return index;
  }

  /**
   * Convert entity from DevAgent to CodeUnit
   */
  private entityToCodeUnit(entity: DevAgentEntity): CodeUnit {
    const { ContentNormalizer } = require("./content-normalizer.js");
    const normalizer = new ContentNormalizer();

    const content = entity.content || "";
    const contentHash = normalizer.computeContentHash(content);

    return {
      id: entity.id,
      type: this.mapEntityType(entity.type),
      filePath: entity.filePath || "",
      name: entity.name || "",
      fullyQualifiedName: entity.fullyQualifiedName || entity.name || "",
      startLine: entity.startLine || 1,
      endLine: entity.endLine || 1,
      content,
      contentHash,
      structuralHash: entity.structuralHash || contentHash,
      signature: entity.signature,
      language: entity.language || "unknown",
      parentId: entity.parentId,
      childIds: entity.childIds || [],
      metadata: entity.metadata || {},
    };
  }

  /**
   * Map entity type string to CodeUnitType
   */
  private mapEntityType(type: string): CodeUnitType {
    const { CodeUnitType } = require("../models/code-unit.js");
    const typeMap: Record<string, CodeUnitType> = {
      file: CodeUnitType.File,
      module: CodeUnitType.Module,
      class: CodeUnitType.Class,
      interface: CodeUnitType.Interface,
      function: CodeUnitType.Function,
      method: CodeUnitType.Method,
      property: CodeUnitType.Property,
    };
    return typeMap[type?.toLowerCase()] || CodeUnitType.Block;
  }

  /**
   * Add a CodeUnit to the index with all hash indexes
   */
  private addUnitToIndex(index: VersionedIndex, unit: CodeUnit): void {
    // Add to main units map
    index.units.set(unit.id, unit);

    // Add to contentHash index
    if (!index.contentHashIndex.has(unit.contentHash)) {
      index.contentHashIndex.set(unit.contentHash, []);
    }
    index.contentHashIndex.get(unit.contentHash)!.push(unit.id);

    // Add to structuralHash index
    if (!index.structuralHashIndex.has(unit.structuralHash)) {
      index.structuralHashIndex.set(unit.structuralHash, []);
    }
    index.structuralHashIndex.get(unit.structuralHash)!.push(unit.id);

    // Add to signature index if available
    if (unit.signature) {
      if (!index.signatureIndex.has(unit.signature)) {
        index.signatureIndex.set(unit.signature, []);
      }
      index.signatureIndex.get(unit.signature)!.push(unit.id);
    }

    // Add to filePath index
    if (!index.filePathIndex.has(unit.filePath)) {
      index.filePathIndex.set(unit.filePath, []);
    }
    index.filePathIndex.get(unit.filePath)!.push(unit.id);

    // Update stats
    index.stats.totalUnits++;
    index.stats.byType.set(unit.type, (index.stats.byType.get(unit.type) || 0) + 1);
    index.stats.byLanguage.set(unit.language, (index.stats.byLanguage.get(unit.language) || 0) + 1);
    index.stats.byFile.set(unit.filePath, (index.stats.byFile.get(unit.filePath) || 0) + 1);
  }

  /**
   * Populate index from GraphStorage (fallback when DevAgent result is unavailable)
   */
  private async populateIndexFromStorage(index: VersionedIndex): Promise<void> {
    try {
      // Get GraphStorage from conductor
      const storage = (this.conductor as ConductorWithStorage).getGraphStorage?.();
      if (!storage) {
        log.w("MULTIVIDX", "[MultiVersionIndexer] GraphStorage not available for fallback");
        return;
      }

      // Load all entities from storage
      const entities = await storage.getAllEntities?.();
      if (!entities || entities.length === 0) {
        log.w("MULTIVIDX", "[MultiVersionIndexer] No entities found in GraphStorage");
        return;
      }

      for (const entity of entities) {
        const codeUnit = this.entityToCodeUnit(entity);
        this.addUnitToIndex(index, codeUnit);
      }

      log.i("MULTIVIDX", "storage_loaded", { units: index.stats.totalUnits });
    } catch (error) {
      log.e("MULTIVIDX", "storage_populate_fail", { err: String(error) });
    }
  }

  /**
   * Load cached index for a branch
   */
  private async loadCachedIndex(branch: string): Promise<VersionedIndex | null> {
    try {
      // Check if branch database exists
      if (!this.branchManager.hasBranchDatabase(branch)) {
        return null;
      }

      // Get branch metadata
      const metadata = this.branchManager.getBranchMetadata(branch);
      if (!metadata) {
        return null;
      }

      // Check if index is up-to-date
      const currentCommit = this.gitIntegration.getCommitHash(branch);
      if (metadata.lastCommitHash !== currentCommit) {
        log.i(
          "MULTIVIDX",
          `[MultiVersionIndexer] Cache outdated for ${branch} (${metadata.lastCommitHash?.slice(0, 8)} vs ${currentCommit.slice(0, 8)})`,
        );
        return null;
      }

      // Load index from database
      const index: VersionedIndex = {
        branch,
        indexedAt: new Date(metadata.lastIndexedAt),
        units: new Map(),
        contentHashIndex: new Map(),
        structuralHashIndex: new Map(),
        signatureIndex: new Map(),
        filePathIndex: new Map(),
        stats: {
          totalUnits: 0,
          byType: new Map(),
          byLanguage: new Map(),
          byFile: new Map(),
        },
      };

      // BranchManager provides getBranchDbPath but not direct database access
      // For cached indexes, we use metadata counts
      // Full entity loading happens during fresh indexing via populateIndexFromStorage
      index.stats.totalUnits = metadata.entityCount;

      // Mark as cache hit
      (index as VersionedIndexWithCache)._fromCache = true;

      return index;
    } catch (error) {
      log.e("MULTIVIDX", "cache_load_fail", { branch, err: String(error) });
      return null;
    }
  }

  /**
   * Save index to branch cache
   */
  private async saveCachedIndex(branch: string, index: VersionedIndex): Promise<void> {
    try {
      // Use public getter for repoPath
      const repoPath = this.gitIntegration.repoPath;
      const commitHash = this.gitIntegration.getCommitHash(branch);
      const repoHash = this.branchManager.getRepositoryHash(repoPath);

      // Update branch metadata
      this.branchManager.updateBranchMetadata({
        branch,
        repositoryPath: repoPath,
        repositoryHash: repoHash,
        lastCommitHash: commitHash,
        lastIndexedAt: Date.now(),
        fileCount: index.stats.byFile?.size || 0,
        entityCount: index.stats.totalUnits,
        relationshipCount: 0,
        indexVersion: "1.0.0",
        accessedAt: Date.now(),
      });

      log.i("MULTIVIDX", "cache_saved", { branch, commit: commitHash.slice(0, 8) });
    } catch (error) {
      log.e("MULTIVIDX", "cache_save_fail", { branch, err: String(error) });
    }
  }

  /**
   * Check if index was loaded from cache
   */
  private wasCacheHit(index: VersionedIndex): boolean {
    return (index as VersionedIndexWithCache)._fromCache === true;
  }
}
