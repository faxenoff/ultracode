# Storage

## 🤖 Overview

The `src/storage` module provides a comprehensive set of tools for managing and manipulating data storage, particularly using SQLite and LibSQL. It includes a variety of utilities for batch operations, graph storage, and database management, catering to developers and data engineers who need efficient and scalable data handling solutions.

The `src/storage` module is designed to be a robust foundation for applications requiring persistent data storage, with a focus on performance and reliability. It supports multiple database backends and includes features for concurrent access and data integrity, making it suitable for both small-scale and large-scale applications.

## 🤖 Architecture

```
  +---------------------+
  |  BatchOperationsLibSQL |
  +---------------------+
  |  +-----------------+ |
  |  |  SQLiteAdapter  |
  |  +-----------------+ |
  |  +-----------------+ |
  |  |  GraphAdapter   |
  |  +-----------------+ |
  |  +-----------------+ |
  |  |  MultiDBManager |
  |  +-----------------+ |
  |  +-----------------+ |
  |  |  CacheManager   |
  |  +-----------------+ |
  |  +-----------------+ |
  |  |  DBWriteMutex   |
  |  +-----------------+ |
  |  +-----------------+ |
  |  |  NativeSQLiteClient |
  |  +-----------------+ |
  |  +-----------------+ |
  |  |  GraphStorageFactory |
  |  +-----------------+ |
  |  +-----------------
```

## 🤖 Flow

```
  +---------------------+
  |  NativeSQLiteClient |
  +---------------------+
  |       +-------------+       |
  |       |             |       |
  |       |             |       |
  |       |             |       |
  |       |             |
```

## 🤖 Entity Listing

### Function
- **[fetchedEntities, fetchedRels]** — Parses a list of entity IDs and fetches their corresponding entities and relationships `graph-storage-libsql.ts:579-579`
- **[fetchedEntities, fetchedRels]** — Parses a list of entity IDs and fetches their corresponding relationships `graph-storage-libsql.ts:580-580`
- **allRels** — Returns all relationships in the graph `graph-storage-libsql.ts:465-465`
- **byteSize** — Function to estimate the byte size of a value `cache-manager.ts:26-51`
- **Cacheable** — Not explicitly defined in the provided code `cache-manager.ts:165-183`
- **configureGraphStorage** — Configures the graph storage factory with libsql settings `graph-storage-factory.ts:59-67`
- **createBunDatabase** — Creates a new Bun SQLite database connection `bun-sqlite-adapter.ts:80-83`
- **createProjectContext** — Resolves branch name and normalizes it for project context `graph-storage-libsql.ts:44-56`
- **doGC** — Runs garbage collection `graph-adapter.ts:444-444`
- **doInvalidate** — Invalidates a specific file generation `graph-adapter.ts:438-438`
- **entities** — Represents a collection of entities `batch-operations-libsql.ts:226-237`
- **entitiesWithIds** — Stores entities along with their IDs `batch-operations-libsql.ts:176-184`
- **entitiesWithIds** — Retrieves entities with specific IDs `graph-storage-libsql.ts:146-154`
- **forcedrainAndClear** — Drains and clears the multi-db manager if it exists `graph-storage-factory.ts:248-252`
- **getCacheClient** — Method to get the cache client `graph-adapter.ts:124-124`
- **getCacheManager** — Not explicitly defined in the provided code `cache-manager.ts:191-194`
- **getContext** — Method to get the request context `graph-adapter.ts:125-125`
- **getGraphClient** — Method to get the graph client `graph-adapter.ts:122-122`
- **getGraphStorage** — Retrieves the GraphStorage instance using LibSQL, optionally switching to a different project's DBs `graph-storage-factory.ts:77-209`
- **getLibSQLAdapter** — Returns the LibSQLGraphAdapter instance or null `graph-storage-factory.ts:221-223`
- **getMultiDbPaths** — Returns the file paths for the four different databases `multi-db-manager.ts:28-35`
- **getSemanticClient** — Method to get the semantic client `graph-adapter.ts:123-123`
- **getStagingMode** — Method to get the staging mode `graph-adapter.ts:126-126`
- **handleDatabaseCorruption** — Handles database corruption by closing and deleting database files, then resetting graph storage `graph-storage-factory.ts:297-367`
- **ids** — Represents a collection of IDs `batch-operations-libsql.ts:252-255`
- **incoming** — Returns incoming relationships for a given entity `graph-storage-libsql.ts:470-470`
- **initializeGraphStorage** — Initializes graph storage by calling getGraphStorage `graph-storage-factory.ts:214-216`
- **isBunRuntime** — Checks if the code is running in Bun runtime `bun-sqlite-adapter.ts:52-59`
- **isBunRuntime** — Boolean indicating whether the runtime is Bun `sqlite-adapter.ts:91-98`
- **isDatabaseCorruptionError** — Checks if an error is an instance of DatabaseCorruptionError `graph-storage-factory.ts:372-374`
- **isStorageReady** — Checks if graph storage is ready by verifying graphStorage is not null and the LibSQL adapter is ready `graph-storage-factory.ts:288-290`
- **isSyncSQLiteAvailable** — Checks if sync SQLite is available `sqlite-adapter.ts:116-118`
- **loadBetterSqlite3** — Loads the better-sqlite3 extension for the SQLite database `sqlite-adapter.ts:321-329`
- **loadBunSQLite** — Loads the bun:sqlite Database class `bun-sqlite-adapter.ts:65-75`
- **loadBunSQLite** — Loads Bun's native SQLite interface `sqlite-adapter.ts:123-315`
- **loadSQLiteModule** — Function to load the SQLite module `sqlite-adapter.ts:103-111`
- **map1** — A mapping of entities `graph-storage-libsql.ts:260-260`
- **nextLink** — Represents the next link in the promise chain `db-write-mutex.ts:30-32`
- **readGraph** — Method to read from the graph `graph-adapter.ts:132-132`
- **relsWithIds** — Stores relationships along with their IDs `batch-operations-libsql.ts:330-337`
- **relsWithIds** — Relationships with IDs `graph-storage-libsql.ts:349-353`
- **resetCacheManager** — Not explicitly defined in the provided code `cache-manager.ts:196-201`
- **resetGraphStorage** — Resets graph storage by closing and nullifying the LibSQL adapter and multi-db manager, then setting graphStorage to null `graph-storage-factory.ts:228-241`
- **runBatch** — Not present in the provided code `native-sqlite-client.ts:108-130`
- **setGlobalProjectContext** — Sets the global project context, potentially resetting graph storage if the project hash changes `graph-storage-factory.ts:262-283`
- **toFetch** — Represents a fetch operation `graph-storage-libsql.ts:572-572`
- **vectorOpsContext** — Manages vector operations context `graph-adapter.ts:159-159`
- **vectorOpsContext** — Returns the embedding column name `graph-adapter.ts:160-160`
- **vectorOpsContext** — Converts a vector to a string `graph-adapter.ts:161-161`
- **vectorOpsContext** — Converts a string to a vector `graph-adapter.ts:162-162`
- **vectorOpsContext** — Encodes metadata `graph-adapter.ts:163-163`
- **vectorOpsContext** — Decodes metadata `graph-adapter.ts:164-164`
- **vectorOpsContext** — Ensures project vector index `graph-adapter.ts:167-167`
- **writeCache** — Stores and retrieves cached data `graph-adapter.ts:134-134`
- **writeGraph** — Method to write to the graph `graph-adapter.ts:131-131`
- **writeSemantic** — Method to write semantic data `graph-adapter.ts:133-133`
- **yieldToEventLoop** — Helper function to yield to the event loop between batches `batch-operations-libsql.ts:22-22`
- **yieldToEventLoop** — Returns a promise that resolves after yielding to the event loop `batch-operations-libsql.ts:22-22`

