/**
 * Semantic Trace Engine
 *
 * Main engine for static code flow analysis.
 * Coordinates PathBuilder, StateTracker, and ConditionAnalyzer.
 *
 * Architecture References:
 * - Tracing Types: src/tracing/types.ts
 * - Path Builder: src/tracing/path-builder.ts
 * - Graph Storage: src/storage/graph-storage.ts
 */

import { log } from "../logging/index.js";
import type { Entity, GraphStorage } from "../types/storage.js";
import { GraphologyPathBuilder, type LinearTrace } from "./graphology-path-builder.js";
import { PathBuilder } from "./path-builder.js";
import type {
  BlockingCondition,
  CallChain,
  CallerInfo,
  ConditionsSummary,
  Diagnosis,
  StateDependency,
  StatesSummary,
  TraceBackwardsParams,
  TraceBackwardsResult,
  TraceFlowParams,
  TraceFlowResult,
  TracePath,
} from "./types.js";

// Semantic search service interface (optional dependency)
interface SemanticSearchService {
  search(query: string, options: { limit: number; minSimilarity: number }): Promise<Array<{ entityId: string }>>;
}

// =============================================================================
// 1. CONSTANTS
// =============================================================================

const DEFAULT_MAX_DEPTH = 15;
const DEFAULT_MAX_PATHS = 5;

// =============================================================================
// 2. TRACE ENGINE CLASS
// =============================================================================

// Entity types that represent real code (not imports/stubs)
const REAL_CODE_TYPES = new Set(["method", "function", "async_function", "class", "interface", "property"]);

/** Check if an entity is a real code entity (not an external stub or import) */
function isRealEntity(entity: Entity): boolean {
  if (entity.id.startsWith("external:")) return false;
  if (entity.filePath?.includes("external://")) return false;
  if (entity.type === "import") return false;
  return true;
}

export class TraceEngine {
  private storage: GraphStorage;
  private semanticSearch?: SemanticSearchService;
  private pathBuilder: PathBuilder;
  private graphologyBuilder: GraphologyPathBuilder;
  private useOptimized: boolean;

  // Cache for resolveEntity results (cleared on clearCache())
  private resolveEntityCache = new Map<string, Entity | null>();

  constructor(storage: GraphStorage, semanticSearch?: SemanticSearchService, useOptimized = true) {
    this.storage = storage;
    this.semanticSearch = semanticSearch;
    this.pathBuilder = new PathBuilder(storage);
    this.graphologyBuilder = new GraphologyPathBuilder(storage);
    this.useOptimized = useOptimized;
  }

  /**
   * Enable or disable optimized graphology-based tracing
   */
  setOptimizedMode(enabled: boolean): void {
    this.useOptimized = enabled;
  }

  /**
   * Check if optimized mode is enabled
   */
  isOptimizedMode(): boolean {
    return this.useOptimized;
  }

  /**
   * Get graph statistics (only available in optimized mode)
   */
  async getGraphStats(): Promise<{ nodes: number; edges: number; loadTimeMs: number } | null> {
    if (!this.graphologyBuilder.isLoaded()) {
      await this.graphologyBuilder.loadGraph();
    }
    return this.graphologyBuilder.getStats();
  }

  // ===========================================================================
  // 3. TRACE FLOW (A → B)
  // ===========================================================================

  /**
   * Trace execution flow from point A to point B.
   * Uses optimized graphology-based traversal by default.
   */
  async traceFlow(params: TraceFlowParams): Promise<TraceFlowResult> {
    const maxDepth = params.maxDepth ?? DEFAULT_MAX_DEPTH;

    // Use optimized graphology-based tracing if enabled
    if (this.useOptimized) {
      return this.traceFlowOptimized(params, maxDepth);
    }

    // Fallback to legacy implementation
    return this.traceFlowLegacy(params, maxDepth);
  }

