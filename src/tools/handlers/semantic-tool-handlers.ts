/**
 * Semantic Tool Handlers
 *
 * Handlers for semantic search operations:
 * - semantic_search
 * - find_similar_code
 * - find_duplicates
 * - jscpd_detect_clones
 * - cross_language_search
 * - pattern_search
 */

import { readFileSync } from "node:fs";
import { z } from "zod";
import { log } from "../../logging/index.js";
import type { EntityType } from "../../types/storage.js";
import { toError } from "../../utils/error-handling.js";
import { projectPathParam } from "../base-schemas.js";
import { BaseToolHandler, type ToolResult } from "../base-tool-handler.js";
import type { IClone } from "../jscpd.js";
import { MAX_PAGE_SIZE, paginate, SAFE_LIMITS } from "../response-limits.js";
import { DetectCodeClonesSchema } from "../schemas/semantic-schemas.js";

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

/**
 * Metadata for semantic search results
 */
interface SemanticResultMetadata {
  name?: string;
  entityType?: string;
  type?: string;
  filePath?: string;
  path?: string;
  content?: string;
  startLine?: number;
  endLine?: number;
  language?: string;
  entityId?: string;
  // Complexity metrics
  cyclomatic?: number;
  cognitive?: number;
  linesOfCode?: number;
  nestingDepth?: number;
  // Control flow
  hasBranches?: boolean;
  hasLoops?: boolean;
  hasExceptions?: boolean;
  hasAwaits?: boolean;
  branchCount?: number;
  loopCount?: number;
  returnCount?: number;
  // Calls
  callCount?: number;
  hasAsyncCalls?: boolean;
  // Documentation
  hasDocumentation?: boolean;
  hasParams?: boolean;
  hasExamples?: boolean;
  isDeprecated?: boolean;
  // Types
  returnType?: string;
  paramCount?: number;
}

/**
 * Semantic search result
 */
interface SemanticSearchResult {
  id: string;
  name?: string | undefined;
  type?: string | undefined;
  similarity: number;
  reranked?: boolean | undefined;
  filePath?: string | undefined;
  content?: string | undefined;
  metadata?: SemanticResultMetadata | undefined;
  isExpanded?: boolean | undefined;
  relationshipType?: string | undefined;
}

/**
 * Clone group member
 */
interface CloneMember {
  id: string;
  name: string;
  path: string;
  startLine?: number;
  endLine?: number;
}

/**
 * Clone detection group
 */
