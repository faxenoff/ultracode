/**
 * Metadata Operations for LibSQL Graph Adapter
 *
 * Handles all metadata operations: file info, project metadata,
 * incremental tracking, branch listing, stats, and clear operations.
 */

import { log } from "../../logging/index.js";
import type { FileInfo } from "../../types/storage.js";
import type { ClientGetter, ContextGetter } from "./types.js";

// =============================================================================
// METADATA OPERATIONS CLASS
// =============================================================================

export class MetadataOperations {
  constructor(
    private getClient: ClientGetter,
    private getContext: ContextGetter,
    private getCacheClient?: ClientGetter,
  ) {}

  // ===========================================================================
  // FILE OPERATIONS
  // ===========================================================================

  /**
   * Update or insert file info
   */
  async updateFileInfo(info: FileInfo): Promise<void> {
    const client = this.getClient();
    if (!client) throw new Error("Client not initialized");

    const { projectHash, branchName } = this.getContext();
    await client.execute({
      sql: `
        INSERT OR REPLACE INTO files
        (path, project_hash, branch_name, hash, last_indexed, entity_count)
        VALUES (?, ?, ?, ?, ?, ?)
      `,
      args: [info.path, projectHash, branchName, info.hash, info.lastIndexed, info.entityCount],
    });
  }

  /**
   * Batch update or insert multiple file infos in a single DB round-trip.
   */
  async batchUpdateFileInfo(infos: FileInfo[]): Promise<void> {
    if (infos.length === 0) return;
    const client = this.getClient();
    if (!client) throw new Error("Client not initialized");

    const { projectHash, branchName } = this.getContext();
    const statements = infos.map((info) => ({
      sql: `
        INSERT OR REPLACE INTO files
        (path, project_hash, branch_name, hash, last_indexed, entity_count)
        VALUES (?, ?, ?, ?, ?, ?)
      `,
      args: [info.path, projectHash, branchName, info.hash, info.lastIndexed, info.entityCount] as (string | number)[],
    }));

    await client.batch(statements, "write");
  }

  /**
   * Get file info by path
   */
  async getFileInfo(path: string): Promise<FileInfo | null> {
    const client = this.getClient();
    if (!client) throw new Error("Client not initialized");

    const { projectHash, branchName } = this.getContext();
    const result = await client.execute({
      sql: "SELECT * FROM files WHERE path = ? AND project_hash = ? AND branch_name = ?",
      args: [path, projectHash, branchName],
    });

    if (result.rows.length === 0 || !result.rows[0]) return null;
    const row = result.rows[0];
    return {
      path: row["path"] as string,
      hash: row["hash"] as string,
      lastIndexed: row["last_indexed"] as number,
      entityCount: row["entity_count"] as number,
    };
  }

  /**
   * Get files that were indexed before the specified timestamp
   */
  async getOutdatedFiles(since: number): Promise<FileInfo[]> {
    const client = this.getClient();
    if (!client) throw new Error("Client not initialized");

    const { projectHash, branchName } = this.getContext();
    const result = await client.execute({
      sql: `
        SELECT * FROM files
        WHERE project_hash = ? AND branch_name = ? AND last_indexed < ?
      `,
      args: [projectHash, branchName, since],
    });

    return result.rows.map((row) => ({
      path: row["path"] as string,
      hash: row["hash"] as string,
      lastIndexed: row["last_indexed"] as number,
      entityCount: row["entity_count"] as number,
    }));
  }

  /**
   * Get all indexed files with their lastIndexed timestamps
   * Used for incremental indexing to compare with file mtime
   */
  async getAllIndexedFiles(): Promise<Map<string, number>> {
    const client = this.getClient();
    if (!client) throw new Error("Client not initialized");

    const { projectHash, branchName } = this.getContext();
    const result = await client.execute({
      sql: `
        SELECT path, last_indexed FROM files
        WHERE project_hash = ? AND branch_name = ?
      `,
      args: [projectHash, branchName],
    });

    const fileMap = new Map<string, number>();
    for (const row of result.rows) {
      const path = row["path"] as string;
      const lastIndexed = row["last_indexed"] as number;
      // Store with forward slashes for consistency
      fileMap.set(path.replace(/\\/g, "/"), lastIndexed);
    }
    return fileMap;
  }

