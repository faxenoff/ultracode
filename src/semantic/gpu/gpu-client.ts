/**
 * GPU Client - Unified client for Faiss + CUDA operations
 *
 * Runtime-aware implementation:
 * - Under Bun: spawns Node.js subprocess (IPC via stdin/stdout JSON)
 * - Under Node.js: uses faiss-napi and CUDA addon directly (no subprocess overhead)
 *
 * Provides both vector indexing (Faiss) and similarity computation (CUDA) in one interface.
 */

import type { ChildProcess } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { log } from "../../logging/index.js";
import { getDataDir } from "../../shared/storage-paths.js";
import { sleep } from "../../utils/runtime.js";
import { cosineSimilarity as cpuCosineSimilarity, simdL2Normalize } from "../../utils/simd-vector-ops.js";
import {
  getRecommendedStrategy,
  type StrategyRecommendation,
  shouldUseCudaBatchCosine,
  shouldUseCudaNormalize,
} from "./adaptive-thresholds.js";
import { createPacket, NamedPipeClient, parsePacket } from "./named-pipe-transport.js";
import { extractVectorsFromRequest } from "./request-helpers.js";
import { extractGpuError } from "./type-guards.js";
import type {
  CudaBatchCosineResponse,
  CudaCosineResponse,
  CudaEuclideanResponse,
  CudaInfoResponse,
  CudaNormalizeResponse,
  FaissAddResponse,
  FaissBatchSearchResponse,
  FaissIndexConfig,
  FaissInitResponse,
  FaissLoadResponse,
  FaissSaveResponse,
  FaissSearchRequest,
  FaissSearchResponse,
  FaissSearchResult,
  FaissStatsResponse,
  FaissTrainResponse,
  GpuStatsResponse,
  GpuWorkerRequest,
  GpuWorkerResponse,
} from "./types.js";

// =============================================================================
// Process Interfaces
// =============================================================================

/**
 * Typed wrapper for Bun subprocess to match Node.js ChildProcess interface
 */
interface BunProcessWrapper {
  stdin: NonNullable<ChildProcess["stdin"]>;
  stdout: NonNullable<ChildProcess["stdout"]>;
  stderr: NonNullable<ChildProcess["stderr"]>;
  pid: number;
  kill: () => void;
  on: (event: "exit" | "close", handler: (code: number | null) => void) => void;
}

// =============================================================================
// Unified Interface
// =============================================================================

export interface IGpuClient {
  // Lifecycle
  start(): Promise<boolean>;
  stop(): Promise<void>;
  isRunning(): boolean;

  // Faiss operations (projectKey identifies which index to operate on)
  faissInitialize(projectKey: string, config: FaissIndexConfig, loadPath?: string): Promise<FaissInitResponse>;
  faissAdd(projectKey: string, ids: string[], vectors: Float32Array | number[]): Promise<FaissAddResponse>;
  faissSearch(projectKey: string, vector: Float32Array | number[], k: number): Promise<FaissSearchResult[]>;
  faissBatchSearch(
    projectKey: string,
    vectors: Float32Array | number[],
    nQueries: number,
    k: number,
  ): Promise<FaissSearchResult[][]>;
  faissTrain(projectKey: string, vectors: Float32Array | number[], nVectors: number): Promise<FaissTrainResponse>;
  faissSave(projectKey: string, path?: string): Promise<FaissSaveResponse>;
  faissLoad(projectKey: string, path: string): Promise<FaissLoadResponse>;
  faissRemove(projectKey: string, ids: string[]): Promise<void>;
  faissGetStats(projectKey: string): Promise<FaissStatsResponse["stats"] | undefined>;

  // CUDA operations (raw - always use CUDA if available)
  cudaInfo(): Promise<CudaInfoResponse>;
  cudaCosineSimilarity(a: Float32Array | number[], b: Float32Array | number[]): Promise<number>;
  cudaBatchCosineSimilarity(
    query: Float32Array | number[],
    database: (Float32Array | number[])[],
  ): Promise<Float32Array>;
  cudaEuclideanDistance(a: Float32Array | number[], b: Float32Array | number[]): Promise<number>;
  cudaNormalizeVectors(vectors: (Float32Array | number[])[]): Promise<Float32Array[]>;
  isCudaAvailable(): boolean;

