/**
 * Storage-layer type definitions: entities, relationships, queries,
 * caching, connection pooling, and the GraphStorage contract.
 */

import { CACHE_CONSTANTS } from "../config/constants.js";
import { log } from "../logging/index.js";
import type { ParsedEntity } from "./parser.js";

export type { ParsedEntity };

// -- Limits -----------------------------------------------------------------

export const MAX_BATCH_SIZE = 1000;
export const DEFAULT_CACHE_TTL = CACHE_CONSTANTS.CACHE_TTL_MS;
export const MAX_CONNECTIONS = 5; // Connection pool size (not in Zig — TS-specific)

// -- Enumerations -----------------------------------------------------------

export enum EntityType {
  FUNCTION = "function",
  CLASS = "class",
  METHOD = "method",
  INTERFACE = "interface",
  TYPE = "type",
  IMPORT = "import",
  EXPORT = "export",
  VARIABLE = "variable",
  CONSTANT = "constant",
  PACKAGE = "package",
  COMMENT = "comment",
}

export enum RelationType {
  CALLS = "calls",
  IMPORTS = "imports",
  EXPORTS = "exports",
  EXTENDS = "extends",
  IMPLEMENTS = "implements",
  REFERENCES = "references",
  CONTAINS = "contains",
  DEPENDS_ON = "depends_on",
  MEMBER_OF = "member_of",
  DOCUMENTS = "documents",

  CALLED_BY = "called_by",
  IMPORTED_BY = "imported_by",
  REFERENCED_BY = "referenced_by",
  EXTENDED_BY = "extended_by",
  IMPLEMENTED_BY = "implemented_by",

  DISPATCHES_ACTION = "dispatches_action",
  LISTENS_TO_ACTION = "listens_to_action",
  HANDLES_ACTION = "handles_action",
  SELECTS_STATE = "selects_state",
  MODIFIES_STATE = "modifies_state",

  PRODUCES_API = "produces_api",
  CONSUMES_API = "consumes_api",
  GENERATED_FROM = "generated_from",

  READS_TABLE = "reads_table",
  WRITES_TABLE = "writes_table",
  MAPS_TO_TABLE = "maps_to_table",
}

// -- Core data models -------------------------------------------------------

export interface Entity {
  id: string;
  name: string;
  type: EntityType;
  filePath: string;
  hash: string;
  location: {
    start: { line: number; column: number; index: number };
    end: { line: number; column: number; index: number };
  };
  metadata: {
    modifiers?: string[] | undefined;
    returnType?: string | undefined;
    parameters?:
      | Array<{
          name: string;
          type?: string | undefined;
          optional?: boolean | undefined;
          defaultValue?: string | undefined;
        }>
      | undefined;
    importData?:
      | {
          source: string;
          specifiers: Array<{ local: string; imported?: string | undefined }>;
          isDefault?: boolean | undefined;
          isNamespace?: boolean | undefined;
        }
      | undefined;
    signature?: string | undefined;
    language?: string | undefined;
    decorators?:
      | Array<{
          name: string;
          arguments?: string[] | undefined;
          isBuiltin?: boolean | undefined;
        }>
      | undefined;
    [key: string]: unknown;
  };
  createdAt: number;
  updatedAt: number;
  complexity?: number | undefined;
  language?: string | undefined;
  size?: number | undefined;
}

export interface Relationship {
  id: string;
  fromId: string;
  toId: string;
  type: RelationType;
  metadata?:
    | {
        line?: number | undefined;
        column?: number | undefined;
        context?: string | undefined;
        [key: string]: unknown;
      }
    | undefined;
  weight?: number | undefined;
  createdAt?: number | undefined;
}

export interface FileInfo {
  path: string;
  hash: string;
  lastIndexed: number;
  entityCount: number;
}

// -- Query & result shapes --------------------------------------------------

export interface EntityQuery {
  filters?:
    | {
        entityType?: EntityType | EntityType[] | undefined;
        filePath?: string | string[] | undefined;
        name?: string | RegExp | undefined;
      }
    | undefined;
  limit?: number | undefined;
  offset?: number | undefined;
  /** When true, use lightweight query (fewer columns) */
  lightweight?: boolean | undefined;
}

