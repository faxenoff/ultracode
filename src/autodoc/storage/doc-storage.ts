/**
 * AutoDoc Storage Implementation
 *
 * CRUD operations for documentation entities.
 * Provides efficient querying and batch operations for doc storage.
 *
 * Architecture References:
 * - AutoDoc Types: src/autodoc/types.ts
 * - Schema: src/autodoc/storage/schema.sql
 * - Graph Storage: src/storage/graph-storage.ts
 *
 * Uses libsql for cross-runtime compatibility (Bun + Node.js)
 */

import type { Client, InStatement, ResultSet } from "@libsql/client";
import { createClient } from "@libsql/client";
import { nanoid } from "nanoid";
import type { ProjectContext } from "../../storage/libsql/types.js";
import { DEFAULT_PROJECT_CONTEXT } from "../../storage/libsql/types.js";
import type { AutoDocStatus, AutoDocTodo, ChangeLogEntry, DocEntity, DocEntityType, OutdatedDoc } from "../types.js";

// =============================================================================
// 1. CONSTANTS
// =============================================================================

const ID_LENGTH = 12;
const OUTDATED_CONFIDENCE_THRESHOLD = 0.7;

// =============================================================================
// 2. DOC STORAGE CLASS
// =============================================================================

export class DocStorage {
  private client: Client | null = null;
  private dbPath: string;
  private initialized = false;
  private currentContext: ProjectContext = DEFAULT_PROJECT_CONTEXT;

  constructor(dbPath: string) {
    this.dbPath = dbPath;
  }

  /**
   * Set project context for branch-aware operations
   */
  setProjectContext(context: ProjectContext): void {
    this.currentContext = context;
  }

  /**
   * Get current project context
   */
  getProjectContext(): ProjectContext {
    return this.currentContext;
  }

  /**
   * Initialize storage and create tables if needed
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    // Create libsql client
    this.client = createClient({
      url: `file:${this.dbPath}`,
    });

    await this.createTables();
    this.initialized = true;
  }

  private ensureReady(): void {
    if (!this.client) {
      throw new Error("DocStorage not initialized. Call initialize() first.");
    }
  }

  /**
   * Create AutoDoc tables if they don't exist
   */
  private async createTables(): Promise<void> {
    if (!this.client) return;

    // doc_entities table with branch support
    await this.client.execute(`
      CREATE TABLE IF NOT EXISTS doc_entities (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        file_path TEXT NOT NULL,
        section TEXT,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        tags TEXT DEFAULT '[]',
        auto_generated INTEGER DEFAULT 1,
        confidence REAL DEFAULT 1.0,
        last_sync INTEGER,
        project_hash TEXT NOT NULL DEFAULT 'legacy',
        branch_name TEXT NOT NULL DEFAULT 'main',
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )
    `);

    await this.client.execute(`CREATE INDEX IF NOT EXISTS idx_doc_file ON doc_entities(file_path)`);
    await this.client.execute(`CREATE INDEX IF NOT EXISTS idx_doc_type ON doc_entities(type)`);
    await this.client.execute(`CREATE INDEX IF NOT EXISTS idx_doc_section ON doc_entities(section)`);
    await this.client.execute(`CREATE INDEX IF NOT EXISTS idx_doc_confidence ON doc_entities(confidence)`);
    await this.client.execute(`CREATE INDEX IF NOT EXISTS idx_doc_updated ON doc_entities(updated_at)`);
    await this.client.execute(`CREATE INDEX IF NOT EXISTS idx_doc_branch ON doc_entities(project_hash, branch_name)`);

    // doc_changelog table
    await this.client.execute(`
      CREATE TABLE IF NOT EXISTS doc_changelog (
        id TEXT PRIMARY KEY,
        timestamp INTEGER NOT NULL,
        commit_hash TEXT,
        branch TEXT NOT NULL,
        summary TEXT,
        changes TEXT NOT NULL,
        impacted_docs TEXT DEFAULT '[]'
      )
    `);

    await this.client.execute(`CREATE INDEX IF NOT EXISTS idx_changelog_time ON doc_changelog(timestamp)`);
    await this.client.execute(`CREATE INDEX IF NOT EXISTS idx_changelog_commit ON doc_changelog(commit_hash)`);
    await this.client.execute(`CREATE INDEX IF NOT EXISTS idx_changelog_branch ON doc_changelog(branch)`);

    // doc_todos table
    await this.client.execute(`
      CREATE TABLE IF NOT EXISTS doc_todos (
        id TEXT PRIMARY KEY,
        file_path TEXT NOT NULL,
        title TEXT NOT NULL,
        priority TEXT NOT NULL DEFAULT 'medium',
        reason TEXT,
        related_entity_id TEXT,
        completed INTEGER DEFAULT 0,
        created_at INTEGER NOT NULL,
        completed_at INTEGER
      )
    `);

    await this.client.execute(`CREATE INDEX IF NOT EXISTS idx_todo_priority ON doc_todos(priority)`);
    await this.client.execute(`CREATE INDEX IF NOT EXISTS idx_todo_completed ON doc_todos(completed)`);
    await this.client.execute(`CREATE INDEX IF NOT EXISTS idx_todo_file ON doc_todos(file_path)`);
  }

