/**
 * TASK-001: Indexer Agent Implementation
 *
 * Core indexer agent responsible for storing and querying the code graph.
 * Subscribes to parse events and maintains the graph database.
 *

        storageEntities.push(entity);
        validParsed.push(parsed); * Architecture References:
 * - Base Agent: src/agents/base.ts
 * - Agent Types: src/types/agent.ts
 * - Storage Types: src/types/storage.ts
 * - Knowledge Bus: src/core/knowledge-bus.ts
 */

import { nanoid } from "nanoid";
// p-map removed - was used for handleParseBatchComplete which is now disabled
import { getConfig } from "../config/yaml-config.js";
import { BranchManager } from "../core/branch-manager.js";
import { createFileWatcher, type FileChangeEvent, type FileWatcher } from "../core/file-watcher.js";
import { GitWatcher } from "../core/git-watcher.js";
import { knowledgeBus } from "../core/knowledge-bus.js";
import { log, logMemory } from "../logging/index.js";
import { getRepoIdentity } from "../shared/git-worktree.js";
import { getDataDir } from "../shared/storage-paths.js";
import { BatchOperationsLibSQL } from "../storage/batch-operations-libsql.js";
import { getCacheManager, QueryCacheManager } from "../storage/cache-manager.js";
import { getGraphStorage, getLibSQLAdapter } from "../storage/graph-storage-factory.js";
import { invalidateAndPreload } from "../tracing/graph-cache.js";
// SQLiteManager removed - using libsql via GraphStorage
import { type AgentMessage, type AgentTask, AgentType } from "../types/agent.js";
import type { EntityRelationship, ParsedEntity } from "../types/parser.js";
import type {
  BatchResult,
  Entity,
  EntityChange,
  FileInfo,
  GraphQuery,
  GraphQueryResult,
  GraphStorage,
  Relationship,
} from "../types/storage.js";
import { finalizeEntity, flattenParsedEntities, parsedEntityToEntity, type RelationType } from "../types/storage.js";
import { hashText } from "../utils/fast-hash.js";
import { sleep, tryGarbageCollect } from "../utils/runtime-detection.js";
import { BaseAgent } from "./base.js";
import { addEntitiesToNameMap, buildEntityNameMap, resolveByNameAndLine } from "./indexer/entity-resolution.js";
import { processExternalRelationships } from "./indexer/external-placeholder.js";
import {
  type EmbeddingSchedulerContext,
  type GitEventContext,
  handleBranchChange as handleBranchChangeEvent,
  handleDebouncedEmbeddingGeneration as handleDebouncedEmbeddingEvent,
  handleUncommittedChanges as handleUncommittedChangesEvent,
  scheduleEmbeddingGeneration,
  triggerEmbeddingGeneration,
} from "./indexer/git-event-handlers.js";
// Import from extracted modules
import { buildRelationships } from "./indexer/relationship-builder.js";
import { initXXHash, stableEntityId, stableRelationshipId } from "./indexer/stable-id.js";

// =============================================================================
// 2. CONSTANTS AND CONFIGURATION
// =============================================================================
function getIndexerConfig() {
  const config = getConfig();
  return {
    maxConcurrency: config.indexer?.maxConcurrency ?? 8,
    memoryLimit: config.indexer?.memoryLimit ?? 512,
    priority: config.indexer?.priority ?? 7,
    batchSize: config.indexer?.batchSize ?? 1000,
    // OPTIMIZATION: Increased cache size from 50MB to 100MB for better performance
    cacheSize: config.indexer?.cacheSize ?? 100 * 1024 * 1024,
    cacheTTL: config.indexer?.cacheTTL ?? 5 * 60 * 1000,
  };
}

// =============================================================================
// 3. INDEXER TASK TYPES
// =============================================================================

interface ProvidedRelationship {
  from: string;
  to: string;
  type: RelationType | string;
  sourceFile?: string | undefined;
  targetFile?: string | undefined;
  metadata?: { line?: number | undefined; [k: string]: unknown } | undefined;
}

export interface IndexerTask extends AgentTask {
  type: "index:entities" | "index:incremental" | "query:graph" | "query:subgraph";
  payload: {
    entities?: ParsedEntity[];
    filePath?: string | undefined;
    changes?: EntityChange[];
    query?: GraphQuery;
    entityId?: string | undefined;
    depth?: number;
    relationships?: EntityRelationship[] | undefined;
  };
}

// =============================================================================
// 4. INDEXER AGENT IMPLEMENTATION
// =============================================================================

/**
 * Indexing lock coordination per repoIdentity:branch.
 * Prevents duplicate indexing when multiple worktrees of the same repo
 * try to index the same branch simultaneously.
 */
const indexingLocks = new Map<string, Promise<void>>();

/**
 * Acquire an indexing lock for a project path + branch combination.
 * Uses repoIdentity (from git-common-dir) for worktree-aware locking.
 * If another indexing operation is in progress for the same repo:branch,
 * waits for it to complete and returns false (skip — data is already fresh).
 * Returns true if the lock was acquired (caller should proceed with indexing).
 */
export async function acquireIndexLockForProject(
  projectPath: string,
  branch: string,
): Promise<{ acquired: boolean; release: () => void }> {
  const repoId = getRepoIdentity(projectPath) ?? projectPath;
  return acquireIndexLock(repoId, branch);
}

/** @internal Lock by explicit repoIdentity:branch key */
export async function acquireIndexLock(
  repoIdentity: string,
  branch: string,
): Promise<{ acquired: boolean; release: () => void }> {
  const key = `${repoIdentity}:${branch}`;
  const existing = indexingLocks.get(key);

  if (existing) {
    // Another worktree is already indexing this branch — wait and skip
    log.i("INDEXER", "lock_wait", { key });
    await existing;
    return { acquired: false, release: () => {} };
  }

  // Acquire lock
  let releaseFn: () => void;
  const lockPromise = new Promise<void>((resolve) => {
    releaseFn = () => {
      indexingLocks.delete(key);
      resolve();
    };
  });
  indexingLocks.set(key, lockPromise);
  log.t("INDEXER", "lock_acquired", { key });

  return { acquired: true, release: releaseFn! };
}

export class IndexerAgent extends BaseAgent {
  private graphStorage!: GraphStorage;
  private batchOps!: BatchOperationsLibSQL;
  private cacheManager!: QueryCacheManager;
  private branchManager: BranchManager | null = null;
  /** Per-project GitWatchers — each project gets its own watcher */
  private gitWatchers = new Map<string, GitWatcher>();
  private fileWatcher: FileWatcher | null = null;

  // Debounced embedding generation
  private pendingEmbeddingGeneration = false;
  private embeddingDebounceAbort: AbortController | null = null;
  private readonly EMBEDDING_DEBOUNCE_MS = 60_000; // 1 minute
  private currentRepositoryPath: string | null = null;
  private subscriptionIds: string[] = [];
  private ready = false;
  private lastFileWatcherError: string | null = null;
  private indexingStats = {
    entitiesIndexed: 0,
    relationshipsCreated: 0,
    filesProcessed: 0,
    totalIndexTime: 0,
    lastIndexTime: 0,
  };

  // Batch accumulator for streaming indexing optimization
  // Accumulates entities/relationships and flushes in batches to reduce DB operations
  private batchFlushThreshold = 270; // Adaptive: set via setTotalFiles() based on project size
  private entityFlushThreshold = 15_000; // Primary threshold: entity count triggers flush
  private pendingStorageEntities: Entity[] = [];
  private pendingRelationships: Relationship[] = [];
  private pendingParsedEntities: Array<{ entities: ParsedEntity[]; filePath: string }> = [];
  private pendingFilesCount = 0;
  // flushChain removed — graphMutex in *Ops classes now serializes all DB writes

  // Incremental entity name map — avoids O(n²) full rebuild on each file
  private entityNameMap = new Map<string, Entity[]>();
  private entitySuffixMap = new Map<string, Entity[]>();

