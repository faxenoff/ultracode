import type { QueryAgent } from "../agents/query-agent.js";
import { log } from "../logging/index.js";
import type { QueryExpander } from "../nlp/query-expander.js";
import type { FusionOptions, HybridResult, SemanticResult, SimilarityResult } from "../types/semantic.js";
import type { EmbeddingGenerator } from "./embedding-generator.js";
import type { VectorStore } from "./vector-store.js";

export interface SemanticResultWithExpansion extends SemanticResult {
  expandedQuery?: string;
  expansionInfo?: {
    originalTokens: string[];
    coocTerms: Array<{ term: string; weight: number }>;
    prfTerms: Array<{ term: string; weight: number }>;
  };
}

interface StructuralResult {
  id: string;
  path: string;
  type: string;
  name: string;
  score?: number;
  content?: string | undefined;
}

interface RankedResult {
  id: string;
  score: number;
  structuralRank?: number | undefined;
  semanticRank?: number | undefined;
  content?: string | undefined;
  metadata?: Record<string, unknown> | undefined;
}

const FUSION_DEFAULTS: FusionOptions = {
  k: 60,
  structuralWeight: 0.6,
  semanticWeight: 0.4,
  limit: 10,
};

function rescaleToUnitRange(items: RankedResult[]): RankedResult[] {
  if (items.length < 2) return items;

  let lo = items[0]!.score;
  let hi = lo;
  for (let idx = 1; idx < items.length; idx++) {
    const val = items[idx]!.score;
    if (val < lo) lo = val;
    if (val > hi) hi = val;
  }

  const span = hi - lo;
  if (span === 0) {
    for (const item of items) item.score = 1;
    return items;
  }

  for (const item of items) {
    item.score = (item.score - lo) / span;
  }
  return items;
}

function eliminateDuplicateEntries(items: RankedResult[]): RankedResult[] {
  const encountered = new Map<string, true>();
  const unique: RankedResult[] = [];
  for (const item of items) {
    if (!encountered.has(item.id)) {
      encountered.set(item.id, true);
      unique.push(item);
    }
  }
  return unique;
}

function classifyResultOrigin(entry: RankedResult): "structural" | "semantic" | "hybrid" {
  if (entry.structuralRank !== undefined && entry.semanticRank !== undefined) return "hybrid";
  if (entry.structuralRank !== undefined) return "structural";
  return "semantic";
}

export class HybridSearchEngine {
  private vectorStore: VectorStore;
  private embeddingGen: EmbeddingGenerator;
  private queryAgent: QueryAgent | null;
  private queryExpander: QueryExpander | null = null;
  private searchMetrics = {
    totalSearches: 0,
    avgSearchTime: 0,
    avgResultCount: 0,
  };

  constructor(vectorStore: VectorStore, embeddingGen: EmbeddingGenerator, queryAgent?: QueryAgent) {
    this.vectorStore = vectorStore;
    this.embeddingGen = embeddingGen;
    this.queryAgent = queryAgent ?? null;
  }

  setQueryExpander(expander: QueryExpander): void {
    this.queryExpander = expander;
    log.i("HYBRID", "QueryExpander configured");
  }

  setQueryAgent(queryAgent: QueryAgent): void {
    this.queryAgent = queryAgent;
  }

  async search(query: string, options: Partial<FusionOptions> = {}): Promise<HybridResult[]> {
    const t0 = Date.now();
    const opts: FusionOptions = { ...FUSION_DEFAULTS, ...options };

    try {
      const queryVector = await this.embeddingGen.generateEmbedding(query);

      const fetchLimit = opts.limit * 2;
      const [structuralHits, vectorSearchOutput] = await Promise.all([
        this.runStructuralSearch(query, fetchLimit),
        this.vectorStore.adaptiveSearch(queryVector, fetchLimit),
      ]);

      log.d(
        "HYBRID",
        `Found ${structuralHits.length} structural and ${vectorSearchOutput.results.length} semantic results`,
        {
          usedFaiss: vectorSearchOutput.usedFaiss,
        },
      );

      const merged = this.applyReciprocalRankFusion(structuralHits, vectorSearchOutput.results, opts);

      const elapsed = Date.now() - t0;
      this.recordMetrics(elapsed, merged.length);

      log.i("HYBRID", `Hybrid search complete`, {
        resultsCount: merged.length,
        searchTimeMs: elapsed,
      });

      return merged;
    } catch (err) {
      log.e("HYBRID", "Hybrid search failed", { error: (err as Error).message });
      throw err;
    }
  }

  async semanticSearch(query: string, limit = 10): Promise<SemanticResultWithExpansion> {
    const t0 = Date.now();

    try {
      if (this.queryExpander) {
        return await this.twoPassExpandedSearch(query, limit, t0);
      }

      const embedding = await this.embeddingGen.generateEmbedding(query);
      const outcome = await this.vectorStore.adaptiveSearch(embedding, limit);

      return {
        query,
        results: outcome.results,
        processingTime: Date.now() - t0,
      };
    } catch (err) {
      log.e("HYBRID", "Semantic search failed", { query, error: (err as Error).message });
      throw err;
    }
  }

