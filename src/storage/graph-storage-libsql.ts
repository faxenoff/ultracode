/**
 * Graph Storage LibSQL Implementation
 *
 * Implements the GraphStorage interface using LibSQLGraphAdapter.
 * Provides async API for all operations, replacing the synchronous better-sqlite3 version.
 *
 * This is the new unified storage implementation that handles both
 * graph (entities/relationships) and vector operations in a single database.
 */

import { nanoid } from "nanoid";
import xxhash from "xxhash-wasm";
import { log } from "../logging/index.js";
import { detectBaseBranch } from "../semantic/faiss/base-branch-detector.js";
import { getCurrentGitBranchOrDefault, getProjectHash, normalizeBranchName } from "../shared/storage-paths.js";
import {
  type BatchResult,
  type Entity,
  type EntityQuery,
  type EntityType,
  type FileInfo,
  type GraphQuery,
  type GraphQueryResult,
  type GraphStorage,
  type Relationship,
  type RelationshipQuery,
  RelationType,
  type StorageMetrics,
} from "../types/storage.js";
import type { LibSQLGraphAdapter, ProjectContext } from "./libsql-graph-adapter.js";

// =============================================================================
// CONSTANTS
// =============================================================================

const ID_LENGTH = 12;
const DEFAULT_QUERY_LIMIT = 100;
const MAX_QUERY_LIMIT = 50_000;
const MAX_SUBGRAPH_DEPTH = 5;

// =============================================================================
// HELPER FUNCTION
// =============================================================================

export function createProjectContext(projectPath: string, branchName?: string | null): ProjectContext {
  // Resolve branch: use provided, or detect from git with fallback to "main"
  const resolvedBranch = branchName ?? getCurrentGitBranchOrDefault(projectPath);
  const normalizedBranch = normalizeBranchName(resolvedBranch);
  const baseBranch = detectBaseBranch(projectPath);

  return {
    projectHash: getProjectHash(projectPath),
    branchName: normalizedBranch,
    // Set baseBranch for layered reads if current branch is different from base
    baseBranch: baseBranch && baseBranch !== normalizedBranch ? baseBranch : undefined,
  };
}

// =============================================================================
// GRAPH STORAGE LIBSQL IMPLEMENTATION
// =============================================================================

export class GraphStorageLibSQL implements GraphStorage {
  private adapter: LibSQLGraphAdapter;
  private xxhashInstance: Awaited<ReturnType<typeof xxhash>> | null = null;

  constructor(adapter: LibSQLGraphAdapter) {
    this.adapter = adapter;
  }

  // ===========================================================================
  // INITIALIZATION
  // ===========================================================================

  async initialize(): Promise<void> {
    const startTime = Date.now();
    log.t("STORAGE", `[GraphStorageLibSQL] ▶ initialize() START`);
    // Initialize xxHash for fast entity ID generation
    this.xxhashInstance = await xxhash();
    log.t("STORAGE", `[GraphStorageLibSQL] ◀ initialize() END (${Date.now() - startTime}ms)`);
    log.i("GRAPHSTORAGE", "init_xxhash");
  }

  // ===========================================================================
  // PROJECT CONTEXT
  // ===========================================================================

  setProjectContext(context: ProjectContext): void {
    this.adapter.setProjectContext(context);
  }

  setProject(projectPath: string, branchName?: string | null): void {
    const ctx = createProjectContext(projectPath, branchName);
    log.w("STORAGE", "setProject", {
      path: projectPath,
      hash: ctx.projectHash,
      branch: ctx.branchName,
      base: ctx.baseBranch || "none",
    });
    this.adapter.setProjectContext(ctx);
    // Load generation cache asynchronously (non-blocking)
    this.adapter.loadGenerationCache().catch((err) => {
      log.w("STORAGE", "gen_cache_load_fail", { error: (err as Error).message });
    });
  }

  getProjectContext(): ProjectContext {
    return this.adapter.getProjectContext();
  }

  // ===========================================================================
  // ENTITY OPERATIONS
  // ===========================================================================

  async insertEntity(entity: Entity): Promise<void> {
    const id = this.stableEntityId(entity);
    const now = Date.now();

    const entityWithId: Entity = {
      ...entity,
      id,
      complexityScore: entity.complexityScore ?? this.calculateComplexity(entity),
      language: entity.language ?? this.detectLanguage(entity.filePath),
      sizeBytes: entity.sizeBytes ?? 0,
      createdAt: entity.createdAt || now,
      updatedAt: entity.updatedAt || now,
    };

    await this.adapter.insertEntity(entityWithId);
  }

