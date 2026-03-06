import { existsSync } from "node:fs";
import { join } from "node:path";
import { getDataDir } from "../../utils/config-paths.js";
import { toError } from "../../utils/error-handling.js";
import { stringify } from "../../utils/fast-json.js";
import { sleep } from "../../utils/runtime.js";
import { LLAMACPP_EMBEDDING_PORT, llamacppEmbeddingManager } from "../llamacpp-server-manager.js";
import type { EmbeddingProvider, EmbedOptions, ProviderCapabilities, ProviderInfo, ProviderLogger } from "./base.js";

export interface LlamaCppOptions {
  model: string;
  baseUrl?: string | undefined;
  timeoutMs?: number | undefined;
  concurrency?: number | undefined;
  checkServer?: boolean | undefined;
  logger?: ProviderLogger | undefined;
  maxBatchSize?: number | undefined;
  /** Context size for the model (default: 2048 = 512 tokens * 4 parallel slots) */
  contextSize?: number | undefined;
  /** Number of GPU layers to offload (-1 for all, 0 for CPU only) */
  nGpuLayers?: number | undefined;
  /** Auto-start llama-server if not running (default: true) */
  autoStart?: boolean | undefined;
  /** Number of parallel request slots on server (default: 4) */
  parallelSlots?: number | undefined;
  /** Micro-batch size for embedding processing (default: 512) */
  ubatchSize?: number | undefined;
  /** Batch size for prompt processing (default: 1024) */
  batchSize?: number | undefined;
}

/**
 * llama.cpp Provider
 *
 * Connects to a local llama-server for embedding generation.
 * llama.cpp provides native inference without Docker using GGUF models.
 *
 * Setup:
 * llama-server --model ~/.ultracode/hf-cache/model.gguf \
 *   --port 8085 --host 127.0.0.1 \
 *   --ctx-size 8192 --n-gpu-layers 99 \
 *   --embedding
 *
 * Supported GGUF models (768 dims, compatible with e5-base):
 * - multilingual-e5-base-gguf
 * - nomic-embed-text-v1.5
 * - bge-base-en-v1.5
 *
 * Supported GGUF models (1024 dims, compatible with bge-m3):
 * - bge-m3-GGUF
 */
export class LlamaCppProvider implements EmbeddingProvider {
  public info: ProviderInfo;
  private baseUrl: string;
  private timeoutMs: number;
  private concurrency: number;
  private checkServer: boolean;
  private log?: ProviderLogger | undefined;
  private maxBatchSize: number;
  private contextSize: number;
  private nGpuLayers: number;
  private autoStart: boolean;
  // Server performance tuning
  private parallelSlots: number;
  private ubatchSize: number;
  private batchSize: number;

  constructor(opts: LlamaCppOptions) {
    this.log = opts.logger;
    this.baseUrl = opts.baseUrl ?? "http://127.0.0.1:8085";
    this.timeoutMs = opts.timeoutMs ?? 30_000;
    // Default concurrency should match server --parallel
    this.concurrency = Math.max(1, opts.concurrency ?? 4);
    this.checkServer = opts.checkServer !== false;
    // Default maxBatchSize: 256 texts per HTTP request (llamacpp handles well)
    this.maxBatchSize = opts.maxBatchSize ?? 256;
    // Default contextSize: 2048 (512 tokens per slot * 4 parallel slots)
    this.contextSize = opts.contextSize ?? 2048;
    this.nGpuLayers = opts.nGpuLayers ?? 99; // Default: offload all to GPU
    this.autoStart = opts.autoStart !== false; // Default: true
    // Server tuning parameters
    this.parallelSlots = opts.parallelSlots ?? 8;
    this.ubatchSize = opts.ubatchSize ?? 1536;
    this.batchSize = opts.batchSize ?? 3072;

    this.info = {
      name: "llamacpp",
      model: opts.model,
      supportsBatch: true,
      maxBatchSize: this.maxBatchSize,
    };
  }

