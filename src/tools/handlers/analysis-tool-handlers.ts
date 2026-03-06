/**
 * Analysis Tool Handlers
 *
 * Handlers for code analysis operations:
 * - suggest_refactoring
 * - analyze_hotspots
 * - find_related_concepts
 * - analyze_state_chaos
 * - analyze_code_impact
 * - detect_technology_stack
 */

import { execSync } from "node:child_process";
import { z } from "zod";
import type { TechnologyStack } from "../../analysis/technology-detector.js";
import { log } from "../../logging/index.js";
import type { GraphStorageLibSQL } from "../../storage/graph-storage-libsql.js";
import { TimeTravelManager } from "../../storage/prolly/index.js";
import type { RefactoringSuggestion } from "../../types/semantic.js";
import type { Entity } from "../../types/storage.js";
import { toError } from "../../utils/error-handling.js";
import { projectPathParam } from "../base-schemas.js";
import { BaseToolHandler, type ToolResult } from "../base-tool-handler.js";
import { MAX_PAGE_SIZE, paginate, SAFE_LIMITS } from "../response-limits.js";

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

/**
 * Refactoring suggestion output format for API response
 */
interface RefactoringSuggestionOutput {
  type: string;
  impact: string;
  confidence: number;
  description: string;
  entityId?: string | undefined;
  filePath?: string | undefined;
  suggestedCode?: string | undefined;
}

/**
 * Code hotspot with metrics
 */
interface Hotspot {
  id: string;
  name: string;
  type: string;
  filePath?: string;
  score: number;
  metrics: HotspotMetrics;
}

/**
 * Hotspot metrics
 */
interface HotspotMetrics {
  linesOfCode?: number;
  cyclomaticComplexity?: number;
  cognitiveComplexity?: number;
  nestingDepth?: number;
  parameterCount?: number;
  changeFrequency?: number;
  changeFrequencyScore?: number;
  changeSource?: "prolly" | "git" | "none";
  couplingScore?: number;
  dependencyCount?: number;
}

/**
 * Parsed entity from GraphStorage
 */
interface ParsedEntity {
  id: string;
  name: string;
  type: string;
  filePath?: string;
  code?: string;
  location?: {
    start?: { line?: number };
    end?: { line?: number };
  };
  metadata?: {
    metrics?: HotspotMetrics;
    isStateful?: boolean;
    [key: string]: unknown;
  };
}

// TechnologyStack imported from technology-detector.ts

// =============================================================================
// SUGGEST REFACTORING
// =============================================================================

const SuggestRefactoringSchema = z.object({
  entityId: z.string().optional(),
  filePath: z.string().optional(),
  projectPath: projectPathParam,
  type: z.enum(["extract_method", "rename", "move", "simplify", "all"]).optional().default("all"),
  offset: z.number().optional().default(0),
  limit: z.number().optional().default(SAFE_LIMITS.searchResults),
});

export class SuggestRefactoringToolHandler extends BaseToolHandler<z.infer<typeof SuggestRefactoringSchema>> {
  protected parseArgs(args: unknown) {
    return SuggestRefactoringSchema.parse(args);
  }

  protected async execute(args: z.infer<typeof SuggestRefactoringSchema>): Promise<ToolResult> {
    const storage = await this.ensureGraphStorageForProject(args.projectPath);
    const semanticAgent = await this.context.getSemanticAgent();
    const safeLimit = Math.min(args.limit, MAX_PAGE_SIZE);

    // Get code from entity or file
    let code: string | undefined;
    const targetEntityId = args.entityId;
    let targetFilePath = args.filePath ? this.context.normalizeInputPath(args.filePath) : undefined;

    if (args.entityId) {
      // Get entity to find its file path
      const entity = await storage.getEntity(args.entityId);
      if (entity?.filePath) {
        targetFilePath = entity.filePath;
      }
    }

    if (!code && targetFilePath) {
      // Read file content
      try {
        const { readFile } = await import("node:fs/promises");
        code = await readFile(targetFilePath, "utf-8");
      } catch {
        return {
          content: [{ type: "text", text: JSON.stringify({ error: `Cannot read file: ${targetFilePath}` }) }],
        };
      }
    }

    if (!code) {
      return {
        content: [{ type: "text", text: JSON.stringify({ error: "No code found. Provide entityId or filePath." }) }],
      };
    }

    // suggestRefactoring expects a code string
    const allSuggestions = await semanticAgent.suggestRefactoring(code);

    const paginatedResult = paginate(allSuggestions, args.offset, safeLimit);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              entityId: targetEntityId,
              filePath: targetFilePath,
              suggestionsFound: paginatedResult.data.length,
              pagination: paginatedResult.pagination,
              suggestions: paginatedResult.data.map(
                (s: RefactoringSuggestion): RefactoringSuggestionOutput => ({
                  type: s.type,
                  impact: s.impact,
                  confidence: s.confidence,
                  description: s.description,
                  entityId: targetEntityId,
                  filePath: targetFilePath,
                  suggestedCode: s.code,
                }),
              ),
            },
            null,
            2,
          ),
        },
      ],
    };
  }
}

