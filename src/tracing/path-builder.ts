/**
 * Path Builder for Semantic Tracing
 *
 * Optimized graph traversal algorithms for code flow analysis.
 * Uses BFS/DFS with loop unrolling for hot paths.
 *
 * Architecture References:
 * - Tracing Types: src/tracing/types.ts
 * - Graph Storage: src/storage/graph-storage.ts
 * - SIMD Ops: src/utils/simd-vector-ops.ts
 */

import type { Entity, GraphStorage, Relationship } from "../types/storage.js";
import { type EntityType, RelationType } from "../types/storage.js";
// Extracted modules
import {
  findIncomingNgRxRelationships,
  findReducerToSelectorConnections,
  isInvertedNgRxRelation,
  NGRX_RELATIONSHIP_TYPES,
  resolveNgRxTarget,
} from "./ngrx-resolution.js";
import { enrichPaths as enrichPathsUtil, getConfidenceLevel as getConfidenceLevelUtil } from "./path-enrichment.js";
import type {
  AdjacencyGraph,
  CallProbability,
  ConfidenceLevel,
  GraphNode,
  PathFindingOptions,
  RawPath,
  TracePath,
} from "./types.js";

// =============================================================================
// 1. CONSTANTS
// =============================================================================

const DEFAULT_MAX_DEPTH = 15;
const DEFAULT_MAX_PATHS = 10;
const CONDITION_WEIGHT = 0.3; // Penalty for conditional paths
const CALL_WEIGHT = 0.1; // Base weight for calls
const ASYNC_WEIGHT = 0.2; // Penalty for async boundaries

/** Mutable traversal state carried through DFS recursion. */
interface DFSState {
  depth: number;
  weight: number;
  conditionCount: number;
}

/** Shared context references for DFS caller traversal. */
interface PathContext {
  currentPath: string[];
  currentRels: string[];
  graph: AdjacencyGraph;
  dfs: (nodeId: string, depth: number, weight: number, conditionCount: number) => void;
}

// =============================================================================
// 2. PATH BUILDER CLASS
// =============================================================================

export class PathBuilder {
  private storage: GraphStorage;
  private adjacencyCache: Map<string, AdjacencyGraph> = new Map();
  private nodeCache: Map<string, GraphNode> = new Map();

  constructor(storage: GraphStorage) {
    this.storage = storage;
  }

  // ===========================================================================
  // 3. ADJACENCY GRAPH BUILDING
  // ===========================================================================

