# LibSQL (storage operations)

## 🤖 Overview

This module provides a comprehensive set of operations for managing data in a LibSQL graph database. It includes functionalities for caching embeddings, handling co-occurrence statistics, entity operations, generation management, metadata manipulation, relationship operations, and more. Developers and data scientists use this module to efficiently interact with and manipulate graph data stored in LibSQL.

## 🤖 Architecture

```
  +---------------------+
  |     Cache Operations |
  +---------------------+
          |
          v
  +---------------------+
  |     Cooccurrence Ops |
  +---------------------+
          |
          v
  +---------------------+
  |     Entity Operations |
  +---------------------+
          |
          v
  +---------------------+
  |     Generation Manager |
  +---------------------+
          |
          v
  +---------------------+
  |     Metadata Operations |
  +---------------------+
          |
          v
  +----------------
  | Relationship Ops |
  +----------------+
          |
          v
  +---------------------+
  |     Vector Operations |
  +---------------------+
          |
          v
  +---------------------+
  |     Versioning Ops |
  +---------------------+
```

## 🤖 Flow

```
  +---------------------+
  |     Request Context |
  +---------------------+
          |
          v
  +---------------------+
  |     Schema Manager |
  +---------------------+
          |
          v
  +---------------------+
  |     Client Getter |
  +---------------------+
          |
          v
  +---------------------+
  |     Write Mutex |
  +---------------------+
          |
          v
  +---------------------+
  |     Cache Operations |
  +---------------------+
          |
          v
  +---------------------+
  |     Cooccurrence Ops |
  +---------------------+
          |
          v
  +---------------------+
  |     Entity Operations |
  +---------------------+
          |
          v
  +---------------------+
  |     Generation Manager |
  +---------------------+
          |
          v
  +---------------------+
  |     Metadata Operations |
  +---------------------+
          |
          v
  +---------------------+
  |     Relationship Ops |
  +---------------------+
          |
          v
  +---------------------+
  |     Vector Operations |
  +---------------------+
          |
          v
  +---------------------+
  |     Versioning Ops |
  +---------------------+
```

## 🤖 Entity Listing

### Function
- **alternatives** — Represents alternative entities `entity-ops.ts:564-568`
- **baseEntities** — Filters entities to exclude delta and tombstone IDs `entity-ops.ts:953-953`
- **baseEntities** — Filters out entities not in the delta and not tombstoned `entity-ops.ts:1160-1160`
- **baseEntities** — Represents entities in the database `entity-ops.ts:1235-1239`
- **baseEntities** — Filters entities to exclude those with IDs in deltaIds or tombstones `entity-ops.ts:1240-1240`
- **baseIds** — Maps rows to their IDs `entity-ops.ts:1089-1089`
- **baseIds** — Filters base IDs to exclude those in deltaIds and tombstones `entity-ops.ts:1090-1090`
- **batchPromises** — Processes batches of embeddings, attempting to write them to the database and logging errors `vector-ops.ts:129-138`
- **chunkedDirRead** — Reads entities in chunks from a database query `entity-ops.ts:926-943`
- **chunkedRead** — Reads entities in chunks from a database query `entity-ops.ts:1133-1150`
- **clearMetadataCache** — Clears the metadata cache `cbor-utils.ts:139-141`
- **compactKeys** — Compacts metadata keys before CBOR encoding to reduce BLOB size `cbor-utils.ts:57-64`
- **compactLocation** — Serialize SourceSpan to compact string: "startLine:startCol:startIdx-endLine:endCol:endIdx" `entity-ops.ts:25-35`
- **decodeMetadata** — Decodes CBOR metadata to a record, expanding compact keys if necessary `cbor-utils.ts:95-133`
- **deltaEntities** — Maps delta result rows to entities with id, language, and filePath `entity-ops.ts:1219-1223`
- **deltaIds** — Creates a set of IDs from an array of delta entities `entity-ops.ts:866-866`
- **deltaIds** — Creates a set of IDs from delta entities `entity-ops.ts:952-952`
- **deltaIds** — Creates a set of delta IDs from the rows of a query result `entity-ops.ts:1074-1074`
- **deltaIds** — Creates a set of delta IDs from delta entities. `entity-ops.ts:1159-115 `entity-ops.ts:1159-1159`
- **deltaIds** — Creates a set of ids from delta entities `entity-ops.ts:1224-1224`
- **deltaIds** — Stores unique IDs of delta relationships in a Set `relationship-ops.ts:241-241`
- **encodeMetadata** — Encodes metadata object to CBOR binary with compact keys, falling back to JSON if encoding fails `cbor-utils.ts:80-88`
- **entries** — Creates an array of term frequency entries for updating the database `cooccurrence-ops.ts:148-152`
- **entries** — Maps entities to key-value pairs for serialization `versioning-ops.ts:131-134`
- **expandKeys** — Expands compact keys after CBOR decoding to restore original key names `cbor-utils.ts:67-73`
- **filePaths** — Extracts unique file paths from entities `entity-ops.ts:249-249`
- **getEmbeddingColumn** — Get the embedding column name for a given dimension `types.ts:54-59`
- **getMetadataCacheStats** — Retrieves statistics about the metadata cache `cbor-utils.ts:146-151`
- **getRequestContext** — Get the current request-scoped project context, if any, or return undefined if not running inside `runWithRequestContext `request-context.ts:31-33`
- **idsToClean** — Creates a unique list of string IDs from an array of entities `entity-ops.ts:326-326`
- **idsToClean** — Creates a list of unique IDs from an array, filtering out falsy values `entity-ops.ts:326-326`
- **isCorruptionError** — Check if an error is a corruption error `types.ts:135-143`
- **kotlinCount** — Filters entities by language and counts them `entity-ops.ts:224-224`
- **missingIds** — Identifies IDs that are not present in a result set. `entity-ops.ts:477 `entity-ops.ts:477-477`
- **missingPlaceholders** — Generates a string of placeholders for missing IDs `entity-ops.ts:479-479`
- **normalizedTerms** — Normalizes a list of terms to lowercase `cooccurrence-ops.ts:217-217`
- **normalizeToSupportedDimension** — Normalize dimensions to nearest supported value `types.ts:65-70`
- **parseLocation** — Deserialize location string — handles both compact format and legacy JSON `entity-ops.ts:40-55`
- **placeholders** — Placeholder for SQL query parameters `cache-ops.ts:62-62`
- **placeholders** — Generates placeholders for SQL query parameters `cooccurrence-ops.ts:220-220`
- **placeholders** — Generates placeholders for SQL queries by joining "?" strings `entity-ops.ts:330-330`
- **placeholders** — Represents placeholders for entity names `entity-ops.ts:458-458`
- **placeholders** — Joins placeholders into a comma-separated string `entity-ops.ts:579-579`
- **placeholders** — Creates a string of placeholders for SQL queries `entity-ops.ts:772-772`, `entity-ops.ts:1012-1012`
- **placeholders** — Represents placeholders for SQL queries `vector-ops.ts:516-516`
- **quoted** — Quotes a string for use in SQL queries `relationship-ops.ts:299-299`
- **quoted** — Maps each ID to a quoted string and joins them with commas `relationship-ops.ts:319-319`
- **quoted** — Quotes and joins relation types into a comma-separated string `relationship-ops.ts:279-279`
- **rowToEntity** — Converts an EntityRow from the database to an Entity domain object `row-mappers.ts:59-74`
- **rowToRelationship** — Converts a RelationshipRow from the database to a Relationship domain object `row-mappers.ts:79-89`
- **runWithRequestContext** — Run a function with a request-scoped project context, ensuring all async operations within the function see this context `request-context.ts:23-25`
- **sample** — Slices entities and maps them to a sample format `entity-ops.ts:225-225`
- **splitToTokens** — Split an entity name into searchable tokens (camelCase, PascalCase, snake_case, kebab-case) `entity-ops.ts:71-81`
- **statements** — Maps each entry to an SQL statement for inserting or replacing an embedding in the cache `cache-ops.ts:122-131`
- **statements** — Maps file info to SQL statements for batch update `metadata-ops.ts:68-78`
- **statements** — Represents SQL statements for vector operations `vector-ops.ts:252-268`
- **statements** — Parses and maps embeddings to SQL statements for insertion `vector-ops.ts:103-119`
- **stmts** — Represents SQL statements for creating tables `schema-manager.ts:521-521`
- **stmts** — Represents SQL statements for versioned storage operations `versioning-ops.ts:430-430`
- **stringToVector** — Not present in the provided code `row-mappers.ts:106-110`
- **uniqueIds** — Extracts unique IDs from an array, excluding those marked as tombstones `entity-ops.ts:450-450`
- **valuePlaceholders** — Creates placeholders for SQL queries using tokens `entity-ops.ts:196-196`
- **valuePlaceholders** — Maps to a placeholder string for values `entity-ops.ts:273-273`
- **valuePlaceholders** — Generates placeholders for SQL queries with multiple values, joining "(?, ?, ?, ?)" strings `entity-ops.ts:343-343`
- **valuePlaceholders** — Creates a string of placeholders for batch operations `generation-ops.ts:105-105`
- **valuePlaceholders** — Creates placeholders for SQL statements based on a batch of values `relationship-ops.ts:145-145`
- **values** — Not present in the provided code `row-mappers.ts:99-99`
- **values** — Parses a string into an array of floats `row-mappers.ts:108-108`
- **vectorToString** — Not present in the provided code `row-mappers.ts:98-101`
- **withLang** — Counts the number of entities with a language specified. `entity `entity-ops.ts:223-223`

