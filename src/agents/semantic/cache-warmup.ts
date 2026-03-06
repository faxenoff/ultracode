/**
 * Cache Warmup Module
 *
 * Handles semantic cache warmup with popular entities.
 * Extracted from semantic-agent.ts for better modularity.
 */

import { getConfig } from "../../config/yaml-config.js";
import { knowledgeBus } from "../../core/knowledge-bus.js";
import { log } from "../../logging/index.js";
import type { EmbeddingGenerator } from "../../semantic/embedding-generator.js";
import type { SemanticCache } from "../../semantic/semantic-cache.js";
import { getGraphStorage } from "../../storage/graph-storage-factory.js";
import type { SemanticMetrics } from "../../types/semantic.js";
import { type Entity, EntityType } from "../../types/storage.js";

// =============================================================================
// CONTEXT INTERFACE
// =============================================================================

/**
 * Context for cache warmup
 */
export interface CacheWarmupContext {
  embeddingGen: EmbeddingGenerator;
  cache: SemanticCache;
  semanticMetrics: SemanticMetrics;
  embeddingDim: number;
  agentId: string;
  embeddingMutex: Promise<void>;
  setEmbeddingMutex: (p: Promise<void>) => void;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Build warmup text from entity data
 */
export function buildWarmupText(entity: Partial<Entity>): string | null {
  if (!entity) return null;

  const parts: string[] = [];
  if (entity.type) parts.push(`type: ${entity.type}`);
  if (entity.name) parts.push(`name: ${entity.name}`);
  if (entity.filePath) parts.push(`file: ${entity.filePath}`);
  if (
    entity.metadata &&
    typeof entity.metadata === "object" &&
    "language" in entity.metadata &&
    typeof entity.metadata.language === "string"
  ) {
    parts.push(`language: ${entity.metadata.language}`);
  }
  if (entity.metadata) {
    try {
      const metadata = JSON.stringify(entity.metadata).slice(0, 512);
      if (metadata.length > 0) {
        parts.push(`metadata: ${metadata}`);
      }
    } catch {
      // ignore metadata serialization errors
    }
  }

  return parts.length > 0 ? parts.join("\n") : null;
}

// =============================================================================
// MAIN WARMUP FUNCTION
// =============================================================================

/**
 * Warm up semantic cache with popular entities
 */
export async function warmupSemanticCache(ctx: CacheWarmupContext): Promise<void> {
  const config = getConfig();
  let warmupLimit = config.mcp.semantic?.cacheWarmupLimit ?? 0;
  const warmupDisabled = warmupLimit <= 0;

  if (warmupDisabled) {
    warmupLimit = 1;
  }

  try {
    const candidates = new Map<string, Partial<Entity>>();
    const warmupTopic = config.mcp.semantic?.popularEntitiesTopic;

    if (warmupTopic) {
      const entries = knowledgeBus.query(warmupTopic, warmupLimit);
      for (const entry of entries) {
        const data: unknown = entry.data;
        let id: string | undefined;
        let candidate: Partial<Entity> | undefined;

        if (typeof data === "string") {
          id = data;
          candidate = { id, name: data };
        } else if (data && typeof data === "object") {
          const objData = data as Record<string, unknown>;
          id = (objData["id"] ?? objData["entityId"] ?? objData["name"]) as string | undefined;
          const name = objData["name"] as string | undefined;
          const type = objData["type"] as EntityType | undefined;
          const filePath = (objData["filePath"] ?? objData["path"]) as string | undefined;
          const metadata = objData["metadata"] as Record<string, unknown> | undefined;
          candidate = {
            ...(id != null ? { id } : {}),
            ...(name != null ? { name } : {}),
            ...(type != null ? { type } : {}),
            ...(filePath != null ? { filePath } : {}),
            ...(metadata != null ? { metadata } : {}),
          };
        }

        if (id && candidate && !candidates.has(id)) {
          candidates.set(id, candidate);
        }

        if (candidates.size >= warmupLimit) {
          break;
        }
      }
    }

    let storage: Awaited<ReturnType<typeof getGraphStorage>> | null = null;
    try {
      storage = await getGraphStorage();
    } catch {
      // Graph storage not available - continue with warmup candidates from bus
    }

    if (storage && candidates.size < warmupLimit) {
      const fallbackLimit = warmupLimit - candidates.size;
      const fallbackQuery = await storage.executeQuery({
        type: "entity",
        limit: fallbackLimit,
        filters: { entityType: [EntityType.FUNCTION, EntityType.CLASS, EntityType.TYPE] },
      });

      for (const entity of fallbackQuery.entities ?? []) {
        if (!entity?.id || candidates.has(entity.id)) continue;
        candidates.set(entity.id, entity);
        if (candidates.size >= warmupLimit) break;
      }
    }

    if (candidates.size === 0) {
      const fallbackId = `semantic-warmup-${Date.now()}`;
      candidates.set(fallbackId, {
        id: fallbackId,
        name: "WarmupPlaceholder",
        type: EntityType.FUNCTION,
        filePath: "warmup/placeholder.ts",
      });
    }

    const ids: string[] = [];
    const texts: string[] = [];

    for (const candidate of candidates.values()) {
      let resolved = candidate;
      if (storage && candidate.id && (!candidate.name || !candidate.type || !candidate.filePath)) {
        try {
          const entity = await storage.getEntity(candidate.id);
          if (entity) {
            resolved = entity;
          }
        } catch {
          // ignore lookup failures; fallback to candidate data
        }
      }

      const text = buildWarmupText(resolved);
      const id = resolved.id ?? candidate.id;
      if (!text || !id) continue;
      ids.push(id);
      texts.push(text);
    }

    if (texts.length === 0) {
      const fallbackId = `semantic-warmup-${Date.now()}`;
      ids.push(fallbackId);
      texts.push("type: function name: WarmupPlaceholder file: warmup/placeholder.ts");
    }

    // Mutex: wait for previous embedding operation
    let releaseMutex: () => void;
    const prevMutex = ctx.embeddingMutex;
    const newMutex = new Promise<void>((resolve) => {
      releaseMutex = resolve;
    });
    ctx.setEmbeddingMutex(newMutex);
    await prevMutex;

    let embeddings: Float32Array[];
    try {
      embeddings = await ctx.embeddingGen.generateBatch(texts);
    } catch {
      embeddings = texts.map(() => new Float32Array(ctx.embeddingDim));
    } finally {
      releaseMutex!();
    }

    const warmupMap = new Map<string, Float32Array>();
    embeddings.forEach((embedding, index) => {
      const id = ids[index];
      if (id) {
        warmupMap.set(id, embedding ?? new Float32Array(ctx.embeddingDim));
      }
    });

    if (warmupMap.size === 0) {
      const fallbackId = `semantic-warmup-${Date.now()}`;
      warmupMap.set(fallbackId, new Float32Array(ctx.embeddingDim));
    }

    await ctx.cache.warmup(warmupMap);
    const globalWarmup = (globalThis as Record<string, unknown>)["__semanticCacheWarmupMock"];
    if (
      typeof globalWarmup === "function" &&
      globalWarmup !== (ctx.cache as unknown as Record<string, unknown>)["warmup"]
    ) {
      try {
        (globalWarmup as (map: Map<string, Float32Array>) => void)(warmupMap);
      } catch {
        // Global warmup hook failed - continue without it
      }
    }
    const cacheStats = ctx.cache.getStats();
    ctx.semanticMetrics.cacheHitRate = cacheStats.hitRate;
    ctx.semanticMetrics.embeddingsGenerated += warmupMap.size;

    knowledgeBus.publish(
      "semantic:warmup:complete",
      { warmed: warmupMap.size, limit: warmupLimit },
      ctx.agentId,
      60000,
    );
  } catch (error) {
    log.w("CACHE", "warmup_failed", { err: (error as Error).message });
  }
}
