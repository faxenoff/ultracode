/**
 * Graphology Path Builder
 *
 * Optimized graph traversal using graphology library.
 * Replaces the slow custom BFS/DFS implementation with in-memory graph operations.
 *
 * Performance improvements:
 * - Single bulk load instead of 25000+ SQL queries
 * - O(V+E) algorithms instead of O(2^n) path enumeration
 * - Optimized bidirectional BFS for shortest paths
 * - Linear trace with branch annotations
 *
 * Architecture References:
 * - Tracing Types: src/tracing/types.ts
 * - Graph Storage: src/storage/graph-storage-libsql.ts
 */

import Graph from "graphology";
import { bidirectional } from "graphology-shortest-path";
import { log } from "../logging/index.js";
import type { Entity, GraphStorage, Relationship } from "../types/storage.js";
import type { CallProbability, ConfidenceLevel, RawPath, TraceActionType, TracePath, TraceStep } from "./types.js";

// =============================================================================
// TYPES
// =============================================================================

/**
 * Node attributes in graphology graph
 */
export interface GraphNodeAttributes {
  name: string;
  type: string;
  file: string;
  line: number;
  metadata?: Record<string, unknown>;
  controlFlow?: {
    branches?: Array<{ condition: string; target?: string }>;
    loops?: Array<{ type: string; condition?: string }>;
    awaits?: Array<{ target?: string }>;
    exceptions?: Array<{ type: string }>;
  };
}

/**
 * Edge attributes in graphology graph
 */
export interface GraphEdgeAttributes {
  type: string;
  weight: number;
  metadata?: Record<string, unknown>;
}

/**
 * Linear trace step with branch annotations
 */
export interface LinearTraceStep {
  order: number;
  entity: string;
  entityId: string;
  file: string;
  line: number;
  action: TraceActionType;
  /** Conditions that may change flow */
  branches?: Array<{
    condition: string;
    target: string;
    probability: "likely" | "unlikely" | "unknown";
  }>;
  /** External influences (state, effects) */
  sideEffects?: Array<{
    type: "state_read" | "state_write" | "effect_trigger";
    description: string;
  }>;
}

/**
 * Linear trace result
 */
export interface LinearTrace {
  steps: LinearTraceStep[];
  found: boolean;
  summary: string;
  /** Total nodes visited */
  nodesVisited: number;
  /** Time taken in ms */
  timeMs: number;
}

/**
 * Graph statistics
 */
export interface GraphStats {
  nodes: number;
  edges: number;
  loadTimeMs: number;
  memoryMB: number;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const DEFAULT_MAX_DEPTH = 20;
const DEFAULT_MAX_PATHS = 10;
const CONDITION_WEIGHT = 0.3;
const ASYNC_WEIGHT = 0.2;
const API_CONTRACT_WEIGHT = 0.5; // API contract boundaries are heavier — trace prefers direct paths

// Edge types used for call tracing (forward direction)
const CALL_EDGE_TYPES = new Set(["calls", "imports", "references"]);
// Edge types used for backwards tracing (reverse direction)
const CALLED_BY_EDGE_TYPES = new Set(["called_by", "imported_by", "referenced_by"]);

// =============================================================================
// GRAPHOLOGY PATH BUILDER
// =============================================================================

export class GraphologyPathBuilder {
  private storage: GraphStorage;
  private graph: Graph<GraphNodeAttributes, GraphEdgeAttributes>;
  private loaded = false;
  private loadStats: GraphStats | null = null;

  constructor(storage: GraphStorage) {
    this.storage = storage;
    // MultiGraph: allows multiple edges between nodes (calls, imports, ngrx...)
    this.graph = new Graph<GraphNodeAttributes, GraphEdgeAttributes>({
      multi: true,
      type: "directed",
      allowSelfLoops: false,
    });
  }

  getGraph(): Graph<GraphNodeAttributes, GraphEdgeAttributes> {
    return this.graph;
  }

  // ===========================================================================
  // GRAPH LOADING
  // ===========================================================================