  // Idle flush timer - adaptive: 2s during active indexing, 10s during file watching
  private idleFlushAbort: AbortController | null = null;
  private readonly IDLE_FLUSH_MS_ACTIVE = 2_000;
  private readonly IDLE_FLUSH_MS_PASSIVE = 10_000;
  private isActiveIndexing = false;
  private idleFlushRetries = 0;
  private readonly MAX_IDLE_RETRIES = 2;
  private readonly MIN_IDLE_FLUSH_FILES = 20;
  private bulkIndexesDropped = false;
  private bulkStagingEnabled = false;
  private bulkDropPromise: Promise<void> | null = null;

  constructor() {
    super(AgentType.INDEXER, getIndexerConfig());
    log.i("INDEXER", "created", { id: this.id });
  }

  /**
   * Set total files count to compute adaptive flush threshold.
   * Must be called after file collection, before parsing starts.
   */
  setTotalFiles(totalFiles: number): void {
    if (totalFiles < 500) {
      this.batchFlushThreshold = 270;
      this.entityFlushThreshold = 15_000;
    } else if (totalFiles < 2000) {
      this.batchFlushThreshold = 500;
      this.entityFlushThreshold = 25_000;
    } else if (totalFiles < 5000) {
      this.batchFlushThreshold = 800;
      this.entityFlushThreshold = 35_000;
    } else {
      this.batchFlushThreshold = 2000;
      this.entityFlushThreshold = 40_000;
    }
    this.isActiveIndexing = true;
    log.i("INDEXER", "adaptive_threshold", {
      totalFiles,
      fileThreshold: this.batchFlushThreshold,
      entityThreshold: this.entityFlushThreshold,
    });

    // Drop indexes + enable staging for bulk insert performance (>500 files)
    if (totalFiles > 500) {
      const adapter = getLibSQLAdapter();
      if (adapter) {
        this.bulkDropPromise = adapter
          .dropBulkIndexes()
          .then(() => adapter.enableStagingMode())
          .then(() => {
            this.bulkIndexesDropped = true;
            this.bulkStagingEnabled = true;
          })
          .catch((err) => {
            log.w("INDEXER", "staging_enable_failed", { error: (err as Error).message });
          });
      }
    }
  }

  /**
   * Mark active indexing as complete — switches idle timer to passive mode.
   */
  async setIndexingComplete(): Promise<void> {
    this.isActiveIndexing = false;
    this.idleFlushRetries = 0;

    if (this.bulkStagingEnabled) {
      // Staging path: commit staging tables → main + recreate indexes in one step
      this.bulkStagingEnabled = false;
      this.bulkIndexesDropped = false;
      const adapter = getLibSQLAdapter();
      if (adapter) {
        const start = Date.now();
        try {
          await adapter.commitStaging();
          log.i("INDEXER", "staging_committed", { ms: Date.now() - start });
        } catch (err) {
          log.w("INDEXER", "staging_commit_failed", { error: (err as Error).message });
          await adapter.abortStaging();
          await adapter.recreateBulkIndexes();
        }
      }
    } else if (this.bulkIndexesDropped) {
      // Non-staging path (< 1000 files but indexes were dropped)
      this.bulkIndexesDropped = false;
      const adapter = getLibSQLAdapter();
      if (adapter) {
        const start = Date.now();
        try {
          await adapter.recreateBulkIndexes();
          log.i("INDEXER", "bulk_indexes_recreated", { ms: Date.now() - start });
        } catch (err) {
          log.w("INDEXER", "recreate_indexes_failed", { error: (err as Error).message });
        }
      }
    }

    // Invalidate cached Graphology graph and preload in background if trace tools
    // were used ≥2 times on this project (adaptive preload)
    try {
      const adapter = getLibSQLAdapter();
      if (adapter) {
        invalidateAndPreload(adapter as unknown as import("../types/storage.js").GraphStorage);
      }
    } catch {
      // Non-critical: graph preload is a performance optimization, not required
    }
  }

  /**
   * Initialize the indexer agent
   */
  protected async onInitialize(): Promise<void> {
    const startTime = Date.now();
    log.t("INDEXER", `[IndexerAgent] ▶ onInitialize() START`);
    log.i("INDEXER", "init_start");

    // Initialize xxHash for stable ID generation
    log.t("INDEXER", `[IndexerAgent] ▶ initXXHash`);
    await initXXHash();
    log.t("INDEXER", `[IndexerAgent] ◀ initXXHash (${Date.now() - startTime}ms)`);

    // Always initialize branch-aware indexing (git detection happens per-repository)
    const appConfig = getConfig();
    {
      log.d("INDEXER", "branch_aware_init");

      // Use centralized storage if no explicit dataDir configured
      const dataDir = appConfig.indexing.dataDir || getDataDir();

      this.branchManager = new BranchManager({
        enabled: true,
        dataDir,
        maxBranchesPerRepo: appConfig.indexing.maxBranchesPerRepo || 10,
        maxTotalBranches: appConfig.indexing.maxTotalBranches || 50,
        evictionStrategy: appConfig.indexing.evictionStrategy || "LRU",
      });

      await this.branchManager.initialize();

      // GitWatcher creation is deferred to getOrCreateWatcher() per-project
      if (appConfig.git?.enabled && appConfig.git.watchBranchChanges) {
        log.i("INDEXER", "git_watch_enabled");
      }
    }

    // CRITICAL FIX: Use singleton GraphStorage instance (libsql unified)
    // This ensures IndexerAgent and MCP tools use the same storage instance
    log.t("INDEXER", `[IndexerAgent] ▶ getGraphStorage`);
    const gsStart = Date.now();
    this.graphStorage = await getGraphStorage();
    log.t("INDEXER", `[IndexerAgent] ◀ getGraphStorage (${Date.now() - gsStart}ms)`);
    // Ensure graph storage is fully initialized (re-prepare statements after SQLite reset)
    if ("initialize" in this.graphStorage && typeof this.graphStorage.initialize === "function") {
      log.t("INDEXER", `[IndexerAgent] ▶ graphStorage.initialize`);
      await this.graphStorage.initialize();
      log.t("INDEXER", `[IndexerAgent] ◀ graphStorage.initialize (${Date.now() - gsStart}ms)`);
    }

    const config = getIndexerConfig();

    // v4: Use LibSQL BatchOperations instead of better-sqlite3
    log.t("INDEXER", `[IndexerAgent] ▶ BatchOperationsLibSQL.initialize`);
    const batchStart = Date.now();
    const adapter = getLibSQLAdapter();
    if (!adapter) {
      throw new Error(
        `[${this.id}] LibSQLAdapter is required but not available - ensure getGraphStorage() was called first`,
      );
    }
    this.batchOps = new BatchOperationsLibSQL(adapter, config.batchSize);
    await this.batchOps.initialize();
    log.t("INDEXER", `[IndexerAgent] ◀ BatchOperationsLibSQL.initialize (${Date.now() - batchStart}ms)`);
    this.cacheManager = getCacheManager({
      maxSize: config.cacheSize,
      defaultTTL: config.cacheTTL,
    });

    // Subscribe to parse complete events
    this.subscribeToParseEvents();

    this.ready = true;
    log.i("INDEXER", "init_done");
  }