interface CloneGroup {
  avgSimilarity: number;
  cloneType: string;
  members?: CloneMember[];
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/** Approximate token limit for content output (chars / 4 ≈ tokens) */
const CONTENT_TOKEN_LIMIT = 8000;
const CHARS_PER_TOKEN = 4;

/**
 * Load source code lines from file
 * @param filePath - Path to source file
 * @param startLine - Start line (1-based)
 * @param endLine - End line (1-based)
 * @returns Source code string or undefined if failed
 */
function loadSourceCode(filePath: string, startLine?: number, endLine?: number): string | undefined {
  if (!filePath || !startLine || !endLine) return undefined;
  try {
    const content = readFileSync(filePath, "utf-8");
    const lines = content.split("\n");
    // Lines are 1-based, array is 0-based
    const start = Math.max(0, startLine - 1);
    const end = Math.min(lines.length, endLine);
    return lines.slice(start, end).join("\n");
  } catch {
    return undefined;
  }
}

/**
 * Estimate token count (chars / 4)
 */
function estimateTokens(text: string): number {
  return Math.ceil(text.length / CHARS_PER_TOKEN);
}

interface ResultWithContent {
  content?: string;
  [key: string]: unknown;
}

interface ContentPaginationResult<T> {
  results: T[];
  contentPagination?: {
    includedCount: number;
    totalCount: number;
    tokensUsed: number;
    tokenLimit: number;
    hasMore: boolean;
    message?: string;
  };
}

/**
 * Apply token-based pagination to results with content.
 * Includes content for as many results as fit within token limit.
 */
function applyContentPagination<T extends ResultWithContent>(
  results: T[],
  includeContent: boolean,
): ContentPaginationResult<T> {
  if (!includeContent || results.length === 0) {
    return { results };
  }

  let tokensUsed = 0;
  let includedCount = 0;
  const paginatedResults: T[] = [];

  for (const result of results) {
    const content = result.content;
    if (content) {
      const contentTokens = estimateTokens(content);
      if (tokensUsed + contentTokens > CONTENT_TOKEN_LIMIT && includedCount > 0) {
        // Token limit reached, include result without content
        paginatedResults.push({ ...result, content: undefined });
      } else {
        // Include with content
        tokensUsed += contentTokens;
        includedCount++;
        paginatedResults.push(result);
      }
    } else {
      paginatedResults.push(result);
    }
  }

  const hasMore = includedCount < results.filter((r) => r.content).length;

  return {
    results: paginatedResults,
    ...(hasMore
      ? {
          contentPagination: {
            includedCount,
            totalCount: results.length,
            tokensUsed,
            tokenLimit: CONTENT_TOKEN_LIMIT,
            hasMore,
            message: `Content included for ${includedCount} of ${results.length} results (~${tokensUsed} tokens). Use offset to see more.`,
          },
        }
      : {}),
  };
}

// =============================================================================
// SEMANTIC SEARCH
// =============================================================================

const SemanticSearchSchema = z.object({
  query: z.string().describe("Natural language search query"),
  projectPath: projectPathParam,
  offset: z.number().optional().default(0),
  limit: z.number().optional().default(SAFE_LIMITS.searchResults),
  entityTypes: z.array(z.string()).optional().describe("Filter by entity types (function, class, interface, etc.)"),
  minSimilarity: z.number().optional().default(0.7).describe("Minimum similarity threshold (0.0-1.0)"),
  includeContent: z
    .boolean()
    .optional()
    .default(false)
    .describe("Include full source code (startLine to endLine) in results"),
  expandRelated: z
    .boolean()
    .optional()
    .default(false)
    .describe("Expand results with graph neighbors (callers, dependencies, inheritors)"),
  expansionDepth: z.number().optional().default(1).describe("Graph traversal depth for expansion (1 or 2 hops)"),
  // Two-stage retrieval with reranking
  rerank: z
    .boolean()
    .optional()
    .default(false)
    .describe(
      "Enable two-stage retrieval: rerank top results with cross-encoder for better precision (requires vLLM or TEI provider)",
    ),
  rerankTopK: z.number().optional().default(50).describe("Number of top embedding results to rerank (default: 50)"),
  // New filters based on parser-extracted data
  minCyclomatic: z.number().optional().describe("Filter: minimum cyclomatic complexity"),
  maxCyclomatic: z.number().optional().describe("Filter: maximum cyclomatic complexity"),
  hasExceptions: z.boolean().optional().describe("Filter: must have try-catch blocks"),
  hasLoops: z.boolean().optional().describe("Filter: must have loops"),
  hasAwaits: z.boolean().optional().describe("Filter: must have await expressions (async code)"),
  hasDocumentation: z.boolean().optional().describe("Filter: must have documentation/docstrings"),
  isDeprecated: z.boolean().optional().describe("Filter: deprecated entities only"),
  minCallCount: z.number().optional().describe("Filter: minimum number of function calls"),
  // History filters (Prolly Tree)
  changedInLastCommits: z
    .number()
    .optional()
    .describe("Filter: only entities changed in last N graph commits (Prolly Tree)"),
  changedSinceMs: z.number().optional().describe("Filter: only entities changed since this Unix timestamp (ms)"),
});

export class SemanticSearchToolHandler extends BaseToolHandler<z.infer<typeof SemanticSearchSchema>> {
  protected parseArgs(args: unknown) {
    return SemanticSearchSchema.parse(args);
  }

