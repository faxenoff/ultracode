/**
 * Embedding Router - Batch aggregation for GPU subprocess
 *
 * Collects embeddings from multiple workers and sends them to GPU subprocess
 * in optimized batches. Non-blocking async interface.
 *
 * Architecture:
 * - Workers → EmbeddingRouter.addBatch() → aggregation buffer
 * - Periodic/threshold flush → GPU subprocess (embeddings.addBatch)
 * - Search requests → GPU subprocess (embeddings.search)
 *
 * @task_id UNIFIED-GPU-001
 */

import { log } from "../logging/index.js";
import { getGpuClient, type IGpuClient } from "./gpu/gpu-client.js";
import type { EmbeddingItem } from "./gpu/types.js";

// =============================================================================
// Configuration
// =============================================================================

export interface EmbeddingRouterConfig {
  /** Maximum batch size before auto-flush (default: 500) */
  batchSize?: number | undefined;
  /** Flush interval in ms (default: 5000) */
  flushIntervalMs?: number;
  /** Dimensions for index initialization (default: 384) */
  dimensions?: number;
  /** Index type (default: "ivfsq") */
  indexType?: "flat" | "hnsw" | "ivf" | "ivfpq" | "ivfsq";
  /** HNSW M parameter (default: 32) */
  hnswM?: number;
  /** Path to persist index */
  persistPath?: string;
}

const DEFAULT_CONFIG: Required<EmbeddingRouterConfig> = {
  batchSize: 500,
  flushIntervalMs: 5000,
  dimensions: 384,
  indexType: "ivfsq",
  hnswM: 32,
  persistPath: "",
};

// =============================================================================
// Embedding Router
// =============================================================================

export class EmbeddingRouter {
  private config: Required<EmbeddingRouterConfig>;
  private gpuClient: IGpuClient | null = null;
  private pendingItems: EmbeddingItem[] = [];
  private flushTimer: ReturnType<typeof setInterval> | null = null;
  private isInitialized = false;
  private isFlushing = false;
  private pendingFlush: Promise<void> | null = null;

  // Statistics
  private stats = {
    totalAdded: 0,
    totalFlushed: 0,
    flushCount: 0,
    lastFlushTime: 0,
    avgFlushTimeMs: 0,
  };

  constructor(config: Partial<EmbeddingRouterConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  // ===========================================================================
  // Lifecycle
  // ===========================================================================

  /**
   * Initialize the router and GPU client
   */
  async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;

    try {
      log.i("ROUTER", "Initializing...");

      // Get GPU client (will be subprocess under Bun, direct under Node)
      this.gpuClient = getGpuClient();
      const started = await this.gpuClient.start();

      if (!started) {
        log.e("ROUTER", "Failed to start GPU client");
        return false;
      }

      // Initialize Faiss index
      await this.gpuClient.faissInitialize(
        "_router",
        {
          dimensions: this.config.dimensions,
          indexType: this.config.indexType,
          metric: "l2",
          hnswM: this.config.hnswM,
        },
        this.config.persistPath || undefined,
      );

      // Start flush timer
      this.startFlushTimer();

      this.isInitialized = true;
      log.i("ROUTER", "Initialized", {
        dimensions: this.config.dimensions,
        indexType: this.config.indexType,
        batchSize: this.config.batchSize,
        flushIntervalMs: this.config.flushIntervalMs,
      });

      return true;
    } catch (error) {
      log.e("ROUTER", "Initialization failed", { error: (error as Error).message });
      return false;
    }
  }

  /**
   * Close the router and GPU client
   */
  async close(): Promise<void> {
    this.stopFlushTimer();

    // Flush any pending items
    if (this.pendingItems.length > 0) {
      await this.flush();
    }

    this.isInitialized = false;
    log.i("ROUTER", "Closed", { stats: this.stats });
  }

  // ===========================================================================
  // Batch Operations
  // ===========================================================================

  /**
   * Add embeddings to pending batch (non-blocking)
   * Will auto-flush when batch size threshold is reached
   */
  async addBatch(items: EmbeddingItem[]): Promise<void> {
    if (!this.isInitialized) {
      throw new Error("EmbeddingRouter not initialized");
    }

    if (items.length === 0) return;

    // Add to pending buffer
    this.pendingItems.push(...items);
    this.stats.totalAdded += items.length;

    log.d("ROUTER", "Added to batch", {
      added: items.length,
      pending: this.pendingItems.length,
    });

    // Check if we should flush
    if (this.pendingItems.length >= this.config.batchSize) {
      // Non-blocking flush (fire and forget)
      this.triggerFlush();
    }
  }

  /**
   * Add single embedding to pending batch
   */
  async add(item: EmbeddingItem): Promise<void> {
    return this.addBatch([item]);
  }

  /**
   * Trigger async flush (non-blocking)
   */
  private triggerFlush(): void {
    if (this.isFlushing) return;

    // Start flush in background
    this.pendingFlush = this.flush().catch((err) => {
      log.w("ROUTER", "Background flush failed", { error: (err as Error).message });
    });
  }

