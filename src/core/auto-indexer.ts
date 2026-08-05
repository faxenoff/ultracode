/**
 * Auto-Indexer Module
 *
 * Handles automatic project detection and indexing.
 * Extracted from index.ts for better modularity.
 */

import { glob } from "node:fs/promises";
import { log } from "../logging/index.js";
import { getMainRepoPath } from "../shared/git-worktree.js";
import type { Agent, AgentTask } from "../types/agent.js";
import { AgentType } from "../types/agent.js";
import { createRequestId } from "../utils/logger.js";
import { setIndexingState, setPostIndexingPromise } from "./indexing-state.js";
import { knowledgeBus } from "./knowledge-bus.js";

/**
 * Task processing result structure
 */
interface TaskProcessingResult {
  success?: boolean;
  entitiesExtracted?: number;
  filesProcessed?: number;
  data?: {
    entityCount?: number;
    entities?: unknown[];
  };
  entities?: unknown[];
}

/**
 * Agent with embedding stats (DevAgent)
 */
interface AgentWithEmbeddingStats extends Agent {
  getEmbeddingStats?: () => {
    total: number;
    durationMs: number;
    speedPerSec: number;
    workers: number;
    batches: number;
    avgMsPerEmb?: number | undefined;
    maxBatchMs?: number | undefined;
    cacheHits?: number | undefined;
  } | null;
  getTeiBatchLog?: () => Array<{ n: number; ms: number }>;
}

/**
 * Agent with repository path setter (IndexerAgent)
 */
interface AgentWithRepositoryPath extends Agent {
  setRepositoryPath?: (path: string) => Promise<void>;
}

/**
 * Base exclude patterns for source file counting and indexing
 * Used by both countSourceFiles and buildAutoIndexExcludePatterns for consistency
 */
export const BASE_EXCLUDE_PATTERNS = [
  // Build/dependency directories
  "**/node_modules/**",
  "**/.git/**",
  "**/dist/**",
  "**/build/**",
  "**/out/**",
  "**/.next/**",
  "**/.nuxt/**",
  "**/coverage/**",
  "**/__pycache__/**",
  "**/.pytest_cache/**",
  "**/venv/**",
  "**/.venv/**",
  "**/vendor/**",
  "**/target/**", // Rust
  "**/bin/**",
  "**/obj/**", // .NET
  "**/.vs/**",
  "**/.idea/**",
  "**/.vscode/**",
  "**/packages/**",
  // Test data directories (not actual source code)
  "**/fixtures/**",
  "**/testdata/**",
  // Mock files
  "**/mocks/**",
  "**/__mocks__/**",
  // External/third-party
  "**/external-tools/**",
  "**/third_party/**",
  "**/third-party/**",
  "**/thirdparty/**",
  "**/archives/**",
  "**/archive/**",
  "**/backups/**",
  "**/backup/**",
  "**/tmp/**",
  "**/temp/**",
];

/**
 * Quickly detect if directory contains files with supported extensions.
 * Uses fast glob with early exit (limit: 1) for performance.
 */
export async function detectSupportedProject(
  targetDir: string,
  extensions: string[],
): Promise<{ supported: boolean; detectedExt?: string; sampleFile?: string }> {
  try {
    // Build glob pattern for all supported extensions
    // e.g., **/*.{ts,tsx,js,jsx,py,go,rs,kt,swift,c,cpp,java}
    const extList = extensions.map((e) => e.replace(/^\./, "")).join(",");
    // node:fs glob has no maxDepth, so the depth cap is spelled out as five
    // patterns — still "don't go too deep for quick detection".
    const patterns = Array.from({ length: 5 }, (_, depth) => `${"*/".repeat(depth)}*.{${extList}}`);

    // Stop at the first hit — this only answers "is anything here?"
    for await (const file of glob(patterns, {
      cwd: targetDir,
      exclude: ["**/node_modules/**", "**/dist/**", "**/.git/**", "**/vendor/**", "**/target/**", "**/__pycache__/**"],
    })) {
      const ext = "." + file.split(".").pop();
      return { supported: true, detectedExt: ext, sampleFile: file };
    }

    return { supported: false };
  } catch (error) {
    log.w("AUTOINDEX", "detect_fail", { err: (error as Error).message });
    return { supported: false };
  }
}