  protected async execute(args: z.infer<typeof SemanticSearchSchema>): Promise<ToolResult> {
    // Project context validation
    const resolvedPath = this.resolveProjectPath(args);
    const currentProject = this.getProjectContext().getCurrentProject();

    // DEBUG: Log project paths
    log.d("SEMSEARCH", "proj_paths", { arg: args.projectPath, resolved: resolvedPath, current: currentProject });

    if (args.projectPath && resolvedPath !== currentProject) {
      // Check if requested project is indexed
      if (!this.isProjectIndexed(resolvedPath)) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: false,
                  error: `Project not indexed: ${resolvedPath}`,
                  hint: "Run 'index' tool on the target directory first",
                  currentProject,
                  requestedProject: resolvedPath,
                },
                null,
                2,
              ),
            },
          ],
        };
      }

      // Warn that cross-project search requires project switch
      log.w("SEMSEARCH", "cross_proj", { current: currentProject, requested: resolvedPath });
    }

    // Ensure SemanticAgent uses the correct project's VectorStore
    const semanticAgent = await this.ensureSemanticAgentForProject(resolvedPath);

    // Check if embedding provider failed to initialize
    const initError = semanticAgent.getEmbeddingInitError();
    if (initError) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: false,
                error: `Embedding provider initialization failed: ${initError.message}`,
                hint: "Check if the configured embedding provider is available (Docker, Ollama, etc.)",
              },
              null,
              2,
            ),
          },
        ],
      };
    }

    // v3: Also ensure GraphStorage context for expandWithGraphNeighbors
    await this.ensureGraphStorageForProject(resolvedPath);
    const safeLimit = Math.min(args.limit, MAX_PAGE_SIZE);

    // Fetch more results for pagination and filtering
    // Use semanticSearch method (returns SemanticResult with results array)
    const searchResult = await semanticAgent.semanticSearch(args.query, 1000);
    let allResults = searchResult.results || [];

    // Two-stage retrieval: rerank top results with cross-encoder for better precision
    let rerankStats = { reranked: false, provider: "" as string };
    if (args.rerank && allResults.length > 0) {
      const provider = semanticAgent.getEmbeddingProvider?.();
      const capabilities = provider?.getCapabilities?.();

      if (capabilities?.rerank && provider?.rerank) {
        try {
          // Take top K results for reranking (cross-encoder is slower but more accurate)
          const topK = Math.min(args.rerankTopK, allResults.length);
          const toRerank = allResults.slice(0, topK);

          // Prepare documents for reranking
          const documents = toRerank.map((r: SemanticSearchResult, idx: number) => ({
            text: r.content || r.metadata?.content || r.name || "",
            id: r.id || String(idx),
          }));

          // Rerank with cross-encoder
          const reranked = await provider.rerank(args.query, documents, {
            topK,
            threshold: args.minSimilarity,
          });

          // Update results with reranked scores
          const rerankedMap = new Map(reranked.map((r: { id?: string | undefined; score: number }) => [r.id, r.score]));
          for (const result of toRerank) {
            const newScore = rerankedMap.get(result.id);
            if (newScore !== undefined) {
              result.similarity = newScore;
              result.reranked = true;
            }
          }

          // Re-sort by new scores
          allResults = [...toRerank, ...allResults.slice(topK)];
          allResults.sort(
            (a: SemanticSearchResult, b: SemanticSearchResult) => (b.similarity || 0) - (a.similarity || 0),
          );

          rerankStats = { reranked: true, provider: provider.info?.name || "unknown" };
        } catch (error: unknown) {
          const err = toError(error);
          log.w("SEMSEARCH", "rerank_fail", { err: err.message });
          // Continue with embedding-only results
        }
      }
    }

    // Apply metadata-based filters
    let filteredResults = allResults;
    const hasFilters =
      args.minCyclomatic !== undefined ||
      args.maxCyclomatic !== undefined ||
      args.hasExceptions !== undefined ||
      args.hasLoops !== undefined ||
      args.hasAwaits !== undefined ||
      args.hasDocumentation !== undefined ||
      args.isDeprecated !== undefined ||
      args.minCallCount !== undefined;

    if (hasFilters) {
      filteredResults = allResults.filter((r: SemanticSearchResult) => {
        const meta = r.metadata || {};

        // Complexity filters
        if (args.minCyclomatic !== undefined && (meta.cyclomatic || 0) < args.minCyclomatic) return false;
        if (args.maxCyclomatic !== undefined && (meta.cyclomatic || Infinity) > args.maxCyclomatic) return false;

        // Control flow filters
        if (args.hasExceptions !== undefined && meta.hasExceptions !== args.hasExceptions) return false;
        if (args.hasLoops !== undefined && meta.hasLoops !== args.hasLoops) return false;
        if (args.hasAwaits !== undefined && meta.hasAwaits !== args.hasAwaits) return false;

        // Documentation filters
        if (args.hasDocumentation !== undefined && meta.hasDocumentation !== args.hasDocumentation) return false;
        if (args.isDeprecated !== undefined && meta.isDeprecated !== args.isDeprecated) return false;

        // Call count filter
        if (args.minCallCount !== undefined && (meta.callCount || 0) < args.minCallCount) return false;

        return true;
      });
    }

    // Apply Prolly Tree history filter
    if (args.changedInLastCommits !== undefined || args.changedSinceMs !== undefined) {
      const { getRecentlyChangedEntities } = await import("../../storage/prolly/recently-changed.js");
      const storage = await this.context.getGraphStorage();
      const adapter = (
        storage as import("../../storage/graph-storage-libsql.js").GraphStorageLibSQL
      ).getLibSQLAdapter?.();
      if (adapter) {
        const recentlyChanged = await getRecentlyChangedEntities(adapter, {
          lastCommits: args.changedInLastCommits,
          sinceTimestamp: args.changedSinceMs,
        });
        if (recentlyChanged) {
          filteredResults = filteredResults.filter((r: SemanticSearchResult) => {
            const entityId = r.metadata?.entityId || r.id?.replace(/^ent:/, "");
            return entityId ? recentlyChanged.changedIds.has(entityId) : false;
          });
        }
      }
    }

    // Expand results with graph neighbors if requested
    let expandedResults = filteredResults;
    let expansionStats = { expanded: false, neighborsAdded: 0 };

    if (args.expandRelated && filteredResults.length > 0) {
      const expansion = await this.expandWithGraphNeighbors(filteredResults, args.expansionDepth, args.minSimilarity);
      expandedResults = expansion.results;
      expansionStats = { expanded: true, neighborsAdded: expansion.neighborsAdded };
    }

    const paginatedResult = paginate(expandedResults, args.offset, safeLimit);

    // Extract query expansion info from searchResult (if available)
    const queryExpansion = searchResult.expandedQuery
      ? {
          expandedQuery: searchResult.expandedQuery,
          ...(searchResult.expansionInfo
            ? {
                coocTerms: searchResult.expansionInfo.coocTerms?.length || 0,
                prfTerms: searchResult.expansionInfo.prfTerms?.length || 0,
              }
            : {}),
        }
      : null;

    // Build results with optional content loading
    const mappedResults = (paginatedResult.data as SemanticSearchResult[]).map((r) => {
      const meta = r.metadata || {};
      const filePath = r.filePath || meta.filePath || meta.path;
      const startLine = meta.startLine;
      const endLine = meta.endLine;

      // Load source code if includeContent is true
      const content = args.includeContent ? loadSourceCode(filePath as string, startLine, endLine) : undefined;

      return {
        id: r.id,
        name: r.name || meta.name,
        type: r.type || meta.entityType || meta.type,
        similarity: r.similarity,
        ...(r.reranked ? { reranked: true } : {}),
        filePath,
        startLine,
        endLine,
        language: meta.language,
        // Complexity metrics (if available)
        ...(meta.cyclomatic
          ? {
              complexity: {
                cyclomatic: meta.cyclomatic,
                cognitive: meta.cognitive,
                linesOfCode: meta.linesOfCode,
                nestingDepth: meta.nestingDepth,
              },
            }
          : {}),
        // Control flow info (if available)
        ...(meta.hasBranches !== undefined
          ? {
              controlFlow: {
                hasBranches: meta.hasBranches,
                hasLoops: meta.hasLoops,
                hasExceptions: meta.hasExceptions,
                hasAwaits: meta.hasAwaits,
                branchCount: meta.branchCount,
                loopCount: meta.loopCount,
                returnCount: meta.returnCount,
              },
            }
          : {}),
        // Call info (if available)
        ...(meta.callCount
          ? {
              calls: {
                count: meta.callCount,
                hasAsync: meta.hasAsyncCalls,
              },
            }
          : {}),
        // Documentation info (if available)
        ...(meta.hasDocumentation
          ? {
              documentation: {
                hasDocumentation: true,
                hasParams: meta.hasParams,
                hasExamples: meta.hasExamples,
                isDeprecated: meta.isDeprecated,
              },
            }
          : {}),
        // Type info
        ...(meta.returnType ? { returnType: meta.returnType } : {}),
        ...(meta.paramCount ? { paramCount: meta.paramCount } : {}),
        // Expansion info
        ...(r.isExpanded ? { isExpanded: true, relationshipType: r.relationshipType } : {}),
        // Content (loaded from file)
        ...(content ? { content } : {}),
      };
    });

    // Apply token-based pagination for content
    const { results: finalResults, contentPagination } = applyContentPagination(mappedResults, args.includeContent);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              query: args.query,
              count: finalResults.length,
              pagination: paginatedResult.pagination,
              ...(queryExpansion ? { queryExpansion } : {}),
              ...(rerankStats.reranked ? { rerank: rerankStats } : {}),
              ...(expansionStats.expanded ? { expansion: expansionStats } : {}),
              ...(contentPagination ? { contentPagination } : {}),
              results: finalResults,
            },
            null,
            2,
          ),
        },
      ],
    };
  }

  /**
   * Expand search results with graph neighbors (callers, dependencies, inheritors)
   */
  private async expandWithGraphNeighbors(
    results: SemanticSearchResult[],
    depth: number,
    minSimilarity: number,
  ): Promise<{ results: SemanticSearchResult[]; neighborsAdded: number }> {
    const storage = await this.context.getGraphStorage();
    const seen = new Set<string>(results.map((r) => r.id));
    const neighbors: SemanticSearchResult[] = [];

    // Phase 1: Resolve entity IDs for all results (batch by name+path)
    const resultEntityIds: Array<string | null> = new Array(Math.min(results.length, 20)).fill(null);
    const needsLookup: Array<{ idx: number; name: string; path: string }> = [];

    for (let i = 0; i < Math.min(results.length, 20); i++) {
      const result = results[i]!;
      if (result.metadata?.entityId) {
        resultEntityIds[i] = result.metadata.entityId;
      } else if (result.metadata?.name && result.metadata?.path) {
        needsLookup.push({ idx: i, name: result.metadata.name, path: result.metadata.path });
      }
    }

    // Batch resolve name+path lookups: single findEntities with all filePaths
    if (needsLookup.length > 0) {
      try {
        const allPaths = [...new Set(needsLookup.map((l) => l.path))];
        const found = await storage.findEntities({
          filters: { filePath: allPaths },
          limit: allPaths.length * 50,
        });
        const lookup = new Map<string, string>(); // "name:path" → entityId
        for (const e of found) {
          lookup.set(`${e.name}:${e.filePath}`, e.id);
        }
        for (const { idx, name, path } of needsLookup) {
          resultEntityIds[idx] = lookup.get(`${name}:${path}`) ?? null;
        }
      } catch {
        // Ignore batch lookup failure
      }
    }

    // Phase 2: Get all relationships in parallel for resolved entities
    const validEntityIds = resultEntityIds.filter((id): id is string => id != null);
    const allRelsByEntity = new Map<string, Awaited<ReturnType<typeof storage.getRelationshipsForEntity>>>();

    await Promise.all(
      validEntityIds.map(async (entityId) => {
        try {
          const rels = await storage.getRelationshipsForEntity(entityId);
          allRelsByEntity.set(entityId, rels);
        } catch {
          // Skip
        }
      }),
    );

    // Phase 3: Collect all 1-hop neighbor IDs, batch resolve entities
    const hop1Candidates: Array<{
      relatedId: string;
      similarity: number;
      relType: string;
    }> = [];

    for (let i = 0; i < Math.min(results.length, 20); i++) {
      const entityId = resultEntityIds[i];
      if (!entityId) continue;
      const rels = allRelsByEntity.get(entityId);
      if (!rels) continue;

      for (const rel of rels) {
        const relatedId = rel.fromId === entityId ? rel.toId : rel.fromId;
        if (seen.has(relatedId) || seen.has(`ent:${relatedId}`)) continue;
        seen.add(relatedId);

        const neighborSimilarity = results[i]!.similarity * 0.7;
        if (neighborSimilarity < minSimilarity) continue;

        hop1Candidates.push({ relatedId, similarity: neighborSimilarity, relType: rel.type });
      }
    }

    // Batch resolve all 1-hop entities
    if (hop1Candidates.length > 0) {
      const hop1Entities = await storage.getEntitiesBatch(hop1Candidates.map((c) => c.relatedId));

      for (const { relatedId, similarity, relType } of hop1Candidates) {
        const entity = hop1Entities.get(relatedId);
        if (!entity) continue;

        neighbors.push({
          id: `ent:${relatedId}`,
          name: entity.name,
          type: entity.type,
          similarity,
          filePath: entity.filePath,
          content: entity.metadata?.["content"] as string | undefined,
          isExpanded: true,
          relationshipType: relType,
          metadata: { entityId: relatedId },
        });
      }
    }

    // Phase 4: 2-hop expansion if requested
    if (depth >= 2 && neighbors.length < 50) {
      const hop2Sources = neighbors.slice(-10);
      const hop2SourceIds = hop2Sources.map((n) => n.id?.replace(/^ent:/, "")).filter((id): id is string => !!id);

      // Get all 2-hop relationships in parallel
      const hop2RelsByEntity = new Map<string, Awaited<ReturnType<typeof storage.getRelationshipsForEntity>>>();
      await Promise.all(
        hop2SourceIds.map(async (id) => {
          try {
            const rels = await storage.getRelationshipsForEntity(id);
            hop2RelsByEntity.set(id, rels);
          } catch {
            // Skip
          }
        }),
      );

      // Collect 2-hop candidate IDs
      const hop2Candidates: Array<{
        hop2Id: string;
        similarity: number;
        relType: string;
      }> = [];

      for (const neighbor of hop2Sources) {
        const neighborEntityId = neighbor.id?.replace(/^ent:/, "");
        if (!neighborEntityId) continue;
        const rels = hop2RelsByEntity.get(neighborEntityId);
        if (!rels) continue;

        for (const rel of rels.slice(0, 5)) {
          const hop2Id = rel.fromId === neighborEntityId ? rel.toId : rel.fromId;
          if (seen.has(hop2Id) || seen.has(`ent:${hop2Id}`)) continue;
          seen.add(hop2Id);

          const hop2Similarity = neighbor.similarity * 0.7;
          if (hop2Similarity < minSimilarity) continue;

          hop2Candidates.push({ hop2Id, similarity: hop2Similarity, relType: `${rel.type} (2-hop)` });
        }
      }

      // Batch resolve all 2-hop entities
      if (hop2Candidates.length > 0) {
        const hop2Entities = await storage.getEntitiesBatch(hop2Candidates.map((c) => c.hop2Id));

        for (const { hop2Id, similarity, relType } of hop2Candidates) {
          const entity = hop2Entities.get(hop2Id);
          if (!entity) continue;

          neighbors.push({
            id: `ent:${hop2Id}`,
            name: entity.name,
            type: entity.type,
            similarity,
            filePath: entity.filePath,
            content: entity.metadata?.["content"] as string | undefined,
            isExpanded: true,
            relationshipType: relType,
            metadata: { entityId: hop2Id },
          });
        }
      }
    }

    // Combine and sort by similarity
    const combined = [...results, ...neighbors];
    combined.sort((a, b) => (b.similarity || 0) - (a.similarity || 0));

    return {
      results: combined,
      neighborsAdded: neighbors.length,
    };
  }
}

