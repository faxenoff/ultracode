/**
 * Faiss Provider - In-memory Vector Index
 *
 * Simple architecture:
 * - Faiss HNSW index in main process (via faiss-napi)
 * - Periodic save to disk for persistence
 * - No cold storage / hybrid search - everything in Faiss
 *
 * Flow:
 * 1. Add embeddings directly to Faiss
 * 2. Save index to disk periodically and on close
 * 3. On restart: load index from disk
 */

import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { log } from "../../logging/index.js";
import { getFaissIndexPathByHash, normalizeBranchName } from "../../shared/storage-paths.js";
import type { SimilarityResult, VectorEmbedding } from "../../types/semantic.js";
import { simdL2Normalize } from "../../utils/simd-vector-ops.js";
import { getGpuClient, type IGpuClient } from "../gpu/gpu-client.js";
import { getBaseMetaPathByHash } from "./base-branch-detector.js";
import type { IFaissClient } from "./faiss-client.js";
import type { BaseIndexMetadata } from "./layered-types.js";
import type { FaissIndexConfig, FaissIndexType, FaissSearchResult } from "./types.js";

// =============================================================================
// Configuration
// =============================================================================

export interface FaissProviderConfig {
  /** Vector dimensions (must match embedding model) */
  dimensions: number;
  /** Faiss index type */
  indexType: "flat" | "hnsw" | "ivf" | "ivfpq" | "ivfsq";
  /** HNSW M parameter */
  hnswM?: number;
  /** HNSW efConstruction */
  hnswEfConstruction?: number;
  /** HNSW efSearch */
  hnswEfSearch?: number;
  /** IVF nlist */
  ivfNlist?: number;
  /** IVF nprobe */
  ivfNprobe?: number;
  /** SQ bits for IVF,SQ quantization */
  sqBits?: number;
  /** Auto-save after N embeddings added */
  autoSaveThreshold?: number;
  /** Path to persist Faiss index */
  persistPath?: string;
}

const DEFAULT_CONFIG: Required<FaissProviderConfig> = {
  dimensions: 768,
  indexType: "ivfsq",
  hnswM: 32,
  hnswEfConstruction: 200,
  hnswEfSearch: 64,
  ivfNlist: 256,
  ivfNprobe: 32,
  sqBits: 8,
  autoSaveThreshold: 5000,
  persistPath: "",
};

// =============================================================================
// Provider
// =============================================================================

class FaissProvider {
  private config: Required<FaissProviderConfig>;
  private client: IGpuClient | null = null;
  private isInitialized = false;

  // Track unsaved changes for auto-save
  private unsavedCount = 0;
  private lastSaveTime = 0;

  // Background save state (avoid blocking pipeline)
  private pendingSave: Promise<void> | null = null;
  private saveScheduled = false;

  // Project context (FAISS index is per-project, per-branch)
  private projectHash = "default";
  private branchName = "main";

  // ID set for existence checks (content stored in LibSQL, not here)
  private idSet = new Set<string>();

  // Mutex for initialize() to prevent race condition with concurrent calls
  private initializePromise: Promise<boolean> | null = null;