export interface RelationshipQuery {
  filters?:
    | {
        relationshipType?: RelationType | RelationType[] | undefined;
        fromId?: string | string[] | undefined;
        toId?: string | string[] | undefined;
      }
    | undefined;
  limit?: number | undefined;
  offset?: number | undefined;
}

export interface GraphQuery {
  type: "entity" | "relationship" | "subgraph";
  filters?:
    | {
        entityType?: EntityType | EntityType[] | undefined;
        relationshipType?: RelationType | RelationType[] | undefined;
        filePath?: string | string[] | undefined;
        name?: string | RegExp | undefined;
      }
    | undefined;
  depth?: number | undefined;
  limit?: number | undefined;
  offset?: number | undefined;
}

export interface GraphQueryResult {
  entities: Entity[];
  relationships: Relationship[];
  stats: { totalEntities: number; totalRelationships: number; queryTimeMs: number };
}

export interface EntityChange {
  type: "added" | "modified" | "deleted";
  entity?: Entity | undefined;
  entityId?: string | undefined;
  filePath: string;
  timestamp: number;
}

// -- Database schema --------------------------------------------------------

export interface GraphSchema {
  entities: {
    id: string;
    name: string;
    type: string;
    file_path: string;
    location: string;
    metadata: string;
    hash: string;
    created_at: number;
    updated_at: number;
  };
  relationships: {
    id: string;
    from_id: string;
    to_id: string;
    type: string;
    metadata: string;
  };
  files: {
    path: string;
    hash: string;
    last_indexed: number;
    entity_count: number;
  };
}

// -- Metrics, caching, pooling ----------------------------------------------

export interface StorageMetrics {
  totalEntities: number;
  totalRelationships: number;
  totalFiles: number;
  databaseSizeMB: number;
  indexSizeMB: number;
  cacheHitRate: number;
  averageQueryTimeMs: number;
  lastVacuum: number;
  totalEmbeddings?: number | undefined;
  vectorSearchEnabled?: boolean | undefined;
  performanceMetricsCount?: number | undefined;
  memoryUsageMB?: number | undefined;
  concurrentConnections?: number | undefined;
}

export interface BatchResult {
  processed: number;
  failed: number;
  errors: Array<{ item: unknown; error: string }>;
  timeMs: number;
}

export interface CacheEntry<T = unknown> {
  key: string;
  value: T;
  timestamp: number;
  ttl: number;
  hits: number;
  size: number;
}

export interface EnhancedCacheEntry<T = unknown> extends CacheEntry<T> {
  missCount?: number | undefined;
  lastAccessed?: number | undefined;
}

export interface PoolStats {
  total: number;
  active: number;
  idle: number;
  waiting: number;
  timeouts: number;
}

export interface PerformanceMetric {
  id: number;
  toolName: string;
  durationMs: number;
  success?: number | undefined;
  createdAt: number;
}

export interface VectorEmbedding {
  id: string;
  entityId: string;
  content: string;
  vectorData?: ArrayBuffer | null | undefined;
  modelName: string;
  createdAt: number;
}

// -- Storage contracts ------------------------------------------------------

export interface GraphStorage {
  insertEntity(entity: Entity): Promise<void>;
  insertEntities(entities: Entity[]): Promise<BatchResult>;
  updateEntity(id: string, updates: Partial<Entity>): Promise<void>;
  deleteEntity(id: string): Promise<void>;
  getEntity(id: string): Promise<Entity | null>;
  getEntitiesBatch(ids: string[]): Promise<Map<string, Entity>>;
  findEntities(query: EntityQuery): Promise<Entity[]>;
  getAllEntities(): Promise<Entity[]>;
  searchEntities(options: {
    namePattern?: string | undefined;
    types?: EntityType[] | undefined;
    filePath?: string;
    limit?: number;
  }): Promise<Entity[]>;
  countByLanguage(): Promise<Map<string, { count: number; fileCount: number }>>;

