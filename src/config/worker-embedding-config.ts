/**
 * Worker Embedding Config Builder
 *
 * Builds WorkerEmbeddingConfig from YAML config for subprocess workers.
 * Used by DevAgent to configure embedding generation in parser workers.
 */

import { log } from "../logging/index.js";
import type { EmbeddingProviderKind, WorkerEmbeddingConfig } from "../types/semantic.js";
import { loadSemanticConfig, type SemanticConfig } from "../utils/config-paths.js";
import { getConfig } from "./yaml-config.js";

/**
 * Model configuration entry in provider configs
 */
interface ModelEntry {
  id: string;
  vector_size?: number;
  [key: string]: unknown;
}

/**
 * Combined embedding configuration type from semantic-config.json and yaml-config
 * Includes all possible properties from both sources
 */
interface CombinedEmbeddingConfig {
  platform?: "tei" | "ovms" | "ovms-native" | "vllm" | "llamacpp" | "mlx" | string;
  architecture?: string;
  // Provider-specific configs
  tei?: {
    endpoint?: string;
    baseUrl?: string;
    selected_model?: string;
    model?: string;
    max_client_batch_size?: number;
    batchSize?: number;
    timeoutMs?: number;
    concurrency?: number;
    models?: ModelEntry[];
  };
  ovms?: {
    endpoint?: string;
    selected_model?: string;
    model?: string;
    batch_size?: number;
    batchSize?: number;
    endpoints?: string[];
    useEmbeddingsApi?: boolean;
    encodingFormat?: "float" | "base64";
    protocol?: "rest" | "grpc";
    grpcPort?: number;
    timeoutMs?: number;
    concurrency?: number;
    models?: ModelEntry[];
  };
  openai?: {
    model?: string;
    batchSize?: number;
    baseUrl?: string;
    apiKey?: string;
    timeoutMs?: number;
    concurrency?: number;
  };
  vllm?: {
    endpoint?: string;
    baseUrl?: string;
    selected_model?: string;
    model?: string;
    max_batch_size?: number;
    batchSize?: number;
    encoding_format?: "float" | "base64";
    timeoutMs?: number;
    concurrency?: number;
    models?: ModelEntry[];
  };
  llamacpp?: {
    endpoint?: string;
    selected_model?: string;
    batch_size?: number;
    context_size?: number;
    n_gpu_layers?: number;
    timeoutMs?: number;
    concurrency?: number;
    models?: ModelEntry[];
  };
  mlx?: {
    endpoint?: string;
    selected_model?: string;
    max_batch_size?: number;
    timeoutMs?: number;
    concurrency?: number;
    auto_start?: boolean;
    models?: ModelEntry[];
  };
  // Common properties (may come from yaml-config)
  vector_dimensions?: number;
  dimensions?: number;
  context_tokens?: number;
  contextTokens?: number;
  maxTokens?: number;
}

/**
 * Model vector dimensions.
 * Used for binary vector dump format.
 */
const MODEL_DIMENSIONS: Record<string, number> = {
  // E5 models
  "intfloat/multilingual-e5-small": 384,
  "multilingual-e5-small": 384, // Short name for OVMS
  "intfloat/multilingual-e5-base": 768,
  "multilingual-e5-base": 768, // Short name for OVMS/llama.cpp
  "intfloat/multilingual-e5-large": 1024,
  "intfloat/multilingual-e5-large-instruct": 1024,
  "intfloat/e5-small-v2": 384,
  "intfloat/e5-base-v2": 768,
  "intfloat/e5-large-v2": 1024,
  // BGE models
  "BAAI/bge-small-en-v1.5": 384,
  "BAAI/bge-base-en-v1.5": 768,
  "BAAI/bge-large-en-v1.5": 1024,
  "BAAI/bge-m3": 1024,
  // MiniLM models
  "all-MiniLM-L6-v2": 384,
  "all-MiniLM-L12-v2": 384,
  // OpenAI models
  "text-embedding-3-small": 1536,
  "text-embedding-3-large": 3072,
  "text-embedding-ada-002": 1536,
  // Ollama models
  "all-minilm": 384,
  "nomic-embed-text": 768,
  "mxbai-embed-large": 1024,
};

/**
 * Get dimensions for a model.
 */
function getModelDimensions(modelName: string, configValue?: number): number {
  if (configValue && configValue > 0) {
    return configValue;
  }
  if (MODEL_DIMENSIONS[modelName]) {
    return MODEL_DIMENSIONS[modelName];
  }
  for (const [key, value] of Object.entries(MODEL_DIMENSIONS)) {
    if (modelName.includes(key) || key.includes(modelName)) {
      return value;
    }
  }
  return 384; // Default for most small models
}

/**
 * Model context window sizes (in tokens).
 * Used to properly truncate text before sending to embedding API.
 */
