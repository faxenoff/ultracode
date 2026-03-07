/**
 * Semantic Agent Provider Configuration
 *
 * Maps semantic-config.json settings to embedding provider configuration.
 */

import type { EmbeddingConfig } from "../../types/semantic.js";
import type { SemanticConfig } from "../../utils/config-paths.js";

/**
 * Provider kind type
 */
export type ProviderKind =
  | "auto"
  | "tei"
  | "ovms"
  | "ovms-native"
  | "vllm"
  | "llamacpp"
  | "mlx"
  | "ollama"
  | "openai"
  | "cloudru"
  | "huggingface";

/**
 * Extended OVMS configuration with runtime fields
 */
interface OvmsConfigExtended {
  endpoint?: string;
  batch_size?: number;
  ovms_mini_batch?: number;
  selected_model?: string | null;
  target_device?: string;
  endpoints?: string[];
  useEmbeddingsApi?: boolean | undefined;
  encodingFormat?: "float" | "base64" | undefined;
  protocol?: string;
  grpcPort?: number;
  timeoutMs?: number;
  concurrency?: number;
}

/**
 * Extended MLX configuration with runtime fields
 */
interface MlxConfigExtended {
  endpoint?: string;
  max_batch_size?: number;
  timeoutMs?: number;
  concurrency?: number;
  auto_start?: boolean;
  autoStart?: boolean;
  selected_model?: string | null;
}

/**
 * Extended llama.cpp configuration with runtime fields
 */
interface LlamacppConfigExtended {
  endpoint?: string;
  context_size?: number;
  contextSize?: number;
  n_gpu_layers?: number;
  nGpuLayers?: number;
  parallel_slots?: number;
  ubatch_size?: number;
  batch_size?: number;
  max_batch_size?: number;
  timeoutMs?: number;
  concurrency?: number;
  auto_start?: boolean;
  autoStart?: boolean;
  selected_model?: string | null;
}

/**
 * Extended TEI configuration
 */
interface TeiConfigExtended {
  endpoint?: string | undefined;
  baseUrl?: string | undefined;
  max_batch_tokens?: number | undefined;
  max_client_batch_size?: number | undefined;
  concurrency?: number | undefined;
  timeoutMs?: number | undefined;
  checkServer?: boolean | undefined;
}

/**
 * YAML configuration structure
 */
interface YamlConfig {
  semanticAgent?:
    | {
        modelPath?: string | undefined;
      }
    | undefined;
  mcp?:
    | {
        embedding?:
          | {
              tei?: TeiConfigExtended | undefined;
            }
          | undefined;
      }
    | undefined;
}

/**
 * Worker provider options
 */
interface WorkerProviderOptions {
  baseUrl?: string | undefined;
  timeoutMs?: number | undefined;
  concurrency?: number | undefined;
  maxBatchSize?: number | undefined;
  useEmbeddingsApi?: boolean | undefined;
  encodingFormat?: "float" | "base64" | undefined;
  protocol?: string | undefined;
  grpcPort?: number | undefined;
  contextSize?: number | undefined;
  nGpuLayers?: number | undefined;
}

// EmbeddingGeneratorOptions removed - use EmbeddingConfig from types/semantic.ts instead

/**
 * Map semantic-config.json platform to provider kind
 * Returns "auto" if no config or disabled (will auto-detect available provider)
 */
export function mapSemanticConfigToProvider(semanticConfig: SemanticConfig | null): ProviderKind {
  if (!semanticConfig || !semanticConfig.enabled) {
    return "auto";
  }

  const platform = semanticConfig.embedding?.platform;
  switch (platform) {
    case "ovms":
      return "ovms";
    case "ovms-native":
      return "ovms-native";
    case "vllm":
      return "vllm";
    case "llamacpp":
      return "llamacpp";
    case "mlx":
      return "mlx";
    case "tei":
      return "tei";
    default:
      return "auto";
  }
}

/**
 * Get model name from semantic-config.json based on platform
 */
