/**
 * Layered Graph Index - Main Implementation
 *
 * Three-layer symbol index with branch awareness:
 * - Layer 0 (Base): Main branch entities, shared, immutable
 * - Layer 1 (Branch Deltas): Per-branch changes, shared, mostly immutable
 * - Layer 2 (Working Deltas): Per-client uncommitted changes [FUTURE]
 *
 * Query composition: Result = Layer0 ∪ Layer1 ∪ Layer2 - Deleted
 *
 * Based on: ultrasharp-tools-mcp LayeredSymbolIndex.cs
 * @see Dev.Docs/LAYERED_INDEXING_IMPLEMENTATION_PLAN.md
 */

import { LRUCache } from "lru-cache";
import type { BranchManager } from "../core/branch-manager.js";
import type { ILayeredIndex } from "../core/layered-index.js";
import { log } from "../logging/index.js";
import type { BranchDelta as IBranchDelta, LayeredIndexConfig, WorkingDelta } from "../types/layered.js";
import { LayeredIndexConfigPresets } from "../types/layered.js";
import type { Entity, GraphStorage, Relationship } from "../types/storage.js";
import { hashText } from "../utils/fast-hash.js";
import { BranchDelta } from "./branch-delta.js";
import { GitDeltaComputer } from "./git-delta-computer.js";
import { LayeredCacheManager } from "./layered-cache-manager.js";

// =============================================================================
// TYPE EXTENSIONS
// =============================================================================

/**
 * GraphStorage with optional extension methods
 */
interface GraphStorageWithExtensions extends GraphStorage {
  getEntityCount?(): number;
  upsertEntities?(entities: Entity[]): Promise<void>;
}

/**
 * Parsed entity from IncrementalParser
 */
interface ParsedEntity {
  name: string;
  type: string;
  location: {
    start: { line: number; column?: number };
    end: { line: number; column?: number };
  };
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
}

/**
 * Graph query object for entity search
 */
interface GraphQuery {
  filters: {
    entityType?: string;
    name?: RegExp;
    filePath?: string;
  };
  limit: number;
}

// =============================================================================
// LAYERED GRAPH INDEX CLASS
// =============================================================================

export class LayeredGraphIndex implements ILayeredIndex {
  // Layer 0: Base index (main branch, shared)
  private baseIndex: GraphStorage;

  // Layer 1: Branch deltas (per-branch, shared)
  private branchDeltaCache: LRUCache<string, BranchDelta>;

  // Layer 2: Working deltas (per-client, mutable)
  private workingDeltaCache: LRUCache<string, WorkingDelta>;

  // Configuration
  private config: LayeredIndexConfig;

  // State
  private isInitialized = false;
  private workingDirectory: string | null = null;

  // External dependencies
  private gitDeltaComputer: GitDeltaComputer | null = null;
  private cacheManager: LayeredCacheManager | null = null;
  private branchManager: BranchManager | null = null;

  constructor(baseIndex: GraphStorage, config?: Partial<LayeredIndexConfig>, branchManager?: BranchManager) {
    this.branchManager = branchManager || null;
    this.baseIndex = baseIndex;

    // Merge config with defaults
    const defaultConfig = LayeredIndexConfigPresets.default(process.cwd());
    this.config = { ...defaultConfig, ...config };

    // Initialize LRU cache for branch deltas
    this.branchDeltaCache = new LRUCache<string, BranchDelta>({
      max: this.config.maxBranchDeltas,
      dispose: (value, key) => {
        // Auto-save on eviction (if persistence enabled)
        this.onBranchDeltaEvicted(key, value);
      },
    });

    // Initialize LRU cache for working deltas (Layer 2)
    this.workingDeltaCache = new LRUCache<string, WorkingDelta>({
      max: this.config.maxWorkingDeltas || 10,
      dispose: (_value, key) => {
        log.w("LAYEREDIDX", "working_delta_evicted", { key });
      },
    });

    log.i(
      "LAYEREDIDX",
      `[LayeredGraphIndex] Initialized with max ${this.config.maxBranchDeltas} branch deltas, ` +
        `persistence: ${this.config.enablePersistence}, ` +
        `vector deltas: ${this.config.enableVectorDeltas}`,
    );
  }