/**
 * Fast count of source files on disk for consistency check.
 * Uses glob with stats disabled for maximum speed.
 */
export async function countSourceFiles(targetDir: string, extensions: string[]): Promise<number> {
  try {
    const extList = extensions.map((e) => e.replace(/^\./, "")).join(",");
    const pattern = `**/*.{${extList}}`;

    // No `nodir` equivalent here: node:fs offers withFileTypes, but Bun's
    // fs.glob rejects that option ("does not support options.withFileTypes
    // yet"), and this code runs on both. Stat-ing every hit would defeat the
    // point of a fast count, so directories named like a source file are
    // counted — the result feeds a consistency check, not an exact figure.
    let count = 0;
    for await (const _entry of glob(pattern, { cwd: targetDir, exclude: BASE_EXCLUDE_PATTERNS })) {
      count++;
    }

    return count;
  } catch {
    return -1; // Error - skip consistency check
  }
}

/**
 * Build smart exclude patterns for auto-indexing
 * - Base patterns from BASE_EXCLUDE_PATTERNS
 * - Patterns from .gitignore if exists
 * - Binary/archive extensions
 */
export async function buildAutoIndexExcludePatterns(targetDir: string): Promise<string[]> {
  const patterns: string[] = [
    // Include all base directory patterns
    ...BASE_EXCLUDE_PATTERNS,
    // Mock files (often large JSON/generated data)
    "**/*.mock.json",
    "**/*.mock.ts",
    "**/*.mock.js",
    // Binary and archive files
    "**/*.zip",
    "**/*.tar",
    "**/*.tar.gz",
    "**/*.tgz",
    "**/*.rar",
    "**/*.7z",
    "**/*.exe",
    "**/*.dll",
    "**/*.so",
    "**/*.dylib",
    "**/*.bin",
    "**/*.iso",
    "**/*.img",
    "**/*.dmg",
    "**/*.wasm",
    // Large generated files
    "**/*.min.js",
    "**/*.min.css",
    "**/*.bundle.js",
    "**/*.chunk.js",
    "**/package-lock.json",
    "**/yarn.lock",
    "**/pnpm-lock.yaml",
    "**/*.lock",
    // Media files
    "**/*.jpg",
    "**/*.jpeg",
    "**/*.png",
    "**/*.gif",
    "**/*.ico",
    "**/*.svg",
    "**/*.mp3",
    "**/*.mp4",
    "**/*.wav",
    "**/*.avi",
    "**/*.mov",
    "**/*.pdf",
    // Database files
    "**/*.db",
    "**/*.sqlite",
    "**/*.sqlite3",
  ];

  // Try to read .gitignore and add patterns
  try {
    const { join } = await import("node:path");
    const gitignorePath = join(targetDir, ".gitignore");
    const { readTextSync, existsSync } = await import("../utils/file-ops.js");

    if (existsSync(gitignorePath)) {
      const content = readTextSync(gitignorePath);
      const lines = content.split("\n");

      for (const line of lines) {
        const trimmed = line.trim();
        // Skip comments and empty lines
        if (!trimmed || trimmed.startsWith("#")) continue;
        // Skip negation patterns (we only want excludes)
        if (trimmed.startsWith("!")) continue;

        // Convert gitignore pattern to glob pattern
        let pattern = trimmed;
        // Handle directory patterns
        if (pattern.endsWith("/")) {
          pattern = `**/${pattern}**`;
        } else if (!pattern.includes("/")) {
          // Pattern without slash matches anywhere
          pattern = `**/${pattern}`;
        } else if (!pattern.startsWith("/") && !pattern.startsWith("**/")) {
          pattern = `**/${pattern}`;
        }
        // Remove leading slash
        if (pattern.startsWith("/")) {
          pattern = pattern.slice(1);
        }

        patterns.push(pattern);
      }
      log.d("AUTOINDEX", "gitignore_loaded", { cnt: lines.filter((l) => l.trim() && !l.startsWith("#")).length });
    }
  } catch (_error) {
    // .gitignore not found or unreadable - that's fine
  }

  return patterns;
}

/**
 * Options for performAutoIndex
 */
