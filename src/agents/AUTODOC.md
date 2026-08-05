# agents

## 🤖 Overview

The `src/agents` module contains a collection of agents responsible for various tasks such as parsing, indexing, and querying code graphs. These agents are used by developers and system integrators to manage and interact with the codebase efficiently.

## 🤖 Architecture

```
        +-------------------+
        |   Base Agent     |
        | (abstract class) |
        +-------------------+
                |
                v
        +-------------------+
        |  Dev Agent       |
        | (specific agent)  |
        +-------------------+
                |
                v
        +-------------------+
        |  Query Agent     |
        | (specific agent)  |
        +-------------------+
                |
                v
        +-------------------+
        |  Indexer Agent   |
        | (specific agent)  |
        +-------------------+
                |
                v
        +-------------------+
        |  Semantic Agent  |
        | (specific agent)  |
        +-------------------+
```

## 🤖 Flow

```
        +-------------------+
        |   Base Agent     |
        | (abstract class) |
        +-------------------+
                |
                v
        +-------------------+
        |  Dev Agent       |
        | (specific agent)  |
        +-------------------+
                |
                v
        +-------------------+
        |  Query Agent     |
        | (specific agent)  |
        +-------------------+
                |
                v
        +-------------------+
        |  Indexer Agent   |
        | (specific agent)  |
        +-------------------+
                |
                v
        +-------------------+
        |  Semantic Agent  |
        | (specific agent)  |
        +-------------------+
```

## 🤖 Entity Listing

### Function
- **acquireIndexLock** — Acquires a lock for indexing `indexer-agent.ts:131-157`
- **acquireIndexLockForProject** — Acquires a lock for indexing a project `indexer-agent.ts:122-128`
- **additionalErrors** — Stores additional errors that occurred during parsing `parser-agent.ts:895-895`
- **allEntityIds** — Stores all entity IDs in the graph `indexer-agent.ts:1175-1175`
- **buildResponse** — A function that builds a response for a task `dora-agent.ts:19-21`
- **cacheEntries** — Stores cache entries for entities `semantic-agent.ts:1457-1465`
- **callsRels** — Calls relationship builders for entities `indexer-agent.ts:970-970`
- **changedFiles** — Tracks files that have been changed `indexer-agent.ts:1651-1651`
- **changedFiles** — Filters events to find changed files and maps them to their paths `indexer-agent.ts:1651-1651`
- **checks** — A collection of checks or validation steps `dev-agent.ts:1609-1609`
- **checks** — Checks if any entity has a protobuf metadata `dev-agent.ts:1610-1610`
- **checks** — Checks if any entity has a GraphQL metadata `dev-agent.ts:1611-1611`
- **checks** — Checks if any entity has a database schema or type metadata `dev-agent.ts:1612-1612`
- **chunkResults** — A function to chunk and process results `dev-agent.ts:2029-2035`
- **collectAll** — Filters files to only supported extensions `parser-agent.ts:404-409`
- **computeTargetWorkers** — Computes the target number of workers for the parser agent `parser-agent.ts:1180-1189`
- **convert** — Converts parsed entities into a structured format `parser-agent.ts:132-287`
- **convertCSharpResult** — Converts C# parsing results into a suitable format `parser-agent.ts:127-485`
- **csEntities** — Stores entities with stable IDs `indexer-agent.ts:1172-1172`
- **csEntityIds** — Stores IDs of entities with stable IDs `indexer-agent.ts:1174-1174`
- **ctx** — Represents the context for the agent `indexer-agent.ts:1514-1514`
- **currentFilesSet** — Represents the current set of files being processed `dev-agent.ts:433-433`
- **deletedFiles** — Tracks files that have been deleted `indexer-agent.ts:1653-1653`
- **deletedFiles** — Filters events to find deleted files and maps them to their paths `indexer-agent.ts:1653-1653`
- **directImpact** — Represents direct impact of a given entity `query-agent.ts:174-174`
- **directImpact** — Filters and maps the direct impact entities based on the entityId `query-agent.ts:174-174`
- **dumpedEmbeddings** — Contains embeddings that have been dumped to disk `semantic-agent.ts:1570-1576`
- **embeddingIds** — Stores the IDs of embeddings `dev-agent.ts:675-675`
- **entitiesToFetch** — Identifies entities to fetch `semantic-agent.ts:1485-1485`
- **entitiesWithPath** — Stores entities along with their file paths `indexer-agent.ts:624-628`
- **entitiesWithPath** — Maps entities to include their file path and a stable ID, updating the entities' id if necessary `indexer-agent.ts:1133-1137`
- **entityResult** — Stores the result of processing an entity `indexer-agent.ts:607-609`
- **existingContains** — Creates a set of existing contains relationships `parser-agent.ts:412-412`
- **existingContains** — Parses relationships to create a set of existing contains `parser-agent.ts:412-412`
- **faissFlushPromise** — Represents a promise for flushing FAISS index `dev-agent.ts:708-729`
- **fileEntries** — Represents the entries in the file `dev-agent.ts:1202-1202`
- **filesToParse** — Tracks the list of files to be parsed `parser-agent.ts:1093-1093`
- **filesToParse** — Filters changes to get files that are not deleted `parser-agent.ts:1093-1093`
- **filtered** — Filters entities based on certain criteria `semantic-agent.ts:1867-1871`
- **filterSupportedFiles** — Filters files to only include those with supported extensions `parser-agent.ts:81-83`
- **flatten** — Flattens a nested structure into a single-level structure `parser-agent.ts:290-348`
- **funcs** — A collection of functions or methods `dev-agent.ts:1411-1411`
- **getDevAgentConfig** — Function to retrieve configuration for the development agent `dev-agent.ts:38-45`
- **getIndexerConfig** — Returns the configuration for the indexer agent `indexer-agent.ts:65-76`
- **getParserConfig** — Returns a configuration object for the parser agent based on the YAML config `parser-agent.ts:49-59`
- **getSemanticAgentConfig** — Retrieves the configuration for the semantic agent `semantic-agent.ts:118-128`
- **gguf** — Represents a GGUF model for embedding `dev-agent.ts:538-538`
- **graphCommitPromise** — Represents a promise for committing graph changes `dev-agent.ts:731-755`
- **groupFilesByLanguage** — Groups files by their detected programming language `parser-agent.ts:90-103`
- **hasAnyChildren** — Checks if an entity has any children `parser-agent.ts:353-353`
- **hasAnyParentId** — Checks if an entity has any parent IDs `parser-agent.ts:354-354`
- **idle** — Indicates if the coordinator is idle `coordinator.ts:289-289`
- **ids** — Stores IDs for entities `semantic-agent.ts:1487-1487`
- **ids** — Filters and maps entities to their IDs, ensuring only defined IDs are included `semantic-agent.ts:1487-1487`
- **indexPromises** — Manages promises for indexing tasks `dev-agent.ts:2056-2067`
- **isBunRuntime** — Function to check if the runtime is Bun `conductor-orchestrator.ts:37-39`
- **isBunRuntime** — Determines if the runtime is Bun `coordinator.ts:108-110`
- **isEventfulAgent** — Returns `true` if the agent supports `.on()` event subscriptions `coordinator.ts:57-59`
- **ktFiles** — Stores a list of Kotlin files to be parsed `parser-agent.ts:1332-1332`
- **langSample** — Language sample `indexer-agent.ts:513-513`
- **languages** — Tracks the languages supported by the parser agent `parser-agent.ts:1148-1152`
- **loc** — Represents the location of a parsed entity `parser-agent.ts:232-235`
- **lockPromise** — A promise that locks the agent to prevent concurrent operations `indexer-agent.ts:147-152`
- **mergeConstraints** — Merges resource constraints from multiple sources `coordinator.ts:113-121`
- **messages** — Stores messages related to parsing tasks `parser-agent.ts:876-876`
- **moduleEntity** — An entity representing a module or a set of related entities `dev-agent.ts:1382-1382`
- **noLangSample** — No language sample `indexer-agent.ts:514-514`
- **nonWorkerEntities** — Represents non-worker entities in the semantic agent `semantic-agent.ts:881-881`
- **nonWorkerEntities** — Represents non-worker entities that are not part of the worker set `semantic-agent.ts:1089-1089`
- **originalIndexToHash** — Maps original indices to their corresponding hashes `semantic-agent.ts:1125-1125`
- **perfLog** — Logs performance metrics for the semantic agent `semantic-agent.ts:1637-1642`
- **pick** — Picks an agent based on the load-balancing strategy `coordinator.ts:140-141`
- **pool** — Represents the embedding pool used for parsing `parser-agent.ts:1293-1295`
- **poolPromises** — Manages promises for worker pools `parser-agent.ts:1191-1203`
- **poolResults** — Stores results from the embedding pool `parser-agent.ts:1390-1394`
- **profile** — Profiles the performance of the semantic agent `semantic-agent.ts:1437-1440`
- **promise** — A promise object representing an asynchronous operation `dev-agent.ts:1230-1238`
- **realRels** — Stores real relationships `indexer-agent.ts:1161-1161`
- **related** — A collection of related entities or a relationship between entities `dev-agent.ts:1396-1396`
- **rels** — Manages relationships between entities `indexer-agent.ts:1187-1187`
- **resolveConfig** — Resolves the configuration for the coordinator `coordinator.ts:124-151`
- **result** — Stores the result of a parsing task `parser-agent.ts:1519-1519`
- **result** — Not implemented in the provided code `query-agent.ts:99-99`
- **results** — Stores the results of semantic analysis tasks `semantic-agent.ts:1492-1492`
- **resultsWithErrors** — Stores results along with any errors encountered during parsing `parser-agent.ts:871-871`
- **samples** — Represents a collection of sample entities `indexer-agent.ts:1186-1195`
- **samples** — Maps relational samples to a string representation, truncating IDs to the first 8 characters `indexer-agent.ts:1193-1193`
- **shutdownPromises** — Manages promises for shutdown operations `conductor-orchestrator.ts:147-148`
- **shutdownPromises** — Logs an error if the agent shutdown fails and catches the error `conductor-orchestrator.ts:148-148`
- **shutdownPromises** — Manages promises for shutting down the embedding pool `parser-agent.ts:1458-1465`
- **skippedLanguages** — Tracks the languages that were skipped during parsing `parser-agent.ts:1154-1157`
- **successCount** — Tracks the number of successful parsing tasks `parser-agent.ts:1208-1208`
- **summaries** — Stores summaries of parsed entities `parser-agent.ts:875-878`
- **taskHandlers** — A map of task handlers for different types of tasks `dora-agent.ts:26-44`
- **taskHandlers** — Parses a task payload and returns a response with exploration insights `dora-agent.ts:48-64`
- **taskHandlers** — Parses a task payload and returns a response with documentation sections `dora-agent.ts:68-79`
- **taskHandlers** — Parses a task payload and returns a response with discovered patterns `dora-agent.ts:83-104`
- **testEmbedding** — Tests the embedding generation process `semantic-agent.ts:230-232`
- **totalEntities** — Tracks the total number of entities parsed `parser-agent.ts:1071-1071`
- **vectorEmbeddings** — Manages vector embeddings for semantic search and analysis `semantic-agent.ts:1503-1566`
- **vectorEmbeddings** — Converts dumped embeddings into a structured array of vector embeddings with additional metadata `semantic-agent.ts:1918-1924`
- **withCalls** — Represents a task with function calls `parser-agent.ts:1530-1530`
- **withChildren** — Filters entities with children `parser-agent.ts:448-448`
- **withChildren** — Represents a task with child tasks `parser-agent.ts:1529-1529`
- **withLang** — Applies language processing `indexer-agent.ts:512-512`
- **withParentId** — Filters entities with a parent ID `parser-agent.ts:449-449`
- **yieldToEventLoop** — Helper function to yield to the event loop between indexing chunks `dev-agent.ts:36-36`
- **yieldToEventLoop** — Returns a promise that resolves after yielding to the event loop `dev-agent.ts:36-36`

