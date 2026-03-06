/**
 * diff3 - Three-way merge algorithm
 *
 * Merges two branches against a common base using LCS-based diffing.
 * Produces auto-merged content for non-conflicting changes
 * and git-style conflict markers for true conflicts.
 *
 * Algorithm:
 * 1. Compute diff hunks: base→branchA, base→branchB
 * 2. Project both hunk sets onto base line axis
 * 3. Walk base axis, classifying segments as unchanged/A-only/B-only/conflict
 * 4. Generate merged output with conflict markers where needed
 */

// =============================================================================
// PUBLIC TYPES
// =============================================================================

export interface Diff3Options {
  labelA?: string;
  labelB?: string;
  labelBase?: string;
  showBase?: boolean; // include base section in markers (default: true)
}

export interface Diff3Region {
  type: "unchanged" | "branchA" | "branchB" | "conflict";
  baseLines: string[];
  branchALines: string[];
  branchBLines: string[];
}

export interface Diff3Result {
  regions: Diff3Region[];
  hasConflicts: boolean;
  conflictCount: number;
  mergedLines: string[];
  mergedContent: string;
}

// =============================================================================
// INTERNAL TYPES
// =============================================================================

/** A contiguous change hunk from a two-way diff */
interface Hunk {
  baseStart: number; // inclusive
  baseEnd: number; // exclusive
  branchStart: number; // inclusive
  branchEnd: number; // exclusive
}

// =============================================================================
// PUBLIC API
// =============================================================================

export function diff3Merge(base: string, branchA: string, branchB: string, options?: Diff3Options): Diff3Result {
  const opts: Required<Diff3Options> = {
    labelA: options?.labelA ?? "branchA",
    labelB: options?.labelB ?? "branchB",
    labelBase: options?.labelBase ?? "base",
    showBase: options?.showBase ?? true,
  };

  const baseLines = splitLines(base);
  const aLines = splitLines(branchA);
  const bLines = splitLines(branchB);

  // Trim common prefix and suffix for LCS performance
  const { prefix, suffix, trimmedBase, trimmedA, trimmedB } = trimCommon(baseLines, aLines, bLines);

  // Compute change hunks: base→A and base→B
  const hunksA = computeHunks(trimmedBase, trimmedA);
  const hunksB = computeHunks(trimmedBase, trimmedB);

  // Merge hunks into three-way regions
  const rawRegions = mergeHunks(trimmedBase, trimmedA, trimmedB, hunksA, hunksB);

  // Wrap with common prefix/suffix
  const regions: Diff3Region[] = [];
  if (prefix.length > 0) {
    regions.push({ type: "unchanged", baseLines: prefix, branchALines: prefix, branchBLines: prefix });
  }
  regions.push(...rawRegions);
  if (suffix.length > 0) {
    regions.push({ type: "unchanged", baseLines: suffix, branchALines: suffix, branchBLines: suffix });
  }

  // Generate merged output
  let conflictCount = 0;
  const mergedLines: string[] = [];

  for (const region of regions) {
    switch (region.type) {
      case "unchanged":
        mergedLines.push(...region.baseLines);
        break;
      case "branchA":
        mergedLines.push(...region.branchALines);
        break;
      case "branchB":
        mergedLines.push(...region.branchBLines);
        break;
      case "conflict":
        conflictCount++;
        mergedLines.push(`<<<<<<< ${opts.labelA}`);
        mergedLines.push(...region.branchALines);
        if (opts.showBase) {
          mergedLines.push(`||||||| ${opts.labelBase}`);
          mergedLines.push(...region.baseLines);
        }
        mergedLines.push("=======");
        mergedLines.push(...region.branchBLines);
        mergedLines.push(`>>>>>>> ${opts.labelB}`);
        break;
    }
  }

  return {
    regions,
    hasConflicts: conflictCount > 0,
    conflictCount,
    mergedLines,
    mergedContent: mergedLines.join("\n"),
  };
}

// =============================================================================
// LINE SPLITTING
// =============================================================================

function splitLines(text: string): string[] {
  if (text === "") return [];
  return text.split("\n");
}

// =============================================================================
// COMMON PREFIX / SUFFIX TRIMMING
// =============================================================================