  /**
   * Set the project context for GraphStorage and BatchOperations.
   * @deprecated Prefer runWithRequestContext() for scoped operations.
   * Still needed for watcher setup (getOrCreateWatcher) and initial context.
   */
  setProjectContext(projectPath: string, branchName?: string): void {
    log.i("INDEXER", "set_project_ctx", { path: projectPath });

    // Set fallback context on GraphStorage (ALS takes priority when available)
    if (this.graphStorage && typeof this.graphStorage.setProject === "function") {
      this.graphStorage.setProject(projectPath, branchName);
      log.d("INDEXER", "gs_ctx_set", { path: projectPath, branch: branchName || "main" });
    } else {
      log.w("INDEXER", "gs_ctx_not_ready");
    }

    // Recreate BatchOperations if adapter was closed (project switch does resetGraphStorage)
    const currentAdapter = getLibSQLAdapter();
    if (currentAdapter && this.batchOps) {
      const adapterIsStale = !currentAdapter.isReady();
      if (adapterIsStale) {
        log.w("INDEXER", "batch_adapter_stale", { path: projectPath });
      }
    }
    // If adapter changed (or was recreated after project switch), rebuild batchOps
    if (currentAdapter && currentAdapter.isReady()) {
      const config = getIndexerConfig();
      this.batchOps = new BatchOperationsLibSQL(currentAdapter, config.batchSize);
      this.batchOps.initialize().catch((err) => {
        log.w("INDEXER", "batch_reinit_fail", { err: (err as Error).message });
      });
      log.d("INDEXER", "batch_ops_recreated", { path: projectPath });
    }

    // Set fallback context on BatchOperations (ALS takes priority when available)
    if (this.batchOps && typeof this.batchOps.setProject === "function") {
      this.batchOps.setProject(projectPath, branchName);
      log.d("INDEXER", "batch_ctx_set", { path: projectPath, branch: branchName || "main" });
    } else {
      log.w("INDEXER", "batch_ctx_not_ready");
    }

    this.currentRepositoryPath = projectPath;

    // Start per-project GitWatcher (creates new watcher if not yet watching this path)
    this.getOrCreateWatcher(projectPath);
  }

  /**
   * Subscribe to parser events via knowledge bus
   *
   * NOTE: This is DISABLED because DevAgent directly calls indexerAgent.process()/enqueue()
   * after parsing. Subscribing to events would cause DOUBLE processing of each file.
   * Only enable this if IndexerAgent is used standalone without DevAgent.
   */
  private subscribeToParseEvents(): void {
    // DISABLED: DevAgent already calls indexerAgent directly after parsing.
    // Subscribing to events causes each file to be indexed 2-3 times!
    //
    // const parseCompleteId = knowledgeBus.subscribe(this.id, "parse:complete", async (entry: KnowledgeEntry) => {
    //   await this.handleParseComplete(entry);
    // });
    // this.subscriptionIds.push(parseCompleteId);
    //
    // const parseBatchId = knowledgeBus.subscribe(this.id, "parse:batch:complete", async (entry: KnowledgeEntry) => {
    //   await this.handleParseBatchComplete(entry);
    // });
    // this.subscriptionIds.push(parseBatchId);

    log.d("INDEXER", "parse_subs_disabled");
  }

  // NOTE: handleParseComplete and handleParseBatchComplete are removed because
  // DevAgent calls indexerAgent.process()/enqueue() directly after parsing.
  // Keeping these methods would cause unused code warnings.

  /**
   * Check if agent can process the task
   */
  protected canProcessTask(_task: AgentTask): boolean {
    // Allow tasks through to switch so we can throw a clearer error in default branch
    return true;
  }

  /**
   * Process indexer tasks
   */
  protected async processTask(task: AgentTask): Promise<unknown> {
    const indexerTask = task as IndexerTask;

    switch (indexerTask.type) {
      case "index:entities":
        return await this.indexEntities(
          indexerTask.payload.entities!,
          indexerTask.payload.filePath!,
          indexerTask.payload.relationships as any,
        );

      case "index:incremental":
        return await this.incrementalUpdate(indexerTask.payload.changes!);

      case "query:graph":
        return await this.queryGraph(indexerTask.payload.query!);

      case "query:subgraph":
        return await this.querySubgraph(indexerTask.payload.entityId!, indexerTask.payload.depth || 2);

      default:
        throw new Error(`Unknown task type: ${indexerTask.type}`);
    }
  }