  async insertEntities(entities: Entity[]): Promise<BatchResult> {
    const startTime = Date.now();
    log.t("STORAGE", `[GraphStorageLibSQL] ▶ insertEntities (${entities.length} entities)`);
    const now = Date.now();

    // Deduplicate
    const seen = new Set<string>();
    const unique: Entity[] = [];
    for (const e of entities) {
      const key = this.entityKey(e);
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(e);
      }
    }

    // Add IDs and enhanced fields
    const entitiesWithIds = unique.map((entity) => ({
      ...entity,
      id: this.stableEntityId(entity),
      complexityScore: entity.complexityScore ?? this.calculateComplexity(entity),
      language: entity.language ?? this.detectLanguage(entity.filePath),
      sizeBytes: entity.sizeBytes ?? 0,
      createdAt: entity.createdAt || now,
      updatedAt: entity.updatedAt || now,
    }));

    const result = await this.adapter.insertEntities(entitiesWithIds);
    log.t("STORAGE", `insertEntities`, { count: unique.length, ms: Date.now() - startTime });
    return result;
  }

  async updateEntity(id: string, updates: Partial<Entity>): Promise<void> {
    const existing = await this.adapter.getEntity(id);
    if (!existing) {
      throw new Error(`Entity ${id} not found`);
    }

    const updated: Entity = {
      ...existing,
      ...updates,
      updatedAt: Date.now(),
      complexityScore: updates.complexityScore ?? this.calculateComplexity({ ...existing, ...updates }),
      language: updates.language ?? this.detectLanguage(updates.filePath || existing.filePath),
    };

    await this.adapter.insertEntity(updated);
  }

  async deleteEntity(id: string): Promise<void> {
    await this.adapter.deleteEntity(id);
  }

  async getEntity(id: string): Promise<Entity | null> {
    return await this.adapter.getEntity(id);
  }

  async getEntitiesBatch(ids: string[]): Promise<Map<string, Entity>> {
    return await this.adapter.getEntitiesBatch(ids);
  }

  async getEntityFromBranch(id: string, targetBranch: string): Promise<Entity | null> {
    // Temporarily switch context, get entity, switch back
    const currentContext = this.adapter.getProjectContext();
    this.adapter.setProjectContext({
      projectHash: currentContext.projectHash,
      branchName: normalizeBranchName(targetBranch),
    });

    try {
      return await this.adapter.getEntity(id);
    } finally {
      this.adapter.setProjectContext(currentContext);
    }
  }

  async findEntities(query: EntityQuery): Promise<Entity[]> {
    return await this.adapter.findEntities({
      filters: query.filters,
      limit: Math.min(query.limit || DEFAULT_QUERY_LIMIT, MAX_QUERY_LIMIT),
      offset: query.offset || 0,
    });
  }

  /**
   * Count entities by language (efficient SQL aggregation for TechnologyDetector).
   * Excludes external placeholder entities.
   */
  async countByLanguage(): Promise<Map<string, { count: number; fileCount: number }>> {
    return await this.adapter.countByLanguage();
  }

  async findEntitiesInBranch(query: EntityQuery, targetBranch: string): Promise<Entity[]> {
    const currentContext = this.adapter.getProjectContext();
    this.adapter.setProjectContext({
      projectHash: currentContext.projectHash,
      branchName: normalizeBranchName(targetBranch),
    });

    try {
      return await this.adapter.findEntities({
        filters: query.filters,
        limit: Math.min(query.limit || DEFAULT_QUERY_LIMIT, MAX_QUERY_LIMIT),
        offset: query.offset || 0,
      });
    } finally {
      this.adapter.setProjectContext(currentContext);
    }
  }

  async compareEntitiesBetweenBranches(
    namePattern: string,
    branch1: string,
    branch2: string,
  ): Promise<{
    branch1Entities: Entity[];
    branch2Entities: Entity[];
    matched: Array<[Entity, Entity]>;
  }> {
    const query: GraphQuery = {
      type: "entity",
      filters: { name: new RegExp(namePattern) },
      limit: MAX_QUERY_LIMIT,
    };

    const [entities1, entities2] = await Promise.all([
      this.findEntitiesInBranch(query, branch1),
      this.findEntitiesInBranch(query, branch2),
    ]);

    const map1 = new Map(entities1.map((e) => [this.entityKey(e), e]));
    const matched: Array<[Entity, Entity]> = [];

    for (const e2 of entities2) {
      const key = this.entityKey(e2);
      const e1 = map1.get(key);
      if (e1) {
        matched.push([e1, e2]);
      }
    }

    return { branch1Entities: entities1, branch2Entities: entities2, matched };
  }

  async getAllEntities(): Promise<Entity[]> {
    return await this.adapter.getAllEntities();
  }

  async searchEntities(options: {
    namePattern?: string | undefined;
    types?: EntityType[] | undefined;
    filePath?: string | undefined;
    limit?: number;
  }): Promise<Entity[]> {
    return await this.adapter.searchEntities(options);
  }

  /**
   * Search entities by directory path (LIKE pattern)
   */
  async searchEntitiesInDirectory(directoryPath: string): Promise<Entity[]> {
    return await this.adapter.searchEntitiesInDirectory(directoryPath);
  }

  // ===========================================================================
  // RELATIONSHIP OPERATIONS
  // ===========================================================================

  async insertRelationship(relationship: Relationship): Promise<void> {
    const id = this.stableRelationshipId(relationship);
    const now = Date.now();

    const relWithId: Relationship = {
      ...relationship,
      id,
      createdAt: relationship.createdAt ?? now,
    };

    await this.adapter.insertRelationship(relWithId);

    // Generate and insert reverse relationship for bidirectional tracing
    const reverseRels = this.generateReverseRelationships([relationship]);
    for (const rev of reverseRels) {
      const revWithId: Relationship = {
        ...rev,
        id: this.stableRelationshipId(rev),
        createdAt: now,
      };
      await this.adapter.insertRelationship(revWithId);
    }
  }

  async insertRelationships(relationships: Relationship[]): Promise<BatchResult> {
    const startTime = Date.now();
    log.t("STORAGE", `[GraphStorageLibSQL] ▶ insertRelationships (${relationships.length} relationships)`);
    const now = Date.now();

    // Deduplicate
    const seen = new Set<string>();
    const unique: Relationship[] = [];
    for (const r of relationships) {
      const key = this.relationshipKey(r);
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(r);
      }
    }

    // Generate reverse relationships for bidirectional tracing
    const reverseRelationships = this.generateReverseRelationships(unique);
    for (const r of reverseRelationships) {
      const key = this.relationshipKey(r);
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(r);
      }
    }

    // Add IDs
    const relsWithIds = unique.map((r) => ({
      ...r,
      id: this.stableRelationshipId(r),
      createdAt: r.createdAt ?? now,
    }));

    const result = await this.adapter.insertRelationships(relsWithIds);
    log.t("STORAGE", `insertRelationships`, { count: unique.length, ms: Date.now() - startTime });
    return result;
  }

  /**
   * Generate reverse relationships for bidirectional graph traversal
   * For each A → calls → B, creates B → called_by → A
   */
  private generateReverseRelationships(relationships: Relationship[]): Relationship[] {
    const reverseMap: Record<RelationType, RelationType | null> = {
      [RelationType.CALLS]: RelationType.CALLED_BY,
      [RelationType.IMPORTS]: RelationType.IMPORTED_BY,
      [RelationType.REFERENCES]: RelationType.REFERENCED_BY,
      [RelationType.EXTENDS]: RelationType.EXTENDED_BY,
      [RelationType.IMPLEMENTS]: RelationType.IMPLEMENTED_BY,
      // No reverse for these (already bidirectional or self-referential)
      [RelationType.CALLED_BY]: null,
      [RelationType.IMPORTED_BY]: null,
      [RelationType.REFERENCED_BY]: null,
      [RelationType.EXTENDED_BY]: null,
      [RelationType.IMPLEMENTED_BY]: null,
      [RelationType.EXPORTS]: null,
      [RelationType.CONTAINS]: null,
      [RelationType.DEPENDS_ON]: null,
      [RelationType.MEMBER_OF]: null,
      [RelationType.DOCUMENTS]: null,
      [RelationType.DISPATCHES_ACTION]: null,
      [RelationType.LISTENS_TO_ACTION]: null,
      [RelationType.HANDLES_ACTION]: null,
      [RelationType.SELECTS_STATE]: null,
      [RelationType.MODIFIES_STATE]: null,
      [RelationType.PRODUCES_API]: null,
      [RelationType.CONSUMES_API]: null,
      [RelationType.GENERATED_FROM]: null,
    };

    const reverse: Relationship[] = [];

    for (const r of relationships) {
      const reverseType = reverseMap[r.type];
      if (reverseType) {
        reverse.push({
          id: "", // Will be assigned by stableRelationshipId
          fromId: r.toId,
          toId: r.fromId,
          type: reverseType,
          metadata: {
            ...r.metadata,
            isReverse: true,
            originalType: r.type,
          },
        });
      }
    }

    return reverse;
  }

  async deleteRelationship(id: string): Promise<void> {
    await this.adapter.deleteRelationship(id);
  }

  async getRelationshipsForEntity(entityId: string, type?: RelationType): Promise<Relationship[]> {
    return await this.adapter.getRelationshipsForEntity(entityId, type);
  }

  async findRelationships(query: RelationshipQuery): Promise<Relationship[]> {
    return await this.adapter.findRelationships({
      filters: query.filters,
      limit: Math.min(query.limit || DEFAULT_QUERY_LIMIT, MAX_QUERY_LIMIT),
      offset: query.offset || 0,
    });
  }

  async getAllRelationships(): Promise<Relationship[]> {
    return await this.adapter.getAllRelationships();
  }

  async getRelationships(sourceId: string, type?: RelationType): Promise<Relationship[]> {
    return this.getRelationshipsForEntity(sourceId, type);
  }

  async getRelationshipsFromBranch(
    entityId: string,
    targetBranch: string,
    type?: RelationType | undefined,
  ): Promise<Relationship[]> {
    const currentContext = this.adapter.getProjectContext();
    this.adapter.setProjectContext({
      projectHash: currentContext.projectHash,
      branchName: normalizeBranchName(targetBranch),
    });

    try {
      return await this.adapter.getRelationshipsForEntity(entityId, type);
    } finally {
      this.adapter.setProjectContext(currentContext);
    }
  }

  async findIncomingRelationshipsByName(entityName: string, types?: RelationType[]): Promise<Relationship[]> {
    // Find entities with matching name
    const entities = await this.adapter.searchEntities({ namePattern: entityName });

    const results: Relationship[] = [];
    for (const entity of entities) {
      const rels = await this.adapter.getRelationshipsForEntity(entity.id);
      const incoming = rels.filter((r) => r.toId === entity.id);

      if (types && types.length > 0) {
        results.push(...incoming.filter((r) => types.includes(r.type)));
      } else {
        results.push(...incoming);
      }
    }

    return results;
  }

  // ===========================================================================
  // FILE OPERATIONS
  // ===========================================================================

  async updateFileInfo(info: FileInfo): Promise<void> {
    await this.adapter.updateFileInfo(info);
  }

  async batchUpdateFileInfo(infos: FileInfo[]): Promise<void> {
    await this.adapter.batchUpdateFileInfo(infos);
  }

  async getFileInfo(path: string): Promise<FileInfo | null> {
    return await this.adapter.getFileInfo(path);
  }

  async getOutdatedFiles(since: number): Promise<FileInfo[]> {
    return await this.adapter.getOutdatedFiles(since);
  }

  async getAllIndexedFiles(): Promise<Map<string, number>> {
    return await this.adapter.getAllIndexedFiles();
  }

  async deleteFileInfo(path: string): Promise<void> {
    await this.adapter.deleteFileInfo(path);
  }

  // ===========================================================================
  // ENTITY OPERATIONS BY FILE PATH (for incremental indexing)
  // ===========================================================================

  async getEntityIdsByFilePath(filePath: string): Promise<string[]> {
    return await this.adapter.getEntityIdsByFilePath(filePath);
  }

  async deleteEntitiesByFilePath(filePath: string): Promise<string[]> {
    return await this.adapter.deleteEntitiesByFilePath(filePath);
  }

  /**
   * Invalidate file generation (for deleted files).
   * Marks all entities for this file as stale without blocking DELETE.
   */
  async invalidateFileGeneration(filePath: string): Promise<void> {
    await this.adapter.getGenerationManager().invalidateFileGeneration(filePath);
  }

  /**
   * Run generation-based GC: clean stale entities and orphan name_tokens.
   * Call after incremental reindex completes.
   */
  async runGenerationGC(): Promise<{ entities: number; tokens: number }> {
    return await this.adapter.getGenerationManager().runFullGC();
  }

  // ===========================================================================
  // QUERY OPERATIONS
  // ===========================================================================

  async executeQuery(query: GraphQuery): Promise<GraphQueryResult> {
    const start = Date.now();

    const [entities, relationships] = await Promise.all([this.findEntities(query), this.findRelationships(query)]);

    const stats = await this.adapter.getStats();

    return {
      entities,
      relationships,
      stats: {
        totalEntities: stats.totalEntities,
        totalRelationships: stats.totalRelationships,
        queryTimeMs: Date.now() - start,
      },
    };
  }

  async getSubgraph(entityId: string, depth: number): Promise<GraphQueryResult> {
    const start = Date.now();
    const maxDepth = Math.min(depth, MAX_SUBGRAPH_DEPTH);

    const entities = new Map<string, Entity>();
    const relationships = new Map<string, Relationship>();
    const visited = new Set<string>();

    // BFS traversal
    const queue: Array<{ id: string; level: number }> = [{ id: entityId, level: 0 }];

    while (queue.length > 0) {
      const { id, level } = queue.shift()!;

      if (visited.has(id) || level > maxDepth) continue;
      visited.add(id);

      const entity = await this.adapter.getEntity(id);
      if (entity) {
        entities.set(id, entity);

        const rels = await this.adapter.getRelationshipsForEntity(id);
        for (const rel of rels) {
          relationships.set(rel.id, rel);

          if (level < maxDepth) {
            const nextId = rel.fromId === id ? rel.toId : rel.fromId;
            if (!visited.has(nextId)) {
              queue.push({ id: nextId, level: level + 1 });
            }
          }
        }
      }
    }

    return {
      entities: Array.from(entities.values()),
      relationships: Array.from(relationships.values()),
      stats: {
        totalEntities: entities.size,
        totalRelationships: relationships.size,
        queryTimeMs: Date.now() - start,
      },
    };
  }

  // ===========================================================================
  // MAINTENANCE OPERATIONS
  // ===========================================================================

  async vacuum(): Promise<void> {
    // LibSQL handles optimization automatically
    log.i("GRAPHSTORAGE", "vacuum_requested");
  }

  async analyze(): Promise<void> {
    // LibSQL handles analysis automatically
    log.i("GRAPHSTORAGE", "analyze_requested");
  }

  async getMetrics(): Promise<StorageMetrics> {
    const stats = await this.adapter.getStats();
    const memoryUsage = process.memoryUsage();

    return {
      totalEntities: stats.totalEntities,
      totalRelationships: stats.totalRelationships,
      totalFiles: stats.totalFiles,
      databaseSizeMB: 0, // Not easily available from libsql
      indexSizeMB: 0,
      cacheHitRate: 0,
      lastVacuum: 0,
      totalEmbeddings: stats.totalEmbeddings,
      vectorSearchEnabled: true,
      performanceMetricsCount: 0,
      memoryUsageMB: Math.round(memoryUsage.heapUsed / 1024 / 1024),
      concurrentConnections: 1,
      averageQueryTimeMs: 0,
    };
  }

  async getStatistics(): Promise<{ totalEntities: number; totalRelationships: number; totalFiles: number }> {
    const stats = await this.adapter.getStats();
    return {
      totalEntities: stats.totalEntities,
      totalRelationships: stats.totalRelationships,
      totalFiles: stats.totalFiles,
    };
  }

  // ===========================================================================
  // PROJECT METADATA
  // ===========================================================================

  async updateProjectMetadata(projectPath: string, isFullIndex = false): Promise<void> {
    await this.adapter.updateProjectMetadata(projectPath, isFullIndex);
  }

  /**
   * Get incremental tracking info for deciding if full rebuild is needed
   */
  async getIncrementalTrackingInfo(): Promise<{
    lastFullIndexAt: number;
    incrementalChangesCount: number;
    totalFiles: number;
  }> {
    return await this.adapter.getIncrementalTrackingInfo();
  }

  /**
   * Record incremental file changes after an incremental update
   */
  async recordIncrementalChanges(changedFileCount: number): Promise<void> {
    await this.adapter.recordIncrementalChanges(changedFileCount);
  }

  /**
   * Reset incremental tracking after a full index
   */
  async resetIncrementalTracking(): Promise<void> {
    await this.adapter.resetIncrementalTracking();
  }

  async listProjects(): Promise<
    Array<{
      projectHash: string;
      branchName: string;
      projectPath: string;
      lastIndexedAt: number;
      entityCount: number;
      fileCount: number;
    }>
  > {
    return await this.adapter.listProjects();
  }

  async listBranches(): Promise<string[]> {
    return await this.adapter.listBranches();
  }

  // ===========================================================================
  // CLEAR OPERATIONS
  // ===========================================================================

  async clear(): Promise<void> {
    await this.adapter.clear();
  }

  async clearAll(): Promise<void> {
    await this.adapter.clearAll();
  }

  async deleteProject(projectPath: string): Promise<void> {
    const currentContext = this.adapter.getProjectContext();
    const targetHash = getProjectHash(projectPath);

    // Clear for all branches of this project
    const branches = await this.adapter.listBranches();
    for (const branch of branches) {
      this.adapter.setProjectContext({ projectHash: targetHash, branchName: branch });
      await this.adapter.clear();
    }

    // Restore original context
    this.adapter.setProjectContext(currentContext);
    log.i("GRAPHSTORAGE", "project_deleted", { path: projectPath });
  }

  /**
   * Force flush all pending writes to disk.
   * Use after bulk operations to ensure data is persisted immediately.
   */
  async flush(): Promise<void> {
    await this.adapter.flush();
  }

  // ===========================================================================
  // VECTOR STORE ACCESS
  // ===========================================================================

  /**
   * Get the underlying adapter for direct vector operations
   */
  getAdapter(): LibSQLGraphAdapter {
    return this.adapter;
  }

  /**
   * Get the LibSQL adapter for Prolly Tree operations.
   * Alias for getAdapter() - used by history tools.
   */
  getLibSQLAdapter(): LibSQLGraphAdapter {
    return this.adapter;
  }

  /**
   * Get co-occurrence operations for query expansion.
   * Used by CooccurrenceIndex for term pair storage and retrieval.
   */
  getCooccurrenceOps() {
    return this.adapter.getCooccurrenceOps();
  }

  // ===========================================================================
  // HELPER METHODS
  // ===========================================================================

  private generateId(): string {
    return nanoid(ID_LENGTH);
  }

  private entityKey(e: Entity): string {
    const s = e.location?.start?.index ?? -1;
    const eIdx = e.location?.end?.index ?? -1;
    return `${e.filePath}|${e.type}|${e.name}|${s}-${eIdx}`;
  }

  private stableEntityId(e: Entity): string {
    if (!this.xxhashInstance) {
      // Fallback to nanoid if xxHash not initialized
      return this.generateId();
    }
    const key = this.entityKey(e);
    const hash = this.xxhashInstance.h64ToString(key);
    return hash.slice(0, ID_LENGTH);
  }

  private relationshipKey(r: Relationship): string {
    return `${r.fromId}|${r.toId}|${r.type}`;
  }

  private stableRelationshipId(r: Relationship): string {
    if (!this.xxhashInstance) {
      return this.generateId();
    }
    const key = this.relationshipKey(r);
    const hash = this.xxhashInstance.h64ToString(key);
    return hash.slice(0, ID_LENGTH);
  }

  private calculateComplexity(entity: Entity): number {
    let score = 1;

    switch (entity.type) {
      case "function":
        score = 2;
        break;
      case "class":
        score = 3;
        break;
      case "method":
        score = 2;
        break;
      case "interface":
        score = 2;
        break;
      default:
        score = 1;
    }

    if (entity.metadata?.parameters && Array.isArray(entity.metadata.parameters)) {
      score += Math.min(entity.metadata.parameters.length * 0.5, 3);
    }

    if (entity.metadata?.modifiers && Array.isArray(entity.metadata.modifiers)) {
      score += Math.min(entity.metadata.modifiers.length * 0.3, 2);
    }

    return Math.round(score);
  }

  private detectLanguage(filePath: string): string {
    const ext = filePath.split(".").pop()?.toLowerCase();

    const langMap: Record<string, string> = {
      ts: "typescript",
      tsx: "typescript",
      mts: "typescript",
      cts: "typescript",
      js: "javascript",
      jsx: "javascript",
      mjs: "javascript",
      cjs: "javascript",
      py: "python",
      pyi: "python",
      pyw: "python",
      java: "java",
      c: "c",
      h: "c",
      cpp: "cpp",
      cc: "cpp",
      cxx: "cpp",
      hpp: "cpp",
      hxx: "cpp",
      hh: "cpp",
      rs: "rust",
      go: "go",
      kt: "kotlin",
      kts: "kotlin",
      swift: "swift",
      css: "css",
      scss: "css",
      sass: "css",
      less: "css",
      html: "html",
      htm: "html",
      xml: "xml",
      php: "php",
      rb: "ruby",
    };

    return langMap[ext || ""] || "unknown";
  }
}