function trimCommon(
  base: string[],
  a: string[],
  b: string[],
): {
  prefix: string[];
  suffix: string[];
  trimmedBase: string[];
  trimmedA: string[];
  trimmedB: string[];
} {
  const minLen = Math.min(base.length, a.length, b.length);

  let prefixLen = 0;
  while (prefixLen < minLen && base[prefixLen] === a[prefixLen] && base[prefixLen] === b[prefixLen]) {
    prefixLen++;
  }

  const baseRemaining = base.length - prefixLen;
  const aRemaining = a.length - prefixLen;
  const bRemaining = b.length - prefixLen;
  const minRemaining = Math.min(baseRemaining, aRemaining, bRemaining);

  let suffixLen = 0;
  while (
    suffixLen < minRemaining &&
    base[base.length - 1 - suffixLen] === a[a.length - 1 - suffixLen] &&
    base[base.length - 1 - suffixLen] === b[b.length - 1 - suffixLen]
  ) {
    suffixLen++;
  }

  return {
    prefix: base.slice(0, prefixLen),
    suffix: suffixLen > 0 ? base.slice(base.length - suffixLen) : [],
    trimmedBase: base.slice(prefixLen, base.length - suffixLen),
    trimmedA: a.slice(prefixLen, a.length - suffixLen),
    trimmedB: b.slice(prefixLen, b.length - suffixLen),
  };
}

// =============================================================================
// LCS-BASED HUNK COMPUTATION
// =============================================================================

function computeLCS(a: string[], b: string[]): number[][] {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i]![j] = dp[i - 1]![j - 1]! + 1;
      } else {
        dp[i]![j] = Math.max(dp[i - 1]![j]!, dp[i]![j - 1]!);
      }
    }
  }

  return dp;
}

function computeHunks(base: string[], branch: string[]): Hunk[] {
  if (base.length === 0 && branch.length === 0) return [];
  if (base.length === 0) {
    return [{ baseStart: 0, baseEnd: 0, branchStart: 0, branchEnd: branch.length }];
  }
  if (branch.length === 0) {
    return [{ baseStart: 0, baseEnd: base.length, branchStart: 0, branchEnd: 0 }];
  }

  const dp = computeLCS(base, branch);

  // Backtrack LCS to find matching line pairs
  const matches: Array<[number, number]> = [];
  let i = base.length;
  let j = branch.length;

  while (i > 0 && j > 0) {
    if (base[i - 1] === branch[j - 1]) {
      matches.push([i - 1, j - 1]);
      i--;
      j--;
    } else if (dp[i - 1]![j]! >= dp[i]![j - 1]!) {
      i--;
    } else {
      j--;
    }
  }
  matches.reverse();

  // Extract hunks: gaps between matched lines
  const hunks: Hunk[] = [];
  let baseIdx = 0;
  let branchIdx = 0;

  for (const [bm, brm] of matches) {
    if (bm > baseIdx || brm > branchIdx) {
      hunks.push({ baseStart: baseIdx, baseEnd: bm, branchStart: branchIdx, branchEnd: brm });
    }
    baseIdx = bm + 1;
    branchIdx = brm + 1;
  }

  // Trailing hunk
  if (baseIdx < base.length || branchIdx < branch.length) {
    hunks.push({ baseStart: baseIdx, baseEnd: base.length, branchStart: branchIdx, branchEnd: branch.length });
  }

  return hunks;
}

// =============================================================================
// THREE-WAY HUNK MERGING
// =============================================================================

/**
 * Merge two sets of hunks against a common base.
 *
 * Strategy: walk through the base line axis. At each point, determine
 * which hunks from A and B are active. Classify the region accordingly.
 */