  constructor(config: Partial<FaissProviderConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Get project key for multi-index pool: "projectHash:branchName"
   */
  private getProjectKey(): string {
    return `${this.projectHash}:${this.branchName}`;
  }

  /**
   * Set project context for per-project FAISS index.
   * With multi-index pool, no save/load cycle needed — worker keeps all indexes in memory.
   */
  async setProjectContext(projectHash: string, branchName: string = "main"): Promise<void> {
    const normalizedBranch = normalizeBranchName(branchName);
    const newPersistPath = getFaissIndexPathByHash(projectHash, normalizedBranch);

    // Check if context actually changed
    if (this.projectHash === projectHash && this.branchName === normalizedBranch) {
      return; // No change
    }

    const oldProjectKey = this.getProjectKey();

    // Save ID set for old context if needed
    if (this.isInitialized && this.unsavedCount > 0) {
      await this.save();
    }
    if (this.isInitialized) {
      this.saveIdSet();
    }

    // Update context
    this.projectHash = projectHash;
    this.branchName = normalizedBranch;
    this.config.persistPath = newPersistPath;

    log.i("FAISS", "Switching project context", {
      from: oldProjectKey,
      to: this.getProjectKey(),
    });

    // Clear ID set for new context
    this.idSet.clear();
    this.unsavedCount = 0;

    // If already initialized, initialize index for new project in worker
    if (this.isInitialized && this.client) {
      const loadPath = existsSync(newPersistPath) ? newPersistPath : undefined;
      const indexConfig = this.buildIndexConfig();

      await this.client.faissInitialize(this.getProjectKey(), indexConfig, loadPath);

      // Load ID set for new context
      if (loadPath) {
        this.loadIdSet();
      }

      const stats = await this.client.faissGetStats(this.getProjectKey());
      log.i("FAISS", "Switched to new context", {
        projectKey: this.getProjectKey(),
        vectors: stats?.totalVectors ?? 0,
        idSetSize: this.idSet.size,
      });
    } else {
      log.d("FAISS", "Project context set (not yet initialized)", {
        projectKey: this.getProjectKey(),
        persistPath: this.config.persistPath,
      });
    }
  }

  /**
   * Build FaissIndexConfig from current provider config
   */
  private buildIndexConfig(): FaissIndexConfig {
    return {
      dimensions: this.config.dimensions,
      indexType: this.config.indexType as FaissIndexType,
      metric: "l2",
      hnswM: this.config.hnswM,
      hnswEfConstruction: this.config.hnswEfConstruction,
      hnswEfSearch: this.config.hnswEfSearch,
      ivfNlist: this.config.ivfNlist,
      ivfNprobe: this.config.ivfNprobe,
      sqBits: this.config.sqBits,
    };
  }

  // ===========================================================================
  // Lifecycle
  // ===========================================================================

  async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;

    // Prevent race condition: if initialize is already in progress, wait for it
    if (this.initializePromise) {
      return this.initializePromise;
    }

    this.initializePromise = this.initializeInternal();
    return this.initializePromise;
  }

  private async initializeInternal(): Promise<boolean> {
    try {
      log.i("FAISS", "Initializing...");

      // Create and start GPU client (unified Faiss + CUDA)
      this.client = getGpuClient();
      const started = await this.client.start();
      if (!started) {
        log.e("FAISS", "Failed to start Faiss client");
        return false;
      }

      // Build Faiss index config
      const indexConfig = this.buildIndexConfig();

      // Check if existing index has compatible dimensions
      let loadPath = existsSync(this.config.persistPath) ? this.config.persistPath : undefined;

      if (loadPath) {
        const savedMeta = this.loadIndexMetadata();
        if (savedMeta && savedMeta.dimensions !== this.config.dimensions) {
          log.w("FAISS", "Dimension mismatch - dropping old index", {
            savedDimensions: savedMeta.dimensions,
            configDimensions: this.config.dimensions,
            indexPath: loadPath,
          });
          // Delete old index files
          this.deleteIndexFiles();
          loadPath = undefined;
        }
      }

      await this.client.faissInitialize(this.getProjectKey(), indexConfig, loadPath);

      // Load ID set if index was loaded
      if (loadPath) {
        this.loadIdSet();
      }

      this.isInitialized = true;
      this.lastSaveTime = Date.now();

      const stats = await this.client.faissGetStats(this.getProjectKey());
      log.i("FAISS", "Initialized", {
        indexType: this.config.indexType,
        dimensions: this.config.dimensions,
        vectors: stats?.totalVectors ?? 0,
        loaded: !!loadPath,
        idSetSize: this.idSet.size,
      });

      return true;
    } catch (error) {
      log.e("FAISS", "Initialization failed", { error: (error as Error).message });
      return false;
    }
  }

  async close(): Promise<void> {
    // Save before closing
    if (this.unsavedCount > 0) {
      await this.save();
    }

    if (this.client && this.isInitialized) {
      await this.client.stop();
    }

    this.idSet.clear();
    this.isInitialized = false;
  }

  // ===========================================================================
  // Insert Operations
  // ===========================================================================

  /**
   * Add single embedding to Faiss
   */
  async add(embedding: VectorEmbedding): Promise<void> {
    if (!this.client || !this.isInitialized) {
      throw new Error("FaissProvider not initialized");
    }

    // Add to Faiss
    await this.client.faissAdd(this.getProjectKey(), [embedding.id], Array.from(embedding.vector));

    // Track ID for existence checks (content stored in LibSQL)
    this.idSet.add(embedding.id);

    this.unsavedCount++;

    // Auto-save check
    if (this.unsavedCount >= this.config.autoSaveThreshold) {
      await this.save();
    }
  }