  /**
   * Flush pending embeddings to GPU subprocess
   */
  async flush(): Promise<void> {
    if (this.isFlushing) {
      // Wait for current flush to complete
      if (this.pendingFlush) {
        await this.pendingFlush;
      }
      return;
    }

    if (this.pendingItems.length === 0) return;

    this.isFlushing = true;
    const startTime = performance.now();
    const itemsToFlush = this.pendingItems;
    this.pendingItems = [];

    try {
      if (!this.gpuClient) {
        throw new Error("GPU client not available");
      }

      // Convert to format expected by GPU worker
      const ids: string[] = [];
      const vectors: number[] = [];

      for (const item of itemsToFlush) {
        ids.push(item.id);
        // Flatten vector
        for (let i = 0; i < item.vector.length; i++) {
          vectors.push(item.vector[i]!);
        }
      }

      // Add to Faiss via GPU client
      await this.gpuClient.faissAdd("_router", ids, vectors);

      const flushTime = performance.now() - startTime;
      this.stats.totalFlushed += itemsToFlush.length;
      this.stats.flushCount++;
      this.stats.lastFlushTime = Date.now();

      // Update running average
      this.stats.avgFlushTimeMs =
        (this.stats.avgFlushTimeMs * (this.stats.flushCount - 1) + flushTime) / this.stats.flushCount;

      log.i("ROUTER", "Flushed", {
        count: itemsToFlush.length,
        flushTimeMs: flushTime.toFixed(1),
        totalFlushed: this.stats.totalFlushed,
      });
    } catch (error) {
      // Put items back in queue on failure
      this.pendingItems = itemsToFlush.concat(this.pendingItems);
      log.e("ROUTER", "Flush failed", { error: (error as Error).message });
      throw error;
    } finally {
      this.isFlushing = false;
      this.pendingFlush = null;
    }
  }

  /**
   * Wait for any pending flush to complete
   */
  async waitForFlush(): Promise<void> {
    if (this.pendingFlush) {
      await this.pendingFlush;
    }
  }

  // ===========================================================================
  // Search Operations
  // ===========================================================================

  /**
   * Search for similar embeddings
   */
  async search(
    vector: Float32Array | number[],
    k: number = 10,
  ): Promise<Array<{ id: string; score: number; content?: string | undefined; metadata?: Record<string, unknown> }>> {
    if (!this.isInitialized || !this.gpuClient) {
      throw new Error("EmbeddingRouter not initialized");
    }

    // Ensure pending items are flushed before search
    if (this.pendingItems.length > 0) {
      await this.flush();
    }

    const results = await this.gpuClient.faissSearch("_router", vector, k);

    return results.map((r) => ({
      id: r.id,
      score: r.score,
    }));
  }

  /**
   * Batch search for multiple query vectors
   */
  async batchSearch(
    vectors: (Float32Array | number[])[],
    k: number = 10,
  ): Promise<Array<Array<{ id: string; score: number }>>> {
    if (!this.isInitialized || !this.gpuClient) {
      throw new Error("EmbeddingRouter not initialized");
    }

    // Ensure pending items are flushed before search
    if (this.pendingItems.length > 0) {
      await this.flush();
    }

    const flatVectors: number[] = [];

    for (const v of vectors) {
      const arr = v instanceof Float32Array ? Array.from(v) : v;
      flatVectors.push(...arr);
    }

    const results = await this.gpuClient.faissBatchSearch("_router", flatVectors, vectors.length, k);

    return results.map((queryResults) =>
      queryResults.map((r) => ({
        id: r.id,
        score: r.score,
      })),
    );
  }

  // ===========================================================================
  // Persistence
  // ===========================================================================

  /**
   * Save index to disk
   */
  async save(path?: string): Promise<void> {
    if (!this.gpuClient) return;

    // Flush pending items first
    if (this.pendingItems.length > 0) {
      await this.flush();
    }

    const savePath = path || this.config.persistPath;
    if (savePath) {
      await this.gpuClient.faissSave("_router", savePath);
      log.i("ROUTER", "Index saved", { path: savePath });
    }
  }

  /**
   * Load index from disk
   */
  async load(path: string): Promise<void> {
    if (!this.gpuClient) {
      throw new Error("GPU client not available");
    }

    await this.gpuClient.faissLoad("_router", path);
    log.i("ROUTER", "Index loaded", { path });
  }

  // ===========================================================================
  // Timer Management
  // ===========================================================================

  private startFlushTimer(): void {
    if (this.flushTimer) return;

    this.flushTimer = setInterval(() => {
      if (this.pendingItems.length > 0 && !this.isFlushing) {
        this.triggerFlush();
      }
    }, this.config.flushIntervalMs);

    // Don't keep process alive just for flush timer
    this.flushTimer.unref();
  }

  private stopFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
  }

  // ===========================================================================
  // Statistics
  // ===========================================================================

  /**
   * Get router statistics
   */
  getStats(): typeof this.stats & { pendingCount: number; isInitialized: boolean } {
    return {
      ...this.stats,
      pendingCount: this.pendingItems.length,
      isInitialized: this.isInitialized,
    };
  }

  /**
   * Check if router is ready
   */
  isReady(): boolean {
    return this.isInitialized && this.gpuClient !== null;
  }
}

// =============================================================================
// Singleton Instance
// =============================================================================

let embeddingRouter: EmbeddingRouter | null = null;

export function getEmbeddingRouter(config?: Partial<EmbeddingRouterConfig>): EmbeddingRouter {
  if (!embeddingRouter) {
    embeddingRouter = new EmbeddingRouter(config);
  }
  return embeddingRouter;
}

export async function initializeEmbeddingRouter(
  config?: Partial<EmbeddingRouterConfig>,
): Promise<EmbeddingRouter | null> {
  const router = getEmbeddingRouter(config);
  const success = await router.initialize();
  return success ? router : null;
}

export async function shutdownEmbeddingRouter(): Promise<void> {
  if (embeddingRouter) {
    await embeddingRouter.close();
    embeddingRouter = null;
  }
}

export { EmbeddingRouter as EmbeddingRouterClass };