export function getModelNameFromSemanticConfig(semanticConfig: SemanticConfig | null): string {
  if (!semanticConfig || !semanticConfig.enabled) {
    return "all-MiniLM-L6-v2"; // default for auto-detection
  }

  const platform = semanticConfig.embedding?.platform;
  switch (platform) {
    case "ovms":
    case "ovms-native":
      return semanticConfig.embedding?.ovms?.selected_model || "all-MiniLM-L6-v2";
    case "vllm":
      return semanticConfig.embedding?.vllm?.selected_model || "intfloat/multilingual-e5-large-instruct";
    case "llamacpp":
      return semanticConfig.embedding?.llamacpp?.selected_model || "multilingual-e5-base";
    case "mlx":
      return semanticConfig.embedding?.mlx?.selected_model || "intfloat/multilingual-e5-base";
    case "tei":
      return semanticConfig.embedding?.tei?.selected_model || "BAAI/bge-m3";
    default:
      return "all-MiniLM-L6-v2";
  }
}

/**
 * Build worker embedding config for subprocess workers
 */
export function buildWorkerProviderOptions(
  providerKind: string,
  semanticConfig: SemanticConfig | null,
  yamlConfig: YamlConfig | null,
): WorkerProviderOptions | undefined {
  switch (providerKind) {
    case "tei": {
      const teiConfig = (semanticConfig?.embedding?.tei || yamlConfig?.mcp?.embedding?.tei) as
        | TeiConfigExtended
        | undefined;
      return {
        baseUrl: teiConfig?.endpoint || teiConfig?.baseUrl || "http://127.0.0.1:8081",
        timeoutMs: teiConfig?.timeoutMs,
        concurrency: teiConfig?.concurrency,
        maxBatchSize: teiConfig?.max_batch_tokens,
      };
    }
    case "ovms": {
      const ovmsConfig = semanticConfig?.embedding?.ovms as OvmsConfigExtended | undefined;
      return {
        baseUrl: ovmsConfig?.endpoint,
        timeoutMs: ovmsConfig?.timeoutMs,
        concurrency: ovmsConfig?.concurrency,
        useEmbeddingsApi: ovmsConfig?.useEmbeddingsApi ?? true,
        encodingFormat: ovmsConfig?.encodingFormat ?? "base64",
        protocol: ovmsConfig?.protocol,
        grpcPort: ovmsConfig?.grpcPort,
      };
    }
    case "llamacpp": {
      const llamacppConfig = semanticConfig?.embedding?.llamacpp as LlamacppConfigExtended | undefined;
      return {
        baseUrl: llamacppConfig?.endpoint || "http://127.0.0.1:8085",
        timeoutMs: llamacppConfig?.timeoutMs ?? 30000,
        // Client concurrency should match server --parallel
        concurrency: llamacppConfig?.concurrency ?? 4,
        contextSize: llamacppConfig?.context_size || llamacppConfig?.contextSize || 2048,
        nGpuLayers: llamacppConfig?.n_gpu_layers ?? llamacppConfig?.nGpuLayers ?? 99,
        // Performance tuning
        maxBatchSize: llamacppConfig?.max_batch_size ?? 256,
      };
    }
    case "mlx": {
      const mlxConfig = semanticConfig?.embedding?.mlx as MlxConfigExtended | undefined;
      return {
        baseUrl: mlxConfig?.endpoint || "http://127.0.0.1:8087",
        timeoutMs: mlxConfig?.timeoutMs ?? 30000,
        concurrency: mlxConfig?.concurrency ?? 4,
        maxBatchSize: mlxConfig?.max_batch_size ?? 128,
      };
    }
    default:
      return undefined;
  }
}

/**
 * Build embedding generator options from config
 */