### Method
- **abortStaging** — Aborts staging changes `graph-adapter.ts:777-779`
- **addTombstone** — Adds a tombstone to the graph adapter `graph-adapter.ts:585-594`
- **aggregate** — Defines an SQL aggregate function `sqlite-adapter.ts:269-273`
- **analyze** — Analyzes the graph storage `graph-storage-libsql.ts:625-628`
- **backup** — Backs up the SQLite database `sqlite-adapter.ts:280-283`
- **batch** — Not present in the provided code `native-sqlite-client.ts:105-134`
- **batchUpdateFileInfo** — Updates multiple file information entries in the storage `graph-storage-libsql.ts:490-492`
- **calculateComplexity** — Computes the complexity of a graph query or operation `graph-storage-libsql.ts:797-826`
- **cleanupStaleLocks** — Cleans up stale locks in a client's database `multi-db-manager.ts:318-332`
- **clear** — Method to clear all cache entries `cache-manager.ts:110-113`
- **clear** — Clears the graph storage `graph-storage-libsql.ts:714-716`
- **clearAll** — Clears all data from the graph storage `graph-storage-libsql.ts:718-720`
- **clearCaches** — Clears all caches in the graph adapter `graph-adapter.ts:716-721`
- **clearTombstones** — Clears all tombstones from the graph adapter `graph-adapter.ts:630-638`
- **close** — Closes the graph adapter `graph-adapter.ts:686-698`
- **close** — Closes a client's database `multi-db-manager.ts:282-295`
- **close** — Closes the SQLite database connection `native-sqlite-client.ts:139-148`
- **close** — Closes the SQLite database `sqlite-adapter.ts:236-239`
- **closed** — Indicates whether the SQLite database connection is closed `native-sqlite-client.ts:153-155`
- **commitStaging** — Commits staging changes `graph-adapter.ts:774-776`
- **compareEntitiesBetweenBranches** — Compares entities between two branches `graph-storage-libsql.ts:240-272`
- **constructor** — Constructor to initialize the BatchOperationsLibSQL instance `batch-operations-libsql.ts:36-39`
- **constructor** — Constructor for the QueryCacheManager class `cache-manager.ts:61-79`
- **constructor** — Initializes a new DbWriteMutex instance `db-write-mutex.ts:19-21`
- **constructor** — Constructor for the GraphAdapter class `graph-adapter.ts:113-176`
- **constructor** — Initializes the GraphStorageLibSQL instance with a GraphAdapter `graph-storage-libsql.ts:64-66`
- **constructor** — Constructor for NativeSQLiteClient that initializes the database connection `native-sqlite-client.ts:47-50`
- **constructor** — Initializes the SQLite database `sqlite-adapter.ts:145-171`
- **countByLanguage** — Counts entities by language `graph-storage-libsql.ts:218-220`
- **createGraphCommit** — Creates a new graph commit `graph-adapter.ts:744-750`
- **createKey** — Not explicitly defined in the provided code `cache-manager.ts:153-158`
- **defaultSafeIntegers** — Sets the default safe integers mode for the SQLite database `sqlite-adapter.ts:302-305`
- **delete** — Method to delete a cache entry `cache-manager.ts:106-108`
- **deleteAll** — Deletes all data from a client's database `multi-db-manager.ts:300-316`
- **deleteEntities** — Deletes entities from the database `batch-operations-libsql.ts:243-284`
- **deleteEntitiesByFilePath** — Deletes entities by file path `graph-storage-libsql.ts:518-520`
- **deleteEntity** — Deletes an entity from the database `graph-storage-libsql.ts:178-180`
- **deleteFileInfo** — Deletes file information from the storage `graph-storage-libsql.ts:506-508`
- **deleteProject** — Deletes a project from the graph storage `graph-storage-libsql.ts:722-736`
- **deleteRelationship** — Deletes a relationship `graph-storage-libsql.ts:417-419`
- **destroy** — Method to destroy the batch operations `batch-operations-libsql.ts:60-62`
- **detectLanguage** — Determines the language of a given text or file `graph-storage-libsql.ts:828-869`
- **drain** — Resets the mutex chain to unblock all queued writers `db-write-mutex.ts:52-55`
- **drainAndClear** — Drains and clears a client's database `multi-db-manager.ts:239-280`
- **dropBulkIndexes** — Drops bulk indexes `graph-adapter.ts:765-767`
- **enableStagingMode** — Enables staging mode `graph-adapter.ts:771-773`
- **ensureProjectVectorIndex** — Ensures the project vector index `graph-adapter.ts:374-401`
- **entityKey** — Private method to generate a stable key for an entity `batch-operations-libsql.ts:68-73`
- **entityKey** — Represents the key for an entity in the graph storage `graph-storage-libsql.ts:777-781`
- **exec** — Executes a SQL statement `sqlite-adapter.ts:220-222`
- **execute** — Asynchronous method to execute a single SQL statement `native-sqlite-client.ts:56-82`
- **executeIterator** — Not present in the provided code `native-sqlite-client.ts:92-96`
- **executeQuery** — Executes a query on the graph `graph-storage-libsql.ts:542-558`
- **findEntities** — Finds entities `graph-adapter.ts:411-413`
- **findEntities** — Finds entities based on a query `graph-storage-libsql.ts:205-212`
- **findEntitiesInBranch** — Finds entities in a specific branch `graph-storage-libsql.ts:222-238`
- **findIncomingRelationshipsByName** — Finds incoming relationships by name `graph-storage-libsql.ts:459-480`
- **findRelationships** — Finds relationships `graph-storage-libsql.ts:425-431`
- **flush** — Flushes the graph adapter's cache `graph-adapter.ts:644-684`
- **flush** — Flushes the graph storage `graph-storage-libsql.ts:742-744`
- **flushAll** — Flushes all clients' databases `multi-db-manager.ts:230-233`
- **flushClient** — Flushes a client's database `multi-db-manager.ts:209-225`
- **function** — Defines a SQL function `sqlite-adapter.ts:258-267`
- **generateReverseRelationships** — Generates reverse relationships for entities `batch-operations-libsql.ts:94-140`
- **generateReverseRelationships** — Generates reverse relationships `graph-storage-libsql.ts:364-415`
- **get** — Method to retrieve a cache entry `cache-manager.ts:81-91`
- **getAdapter** — Retrieves the graph adapter used by the graph storage `graph-storage-libsql.ts:753-755`
- **getAllEntities** — Retrieves all entities `graph-storage-libsql.ts:274-276`
- **getAllIndexedFiles** — Retrieves all indexed files from the storage `graph-storage-libsql.ts:502-504`
- **getAllRelationships** — Retrieves all relationships `graph-storage-libsql.ts:433-435`
- **getBatchSize** — Retrieves the current batch size for database operations `batch-operations-libsql.ts:389-391`
- **getBranchDiffCache** — Retrieves the branch diff cache `graph-adapter.ts:740-742`
- **getCacheClient** — Returns a client for the cache database `multi-db-manager.ts:150-152`
- **getCacheStats** — Retrieves cache statistics for the graph adapter `graph-adapter.ts:704-714`
- **getCommitManager** — Returns a commit manager instance `graph-adapter.ts:737-739`
- **getCooccurrenceOps** — Retrieves cooccurrence operations for the graph adapter `graph-adapter.ts:577-579`
- **getCooccurrenceOps** — Retrieves cooccurrence operations for the graph storage `graph-storage-libsql.ts:769-771`
- **getDbPath** — Retrieves the database path `graph-adapter.ts:339-341`
- **getEffectiveDimensions** — Retrieves effective dimensions `graph-adapter.ts:366-368`
- **getEmbeddingColumnName** — Gets the embedding column name `graph-adapter.ts:370-372`
- **getEntitiesBatch** — Retrieves a batch of entities from the database `graph-storage-libsql.ts:186-188`
- **getEntity** — Retrieves a single entity from the database `graph-storage-libsql.ts:182-184`
- **getEntityFromBranch** — Retrieves an entity from a specific branch `graph-storage-libsql.ts:190-203`
- **getEntityIdsByFilePath** — Retrieves entity IDs by file path `graph-storage-libsql.ts:514-516`
- **getEntries** — Not explicitly defined in the provided code `cache-manager.ts:145-147`
- **getFileInfo** — Retrieves file information from the storage `graph-storage-libsql.ts:494-496`
- **getGenerationManager** — Retrieves the generation manager `graph-adapter.ts:429-431`
- **getGraphClient** — Returns the graph database client `multi-db-manager.ts:138-140`
- **getIncrementalTrackingInfo** — Retrieves incremental tracking information for a project `graph-storage-libsql.ts:671-677`
- **getLibSQLAdapter** — Retrieves the LibSQL adapter used by the graph storage `graph-storage-libsql.ts:761-763`
- **getMetrics** — Retrieves metrics from the graph storage `graph-storage-libsql.ts:630-649`
- **getOrPrepare** — Retrieves or prepares an SQLite statement for execution `native-sqlite-client.ts:161-168`
- **getOutdatedFiles** — Identifies outdated files in the storage `graph-storage-libsql.ts:498-500`
- **getPaths** — Returns paths for the four databases `multi-db-manager.ts:154-156`
- **getProjectContext** — Gets the project context `graph-adapter.ts:362-364`
- **getProjectContext** — Retrieves the project context `graph-storage-libsql.ts:104-106`
- **getProllyNodeStore** — Retrieves the Prolly node store `graph-adapter.ts:731-733`
- **getProllyTree** — Retrieves the Prolly tree `graph-adapter.ts:734-736`
- **getRelationships** — Gets relationships `graph-storage-libsql.ts:437-439`
- **getRelationshipsForEntity** — Gets relationships for an entity `graph-storage-libsql.ts:421-423`
- **getRelationshipsFromBranch** — Gets relationships from a branch `graph-storage-libsql.ts:441-457`
- **getSemanticClient** — Returns the semantic database client `multi-db-manager.ts:142-144`
- **getStatistics** — Retrieves statistics from the graph storage `graph-storage-libsql.ts:651-658`
- **getStats** — Method to get cache statistics `cache-manager.ts:124-143`
- **getSubgraph** — Retrieves a subgraph from the graph `graph-storage-libsql.ts:560-614`
- **getTombstonedIds** — Retrieves IDs of tombstoned entities `graph-adapter.ts:618-628`
- **getVersioningClient** — Returns a client for the versioning database `multi-db-manager.ts:146-148`
- **has** — Method to check if a cache entry exists `cache-manager.ts:115-117`
- **initBranchDiff** — Initializes the branch diff cache `graph-adapter.ts:756-759`
- **initialize** — Method to initialize the batch operations `batch-operations-libsql.ts:56-58`
- **initialize** — Initializes the graph adapter `graph-adapter.ts:182-333`
- **initialize** — Initializes the hasher and logs the initialization time `graph-storage-libsql.ts:72-78`
- **initialize** — Initializes the MultiDbManager by creating the necessary database files and clients `multi-db-manager.ts:103-136`
- **insertEntities** — Inserts entities into the database `batch-operations-libsql.ts:146-219`
- **insertEntities** — Inserts multiple entities into the database `graph-storage-libsql.ts:129-159`
- **insertEntity** — Inserts a single entity into the database `graph-storage-libsql.ts:112-127`
- **insertRelationship** — Inserts a relationship `graph-storage-libsql.ts:298-320`
- **insertRelationships** — Inserts relationships between entities `batch-operations-libsql.ts:290-373`
- **insertRelationships** — Inserts multiple relationships `graph-storage-libsql.ts:322-358`
- **inTransaction** — Indicates if the database is in a transaction `sqlite-adapter.ts:241-249`
- **invalidateFileGeneration** — Invalidates file generation `graph-adapter.ts:437-440`
- **invalidateFileGeneration** — Invalidates file generation for a given file `graph-storage-libsql.ts:526-528`
- **isEntityDeletedOnBranch** — Checks if an entity is deleted on a branch `graph-adapter.ts:761-763`
- **isInitialized** — A public property indicating whether the MultiDbManager has been initialized `multi-db-manager.ts:99-101`
- **isReady** — Checks if the graph adapter is ready `graph-adapter.ts:335-337`
- **isTombstoned** — Checks if an entity is tombstoned `graph-adapter.ts:606-616`
- **label** — Getter for the mutex name `db-write-mutex.ts:63-65`
- **listBranches** — Lists all branches in the graph storage `graph-storage-libsql.ts:706-708`
- **listProjects** — Lists all projects in the graph storage `graph-storage-libsql.ts:693-704`
- **loadExtension** — Loads an extension for the SQLite database `sqlite-adapter.ts:290-300`
- **loadGenerationCache** — Loads the generation cache `graph-adapter.ts:432-434`
- **memory** — Indicates if the database is in memory `sqlite-adapter.ts:174-176`
- **name** — Stores the name of the database `sqlite-adapter.ts:182-184`
- **open** — Opens the SQLite database `sqlite-adapter.ts:186-188`
- **optimizeBatchSize** — Optimizes the batch size for efficient database operations `batch-operations-libsql.ts:379-387`
- **pragma** — Executes a SQLite pragma `sqlite-adapter.ts:224-234`
- **prepare** — Prepares a SQL statement `sqlite-adapter.ts:190-218`
- **prune** — Method to prune cache entries `cache-manager.ts:119-122`
- **pruneAndGC** — Prunes and garbage collects the graph `graph-adapter.ts:752-754`
- **queueDepth** — Getter for the current number of waiters in the queue `db-write-mutex.ts:58-60`
- **readCache** — Reads data from the cache database `multi-db-manager.ts:194-196`
- **readGraph** — Reads data from the graph database `multi-db-manager.ts:169-171`
- **readonly** — Indicates if the database is read-only `sqlite-adapter.ts:178-180`
- **readSemantic** — Reads data from the semantic database `multi-db-manager.ts:179-181`
- **recordIncrementalChanges** — Records incremental changes made to the graph `graph-storage-libsql.ts:682-684`
- **recreateBulkIndexes** — Recreates bulk indexes `graph-adapter.ts:768-770`
- **relationshipKey** — Private method to generate a stable key for a relationship `batch-operations-libsql.ts:80-82`
- **relationshipKey** — Represents a unique identifier for a relationship in the graph `graph-storage-libsql.ts:788-790`
- **removeTombstone** — Removes a tombstone from the graph adapter `graph-adapter.ts:596-604`
- **resetIncrementalTracking** — Resets the incremental tracking information `graph-storage-libsql.ts:689-691`
- **resetStats** — Not explicitly defined in the provided code `cache-manager.ts:149-151`
- **run** — Executes a function exclusively, ensuring only one write operation runs at a time `db-write-mutex.ts:27-45`
- **runGenerationGC** — Runs generation garbage collection `graph-adapter.ts:443-446`
- **runGenerationGC** — Runs garbage collection for file generation `graph-storage-libsql.ts:534-536`
- **searchEntities** — Searches for entities based on a query `graph-storage-libsql.ts:278-285`
- **searchEntitiesInDirectory** — Searches for entities in a directory `graph-storage-libsql.ts:290-292`
- **serialize** — Serializes the database to a buffer `sqlite-adapter.ts:285-288`
- **set** — Method to set a cache entry `cache-manager.ts:93-104`
- **setProject** — Method to set the project path and branch name `batch-operations-libsql.ts:47-54`
- **setProject** — Sets the project for the storage `graph-storage-libsql.ts:89-102`
- **setProjectContext** — Method to set the current project context `batch-operations-libsql.ts:41-45`
- **setProjectContext** — Sets the project context `graph-adapter.ts:348-360`
- **setProjectContext** — Sets the project context for the storage `graph-storage-libsql.ts:84-86`
- **setProllyContext** — Sets the context for the Prolly tree `graph-adapter.ts:727-729`
- **stableEntityId** — Private method to generate a stable ID for an entity `batch-operations-libsql.ts:75-78`
- **stableEntityId** — Represents the stable ID for an entity in the graph storage `graph-storage-libsql.ts:783-786`
- **stableRelationshipId** — Generates a stable relationship ID by hashing the relationship key `batch-operations-libsql.ts:84-87`
- **stableRelationshipId** — Ensures a consistent identifier for a relationship across different operations `graph-storage-libsql.ts:792-795`
- **stagingMode** — Boolean indicating staging mode `graph-adapter.ts:109-111`
- **table** — Creates a SQL table `sqlite-adapter.ts:275-278`
- **transaction** — Begins a transaction `sqlite-adapter.ts:251-254`
- **unsafeMode** — Toggles the unsafe mode for the SQLite database `sqlite-adapter.ts:307-310`
- **updateEntities** — Updates entities in the database `batch-operations-libsql.ts:221-241`
- **updateEntity** — Updates an entity in the database `graph-storage-libsql.ts:161-176`
- **updateFileInfo** — Updates file information in the storage `graph-storage-libsql.ts:486-488`
- **updateProjectMetadata** — Updates metadata for a project in the graph storage `graph-storage-libsql.ts:664-666`
- **vacuum** — Performs a vacuum operation on the database `graph-storage-libsql.ts:620-623`
- **walCheckpoint** — Performs a WAL checkpoint `graph-adapter.ts:780-782`
- **writeCache** — Writes data to the cache database `multi-db-manager.ts:189-191`
- **writeGraph** — Writes data to the graph database `multi-db-manager.ts:164-166`
- **writeSemantic** — Writes data to the semantic database `multi-db-manager.ts:174-176`
- **writeVersioning** — Writes data to the versioning database `multi-db-manager.ts:184-186`

