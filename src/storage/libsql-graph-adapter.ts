/**
 * LibSQL Graph Adapter - Unified Graph + Vector Storage
 *
 * Uses libSQL (Turso's SQLite fork) for both graph entities/relationships
 * AND vector embeddings with DiskANN index.
 *
 * Benefits of unified storage:
 * - Single database file for all data
 * - Consistent async API throughout
 * - No synchronization issues between separate databases
 * - Atomic transactions across graph and vector operations
 *
 * Performance optimizations:
 * - LRUCache for embeddings and search results
 * - CBOR binary serialization for metadata (faster than JSON)
 * - p-map for parallel batch processing
 *
 * @see https://docs.turso.tech/features/ai-and-embeddings
 */

import type { Client } from "@libsql/client";
import * as cbor from "cbor-x";
import { LRUCache } from "lru-cache";
import { log } from "../logging/index.js";
import { normalizeBranchName } from "../shared/storage-paths.js";
import type { SimilarityResult, VectorEmbedding } from "../types/semantic.js";
import type {
  BatchResult,
  Entity,
  EntityQuery,
  EntityType,
  FileInfo,
  Relationship,
  RelationshipQuery,
  RelationType,
} from "../types/storage.js";
import { CacheOperations } from "./libsql/cache-ops.js";
import { CooccurrenceOperations } from "./libsql/cooccurrence-ops.js";
import { EntityOperations } from "./libsql/entity-ops.js";
import { GenerationManager } from "./libsql/generation-ops.js";
import { MetadataOperations } from "./libsql/metadata-ops.js";
import { RelationshipOperations } from "./libsql/relationship-ops.js";
import { getRequestContext } from "./libsql/request-context.js";
// Import shared types and operation classes from libsql/ modules
import {
  CACHE_CONFIG,
  DatabaseCorruptionError,
  DEFAULT_CONFIG,
  getEmbeddingColumn,
  type LibSQLGraphConfig,
  normalizeToSupportedDimension,
  type ProjectContext,
  SUPPORTED_DIMENSIONS,
  type SupportedDimension,
} from "./libsql/types.js";
import { VectorOperations, type VectorOpsContext } from "./libsql/vector-ops.js";
import type { MultiDbManager } from "./multi-db-manager.js";
// Prolly Tree components for versioned storage
import { BranchDiffCache, CommitManager, ProllyNodeStore, ProllyTree, serializeEntity } from "./prolly/index.js";

// Re-export types for backwards compatibility
export {
  type LibSQLGraphConfig,
  type ProjectContext,
  type SupportedDimension,
  SUPPORTED_DIMENSIONS,
  getEmbeddingColumn,
  normalizeToSupportedDimension,
  DatabaseCorruptionError,
};

// =============================================================================
// LIBSQL GRAPH ADAPTER
// =============================================================================

/**
 * Database row structure for Entity table (snake_case columns)
 */
interface EntityRow {
  id: string;
  name: string;
  type: string;
  file_path: string;
  location: string;
  metadata?: string | null;
  hash: string;
  created_at: number;
  updated_at: number;
  complexity_score?: number | null;
  language?: string | null;
  size_bytes?: number | null;
  embedding_base64?: string | null;
  embedding_text?: string | null;
}

/**
 * Database row structure for Relationship table (snake_case columns)
 */
interface RelationshipRow {
  id: string;
  from_id: string;
  to_id: string;
  type: string;
  metadata?: string | null;
  weight: number;
  created_at: number;
}

export class LibSQLGraphAdapter {
  private client: Client | null = null;
  private dbManager: MultiDbManager | null = null;
  private config: Required<LibSQLGraphConfig>;
  private isInitialized = false;
  private dbPath: string = "";

  // Current project context (will be set via setProject before use)
  private currentContext: ProjectContext = {
    projectHash: "_unset_",
    branchName: "_unset_",
  };

  // Performance caches
  private embeddingCache: LRUCache<string, VectorEmbedding>;
  private searchCache: LRUCache<string, SimilarityResult[]>;
  private metadataCache: LRUCache<string, Record<string, unknown>>;

  // Delegated operations (composition pattern)
  private entityOps: EntityOperations;
  private relationshipOps: RelationshipOperations;
  private vectorOps: VectorOperations;
  private cacheOps: CacheOperations;
  private metadataOps: MetadataOperations;
  private cooccurrenceOps: CooccurrenceOperations;
  private generationManager: GenerationManager;

  // Prolly Tree components for versioned graph storage
  private prollyNodeStore: ProllyNodeStore | null = null;
  private prollyTree: ProllyTree | null = null;
  private commitManager: CommitManager | null = null;
  private branchDiffCache: BranchDiffCache | null = null;

  constructor(config: LibSQLGraphConfig = {}, dbManager?: MultiDbManager) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.dbManager = dbManager ?? null;

    // Initialize caches
    this.embeddingCache = new LRUCache<string, VectorEmbedding>(CACHE_CONFIG.embeddingCache);
    this.searchCache = new LRUCache<string, SimilarityResult[]>(CACHE_CONFIG.searchCache);
    this.metadataCache = new LRUCache<string, Record<string, unknown>>(CACHE_CONFIG.metadataCache);

    // Initialize operation delegates
    // When multi-db is active, each ops class gets its own DB client
    const getGraphClient = () => this.dbManager?.getGraphClient() ?? this.client;
    const getSemanticClient = () => this.dbManager?.getSemanticClient() ?? this.client;
    const getCacheClient = () => this.dbManager?.getCacheClient() ?? this.client;
    const getContext = () => getRequestContext() ?? this.currentContext;

    this.generationManager = new GenerationManager(getGraphClient, getContext);
    this.entityOps = new EntityOperations(
      getGraphClient,
      getContext,
      (row) => this.rowToEntity(row as EntityRow),
      this.generationManager,
    );
    this.relationshipOps = new RelationshipOperations(getGraphClient, getContext, (row) =>
      this.rowToRelationship(row as RelationshipRow),
    );

    const vectorOpsContext: VectorOpsContext = {
      getClient: getGraphClient,
      getContext,
      config: this.config,
      getEffectiveDimensions: () => this.getEffectiveDimensions(),
      getEmbeddingColumnName: () => this.getEmbeddingColumnName(),
      vectorToString: (v) => this.vectorToString(v),
      stringToVector: (s) => this.stringToVector(s),
      encodeMetadata: (m) => this.encodeMetadata(m),
      decodeMetadata: (d) => this.decodeMetadata(d),
      embeddingCache: this.embeddingCache,
      searchCache: this.searchCache,
      ensureProjectVectorIndex: () => this.ensureProjectVectorIndex(),
    };
    this.vectorOps = new VectorOperations(vectorOpsContext);

