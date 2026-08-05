# Layered

## 🤖 Overview

The `layered` module provides a three-layer indexing system for managing symbol/entity changes across branches and clients. It includes a `BranchDelta` class for tracking changes relative to the base branch, a `DeltaMaintenanceService` for optimizing and cleaning up deltas, and a public API for interacting with the layered index. This module is used by developers and data engineers to efficiently manage and query indexed data.

## 🤖 Architecture

```
Layered Indexing
├── Layer 0 (Base): Main branch entities, shared, immutable
├── Layer 1 (Branch Deltas): Per-branch changes, shared, mostly immutable
└── Layer 2 (Working Deltas): Per-client uncommitted changes [FUTURE]
```

## 🤖 Flow

```
Layered Indexing Flow
├── BranchDelta: Track changes relative to base branch
├── DeltaMaintenanceService: Optimize and clean up deltas
└── LayeredIndexManager: Manage and query indexed data
```

## 🤖 Entity Listing

### Function
- **branches** — Represents branches in the repository `git-delta-computer.ts:463-467`, `git-delta-computer.ts:469-469`
- **deserializeVectorMap** — Deserializes a BLOB into a map of string to Float32Array `vector-cache-manager.ts:100-131`
- **embeddings** — Stores embeddings for vectors `layered-vector-store.ts:456-462`
- **entityIds** — Stores entity IDs for tracking changes `git-delta-computer.ts:257-257`
- **entityIds** — Retrieves the IDs of entities in the working delta `layered-graph-index.ts:763-763`, `layered-graph-index.ts:794-794`
- **events** — Stores events related to file changes, branch switches, and commits `file-change-integration.ts:281-286`
- **isBunRuntime** — Checks if the runtime is Bun `delta-maintenance-service.ts:34-36`
- **serializeVectorMap** — Serializes a map of string to Float32Array into a BLOB `vector-cache-manager.ts:70-95`