  /**
   * Optimized trace flow using graphology (O(V+E) instead of O(2^n))
   */
  private async traceFlowOptimized(params: TraceFlowParams, maxDepth: number): Promise<TraceFlowResult> {
    const startTime = performance.now();

    // 1. Load graph into memory (cached after first call)
    const stats = await this.graphologyBuilder.loadGraph();
    log.i("TRACEENGINE", "graph_loaded", {
      nodes: stats.nodes,
      edges: stats.edges,
      timeMs: +stats.loadTimeMs.toFixed(0),
    });

    // 2. Resolve entities
    const sourceEntity = await this.resolveEntity(params.from);
    const targetEntity = await this.resolveEntity(params.to);

    if (!sourceEntity) {
      throw new Error(`Could not find source entity: ${params.from}`);
    }
    if (!targetEntity) {
      throw new Error(`Could not find target entity: ${params.to}`);
    }

    log.d("TRACEENGINE", "resolved", {
      from: params.from,
      srcId: sourceEntity.id,
      srcName: sourceEntity.name,
      to: params.to,
      tgtId: targetEntity.id,
      tgtName: targetEntity.name,
    });

    // 3. Use linear trace for fast single-path result
    const linearTrace = await this.graphologyBuilder.traceLinearFlow(sourceEntity.id, targetEntity.id, maxDepth);

    // 4. Convert linear trace to TracePath format
    const paths: TracePath[] = [];
    if (linearTrace.found) {
      paths.push(this.linearTraceToTracePath(linearTrace));
    }

    // 5. If multiple paths requested, find additional paths (limited)
    if (params.trackConditions && linearTrace.found) {
      const additionalPaths = await this.graphologyBuilder.findPaths(
        sourceEntity.id,
        targetEntity.id,
        DEFAULT_MAX_PATHS - 1,
        maxDepth,
      );
      const enrichedPaths = this.graphologyBuilder.enrichPaths(additionalPaths);
      // Add unique paths (not duplicate of linear trace)
      for (const p of enrichedPaths) {
        if (p.steps.length !== paths[0]?.steps.length) {
          paths.push(p);
        }
      }
    }

    // 6. Analyze states and conditions
    let statesSummary: StatesSummary = { modified: [], read: [], critical: [] };
    if (params.trackStates && paths.length > 0) {
      statesSummary = await this.analyzeStatesInPaths(paths);
    }

    let conditionsSummary: ConditionsSummary = { guards: 0, branches: 0, criticalConditions: [] };
    if (params.trackConditions && paths.length > 0) {
      conditionsSummary = this.analyzeConditionsInPaths(paths);
    }

    // 7. Generate Mermaid diagram
    let mermaid: string | undefined;
    if (params.format === "mermaid" && paths.length > 0) {
      mermaid = this.generateMermaidDiagram(paths, sourceEntity.name, targetEntity.name);
    }

    // 8. Annotate API contract boundaries in paths
    await this.annotateApiContractBoundaries(paths);

    const totalTime = performance.now() - startTime;
    log.i("TRACEENGINE", "trace_done", { timeMs: +totalTime.toFixed(0), visited: linearTrace.nodesVisited });

    return {
      from: params.from,
      to: params.to,
      paths,
      statesSummary,
      conditionsSummary,
      mermaid,
      // Debug info for troubleshooting
      _debug: {
        sourceEntityId: sourceEntity.id,
        sourceEntityName: sourceEntity.name,
        targetEntityId: targetEntity.id,
        targetEntityName: targetEntity.name,
        graphStats: stats,
        linearTraceSummary: linearTrace.summary,
        nodesVisited: linearTrace.nodesVisited,
        found: linearTrace.found,
        timeMs: totalTime,
      },
    };
  }

  /**
   * Convert LinearTrace to TracePath format
   */
  private linearTraceToTracePath(linear: LinearTrace): TracePath {
    return {
      id: "path-1",
      confidence: linear.found ? 0.9 : 0.1,
      steps: linear.steps.map((s) => ({
        order: s.order,
        entity: s.entity,
        entityId: s.entityId,
        file: s.file,
        line: s.line,
        action: s.action,
        condition: s.branches?.[0]?.condition,
        branches: s.branches?.reduce(
          (acc, b) => {
            acc[b.condition] = b.target;
            return acc;
          },
          {} as Record<string, string>,
        ),
      })),
      summary: linear.summary,
      warnings: [],
    };
  }

