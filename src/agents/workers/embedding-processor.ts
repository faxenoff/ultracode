/**
 * Embedding Processor for Generic Language Worker
 *
 * Handles embedding generation in worker context:
 * - Initialize lightweight HTTP embedding client
 * - Build embedding text for entities
 * - Generate embeddings in batches with concurrency
 * - Send embeddings via binary IPC transfer to main process
 *
 * Extracted from generic-language-worker.ts for better modularity.
 */

import type { ParsedEntity } from "../../types/parser.js";
import type { WorkerEmbeddingConfig } from "../../types/semantic.js";
import { workerLog } from "./worker-logging.js";

// =============================================================================
// Types
// =============================================================================

/**
 * Extended ParsedEntity with optional documentation field
 */
interface ParsedEntityExtended extends ParsedEntity {
  documentation?: {
    description?: string;
    params?: Array<{ name: string; type?: string; description?: string }>;
    returns?: { type?: string; description?: string };
  };
}

/**
 * Collected embeddings for batch transfer to main process
 * Uses ArrayBuffer for binary transfer (zero-copy via transferList)
 */
export interface CollectedEmbedding {
  id: string;
  vectorBuffer: ArrayBuffer; // Binary data for zero-copy transfer
  content: string;
  metadata?: Record<string, unknown>;
}

/**
 * Worker message for embeddings ready
 */
interface EmbeddingsReadyMessage {
  type: "embeddings.ready";
  count: number;
  embeddings: CollectedEmbedding[];
}

/**
 * Worker message for collected texts (centralized mode)
 */
interface EmbeddingsTextsMessage {
  type: "embeddings.texts";
  count: number;
  texts: Array<{
    id: string;
    text: string;
    metadata?: Record<string, unknown>;
  }>;
}

/**
 * Union type for worker messages
 */
type WorkerMessage = EmbeddingsReadyMessage | EmbeddingsTextsMessage;

export interface EmbeddingProcessorContext {
  postWorkerMessage: (message: WorkerMessage, transferList?: ArrayBuffer[]) => void;
  getWorkerId: () => string;
}

// =============================================================================
// State
// =============================================================================

/**
 * Entity types excluded from embedding generation.
 * Low-value types that don't provide semantic value for code search.
 *
 * Note: method/async_function/property are NOT excluded because:
 * - Kotlin uses async_function for suspend fun (should be searchable)
 * - method is used for standalone methods in Java/Kotlin/Go
 * - Large classes get truncated, so methods need separate embeddings
 */
const EMBEDDING_EXCLUDE_ENTITY_TYPES = new Set(["import", "export", "module", "variable"]);

/** Lightweight embedding client instance */
let embeddingClient: import("./worker-embedding-client.js").WorkerEmbeddingClient | null = null;
let embeddingClientInitPromise: Promise<void> | null = null;

/** Worker embedding configuration received from main process */
let embeddingConfig: WorkerEmbeddingConfig | null = null;

/** Global pre-built embedding cache — avoids TEI calls for known stdlib/framework patterns */
let workerGlobalCache: import("./worker-global-cache.js").WorkerGlobalCache | null = null;

/** Local deduplication: track entity IDs already processed in this worker session */
const generatedEntityIds = new Set<string>();

/** Collected embeddings for IPC transfer */
const collectedEmbeddings: CollectedEmbedding[] = [];

/**
 * Collected texts for centralized embedding generation (OVMS/llamacpp mode).
 * Workers send texts to Main, Main generates embeddings via single connection.
 */
interface CollectedTextItem {
  id: string;
  text: string;
  metadata?: Record<string, unknown>;
}
const collectedTexts: CollectedTextItem[] = [];

// =============================================================================
// Client Initialization
// =============================================================================

/**
 * Get current embedding config
 */
export function getEmbeddingConfig(): WorkerEmbeddingConfig | null {
  return embeddingConfig;
}

/**
 * Set embedding config
 */
export function setEmbeddingConfig(config: WorkerEmbeddingConfig): void {
  embeddingConfig = config;
}

/**
 * Clear deduplication cache for specified files.
 * Used during incremental indexing to force re-generation of embeddings
 * for modified files.
 */
