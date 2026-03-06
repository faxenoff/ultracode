/**
 * AutoDoc Tool Handlers
 *
 * Handlers for automatic documentation generation and management.
 * AutoDoc is enabled only when .autodoc folder exists in project root.
 *
 * Handlers:
 * - autodoc_init
 * - autodoc_save
 * - autodoc_get
 * - autodoc_search
 * - autodoc_validate
 * - autodoc_status
 * - autodoc_sync
 * - autodoc_generate
 * - autodoc_changelog
 * - autodoc_install_hooks
 * - autodoc_detect_language
 */

import { join } from "node:path";
import type { z } from "zod";
import { executeGenerateDocs } from "../../autodoc/generator/generate-handler-utils.js";
import type { AutoDocManager } from "../../autodoc/storage/autodoc-manager.js";
import type { DocEntity } from "../../autodoc/types.js";
import type { ServiceContainer } from "../../core/service-container.js";
import { log } from "../../logging/index.js";
import type { SimilarityResult } from "../../types/semantic.js";
import { toError } from "../../utils/error-handling.js";
import { BaseToolHandler, type ToolResult } from "../base-tool-handler.js";
import {
  AutoDocChangelogSchema,
  AutoDocDetectLanguageSchema,
  AutoDocGenerateSchema,
  AutoDocGetSchema,
  AutoDocInitSchema,
  AutoDocInstallHooksSchema,
  AutoDocSaveSchema,
  AutoDocSearchSchema,
  AutoDocStatusSchema,
  AutoDocSyncSchema,
  AutoDocValidateSchema,
} from "../schemas/autodoc-schemas.js";

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

/**
 * Saved document returned by AutoDocManager
 */
interface SavedDocument {
  id: string;
  title: string;
  content: string;
  filePath: string;
  section: string | null;
  type: string;
  confidence?: number;
}

/**
 * Validation result for document references
 */
// @ts-expect-error - Type used for documentation purposes
interface ValidationResult {
  total: number;
  valid: number;
  broken: BrokenReference[];
}

/**
 * Broken reference details
 */
interface BrokenReference {
  ref: {
    sourceLocation: {
      filePath: string;
      line?: number;
    };
    targetId: string;
  };
}

/**
 * Outdated document info
 */
interface OutdatedDoc {
  docId: string;
  filePath: string;
  confidence: number;
}

/**
 * Changelog entry
 */
interface ChangelogEntry {
  id: string;
  timestamp: number;
  branch?: string;
  summary?: string;
  changes?: unknown[];
  impactedDocs?: string[];
}

/**
 * AutoDoc status summary
 */
// @ts-expect-error - Type used for documentation purposes
interface AutoDocStatus {
  documents: number;
  references: number;
  brokenRefs: number;
  outdatedDocs: number;
}

/**
 * File sync result (bidirectional)
 */
interface FileSyncResult {
  diskToDb: {
    added: string[];
    updated: string[];
    errors: Array<{ path: string; error: string }>;
  };
  dbToDisk: {
    written: string[];
    errors: Array<{ path: string; error: string }>;
  };
}

/**
 * Debug info for embedding generation
 */
interface DebugInfo {
  savedDocsCount: number;
  step?: string;
  hasAgent?: boolean;
  agentType?: string;
  hasStore?: boolean;
  hasGetVectorStoreFn?: string;
  agentAndStoreOk?: boolean;
  skipped?: boolean;
  reason?: string;
  error?: string;
  stack?: string | undefined;
}

/**
 * Tool handler context interface
 */
interface ToolHandlerContext {
  normalizeInputPath: (path?: string) => string | null | undefined;
  requestId?: string;
  getServiceContainer?: () => ServiceContainer | undefined;
  getSemanticAgent?: () => Promise<unknown>;
  getGraphStorage: () => Promise<unknown>;
}

/**
 * Validation result for tool response
 */
interface ValidationResultResponse {
  success: boolean;
  total: number;
  valid: number;
  broken: number;
  brokenInFile?: BrokenReference[];
  brokenRefs?: BrokenReference[];
}

// =============================================================================
// HELPER: Check if AutoDoc is available
// =============================================================================

