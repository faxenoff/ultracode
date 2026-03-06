/**
 * Vector Store Manager - Faiss Backend
 *
 * v5: Faiss-only backend. All vector operations go through FaissProvider.
 * LibSQL is used only for graph data (entities, relationships), not embeddings.
 *
 * Benefits:
 * - Faiss runs in main process (faiss-napi works under both Node.js and Bun)
 * - HNSW index with automatic persistence
 * - Content cache persisted alongside Faiss index
 * - No DiskANN overhead or libSQL vector operations
 *
 * @history
 *  - 2025-09-14: Created - Initial vector store implementation
 *  - 2025-12-11: v4 - Unified storage with GraphStorage
 *  - 2026-01-01: v5 - Faiss-only backend, removed libSQL embeddings
 */

import { type Reference, RefTargetType } from "../autodoc/types.js";
import { log } from "../logging/index.js";
// =============================================================================
// 1. IMPORTS AND DEPENDENCIES
// =============================================================================
import { getProjectHash, normalizeBranchName } from "../shared/storage-paths.js";
import type { ProjectContext } from "../storage/libsql-graph-adapter.js";
import type { SimilarityResult, VectorEmbedding, VectorStoreConfig } from "../types/semantic.js";
import type { Entity } from "../types/storage.js";
import { type FaissProvider, initializeFaissProvider } from "./faiss/faiss-provider.js";
import { getLayeredFaissProvider, type LayeredFaissProvider } from "./faiss/layered-faiss-provider.js";
import { getRecommendedStrategy, type StrategyRecommendation } from "./gpu/adaptive-thresholds.js";

// =============================================================================
// 2. CONSTANTS AND CONFIGURATION
// =============================================================================
const DEFAULT_CONFIG: Partial<VectorStoreConfig> = {
  dimensions: 384,
};

// =============================================================================
// 3. UTILITY FUNCTIONS
// =============================================================================
function dedupeById(items: VectorEmbedding[]): VectorEmbedding[] {
  const map = new Map<string, VectorEmbedding>();
  for (const e of items) map.set(e.id, e);
  return Array.from(map.values());
}

// =============================================================================
// 4. CORE BUSINESS LOGIC
// =============================================================================
export class VectorStore {
  private readonly config: VectorStoreConfig;

  // v5: Faiss is the only backend for vector operations
  private faissProvider: FaissProvider | null = null;

  // v6: Optional layered provider for base + delta architecture
  private layeredProvider: LayeredFaissProvider | null = null;
  private useLayeredIndex: boolean;

  // Initialization state management
  private isInitialized = false;
  private isInitializing = false;
  private initializationPromise: Promise<void> | null = null;
  private debugMode = process.env["VECTOR_STORE_DEBUG"] === "true";

  // AutoDoc manager cache (avoid re-initialize on every search)
  private cachedAutoDocManager: Awaited<
    ReturnType<typeof import("../autodoc/storage/autodoc-manager.js")["getAutoDocManager"]>
  > | null = null;
  private autoDocInitialized = false;

  // Project context for multi-project support
  // MUST be set via setProjectContext() before any operations
  private currentContext: ProjectContext | null = null;
  private currentProjectPath: string | null = null;

  constructor(config: Partial<VectorStoreConfig> = {}) {
    this.useLayeredIndex = config.useLayeredIndex ?? false;
    log.d("VECTOR", this.useLayeredIndex ? "v6: Layered Faiss backend" : "v5: Faiss-only backend");

    this.config = {
      dbPath: config.dbPath || "",
      dimensions: config.dimensions || DEFAULT_CONFIG.dimensions!,
      workingDirectory: config.workingDirectory,
      libsql: config.libsql,
      useLayeredIndex: this.useLayeredIndex,
    };
  }

  /**
   * Set the current project context for all subsequent operations
   * v5: Async because FaissProvider may need to save/load indexes on context switch
   * v6: Also initializes/switches LayeredFaissProvider
   */
  async setProjectContext(context: ProjectContext): Promise<void> {
    // Reset AutoDoc cache on project switch
    if (this.currentContext && this.currentContext.projectHash !== context.projectHash) {
      this.autoDocInitialized = false;
      this.cachedAutoDocManager = null;
    }
    this.currentContext = context;

    if (this.useLayeredIndex && this.layeredProvider) {
      // v6.1: Layered provider - always call initialize() which handles project switching
      // Previously we only called switchBranch() when already initialized, missing project changes
      const projectPath = this.currentProjectPath || this.config.workingDirectory || "";
      const success = await this.layeredProvider.initialize(projectPath, context.projectHash, context.branchName);
      if (!success) {
        log.e("VECTOR", "Failed to initialize/switch LayeredFaissProvider on context set");
      }
    } else if (this.faissProvider) {
      // v5: Set context on FaissProvider (may switch indexes)
      await this.faissProvider.setProjectContext(context.projectHash, context.branchName);
    }

    log.d("VECTOR", "Context set", {
      project: context.projectHash,
      branch: context.branchName,
      layered: this.useLayeredIndex,
    });
  }

  /**
   * Set project context from path and branch
   * v5: Async because FaissProvider may need to save/load indexes on context switch
   */
  async setProject(projectPath: string, branchName: string): Promise<void> {
    this.currentProjectPath = projectPath;
    await this.setProjectContext({
      projectHash: getProjectHash(projectPath),
      branchName: normalizeBranchName(branchName),
    });
  }

  /**
   * Get current project context
   * Throws if context not set
   */
  getProjectContext(): ProjectContext {
    const ctx = this.ensureContextSet();
    return { ...ctx };
  }

  /**
   * Check if project context is set
   */
  hasProjectContext(): boolean {
    return this.currentContext !== null;
  }