// =============================================================================
// ANALYZE HOTSPOTS
// =============================================================================

const AnalyzeHotspotsSchema = z.object({
  projectPath: projectPathParam,
  metric: z.enum(["complexity", "changes", "coupling", "all"]).optional().default("complexity"),
  offset: z.number().optional().default(0),
  limit: z.number().optional().default(SAFE_LIMITS.hotspots),
  includeHistoricalMetrics: z
    .boolean()
    .optional()
    .default(true)
    .describe("Use Prolly Tree history for changeFrequency calculation"),
  lookbackDays: z.number().optional().default(30).describe("Number of days to look back for change frequency"),
});

export class AnalyzeHotspotsToolHandler extends BaseToolHandler<z.infer<typeof AnalyzeHotspotsSchema>> {
  // Cache for change frequency to avoid redundant calculations within same execution
  private changeFrequencyCache = new Map<string, { changeCount: number; source: "prolly" | "git" | "none" }>();

  protected parseArgs(args: unknown) {
    return AnalyzeHotspotsSchema.parse(args);
  }

  protected async execute(args: z.infer<typeof AnalyzeHotspotsSchema>): Promise<ToolResult> {
    // Clear cache for fresh execution
    this.changeFrequencyCache.clear();

    // v3: Ensure correct project context for GraphStorage queries
    const storage = (await this.ensureGraphStorageForProject(args.projectPath)) as GraphStorageLibSQL;
    const safeLimit = Math.min(args.limit, MAX_PAGE_SIZE);

    // Get all entities (limited to prevent memory issues)
    const entities = await storage.findEntities({ filters: {}, limit: 5000 });

    // Pre-calculate change frequencies if using historical metrics with "changes" or "all"
    const needsHistory = args.includeHistoricalMetrics && (args.metric === "changes" || args.metric === "all");

    if (needsHistory) {
      await this.preloadChangeFrequencies(entities, storage, args.lookbackDays);
    }

    // Analyze hotspots based on metric
    const hotspots: Hotspot[] = [];

    for (const entity of entities) {
      const { score, changeMetrics } = this.calculateHotspotScore(entity, args.metric, args.includeHistoricalMetrics);
      if (score > 0) {
        // Get metrics or calculate basic ones from location
        const storedMetrics = (entity.metadata?.["metrics"] ?? {}) as Partial<HotspotMetrics>;
        const storedLinesOfCode = storedMetrics.linesOfCode;
        const linesOfCode: number | undefined =
          storedLinesOfCode ??
          (entity.location?.end?.line && entity.location?.start?.line
            ? entity.location.end.line - entity.location.start.line + 1
            : undefined);

        hotspots.push({
          id: entity.id,
          name: entity.name,
          type: entity.type,
          filePath: entity.filePath,
          score: Math.round(score * 100) / 100,
          metrics: {
            ...storedMetrics,
            ...(linesOfCode !== undefined && storedLinesOfCode === undefined ? { linesOfCode } : {}),
            ...changeMetrics,
          },
        });
      }
    }

    // Sort by score
    hotspots.sort((a, b) => b.score - a.score);

    // Apply pagination to sorted results
    const paginatedResult = paginate(hotspots, args.offset, safeLimit);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              metric: args.metric,
              includeHistoricalMetrics: args.includeHistoricalMetrics,
              lookbackDays: args.lookbackDays,
              hotspotsFound: paginatedResult.data.length,
              pagination: paginatedResult.pagination,
              hotspots: paginatedResult.data,
              nextSteps: [
                "graph_metrics({metric:'pagerank'}) — rank hotspots by architectural importance",
                "taint_analysis() — check if hotspots contain security vulnerabilities",
              ],
            },
            null,
            2,
          ),
        },
      ],
    };
  }

  /**
   * Pre-load change frequencies for all entities in a batch to minimize diff operations.
   * Uses Prolly Tree history first, falls back to Git for entities without Prolly data.
   */
  private async preloadChangeFrequencies(
    entities: ParsedEntity[],
    storage: GraphStorageLibSQL,
    lookbackDays: number,
  ): Promise<void> {
    const adapter = storage.getLibSQLAdapter?.();
    const commitManager = adapter?.getCommitManager?.();
    const nodeStore = adapter?.getProllyNodeStore?.();

    const entityChangeCount = new Map<string, { count: number; source: "prolly" | "git" | "none" }>();
    let prollyDataAvailable = false;

    // Initialize all entities with 0 changes
    for (const entity of entities) {
      entityChangeCount.set(entity.id, { count: 0, source: "none" });
    }

    // === Phase 1: Try Prolly Tree ===
    if (commitManager && nodeStore) {
      const sinceTimestamp = Date.now() - lookbackDays * 24 * 60 * 60 * 1000;
      const recentCommits = await commitManager.getCommitsSince(sinceTimestamp);

      if (recentCommits.length >= 2) {
        prollyDataAvailable = true;
        const timeTravel = new TimeTravelManager(nodeStore, commitManager);

        // Analyze each commit pair
        for (let i = 0; i < recentCommits.length - 1; i++) {
          const current = recentCommits[i];
          const parent = recentCommits[i + 1];
          if (!current || !parent) continue;

          try {
            const diff = await timeTravel.diffCommits(parent.commitHash, current.commitHash);
            if (!diff) continue;

            // Count changes for each entity
            for (const entry of [...diff.treeDiff.added, ...diff.treeDiff.modified, ...diff.treeDiff.deleted]) {
              const existing = entityChangeCount.get(entry.key);
              if (existing) {
                entityChangeCount.set(entry.key, { count: existing.count + 1, source: "prolly" });
              }
            }
          } catch (error) {
            log.w("HOTSPOTS", "diff_failed", { error: (error as Error).message });
          }
        }

        log.d("HOTSPOTS", "prolly_preload_complete", {
          commits: recentCommits.length,
          withChanges: [...entityChangeCount.values()].filter((v) => v.count > 0).length,
        });
      } else {
        log.d("HOTSPOTS", "insufficient_commits", { count: recentCommits.length });
      }
    } else {
      log.d("HOTSPOTS", "prolly_not_available", { reason: "missing components" });
    }

    // === Phase 2: Git fallback for entities without Prolly data ===
    // Only use Git if Prolly data wasn't available or for entities with 0 changes
    const gitChangeCache = new Map<string, number>(); // Cache by filePath
    let gitFallbackCount = 0;

    for (const entity of entities) {
      const current = entityChangeCount.get(entity.id);
      if (!current || current.count > 0 || !entity.filePath) continue;

      // Check Git cache first (multiple entities can share same file)
      let gitCount = gitChangeCache.get(entity.filePath);
      if (gitCount === undefined) {
        gitCount = this.getChangeFrequencyFromGit(entity.filePath, lookbackDays);
        gitChangeCache.set(entity.filePath, gitCount);
      }

      if (gitCount > 0) {
        entityChangeCount.set(entity.id, { count: gitCount, source: "git" });
        gitFallbackCount++;
      }
    }

    if (gitFallbackCount > 0) {
      log.d("HOTSPOTS", "git_fallback_complete", {
        filesChecked: gitChangeCache.size,
        entitiesUpdated: gitFallbackCount,
      });
    }

    // Store in cache
    for (const [entityId, data] of entityChangeCount) {
      this.changeFrequencyCache.set(entityId, { changeCount: data.count, source: data.source });
    }

    log.d("HOTSPOTS", "preloaded_change_frequencies", {
      entities: entities.length,
      prollyAvailable: prollyDataAvailable,
      withChanges: [...entityChangeCount.values()].filter((v) => v.count > 0).length,
    });
  }

  /**
   * Get change frequency from Git log (fallback when Prolly data unavailable).
   */
  private getChangeFrequencyFromGit(filePath: string, lookbackDays: number): number {
    try {
      const since = new Date(Date.now() - lookbackDays * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

      const output = execSync(`git log --oneline --since="${since}" -- "${filePath}"`, {
        encoding: "utf-8",
        timeout: 5000,
        stdio: ["pipe", "pipe", "pipe"],
      });

      // Count lines (commits)
      const lines = output.trim().split("\n").filter(Boolean);
      return lines.length;
    } catch {
      // Git not available or file not tracked
      return 0;
    }
  }

  private calculateHotspotScore(
    entity: ParsedEntity,
    metric: string,
    includeHistoricalMetrics: boolean,
  ): {
    score: number;
    changeMetrics?:
      | { changeFrequency: number; changeFrequencyScore: number; changeSource: "prolly" | "git" | "none" }
      | undefined;
  } {
    const metrics = entity.metadata?.["metrics"] || {};
    let score = 0;
    let changeMetrics:
      | { changeFrequency: number; changeFrequencyScore: number; changeSource: "prolly" | "git" | "none" }
      | undefined;

    // Calculate lines from location if metrics not available
    const linesOfCode =
      metrics.linesOfCode ||
      (entity.location?.end?.line && entity.location?.start?.line
        ? entity.location.end.line - entity.location.start.line + 1
        : 0);

    if (metric === "complexity" || metric === "all") {
      // Cyclomatic complexity is the primary metric
      score += (metrics.cyclomaticComplexity || 0) * 2;
      // Cognitive complexity (harder to understand)
      score += (metrics.cognitiveComplexity || 0) * 1.5;
      // Nesting depth (deep nesting is bad)
      score += (metrics.nestingDepth || 0) * 3;
      // Lines of code (larger = harder to maintain)
      score += linesOfCode / 50;
      // Too many parameters
      const paramCount = metrics.parameterCount || 0;
      score += paramCount > 4 ? (paramCount - 4) * 2 : 0;
    }

    if (metric === "changes" || metric === "all") {
      if (includeHistoricalMetrics) {
        // Use pre-calculated change frequency from cache
        const cached = this.changeFrequencyCache.get(entity.id);
        if (cached && cached.changeCount > 0) {
          // Log-normalized score: log(changeCount + 1) * 10
          const changeScore = Math.log(cached.changeCount + 1) * 10;
          score += changeScore;
          changeMetrics = {
            changeFrequency: cached.changeCount,
            changeFrequencyScore: Math.round(changeScore * 100) / 100,
            changeSource: cached.source,
          };
        } else {
          changeMetrics = {
            changeFrequency: 0,
            changeFrequencyScore: 0,
            changeSource: "none",
          };
        }
      } else {
        // Use stored metrics (legacy behavior)
        score += (metrics.changeFrequency || 0) * 10;
      }
    }

    if (metric === "coupling" || metric === "all") {
      // coupling metrics require dependency analysis (not yet implemented)
      score += metrics.couplingScore || 0;
      score += (metrics.dependencyCount || 0) / 5;
    }

    return { score, changeMetrics };
  }
}

