/**
 * Indexing Pipeline - Modular phases for DevAgent indexing
 *
 * Breaks the huge performRealIndexing function (876 lines, complexity 889)
 * into small understandable phases for improved readability and maintainability.
 *
 * @see src/agents/dev-agent.ts - original performRealIndexing function
 */

import { statSync } from "node:fs";
import { log } from "../../logging/index.js";
import { getGraphStorage } from "../../storage/graph-storage-factory.js";
import { toError } from "../../utils/error-handling.js";
import { collectFilesAsync } from "./file-collector.js";

// =============================================================================
// TYPES
// =============================================================================

/**
 * Indexing parameters
 */
export interface IndexingOptions {
  directory: string;
  excludePatterns?: string[];
  incremental?: boolean;
  agentId: string;
}

/**
 * Indexing context (passed between phases)
 */
export interface IndexingContext {
  directory: string;
  excludePatterns: string[];
  isIncremental: boolean;
  agentId: string;
  allFiles: string[];
  deletedEntityIds: string[];
}

/**
 * Change analysis result
 */
export interface ChangeAnalysis {
  changedFiles: string[];
  newFiles: string[];
  deletedFiles: string[];
  unchangedFiles: string[];
}

/**
 * Indexing result
 */
export interface IndexingResult {
  filesProcessed: number;
  entitiesExtracted: number;
  relationshipsCreated: number;
  totalFiles: number;
  deletedEntities?: number;
}

/**
 * Graph save result
 */
export interface SaveResult {
  entityCount: number;
  relationshipCount: number;
}

/**
 * Embedding generation result
 */
export interface EmbeddingResult {
  count: number;
  skipped: number;
}

// =============================================================================
// PHASE 1: INITIALIZATION
// =============================================================================

/**
 * Initialize and validate indexing parameters
 *
 * @param options - Indexing parameters
 * @returns Indexing context
 */
export async function initializeIndexing(options: IndexingOptions): Promise<IndexingContext> {
  const { directory, excludePatterns = [], incremental = false, agentId } = options;

  log.i("DEVAGENT", "Starting indexing", {
    directory,
    excludePatternsCount: excludePatterns.length,
    samplePatterns: excludePatterns.slice(0, 5),
  });

  // Collect files for indexing (async for Bun.Glob usage)
  const collectResult = await collectFilesAsync(directory, { excludePatterns, agentId });
  const allFiles = collectResult.files;

  log.i("DEVAGENT", "Files collected", { count: allFiles.length });

  return {
    directory,
    excludePatterns,
    isIncremental: incremental,
    agentId,
    allFiles,
    deletedEntityIds: [],
  };
}

// =============================================================================
// PHASE 2: CHANGE ANALYSIS (for incremental indexing)
// =============================================================================

/**
 * Detect changed, new, and deleted files
 *
 * @param context - Indexing context
 * @returns Change analysis or null if not incremental indexing
 */
export async function detectChangedFiles(context: IndexingContext): Promise<ChangeAnalysis | null> {
  if (!context.isIncremental || context.allFiles.length === 0) {
    return null;
  }

  const storage = await getGraphStorage();
  const indexedFiles = await storage.getAllIndexedFiles();

  if (indexedFiles.size === 0) {
    // No indexed files - this is the first indexing
    return {
      changedFiles: [],
      newFiles: context.allFiles,
      deletedFiles: [],
      unchangedFiles: [],
    };
  }

  const changedFiles: string[] = [];
  const newFiles: string[] = [];
  const unchangedFiles: string[] = [];

  // Find changed and new files
  for (const file of context.allFiles) {
    const normalizedPath = file.replace(/\\/g, "/");
    const lastIndexed = indexedFiles.get(normalizedPath);

    if (lastIndexed === undefined) {
      // New file
      newFiles.push(file);
    } else {
      // Check for modification
      try {
        const stats = statSync(file);
        const mtime = stats.mtimeMs;
        if (mtime > lastIndexed) {
          changedFiles.push(file);
        } else {
          unchangedFiles.push(file);
        }
      } catch {
        // Failed to get stats, skip
        unchangedFiles.push(file);
      }
    }
  }

  // Find deleted files (exist in index but not on disk)
  const currentFilesSet = new Set(context.allFiles.map((file) => file.replace(/\\/g, "/")));
  const deletedFiles: string[] = [];

  for (const [indexedPath] of indexedFiles) {
    if (!currentFilesSet.has(indexedPath)) {
      deletedFiles.push(indexedPath);
    }
  }

  log.i("DEVAGENT", "Smart incremental analysis", {
    total: context.allFiles.length,
    changed: changedFiles.length,
    new: newFiles.length,
    deleted: deletedFiles.length,
    unchanged: unchangedFiles.length,
  });

  return {
    changedFiles,
    newFiles,
    deletedFiles,
    unchangedFiles,
  };
}

