/**
 * Faiss Request Handlers — Multi-Index Pool (Native FAISS Addon)
 *
 * Handles all Faiss index operations using the native FAISS addon
 * (ultracode_cuda.node compiled with ENABLE_FAISS_CPU).
 * Replaces faiss-napi entirely — indexes are managed in C++ by projectKey.
 *
 * Features:
 * - Index creation via factory strings (Flat, HNSW, IVF, SQ, PQ)
 * - Per-project index isolation with LRU eviction
 * - IVF auto-training with vector buffering
 * - Save/load persistence with ID map serialization
 */

import { existsSync, readFileSync, statSync, writeFileSync } from "node:fs";

import type {
  FaissAddResponse,
  FaissBatchSearchResponse,
  FaissIndexConfig,
  FaissIndexType,
  FaissInitResponse,
  FaissLoadResponse,
  FaissRemoveResponse,
  FaissSaveResponse,
  FaissSearchResponse,
  FaissStatsResponse,
  FaissTrainResponse,
  GpuWorkerResponse,
  GpuWorkerState,
  IndexEntry,
  NativeFaissAddon,
} from "./types.js";

// =============================================================================
// Types
// =============================================================================

export interface FaissHandlerContext {
  nativeFaiss: NativeFaissAddon | null;
  state: GpuWorkerState;
  log: (message: string) => void;
  logError: (message: string) => void;
  sendResponse: (response: GpuWorkerResponse) => void;
  sendError: (error: string, requestId?: string) => void;
  setContentCachePath: (path: string) => void;
  loadContentCache: () => void;
  saveContentCache: () => void;
}

// =============================================================================
// Helper: check if index type requires training
// =============================================================================

function isIvfType(indexType: FaissIndexType): boolean {
  return indexType === "ivf" || indexType === "ivfpq" || indexType === "ivfsq";
}

// =============================================================================
// Helper: build FAISS factory string from config
// =============================================================================

function buildFactoryString(
  config: FaissIndexConfig,
  log: (msg: string) => void,
): { factory: string; isTrained: boolean } | null {
  const { indexType } = config;

  switch (indexType) {
    case "flat":
      return { factory: "Flat", isTrained: true };

    case "hnsw": {
      const M = config.hnswM ?? 32;
      log(`Creating HNSW index: M=${M}`);
      return { factory: `HNSW${M},Flat`, isTrained: true };
    }

    case "ivf": {
      const nlist = config.ivfNlist ?? 100;
      log(`Creating IVF index: nlist=${nlist} (needs training)`);
      return { factory: `IVF${nlist},Flat`, isTrained: false };
    }

    case "ivfpq": {
      const nlist = config.ivfNlist ?? 100;
      const pqM = config.pqM ?? 8;
      const pqNbits = config.pqNbits ?? 8;
      if (config.dimensions % pqM !== 0) {
        log(`ERROR: Dimensions (${config.dimensions}) must be divisible by pqM (${pqM})`);
        return null;
      }
      log(`Creating IVFPQ index: nlist=${nlist}, pqM=${pqM}, pqNbits=${pqNbits} (needs training)`);
      return { factory: `IVF${nlist},PQ${pqM}x${pqNbits}`, isTrained: false };
    }

    case "ivfsq": {
      const nlist = config.ivfNlist ?? 256;
      const bits = config.sqBits ?? 8;
      log(`Creating IVF,SQ${bits} index: nlist=${nlist} (needs training)`);
      return { factory: `IVF${nlist},SQ${bits}`, isTrained: false };
    }

    default:
      log(`ERROR: Unknown index type: ${indexType}`);
      return null;
  }
}

// =============================================================================
// IVF Auto-Training
// =============================================================================

/** Minimum training vectors = nlist * 39 (FAISS recommendation) */
function getMinTrainingVectors(config: FaissIndexConfig): number {
  const nlist = config.ivfNlist ?? 256;
  return nlist * 39;
}

/**
 * Auto-train an IVF index using buffered vectors, then bulk-add them.
 * Returns number of vectors added after training.
 */
