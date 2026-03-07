/**
 * Types and interfaces for setup command
 */

export interface EmbeddingModel {
  id: string;
  provider: string;
  name: string;
  badge?: string;
  model_id: string;
  gpu_architectures: string[];
  gpu_support: boolean;
  image_gpu?: string;
  image_gpu_blackwell?: string;
  image_cpu?: string;
  language: string;
  context_tokens: number;
  dimensions: number;
  size_mb: number;
  vram_mb?: number;
  ram_mb?: number;
  benchmark_toks?: number;
  benchmark_chunks_per_sec?: number;
  use_case: string;
  description: string;
  device?: string;
  avg_ms?: number;
  optimal_batch_size?: number;
  // Extended fields from config
  ov_repo?: string;
  hf_model?: string | undefined;
  ovms_format?: string;
  pooling?: string;
  v3_api?: boolean;
  trust_remote_code?: boolean;
  weight_format?: string;
  available?: boolean;
  vllm_config?: { max_model_len?: number; trust_remote_code?: boolean };
}

export interface ModelsConfig {
  version: string;
  providers: Record<string, { name: string; description: string; default_port?: number }>;
  models: EmbeddingModel[];
  default_models: Record<string, string>;
}

export interface GPUInfo {
  available: boolean;
  name: string;
  architecture: string;
  computeCap: number;
  isBlackwell: boolean;
  vramMB: number;
}

export interface LLMModel {
  id: string;
  provider: string;
  name: string;
  badge?: string;
  model_id: string;
  devices: string[];
  context_tokens: number;
  size_gb: number;
  ram_gb: number;
  tokens_per_sec_cpu?: number;
  tokens_per_sec_npu?: number;
  quality: Record<string, number>;
  use_case: string;
  description: string;
  license?: string;
}

export interface TGIModel {
  id: string;
  provider: string;
  name: string;
  badge?: string;
  model_id: string;
  gpu_architectures: string[];
  context_tokens: number;
  size_gb: number;
  vram_gb: number;
  use_case: string;
  description: string;
  docker_args?: string | undefined;
}

export interface OllamaLLMModel {
  id: string;
  name: string;
  context_tokens: number;
  size_gb: number;
  vram_gb?: number | undefined;
  tokens_per_sec_gpu?: number;
  quality_overall: number;
  use_case: string;
  benchmark_note?: string;
}

export interface LLMConfig {
  version: string;
  scenarios: Record<string, { name: string; description: string; ollama?: string | undefined; tgi?: string }>;
  providers: Record<string, { name: string; description: string; blackwell_status?: string }>;
  models: LLMModel[];
  ollama_models: OllamaLLMModel[];
  tgi_models: TGIModel[];
  default_models: Record<string, string>;
}

export interface ProviderOption {
  id: string;
  name: string;
  recommended: boolean;
  speed: string;
  pros: string[];
  cons: string[];
  available: boolean;
}

export interface InstallResult {
  success: boolean;
  useIR?: boolean | undefined;
  irPath?: string | undefined;
  /** Multi-device endpoints created (for round-robin load balancing) */
  endpoints?: string[] | undefined;
  /** Model directory name (for OVMS config) */
  modelName?: string | undefined;
  /** Detected dimensions from running OVMS (may differ from selected model) */
  detectedDimensions?: number | undefined;
  /** Detected model ID based on dimensions */
  detectedModelId?: string | undefined;
}

export interface SelectedLLMModel {
  id: string;
  model_id: string;
  name: string;
  context_tokens: number;
  size_gb: number;
  vram_gb?: number | undefined;
  device?: string;
}
