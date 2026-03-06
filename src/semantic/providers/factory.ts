import { log } from "../../logging/index.js";
import { makeProviderLogger } from "../../utils/provider-logger.js";
import { LLAMACPP_EMBEDDING_PORT } from "../llamacpp-server-manager.js";
import { MLX_EMBEDDING_PORT } from "../mlx-server-manager.js";
import { OVMS_NATIVE_GRPC_PORT, OVMS_NATIVE_REST_PORT } from "../ovms-native-manager.js";
import type { EmbeddingProvider, ProviderKind } from "./base.js";
import { CloudRUProvider } from "./cloudru-provider.js";
import { HuggingFaceProvider } from "./huggingface-provider.js";
import { LlamaCppProvider } from "./llamacpp-provider.js";
import { MlxProvider } from "./mlx-provider.js";
import { OllamaProvider } from "./ollama-provider.js";
import { OpenAIProvider } from "./openai-provider.js";
import { OVMSProvider } from "./ovms-provider.js";
import { TEIProvider } from "./tei-provider.js";
import { VLLMProvider } from "./vllm-provider.js";

//Auto-detection order

interface DetectionCandidate {
  provider: ProviderKind;
  model: string;
  url: string;
  label: string;
  postDetect?: () => Promise<string | null>;
}

function buildCandidates(): DetectionCandidate[] {
  const list: DetectionCandidate[] = [];

  // On macOS ARM64, try MLX first (native Metal GPU acceleration)
  if (process.platform === "darwin" && process.arch === "arm64") {
    list.push({
      provider: "mlx",
      model: "intfloat/multilingual-e5-base",
      url: `http://127.0.0.1:${MLX_EMBEDDING_PORT}/health`,
      label: "MLX",
    });
  }

  list.push(
    {
      provider: "ovms-native",
      model: "multilingual-e5-base",
      url: `http://127.0.0.1:${OVMS_NATIVE_REST_PORT}/v2/health/ready`,
      label: "OVMS Native",
    },
    {
      provider: "llamacpp",
      model: "gguf",
      url: `http://127.0.0.1:${LLAMACPP_EMBEDDING_PORT}/health`,
      label: "llama.cpp",
    },
    {
      provider: "vllm",
      model: "intfloat/multilingual-e5-small",
      url: "http://127.0.0.1:8000/health",
      label: "vLLM Docker",
      async postDetect() {
        try {
          const resp = await fetch("http://127.0.0.1:8000/v1/models", {
            method: "GET",
            signal: AbortSignal.timeout(2000),
          });
          if (resp.ok) {
            const body = (await resp.json()) as { data?: Array<{ id?: string }> };
            return body.data?.[0]?.id ?? null;
          }
        } catch {
          log.d("FACTORY", "vLLM /v1/models failed, using default model name");
        }
        return null;
      },
    },
    {
      provider: "tei",
      model: "BAAI/bge-m3",
      url: "http://127.0.0.1:8081/health",
      label: "TEI",
    },
  );

  return list;
}

async function detectAvailableProvider(): Promise<{ provider: ProviderKind; model: string }> {
  for (const candidate of buildCandidates()) {
    try {
      const res = await fetch(candidate.url, { method: "GET", signal: AbortSignal.timeout(2000) });
      if (!res.ok) continue;

      let modelName = candidate.model;
      if (candidate.postDetect) {
        const discovered = await candidate.postDetect();
        if (discovered) modelName = discovered;
      }

      log.i("FACTORY", `Auto-detected: ${candidate.label}, model=${modelName}`);
      return { provider: candidate.provider, model: modelName };
    } catch {
      log.d("FACTORY", `${candidate.label} not available`);
    }
  }

  throw new Error(
    "No embedding provider available. Please run: bun run mcp setup-embedding\n" +
      "Supported providers (by speed):\n" +
      "  - vLLM (1352 emb/s) - NVIDIA GPU, Docker required\n" +
      "  - TEI (1193 emb/s) - GPU, Docker required\n" +
      "  - llama.cpp (373 emb/s) - Native GGUF, no Docker\n" +
      "  - MLX - Apple Silicon Metal GPU, macOS ARM64\n" +
      "  - OVMS - Intel optimized, no Docker",
  );
}