async function getAutoDocManagerFromContext(context: ToolHandlerContext): Promise<AutoDocManager | null> {
  const container = context.getServiceContainer?.();
  if (!container) {
    return null;
  }
  const adm = await container.getAutoDocManager();
  if (adm && !adm.isInitialized()) {
    // Initialize AutoDoc manager (creates tables if needed)
    const graphStorage = await container.getGraphStorage?.();
    await adm.initialize(graphStorage);
  }
  return adm;
}

function autodocNotEnabledResult(): ToolResult {
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify({
          success: false,
          error: "AutoDoc not enabled. Create .autodoc folder in project root to enable.",
        }),
      },
    ],
  };
}

// =============================================================================
// AUTODOC INIT
// =============================================================================

export class AutoDocInitToolHandler extends BaseToolHandler<z.infer<typeof AutoDocInitSchema>> {
  protected parseArgs(args: unknown) {
    return AutoDocInitSchema.parse(args);
  }

  protected async execute(args: z.infer<typeof AutoDocInitSchema>): Promise<ToolResult> {
    const container = this.context.getServiceContainer?.() as ServiceContainer | undefined;
    if (!container) {
      return autodocNotEnabledResult();
    }

    const adm = await container.getAutoDocManager();
    if (!adm) {
      return autodocNotEnabledResult();
    }

    adm.setConfig({
      enabled: args.enabled,
      language: args.language,
      docsDir: args.docsDir || join(container.directory, ".memory_bank"),
    });

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              success: true,
              message: "AutoDoc initialized",
              config: adm.getConfig(),
            },
            null,
            2,
          ),
        },
      ],
    };
  }
}

// =============================================================================
// AUTODOC SAVE
// =============================================================================

export class AutoDocSaveToolHandler extends BaseToolHandler<z.infer<typeof AutoDocSaveSchema>> {
  protected parseArgs(args: unknown) {
    return AutoDocSaveSchema.parse(args);
  }

