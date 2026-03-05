---
module_name: libsql
description: "LibSQL graph storage adapter with vector search, entity CRUD, and caching"
status: active
language: typescript
---

# LibSQL

> Provides the LibSQL-based graph storage layer with operations for entities, relationships, vectors, metadata, co-occurrence, and embedding caching, supporting multi-dimensional DiskANN vector indexes.

## Overview

The libsql module implements the persistent storage layer for the code graph using LibSQL (SQLite-compatible). It is decomposed into operation classes: EntityOperations for CRUD on project entities, RelationshipOperations for entity relationships, VectorOperations for DiskANN-powered similarity search across multiple embedding dimensions (384, 768, 1024, 4096), MetadataOperations for file and project metadata tracking, CacheOperations for global embedding cache by content hash, and CooccurrenceOperations for term co-occurrence and PMI-based query expansion. All operations use project context (projectHash + branchName) for multi-tenant isolation.

## Data Flow

- **Inputs**: Entity objects, relationship data, vector embeddings (Float32Array), metadata records, and search queries from the LibSQLGraphAdapter.
- **Processing**: Operations execute parametrized SQL against LibSQL with LRU caching, CBOR-encoded metadata, and DiskANN vector indexing; batch operations use sequential writes to avoid native crashes.
- **Outputs**: Entity/relationship objects, SimilarityResult arrays, metadata records, and co-occurrence statistics.

## Public API

| Export | Type | Description | Location |
|--------|------|-------------|----------|
| `EntityOperations` | class | CRUD operations for project entities with batch optimization | [`entity-ops.ts:22-22`](./entity-ops.ts) |
| `RowToEntityMapper` | type | Delegate for converting DB rows to entity objects | [`entity-ops.ts:22-22`](./entity-ops.ts) |
| `RelationshipOperations` | class | CRUD operations for entity relationships | [`relationship-ops.ts:21-21`](./relationship-ops.ts) |
| `RowToRelationshipMapper` | type | Delegate for converting DB rows to relationship objects | [`relationship-ops.ts:21-21`](./relationship-ops.ts) |
| `VectorOperations` | class | Embedding search and indexing with DiskANN vector indexes | [`vector-ops.ts:48-549`](./vector-ops.ts) |
| `VectorOpsContext` | interface | Context for vector operations (client, context, config getters) | [`vector-ops.ts:29-42`](./vector-ops.ts) |
| `MetadataOperations` | class | File and project metadata operations with indexing tracking | [`metadata-ops.ts:16-470`](./metadata-ops.ts) |
| `CacheOperations` | class | Global embedding cache operations by content hash | [`cache-ops.ts:24-160`](./cache-ops.ts) |
| `VectorToStringFn` | type | Function for converting Float32Array to SQL-compatible string | [`cache-ops.ts:18-18`](./cache-ops.ts) |
| `CooccurrenceOperations` | class | Term co-occurrence tracking and PMI-based related term retrieval | [`cooccurrence-ops.ts:34-393`](./cooccurrence-ops.ts) |
| `LibSQLGraphConfig` | interface | Adapter configuration with vector dimensions and DiskANN parameters | [`types.ts:15-28`](./types.ts) |
| `ProjectContext` | interface | Multi-tenant project context (projectHash, branchName, baseBranch) | [`types.ts:73-80`](./types.ts) |
| `DatabaseCorruptionError` | class | Exception for database corruption detection and recovery | [`types.ts:119-127`](./types.ts) |
| `SUPPORTED_DIMENSIONS` | const | Array of supported embedding dimensions: [384, 768, 1024, 4096] | [`types.ts:44-44`](./types.ts) |
| `getEmbeddingColumn` | function | Maps dimension to column name (e.g., 384 -> "embedding_384") | [`types.ts:51-56`](./types.ts) |

## Dependencies

### Internal Modules

| Module | Purpose |
|--------|---------|
| `logging` | Structured logging |

### External Packages

| Package | Purpose |
|---------|---------|
| `@libsql/client` | LibSQL database client |

## Behavioral Properties

| Property | Value |
|----------|-------|
| Default dimensions | 384 (for all-MiniLM-L6-v2 model) |
| DiskANN compression | float8 (40-50% less memory than float32) |
| Batch concurrency | Sequential (1) to prevent libsql native crashes |

## Error Handling

DatabaseCorruptionError is thrown on SQLITE_CORRUPT or malformed database errors, signaling callers to recreate the database. isCorruptionError() utility checks error messages for corruption patterns. All operations use try-catch with structured logging for SQL failures.

## Known Limitations

- Batch write concurrency is set to 1 (sequential) due to libsql native issues with parallel writes.
- DiskANN maxNeighbors is reduced to 12 (from 24) to lower disk footprint, which may slightly reduce recall.
- Co-occurrence PMI calculation does not handle zero-frequency edge cases gracefully.

## Exports

- `CacheOperations`
- `CooccurrenceOperations`
- `EntityOperations`
- `GenerationManager`
- `MetadataOperations`
- `RelationshipOperations`
- `VectorOperations`

## Files

| File | Description |
|------|-------------|
| `cache-ops.ts` | Global embedding cache operations with content hash indexing |
| `cooccurrence-ops.ts` | Term co-occurrence tracking with PMI scoring and related term retrieval |
| `entity-ops.ts` | CRUD operations for project entities with batch upsert optimization |
| `index.ts` | Re-exports all operation classes and types |
| `metadata-ops.ts` | File and project metadata operations with indexing state tracking |
| `relationship-ops.ts` | CRUD operations for entity relationships with deoptimization support |
| `types.ts` | Configuration, ProjectContext, DatabaseCorruptionError, and shared type definitions |
| `vector-ops.ts` | DiskANN-powered vector similarity search with multi-dimension column support |