  /**
   * Build adjacency graph from storage for efficient traversal.
   * Uses batch loading and caching for performance.
   */
  async buildAdjacencyGraph(startIds: string[], maxDepth: number = DEFAULT_MAX_DEPTH): Promise<AdjacencyGraph> {
    const cacheKey = `${startIds.sort().join(",")}:${maxDepth}`;
    const cached = this.adjacencyCache.get(cacheKey);
    if (cached) return cached;

    const nodes = new Map<string, GraphNode>();
    const forward = new Map<string, string[]>();
    const backward = new Map<string, string[]>();
    const weights = new Map<string, number>();

    // BFS to collect all relevant nodes
    const visited = new Set<string>();
    const queue: Array<{ id: string; depth: number }> = startIds.map((id) => ({
      id,
      depth: 0,
    }));

    while (queue.length > 0) {
      // Process in batches of 16 for better cache locality
      const batch = queue.splice(0, Math.min(16, queue.length));

      // Filter to unvisited nodes within depth
      const validBatch = batch.filter(({ id, depth }) => !visited.has(id) && depth <= maxDepth);
      if (validBatch.length === 0) continue;

      // Mark all as visited upfront to avoid re-queuing
      for (const { id } of validBatch) visited.add(id);

      // Batch fetch all entities in one query instead of N getEntity() calls
      const batchIds = validBatch.map(({ id }) => id);
      const entityMap = await this.storage.getEntitiesBatch(batchIds);

      for (const { id, depth } of validBatch) {
        const entity = entityMap.get(id);
        if (!entity) continue;

        const node = this.entityToNode(entity);
        nodes.set(id, node);

        // Get outgoing relationships (calls) — still per-entity (no batch API for relationships)
        const outRels = await this.storage.getRelationshipsForEntity(id);
        const outgoing: string[] = [];
        const incoming: string[] = [];

        for (const rel of outRels) {
          const weight = this.calculateEdgeWeight(rel, entity);
          const edgeKey = `${rel.fromId}:${rel.toId}`;
          weights.set(edgeKey, weight);

          if (rel.fromId === id) {
            // Outgoing edge - resolve NgRx phantom entities by name
            let targetId = rel.toId;

            if (NGRX_RELATIONSHIP_TYPES.has(rel.type)) {
              // For NgRx relationships, try to resolve target by name
              const resolvedId = await resolveNgRxTarget(this.storage, rel.toId);
              if (resolvedId) {
                targetId = resolvedId;
              }
            }

            outgoing.push(targetId);
            if (depth < maxDepth && !visited.has(targetId)) {
              queue.push({ id: targetId, depth: depth + 1 });
            }
          } else {
            // Incoming edge
            incoming.push(rel.fromId);
            if (depth < maxDepth && !visited.has(rel.fromId)) {
              queue.push({ id: rel.fromId, depth: depth + 1 });
            }
          }
        }

        // Also find incoming NgRx relationships by entity name
        const incomingNgRx = await findIncomingNgRxRelationships(this.storage, entity.name);
        for (const rel of incomingNgRx) {
          const isInvertedRelation = isInvertedNgRxRelation(rel.type);

          if (isInvertedRelation) {
            // Inverted: action -> reducer/effect (add as outgoing from current entity)
            if (!outgoing.includes(rel.fromId)) {
              outgoing.push(rel.fromId);
              const weight = this.calculateEdgeWeight(rel, entity);
              weights.set(`${id}:${rel.fromId}`, weight);

              if (depth < maxDepth && !visited.has(rel.fromId)) {
                queue.push({ id: rel.fromId, depth: depth + 1 });
              }
            }
          } else {
            // Normal incoming
            if (!incoming.includes(rel.fromId)) {
              incoming.push(rel.fromId);
              const weight = this.calculateEdgeWeight(rel, entity);
              weights.set(`${rel.fromId}:${id}`, weight);

              if (depth < maxDepth && !visited.has(rel.fromId)) {
                queue.push({ id: rel.fromId, depth: depth + 1 });
              }
            }
          }
        }

        forward.set(id, outgoing);
        backward.set(id, incoming);
        node.outgoing = outgoing;
        node.incoming = incoming;
      }
    }

    // Add implicit NgRx reducer -> featureSelector connections
    const reducerSelectorConnections = await findReducerToSelectorConnections(this.storage);

    // Batch fetch all missing entities at once instead of N getEntity() calls
    const missingConnIds = new Set<string>();
    for (const conn of reducerSelectorConnections) {
      if (nodes.has(conn.reducerId) || nodes.has(conn.selectorId)) {
        if (!nodes.has(conn.reducerId)) missingConnIds.add(conn.reducerId);
        if (!nodes.has(conn.selectorId)) missingConnIds.add(conn.selectorId);
      }
    }
    const missingEntities =
      missingConnIds.size > 0 ? await this.storage.getEntitiesBatch([...missingConnIds]) : new Map<string, Entity>();

    for (const conn of reducerSelectorConnections) {
      // Only add if both nodes are in the graph
      if (nodes.has(conn.reducerId) || nodes.has(conn.selectorId)) {
        // Ensure both nodes exist in graph (use batch-fetched entities)
        if (!nodes.has(conn.reducerId)) {
          const reducerEntity = missingEntities.get(conn.reducerId);
          if (reducerEntity) {
            nodes.set(conn.reducerId, this.entityToNode(reducerEntity));
            forward.set(conn.reducerId, []);
            backward.set(conn.reducerId, []);
          }
        }
        if (!nodes.has(conn.selectorId)) {
          const selectorEntity = missingEntities.get(conn.selectorId);
          if (selectorEntity) {
            nodes.set(conn.selectorId, this.entityToNode(selectorEntity));
            forward.set(conn.selectorId, []);
            backward.set(conn.selectorId, []);
          }
        }

        // Add forward edge: reducer -> featureSelector
        const reducerOutgoing = forward.get(conn.reducerId) || [];
        if (!reducerOutgoing.includes(conn.selectorId)) {
          reducerOutgoing.push(conn.selectorId);
          forward.set(conn.reducerId, reducerOutgoing);
        }

        // Add backward edge: featureSelector <- reducer
        const selectorIncoming = backward.get(conn.selectorId) || [];
        if (!selectorIncoming.includes(conn.reducerId)) {
          selectorIncoming.push(conn.reducerId);
          backward.set(conn.selectorId, selectorIncoming);
        }

        // Add weight based on confidence
        const edgeKey = `${conn.reducerId}:${conn.selectorId}`;
        weights.set(edgeKey, CALL_WEIGHT * (2 - conn.confidence)); // Higher confidence = lower weight

        // Update node edges
        const reducerNode = nodes.get(conn.reducerId);
        const selectorNode = nodes.get(conn.selectorId);
        if (reducerNode && !reducerNode.outgoing.includes(conn.selectorId)) {
          reducerNode.outgoing.push(conn.selectorId);
        }
        if (selectorNode && !selectorNode.incoming.includes(conn.reducerId)) {
          selectorNode.incoming.push(conn.reducerId);
        }
      }
    }

    const graph: AdjacencyGraph = { nodes, forward, backward, weights };

    // Cache for reuse
    if (nodes.size < 10000) {
      this.adjacencyCache.set(cacheKey, graph);
    }

    return graph;
  }