// =============================================================================
// FIND SIMILAR CODE
// =============================================================================

const FindSimilarCodeSchema = z.object({
  code: z.string().describe("Code snippet to find similar code for"),
  projectPath: projectPathParam,
  offset: z.number().optional().default(0),
  limit: z.number().optional().default(SAFE_LIMITS.searchResults),
  minSimilarity: z.number().optional().default(0.7).describe("Minimum similarity threshold (0.0-1.0)"),
  includeContent: z
    .boolean()
    .optional()
    .default(false)
    .describe("Include full source code (startLine to endLine) in results"),
});

export class FindSimilarCodeToolHandler extends BaseToolHandler<z.infer<typeof FindSimilarCodeSchema>> {
  protected parseArgs(args: unknown) {
    return FindSimilarCodeSchema.parse(args);
  }

  protected async execute(args: z.infer<typeof FindSimilarCodeSchema>): Promise<ToolResult> {
    // Ensure SemanticAgent uses the correct project's VectorStore
    const resolvedPath = this.resolveProjectPath(args);
    const semanticAgent = await this.ensureSemanticAgentForProject(resolvedPath);

    // Check if embedding provider failed to initialize
    const initError = semanticAgent.getEmbeddingInitError();
    if (initError) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: false,
                error: `Embedding provider initialization failed: ${initError.message}`,
                hint: "Check if the configured embedding provider is available (Docker, Ollama, etc.)",
              },
              null,
              2,
            ),
          },
        ],
      };
    }

    const safeLimit = Math.min(args.limit, MAX_PAGE_SIZE);

    // Fetch more for pagination (pass threshold as number, not options object)
    const allResults = await semanticAgent.findSimilarCode(args.code, args.minSimilarity);

    const paginatedResult = paginate(allResults, args.offset, safeLimit);

    // Build results with optional content loading
    const mappedResults = (paginatedResult.data as SemanticSearchResult[]).map((r) => {
      const filePath = r.filePath || (r.metadata?.path as string);
      const startLine = r.metadata?.startLine as number | undefined;
      const endLine = r.metadata?.endLine as number | undefined;
      const content = args.includeContent ? loadSourceCode(filePath, startLine, endLine) : undefined;

      return {
        id: r.id,
        name: r.name,
        type: r.type,
        similarity: r.similarity,
        filePath,
        startLine,
        endLine,
        ...(content ? { content } : {}),
      };
    });

    // Apply token-based pagination for content
    const { results: finalResults, contentPagination } = applyContentPagination(mappedResults, args.includeContent);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              count: finalResults.length,
              pagination: paginatedResult.pagination,
              ...(contentPagination ? { contentPagination } : {}),
              results: finalResults,
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
// DETECT CODE CLONES
// =============================================================================