  // ---------------------------------------------------------------------------
  // Document CRUD
  // ---------------------------------------------------------------------------

  /**
   * Generate document ID from file path and section
   */
  generateDocId(filePath: string, section?: string | null): string {
    const base = `doc::${filePath}`;
    return section ? `${base}::${this.slugify(section)}` : base;
  }

  /**
   * Create a new documentation entity
   */
  async createDoc(doc: Omit<DocEntity, "id" | "createdAt" | "updatedAt">): Promise<DocEntity> {
    this.ensureReady();

    const now = Date.now();
    const id = this.generateDocId(doc.filePath, doc.section);

    const entity: DocEntity = {
      ...doc,
      id,
      createdAt: now,
      updatedAt: now,
    };

    await this.client!.execute({
      sql: `INSERT INTO doc_entities (id, type, file_path, section, title, content, tags, auto_generated, confidence, last_sync, project_hash, branch_name, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        entity.id,
        entity.type,
        entity.filePath,
        entity.section ?? null,
        entity.title,
        entity.content,
        JSON.stringify(entity.tags),
        entity.autoGenerated ? 1 : 0,
        entity.confidence,
        entity.lastSync ?? null,
        this.currentContext.projectHash,
        this.currentContext.branchName,
        entity.createdAt,
        entity.updatedAt,
      ],
    });

    return entity;
  }

  /**
   * Update an existing documentation entity
   */
  async updateDoc(
    id: string,
    updates: Partial<Omit<DocEntity, "id" | "filePath" | "createdAt">>,
  ): Promise<DocEntity | null> {
    this.ensureReady();

    const existing = await this.getDoc(id);
    if (!existing) return null;

    const now = Date.now();
    const updated: DocEntity = {
      ...existing,
      ...updates,
      updatedAt: now,
    };

    await this.client!.execute({
      sql: `UPDATE doc_entities
            SET type = ?, title = ?, content = ?, tags = ?, auto_generated = ?, confidence = ?, last_sync = ?, updated_at = ?
            WHERE id = ?`,
      args: [
        updated.type,
        updated.title,
        updated.content,
        JSON.stringify(updated.tags),
        updated.autoGenerated ? 1 : 0,
        updated.confidence,
        updated.lastSync ?? null,
        updated.updatedAt,
        id,
      ],
    });

    return updated;
  }

  /**
   * Delete a documentation entity
   */
  async deleteDoc(id: string): Promise<boolean> {
    this.ensureReady();

    const result = await this.client!.execute({
      sql: `DELETE FROM doc_entities WHERE id = ?`,
      args: [id],
    });
    return result.rowsAffected > 0;
  }

  /**
   * Get a documentation entity by ID (with branch layers support)
   */
  async getDoc(id: string): Promise<DocEntity | null> {
    this.ensureReady();

    // If no baseBranch, simple query
    if (!this.currentContext.baseBranch) {
      const result = await this.client!.execute({
        sql: `SELECT * FROM doc_entities WHERE id = ? AND project_hash = ? AND branch_name = ?`,
        args: [id, this.currentContext.projectHash, this.currentContext.branchName],
      });

      if (result.rows.length === 0) return null;
      return this.rowToDocEntity(result.rows[0] as unknown as DocEntityRow);
    }

    // With baseBranch: use CTE to combine current + base with priority
    const result = await this.client!.execute({
      sql: `
        WITH combined AS (
          SELECT *, 1 as priority FROM doc_entities
          WHERE id = ? AND project_hash = ? AND branch_name = ?
          UNION ALL
          SELECT *, 2 as priority FROM doc_entities
          WHERE id = ? AND project_hash = ? AND branch_name = ?
        )
        SELECT * FROM (
          SELECT *, ROW_NUMBER() OVER (PARTITION BY id ORDER BY priority) as rn
          FROM combined
        ) WHERE rn = 1
      `,
      args: [
        id,
        this.currentContext.projectHash,
        this.currentContext.branchName,
        id,
        this.currentContext.projectHash,
        this.currentContext.baseBranch,
      ],
    });

    if (result.rows.length === 0) return null;
    return this.rowToDocEntity(result.rows[0] as unknown as DocEntityRow);
  }

  /**
   * Get all documentation entities for a file (with branch layers support)
   */
  async getDocsByFile(filePath: string): Promise<DocEntity[]> {
    this.ensureReady();

    // If no baseBranch, simple query
    if (!this.currentContext.baseBranch) {
      const result = await this.client!.execute({
        sql: `SELECT * FROM doc_entities WHERE file_path = ? AND project_hash = ? AND branch_name = ? ORDER BY section`,
        args: [filePath, this.currentContext.projectHash, this.currentContext.branchName],
      });

      return result.rows.map((row) => this.rowToDocEntity(row as unknown as DocEntityRow));
    }

    // With baseBranch: use CTE to combine current + base with deduplication
    const result = await this.client!.execute({
      sql: `
        WITH combined AS (
          SELECT *, 1 as priority FROM doc_entities
          WHERE file_path = ? AND project_hash = ? AND branch_name = ?
          UNION ALL
          SELECT *, 2 as priority FROM doc_entities
          WHERE file_path = ? AND project_hash = ? AND branch_name = ?
        )
        SELECT * FROM (
          SELECT *, ROW_NUMBER() OVER (PARTITION BY id ORDER BY priority) as rn
          FROM combined
        ) WHERE rn = 1
        ORDER BY section
      `,
      args: [
        filePath,
        this.currentContext.projectHash,
        this.currentContext.branchName,
        filePath,
        this.currentContext.projectHash,
        this.currentContext.baseBranch,
      ],
    });

    return result.rows.map((row) => this.rowToDocEntity(row as unknown as DocEntityRow));
  }

  /**
   * Get all documentation entities of a specific type
   */
  async getDocsByType(type: DocEntityType): Promise<DocEntity[]> {
    this.ensureReady();

    const result = await this.client!.execute({
      sql: `SELECT * FROM doc_entities WHERE type = ? ORDER BY file_path, section`,
      args: [type],
    });

    return result.rows.map((row) => this.rowToDocEntity(row as unknown as DocEntityRow));
  }

  /**
   * Get all documentation entities (with branch layers support)
   */
  async getAllDocs(options: { limit?: number; offset?: number } = {}): Promise<DocEntity[]> {
    this.ensureReady();

    const { limit, offset } = options;

    // If no baseBranch, simple query
    if (!this.currentContext.baseBranch) {
      let sql = `SELECT * FROM doc_entities WHERE project_hash = ? AND branch_name = ? ORDER BY file_path, section`;
      const args: (number | string)[] = [this.currentContext.projectHash, this.currentContext.branchName];

      if (limit !== undefined) {
        sql += ` LIMIT ?`;
        args.push(limit);
        if (offset !== undefined) {
          sql += ` OFFSET ?`;
          args.push(offset);
        }
      }

      const result = await this.client!.execute({ sql, args });
      return result.rows.map((row) => this.rowToDocEntity(row as unknown as DocEntityRow));
    }

    // With baseBranch: use CTE to combine current + base with deduplication
    let sql = `
      WITH combined AS (
        SELECT *, 1 as priority FROM doc_entities
        WHERE project_hash = ? AND branch_name = ?
        UNION ALL
        SELECT *, 2 as priority FROM doc_entities
        WHERE project_hash = ? AND branch_name = ?
      )
      SELECT * FROM (
        SELECT *, ROW_NUMBER() OVER (PARTITION BY id ORDER BY priority) as rn
        FROM combined
      ) WHERE rn = 1
      ORDER BY file_path, section
    `;
    const args: (number | string)[] = [
      this.currentContext.projectHash,
      this.currentContext.branchName,
      this.currentContext.projectHash,
      this.currentContext.baseBranch,
    ];

    if (limit !== undefined) {
      sql += ` LIMIT ?`;
      args.push(limit);
      if (offset !== undefined) {
        sql += ` OFFSET ?`;
        args.push(offset);
      }
    }

    const result = await this.client!.execute({ sql, args });
    return result.rows.map((row) => this.rowToDocEntity(row as unknown as DocEntityRow));
  }

  /**
   * Get max lastSync timestamp efficiently
   */
  async getMaxLastSync(): Promise<number | null> {
    this.ensureReady();

    const result = await this.client!.execute(
      "SELECT MAX(last_sync) as max_sync FROM doc_entities WHERE last_sync IS NOT NULL",
    );

    const row = result.rows[0] as unknown as { max_sync: number | null } | undefined;
    return row?.max_sync ?? null;
  }

  /**
   * Search documents by text (using SQL LIKE for efficiency, with branch layers support)
   */
  async searchByText(query: string, limit = 10): Promise<DocEntity[]> {
    this.ensureReady();

    const likePattern = `%${query}%`;

    // If no baseBranch, simple query
    if (!this.currentContext.baseBranch) {
      const result = await this.client!.execute({
        sql: `SELECT * FROM doc_entities
              WHERE (title LIKE ? COLLATE NOCASE OR content LIKE ? COLLATE NOCASE)
                AND project_hash = ? AND branch_name = ?
              ORDER BY
                CASE WHEN title LIKE ? COLLATE NOCASE THEN 0 ELSE 1 END,
                updated_at DESC
              LIMIT ?`,
        args: [
          likePattern,
          likePattern,
          this.currentContext.projectHash,
          this.currentContext.branchName,
          likePattern,
          limit,
        ],
      });

      return result.rows.map((row) => this.rowToDocEntity(row as unknown as DocEntityRow));
    }

    // With baseBranch: use CTE to combine current + base with deduplication
    const result = await this.client!.execute({
      sql: `
        WITH combined AS (
          SELECT *, 1 as priority FROM doc_entities
          WHERE (title LIKE ? COLLATE NOCASE OR content LIKE ? COLLATE NOCASE)
            AND project_hash = ? AND branch_name = ?
          UNION ALL
          SELECT *, 2 as priority FROM doc_entities
          WHERE (title LIKE ? COLLATE NOCASE OR content LIKE ? COLLATE NOCASE)
            AND project_hash = ? AND branch_name = ?
        )
        SELECT * FROM (
          SELECT *, ROW_NUMBER() OVER (PARTITION BY id ORDER BY priority) as rn
          FROM combined
        ) WHERE rn = 1
        ORDER BY
          CASE WHEN title LIKE ? COLLATE NOCASE THEN 0 ELSE 1 END,
          updated_at DESC
        LIMIT ?
      `,
      args: [
        likePattern,
        likePattern,
        this.currentContext.projectHash,
        this.currentContext.branchName,
        likePattern,
        likePattern,
        this.currentContext.projectHash,
        this.currentContext.baseBranch,
        likePattern,
        limit,
      ],
    });

    return result.rows.map((row) => this.rowToDocEntity(row as unknown as DocEntityRow));
  }

  /**
   * Get outdated documentation (confidence below threshold)
   */
  async getOutdatedDocs(threshold = OUTDATED_CONFIDENCE_THRESHOLD): Promise<OutdatedDoc[]> {
    this.ensureReady();

    const result = await this.client!.execute({
      sql: `SELECT * FROM doc_entities WHERE confidence < ? ORDER BY confidence ASC`,
      args: [threshold],
    });

    return result.rows.map((row) => {
      const r = row as unknown as DocEntityRow;
      return {
        docId: r.id,
        filePath: r.file_path,
        section: r.section || undefined,
        reason: `Confidence ${r.confidence.toFixed(2)} below threshold ${threshold}`,
        confidence: r.confidence,
      };
    });
  }

  /**
   * Mark documentation as outdated (reduce confidence)
   */
  async markOutdated(id: string, _reason?: string): Promise<boolean> {
    this.ensureReady();

    const doc = await this.getDoc(id);
    if (!doc) return false;

    await this.updateDoc(id, {
      confidence: Math.max(0, doc.confidence - 0.3),
    });

    return true;
  }

  /**
   * Batch upsert documents (optimized)
   */
  async upsertDocs(docs: Array<Omit<DocEntity, "id" | "createdAt" | "updatedAt">>): Promise<number> {
    this.ensureReady();

    const now = Date.now();

    // Use batch execute for efficiency
    const statements: InStatement[] = docs.map((doc) => {
      const id = this.generateDocId(doc.filePath, doc.section);
      return {
        sql: `INSERT OR REPLACE INTO doc_entities
              (id, type, file_path, section, title, content, tags, auto_generated, confidence, last_sync, created_at, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, COALESCE((SELECT created_at FROM doc_entities WHERE id = ?), ?), ?)`,
        args: [
          id,
          doc.type,
          doc.filePath,
          doc.section ?? null,
          doc.title,
          doc.content,
          JSON.stringify(doc.tags),
          doc.autoGenerated ? 1 : 0,
          doc.confidence,
          doc.lastSync ?? null,
          id, // For COALESCE subquery
          now, // created_at fallback
          now, // updated_at
        ],
      };
    });

    await this.client!.batch(statements);
    return docs.length;
  }

  // ---------------------------------------------------------------------------
  // Todo Operations
  // ---------------------------------------------------------------------------

  /**
   * Add a todo item for documentation
   */
  async addTodo(todo: Omit<AutoDocTodo, "sectionId"> & { sectionId?: string }): Promise<void> {
    this.ensureReady();

    const id = todo.sectionId || nanoid(ID_LENGTH);
    const now = Date.now();

    await this.client!.execute({
      sql: `INSERT OR REPLACE INTO doc_todos (id, file_path, title, priority, reason, related_entity_id, completed, created_at)
            VALUES (?, ?, ?, ?, ?, ?, 0, ?)`,
      args: [id, todo.filePath, todo.title, todo.priority, todo.reason ?? null, todo.relatedEntityId ?? null, now],
    });
  }

  /**
   * Mark a todo as completed
   */
  async completeTodo(id: string): Promise<boolean> {
    this.ensureReady();

    const result = await this.client!.execute({
      sql: `UPDATE doc_todos SET completed = 1, completed_at = ? WHERE id = ?`,
      args: [Date.now(), id],
    });
    return result.rowsAffected > 0;
  }

  /**
   * Get pending todos
   */
  async getTodos(priority?: "high" | "medium" | "low"): Promise<AutoDocTodo[]> {
    this.ensureReady();

    let result: ResultSet;
    if (priority) {
      result = await this.client!.execute({
        sql: `SELECT * FROM doc_todos
              WHERE completed = 0 AND priority = ?
              ORDER BY created_at ASC`,
        args: [priority],
      });
    } else {
      result = await this.client!.execute(`
        SELECT * FROM doc_todos WHERE completed = 0 ORDER BY
          CASE priority
            WHEN 'high' THEN 1
            WHEN 'medium' THEN 2
            WHEN 'low' THEN 3
          END,
          created_at ASC
      `);
    }

    return result.rows.map((row) => {
      const r = row as unknown as TodoRow;
      return {
        sectionId: r.id,
        filePath: r.file_path,
        title: r.title,
        priority: r.priority as "high" | "medium" | "low",
        reason: r.reason || "",
        relatedEntityId: r.related_entity_id || undefined,
      };
    });
  }

  // ---------------------------------------------------------------------------
  // Changelog Operations
  // ---------------------------------------------------------------------------

  /**
   * Record a changelog entry
   */
  async recordChange(entry: Omit<ChangeLogEntry, "id">): Promise<ChangeLogEntry> {
    this.ensureReady();

    const id = nanoid(ID_LENGTH);
    const fullEntry: ChangeLogEntry = { ...entry, id };

    await this.client!.execute({
      sql: `INSERT INTO doc_changelog (id, timestamp, commit_hash, branch, summary, changes, impacted_docs)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id,
        entry.timestamp,
        entry.commitHash ?? null,
        entry.branch,
        entry.summary ?? null,
        JSON.stringify(entry.changes),
        JSON.stringify(entry.impactedDocs),
      ],
    });

