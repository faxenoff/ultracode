/**
 * Pattern-based Search - Advanced Code Search
 *
 * Provides multiple search modes:
 * - Entity: Search by entity name/type (regex)
 * - Content: Search inside entity bodies
 * - Semantic: Vector similarity search
 * - Hybrid: Combination of all modes
 *
 * Features:
 * - SIMD-accelerated cosine similarity
 * - Framework-aware filtering
 * - Content-aware search
 * - Score-based ranking
 *
 * Architecture References:
 * - Graph Storage: src/storage/graph-storage.ts
 * - Vector Store: src/semantic/vector-store.ts
 * - Technology Detector: src/analysis/technology-detector.ts
 */

import type { TechnologyDetector, TechnologyStack } from "../analysis/technology-detector.js";
import { log } from "../logging/index.js";
import { EmbeddingGenerator } from "../semantic/embedding-generator.js";
import type { VectorStore } from "../semantic/vector-store.js";
import type { Entity, EntityType, GraphStorage } from "../types/storage.js";
import { readLineRange } from "../utils/file-ops.js";
import { cosineSimilarity } from "../utils/simd-vector-ops.js";

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

interface EntityFilters {
  entityType?: EntityType | EntityType[];
  filePath?: string | string[];
  name?: RegExp;
}

export interface PatternSearchQuery {
  pattern: string; // Regex or semantic query
  scope?: {
    entityTypes?: EntityType[] | undefined; // Filter by entity types
    files?: string[] | undefined; // Filter by file paths
    frameworks?: string[] | undefined; // Filter by framework
  };
  contentFilter?: {
    contains?: string; // Content must contain this string
    regex?: string; // Content must match this regex
    semantic?: string | undefined; // Semantic similarity to this description
  };
  limit?: number;
  mode: "entity" | "content" | "semantic" | "hybrid";
}

export interface PatternSearchResult {
  entity: Entity;
  matchType: "name" | "content" | "semantic";
  score: number;
  snippet?: string | undefined; // Code snippet showing match
  highlights?: {
    // Highlighted match positions
    start: number;
    end: number;
  }[];
}

// =============================================================================
// PATTERN SEARCH IMPLEMENTATION
// =============================================================================

export class PatternSearch {
  private embeddingGenerator: EmbeddingGenerator | null = null;

  constructor(
    private graphStorage: GraphStorage,
    private vectorStore: VectorStore | null,
    private technologyDetector: TechnologyDetector | null,
  ) {}

  /**
   * Initialize Pattern Search (load embedding generator for semantic search)
   */
  async initialize(): Promise<void> {
    try {
      this.embeddingGenerator = new EmbeddingGenerator();
      await this.embeddingGenerator.initialize();
      log.i("PATTERNSEARCH", "embgen_init");
    } catch (error) {
      log.w("PATTERNSEARCH", "embgen_init_fail", { err: String(error) });
      this.embeddingGenerator = null;
    }
  }

  /**
   * Search with specified mode
   */
  async search(query: PatternSearchQuery): Promise<PatternSearchResult[]> {
    switch (query.mode) {
      case "entity":
        return this.searchEntities(query);
      case "content":
        return this.searchContent(query);
      case "semantic":
        return this.searchSemantic(query);
      case "hybrid":
        return this.searchHybrid(query);
      default:
        throw new Error(`Unknown search mode: ${query.mode}`);
    }
  }

  // =============================================================================
  // PRIVATE: ENTITY SEARCH
  // =============================================================================

  private async searchEntities(query: PatternSearchQuery): Promise<PatternSearchResult[]> {
    const filters: EntityFilters = {};

    // Apply entity type filter
    if (query.scope?.entityTypes) {
      filters.entityType = query.scope.entityTypes;
    }

    // Apply file path filter
    if (query.scope?.files) {
      filters.filePath = query.scope.files;
    }

    // Apply framework filter
    if (query.scope?.frameworks && this.technologyDetector) {
      const techStack = await this.technologyDetector.detectStack();
      const relevantFiles = await this.getFilesForFrameworks(query.scope.frameworks, techStack);
      filters.filePath = relevantFiles;
    }

    // Query entities with regex pattern
    filters.name = new RegExp(query.pattern, "i");

    const entities = await this.graphStorage.findEntities({
      filters,
      limit: query.limit || 100,
    });

    return entities.map((entity) => ({
      entity,
      matchType: "name",
      score: 1.0,
    }));
  }

  // =============================================================================
  // PRIVATE: CONTENT SEARCH
  // =============================================================================