// Uses DetectCodeClonesSchema from schemas/semantic-schemas.ts (imported at top)

export class DetectCodeClonesToolHandler extends BaseToolHandler<z.infer<typeof DetectCodeClonesSchema>> {
  protected parseArgs(args: unknown) {
    return DetectCodeClonesSchema.parse(args);
  }

  protected async execute(args: z.infer<typeof DetectCodeClonesSchema>): Promise<ToolResult> {
    try {
      const semanticAgent = await this.ensureSemanticAgentForProject();

      // Check if embedding provider failed to initialize
      const initError = semanticAgent.getEmbeddingInitError();
      if (initError) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: false,
                  error: `Embedding provider initialization failed: ${initError.message}`,
                  hint: "Check if the configured embedding provider is available (Docker, Ollama, etc.)",
                },
                null,
                2,
              ),
            },
          ],
        };
      }

      const minSimilarity = args.minSimilarity ?? 0.8;

      // Fetch clone groups (pass threshold as number)
      const allClones = await semanticAgent.detectClones(minSimilarity);

      // Handle case when detectClones returns undefined/null or empty array
      if (!allClones || !Array.isArray(allClones)) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  groupsFound: 0,
                  clones: [],
                  warning: "Clone detection unavailable - vector store may not be initialized",
                },
                null,
                2,
              ),
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                groupsFound: allClones.length,
                scope: args.scope ?? "all",
                minSimilarity,
                clones: allClones.map((group: CloneGroup) => ({
                  similarity: group.avgSimilarity,
                  cloneType: group.cloneType,
                  members: (group.members || []).map((m: CloneMember) => ({
                    id: m.id,
                    name: m.name,
                    filePath: m.path,
                    startLine: m.startLine,
                    endLine: m.endLine,
                  })),
                })),
              },
              null,
              2,
            ),
          },
        ],
      };
    } catch (error: unknown) {
      const err = toError(error);
      log.e("CLONES", "detectClones failed", { error: err.message, stack: err.stack });
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                groupsFound: 0,
                clones: [],
                error: err.message,
              },
              null,
              2,
            ),
          },
        ],
      };
    }
  }
}

