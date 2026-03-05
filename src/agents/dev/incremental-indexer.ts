/**
 * Incremental Indexer - Module for incremental indexing of changed files
 *
 * Simplifies handleIncrementalReindex (224 lines, complexity 31)
 * into understandable modular functions.
 *
 * @see src/agents/dev-agent.ts - original handleIncrementalReindex function
 */

import { extname } from "node:path";
import type { EmbeddingConfigResolved } from "../../config/yaml-config.js";
import { log } from "../../logging/index.js";
import { toError } from "../../utils/error-handling.js";
import type { IndexerAgent } from "../indexer-agent.js";
import type { ParserAgent } from "../parser-agent.js";
import type { ProviderKind } from "../semantic/provider-config.js";

// =============================================================================
// TYPES
// =============================================================================

/**
 * File separation result
 */
export interface FileSeparationResult {
  supportedFiles: string[];
  otherFiles: string[];
}

/**
 * File processing result
 */
export interface ProcessingResult {
  successCount: number;
  errorCount: number;
  elapsedMs: number;
}

/**
 * Supported extensions for full parsing
 */
const SUPPORTED_EXTENSIONS = [
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".py",
  ".go",
  ".rs",
  ".java",
  ".kt",
  ".kts",
  ".cs",
  ".csx",
  ".c",
  ".cpp",
  ".cc",
  ".cxx",
  ".h",
  ".hpp",
  ".swift",
  ".tpl",
];

// =============================================================================
// FILE SEPARATION
// =============================================================================

/**
 * Separate files into supported (full parsing) and others (heuristic)
 *
 * @param files - List of files to process
 * @returns Separated files
 */
export function separateFilesBySupport(files: string[]): FileSeparationResult {
  const supportedFiles: string[] = [];
  const otherFiles: string[] = [];

  for (const file of files) {
    const ext = extname(file).toLowerCase();
    if (SUPPORTED_EXTENSIONS.includes(ext)) {
      supportedFiles.push(file);
    } else {
      otherFiles.push(file);
    }
  }

  log.i("DEVAGENT", "reindex_breakdown", {
    supported: supportedFiles.length,
    heuristic: otherFiles.length,
    supportedSample: supportedFiles.slice(0, 3).map((f) => {
      const parts = f.split(/[\\/]/);
      return parts[parts.length - 1];
    }),
  });

  return {
    supportedFiles,
    otherFiles,
  };
}

// =============================================================================
// EMBEDDING CONFIGURATION
// =============================================================================

/**
 * Context for embedding configuration
 */
export interface EmbeddingSetupContext {
  parserAgent: ParserAgent;
  currentDir: string;
}

/**
 * Configure vector provider for incremental indexing
 *
 * @param context - Context with parser agent and directory
 * @returns true if successfully configured
 */
export async function setupVectorProvider(context: EmbeddingSetupContext): Promise<boolean> {
  try {
    const { ConfigLoader } = await import("../../config/yaml-config.js");
    const { getProjectHash, getCurrentGitBranchOrDefault } = await import("../../shared/storage-paths.js");

    const configLoader = ConfigLoader.getInstance();
    const embConfig = configLoader.getEmbeddingConfig();
    const useLayeredIndex = embConfig.useLayeredIndex;

    const projectHash = getProjectHash(context.currentDir);
    const currentBranch = getCurrentGitBranchOrDefault(context.currentDir);

    if (useLayeredIndex) {
      const { getLayeredFaissProvider } = await import("../../semantic/faiss/layered-faiss-provider.js");
      const provider = getLayeredFaissProvider();

      // Check initialization
      if (!provider.initialized) {
        await provider.initialize(context.currentDir, projectHash, currentBranch);
      }

      context.parserAgent.setVectorProvider(provider);
      log.i("DEVAGENT", "incr_vector_provider", {
        branch: currentBranch,
        layered: true,
      });
    } else {
      const { initializeFaissProvider } = await import("../../semantic/faiss/faiss-provider.js");
      const provider = await initializeFaissProvider();

      if (provider) {
        await provider.setProjectContext(projectHash, currentBranch);
        context.parserAgent.setVectorProvider(provider);
        log.i("DEVAGENT", "incr_vector_provider", {
          branch: currentBranch,
          layered: false,
        });
      }
    }

    return true;
  } catch (error: unknown) {
    const err = toError(error);
    log.w("DEVAGENT", "incr_vector_provider_fail", {
      error: err.message,
      stack: err.stack,
    });
    return false;
  }
}

/**
 * Configure EmbeddingGenerator for centralized mode
 *
 * @param parserAgent - Parser agent to configure
 * @param embeddingConfig - Embedding configuration
 * @returns true if successfully configured
 */
export async function setupEmbeddingGenerator(
  parserAgent: ParserAgent,
  embeddingConfig: EmbeddingConfigResolved,
): Promise<boolean> {
  if (!embeddingConfig.enabled) {
    return false;
  }

  try {
    const { EmbeddingGenerator } = await import("../../semantic/embedding-generator.js");
    const { buildEmbeddingGeneratorOptions } = await import("../semantic/provider-config.js");
    const { loadSemanticConfig } = await import("../../utils/config-paths.js");
    const { getConfig } = await import("../../config/yaml-config.js");

    const semanticConfig = loadSemanticConfig();
    const yamlConfig = getConfig();

    // Get batch size from provider-specific config or use default
    const batchSize = embeddingConfig.openai?.maxBatchSize || embeddingConfig.cloudru?.maxBatchSize || 32; // Default batch size

    const generatorOptions = buildEmbeddingGeneratorOptions(
      embeddingConfig.provider as ProviderKind,
      embeddingConfig.model,
      batchSize,
      semanticConfig,
      yamlConfig,
    );

    const embeddingGenerator = new EmbeddingGenerator(generatorOptions);
    await embeddingGenerator.initialize();

    await parserAgent.setEmbeddingGenerator(embeddingGenerator);

    log.i("DEVAGENT", "incr_embedding_generator", {
      provider: embeddingConfig.provider,
      model: embeddingConfig.model,
    });

    return true;
  } catch (error: unknown) {
    const err = toError(error);
    log.w("DEVAGENT", "incr_embedding_generator_fail", {
      error: err.message,
      stack: err.stack,
    });
    return false;
  }
}

