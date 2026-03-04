import { describe, expect, it } from "bun:test";

// Import the config module
import { ConfigLoader } from "../../src/config/yaml-config.js";

describe("ConfigLoader", () => {
  it("is a singleton", () => {
    const a = ConfigLoader.getInstance();
    const b = ConfigLoader.getInstance();
    expect(a).toBe(b);
  });

  it("returns default config when no YAML file exists", () => {
    const loader = ConfigLoader.getInstance();
    const config = loader.getConfig();

    expect(config).toBeDefined();
    expect(typeof config).toBe("object");
  });

  it("getEmbeddingConfig returns a resolved structure", () => {
    const loader = ConfigLoader.getInstance();
    const embConfig = loader.getEmbeddingConfig();

    expect(embConfig).toBeDefined();
    // Should have provider, model, and baseUrl fields
    expect(typeof embConfig.provider).toBe("string");
  });

  it("getEmbeddingConfig returns valid provider from allowed set", () => {
    const loader = ConfigLoader.getInstance();
    const embConfig = loader.getEmbeddingConfig();

    // Provider must be one of the allowed values
    const validProviders = ["ollama", "openai", "cloudru", "huggingface", "tei", "ovms", "auto"];
    expect(validProviders.includes(embConfig.provider)).toBe(true);
    expect(typeof embConfig.model).toBe("string");
    expect(embConfig.model.length).toBeGreaterThan(0);
  });

  it("config object is not null", () => {
    const config = ConfigLoader.getInstance().getConfig();
    expect(config).not.toBeNull();
  });
});
