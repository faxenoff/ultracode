/**
 * Trigram Extractor — ported from ultracode.zig/src/search/trigram_extract.zig
 *
 * Extracts all unique trigrams from file content with bloom masks.
 * O(n) linear scan over the content bytes.
 *
 * For each trigram occurrence, accumulates:
 * - next_mask: bloom filter of characters that follow this trigram (64-bit)
 * - loc_mask: bloom filter of occurrence positions mod 8 (8-bit)
 *
 * These masks allow the query engine to filter false positives
 * without reading the actual file content.
 */

import { buildCodeBitmap, isCodeByte } from "./code-classifier.js";
import type { FileTrigramData, PackedTrigram } from "./trigram-types.js";
import { packTrigram } from "./trigram-types.js";

/**
 * Extract all unique trigrams from content with bloom masks.
 * Returns sorted array of PackedTrigram entries.
 *
 * @param content - Raw file content as Uint8Array or Buffer
 * @returns FileTrigramData with sorted, deduplicated trigrams
 */
export function extractTrigrams(content: Uint8Array): FileTrigramData {
  if (content.length < 3) return { entries: [] };

  // HashMap for dedup + mask accumulation
  const map = new Map<number, { nextMask: bigint; locMask: number }>();

  const last = content.length - 2;
  for (let i = 0; i < last; i++) {
    const tri = packTrigram(content[i]!, content[i + 1]!, content[i + 2]!);

    // Compute bloom masks
    const hasNext = i + 3 < content.length;
    const nextChar = hasNext ? content[i + 3]! % 64 : 0;
    const locBit = i % 8;

    const existing = map.get(tri);
    if (existing) {
      if (hasNext) existing.nextMask |= 1n << BigInt(nextChar);
      existing.locMask |= 1 << locBit;
    } else {
      map.set(tri, {
        nextMask: hasNext ? 1n << BigInt(nextChar) : 0n,
        locMask: 1 << locBit,
      });
    }
  }

  if (map.size === 0) return { entries: [] };

  // Convert to sorted array
  // push into an empty array keeps PACKED elements — new Array(map.size) would
  // leave the array HOLEY, and it is then sorted and scanned by callers
  const entries: PackedTrigram[] = [];
  for (const [trigram, { nextMask, locMask }] of map) {
    entries.push({ trigram, nextMask, locMask });
  }

  entries.sort((a, b) => a.trigram - b.trigram);

  return { entries };
}

/**
 * Extract trigrams from a string (convenience wrapper).
 */
export function extractTrigramsFromString(content: string): FileTrigramData {
  return extractTrigrams(Buffer.from(content, "utf-8"));
}

/**
 * Extract trigrams only from "live code" bytes (not strings/comments).
 * Uses CodeClassifier bitmap to skip trigrams that span non-code regions.
 * Produces a higher-quality index: "function" inside a string won't pollute results.
 *
 * @param content - Raw file content as Uint8Array
 * @param hashComments - true for Python/Bash (# starts line comment)
 * @returns FileTrigramData with only code-region trigrams
 */
export function extractTrigramsFiltered(content: Uint8Array, hashComments: boolean): FileTrigramData {
  if (content.length < 3) return { entries: [] };

  // Build code bitmap once for the entire file
  const bitmap = buildCodeBitmap(content, hashComments);

  const map = new Map<number, { nextMask: bigint; locMask: number }>();

  const last = content.length - 2;
  for (let i = 0; i < last; i++) {
    // All 3 bytes of the trigram must be in live code
    if (!isCodeByte(bitmap, i) || !isCodeByte(bitmap, i + 1) || !isCodeByte(bitmap, i + 2)) {
      continue;
    }

    const tri = packTrigram(content[i]!, content[i + 1]!, content[i + 2]!);

    const hasNext = i + 3 < content.length;
    const nextChar = hasNext ? content[i + 3]! % 64 : 0;
    const locBit = i % 8;

    const existing = map.get(tri);
    if (existing) {
      if (hasNext) existing.nextMask |= 1n << BigInt(nextChar);
      existing.locMask |= 1 << locBit;
    } else {
      map.set(tri, {
        nextMask: hasNext ? 1n << BigInt(nextChar) : 0n,
        locMask: 1 << locBit,
      });
    }
  }

  if (map.size === 0) return { entries: [] };

  // push into an empty array keeps PACKED elements — new Array(map.size) would
  // leave the array HOLEY, and it is then sorted and scanned by callers
  const entries: PackedTrigram[] = [];
  for (const [trigram, { nextMask, locMask }] of map) {
    entries.push({ trigram, nextMask, locMask });
  }

  entries.sort((a, b) => a.trigram - b.trigram);

  return { entries };
}

/**
 * Decompose a search pattern into required trigrams.
 * Returns sorted array of trigram u32 values.
 */
export function decomposePattern(pattern: string): number[] {
  if (pattern.length < 3) return [];

  const bytes = Buffer.from(pattern, "utf-8");
  if (bytes.length < 3) return [];

  const trigrams = new Set<number>();
  for (let i = 0; i <= bytes.length - 3; i++) {
    trigrams.add(packTrigram(bytes[i]!, bytes[i + 1]!, bytes[i + 2]!));
  }

  return [...trigrams].sort((a, b) => a - b);
}