  // =========================================================================
  // Layer 0: Base Index Operations
  // =========================================================================

  /**
   * Build base index from directory (Layer 0)
   */
  async buildFromDirectory(directory: string): Promise<void> {
    log.i("LAYEREDIDX", `[LayeredGraphIndex] Building base index (Layer 0) from: ${directory}`);
    this.workingDirectory = directory;

    // Use existing GraphStorage indexing logic
    // (GraphStorage already has index method via agents)
    // We'll just mark it as base layer

    log.i("LAYEREDIDX", `[LayeredGraphIndex] Base index built successfully`);

    // Initialize git delta computer
    if (this.branchManager) {
      this.gitDeltaComputer = new GitDeltaComputer(this.branchManager, this.baseIndex, directory);
      log.i("LAYEREDIDX", `[LayeredGraphIndex] GitDeltaComputer initialized`);
    }

    // Initialize cache manager for persistence
    if (this.config.enablePersistence && this.workingDirectory) {
      this.cacheManager = new LayeredCacheManager(this.workingDirectory);
      log.i("LAYEREDIDX", `[LayeredGraphIndex] LayeredCacheManager initialized`);
    }
  }

  isBuilt(): boolean {
    // Check if working directory is set (means buildFromDirectory was called)
    return this.workingDirectory !== null && this.isInitialized;
  }

  getTotalEntities(): number {
    // Use GraphStorage count if available
    const ext = this.baseIndex as GraphStorageWithExtensions;
    if (typeof ext.getEntityCount === "function") {
      return ext.getEntityCount();
    }
    return 0;
  }

  // =========================================================================
  // Layered Query Operations
  // =========================================================================

  /**
   * Query entities with three-layer merging
   *
   * Composition: Layer0 → Layer1 → Layer2 [FUTURE]
   */
  async queryEntities(branch: string | null, clientId: string | null, pattern: string): Promise<Entity[]> {
    const startTime = Date.now();

    // Layer 0: Query base index
    const layer0Results = await this.queryBaseEntities(pattern);
    const layer0Time = Date.now() - startTime;

    // Layer 1: Apply branch delta (if not main)
    let layer1Results = layer0Results;
    let layer1Time = 0;

    if (branch && !this.isMainBranch(branch)) {
      const layer1Start = Date.now();
      const branchDelta = await this.getBranchDelta(branch);

      // Fast path: skip if delta is definitely empty (bloom filter check)
      if (branchDelta && !branchDelta.isEmpty()) {
        layer1Results = branchDelta.applyToEntities(layer0Results);
      }

      layer1Time = Date.now() - layer1Start;
    }

    // Layer 2: Apply working delta
    let finalResults = layer1Results;
    let layer2Time = 0;

    if (this.config.enableWorkingDeltas && clientId && branch) {
      const layer2Start = Date.now();
      const workingDelta = await this.getWorkingDelta(clientId, branch);

      if (workingDelta) {
        // Apply working delta on top of layer 1 results
        finalResults = this.applyWorkingDeltaToEntities(workingDelta, layer1Results);
      }

      layer2Time = Date.now() - layer2Start;
    }

    const totalTime = Date.now() - startTime;

    log.i(
      "LAYEREDIDX",
      `[LayeredGraphIndex] Query '${pattern}' in branch '${branch || "main"}': ` +
        `${finalResults.length} results, ` +
        `L0=${layer0Time}ms L1=${layer1Time}ms L2=${layer2Time}ms Total=${totalTime}ms`,
    );

    return finalResults;
  }

  /**
   * Query relationships with three-layer merging
   */
  async queryRelationships(
    branch: string | null,
    clientId: string | null,
    sourceId: string,
    targetId?: string,
  ): Promise<Relationship[]> {
    // Layer 0: Query base
    const layer0Results = await this.queryBaseRelationships(sourceId, targetId);

    // Layer 1: Apply branch delta
    let layer1Results = layer0Results;
    if (branch && !this.isMainBranch(branch)) {
      const branchDelta = await this.getBranchDelta(branch);

      // Fast path: skip if delta is definitely empty (bloom filter check)
      if (branchDelta && !branchDelta.isEmpty()) {
        layer1Results = branchDelta.applyToRelationships(layer0Results);
      }
    }

    // Layer 2: Apply working delta
    if (this.config.enableWorkingDeltas && clientId && branch) {
      const workingDelta = await this.getWorkingDelta(clientId, branch);

      if (workingDelta) {
        return this.applyWorkingDeltaToRelationships(workingDelta, layer1Results);
      }
    }

    return layer1Results;
  }