  /**
   * Annotate trace path steps that cross API contract boundaries (Swagger/OpenAPI).
   * Adds crossesApiContract and contractInfo to steps where entity has isApiContract metadata.
   */
  private async annotateApiContractBoundaries(paths: TracePath[]): Promise<void> {
    // Collect all unique entity IDs from all paths
    const entityIds = new Set<string>();
    for (const path of paths) {
      for (const step of path.steps) {
        if (step.entityId) entityIds.add(step.entityId);
      }
    }

    if (entityIds.size === 0) return;

    // Batch fetch entities
    const entityBatch = await this.storage.getEntitiesBatch(Array.from(entityIds));

    // Annotate steps
    let annotated = 0;
    for (const path of paths) {
      for (const step of path.steps) {
        if (!step.entityId) continue;
        const entity = entityBatch.get(step.entityId);
        if (entity?.metadata?.["isApiContract"]) {
          const swaggerType = entity.metadata["swaggerType"] as string;
          (step as unknown as Record<string, unknown>)["crossesApiContract"] = true;
          (step as unknown as Record<string, unknown>)["contractInfo"] = {
            type: "swagger",
            swaggerType,
            endpoint:
              swaggerType === "endpoint"
                ? `${entity.metadata["httpMethod"] || ""} ${entity.metadata["path"] || ""}`.trim()
                : undefined,
            schemaName: swaggerType === "schema" ? entity.name : undefined,
          };
          annotated++;
        }
      }

      // Add warning if path crosses API contract boundary
      if (annotated > 0 && path.warnings) {
        path.warnings.push("Path crosses API contract boundary — changes may affect external consumers");
      }
    }
  }

  /**
   * Legacy trace flow implementation (for fallback/comparison)
   */
  private async traceFlowLegacy(params: TraceFlowParams, maxDepth: number): Promise<TraceFlowResult> {
    // 1. Resolve source and target entities
    const sourceEntity = await this.resolveEntity(params.from);
    const targetEntity = await this.resolveEntity(params.to);

    if (!sourceEntity) {
      throw new Error(`Could not find source entity: ${params.from}`);
    }
    if (!targetEntity) {
      throw new Error(`Could not find target entity: ${params.to}`);
    }

    // 2. Find all paths
    const rawPaths = await this.pathBuilder.findPathsForward(sourceEntity.id, targetEntity.id, {
      maxDepth,
      maxPaths: DEFAULT_MAX_PATHS,
    });

    if (rawPaths.length === 0) {
      return {
        from: params.from,
        to: params.to,
        paths: [],
        statesSummary: { modified: [], read: [], critical: [] },
        conditionsSummary: { guards: 0, branches: 0, criticalConditions: [] },
      };
    }

    // 3. Build adjacency graph for enrichment
    const graph = await this.pathBuilder.buildAdjacencyGraph([sourceEntity.id, targetEntity.id], maxDepth);

    // 4. Enrich paths with full information
    const paths = await this.pathBuilder.enrichPaths(rawPaths, graph);

    // 5. Analyze states if requested
    let statesSummary: StatesSummary = { modified: [], read: [], critical: [] };
    if (params.trackStates) {
      statesSummary = await this.analyzeStatesInPaths(paths);
    }

    // 6. Analyze conditions if requested
    let conditionsSummary: ConditionsSummary = { guards: 0, branches: 0, criticalConditions: [] };
    if (params.trackConditions) {
      conditionsSummary = this.analyzeConditionsInPaths(paths);
    }

    // 7. Generate Mermaid diagram if requested
    let mermaid: string | undefined;
    if (params.format === "mermaid") {
      mermaid = this.generateMermaidDiagram(paths, sourceEntity.name, targetEntity.name);
    }

    return {
      from: params.from,
      to: params.to,
      paths,
      statesSummary,
      conditionsSummary,
      mermaid,
    };
  }

  // ===========================================================================
  // 4. TRACE BACKWARDS (Why not called?)
  // ===========================================================================