// =============================================================================
// PROCESSING
// =============================================================================

/**
 * Process supported files through parser
 *
 * @param files - List of files
 * @param parserAgent - Parser agent
 * @param indexerAgent - Indexer agent
 * @returns Success and error counts
 */
export async function processSupportedFiles(
  files: string[],
  parserAgent: ParserAgent,
  indexerAgent: IndexerAgent,
): Promise<{ successCount: number; errorCount: number }> {
  let successCount = 0;
  let errorCount = 0;

  if (files.length === 0) {
    return { successCount, errorCount };
  }

  try {
    log.i("DEVAGENT", "incr_parseBatch_start", { files: files.length });
    const parseResults = await parserAgent.parseBatch(files, {});
    log.i("DEVAGENT", "incr_parseBatch_done", {
      files: files.length,
      results: parseResults.length,
    });

    for (const parseResult of parseResults) {
      if (parseResult.entities && parseResult.entities.length > 0) {
        try {
          indexerAgent.queueForIndexing(parseResult.entities, parseResult.filePath, parseResult.relationships);
          successCount++;
        } catch (error: unknown) {
          const err = toError(error);
          log.e("DEVAGENT", "index_fail", {
            file: parseResult.filePath,
            err: err.message,
            stack: err.stack,
          });
          errorCount++;
        }
      }
    }

    // Flush all accumulated entities/relationships in one batch DB operation
    await indexerAgent.flushPendingBatch();
  } catch (error: unknown) {
    const err = toError(error);
    log.e("DEVAGENT", "batch_parse_fail", {
      files: files.length,
      err: err.message,
      stack: err.stack,
    });
    errorCount += files.length;
  }

  return { successCount, errorCount };
}

/**
 * Process unsupported files through heuristic parser
 *
 * @param files - List of files
 * @param indexerAgent - Indexer agent
 * @returns Success and error counts
 */
export async function processHeuristicFiles(
  files: string[],
  indexerAgent: IndexerAgent,
): Promise<{ successCount: number; errorCount: number }> {
  let successCount = 0;
  let errorCount = 0;

  const { createHeuristicEntities } = await import("./heuristic-parser.js");

  for (const filePath of files) {
    try {
      const heuristicResult = createHeuristicEntities(filePath);
      if (heuristicResult.entities.length > 0) {
        indexerAgent.queueForIndexing(heuristicResult.entities, filePath, heuristicResult.relationships);
        successCount++;
      }
    } catch (error: unknown) {
      const err = toError(error);
      log.e("DEVAGENT", "heuristic_fail", {
        file: filePath,
        err: err.message,
        stack: err.stack,
      });
      errorCount++;
    }
  }

  // Flush all accumulated heuristic entities in one batch
  await indexerAgent.flushPendingBatch();

  return { successCount, errorCount };
}

// =============================================================================
// FLUSH EMBEDDINGS
// =============================================================================

/**
 * Flush pending embeddings to FAISS index
 *
 * @param parserAgent - Parser agent with accumulator
 * @returns true if successful
 */
export async function flushPendingEmbeddings(parserAgent: ParserAgent): Promise<boolean> {
  const accumulator = parserAgent.getAccumulator();
  if (!accumulator) {
    return false;
  }

  const pendingCount = accumulator.getPendingCount();
  if (pendingCount === 0) {
    return true;
  }

  log.i("DEVAGENT", "Flushing incremental embeddings to FAISS", {
    pending: pendingCount,
  });

  try {
    const flushed = await accumulator.flush();
    log.i("DEVAGENT", "Incremental embeddings flushed", { flushed });

    // Save index to disk
    await saveIndexToDisk();

    return true;
  } catch (error: unknown) {
    const err = toError(error);
    log.e("DEVAGENT", "Failed to flush incremental embeddings", {
      error: err.message,
      stack: err.stack,
    });
    return false;
  }
}

/**
 * Save FAISS index to disk
 */
async function saveIndexToDisk(): Promise<void> {
  try {
    const { ConfigLoader } = await import("../../config/yaml-config.js");
    const configLoader = ConfigLoader.getInstance();
    const embConfig = configLoader.getEmbeddingConfig();
    const useLayeredIndex = embConfig.useLayeredIndex;

    if (useLayeredIndex) {
      const { getLayeredFaissProvider } = await import("../../semantic/faiss/layered-faiss-provider.js");
      const provider = getLayeredFaissProvider();

      if (provider.initialized) {
        await provider.save();
        log.i("DEVAGENT", "Saved layered FAISS index after incremental");
      }
    }
  } catch (error: unknown) {
    const err = toError(error);
    log.w("DEVAGENT", "Failed to save FAISS index after incremental", {
      error: err.message,
      stack: err.stack,
    });
  }
}