export function clearDeduplicationForFiles(filePaths: string[]): number {
  if (filePaths.length === 0 || generatedEntityIds.size === 0) {
    return 0;
  }

  let clearedCount = 0;
  const pathsSet = new Set(filePaths);

  // Entity IDs have format: ent:{filePath}:{type}:{name}
  // We need to remove all IDs that contain any of the given file paths
  for (const entityId of generatedEntityIds) {
    // Extract file path from entity ID (after "ent:" prefix)
    const idWithoutPrefix = entityId.startsWith("ent:") ? entityId.slice(4) : entityId;

    // Check if any of the target file paths matches the start of the ID
    for (const targetPath of pathsSet) {
      if (idWithoutPrefix.startsWith(targetPath)) {
        generatedEntityIds.delete(entityId);
        clearedCount++;
        break;
      }
    }
  }

  if (clearedCount > 0) {
    workerLog("DEBUG", `Cleared deduplication cache for ${clearedCount} entities from ${filePaths.length} files`);
  }

  return clearedCount;
}

/**
 * Get embedding client
 */
export function getEmbeddingClient(): import("./worker-embedding-client.js").WorkerEmbeddingClient | null {
  return embeddingClient;
}

/**
 * Initialize lightweight embedding client with config from main process.
 * In centralized mode (OVMS/llamacpp), we skip client initialization - texts go to Main.
 */
export async function initEmbeddingClient(config: WorkerEmbeddingConfig): Promise<void> {
  if (!config.enabled) {
    workerLog("INFO", "Embeddings disabled in worker config");
    return;
  }

  // Centralized mode: don't initialize HTTP client, texts will be sent to Main
  // But still load global cache so known patterns are skipped before going to Main
  if (config.centralizedEmbeddings) {
    workerLog("INFO", "Centralized embedding mode - skipping WorkerEmbeddingClient init", {
      provider: config.provider,
    });
    const { getWorkerGlobalCache } = await import("./worker-global-cache.js");
    workerGlobalCache = getWorkerGlobalCache();
    await workerGlobalCache.load(config.modelName, config.dimensions ?? 384);
    if (workerGlobalCache.size > 0) {
      workerLog("INFO", `WorkerGlobalCache loaded: ${workerGlobalCache.size} pre-built embeddings`);
    }
    return;
  }

  if (embeddingClientInitPromise) {
    await embeddingClientInitPromise;
    return;
  }

  embeddingClientInitPromise = (async () => {
    try {
      workerLog("INFO", `Initializing WorkerEmbeddingClient`, { provider: config.provider, model: config.modelName });

      // Load pre-built global cache (fast binary lookup, avoids TEI for known patterns)
      const { getWorkerGlobalCache } = await import("./worker-global-cache.js");
      workerGlobalCache = getWorkerGlobalCache();
      await workerGlobalCache.load(config.modelName, config.dimensions ?? 384);
      if (workerGlobalCache.size > 0) {
        workerLog("INFO", `WorkerGlobalCache loaded: ${workerGlobalCache.size} pre-built embeddings`);
      }

      // Use lightweight HTTP-only client (no heavy dependencies)
      const { WorkerEmbeddingClient } = await import("./worker-embedding-client.js");
      embeddingClient = new WorkerEmbeddingClient(config);
      await embeddingClient.initialize();

      workerLog("INFO", `WorkerEmbeddingClient initialized successfully`);
    } catch (error) {
      workerLog("ERROR", `Failed to init WorkerEmbeddingClient: ${(error as Error).message}`);
      workerLog("ERROR", `Stack: ${(error as Error).stack}`);
      embeddingClient = null;
    }
  })();

  await embeddingClientInitPromise;
}

/**
 * Clear embedding client (for shutdown)
 */
export function clearEmbeddingClient(): void {
  embeddingClient = null;
}

// =============================================================================
// Text Building
// =============================================================================

/**
 * Build embedding text for an entity.
 * Includes: name, type, signature, code snippet (truncated to maxTokens).
 */