### Method
- **addVector** — Adds a single vector to the store `layered-vector-store.ts:420-444`
- **addVector** — Adds a new vector to the delta `vector-delta.ts:156-163`
- **addVectorsBatch** — Adds multiple vectors to the store in a batch `layered-vector-store.ts:452-476`
- **addVectorsBatch** — Adds multiple vectors to the delta `vector-delta.ts:205-209`
- **applyBranchDelta** — Applies a branch delta to the base store `layered-vector-store.ts:318-363`
- **applyToEntities** — Applies the delta to base entity results `branch-delta.ts:59-84`
- **applyToRelationships** — Applies the delta to base relationship results `branch-delta.ts:92-117`
- **applyToVectors** — Applies this delta to base vector results `vector-delta.ts:58-83`
- **applyWorkingDeltaToEntities** — Applies working deltas to entities in the index `layered-graph-index.ts:854-887`
- **applyWorkingDeltaToRelationships** — Applies working deltas to relationships in the index `layered-graph-index.ts:892-918`
- **buildFromDirectory** — Builds the index from a directory `layered-graph-index.ts:131-152`
- **cleanupOrphanedDeltas** — Removes deltas for deleted branches `delta-maintenance-service.ts:374-393`
- **clear** — Clears the delta `branch-delta.ts:201-211`
- **clear** — Clears all pending changes from the queue `incremental-update-queue.ts:352-366`
- **clear** — Clears all vectors from the delta `vector-delta.ts:218-224`
- **clearAllWorkingDeltasForClient** — Clears all working deltas for a given client `layered-graph-index.ts:412-420`
- **clearAllWorkingDeltasForClient** — Clears all working deltas for a client `layered-index-manager.ts:391-393`
- **clearWorkingDelta** — Clears the working delta for a given client `layered-graph-index.ts:390-393`
- **clone** — Clones the delta `branch-delta.ts:217-233`
- **clone** — Creates a clone of the delta `vector-delta.ts:229-245`
- **close** — Closes the database connection `layered-cache-manager.ts:453-459`
- **close** — Closes the SQLite database connection `vector-cache-manager.ts:558-564`
- **compact** — Compacts the database to free up space `layered-cache-manager.ts:404-415`
- **compact** — Compresses vector deltas for efficient storage `vector-cache-manager.ts:464-475`
- **compactBranchDelta** — Compacts branch deltas `delta-maintenance-service.ts:328-369`
- **compactDatabases** — Reduces memory usage for large deltas `delta-maintenance-service.ts:426-438`
- **compactLargeDeltas** — Compacts large deltas `delta-maintenance-service.ts:275-317`
- **computeDeltaFromGitDiff** — Computes the delta between two branches using git diff `git-delta-computer.ts:56-80`
- **constructor** — Initializes a new BranchDelta instance `branch-delta.ts:26-32`
- **constructor** — Initializes the DeltaMaintenanceService `delta-maintenance-service.ts:143-172`
- **constructor** — Constructor for initializing FileChangeIntegration with GitWatcher, updateQueue, and layeredIndex `file-change-integration.ts:79-107`
- **constructor** — Initializes the GitDeltaComputer with branch manager, base index, and optional working directory `git-delta-computer.ts:33-37`
- **constructor** — Initializes the incremental update queue `incremental-update-queue.ts:105-126`
- **constructor** — Initializes the LayeredCacheManager with a working directory `layered-cache-manager.ts:64-91`
- **constructor** — Initializes the LayeredGraphIndex instance `layered-graph-index.ts:91-122`
- **constructor** — Initializes the layered index manager with configuration `layered-index-manager.ts:157-199`
- **constructor** — Initializes the layered vector store with base store, configuration, and optional working directory `layered-vector-store.ts:64-89`
- **constructor** — Initializes the VectorCacheManager with necessary parameters `vector-cache-manager.ts:151-178`
- **constructor** — Initializes a new VectorDelta instance `vector-delta.ts:33-37`
- **convertFileChangesToEvents** — Converts file change data into events for the IncrementalUpdateQueue `file-change-integration.ts:305-312`
- **convertParsedEntitiesToEntities** — Converts parsed entities to a different format `git-delta-computer.ts:343-371`
- **convertParsedEntitiesToEntities** — Converts parsed entities to the entity format `layered-graph-index.ts:691-729`
- **deleteBranchDelta** — Deletes a branch delta from the database `layered-cache-manager.ts:249-269`
- **deleteBranchDelta** — Deletes a branch delta `layered-graph-index.ts:345-353`
- **deleteBranchDelta** — Deletes a branch delta for the layered index `layered-index-manager.ts:368-375`
- **deleteOldDeltas** — Deletes deltas that are no longer needed `delta-maintenance-service.ts:398-421`
- **deleteOldDeltas** — Deletes branch deltas older than a specified timestamp `layered-cache-manager.ts:420-444`
- **deleteOldDeltas** — Removes outdated vector deltas from the database `vector-cache-manager.ts:480-501`
- **deleteVector** — Deletes a vector from the store `layered-vector-store.ts:484-500`
- **deleteVector** — Deletes a vector from the delta `vector-delta.ts:190-198`
- **deleteVectorDelta** — Deletes a vector delta from the database `vector-cache-manager.ts:358-378`
- **deserializeDelta** — Deserializes a branch delta from a string `layered-cache-manager.ts:322-353`
- **enqueue** — Adds a file change event to the queue `incremental-update-queue.ts:137-154`
- **enqueueBatch** — Adds a batch of file change events to the queue `incremental-update-queue.ts:161-176`
- **ensureBranchDelta** — Ensures a branch delta is present `layered-graph-index.ts:270-310`
- **entitiesExistInBaseBatch** — Checks if entities exist in the base batch `git-delta-computer.ts:404-412`, `layered-graph-index.ts:822-831`
- **extractEntitiesFromFile** — Extracts entities from a file `git-delta-computer.ts:308-334`, `layered-graph-index.ts:659-686`
- **flush** — Flushes the queue to process pending changes `incremental-update-queue.ts:335-347`
- **forceCleanupOrphaned** — Forces cleanup of orphaned deltas `delta-maintenance-service.ts:462-466`
- **forceCompactAll** — Forces compaction of all deltas `delta-maintenance-service.ts:447-457`
- **fromJSON** — Converts JSON to delta `branch-delta.ts:281-330`
- **fromJSON** — Converts JSON to a delta `vector-delta.ts:309-353`
- **generateDeltaEmbeddings** — Generates embeddings for delta vectors `layered-vector-store.ts:225-266`
- **generateEntityHash** — Generates a hash for an entity `git-delta-computer.ts:384-392`
- **generateEntityId** — Generates a unique identifier for an entity `git-delta-computer.ts:376-379`
- **getAllBranches** — Retrieves all branches in the repository `git-delta-computer.ts:452-476`
- **getBranchDelta** — Retrieves a branch delta `layered-graph-index.ts:312-330`
- **getCachedBranches** — Retrieves cached branches from the database `layered-cache-manager.ts:274-292`, `vector-cache-manager.ts:383-401`
- **getCachedBranches** — Retrieves cached branches `layered-graph-index.ts:355-374`
- **getCachedBranches** — Retrieves cached branches for the layered index `layered-index-manager.ts:359-361`
- **getCommitSha** — Retrieves the commit SHA for a given branch `git-delta-computer.ts:148-162`
- **getConfig** — Retrieves the configuration for the layered graph index `layered-graph-index.ts:517-519`
- **getConfigPresetName** — Retrieves the name of the selected configuration preset `layered-index-manager.ts:518-525`
- **getCurrentBranch** — Returns the current branch name `file-change-integration.ts:347-349`
- **getCurrentBranch** — Gets the current branch name `git-delta-computer.ts:445-447`
- **getDeltaInfo** — Retrieves information about a specific vector delta `vector-cache-manager.ts:506-549`
- **getDimension** — Gets the dimension of the vectors `vector-delta.ts:272-284`
- **getEntitiesByFilePath** — Retrieves entities by file path `git-delta-computer.ts:420-428`, `layered-graph-index.ts:836-849`
- **getFileStats** — Retrieves file statistics `git-delta-computer.ts:481-512`
- **getGitDiff** — Retrieves the git diff between two branches `git-delta-computer.ts:89-124`
- **getMemoryUsage** — Gets the memory usage of the delta `vector-delta.ts:250-267`
- **getMergeBase** — Finds the merge base commit between two branches `git-delta-computer.ts:129-143`
- **getPendingFiles** — Returns the pending file change events `incremental-update-queue.ts:390-392`
- **getStatistics** — Retrieves statistics about the database `layered-cache-manager.ts:362-399`
- **getStatistics** — Retrieves statistics about the vector cache `vector-cache-manager.ts:410-459`
- **getStats** — Retrieves maintenance statistics `delta-maintenance-service.ts:475-477`
- **getStats** — Retrieves the current statistics for file changes, branch switches, and commits `file-change-integration.ts:328-330`
- **getStatus** — Retrieves the current status of the queue `incremental-update-queue.ts:375-385`
- **getStatus** — Gets the current status of the layered index manager `layered-index-manager.ts:409-420`
- **getStatusReport** — Generates a status report for maintenance tasks `delta-maintenance-service.ts:496-512`
- **getStatusReport** — Gets a detailed status report of the layered index manager `layered-index-manager.ts:425-440`
- **getSummary** — Returns the total number of changes in the branch delta `branch-delta.ts:339-344`
- **getSummary** — Returns the total number of vector changes `vector-delta.ts:362-371`
- **getTotalEntities** — Returns the total number of entities `layered-graph-index.ts:159-166`
- **getVector** — Retrieves a vector from the delta `vector-delta.ts:101-103`
- **getVectorDelta** — Retrieves a vector delta for a specified branch, caching results if available `layered-vector-store.ts:177-195`
- **getWorkingDelta** — Retrieves the working delta for a given client `layered-graph-index.ts:380-383`
- **getWorkingDelta** — Retrieves the working delta for a given branch `layered-vector-store.ts:271-274`
- **getWorkingDeltaKey** — Generates a key for the working delta `layered-graph-index.ts:422-424`
- **handleBranchChange** — Handles branch change events by updating the current branch and triggering delta recomputation `file-change-integration.ts:187-223`
- **handleCommit** — Processes commit events by updating the current branch and triggering delta recomputation `file-change-integration.ts:235-264`
- **handleFileChanges** — Converts file change events into FileChangeEvent objects for processing `file-change-integration.ts:271-292`
- **hasUncommittedChanges** — Checks if there are uncommitted changes in the working delta `layered-graph-index.ts:395-398`
- **hasUncommittedChanges** — Checks for uncommitted changes in the layered index `layered-index-manager.ts:398-400`
- **hasVector** — Checks if a vector exists in the delta `vector-delta.ts:91-93`
- **initialize** — Method to initialize the FileChangeIntegration `file-change-integration.ts:116-170`
- **initialize** — Initializes the layered graph index `layered-graph-index.ts:521-541`
- **initialize** — Initializes the layered index manager with configuration `layered-index-manager.ts:208-278`
- **initializeSchema** — Initializes the SQLite schema for branch deltas `layered-cache-manager.ts:97-130`
- **initializeSchema** — Initializes the SQLite database schema `vector-cache-manager.ts:184-217`
- **isBuilt** — Checks if the index is built `layered-graph-index.ts:154-157`
- **isEmpty** — Checks if the delta is empty `branch-delta.ts:248-250`
- **isGitRepository** — Determines if a directory is a Git repository `git-delta-computer.ts:437-440`
- **isMainBranch** — Determines if the current branch is the main branch `file-change-integration.ts:317-319`
- **isMainBranch** — Checks if the current branch is the main branch `layered-graph-index.ts:636-638`
- **isMainBranch** — Checks if a given branch is the main branch `layered-vector-store.ts:388-390`
- **loadBranchDelta** — Loads a branch delta from the database `layered-cache-manager.ts:213-244`
- **loadVectorDelta** — Loads a vector delta from the database `vector-cache-manager.ts:302-353`
- **mergeEntityDelta** — Merges entity deltas `branch-delta.ts:149-168`
- **mergeRelationshipDelta** — Merges relationship deltas `branch-delta.ts:173-192`
- **mergeWith** — Merges this delta with another delta `branch-delta.ts:132-144`, `vector-delta.ts:119-144`
- **modifyVector** — Modifies an existing vector in the delta `vector-delta.ts:171-183`
- **needsCompaction** — Determines if the delta needs compaction `branch-delta.ts:241-243`
- **onBranchDeltaEvicted** — Handles the eviction of a branch delta `layered-graph-index.ts:643-654`
- **onBranchDeltaEvicted** — Handles the eviction of a branch delta from the cache `layered-vector-store.ts:395-406`
- **parseDiffOutput** — Parses the output of the git diff command `git-delta-computer.ts:173-223`
- **prepareStatements** — Prepares all SQLite statements for branch delta operations `layered-cache-manager.ts:132-158`
- **prepareStatements** — Prepares SQL statements for database operations `vector-cache-manager.ts:219-244`
- **processAddedOrModifiedFile** — Processes added or modified files to update the delta `git-delta-computer.ts:252-269`
- **processBatch** — Processes a batch of file change events `incremental-update-queue.ts:213-296`
- **processDeletedFile** — Processes deleted files to update the delta `git-delta-computer.ts:274-282`
- **processFileChange** — Processes changes in a file to determine if it's added, modified, or deleted `git-delta-computer.ts:232-247`
- **processFileChange** — Processes a single file change event `incremental-update-queue.ts:303-326`
- **processRenamedFile** — Processes renamed files to update the delta `git-delta-computer.ts:287-293`
- **promoteWorkingDelta** — Promotes the working delta to the branch delta `layered-graph-index.ts:400-410`
- **promoteWorkingDelta** — Promotes a working delta to a branch delta `layered-index-manager.ts:384-386`
- **queryBaseEntities** — Queries entities from the base index `layered-graph-index.ts:570-607`
- **queryBaseRelationships** — Queries relationships from the base index `layered-graph-index.ts:616-631`
- **queryEntities** — Queries entities based on filters `layered-graph-index.ts:177-226`
- **queryEntities** — Queries entities in the layered index `layered-index-manager.ts:291-293`
- **queryRelationships** — Queries relationships based on filters `layered-graph-index.ts:231-261`
- **queryRelationships** — Queries relationships in the layered index `layered-index-manager.ts:303-310`
- **removeEntitiesFromFile** — Removes entities from the index based on a file `layered-graph-index.ts:464-511`
- **reRankResults** — Re-ranks search results based on layer information `layered-vector-store.ts:373-383`
- **resetDebounceTimer** — Resets the debounce timer for file change events `incremental-update-queue.ts:185-204`
- **resetStats** — Resets maintenance statistics `delta-maintenance-service.ts:482-491`
- **resetStats** — Resets the statistics for file changes, branch switches, and commits `file-change-integration.ts:335-342`
- **resetStats** — Resets the statistics tracked by the incremental update queue `incremental-update-queue.ts:397-406`
- **runMaintenance** — Runs maintenance tasks `delta-maintenance-service.ts:233-270`
- **saveBranchDelta** — Saves a branch delta to the database `layered-cache-manager.ts:167-208`
- **saveVectorDelta** — Saves a vector delta to the database `vector-cache-manager.ts:253-297`
- **searchBaseStore** — Searches the base vector store for similar vectors `layered-vector-store.ts:295-303`
- **searchSimilar** — Searches for similar entities in the layered index `layered-index-manager.ts:320-331`
- **searchSimilar** — Searches for similar vectors in a layered store, applying branch and working deltas if applicable `layered-vector-store.ts:110-165`
- **selectConfigPreset** — Selects a configuration preset for the Layered Index Manager `layered-index-manager.ts:492-513`
- **serializeDelta** — Serializes a branch delta into a string `layered-cache-manager.ts:301-317`
- **setBranchDelta** — Sets a branch delta `layered-graph-index.ts:332-343`
- **setCurrentBranch** — Sets the current branch name `file-change-integration.ts:354-356`
- **setVectorDelta** — Sets a vector delta for a specified branch, updating the cache and saving to storage if configured `layered-vector-store.ts:203-214`
- **setWorkingDelta** — Sets the working delta for a given client `layered-graph-index.ts:385-388`
- **setWorkingDelta** — Sets the working delta for a given branch `layered-vector-store.ts:279-282`
- **shutdown** — Shuts down the FileChangeIntegration instance `file-change-integration.ts:365-372`
- **shutdown** — Shuts down the incremental update queue, releasing resources and stopping any ongoing processes `incremental-update-queue.ts:415-431`
- **shutdown** — Shuts down the layered graph index `layered-graph-index.ts:543-558`
- **shutdown** — Manages the shutdown process of the Layered Index Manager `layered-index-manager.ts:449-483`
- **shutdown** — Shuts down the layered vector store `layered-vector-store.ts:509-524`
- **start** — Starts the maintenance loop `delta-maintenance-service.ts:183-210`
- **stop** — Stops the maintenance loop `delta-maintenance-service.ts:218-224`
- **switchBranch** — Switches to a different branch in the layered index `layered-index-manager.ts:342-354`
- **toJSON** — Converts the delta to JSON `branch-delta.ts:260-276`, `vector-delta.ts:295-304`
- **totalChanges** — Returns the total number of changes in the delta `branch-delta.ts:37-46`
- **totalChanges** — Calculates the total number of changes in the working delta `layered-graph-index.ts:757-759`
- **totalChanges** — Total number of vector changes `vector-delta.ts:42-44`
- **updateBranchDeltaWithEntities** — Updates the branch delta with new entities `layered-graph-index.ts:792-816`
- **updateEntitiesFromFile** — Updates entities in the index from a file `layered-graph-index.ts:430-462`
- **updateWorkingDelta** — Updates the working delta with new entities `layered-graph-index.ts:734-787`