### Class
- **BatchOperationsLibSQL** — Class for async batch processing using libsql adapter `batch-operations-libsql.ts:28-392`
- **DbWriteMutex** — Promise-based write mutex for SQLite database serialization `db-write-mutex.ts:14-66`
- **GraphAdapter** — Unified Graph + Vector Storage facade that delegates storage operations to focused modules `graph-adapter.ts:80-783`
- **GraphStorageLibSQL** — Implements the GraphStorage interface using GraphAdapter `graph-storage-libsql.ts:62-870`
- **MultiDbManager** — Manages four independent database clients to eliminate write-blocking `multi-db-manager.ts:75-333`
- **NativeSQLiteClient** — NativeSQLiteClient class that wraps sync native SQLite into async API `native-sqlite-client.ts:42-169`
- **QueryCacheManager** — Class implementing the cache manager interface `cache-manager.ts:57-159`

### Interface
- **BunOptions** — Defines options for Bun's SQLite `sqlite-adapter.ts:151-154`
- **BunSQLiteDatabase** — Bun SQLite database interface `bun-sqlite-adapter.ts:41-47`
- **BunSQLiteDatabase** — Bun's native SQLite interface `sqlite-adapter.ts:73-79`
- **BunSQLiteOptions** — Options for creating Bun SQLite database `bun-sqlite-adapter.ts:16-20`
- **BunSQLiteRunResult** — Result of running a SQLite query `bun-sqlite-adapter.ts:22-25`
- **BunSQLiteStatement** — Generic Bun SQLite statement with type-safe query results `bun-sqlite-adapter.ts:31-36`
- **BunSQLiteStatement** — Bun's native SQLite statement interface `sqlite-adapter.ts:81-86`
- **CacheConfig** — Configuration interface for the cache manager `cache-manager.ts:10-14`
- **MultiDbPaths** — Represents the file paths for four different databases `multi-db-manager.ts:21-26`
- **ResultSet** — Result set from execute() - matches libsql ResultSet `native-sqlite-client.ts:25-30`
- **SQLiteDatabase** — Type-safe SQLite database interface supporting both bun:sqlite and better-sqlite3 APIs `sqlite-adapter.ts:37-59`
- **SQLiteDatabaseOptions** — Options for creating a SQLite database `sqlite-adapter.ts:61-66`
- **SQLiteRunResult** — Represents the result of running an SQLite statement, including changes and lastInsertRowid `sqlite-adapter.ts:28-31`
- **SQLiteStatement** — Generic SQLite statement with type-safe query results `sqlite-adapter.ts:20-26`

