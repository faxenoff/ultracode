#!/usr/bin/env node
/**
 * UltraCode - Semantic Embedding Setup Command v2
 *
 * Smart setup with hardware detection and guided recommendations.
 *
 * Flow:
 * 0. Detect CPU (AVX2/VNNI/AMX) + GPU (NVIDIA arch)
 * 1. Ask: Comment language (English / Multilingual)
 * 2. Recommend best provider based on hardware
 * 3. Select model (512 tok + 8K legacy)
 * 4. Auto-detect installed, install required
 */

import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { CPUDetector, type CPUInfo } from "../cpu/cpu-detector.js";
import { detectSystemLocale } from "../i18n/index.js";
import {
  ensureConfigDir,
  getConfigDir,
  getDisplayPath,
  loadSemanticConfig,
  type SemanticConfig,
  saveSemanticConfig,
} from "../utils/config-paths.js";

// Type alias for LLM platform
type LLMPlatform = NonNullable<SemanticConfig["llm"]>["platform"];

import { setSetupLanguage } from "./setup/i18n/index.js";

// Import from setup modules
import {
  askEnableLLM,
  c,
  detectGPU,
  type EmbeddingModel,
  type GPUInfo,
  type InstallResult,
  installLLMProvider,
  installProvider,
  type LLMConfig,
  type ModelsConfig,
  printBanner,
  printCompleteBanner,
  printError,
  printHardwareInfo,
  printInfo,
  printOK,
  printWarn,
  type SelectedLLMModel,
  selectLanguage,
  selectLLMModel,
  selectLLMProvider,
  selectModel,
  selectProvider,
} from "./setup/index.js";
import { cleanupDockerLlamaServer } from "./setup/utils/docker.js";

// ═══════════════════════════════════════════════════════════════
// Package Root Detection
// ═══════════════════════════════════════════════════════════════

function getPackageRoot(): string {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const standardRoot = join(__dirname, "..", "..");
  if (existsSync(join(standardRoot, "config", "embedding-models.json"))) {
    return standardRoot;
  }
  let current = __dirname;
  for (let i = 0; i < 10; i++) {
    if (existsSync(join(current, "package.json"))) {
      const pkgContent = readFileSync(join(current, "package.json"), "utf-8");
      try {
        const pkg = JSON.parse(pkgContent);
        if (
          (pkg.name === "ultracode" || pkg.name === "ultrascript-tools-mcp") &&
          existsSync(join(current, "config", "embedding-models.json"))
        ) {
          return current;
        }
      } catch {
        /* continue */
      }
    }
    const parent = dirname(current);
    if (parent === current) break;
    current = parent;
  }
  return standardRoot;
}

const PACKAGE_ROOT = getPackageRoot();
const MODELS_CONFIG_PATH = join(PACKAGE_ROOT, "config", "embedding-models.json");
const LLM_MODELS_CONFIG_PATH = join(PACKAGE_ROOT, "config", "llm-models.json");

// ═══════════════════════════════════════════════════════════════
// Config Loading
// ═══════════════════════════════════════════════════════════════

function loadModelsConfig(): ModelsConfig | null {
  if (!existsSync(MODELS_CONFIG_PATH)) {
    printError(`Models configuration not found: ${MODELS_CONFIG_PATH}`);
    return null;
  }
  try {
    return JSON.parse(readFileSync(MODELS_CONFIG_PATH, "utf-8")) as ModelsConfig;
  } catch (error) {
    printError(`Failed to parse models config: ${error}`);
    return null;
  }
}

