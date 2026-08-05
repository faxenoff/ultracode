# Faiss

## 🤖 Overview

The `faiss` module provides a high-performance vector indexing solution using the Faiss library, accessible via NAPI bindings. It is used by developers and data scientists to efficiently manage and query large-scale vector data. The module includes both low-level client interfaces and high-level providers for hybrid hot/cold index integration.

## 🤖 Architecture

```
  [faiss-client.ts] -> [faiss-provider.ts]
  [faiss-provider.ts] -> [layered-faiss-provider.ts]
  [layered-faiss-provider.ts] -> [base-branch-detector.ts]
  [base-branch-detector.ts] -> [provider-interface.ts]
  [provider-interface.ts] -> [types.ts]
```

## 🤖 Flow

```
  [types.ts] -> [provider-interface.ts]
  [provider-interface.ts] -> [faiss-provider.ts]
  [faiss-provider.ts] -> [layered-faiss-provider.ts]
  [layer
```

## 🤖 Entity Listing

### Function
- **baseResult** — Stores the result from the base layer search `layered-faiss-provider.ts:482-482`
- **createInitialBaseMetadata** — Creates initial metadata for the base branch of a project `base-branch-detector.ts:259-301`
- **detectBaseBranch** — Determines the base branch for a project based on existing metadata, remote default, local branches, and current branch `base-branch-detector.ts:143-199`
- **getBaseMetaPath** — Get path to base index metadata file `base-branch-detector.ts:37-39`
- **getBaseMetaPathByHash** — Get path to base index metadata file by project hash `base-branch-detector.ts:44-47`
- **getFaissClient** — A method to get the Faiss client instance `faiss-client.ts:496-503`
- **getFaissProvider** — Returns an instance of the FaissProvider `faiss-provider.ts:778-783`
- **getLayeredFaissProvider** — Returns a new instance of the Layered FAISS provider `layered-faiss-provider.ts:978-986`
- **getLayeredPaths** — Generates file paths for the layered FAISS index `layered-faiss-provider.ts:71-85`
- **getLocalBranches** — Parses the local branches of a git repository `base-branch-detector.ts:89-105`
- **getRemoteDefaultBranch** — Retrieves the default branch from the remote repository `base-branch-detector.ts:110-127`
- **ids** — Creates an array of empty strings `faiss-provider.ts:319-319`
- **initializeFaissProvider** — Initializes the FaissProvider with the given configuration `faiss-provider.ts:785-789`
- **loadBaseMetadata** — Load existing base index metadata `base-branch-detector.ts:52-66`
- **pLog** — Logs the elapsed time for a phase `faiss-provider.ts:310-313`
- **saveBaseMetadata** — Save base index metadata `base-branch-detector.ts:71-80`
- **shouldUseCurrentAsBase** — Checks if the current branch should be used as the base branch `base-branch-detector.ts:209-223`
- **shouldUseDelta** — Determines if a delta should be used for a given branch `base-branch-detector.ts:233-254`
- **shutdownFaissClient** — A method to shut down the Faiss client `faiss-client.ts:505-510`
- **shutdownFaissProvider** — Shuts down the FaissProvider, saving the index if necessary `faiss-provider.ts:791-796`
- **shutdownLayeredFaissProvider** — Shuts down the Layered FAISS provider `layered-faiss-provider.ts:991-996`
- **updateBaseMetadata** — Updates the metadata for the base branch of a project `base-branch-detector.ts:306-321`

