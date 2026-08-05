/**
 * Basin Index — ported from ultracode.zig/src/graph/basin_index.zig
 *
 * Groups nodes by which sink they flow to. Nodes in different basins are
 * guaranteed unreachable from each other — O(1) negative reachability test.
 *
 * Algorithm:
 *   1. Find sinks (fan_out=0, fan_in>0)
 *   2. Multi-source reverse BFS: each sink starts a basin
 *   3. First basin to claim a node wins; multi-basin → NO_BASIN (conservative)
 *
 * Used as pre-filter before BFS in trace-engine and impact analyzer:
 *   if (!basin.mayReach(from, to)) return UNREACHABLE; // O(1), no BFS needed
 */

export const NO_BASIN = 0xffff;

export interface BasinBuildInput {
  /** Total number of nodes */
  nodeCount: number;
  /** For each node: { fanIn, fanOut } */
  getFanCounts: (nodeIdx: number) => { fanIn: number; fanOut: number };
  /** Reverse adjacency: predecessors of nodeIdx */
  getPredecessors: (nodeIdx: number) => number[];
}

export class BasinIndex {
  private basinIds: Uint16Array = new Uint16Array(0);
  private _basinCount = 0;
  private _nodeCount = 0;
  private _valid = false;

  get basinCount(): number {
    return this._basinCount;
  }
  get nodeCount(): number {
    return this._nodeCount;
  }
  get valid(): boolean {
    return this._valid;
  }

  invalidate(): void {
    this._valid = false;
  }

  /**
   * Build basin index from graph structure.
   */
  build(input: BasinBuildInput): void {
    const n = input.nodeCount;
    if (n === 0) {
      this._valid = true;
      return;
    }

    this._nodeCount = n;
    this.basinIds = new Uint16Array(n).fill(NO_BASIN);

    // Find sinks (fan_out=0, fan_in>0)
    const sinks: number[] = [];
    for (let i = 0; i < n; i++) {
      const { fanIn, fanOut } = input.getFanCounts(i);
      if (fanOut === 0 && fanIn > 0) sinks.push(i);
    }

    // Multi-source reverse BFS: each sink starts a basin
    const queue: number[] = [];
    let basin = 0;

    for (const sink of sinks) {
      if (basin >= NO_BASIN - 1) break;
      if (this.basinIds[sink] !== NO_BASIN) continue; // already claimed

      this.basinIds[sink] = basin;
      queue.length = 0;
      queue.push(sink);

      let head = 0;
      while (head < queue.length) {
        const node = queue[head++]!;
        for (const pred of input.getPredecessors(node)) {
          if (pred < n && this.basinIds[pred] === NO_BASIN) {
            this.basinIds[pred] = basin;
            queue.push(pred);
          }
          // If already claimed by different basin — keep first (conservative)
        }
      }

      basin++;
    }

    this._basinCount = basin;
    this._valid = true;
  }

  /**
   * O(1) reachability pre-filter.
   * Returns false → guaranteed unreachable (different basins).
   * Returns true → same basin or unknown (needs BFS to confirm).
   */
  mayReach(from: number, to: number): boolean {
    if (!this._valid) return true;
    if (from >= this._nodeCount || to >= this._nodeCount) return true;
    const fromBasin = this.basinIds[from];
    const toBasin = this.basinIds[to];
    if (fromBasin === NO_BASIN || toBasin === NO_BASIN) return true;
    return fromBasin === toBasin;
  }

  /**
   * Build from a string-keyed adjacency map (convenience for GraphAdapter integration).
   * Maps string IDs to numeric indices internally.
   */
  static buildFromAdjacency(adjacency: Map<string, Set<string>>): {
    index: BasinIndex;
    nodeIds: string[];
    nodeToIdx: Map<string, number>;
  } {
    const nodeIds = [...adjacency.keys()];
    const n = nodeIds.length;
    const nodeToIdx = new Map<string, number>();
    for (let i = 0; i < n; i++) nodeToIdx.set(nodeIds[i]!, i);

    // Build numeric adjacency + reverse.
    // Array.from keeps PACKED elements — new Array(n) would stay HOLEY forever,
    // and these lists are read on every traversal edge.
    const fwd: number[][] = Array.from({ length: n }, () => []);
    const rev: number[][] = Array.from({ length: n }, () => []);
    const fanIn = new Uint32Array(n);
    const fanOut = new Uint32Array(n);

    for (const [id, neighbors] of adjacency) {
      const i = nodeToIdx.get(id)!;
      for (const nb of neighbors) {
        const j = nodeToIdx.get(nb);
        if (j !== undefined) {
          fwd[i]!.push(j);
          rev[j]!.push(i);
          fanOut[i] = fanOut[i]! + 1;
          fanIn[j] = fanIn[j]! + 1;
        }
      }
    }

    const index = new BasinIndex();
    index.build({
      nodeCount: n,
      getFanCounts: (idx) => ({ fanIn: fanIn[idx]!, fanOut: fanOut[idx]! }),
      getPredecessors: (idx) => rev[idx]!,
    });

    return { index, nodeIds, nodeToIdx };
  }
}