### Method
- **"embeddingGen.generateBatch"** — Generates a batch of embeddings `semantic-agent.ts:391-393`
- **adjustBatchSize** — A function to adjust the batch size for tasks `dev-agent.ts:1657-1664`
- **adjustBatchSize** — Adjusts the batch size for embedding generation `semantic-agent.ts:2059-2069`
- **adjustConcurrency** — A function to adjust the concurrency level for tasks `dev-agent.ts:1649-1655`
- **adjustConcurrency** — Adjusts the concurrency level for processing entities `semantic-agent.ts:2052-2057`
- **analyzeCodeSemantics** — Analyzes the semantics of code for patterns and anomalies `semantic-agent.ts:820-822`
- **analyzeConflicts** — Analyzes conflicts detected during the merge process `merge-agent.ts:290-332`
- **analyzeDependencies** — Analyzes dependencies of a given entity `query-agent.ts:162-169`
- **analyzeHotspots** — Analyzes hotspots in the graph `query-agent.ts:197-199`
- **analyzeHotspots** — Analyzes code for hotspots or areas of concern `semantic-agent.ts:845-847`
- **analyzeImpact** — Analyzes the impact of a given entity `query-agent.ts:171-187`
- **analyzeRippleEffects** — Analyzes ripple effects in the graph `query-agent.ts:201-203`
- **applyMergeActions** — Applies merge actions to resolve conflicts `merge-agent.ts:410-423`
- **autoResolveConflicts** — Automatically resolves compatible conflicts during the merge `merge-agent.ts:386-408`
- **broadcast** — Broadcasts a message to all agents `coordinator.ts:304-310`
- **buildEntityEmbeddingText** — Builds the text for entity embeddings `semantic-agent.ts:1208-1311`
- **buildPerfSummary** — Builds a performance summary for indexing tasks `dev-agent.ts:802-825`
- **buildRelationshipsInternal** — Builds internal relationships for entities `indexer-agent.ts:827-832`
- **cacheGet** — Not implemented in the provided code `query-agent.ts:109-117`
- **cacheSet** — Not implemented in the provided code `query-agent.ts:119-121`
- **canHandle** — Determines if the agent can handle a given task, logging details if it cannot `base.ts:84-137`
- **canProcessTask** — Determines if a task can be processed by the orchestrator `conductor-orchestrator.ts:159-161`
- **canProcessTask** — Determines if the coordinator can process a task `coordinator.ts:204-206`
- **canProcessTask** — Determines if the agent can process a task `dev-agent.ts:189-198`
- **canProcessTask** — A method to determine if the DoraAgent can process a given task `dora-agent.ts:136-138`
- **canProcessTask** — Determines if a task can be processed `indexer-agent.ts:463-466`
- **canProcessTask** — Determines if the merge agent can process a task `merge-agent.ts:99-107`
- **canProcessTask** — Determines if the parser agent can process a given task `parser-agent.ts:808-820`
- **canProcessTask** — Not implemented in the provided code `query-agent.ts:90-92`
- **canProcessTask** — Determines if the semantic agent can process a given task `semantic-agent.ts:678-680`
- **checkAgentHealth** — Checks the health of an agent `conductor-orchestrator.ts:283-308`
- **checkDirectImplementation** — Checks if a direct implementation is available `conductor-orchestrator.ts:188-190`
- **cleanupCaches** — Cleans up caches to free up memory `conductor-orchestrator.ts:415-424`
- **clearAllVectors** — Clears all vectors in the semantic analysis `semantic-agent.ts:974-979`
- **constructor** — The constructor function for the BaseAgent class `base.ts:40-56`
- **constructor** — Initializes the conductor orchestrator with configuration overrides `conductor-orchestrator.ts:70-101`
- **constructor** — Initializes the coordinator agent `coordinator.ts:166-174`
- **constructor** — Initializes the DevAgent instance `dev-agent.ts:100-112`
- **constructor** — The constructor function for the DoraAgent class `dora-agent.ts:111-118`
- **constructor** — Initializes the indexer agent `indexer-agent.ts:210-213`
- **constructor** — Constructor for the MergeAgent class `merge-agent.ts:79-93`
- **constructor** — Initializes the parser agent with configuration and event handlers `parser-agent.ts:520-543`
- **constructor** — Initializes the QueryAgent with configuration settings `query-agent.ts:56-66`
- **constructor** — Initializes the semantic agent with necessary components `semantic-agent.ts:254-270`
- **createEmptyStats** — Creates an empty merge statistics object `merge-agent.ts:433-442`
- **crossLanguageSearch** — Conducts cross-language semantic search `semantic-agent.ts:832-834`
- **delegateTask** — Delegates a task to another agent or function `dev-agent.ts:375-386`
- **destroyWorkerPools** — Destroys the worker pools used by the parser agent `parser-agent.ts:781-803`
- **detectClones** — Detects code clones using semantic similarity `semantic-agent.ts:812-818`
- **disableKeepaliveMode** — Disables keepalive mode for the parser `parser-agent.ts:1838-1845`
- **doScheduleEmbeddingGeneration** — Schedules embedding generation `indexer-agent.ts:1368-1373`
- **drainQueue** — Processes queued tasks, resolves or rejects them, and updates the agent's status `base.ts:258-277`
- **dropVectorIndex** — Drops the vector index for semantic analysis `semantic-agent.ts:967-969`
- **enableKeepaliveMode** — Enables keepalive mode for the parser `parser-agent.ts:1774-1833`
- **enqueue** — Enqueues a task if the agent can process it, otherwise throws an error `base.ts:158-186`
- **ensureUniversalPool** — Ensures a universal embedding pool is available `parser-agent.ts:1220-1254`
- **exportCache** — Exports the cache used by the parser `parser-agent.ts:1858-1863`
- **exportCache** — Exports the semantic cache to a file or database `semantic-agent.ts:2151-2153`
- **extractFileComments** — Extracts comments from files `semantic-agent.ts:1316-1386`
- **filterWorkerEntities** — Filters worker entities based on certain criteria `semantic-agent.ts:1082-1108`
- **findCycles** — Finds cycles in the graph `query-agent.ts:193-195`
- **findEntities** — Finds entities based on filters `query-agent.ts:123-140`
- **findPaths** — Finds paths in the graph `query-agent.ts:189-191`
- **findRelationships** — Finds relationships for a given entity ID and type `query-agent.ts:142-154`
- **findSimilarCode** — Identifies similar code snippets based on semantic analysis `semantic-agent.ts:808-810`
- **flushDumpToDatabase** — Flushes dumped embeddings to the database `semantic-agent.ts:1895-1965`
- **flushPendingBatch** — Flushes pending batches of entities `indexer-agent.ts:1097-1258`
- **generateAISuggestions** — Generates AI suggestions for resolving conflicts `merge-agent.ts:369-384`
- **generateAndStoreEmbeddings** — Generates and stores embeddings for entities `semantic-agent.ts:1391-1614`
- **generateCodeEmbedding** — Generates embeddings for code snippets `semantic-agent.ts:824-830`
- **generateEmbedding** — Generates an embedding for a given input `semantic-agent.ts:2127-2132`
- **generateEmbeddingsFromStorage** — Generates embeddings from storage `semantic-agent.ts:1043-1075`
- **getAccumulator** — Returns the embedding accumulator if initialized `parser-agent.ts:593-595`
- **getAgent** — Retrieves an agent by its ID `conductor-orchestrator.ts:217-219`
- **getAgent** — Retrieves an agent by ID `coordinator.ts:280-282`
- **getAgentByType** — Retrieves agents of a specific type `conductor-orchestrator.ts:229-239`
- **getAgentsByType** — Retrieves agents by their type `conductor-orchestrator.ts:221-223`
- **getAgentsByType** — Retrieves agents by type `coordinator.ts:284-286`
- **getAllAgentMetrics** — Retrieves metrics for all agents `conductor-orchestrator.ts:445-454`
- **getAvailableAgent** — Retrieves an available agent `coordinator.ts:288-302`
- **getBranchManager** — Retrieves the branch manager `indexer-agent.ts:1538-1540`
- **getCpuUsage** — Returns the current CPU usage of the agent `base.ts:204-206`
- **getDumpStatistics** — Retrieves statistics about the dumped embeddings `semantic-agent.ts:1977-1979`
- **getEmbeddingDimensions** — Retrieves the dimensions of the embedding vectors `semantic-agent.ts:215-243`
- **getEmbeddingInitError** — Retrieves the error message if the embedding generator initialization failed `semantic-agent.ts:484-486`
- **getEmbeddingPoolStats** — Aggregates and returns embedding pool statistics `parser-agent.ts:602-670`
- **getEmbeddingProvider** — Retrieves the embedding provider instance `semantic-agent.ts:2137-2139`
- **getEmbeddingsCallback** — Returns a callback to handle embeddings accumulation `parser-agent.ts:549-564`
- **getEmbeddingSchedulerContext** — Retrieves the context for embedding scheduling `indexer-agent.ts:1349-1362`
- **getEmbeddingStats** — Retrieves statistics related to embedding operations `dev-agent.ts:2092-2094`
- **getEmbeddingStats** — Returns statistics related to embedding pools and worker configurations `parser-agent.ts:1879-1904`
- **getEmbeddingTextsCallback** — Returns a callback to handle embedding texts accumulation `parser-agent.ts:571-588`
- **getFileWatcherStatus** — Retrieves the status of the file watcher `indexer-agent.ts:1553-1562`
- **getGitEventContext** — Retrieves the context for a Git event `indexer-agent.ts:1482-1484`
- **getGitEventContextForProject** — Retrieves the context for a Git event in a project `indexer-agent.ts:1471-1477`
- **getGitWatcher** — Retrieves the Git watcher `indexer-agent.ts:1545-1548`
- **getGraph** — Retrieves the graph based on a query `query-agent.ts:156-160`
- **getIndexerAgent** — Returns the indexer agent `dev-agent.ts:118-120`
- **getIndexingStats** — Retrieves statistics related to the indexing process `indexer-agent.ts:1750-1752`
- **getLastOversizedWarning** — Retrieves the last oversized entities warning `semantic-agent.ts:201-203`
- **getMemoryUsage** — Returns the current memory usage of the agent `base.ts:201-203`
- **getMergeMetrics** — Retrieves merge metrics such as the number of merges performed and conflicts resolved `merge-agent.ts:361-363`
- **getMetrics** — Returns the current metrics of the agent `base.ts:210-212`
- **getOrCreateLanguagePool** — Retrieves or creates a language-specific embedding pool `parser-agent.ts:1264-1309`
- **getOrCreateWatcher** — Creates or retrieves a file watcher `indexer-agent.ts:1490-1533`
- **getParserStats** — Retrieves statistics for the parser `parser-agent.ts:1633-1635`
- **getPendingBatchStats** — Retrieves statistics for pending batches `indexer-agent.ts:1263-1269`
- **getPendingTasksCount** — Returns the number of pending tasks `conductor-orchestrator.ts:437-439`
- **getPerformanceMetrics** — Retrieves current performance metrics `conductor-orchestrator.ts:429-431`
- **getQueryMetrics** — Retrieves query metrics `query-agent.ts:205-216`
- **getSemanticMetrics** — Retrieves semantic analysis metrics `semantic-agent.ts:2111-2113`
- **getStorageMetrics** — Retrieves metrics related to the storage system `indexer-agent.ts:1757-1759`
- **getSuggestions** — Retrieves AI-generated suggestions for resolving conflicts `merge-agent.ts:337-356`
- **getTaskQueue** — Returns a copy of the task queue `base.ts:207-209`
- **getTeiBatchLog** — Fetches the batch log for TEI (Text Encoding Initiative) operations `dev-agent.ts:2096-2098`
- **getTotalMemoryMB** — Calculates the total memory usage in megabytes `parser-agent.ts:1921-1929`
- **getVectorStore** — Retrieves the vector store instance `semantic-agent.ts:2119-2121`
- **getWorkerEmbeddingConfig** — Retrieves the worker embedding configuration `semantic-agent.ts:493-562`
- **handleAnalyzeTask** — Handles an analysis task `semantic-agent.ts:751-753`
- **handleCloneDetectionTask** — Handles a clone detection task `semantic-agent.ts:755-757`
- **handleEmbedTask** — Handles an embedding generation task `semantic-agent.ts:729-738`
- **handleFileChange** — Handles changes to files and updates the parser accordingly `parser-agent.ts:1569-1590`
- **handleFileWatcherChanges** — Processes changes detected by the file watcher `indexer-agent.ts:1648-1681`
- **handleImplementationTask** — Handles implementation tasks `dev-agent.ts:292-308`
- **handleIncrementalEmbeddingGeneration** — Handles incremental embedding generation `semantic-agent.ts:997-1034`
- **handleIncrementalReindex** — A function to handle incremental reindexing tasks `dev-agent.ts:1703-2000`
- **handleIndexTask** — Handles indexing tasks `dev-agent.ts:232-290`
- **handleMessage** — Processes incoming messages from agents `conductor-orchestrator.ts:337-352`
- **handleMessage** — Handles incoming messages `coordinator.ts:234-250`
- **handleMessage** — Processes incoming messages and delegates tasks to appropriate agents `dev-agent.ts:200-203`
- **handleMessage** — A method to handle incoming messages `dora-agent.ts:140-142`
- **handleMessage** — Processes messages from the knowledge bus `indexer-agent.ts:1422-1466`
- **handleMessage** — Handles a message for the merge agent `merge-agent.ts:136-139`
- **handleMessage** — Handles messages related to parsing tasks `parser-agent.ts:939-978`
- **handleMessage** — Handles incoming messages by dispatching tasks based on the message type `query-agent.ts:68-68`
- **handleMessage** — Handles a message from the agent `semantic-agent.ts:712-725`
- **handleNewEntities** — Processes new entities for semantic analysis `semantic-agent.ts:1620-1820`
- **handleParseTask** — Parses code files and extracts entities and relationships `dev-agent.ts:329-373`
- **handleRefactorTask** — Handles the task of refactoring code based on a target description `dev-agent.ts:310-324`
- **handleRefactorTask** — Handles a refactoring task `semantic-agent.ts:759-761`
- **handleResourceAdjustment** — A function to handle resource adjustment tasks `dev-agent.ts:1645-1647`
- **handleResourceAdjustment** — Method to handle resource adjustment events from the knowledge bus `resource-adjustment-mixin.ts:27-42`
- **handleResourceAdjustment** — Adjusts resources based on current usage `semantic-agent.ts:2048-2050`
- **handleSearchRequest** — Handles search requests using the semantic agent `semantic-agent.ts:2071-2087`
- **handleSearchTask** — Handles a search task `semantic-agent.ts:740-749`
- **handleTaskCompleted** — Handles the completion of a task by an agent `conductor-orchestrator.ts:354-357`
- **handleTaskFailed** — Handles the failure of a task by an agent `conductor-orchestrator.ts:359-362`
- **hasPendingDump** — Checks if there are pending embeddings to be dumped `semantic-agent.ts:1970-1972`
- **hasResources** — Checks if an agent has the required resources `coordinator.ts:367-375`
- **importCache** — Imports necessary modules and dependencies for the parser agent `parser-agent.ts:1869-1873`
- **importCache** — Imports the semantic cache from a file or database `semantic-agent.ts:2158-2160`
- **incrementalUpdate** — Handles incremental updates to the graph `indexer-agent.ts:1274-1344`
- **indexEntities** — Indexes entities `indexer-agent.ts:499-821`
- **initEmbeddingPipeline** — Initializes the embedding pipeline for code `dev-agent.ts:503-616`
- **initialize** — Initializes the agent and sets its status to idle `base.ts:58-75`
- **initialize** — Initializes the semantic agent `semantic-agent.ts:398-409`
- **initializeDelegationEnforcement** — Initializes delegation enforcement for agents `conductor-orchestrator.ts:170-186`
- **initializeEmbeddingGenAsync** — Asynchronously initializes the embedding generator `semantic-agent.ts:430-454`
- **initializeGlobalCache** — Initializes the global embedding cache `semantic-agent.ts:2014-2028`
- **initializePerformanceOptimizations** — Initializes performance optimization settings `conductor-orchestrator.ts:364-371`
- **initializeWorkerPool** — Initializes a worker pool for the parser agent `parser-agent.ts:1118-1124`
- **initVectorProvider** — Initializes the vector provider for embeddings `dev-agent.ts:622-689`
- **isEmbeddingGenerationInProgress** — Checks if embedding generation is in progress `semantic-agent.ts:567-569`
- **isEmbeddingReady** — Checks if the embedding generator is ready `semantic-agent.ts:477-479`
- **isIdle** — Checks if an agent is idle based on the last seen time `conductor-orchestrator.ts:244-246`
- **isParserTask** — Checks if a task is a parser task `parser-agent.ts:1850-1852`
- **isTwoPhaseMode** — Determines if the agent is in two-phase mode `semantic-agent.ts:1984-1986`
- **killIfMemoryHigh** — Checks if memory usage is high and kills the agent if necessary `parser-agent.ts:1938-1969`
- **loadScore** — Calculates a score for agents based on their load `coordinator.ts:359-361`
- **markActivity** — Marks an agent as active `conductor-orchestrator.ts:251-253`
- **modelName** — Stores the name of the model being used `semantic-agent.ts:208-210`
- **onInitialize** — Initializes the orchestrator's internal state `conductor-orchestrator.ts:103-120`
- **onInitialize** — Initializes the coordinator agent `coordinator.ts:180-183`
- **onInitialize** — Initializes the agent `dev-agent.ts:122-187`
- **onInitialize** — A method to initialize the DoraAgent `dora-agent.ts:120-134`
- **onInitialize** — Initializes the indexer agent with necessary configurations and dependencies `indexer-agent.ts:311-382`
- **onInitialize** — Initializes the merge agent `merge-agent.ts:145-184`
- **onInitialize** — Initializes the parser agent with necessary configurations and resources `parser-agent.ts:721-734`
- **onInitialize** — Initializes the QueryAgent and sets up event listeners `query-agent.ts:70-82`
- **onInitialize** — Called when the semantic agent is initialized `semantic-agent.ts:415-425`
- **onShutdown** — Handles the shutdown process of the orchestrator `conductor-orchestrator.ts:122-157`
- **onShutdown** — Shuts down the coordinator agent `coordinator.ts:185-198`
- **onShutdown** — Handles shutdown operations for the development agent `dev-agent.ts:2100-2110`
- **onShutdown** — A method to handle shutdown of the DoraAgent `dora-agent.ts:162-164`
- **onShutdown** — Handles the shutdown process of the agent `indexer-agent.ts:1686-1745`
- **onShutdown** — Shuts down the merge agent `merge-agent.ts:186-199`
- **onShutdown** — Shuts down the parser agent, releasing resources and cleaning up `parser-agent.ts:742-771`
- **onShutdown** — Not implemented in the provided code `query-agent.ts:84-88`
- **onShutdown** — Called when the semantic agent is shut down `semantic-agent.ts:667-673`
- **onTaskCompleted** — Handles the completion of a task `coordinator.ts:410-413`
- **onTaskFailed** — Handles the failure of a task `coordinator.ts:415-419`
- **parseBatch** — Parses a batch of files using the parser agent `parser-agent.ts:1005-1083`
- **parseCSharpFiles** — Parses C# files using the specified parser `parser-agent.ts:1480-1564`
- **parseFile** — Parses a single file using the parser agent `parser-agent.ts:983-1000`
- **parseWithWorkers** — Parses files using a pool of worker processes `parser-agent.ts:1318-1474`
- **performMaintenance** — Performs maintenance tasks for the agent `indexer-agent.ts:1764-1781`
- **performRealIndexing** — Performs real indexing of code files `dev-agent.ts:827-1592`
- **performSemanticMerge** — Executes a semantic merge operation using the configured settings `merge-agent.ts:225-285`
- **pickHighestPriority** — Selects the agent with the highest priority `coordinator.ts:348-356`
- **pickLeastLoaded** — Selects the least loaded agent `coordinator.ts:335-346`
- **pickRoundRobin** — Selects the next agent in a round-robin fashion `coordinator.ts:328-333`
- **postIndexingCleanup** — Performs cleanup after indexing is complete `dev-agent.ts:695-797`
- **prepareIncrementalDiff** — Prepares an incremental diff for code changes `dev-agent.ts:392-497`
- **preSpawnPools** — Pre-spawns worker pools for the parser agent `parser-agent.ts:1133-1215`
- **process** — Processes a task if the agent can handle it, otherwise throws an error `base.ts:139-156`
- **processDataFilesParallel** — A function to process data files in parallel `dev-agent.ts:2009-2087`
- **processIncremental** — Processes incremental changes to files `parser-agent.ts:1088-1110`
- **processStandaloneComments** — Processes standalone comments for semantic analysis `semantic-agent.ts:1992-2006`
- **processTask** — Processes a task using registered agents `conductor-orchestrator.ts:163-168`
- **processTask** — Processes a task `coordinator.ts:208-228`
- **processTask** — Executes tasks such as indexing, implementation, and refactoring based on the task payload `dev-agent.ts:205-230`
- **processTask** — A method to process a task `dora-agent.ts:144-160`
- **processTask** — Processes a task by parsing entities, building relationships, and updating the graph storage `indexer-agent.ts:471-494`
- **processTask** — Processes a task for the merge agent `merge-agent.ts:109-134`
- **processTask** — Processes a task using the parser agent `parser-agent.ts:825-934`
- **processTask** — Not implemented in the provided code `query-agent.ts:94-107`
- **processTask** — Processes a given task `semantic-agent.ts:685-707`
- **queryGraph** — Queries the graph database `indexer-agent.ts:1378-1395`
- **querySubgraph** — Queries a subgraph of the graph `indexer-agent.ts:1400-1417`
- **queueForIndexing** — Queues entities for indexing `indexer-agent.ts:898-1091`
- **rebuildVectorIndex** — Rebuilds the vector index for semantic analysis `semantic-agent.ts:986-988`
- **receive** — Receives a message, emits a "message:received" event, and handles the message `base.ts:196-199`
- **register** — Registers an agent with the orchestrator `conductor-orchestrator.ts:192-206`
- **register** — Registers an agent with the coordinator `coordinator.ts:256-271`
- **reinitializeForProject** — Reinitializes the semantic agent for a new project `semantic-agent.ts:600-626`
- **resetEmbeddingStats** — Resets the statistics related to embedding operations `parser-agent.ts:1910-1916`
- **resetIdleFlushTimer** — Resets the timer for idle flush operations `indexer-agent.ts:842-892`
- **resolveEmbeddingCache** — Resolves the embedding cache for entities `semantic-agent.ts:1114-1203`
- **route** — Routes tasks to agents based on the specified load-balancing strategy `coordinator.ts:312-322`
- **runCrossDomainLinking** — A function to run cross-domain linking operations `dev-agent.ts:1598-1643`
- **runTask** — Executes a task, updates metrics, and emits events based on task success or failure `base.ts:227-256`
- **semanticSearch** — Performs semantic search using vector embeddings `semantic-agent.ts:765-806`
- **send** — Sends a message to the agent, emitting a "message:send" event `base.ts:192-194`
- **setAIResolver** — Configures the AI conflict resolver for the merge agent `merge-agent.ts:218-220`
- **setDependencies** — Sets dependencies for the merge agent `merge-agent.ts:208-213`
- **setEmbeddingConfig** — Sets the configuration for the embedding pool `parser-agent.ts:1642-1679`
- **setEmbeddingGenerator** — Sets the embedding generator for the parser agent `parser-agent.ts:700-716`
- **setFaissProvider** — Sets the Faiss provider for the embedding accumulator `parser-agent.ts:691-693`
- **setIncrementalMode** — Sets the parser to incremental mode `parser-agent.ts:1758-1764`
- **setIndexingComplete** — Marks indexing as complete `indexer-agent.ts:261-306`
- **setPoolMode** — Sets the parser to pool mode `parser-agent.ts:1715-1743`
- **setProjectContext** — Sets the project context `indexer-agent.ts:389-430`
- **setQueryAgent** — Sets the query agent for semantic analysis `semantic-agent.ts:2144-2146`
- **setRepositoryPath** — Sets the path to the repository being indexed `indexer-agent.ts:1567-1642`
- **setStreamingMode** — Sets the parser to streaming mode `parser-agent.ts:1688-1701`
- **setTotalFiles** — Sets the total number of files `indexer-agent.ts:219-256`
- **setupComponents** — Sets up the components required for the semantic agent `semantic-agent.ts:272-385`
- **setupEventHandlers** — Sets up event handlers for file changes `parser-agent.ts:1595-1615`
- **setVectorProvider** — Configures the vector provider for the embedding accumulator `parser-agent.ts:677-686`
- **shutdown** — Shuts down the agent and sets its status to shutdown `base.ts:77-82`
- **startHealthMonitor** — Starts a periodic health monitor for agents `coordinator.ts:381-397`
- **startHealthMonitoring** — Starts the health monitoring process `conductor-orchestrator.ts:264-281`
- **startHeartbeat** — Initiates the heartbeat loop for monitoring agent health `conductor-orchestrator.ts:314-335`
- **startPerformanceLoop** — Starts the performance monitoring loop `conductor-orchestrator.ts:377-395`
- **startResourceMonitoring** — No-op: disabled for Bun/OpenVINO compatibility `base.ts:220-222`
- **stopHealthMonitor** — Stops the periodic health monitor `coordinator.ts:399-404`
- **stopResourceMonitoring** — No-op `base.ts:223-225`
- **subscribeToKnowledgeBus** — Subscribes to the knowledge bus for updates `semantic-agent.ts:851-959`
- **subscribeToParseEvents** — Subscribes to parse events `indexer-agent.ts:439-454`
- **suggestRefactoring** — Provides refactoring suggestions based on code semantics `semantic-agent.ts:836-838`
- **switchBranch** — Switches the current branch in the project `semantic-agent.ts:632-662`
- **tryEagerRoslynStart** — A function to try starting Roslyn eagerly `dev-agent.ts:1671-1697`
- **unregister** — Unregisters an agent from the orchestrator `conductor-orchestrator.ts:208-215`
- **unregister** — Unregisters an agent from the coordinator `coordinator.ts:273-278`
- **updateAverageProcessingTime** — Adjusts the average processing time metric based on the duration of the current task `base.ts:279-282`
- **updateCacheHitRate** — Updates the rate at which cache hits occur `semantic-agent.ts:2103-2106`
- **updateCooccurrenceFromEntities** — Updates co-occurrence indices based on new entities `semantic-agent.ts:1827-1884`
- **updateEmbeddingTime** — Updates the time associated with embedding generation `semantic-agent.ts:2091-2095`
- **updateMergeMetrics** — Updates merge metrics after a successful merge `merge-agent.ts:425-431`
- **updatePerformanceMetrics** — Updates performance metrics based on agent activity `conductor-orchestrator.ts:397-413`
- **updateSearchTime** — Updates the time associated with search operations `semantic-agent.ts:2097-2101`
- **updateStats** — Updates statistics related to parsing tasks `parser-agent.ts:1620-1628`
- **waitForEmbeddingReady** — Waits for the embedding generator to be ready `semantic-agent.ts:459-472`
- **waitingCount** — Returns the number of tasks waiting in the queue `base.ts:188-190`
- **warmupSemanticCache** — Warms up the semantic cache for efficient queries `semantic-agent.ts:2034-2046`
- **wasGenerationRecentlyCompleted** — Checks if the last embedding generation was recently completed `semantic-agent.ts:574-576`
- **withProject** — Context manager for working with a specific project `semantic-agent.ts:582-591`

