/**
 * Entity Operations for LibSQL Graph Adapter
 *
 * Handles all Entity CRUD operations: insert, get, find, search, delete.
 * Uses delegates for accessing shared client and context.
 *
 * v6: Layered branch support - reads from delta (current branch) + base branch,
 * with tombstone filtering for deleted entities on feature branches.
 */

import { log } from "../../logging/index.js";
import type { BatchResult, Entity, EntityType } from "../../types/storage.js";
import type { GenerationManager } from "./generation-ops.js";
import type { ClientGetter, ContextGetter } from "./types.js";

// =============================================================================
// TOKEN UTILITIES
// =============================================================================

/**
 * Split an entity name into searchable tokens (camelCase, PascalCase, snake_case, kebab-case).
 * Used to populate the name_tokens B-tree index for O(log n) lookups instead of LIKE '%pattern%'.
 *
 * Examples:
 *   "getAuthToken"  → ["get", "auth", "token"]
 *   "HTTPSClient"   → ["https", "client"]
 *   "base64Encode"  → ["base64", "encode"]
 *   "my_var_name"   → ["my", "var", "name"]
 */
export function splitToTokens(name: string): string[] {
  return name
    .replace(/[_-]+/g, " ") // snake/kebab → spaces
    .replace(/([a-z])([A-Z])/g, "$1 $2") // camelCase
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2") // HTTPClient → HTTP Client
    .replace(/([a-zA-Z])(\d)/g, "$1 $2") // base64 → base 64
    .replace(/(\d)([a-zA-Z])/g, "$1 $2") // 64base → 64 base
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length >= 2);
}

// =============================================================================
// ROW MAPPER TYPE
// =============================================================================

/**
 * Delegate type for converting database row to Entity
 */
export type RowToEntityMapper = (row: unknown) => Entity;

/**
 * Delegate type for adding tombstone when entity is deleted on feature branch
 */
export type TombstoneAdder = (entityId: string, entityType: "entity" | "relationship") => Promise<void>;

/**
 * Delegate type for getting all tombstoned IDs for current branch
 */
export type TombstoneGetter = (entityType: "entity" | "relationship") => Promise<Set<string>>;

// =============================================================================
// ENTITY OPERATIONS CLASS
// =============================================================================

export class EntityOperations {
  private tombstoneAdder?: TombstoneAdder;
  private tombstoneGetter?: TombstoneGetter;

  constructor(
    private getClient: ClientGetter,
    private getContext: ContextGetter,
    private rowToEntity: RowToEntityMapper,
    private genManager: GenerationManager,
  ) {}

  /**
   * Set tombstone delegates for layered branch support.
   * Must be called after adapter initialization.
   */
  setTombstoneDelegates(adder: TombstoneAdder, getter: TombstoneGetter): void {
    this.tombstoneAdder = adder;
    this.tombstoneGetter = getter;
  }