  /**
   * Get the database path used by this VectorStore
   * v5: Returns Faiss index path
   */
  getDbPath(): string {
    return this.config.dbPath;
  }

  /**
   * Initialize the vector store
   * v5: Initializes FaissProvider directly
   */
  async initialize(): Promise<void> {
    // Return early if already initialized
    if (this.isInitialized) {
      if (this.debugMode) {
        log.d("VECTOR", "Already initialized, returning early");
      }
      return;
    }

    // Return existing promise if already initializing
    if (this.isInitializing && this.initializationPromise) {
      if (this.debugMode) {
        log.d("VECTOR", "Initialization in progress, waiting...");
      }
      return this.initializationPromise;
    }

    // Set initialization state and create promise
    this.isInitializing = true;
    this.initializationPromise = this.initializeInternal();

    try {
      await this.initializationPromise;
      this.isInitialized = true;
      if (this.debugMode) {
        log.d("VECTOR", "Initialization completed successfully");
      }
    } catch (error) {
      // Reset state on failure
      this.isInitializing = false;
      this.initializationPromise = null;
      throw error;
    } finally {
      this.isInitializing = false;
    }
  }

  /**
   * Internal initialization method
   * v5: Initializes FaissProvider as the only backend
   * v6: Optionally initializes LayeredFaissProvider for base + delta architecture
   */
  private async initializeInternal(): Promise<void> {
    try {
      if (this.useLayeredIndex) {
        // v6: Use singleton layered provider to ensure consistency across components
        // DevAgent/ParserAgent and SemanticAgent/VectorStore must use the same instance
        // Pass dimensions so the FAISS index matches the embedding model
        this.layeredProvider = getLayeredFaissProvider({ dimensions: this.config.dimensions });

        if (this.currentContext) {
          // Initialize with context if available
          const isInit = this.layeredProvider.initialized;
          if (!isInit) {
            const success = await this.layeredProvider.initialize(
              this.config.workingDirectory || "",
              this.currentContext.projectHash,
              this.currentContext.branchName,
            );

            if (!success) {
              throw new Error("Failed to initialize LayeredFaissProvider");
            }
          }
        } else {
          log.w("VECTOR", "Layered index requires context, deferring initialization");
        }

        log.i("VECTOR", "Initialized with Layered Faiss backend (singleton)", {
          dimensions: this.config.dimensions,
          mode: "layered-base-delta",
        });
      } else {
        // v5: Initialize standard Faiss provider
        const provider = await initializeFaissProvider({
          dimensions: this.config.dimensions,
          indexType: "ivfsq",
          hnswM: 32,
          hnswEfConstruction: 200,
          hnswEfSearch: 64,
          ivfNlist: 256,
          ivfNprobe: 32,
          sqBits: 8,
        });

        if (!provider) {
          throw new Error("Failed to initialize FaissProvider");
        }

        this.faissProvider = provider;

        // Set context on Faiss if already configured
        if (this.currentContext) {
          this.faissProvider.setProjectContext(this.currentContext.projectHash, this.currentContext.branchName);
        }

        log.i("VECTOR", "Initialized with Faiss backend", {
          dimensions: this.config.dimensions,
          mode: "faiss-ivfsq",
        });
      }
    } catch (error) {
      log.e("VECTOR", "Initialization failed", { error: (error as Error).message });
      throw new Error(`Failed to initialize vector store`, { cause: error });
    }
  }

  /**
   * Ensure Faiss provider is initialized (for lazy initialization)
   */
  private ensureFaissProvider(): FaissProvider {
    if (!this.faissProvider) {
      throw new Error("VectorStore not initialized. Call initialize() first.");
    }
    return this.faissProvider;
  }

  /**
   * Ensure layered provider is initialized with context
   */
  private async ensureLayeredProviderInitialized(): Promise<LayeredFaissProvider> {
    if (!this.layeredProvider) {
      throw new Error("VectorStore not initialized. Call initialize() first.");
    }

    // Lazy initialization if context was set after initialization
    if (this.currentContext) {
      const success = await this.layeredProvider.initialize(
        this.config.workingDirectory || "",
        this.currentContext.projectHash,
        this.currentContext.branchName,
      );
      if (!success) {
        throw new Error("Failed to initialize LayeredFaissProvider with context");
      }
    } else {
      throw new Error("LayeredFaissProvider requires project context. Call setProjectContext() first.");
    }

    return this.layeredProvider;
  }

  /**
   * Ensure project context is set before operations
   */
  private ensureContextSet(): ProjectContext {
    if (!this.currentContext) {
      throw new Error(
        "VectorStore project context not set. Call setProjectContext() or setProject() before operations.",
      );
    }
    return this.currentContext;
  }

  /**
   * Get recommended strategy based on current data characteristics
   */
  getStrategy(vectorCount: number, isRebuild = false, queryBatchSize = 1): StrategyRecommendation {
    return getRecommendedStrategy(vectorCount, this.config.dimensions, isRebuild, queryBatchSize);
  }

  /**
   * Insert a single embedding
   * v5: Uses FaissProvider directly
   * v6: Uses LayeredFaissProvider when enabled
   */
  async insert(embedding: VectorEmbedding): Promise<void> {
    log.i("VECTOR", "insert_embedding", {
      id: embedding.id,
      vectorDim: embedding.vector.length,
      contentLen: embedding.content.length,
      metadataType: embedding.metadata?.["type"] as string,
    });

    if (this.useLayeredIndex) {
      const provider = await this.ensureLayeredProviderInitialized();
      await provider.add(embedding);
    } else {
      const provider = this.ensureFaissProvider();
      await provider.add(embedding);
    }

    log.d("VECTOR", "insert_complete", { id: embedding.id });
  }