function loadLLMConfig(): LLMConfig | null {
  if (!existsSync(LLM_MODELS_CONFIG_PATH)) {
    return null;
  }
  try {
    return JSON.parse(readFileSync(LLM_MODELS_CONFIG_PATH, "utf-8")) as LLMConfig;
  } catch (error) {
    printWarn(`Failed to parse LLM config: ${error}`);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════
// Helper functions
// ═══════════════════════════════════════════════════════════════

function getDefaultEndpoint(provider: string): string {
  switch (provider) {
    case "ollama":
      return "http://127.0.0.1:11434";
    case "tgi":
      return "http://127.0.0.1:8081";
    case "docker-model-runner":
      return "http://127.0.0.1:12434";
    default:
      return "";
  }
}

// ═══════════════════════════════════════════════════════════════
// Setup Helpers
// ═══════════════════════════════════════════════════════════════

interface SetupArgs {
  providerArg?: string | undefined;
  modelArg?: string | undefined;
  langArg?: string | undefined;
  llmOnly: boolean;
}

function parseSetupArgs(args: string[]): SetupArgs {
  let providerArg: string | undefined;
  let modelArg: string | undefined;
  let langArg: string | undefined;
  let llmOnly = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--provider" && args[i + 1]) {
      providerArg = args[++i];
    }
    if (args[i] === "--model" && args[i + 1]) {
      modelArg = args[++i];
    }
    if ((args[i] === "--lang" || args[i] === "-l") && args[i + 1]) {
      langArg = args[++i];
    }
    if (args[i] === "--llm-only" || args[i] === "--llm") {
      llmOnly = true;
    }
  }

  return { providerArg, modelArg, langArg, llmOnly };
}

async function runLlmOnlySetup(cpu: CPUInfo, gpu: GPUInfo): Promise<void> {
  console.error("");
  printInfo("Пропускаем embedding setup, переходим к LLM...");
  console.error("");

  const llmConfig = loadLLMConfig();
  if (!llmConfig) {
    printWarn("LLM config not found");
    process.exit(1);
  }

  const llmProvider = await selectLLMProvider(cpu, gpu);
  if (!llmProvider) {
    printWarn("LLM setup cancelled");
    process.exit(0);
  }

  const llmModel = await selectLLMModel(llmProvider, llmConfig, gpu);
  if (!llmModel) {
    printWarn("LLM model selection cancelled");
    process.exit(0);
  }

  const llmSuccess = await installLLMProvider(llmProvider, llmModel, gpu);
  if (llmSuccess) {
    printOK("LLM setup completed!");
  } else {
    printWarn("LLM setup had issues");
  }

  // Load existing config and update LLM section
  const existingConfig = loadSemanticConfig();
  if (existingConfig) {
    existingConfig.llm = {
      enabled: true,
      platform: llmProvider as LLMPlatform,
      [llmProvider === "claude-code" ? "claude" : llmProvider]: {
        endpoint: llmProvider === "claude-code" ? undefined : getDefaultEndpoint(llmProvider),
        model_id: llmModel.model_id,
        context_tokens: llmModel.context_tokens,
      },
    };
    saveSemanticConfig(existingConfig);
    printOK("Config saved to semantic-config.json");
  } else {
    printWarn("No existing config found. Run full setup first.");
  }
}