### Method
- **add** — A method to add vectors to the Faiss index `faiss-client.ts:278-321`
- **add** — Adds a single embedding to the Faiss index `faiss-provider.ts:280-297`
- **add** — Adds a vector to the index `layered-faiss-provider.ts:518-563`
- **addBatch** — Adds a batch of embeddings to the Faiss index `faiss-provider.ts:302-360`
- **addBatch** — Adds a batch of vectors to the FAISS index `layered-faiss-provider.ts:568-660`
- **batchSearch** — A method to perform batch searches on the Faiss index `faiss-client.ts:353-388`
- **batchSearch** — Searches for similar embeddings in the Faiss index in batches `faiss-provider.ts:400-425`
- **buildIndexConfig** — Builds the Faiss index configuration `faiss-provider.ts:171-183`
- **clearAll** — Clears all vectors from the Faiss index `faiss-provider.ts:766-769`
- **clearAll** — Clears all vectors from the FAISS index `layered-faiss-provider.ts:760-815`
- **close** — Closes the Faiss provider `faiss-provider.ts:259-271`
- **close** — Closes the FAISS index `layered-faiss-provider.ts:953-965`
- **constructor** — Initializes the Faiss provider with configuration `faiss-provider.ts:94-96`
- **constructor** — Initializes the provider with configuration and project directory `layered-faiss-provider.ts:118-120`
- **count** — Counts the number of vectors in the FAISS index `layered-faiss-provider.ts:941-944`
- **createIndex** — A method to create a new Faiss index `faiss-client.ts:223-276`
- **deleteIndexFiles** — Deletes the Faiss index files `faiss-provider.ts:630-647`
- **ensureBaseMetadata** — Ensures the base metadata exists for the Faiss index `faiss-provider.ts:575-607`
- **flush** — Flushes the Faiss index to disk `faiss-provider.ts:652-661`
- **flushAndSave** — Flushes and saves the Faiss index to disk `faiss-provider.ts:666-669`
- **getDimensions** — Returns the dimensions of the vectors `layered-faiss-provider.ts:143-145`
- **getExistingIds** — Retrieves the existing IDs in the Faiss index `faiss-provider.ts:730-738`
- **getExistingIds** — Retrieves the IDs of existing vectors in the FAISS index `layered-faiss-provider.ts:720-728`
- **getIdSetPath** — Returns the file path for the ID set `faiss-provider.ts:474-476`
- **getMetadataPath** — Retrieves the metadata path for the Faiss index `faiss-provider.ts:543-545`
- **getProjectKey** — Returns a project key based on hash and branch name `faiss-provider.ts:101-103`
- **getProjectKey** — Returns the project key based on the current branch `layered-faiss-provider.ts:125-127`
- **getStats** — A method to get statistics about the Faiss index `faiss-client.ts:470-480`
- **getStats** — Retrieves statistics about the Faiss index `faiss-provider.ts:696-712`
- **getStats** — Retrieves statistics about the FAISS index `layered-faiss-provider.ts:918-936`
- **getVectorCount** — Retrieves the count of vectors in the Faiss index `faiss-provider.ts:721-724`
- **has** — Checks if a vector exists in the FAISS index `layered-faiss-provider.ts:709-714`
- **hasId** — Checks if a specific ID exists in the Faiss index `faiss-provider.ts:743-745`
- **initialize** — A method to initialize the Faiss client with a configuration `faiss-client.ts:166-221`
- **initialize** — Initializes the Faiss provider `faiss-provider.ts:189-199`
- **initialize** — Initializes the provider with the base and delta layers `layered-faiss-provider.ts:167-199`
- **initialized** — Indicates whether the provider has been initialized `layered-faiss-provider.ts:136-138`
- **initializeInternal** — Initializes the Faiss client and index `faiss-provider.ts:201-257`
- **initializeInternal** — Internal method to initialize the provider `layered-faiss-provider.ts:201-250`
- **isReady** — Checks if the Faiss index is ready for use `faiss-provider.ts:714-716`
- **isRunning** — A method to check if the Faiss client is running `faiss-client.ts:482-484`
- **load** — A method to load the Faiss index from a file `faiss-client.ts:435-457`
- **loadBaseLayer** — Loads the base layer from the base branch `layered-faiss-provider.ts:282-325`
- **loadDeltaLayer** — Loads the delta layer from the current branch `layered-faiss-provider.ts:330-357`
- **loadIdSet** — Loads a set of IDs from disk `faiss-provider.ts:500-538`
- **loadIndexMetadata** — Loads the metadata of the Faiss index from disk `faiss-provider.ts:612-625`
- **loadLayers** — Loads the base and delta layers `layered-faiss-provider.ts:255-277`
- **remove** — A method to remove vectors from the Faiss index `faiss-client.ts:459-468`
- **remove** — Removes a vector from the Faiss index `faiss-provider.ts:750-764`
- **remove** — Removes vectors from the FAISS index `layered-faiss-provider.ts:665-669`
- **removeOne** — Removes a single vector from the FAISS index `layered-faiss-provider.ts:674-704`
- **save** — A method to save the Faiss index to a file `faiss-client.ts:408-433`
- **save** — Saves the Faiss index to disk `faiss-provider.ts:434-469`
- **save** — Saves the current state of the FAISS index `layered-faiss-provider.ts:737-755`
- **saveBase** — Saves the base layer of the FAISS index `layered-faiss-provider.ts:820-861`
- **saveDelta** — Saves the delta layer of the FAISS index `layered-faiss-provider.ts:866-909`
- **saveIdSet** — Saves a set of IDs to disk `faiss-provider.ts:481-495`
- **saveIndexMetadata** — Saves the metadata of the Faiss index to disk `faiss-provider.ts:551-569`
- **search** — A method to search for vectors in the Faiss index `faiss-client.ts:323-351`
- **search** — Searches for similar embeddings in the Faiss index `faiss-provider.ts:379-394`
- **search** — Searches for vectors in the layered index `layered-faiss-provider.ts:419-496`
- **searchForVectorStore** — Searches for vectors in the vector store `layered-faiss-provider.ts:501-509`
- **setDimensions** — Sets the dimensions of the vectors `layered-faiss-provider.ts:151-156`
- **setProjectContext** — Switches the project context and updates the index `faiss-provider.ts:109-166`
- **start** — A method to start the Faiss client `faiss-client.ts:89-148`
- **stop** — A method to stop the Faiss client `faiss-client.ts:150-164`
- **switchBranch** — Switches the current branch to a new branch `layered-faiss-provider.ts:366-403`
- **train** — A method to train the Faiss index with new vectors `faiss-client.ts:390-406`
- **train** — Trains the Faiss index with new embeddings `faiss-provider.ts:678-690`
- **waitForPendingSave** — Waits for pending save operation to complete `faiss-provider.ts:365-369`

### Class
- **FaissNapiClient** — A class implementing the Faiss client interface using faiss-napi `faiss-client.ts:78-485`
- **FaissProvider** — Class for managing Faiss index in memory and persisting it to disk `faiss-provider.ts:71-770`
- **LayeredFaissProvider** — Provider for a two-layer FAISS index `layered-faiss-provider.ts:91-966`