  /**
   * Trace backwards from a target to find why it might not be called.
   * Uses optimized graphology-based traversal by default.
   */
  async traceBackwards(params: TraceBackwardsParams): Promise<TraceBackwardsResult> {
    const maxDepth = params.depth ?? DEFAULT_MAX_DEPTH;

    // 1. Resolve target entity
    const targetEntity = await this.resolveEntity(params.target);

    if (!targetEntity) {
      throw new Error(`Could not find target entity: ${params.target}`);
    }

    // 2. Use optimized backwards trace if enabled
    if (this.useOptimized) {
      const startTime = performance.now();
      await this.graphologyBuilder.loadGraph();

      const backwardsResult = await this.graphologyBuilder.traceBackwards(targetEntity.id, maxDepth);

      // Convert to CallerInfo format
      const callers: CallerInfo[] = backwardsResult.callers.map((c) => ({
        name: c.name,
        entityId: c.id,
        file: "", // Will be filled from entity lookup if needed
        line: 0,
        probability: c.probability,
      }));

      // Find blocking conditions from callers with conditional probability
      const blockingConditions: BlockingCondition[] = callers
        .filter((c) => c.probability === "conditional" || c.probability === "rare")
        .map((c) => ({
          condition: `Conditional call from ${c.name}`,
          location: c.file ? `${c.file}:${c.line}` : c.name,
          currentValue: "unknown",
          recommendation: `Check conditions in ${c.name}`,
        }));

      // Build call chains from entry points
      const callChains: CallChain[] = backwardsResult.entryPoints.map((ep) => ({
        chain: [ep.name, "...", targetEntity.name],
        guards: [],
        likelihood: "medium" as const,
        entryPoint: ep.name,
      }));

      const totalTime = performance.now() - startTime;
      log.i("TRACEENGINE", "back_trace_done", { timeMs: +totalTime.toFixed(0) });

      return {
        target: {
          name: targetEntity.name,
          entityId: targetEntity.id,
          file: targetEntity.filePath,
          signature: this.getEntitySignature(targetEntity),
        },
        callers,
        blockingConditions,
        statesDependencies: params.includeStates ? await this.findStateDependencies(targetEntity) : [],
        callChains,
        diagnosis: this.generateDiagnosis(
          params.question,
          callers,
          blockingConditions,
          params.includeStates ? await this.findStateDependencies(targetEntity) : [],
          callChains,
        ),
      };
    }

    // Legacy implementation
    // 2. Get direct callers
    const callersWithProbability = await this.pathBuilder.getCallers(targetEntity.id);

    // 3. Convert to CallerInfo
    const callers: CallerInfo[] = await Promise.all(
      callersWithProbability.map(async ({ entity, probability }) => {
        const callerInfo: CallerInfo = {
          name: entity.name,
          entityId: entity.id,
          file: entity.filePath,
          line: entity.location.start.line,
          probability,
        };

        // Get condition from metadata
        const meta = entity.metadata as Record<string, any>;
        if (meta["controlFlow"]?.branches) {
          const branches = meta["controlFlow"].branches;
          if (branches.length > 0) {
            callerInfo.condition = branches[0]?.condition;
          }
        }

        return callerInfo;
      }),
    );

    // 4. Find blocking conditions
    const blockingConditions = await this.findBlockingConditions(targetEntity, callers);

    // 5. Find state dependencies
    let statesDependencies: StateDependency[] = [];
    if (params.includeStates) {
      statesDependencies = await this.findStateDependencies(targetEntity);
    }

    // 6. Build call chains
    const rawPaths = await this.pathBuilder.findPathsBackward(targetEntity.id, {
      maxDepth,
      maxPaths: DEFAULT_MAX_PATHS,
    });

    const callChains: CallChain[] = rawPaths.map((raw) => {
      const graph = this.pathBuilder["adjacencyCache"].values().next().value;
      const guards: string[] = [];

      // Extract guards from nodes
      for (const id of raw.entityIds) {
        const node = graph?.nodes.get(id);
        if (node?.controlFlow?.branches) {
          for (const branch of node.controlFlow.branches) {
            if (branch.target === "return" || branch.target === "throw") {
              guards.push(`${node.name}: ${branch.condition}`);
            }
          }
        }
      }

      // Find entry point (first node with no callers)
      let entryPoint: string | undefined;
      if (graph) {
        const firstId = raw.entityIds[0];
        const firstNode = graph.nodes.get(firstId!);
        if (firstNode && (!graph.backward.get(firstId!) || graph.backward.get(firstId!)!.length === 0)) {
          entryPoint = firstNode.name;
        }
      }

      return {
        chain: raw.entityIds.map((id) => {
          const node = graph?.nodes.get(id);
          return node?.name || id;
        }),
        guards,
        likelihood: this.pathBuilder.getConfidenceLevel(1 - raw.weight),
        entryPoint,
      };
    });

    // 7. Generate diagnosis
    const diagnosis = this.generateDiagnosis(
      params.question,
      callers,
      blockingConditions,
      statesDependencies,
      callChains,
    );

    return {
      target: {
        name: targetEntity.name,
        entityId: targetEntity.id,
        file: targetEntity.filePath,
        signature: this.getEntitySignature(targetEntity),
      },
      callers,
      blockingConditions,
      statesDependencies,
      callChains,
      diagnosis,
    };
  }