function autoTrainAndFlush(
  entry: IndexEntry,
  projectKey: string,
  nativeFaiss: NativeFaissAddon,
  log: (msg: string) => void,
): number {
  const buf = entry.trainingBuffer;
  if (!buf || buf.ids.length === 0) return 0;

  const startTime = performance.now();
  const nVectors = buf.ids.length;
  const float32Vectors = new Float32Array(buf.vectors);

  // Train
  nativeFaiss.faissIndexTrain(projectKey, float32Vectors, nVectors);
  entry.isTrained = true;

  const trainTime = performance.now() - startTime;
  log(`[${projectKey}] Auto-trained IVF on ${nVectors} vectors in ${trainTime.toFixed(1)}ms`);

  // Bulk-add all buffered vectors
  const addStart = performance.now();
  nativeFaiss.faissIndexAdd(projectKey, float32Vectors, nVectors);

  const startId = entry.totalVectors;
  for (let i = 0; i < buf.ids.length; i++) {
    const internalId = startId + i;
    entry.idMap.set(buf.ids[i]!, internalId);
    entry.reverseIdMap.set(internalId, buf.ids[i]!);
  }
  entry.totalVectors += nVectors;
  entry.isDirty = true;

  const addTime = performance.now() - addStart;
  log(
    `[${projectKey}] Auto-added ${nVectors} buffered vectors in ${addTime.toFixed(1)}ms (total: ${entry.totalVectors})`,
  );

  // Clear buffer
  entry.trainingBuffer = null;

  return nVectors;
}

// =============================================================================
// Multi-Index Pool: getOrLoadIndex
// =============================================================================

function getIndexEntry(projectKey: string, state: GpuWorkerState, _log: (msg: string) => void): IndexEntry | undefined {
  const entry = state.indexPool.get(projectKey);
  if (entry) {
    entry.lastAccessedAt = Date.now();
    syncLegacyState(state, entry, projectKey);
    return entry;
  }
  return undefined;
}

/**
 * Evict LRU index entries if pool exceeds max size.
 * Dirty entries are saved before eviction.
 */
function evictIfNeeded(state: GpuWorkerState, nativeFaiss: NativeFaissAddon, log: (msg: string) => void): void {
  while (state.indexPool.size >= state.maxLoadedIndexes) {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, entry] of state.indexPool) {
      if (entry.lastAccessedAt < oldestTime) {
        oldestTime = entry.lastAccessedAt;
        oldestKey = key;
      }
    }

    if (!oldestKey) break;

    const evicted = state.indexPool.get(oldestKey)!;
    if (evicted.trainingBuffer && evicted.trainingBuffer.ids.length > 0) {
      log(
        `LRU eviction: dropping ${evicted.trainingBuffer.ids.length} buffered (untrained) vectors for '${oldestKey}'`,
      );
    }
    if (evicted.isDirty && evicted.contentCachePath) {
      try {
        nativeFaiss.faissIndexSave(oldestKey, evicted.contentCachePath);
        const idMapPath = `${evicted.contentCachePath}.idmap.json`;
        writeFileSync(
          idMapPath,
          JSON.stringify({
            idMap: Object.fromEntries(evicted.idMap),
            totalVectors: evicted.totalVectors,
          }),
        );
        log(`LRU eviction: saved dirty index '${oldestKey}' before removing`);
      } catch (error) {
        log(`LRU eviction: failed to save '${oldestKey}': ${(error as Error).message}`);
      }
    }

    // Free C++ memory
    try {
      nativeFaiss.faissIndexRemove(oldestKey);
    } catch {
      // Index may not exist in C++ if it was never created there
    }

    state.indexPool.delete(oldestKey);
    log(`LRU eviction: removed index '${oldestKey}' (pool size: ${state.indexPool.size})`);
  }
}

