/**
 * Multi-Database Manager
 *
 * Manages 4 independent libsql database clients to eliminate write-blocking:
 * - graph.db: entities, relationships, files, file_generations, tombstones, name_tokens, project_metadata
 * - semantic.db: cooccurrence, term_frequency
 * - versioning.db: prolly_nodes, graph_commits, branch_heads
 * - cache.db: embedding_cache, query_cache, performance_metrics
 *
 * Each DB has its own connection, so index writes to graph.db
 * don't block semantic search reads from semantic.db/cache.db.
 */

import { existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import type { Client } from "@libsql/client";
import { log } from "../logging/index.js";

export interface MultiDbPaths {
  graph: string;
  semantic: string;
  versioning: string;
  cache: string;
}

export function getMultiDbPaths(basePath: string): MultiDbPaths {
  return {
    graph: join(basePath, "graph.db"),
    semantic: join(basePath, "semantic.db"),
    versioning: join(basePath, "versioning.db"),
    cache: join(basePath, "cache.db"),
  };
}

/**
 * Performance PRAGMAs applied to each database.
 * All data is regeneratable, so we use aggressive settings.
 */
const PRAGMA_STATEMENTS = [
  "PRAGMA busy_timeout = 5000",
  "PRAGMA cache_size = -8192",
  "PRAGMA temp_store = MEMORY",
  "PRAGMA mmap_size = 0",
  "PRAGMA journal_mode = OFF",
  "PRAGMA synchronous = OFF",
];

export class MultiDbManager {
  private clients: {
    graph: Client | null;
    semantic: Client | null;
    versioning: Client | null;
    cache: Client | null;
  } = { graph: null, semantic: null, versioning: null, cache: null };

  private paths: MultiDbPaths | null = null;
  private _isInitialized = false;

  get isInitialized(): boolean {
    return this._isInitialized;
  }

  async initialize(basePath: string): Promise<void> {
    this.paths = getMultiDbPaths(basePath);

    // Ensure directory exists
    const dir = dirname(this.paths.graph);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    // Remove stale lock files for all DBs
    await this.cleanupStaleLocks();

    const { createClient } = await import("@libsql/client");

    // Create all 4 clients in parallel
    const entries = Object.entries(this.paths) as [keyof MultiDbPaths, string][];
    const results = await Promise.all(
      entries.map(async ([key, dbPath]) => {
        const client = createClient({ url: `file:${dbPath}` });
        // Verify connection
        await client.execute("SELECT 1");
        // Apply PRAGMAs
        for (const pragma of PRAGMA_STATEMENTS) {
          await client.execute(pragma);
        }
        return [key, client] as const;
      }),
    );

    for (const [key, client] of results) {
      this.clients[key] = client;
    }

    this._isInitialized = true;
    log.i("MULTIDB", "initialized", {
      graph: this.paths.graph,
      semantic: this.paths.semantic,
      versioning: this.paths.versioning,
      cache: this.paths.cache,
    });
  }

  getGraphClient(): Client | null {
    return this.clients.graph;
  }

  getSemanticClient(): Client | null {
    return this.clients.semantic;
  }

  getVersioningClient(): Client | null {
    return this.clients.versioning;
  }

  getCacheClient(): Client | null {
    return this.clients.cache;
  }

  getPaths(): MultiDbPaths | null {
    return this.paths;
  }

  /**
   * Flush a specific database by closing and reopening its client.
   * With journal_mode=OFF, this ensures OS buffers are flushed.
   */
  async flushClient(which: keyof MultiDbPaths): Promise<Client | null> {
    const client = this.clients[which];
    const path = this.paths?.[which];
    if (!client || !path) return null;

    client.close();

    const { createClient } = await import("@libsql/client");
    const newClient = createClient({ url: `file:${path}` });
    for (const pragma of PRAGMA_STATEMENTS) {
      await newClient.execute(pragma);
    }

    this.clients[which] = newClient;
    return newClient;
  }

  /**
   * Flush all databases.
   */
  async flushAll(): Promise<void> {
    const keys: (keyof MultiDbPaths)[] = ["graph", "semantic", "versioning", "cache"];
    await Promise.all(keys.map((k) => this.flushClient(k)));
  }

  async close(): Promise<void> {
    for (const [key, client] of Object.entries(this.clients)) {
      if (client) {
        try {
          (client as Client).close();
        } catch {
          // Ignore close errors
        }
        this.clients[key as keyof MultiDbPaths] = null;
      }
    }
    this._isInitialized = false;
    log.i("MULTIDB", "closed");
  }

  /**
   * Delete all database files (for corruption recovery).
   */
  async deleteAll(): Promise<boolean> {
    if (!this.paths) return false;
    const { unlink } = await import("node:fs/promises");
    let anyDeleted = false;

    for (const dbPath of Object.values(this.paths)) {
      for (const suffix of ["", "-journal", "-wal", "-shm"]) {
        try {
          await unlink(dbPath + suffix);
          anyDeleted = true;
        } catch {
          // File doesn't exist - OK
        }
      }
    }
    return anyDeleted;
  }

  private async cleanupStaleLocks(): Promise<void> {
    if (!this.paths) return;
    const { unlink } = await import("node:fs/promises");

    for (const dbPath of Object.values(this.paths)) {
      for (const suffix of ["-journal", "-wal", "-shm"]) {
        try {
          await unlink(dbPath + suffix);
          log.i("MULTIDB", "stale_lock_removed", { file: dbPath + suffix });
        } catch {
          // File doesn't exist - OK
        }
      }
    }
  }
}