  /**
   * Batch insert multiple embeddings
   * v5: Uses FaissProvider directly
   * v6: Uses LayeredFaissProvider when enabled
   */
  async insertBatch(embeddings: VectorEmbedding[]): Promise<void> {
    const unique = dedupeById(embeddings);

    if (this.useLayeredIndex) {
      const provider = await this.ensureLayeredProviderInitialized();
      await provider.addBatch(unique);
    } else {
      const provider = this.ensureFaissProvider();
      await provider.addBatch(unique);
    }
  }

  /**
   * Bulk insert with HNSW indexing
   * v5: Same as insertBatch (Faiss HNSW handles bulk efficiently)
   */
  async bulkInsert(embeddings: VectorEmbedding[]): Promise<void> {
    await this.insertBatch(embeddings);
  }

  /**
   * Adaptive bulk insert - v5: Always uses Faiss HNSW
   * v6: Uses LayeredFaissProvider when enabled
   * @returns Object with stats about the insert operation
   */
  async adaptiveBulkInsert(embeddings: VectorEmbedding[]): Promise<{
    usedFaiss: boolean;
    insertedCount: number;
    timeMs: number;
  }> {
    const unique = dedupeById(embeddings);
    const startTime = performance.now();

    if (this.useLayeredIndex) {
      const provider = await this.ensureLayeredProviderInitialized();
      await provider.addBatch(unique);
    } else {
      const provider = this.ensureFaissProvider();
      await provider.addBatch(unique);
    }

    const timeMs = performance.now() - startTime;
    log.i("VECTOR", "Bulk insert via Faiss HNSW", {
      count: unique.length,
      ms: timeMs.toFixed(1),
      layered: this.useLayeredIndex,
    });

    return {
      usedFaiss: true,
      insertedCount: unique.length,
      timeMs,
    };
  }

  /**
   * Adaptive index rebuild - v5: Faiss HNSW maintains index automatically
   */
  async adaptiveRebuildIndex(_deltaCount?: number): Promise<{
    usedFaiss: boolean;
    strategy: string;
    timeMs: number;
  }> {
    const startTime = performance.now();

    // Faiss HNSW maintains index automatically - no rebuild needed
    const timeMs = performance.now() - startTime;

    return {
      usedFaiss: true,
      strategy: "faiss-hnsw-live",
      timeMs,
    };
  }

  /**
   * Adaptive search - v5: Always uses Faiss HNSW
   * v6: Uses LayeredFaissProvider when enabled, enriches results from LibSQL
   */
  async adaptiveSearch(
    queryVector: Float32Array,
    limit = 10,
  ): Promise<{ results: SimilarityResult[]; usedFaiss: boolean }> {
    let rawResults: SimilarityResult[];

    if (this.useLayeredIndex) {
      const provider = await this.ensureLayeredProviderInitialized();
      rawResults = await provider.searchForVectorStore(queryVector, limit);
    } else {
      const provider = this.ensureFaissProvider();
      rawResults = await provider.search(queryVector, limit);
    }

    const results = await this.enrichResultsFromLibSQL(rawResults);
    return { results, usedFaiss: true };
  }

  /**
   * Drop vector index - v5: No-op (Faiss HNSW handles live updates)
   */
  async dropVectorIndex(): Promise<void> {
    // Faiss HNSW handles live updates, no need to drop index
    log.d("VECTOR", "dropVectorIndex: no-op with Faiss HNSW");
  }

  /**
   * Rebuild vector index - v5: No-op (Faiss HNSW maintains index automatically)
   */
  async rebuildVectorIndex(): Promise<void> {
    // Faiss HNSW maintains index automatically
    log.d("VECTOR", "rebuildVectorIndex: no-op with Faiss HNSW");
  }

  /**
   * Flush and save Faiss index to disk
   * v5: Saves both Faiss index and content cache
   * v6: Also saves layered provider state
   */
  async flushAndSave(): Promise<{ flushed: number; saved: boolean }> {
    try {
      let flushed = 0;

      if (this.useLayeredIndex && this.layeredProvider) {
        await this.layeredProvider.save();
        // Layered provider doesn't have a flush count
        flushed = 0;
      } else if (this.faissProvider) {
        flushed = await this.faissProvider.flush();
        await this.faissProvider.save();
      }

      log.i("VECTOR", "Saved Faiss index to disk", { flushed, layered: this.useLayeredIndex });

      return { flushed, saved: true };
    } catch (error) {
      log.e("VECTOR", "flushAndSave failed", { error: (error as Error).message });
      return { flushed: 0, saved: false };
    }
  }

  /**
   * Search for similar vectors
   * v6: Uses Faiss HNSW search or LayeredFaissProvider, enriches results from LibSQL
   */
  async search(queryVector: Float32Array, limit = 10): Promise<SimilarityResult[]> {
    const rawResults = await this.searchRaw(queryVector, limit);

    // Enrich results with entity data from LibSQL
    const enriched = await this.enrichResultsFromLibSQL(rawResults);

    log.i("VECTOR", "search_enriched_results", {
      beforeCount: rawResults.length,
      afterCount: enriched.length,
      filtered: rawResults.length - enriched.length,
    });

    return enriched;
  }

  /**
   * Search without enrichment — returns raw FAISS results with vector IDs only.
   * Use when caller handles entity resolution itself (e.g. pattern_search).
   */
  async searchRaw(queryVector: Float32Array, limit = 10): Promise<SimilarityResult[]> {
    let rawResults: SimilarityResult[];

    if (this.useLayeredIndex) {
      const provider = await this.ensureLayeredProviderInitialized();
      rawResults = await provider.searchForVectorStore(queryVector, limit);
    } else {
      const provider = this.ensureFaissProvider();
      rawResults = await provider.search(queryVector, limit);
    }

    log.i("VECTOR", "search_raw_results", {
      count: rawResults.length,
      ids: rawResults.map((r) => r.id).slice(0, 10),
    });

    return rawResults;
  }

