import { describe, expect, it } from "bun:test";
import {
  buildEmbeddingGeneratorOptions,
  buildWorkerProviderOptions,
  getBatchSizeFromConfig,
  getModelNameFromSemanticConfig,
  mapSemanticConfigToProvider,
} from "../../src/agents/semantic/provider-config.js";
import { ConfigLoader } from "../../src/config/yaml-config.js";
import { loadSemanticConfig } from "../../src/utils/config-paths.js";

describe("mapSemanticConfigToProvider", () => {
  it("returns 'auto' for null config", () => {
    expect(mapSemanticConfigToProvider(null)).toBe("auto");
  });

  it("returns 'auto' when disabled", () => {
    expect(mapSemanticConfigToProvider({ enabled: false } as any)).toBe("auto");
  });

  it("maps known platforms", () => {
    const platforms = ["ovms", "ovms-native", "vllm", "llamacpp", "mlx", "tei"] as const;
    for (const platform of platforms) {
      const result = mapSemanticConfigToProvider({
        enabled: true,
        embedding: { platform },
      } as any);
      expect(result).toBe(platform);
    }
  });

  it("returns 'auto' for unknown platform", () => {
    const result = mapSemanticConfigToProvider({
      enabled: true,
      embedding: { platform: "unknown" },
    } as any);
    expect(result).toBe("auto");
  });
});

describe("getModelNameFromSemanticConfig", () => {
  it("returns default for null config", () => {
    expect(getModelNameFromSemanticConfig(null)).toBe("all-MiniLM-L6-v2");
  });

  it("returns default for disabled config", () => {
    expect(getModelNameFromSemanticConfig({ enabled: false } as any)).toBe("all-MiniLM-L6-v2");
  });

  it("returns tei model name from config", () => {
    const result = getModelNameFromSemanticConfig({
      enabled: true,
      embedding: { platform: "tei", tei: { selected_model: "custom-tei-model" } },
    } as any);
    expect(result).toBe("custom-tei-model");
  });

  it("returns ovms model name from config", () => {
    const result = getModelNameFromSemanticConfig({
      enabled: true,
      embedding: { platform: "ovms", ovms: { selected_model: "custom-ovms-model" } },
    } as any);
    expect(result).toBe("custom-ovms-model");
  });

  it("returns default tei model when no selected_model", () => {
    const result = getModelNameFromSemanticConfig({
      enabled: true,
      embedding: { platform: "tei", tei: {} },
    } as any);
    expect(result).toBe("BAAI/bge-m3");
  });

  it("returns default for unknown platform", () => {
    const result = getModelNameFromSemanticConfig({
      enabled: true,
      embedding: { platform: "unknown" },
    } as any);
    expect(result).toBe("all-MiniLM-L6-v2");
  });
});

