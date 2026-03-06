#!/usr/bin/env node
/**
 * GPU Worker - Unified Node.js subprocess for Faiss + CUDA operations
 *
 * Runs as a standalone Node.js process, communicates with Bun parent via stdin/stdout JSON.
 * Combines:
 * - Native FAISS addon: FAISS C++ API compiled into ultracode_cuda.node (ENABLE_FAISS_CPU)
 * - CUDA addon: Native NVIDIA GPU operations (similarity, normalization)
 *
 * Usage: node gpu-worker.js
 *
 * IPC Protocol:
 * - Parent sends JSON requests via stdin (one per line)
 * - Worker responds via stdout (one JSON per line)
 * - Errors are logged to stderr (not parsed by parent)
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { createInterface } from "node:readline";

import {
  type CUDAAddon,
  type CudaHandlerContext,
  handleCudaBatchCosine,
  handleCudaCosine,
  handleCudaEuclidean,
  handleCudaInfo,
  handleCudaNormalize,
} from "./cuda-handlers.js";
import {
  type EmbeddingsHandlerContext,
  handleEmbeddingsAddBatch,
  handleEmbeddingsFlush,
  handleEmbeddingsRemove,
  handleEmbeddingsSearch,
  handleEmbeddingsStats,
} from "./embeddings-handlers.js";
// Import handlers from extracted modules
import {
  type FaissHandlerContext,
  handleFaissAdd,
  handleFaissBatchSearch,
  handleFaissInit,
  handleFaissLoad,
  handleFaissRemove,
  handleFaissSave,
  handleFaissSearch,
  handleFaissStats,
  handleFaissTrain,
} from "./faiss-handlers.js";
import { createPacket, NamedPipeServer, parsePacket } from "./named-pipe-transport.js";

import type {
  ContentCacheEntry,
  GpuErrorResponse,
  GpuStatsResponse,
  GpuWorkerRequest,
  GpuWorkerResponse,
  GpuWorkerState,
  NativeFaissAddon,
} from "./types.js";

// =============================================================================
// Dynamic Imports (handle missing dependencies)
// =============================================================================

let cudaAddon: CUDAAddon | null = null;
let nativeFaiss: NativeFaissAddon | null = null;

async function loadCuda(): Promise<boolean> {
  // Check environment override
  if (process.env["CUDA_FORCE_DISABLE"] === "1") {
    log("CUDA disabled via CUDA_FORCE_DISABLE=1");
    return false;
  }

  // Create require function for ESM compatibility (native modules need require())
  const { createRequire } = await import("node:module");
  const require = createRequire(import.meta.url);

  // Try to load CUDA addon from multiple locations
  const plat = process.platform === "win32" ? "win32" : "linux";
  const possiblePaths = [
    // Canonical location (build-cuda.ps1 copies here)
    join(process.cwd(), "external-libs/cuda-" + plat + "-x64/ultracode_cuda.node"),
    // When running from dist/ (relative to worker script)
    join(
      dirname(import.meta.url.replace("file://", "").replace(/^\/([A-Za-z]:)/, "$1")),
      "../../../external-libs/cuda-" + plat + "-x64/ultracode_cuda.node",
    ),
    // Fallback: dist/ and build/ locations
    join(process.cwd(), "dist/native/cuda/ultracode_cuda.node"),
    join(process.cwd(), "build/Release/ultracode_cuda.node"),
  ];

  for (const addonPath of possiblePaths) {
    try {
      const normalizedPath = addonPath.replace(/^\/([A-Za-z]:)/, "$1");
      const exists = existsSync(normalizedPath);
      log(`CUDA path check: ${normalizedPath} exists=${exists}`);
      if (!exists) continue;

      cudaAddon = require(normalizedPath);
      const info = cudaAddon!.getDeviceInfo();
      if (info.deviceCount > 0) {
        log(`CUDA loaded: ${info.deviceName} (CC ${info.computeCapability}, ${info.totalMemoryMB}MB)`);
        state.cudaAvailable = true;
        state.cudaDeviceInfo = info;

        // Check for native FAISS support
        if (cudaAddon!.hasNativeFaiss) {
          nativeFaiss = cudaAddon as unknown as NativeFaissAddon;
          log("Native FAISS available in CUDA addon (replaces faiss-napi)");
        }

        return true;
      } else {
        log(`CUDA loaded but no GPU devices found`);
        // Still check for native FAISS (CPU-only mode)
        if (cudaAddon!.hasNativeFaiss) {
          nativeFaiss = cudaAddon as unknown as NativeFaissAddon;
          log("Native FAISS available (CPU mode, no GPU)");
          return true;
        }
      }
    } catch (error) {
      log(`CUDA load error at ${addonPath}: ${(error as Error).message}`);
    }
  }

  log("CUDA addon not found or no GPU available");
  return false;
}

// =============================================================================
// Logging (stderr only, stdout reserved for IPC)
// =============================================================================

function log(message: string): void {
  console.error(`[gpu-worker] ${message}`);
}

function logError(message: string): void {
  console.error(`[gpu-worker] ERROR: ${message}`);
}

// =============================================================================
// Worker State
// =============================================================================

const MAX_LOADED_INDEXES = 10;

const state: GpuWorkerState = {
  // Multi-index pool
  indexPool: new Map(),
  maxLoadedIndexes: MAX_LOADED_INDEXES,
  // Legacy single-index state (backward compat)
  faissInitialized: false,
  faissIndexType: null,
  faissDimensions: 0,
  faissTotalVectors: 0,
  faissIsTrained: false,
  faissIdMap: new Map(),
  faissReverseIdMap: new Map(),
  activeProjectKey: null,
  // Content cache (id → content/metadata)
  contentCache: new Map(),
  contentCacheDirty: false,
  // CUDA state
  cudaAvailable: false,
  cudaDeviceInfo: null,
  gpuFaissAvailable: false,
  // Worker state
  startTime: Date.now(),
};

// =============================================================================
// Global Response Capture (for Named Pipe binary IPC)
// =============================================================================

interface GlobalWithCapture {
  _captureResponse?: (response: GpuWorkerResponse) => void;
}

// =============================================================================
// Response Helpers
// =============================================================================

function sendResponse(response: GpuWorkerResponse): void {
  const globalWithCapture = global as unknown as GlobalWithCapture;
  if (globalWithCapture._captureResponse) {
    globalWithCapture._captureResponse(response);
    return;
  }
  process.stdout.write(`${JSON.stringify(response)}\n`);
}

function sendError(error: string, requestId?: string): void {
  const response: GpuErrorResponse = {
    success: false,
    error,
    requestId,
  };
  sendResponse(response);
}

// =============================================================================
// Content Cache Persistence
// =============================================================================

let contentCachePath: string | null = null;

function setContentCachePath(indexPath: string): void {
  contentCachePath = `${indexPath}.content.json`;
}

function saveContentCache(): void {
  if (!contentCachePath || state.contentCache.size === 0) return;

  try {
    const data: Record<string, ContentCacheEntry> = {};
    for (const [id, entry] of state.contentCache) {
      data[id] = entry;
    }
    writeFileSync(contentCachePath, JSON.stringify(data));
    state.contentCacheDirty = false;
    log(`Saved content cache: ${state.contentCache.size} entries`);
  } catch (error) {
    logError(`Failed to save content cache: ${(error as Error).message}`);
  }
}

function loadContentCache(): void {
  if (!contentCachePath || !existsSync(contentCachePath)) return;

  try {
    const data = JSON.parse(readFileSync(contentCachePath, "utf-8")) as Record<string, ContentCacheEntry>;
    state.contentCache.clear();
    for (const [id, entry] of Object.entries(data)) {
      state.contentCache.set(id, entry);
    }
    log(`Loaded content cache: ${state.contentCache.size} entries`);
  } catch (error) {
    logError(`Failed to load content cache: ${(error as Error).message}`);
  }
}

// =============================================================================
// Handler Contexts
// =============================================================================

function getFaissContext(): FaissHandlerContext {
  return {
    nativeFaiss,
    state,
    log,
    logError,
    sendResponse,
    sendError,
    setContentCachePath,
    loadContentCache,
    saveContentCache,
  };
}

function getCudaContext(): CudaHandlerContext {
  return {
    cudaAddon,
    state,
    sendResponse,
    sendError,
  };
}

function getEmbeddingsContext(): EmbeddingsHandlerContext {
  return {
    nativeFaiss,
    state,
    contentCachePath,
    log,
    logError,
    sendResponse,
    sendError,
    saveContentCache,
  };
}

// =============================================================================
// Worker Lifecycle Handlers
// =============================================================================

function handleStats(): void {
  let faissMemoryMB = 0;
  let totalVectors = 0;

  for (const [, entry] of state.indexPool) {
    if (entry.totalVectors > 0) {
      const vectorMemory = entry.totalVectors * entry.dimensions * 4;
      const graphMemory = entry.indexType === "hnsw" ? entry.totalVectors * 32 * 2 : 0;
      faissMemoryMB += (vectorMemory + graphMemory) / 1024 / 1024;
      totalVectors += entry.totalVectors;
    }
  }

  if (state.indexPool.size === 0 && state.faissTotalVectors > 0) {
    const vectorMemory = state.faissTotalVectors * state.faissDimensions * 4;
    const graphMemory = state.faissIndexType === "hnsw" ? state.faissTotalVectors * 32 * 2 : 0;
    faissMemoryMB = (vectorMemory + graphMemory) / 1024 / 1024;
    totalVectors = state.faissTotalVectors;
  }

  const response: GpuStatsResponse = {
    success: true,
    type: "stats",
    faiss: {
      initialized: state.faissInitialized || state.indexPool.size > 0,
      indexType: state.faissIndexType,
      dimensions: state.faissDimensions,
      totalVectors,
      memoryUsageMB: faissMemoryMB,
      loadedIndexes: state.indexPool.size,
      indexPoolKeys: Array.from(state.indexPool.keys()),
    },
    cuda: {
      available: state.cudaAvailable,
      deviceInfo: state.cudaDeviceInfo,
      gpuFaissAvailable: state.gpuFaissAvailable,
    },
    uptime: Date.now() - state.startTime,
  };
  sendResponse(response);
}

function handleShutdown(): void {
  log("Shutting down...");
  sendResponse({ success: true });
  process.exit(0);
}

// =============================================================================
// Main Request Router
// =============================================================================

async function handleRequest(request: GpuWorkerRequest): Promise<void> {
  try {
    if (request.type === "shutdown") {
      handleShutdown();
      return;
    }

    // Check native FAISS availability for faiss.* operations
    if (request.type.startsWith("faiss.") && !nativeFaiss) {
      sendError("Native FAISS addon not available (compile with ENABLE_FAISS_CPU)");
      return;
    }

    // Check CUDA availability for cuda.* operations
    if (request.type.startsWith("cuda.") && !cudaAddon) {
      sendError("CUDA addon not available");
      return;
    }

    // Check FAISS availability for embeddings.* operations
    if (request.type.startsWith("embeddings.") && !nativeFaiss) {
      sendError("Native FAISS addon not available (required for embeddings)");
      return;
    }

    const faissCtx = getFaissContext();
    const cudaCtx = getCudaContext();
    const embCtx = getEmbeddingsContext();

    switch (request.type) {
      // Faiss operations
      case "faiss.init":
        await handleFaissInit(request, faissCtx);
        break;
      case "faiss.add":
        handleFaissAdd(request, faissCtx);
        break;
      case "faiss.search":
        handleFaissSearch(request, faissCtx);
        break;
      case "faiss.batchSearch":
        handleFaissBatchSearch(request, faissCtx);
        break;
      case "faiss.remove":
        handleFaissRemove(request, faissCtx);
        break;
      case "faiss.save":
        handleFaissSave(request, faissCtx);
        break;
      case "faiss.load":
        handleFaissLoad(request, faissCtx);
        break;
      case "faiss.train":
        handleFaissTrain(request, faissCtx);
        break;
      case "faiss.stats":
        handleFaissStats(faissCtx, (request as { projectKey?: string }).projectKey);
        break;

      // CUDA operations
      case "cuda.info":
        handleCudaInfo(cudaCtx);
        break;
      case "cuda.cosine":
        handleCudaCosine(request, cudaCtx);
        break;
      case "cuda.batchCosine":
        handleCudaBatchCosine(request, cudaCtx);
        break;
      case "cuda.euclidean":
        handleCudaEuclidean(request, cudaCtx);
        break;
      case "cuda.normalize":
        handleCudaNormalize(request, cudaCtx);
        break;

      // Embeddings pipeline
      case "embeddings.addBatch":
        handleEmbeddingsAddBatch(request, embCtx);
        break;
      case "embeddings.search":
        handleEmbeddingsSearch(request, embCtx);
        break;
      case "embeddings.flush":
        handleEmbeddingsFlush(embCtx);
        // Try GC after flush to free memory (requires --expose-gc)
        if (typeof global.gc === "function") {
          global.gc();
          log("GC triggered after flush");
        }
        break;
      case "embeddings.stats":
        handleEmbeddingsStats(embCtx);
        break;
      case "embeddings.remove":
        handleEmbeddingsRemove(request, embCtx);
        break;

      // Worker lifecycle
      case "stats":
        handleStats();
        break;

      default:
        sendError(`Unknown request type: ${(request as { type: string }).type}`);
    }
  } catch (error) {
    sendError(`Request handler error: ${(error as Error).message}`);
  }
}

// =============================================================================
// IPC Setup
// =============================================================================

let namedPipeServer: NamedPipeServer | null = null;

interface BinaryPacketHeader {
  dimensions?: number;
  queryCount?: number;
  items?: Array<{ id: string; content?: string; metadata?: Record<string, unknown> }>;
}

function reconstructRequestWithVectors(
  request: GpuWorkerRequest,
  header: BinaryPacketHeader,
  vectors: Float32Array,
): GpuWorkerRequest {
  const reconstructed = { ...request } as Record<string, unknown>;

  switch (request.type) {
    case "faiss.add":
      reconstructed["vectors"] = Array.from(vectors);
      break;

    case "faiss.search":
      reconstructed["vector"] = Array.from(vectors);
      break;

    case "faiss.batchSearch":
      reconstructed["vectors"] = Array.from(vectors);
      break;

    case "faiss.train":
      reconstructed["vectors"] = Array.from(vectors);
      break;

    case "cuda.cosine": {
      const dim = (header.dimensions as number | undefined) ?? vectors.length / 2;
      reconstructed["a"] = Array.from(vectors.subarray(0, dim));
      reconstructed["b"] = Array.from(vectors.subarray(dim));
      break;
    }

    case "cuda.batchCosine": {
      const dim = (header.dimensions as number | undefined) ?? 0;
      const queryCount = (header.queryCount as number | undefined) ?? 1;
      reconstructed["query"] = Array.from(vectors.subarray(0, dim));
      const database: number[][] = [];
      for (let i = 1; i < queryCount + (vectors.length - dim) / dim; i++) {
        database.push(Array.from(vectors.subarray(i * dim, (i + 1) * dim)));
      }
      reconstructed["database"] = database;
      break;
    }

    case "embeddings.addBatch": {
      const dim = (header.dimensions as number | undefined) ?? 0;
      const items = (header["items"] as Array<{ vector?: number[] }>) ?? [];
      for (let i = 0; i < items.length; i++) {
        items[i]!.vector = Array.from(vectors.subarray(i * dim, (i + 1) * dim));
      }
      reconstructed["items"] = items;
      break;
    }

    case "embeddings.search":
      reconstructed["vector"] = Array.from(vectors);
      break;
  }

  return reconstructed as unknown as GpuWorkerRequest;
}

async function handleNamedPipeRequest(packet: Buffer): Promise<Buffer> {
  try {
    const { header, vectors } = parsePacket(packet);
    let request = header as unknown as GpuWorkerRequest;

    log(`[NamedPipe] Received: type=${request.type}, packetLen=${packet.length}, vectorsLen=${vectors?.length ?? 0}`);

    if (vectors && vectors.length > 0) {
      const headerMetadata = header as unknown as BinaryPacketHeader;
      request = reconstructRequestWithVectors(request, headerMetadata, vectors);
    }

    let capturedResponse: GpuWorkerResponse | null = null;

    const globalWithCapture = global as unknown as GlobalWithCapture;
    globalWithCapture._captureResponse = (response: GpuWorkerResponse) => {
      capturedResponse = response;
    };

    await handleRequest(request);

    delete globalWithCapture._captureResponse;

    if (capturedResponse) {
      type ResponseWithVectors = GpuWorkerResponse & {
        vectors?: number[][];
      };
      const responseWithVectors = capturedResponse as ResponseWithVectors;
      if (responseWithVectors.vectors && Array.isArray(responseWithVectors.vectors)) {
        const vectorData = new Float32Array(responseWithVectors.vectors.flat());
        delete responseWithVectors.vectors;
        return createPacket(capturedResponse, vectorData);
      }
      return createPacket(capturedResponse);
    }

    return createPacket({ success: false, error: "No response generated" });
  } catch (error) {
    return createPacket({ success: false, error: (error as Error).message });
  }
}

async function main(): Promise<void> {
  log("Starting GPU worker...");

  // Load CUDA addon (includes native FAISS if compiled with ENABLE_FAISS_CPU)
  const cudaLoaded = await loadCuda();
  const faissAvailable = nativeFaiss !== null;

  if (!faissAvailable && !cudaLoaded) {
    logError("Neither Native FAISS nor CUDA available, worker has limited functionality");
  }

  // Check for GPU FAISS support in CUDA addon
  const hasGpuFaiss = cudaAddon?.hasGpuFaiss ?? false;
  state.gpuFaissAvailable = hasGpuFaiss;

  log(`Capabilities: NativeFaiss=${faissAvailable}, CUDA=${cudaLoaded}, GPU-FAISS=${hasGpuFaiss}`);

  // Start Named Pipe server for binary IPC (parallel with stdin)
  const parentPid = process.ppid;
  const pipeId = `${process.pid}`;

  try {
    namedPipeServer = new NamedPipeServer({
      pipeId,
      onRequest: handleNamedPipeRequest,
      onReady: () => {
        log(`Named Pipe server ready: ${namedPipeServer!.path}`);
        process.stdout.write(`${JSON.stringify({ type: "pipe.ready", path: namedPipeServer!.path })}\n`);
      },
      onError: (err) => {
        logError(`Named Pipe error: ${err.message}`);
      },
    });
    await namedPipeServer.start();
  } catch (error) {
    log(`Named Pipe server failed to start: ${(error as Error).message}, using stdin only`);
  }

  // Setup stdin reading
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false,
  });

  rl.on("line", async (line) => {
    if (!line.trim()) return;

    log(`[stdin] Line received: len=${line.length}, preview=${line.slice(0, 100)}`);

    try {
      const request = JSON.parse(line) as GpuWorkerRequest;
      const requestWithVector = request as Partial<{ vector?: number[] } & { vectors?: number[] } & GpuWorkerRequest>;
      const vec = requestWithVector.vector ?? requestWithVector.vectors;
      log(
        `[stdin] Parsed: type=${request.type}, keys=${Object.keys(request).join(",")}, hasVector=${!!vec}, vectorLen=${vec?.length ?? "N/A"}`,
      );
      await handleRequest(request);
    } catch (error) {
      sendError(`Failed to parse request: ${(error as Error).message}`);
    }
  });

  rl.on("close", () => {
    log("stdin closed, shutting down");
    namedPipeServer?.stop();
    process.exit(0);
  });

  process.stdin.on("end", () => {
    log("stdin end, shutting down");
    namedPipeServer?.stop();
    process.exit(0);
  });

  process.stdin.on("error", (err) => {
    log(`stdin error: ${err.message}, shutting down`);
    namedPipeServer?.stop();
    process.exit(0);
  });

  // Periodic GC every 5 minutes (requires --expose-gc)
  if (typeof global.gc === "function") {
    log("GC available, starting periodic GC (5 min interval)");
    setInterval(
      () => {
        const before = process.memoryUsage();
        global.gc!();
        const after = process.memoryUsage();
        const freedMB = Math.round((before.heapUsed - after.heapUsed) / 1024 / 1024);
        log(`Periodic GC: freed ${freedMB}MB, heap ${Math.round(after.heapUsed / 1024 / 1024)}MB`);
      },
      5 * 60 * 1000,
    );
  }

  // Handle signals
  process.on("SIGTERM", () => {
    log("SIGTERM received");
    namedPipeServer?.stop();
    process.exit(0);
  });

  process.on("SIGINT", () => {
    log("SIGINT received");
    namedPipeServer?.stop();
    process.exit(0);
  });

  process.on("disconnect", () => {
    log("Disconnected from parent, shutting down");
    namedPipeServer?.stop();
    process.exit(0);
  });

  // Orphan detection
  if (parentPid && parentPid > 1) {
    const checkParent = setInterval(() => {
      try {
        process.kill(parentPid, 0);
      } catch {
        log(`Parent process ${parentPid} died, exiting`);
        clearInterval(checkParent);
        namedPipeServer?.stop();
        process.exit(0);
      }
    }, 30000);
    checkParent.unref();
  }

  log("Ready, waiting for commands on stdin and Named Pipe");
}

main().catch((error) => {
  logError(`Fatal error: ${error.message}`);
  process.exit(1);
});