### Type_alias
- **InStatement** — Input statement for execute/batch - matches libsql InStatement `native-sqlite-client.ts:33-33`
- **LibSQLGraphAdapter** — A class for the LibSQL graph adapter `graph-adapter.ts:786-786`
- **Row** — Row object with column-name keys (matches libsql Row) `native-sqlite-client.ts:22-22`
- **SQLiteDatabaseConstructor** — Constructor for creating a SQLite database `sqlite-adapter.ts:68-68`

### Import_decl
- **../logging/index.js** — Imports `../logging/index.js` from `../logging/index.js`. `batch-operations-libsql.ts:8-8`, `cache-manager.ts:2-2`, `graph-adapter.ts:16-16`, `graph-storage-factory.ts:10-10`, `graph-storage-libsql.ts:11-11`, `multi-db-manager.ts:16-16`, `sqlite-adapter.ts:12-12`
- **../semantic/faiss/base-branch-detector.js** — Imports `../semantic/faiss/base-branch-detector.js` from `../semantic/faiss/base-branch-detector.js`. `graph-storage-libsql.ts:12-12`
- **../shared/storage-paths.js** — Imports `../shared/storage-paths.js` from `../shared/storage-paths.js`. `batch-operations-libsql.ts:9-9`, `graph-adapter.ts:17-17`, `graph-storage-libsql.ts:13-13`
- **../shared/storage-paths.js** — Imports `../shared/storage-paths.js`. `graph-storage-factory.ts:11-16`
- **../types/semantic.js** — Imports `../types/semantic.js` from `../types/semantic.js`. `graph-adapter.ts:18-18`
- **../types/storage.js** — Imports `../types/storage.js` from `../types/storage.js`. `batch-operations-libsql.ts:10-10`, `cache-manager.ts:3-3`
- **../types/storage.js** — Imports `../types/storage.js`. `graph-adapter.ts:19-28`, `graph-storage-libsql.ts:14-27`
- **../utils/fast-hash.js** — Imports `../utils/fast-hash.js` from `../utils/fast-hash.js`. `batch-operations-libsql.ts:11-11`, `cache-manager.ts:4-4`, `graph-storage-libsql.ts:28-28`
- **../utils/runtime-detection.js** — Imports `../utils/runtime-detection.js` from `../utils/runtime-detection.js`. `graph-adapter.ts:29-29`, `multi-db-manager.ts:17-17`
- **./db-write-mutex.js** — Imports `./db-write-mutex.js` from `./db-write-mutex.js`. `multi-db-manager.ts:18-18`
- **./graph-adapter.js** — Imports `./graph-adapter.js` from `./graph-adapter.js`. `batch-operations-libsql.ts:12-12`, `graph-storage-libsql.ts:29-29`
- **./graph-adapter.js** — Imports `./graph-adapter.js`. `graph-storage-factory.ts:17-22`
- **./graph-storage-libsql.js** — Imports `./graph-storage-libsql.js` from `./graph-storage-libsql.js`. `graph-storage-factory.ts:23-23`
- **./libsql/cache-ops.js** — Imports `./libsql/cache-ops.js` from `./libsql/cache-ops.js`. `graph-adapter.ts:30-30`
- **./libsql/cbor-utils.js** — Imports `./libsql/cbor-utils.js` from `./libsql/cbor-utils.js`. `graph-adapter.ts:31-31`
- **./libsql/cooccurrence-ops.js** — Imports `./libsql/cooccurrence-ops.js` from `./libsql/cooccurrence-ops.js`. `graph-adapter.ts:32-32`
- **./libsql/entity-ops.js** — Imports `./libsql/entity-ops.js` from `./libsql/entity-ops.js`. `graph-adapter.ts:33-33`
- **./libsql/generation-ops.js** — Imports `./libsql/generation-ops.js` from `./libsql/generation-ops.js`. `graph-adapter.ts:34-34`
- **./libsql/metadata-ops.js** — Imports `./libsql/metadata-ops.js` from `./libsql/metadata-ops.js`. `graph-adapter.ts:35-35`
- **./libsql/relationship-ops.js** — Imports `./libsql/relationship-ops.js` from `./libsql/relationship-ops.js`. `graph-adapter.ts:36-36`
- **./libsql/request-context.js** — Imports `./libsql/request-context.js` from `./libsql/request-context.js`. `graph-adapter.ts:37-37`
- **./libsql/row-mappers.js** — Imports `./libsql/row-mappers.js`. `graph-adapter.ts:38-45`
- **./libsql/schema-manager.js** — Imports `./libsql/schema-manager.js` from `./libsql/schema-manager.js`. `graph-adapter.ts:46-46`
- **./libsql/types.js** — Imports `./libsql/types.js`. `graph-adapter.ts:47-58`
- **./libsql/vector-ops.js** — Imports `./libsql/vector-ops.js` from `./libsql/vector-ops.js`. `graph-adapter.ts:59-59`
- **./libsql/versioning-ops.js** — Imports `./libsql/versioning-ops.js` from `./libsql/versioning-ops.js`. `graph-adapter.ts:60-60`
- **./multi-db-manager.js** — Imports `./multi-db-manager.js` from `./multi-db-manager.js`. `graph-adapter.ts:61-61`, `graph-storage-factory.ts:24-24`
- **./native-sqlite-client.js** — Imports `./native-sqlite-client.js` from `./native-sqlite-client.js`. `graph-adapter.ts:62-62`, `multi-db-manager.ts:19-19`
- **./prolly/index.js** — Imports `./prolly/index.js` from `./prolly/index.js`. `graph-adapter.ts:63-63`
- **./sqlite-adapter.js** — Imports `./sqlite-adapter.js` from `./sqlite-adapter.js`. `native-sqlite-client.ts:14-14`, `native-sqlite-client.ts:15-15`
- **lru-cache** — Imports `lru-cache` from `lru-cache`. `cache-manager.ts:1-1`, `graph-adapter.ts:15-15`
- **node:fs** — Imports `node:fs` from `node:fs`. `graph-storage-factory.ts:8-8`, `multi-db-manager.ts:14-14`
- **node:path** — Imports `node:path` from `node:path`. `graph-storage-factory.ts:9-9`, `multi-db-manager.ts:15-15`