  // =========================================================================
  // Layer 1: Branch Delta Management
  // =========================================================================

  /**
   * Ensure branch delta exists (create if missing)
   */
  async ensureBranchDelta(branch: string): Promise<IBranchDelta> {
    // Check cache first
    let delta = this.branchDeltaCache.get(branch);

    if (delta) {
      return delta;
    }

    // Try load from storage
    if (this.cacheManager) {
      const loadedDelta = await this.cacheManager.loadBranchDelta(branch);

      if (loadedDelta) {
        this.branchDeltaCache.set(branch, loadedDelta);
        return loadedDelta;
      }
    }

    // Compute from git diff
    if (this.gitDeltaComputer) {
      log.i("LAYEREDIDX", `[LayeredGraphIndex] Computing delta for branch: ${branch}`);
      delta = await this.gitDeltaComputer.computeDeltaFromGitDiff(branch, "main");
      this.branchDeltaCache.set(branch, delta);

      // Save to storage
      if (this.cacheManager && delta) {
        await this.cacheManager.saveBranchDelta(delta);
      }

      if (delta) {
        return delta;
      }
    }

    // Create empty delta as fallback
    log.w("LAYEREDIDX", `[LayeredGraphIndex] Creating empty delta for branch: ${branch} (no git integration)`);
    delta = new BranchDelta(branch);
    this.branchDeltaCache.set(branch, delta);

    return delta;
  }

  async getBranchDelta(branch: string): Promise<BranchDelta | null> {
    // Check cache
    const cached = this.branchDeltaCache.get(branch);
    if (cached) {
      return cached;
    }

    // Try load from storage
    if (this.cacheManager) {
      const loaded = await this.cacheManager.loadBranchDelta(branch);

      if (loaded) {
        this.branchDeltaCache.set(branch, loaded);
        return loaded;
      }
    }

    return null;
  }

  async setBranchDelta(branch: string, delta: IBranchDelta): Promise<void> {
    // Convert to BranchDelta class if needed
    const branchDelta = delta instanceof BranchDelta ? delta : BranchDelta.fromJSON(delta);

    // Update cache
    this.branchDeltaCache.set(branch, branchDelta);

    // Save to storage
    if (this.cacheManager) {
      await this.cacheManager.saveBranchDelta(branchDelta);
    }
  }

  async deleteBranchDelta(branch: string): Promise<void> {
    // Remove from cache
    this.branchDeltaCache.delete(branch);

    // Delete from storage
    if (this.cacheManager) {
      await this.cacheManager.deleteBranchDelta(branch);
    }
  }

  async getCachedBranches(): Promise<string[]> {
    const branches: string[] = [];

    // Get from cache
    for (const key of this.branchDeltaCache.keys()) {
      branches.push(key);
    }

    // Get from storage (if available)
    if (this.cacheManager) {
      const storedBranches = await this.cacheManager.getCachedBranches();
      for (const branch of storedBranches) {
        if (!branches.includes(branch)) {
          branches.push(branch);
        }
      }
    }

    return branches;
  }

  // =========================================================================
  // Layer 2: Working Delta Management [FUTURE]
  // =========================================================================

  async getWorkingDelta(clientId: string, branch: string): Promise<WorkingDelta | null> {
    const key = this.getWorkingDeltaKey(clientId, branch);
    return this.workingDeltaCache.get(key) || null;
  }

  async setWorkingDelta(clientId: string, branch: string, delta: WorkingDelta): Promise<void> {
    const key = this.getWorkingDeltaKey(clientId, branch);
    this.workingDeltaCache.set(key, delta);
  }

