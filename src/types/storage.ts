/**
 * Storage-layer type definitions: entities, relationships, queries,
 * caching, connection pooling, and the GraphStorage contract.
 */

import { CACHE_CONSTANTS, DATABASE_CONSTANTS } from "../config/constants.js";
import { log } from "../logging/index.js";
import type { ParsedEntity } from "./parser.js";

export type { ParsedEntity };

// -- Limits -----------------------------------------------------------------

export const MAX_BATCH_SIZE = 1000;
export const DEFAULT_CACHE_TTL = CACHE_CONSTANTS.CACHE_TTL_MS;
export const MAX_CONNECTIONS = DATABASE_CONSTANTS.CONNECTION_POOL_SIZE;

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
    modifiers?: string[];
    returnType?: string | undefined;
    parameters?: Array<{
      name: string;
      type?: string | undefined;
      optional?: boolean;
      defaultValue?: string | undefined;
    }>;
    importData?: {
      source: string;
      specifiers: Array<{ local: string; imported?: string }>;
      isDefault?: boolean;
      isNamespace?: boolean;
    };
    signature?: string | undefined;
    language?: string | undefined;
    decorators?: Array<{
      name: string;
      arguments?: string[];
      isBuiltin?: boolean;
    }>;
    [key: string]: unknown;
  };
  createdAt: number;
  updatedAt: number;
  complexityScore?: number | undefined;
  language?: string | undefined;
  sizeBytes?: number | undefined;
  embeddingBase64?: string;
  embeddingText?: string;
}

export interface Relationship {
  id: string;
  fromId: string;
  toId: string;
  type: RelationType;
  metadata?: {
    line?: number | undefined;
    column?: number;
    context?: string;
    [key: string]: unknown;
  };
  weight?: number;
  createdAt?: number;
}

export interface FileInfo {
  path: string;
  hash: string;
  lastIndexed: number;
  entityCount: number;
}

// -- Query & result shapes --------------------------------------------------

export interface EntityQuery {
  filters?: {
    entityType?: EntityType | EntityType[];
    filePath?: string | string[];
    name?: string | RegExp;
  };
  limit?: number;
  offset?: number;
}

export interface RelationshipQuery {
  filters?: {
    relationshipType?: RelationType | RelationType[];
    fromId?: string | string[];
    toId?: string | string[];
  };
  limit?: number;
  offset?: number;
}

export interface GraphQuery {
  type: "entity" | "relationship" | "subgraph";
  filters?: {
    entityType?: EntityType | EntityType[];
    relationshipType?: RelationType | RelationType[];
    filePath?: string | string[];
    name?: string | RegExp;
  };
  depth?: number;
  limit?: number;
  offset?: number;
}

export interface GraphQueryResult {
  entities: Entity[];
  relationships: Relationship[];
  stats: { totalEntities: number; totalRelationships: number; queryTimeMs: number };
}

export interface EntityChange {
  type: "added" | "modified" | "deleted";
  entity?: Entity;
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
  totalEmbeddings?: number;
  vectorSearchEnabled?: boolean;
  performanceMetricsCount?: number;
  memoryUsageMB?: number;
  concurrentConnections?: number;
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
  missCount?: number;
  lastAccessed?: number;
}

export interface PoolStats {
  total: number;
  active: number;
  idle: number;
  waiting: number;
  timeouts: number;
}

export interface PerformanceMetric {
  id: string;
  operation: string;
  durationMs: number;
  entityCount?: number;
  memoryUsage?: number;
  createdAt: number;
}

export interface VectorEmbedding {
  id: string;
  entityId: string;
  content: string;
  vectorData?: ArrayBuffer | null;
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

  const meta: Entity["metadata"] = {
    ...(parsed.metadata ?? {}),
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
  };

  return {
    name: parsed.name,
    type: parsed.type as EntityType,
    filePath,
    hash,
    location: parsed.location,
    metadata: meta,
    language: parsed.language,
    embeddingBase64: parsed.embeddingBase64,
    embeddingText: parsed.embeddingText,
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