### Interface
- **AddVectorResult** — Result of adding a vector to the index `layered-types.ts:144-151`
- **BaseIndexMetadata** — Metadata stored alongside the base index `layered-types.ts:76-91`
- **BranchDelta** — Delta information for a feature branch `layered-types.ts:40-51`
- **DeltaIndexMetadata** — Metadata for a feature branch delta index `layered-types.ts:96-111`
- **FaissAddRequest** — IPC request message for adding vectors to FAISS index `types.ts:75-81`
- **FaissAddResponse** — Response to FaissAddRequest `types.ts:207-212`
- **FaissBatchSearchRequest** — Defines a batch search request for multiple vectors in the FAISS index `types.ts:93-101`
- **FaissBatchSearchResponse** — Represents a batch search response from the Faiss worker `types.ts:176-181`
- **FaissErrorResponse** — Represents an error response from the Faiss worker `types.ts:158-162`
- **FaissIndex** — Faiss index interface with methods for adding, searching, and training vectors `faiss-client.ts:44-53`
- **FaissIndexConfig** — Configuration for FAISS index, including dimensions, index type, and various parameters `types.ts:37-62`
- **FaissInitRequest** — IPC request message for initializing FAISS index `types.ts:68-73`
- **FaissInitResponse** — Response to FaissInitRequest `types.ts:200-205`
- **FaissLoadRequest** — Represents a request to load a Faiss index from a specified path `types.ts:115-119`
- **FaissLoadResponse** — Extends a success response to include details about a loaded Faiss index `types.ts:226-230`
- **FaissProviderConfig** — Configuration for the Faiss provider, specifying vector dimensions, index type, and other parameters `faiss-provider.ts:31-52`
- **FaissProviderOptions** — Interface for configuring Faiss provider options, including dimensions, index type, HNSW parameters, auto-save threshold, and provider type `provider-interface.ts:113-128`
- **FaissRemoveRequest** — Defines a request to remove specific vectors from the FAISS index `types.ts:103-107`
- **FaissRemoveResponse** — Response to FaissRemoveRequest `types.ts:214-218`
- **FaissSaveRequest** — Defines a request to save the FAISS index to a specified path `types.ts:109-113`
- **FaissSaveResponse** — Response to FaissSaveRequest `types.ts:220-224`
- **FaissSearchRequest** — Defines a request to search for vectors in the FAISS index `types.ts:83-91`
- **FaissSearchResponse** — Represents a search response from the Faiss worker `types.ts:170-174`
- **FaissSearchResult** — Represents a search result from the Faiss worker `types.ts:164-168`
- **FaissShutdownRequest** — Specifies a request to shut down a Faiss worker `types.ts:133-135`
- **FaissStatsRequest** — Indicates a request to retrieve statistics from a Faiss index `types.ts:129-131`
- **FaissStatsResponse** — Represents a statistics response from the Faiss worker `types.ts:183-198`
- **FaissSuccessResponse** — Represents a successful response from the Faiss worker `types.ts:153-156`
- **FaissTrainRequest** — Defines a request to train a Faiss index with given vectors and vector count `types.ts:121-127`
- **FaissTrainResponse** — Extends a success response to include details about a trained Faiss index `types.ts:232-236`
- **FaissWorkerState** — Represents the current state of a Faiss worker, including initialization status, index type, dimensions, and vector counts `types.ts:255-263`
- **IFaissClient** — Interface for Faiss client operations `faiss-client.ts:59-72`
- **IFaissProvider** — Common interface for FAISS providers `provider-interface.ts:13-103`
- **IVectorProvider** — Common interface for FAISS providers used by EmbeddingAccumulator `types.ts:24-35`
- **LayeredFaissConfig** — Configuration for a two-layer FAISS index architecture `layered-faiss-provider.ts:43-56`
- **LayeredIndexConfig** — Configuration for a layered index `layered-types.ts:22-35`
- **LayeredIndexEvent** — Represents an event in the layered index system `layered-types.ts:190-196`
- **LayeredIndexPaths** — Paths for the layered index `layered-types.ts:120-135`
- **LayeredIndexStats** — Statistics for the layered index `layered-types.ts:166-181`
- **LayeredSearchResult** — Search result with source information `layered-types.ts:60-67`
- **RemoveVectorResult** — Result of removing a vector from the index `layered-types.ts:156-161`

### Enum_decl
- **MetricType** — Defines the types of metrics used in the FAISS library, including inner product and L2 distance `faiss-client.ts:25-28`

### Constant
- **METRIC_INNER_PRODUCT** — Metric type for inner product similarity `faiss-client.ts:26-26`
- **METRIC_L2** — Metric type for L2 distance similarity `faiss-client.ts:27-27`

### Type_alias
- **FaissIndexType** — Defines the types of FAISS index configurations `types.ts:12-12`
- **FaissNapiModule** — Module for Faiss operations using faiss-napi `faiss-client.ts:31-42`
- **FaissProviderType** — Represents the type of Faiss provider, either "standard" or "layered" `provider-interface.ts:108-108`
- **FaissRequest** — Represents a request to the Faiss worker `types.ts:137-147`
- **FaissResponse** — Represents various types of responses from Faiss operations `types.ts:238-249`