  // ===========================================================================
  // 5. ENTITY RESOLUTION
  // ===========================================================================

  /**
   * Resolve entity by name or semantic search query.
   * Uses decomposed queries for 512-token efficiency.
   *
   * Supports file-qualified format: "filePath:entityName"
   * Examples:
   *   - "main" - finds first entity named "main"
   *   - "src/index.ts:main" - finds "main" in src/index.ts
   *   - "index.ts:main" - finds "main" in any file ending with index.ts
   */
  private async resolveEntity(nameOrQuery: string): Promise<Entity | null> {
    // Check cache first (2A: avoid repeated resolution of same name within a trace)
    const cached = this.resolveEntityCache.get(nameOrQuery);
    if (cached !== undefined) return cached;

    const result = await this.resolveEntityUncached(nameOrQuery);
    this.resolveEntityCache.set(nameOrQuery, result);
    return result;
  }

  private async resolveEntityUncached(nameOrQuery: string): Promise<Entity | null> {
    // Parse file:name format (supports both / and \)
    const fileQualifiedMatch = nameOrQuery.match(
      /^(.+?\.(?:ts|js|tsx|jsx|py|go|rs|java|kt|kts|c|cs|csx|cpp|h|hpp)):(.+)$/i,
    );
    let name = nameOrQuery;
    let filePath: string | undefined;

    if (fileQualifiedMatch) {
      filePath = fileQualifiedMatch[1];
      name = fileQualifiedMatch[2]!;
    }

    // 2C: Normalize filePath once for all levels
    const normalizedFilter = filePath ? filePath.replace(/\\/g, "/").toLowerCase() : undefined;

    /** Helper: filter entities by normalized filePath */
    const filterByFile = (entities: Entity[]): Entity | null => {
      if (!normalizedFilter) return null;
      for (const e of entities) {
        const entityPath = (e.filePath || "").replace(/\\/g, "/").toLowerCase();
        if (entityPath.includes(normalizedFilter) || entityPath.endsWith(normalizedFilter)) {
          return e;
        }
      }
      return null;
    };

    // 1. Try exact name match first (fastest)
    const exactMatch = await this.pathBuilder.findEntityByName(name, undefined, filePath);
    if (exactMatch && isRealEntity(exactMatch)) {
      return exactMatch;
    }

    // 2. Try partial name match via pattern (uses index, faster than suffix scan)
    // 2D: Moved before suffix match since searchEntities uses DB index
    const patternEntities = await this.storage.searchEntities({
      namePattern: name,
    });
    if (patternEntities.length > 0) {
      if (normalizedFilter) {
        const filtered = filterByFile(patternEntities);
        if (filtered) return filtered;
      }
      return patternEntities[0]!;
    }

    // 3. Try suffix match for partial names (e.g., "methodName" -> "ClassName.methodName")
    // 2D: Moved after pattern match — suffix scan loads all entities (expensive fallback)
    if (!name.includes(".")) {
      const suffixPattern = `.${name}`;
      const allEntities = await this.storage.searchEntities({});

      const suffixMatches = allEntities.filter((e) => e.name.endsWith(suffixPattern) && isRealEntity(e));

      // Prioritize real code entity types
      const prioritized = suffixMatches.sort((a, b) => {
        const aReal = REAL_CODE_TYPES.has(a.type) ? 0 : 1;
        const bReal = REAL_CODE_TYPES.has(b.type) ? 0 : 1;
        return aReal - bReal;
      });

      if (prioritized.length === 1) {
        return prioritized[0]!;
      } else if (prioritized.length > 1 && normalizedFilter) {
        const filtered = filterByFile(prioritized);
        if (filtered) return filtered;
      } else if (prioritized.length > 1) {
        log.d("TRACEENGINE", "multiple_suffix_matches", {
          name,
          count: prioritized.length,
          first: prioritized[0]?.name,
        });
        return prioritized[0]!;
      }
    }

    // 4. Use semantic search if available (decomposed query)
    if (this.semanticSearch) {
      try {
        const results = await this.semanticSearch.search(name, {
          limit: filePath ? 10 : 1,
          minSimilarity: 0.6,
        });
        if (results.length > 0) {
          const candidateIds = results.map((r) => r.entityId);
          const candidateMap = await this.storage.getEntitiesBatch(candidateIds);

          if (normalizedFilter) {
            for (const result of results) {
              const entity = candidateMap.get(result.entityId);
              if (entity) {
                const entityPath = (entity.filePath || "").replace(/\\/g, "/").toLowerCase();
                if (entityPath.includes(normalizedFilter) || entityPath.endsWith(normalizedFilter)) {
                  return entity;
                }
              }
            }
          }
          return candidateMap.get(results[0]!.entityId) || null;
        }
      } catch {
        // Semantic search not available or failed
      }
    }

    return null;
  }