  /**
   * Batch add embeddings to Faiss
   */
  async addBatch(embeddings: VectorEmbedding[]): Promise<void> {
    if (!this.client || !this.isInitialized) {
      throw new Error("FaissProvider not initialized");
    }

    if (embeddings.length === 0) return;

    const pStart = performance.now();
    const pLog = (phase: string) => {
      const elapsed = (performance.now() - pStart).toFixed(1);
      log.i("FAISS", phase, { elapsedMs: elapsed });
    };

    const dim = this.config.dimensions;
    const count = embeddings.length;

    // Pre-allocate flat vector array (optimization: avoid push/spread overhead)
    const ids: string[] = new Array(count);
    const vectors = new Float32Array(count * dim);

    for (let i = 0; i < count; i++) {
      const emb = embeddings[i]!;
      ids[i] = emb.id;

      // L2 normalize for cosine similarity (SIMD-accelerated)
      // For inner product metric, normalized vectors give cosine similarity
      const normalized = simdL2Normalize(emb.vector);

      // Direct copy into pre-allocated array (no intermediate arrays)
      vectors.set(normalized, i * dim);

      // Track ID for existence checks (content stored in LibSQL)
      this.idSet.add(emb.id);
    }
    pLog("F1_PREPARE_VECTORS");

    // Add to Faiss (pass Float32Array directly - gpu-client will handle)
    await this.client.faissAdd(this.getProjectKey(), ids, vectors);
    pLog("F2_FAISS_ADD");

    this.unsavedCount += count;

    log.d("FAISS", "Added embeddings", {
      count,
      unsaved: this.unsavedCount,
    });

    // Background auto-save (non-blocking for better throughput)
    if (this.unsavedCount >= this.config.autoSaveThreshold && !this.saveScheduled) {
      this.saveScheduled = true;
      // Fire-and-forget save in background
      this.pendingSave = this.save()
        .catch((err) => log.w("FAISS", "Background save failed", { error: (err as Error).message }))
        .finally(() => {
          this.saveScheduled = false;
          this.pendingSave = null;
        });
    }
  }

  /**
   * Wait for any pending background save to complete
   */
  async waitForPendingSave(): Promise<void> {
    if (this.pendingSave) {
      await this.pendingSave;
    }
  }

  // ===========================================================================
  // Search Operations
  // ===========================================================================

  /**
   * Search for similar vectors in Faiss
   * Returns only id + score. Content must be fetched from LibSQL separately.
   */
  async search(queryVector: Float32Array, limit = 10): Promise<SimilarityResult[]> {
    if (!this.client || !this.isInitialized) {
      throw new Error("FaissProvider not initialized");
    }

    // Normalize query for cosine similarity (must match indexed vectors)
    const normalizedQuery = simdL2Normalize(queryVector);
    const faissResults = await this.client.faissSearch(this.getProjectKey(), normalizedQuery, limit);

    // Convert to SimilarityResult format (content fetched from LibSQL by caller)
    return faissResults.map((r: FaissSearchResult) => ({
      id: r.id,
      similarity: r.score,
      content: "", // Content stored in LibSQL, not in Faiss
    }));
  }

  /**
   * Batch search for multiple query vectors
   * Returns only id + score. Content must be fetched from LibSQL separately.
   */
  async batchSearch(queryVectors: Float32Array[], limit = 10): Promise<SimilarityResult[][]> {
    if (!this.client || !this.isInitialized) {
      throw new Error("FaissProvider not initialized");
    }

    const dim = this.config.dimensions;
    const count = queryVectors.length;

    // Pre-allocate and normalize all query vectors (SIMD-accelerated)
    const flatVectors = new Float32Array(count * dim);
    for (let i = 0; i < count; i++) {
      const normalized = simdL2Normalize(queryVectors[i]!);
      flatVectors.set(normalized, i * dim);
    }

    const faissResults = await this.client.faissBatchSearch(this.getProjectKey(), flatVectors, count, limit);

    // Convert results (content fetched from LibSQL by caller)
    return faissResults.map((queryResults: FaissSearchResult[]) =>
      queryResults.map((r: FaissSearchResult) => ({
        id: r.id,
        similarity: r.score,
        content: "", // Content stored in LibSQL, not in Faiss
      })),
    );
  }

  // ===========================================================================
  // Persistence
  // ===========================================================================