  protected async execute(args: z.infer<typeof AutoDocSaveSchema>): Promise<ToolResult> {
    const adm = await getAutoDocManagerFromContext(this.context as ToolHandlerContext);
    if (!adm) {
      return autodocNotEnabledResult();
    }

    const normalizedPath = this.context.normalizeInputPath(args.filePath) || args.filePath;
    // Type assertion needed due to conflicting type definitions between schema and AutoDocManager
    const saveOptions: Parameters<AutoDocManager["saveDocument"]>[2] = {
      type: args.type as never,
      autoGenerated: args.autoGenerated,
    };
    const savedDocs = await adm.saveDocument(normalizedPath, args.content, saveOptions);

    // Write file to disk (bidirectional sync: DB → Disk)
    let fileWritten = false;
    try {
      const { writeDocumentToDisk } = await import("../../autodoc/sync/file-sync.js");
      await writeDocumentToDisk(normalizedPath, args.content);
      fileWritten = true;
    } catch (error: unknown) {
      const err = toError(error);
      log.w("AUTODOCTOOL", "file_write_failed", { error: err.message, path: normalizedPath, stack: err.stack });
    }

    // Generate embeddings for semantic search (if SemanticAgent available)
    let embeddingsGenerated = 0;
    const debugInfo: DebugInfo = { savedDocsCount: savedDocs.length };

    if (savedDocs.length > 0) {
      try {
        log.i("AUTODOCTOOL", "embeddings_start", { docsCount: savedDocs.length });
        debugInfo.step = "getSemanticAgent";
        const semanticAgent = await this.context.getSemanticAgent();
        debugInfo.hasAgent = !!semanticAgent;
        debugInfo.agentType = typeof semanticAgent;
        log.i("AUTODOCTOOL", "embeddings_agent", { hasAgent: !!semanticAgent, agentType: typeof semanticAgent });

        // Get VectorStore directly from SemanticAgent (more reliable)
        debugInfo.step = "getVectorStore";
        const vectorStore = (semanticAgent as { getVectorStore?: () => unknown })?.getVectorStore?.();
        debugInfo.hasStore = !!vectorStore;
        debugInfo.hasGetVectorStoreFn = typeof (semanticAgent as { getVectorStore?: unknown })?.getVectorStore;
        log.i("AUTODOCTOOL", "embeddings_store", {
          hasStore: !!vectorStore,
          storeType: typeof vectorStore,
          hasGetVectorStore: typeof (semanticAgent as { getVectorStore?: unknown })?.getVectorStore,
        });

        if (semanticAgent && vectorStore) {
          debugInfo.step = "processing";
          debugInfo.agentAndStoreOk = true;
          log.i("AUTODOCTOOL", "embeddings_processing", { count: savedDocs.length });

          // Get existing IDs to check for duplicates
          const docIds = savedDocs.map((d: SavedDocument) => d.id);
          const existingIds = await (
            vectorStore as { getExistingIds: (ids: string[]) => Promise<Set<string>> }
          ).getExistingIds(docIds);
          log.i("AUTODOCTOOL", "embeddings_existing_check", { total: docIds.length, existing: existingIds.size });

          for (const doc of savedDocs) {
            const textToEmbed = `${doc.title}\n\n${doc.content}`;
            const embedding = await (
              semanticAgent as { generateEmbedding: (text: string) => Promise<Float32Array | null> }
            ).generateEmbedding(textToEmbed);

            if (embedding) {
              const exists = existingIds.has(doc.id);
              log.i("AUTODOCTOOL", exists ? "updating_embedding" : "inserting_embedding", {
                id: doc.id,
                vectorDim: embedding.length,
                contentLen: textToEmbed.length,
              });

              const metadata = {
                type: "autodoc",
                docType: doc.type,
                filePath: doc.filePath,
                section: doc.section,
                title: doc.title,
              };

              if (exists) {
                // Update existing embedding to avoid duplicates
                await (
                  vectorStore as { update: (id: string, vector: Float32Array, metadata: unknown) => Promise<void> }
                ).update(doc.id, embedding, metadata);
              } else {
                // Insert new embedding
                await (
                  vectorStore as {
                    insert: (data: {
                      id: string;
                      content: string;
                      vector: Float32Array;
                      metadata: unknown;
                      createdAt: number;
                    }) => Promise<void>;
                  }
                ).insert({
                  id: doc.id,
                  content: textToEmbed.slice(0, 1000),
                  vector: embedding,
                  metadata,
                  createdAt: Date.now(),
                });
              }

              embeddingsGenerated++;
              log.d("AUTODOCTOOL", "embedding_saved", { id: doc.id, operation: exists ? "update" : "insert" });
            }
          }
          log.i("AUTODOCTOOL", "embeddings_done", { generated: embeddingsGenerated });

          // Flush and save embeddings to disk
          if (embeddingsGenerated > 0) {
            log.i("AUTODOCTOOL", "flushing_embeddings");
            await (vectorStore as { flushAndSave: () => Promise<void> }).flushAndSave();
            log.i("AUTODOCTOOL", "embeddings_flushed");
          }
        } else {
          debugInfo.skipped = true;
          debugInfo.reason = `agent=${!!semanticAgent}, store=${!!vectorStore}`;
          log.w("AUTODOCTOOL", "embeddings_skipped", { hasAgent: !!semanticAgent, hasStore: !!vectorStore });
        }
      } catch (error: unknown) {
        const err = toError(error);
        debugInfo.error = err.message;
        debugInfo.stack = err.stack;
        log.e("AUTODOCTOOL", "embedding_failed", { error: err.message, stack: err.stack });
      }
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              success: true,
              message: `Saved ${savedDocs.length} sections`,
              fileWritten,
              embeddingsGenerated,
              debug: debugInfo,
              docs: savedDocs.map((d: SavedDocument) => ({
                id: d.id,
                title: d.title,
                section: d.section,
              })),
            },
            null,
            2,
          ),
        },
      ],
    };
  }
}

// =============================================================================
// AUTODOC GET
// =============================================================================

export class AutoDocGetToolHandler extends BaseToolHandler<z.infer<typeof AutoDocGetSchema>> {
  protected parseArgs(args: unknown) {
    return AutoDocGetSchema.parse(args);
  }

  protected async execute(args: z.infer<typeof AutoDocGetSchema>): Promise<ToolResult> {
    const adm = await getAutoDocManagerFromContext(this.context as ToolHandlerContext);
    if (!adm) {
      return autodocNotEnabledResult();
    }

    if (args.docId) {
      const doc = await adm.getDocument(args.docId);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: !!doc,
                doc: doc || null,
              },
              null,
              2,
            ),
          },
        ],
      };
    }

    if (args.filePath) {
      const normalizedPath = this.context.normalizeInputPath(args.filePath) || args.filePath;
      const docs = await adm.getDocumentsByFile(normalizedPath);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: true,
                count: docs.length,
                docs,
              },
              null,
              2,
            ),
          },
        ],
      };
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ success: false, error: "Provide docId or filePath" }, null, 2),
        },
      ],
    };
  }
}

