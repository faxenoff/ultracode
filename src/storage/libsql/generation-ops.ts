/**
 * Generation-based Copy-on-Write for Entity Storage
 *
 * Instead of DELETE + INSERT on file reindex, uses append-only INSERT
 * with a generation stamp, then atomically switches the active generation.
 * Stale generations are cleaned up lazily by GC.
 *
 * Flow:
 *   1. newGen = current active_gen + 1
 *   2. INSERT entities with file_gen = newGen (pure append, fast)
 *   3. UPDATE file_generations SET active_gen = newGen (atomic switch)
 *   4. [background] GC: DELETE entities WHERE file_gen < active_gen
 */

import { log } from "../../logging/index.js";
import type { ClientGetter, ContextGetter } from "./types.js";

// =============================================================================
// GENERATION MANAGER
// =============================================================================

export class GenerationManager {
  /** In-memory cache: "filePath" → active generation number */
  private cache = new Map<string, number>();
  private cacheLoaded = false;
  private gcRunning = false;

  constructor(
    private getClient: ClientGetter,
    private getContext: ContextGetter,
  ) {}

  /**
   * Load generation cache from DB for current project/branch.
   * Call once after setProjectContext().
   */
  async loadCache(): Promise<void> {
    const client = this.getClient();
    if (!client) return;

    const { projectHash, branchName } = this.getContext();

    const result = await client.execute({
      sql: `SELECT file_path, active_gen FROM file_generations
            WHERE project_hash = ? AND branch_name = ?`,
      args: [projectHash, branchName],
    });

    this.cache.clear();
    for (const row of result.rows) {
      this.cache.set(row["file_path"] as string, Number(row["active_gen"]));
    }
    this.cacheLoaded = true;
    log.d("GEN_OPS", "cache_loaded", { entries: this.cache.size });
  }

  /**
   * Get active generation for a file. Returns from cache or DB.
   * Returns 0 if file has no generation record (new file).
   */
  getGeneration(filePath: string): number {
    return this.cache.get(filePath) ?? 0;
  }

  /**
   * Bump generation for a single file: increment + update cache + DB.
   * Returns the new generation number.
   */
  async bumpGeneration(filePath: string): Promise<number> {
    const client = this.getClient();
    if (!client) throw new Error("Client not initialized");

    const { projectHash, branchName } = this.getContext();
    const currentGen = this.getGeneration(filePath);
    const newGen = currentGen + 1;
    const now = Date.now();

    await client.execute({
      sql: `INSERT OR REPLACE INTO file_generations
            (file_path, project_hash, branch_name, active_gen, updated_at)
            VALUES (?, ?, ?, ?, ?)`,
      args: [filePath, projectHash, branchName, newGen, now],
    });

    this.cache.set(filePath, newGen);
    return newGen;
  }

  /**
   * Bump generation for multiple files in a single batch.
   * Returns map of filePath → newGen.
   */
  async bumpGenerationBatch(filePaths: string[]): Promise<Map<string, number>> {
    const client = this.getClient();
    if (!client) throw new Error("Client not initialized");
    if (filePaths.length === 0) return new Map();

    const { projectHash, branchName } = this.getContext();
    const now = Date.now();
    const result = new Map<string, number>();

    // Deduplicate
    const unique = [...new Set(filePaths)];

    // Batch INSERT OR REPLACE (5 params per row, batch 500 = 2500 params, safe)
    const BATCH_SIZE = 500;
    for (let i = 0; i < unique.length; i += BATCH_SIZE) {
      const batch = unique.slice(i, i + BATCH_SIZE);
      const valuePlaceholders = batch.map(() => "(?, ?, ?, ?, ?)").join(", ");
      const args: (string | number)[] = [];

      for (const filePath of batch) {
        const currentGen = this.getGeneration(filePath);
        const newGen = currentGen + 1;
        args.push(filePath, projectHash, branchName, newGen, now);
        this.cache.set(filePath, newGen);
        result.set(filePath, newGen);
      }

      await client.execute({
        sql: `INSERT OR REPLACE INTO file_generations
              (file_path, project_hash, branch_name, active_gen, updated_at)
              VALUES ${valuePlaceholders}`,
        args,
      });
    }

    return result;
  }