  // ===========================================================================
  // 6. STATE ANALYSIS
  // ===========================================================================

  /**
   * Analyze state changes across all paths
   */
  private async analyzeStatesInPaths(paths: TracePath[]): Promise<StatesSummary> {
    const modified = new Set<string>();
    const read = new Set<string>();
    const critical = new Set<string>();

    // Collect all unique entity IDs from all paths, then batch fetch
    const allEntityIds = new Set<string>();
    for (const path of paths) {
      for (const step of path.steps) {
        allEntityIds.add(step.entityId);
      }
    }

    const entityMap =
      allEntityIds.size > 0 ? await this.storage.getEntitiesBatch([...allEntityIds]) : new Map<string, Entity>();

    for (const path of paths) {
      for (const step of path.steps) {
        const entity = entityMap.get(step.entityId);
        if (!entity?.metadata) continue;

        const meta = entity.metadata as Record<string, any>;

        // Check for state modifications
        if (Array.isArray(meta["stateModifications"])) {
          for (const state of meta["stateModifications"]) {
            modified.add(state);
          }
        }

        // Check for state reads
        if (Array.isArray(meta["stateReads"])) {
          for (const state of meta["stateReads"]) {
            read.add(state);
          }
        }

        // States used in conditions are critical
        if (step.condition && Array.isArray(meta["stateReads"])) {
          for (const state of meta["stateReads"]) {
            critical.add(state);
          }
        }
      }
    }

    return {
      modified: Array.from(modified),
      read: Array.from(read),
      critical: Array.from(critical),
    };
  }

  /**
   * Find state dependencies for a target entity
   */
  private async findStateDependencies(target: Entity): Promise<StateDependency[]> {
    const dependencies: StateDependency[] = [];
    const meta = target.metadata as Record<string, any>;

    // Check what states this entity reads
    const stateReads: string[] = Array.isArray(meta["stateReads"]) ? meta["stateReads"] : [];

    for (const state of stateReads) {
      // Find who modifies this state
      const modifiers = await this.findStateModifiers(state);

      dependencies.push({
        state,
        modifiedBy: modifiers.map((e) => e.name),
        stateType: this.inferStateType(state),
      });
    }

    return dependencies;
  }

  /**
   * Find entities that modify a given state
   */
  private async findStateModifiers(stateName: string): Promise<Entity[]> {
    // Search for entities that modify this state
    const entities = await this.storage.searchEntities({
      namePattern: stateName,
    });

    // Filter to those that actually modify state
    return entities.filter((e) => {
      const meta = e.metadata as Record<string, any>;
      const mods: string[] = Array.isArray(meta["stateModifications"]) ? meta["stateModifications"] : [];
      return mods.includes(stateName) || e.name.toLowerCase().includes("set");
    });
  }

