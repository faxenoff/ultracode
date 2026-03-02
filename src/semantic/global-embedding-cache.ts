/**
 * Global Embedding Cache
 *
 * Pre-computed embeddings for language built-ins, stdlib, and framework patterns.
 * Loaded directly from pre-built files shipped with the package (dist/semantic/global-cache-prebuilt/).
 * Pure in-memory — no AppData persistence, no generation at startup.
 */

import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { log, logMemory } from "../logging/index.js";
import { hashText } from "../utils/fast-hash.js";
import { type GlobalCacheEntry, getAllGlobalEntries } from "./global-cache/index.js";

// Re-export types and data for backwards compatibility
export type { GlobalCacheEntry, GlobalCacheMetadata } from "./global-cache/index.js";
export {
  ANGULAR_PATTERNS,
  EXPRESS_PATTERNS,
  GO_BUILTINS,
  getAllGlobalEntries,
  JAVA_BUILTINS,
  JAVASCRIPT_BUILTINS,
  JAVASCRIPT_ENTITY_PATTERNS,
  KOTLIN_BUILTINS,
  NESTJS_PATTERNS,
  NODEJS_BUILTINS,
  PYTHON_BUILTINS,
  REACT_PATTERNS,
  RUST_BUILTINS,
  TESTING_PATTERNS,
  TYPESCRIPT_BUILTINS,
  VUE_PATTERNS,
} from "./global-cache/index.js";

// =============================================================================
// GLOBAL CACHE CLASS
// =============================================================================

export class GlobalEmbeddingCache {
  private static instance: GlobalEmbeddingCache | null = null;
  private cache: Map<string, Float32Array> = new Map();
  private textToHash: Map<string, string> = new Map();
  private initialized = false;

  /** Maximum cache size to prevent memory leaks (~75MB for 384-dim embeddings) */
  private static readonly MAX_CACHE_SIZE = 50000;

  private constructor() {}

  static getInstance(): GlobalEmbeddingCache {
    if (!GlobalEmbeddingCache.instance) {
      GlobalEmbeddingCache.instance = new GlobalEmbeddingCache();
    }
    return GlobalEmbeddingCache.instance;
  }