  async initialize(): Promise<void> {
    this.log?.info("initialize", {
      model: this.info.model,
      baseUrl: this.baseUrl,
      timeoutMs: this.timeoutMs,
      concurrency: this.concurrency,
      contextSize: this.contextSize,
      nGpuLayers: this.nGpuLayers,
      autoStart: this.autoStart,
      parallelSlots: this.parallelSlots,
      ubatchSize: this.ubatchSize,
      batchSize: this.batchSize,
    });

    // Auto-start llama-server if not running and autoStart is enabled
    if (this.autoStart && !llamacppEmbeddingManager.getState().isRunning) {
      const modelPath = this.findModelPath();
      if (modelPath) {
        this.log?.info("auto-starting llama-server", {
          modelPath,
          contextSize: this.contextSize,
          parallel: this.parallelSlots,
          ubatch: this.ubatchSize,
          batch: this.batchSize,
        });
        const started = await llamacppEmbeddingManager.ensureRunning({
          modelPath,
          mode: "embedding",
          port: LLAMACPP_EMBEDDING_PORT,
          contextSize: this.contextSize,
          nGpuLayers: this.nGpuLayers,
          parallelSlots: this.parallelSlots,
          ubatchSize: this.ubatchSize,
          batchSize: this.batchSize,
        });
        if (!started) {
          this.log?.warn("llama-server auto-start failed, will try connecting anyway");
        }
      }
    }

    if (this.checkServer) {
      await this.waitForReady();
    }

    // Warmup call to determine dimension
    try {
      const vec = await this.embed("warmup text");
      this.info.dimension = vec.length;
      this.log?.info("initialized", { dimension: this.info.dimension });
    } catch (error: unknown) {
      const err = toError(error);
      this.log?.error("warmup failed", { error: err.message }, undefined, err);
      throw new Error(
        `llama.cpp warmup failed: ${err.message}\n` +
          `Make sure llama-server is running:\n` +
          `llama-server --model model.gguf --port 8085 --embedding`,
      );
    }
  }

  /**
   * Wait for llama-server to be fully ready
   */
  private async waitForReady(maxWaitMs = 120_000): Promise<void> {
    const startTime = Date.now();
    const checkInterval = 1000;
    let lastError = "";

    this.log?.info("Waiting for llama-server to be ready...");

    while (Date.now() - startTime < maxWaitMs) {
      try {
        const healthRes = await fetch(`${this.baseUrl}/health`, {
          method: "GET",
          signal: AbortSignal.timeout(5000),
        });

        if (healthRes.ok) {
          const elapsed = Math.round((Date.now() - startTime) / 1000);
          this.log?.info("llama-server is ready", { waitedSeconds: elapsed });
          return;
        }

        const status = healthRes.status.toString();
        if (status !== lastError) {
          this.log?.debug("llama-server not ready yet", {
            status,
            elapsed: Math.round((Date.now() - startTime) / 1000),
          });
          lastError = status;
        }
      } catch (error: unknown) {
        const err = toError(error);
        if (!err.message?.includes("ECONNREFUSED") && err.message !== lastError) {
          this.log?.debug("llama-server health check error", { error: err.message });
          lastError = err.message;
        }
      }

      await sleep(checkInterval);
    }

    throw new Error(
      `llama-server did not become ready within ${maxWaitMs / 1000} seconds.\n` +
        `Please ensure llama-server is running:\n` +
        `llama-server --model model.gguf --port 8085 --embedding`,
    );
  }

  /**
   * Find GGUF model path
   * Searches in standard locations
   */
  private findModelPath(): string | null {
    const dataDir = getDataDir();

    // Standard locations for GGUF models
    const searchPaths = [
      join(dataDir, "hf-cache", "multilingual-e5-base-Q8_0.gguf"),
      join(dataDir, "hf-cache", "multilingual-e5-base-q8_0.gguf"),
      join(dataDir, "llamacpp", "models", "multilingual-e5-base-Q8_0.gguf"),
      join(dataDir, "llamacpp", "models", "multilingual-e5-base.gguf"),
      join(dataDir, "models", "multilingual-e5-base-Q8_0.gguf"),
    ];

    for (const path of searchPaths) {
      if (existsSync(path)) {
        return path;
      }
    }

    // Try to find any .gguf file in hf-cache
    const hfCache = join(dataDir, "hf-cache");
    if (existsSync(hfCache)) {
      try {
        const fs = require("node:fs");
        const files = fs.readdirSync(hfCache) as string[];
        const gguf = files.find((f: string) => f.endsWith(".gguf"));
        if (gguf) {
          return join(hfCache, gguf);
        }
      } catch {
        // Ignore errors
      }
    }

    return null;
  }

  getDimension(): number | undefined {
    return this.info.dimension;
  }