  /**
   * Index entities and build relationships
   */
  async indexEntities(
    entities: ParsedEntity[],
    filePath: string,
    providedRelationships?: ProvidedRelationship[],
  ): Promise<BatchResult & { entitiesIndexed: number; relationshipsCreated: number }> {
    const startTime = Date.now();

    // Flatten entity tree to include all children (class members, properties, methods)
    // This is critical for NgRx effects and other class members to be stored as separate entities
    const flatEntities = flattenParsedEntities(entities);
    const childrenExtracted = flatEntities.length - entities.length;

    // DEBUG: Check language field in entities
    const withLang = flatEntities.filter((e) => e.language).length;
    const langSample = flatEntities.filter((e) => e.language).slice(0, 2);
    const noLangSample = flatEntities.filter((e) => !e.language).slice(0, 2);
    log.i("INDEXER", "lang_check", {
      total: flatEntities.length,
      withLang,
      langSample: langSample.map((e) => ({ n: e.name, l: e.language })),
      noLangSample: noLangSample.map((e) => ({ n: e.name, t: e.type })),
    });

    log.d("INDEXER", "indexing", {
      entities: entities.length,
      flat: flatEntities.length,
      children: childrenExtracted,
      file: filePath,
    });
    if (childrenExtracted > 0) {
      // Log some sample children for debugging
      const sampleChildren = flatEntities.slice(entities.length, entities.length + 3);
      log.t("INDEXER", "sample_children", { sample: sampleChildren.map((c) => c.name).join(",") });
    }

    // Validate parsed entities and convert to storage entities
    const storageEntities: Entity[] = [];
    const validParsed: ParsedEntity[] = [];
    const preErrors: Array<{ item: unknown; error: string }> = [];
    // Content-based hash: stable across re-indexes for embedding dedup
    let fileHash: string;
    try {
      fileHash = hashText(filePath);
    } catch {
      fileHash = nanoid(8); // Fallback if hasher not initialized yet
    }

    // Per-file ordinal map for SemId disambiguation (Zig-compatible)
    const ordinalMap: Map<string, number> = new Map();

    for (const parsed of flatEntities) {
      try {
        // Type narrowing: check if parsed has required ParsedEntity properties
        const hasValidStructure =
          parsed &&
          typeof parsed === "object" &&
          "name" in parsed &&
          typeof parsed.name === "string" &&
          "type" in parsed &&
          parsed.type &&
          "location" in parsed &&
          parsed.location;

        if (!hasValidStructure) {
          // Debug: log why entity was rejected
          const reasons: string[] = [];
          if (!parsed) reasons.push("null/undefined");
          else if (typeof parsed !== "object") reasons.push("not object");
          else {
            if (!("name" in parsed) || typeof parsed.name !== "string") reasons.push("no name");
            if (!("type" in parsed) || !parsed.type) reasons.push("no type");
            if (!("location" in parsed) || !parsed.location) reasons.push("no location");
          }
          const entityName = parsed && typeof parsed === "object" && "name" in parsed ? parsed.name : undefined;
          log.t("INDEXER", "rejected_entity", { name: entityName, reasons: reasons.join(",") });
          throw new Error("Invalid entity");
        }

        const isImport = parsed?.type === "import" && parsed?.importData?.source;
        const hasName = typeof parsed.name === "string" && parsed.name.trim().length > 0;

        const normalizedParsed =
          !hasName && isImport ? { ...parsed, name: `import:${parsed.importData?.source}` } : parsed;

        // Use entity's filePath if available (for flattened children), otherwise use provided filePath
        const entityFilePath = normalizedParsed.filePath || filePath;
        const base = parsedEntityToEntity(normalizedParsed, entityFilePath, fileHash);

        // Build parent context from flattened entity (SemId hierarchical IDs)
        const parentCtx =
          normalizedParsed.parentSemId && normalizedParsed.parentName && normalizedParsed.parentType
            ? {
                semId: normalizedParsed.parentSemId,
                name: normalizedParsed.parentName,
                entityType: normalizedParsed.parentType,
              }
            : null;

        const entity = finalizeEntity(base, stableEntityId(base, ordinalMap, parentCtx), Date.now());

        storageEntities.push(entity);
        validParsed.push(normalizedParsed as ParsedEntity);
      } catch (e) {
        preErrors.push({ item: parsed, error: (e as Error).message });
      }
    }

    // Insert entities in batch
    const entityResult = await this.batchOps.insertEntities(storageEntities, (processed, total) => {
      log.t("INDEXER", "entity_progress", { processed, total });
    });

    log.d("INDEXER", "entity_insert_done", {
      processed: entityResult.processed,
      failed: entityResult.failed,
      errors: entityResult.errors.length,
    });
    if (entityResult.failed > 0) {
      log.w("INDEXER", "entity_errors", { errs: entityResult.errors.slice(0, 3).map((e) => e.error) });
    }

    // OPTIMIZATION: Publish entities for embedding IMMEDIATELY after entity insertion
    // Don't wait for relationship insertion - embedding can start in parallel
    // Use stableEntityId from storageEntities to ensure embedding IDs match graph DB IDs
    if (validParsed.length) {
      const entitiesWithPath = validParsed.map((entity, i) => ({
        ...entity,
        id: storageEntities[i]?.id || entity.id,
        filePath: filePath,
      }));
      knowledgeBus.publish("semantic:new_entities", entitiesWithPath, this.id);
      log.d("INDEXER", `Published semantic:new_entities EARLY`, {
        count: entitiesWithPath.length,
        file: filePath,
      });
    }

    // Build and insert relationships
    let relationships: Relationship[] = [];

    // Use provided relationships if available
    if (providedRelationships && providedRelationships.length > 0) {
      const byName = buildEntityNameMap(storageEntities);

      log.t("INDEXER", "entity_names_sample", { sample: Array.from(byName.keys()).slice(0, 10) });
      const first3 = providedRelationships.slice(0, 3);
      log.t("INDEXER", "raw_rels_sample", { sample: first3.map((r) => `${r.from}->${r.to}`) });
      const relLoopStart = Date.now();
      log.t("INDEXER", "process_rels", { cnt: providedRelationships.length });

      // DEBUG: Track calls resolution stats
      let callsTotal = 0;
      let callsFromResolved = 0;
      let callsToResolved = 0;
      const callsSample: Array<{ from: string; to: string; fromId: string; toId: string }> = [];

      for (const rel of providedRelationships) {
        // Pass sourceFile to prefer same-file entities when resolving names.
        const relSourceFile = rel.sourceFile || filePath;
        const isContains = rel.type === "contains";
        let fromId = resolveByNameAndLine(byName, rel.from, rel.metadata?.line, relSourceFile, isContains);
        let toId = resolveByNameAndLine(byName, rel.to, rel.metadata?.line, rel.targetFile || relSourceFile);

        // DEBUG: Track calls relationship resolution
        if (rel.type === "calls") {
          callsTotal++;
          if (fromId) callsFromResolved++;
          if (toId) callsToResolved++;
          if (callsSample.length < 3) {
            callsSample.push({
              from: rel.from,
              to: rel.to,
              fromId: fromId || `EXT:${rel.from}`,
              toId: toId || `EXT:${rel.to}`,
            });
          }
        }

        // DEBUG: Log resolution results for first relationship
        if (relationships.length === 0) {
          log.t("INDEXER", "first_rel_resolve", { from: rel.from, fromId, to: rel.to, toId });
        }

        // Create external placeholder for unresolved fromId (e.g., decorators)
        if (!fromId) {
          const src = rel.sourceFile || filePath || "unknown";
          fromId = `external:${src}:${rel.from}`;
        }

        if (!toId) {
          const src = rel.targetFile || "unknown";
          toId = `external:${src}:${rel.to}`;
        }

        if (fromId && toId) {
          relationships.push({
            id: stableRelationshipId(fromId, toId, rel.type as RelationType),
            fromId,
            toId,
            type: rel.type as RelationType,
            metadata: { line: rel.metadata?.line, context: rel.type },
            createdAt: Date.now(),
          });
        } else {
          log.t("INDEXER", "rel_skipped", { from: rel.from, to: rel.to, fromId, toId });
        }
      }

      // DEBUG: Log calls resolution stats
      if (callsTotal > 0) {
        log.i("INDEXER", "calls_resolution_stats", {
          total: callsTotal,
          fromResolved: callsFromResolved,
          toResolved: callsToResolved,
          fromPct: Math.round((callsFromResolved / callsTotal) * 100),
          toPct: Math.round((callsToResolved / callsTotal) * 100),
        });
        if (callsSample.length > 0) {
          log.i("INDEXER", "calls_sample", { sample: callsSample });
        }
        // Log entity names sample to compare
        const entityNamesSample = Array.from(byName.keys()).slice(0, 5);
        log.i("INDEXER", "entity_names_in_map", { sample: entityNamesSample, total: byName.size });
      }

      const relLoopMs = Date.now() - relLoopStart;
      log.i("INDEXER", "RelationshipLoop", {
        count: providedRelationships.length,
        builtCount: relationships.length,
        ms: relLoopMs,
      });
      log.d("INDEXER", "using_provided_rels", { cnt: relationships.length, ms: relLoopMs });
    } else {
      relationships = await this.buildRelationshipsInternal(validParsed, storageEntities);
      log.d("INDEXER", "built_auto_rels", { cnt: relationships.length });
    }

    // Process external relationships - create placeholders for unresolved references
    // NOTE: DB lookup was removed here due to O(N) query overhead causing 77+ second delays
    // Resolution of placeholders to real entities can be done later via resolveExternalPlaceholders()
    const externalPlaceholders = await processExternalRelationships(
      relationships,
      stableRelationshipId,
      // No lookupEntityByName - just create placeholders (fast path)
    );

    if (externalPlaceholders.length > 0) {
      await this.batchOps.insertEntities(externalPlaceholders);
    }

    // Skip empty relationship inserts to avoid overhead
    let relResult: { processed: number; failed: number; errors: Array<{ item: unknown; error: string }> } = {
      processed: 0,
      failed: 0,
      errors: [],
    };
    let insertRelMs = 0;
    if (relationships.length > 0) {
      log.t("INDEXER", "insert_rels_start", { cnt: relationships.length });
      const insertRelStart = Date.now();
      relResult = await this.batchOps.insertRelationships(relationships);
      insertRelMs = Date.now() - insertRelStart;
      log.i("INDEXER", "InsertRelationships", {
        count: relationships.length,
        processed: relResult.processed,
        ms: insertRelMs,
      });
    }

    // Update file info
    const fileInfo: FileInfo = {
      path: filePath,
      hash: fileHash,
      lastIndexed: Date.now(),
      entityCount: storageEntities.length,
    };
    await this.graphStorage.updateFileInfo(fileInfo);

    // Clear relevant cache entries
    this.cacheManager.clear();

    // Update statistics
    const indexTime = Date.now() - startTime;
    this.indexingStats.entitiesIndexed += entityResult.processed;
    this.indexingStats.relationshipsCreated += relResult.processed;
    this.indexingStats.filesProcessed++;
    this.indexingStats.totalIndexTime += indexTime;
    this.indexingStats.lastIndexTime = indexTime;

    // Publish indexing complete event
    log.t("INDEXER", "pub_index_complete");
    knowledgeBus.publish(
      "index:complete",
      {
        filePath,
        entities: entityResult.processed,
        relationships: relResult.processed,
        timeMs: indexTime,
      },
      this.id,
    );
    log.t("INDEXER", "index_complete_pubbed");

    // NOTE: semantic:new_entities is now published EARLY (after entity insertion, before relationships)
    // This allows embedding generation to run in parallel with relationship insertion

    log.i("INDEXER", "indexed_done", { entities: entityResult.processed, rels: relResult.processed, ms: indexTime });

    const failed = entityResult.failed + relResult.failed + preErrors.length;
    const errors = [...entityResult.errors, ...relResult.errors, ...preErrors];

    // Return complete indexing statistics
    const { timeMs: _throwAway, ...restBase } = entityResult;

    return {
      ...restBase,
      failed,
      errors,
      timeMs: indexTime,
      entitiesIndexed: entityResult.processed,
      relationshipsCreated: relResult.processed,
    };
  }