    this.cacheOps = new CacheOperations(getCacheClient, (v) => this.vectorToString(v));
    this.metadataOps = new MetadataOperations(getGraphClient, getContext, getCacheClient);
    this.cooccurrenceOps = new CooccurrenceOperations(getSemanticClient, getContext);
  }

  // ===========================================================================
  // CBOR SERIALIZATION (faster than JSON for binary/metadata)
  // ===========================================================================

  private encodeMetadata(metadata: Record<string, unknown> | null | undefined): Buffer | null {
    if (!metadata) return null;
    try {
      return Buffer.from(cbor.encode(metadata));
    } catch {
      // Fallback to JSON if CBOR fails (e.g., unsupported types)
      return Buffer.from(JSON.stringify(metadata));
    }
  }

  private decodeMetadata(data: Buffer | Uint8Array | string | null): Record<string, unknown> | undefined {
    if (!data) return undefined;

    // Check cache first (optimization: only convert first 48 bytes to base64 → ~64 chars)
    let cacheKey: string;
    if (typeof data === "string") {
      cacheKey = data.length <= 64 ? data : data.slice(0, 64);
    } else {
      // Only encode first 48 bytes (produces ~64 base64 chars) instead of full buffer
      const slice = data.length <= 48 ? data : data.slice(0, 48);
      cacheKey = Buffer.from(slice).toString("base64");
    }
    const cached = this.metadataCache.get(cacheKey);
    if (cached) return cached;

    try {
      let result: Record<string, unknown>;

      if (typeof data === "string") {
        // Legacy JSON string
        result = JSON.parse(data);
      } else {
        // Try CBOR first, fallback to JSON
        try {
          result = cbor.decode(data instanceof Uint8Array ? data : Buffer.from(data));
        } catch {
          result = JSON.parse(Buffer.from(data).toString("utf8"));
        }
      }

      this.metadataCache.set(cacheKey, result);
      return result;
    } catch {
      return undefined;
    }
  }

  // ===========================================================================
  // INITIALIZATION
  // ===========================================================================

  async initialize(dbPath: string, retryAfterCorruption = true): Promise<boolean> {
    const startTime = Date.now();
    const useMultiDb = this.dbManager?.isInitialized === true;
    log.t("STORAGE", `[LibSQLGraphAdapter] ▶ initialize() START at ${dbPath} (multiDb=${useMultiDb})`);
    try {
      this.dbPath = dbPath;

      if (useMultiDb) {
        // Multi-DB mode: clients already created by MultiDbManager
        // Use graph client as the "primary" for legacy code paths
        this.client = this.dbManager!.getGraphClient();
      } else {
        // Legacy single-DB mode
        log.t("STORAGE", `[LibSQLGraphAdapter] ▶ cleanupStaleLocks`);
        await this.cleanupStaleLocks(dbPath);
        log.t("STORAGE", `[LibSQLGraphAdapter] ◀ cleanupStaleLocks (${Date.now() - startTime}ms)`);

        log.t("STORAGE", `[LibSQLGraphAdapter] ▶ import @libsql/client`);
        const importStart = Date.now();
        const { createClient } = await import("@libsql/client");
        log.t("STORAGE", `[LibSQLGraphAdapter] ◀ import @libsql/client (${Date.now() - importStart}ms)`);

        log.t("STORAGE", `[LibSQLGraphAdapter] ▶ createClient`);
        const clientStart = Date.now();
        this.client = createClient({
          url: `file:${dbPath}`,
        });

        // Verify connection
        await this.client.execute("SELECT 1");
        log.t("STORAGE", `[LibSQLGraphAdapter] ◀ createClient + verify (${Date.now() - clientStart}ms)`);

        await this.client.execute("PRAGMA busy_timeout = 5000");
        await this.client.execute("PRAGMA cache_size = -8192");
        await this.client.execute("PRAGMA temp_store = MEMORY");
        await this.client.execute("PRAGMA mmap_size = 0");
        await this.client.execute("PRAGMA journal_mode = OFF");
        await this.client.execute("PRAGMA synchronous = OFF");
      }

      // Async integrity check on graph client
      this.quickIntegrityCheck()
        .then(() => log.i("LIBSQLADAPT", "integrity_passed"))
        .catch((err) => log.e("LIBSQLADAPT", "integrity_error", { err: (err as Error).message }));

      // Create tables (split across DBs in multi-db mode)
      log.t("STORAGE", `[LibSQLGraphAdapter] ▶ createTables`);
      const tablesStart = Date.now();
      await this.createTables();
      log.t("STORAGE", `[LibSQLGraphAdapter] ◀ createTables (${Date.now() - tablesStart}ms)`);

      // Migration: add file_gen column to entities if missing
      await this.migrateFileGen();

      // Wire up tombstone delegates for layered branch support
      this.entityOps.setTombstoneDelegates(
        (id, type) => this.addTombstone(id, type),
        (type) => this.getTombstonedIds(type),
      );
      this.relationshipOps.setTombstoneDelegates(
        (id, type) => this.addTombstone(id, type),
        (type) => this.getTombstonedIds(type),
      );

      // Initialize Prolly Tree components for versioned storage
      log.t("STORAGE", `[LibSQLGraphAdapter] ▶ initProllyComponents`);
      const prollyStart = Date.now();
      await this.initializeProllyComponents();
      log.t("STORAGE", `[LibSQLGraphAdapter] ◀ initProllyComponents (${Date.now() - prollyStart}ms)`);

      this.isInitialized = true;
      log.t("STORAGE", `[LibSQLGraphAdapter] ◀ initialize() END (${Date.now() - startTime}ms)`);
      log.i("LIBSQLADAPT", "init_complete", {
        path: dbPath,
        mode: useMultiDb ? "multi-db" : "single-db",
      });
      return true;
    } catch (error) {
      const errorMessage = (error as Error).message || String(error);

      // Detect database corruption
      const isCorrupted =
        errorMessage.includes("SQLITE_CORRUPT") ||
        errorMessage.includes("database disk image is malformed") ||
        errorMessage.includes("file is not a database") ||
        errorMessage.includes("database or disk is full");

      if (isCorrupted && retryAfterCorruption) {
        log.e("LIBSQLADAPT", "corruption_detected", { err: errorMessage });
        log.i("LIBSQLADAPT", "recreating_db");

        // Close any existing client (in single-db mode)
        if (!useMultiDb && this.client) {
          try {
            this.client.close();
          } catch {
            // Ignore close errors on corrupt db
          }
          this.client = null;
        }

        // Delete corrupt database and auxiliary files
        if (useMultiDb && this.dbManager) {
          await this.dbManager.close();
          const deleted = await this.dbManager.deleteAll();
          if (deleted) {
            log.i("LIBSQLADAPT", "corrupt_dbs_deleted");
            // Re-initialize MultiDbManager
            const paths = this.dbManager.getPaths();
            if (paths) {
              const { dirname } = await import("node:path");
              await this.dbManager.initialize(dirname(paths.graph));
              this.client = this.dbManager.getGraphClient();
            }
            return this.initialize(dbPath, false);
          }
        } else {
          const deleted = await this.deleteCorruptDatabase(dbPath);
          if (deleted) {
            log.i("LIBSQLADAPT", "corrupt_db_deleted");
            return this.initialize(dbPath, false);
          }
        }

        log.e("LIBSQLADAPT", "corrupt_db_delete_fail");
        return false;
      }

      // Retry on SQLITE_BUSY (database locked by another process during restart)
      const isBusy = errorMessage.includes("SQLITE_BUSY") || errorMessage.includes("database is locked");

      if (isBusy && retryAfterCorruption) {
        log.w("LIBSQLADAPT", "busy_retry", { err: errorMessage });

        if (!useMultiDb && this.client) {
          try {
            this.client.close();
          } catch {
            /* ignore */
          }
          this.client = null;
        }

        for (let attempt = 1; attempt <= 3; attempt++) {
          const delay = attempt * 2000;
          log.i("LIBSQLADAPT", "busy_wait", { attempt, delay });
          await new Promise((r) => setTimeout(r, delay));

          try {
            return await this.initialize(dbPath, false);
          } catch (retryErr) {
            const retryMsg = (retryErr as Error).message || "";
            if (!retryMsg.includes("SQLITE_BUSY") && !retryMsg.includes("database is locked")) {
              throw retryErr;
            }
            log.w("LIBSQLADAPT", "busy_retry_fail", { attempt, err: retryMsg });
          }
        }
        log.e("LIBSQLADAPT", "busy_exhausted", { retries: 3 });
        return false;
      }

      log.e("LIBSQLADAPT", "init_fail", { err: String(error) });
      return false;
    }
  }

  /**
   * Delete corrupt database and all auxiliary files.
   * Called automatically when SQLITE_CORRUPT is detected.
   */
  private async deleteCorruptDatabase(dbPath: string): Promise<boolean> {
    const { unlink, stat } = await import("node:fs/promises");

    const filesToDelete = [dbPath, `${dbPath}-journal`, `${dbPath}-wal`, `${dbPath}-shm`];

    let anyDeleted = false;

    for (const file of filesToDelete) {
      try {
        const fileStats = await stat(file);
        const sizeMB = (fileStats.size / 1024 / 1024).toFixed(1);
        await unlink(file);
        log.i("LIBSQLADAPT", "file_deleted", { file, sizeMB });
        anyDeleted = true;
      } catch (error) {
        // File doesn't exist or permission error - OK
        const err = error as NodeJS.ErrnoException;
        if (err.code !== "ENOENT") {
          log.w("LIBSQLADAPT", "file_delete_fail", { file, err: err.message });
        }
      }
    }

    return anyDeleted;
  }

  /**
   * Quick integrity check to detect corruption early.
   * Probes tables AND indexes to catch DiskANN corruption.
   * Much faster than full PRAGMA integrity_check.
   */
  private async quickIntegrityCheck(): Promise<void> {
    if (!this.client) return;

    // Check if main tables exist first
    const tables = await this.client.execute(`
      SELECT name FROM sqlite_master WHERE type='table'
      AND name IN ('entities', 'relationships', 'embeddings', 'files')
    `);

    if (tables.rows.length === 0) {
      // No tables yet - fresh database, skip integrity check
      return;
    }

    // Quick probe of each table to detect page corruption
    // NOTE: embeddings table removed in v5 - FAISS handles vector storage
    const probes = [
      "SELECT id FROM entities LIMIT 1",
      "SELECT id FROM relationships LIMIT 1",
      "SELECT path FROM files LIMIT 1",
    ];

    for (const probe of probes) {
      try {
        await this.client.execute(probe);
      } catch (error) {
        const msg = (error as Error).message || "";
        // Table doesn't exist is OK (fresh db)
        if (msg.includes("no such table")) continue;
        // Re-throw to trigger corruption handling
        throw error;
      }
    }

    // Run PRAGMA quick_check - fast check for corruption (vs slow integrity_check)
    // quick_check is ~100x faster on large databases while catching most issues
    const integrityCheck = await this.client.execute("PRAGMA quick_check");
    const firstRow = integrityCheck.rows[0];
    const result = firstRow ? String(Object.values(firstRow)[0]) : "ok";
    if (result !== "ok") {
      throw new Error(`SQLITE_CORRUPT: quick_check failed: ${result}`);
    }

    // NOTE: embeddings table removed in v5 - FAISS handles vector storage
    // Probe DiskANN shadow tables - corruption often hides here (legacy check)
    try {
      const shadowTables = await this.client.execute(`
        SELECT name FROM sqlite_master
        WHERE type='table' AND name LIKE '%shadow%'
      `);
      for (const row of shadowTables.rows) {
        const tableName = row["name"] as string;
        try {
          await this.client.execute(`SELECT COUNT(*) FROM "${tableName}"`);
        } catch (shadowError) {
          const smsg = (shadowError as Error).message || "";
          log.e("LIBSQLADAPT", "shadow_table_corrupt", { table: tableName, err: smsg });
          throw shadowError;
        }
      }
      log.i("LIBSQLADAPT", "shadow_tables_ok");
    } catch (error) {
      const msg = (error as Error).message || "";
      if (!msg.includes("no such table") && !msg.includes("All shadow")) {
        throw error;
      }
    }

    log.i("LIBSQLADAPT", "integrity_passed");
  }

  /**
   * Remove stale SQLite lock files before opening database.
   * Safe in single-user mode where we're the only consumer.
   */
  private async cleanupStaleLocks(dbPath: string): Promise<void> {
    const { unlink } = await import("node:fs/promises");
    const lockFiles = [`${dbPath}-journal`, `${dbPath}-wal`, `${dbPath}-shm`];

    for (const lockFile of lockFiles) {
      try {
        await unlink(lockFile);
        log.i("LIBSQLADAPT", "stale_lock_removed", { file: lockFile });
      } catch {
        // File doesn't exist or already removed - OK
      }
    }
  }

  private async createTables(): Promise<void> {
    const useMultiDb = this.dbManager?.isInitialized === true;
    const startTime = Date.now();

    if (useMultiDb) {
      // Multi-DB mode: create tables in parallel across 4 databases
      await Promise.all([
        this.createGraphTables(this.dbManager!.getGraphClient()!),
        this.createSemanticTables(this.dbManager!.getSemanticClient()!),
        this.createVersioningTables(this.dbManager!.getVersioningClient()!),
        this.createCacheTables(this.dbManager!.getCacheClient()!),
      ]);
    } else {
      // Legacy single-DB mode: all tables in one client
      if (!this.client) throw new Error("Client not initialized");
      await this.createGraphTables(this.client);
      await this.createSemanticTables(this.client);
      // Versioning tables are created by ProllyNodeStore/CommitManager in initializeProllyComponents
      await this.createCacheTables(this.client);
    }

    const batchElapsed = Date.now() - startTime;
    log.i("STORAGE", `Tables and basic indexes created`, {
      ms: batchElapsed,
      mode: useMultiDb ? "multi-db" : "single-db",
    });
    log.i("STORAGE", `Skipping global DiskANN index (using partial indexes per project)`);

    const totalElapsed = Date.now() - startTime;
    log.i("STORAGE", `Total initialization complete`, { ms: totalElapsed });

    // Log memory and libsql stats after init
    await this.logDatabaseStats("after_init");
  }

  /**
   * Create graph tables: entities, relationships, files, file_generations,
   * tombstones, name_tokens, project_metadata + indexes
   */
  private async createGraphTables(client: Client): Promise<void> {
    await client.batch(
      [
        `CREATE TABLE IF NOT EXISTS entities (
        id TEXT NOT NULL,
        project_hash TEXT NOT NULL DEFAULT 'legacy',
        branch_name TEXT NOT NULL DEFAULT 'main',
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        file_path TEXT NOT NULL,
        location TEXT NOT NULL,
        metadata TEXT,
        hash TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        complexity_score INTEGER DEFAULT 1,
        language TEXT,
        size_bytes INTEGER DEFAULT 0,
        embedding_base64 TEXT,
        embedding_text TEXT,
        file_gen INTEGER NOT NULL DEFAULT 1,
        PRIMARY KEY (id, project_hash, branch_name)
      )`,
        `CREATE TABLE IF NOT EXISTS relationships (
        id TEXT NOT NULL,
        project_hash TEXT NOT NULL DEFAULT 'legacy',
        branch_name TEXT NOT NULL DEFAULT 'main',
        from_id TEXT NOT NULL,
        to_id TEXT NOT NULL,
        type TEXT NOT NULL,
        metadata TEXT,
        weight REAL DEFAULT 1.0,
        created_at INTEGER NOT NULL,
        PRIMARY KEY (id, project_hash, branch_name)
      )`,
        `CREATE TABLE IF NOT EXISTS files (
        path TEXT NOT NULL,
        project_hash TEXT NOT NULL DEFAULT 'legacy',
        branch_name TEXT NOT NULL DEFAULT 'main',
        hash TEXT,
        last_indexed INTEGER NOT NULL,
        entity_count INTEGER DEFAULT 0,
        PRIMARY KEY (path, project_hash, branch_name)
      )`,
        `CREATE TABLE IF NOT EXISTS project_metadata (
        project_hash TEXT NOT NULL,
        branch_name TEXT NOT NULL DEFAULT 'main',
        project_path TEXT NOT NULL,
        last_indexed_at INTEGER NOT NULL,
        entity_count INTEGER DEFAULT 0,
        file_count INTEGER DEFAULT 0,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        last_full_index_at INTEGER DEFAULT 0,
        incremental_changes_count INTEGER DEFAULT 0,
        PRIMARY KEY (project_hash, branch_name)
      )`,
        `CREATE TABLE IF NOT EXISTS tombstones (
        entity_id TEXT NOT NULL,
        project_hash TEXT NOT NULL,
        branch_name TEXT NOT NULL,
        entity_type TEXT NOT NULL DEFAULT 'entity',
        deleted_at INTEGER NOT NULL,
        PRIMARY KEY (entity_id, project_hash, branch_name, entity_type)
      )`,
        `CREATE TABLE IF NOT EXISTS file_generations (
        file_path TEXT NOT NULL,
        project_hash TEXT NOT NULL,
        branch_name TEXT NOT NULL,
        active_gen INTEGER NOT NULL DEFAULT 1,
        updated_at INTEGER NOT NULL,
        PRIMARY KEY (file_path, project_hash, branch_name)
      )`,
        `CREATE TABLE IF NOT EXISTS name_tokens (
        token TEXT NOT NULL,
        entity_id TEXT NOT NULL,
        project_hash TEXT NOT NULL,
        branch_name TEXT NOT NULL,
        PRIMARY KEY (token, entity_id, project_hash, branch_name)
      )`,
        // Indexes
        `CREATE INDEX IF NOT EXISTS idx_entities_project_branch ON entities(project_hash, branch_name)`,
        `CREATE INDEX IF NOT EXISTS idx_entities_file_path ON entities(file_path, project_hash, branch_name)`,
        `CREATE INDEX IF NOT EXISTS idx_entities_type ON entities(type, project_hash, branch_name)`,
        `CREATE INDEX IF NOT EXISTS idx_entities_name ON entities(name, project_hash, branch_name)`,
        `CREATE INDEX IF NOT EXISTS idx_relationships_project_branch ON relationships(project_hash, branch_name)`,
        `CREATE INDEX IF NOT EXISTS idx_relationships_from ON relationships(from_id, project_hash, branch_name)`,
        `CREATE INDEX IF NOT EXISTS idx_relationships_to ON relationships(to_id, project_hash, branch_name)`,
        `CREATE INDEX IF NOT EXISTS idx_files_project_branch ON files(project_hash, branch_name)`,
        `CREATE INDEX IF NOT EXISTS idx_tombstones_lookup ON tombstones(project_hash, branch_name, entity_type)`,
        `CREATE INDEX IF NOT EXISTS idx_name_tokens_lookup ON name_tokens(token, project_hash, branch_name)`,
        `CREATE INDEX IF NOT EXISTS idx_entities_file_gen ON entities(file_path, project_hash, branch_name, file_gen)`,
      ],
      "write",
    );
  }

  /**
   * Create semantic tables: cooccurrence, term_frequency + indexes
   */
  private async createSemanticTables(client: Client): Promise<void> {
    await client.batch(
      [
        `CREATE TABLE IF NOT EXISTS cooccurrence (
          term1 TEXT NOT NULL,
          term2 TEXT NOT NULL,
          count INTEGER NOT NULL DEFAULT 1,
          pmi REAL,
          project_hash TEXT NOT NULL,
          branch_name TEXT NOT NULL DEFAULT 'main',
          updated_at INTEGER NOT NULL,
          PRIMARY KEY (term1, term2, project_hash, branch_name)
        )`,
        `CREATE TABLE IF NOT EXISTS term_frequency (
          term TEXT NOT NULL,
          doc_count INTEGER NOT NULL DEFAULT 1,
          total_count INTEGER NOT NULL DEFAULT 1,
          project_hash TEXT NOT NULL,
          branch_name TEXT NOT NULL DEFAULT 'main',
          PRIMARY KEY (term, project_hash, branch_name)
        )`,
        `CREATE INDEX IF NOT EXISTS idx_cooc_term1 ON cooccurrence(term1, project_hash, branch_name)`,
        `CREATE INDEX IF NOT EXISTS idx_cooc_pmi ON cooccurrence(pmi DESC, project_hash, branch_name)`,
        `CREATE INDEX IF NOT EXISTS idx_term_freq_project ON term_frequency(project_hash, branch_name)`,
      ],
      "write",
    );
  }

  /**
   * Create versioning tables: prolly_nodes, graph_commits, branch_heads
   * Note: In multi-db mode these are created on the versioning client.
   * In single-db mode, ProllyNodeStore/CommitManager create them on the shared client.
   */
  /**
   * Create versioning tables on the versioning client.
   * In multi-db mode, called here so tables exist before ProllyNodeStore/CommitManager
   * call their own createTable() with IF NOT EXISTS (idempotent).
   * We use the exact same schemas as ProllyNodeStore and CommitManager.
   */
  private async createVersioningTables(_client: Client): Promise<void> {
    // Tables are created by ProllyNodeStore.initialize() and CommitManager.initialize()
    // which are called in initializeProllyComponents() with the correct client.
    // No need to duplicate DDL here — just a no-op placeholder for the parallel call.
  }

  /**
   * Create cache tables: embedding_cache, query_cache, performance_metrics
   */
  private async createCacheTables(client: Client): Promise<void> {
    await client.batch(
      [
        `CREATE TABLE IF NOT EXISTS embedding_cache (
          content_hash TEXT PRIMARY KEY,
          model TEXT NOT NULL,
          embedding BLOB NOT NULL,
          text_preview TEXT,
          created_at INTEGER NOT NULL,
          last_used_at INTEGER NOT NULL,
          hit_count INTEGER DEFAULT 0
        )`,
        `CREATE TABLE IF NOT EXISTS query_cache (
        id TEXT NOT NULL,
        project_hash TEXT NOT NULL DEFAULT 'legacy',
        branch_name TEXT NOT NULL DEFAULT 'main',
        query_hash TEXT NOT NULL,
        result TEXT NOT NULL,
        hit_count INTEGER DEFAULT 0,
        miss_count INTEGER DEFAULT 0,
        created_at INTEGER NOT NULL,
        expires_at INTEGER NOT NULL,
        PRIMARY KEY (id, project_hash, branch_name)
      )`,
        `CREATE TABLE IF NOT EXISTS performance_metrics (
        id TEXT PRIMARY KEY,
        operation TEXT NOT NULL,
        duration_ms INTEGER NOT NULL,
        entity_count INTEGER DEFAULT 0,
        memory_usage INTEGER DEFAULT 0,
        created_at INTEGER NOT NULL
      )`,
      ],
      "write",
    );
  }

  /**
   * Log database statistics and memory usage for diagnostics.
   */
  async logDatabaseStats(label: string): Promise<void> {
    if (!this.client) return;

    try {
      // Get libsql/sqlite stats
      const pageCount = await this.client.execute("PRAGMA page_count");
      const pageSize = await this.client.execute("PRAGMA page_size");
      const cacheSize = await this.client.execute("PRAGMA cache_size");
      const freelistCount = await this.client.execute("PRAGMA freelist_count");

      const pages = Number(pageCount.rows[0]?.["page_count"] ?? 0);
      const size = Number(pageSize.rows[0]?.["page_size"] ?? 4096);
      const cache = Number(cacheSize.rows[0]?.["cache_size"] ?? 0);
      const freelist = Number(freelistCount.rows[0]?.["freelist_count"] ?? 0);

      const dbSizeMB = (pages * size) / 1024 / 1024;
      const cacheMB = cache < 0 ? -cache / 1024 : (cache * size) / 1024 / 1024;

      log.i("STORAGE", label, {
        dbSizeMB: dbSizeMB.toFixed(1),
        pages,
        pageSize: size,
        cacheSizeMB: cacheMB.toFixed(1),
        freelistPages: freelist,
      });

      // Log process memory
      const mem = process.memoryUsage();
      log.i("STORAGE", label, {
        rssMB: Math.round(mem.rss / 1024 / 1024),
        heapUsedMB: Math.round(mem.heapUsed / 1024 / 1024),
        externalMB: Math.round(mem.external / 1024 / 1024),
        arrayBuffersMB: Math.round(mem.arrayBuffers / 1024 / 1024),
      });
    } catch (error) {
      log.d("STORAGE", "Failed to get stats", { error: (error as Error).message });
    }
  }

  /**
   * Migration: Add file_gen column to entities table if missing.
   * Also backfills file_generations for existing data.
   */
  private async migrateFileGen(): Promise<void> {
    if (!this.client) return;

    // Check if column already exists
    try {
      await this.client.execute("SELECT file_gen FROM entities LIMIT 0");
      return; // Column exists, skip migration
    } catch {
      // Column doesn't exist, add it
    }

    log.i("LIBSQLADAPT", "migrate_file_gen_start");
    const start = Date.now();

    await this.client.execute("ALTER TABLE entities ADD COLUMN file_gen INTEGER NOT NULL DEFAULT 1");

    // Backfill file_generations from existing entities
    await this.client.execute(`
      INSERT OR IGNORE INTO file_generations (file_path, project_hash, branch_name, active_gen, updated_at)
      SELECT DISTINCT file_path, project_hash, branch_name, 1, ${Date.now()}
      FROM entities
    `);

    log.i("LIBSQLADAPT", "migrate_file_gen_done", { ms: Date.now() - start });
  }

  isReady(): boolean {
    return this.isInitialized && this.client !== null;
  }

  getDbPath(): string {
    return this.dbPath;
  }

  // ===========================================================================
  // PROJECT CONTEXT
  // ===========================================================================

  setProjectContext(context: ProjectContext): void {
    this.currentContext = {
      projectHash: context.projectHash,
      branchName: normalizeBranchName(context.branchName),
      baseBranch: context.baseBranch, // For layered reads on feature branches
      dimensions: context.dimensions,
    };
    // Clear generation cache on context switch — will be lazy-loaded on first use
    this.generationManager.clearCache();
    log.d("LIBSQLADAPT", "setProjectContext", {
      branch: this.currentContext.branchName,
      base: context.baseBranch || "none",
    });
  }

  getProjectContext(): ProjectContext {
    return { ...this.currentContext };
  }

  /**
   * Get effective dimensions for current project.
   * Uses project-specific dimensions if set, otherwise global config.
   */
  getEffectiveDimensions(): SupportedDimension {
    return this.currentContext.dimensions ?? normalizeToSupportedDimension(this.config.dimensions);
  }

  /**
   * Get embedding column name for current project's dimensions.
   */
  getEmbeddingColumnName(): string {
    return getEmbeddingColumn(this.getEffectiveDimensions());
  }

  async ensureProjectVectorIndex(): Promise<void> {
    if (!this.client) return;
    const { projectHash } = this.currentContext;
    const dims = this.getEffectiveDimensions();
    const colName = getEmbeddingColumn(dims);
    // Include dimensions in index name to support different dims per project
    const indexName = `idx_emb_${dims}_${projectHash.substring(0, 8)}`;
    try {
      const check = await this.client.execute({
        sql: `SELECT name FROM sqlite_master WHERE type='index' AND name=?`,
        args: [indexName],
      });
      if (check.rows.length > 0) return;
      const params = [
        `'metric=${this.config.metric}'`,
        `'compress_neighbors=${this.config.compression}'`,
        `'max_neighbors=${this.config.maxNeighbors}'`,
        `'search_l=${this.config.searchL}'`,
        `'insert_l=${this.config.insertL}'`,
      ].join(", ");
      const t = Date.now();
      await this.client.execute(
        `CREATE INDEX IF NOT EXISTS ${indexName} ON embeddings(libsql_vector_idx(${colName}, ${params})) WHERE project_hash = '${projectHash}' AND dim_size = ${dims}`,
      );
      log.i("STORAGE", `Created partial index`, { indexName, dims, ms: Date.now() - t });
    } catch (e) {
      log.w("STORAGE", `Partial index failed`, { error: (e as Error).message });
    }
  }

  // ===========================================================================
  // ENTITY OPERATIONS (delegated to EntityOperations)
  // ===========================================================================

  insertEntity = (entity: Entity): Promise<void> => this.entityOps.insertEntity(entity);
  insertEntities = (entities: Entity[]): Promise<BatchResult> => this.entityOps.insertEntities(entities);
  getEntity = (id: string): Promise<Entity | null> => this.entityOps.getEntity(id);
  getEntitiesBatch = (ids: string[]): Promise<Map<string, Entity>> => this.entityOps.getEntitiesBatch(ids);

  findEntities(query: EntityQuery): Promise<Entity[]> {
    return this.entityOps.findEntities(query);
  }

  searchEntities = (options: {
    namePattern?: string | undefined;
    types?: EntityType[] | undefined;
    filePath?: string | undefined;
    limit?: number;
  }): Promise<Entity[]> => this.entityOps.searchEntities(options);

  searchEntitiesInDirectory = (directoryPath: string): Promise<Entity[]> =>
    this.entityOps.searchEntitiesInDirectory(directoryPath);

  deleteEntity = (id: string): Promise<void> => this.entityOps.deleteEntity(id);

  getEntityIdsByFilePath = (filePath: string): Promise<string[]> => this.entityOps.getEntityIdsByFilePath(filePath);

  deleteEntitiesByFilePath = (filePath: string): Promise<string[]> => this.entityOps.deleteEntitiesByFilePath(filePath);

  getAllEntities = (): Promise<Entity[]> => this.entityOps.getAllEntities();

  countByLanguage = (): Promise<Map<string, { count: number; fileCount: number }>> => this.entityOps.countByLanguage();

  /** Get GenerationManager for GC scheduling */
  getGenerationManager(): GenerationManager {
    return this.generationManager;
  }

  /** Load generation cache (call after setProjectContext) */
  async loadGenerationCache(): Promise<void> {
    await this.generationManager.loadCache();
  }

  // ===========================================================================
  // RELATIONSHIP OPERATIONS (delegated to RelationshipOperations)
  // ===========================================================================

  insertRelationship = (relationship: Relationship): Promise<void> =>
    this.relationshipOps.insertRelationship(relationship);

  insertRelationships = (relationships: Relationship[]): Promise<BatchResult> =>
    this.relationshipOps.insertRelationships(relationships);

  getRelationshipsForEntity = (entityId: string, type?: RelationType): Promise<Relationship[]> =>
    this.relationshipOps.getRelationshipsForEntity(entityId, type);

  findRelationships = (query: RelationshipQuery): Promise<Relationship[]> =>
    this.relationshipOps.findRelationships(query);

  deleteRelationship = (id: string): Promise<void> => this.relationshipOps.deleteRelationship(id);

  getAllRelationships = (): Promise<Relationship[]> => this.relationshipOps.getAllRelationships();

  // ===========================================================================
  // FILE/METADATA OPERATIONS (delegated to MetadataOperations)
  // ===========================================================================

  updateFileInfo = (info: FileInfo): Promise<void> => this.metadataOps.updateFileInfo(info);

  batchUpdateFileInfo = (infos: FileInfo[]): Promise<void> => this.metadataOps.batchUpdateFileInfo(infos);

  getFileInfo = (path: string): Promise<FileInfo | null> => this.metadataOps.getFileInfo(path);

  getOutdatedFiles = (since: number): Promise<FileInfo[]> => this.metadataOps.getOutdatedFiles(since);

  getAllIndexedFiles = (): Promise<Map<string, number>> => this.metadataOps.getAllIndexedFiles();

  deleteFileInfo = (path: string): Promise<void> => this.metadataOps.deleteFileInfo(path);

  // ===========================================================================
  // VECTOR OPERATIONS (delegated to VectorOperations)
  // ===========================================================================

  /** @deprecated Use FaissProvider.add() instead */
  insertEmbedding = (embedding: VectorEmbedding): Promise<void> => this.vectorOps.insertEmbedding(embedding);

  /** @deprecated Use FaissProvider.addBatch() instead */
  insertEmbeddingBatch = (embeddings: VectorEmbedding[]): Promise<void> =>
    this.vectorOps.insertEmbeddingBatch(embeddings);

  /** @deprecated Faiss HNSW handles live updates, no need to drop/rebuild */
  dropVectorIndex = (): Promise<void> => this.vectorOps.dropVectorIndex();

  /** @deprecated Faiss HNSW maintains index automatically, no rebuild needed */
  rebuildVectorIndex = (): Promise<void> => this.vectorOps.rebuildVectorIndex();

  /** @deprecated Use FaissProvider.addBatch() instead */
  bulkInsertEmbeddings = (embeddings: VectorEmbedding[]): Promise<void> =>
    this.vectorOps.bulkInsertEmbeddings(embeddings);

  /** @deprecated Use FaissProvider.search() instead */
  searchVectors = (queryVector: Float32Array, limit: number): Promise<SimilarityResult[]> =>
    this.vectorOps.searchVectors(queryVector, limit);

  /** @deprecated Use FaissProvider.getContent() instead */
  getEmbedding = (id: string): Promise<VectorEmbedding | null> => this.vectorOps.getEmbedding(id);

  /** @deprecated Use FaissProvider.remove() instead */
  deleteEmbedding = (id: string): Promise<void> => this.vectorOps.deleteEmbedding(id);

  /** @deprecated Use FaissProvider.getVectorCount() instead */
  getEmbeddingCount = (): Promise<number> => this.vectorOps.getEmbeddingCount();

  /** @deprecated Use FaissProvider.getExistingIds() instead */
  getExistingEmbeddingIds = (ids: string[]): Promise<Set<string>> => this.vectorOps.getExistingEmbeddingIds(ids);

  // ===========================================================================
  // EMBEDDING CACHE OPERATIONS (delegated to CacheOperations)
  // ===========================================================================

  getEmbeddingFromCache = (contentHash: string): Promise<Float32Array | null> =>
    this.cacheOps.getEmbeddingFromCache(contentHash);

  getEmbeddingsFromCache = (contentHashes: string[]): Promise<Map<string, Float32Array>> =>
    this.cacheOps.getEmbeddingsFromCache(contentHashes);

  setEmbeddingInCache = (
    contentHash: string,
    model: string,
    embedding: Float32Array,
    textPreview?: string,
  ): Promise<void> => this.cacheOps.setEmbeddingInCache(contentHash, model, embedding, textPreview);

  setEmbeddingsInCache = (
    entries: Array<{ contentHash: string; model: string; embedding: Float32Array; textPreview?: string }>,
  ): Promise<void> => this.cacheOps.setEmbeddingsInCache(entries);

  // ===========================================================================
  // METADATA OPERATIONS (delegated to MetadataOperations)
  // ===========================================================================

  updateProjectMetadata = (projectPath: string, isFullIndex?: boolean): Promise<void> =>
    this.metadataOps.updateProjectMetadata(projectPath, isFullIndex);

  getIncrementalTrackingInfo = (): Promise<{
    lastFullIndexAt: number;
    incrementalChangesCount: number;
    totalFiles: number;
  }> => this.metadataOps.getIncrementalTrackingInfo();

  recordIncrementalChanges = (changedFileCount: number): Promise<void> =>
    this.metadataOps.recordIncrementalChanges(changedFileCount);

  resetIncrementalTracking = (): Promise<void> => this.metadataOps.resetIncrementalTracking();

  listProjects = (): Promise<
    Array<{
      projectHash: string;
      branchName: string;
      projectPath: string;
      lastIndexedAt: number;
      entityCount: number;
      fileCount: number;
    }>
  > => this.metadataOps.listProjects();

  listBranches = (): Promise<string[]> => this.metadataOps.listBranches();

  // ===========================================================================
  // METRICS & STATS (delegated to MetadataOperations)
  // ===========================================================================

  getStats = (): Promise<{
    totalEntities: number;
    totalRelationships: number;
    totalFiles: number;
    totalEmbeddings: number;
  }> => this.metadataOps.getStats();

  getTotalStats = (): Promise<{
    totalEntities: number;
    totalRelationships: number;
    totalFiles: number;
    totalEmbeddings: number;
  }> => this.metadataOps.getTotalStats();

  // ===========================================================================
  // CLEAR OPERATIONS (delegated to MetadataOperations)
  // ===========================================================================

  clear = (): Promise<void> => this.metadataOps.clear();

  clearAll = (): Promise<void> => this.metadataOps.clearAll();

  // ===========================================================================
  // COOCCURRENCE OPERATIONS (for query expansion)
  // ===========================================================================

  /**
   * Get the CooccurrenceOperations instance for query expansion.
   * Used by CooccurrenceIndex to update/query term pairs.
   */
  getCooccurrenceOps(): CooccurrenceOperations {
    return this.cooccurrenceOps;
  }

  // ===========================================================================
  // TOMBSTONE OPERATIONS (for layered branch support)
  // ===========================================================================

  /**
   * Add a tombstone for an entity/relationship deleted on feature branch.
   * This prevents the deleted item from appearing in layered reads from base.
   */
  async addTombstone(entityId: string, entityType: "entity" | "relationship" = "entity"): Promise<void> {
    if (!this.client) throw new Error("Client not initialized");
    const { projectHash, branchName } = this.currentContext;

    await this.client.execute({
      sql: `INSERT OR REPLACE INTO tombstones (entity_id, project_hash, branch_name, entity_type, deleted_at)
            VALUES (?, ?, ?, ?, ?)`,
      args: [entityId, projectHash, branchName, entityType, Date.now()],
    });
  }

  /**
   * Remove a tombstone (when entity is re-added on feature branch).
   */
  async removeTombstone(entityId: string, entityType: "entity" | "relationship" = "entity"): Promise<void> {
    if (!this.client) throw new Error("Client not initialized");
    const { projectHash, branchName } = this.currentContext;

    await this.client.execute({
      sql: `DELETE FROM tombstones WHERE entity_id = ? AND project_hash = ? AND branch_name = ? AND entity_type = ?`,
      args: [entityId, projectHash, branchName, entityType],
    });
  }

  /**
   * Check if an entity is tombstoned on current feature branch.
   */
  async isTombstoned(entityId: string, entityType: "entity" | "relationship" = "entity"): Promise<boolean> {
    if (!this.client) throw new Error("Client not initialized");
    const { projectHash, branchName } = this.currentContext;

    const result = await this.client.execute({
      sql: `SELECT 1 FROM tombstones WHERE entity_id = ? AND project_hash = ? AND branch_name = ? AND entity_type = ? LIMIT 1`,
      args: [entityId, projectHash, branchName, entityType],
    });

    return result.rows.length > 0;
  }

  /**
   * Get all tombstoned entity IDs for current branch (for batch operations).
   */
  async getTombstonedIds(entityType: "entity" | "relationship" = "entity"): Promise<Set<string>> {
    if (!this.client) throw new Error("Client not initialized");
    const { projectHash, branchName } = this.currentContext;

    const result = await this.client.execute({
      sql: `SELECT entity_id FROM tombstones WHERE project_hash = ? AND branch_name = ? AND entity_type = ?`,
      args: [projectHash, branchName, entityType],
    });

    return new Set(result.rows.map((row) => row["entity_id"] as string));
  }

  /**
   * Clear all tombstones for current branch (used when merging to base).
   */
  async clearTombstones(): Promise<void> {
    if (!this.client) throw new Error("Client not initialized");
    const { projectHash, branchName } = this.currentContext;

    await this.client.execute({
      sql: `DELETE FROM tombstones WHERE project_hash = ? AND branch_name = ?`,
      args: [projectHash, branchName],
    });
  }

  /**
   * Force flush all pending writes to disk.
   * With journal_mode=OFF and synchronous=OFF, we need to close/reopen
   * to ensure OS buffers are flushed.
   */
  async flush(): Promise<void> {
    const startTime = Date.now();

    if (this.dbManager?.isInitialized) {
      // Multi-DB mode: flush all databases
      log.d("LIBSQLADAPT", "flush_start_multidb");
      await this.dbManager.flushAll();
      this.client = this.dbManager.getGraphClient();

      // Update client references in Prolly components
      const versioningClient = this.dbManager.getVersioningClient();
      if (this.prollyNodeStore && versioningClient) {
        this.prollyNodeStore.updateClient(versioningClient);
      }
      if (this.commitManager && versioningClient) {
        this.commitManager.updateClient(versioningClient);
      }

      log.i("LIBSQLADAPT", "flush_complete", { ms: Date.now() - startTime, mode: "multi-db" });
      return;
    }

    // Legacy single-DB flush
    if (!this.client || !this.dbPath) {
      log.w("LIBSQLADAPT", "flush_skipped", { hasClient: !!this.client, hasDbPath: !!this.dbPath });
      return;
    }

    log.d("LIBSQLADAPT", "flush_start");

    this.client.close();
    this.client = null;

    const { createClient } = await import("@libsql/client");
    this.client = createClient({ url: `file:${this.dbPath}` });

    await this.client!.execute("PRAGMA cache_size = -8192");
    await this.client!.execute("PRAGMA temp_store = MEMORY");
    await this.client!.execute("PRAGMA mmap_size = 0");
    await this.client!.execute("PRAGMA journal_mode = OFF");
    await this.client!.execute("PRAGMA synchronous = OFF");

    if (this.prollyNodeStore) {
      this.prollyNodeStore.updateClient(this.client!);
    }
    if (this.commitManager) {
      this.commitManager.updateClient(this.client!);
    }

    try {
      const { statSync } = await import("node:fs");
      const stats = statSync(this.dbPath!);
      log.i("LIBSQLADAPT", "flush_complete", { ms: Date.now() - startTime, sizeBytes: stats.size });
    } catch {
      log.i("LIBSQLADAPT", "flush_complete", { ms: Date.now() - startTime, sizeBytes: "unknown" });
    }
  }

  async close(): Promise<void> {
    if (this.dbManager?.isInitialized) {
      await this.dbManager.close();
      this.client = null;
      this.isInitialized = false;
      log.i("LIBSQLADAPT", "connection_closed", { mode: "multi-db" });
    } else if (this.client) {
      this.client.close();
      this.client = null;
      this.isInitialized = false;
      log.i("LIBSQLADAPT", "connection_closed");
    }
  }

  // ===========================================================================
  // HELPER METHODS
  // ===========================================================================

  private _langDebugDone = false;
  private rowToEntity(row: EntityRow): Entity {
    // DEBUG: Check raw row structure once
    const rawRow = row as unknown as Record<string, unknown>;
    if (!this._langDebugDone && rawRow["language"]) {
      log.w("ADAPTER", "rowToEntity_debug", {
        hasLang: "language" in row,
        langVal: row.language,
        rawLang: String(rawRow["language"]),
      });
      this._langDebugDone = true;
    }
    return {
      id: row.id,
      name: row.name,
      type: row.type as EntityType,
      filePath: row.file_path,
      location: JSON.parse(row.location),
      metadata: row.metadata ? JSON.parse(row.metadata) : {},
      hash: row.hash || "",
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      complexityScore: row.complexity_score ?? undefined,
      language: row.language ?? undefined,
      sizeBytes: row.size_bytes ?? undefined,
      embeddingBase64: row.embedding_base64 ?? undefined,
      embeddingText: row.embedding_text ?? undefined,
    };
  }

  private rowToRelationship(row: RelationshipRow): Relationship {
    return {
      id: row.id,
      fromId: row.from_id,
      toId: row.to_id,
      type: row.type as RelationType,
      metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
      weight: row.weight,
      createdAt: row.created_at,
    };
  }

  private vectorToString(vector: Float32Array): string {
    const values = Array.from(vector).map((v) => v.toFixed(6));
    return `[${values.join(", ")}]`;
  }

  private stringToVector(str: string): Float32Array {
    const clean = str.replace(/[[\]]/g, "");
    const values = clean.split(",").map((s) => parseFloat(s.trim()));
    return new Float32Array(values);
  }

  // ===========================================================================
  // CACHE MANAGEMENT
  // ===========================================================================

  /**
   * Get cache statistics for monitoring
   */
  getCacheStats(): {
    embedding: { size: number; maxSize: number };
    search: { size: number; maxSize: number };
    metadata: { size: number; maxSize: number };
  } {
    return {
      embedding: {
        size: this.embeddingCache.size,
        maxSize: CACHE_CONFIG.embeddingCache.max,
      },
      search: {
        size: this.searchCache.size,
        maxSize: CACHE_CONFIG.searchCache.max,
      },
      metadata: {
        size: this.metadataCache.size,
        maxSize: CACHE_CONFIG.metadataCache.max,
      },
    };
  }

  /**
   * Clear all caches (useful after bulk operations or project switch)
   */
  clearCaches(): void {
    this.embeddingCache.clear();
    this.searchCache.clear();
    this.metadataCache.clear();
    log.i("CACHE", `All caches cleared`);
  }

  // ===========================================================================
  // PROLLY TREE OPERATIONS (versioned graph storage)
  // ===========================================================================

  /**
   * Initialize Prolly Tree components for versioned storage.
   * Called during adapter initialization.
   */
  private async initializeProllyComponents(): Promise<void> {
    // Use versioning client in multi-db mode, otherwise the shared client
    const versioningClient = this.dbManager?.isInitialized ? this.dbManager.getVersioningClient() : this.client;
    if (!versioningClient) throw new Error("Client not initialized");

    // Initialize node store (content-addressed storage)
    this.prollyNodeStore = new ProllyNodeStore();
    await this.prollyNodeStore.initialize(versioningClient);

    // Initialize commit manager (versioning)
    this.commitManager = new CommitManager();
    await this.commitManager.initialize(versioningClient);

    // Initialize Prolly tree (built on top of node store)
    this.prollyTree = new ProllyTree(this.prollyNodeStore);
    await this.prollyTree.initialize();

    // Initialize branch diff cache (O(1) lookups instead of tombstone queries)
    this.branchDiffCache = new BranchDiffCache(this.prollyNodeStore, this.commitManager);

    log.i("LIBSQLADAPT", "prolly_components_init", { components: 4 });
  }

  /**
   * Set Prolly Tree context for current project/branch.
   * Should be called after setProjectContext().
   */
  setProllyContext(projectHash: string, branchName: string): void {
    if (this.commitManager) {
      this.commitManager.setContext(projectHash, branchName);
    }
    log.d("LIBSQLADAPT", "prolly_context_set", { project: projectHash.slice(0, 8), branch: branchName });
  }

  /**
   * Get the Prolly Node Store for content-addressed storage operations.
   */
  getProllyNodeStore(): ProllyNodeStore | null {
    return this.prollyNodeStore;
  }

  /**
   * Get the Prolly Tree for tree operations (build, insert, delete, diff).
   */
  getProllyTree(): ProllyTree | null {
    return this.prollyTree;
  }

  /**
   * Get the Commit Manager for versioning operations.
   */
  getCommitManager(): CommitManager | null {
    return this.commitManager;
  }

  /**
   * Get the Branch Diff Cache for optimized branch reads.
   */
  getBranchDiffCache(): BranchDiffCache | null {
    return this.branchDiffCache;
  }

  /**
   * Create a new commit from current graph state.
   * Builds Prolly tree from entities and creates a versioned snapshot.
   */
  async createGraphCommit(message?: string): Promise<string | null> {
    if (!this.prollyTree || !this.commitManager) {
      log.w("LIBSQLADAPT", "prolly_not_ready");
      return null;
    }

    // Get all entities for current project/branch
    const entities = await this.entityOps.getAllEntities();
    const relationships = await this.relationshipOps.getAllRelationships();

    // Convert entities to Prolly tree entries
    const entries = entities.map((e) => ({
      key: e.id,
      value: serializeEntity(e),
    }));

    // Build Prolly tree from entities
    const rootHash = await this.prollyTree.build(entries);

    // Create commit
    const commit = await this.commitManager.commit(
      rootHash,
      null, // fileTreeHash - can be set via MerkleFileTracker
      { entityCount: entities.length, relationshipCount: relationships.length },
      message,
    );

    log.i("LIBSQLADAPT", "commit_created", {
      hash: commit.commitHash.slice(0, 8),
      entities: entities.length,
      relationships: relationships.length,
    });

    return commit.commitHash;
  }

  /** Timestamp of last GC run — used to rate-limit pruneAndGC() */
  private lastGcRunAt = 0;

  /**
   * Prune old commits for the current branch and garbage-collect orphaned
   * Prolly Tree nodes.  Rate-limited to run at most once per 10 minutes
   * unless `force` is true.
   *
   * @param keepCommits  Number of most-recent commits to keep per branch.
   * @param force        Skip the rate-limit check.
   * @returns Counts of pruned commits and GC-deleted nodes (or null if skipped).
   */
  async pruneAndGC(keepCommits = 20, force = false): Promise<{ pruned: number; gcDeleted: number } | null> {
    if (!this.commitManager || !this.prollyNodeStore) {
      return null;
    }

    // Rate-limit: skip if last run was < 10 min ago
    const now = Date.now();
    if (!force && now - this.lastGcRunAt < 10 * 60 * 1000) {
      return null;
    }
    this.lastGcRunAt = now;

    // 1. Prune this branch's history
    const pruned = await this.commitManager.pruneHistory(keepCommits);

    if (pruned === 0) return { pruned: 0, gcDeleted: 0 };

    // 2. Get ALL active root hashes (across all projects)
    const roots = await this.commitManager.getAllActiveRootHashes();

    // 3. Collect garbage — delete orphaned nodes
    const gcDeleted = await this.prollyNodeStore.collectGarbage([...roots]);

    // 4. VACUUM if significant cleanup (reclaim disk space)
    if (gcDeleted > 1000 && this.client) {
      await this.client.execute("VACUUM");
      log.i("LIBSQLADAPT", "vacuum_after_gc", { gcDeleted });
    }

    log.i("LIBSQLADAPT", "prune_gc_complete", { pruned, gcDeleted });
    return { pruned, gcDeleted };
  }

  /**
   * Initialize branch diff cache for optimized reads on feature branches.
   * Call this when switching to a feature branch with a base branch.
   */
  async initBranchDiff(baseBranch: string): Promise<void> {
    if (!this.branchDiffCache || !this.prollyTree) {
      log.w("LIBSQLADAPT", "prolly_not_ready_for_diff");
      return;
    }

    const { branchName } = this.currentContext;

    await this.branchDiffCache.initForBranch(baseBranch, branchName);

    log.i("LIBSQLADAPT", "branch_diff_init", { branch: branchName, base: baseBranch });
  }

  /**
   * Check if entity is deleted on current branch (via diff cache).
   * Returns false if diff cache not initialized.
   */
  isEntityDeletedOnBranch(entityId: string): boolean {
    if (!this.branchDiffCache) return false;
    return this.branchDiffCache.isDeleted(entityId);
  }
}
