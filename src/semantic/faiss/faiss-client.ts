/**
 * Faiss Client - Unified client for Faiss operations
 *
 * Uses faiss-napi which works directly under both Node.js and Bun.
 * No subprocess needed - NAPI bindings are runtime-agnostic.
 */

import { existsSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { log } from "../../logging/index.js";
import { getDataDir } from "../../shared/storage-paths.js";
import { isBunRuntime } from "../../utils/runtime.js";
import type {
  FaissAddResponse,
  FaissIndexConfig,
  FaissInitResponse,
  FaissLoadResponse,
  FaissSaveResponse,
  FaissSearchResult,
  FaissStatsResponse,
  FaissTrainResponse,
} from "./types.js";

// faiss-napi MetricType enum (from faiss/MetricType.h)
enum MetricType {
  METRIC_INNER_PRODUCT = 0,
  METRIC_L2 = 1,
}

// faiss-napi type declaration
type FaissNapiModule = {
  Index: {
    new (dimensions: number): FaissIndex;
    fromFactory: (dimensions: number, factoryString: string, metricType?: MetricType) => FaissIndex;
    fromBuffer: (buffer: Buffer) => FaissIndex;
    read: (path: string) => FaissIndex;
  };
  IndexFlatL2: new (dimensions: number) => FaissIndex;
  IndexFlatIP: new (dimensions: number) => FaissIndex;
  IndexHNSW: new (dimensions: number, m?: number, metric?: MetricType) => FaissIndex;
  MetricType: typeof MetricType;
};

interface FaissIndex {
  ntotal: number;
  dims: number;
  isTrained: boolean;
  add(vectors: number[]): void;
  search(vector: number[], k: number): { labels: bigint[]; distances: number[] };
  train(vectors: number[]): void;
  write(path: string): void;
  toBuffer(): Buffer;
}

// =============================================================================
// Common Interface
// =============================================================================

export interface IFaissClient {
  start(): Promise<boolean>;
  stop(): Promise<void>;
  initialize(config: FaissIndexConfig, loadPath?: string): Promise<FaissInitResponse>;
  add(ids: string[], vectors: Float32Array | number[]): Promise<FaissAddResponse>;
  search(vector: Float32Array | number[], k: number): Promise<FaissSearchResult[]>;
  batchSearch(vectors: Float32Array | number[], nQueries: number, k: number): Promise<FaissSearchResult[][]>;
  train(vectors: Float32Array | number[], nVectors: number): Promise<FaissTrainResponse>;
  save(path?: string): Promise<FaissSaveResponse>;
  load(path: string): Promise<FaissLoadResponse>;
  remove(ids: string[]): Promise<void>;
  getStats(): Promise<FaissStatsResponse["stats"]>;
  isRunning(): boolean;
}

// =============================================================================
// Faiss Client (uses faiss-napi directly - works under Node.js and Bun)
// =============================================================================

class FaissNapiClient implements IFaissClient {
  private faiss: FaissNapiModule | null = null;
  private index: FaissIndex | null = null;
  private config: FaissIndexConfig | null = null;
  private isInitialized = false;
  private totalVectors = 0;

  // ID mapping (string ID -> internal faiss ID)
  private idMap = new Map<string, number>();
  private reverseIdMap = new Map<number, string>();

  async start(): Promise<boolean> {
    const isBun = isBunRuntime();

    try {
      // Try standard import first (works in unbundled environments)
      const mod = await import("faiss-napi");
      // ESM import may wrap CommonJS exports in 'default'
      this.faiss = (mod.default ?? mod) as unknown as FaissNapiModule;

      // Verify the module loaded correctly (has Index class)
      if (typeof this.faiss?.Index?.fromFactory === "function") {
        log.i("FAISS", "Loaded faiss-napi", {
          runtime: isBun ? "Bun" : "Node.js",
          available: Object.keys(this.faiss),
        });
        return true;
      }

      // Module loaded but Index not available - try alternative loading
      throw new Error("Index.fromFactory not available, trying alternative");
    } catch (error) {
      log.w("FAISS", "Standard import failed, trying createRequire", {
        error: (error as Error).message,
      });
    }

    // Fallback: use createRequire with explicit path for bundled environments
    try {
      const { createRequire } = await import("node:module");

      // Find the actual faiss-napi package location
      const searchPaths = [
        join(process.cwd(), "node_modules", "faiss-napi"),
        join(process.cwd(), "..", "node_modules", "faiss-napi"),
      ];

      for (const searchPath of searchPaths) {
        const indexPath = join(searchPath, "lib", "index.js");
        if (existsSync(indexPath)) {
          const require = createRequire(indexPath);
          const faissModule = require(indexPath);
          this.faiss = faissModule as unknown as FaissNapiModule;

          if (typeof this.faiss?.Index?.fromFactory === "function") {
            log.i("FAISS", "Loaded faiss-napi via createRequire", {
              runtime: isBun ? "Bun" : "Node.js",
              path: searchPath,
              available: Object.keys(this.faiss),
            });
            return true;
          }
        }
      }

      throw new Error("Could not locate faiss-napi with valid Index class");
    } catch (error) {
      log.e("FAISS", "Failed to load faiss-napi", { error: (error as Error).message });
      return false;
    }
  }

  async stop(): Promise<void> {
    // Clear large maps to free memory
    const mapSize = this.idMap.size;
    this.idMap.clear();
    this.reverseIdMap.clear();

    // Clear native index reference (triggers C++ destructor)
    this.index = null;
    this.faiss = null;
    this.config = null;
    this.totalVectors = 0;
    this.isInitialized = false;

    log.i("FAISS", "Stopped and cleared", { freedMaps: mapSize });
  }

  async initialize(config: FaissIndexConfig, loadPath?: string): Promise<FaissInitResponse> {
    if (!this.faiss) {
      throw new Error("faiss-napi not loaded");
    }

    this.config = config;

    // Try to load existing index
    if (loadPath && existsSync(loadPath)) {
      try {
        this.index = this.faiss.Index.read(loadPath);
        this.totalVectors = this.index.ntotal;
        this.isInitialized = true;

        // Load ID map if exists
        const idMapPath = `${loadPath}.idmap.json`;
        if (existsSync(idMapPath)) {
          const data = JSON.parse(readFileSync(idMapPath, "utf-8"));
          this.idMap = new Map(Object.entries(data.idMap).map(([k, v]) => [k, v as number]));
          this.reverseIdMap = new Map(Array.from(this.idMap.entries()).map(([k, v]) => [v, k]));
        }

        // Log memory after loading index
        const mem = process.memoryUsage();
        const idMapSizeMB = (this.idMap.size * 100) / 1024 / 1024; // rough estimate: 100 bytes per entry
        log.i("FAISS", "Loaded index", {
          path: loadPath,
          vectors: this.totalVectors,
          idMapSize: this.idMap.size,
          idMapSizeMB: idMapSizeMB.toFixed(1),
          rssMB: Math.round(mem.rss / 1024 / 1024),
          externalMB: Math.round(mem.external / 1024 / 1024),
        });
        return {
          success: true,
          type: "init",
          indexType: config.indexType,
          dimensions: config.dimensions,
          loadedVectors: this.totalVectors,
        };
      } catch (error) {
        log.e("FAISS", "Failed to load index", { error: (error as Error).message });
      }
    }

    // Create new index
    this.createIndex(config);
    this.isInitialized = true;

    return {
      success: true,
      type: "init",
      indexType: config.indexType,
      dimensions: config.dimensions,
    };
  }

  private createIndex(config: FaissIndexConfig): void {
    if (!this.faiss) throw new Error("faiss-napi not loaded");

    const { dimensions, indexType, metric } = config;

    // Determine metric type enum for faiss-napi
    const metricEnum = metric === "ip" || metric === "cosine" ? MetricType.METRIC_INNER_PRODUCT : MetricType.METRIC_L2;

    let factoryString: string;

    switch (indexType) {
      case "flat":
        factoryString = "Flat";
        break;

      case "hnsw": {
        const M = config.hnswM ?? 32;
        factoryString = `HNSW${M},Flat`;
        break;
      }

      case "ivf": {
        const nlist = config.ivfNlist ?? 100;
        factoryString = `IVF${nlist},Flat`;
        break;
      }

      case "ivfpq": {
        const nlist = config.ivfNlist ?? 100;
        const pqM = config.pqM ?? 8;
        const pqNbits = config.pqNbits ?? 8;
        factoryString = `IVF${nlist},PQ${pqM}x${pqNbits}`;
        break;
      }

      case "ivfsq": {
        const nlist = config.ivfNlist ?? 256;
        const bits = (config as { sqBits?: number }).sqBits ?? 8;
        factoryString = `IVF${nlist},SQ${bits}`;
        break;
      }

      default:
        throw new Error(`Unknown index type: ${indexType}`);
    }

    this.index = this.faiss.Index.fromFactory(dimensions, factoryString, metricEnum);
    log.i("FAISS", "Created index via factory", {
      factoryString,
      indexType,
      dimensions,
      metric: metricEnum === MetricType.METRIC_INNER_PRODUCT ? "IP" : "L2",
    });
  }

  async add(ids: string[], vectors: Float32Array | number[]): Promise<FaissAddResponse> {
    if (!this.index || !this.config) throw new Error("Index not initialized");

    const startTime = performance.now();
    const count = ids.length;

    // faiss-napi expects number[], not Float32Array (IsArray check fails for TypedArray)
    const vectorArray = Array.isArray(vectors) ? vectors : Array.from(vectors);
    this.index.add(vectorArray);
    const afterAdd = performance.now();

    // Update ID maps (pre-calculate base offset)
    // CRITICAL: Remove old internalId from reverseIdMap if ID already exists
    // Otherwise duplicate entries cause duplicate search results
    const baseId = this.totalVectors;
    for (let i = 0; i < count; i++) {
      const id = ids[i]!;
      const oldInternalId = this.idMap.get(id);
      if (oldInternalId !== undefined) {
        // Remove stale reverse mapping (old vector stays in Faiss but won't be returned)
        this.reverseIdMap.delete(oldInternalId);
      }
      const internalId = baseId + i;
      this.idMap.set(id, internalId);
      this.reverseIdMap.set(internalId, id);
    }
    this.totalVectors += count;

    const endTime = performance.now();
    log.i("FAISS", "add", {
      count,
      addMs: (afterAdd - startTime).toFixed(1),
      mapMs: (endTime - afterAdd).toFixed(1),
      totalMs: (endTime - startTime).toFixed(1),
    });

    return {
      success: true,
      type: "add",
      addedCount: count,
      totalVectors: this.totalVectors,
      addTimeMs: endTime - startTime,
    };
  }

  async search(vector: Float32Array | number[], k: number): Promise<FaissSearchResult[]> {
    if (!this.index) throw new Error("Index not initialized");

    const queryVector = vector instanceof Float32Array ? Array.from(vector) : vector;
    const actualK = Math.min(k, this.totalVectors);

    if (actualK === 0) return [];

    const result = this.index.search(queryVector, actualK);
    const { distances, labels } = result;

    const results: FaissSearchResult[] = [];
    for (let i = 0; i < actualK; i++) {
      const labelBigInt = labels[i];
      if (labelBigInt === undefined || labelBigInt === BigInt(-1)) continue;

      const internalId = Number(labelBigInt);
      const externalId = this.reverseIdMap.get(internalId);
      if (!externalId) continue;

      const distance = distances[i];
      if (distance === undefined) continue;
      const score = 1 / (1 + distance);

      results.push({ id: externalId, distance, score });
    }

    return results;
  }

  async batchSearch(vectors: Float32Array | number[], nQueries: number, k: number): Promise<FaissSearchResult[][]> {
    if (!this.index || !this.config) throw new Error("Index not initialized");

    const queryVectors = vectors instanceof Float32Array ? Array.from(vectors) : vectors;
    const actualK = Math.min(k, this.totalVectors);

    if (actualK === 0) return Array(nQueries).fill([]);

    // faiss-napi batch search: vectors is flat array of size nQueries * dimensions
    // Result contains labels/distances of size nQueries * k
    const result = this.index.search(queryVectors, actualK);
    const { distances, labels } = result;

    const results: FaissSearchResult[][] = [];
    for (let q = 0; q < nQueries; q++) {
      const queryResults: FaissSearchResult[] = [];
      for (let i = 0; i < actualK; i++) {
        const idx = q * actualK + i;
        const labelBigInt = labels[idx];
        if (labelBigInt === undefined || labelBigInt === BigInt(-1)) continue;

        const internalId = Number(labelBigInt);
        const externalId = this.reverseIdMap.get(internalId);
        if (!externalId) continue;

        const distance = distances[idx];
        if (distance === undefined) continue;
        const score = 1 / (1 + distance);

        queryResults.push({ id: externalId, distance, score });
      }
      results.push(queryResults);
    }

    return results;
  }

  async train(vectors: Float32Array | number[], nVectors: number): Promise<FaissTrainResponse> {
    if (!this.index) throw new Error("Index not initialized");

    const startTime = performance.now();
    const trainingData = vectors instanceof Float32Array ? Array.from(vectors) : vectors;

    if (this.index.train) {
      this.index.train(trainingData);
    }

    return {
      success: true,
      type: "train",
      trainedOn: nVectors,
      trainTimeMs: performance.now() - startTime,
    };
  }

  async save(path?: string): Promise<FaissSaveResponse> {
    if (!this.index) throw new Error("Index not initialized");

    const savePath = path || join(getDataDir(), "faiss-index.bin");
    this.index.write(savePath);

    // Save ID map
    const idMapPath = `${savePath}.idmap.json`;
    writeFileSync(
      idMapPath,
      JSON.stringify({
        idMap: Object.fromEntries(this.idMap),
        totalVectors: this.totalVectors,
      }),
    );

    const stats = statSync(savePath);
    log.i("FAISS", "Saved index", { path: savePath, sizeBytes: stats.size });

    return {
      success: true,
      type: "save",
      path: savePath,
      sizeBytes: stats.size,
    };
  }

  async load(path: string): Promise<FaissLoadResponse> {
    if (!this.faiss) throw new Error("faiss-napi not loaded");

    this.index = this.faiss.Index.read(path);
    this.totalVectors = this.index.ntotal;

    // Load ID map
    const idMapPath = `${path}.idmap.json`;
    if (existsSync(idMapPath)) {
      const data = JSON.parse(readFileSync(idMapPath, "utf-8"));
      this.idMap = new Map(Object.entries(data.idMap).map(([k, v]) => [k, v as number]));
      this.reverseIdMap = new Map(Array.from(this.idMap.entries()).map(([k, v]) => [v, k]));
    }

    this.isInitialized = true;

    return {
      success: true,
      type: "load",
      path,
      loadedVectors: this.totalVectors,
    };
  }

  async remove(ids: string[]): Promise<void> {
    // Faiss doesn't support direct removal, just remove from ID maps
    for (const id of ids) {
      const internalId = this.idMap.get(id);
      if (internalId !== undefined) {
        this.idMap.delete(id);
        this.reverseIdMap.delete(internalId);
      }
    }
  }

  async getStats(): Promise<FaissStatsResponse["stats"]> {
    const memoryUsageMB = this.config ? (this.totalVectors * this.config.dimensions * 4) / 1024 / 1024 : 0;

    return {
      indexType: this.config?.indexType ?? "flat",
      dimensions: this.config?.dimensions ?? 0,
      totalVectors: this.totalVectors,
      memoryUsageMB,
      isTrained: true,
    };
  }

  isRunning(): boolean {
    return this.isInitialized;
  }
}

// =============================================================================
// Factory and Singleton
// =============================================================================

let faissClient: IFaissClient | null = null;

/**
 * Get Faiss client (works under both Node.js and Bun via faiss-napi)
 */
export function getFaissClient(): IFaissClient {
  if (!faissClient) {
    const isBun = isBunRuntime();
    log.i("FAISS", `Initializing client (${isBun ? "Bun" : "Node.js"} runtime)`);
    faissClient = new FaissNapiClient();
  }
  return faissClient;
}

export async function shutdownFaissClient(): Promise<void> {
  if (faissClient) {
    await faissClient.stop();
    faissClient = null;
  }
}

// Export class for direct use if needed
export { FaissNapiClient };

// Legacy aliases
export const FaissDirectClient = FaissNapiClient;
export const FaissSubprocessClient = FaissNapiClient;
export const FaissClient = FaissNapiClient;