//Factory options

export interface ProviderFactoryOptions {
  provider: ProviderKind;
  modelName: string;
  openai?:
    | {
        baseUrl?: string | undefined;
        apiKey?: string | undefined;
        timeoutMs?: number | undefined;
        concurrency?: number | undefined;
        dimensions?: number | undefined;
        maxBatchSize?: number | undefined;
      }
    | undefined;
  cloudru?:
    | {
        baseUrl?: string | undefined;
        apiKey?: string | undefined;
        timeoutMs?: number | undefined;
        concurrency?: number | undefined;
        maxBatchSize?: number | undefined;
      }
    | undefined;
  huggingface?:
    | {
        apiKey?: string | undefined;
        baseUrl?: string | undefined;
        timeoutMs?: number | undefined;
        concurrency?: number | undefined;
        warmupText?: string | undefined;
      }
    | undefined;
  tei?:
    | {
        baseUrl?: string | undefined;
        timeoutMs?: number | undefined;
        concurrency?: number | undefined;
        checkServer?: boolean | undefined;
        maxBatchSize?: number | undefined; // Max texts per request (TEI max_client_batch_size)
      }
    | undefined;
  ollama?:
    | {
        baseUrl?: string | undefined;
        timeoutMs?: number | undefined;
        concurrency?: number | undefined;
        headers?: Record<string, string> | undefined;
        autoPull?: boolean | undefined;
        warmupText?: string | undefined;
        checkServer?: boolean | undefined;
        pullTimeoutMs?: number | undefined;
      }
    | undefined;
  ovms?:
    | {
        baseUrl?: string | undefined;
        timeoutMs?: number | undefined;
        concurrency?: number | undefined;
        checkServer?: boolean | undefined;
        miniBatchSize?: number | undefined; // Internal batch size for OVMS server (default: 4)
        useEmbeddingsApi?: boolean | undefined; // Use /v3/embeddings OpenAI-compatible API (default: true)
        encodingFormat?: "float" | "base64" | undefined; // Response format for embeddings API (default: base64)
        protocol?: "rest" | "grpc" | undefined; // Protocol: rest (HTTP/JSON) or grpc (binary protobuf)
        grpcPort?: number | undefined; // gRPC port (default: 9000)
        endpoints?: string[] | undefined; // Multi-device endpoints for round-robin: ["embeddings-cpu", "embeddings-gpu"]
      }
    | undefined;
  vllm?:
    | {
        baseUrl?: string | undefined;
        timeoutMs?: number | undefined;
        concurrency?: number | undefined;
        checkServer?: boolean | undefined;
        maxBatchSize?: number | undefined;
        encodingFormat?: "float" | "base64" | undefined;
      }
    | undefined;
  llamacpp?:
    | {
        baseUrl?: string | undefined;
        timeoutMs?: number | undefined;
        concurrency?: number | undefined;
        checkServer?: boolean | undefined;
        maxBatchSize?: number | undefined;
        contextSize?: number | undefined;
        nGpuLayers?: number | undefined;
        /** Auto-start llama-server if not running (default: true) */
        autoStart?: boolean | undefined;
        /** Number of parallel request slots on server (default: 4) */
        parallelSlots?: number | undefined;
        /** Micro-batch size for embedding processing (default: 512) */
        ubatchSize?: number | undefined;
        /** Batch size for prompt processing (default: 1024) */
        batchSize?: number | undefined;
      }
    | undefined;
  mlx?:
    | {
        baseUrl?: string | undefined;
        timeoutMs?: number | undefined;
        concurrency?: number | undefined;
        checkServer?: boolean | undefined;
        maxBatchSize?: number | undefined;
        /** Auto-start MLX server if not running (default: true) */
        autoStart?: boolean | undefined;
      }
    | undefined;
}

//Provider builder registry (Map-based dispatch)

type BuilderFn = (model: string, opts: ProviderFactoryOptions) => EmbeddingProvider;

