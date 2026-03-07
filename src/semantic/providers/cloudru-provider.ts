import type { EmbeddingProvider, EmbedOptions, ProviderInfo, ProviderLogger } from "./base.js";
import { HttpEngine } from "./http-engine.js";

interface CRUEntry {
  embedding: number[];
  index?: number;
}
interface CRUBody {
  data?: CRUEntry[];
  embedding?: number[] | number[][];
  error?: unknown;
}

export interface CloudRUOptions {
  model: string;
  baseUrl?: string | undefined;
  apiKey?: string | undefined;
  timeoutMs?: number | undefined;
  concurrency?: number | undefined;
  maxBatchSize?: number | undefined;
  logger?: ProviderLogger | undefined;
}

const EP = "/v1/embeddings";

export class CloudRUProvider implements EmbeddingProvider {
  info: ProviderInfo;
  private readonly engine: HttpEngine;
  private readonly log?: ProviderLogger | undefined;
  private readonly origin: string;
  private readonly keyed: boolean;

  constructor(o: CloudRUOptions) {
    this.log = o.logger;
    this.origin = o.baseUrl ?? "https://foundation-models.api.cloud.ru";
    this.keyed = !!o.apiKey;
    this.info = { name: "cloudru", model: o.model, supportsBatch: true, maxBatchSize: o.maxBatchSize, maxTokens: 512 };
    const h: Record<string, string> = { "Content-Type": "application/json" };
    if (o.apiKey) h["Authorization"] = `Bearer ${o.apiKey}`;
    this.engine = new HttpEngine({
      baseUrl: this.origin,
      timeoutMs: o.timeoutMs ?? 10_000,
      concurrency: o.concurrency ?? 4,
      defaultHeaders: h,
    });
  }

  async initialize(): Promise<void> {
    this.log?.info("initialize", { model: this.info.model, baseUrl: this.origin, apiKey: this.keyed });
  }

  getDimension(): number | undefined {
    return this.info.dimension;
  }
  async close(): Promise<void> {}

  async embed(text: string, opts?: EmbedOptions): Promise<Float32Array> {
    this.log?.debug("embed()", { len: text?.length }, opts?.requestId);
    return this.engine.callSingle(
      { path: EP, buildBody: (inp: unknown) => ({ model: this.info.model, input: inp }) },
      text,
      (j) => this.one(j),
      { signal: opts?.signal },
    );
  }

  async embedBatch(texts: string[], opts?: EmbedOptions): Promise<Float32Array[]> {
    this.log?.debug("embedBatch()", { count: texts.length }, opts?.requestId);
    const chunk = this.info.maxBatchSize ?? texts.length;
    if (texts.length > chunk) {
      const out: Float32Array[] = [];
      for (let i = 0; i < texts.length; i += chunk) {
        const part = await this.engine.callSingle(
          { path: EP, buildBody: (inp: unknown) => ({ model: this.info.model, input: inp }) },
          texts.slice(i, i + chunk),
          (j) => this.many(j),
          { signal: opts?.signal },
        );
        out.push(...part);
      }
      return out;
    }
    try {
      return await this.engine.callSingle(
        { path: EP, buildBody: (inp: unknown) => ({ model: this.info.model, input: inp }) },
        texts,
        (j) => this.many(j),
        { signal: opts?.signal },
      );
    } catch {
      return this.engine.callBatch(
        { path: EP, buildBody: (inp: unknown) => ({ model: this.info.model, input: inp }) },
        texts,
        (j) => this.one(j),
        { signal: opts?.signal },
      );
    }
  }

  private one(raw: unknown): Float32Array {
    const r = raw as CRUBody;
    if (Array.isArray(r?.data)) {
      const f = r.data[0];
      if (f && Array.isArray(f.embedding)) {
        const v = new Float32Array(f.embedding);
        this.info.dimension ??= v.length;
        return v;
      }
    }
    if (Array.isArray(r?.embedding)) {
      const v = new Float32Array(r.embedding as number[]);
      this.info.dimension ??= v.length;
      return v;
    }
    if (r?.error) throw new Error(`CloudRU error: ${JSON.stringify(r.error)}`);
    throw new Error("CloudRU invalid embedding response");
  }

  private many(raw: unknown): Float32Array[] {
    const r = raw as CRUBody;
    if (Array.isArray(r?.data)) {
      const vs = r.data.map((e) => new Float32Array(e.embedding));
      if (!this.info.dimension && vs.length > 0) this.info.dimension = vs[0]?.length;
      return vs;
    }
    if (Array.isArray(r?.embedding) && Array.isArray(r.embedding[0])) {
      const vs = (r.embedding as number[][]).map((row) => new Float32Array(row));
      if (!this.info.dimension && vs.length > 0) this.info.dimension = vs[0]?.length;
      return vs;
    }
    throw new Error("CloudRU invalid batch embedding response");
  }
}