### Class
- **BaseAgent** — An abstract class representing an agent with various properties and methods `base.ts:21-283`
- **ConductorOrchestrator** — Class for managing multi-agent system lifecycle and health monitoring `conductor-orchestrator.ts:41-455`
- **CoordinatorAgent** — Manages multi-agent workflows `coordinator.ts:157-420`
- **DevAgent** — Handles implementation and indexing tasks `dev-agent.ts:89-2111`
- **DoraAgent** — A class representing a Dora agent `dora-agent.ts:110-165`
- **IndexerAgent** — A core agent responsible for storing and querying the code graph `indexer-agent.ts:159-1782`
- **MergeAgent** — Class representing the merge agent `merge-agent.ts:63-443`
- **ParserAgent** — Manages parsing operations, including worker pools, statistics, and streaming `parser-agent.ts:507-1970`
- **QueryAgent** — Represents a query agent that extends BaseAgent and handles graph-related tasks `query-agent.ts:35-217`
- **ResourceAdjustmentMixin** — Mixin class for handling resource adjustment logic `resource-adjustment-mixin.ts:19-43`
- **SemanticAgent** — Represents the semantic agent `semantic-agent.ts:152-2161`

### Interface
- **BunGlobal** — Interface for Bun global properties `conductor-orchestrator.ts:32-34`
- **CoordinatorConfig** — Configuration for the coordinator agent `coordinator.ts:67-74`
- **DoraPayload** — Represents a payload for a Dora task with various properties `dora-agent.ts:7-15`
- **EntityFilter** — An interface for filtering entities by name, type, or file path `query-agent.ts:12-16`
- **ImplementationTaskPayload** — Represents the payload for an implementation task, including a description `dev-agent.ts:58-60`
- **IndexerTask** — Represents a task for the indexer agent `indexer-agent.ts:91-102`
- **IndexingResult** — Represents the result of an indexing task, including files processed, entities extracted, relationships created, and statistics `dev-agent.ts:66-82`
- **IndexingTaskResult** — Represents the result of an indexing task, including files processed, entities extracted, relationships created, and statistics `dev-agent.ts:84-87`
- **IndexTaskPayload** — Represents the payload for an indexing task, including directory, incremental flag, exclude patterns, and batch mode `dev-agent.ts:51-56`
- **MergeAgentConfig** — Configuration for the MergeAgent, specifying repository path, fast path, semantic matching, and other merge-related settings `merge-agent.ts:25-34`
- **MergeAgentResult** — Result of a merge operation, including success status, merge result, applied actions, error, and merge metrics `merge-agent.ts:44-57`
- **ProvidedRelationship** — Represents a relationship between entities `indexer-agent.ts:82-89`
- **QueuedTask** — Represents a task that is queued for execution, containing the task details and functions to resolve or reject the task `base.ts:15-19`
- **RefactorTaskPayload** — Represents the payload for a refactor task, including a target `dev-agent.ts:62-64`
- **ResourceAdjustmentCapable** — Interface defining capabilities for resource adjustment `resource-adjustment-mixin.ts:10-17`
- **SemanticMergeOptions** — Options for semantic merge operations, including branch names, dry run, auto resolve, and AI suggestions `merge-agent.ts:36-42`
- **SemanticTaskPayload** — Represents the payload for a semantic task `semantic-agent.ts:137-145`
- **SimpleDependencyTree** — An interface representing a simple dependency tree with a root and children `query-agent.ts:23-26`
- **SimpleGraph** — An interface representing a simple graph with entities and relationships `query-agent.ts:18-21`
- **SimpleImpactAnalysis** — An interface representing a simple impact analysis with source, direct impact, transitive impact, and risk level `query-agent.ts:28-33`
- **TaskCompletedData** — Payload emitted on `task:completed` / `task:routed:completed `coordinator.ts:30-35`
- **TaskFailedData** — Payload emitted on `task:failed` / `task:routed:failed `coordinator.ts:38-43`