const MODEL_CONTEXT_TOKENS: Record<string, number> = {
  // E5 models
  "intfloat/multilingual-e5-small": 512,
  "intfloat/multilingual-e5-base": 512,
  "multilingual-e5-base": 512, // llama.cpp GGUF model name
  "intfloat/multilingual-e5-large": 512,
  "intfloat/multilingual-e5-large-instruct": 512,
  "intfloat/e5-small-v2": 512,
  "intfloat/e5-base-v2": 512,
  "intfloat/e5-large-v2": 512,
  // BGE models
  "BAAI/bge-small-en-v1.5": 512,
  "BAAI/bge-base-en-v1.5": 512,
  "BAAI/bge-large-en-v1.5": 512,
  "BAAI/bge-m3": 8192,
  // MiniLM models
  "all-MiniLM-L6-v2": 256,
  "all-MiniLM-L12-v2": 256,
  // OpenAI models
  "text-embedding-3-small": 8191,
  "text-embedding-3-large": 8191,
  "text-embedding-ada-002": 8191,
  // Ollama models
  "all-minilm": 256,
  "nomic-embed-text": 8192,
  "mxbai-embed-large": 512,
};

/**
 * Get context token limit for a model.
 * Priority: config value > lookup table > default 512
 */
function getModelContextTokens(modelName: string, configValue?: number): number {
  // Use config value if provided
  if (configValue && configValue > 0) {
    return configValue;
  }
  // Direct lookup
  if (MODEL_CONTEXT_TOKENS[modelName]) {
    return MODEL_CONTEXT_TOKENS[modelName];
  }
  // Partial match (for model variants)
  for (const [key, value] of Object.entries(MODEL_CONTEXT_TOKENS)) {
    if (modelName.includes(key) || key.includes(modelName)) {
      return value;
    }
  }
  // Default conservative limit
  return 512;
}

/**
 * Resolve provider-specific configuration from CombinedEmbeddingConfig.
 * Determines providerKind, providerOptions, modelName, and batchSize based on the
 * configured provider type (tei/ovms/openai/vllm/llamacpp/mlx).
 *
 * Side effect: may set embeddingConfig.vector_dimensions from model's vector_size.
 * Returns null if no provider is configured.
 */