### Method
- **_r** — Wraps a function to route read operations through a per-DB mutex if available, otherwise executes directly `entity-ops.ts:136-138`
- **_r** — Method to route read through per-DB mutex if available — serialized with writes `relationship-ops.ts:66-68`
- **_w** — Routes write operations through a per-DB mutex if available `cache-ops.ts:22-24`
- **_w** — Wraps a function in a write mutex if available `cooccurrence-ops.ts:42-44`
- **_w** — Wraps a function to route write operations through a per-DB mutex if available, otherwise executes directly `entity-ops.ts:130-132`
- **_w** — Route write through per-DB mutex if available `metadata-ops.ts:26-28`
- **_w** — Method to route write through per-DB mutex if available `relationship-ops.ts:61-63`
- **_wv** — Returns a promise that executes a function within a versioning context `versioning-ops.ts:108-110`
- **abortStaging** — Aborts staging changes and rolls back to the previous state `versioning-ops.ts:369-385`
- **batchUpdateCooccurrence** — Updates co-occurrence counts from extracted term pairs `cooccurrence-ops.ts:57-98`
- **batchUpdateFileInfo** — Batch updates or inserts multiple file infos in a single DB round-trip `metadata-ops.ts:57-82`
- **buildFilterClause** — Builds a SQL filter clause based on provided filters, filePath, and name `entity-ops.ts:505-607`
- **buildFromIdFilter** — Builds a filter for relationships based on a specific from_id `relationship-ops.ts:286-291`
- **buildFromIdFilterForCTE** — Builds a filter for relationships based on a specific from_id for a Common Table Expression `relationship-ops.ts:296-301`
- **buildSearchClause** — Builds a search clause for entities `entity-ops.ts:753-800`
- **buildToIdFilter** — Builds a filter for relationships based on a specific to_id `relationship-ops.ts:306-311`
- **buildToIdFilterForCTE** — Builds a filter for relationships based on a specific to_id for a Common Table Expression `relationship-ops.ts:316-321`
- **buildTypeFilter** — Constructs a SQL filter clause for relationship types. `relationship-ops.ts:266-27 `relationship-ops.ts:266-271`
- **buildTypeFilterForCTE** — Builds a filter string for Common Table Expressions based on relation types `relationship-ops.ts:276-281`
- **bulkInsertEmbeddings** — Inserts multiple embeddings at once `vector-ops.ts:237-287`
- **bumpGeneration** — Increments the generation for a single file and updates the cache and database `generation-ops.ts:68-84`
- **bumpGenerationBatch** — Bumps the generation number for a batch of file paths and stores the new generation in a cache `generation-ops.ts:90-125`
- **cleanupStaleLocks** — Cleans up stale locks in the database `schema-manager.ts:407-419`
- **clear** — Clears all co-occurrence data `cooccurrence-ops.ts:310-333`
- **clear** — Clears metadata for a specific file `metadata-ops.ts:478-566`
- **clearAll** — Clears all metadata for a project `metadata-ops.ts:571-622`
- **clearCache** — Clears the cache and sets the cacheLoaded flag to false `generation-ops.ts:269-272`
- **clearEmbeddingCache** — Clears all embeddings from the cache `cache-ops.ts:140-150`
- **commitStaging** — Commits staging changes to the database `versioning-ops.ts:278-364`
- **constructor** — Initializes CacheOperations with a client getter and optional write mutex `cache-ops.ts:16-19`
- **constructor** — Initializes the CooccurrenceOperations class with client and context getters `cooccurrence-ops.ts:35-39`
- **constructor** — Initializes an instance of EntityOperations with necessary dependencies `entity-ops.ts:110-118`
- **constructor** — Initializes a new GenerationManager instance with client and context getters `generation-ops.ts:28-31`
- **constructor** — Initializes MetadataOperations with client and context getters, optional cache client, and write mutex `metadata-ops.ts:17-23`
- **constructor** — Constructor for initializing RelationshipOperations with client, context, and other delegates `relationship-ops.ts:42-49`
- **constructor** — Initializes the SchemaManager with a client and a multi-db manager `schema-manager.ts:17-20`
- **constructor** — Constructor for DatabaseCorruptionError `types.ts:123-129`
- **constructor** — Initializes the VectorOperations class with a context `vector-ops.ts:49-49`
- **constructor** — Initializes VersioningOps with a client and database manager `versioning-ops.ts:31-34`
- **countByLanguage** — Counts entities by language, considering both active and base branches, and excludes tombstones. `entity-ops.ts:1 `entity-ops.ts:1171-1262`
- **createCacheTables** — Creates cache-related tables and indexes `schema-manager.ts:234-292`
- **createGraphCommit** — Creates a graph commit with serialized entities and relationships, logging the commit details `versioning-ops.ts:116-153`
- **createGraphTables** — Creates graph-related tables and indexes `schema-manager.ts:66-187`
- **createSemanticTables** — Creates semantic-related tables and indexes `schema-manager.ts:192-220`
- **createTables** — Creates necessary tables and indexes for the database `schema-manager.ts:26-60`
- **createVersioningTables** — Creates versioning-related tables and indexes `schema-manager.ts:225-229`
- **deleteCorruptDatabase** — Deletes a corrupt database `schema-manager.ts:424-447`
- **deleteEmbedding** — Deletes an embedding by ID `vector-ops.ts:451-464`
- **deleteEntitiesBatch** — Deletes entities and their name tokens in batches, handling tombstones and SQLite parameter limits `entity-ops.ts:993-1027`
- **deleteEntitiesByFilePath** — Deletes entities associated with a given file path, invalidating the file generation to mark them as stale `entity-ops.ts:1099-1110`
- **deleteEntity** — Deletes an entity from the database, optionally adding a tombstone to hide it from the base branch `entity-ops.ts:963-987`
- **deleteFileInfo** — Deletes file information from the database based on the provided path `metadata-ops.ts:164-182`
- **deleteRelationship** — Deletes a relationship `relationship-ops.ts:453-471`
- **dropBulkIndexes** — Drops bulk indexes for versioned storage `versioning-ops.ts:427-433`
- **dropIndexes** — Drops indexes in the database `schema-manager.ts:520-524`
- **dropVectorIndex** — Drops an existing vector index `vector-ops.ts:168-193`
- **enableStagingMode** — Enables staging mode for bulk reindex operations `versioning-ops.ts:229-272`
- **findEntities** — Finds entities based on certain criteria `entity-ops.ts:612-747`
- **findRelationships** — Finds relationships based on given filters `relationship-ops.ts:327-447`
- **gcStaleEntities** — Deletes stale entities where file_gen != active_gen and invalidates file_generations `generation-ops.ts:152-201`
- **gcStaleNameTokens** — Deletes stale name_tokens where entities are not found or file_gen != active_gen. `generation `generation-ops.ts:207-236`
- **getAllEntities** — Fetches all entities, considering both active and base branches, and filters out tombstones `entity-ops.ts:1115-1164`
- **getAllIndexedFiles** — Retrieves a map of indexed files with their last indexed timestamps `metadata-ops.ts:139-159`
- **getAllRelationships** — Retrieves all relationships `relationship-ops.ts:477-548`
- **getBranchDiffCache** — Retrieves Branch Diff Cache instance `versioning-ops.ts:99-101`
- **getCommitManager** — Retrieves Commit Manager instance `versioning-ops.ts:95-97`
- **getEmbedding** — Retrieves an embedding by ID `vector-ops.ts:408-446`
- **getEmbeddingCount** — Counts the number of embeddings `vector-ops.ts:469-482`
- **getEmbeddingFromCache** — Retrieves a cached embedding by content hash `cache-ops.ts:30-49`
- **getEmbeddingsFromCache** — Retrieves multiple cached embeddings by content hashes `cache-ops.ts:55-78`
- **getEntitiesBatch** — Fetches multiple entities by ID, handling tombstones and fetching from the current or base branch if necessary. `entity-ops.ts:43 `entity-ops.ts:434-498`
- **getEntity** — Retrieves an entity by ID, checking for tombstones and fetching from the current or base branch if necessary `entity-ops.ts:378-427`
- **getEntityIdsByFilePath** — Retrieves IDs of entities associated with a given file path, considering both active and base branches `entity-ops.ts:1032-1093`
- **getExistingEmbeddingIds** — Retrieves existing embedding IDs `vector-ops.ts:487-548`
- **getFileInfo** — Retrieves file information from the database based on path, project hash, and branch name `metadata-ops.ts:87-105`
- **getGeneration** — Retrieves the active generation for a file, using the cache or the database `generation-ops.ts:60-62`
- **getIncrementalTrackingInfo** — Retrieves incremental tracking information including last full index time, incremental changes count, and total files `metadata-ops.ts:249-275`
- **getOutdatedFiles** — Fetches outdated files from the database based on the last indexed timestamp. `metadata-ops.ts:110-13 `metadata-ops.ts:110-133`
- **getProjectIndexName** — Retrieves the name of the project index `vector-ops.ts:366-379`
- **getProllyNodeStore** — Retrieves Prolly Node Store instance `versioning-ops.ts:87-89`
- **getProllyTree** — Retrieves Prolly Tree instance `versioning-ops.ts:91-93`
- **getRelatedTerms** — Retrieves related terms for a given term based on co-occurrence counts `cooccurrence-ops.ts:168-201`
- **getRelatedTermsBatch** — Retrieves related terms for multiple terms in a single query `cooccurrence-ops.ts:210-258`
- **getRelationshipsForEntity** — Fetches relationships for a given entity, considering both base and delta branches `relationship-ops.ts:194-261`
- **getStats** — Retrieves statistics for co-occurrence pairs `cooccurrence-ops.ts:279-305`
- **getStats** — Retrieves statistics for a project `metadata-ops.ts:400-441`
- **getTotalStats** — Retrieves total statistics for a project `metadata-ops.ts:446-467`
- **getTraceUsageCount** — Returns a trace usage count of 1 `metadata-ops.ts:329-331`
- **incrementTraceUsageCount** — Increments trace usage count, but no longer tracked in Zig-compatible schema `metadata-ops.ts:336-338`
- **initBranchDiff** — Initializes branch diff cache for optimized reads `versioning-ops.ts:198-206`
- **initializeProllyComponents** — Initializes Prolly Tree components for versioned storage `versioning-ops.ts:43-59`
- **insertEmbedding** — Inserts a single embedding into the database `vector-ops.ts:54-88`
- **insertEmbeddingBatch** — Inserts multiple embeddings into the database `vector-ops.ts:93-163`
- **insertEntities** — Inserts entities into the database, handling duplicates and ensuring generation cache is loaded `entity-ops.ts:212-373`
- **insertEntity** — Inserts a single entity into `entity-ops.ts:143-207`
- **insertRelationship** — Method to insert a single relationship `relationship-ops.ts:73-100`
- **insertRelationships** — Method to insert multiple relationships `relationship-ops.ts:105-189`
- **invalidateFileGeneration** — Invalidates the generation for a specific file path by setting its active generation to -1. `generation-ops `generation-ops.ts:132-146`
- **invalidateSearchCache** — Invalidates the search cache `vector-ops.ts:292-294`
- **isCacheLoaded** — Indicates whether the generation cache has been loaded `generation-ops.ts:274-276`
- **isEntityDeletedOnBranch** — Checks if an entity is deleted on a specific branch `versioning-ops.ts:211-214`
- **listBranches** — Lists all branches in a project `metadata-ops.ts:375-390`
- **listProjects** — Lists projects with their metadata, including project hash, branch name, last indexed time, entity count, and file count `metadata-ops.ts:343-370`
- **loadCache** — Loads the generation cache from the database for the current project and branch `generation-ops.ts:37-54`
- **logDatabaseStats** — Logs database statistics `schema-manager.ts:452-488`
- **migrateFileGen** — Migrates file generation tables `schema-manager.ts:302-327`
- **processVectorResults** — Processes results from vector operations `vector-ops.ts:384-403`
- **pruneAndGC** — Prunes and garbage collects commits, logging the number of pruned and garbage collected nodes `versioning-ops.ts:159-189`
- **pruneRarePairs** — Removes co-occurrence pairs with low counts `cooccurrence-ops.ts:341-363`
- **quickIntegrityCheck** — Performs a quick integrity check on the database `schema-manager.ts:337-402`
- **rebuildVectorIndex** — Rebuilds a vector index `vector-ops.ts:198-232`
- **recalculatePMI** — Recalculates PMI values, but this function is a no-op in the Zig-compatible schema `cooccurrence-ops.ts:268-270`
- **recordIncrementalChanges** — Records incremental changes by updating the last indexed timestamp `metadata-ops.ts:280-294`
- **recreateBulkIndexes** — Recreates bulk indexes for versioned storage `versioning-ops.ts:435-440`
- **recreateGraphIndexes** — Recreates graph-related indexes `schema-manager.ts:527-546`
- **recreateSemanticIndexes** — Recreates semantic-related indexes `schema-manager.ts:549-561`
- **resetIncrementalTracking** — Resets incremental tracking by updating the last indexed and updated at timestamps `metadata-ops.ts:299-315`
- **runFullGC** — Asynchronously runs full garbage collection by deleting stale entities and tokens in chunks, logging the result `generation-ops.ts:242-264`
- **searchEntities** — Searches for entities based on certain criteria `entity-ops.ts:805-896`
- **searchEntitiesInDirectory** — Searches for entities in a specified directory, handling both base and feature branches `entity-ops.ts:901-957`
- **searchVectors** — Searches for vectors based on similarity `vector-ops.ts:299-361`
- **setEmbeddingInCache** — Inserts or replaces an embedding in the cache with a given content hash, model, and embedding `cache-ops.ts:83-106`
- **setEmbeddingsInCache** — Inserts or replaces multiple embeddings in the cache with given content hashes, models, and embeddings `cache-ops.ts:111-138`
- **setProllyContext** — Sets Prolly Tree context for current project/branch `versioning-ops.ts:64-69`
- **setTombstoneDelegates** — Sets delegates for tombstone operations, which are used for layered branch support `entity-ops.ts:124-127`
- **setTombstoneDelegates** — Method to set tombstone delegates for layered branch support `relationship-ops.ts:55-58`
- **stagingMode** — Indicates whether staging mode is enabled `versioning-ops.ts:221-223`
- **updateClientsAfterFlush** — Updates client references after flush (close/reopen) `versioning-ops.ts:74-81`
- **updateFileInfo** — Updates or inserts file info in the database `metadata-ops.ts:37-52`
- **updateProjectMetadata** — Updates project metadata with entity, file, and relationship counts, and sets last indexed and created at timestamps `metadata-ops.ts:191-244`
- **updateTermFrequencies** — Updates term frequencies in the database with batched inserts `cooccurrence-ops.ts:106-139`
- **updateTermFrequenciesLegacy** — Updates term frequencies in the database with a placeholder entity_id `cooccurrence-ops.ts:145-154`
- **walCheckpoint** — Represents WAL checkpoint operations `versioning-ops.ts:446-456`

