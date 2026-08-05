/**
 * CBOR Metadata Serialization Utilities
 *
 * Encodes/decodes entity and relationship metadata using CBOR binary format.
 * Falls back to JSON for legacy data or when CBOR encoding fails.
 * Used by entity-ops, relationship-ops, vector-ops, and row-mappers.
 */

import * as cbor from "cbor-x";
import { LRUCache } from "lru-cache";
import { CACHE_CONFIG } from "./types.js";

/** LRU cache for decoded metadata objects */
const metadataCache = new LRUCache<string, Record<string, unknown>>(CACHE_CONFIG.metadataCache);

/**
 * CBOR compact key mapping (Zig-compat).
 * Reduces metadata BLOB size by ~30% for repeated keys.
 * Full key → compact key (encode), compact key → full key (decode).
 */
const COMPACT_KEYS: Record<string, string> = {
  params: "p",
  return_type: "r",
  returnType: "r",
  decorators: "dc",
  visibility: "vs",
  doc_comment: "doc",
  docComment: "doc",
  is_async: "a",
  isAsync: "a",
  is_generator: "g",
  isGenerator: "g",
  is_static: "st",
  isStatic: "st",
  extends: "ex",
  implements: "im",
  generic_params: "gp",
  genericParams: "gp",
};

const EXPAND_KEYS: Record<string, string> = {};
// Build reverse mapping (compact → full). Use snake_case for consistency with Zig.
for (const [full, compact] of Object.entries(COMPACT_KEYS)) {
  // Only map the snake_case form back (avoid duplicates from camelCase aliases)
  if (full.includes("_") || !full.match(/[A-Z]/)) {
    EXPAND_KEYS[compact] = full;
  }
}

/**
 * Compact metadata keys before CBOR encoding.
 * Keys holding `undefined` are dropped: cbor-x encodes them as real entries
 * (39 bytes vs 9 for a 4-key sample), and a missing key decodes to `undefined`
 * anyway. This keeps the BLOB small even though parsedEntityToEntity now always
 * emits the full metadata skeleton to keep the object shape stable.
 */
function compactKeys(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) continue;
    result[COMPACT_KEYS[key] ?? key] = value;
  }
  return result;
}

/** Expand compact keys after CBOR decoding */
function expandKeys(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    result[EXPAND_KEYS[key] ?? key] = value;
  }
  return result;
}

/**
 * Encode metadata object to CBOR binary with compact keys.
 * Returns null for empty/null metadata.
 * Falls back to JSON if CBOR encoding fails.
 */
export function encodeMetadata(metadata: Record<string, unknown> | null | undefined): Buffer | null {
  if (!metadata) return null;
  try {
    return Buffer.from(cbor.encode(compactKeys(metadata)));
  } catch {
    // Fallback to JSON if CBOR fails (e.g., unsupported types)
    return Buffer.from(JSON.stringify(metadata));
  }
}

/**
 * Decode metadata from CBOR binary or legacy JSON string.
 * Auto-detects format: Buffer/Uint8Array → CBOR, string → JSON.
 * Uses LRU cache keyed on first 48 bytes (base64) for deduplication.
 */
export function decodeMetadata(data: Buffer | Uint8Array | string | null): Record<string, unknown> | undefined {
  if (!data) return undefined;

  // Check cache first (optimization: only convert first 48 bytes to base64 → ~64 chars)
  let cacheKey: string;
  if (typeof data === "string") {
    cacheKey = data.length <= 64 ? data : data.slice(0, 64);
  } else {
    // Only encode first 48 bytes (produces ~64 base64 chars) instead of full buffer
    const slice = data.length <= 48 ? data : data.slice(0, 48);
    cacheKey = Buffer.from(slice).toString("base64");
  }
  const cached = metadataCache.get(cacheKey);
  if (cached) return cached;

  try {
    let raw: Record<string, unknown>;

    if (typeof data === "string") {
      // Legacy JSON string
      raw = JSON.parse(data);
    } else {
      // Try CBOR first, fallback to JSON
      try {
        raw = cbor.decode(data instanceof Uint8Array ? data : Buffer.from(data));
      } catch {
        raw = JSON.parse(Buffer.from(data).toString("utf8"));
      }
    }

    // Expand compact keys (handles both Zig compact and legacy full keys)
    const result = expandKeys(raw);

    metadataCache.set(cacheKey, result);
    return result;
  } catch {
    return undefined;
  }
}

/**
 * Clear the metadata decode cache.
 * Call on project context switch or after bulk operations.
 */
export function clearMetadataCache(): void {
  metadataCache.clear();
}

/**
 * Get metadata cache statistics for monitoring.
 */
export function getMetadataCacheStats(): { size: number; maxSize: number } {
  return {
    size: metadataCache.size,
    maxSize: CACHE_CONFIG.metadataCache.max,
  };
}
