import { log } from "../../logging/index.js";
import type { EmbeddingGenerator } from "../../semantic/embedding-generator.js";
import type { CodeUnit } from "../models/code-unit.js";
import { type Resolution, ResolutionStrategy, type SemanticConflict } from "../models/semantic-conflict.js";
import { diff3Merge } from "./diff3.js";

/**
 * AI-Assisted Conflict Resolver - Uses embeddings for intelligent conflict resolution
 *
 * Features:
 * - Semantic similarity analysis for code from different branches
 * - Intent prediction based on vector proximity to known patterns
 * - Confidence scoring accounting for semantic distance
 * - Intelligent merge suggestions for compatible changes
 */

export interface AIConflictResolverConfig {
  // Embedding settings
  embeddingGenerator: EmbeddingGenerator;

  // Similarity thresholds
  highSimilarityThreshold: number; // default: 0.9 - very similar changes
  mediumSimilarityThreshold: number; // default: 0.7 - moderately similar
  lowSimilarityThreshold: number; // default: 0.5 - slightly similar

  // Confidence settings
  minConfidenceForAutoMerge: number; // default: 0.8
  minConfidenceForSuggestion: number; // default: 0.6
}

/**
 * AI conflict analysis result
 */
export interface AIAnalysisResult {
  // Semantic similarity between branchA and branchB
  similarity: number;

  // Semantic distance from base to each branch
  branchADistance: number;
  branchBDistance: number;

  // Predicted resolution strategy
  suggestedStrategy: ResolutionStrategy;

  // Confidence in the suggested strategy
  confidence: number;

  // Explanation of the decision
  explanation: string;

  // Merged code (if AI was able to generate it)
  mergedCode?: string | undefined;
}

export class AIConflictResolver {
  private config: AIConflictResolverConfig;
  private embeddingCache: Map<string, Float32Array> = new Map();

  constructor(config: AIConflictResolverConfig) {
    this.config = config;
  }

  /**
   * Analyze a conflict using AI
   *
   * @param conflict - Conflict to analyze
   * @returns AI analysis result
   */
  async analyzeConflict(conflict: SemanticConflict): Promise<AIAnalysisResult> {
    const { baseUnit, branchAUnit, branchBUnit } = conflict;

    // Generate embeddings for all three versions
    const [baseEmbedding, branchAEmbedding, branchBEmbedding] = await Promise.all([
      this.getEmbedding(baseUnit),
      this.getEmbedding(branchAUnit),
      this.getEmbedding(branchBUnit),
    ]);

    // Calculate semantic similarities
    const similarity = this.cosineSimilarity(branchAEmbedding, branchBEmbedding);
    const branchADistance =
      baseEmbedding && branchAEmbedding ? this.cosineDistance(baseEmbedding, branchAEmbedding) : 0;
    const branchBDistance =
      baseEmbedding && branchBEmbedding ? this.cosineDistance(baseEmbedding, branchBEmbedding) : 0;

    // Determine strategy based on similarity analysis
    const { strategy, confidence, explanation, mergedCode } = this.determineStrategy(
      conflict,
      similarity,
      branchADistance,
      branchBDistance,
    );

    return {
      similarity,
      branchADistance,
      branchBDistance,
      suggestedStrategy: strategy,
      confidence,
      explanation,
      mergedCode,
    };
  }

  /**
   * Get or generate embedding for a code unit
   */
  private async getEmbedding(unit: CodeUnit | null): Promise<Float32Array | null> {
    if (!unit) return null;

    // Check cache
    const cacheKey = this.getCacheKey(unit);
    if (this.embeddingCache.has(cacheKey)) {
      return this.embeddingCache.get(cacheKey)!;
    }

    // Use existing embedding if available
    if (unit.embedding) {
      this.embeddingCache.set(cacheKey, unit.embedding);
      return unit.embedding;
    }

    // Generate new embedding
    try {
      const text = this.prepareTextForEmbedding(unit);
      const embedding = await this.config.embeddingGenerator.generateEmbedding(text);

      this.embeddingCache.set(cacheKey, embedding);
      return embedding;
    } catch (error) {
      log.w("AICONFLICT", "embedding_fail", { id: unit.id, err: String(error) });
      return null;
    }
  }

  /**
   * Prepare text for embedding
   */
  private prepareTextForEmbedding(unit: CodeUnit): string {
    // Include context: name, signature, content
    const parts: string[] = [];

    if (unit.fullyQualifiedName) {
      parts.push(`Name: ${unit.fullyQualifiedName}`);
    }

    if (unit.signature) {
      parts.push(`Signature: ${unit.signature}`);
    }

    if (unit.content) {
      // Normalize content: remove extra whitespace
      const normalized = unit.content.trim().replace(/\s+/g, " ");
      parts.push(`Code: ${normalized}`);
    }

    return parts.join("\n");
  }

