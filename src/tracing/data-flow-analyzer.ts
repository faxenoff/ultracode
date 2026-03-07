/**
 * Data Flow Analyzer for Semantic Tracing
 *
 * Traces how data flows through the codebase from sources to targets.
 * Identifies transformations, branches, and decision points.
 *
 * Architecture References:
 * - Tracing Types: src/tracing/types.ts
 * - State Tracker: src/tracing/state-tracker.ts
 */

import type { Entity, GraphStorage } from "../types/storage.js";
import { RelationType } from "../types/storage.js";
import { StateTracker } from "./state-tracker.js";
import type {
  BehaviorCombination,
  DataFlow,
  DataFlowActionType,
  DataFlowStep,
  TraceDataFlowParams,
  TraceDataFlowResult,
} from "./types.js";

// Local interface for semantic search (to avoid circular dependency)
interface SemanticSearchService {
  search(query: string, options: { limit: number; minSimilarity: number }): Promise<Array<{ entityId: string }>>;
}

// =============================================================================
// 1. CONSTANTS
// =============================================================================

const DEFAULT_MAX_DEPTH = 15;

// Data source patterns
const DATA_SOURCE_PATTERNS = {
  API: /fetch|axios|http|request|api/i,
  STORAGE: /localStorage|sessionStorage|cookie|database|db/i,
  PROPS: /props|input|param/i,
  STATE: /state|store|redux|context/i,
  CONFIG: /config|settings|env|options/i,
  USER_INPUT: /input|form|event|click/i,
};