function buildEmbeddingConfig(
  provider: string,
  selectedModel: EmbeddingModel,
  installResult: InstallResult,
  gpu: GPUInfo,
  cpu: CPUInfo,
): SemanticConfig {
  // Keep exact provider name for proper port selection
  const isOVMS = provider === "ovms" || provider === "ovms-native";
  const isOVMSNative = provider === "ovms-native";
  // OVMS Native uses port 8083, Docker uses 8082
  const ovmsPort = isOVMSNative ? 8083 : 8082;

  // Determine target device for OVMS (auto-detect NPU/GPU/CPU)
  let targetDevice = "CPU";
  if (isOVMS) {
    const gpuName = gpu.name?.toLowerCase() || "";
    const hasNPU = cpu.model.toLowerCase().includes("ultra");
    const isIntelGPU = gpu.available && gpuName.includes("intel");
    const isNvidiaGPU =
      gpu.available &&
      (gpuName.includes("nvidia") || gpuName.includes("geforce") || gpuName.includes("rtx") || gpuName.includes("gtx"));
    if (hasNPU) {
      targetDevice = "NPU";
    } else if (isNvidiaGPU) {
      targetDevice = "NVIDIA";
    } else if (isIntelGPU) {
      targetDevice = "GPU";
    }
  }

  return {
    enabled: true,
    embedding: {
      platform: provider as "tei" | "ovms" | "ovms-native" | "vllm" | "llamacpp",
      architecture: gpu.architecture,
      ovms: isOVMS
        ? {
            endpoint: `http://127.0.0.1:${ovmsPort}`,
            // batch_size is for tokenization (should be large for efficiency)
            // OVMS V3 API handles batching internally, use larger batches
            batch_size: 200,
            ovms_mini_batch: 8, // V3 API mini-batch size for parallel requests
            // Use detected model from running OVMS if available, otherwise use selected model
            selected_model: installResult.detectedModelId ?? selectedModel.model_id,
            // OpenVINO target device: NPU, GPU, CPU (auto-detected by setup)
            target_device: targetDevice,
            // Multi-device endpoints for round-robin load balancing (GPU + CPU parallel processing)
            endpoints: installResult.endpoints,
            models: [
              {
                id: installResult.detectedModelId ?? selectedModel.model_id,
                languages: [selectedModel.language],
                // Use detected dimensions from running OVMS if available
                vector_size: installResult.detectedDimensions ?? selectedModel.dimensions,
              },
            ],
            // OVMS API mode:
            // - V3 /v3/embeddings OpenAI-compatible API - for pre-converted models with pooling layer
            // - V2 /v2/models/{model}/infer - tokenization + pooling on client (fallback)
            useEmbeddingsApi: selectedModel.v3_api === true, // Use V3 if model supports it
            encodingFormat: selectedModel.v3_api === true ? "base64" : "float", // base64 for V3, float for V2
          }
        : undefined,
      tei:
        provider === "tei"
          ? (() => {
              const teiCfg = (selectedModel as unknown as Record<string, unknown>)["tei_config"] as
                | { max_batch_tokens?: number; max_client_batch_size?: number; concurrency?: number }
                | undefined;
              return {
                endpoint: "http://127.0.0.1:8081",
                max_batch_tokens: teiCfg?.max_batch_tokens ?? 16384,
                max_client_batch_size: teiCfg?.max_client_batch_size ?? 500,
                concurrency: teiCfg?.concurrency,
                selected_model: selectedModel.model_id,
                models: [
                  {
                    id: selectedModel.model_id,
                    languages: [selectedModel.language],
                    vector_size: selectedModel.dimensions,
                  },
                ],
              };
            })()
          : undefined,
      vllm:
        provider === "vllm"
          ? {
              endpoint: "http://127.0.0.1:8000",
              max_batch_size: 200, // vLLM 0.14+ handles larger batches well
              encoding_format: "base64", // ~33% smaller payloads (vLLM 0.14+)
              selected_model: selectedModel.model_id,
              models: [
                {
                  id: selectedModel.model_id,
                  languages: [selectedModel.language],
                  vector_size: selectedModel.dimensions,
                },
              ],
            }
          : undefined,
      llamacpp:
        provider === "llamacpp"
          ? {
              endpoint: "http://127.0.0.1:8085",
              selected_model: selectedModel.model_id,
              // IMPORTANT: ctx-size is divided by parallel slots!
              // So for 512 tokens per request with parallel=8, need ctx-size = 512 * 8 = 4096
              context_size: (selectedModel.context_tokens || 512) * 8,
              // Server performance tuning (optimized for throughput)
              parallel_slots: 8, // --parallel: concurrent request slots
              ubatch_size: 1536, // --ubatch-size: micro-batch for processing
              batch_size: 3072, // --batch-size: prompt processing batch
              // Client tuning
              max_batch_size: 256, // texts per HTTP request
              concurrency: 8, // parallel HTTP requests (should match parallel_slots)
              auto_start: true,
              models: [
                {
                  id: selectedModel.model_id,
                  languages: [selectedModel.language],
                  vector_size: selectedModel.dimensions,
                },
              ],
            }
          : undefined,
    },
    auto_detection: { gpu_architecture: true, codebase_size: true, language: true },
  };
}

