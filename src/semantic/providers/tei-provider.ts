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
} from "./base.js";

export interface TEIOptions {
  model: string;
  baseUrl?: string | undefined;
  timeoutMs?: number | undefined;
  concurrency?: number | undefined;
  checkServer?: boolean;
  logger?: ProviderLogger;
  maxBatchSize?: number | undefined; // Max texts per request (TEI max_client_batch_size)
}

/**
 * Text Embeddings Inference (TEI) Provider
 *
 * Connects to a local TEI Docker container for embedding generation.
 * TEI is HuggingFace's optimized inference server for embeddings.
 *
 * Setup:
 * docker run -d --name tei-server -p 8081:80 \
 *   --pull always \
 *   ghcr.io/huggingface/text-embeddings-inference:latest \
 *   --model-id ibm-granite/granite-embedding-english-r2
 */
export class TEIProvider implements EmbeddingProvider {
  public info: ProviderInfo;
  private baseUrl: string;
  private timeoutMs: number;
  private concurrency: number;
  private checkServer: boolean;
  private log?: ProviderLogger | undefined;
  private maxBatchSize: number;

  constructor(opts: TEIOptions) {
    this.log = opts.logger;
    this.baseUrl = opts.baseUrl ?? "http://127.0.0.1:8081";
    this.timeoutMs = opts.timeoutMs ?? 30_000;
    this.concurrency = Math.max(1, opts.concurrency ?? 16); // High concurrency for GPU saturation
    this.checkServer = opts.checkServer !== false;
    this.maxBatchSize = opts.maxBatchSize ?? 500; // TEI default max_client_batch_size

    this.info = {
      name: "tei",
      model: opts.model,
      supportsBatch: true,
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
      // Try to start container if it exists but is not running
      await this.ensureContainerRunning();
    }

    // Wait for TEI to be ready (model loading can take time)
    try {
      await this.waitForReady();
    } catch (err) {
      if (!this.checkServer) throw err;
      // Container not responding — try docker restart and wait again
      this.log?.warn("TEI not responding, attempting docker restart...", { err: (err as Error).message });
      const restarted = await this.restartContainer();
      if (!restarted) throw err; // container doesn't exist, give up now
      this.log?.info("Waiting for TEI after restart (up to 90s)...");
      await this.waitForReady(90_000, false); // don't fast-fail after restart — Docker needs time to bind port
    }

    // Get model info including max_input_length and max_client_batch_size
    try {
      const infoRes = await fetch(`${this.baseUrl}/info`, {
        method: "GET",
        signal: AbortSignal.timeout(5000),
      });
      if (infoRes.ok) {
        const modelInfo = (await infoRes.json()) as {
          max_input_length?: number;
          max_client_batch_size?: number;
          model_id?: string | undefined;
        };
        this.info.maxTokens = modelInfo.max_input_length || 512;
        // Use server's max_client_batch_size if available and not overridden
        if (modelInfo.max_client_batch_size && this.maxBatchSize === 500) {
          this.maxBatchSize = modelInfo.max_client_batch_size;
        }
        this.log?.debug("TEI model info", {
          maxTokens: this.info.maxTokens,
          maxBatchSize: this.maxBatchSize,
          model: modelInfo.model_id,
        });
      }
    } catch {
      this.info.maxTokens = 512; // Default fallback
    }

    // Warmup call to determine dimension
    try {
      const vec = await this.embed("warmup text");
      this.info.dimension = vec.length;
      this.log?.info("initialized", { dimension: this.info.dimension, maxTokens: this.info.maxTokens });
    } catch (error: unknown) {
      const err = toError(error);
      this.log?.error("warmup failed", { error: err.message }, undefined, err);
      throw new Error(
        `TEI warmup failed: ${err.message}\n` +
          `Make sure TEI Docker container is running:\n` +
          `docker run -d --name tei-server -p 8081:80 \\\n` +
          `  ghcr.io/huggingface/text-embeddings-inference:latest \\\n` +
          `  --model-id ${this.info.model}`,
      );
    }
  }

