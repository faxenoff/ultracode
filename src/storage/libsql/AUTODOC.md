---
module_name: libsql
description: "SQLite graph storage operations with entity CRUD, caching, and co-occurrence (historically named libsql)"
status: active
language: typescript
---

# LibSQL (storage operations)

> Provides the SQLite-based graph storage layer with operations for entities, relationships, vectors, metadata, co-occurrence, and embedding caching. Directory named `libsql/` for historical reasons — actual storage uses native SQLite (better-sqlite3 / bun:sqlite) via `NativeSQLiteClient` since v6.5.

## Overview

The libsql module implements the persistent storage layer for the code graph using native SQLite. It is decomposed into operation classes: EntityOperations for CRUD on project entities, RelationshipOperations for entity relationships, VectorOperations for DiskANN-powered similarity search across multiple embedding dimensions (384, 768, 1024, 4096), MetadataOperations for file and project metadata tracking, CacheOperations for global embedding cache by content hash, and CooccurrenceOperations for term co-occurrence and PMI-based query expansion. All operations use project context (projectHash + branchName) for multi-tenant isolation.

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
| `getEmbeddingColumn` | function | Maps dimension to column name (e.g., 384 -> "embedding_384") | [`types.ts:54-59`](./types.ts) |

## Dependencies

### Internal Modules

| Module | Purpose |
|--------|---------|
| `logging` | Structured logging |

### External Packages

| Package | Purpose |
|---------|---------|
| `better-sqlite3` / `bun:sqlite` | Native SQLite driver (via NativeSQLiteClient) |

## Behavioral Properties

| Property | Value |
|----------|-------|
| Default dimensions | 384 (for all-MiniLM-L6-v2 model) |
| DiskANN compression | float8 (40-50% less memory than float32) |
| Batch concurrency | Sequential (1) for safety with native SQLite |

## Error Handling

DatabaseCorruptionError is thrown on SQLITE_CORRUPT or malformed database errors, signaling callers to recreate the database. isCorruptionError() utility checks error messages for corruption patterns. All operations use try-catch with structured logging for SQL failures.

## Known Limitations

- Batch write concurrency is set to 1 (sequential) for safety with native SQLite transactions.
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

## New (pending description)