  /**
   * Enrich search results with entity data from LibSQL
   */
  private async enrichResultsFromLibSQL(results: SimilarityResult[]): Promise<SimilarityResult[]> {
    if (results.length === 0) return results;

    try {
      const { getGraphStorage } = await import("../storage/graph-storage-factory.js");
      const storage = await getGraphStorage();

      // Separate entities from non-entities (e.g., AutoDoc documents with doc:: prefix)
      const entityResults = results.filter((r) => !r.id.startsWith("doc::"));
      const docResults = results.filter((r) => r.id.startsWith("doc::"));

      if (this.debugMode) {
        log.d("VECTOR", "enrich_split", {
          total: results.length,
          entities: entityResults.length,
          docs: docResults.length,
        });
      }

      // Extract entity IDs from result IDs (format: "ent:{entityId}" or "ent:{filePath}:{type}:{name}")
      const entityIds = entityResults.map((r) => (r.id.startsWith("ent:") ? r.id.slice(4) : r.id));

      // Split IDs into hash-based (direct lookup) and composite (filePath:type:name)
      const hashIds: string[] = [];
      const compositeIds: Array<{ idx: number; id: string; filePath: string; type: string; name: string }> = [];

      for (let i = 0; i < entityIds.length; i++) {
        const id = entityIds[i]!;
        const lastColonIdx = id.lastIndexOf(":");
        const secondLastColonIdx = id.lastIndexOf(":", lastColonIdx - 1);
        if (secondLastColonIdx > 0) {
          compositeIds.push({
            idx: i,
            id,
            filePath: id.slice(0, secondLastColonIdx),
            type: id.slice(secondLastColonIdx + 1, lastColonIdx),
            name: id.slice(lastColonIdx + 1),
          });
        } else {
          hashIds.push(id);
        }
      }

      // Batch resolve: 1 query for hash IDs, 1 query for composite IDs (by filePaths)
      const entityMap = new Map<string, Entity>();

      // Batch 1: hash-based IDs via getEntitiesBatch (single SQL with IN clause)
      if (hashIds.length > 0) {
        const batchResult = await storage.getEntitiesBatch(hashIds);
        for (const [id, entity] of batchResult) {
          entityMap.set(id, entity);
        }
      }

      // Batch 2: composite IDs via single findEntities with all filePaths
      if (compositeIds.length > 0) {
        const allFilePaths = [...new Set(compositeIds.map((c) => c.filePath))];
        const allEntities = await storage.findEntities({
          filters: { filePath: allFilePaths },
          limit: allFilePaths.length * 50,
        });

        // Build lookup by filePath:type:name
        const lookup = new Map<string, Entity>();
        for (const entity of allEntities) {
          lookup.set(`${entity.filePath}:${entity.type}:${entity.name}`, entity);
        }

        for (const comp of compositeIds) {
          const entity = lookup.get(`${comp.filePath}:${comp.type}:${comp.name}`);
          if (entity) {
            entityMap.set(comp.id, entity);
          }
        }
      }

      // Enrich entity results
      const enrichedEntities = entityResults.map((r) => {
        const entityId = r.id.startsWith("ent:") ? r.id.slice(4) : r.id;
        const entity = entityMap.get(entityId);
        if (entity) {
          return {
            ...r,
            content: entity.name || "",
            metadata: {
              ...r.metadata,
              entityId,
              type: entity.type,
              filePath: entity.filePath,
              name: entity.name,
              language: entity.language,
              // Add location info for better navigation
              startLine: entity.location?.start?.line,
              endLine: entity.location?.end?.line,
              startColumn: entity.location?.start?.column,
              endColumn: entity.location?.end?.column,
            },
          };
        }
        return r;
      });

      // Enrich AutoDoc document results with metadata from AutoDoc database
      const enrichedDocs: SimilarityResult[] = [];
      let adm = this.cachedAutoDocManager;
      if (docResults.length > 0) {
        try {
          if (!adm) {
            const { getAutoDocManager } = await import("../autodoc/storage/autodoc-manager.js");
            const { getGlobalDbPaths } = await import("../shared/storage-paths.js");
            const { dirname, join } = await import("node:path");

            const paths = getGlobalDbPaths();
            const autodocDbPath = join(dirname(paths.graphDbPath), "autodoc.db");
            adm = getAutoDocManager(autodocDbPath);
            this.cachedAutoDocManager = adm;
          }

          // Initialize AutoDoc manager once (creates tables if needed)
          if (!this.autoDocInitialized) {
            await adm.initialize(storage);
            this.autoDocInitialized = true;
          }

          for (const r of docResults) {
            const doc = await adm.getDocument(r.id);
            if (doc) {
              enrichedDocs.push({
                ...r,
                content: doc.title,
                metadata: {
                  ...r.metadata,
                  type: "autodoc",
                  docType: doc.type,
                  filePath: doc.filePath,
                  section: doc.section,
                  title: doc.title,
                },
              });
            } else {
              enrichedDocs.push(r); // Keep original if doc not found
            }
          }

          if (this.debugMode) {
            log.d("VECTOR", "enrich_autodoc", {
              total: docResults.length,
              enriched: enrichedDocs.length,
            });
          }
        } catch (error) {
          log.w("VECTOR", "Failed to enrich AutoDoc results", { error: (error as Error).message });
          enrichedDocs.push(...docResults); // Keep originals on error
        }
      }

      // PHASE 2: AutoDoc-driven entity enrichment (lazy: only top-N docs for large sets)
      const AUTODOC_ENRICHMENT_LIMIT = 50;
      const autodocDerivedResults: SimilarityResult[] = [];
      const docsForEnrichment =
        enrichedDocs.length > AUTODOC_ENRICHMENT_LIMIT ? enrichedDocs.slice(0, AUTODOC_ENRICHMENT_LIMIT) : enrichedDocs;

      if (docsForEnrichment.length > 0 && adm) {
        try {
          if (this.debugMode) {
            log.i("VECTOR", "autodoc_enrichment_start", {
              docCount: docsForEnrichment.length,
              totalDocs: enrichedDocs.length,
              limited: enrichedDocs.length > AUTODOC_ENRICHMENT_LIMIT,
            });
          }

          // Helper: determine refType weight
          const getRefTypeWeight = (refType: string): number => {
            const weights: Record<string, number> = {
              describes: 1.0, // main described entity
              depends: 0.9, // dependency
              uses: 0.8, // uses
              participates: 0.7, // participates in scenario
              example: 0.6, // mentioned in example
              test: 0.5, // mentioned in tests
            };
            return weights[refType] || 0.8;
          };

          // Helper: determine section weight by heading
          const getSectionWeight = (sectionTitle: string): number => {
            const lower = sectionTitle.toLowerCase();
            if (lower.includes("overview") || lower.includes("architecture")) return 1.0;
            if (lower.includes("implement") || lower.includes("usage")) return 0.9;
            if (lower.includes("example")) return 0.7;
            if (lower.includes("test")) return 0.6;
            return 0.85; // default for unknown sections
          };

          // 1. Collect entity references from all found AutoDoc documents
          interface EntityRefInfo {
            docId: string;
            docSimilarity: number;
            docTitle: string;
            refType: string;
            sectionTitle: string;
            mentions: number;
          }

          const entityRefsFromDocs = new Map<string, EntityRefInfo>();

          for (const docResult of docsForEnrichment) {
            const doc = await adm.getDocument(docResult.id);
            if (!doc) continue;

            // Get all references from the document
            const refs = await adm.getReferences(doc.filePath);

            // Verbose logging for diagnostics
            if (this.debugMode) {
              log.i("VECTOR", "autodoc_all_refs", {
                docId: docResult.id,
                totalRefs: refs.length,
                refTypes: refs.map((r: Reference) => r.targetType),
                refTargetIds: refs.map((r: Reference) => r.targetId),
                refValid: refs.map((r: Reference) => r.valid),
              });
            }

            // TEMPORARY: also accept LINE_RANGE until parser is fixed
            const entityRefs = refs.filter(
              (ref: Reference) =>
                (ref.targetType === RefTargetType.ENTITY || ref.targetType === RefTargetType.LINE_RANGE) &&
                ref.valid &&
                ref.targetId,
            );

            if (this.debugMode) {
              log.i("VECTOR", "autodoc_refs_from_doc", {
                docId: docResult.id,
                totalRefs: refs.length,
                entityRefs: entityRefs.length,
                sampleTargetIds: entityRefs.slice(0, 3).map((r: Reference) => r.targetId),
              });
            }

            // Count mention frequency of each entityId
            const mentionCounts = new Map<string, number>();
            for (const ref of entityRefs) {
              const id = ref.targetId!;
              mentionCounts.set(id, (mentionCounts.get(id) || 0) + 1);
            }

            // Save the first mention of each entity
            for (const ref of entityRefs) {
              const entityId = ref.targetId!;
              if (!entityRefsFromDocs.has(entityId)) {
                // Parse section title (doc.section may be null)
                const sectionTitle = doc.section || "Overview";

                entityRefsFromDocs.set(entityId, {
                  docId: docResult.id,
                  docSimilarity: docResult.similarity || 0,
                  docTitle: doc.title,
                  refType: ref.refType,
                  sectionTitle,
                  mentions: mentionCounts.get(entityId) || 1,
                });
              }
            }
          }

          if (this.debugMode) {
            log.i("VECTOR", "autodoc_refs_collected", {
              uniqueEntities: entityRefsFromDocs.size,
            });
          }

          // 2. Deduplicate with already found entities
          const existingEntityIds = new Set<string>();
          for (const r of enrichedEntities) {
            const entityId = r.metadata?.["entityId"];
            if (entityId && typeof entityId === "string") {
              existingEntityIds.add(entityId);
            }
          }

          const newEntityIds = Array.from(entityRefsFromDocs.keys()).filter((id) => !existingEntityIds.has(id));

          if (this.debugMode) {
            log.i("VECTOR", "autodoc_deduplication", {
              totalRefs: entityRefsFromDocs.size,
              existing: existingEntityIds.size,
              new: newEntityIds.length,
            });
          }

          // 3. Resolve entity names to full entityIds
          if (newEntityIds.length > 0) {
            if (this.debugMode) {
              log.i("VECTOR", "autodoc_resolving_names", {
                names: newEntityIds,
              });
            }

            const resolvedEntities: Array<{ name: string; entity: Entity; refInfo: EntityRefInfo }> = [];

            // Batch fetch entities by name using findEntities (avoids loading ALL entities)
            const batchResults = await Promise.all(
              newEntityIds.map((entityName) =>
                storage.findEntities({
                  filters: { name: entityName },
                  limit: 1,
                }),
              ),
            );

            for (let i = 0; i < newEntityIds.length; i++) {
              const entityName = newEntityIds[i]!;
              const matchingEntities = batchResults[i]!;

              if (this.debugMode) {
                log.i("VECTOR", "autodoc_name_match", {
                  name: entityName,
                  matches: matchingEntities.length,
                });
              }

              if (matchingEntities.length > 0) {
                const entity = matchingEntities[0]!;
                const refInfo = entityRefsFromDocs.get(entityName)!;
                resolvedEntities.push({ name: entityName, entity, refInfo });
              }
            }

            log.i("VECTOR", "autodoc_resolved", {
              total: newEntityIds.length,
              resolved: resolvedEntities.length,
            });

            // 4. Create enriched results for resolved entities
            for (const { name: entityName, entity, refInfo } of resolvedEntities) {
              // Calculate dynamic similarity based on a combination of factors
              const refTypeWeight = getRefTypeWeight(refInfo.refType);
              const sectionWeight = getSectionWeight(refInfo.sectionTitle);
              const frequencyBoost = Math.min(1.0 + (refInfo.mentions - 1) * 0.05, 1.2);

              const derivedSimilarity = refInfo.docSimilarity * refTypeWeight * sectionWeight * frequencyBoost;

              if (this.debugMode) {
                log.d("VECTOR", "autodoc_entity_score", {
                  entityId: entity.id,
                  entityName,
                  docSim: refInfo.docSimilarity,
                  refType: refInfo.refType,
                  refWeight: refTypeWeight,
                  section: refInfo.sectionTitle,
                  secWeight: sectionWeight,
                  mentions: refInfo.mentions,
                  freqBoost: frequencyBoost,
                  finalSim: derivedSimilarity,
                });
              }

              autodocDerivedResults.push({
                id: `ent:${entity.id}`,
                content: entity.name || "",
                similarity: derivedSimilarity,
                metadata: {
                  entityId: entity.id,
                  type: entity.type,
                  filePath: entity.filePath,
                  name: entity.name,
                  startLine: entity.location?.start?.line,
                  endLine: entity.location?.end?.line,
                  startColumn: entity.location?.start?.column,
                  endColumn: entity.location?.end?.column,
                  // AutoDoc enrichment markers (internal only, not for user)
                  foundVia: "autodoc",
                  sourceDoc: refInfo.docId,
                  sourceDocTitle: refInfo.docTitle,
                },
              });
            }

            if (this.debugMode) {
              log.d("VECTOR", "autodoc_enrichment_complete", {
                added: autodocDerivedResults.length,
              });
            }
          }
        } catch (error) {
          log.w("VECTOR", "AutoDoc enrichment failed", {
            error: (error as Error).message,
          });
          // Non-fatal - continue without AutoDoc enrichment
        }
      }

      // Combine and sort by similarity
      const combined = [...enrichedEntities, ...enrichedDocs, ...autodocDerivedResults];

      // PageRank boost: entities with high PageRank get ±10% similarity adjustment
      for (const result of combined) {
        const pr = (result.metadata as Record<string, unknown> | undefined)?.["pageRank"];
        if (typeof pr === "number") {
          result.similarity = (result.similarity || 0) * (1 + (pr - 0.5) * 0.2);
        }
      }

      combined.sort((a, b) => (b.similarity || 0) - (a.similarity || 0));

      if (this.debugMode) {
        log.d("VECTOR", "enrich_complete", {
          enrichedEntities: enrichedEntities.length,
          enrichedDocs: enrichedDocs.length,
          autodocDerived: autodocDerivedResults.length,
          total: combined.length,
        });
      }

      return combined;
    } catch (error) {
      log.w("VECTOR", "Failed to enrich results from LibSQL", { error: (error as Error).message });
      return results;
    }
  }