  /**
   * Build relationships from parsed entities
   * Delegates to extracted relationship-builder module
   */
  private async buildRelationshipsInternal(
    parsedEntities: ParsedEntity[],
    storageEntities: Entity[],
  ): Promise<Relationship[]> {
    return buildRelationships(parsedEntities, storageEntities);
  }

  // ===========================================================================
  // BATCH ACCUMULATOR METHODS - Optimized streaming indexing
  // ===========================================================================

  /**
   * Reset idle flush timer - called when new entities are queued.
   * After IDLE_FLUSH_MS of inactivity, pending batch will be flushed.
   */
  private resetIdleFlushTimer(): void {
    // Abort previous idle timer
    if (this.idleFlushAbort) {
      this.idleFlushAbort.abort();
    }

    // Don't schedule if nothing pending
    if (this.pendingFilesCount === 0) {
      return;
    }

    // Create new abort controller for this timer
    const abortController = new AbortController();
    this.idleFlushAbort = abortController;

    const idleMs = this.isActiveIndexing ? this.IDLE_FLUSH_MS_ACTIVE : this.IDLE_FLUSH_MS_PASSIVE;

    // Schedule idle flush using async sleep (Bun compatible)
    (async () => {
      await sleep(idleMs);
      if (abortController.signal.aborted || this.pendingFilesCount === 0) return;

      // During active indexing, batch up stragglers instead of flushing 1-2 files
      if (
        this.isActiveIndexing &&
        this.pendingFilesCount < this.MIN_IDLE_FLUSH_FILES &&
        this.idleFlushRetries < this.MAX_IDLE_RETRIES
      ) {
        this.idleFlushRetries++;
        this.resetIdleFlushTimer(); // Wait another cycle to accumulate more
        return;
      }
      this.idleFlushRetries = 0;

      log.d("INDEXER", "idle_flush", {
        pending: this.pendingFilesCount,
        entities: this.pendingStorageEntities.length,
        relationships: this.pendingRelationships.length,
      });
      logMemory("INDEXER", { pendingFiles: this.pendingFilesCount });
      try {
        await this.flushPendingBatch();
        // Force GC after idle flush to reclaim memory
        if (tryGarbageCollect(true)) {
          log.d("INDEXER", "gc_after_idle_flush");
        }
      } catch (err) {
        log.w("INDEXER", "Idle flush failed", { error: (err as Error).message });
      }
    })();
  }

  /**
   * Queue entities for batch indexing (streaming mode optimization)
   * Accumulates data and flushes in batches to reduce DB operations
   */
  queueForIndexing(entities: ParsedEntity[], filePath: string, providedRelationships?: EntityRelationship[]): void {
    if (!entities || entities.length === 0) return;

    // Reset idle flush timer on each queue
    this.resetIdleFlushTimer();

    // DEBUG: Log incoming relationships for Python and C# files
    if (filePath.endsWith(".py") || filePath.endsWith(".cs")) {
      log.i("INDEXER", "queue_rels_debug", {
        file: filePath.split(/[/\\]/).pop(),
        entities: entities.length,
        relationships: providedRelationships?.length ?? 0,
        relSample: providedRelationships?.slice(0, 3).map((r) => `${r.from}->${r.to}:${r.type}`),
      });
    }

    // Flatten and convert entities — collect into temp array for incremental Map update
    const flatEntities = flattenParsedEntities(entities);
    let fileHash: string;
    try {
      fileHash = hashText(filePath);
    } catch {
      fileHash = nanoid(8);
    }
    const newEntities: Entity[] = [];

    // Per-file ordinal map for SemId disambiguation (Zig-compatible)
    const ordinalMap: Map<string, number> = new Map();

    for (const parsed of flatEntities) {
      try {
        if (!parsed?.name || !parsed?.type || !parsed?.location) continue;

        const entityFilePath = parsed.filePath || filePath;
        const base = parsedEntityToEntity(parsed, entityFilePath, fileHash);

        const parentCtx =
          parsed.parentSemId && parsed.parentName && parsed.parentType
            ? { semId: parsed.parentSemId, name: parsed.parentName, entityType: parsed.parentType }
            : null;

        const entity = finalizeEntity(base, stableEntityId(base, ordinalMap, parentCtx), Date.now());

        newEntities.push(entity);

        // DEBUG: Log entity ID details for ALL C# class entities to trace ID mismatch
        if (filePath.endsWith(".cs") && (parsed.type === "class" || parsed.type === "interface")) {
          log.w("INDEXER", "csharp_entity_id_debug", {
            name: entity.name,
            type: entity.type,
            id: entity.id,
            entityFilePath: entityFilePath?.split(/[/\\]/).slice(-2).join("/"),
            parsedFilePath: parsed.filePath?.split(/[/\\]/).slice(-2).join("/"),
            paramFilePath: filePath?.split(/[/\\]/).slice(-2).join("/"),
            pathMatch: entityFilePath === filePath,
            startIndex: base.location?.start?.index,
            endIndex: base.location?.end?.index,
          });
        }
      } catch {
        // Skip invalid entities
      }
    }

    // Push new entities to pending buffer and incrementally update name maps — O(k) not O(n)
    this.pendingStorageEntities.push(...newEntities);
    addEntitiesToNameMap(this.entityNameMap, this.entitySuffixMap, newEntities);

    // Build relationships using incremental entityNameMap + suffixMap
    if (providedRelationships && providedRelationships.length > 0) {
      // DEBUG: Log cross-module call resolution for Swift
      if (filePath.endsWith(".swift")) {
        const callsRels = providedRelationships.filter((r) => r.type === "calls" && r.metadata?.["crossModule"]);
        if (callsRels.length > 0) {
          log.w("XMOD", "swift_cross_module", {
            file: filePath.split(/[/\\]/).pop(),
            crossModuleCalls: callsRels.length,
            pendingEntities: this.pendingStorageEntities.length,
            byNameSize: this.entityNameMap.size,
            serverPosterKeys: Array.from(this.entityNameMap.keys()).filter((k) => k.includes("ServerPoster")),
            calls: callsRels.slice(0, 5).map((r) => ({
              from: r.from,
              to: r.to,
              inByName: this.entityNameMap.has(r.to),
            })),
          });
        }
      }

      // DEBUG: Log resolution stats for C# files
      let csResolved = 0;
      let csUnresolved = 0;

      for (const rel of providedRelationships) {
        // Pass sourceFile to prefer same-file entities when resolving names.
        // Prevents cross-file collisions in the pending buffer (e.g., multiple "Dispose" methods).
        const relSourceFile = rel.sourceFile || filePath;
        // For "contains" relationships, prefer container types (class > constructor)
        // to avoid C# constructor name collision stealing parent relationships.
        const isContains = rel.type === "contains";
        let fromId = resolveByNameAndLine(
          this.entityNameMap,
          rel.from,
          rel.metadata?.line,
          relSourceFile,
          isContains,
          this.entitySuffixMap,
        );
        let toId = resolveByNameAndLine(
          this.entityNameMap,
          rel.to,
          rel.metadata?.line,
          rel.targetFile || relSourceFile,
          undefined,
          this.entitySuffixMap,
        );

        // DEBUG: Log resolution result for cross-module calls
        if (rel.metadata?.["crossModule"]) {
          log.w("XMOD", "resolution", {
            to: rel.to,
            resolved: !!toId,
            toId: toId || "UNRESOLVED",
          });
        }

        if (!fromId) fromId = `external:${relSourceFile}:${rel.from}`;
        if (!toId) toId = `external:${rel.targetFile || "unknown"}:${rel.to}`;

        // DEBUG: Log first 5 C# contains relationships to trace ID resolution
        if (filePath.endsWith(".cs") && rel.type === "contains" && csResolved + csUnresolved < 5) {
          log.w("INDEXER", "csharp_rel_id_debug", {
            file: filePath.split(/[/\\]/).pop(),
            from: rel.from,
            to: rel.to,
            fromId: fromId.slice(0, 16),
            toId: toId.slice(0, 16),
            fromIsExternal: fromId.startsWith("external:"),
            toIsExternal: toId.startsWith("external:"),
            sourceFile: relSourceFile?.split(/[/\\]/).slice(-2).join("/"),
          });
        }

        // Track C# resolution stats
        if (filePath.endsWith(".cs")) {
          const fromResolved = !fromId.startsWith("external:");
          const toResolved = !toId.startsWith("external:");
          if (fromResolved && toResolved) csResolved++;
          else csUnresolved++;
        }

        this.pendingRelationships.push({
          id: stableRelationshipId(fromId, toId, rel.type as RelationType),
          fromId,
          toId,
          type: rel.type as RelationType,
          metadata: { line: rel.metadata?.line, context: rel.type },
          createdAt: Date.now(),
        } as Relationship);
      }

      // DEBUG: Log C# resolution summary
      if (filePath.endsWith(".cs") && (csResolved > 0 || csUnresolved > 0)) {
        log.i("INDEXER", "csharp_rel_resolution", {
          file: filePath.split(/[/\\]/).pop(),
          resolved: csResolved,
          unresolved: csUnresolved,
          pendingEntities: this.pendingStorageEntities.length,
          byNameSize: this.entityNameMap.size,
          pendingRels: this.pendingRelationships.length,
          // Show entity names relevant to this file
          fileEntityNames: this.pendingStorageEntities
            .filter((e) => e.filePath === filePath)
            .slice(0, 10)
            .map((e) => `${e.name}(${e.type})`),
        });
      }
    }

    // Store for embedding generation
    this.pendingParsedEntities.push({ entities: flatEntities, filePath });
    this.pendingFilesCount++;

    // Immediate fire-and-forget flush when threshold reached
    // Starts DB work concurrently with parsing — no delay
    if (
      this.pendingStorageEntities.length >= this.entityFlushThreshold ||
      this.pendingFilesCount >= this.batchFlushThreshold
    ) {
      this.flushPendingBatch().catch((err) => {
        log.w("INDEXER", "Auto-flush failed", { error: (err as Error).message });
      });
    }
  }