    return fullEntry;
  }

  /**
   * Get changelog entries
   */
  async getChangelog(
    options: { since?: number | undefined; limit?: number; branch?: string | undefined } = {},
  ): Promise<ChangeLogEntry[]> {
    this.ensureReady();

    const { since, limit = 50, branch } = options;

    let sql = "SELECT * FROM doc_changelog WHERE 1=1";
    const args: (number | string)[] = [];

    if (since) {
      sql += " AND timestamp >= ?";
      args.push(since);
    }

    if (branch) {
      sql += " AND branch = ?";
      args.push(branch);
    }

    sql += " ORDER BY timestamp DESC LIMIT ?";
    args.push(limit);

    const result = await this.client!.execute({ sql, args });

    return result.rows.map((row) => {
      const r = row as unknown as ChangelogRow;
      return {
        id: r.id,
        timestamp: r.timestamp,
        commitHash: r.commit_hash || undefined,
        branch: r.branch,
        summary: r.summary || undefined,
        changes: JSON.parse(r.changes),
        impactedDocs: JSON.parse(r.impacted_docs),
      };
    });
  }

  // ---------------------------------------------------------------------------
  // Statistics
  // ---------------------------------------------------------------------------

  /**
   * Get documentation statistics
   */
  async getStats(): Promise<AutoDocStatus["stats"]> {
    this.ensureReady();

    const totalDocsResult = await this.client!.execute("SELECT COUNT(*) as count FROM doc_entities");
    const totalDocs = (totalDocsResult.rows[0] as unknown as { count: number }).count;

    const totalSectionsResult = await this.client!.execute(
      "SELECT COUNT(*) as count FROM doc_entities WHERE section IS NOT NULL",
    );
    const totalSections = (totalSectionsResult.rows[0] as unknown as { count: number }).count;

    const filledSectionsResult = await this.client!.execute(
      "SELECT COUNT(*) as count FROM doc_entities WHERE section IS NOT NULL AND LENGTH(content) > 50",
    );
    const filledSections = (filledSectionsResult.rows[0] as unknown as { count: number }).count;

    const outdatedSectionsResult = await this.client!.execute({
      sql: `SELECT COUNT(*) as count FROM doc_entities WHERE confidence < ?`,
      args: [OUTDATED_CONFIDENCE_THRESHOLD],
    });
    const outdatedSections = (outdatedSectionsResult.rows[0] as unknown as { count: number }).count;

    // Reference stats will be added when RefStorage is implemented
    return {
      totalDocs,
      totalSections,
      filledSections,
      outdatedSections,
      totalRefs: 0,
      validRefs: 0,
      brokenRefs: 0,
    };
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  /**
   * Convert title to URL-safe slug
   */
  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  /**
   * Convert database row to DocEntity
   */
  private rowToDocEntity(row: DocEntityRow): DocEntity {
    return {
      id: row.id,
      type: row.type as DocEntityType,
      filePath: row.file_path,
      section: row.section,
      title: row.title,
      content: row.content,
      tags: JSON.parse(row.tags || "[]"),
      autoGenerated: row.auto_generated === 1,
      confidence: row.confidence,
      lastSync: row.last_sync ?? 0,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  /**
   * Clear all documentation data
   */
  async clear(): Promise<void> {
    this.ensureReady();

    await this.client!.batch(["DELETE FROM doc_entities", "DELETE FROM doc_changelog", "DELETE FROM doc_todos"]);
  }

  /**
   * Clean up resources
   */
  async destroy(): Promise<void> {
    if (this.client) {
      this.client.close();
      this.client = null;
    }
    this.initialized = false;
  }
}

// =============================================================================
// 3. TYPE DEFINITIONS FOR DB ROWS
// =============================================================================

interface DocEntityRow {
  id: string;
  type: string;
  file_path: string;
  section: string | null;
  title: string;
  content: string;
  tags: string;
  auto_generated: number;
  confidence: number;
  last_sync: number | null;
  created_at: number;
  updated_at: number;
}

interface TodoRow {
  id: string;
  file_path: string;
  title: string;
  priority: string;
  reason: string | null;
  related_entity_id: string | null;
  completed: number;
  created_at: number;
  completed_at: number | null;
}

interface ChangelogRow {
  id: string;
  timestamp: number;
  commit_hash: string | null;
  branch: string;
  summary: string | null;
  changes: string;
  impacted_docs: string;
}
