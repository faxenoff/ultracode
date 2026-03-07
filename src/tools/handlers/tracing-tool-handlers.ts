/**
 * Tracing Tool Handlers
 *
 * MCP handlers for semantic static tracing tools:
 * - trace_flow: Trace execution from A to B
 * - trace_backwards: Find why method isn't called
 * - trace_data_flow: Track how data affects behavior
 * - analyze_state_impact: Understand state change effects
 * - find_decision_points: Identify all branching decisions
 *
 * Architecture References:
 * - Tracing Module: src/tracing/index.ts
 * - Base Handler: src/tools/base-tool-handler.ts
 */

import { z } from "zod";
import { log } from "../../logging/index.js";
import { getCachedGraphBuilder, incrementTraceUsage } from "../../tracing/graph-cache.js";
import {
  ConditionAnalyzer,
  DataFlowAnalyzer,
  OutputFormatter,
  StateTracker,
  TraceEngine,
} from "../../tracing/index.js";
import { NgRxTraceEngine } from "../../tracing/ngrx-trace-engine.js";
import type {
  AnalyzeStateImpactParams,
  FindDecisionPointsParams,
  TraceBackwardsParams,
  TraceDataFlowParams,
  TraceFlowParams,
} from "../../tracing/types.js";
import { projectPathParam } from "../base-schemas.js";
import { BaseToolHandler, type ToolContext, type ToolResult } from "../base-tool-handler.js";

// =============================================================================
// 1. SCHEMAS
// =============================================================================

const TraceFlowSchema = z.object({
  from: z.string().describe("Starting point (function/method name or semantic query)"),
  to: z.string().describe("Ending point (function/method name or semantic query)"),
  projectPath: projectPathParam,
  trackStates: z.boolean().optional().default(true).describe("Track state changes along paths"),
  trackConditions: z.boolean().optional().default(true).describe("Track conditions/branches"),
  maxDepth: z.number().optional().default(15).describe("Maximum traversal depth"),
  format: z.enum(["sequence", "tree", "graph", "mermaid"]).optional().default("sequence").describe("Output format"),
  highlightRecentChanges: z
    .boolean()
    .optional()
    .default(false)
    .describe("Annotate trace nodes with recently-changed status (Prolly Tree)"),
  recentCommitsCount: z
    .number()
    .optional()
    .default(10)
    .describe("Number of recent commits to consider for highlighting"),
});

const TraceBackwardsSchema = z.object({
  target: z.string().describe("Target method/function to analyze"),
  question: z
    .enum(["why_not_called", "what_affects", "dependencies"])
    .describe("Type of analysis: why_not_called, what_affects, or dependencies"),
  projectPath: projectPathParam,
  depth: z.number().optional().default(15).describe("Backward traversal depth"),
  includeStates: z.boolean().optional().default(true).describe("Include state dependencies"),
  includeEffects: z.boolean().optional().default(true).describe("Include side effects"),
  highlightRecentChanges: z
    .boolean()
    .optional()
    .default(false)
    .describe("Annotate trace nodes with recently-changed status (Prolly Tree)"),
  recentCommitsCount: z
    .number()
    .optional()
    .default(10)
    .describe("Number of recent commits to consider for highlighting"),
});

const TraceDataFlowSchema = z.object({
  entryPoint: z.string().describe("Entry point function (e.g., 'AppInit()')"),
  targetState: z.string().describe("Target state to trace (e.g., 'startPage')"),
  projectPath: projectPathParam,
  dataSources: z.array(z.string()).optional().describe("Data sources to analyze (auto-detected if not specified)"),
  trackTransformations: z.boolean().optional().default(true).describe("Track data transformations"),
});

const AnalyzeStateImpactSchema = z.object({
  state: z.string().describe("State variable to analyze (e.g., 'user.isAuthenticated')"),
  scenarios: z
    .array(
      z.object({
        value: z.any().describe("Value for this scenario"),
        label: z.string().describe("Human-readable label"),
      }),
    )
    .min(1)
    .describe("Scenarios to analyze"),
  projectPath: projectPathParam,
  scope: z.string().optional().describe("Scope of analysis (semantic query)"),
});

