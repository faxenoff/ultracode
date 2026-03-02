/**
 * Fast Hashing Utilities with WASM SIMD Acceleration
 *
 * Uses xxHash (WASM) - NO FALLBACK to ensure deterministic hashes.
 * MUST call initHasher() before using hashText().
 *
 * Performance:
 * - xxHash (WASM SIMD): ~15µs for typical text
 * - 2-4x faster than pure JS hash
 */

import type { XXHashAPI } from "xxhash-wasm";
import xxhash from "xxhash-wasm";

// =============================================================================
// MODULE STATE
// =============================================================================

let hasher: XXHashAPI | null = null;
let initPromise: Promise<void> | null = null;
let initialized = false;

// =============================================================================
// INITIALIZATION
// =============================================================================

/**
 * Initialize xxHash WASM module.
 * MUST be called at application startup before any hashText() calls.
 * Will throw if initialization fails.
 */
export async function initHasher(): Promise<void> {
  if (initialized) return;

  if (initPromise) {
    await initPromise;
    return;
  }

  initPromise = (async () => {
    try {
      hasher = await xxhash();
      initialized = true;
      console.log("[FastHash] xxHash WASM initialized");
    } catch (error) {
      console.error("[FastHash] CRITICAL: xxHash initialization failed:", error);
      throw new Error("xxHash initialization failed - cannot continue without deterministic hashing");
    }
  })();

  await initPromise;
}

// Start initialization immediately (will be awaited in index.ts)
initPromise = initHasher().catch((e) => {
  console.error("[FastHash] Background init failed:", e);
});

// =============================================================================
// PUBLIC API
// =============================================================================

/**
 * Fast hash function using xxHash WASM
 * IMPORTANT: initHasher() must be called and awaited before using this function
 *
 * @param text - Text to hash
 * @returns Hash string (hex format from xxHash)
 * @throws Error if xxHash not initialized
 */
export function hashText(text: string): string {
  if (!hasher) {
    throw new Error("hashText called before xxHash initialized. Call await initHasher() first.");
  }
  return hasher.h32ToString(text);
}

/**
 * Async hash function - waits for initialization if needed
 *
 * @param text - Text to hash
 * @returns Promise<hash string>
 */
export async function hashTextAsync(text: string): Promise<string> {
  if (!initialized) {
    await initHasher();
  }
  return hasher!.h32ToString(text);
}

/**
 * Hash number (for numeric keys)
 *
 * @param num - Number to hash
 * @returns Hash string
 * @throws Error if xxHash not initialized
 */
export function hashNumber(num: number): string {
  if (!hasher) {
    throw new Error("hashNumber called before xxHash initialized. Call await initHasher() first.");
  }
  return hasher.h32ToString(num.toString());
}

/**
 * Preload xxHash WASM module - alias for initHasher()
 * @deprecated Use initHasher() instead
 */
export async function preloadHasher(): Promise<void> {
  return initHasher();
}

/**
 * Check if hasher is ready (useful for conditional sync/async paths)
 */
export function isHasherReady(): boolean {
  return initialized && hasher !== null;
}

/**
 * Get hasher status for diagnostics
 */
export function getHasherStatus(): {
  initialized: boolean;
  fallback: boolean;
  enabled: boolean;
} {
  return {
    initialized,
    fallback: false,
    enabled: true,
  };
}

// =============================================================================
// EXPORTS
// =============================================================================

export default hashText;