  /**
   * Advanced similarity search with filters and threshold
   * v5: Uses Faiss search with post-filtering
   * v6: Supports LayeredFaissProvider
   */
  async searchWithFilters(
    queryVector: Float32Array,
    options: {
      limit?: number;
      threshold?: number | undefined;
      metadataFilter?: Record<string, unknown>;
      dateRange?: { start?: number; end?: number };
    } = {},
  ): Promise<SimilarityResult[]> {
    const { limit = 10, threshold = 0.0, metadataFilter, dateRange } = options;

    // Get more results for filtering
    const expandedLimit = metadataFilter || dateRange ? limit * 10 : limit;

    let results: SimilarityResult[];
    if (this.useLayeredIndex) {
      const provider = await this.ensureLayeredProviderInitialized();
      results = await provider.searchForVectorStore(queryVector, expandedLimit);
    } else {
      const provider = this.ensureFaissProvider();
      results = await provider.search(queryVector, expandedLimit);
    }

    log.d("VECTOR", "search_raw_results", {
      count: results.length,
      sample: results.slice(0, 3).map((r) => ({
        id: r.id,
        similarity: r.similarity,
        hasMetadata: !!r.metadata,
        metadataType: r.metadata?.["type"],
      })),
    });

    // Enrich results with entity data from LibSQL BEFORE filtering
    // This allows filtering by metadata from LibSQL (type, filePath, etc.)
    const enriched = await this.enrichResultsFromLibSQL(results);

    // Apply post-filtering
    let filtered = enriched;

    // Filter by threshold
    if (threshold > 0) {
      filtered = filtered.filter((r) => r.similarity >= threshold);
    }

    // Filter by metadata
    if (metadataFilter) {
      log.d("VECTOR", "before_metadata_filter", {
        count: filtered.length,
        filter: metadataFilter,
        sample: filtered.slice(0, 3).map((r) => ({
          id: r.id,
          hasMetadata: !!r.metadata,
          metadata: r.metadata,
        })),
      });

      filtered = filtered.filter((r) => {
        if (!r.metadata) return false;
        for (const [k, v] of Object.entries(metadataFilter)) {
          if (r.metadata[k] !== v) return false;
        }
        return true;
      });

      log.d("VECTOR", "after_metadata_filter", {
        count: filtered.length,
        kept: filtered.slice(0, 3).map((r) => ({ id: r.id, metadata: r.metadata })),
      });
    }

    // Filter by date range (if metadata contains createdAt)
    if (dateRange) {
      filtered = filtered.filter((r) => {
        const createdAt = r.metadata?.["createdAt"] as number | undefined;
        if (!createdAt) return true; // Include if no createdAt
        if (dateRange.start != null && createdAt < dateRange.start) return false;
        if (dateRange.end != null && createdAt > dateRange.end) return false;
        return true;
      });
    }

    return filtered.slice(0, limit);
  }