function resolveProviderConfig(embeddingConfig: CombinedEmbeddingConfig): {
  providerKind: EmbeddingProviderKind;
  providerOptions: WorkerEmbeddingConfig["providerOptions"];
  modelName: string;
  batchSize: number;
} | null {
  const defaultModelName = "all-MiniLM-L6-v2";
  const defaultBatchSize = 64;

  if (embeddingConfig.tei) {
    const teiConfig = embeddingConfig.tei;
    const modelName = teiConfig.selected_model || teiConfig.model || defaultModelName;
    const batchSize = teiConfig.max_client_batch_size || teiConfig.batchSize || defaultBatchSize;
    // Get vector_size from selected model in models array
    const selectedModel = teiConfig.models?.find((m: ModelEntry) => m.id === modelName);
    if (selectedModel?.vector_size) {
      embeddingConfig.vector_dimensions = selectedModel.vector_size;
    }
    return {
      providerKind: "tei",
      modelName,
      batchSize,
      providerOptions: {
        baseUrl: teiConfig.endpoint || teiConfig.baseUrl || "http://127.0.0.1:8081",
        timeoutMs: teiConfig.timeoutMs,
        concurrency: teiConfig.concurrency, // default 16 in provider, can override here
        maxBatchSize: teiConfig.max_client_batch_size, // TEI max_client_batch_size (not max_batch_tokens)
      },
    };
  }

  if (embeddingConfig.ovms || embeddingConfig.platform === "ovms" || embeddingConfig.platform === "ovms-native") {
    // OVMS or OVMS Native provider
    const ovmsConfig = embeddingConfig.ovms || {};
    const endpoints = ovmsConfig.endpoints || [];
    // Use HuggingFace model id for tokenizer loading (selected_model), not endpoint name
    // Endpoints are passed separately in providerOptions for round-robin load balancing
    const selectedModelId = ovmsConfig.selected_model || ovmsConfig.model || "multilingual-e5-small";
    const batchSize = ovmsConfig.batch_size || ovmsConfig.batchSize || defaultBatchSize;
    // Get vector_size from selected model in models array
    const selectedModel = ovmsConfig.models?.find((m: ModelEntry) => m.id === selectedModelId);
    if (selectedModel?.vector_size) {
      embeddingConfig.vector_dimensions = selectedModel.vector_size;
    }
    return {
      providerKind: "ovms",
      modelName: selectedModelId,
      batchSize,
      providerOptions: {
        baseUrl: ovmsConfig.endpoint || "http://127.0.0.1:8083",
        timeoutMs: ovmsConfig.timeoutMs || 30000,
        concurrency: ovmsConfig.concurrency || 8,
        useEmbeddingsApi: ovmsConfig.useEmbeddingsApi ?? true,
        encodingFormat: ovmsConfig.encodingFormat ?? "base64",
        protocol: ovmsConfig.protocol,
        grpcPort: ovmsConfig.grpcPort,
        endpoints: endpoints.length > 0 ? endpoints : undefined, // For round-robin GPU/CPU load balancing
      },
    };
    // OVMS uses centralized embedding mode: workers send texts to Main,
    // Main generates embeddings via gRPC (faster than multiple HTTP clients)
    // This is set on the result below, not in providerOptions
  }

  if (embeddingConfig.openai) {
    const openaiConfig = embeddingConfig.openai;
    return {
      providerKind: "openai",
      modelName: openaiConfig.model || "text-embedding-3-small",
      batchSize: openaiConfig.batchSize || defaultBatchSize,
      providerOptions: {
        baseUrl: openaiConfig.baseUrl,
        apiKey: openaiConfig.apiKey || process.env["OPENAI_API_KEY"],
        timeoutMs: openaiConfig.timeoutMs,
        concurrency: openaiConfig.concurrency,
      },
    };
  }

  if (embeddingConfig.vllm || embeddingConfig.platform === "vllm") {
    const vllmConfig = embeddingConfig.vllm || {};
    const modelName = vllmConfig.selected_model || vllmConfig.model || "intfloat/multilingual-e5-large-instruct";
    // Larger batch = better GPU utilization, default 200 (server supports 256 via --max-num-seqs)
    const batchSize = vllmConfig.max_batch_size || vllmConfig.batchSize || 200;
    // Get vector_size from selected model in models array
    const selectedModel = vllmConfig.models?.find((m: ModelEntry) => m.id === modelName);
    if (selectedModel?.vector_size) {
      // Store in embeddingConfig for later use by getModelDimensions
      embeddingConfig.vector_dimensions = selectedModel.vector_size;
    }
    return {
      providerKind: "vllm",
      modelName,
      batchSize,
      providerOptions: {
        baseUrl: vllmConfig.endpoint || vllmConfig.baseUrl || "http://127.0.0.1:8000",
        timeoutMs: vllmConfig.timeoutMs || 30000,
        // Higher concurrency for embedding workloads (server handles batching internally)
        concurrency: vllmConfig.concurrency || 12,
        maxBatchSize: vllmConfig.max_batch_size || 200,
        encodingFormat: vllmConfig.encoding_format || "float",
      },
    };
  }

  if (embeddingConfig.llamacpp || embeddingConfig.platform === "llamacpp") {
    // llama.cpp provider (local GGUF models)
    // Optimized for throughput: larger batch size, higher concurrency
    const llamacppConfig = embeddingConfig.llamacpp || {};
    const modelName = llamacppConfig.selected_model || "multilingual-e5-base";
    // Larger batch = better GPU utilization, default 256 (up from 100)
    const batchSize = llamacppConfig.batch_size || 256;
    // Get vector_size from selected model in models array
    const selectedModel = llamacppConfig.models?.find((m: ModelEntry) => m.id === modelName);
    if (selectedModel?.vector_size) {
      embeddingConfig.vector_dimensions = selectedModel.vector_size;
    }
    return {
      providerKind: "llamacpp",
      modelName,
      batchSize,
      providerOptions: {
        baseUrl: llamacppConfig.endpoint || "http://127.0.0.1:8085",
        timeoutMs: llamacppConfig.timeoutMs || 60000, // 60s timeout for larger batches
        concurrency: llamacppConfig.concurrency || 8, // Match server's --parallel 8
        contextSize: llamacppConfig.context_size || 8192,
        nGpuLayers: llamacppConfig.n_gpu_layers ?? 99,
      },
    };
  }

  if (embeddingConfig.mlx || embeddingConfig.platform === "mlx") {
    // MLX provider (Apple Silicon Metal GPU)
    const mlxConfig = embeddingConfig.mlx || {};
    const modelName = mlxConfig.selected_model || "intfloat/multilingual-e5-base";
    const batchSize = mlxConfig.max_batch_size || 128;
    // Get vector_size from selected model in models array
    const selectedModel = mlxConfig.models?.find((m: ModelEntry) => m.id === modelName);
    if (selectedModel?.vector_size) {
      embeddingConfig.vector_dimensions = selectedModel.vector_size;
    }
    return {
      providerKind: "mlx",
      modelName,
      batchSize,
      providerOptions: {
        baseUrl: mlxConfig.endpoint || "http://127.0.0.1:8087",
        timeoutMs: mlxConfig.timeoutMs || 30000,
        concurrency: mlxConfig.concurrency || 4,
        maxBatchSize: mlxConfig.max_batch_size || 128,
      },
    };
  }

  // No embedding provider configured
  return null;
}