function syncLegacyState(state: GpuWorkerState, entry: IndexEntry, projectKey: string): void {
  state.faissInitialized = true;
  state.faissIndexType = entry.indexType;
  state.faissDimensions = entry.dimensions;
  state.faissTotalVectors = entry.totalVectors;
  state.faissIsTrained = entry.isTrained;
  state.faissIdMap = entry.idMap;
  state.faissReverseIdMap = entry.reverseIdMap;
  state.activeProjectKey = projectKey;
}

// =============================================================================
// Faiss Request Handlers
// =============================================================================

export async function handleFaissInit(
  request: { projectKey: string; config: FaissIndexConfig; loadPath?: string },
  ctx: FaissHandlerContext,
): Promise<void> {
  const { nativeFaiss, state, log, sendResponse, sendError, setContentCachePath, loadContentCache } = ctx;

  if (!nativeFaiss) {
    sendError("Native FAISS addon not available");
    return;
  }

  const { projectKey, config, loadPath } = request;

  // Evict if pool full
  evictIfNeeded(state, nativeFaiss, log);

  if (loadPath && existsSync(loadPath)) {
    try {
      const loadResult = nativeFaiss.faissIndexLoad(projectKey, loadPath);

      // Load ID maps if available
      const idMap = new Map<string, number>();
      const reverseIdMap = new Map<number, string>();
      const idMapPath = `${loadPath}.idmap.json`;
      if (existsSync(idMapPath)) {
        const data = JSON.parse(readFileSync(idMapPath, "utf-8"));
        for (const [k, v] of Object.entries(data.idMap)) {
          idMap.set(k, v as number);
          reverseIdMap.set(v as number, k);
        }
      }

      const entry: IndexEntry = {
        config,
        idMap,
        reverseIdMap,
        totalVectors: loadResult.loadedVectors,
        lastAccessedAt: Date.now(),
        isDirty: false,
        isTrained: loadResult.isTrained,
        dimensions: config.dimensions,
        indexType: config.indexType,
        contentCachePath: loadPath,
        trainingBuffer: null,
      };
      state.indexPool.set(projectKey, entry);

      syncLegacyState(state, entry, projectKey);

      setContentCachePath(loadPath);
      loadContentCache();

      log(`[${projectKey}] Loaded index from ${loadPath} with ${loadResult.loadedVectors} vectors`);

      const response: FaissInitResponse = {
        success: true,
        type: "faiss.init",
        indexType: config.indexType,
        dimensions: config.dimensions,
        loadedVectors: loadResult.loadedVectors,
      };
      sendResponse(response);
      return;
    } catch (error) {
      log(`[${projectKey}] Failed to load index from ${loadPath}: ${(error as Error).message}, creating new`);
    }
  }

  // Build factory string and create new index
  const factoryResult = buildFactoryString(config, log);
  if (!factoryResult) {
    sendError("Failed to build factory string for index");
    return;
  }

  const metricType = config.metric === "ip" || config.metric === "cosine" ? "IP" : "L2";

  try {
    const createResult = nativeFaiss.faissIndexCreate(projectKey, config.dimensions, factoryResult.factory, metricType);
    log(`Created Faiss index: ${factoryResult.factory}, metric=${metricType}, isTrained=${createResult.isTrained}`);

    const isTrained = createResult.isTrained;

    const entry: IndexEntry = {
      config,
      idMap: new Map(),
      reverseIdMap: new Map(),
      totalVectors: 0,
      lastAccessedAt: Date.now(),
      isDirty: false,
      isTrained,
      dimensions: config.dimensions,
      indexType: config.indexType,
      contentCachePath: loadPath ?? null,
      trainingBuffer: !isTrained && isIvfType(config.indexType) ? { ids: [], vectors: [] } : null,
    };
    state.indexPool.set(projectKey, entry);

    syncLegacyState(state, entry, projectKey);
    state.faissIsTrained = isTrained;

    if (loadPath) {
      setContentCachePath(loadPath);
    }

    const response: FaissInitResponse = {
      success: true,
      type: "faiss.init",
      indexType: config.indexType,
      dimensions: config.dimensions,
    };
    sendResponse(response);
  } catch (error) {
    sendError(`Failed to create index: ${(error as Error).message}`);
  }
}