### Property
- **_closed** — Boolean indicating if the database is closed `native-sqlite-client.ts:45-45`
- **_fallbackContext** — Fallback context for the graph adapter `graph-adapter.ts:89-92`
- **_isInitialized** — A private property indicating whether the MultiDbManager has been initialized `multi-db-manager.ts:97-97`
- **_open** — Indicates if the database is open `sqlite-adapter.ts:143-143`
- **_path** — Stores the path to the SQLite database file `sqlite-adapter.ts:141-141`
- **_queueDepth** — Current number of waiters in the queue `db-write-mutex.ts:16-16`
- **_readonly** — Indicates if the database is read-only `sqlite-adapter.ts:142-142`
- **adapter** — Private property to store the graph adapter `batch-operations-libsql.ts:30-30`
- **adapter** — Stores the GraphAdapter instance for database operations `graph-storage-libsql.ts:63-63`
- **args** — Arguments for the SQL statement `native-sqlite-client.ts:33-33`
- **args** — Executes a SQL statement or a prepared statement with arguments, returning a ResultSet `native-sqlite-client.ts:56-56`
- **args** — Executes a SQL statement or a prepared statement with arguments, returning an IterableIterator of rows `native-sqlite-client.ts:92-92`
- **batchSize** — Private property to store the batch size `batch-operations-libsql.ts:29-29`
- **batchUpdateFileInfo** — Updates multiple file information records in the database `graph-adapter.ts:468-468`
- **branch1Entities** — Entities in branch 1 `graph-storage-libsql.ts:245-245`
- **branch2Entities** — Entities in branch 2 `graph-storage-libsql.ts:246-246`
- **branchName** — Returns the name of a branch `graph-adapter.ts:540-540`
- **branchName** — Represents the name of the branch associated with a project `graph-storage-libsql.ts:696-696`
- **bulkInsertEmbeddings** — Inserts a batch of embeddings into the database `graph-adapter.ts:490-491`
- **cache** — A database client for managing caching data such as embedding cache and query cache `multi-db-manager.ts:25-25`
- **cache** — Represents a NativeSQLiteClient instance for caching operations `multi-db-manager.ts:80-80`
- **cacheOps** — Operations for caching `graph-adapter.ts:102-102`
- **chain** — Promise chain for managing write operations `db-write-mutex.ts:15-15`
- **changes** — Represents the changes made to entities `batch-operations-libsql.ts:222-222`
- **changes** — Number of rows affected by the query `bun-sqlite-adapter.ts:23-23`
- **changes** — Number of rows affected by the last SQLite statement `sqlite-adapter.ts:29-29`
- **changes** — Returns the number of rows changed by the last operation `sqlite-adapter.ts:82-82`
- **clear** — Clears all embeddings from the graph adapter `graph-adapter.ts:570-570`
- **clearAll** — Clears all data from the graph adapter `graph-adapter.ts:571-571`
- **clearEmbeddingCache** — Clears the cache for vector embeddings `graph-adapter.ts:521-521`
- **client** — Represents a client object, initialized to null `graph-adapter.ts:81-81`
- **clients** — An object containing four database clients for graph, semantic, versioning, and cache databases `multi-db-manager.ts:76-81`
- **columns** — Array of column names from the result set `native-sqlite-client.ts:26-26`
- **config** — Configuration object for the graph adapter `graph-adapter.ts:83-83`
- **contentHash** — Computes the hash of content `graph-adapter.ts:519-519`
- **cooccurrenceOps** — Operations for cooccurrence `graph-adapter.ts:104-104`
- **count** — Counts entities `graph-adapter.ts:427-427`
- **count** — Counts entities in the database `graph-storage-libsql.ts:218-218`
- **countByLanguage** — Counts entities by language `graph-adapter.ts:427-427`
- **counters** — Object to track cache hit, miss, and eviction counts `cache-manager.ts:59-59`
- **create** — Not applicable in this context `bun-sqlite-adapter.ts:18-18`
- **create** — Creates a new SQLite database `sqlite-adapter.ts:153-153`
- **currentContext** — Private property to store the current project context `batch-operations-libsql.ts:31-34`
- **db** — Database connection object `native-sqlite-client.ts:43-43`
- **db** — Represents the SQLite database `sqlite-adapter.ts:140-140`
- **dbManager** — Represents a database manager object, initialized to null `graph-adapter.ts:82-82`
- **dbPath** — Path to the database file `graph-adapter.ts:85-85`
- **defaultTTL** — Default time-to-live for cache entries in milliseconds `cache-manager.ts:13-13`
- **deleteEmbedding** — Deletes a specific embedding from the database `graph-adapter.ts:498-498`
- **deleteEntitiesBatch** — Deletes multiple entities in a batch `graph-adapter.ts:423-423`
- **deleteEntitiesByFilePath** — Deletes entities by file path `graph-adapter.ts:425-425`
- **deleteEntity** — Deletes a single entity `graph-adapter.ts:422-422`
- **deleteFileInfo** — Deletes information about a specific file `graph-adapter.ts:472-472`
- **deleteRelationship** — Deletes a relationship `graph-adapter.ts:460-460`
- **dropVectorIndex** — Drops a vector index from the database `graph-adapter.ts:486-486`
- **embedding** — Represents an embedding `graph-adapter.ts:519-519`
- **embedding** — Represents an embedding in the graph adapter `graph-adapter.ts:705-705`
- **embeddingCache** — Cache for storing vector embeddings `graph-adapter.ts:95-95`
- **entities** — Represents entities `graph-adapter.ts:443-443`
- **entities** — Represents entities in the graph `graph-storage-libsql.ts:534-534`
- **entityCount** — Returns the count of entities `graph-adapter.ts:543-543`
- **entityCount** — Represents the count of entities in the graph storage `graph-storage-libsql.ts:699-699`
- **entityOps** — Operations for entities `graph-adapter.ts:99-99`
- **entries** — Number of entries in the cache `cache-manager.ts:129-129`
- **error** — Represents an error encountered during batch operations `batch-operations-libsql.ts:151-151`
- **error** — Stores an error in an array of errors `batch-operations-libsql.ts:248-248`
- **error** — Stores an error message in an array of error objects `batch-operations-libsql.ts:295-295`
- **evictions** — Tracks the number of cache entries evicted `cache-manager.ts:130-130`
- **fileCount** — Counts files `graph-adapter.ts:427-427`
- **fileCount** — Returns the count of files `graph-adapter.ts:544-544`
- **fileCount** — Counts the number of files in the storage `graph-storage-libsql.ts:218-218`
- **fileCount** — Represents the count of files in the graph storage `graph-storage-libsql.ts:700-700`
- **fileMustExist** — Boolean indicating whether the file must exist `sqlite-adapter.ts:63-63`
- **filePath** — Stores the file path `graph-adapter.ts:417-417`
- **filePath** — File path for entities `graph-storage-libsql.ts:281-281`
- **findRelationships** — Finds relationships `graph-adapter.ts:458-459`
- **fromId** — Extracts the fromId from a relationship object `batch-operations-libsql.ts:80-80`
- **fromId** — Extracts the 'fromId' property from a relationship object `batch-operations-libsql.ts:84-84`
- **gcDeleted** — Indicates whether the graph has been garbage collected `graph-adapter.ts:752-752`
- **generationManager** — Manager for generating entities `graph-adapter.ts:105-105`
- **getAllEntities** — Retrieves all entities `graph-adapter.ts:426-426`
- **getAllIndexedFiles** — Returns a list of all files that are indexed `graph-adapter.ts:471-471`
- **getAllRelationships** — Retrieves all relationships `graph-adapter.ts:461-461`
- **getEmbedding** — Retrieves a specific embedding from the database `graph-adapter.ts:496-496`
- **getEmbeddingCount** — Gets the count of embeddings in the database `graph-adapter.ts:500-500`
- **getEmbeddingFromCache** — Retrieves an embedding from the cache `graph-adapter.ts:508-509`
- **getEmbeddingsFromCache** — Retrieves multiple embeddings from the cache `graph-adapter.ts:510-511`
- **getEntitiesBatch** — Retrieves entities in batches `graph-adapter.ts:410-410`
- **getEntity** — Retrieves an entity `graph-adapter.ts:409-409`
- **getEntityIdsByFilePath** — Retrieves entity IDs by file path `graph-adapter.ts:424-424`
- **getExistingEmbeddingIds** — Retrieves the IDs of existing embeddings `graph-adapter.ts:502-502`
- **getFileInfo** — Retrieves information about a specific file `graph-adapter.ts:469-469`
- **getIncrementalTrackingInfo** — Retrieves incremental tracking information `graph-adapter.ts:529-533`
- **getOutdatedFiles** — Identifies files that are outdated based on certain criteria `graph-adapter.ts:470-470`
- **getRelationshipsForEntity** — Retrieves relationships for an entity `graph-adapter.ts:456-457`
- **getStats** — Retrieves statistics `graph-adapter.ts:553-558`
- **getTotalStats** — Retrieves total statistics `graph-adapter.ts:559-564`
- **getTraceUsageCount** — Gets the count of trace usages `graph-adapter.ts:473-473`
- **graph** — A database client for managing entities, relationships, and other graph-related data `multi-db-manager.ts:22-22`
- **graph** — Represents a NativeSQLiteClient instance for graph operations `multi-db-manager.ts:77-77`
- **hitRate** — Rate of cache hits `cache-manager.ts:128-128`
- **hits** — Counter for cache hits `cache-manager.ts:126-126`
- **id** — Represents the unique identifier of an entity `batch-operations-libsql.ts:222-222`
- **incrementalChangesCount** — Counts the number of incremental changes `graph-adapter.ts:531-531`
- **incrementalChangesCount** — Tracks the count of incremental changes made to the graph `graph-storage-libsql.ts:673-673`
- **incrementTraceUsageCount** — Increments the count of trace usages `graph-adapter.ts:474-474`
- **insertEmbedding** — Inserts a single embedding into the database `graph-adapter.ts:481-481`
- **insertEmbeddingBatch** — Inserts multiple embeddings into the database `graph-adapter.ts:483-484`
- **insertEntities** — Inserts multiple entities `graph-adapter.ts:408-408`
- **insertEntity** — Inserts an entity `graph-adapter.ts:407-407`
- **insertRelationship** — Inserts a relationship `graph-adapter.ts:452-453`
- **insertRelationships** — Inserts multiple relationships `graph-adapter.ts:454-455`
- **inTransaction** — Indicates whether the database is in a transaction `bun-sqlite-adapter.ts:45-45`, `sqlite-adapter.ts:42-42`
- **isInitialized** — Boolean indicating whether the graph adapter is initialized `graph-adapter.ts:84-84`
- **item** — Represents an individual item in a batch operation `batch-operations-libsql.ts:151-151`
- **item** — Stores an item in an array of errors `batch-operations-libsql.ts:248-248`
- **item** — Stores an item in an array of error objects `batch-operations-libsql.ts:295-295`
- **key** — Represents a key in the cache `cache-manager.ts:145-145`
- **lastFullIndexAt** — Returns the timestamp of the last full index `graph-adapter.ts:530-530`
- **lastFullIndexAt** — Stores the timestamp of the last full index operation `graph-storage-libsql.ts:672-672`
- **lastIndexedAt** — Returns the timestamp of the last index `graph-adapter.ts:542-542`
- **lastIndexedAt** — Stores the timestamp of the last index operation `graph-storage-libsql.ts:698-698`
- **lastInsertRowid** — Last row ID inserted by the query `bun-sqlite-adapter.ts:24-24`
- **lastInsertRowid** — Last inserted rowid as a bigint or undefined `native-sqlite-client.ts:29-29`
- **lastInsertRowid** — The rowid of the last inserted row `sqlite-adapter.ts:30-30`
- **lastInsertRowid** — Returns the rowid of the last inserted row `sqlite-adapter.ts:82-82`
- **limit** — Sets a limit for operations `graph-adapter.ts:418-418`
- **limit** — Limit for query results `graph-storage-libsql.ts:282-282`
- **listBranches** — Lists all branches `graph-adapter.ts:547-547`
- **listProjects** — Lists all projects `graph-adapter.ts:537-546`
- **matched** — Entities that match a certain condition `graph-storage-libsql.ts:247-247`
- **maxEntries** — Maximum number of entries in the cache `cache-manager.ts:12-12`
- **maxSize** — Maximum size of the cache in bytes `cache-manager.ts:11-11`
- **maxSize** — Returns the maximum size of the graph adapter `graph-adapter.ts:705-705`
- **maxSize** — Represents the maximum size of the search result `graph-adapter.ts:706-706`
- **maxSize** — Represents the maximum size the graph can have `graph-adapter.ts:707-707`
- **memory** — Specifies if the database is in memory `sqlite-adapter.ts:46-46`
- **memoryUsage** — Not explicitly defined in the provided code `cache-manager.ts:131-131`
- **metadata** — Represents metadata in the graph adapter `graph-adapter.ts:707-707`
- **metadataOps** — Operations for metadata `graph-adapter.ts:103-103`
- **misses** — Counter for cache misses `cache-manager.ts:127-127`
- **model** — Represents a model used for embeddings `graph-adapter.ts:519-519`
- **mutexes** — Initializes a set of DbWriteMutex instances for different database operations `multi-db-manager.ts:89-94`
- **name** — Mutex name for diagnostics `db-write-mutex.ts:17-17`
- **name** — Stores the name of the database `sqlite-adapter.ts:48-48`
- **namePattern** — Defines a name pattern `graph-adapter.ts:415-415`
- **namePattern** — A pattern for entity names `graph-storage-libsql.ts:279-279`
- **open** — Indicates if the database is open `sqlite-adapter.ts:49-49`
- **paths** — Stores a reference to MultiDbPaths or null `multi-db-manager.ts:96-96`
- **projectHash** — Returns the hash of a project `graph-adapter.ts:539-539`
- **projectHash** — Represents the hash of a project in the graph storage `graph-storage-libsql.ts:695-695`
- **projectPath** — Returns the path of a project `graph-adapter.ts:541-541`
- **projectPath** — Represents the path of a project in the graph storage `graph-storage-libsql.ts:697-697`
- **pruned** — Indicates whether the graph has been pruned `graph-adapter.ts:752-752`
- **readonly** — Not applicable in this context `bun-sqlite-adapter.ts:17-17`
- **readonly** — Read-only flag for the database connection `native-sqlite-client.ts:47-47`
- **readonly** — Determines if the database is read-only `sqlite-adapter.ts:47-47`
- **readwrite** — Not applicable in this context `bun-sqlite-adapter.ts:19-19`
- **rebuildVectorIndex** — Rebuilds a vector index in the database `graph-adapter.ts:488-488`
- **recordIncrementalChanges** — Records incremental changes `graph-adapter.ts:534-535`
- **relationshipOps** — Operations for relationships `graph-adapter.ts:100-100`
- **resetIncrementalTracking** — Resets incremental tracking `graph-adapter.ts:536-536`
- **rows** — Array of rows from the result set `native-sqlite-client.ts:27-27`
- **rowsAffected** — Number of rows affected by the executed statement `native-sqlite-client.ts:28-28`
- **schemaManager** — Manager for schema operations `graph-adapter.ts:106-106`
- **search** — Searches for entities or relationships in the graph adapter `graph-adapter.ts:706-706`
- **searchCache** — Cache for storing search results `graph-adapter.ts:96-96`
- **searchEntities** — Searches for entities `graph-adapter.ts:414-419`
- **searchEntitiesInDirectory** — Searches for entities in a specified directory `graph-adapter.ts:420-421`
- **searchVectors** — Searches for vectors based on certain criteria `graph-adapter.ts:493-494`
- **semantic** — A database client for managing semantic data such as cooccurrence and term frequency `multi-db-manager.ts:23-23`
- **semantic** — Represents a NativeSQLiteClient instance for semantic operations `multi-db-manager.ts:78-78`
- **setEmbeddingInCache** — Sets an embedding in the cache `graph-adapter.ts:512-517`
- **setEmbeddingsInCache** — Sets multiple embeddings in the cache `graph-adapter.ts:518-520`
- **simple** — Executes a simple SQL statement `sqlite-adapter.ts:224-224`
- **simple** — Boolean indicating whether the pragma is simple `sqlite-adapter.ts:40-40`
- **size** — Method to get the size of the cache `cache-manager.ts:125-125`
- **size** — Returns the size of the graph adapter `graph-adapter.ts:705-705`
- **size** — Represents the size of the search result `graph-adapter.ts:706-706`
- **size** — Represents the current size of the graph `graph-adapter.ts:707-707`
- **source** — Represents the SQL query string for the statement `sqlite-adapter.ts:25-25`
- **sql** — SQL statement or object with sql and args `native-sqlite-client.ts:33-33`
- **sql** — Executes a SQL statement or a prepared statement with arguments, returning a ResultSet `native-sqlite-client.ts:56-56`
- **sql** — Executes a SQL statement or a prepared statement with arguments, returning an IterableIterator of rows `native-sqlite-client.ts:92-92`
- **stmtCache** — Map of prepared statements `native-sqlite-client.ts:44-44`
- **store** — LRUCache instance for storing cache entries `cache-manager.ts:58-58`
- **textPreview** — Provides a text preview of content `graph-adapter.ts:519-519`
- **timeout** — Timeout for database operations `sqlite-adapter.ts:64-64`
- **toId** — Extracts the toId from a relationship object `batch-operations-libsql.ts:80-80`
- **toId** — Extracts the 'toId' property from a relationship object `batch-operations-libsql.ts:84-84`
- **tokens** — Represents tokens `graph-adapter.ts:443-443`
- **tokens** — Represents tokens in the graph `graph-storage-libsql.ts:534-534`
- **totalEmbeddings** — Returns the total number of embeddings `graph-adapter.ts:557-557`
- **totalEmbeddings** — Represents the total number of embeddings stored `graph-adapter.ts:563-563`
- **totalEntities** — Returns the total number of entities `graph-adapter.ts:554-554`
- **totalEntities** — Represents the total number of entities `graph-adapter.ts:560-560`
- **totalEntities** — Represents the total number of entities in the graph storage `graph-storage-libsql.ts:651-651`
- **totalFiles** — Returns the total number of files `graph-adapter.ts:532-532`
- **totalFiles** — Represents the total number of files `graph-adapter.ts:556-556`
- **totalFiles** — Represents the total number of files in the graph `graph-adapter.ts:562-562`
- **totalFiles** — Represents the total number of files in the graph storage `graph-storage-libsql.ts:651-651`, `graph-storage-libsql.ts:674-674`
- **totalRelationships** — Returns the total number of relationships `graph-adapter.ts:555-555`
- **totalRelationships** — Represents the total number of relationships `graph-adapter.ts:561-561`
- **totalRelationships** — Represents the total number of relationships in the graph storage `graph-storage-libsql.ts:651-651`
- **type** — Extracts the type from a relationship object `batch-operations-libsql.ts:80-80`
- **type** — Represents the type of an entity in the database `batch-operations-libsql.ts:84-84`
- **types** — Defines types `graph-adapter.ts:416-416`
- **types** — Types of entities `graph-storage-libsql.ts:280-280`
- **updateFileInfo** — Updates file information `graph-adapter.ts:467-467`
- **updateProjectMetadata** — Updates metadata for a project `graph-adapter.ts:527-528`
- **value** — Represents a value in the cache `cache-manager.ts:145-145`
- **vectorOps** — Operations for vector embeddings `graph-adapter.ts:101-101`
- **verbose** — Function to log verbose messages `sqlite-adapter.ts:65-65`
- **versioning** — A database client for managing versioning data such as graph commits and branch heads `multi-db-manager.ts:24-24`
- **versioning** — Represents a NativeSQLiteClient instance for versioning operations `multi-db-manager.ts:79-79`
- **versioningOps** — Operations for versioning `graph-adapter.ts:107-107`

