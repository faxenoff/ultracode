/**
 * MLX Embedding Provider
 *
 * Connects to the local MLX embedding server for embedding generation.
 * Uses Apple MLX framework via Metal GPU on macOS ARM64.
 *
 * The server provides OpenAI-compatible /v1/embeddings API,
 * so this provider follows the same pattern as llama.cpp/vLLM providers.
 */

import { toError } from "../../utils/error-handling.js";
import { stringify } from "../../utils/fast-json.js";
import { sleep } from "../../utils/runtime.js";
import { MLX_EMBEDDING_PORT, mlxEmbeddingManager } from "../mlx-server-manager.js";
import type { EmbeddingProvider, EmbedOptions, ProviderCapabilities, ProviderInfo, ProviderLogger } from "./base.js";

export interface MlxProviderOptions {
  model: string;
  baseUrl?: string | undefined;
  timeoutMs?: number | undefined;
  concurrency?: number | undefined;
  checkServer?: boolean | undefined;
  logger?: ProviderLogger | undefined;
  maxBatchSize?: number | undefined;
  /** Auto-start MLX server if not running (default: true) */
  autoStart?: boolean | undefined;
}

/**
 * MLX Provider
 *
 * Connects to a local MLX embedding server for embedding generation.
 * MLX provides native Metal GPU inference on Apple Silicon.
 *
 * Setup (automatic via mlx-server-manager):
 *   python external-tools/mlx-embedding-server/server.py \
 *     --model intfloat/multilingual-e5-base --port 8087
 */
export class MlxProvider implements EmbeddingProvider {
  public info: ProviderInfo;
  private baseUrl: string;
  private timeoutMs: number;
  private concurrency: number;
  private checkServer: boolean;
  private log?: ProviderLogger | undefined;
  private maxBatchSize: number;
  private autoStart: boolean;

  constructor(opts: MlxProviderOptions) {
    this.log = opts.logger;
    this.baseUrl = opts.baseUrl ?? `http://127.0.0.1:${MLX_EMBEDDING_PORT}`;
    this.timeoutMs = opts.timeoutMs ?? 30_000;
    this.concurrency = Math.max(1, opts.concurrency ?? 4);
    this.checkServer = opts.checkServer !== false;
    this.maxBatchSize = opts.maxBatchSize ?? 128;
    this.autoStart = opts.autoStart !== false;

    this.info = {
      name: "mlx",
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
      autoStart: this.autoStart,
    });

    // Auto-start MLX server if not running and autoStart is enabled
    if (this.autoStart && !mlxEmbeddingManager.getState().isRunning) {
      this.log?.info("auto-starting MLX server", { model: this.info.model });
      const started = await mlxEmbeddingManager.ensureRunning({
        model: this.info.model,
        port: MLX_EMBEDDING_PORT,
      });
      if (!started) {
        this.log?.warn("MLX server auto-start failed, will try connecting anyway");
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
        `MLX warmup failed: ${err.message}\n` +
          `Make sure MLX server is running:\n` +
          `python external-tools/mlx-embedding-server/server.py --model ${this.info.model} --port ${MLX_EMBEDDING_PORT}`,
      );
    }
  }

  /**
   * Wait for MLX server to be fully ready
   */
  private async waitForReady(maxWaitMs = 300_000): Promise<void> {
    const startTime = Date.now();
    const checkInterval = 1000;
    let lastError = "";

    this.log?.info("Waiting for MLX server to be ready...");

    while (Date.now() - startTime < maxWaitMs) {
      try {
        const healthRes = await fetch(`${this.baseUrl}/health`, {
          method: "GET",
          signal: AbortSignal.timeout(5000),
        });

        if (healthRes.ok) {
          const elapsed = Math.round((Date.now() - startTime) / 1000);
          this.log?.info("MLX server is ready", { waitedSeconds: elapsed });
          return;
        }

        const status = healthRes.status.toString();
        if (status !== lastError) {
          this.log?.debug("MLX server not ready yet", {
            status,
            elapsed: Math.round((Date.now() - startTime) / 1000),
          });
          lastError = status;
        }
      } catch (error: unknown) {
        const err = toError(error);
        if (!err.message?.includes("ECONNREFUSED") && err.message !== lastError) {
          this.log?.debug("MLX server health check error", { error: err.message });
          lastError = err.message;
        }
      }

      await sleep(checkInterval);
    }

    throw new Error(
      `MLX server did not become ready within ${maxWaitMs / 1000} seconds.\n` +
        `Please ensure the MLX server is running:\n` +
        `python external-tools/mlx-embedding-server/server.py --model ${this.info.model} --port ${MLX_EMBEDDING_PORT}`,
    );
  }

  getDimension(): number | undefined {
    return this.info.dimension;
  }

  async embed(text: string, opts?: EmbedOptions): Promise<Float32Array> {
    this.log?.debug("embed()", { len: text?.length }, opts?.requestId);

    try {
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
        throw new Error(`MLX HTTP ${res.status}: ${body}`);
      }

      const json = (await res.json()) as {
        data: Array<{ embedding: number[]; index: number }>;
        model: string;
        usage?: { prompt_tokens: number; total_tokens: number };
      };

      if (!json.data?.[0]?.embedding) {
        throw new Error("MLX invalid response format");
      }

      const arr = new Float32Array(json.data[0].embedding);
      this.info.dimension = this.info.dimension ?? arr.length;
      return arr;
    } catch (error: unknown) {
      const err = toError(error);
      this.log?.error("embed failed", { error: err.message }, opts?.requestId, err);

      if (err.message?.includes("ECONNREFUSED")) {
        throw new Error(`MLX server not reachable at ${this.baseUrl}. Is the server running?`);
      }

      throw new Error(`MLX embed error: ${err.message}`);
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
        throw new Error(`MLX HTTP ${res.status}: ${body}`);
      }

      const json = (await res.json()) as {
        data: Array<{ embedding: number[]; index: number }>;
        model: string;
        usage?: { prompt_tokens: number; total_tokens: number };
      };

      if (!Array.isArray(json.data)) {
        throw new Error("MLX invalid batch response format");
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
        throw new Error(`MLX server not reachable at ${this.baseUrl}. Is the server running?`);
      }

      throw new Error(`MLX embedBatch error: ${err.message}`);
    }
  }

  async close(): Promise<void> {
    // MLX server is managed by mlx-server-manager
    // No cleanup needed here
  }

  getCapabilities(): ProviderCapabilities {
    return {
      embeddings: true,
      rerank: false,
      score: false,
      classify: false,
    };
  }
}
