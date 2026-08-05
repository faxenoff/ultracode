/**
 * Betweenness Centrality (Brandes Algorithm) — ported from ultracode.zig/src/analysis/graph_metrics.zig
 *
 * Computes betweenness centrality for all nodes in a directed graph.
 * Betweenness measures how often a node lies on shortest paths between
 * other pairs of nodes — high betweenness = critical bridge/hub.
 *
 * Algorithm: Brandes (2001), O(VE) for unweighted graphs.
 * For each source node: BFS forward pass → stack accumulation → backward pass.
 *
 * Optimization: for large graphs (>500 nodes), samples sources to keep
 * runtime bounded. This matches the Zig implementation.
 */

export interface BrandesResult {
  /** Map of node ID → betweenness centrality score */
  scores: Map<string, number>;
  /** Number of nodes in the graph */
  totalNodes: number;
  /** Number of source nodes used (may be < totalNodes for sampled graphs) */
  sourcesUsed: number;
}

/**
 * Compute betweenness centrality using Brandes' algorithm.
 *
 * @param adjacency - Adjacency list: nodeId → Set of neighbor nodeIds
 * @param maxSources - Maximum number of source nodes to use (default 500, for performance)
 * @returns BrandesResult with scores for each node
 */
export function computeBetweenness(adjacency: Map<string, Set<string>>, maxSources = 500): BrandesResult {
  // Build node list and index mapping
  const allNodes: string[] = [...adjacency.keys()];
  const n = allNodes.length;
  if (n === 0) return { scores: new Map(), totalNodes: 0, sourcesUsed: 0 };

  const nodeToIdx = new Map<string, number>();
  for (let i = 0; i < n; i++) nodeToIdx.set(allNodes[i]!, i);

  // Build CSR-like adjacency for fast iteration.
  // Filled via push instead of new Array(n): new Array(n) yields HOLEY elements
  // that never turn PACKED again, and this array is read on every BFS edge.
  const neighbors: number[][] = [];
  for (let i = 0; i < n; i++) {
    const adj = adjacency.get(allNodes[i]!);
    if (!adj) {
      neighbors.push([]);
      continue;
    }
    const nbs: number[] = [];
    for (const nb of adj) {
      const j = nodeToIdx.get(nb);
      if (j !== undefined) nbs.push(j);
    }
    neighbors.push(nbs);
  }

  // Centrality accumulator
  const cb = new Float64Array(n);

  // Working arrays (reused per source)
  const sigma = new Float64Array(n);
  const dist = new Int32Array(n);
  const delta = new Float64Array(n);

  // Predecessor lists — flat linked list approach from Zig
  const SENTINEL = -1;
  const predHead = new Int32Array(n);
  const predValue: number[] = [];
  const predNext: number[] = [];

  // BFS queue and stack (reused)
  const queue: number[] = [];
  const stack: number[] = [];

  const sourcesToUse = Math.min(n, maxSources);

  for (let si = 0; si < sourcesToUse; si++) {
    // Reset working arrays
    sigma.fill(0);
    dist.fill(-1);
    delta.fill(0);
    predHead.fill(SENTINEL);
    predValue.length = 0;
    predNext.length = 0;
    queue.length = 0;
    stack.length = 0;

    sigma[si] = 1;
    dist[si] = 0;
    queue.push(si);

    // Forward BFS
    let qHead = 0;
    while (qHead < queue.length) {
      const v = queue[qHead++]!;
      stack.push(v);

      for (const w of neighbors[v]!) {
        if (dist[w]! < 0) {
          queue.push(w);
          dist[w] = dist[v]! + 1;
        }
        if (dist[w]! === dist[v]! + 1) {
          sigma[w] = sigma[w]! + sigma[v]!;
          // Prepend v to predecessor list of w
          const slot = predValue.length;
          predValue.push(v);
          predNext.push(predHead[w]!);
          predHead[w] = slot;
        }
      }
    }

    // Backward accumulation
    for (let i = stack.length - 1; i >= 0; i--) {
      const w = stack[i]!;
      let slot = predHead[w]!;
      while (slot !== SENTINEL) {
        const v = predValue[slot]!;
        if (sigma[w]! !== 0) {
          delta[v] = delta[v]! + (sigma[v]! / sigma[w]!) * (1 + delta[w]!);
        }
        slot = predNext[slot]!;
      }
      if (w !== si) cb[w] = cb[w]! + delta[w]!;
    }
  }

  // Build result map
  const scores = new Map<string, number>();
  for (let i = 0; i < n; i++) {
    if (cb[i]! > 0) scores.set(allNodes[i]!, cb[i]!);
  }

  return { scores, totalNodes: n, sourcesUsed: sourcesToUse };
}