  async clearWorkingDelta(clientId: string, branch: string): Promise<void> {
    const key = this.getWorkingDeltaKey(clientId, branch);
    this.workingDeltaCache.delete(key);
  }

  async hasUncommittedChanges(clientId: string, branch: string): Promise<boolean> {
    const delta = await this.getWorkingDelta(clientId, branch);
    return delta ? delta.totalChanges > 0 : false;
  }

  async promoteWorkingDelta(clientId: string, branch: string): Promise<void> {
    const delta = await this.getWorkingDelta(clientId, branch);
    if (!delta || delta.totalChanges === 0) return;

    const branchDelta = await this.ensureBranchDelta(branch);
    // ensureBranchDelta returns IBranchDelta but cache stores BranchDelta class instances
    (branchDelta as BranchDelta).mergeWith(delta);

    await this.clearWorkingDelta(clientId, branch);
    log.i("LAYEREDIDX", "working_delta_promoted", { clientId, branch, changes: delta.totalChanges });
  }

  async clearAllWorkingDeltasForClient(clientId: string): Promise<void> {
    const prefix = `${clientId}:`;
    for (const key of [...this.workingDeltaCache.keys()]) {
      if (key.startsWith(prefix)) {
        this.workingDeltaCache.delete(key);
      }
    }
    log.i("LAYEREDIDX", "client_working_deltas_cleared", { clientId });
  }

  private getWorkingDeltaKey(clientId: string, branch: string): string {
    return `${clientId}:${branch}`;
  }

  // =========================================================================
  // Incremental Updates
  // =========================================================================

  async updateEntitiesFromFile(filePath: string, branch: string | null, clientId: string | null): Promise<void> {
    log.i("LAYEREDIDX", `[LayeredGraphIndex] Updating entities from file: ${filePath}`);

    try {
      // Extract entities from file
      const entities = await this.extractEntitiesFromFile(filePath);

      // Determine which layer to update
      if (clientId && branch && this.config.enableWorkingDeltas) {
        // Layer 2: Working delta (per-client uncommitted changes)
        await this.updateWorkingDelta(clientId, branch, entities, filePath);
      } else if (branch && !this.isMainBranch(branch)) {
        // Layer 1: Branch delta (committed changes in branch)
        const branchDelta = await this.ensureBranchDelta(branch);
        await this.updateBranchDeltaWithEntities(branchDelta, entities);
      } else {
        // Layer 0: Base index (main branch)
        // Use GraphStorage upsert if available, otherwise use existing methods
        const ext = this.baseIndex as GraphStorageWithExtensions;
        if (typeof ext.upsertEntities === "function") {
          await ext.upsertEntities(entities);
        } else {
          // Fallback: batch delete + batch insert
          await Promise.all(entities.map((entity) => this.baseIndex.deleteEntity(entity.id).catch(() => {})));
          await this.baseIndex.insertEntities(entities);
        }
      }

      log.i("LAYEREDIDX", `[LayeredGraphIndex] Successfully updated ${entities.length} entities from ${filePath}`);
    } catch (error) {
      log.e("LAYEREDIDX", "entity_update_fail", { err: String(error), filePath });
    }
  }

  async removeEntitiesFromFile(filePath: string, branch: string | null, clientId: string | null): Promise<void> {
    log.i("LAYEREDIDX", `[LayeredGraphIndex] Removing entities from file: ${filePath}`);

    try {
      // Get entities by file path from base index
      const entities = await this.getEntitiesByFilePath(filePath);

      // Determine which layer to update
      if (clientId && branch && this.config.enableWorkingDeltas) {
        // Layer 2: Working delta
        const delta = await this.getWorkingDelta(clientId, branch);
        if (delta) {
          for (const entity of entities) {
            delta.entityDelta.deleted.add(entity.id);
            // Remove from added/modified if present
            delta.entityDelta.added.delete(entity.id);
            delta.entityDelta.modified.delete(entity.id);
          }
          await this.setWorkingDelta(clientId, branch, delta);
        }
      } else if (branch && !this.isMainBranch(branch)) {
        // Layer 1: Branch delta
        const branchDelta = await this.getBranchDelta(branch);
        if (branchDelta) {
          for (const entity of entities) {
            branchDelta.entityDelta.deleted.add(entity.id);
            // Remove from added/modified if present
            branchDelta.entityDelta.added.delete(entity.id);
            branchDelta.entityDelta.modified.delete(entity.id);
          }
          await this.setBranchDelta(branch, branchDelta);
        }
      } else {
        // Layer 0: Base index - remove entities directly
        for (const entity of entities) {
          try {
            await this.baseIndex.deleteEntity(entity.id);
          } catch (error) {
            log.e("LAYEREDIDX", "entity_delete_fail", { err: String(error), entityId: entity.id });
          }
        }
      }

      log.i("LAYEREDIDX", `[LayeredGraphIndex] Successfully removed ${entities.length} entities from ${filePath}`);
    } catch (error) {
      log.e("LAYEREDIDX", "entity_remove_fail", { err: String(error), filePath });
    }
  }