### Import_decl
- **../../logging/index.js** — Imports `../../logging/index.js` from `../../logging/index.js`. `base-branch-detector.ts:16-16`, `faiss-client.ts:10-10`, `faiss-provider.ts:17-17`, `layered-faiss-provider.ts:18-18`
- **../../shared/storage-paths.js** — Imports `../../shared/storage-paths.js` from `../../shared/storage-paths.js`. `base-branch-detector.ts:17-17`, `faiss-client.ts:11-11`, `faiss-provider.ts:18-18`, `layered-faiss-provider.ts:19-19`
- **../../types/semantic.js** — Imports `../../types/semantic.js` from `../../types/semantic.js`. `faiss-provider.ts:19-19`, `layered-faiss-provider.ts:20-20`, `provider-interface.ts:8-8`, `types.ts:18-18`
- **../../utils/runtime-detection.js** — Imports `../../utils/runtime-detection.js` from `../../utils/runtime-detection.js`. `layered-faiss-provider.ts:21-21`
- **../../utils/runtime.js** — Imports `../../utils/runtime.js` from `../../utils/runtime.js`. `faiss-client.ts:12-12`
- **../../utils/simd-vector-ops.js** — Imports `../../utils/simd-vector-ops.js` from `../../utils/simd-vector-ops.js`. `faiss-provider.ts:20-20`, `layered-faiss-provider.ts:22-22`
- **../gpu/gpu-client.js** — Imports `../gpu/gpu-client.js` from `../gpu/gpu-client.js`. `faiss-provider.ts:21-21`, `layered-faiss-provider.ts:23-23`
- **./base-branch-detector.js** — Imports `./base-branch-detector.js` from `./base-branch-detector.js`. `faiss-provider.ts:22-22`
- **./base-branch-detector.js** — Imports `./base-branch-detector.js`. `layered-faiss-provider.ts:24-29`
- **./faiss-client.js** — Imports `./faiss-client.js` from `./faiss-client.js`. `faiss-provider.ts:23-23`
- **./layered-types.js** — Imports `./layered-types.js` from `./layered-types.js`. `base-branch-detector.ts:18-18`, `faiss-provider.ts:24-24`
- **./layered-types.js** — Imports `./layered-types.js`. `layered-faiss-provider.ts:30-36`
- **./types.js** — Imports `./types.js`. `faiss-client.ts:13-22`
- **./types.js** — Imports `./types.js` from `./types.js`. `faiss-provider.ts:25-25`, `layered-faiss-provider.ts:37-37`
- **node:child_process** — Imports `node:child_process` from `node:child_process`. `base-branch-detector.ts:12-12`
- **node:fs** — Imports `node:fs` from `node:fs`. `base-branch-detector.ts:13-13`, `faiss-client.ts:8-8`, `faiss-provider.ts:15-15`, `layered-faiss-provider.ts:15-15`
- **node:path** — Imports `node:path` from `node:path`. `base-branch-detector.ts:14-14`, `faiss-client.ts:9-9`, `faiss-provider.ts:16-16`, `layered-faiss-provider.ts:16-16`