### Class
- **BranchDelta** — Represents symbol/entity changes for a specific branch relative to base (main) `branch-delta.ts:19-345`
- **DeltaMaintenanceService** — Manages delta maintenance tasks `delta-maintenance-service.ts:122-513`
- **FileChangeIntegration** — Class for integrating GitWatcher events with IncrementalUpdateQueue for automatic indexing `file-change-integration.ts:61-373`
- **GitDeltaComputer** — Computes branch deltas from git diff by analyzing changes between branches `git-delta-computer.ts:28-513`
- **IncrementalUpdateQueue** — Manages batching and debouncing of file change events `incremental-update-queue.ts:87-432`
- **LayeredCacheManager** — Manages persistent storage of branch deltas using SQLite, with an in-memory fallback for Node.js `layered-cache-manager.ts:50-460`
- **LayeredGraphIndex** — A class implementing a layered graph index with branch awareness `layered-graph-index.ts:69-919`
- **LayeredIndexManager** — The main class for the Layered Index Manager `layered-index-manager.ts:127-526`
- **LayeredVectorStore** — Implements a three-layer semantic search vector store `layered-vector-store.ts:46-525`
- **VectorCacheManager** — Manages persistent storage of branch vector deltas using SQLite `vector-cache-manager.ts:137-565`
- **VectorDelta** — Represents embedding changes for a specific branch relative to base `vector-delta.ts:22-372`

### Interface
- **BatchProcessingResult** — Result of batch processing, including files processed, processing time, full rebuild status, and errors `incremental-update-queue.ts:62-74`
- **BranchDeltaRow** — Represents a row in the SQLite database for branch deltas, containing details about entities and relationships added, modified, or deleted `layered-cache-manager.ts:28-39`
- **BranchStatsRow** — Represents a row in the SQLite database for storing statistics about a specific branch `vector-cache-manager.ts:47-53`
- **CacheManagerStats** — Contains statistics related to the cache manager `layered-index-manager.ts:85-90`
- **CacheStatistics** — Represents statistics for cache operations `delta-maintenance-service.ts:102-107`
- **CompactionResult** — Represents the result of a delta compaction operation `delta-maintenance-service.ts:82-97`
- **DeltaMaintenanceConfig** — Configuration for delta maintenance tasks `delta-maintenance-service.ts:42-60`
- **FileChangeEvent** — An event object containing details about a file change `incremental-update-queue.ts:28-46`
- **FileChangeIntegrationConfig** — Configuration for enabling file, branch, and commit watching with max incremental files and debug logging `file-change-integration.ts:26-41`
- **GraphQuery** — Graph query object for entity search `layered-graph-index.ts:56-63`
- **GraphStorageWithExtensions** — GraphStorage with optional extension methods `layered-graph-index.ts:34-37`
- **IncrementalUpdateConfig** — Configuration for incremental updates, including debounce window, max batch size, and debug mode `incremental-update-queue.ts:48-60`
- **IndexStatus** — Represents the status of the index `layered-index-manager.ts:103-121`
- **IntegrationStats** — Interface for tracking total file changes, branch switches, commits, and last update time `file-change-integration.ts:43-55`
- **LayeredIndexManagerConfig** — Configuration object for the Layered Index Manager, specifying working directory, layered index settings, file watching, maintenance, file count estimation, and debug mode `layered-index-manager.ts:42-60`
- **LayeredSimilarityResult** — Represents a similarity result with a layer and branch information `layered-vector-store.ts:34-40`
- **MaintenanceStats** — Tracks statistics for maintenance runs `delta-maintenance-service.ts:62-80`
- **MaintenanceStats** — Interface for maintenance service statistics, including compactions run, orphans deleted, and last run time `layered-index-manager.ts:65-70`
- **ParsedEntity** — Parsed entity from IncrementalParser `layered-graph-index.ts:42-51`
- **QueueStats** — Statistics for the incremental update queue, including total batches, total files processed, total errors, and last batch time `incremental-update-queue.ts:76-81`
- **QueueStatus** — Represents the status of the update queue, including pending updates and processing batch `layered-index-manager.ts:75-80`
- **StatsRow** — Represents a row in the SQLite database for statistics, containing the total number of branches and changes `layered-cache-manager.ts:41-44`
- **StatsRow** — Represents a row in the SQLite database for storing statistics about vector deltas `vector-cache-manager.ts:41-45`
- **StatusReport** — Provides status information about maintenance tasks `delta-maintenance-service.ts:112-116`
- **StatusReport** — Provides a report of the current status of the index manager `layered-index-manager.ts:95-101`
- **VectorDeltaRow** — Represents a row in the SQLite database for storing vector deltas with metadata `vector-cache-manager.ts:29-39`

