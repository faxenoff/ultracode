/**
 * Worker Global Cache
 *
 * Lightweight in-memory cache for pre-built global embeddings.
 * Loaded from dist/semantic/global-cache-prebuilt/<model-slug>/hashes.bin + embeddings.bin.
 *
 * No JSON parsing — hashes.bin is a packed array of 16-byte ASCII hash strings,
 * same order as embeddings.bin Float32 rows.
 */

import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { hashText, initHasher } from "../../utils/fast-hash.js";
import { workerLog } from "./worker-logging.js";

export class WorkerGlobalCache {
  /** hash(16-char hex) → row index in embeddings.bin */
  private hashToIndex = new Map<string, number>();
  private embeddingsBuf: Buffer | null = null;
  private dim = 384;
  private loaded = false;

  /**
   * Load pre-built files from dist/semantic/global-cache-prebuilt/<model-slug>/.
   * Safe to call multiple times — loads only once.
   */
  async load(modelName: string, dimension: number): Promise<void> {
    if (this.loaded) return;
    this.loaded = true;
    this.dim = dimension;

    try {
      await initHasher();

      // Compiled workers land in dist/chunks/, prebuilt files are in dist/semantic/
      const selfDir = dirname(fileURLToPath(import.meta.url));
      const modelSlug = modelName.replace(/\//g, "_");
      // Workers land in dist/agents/workers/, prebuilt files are in dist/semantic/
      const prebuiltDir = join(selfDir, "..", "..", "semantic", "global-cache-prebuilt", modelSlug);
      const hashesPath = join(prebuiltDir, "hashes.bin");
      const embeddingsPath = join(prebuiltDir, "embeddings.bin");

      if (!existsSync(hashesPath) || !existsSync(embeddingsPath)) {
        workerLog("DEBUG", `WorkerGlobalCache: no pre-built files for ${modelName}`);
        return;
      }

      // hashes.bin: packed 16-byte ASCII hash strings
      const hashesBuf = readFileSync(hashesPath);
      const count = hashesBuf.length / 16;
      for (let i = 0; i < count; i++) {
        const hash = hashesBuf.toString("ascii", i * 16, i * 16 + 16);
        this.hashToIndex.set(hash, i);
      }

      this.embeddingsBuf = readFileSync(embeddingsPath);

      workerLog("INFO", `WorkerGlobalCache: loaded ${count} pre-built embeddings for ${modelName}`);
    } catch (e) {
      workerLog("WARN", `WorkerGlobalCache: load failed (non-fatal): ${(e as Error).message}`);
      this.hashToIndex.clear();
      this.embeddingsBuf = null;
    }
  }

  get size(): number {
    return this.hashToIndex.size;
  }

  /**
   * Get pre-built embedding for a raw text.
   * Normalizes the text, computes hash, looks up in the index.
   * Returns a Float32Array view into the pre-loaded buffer, or null if not found.
   */
  get(text: string): Float32Array | null {
    if (!this.embeddingsBuf) return null;
    const normalized = text.trim().toLowerCase();
    const hash = hashText(normalized).slice(0, 16);
    const idx = this.hashToIndex.get(hash);
    if (idx === undefined) return null;
    const start = idx * this.dim * 4;
    return new Float32Array(this.embeddingsBuf.buffer, this.embeddingsBuf.byteOffset + start, this.dim);
  }
}

/** Singleton per worker process */
let instance: WorkerGlobalCache | null = null;

export function getWorkerGlobalCache(): WorkerGlobalCache {
  if (!instance) instance = new WorkerGlobalCache();
  return instance;
}
