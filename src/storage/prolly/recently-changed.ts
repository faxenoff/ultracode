/**
 * Recently Changed Entities — Shared Prolly Tree Utility
 *
 * Extracts recently changed entity IDs from Prolly Tree commit history.
 * Used by semantic_search, pattern_search, analyze_code_impact, and tracing tools
 * to narrow results to recently modified code.
 */

import { log } from "../../logging/index.js";
import type { LibSQLGraphAdapter } from "../libsql-graph-adapter.js";
import { TimeTravelManager } from "./time-travel.js";
import type { GraphCommit } from "./types.js";

export interface RecentChangeFilter {
  /** Take last N commits */
  lastCommits?: number | undefined;
  /** Commits since this Unix timestamp (epoch ms) */
  sinceTimestamp?: number | undefined;
}

export interface RecentChangeResult {
  /** added ∪ modified */
  changedIds: Set<string>;
  addedIds: Set<string>;
  modifiedIds: Set<string>;
  deletedIds: Set<string>;
  commitsAnalyzed: number;
  timeMs: number;
}

/**
 * Get entity IDs that were recently changed (added/modified/deleted)
 * according to Prolly Tree commit history.
 *
 * Returns null if Prolly Tree is unavailable or insufficient commits exist.
 */
export async function getRecentlyChangedEntities(
  adapter: LibSQLGraphAdapter,
  filter: RecentChangeFilter,
): Promise<RecentChangeResult | null> {
  const start = performance.now();

  const commitManager = adapter.getCommitManager?.();
  const nodeStore = adapter.getProllyNodeStore?.();

  if (!commitManager || !nodeStore) {
    log.d("RECENT_CHANGES", "prolly_not_available", { reason: "missing components" });
    return null;
  }

  // Get commits based on filter
  let commits: GraphCommit[];
  if (filter.sinceTimestamp !== undefined) {
    commits = await commitManager.getCommitsSince(filter.sinceTimestamp);
  } else {
    const count = filter.lastCommits ?? 10;
    commits = await commitManager.getHistory(count + 1);
  }

  if (commits.length < 2) {
    log.d("RECENT_CHANGES", "insufficient_commits", { count: commits.length });
    return null;
  }

  const changedIds = new Set<string>();
  const addedIds = new Set<string>();
  const modifiedIds = new Set<string>();
  const deletedIds = new Set<string>();
  const timeTravel = new TimeTravelManager(nodeStore, commitManager);

  // Diff each pair of adjacent commits
  for (let i = 0; i < commits.length - 1; i++) {
    const current = commits[i];
    const parent = commits[i + 1];
    if (!current || !parent) continue;

    try {
      const diff = await timeTravel.diffCommits(parent.commitHash, current.commitHash);
      if (!diff) continue;

      for (const entry of diff.treeDiff.added) {
        addedIds.add(entry.key);
        changedIds.add(entry.key);
      }
      for (const entry of diff.treeDiff.modified) {
        modifiedIds.add(entry.key);
        changedIds.add(entry.key);
      }
      for (const entry of diff.treeDiff.deleted) {
        deletedIds.add(entry.key);
      }
    } catch (error) {
      log.w("RECENT_CHANGES", "diff_failed", { error: (error as Error).message });
    }
  }

  const timeMs = performance.now() - start;
  log.d("RECENT_CHANGES", "complete", {
    commits: commits.length,
    changed: changedIds.size,
    added: addedIds.size,
    modified: modifiedIds.size,
    deleted: deletedIds.size,
    timeMs: Math.round(timeMs),
  });

  return {
    changedIds,
    addedIds,
    modifiedIds,
    deletedIds,
    commitsAnalyzed: commits.length - 1,
    timeMs,
  };
}