  /**
   * Delete file info by path
   */
  async deleteFileInfo(path: string): Promise<void> {
    const client = this.getClient();
    if (!client) throw new Error("Client not initialized");

    const { projectHash, branchName } = this.getContext();
    const forwardPath = path.replace(/\\/g, "/");
    const backPath = path.replace(/\//g, "\\");

    await client.execute({
      sql: `
        DELETE FROM files
        WHERE project_hash = ? AND branch_name = ?
        AND (path = ? OR path = ?)
      `,
      args: [projectHash, branchName, forwardPath, backPath],
    });
  }

  // ===========================================================================
  // PROJECT METADATA
  // ===========================================================================

  /**
   * Update project metadata after indexing
   */
  async updateProjectMetadata(projectPath: string, isFullIndex = false): Promise<void> {
    const client = this.getClient();
    if (!client) throw new Error("Client not initialized");

    const { projectHash, branchName } = this.getContext();
    const now = Date.now();

    // Count entities (active generation only) and files
    const entityCount = await client.execute({
      sql: `SELECT COUNT(*) as count FROM entities e
            JOIN file_generations fg
              ON e.file_path = fg.file_path AND e.project_hash = fg.project_hash AND e.branch_name = fg.branch_name
            WHERE e.project_hash = ? AND e.branch_name = ? AND e.file_gen = fg.active_gen`,
      args: [projectHash, branchName],
    });
    const fileCount = await client.execute({
      sql: "SELECT COUNT(*) as count FROM files WHERE project_hash = ? AND branch_name = ?",
      args: [projectHash, branchName],
    });

    // Get existing tracking data to preserve it (or reset if full index)
    const existing = await client.execute({
      sql: `SELECT last_full_index_at, incremental_changes_count, created_at
            FROM project_metadata WHERE project_hash = ? AND branch_name = ?`,
      args: [projectHash, branchName],
    });

    const existingRow = existing.rows[0];
    const createdAt = (existingRow?.["created_at"] as number) || now;

    // On full index: reset counter and update last_full_index_at
    // On incremental: preserve existing values
    const lastFullIndexAt = isFullIndex ? now : (existingRow?.["last_full_index_at"] as number) || 0;
    const incrementalChangesCount = isFullIndex ? 0 : (existingRow?.["incremental_changes_count"] as number) || 0;

    await client.execute({
      sql: `
        INSERT OR REPLACE INTO project_metadata
        (project_hash, branch_name, project_path, last_indexed_at, entity_count, file_count,
         created_at, updated_at, last_full_index_at, incremental_changes_count)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        projectHash,
        branchName,
        projectPath,
        now,
        (entityCount.rows[0]?.["count"] as number) || 0,
        (fileCount.rows[0]?.["count"] as number) || 0,
        createdAt,
        now,
        lastFullIndexAt,
        incrementalChangesCount,
      ],
    });
  }

  /**
   * Get incremental tracking info for the current project/branch
   */
  async getIncrementalTrackingInfo(): Promise<{
    lastFullIndexAt: number;
    incrementalChangesCount: number;
    totalFiles: number;
  }> {
    const client = this.getClient();
    if (!client) throw new Error("Client not initialized");

    const { projectHash, branchName } = this.getContext();

    const result = await client.execute({
      sql: `SELECT last_full_index_at, incremental_changes_count, file_count
            FROM project_metadata WHERE project_hash = ? AND branch_name = ?`,
      args: [projectHash, branchName],
    });

    if (result.rows.length === 0) {
      return { lastFullIndexAt: 0, incrementalChangesCount: 0, totalFiles: 0 };
    }

    const row = result.rows[0]!;
    return {
      lastFullIndexAt: (row["last_full_index_at"] as number) || 0,
      incrementalChangesCount: (row["incremental_changes_count"] as number) || 0,
      totalFiles: (row["file_count"] as number) || 0,
    };
  }

  /**
   * Record incremental file changes (called after each incremental update)
   */
  async recordIncrementalChanges(changedFileCount: number): Promise<void> {
    const client = this.getClient();
    if (!client) throw new Error("Client not initialized");

    const { projectHash, branchName } = this.getContext();

    await client.execute({
      sql: `UPDATE project_metadata
            SET incremental_changes_count = incremental_changes_count + ?,
                updated_at = ?
            WHERE project_hash = ? AND branch_name = ?`,
      args: [changedFileCount, Date.now(), projectHash, branchName],
    });
  }

  /**
   * Reset incremental tracking (called after full index)
   */
  async resetIncrementalTracking(): Promise<void> {
    const client = this.getClient();
    if (!client) throw new Error("Client not initialized");

    const { projectHash, branchName } = this.getContext();
    const now = Date.now();

    await client.execute({
      sql: `UPDATE project_metadata
            SET last_full_index_at = ?,
                incremental_changes_count = 0,
                updated_at = ?
            WHERE project_hash = ? AND branch_name = ?`,
      args: [now, now, projectHash, branchName],
    });
  }

  /**
   * List all projects in the database
   */
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
    const client = this.getClient();
    if (!client) throw new Error("Client not initialized");

    const result = await client.execute(`
      SELECT project_hash, branch_name, project_path, last_indexed_at, entity_count, file_count
      FROM project_metadata
      ORDER BY updated_at DESC
    `);

    return result.rows.map((r) => ({
      projectHash: r["project_hash"] as string,
      branchName: r["branch_name"] as string,
      projectPath: r["project_path"] as string,
      lastIndexedAt: r["last_indexed_at"] as number,
      entityCount: r["entity_count"] as number,
      fileCount: r["file_count"] as number,
    }));
  }

  /**
   * List all branches for current project
   */
  async listBranches(): Promise<string[]> {
    const client = this.getClient();
    if (!client) throw new Error("Client not initialized");

    const { projectHash } = this.getContext();
    const result = await client.execute({
      sql: `
        SELECT DISTINCT branch_name FROM project_metadata
        WHERE project_hash = ?
        ORDER BY branch_name
      `,
      args: [projectHash],
    });

    return result.rows.map((r) => r["branch_name"] as string);
  }

  // ===========================================================================
  // STATS
  // ===========================================================================

  /**
   * Get stats for current project/branch
   * Uses layered approach: if baseBranch is set and different from current, includes both
   */
  async getStats(): Promise<{
    totalEntities: number;
    totalRelationships: number;
    totalFiles: number;
    totalEmbeddings: number;
  }> {
    const client = this.getClient();
    if (!client) throw new Error("Client not initialized");

    const { projectHash, branchName, baseBranch } = this.getContext();

    // Layered read: include base branch if set and different from current
    const useLayered = baseBranch && baseBranch !== branchName;
    const branchFilter = useLayered ? "branch_name IN (?, ?)" : "branch_name = ?";
    const branchArgs = useLayered ? [baseBranch, branchName] : [branchName];

    const [entities, relationships, files] = await Promise.all([
      client.execute({
        sql: `SELECT COUNT(*) as cnt FROM entities e
              JOIN file_generations fg
                ON e.file_path = fg.file_path AND e.project_hash = fg.project_hash AND e.branch_name = fg.branch_name
              WHERE e.project_hash = ? AND e.file_gen = fg.active_gen AND e.${branchFilter}`,
        args: [projectHash, ...branchArgs],
      }),
      client.execute({
        sql: `SELECT COUNT(*) as cnt FROM relationships r
              WHERE r.project_hash = ? AND r.${branchFilter}
              AND EXISTS (
                SELECT 1 FROM entities e
                JOIN file_generations fg
                  ON e.file_path = fg.file_path AND e.project_hash = fg.project_hash AND e.branch_name = fg.branch_name
                WHERE e.id = r.from_id AND e.file_gen = fg.active_gen
              )`,
        args: [projectHash, ...branchArgs],
      }),
      client.execute({
        sql: `SELECT COUNT(*) as cnt FROM files WHERE project_hash = ? AND ${branchFilter}`,
        args: [projectHash, ...branchArgs],
      }),
    ]);

    return {
      totalEntities: (entities.rows[0]?.["cnt"] as number) || 0,
      totalRelationships: (relationships.rows[0]?.["cnt"] as number) || 0,
      totalFiles: (files.rows[0]?.["cnt"] as number) || 0,
      totalEmbeddings: 0, // v5: embeddings stored in FAISS, not LibSQL
    };
  }

  /**
   * Get stats across all projects
   */
  async getTotalStats(): Promise<{
    totalEntities: number;
    totalRelationships: number;
    totalFiles: number;
    totalEmbeddings: number;
  }> {
    const client = this.getClient();
    if (!client) throw new Error("Client not initialized");

    const [entities, relationships, files] = await Promise.all([
      client.execute("SELECT COUNT(*) as cnt FROM entities"),
      client.execute("SELECT COUNT(*) as cnt FROM relationships"),
      client.execute("SELECT COUNT(*) as cnt FROM files"),
    ]);

    return {
      totalEntities: (entities.rows[0]?.["cnt"] as number) || 0,
      totalRelationships: (relationships.rows[0]?.["cnt"] as number) || 0,
      totalFiles: (files.rows[0]?.["cnt"] as number) || 0,
      totalEmbeddings: 0, // v5: embeddings stored in FAISS, not LibSQL
    };
  }

  // ===========================================================================
  // CLEAR OPERATIONS
  // ===========================================================================

  /**
   * Clear all data for current project/branch.
   * Auto-detects single-project DB and uses fast truncation path (clearAll)
   * to avoid SQLite B-tree fragmentation that causes 56x slower INSERTs.
   */
  async clear(): Promise<void> {
    const client = this.getClient();
    if (!client) throw new Error("Client not initialized");

    const { projectHash, branchName } = this.getContext();

    // Check if this is the only project — use fast truncation path if so
    const otherProjects = await client.execute({
      sql: "SELECT 1 FROM entities WHERE project_hash != ? LIMIT 1",
      args: [projectHash],
    });

    if (otherProjects.rows.length === 0) {
      // Single project — use clearAll() which includes WAL checkpoint
      await this.clearAll();
      // VACUUM reclaims freelist pages so INSERTs don't trigger slow page reuse.
      // On empty DB this is fast (~100ms).
      try {
        await client.execute({ sql: "VACUUM", args: [] });
      } catch {
        // Non-critical
      }
      log.i("METADATAOPS", "data_cleared_fast", { ctx: `${projectHash}/${branchName}`, mode: "truncate+vacuum" });
      return;
    }

    // Multi-project — row-by-row delete + VACUUM to defragment B-trees
    // Graph tables (entities, relationships, files, project_metadata, name_tokens)
    await client.batch(
      [
        {
          sql: "DELETE FROM relationships WHERE project_hash = ? AND branch_name = ?",
          args: [projectHash, branchName],
        },
        { sql: "DELETE FROM entities WHERE project_hash = ? AND branch_name = ?", args: [projectHash, branchName] },
        { sql: "DELETE FROM files WHERE project_hash = ? AND branch_name = ?", args: [projectHash, branchName] },
        {
          sql: "DELETE FROM project_metadata WHERE project_hash = ? AND branch_name = ?",
          args: [projectHash, branchName],
        },
        {
          sql: "DELETE FROM name_tokens WHERE project_hash = ? AND branch_name = ?",
          args: [projectHash, branchName],
        },
      ],
      "write",
    );

    // Cache tables (query_cache) — may be on separate DB
    const cacheClient = this.getCacheClient?.() ?? client;
    if (cacheClient) {
      await cacheClient.execute({
        sql: "DELETE FROM query_cache WHERE project_hash = ? AND branch_name = ?",
        args: [projectHash, branchName],
      });
    }

    // Semantic tables (cooccurrence, term_frequency) — may be on separate DB
    // Try on the main client first; if table doesn't exist there (multi-db), it's in semantic.db
    try {
      await client.batch(
        [
          {
            sql: "DELETE FROM cooccurrence WHERE project_hash = ? AND branch_name = ?",
            args: [projectHash, branchName],
          },
          {
            sql: "DELETE FROM term_frequency WHERE project_hash = ? AND branch_name = ?",
            args: [projectHash, branchName],
          },
        ],
        "write",
      );
    } catch {
      // In multi-db mode, these tables are not on the graph client — that's OK
    }

    // VACUUM defragments B-trees after mass DELETE, preventing 56x slower INSERTs
    try {
      await client.execute({ sql: "VACUUM", args: [] });
      log.i("METADATAOPS", "data_cleared", { ctx: `${projectHash}/${branchName}`, mode: "delete+vacuum" });
    } catch (error) {
      // VACUUM can fail under concurrent access — non-critical
      log.w("METADATAOPS", "vacuum_fail", { err: (error as Error).message });
      log.i("METADATAOPS", "data_cleared", { ctx: `${projectHash}/${branchName}`, mode: "delete" });
    }
  }

  /**
   * Clear ALL data in the database
   */
  async clearAll(): Promise<void> {
    const client = this.getClient();
    if (!client) throw new Error("Client not initialized");

    // Graph tables
    await client.batch(
      [
        { sql: "DELETE FROM relationships", args: [] },
        { sql: "DELETE FROM entities", args: [] },
        { sql: "DELETE FROM files", args: [] },
        { sql: "DELETE FROM project_metadata", args: [] },
        { sql: "DELETE FROM name_tokens", args: [] },
      ],
      "write",
    );

    // Cache tables — may be on separate DB
    const cacheClient = this.getCacheClient?.() ?? client;
    if (cacheClient) {
      try {
        await cacheClient.execute({ sql: "DELETE FROM query_cache", args: [] });
      } catch {
        // Table may not exist yet
      }
    }

    // Semantic tables — may be on separate DB
    try {
      await client.batch(
        [
          { sql: "DELETE FROM cooccurrence", args: [] },
          { sql: "DELETE FROM term_frequency", args: [] },
        ],
        "write",
      );
    } catch {
      // In multi-db mode, these tables are not on the graph client
    }

    // Flush and truncate WAL after mass DELETE to prevent slow INSERTs.
    // Without this, accumulated WAL pages from prior writes cause
    // automatic checkpoints during INSERT, adding ~12s overhead.
    try {
      await client.execute({ sql: "PRAGMA wal_checkpoint(TRUNCATE)", args: [] });
    } catch {
      // Non-critical — checkpoint may fail under concurrent access
    }

    log.i("METADATAOPS", "all_data_cleared");
  }
}
