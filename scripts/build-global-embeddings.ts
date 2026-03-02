/**
 * Build pre-computed global embeddings for shipping with the npm package.
 *
 * Reads the same semantic-config.json used by the main application and
 * generates embeddings for all GlobalCacheEntry items, writing them to
 * dist/semantic/global-cache-prebuilt/<model-slug>/ so that
 * GlobalEmbeddingCache can seed the user cache instantly on first use.
 *
 * Usage:
 *   bun run build:global-cache
 *   # or with explicit model override:
 *   bun scripts/build-global-embeddings.ts --model intfloat/multilingual-e5-small
 *
 * Output:
 *   dist/semantic/global-cache-prebuilt/<model-slug>/
 *     embeddings.bin   — Float32 LE binary embeddings
 *     texts.json       — { [hash]: normalizedText } mapping
 *     metadata.json    — { version, model, dimension, lastUpdated, entryCounts }
 */

import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildEmbeddingGeneratorOptions, getModelNameFromSemanticConfig, mapSemanticConfigToProvider } from "../src/agents/semantic/provider-config.js";
import { EmbeddingGenerator } from "../src/semantic/embedding-generator.js";
import { getAllGlobalEntries } from "../src/semantic/global-cache/index.js";
import { loadSemanticConfig } from "../src/utils/config-paths.js";
import { hashText } from "../src/utils/fast-hash.js";

const BATCH_SIZE = 64;