// Transformation patterns
const TRANSFORM_PATTERNS = {
  PARSE: /parse|decode|deserialize|from(JSON|XML|YAML)/i,
  MAP: /\.map\(|\.reduce\(|\.filter\(|transform/i,
  VALIDATE: /valid|check|verify|assert|ensure/i,
  NORMALIZE: /normaliz|sanitiz|clean|format/i,
  MERGE: /merge|combine|assign|spread/i,
};

// =============================================================================
// 2. DATA FLOW ANALYZER CLASS
// =============================================================================

export class DataFlowAnalyzer {
  private storage: GraphStorage;
  private semanticSearch?: SemanticSearchService | undefined;
  private stateTracker: StateTracker;

  constructor(storage: GraphStorage, semanticSearch?: SemanticSearchService) {
    this.storage = storage;
    this.semanticSearch = semanticSearch;
    this.stateTracker = new StateTracker(storage);
  }

  // ===========================================================================
  // 3. MAIN ANALYSIS
  // ===========================================================================

  /**
   * Trace data flow from entry point to target state
   */
  async traceDataFlow(params: TraceDataFlowParams): Promise<TraceDataFlowResult> {
    const { entryPoint, targetState, dataSources, trackTransformations = true } = params;

    // 1. Find entry point entity
    const entryEntity = await this.findEntity(entryPoint);
    if (!entryEntity) {
      throw new Error(`Entry point not found: ${entryPoint}`);
    }

    // 2. Identify data sources
    const sources = dataSources && dataSources.length > 0 ? dataSources : await this.identifyDataSources(entryEntity);

    // 3. Trace each data source
    const dataFlows: DataFlow[] = [];
    const allCriticalConditions = new Set<string>();

    for (const source of sources) {
      const flow = await this.traceSourceToTarget(source, targetState, entryEntity, trackTransformations);

      if (flow) {
        dataFlows.push(flow);
        for (const cond of flow.criticalConditions) {
          allCriticalConditions.add(cond);
        }
      }
    }

    // 4. Build behavior matrix
    const behaviorMatrix = await this.buildBehaviorMatrix(dataFlows, targetState);

    // 5. Calculate summary
    const summary = {
      dataSourcesAnalyzed: sources.length,
      branchingPoints: dataFlows.reduce((sum, f) => sum + f.flow.filter((s) => s.action === "branch").length, 0),
      possibleOutcomes: behaviorMatrix.combinations.length,
      criticalDecisions: Array.from(allCriticalConditions),
    };

    return {
      entryPoint,
      targetState,
      dataFlows,
      behaviorMatrix,
      summary,
    };
  }

  // ===========================================================================
  // 4. DATA SOURCE IDENTIFICATION
  // ===========================================================================

  /**
   * Identify data sources from entry point
   */
  private async identifyDataSources(entryEntity: Entity): Promise<string[]> {
    const sources: string[] = [];
    const meta = entryEntity.metadata as Record<string, any>;

    // Parameters are data sources
    if (Array.isArray(meta["parameters"])) {
      for (const param of meta["parameters"]) {
        sources.push(param.name);
      }
    }

    // Check calls for data fetching
    if (Array.isArray(meta["calls"])) {
      for (const call of meta["calls"]) {
        const sourceType = this.classifyDataSource(call.name);
        if (sourceType) {
          sources.push(`${sourceType}:${call.name}`);
        }
      }
    }

    // Check state reads
    if (Array.isArray(meta["stateReads"])) {
      for (const state of meta["stateReads"]) {
        sources.push(`state:${state}`);
      }
    }

    return sources;
  }

  /**
   * Classify a call as a data source type
   */
  private classifyDataSource(callName: string): string | null {
    for (const [type, pattern] of Object.entries(DATA_SOURCE_PATTERNS)) {
      if (pattern.test(callName)) {
        return type.toLowerCase();
      }
    }
    return null;
  }

  // ===========================================================================
  // 5. FLOW TRACING
  // ===========================================================================

  /**
   * Trace data flow from a source to target
   */
  private async traceSourceToTarget(
    source: string,
    targetState: string,
    entryEntity: Entity,
    trackTransformations: boolean,
  ): Promise<DataFlow | null> {
    const flow: DataFlowStep[] = [];
    const criticalConditions: string[] = [];
    const visited = new Set<string>();

    // Start with entry entity
    let currentEntity: Entity | null = entryEntity;
    let stepOrder = 1;
    let currentData = source;

    while (currentEntity && stepOrder <= DEFAULT_MAX_DEPTH) {
      if (visited.has(currentEntity.id)) break;
      visited.add(currentEntity.id);

      const meta = currentEntity.metadata as Record<string, any>;

      // Check for data transformations
      if (trackTransformations && Array.isArray(meta["calls"])) {
        for (const call of meta["calls"]) {
          const transformType = this.classifyTransformation(call.name);
          if (transformType) {
            flow.push({
              step: stepOrder++,
              location: `${currentEntity.filePath}:${currentEntity.location.start.line}`,
              action: transformType,
              input: currentData,
              output: `transformed(${currentData})`,
              transformation: call.name,
            });
            currentData = `transformed(${currentData})`;
          }
        }
      }

      // Check for branching based on data
      if (meta["controlFlow"]?.branches && Array.isArray(meta["controlFlow"].branches)) {
        for (const branch of meta["controlFlow"].branches) {
          if (this.conditionInvolvesData(branch.condition, source)) {
            flow.push({
              step: stepOrder++,
              location: `${currentEntity.filePath}:${currentEntity.location.start.line}`,
              action: "branch",
              condition: branch.condition,
              branches: {
                true: branch.target || "continue",
                false: "skip",
              },
            });
            criticalConditions.push(branch.condition);
          }
        }
      }

      // Check if we reached target state
      if (Array.isArray(meta["stateModifications"]) && meta["stateModifications"].includes(targetState)) {
        flow.push({
          step: stepOrder++,
          location: `${currentEntity.filePath}:${currentEntity.location.start.line}`,
          action: "setState",
          input: currentData,
          output: targetState,
        });
        break;
      }

      // Follow calls to next entity
      const nextEntity = await this.findNextInFlow(currentEntity, currentData);
      currentEntity = nextEntity;
    }

    // Check if we actually affect the target
    const affectsTarget = flow.some((s) => s.action === "setState" && s.output === targetState);

    if (flow.length === 0) {
      return null;
    }

    return {
      source,
      flow,
      affectsTarget,
      criticalConditions,
    };
  }

  /**
   * Classify transformation type
   */
  private classifyTransformation(callName: string): DataFlowActionType | null {
    for (const [type, pattern] of Object.entries(TRANSFORM_PATTERNS)) {
      if (pattern.test(callName)) {
        switch (type) {
          case "PARSE":
            return "parse";
          case "MAP":
            return "transform";
          case "VALIDATE":
            return "validate";
          default:
            return "transform";
        }
      }
    }
    return null;
  }

  /**
   * Check if condition involves specific data
   */
  private conditionInvolvesData(condition: string, data: string): boolean {
    if (!condition || !data) return false;

    // Extract variable name from data source
    const dataVar = data.split(":").pop() || data;

    return condition.toLowerCase().includes(dataVar.toLowerCase());
  }

  /**
   * Find next entity in data flow
   */
  private async findNextInFlow(currentEntity: Entity, data: string): Promise<Entity | null> {
    const rels = await this.storage.getRelationshipsForEntity(currentEntity.id, RelationType.CALLS);

    for (const rel of rels) {
      if (rel.fromId === currentEntity.id) {
        const callee = await this.storage.getEntity(rel.toId);
        if (callee) {
          // Check if this call involves our data
          const callMeta = rel.metadata as Record<string, any> | undefined;
          if (
            (Array.isArray(callMeta?.["arguments"]) && callMeta["arguments"].includes(data)) ||
            this.entityHandlesData(callee, data)
          ) {
            return callee;
          }
        }
      }
    }

    return null;
  }

  /**
   * Check if entity handles specific data
   */
  private entityHandlesData(entity: Entity, data: string): boolean {
    const meta = entity.metadata as Record<string, any>;
    const dataVar = data.split(":").pop() || data;

    // Check parameters
    if (
      Array.isArray(meta["parameters"]) &&
      meta["parameters"].some(
        (p: unknown) =>
          p !== null &&
          typeof p === "object" &&
          "name" in p &&
          typeof (p as { name: unknown }).name === "string" &&
          (p as { name: string }).name.toLowerCase().includes(dataVar.toLowerCase()),
      )
    ) {
      return true;
    }

    // Check state reads/writes
    if (
      Array.isArray(meta["stateReads"]) &&
      meta["stateReads"].some((s: string) => s.toLowerCase().includes(dataVar.toLowerCase()))
    ) {
      return true;
    }

    return false;
  }

  // ===========================================================================
  // 6. BEHAVIOR MATRIX
  // ===========================================================================

  /**
   * Build behavior matrix showing input/output combinations
   */
  private async buildBehaviorMatrix(
    flows: DataFlow[],
    targetState: string,
  ): Promise<{ combinations: BehaviorCombination[] }> {
    const combinations: BehaviorCombination[] = [];

    // Collect all branching conditions
    const allConditions: Array<{ source: string; condition: string }> = [];

    for (const flow of flows) {
      for (const step of flow.flow) {
        if (step.action === "branch" && step.condition) {
          allConditions.push({
            source: flow.source,
            condition: step.condition,
          });
        }
      }
    }

    // Generate combinations (limit to prevent explosion)
    const maxCombinations = Math.min(2 ** allConditions.length, 16);

    for (let i = 0; i < maxCombinations; i++) {
      const inputs: Record<string, unknown> = {};
      const pathParts: string[] = [];

      // Set condition values based on binary representation
      for (let j = 0; j < allConditions.length; j++) {
        const cond = allConditions[j]!;
        const value = (i & (1 << j)) !== 0;
        inputs[`${cond.source}:${cond.condition}`] = value;
        pathParts.push(`${cond.condition}=${value}`);
      }

      // Determine result based on which flows affect target
      const result: Record<string, unknown> = {};
      let targetReached = false;

      for (const flow of flows) {
        if (flow.affectsTarget) {
          // Check if this flow would execute given conditions
          const wouldExecute = this.evaluateFlowWithConditions(flow, inputs);
          if (wouldExecute) {
            result[targetState] = `from ${flow.source}`;
            targetReached = true;
          }
        }
      }

      if (!targetReached) {
        result[targetState] = "unchanged";
      }

      combinations.push({
        inputs,
        result,
        path: pathParts.join(" → "),
      });
    }

    return { combinations };
  }

  /**
   * Evaluate if a flow would execute with given conditions
   */
  private evaluateFlowWithConditions(flow: DataFlow, conditions: Record<string, unknown>): boolean {
    for (const step of flow.flow) {
      if (step.action === "branch" && step.condition) {
        const key = `${flow.source}:${step.condition}`;
        const conditionValue = conditions[key];

        // If condition is false, flow might be blocked
        if (conditionValue === false) {
          // Check if false branch continues or blocks
          if (step.branches?.["false"] === "skip" || step.branches?.["false"] === "return") {
            return false;
          }
        }
      }
    }

    return true;
  }

  // ===========================================================================
  // 7. UTILITY METHODS
  // ===========================================================================

  /**
   * Find entity by name or pattern
   */
  private async findEntity(nameOrPattern: string): Promise<Entity | null> {
    // Try exact match
    const entities = await this.storage.searchEntities({
      namePattern: nameOrPattern,
    });

    if (entities.length > 0) {
      return entities[0]!;
    }

    // Try semantic search if available
    if (this.semanticSearch) {
      try {
        const results = await this.semanticSearch.search(nameOrPattern, {
          limit: 1,
          minSimilarity: 0.6,
        });
        if (results.length > 0) {
          return this.storage.getEntity(results[0]!.entityId);
        }
      } catch {
        // Semantic search not available
      }
    }

    return null;
  }

  /**
   * Clear caches
   */
  clearCache(): void {
    this.stateTracker.clearCache();
  }
}

// =============================================================================
// 8. EXPORTS
// =============================================================================

export default DataFlowAnalyzer;