  /**
   * Infer state type from context
   */
  private inferStateType(state: string): string {
    // Common patterns
    if (state.startsWith("is") || state.startsWith("has") || state.startsWith("should")) {
      return "boolean";
    }
    if (state.endsWith("Count") || state.endsWith("Index") || state.endsWith("Id")) {
      return "number";
    }
    if (state.endsWith("List") || state.endsWith("Array") || state.endsWith("s")) {
      return "array";
    }
    return "unknown";
  }

  // ===========================================================================
  // 7. CONDITION ANALYSIS
  // ===========================================================================

  /**
   * Analyze conditions across all paths
   */
  private analyzeConditionsInPaths(paths: TracePath[]): ConditionsSummary {
    let guards = 0;
    let branches = 0;
    const criticalConditions = new Set<string>();

    for (const path of paths) {
      for (const step of path.steps) {
        if (step.action === "condition") {
          branches++;

          // Check if this is a guard (early return/throw)
          if (step.branches) {
            const outcomes = Object.values(step.branches);
            if (outcomes.some((o) => o === "return" || o === "throw")) {
              guards++;
            }
          }

          // Conditions on main path are critical
          if (step.condition) {
            criticalConditions.add(step.condition);
          }
        }

        if (step.action === "guard") {
          guards++;
        }
      }
    }

    return {
      guards,
      branches,
      criticalConditions: Array.from(criticalConditions),
    };
  }

  /**
   * Find conditions that might block execution
   */
  private async findBlockingConditions(target: Entity, callers: CallerInfo[]): Promise<BlockingCondition[]> {
    const blocking: BlockingCondition[] = [];

    for (const caller of callers) {
      if (caller.condition && caller.probability === "conditional") {
        blocking.push({
          condition: caller.condition,
          location: `${caller.file}:${caller.line}`,
          currentValue: "unknown (static analysis)",
          recommendation: `Check if condition '${caller.condition}' evaluates to true`,
        });
      }
    }

    // Check target's own preconditions
    const targetMeta = target.metadata as Record<string, any>;
    if (Array.isArray(targetMeta["preconditions"])) {
      for (const pre of targetMeta["preconditions"]) {
        blocking.push({
          condition: pre,
          location: `${target.filePath}:${target.location.start.line}`,
          currentValue: "required",
          recommendation: `Ensure precondition '${pre}' is satisfied`,
        });
      }
    }

    return blocking;
  }

  // ===========================================================================
  // 8. DIAGNOSIS GENERATION
  // ===========================================================================

  /**
   * Generate diagnosis based on analysis results
   */
  private generateDiagnosis(
    question: string,
    callers: CallerInfo[],
    blocking: BlockingCondition[],
    states: StateDependency[],
    chains: CallChain[],
  ): Diagnosis {
    const possibleReasons: string[] = [];
    const suggestedDebugPoints: string[] = [];
    let mostLikely: string | undefined;

    switch (question) {
      case "why_not_called":
        // No callers
        if (callers.length === 0) {
          possibleReasons.push("No callers found - method may be unused");
          possibleReasons.push("Target may be behind an API contract boundary — check swagger consumers");
          mostLikely = "Dead code - no call sites exist (or called via API contract)";
        } else {
          // All callers are conditional
          const conditionalCallers = callers.filter((c) => c.probability !== "always");
          if (conditionalCallers.length === callers.length) {
            possibleReasons.push("All call sites are conditional");
            mostLikely = "Conditions not met at runtime";

            for (const caller of conditionalCallers) {
              suggestedDebugPoints.push(`${caller.file}:${caller.line} - ${caller.condition || "check condition"}`);
            }
          }

          // Blocking conditions
          if (blocking.length > 0) {
            possibleReasons.push(`${blocking.length} blocking condition(s) detected`);
            for (const b of blocking) {
              suggestedDebugPoints.push(`${b.location} - ${b.condition}`);
            }
          }

          // State dependencies
          if (states.length > 0) {
            possibleReasons.push(`Depends on ${states.length} state(s)`);
            for (const s of states) {
              if (s.modifiedBy.length === 0) {
                possibleReasons.push(`State '${s.state}' has no known modifiers`);
              }
            }
          }
        }
        break;

      case "what_affects":
        // List all dependencies
        if (states.length > 0) {
          possibleReasons.push(`Direct state dependencies: ${states.map((s) => s.state).join(", ")}`);
        }
        if (blocking.length > 0) {
          possibleReasons.push(`Guard conditions: ${blocking.map((b) => b.condition).join(", ")}`);
        }
        if (chains.length > 0) {
          const entryPoints = chains.filter((c) => c.entryPoint).map((c) => c.entryPoint);
          if (entryPoints.length > 0) {
            possibleReasons.push(`Entry points: ${entryPoints.join(", ")}`);
          }
        }
        break;

      case "dependencies":
        // Full dependency analysis
        for (const chain of chains) {
          possibleReasons.push(`Call chain: ${chain.chain.join(" → ")}`);
          if (chain.guards.length > 0) {
            possibleReasons.push(`  Guards: ${chain.guards.join("; ")}`);
          }
        }
        break;
    }

    // Default suggestions
    if (suggestedDebugPoints.length === 0 && callers.length > 0) {
      suggestedDebugPoints.push(`${callers[0]!.file}:${callers[0]!.line} - First caller`);
    }

    return {
      possibleReasons,
      suggestedDebugPoints,
      mostLikely,
    };
  }