const FindDecisionPointsSchema = z.object({
  scenario: z.string().describe("Scenario to analyze (semantic query or function name)"),
  projectPath: projectPathParam,
  includeGuards: z.boolean().optional().default(true).describe("Include guard conditions"),
  includeEffects: z.boolean().optional().default(true).describe("Include side effects"),
  groupBy: z.enum(["impact", "location", "type"]).optional().default("impact").describe("How to group results"),
});

const TraceNgRxFlowSchema = z.object({
  from: z.string().describe("Starting point (component method, effect name, or action)"),
  to: z.string().describe("Ending point (component property, selector, or state property)"),
  projectPath: projectPathParam,
  maxDepth: z.number().optional().default(20).describe("Maximum traversal depth"),
  includeActions: z.boolean().optional().default(true).describe("Include intermediate action details"),
  format: z.enum(["sequence", "mermaid", "json"]).optional().default("sequence").describe("Output format"),
});

// =============================================================================
// 2. TRACE FLOW HANDLER
// =============================================================================

export class TraceFlowToolHandler extends BaseToolHandler<z.infer<typeof TraceFlowSchema>> {
  private traceEngine: TraceEngine | null = null;
  private formatter = new OutputFormatter();

  protected parseArgs(args: unknown): z.infer<typeof TraceFlowSchema> {
    return TraceFlowSchema.parse(args);
  }

  protected async execute(args: z.infer<typeof TraceFlowSchema>): Promise<ToolResult> {
    // v3: Ensure correct project context for GraphStorage queries
    const storage = await this.ensureGraphStorageForProject(args.projectPath);

    // Debug: log storage context
    type StorageWithContext = typeof storage & { getProjectContext?: () => unknown };
    const projectContext = (storage as StorageWithContext).getProjectContext?.();
    log.d("TRACEFLOW", "storage_ctx", { ctx: JSON.stringify(projectContext) });

    // Use cached graph builder for cross-call graph reuse
    const cachedBuilder = await getCachedGraphBuilder(storage);
    incrementTraceUsage(storage);
    this.traceEngine = new TraceEngine(storage, undefined, true, cachedBuilder);

    const params: TraceFlowParams = {
      from: args.from,
      to: args.to,
      trackStates: args.trackStates,
      trackConditions: args.trackConditions,
      maxDepth: args.maxDepth,
      format: args.format,
    };

    const result = await this.traceEngine.traceFlow(params);

    // Annotate nodes with recently-changed status if requested
    let recentlyChangedAnnotation:
      | {
          recentlyChangedNodes: string[];
          totalAnnotated: number;
          commitsAnalyzed: number;
        }
      | undefined;
    if (args.highlightRecentChanges) {
      const { getRecentlyChangedEntities } = await import("../../storage/prolly/recently-changed.js");
      type StorageWithAdapter = typeof storage & {
        getLibSQLAdapter?: () => import("../../storage/libsql-graph-adapter.js").LibSQLGraphAdapter | null;
      };
      const adapter = (storage as StorageWithAdapter).getLibSQLAdapter?.();
      if (adapter) {
        const recentlyChanged = await getRecentlyChangedEntities(adapter, {
          lastCommits: args.recentCommitsCount,
        });
        if (recentlyChanged) {
          const changedNodes: string[] = [];
          for (const path of result.paths) {
            for (const step of path.steps) {
              if (step.entityId && recentlyChanged.changedIds.has(step.entityId)) {
                changedNodes.push(step.entityId);
                (step as unknown as Record<string, unknown>)["recentlyChanged"] = true;
              }
            }
          }
          recentlyChangedAnnotation = {
            recentlyChangedNodes: [...new Set(changedNodes)],
            totalAnnotated: new Set(changedNodes).size,
            commitsAnalyzed: recentlyChanged.commitsAnalyzed,
          };
        }
      }
    }

    // Format output
    let output: string;
    if (args.format === "mermaid") {
      output = JSON.stringify(
        {
          success: true,
          ...result,
          ...(recentlyChangedAnnotation ? { recentlyChangedAnnotation } : {}),
          formatted: result.mermaid || this.formatter.formatTraceFlowAsMermaid(result),
        },
        null,
        2,
      );
    } else {
      type ResultWithDebug = typeof result & { _debug?: unknown };
      output = JSON.stringify(
        {
          success: true,
          ...result,
          ...(recentlyChangedAnnotation ? { recentlyChangedAnnotation } : {}),
          formatted: this.formatter.formatTraceFlowAsText(result),
          // Include debug info if present
          _debug: (result as ResultWithDebug)._debug,
        },
        null,
        2,
      );
    }

    return {
      content: [{ type: "text", text: output }],
    };
  }
}

