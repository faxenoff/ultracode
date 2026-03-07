import type { EmbeddingProvider, EmbedOptions, ProviderInfo, ProviderLogger } from "./base.js";
import { HttpEngine } from "./http-engine.js";

interface OAIEntry {
  embedding: number[];
  index: number;
  object: string;
}
interface OAIResponse {
  data: OAIEntry[];
  model: string;
  object: string;
  usage?: { prompt_tokens: number; total_tokens: number };
}
interface OAIPayload {
  model: string;
  input: string | string[];
  dimensions?: number;
}

export interface OpenAIOptions {
  apiKey: string;
  model: string;
  baseUrl?: string | undefined;
  timeoutMs?: number | undefined;
  concurrency?: number | undefined;
  dimensions?: number | undefined;
  maxBatchSize?: number | undefined;
  logger?: ProviderLogger | undefined;
}

const PATH = "/v1/embeddings";

export class OpenAIProvider implements EmbeddingProvider {
  info: ProviderInfo;
  private readonly engine: HttpEngine;
  private readonly dims: number | undefined;
  private readonly log?: ProviderLogger | undefined;

  constructor(o: OpenAIOptions) {
    this.log = o.logger;
    this.dims = o.dimensions;
    this.info = { name: "openai", model: o.model, supportsBatch: true, maxBatchSize: o.maxBatchSize, maxTokens: 8191 };
    this.engine = new HttpEngine({
      baseUrl: o.baseUrl ?? "https://api.openai.com",
      timeoutMs: o.timeoutMs ?? 10_000,
      concurrency: o.concurrency ?? 4,
      defaultHeaders: { "Content-Type": "application/json", Authorization: `Bearer ${o.apiKey}` },
    });
  }

  async initialize(): Promise<void> {}
  getDimension(): number | undefined {
    return this.info.dimension;
  }
  async close(): Promise<void> {}

  async embed(text: string, opts?: EmbedOptions): Promise<Float32Array> {
    this.log?.debug("embed()", { len: text?.length }, opts?.requestId);
    return this.engine.callSingle(
      { path: PATH, buildBody: (inp: unknown) => this.payload(inp as string | string[]) },
      text,
      (j) => this.one(j),
      { signal: opts?.signal },
    );
  }

  async embedBatch(texts: string[], opts?: EmbedOptions): Promise<Float32Array[]> {
    this.log?.debug("embedBatch()", { count: texts.length }, opts?.requestId);
    const bs = this.info.maxBatchSize ?? texts.length;
    if (texts.length > bs) {
      const parts: Float32Array[][] = [];
      for (let off = 0; off < texts.length; off += bs) {
        const p = await this.engine.callSingle(
          { path: PATH, buildBody: (inp: unknown) => this.payload(inp as string | string[]) },
          texts.slice(off, off + bs),
          (j) => this.batch(j),
          { signal: opts?.signal },
        );
        parts.push(p);
      }
      return parts.flat();
    }
    try {
      return await this.engine.callSingle(
        { path: PATH, buildBody: (inp: unknown) => this.payload(inp as string | string[]) },
        texts,
        (j) => this.batch(j),
        { signal: opts?.signal },
      );
    } catch {
      return this.engine.callBatch(
        { path: PATH, buildBody: (inp: unknown) => this.payload(inp as string | string[]) },
        texts,
        (j) => this.one(j),
        { signal: opts?.signal },
      );
    }
  }

  private payload(input: string | string[]): OAIPayload {
    const p: OAIPayload = { model: this.info.model, input };
    if (this.dims !== undefined) p.dimensions = this.dims;
    return p;
  }

  private one(raw: unknown): Float32Array {
    const r = raw as OAIResponse;
    const f = r?.data?.[0];
    if (!f || !Array.isArray(f.embedding)) throw new Error("OpenAI invalid embedding response");
    const v = new Float32Array(f.embedding);
    this.info.dimension ??= v.length;
    return v;
  }

  private batch(raw: unknown): Float32Array[] {
    const r = raw as OAIResponse;
    if (!r || !Array.isArray(r.data)) throw new Error("OpenAI invalid batch response");
    const vs = r.data.map((e) => new Float32Array(e.embedding));
    if (!this.info.dimension && vs.length > 0) this.info.dimension = vs[0]?.length;
    return vs;
  }
}
