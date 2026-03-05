/**
 * Auto-Indexer Module
 *
 * Handles automatic project detection and indexing.
 * Extracted from index.ts for better modularity.
 */

import { log } from "../logging/index.js";
import type { Agent, AgentTask } from "../types/agent.js";
import { AgentType } from "../types/agent.js";
import { createRequestId } from "../utils/logger.js";
import { setIndexingState } from "./indexing-state.js";
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
  } | null;
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
    const { glob } = await import("glob");

    // Build glob pattern for all supported extensions
    // e.g., **/*.{ts,tsx,js,jsx,py,go,rs,kt,swift,c,cpp,java}
    const extList = extensions.map((e) => e.replace(/^\./, "")).join(",");
    const pattern = `**/*.{${extList}}`;

    // Use glob with limit 1 for fast detection
    const files = await glob(pattern, {
      cwd: targetDir,
      nodir: true,
      ignore: ["**/node_modules/**", "**/dist/**", "**/.git/**", "**/vendor/**", "**/target/**", "**/__pycache__/**"],
      maxDepth: 5, // Don't go too deep for quick detection
      absolute: false,
    });

    if (files.length > 0) {
      const sampleFile = files[0]!;
      const ext = "." + sampleFile.split(".").pop();
      return { supported: true, detectedExt: ext, sampleFile };
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
    const { glob } = await import("glob");
    const extList = extensions.map((e) => e.replace(/^\./, "")).join(",");
    const pattern = `**/*.{${extList}}`;

    const files = await glob(pattern, {
      cwd: targetDir,
      nodir: true,
      ignore: BASE_EXCLUDE_PATTERNS,
      stat: false,
      absolute: false,
    });

    return files.length;
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
  incremental?: boolean;
  reset?: boolean;
  extraExcludePatterns?: string[];
  fullScan?: boolean; // Reserved for future use
}

/**
 * Result returned by performAutoIndex
 */
export interface AutoIndexResult {
  success: boolean;
  entityCount: number;
  duration: number; // ms
  embeddingStats?: { generated: number; skipped: number };
  embeddingPerformance?: {
    totalEmbeddings: number;
    durationSeconds: number;
    embeddingsPerSecond: number;
    workersUsed: number;
  };
  oversizedWarning?: { aiMessage: string | null; oversizedCount: number; maxTokens: number };
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
    // Optional reset: clear storage before indexing
    if (opts.reset) {
      const graphStorage = await ctx.getGraphStorage();
      graphStorage.setProject(targetDir);
      await graphStorage.clear();
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
        if (embStats && embStats.total > 0) {
          log.i("EMBEDDING", "emb_summary", {
            total: embStats.total,
            dur: `${(embStats.durationMs / 1000).toFixed(1)}s`,
            speed: `${embStats.speedPerSec}/s`,
            workers: embStats.workers,
            batches: embStats.batches,
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
      // MCP response returns immediately — tools are already usable
      const postIndexCtx = ctx;
      const postIndexDir = targetDir;
      const postIndexIncremental = incremental;
      const postIndexEntityCount = resultEntityCount;
      const postIndexStart = startTime;
      void (async () => {
        // 1. Finalize embeddings (flush FAISS to disk)
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

        // 2. Update incremental tracking
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

        // 3. Start FileWatcher/GitWatcher for incremental updates
        try {
          const cond = postIndexCtx.getConductor();
          const devAgent = cond.getAgentByType(AgentType.DEV) as
            | { getIndexerAgent?: () => AgentWithRepositoryPath | null }
            | undefined;
          const indexerAgent = devAgent?.getIndexerAgent?.() ?? undefined;
          if (indexerAgent?.setRepositoryPath) {
            await indexerAgent.setRepositoryPath(postIndexDir);
            log.i("INDEXER", "watcher_started", { dir: postIndexDir });
          } else {
            log.w("INDEXER", "watcher_skip", {
              reason: !devAgent ? "no DevAgent" : !indexerAgent ? "no IndexerAgent" : "no setRepositoryPath",
            });
          }
        } catch (error) {
          log.w("INDEXER", "watcher_fail", { err: (error as Error).message });
        }

        // 4. Flush LibSQL storage to disk
        try {
          const graphStorage = await postIndexCtx.getGraphStorage();
          await graphStorage.flush();
          log.d("INDEXER", "storage_flushed");
        } catch (error) {
          log.w("INDEXER", "storage_flush_fail", { err: (error as Error).message });
        }

        // 5. Publish index:completed event (triggers PMI, AutoDoc, etc.)
        knowledgeBus.publish(
          "index:completed",
          {
            directory: postIndexDir,
            incremental: postIndexIncremental,
            entityCount: postIndexEntityCount,
            duration: Date.now() - postIndexStart,
          },
          "auto-indexer",
        );
        log.d("INDEXER", "post_index_bg_done", { elapsed: Date.now() - postIndexStart });
      })();
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