  /**
   * Get embedding by ID
   * v6: Gets metadata from LibSQL (content not stored in Faiss)
   * v6: Supports LayeredFaissProvider
   */
  async get(id: string): Promise<VectorEmbedding | null> {
    // Check if ID exists
    let hasId = false;
    if (this.useLayeredIndex && this.layeredProvider) {
      hasId = this.layeredProvider.has(id);
    } else if (this.faissProvider) {
      hasId = this.faissProvider.hasId(id);
    }

    if (!hasId) return null;

    // Try to get entity data from LibSQL
    try {
      const { getGraphStorage } = await import("../storage/graph-storage-factory.js");
      const storage = await getGraphStorage();
      // ID format: "ent:{entityId}" - extract entity ID
      const entityId = id.startsWith("ent:") ? id.slice(4) : id;
      const entity = await storage.getEntity(entityId);
      if (entity) {
        return {
          id,
          content: entity.name || "",
          vector: new Float32Array(0),
          metadata: { entityId, type: entity.type, filePath: entity.filePath },
          createdAt: entity.createdAt || Date.now(),
        };
      }
    } catch {
      // Ignore LibSQL errors
    }

    // Return minimal embedding if entity not found in LibSQL
    return {
      id,
      content: "",
      vector: new Float32Array(0),
      createdAt: Date.now(),
    };
  }