export function handleFaissAdd(
  request: { projectKey: string; ids: string[]; vectors: number[] },
  ctx: FaissHandlerContext,
): void {
  const { nativeFaiss, state, log, sendResponse, sendError } = ctx;

  if (!nativeFaiss) {
    sendError("Native FAISS addon not available");
    return;
  }

  const entry = getIndexEntry(request.projectKey, state, log);
  if (!entry) {
    sendError(`Index not initialized for project: ${request.projectKey}`);
    return;
  }

  const { ids, vectors } = request;
  const startTime = performance.now();

  if (ids.length * entry.dimensions !== vectors.length) {
    sendError(`Vector count mismatch: ${ids.length} IDs, but vectors suggest ${vectors.length / entry.dimensions}`);
    return;
  }

  try {
    // IVF auto-training: buffer vectors until threshold, then train + bulk-add
    if (!entry.isTrained && isIvfType(entry.indexType)) {
      if (!entry.trainingBuffer) {
        entry.trainingBuffer = { ids: [], vectors: [] };
      }

      entry.trainingBuffer.ids.push(...ids);
      for (let i = 0; i < vectors.length; i++) {
        entry.trainingBuffer.vectors.push(vectors[i]!);
      }

      const bufferedCount = entry.trainingBuffer.ids.length;
      const minTraining = getMinTrainingVectors(entry.config);

      log(
        `[${request.projectKey}] IVF buffered ${ids.length} vectors (total buffered: ${bufferedCount}/${minTraining})`,
      );

      if (bufferedCount >= minTraining) {
        autoTrainAndFlush(entry, request.projectKey, nativeFaiss, log);
        state.faissTotalVectors = entry.totalVectors;
        state.faissIsTrained = true;
      }

      const addTimeMs = performance.now() - startTime;
      const response: FaissAddResponse = {
        success: true,
        type: "faiss.add",
        addedCount: ids.length,
        totalVectors: entry.totalVectors,
        addTimeMs,
      };
      sendResponse(response);
      return;
    }

    // Normal add (trained IVF or non-IVF index)
    const float32Vectors = new Float32Array(vectors);
    nativeFaiss.faissIndexAdd(request.projectKey, float32Vectors, ids.length);

    const startId = entry.totalVectors;
    for (let i = 0; i < ids.length; i++) {
      const internalId = startId + i;
      entry.idMap.set(ids[i]!, internalId);
      entry.reverseIdMap.set(internalId, ids[i]!);
    }

    entry.totalVectors += ids.length;
    entry.isDirty = true;

    state.faissTotalVectors = entry.totalVectors;

    const addTimeMs = performance.now() - startTime;
    log(
      `[${request.projectKey}] Added ${ids.length} vectors in ${addTimeMs.toFixed(1)}ms (total: ${entry.totalVectors})`,
    );

    const response: FaissAddResponse = {
      success: true,
      type: "faiss.add",
      addedCount: ids.length,
      totalVectors: entry.totalVectors,
      addTimeMs,
    };
    sendResponse(response);
  } catch (error) {
    sendError(`Failed to add vectors: ${(error as Error).message}`);
  }
}

