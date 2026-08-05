/**
 * Bloom Reach Index — ported from ultracode.zig/src/graph/bloom_reach.zig
 *
 * Pre-computes Bloom filters for top-N hotspot nodes at multiple hop levels.
 * Allows O(1) reachability checks: "can hotspot X reach node Y within K hops?"
 *
 * Architecture:
 *   - 4 hop levels: 1, 2, 4, 8
 *   - Bloom filter per (hotspot, level): m=1024 bits, k=7 hashes → FPR ~0.8%
 *   - Memory: 100 hotspots × 4 levels × 128 bytes = ~50KB
 *
 * Used as pre-filter in trace-engine before BFS:
 *   if (bloom.canReach(hotspot, target, maxHops) === "no") skip; // O(1)
 */

// =============================================================================
// Bloom Filter
// =============================================================================

export class BloomFilter {
  private bits: Uint32Array;
  private numHashes: number;
  private bitCount: number;

  constructor(bitCount = 1024, numHashes = 7) {
    this.bitCount = bitCount;
    this.numHashes = numHashes;
    this.bits = new Uint32Array(Math.ceil(bitCount / 32));
  }

  add(item: number): void {
    const h1 = BloomFilter.hashA(item);
    const h2 = BloomFilter.hashB(item);
    for (let i = 0; i < this.numHashes; i++) {
      const pos = Number((h1 + BigInt(i) * h2) % BigInt(this.bitCount));
      this.bits[pos >>> 5]! |= 1 << (pos & 31);
    }
  }

  mayContain(item: number): boolean {
    const h1 = BloomFilter.hashA(item);
    const h2 = BloomFilter.hashB(item);
    for (let i = 0; i < this.numHashes; i++) {
      const pos = Number((h1 + BigInt(i) * h2) % BigInt(this.bitCount));
      if ((this.bits[pos >>> 5]! & (1 << (pos & 31))) === 0) return false;
    }
    return true;
  }

  /** FNV-1a style hash */
  private static hashA(item: number): bigint {
    let h = 0xcbf29ce484222325n;
    for (let i = 0; i < 4; i++) {
      h ^= BigInt((item >>> (i * 8)) & 0xff);
      h = BigInt.asUintN(64, h * 0x100000001b3n);
    }
    return h;
  }

  /** Multiply-shift hash */
  private static hashB(item: number): bigint {
    const x = BigInt.asUintN(64, BigInt(item) * 0x9e3779b97f4a7c15n);
    return x ^ (x >> 33n);
  }
}

// =============================================================================
// Bloom Reach Index
// =============================================================================

export type ReachResult = "no" | "maybe" | "not_a_hotspot";

const LEVELS = 4;
const HOP_COUNTS = [1, 2, 4, 8] as const;
const BLOOM_BITS = 1024;
const BLOOM_HASHES = 7;

export interface BloomReachBuildInput {
  nodeCount: number;
  /** Score function for ranking hotspots (higher = more important) */
  getScore: (nodeIdx: number) => number;
  /** Forward adjacency: successors of nodeIdx */
  getSuccessors: (nodeIdx: number) => number[];
  /** Max hotspots to track */
  topN: number;
}

export class BloomReachIndex {
  private hotspotIndices: number[] = [];
  private filters: BloomFilter[][] = []; // [hotspotIdx][level]
  private hotspotLookup = new Map<number, number>();
  private _valid = false;

  get valid(): boolean {
    return this._valid;
  }

  invalidate(): void {
    this._valid = false;
  }