### Property
- **action** — Action taken to remove the vector `layered-types.ts:160-160`
- **addedCount** — Number of vectors added `types.ts:209-209`
- **addedIds** — IDs of added/modified entities in delta `layered-types.ts:44-44`
- **addTimeMs** — Time taken to add vectors in milliseconds `types.ts:211-211`
- **autoSaveThreshold** — Auto-save after N embeddings added `faiss-provider.ts:49-49`
- **autoSaveThreshold** — Threshold for auto-saving the index `layered-faiss-provider.ts:55-55`
- **autoSaveThreshold** — Optional field for setting the auto-save threshold `provider-interface.ts:125-125`
- **baseBranch** — Represents the base branch used for the full index `layered-faiss-provider.ts:100-100`
- **baseBranch** — Branch name of the base index (null = not yet determined) `layered-types.ts:26-26`, `layered-types.ts:78-78`
- **baseBranch** — Name of the base branch `layered-types.ts:100-100`
- **baseBranch** — Represents the branch that was indexed to create the base index `layered-types.ts:178-178`
- **baseCommit** — Optional string representing the base commit hash `layered-types.ts:90-90`
- **baseIdSet** — Stores the set of IDs for the base layer `layered-faiss-provider.ts:104-104`
- **baseIdsPath** — Path for the base IDs `layered-types.ts:124-124`
- **baseIndexPath** — Path for the base index `layered-types.ts:122-122`
- **baseMetaPath** — Path for the base metadata `layered-types.ts:126-126`
- **baseTimestamp** — Timestamp when base was last updated `layered-types.ts:30-30`
- **baseUnsavedCount** — Counts the number of unsaved vectors in the base layer `layered-faiss-provider.ts:109-109`
- **baseVectorCount** — Number of vectors in the base index `layered-types.ts:28-28`
- **baseVectors** — Represents the vectors in the base index `layered-types.ts:170-170`
- **branchName** — Stores the branch name `faiss-provider.ts:86-86`
- **branchName** — Branch name `layered-types.ts:42-42`
- **branchName** — Name of the branch `layered-types.ts:98-98`
- **branchName** — Represents the name of the branch `layered-types.ts:193-193`
- **client** — GPU client for Faiss operations `faiss-provider.ts:73-73`
- **client** — GPU client for the LayeredFaissProvider `layered-faiss-provider.ts:93-93`
- **config** — A configuration object for initializing the Faiss index `faiss-client.ts:81-81`
- **config** — Configuration object for the Faiss provider `faiss-provider.ts:72-72`
- **config** — Configuration for the LayeredFaissProvider `layered-faiss-provider.ts:92-92`
- **config** — Configuration for FAISS index `types.ts:70-70`
- **createdAt** — Represents the timestamp when the entity was created `layered-types.ts:82-82`
- **createdAt** — Timestamp when the index was created `layered-types.ts:106-106`
- **currentBranch** — Represents the current branch being used for operations `layered-faiss-provider.ts:99-99`
- **currentBranch** — Represents the current branch being referenced `layered-types.ts:176-176`
- **deltaIdSet** — Stores the set of IDs for the delta layer `layered-faiss-provider.ts:105-105`
- **deltaIdsPath** — Path for the delta IDs `layered-types.ts:130-130`
- **deltaIndexPath** — Path for the delta index `layered-types.ts:128-128`
- **deltaMetaPath** — Path for the delta metadata `layered-types.ts:132-132`
- **deltaUnsavedCount** — Counts the number of unsaved vectors in the delta layer `layered-faiss-provider.ts:110-110`
- **deltaVectorCount** — Number of vectors in delta index `layered-types.ts:48-48`
- **deltaVectorCount** — Number of vectors in the delta index `layered-types.ts:102-102`
- **deltaVectors** — Represents the vectors in the delta index `layered-types.ts:172-172`
- **details** — Provides additional details about the index `layered-types.ts:195-195`
- **dimensions** — Vector dimensions (must match embedding model) `faiss-provider.ts:33-33`, `types.ts:39-39`, `types.ts:187-187`, `types.ts:203-203`
- **dimensions** — The vector dimensions used in the Faiss index `faiss-provider.ts:612-612`, `faiss-provider.ts:620-620`
- **dimensions** — Vector dimensions for the FAISS index `layered-faiss-provider.ts:45-45`
- **dimensions** — Index dimensions (e.g., 384 for all-MiniLM-L6-v2) `layered-types.ts:32-32`, `layered-types.ts:86-86`
- **dimensions** — Specifies the dimensionality of the vectors `provider-interface.ts:99-99`
- **dimensions** — Optional field for specifying the dimensionality of the vectors `provider-interface.ts:115-115`
- **dimensions** — Stores the number of dimensions in the vector space `types.ts:258-258`
- **dims** — Dimensions of the vectors in the index `faiss-client.ts:46-46`
- **distance** — Distance between the query and the result `types.ts:166-166`
- **distances** — Distances of the vectors in the index `faiss-client.ts:49-49`
- **error** — Error message if the vector addition failed `layered-types.ts:150-150`
- **error** — Contains the error message `types.ts:160-160`
- **faiss** — A module for Faiss operations, including index creation and management `faiss-client.ts:79-79`
- **faissStats** — The statistics of the Faiss index `faiss-provider.ts:701-701`
- **filterIds** — Optional array of IDs to filter vectors `types.ts:90-90`
- **fromBuffer** — Method to create a Faiss index from a buffer `faiss-client.ts:35-35`
- **fromFactory** — Factory method to create a Faiss index `faiss-client.ts:34-34`
- **hnswEfConstruction** — HNSW efConstruction parameter `faiss-provider.ts:39-39`
- **hnswEfConstruction** — HNSW efConstruction parameter for the index `layered-faiss-provider.ts:51-51`
- **hnswEfConstruction** — Optional field for setting the HNSW efConstruction parameter `provider-interface.ts:121-121`
- **hnswEfConstruction** — HNSW: efConstruction - size of dynamic candidate list `types.ts:47-47`, `types.ts:193-193`
- **hnswEfSearch** — HNSW efSearch parameter `faiss-provider.ts:41-41`
- **hnswEfSearch** — HNSW efSearch parameter for the index `layered-faiss-provider.ts:53-53`
- **hnswEfSearch** — Optional field for setting the HNSW efSearch parameter `provider-interface.ts:123-123`
- **hnswEfSearch** — HNSW: efSearch - size of search candidate list `types.ts:49-49`
- **hnswM** — HNSW M parameter `faiss-provider.ts:37-37`
- **hnswM** — HNSW M parameter for the index `layered-faiss-provider.ts:49-49`
- **hnswM** — Optional field for setting the HNSW M parameter `provider-interface.ts:119-119`
- **hnswM** — HNSW: M parameter - number of connections per layer `types.ts:45-45`, `types.ts:192-192`
- **id** — Entity ID `layered-types.ts:62-62`
- **id** — Unique identifier for a search result `types.ts:165-165`
- **idMap** — A map of vector IDs to their corresponding indices `faiss-client.ts:86-86`
- **idMap** — Maps string IDs to internal FAISS IDs `types.ts:261-261`
- **ids** — Vector IDs (must be unique) `types.ts:78-78`
- **ids** — Represents vector IDs in Faiss requests `types.ts:106-106`
- **idSet** — Stores a set of IDs `faiss-provider.ts:89-89`
- **idSetSize** — The size of the ID set in the Faiss index `faiss-provider.ts:700-700`
- **Index** — Faiss index interface with methods for adding, searching, and training vectors `faiss-client.ts:32-37`
- **index** — An instance of a Faiss index used for vector operations `faiss-client.ts:80-80`
- **IndexFlatIP** — Faiss index for inner product similarity `faiss-client.ts:39-39`
- **IndexFlatL2** — Faiss index for L2 distance similarity `faiss-client.ts:38-38`
- **IndexHNSW** — Faiss index for HNSW algorithm `faiss-client.ts:40-40`
- **indexType** — Faiss index type, can be "flat", "hnsw", "ivf", "ivfpq", or "ivfsq" `faiss-provider.ts:35-35`
- **indexType** — The type of Faiss index used `faiss-provider.ts:612-612`, `faiss-provider.ts:620-620`
- **indexType** — Type of FAISS index to use `layered-faiss-provider.ts:47-47`
- **indexType** — Index type (hnsw, flat, etc.) `layered-types.ts:34-34`, `layered-types.ts:88-88`
- **indexType** — Defines the type of index used, such as "flat", "hnsw", or "ivf" `provider-interface.ts:100-100`
- **indexType** — Optional field for defining the type of index, such as "flat", "hnsw", or "ivf" `provider-interface.ts:117-117`
- **indexType** — Index type: flat, hnsw, ivf, ivfpq, or ivfsq `types.ts:41-41`
- **indexType** — Type of the Faiss index `types.ts:186-186`
- **indexType** — Index type: flat, hnsw, ivf, ivfpq, ivfsq `types.ts:202-202`
- **indexType** — Specifies the type of index used, which can be null `types.ts:257-257`
- **initializePromise** — Stores a promise for initialization or null `faiss-provider.ts:92-92`
- **initializePromise** — A promise that resolves when the provider is initialized `layered-faiss-provider.ts:116-116`
- **isInitialized** — A boolean indicating whether the Faiss client is initialized `faiss-client.ts:82-82`
- **isInitialized** — Indicates whether the Faiss provider has been initialized `faiss-provider.ts:74-74`
- **isInitialized** — Indicates if the LayeredFaissProvider is initialized `layered-faiss-provider.ts:94-94`
- **isInitialized** — Indicates whether the model has been initialized `types.ts:256-256`
- **isOnBaseBranch** — Indicates whether the current branch is the base branch `layered-faiss-provider.ts:103-103`
- **isOnBaseBranch** — Determines if the current branch is the base branch `layered-types.ts:180-180`
- **isTrained** — Boolean indicating if the index is trained `faiss-client.ts:47-47`
- **isTrained** — Indicates whether the index is trained `types.ts:190-190`
- **isTrained** — Determines if the model has been trained `types.ts:260-260`
- **ivfNlist** — IVF nlist parameter `faiss-provider.ts:43-43`
- **ivfNlist** — IVF: number of clusters `types.ts:51-51`, `types.ts:195-195`
- **ivfNprobe** — IVF nprobe parameter `faiss-provider.ts:45-45`
- **ivfNprobe** — IVF: number of clusters to search `types.ts:53-53`, `types.ts:196-196`
- **k** — Specifies the number of nearest neighbors to search for `types.ts:88-88`, `types.ts:100-100`
- **labels** — Labels of the vectors in the index `faiss-client.ts:49-49`
- **lastCommit** — Last commit hash for the index `layered-types.ts:110-110`
- **lastSaveTime** — Stores the timestamp of the last save operation `faiss-provider.ts:78-78`
- **lastSaveTime** — The last time the Faiss index was saved `faiss-provider.ts:699-699`
- **lastUpdated** — Timestamp when delta was last updated `layered-types.ts:50-50`
- **loadedVectors** — Number of vectors loaded from disk `types.ts:204-204`
- **loadedVectors** — Number of vectors loaded `types.ts:229-229`
- **loadPath** — Optional path to load existing index `types.ts:72-72`
- **MAX_DELTA_SIZE** — Defines the maximum size for the delta layer `layered-faiss-provider.ts:113-113`
- **memoryUsageMB** — Memory usage in megabytes `types.ts:189-189`
- **metric** — Distance metric: l2, ip, or cosine `types.ts:43-43`
- **MetricType** — Enum representing different metrics for Faiss operations `faiss-client.ts:41-41`
- **nQueries** — Number of queries performed `types.ts:98-98`
- **ntotal** — Number of vectors in the index `faiss-client.ts:45-45`
- **numThreads** — OpenMP threads `types.ts:61-61`
- **nVectors** — Number of vectors in the index `types.ts:126-126`
- **path** — Represents the path to load an existing index in Faiss requests `types.ts:112-112`, `types.ts:118-118`
- **path** — Path to save the index `types.ts:222-222`
- **path** — Path to the file being loaded `types.ts:228-228`
- **pendingSave** — Stores a pending save promise or null `faiss-provider.ts:81-81`
- **persistPath** — Path to persist Faiss index `faiss-provider.ts:51-51`
- **pqM** — IVFPQ: number of subquantizers `types.ts:55-55`
- **pqNbits** — IVFPQ: bits per subquantizer `types.ts:57-57`
- **projectHash** — Stores the project hash `faiss-provider.ts:85-85`
- **projectHash** — Hash of the project directory `layered-faiss-provider.ts:98-98`
- **projectHash** — Project hash for identifying the project `layered-types.ts:24-24`
- **projectHash** — Identifies the project using a hash `layered-types.ts:192-192`
- **projectPath** — Path to the project directory `layered-faiss-provider.ts:97-97`
- **providerType** — Optional field for specifying the type of Faiss provider, either "standard" or "layered" `provider-interface.ts:127-127`
- **read** — Method to read a Faiss index from a file `faiss-client.ts:36-36`
- **removedCount** — Number of vectors removed `types.ts:216-216`
- **requestId** — Unique identifier for a request `types.ts:155-155`, `types.ts:161-161`
- **results** — List of search results `types.ts:172-172`, `types.ts:179-179`
- **reverseIdMap** — A map of indices to their corresponding vector IDs `faiss-client.ts:87-87`
- **reverseIdMap** — Maps internal FAISS IDs back to string IDs `types.ts:262-262`
- **saveScheduled** — Indicates whether a save is scheduled `faiss-provider.ts:82-82`
- **score** — Score of the search result `types.ts:167-167`
- **searchTimeMs** — Time taken for the search in milliseconds `types.ts:173-173`, `types.ts:180-180`
- **similarity** — Similarity score (0-1) `layered-types.ts:64-64`
- **sizeBytes** — Size of the index in bytes `types.ts:223-223`
- **source** — Source of the result `layered-types.ts:66-66`
- **sqBits** — Retrieves the number of bits for quantization, defaulting to 8 if not specified `faiss-client.ts:260-260`
- **sqBits** — SQ bits for IVF,SQ quantization `faiss-provider.ts:47-47`
- **sqBits** — IVF,SQ: scalar quantization bits `types.ts:59-59`
- **stats** — Statistics information `types.ts:185-197`
- **success** — Indicates if the vector was successfully added `layered-types.ts:146-146`, `layered-types.ts:158-158`
- **success** — Indicates the success of a request `types.ts:154-154`, `types.ts:159-159`
- **target** — Target index for the vector addition `layered-types.ts:148-148`
- **timestamp** — Indicates the timestamp when the index was last updated `layered-types.ts:194-194`
- **tombstoneCount** — Number of tombstones in the delta index `layered-types.ts:104-104`
- **tombstones** — Tracks IDs that have been deleted in the base layer but not in the current branch `layered-faiss-provider.ts:106-106`
- **tombstones** — IDs of entities that exist in base but should be excluded `layered-types.ts:46-46`
- **tombstones** — Tracks IDs of entities that exist in the base index but should be excluded from the feature branch `layered-types.ts:174-174`
- **tombstonesPath** — Path for the tombstones `layered-types.ts:134-134`
- **totalVectors** — The total number of vectors in the Faiss index `faiss-client.ts:83-83`, `faiss-provider.ts:697-697`, `faiss-provider.ts:706-706`
- **totalVectors** — Total number of vectors in the index `layered-types.ts:168-168`, `types.ts:188-188`, `types.ts:210-210`, `types.ts:217-217`
- **totalVectors** — Stores the total number of vectors in the index `provider-interface.ts:98-98`
- **totalVectors** — Keeps track of the total number of vectors in the index `types.ts:259-259`
- **trainedOn** — Number of vectors trained on `types.ts:234-234`
- **trainTimeMs** — Represents the time taken to train the model in milliseconds `types.ts:235-235`
- **type** — Specifies the type of the index (e.g., hnsw, flat, etc.) `layered-types.ts:191-191`
- **type** — Type of IPC request message `types.ts:69-69`, `types.ts:76-76`
- **type** — Defines the message protocol between Bun and Node.js Faiss worker `types.ts:84-84`, `types.ts:94-94`, `types.ts:104-104`, `types.ts:110-110`, `types.ts:116-116`, `types.ts:122-122`, `types.ts:130-130`, `types.ts:134-134`, `types.ts:171-171`, `types.ts:177-177`, `types.ts:184-184`
- **type** — Type of the Faiss index `types.ts:201-201`, `types.ts:208-208`, `types.ts:215-215`, `types.ts:221-221`
- **type** — Indicates the type of operation, "load" `types.ts:227-227`
- **type** — Indicates the type of operation, "train" `types.ts:233-233`
- **unsavedCount** — Tracks the number of unsaved changes in the Faiss index `faiss-provider.ts:77-77`
- **unsavedCount** — The count of unsaved changes in the Faiss index `faiss-provider.ts:698-698`
- **updatedAt** — Represents the timestamp when the entity was last updated `layered-types.ts:84-84`
- **updatedAt** — Timestamp when the index was last updated `layered-types.ts:108-108`
- **vector** — Represents a vector embedding used in Faiss providers `types.ts:86-86`
- **vectorCount** — Total vectors in base `layered-types.ts:80-80`
- **vectors** — Vectors as flat Float32Array `types.ts:80-80`
- **vectors** — Represents vectors as flat Float32Array in Faiss requests `types.ts:96-96`, `types.ts:124-124`