// =============================================================================
// AUTODOC SEARCH
// =============================================================================

export class AutoDocSearchToolHandler extends BaseToolHandler<z.infer<typeof AutoDocSearchSchema>> {
  protected parseArgs(args: unknown) {
    return AutoDocSearchSchema.parse(args);
  }

  protected async execute(args: z.infer<typeof AutoDocSearchSchema>): Promise<ToolResult> {
    const adm = await getAutoDocManagerFromContext(this.context as ToolHandlerContext);
    if (!adm) {
      return autodocNotEnabledResult();
    }

    interface SearchResult {
      id: string;
      title: string;
      filePath: string;
      section: string | null;
      snippet: string;
      score?: number;
      source: "text" | "semantic";
    }

    const searchResults: SearchResult[] = [];

    // Text search
    if (args.mode === "text" || args.mode === "hybrid") {
      const textResults = await adm.searchDocsByText(args.query, args.limit);
      for (const d of textResults) {
        searchResults.push({
          id: d.id,
          title: d.title,
          filePath: d.filePath,
          section: d.section,
          snippet: d.content.slice(0, 200),
          source: "text",
        });
      }
    }

    // Semantic search (if enabled and VectorStore available)
    if (args.mode === "semantic" || args.mode === "hybrid") {
      try {
        const semanticAgent = await this.context.getSemanticAgent();
        // Get VectorStore directly from SemanticAgent (more reliable)
        const vectorStore = (semanticAgent as { getVectorStore?: () => unknown })?.getVectorStore?.();

        if (semanticAgent && vectorStore) {
          const queryEmbedding = await (
            semanticAgent as { generateEmbedding: (text: string) => Promise<Float32Array | null> }
          ).generateEmbedding(args.query);
          log.i("AUTODOCTOOL", "search_embedding_generated", {
            hasEmbedding: !!queryEmbedding,
            dim: queryEmbedding?.length,
          });

          if (queryEmbedding) {
            // Use searchWithFilters to only search AutoDoc documents (metadata.type = "autodoc")
            const semanticResults: SimilarityResult[] = await (
              vectorStore as {
                searchWithFilters: (
                  vector: Float32Array,
                  options: { limit: number; metadataFilter: { type: string } },
                ) => Promise<SimilarityResult[]>;
              }
            ).searchWithFilters(queryEmbedding, {
              limit: args.limit,
              metadataFilter: { type: "autodoc" },
            });
            log.i("AUTODOCTOOL", "search_results", {
              count: semanticResults.length,
              ids: semanticResults.map((r) => r.id).slice(0, 5),
            });

            for (const result of semanticResults) {
              log.d("AUTODOCTOOL", "search_result_check", {
                id: result.id,
                startsWithDoc: result.id.startsWith("doc::"),
              });
              if (result.id.startsWith("doc::")) {
                const doc = await adm.getDocument(result.id);
                if (doc && !searchResults.some((r) => r.id === doc.id)) {
                  searchResults.push({
                    id: doc.id,
                    title: doc.title,
                    filePath: doc.filePath,
                    section: doc.section,
                    snippet: doc.content.slice(0, 200),
                    score: result.similarity,
                    source: "semantic",
                  });
                }
              }
            }
          }
        }
      } catch (error: unknown) {
        const err = toError(error);
        log.w("AUTODOCTOOL", "semantic_search_err", { error: err.message, stack: err.stack });
      }
    }

    // Sort by score (semantic results first if hybrid)
    searchResults.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              success: true,
              query: args.query,
              mode: args.mode || "text",
              resultsCount: searchResults.length,
              results: searchResults.slice(0, args.limit),
            },
            null,
            2,
          ),
        },
      ],
    };
  }
}

// =============================================================================
// AUTODOC VALIDATE
// =============================================================================

export class AutoDocValidateToolHandler extends BaseToolHandler<z.infer<typeof AutoDocValidateSchema>> {
  protected parseArgs(args: unknown) {
    return AutoDocValidateSchema.parse(args);
  }