// =============================================================================
// FIND RELATED CONCEPTS
// =============================================================================

const FindRelatedConceptsSchema = z.object({
  entityId: z.string().describe("Entity ID to find related concepts for"),
  projectPath: projectPathParam,
  offset: z.number().optional().default(0),
  limit: z.number().optional().default(SAFE_LIMITS.searchResults),
});

export class FindRelatedConceptsToolHandler extends BaseToolHandler<z.infer<typeof FindRelatedConceptsSchema>> {
  protected parseArgs(args: unknown) {
    return FindRelatedConceptsSchema.parse(args);
  }

  protected async execute(args: z.infer<typeof FindRelatedConceptsSchema>): Promise<ToolResult> {
    // v3: Ensure correct project context
    const storage = await this.ensureGraphStorageForProject(args.projectPath);
    const semanticAgent = await this.context.getSemanticAgent();
    const safeLimit = Math.min(args.limit, MAX_PAGE_SIZE);

    // Get entity name from ID to use as concept
    const entity = await storage.getEntity(args.entityId);
    if (!entity) {
      return {
        content: [{ type: "text", text: JSON.stringify({ error: `Entity not found: ${args.entityId}` }) }],
      };
    }

    const concept = entity.name;

    // Use semanticSearch to find related concepts
    const searchResult = await semanticAgent.semanticSearch(concept, 500);
    const allRelated = searchResult.results || [];

    const paginatedResult = paginate(allRelated, args.offset, safeLimit);

    // Enrich with graph metrics from entity metadata in storage
    // Batch strategy: collect all hash IDs and composite IDs, resolve in 1-2 queries
    const hashIds: string[] = [];
    const compositeNames: Array<{ idx: number; name: string }> = [];
    const resultIdToIdx = new Map<number, string>(); // idx → resolved entity key

    for (let i = 0; i < paginatedResult.data.length; i++) {
      const r = paginatedResult.data[i]!;
      const meta = r.metadata as Record<string, unknown> | undefined;
      const metaEntityId = meta?.["entityId"] as string | undefined;

      // Strategy 1: direct hash ID from metadata or r.id
      if (metaEntityId && /^[0-9a-f]{12}$/.test(metaEntityId)) {
        hashIds.push(metaEntityId);
        resultIdToIdx.set(i, metaEntityId);
        continue;
      }
      if (typeof r.id === "string" && r.id.startsWith("ent:")) {
        const idPart = r.id.slice(4);
        if (/^[0-9a-f]{12}$/.test(idPart)) {
          hashIds.push(idPart);
          resultIdToIdx.set(i, idPart);
          continue;
        }
      }

      // Strategy 2: parse composite ID → extract entity name for batch search
      const compositeId =
        metaEntityId ?? (typeof r.id === "string" && r.id.startsWith("ent:") ? r.id.slice(4) : undefined);
      if (compositeId && compositeId.includes(":")) {
        const lastColon = compositeId.lastIndexOf(":");
        const entityName = compositeId.slice(lastColon + 1);
        if (entityName) {
          compositeNames.push({ idx: i, name: entityName });
        }
      }
    }

    // Batch 1: resolve all hash IDs in single query
    const entityMap = hashIds.length > 0 ? await storage.getEntitiesBatch(hashIds) : new Map();

    // Batch 2: resolve composite names — single searchEntities with regex-union of all unique names
    const nameToEntity = new Map<string, Entity | null>();
    const uniqueNames = [...new Set(compositeNames.map((c) => c.name))];
    if (uniqueNames.length > 0) {
      // Batch: find all entities whose names match any of our targets
      // Use findEntities with name regex matching all unique names
      const namePattern = uniqueNames.map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
      const found = await storage.searchEntities({ namePattern, limit: uniqueNames.length * 5 });
      // Group by name, prefer entities with graph metrics
      for (const e of found) {
        const existing = nameToEntity.get(e.name);
        if (!existing || e.metadata?.["communityId"] != null || e.metadata?.["pageRank"] != null) {
          nameToEntity.set(e.name, e);
        }
      }
    }

    // Build final enriched results
    const enrichedRelated = paginatedResult.data.map((r, i) => {
      let ent: Entity | null | undefined = null;

      // Check hash batch
      const hashKey = resultIdToIdx.get(i);
      if (hashKey) {
        ent = entityMap.get(hashKey);
      }

      // Check composite name batch
      if (!ent) {
        const comp = compositeNames.find((c) => c.idx === i);
        if (comp) {
          ent = nameToEntity.get(comp.name);
        }
      }

      if (!ent) return r;
      const entMeta = ent.metadata ?? {};
      const communityId = entMeta["communityId"];
      const pageRank = entMeta["pageRank"];
      if (communityId != null || pageRank != null) {
        return {
          ...r,
          ...(communityId != null ? { communityId } : {}),
          ...(typeof pageRank === "number" ? { pageRank: Math.round(pageRank * 10000) / 10000 } : {}),
        };
      }
      return r;
    });

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              entityId: args.entityId,
              concept,
              relatedCount: enrichedRelated.length,
              pagination: paginatedResult.pagination,
              related: enrichedRelated,
            },
            null,
            2,
          ),
        },
      ],
    };
  }
}