## Data Flow

- **Inputs**: VectorEmbedding objects (id + Float32Array), query vectors, project/branch context.
- **Processing**: Vectors are L2-normalized (SIMD-accelerated), added to FAISS HNSW index, persisted to disk with ID mappings; searches return scored results filtered by tombstones on feature branches.
- **Outputs**: SimilarityResult arrays (id + score), LayeredSearchResult arrays with source annotation (base/delta).

## Public API

| Export | Type | Description | Location |
|--------|------|-------------|----------|
| `getFaissClient` | function | Singleton factory for IFaissClient (faiss-napi based) | [`faiss-client.ts:496-503`](./faiss-client.ts) |
| `IFaissClient` | interface | Common interface for FAISS operations (init, add, search, save, load) | [`faiss-client.ts:59-72`](./faiss-client.ts) |
| `FaissNapiClient` | class | Direct faiss-napi NAPI client for all runtimes | [`faiss-client.ts:78-478`](./faiss-client.ts) |
| `getFaissProvider` | function | Singleton factory for FaissProvider | [`faiss-provider.ts:758-763`](./faiss-provider.ts) |
| `initializeFaissProvider` | function | Creates and initializes FaissProvider | [`faiss-provider.ts:765-769`](./faiss-provider.ts) |
| `FaissProvider` | class | In-memory FAISS index with auto-save and project context | [`faiss-provider.ts:62-750`](./faiss-provider.ts) |
| `LayeredFaissProvider` | class | Two-layer (base + delta) index with tombstone support | [`layered-faiss-provider.ts:91-861`](./layered-faiss-provider.ts) |
| `getLayeredFaissProvider` | function | Singleton factory for LayeredFaissProvider | [`layered-faiss-provider.ts:91-966`](./layered-faiss-provider.ts) |
| `IFaissProvider` | interface | Common interface for both standard and layered providers | [`provider-interface.ts:13-103`](./provider-interface.ts) |
| `IVectorProvider` | interface | Minimal interface for EmbeddingAccumulator (addBatch, getExistingIds, remove, save) | [`types.ts:24-35`](./types.ts) |
| `FaissIndexConfig` | interface | Index configuration (dimensions, type, HNSW/IVF parameters) | [`types.ts:35-58`](./types.ts) |