// =============================================================================
// 3. TRACE BACKWARDS HANDLER
// =============================================================================

export class TraceBackwardsToolHandler extends BaseToolHandler<z.infer<typeof TraceBackwardsSchema>> {
  private traceEngine: TraceEngine | null = null;
  private formatter = new OutputFormatter();

  protected parseArgs(args: unknown): z.infer<typeof TraceBackwardsSchema> {
    return TraceBackwardsSchema.parse(args);
  }

  protected async execute(args: z.infer<typeof TraceBackwardsSchema>): Promise<ToolResult> {
    // v3: Ensure correct project context for GraphStorage queries
    const storage = await this.ensureGraphStorageForProject(args.projectPath);

    // Use cached graph builder for cross-call graph reuse
    const cachedBuilder = await getCachedGraphBuilder(storage);
    incrementTraceUsage(storage);
    this.traceEngine = new TraceEngine(storage, undefined, true, cachedBuilder);

    const params: TraceBackwardsParams = {
      target: args.target,
      question: args.question,
      depth: args.depth,
      includeStates: args.includeStates,
      includeEffects: args.includeEffects,
    };

    const result = await this.traceEngine.traceBackwards(params);

    // Annotate callers with recently-changed status if requested
    let recentlyChangedAnnotation:
      | {
          recentlyChangedNodes: string[];
          totalAnnotated: number;
          commitsAnalyzed: number;
        }
      | undefined;
    if (args.highlightRecentChanges) {
      const { getRecentlyChangedEntities } = await import("../../storage/prolly/recently-changed.js");
      type StorageWithAdapter = typeof storage & {
        getLibSQLAdapter?: () => import("../../storage/libsql-graph-adapter.js").LibSQLGraphAdapter | null;
      };
      const adapter = (storage as StorageWithAdapter).getLibSQLAdapter?.();
      if (adapter) {
        const recentlyChanged = await getRecentlyChangedEntities(adapter, {
          lastCommits: args.recentCommitsCount,
        });
        if (recentlyChanged) {
          const changedNodes: string[] = [];
          for (const caller of result.callers) {
            if (caller.entityId && recentlyChanged.changedIds.has(caller.entityId)) {
              changedNodes.push(caller.entityId);
              (caller as unknown as Record<string, unknown>)["recentlyChanged"] = true;
            }
          }
          recentlyChangedAnnotation = {
            recentlyChangedNodes: [...new Set(changedNodes)],
            totalAnnotated: new Set(changedNodes).size,
            commitsAnalyzed: recentlyChanged.commitsAnalyzed,
          };
        }
      }
    }

    const output = JSON.stringify(
      {
        success: true,
        ...result,
        ...(recentlyChangedAnnotation ? { recentlyChangedAnnotation } : {}),
        formatted: this.formatter.formatTraceBackwardsAsText(result),
      },
      null,
      2,
    );

    return {
      content: [{ type: "text", text: output }],
    };
  }
}

// =============================================================================
// 4. TRACE DATA FLOW HANDLER
// =============================================================================

export class TraceDataFlowToolHandler extends BaseToolHandler<z.infer<typeof TraceDataFlowSchema>> {
  private dataFlowAnalyzer: DataFlowAnalyzer | null = null;
  private formatter = new OutputFormatter();

  protected parseArgs(args: unknown): z.infer<typeof TraceDataFlowSchema> {
    return TraceDataFlowSchema.parse(args);
  }

  protected async execute(args: z.infer<typeof TraceDataFlowSchema>): Promise<ToolResult> {
    // v3: Ensure correct project context for GraphStorage queries
    const storage = await this.ensureGraphStorageForProject(args.projectPath);

    // SemanticAgent doesn't expose getSearchService() - pass undefined for now
    // DataFlowAnalyzer will work without semantic search (optional parameter)
    this.dataFlowAnalyzer = new DataFlowAnalyzer(storage, undefined);

    const params: TraceDataFlowParams = {
      entryPoint: args.entryPoint,
      targetState: args.targetState,
      ...(args.dataSources != null ? { dataSources: args.dataSources } : {}),
      trackTransformations: args.trackTransformations,
    };

    const result = await this.dataFlowAnalyzer.traceDataFlow(params);

    const output = JSON.stringify(
      {
        success: true,
        ...result,
        formatted: this.formatter.formatDataFlowAsText(result),
        nextSteps: [
          "taint_analysis() — security-focused analysis of the same data flows",
          "analyze_state_chaos() — detect state management issues in traced flow",
        ],
      },
      null,
      2,
    );

    return {
      content: [{ type: "text", text: output }],
    };
  }
}