  /**
   * Convert Entity to GraphNode with control flow info
   */
  private entityToNode(entity: Entity): GraphNode {
    const cached = this.nodeCache.get(entity.id);
    if (cached) return cached;

    const node: GraphNode = {
      id: entity.id,
      name: entity.name,
      type: entity.type,
      file: entity.filePath,
      line: entity.location.start.line,
      outgoing: [],
      incoming: [],
    };

    // Extract control flow from metadata
    const meta = entity.metadata as Record<string, any>;

    if (meta["controlFlow"]) {
      node.controlFlow = {
        branches: meta["controlFlow"].branches,
        loops: meta["controlFlow"].loops,
        awaits: meta["controlFlow"].awaits,
        exceptions: meta["controlFlow"].exceptions,
      };
    }

    if (meta["calls"]) {
      node.calls = meta["calls"] as Array<{ name: string; target?: string | undefined; isAwait?: boolean }>;
    }

    if (meta["complexity"]) {
      node.complexity = meta["complexity"];
    }

    this.nodeCache.set(entity.id, node);
    return node;
  }

  /**
   * Calculate edge weight based on relationship type and conditions
   */
  private calculateEdgeWeight(rel: Relationship, _fromEntity: Entity): number {
    let weight = CALL_WEIGHT;

    // Conditional calls have higher weight (lower priority)
    if (rel.metadata?.["conditional"]) {
      weight += CONDITION_WEIGHT;
    }

    // Async calls have penalty
    if (rel.metadata?.["isAwait"] || rel.metadata?.["isAsync"]) {
      weight += ASYNC_WEIGHT;
    }

    // Use relationship weight if provided
    if (rel.weight) {
      weight *= rel.weight;
    }

    return weight;
  }

  // ===========================================================================
  // 4. FORWARD PATH FINDING (BFS - Shortest Paths)
  // ===========================================================================