  private async searchContent(query: PatternSearchQuery): Promise<PatternSearchResult[]> {
    // First, get candidate entities
    const candidates = await this.searchEntities({
      ...query,
      pattern: ".*", // Match all entities
      mode: "entity",
    });

    const results: PatternSearchResult[] = [];

    // Pre-compile regex ONCE outside the loop (critical optimization)
    const contentRegex = query.contentFilter?.regex ? new RegExp(query.contentFilter.regex, "i") : null;
    const containsFilter = query.contentFilter?.contains;
    const semanticFilter = query.contentFilter?.semantic;

    // For each candidate, check content
    for (const { entity } of candidates) {
      const content = await this.getEntityContent(entity);

      // Apply content filters (using pre-compiled regex)
      if (containsFilter && !content.includes(containsFilter)) continue;
      if (contentRegex && !contentRegex.test(content)) continue;

      if (semanticFilter) {
        // Semantic similarity check
        const similarity = await this.computeSemanticSimilarity(content, semanticFilter);
        if (similarity < 0.7) continue;
      }

      // Generate snippet
      const snippet = this.generateSnippet(content, query.pattern);

      results.push({
        entity,
        matchType: "content",
        score: 1.0,
        snippet,
      });
    }

    return results.slice(0, query.limit || 100);
  }

  // =============================================================================
  // PRIVATE: SEMANTIC SEARCH
  // =============================================================================

  private async searchSemantic(query: PatternSearchQuery): Promise<PatternSearchResult[]> {
    if (!this.vectorStore) {
      log.w("PATTERNSEARCH", "vectorstore_unavail");
      return [];
    }

    // Ensure embedding generator is initialized
    if (!this.embeddingGenerator) {
      await this.initialize();
    }

    try {
      // Generate query embedding
      if (!this.embeddingGenerator) {
        log.w("PATTERNSEARCH", "embgen_unavail_fallback");
        return this.fallbackEntitySearch(query);
      }

      const queryEmbedding = await this.embeddingGenerator.generateEmbedding(query.pattern);

      // Use searchRaw() to skip double enrichment — we resolve entities ourselves
      const rawResults = await this.vectorStore.searchRaw(queryEmbedding, query.limit || 10);

      // Pre-convert scope filters to Sets for O(1) lookups
      const entityTypesSet = query.scope?.entityTypes ? new Set(query.scope.entityTypes) : null;
      const filesSet = query.scope?.files ? new Set(query.scope.files) : null;

      // Parse entity metadata from vector IDs (format: "ent:filePath:type:name")
      const parsed: Array<{
        similarity: number;
        filePath: string;
        type: string;
        name: string;
      }> = [];
      const allFilePaths = new Set<string>();

      for (const result of rawResults) {
        const rawId = result.id.startsWith("ent:") ? result.id.slice(4) : result.id;
        if (!rawId.includes(":")) continue;

        const lastColonIdx = rawId.lastIndexOf(":");
        const secondLastColonIdx = rawId.lastIndexOf(":", lastColonIdx - 1);
        if (secondLastColonIdx <= 0) continue;

        const filePath = rawId.slice(0, secondLastColonIdx);
        const type = rawId.slice(secondLastColonIdx + 1, lastColonIdx);
        const name = rawId.slice(lastColonIdx + 1);

        // Apply scope filters early (before DB query)
        if (entityTypesSet && !entityTypesSet.has(type as EntityType)) continue;
        if (filesSet && !filesSet.has(filePath)) continue;

        parsed.push({ similarity: result.similarity, filePath, type, name });
        allFilePaths.add(filePath);
      }

      // Single batch SQL: fetch all entities for all matched filePaths at once
      const entityLookup = new Map<string, Entity>(); // key: "filePath:type:name"
      if (allFilePaths.size > 0) {
        const allEntities = await this.graphStorage.findEntities({
          filters: { filePath: [...allFilePaths] },
          limit: allFilePaths.size * 50, // generous limit for multi-file batch
        });
        for (const entity of allEntities) {
          entityLookup.set(`${entity.filePath}:${entity.type}:${entity.name}`, entity);
        }
      }

      // Resolve parsed results against DB entities
      const results: PatternSearchResult[] = [];
      for (const { similarity, filePath, type, name } of parsed) {
        const entity = entityLookup.get(`${filePath}:${type}:${name}`);
        if (!entity) continue;

        results.push({
          entity,
          matchType: "semantic",
          score: similarity,
        });
      }

      log.i("PATTERNSEARCH", "semantic_results", {
        rawHits: rawResults.length,
        parsed: parsed.length,
        resolved: results.length,
        batchFiles: allFilePaths.size,
      });

      return results;
    } catch (error) {
      log.e("PATTERNSEARCH", "semantic_fail", { err: String(error) });
      return this.fallbackEntitySearch(query);
    }
  }