### Type_alias
- **CoordinatorConfigOverrides** — Partial configuration overrides for the coordinator `coordinator.ts:76-78`
- **EventfulAgent** — Agent that exposes an EventEmitter-style `on` method `coordinator.ts:48-50`
- **EventListener** — Function that listens to events `coordinator.ts:45-45`
- **LoadBalancingStrategy** — Load-balancing strategy type `coordinator.ts:65-65`
- **WorkerPool** — Defines a type for a worker pool `parser-agent.ts:505-505`

### Import_decl
- **../addons/csharp-native-parser.js** — Imports `../addons/csharp-native-parser.js` from `../addons/csharp-native-parser.js`. `parser-agent.ts:16-16`
- **../addons/index.js** — Imports `../addons/index.js` from `../addons/index.js`. `dev-agent.ts:10-10`, `parser-agent.ts:17-17`
- **../config/worker-embedding-config.js** — Imports `../config/worker-embedding-config.js` from `../config/worker-embedding-config.js`. `dev-agent.ts:11-11`
- **../config/yaml-config.js** — Imports `../config/yaml-config.js` from `../config/yaml-config.js`. `coordinator.ts:12-12`, `dev-agent.ts:12-12`, `dora-agent.ts:1-1`, `indexer-agent.ts:18-18`, `parser-agent.ts:21-21`, `query-agent.ts:2-2`, `semantic-agent.ts:30-30`
- **../core/branch-manager.js** — Imports `../core/branch-manager.js` from `../core/branch-manager.js`. `indexer-agent.ts:19-19`, `merge-agent.ts:11-11`
- **../core/file-watcher.js** — Imports `../core/file-watcher.js` from `../core/file-watcher.js`. `indexer-agent.ts:20-20`
- **../core/git-watcher.js** — Imports `../core/git-watcher.js` from `../core/git-watcher.js`. `indexer-agent.ts:21-21`
- **../core/knowledge-bus.js** — Imports `../core/knowledge-bus.js` from `../core/knowledge-bus.js`. `dev-agent.ts:13-13`, `dora-agent.ts:2-2`, `indexer-agent.ts:22-22`, `query-agent.ts:3-3`, `resource-adjustment-mixin.ts:8-8`, `semantic-agent.ts:31-31`
- **../logging/index.js** — Imports `../logging/index.js` from `../logging/index.js`. `base.ts:3-3`, `conductor-orchestrator.ts:10-10`, `coordinator.ts:13-13`, `dev-agent.ts:14-14`, `dora-agent.ts:3-3`, `indexer-agent.ts:23-23`, `merge-agent.ts:12-12`, `parser-agent.ts:22-22`, `query-agent.ts:4-4`, `semantic-agent.ts:32-32`
- **../merge/engine/ai-conflict-resolver.js** — Imports `../merge/engine/ai-conflict-resolver.js` from `../merge/engine/ai-conflict-resolver.js`. `merge-agent.ts:13-13`
- **../merge/engine/three-way-merger.js** — Imports `../merge/engine/three-way-merger.js` from `../merge/engine/three-way-merger.js`. `merge-agent.ts:14-14`
- **../merge/integration/git-integration.js** — Imports `../merge/integration/git-integration.js` from `../merge/integration/git-integration.js`. `merge-agent.ts:15-15`
- **../merge/models/merge-result.js** — Imports `../merge/models/merge-result.js` from `../merge/models/merge-result.js`. `merge-agent.ts:16-16`
- **../merge/models/semantic-conflict.js** — Imports `../merge/models/semantic-conflict.js` from `../merge/models/semantic-conflict.js`. `merge-agent.ts:17-17`
- **../nlp/cooccurrence-index.js** — Imports `../nlp/cooccurrence-index.js` from `../nlp/cooccurrence-index.js`. `semantic-agent.ts:33-33`
- **../nlp/query-expander.js** — Imports `../nlp/query-expander.js` from `../nlp/query-expander.js`. `semantic-agent.ts:34-34`
- **../parsers/language-configs.js** — Imports `../parsers/language-configs.js` from `../parsers/language-configs.js`. `parser-agent.ts:24-24`
- **../semantic/code-analyzer.js** — Imports `../semantic/code-analyzer.js` from `../semantic/code-analyzer.js`. `semantic-agent.ts:35-35`
- **../semantic/embedding-accumulator.js** — Imports `../semantic/embedding-accumulator.js` from `../semantic/embedding-accumulator.js`. `parser-agent.ts:25-25`, `semantic-agent.ts:36-36`
- **../semantic/embedding-dump.js** — Imports `../semantic/embedding-dump.js`. `semantic-agent.ts:37-47`
- **../semantic/embedding-generator.js** — Imports `../semantic/embedding-generator.js` from `../semantic/embedding-generator.js`. `semantic-agent.ts:48-48`
- **../semantic/embedding-warmup.js** — Imports `../semantic/embedding-warmup.js` from `../semantic/embedding-warmup.js`. `semantic-agent.ts:49-49`
- **../semantic/entity-expander.js** — Imports `../semantic/entity-expander.js`. `semantic-agent.ts:50-54`
- **../semantic/global-embedding-cache.js** — Imports `../semantic/global-embedding-cache.js` from `../semantic/global-embedding-cache.js`. `semantic-agent.ts:55-55`
- **../semantic/hybrid-search.js** — Imports `../semantic/hybrid-search.js` from `../semantic/hybrid-search.js`. `semantic-agent.ts:56-56`
- **../semantic/semantic-cache.js** — Imports `../semantic/semantic-cache.js` from `../semantic/semantic-cache.js`. `semantic-agent.ts:57-57`
- **../semantic/vector-store.js** — Imports `../semantic/vector-store.js` from `../semantic/vector-store.js`. `semantic-agent.ts:58-58`
- **../shared/git-worktree.js** — Imports `../shared/git-worktree.js` from `../shared/git-worktree.js`. `indexer-agent.ts:24-24`
- **../shared/indexing-context.js** — Imports `../shared/indexing-context.js` from `../shared/indexing-context.js`. `dev-agent.ts:15-15`, `semantic-agent.ts:59-59`
- **../shared/storage-paths.js** — Imports `../shared/storage-paths.js` from `../shared/storage-paths.js`. `dev-agent.ts:16-16`, `indexer-agent.ts:25-25`
- **../shared/storage-paths.js** — Imports `../shared/storage-paths.js`. `semantic-agent.ts:60-65`
- **../storage/batch-operations-libsql.js** — Imports `../storage/batch-operations-libsql.js` from `../storage/batch-operations-libsql.js`. `indexer-agent.ts:26-26`
- **../storage/cache-manager.js** — Imports `../storage/cache-manager.js` from `../storage/cache-manager.js`. `indexer-agent.ts:27-27`
- **../storage/graph-storage-factory.js** — Imports `../storage/graph-storage-factory.js` from `../storage/graph-storage-factory.js`. `dev-agent.ts:17-17`, `indexer-agent.ts:28-28`, `query-agent.ts:5-5`
- **../storage/graph-storage-factory.js** — Imports `../storage/graph-storage-factory.js`. `semantic-agent.ts:66-71`
- **../storage/graph-storage-libsql.js** — Imports `../storage/graph-storage-libsql.js` from `../storage/graph-storage-libsql.js`. `query-agent.ts:6-6`
- **../tracing/graph-cache.js** — Imports `../tracing/graph-cache.js` from `../tracing/graph-cache.js`. `indexer-agent.ts:29-29`
- **../types/agent.js** — Imports `../types/agent.js`. `base.ts:4-12`, `conductor-orchestrator.ts:11-19`, `coordinator.ts:14-22`
- **../types/agent.js** — Imports `../types/agent.js` from `../types/agent.js`. `dev-agent.ts:19-19`, `dora-agent.ts:4-4`, `indexer-agent.ts:31-31`, `merge-agent.ts:18-18`, `parser-agent.ts:26-26`, `query-agent.ts:7-7`, `semantic-agent.ts:72-72`
- **../types/errors.js** — Imports `../types/errors.js` from `../types/errors.js`. `base.ts:13-13`
- **../types/parser.js** — Imports `../types/parser.js` from `../types/parser.js`. `dev-agent.ts:20-20`, `indexer-agent.ts:32-32`, `semantic-agent.ts:73-73`
- **../types/parser.js** — Imports `../types/parser.js`. `parser-agent.ts:27-35`
- **../types/query.js** — Imports `../types/query.js` from `../types/query.js`. `query-agent.ts:8-8`
- **../types/semantic.js** — Imports `../types/semantic.js` from `../types/semantic.js`. `parser-agent.ts:36-36`, `semantic-agent.ts:74-74`
- **../types/semantic.js** — Imports `../types/semantic.js`. `semantic-agent.ts:75-86`
- **../types/storage.js** — Imports `../types/storage.js`. `indexer-agent.ts:33-42`
- **../types/storage.js** — Imports `../types/storage.js` from `../types/storage.js`. `indexer-agent.ts:43-43`, `query-agent.ts:9-9`, `semantic-agent.ts:87-87`
- **../utils/circuit-breaker.js** — Imports `../utils/circuit-breaker.js` from `../utils/circuit-breaker.js`. `semantic-agent.ts:88-88`
- **../utils/config-paths.js** — Imports `../utils/config-paths.js` from `../utils/config-paths.js`. `semantic-agent.ts:89-89`
- **../utils/fast-hash.js** — Imports `../utils/fast-hash.js` from `../utils/fast-hash.js`. `dev-agent.ts:21-21`, `indexer-agent.ts:44-44`, `semantic-agent.ts:90-90`
- **../utils/runtime-detection.js** — Imports `../utils/runtime-detection.js` from `../utils/runtime-detection.js`. `dev-agent.ts:22-22`, `indexer-agent.ts:45-45`, `semantic-agent.ts:91-91`
- **./base.js** — Imports `./base.js` from `./base.js`. `conductor-orchestrator.ts:20-20`, `coordinator.ts:23-23`, `dev-agent.ts:23-23`, `dora-agent.ts:5-5`, `indexer-agent.ts:46-46`, `merge-agent.ts:19-19`, `parser-agent.ts:37-37`, `query-agent.ts:10-10`, `semantic-agent.ts:95-95`
- **./conductor/index.js** — Imports `./conductor/index.js`. `conductor-orchestrator.ts:21-26`
- **./coordinator.js** — Imports `./coordinator.js` from `./coordinator.js`. `conductor-orchestrator.ts:27-27`
- **./dev/heuristic-parser.js** — Imports `./dev/heuristic-parser.js` from `./dev/heuristic-parser.js`. `dev-agent.ts:24-24`
- **./dev/incremental-indexer.js** — Imports `./dev/incremental-indexer.js` from `./dev/incremental-indexer.js`. `dev-agent.ts:25-25`
- **./dev/index.js** — Imports `./dev/index.js` from `./dev/index.js`. `dev-agent.ts:26-26`
- **./indexer-agent.js** — Imports `./indexer-agent.js` from `./indexer-agent.js`. `dev-agent.ts:27-27`
- **./indexer/entity-resolution.js** — Imports `./indexer/entity-resolution.js` from `./indexer/entity-resolution.js`. `indexer-agent.ts:47-47`
- **./indexer/external-placeholder.js** — Imports `./indexer/external-placeholder.js` from `./indexer/external-placeholder.js`. `indexer-agent.ts:48-48`
- **./indexer/git-event-handlers.js** — Imports `./indexer/git-event-handlers.js`. `indexer-agent.ts:49-57`
- **./indexer/relationship-builder.js** — Imports `./indexer/relationship-builder.js` from `./indexer/relationship-builder.js`. `indexer-agent.ts:59-59`
- **./indexer/stable-id.js** — Imports `./indexer/stable-id.js` from `./indexer/stable-id.js`. `indexer-agent.ts:60-60`
- **./parser-agent.js** — Imports `./parser-agent.js` from `./parser-agent.js`. `dev-agent.ts:29-29`
- **./query-agent.js** — Imports `./query-agent.js` from `./query-agent.js`. `semantic-agent.ts:96-96`
- **./resource-adjustment-mixin.js** — Imports `./resource-adjustment-mixin.js` from `./resource-adjustment-mixin.js`. `dev-agent.ts:30-30`, `semantic-agent.ts:97-97`
- **./semantic/cache-warmup.js** — Imports `./semantic/cache-warmup.js` from `./semantic/cache-warmup.js`. `semantic-agent.ts:98-98`
- **./semantic/comment-processor.js** — Imports `./semantic/comment-processor.js` from `./semantic/comment-processor.js`. `semantic-agent.ts:99-99`
- **./semantic/embedding-processor.js** — Imports `./semantic/embedding-processor.js`. `semantic-agent.ts:101-105`
- **./semantic/provider-config.js** — Imports `./semantic/provider-config.js`. `semantic-agent.ts:106-111`
- **./semantic/vector-index-manager.js** — Imports `./semantic/vector-index-manager.js` from `./semantic/vector-index-manager.js`. `semantic-agent.ts:112-112`
- **./workers/language-detection.js** — Imports `./workers/language-detection.js` from `./workers/language-detection.js`. `parser-agent.ts:38-38`
- **./workers/language-worker-pool.js** — Imports `./workers/language-worker-pool.js` from `./workers/language-worker-pool.js`. `parser-agent.ts:39-39`
- **./workers/parsing-subprocess-pool.js** — Imports `./workers/parsing-subprocess-pool.js`. `parser-agent.ts:40-44`
- **nanoid** — Imports `nanoid` from `nanoid`. `indexer-agent.ts:16-16`
- **node:crypto** — Imports `node:crypto` from `node:crypto`. `base.ts:1-1`, `parser-agent.ts:13-13`
- **node:events** — Imports `node:events` from `node:events`. `base.ts:2-2`, `parser-agent.ts:14-14`
- **node:fs** — Imports `node:fs` from `node:fs`. `dev-agent.ts:7-7`, `parser-agent.ts:15-15`
- **node:os** — Imports `node:os` from `node:os`. `dev-agent.ts:8-8`
- **node:path** — Imports `node:path` from `node:path`. `dev-agent.ts:9-9`
- **p-limit** — Imports `p-limit` from `p-limit`. `query-agent.ts:1-1`