  /**
   * Find all paths from source to target using BFS.
   * Returns paths sorted by weight (shortest/simplest first).
   *
   * Optimized with:
   * - Loop unrolling for neighbor iteration
   * - Early termination when enough paths found
   * - Priority queue simulation via sorted insertion
   */
  async findPathsForward(
    sourceId: string,
    targetId: string,
    options: Partial<PathFindingOptions> = {},
  ): Promise<RawPath[]> {
    const maxDepth = options.maxDepth ?? DEFAULT_MAX_DEPTH;
    const maxPaths = options.maxPaths ?? DEFAULT_MAX_PATHS;

    // Build adjacency graph
    const graph = await this.buildAdjacencyGraph([sourceId], maxDepth);

    if (!graph.nodes.has(sourceId)) {
      return [];
    }

    const paths: RawPath[] = [];

    // BFS with path tracking
    const queue: Array<{
      path: string[];
      relationships: string[];
      weight: number;
      conditionCount: number;
    }> = [
      {
        path: [sourceId],
        relationships: [],
        weight: 0,
        conditionCount: 0,
      },
    ];

    const visited = new Map<string, number>(); // node -> best weight to reach it
    visited.set(sourceId, 0);

    while (queue.length > 0 && paths.length < maxPaths) {
      const current = queue.shift()!;
      const currentNode = current.path[current.path.length - 1]!;

      // Found target
      if (currentNode === targetId) {
        paths.push({
          entityIds: current.path,
          relationships: current.relationships,
          weight: current.weight,
          conditionCount: current.conditionCount,
        });
        continue;
      }

      // Check depth
      if (current.path.length >= maxDepth) continue;

      // Get neighbors
      const neighbors = graph.forward.get(currentNode) || [];

      // Loop unrolling: process 4 neighbors at a time
      const len4 = neighbors.length - (neighbors.length % 4);

      for (let i = 0; i < len4; i += 4) {
        this.processNeighbor(neighbors[i]!, current, graph, visited, queue, options);
        this.processNeighbor(neighbors[i + 1]!, current, graph, visited, queue, options);
        this.processNeighbor(neighbors[i + 2]!, current, graph, visited, queue, options);
        this.processNeighbor(neighbors[i + 3]!, current, graph, visited, queue, options);
      }

      // Handle remaining neighbors
      for (let i = len4; i < neighbors.length; i++) {
        this.processNeighbor(neighbors[i]!, current, graph, visited, queue, options);
      }

      // Sort queue by weight for best-first search
      queue.sort((a, b) => a.weight - b.weight);
    }

    return paths.sort((a, b) => a.weight - b.weight);
  }

  /**
   * Process a single neighbor in BFS
   */
  private processNeighbor(
    neighborId: string,
    current: {
      path: string[];
      relationships: string[];
      weight: number;
      conditionCount: number;
    },
    graph: AdjacencyGraph,
    visited: Map<string, number>,
    queue: Array<{
      path: string[];
      relationships: string[];
      weight: number;
      conditionCount: number;
    }>,
    options: Partial<PathFindingOptions>,
  ): void {
    // Skip if already in path (avoid cycles)
    if (current.path.includes(neighborId)) return;

    const currentNode = current.path[current.path.length - 1]!;
    const edgeKey = `${currentNode}:${neighborId}`;
    const edgeWeight = graph.weights.get(edgeKey) ?? CALL_WEIGHT;
    const newWeight = current.weight + edgeWeight;

    // Skip if we found a better path to this node
    const bestWeight = visited.get(neighborId);
    if (bestWeight !== undefined && bestWeight <= newWeight) return;

    // Skip if weight exceeds threshold
    if (options.weightThreshold && newWeight > options.weightThreshold) return;

    visited.set(neighborId, newWeight);

    // Check if this is a conditional edge
    const node = graph.nodes.get(neighborId);
    const isConditional = node?.controlFlow?.branches && node.controlFlow.branches.length > 0;

    queue.push({
      path: [...current.path, neighborId],
      relationships: [...current.relationships, edgeKey],
      weight: newWeight,
      conditionCount: current.conditionCount + (isConditional ? 1 : 0),
    });
  }