- **GenerationManager** — `generation-ops.ts:22-280`
- **<anonymous>** — `generation-ops.ts:22-22`
- **SchemaManager** — `schema-manager.ts:16-445`
- **<anonymous>** — `schema-manager.ts:16-16`
- **VersioningOps** — `versioning-ops.ts:23-396`
- **<anonymous>** — `versioning-ops.ts:23-23`
- **EntityRow** — `row-mappers.ts:19-34`
- **RelationshipRow** — `row-mappers.ts:39-47`
- **encodeMetadata** — `cbor-utils.ts:21-29`
- **<anonymous>** — `cbor-utils.ts:21-21`
- **decodeMetadata** — `cbor-utils.ts:36-71`
- **<anonymous>** — `cbor-utils.ts:36-36`
- **clearMetadataCache** — `cbor-utils.ts:77-79`
- **<anonymous>** — `cbor-utils.ts:77-77`
- **getMetadataCacheStats** — `cbor-utils.ts:84-89`
- **<anonymous>** — `cbor-utils.ts:84-84`
- **<anonymous>** — `generation-ops.ts:108-108`
- **runWithRequestContext** — `request-context.ts:23-25`
- **<anonymous>** — `request-context.ts:23-23`
- **getRequestContext** — `request-context.ts:31-33`
- **<anonymous>** — `request-context.ts:31-31`
- **rowToEntity** — `row-mappers.ts:56-73`
- **<anonymous>** — `row-mappers.ts:56-56`
- **rowToRelationship** — `row-mappers.ts:78-88`
- **<anonymous>** — `row-mappers.ts:78-78`
- **vectorToString** — `row-mappers.ts:97-100`
- **<anonymous>** — `row-mappers.ts:97-97`
- **v** — `row-mappers.ts:98-98`
- **stringToVector** — `row-mappers.ts:105-109`
- **<anonymous>** — `row-mappers.ts:105-105`
- **s** — `row-mappers.ts:107-107`
- **e** — `versioning-ops.ts:123-126`
- **name** — `versioning-ops.ts:369-369`
- **constructor** — `generation-ops.ts:28-31`
- **loadCache** — `generation-ops.ts:37-54`
- **getGeneration** — `generation-ops.ts:60-62`
- **bumpGeneration** — `generation-ops.ts:68-86`
- **bumpGenerationBatch** — `generation-ops.ts:92-128`
- **invalidateFileGeneration** — `generation-ops.ts:135-149`
- **gcStaleEntities** — `generation-ops.ts:155-204`
- **gcStaleNameTokens** — `generation-ops.ts:210-239`
- **runFullGC** — `generation-ops.ts:245-267`
- **clearCache** — `generation-ops.ts:272-275`
- **isCacheLoaded** — `generation-ops.ts:277-279`
- **constructor** — `schema-manager.ts:17-20`
- **createTables** — `schema-manager.ts:26-60`
- **createGraphTables** — `schema-manager.ts:66-167`
- **createSemanticTables** — `schema-manager.ts:172-199`
- **createVersioningTables** — `schema-manager.ts:204-208`
- **createCacheTables** — `schema-manager.ts:213-248`
- **migrateFileGen** — `schema-manager.ts:258-283`
- **quickIntegrityCheck** — `schema-manager.ts:293-358`
- **cleanupStaleLocks** — `schema-manager.ts:363-375`
- **deleteCorruptDatabase** — `schema-manager.ts:380-403`
- **logDatabaseStats** — `schema-manager.ts:408-444`
- **constructor** — `versioning-ops.ts:31-34`
- **initializeProllyComponents** — `versioning-ops.ts:43-59`
- **setProllyContext** — `versioning-ops.ts:64-69`
- **updateClientsAfterFlush** — `versioning-ops.ts:74-81`
- **getProllyNodeStore** — `versioning-ops.ts:87-89`
- **getProllyTree** — `versioning-ops.ts:91-93`
- **getCommitManager** — `versioning-ops.ts:95-97`
- **getBranchDiffCache** — `versioning-ops.ts:99-101`
- **createGraphCommit** — `versioning-ops.ts:110-144`
- **pruneAndGC** — `versioning-ops.ts:150-178`
- **initBranchDiff** — `versioning-ops.ts:187-195`
- **isEntityDeletedOnBranch** — `versioning-ops.ts:200-203`
- **stagingMode** — `versioning-ops.ts:210-212`
- **enableStagingMode** — `versioning-ops.ts:218-257`
- **commitStaging** — `versioning-ops.ts:263-311`
- **abortStaging** — `versioning-ops.ts:316-332`
- **dropBulkIndexes** — `versioning-ops.ts:366-372`
- **recreateBulkIndexes** — `versioning-ops.ts:374-379`
- **walCheckpoint** — `versioning-ops.ts:385-395`
- **metadataCache** — `cbor-utils.ts:14-14`
- **cacheKey** — `cbor-utils.ts:40-40`
- **slice** — `cbor-utils.ts:45-45`
- **cached** — `cbor-utils.ts:48-48`
- **result** — `cbor-utils.ts:52-52`
- **client** — `generation-ops.ts:38-38`
- **projectHash** — `generation-ops.ts:41-41`
- **{ projectHash, branchName }** — `generation-ops.ts:41-41`
- **r** — `generation-ops.ts:49-49`
- **client** — `generation-ops.ts:69-69`
- **projectHash** — `generation-ops.ts:72-72`
- **{ projectHash, branchName }** — `generation-ops.ts:72-72`
- **currentGen** — `generation-ops.ts:73-73`
- **newGen** — `generation-ops.ts:74-74`
- **now** — `generation-ops.ts:75-75`
- **client** — `generation-ops.ts:93-93`
- **projectHash** — `generation-ops.ts:97-97`
- **{ projectHash, branchName }** — `generation-ops.ts:97-97`
- **now** — `generation-ops.ts:98-98`
- **result** — `generation-ops.ts:99-99`
- **unique** — `generation-ops.ts:102-102`
- **BATCH_SIZE** — `generation-ops.ts:105-105`
- **i** — `generation-ops.ts:106-106`
- **batch** — `generation-ops.ts:107-107`
- **valuePlaceholders** — `generation-ops.ts:108-108`
- **args** — `generation-ops.ts:109-109`
- **currentGen** — `generation-ops.ts:112-112`
- **newGen** — `generation-ops.ts:113-113`
- **client** — `generation-ops.ts:136-136`
- **projectHash** — `generation-ops.ts:139-139`
- **{ projectHash, branchName }** — `generation-ops.ts:139-139`
- **client** — `generation-ops.ts:156-156`
- **projectHash** — `generation-ops.ts:160-160`
- **{ projectHash, branchName }** — `generation-ops.ts:160-160`
- **result** — `generation-ops.ts:164-176`
- **deleted** — `generation-ops.ts:178-178`
- **client** — `generation-ops.ts:211-211`
- **projectHash** — `generation-ops.ts:214-214`
- **{ projectHash, branchName }** — `generation-ops.ts:214-214`
- **result** — `generation-ops.ts:216-232`
- **deleted** — `generation-ops.ts:234-234`
- **totalEntities** — `generation-ops.ts:246-246`
- **totalTokens** — `generation-ops.ts:247-247`
- **deleted** — `generation-ops.ts:250-250`
- **requestContextStorage** — `request-context.ts:17-17`
- **values** — `row-mappers.ts:98-98`
- **clean** — `row-mappers.ts:106-106`
- **values** — `row-mappers.ts:107-107`
- **useMultiDb** — `schema-manager.ts:27-27`
- **startTime** — `schema-manager.ts:28-28`
- **client** — `schema-manager.ts:40-40`
- **batchElapsed** — `schema-manager.ts:48-48`
- **totalElapsed** — `schema-manager.ts:55-55`
- **client** — `schema-manager.ts:259-259`
- **start** — `schema-manager.ts:271-271`
- **client** — `schema-manager.ts:294-294`
- **tables** — `schema-manager.ts:298-301`
- **probes** — `schema-manager.ts:309-313`
- **msg** — `schema-manager.ts:319-319`
- **integrityCheck** — `schema-manager.ts:326-326`
- **firstRow** — `schema-manager.ts:327-327`
- **result** — `schema-manager.ts:328-328`
- **shadowTables** — `schema-manager.ts:335-338`
- **tableName** — `schema-manager.ts:340-340`
- **smsg** — `schema-manager.ts:344-344`
- **msg** — `schema-manager.ts:351-351`
- **unlink** — `schema-manager.ts:364-364`
- **{ unlink }** — `schema-manager.ts:364-364`
- **lockFiles** — `schema-manager.ts:365-365`
- **unlink** — `schema-manager.ts:381-381`
- **{ unlink, stat }** — `schema-manager.ts:381-381`
- **filesToDelete** — `schema-manager.ts:383-383`
- **anyDeleted** — `schema-manager.ts:385-385`
- **fileStats** — `schema-manager.ts:389-389`
- **sizeMB** — `schema-manager.ts:390-390`
- **err** — `schema-manager.ts:395-395`
- **client** — `schema-manager.ts:409-409`
- **pageCount** — `schema-manager.ts:413-413`
- **pageSize** — `schema-manager.ts:414-414`
- **cacheSize** — `schema-manager.ts:415-415`
- **freelistCount** — `schema-manager.ts:416-416`
- **pages** — `schema-manager.ts:418-418`
- **size** — `schema-manager.ts:419-419`
- **cache** — `schema-manager.ts:420-420`
- **freelist** — `schema-manager.ts:421-421`
- **dbSizeMB** — `schema-manager.ts:423-423`
- **cacheMB** — `schema-manager.ts:424-424`
- **mem** — `schema-manager.ts:434-434`
- **versioningClient** — `versioning-ops.ts:44-44`
- **entities** — `versioning-ops.ts:120-120`
- **relationships** — `versioning-ops.ts:121-121`
- **entries** — `versioning-ops.ts:123-126`
- **rootHash** — `versioning-ops.ts:128-128`
- **commit** — `versioning-ops.ts:130-135`
- **now** — `versioning-ops.ts:159-159`
- **pruned** — `versioning-ops.ts:165-165`
- **roots** — `versioning-ops.ts:168-168`
- **gcDeleted** — `versioning-ops.ts:169-169`
- **client** — `versioning-ops.ts:219-219`
- **client** — `versioning-ops.ts:264-264`
- **client** — `versioning-ops.ts:318-318`
- **client** — `versioning-ops.ts:367-367`
- **stmts** — `versioning-ops.ts:369-369`
- **client** — `versioning-ops.ts:375-375`
- **client** — `versioning-ops.ts:386-386`