### Property
- **_ready** — A boolean indicating whether the agent is ready to process tasks `base.ts:37-37`
- **acquired** — Indicates that a lock has been acquired `indexer-agent.ts:125-125`
- **acquired** — Returns a promise containing a boolean indicating acquisition status and a release function `indexer-agent.ts:134-134`
- **active** — Indicates whether a resource or entity is currently active `dev-agent.ts:1616-1616`
- **activeTask** — The currently active task being processed by the agent `base.ts:28-28`
- **AGENT_STALE_MS** — Time after which an agent is considered stale `conductor-orchestrator.ts:64-64`
- **agentId** — Identifies the agent that is currently handling a task `conductor-orchestrator.ts:354-354`
- **agentId** — Identifies the agent associated with the failed task `conductor-orchestrator.ts:359-359`
- **agentId** — Agent ID `coordinator.ts:32-32`
- **agentId** — Stores the unique identifier of the agent `coordinator.ts:40-40`
- **agentLastSeen** — Tracks the last seen time for each agent `conductor-orchestrator.ts:65-65`
- **agentLoadCache** — Cache for agent load times and timestamps `conductor-orchestrator.ts:47-47`
- **agents** — Map of agent types to their respective agent instances `conductor-orchestrator.ts:42-42`
- **agents** — Manages a collection of agents `coordinator.ts:158-158`
- **aiResolver** — AI conflict resolver for the merge agent `merge-agent.ts:67-67`
- **appliedActions** — List of actions applied during the merge `merge-agent.ts:47-47`
- **associationsByFile** — Stores associations by file `semantic-agent.ts:1318-1318`
- **autoResolve** — Boolean indicating whether automatic conflict resolution is enabled `merge-agent.ts:40-40`
- **autoResolveConflicts** — Represents whether automatic conflict resolution is enabled `merge-agent.ts:30-30`
- **autoResolved** — Number of conflicts auto-resolved during the merge `merge-agent.ts:53-53`
- **batchCount** — Counts the number of batches processed `semantic-agent.ts:1977-1977`
- **batchFlushThreshold** — The threshold for batch flush operations `indexer-agent.ts:186-186`
- **batchMode** — A boolean indicating whether the indexing task is in batch mode `dev-agent.ts:55-55`
- **batchOps** — Batch operations library for SQLite `indexer-agent.ts:161-161`
- **branchA** — Name of the first branch to merge `merge-agent.ts:37-37`
- **branchB** — Name of the second branch to merge `merge-agent.ts:38-38`
- **branchManager** — A manager for branch changes `indexer-agent.ts:163-163`
- **branchManager** — Branch manager for the merge agent `merge-agent.ts:68-68`
- **branchManager** — Branch manager instance used by the MergeAgent `merge-agent.ts:32-32`
- **bulkDropPromise** — Promise for dropping bulk indexes `indexer-agent.ts:208-208`
- **bulkIndexesDropped** — Indicates if bulk indexes are dropped `indexer-agent.ts:206-206`
- **bulkMode** — Enables bulk mode for semantic analysis operations `semantic-agent.ts:916-916`
- **bulkStagingEnabled** — Indicates if bulk staging is enabled `indexer-agent.ts:207-207`
- **Bun** — Not directly described in the provided code `conductor-orchestrator.ts:33-33`
- **bySeverity** — Categorizes conflicts by their severity `merge-agent.ts:297-297`
- **byType** — Categorizes conflicts by their type `merge-agent.ts:298-298`
- **cache** — Represents the cache for the semantic agent `semantic-agent.ts:156-156`
- **cacheHits** — Tracks the number of cache hits during embedding resolution `semantic-agent.ts:1115-1115`
- **cacheManager** — A manager for query cache `indexer-agent.ts:162-162`
- **cacheTtlMs** — Sets the time-to-live duration for cache entries in milliseconds `query-agent.ts:38-38`
- **capabilities** — The capabilities of the agent `base.ts:25-25`
- **capabilities** — Object containing maxConcurrency and methods for adjusting concurrency and batch size `resource-adjustment-mixin.ts:12-14`
- **cfg** — Configuration object for the coordinator `coordinator.ts:160-160`
- **change** — Represents a file change event `parser-agent.ts:1569-1569`
- **changedFiles** — The number of changed files during incremental indexing `dev-agent.ts:75-75`
- **changes** — The changes made to an entity `indexer-agent.ts:96-96`
- **changes** — Tracks changes to entities `indexer-agent.ts:1278-1278`
- **children** — A property representing the children of a dependency tree `query-agent.ts:25-25`
- **circuitBreaker** — Implements a circuit breaker pattern for reliable embedding generation `semantic-agent.ts:171-171`
- **code** — Represents the code for a semantic task `semantic-agent.ts:140-140`
- **codeAnalyzer** — Represents the code analyzer for the semantic agent `semantic-agent.ts:157-157`
- **codeFiles** — The number of code files processed during indexing `dev-agent.ts:70-70`
- **CommentExtractor** — Extracts comments from files `semantic-agent.ts:1319-1319`
- **commentsByFile** — Stores comments by file `semantic-agent.ts:1317-1317`
- **concurrencyLimiter** — Limits the number of concurrent tasks `query-agent.ts:39-39`
- **config** — Configuration for the conductor orchestrator `conductor-orchestrator.ts:43-43`
- **config** — Configuration for the merge agent `merge-agent.ts:64-64`
- **conflicts** — Stores the list of conflicts detected during the merge `merge-agent.ts:294-294`
- **conflictsDetected** — Number of conflicts detected during the merge `merge-agent.ts:52-52`
- **cooccurrenceIndex** — Manages co-occurrence indices for semantic analysis `semantic-agent.ts:195-195`
- **count** — Counts entities or operations in semantic analysis `semantic-agent.ts:916-916`
- **cpuUsage** — The CPU usage of the agent in percentage `base.ts:31-31`
- **currentRepositoryPath** — The current repository path `indexer-agent.ts:172-172`
- **dataFiles** — The number of data files processed during indexing `dev-agent.ts:71-71`
- **dedupeSaved** — Deduplicates saved entities `semantic-agent.ts:1120-1120`
- **defaultBatchSize** — Default batch size for indexing `dev-agent.ts:93-93`
- **defaultBatchSize** — The default batch size for embedding generation `semantic-agent.ts:168-168`
- **defaultMaxConcurrency** — Default maximum concurrency for indexing `dev-agent.ts:94-94`
- **defaultMaxConcurrency** — Default maximum concurrency value `resource-adjustment-mixin.ts:20-20`
- **defaultMaxConcurrency** — The default maximum concurrency for embedding generation `semantic-agent.ts:166-166`
- **defaultMemoryLimit** — Default memory limit for indexing `dev-agent.ts:95-95`
- **defaultMemoryLimit** — Default memory limit value `resource-adjustment-mixin.ts:21-21`
- **defaultMemoryLimit** — The default memory limit for embedding generation `semantic-agent.ts:167-167`
- **deletedEntities** — The number of deleted entities during incremental indexing `dev-agent.ts:79-79`
- **deletedEntityIds** — An array of deleted entity IDs during indexing `dev-agent.ts:72-72`
- **deletedEntityIds** — Stores the IDs of deleted entities `dev-agent.ts:397-397`
- **deletedFiles** — The number of deleted files during incremental indexing `dev-agent.ts:77-77`
- **depth** — The depth of an entity in the graph `indexer-agent.ts:99-99`
- **description** — The description of the implementation task `dev-agent.ts:59-59`
- **description** — A property of the DoraPayload interface `dora-agent.ts:8-8`
- **directImpact** — Stores an array of direct impact strings `query-agent.ts:30-30`
- **directImplementationAttempts** — Counter for direct implementation attempts `conductor-orchestrator.ts:45-45`
- **directory** — The directory path for the indexing task `dev-agent.ts:52-52`
- **diskSizeBytes** — Calculates the disk size used for embeddings `semantic-agent.ts:1977-1977`
- **draining** — A boolean indicating whether the agent is draining `base.ts:35-35`
- **dryRun** — Boolean indicating whether the merge should be a dry run `merge-agent.ts:39-39`
- **dumpBatchIndex** — Manages the index for dumped embedding batches `semantic-agent.ts:189-189`
- **earlyReturn** — Returns early from a function if a certain condition is met `dev-agent.ts:398-398`
- **EMBEDDING_DEBOUNCE_MS** — The debounce time for embedding generation `indexer-agent.ts:171-171`
- **embeddingAccumulator** — Accumulates binary embeddings for batch FAISS flush `parser-agent.ts:516-516`
- **embeddingBatchSize** — Specifies the batch size for embedding generation `semantic-agent.ts:165-165`
- **embeddingConfig** — Stores the configuration for embeddings `dev-agent.ts:850-850`
- **embeddingConfig** — Stores the result of building a worker embedding configuration `dev-agent.ts:887-887`
- **embeddingConfig** — Stores configuration for worker embeddings `parser-agent.ts:515-515`
- **embeddingDebounceAbort** — A flag to abort debounced embedding generation `indexer-agent.ts:170-170`
- **embeddingDim** — Represents the dimensionality of the embedding vectors `semantic-agent.ts:164-164`
- **embeddingGen** — Represents the embedding generator for the semantic agent `semantic-agent.ts:154-154`
- **embeddingInitError** — Stores any errors encountered during the initialization of the embedding model `semantic-agent.ts:163-163`
- **embeddingModelName** — Stores the name of the embedding model being used `semantic-agent.ts:184-184`
- **embeddingMutex** — Ensures thread safety for embedding generation `semantic-agent.ts:181-181`
- **embeddingReady** — Indicates whether the embedding model is ready for use `semantic-agent.ts:161-161`
- **embeddingReadyPromise** — A promise that resolves when the embedding model is ready `semantic-agent.ts:162-162`
- **entities** — Represents the entities extracted from code `dev-agent.ts:1058-1058`
- **entities** — A collection of entities or a representation of entities `dev-agent.ts:1137-1137`
- **entities** — Creates a map of entities by file, storing parsed entities and relationships `dev-agent.ts:1418-1418`
- **entities** — Processes data files in parallel and returns the count of entities and files `dev-agent.ts:2009-2009`
- **entities** — A collection of entities to be processed `indexer-agent.ts:94-94`
- **entities** — A collection of entities `indexer-agent.ts:190-190`
- **entities** — Stores a collection of entities `indexer-agent.ts:1097-1097`
- **entities** — Stores entities in the graph `indexer-agent.ts:1263-1263`
- **entities** — A property representing the entities in a graph `query-agent.ts:19-19`
- **entities** — Represents the entities involved in a semantic task `semantic-agent.ts:141-141`
- **entitiesExtracted** — The number of entities extracted during indexing `dev-agent.ts:68-68`
- **entitiesIndexed** — Represents the number of entities indexed `dev-agent.ts:85-85`
- **entitiesIndexed** — Number of entities indexed `indexer-agent.ts:503-503`
- **entityFlushThreshold** — The threshold for entity flush operations `indexer-agent.ts:187-187`
- **entityId** — The unique identifier of an entity `indexer-agent.ts:98-98`
- **entityId** — Represents the entity ID for tasks `query-agent.ts:47-47`
- **entityId** — Parses the entityId from the query parameter `query-agent.ts:52-52`, `query-agent.ts:53-53`
- **entityNameMap** — A map of entity names `indexer-agent.ts:195-195`
- **entitySuffixMap** — Maps entity types to their suffixes `indexer-agent.ts:196-196`
- **error** — Stores an error message related to a task failure `conductor-orchestrator.ts:359-359`
- **error** — Error message or error object `coordinator.ts:41-41`
- **error** — Indicates an error that occurred during the execution of a task `dev-agent.ts:1214-1214`
- **error** — Represents an error encountered during indexing `indexer-agent.ts:537-537`
- **error** — Handles errors during graph operations `indexer-agent.ts:750-750`
- **error** — Stores an array of error objects, each containing an item and an error message `indexer-agent.ts:1309-1309`
- **error** — Error message if the merge operation failed `merge-agent.ts:48-48`
- **errors** — Stores a list of errors encountered during indexing `indexer-agent.ts:750-750`
- **excludePatterns** — An array of patterns to exclude during indexing `dev-agent.ts:54-54`
- **exists** — Indicates whether the agent is currently running `indexer-agent.ts:1553-1553`
- **expiry** — Stores the expiry time of a cached result `query-agent.ts:37-37`
- **failed** — Indicates whether an entity processing failed `indexer-agent.ts:750-750`
- **fastPathEnabled** — Boolean indicating whether the fast path matching is enabled `merge-agent.ts:27-27`
- **filePath** — Represents the file path for processing `dev-agent.ts:330-330`
- **filePath** — The file path associated with an entity `indexer-agent.ts:95-95`
- **filePath** — The file path for the current entity `indexer-agent.ts:190-190`
- **filePath** — A property representing the file path of an entity `query-agent.ts:15-15`
- **files** — List of files to process `dev-agent.ts:178-178`
- **files** — Represents the files processed `dev-agent.ts:1058-1058`
- **files** — A collection of files or a representation of files `dev-agent.ts:2009-2009`
- **files** — Stores a collection of files `indexer-agent.ts:1097-1097`
- **files** — Tracks files in the graph `indexer-agent.ts:1263-1263`
- **files** — Manages files related to semantic analysis `semantic-agent.ts:916-916`
- **filesProcessed** — The number of files processed during indexing `dev-agent.ts:67-67`
- **filesToProcess** — Stores the list of files to be processed `dev-agent.ts:396-396`
- **fileWatcher** — A watcher for file changes `indexer-agent.ts:166-166`
- **fn** — A function or method `dev-agent.ts:1616-1616`
- **from** — Indicates the source of a relationship `indexer-agent.ts:83-83`
- **from** — Represents the source entity in a relationship `indexer-agent.ts:653-653`
- **fromId** — Represents the ID of the source entity in a relationship `indexer-agent.ts:653-653`
- **generated** — Represents the set of entities that have been generated `semantic-agent.ts:1043-1043`
- **gitIntegration** — Git integration for the merge agent `merge-agent.ts:65-65`
- **gitIntegration** — Git integration instance used by the MergeAgent `merge-agent.ts:33-33`
- **gitWatchers** — Git watchers for tracking changes `indexer-agent.ts:165-165`
- **globalCache** — A global cache for storing embeddings `semantic-agent.ts:192-192`
- **globalCacheHitCount** — Tracks the global cache hit count `semantic-agent.ts:1121-1121`
- **graphStorage** — A storage interface for the graph database `indexer-agent.ts:160-160`
- **HEALTH_CHECK_INTERVAL_MS** — Interval for health check loop `conductor-orchestrator.ts:61-61`
- **healthMonitorRunning** — Boolean indicating if the health monitor is running `conductor-orchestrator.ts:58-58`
- **healthMonitorTimer** — Manages the health monitoring timer `conductor-orchestrator.ts:256-256`
- **healthTimer** — Timer for health monitoring `coordinator.ts:163-163`
- **HEARTBEAT_INTERVAL_MS** — Interval for heartbeat loop `conductor-orchestrator.ts:60-60`
- **heartbeatRunning** — Boolean indicating if the heartbeat loop is running `conductor-orchestrator.ts:57-57`
- **heartbeatTimer** — Manages the heartbeat timer `conductor-orchestrator.ts:257-257`
- **hybridSearch** — Represents the hybrid search functionality for the semantic agent `semantic-agent.ts:155-155`
- **id** — A unique identifier for the agent `base.ts:22-22`
- **id** — Represents an entity ID `indexer-agent.ts:1278-1278`
- **id** — Unique identifier for a resource adjustment capable entity `resource-adjustment-mixin.ts:11-11`
- **IDLE_FLUSH_MS_ACTIVE** — Time in milliseconds for active idle flush `indexer-agent.ts:200-200`
- **IDLE_FLUSH_MS_PASSIVE** — Time in milliseconds for passive idle flush `indexer-agent.ts:201-201`
- **IDLE_THRESHOLD_MS** — Defines the time threshold for considering an agent idle `conductor-orchestrator.ts:68-68`
- **idleFlushAbort** — Aborts the idle flush process `indexer-agent.ts:199-199`
- **idleFlushRetries** — Number of retries for idle flush `indexer-agent.ts:203-203`
- **includeAISuggestions** — Boolean indicating whether AI suggestions for conflicts should be included `merge-agent.ts:41-41`
- **incremental** — A boolean indicating whether the indexing task is incremental `dev-agent.ts:53-53`
- **incremental** — Manages incremental updates in semantic analysis `semantic-agent.ts:940-940`
- **incrementalStats** — An object containing statistics for incremental indexing, including changed files, new files, deleted files, skipped files, and deleted entities `dev-agent.ts:74-80`
- **indexBatchSize** — Determines the size of batches for indexing `dev-agent.ts:92-92`
- **indexerAgent** — Indexes code files `dev-agent.ts:91-91`
- **indexingLock** — Lock for indexing operations `dev-agent.ts:98-98`
- **indexingStats** — Statistics for indexing operations `indexer-agent.ts:176-182`
- **initGate** — A promise that is used to initialize the agent `base.ts:38-38`
- **inserted** — Counts the number of embeddings inserted into the database `semantic-agent.ts:1895-1895`
- **isActiveIndexing** — Indicates whether indexing is currently active `indexer-agent.ts:202-202`
- **isGeneratingEmbeddings** — Indicates whether the agent is currently generating embeddings `semantic-agent.ts:177-177`
- **isProcessing** — Indicates whether the parser is currently processing `parser-agent.ts:512-512`
- **item** — Represents a parsed entity or relationship `indexer-agent.ts:537-537`
- **item** — Represents an item in the graph `indexer-agent.ts:750-750`
- **item** — Stores an array of error objects, each containing an item and an error message `indexer-agent.ts:1309-1309`
- **keepPoolsAlive** — Ensures worker pools remain alive for incremental parsing `parser-agent.ts:514-514`
- **key** — A key used to identify or access a specific entity or resource `dev-agent.ts:1616-1616`
- **knowledgeBus** — Manages event emission for knowledge bus `parser-agent.ts:511-511`
- **languagePools** — Stores a map of language-specific worker pools `parser-agent.ts:508-508`
- **languages** — Represents the languages involved in a semantic task `semantic-agent.ts:143-143`
- **lastActivity** — Tracks the last time an agent was active `conductor-orchestrator.ts:296-296`
- **lastError** — Stores the last error encountered by the agent `indexer-agent.ts:1553-1553`
- **lastFileWatcherError** — The last error from the file watcher `indexer-agent.ts:175-175`
- **lastGenerationCompleteTime** — Stores the time when the last embedding generation completed `semantic-agent.ts:178-178`
- **lastOversizedWarning** — Tracks the last oversized entities warning `semantic-agent.ts:174-174`
- **lastRejection** — The last rejection details for the agent `base.ts:32-32`
- **lastRequestTime** — Stores the timestamp of the last request received `conductor-orchestrator.ts:67-67`
- **limit** — Sets a limit for certain operations or data processing `semantic-agent.ts:2072-2072`
- **limit** — Represents the limit for a semantic task `semantic-agent.ts:144-144`
- **line** — The line number in the source file where an entity was parsed `indexer-agent.ts:88-88`
- **load** — Not directly described in the provided code `conductor-orchestrator.ts:47-47`
- **LOAD_CACHE_TTL** — Time-to-live for agent load cache entries `conductor-orchestrator.ts:48-48`
- **loadBalancingStrategy** — Load-balancing strategy for the coordinator `coordinator.ts:70-70`
- **manualReviewRequired** — Number of conflicts requiring manual review `merge-agent.ts:54-54`
- **matchedUnits** — Units matched during the merge `merge-agent.ts:51-51`
- **MAX_IDLE_RETRIES** — Maximum number of idle flush retries `indexer-agent.ts:204-204`
- **maxConcurrency** — Maximum concurrency for the coordinator `coordinator.ts:71-71`
- **maxConcurrency** — Maximum number of concurrent merge operations `merge-agent.ts:31-31`
- **maxConcurrency** — Maximum concurrency limit for resource adjustment `resource-adjustment-mixin.ts:13-13`
- **memoryLimit** — Memory limit for the coordinator `coordinator.ts:72-72`
- **memoryUsage** — The memory usage of the agent in megabytes `base.ts:30-30`
- **mergeMetrics** — Merge-specific metrics for the merge agent `merge-agent.ts:71-77`
- **mergeResult** — Contains the result of the merge operation `merge-agent.ts:46-46`
- **mergeTimeMs** — Time taken for the merge operation in milliseconds `merge-agent.ts:55-55`
- **metadata** — Additional information about an entity `indexer-agent.ts:88-88`
- **metrics** — An object containing metrics for the agent `base.ts:29-29`
- **MIN_IDLE_FLUSH_FILES** — Minimum number of files to trigger idle flush `indexer-agent.ts:205-205`
- **ms** — Represents a variable or constant in the code `dev-agent.ts:2096-2096`
- **n** — Represents a variable or constant in the code `dev-agent.ts:2096-2096`
- **name** — A property representing the name of an entity `query-agent.ts:13-13`
- **newAgentLimit** — New agent limit value for resource adjustment `resource-adjustment-mixin.ts:30-30`
- **newBranch** — Manages new branches in semantic analysis `semantic-agent.ts:924-924`
- **newFiles** — The number of new files during incremental indexing `dev-agent.ts:76-76`
- **newMemoryLimit** — New memory limit value for resource adjustment `resource-adjustment-mixin.ts:29-29`
- **oldBranch** — Manages old branches in semantic analysis `semantic-agent.ts:924-924`
- **on** — Method to subscribe to events `coordinator.ts:49-49`
- **onStreamingResult** — Handles callbacks for streaming results `parser-agent.ts:518-518`
- **originalIndexToHash** — Stores a list of original indices mapped to their corresponding hashes `semantic-agent.ts:1116-1116`
- **parserAgent** — Parses code files `dev-agent.ts:90-90`
- **payload** — The data associated with an indexer task `indexer-agent.ts:93-101`
- **pending** — Tracks pending tasks `coordinator.ts:162-162`
- **pendingEmbeddingGeneration** — A flag indicating pending embedding generation `indexer-agent.ts:169-169`
- **pendingFilesCount** — The count of pending files `indexer-agent.ts:191-191`
- **pendingParsedEntities** — Pending parsed entities `indexer-agent.ts:190-190`
- **pendingRelationships** — Pending relationships `indexer-agent.ts:189-189`
- **pendingStorageEntities** — Pending storage entities `indexer-agent.ts:188-188`
- **pendingTasks** — Map of pending tasks to their respective agent tasks `conductor-orchestrator.ts:44-44`
- **PERFORMANCE_INTERVAL_MS** — Interval for performance loop `conductor-orchestrator.ts:63-63`
- **performanceLoopRunning** — Boolean indicating if the performance loop is running `conductor-orchestrator.ts:59-59`
- **performanceMetrics** — Metrics for performance tracking `conductor-orchestrator.ts:49-54`
- **performanceTimer** — Manages the performance timer `conductor-orchestrator.ts:258-258`
- **perfTimings** — Performance timings for the indexing task `dev-agent.ts:81-81`
- **persistentCacheHitCount** — Tracks the persistent cache hit count `semantic-agent.ts:1122-1122`
- **priority** — Priority for the coordinator `coordinator.ts:73-73`
- **priority** — Priority level for the agent `dev-agent.ts:160-160`
- **priority** — A property of the DoraPayload interface `dora-agent.ts:11-11`
- **processed** — Indicates whether an entity has been processed `indexer-agent.ts:750-750`
- **query** — A query to be executed on the graph database `indexer-agent.ts:97-97`
- **query** — Executes a query using the semantic agent `semantic-agent.ts:2072-2072`
- **query** — Represents the query for a semantic task `semantic-agent.ts:139-139`
- **queryExpander** — Expands queries for more accurate semantic search `semantic-agent.ts:196-196`
- **ready** — A flag indicating the agent is ready `indexer-agent.ts:174-174`
- **reason** — Represents the reasoning process of the semantic agent `semantic-agent.ts:901-901`
- **reject** — A function to reject a queued task with an error `base.ts:18-18`
- **relationships** — Represents the relationships between entities `dev-agent.ts:1137-1137`
- **relationships** — A collection of relationships between entities `dev-agent.ts:1418-1418`
- **relationships** — A collection of relationships `indexer-agent.ts:100-100`
- **relationships** — Stores a collection of relationships `indexer-agent.ts:1097-1097`
- **relationships** — Manages relationships between entities `indexer-agent.ts:1263-1263`
- **relationships** — A property representing the relationships in a graph `query-agent.ts:20-20`
- **relationshipsCreated** — The number of relationships created during indexing `dev-agent.ts:69-69`
- **relationshipsCreated** — Represents the number of relationships created `dev-agent.ts:86-86`
- **relationshipsCreated** — Number of relationships created `indexer-agent.ts:503-503`
- **release** — Releases a lock `indexer-agent.ts:125-125`
- **release** — Returns a promise containing a boolean indicating acquisition status and a release function `indexer-agent.ts:134-134`
- **repoPath** — Repository path used by the MergeAgent `merge-agent.ts:26-26`
- **repositoryPath** — Path to the repository `dev-agent.ts:178-178`
- **repositoryPath** — Stores the repository path for semantic analysis `semantic-agent.ts:924-924`
- **resolve** — A function to resolve a queued task with a result `base.ts:17-17`
- **resourceConstraints** — Represents the resource constraints for task execution `coordinator.ts:77-77`
- **resourceConstraints** — Resource constraints for the coordinator `coordinator.ts:68-68`
- **resourceMixin** — Mixin for resource adjustment `dev-agent.ts:96-96`
- **resourceMixin** — Mixes resource management functionalities into the semantic agent `semantic-agent.ts:169-169`
- **result** — Result of the task `coordinator.ts:33-33`
- **result** — Represents the outcome of an indexing or implementation task `dev-agent.ts:1214-1214`
- **riskLevel** — A property representing the risk level of an impact analysis `query-agent.ts:32-32`
- **root** — A property representing the root of a dependency tree `query-agent.ts:24-24`
- **rrIndex** — Index for round-robin task routing `coordinator.ts:161-161`
- **scope** — A property of the DoraPayload interface `dora-agent.ts:13-13`
- **semanticMatchingEnabled** — Boolean indicating whether semantic matching is enabled `merge-agent.ts:28-28`
- **semanticMetrics** — Represents semantic analysis metrics `semantic-agent.ts:245-252`
- **semanticThreshold** — Threshold value for semantic matching `merge-agent.ts:29-29`
- **skipped** — Indicates the set of entities that were skipped during processing `semantic-agent.ts:1043-1043`
- **skipped** — Counts the number of embeddings skipped during insertion `semantic-agent.ts:1895-1895`
- **skippedFiles** — The number of skipped files during incremental indexing `dev-agent.ts:78-78`
- **source** — Source code for the agent `dev-agent.ts:178-178`
- **source** — A property representing the source of an impact analysis `query-agent.ts:29-29`
- **source** — Represents the source of semantic analysis data `semantic-agent.ts:916-916`
- **sourceFile** — The file from which an entity was parsed `indexer-agent.ts:86-86`
- **stats** — Statistics about the merge operation `merge-agent.ts:49-56`
- **stats** — Tracks merge statistics such as units analyzed, conflicts detected, and merge time `merge-agent.ts:295-299`
- **stats** — Tracks statistics for parsing operations `parser-agent.ts:513-513`
- **stats** — Tracks query statistics such as queries, total time, hits, and misses `query-agent.ts:40-40`
- **status** — The current status of the agent `base.ts:24-24`
- **status** — Represents the current status of the agent `indexer-agent.ts:1553-1553`
- **stopped** — A flag indicating whether the orchestrator is stopped `conductor-orchestrator.ts:66-66`
- **stopped** — Indicates if the coordinator is stopped `coordinator.ts:164-164`
- **storage** — Stores the graph storage instance `query-agent.ts:36-36`
- **streamingMode** — Enables streaming mode for sending results as they become ready `parser-agent.ts:517-517`
- **subscriptionIds** — Subscription IDs for tracking `indexer-agent.ts:173-173`
- **success** — Indicates whether the merge operation was successful `merge-agent.ts:45-45`
- **supported** — Tracks the number of supported files `parser-agent.ts:1016-1016`
- **target** — The target of the refactor task `dev-agent.ts:63-63`
- **target** — A property of the DoraPayload interface `dora-agent.ts:12-12`
- **targetAgent** — Target agent for task delegation `dev-agent.ts:160-160`
- **targetAgent** — A property of the DoraPayload interface `dora-agent.ts:9-9`
- **targetFile** — The file to which an entity was parsed `indexer-agent.ts:87-87`
- **task** — An instance of an AgentTask `base.ts:16-16`
- **task** — Represents a task that needs to be executed by an agent `conductor-orchestrator.ts:354-354`
- **task** — Handles the failure of a task by logging an error and potentially shutting down the agent `conductor-orchestrator.ts:359-359`
- **task** — Agent task `coordinator.ts:31-31`
- **task** — Represents the task to be executed by the agent `coordinator.ts:39-39`
- **taskDispatch** — Dispatches tasks based on message types `query-agent.ts:42-54`
- **taskId** — Unique identifier for a task `dev-agent.ts:160-160`
- **taskId** — A property of the DoraPayload interface `dora-agent.ts:10-10`
- **taskQueueLimit** — Task queue limit for the coordinator `coordinator.ts:69-69`
- **tasks** — An array of tasks that the agent is currently handling `base.ts:27-27`
- **textsNeedingGeneration** — Identifies texts that need to be generated `semantic-agent.ts:1118-1118`
- **textsNeedingGenerationHashes** — Stores hashes of texts that need to be generated `semantic-agent.ts:1119-1119`
- **threeWayMerger** — Three-way merger for the merge agent `merge-agent.ts:66-66`
- **threshold** — Represents the threshold for a semantic task `semantic-agent.ts:142-142`
- **timestamp** — Not directly described in the provided code `conductor-orchestrator.ts:47-47`
- **timestamp** — Tracks the timestamp of semantic analysis operations `semantic-agent.ts:901-901`
- **to** — Indicates the target of a relationship `indexer-agent.ts:84-84`
- **to** — Represents the target entity in a relationship `indexer-agent.ts:653-653`
- **toId** — Represents the ID of the target entity in a relationship `indexer-agent.ts:653-653`
- **total** — Tracks the total number of files processed `parser-agent.ts:1016-1016`
- **totalConflicts** — Counts the total number of conflicts detected during the merge `merge-agent.ts:296-296`
- **totalEmbeddings** — Tracks the total number of embeddings processed `semantic-agent.ts:1977-1977`
- **totalFiles** — The total number of files processed during indexing `dev-agent.ts:73-73`
- **totalUnitsAnalyzed** — Total units analyzed during the merge `merge-agent.ts:50-50`
- **transitiveImpact** — A property representing the transitive impact of an analysis `query-agent.ts:31-31`
- **ttlCache** — Manages a time-to-live cache for query results `query-agent.ts:37-37`
- **twoPhaseMode** — Indicates whether the agent is in two-phase mode `semantic-agent.ts:188-188`
- **type** — The type of the agent `base.ts:23-23`
- **type** — Specifies the type of a relationship `indexer-agent.ts:85-85`
- **type** — Represents the type of indexer agent, either "index:entities", "index:incremental", "query:graph", or "query:subgraph" `indexer-agent.ts:92-92`
- **type** — Represents the type of the entity `query-agent.ts:47-47`
- **type** — A property representing the type of an entity `query-agent.ts:14-14`
- **type** — Represents the type of a semantic task `semantic-agent.ts:138-138`
- **uniqueTexts** — Stores unique texts for processing `semantic-agent.ts:1117-1117`
- **universalPool** — Represents a single universal worker pool for all languages in incremental mode `parser-agent.ts:509-509`
- **useUniversalPool** — Determines whether to use a single universal pool instead of per-language pools `parser-agent.ts:510-510`
- **value** — Stores the value of a cached result `query-agent.ts:37-37`
- **vectorIndexManager** — Manages the vector index for semantic search and analysis `semantic-agent.ts:158-158`
- **vectorStore** — Represents the vector store for the semantic agent `semantic-agent.ts:153-153`
- **waiting** — An array of queued tasks that are waiting to be processed `base.ts:34-34`