  insertRelationship(relationship: Relationship): Promise<void>;
  insertRelationships(relationships: Relationship[]): Promise<BatchResult>;
  deleteRelationship(id: string): Promise<void>;
  getRelationshipsForEntity(entityId: string, type?: RelationType): Promise<Relationship[]>;
  findRelationships(query: RelationshipQuery): Promise<Relationship[]>;
  getAllRelationships(): Promise<Relationship[]>;
  getRelationships(sourceId: string, type?: RelationType): Promise<Relationship[]>;
  findIncomingRelationshipsByName(entityName: string, types?: RelationType[]): Promise<Relationship[]>;

  updateFileInfo(info: FileInfo): Promise<void>;
  getFileInfo(path: string): Promise<FileInfo | null>;
  getOutdatedFiles(since: number): Promise<FileInfo[]>;
  getAllIndexedFiles(): Promise<Map<string, number>>;
  deleteFileInfo(path: string): Promise<void>;

  getEntityIdsByFilePath(filePath: string): Promise<string[]>;
  deleteEntitiesByFilePath(filePath: string): Promise<string[]>;
  invalidateFileGeneration?(filePath: string): Promise<void>;
  runGenerationGC?(): Promise<{ entities: number; tokens: number }>;

  executeQuery(query: GraphQuery): Promise<GraphQueryResult>;
  getSubgraph(entityId: string, depth: number): Promise<GraphQueryResult>;

  vacuum(): Promise<void>;
  analyze(): Promise<void>;
  getMetrics(): Promise<StorageMetrics>;

  /** @deprecated Use runWithRequestContext() for tool calls. Only for background/init. */
  setProject(projectPath: string, branchName?: string): void;
  clear(): Promise<void>;
  getStatistics(): Promise<{ totalEntities: number; totalRelationships: number; totalFiles: number }>;
}

export interface CacheManager {
  get<T>(key: string): T | null;
  set<T>(key: string, value: T, ttl?: number): void;
  delete(key: string): void;
  clear(): void;
  getStats(): { size: number; hits: number; misses: number; hitRate: number };
}

export interface ConnectionPool<T> {
  acquire(): Promise<T>;
  release(connection: T): void;
  destroy(connection: T): void;
  drain(): Promise<void>;
  getStats(): PoolStats;
}

// -- Conversion helpers -----------------------------------------------------

/**
 * Fixed key set of the metadata skeleton built by {@link parsedEntityToEntity}.
 * Parser-supplied keys colliding with it are skipped, which preserves the
 * previous precedence (skeleton was spread last, so it overwrote the parser's).
 */
const META_SKELETON_KEYS = new Set([
  "modifiers",
  "returnType",
  "parameters",
  "importData",
  "signature",
  "language",
  "decorators",
  "calls",
  "controlFlow",
  "metrics",
  "jitHints",
  "antipatternHints",
  "closureHints",
  "pythonHints",
]);