  /**
   * Invalidate a file's generation (for deleted files).
   * Sets active_gen = -1 so all entities for this file become stale.
   * Returns the old entity IDs for FAISS cleanup.
   */
  async invalidateFileGeneration(filePath: string): Promise<void> {
    const client = this.getClient();
    if (!client) return;

    const { projectHash, branchName } = this.getContext();

    await client.execute({
      sql: `INSERT OR REPLACE INTO file_generations
            (file_path, project_hash, branch_name, active_gen, updated_at)
            VALUES (?, ?, ?, -1, ?)`,
      args: [filePath, projectHash, branchName, Date.now()],
    });

    this.cache.set(filePath, -1);
  }

  /**
   * GC: Delete stale entities (file_gen < active_gen or active_gen = -1).
   * Runs in chunks to avoid long locks. Returns number of deleted rows.
   */
  async gcStaleEntities(limit = 10000): Promise<number> {
    const client = this.getClient();
    if (!client || this.gcRunning) return 0;

    this.gcRunning = true;
    const { projectHash, branchName } = this.getContext();

    try {
      // Stage 1: Delete stale entities where file_gen != active_gen
      const result = await client.execute({
        sql: `DELETE FROM entities WHERE rowid IN (
          SELECT e.rowid FROM entities e
          JOIN file_generations fg
            ON e.file_path = fg.file_path
            AND e.project_hash = fg.project_hash
            AND e.branch_name = fg.branch_name
          WHERE e.project_hash = ? AND e.branch_name = ?
            AND e.file_gen != fg.active_gen
          LIMIT ?
        )`,
        args: [projectHash, branchName, limit],
      });

      const deleted = result.rowsAffected;

      // Stage 2: Clean up invalidated file_generations (active_gen = -1)
      // Only after all their entities are gone
      await client.execute({
        sql: `DELETE FROM file_generations
              WHERE project_hash = ? AND branch_name = ? AND active_gen = -1
              AND file_path NOT IN (
                SELECT DISTINCT file_path FROM entities
                WHERE project_hash = ? AND branch_name = ?
                AND file_path IN (
                  SELECT file_path FROM file_generations
                  WHERE project_hash = ? AND branch_name = ? AND active_gen = -1
                )
              )`,
        args: [projectHash, branchName, projectHash, branchName, projectHash, branchName],
      });

      if (deleted > 0) {
        log.i("GEN_OPS", "gc_stale_entities", { deleted });
      }

      return deleted;
    } finally {
      this.gcRunning = false;
    }
  }

  /**
   * GC: Delete orphaned name_tokens whose entities are stale.
   * Returns number of deleted rows.
   */
  async gcStaleNameTokens(limit = 10000): Promise<number> {
    const client = this.getClient();
    if (!client) return 0;

    const { projectHash, branchName } = this.getContext();

    const result = await client.execute({
      sql: `DELETE FROM name_tokens WHERE rowid IN (
        SELECT nt.rowid FROM name_tokens nt
        LEFT JOIN entities e
          ON nt.entity_id = e.id
          AND nt.project_hash = e.project_hash
          AND nt.branch_name = e.branch_name
        LEFT JOIN file_generations fg
          ON e.file_path = fg.file_path
          AND e.project_hash = fg.project_hash
          AND e.branch_name = fg.branch_name
        WHERE nt.project_hash = ? AND nt.branch_name = ?
          AND (e.id IS NULL OR e.file_gen != fg.active_gen)
        LIMIT ?
      )`,
      args: [projectHash, branchName, limit],
    });

    const deleted = result.rowsAffected;
    if (deleted > 0) {
      log.i("GEN_OPS", "gc_stale_tokens", { deleted });
    }
    return deleted;
  }

  /**
   * Run full GC cycle: entities first, then orphan tokens.
   * Repeats in chunks until nothing left to clean.
   */
  async runFullGC(): Promise<{ entities: number; tokens: number }> {
    let totalEntities = 0;
    let totalTokens = 0;

    // GC entities in chunks
    let deleted: number;
    do {
      deleted = await this.gcStaleEntities();
      totalEntities += deleted;
    } while (deleted > 0);

    // GC orphan tokens in chunks
    do {
      deleted = await this.gcStaleNameTokens();
      totalTokens += deleted;
    } while (deleted > 0);

    if (totalEntities > 0 || totalTokens > 0) {
      log.i("GEN_OPS", "full_gc_complete", { entities: totalEntities, tokens: totalTokens });
    }

    return { entities: totalEntities, tokens: totalTokens };
  }

  /**
   * Clear cache (e.g., on branch switch).
   */
  clearCache(): void {
    this.cache.clear();
    this.cacheLoaded = false;
  }

  get isCacheLoaded(): boolean {
    return this.cacheLoaded;
  }
}