## Submodules

| Submodule | Description |
|-----------|-------------|
| [conductor/](./conductor/AUTODOC.md) | Task orchestration, complexity analysis, method proposals |
| [dev/](./dev/AUTODOC.md) | File collection, extension classification, heuristic parsing |
| [indexer/](./indexer/AUTODOC.md) | Entity resolution, relationship building, git event handlers |
| [semantic/](./semantic/AUTODOC.md) | Cache warmup, embedding processing, vector index management |
| [workers/](./workers/AUTODOC.md) | Worker pools, subprocess management, language detection |
| [strategies/](./strategies/AUTODOC.md) | Delegation strategy for task routing |

## Data Flow

### Inputs

| Source | Type | Description |
|--------|------|-------------|
| MCP tool calls | `AgentTask` | Tasks routed via ConductorOrchestrator |
| Git events | branch/file changes | Triggers incremental reindexing via KnowledgeBus |
| YAML config | `ConductorConfig` | Per-agent concurrency, memory, priority settings |

### Processing

| Step | Component | Description |
|------|-----------|-------------|
| 1. Accept | `ConductorOrchestrator` | Task complexity analysis (1-10 scale) |
| 2. Route | `CoordinatorAgent` | Least-loaded / round-robin / priority selection |
| 3. Queue | `BaseAgent.enqueue()` | FIFO async queue with maxQueueSize backpressure |
| 4. Execute | Agent-specific `processTask()` | Parsing, indexing, embedding, querying |
| 5. Emit | EventEmitter | `task:completed` or `task:failed` events |

