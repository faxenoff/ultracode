/**
 * Graph Cache — Module-level cache for Graphology graphs.
 *
 * Problem: TraceEngine is created fresh on every tool call, so the expensive
 * graph loading (~6.5s for 223K nodes) happens every time.
 *
 * Solution: Cache GraphologyPathBuilder instances per project. When trace tools
 * are used ≥2 times on a project, automatically preload the graph in background
 * after indexing completes (so the next trace call returns instantly).
 *
 * Usage count is persisted in project_metadata.trace_usage_count so it survives
 * server restarts. In-memory cache holds the count for fast access; DB is the
 * source of truth on cold start.
 */

import { log } from "../logging/index.js";
import { getLibSQLAdapter } from "../storage/graph-storage-factory.js";
import { runWithRequestContext } from "../storage/libsql/request-context.js";
import type { ProjectContext } from "../storage/libsql/types.js";
import type { GraphStorage } from "../types/storage.js";
import { GraphologyPathBuilder } from "./graphology-path-builder.js";

// Minimum trace calls before background preload is enabled
const PRELOAD_THRESHOLD = 2;

interface CachedGraph {
  builder: GraphologyPathBuilder;
  usageCount: number;
  /** Whether usageCount has been loaded from DB for this entry */
  dbLoaded: boolean;
}

const cache = new Map<string, CachedGraph>();

/**
 * Extract project key from storage's current context.
 */
function getProjectKey(storage: GraphStorage): string {
  const ctx = (storage as { getProjectContext?: () => ProjectContext }).getProjectContext?.();
  if (ctx) return `${ctx.projectHash}:${ctx.branchName}`;
  return "default";
}

/**
 * Extract ProjectContext from storage (needed for AsyncLocalStorage scoping).
 */
function extractContext(storage: GraphStorage): ProjectContext | undefined {
  return (storage as { getProjectContext?: () => ProjectContext }).getProjectContext?.();
}

/**
 * Load persisted trace usage count from DB into cache entry.
 * Called once per cache entry (on first access after cold start).
 */
async function loadUsageFromDb(entry: CachedGraph): Promise<void> {
  if (entry.dbLoaded) return;
  entry.dbLoaded = true;

  try {
    const adapter = getLibSQLAdapter();
    if (adapter) {
      const count = await adapter.getTraceUsageCount();
      entry.usageCount = count;
      log.d("GRAPHCACHE", "db_usage_loaded", { count });
    }
  } catch {
    // Non-critical — will start from 0
  }
}

/**
 * Persist trace usage count to DB (fire-and-forget).
 */
function persistUsageToDb(): void {
  try {
    const adapter = getLibSQLAdapter();
    if (adapter) {
      adapter.incrementTraceUsageCount().catch(() => {
        // Non-critical
      });
    }
  } catch {
    // Non-critical
  }
}

/**
 * Get or create a cached GraphologyPathBuilder for the current project.
 * On first access, loads persisted usage count from DB.
 */
export async function getCachedGraphBuilder(storage: GraphStorage): Promise<GraphologyPathBuilder> {
  const key = getProjectKey(storage);
  let entry = cache.get(key);

  if (!entry) {
    entry = {
      builder: new GraphologyPathBuilder(storage),
      usageCount: 0,
      dbLoaded: false,
    };
    cache.set(key, entry);
  }

  // Load persisted count on first access
  await loadUsageFromDb(entry);

  return entry.builder;
}

/**
 * Increment trace usage counter for the current project.
 * Updates both in-memory cache and DB (persisted).
 */
export function incrementTraceUsage(storage: GraphStorage): void {
  const key = getProjectKey(storage);
  const entry = cache.get(key);
  if (entry) {
    entry.usageCount++;
    log.d("GRAPHCACHE", "usage_inc", { key, count: entry.usageCount });
  }

  // Persist to DB
  persistUsageToDb();
}

/**
 * Get trace usage count for a project (from in-memory cache).
 */
export function getTraceUsageCount(storage: GraphStorage): number {
  const key = getProjectKey(storage);
  return cache.get(key)?.usageCount ?? 0;
}

/**
 * Invalidate cached graph after reindex and preload in background if usage ≥ threshold.
 *
 * The preload runs inside `runWithRequestContext` to ensure SQL queries
 * target the correct project DB, even if another MCP request changes the
 * shared storage context concurrently.
 */
export function invalidateAndPreload(storage: GraphStorage): void {
  const key = getProjectKey(storage);
  const entry = cache.get(key);

  // If no cache entry exists yet, try to create one and load usage from DB
  if (!entry) {
    const newEntry: CachedGraph = {
      builder: new GraphologyPathBuilder(storage),
      usageCount: 0,
      dbLoaded: false,
    };
    cache.set(key, newEntry);

    // Load usage count from DB, then decide on preload
    loadUsageFromDb(newEntry)
      .then(() => {
        doInvalidateAndPreload(key, newEntry, storage);
      })
      .catch(() => {
        // Non-critical
      });
    return;
  }

  doInvalidateAndPreload(key, entry, storage);
}

function doInvalidateAndPreload(key: string, entry: CachedGraph, storage: GraphStorage): void {
  const usageCount = entry.usageCount;

  // Clear the loaded graph (marks as stale)
  entry.builder.clear();

  if (usageCount >= PRELOAD_THRESHOLD) {
    const ctx = extractContext(storage);
    if (!ctx) return;

    log.i("GRAPHCACHE", "preload_start", { key, usageCount });

    // Background preload — fire and forget, scoped to correct project context
    runWithRequestContext(ctx, () => {
      entry.builder
        .loadGraph()
        .then((stats) => {
          log.i("GRAPHCACHE", "preload_done", {
            key,
            nodes: stats.nodes,
            edges: stats.edges,
            ms: +stats.loadTimeMs.toFixed(0),
          });
        })
        .catch((err) => {
          log.w("GRAPHCACHE", "preload_failed", { key, error: (err as Error).message });
        });
    });
  } else {
    log.d("GRAPHCACHE", "no_preload", { key, usageCount, threshold: PRELOAD_THRESHOLD });
  }
}

/**
 * Clear all cached graphs (e.g., on shutdown).
 */
export function clearAllGraphCaches(): void {
  for (const entry of cache.values()) {
    entry.builder.clear();
  }
  cache.clear();
}