  /**
   * Fallback to entity name search when semantic search is unavailable
   */
  private async fallbackEntitySearch(query: PatternSearchQuery): Promise<PatternSearchResult[]> {
    const results: PatternSearchResult[] = [];
    const entities = await this.graphStorage.searchEntities({ namePattern: query.pattern });

    // Pre-convert arrays to Sets for O(1) lookups instead of O(n)
    const entityTypesSet = query.scope?.entityTypes ? new Set(query.scope.entityTypes) : null;
    const filesSet = query.scope?.files ? new Set(query.scope.files) : null;

    for (const entity of entities.slice(0, query.limit || 10)) {
      if (entityTypesSet && !entityTypesSet.has(entity.type)) continue;
      if (filesSet && !filesSet.has(entity.filePath)) continue;

      results.push({
        entity,
        matchType: "name",
        score: 0.5, // Fallback score
      });
    }

    return results;
  }

  // =============================================================================
  // PRIVATE: HYBRID SEARCH
  // =============================================================================

  private async searchHybrid(query: PatternSearchQuery): Promise<PatternSearchResult[]> {
    // Combine entity search and content search
    const entityResults = await this.searchEntities(query);
    const contentResults = await this.searchContent(query);

    // If semantic query provided, also do vector search
    let semanticResults: PatternSearchResult[] = [];
    if (query.contentFilter?.semantic && this.vectorStore) {
      semanticResults = await this.searchSemantic({
        ...query,
        pattern: query.contentFilter.semantic,
        mode: "semantic",
      });
    }

    // Merge results with scoring
    return this.mergeResults([...entityResults, ...contentResults, ...semanticResults], query.limit);
  }

  // =============================================================================
  // PRIVATE: UTILITIES
  // =============================================================================

  private async getEntityContent(entity: Entity): Promise<string> {
    try {
      // Use optimized line-range reading instead of loading full file
      const content = await readLineRange(entity.filePath, entity.location.start.line, entity.location.end.line, 10000);
      return content || "";
    } catch (error) {
      log.w("PATTERNSEARCH", "entity_read_fail", { file: entity.filePath, err: String(error) });
      return "";
    }
  }

  private generateSnippet(content: string, pattern: string): string {
    // Find match position
    const regex = new RegExp(pattern, "i");
    const match = content.match(regex);

    if (!match) {
      // No match, return first 100 chars
      return content.slice(0, 100);
    }

    const matchStart = match.index || 0;
    const contextBefore = 50;
    const contextAfter = 50;

    const start = Math.max(0, matchStart - contextBefore);
    const end = Math.min(content.length, matchStart + match[0].length + contextAfter);

    return content.slice(start, end);
  }

  private mergeResults(results: PatternSearchResult[], limit?: number): PatternSearchResult[] {
    // Remove duplicates and sort by score
    const seen = new Set<string>();
    const unique: PatternSearchResult[] = [];

    for (const result of results) {
      if (seen.has(result.entity.id)) continue;
      seen.add(result.entity.id);
      unique.push(result);
    }

    // Sort by score (descending)
    unique.sort((a, b) => b.score - a.score);

    return limit ? unique.slice(0, limit) : unique;
  }

  private async computeSemanticSimilarity(content: string, query: string): Promise<number> {
    // Ensure embedding generator is initialized
    if (!this.embeddingGenerator) {
      await this.initialize();
    }

    if (!this.embeddingGenerator) {
      // Fallback: string matching
      return content.toLowerCase().includes(query.toLowerCase()) ? 1.0 : 0.0;
    }

    try {
      // Generate embeddings and compute cosine similarity
      const contentEmbedding = await this.embeddingGenerator.generateEmbedding(content);
      const queryEmbedding = await this.embeddingGenerator.generateEmbedding(query);

      // Use SIMD-accelerated cosine similarity
      const similarity = cosineSimilarity(contentEmbedding, queryEmbedding);

      // Normalize from [-1, 1] to [0, 1]
      return (similarity + 1) / 2;
    } catch (error) {
      log.e("PATTERNSEARCH", "sim_compute_fail", { err: String(error) });
      // Fallback: string matching
      return content.toLowerCase().includes(query.toLowerCase()) ? 1.0 : 0.0;
    }
  }

  private async getFilesForFrameworks(frameworks: string[], techStack: TechnologyStack): Promise<string[]> {
    // Get all files that use specified frameworks
    const files: string[] = [];

    for (const framework of frameworks) {
      const frameworkInfo = techStack.frameworks.find((f) => f.name === framework);
      if (!frameworkInfo) continue;

      // Get files from import analysis
      const imports = await this.graphStorage.findEntities({
        filters: { entityType: "import" as EntityType },
      });

      for (const imp of imports) {
        const source = imp.metadata.importData?.source || "";
        if (source.toLowerCase().includes(framework.toLowerCase())) {
          files.push(imp.filePath);
        }
      }
    }

    return [...new Set(files)]; // Deduplicate
  }
}