  // =========================================================================
  // Configuration & Lifecycle
  // =========================================================================

  getConfig(): LayeredIndexConfig {
    return this.config;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    log.i("LAYEREDIDX", "[LayeredGraphIndex] Initializing...");

    // Dependencies will be initialized in buildFromDirectory when working directory is known
    // If working directory already set, initialize now
    if (this.workingDirectory) {
      if (this.branchManager && !this.gitDeltaComputer) {
        this.gitDeltaComputer = new GitDeltaComputer(this.branchManager, this.baseIndex, this.workingDirectory);
      }
      if (this.config.enablePersistence && !this.cacheManager) {
        this.cacheManager = new LayeredCacheManager(this.workingDirectory);
      }
    }

    this.isInitialized = true;
    log.i("LAYEREDIDX", "[LayeredGraphIndex] Initialized successfully");
  }

  async shutdown(): Promise<void> {
    log.i("LAYEREDIDX", "[LayeredGraphIndex] Shutting down...");

    // Save all cached deltas
    for (const [_branch, delta] of this.branchDeltaCache.entries()) {
      if (this.cacheManager) {
        await this.cacheManager.saveBranchDelta(delta);
      }
    }

    // Clear caches
    this.branchDeltaCache.clear();
    this.workingDeltaCache.clear();

    log.i("LAYEREDIDX", "[LayeredGraphIndex] Shutdown complete");
  }

  // =========================================================================
  // PRIVATE HELPER METHODS
  // =========================================================================

  /**
   * Query base index for entities
   *
   * @param pattern - Search pattern (name or type)
   * @returns Entities from base index matching pattern
   */
  private async queryBaseEntities(pattern: string): Promise<Entity[]> {
    try {
      // Build GraphQuery for entity search
      // Pattern can match:
      // - Entity name (exact or partial)
      // - Entity type

      const query: GraphQuery = {
        filters: {},
        limit: 1000, // Large limit for base query (will be filtered by deltas)
      };

      // Check if pattern matches an entity type
      const entityTypes = [
        "function",
        "class",
        "method",
        "interface",
        "type",
        "import",
        "export",
        "variable",
        "constant",
        "package",
      ];
      if (entityTypes.includes(pattern.toLowerCase())) {
        query.filters.entityType = pattern.toLowerCase();
      } else {
        // Search by name (partial match with LIKE)
        query.filters.name = new RegExp(`.*${pattern}.*`, "i");
      }

      return await this.baseIndex.findEntities(query as any);
    } catch (error) {
      log.e("LAYEREDIDX", "base_query_fail", { err: String(error) });
      return [];
    }
  }

  /**
   * Query base index for relationships
   *
   * @param sourceId - Source entity ID
   * @param targetId - Target entity ID (optional)
   * @returns Relationships from base index
   */
  private async queryBaseRelationships(sourceId: string, targetId?: string): Promise<Relationship[]> {
    try {
      // Get all relationships for the source entity
      const relationships = await this.baseIndex.getRelationshipsForEntity(sourceId);

      // Filter by target ID if specified
      if (targetId) {
        return relationships.filter((rel: Relationship) => rel.toId === targetId || rel.fromId === targetId);
      }

      return relationships;
    } catch (error) {
      log.e("LAYEREDIDX", "rel_query_fail", { err: String(error) });
      return [];
    }
  }