// =============================================================================
// PHASE 3: CLEAN UP STALE ENTITIES
// =============================================================================

/**
 * Clean stale entities for deleted files only.
 * Changed files use copy-on-write (generation bump on INSERT) — no pre-delete needed.
 *
 * @param filesToClean - List of DELETED files to invalidate
 * @returns Array of deleted entity IDs (for FAISS cleanup)
 */
export async function cleanStaleEntities(filesToClean: string[]): Promise<string[]> {
  if (filesToClean.length === 0) {
    return [];
  }

  log.i("DEVAGENT", "Invalidating deleted files", {
    fileCount: filesToClean.length,
  });

  const storage = await getGraphStorage();
  const deletedEntityIds: string[] = [];

  for (const file of filesToClean) {
    try {
      const ids = await storage.deleteEntitiesByFilePath(file);
      deletedEntityIds.push(...ids);
      await storage.deleteFileInfo(file);
    } catch (error: unknown) {
      const err = toError(error);
      log.w("DEVAGENT", "Failed to invalidate file", {
        file,
        error: err.message,
        stack: err.stack,
      });
    }
  }

  log.i("DEVAGENT", "Files invalidated", {
    entityCount: deletedEntityIds.length,
  });

  return deletedEntityIds;
}

// =============================================================================
// PHASE 4: APPLY ANALYSIS RESULTS
// =============================================================================

/**
 * Apply change analysis results to the context
 * Updates the list of files to process and deletes stale entities
 *
 * @param context - Indexing context
 * @param analysis - Change analysis
 * @returns Updated context
 */
export async function applyChangeAnalysis(
  context: IndexingContext,
  analysis: ChangeAnalysis,
): Promise<IndexingContext> {
  // Delete entities for changed and deleted files
  const filesToClean = [...analysis.changedFiles, ...analysis.deletedFiles];
  const deletedEntityIds = await cleanStaleEntities(filesToClean);

  // Update file list for processing (only changed and new)
  const filesToProcess = [...analysis.changedFiles, ...analysis.newFiles];

  log.i("DEVAGENT", "Files to process after analysis", {
    toProcess: filesToProcess.length,
    entitiesDeleted: deletedEntityIds.length,
  });

  // If no files to process, return empty context
  if (filesToProcess.length === 0) {
    log.i("DEVAGENT", "No files changed, skipping indexing");
  }

  return {
    ...context,
    allFiles: filesToProcess,
    deletedEntityIds,
  };
}

// =============================================================================
// PHASE 5: FILE SEPARATION
// =============================================================================

/**
 * File separation result
 */
export interface FileSeparationResult {
  codeFiles: string[];
  dataFiles: string[];
}

/**
 * Separate files into code and data by extension
 *
 * @param files - List of files
 * @returns Separated files
 */
export function separateCodeAndDataFiles(files: string[]): FileSeparationResult {
  const codeFiles: string[] = [];
  const dataFiles: string[] = [];

  // Import from local module
  const { extname } = require("node:path");
  const { isCodeExtension } = require("./file-extensions.js");

  for (const file of files) {
    const ext = extname(file).toLowerCase();
    if (isCodeExtension(ext)) {
      codeFiles.push(file);
    } else {
      dataFiles.push(file);
    }
  }

  log.i("DEVAGENT", "Files separated", {
    codeFiles: codeFiles.length,
    dataFiles: dataFiles.length,
  });

  return {
    codeFiles,
    dataFiles,
  };
}

// =============================================================================
// PHASE 6: POST-INDEXING SWAGGER LINKING
// =============================================================================

/**
 * Post-indexing step: Link swagger specifications to code entities.
 * Should be called after all files are indexed.
 * Creates PRODUCES_API, CONSUMES_API, GENERATED_FROM relationships.
 *
 * @returns Number of swagger relationships created, or 0 if no swagger entities found
 */