export function handleFaissSearch(
  request: { projectKey: string; vector: number[]; k: number },
  ctx: FaissHandlerContext,
): void {
  const { nativeFaiss, state, log, sendResponse, sendError } = ctx;

  if (!nativeFaiss) {
    sendError("Native FAISS addon not available");
    return;
  }

  const entry = getIndexEntry(request.projectKey, state, log);
  if (!entry) {
    sendError(`Index not initialized for project: ${request.projectKey}`);
    return;
  }

  const { vector, k } = request;
  const startTime = performance.now();

  // Force-train IVF if there are buffered vectors
  if (!entry.isTrained && isIvfType(entry.indexType) && entry.trainingBuffer && entry.trainingBuffer.ids.length > 0) {
    const nlist = entry.config.ivfNlist ?? 256;
    const buffered = entry.trainingBuffer.ids.length;
    if (buffered >= nlist) {
      log(`[${request.projectKey}][search] Force-training IVF with ${buffered} buffered vectors (min nlist=${nlist})`);
      autoTrainAndFlush(entry, request.projectKey, nativeFaiss, log);
      state.faissTotalVectors = entry.totalVectors;
      state.faissIsTrained = true;
    } else {
      log(
        `[${request.projectKey}][search] IVF not trained yet, only ${buffered}/${nlist} vectors buffered — returning empty`,
      );
      const response: FaissSearchResponse = {
        success: true,
        type: "faiss.search",
        results: [],
        searchTimeMs: performance.now() - startTime,
      };
      sendResponse(response);
      return;
    }
  }

  if (!vector || !Array.isArray(vector)) {
    sendError(`Invalid or missing vector in search request. Keys: ${Object.keys(request).join(", ")}`);
    return;
  }

  if (vector.length !== entry.dimensions) {
    sendError(`Vector dimension mismatch: expected ${entry.dimensions}, got ${vector.length}`);
    return;
  }

  try {
    // Orphan compensation (HNSW doesn't support deletion)
    const orphanRatio = entry.totalVectors > 0 ? 1 - entry.reverseIdMap.size / entry.totalVectors : 0;
    const multiplier = Math.max(2, Math.ceil(1 / (1 - orphanRatio + 0.01)));
    const searchK = Math.min(k * multiplier, entry.totalVectors);

    log(
      `[${request.projectKey}][search] k=${k}, totalVectors=${entry.totalVectors}, mapSize=${entry.reverseIdMap.size}, orphanRatio=${(orphanRatio * 100).toFixed(0)}%, searchK=${searchK}`,
    );

    if (searchK === 0) {
      const response: FaissSearchResponse = {
        success: true,
        type: "faiss.search",
        results: [],
        searchTimeMs: performance.now() - startTime,
      };
      sendResponse(response);
      return;
    }

    const float32Query = new Float32Array(vector);
    const nprobe = entry.config.ivfNprobe;
    const result = nativeFaiss.faissIndexSearch(request.projectKey, float32Query, searchK, nprobe);
    const { distances, labels } = result;

    const results: Array<{ id: string; distance: number; score: number }> = [];
    for (let i = 0; i < searchK && results.length < k; i++) {
      const internalId = Number(labels[i]!);
      if (internalId === -1) continue;

      const externalId = entry.reverseIdMap.get(internalId);
      if (!externalId) continue;

      const distance = distances[i]!;
      const score = 1 / (1 + distance);

      results.push({ id: externalId, distance, score });
    }

    log(`[${request.projectKey}][search] found ${results.length}/${k} results`);

    const searchTimeMs = performance.now() - startTime;

    const response: FaissSearchResponse = {
      success: true,
      type: "faiss.search",
      results,
      searchTimeMs,
    };
    sendResponse(response);
  } catch (error) {
    sendError(`Search failed: ${(error as Error).message}`);
  }
}