  // ===========================================================================
  // 5. BACKWARD PATH FINDING (DFS - All Callers)
  // ===========================================================================

  /**
   * Find all paths leading to target using DFS (backwards traversal).
   * Used for "why doesn't X get called?" analysis.
   */
  async findPathsBackward(targetId: string, options: Partial<PathFindingOptions> = {}): Promise<RawPath[]> {
    const maxDepth = options.maxDepth ?? DEFAULT_MAX_DEPTH;
    const maxPaths = options.maxPaths ?? DEFAULT_MAX_PATHS;

    // Build adjacency graph centered on target
    const graph = await this.buildAdjacencyGraph([targetId], maxDepth);

    if (!graph.nodes.has(targetId)) {
      return [];
    }

    const paths: RawPath[] = [];
    const currentPath: string[] = [];
    const currentRels: string[] = [];

    // DFS helper
    const dfs = (nodeId: string, depth: number, weight: number, conditionCount: number): void => {
      if (depth > maxDepth || paths.length >= maxPaths) return;

      currentPath.push(nodeId);

      // Get callers (backward edges)
      const callers = graph.backward.get(nodeId) || [];

      if (callers.length === 0 && currentPath.length > 1) {
        // Found an entry point - save path (reversed)
        paths.push({
          entityIds: [...currentPath].reverse(),
          relationships: [...currentRels].reverse(),
          weight,
          conditionCount,
        });
      } else {
        const state: DFSState = { depth, weight, conditionCount };
        const ctx: PathContext = { currentPath, currentRels, graph, dfs };

        // Loop unrolling for callers
        const len4 = callers.length - (callers.length % 4);

        for (let i = 0; i < len4; i += 4) {
          this.processCallerDFS(callers[i]!, nodeId, state, ctx);
          this.processCallerDFS(callers[i + 1]!, nodeId, state, ctx);
          this.processCallerDFS(callers[i + 2]!, nodeId, state, ctx);
          this.processCallerDFS(callers[i + 3]!, nodeId, state, ctx);
        }

        for (let i = len4; i < callers.length; i++) {
          this.processCallerDFS(callers[i]!, nodeId, state, ctx);
        }
      }

      currentPath.pop();
    };

    dfs(targetId, 0, 0, 0);

    return paths.sort((a, b) => a.weight - b.weight);
  }

  /**
   * Process a single caller in DFS
   */
  private processCallerDFS(callerId: string, currentId: string, state: DFSState, ctx: PathContext): void {
    // Skip cycles
    if (ctx.currentPath.includes(callerId)) return;

    const edgeKey = `${callerId}:${currentId}`;
    const edgeWeight = ctx.graph.weights.get(edgeKey) ?? CALL_WEIGHT;
    const newWeight = state.weight + edgeWeight;

    // Check if conditional
    const node = ctx.graph.nodes.get(callerId);
    const isConditional = node?.controlFlow?.branches && node.controlFlow.branches.length > 0;

    ctx.currentRels.push(edgeKey);
    ctx.dfs(callerId, state.depth + 1, newWeight, state.conditionCount + (isConditional ? 1 : 0));
    ctx.currentRels.pop();
  }

  // ===========================================================================
  // 6. PATH ENRICHMENT (Delegated to extracted module)
  // ===========================================================================

  /**
   * Convert raw paths to enriched TracePaths with full information.
   * Delegates to the extracted path-enrichment module.
   */
  async enrichPaths(rawPaths: RawPath[], graph: AdjacencyGraph): Promise<TracePath[]> {
    return enrichPathsUtil(rawPaths, graph);
  }

  // ===========================================================================
  // 7. UTILITY METHODS
  // ===========================================================================