const builders = new Map<string, BuilderFn>([
  [
    "openai",
    (model, opts) => {
      if (!opts.openai?.apiKey) throw new Error("OpenAI apiKey is required");
      return new OpenAIProvider({
        model,
        apiKey: opts.openai.apiKey,
        baseUrl: opts.openai.baseUrl,
        timeoutMs: opts.openai.timeoutMs,
        concurrency: opts.openai.concurrency,
        dimensions: opts.openai.dimensions,
        maxBatchSize: opts.openai.maxBatchSize,
        logger: makeProviderLogger(null, "PROVIDER_OPENAI"),
      });
    },
  ],
  [
    "cloudru",
    (model, opts) =>
      new CloudRUProvider({
        model,
        apiKey: opts.cloudru?.apiKey,
        baseUrl: opts.cloudru?.baseUrl,
        timeoutMs: opts.cloudru?.timeoutMs,
        concurrency: opts.cloudru?.concurrency,
        maxBatchSize: opts.cloudru?.maxBatchSize,
        logger: makeProviderLogger(null, "PROVIDER_CLOUDRU"),
      }),
  ],
  [
    "huggingface",
    (model, opts) => {
      if (!opts.huggingface?.apiKey) throw new Error("HuggingFace apiKey is required");
      return new HuggingFaceProvider({
        model,
        apiKey: opts.huggingface.apiKey,
        baseUrl: opts.huggingface.baseUrl,
        timeoutMs: opts.huggingface.timeoutMs,
        concurrency: opts.huggingface.concurrency,
        warmupText: opts.huggingface.warmupText,
        logger: makeProviderLogger(null, "PROVIDER_HUGGINGFACE"),
      });
    },
  ],
  [
    "tei",
    (model, opts) => {
      log.i("FACTORY", `Creating TEI provider`, { tei: opts.tei });
      log.i("FACTORY", `TEI baseUrl=${opts.tei?.baseUrl || "UNDEFINED - will use default 8081"}`);
      return new TEIProvider({
        model,
        baseUrl: opts.tei?.baseUrl,
        timeoutMs: opts.tei?.timeoutMs,
        concurrency: opts.tei?.concurrency,
        checkServer: opts.tei?.checkServer,
        maxBatchSize: opts.tei?.maxBatchSize,
        logger: makeProviderLogger(null, "PROVIDER_TEI"),
      });
    },
  ],
  [
    "ollama",
    (model, opts) => {
      log.i("FACTORY", `Creating Ollama provider`, { ollama: opts.ollama });
      return new OllamaProvider({
        model,
        baseUrl: opts.ollama?.baseUrl,
        timeoutMs: opts.ollama?.timeoutMs,
        concurrency: opts.ollama?.concurrency,
        headers: opts.ollama?.headers,
        autoPull: opts.ollama?.autoPull,
        warmupText: opts.ollama?.warmupText,
        checkServer: opts.ollama?.checkServer,
        pullTimeoutMs: opts.ollama?.pullTimeoutMs,
        logger: makeProviderLogger(null, "PROVIDER_OLLAMA"),
      });
    },
  ],
  [
    "vllm",
    (model, opts) => {
      const baseUrl = opts.vllm?.baseUrl || "http://127.0.0.1:8000";
      return new VLLMProvider({
        model,
        baseUrl,
        timeoutMs: opts.vllm?.timeoutMs,
        concurrency: opts.vllm?.concurrency,
        maxBatchSize: opts.vllm?.maxBatchSize,
        checkServer: opts.vllm?.checkServer,
        encodingFormat: opts.vllm?.encodingFormat,
        logger: makeProviderLogger(null, "PROVIDER_VLLM"),
      });
    },
  ],
  [
    "llamacpp",
    (model, opts) => {
      const baseUrl = opts.llamacpp?.baseUrl || `http://127.0.0.1:${LLAMACPP_EMBEDDING_PORT}`;
      log.i("FACTORY", "Creating llama.cpp provider", {
        baseUrl,
        model,
        autoStart: opts.llamacpp?.autoStart,
        parallelSlots: opts.llamacpp?.parallelSlots,
        ubatchSize: opts.llamacpp?.ubatchSize,
        batchSize: opts.llamacpp?.batchSize,
      });
      return new LlamaCppProvider({
        model,
        baseUrl,
        timeoutMs: opts.llamacpp?.timeoutMs,
        concurrency: opts.llamacpp?.concurrency,
        maxBatchSize: opts.llamacpp?.maxBatchSize,
        checkServer: opts.llamacpp?.checkServer,
        contextSize: opts.llamacpp?.contextSize,
        nGpuLayers: opts.llamacpp?.nGpuLayers,
        autoStart: opts.llamacpp?.autoStart,
        parallelSlots: opts.llamacpp?.parallelSlots,
        ubatchSize: opts.llamacpp?.ubatchSize,
        batchSize: opts.llamacpp?.batchSize,
        logger: makeProviderLogger(null, "PROVIDER_LLAMACPP"),
      });
    },
  ],
  [
    "mlx",
    (model, opts) => {
      const baseUrl = opts.mlx?.baseUrl || `http://127.0.0.1:${MLX_EMBEDDING_PORT}`;
      log.i("FACTORY", "Creating MLX provider", {
        baseUrl,
        model,
        autoStart: opts.mlx?.autoStart,
      });
      return new MlxProvider({
        model,
        baseUrl,
        timeoutMs: opts.mlx?.timeoutMs,
        concurrency: opts.mlx?.concurrency,
        maxBatchSize: opts.mlx?.maxBatchSize,
        checkServer: opts.mlx?.checkServer,
        autoStart: opts.mlx?.autoStart,
        logger: makeProviderLogger(null, "PROVIDER_MLX"),
      });
    },
  ],
]);