export async function resolveSwaggerLinks(): Promise<number> {
  const storage = await getGraphStorage();

  // Check if any swagger entities exist in the graph
  const allEntities = await storage.getAllEntities();
  const hasSwagger = allEntities.some((e) => e.metadata?.["swaggerType"]);

  if (!hasSwagger) {
    return 0; // No swagger entities — zero overhead for non-swagger projects
  }

  log.i("DEVAGENT", "swagger_link_start", { totalEntities: allEntities.length });

  try {
    // Dynamically import to avoid loading swagger module for non-swagger projects
    const { analyzeSwaggerCodeLinks, buildSwaggerRelationships } = await import(
      "../../parsers/swagger/swagger-code-linker.js"
    );

    // Analyze swagger↔code links
    const analysis = analyzeSwaggerCodeLinks(allEntities);
    const totalLinks = analysis.producers.length + analysis.consumers.length + analysis.generatedTypes.length;

    if (totalLinks === 0) {
      log.i("DEVAGENT", "swagger_link_none");
      return 0;
    }

    // Build relationships
    const swaggerRelationships = buildSwaggerRelationships(analysis);

    // Store relationships in graph
    const { nanoid } = await import("nanoid");
    const relationships = swaggerRelationships.map((rel) => ({
      id: nanoid(12),
      fromId: `swagger:${rel.fromName}`,
      toId: `swagger:${rel.toName}`,
      type: rel.type,
      metadata: {
        ...rel.metadata,
        fromFile: rel.fromFile,
        toFile: rel.toFile,
      },
    }));

    // Try to resolve fromId/toId to actual entity IDs
    const entityByName = new Map<string, string>();
    for (const e of allEntities) {
      entityByName.set(e.name, e.id);
      // Also map with file path for disambiguation
      entityByName.set(`${e.filePath}:${e.name}`, e.id);
    }

    for (const rel of relationships) {
      // Try to resolve swagger: prefixed IDs to real entity IDs
      const fromName = rel.fromId.replace("swagger:", "");
      const toName = rel.toId.replace("swagger:", "");

      // Resolve with file path first, then by name
      const fromFile = rel.metadata?.fromFile as string | undefined;
      const toFile = rel.metadata?.toFile as string | undefined;

      if (fromFile) {
        const fileKey = `${fromFile}:${fromName}`;
        if (entityByName.has(fileKey)) {
          rel.fromId = entityByName.get(fileKey)!;
        }
      }
      if (!rel.fromId.startsWith("swagger:") === false && entityByName.has(fromName)) {
        rel.fromId = entityByName.get(fromName)!;
      }

      if (toFile) {
        const fileKey = `${toFile}:${toName}`;
        if (entityByName.has(fileKey)) {
          rel.toId = entityByName.get(fileKey)!;
        }
      }
      if (!rel.toId.startsWith("swagger:") === false && entityByName.has(toName)) {
        rel.toId = entityByName.get(toName)!;
      }
    }

    const result = await storage.insertRelationships(relationships);

    log.i("DEVAGENT", "swagger_link_done", {
      producers: analysis.producers.length,
      consumers: analysis.consumers.length,
      generatedTypes: analysis.generatedTypes.length,
      relationshipsCreated: result.processed,
      configs: analysis.codegenConfigs,
    });

    return result.processed;
  } catch (error) {
    log.w("DEVAGENT", "swagger_link_error", { error: (error as Error).message });
    return 0;
  }
}

// =============================================================================
// UTILITIES
// =============================================================================

/**
 * Check if incremental indexing is needed
 *
 * @param context - Indexing context
 * @returns true if incremental indexing is applicable
 */
export function shouldUseIncrementalMode(context: IndexingContext): boolean {
  return context.isIncremental && context.allFiles.length > 0;
}

/**
 * Build indexing result
 *
 * @param context - Indexing context
 * @param filesProcessed - Number of processed files
 * @param totalEntities - Number of extracted entities
 * @param totalRelationships - Number of created relationships
 * @returns Indexing result
 */
export function buildIndexingResult(
  context: IndexingContext,
  filesProcessed: number,
  totalEntities: number,
  totalRelationships: number,
): IndexingResult {
  return {
    filesProcessed,
    entitiesExtracted: totalEntities,
    relationshipsCreated: totalRelationships,
    totalFiles: context.allFiles.length,
    deletedEntities: context.deletedEntityIds.length,
  };
}