  // Adaptive operations (auto-select CUDA vs CPU based on data size)
  adaptiveBatchCosineSimilarity(
    query: Float32Array,
    database: Float32Array[],
  ): Promise<{ similarities: Float32Array; usedCuda: boolean }>;
  adaptiveNormalizeVectors(vectors: Float32Array[]): Promise<{ normalized: Float32Array[]; usedCuda: boolean }>;
  getRecommendedStrategy(
    vectorCount: number,
    dimensions: number,
    isRebuild: boolean,
    queryBatchSize?: number,
  ): StrategyRecommendation;

  // Combined stats
  getStats(): Promise<GpuStatsResponse>;
}

// =============================================================================
// Configuration
// =============================================================================

interface GpuClientConfig {
  /** Node.js executable path (default: "node") - only for subprocess mode */
  nodePath?: string;
  /** Worker script path (auto-detected if not specified) - only for subprocess mode */
  workerPath?: string;
  /** Request timeout in ms (default: 30000) */
  timeout?: number | undefined;
  /** Auto-restart on crash (default: true) - only for subprocess mode */
  autoRestart?: boolean;
  /** Maximum restart attempts (default: 3) - only for subprocess mode */
  maxRestarts?: number;
  /** Force subprocess mode even under Node.js (default: false) */
  forceSubprocess?: boolean;
}

const DEFAULT_CONFIG: Required<GpuClientConfig> = {
  nodePath: "node",
  workerPath: "",
  timeout: 30000,
  autoRestart: true,
  maxRestarts: 3,
  forceSubprocess: false,
};

// =============================================================================
// Subprocess Client (always used - worker process handles faiss-napi)
// =============================================================================

interface PendingRequest {
  resolve: (response: GpuWorkerResponse) => void;
  reject: (error: Error) => void;
  abortController: AbortController;
}

class GpuSubprocessClient implements IGpuClient {
  private config: Required<GpuClientConfig>;
  private worker: ChildProcess | null = null;
  private pendingRequests: Map<number, PendingRequest> = new Map();
  private requestId = 0;
  private restartCount = 0;
  private isShuttingDown = false;
  private faissInitConfig: FaissIndexConfig | null = null;
  private responseBuffer = "";
  private _cudaAvailable = false;

  // Named Pipe client for binary IPC
  private namedPipeClient: NamedPipeClient | null = null;
  private namedPipePath: string | null = null;
  private useNamedPipe = false;

  // Mutex for start() to prevent race condition with concurrent calls
  private startPromise: Promise<boolean> | null = null;

  // Request queue for Named Pipe (only supports one pending request at a time)
  private namedPipeRequestQueue: Promise<GpuWorkerResponse> = Promise.resolve({} as GpuWorkerResponse);

  constructor(config: GpuClientConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };

    if (!this.config.workerPath) {
      this.config.workerPath = this.findWorkerPath();
    }