## Dependencies

### Internal Modules

| Module | Purpose |
|--------|---------|
| `semantic/gpu` | IGpuClient for unified FAISS + CUDA operations |
| `logging` | Structured logging |
| `shared/storage-paths` | Project directory and index file path resolution |
| `types/semantic` | VectorEmbedding and SimilarityResult types |
| `utils/simd-vector-ops` | SIMD-accelerated L2 normalization |
| `utils/runtime` | Runtime detection (Bun vs Node.js) |

### External Packages

| Package | Purpose |
|---------|---------|
| `faiss-napi` | **Legacy** NAPI bindings for FAISS C++ library (used only in `faiss-client.ts` in-process fallback). GPU worker pipeline uses native FAISS addon instead. |

## Behavioral Properties

| Property | Value |
|----------|-------|
| Default index type | HNSW with M=32, efConstruction=200, efSearch=64 |
| Auto-save threshold | 5000 embeddings (FaissProvider), 50000 (LayeredFaissProvider) |
| Dimension mismatch handling | Old index files deleted and fresh index created |

## Error Handling

FaissProvider catches initialization failures and returns false. FaissNapiClient tries standard import first, then createRequire fallback for bundled environments. LayeredFaissProvider saves state before project switches to prevent data loss. Background auto-save failures are logged as warnings without interrupting the pipeline.