  /**
   * Check if branch is main/master
   */
  private isMainBranch(branch: string): boolean {
    return branch === "main" || branch === "master";
  }

  /**
   * Callback when branch delta is evicted from LRU cache
   */
  private onBranchDeltaEvicted(branch: string, delta: BranchDelta): void {
    if (!this.config.enablePersistence || !this.cacheManager) {
      return;
    }

    log.i("LAYEREDIDX", `[LayeredGraphIndex] Branch delta evicted from cache, saving: ${branch}`);

    // Async save (don't block eviction)
    this.cacheManager
      .saveBranchDelta(delta)
      .catch((err: Error) => log.e("LAYEREDIDX", "delta_save_fail", { err: String(err) }));
  }

  /**
   * Extract entities from file
   */
  private async extractEntitiesFromFile(filePath: string): Promise<Entity[]> {
    try {
      const { readFileSync, existsSync } = await import("node:fs");
      const { join } = await import("node:path");

      const fullPath = this.workingDirectory ? join(this.workingDirectory, filePath) : filePath;

      if (!existsSync(fullPath)) {
        log.w("LAYEREDIDX", `[LayeredGraphIndex] File not found: ${fullPath}`);
        return [];
      }

      const content = readFileSync(fullPath, "utf-8");

      // Use IncrementalParser to extract entities
      const { IncrementalParser } = await import("../parsers/incremental-parser.js");
      const parser = new IncrementalParser();
      await parser.initialize();

      const parseResult = await parser.parseFile(fullPath, content);

      // Convert ParsedEntity to Entity format
      return this.convertParsedEntitiesToEntities(parseResult.entities as any, filePath);
    } catch (error) {
      log.e("LAYEREDIDX", "extract_fail", { err: String(error), filePath });
      return [];
    }
  }

  /**
   * Convert ParsedEntity to Entity format
   */
  private convertParsedEntitiesToEntities(parsedEntities: ParsedEntity[], filePath: string): Entity[] {
    const entities: Entity[] = [];
    const now = Date.now();

    for (const parsed of parsedEntities) {
      try {
        // Generate stable ID
        const idContent = `${filePath}:${parsed.type}:${parsed.name}:${parsed.location.start.line}`;
        const id = hashText(idContent).slice(0, 16);

        // Generate entity hash
        const hashContent = JSON.stringify({
          name: parsed.name,
          type: parsed.type,
          location: parsed.location,
          metadata: parsed.metadata,
        });
        const hash = hashText(hashContent).slice(0, 16);

        const entity: Entity = {
          id,
          name: parsed.name,
          type: parsed.type as any,
          filePath,
          location: parsed.location as any,
          metadata: parsed.metadata || {},
          hash,
          createdAt: now,
          updatedAt: now,
        };

        entities.push(entity);
      } catch (error) {
        log.e("LAYEREDIDX", "entity_convert_fail", { err: String(error), name: parsed.name });
      }
    }

    return entities;
  }

  /**
   * Update working delta with new entities
   */
  private async updateWorkingDelta(
    clientId: string,
    branch: string,
    entities: Entity[],
    _filePath: string,
  ): Promise<void> {
    // Get or create working delta
    const deltaOrNull = await this.getWorkingDelta(clientId, branch);

    const delta: WorkingDelta = deltaOrNull || {
      clientId,
      branchName: branch,
      entityDelta: {
        added: new Map(),
        modified: new Map(),
        deleted: new Set(),
      },
      relationshipDelta: {
        added: new Map(),
        modified: new Map(),
        deleted: new Set(),
      },
      lastModified: Date.now(),
      get totalChanges(): number {
        return this.entityDelta.added.size + this.entityDelta.modified.size + this.entityDelta.deleted.size;
      },
    };

    // Update delta with new entities
    for (const entity of entities) {
      // Check if entity exists in base
      const existsInBase = await this.entityExistsInBase(entity.id);

      if (existsInBase) {
        // Modified entity
        delta.entityDelta.modified.set(entity.id, entity);
        // Remove from deleted if present
        delta.entityDelta.deleted.delete(entity.id);
      } else {
        // New entity
        delta.entityDelta.added.set(entity.id, entity);
      }
    }

    delta.lastModified = Date.now();

    // Save updated delta
    await this.setWorkingDelta(clientId, branch, delta);

    log.i(
      "LAYEREDIDX",
      `[LayeredGraphIndex] Updated working delta for client ${clientId}, branch ${branch}: ${delta.totalChanges} total changes`,
    );
  }