  /**
   * Determine resolution strategy based on similarity analysis
   */
  private determineStrategy(
    conflict: SemanticConflict,
    similarity: number,
    branchADistance: number,
    branchBDistance: number,
  ): {
    strategy: ResolutionStrategy;
    confidence: number;
    explanation: string;
    mergedCode?: string | undefined;
  } {
    const { branchAUnit, branchBUnit } = conflict;

    // Case 1: Very high similarity - likely same change
    if (similarity >= this.config.highSimilarityThreshold) {
      // Choose the branch with smaller distance from base
      const preferA = branchADistance <= branchBDistance;

      return {
        strategy: preferA ? ResolutionStrategy.TakeBranchA : ResolutionStrategy.TakeBranchB,
        confidence: 0.95,
        explanation: `Both branches made semantically similar changes (similarity: ${similarity.toFixed(2)}). Choosing ${preferA ? "branchA" : "branchB"} as it's closer to base.`,
        mergedCode: preferA ? branchAUnit.content : branchBUnit.content,
      };
    }

    // Case 2: Medium similarity - compatible changes
    if (similarity >= this.config.mediumSimilarityThreshold) {
      // Try intelligent merge
      const mergedCode = this.attemptIntelligentMerge(conflict, similarity);

      if (mergedCode) {
        return {
          strategy: ResolutionStrategy.MergeBoth,
          confidence: 0.7 + similarity * 0.2, // 0.7-0.9 range
          explanation: `Changes are semantically compatible (similarity: ${similarity.toFixed(2)}). AI-generated merge proposed.`,
          mergedCode,
        };
      }

      // If AI merge failed - suggest manual review
      return {
        strategy: ResolutionStrategy.ManualReview,
        confidence: 0.6,
        explanation: `Changes are moderately similar (${similarity.toFixed(2)}) but automatic merge is uncertain. Manual review recommended.`,
      };
    }

    // Case 3: Low similarity - divergent changes
    if (similarity >= this.config.lowSimilarityThreshold) {
      return {
        strategy: ResolutionStrategy.ManualReview,
        confidence: 0.4,
        explanation: `Changes are semantically different (similarity: ${similarity.toFixed(2)}). Manual review required.`,
      };
    }

    // Case 4: Very low similarity - completely different
    return {
      strategy: ResolutionStrategy.ManualReview,
      confidence: 0.2,
      explanation: `Changes are semantically divergent (similarity: ${similarity.toFixed(2)}). Careful manual review strongly recommended.`,
    };
  }

  /**
   * Attempt intelligent merge based on semantic analysis
   *
   * Heuristic: if changes are semantically close, try to combine them
   */
  private attemptIntelligentMerge(conflict: SemanticConflict, similarity: number): string | null {
    const { baseUnit, branchAUnit, branchBUnit } = conflict;

    if (!baseUnit?.content) return null;

    const result = diff3Merge(baseUnit.content, branchAUnit.content, branchBUnit.content);

    // Clean merge — no conflicts at all
    if (!result.hasConflicts) return result.mergedContent;

    // With high similarity and few conflicts, return content with markers
    // so downstream can present partial merge to user
    if (result.conflictCount <= 2 && similarity >= 0.8) {
      return result.mergedContent;
    }

    return null;
  }

  /**
   * Cosine similarity between two vectors (0-1, where 1 = identical)
   */
  private cosineSimilarity(a: Float32Array | null, b: Float32Array | null): number {
    if (!a || !b || a.length !== b.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      const aVal = a[i] ?? 0;
      const bVal = b[i] ?? 0;
      dotProduct += aVal * bVal;
      normA += aVal * aVal;
      normB += bVal * bVal;
    }

    const denominator = Math.sqrt(normA) * Math.sqrt(normB);
    if (denominator === 0) return 0;

    return dotProduct / denominator;
  }

  /**
   * Cosine distance (1 - similarity)
   */
  private cosineDistance(a: Float32Array, b: Float32Array): number {
    const similarity = this.cosineSimilarity(a, b);
    return 1 - similarity;
  }

  /**
   * Cache key for embedding
   */
  private getCacheKey(unit: CodeUnit): string {
    return `${unit.id}-${unit.contentHash}`;
  }

  /**
   * Create Resolution based on AI analysis
   */
  createResolution(aiAnalysis: AIAnalysisResult): Resolution {
    return {
      strategy: aiAnalysis.suggestedStrategy,
      confidence: aiAnalysis.confidence,
      mergedCode: aiAnalysis.mergedCode || "",
      explanation: aiAnalysis.explanation,
    };
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.embeddingCache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; maxSize: number } {
    return {
      size: this.embeddingCache.size,
      maxSize: 1000, // Can be made configurable
    };
  }
}