// =============================================================================
// JSCPD DETECT CLONES
// =============================================================================

const JscpdDetectClonesSchema = z.object({
  directory: z.string().optional(),
  minLines: z.number().optional().default(5),
  minTokens: z.number().optional().default(50),
  threshold: z.number().optional().default(0),
  format: z.array(z.string()).optional(),
  offset: z.number().optional().default(0),
  limit: z.number().optional().default(SAFE_LIMITS.clones),
});

export class JscpdDetectClonesToolHandler extends BaseToolHandler<z.infer<typeof JscpdDetectClonesSchema>> {
  protected parseArgs(args: unknown) {
    return JscpdDetectClonesSchema.parse(args);
  }

  protected async execute(args: z.infer<typeof JscpdDetectClonesSchema>): Promise<ToolResult> {
    const targetDir = args.directory
      ? (this.context.normalizeInputPath(args.directory) ?? this.resolveProjectPath({}))
      : this.resolveProjectPath({});

    try {
      const { runJscpdCloneDetection } = await import("../jscpd.js");

      const result = await runJscpdCloneDetection({
        paths: [targetDir],
        formats: args.format || ["javascript", "typescript", "python"],
        minLines: args.minLines,
        minTokens: args.minTokens,
      });

      const safeLimit = Math.min(args.limit, MAX_PAGE_SIZE);
      const paginatedResult = paginate(result.clones, args.offset, safeLimit);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                duplicatesFound: paginatedResult.data.length,
                pagination: paginatedResult.pagination,
                statistics: {
                  total: result.statistic.total,
                  detectionDate: result.statistic.detectionDate,
                },
                duplicates: paginatedResult.data.map((c: IClone) => ({
                  format: c.format,
                  foundDate: c.foundDate,
                  duplicationA: {
                    sourceId: c.duplicationA.sourceId,
                    start: c.duplicationA.start,
                    end: c.duplicationA.end,
                  },
                  duplicationB: {
                    sourceId: c.duplicationB.sourceId,
                    start: c.duplicationB.start,
                    end: c.duplicationB.end,
                  },
                })),
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
        content: [
          {
            type: "text",
            text: JSON.stringify({ error: err.message }),
          },
        ],
      };
    }
  }
}