function buildLlmConfig(llmProvider: string, llmModel: SelectedLLMModel): NonNullable<SemanticConfig["llm"]> {
  return {
    enabled: true,
    platform: llmProvider as LLMPlatform,
    claude:
      llmProvider === "claude-code"
        ? {
            model_id: llmModel.model_id,
            context_tokens: llmModel.context_tokens,
          }
        : undefined,
    ollama:
      llmProvider === "ollama"
        ? {
            endpoint: "http://127.0.0.1:11434",
            model_id: llmModel.model_id,
            context_tokens: llmModel.context_tokens,
          }
        : undefined,
    tgi:
      llmProvider === "tgi"
        ? {
            endpoint: "http://127.0.0.1:8081",
            model_id: llmModel.model_id,
            context_tokens: llmModel.context_tokens,
            container_name: "tgi-llm-server",
          }
        : undefined,
    docker_model_runner:
      llmProvider === "docker-model-runner"
        ? {
            endpoint: "http://127.0.0.1:12434",
            model_id: llmModel.model_id,
            context_tokens: llmModel.context_tokens,
          }
        : undefined,
  };
}

// ═══════════════════════════════════════════════════════════════
// Main Setup
// ═══════════════════════════════════════════════════════════════

export async function runSetup(args: string[]): Promise<void> {
  printBanner();

  const config = loadModelsConfig();
  if (!config) process.exit(1);

  // Parse args
  const { providerArg, modelArg, langArg, llmOnly } = parseSetupArgs(args);

  // Initialize UI language (auto-detect from system or use CLI override)
  const localeConfig = detectSystemLocale(langArg);
  setSetupLanguage(localeConfig.language);

  // Step 0: Detect hardware
  const cpu = CPUDetector.detect();
  const gpu = detectGPU();
  printHardwareInfo(cpu, gpu);

  // If --llm-only, skip embedding setup and go directly to LLM
  if (llmOnly) {
    await runLlmOnlySetup(cpu, gpu);
    return;
  }

  // Step 1: Language selection
  const language = await selectLanguage();

  // Step 2: Provider selection
  const provider = providerArg || (await selectProvider(cpu, gpu));

  // Step 3: Model selection
  let selectedModel: EmbeddingModel;

  if (modelArg) {
    const found = config.models.find((m) => m.id === modelArg || m.model_id === modelArg);
    if (!found) {
      printError(`Model not found: ${modelArg}`);
      process.exit(1);
    }
    selectedModel = found;
    printInfo(`Using model: ${selectedModel.name}`);
  } else {
    selectedModel = await selectModel(provider, language, config, gpu);
  }

  // Step 4: Installation
  const installResult = await installProvider(provider, selectedModel, gpu, cpu);

  if (!installResult.success) {
    printWarn("Installation had issues, but config will be saved");
  }

  // Build and save embedding config
  const finalConfig = buildEmbeddingConfig(provider, selectedModel, installResult, gpu, cpu);

  ensureConfigDir();
  saveSemanticConfig(finalConfig);

  // Step 5: LLM Model Selection (optional)
  console.error("");
  const enableLLM = await askEnableLLM();

  if (enableLLM) {
    const llmConfig = loadLLMConfig();
    if (llmConfig) {
      const llmProvider = await selectLLMProvider(cpu, gpu);
      if (llmProvider) {
        const llmModel = await selectLLMModel(llmProvider, llmConfig, gpu);
        if (llmModel) {
          // Install LLM provider and download model
          const llmSuccess = await installLLMProvider(llmProvider, llmModel, gpu);

          if (!llmSuccess) {
            printWarn("LLM installation had issues, but config will be saved");
          }

          // Update config with LLM settings
          finalConfig.llm = buildLlmConfig(llmProvider, llmModel);

          // auto_start is already set in llamacpp config above
          saveSemanticConfig(finalConfig);
        }
      }
    } else {
      printWarn("LLM config not found, skipping LLM setup");
    }
  }

  // Summary
  printCompleteBanner();
  console.error(`  ${c.bright}Embedding:${c.reset}`);
  console.error(`  ${c.cyan}  Provider:${c.reset}   ${provider}`);
  console.error(`  ${c.cyan}  Model:${c.reset}      ${selectedModel.name}`);
  console.error(`  ${c.cyan}  Context:${c.reset}    ${selectedModel.context_tokens} tokens`);
  console.error(`  ${c.cyan}  Language:${c.reset}   ${language === "en" ? "English" : "Multilingual"}`);
  console.error("");

  if (finalConfig.llm?.enabled) {
    console.error(`  ${c.bright}LLM (AutoDoc):${c.reset}`);
    console.error(`  ${c.cyan}  Provider:${c.reset}   ${finalConfig.llm.platform}`);
    const llmModelId =
      finalConfig.llm.claude?.model_id ||
      finalConfig.llm.ollama?.model_id ||
      finalConfig.llm.tgi?.model_id ||
      finalConfig.llm.docker_model_runner?.model_id;
    const llmContext =
      finalConfig.llm.claude?.context_tokens ||
      finalConfig.llm.ollama?.context_tokens ||
      finalConfig.llm.tgi?.context_tokens ||
      finalConfig.llm.docker_model_runner?.context_tokens;
    console.error(`  ${c.cyan}  Model:${c.reset}      ${llmModelId}`);
    console.error(
      `  ${c.cyan}  Context:${c.reset}    ${llmContext ? `${Math.round(llmContext / 1024)}K` : "?"} tokens`,
    );
    if (finalConfig.llm.tgi) {
      console.error(`  ${c.cyan}  Endpoint:${c.reset}   ${finalConfig.llm.tgi.endpoint}`);
    }
    console.error("");
  }

  console.error(`  ${c.cyan}Config:${c.reset}       ${getDisplayPath(getConfigDir())}/semantic-config.json`);
  console.error("");

  if (provider === "tei") {
    console.error(`${c.dim}TEI Management:${c.reset}`);
    console.error(`${c.dim}  docker logs tei-server      # View logs${c.reset}`);
    console.error(`${c.dim}  docker restart tei-server   # Restart${c.reset}`);
  } else if (provider === "vllm") {
    console.error(`${c.dim}vLLM Management:${c.reset}`);
    console.error(`${c.dim}  docker logs vllm-server     # View logs${c.reset}`);
    console.error(`${c.dim}  docker restart vllm-server  # Restart${c.reset}`);
  }

  // LLM management hints
  if (finalConfig.llm?.tgi) {
    console.error("");
    console.error(`${c.dim}TGI LLM Management:${c.reset}`);
    console.error(`${c.dim}  docker logs tgi-llm-server    # View logs${c.reset}`);
    console.error(`${c.dim}  docker restart tgi-llm-server # Restart${c.reset}`);
  }

  // Cleanup: Kill Docker's built-in llama-server if running
  // (Docker Desktop may auto-start com.docker.llama-server.exe when docker commands are invoked)
  cleanupDockerLlamaServer();

  console.error("");
  console.error(`${c.yellow}Next: Restart your MCP client to enable semantic mode${c.reset}`);
  console.error("");
}

// Run if executed directly
const isMain =
  import.meta.url.endsWith("setup-command.ts") ||
  import.meta.url.endsWith("setup-command.js") ||
  import.meta.url.includes("setup-command.ts?") ||
  import.meta.url.includes("setup-command.js?") ||
  process.argv[1]?.includes("setup-command");

if (isMain) {
  runSetup(process.argv.slice(2)).catch((error) => {
    console.error("Setup failed:", error);
    process.exit(1);
  });
}