### embedded_sql
- **CREATE INDEX IF NOT EXISTS ${indexName} ON embeddings(libsql_vector_idx(${colName}, ${params})) WHER** — Constructs a SQL statement to create an index if it does not exist `graph-adapter.ts:395-395`
- **DELETE FROM cooccurrence** — Executes a DELETE statement to remove all cooccurrence records from the semantic database `multi-db-manager.ts:265-265`
- **DELETE FROM entities** — Executes a DELETE statement to remove all entities from the graph database `multi-db-manager.ts:254-254`
- **DELETE FROM files** — Executes a DELETE statement to remove all files from the graph database `multi-db-manager.ts:255-255`
- **DELETE FROM name_tokens** — Executes a DELETE statement to remove all name tokens from the graph database `multi-db-manager.ts:257-257`
- **DELETE FROM project_metadata** — Executes a DELETE statement to remove all project metadata from the graph database `multi-db-manager.ts:256-256`
- **DELETE FROM query_cache** — Executes a DELETE statement to remove all query cache records from the cache database `multi-db-manager.ts:274-274`
- **DELETE FROM relationships** — Executes a DELETE statement to remove all relationships from the graph database `multi-db-manager.ts:253-253`
- **DELETE FROM term_frequency** — Executes a DELETE statement to remove all term frequency records from the semantic database `multi-db-manager.ts:266-266`
- **DELETE FROM tombstones WHERE entity_id = ? AND project_hash = ? AND branch_name = ? AND entity_type =** — Executes a SQL query to delete tombstones based on entity_id, project_hash, branch_name, and entity_type `graph-adapter.ts:601-601`
- **DELETE FROM tombstones WHERE project_hash = ? AND branch_name = ?** — Executes a SQL query to delete tombstones based on project_hash and branch_name `graph-adapter.ts:635-635`
- **SELECT 1 FROM tombstones WHERE entity_id = ? AND project_hash = ? AND branch_name = ? AND entity_typ** — Executes a SQL query to check if tombstones exist based on entity_id, project_hash, branch_name, and entity_type `graph-adapter.ts:611-611`
- **SELECT entity_id FROM tombstones WHERE project_hash = ? AND branch_name = ? AND entity_type = ?** — Executes a SQL query to select entity_ids from tombstones based on project_hash, branch_name, and entity_type `graph-adapter.ts:623-623`
- **SELECT name FROM sqlite_master WHERE type='index' AND name=?** — Executes a SQL query to select index names from the sqlite_master table `graph-adapter.ts:382-382`