### Type_alias
- **FileChangeType** — Represents the type of file change (added, modified, deleted, renamed) `incremental-update-queue.ts:26-26`

### Import_decl
- **../core/branch-manager.js** — Imports `../core/branch-manager.js` from `../core/branch-manager.js`. `delta-maintenance-service.ts:20-20`, `git-delta-computer.ts:16-16`, `layered-graph-index.ts:16-16`, `layered-index-manager.ts:22-22`
- **../core/git-watcher.js** — Imports `../core/git-watcher.js` from `../core/git-watcher.js`. `file-change-integration.ts:17-17`, `layered-index-manager.ts:23-23`
- **../core/layered-index.js** — Imports `../core/layered-index.js` from `../core/layered-index.js`. `delta-maintenance-service.ts:21-21`, `file-change-integration.ts:18-18`, `incremental-update-queue.ts:18-18`, `layered-graph-index.ts:17-17`, `layered-vector-store.ts:20-20`
- **../logging/index.js** — Imports `../logging/index.js` from `../logging/index.js`. `delta-maintenance-service.ts:22-22`, `file-change-integration.ts:19-19`, `git-delta-computer.ts:17-17`, `incremental-update-queue.ts:19-19`, `layered-cache-manager.ts:19-19`, `layered-graph-index.ts:18-18`, `layered-index-manager.ts:24-24`, `layered-vector-store.ts:21-21`, `vector-cache-manager.ts:20-20`
- **../semantic/embedding-generator.js** — Imports `../semantic/embedding-generator.js` from `../semantic/embedding-generator.js`. `layered-vector-store.ts:22-22`
- **../semantic/vector-store.js** — Imports `../semantic/vector-store.js` from `../semantic/vector-store.js`. `layered-index-manager.ts:25-25`, `layered-vector-store.ts:23-23`
- **../storage/sqlite-adapter.js** — Imports `../storage/sqlite-adapter.js` from `../storage/sqlite-adapter.js`. `layered-cache-manager.ts:20-20`, `layered-cache-manager.ts:21-21`, `vector-cache-manager.ts:21-21`, `vector-cache-manager.ts:22-22`
- **../types/layered.js** — Imports `../types/layered.js` from `../types/layered.js`. `branch-delta.ts:11-11`, `branch-delta.ts:12-12`, `git-delta-computer.ts:18-18`, `layered-graph-index.ts:19-19`, `layered-graph-index.ts:20-20`, `layered-index-manager.ts:26-26`, `layered-index-manager.ts:27-27`, `layered-vector-store.ts:24-24`, `vector-delta.ts:16-16`
- **../types/parser.js** — Imports `../types/parser.js` from `../types/parser.js`. `git-delta-computer.ts:19-19`
- **../types/semantic.js** — Imports `../types/semantic.js` from `../types/semantic.js`. `layered-vector-store.ts:25-25`
- **../types/storage.js** — Imports `../types/storage.js` from `../types/storage.js`. `branch-delta.ts:13-13`, `git-delta-computer.ts:20-20`, `layered-graph-index.ts:21-21`, `layered-index-manager.ts:28-28`
- **../utils/fast-hash.js** — Imports `../utils/fast-hash.js` from `../utils/fast-hash.js`. `git-delta-computer.ts:21-21`, `layered-graph-index.ts:22-22`
- **../utils/runtime-detection.js** — Imports `../utils/runtime-detection.js` from `../utils/runtime-detection.js`. `incremental-update-queue.ts:20-20`
- **../utils/simd-vector-ops.js** — Imports `../utils/simd-vector-ops.js` from `../utils/simd-vector-ops.js`. `layered-vector-store.ts:26-26`
- **./branch-delta.js** — Imports `./branch-delta.js` from `./branch-delta.js`. `git-delta-computer.ts:22-22`, `layered-cache-manager.ts:22-22`, `layered-graph-index.ts:23-23`
- **./delta-maintenance-service.js** — Imports `./delta-maintenance-service.js` from `./delta-maintenance-service.js`. `layered-index-manager.ts:29-29`
- **./file-change-integration.js** — Imports `./file-change-integration.js` from `./file-change-integration.js`. `layered-index-manager.ts:30-30`
- **./git-delta-computer.js** — Imports `./git-delta-computer.js` from `./git-delta-computer.js`. `layered-graph-index.ts:24-24`, `layered-index-manager.ts:31-31`
- **./incremental-update-queue.js** — Imports `./incremental-update-queue.js` from `./incremental-update-queue.js`. `file-change-integration.ts:20-20`, `layered-index-manager.ts:32-32`
- **./layered-cache-manager.js** — Imports `./layered-cache-manager.js` from `./layered-cache-manager.js`. `delta-maintenance-service.ts:23-23`, `layered-graph-index.ts:25-25`, `layered-index-manager.ts:33-33`
- **./layered-graph-index.js** — Imports `./layered-graph-index.js` from `./layered-graph-index.js`. `layered-index-manager.ts:34-34`
- **./layered-vector-store.js** — Imports `./layered-vector-store.js` from `./layered-vector-store.js`. `layered-index-manager.ts:35-35`
- **./vector-cache-manager.js** — Imports `./vector-cache-manager.js` from `./vector-cache-manager.js`. `delta-maintenance-service.ts:24-24`, `layered-index-manager.ts:36-36`, `layered-vector-store.ts:27-27`
- **./vector-delta.js** — Imports `./vector-delta.js` from `./vector-delta.js`. `layered-vector-store.ts:28-28`, `vector-cache-manager.ts:23-23`
- **lru-cache** — Imports `lru-cache` from `lru-cache`. `layered-graph-index.ts:15-15`, `layered-vector-store.ts:19-19`
- **node:child_process** — Imports `node:child_process` from `node:child_process`. `git-delta-computer.ts:13-13`
- **node:events** — Imports `node:events` from `node:events`. `incremental-update-queue.ts:17-17`
- **node:fs** — Imports `node:fs` from `node:fs`. `git-delta-computer.ts:14-14`, `layered-cache-manager.ts:17-17`, `vector-cache-manager.ts:18-18`
- **node:path** — Imports `node:path` from `node:path`. `git-delta-computer.ts:15-15`, `layered-cache-manager.ts:18-18`, `vector-cache-manager.ts:19-19`