// =============================================================================
// CROSS LANGUAGE SEARCH
// =============================================================================

const CrossLanguageSearchSchema = z.object({
  query: z.string().describe("Search query"),
  projectPath: projectPathParam,
  languages: z.array(z.string()).optional().describe("Languages to search in"),
  offset: z.number().optional().default(0),
  limit: z.number().optional().default(SAFE_LIMITS.searchResults),
  includeContent: z
    .boolean()
    .optional()
    .default(false)
    .describe("Include full source code (startLine to endLine) in results"),
});

export class CrossLanguageSearchToolHandler extends BaseToolHandler<z.infer<typeof CrossLanguageSearchSchema>> {
  protected parseArgs(args: unknown) {
    return CrossLanguageSearchSchema.parse(args);
  }

  protected async execute(args: z.infer<typeof CrossLanguageSearchSchema>): Promise<ToolResult> {
    // Ensure SemanticAgent uses the correct project's VectorStore
    const resolvedPath = this.resolveProjectPath(args);
    const semanticAgent = await this.ensureSemanticAgentForProject(resolvedPath);
    const safeLimit = Math.min(args.limit, MAX_PAGE_SIZE);

    // Get all languages from vector store if not specified
    const languages = args.languages || [
      "typescript",
      "javascript",
      "python",
      "go",
      "rust",
      "java",
      "cpp",
      "swift",
      "kotlin",
      "csharp",
    ];

    // Fetch more for pagination (pass languages array directly, not options object)
    const allResults = await semanticAgent.crossLanguageSearch(args.query, languages);

    const paginatedResult = paginate(allResults, args.offset, safeLimit);

    // Build results with optional content loading
    const mappedResults = (paginatedResult.data as SemanticSearchResult[]).map((r) => {
      const filePath = r.filePath || (r.metadata?.path as string);
      const startLine = r.metadata?.startLine as number | undefined;
      const endLine = r.metadata?.endLine as number | undefined;
      const content = args.includeContent ? loadSourceCode(filePath, startLine, endLine) : undefined;

      return {
        id: r.id,
        name: r.name,
        language: r.metadata?.language,
        filePath,
        startLine,
        endLine,
        similarity: r.similarity,
        ...(content ? { content } : {}),
      };
    });

    // Apply token-based pagination for content
    const { results: finalResults, contentPagination } = applyContentPagination(mappedResults, args.includeContent);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              query: args.query,
              languages,
              count: finalResults.length,
              pagination: paginatedResult.pagination,
              ...(contentPagination ? { contentPagination } : {}),
              results: finalResults,
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
// PATTERN SEARCH
// =============================================================================

const PatternSearchSchema = z.object({
  pattern: z.string(),
  projectPath: projectPathParam,
  mode: z.enum(["entity", "content", "semantic", "hybrid"]).optional().default("hybrid"),
  entityTypes: z.array(z.string()).optional(),
  offset: z.number().optional().default(0),
  limit: z.number().optional().default(SAFE_LIMITS.searchResults),
  minSimilarity: z.number().optional().default(0.7),
  // History filters (Prolly Tree)
  changedInLastCommits: z
    .number()
    .optional()
    .describe("Filter: only entities changed in last N graph commits (Prolly Tree)"),
  changedSinceMs: z.number().optional().describe("Filter: only entities changed since this Unix timestamp (ms)"),
});

export class PatternSearchToolHandler extends BaseToolHandler<z.infer<typeof PatternSearchSchema>> {
  protected parseArgs(args: unknown) {
    return PatternSearchSchema.parse(args);
  }

  protected async execute(args: z.infer<typeof PatternSearchSchema>): Promise<ToolResult> {
    const { PatternSearch } = await import("../../search/pattern-search.js");
    const resolvedPath = this.resolveProjectPath(args);
    // v3: Ensure correct project context for GraphStorage queries
    const storage = await this.ensureGraphStorageForProject(resolvedPath);
    const safeLimit = Math.min(args.limit, MAX_PAGE_SIZE);

    let vectorStore = null;
    let embeddingError: Error | null = null;
    try {
      // Ensure SemanticAgent uses the correct project's VectorStore
      const semanticAgent = await this.ensureSemanticAgentForProject(resolvedPath);
      embeddingError = semanticAgent.getEmbeddingInitError();
      vectorStore = semanticAgent.getVectorStore?.();
    } catch {
      // Vector store not available
    }

    // For semantic/hybrid modes, warn if embedding provider failed
    if ((args.mode === "semantic" || args.mode === "hybrid") && embeddingError) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: false,
                error: `Embedding provider initialization failed: ${embeddingError.message}`,
                hint: "Check if the configured embedding provider is available. Use mode='entity' or 'content' for text-based search.",
              },
              null,
              2,
            ),
          },
        ],
      };
    }

    const patternSearch = new PatternSearch(storage, vectorStore, null);
    await patternSearch.initialize();

    // Fetch more for pagination
    let allResults = await patternSearch.search({
      pattern: args.pattern,
      mode: args.mode,
      scope: { entityTypes: args.entityTypes as EntityType[] | undefined },
      limit: 500,
    });

    // Apply Prolly Tree history filter
    if (args.changedInLastCommits !== undefined || args.changedSinceMs !== undefined) {
      const { getRecentlyChangedEntities } = await import("../../storage/prolly/recently-changed.js");
      const adapter = (
        storage as import("../../storage/graph-storage-libsql.js").GraphStorageLibSQL
      ).getLibSQLAdapter?.();
      if (adapter) {
        const recentlyChanged = await getRecentlyChangedEntities(adapter, {
          lastCommits: args.changedInLastCommits,
          sinceTimestamp: args.changedSinceMs,
        });
        if (recentlyChanged) {
          allResults = allResults.filter((r) => recentlyChanged.changedIds.has(r.entity.id));
        }
      }
    }

    const paginatedResult = paginate(allResults, args.offset, safeLimit);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              pattern: args.pattern,
              mode: args.mode,
              count: paginatedResult.data.length,
              pagination: paginatedResult.pagination,
              results: paginatedResult.data.map((r) => ({
                id: r.entity.id,
                name: r.entity.name,
                type: r.entity.type,
                matchType: r.matchType,
                score: r.score,
                filePath: r.entity.filePath,
                startLine: r.entity.location?.start?.line,
                endLine: r.entity.location?.end?.line,
                snippet: r.snippet,
              })),
            },
            null,
            2,
          ),
        },
      ],
    };
  }
}
