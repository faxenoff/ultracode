/**
 * Comment Processor Module
 *
 * Handles standalone comment processing and embedding generation.
 * Extracted from semantic-agent.ts for better modularity.
 *
 * Main responsibilities:
 * - Extract comments from files
 * - Create comment entities
 * - Generate embeddings for comments
 * - Create documentation relationships
 */

import { log } from "../../logging/index.js";
import type { EmbeddingGenerator } from "../../semantic/embedding-generator.js";
import type { VectorStore } from "../../semantic/vector-store.js";
import type { Entity, GraphStorage, Relationship } from "../../types/storage.js";
import type { CommentBlock, CommentExtractionResult } from "../../utils/comment-extractor.js";

// =============================================================================
// CONTEXT INTERFACE
// =============================================================================

/**
 * Context for comment processing
 */
export interface CommentProcessorContext {
  embeddingGen: EmbeddingGenerator;
  vectorStore: VectorStore;
  embeddingDim: number;
  embeddingMutex: Promise<void>;
  setEmbeddingMutex: (p: Promise<void>) => void;
}

// =============================================================================
// MAIN PROCESSING FUNCTION
// =============================================================================

/**
 * Process standalone comments and create comment entities + relationships
 *
 * @param commentsByFile - Map of file path to extracted comments
 * @param associationsByFile - Map of file path to entity-comment associations
 * @param storage - Graph storage instance
 * @param ctx - Comment processor context
 */
export async function processStandaloneComments(
  commentsByFile: Map<string, CommentExtractionResult>,
  associationsByFile: Map<string, Map<string, CommentBlock[]>>,
  storage: GraphStorage,
  ctx: CommentProcessorContext,
): Promise<{ entities: number; relationships: number }> {
  log.t("COMMENT", "process_start");

  // Detailed profiling for comments processing
  const pStart = Date.now();
  const pLog = (phase: string) => {
    const elapsed = Date.now() - pStart;
    log.d("COMMENT", phase, { ms: elapsed });
  };

  const { CommentExtractor } = await import("../../utils/comment-extractor.js");
  pLog("P1_IMPORT");

  log.t("COMMENT", "import_done");

  // OPTIMIZATION: Collect all entities and relationships first, then batch insert
  const allCommentEntities: Entity[] = [];
  const allRelationships: Relationship[] = [];
  const filePathsToQuery = Array.from(commentsByFile.keys());

  // Phase 1: Parallel fetch all file entities (instead of sequential per-file)
  const FETCH_CONCURRENCY = 20;
  const fileEntitiesMap = new Map<string, Entity[]>();

  for (let i = 0; i < filePathsToQuery.length; i += FETCH_CONCURRENCY) {
    const batch = filePathsToQuery.slice(i, i + FETCH_CONCURRENCY);
    const results = await Promise.all(
      batch.map((filePath) => storage.findEntities({ filters: { filePath }, limit: 10000 }).catch(() => [])),
    );
    for (let j = 0; j < batch.length; j++) {
      fileEntitiesMap.set(batch[j]!, results[j] || []);
    }
  }
  pLog("P2_FETCH_FILE_ENTITIES");

  // Phase 2: Create all comment entities and relationships (CPU-only, no await)
  for (const [filePath, commentsResult] of commentsByFile.entries()) {
    const associations = associationsByFile.get(filePath) || new Map();
    const fileEntities = fileEntitiesMap.get(filePath) || [];

    const commentEntities = CommentExtractor.createCommentEntities(commentsResult.comments, filePath, associations);
    const relationships = CommentExtractor.createDocumentationRelationships(
      commentEntities,
      fileEntities,
      associations,
    );

    allCommentEntities.push(...commentEntities);
    allRelationships.push(...relationships);
  }
  pLog("P3_BUILD_ENTITIES");

  if (allCommentEntities.length === 0) {
    log.t("COMMENT", "no_comments");
    return { entities: 0, relationships: 0 };
  }

  // Phase 3: Batch insert all entities
  let releaseMutex: () => void;
  const prevMutex = ctx.embeddingMutex;
  const newMutex = new Promise<void>((resolve) => {
    releaseMutex = resolve;
  });
  ctx.setEmbeddingMutex(newMutex);
  await prevMutex;

  try {
    // Batch insert all entities in one DB operation
    await storage.insertEntities(allCommentEntities);
    pLog("P4_INSERT_ENTITIES");

    // Phase 4: Generate embeddings in one big batch
    const commentTexts = allCommentEntities.map((c) => (c.metadata?.["content"] as string) || "");
    const commentEmbeddings = await ctx.embeddingGen.generateBatch(commentTexts);
    pLog("P5_GENERATE_EMBEDDINGS");

    // Phase 5: Batch insert into vector store
    const vectorEmbeddings = allCommentEntities.map((entity, i) => ({
      id: `ent:${entity.id}`,
      content: (commentTexts[i] as string) ?? "",
      vector: commentEmbeddings[i] ?? new Float32Array(ctx.embeddingDim),
      metadata: {
        path: entity.filePath,
        type: entity.type,
        name: entity.name,
        entityId: entity.id,
        isComment: true,
        commentType: entity.metadata?.["commentType"],
      },
      createdAt: Date.now(),
    }));

    await ctx.vectorStore.adaptiveBulkInsert(vectorEmbeddings);
    pLog("P6_VECTOR_INSERT");

    // Batch insert all relationships in one DB operation
    await storage.insertRelationships(allRelationships);
    pLog("P7_INSERT_RELATIONSHIPS");

    log.d("COMMENT", "indexed_batch", { entities: allCommentEntities.length, rels: allRelationships.length });
  } catch (error) {
    log.w("COMMENT", "batch_failed", { err: (error as Error).message });
  } finally {
    releaseMutex!();
  }

  log.t("COMMENT", "process_done", { entities: allCommentEntities.length, rels: allRelationships.length });

  return { entities: allCommentEntities.length, relationships: allRelationships.length };
}