  /**
   * Clear caches (call after graph changes)
   */
  clearCache(): void {
    this.adjacencyCache.clear();
    this.nodeCache.clear();
  }

  /**
   * Get call probability based on conditions
   */
  getCallProbability(node: GraphNode): CallProbability {
    if (!node.controlFlow?.branches || node.controlFlow.branches.length === 0) {
      return "always";
    }

    // Check for guard patterns (early returns)
    const hasGuard = node.controlFlow.branches.some((b) => b.target === "return" || b.target === "throw");

    if (hasGuard) {
      return "rare";
    }

    return "conditional";
  }

  /**
   * Get confidence level from numeric score
   */
  getConfidenceLevel(score: number): ConfidenceLevel {
    return getConfidenceLevelUtil(score);
  }

  /**
   * Find entity by name using semantic search
   * Decomposed query for 512-token models
   *
   * @param name - Entity name to search for
   * @param type - Optional entity type filter
   * @param filePath - Optional file path filter (partial match supported)
   */
  async findEntityByName(name: string, type?: string, filePath?: string): Promise<Entity | null> {
    // If filePath provided, search with higher limit and filter at SQL level
    const entities = await this.storage.searchEntities({
      namePattern: name,
      types: type ? [type as EntityType] : undefined,
      filePath: filePath, // Pass to SQL for efficient filtering
      limit: filePath ? 1000 : 100, // Higher limit when filtering by file
    });

    if (entities.length > 0) {
      // If filePath provided, do additional in-memory filtering for partial matches
      if (filePath) {
        // Normalize path for comparison (handle both / and \)
        const normalizedFilter = filePath.replace(/\\/g, "/").toLowerCase();
        const fileMatches = entities.filter((e) => {
          const entityPath = (e.filePath || "").replace(/\\/g, "/").toLowerCase();
          return entityPath.includes(normalizedFilter) || entityPath.endsWith(normalizedFilter);
        });

        if (fileMatches.length > 0) {
          // Return best match from file-filtered results: exact → suffix → first
          const exact = fileMatches.find((e) => e.name === name || e.name.endsWith(`.${name}`));
          return exact || fileMatches[0]!;
        }
      }

      // Return best match: exact → suffix (ClassName.name) → first
      const exact = entities.find((e) => e.name === name || e.name.endsWith(`.${name}`));
      return exact || entities[0]!;
    }

    return null;
  }

  /**
   * Get all callers of an entity
   */
  async getCallers(entityId: string): Promise<Array<{ entity: Entity; probability: CallProbability }>> {
    const rels = await this.storage.getRelationshipsForEntity(entityId, RelationType.CALLS);

    // Collect all caller IDs, then batch fetch
    const callerIds = rels.filter((rel) => rel.toId === entityId).map((rel) => rel.fromId);
    if (callerIds.length === 0) return [];

    const entityMap = await this.storage.getEntitiesBatch(callerIds);
    const callers: Array<{ entity: Entity; probability: CallProbability }> = [];

    for (const id of callerIds) {
      const caller = entityMap.get(id);
      if (caller) {
        const node = this.entityToNode(caller);
        callers.push({
          entity: caller,
          probability: this.getCallProbability(node),
        });
      }
    }

    return callers;
  }

  /**
   * Get all callees of an entity
   */
  async getCallees(entityId: string): Promise<Entity[]> {
    const rels = await this.storage.getRelationshipsForEntity(entityId, RelationType.CALLS);

    // Collect all callee IDs, then batch fetch
    const calleeIds = rels.filter((rel) => rel.fromId === entityId).map((rel) => rel.toId);
    if (calleeIds.length === 0) return [];

    const entityMap = await this.storage.getEntitiesBatch(calleeIds);
    return calleeIds.map((id) => entityMap.get(id)).filter((e): e is Entity => e != null);
  }
}

// =============================================================================
// 8. EXPORTS
// =============================================================================

export default PathBuilder;
