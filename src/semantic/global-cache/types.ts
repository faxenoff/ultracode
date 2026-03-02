/**
 * Global Embedding Cache Types
 */

export interface GlobalCacheEntry {
  text: string;
  /**
   * Full embedding text that matches buildEmbeddingText() output format.
   * Used for pipeline cache hits when the entity name matches a known pattern.
   * If omitted, falls back to `text` for both embedding generation and lookup.
   *
   * Format mirrors buildEmbeddingText():
   *   "{name} {type}\ndescription: ...\nreturns: ..."
   *
   * Useful for lifecycle hooks, special methods, and testing patterns
   * that appear as real entities in user code with predictable signatures.
   */
  embeddingText?: string;
  category: "builtin" | "stdlib" | "framework" | "pattern";
  language: string;
  framework?: string;
}

export interface GlobalCacheMetadata {
  version: string;
  model: string;
  dimension: number;
  lastUpdated: string;
  entryCounts: Record<string, number>;
}