  /**
   * Load entire graph into memory with 2 SQL queries.
   * This is the key optimization - replaces 25000+ individual queries.
   */
  async loadGraph(): Promise<GraphStats> {
    if (this.loaded && this.loadStats) {
      return this.loadStats;
    }

    const startTime = performance.now();
    this.graph.clear();

    // Debug: log current project context
    const projectContext =
      typeof this.storage === "object" &&
      this.storage !== null &&
      "getProjectContext" in this.storage &&
      typeof (this.storage as { getProjectContext?: () => unknown }).getProjectContext === "function"
        ? (this.storage as { getProjectContext: () => unknown }).getProjectContext()
        : undefined;
    log.d("GRAPHPATH", "loading_graph", { ctx: JSON.stringify(projectContext) });

    // Two queries instead of thousands
    const [entities, relationships] = await Promise.all([this.storage.getAllEntities(), this.getAllRelationships()]);

    // Build name-to-id lookup for resolving external references
    // Key: entity name (lowercase), Value: array of entity IDs (may have multiple with same name)
    const nameToIds = new Map<string, string[]>();
    // Secondary index: short method name (after last dot) → real entity IDs only (no import stubs).
    // Used to resolve "external:this.someMethod" → actual method implementation.
    const methodToRealIds = new Map<string, string[]>();
    for (const entity of entities) {
      const key = entity.name.toLowerCase();
      if (!nameToIds.has(key)) {
        nameToIds.set(key, []);
      }
      nameToIds.get(key)!.push(entity.id);

      // Exclude import stubs from the real-entity index
      const isStub = entity.filePath?.includes("external://") || entity.type === "import";
      if (!isStub) {
        const lastDot = key.lastIndexOf(".");
        const shortName = lastDot >= 0 ? key.slice(lastDot + 1) : key;
        if (!methodToRealIds.has(shortName)) {
          methodToRealIds.set(shortName, []);
        }
        methodToRealIds.get(shortName)!.push(entity.id);
      }
    }

    // Add nodes
    for (const entity of entities) {
      if (!this.graph.hasNode(entity.id)) {
        this.graph.addNode(entity.id, this.entityToNodeAttrs(entity));
      }
    }

    // Add edges
    let edgeCount = 0;
    const edgeTypeCounts = new Map<string, number>();
    let skippedMissingNodes = 0;
    let resolvedExternalRefs = 0;

    for (const rel of relationships) {
      const fromId = rel.fromId;
      let toId = rel.toId;

      // Resolve external references (e.g., "external:functionName" -> actual entity ID)
      if (toId.startsWith("external:")) {
        const targetName = toId.slice(9).toLowerCase(); // Remove "external:" prefix
        let candidates = nameToIds.get(targetName);

        // For "this.method()" calls: targetName looks like "this.somemethod" or "this.obj.method".
        // Import stubs with name "this.somemethod" have no outgoing edges — resolve to real entities.
        if (targetName.startsWith("this.")) {
          const afterThis = targetName.slice(5); // "this.somemethod" → "somemethod"
          const lastDot = afterThis.lastIndexOf(".");
          const methodName = lastDot >= 0 ? afterThis.slice(lastDot + 1) : afterThis;
          const realCandidates = methodToRealIds.get(methodName);
          if (realCandidates && realCandidates.length > 0) {
            candidates = realCandidates;
          }
        }

        if (candidates && candidates.length > 0) {
          // Use targetClass from metadata to filter candidates (for cross-file calls)
          const meta = rel.metadata as Record<string, unknown> | undefined;
          const targetClass = meta?.["targetClass"] as string | undefined;
          if (targetClass && candidates.length > 1) {
            // Filter candidates by class name in entity ID
            // Entity IDs look like: "FilePath:type:ClassName.methodName"
            const classPattern = `.${targetClass}.`.toLowerCase();
            const classPattern2 = `:${targetClass}.`.toLowerCase();
            const filtered = candidates.filter(
              (id) => id.toLowerCase().includes(classPattern) || id.toLowerCase().includes(classPattern2),
            );
            if (filtered.length > 0) {
              toId = filtered[0]!;
              resolvedExternalRefs++;
            } else {
              // Fallback to first candidate if class filter fails
              toId = candidates[0]!;
              resolvedExternalRefs++;
            }
          } else {
            toId = candidates[0]!;
            resolvedExternalRefs++;
          }
        }
      }

      // Only add if both nodes exist
      if (this.graph.hasNode(fromId) && this.graph.hasNode(toId)) {
        try {
          this.graph.addEdge(fromId, toId, {
            type: rel.type,
            weight: rel.weight ?? 1,
            metadata: rel.metadata,
          });
          edgeCount++;
          edgeTypeCounts.set(rel.type, (edgeTypeCounts.get(rel.type) ?? 0) + 1);
        } catch {
          // Skip duplicate edges in non-multi mode
        }
      } else {
        skippedMissingNodes++;
      }
    }

    if (resolvedExternalRefs > 0) {
      log.d("GRAPHPATH", "resolved_ext_refs", { count: resolvedExternalRefs });
    }

    const loadTimeMs = performance.now() - startTime;
    const memoryMB = this.estimateMemoryUsage();

    this.loadStats = {
      nodes: this.graph.order,
      edges: edgeCount,
      loadTimeMs,
      memoryMB,
    };

    this.loaded = true;

    // Log edge type distribution
    const edgeTypeSummary = Array.from(edgeTypeCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([type, count]) => `${type}:${count}`)
      .join(", ");
    log.i("GRAPHPATH", "graph_loaded", {
      nodes: this.loadStats.nodes,
      edges: this.loadStats.edges,
      timeMs: +loadTimeMs.toFixed(0),
    });
    log.d("GRAPHPATH", "edge_types", { types: edgeTypeSummary });
    if (skippedMissingNodes > 0) {
      log.d("GRAPHPATH", "skipped_edges", { count: skippedMissingNodes });
    }

    return this.loadStats;
  }

