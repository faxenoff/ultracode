/**
 * Relationship Operations for LibSQL Graph Adapter
 *
 * Handles all Relationship CRUD operations: insert, get, find, delete.
 * Uses delegates for accessing shared client and context.
 *
 * v6: Layered branch support - reads from delta (current branch) + base branch,
 * with tombstone filtering for deleted relationships on feature branches.
 */

import type { BatchResult, Relationship, RelationType } from "../../types/storage.js";
import type { ClientGetter, ContextGetter } from "./types.js";

// =============================================================================
// ROW MAPPER TYPE
// =============================================================================

/**
 * Delegate type for converting database row to Relationship
 */
export type RowToRelationshipMapper = (row: unknown) => Relationship;

/**
 * Delegate type for adding tombstone when relationship is deleted on feature branch
 */
export type TombstoneAdder = (entityId: string, entityType: "entity" | "relationship") => Promise<void>;

/**
 * Delegate type for getting all tombstoned IDs for current branch
 */
export type TombstoneGetter = (entityType: "entity" | "relationship") => Promise<Set<string>>;

// =============================================================================
// RELATIONSHIP OPERATIONS CLASS
// =============================================================================

export class RelationshipOperations {
  private tombstoneAdder?: TombstoneAdder;
  private tombstoneGetter?: TombstoneGetter;