  protected async execute(args: z.infer<typeof AutoDocValidateSchema>): Promise<ToolResult> {
    const adm = await getAutoDocManagerFromContext(this.context as ToolHandlerContext);
    if (!adm) {
      return autodocNotEnabledResult();
    }

    const validation = await adm.validateReferences();

    const result: ValidationResultResponse = {
      success: true,
      total: validation.total,
      valid: validation.valid,
      broken: validation.broken.length,
    };

    if (args.filePath) {
      const normalizedPath = this.context.normalizeInputPath(args.filePath) || args.filePath;
      result.brokenInFile = validation.broken.filter(
        (b: BrokenReference) => b.ref.sourceLocation.filePath === normalizedPath,
      );
    } else {
      result.brokenRefs = validation.broken.slice(0, 20);
    }

    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  }
}

// =============================================================================
// AUTODOC STATUS
// =============================================================================

export class AutoDocStatusToolHandler extends BaseToolHandler<z.infer<typeof AutoDocStatusSchema>> {
  protected parseArgs(args: unknown) {
    return AutoDocStatusSchema.parse(args);
  }

  protected async execute(_args: z.infer<typeof AutoDocStatusSchema>): Promise<ToolResult> {
    const adm = await getAutoDocManagerFromContext(this.context as ToolHandlerContext);
    if (!adm) {
      return autodocNotEnabledResult();
    }

    const status = await adm.getStatus();

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              success: true,
              status,
            },
            null,
            2,
          ),
        },
      ],
    };
  }
}

// =============================================================================
// AUTODOC SYNC
// =============================================================================

export class AutoDocSyncToolHandler extends BaseToolHandler<z.infer<typeof AutoDocSyncSchema>> {
  protected parseArgs(args: unknown) {
    return AutoDocSyncSchema.parse(args);
  }

  protected async execute(args: z.infer<typeof AutoDocSyncSchema>): Promise<ToolResult> {
    const adm = await getAutoDocManagerFromContext(this.context as ToolHandlerContext);
    if (!adm) {
      return autodocNotEnabledResult();
    }

    const { syncBidirectional, syncDbToDisk, syncDiskToDb } = await import("../../autodoc/sync/file-sync.js");

    const syncResult: {
      validated: number;
      brokenRefs: number;
      outdatedDocs: number;
      markedOutdated: string[];
      fileSync?: FileSyncResult;
    } = {
      validated: 0,
      brokenRefs: 0,
      outdatedDocs: 0,
      markedOutdated: [],
    };

    // Bidirectional file sync (if docsDir provided)
    if (args.docsDir) {
      const normalizedDocsDir = this.context.normalizeInputPath(args.docsDir) || args.docsDir;

      // getDocumentsByFile already returns DocEntity[] - no mapping needed
      const getDocsAsEntities = async (fp: string): Promise<DocEntity[]> => {
        return adm.getDocumentsByFile(fp);
      };

      // getAllDocuments already returns DocEntity[] - no mapping needed
      const getAllDocsAsEntities = async (): Promise<DocEntity[]> => {
        return adm.getAllDocuments();
      };

      if (args.direction === "disk-to-db") {
        const diskToDb = await syncDiskToDb(
          normalizedDocsDir,
          getDocsAsEntities,
          async (fp: string, content: string) => {
            await adm.saveDocument(fp, content);
            return [];
          },
          8,
        );
        syncResult.fileSync = {
          diskToDb: {
            added: diskToDb.added,
            updated: diskToDb.updated,
            errors: diskToDb.errors.map((e) => ({ path: e.file, error: e.error })),
          },
          dbToDisk: { written: [], errors: [] },
        };
      } else if (args.direction === "db-to-disk") {
        const dbToDisk = await syncDbToDisk(getAllDocsAsEntities, 8);
        syncResult.fileSync = {
          diskToDb: { added: [], updated: [], errors: [] },
          dbToDisk: {
            written: dbToDisk.written,
            errors: dbToDisk.errors.map((e) => ({ path: e.file, error: e.error })),
          },
        };
      } else {
        const bidirectional = await syncBidirectional(
          normalizedDocsDir,
          getDocsAsEntities,
          getAllDocsAsEntities,
          async (fp: string, content: string) => {
            await adm.saveDocument(fp, content);
            return [];
          },
          8,
        );
        syncResult.fileSync = {
          diskToDb: {
            added: bidirectional.diskToDb.added,
            updated: bidirectional.diskToDb.updated,
            errors: bidirectional.diskToDb.errors.map((e) => ({ path: e.file, error: e.error })),
          },
          dbToDisk: {
            written: bidirectional.dbToDisk.written,
            errors: bidirectional.dbToDisk.errors.map((e) => ({ path: e.file, error: e.error })),
          },
        };
      }
    }

    // Validate all references
    const validation = await adm.validateReferences();
    syncResult.validated = validation.total;
    syncResult.brokenRefs = validation.broken.length;

    // Get and report outdated docs
    const outdated = await adm.getOutdatedDocs();
    syncResult.outdatedDocs = outdated.length;

    // If scope is "file", only process that file
    if (args.scope === "file" && args.filePath) {
      const normalizedPath = this.context.normalizeInputPath(args.filePath) || args.filePath;
      const fileDocs = await adm.getDocumentsByFile(normalizedPath);
      for (const doc of fileDocs) {
        if (doc.confidence && doc.confidence < 0.7) {
          syncResult.markedOutdated.push(doc.id);
        }
      }
    } else {
      syncResult.markedOutdated = outdated.map((o: OutdatedDoc) => o.docId);
    }

    // Build result message
    const fileSyncMsg = syncResult.fileSync
      ? ` Files: ${syncResult.fileSync.diskToDb.added.length} added, ${syncResult.fileSync.diskToDb.updated.length} updated, ${syncResult.fileSync.dbToDisk.written.length} written.`
      : "";

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              success: true,
              message: `Sync completed. ${syncResult.brokenRefs} broken refs, ${syncResult.outdatedDocs} outdated docs.${fileSyncMsg}`,
              ...syncResult,
            },
            null,
            2,
          ),
        },
      ],
    };
  }
}