// =============================================================================
// 5. ANALYZE STATE IMPACT HANDLER
// =============================================================================

export class AnalyzeStateImpactToolHandler extends BaseToolHandler<z.infer<typeof AnalyzeStateImpactSchema>> {
  private stateTracker: StateTracker | null = null;
  private formatter = new OutputFormatter();

  protected parseArgs(args: unknown): z.infer<typeof AnalyzeStateImpactSchema> {
    return AnalyzeStateImpactSchema.parse(args);
  }

  protected async execute(args: z.infer<typeof AnalyzeStateImpactSchema>): Promise<ToolResult> {
    // v3: Ensure correct project context for GraphStorage queries
    const storage = await this.ensureGraphStorageForProject(args.projectPath);
    this.stateTracker = new StateTracker(storage);

    const params: AnalyzeStateImpactParams = {
      state: args.state,
      scenarios: args.scenarios,
      scope: args.scope,
    };

    const result = await this.stateTracker.analyzeStateImpact(params);

    const output = JSON.stringify(
      {
        success: true,
        ...result,
        formatted: this.formatter.formatStateImpactAsText(result),
      },
      null,
      2,
    );

    return {
      content: [{ type: "text", text: output }],
    };
  }
}

// =============================================================================
// 6. FIND DECISION POINTS HANDLER
// =============================================================================

export class FindDecisionPointsToolHandler extends BaseToolHandler<z.infer<typeof FindDecisionPointsSchema>> {
  private conditionAnalyzer: ConditionAnalyzer | null = null;
  private formatter = new OutputFormatter();

  protected parseArgs(args: unknown): z.infer<typeof FindDecisionPointsSchema> {
    return FindDecisionPointsSchema.parse(args);
  }

  protected async execute(args: z.infer<typeof FindDecisionPointsSchema>): Promise<ToolResult> {
    // v3: Ensure correct project context for GraphStorage queries
    const storage = await this.ensureGraphStorageForProject(args.projectPath);
    this.conditionAnalyzer = new ConditionAnalyzer(storage);

    const params: FindDecisionPointsParams = {
      scenario: args.scenario,
      includeGuards: args.includeGuards,
      includeEffects: args.includeEffects,
      groupBy: args.groupBy,
    };

    const result = await this.conditionAnalyzer.findDecisionPoints(params);

    const output = JSON.stringify(
      {
        success: true,
        ...result,
        formatted: this.formatter.formatDecisionPointsAsText(result),
      },
      null,
      2,
    );

    return {
      content: [{ type: "text", text: output }],
    };
  }
}

// =============================================================================
// 7. TRACE NgRx FLOW HANDLER
// =============================================================================

export class TraceNgRxFlowToolHandler extends BaseToolHandler<z.infer<typeof TraceNgRxFlowSchema>> {
  private ngrxEngine: NgRxTraceEngine | null = null;

  protected parseArgs(args: unknown): z.infer<typeof TraceNgRxFlowSchema> {
    return TraceNgRxFlowSchema.parse(args);
  }