  /**
   * Flush all pending entities/relationships to DB in one batch
   * Returns stats about what was flushed
   */
  async flushPendingBatch(): Promise<{ entities: number; relationships: number; files: number }> {
    // Wait for bulk index drop to complete before first flush
    if (this.bulkDropPromise) {
      await this.bulkDropPromise;
      this.bulkDropPromise = null;
    }

    // Snapshot IMMEDIATELY — don't let data accumulate while waiting for previous flush.
    // This prevents mega-flush: each threshold trigger "cuts off" current batch right away.
    const entitiesToFlush = this.pendingStorageEntities;
    const relationshipsToFlush = this.pendingRelationships;
    const parsedToFlush = this.pendingParsedEntities;
    const filesCount = this.pendingFilesCount;

    // Reset accumulators and incremental maps
    this.pendingStorageEntities = [];
    this.pendingRelationships = [];
    this.pendingParsedEntities = [];
    this.pendingFilesCount = 0;
    this.entityNameMap = new Map();
    this.entitySuffixMap = new Map();

    if (entitiesToFlush.length === 0) {
      return { entities: 0, relationships: 0, files: 0 };
    }

    // DB writes are serialized by graphMutex in *Ops classes — no manual chaining needed.
    {
      const flushStart = Date.now();
      // Publish for embedding generation BEFORE DB write — TEI starts work in parallel
      // Build lookup: name+type+filePath → stableEntityId for correct embedding IDs
      const stableIdLookup = new Map<string, string>();
      for (const e of entitiesToFlush) {
        stableIdLookup.set(`${e.name}|${e.type}|${e.filePath}`, e.id);
      }
      for (const { entities, filePath } of parsedToFlush) {
        const entitiesWithPath = entities.map((e) => {
          const fp = e.filePath || filePath;
          const dbId = stableIdLookup.get(`${e.name}|${e.type}|${fp}`);
          return { ...e, id: dbId || e.id, filePath: fp };
        });
        knowledgeBus.publish("semantic:new_entities", entitiesWithPath, this.id);
      }

      // Insert entities in one batch
      const entityResult = await this.batchOps.insertEntities(entitiesToFlush);

      // Process external relationships - create placeholders for unresolved references
      // NOTE: DB lookup was removed here due to O(N) query overhead causing 77+ second delays
      // Resolution of placeholders to real entities can be done later via resolveExternalPlaceholders()
      const externalPlaceholders = await processExternalRelationships(
        relationshipsToFlush,
        stableRelationshipId,
        // No lookupEntityByName - just create placeholders (fast path)
      );
      if (externalPlaceholders.length > 0) {
        await this.batchOps.insertEntities(externalPlaceholders);
      }

      // Insert relationships in one batch (skip if empty)
      let relResult = { processed: 0 };
      if (relationshipsToFlush.length > 0) {
        // Classify relationships: real (hash IDs) vs external (unresolved)
        const realRels = relationshipsToFlush.filter(
          (r) => !r.fromId.startsWith("external:") && !r.toId.startsWith("external:"),
        );
        const externalRels = relationshipsToFlush.length - realRels.length;
        log.i("INDEXER", "flush_rels", {
          count: relationshipsToFlush.length,
          real: realRels.length,
          external: externalRels,
          sample: realRels.slice(0, 3).map((r) => `${r.fromId}->${r.toId}:${r.type}`),
        });

        // DEBUG: Cross-check C# entity IDs vs relationship references
        const csEntities = entitiesToFlush.filter((e) => e.language === "csharp" && e.type === "class");
        if (csEntities.length > 0) {
          const csEntityIds = new Set(csEntities.map((e) => e.id));
          const allEntityIds = new Set(entitiesToFlush.map((e) => e.id));
          // Count relationships that reference C# class entity IDs
          let csFromCount = 0;
          let csToCount = 0;
          let anyRefCount = 0;
          for (const r of relationshipsToFlush) {
            if (csEntityIds.has(r.fromId)) csFromCount++;
            if (csEntityIds.has(r.toId)) csToCount++;
            if (allEntityIds.has(r.fromId) || allEntityIds.has(r.toId)) anyRefCount++;
          }
          // Sample: first 3 C# class entities + their referencing relationships
          const samples = csEntities.slice(0, 3).map((e) => {
            const rels = relationshipsToFlush.filter((r) => r.fromId === e.id || r.toId === e.id);
            return {
              name: e.name,
              id: e.id,
              filePath: e.filePath?.split(/[/\\]/).slice(-2).join("/"),
              relsCount: rels.length,
              relSample: rels.slice(0, 3).map((r) => `${r.fromId.slice(0, 8)}→${r.toId.slice(0, 8)}:${r.type}`),
            };
          });
          log.w("INDEXER", "flush_cs_crosscheck", {
            csClasses: csEntities.length,
            csClassRelsFrom: csFromCount,
            csClassRelsTo: csToCount,
            totalRels: relationshipsToFlush.length,
            relsRefAnyEntity: anyRefCount,
            samples,
          });
        }

        relResult = await this.batchOps.insertRelationships(relationshipsToFlush);
      }

      // Update file info for Smart Incremental indexing — batch instead of N sequential calls
      const fileEntityCounts = new Map<string, number>();
      for (const { filePath, entities } of parsedToFlush) {
        const current = fileEntityCounts.get(filePath) || 0;
        fileEntityCounts.set(filePath, current + entities.length);
      }
      const fileInfoBatch: FileInfo[] = [];
      const now = Date.now();
      for (const [filePath, entityCount] of fileEntityCounts) {
        fileInfoBatch.push({
          path: filePath,
          hash: nanoid(8),
          lastIndexed: now,
          entityCount,
        });
      }
      if (fileInfoBatch.length > 0) {
        if (
          "batchUpdateFileInfo" in this.graphStorage &&
          typeof (this.graphStorage as any).batchUpdateFileInfo === "function"
        ) {
          await (this.graphStorage as any).batchUpdateFileInfo(fileInfoBatch);
        } else {
          // Fallback: sequential updates
          for (const fi of fileInfoBatch) {
            await this.graphStorage.updateFileInfo(fi);
          }
        }
      }

      // Update stats
      this.indexingStats.entitiesIndexed += entityResult.processed;
      this.indexingStats.relationshipsCreated += relResult.processed;
      this.indexingStats.filesProcessed += filesCount;

      log.i("INDEXER", "Batch flush completed", {
        entities: entityResult.processed,
        relationships: relResult.processed,
        files: filesCount,
        filesTracked: fileEntityCounts.size,
        ms: Date.now() - flushStart,
      });
    }

    return {
      entities: entitiesToFlush.length,
      relationships: relationshipsToFlush.length,
      files: filesCount,
    };
  }

