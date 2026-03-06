import { toError } from "../../utils/error-handling.js";
import { stringify } from "../../utils/fast-json.js";
import { sleep } from "../../utils/runtime.js";
import type {
  EmbeddingProvider,
  EmbedOptions,
  ProviderCapabilities,
  ProviderInfo,
  ProviderLogger,
  RerankDocument,
  RerankOptions,
  RerankResult,
  ScoreOptions,
  ScoreResult,
} from "./base.js";

export interface VLLMOptions {
  model: string;
  baseUrl?: string | undefined;
  timeoutMs?: number | undefined;
  concurrency?: number | undefined;
  checkServer?: boolean | undefined;
  logger?: ProviderLogger | undefined;
  maxBatchSize?: number | undefined;
  encodingFormat?: "float" | "base64" | undefined;
}

/**
 * vLLM Provider
 *
 * Connects to a local vLLM Docker container for embedding generation.
 * vLLM provides high-performance GPU inference with OpenAI-compatible API.
 *
 * Setup (vLLM v0.14+):
 * docker run -d --name vllm-server -p 8000:8000 \
 *   --gpus all \
 *   -v ~/.cache/huggingface:/root/.cache/huggingface \
 *   vllm/vllm-openai:latest-cu130 \
 *   intfloat/multilingual-e5-small \
 *   --gpu-memory-utilization 0.8 --disable-log-requests
 *
 * Note: vLLM auto-detects embedding models by architecture.
 * Supports encoding_format: "base64" for ~33% smaller payloads (vLLM 0.14+).
 */
export class VLLMProvider implements EmbeddingProvider {
  public info: ProviderInfo;
  private baseUrl: string;
  private timeoutMs: number;
  private concurrency: number;
  private checkServer: boolean;
  private log?: ProviderLogger | undefined;
  private maxBatchSize: number;
  private encodingFormat: "float" | "base64";

  constructor(opts: VLLMOptions) {
    this.log = opts.logger;
    this.baseUrl = opts.baseUrl ?? "http://127.0.0.1:8000";
    this.timeoutMs = opts.timeoutMs ?? 30_000;
    this.concurrency = Math.max(1, opts.concurrency ?? 8);
    this.checkServer = opts.checkServer !== false;
    this.maxBatchSize = opts.maxBatchSize ?? 100;
    this.encodingFormat = opts.encodingFormat ?? "float";

    this.info = {
      name: "vllm",
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
    });

    if (this.checkServer) {
      await this.ensureContainerRunning();
    }

    // Wait for vLLM to be ready
    await this.waitForReady();