  /**
   * Get all relationships from storage.
   * Uses optimized single-query method.
   */
  private async getAllRelationships(): Promise<Relationship[]> {
    const relationships = await this.storage.getAllRelationships();
    log.d("GRAPHPATH", "rels_total", { count: relationships.length });
    return relationships;
  }

  /**
   * Convert Entity to node attributes
   */
  private entityToNodeAttrs(entity: Entity): GraphNodeAttributes {
    const meta = entity.metadata as Record<string, unknown>;

    return {
      name: entity.name,
      type: entity.type,
      file: entity.filePath,
      line: entity.location.start.line,
      metadata: meta,
      controlFlow: meta?.["controlFlow"] as GraphNodeAttributes["controlFlow"],
    };
  }

  /**
   * Estimate memory usage of the graph
   */
  private estimateMemoryUsage(): number {
    // Rough estimate: ~500 bytes per node, ~100 bytes per edge
    const bytes = this.graph.order * 500 + this.graph.size * 100;
    return bytes / (1024 * 1024);
  }

  /**
   * Check if graph is loaded
   */
  isLoaded(): boolean {
    return this.loaded;
  }

  /**
   * Get graph statistics
   */
  getStats(): GraphStats | null {
    return this.loadStats;
  }

  /**
   * Clear the graph (call after index changes)
   */
  clear(): void {
    this.graph.clear();
    this.loaded = false;
    this.loadStats = null;
  }

  // ===========================================================================
  // EDGE FILTERING HELPERS
  // ===========================================================================

  /**
   * Get outgoing neighbors via call-related edges only (calls, imports, references)
   * For forward tracing: A calls B means edge A -> B with type "calls"
   */
  private getCallNeighbors(nodeId: string): string[] {
    const neighbors: string[] = [];
    for (const edge of this.graph.outEdges(nodeId)) {
      const attrs = this.graph.getEdgeAttributes(edge);
      if (CALL_EDGE_TYPES.has(attrs.type)) {
        neighbors.push(this.graph.target(edge));
      }
    }
    return neighbors;
  }

  /**
   * Get callers of a node for backward tracing.
   * Two edge patterns to check:
   * 1. inEdges with type "calls" - if B calls A, edge is B -> A, so source is caller
   * 2. outEdges with type "called_by" - if A called_by B, edge is A -> B, so target is caller
   */
  private getCallerNeighbors(nodeId: string): string[] {
    const neighbors: string[] = [];

    // Pattern 1: incoming "calls" edges - source is the caller
    for (const edge of this.graph.inEdges(nodeId)) {
      const attrs = this.graph.getEdgeAttributes(edge);
      if (CALL_EDGE_TYPES.has(attrs.type)) {
        neighbors.push(this.graph.source(edge));
      }
    }

    // Pattern 2: outgoing "called_by" edges - target is the caller
    for (const edge of this.graph.outEdges(nodeId)) {
      const attrs = this.graph.getEdgeAttributes(edge);
      if (CALLED_BY_EDGE_TYPES.has(attrs.type)) {
        neighbors.push(this.graph.target(edge));
      }
    }

    return neighbors;
  }