// =============================================================================
// AUTODOC GENERATE
// =============================================================================

export class AutoDocGenerateToolHandler extends BaseToolHandler<z.infer<typeof AutoDocGenerateSchema>> {
  protected parseArgs(args: unknown) {
    return AutoDocGenerateSchema.parse(args);
  }

  protected async execute(args: z.infer<typeof AutoDocGenerateSchema>): Promise<ToolResult> {
    const container = this.context.getServiceContainer?.() as ServiceContainer | undefined;
    if (!container) {
      return autodocNotEnabledResult();
    }

    // Auto-detect LLM if not explicitly specified
    let useLlm = args.useLlm;
    if (useLlm === undefined) {
      try {
        const { detectLLMProviders } = await import("../../autodoc/llm/llm-provider.js");
        const { recommended } = await detectLLMProviders();
        useLlm = !!recommended;
      } catch {
        useLlm = false;
      }
    }

    const result = await executeGenerateDocs(
      {
        rootDir: args.rootDir,
        autodocDir: args.autodocDir,
        exclude: args.exclude,
        maxDepth: args.maxDepth,
        module: args.module,
        useLlm,
        preview: args.preview,
        incremental: args.incremental,
        language: args.language,
      },
      {
        normalizeInputPath: this.context.normalizeInputPath,
        requestId: this.context.requestId,
        getAutoDocManager: container.getAutoDocManager.bind(container),
      } as Parameters<typeof executeGenerateDocs>[1],
    );

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  }
}

// =============================================================================
// AUTODOC CHANGELOG
// =============================================================================

export class AutoDocChangelogToolHandler extends BaseToolHandler<z.infer<typeof AutoDocChangelogSchema>> {
  protected parseArgs(args: unknown) {
    return AutoDocChangelogSchema.parse(args);
  }

  protected async execute(args: z.infer<typeof AutoDocChangelogSchema>): Promise<ToolResult> {
    const adm = await getAutoDocManagerFromContext(this.context as ToolHandlerContext);
    if (!adm) {
      return autodocNotEnabledResult();
    }

    const changelog = await adm.getChangelog({
      since: args.since,
      limit: args.limit,
      branch: args.branch,
    });

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              success: true,
              entriesCount: changelog.length,
              entries: changelog.map((entry: ChangelogEntry) => ({
                id: entry.id,
                timestamp: entry.timestamp,
                date: new Date(entry.timestamp).toISOString(),
                branch: entry.branch,
                summary: entry.summary,
                changesCount: entry.changes?.length || 0,
                impactedDocsCount: entry.impactedDocs?.length || 0,
              })),
            },
            null,
            2,
          ),
        },
      ],
    };
  }
}

