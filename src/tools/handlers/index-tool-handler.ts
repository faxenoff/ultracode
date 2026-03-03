/**
 * Index Tool Handler
 *
 * Thin wrapper around performAutoIndex() from auto-indexer.
 * All indexing logic is unified in auto-indexer.ts to avoid duplication.
 */

import { z } from "zod";
import { type AutoIndexResult, performAutoIndex } from "../../core/auto-indexer.js";
import { getIndexingStatus, isIndexing } from "../../core/indexing-state.js";
import { log } from "../../logging/index.js";
import { BaseToolHandler, type ToolResult } from "../base-tool-handler.js";

const DEFAULT_EXTENSIONS = [
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".py",
  ".go",
  ".rs",
  ".kt",
  ".swift",
  ".c",
  ".cpp",
  ".java",
  ".cs",
];

/**
 * Index tool response structure
 */
interface IndexToolResponse {
  success: boolean;
  message: string;
  entityCount: number;
  durationMs: number;
  embeddings?: {
    generated: number;
    skipped: number;
  };
  embeddingPerformance?: {
    totalEmbeddings: number;
    durationSeconds: number;
    embeddingsPerSecond: number;
    workersUsed: number;
  };
  warning?: string;
  oversizedEntities?: {
    count: number;
    maxTokens: number;
  };
}

const IndexToolSchema = z.object({
  directory: z.string().optional(),
  incremental: z.boolean().optional().default(false),
  reset: z.boolean().optional().default(false),
  excludePatterns: z.array(z.string()).optional().default([]),
  fullScan: z.boolean().optional().default(false),
});

type IndexToolArgs = z.infer<typeof IndexToolSchema>;

export class IndexToolHandler extends BaseToolHandler<IndexToolArgs> {
  protected parseArgs(args: unknown): IndexToolArgs {
    return IndexToolSchema.parse(args);
  }

  protected async execute(args: IndexToolArgs): Promise<ToolResult> {
    const targetDir = this.resolveProjectPath(args);

    // Guard: prevent concurrent indexing
    if (isIndexing()) {
      const status = getIndexingStatus();
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: false,
                error: "Indexing already in progress",
                currentDirectory: status.directory,
                elapsedSeconds: status.elapsedSeconds,
                message: "Please wait for the current indexing operation to complete",
              },
              null,
              2,
            ),
          },
        ],
      };
    }

    // performAutoIndex manages setIndexingState internally (set+clear in try/finally)
    const ctx = this.context.createAutoIndexContext!();
    const extensions = this.getExtensions();

    const result = await performAutoIndex(targetDir, extensions, ctx, {
      incremental: args.incremental,
      reset: args.reset,
      extraExcludePatterns: args.excludePatterns?.length ? args.excludePatterns : undefined,
      fullScan: args.fullScan,
    });

    return this.formatResult(result);
  }

  private getExtensions(): string[] {
    const cfg = this.context.config as { indexing?: { autoIndexExtensions?: string[] } };
    return cfg.indexing?.autoIndexExtensions ?? DEFAULT_EXTENSIONS;
  }

  private formatResult(result: AutoIndexResult): ToolResult {
    const response: IndexToolResponse = {
      success: result.success,
      message: result.success ? "Indexing completed" : "Indexing completed with warnings",
      entityCount: result.entityCount,
      durationMs: result.duration,
    };

    if (result.embeddingStats) {
      response.embeddings = result.embeddingStats;
    }

    if (result.embeddingPerformance) {
      response.embeddingPerformance = result.embeddingPerformance;
    }

    if (result.oversizedWarning?.aiMessage) {
      response.warning = result.oversizedWarning.aiMessage;
      response.oversizedEntities = {
        count: result.oversizedWarning.oversizedCount,
        maxTokens: result.oversizedWarning.maxTokens,
      };
    }

    log.i("INDEXTOOL", "index_complete", {
      dir: "via_auto_indexer",
      entities: result.entityCount,
      durMs: result.duration,
    });

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(response, null, 2),
        },
      ],
    };
  }
}