  /**
   * Insert a single entity
   */
  async insertEntity(entity: Entity): Promise<void> {
    const client = this.getClient();
    if (!client) throw new Error("Client not initialized");

    const { projectHash, branchName } = this.getContext();
    const now = Date.now();

    // Ensure generation cache is loaded
    if (!this.genManager.isCacheLoaded) {
      await this.genManager.loadCache();
    }

    // Bump generation for this file (append-only model)
    const newGen = await this.genManager.bumpGeneration(entity.filePath);

    await client.execute({
      sql: `
        INSERT OR REPLACE INTO entities
        (id, project_hash, branch_name, name, type, file_path, location, metadata, hash,
         created_at, updated_at, complexity_score, language, size_bytes, embedding_base64, embedding_text, file_gen)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        entity.id,
        projectHash,
        branchName,
        entity.name,
        entity.type,
        entity.filePath,
        JSON.stringify(entity.location),
        JSON.stringify(entity.metadata),
        entity.hash || null,
        entity.createdAt || now,
        entity.updatedAt || now,
        entity.complexityScore || 1,
        entity.language || null,
        entity.sizeBytes || 0,
        entity.embeddingBase64 || null,
        entity.embeddingText || null,
        newGen,
      ],
    });

    // Update name tokens for fast lookup
    const tokens = splitToTokens(entity.name);
    if (tokens.length > 0 && entity.id) {
      await client.execute({
        sql: "DELETE FROM name_tokens WHERE entity_id = ? AND project_hash = ? AND branch_name = ?",
        args: [entity.id, projectHash, branchName],
      });
      const valuePlaceholders = tokens.map(() => "(?, ?, ?, ?)").join(", ");
      const tokenArgs: (string | number | null)[] = [];
      for (const token of tokens) {
        tokenArgs.push(token, entity.id, projectHash, branchName);
      }
      await client.execute({
        sql: `INSERT OR IGNORE INTO name_tokens (token, entity_id, project_hash, branch_name) VALUES ${valuePlaceholders}`,
        args: tokenArgs,
      });
    }
  }

  /**
   * Insert multiple entities with batch optimization
   */
  async insertEntities(entities: Entity[]): Promise<BatchResult> {
    const client = this.getClient();
    if (!client) throw new Error("Client not initialized");
    if (entities.length === 0) return { processed: 0, failed: 0, errors: [], timeMs: 0 };

    const start = Date.now();
    const errors: Array<{ item: unknown; error: string }> = [];
    const { projectHash, branchName } = this.getContext();
    const now = Date.now();
    // DEBUG: Log insert context with language info
    const withLang = entities.filter((e) => e.language).length;
    const kotlinCount = entities.filter((e) => e.language === "kotlin").length;
    const sample = entities.slice(0, 3).map((e) => ({ n: e.name, l: e.language, f: e.filePath?.slice(-30) }));
    log.w("ENTITY_OPS", "insertEntities", {
      total: entities.length,
      withLang,
      kotlinCount,
      sample: JSON.stringify(sample),
    });

    // Deduplicate by ID
    const seen = new Set<string>();
    const unique: Entity[] = [];
    for (const e of entities) {
      if (!seen.has(e.id)) {
        seen.add(e.id);
        unique.push(e);
      }
    }

    // Ensure generation cache is loaded
    if (!this.genManager.isCacheLoaded) {
      await this.genManager.loadCache();
    }

    // Collect unique file paths and bump generations in batch
    const filePaths = [...new Set(unique.map((e) => e.filePath))];
    const genMap = await this.genManager.bumpGenerationBatch(filePaths);

    // OPTIMIZATION: Multi-row INSERT - single SQL statement with multiple VALUES
    // Much faster than N separate INSERT statements (reduces parsing overhead)
    // SQLite limit: ~32767 params, 17 fields per entity → batch 900 = 15300 params (safe)
    const batchSize = 900;

    let processed = 0;

    for (let i = 0; i < unique.length; i += batchSize) {
      const batch = unique.slice(i, i + batchSize);

      // Build multi-row VALUES clause
      const valuePlaceholders = batch.map(() => "(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").join(", ");

      // Flatten all args into single array
      const args: (string | number | null)[] = [];
      for (const entity of batch) {
        const fileGen = genMap.get(entity.filePath) ?? 1;
        args.push(
          entity.id,
          projectHash,
          branchName,
          entity.name,
          entity.type,
          entity.filePath,
          JSON.stringify(entity.location),
          JSON.stringify(entity.metadata),
          entity.hash || null,
          entity.createdAt || now,
          entity.updatedAt || now,
          entity.complexityScore || 1,
          entity.language || null,
          entity.sizeBytes || 0,
          entity.embeddingBase64 || null,
          entity.embeddingText || null,
          fileGen,
        );
      }

      const sql = `
        INSERT OR REPLACE INTO entities
        (id, project_hash, branch_name, name, type, file_path, location, metadata, hash,
         created_at, updated_at, complexity_score, language, size_bytes, embedding_base64, embedding_text, file_gen)
        VALUES ${valuePlaceholders}
      `;

      try {
        await client.execute({ sql, args });
        processed += batch.length;
      } catch (error) {
        errors.push({
          item: { batchStart: i, batchEnd: i + batch.length },
          error: (error as Error).message,
        });
      }
    }

    // Batch-insert name tokens for all entities (after entity inserts complete)
    const tokenRows: [string, string][] = []; // [token, entity_id]
    for (const entity of unique) {
      if (!entity.id) continue;
      for (const token of splitToTokens(entity.name)) {
        tokenRows.push([token, entity.id]);
      }
    }

    if (tokenRows.length > 0) {
      // Delete existing tokens first (handles renames / re-index updates)
      const idsToClean = unique.map((e) => e.id).filter((id) => id) as string[];
      const DELETE_CHUNK = 400;
      for (let i = 0; i < idsToClean.length; i += DELETE_CHUNK) {
        const chunk = idsToClean.slice(i, i + DELETE_CHUNK);
        const placeholders = chunk.map(() => "?").join(",");
        await client.execute({
          sql: `DELETE FROM name_tokens WHERE entity_id IN (${placeholders}) AND project_hash = ? AND branch_name = ?`,
          args: [...chunk, projectHash, branchName],
        });
      }

      // Batch-insert tokens (4 cols × 1000 rows = 4000 params, well within SQLite limit)
      const TOKEN_BATCH = 1000;
      for (let i = 0; i < tokenRows.length; i += TOKEN_BATCH) {
        const chunk = tokenRows.slice(i, i + TOKEN_BATCH);
        const valuePlaceholders = chunk.map(() => "(?, ?, ?, ?)").join(", ");
        const tokenArgs: (string | number | null)[] = [];
        for (const [token, entityId] of chunk) {
          tokenArgs.push(token, entityId, projectHash, branchName);
        }
        await client.execute({
          sql: `INSERT OR IGNORE INTO name_tokens (token, entity_id, project_hash, branch_name) VALUES ${valuePlaceholders}`,
          args: tokenArgs,
        });
      }
    }

    return {
      processed,
      failed: errors.length,
      errors,
      timeMs: Date.now() - start,
    };
  }

  /**
   * Get entity by ID (layered: delta → base with tombstone check)
   */
  async getEntity(id: string): Promise<Entity | null> {
    const client = this.getClient();
    if (!client) throw new Error("Client not initialized");

    const { projectHash, branchName, baseBranch } = this.getContext();
    log.w("ENTITY_OPS", "getEntity", { branch: branchName, base: baseBranch || "none" });

    // 1. Check tombstone first (if on feature branch)
    if (baseBranch && this.tombstoneGetter) {
      const tombstones = await this.tombstoneGetter("entity");
      if (tombstones.has(id)) {
        return null; // Entity was deleted on feature branch
      }
    }

    // 2. Try to find in current branch (delta) — only active generation
    const result = await client.execute({
      sql: `SELECT e.* FROM entities e
            JOIN file_generations fg
              ON e.file_path = fg.file_path AND e.project_hash = fg.project_hash AND e.branch_name = fg.branch_name
            WHERE e.id = ? AND e.project_hash = ? AND e.branch_name = ?
              AND e.file_gen = fg.active_gen`,
      args: [id, projectHash, branchName],
    });

    if (result.rows.length > 0) {
      return this.rowToEntity(result.rows[0]);
    }

    // 3. If on feature branch and not found in delta, check base
    if (baseBranch) {
      const baseResult = await client.execute({
        sql: `SELECT e.* FROM entities e
              JOIN file_generations fg
                ON e.file_path = fg.file_path AND e.project_hash = fg.project_hash AND e.branch_name = fg.branch_name
              WHERE e.id = ? AND e.project_hash = ? AND e.branch_name = ?
                AND e.file_gen = fg.active_gen`,
        args: [id, projectHash, baseBranch],
      });

      if (baseResult.rows.length > 0) {
        return this.rowToEntity(baseResult.rows[0]);
      }
    }

    return null;
  }

  /**
   * Batch fetch entities by IDs in a single SQL query.
   * Returns Map<id, Entity> for found entities.
   * Uses IN clause with chunking for large ID sets.
   */
  async getEntitiesBatch(ids: string[]): Promise<Map<string, Entity>> {
    const result = new Map<string, Entity>();
    if (ids.length === 0) return result;

    const client = this.getClient();
    if (!client) throw new Error("Client not initialized");

    const { projectHash, branchName, baseBranch } = this.getContext();

    // Get tombstones once (not per ID)
    let tombstones: Set<string> | null = null;
    if (baseBranch && this.tombstoneGetter) {
      tombstones = await this.tombstoneGetter("entity");
    }

    // Deduplicate and filter tombstoned IDs
    const uniqueIds = [...new Set(ids)].filter((id) => !tombstones?.has(id));
    if (uniqueIds.length === 0) return result;

    // SQLite has a limit of ~999 variables per query — chunk if needed
    const CHUNK_SIZE = 400;

    for (let i = 0; i < uniqueIds.length; i += CHUNK_SIZE) {
      const chunk = uniqueIds.slice(i, i + CHUNK_SIZE);
      const placeholders = chunk.map(() => "?").join(",");

      // 1. Fetch from current branch (active generation only)
      const rows = await client.execute({
        sql: `SELECT e.* FROM entities e
              JOIN file_generations fg
                ON e.file_path = fg.file_path AND e.project_hash = fg.project_hash AND e.branch_name = fg.branch_name
              WHERE e.id IN (${placeholders}) AND e.project_hash = ? AND e.branch_name = ?
                AND e.file_gen = fg.active_gen`,
        args: [...chunk, projectHash, branchName],
      });

      for (const row of rows.rows) {
        const entity = this.rowToEntity(row);
        result.set(entity.id, entity);
      }

      // 2. If on feature branch, fetch missing from base
      if (baseBranch) {
        const missingIds = chunk.filter((id) => !result.has(id));
        if (missingIds.length > 0) {
          const missingPlaceholders = missingIds.map(() => "?").join(",");
          const baseRows = await client.execute({
            sql: `SELECT e.* FROM entities e
                  JOIN file_generations fg
                    ON e.file_path = fg.file_path AND e.project_hash = fg.project_hash AND e.branch_name = fg.branch_name
                  WHERE e.id IN (${missingPlaceholders}) AND e.project_hash = ? AND e.branch_name = ?
                    AND e.file_gen = fg.active_gen`,
            args: [...missingIds, projectHash, baseBranch],
          });

          for (const row of baseRows.rows) {
            const entity = this.rowToEntity(row);
            result.set(entity.id, entity);
          }
        }
      }
    }

    return result;
  }

  /**
   * Build filter SQL clause and args.
   * When ctx is provided and the name filter is a simple identifier, uses the
   * name_tokens B-tree index instead of LIKE '%pattern%' for ~60x speedup.
   */
  private buildFilterClause(
    filters:
      | {
          entityType?: EntityType | EntityType[];
          filePath?: string | string[];
          name?: string | RegExp;
        }
      | undefined,
    args: (string | number)[],
    ctx?: { projectHash: string; branchName: string },
  ): string {
    let sql = "";

    if (filters) {
      if (filters.entityType) {
        const types = Array.isArray(filters.entityType) ? filters.entityType : [filters.entityType];
        sql += ` AND type IN (${types.map(() => "?").join(",")})`;
        args.push(...types);
      }

      if (filters.filePath) {
        const paths = Array.isArray(filters.filePath) ? filters.filePath : [filters.filePath];
        // Normalize paths for cross-platform
        const normalized: string[] = [];
        for (const p of paths) {
          normalized.push(p);
          if (p.includes("/")) normalized.push(p.replace(/\//g, "\\"));
          if (p.includes("\\")) normalized.push(p.replace(/\\/g, "/"));
        }
        const unique = [...new Set(normalized)];
        sql += ` AND e.file_path IN (${unique.map(() => "?").join(",")})`;
        args.push(...unique);
      }

      if (filters.name) {
        if (filters.name instanceof RegExp) {
          const source = filters.name.source;
          // Regex alternation (|) — split into OR LIKE clauses (no token optimisation possible)
          if (source.includes("|")) {
            const alternatives = source.split("|").map((alt) => {
              let p = alt.replace(/\.\*/g, "%").replace(/\*/g, "%").replace(/\./g, "_");
              if (!p.includes("%") && !p.includes("_")) p = `%${p}%`;
              return p;
            });
            sql += ` AND (${alternatives.map(() => "name LIKE ?").join(" OR ")})`;
            args.push(...alternatives);
          } else if (ctx && /^[a-zA-Z0-9_]+$/.test(source)) {
            // Simple identifier pattern (no regex special chars) — use token index
            const tokens = splitToTokens(source);
            if (tokens.length === 1) {
              sql +=
                " AND id IN (SELECT entity_id FROM name_tokens WHERE token = ? AND project_hash = ? AND branch_name = ?)";
              args.push(tokens[0]!, ctx.projectHash, ctx.branchName);
            } else if (tokens.length > 1) {
              const placeholders = tokens.map(() => "?").join(",");
              sql += ` AND id IN (SELECT entity_id FROM name_tokens WHERE token IN (${placeholders}) AND project_hash = ? AND branch_name = ? GROUP BY entity_id HAVING COUNT(DISTINCT token) = ?)`;
              args.push(...tokens, ctx.projectHash, ctx.branchName, tokens.length);
            } else {
              // Tokens too short — fall back to LIKE
              let pattern = source;
              pattern = pattern.replace(/\.\*/g, "%").replace(/\*/g, "%").replace(/\./g, "_");
              if (!pattern.includes("%") && !pattern.includes("_")) pattern = `%${pattern}%`;
              sql += " AND name LIKE ?";
              args.push(pattern);
            }
          } else {
            let pattern = source;
            pattern = pattern.replace(/\.\*/g, "%").replace(/\*/g, "%").replace(/\./g, "_");
            if (!pattern.includes("%") && !pattern.includes("_")) {
              pattern = `%${pattern}%`;
            }
            sql += " AND name LIKE ?";
            args.push(pattern);
          }
        } else {
          sql += " AND name = ?";
          args.push(filters.name);
        }
      }
    }

    return sql;
  }

  /**
   * Find entities with complex filters (layered: delta + base - tombstones)
   */
  async findEntities(query: {
    filters?: {
      entityType?: EntityType | EntityType[];
      filePath?: string | string[];
      name?: string | RegExp;
    };
    limit?: number;
    offset?: number;
  }): Promise<Entity[]> {
    const client = this.getClient();
    if (!client) throw new Error("Client not initialized");

    const { projectHash, branchName, baseBranch } = this.getContext();
    log.w("ENTITY_OPS", "findEntities", { hash: projectHash, branch: branchName, base: baseBranch || "none" });
    const limit = query.limit || 100;
    const offset = query.offset || 0;

    // Simple case: no base branch
    if (!baseBranch) {
      const args: (string | number)[] = [projectHash, branchName];
      let sql = `SELECT e.* FROM entities e
                 JOIN file_generations fg
                   ON e.file_path = fg.file_path AND e.project_hash = fg.project_hash AND e.branch_name = fg.branch_name
                 WHERE e.project_hash = ? AND e.branch_name = ? AND e.file_gen = fg.active_gen`;
      sql += this.buildFilterClause(query.filters, args, { projectHash, branchName });
      sql += " LIMIT ? OFFSET ?";
      args.push(limit, offset);

      const result = await client.execute({ sql, args });
      // DEBUG: Check raw language values from DB
      const withLang = result.rows.filter((r) => r["language"]).length;
      const sample = result.rows.slice(0, 3).map((r) => ({ n: r["name"], l: r["language"] }));
      log.w("ENTITY_OPS", "findEntities_raw", { total: result.rows.length, withLang, sample: JSON.stringify(sample) });
      return result.rows.map((row) => this.rowToEntity(row));
    }

    // Layered case: delta + base - tombstones
    const tombstones = this.tombstoneGetter ? await this.tombstoneGetter("entity") : new Set<string>();

    // Get from delta (active gen only)
    const deltaArgs: (string | number)[] = [projectHash, branchName];
    let deltaSql = `SELECT e.* FROM entities e
                    JOIN file_generations fg
                      ON e.file_path = fg.file_path AND e.project_hash = fg.project_hash AND e.branch_name = fg.branch_name
                    WHERE e.project_hash = ? AND e.branch_name = ? AND e.file_gen = fg.active_gen`;
    deltaSql += this.buildFilterClause(query.filters, deltaArgs, { projectHash, branchName });

    const deltaResult = await client.execute({ sql: deltaSql, args: deltaArgs });
    // DEBUG: Check delta raw
    const deltaWithLang = deltaResult.rows.filter((r) => r["language"]).length;
    log.w("ENTITY_OPS", "findEntities_layered", { delta: deltaResult.rows.length, deltaWithLang, branch: branchName });
    const deltaEntities = deltaResult.rows.map((row) => this.rowToEntity(row));
    const deltaIds = new Set(deltaEntities.map((e) => e.id));

    // Get from base (active gen only)
    const baseArgs: (string | number)[] = [projectHash, baseBranch];
    let baseSql = `SELECT e.* FROM entities e
                   JOIN file_generations fg
                     ON e.file_path = fg.file_path AND e.project_hash = fg.project_hash AND e.branch_name = fg.branch_name
                   WHERE e.project_hash = ? AND e.branch_name = ? AND e.file_gen = fg.active_gen`;
    baseSql += this.buildFilterClause(query.filters, baseArgs, { projectHash, branchName: baseBranch });

    const baseResult = await client.execute({ sql: baseSql, args: baseArgs });
    // DEBUG: Check base raw
    log.w("ENTITY_OPS", "findEntities_base", { base: baseResult.rows.length, baseBranch });
    const baseEntities = baseResult.rows
      .map((row) => this.rowToEntity(row))
      .filter((e) => !deltaIds.has(e.id) && !tombstones.has(e.id));

    // Combine and apply limit/offset
    const combined = [...deltaEntities, ...baseEntities];
    const result = combined.slice(offset, offset + limit);
    // DEBUG: Check returned entities
    const retWithLang = result.filter((e) => e.language).length;
    const retSample = result.slice(0, 3).map((e) => ({ n: e.name, l: e.language }));
    log.w("ENTITY_OPS", "findEntities_result", {
      total: result.length,
      withLang: retWithLang,
      sample: JSON.stringify(retSample),
    });
    return result;
  }

  /**
   * Build search SQL clause and args.
   * When ctx is provided, uses name_tokens B-tree index for namePattern instead of LIKE.
   */
  private buildSearchClause(
    options: {
      namePattern?: string;
      types?: EntityType[];
      filePath?: string;
    },
    args: (string | number)[],
    ctx?: { projectHash: string; branchName: string },
  ): string {
    let sql = "";

    if (options.namePattern) {
      if (ctx) {
        const tokens = splitToTokens(options.namePattern);
        if (tokens.length === 1) {
          sql +=
            " AND id IN (SELECT entity_id FROM name_tokens WHERE token = ? AND project_hash = ? AND branch_name = ?)";
          args.push(tokens[0]!, ctx.projectHash, ctx.branchName);
        } else if (tokens.length > 1) {
          const placeholders = tokens.map(() => "?").join(",");
          sql += ` AND id IN (SELECT entity_id FROM name_tokens WHERE token IN (${placeholders}) AND project_hash = ? AND branch_name = ? GROUP BY entity_id HAVING COUNT(DISTINCT token) = ?)`;
          args.push(...tokens, ctx.projectHash, ctx.branchName, tokens.length);
        } else {
          // Tokens too short — fall back to LIKE
          sql += " AND name LIKE ?";
          args.push(`%${options.namePattern}%`);
        }
      } else {
        sql += " AND name LIKE ?";
        args.push(`%${options.namePattern}%`);
      }
    }

    if (options.types && options.types.length > 0) {
      sql += ` AND type IN (${options.types.map(() => "?").join(",")})`;
      args.push(...options.types);
    }

    if (options.filePath) {
      // Support partial path matching (e.g., "src/index.ts" matches "D:\...\src\index.ts")
      // Handle both / and \ path separators
      const normalizedPath = options.filePath.replace(/\\/g, "/");
      sql += " AND (e.file_path LIKE ? OR e.file_path LIKE ?)";
      args.push(`%${normalizedPath}`, `%${normalizedPath.replace(/\//g, "\\")}`);
    }

    return sql;
  }

  /**
   * Search entities by name pattern and type (layered: delta + base - tombstones)
   */
  async searchEntities(options: {
    namePattern?: string | undefined;
    types?: EntityType[] | undefined;
    filePath?: string | undefined;
    limit?: number;
  }): Promise<Entity[]> {
    const client = this.getClient();
    if (!client) throw new Error("Client not initialized");

    const { projectHash, branchName, baseBranch } = this.getContext();
    const limit = options.limit || 100;

    // Simple case: no base branch
    if (!baseBranch) {
      const args: (string | number)[] = [projectHash, branchName];
      let sql = `SELECT e.* FROM entities e
                 JOIN file_generations fg
                   ON e.file_path = fg.file_path AND e.project_hash = fg.project_hash AND e.branch_name = fg.branch_name
                 WHERE e.project_hash = ? AND e.branch_name = ? AND e.file_gen = fg.active_gen`;
      sql += this.buildSearchClause(options, args, { projectHash, branchName });
      sql += " LIMIT ?";
      args.push(limit);

      const result = await client.execute({ sql, args });
      return result.rows.map((row) => this.rowToEntity(row));
    }

    // Layered case
    const tombstones = this.tombstoneGetter ? await this.tombstoneGetter("entity") : new Set<string>();

    // Get from delta (active gen only)
    const deltaArgs: (string | number)[] = [projectHash, branchName];
    let deltaSql = `SELECT e.* FROM entities e
                    JOIN file_generations fg
                      ON e.file_path = fg.file_path AND e.project_hash = fg.project_hash AND e.branch_name = fg.branch_name
                    WHERE e.project_hash = ? AND e.branch_name = ? AND e.file_gen = fg.active_gen`;
    deltaSql += this.buildSearchClause(options, deltaArgs, { projectHash, branchName });

    const deltaResult = await client.execute({ sql: deltaSql, args: deltaArgs });
    const deltaEntities = deltaResult.rows.map((row) => this.rowToEntity(row));
    const deltaIds = new Set(deltaEntities.map((e) => e.id));

    // Get from base (active gen only)
    const baseArgs: (string | number)[] = [projectHash, baseBranch];
    let baseSql = `SELECT e.* FROM entities e
                   JOIN file_generations fg
                     ON e.file_path = fg.file_path AND e.project_hash = fg.project_hash AND e.branch_name = fg.branch_name
                   WHERE e.project_hash = ? AND e.branch_name = ? AND e.file_gen = fg.active_gen`;
    baseSql += this.buildSearchClause(options, baseArgs, { projectHash, branchName: baseBranch });

    const baseResult = await client.execute({ sql: baseSql, args: baseArgs });
    const baseEntities = baseResult.rows
      .map((row) => this.rowToEntity(row))
      .filter((e) => !deltaIds.has(e.id) && !tombstones.has(e.id));

    // Combine and limit
    return [...deltaEntities, ...baseEntities].slice(0, limit);
  }

  /**
   * Search entities by directory path (LIKE pattern) (layered: delta + base - tombstones)
   */
  async searchEntitiesInDirectory(directoryPath: string): Promise<Entity[]> {
    const client = this.getClient();
    if (!client) throw new Error("Client not initialized");

    const { projectHash, branchName, baseBranch } = this.getContext();

    // Normalize path separators for cross-platform search
    const forwardPath = directoryPath.replace(/\\/g, "/");
    const backPath = directoryPath.replace(/\//g, "\\");

    // Simple case: no base branch
    if (!baseBranch) {
      const sql = `
        SELECT e.* FROM entities e
        JOIN file_generations fg
          ON e.file_path = fg.file_path AND e.project_hash = fg.project_hash AND e.branch_name = fg.branch_name
        WHERE e.project_hash = ? AND e.branch_name = ?
        AND (e.file_path LIKE ? OR e.file_path LIKE ?)
        AND e.file_gen = fg.active_gen
      `;
      const args = [projectHash, branchName, `${forwardPath}%`, `${backPath}%`];

      const result = await client.execute({ sql, args });
      return result.rows.map((row) => this.rowToEntity(row));
    }

    // Layered case
    const tombstones = this.tombstoneGetter ? await this.tombstoneGetter("entity") : new Set<string>();

    // Get from delta (active gen only)
    const deltaSql = `
      SELECT e.* FROM entities e
      JOIN file_generations fg
        ON e.file_path = fg.file_path AND e.project_hash = fg.project_hash AND e.branch_name = fg.branch_name
      WHERE e.project_hash = ? AND e.branch_name = ?
      AND (e.file_path LIKE ? OR e.file_path LIKE ?)
      AND e.file_gen = fg.active_gen
    `;
    const deltaResult = await client.execute({
      sql: deltaSql,
      args: [projectHash, branchName, `${forwardPath}%`, `${backPath}%`],
    });
    const deltaEntities = deltaResult.rows.map((row) => this.rowToEntity(row));
    const deltaIds = new Set(deltaEntities.map((e) => e.id));

    // Get from base (active gen only)
    const baseSql = `
      SELECT e.* FROM entities e
      JOIN file_generations fg
        ON e.file_path = fg.file_path AND e.project_hash = fg.project_hash AND e.branch_name = fg.branch_name
      WHERE e.project_hash = ? AND e.branch_name = ?
      AND (e.file_path LIKE ? OR e.file_path LIKE ?)
      AND e.file_gen = fg.active_gen
    `;
    const baseResult = await client.execute({
      sql: baseSql,
      args: [projectHash, baseBranch, `${forwardPath}%`, `${backPath}%`],
    });
    const baseEntities = baseResult.rows
      .map((row) => this.rowToEntity(row))
      .filter((e) => !deltaIds.has(e.id) && !tombstones.has(e.id));

    return [...deltaEntities, ...baseEntities];
  }

  /**
   * Delete entity by ID.
   * On feature branches with baseBranch set, adds tombstone instead of deleting.
   */
  async deleteEntity(id: string): Promise<void> {
    const client = this.getClient();
    if (!client) throw new Error("Client not initialized");

    const { projectHash, branchName, baseBranch } = this.getContext();

    // On feature branch: add tombstone to hide entity from base
    if (baseBranch && this.tombstoneAdder) {
      await this.tombstoneAdder(id, "entity");
    }

    // Always delete from current branch (delta or base)
    await client.execute({
      sql: "DELETE FROM entities WHERE id = ? AND project_hash = ? AND branch_name = ?",
      args: [id, projectHash, branchName],
    });

    // Remove name tokens
    await client.execute({
      sql: "DELETE FROM name_tokens WHERE entity_id = ? AND project_hash = ? AND branch_name = ?",
      args: [id, projectHash, branchName],
    });
  }

  /**
   * Get entity IDs by file path (for FAISS cleanup) (layered: delta + base - tombstones)
   */
  async getEntityIdsByFilePath(filePath: string): Promise<string[]> {
    const client = this.getClient();
    if (!client) throw new Error("Client not initialized");

    const { projectHash, branchName, baseBranch } = this.getContext();

    // Normalize path separators
    const forwardPath = filePath.replace(/\\/g, "/");
    const backPath = filePath.replace(/\//g, "\\");

    // Simple case: no base branch — only active generation
    if (!baseBranch) {
      const result = await client.execute({
        sql: `
          SELECT e.id FROM entities e
          JOIN file_generations fg
            ON e.file_path = fg.file_path AND e.project_hash = fg.project_hash AND e.branch_name = fg.branch_name
          WHERE e.project_hash = ? AND e.branch_name = ?
          AND (e.file_path = ? OR e.file_path = ?)
          AND e.file_gen = fg.active_gen
        `,
        args: [projectHash, branchName, forwardPath, backPath],
      });

      return result.rows.map((row) => row["id"] as string);
    }

    // Layered case
    const tombstones = this.tombstoneGetter ? await this.tombstoneGetter("entity") : new Set<string>();

    // Get from delta (active gen only)
    const deltaResult = await client.execute({
      sql: `
        SELECT e.id FROM entities e
        JOIN file_generations fg
          ON e.file_path = fg.file_path AND e.project_hash = fg.project_hash AND e.branch_name = fg.branch_name
        WHERE e.project_hash = ? AND e.branch_name = ?
        AND (e.file_path = ? OR e.file_path = ?)
        AND e.file_gen = fg.active_gen
      `,
      args: [projectHash, branchName, forwardPath, backPath],
    });
    const deltaIds = new Set(deltaResult.rows.map((row) => row["id"] as string));

    // Get from base (active gen only)
    const baseResult = await client.execute({
      sql: `
        SELECT e.id FROM entities e
        JOIN file_generations fg
          ON e.file_path = fg.file_path AND e.project_hash = fg.project_hash AND e.branch_name = fg.branch_name
        WHERE e.project_hash = ? AND e.branch_name = ?
        AND (e.file_path = ? OR e.file_path = ?)
        AND e.file_gen = fg.active_gen
      `,
      args: [projectHash, baseBranch, forwardPath, backPath],
    });
    const baseIds = baseResult.rows
      .map((row) => row["id"] as string)
      .filter((id) => !deltaIds.has(id) && !tombstones.has(id));

    return [...deltaIds, ...baseIds];
  }

  /**
   * Delete all entities for a file path
   * Returns the IDs of deleted entities (for FAISS cleanup)
   */
  async deleteEntitiesByFilePath(filePath: string): Promise<string[]> {
    // Get IDs of active entities for FAISS cleanup before invalidation
    const ids = await this.getEntityIdsByFilePath(filePath);
    if (ids.length === 0) return [];

    // Invalidate the file generation — all entities become stale (GC will clean them)
    await this.genManager.invalidateFileGeneration(filePath);

    return ids;
  }

  /**
   * Get all entities for current project/branch (layered: delta + base - tombstones)
   */
  async getAllEntities(): Promise<Entity[]> {
    const client = this.getClient();
    if (!client) throw new Error("Client not initialized");

    const { projectHash, branchName, baseBranch } = this.getContext();

    // Simple case: no base branch (on base or no layering) — active generation only
    if (!baseBranch) {
      const result = await client.execute({
        sql: `SELECT e.* FROM entities e
              JOIN file_generations fg
                ON e.file_path = fg.file_path AND e.project_hash = fg.project_hash AND e.branch_name = fg.branch_name
              WHERE e.project_hash = ? AND e.branch_name = ? AND e.file_gen = fg.active_gen`,
        args: [projectHash, branchName],
      });
      return result.rows.map((row) => this.rowToEntity(row));
    }

    // Layered case: UNION delta + base, excluding tombstones and overrides
    // 1. Get tombstones for current branch
    const tombstones = this.tombstoneGetter ? await this.tombstoneGetter("entity") : new Set<string>();

    // 2. Get entities from delta (current branch, active gen only)
    const deltaResult = await client.execute({
      sql: `SELECT e.* FROM entities e
            JOIN file_generations fg
              ON e.file_path = fg.file_path AND e.project_hash = fg.project_hash AND e.branch_name = fg.branch_name
            WHERE e.project_hash = ? AND e.branch_name = ? AND e.file_gen = fg.active_gen`,
      args: [projectHash, branchName],
    });
    const deltaEntities = deltaResult.rows.map((row) => this.rowToEntity(row));
    const deltaIds = new Set(deltaEntities.map((e) => e.id));

    // 3. Get entities from base (active gen only), excluding overridden or tombstoned
    const baseResult = await client.execute({
      sql: `SELECT e.* FROM entities e
            JOIN file_generations fg
              ON e.file_path = fg.file_path AND e.project_hash = fg.project_hash AND e.branch_name = fg.branch_name
            WHERE e.project_hash = ? AND e.branch_name = ? AND e.file_gen = fg.active_gen`,
      args: [projectHash, baseBranch],
    });

    const baseEntities = baseResult.rows
      .map((row) => this.rowToEntity(row))
      .filter((e) => !deltaIds.has(e.id) && !tombstones.has(e.id));

    // 4. Combine: delta first (priority), then filtered base
    return [...deltaEntities, ...baseEntities];
  }

  /**
   * Count entities by language (efficient SQL aggregation for TechnologyDetector).
   * Excludes external placeholder entities (file_path starting with 'external://').
   * Returns map of language -> { count, fileCount }
   */
  async countByLanguage(): Promise<Map<string, { count: number; fileCount: number }>> {
    const client = this.getClient();
    if (!client) throw new Error("Client not initialized");

    const { projectHash, branchName, baseBranch } = this.getContext();

    // Simple case: no base branch — active generation only
    if (!baseBranch) {
      const result = await client.execute({
        sql: `
          SELECT
            COALESCE(e.language, 'unknown') as lang,
            COUNT(*) as cnt,
            COUNT(DISTINCT e.file_path) as file_cnt
          FROM entities e
          JOIN file_generations fg
            ON e.file_path = fg.file_path AND e.project_hash = fg.project_hash AND e.branch_name = fg.branch_name
          WHERE e.project_hash = ? AND e.branch_name = ?
            AND e.file_path NOT LIKE 'external://%'
            AND e.file_gen = fg.active_gen
          GROUP BY COALESCE(e.language, 'unknown')
        `,
        args: [projectHash, branchName],
      });

      const counts = new Map<string, { count: number; fileCount: number }>();
      for (const row of result.rows) {
        const lang = row["lang"] as string;
        counts.set(lang, {
          count: Number(row["cnt"]),
          fileCount: Number(row["file_cnt"]),
        });
      }
      return counts;
    }

    // Layered case: get from delta + base, excluding tombstones
    const tombstones = this.tombstoneGetter ? await this.tombstoneGetter("entity") : new Set<string>();

    // Get all entities (need to filter by tombstones in memory) — active gen only
    const deltaResult = await client.execute({
      sql: `SELECT e.id, e.language, e.file_path FROM entities e
            JOIN file_generations fg
              ON e.file_path = fg.file_path AND e.project_hash = fg.project_hash AND e.branch_name = fg.branch_name
            WHERE e.project_hash = ? AND e.branch_name = ? AND e.file_path NOT LIKE 'external://%'
              AND e.file_gen = fg.active_gen`,
      args: [projectHash, branchName],
    });
    const deltaEntities = deltaResult.rows.map((row) => ({
      id: row["id"] as string,
      language: row["language"] as string | null,
      filePath: row["file_path"] as string,
    }));
    const deltaIds = new Set(deltaEntities.map((e) => e.id));

    const baseResult = await client.execute({
      sql: `SELECT e.id, e.language, e.file_path FROM entities e
            JOIN file_generations fg
              ON e.file_path = fg.file_path AND e.project_hash = fg.project_hash AND e.branch_name = fg.branch_name
            WHERE e.project_hash = ? AND e.branch_name = ? AND e.file_path NOT LIKE 'external://%'
              AND e.file_gen = fg.active_gen`,
      args: [projectHash, baseBranch],
    });
    const baseEntities = baseResult.rows
      .map((row) => ({
        id: row["id"] as string,
        language: row["language"] as string | null,
        filePath: row["file_path"] as string,
      }))
      .filter((e) => !deltaIds.has(e.id) && !tombstones.has(e.id));

    // Combine and aggregate
    const allEntities = [...deltaEntities, ...baseEntities];
    const counts = new Map<string, { count: number; files: Set<string> }>();

    for (const e of allEntities) {
      const lang = e.language || "unknown";
      if (!counts.has(lang)) {
        counts.set(lang, { count: 0, files: new Set() });
      }
      const entry = counts.get(lang)!;
      entry.count++;
      entry.files.add(e.filePath);
    }

    // Convert to result format
    const result = new Map<string, { count: number; fileCount: number }>();
    for (const [lang, data] of counts) {
      result.set(lang, { count: data.count, fileCount: data.files.size });
    }
    return result;
  }
}