// =============================================================================
// ANALYZE STATE CHAOS
// =============================================================================

const AnalyzeStateChaosSchema = z.object({
  projectPath: projectPathParam,
  scope: z.enum(["file", "module", "project"]).optional().default("project"),
  stateIdentifiers: z.array(z.string()).optional(),
  autoDetect: z.boolean().optional().default(true),
  maxDepth: z.number().optional(),
  excludePatterns: z.array(z.string()).optional(),
  format: z.enum(["summary", "detailed", "json"]).optional().default("summary"),
});

export class AnalyzeStateChaosToolHandler extends BaseToolHandler<z.infer<typeof AnalyzeStateChaosSchema>> {
  protected parseArgs(args: unknown) {
    return AnalyzeStateChaosSchema.parse(args);
  }

  protected async execute(args: z.infer<typeof AnalyzeStateChaosSchema>): Promise<ToolResult> {
    // v3: Ensure correct project context for GraphStorage queries
    const storage = await this.ensureGraphStorageForProject(args.projectPath);

    // Use the full ChaosAnalyzer engine
    const { ChaosAnalyzer } = await import("../../analysis/chaos/index.js");
    const analyzer = new ChaosAnalyzer(storage);

    const results = await analyzer.analyze({
      scope: args.scope || "project",
      stateIdentifiers: args.stateIdentifiers,
      autoDetect: args.autoDetect ?? true,
      maxDepth: args.maxDepth,
      excludePatterns: args.excludePatterns,
    });

    // Enrich chaotic entities with graph context (PageRank + Louvain community)
    const graphContext: Array<{
      stateIdentifier: string;
      pageRank: number | null;
      communityId: number | null;
      communityRisk: "low" | "medium" | "high";
    }> = [];

    for (const r of results) {
      const identifier = r.statePattern.identifier;
      if (!identifier) continue;
      // Search for entity by name — pick the first one with graph metrics in metadata
      try {
        const entities = await storage.searchEntities({ namePattern: identifier });
        let pr: unknown = null;
        let cid: unknown = null;
        for (const ent of entities) {
          const meta = ent.metadata ?? {};
          if (meta["communityId"] != null || meta["pageRank"] != null) {
            pr = meta["pageRank"];
            cid = meta["communityId"];
            break;
          }
        }
        if (entities.length > 0) {
          graphContext.push({
            stateIdentifier: identifier,
            pageRank: typeof pr === "number" ? pr : null,
            communityId: typeof cid === "number" ? cid : null,
            communityRisk:
              typeof pr === "number" && pr > 0.7 ? "high" : typeof pr === "number" && pr > 0.4 ? "medium" : "low",
          });
        }
      } catch {
        // Skip entities that can't be fetched
      }
    }

    const chaosNextSteps = [
      "graph_metrics({metric:'louvain'}) — cluster chaotic modules by community",
      "graph_metrics({metric:'pagerank'}) — assess architectural importance of chaotic entities",
    ];

    if (args.format === "json") {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                statePatterns: results,
                csharpPatterns: analyzer.csharpPatterns,
                graphContext,
                nextSteps: chaosNextSteps,
              },
              null,
              2,
            ),
          },
        ],
      };
    }

    if (args.format === "detailed" && (results.length > 0 || analyzer.csharpPatterns.length > 0)) {
      const parts: string[] = [];
      if (results.length > 0) {
        parts.push(results.map((r) => analyzer.formatDetailed(r)).join("\n\n---\n\n"));
      }
      // formatForAI already includes C# patterns section — use it for the C# part
      if (analyzer.csharpPatterns.length > 0 && results.length === 0) {
        parts.push(analyzer.formatForAI(results));
      }
      return {
        content: [{ type: "text", text: parts.join("\n\n") }],
      };
    }

    // Default: AI-friendly summary (includes C# anti-patterns)
    const text = analyzer.formatForAI(results);
    const nextStepsText = `\n\n---\nNext steps:\n${chaosNextSteps.map((s) => `- ${s}`).join("\n")}`;
    return {
      content: [{ type: "text", text: text + nextStepsText }],
    };
  }
}

