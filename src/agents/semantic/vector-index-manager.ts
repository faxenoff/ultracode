/**
 * Vector Index Manager
 *
 * Manages vector index operations: drop, rebuild, and hotspot analysis.
 * Extracted from SemanticAgent for better modularity.
 */

import { log } from "../../logging/index.js";
import type { CodeAnalyzer } from "../../semantic/code-analyzer.js";
import type { EmbeddingGenerator } from "../../semantic/embedding-generator.js";
import type { VectorStore } from "../../semantic/vector-store.js";
import { getGraphStorage } from "../../storage/graph-storage-factory.js";
import type { SemanticAnalysis } from "../../types/semantic.js";
import type { Entity } from "../../types/storage.js";

export interface HotspotItem {
  entityId?: string | undefined;
  filePath?: string | undefined;
  name?: string | undefined;
  language?: string | undefined;
  structuralScore?: number | undefined;
  semantic?: SemanticAnalysis | undefined;
  snippet?:
    | {
        startLine?: number | undefined;
        endLine?: number | undefined;
        length?: number | undefined;
      }
    | undefined;
}

export interface AnalyzeHotspotsResult {
  metric: string;
  items: HotspotItem[];
}

/**
 * Input hotspot can be either an Entity or an object containing an entity field
 */
export type HotspotInput = Entity | { entity: Entity; [key: string]: unknown };

export class VectorIndexManager {
  constructor(
    private readonly vectorStore: VectorStore,
    private readonly codeAnalyzer: CodeAnalyzer,
    private readonly embeddingGen: EmbeddingGenerator,
  ) {}

  /**
   * Drop vector index for faster bulk inserts during initial indexing.
   * Call rebuildVectorIndex() after all embeddings are generated.
   */
  async dropVectorIndex(): Promise<void> {
    if (!this.vectorStore) return;
    log.d("VECTORINDEX", "drop_for_bulk");
    await this.vectorStore.dropVectorIndex();
  }

  /**
   * Rebuild vector index after bulk inserts.
   * Uses FAISS HNSW which supports live updates - no explicit rebuild needed.
   * Falls back to LibSQL DiskANN only if FAISS unavailable.
   */
  async rebuildVectorIndex(): Promise<{ strategy: string; usedFaiss: boolean; timeMs: number }> {
    if (!this.vectorStore) {
      return { strategy: "none", usedFaiss: false, timeMs: 0 };
    }
    log.d("VECTORINDEX", "rebuild_start");
    const result = await this.vectorStore.adaptiveRebuildIndex();
    log.i("VECTORINDEX", "rebuild_done", {
      strategy: result.strategy,
      usedFaiss: result.usedFaiss,
      ms: result.timeMs.toFixed(0),
    });
    return result;
  }

  /**
   * Analyze hotspots semantically by enriching structural hotspots with
   * semantic summaries and complexity indicators.
   * Uses parallel processing for optimal performance.
   */
  async analyzeHotspots(hotspots: HotspotInput[], metric: string): Promise<AnalyzeHotspotsResult> {
    const { readByteRange, readLineRange, readText } = await import("../../utils/file-ops.js");
    const storage = await getGraphStorage();

    const hotspotList = hotspots ?? [];
    if (hotspotList.length === 0) {
      return { metric, items: [] };
    }

    // PHASE 1: Parallel entity fetch - batch all storage.getEntity calls
    const entityIds = hotspotList
      .map((h) => {
        const entity = "entity" in h ? h.entity : h;
        return entity.id;
      })
      .filter((id): id is string => !!id);

    const BATCH_SIZE = 20;
    const storedEntitiesMap = new Map<string, Entity>();

    for (let i = 0; i < entityIds.length; i += BATCH_SIZE) {
      const batch = entityIds.slice(i, i + BATCH_SIZE);
      const results = await Promise.all(
        batch.map(async (id) => {
          try {
            return { id, entity: await storage.getEntity(id) };
          } catch {
            return { id, entity: null };
          }
        }),
      );
      for (const { id, entity } of results) {
        if (entity) storedEntitiesMap.set(id, entity);
      }
    }

    // PHASE 2: Parallel code extraction
    const codeExtractionPromises = hotspotList.map(async (h) => {
      const entity = "entity" in h ? h.entity : h;
      const filePath = entity.filePath;
      let code = "";
      let snippetInfo: { startLine?: number; endLine?: number; length?: number } | undefined;

      if (!filePath) return { entity, code, snippetInfo };

      try {
        const stored = entity.id ? storedEntitiesMap.get(entity.id) : null;

        if (
          stored?.location &&
          typeof stored.location.start?.index === "number" &&
          typeof stored.location.end?.index === "number"
        ) {
          const startIdx = Math.max(0, stored.location.start.index);
          const endIdx = stored.location.end.index;
          const snippet = await readByteRange(filePath, startIdx, endIdx, 10000);
          if (snippet) {
            code = snippet;
            snippetInfo = {
              startLine: stored.location.start.line,
              endLine: stored.location.end.line,
              length: snippet.length,
            };
          } else {
            code = await readText(filePath);
          }
        } else if (
          stored?.location &&
          typeof stored.location.start?.line === "number" &&
          typeof stored.location.end?.line === "number"
        ) {
          const startLine = stored.location.start.line || 1;
          const endLine = stored.location.end.line || startLine;
          const snippet = await readLineRange(filePath, startLine, endLine, 10000);
          if (snippet) {
            code = snippet;
            snippetInfo = { startLine, endLine, length: snippet.length };
          } else {
            code = await readText(filePath);
          }
        } else {
          code = await readText(filePath);
        }
      } catch {
        // ignore read errors
      }

      return { entity, code, snippetInfo };
    });

    const extractedData = await Promise.all(codeExtractionPromises);

    // PHASE 3: Parallel semantic analysis (with batching to avoid overload)
    const itemsWithPendingSemantic = extractedData.map((data) => ({
      ...data,
      semantic: undefined as SemanticAnalysis | undefined,
    }));

    // Process semantic analysis in batches
    for (let i = 0; i < itemsWithPendingSemantic.length; i += BATCH_SIZE) {
      const batch = itemsWithPendingSemantic.slice(i, i + BATCH_SIZE);
      await Promise.all(
        batch.map(async (item) => {
          if (!item.code) return;
          try {
            await this.embeddingGen.generateCodeEmbedding(item.code);
            item.semantic = await this.codeAnalyzer.analyzeCodeSemantics(item.code);
          } catch {
            // Semantic analysis failed - continue with structural data only
          }
        }),
      );
    }

    // Build final items array
    const items: HotspotItem[] = itemsWithPendingSemantic.map((item) => {
      const entity = item.entity as Entity & { path?: string; score?: number; complexity?: number };
      return {
        entityId: entity.id,
        filePath: entity.filePath || entity.path,
        name: entity.name,
        language: entity.language,
        structuralScore: entity.score || entity.complexity || undefined,
        semantic: item.semantic,
        snippet: item.snippetInfo,
      };
    });

    // Sort by combined score if available
    items.sort((a, b) => {
      const as = (a.structuralScore || 0) + (a.semantic?.complexity || 0);
      const bs = (b.structuralScore || 0) + (b.semantic?.complexity || 0);
      return bs - as;
    });

    return { metric, items };
  }
}