    // Warmup call to determine dimension
    try {
      const vec = await this.embed("warmup text");
      this.info.dimension = vec.length;
      this.log?.info("initialized", { dimension: this.info.dimension });
    } catch (error: unknown) {
      const err = toError(error);
      this.log?.error("warmup failed", { error: err.message });
      throw new Error(
        `vLLM warmup failed: ${err.message}\n` +
          `Make sure vLLM Docker container is running:\n` +
          `docker run -d --name vllm-server -p 8000:8000 --gpus all \\\n` +
          `  -v ~/.cache/huggingface:/root/.cache/huggingface \\\n` +
          `  vllm/vllm-openai:latest-cu130 ${this.info.model} \\\n` +
          `  --gpu-memory-utilization 0.8 --disable-log-requests`,
      );
    }
  }

  /**
   * Ensure vLLM Docker container is running
   */
  private async ensureContainerRunning(): Promise<void> {
    try {
      const healthCheck = await fetch(`${this.baseUrl}/health`, {
        method: "GET",
        signal: AbortSignal.timeout(2000),
      }).catch(() => null);

      if (healthCheck?.ok) {
        this.log?.debug("vLLM container already running");
        return;
      }

      this.log?.info("vLLM container not running, attempting to start...");

      const { exec } = await import("node:child_process");
      const { promisify } = await import("node:util");
      const execPromise = promisify(exec);

      // Check if container exists
      const { stdout: containerList } = await execPromise(
        'docker ps -a --filter "name=vllm-server" --format "{{.Names}}"',
        { windowsHide: true },
      ).catch(() => ({ stdout: "" }));

      if (!containerList.includes("vllm-server")) {
        throw new Error("vLLM Docker container 'vllm-server' not found. Please run setup-embedding first.");
      }

      // Start the container
      await execPromise("docker start vllm-server", { windowsHide: true });
      this.log?.info("Started vLLM Docker container");

      // Wait for container to be ready
      const maxWaitTime = 30_000;
      const startTime = Date.now();
      while (Date.now() - startTime < maxWaitTime) {
        const check = await fetch(`${this.baseUrl}/health`, {
          method: "GET",
          signal: AbortSignal.timeout(2000),
        }).catch(() => null);

        if (check?.ok) {
          this.log?.info("vLLM container is ready");
          return;
        }

        await sleep(2000);
      }

      throw new Error("vLLM container started but did not become ready within 30 seconds");
    } catch (error: unknown) {
      const err = toError(error);
      this.log?.warn("Failed to auto-start vLLM container", { error: err.message });
      throw new Error(`vLLM auto-start failed: ${err.message}\nPlease start manually: docker start vllm-server`);
    }
  }

  /**
   * Wait for vLLM server to be fully ready
   */
  private async waitForReady(maxWaitMs = 300_000): Promise<void> {
    const startTime = Date.now();
    const checkInterval = 3000;
    let lastStatus = "";

    this.log?.info("Waiting for vLLM to be ready (model may be downloading)...");

    while (Date.now() - startTime < maxWaitMs) {
      try {
        const healthRes = await fetch(`${this.baseUrl}/health`, {
          method: "GET",
          signal: AbortSignal.timeout(5000),
        });

        if (healthRes.ok) {
          const elapsed = Math.round((Date.now() - startTime) / 1000);
          this.log?.info("vLLM is ready", { waitedSeconds: elapsed });
          return;
        }

        const status = healthRes.status.toString();
        if (status !== lastStatus) {
          this.log?.debug("vLLM not ready yet", { status, elapsed: Math.round((Date.now() - startTime) / 1000) });
          lastStatus = status;
        }
      } catch (error: unknown) {
        const err = toError(error);
        if (!err.message?.includes("ECONNREFUSED")) {
          this.log?.debug("vLLM health check error", { error: err.message });
        }
      }

      await sleep(checkInterval);
    }

    throw new Error(
      `vLLM did not become ready within ${maxWaitMs / 1000} seconds.\n` +
        `Model may still be downloading. Check: docker logs vllm-server`,
    );
  }

  getDimension(): number | undefined {
    return this.info.dimension;
  }

  async embed(text: string, opts?: EmbedOptions): Promise<Float32Array> {
    this.log?.debug("embed()", { len: text?.length }, opts?.requestId);

    try {
      // vLLM uses OpenAI-compatible /v1/embeddings endpoint
      const res = await fetch(`${this.baseUrl}/v1/embeddings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: stringify.vllmEmbedding({
          model: this.info.model,
          input: text,
          encoding_format: this.encodingFormat,
        }),
      });

      if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new Error(`vLLM HTTP ${res.status}: ${body}`);
      }

      const json = (await res.json()) as {
        data: Array<{ embedding: number[] | string; index: number }>;
        model: string;
        usage?: { prompt_tokens: number; total_tokens: number };
      };

      if (!json.data?.[0]?.embedding) {
        throw new Error("vLLM invalid response format");
      }

      const raw = json.data[0].embedding;
      const arr = typeof raw === "string" ? this.decodeBase64ToFloat32(raw) : new Float32Array(raw);
      this.info.dimension = this.info.dimension ?? arr.length;
      return arr;
    } catch (error: unknown) {
      const err = toError(error);
      this.log?.error("embed failed", { error: err.message }, opts?.requestId, err);

      if (err.message?.includes("ECONNREFUSED")) {
        throw new Error(`vLLM server not reachable at ${this.baseUrl}. Is Docker container running?`);
      }

      throw new Error(`vLLM embed error: ${err.message}`);
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
      // vLLM OpenAI-compatible API accepts array of strings
      const res = await fetch(`${this.baseUrl}/v1/embeddings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: stringify.vllmEmbedding({
          model: this.info.model,
          input: texts,
          encoding_format: this.encodingFormat,
        }),
      });

      if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new Error(`vLLM HTTP ${res.status}: ${body}`);
      }

      const json = (await res.json()) as {
        data: Array<{ embedding: number[] | string; index: number }>;
        model: string;
        usage?: { prompt_tokens: number; total_tokens: number };
      };

      if (!Array.isArray(json.data)) {
        throw new Error("vLLM invalid batch response format");
      }

      // Sort by index to ensure correct order
      const sorted = [...json.data].sort((a, b) => a.index - b.index);

      const embeddings = sorted.map((item) => {
        const arr =
          typeof item.embedding === "string"
            ? this.decodeBase64ToFloat32(item.embedding)
            : new Float32Array(item.embedding);
        this.info.dimension = this.info.dimension ?? arr.length;
        return arr;
      });

      return embeddings;
    } catch (error: unknown) {
      const err = toError(error);
      this.log?.error("embedBatch failed", { error: err.message }, opts?.requestId, err);

      if (err.message?.includes("ECONNREFUSED")) {
        throw new Error(`vLLM server not reachable at ${this.baseUrl}. Is Docker container running?`);
      }

      throw new Error(`vLLM embedBatch error: ${err.message}`);
    }
  }

  /**
   * Decode base64-encoded Float32 array (vLLM 0.14+ encoding_format: "base64")
   */
  private decodeBase64ToFloat32(base64: string): Float32Array {
    const binaryString = atob(base64);
    const floatCount = binaryString.length / 4;
    const result = new Float32Array(floatCount);
    const bytes = new Uint8Array(result.buffer);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return result;
  }

  async close(): Promise<void> {}

  // ═══════════════════════════════════════════════════════════════
  // Extended Capabilities: Rerank, Score
  // ═══════════════════════════════════════════════════════════════

  getCapabilities(): ProviderCapabilities {
    return {
      embeddings: true,
      rerank: true,
      score: true,
      classify: true,
    };
  }

  /**
   * Rerank documents by relevance to query
   * Uses vLLM's /v1/rerank endpoint for cross-encoder scoring
   */
  async rerank(query: string, documents: RerankDocument[], opts?: RerankOptions): Promise<RerankResult[]> {
    this.log?.debug("rerank()", { query: query.slice(0, 50), docCount: documents.length }, opts?.requestId);

    try {
      const res = await fetch(`${this.baseUrl}/v1/rerank`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: stringify.vllmRerank({
          model: this.info.model,
          query,
          documents: documents.map((d) => d.text),
          top_n: opts?.topK,
        }),
        ...(opts?.signal ? { signal: opts.signal } : {}),
      });

      if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new Error(`vLLM rerank HTTP ${res.status}: ${body}`);
      }

      const json = (await res.json()) as {
        results: Array<{ index: number; relevance_score: number }>;
      };

      let results: RerankResult[] = json.results.map((r) => ({
        index: r.index,
        id: documents[r.index]?.id,
        score: r.relevance_score,
        text: documents[r.index]?.text ?? "",
      }));

      // Apply threshold filter if specified
      if (opts?.threshold !== undefined) {
        results = results.filter((r) => r.score >= opts.threshold!);
      }

      // Sort by score descending
      results.sort((a, b) => b.score - a.score);

      this.log?.debug("rerank() complete", { resultCount: results.length }, opts?.requestId);
      return results;
    } catch (error: unknown) {
      const err = toError(error);
      this.log?.error("rerank failed", { error: err.message }, opts?.requestId, err);
      throw new Error(`vLLM rerank error: ${err.message}`);
    }
  }

  /**
   * Calculate similarity score between query and document
   * Uses vLLM's /v1/score endpoint
   */
  async score(query: string, document: string, opts?: ScoreOptions): Promise<ScoreResult> {
    const results = await this.scoreBatch(query, [document], opts);
    return results[0] ?? { score: 0 };
  }

  /**
   * Batch score: calculate similarity for query vs multiple documents
   * Uses vLLM's /v1/score endpoint
   */
  async scoreBatch(query: string, documents: string[], opts?: ScoreOptions): Promise<ScoreResult[]> {
    this.log?.debug("scoreBatch()", { query: query.slice(0, 50), docCount: documents.length }, opts?.requestId);

    try {
      const res = await fetch(`${this.baseUrl}/v1/score`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: stringify.vllmScore({
          model: this.info.model,
          text_1: query,
          text_2: documents,
        }),
        ...(opts?.signal ? { signal: opts.signal } : {}),
      });

      if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new Error(`vLLM score HTTP ${res.status}: ${body}`);
      }

      const json = (await res.json()) as {
        data: Array<{ index: number; score: number }>;
      };

      const results: ScoreResult[] = json.data.sort((a, b) => a.index - b.index).map((d) => ({ score: d.score }));

      this.log?.debug("scoreBatch() complete", { resultCount: results.length }, opts?.requestId);
      return results;
    } catch (error: unknown) {
      const err = toError(error);
      this.log?.error("scoreBatch failed", { error: err.message }, opts?.requestId, err);
      throw new Error(`vLLM score error: ${err.message}`);
    }
  }
}