### Class
- **CacheOperations** — Handles embedding cache operations for reusing embeddings across projects `cache-ops.ts:15-151`
- **CooccurrenceOperations** — Manages co-occurrence operations for the LibSQL Graph Adapter `cooccurrence-ops.ts:34-364`
- **DatabaseCorruptionError** — Error type for database corruption `types.ts:122-130`
- **EntityOperations** — Represents operations for managing entities, including inserting, retrieving, and updating entities `entity-ops.ts:106-1263`
- **GenerationManager** — Manages generation-based copy-on-write for entity storage `generation-ops.ts:22-277`
- **MetadataOperations** — Handles metadata operations for LibSQL Graph Adapter, including file info, project metadata, incremental tracking, branch listing, and clear operations `metadata-ops.ts:16-623`
- **RelationshipOperations** — Class for handling Relationship CRUD operations `relationship-ops.ts:38-549`
- **SchemaManager** — Manages database schema creation, migrations, and integrity checks `schema-manager.ts:16-562`
- **VectorOperations** — Class for vector operations `vector-ops.ts:48-549`
- **VersioningOps** — Handles all versioned storage operations including Prolly Tree initialization, graph commit creation, pruning, and branch diff cache management `versioning-ops.ts:23-457`

### Interface
- **CooccurrenceStats** — Stores statistics about co-occurrence pairs and terms `cooccurrence-ops.ts:24-28`
- **EntityRow** — Database row structure for Entity table (snake_case columns) `row-mappers.ts:19-37`
- **LibSQLGraphConfig** — Configuration interface for LibSQL Graph Adapter `types.ts:18-31`
- **ProjectContext** — Interface for project context `types.ts:76-83`
- **RelatedTerm** — Represents a term with its related score and count `cooccurrence-ops.ts:18-22`
- **RelationshipRow** — Database row structure for Relationship table (snake_case columns) `row-mappers.ts:42-50`
- **VectorOpsContext** — Context object providing access to shared state and helpers `vector-ops.ts:29-42`

### Type_alias
- **Client** — Alias for libsql Client compatibility — all consumers use this type `types.ts:11-11`
- **ClientGetter** — Getter for Client `types.ts:152-152`
- **ContextGetter** — Getter for ProjectContext `types.ts:157-157`
- **DbMutexFn** — Function for database mutex `types.ts:173-173`
- **MetadataDecoder** — Parses a buffer or string into a record of metadata `types.ts:183-183`
- **MetadataEncoder** — Encoder for metadata `types.ts:178-178`
- **RowToEntityMapper** — Maps a database row to an entity object `entity-ops.ts:90-90`
- **RowToRelationshipMapper** — Delegate type for converting database row to Relationship `relationship-ops.ts:22-22`
- **SupportedDimension** — Supported embedding dimensions `types.ts:48-48`
- **TombstoneAdder** — Adds a tombstone for an entity or relationship `entity-ops.ts:95-95`
- **TombstoneAdder** — Delegate type for adding tombstone when relationship is deleted on feature branch `relationship-ops.ts:27-27`
- **TombstoneGetter** — Returns a promise containing a set of tombstone IDs for a given entity type `entity-ops.ts:100-100`
- **TombstoneGetter** — Delegate type for getting all tombstoned IDs for current branch `relationship-ops.ts:32-32`
- **WriteMutexFn** — Function for write mutex `types.ts:165-165`

### Import_decl
- **../../logging/index.js** — Imports `../../logging/index.js` from `../../logging/index.js`. `cooccurrence-ops.ts:11-11`, `entity-ops.ts:11-11`, `generation-ops.ts:15-15`, `metadata-ops.ts:8-8`, `schema-manager.ts:8-8`, `vector-ops.ts:9-9`, `versioning-ops.ts:13-13`
- **../../types/semantic.js** — Imports `../../types/semantic.js` from `../../types/semantic.js`. `vector-ops.ts:10-10`
- **../../types/storage.js** — Imports `../../types/storage.js` from `../../types/storage.js`. `entity-ops.ts:12-12`, `metadata-ops.ts:9-9`, `relationship-ops.ts:11-11`, `row-mappers.ts:8-8`, `versioning-ops.ts:14-14`
- **../multi-db-manager.js** — Imports `../multi-db-manager.js` from `../multi-db-manager.js`. `schema-manager.ts:9-9`, `versioning-ops.ts:15-15`
- **../native-sqlite-client.js** — Imports `../native-sqlite-client.js` from `../native-sqlite-client.js`. `types.ts:8-8`, `vector-ops.ts:11-11`
- **../prolly/index.js** — Imports `../prolly/index.js` from `../prolly/index.js`. `versioning-ops.ts:16-16`
- **./cbor-utils.js** — Imports `./cbor-utils.js` from `./cbor-utils.js`. `entity-ops.ts:13-13`, `relationship-ops.ts:12-12`, `row-mappers.ts:9-9`
- **./entity-ops.js** — Imports `./entity-ops.js` from `./entity-ops.js`. `row-mappers.ts:10-10`
- **./generation-ops.js** — Imports `./generation-ops.js` from `./generation-ops.js`. `entity-ops.ts:14-14`
- **./types.js** — Imports `./types.js` from `./types.js`. `cache-ops.ts:9-9`, `cbor-utils.ts:11-11`, `cooccurrence-ops.ts:12-12`, `entity-ops.ts:15-15`, `generation-ops.ts:16-16`, `metadata-ops.ts:10-10`, `relationship-ops.ts:13-13`, `request-context.ts:15-15`, `schema-manager.ts:10-10`, `vector-ops.ts:20-20`, `versioning-ops.ts:17-17`
- **./types.js** — Imports `./types.js`. `vector-ops.ts:12-19`
- **cbor-x** — Imports `cbor-x` from `cbor-x`. `cbor-utils.ts:9-9`
- **lru-cache** — Imports `lru-cache` from `lru-cache`. `cbor-utils.ts:10-10`, `vector-ops.ts:8-8`
- **node:async_hooks** — Imports `node:async_hooks` from `node:async_hooks`. `request-context.ts:14-14`

