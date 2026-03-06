import { toError } from "../../utils/error-handling.js";
import type { EmbeddingProvider, EmbedOptions, ProviderCapabilities, ProviderInfo, ProviderLogger } from "./base.js";

/**
 * Basic typing for @huggingface/inference client
 */
interface HfInferenceClient {
  featureExtraction(params: { model: string; inputs: string }): Promise<number[] | number[][]>;
}

export interface HuggingFaceOptions {
  model: string;
  apiKey: string;
  baseUrl?: string | undefined;
  timeoutMs?: number | undefined;
  concurrency?: number | undefined;
  warmupText?: string | undefined;
  logger?: ProviderLogger | undefined;
}

export class HuggingFaceProvider implements EmbeddingProvider {
  public info: ProviderInfo;
  private apiKey: string;
  private baseUrl: string;
  private timeoutMs: number;
  private concurrency: number;
  private warmupText: string;
  private log?: ProviderLogger | undefined;
  private client: HfInferenceClient | null = null;

  constructor(opts: HuggingFaceOptions) {
    this.log = opts.logger;
    this.apiKey = opts.apiKey;
    this.baseUrl = opts.baseUrl ?? "https://api-inference.huggingface.co";
    this.timeoutMs = opts.timeoutMs ?? 30_000;
    this.concurrency = Math.max(1, opts.concurrency ?? 4);
    this.warmupText = opts.warmupText ?? "warmup text";

    this.info = {
      name: "huggingface",
      model: opts.model,
      supportsBatch: false,
      maxTokens: 512, // Default for most HuggingFace embedding models
    };
  }

  async initialize(): Promise<void> {
    this.log?.info("initialize", {
      model: this.info.model,
      baseUrl: this.baseUrl,
      timeoutMs: this.timeoutMs,
      concurrency: this.concurrency,
    });

    try {
      // Dynamic loading of @huggingface/inference
      const { HfInference } = await import("@huggingface/inference");
      this.client = new HfInference(this.apiKey) as HfInferenceClient;
    } catch (error: unknown) {
      const err = toError(error);
      const errorMessage =
        `Failed to load @huggingface/inference: ${err.message}\n` +
        `To use Hugging Face embeddings, install: npm install @huggingface/inference`;
      this.log?.error("initialize failed", { error: errorMessage }, undefined, err);
      throw new Error(errorMessage);
    }

    // Warmup call to determine dimensionality
    try {
      const vec = await this.embed(this.warmupText);
      this.info.dimension = vec.length;
      this.log?.info("initialized", { dimension: this.info.dimension });
    } catch (error: unknown) {
      const err = toError(error);
      this.log?.error("warmup failed", { error: err.message }, undefined, err);
      throw new Error(`HuggingFace warmup failed: ${err.message}`);
    }
  }

  getDimension(): number | undefined {
    return this.info.dimension;
  }

  async embed(text: string, opts?: EmbedOptions): Promise<Float32Array> {
    this.log?.debug("embed()", { len: text?.length }, opts?.requestId);

    if (!this.client) {
      throw new Error("HuggingFaceProvider not initialized");
    }

    try {
      // Note: HuggingFace SDK doesn't support AbortSignal, timeout is handled internally
      // Removed setTimeout for Bun compatibility
      const result = await this.client.featureExtraction({
        model: this.info.model,
        inputs: text,
      });

      // Result may be an array or a nested array
      let embedding: number[];
      if (Array.isArray(result)) {
        // If returned an array of arrays (batch), take the first one
        if (Array.isArray(result[0])) {
          embedding = result[0]!; // Safe: checked above
        } else {
          embedding = result as number[];
        }
      } else {
        throw new Error("Unexpected featureExtraction response format");
      }

      const arr = new Float32Array(embedding);
      this.info.dimension = this.info.dimension ?? arr.length;
      return arr;
    } catch (error: unknown) {
      const err = toError(error);
      this.log?.error("embed failed", { error: err.message }, opts?.requestId, err);

      // Check for HF API-specific errors
      if (err.message.includes("rate limit")) {
        throw new Error(`HuggingFace rate limit exceeded. Consider using a paid API key or retry later.`);
      }
      if (err.message.includes("model") && err.message.includes("not found")) {
        throw new Error(`HuggingFace model "${this.info.model}" not found. Check model name.`);
      }
      if (err.message.includes("authorization")) {
        throw new Error(`HuggingFace API key is invalid or missing.`);
      }

      throw new Error(`HuggingFace embed error: ${err.message}`);
    }
  }

  async embedBatch(texts: string[], opts?: EmbedOptions): Promise<Float32Array[]> {
    this.log?.debug("embedBatch()", { count: texts.length }, opts?.requestId);

    // Use p-limit for concurrency control
    const pLimit = (await import("p-limit")).default;
    const limit = pLimit(this.concurrency);
    return Promise.all(texts.map((t) => limit(() => this.embed(t, opts))));
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