export function buildEmbeddingText(entity: ParsedEntity, fileContent: string, maxTokens: number): string {
  const parts: string[] = [];

  // Header: name + type + signature
  const header = `${entity.name ?? ""} ${entity.type ?? ""} ${entity.signature ?? ""}`.trim();
  parts.push(header);

  // Extract code snippet from file content using location
  // Use ~1.0 chars per token for code (very conservative for long identifiers)
  // Code tokens like "generateEmbeddingsForEntities" are 1 token but ~30 chars
  const charsPerToken = 1.0;
  if (entity.location) {
    try {
      const { start, end } = entity.location;
      if (typeof start?.index === "number" && typeof end?.index === "number") {
        const maxLen = Math.min(Math.floor(maxTokens * charsPerToken), 10000);
        const code = fileContent.slice(start.index, Math.min(end.index, start.index + maxLen));
        parts.push(code);
      } else if (typeof start?.line === "number" && typeof end?.line === "number") {
        const lines = fileContent.split("\n");
        const startLine = Math.max(0, start.line - 1);
        const endLine = Math.min(lines.length, end.line);
        const code = lines
          .slice(startLine, endLine)
          .join("\n")
          .slice(0, Math.floor(maxTokens * charsPerToken));
        parts.push(code);
      }
    } catch {
      // Ignore extraction errors
    }
  }

  // Add documentation if available
  const extendedEntity = entity as ParsedEntityExtended;
  if (extendedEntity.documentation?.description) {
    parts.push(`description: ${extendedEntity.documentation.description}`);
  }

  // Add return type
  if (entity.returnType) {
    parts.push(`returns: ${entity.returnType}`);
  }

  // Combine and truncate
  const text = parts.join("\n").trim();
  // Very conservative truncation: ~1.0 chars per token for code
  // Code has long identifiers (e.g., "generateEmbeddingsForEntities" = 1 token)
  // Using 1.0 guarantees we stay under model's token limit (512 for e5-small)
  return text.slice(0, Math.floor(maxTokens * 1.0));
}

// =============================================================================
// Embedding Generation
// =============================================================================

/**
 * Generate embeddings for entities and collect them for batch transfer
 * For subprocess mode: embeddings are collected and sent separately via embeddings.ready message
 * For centralized mode (OVMS/llamacpp): texts are collected and sent via embeddings.texts message
 * For backward compatibility: also attaches Base64 encoded embeddings to entities
 */