export interface AutoIndexOptions {
  incremental?: boolean | undefined;
  reset?: boolean | undefined;
  extraExcludePatterns?: string[] | undefined;
  fullScan?: boolean | undefined; // Reserved for future use
}

/**
 * Result returned by performAutoIndex
 */
export interface AutoIndexResult {
  success: boolean;
  entityCount: number;
  duration: number; // ms
  embeddingStats?: { generated: number; skipped: number } | undefined;
  embeddingPerformance?:
    | {
        totalEmbeddings: number;
        durationSeconds: number;
        embeddingsPerSecond: number;
        workersUsed: number;
      }
    | undefined;
  oversizedWarning?: { aiMessage: string | null; oversizedCount: number; maxTokens: number } | undefined;
}

/**
 * Context for performing auto-indexing
 * Allows dependency injection from index.ts
 */
export interface AutoIndexContext {
  getSemanticAgent: () => Promise<any>;
  getDevAgent: () => Promise<any>;
  getDoraAgent: () => Promise<any>;
  getConductor: () => any;
  getGraphStorage: () => Promise<any>;
  setCurrentIndexingDirectory: (dir: string) => void;
  processStartTime: number;
}

/**
 * Perform auto-indexing in background (non-blocking)
 * @param options - boolean for backward compat (= incremental), or AutoIndexOptions
 */