## Configuration & Constants

| Config | Default | Purpose |
|--------|---------|---------|
| `metric` | `"cosine"` | Vector similarity metric (cosine, l2, ip) |
| `dimensions` | `768` | Vector embedding dimensions |
| `compression` | none | Optional compression (float8, float16) |
| `efConstruction` | `200` | DiskANN build quality (higher = better recall, slower) |
| `insertL` | `30` | DiskANN build quality |
| `maxNeighbors` | `12` | Max DiskANN neighbors per node |
| `embeddingCache.max` | `5000` | Max cached embeddings (TTL: 10 min) |
| `searchCache.max` | `500` | Max cached search results (TTL: 2 min) |
| `metadataCache.max` | `10000` | Max cached metadata entries (TTL: 5 min) |
| `cacheManager.maxSize` | `100MB` | Query cache max memory |
| `cacheManager.maxEntries` | `2000` | Query cache max entries |
| `cacheManager.defaultTTL` | `300000` | Query cache default TTL (5 min) |

## Behavioral Properties

| Property | Value |
|----------|-------|
| Async model | Fully async (265+ await sites); sync only in Bun-only sqlite-adapter |
| Thread safety | Single-user mode; sequential batch (batchConcurrency: 1) |
| Idempotency | INSERT OR REPLACE with xxHash stable IDs; composite key dedup |
| Statefulness | Singleton factory; mutable project context; LRU cache state |
| Side effects | Cache invalidation on writes; tombstones on branch deletes; reverse relationship auto-gen |
| Initialization | Mutex-protected singleton; auto-recovery on corruption |

## Error Handling

The module uses `DatabaseCorruptionError` for detecting and recovering from SQLite corruption. Factory-level recovery auto-deletes corrupt DB files and reinitializes. CBOR decoding falls back to JSON for legacy data.

| Error | When | Recovery |
|-------|------|----------|
| `DatabaseCorruptionError` | SQLITE_CORRUPT, malformed, disk full | Auto-delete DB + lock files, reinitialize once |
| Client not initialized | Operations called before init | Throw to caller; prevented by singleton pattern |
| CBOR decode failure | Legacy JSON metadata in CBOR column | Silent fallback to JSON.parse |
| Integrity check failure | Page corruption detected in probe queries | Throws to trigger corruption handler |
| Lock file removal | Stale -wal/-shm/-journal files | Log warning, continue (ENOENT is OK) |

## Observability

| Event | Level | When |
|-------|-------|------|
| `[STORAGEFACT] creating_singleton` | info | Factory creates new instance |
| `[LIBSQLADAPT] init_complete` | info | Adapter initialized with DB path |
| `[LIBSQLADAPT] integrity_passed` | info | Quick integrity check succeeded |
| `[LIBSQLADAPT] corruption_detected` | error | SQLITE_CORRUPT found during init |
| `[STORAGE] insertEntities` | trace | Batch entity insert with count and ms |
| `[CACHEMGR] cache_hit` | debug | Query cache hit with key |
| `[CACHEMGR] pruned_stale` | info | Stale cache entries removed |
| `[BATCHOPS] context_set` | info | Batch operations context updated |

## Known Limitations

1. **Single-user mode** -- no inter-process locking; not designed for concurrent multi-process access
2. **DiskANN rebuild** -- must rebuild index on large bulk inserts (performance hit)
3. **Tombstone filtering** -- branch deletes create tombstones rather than true deletes; filtering at operation layer
4. **Conservative cache invalidation** -- search cache cleared on any write, no fine-grained invalidation
5. **Sequential batches** -- batchConcurrency: 1 for safety with native SQLite transactions
6. **Fixed dimensions** -- only [384, 768, 1024, 4096] supported; no automatic conversion
7. **Unbounded history** -- Prolly Tree stores all versions; no built-in pruning of old commits
8. **Global singleton context** -- must call setGlobalProjectContext() before switching projects
9. **CBOR type limits** -- Symbols and BigInt not serializable; fallback to JSON possible
10. **Dual runtime** -- sqlite-adapter.ts supports both Bun (bun:sqlite) and Node.js (better-sqlite3)

## TypeScript Notes

### Event Map

Reverse relationship map in LibSQLGraphAdapter:

| Forward | Reverse |
|---------|---------|
| `CALLS` | `CALLED_BY` |
| `IMPORTS` | `IMPORTED_BY` |
| `REFERENCES` | `REFERENCED_BY` |
| `EXTENDS` | `EXTENDED_BY` |
| `IMPLEMENTS` | `IMPLEMENTED_BY` |

One-directional types (EXPORTS, CONTAINS, DEPENDS_ON, MEMBER_OF, DOCUMENTS, DISPATCHES_ACTION, etc.) have no reverse.

### Module Boundary

- **Public**: `graph-storage-factory.ts` (singleton API), `graph-storage-libsql.ts` (GraphStorage interface), `cache-manager.ts`
- **Semi-public**: `libsql-graph-adapter.ts` (used by tools), `prolly/index.ts` (versioning API)
- **Private**: `libsql/*-ops.ts` (internal operation delegates, not exported from module)

Delegate pattern via function types for dependency injection:

```typescript
type ClientGetter = () => Client | null;
type ContextGetter = () => ProjectContext;
type MetadataEncoder = (metadata) => Buffer | null;
type MetadataDecoder = (data) => Record<string, unknown> | undefined;
```

## Unified Storage Tables

| Table | Description |
|-------|-------------|
| `entities` | Code entities (functions, classes, methods) with composite PK |
| `relationships` | Relationships between entities (calls, imports, extends) |
| `files` | File metadata (hash, last_indexed, entity_count) |
| `embeddings` | Vector embeddings with F32_BLOB and DiskANN index |
| `project_metadata` | Project metadata, incremental tracking |
| `query_cache` | Query result cache |
| `cooccurrence` | Term pair co-occurrence tracking |

## Usage Example

```typescript
import { getGraphStorage, configureGraphStorage, setGlobalProjectContext } from './storage/graph-storage-factory';

// Configuration (optional)
configureGraphStorage({
  dimensions: 768,
  metric: 'cosine',
  compression: 'float8'
});

// Get singleton
const storage = await getGraphStorage();

// Set project context
setGlobalProjectContext('/path/to/project', 'feature-branch');

// Entity operations
await storage.insertEntity({
  id: 'e1',
  name: 'MyClass',
  type: 'class',
  filePath: 'src/my-class.ts',
  location: { start: { line: 1, column: 0 }, end: { line: 50, column: 1 } }
});

const entities = await storage.searchEntities({
  namePattern: 'My',
  types: ['class', 'interface'],
  limit: 100
});

// Vector operations (via adapter)
const adapter = storage.getAdapter();
await adapter.insertEmbedding({
  id: 'emb1',
  content: 'function calculateTotal(items)',
  vector: new Float32Array(768),
  metadata: { entityId: 'e1', type: 'function' }
});

const similar = await adapter.searchVectors(queryVector, 10);
```