// =============================================================================
// ANALYZE CODE IMPACT
// =============================================================================

const AnalyzeCodeImpactSchema = z.object({
  entityId: z.string().optional(),
  filePath: z.string().optional(),
  projectPath: projectPathParam,
  depth: z.number().optional().default(3),
  highlightRecentChanges: z
    .boolean()
    .optional()
    .default(false)
    .describe("Annotate impacted entities with recently-changed status (Prolly Tree)"),
  recentCommitsCount: z
    .number()
    .optional()
    .default(10)
    .describe("Number of recent commits to consider for highlighting"),
});

export class AnalyzeCodeImpactToolHandler extends BaseToolHandler<z.infer<typeof AnalyzeCodeImpactSchema>> {
  protected parseArgs(args: unknown) {
    return AnalyzeCodeImpactSchema.parse(args);
  }

  protected async execute(args: z.infer<typeof AnalyzeCodeImpactSchema>): Promise<ToolResult> {
    // v3: Ensure correct project context for GraphStorage queries
    const storage = await this.ensureGraphStorageForProject(args.projectPath);

    let entityId = args.entityId;

    // Try direct ID lookup first
    if (entityId) {
      const directEntity = await storage.getEntity(entityId);
      if (!directEntity) {
        // entityId might be a name, not a hash — try name-based search
        const byName = await storage.searchEntities({ namePattern: entityId });
        if (byName.length > 0) {
          // If filePath provided, prefer entities from that file
          if (args.filePath) {
            const normalizedPath = this.context.normalizeInputPath(args.filePath);
            const normalizedFilter = (normalizedPath || "").replace(/\\/g, "/").toLowerCase();
            const inFile = byName.find((e) => {
              const ep = (e.filePath || "").replace(/\\/g, "/").toLowerCase();
              return ep.includes(normalizedFilter) || ep.endsWith(normalizedFilter);
            });
            if (inFile) entityId = inFile.id;
            else entityId = byName[0]!.id;
          } else {
            entityId = byName[0]!.id;
          }
        } else {
          entityId = undefined;
        }
      }
    }

    // Find entity by file path if needed
    if (!entityId && args.filePath) {
      const normalizedPath = this.context.normalizeInputPath(args.filePath);
      const entities = await storage.findEntities({
        filters: { ...(normalizedPath != null ? { filePath: normalizedPath } : {}) },
        limit: 1,
      });
      if (entities.length > 0 && entities[0]) {
        entityId = entities[0].id;
      }
    }

    if (!entityId) {
      return {
        content: [{ type: "text", text: JSON.stringify({ error: "Entity not found" }) }],
      };
    }

    // Get entity and its relationships
    const entity = await storage.getEntity(entityId);
    const relationships = await storage.getRelationshipsForEntity(entityId);

    // Calculate impact using level-based BFS
    const impactedEntities = new Set<string>();
    let frontier = [entityId];
    let currentDepth = 0;

    while (frontier.length > 0 && currentDepth < args.depth) {
      const nextFrontier: string[] = [];
      for (const current of frontier) {
        const rels = await storage.getRelationshipsForEntity(current);
        for (const rel of rels) {
          const targetId = rel.fromId === current ? rel.toId : rel.fromId;
          if (!impactedEntities.has(targetId) && targetId !== entityId) {
            impactedEntities.add(targetId);
            nextFrontier.push(targetId);
          }
        }
      }
      frontier = nextFrontier;
      currentDepth++;
    }

    // Check if impact crosses API contract boundaries (Swagger/OpenAPI)
    let contractImpact:
      | {
          affectsApiContract: boolean;
          affectedEndpoints: string[];
          affectedSchemas: string[];
          breakingChangeRisk: "high" | "medium" | "low";
          consumers: string[];
          warning: string;
        }
      | undefined;

    {
      // Batch-fetch all impacted entities to check for swagger metadata
      const impactedIds = Array.from(impactedEntities);
      const impactedBatch = await storage.getEntitiesBatch(impactedIds);
      const affectedEndpoints: string[] = [];
      const affectedSchemas: string[] = [];
      const consumers: string[] = [];

      for (const [, impEntity] of impactedBatch) {
        if (impEntity.metadata?.["isApiContract"]) {
          const swaggerType = impEntity.metadata["swaggerType"] as string;
          if (swaggerType === "endpoint") {
            const sig = `${impEntity.metadata["httpMethod"] || ""} ${impEntity.metadata["path"] || ""}`.trim();
            affectedEndpoints.push(sig || impEntity.name);
          } else if (swaggerType === "schema") {
            affectedSchemas.push(impEntity.name);
          }
        }
      }

      // Also check if the source entity itself produces/consumes API
      if (entity?.metadata?.["isApiContract"]) {
        const swaggerType = entity.metadata["swaggerType"] as string;
        if (swaggerType === "endpoint") {
          const sig = `${entity.metadata["httpMethod"] || ""} ${entity.metadata["path"] || ""}`.trim();
          affectedEndpoints.push(sig || entity.name);
        } else if (swaggerType === "schema") {
          affectedSchemas.push(entity.name);
        }
      }

      // Find consumers through CONSUMES_API relationships
      for (const rel of relationships) {
        if (rel.type === "consumes_api" || (rel.metadata?.context as string)?.includes("consumes")) {
          const consumerId = rel.fromId === entityId ? rel.toId : rel.fromId;
          const consumer = impactedBatch.get(consumerId);
          if (consumer) {
            consumers.push(consumer.name);
          }
        }
      }

      if (affectedEndpoints.length > 0 || affectedSchemas.length > 0) {
        const risk =
          affectedEndpoints.length > 3 || affectedSchemas.length > 5
            ? "high"
            : affectedEndpoints.length > 0
              ? "medium"
              : "low";

        contractImpact = {
          affectsApiContract: true,
          affectedEndpoints: [...new Set(affectedEndpoints)],
          affectedSchemas: [...new Set(affectedSchemas)],
          breakingChangeRisk: risk,
          consumers: [...new Set(consumers)],
          warning: "Changes affect external API contract — consumers may break",
        };
      }
    }

    // Annotate with recently-changed status if requested
    let recentlyChangedImpact:
      | {
          recentlyAddedCount: number;
          recentlyModifiedCount: number;
          volatileRatio: number;
          commitsAnalyzed: number;
        }
      | undefined;
    if (args.highlightRecentChanges) {
      const { getRecentlyChangedEntities } = await import("../../storage/prolly/recently-changed.js");
      const adapter = (storage as GraphStorageLibSQL).getLibSQLAdapter?.();
      if (adapter) {
        const recentlyChanged = await getRecentlyChangedEntities(adapter, {
          lastCommits: args.recentCommitsCount,
        });
        if (recentlyChanged) {
          let recentlyAddedCount = 0;
          let recentlyModifiedCount = 0;
          for (const id of impactedEntities) {
            if (recentlyChanged.addedIds.has(id)) recentlyAddedCount++;
            else if (recentlyChanged.modifiedIds.has(id)) recentlyModifiedCount++;
          }
          const totalRecent = recentlyAddedCount + recentlyModifiedCount;
          recentlyChangedImpact = {
            recentlyAddedCount,
            recentlyModifiedCount,
            volatileRatio:
              impactedEntities.size > 0 ? Math.round((totalRecent / impactedEntities.size) * 100) / 100 : 0,
            commitsAnalyzed: recentlyChanged.commitsAnalyzed,
          };
        }
      }
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              entity: entity ? { id: entity.id, name: entity.name, type: entity.type } : null,
              directRelationships: relationships.length,
              totalImpactedEntities: impactedEntities.size,
              impactDepth: args.depth,
              riskLevel: impactedEntities.size > 50 ? "high" : impactedEntities.size > 20 ? "medium" : "low",
              ...(contractImpact ? { contractImpact } : {}),
              ...(recentlyChangedImpact ? { recentlyChangedImpact } : {}),
              nextSteps: [
                "graph_metrics({metric:'pagerank'}) — assess importance of impacted entities",
                "taint_analysis() — check if impacted code has security vulnerabilities",
              ],
            },
            null,
            2,
          ),
        },
      ],
    };
  }
}