function modelToSlug(model: string): string {
  return model.replace(/\//g, "_");
}

async function isServerReachable(url: string): Promise<boolean> {
  try {
    const resp = await fetch(`${url}/health`, { signal: AbortSignal.timeout(5000) });
    return resp.ok || resp.status < 500;
  } catch {
    try {
      const resp = await fetch(`${url}/info`, { signal: AbortSignal.timeout(5000) });
      return resp.ok || resp.status < 500;
    } catch {
      return false;
    }
  }
}

async function main(): Promise<void> {
  // Load the same semantic config used by the main application
  const semanticConfig = loadSemanticConfig();

  // Allow --model override for testing different models
  const modelArg = process.argv.indexOf("--model");
  const model =
    modelArg !== -1 && process.argv[modelArg + 1]
      ? process.argv[modelArg + 1]!
      : getModelNameFromSemanticConfig(semanticConfig);

  const modelSlug = modelToSlug(model);
  const scriptDir = dirname(fileURLToPath(import.meta.url));
  const outDir = join(scriptDir, "..", "dist", "semantic", "global-cache-prebuilt", modelSlug);

  // Skip if already built (unless --force flag is passed)
  // Check all required files — hashes.bin was added later, so old builds lack it
  const forceRebuild = process.argv.includes("--force");
  const allFilesExist = ["metadata.json", "embeddings.bin", "texts.json", "hashes.bin"].every((f) =>
    existsSync(join(outDir, f)),
  );
  if (!forceRebuild && allFilesExist) {
    console.log(`[build-global-embeddings] Pre-built embeddings already exist for ${model}`);
    console.log(`[build-global-embeddings]   ${outDir}`);
    console.log(`[build-global-embeddings] Skip. Use --force to rebuild.`);
    process.exit(0);
  }

  console.log(`[build-global-embeddings] Model: ${model}`);
  console.log(`[build-global-embeddings] Provider config: ${semanticConfig?.platform ?? "auto"}`);

  // Try to start the TEI Docker container if it exists but is not running
  try {
    const { execSync } = await import("node:child_process");
    execSync("docker inspect tei-server", { stdio: "ignore" });
    execSync("docker start tei-server", { stdio: "ignore" });
    console.log("[build-global-embeddings] TEI container started, waiting for ready...");
    await new Promise((r) => setTimeout(r, 5000));
  } catch {
    // No container or already running — continue
  }

  // Build generator options from config (same as SemanticAgent does)
  const providerKind = mapSemanticConfigToProvider(semanticConfig);
  console.log(`[build-global-embeddings] Provider kind: ${providerKind}`);
  const genOptions = buildEmbeddingGeneratorOptions(
    providerKind,
    model,
    BATCH_SIZE,
    semanticConfig,
    null, // no YAML config
  );
  // Don't auto-start Docker/containers in the build script — server must be running
  if (genOptions.tei) {
    genOptions.tei.checkServer = false;
  }

  // Pre-flight server check — give a clear error if the server is not running
  const serverUrl =
    genOptions.tei?.baseUrl ||
    genOptions.vllm?.baseUrl ||
    (genOptions.ollama as { baseUrl?: string } | undefined)?.baseUrl ||
    null;
  if (serverUrl) {
    const reachable = await isServerReachable(serverUrl);
    if (!reachable) {
      console.error(`\n[build-global-embeddings] ERROR: Embedding server not reachable at ${serverUrl}`);
      console.error(`[build-global-embeddings] Please start the server first, then re-run:`);
      console.error(`[build-global-embeddings]   docker start tei-server`);
      console.error(`[build-global-embeddings]   (or your embedding provider's start command)`);
      console.error(`[build-global-embeddings]   Then: bun run build:global-cache`);
      process.exit(1);
    }
    console.log(`[build-global-embeddings] Server reachable at ${serverUrl}`);
  }

  const gen = new EmbeddingGenerator(genOptions);
  await gen.initialize();

  const dim = gen.getProvider()?.getDimension() ?? 384;
  console.log(`[build-global-embeddings] Dimension: ${dim}`);

  // Load all entries, deduplicate by lookup text
  const entries = getAllGlobalEntries();
  const seen = new Set<string>();
  const uniqueEntries = entries.filter((e) => {
    const key = (e.embeddingText ?? e.text).trim().toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  console.log(`[build-global-embeddings] Entries: ${uniqueEntries.length} unique (${entries.length} total)`);

  // Generate embeddings in batches
  const hashToEmbedding = new Map<string, Float32Array>();
  const hashToText = new Map<string, string>();

  let generated = 0;
  for (let i = 0; i < uniqueEntries.length; i += BATCH_SIZE) {
    const batch = uniqueEntries.slice(i, i + BATCH_SIZE);
    const texts = batch.map((e) => e.embeddingText ?? e.text);
    const normalizedTexts = texts.map((t) => t.trim().toLowerCase());

    const embeddings = await gen.generateBatch(texts);

    for (let j = 0; j < batch.length; j++) {
      const normalized = normalizedTexts[j]!;
      const hash = hashText(normalized).slice(0, 16);
      hashToEmbedding.set(hash, embeddings[j]!);
      hashToText.set(hash, normalized);
    }
    generated += batch.length;
    process.stdout.write(`\r[build-global-embeddings] Generated ${generated}/${uniqueEntries.length}`);
  }
  console.log();

  // Output directory already computed above (outDir)
  mkdirSync(outDir, { recursive: true });

  // texts.json — { hash: normalizedText }
  const textsRecord: Record<string, string> = {};
  for (const [hash, text] of hashToText) {
    textsRecord[hash] = text;
  }
  writeFileSync(join(outDir, "texts.json"), JSON.stringify(textsRecord));

  // embeddings.bin — packed Float32 LE (same order as hashes)
  const hashes = Object.keys(textsRecord);
  const buffer = Buffer.alloc(hashes.length * dim * 4);
  let offset = 0;
  for (const hash of hashes) {
    const emb = hashToEmbedding.get(hash)!;
    for (let k = 0; k < dim; k++) {
      buffer.writeFloatLE(emb[k]!, offset);
      offset += 4;
    }
  }
  writeFileSync(join(outDir, "embeddings.bin"), buffer);

  // hashes.bin — packed 16-byte ASCII hashes (same order as embeddings.bin)
  // Workers use this for fast binary lookup without JSON parsing
  const hashesBin = Buffer.alloc(hashes.length * 16);
  for (let i = 0; i < hashes.length; i++) {
    hashesBin.write(hashes[i]!, i * 16, 16, "ascii");
  }
  writeFileSync(join(outDir, "hashes.bin"), hashesBin);

  // metadata.json
  const entryCounts: Record<string, number> = {};
  for (const e of uniqueEntries) {
    entryCounts[e.category] = (entryCounts[e.category] ?? 0) + 1;
  }
  writeFileSync(
    join(outDir, "metadata.json"),
    JSON.stringify(
      {
        version: "1.0",
        model,
        dimension: dim,
        lastUpdated: new Date().toISOString(),
        entryCounts,
        totalEntries: hashes.length,
      },
      null,
      2,
    ),
  );

  console.log(`[build-global-embeddings] Saved ${hashes.length} embeddings → ${outDir}`);
  console.log(`[build-global-embeddings] embeddings.bin size: ${(buffer.length / 1024).toFixed(1)} KB`);

  await gen.cleanup();
  process.exit(0);
}

main().catch((err) => {
  console.error("[build-global-embeddings] Failed:", err);
  process.exit(1);
});
