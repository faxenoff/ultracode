import pLimit from "p-limit";
import { sleep } from "../../utils/runtime.js";

export class HttpError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public body?: string,
    options?: ErrorOptions | undefined,
  ) {
    const tail = body ? `: ${body.slice(0, 300)}` : "";
    super(`HTTP ${status} ${statusText}${tail}`, options);
    this.name = "HttpError";
  }
}

export interface HttpEngineOptions {
  baseUrl: string;
  timeoutMs?: number | undefined;
  concurrency?: number | undefined;
  maxRetries?: number | undefined;
  backoffMs?: number | undefined;
  defaultHeaders?: Record<string, string> | undefined;
}

export interface RequestConfig<TBody = unknown> {
  path: string;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  headers?: Record<string, string>;
  buildBody?: (input: unknown) => TBody;
}

export class HttpEngine {
  private readonly origin: string;
  private readonly timeout: number;
  private readonly retries: number;
  private readonly backoff: number;
  private readonly hdrs: Record<string, string>;
  private readonly gate: ReturnType<typeof pLimit>;

  constructor(opts: HttpEngineOptions) {
    this.origin = opts.baseUrl.replace(/\/$/, "");
    this.timeout = opts.timeoutMs ?? 10_000;
    this.retries = Math.max(0, opts.maxRetries ?? 2);
    this.backoff = opts.backoffMs ?? 200;
    this.hdrs = opts.defaultHeaders ?? { "Content-Type": "application/json" };
    this.gate = pLimit(Math.max(1, opts.concurrency ?? 4));
  }

  async callSingle<R = unknown>(
    cfg: RequestConfig,
    input: unknown,
    parse: (json: unknown) => R,
    opts?: { signal?: AbortSignal | undefined },
  ): Promise<R> {
    return this.gate(async () => {
      const body = cfg.buildBody ? cfg.buildBody(input) : input;
      const headers = { ...this.hdrs, ...(cfg.headers ?? {}) };
      const res = await this.fetchRetry(cfg.path, {
        method: cfg.method ?? "POST",
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
        ...(opts?.signal ? { signal: opts.signal } : {}),
      });
      const raw = await res.text();
      return parse(raw ? JSON.parse(raw) : null);
    });
  }

  async callBatch<R = unknown>(
    cfg: RequestConfig,
    inputs: unknown[],
    parseSingle: (json: unknown) => R,
    opts?: { signal?: AbortSignal | undefined },
  ): Promise<R[]> {
    return Promise.all(inputs.map((item) => this.callSingle(cfg, item, parseSingle, opts)));
  }

  private async fetchRetry(path: string, init: RequestInit): Promise<Response> {
    const url = `${this.origin}${path}`;
    let attempt = 0;

    for (;;) {
      try {
        const res = await fetch(url, {
          ...init,
          signal: init.signal ?? AbortSignal.timeout(this.timeout),
        });
        if (res.ok) return res;

        const canRetry = res.status === 429 || (res.status >= 500 && res.status < 600);
        if (canRetry && attempt < this.retries) {
          attempt++;
          await sleep(this.backoff * attempt);
          continue;
        }
        const text = await res.text().catch(() => "");
        throw new HttpError(res.status, res.statusText, text);
      } catch (err) {
        if (err instanceof HttpError) throw err;
        if (attempt < this.retries) {
          attempt++;
          await sleep(this.backoff * attempt);
          continue;
        }
        throw err;
      }
    }
  }
}