// =============================================================================
// ANALYZE SWAGGER IMPACT
// =============================================================================

const AnalyzeSwaggerImpactSchema = z.object({
  projectPath: projectPathParam,
  swaggerFile: z.string().optional().describe("Path to swagger file (auto-detected if omitted)"),
  schemaName: z.string().optional().describe("Specific schema name to analyze"),
  endpointPath: z.string().optional().describe("Specific endpoint like 'GET /api/users'"),
});

export class AnalyzeSwaggerImpactToolHandler extends BaseToolHandler<z.infer<typeof AnalyzeSwaggerImpactSchema>> {
  protected parseArgs(args: unknown) {
    return AnalyzeSwaggerImpactSchema.parse(args);
  }

  protected async execute(args: z.infer<typeof AnalyzeSwaggerImpactSchema>): Promise<ToolResult> {
    const storage = await this.ensureGraphStorageForProject(args.projectPath);
    const allEntities = await storage.getAllEntities();
    const allRelationships = await storage.getAllRelationships();

    // Find swagger entities
    let swaggerEntities = allEntities.filter((e) => e.metadata?.["isApiContract"]);

    if (swaggerEntities.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              error:
                "No swagger/OpenAPI specifications found in the project graph. Index a project with swagger files first.",
            }),
          },
        ],
      };
    }

    // Filter by swagger file if specified
    if (args.swaggerFile) {
      const normalizedPath = this.context.normalizeInputPath(args.swaggerFile);
      swaggerEntities = swaggerEntities.filter((e) =>
        e.filePath
          .replace(/\\/g, "/")
          .toLowerCase()
          .includes((normalizedPath || "").replace(/\\/g, "/").toLowerCase()),
      );
    }

    // Filter by schema name
    if (args.schemaName) {
      swaggerEntities = swaggerEntities.filter(
        (e) => e.metadata?.["swaggerType"] === "schema" && e.name === args.schemaName,
      );
    }

    // Filter by endpoint
    if (args.endpointPath) {
      const [method, ...pathParts] = args.endpointPath.split(" ");
      const path = pathParts.join(" ");
      swaggerEntities = swaggerEntities.filter((e) => {
        if (e.metadata?.["swaggerType"] !== "endpoint") return false;
        const entityMethod = ((e.metadata["httpMethod"] as string) || "").toUpperCase();
        const entityPath = (e.metadata["path"] as string) || "";
        return (!method || entityMethod === method.toUpperCase()) && (!path || entityPath === path);
      });
    }

    // Find related code entities through relationships
    const producers: Array<{ name: string; file: string; type: string }> = [];
    const consumers: Array<{ name: string; file: string; type: string }> = [];
    const generatedTypes: Array<{ name: string; file: string; schemaName: string }> = [];

    const swaggerEntityIds = new Set(swaggerEntities.map((e) => e.id));
    const entityMap = new Map(allEntities.map((e) => [e.id, e]));

    for (const rel of allRelationships) {
      if (rel.type === "produces_api") {
        const from = entityMap.get(rel.fromId);
        const to = entityMap.get(rel.toId);
        if (from && to && (swaggerEntityIds.has(rel.toId) || swaggerEntityIds.has(rel.fromId))) {
          producers.push({ name: from.name, file: from.filePath, type: from.type });
        }
      } else if (rel.type === "consumes_api") {
        const from = entityMap.get(rel.fromId);
        const to = entityMap.get(rel.toId);
        if (from && to && (swaggerEntityIds.has(rel.toId) || swaggerEntityIds.has(rel.fromId))) {
          consumers.push({ name: from.name, file: from.filePath, type: from.type });
        }
      } else if (rel.type === "generated_from") {
        const from = entityMap.get(rel.fromId);
        const to = entityMap.get(rel.toId);
        if (from && to && (swaggerEntityIds.has(rel.toId) || swaggerEntityIds.has(rel.fromId))) {
          generatedTypes.push({
            name: from.name,
            file: from.filePath,
            schemaName: to.name,
          });
        }
      }
    }

    // Assess risk
    const totalAffected = producers.length + consumers.length + generatedTypes.length;
    const breakingChangeRisk: "high" | "medium" | "low" =
      totalAffected > 10 ? "high" : totalAffected > 3 ? "medium" : "low";

    // Build recommendations
    const recommendations: string[] = [];
    if (consumers.length > 0) {
      recommendations.push(`${consumers.length} generated client(s) may need regeneration after swagger changes`);
    }
    if (generatedTypes.length > 0) {
      recommendations.push(
        `${generatedTypes.length} generated type(s) are linked to swagger schemas — regenerate after schema changes`,
      );
    }
    if (producers.length > 0) {
      recommendations.push(
        `${producers.length} controller(s) produce this API — update swagger spec after changing these`,
      );
    }

    const endpoints = swaggerEntities
      .filter((e) => e.metadata?.["swaggerType"] === "endpoint")
      .map((e) => ({
        name: e.name,
        method: e.metadata?.["httpMethod"] as string,
        path: e.metadata?.["path"] as string,
      }));

    const schemas = swaggerEntities.filter((e) => e.metadata?.["swaggerType"] === "schema").map((e) => e.name);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              swaggerFiles: [...new Set(swaggerEntities.map((e) => e.filePath))],
              endpoints,
              schemas,
              producers,
              consumers,
              generatedTypes,
              breakingChangeRisk,
              totalAffectedEntities: totalAffected,
              recommendations,
            },
            null,
            2,
          ),
        },
      ],
    };
  }
}