  /**
   * Initialize the global cache by loading pre-built embeddings from dist/.
   * If no pre-built files exist (e.g. dev build without running build:global-cache),
   * starts with an empty cache — no runtime generation.
   */
  async initialize(model: string, dimension: number): Promise<void> {
    if (this.initialized) return;
    this.initialized = true;

    try {
      // The compiled file lands in dist/chunks/, but prebuilt files are in dist/semantic/
      const selfDir = dirname(fileURLToPath(import.meta.url));
      const modelSlug = model.replace(/\//g, "_");
      const prebuiltDir = join(selfDir, "..", "semantic", "global-cache-prebuilt", modelSlug);
      const metaPath = join(prebuiltDir, "metadata.json");

      if (!existsSync(metaPath)) {
        log.d("GLOBALCACHE", "No pre-built embeddings found, starting empty", { model });
        return;
      }

      const meta = JSON.parse(readFileSync(metaPath, "utf-8")) as {
        model: string;
        dimension: number;
      };

      if (meta.model !== model || meta.dimension !== dimension) {
        log.d("GLOBALCACHE", "Pre-built model/dim mismatch, starting empty", {
          prebuilt: `${meta.model}/${meta.dimension}`,
          current: `${model}/${dimension}`,
        });
        return;
      }

      const embeddingsPath = join(prebuiltDir, "embeddings.bin");
      const textsPath = join(prebuiltDir, "texts.json");

      if (!existsSync(embeddingsPath) || !existsSync(textsPath)) {
        log.d("GLOBALCACHE", "Pre-built files incomplete, starting empty");
        return;
      }

      // Load text -> hash mapping
      const texts = JSON.parse(readFileSync(textsPath, "utf-8")) as Record<string, string>;
      for (const [hash, text] of Object.entries(texts)) {
        this.textToHash.set(text, hash);
      }

      // Load binary embeddings
      const buffer = readFileSync(embeddingsPath);
      const hashes = Object.keys(texts);
      const numEmbeddings = Math.min(hashes.length, buffer.length / (dimension * 4));

      for (let i = 0; i < numEmbeddings; i++) {
        const start = i * dimension * 4;
        const floatArray = new Float32Array(buffer.buffer, buffer.byteOffset + start, dimension);
        this.cache.set(hashes[i]!, new Float32Array(floatArray));
      }

      log.i("GLOBALCACHE", "Loaded pre-built embeddings", { count: this.cache.size, model });
      logMemory("GLOBALCACHE", { cacheSize: this.cache.size, textToHashSize: this.textToHash.size });
    } catch (e) {
      log.w("GLOBALCACHE", "Failed to load pre-built embeddings (non-fatal)", {
        error: (e as Error).message,
      });
    }
  }

  /**
   * Check if a text has a pre-computed embedding
   */
  has(text: string): boolean {
    const normalized = text.trim().toLowerCase();
    return this.textToHash.has(normalized);
  }

  /**
   * Get pre-computed embedding for text
   */
  get(text: string): Float32Array | null {
    const normalized = text.trim().toLowerCase();
    const hash = this.textToHash.get(normalized);
    if (!hash) return null;
    return this.cache.get(hash) ?? null;
  }

  /**
   * Add embedding to cache (used as runtime LRU for project-specific lookups)
   */
  set(text: string, embedding: Float32Array): void {
    const normalized = text.trim().toLowerCase();
    const hash = hashText(normalized).slice(0, 16);
    this.textToHash.set(normalized, hash);
    this.cache.set(hash, embedding);
    this.evictOldest();
  }

  /**
   * Add embedding for a GlobalCacheEntry, registering both the short `text`
   * key and the full `embeddingText` key (if present).
   *
   * The full embeddingText key enables pipeline cache hits in
   * deduplicateAndCheckCaches() because that function checks the full
   * buildEmbeddingText() output, not the short name.
   */
  setEntry(entry: GlobalCacheEntry, embedding: Float32Array): void {
    this.set(entry.text, embedding);
    if (entry.embeddingText && entry.embeddingText !== entry.text) {
      const normalized = entry.embeddingText.trim().toLowerCase();
      const hash = hashText(normalized).slice(0, 16);
      this.textToHash.set(normalized, hash);
      this.cache.set(hash, new Float32Array(embedding));
      this.evictOldest();
    }
  }

  /**
   * Get all global entries not yet in cache (for fallback runtime generation).
   */
  getEntriesNeedingEmbeddings(): GlobalCacheEntry[] {
    const all = getAllGlobalEntries();
    return all.filter((entry) => !this.has(entry.embeddingText ?? entry.text));
  }

  /**
   * Get cache statistics
   */
  getStats(): { total: number; byCategory: Record<string, number>; byLanguage: Record<string, number> } {
    const all = getAllGlobalEntries();
    const byCategory: Record<string, number> = {};
    const byLanguage: Record<string, number> = {};

    for (const entry of all) {
      byCategory[entry.category] = (byCategory[entry.category] ?? 0) + 1;
      byLanguage[entry.language] = (byLanguage[entry.language] ?? 0) + 1;
    }

    return { total: this.cache.size, byCategory, byLanguage };
  }

  /**
   * Clear the cache
   */
  clear(): void {
    this.cache.clear();
    this.textToHash.clear();
  }

  private evictOldest(): void {
    if (this.cache.size <= GlobalEmbeddingCache.MAX_CACHE_SIZE) return;

    const keysToDelete = this.cache.size - GlobalEmbeddingCache.MAX_CACHE_SIZE;
    const iterator = this.cache.keys();
    const deletedHashes = new Set<string>();

    for (let i = 0; i < keysToDelete; i++) {
      const result = iterator.next();
      if (result.done) break;
      const key = result.value;
      this.cache.delete(key);
      deletedHashes.add(key);
    }

    if (deletedHashes.size > 0) {
      for (const [text, hash] of this.textToHash) {
        if (deletedHashes.has(hash)) this.textToHash.delete(text);
      }
      log.d("GLOBALCACHE", "evicted_oldest", { evicted: deletedHashes.size, remaining: this.cache.size });
    }
  }
}