  protected async execute(args: z.infer<typeof TraceNgRxFlowSchema>): Promise<ToolResult> {
    // v3: Ensure correct project context for GraphStorage queries
    const storage = await this.ensureGraphStorageForProject(args.projectPath);

    this.ngrxEngine = new NgRxTraceEngine(storage);

    const result = await this.ngrxEngine.traceNgRxFlow({
      from: args.from,
      to: args.to,
      maxDepth: args.maxDepth,
      includeActions: args.includeActions,
      format: args.format,
    });

    // Format output
    let output: string;
    if (args.format === "mermaid") {
      output = JSON.stringify(
        {
          success: true,
          ...result,
          formatted: result.mermaid || "No paths found",
        },
        null,
        2,
      );
    } else {
      // Generate text format
      const lines: string[] = [];
      lines.push(`NgRx Flow: ${args.from} → ${args.to}`);
      lines.push(`Found ${result.paths.length} path(s)\n`);

      for (const path of result.paths) {
        lines.push(`Path ${path.id} (confidence: ${Math.round(path.confidence * 100)}%)`);
        lines.push(`Summary: ${path.summary}`);
        lines.push("Steps:");
        for (const step of path.steps) {
          lines.push(`  ${step.order}. [${step.type}] ${step.description}`);
          lines.push(`     File: ${step.file}:${step.line}`);
        }
        lines.push("");
      }

      lines.push("Action Flow:");
      lines.push(`  Dispatched: ${result.actionFlow.dispatched.join(", ") || "none"}`);
      lines.push(`  Handled: ${result.actionFlow.handled.join(", ") || "none"}`);
      lines.push(`  State Changes: ${result.actionFlow.stateChanges.join(", ") || "none"}`);

      output = JSON.stringify(
        {
          success: true,
          ...result,
          formatted: lines.join("\n"),
        },
        null,
        2,
      );
    }

    return {
      content: [{ type: "text", text: output }],
    };
  }
}

// =============================================================================
// 8. FACTORY FUNCTION
// =============================================================================

/**
 * Create all tracing tool handlers
 */
export function createTracingToolHandlers(context: ToolContext): Map<string, BaseToolHandler<unknown>> {
  const handlers = new Map<string, BaseToolHandler<unknown>>();
  handlers.set("trace_flow", new TraceFlowToolHandler(context));
  handlers.set("trace_backwards", new TraceBackwardsToolHandler(context));
  handlers.set("trace_data_flow", new TraceDataFlowToolHandler(context));
  handlers.set("analyze_state_impact", new AnalyzeStateImpactToolHandler(context));
  handlers.set("find_decision_points", new FindDecisionPointsToolHandler(context));
  handlers.set("trace_ngrx_flow", new TraceNgRxFlowToolHandler(context));
  return handlers;
}

// =============================================================================
// 8. TOOL DEFINITIONS FOR MCP
// =============================================================================