// =============================================================================
// AUTODOC INSTALL HOOKS
// =============================================================================

export class AutoDocInstallHooksToolHandler extends BaseToolHandler<z.infer<typeof AutoDocInstallHooksSchema>> {
  protected parseArgs(args: unknown) {
    return AutoDocInstallHooksSchema.parse(args);
  }

  protected async execute(args: z.infer<typeof AutoDocInstallHooksSchema>): Promise<ToolResult> {
    const container = this.context.getServiceContainer?.() as ServiceContainer | undefined;
    if (!container) {
      return {
        content: [{ type: "text", text: JSON.stringify({ error: "ServiceContainer not available" }) }],
      };
    }

    const { installPreCommitHook, uninstallHooks, getHookStatus } = await import(
      "../../autodoc/hooks/hook-installer.js"
    );

    const projectPath = container.directory;

    if (args.action === "status") {
      const status = await getHookStatus(projectPath);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: true,
                gitRepo: status.gitRepo,
                hooksDir: status.hooksDir,
                preCommitInstalled: status.preCommit,
              },
              null,
              2,
            ),
          },
        ],
      };
    }

    if (args.action === "uninstall") {
      const result = await uninstallHooks(projectPath);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: result.success,
                removed: result.installed,
                skipped: result.skipped,
                errors: result.errors,
              },
              null,
              2,
            ),
          },
        ],
      };
    }

    // Default: install
    const result = await installPreCommitHook(projectPath);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              success: result.success,
              installed: result.installed,
              skipped: result.skipped,
              errors: result.errors,
            },
            null,
            2,
          ),
        },
      ],
    };
  }
}

// =============================================================================
// AUTODOC DETECT LANGUAGE
// =============================================================================

export class AutoDocDetectLanguageToolHandler extends BaseToolHandler<z.infer<typeof AutoDocDetectLanguageSchema>> {
  protected parseArgs(args: unknown) {
    return AutoDocDetectLanguageSchema.parse(args);
  }

  protected async execute(args: z.infer<typeof AutoDocDetectLanguageSchema>): Promise<ToolResult> {
    const { detectLanguageFromText, aggregateLanguageDetection } = await import(
      "../../autodoc/i18n/language-detector.js"
    );

    type DetectionResult = ReturnType<typeof detectLanguageFromText>;
    const results: DetectionResult[] = [];

    // Analyze code comments
    if (args.scope === "comments" || args.scope === "all") {
      const graphStorage = await this.context.getGraphStorage();
      const allEntities = await (
        graphStorage as { getAllEntities: () => Promise<Array<{ metadata?: Record<string, unknown> }>> }
      ).getAllEntities();
      const entities = allEntities.slice(0, args.sampleSize * 2);

      let analyzed = 0;
      for (const entity of entities) {
        if (analyzed >= args.sampleSize) break;

        // Check metadata.comments (tree-sitter parsers) OR documentation field (Roslyn C# parser)
        const commentsSource =
          entity.metadata?.["comments"] || (entity as unknown as { documentation?: string }).documentation;

        if (commentsSource) {
          const commentsText = Array.isArray(commentsSource) ? commentsSource.join("\n") : String(commentsSource);
          const result = detectLanguageFromText(commentsText);
          if (result.confidence > 0) {
            results.push(result);
            analyzed++;
          }
        }
      }
    }

    // Analyze existing docs
    if (args.scope === "docs" || args.scope === "all") {
      const adm = await getAutoDocManagerFromContext(this.context as ToolHandlerContext);
      if (adm) {
        const allDocs = await adm.searchDocsByText("", args.sampleSize);

        for (const doc of allDocs) {
          const result = detectLanguageFromText(doc.content);
          if (result.confidence > 0) {
            results.push(result);
          }
        }
      }
    }

    // Aggregate results
    const aggregated = aggregateLanguageDetection(results);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              success: true,
              detectedLanguage: aggregated.language,
              confidence: Math.round(aggregated.confidence * 100) / 100,
              samplesAnalyzed: results.length,
              charCounts: aggregated.charCounts,
              recommendation:
                aggregated.confidence > 0.5
                  ? `Use language: ${aggregated.language}`
                  : "Low confidence - defaulting to 'en'",
            },
            null,
            2,
          ),
        },
      ],
    };
  }
}