function mergeHunks(base: string[], a: string[], b: string[], hunksA: Hunk[], hunksB: Hunk[]): Diff3Region[] {
  const baseLen = base.length;

  // Handle empty base: both branches are pure insertions
  if (baseLen === 0) {
    const aContent = a;
    const bContent = b;
    if (aContent.length === 0 && bContent.length === 0) return [];
    return [classifyInsertion(aContent, bContent)];
  }

  // For each base line, find which hunk (if any) it belongs to
  const aHunkIdx = new Int32Array(baseLen).fill(-1);
  const bHunkIdx = new Int32Array(baseLen).fill(-1);

  for (let h = 0; h < hunksA.length; h++) {
    const hunk = hunksA[h]!;
    for (let line = hunk.baseStart; line < hunk.baseEnd; line++) {
      aHunkIdx[line] = h;
    }
  }
  for (let h = 0; h < hunksB.length; h++) {
    const hunk = hunksB[h]!;
    for (let line = hunk.baseStart; line < hunk.baseEnd; line++) {
      bHunkIdx[line] = h;
    }
  }

  // Also collect pure insertions (hunks where baseStart === baseEnd)
  // These insert content before a specific base line
  const insertionsA = new Map<number, Hunk>(); // position → hunk
  const insertionsB = new Map<number, Hunk>();
  for (const h of hunksA) {
    if (h.baseStart === h.baseEnd) insertionsA.set(h.baseStart, h);
  }
  for (const h of hunksB) {
    if (h.baseStart === h.baseEnd) insertionsB.set(h.baseStart, h);
  }

  const result: Diff3Region[] = [];

  let i = 0;
  while (i < baseLen) {
    // Handle insertions before this base line
    emitInsertion(i, insertionsA, insertionsB, a, b, result);

    const ah = aHunkIdx[i]!;
    const bh = bHunkIdx[i]!;

    if (ah === -1 && bh === -1) {
      // Unchanged in both — collect run
      let end = i + 1;
      while (end < baseLen && aHunkIdx[end] === -1 && bHunkIdx[end] === -1) {
        // Check for insertions breaking the run
        if (insertionsA.has(end) || insertionsB.has(end)) break;
        end++;
      }
      const slice = base.slice(i, end);
      result.push({ type: "unchanged", baseLines: slice, branchALines: slice, branchBLines: slice });
      i = end;
    } else if (ah !== -1 && bh === -1) {
      // Only A changed — emit entire hunk
      const hunkARef = hunksA[ah]!;
      const baseSlice = base.slice(hunkARef.baseStart, hunkARef.baseEnd);
      const aSlice = a.slice(hunkARef.branchStart, hunkARef.branchEnd);
      result.push({ type: "branchA", baseLines: baseSlice, branchALines: aSlice, branchBLines: baseSlice });
      i = hunkARef.baseEnd;
    } else if (ah === -1 && bh !== -1) {
      // Only B changed — emit entire hunk
      const hunkBRef = hunksB[bh]!;
      const baseSlice = base.slice(hunkBRef.baseStart, hunkBRef.baseEnd);
      const bSlice = b.slice(hunkBRef.branchStart, hunkBRef.branchEnd);
      result.push({ type: "branchB", baseLines: baseSlice, branchALines: baseSlice, branchBLines: bSlice });
      i = hunkBRef.baseEnd;
    } else {
      // Both changed — find the union of overlapping hunks
      const hunkA = hunksA[ah]!;
      const hunkB = hunksB[bh]!;

      // Merge overlapping region on the base axis
      const overlapStart = Math.min(hunkA.baseStart, hunkB.baseStart);
      const overlapEnd = Math.max(hunkA.baseEnd, hunkB.baseEnd);

      const baseSlice = base.slice(overlapStart, overlapEnd);
      const aSlice = a.slice(hunkA.branchStart, hunkA.branchEnd);
      const bSlice = b.slice(hunkB.branchStart, hunkB.branchEnd);

      if (linesEqual(aSlice, bSlice)) {
        // Both made the same change
        result.push({ type: "branchA", baseLines: baseSlice, branchALines: aSlice, branchBLines: bSlice });
      } else {
        result.push({ type: "conflict", baseLines: baseSlice, branchALines: aSlice, branchBLines: bSlice });
      }
      i = overlapEnd;
    }
  }

  // Trailing insertions after all base lines
  emitInsertion(baseLen, insertionsA, insertionsB, a, b, result);

  return result;
}

function emitInsertion(
  pos: number,
  insertionsA: Map<number, Hunk>,
  insertionsB: Map<number, Hunk>,
  a: string[],
  b: string[],
  result: Diff3Region[],
): void {
  const insA = insertionsA.get(pos);
  const insB = insertionsB.get(pos);
  if (!insA && !insB) return;

  const aSlice = insA ? a.slice(insA.branchStart, insA.branchEnd) : [];
  const bSlice = insB ? b.slice(insB.branchStart, insB.branchEnd) : [];

  result.push(classifyInsertion(aSlice, bSlice));
}

// =============================================================================
// HELPERS
// =============================================================================

function classifyInsertion(aLines: string[], bLines: string[]): Diff3Region {
  if (aLines.length === 0 && bLines.length === 0) {
    return { type: "unchanged", baseLines: [], branchALines: [], branchBLines: [] };
  }
  if (aLines.length === 0) {
    return { type: "branchB", baseLines: [], branchALines: [], branchBLines: bLines };
  }
  if (bLines.length === 0) {
    return { type: "branchA", baseLines: [], branchALines: aLines, branchBLines: [] };
  }
  if (linesEqual(aLines, bLines)) {
    return { type: "branchA", baseLines: [], branchALines: aLines, branchBLines: bLines };
  }
  return { type: "conflict", baseLines: [], branchALines: aLines, branchBLines: bLines };
}

function linesEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}