  // ===========================================================================
  // SHORTEST PATH (Bidirectional BFS)
  // ===========================================================================

  /**
   * Find shortest path between two nodes using bidirectional BFS.
   * O(V+E) instead of O(2^n).
   */
  findShortestPath(fromId: string, toId: string): string[] | null {
    if (!this.loaded) {
      throw new Error("Graph not loaded. Call loadGraph() first.");
    }

    if (!this.graph.hasNode(fromId) || !this.graph.hasNode(toId)) {
      return null;
    }

    try {
      return bidirectional(this.graph, fromId, toId);
    } catch {
      return null;
    }
  }

  /**
   * Find shortest path by entity names (searches for matching nodes first)
   */
  async findShortestPathByName(fromName: string, toName: string): Promise<string[] | null> {
    await this.ensureLoaded();

    const fromId = this.findNodeByName(fromName);
    const toId = this.findNodeByName(toName);

    if (!fromId || !toId) {
      return null;
    }

    return this.findShortestPath(fromId, toId);
  }

  /**
   * Find node ID by name (partial match)
   */
  private findNodeByName(name: string): string | null {
    const lowerName = name.toLowerCase();

    // Exact match first
    for (const nodeId of this.graph.nodes()) {
      const attrs = this.graph.getNodeAttributes(nodeId);
      if (attrs.name === name) {
        return nodeId;
      }
    }

    // Partial match
    for (const nodeId of this.graph.nodes()) {
      const attrs = this.graph.getNodeAttributes(nodeId);
      if (attrs.name.toLowerCase().includes(lowerName)) {
        return nodeId;
      }
    }

    return null;
  }

  // ===========================================================================
  // LINEAR TRACE (Single path with annotations)
  // ===========================================================================

  /**
   * Trace linear flow from source to target.
   * Returns a single path with branch annotations instead of all possible paths.
   * Uses BFS with edge filtering to follow only call-related edges.
   */
  async traceLinearFlow(fromId: string, toId: string, maxDepth = DEFAULT_MAX_DEPTH): Promise<LinearTrace> {
    await this.ensureLoaded();
    const startTime = performance.now();

    const steps: LinearTraceStep[] = [];
    let found = false;
    let nodesVisited = 0;

    if (!this.graph.hasNode(fromId)) {
      return {
        steps: [],
        found: false,
        summary: `Source node not found: ${fromId}`,
        nodesVisited: 0,
        timeMs: performance.now() - startTime,
      };
    }

    if (!this.graph.hasNode(toId)) {
      return {
        steps: [],
        found: false,
        summary: `Target node not found: ${toId}`,
        nodesVisited: 0,
        timeMs: performance.now() - startTime,
      };
    }

    // Debug: log source node info
    const sourceAttrs = this.graph.getNodeAttributes(fromId);
    const sourceNeighbors = this.getCallNeighbors(fromId);
    log.d("GRAPHPATH", "trace_src", { name: sourceAttrs.name, id: fromId, neighbors: sourceNeighbors.length });
    if (sourceNeighbors.length > 0 && sourceNeighbors.length <= 10) {
      for (const n of sourceNeighbors) {
        const nAttrs = this.graph.getNodeAttributes(n);
        log.t("GRAPHPATH", "trace_neighbor", { name: nAttrs.name, id: n });
      }
    }

    // Custom BFS with edge type filtering - only follow call-related edges
    const visited = new Set<string>();
    const parent = new Map<string, string>();
    const depth = new Map<string, number>();
    const queue: string[] = [fromId];

    visited.add(fromId);
    depth.set(fromId, 0);

    while (queue.length > 0 && !found) {
      const node = queue.shift()!;
      const currentDepth = depth.get(node) ?? 0;
      nodesVisited++;

      if (currentDepth > maxDepth) continue;

      if (node === toId) {
        found = true;
        break;
      }

      // Get only call-related neighbors (calls, imports, references)
      const neighbors = this.getCallNeighbors(node);

      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          parent.set(neighbor, node);
          depth.set(neighbor, currentDepth + 1);
          queue.push(neighbor);
        }
      }
    }