### Property
- **added** — Stores entities that have been added to the branch `branch-delta.ts:298-298`, `branch-delta.ts:303-303`
- **added** — A map of added embeddings `vector-delta.ts:325-325`
- **addedEmbeddings** — Map of added embeddings `vector-delta.ts:27-27`
- **additions** — Counts additions in the diff `git-delta-computer.ts:484-484`, `git-delta-computer.ts:485-485`
- **autoCompaction** — Enables or disables auto-compaction `delta-maintenance-service.ts:56-56`
- **base_commit_sha** — Stores the SHA of the base commit for the branch delta `layered-cache-manager.ts:30-30`
- **base_commit_sha** — Stores the SHA of the base commit for the branch `vector-cache-manager.ts:31-31`
- **baseCommitSha** — Stores the SHA of the base commit `branch-delta.ts:21-21`, `branch-delta.ts:295-295`
- **baseCommitSha** — SHA of the base commit `vector-delta.ts:24-24`
- **baseCommitSha** — Represents the commit SHA of the base branch `vector-delta.ts:323-323`
- **baseIndex** — Stores the base index for comparison in the GitDeltaComputer `git-delta-computer.ts:30-30`
- **baseIndex** — The base index containing main branch entities `layered-graph-index.ts:71-71`
- **baseIndex** — Represents the base index used by the Layered Index Manager `layered-index-manager.ts:133-133`
- **baseStore** — Main branch embeddings (shared, read-only) `layered-vector-store.ts:48-48`
- **baseVectorStore** — Represents the base vector store for semantic search `layered-index-manager.ts:134-134`
- **branch** — Represents the branch being processed `delta-maintenance-service.ts:84-84`
- **branch** — The branch name (if known) `incremental-update-queue.ts:42-42`
- **branch** — Optional branch name associated with the similarity result `layered-vector-store.ts:39-39`
- **branch** — Represents a branch in the vector delta storage `vector-cache-manager.ts:507-507`
- **branch_name** — Stores the name of the branch associated with the branch delta `layered-cache-manager.ts:29-29`
- **branch_name** — Represents the name of a branch `layered-cache-manager.ts:286-286`
- **branch_name** — Stores the name of the branch associated with the vector delta `vector-cache-manager.ts:30-30`, `vector-cache-manager.ts:48-48`
- **branch_name** — Represents the name of a branch in the vector delta `vector-cache-manager.ts:395-395`
- **branchDeltaCache** — A cache for branch deltas `layered-graph-index.ts:74-74`
- **branchDeltaCache** — LRU cache for branch vector deltas `layered-vector-store.ts:51-51`
- **branchManager** — Manages branch operations `delta-maintenance-service.ts:126-126`
- **branchManager** — Manages branches for the GitDeltaComputer `git-delta-computer.ts:29-29`
- **branchManager** — A manager for branches `layered-graph-index.ts:89-89`
- **branchManager** — Manages branches for the layered index manager `layered-index-manager.ts:135-135`
- **branchName** — Stores the name of the branch `branch-delta.ts:20-20`, `branch-delta.ts:294-294`
- **branchName** — Name of the branch `vector-delta.ts:23-23`, `vector-delta.ts:322-322`
- **bytesFreed** — Tracks the total bytes freed during maintenance `delta-maintenance-service.ts:76-76`
- **cachedBranches** — Stores the cached branches `layered-index-manager.ts:111-111`
- **cacheHits** — Counts the number of cache hits `layered-index-manager.ts:86-86`
- **cacheManager** — Manages cache operations `delta-maintenance-service.ts:124-124`
- **cacheManager** — A manager for caching `layered-graph-index.ts:88-88`
- **cacheManager** — Manages the cache for the Layered Index Manager `layered-index-manager.ts:97-97`
- **cacheManager** — Manages the cache for the layered index manager `layered-index-manager.ts:144-144`
- **cacheManager** — Vector cache manager for persistence `layered-vector-store.ts:60-60`
- **cacheMisses** — Counts the number of cache misses `layered-index-manager.ts:87-87`
- **changesAfter** — Tracks the number of changes after compaction `delta-maintenance-service.ts:90-90`
- **changesBefore** — Tracks the number of changes before compaction `delta-maintenance-service.ts:87-87`
- **changeType** — The type of change (added, modified, deleted, renamed) `incremental-update-queue.ts:33-33`
- **clientId** — The client ID for Layer 2 [FUTURE] `incremental-update-queue.ts:45-45`
- **column** — Column number of the start position `layered-graph-index.ts:46-46`, `layered-graph-index.ts:47-47`
- **compactionsRun** — Number of compactions performed by the maintenance service `layered-index-manager.ts:66-66`
- **compactionThreshold** — Sets the threshold for delta compaction `delta-maintenance-service.ts:47-47`
- **config** — Configuration for delta maintenance `delta-maintenance-service.ts:127-127`
- **config** — Configuration object for FileChangeIntegration `file-change-integration.ts:65-65`
- **config** — Stores the configuration for the incremental update queue `incremental-update-queue.ts:89-89`
- **config** — The configuration for the layered graph index `layered-graph-index.ts:80-80`
- **config** — Stores the configuration for the Layered Index Manager `layered-index-manager.ts:129-129`
- **config** — Configuration for the layered vector store `layered-vector-store.ts:57-57`
- **currentBranch** — Current branch name or null `file-change-integration.ts:68-68`
- **currentBranch** — Represents the current branch being used `layered-index-manager.ts:108-108`
- **databaseSize** — Represents the size of the database `layered-cache-manager.ts:365-365`
- **databaseSize** — Represents the size of the SQLite database file `vector-cache-manager.ts:414-414`
- **db** — Represents the SQLite database connection `layered-cache-manager.ts:51-51`, `vector-cache-manager.ts:138-138`
- **dbPath** — Stores the path to the SQLite database file `layered-cache-manager.ts:52-52`, `vector-cache-manager.ts:139-139`
- **debounceAbortController** — Controls the debounce timer for file change events `incremental-update-queue.ts:93-93`
- **debounceWindowMs** — The debounce window in milliseconds (default: 300ms) `incremental-update-queue.ts:50-50`
- **debug** — Enables or disables debug logging `delta-maintenance-service.ts:59-59`
- **debug** — Boolean flag to enable debug logging `file-change-integration.ts:40-40`
- **debug** — Whether debug logging is enabled (default: false) `incremental-update-queue.ts:59-59`
- **debug** — Boolean flag to enable or disable debug mode `layered-index-manager.ts:59-59`
- **deleted** — Stores entities that have been deleted from the branch `branch-delta.ts:300-300`, `branch-delta.ts:305-305`
- **deleted** — A set of deleted embedding IDs `vector-delta.ts:327-327`
- **deletedEmbeddingIds** — Set of deleted embedding IDs `vector-delta.ts:29-29`
- **deleteStmt** — Prepares an SQLite statement for deleting branch deltas `layered-cache-manager.ts:61-61`
- **deleteStmt** — Prepares an SQL statement for deleting vector deltas from the database `vector-cache-manager.ts:148-148`
- **deletions** — Counts deletions in the diff `git-delta-computer.ts:484-484`, `git-delta-computer.ts:485-485`
- **deltasCompacted** — Tracks the number of deltas compacted `delta-maintenance-service.ts:70-70`
- **deltasDeleted** — Tracks the number of deltas deleted `delta-maintenance-service.ts:73-73`
- **dimension** — Stores the dimension of the vectors `vector-cache-manager.ts:37-37`, `vector-cache-manager.ts:50-50`
- **dimension** — Stores the dimension of the vectors in the delta `vector-cache-manager.ts:509-509`
- **embeddingGenerator** — Embedding generator for lazy embedding generation `layered-vector-store.ts:61-61`
- **enableBranchWatching** — Boolean flag to enable automatic delta recomputation on branch changes `file-change-integration.ts:31-31`
- **enableCommitWatching** — Boolean flag to enable automatic delta update on new commits `file-change-integration.ts:34-34`
- **enabled** — Enables or disables automatic maintenance `delta-maintenance-service.ts:44-44`
- **enabled** — Whether incremental updates are enabled (default: true) `incremental-update-queue.ts:56-56`
- **enableFileWatching** — Boolean flag to enable automatic indexing on file changes `file-change-integration.ts:28-28`
- **enableFileWatching** — Boolean flag to enable or disable file watching `layered-index-manager.ts:50-50`
- **enableMaintenance** — Boolean flag to enable or disable the maintenance service `layered-index-manager.ts:53-53`
- **end** — End position of the entity `layered-graph-index.ts:47-47`
- **entity_added** — Stores the SHA of entities added in the branch delta `layered-cache-manager.ts:32-32`
- **entity_deleted** — Stores the SHA of entities deleted in the branch delta `layered-cache-manager.ts:34-34`
- **entity_modified** — Stores the SHA of entities modified in the branch delta `layered-cache-manager.ts:33-33`
- **entityAdded** — Represents the entities added in a branch delta `layered-cache-manager.ts:302-302`
- **entityCache** — Manages entity cache for layered indexing `delta-maintenance-service.ts:114-114`
- **entityDeleted** — Represents the entities deleted in a branch delta `layered-cache-manager.ts:304-304`
- **entityDelta** — Stores entity changes `branch-delta.ts:22-22`
- **entityDelta** — Represents changes in entities for a specific branch `branch-delta.ts:297-301`
- **entityModified** — Represents the entities modified in a branch delta `layered-cache-manager.ts:303-303`
- **entityType** — Represents the type of entities in the graph `layered-graph-index.ts:58-58`
- **error** — An error message `incremental-update-queue.ts:73-73`
- **errors** — Array of errors encountered during processing `incremental-update-queue.ts:73-73`
- **estimatedFileCount** — Estimated number of files for adaptive backend selection `layered-index-manager.ts:56-56`
- **file** — A file path `incremental-update-queue.ts:73-73`
- **fileIntegration** — Integrates with file change integration for GitWatcher `layered-index-manager.ts:149-149`
- **filePath** — The file path relative to the repository root `incremental-update-queue.ts:30-30`
- **filePath** — The file path associated with the entity `layered-graph-index.ts:60-60`
- **filesProcessed** — Number of files processed in the batch `incremental-update-queue.ts:64-64`
- **filters** — Filters for the graph query `layered-graph-index.ts:57-61`
- **fullRebuild** — Whether full rebuild was triggered `incremental-update-queue.ts:70-70`
- **gitDeltaComputer** — A computer for Git deltas `layered-graph-index.ts:87-87`
- **gitDeltaComputer** — Computes git deltas for incremental updates `layered-index-manager.ts:141-141`
- **gitWatcher** — Instance of GitWatcher for detecting file and branch changes `file-change-integration.ts:62-62`
- **gitWatcher** — Watches for file changes in the working directory `layered-index-manager.ts:136-136`
- **hits** — Count of cache hits `delta-maintenance-service.ts:103-103`
- **index** — Represents the main index used by the Layered Index Manager `layered-index-manager.ts:96-96`
- **initialized** — Indicates whether the index manager has been initialized `layered-index-manager.ts:105-105`
- **insertStmt** — Prepares an SQLite statement for inserting branch deltas `layered-cache-manager.ts:59-59`
- **insertStmt** — Prepares an SQL statement for inserting vector deltas into the database `vector-cache-manager.ts:146-146`
- **isInitialized** — Boolean flag indicating if the integration is initialized `file-change-integration.ts:69-69`
- **isInitialized** — Indicates whether the index is initialized `layered-graph-index.ts:83-83`
- **isInitialized** — Indicates whether the layered index manager is initialized `layered-index-manager.ts:155-155`
- **isProcessing** — Indicates whether the queue is currently processing `incremental-update-queue.ts:94-94`, `incremental-update-queue.ts:377-377`
- **isRunning** — Indicates if maintenance is running `delta-maintenance-service.ts:131-131`
- **last_modified** — Stores the timestamp of the last modification of the branch delta `layered-cache-manager.ts:31-31`
- **last_modified** — Stores the timestamp of the last modification of the vector delta `vector-cache-manager.ts:32-32`
- **last_modified** — Stores the last modification timestamp of the vector delta `vector-cache-manager.ts:52-52`
- **lastBatchTime** — Stores the timestamp of the last batch processed `incremental-update-queue.ts:80-80`
- **lastModified** — Stores the last modified timestamp `branch-delta.ts:24-24`, `branch-delta.ts:296-296`
- **lastModified** — Stores the last modified timestamp of the vector deltas `vector-cache-manager.ts:511-511`
- **lastModified** — Timestamp of the last modification `vector-delta.ts:31-31`
- **lastModified** — Stores the timestamp of the last modification of the delta `vector-delta.ts:324-324`
- **lastProcessTime** — Stores the timestamp of the last batch processing `layered-index-manager.ts:78-78`
- **lastRunDurationMs** — Stores the duration of the last maintenance run in milliseconds `delta-maintenance-service.ts:79-79`
- **lastRunTime** — Stores the timestamp of the last maintenance run `delta-maintenance-service.ts:64-64`, `layered-index-manager.ts:68-68`
- **lastUpdateTime** — Number representing the last update timestamp `file-change-integration.ts:54-54`
- **layer** — Indicates the layer from which the similarity result came `layered-vector-store.ts:36-36`
- **layeredConfig** — Partial configuration for the layered index `layered-index-manager.ts:47-47`
- **layeredConfig** — Stores the layered index configuration `layered-index-manager.ts:130-130`
- **layeredIndex** — Manages layered indexing operations `delta-maintenance-service.ts:123-123`
- **layeredIndex** — Instance of ILayeredIndex for applying updates to appropriate delta layers `file-change-integration.ts:64-64`
- **layeredIndex** — Represents the layered index for incremental updates `incremental-update-queue.ts:88-88`
- **layeredIndex** — Manages the layered graph index for entity indexing `layered-index-manager.ts:139-139`
- **layeredVectorStore** — Manages the layered vector store for semantic search `layered-index-manager.ts:140-140`
- **limit** — The maximum number of entities to return in a query `layered-graph-index.ts:62-62`
- **line** — Line number of the start position `layered-graph-index.ts:46-46`, `layered-graph-index.ts:47-47`
- **listStmt** — Prepares an SQLite statement for listing branch deltas `layered-cache-manager.ts:62-62`
- **listStmt** — Prepares an SQL statement for listing vector deltas from the database `vector-cache-manager.ts:149-149`
- **location** — Location of the entity, including start and end positions `layered-graph-index.ts:45-48`
- **maintenance** — Manages maintenance tasks for layered indexing `delta-maintenance-service.ts:113-113`
- **maintenance** — Manages the maintenance service for the Layered Index Manager `layered-index-manager.ts:99-99`, `layered-index-manager.ts:117-117`
- **maintenanceIntervalMs** — Sets the interval for maintenance tasks `delta-maintenance-service.ts:53-53`
- **maintenanceLoopRunning** — Indicates if maintenance loop is running `delta-maintenance-service.ts:130-130`
- **maintenanceService** — Provides maintenance services for the layered index manager `layered-index-manager.ts:152-152`
- **maintenanceTimer** — Timer for maintenance intervals `delta-maintenance-service.ts:213-213`
- **maxBatchSize** — The max batch size before fallback to full rebuild (default: 100) `incremental-update-queue.ts:53-53`
- **maxIncrementalFiles** — Number representing the maximum files to process incrementally, defaulting to 100 `file-change-integration.ts:37-37`
- **memory_usage** — Stores the memory usage of the vector delta `vector-cache-manager.ts:38-38`, `vector-cache-manager.ts:51-51`
- **memoryCache** — A map for in-memory cache storage `layered-cache-manager.ts:56-56`
- **memoryCache** — Represents the in-memory cache for vector deltas `vector-cache-manager.ts:143-143`
- **memoryFreed** — Tracks the memory freed during compaction `delta-maintenance-service.ts:93-93`
- **memoryUsage** — Tracks the memory usage of the vector deltas `vector-cache-manager.ts:510-510`
- **metadata** — Metadata associated with the entity `layered-graph-index.ts:49-49`
- **misses** — Count of cache misses `delta-maintenance-service.ts:104-104`
- **modified** — Stores entities that have been modified in the branch `branch-delta.ts:299-299`, `branch-delta.ts:304-304`
- **modified** — A map of modified embeddings `vector-delta.ts:326-326`
- **modifiedEmbeddings** — Map of modified embeddings `vector-delta.ts:28-28`
- **name** — Name of the entity `layered-graph-index.ts:43-43`
- **name** — The name of the entity `layered-graph-index.ts:59-59`
- **oldPath** — The old path for renamed files `incremental-update-queue.ts:36-36`
- **orphanedDeltaMaxAgeDays** — Defines the maximum age for orphaned deltas `delta-maintenance-service.ts:50-50`
- **orphansDeleted** — Number of orphans deleted by the maintenance service `layered-index-manager.ts:67-67`
- **pendingChanges** — Holds pending file change events `incremental-update-queue.ts:92-92`, `incremental-update-queue.ts:376-376`
- **pendingUpdates** — Tracks the number of pending updates in the queue `layered-index-manager.ts:76-76`
- **processingBatch** — Indicates whether a batch of updates is currently being processed `layered-index-manager.ts:77-77`
- **processingPromise** — Represents the promise for the current batch processing `incremental-update-queue.ts:95-95`
- **processingTimeMs** — Processing time in milliseconds `incremental-update-queue.ts:67-67`
- **queue** — Represents the update queue for the Layered Index Manager `layered-index-manager.ts:120-120`
- **relationship_added** — Stores the SHA of relationships added in the branch delta `layered-cache-manager.ts:35-35`
- **relationship_deleted** — Stores the SHA of relationships deleted in the branch delta `layered-cache-manager.ts:37-37`
- **relationship_modified** — Stores the SHA of relationships modified in the branch delta `layered-cache-manager.ts:36-36`
- **relationshipAdded** — Represents the relationships added in a branch delta `layered-cache-manager.ts:305-305`
- **relationshipDeleted** — Represents the relationships deleted in a branch delta `layered-cache-manager.ts:307-307`
- **relationshipDelta** — Stores relationship changes `branch-delta.ts:23-23`
- **relationshipDelta** — Represents changes in relationships for a specific branch `branch-delta.ts:302-306`
- **relationshipModified** — Represents the relationships modified in a branch delta `layered-cache-manager.ts:306-306`
- **selectStmt** — Prepares an SQLite statement for selecting branch deltas `layered-cache-manager.ts:60-60`
- **selectStmt** — Prepares an SQL statement for selecting vector deltas from the database `vector-cache-manager.ts:147-147`
- **size** — Size of the cache `delta-maintenance-service.ts:105-105`
- **start** — Start position of the entity `layered-graph-index.ts:46-46`
- **stats** — Maintains statistics for maintenance operations `delta-maintenance-service.ts:134-141`
- **stats** — Statistics object for tracking integration performance `file-change-integration.ts:72-77`
- **stats** — Maintains statistics for the incremental update queue `incremental-update-queue.ts:98-103`, `incremental-update-queue.ts:378-378`
- **success** — Indicates successful maintenance operation `delta-maintenance-service.ts:96-96`
- **timestamp** — The timestamp of the change `incremental-update-queue.ts:39-39`
- **total_branches** — Stores the total number of branches in the cache `layered-cache-manager.ts:42-42`
- **total_branches** — Stores the total number of branches `vector-cache-manager.ts:42-42`
- **total_changes** — Stores the total number of changes in the branch delta `layered-cache-manager.ts:38-38`, `layered-cache-manager.ts:43-43`
- **total_changes** — Stores the total number of changes in the vector delta `vector-cache-manager.ts:36-36`, `vector-cache-manager.ts:43-43`, `vector-cache-manager.ts:49-49`
- **total_memory_usage** — Stores the total memory usage across all branches `vector-cache-manager.ts:44-44`
- **totalBatches** — Tracks the number of batches processed `incremental-update-queue.ts:77-77`
- **totalBranches** — Represents the total number of branches `layered-cache-manager.ts:363-363`
- **totalBranches** — Represents the total number of branches in the vector cache `vector-cache-manager.ts:411-411`
- **totalBranchSwitches** — Number representing the total branch switches `file-change-integration.ts:48-48`
- **totalChanges** — Represents the total number of changes `layered-cache-manager.ts:364-364`
- **totalChanges** — Represents the total number of changes in the vector cache `vector-cache-manager.ts:412-412`
- **totalChanges** — Tracks the total number of changes in vector deltas `vector-cache-manager.ts:508-508`
- **totalCommits** — Number representing the total commits processed `file-change-integration.ts:51-51`
- **totalEntities** — Represents the total number of entities in the index `layered-index-manager.ts:114-114`
- **totalErrors** — Records the number of errors encountered `incremental-update-queue.ts:79-79`
- **totalFileChanges** — Number representing the total file changes processed `file-change-integration.ts:45-45`
- **totalFilesProcessed** — Counts the total number of files processed `incremental-update-queue.ts:78-78`
- **totalMemoryUsage** — Represents the total memory usage in the vector cache `vector-cache-manager.ts:413-413`
- **totalRuns** — Counts the total number of maintenance runs `delta-maintenance-service.ts:67-67`
- **totalSize** — Represents the total size of the cache `layered-index-manager.ts:88-88`
- **type** — Type of the entity `layered-graph-index.ts:44-44`
- **updateQueue** — Instance of IncrementalUpdateQueue for batching and processing changes `file-change-integration.ts:63-63`
- **updateQueue** — Manages the incremental update queue for batched updates `layered-index-manager.ts:148-148`
- **useInMemoryOnly** — Indicates whether the cache manager uses in-memory only mode `layered-cache-manager.ts:53-53`
- **useInMemoryOnly** — Determines if the cache should be stored in memory only `vector-cache-manager.ts:140-140`
- **vectorCache** — Manages vector cache for layered indexing `delta-maintenance-service.ts:115-115`
- **vectorCacheManager** — Manages vector cache operations `delta-maintenance-service.ts:125-125`
- **vectorCacheManager** — Manages the vector cache for the Layered Index Manager `layered-index-manager.ts:98-98`
- **vectorCacheManager** — Manages the vector cache for the layered index manager `layered-index-manager.ts:145-145`
- **vectors_added** — Stores the BLOB of added vectors `vector-cache-manager.ts:33-33`
- **vectors_deleted** — Stores the JSON array of deleted embedding IDs `vector-cache-manager.ts:35-35`
- **vectors_modified** — Stores the BLOB of modified vectors `vector-cache-manager.ts:34-34`
- **workingDeltaCache** — A cache for working deltas `layered-graph-index.ts:77-77`
- **workingDeltas** — Map for per-client uncommitted embeddings [FUTURE] `layered-vector-store.ts:54-54`
- **workingDirectory** — Specifies the working directory for git operations in the GitDeltaComputer `git-delta-computer.ts:31-31`
- **workingDirectory** — The working directory for the index `layered-graph-index.ts:84-84`
- **workingDirectory** — The directory where the Layered Index Manager operates `layered-index-manager.ts:44-44`
- **workingDirectory** — Working directory for the layered vector store `layered-vector-store.ts:62-62`