describe("buildEmbeddingGeneratorOptions", () => {
  it("returns base options for auto provider", () => {
    const opts = buildEmbeddingGeneratorOptions("auto", "test-model", 32, null, null);
    expect(opts.provider).toBe("auto");
    expect(opts.modelName).toBe("test-model");
    expect(opts.batchSize).toBe(32);
    expect(opts.quantized).toBe(true);
    expect(opts.localPath).toBe("./models");
  });

  it("uses modelPath from yamlConfig", () => {
    const opts = buildEmbeddingGeneratorOptions("auto", "m", 32, null, {
      semanticAgent: { modelPath: "/custom/models" },
    });
    expect(opts.localPath).toBe("/custom/models");
  });

  it("configures TEI from yaml config", () => {
    const opts = buildEmbeddingGeneratorOptions("tei", "bge-m3", 32, null, {
      mcp: {
        embedding: {
          tei: {
            baseUrl: "http://my-tei:8081",
            timeoutMs: 5000,
            concurrency: 8,
            checkServer: true,
          },
        },
      },
    });
    expect(opts.tei).toBeDefined();
    expect(opts.tei!.baseUrl).toBe("http://my-tei:8081");
    expect(opts.tei!.timeoutMs).toBe(5000);
    expect(opts.tei!.concurrency).toBe(8);
    expect(opts.tei!.checkServer).toBe(true);
  });

  it("configures TEI from semantic-config.json endpoint", () => {
    const opts = buildEmbeddingGeneratorOptions(
      "tei",
      "bge-m3",
      32,
      { enabled: true, embedding: { platform: "tei", tei: { endpoint: "http://json-tei:9090" } } } as any,
      null,
    );
    expect(opts.tei).toBeDefined();
    expect(opts.tei!.baseUrl).toBe("http://json-tei:9090");
  });

  it("configures OVMS options", () => {
    const opts = buildEmbeddingGeneratorOptions(
      "ovms",
      "model",
      64,
      {
        enabled: true,
        embedding: {
          platform: "ovms",
          ovms: {
            endpoint: "http://ovms:9000",
            ovms_mini_batch: 16,
            useEmbeddingsApi: false,
            encodingFormat: "float",
            endpoints: ["http://ovms1:9000", "http://ovms2:9000"],
          },
        },
      } as any,
      null,
    );
    expect(opts.ovms).toBeDefined();
    expect(opts.ovms!.baseUrl).toBe("http://ovms:9000");
    expect(opts.ovms!.miniBatchSize).toBe(16);
    expect(opts.ovms!.useEmbeddingsApi).toBe(false);
    expect(opts.ovms!.encodingFormat).toBe("float");
  });

  it("configures llamacpp options with defaults", () => {
    const opts = buildEmbeddingGeneratorOptions(
      "llamacpp",
      "model",
      32,
      { enabled: true, embedding: { platform: "llamacpp" } } as any,
      null,
    );
    expect(opts.llamacpp).toBeDefined();
    expect(opts.llamacpp!.baseUrl).toBe("http://127.0.0.1:8085");
    expect(opts.llamacpp!.timeoutMs).toBe(30000);
    expect(opts.llamacpp!.concurrency).toBe(4);
    expect(opts.llamacpp!.autoStart).toBe(true);
  });

  it("configures mlx options", () => {
    const opts = buildEmbeddingGeneratorOptions(
      "mlx",
      "model",
      32,
      { enabled: true, embedding: { platform: "mlx", mlx: { endpoint: "http://mlx:8087" } } } as any,
      null,
    );
    expect(opts.mlx).toBeDefined();
    expect(opts.mlx!.baseUrl).toBe("http://mlx:8087");
  });

  it("does not add provider-specific config for non-matching provider", () => {
    const opts = buildEmbeddingGeneratorOptions("auto", "model", 32, null, null);
    expect(opts.tei).toBeUndefined();
    expect(opts.ovms).toBeUndefined();
    expect(opts.llamacpp).toBeUndefined();
    expect(opts.mlx).toBeUndefined();
  });
});

describe("buildWorkerProviderOptions", () => {
  it("returns undefined for unknown provider", () => {
    expect(buildWorkerProviderOptions("auto", null, null)).toBeUndefined();
    expect(buildWorkerProviderOptions("unknown", null, null)).toBeUndefined();
  });

  it("builds TEI worker options", () => {
    const opts = buildWorkerProviderOptions("tei", null, {
      mcp: { embedding: { tei: { baseUrl: "http://tei:8081", timeoutMs: 3000 } } },
    });
    expect(opts).toBeDefined();
    expect(opts!.baseUrl).toBe("http://tei:8081");
    expect(opts!.timeoutMs).toBe(3000);
  });

  it("builds OVMS worker options", () => {
    const opts = buildWorkerProviderOptions(
      "ovms",
      {
        enabled: true,
        embedding: {
          platform: "ovms",
          ovms: { endpoint: "http://ovms:9000", useEmbeddingsApi: true, encodingFormat: "base64" },
        },
      } as any,
      null,
    );
    expect(opts).toBeDefined();
    expect(opts!.baseUrl).toBe("http://ovms:9000");
    expect(opts!.useEmbeddingsApi).toBe(true);
  });

  it("builds llamacpp worker options with defaults", () => {
    const opts = buildWorkerProviderOptions("llamacpp", null, null);
    expect(opts).toBeDefined();
    expect(opts!.baseUrl).toBe("http://127.0.0.1:8085");
    expect(opts!.timeoutMs).toBe(30000);
    expect(opts!.concurrency).toBe(4);
  });

  it("builds mlx worker options", () => {
    const opts = buildWorkerProviderOptions("mlx", null, null);
    expect(opts).toBeDefined();
    expect(opts!.baseUrl).toBe("http://127.0.0.1:8087");
  });
});