  /**
   * Ensure TEI Docker container is running, start it if it exists but is stopped
   */
  private async ensureContainerRunning(): Promise<void> {
    try {
      // Check if container is already running
      const healthCheck = await fetch(`${this.baseUrl}/health`, {
        method: "GET",
        signal: AbortSignal.timeout(2000),
      }).catch(() => null);

      if (healthCheck?.ok) {
        this.log?.debug("TEI container already running");
        return;
      }

      // Container not responding, try to start it
      this.log?.info("TEI container not running, attempting to start...");

      // Check if Docker is available
      const { exec } = await import("node:child_process");
      const { promisify } = await import("node:util");
      const execPromise = promisify(exec);

      // Check if container exists
      const { stdout: containerList } = await execPromise(
        'docker ps -a --filter "name=tei-server" --format "{{.Names}}"',
        { windowsHide: true },
      ).catch(() => ({ stdout: "" }));

      if (!containerList.includes("tei-server")) {
        throw new Error("TEI Docker container 'tei-server' not found. Please run setup script first.");
      }

      // Start the container
      await execPromise("docker start tei-server", { windowsHide: true });
      this.log?.info("Started TEI Docker container");

      // Wait for container to be ready (max 30 seconds)
      const maxWaitTime = 5000;
      const startTime = Date.now();
      while (Date.now() - startTime < maxWaitTime) {
        const check = await fetch(`${this.baseUrl}/health`, {
          method: "GET",
          signal: AbortSignal.timeout(2000),
        }).catch(() => null);

        if (check?.ok) {
          this.log?.info("TEI container is ready");
          return;
        }

        // Wait 2 seconds before next check
        await sleep(2000);
      }

      throw new Error("TEI container started but did not become ready within 30 seconds");
    } catch (error: unknown) {
      const err = toError(error);
      this.log?.warn("Failed to auto-start TEI container", { error: err.message });
      throw new Error(`TEI auto-start failed: ${err.message}\nPlease start manually: docker start tei-server`);
    }
  }

  /**
   * Wait for TEI server to be fully ready (model loaded)
   * @param failFastOnRefused - throw immediately on ECONNREFUSED (default true).
   *   Set to false after docker restart when port may not be bound yet.
   */
  private async waitForReady(maxWaitMs = 300_000, failFastOnRefused = true): Promise<void> {
    const startTime = Date.now();
    const checkInterval = 3000; // Check every 3 seconds
    let lastStatus = "";

    this.log?.info("Waiting for TEI to be ready (model may be downloading)...");

    while (Date.now() - startTime < maxWaitMs) {
      try {
        const healthRes = await fetch(`${this.baseUrl}/health`, {
          method: "GET",
          signal: AbortSignal.timeout(5000),
        });

        if (healthRes.ok) {
          const elapsed = Math.round((Date.now() - startTime) / 1000);
          this.log?.info("TEI is ready", { waitedSeconds: elapsed });
          return;
        }

        // Check status for progress info
        const status = healthRes.status.toString();
        if (status !== lastStatus) {
          this.log?.debug("TEI not ready yet", { status, elapsed: Math.round((Date.now() - startTime) / 1000) });
          lastStatus = status;
        }
      } catch (error: unknown) {
        const err = toError(error);
        if (err.message.includes("ECONNREFUSED") || err.message.includes("Connection refused")) {
          if (failFastOnRefused) {
            throw new Error(`TEI server not running at ${this.baseUrl} (connection refused)`);
          }
          // After restart: port not bound yet, keep retrying silently
        } else {
          this.log?.debug("TEI health check error", { error: err.message });
        }
      }

      await sleep(checkInterval);
    }

    throw new Error(
      `TEI did not become ready within ${maxWaitMs / 1000} seconds.\n` +
        `Model may still be downloading. Check: docker logs tei-server`,
    );
  }

  /**
   * Restart TEI Docker container (used when container is hung/unresponsive).
   * Returns true if restart command succeeded, false if container not found or Docker unavailable.
   */
  private async restartContainer(): Promise<boolean> {
    try {
      const { exec } = await import("node:child_process");
      const { promisify } = await import("node:util");
      const execPromise = promisify(exec);
      await execPromise("docker restart tei-server", { windowsHide: true });
      this.log?.info("TEI container restarted via docker restart");
      return true;
    } catch (e) {
      this.log?.warn("docker restart tei-server failed", { err: (e as Error).message });
      return false;
    }
  }

  getDimension(): number | undefined {
    return this.info.dimension;
  }

  async embed(text: string, opts?: EmbedOptions): Promise<Float32Array> {
    this.log?.debug("embed()", { len: text?.length }, opts?.requestId);

    try {
      // TEI embed endpoint expects { inputs: string } or { inputs: string[] }
      // EXPERIMENT: Remove AbortSignal.timeout() - may cause crashes in Bun
      const res = await fetch(`${this.baseUrl}/embed`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: stringify.teiSingle({ inputs: text }),
        // signal removed for crash debugging
      });

      if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new Error(`TEI HTTP ${res.status}: ${body}`);
      }

      const json: unknown = await res.json();

      // TEI returns array of embeddings: [[embedding1], [embedding2], ...]
      // For single input, we get [[embedding]]
      let embedding: number[];
      if (Array.isArray(json) && Array.isArray(json[0])) {
        embedding = json[0] as number[];
      } else if (Array.isArray(json)) {
        embedding = json as number[];
      } else {
        throw new Error("TEI invalid response format");
      }