  // ===========================================================================
  // 9. OUTPUT GENERATION
  // ===========================================================================

  /**
   * Generate Mermaid sequence diagram
   */
  private generateMermaidDiagram(paths: TracePath[], sourceName: string, targetName: string): string {
    const lines: string[] = ["sequenceDiagram"];
    lines.push(`  participant S as ${this.sanitizeMermaidId(sourceName)}`);
    lines.push(`  participant T as ${this.sanitizeMermaidId(targetName)}`);

    // Add participants for intermediate nodes
    const participants = new Set<string>();
    for (const path of paths) {
      for (const step of path.steps) {
        if (step.entity !== sourceName && step.entity !== targetName) {
          participants.add(step.entity);
        }
      }
    }

    let idx = 1;
    const participantMap = new Map<string, string>();
    participantMap.set(sourceName, "S");
    participantMap.set(targetName, "T");

    for (const p of participants) {
      const id = `P${idx++}`;
      participantMap.set(p, id);
      lines.push(`  participant ${id} as ${this.sanitizeMermaidId(p)}`);
    }

    // Add path flows
    for (let i = 0; i < Math.min(paths.length, 3); i++) {
      const path = paths[i]!;
      lines.push(`  Note over S,T: Path ${i + 1} (confidence: ${Math.round(path.confidence * 100)}%)`);

      for (let j = 0; j < path.steps.length - 1; j++) {
        const from = path.steps[j]!;
        const to = path.steps[j + 1]!;
        const fromId = participantMap.get(from.entity) || "S";
        const toId = participantMap.get(to.entity) || "T";

        let arrow = "->>";
        if (from.awaits) arrow = "-->>"; // Async

        const label = from.condition ? `${from.action}[${from.condition}]` : from.action;
        lines.push(`  ${fromId}${arrow}${toId}: ${label}`);
      }
    }

    return lines.join("\n");
  }

  /**
   * Sanitize string for Mermaid ID
   */
  private sanitizeMermaidId(name: string): string {
    return name.replace(/[^a-zA-Z0-9_]/g, "_").substring(0, 30);
  }

  /**
   * Get entity signature for display
   */
  private getEntitySignature(entity: Entity): string {
    type Parameter = NonNullable<Entity["metadata"]["parameters"]>[number];
    const params = entity.metadata.parameters || [];
    const paramStr = params.map((p: Parameter) => `${p.name}: ${p.type || "any"}`).join(", ");
    const returnType = entity.metadata.returnType || "void";
    return `${entity.name}(${paramStr}): ${returnType}`;
  }

  // ===========================================================================
  // 10. CACHE MANAGEMENT
  // ===========================================================================

  /**
   * Clear all caches
   */
  clearCache(): void {
    this.pathBuilder.clearCache();
    this.graphologyBuilder.clear();
    this.resolveEntityCache.clear();
  }
}

// =============================================================================
// 11. EXPORTS
// =============================================================================

export default TraceEngine;