export async function performAutoIndex(
  targetDir: string,
  extensions: string[],
  ctx: AutoIndexContext,
  options?: boolean | AutoIndexOptions,
): Promise<AutoIndexResult> {
  // Normalize options: boolean → { incremental: boolean }
  const opts: AutoIndexOptions = typeof options === "boolean" ? { incremental: options } : (options ?? {});
  const incremental = opts.incremental ?? false;
  const requestId = createRequestId();
  const startTime = Date.now();
  log.t("INDEXER", "auto_index_start", { offset: startTime - ctx.processStartTime });

  // Set indexing state for user-friendly error messages
  setIndexingState(true, targetDir);

  const mode = incremental ? "incremental" : "full";
  log.i("INDEXER", "auto_index", { mode, dir: targetDir, req: requestId });

  // Collect result data
  let resultEntityCount = 0;
  let resultEmbeddingStats: AutoIndexResult["embeddingStats"] | undefined;
  let resultEmbeddingPerf: AutoIndexResult["embeddingPerformance"] | undefined;
  let resultOversizedWarning: AutoIndexResult["oversizedWarning"] | undefined;
  let resultSuccess = true;

  try {
    // Optional reset: clear storage and vectors before indexing
    if (opts.reset) {
      const graphStorage = await ctx.getGraphStorage();
      // Project context is set via ALS (callers must use runWithRequestContext)
      await graphStorage.clear();

      // Clear FAISS vectors + embedding cache (otherwise reset is incomplete)
      if (process.env["MCP_DEBUG_DISABLE_SEMANTIC"] !== "1") {
        try {
          const semanticAgent = await ctx.getSemanticAgent();
          await semanticAgent.clearAllVectors();
          log.d("INDEXER", "vectors_cleared", { dir: targetDir });
        } catch (err) {
          log.w("INDEXER", "vectors_clear_fail", { err: (err as Error).message });
        }
      }

      log.d("INDEXER", "storage_cleared", { dir: targetDir });
    }

    // Build smart exclude patterns
    const excludePatterns = await buildAutoIndexExcludePatterns(targetDir);

    // Merge extra exclude patterns from caller
    if (opts.extraExcludePatterns?.length) {
      excludePatterns.push(...opts.extraExcludePatterns);
    }

    log.d("INDEXER", "exclude_patterns", { cnt: excludePatterns.length, exts: extensions.join(",") });

    // Set current indexing directory
    ctx.setCurrentIndexingDirectory(targetDir);

    // Initialize SemanticAgent and optionally drop vector index for bulk insert mode
    // Only drop index for FULL rebuild, not for incremental updates
    if (process.env["MCP_DEBUG_DISABLE_SEMANTIC"] !== "1") {
      log.t("INDEXER", "semantic_init_start", {});
      try {
        const semAgentStart = Date.now();
        const semanticAgent = await ctx.getSemanticAgent();
        log.t("INDEXER", "semantic_init_done", { dur: Date.now() - semAgentStart });
        if (!incremental) {
          // Drop vector index before bulk inserts for faster performance (full rebuild only)
          log.t("INDEXER", "drop_index_start", {});
          await semanticAgent.dropVectorIndex();
          log.t("INDEXER", "drop_index_done", {});
        } else {
          log.d("INDEXER", "keep_index", { reason: "incremental" });
        }
      } catch (err) {
        log.w("INDEXER", "semantic_init_fail", { err: (err as Error).message });
      }
    }

    // Create indexing task with smart excludes
    const task: AgentTask = {
      id: `auto-index-${Date.now()}`,
      type: "index",
      priority: 8,
      payload: {
        directory: targetDir,
        incremental, // Use incremental mode when resuming incomplete index
        excludePatterns,
        // Pass extensions to limit file types
        includeExtensions: extensions,
      },
      createdAt: Date.now(),
    };

    // Initialize agents
    const devAgent = await ctx.getDevAgent();
    await ctx.getDoraAgent();

    // Run indexing via DevAgent (not Conductor - it doesn't delegate tasks)
    const result = (await devAgent.process(task)) as TaskProcessingResult;

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);

    if (result?.success !== false) {
      const entityCount = result?.entitiesExtracted ?? result?.data?.entityCount ?? result?.data?.entities ?? 0;
      resultEntityCount = typeof entityCount === "number" ? entityCount : parseInt(String(entityCount), 10) || 0;
      log.i("INDEXER", "auto_index_done", { entities: resultEntityCount, dur: Date.now() - startTime, req: requestId });

      // Collect embedding stats synchronously (needed for MCP response)
      try {
        const devAgentWithStats = devAgent as AgentWithEmbeddingStats | undefined;
        const embStats = devAgentWithStats?.getEmbeddingStats?.();
        // Per-batch TEI timing: compact "ms,ms,ms..." + batch sizes if varied
        const batchLog = devAgentWithStats?.getTeiBatchLog?.() ?? [];
        if (batchLog.length > 0) {
          const msValues = batchLog.map((b) => b.ms).join(",");
          const sizes = new Set(batchLog.map((b) => b.n));
          const sizeStr = sizes.size === 1 ? `${[...sizes][0]}` : batchLog.map((b) => b.n).join(",");
          log.i("EMBEDDING", "tei_batches", { cnt: batchLog.length, bsz: sizeStr, ms: msValues });
        }
        if (embStats && embStats.total > 0) {
          log.i("EMBEDDING", "emb_summary", {
            total: embStats.total,
            dur: `${(embStats.durationMs / 1000).toFixed(1)}s`,
            speed: `${embStats.speedPerSec}/s`,
            workers: embStats.workers,
            batches: embStats.batches,
            avgms: embStats.avgMsPerEmb,
            maxbatchms: embStats.maxBatchMs,
            cachehits: embStats.cacheHits,
          });
          resultEmbeddingPerf = {
            totalEmbeddings: embStats.total,
            durationSeconds: Math.round((embStats.durationMs / 1000) * 10) / 10,
            embeddingsPerSecond: embStats.speedPerSec,
            workersUsed: embStats.workers,
          };
        }
      } catch {
        // Non-critical
      }
      log.flush();

      // Collect oversized warning synchronously (needed for MCP response)
      if (process.env["MCP_DEBUG_DISABLE_SEMANTIC"] !== "1") {
        try {
          const semanticAgent = await ctx.getSemanticAgent();
          const warning = semanticAgent.getLastOversizedWarning?.();
          if (warning?.hasWarning) {
            resultOversizedWarning = {
              aiMessage: warning.aiMessage,
              oversizedCount: warning.oversizedCount,
              maxTokens: warning.maxTokens,
            };
          }
        } catch {
          // Non-critical
        }
      }

      // Fire-and-forget: all post-indexing work runs in background
      // MCP response returns immediately — but heavy tools (detect_patterns etc.)
      // will automatically await this promise before running via waitForPostIndexing()
      const postIndexCtx = ctx;
      const postIndexDir = targetDir;
      const postIndexIncremental = incremental;
      const postIndexEntityCount = resultEntityCount;
      const postIndexStart = startTime;
      const bgPromise = (async () => {
        // OPTIMIZATION: Run FAISS save in parallel with watcher/tracking/PMI.
        // FAISS save (~5s) is I/O-bound and independent from graph operations.
        // Watcher + PMI don't need FAISS to be persisted — they work with in-memory data.

        // 1. FAISS save — fire-and-forget, runs in parallel with everything below
        const faissSavePromise = (async () => {
          if (process.env["MCP_DEBUG_DISABLE_SEMANTIC"] !== "1") {
            try {
              const semanticAgent = await postIndexCtx.getSemanticAgent();
              const embResult = await semanticAgent.generateEmbeddingsFromStorage();
              if (embResult) {
                log.i("INDEXER", "embed_finalize_bg", { generated: embResult.generated, skipped: embResult.skipped });
              }
            } catch (error) {
              log.w("INDEXER", "embed_finalize_fail", { err: (error as Error).message });
            }
          }
        })();

        // 2-3. Tracking + Watcher — run in parallel (independent of each other and FAISS)
        await Promise.all([
          // 2. Update incremental tracking
          (async () => {
            try {
              const graphStorage = await postIndexCtx.getGraphStorage();
              if (postIndexIncremental) {
                const estimatedFiles = Math.max(1, Math.ceil(postIndexEntityCount / 3));
                await graphStorage.recordIncrementalChanges(estimatedFiles);
                log.i("INDEXER", "tracking_recorded", { files: estimatedFiles });
              } else {
                await graphStorage.resetIncrementalTracking();
                log.i("INDEXER", "tracking_reset", { reason: "full_rebuild" });
              }
            } catch (error) {
              log.w("INDEXER", "tracking_fail", { err: (error as Error).message });
            }
          })(),
          // 3. Start FileWatcher/GitWatcher for incremental updates
          (async () => {
            try {
              const cond = postIndexCtx.getConductor();
              const devAgent = cond.getAgentByType(AgentType.DEV) as
                | { getIndexerAgent?: () => AgentWithRepositoryPath | null }
                | undefined;
              const indexerAgent = devAgent?.getIndexerAgent?.() ?? undefined;
              if (indexerAgent?.setRepositoryPath) {
                // Use Git root, not the indexed subdirectory — watcher must cover the whole repo
                const watcherDir = getMainRepoPath(postIndexDir) ?? postIndexDir;
                await indexerAgent.setRepositoryPath(watcherDir);
                log.i("INDEXER", "watcher_started", { dir: watcherDir, indexedDir: postIndexDir });
              } else {
                log.w("INDEXER", "watcher_skip", {
                  reason: !devAgent ? "no DevAgent" : !indexerAgent ? "no IndexerAgent" : "no setRepositoryPath",
                });
              }
            } catch (error) {
              log.w("INDEXER", "watcher_fail", { err: (error as Error).message });
            }
          })(),
        ]);

        // 4. Flush LibSQL storage to disk (after tracking is updated)
        try {
          const graphStorage = await postIndexCtx.getGraphStorage();
          await graphStorage.flush();
          log.d("INDEXER", "storage_flushed");
        } catch (error) {
          log.w("INDEXER", "storage_flush_fail", { err: (error as Error).message });
        }

        // 4.5. Build trigram index for grep_index tool
        try {
          await buildTrigramIndex(postIndexDir);
        } catch (error) {
          log.w("INDEXER", "trigram_build_fail", { err: (error as Error).message });
        }

        // 5. Publish index:completed and AWAIT all subscribers (PMI, AutoDoc, etc.)
        // This ensures heavy tools (detect_patterns) don't start while subscribers are busy
        await knowledgeBus.publishAsync(
          "index:completed",
          {
            directory: postIndexDir,
            incremental: postIndexIncremental,
            entityCount: postIndexEntityCount,
            duration: Date.now() - postIndexStart,
          },
          "auto-indexer",
        );
        log.i("INDEXER", "post_index_bg_done", { elapsed: Date.now() - postIndexStart });

        // 6. Await FAISS save completion (don't orphan the promise)
        await faissSavePromise;

        // 7. Force full GC to reclaim indexing garbage (AST nodes, embedding vectors,
        // intermediate entity objects). Without this, detect_patterns in the same session
        // crashes with JSC GC segfault (SlotVisitor::drainFromShared) because the heap
        // is full of stale objects from indexing that haven't been collected yet.
        if (typeof globalThis["Bun"]?.["gc"] === "function") {
          globalThis["Bun"]["gc"](true); // true = full synchronous GC
          log.i("INDEXER", "post_index_gc", { msg: "forced full GC after indexing" });
        }

        log.i("INDEXER", "all_bg_done", { elapsed: Date.now() - postIndexStart });
        log.flush();
      })();
      // Register background promise so heavy tools can await it
      setPostIndexingPromise(targetDir, bgPromise);
    } else {
      resultSuccess = false;
      log.w("INDEXER", "auto_index_warn", { dur: duration, req: requestId });
    }
  } catch (error) {
    resultSuccess = false;
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    log.e("INDEXER", "auto_index_fail", { dur: duration, err: (error as Error).message, req: requestId });
  } finally {
    // Always clear indexing state
    setIndexingState(false);
  }

  return {
    success: resultSuccess,
    entityCount: resultEntityCount,
    duration: Date.now() - startTime,
    embeddingStats: resultEmbeddingStats,
    embeddingPerformance: resultEmbeddingPerf,
    oversizedWarning: resultOversizedWarning,
  };
}