export function handleFaissBatchSearch(
  request: { projectKey: string; vectors: number[]; nQueries: number; k: number },
  ctx: FaissHandlerContext,
): void {
  const { nativeFaiss, state, log, sendResponse, sendError } = ctx;

  if (!nativeFaiss) {
    sendError("Native FAISS addon not available");
    return;
  }

  const entry = getIndexEntry(request.projectKey, state, log);
  if (!entry) {
    sendError(`Index not initialized for project: ${request.projectKey}`);
    return;
  }

  const { vectors, nQueries, k } = request;
  const startTime = performance.now();

  // Force-train IVF before batch search
  if (!entry.isTrained && isIvfType(entry.indexType) && entry.trainingBuffer && entry.trainingBuffer.ids.length > 0) {
    const nlist = entry.config.ivfNlist ?? 256;
    if (entry.trainingBuffer.ids.length >= nlist) {
      autoTrainAndFlush(entry, request.projectKey, nativeFaiss, log);
      state.faissTotalVectors = entry.totalVectors;
      state.faissIsTrained = true;
    }
  }

  if (vectors.length !== nQueries * entry.dimensions) {
    sendError(`Vector count mismatch: ${nQueries} queries * ${entry.dimensions} dimensions != ${vectors.length}`);
    return;
  }

  try {
    const actualK = Math.min(k, entry.totalVectors);

    if (actualK === 0) {
      const response: FaissBatchSearchResponse = {
        success: true,
        type: "faiss.batchSearch",
        results: Array(nQueries).fill([]),
        searchTimeMs: performance.now() - startTime,
      };
      sendResponse(response);
      return;
    }

    const float32Queries = new Float32Array(vectors);
    const nprobe = entry.config.ivfNprobe;
    const result = nativeFaiss.faissIndexBatchSearch(request.projectKey, float32Queries, nQueries, actualK, nprobe);
    const { distances, labels } = result;

    const results: Array<Array<{ id: string; distance: number; score: number }>> = [];

    for (let q = 0; q < nQueries; q++) {
      const queryResults: Array<{ id: string; distance: number; score: number }> = [];
      for (let i = 0; i < actualK; i++) {
        const idx = q * actualK + i;
        const internalId = Number(labels[idx]!);
        if (internalId === -1) continue;

        const externalId = entry.reverseIdMap.get(internalId);
        if (!externalId) continue;

        const distance = distances[idx]!;
        const score = 1 / (1 + distance);

        queryResults.push({ id: externalId, distance, score });
      }
      results.push(queryResults);
    }

    const searchTimeMs = performance.now() - startTime;

    const response: FaissBatchSearchResponse = {
      success: true,
      type: "faiss.batchSearch",
      results,
      searchTimeMs,
    };
    sendResponse(response);
  } catch (error) {
    sendError(`Batch search failed: ${(error as Error).message}`);
  }
}

export function handleFaissRemove(request: { projectKey: string; ids: string[] }, ctx: FaissHandlerContext): void {
  const { state, log, sendResponse } = ctx;

  const entry = getIndexEntry(request.projectKey, state, log);
  if (!entry) {
    // Fallback to legacy state
    const { ids } = request;
    let removedCount = 0;
    for (const id of ids) {
      const internalId = state.faissIdMap.get(id);
      if (internalId !== undefined) {
        state.faissIdMap.delete(id);
        state.faissReverseIdMap.delete(internalId);
        removedCount++;
      }
    }
    const response: FaissRemoveResponse = {
      success: true,
      type: "faiss.remove",
      removedCount,
      totalVectors: state.faissTotalVectors,
    };
    sendResponse(response);
    return;
  }

  const { ids } = request;

  let removedCount = 0;
  for (const id of ids) {
    const internalId = entry.idMap.get(id);
    if (internalId !== undefined) {
      entry.idMap.delete(id);
      entry.reverseIdMap.delete(internalId);
      removedCount++;
    }
  }

  entry.isDirty = true;

  log(`[${request.projectKey}] Removed ${removedCount} ID mappings (vectors orphaned)`);

  const response: FaissRemoveResponse = {
    success: true,
    type: "faiss.remove",
    removedCount,
    totalVectors: entry.totalVectors,
  };
  sendResponse(response);
}