### Property
- **_stagingMode** — Internal flag indicating staging mode `versioning-ops.ts:220-220`
- **args** — Stores an array of SQL statements and their corresponding arguments `entity-ops.ts:266-266`
- **args** — Stores SQL statements and their corresponding arguments in an array `relationship-ops.ts:139-139`
- **avgPairCount** — Average number of pairs per term `cooccurrence-ops.ts:27-27`
- **baseBranch** — Base branch for layered reads `types.ts:80-80`
- **branchDiffCache** — Optimizes branch diff reads for versioned storage `versioning-ops.ts:28-28`
- **branchName** — Represents the name of the branch `entity-ops.ts:514-514`
- **branchName** — Represents a branch name as a string `entity-ops.ts:760-760`
- **branchName** — Represents the branch name for a project `metadata-ops.ts:346-346`
- **branchName** — Branch name `types.ts:78-78`
- **cache** — In-memory cache storing active generation numbers for files `generation-ops.ts:24-24`
- **cacheLoaded** — Indicates whether the generation cache has been loaded `generation-ops.ts:25-25`
- **column** — Represents a column number in a start object `entity-ops.ts:28-28`
- **column** — Represents the end position of a column in a file `entity-ops.ts:29-29`
- **commitManager** — Manages graph commits for versioned storage `versioning-ops.ts:27-27`
- **complexity** — Complexity of the entity, optional `row-mappers.ts:28-28`
- **compression** — Compression level for neighbor storage `types.ts:24-24`
- **config** — Required configuration for LibSQL Graph `vector-ops.ts:32-32`
- **contentHash** — Content hash used to identify cached embeddings `cache-ops.ts:112-112`
- **count** — The count of occurrences for a related term `cooccurrence-ops.ts:21-21`
- **count** — Asynchronously counts entities by language and returns a map of counts and file counts `entity-ops.ts:1171-1171`
- **count** — Initializes a map to store counts of entities by language and file count `entity-ops.ts:1196-1196`
- **count** — Counts the number of entities `entity-ops.ts:1244-1244`
- **count** — Initializes a map to store counts of entities and file counts `entity-ops.ts:1257-1257`
- **created_at** — Stores the timestamp when an entity or relationship was created `row-mappers.ts:49-49`
- **created_at** — Timestamp when the entity was created `row-mappers.ts:35-35`
- **decodeMetadata** — Decodes metadata for embeddings `vector-ops.ts:38-38`
- **dimensions** — Vector dimensions (default: 384 for all-MiniLM-L6-v2) `types.ts:20-20`
- **dimensions** — Represents the dimensions of a supported dimension or is undefined `types.ts:82-82`
- **embedding** — Embedded data stored in the cache `cache-ops.ts:112-112`
- **embeddingCache** — LRU cache for embedding results `vector-ops.ts:39-39`
- **encodeMetadata** — Encodes metadata for embeddings `vector-ops.ts:37-37`
- **end** — Represents an end object with line, column, and index `entity-ops.ts:29-29`
- **ensureProjectVectorIndex** — Ensures the project vector index is created `vector-ops.ts:41-41`
- **entities** — Represents the number of entities deleted during full garbage collection `generation-ops.ts:242-242`
- **entityCount** — Counts the number of entities in a file `metadata-ops.ts:349-349`
- **entityId** — Represents the entity ID in the term frequency update `cooccurrence-ops.ts:106-106`
- **entityType** — Represents an optional EntityType or an array of EntityType `entity-ops.ts:508-508`
- **entityType** — Represents the type of an entity `entity-ops.ts:615-615`
- **error** — Stores an array of items with their associated errors `entity-ops.ts:219-219`
- **error** — Represents an error item with an unknown item and an error message `relationship-ops.ts:112-112`
- **file_gen** — Indicates if the entity is generated, optional `row-mappers.ts:34-34`
- **file_path** — File path of the entity `row-mappers.ts:23-23`
- **fileCount** — Asynchronously counts the number of files by language and returns a map of counts `entity-ops.ts:1171-1171`
- **fileCount** — Initializes a map to store counts of entities by language and file count `entity-ops.ts:1196-1196`
- **fileCount** — Counts the number of files `entity-ops.ts:1257-1257`
- **fileCount** — Counts the number of files in a project `metadata-ops.ts:350-350`
- **filePath** — Represents the file path of an entity `entity-ops.ts:509-509`
- **filePath** — Represents a file path as a string or an array of strings `entity-ops.ts:616-616`
- **filePath** — Represents a file path as a string `entity-ops.ts:757-757`
- **filePath** — Represents an optional string for file paths `entity-ops.ts:808-808`
- **files** — Stores file-related information `entity-ops.ts:1244-1244`
- **filters** — Filters entities based on specific conditions `entity-ops.ts:613-619`
- **filters** — Represents the filters used to find relationships `relationship-ops.ts:328-334`
- **frequency** — Represents the frequency of a term in the term frequency update `cooccurrence-ops.ts:106-106`
- **from_id** — ID of the entity from which the relationship originates `row-mappers.ts:44-44`
- **fromId** — Represents the from_id of a relationship `relationship-ops.ts:331-331`
- **gcDeleted** — Returns a promise that resolves `versioning-ops.ts:163-163`
- **gcRunning** — Indicates whether garbage collection is running `generation-ops.ts:26-26`
- **getClient** — Getter for the shared client `vector-ops.ts:30-30`
- **getContext** — Getter for the shared context `vector-ops.ts:31-31`
- **getEffectiveDimensions** — Returns the effective dimensions for embeddings `vector-ops.ts:33-33`
- **getEmbeddingColumnName** — Returns the column name for embeddings `vector-ops.ts:34-34`
- **GRAPH_DROPPABLE_INDEXES** — Represents droppable indexes for graph tables `schema-manager.ts:495-508`
- **GRAPH_INDEX_CREATES** — Represents graph index creation operations `versioning-ops.ts:409-425`
- **GRAPH_INDEXES** — Represents graph indexes for versioned storage `versioning-ops.ts:391-407`
- **has_docs** — Indicates if the entity has documentation, optional `row-mappers.ts:33-33`
- **hash** — Hash of the entity, optional `row-mappers.ts:27-27`
- **id** — Unique identifier for an entity `row-mappers.ts:20-20`
- **id** — Represents a string identifier `row-mappers.ts:43-43`
- **incrementalChangesCount** — Represents the count of incremental changes `metadata-ops.ts:251-251`
- **index** — Represents an index in a start object `entity-ops.ts:28-28`
- **index** — Represents the end position of an index in a file `entity-ops.ts:29-29`
- **insertL** — DiskANN insert list size `types.ts:28-28`
- **is_async** — Indicates if the entity is asynchronous, optional `row-mappers.ts:30-30`
- **is_exported** — Indicates if the entity is exported, optional `row-mappers.ts:31-31`
- **is_test** — Indicates if the entity is a test, optional `row-mappers.ts:32-32`
- **item** — Stores an array of items with their associated errors `entity-ops.ts:219-219`
- **item** — Represents an error item with an unknown item and an error message `relationship-ops.ts:112-112`
- **language** — Language of the entity, optional `row-mappers.ts:25-25`
- **lastFullIndexAt** — Represents the last full index time for a project `metadata-ops.ts:250-250`
- **lastGcRunAt** — Tracks the last time garbage collection was run `versioning-ops.ts:29-29`
- **lastIndexedAt** — Stores the last indexed timestamp for a file `metadata-ops.ts:348-348`
- **lightweight** — Indicates whether the entity is lightweight `entity-ops.ts:622-622`
- **limit** — Limits the number of entities returned `entity-ops.ts:620-620`
- **limit** — Represents an optional number for limiting results `entity-ops.ts:809-809`
- **limit** — Represents the limit for the number of relationships to return `relationship-ops.ts:335-335`
- **line** — Represents a line number in a start object `entity-ops.ts:28-28`
- **line** — Represents a line number in an end object `entity-ops.ts:29-29`
- **location** — Location of the entity `row-mappers.ts:24-24`
- **maxNeighbors** — DiskANN max neighbors `types.ts:30-30`
- **maxSize** — Returns the maximum size of the metadata cache `cbor-utils.ts:146-146`
- **metadata** — Stores metadata for an entity or relationship, which can be a CBOR BLOB or legacy JSON TEXT `row-mappers.ts:47-47`
- **metadata** — Metadata of the entity, optional `row-mappers.ts:26-26`
- **metric** — Distance metric for vector search `types.ts:22-22`
- **model** — Represents the model associated with an embedding in the `cache-ops.ts:112-112`
- **name** — Represents the name of an entity `entity-ops.ts:510-510`
- **name** — Represents a name as a string or a regular expression `entity-ops.ts:617-617`
- **name** — Name of the entity `row-mappers.ts:21-21`
- **namePattern** — Represents a pattern for entity names `entity-ops.ts:755-755`
- **namePattern** — Represents a name pattern as a string `entity-ops.ts:806-806`
- **offset** — Specifies the starting point for the entities to be returned `entity-ops.ts:621-621`
- **offset** — Represents the offset for the number of relationships to skip `relationship-ops.ts:336-336`
- **projectHash** — Represents the hash of the project `entity-ops.ts:514-514`
- **projectHash** — Represents a project hash as a string `entity-ops.ts:760-760`
- **projectHash** — Stores the hash of the project `metadata-ops.ts:345-345`
- **projectHash** — Project hash `types.ts:77-77`
- **projectPath** — Represents the path of the project `metadata-ops.ts:347-347`
- **prollyNodeStore** — Prolly Tree component for versioned graph storage `versioning-ops.ts:25-25`
- **prollyTree** — Prolly Tree component for versioned graph storage `versioning-ops.ts:26-26`
- **pruned** — Returns a promise that resolves to an object containing the number of pruned commits and garbage collected nodes `versioning-ops.ts:163-163`
- **relationshipType** — Represents the type of relationship `relationship-ops.ts:330-330`
- **score** — The score associated with a related term `cooccurrence-ops.ts:20-20`
- **searchCache** — LRU cache for search results `vector-ops.ts:40-40`
- **searchL** — DiskANN search list size `types.ts:26-26`
- **SEMANTIC_DROPPABLE_INDEXES** — Represents droppable indexes for semantic tables `schema-manager.ts:511-517`
- **size** — Returns the current size of the metadata cache `cbor-utils.ts:146-146`
- **size** — Size of the entity, optional `row-mappers.ts:29-29`
- **sql** — Stores an array of SQL statements with their arguments. `entity-ops.ts:266 `entity-ops.ts:266-266`
- **sql** — Stores SQL statements and their corresponding arguments in an array `relationship-ops.ts:139-139`
- **start** — Represents the start position with `entity-ops.ts:28-28`
- **stringToVector** — Converts a string to a vector `vector-ops.ts:36-36`
- **term** — A term in the co-occurrence context `cooccurrence-ops.ts:19-19`
- **term** — Updates term frequencies in the database based on provided entries `cooccurrence-ops.ts:106-106`
- **textPreview** — Represents a text preview for an entry in the cache `cache-ops.ts:112-112`
- **to_id** — ID of the entity to which the relationship points `row-mappers.ts:45-45`
- **toId** — Represents the to_id of a relationship `relationship-ops.ts:332-332`
- **tokens** — Represents the number of tokens deleted during full garbage collection `generation-ops.ts:242-242`
- **tombstoneAdder** — Represents a potential instance of a TombstoneAdder object `entity-ops.ts:107-107`
- **tombstoneAdder** — Property to store the tombstone adder delegate `relationship-ops.ts:39-39`
- **tombstoneGetter** — Represents a getter for tombstone entities `entity-ops.ts:108-108`
- **tombstoneGetter** — Property to store the tombstone getter delegate `relationship-ops.ts:40-40`
- **totalEmbeddings** — Returns the total number of embeddings in a project `metadata-ops.ts:404-404`
- **totalEmbeddings** — Represents the count of embeddings in the metadata `metadata-ops.ts:450-450`
- **totalEntities** — Returns the total number of entities in a project `metadata-ops.ts:401-401`
- **totalEntities** — Represents the count of entities in the metadata `metadata-ops.ts:447-447`
- **totalFiles** — Returns the total number of files in a project `metadata-ops.ts:403-403`
- **totalFiles** — Represents the total number of files `metadata-ops.ts:252-252`, `metadata-ops.ts:449-449`
- **totalPairs** — Total number of co-occurrence pairs `cooccurrence-ops.ts:25-25`
- **totalRelationships** — Returns the total number of relationships in a project `metadata-ops.ts:402-402`
- **totalRelationships** — Represents the count of relationships in the metadata `metadata-ops.ts:448-448`
- **totalTerms** — Total number of terms involved in co-occurrence `cooccurrence-ops.ts:26-26`
- **type** — Represents the type of an entity or relationship `row-mappers.ts:46-46`
- **type** — Type of the entity `row-mappers.ts:22-22`
- **types** — Represents the types of entities `entity-ops.ts:756-756`
- **types** — Represents types as an array of entity types `entity-ops.ts:807-807`
- **updated_at** — Timestamp when the entity was last updated `row-mappers.ts:36-36`
- **vectorToString** — Converts a vector to a string `vector-ops.ts:35-35`
- **weight** — Represents the weight of a relationship `row-mappers.ts:48-48`

### embedded_sql
- **ALTER TABLE entities ADD COLUMN file_gen INTEGER NOT NULL DEFAULT 1** — Adds a column to entities for file generation `schema-manager.ts:317-317`
- **CREATE INDEX IF NOT EXISTS ${indexName} ON embeddings(libsql_vector_idx(${colName}, ${indexParams}))** — Creates an index if it doesn't exist `vector-ops.ts:218-222`
- **CREATE INDEX IF NOT EXISTS idx_cooc_term1 ON cooccurrence(term1, project_hash, branch_name)** — Creates an index on the cooccurrence table for efficient lookup by term1, project_hash, and branch_name `schema-manager.ts:212-212`
- **CREATE INDEX IF NOT EXISTS idx_cooc_term1 ON cooccurrence(term1, project_hash, branch_name)** — Creates an index on the `term1`, `project_hash`, and `branch_name` columns of the `cooccurrence` table `schema-manager.ts:553-553`
- **CREATE INDEX IF NOT EXISTS idx_cooc_term2 ON cooccurrence(term2, project_hash, branch_name)** — Creates an index on the cooccurrence table for efficient lookup by term2, project_hash, and branch_name `schema-manager.ts:213-213`
- **CREATE INDEX IF NOT EXISTS idx_cooc_term2 ON cooccurrence(term2, project_hash, branch_name)** — Creates an index on the `term2`, `project_hash`, and `branch_name` columns of the `cooccurrence` table `schema-manager.ts:554-554`
- **CREATE INDEX IF NOT EXISTS idx_entities_file ON entities(file_path, project_hash, branch_name)** — Creates an index on the entities table for efficient querying by file path, project hash, and branch name `schema-manager.ts:156-156`
- **CREATE INDEX IF NOT EXISTS idx_entities_file ON entities(file_path, project_hash, branch_name)** — Creates an index on the entities table if it does not already exist `schema-manager.ts:531-531`
- **CREATE INDEX IF NOT EXISTS idx_entities_file ON entities(file_path, project_hash, branch_name)** — Creates an index on the entities table for file_path, project_hash, and branch_name `versioning-ops.ts:412-412`
- **CREATE INDEX IF NOT EXISTS idx_entities_gen ON entities(file_gen, file_path, project_hash, branch_na** — Creates an index on the entities table for efficient querying by file generation, file path, project hash, and branch name `schema-manager.ts:159-159`
- **CREATE INDEX IF NOT EXISTS idx_entities_gen ON entities(file_gen, file_path, project_hash, branch_na** — Creates an index on the entities table if it does not already exist `schema-manager.ts:534-534`
- **CREATE INDEX IF NOT EXISTS idx_entities_gen ON entities(file_gen, file_path, project_hash, branch_na** — Creates an index on the entities table for efficient querying `versioning-ops.ts:415-415`
- **CREATE INDEX IF NOT EXISTS idx_entities_name ON entities(name, project_hash, branch_name)** — Creates an index on the entities table for efficient querying by name, project hash, and branch name `schema-manager.ts:157-157`
- **CREATE INDEX IF NOT EXISTS idx_entities_name ON entities(name, project_hash, branch_name)** — Creates an index on the entities table if it does not already exist `schema-manager.ts:532-532`
- **CREATE INDEX IF NOT EXISTS idx_entities_name ON entities(name, project_hash, branch_name)** — Creates an index on the entities table for name, project_hash, and branch_name `versioning-ops.ts:413-413`
- **CREATE INDEX IF NOT EXISTS idx_entities_type ON entities(type, project_hash, branch_name)** — Creates an index on the entities table for efficient querying by type, project hash, and branch name `schema-manager.ts:158-158`
- **CREATE INDEX IF NOT EXISTS idx_entities_type ON entities(type, project_hash, branch_name)** — Creates an index on the entities table if it does not already exist `schema-manager.ts:533-533`
- **CREATE INDEX IF NOT EXISTS idx_entities_type ON entities(type, project_hash, branch_name)** — Creates an index on the entities table for type, project_hash, and branch_name `versioning-ops.ts:414-414`
- **CREATE INDEX IF NOT EXISTS idx_files_project_branch ON files(project_hash, branch_name)** — Creates an index on the files table for efficient querying by project hash and branch name `schema-manager.ts:164-164`
- **CREATE INDEX IF NOT EXISTS idx_files_project_branch ON files(project_hash, branch_name)** — Creates an index on the files table for project_hash and branch_name `versioning-ops.ts:420-420`
- **CREATE INDEX IF NOT EXISTS idx_hyp_conf ON hypotheses(project_hash, branch_name, confidence DESC)** — Creates an index on hypotheses for confidence descending `schema-manager.ts:288-288`
- **CREATE INDEX IF NOT EXISTS idx_hyp_source ON hypotheses(project_hash, branch_name, from_id)** — Creates an index on hypotheses for source metadata `schema-manager.ts:286-286`
- **CREATE INDEX IF NOT EXISTS idx_hyp_target ON hypotheses(project_hash, branch_name, to_id)** — Creates an index on hypotheses for target metadata `schema-manager.ts:287-287`
- **CREATE INDEX IF NOT EXISTS idx_rels_file ON relationships(file_path, project_hash, branch_name)** — Creates an index on the relationships table for efficient querying by file path, project hash, and branch name `schema-manager.ts:163-163`
- **CREATE INDEX IF NOT EXISTS idx_rels_file ON relationships(file_path, project_hash, branch_name)** — Creates an index on the `file_path`, `project_hash`, and `branch_name` columns of the `relationships` table `schema-manager.ts:538-538`
- **CREATE INDEX IF NOT EXISTS idx_rels_file ON relationships(file_path, project_hash, branch_name)** — Creates an index on the relationships table for efficient querying. `versioning-ops.ts:419 `versioning-ops.ts:419-419`
- **CREATE INDEX IF NOT EXISTS idx_rels_from ON relationships(from_id, project_hash, branch_name)** — Creates an index on the relationships table for efficient querying by from ID, project hash, and branch name `schema-manager.ts:161-161`
- **CREATE INDEX IF NOT EXISTS idx_rels_from ON relationships(from_id, project_hash, branch_name)** — Creates an index on the relationships table if it does not already exist `schema-manager.ts:536-536`
- **CREATE INDEX IF NOT EXISTS idx_rels_from ON relationships(from_id, project_hash, branch_name)** — Creates an index on the relationships table for efficient querying `versioning-ops.ts:417-417`
- **CREATE INDEX IF NOT EXISTS idx_rels_to ON relationships(to_id, project_hash, branch_name)** — Creates an index on the relationships table for efficient querying by to ID, project hash, and branch name `schema-manager.ts:162-162`
- **CREATE INDEX IF NOT EXISTS idx_rels_to ON relationships(to_id, project_hash, branch_name)** — Creates an index on the `to_id`, `project_hash`, and `branch_name` columns of the `relationships` table `schema-manager.ts:537-537`
- **CREATE INDEX IF NOT EXISTS idx_rels_to ON relationships(to_id, project_hash, branch_name)** — Creates an index on the relationships table for efficient querying `versioning-ops.ts:418-418`
- **CREATE INDEX IF NOT EXISTS idx_tf_term ON term_frequency(term, project_hash, branch_name)** — Creates an index on the term_frequency table for efficient lookup by term, project_hash, and branch_name `schema-manager.ts:215-215`
- **CREATE INDEX IF NOT EXISTS idx_tf_term ON term_frequency(term, project_hash, branch_name)** — Creates an index on the `term`, `project_hash`, and `branch_name` columns of the `term_frequency` table `schema-manager.ts:556-556`
- **CREATE INDEX IF NOT EXISTS idx_tokens_entity ON name_tokens(entity_id, project_hash, branch_name)** — Creates an index on the name_tokens table for efficient lookup by entity_id, project_hash, and branch_name `schema-manager.ts:167-167`
- **CREATE INDEX IF NOT EXISTS idx_tokens_entity ON name_tokens(entity_id, project_hash, branch_name)** — Creates an index on the `entity_id`, `project_hash`, and `branch_name` columns of the `name_tokens` table `schema-manager.ts:540-540`
- **CREATE INDEX IF NOT EXISTS idx_tokens_entity ON name_tokens(entity_id, project_hash, branch_name)** — Creates an index on the name_tokens table for entity_id, project_hash, and branch_name `versioning-ops.ts:423-423`
- **CREATE INDEX IF NOT EXISTS idx_tokens_lookup ON name_tokens(token, project_hash, branch_name, source** — Creates an index on the name_tokens table for efficient lookup by token, project_hash, branch_name, and source `schema-manager.ts:168-168`
- **CREATE INDEX IF NOT EXISTS idx_tokens_lookup ON name_tokens(token, project_hash, branch_name, source** — Creates an index on the `token`, `project_hash`, `branch_name`, and `source` columns of the `name_tokens` table `schema-manager.ts:541-541`
- **CREATE INDEX IF NOT EXISTS idx_tokens_lookup ON name_tokens(token, project_hash, branch_name, source** — Creates an index if it does not exist on the name_tokens table `versioning-ops.ts:424-424`
- **CREATE INDEX IF NOT EXISTS idx_tombstones_lookup ON tombstones(project_hash, branch_name, entity_typ** — Creates an index on the tombstones table for efficient lookup by project_hash, branch_name, and entity_type `schema-manager.ts:165-165`
- **CREATE INDEX IF NOT EXISTS idx_tombstones_lookup ON tombstones(project_hash, branch_name, entity_typ** — Creates an index on the tombstones table for project_hash, branch_name, and entity_type `versioning-ops.ts:421-421`
- **CREATE TABLE IF NOT EXISTS _staging_entities ( id TEXT NOT NULL, project_hash TEXT NOT NULL, branch_** — Creates a table for staging entities with various attributes `versioning-ops.ts:236-244`
- **CREATE TABLE IF NOT EXISTS _staging_files ( path TEXT NOT NULL, project_hash TEXT NOT NULL, branch_n** — Creates a table for staging files with attributes like path and project_hash `versioning-ops.ts:256-260`
- **CREATE TABLE IF NOT EXISTS _staging_name_tokens ( token TEXT NOT NULL, entity_id TEXT NOT NULL, proj** — Creates a table for staging name tokens with attributes like token and entity_id `versioning-ops.ts:251-255`
- **CREATE TABLE IF NOT EXISTS _staging_relationships ( id TEXT NOT NULL, project_hash TEXT NOT NULL, br** — Creates a table for staging relationships with attributes like from_id and to_id `versioning-ops.ts:245-250`
- **CREATE TABLE IF NOT EXISTS cooccurrence ( term1 TEXT NOT NULL, term2 TEXT NOT NULL, project_hash TEX** — Creates a cooccurrence table with columns for term1, term2, project_hash, branch_name, and count `schema-manager.ts:197-203`
- **CREATE TABLE IF NOT EXISTS embedding_cache ( key TEXT NOT NULL PRIMARY KEY, embedding BLOB, model TE** — Creates a table to cache embeddings with metadata `schema-manager.ts:238-244`
- **CREATE TABLE IF NOT EXISTS entities ( id TEXT NOT NULL, project_hash TEXT NOT NULL, branch_name TEXT** — Defines a table to store entity metadata, including project hash, branch name, and other attributes `schema-manager.ts:74-94`
- **CREATE TABLE IF NOT EXISTS file_generations ( file_path TEXT NOT NULL, project_hash TEXT NOT NULL, b** — Defines a table to track file generations, including file path, project hash, branch name, and the active generation number `schema-manager.ts:139-145`
- **CREATE TABLE IF NOT EXISTS files ( path TEXT NOT NULL, project_hash TEXT NOT NULL, branch_name TEXT N** — Defines a table to store file metadata, including path, project hash, branch name, and file properties `schema-manager.ts:109-119`
- **CREATE TABLE IF NOT EXISTS git_churn_cache ( file_path TEXT NOT NULL, project_hash TEXT NOT NULL, co** — Creates a table to cache git churn data `schema-manager.ts:265-271`
- **CREATE TABLE IF NOT EXISTS hypotheses ( id TEXT NOT NULL PRIMARY KEY, project_hash TEXT NOT NULL, br** — Creates a table to store hypotheses with metadata `schema-manager.ts:273-285`
- **CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT)** — Creates a table to store metadata key-value pairs `schema-manager.ts:216-216`
- **CREATE TABLE IF NOT EXISTS metric_results ( id INTEGER PRIMARY KEY AUTOINCREMENT, metric_type TEXT N** — Creates a table to store metric results for entities `schema-manager.ts:258-264`
- **CREATE TABLE IF NOT EXISTS name_tokens ( token TEXT NOT NULL, entity_id TEXT NOT NULL, project_hash T** — Creates a table to store name tokens, including token, entity ID, project hash, branch name, and source `schema-manager.ts:147-153`
- **CREATE TABLE IF NOT EXISTS performance_metrics ( id INTEGER PRIMARY KEY AUTOINCREMENT, tool_name TEX** — Creates a table to store performance metrics for tools `schema-manager.ts:251-257`
- **CREATE TABLE IF NOT EXISTS project_metadata ( project_hash TEXT NOT NULL, branch_name TEXT NOT NULL,** — Defines a table to store metadata for projects, including project hash, branch name, and counts of entities, files, and relationships `schema-manager.ts:120-130`
- **CREATE TABLE IF NOT EXISTS query_cache ( query_hash TEXT NOT NULL PRIMARY KEY, result TEXT, created_** — Creates a table to cache query results with timestamps `schema-manager.ts:245-250`
- **CREATE TABLE IF NOT EXISTS relationships ( id TEXT NOT NULL, project_hash TEXT NOT NULL, branch_name** — Defines a table to store relationships between entities, including project hash, branch name, and relationship details `schema-manager.ts:96-108`
- **CREATE TABLE IF NOT EXISTS term_frequency ( term TEXT NOT NULL, entity_id TEXT NOT NULL, project_has** — Creates a term_frequency table with columns for term, entity_id, project_hash, branch_name, and frequency `schema-manager.ts:204-210`
- **CREATE TABLE IF NOT EXISTS tombstones ( entity_id TEXT NOT NULL, project_hash TEXT NOT NULL, branch_** — Creates a table to store tombstones for entities, including entity ID, project hash, branch name, entity type, and creation time `schema-manager.ts:131-138`
- **DELETE FROM _staging_entities** — Deletes all records from the _staging_entities table `versioning-ops.ts:262-262`
- **DELETE FROM _staging_files** — Deletes records from the _staging_files table `versioning-ops.ts:265-265`
- **DELETE FROM _staging_name_tokens** — Deletes records from the _staging_name_tokens table `versioning-ops.ts:264-264`
- **DELETE FROM _staging_relationships** — Deletes all records from the _staging_relationships table `versioning-ops.ts:263-263`
- **DELETE FROM cooccurrence** — Executes a SQL DELETE statement to remove all records from the cooccurrence table `metadata-ops.ts:602-602`
- **DELETE FROM cooccurrence WHERE project_hash = ? AND branch_name = ?** — Deletes records from cooccurrence based on project_hash and branch_name `cooccurrence-ops.ts:320-320`
- **DELETE FROM cooccurrence WHERE project_hash = ? AND branch_name = ?** — Executes a DELETE operation on the cooccurrence table based on project_hash and branch_name `metadata-ops.ts:542-542`
- **DELETE FROM cooccurrence WHERE project_hash = ? AND branch_name = ? AND count < ?** — Deletes records from cooccurrence where count is less than a specified value `cooccurrence-ops.ts:349-352`
- **DELETE FROM embedding_cache** — Deletes all entries from the embedding cache `cache-ops.ts:145-145`
- **DELETE FROM embeddings WHERE id = ? AND project_hash = ? AND branch_name = ?** — Deletes a record from the embeddings table based on specific conditions `vector-ops.ts:457-457`
- **DELETE FROM entities** — Deletes all entities `metadata-ops.ts:580-580`
- **DELETE FROM entities WHERE (project_hash, branch_name) IN (SELECT DISTINCT project_hash, branch_name** — Deletes entities where the project_hash and branch_name match those in the _staging_entities table `versioning-ops.ts:288-289`
- **DELETE FROM entities WHERE id = ? AND project_hash = ? AND branch_name = ?** — Deletes entities with specific id, project hash, and branch name `entity-ops.ts:977-977`
- **DELETE FROM entities WHERE id IN (${placeholders}) AND project_hash = ? AND branch_name = ?** — Deletes entities with ids in a list, project hash, and branch name `entity-ops.ts:1016-1016`
- **DELETE FROM entities WHERE project_hash = ? AND branch_name = ?** — Deletes entities where project_hash and branch_name match given values `metadata-ops.ts:513-513`
- **DELETE FROM entities WHERE rowid IN ( SELECT e.rowid FROM entities e JOIN file_generations fg ON e.f** — Deletes entities where their file generation is not the active generation in file_generations `generation-ops.ts:162-171`
- **DELETE FROM file_generations WHERE project_hash = ? AND branch_name = ? AND active_gen = -1 AND file** — Deletes file generations where the active generation is -1 and the file path is not in the list of entities `generation-ops.ts:180-189`
- **DELETE FROM files** — Deletes all files `metadata-ops.ts:581-581`
- **DELETE FROM files WHERE (project_hash, branch_name) IN (SELECT DISTINCT project_hash, branch_name FR** — Deletes files where the project_hash and branch_name match those in the _staging_files table `versioning-ops.ts:294-295`
- **DELETE FROM files WHERE project_hash = ? AND branch_name = ?** — Deletes files where project_hash and branch_name match given values `metadata-ops.ts:514-514`
- **DELETE FROM files WHERE project_hash = ? AND branch_name = ? AND (path = ? OR path = ?)** — Deletes files matching the given project hash, branch name, and paths `metadata-ops.ts:174-178`
- **DELETE FROM name_tokens** — Executes a SQL DELETE statement to remove all records from the name_tokens table `metadata-ops.ts:583-583`
- **DELETE FROM name_tokens WHERE (project_hash, branch_name) IN (SELECT DISTINCT project_hash, branch_n** — Deletes name tokens where the project_hash and branch_name match those in the _staging_name_tokens table `versioning-ops.ts:292-293`
- **DELETE FROM name_tokens WHERE entity_id = ? AND project_hash = ? AND branch_name = ?** — Executes a SQL query to delete name tokens based on entity ID, project hash, and branch name `entity-ops.ts:193-193`
- **DELETE FROM name_tokens WHERE entity_id = ? AND project_hash = ? AND branch_name = ?** — Deletes name tokens associated with specific entity id, project hash, and branch name `entity-ops.ts:983-983`
- **DELETE FROM name_tokens WHERE entity_id IN (${placeholders}) AND project_hash = ? AND branch_name = ?** — Deletes name tokens based on entity IDs, project hash, and branch name `entity-ops.ts:332-332`
- **DELETE FROM name_tokens WHERE entity_id IN (${placeholders}) AND project_hash = ? AND branch_name = ?** — Deletes name tokens with entity ids in a list, project hash, and branch name `entity-ops.ts:1022-1022`
- **DELETE FROM name_tokens WHERE project_hash = ? AND branch_name = ?** — Deletes name_tokens where project_hash and branch_name match given values `metadata-ops.ts:520-520`
- **DELETE FROM name_tokens WHERE rowid IN ( SELECT nt.rowid FROM name_tokens nt LEFT JOIN entities e ON** — Deletes name_tokens where the entity is not found or the file generation is not active `generation-ops.ts:214-227`
- **DELETE FROM project_metadata** — Executes a SQL DELETE statement to remove all records from the project_metadata table `metadata-ops.ts:582-582`
- **DELETE FROM project_metadata WHERE project_hash = ? AND branch_name = ?** — Deletes project_metadata where project_hash and branch_name match given values `metadata-ops.ts:516-516`
- **DELETE FROM query_cache** — Executes a SQL DELETE statement to remove all records from the query_cache table `metadata-ops.ts:592-592`
- **DELETE FROM query_cache WHERE project_hash = ? AND branch_name = ?** — Deletes query_cache where project_hash and branch_name match given values `metadata-ops.ts:531-531`
- **DELETE FROM relationships** — Deletes all relationships `metadata-ops.ts:579-579`
- **DELETE FROM relationships WHERE (project_hash, branch_name) IN (SELECT DISTINCT project_hash, branch** — Deletes relationships where the project_hash and branch_name match those in the _staging_relationships table `versioning-ops.ts:290-291`
- **DELETE FROM relationships WHERE id = ? AND project_hash = ? AND branch_name = ?** — Deletes a relationship from the database based on specific criteria `relationship-ops.ts:467-467`
- **DELETE FROM relationships WHERE project_hash = ? AND branch_name = ?** — Deletes relationships where project_hash and branch_name match given values `metadata-ops.ts:510-510`
- **DELETE FROM term_frequency** — Executes a SQL DELETE statement to remove all records from the term_frequency table `metadata-ops.ts:603-603`
- **DELETE FROM term_frequency WHERE project_hash = ? AND branch_name = ?** — Deletes records from term_frequency based on project_hash and branch_name `cooccurrence-ops.ts:324-324`
- **DELETE FROM term_frequency WHERE project_hash = ? AND branch_name = ?** — Deletes term_frequency where project_hash and branch_name match given values `metadata-ops.ts:546-546`
- **DROP INDEX IF EXISTS ${idx}** — Drops an index if it exists in the database `schema-manager.ts:521-521`
- **DROP INDEX IF EXISTS ${name}** — Drops an index if it exists `versioning-ops.ts:430-430`
- **DROP INDEX IF EXISTS ${partialIndexName}** — Drops an index if it exists `vector-ops.ts:179-179`
- **DROP TABLE IF EXISTS _staging_entities** — Drops the _staging_entities table if it exists `schema-manager.ts:170-170`, `versioning-ops.ts:376-376`
- **DROP TABLE IF EXISTS _staging_entities** — Executes a SQL command to drop the _staging_entities table if it exists `versioning-ops.ts:355-355`
- **DROP TABLE IF EXISTS _staging_files** — Drops the _staging_files table if it exists `schema-manager.ts:173-173`
- **DROP TABLE IF EXISTS _staging_files** — Drops the _staging_files table if it exists. `versioning-ops.ts:358 `versioning-ops.ts:358-358`
- **DROP TABLE IF EXISTS _staging_files** — Executes a SQL command to drop the _staging_files table if it exists `versioning-ops.ts:379-379`
- **DROP TABLE IF EXISTS _staging_name_tokens** — Drops the _staging_name_tokens table if it exists `schema-manager.ts:172-172`, `versioning-ops.ts:378-378`
- **DROP TABLE IF EXISTS _staging_name_tokens** — Executes a SQL command to drop the _staging_name_tokens table if it exists `versioning-ops.ts:357-357`
- **DROP TABLE IF EXISTS _staging_relationships** — Drops the _staging_relationships table if it exists `schema-manager.ts:171-171`, `versioning-ops.ts:377-377`
- **DROP TABLE IF EXISTS _staging_relationships** — Executes a SQL command to drop the _staging_relationships table if it exists `versioning-ops.ts:356-356`
- **INSERT INTO cooccurrence (term1, term2, project_hash, branch_name, count) VALUES ${values.join(", ")** — Inserts co-occurrence records into the database `cooccurrence-ops.ts:88-93`
- **INSERT INTO entities (id, project_hash, branch_name, name, type, file_path, location, language, meta** — Inserts entities into the entities table, aggregating data from the _staging_entities table `versioning-ops.ts:310-317`
- **INSERT INTO entities SELECT * FROM _staging_entities** — Inserts entities from the staging table into the main entities table `versioning-ops.ts:338-338`
- **INSERT INTO name_tokens (token, entity_id, project_hash, branch_name, source) SELECT token, entity_i** — Inserts name tokens into the name_tokens table, aggregating data from the _staging_name_tokens table `versioning-ops.ts:324-327`
- **INSERT INTO name_tokens SELECT * FROM _staging_name_tokens** — Inserts data from _staging_name_tokens into name_tokens `versioning-ops.ts:340-340`
- **INSERT INTO relationships (id, project_hash, branch_name, from_id, to_id, type, file_path, weight, m** — Inserts relationships into the relationships table, aggregating data from the _staging_relationships table `versioning-ops.ts:318-323`
- **INSERT INTO relationships SELECT * FROM _staging_relationships** — Inserts relationships from the staging table into the main relationships table `versioning-ops.ts:339-339`
- **INSERT INTO term_frequency (term, entity_id, project_hash, branch_name, frequency) VALUES ${values.j** — Inserts term frequency records into the database `cooccurrence-ops.ts:129-134`
- **SELECT ${selectCols} FROM entities e JOIN file_generations fg ON e.file_path = fg.file_path AND e.pr** — Builds a SQL query to select specific columns from entities joined with file_generations based on project hash, branch name, and file generation `entity-ops.ts:654-657`
- **SELECT ${selectCols} FROM entities e JOIN file_generations fg ON e.file_path = fg.file_path AND e.pr** — Constructs a SQL query to select specific columns from entities joined with file generations based on file path, project hash, and branch name `entity-ops.ts:693-696`
- **SELECT ${selectCols} FROM entities e JOIN file_generations fg ON e.file_path = fg.file_path AND e.pr** — Constructs a SQL query to select specific columns from entities joined with file generations `entity-ops.ts:719-722`
- **SELECT (SELECT COUNT(*) FROM _staging_entities) - (SELECT COUNT(DISTINCT id || '|' || project_hash |** — Calculates the number of duplicate entities in the _staging_entities table `versioning-ops.ts:302-302`
- **SELECT * FROM files WHERE path = ? AND project_hash = ? AND branch_name = ?** — Selects all files matching the given path, project hash, and branch name `metadata-ops.ts:93-93`
- **SELECT * FROM files WHERE project_hash = ? AND branch_name = ? AND last_indexed < ?** — Parses a SQL query to select files based on project hash, branch name, and last indexed timestamp `metadata-ops.ts:117-120`
- **SELECT * FROM relationships WHERE project_hash = ? AND branch_name = ?** — Constructs an SQL query to select relationships based on project hash and branch name `relationship-ops.ts:352-352`
- **SELECT * FROM relationships WHERE project_hash = ? AND branch_name = ? AND (from_id = ? OR to_id = ?** — Constructs an SQL query to select relationships based on project hash, branch name, and either from_id or to_id `relationship-ops.ts:208-211`
- **SELECT * FROM relationships WHERE project_hash = ? AND branch_name = ? AND (from_id = ? OR to_id = ?** — Builds a SQL query to select relationships based on project hash, branch name, and either from_id or to_id `relationship-ops.ts:227-230`
- **SELECT * FROM relationships WHERE project_hash = ? AND branch_name = ? AND (from_id = ? OR to_id = ?** — Constructs a SQL query to select relationships based on project hash, branch name, and either from_id or to_id `relationship-ops.ts:243-246`
- **SELECT * FROM relationships WHERE project_hash = ? AND branch_name = ? LIMIT ? OFFSET ?** — Retrieves a limited number of relationships from the database based on project hash and branch name `relationship-ops.ts:493-493`
- **SELECT 1 FROM entities WHERE project_hash != ? LIMIT 1** — Selects one row from entities where project_hash is not equal to a given value `metadata-ops.ts:487-487`
- **SELECT AVG(count) as avg FROM cooccurrence WHERE project_hash = ? AND branch_name = ?** — Parses a SQL query to calculate the average count in cooccurrence `cooccurrence-ops.ts:295-295`
- **SELECT COUNT(*) as cnt FROM cooccurrence WHERE project_hash = ? AND branch_name = ?** — Returns the count of cooccurrences for a given project hash and branch name `cooccurrence-ops.ts:287-287`
- **SELECT COUNT(*) as cnt FROM embeddings WHERE project_hash = ? AND branch_name = ?** — Counts the number of records in the embeddings table based on specific conditions `vector-ops.ts:476-476`
- **SELECT COUNT(*) as cnt FROM embeddings WHERE project_hash = ? AND branch_name = ? AND dim_size = ?** — Counts embeddings matching specific criteria. `vector-ops.ts:317-31 `vector-ops.ts:317-317`
- **SELECT COUNT(*) as cnt FROM entities** — Executes a SQL query to count entities `metadata-ops.ts:456-456`
- **SELECT COUNT(*) as cnt FROM entities e JOIN file_generations fg ON e.file_path = fg.file_path AND e.** — Builds a SQL query to count entities joined with file generations based on project hash, branch name, and file generation, with a branch filter `metadata-ops.ts:418-421`
- **SELECT COUNT(*) as cnt FROM files** — Executes a query to count the number of files `metadata-ops.ts:458-458`
- **SELECT COUNT(*) as cnt FROM files WHERE project_hash = ? AND ${branchFilter}** — Builds a SQL query to count files based on project hash and a branch filter `metadata-ops.ts:430-430`
- **SELECT COUNT(*) as cnt FROM relationships** — Executes a SQL query to count relationships `metadata-ops.ts:457-457`
- **SELECT COUNT(*) as cnt FROM relationships WHERE project_hash = ? AND ${branchFilter}** — Executes a SQL query to count the number of relationships matching the given project hash and branch filter `metadata-ops.ts:426-426`
- **SELECT COUNT(*) as cnt FROM term_frequency WHERE project_hash = ? AND branch_name = ?** — Parses a SQL query to count occurrences in term_frequency `cooccurrence-ops.ts:291-291`
- **SELECT COUNT(*) as count FROM entities e JOIN file_generations fg ON e.file_path = fg.file_path AND e** — Builds a SQL query to count entities joined with file generations based on project hash, branch name, and file generation `metadata-ops.ts:201-204`
- **SELECT COUNT(*) as count FROM files WHERE project_hash = ? AND branch_name = ?** — Builds a SQL query to count files based on project hash and branch name `metadata-ops.ts:208-208`
- **SELECT COUNT(*) as count FROM relationships WHERE project_hash = ? AND branch_name = ?** — Builds a SQL query to count relationships based on project hash and branch name `metadata-ops.ts:212-212`
- **SELECT COUNT(*) FROM "${tableName}** — Counts the number of rows in the specified table `schema-manager.ts:386-386`
- **SELECT created_at FROM project_metadata WHERE project_hash = ? AND branch_name = ?** — Builds a SQL query to select the created_at timestamp from project metadata based on project hash and branch name `metadata-ops.ts:218-218`
- **SELECT DISTINCT branch_name FROM project_metadata WHERE project_hash = ? ORDER BY branch_name** — Builds a SQL query to select distinct branch names from project metadata based on project hash, ordered by branch name `metadata-ops.ts:381-385`
- **SELECT e.* FROM entities e JOIN file_generations fg ON e.file_path = fg.file_path AND e.project_hash** — Selects entity details joined with file generations based on file path, project hash, and branch name. `entity-ops.ts:397-4 `entity-ops.ts:397-401`
- **SELECT e.* FROM entities e JOIN file_generations fg ON e.file_path = fg.file_path AND e.project_hash** — Executes a SQL query to select entities joined with file generations based on file path, project hash, and branch name `entity-ops.ts:412-416`
- **SELECT e.* FROM entities e JOIN file_generations fg ON e.file_path = fg.file_path AND e.project_hash** — Selects all entity details based on file path, project hash, and `entity-ops.ts:462-466`
- **SELECT e.* FROM entities e JOIN file_generations fg ON e.file_path = fg.file_path AND e.project_hash** — Constructs a SQL query to select entities joined with file generations `entity-ops.ts:481-485`
- **SELECT e.* FROM entities e JOIN file_generations fg ON e.file_path = fg.file_path AND e.project_hash** — Builds a SQL query to select entities joined with file generations based on project hash and branch name `entity-ops.ts:825-828`
- **SELECT e.* FROM entities e JOIN file_generations fg ON e.file_path = fg.file_path AND e.project_hash** — Constructs a SQL query to select entities joined with file generations, filtering by file path `entity-ops.ts:845-848`
- **SELECT e.* FROM entities e JOIN file_generations fg ON e.file_path = fg.file_path AND e.project_hash** — Constructs a SQL query to select entities joined with file generations, filtering by project hash and branch name `entity-ops.ts:870-873`
- **SELECT e.* FROM entities e JOIN file_generations fg ON e.file_path = fg.file_path AND e.project_hash** — Constructs a SQL query to select entities joined with file generations based on specific conditions `entity-ops.ts:917-923`, `entity-ops.ts:1128-1131`
- **SELECT e.id FROM entities e JOIN file_generations fg ON e.file_path = fg.file_path AND e.project_has** — Selects entity IDs based on file path, project hash, and branch name conditions `entity-ops.ts:1045-1052`
- **SELECT e.id FROM entities e JOIN file_generations fg ON e.file_path = fg.file_path AND e.project_has** — Builds a SQL query to select entity ids joined with file generations based on project hash and branch name `entity-ops.ts:1064-1071`
- **SELECT e.id FROM entities e JOIN file_generations fg ON e.file_path = fg.file_path AND e.project_has** — Constructs a SQL query to select entity IDs joined with file generations, filtering by file path `entity-ops.ts:1078-1085`
- **SELECT e.id, e.language, e.file_path FROM entities e JOIN file_generations fg ON e.file_path = fg.fi** — Builds a SQL query to select entity ids, languages, and file paths joined with file generations based on project hash and branch name `entity-ops.ts:1212-1216`
- **SELECT e.id, e.language, e.file_path FROM entities e JOIN file_generations fg ON e.file_path = fg.fi** — Selects entity IDs, languages, and file paths from entities joined with file generations where conditions are met `entity-ops.ts:1227-1231`
- **SELECT embedding FROM embedding_cache WHERE key = ?** — Executes a SQL query to fetch an embedding from the cache based on a key `cache-ops.ts:36-36`
- **SELECT file_gen FROM entities LIMIT 0** — Selects file_gen from entities with a limit of 0 `schema-manager.ts:308-308`
- **SELECT file_path, active_gen FROM file_generations WHERE project_hash = ? AND branch_name = ?** — Selects file paths and active generations from file_generations where project_hash and branch_name match the given parameters `generation-ops.ts:45-46`
- **SELECT id FROM embeddings WHERE id IN (${placeholders}) AND project_hash = ? AND branch_name = ?** — Selects IDs from the embeddings table that match a list of placeholders and specific conditions `vector-ops.ts:520-524`
- **SELECT id FROM entities LIMIT 1** — Fetches the ID of the first entity in the entities table `schema-manager.ts:354-354`
- **SELECT id FROM relationships LIMIT 1** — Fetches the ID of the first relationship in the relationships table `schema-manager.ts:355-355`
- **SELECT id, content, metadata, vector_distance_cos(${colName}, vector32(?)) as distance FROM embeddin** — Calculates the cosine distance between two vectors and selects relevant fields from the embeddings table `vector-ops.ts:330-332`
- **SELECT id, content, vector_extract(${colName}) as vector, metadata, created_at FROM embeddings WHERE** — Extracts a vector from a specified column and selects relevant fields from the embeddings table `vector-ops.ts:422-426`
- **SELECT key, embedding FROM embedding_cache WHERE key IN (${placeholders})** — Executes a SQL query to fetch multiple keys and their corresponding embeddings from the cache `cache-ops.ts:65-65`
- **SELECT last_indexed, file_count FROM project_metadata WHERE project_hash = ? AND branch_name = ?** — Retrieves last indexed timestamp and file count for a project hash and branch name `metadata-ops.ts:260-261`
- **SELECT name FROM sqlite_master WHERE type='index' AND name=?** — Queries the name of an index in the SQLite database `vector-ops.ts:375-375`
- **SELECT name FROM sqlite_master WHERE type='table' AND name IN ('entities', 'relationships', 'embeddi** — Retrieves names of tables in the database that match the specified names `schema-manager.ts:342-345`
- **SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '%shadow%'** — Retrieves names of tables in the database that contain 'shadow' in their names `schema-manager.ts:379-382`
- **SELECT path FROM files LIMIT 1** — Fetches the path of the first file in the files table `schema-manager.ts:356-356`
- **SELECT path, last_indexed FROM files WHERE project_hash = ? AND branch_name = ?** — Selects file paths and last indexed times for files matching the given project hash and branch name `metadata-ops.ts:146-149`
- **SELECT project_hash, branch_name, last_indexed, entity_count, file_count FROM project_metadata ORDER** — Executes a SQL query to select project metadata fields ordered by updated_at timestamp `metadata-ops.ts:356-360`
- **SELECT t.id, t.content, t.metadata FROM vector_top_k('${partialIndexName}', vector32(?), ?) AS v JOI** — Retrieves top-k results from a vector index and joins them with the embeddings table `vector-ops.ts:350-352`
- **UPDATE project_metadata SET last_indexed = ?, updated_at = ? WHERE project_hash = ? AND branch_name =** — Updates the last_indexed and updated_at timestamps in project metadata based on project hash and branch name `metadata-ops.ts:308-311`
- **UPDATE project_metadata SET updated_at = ? WHERE project_hash = ? AND branch_name = ?** — Updates the updated_at timestamp in project metadata based on project hash and branch name `metadata-ops.ts:288-290`

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
| `VectorToStringFn` | type | Function for converting Float32Array to SQL-compatible string | [`cache-ops.ts:15-151`](./cache-ops.ts) |
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