// =============================================================================
// TRIGRAM INDEX BUILDER
// =============================================================================

/**
 * Build trigram index from all indexed files for grep_index tool.
 * Reads files from disk, extracts trigrams, writes binary index.
 */
async function buildTrigramIndex(projectDir: string): Promise<void> {
  const start = Date.now();
  const { TrigramBuilder } = await import("../search/trigram-index.js");
  const { extractTrigrams } = await import("../search/trigram-extract.js");
  const { getPerProjectMultiDbPaths, getProjectHash } = await import("../shared/storage-paths.js");
  const { readFileSync, mkdirSync, existsSync } = await import("node:fs");
  const { resolve } = await import("node:path");
  const fg = await import("fast-glob");

  const projectHash = getProjectHash(projectDir);
  const { baseDir } = getPerProjectMultiDbPaths(projectHash);
  const outputPath = resolve(baseDir, "trigrams.idx");

  // Scan source files (same extensions as parser supports)
  const patterns = [
    "**/*.{ts,tsx,js,jsx,mjs,cjs}",
    "**/*.{py,pyi}",
    "**/*.{cs,csx}",
    "**/*.{java,kt,kts}",
    "**/*.{go,rs,zig}",
    "**/*.{c,h,cpp,hpp,cc,hh,cxx,hxx}",
    "**/*.{swift}",
    "**/*.{sh,bash,zsh}",
    "**/*.{sql,graphql,gql}",
    "**/*.{json,yaml,yml,toml}",
  ];
  const ignore = [
    "**/node_modules/**",
    "**/dist/**",
    "**/build/**",
    "**/out/**",
    "**/.git/**",
    "**/vendor/**",
    "**/target/**",
    "**/__pycache__/**",
    "**/coverage/**",
    "**/.next/**",
    "**/.nuxt/**",
  ];

  const files = await fg.glob(patterns, { cwd: projectDir, ignore, absolute: true });

  // Normalize project dir to forward slashes for reliable path stripping (Windows compat)
  const normalizedDir = projectDir.replace(/\\/g, "/").replace(/\/$/, "");

  const builder = new TrigramBuilder();
  let indexed = 0;
  for (const filePath of files) {
    try {
      const content = readFileSync(filePath);
      if (content.length === 0 || content.length > 1_000_000) continue; // skip empty/huge
      const trigrams = extractTrigrams(content);
      if (trigrams.entries.length === 0) continue;
      // Use relative path for portability (fast-glob always returns forward slashes)
      const relPath = filePath.replace(normalizedDir + "/", "");
      builder.addFile(relPath, BigInt(content.length), trigrams);
      indexed++;
    } catch {
      // Skip unreadable files
    }
  }

  if (indexed > 0) {
    if (!existsSync(baseDir)) mkdirSync(baseDir, { recursive: true });
    builder.build(outputPath);
    log.i("INDEXER", "trigram_built", { files: indexed, path: outputPath, ms: Date.now() - start });
  }
}