/**
 * Resolve model dimensions and context token limit from config and lookup tables.
 */
function resolveModelDimensions(
  embeddingConfig: CombinedEmbeddingConfig,
  modelName: string,
): { dimensions: number; contextTokens: number } {
  const configContextTokens = embeddingConfig.context_tokens || embeddingConfig.contextTokens;
  const contextTokens = getModelContextTokens(modelName, configContextTokens);

  const configDimensions = embeddingConfig.dimensions || embeddingConfig.vector_dimensions;
  const dimensions = getModelDimensions(modelName, configDimensions);

  return { dimensions, contextTokens };
}

/**
 * Compute queue batch size for centralized embedding mode (texts per HTTP request).
 * Rule: queueBatchSize <= max_client_batch_size (TEI/vLLM server limit).
 */
function computeQueueBatchSize(
  providerKind: EmbeddingProviderKind,
  providerOptions: WorkerEmbeddingConfig["providerOptions"],
): number | undefined {
  const defaultQueueBatch =
    providerKind === "mlx"
      ? 64
      : providerKind === "llamacpp"
        ? 72
        : providerKind === "ovms"
          ? 200
          : providerKind === "tei"
            ? 128 // was 50; larger batches reduce HTTP round-trips to TEI (~188→74 requests for 9k vectors)
            : undefined;
  // Ensure queue batch doesn't exceed server's max_client_batch_size
  const maxBatchFromProvider = providerOptions?.maxBatchSize as number | undefined;
  return defaultQueueBatch && maxBatchFromProvider
    ? Math.min(defaultQueueBatch, maxBatchFromProvider)
    : defaultQueueBatch;
}

/**
 * Build WorkerEmbeddingConfig from YAML config files.
 * Returns null if embeddings are disabled or not configured.
 */
// Cache for buildWorkerEmbeddingConfig to avoid repeated file reads
let cachedConfig: WorkerEmbeddingConfig | null = null;
let cacheInitialized = false;

export function buildWorkerEmbeddingConfig(): WorkerEmbeddingConfig | null {
  // Return cached config if available
  if (cacheInitialized) {
    return cachedConfig;
  }

  const config = getConfig();

  // Try to get semantic-config
  let semanticConfig: SemanticConfig | null = null;
  try {
    semanticConfig = loadSemanticConfig();
  } catch {
    // semantic-config not available, use yaml config only
  }

  // Determine provider from config
  // Use type assertion because we need properties from both semantic-config and yaml-config
  const embeddingConfig = (semanticConfig?.embedding || config.mcp?.embedding) as CombinedEmbeddingConfig | undefined;

  // Debug logging (only on first call)
  if (!cacheInitialized) {
    log.d("WORKEMBCONF", "config_check", { hasSemanticConfig: !!semanticConfig });
    if (embeddingConfig) {
      log.d("WORKEMBCONF", "config_details", { platform: embeddingConfig.platform, hasVllm: !!embeddingConfig.vllm });
    }
  }

  if (!embeddingConfig) {
    if (!cacheInitialized) {
      log.d("WORKEMBCONF", "no_config_found", {});
    }
    cacheInitialized = true;
    cachedConfig = null;
    return null;
  }

  // Resolve provider-specific configuration
  const providerResult = resolveProviderConfig(embeddingConfig);
  if (!providerResult) {
    cacheInitialized = true;
    cachedConfig = null;
    return null;
  }

  const { providerKind, providerOptions, modelName, batchSize } = providerResult;

  // Resolve dimensions and context tokens
  const { dimensions, contextTokens } = resolveModelDimensions(embeddingConfig, modelName);

  // Compute queue batch size for centralized mode
  const queueBatchSize = computeQueueBatchSize(providerKind, providerOptions);

  const result: WorkerEmbeddingConfig = {
    enabled: true,
    provider: providerKind,
    modelName,
    maxTokens: embeddingConfig.maxTokens || 512,
    contextTokens,
    batchSize,
    queueBatchSize,
    dimensions,
    providerOptions,
    // All providers use centralized embedding mode:
    // Workers send texts to Main, Main generates embeddings via single connection
    // Benefits: optimal batching, no HTTP connection contention, better GPU utilization
    centralizedEmbeddings: true,
  };

  // Log only on first call
  if (!cacheInitialized) {
    log.i("WORKEMBCONF", "config_built", {
      provider: providerKind,
      model: modelName,
      dims: dimensions,
      contextTokens,
      batchSize,
      queueBatchSize,
    });
  }

  // Cache for subsequent read-only calls
  cacheInitialized = true;
  cachedConfig = result;

  return result;
}
