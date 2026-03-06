export type ProviderKind =
  | "openai"
  | "cloudru"
  | "huggingface"
  | "tei"
  | "ollama"
  | "ovms"
  | "ovms-native"
  | "vllm"
  | "llamacpp"
  | "mlx"
  | "auto";

export interface ProviderLogger {
  debug(msg: string, data?: unknown, requestId?: string | undefined): void;
  info(msg: string, data?: unknown, requestId?: string | undefined): void;
  warn(msg: string, data?: unknown, requestId?: string | undefined): void;
  error(msg: string, data?: unknown, requestId?: string | undefined, err?: Error | undefined): void;
}

export interface ProviderInfo {
  name: ProviderKind | string;
  model: string;
  supportsBatch: boolean;
  dimension?: number | undefined;
  maxBatchSize?: number | undefined;
  maxTokens?: number | undefined;
}

export interface EmbedOptions {
  signal?: AbortSignal | undefined;
  requestId?: string | undefined;
}

export interface ProviderCapabilities {
  embeddings: boolean;
  rerank: boolean;
  score: boolean;
  classify: boolean;
}

export interface RerankDocument {
  text: string;
  id?: string | undefined;
}

export interface RerankResult {
  index: number;
  score: number;
  text: string;
  id?: string | undefined;
}

export interface RerankOptions extends EmbedOptions {
  topK?: number | undefined;
  threshold?: number | undefined;
}

export interface ScoreResult {
  score: number;
}

export interface ScoreOptions extends EmbedOptions {}

export interface EmbeddingProvider {
  info: ProviderInfo;
  initialize(): Promise<void>;
  getDimension(): number | undefined;
  embed(text: string, opts?: EmbedOptions): Promise<Float32Array>;
  embedBatch?(texts: string[], opts?: EmbedOptions): Promise<Float32Array[]>;
  close?(): Promise<void>;
  getCapabilities?(): ProviderCapabilities;
  rerank?(query: string, documents: RerankDocument[], opts?: RerankOptions): Promise<RerankResult[]>;
  score?(query: string, document: string, opts?: ScoreOptions): Promise<ScoreResult>;
  scoreBatch?(query: string, documents: string[], opts?: ScoreOptions): Promise<ScoreResult[]>;
}