  constructor(
    private getClient: ClientGetter,
    private getContext: ContextGetter,
    private rowToRelationship: RowToRelationshipMapper,
    private getStagingMode: () => boolean = () => false,
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
   * Insert a single relationship
   */
  async insertRelationship(relationship: Relationship): Promise<void> {
    const client = this.getClient();
    if (!client) throw new Error("Client not initialized");

    const { projectHash, branchName } = this.getContext();
    const now = Date.now();

    await client.execute({
      sql: `
        INSERT OR REPLACE INTO relationships
        (id, project_hash, branch_name, from_id, to_id, type, metadata, weight, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        relationship.id,
        projectHash,
        branchName,
        relationship.fromId,
        relationship.toId,
        relationship.type,
        relationship.metadata ? JSON.stringify(relationship.metadata) : null,
        relationship.weight ?? 1.0,
        relationship.createdAt ?? now,
      ],
    });
  }

  /**
   * Insert multiple relationships with batch optimization
   */
  async insertRelationships(relationships: Relationship[]): Promise<BatchResult> {
    const client = this.getClient();
    if (!client) throw new Error("Client not initialized");
    if (relationships.length === 0) return { processed: 0, failed: 0, errors: [], timeMs: 0 };

    const start = Date.now();
    const errors: Array<{ item: unknown; error: string }> = [];
    const { projectHash, branchName } = this.getContext();
    const now = Date.now();

    // Deduplicate
    const seen = new Set<string>();
    const unique: Relationship[] = [];
    for (const r of relationships) {
      if (!seen.has(r.id)) {
        seen.add(r.id);
        unique.push(r);
      }
    }

    // OPTIMIZATION: Multi-row INSERT - single SQL statement with multiple VALUES
    // Much faster than N separate INSERT statements (reduces parsing overhead)
    // SQLite limit: ~32767 params, 9 fields per rel → batch 1000 = 9000 params (safe)
    const batchSize = 1000;

    let processed = 0;

    // Staging mode: write to append-only table (no PK, no indexes) for O(1) inserts
    const staging = this.getStagingMode();
    const relTable = staging ? "_staging_relationships" : "relationships";
    const insertVerb = staging ? "INSERT INTO" : "INSERT OR REPLACE INTO";

    // Collect all statements for single transaction
    const allStatements: Array<{ sql: string; args: (string | number | null)[] }> = [];

    for (let i = 0; i < unique.length; i += batchSize) {
      const batch = unique.slice(i, i + batchSize);

      // Build multi-row VALUES clause
      const valuePlaceholders = batch.map(() => "(?, ?, ?, ?, ?, ?, ?, ?, ?)").join(", ");

      // Flatten all args into single array
      const args: (string | number | null)[] = [];
      for (const r of batch) {
        args.push(
          r.id,
          projectHash,
          branchName,
          r.fromId,
          r.toId,
          r.type,
          r.metadata ? JSON.stringify(r.metadata) : null,
          r.weight ?? 1.0,
          r.createdAt ?? now,
        );
      }

      allStatements.push({
        sql: `${insertVerb} ${relTable}
        (id, project_hash, branch_name, from_id, to_id, type, metadata, weight, created_at)
        VALUES ${valuePlaceholders}`,
        args,
      });
    }

    // Execute ALL statements in a single transaction
    try {
      await client.batch(allStatements, "write");
      processed = unique.length;
    } catch (error) {
      errors.push({
        item: { batchStart: 0, batchEnd: unique.length },
        error: (error as Error).message,
      });
    }

    return {
      processed,
      failed: errors.length,
      errors,
      timeMs: Date.now() - start,
    };
  }

  /**
   * Get all relationships for an entity (as source or target) (layered: delta + base - tombstones)
   */
  async getRelationshipsForEntity(entityId: string, type?: RelationType): Promise<Relationship[]> {
    const client = this.getClient();
    if (!client) throw new Error("Client not initialized");

    const { projectHash, branchName, baseBranch } = this.getContext();

    // Simple case: no base branch
    if (!baseBranch) {
      let sql = `
        SELECT * FROM relationships
        WHERE project_hash = ? AND branch_name = ? AND (from_id = ? OR to_id = ?)
      `;
      const args: (string | number)[] = [projectHash, branchName, entityId, entityId];

      if (type) {
        sql += " AND type = ?";
        args.push(type);
      }

      const result = await client.execute({ sql, args });
      return result.rows.map((row) => this.rowToRelationship(row));
    }

    // Layered case
    const tombstones = this.tombstoneGetter ? await this.tombstoneGetter("relationship") : new Set<string>();

    // Get from delta
    let deltaSql = `
      SELECT * FROM relationships
      WHERE project_hash = ? AND branch_name = ? AND (from_id = ? OR to_id = ?)
    `;
    const deltaArgs: (string | number)[] = [projectHash, branchName, entityId, entityId];
    if (type) {
      deltaSql += " AND type = ?";
      deltaArgs.push(type);
    }

    const deltaResult = await client.execute({ sql: deltaSql, args: deltaArgs });
    const deltaRels = deltaResult.rows.map((row) => this.rowToRelationship(row));
    const deltaIds = new Set(deltaRels.map((r) => r.id));

    // Get from base
    let baseSql = `
      SELECT * FROM relationships
      WHERE project_hash = ? AND branch_name = ? AND (from_id = ? OR to_id = ?)
    `;
    const baseArgs: (string | number)[] = [projectHash, baseBranch, entityId, entityId];
    if (type) {
      baseSql += " AND type = ?";
      baseArgs.push(type);
    }

    const baseResult = await client.execute({ sql: baseSql, args: baseArgs });
    const baseRels = baseResult.rows
      .map((row) => this.rowToRelationship(row))
      .filter((r) => !deltaIds.has(r.id) && !tombstones.has(r.id));

    return [...deltaRels, ...baseRels];
  }

  /**
   * Build filter clause for relationship type
   */
  private buildTypeFilter(types: RelationType | RelationType[] | undefined, args: (string | number)[]): string {
    if (!types) return "";
    const typeArray = Array.isArray(types) ? types : [types];
    args.push(...typeArray);
    return ` AND type IN (${typeArray.map(() => "?").join(",")})`;
  }

  /**
   * Build type filter for CTE (static SQL, no parameter mutation)
   */
  private buildTypeFilterForCTE(types: RelationType | RelationType[] | undefined): string {
    if (!types) return "";
    const typeArray = Array.isArray(types) ? types : [types];
    const quoted = typeArray.map((t) => `'${t}'`).join(",");
    return `AND type IN (${quoted})`;
  }

  /**
   * Build fromId filter for direct SQL
   */
  private buildFromIdFilter(fromIds: string | string[] | undefined, args: (string | number)[]): string {
    if (!fromIds) return "";
    const idArray = Array.isArray(fromIds) ? fromIds : [fromIds];
    args.push(...idArray);
    return ` AND from_id IN (${idArray.map(() => "?").join(",")})`;
  }

  /**
   * Build fromId filter for CTE (static SQL)
   */
  private buildFromIdFilterForCTE(fromIds: string | string[] | undefined): string {
    if (!fromIds) return "";
    const idArray = Array.isArray(fromIds) ? fromIds : [fromIds];
    const quoted = idArray.map((id) => `'${id}'`).join(",");
    return `AND from_id IN (${quoted})`;
  }

  /**
   * Build toId filter for direct SQL
   */
  private buildToIdFilter(toIds: string | string[] | undefined, args: (string | number)[]): string {
    if (!toIds) return "";
    const idArray = Array.isArray(toIds) ? toIds : [toIds];
    args.push(...idArray);
    return ` AND to_id IN (${idArray.map(() => "?").join(",")})`;
  }

  /**
   * Build toId filter for CTE (static SQL)
   */
  private buildToIdFilterForCTE(toIds: string | string[] | undefined): string {
    if (!toIds) return "";
    const idArray = Array.isArray(toIds) ? toIds : [toIds];
    const quoted = idArray.map((id) => `'${id}'`).join(",");
    return `AND to_id IN (${quoted})`;
  }

  /**
   * Find relationships with complex filters (layered: delta + base - tombstones)
   * Uses CTE for efficient layered queries with proper LIMIT/OFFSET at SQL level
   */
  async findRelationships(query: {
    filters?:
      | {
          relationshipType?: RelationType | RelationType[] | undefined;
          fromId?: string | string[] | undefined;
          toId?: string | string[] | undefined;
        }
      | undefined;
    limit?: number | undefined;
    offset?: number | undefined;
  }): Promise<Relationship[]> {
    const client = this.getClient();
    if (!client) throw new Error("Client not initialized");

    const { projectHash, branchName, baseBranch } = this.getContext();
    const limit = query.limit || 100;
    const offset = query.offset || 0;

    // Simple case: no base branch
    if (!baseBranch) {
      const args: (string | number)[] = [projectHash, branchName];
      let sql = "SELECT * FROM relationships WHERE project_hash = ? AND branch_name = ?";
      sql += this.buildTypeFilter(query.filters?.relationshipType, args);
      sql += this.buildFromIdFilter(query.filters?.fromId, args);
      sql += this.buildToIdFilter(query.filters?.toId, args);
      sql += " LIMIT ? OFFSET ?";
      args.push(limit, offset);

      const result = await client.execute({ sql, args });
      return result.rows.map((row) => this.rowToRelationship(row));
    }

    // Layered case: use CTE for efficient query with SQL-level LIMIT/OFFSET
    const typeFilter = this.buildTypeFilterForCTE(query.filters?.relationshipType);
    const fromIdFilter = this.buildFromIdFilterForCTE(query.filters?.fromId);
    const toIdFilter = this.buildToIdFilterForCTE(query.filters?.toId);
    const combinedFilters = `${typeFilter} ${fromIdFilter} ${toIdFilter}`;

    const sql = `
      WITH
        delta AS (
          SELECT * FROM relationships
          WHERE project_hash = ?1 AND branch_name = ?2 ${combinedFilters}
        ),
        tombstone_ids AS (
          SELECT entity_id FROM tombstones
          WHERE project_hash = ?1 AND branch_name = ?2 AND entity_type = 'relationship'
        ),
        base_filtered AS (
          SELECT * FROM relationships
          WHERE project_hash = ?1 AND branch_name = ?3 ${combinedFilters}
            AND id NOT IN (SELECT id FROM delta)
            AND id NOT IN (SELECT entity_id FROM tombstone_ids)
        ),
        layered AS (
          SELECT * FROM delta
          UNION ALL
          SELECT * FROM base_filtered
        )
      SELECT * FROM layered
      LIMIT ?4 OFFSET ?5
    `;

    const result = await client.execute({
      sql,
      args: [projectHash, branchName, baseBranch, limit, offset],
    });

    return result.rows.map((row) => this.rowToRelationship(row));
  }

  /**
   * Delete relationship by ID.
   * On feature branches with baseBranch set, adds tombstone instead of deleting.
   */
  async deleteRelationship(id: string): Promise<void> {
    const client = this.getClient();
    if (!client) throw new Error("Client not initialized");

    const { projectHash, branchName, baseBranch } = this.getContext();

    // On feature branch: add tombstone to hide relationship from base
    if (baseBranch && this.tombstoneAdder) {
      await this.tombstoneAdder(id, "relationship");
    }

    // Always delete from current branch (delta or base)
    await client.execute({
      sql: "DELETE FROM relationships WHERE id = ? AND project_hash = ? AND branch_name = ?",
      args: [id, projectHash, branchName],
    });
  }

  /**
   * Get ALL relationships efficiently in a single query.
   * Layered: returns delta + base - tombstones using CTE.
   */
  async getAllRelationships(): Promise<Relationship[]> {
    const client = this.getClient();
    if (!client) throw new Error("Client not initialized");

    const { projectHash, branchName, baseBranch } = this.getContext();

    // Simple case: no base branch - single query
    if (!baseBranch) {
      const result = await client.execute({
        sql: "SELECT * FROM relationships WHERE project_hash = ? AND branch_name = ?",
        args: [projectHash, branchName],
      });
      return result.rows.map((row) => this.rowToRelationship(row));
    }

    // Layered case: single CTE query for delta + base - tombstones
    const sql = `
      WITH
        delta AS (
          SELECT * FROM relationships
          WHERE project_hash = ?1 AND branch_name = ?2
        ),
        tombstone_ids AS (
          SELECT entity_id FROM tombstones
          WHERE project_hash = ?1 AND branch_name = ?2 AND entity_type = 'relationship'
        ),
        base_filtered AS (
          SELECT * FROM relationships
          WHERE project_hash = ?1 AND branch_name = ?3
            AND id NOT IN (SELECT id FROM delta)
            AND id NOT IN (SELECT entity_id FROM tombstone_ids)
        )
      SELECT * FROM delta
      UNION ALL
      SELECT * FROM base_filtered
    `;

    const result = await client.execute({
      sql,
      args: [projectHash, branchName, baseBranch],
    });

    return result.rows.map((row) => this.rowToRelationship(row));
  }
}