export async function generateEmbeddingsForEntities(
  entities: ParsedEntity[],
  fileContent: string,
  filePath: string,
): Promise<number> {
  if (!embeddingConfig?.enabled) {
    return 0;
  }

  // Centralized mode: collect texts instead of generating embeddings
  // Main generates embeddings via single connection (optimal batching)
  if (embeddingConfig.centralizedEmbeddings) {
    return collectTextsForCentralizedEmbedding(entities, fileContent, filePath);
  }

  // Distributed mode: generate embeddings in worker
  if (!embeddingClient) {
    workerLog("WARN", "generateEmbeddingsFr: embeddingClient is NULL, skipping", {
      provider: embeddingConfig.provider,
      enabled: embeddingConfig.enabled,
      centralizedEmbeddings: embeddingConfig.centralizedEmbeddings,
    });
    return 0;
  }

  // Use contextTokens (model limit) for truncation, fallback to maxTokens
  const contextTokens = embeddingConfig.contextTokens || embeddingConfig.maxTokens || 512;
  // Use larger batch size for high-throughput providers
  // - llamacpp: 256 (server ctx-size=2048, parallel=4)
  // - ovms: 100 (MediaPipe graph handles batching internally)
  // - default: 32
  const isLlamaCpp = embeddingConfig.provider === "llamacpp";
  const isOVMS = embeddingConfig.provider === "ovms";
  const batchSize = embeddingConfig.batchSize || (isLlamaCpp ? 256 : isOVMS ? 100 : 32);
  // Concurrency: how many parallel HTTP requests per worker
  // - llamacpp: 4 (matches --parallel 4 slots)
  // - ovms: 1 (dedicated endpoint per worker, no internal contention)
  // - default: 3
  const concurrency = isLlamaCpp ? 4 : isOVMS ? 1 : 3;

  // Filter out low-value entity types before embedding generation
  const filteredEntities = entities.filter((e) => !EMBEDDING_EXCLUDE_ENTITY_TYPES.has(e.type));

  // Build texts for filtered entities, with local deduplication
  const entityTexts: { entity: ParsedEntity; text: string; entityId: string }[] = [];
  let skippedDuplicates = 0;

  for (const entity of filteredEntities) {
    // Pre-compute entity ID for deduplication
    const rawEntityId = entity.id || `${filePath}:${entity.type}:${entity.name}`;
    const entityId = `ent:${rawEntityId}`;

    // Skip if already generated in this worker session
    if (generatedEntityIds.has(entityId)) {
      skippedDuplicates++;
      continue;
    }

    const text = buildEmbeddingText(entity, fileContent, contextTokens);
    if (text.length > 0) {
      entityTexts.push({ entity, text, entityId });
    }
  }

  if (skippedDuplicates > 0) {
    workerLog("DEBUG", `Skipped ${skippedDuplicates} duplicate entities (local dedup)`);
  }

  if (entityTexts.length === 0) {
    return 0;
  }

  // Split into batches
  const batches: (typeof entityTexts)[] = [];
  for (let i = 0; i < entityTexts.length; i += batchSize) {
    batches.push(entityTexts.slice(i, i + batchSize));
  }

  let generatedCount = 0;

  workerLog("INFO", "generateEmbeddingsFr: starting batch processing", {
    entities: entityTexts.length,
    batches: batches.length,
    batchSize,
    provider: embeddingConfig.provider,
  });

  // Process batches in waves of 'concurrency' size
  // Each wave runs in parallel, then we start next wave
  const processBatch = async (batch: typeof entityTexts, idx: number): Promise<void> => {
    // Check global cache first — skip TEI for known stdlib/framework patterns
    const cacheHits = new Map<number, Float32Array>(); // batch index → embedding
    const missIndices: number[] = [];
    const missTexts: string[] = [];

    for (let j = 0; j < batch.length; j++) {
      const cached = workerGlobalCache?.get(batch[j]!.text);
      if (cached) {
        cacheHits.set(j, cached);
      } else {
        missIndices.push(j);
        missTexts.push(batch[j]!.text);
      }
    }

    // Generate only cache misses
    let generatedEmbeddings: Float32Array[] = [];
    if (missTexts.length > 0) {
      try {
        generatedEmbeddings = await embeddingClient!.generateBatch(missTexts);
      } catch (error) {
        workerLog("WARN", `Embedding batch failed: ${(error as Error).message}`, { batchIdx: idx });
        return;
      }
    }

    // Merge: cache hits + generated
    const embeddings: (Float32Array | undefined)[] = new Array(batch.length);
    for (const [j, emb] of cacheHits) embeddings[j] = emb;
    for (let k = 0; k < missIndices.length; k++) embeddings[missIndices[k]!] = generatedEmbeddings[k];

    // Process embeddings - collect for IPC transfer
    for (let j = 0; j < batch.length; j++) {
      const et = batch[j]!;
      const embedding = embeddings[j];
      if (embedding) {
        const { entityId } = et;
        generatedEntityIds.add(entityId);

        const vectorBuffer = embedding.buffer.slice(
          embedding.byteOffset,
          embedding.byteOffset + embedding.byteLength,
        ) as ArrayBuffer;

        const rawEntityId = et.entity.id || `${filePath}:${et.entity.type}:${et.entity.name}`;
        collectedEmbeddings.push({
          id: entityId,
          vectorBuffer,
          content: et.text.slice(0, 500),
          metadata: {
            entityId: rawEntityId,
            entityType: et.entity.type,
            entityName: et.entity.name,
            path: filePath,
            filePath,
            line: et.entity.location?.start?.line,
            start: et.entity.location?.start?.index,
            end: et.entity.location?.end?.index,
          },
        });

        et.entity.embeddingText = et.text.slice(0, 200);
        generatedCount++;
      }
    }
  };

  // Process in waves - run 'concurrency' batches in parallel, wait, repeat
  for (let i = 0; i < batches.length; i += concurrency) {
    const wave = batches.slice(i, i + concurrency);
    await Promise.all(wave.map((batch, j) => processBatch(batch, i + j)));
  }

  workerLog("INFO", "generateEmbeddingsFr: batch processing complete", {
    generatedCount,
    collectedEmbeddingsTotal: collectedEmbeddings.length,
  });

  return generatedCount;
}