## Index Types

| Type | Description | When to use |
|-----|----------|-------------------|
| `flat` | Exact search (brute force) | <10k vectors, 100% accuracy needed |
| `hnsw` | Hierarchical NSW graph | <1M vectors, speed/accuracy balance |
| `ivf` | Inverted File Index | >1M vectors, clustering |
| `ivfpq` | IVF + Product Quantization | >1M vectors, memory constrained |

## Hot/Cold Architecture

```
New embeddings ──► Faiss (hot, in-memory)
                         │
                         │ periodic flush (every N minutes)
                         ▼
Old embeddings ──► Faiss on disk (cold, persistent)

Search = Faiss results → enrich metadata from SQLite
```

## Performance Targets

| Metric | Target | Note |
|---------|------|------------|
| Add latency | <1ms/vector | Batch mode |
| Search latency | <5ms for k=10 | HNSW index |
| Memory | <2GB for 1M vectors | 768-dim, float32 |
| Throughput | >10k vectors/sec | OpenMP |

## Known Limitations

- FAISS does not support direct vector removal; "removal" only deletes ID mappings (stale vectors remain in index).
- LayeredFaissProvider simplified approach stores delta vectors in the base index rather than a separate FAISS instance.
- Max delta size triggers auto-merge to base to prevent memory leaks (threshold: 5000 vectors).

## Files

| File | Description |
|------|-------------|
| `base-branch-detector.ts` | Detects the base branch for layered index from git metadata and config |
| `faiss-client.ts` | **Legacy** FaissNapiClient with ID mapping, batch operations, and singleton factory. GPU worker pipeline uses native FAISS addon instead. |
| `faiss-provider.ts` | In-memory FAISS provider with auto-save, project context, and ID set tracking |
| `IMPLEMENTATION_PLAN.md` | Implementation plan and stage status documentation |
| `index.ts` | Re-exports faiss-client, faiss-provider, and types |
| `layered-faiss-provider.ts` | Two-layer base/delta provider with tombstones and branch switching |
| `layered-types.ts` | Types for layered architecture: BaseIndexMetadata, DeltaIndexMetadata, LayeredSearchResult |
| `provider-interface.ts` | IFaissProvider common interface and FaissProviderOptions configuration |
| `types.ts` | FAISS IPC protocol types, index configuration, request/response message types |