      const arr = new Float32Array(embedding);
      this.info.dimension = this.info.dimension ?? arr.length;
      return arr;
    } catch (error: unknown) {
      const err = toError(error);
      this.log?.error("embed failed", { error: err.message }, opts?.requestId, err);

      if (err.message.includes("ECONNREFUSED")) {
        throw new Error(`TEI server not reachable at ${this.baseUrl}. Is Docker container running?`);
      }

      throw new Error(`TEI embed error: ${err.message}`);
    }
  }

  async embedBatch(texts: string[], opts?: EmbedOptions): Promise<Float32Array[]> {
    this.log?.debug(
      "embedBatch()",
      { count: texts.length, maxBatchSize: this.maxBatchSize, concurrency: this.concurrency },
      opts?.requestId,
    );

    // Split into chunks to respect TEI max_client_batch_size
    if (texts.length > this.maxBatchSize) {
      // Create chunks with indices for ordered results
      const chunks: { idx: number; texts: string[] }[] = [];
      for (let i = 0; i < texts.length; i += this.maxBatchSize) {
        chunks.push({ idx: chunks.length, texts: texts.slice(i, i + this.maxBatchSize) });
      }

      // Pipeline: keep exactly `concurrency` requests in flight using sliding window
      const results: { idx: number; embeddings: Float32Array[] }[] = [];
      let inFlight = 0;

      const processChunk = async (chunk: { idx: number; texts: string[] }) => {
        const embeddings = await this.embedBatchInternal(chunk.texts, opts);
        return { idx: chunk.idx, embeddings };
      };

      // Use promise pool for true pipelining
      const pending: Promise<void>[] = [];

      for (const chunk of chunks) {
        // Wait if at concurrency limit
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

      // Wait for remaining
      await Promise.all(pending);

      // Sort by original order and flatten
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
      // TEI supports batch embedding with { inputs: string[] }
      // EXPERIMENT: Remove AbortSignal.timeout() - may cause crashes in Bun
      const res = await fetch(`${this.baseUrl}/embed`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: stringify.teiBatch({ inputs: texts }),
        // signal removed for crash debugging
      });

      if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new Error(`TEI HTTP ${res.status}: ${body}`);
      }

      const json: unknown = await res.json();

      // TEI returns array of embeddings: [[emb1], [emb2], ...]
      if (!Array.isArray(json)) {
        throw new Error("TEI invalid batch response format");
      }

      const embeddings = json.map((emb: unknown) => {
        const arr = new Float32Array(emb as number[]);
        this.info.dimension = this.info.dimension ?? arr.length;
        return arr;
      });

      return embeddings;
    } catch (error: unknown) {
      const err = toError(error);
      this.log?.error("embedBatch failed", { error: err.message }, opts?.requestId, err);

      if (err.message.includes("ECONNREFUSED")) {
        throw new Error(`TEI server not reachable at ${this.baseUrl}. Is Docker container running?`);
      }

      throw new Error(`TEI embedBatch error: ${err.message}`);
    }
  }

  async close(): Promise<void> {}

  // ═══════════════════════════════════════════════════════════════
  // Extended Capabilities: Rerank
  // ═══════════════════════════════════════════════════════════════

  getCapabilities(): ProviderCapabilities {
    return {
      embeddings: true,
      rerank: true,
      score: false,
      classify: false,
    };
  }

  /**
   * Rerank documents by relevance to query
   * Uses TEI's /rerank endpoint for cross-encoder scoring
   */
  async rerank(query: string, documents: RerankDocument[], opts?: RerankOptions): Promise<RerankResult[]> {
    this.log?.debug("rerank()", { query: query.slice(0, 50), docCount: documents.length }, opts?.requestId);

    try {
      const res = await fetch(`${this.baseUrl}/rerank`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: stringify.teiRerank({
          query,
          texts: documents.map((d) => d.text),
          truncate: true,
        }),
        signal: opts?.signal,
      });

      if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new Error(`TEI rerank HTTP ${res.status}: ${body}`);
      }

      const json = (await res.json()) as Array<{ index: number; score: number }>;

      let results: RerankResult[] = json.map((r) => ({
        index: r.index,
        id: documents[r.index]?.id,
        score: r.score,
        text: documents[r.index]?.text ?? "",
      }));

      // Apply threshold filter if specified
      if (opts?.threshold !== undefined) {
        results = results.filter((r) => r.score >= opts.threshold!);
      }

      // Apply topK if specified
      if (opts?.topK !== undefined) {
        results = results.slice(0, opts.topK);
      }

      // Sort by score descending
      results.sort((a, b) => b.score - a.score);

      this.log?.debug("rerank() complete", { resultCount: results.length }, opts?.requestId);
      return results;
    } catch (error: unknown) {
      const err = toError(error);
      this.log?.error("rerank failed", { error: err.message }, opts?.requestId, err);

      if (err.message.includes("ECONNREFUSED")) {
        throw new Error(`TEI server not reachable at ${this.baseUrl}. Is Docker container running?`);
      }

      throw new Error(`TEI rerank error: ${err.message}`);
    }
  }
}