  /**
   * Build bloom reach index for top-N hotspot nodes.
   */
  build(input: BloomReachBuildInput): void {
    const n = input.nodeCount;
    if (n === 0 || input.topN === 0) {
      this._valid = true;
      return;
    }

    // Score and sort nodes
    const scored: Array<{ idx: number; score: number }> = [];
    for (let i = 0; i < n; i++) {
      const score = input.getScore(i);
      if (score > 0) scored.push({ idx: i, score });
    }
    scored.sort((a, b) => b.score - a.score);

    const actualN = Math.min(input.topN, scored.length);
    this.hotspotIndices = [];
    this.filters = [];
    this.hotspotLookup.clear();

    for (let i = 0; i < actualN; i++) {
      const nodeIdx = scored[i]!.idx;
      this.hotspotIndices.push(nodeIdx);
      this.hotspotLookup.set(nodeIdx, i);

      // Create bloom filters for each hop level
      const levelFilters: BloomFilter[] = [];
      for (let l = 0; l < LEVELS; l++) {
        levelFilters.push(new BloomFilter(BLOOM_BITS, BLOOM_HASHES));
      }
      this.filters.push(levelFilters);

      // BFS from this hotspot, populate filters
      this.populateBloomBfs(nodeIdx, levelFilters, n, input.getSuccessors);
    }

    this._valid = true;
  }

  /**
   * Check if hotspot can reach target within maxHops.
   * Returns "no" → guaranteed unreachable, "maybe" → might be, "not_a_hotspot" → node not tracked.
   */
  canReach(hotspot: number, target: number, maxHops: number): ReachResult {
    if (!this._valid) return "maybe";
    const hotspotIdx = this.hotspotLookup.get(hotspot);
    if (hotspotIdx === undefined) return "not_a_hotspot";

    // Find best level ≤ maxHops
    let bestLevel = -1;
    for (let l = 0; l < LEVELS; l++) {
      if (HOP_COUNTS[l]! <= maxHops) bestLevel = l;
    }
    if (bestLevel < 0) return "maybe";

    return this.filters[hotspotIdx]![bestLevel]!.mayContain(target) ? "maybe" : "no";
  }

  private populateBloomBfs(
    source: number,
    filters: BloomFilter[],
    nodeCount: number,
    getSuccessors: (nodeIdx: number) => number[],
  ): void {
    const visited = new Uint8Array(nodeCount); // 0=not visited, 1=visited
    const queue: Array<{ node: number; depth: number }> = [];
    const maxHops = HOP_COUNTS[LEVELS - 1]!; // 8

    visited[source] = 1;
    queue.push({ node: source, depth: 0 });

    let head = 0;
    while (head < queue.length) {
      const { node, depth } = queue[head++]!;
      if (depth >= maxHops) continue;

      for (const neighbor of getSuccessors(node)) {
        if (neighbor >= nodeCount || visited[neighbor]) continue;
        visited[neighbor] = 1;

        const newDepth = depth + 1;
        // Add to all applicable levels
        for (let level = 0; level < LEVELS; level++) {
          if (newDepth <= HOP_COUNTS[level]!) {
            filters[level]!.add(neighbor);
          }
        }

        if (newDepth < maxHops) {
          queue.push({ node: neighbor, depth: newDepth });
        }
      }
    }
  }

  /**
   * Build from string-keyed adjacency map (convenience).
   */
  static buildFromAdjacency(
    adjacency: Map<string, Set<string>>,
    getNodeScore: (id: string) => number,
    topN = 100,
  ): { index: BloomReachIndex; nodeIds: string[]; nodeToIdx: Map<string, number> } {
    const nodeIds = [...adjacency.keys()];
    const n = nodeIds.length;
    const nodeToIdx = new Map<string, number>();
    for (let i = 0; i < n; i++) nodeToIdx.set(nodeIds[i]!, i);

    // Build numeric adjacency (Array.from keeps PACKED elements; new Array(n)
    // would stay HOLEY for the lifetime of the array)
    const fwd: number[][] = Array.from({ length: n }, () => []);

    for (const [id, neighbors] of adjacency) {
      const i = nodeToIdx.get(id)!;
      for (const nb of neighbors) {
        const j = nodeToIdx.get(nb);
        if (j !== undefined) fwd[i]!.push(j);
      }
    }

    const index = new BloomReachIndex();
    index.build({
      nodeCount: n,
      getScore: (idx) => getNodeScore(nodeIds[idx]!),
      getSuccessors: (idx) => fwd[idx]!,
      topN,
    });

    return { index, nodeIds, nodeToIdx };
  }
}