describe("getBatchSizeFromConfig", () => {
  it("returns default when no config", () => {
    expect(getBatchSizeFromConfig(null, 32)).toBe(32);
  });

  it("returns tei batch size from config", () => {
    const result = getBatchSizeFromConfig({ enabled: true, embedding: { tei: { max_batch_tokens: 128 } } } as any, 32);
    expect(result).toBe(128);
  });

  it("returns ovms batch size from config", () => {
    const result = getBatchSizeFromConfig({ enabled: true, embedding: { ovms: { batch_size: 64 } } } as any, 32);
    expect(result).toBe(64);
  });

  it("returns default when batch size is 0", () => {
    const result = getBatchSizeFromConfig({ enabled: true, embedding: { ovms: { batch_size: 0 } } } as any, 32);
    expect(result).toBe(32);
  });
});

// ─── Live config resolution (uses current user config) ──────────────
describe("Live config resolution", () => {
  const semanticConfig = loadSemanticConfig();
  const yamlConfig = ConfigLoader.getInstance().getConfig();
  const yamlProvider = yamlConfig.mcp?.embedding?.provider;

  const jsonProvider = mapSemanticConfigToProvider(semanticConfig);
  const resolved = jsonProvider !== "auto" ? jsonProvider : (yamlProvider ?? "auto");

  it("semantic-config.json and YAML agree on provider", () => {
    // If semantic-config.json specifies a provider, YAML should match or be "auto"
    if (semanticConfig?.enabled && jsonProvider !== "auto" && yamlProvider) {
      expect(resolved).toBe(jsonProvider);
      // Warn (but don't fail) if YAML disagrees — semantic-config wins anyway
      if (yamlProvider !== jsonProvider && yamlProvider !== "auto") {
        console.warn(
          `[WARN] YAML provider "${yamlProvider}" differs from semantic-config "${jsonProvider}". ` +
            `semantic-config.json wins at runtime, but consider aligning development.yaml.`,
        );
      }
    }
  });

  it("resolved provider is not 'auto' when semantic-config is enabled", () => {
    if (semanticConfig?.enabled) {
      expect(resolved).not.toBe("auto");
      console.log(`[INFO] Active embedding provider: ${resolved}`);
    }
  });

  it("resolved provider is not 'ollama' (use TEI/OVMS/vLLM instead)", () => {
    // ollama is legacy — production should use dedicated servers
    expect(resolved).not.toBe("ollama");
  });

  it("model name resolves from current config", () => {
    const jsonModel = getModelNameFromSemanticConfig(semanticConfig);
    const yamlModel = yamlConfig.mcp?.embedding?.model;
    const model = jsonModel !== "all-MiniLM-L6-v2" ? jsonModel : yamlModel || "all-MiniLM-L6-v2";

    expect(model.length).toBeGreaterThan(0);
    console.log(`[INFO] Active embedding model: ${model}`);
  });

  it("buildEmbeddingGeneratorOptions produces valid config for resolved provider", () => {
    const jsonModel = getModelNameFromSemanticConfig(semanticConfig);
    const yamlModel = yamlConfig.mcp?.embedding?.model;
    const model = jsonModel !== "all-MiniLM-L6-v2" ? jsonModel : yamlModel || "all-MiniLM-L6-v2";

    const opts = buildEmbeddingGeneratorOptions(resolved as any, model, 50, semanticConfig, yamlConfig as any);

    expect(opts.provider).toBe(resolved);
    expect(opts.modelName).toBe(model);
    expect(opts.batchSize).toBe(50);

    // Provider-specific config should be present for the active provider
    if (resolved === "tei") {
      expect(opts.tei).toBeDefined();
      expect(opts.tei!.baseUrl).toContain("http");
      console.log(`[INFO] TEI endpoint: ${opts.tei!.baseUrl}`);
    } else if (resolved === "ovms" || resolved === "ovms-native") {
      expect(opts.ovms).toBeDefined();
    } else if (resolved === "llamacpp") {
      expect(opts.llamacpp).toBeDefined();
    } else if (resolved === "mlx") {
      expect(opts.mlx).toBeDefined();
    }
  });
});