  /**
   * Update branch delta with new entities
   */
  private async updateBranchDeltaWithEntities(branchDelta: IBranchDelta, entities: Entity[]): Promise<void> {
    for (const entity of entities) {
      // Check if entity exists in base
      const existsInBase = await this.entityExistsInBase(entity.id);

      if (existsInBase) {
        // Modified entity
        if (branchDelta.entityDelta?.modified) {
          branchDelta.entityDelta.modified.set(entity.id, entity);
        }
        // Remove from deleted if present
        if (branchDelta.entityDelta?.deleted) {
          branchDelta.entityDelta.deleted.delete(entity.id);
        }
      } else {
        // New entity
        if (branchDelta.entityDelta?.added) {
          branchDelta.entityDelta.added.set(entity.id, entity);
        }
      }
    }

    log.i("LAYEREDIDX", `[LayeredGraphIndex] Updated branch delta: ${branchDelta.totalChanges} total changes`);
  }

  /**
   * Check if entity exists in base index
   */
  private async entityExistsInBase(entityId: string): Promise<boolean> {
    try {
      const entity = await this.baseIndex.getEntity(entityId);
      return entity !== null;
    } catch (_error) {
      return false;
    }
  }

  /**
   * Get entities by file path from base index
   */
  private async getEntitiesByFilePath(filePath: string): Promise<Entity[]> {
    try {
      // Query all entities from base index and filter by file path
      const query: GraphQuery = {
        filters: { filePath },
        limit: 10000,
      };

      return await this.baseIndex.findEntities(query as any);
    } catch (error) {
      log.e("LAYEREDIDX", "path_query_fail", { err: String(error), filePath });
      return [];
    }
  }

  /**
   * Apply working delta to entities (Layer 2 composition)
   */
  private applyWorkingDeltaToEntities(workingDelta: WorkingDelta, baseResults: Entity[]): Entity[] {
    const result: Entity[] = [];
    // O(n) deduplication using Set instead of O(n²) .find() in loop
    const seenIds = new Set<string>();

    // Start with base results (Layer 0 + Layer 1)
    for (const entity of baseResults) {
      // Skip deleted entities
      if (workingDelta.entityDelta.deleted.has(entity.id)) {
        continue;
      }

      // Replace with modified version if present
      const modified = workingDelta.entityDelta.modified.get(entity.id);
      if (modified) {
        result.push(modified);
        seenIds.add(modified.id);
      } else {
        result.push(entity);
        seenIds.add(entity.id);
      }
    }

    // Add new entities from working delta
    for (const addedEntity of workingDelta.entityDelta.added.values()) {
      // O(1) lookup instead of O(n) .find()
      if (!seenIds.has(addedEntity.id)) {
        seenIds.add(addedEntity.id);
        result.push(addedEntity);
      }
    }

    return result;
  }

  /**
   * Apply working delta to relationships (Layer 2 composition)
   */
  private applyWorkingDeltaToRelationships(workingDelta: WorkingDelta, baseResults: Relationship[]): Relationship[] {
    const result: Relationship[] = [];
    // O(n) deduplication using Set instead of O(n²) .find() in loop
    const seenIds = new Set<string>();

    // Start with base results (Layer 0 + Layer 1)
    for (const rel of baseResults) {
      // Skip deleted relationships
      if (workingDelta.relationshipDelta.deleted.has(rel.id)) {
        continue;
      }

      result.push(rel);
      seenIds.add(rel.id);
    }

    // Add new relationships from working delta
    for (const addedRel of workingDelta.relationshipDelta.added.values()) {
      // O(1) lookup instead of O(n) .find()
      if (!seenIds.has(addedRel.id)) {
        seenIds.add(addedRel.id);
        result.push(addedRel);
      }
    }

    return result;
  }
}