export function handleFaissSave(request: { projectKey: string; path: string }, ctx: FaissHandlerContext): void {
  const { nativeFaiss, state, log, sendResponse, sendError, setContentCachePath, saveContentCache } = ctx;

  if (!nativeFaiss) {
    sendError("Native FAISS addon not available");
    return;
  }

  const entry = getIndexEntry(request.projectKey, state, log);
  if (!entry) {
    sendError(`Index not initialized for project: ${request.projectKey}`);
    return;
  }

  const { path } = request;

  // Force-train and flush buffer before saving
  if (!entry.isTrained && isIvfType(entry.indexType) && entry.trainingBuffer && entry.trainingBuffer.ids.length > 0) {
    const nlist = entry.config.ivfNlist ?? 256;
    if (entry.trainingBuffer.ids.length >= nlist) {
      autoTrainAndFlush(entry, request.projectKey, nativeFaiss, log);
      state.faissTotalVectors = entry.totalVectors;
      state.faissIsTrained = true;
    } else {
      log(
        `[${request.projectKey}] Cannot save: IVF not trained (${entry.trainingBuffer.ids.length}/${nlist} vectors buffered)`,
      );
      sendError(`IVF index not trained yet: need at least ${nlist} vectors, have ${entry.trainingBuffer.ids.length}`);
      return;
    }
  }

  try {
    nativeFaiss.faissIndexSave(request.projectKey, path);

    const idMapPath = `${path}.idmap.json`;
    const idMapData = {
      idMap: Object.fromEntries(entry.idMap),
      totalVectors: entry.totalVectors,
    };
    writeFileSync(idMapPath, JSON.stringify(idMapData));

    entry.isDirty = false;
    entry.contentCachePath = path;

    setContentCachePath(path);
    saveContentCache();

    const stats = statSync(path);

    log(`[${request.projectKey}] Saved index to ${path} (${(stats.size / 1024 / 1024).toFixed(1)} MB)`);

    const response: FaissSaveResponse = {
      success: true,
      type: "faiss.save",
      path,
      sizeBytes: stats.size,
    };
    sendResponse(response);
  } catch (error) {
    sendError(`Failed to save index: ${(error as Error).message}`);
  }
}

export function handleFaissLoad(request: { projectKey: string; path: string }, ctx: FaissHandlerContext): void {
  const { nativeFaiss, state, log, sendResponse, sendError, setContentCachePath, loadContentCache } = ctx;

  if (!nativeFaiss) {
    sendError("Native FAISS addon not available");
    return;
  }

  const { projectKey, path } = request;

  if (!existsSync(path)) {
    sendError(`Index file not found: ${path}`);
    return;
  }

  try {
    const loadResult = nativeFaiss.faissIndexLoad(projectKey, path);

    const idMap = new Map<string, number>();
    const reverseIdMap = new Map<number, string>();
    let totalVectors = loadResult.loadedVectors;

    const idMapPath = `${path}.idmap.json`;
    if (existsSync(idMapPath)) {
      const idMapData = JSON.parse(readFileSync(idMapPath, "utf-8"));
      for (const [k, v] of Object.entries(idMapData.idMap)) {
        idMap.set(k, v as number);
        reverseIdMap.set(v as number, k);
      }
      totalVectors = idMapData.totalVectors;
    }

    // Get existing entry config or create default
    const existingEntry = state.indexPool.get(projectKey);
    const config = existingEntry?.config ?? {
      dimensions: loadResult.dims,
      indexType: (loadResult.indexType as FaissIndexType) ?? "hnsw",
      metric: "l2" as const,
    };

    const entry: IndexEntry = {
      config,
      idMap,
      reverseIdMap,
      totalVectors,
      lastAccessedAt: Date.now(),
      isDirty: false,
      isTrained: loadResult.isTrained,
      dimensions: config.dimensions,
      indexType: config.indexType,
      contentCachePath: path,
      trainingBuffer: null,
    };
    state.indexPool.set(projectKey, entry);

    syncLegacyState(state, entry, projectKey);

    setContentCachePath(path);
    loadContentCache();

    log(`[${projectKey}] Loaded index from ${path} with ${loadResult.loadedVectors} vectors`);

    const response: FaissLoadResponse = {
      success: true,
      type: "faiss.load",
      path,
      loadedVectors: loadResult.loadedVectors,
    };
    sendResponse(response);
  } catch (error) {
    sendError(`Failed to load index: ${(error as Error).message}`);
  }
}