export function parsedEntityToEntity(
  parsed: ParsedEntity,
  filePath: string,
  hash: string,
): Omit<Entity, "id" | "createdAt" | "updatedAt"> {
  const complexityMeta =
    parsed.complexity != null
      ? {
          cyclomaticComplexity: parsed.complexity.cyclomatic,
          cognitiveComplexity: parsed.complexity.cognitive,
          linesOfCode: parsed.complexity.linesOfCode,
          linesOfLogic: parsed.complexity.linesOfLogic,
          nestingDepth: parsed.complexity.nestingDepth,
          parameterCount: parsed.complexity.parameterCount,
          returnCount: parsed.complexity.returnCount,
        }
      : undefined;

  // Fixed key set in a fixed order: every entity gets the same hidden class, so
  // reads like entity.metadata.calls stay monomorphic across the whole pipeline.
  // The previous form spread parser metadata first (~200 distinct shapes) and
  // then added four conditional spreads on top (2^4 more variants) — that made
  // this the most megamorphic object in the codebase. undefined values are
  // dropped during CBOR encoding, so the stored BLOB does not grow.
  const meta: Entity["metadata"] = {
    modifiers: parsed.modifiers,
    returnType: parsed.returnType,
    parameters: parsed.parameters,
    importData: parsed.importData,
    signature: parsed.signature,
    language: parsed.language,
    decorators: parsed.decorators,
    calls: parsed.calls,
    controlFlow: parsed.controlFlow,
    metrics: complexityMeta,
    jitHints: parsed.jitHints,
    antipatternHints: parsed.antipatternHints,
    closureHints: parsed.closureHints,
    pythonHints: parsed.pythonHints,
  };

  // Parser-specific keys keep their flat layout — the same BLOB is read by the
  // Zig implementation, so the storage format must not change.
  if (parsed.metadata) {
    for (const [key, value] of Object.entries(parsed.metadata)) {
      if (!META_SKELETON_KEYS.has(key)) meta[key] = value;
    }
  }

  return {
    name: parsed.name,
    type: parsed.type as EntityType,
    filePath,
    hash,
    location: parsed.location,
    metadata: meta,
    language: parsed.language,
  };
}

/**
 * Finalize a parsed entity into a storage {@link Entity}.
 *
 * A single factory on purpose: every Entity created while indexing then shares
 * one hidden class, and the key order matches what rowToEntity() produces for
 * entities read back from SQLite — so both sources look identical to the JIT.
 */
export function finalizeEntity(
  base: Omit<Entity, "id" | "createdAt" | "updatedAt">,
  id: string,
  timestamp: number,
): Entity {
  return {
    id,
    name: base.name,
    type: base.type,
    filePath: base.filePath,
    location: base.location,
    metadata: base.metadata,
    hash: base.hash,
    createdAt: timestamp,
    updatedAt: timestamp,
    complexity: base.complexity,
    language: base.language,
    size: base.size,
  };
}

export function flattenParsedEntities(roots: ParsedEntity[]): ParsedEntity[] {
  const flat: ParsedEntity[] = [];
  const stack: Array<{ node: ParsedEntity; prefix: string | undefined; parentPath: string | undefined }> = [];

  // Seed stack in reverse so first entity is processed first
  for (let i = roots.length - 1; i >= 0; i--) {
    stack.push({ node: roots[i]!, prefix: undefined, parentPath: roots[i]!.filePath });
  }

  let childTotal = 0;

  while (stack.length > 0) {
    const { node, prefix, parentPath } = stack.pop()!;
    flat.push(node);

    const kids = node.children;
    if (!kids || kids.length === 0) continue;

    const qualBase = prefix ?? node.name;

    for (let i = kids.length - 1; i >= 0; i--) {
      const kid = kids[i]!;
      childTotal++;

      const dotBase = `${qualBase}.`;
      const qualName = kid.name.startsWith(dotBase) ? kid.name : `${qualBase}.${kid.name}`;
      const resolvedPath = kid.filePath || parentPath || node.filePath;
      const resolvedLang = kid.language || node.language;

      const qualified: ParsedEntity = {
        ...kid,
        name: qualName,
        filePath: resolvedPath,
        language: resolvedLang,
        // Preserve parent context for SemId generation
        parentSemId: node.id,
        parentName: node.name,
        parentType: node.type,
      };

      stack.push({ node: qualified, prefix: qualified.name, parentPath: qualified.filePath });
    }
  }

  if (childTotal > 0) {
    log.d("STORAGE", "flatten_children", { children: childTotal, topLevel: roots.length });
  }

  return flat;
}

// -- Type guards ------------------------------------------------------------

export function isEntity(obj: unknown): obj is Entity {
  if (obj == null || typeof obj !== "object") return false;
  const r = obj as Record<string, unknown>;
  return "id" in r && "name" in r && "type" in r && "filePath" in r;
}

export function isRelationship(obj: unknown): obj is Relationship {
  if (obj == null || typeof obj !== "object") return false;
  const r = obj as Record<string, unknown>;
  return "id" in r && "fromId" in r && "toId" in r && "type" in r;
}