### embedded_sql
- **CREATE TABLE IF NOT EXISTS branch_deltas ( branch_name TEXT PRIMARY KEY, base_commit_sha TEXT NOT NU** — Creates a table to store branch deltas with metadata and deltas for entities and relationships `layered-cache-manager.ts:100-127`
- **CREATE TABLE IF NOT EXISTS vector_deltas ( branch_name TEXT PRIMARY KEY, base_commit_sha TEXT NOT NU** — Creates a table for storing vector deltas with specified columns `vector-cache-manager.ts:187-214`
- **DELETE FROM branch_deltas WHERE branch_name = ?** — Prepares a statement to delete a record from branch_deltas where the branch name matches a given value `layered-cache-manager.ts:150-152`
- **DELETE FROM branch_deltas WHERE last_modified < ?** — Prepares a statement to delete records from branch_deltas where the last_modified is less than a given value `layered-cache-manager.ts:426-429`
- **DELETE FROM vector_deltas WHERE branch_name = ?** — Prepares a statement to delete records from vector_deltas where branch_name matches a given value `vector-cache-manager.ts:236-238`
- **DELETE FROM vector_deltas WHERE last_modified < ?** — Prepares a statement to delete records from vector_deltas where last_modified is less than a given value `vector-cache-manager.ts:486-489`
- **SELECT * FROM branch_deltas WHERE branch_name = ?** — Prepares a statement to select all records from branch_deltas where the branch name matches a given value `layered-cache-manager.ts:145-147`
- **SELECT * FROM vector_deltas WHERE branch_name = ?** — Prepares a statement to select all records from vector_deltas where branch_name matches a given value `vector-cache-manager.ts:231-233`
- **SELECT branch_name FROM branch_deltas ORDER BY last_modified DESC** — Prepares a statement to select branch names from branch_deltas ordered by last_modified in descending order `layered-cache-manager.ts:155-157`
- **SELECT branch_name FROM vector_deltas ORDER BY last_modified DESC** — Prepares a statement to select branch names from vector_deltas ordered by last_modified in descending order `vector-cache-manager.ts:241-243`
- **SELECT branch_name, total_changes, dimension, memory_usage, last_modified FROM vector_deltas WHERE b** — Prepares a statement to select specific fields from vector_deltas where branch_name matches a given value `vector-cache-manager.ts:526-530`

## Main Facade

| Entity | Type | File | Lines | Description |
|--------|------|------|-------|-------------|
| `LayeredIndexManager` | class | `layered-index-manager.ts` | 127–501 | Main orchestrator that manages graph index, vector store, git delta computation, update queue, file change integration, cache managers, and maintenance service; provides unified interface for all indexing operations. |
| `LayeredIndexManagerConfig` | interface | `layered-index-manager.ts` | 42–60 | Configuration object for the index manager containing storage, cache, queue, and vector store settings. |
| `IndexStatus` | interface | `layered-index-manager.ts` | 103–121 | Status report with entity counts per layer, queue depth, and active branch delta information. |

## Core Components

| Entity | Type | File | Lines | Description |
|--------|------|------|-------|-------------|
| `LayeredGraphIndex` | class | `layered-graph-index.ts` | 69–891 | Three-layer entity and relationship index combining Layer 0 base storage with Layer 1 and Layer 2 deltas to provide merged query results. |
| `BranchDelta` | class | `branch-delta.ts` | 19–345 | Layer 1 delta storing added/modified/deleted entities and relationships relative to main branch; shared between all clients on the same branch. |
| `GitDeltaComputer` | class | `git-delta-computer.ts` | 28–514 | Computes entity and relationship deltas by parsing `git diff` output for files between two commits; extracts symbols via semantic analysis. |
| `IncrementalUpdateQueue` | class | `incremental-update-queue.ts` | 87–435 | Debounces incoming file changes (300ms), batches them, deduplicates, and emits unified update events to prevent thrashing the index. |
| `FileChangeIntegration` | class | `file-change-integration.ts` | 61–373 | Bridge adapter converting `GitWatcher` file/branch/commit change events into `FileChangeEvent` payloads for `IncrementalUpdateQueue`. |

## Types & Configuration

| Entity | Type | File | Lines | Description |
|--------|------|------|-------|-------------|
| `FileChangeEvent` | interface | `incremental-update-queue.ts` | 28–46 | Payload for a file system change event containing path, change type, and optional renamed-from path. |
| `FileChangeType` | type | `incremental-update-queue.ts` | 26–26 | Union of change types: `"added" \| "modified" \| "deleted" \| "renamed"`. |
| `FileChangeIntegrationConfig` | interface | `file-change-integration.ts` | 26–41 | Configuration for file change integration bridge containing queue reference and optional debounce settings. |

## Vector Management

| Entity | Type | File | Lines | Description |
|--------|------|------|-------|-------------|
| `LayeredVectorStore` | class | `layered-vector-store.ts` | 46–525 | Three-layer semantic search engine combining Layer 0 base embeddings with Layer 1 and Layer 2 vector deltas; re-ranks and merges results. |
| `VectorDelta` | class | `vector-delta.ts` | 22–372 | Layer 1 embedding changes storing added/modified/deleted vector mappings and similarity index state relative to Layer 0. |
| `LayeredSimilarityResult` | interface | `layered-vector-store.ts` | 34–40 | Query result with entity reference, similarity score, and source layer provenance. |

## Cache Management

| Entity | Type | File | Lines | Description |
|--------|------|------|-------|-------------|
| `LayeredCacheManager` | class | `layered-cache-manager.ts` | 50–460 | Persistence layer for branch entity deltas using SQLite; loads/saves `BranchDelta` state and manages LRU cache eviction. |
| `VectorCacheManager` | class | `vector-cache-manager.ts` | 137–565 | Persistence layer for vector deltas using SQLite; caches vector similarity indices and embedding mappings per branch. |

## Maintenance & Cleanup

| Entity | Type | File | Lines | Description |
|--------|------|------|-------|-------------|
| `DeltaMaintenanceService` | class | `delta-maintenance-service.ts` | 122–515 | Background service that compacts large deltas, cleans orphaned branch deltas, and gathers maintenance statistics; runs on-demand or on shutdown. |
| `DeltaMaintenanceConfig` | interface | `delta-maintenance-service.ts` | 42–60 | Configuration for maintenance tasks including enabled flag, compaction threshold, and cleanup schedule. |
| `MaintenanceStats` | interface | `delta-maintenance-service.ts` | 62–80 | Metrics from a maintenance run: branch count, entities processed, deltas compacted, orphans removed, and time elapsed. |
| `CompactionResult` | interface | `delta-maintenance-service.ts` | 82–97 | Outcome of delta compaction for a single branch including size before/after, items merged, and compaction ratio. |

## Dependencies

### Internal
- **GitWatcher**: Emits file/branch/commit change events consumed by `FileChangeIntegration`.
- **GraphStorage**: Layer 0 base—immutable main-branch entity graph shared across branches.
- **BranchManager**: Tracks current branch context; used by `DeltaMaintenanceService` for orphan detection.
- **Storage Types** (`Entity`, `Relationship`): Domain model entities persisted and indexed across layers.

### External
- **SQLite**: Persistence backend for both `LayeredCacheManager` (entity deltas) and `VectorCacheManager` (vector deltas).
- **Git CLI** (`git diff`): Used by `GitDeltaComputer` to compute structural changes between commits.
- **Semantic Analysis**: Entity/symbol extraction from source files (integrated into `GitDeltaComputer`).