### Outputs

| Target | Type | Description |
|--------|------|-------------|
| GraphStorage | Entities, Relationships | Indexed code graph via IndexerAgent |
| VectorStore | Embeddings | Semantic vectors via SemanticAgent |
| KnowledgeBus | Events | PARSE_COMPLETE, FILE_CHANGED, CACHE_UPDATED |
| Caller | `Promise<unknown>` | Task result or AgentBusyError |

## Public API

| Export | Type | Description | Location |
|--------|------|-------------|----------|
| `BaseAgent` | abstract class | Task queue, EventEmitter, Agent interface | [`base.ts:27-394`](./base.ts) |
| `ConductorOrchestrator` | class | Agent lifecycle, health, delegation | [`conductor-orchestrator.ts:41-458`](./conductor-orchestrator.ts) |
| `CoordinatorAgent` | class | Load balancer, AgentPool impl | [`coordinator.ts:146-436`](./coordinator.ts) |
| `DevAgent` | class | Code indexing, delegates to Parser/Indexer | [`dev-agent.ts:87-1816`](./dev-agent.ts) |
| `DoraAgent` | class | Research and exploration tasks | [`dora-agent.ts:46-254`](./dora-agent.ts) |
| `IndexerAgent` | class | Graph indexing, git events, branch-aware | [`indexer-agent.ts:105-105`](./indexer-agent.ts) |
| `MergeAgent` | class | 3-way semantic merge, AI conflict resolution | [`merge-agent.ts:63-441`](./merge-agent.ts) |
| `ParserAgent` | class | Multi-language parsing via tree-sitter/Roslyn | [`parser-agent.ts:490-1865`](./parser-agent.ts) |
| `QueryAgent` | class | Graph queries, impact analysis, hotspots | [`query-agent.ts:35-217`](./query-agent.ts) |
| `SemanticAgent` | class | Embeddings, hybrid search, code analysis | [`semantic-agent.ts:147-1797`](./semantic-agent.ts) |
| `ResourceAdjustmentMixin` | class | Dynamic resource adjustment mixin | [`resource-adjustment-mixin.ts:19-43`](./resource-adjustment-mixin.ts) |
| `ResourceAdjustmentCapable` | interface | Marker for adjustable agents | [`resource-adjustment-mixin.ts:10-17`](./resource-adjustment-mixin.ts) |
| `isEventfulAgent` | function | Type guard for EventEmitter agents | [`coordinator.ts:67-74`](./coordinator.ts) |
| `devAgent` | singleton | Global DevAgent instance | [`dev-agent.ts:1819-1819`](./dev-agent.ts) |
| `doraAgent` | singleton | Global DoraAgent instance | [`dora-agent.ts:257-257`](./dora-agent.ts) |