  /**
   * Batch check which IDs already exist
   * v6: Uses FaissProvider ID set or LayeredFaissProvider
   */
  async getExistingIds(ids: string[]): Promise<Set<string>> {
    if (this.useLayeredIndex && this.layeredProvider) {
      // Check each ID via layered provider's has() method
      const existing = new Set<string>();
      for (const id of ids) {
        if (this.layeredProvider.has(id)) {
          existing.add(id);
        }
      }
      return existing;
    }

    const provider = this.ensureFaissProvider();
    return provider.getExistingIds(ids);
  }

  /**
   * Update an existing embedding
   * v6: Remove and re-add (Faiss doesn't support in-place updates)
   * v6: Supports LayeredFaissProvider
   */
  async update(id: string, vector: Float32Array, metadata?: Record<string, unknown>): Promise<void> {
    if (this.useLayeredIndex) {
      const provider = await this.ensureLayeredProviderInitialized();

      // Check if ID exists
      if (!provider.has(id)) {
        throw new Error(`Embedding with id=${id} not found`);
      }

      // Remove old embedding
      await provider.remove([id]);

      // Add new embedding
      await provider.add({
        id,
        content: "", // Content stored in LibSQL
        vector,
        metadata,
        createdAt: Date.now(),
      });
    } else {
      const provider = this.ensureFaissProvider();

      // Check if ID exists
      if (!provider.hasId(id)) {
        throw new Error(`Embedding with id=${id} not found`);
      }

      // Remove old embedding
      await provider.remove([id]);

      // Add new embedding
      await provider.add({
        id,
        content: "", // Content stored in LibSQL
        vector,
        metadata,
        createdAt: Date.now(),
      });
    }
  }

  /**
   * Delete an embedding
   * v5: Removes from Faiss
   * v6: Supports LayeredFaissProvider (uses tombstones on feature branches)
   */
  async delete(id: string): Promise<void> {
    if (this.useLayeredIndex) {
      const provider = await this.ensureLayeredProviderInitialized();
      await provider.remove([id]);
    } else {
      const provider = this.ensureFaissProvider();
      await provider.remove([id]);
    }
  }

  /**
   * Get total number of embeddings
   * v5: Gets count from Faiss
   * v6: Supports LayeredFaissProvider
   */
  async count(): Promise<number> {
    if (this.useLayeredIndex) {
      const provider = await this.ensureLayeredProviderInitialized();
      const stats = await provider.getStats();
      return stats.totalVectors;
    }

    const provider = this.ensureFaissProvider();
    return await provider.getVectorCount();
  }

  /**
   * Clear all embeddings for current project
   * v5: Note - this only clears Faiss, not graph data
   */
  async clear(): Promise<void> {
    // TODO: Implement clear in FaissProvider
    log.w("VECTOR", "clear() not fully implemented for Faiss-only mode");
  }

  /**
   * Clear ALL embeddings from ALL projects
   * WARNING: This is a destructive operation
   */
  async clearAll(): Promise<void> {
    log.w("VECTOR", "clearAll() not implemented for Faiss-only mode");
  }

  /**
   * Close the vector store
   * v5: Saves Faiss index before closing
   * v6: Also saves LayeredFaissProvider state
   */
  async close(): Promise<void> {
    if (this.useLayeredIndex && this.layeredProvider) {
      await this.layeredProvider.save();
    } else if (this.faissProvider) {
      await this.faissProvider.save();
      // Note: FaissProvider is a singleton, don't close it
    }
    this.isInitialized = false;
    log.d("VECTOR", "Closed (Faiss index saved)", { layered: this.useLayeredIndex });
  }

  /**
   * Get the underlying FAISS provider for direct access
   * @deprecated Use getActiveProvider() instead
   */
  getFaissProvider(): FaissProvider | null {
    return this.faissProvider;
  }

  /**
   * Get the active vector provider (FaissProvider or LayeredFaissProvider).
   * Used by EmbeddingAccumulator for batch flush operations.
   */
  getActiveProvider(): import("./faiss/types.js").IVectorProvider | null {
    if (this.useLayeredIndex && this.layeredProvider) {
      return this.layeredProvider;
    }
    return this.faissProvider;
  }

  /**
   * Check if layered index mode is enabled
   */
  isLayeredMode(): boolean {
    return this.useLayeredIndex;
  }