  /**
   * Save Faiss index and content cache to disk
   */
  async save(): Promise<void> {
    if (!this.client || !this.isInitialized) {
      throw new Error("FaissProvider not initialized");
    }

    if (this.unsavedCount === 0) return;

    try {
      // Ensure directory exists
      const dir = dirname(this.config.persistPath);
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }

      await this.client.faissSave(this.getProjectKey(), this.config.persistPath);

      // Save ID set alongside index
      this.saveIdSet();

      // Save index metadata (dimensions, etc.) for dimension compatibility check
      this.saveIndexMetadata();

      const savedCount = this.unsavedCount;
      this.unsavedCount = 0;
      this.lastSaveTime = Date.now();

      log.i("FAISS", "Index saved", {
        path: this.config.persistPath,
        savedCount,
        idSetSize: this.idSet.size,
      });
    } catch (error) {
      log.e("FAISS", "Failed to save index", { error: (error as Error).message });
      throw error;
    }
  }

  /**
   * Get ID set file path
   */
  private getIdSetPath(): string {
    return `${this.config.persistPath}.ids.json`;
  }

  /**
   * Save ID set to disk (lightweight - just IDs, no content)
   */
  private saveIdSet(): void {
    // Skip saving if no persist path configured (prevents .ids.json in root)
    if (!this.config.persistPath) {
      return;
    }

    const idSetPath = this.getIdSetPath();
    try {
      const ids = Array.from(this.idSet);
      writeFileSync(idSetPath, JSON.stringify(ids), "utf-8");
      log.d("FAISS", "ID set saved", { path: idSetPath, size: this.idSet.size });
    } catch (error) {
      log.w("FAISS", "Failed to save ID set", { error: (error as Error).message });
    }
  }

  /**
   * Load ID set from disk
   */
  private loadIdSet(): void {
    const idSetPath = this.getIdSetPath();
    if (!existsSync(idSetPath)) {
      // Try to load legacy content cache and extract IDs
      const legacyPath = `${this.config.persistPath}.content.json`;
      if (existsSync(legacyPath)) {
        try {
          const data = readFileSync(legacyPath, "utf-8");
          const cacheObj = JSON.parse(data) as Record<string, unknown>;
          this.idSet.clear();
          for (const id of Object.keys(cacheObj)) {
            this.idSet.add(id);
          }
          log.i("FAISS", "Migrated IDs from legacy content cache", { size: this.idSet.size });
          // Save as new format
          this.saveIdSet();
          return;
        } catch {
          // Ignore legacy load errors
        }
      }
      log.d("FAISS", "No ID set file found", { path: idSetPath });
      return;
    }

    try {
      const data = readFileSync(idSetPath, "utf-8");
      const ids = JSON.parse(data) as string[];

      this.idSet.clear();
      for (const id of ids) {
        this.idSet.add(id);
      }

      log.i("FAISS", "ID set loaded", { path: idSetPath, size: this.idSet.size });
    } catch (error) {
      log.w("FAISS", "Failed to load ID set", { error: (error as Error).message });
    }
  }

  /**
   * Get index metadata file path
   */
  private getMetadataPath(): string {
    return `${this.config.persistPath}.meta.json`;
  }

  /**
   * Save index metadata (dimensions, etc.)
   * Also creates faiss-base.meta.json on first save to mark base branch
   */
  private saveIndexMetadata(): void {
    if (!this.config.persistPath) return;

    const metaPath = this.getMetadataPath();
    try {
      const meta = {
        dimensions: this.config.dimensions,
        indexType: this.config.indexType,
        savedAt: Date.now(),
      };
      writeFileSync(metaPath, JSON.stringify(meta), "utf-8");
      log.d("FAISS", "Index metadata saved", { path: metaPath, dimensions: meta.dimensions });

      // Create faiss-base.meta.json if it doesn't exist (first indexing)
      this.ensureBaseMetadata();
    } catch (error) {
      log.w("FAISS", "Failed to save index metadata", { error: (error as Error).message });
    }
  }

  /**
   * Ensure faiss-base.meta.json exists (create on first indexing)
   * This marks which branch is the base for layered index support
   */
  private ensureBaseMetadata(): void {
    const baseMetaPath = getBaseMetaPathByHash(this.projectHash);

    if (existsSync(baseMetaPath)) {
      return; // Already exists
    }

    try {
      const baseMeta: BaseIndexMetadata = {
        baseBranch: this.branchName,
        vectorCount: this.idSet.size,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        dimensions: this.config.dimensions,
        indexType: this.config.indexType,
      };

      // Ensure directory exists
      const dir = dirname(baseMetaPath);
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }

      writeFileSync(baseMetaPath, JSON.stringify(baseMeta, null, 2), "utf-8");
      log.i("FAISS", "Base metadata created", {
        branch: this.branchName,
        path: baseMetaPath,
        vectors: this.idSet.size,
      });
    } catch (error) {
      log.w("FAISS", "Failed to create base metadata", { error: (error as Error).message });
    }
  }

  /**
   * Load index metadata
   */
  private loadIndexMetadata(): { dimensions: number; indexType: string } | null {
    const metaPath = this.getMetadataPath();
    if (!existsSync(metaPath)) {
      return null;
    }

    try {
      const data = readFileSync(metaPath, "utf-8");
      return JSON.parse(data) as { dimensions: number; indexType: string };
    } catch (error) {
      log.w("FAISS", "Failed to load index metadata", { error: (error as Error).message });
      return null;
    }
  }

  /**
   * Delete all index files (index, ID set, metadata)
   */
  private deleteIndexFiles(): void {
    const filesToDelete = [this.config.persistPath, this.getIdSetPath(), this.getMetadataPath()];

    for (const filePath of filesToDelete) {
      if (filePath && existsSync(filePath)) {
        try {
          unlinkSync(filePath);
          log.d("FAISS", "Deleted index file", { path: filePath });
        } catch (error) {
          log.w("FAISS", "Failed to delete file", { path: filePath, error: (error as Error).message });
        }
      }
    }

    // Clear in-memory state
    this.idSet.clear();
    this.unsavedCount = 0;
  }

  /**
   * Force flush and save (compatibility method)
   */
  async flush(): Promise<number> {
    // Wait for any background save first
    await this.waitForPendingSave();

    const count = this.unsavedCount;
    if (count > 0) {
      await this.save();
    }
    return count;
  }

  /**
   * Flush and save (alias for vector-store compatibility)
   */
  async flushAndSave(): Promise<void> {
    await this.waitForPendingSave();
    await this.save();
  }

  // ===========================================================================
  // Index Maintenance
  // ===========================================================================

  /**
   * Train IVF/PQ indexes (required before adding vectors)
   */
  async train(trainingVectors: Float32Array[]): Promise<void> {
    if (!this.client || !this.isInitialized) {
      throw new Error("FaissProvider not initialized");
    }

    const flatVectors: number[] = [];
    for (const v of trainingVectors) {
      flatVectors.push(...Array.from(v));
    }

    await this.client.faissTrain(this.getProjectKey(), new Float32Array(flatVectors), trainingVectors.length);
    log.i("FAISS", "Trained index", { vectorCount: trainingVectors.length });
  }

  // ===========================================================================
  // Statistics
  // ===========================================================================

  async getStats(): Promise<{
    totalVectors: number;
    unsavedCount: number;
    lastSaveTime: number;
    idSetSize: number;
    faissStats: Awaited<ReturnType<IFaissClient["getStats"]>> | null;
  }> {
    const faissStats = this.client ? await this.client.getStats() : null;

    return {
      totalVectors: (faissStats as { totalVectors?: number })?.totalVectors ?? 0,
      unsavedCount: this.unsavedCount,
      lastSaveTime: this.lastSaveTime,
      idSetSize: this.idSet.size,
      faissStats: faissStats as Awaited<ReturnType<IFaissClient["getStats"]>> | null,
    };
  }

  isReady(): boolean {
    return this.isInitialized && this.client?.isRunning() === true;
  }

  /**
   * Get total vector count
   */
  async getVectorCount(): Promise<number> {
    const stats = await this.getStats();
    return stats.totalVectors;
  }

  /**
   * Check which IDs already exist in the ID set
   * Used for incremental indexing to skip already-indexed entities
   */
  getExistingIds(ids: string[]): Set<string> {
    const existing = new Set<string>();
    for (const id of ids) {
      if (this.idSet.has(id)) {
        existing.add(id);
      }
    }
    return existing;
  }

  /**
   * Check if an ID exists in the ID set
   */
  hasId(id: string): boolean {
    return this.idSet.has(id);
  }

  /**
   * Remove embeddings by IDs (for re-indexing changed files)
   */
  async remove(ids: string[]): Promise<void> {
    if (!this.client || !this.isInitialized) {
      throw new Error("FaissProvider not initialized");
    }

    // Remove from Faiss
    await this.client.faissRemove(this.getProjectKey(), ids);

    // Remove from ID set
    for (const id of ids) {
      this.idSet.delete(id);
    }

    log.d("FAISS", "Removed embeddings", { count: ids.length });
  }
}

// =============================================================================
// Singleton Instance
// =============================================================================

let faissProvider: FaissProvider | null = null;

export function getFaissProvider(config?: Partial<FaissProviderConfig>): FaissProvider {
  if (!faissProvider) {
    faissProvider = new FaissProvider(config);
  }
  return faissProvider;
}

export async function initializeFaissProvider(config?: Partial<FaissProviderConfig>): Promise<FaissProvider | null> {
  const provider = getFaissProvider(config);
  const success = await provider.initialize();
  return success ? provider : null;
}

export async function shutdownFaissProvider(): Promise<void> {
  if (faissProvider) {
    await faissProvider.close();
    faissProvider = null;
  }
}

export { FaissProvider };