## Dependencies

### Internal

| Module | Usage |
|--------|-------|
| `src/logging` | Structured logging: log.i(), log.e(), log.d(), log.t(), log.w() |
| `src/types/agent.ts` | AgentType, AgentStatus, Agent, AgentTask, AgentPool |
| `src/types/errors.ts` | AgentBusyError, AgentBusyDetails |
| `src/types/parser.ts` | ParsedEntity, EntityRelationship, ParseResult |
| `src/types/storage.ts` | GraphStorage, Entity, Relationship, EntityType |
| `src/config/yaml-config.ts` | getConfig(), ConfigLoader.getInstance() |
| `src/core/knowledge-bus.ts` | knowledgeBus.subscribe(), publish() |
| `src/core/branch-manager.ts` | BranchManager for git branch tracking |
| `src/storage/graph-storage-factory.ts` | getGraphStorage(), DatabaseCorruptionError |
| `src/utils/circuit-breaker.ts` | CircuitBreaker for SemanticAgent |
| `src/semantic/` | EmbeddingGenerator, VectorStore, HybridSearchEngine |
| `src/merge/` | ThreeWayMerger, AIConflictResolver, GitIntegration |

### External

| Package | Usage |
|---------|-------|
| `node:events` | EventEmitter base for all agents |
| `node:crypto` | randomUUID() for task/agent IDs |
| `node:fs` | readFileSync, statSync for file operations |
| `nanoid` | Short unique IDs |
| `p-limit` | Concurrency limiter in QueryAgent |

## Configuration

| Key | Default | Description |
|-----|---------|-------------|
| `conductor.maxConcurrency` | 100 | Max concurrent tasks for orchestrator |
| `conductor.complexity.threshold` | 8 | Score triggering mandatory delegation |
| `conductor.loadBalancingStrategy` | `least-loaded` | `least-loaded`, `round-robin`, `priority` |
| `devAgent.maxConcurrency` | 3 | DevAgent parallel task limit |
| `indexer.maxConcurrency` | 8 | IndexerAgent parallel task limit |
| `indexer.batchSize` | 1000 | Entities per indexing batch |
| `semanticAgent.maxConcurrency` | 5 | SemanticAgent parallel task limit |
| `semanticAgent.batchSize` | 8 | Embeddings per generation batch |
| `queryAgent.maxConcurrency` | 10 | QueryAgent parallel task limit |
| `parser.agent.workerPoolSize` | 8 | Tree-sitter worker pool size |
| `git.debounceMs` | 60000 | Embedding generation debounce after git events |

## Behavioral Properties

- **Task Queue**: Dual mode -- `process()` for immediate execution, `enqueue()` for async FIFO with backpressure (maxQueueSize=1000).
- **Health Monitoring**: Heartbeat every 10s, health check every 30s, stale agent detection at 60s idle.
- **Load Balancing**: Least-loaded (default), round-robin, or priority-based agent selection.
- **Delegation**: Tasks scored 1-10; threshold (default 8) triggers mandatory delegation to sub-agents.
- **Batch Indexing**: Flushes every 200 files (BATCH_FLUSH_THRESHOLD), idle flush after 10s of inactivity.
- **Two-Phase Embedding**: SemanticAgent dumps to disk then inserts to DB (Bun+OpenVINO workaround).
- **Circuit Breaker**: SemanticAgent uses CircuitBreaker to prevent cascading embedding failures.
- **Semantic Merge**: Fast-path hash matching (90%+), semantic matching for refactored code, AI conflict resolution.
- **Singletons**: devAgent, doraAgent, ConfigLoader, GraphStorage, GlobalEmbeddingCache persist across sessions.
- **Bun Compatibility**: Async loops replace setInterval; memory monitoring disabled for OpenVINO safety.

## Error Handling

| Error | Source | Recovery |
|-------|--------|----------|
| `AgentBusyError` | BaseAgent.process() | Retry after `retryAfterMs`; includes queue/memory details |
| Task execution errors | Agent-specific processTask() | Emitted via `task:failed`; propagated to caller |
| Parser init failure | DevAgent | Graceful degradation to heuristic parser (warning logged) |
| Indexer init failure | DevAgent | Fatal; throws with error log |
| `DatabaseCorruptionError` | IndexerAgent | Handled by `handleDatabaseCorruption()` |
| Embedding failures | SemanticAgent | Circuit breaker prevents cascading; auto-recovery |
| Queue full | BaseAgent.enqueue() | AgentBusyError with backpressure signal |

## Observability

| Category | Mechanism | Details |
|----------|-----------|---------|
| Logging | `log.{d,t,i,w,e}(category, code, data)` | Categories: BASEAGENT, CONDUCTOR, DEVAGENT, INDEXER, SEMANTIC, MERGE |
| Metrics | `getMetrics(): AgentMetrics` | tasksProcessed, tasksSucceeded, tasksFailed, avgProcessingTime |
| Events | EventEmitter | `task:completed`, `task:failed`, `agent:registered`, `heartbeat` |
| KnowledgeBus | publish/subscribe | PARSE_COMPLETE, FILE_CHANGED, CACHE_UPDATED topics |
| Query metrics | `QueryAgent.getQueryMetrics()` | totalQueries, avgQueryTime, cacheHitRate |
| Conductor metrics | `performanceMetrics` | totalTasks, avgProcessingTime, overheadReduction, cacheHitRate |

## Known Limitations

1. **Memory monitoring disabled** -- Bun+OpenVINO crash workaround; limits advisory only.
2. **CPU usage estimated** -- Reports 50% when BUSY, 5% when IDLE; no actual process tracking.
3. **Parser optional** -- web-tree-sitter ESM issues; falls back to heuristic parser losing AST detail.
4. **OpenVINO concurrency** -- Mutex prevents concurrent native calls; two-phase mode has perf impact.
5. **Branch LRU eviction** -- maxTotalBranches=50; oldest branches evicted, losing historical index data.
6. **setInterval disabled for Bun** -- Async loops used; not available during startup crashes.
7. **Bypass detection heuristic** -- `isDirectImplementation()` may not catch all delegation bypass attempts.

## TypeScript Notes

### Event Map

| Event | Emitter | Payload |
|-------|---------|---------|
| `task:completed` | BaseAgent | `{ agentId, task }` |
| `task:failed` | BaseAgent | `{ agentId, task, error }` |
| `agent:registered` | ConductorOrchestrator | `agentId: string` |
| `agent:unhealthy` | ConductorOrchestrator | `agentId: string` |
| `heartbeat` | ConductorOrchestrator | `{ agentId, status, timestamp }` |
| `task:routed:completed` | CoordinatorAgent | `taskData` |
| `task:routed:failed` | CoordinatorAgent | `taskData` |

### Module Boundary

- `Agent` interface from `src/types/agent.ts` defines the contract all agents implement.
- `AgentPool` interface implemented by `CoordinatorAgent` for agent registration and routing.
- `ResourceAdjustmentCapable` interface marks agents supporting dynamic concurrency/batch adjustment.
- `isEventfulAgent()` type guard narrows `Agent` to agents with `.on()` for event subscription.
- `AgentType` enum: COORDINATOR, DEV, DORA, INDEXER, MERGE, PARSER, QUERY, SEMANTIC.
- `AgentStatus` enum: IDLE, BUSY, ERROR, SHUTDOWN.

## Files

| File | Lines | Description |
|------|-------|-------------|
| [`base.ts`](./base.ts) | 394 | Abstract base class; task queue, async processing, EventEmitter |
| [`conductor-orchestrator.ts`](./conductor-orchestrator.ts) | 458 | Central orchestrator; agent lifecycle, health, delegation |
| [`coordinator.ts`](./coordinator.ts) | 436 | Load balancer and fallback agent; implements AgentPool |
| [`dev-agent.ts`](./dev-agent.ts) | 1819 | Code indexing; delegates to Parser and Indexer agents |
| [`dora-agent.ts`](./dora-agent.ts) | 257 | Research and exploration tasks |
| [`indexer-agent.ts`](./indexer-agent.ts) | 1557 | Graph indexing; relationships, entity resolution, git events |
| [`merge-agent.ts`](./merge-agent.ts) | 441 | Semantic 3-way merge; conflict resolution |
| [`parser-agent.ts`](./parser-agent.ts) | 1865 | Multi-language parsing; tree-sitter, Roslyn, workers |
| [`query-agent.ts`](./query-agent.ts) | 348 | Graph queries; impact analysis, hotspots, cycles |
| [`resource-adjustment-mixin.ts`](./resource-adjustment-mixin.ts) | 68 | Dynamic resource adjustment; Template Method pattern |
| [`semantic-agent.ts`](./semantic-agent.ts) | 2172 | Embeddings, hybrid search, code analysis, caching |