export function buildEmbeddingGeneratorOptions(
  provider: ProviderKind,
  modelName: string,
  batchSize: number,
  semanticConfig: SemanticConfig | null,
  yamlConfig: YamlConfig | null,
): Partial<EmbeddingConfig> {
  const options: Partial<EmbeddingConfig> = {
    provider: provider as EmbeddingConfig["provider"],
    modelName,
    quantized: true,
    localPath: yamlConfig?.semanticAgent?.modelPath ?? "./models",
    batchSize,
  };

  // Configure TEI from semantic-config.json OR YAML config
  const yamlTei = yamlConfig?.mcp?.embedding?.tei;
  const jsonTei = semanticConfig?.embedding?.tei as TeiConfigExtended | undefined;
  if (provider === "tei") {
    options.tei = {
      baseUrl: jsonTei?.endpoint || yamlTei?.baseUrl || "http://127.0.0.1:8081",
      timeoutMs: yamlTei?.timeoutMs,
      concurrency: yamlTei?.concurrency,
      checkServer: yamlTei?.checkServer,
    };
  }

  // Configure OVMS from semantic-config.json
  if (
    (semanticConfig?.embedding?.platform === "ovms" || semanticConfig?.embedding?.platform === "ovms-native") &&
    semanticConfig?.embedding?.ovms
  ) {
    const ovmsConfig = semanticConfig.embedding.ovms as OvmsConfigExtended;
    options.ovms = {
      baseUrl: ovmsConfig.endpoint,
      miniBatchSize: ovmsConfig.ovms_mini_batch ?? 8,
      useEmbeddingsApi: ovmsConfig.useEmbeddingsApi ?? true,
      encodingFormat: ovmsConfig.encodingFormat ?? "base64",
      endpoints: ovmsConfig.endpoints,
    };
  }

  // Configure vLLM from semantic-config.json
  if (semanticConfig?.embedding?.platform === "vllm" && semanticConfig?.embedding?.vllm) {
    const vllmCfg = semanticConfig.embedding.vllm;
    options.vllm = {
      baseUrl: vllmCfg.endpoint,
      encodingFormat: vllmCfg.encoding_format as "float" | "base64" | undefined,
    };
  }

  // Configure llama.cpp from semantic-config.json
  if (semanticConfig?.embedding?.platform === "llamacpp") {
    const llamacppConfig = semanticConfig?.embedding?.llamacpp as LlamacppConfigExtended | undefined;
    options.llamacpp = {
      baseUrl: llamacppConfig?.endpoint || "http://127.0.0.1:8085",
      timeoutMs: llamacppConfig?.timeoutMs ?? 30000,
      // Client concurrency should match server --parallel for optimal throughput
      concurrency: llamacppConfig?.concurrency ?? 4,
      // Client batch size: max texts per HTTP request
      maxBatchSize: llamacppConfig?.max_batch_size ?? 256,
      // Context size: tokens per slot * parallel slots (e.g., 512 * 4 = 2048)
      contextSize: llamacppConfig?.context_size || llamacppConfig?.contextSize || 2048,
      nGpuLayers: llamacppConfig?.n_gpu_layers ?? llamacppConfig?.nGpuLayers ?? 99,
      // Auto-start server if not running (default: true)
      autoStart: llamacppConfig?.auto_start ?? llamacppConfig?.autoStart ?? true,
    };
  }

  // Configure MLX from semantic-config.json
  if (semanticConfig?.embedding?.platform === "mlx") {
    const mlxConfig = semanticConfig?.embedding?.mlx as MlxConfigExtended | undefined;
    options.mlx = {
      baseUrl: mlxConfig?.endpoint || "http://127.0.0.1:8087",
      timeoutMs: mlxConfig?.timeoutMs ?? 30000,
      concurrency: mlxConfig?.concurrency ?? 4,
      maxBatchSize: mlxConfig?.max_batch_size ?? 128,
      autoStart: mlxConfig?.auto_start ?? mlxConfig?.autoStart ?? true,
    };
  }

  return options;
}

/**
 * Get batch size from semantic config
 */
export function getBatchSizeFromConfig(semanticConfig: SemanticConfig | null, defaultBatchSize: number): number {
  const ovmsBatchSize = semanticConfig?.embedding?.ovms?.batch_size;
  const teiBatchSize = semanticConfig?.embedding?.tei?.max_batch_tokens;
  const providerBatchSize = teiBatchSize || ovmsBatchSize;

  if (providerBatchSize && providerBatchSize > 0) {
    return providerBatchSize;
  }
  return defaultBatchSize;
}