  /**
   * Get pending batch stats (for monitoring)
   */
  getPendingBatchStats(): { entities: number; relationships: number; files: number } {
    return {
      entities: this.pendingStorageEntities.length,
      relationships: this.pendingRelationships.length,
      files: this.pendingFilesCount,
    };
  }

  /**
   * Perform incremental update for changed entities
   */
  async incrementalUpdate(changes: EntityChange[]): Promise<BatchResult> {
    log.d("INDEXER", "incr_update", { cnt: changes.length });

    const toAdd: Entity[] = [];
    const toUpdate: Array<{ id: string; changes: Partial<Entity> }> = [];
    const toDelete: string[] = [];

    for (const change of changes) {
      switch (change.type) {
        case "added":
          if (change.entity) {
            toAdd.push(change.entity);
          }
          break;

        case "modified":
          if (change.entity && change.entityId) {
            toUpdate.push({
              id: change.entityId,
              changes: change.entity,
            });
          }
          break;

        case "deleted":
          if (change.entityId) {
            toDelete.push(change.entityId);
          }
          break;
      }
    }

    // Process changes
    let processed = 0;
    let failed = 0;
    const errors: Array<{ item: unknown; error: string }> = [];

    if (toAdd.length > 0) {
      const result = await this.batchOps.insertEntities(toAdd);
      processed += result.processed;
      failed += result.failed;
      errors.push(...result.errors);
    }

    if (toUpdate.length > 0) {
      const result = await this.batchOps.updateEntities(toUpdate);
      processed += result.processed;
      failed += result.failed;
      errors.push(...result.errors);
    }

    if (toDelete.length > 0) {
      const result = await this.batchOps.deleteEntities(toDelete);
      processed += result.processed;
      failed += result.failed;
      errors.push(...result.errors);
    }

    // Clear cache after updates
    this.cacheManager.clear();

    // Trigger debounced embedding generation
    this.doScheduleEmbeddingGeneration();

    return {
      processed,
      failed,
      errors,
      timeMs: 0,
    };
  }

  /**
   * Get embedding scheduler context for extracted functions
   */
  private getEmbeddingSchedulerContext(): EmbeddingSchedulerContext {
    return {
      agentId: this.id,
      debouncePeriodMs: this.EMBEDDING_DEBOUNCE_MS,
      abortController: this.embeddingDebounceAbort,
      pendingGeneration: this.pendingEmbeddingGeneration,
      setPendingGeneration: (value: boolean) => {
        this.pendingEmbeddingGeneration = value;
      },
      setAbortController: (controller: AbortController | null) => {
        this.embeddingDebounceAbort = controller;
      },
    };
  }

  /**
   * Schedule debounced embedding generation
   * Waits 1 minute after last change before triggering generation
   */
  private doScheduleEmbeddingGeneration(): void {
    const ctx = this.getEmbeddingSchedulerContext();
    scheduleEmbeddingGeneration(ctx, async () => {
      await triggerEmbeddingGeneration(this.getEmbeddingSchedulerContext());
    });
  }

  /**
   * Query the graph
   */
  async queryGraph(query: GraphQuery): Promise<GraphQueryResult> {
    // Check cache
    const cacheKey = QueryCacheManager.createKey(query as unknown as Record<string, unknown>);
    const cached = this.cacheManager.get<GraphQueryResult>(cacheKey);
    if (cached) {
      log.t("INDEXER", "cache_hit_query");
      return cached;
    }

    // Execute query
    log.t("INDEXER", "exec_query");
    const result = await this.graphStorage.executeQuery(query);

    // Cache result
    this.cacheManager.set(cacheKey, result);

    return result;
  }

  /**
   * Query subgraph for an entity
   */
  async querySubgraph(entityId: string, depth: number): Promise<GraphQueryResult> {
    // Check cache
    const cacheKey = QueryCacheManager.createKey({ entityId, depth });
    const cached = this.cacheManager.get<GraphQueryResult>(cacheKey);
    if (cached) {
      log.t("INDEXER", "cache_hit_subgraph");
      return cached;
    }

    // Execute query
    log.t("INDEXER", "get_subgraph", { entityId, depth });
    const result = await this.graphStorage.getSubgraph(entityId, depth);

    // Cache result
    this.cacheManager.set(cacheKey, result);

    return result;
  }

  /**
   * Handle incoming messages
   */
  protected async handleMessage(message: AgentMessage): Promise<void> {
    log.d("INDEXER", "recv_msg", { type: message.type, from: message.from });

    switch (message.type) {
      case "index:request": {
        // Handle indexing request
        const task: IndexerTask = {
          id: message.id,
          type: "index:entities",
          priority: 5,
          payload: message.payload as IndexerTask["payload"],
          createdAt: Date.now(),
        };
        await this.process(task);
        break;
      }

      case "query:request": {
        // Handle query request
        const queryTask: IndexerTask = {
          id: message.id,
          type: "query:graph",
          priority: 8,
          payload: message.payload as IndexerTask["payload"],
          createdAt: Date.now(),
        };
        const result = await this.process(queryTask);

        // Send response
        await this.send({
          id: nanoid(12),
          from: this.id,
          to: message.from,
          type: "query:response",
          payload: result,
          timestamp: Date.now(),
          correlationId: message.id,
        });
        break;
      }

      default:
        log.w("INDEXER", "unknown_msg_type", { type: message.type });
    }
  }

  /**
   * Get Git event context for a specific project path
   */
  private getGitEventContextForProject(projectPath: string): GitEventContext {
    return {
      agentId: this.id,
      currentRepositoryPath: projectPath,
      branchManager: this.branchManager,
    };
  }

  /**
   * Get Git event context for extracted handlers (uses current project)
   */
  private getGitEventContext(): GitEventContext {
    return this.getGitEventContextForProject(this.currentRepositoryPath!);
  }

  /**
   * Get or create a GitWatcher for a specific project path.
   * Each project gets its own independent watcher so multi-session doesn't interfere.
   */
  private getOrCreateWatcher(projectPath: string): GitWatcher | null {
    const appConfig = getConfig();
    if (!appConfig.git?.enabled || !appConfig.git.watchBranchChanges || !this.branchManager) {
      return null;
    }

    const existing = this.gitWatchers.get(projectPath);
    if (existing) {
      // Already watching this project
      return existing;
    }

    const watcher = new GitWatcher({
      enabled: true,
      pollIntervalMs: appConfig.git.pollIntervalMs || 5000,
      autoReindex: appConfig.git.autoReindex ?? true,
      watchUncommitted: appConfig.git.watchUncommitted ?? true,
      uncommittedPollIntervalMs: appConfig.git.uncommittedPollIntervalMs || 10000,
      includeUntracked: appConfig.git.includeUntracked ?? true,
      debounceMs: appConfig.git.debounceMs ?? 60_000,
      bulkModeThreshold: appConfig.git.bulkModeThreshold ?? 1000,
    });

    // Close over projectPath so callbacks always use the correct context
    const ctx = () => this.getGitEventContextForProject(projectPath);

    watcher.onBranchChange(async (newBranch, oldBranch) => {
      await handleBranchChangeEvent(newBranch, oldBranch, ctx());
    });

    watcher.onUncommittedChange(async (files) => {
      await handleUncommittedChangesEvent(files, ctx());
    });

    watcher.onDebouncedChange(async (files, bulkMode) => {
      await handleDebouncedEmbeddingEvent(files, bulkMode, ctx());
    });

    this.gitWatchers.set(projectPath, watcher);
    watcher.startWatching(projectPath);
    log.i("INDEXER", "git_watcher_started", { repository: projectPath, totalWatchers: this.gitWatchers.size });

    return watcher;
  }