    this.registerCleanupHandlers();
  }

  private registerCleanupHandlers(): void {
    const cleanup = () => {
      if (this.worker && !this.isShuttingDown) {
        // Set flag BEFORE kill to prevent handleWorkerCrash from rejecting as "Worker crashed"
        this.isShuttingDown = true;
        log.d("GPU", "Parent exiting, killing worker...");

        // Disconnect Named Pipe client
        if (this.namedPipeClient) {
          this.namedPipeClient.disconnect();
          this.namedPipeClient = null;
        }

        this.worker.kill();
        this.worker = null;
        // Reject pending requests gracefully
        for (const [, pending] of this.pendingRequests) {
          pending.abortController.abort();
          pending.reject(new Error("Client shutting down"));
        }
        this.pendingRequests.clear();
      }
    };

    process.on("exit", cleanup);
    process.on("SIGINT", cleanup);
    process.on("SIGTERM", cleanup);
  }

  private findWorkerPath(): string {
    const candidates: string[] = [];

    // Use fileURLToPath for proper cross-platform path resolution
    // After bundling, import.meta.url points to chunk file in dist/chunks/, not semantic/gpu/
    // So we find dist root and use full subpath (same approach as language-worker-pool.ts)
    const currentDir = dirname(fileURLToPath(import.meta.url));

    // Find dist root by looking for semantic/gpu structure or going up from chunks
    let distRoot = currentDir;
    if (currentDir.includes("chunks")) {
      // Bundled: currentDir is dist/chunks, go up one level
      distRoot = dirname(currentDir);
    } else if (currentDir.includes("semantic")) {
      // Development or unbundled: currentDir is semantic/gpu, go up two levels
      distRoot = dirname(dirname(currentDir));
    }

    // Primary candidate: relative to dist root
    candidates.push(join(distRoot, "semantic", "gpu", "gpu-worker.js"));

    // Fallback: same directory (in case of different bundle structure)
    candidates.push(join(currentDir, "gpu-worker.js"));

    // Fallback: try npm package resolution
    try {
      const pkgPath = require.resolve("ultracode");
      candidates.push(join(dirname(pkgPath), "semantic/gpu/gpu-worker.js"));
    } catch {}

    // Last resort: cwd-based (for development)
    candidates.push(join(process.cwd(), "dist/semantic/gpu/gpu-worker.js"));

    for (const path of candidates) {
      if (existsSync(path)) {
        log.d("GPU", "Found worker at", { path });
        return path;
      }
    }

    // Return first candidate for error message clarity
    const fallback = candidates[0] ?? join(process.cwd(), "dist/semantic/gpu/gpu-worker.js");
    log.w("GPU", "Worker not found, using fallback", { path: fallback, candidates });
    return fallback;
  }

  async start(): Promise<boolean> {
    // Prevent race condition: if start is already in progress, wait for it
    // Check startPromise BEFORE checking worker to ensure cudaInfo() completes
    if (this.startPromise) {
      return this.startPromise;
    }

    if (this.worker) return true;

    // Debug: skip subprocess spawning to identify console window source
    if (process.env["ULTRACODE_NO_SUBPROCESS"] === "1") {
      log.d("GPU", "SKIPPED (ULTRACODE_NO_SUBPROCESS=1)");
      return false;
    }

    // Create promise for concurrent callers to wait on
    this.startPromise = this.startInternal();
    return this.startPromise;
  }

  private async startInternal(): Promise<boolean> {
    try {
      log.i("GPU", "Starting worker", {
        nodePath: this.config.nodePath,
        workerPath: this.config.workerPath,
      });

      const isWindows = process.platform === "win32";
      const isBun = typeof Bun !== "undefined";

      // Use Node's child_process - works correctly under both Node and Bun
      if (!isBun || isWindows) {
        const { spawn } = await import("node:child_process");
        this.worker = spawn(this.config.nodePath, ["--expose-gc", this.config.workerPath], {
          stdio: ["pipe", "pipe", "pipe"], // Capture stderr for logging
          windowsHide: true,
        });
        // Don't let subprocess keep parent alive
        this.worker.unref();

        // Log stderr from worker
        if (this.worker.stderr) {
          this.worker.stderr.on("data", (data: Buffer) => {
            const msg = data.toString().trim();
            if (msg) {
              log.d("GPU", msg);
            }
          });
        }
      } else {
        // On non-Windows with Bun, use Bun.spawn for better performance
        const global = globalThis as any;
        const proc = global.Bun?.["spawn"]([this.config.nodePath, "--expose-gc", this.config.workerPath], {
          stdin: "pipe",
          stdout: "pipe",
          stderr: "pipe", // Capture stderr for logging
        });

        // Log stderr from worker (Bun)
        // DISABLED: stderr reader async loop may cause crashes in Bun with native modules
        // if (proc.stderr) {
        //   (async () => {
        //     const reader = proc.stderr.getReader();
        //     const decoder = new TextDecoder();
        //     try {
        //       while (true) {
        //         const { done, value } = await reader.read();
        //         if (done) break;
        //         const msg = decoder.decode(value).trim();
        //         if (msg) {
        //           log.d("GPU", msg);
        //         }
        //       }
        //     } catch {
        //       // Stream closed
        //     }
        //   })();
        // }

        // Wrap Bun process to match ChildProcess interface
        const wrapper: BunProcessWrapper = {
          stdin: proc.stdin,
          stdout: proc.stdout,
          stderr: proc.stderr,
          pid: proc.pid,
          kill: () => proc.kill(),
          on: (event: "exit" | "close", handler: (code: number | null) => void) => {
            if (event === "exit" || event === "close") {
              proc.exited.then((code: number | null) => handler(code));
            }
          },
        };
        this.worker = wrapper as unknown as ChildProcess;
      }

      this.setupStdoutReader();
      await this.waitForReady();

      // Check CUDA availability
      try {
        const info = await this.cudaInfo();
        this._cudaAvailable = info.available;
      } catch {}

      log.i("GPU", "Worker started", { cuda: this._cudaAvailable });
      return true;
    } catch (error) {
      log.e("GPU", "Failed to start worker", { error: (error as Error).message });
      return false;
    }
  }

  private setupStdoutReader(): void {
    if (!this.worker?.stdout) return;

    this.worker.stdout.on("data", (data: Buffer) => {
      this.responseBuffer += data.toString();
      this.processResponseBuffer();
    });

    this.worker.stdout.on("error", (error: Error) => {
      if (!this.isShuttingDown) {
        log.e("GPU", "stdout read error", { error: error.message });
        this.handleWorkerCrash();
      }
    });

    this.worker.on("exit", (code: number | null) => {
      if (!this.isShuttingDown) {
        log.w("GPU", "Worker exited", { code });
        this.handleWorkerCrash();
      }
    });
  }

  private processResponseBuffer(): void {
    const lines = this.responseBuffer.split("\n");
    this.responseBuffer = lines.pop() || "";

    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        const parsed = JSON.parse(line);
        // Handle pipe.ready message (special init message, not a request response)
        if (parsed.type === "pipe.ready" && parsed.path) {
          this.namedPipePath = parsed.path;
          log.d("GPU", "Received pipe.ready", { path: parsed.path });
          continue;
        }
        const response = parsed as GpuWorkerResponse;
        this.handleResponse(response);
      } catch {}
    }
  }

  private handleResponse(response: GpuWorkerResponse): void {
    const entry = this.pendingRequests.entries().next().value;
    if (entry) {
      const [requestId, pending] = entry;
      pending.abortController.abort();
      this.pendingRequests.delete(requestId);
      pending.resolve(response);
    }
  }

  private async waitForReady(): Promise<void> {
    // Wait for worker to send pipe.ready message with Named Pipe path
    // (namedPipePath is set by processResponseBuffer when it receives pipe.ready)
    const timeout = 5000;
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      if (this.namedPipePath) break;
      await sleep(50);
    }

    // Try to connect to Named Pipe if available
    if (this.namedPipePath) {
      try {
        // Extract pipeId from path
        const pipeId =
          this.namedPipePath.split(/[/\\]/).pop()?.replace("ultracode-gpu-", "").replace(".sock", "") || "";

        this.namedPipeClient = new NamedPipeClient({
          pipeId,
          timeout: this.config.timeout,
          onConnect: () => {
            log.i("GPU", "Connected to Named Pipe", { path: this.namedPipePath });
          },
          onDisconnect: () => {
            log.d("GPU", "Named Pipe disconnected");
            this.useNamedPipe = false;
          },
          onError: (err) => {
            log.w("GPU", "Named Pipe error", { error: err.message });
            this.useNamedPipe = false;
          },
        });

        await this.namedPipeClient.connect();
        this.useNamedPipe = true;
        log.i("GPU", "Using Named Pipe for binary IPC");
      } catch (error) {
        log.w("GPU", "Failed to connect to Named Pipe, using stdin/stdout", {
          error: (error as Error).message,
        });
        this.namedPipeClient = null;
        this.useNamedPipe = false;
      }
    } else {
      log.d("GPU", "Named Pipe not available, using stdin/stdout");
      await sleep(100);
    }
  }

  private async handleWorkerCrash(): Promise<void> {
    if (this.isShuttingDown) return;

    for (const [, pending] of this.pendingRequests) {
      pending.abortController.abort();
      pending.reject(new Error("Worker crashed"));
    }
    this.pendingRequests.clear();
    this.worker = null;

    if (this.config.autoRestart && this.restartCount < this.config.maxRestarts) {
      this.restartCount++;
      const started = await this.start();
      if (started && this.faissInitConfig) {
        await this.faissInitialize("_recovered", this.faissInitConfig);
      }
    }
  }

  async stop(): Promise<void> {
    this.isShuttingDown = true;

    // Disconnect Named Pipe client first
    if (this.namedPipeClient) {
      this.namedPipeClient.disconnect();
      this.namedPipeClient = null;
      this.useNamedPipe = false;
    }

    if (this.worker) {
      // Send graceful shutdown request via stdin (Named Pipe already closed)
      try {
        this.worker.stdin?.write(`${JSON.stringify({ type: "shutdown" })}\n`);
        await sleep(500);
      } catch {}

      // Kill immediately - don't rely on setTimeout which may not fire if parent exits
      if (this.worker) {
        try {
          this.worker.kill("SIGTERM");
        } catch {}
        this.worker = null;
      }
    }

    for (const [, pending] of this.pendingRequests) {
      pending.abortController.abort();
      pending.reject(new Error("Client shutting down"));
    }
    this.pendingRequests.clear();
  }

  isRunning(): boolean {
    return this.worker !== null && !this.isShuttingDown;
  }

  private async sendRequest(request: GpuWorkerRequest): Promise<GpuWorkerResponse> {
    if (!this.worker?.stdin) {
      throw new Error("Worker not running");
    }

    // Use Named Pipe for binary IPC if available
    if (this.useNamedPipe && this.namedPipeClient?.isConnected) {
      log.i("GPU", "Using Named Pipe", { type: request.type });
      return this.sendNamedPipeRequest(request);
    }

    // Fallback to stdin/stdout JSON
    const jsonStr = JSON.stringify(request);
    log.i("GPU", "Using stdin/stdout JSON", {
      type: request.type,
      jsonLen: jsonStr.length,
    });
    const requestId = ++this.requestId;
    const abortController = new AbortController();

    // Response promise - resolved when worker responds
    const responsePromise = new Promise<GpuWorkerResponse>((resolve, reject) => {
      this.pendingRequests.set(requestId, { resolve, reject, abortController });
      this.worker!.stdin!.write(`${jsonStr}\n`);
    });

    // Timeout promise - uses Bun-compatible async sleep instead of setTimeout
    const timeoutPromise = (async (): Promise<GpuWorkerResponse> => {
      await sleep(this.config.timeout ?? 30000);
      if (abortController.signal.aborted) {
        // Response already received, return never-resolving promise
        return new Promise(() => {});
      }
      this.pendingRequests.delete(requestId);
      throw new Error(`Request timeout: ${request.type}`);
    })();

    return Promise.race([responsePromise, timeoutPromise]);
  }

  /**
   * Send request via Named Pipe (binary protocol)
   * Uses queue to ensure only one request is pending at a time
   */
  private async sendNamedPipeRequest(request: GpuWorkerRequest): Promise<GpuWorkerResponse> {
    // Queue requests to prevent "Another request is pending" errors
    const previousRequest = this.namedPipeRequestQueue;
    const currentRequest = previousRequest
      .catch(() => {}) // Ignore previous errors
      .then(() => this.sendNamedPipeRequestInternal(request));
    this.namedPipeRequestQueue = currentRequest;
    return currentRequest;
  }

  /**
   * Internal Named Pipe request handler (called sequentially via queue)
   */
  private async sendNamedPipeRequestInternal(request: GpuWorkerRequest): Promise<GpuWorkerResponse> {
    if (!this.namedPipeClient?.isConnected) {
      throw new Error("Named Pipe not connected");
    }

    // Extract vectors from request if present (for binary transfer)
    const { vectors, headerData } = extractVectorsFromRequest(request);

    // Create binary packet
    const packet = createPacket(headerData, vectors);

    // Send and receive response
    const responseBuffer = await this.namedPipeClient.send(packet);
    const { header } = parsePacket(responseBuffer);

    return header as unknown as GpuWorkerResponse;
  }

  // =========================================================================
  // Faiss Operations
  // =========================================================================

  async faissInitialize(projectKey: string, config: FaissIndexConfig, loadPath?: string): Promise<FaissInitResponse> {
    this.faissInitConfig = config;

    if (!this.worker) {
      await this.start();
    }

    const response = await this.sendRequest({ type: "faiss.init", projectKey, config, loadPath });
    if (!response.success) throw new Error(extractGpuError(response));
    return response as FaissInitResponse;
  }

  async faissAdd(projectKey: string, ids: string[], vectors: Float32Array | number[]): Promise<FaissAddResponse> {
    const vectorArray = vectors instanceof Float32Array ? Array.from(vectors) : vectors;
    const response = await this.sendRequest({ type: "faiss.add", projectKey, ids, vectors: vectorArray });
    if (!response.success) throw new Error(extractGpuError(response));
    return response as FaissAddResponse;
  }

  async faissSearch(projectKey: string, vector: Float32Array | number[], k: number): Promise<FaissSearchResult[]> {
    const vectorArray = vector instanceof Float32Array ? Array.from(vector) : vector;
    log.i("GPU", "faissSearch input", {
      projectKey,
      vectorLen: vectorArray?.length,
      k,
      isArray: Array.isArray(vectorArray),
    });
    const request: FaissSearchRequest = { type: "faiss.search", projectKey, vector: vectorArray, k };
    const response = await this.sendRequest(request);
    if (!response.success) throw new Error(extractGpuError(response));
    return (response as FaissSearchResponse).results;
  }

  async faissBatchSearch(
    projectKey: string,
    vectors: Float32Array | number[],
    nQueries: number,
    k: number,
  ): Promise<FaissSearchResult[][]> {
    const vectorArray = vectors instanceof Float32Array ? Array.from(vectors) : vectors;
    const response = await this.sendRequest({
      type: "faiss.batchSearch",
      projectKey,
      vectors: vectorArray,
      nQueries,
      k,
    });
    if (!response.success) throw new Error(extractGpuError(response));
    return (response as FaissBatchSearchResponse).results;
  }

  async faissTrain(
    projectKey: string,
    vectors: Float32Array | number[],
    nVectors: number,
  ): Promise<FaissTrainResponse> {
    const vectorArray = vectors instanceof Float32Array ? Array.from(vectors) : vectors;
    const response = await this.sendRequest({ type: "faiss.train", projectKey, vectors: vectorArray, nVectors });
    if (!response.success) throw new Error(extractGpuError(response));
    return response as FaissTrainResponse;
  }

  async faissSave(projectKey: string, path?: string): Promise<FaissSaveResponse> {
    const savePath = path || join(getDataDir(), "faiss-index.bin");
    const response = await this.sendRequest({ type: "faiss.save", projectKey, path: savePath });
    if (!response.success) throw new Error(extractGpuError(response));
    return response as FaissSaveResponse;
  }

  async faissLoad(projectKey: string, path: string): Promise<FaissLoadResponse> {
    const response = await this.sendRequest({ type: "faiss.load", projectKey, path });
    if (!response.success) throw new Error(extractGpuError(response));
    return response as FaissLoadResponse;
  }

  async faissRemove(projectKey: string, ids: string[]): Promise<void> {
    const response = await this.sendRequest({ type: "faiss.remove", projectKey, ids });
    if (!response.success) throw new Error(extractGpuError(response));
  }

  async faissGetStats(projectKey: string): Promise<FaissStatsResponse["stats"] | undefined> {
    const response = await this.sendRequest({ type: "faiss.stats", projectKey });
    if (!response.success) throw new Error(extractGpuError(response));
    return (response as FaissStatsResponse).stats;
  }

  // =========================================================================
  // CUDA Operations
  // =========================================================================

  async cudaInfo(): Promise<CudaInfoResponse> {
    const response = await this.sendRequest({ type: "cuda.info" });
    if (!response.success) throw new Error(extractGpuError(response));
    return response as CudaInfoResponse;
  }

  isCudaAvailable(): boolean {
    return this._cudaAvailable;
  }

  async cudaCosineSimilarity(a: Float32Array | number[], b: Float32Array | number[]): Promise<number> {
    const vecA = a instanceof Float32Array ? Array.from(a) : a;
    const vecB = b instanceof Float32Array ? Array.from(b) : b;

    const response = await this.sendRequest({ type: "cuda.cosine", a: vecA, b: vecB });
    if (!response.success) throw new Error(extractGpuError(response));
    return (response as CudaCosineResponse).similarity;
  }

  async cudaBatchCosineSimilarity(
    query: Float32Array | number[],
    database: (Float32Array | number[])[],
  ): Promise<Float32Array> {
    const queryArr = query instanceof Float32Array ? Array.from(query) : query;
    const dbArr = database.map((v) => (v instanceof Float32Array ? Array.from(v) : v));

    const response = await this.sendRequest({ type: "cuda.batchCosine", query: queryArr, database: dbArr });
    if (!response.success) throw new Error(extractGpuError(response));
    return new Float32Array((response as CudaBatchCosineResponse).similarities);
  }

  async cudaEuclideanDistance(a: Float32Array | number[], b: Float32Array | number[]): Promise<number> {
    const vecA = a instanceof Float32Array ? Array.from(a) : a;
    const vecB = b instanceof Float32Array ? Array.from(b) : b;

    const response = await this.sendRequest({ type: "cuda.euclidean", a: vecA, b: vecB });
    if (!response.success) throw new Error(extractGpuError(response));
    return (response as CudaEuclideanResponse).distance;
  }

  async cudaNormalizeVectors(vectors: (Float32Array | number[])[]): Promise<Float32Array[]> {
    const input = vectors.map((v) => (v instanceof Float32Array ? Array.from(v) : v));

    const response = await this.sendRequest({ type: "cuda.normalize", vectors: input });
    if (!response.success) throw new Error(extractGpuError(response));
    return (response as CudaNormalizeResponse).vectors.map((v) => new Float32Array(v));
  }

  // =========================================================================
  // Adaptive Operations (auto-select CUDA vs CPU)
  // =========================================================================

  async adaptiveBatchCosineSimilarity(
    query: Float32Array,
    database: Float32Array[],
  ): Promise<{ similarities: Float32Array; usedCuda: boolean }> {
    const vectorCount = database.length;
    const dimensions = query.length;

    // Check if CUDA is beneficial for this workload
    if (this._cudaAvailable && shouldUseCudaBatchCosine(vectorCount, dimensions)) {
      try {
        const similarities = await this.cudaBatchCosineSimilarity(query, database);
        return { similarities, usedCuda: true };
      } catch (error) {
        log.w("GPU", "CUDA batch cosine failed, falling back to CPU", {
          error: (error as Error).message,
        });
      }
    }

    // CPU fallback using SIMD-optimized loop unrolling
    const similarities = new Float32Array(vectorCount);
    for (let i = 0; i < vectorCount; i++) {
      similarities[i] = cpuCosineSimilarity(query, database[i]!);
    }

    return { similarities, usedCuda: false };
  }

  async adaptiveNormalizeVectors(vectors: Float32Array[]): Promise<{ normalized: Float32Array[]; usedCuda: boolean }> {
    const vectorCount = vectors.length;
    const dimensions = vectors[0]?.length ?? 0;

    // Check if CUDA is beneficial for this workload
    if (this._cudaAvailable && shouldUseCudaNormalize(vectorCount, dimensions)) {
      try {
        const normalized = await this.cudaNormalizeVectors(vectors);
        return { normalized, usedCuda: true };
      } catch (error) {
        log.w("GPU", "CUDA normalize failed, falling back to CPU", {
          error: (error as Error).message,
        });
      }
    }

    // CPU fallback using SIMD-optimized normalization
    const normalized = vectors.map((v) => {
      const copy = new Float32Array(v);
      return simdL2Normalize(copy);
    });

    return { normalized, usedCuda: false };
  }

  getRecommendedStrategy(
    vectorCount: number,
    dimensions: number,
    isRebuild: boolean,
    queryBatchSize = 1,
  ): StrategyRecommendation {
    return getRecommendedStrategy(vectorCount, dimensions, isRebuild, queryBatchSize);
  }

  // =========================================================================
  // Combined Stats
  // =========================================================================

  async getStats(): Promise<GpuStatsResponse> {
    const response = await this.sendRequest({ type: "stats" });
    if (!response.success) throw new Error(extractGpuError(response));
    return response as GpuStatsResponse;
  }
}

// =============================================================================
// Factory and Singleton
// =============================================================================

let gpuClient: IGpuClient | null = null;

/**
 * Get GPU client (always subprocess mode)
 * All faiss-napi operations run in dedicated Node.js worker process
 */
export function getGpuClient(config?: GpuClientConfig): IGpuClient {
  if (!gpuClient) {
    log.i("GPU", "Using subprocess mode");
    gpuClient = new GpuSubprocessClient(config);
  }
  return gpuClient;
}

export async function shutdownGpuClient(): Promise<void> {
  if (gpuClient) {
    await gpuClient.stop();
    gpuClient = null;
  }
}

// Export class for direct use (GpuDirectClient removed - always use subprocess)
export { GpuSubprocessClient };