    // Reconstruct path if found
    if (found) {
      const pathIds: string[] = [];
      let current: string | undefined = toId;

      while (current && current !== fromId) {
        pathIds.unshift(current);
        current = parent.get(current);
      }
      pathIds.unshift(fromId);

      // Convert to steps with annotations
      for (let i = 0; i < pathIds.length; i++) {
        const nodeId = pathIds[i]!;
        const attrs = this.graph.getNodeAttributes(nodeId);

        steps.push({
          order: i + 1,
          entity: attrs.name,
          entityId: nodeId,
          file: attrs.file,
          line: attrs.line,
          action: this.determineAction(attrs, i, pathIds.length),
          branches: this.extractBranches(attrs),
          sideEffects: this.extractSideEffects(attrs),
        });
      }
    }

    const timeMs = performance.now() - startTime;

    // Build debug summary
    const debugInfo = `[DEBUG] Graph: ${this.graph.order} nodes, ${this.graph.size} edges. Source neighbors: ${sourceNeighbors.length}. BFS visited: ${nodesVisited}. Found: ${found}`;

    return {
      steps,
      found,
      summary: found
        ? this.generateLinearSummary(steps, found)
        : `${this.generateLinearSummary(steps, found)} ${debugInfo}`,
      nodesVisited,
      timeMs,
    };
  }

  /**
   * Trace linear flow by entity names
   */
  async traceLinearFlowByName(fromName: string, toName: string, maxDepth = DEFAULT_MAX_DEPTH): Promise<LinearTrace> {
    await this.ensureLoaded();

    const fromId = this.findNodeByName(fromName);
    const toId = this.findNodeByName(toName);

    if (!fromId) {
      return {
        steps: [],
        found: false,
        summary: `Source not found: ${fromName}`,
        nodesVisited: 0,
        timeMs: 0,
      };
    }

    if (!toId) {
      return {
        steps: [],
        found: false,
        summary: `Target not found: ${toName}`,
        nodesVisited: 0,
        timeMs: 0,
      };
    }

    return this.traceLinearFlow(fromId, toId, maxDepth);
  }

  // ===========================================================================
  // BACKWARDS TRACE (Find entry points)
  // ===========================================================================

  /**
   * Trace backwards from target to find all entry points.
   * Uses reverse BFS on call-related incoming edges only (called_by, imported_by, referenced_by).
   */
  async traceBackwards(
    targetId: string,
    maxDepth = DEFAULT_MAX_DEPTH,
  ): Promise<{
    entryPoints: Array<{ id: string; name: string; file: string; depth: number }>;
    callers: Array<{ id: string; name: string; depth: number; probability: CallProbability }>;
    timeMs: number;
  }> {
    await this.ensureLoaded();
    const startTime = performance.now();

    const entryPoints: Array<{ id: string; name: string; file: string; depth: number }> = [];
    const callers: Array<{ id: string; name: string; depth: number; probability: CallProbability }> = [];

    if (!this.graph.hasNode(targetId)) {
      return { entryPoints: [], callers: [], timeMs: 0 };
    }

    const visited = new Set<string>();
    const queue: Array<{ id: string; depth: number }> = [{ id: targetId, depth: 0 }];

    while (queue.length > 0) {
      const current = queue.shift()!;

      if (visited.has(current.id) || current.depth > maxDepth) continue;
      visited.add(current.id);

      const attrs = this.graph.getNodeAttributes(current.id);

      // Get only call-related incoming neighbors (called_by, imported_by, referenced_by)
      const callerNeighbors = this.getCallerNeighbors(current.id);

      // Record as caller (except target itself)
      if (current.id !== targetId) {
        callers.push({
          id: current.id,
          name: attrs.name,
          depth: current.depth,
          probability: this.getCallProbability(attrs),
        });
      }

      // If no call-related incoming edges, it's an entry point
      if (callerNeighbors.length === 0 && current.id !== targetId) {
        entryPoints.push({
          id: current.id,
          name: attrs.name,
          file: attrs.file,
          depth: current.depth,
        });
      }

      // Add call-related incoming neighbors to queue
      for (const source of callerNeighbors) {
        if (!visited.has(source)) {
          queue.push({ id: source, depth: current.depth + 1 });
        }
      }
    }

    return {
      entryPoints,
      callers,
      timeMs: performance.now() - startTime,
    };
  }

  // ===========================================================================
  // FIND MULTIPLE PATHS (Limited enumeration)
  // ===========================================================================

  /**
   * Find multiple paths between nodes (limited to maxPaths).
   * Uses DFS with path tracking but limits results.
   * Only follows call-related edges (calls, imports, references).
   */
  async findPaths(
    fromId: string,
    toId: string,
    maxPaths = DEFAULT_MAX_PATHS,
    maxDepth = DEFAULT_MAX_DEPTH,
  ): Promise<RawPath[]> {
    await this.ensureLoaded();

    if (!this.graph.hasNode(fromId) || !this.graph.hasNode(toId)) {
      return [];
    }

    const paths: RawPath[] = [];
    const currentPath: string[] = [];
    const currentRels: string[] = [];
    const visited = new Set<string>();

    const dfs = (nodeId: string, depth: number, weight: number, conditionCount: number): void => {
      if (paths.length >= maxPaths || depth > maxDepth) return;

      visited.add(nodeId);
      currentPath.push(nodeId);

      if (nodeId === toId) {
        paths.push({
          entityIds: [...currentPath],
          relationships: [...currentRels],
          weight,
          conditionCount,
        });
      } else {
        // Only follow call-related edges (calls, imports, references)
        const neighbors = this.getCallNeighbors(nodeId);
        for (const neighbor of neighbors) {
          if (!visited.has(neighbor)) {
            const edgeWeight = this.getEdgeWeight(nodeId, neighbor);
            const attrs = this.graph.getNodeAttributes(neighbor);
            const isConditional = attrs.controlFlow?.branches && attrs.controlFlow.branches.length > 0;

            currentRels.push(`${nodeId}:${neighbor}`);
            dfs(neighbor, depth + 1, weight + edgeWeight, conditionCount + (isConditional ? 1 : 0));
            currentRels.pop();
          }
        }
      }

      currentPath.pop();
      visited.delete(nodeId);
    };

    dfs(fromId, 0, 0, 0);

    return paths.sort((a, b) => a.weight - b.weight);
  }

  /**
   * Convert raw paths to enriched TracePaths
   */
  enrichPaths(rawPaths: RawPath[]): TracePath[] {
    return rawPaths.map((raw, index) => {
      const steps: TraceStep[] = raw.entityIds.map((nodeId, stepIndex) => {
        const attrs = this.graph.getNodeAttributes(nodeId);
        return {
          order: stepIndex + 1,
          entity: attrs.name,
          entityId: nodeId,
          file: attrs.file,
          line: attrs.line,
          action: this.determineAction(attrs, stepIndex, raw.entityIds.length),
          condition: attrs.controlFlow?.branches?.[0]?.condition,
          awaits: attrs.controlFlow?.awaits && attrs.controlFlow.awaits.length > 0,
        };
      });

      return {
        id: `path-${index + 1}`,
        confidence: this.calculateConfidence(raw),
        steps,
        summary: this.generatePathSummary(steps),
        warnings: this.generateWarnings(raw),
      };
    });
  }

  // ===========================================================================
  // HELPER METHODS
  // ===========================================================================

  private async ensureLoaded(): Promise<void> {
    if (!this.loaded) {
      await this.loadGraph();
    }
  }

  private determineAction(attrs: GraphNodeAttributes, position: number, totalLength: number): TraceActionType {
    if (position === totalLength - 1) return "return";
    if (attrs.controlFlow?.branches && attrs.controlFlow.branches.length > 0) return "condition";
    if (attrs.controlFlow?.awaits && attrs.controlFlow.awaits.length > 0) return "await";
    if (attrs.controlFlow?.loops && attrs.controlFlow.loops.length > 0) return "loop";
    if (attrs.controlFlow?.exceptions && attrs.controlFlow.exceptions.length > 0) return "throw";
    return "call";
  }

  private extractBranches(attrs: GraphNodeAttributes): LinearTraceStep["branches"] {
    if (!attrs.controlFlow?.branches || attrs.controlFlow.branches.length === 0) {
      return undefined;
    }

    return attrs.controlFlow.branches.map((b) => ({
      condition: b.condition,
      target: b.target || "continue",
      probability: "unknown" as const,
    }));
  }

  private extractSideEffects(attrs: GraphNodeAttributes): LinearTraceStep["sideEffects"] {
    const effects: LinearTraceStep["sideEffects"] = [];
    const meta = attrs.metadata as Record<string, unknown>;

    // Check for state writes
    if (meta?.["stateChanges"]) {
      effects.push({
        type: "state_write",
        description: `Modifies: ${JSON.stringify(meta["stateChanges"])}`,
      });
    }

    // Check for NgRx dispatches
    if (meta?.["ngrxType"] === "effect" || meta?.["dispatches"]) {
      effects.push({
        type: "effect_trigger",
        description: `NgRx: ${meta["ngrxType"] || "dispatch"}`,
      });
    }

    return effects.length > 0 ? effects : undefined;
  }

  private getEdgeWeight(fromId: string, toId: string): number {
    const edges = this.graph.edges(fromId, toId);
    if (edges.length === 0) return 1;

    const attrs = this.graph.getEdgeAttributes(edges[0]!);
    let weight = attrs.weight || 1;

    // Add penalty for conditional/async
    if (attrs.metadata?.["conditional"]) weight += CONDITION_WEIGHT;
    if (attrs.metadata?.["isAsync"]) weight += ASYNC_WEIGHT;

    // API contract boundaries are heavier — trace prefers direct code paths
    const edgeType = attrs.type;
    if (edgeType === "produces_api" || edgeType === "consumes_api" || edgeType === "generated_from") {
      weight += API_CONTRACT_WEIGHT;
    }

    return weight;
  }

  private getCallProbability(attrs: GraphNodeAttributes): CallProbability {
    if (!attrs.controlFlow?.branches || attrs.controlFlow.branches.length === 0) {
      return "always";
    }
    const hasGuard = attrs.controlFlow.branches.some((b) => b.target === "return" || b.target === "throw");
    return hasGuard ? "rare" : "conditional";
  }

  private calculateConfidence(raw: RawPath): number {
    let confidence = 1.0;
    confidence -= raw.entityIds.length * 0.02;
    confidence -= raw.conditionCount * 0.1;
    confidence -= raw.weight * 0.05;
    return Math.max(0.1, Math.min(1.0, confidence));
  }

  private generateLinearSummary(steps: LinearTraceStep[], found: boolean): string {
    if (!found) return "Path not found";
    if (steps.length === 0) return "Empty path";
    if (steps.length === 1) return `Direct: ${steps[0]!.entity}`;

    const first = steps[0]!;
    const last = steps[steps.length - 1]!;
    const branches = steps.filter((s) => s.branches && s.branches.length > 0).length;

    let summary = `${first.entity} -> ${last.entity} (${steps.length} steps)`;
    if (branches > 0) summary += `, ${branches} branch${branches > 1 ? "es" : ""}`;

    return summary;
  }

  private generatePathSummary(steps: TraceStep[]): string {
    if (steps.length === 0) return "Empty path";
    if (steps.length === 1) return `Direct call to ${steps[0]!.entity}`;

    const first = steps[0]!;
    const last = steps[steps.length - 1]!;
    return `${first.entity} -> ${last.entity} (${steps.length} steps)`;
  }

  private generateWarnings(raw: RawPath): string[] {
    const warnings: string[] = [];
    if (raw.entityIds.length > 10) warnings.push("Long call chain");
    if (raw.conditionCount > 5) warnings.push("Many conditional branches");
    return warnings;
  }

  /**
   * Get confidence level from numeric score
   */
  getConfidenceLevel(score: number): ConfidenceLevel {
    if (score >= 0.7) return "high";
    if (score >= 0.4) return "medium";
    return "low";
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

export default GraphologyPathBuilder;