// =============================================================================
// Embedding Collection and Transfer
// =============================================================================

/**
 * Send collected embeddings to main process via binary IPC transfer
 */
export function sendCollectedEmbeddings(ctx: EmbeddingProcessorContext): void {
  if (collectedEmbeddings.length === 0) {
    return;
  }

  const transferList: ArrayBuffer[] = collectedEmbeddings.map((e) => e.vectorBuffer);

  ctx.postWorkerMessage(
    {
      type: "embeddings.ready",
      count: collectedEmbeddings.length,
      embeddings: collectedEmbeddings,
    },
    transferList,
  );

  workerLog("INFO", `Sent embeddings to main process (binary transfer)`, {
    count: collectedEmbeddings.length,
    totalBytes: transferList.reduce((sum, buf) => sum + buf.byteLength, 0),
  });

  collectedEmbeddings.length = 0;
}

// =============================================================================
// Centralized Embedding Mode (OVMS/llamacpp)
// =============================================================================

/**
 * Collect texts for centralized embedding generation.
 * Used when centralizedEmbeddings is enabled (OVMS/llamacpp mode).
 * Texts are sent to Main process which generates embeddings via single connection.
 */
function collectTextsForCentralizedEmbedding(entities: ParsedEntity[], fileContent: string, filePath: string): number {
  if (!embeddingConfig) return 0;

  const contextTokens = embeddingConfig.contextTokens || embeddingConfig.maxTokens || 512;

  // Filter out low-value entity types
  const filteredEntities = entities.filter((e) => !EMBEDDING_EXCLUDE_ENTITY_TYPES.has(e.type));

  let collectedCount = 0;

  for (const entity of filteredEntities) {
    // Pre-compute entity ID for deduplication
    const rawEntityId = entity.id || `${filePath}:${entity.type}:${entity.name}`;
    const entityId = `ent:${rawEntityId}`;

    // Skip if already processed in this worker session
    if (generatedEntityIds.has(entityId)) {
      continue;
    }

    const text = buildEmbeddingText(entity, fileContent, contextTokens);
    if (text.length === 0) continue;

    // Check global cache — if hit, add embedding directly without going to Main
    const cached = workerGlobalCache?.get(text);
    if (cached) {
      generatedEntityIds.add(entityId);
      const vectorBuffer = cached.buffer.slice(cached.byteOffset, cached.byteOffset + cached.byteLength) as ArrayBuffer;
      collectedEmbeddings.push({
        id: entityId,
        vectorBuffer,
        content: text.slice(0, 500),
        metadata: {
          entityId: rawEntityId,
          entityType: entity.type,
          entityName: entity.name,
          path: filePath,
          filePath,
          line: entity.location?.start?.line,
          start: entity.location?.start?.index,
          end: entity.location?.end?.index,
        },
      });
      collectedCount++;
      continue;
    }

    // Mark as processed
    generatedEntityIds.add(entityId);

    // Collect text for Main process
    collectedTexts.push({
      id: entityId,
      text,
      metadata: {
        entityId: rawEntityId,
        entityType: entity.type,
        entityName: entity.name,
        path: filePath,
        filePath,
        line: entity.location?.start?.line,
        start: entity.location?.start?.index,
        end: entity.location?.end?.index,
      },
    });

    // Store embedding text for search result display
    entity.embeddingText = text.slice(0, 200);

    collectedCount++;
  }

  return collectedCount;
}

/**
 * Send collected texts to main process for centralized embedding generation.
 * Used when centralizedEmbeddings is enabled (OVMS/llamacpp mode).
 */
export function sendCollectedTexts(ctx: EmbeddingProcessorContext): void {
  if (collectedTexts.length === 0) {
    return;
  }

  ctx.postWorkerMessage({
    type: "embeddings.texts",
    count: collectedTexts.length,
    texts: collectedTexts,
  });

  workerLog("INFO", `Sent texts to main process (centralized mode)`, {
    count: collectedTexts.length,
  });

  collectedTexts.length = 0;
}