  async embed(text: string, opts?: EmbedOptions): Promise<Float32Array> {
    this.log?.debug("embed()", { len: text?.length }, opts?.requestId);

    try {
      // llama.cpp uses OpenAI-compatible /v1/embeddings endpoint
      const res = await fetch(`${this.baseUrl}/v1/embeddings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: stringify.vllmEmbedding({
          model: this.info.model,
          input: text,
        }),
        signal: opts?.signal ?? AbortSignal.timeout(this.timeoutMs),
      });

      if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new Error(`llama.cpp HTTP ${res.status}: ${body}`);
      }

      const json = (await res.json()) as {
        data: Array<{ embedding: number[]; index: number }>;
        model: string;
        usage?: { prompt_tokens: number; total_tokens: number };
      };

      if (!json.data?.[0]?.embedding) {
        throw new Error("llama.cpp invalid response format");
      }

      const arr = new Float32Array(json.data[0].embedding);
      this.info.dimension = this.info.dimension ?? arr.length;
      return arr;
    } catch (error: unknown) {
      const err = toError(error);
      this.log?.error("embed failed", { error: err.message }, opts?.requestId, err);

      if (err.message?.includes("ECONNREFUSED")) {
        throw new Error(`llama-server not reachable at ${this.baseUrl}. Is the server running?`);
      }

      throw new Error(`llama.cpp embed error: ${err.message}`);
    }
  }

  async embedBatch(texts: string[], opts?: EmbedOptions): Promise<Float32Array[]> {
    this.log?.debug("embedBatch()", { count: texts.length, maxBatchSize: this.maxBatchSize }, opts?.requestId);

    // Split into chunks if needed
    if (texts.length > this.maxBatchSize) {
      const chunks: { idx: number; texts: string[] }[] = [];
      for (let i = 0; i < texts.length; i += this.maxBatchSize) {
        chunks.push({ idx: chunks.length, texts: texts.slice(i, i + this.maxBatchSize) });
      }

      const results: { idx: number; embeddings: Float32Array[] }[] = [];
      let inFlight = 0;

      const processChunk = async (chunk: { idx: number; texts: string[] }) => {
        const embeddings = await this.embedBatchInternal(chunk.texts, opts);
        return { idx: chunk.idx, embeddings };
      };

      const pending: Promise<void>[] = [];

      for (const chunk of chunks) {
        while (inFlight >= this.concurrency) {
          await Promise.race(pending);
        }

        inFlight++;
        const promise = processChunk(chunk).then((result) => {
          results.push(result);
          inFlight--;
          pending.splice(pending.indexOf(promise), 1);
        });
        pending.push(promise);
      }

      await Promise.all(pending);

      results.sort((a, b) => a.idx - b.idx);
      const allEmbeddings: Float32Array[] = [];
      for (const r of results) {
        allEmbeddings.push(...r.embeddings);
      }
      return allEmbeddings;
    }

    return this.embedBatchInternal(texts, opts);
  }

  private async embedBatchInternal(texts: string[], opts?: EmbedOptions): Promise<Float32Array[]> {
    try {
      // llama.cpp OpenAI-compatible API accepts array of strings
      const res = await fetch(`${this.baseUrl}/v1/embeddings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: stringify.vllmEmbedding({
          model: this.info.model,
          input: texts,
        }),
        signal: opts?.signal ?? AbortSignal.timeout(this.timeoutMs),
      });

      if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new Error(`llama.cpp HTTP ${res.status}: ${body}`);
      }

      const json = (await res.json()) as {
        data: Array<{ embedding: number[]; index: number }>;
        model: string;
        usage?: { prompt_tokens: number; total_tokens: number };
      };

      if (!Array.isArray(json.data)) {
        throw new Error("llama.cpp invalid batch response format");
      }

      // Sort by index to ensure correct order
      const sorted = [...json.data].sort((a, b) => a.index - b.index);

      const embeddings = sorted.map((item) => {
        const arr = new Float32Array(item.embedding);
        this.info.dimension = this.info.dimension ?? arr.length;
        return arr;
      });

      return embeddings;
    } catch (error: unknown) {
      const err = toError(error);
      this.log?.error("embedBatch failed", { error: err.message }, opts?.requestId, err);

      if (err.message?.includes("ECONNREFUSED")) {
        throw new Error(`llama-server not reachable at ${this.baseUrl}. Is the server running?`);
      }

      throw new Error(`llama.cpp embedBatch error: ${err.message}`);
    }
  }

  async close(): Promise<void> {
    // llama-server is managed externally or by llamacpp-server-manager
    // No cleanup needed here
  }

  getCapabilities(): ProviderCapabilities {
    return {
      embeddings: true,
      rerank: false, // llama.cpp doesn't support rerank
      score: false, // llama.cpp doesn't support score
      classify: false, // llama.cpp doesn't support classify
    };
  }
}