export function handleFaissTrain(
  request: { projectKey: string; vectors: number[]; nVectors: number },
  ctx: FaissHandlerContext,
): void {
  const { nativeFaiss, state, log, sendResponse, sendError } = ctx;

  if (!nativeFaiss) {
    sendError("Native FAISS addon not available");
    return;
  }

  const entry = getIndexEntry(request.projectKey, state, log);
  if (!entry) {
    sendError(`Index not initialized for project: ${request.projectKey}`);
    return;
  }

  if (entry.isTrained) {
    sendError("Index is already trained");
    return;
  }

  const { vectors, nVectors } = request;
  const startTime = performance.now();

  if (vectors.length !== nVectors * entry.dimensions) {
    sendError(`Training vector count mismatch: ${nVectors} * ${entry.dimensions} != ${vectors.length}`);
    return;
  }

  try {
    const float32Vectors = new Float32Array(vectors);
    nativeFaiss.faissIndexTrain(request.projectKey, float32Vectors, nVectors);
    entry.isTrained = true;
    state.faissIsTrained = true;

    const trainTimeMs = performance.now() - startTime;
    log(`[${request.projectKey}] Trained index on ${nVectors} vectors in ${trainTimeMs.toFixed(1)}ms`);

    // Flush any buffered vectors after manual training
    if (entry.trainingBuffer && entry.trainingBuffer.ids.length > 0) {
      const buffered = entry.trainingBuffer;
      const bufferedFloat32 = new Float32Array(buffered.vectors);
      nativeFaiss.faissIndexAdd(request.projectKey, bufferedFloat32, buffered.ids.length);
      const startId = entry.totalVectors;
      for (let i = 0; i < buffered.ids.length; i++) {
        entry.idMap.set(buffered.ids[i]!, startId + i);
        entry.reverseIdMap.set(startId + i, buffered.ids[i]!);
      }
      entry.totalVectors += buffered.ids.length;
      entry.isDirty = true;
      state.faissTotalVectors = entry.totalVectors;
      log(`[${request.projectKey}] Flushed ${buffered.ids.length} buffered vectors after manual train`);
      entry.trainingBuffer = null;
    }

    const response: FaissTrainResponse = {
      success: true,
      type: "faiss.train",
      trainedOn: nVectors,
      trainTimeMs,
    };
    sendResponse(response);
  } catch (error) {
    sendError(`Training failed: ${(error as Error).message}`);
  }
}

export function handleFaissStats(ctx: FaissHandlerContext, projectKey?: string): void {
  const { state, sendResponse } = ctx;

  if (projectKey) {
    const entry = state.indexPool.get(projectKey);
    if (entry) {
      let memoryUsageMB = 0;
      if (entry.totalVectors > 0) {
        const vectorMemory = entry.totalVectors * entry.dimensions * 4;
        const graphMemory = entry.indexType === "hnsw" ? entry.totalVectors * 32 * 2 : 0;
        const idMapMemory = entry.totalVectors * 100;
        memoryUsageMB = (vectorMemory + graphMemory + idMapMemory) / 1024 / 1024;
      }

      const response: FaissStatsResponse = {
        success: true,
        type: "faiss.stats",
        stats: {
          indexType: entry.indexType,
          dimensions: entry.dimensions,
          totalVectors: entry.totalVectors,
          memoryUsageMB,
          isTrained: entry.isTrained,
        },
      };
      sendResponse(response);
      return;
    }
  }

  let memoryUsageMB = 0;
  if (state.faissTotalVectors > 0) {
    const vectorMemory = state.faissTotalVectors * state.faissDimensions * 4;
    const graphMemory = state.faissIndexType === "hnsw" ? state.faissTotalVectors * 32 * 2 : 0;
    const idMapMemory = state.faissTotalVectors * 100;
    memoryUsageMB = (vectorMemory + graphMemory + idMapMemory) / 1024 / 1024;
  }

  const response: FaissStatsResponse = {
    success: true,
    type: "faiss.stats",
    stats: {
      indexType: state.faissIndexType ?? "flat",
      dimensions: state.faissDimensions,
      totalVectors: state.faissTotalVectors,
      memoryUsageMB,
      isTrained: state.faissIsTrained,
    },
  };
  sendResponse(response);
}