// =============================================================================
// DETECT TECHNOLOGY STACK
// =============================================================================

const DetectTechnologyStackSchema = z.object({
  directory: z.string().optional(),
  projectPath: projectPathParam,
});

export class DetectTechnologyStackToolHandler extends BaseToolHandler<z.infer<typeof DetectTechnologyStackSchema>> {
  protected parseArgs(args: unknown) {
    return DetectTechnologyStackSchema.parse(args);
  }

  protected async execute(args: z.infer<typeof DetectTechnologyStackSchema>): Promise<ToolResult> {
    // Use resolveProjectPath for proper path resolution
    const targetDir = args.directory
      ? (this.context.normalizeInputPath(args.directory) ?? this.resolveProjectPath({}))
      : this.resolveProjectPath({ projectPath: args.projectPath });

    try {
      const { TechnologyDetector } = await import("../../analysis/technology-detector.js");
      const graphStorage = await this.context.getGraphStorage();
      // CRITICAL: Set project context to target directory before querying
      graphStorage.setProject(targetDir);
      const detector = new TechnologyDetector(graphStorage, targetDir);
      const stack: TechnologyStack = await detector.detectStack();

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                directory: targetDir,
                languages: stack.languages,
                frameworks: stack.frameworks,
                buildTools: stack.buildTools,
                dependencies: stack.dependencies,
                confidence: stack.confidence,
              },
              null,
              2,
            ),
          },
        ],
      };
    } catch (error: unknown) {
      const err = toError(error);
      return {
        content: [{ type: "text", text: JSON.stringify({ error: err.message }) }],
      };
    }
  }
}