// OVMS and ovms-native share the same builder
const ovmsBuilder: BuilderFn = (model, opts) => {
  const isNative = opts.provider === "ovms-native";
  const defaultBaseUrl = opts.ovms?.baseUrl || `http://127.0.0.1:${OVMS_NATIVE_REST_PORT}`;
  const grpcPort = opts.ovms?.grpcPort ?? OVMS_NATIVE_GRPC_PORT;

  log.i("FACTORY", `Creating OVMS provider (${opts.provider})`, {
    ovms: opts.ovms,
    isNative,
    baseUrl: defaultBaseUrl,
    grpcPort,
  });

  return new OVMSProvider({
    model,
    baseUrl: defaultBaseUrl,
    timeoutMs: opts.ovms?.timeoutMs,
    concurrency: opts.ovms?.concurrency,
    checkServer: opts.ovms?.checkServer,
    miniBatchSize: opts.ovms?.miniBatchSize,
    useEmbeddingsApi: opts.ovms?.useEmbeddingsApi ?? true,
    encodingFormat: opts.ovms?.encodingFormat,
    protocol: opts.ovms?.protocol as "rest" | "grpc" | undefined,
    grpcPort,
    isNative,
    endpoints: opts.ovms?.endpoints,
    logger: makeProviderLogger(null, `PROVIDER_${opts.provider.toUpperCase().replace("-", "_")}`),
  });
};
builders.set("ovms", ovmsBuilder);
builders.set("ovms-native", ovmsBuilder);

//Public factory function

export async function createProvider(opts: ProviderFactoryOptions): Promise<EmbeddingProvider> {
  let targetKind = opts.provider;
  let targetModel = opts.modelName;

  // Resolve "auto" by probing local servers
  if (targetKind === "auto") {
    const detected = await detectAvailableProvider();
    targetKind = detected.provider;
    targetModel = detected.model;
    log.i("FACTORY", `Auto mode selected: ${targetKind} with ${targetModel}`);
  }

  const builder = builders.get(targetKind);
  if (!builder) {
    throw new Error(
      `Unknown embedding provider: ${targetKind}. ` +
        `Supported providers: vllm, tei, ollama, llamacpp, mlx, ovms, ovms-native, openai, cloudru, huggingface`,
    );
  }

  return builder(targetModel, { ...opts, provider: targetKind });
}