  async rerank(
    results: HybridResult[],
    query: string,
    scoreFunction?: (result: HybridResult, query: string) => number,
  ): Promise<HybridResult[]> {
    const scorer = scoreFunction ?? defaultTermMatchScorer;

    const boosted = results.map((entry) => ({
      ...entry,
      score: entry.score * 0.7 + scorer(entry, query) * 0.3,
    }));

    boosted.sort((a, b) => b.score - a.score);
    return boosted;
  }

  getMetrics(): typeof this.searchMetrics {
    return { ...this.searchMetrics };
  }

  clearCaches(): void {
    this.embeddingGen.clearCache();
    log.i("HYBRID", "Caches cleared");
  }

  private async runStructuralSearch(query: string, limit: number): Promise<StructuralResult[]> {
    if (!this.queryAgent) {
      log.d("HYBRID", "QueryAgent not available, skipping structural search");
      return [];
    }

    try {
      const task = {
        id: `search-${Date.now()}`,
        type: "search",
        priority: 5,
        payload: { query, limit },
        createdAt: Date.now(),
      };

      const output = (await this.queryAgent.process(task)) as StructuralResult[];
      return output ?? [];
    } catch (err) {
      log.e("HYBRID", "Structural search failed", { error: (err as Error).message });
      return [];
    }
  }

  private applyReciprocalRankFusion(
    structural: StructuralResult[],
    semantic: SimilarityResult[],
    opts: FusionOptions,
  ): HybridResult[] {
    const accumulator = new Map<string, RankedResult>();
    const kConst = opts.k;

    const computeRrf = (rank: number, weight: number) => weight / (kConst + rank + 1);

    for (let rank = 0; rank < structural.length; rank++) {
      const entry = structural[rank]!;
      const rrfContribution = computeRrf(rank, opts.structuralWeight);

      const prev = accumulator.get(entry.id);
      if (prev) {
        prev.score += rrfContribution;
        prev.structuralRank = rank;
      } else {
        accumulator.set(entry.id, {
          id: entry.id,
          score: rrfContribution,
          structuralRank: rank,
          content: entry.content,
          metadata: { path: entry.path, type: entry.type, name: entry.name },
        });
      }
    }

    for (let rank = 0; rank < semantic.length; rank++) {
      const entry = semantic[rank]!;
      const rrfContribution = computeRrf(rank, opts.semanticWeight);

      const prev = accumulator.get(entry.id);
      if (prev) {
        prev.score += rrfContribution;
        prev.semanticRank = rank;
        if (entry.metadata) {
          prev.metadata = { ...prev.metadata, ...entry.metadata };
        }
      } else {
        accumulator.set(entry.id, {
          id: entry.id,
          score: rrfContribution,
          semanticRank: rank,
          content: entry.content,
          metadata: entry.metadata,
        });
      }
    }

    const ranked = Array.from(accumulator.values());
    ranked.sort((a, b) => b.score - a.score);
    const topN = ranked.slice(0, opts.limit);

    const normalized = rescaleToUnitRange(topN);
    const deduped = eliminateDuplicateEntries(normalized);

    return deduped.map((r) => ({
      id: r.id,
      score: r.score,
      source: classifyResultOrigin(r),
      content: r.content,
      metadata: r.metadata,
    }));
  }

  private async twoPassExpandedSearch(
    query: string,
    limit: number,
    startedAt: number,
  ): Promise<SemanticResultWithExpansion> {
    const firstPassEmb = await this.embeddingGen.generateEmbedding(query);
    const firstPassHits = await this.vectorStore.adaptiveSearch(firstPassEmb, 5);

    const prfDocuments = firstPassHits.results.map((r) => ({ content: r.content || "" }));
    const expansion = await this.queryExpander!.expand(query, prfDocuments);

    log.d("HYBRID", "Query expanded", {
      original: query,
      expanded: expansion.expanded,
      coocTerms: expansion.coocTerms.length,
      prfTerms: expansion.prfTerms.length,
    });

    const expandedEmb = await this.embeddingGen.generateEmbedding(expansion.expanded);
    const finalHits = await this.vectorStore.adaptiveSearch(expandedEmb, limit);

    return {
      query,
      expandedQuery: expansion.expanded,
      results: finalHits.results,
      processingTime: Date.now() - startedAt,
      expansionInfo: {
        originalTokens: expansion.originalTokens,
        coocTerms: expansion.coocTerms,
        prfTerms: expansion.prfTerms,
      },
    };
  }

  private recordMetrics(elapsedMs: number, resultCount: number): void {
    const prev = this.searchMetrics;
    const count = prev.totalSearches + 1;

    this.searchMetrics = {
      totalSearches: count,
      avgSearchTime: prev.avgSearchTime + (elapsedMs - prev.avgSearchTime) / count,
      avgResultCount: prev.avgResultCount + (resultCount - prev.avgResultCount) / count,
    };
  }
}

function defaultTermMatchScorer(result: HybridResult, query: string): number {
  const words = query.toLowerCase().split(/\s+/);
  const text = (result.content ?? "").toLowerCase();
  if (words.length === 0) return 0;

  let hits = 0;
  for (const w of words) {
    if (text.includes(w)) hits++;
  }
  return hits / words.length;
}