export const TRACING_TOOL_DEFINITIONS = [
  {
    name: "trace_flow",
    description: `Trace execution flow from point A to point B in the codebase.

Finds all possible paths and analyzes:
- State changes along each path
- Conditions and branches
- Async boundaries
- Call sequences

Example: trace_flow(from: "handleLogin", to: "redirectToHome")

Returns paths with confidence scores, state changes, and Mermaid diagrams.`,
    inputSchema: {
      type: "object" as const,
      properties: {
        from: { type: "string", description: "Starting point (function/method name or semantic query)" },
        to: { type: "string", description: "Ending point (function/method name or semantic query)" },
        trackStates: { type: "boolean", description: "Track state changes along paths", default: true },
        trackConditions: { type: "boolean", description: "Track conditions/branches", default: true },
        maxDepth: { type: "number", description: "Maximum traversal depth", default: 15 },
        format: {
          type: "string",
          enum: ["sequence", "tree", "graph", "mermaid"],
          description: "Output format",
          default: "sequence",
        },
        projectPath: { type: "string", description: "Project directory path. If not specified, uses current project." },
      },
      required: ["from", "to"],
    },
  },
  {
    name: "trace_backwards",
    description: `Trace backwards from a method to find why it might not be called.

Analysis types:
- why_not_called: Find blocking conditions and missing callers
- what_affects: Identify all dependencies
- dependencies: Full dependency graph

Example: trace_backwards(target: "FinishTask", question: "why_not_called")

Returns callers, blocking conditions, state dependencies, and diagnosis.`,
    inputSchema: {
      type: "object" as const,
      properties: {
        target: { type: "string", description: "Target method/function to analyze" },
        question: {
          type: "string",
          enum: ["why_not_called", "what_affects", "dependencies"],
          description: "Type of analysis",
        },
        depth: { type: "number", description: "Backward traversal depth", default: 15 },
        includeStates: { type: "boolean", description: "Include state dependencies", default: true },
        includeEffects: { type: "boolean", description: "Include side effects", default: true },
        projectPath: { type: "string", description: "Project directory path. If not specified, uses current project." },
      },
      required: ["target", "question"],
    },
  },
  {
    name: "trace_data_flow",
    description: `Trace how data flows from sources to affect a target state.

Identifies:
- Data sources (API, storage, props, config)
- Transformations (parse, map, validate)
- Branching based on data values
- Behavior matrix for different inputs

Example: trace_data_flow(entryPoint: "AppInit", targetState: "startPage")

Returns data flows, critical conditions, and behavior combinations.`,
    inputSchema: {
      type: "object" as const,
      properties: {
        entryPoint: { type: "string", description: "Entry point function" },
        targetState: { type: "string", description: "Target state to trace" },
        dataSources: {
          type: "array",
          items: { type: "string" },
          description: "Data sources to analyze (auto-detected if not specified)",
        },
        trackTransformations: { type: "boolean", description: "Track data transformations", default: true },
        projectPath: { type: "string", description: "Project directory path. If not specified, uses current project." },
      },
      required: ["entryPoint", "targetState"],
    },
  },
  {
    name: "analyze_state_impact",
    description: `Analyze the impact of a state variable across different scenarios.

Analyzes:
- All usages of the state
- Reachable/blocked paths per scenario
- Enabled features
- Conflicts and race conditions
- Ripple effects

Example: analyze_state_impact(state: "isAuthenticated", scenarios: [{value: true, label: "logged in"}, {value: false, label: "logged out"}])

Returns usage analysis, scenario comparisons, and conflict detection.`,
    inputSchema: {
      type: "object" as const,
      properties: {
        state: { type: "string", description: "State variable to analyze" },
        scenarios: {
          type: "array",
          items: {
            type: "object",
            properties: {
              value: { description: "Value for this scenario" },
              label: { type: "string", description: "Human-readable label" },
            },
            required: ["value", "label"],
          },
          description: "Scenarios to analyze",
          minItems: 1,
        },
        scope: { type: "string", description: "Scope of analysis (semantic query)" },
        projectPath: { type: "string", description: "Project directory path. If not specified, uses current project." },
      },
      required: ["state", "scenarios"],
    },
  },
  {
    name: "find_decision_points",
    description: `Find all decision points in a scenario's execution flow.

Decision point types:
- validation: Input validation
- api_response: API response handling
- state_mutation: State changes
- guard: Guard conditions
- loop: Loop control
- error_handling: try-catch
- feature_flag: Feature toggles

Example: find_decision_points(scenario: "user checkout flow")

Returns decision points grouped by impact with Mermaid flowchart.`,
    inputSchema: {
      type: "object" as const,
      properties: {
        scenario: { type: "string", description: "Scenario to analyze" },
        includeGuards: { type: "boolean", description: "Include guard conditions", default: true },
        includeEffects: { type: "boolean", description: "Include side effects", default: true },
        groupBy: {
          type: "string",
          enum: ["impact", "location", "type"],
          description: "How to group results",
          default: "impact",
        },
        projectPath: { type: "string", description: "Project directory path. If not specified, uses current project." },
      },
      required: ["scenario"],
    },
  },
  {
    name: "trace_ngrx_flow",
    description: `Trace NgRx/Redux event-driven flow from action dispatch to state subscription.

**IMPORTANT**: Use this for Angular projects with NgRx state management instead of trace_flow.
Standard trace_flow cannot follow NgRx event-driven relationships.

Follows the NgRx chain:
1. Component/Effect dispatches action
2. Effect listens via ofType()
3. Effect dispatches new action
4. Reducer handles action via on()
5. Reducer modifies state
6. Selector reads state
7. Component subscribes via select()

Example: trace_ngrx_flow(from: "MobileTaskEffects.postMessages2$", to: "TestEndComponent.setCompleteContent")

Returns:
- Flow paths through NgRx entities
- Action chain (all actions traversed)
- State changes made
- Mermaid sequence diagram`,
    inputSchema: {
      type: "object" as const,
      properties: {
        from: { type: "string", description: "Starting point (component method, effect name, or action)" },
        to: { type: "string", description: "Ending point (component property, selector, or state property)" },
        maxDepth: { type: "number", description: "Maximum traversal depth", default: 20 },
        includeActions: { type: "boolean", description: "Include intermediate action details", default: true },
        format: {
          type: "string",
          enum: ["sequence", "mermaid", "json"],
          description: "Output format",
          default: "sequence",
        },
        projectPath: { type: "string", description: "Project directory path. If not specified, uses current project." },
      },
      required: ["from", "to"],
    },
  },
];