## Entity Reference

### Classes

| Entity | Location | Description |
|--------|----------|-------------|
| `MultiDbManager` | `multi-db-manager.ts:48-196` | Manages lifecycle and access to multiple SQLite database connections (graph, semantic, versioning, cache) with atomic initialization and cleanup. |
| `NativeSQLiteClient` | `native-sqlite-client.ts:42-163` | Unified SQLite client wrapper supporting both Bun (bun:sqlite) and Node.js (better-sqlite3) runtimes with prepared statement caching. |

### Interfaces & Types

| Entity | Location | Description |
|--------|----------|-------------|
| `BunSQLiteOptions` | `bun-sqlite-adapter.ts:18-18` | Configuration options for Bun's native SQLite database including filename and optional parameters. |
| `BunSQLiteRunResult` | `bun-sqlite-adapter.ts:22-25` | Result object returned from Bun SQLite statement execution containing changes count and last insert row ID. |
| `BunSQLiteStatement` | `bun-sqlite-adapter.ts:31-36` | Prepared statement interface for Bun SQLite supporting parameterized queries with `.bind()` and execution methods. |
| `BunSQLiteDatabase` | `bun-sqlite-adapter.ts:41-47` | Bun's native SQLite database handle providing methods for statement preparation and transaction management. |
| `MultiDbPaths` | `multi-db-manager.ts:19-24` | Container holding file paths for all four database files (graph, semantic, versioning, cache). |
| `ResultSet` | `native-sqlite-client.ts:25-30` | Result set interface for SQLite queries containing rows array and statement metadata. |

### Functions

| Entity | Location | Description |
|--------|----------|-------------|
| `isBunRuntime` | `bun-sqlite-adapter.ts:52-59` | Detects whether the current runtime environment is Bun or Node.js. |
| `loadBunSQLite` | `bun-sqlite-adapter.ts:65-75` | Dynamically loads the Bun SQLite module with error handling for non-Bun environments. |
| `createBunDatabase` | `bun-sqlite-adapter.ts:80-83` | Creates and returns a Bun SQLite database connection with specified file path. |
| `getMultiDbPaths` | `multi-db-manager.ts:26-33` | Returns the filesystem paths for all four database files based on the provided storage directory. |

### Methods (MultiDbManager)

| Entity | Location | Description |
|--------|----------|-------------|
| `isInitialized` | `multi-db-manager.ts:59-61` | Returns whether the MultiDbManager has been initialized with database connections. |
| `initialize` | `multi-db-manager.ts:63-95` | Atomically initializes all four database connections with schema creation and integrity verification. |
| `getGraphClient` | `multi-db-manager.ts:97-99` | Returns the graph database client for code entity and relationship storage. |
| `getSemanticClient` | `multi-db-manager.ts:101-103` | Returns the semantic database client for vector embeddings. |
| `getVersioningClient` | `multi-db-manager.ts:105-107` | Returns the versioning database client for Prolly Tree commit history. |
| `getCacheClient` | `multi-db-manager.ts:103-136` | Returns the query cache database client. |
| `getPaths` | `multi-db-manager.ts:103-136` | Returns the MultiDbPaths object containing all database file paths. |
| `flushClient` | `multi-db-manager.ts:117-*` | Flushes and closes the specified database connection. |

## Prolly Tree -- Graph Versioning

```typescript
const adapter = storage.getLibSQLAdapter();
const commitHash = await adapter.createGraphCommit("Index: 42 files");

const commits = await adapter.getCommitManager().getHistory(100);

for (const commit of commits) {
  const branchDiff = await adapter.getTimeTravelManager().getDiff(commit.hash, 'main');
  console.log(`Added: ${branchDiff.added.length}, Removed: ${branchDiff.removed.length}`);
}
```

### Added Entities

- **BatchOperationsLibSQL** — `batch-operations-libsql.ts:28-401`
- **DbWriteMutex** — `db-write-mutex.ts:14-66`
- **yieldToEventLoop** — `batch-operations-libsql.ts:22-22`
- **constructor** — `batch-operations-libsql.ts:38-41`
- **setProjectContext** — `batch-operations-libsql.ts:43-47`
- **setProject** — `batch-operations-libsql.ts:49-56`
- **initialize** — `batch-operations-libsql.ts:58-60`
- **destroy** — `batch-operations-libsql.ts:62-64`
- **entityKey** — `batch-operations-libsql.ts:70-75`
- **stableEntityId** — `batch-operations-libsql.ts:77-83`
- **relationshipKey** — `batch-operations-libsql.ts:85-87`
- **stableRelationshipId** — `batch-operations-libsql.ts:89-95`
- **generateReverseRelationships** — `batch-operations-libsql.ts:102-148`
- **insertEntities** — `batch-operations-libsql.ts:154-227`
- **updateEntities** — `batch-operations-libsql.ts:229-249`
- **deleteEntities** — `batch-operations-libsql.ts:251-293`
- **insertRelationships** — `batch-operations-libsql.ts:299-382`
- **optimizeBatchSize** — `batch-operations-libsql.ts:388-396`
- **getBatchSize** — `batch-operations-libsql.ts:398-400`
- **constructor** — `db-write-mutex.ts:19-21`
- **run** — `db-write-mutex.ts:27-45`
- **drain** — `db-write-mutex.ts:52-55`
- **queueDepth** — `db-write-mutex.ts:58-60`
- **label** — `db-write-mutex.ts:63-65`
- **DEFAULT_BATCH_SIZE** — `batch-operations-libsql.ts:17-17`
- **MAX_BATCH_SIZE** — `batch-operations-libsql.ts:18-18`
- **ID_LENGTH** — `batch-operations-libsql.ts:19-19`
- **resolvedBranch** — `batch-operations-libsql.ts:51-51`
- **isGlobal** — `batch-operations-libsql.ts:71-71`
- **key** — `batch-operations-libsql.ts:81-81`
- **key** — `batch-operations-libsql.ts:93-93`
- **reverseMap** — `batch-operations-libsql.ts:103-132`
- **reverse** — `batch-operations-libsql.ts:134-134`
- **reverseType** — `batch-operations-libsql.ts:136-136`
- **start** — `batch-operations-libsql.ts:158-158`
- **errors** — `batch-operations-libsql.ts:159-159`
- **{ projectHash, branchName }** — `batch-operations-libsql.ts:162-162`
- **seen** — `batch-operations-libsql.ts:166-166`
- **uniq** — `batch-operations-libsql.ts:167-167`
- **key** — `batch-operations-libsql.ts:169-169`
- **batchCount** — `batch-operations-libsql.ts:177-177`
- **batch** — `batch-operations-libsql.ts:179-179`
- **batchNum** — `batch-operations-libsql.ts:180-180`
- **entitiesWithIds** — `batch-operations-libsql.ts:184-192`
- **now** — `batch-operations-libsql.ts:185-185`
- **result** — `batch-operations-libsql.ts:195-195`
- **entities** — `batch-operations-libsql.ts:234-245`
- **start** — `batch-operations-libsql.ts:255-255`
- **errors** — `batch-operations-libsql.ts:256-256`
- **ids** — `batch-operations-libsql.ts:260-263`
- **batch** — `batch-operations-libsql.ts:266-266`
- **start** — `batch-operations-libsql.ts:303-303`
- **errors** — `batch-operations-libsql.ts:304-304`
- **{ projectHash, branchName }** — `batch-operations-libsql.ts:307-307`
- **reverseRels** — `batch-operations-libsql.ts:310-310`
- **allRelationships** — `batch-operations-libsql.ts:311-311`
- **seen** — `batch-operations-libsql.ts:321-321`
- **uniq** — `batch-operations-libsql.ts:322-322`
- **key** — `batch-operations-libsql.ts:324-324`
- **batchCount** — `batch-operations-libsql.ts:332-332`
- **batch** — `batch-operations-libsql.ts:334-334`
- **batchNum** — `batch-operations-libsql.ts:335-335`
- **relsWithIds** — `batch-operations-libsql.ts:339-346`
- **now** — `batch-operations-libsql.ts:340-340`
- **result** — `batch-operations-libsql.ts:349-349`
- **nextLink** — `db-write-mutex.ts:30-32`
- **prevLink** — `db-write-mutex.ts:33-33`
- **totalProcessed** — `batch-operations-libsql.ts:160-160`
- **i** — `batch-operations-libsql.ts:178-178`
- **totalProcessed** — `batch-operations-libsql.ts:257-257`
- **i** — `batch-operations-libsql.ts:265-265`
- **totalProcessed** — `batch-operations-libsql.ts:305-305`
- **i** — `batch-operations-libsql.ts:333-333`
- **releaseLock** — `db-write-mutex.ts:29-29`
