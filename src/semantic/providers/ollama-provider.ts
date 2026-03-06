import { toError } from "../../utils/error-handling.js";
import { stringify } from "../../utils/fast-json.js";
import type { EmbeddingProvider, EmbedOptions, ProviderCapabilities, ProviderInfo, ProviderLogger } from "./base.js";

interface OllamaEmbedResponse {
  embedding: number[];
  model?: string;
}

export interface OllamaOptions {
  model: string;
  baseUrl?: string | undefined;
  timeoutMs?: number | undefined;
  concurrency?: number | undefined;
  headers?: Record<string, string> | undefined;
  autoPull?: boolean | undefined;
  warmupText?: string | undefined;
  checkServer?: boolean | undefined;
  pullTimeoutMs?: number | undefined;
  logger?: ProviderLogger | undefined;
}

function maxTokensFor(model: string): number {
  return model.includes("arctic") ? 8192 : 512;
}

function seemsMissing(msg: string, model: string): boolean {
  const lc = msg.toLowerCase();
  return (
    lc.includes("model not found") ||
    lc.includes("no such model") ||
    (lc.includes("not found") && lc.includes(model.toLowerCase()))
  );
}

export class OllamaProvider implements EmbeddingProvider {
  info: ProviderInfo;

  private readonly origin: string;
  private readonly timeout: number;
  private readonly pullTimeout: number;
  private readonly concurrency: number;
  private readonly hdrs: Record<string, string>;
  private readonly pull: boolean;
  private readonly warmText: string;
  private readonly probe: boolean;
  private readonly log?: ProviderLogger | undefined;

  constructor(o: OllamaOptions) {
    this.origin = o.baseUrl ?? "http://127.0.0.1:11434";
    this.timeout = o.timeoutMs ?? 10_000;
    this.pullTimeout = o.pullTimeoutMs ?? 120_000;
    this.concurrency = Math.max(1, o.concurrency ?? 8);
    this.pull = o.autoPull !== false;
    this.warmText = o.warmupText ?? "warm up";
    this.probe = o.checkServer !== false;
    this.log = o.logger;
    this.hdrs = { "Content-Type": "application/json", ...(o.headers ?? {}) };
    this.info = {
      name: "ollama",
      model: o.model,
      supportsBatch: false,
      maxTokens: maxTokensFor(o.model),
    };
  }

  async initialize(): Promise<void> {
    this.log?.info("initialize", {
      model: this.info.model,
      baseUrl: this.origin,
      timeoutMs: this.timeout,
      concurrency: this.concurrency,
    });
    if (this.probe) await this.checkReachable();
    try {
      await this.doWarmup();
    } catch (raw: unknown) {
      const e = toError(raw);
      if (this.pull && seemsMissing(e.message, this.info.model)) {
        this.log?.info("model not found, pulling", { model: this.info.model });
        await this.pullModel();
        await this.doWarmup();
        this.log?.info("initialized after pull", { dimension: this.info.dimension });
        return;
      }
      this.log?.error("initialize failed", { error: e.message }, undefined, e);
      throw e;
    }
  }

  getDimension(): number | undefined {
    return this.info.dimension;
  }

  getCapabilities(): ProviderCapabilities {
    return { embeddings: true, rerank: false, score: false, classify: false };
  }

  async embed(text: string, opts?: EmbedOptions): Promise<Float32Array> {
    this.log?.debug("embed()", { len: text?.length }, opts?.requestId);
    const sig = opts?.signal ?? AbortSignal.timeout(this.timeout);
    const res = await fetch(`${this.origin}/api/embeddings`, {
      method: "POST",
      headers: this.hdrs,
      body: stringify.ollamaEmbedding({ model: this.info.model, prompt: text }),
      signal: sig,
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      throw new Error(`Ollama HTTP ${res.status}: ${detail}`);
    }
    const json = (await res.json()) as OllamaEmbedResponse;
    if (!json || !Array.isArray(json.embedding)) {
      throw new Error("Ollama invalid response: missing embedding array");
    }
    const vec = new Float32Array(json.embedding);
    this.info.dimension ??= vec.length;
    return vec;
  }

  async embedBatch(texts: string[], opts?: EmbedOptions): Promise<Float32Array[]> {
    this.log?.debug("embedBatch()", { count: texts.length }, opts?.requestId);
    const { default: pLimit } = await import("p-limit");
    const gate = pLimit(this.concurrency);
    return Promise.all(texts.map((t) => gate(() => this.embed(t, opts))));
  }

  private async doWarmup(): Promise<void> {
    const vec = await this.embed(this.warmText);
    this.info.dimension = vec.length;
    this.log?.info("initialized", { dimension: this.info.dimension });
  }

  private async checkReachable(): Promise<void> {
    const tmo = Math.min(this.timeout, 5000);
    const sig = AbortSignal.timeout(tmo);
    for (const ep of ["/api/version", "/api/tags"]) {
      try {
        const r = await fetch(`${this.origin}${ep}`, { method: "GET", signal: sig });
        if (r.ok) return;
      } catch {
        /* next endpoint */
      }
    }
    throw new Error(`Ollama server is not reachable at ${this.origin}`);
  }

  private async pullModel(): Promise<void> {
    const sig = AbortSignal.timeout(this.pullTimeout);
    const res = await fetch(`${this.origin}/api/pull`, {
      method: "POST",
      headers: this.hdrs,
      body: stringify.ollamaPull({ name: this.info.model }),
      signal: sig,
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`Ollama pull failed HTTP ${res.status}: ${body}`);
    }
    const reader = res.body?.getReader?.();
    if (reader) {
      for (;;) {
        const { done } = await reader.read();
        if (done) break;
      }
    } else {
      await res.arrayBuffer().catch(() => undefined);
    }
  }
}