  /**
   * Get BranchManager instance
   */
  getBranchManager(): BranchManager | null {
    return this.branchManager;
  }

  /**
   * Get GitWatcher instance for current or specific project
   */
  getGitWatcher(projectPath?: string): GitWatcher | null {
    const path = projectPath || this.currentRepositoryPath;
    return path ? (this.gitWatchers.get(path) ?? null) : null;
  }

  /**
   * Get FileWatcher status for diagnostics
   */
  getFileWatcherStatus(): { exists: boolean; status?: unknown; lastError?: string | null } {
    if (!this.fileWatcher) {
      return { exists: false, lastError: this.lastFileWatcherError };
    }
    return {
      exists: true,
      status: this.fileWatcher.getStatus(),
      lastError: null,
    };
  }

  /**
   * Set current repository path and start watching if Git is enabled
   */
  async setRepositoryPath(path: string): Promise<void> {
    this.currentRepositoryPath = path;

    // Start per-project GitWatcher (reuses existing if already watching)
    this.getOrCreateWatcher(path);

    // Start FileWatcher for efficient file change detection
    // Uses glob-watch (fast-glob + fs.watch) with Watchman fallback
    log.d("INDEXER", "creating_filewatcher", { path });
    try {
      // Stop existing watcher if any
      if (this.fileWatcher) {
        log.d("INDEXER", "stopping_old_filewatcher");
        await this.fileWatcher.stop();
        this.fileWatcher = null;
      }

      const appConfig = getConfig();
      this.fileWatcher = await createFileWatcher({
        rootDir: path,
        include: [
          "**/*.ts",
          "**/*.tsx",
          "**/*.js",
          "**/*.jsx",
          "**/*.py",
          "**/*.go",
          "**/*.rs",
          "**/*.java",
          "**/*.kt",
          "**/*.cpp",
          "**/*.c",
          "**/*.h",
          "**/*.hpp",
        ],
        exclude: [
          "**/node_modules/**",
          "**/.git/**",
          "**/dist/**",
          "**/build/**",
          "**/.ultracode/**",
          "**/coverage/**",
          "**/__pycache__/**",
          "**/venv/**",
          "**/.venv/**",
        ],
        debounceMs: 100,
        bulkThreshold: appConfig.git?.bulkModeThreshold ?? 1000,
      });

      // Handle file changes - trigger incremental reindexing
      this.fileWatcher.on("change", (events: FileChangeEvent[], bulkMode: boolean) => {
        this.handleFileWatcherChanges(events, bulkMode).catch((err) => {
          log.e("INDEXER", "FileWatcher change handler error", { error: (err as Error).message });
        });

        // Forward to GitWatcher for uncommitted change tracking (replaces git status polling)
        const gitWatcher = this.gitWatchers.get(path);
        if (gitWatcher) {
          gitWatcher.notifyFileChange(events.map((e) => e.path));
        }
      });

      this.fileWatcher.on("error", (err: Error) => {
        log.e("INDEXER", "FileWatcher error", { error: err.message });
      });

      log.i("INDEXER", "Started FileWatcher", { repository: path });
      this.lastFileWatcherError = null;
    } catch (err) {
      this.lastFileWatcherError = (err as Error).message;
      log.w("INDEXER", "Failed to start FileWatcher, using GitWatcher only", {
        error: this.lastFileWatcherError,
      });
    }
  }

  /**
   * Handle file changes detected by FileWatcher
   * Triggers incremental reindexing and debounced embedding generation
   */
  private async handleFileWatcherChanges(events: FileChangeEvent[], bulkMode: boolean): Promise<void> {
    if (events.length === 0) return;

    const changedFiles = events.filter((e) => e.type === "add" || e.type === "change").map((e) => e.path);

    const deletedFiles = events.filter((e) => e.type === "unlink").map((e) => e.path);

    log.d("INDEXER", "FileWatcher detected changes", {
      changed: changedFiles.length,
      deleted: deletedFiles.length,
      bulkMode,
    });

    // Handle changed files - trigger incremental reindexing
    if (changedFiles.length > 0) {
      await handleUncommittedChangesEvent(changedFiles, this.getGitEventContext());
    }

    // Deleted files — entities cleaned up on next full reindex via file_generations
    if (deletedFiles.length > 0) {
      log.d("INDEXER", "Detected deleted files (cleaned on reindex)", {
        count: deletedFiles.length,
        files: deletedFiles.slice(0, 5),
      });
    }

    // Schedule debounced embedding generation
    if (!bulkMode) {
      this.doScheduleEmbeddingGeneration();
    } else {
      // In bulk mode, trigger embedding generation after all changes processed
      await handleDebouncedEmbeddingEvent(changedFiles, bulkMode, this.getGitEventContext());
    }
  }

  /**
   * Shutdown the indexer agent
   */
  protected async onShutdown(): Promise<void> {
    log.i("INDEXER", "Shutting down...");

    // Cancel idle flush timer
    if (this.idleFlushAbort) {
      this.idleFlushAbort.abort();
      this.idleFlushAbort = null;
    }

    // Flush any remaining pending data
    if (this.pendingFilesCount > 0) {
      log.d("INDEXER", "shutdown_flush_pending", { pending: this.pendingFilesCount });
      try {
        await this.flushPendingBatch();
      } catch (err) {
        log.w("INDEXER", "shutdown_flush_failed", { error: (err as Error).message });
      }
    }

    // Stop FileWatcher
    if (this.fileWatcher) {
      try {
        await this.fileWatcher.stop();
        this.fileWatcher = null;
        log.d("INDEXER", "FileWatcher stopped");
      } catch (err) {
        log.w("INDEXER", "Error stopping FileWatcher", { error: (err as Error).message });
      }
    }

    // Stop all per-project GitWatchers
    for (const [path, watcher] of this.gitWatchers) {
      watcher.stopWatching();
      log.d("INDEXER", "git_watcher_stopped", { repository: path });
    }
    this.gitWatchers.clear();

    // Unsubscribe from knowledge bus
    try {
      for (const id of this.subscriptionIds) {
        knowledgeBus.unsubscribe(id);
      }
    } catch {}

    // Run final maintenance only if agent was initialized
    if (this.ready) {
      try {
        await this.graphStorage.analyze();
      } catch (e) {
        log.w("INDEXER", "shutdown_analyze_skip", { err: (e as Error).message });
      }
    }

    // Clear cache
    try {
      this.cacheManager?.clear();
    } catch {}

    log.i("INDEXER", "shutdown_done", this.indexingStats);
  }

  /**
   * Get indexing statistics
   */
  getIndexingStats(): typeof this.indexingStats {
    return { ...this.indexingStats };
  }

  /**
   * Get storage metrics
   */
  async getStorageMetrics() {
    return await this.graphStorage.getMetrics();
  }

  /**
   * Perform maintenance operations
   */
  async performMaintenance(): Promise<void> {
    log.i("INDEXER", "maint_start");

    // Vacuum database
    await this.graphStorage.vacuum();

    // Analyze for query optimization
    await this.graphStorage.analyze();

    // Prune cache
    this.cacheManager.prune();

    // Optimize batch size based on performance
    const avgTime = this.indexingStats.totalIndexTime / Math.max(1, this.indexingStats.filesProcessed);
    this.batchOps.optimizeBatchSize(avgTime);

    log.i("INDEXER", "maint_done");
  }
}