  /**
   * Get database statistics
   * v5: Gets stats from Faiss
   */
  async getStats(): Promise<{
    totalEmbeddings: number;
    dbSizeMB: number;
    oldestEntry: number | null;
    newestEntry: number | null;
  }> {
    let stats: { totalVectors: number };

    if (this.useLayeredIndex && this.layeredProvider) {
      stats = await this.layeredProvider.getStats();
    } else {
      const provider = this.ensureFaissProvider();
      stats = await provider.getStats();
    }

    return {
      totalEmbeddings: stats.totalVectors,
      dbSizeMB: 0, // Not easily available
      oldestEntry: null,
      newestEntry: null,
    };
  }

  /**
   * Batch search for multiple query vectors
   * v5: Uses Faiss batch search
   * v6: Uses LayeredFaissProvider when enabled, enriches results from LibSQL
   */
  async batchSearch(queryVectors: Float32Array[], limit = 10): Promise<SimilarityResult[][]> {
    let rawResults: SimilarityResult[][];

    if (this.useLayeredIndex) {
      // Layered provider doesn't have batchSearch, use sequential search
      const provider = await this.ensureLayeredProviderInitialized();
      rawResults = await Promise.all(queryVectors.map((qv) => provider.searchForVectorStore(qv, limit)));
    } else {
      const provider = this.ensureFaissProvider();
      rawResults = await provider.batchSearch(queryVectors, limit);
    }

    // Enrich all results in parallel
    const enrichedResults = await Promise.all(rawResults.map((results) => this.enrichResultsFromLibSQL(results)));

    return enrichedResults;
  }

  /**
   * Find vectors within a specific distance threshold (radius search)
   */
  async searchWithinRadius(queryVector: Float32Array, radius: number, limit = 100): Promise<SimilarityResult[]> {
    const threshold = Math.max(0, 1 - radius); // Convert radius to similarity threshold
    return this.searchWithFilters(queryVector, { limit, threshold });
  }

  /**
   * Get performance statistics for vector backend
   * v5: Returns Faiss HNSW stats
   */
  getVectorStats(): {
    hasExtension: boolean;
    extensionVersion?: string;
    optimizedOperations: boolean;
    backend: "faiss";
    backendInfo?: {
      type: string;
      persistent: boolean;
      note: string;
    };
  } {
    return {
      hasExtension: true,
      optimizedOperations: true,
      backend: "faiss",
      backendInfo: {
        type: "Faiss HNSW",
        persistent: true,
        note: "In-memory HNSW index with disk persistence",
      },
    };
  }

  /**
   * Get backend information
   * v5: Returns Faiss backend info
   */
  getBackendInfo(): {
    currentBackend: "faiss";
    vectorCount: number;
    recommended: boolean;
    performance: {
      insertSpeed: string;
      searchSpeed: string;
      accuracy: string;
      memoryUsage: string;
      persistent: boolean;
    };
  } {
    return {
      currentBackend: "faiss",
      vectorCount: 0, // Would need async call to get actual count
      recommended: true,
      performance: {
        insertSpeed: "very-fast",
        searchSpeed: "very-fast",
        accuracy: "approximate",
        memoryUsage: "medium",
        persistent: true,
      },
    };
  }

  // =============================================================================
  // CROSS-BRANCH OPERATIONS
  // v5: These require loading different Faiss indexes, not implemented yet
  // =============================================================================

  /**
   * Search for similar vectors in a specific branch
   * v5: Not implemented - would require loading different Faiss index
   */
  async searchInBranch(queryVector: Float32Array, _targetBranch: string, limit = 10): Promise<SimilarityResult[]> {
    // For now, just search in current context
    log.w("VECTOR", "searchInBranch: cross-branch search not implemented, using current context");
    return await this.search(queryVector, limit);
  }

  /**
   * Compare embeddings between two branches
   * v5: Not implemented - would require loading different Faiss indexes
   */
  async compareEmbeddingsBetweenBranches(
    _queryVector: Float32Array,
    _branch1: string,
    _branch2: string,
    _limit = 10,
  ): Promise<{
    branch1Results: SimilarityResult[];
    branch2Results: SimilarityResult[];
    onlyInBranch1: SimilarityResult[];
    onlyInBranch2: SimilarityResult[];
    inBoth: Array<{ id: string; branch1Similarity: number; branch2Similarity: number }>;
  }> {
    log.w("VECTOR", "compareEmbeddingsBetweenBranches: not implemented in Faiss-only mode");
    return {
      branch1Results: [],
      branch2Results: [],
      onlyInBranch1: [],
      onlyInBranch2: [],
      inBoth: [],
    };
  }

  /**
   * List all branches that have embeddings for current project
   * v5: Not implemented - Faiss index is per-project/branch
   */
  async listBranches(): Promise<string[]> {
    // Return current branch only
    const ctx = this.ensureContextSet();
    return [ctx.branchName];
  }

  /**
   * Get embedding count per branch for current project
   * v5: Returns only current branch count
   */
  async getCountPerBranch(): Promise<Array<{ branchName: string; count: number }>> {
    const ctx = this.ensureContextSet();
    const count = await this.count();
    return [{ branchName: ctx.branchName, count }];
  }

  /**
   * Delete all embeddings for a specific branch
   * v5: Not implemented
   */
  async deleteBranch(_branchName: string): Promise<number> {
    log.w("VECTOR", "deleteBranch: not implemented in Faiss-only mode");
    return 0;
  }

  /**
   * Copy embeddings from one branch to another
   * v5: Not implemented
   */
  async copyBranch(_sourceBranch: string, _targetBranch: string): Promise<number> {
    log.w("VECTOR", "copyBranch: not implemented in Faiss-only mode");
    return 0;
  }
}
