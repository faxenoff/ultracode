# GPU

## 🤖 Overview

The `src/semantic/gpu` module provides a unified interface for GPU operations, including Faiss vector indexing and CUDA similarity computations. It dynamically selects between Faiss and CUDA based on runtime conditions, ensuring optimal performance for different vector dimensions and data sizes. This module is used by applications requiring efficient vector similarity and indexing, particularly those handling large-scale data with high-dimensional vectors.

## 🤖 Architecture

```
  +-------------------+
  |   Adaptive       |
  |   Thresholds     |
  |   (adaptive-thresholds.ts) |
  +-------------------+
           |
           v
  +-------------------+
  |   Faiss Index     |
  |   (faiss-handlers.ts) |
  +-------------------+
           |
           v
  +-------------------+
  |   CUDA Operations |
  |   (cuda-handlers.ts) |
  +-------------------+
           |
           v
  +-------------------+
  |   GPU Worker      |
  |   (gpu-worker.ts)  |
  +-------------------+
           |
           v
  +-------------------+
  |   GPU Client      |
  |   (gpu-client.ts)  |
  +-------------------+
           |
           v
  +-------------------+
  |   Named Pipe      |
  |   (named-pipe-transport.ts) |
  +-------------------+
           |
           v
  +-------------------+
  |   Request Helpers |
  |   (request-helpers.ts) |
  +-------------------+
           |
           v
  +-------------------+
  |   Type Guards     |
  |   (type-guards.ts)  |
  +-------------------+
           |
           v
  +-------------------+
  |   Types           |
  |   (types.ts)       |
  +-------------------+
```

## 🤖 Flow

```
  +-------------------+
  |   Client Request  |
  |   (gpu-client.ts) |
  +-------------------+
           |
           v
  +-------------------+
  |   Runtime Check   |
  |   (adaptive-thresholds.ts) |
  +-------------------+
           |
           v
  +-------------------+
  |   Faiss Index     |
  |   (faiss-handlers.ts) |
  +-------------------+
           |
           v
  +-------------------+
  |   CUDA Operations |
  |   (cuda-handlers.ts) |
  +-------------------+
           |
           v
  +-------------------+
  |   GPU Worker      |
  |   (gpu-worker.ts)  |
  +-------------------+
           |
           v
  +-------------------+
  |   Named Pipe      |
  |   (named-pipe-transport.ts) |
  +-------------------+
           |
           v
  +-------------------+
  |   Request Helpers |
  |   (request-helpers.ts) |
  +-------------------+
           |
           v
  +-------------------+
  |   Type Guards     |
  |   (type-guards.ts)  |
  +-------------------+
           |
           v
  +-------------------+
  |   Types           |
  |   (types.ts)       |
  +-------------------+
```

## 🤖 Entity Listing

### Function
- **autoTrainAndFlush** — Trains and flushes the FAISS index with buffered vectors, logging the process `faiss-handlers.ts:124-166`
- **buildFactoryString** — Builds the FAISS factory string from the configuration `faiss-handlers.ts:63-108`
- **checkParent** — Checks the parent process for communication `gpu-worker.ts:697-706`
- **cleanup** — Cleans up resources used by the GPU client `gpu-client.ts:191-212`
- **configureThresholds** — Updates the current adaptive thresholds with provided overrides `adaptive-thresholds.ts:95-117`
- **createPacket** — Creates a packet for sending over the named pipe `named-pipe-transport.ts:411-431`
- **currentRequest** — The current request being processed `gpu-client.ts:609-609`
- **currentRequest** — Sends a named pipe request internally after a promise resolves `gpu-client.ts:610-610`
- **dbArr** — Maps database vectors to arrays, converting Float32Array instances to arrays `gpu-client.ts:797-797`
- **dbArrs** — Converts database arrays to Float32Array if they are not already, and maps them `request-helpers.ts:138-138`
- **evictIfNeeded** — Evicts the least recently used index entries if the pool is full `faiss-handlers.ts:186-233`
- **extractGpuError** — Parses a GPU worker response to extract an error message `type-guards.ts:98-103`
- **extractVectorsFromRequest** — Typed vector extraction from GPU request, converting them to Float32Array for transfer via stdin/stdout `request-helpers.ts:82-167`
- **getCudaContext** — Retrieves the CUDA context `gpu-worker.ts:276-283`
- **getDimThreshold** — Determines the appropriate threshold based on the given dimensions `adaptive-thresholds.ts:133-141`
- **getEmbeddingsContext** — Retrieves the embeddings context `gpu-worker.ts:285-296`
- **getFaissContext** — Retrieves the Faiss context `gpu-worker.ts:262-274`
- **getGpuClient** — Creates and returns a GPU client instance `gpu-client.ts:908-914`
- **getIndexEntry** — Retrieves or updates the index entry for a given project key `faiss-handlers.ts:172-180`
- **getMinTrainingVectors** — Calculates the minimum number of training vectors based on the configuration `faiss-handlers.ts:115-118`
- **getPipePath** — Generates the path for the named pipe `named-pipe-transport.ts:465-467`
- **getRecommendedStrategy** — Gets the recommended strategy based on data size and vector dimensions `adaptive-thresholds.ts:233-270`
- **getThresholds** — Returns the current adaptive thresholds `adaptive-thresholds.ts:122-124`
- **handleCudaBatchCosine** — Handles batch cosine similarity operations `cuda-handlers.ts:184-220`
- **handleCudaCosine** — Handles CUDA cosine similarity operations `cuda-handlers.ts:158-182`
- **handleCudaEuclidean** — Handles CUDA Euclidean distance operations `cuda-handlers.ts:222-246`
- **handleCudaInfo** — Handles CUDA device information queries `cuda-handlers.ts:146-156`
- **handleCudaNormalize** — Handles CUDA vector normalization operations `cuda-handlers.ts:248-272`
- **handleEmbeddingsAddBatch** — Handles adding a batch of embeddings to the Faiss index `embeddings-handlers.ts:49-146`
- **handleEmbeddingsFlush** — Flushes the Faiss index and content cache, logging the time taken and the number of vectors flushed `embeddings-handlers.ts:233-271`
- **handleEmbeddingsRemove** — Removes specified IDs from the Faiss index and content cache, logging the number of removed mappings `embeddings-handlers.ts:297-324`
- **handleEmbeddingsSearch** — Parses and processes an embeddings search request, validating the input vector and performing a search using the Faiss index `embeddings-handlers.ts:148-231`
- **handleEmbeddingsStats** — Calculates and sends statistics about the Faiss index and content cache, including memory usage and vector counts `embeddings-handlers.ts:273-295`
- **handleFaissAdd** — Adds vectors to a Faiss index `faiss-handlers.ts:367-461`
- **handleFaissBatchSearch** — Searches for multiple vectors in a Faiss index `faiss-handlers.ts:573-659`
- **handleFaissInit** — Initializes the FAISS index, evicting if necessary, and loads or creates the index `faiss-handlers.ts:250-365`
- **handleFaissLoad** — Loads a Faiss index from a specified path `faiss-handlers.ts:776-848`
- **handleFaissRemove** — Removes vectors from a Faiss index `faiss-handlers.ts:661-710`
- **handleFaissSave** — Saves a Faiss index to a specified path `faiss-handlers.ts:712-774`
- **handleFaissSearch** — Searches for vectors in a Faiss index `faiss-handlers.ts:463-571`
- **handleFaissStats** — Retrieves statistics about the Faiss index `faiss-handlers.ts:918-968`
- **handleFaissTrain** — Trains a Faiss index using a set of vectors `faiss-handlers.ts:850-916`
- **handleNamedPipeRequest** — Handles requests via a named pipe `gpu-worker.ts:538-578`
- **handleRequest** — Handles incoming requests `gpu-worker.ts:354-463`
- **handleShutdown** — Handles shutdown requests `gpu-worker.ts:344-348`
- **handleStats** — Handles statistics requests `gpu-worker.ts:302-342`
- **input** — Maps input vectors to arrays, converting Float32Array instances to arrays `gpu-client.ts:814-814`
- **isCudaBatchCosineRequest** — Returns true if the request type is "cuda.batchCosine" `type-guards.ts:214-216`
- **isCudaCosineRequest** — Validates if a GPU worker request is a CUDA cosine request `type-guards.ts:207-209`
- **isCudaEuclideanRequest** — Returns true if the request type is "cuda.euclidean" `type-guards.ts:221-223`
- **isCudaInfoRequest** — Validates if a GPU worker request is a CUDA information request `type-guards.ts:193-195`
- **isCudaNormalizeRequest** — Returns true if the request type is "cuda.normalize" `type-guards.ts:228-230`
- **isEmbeddingsAddBatchRequest** — Returns true if the request type is "embeddings.addBatch" `type-guards.ts:239-241`
- **isEmbeddingsFlushRequest** — Returns true if the request type is "embeddings.flush" `type-guards.ts:253-255`
- **isEmbeddingsRemoveRequest** — Returns true if the request type is "embeddings.remove" `type-guards.ts:267-269`
- **isEmbeddingsSearchRequest** — Returns true if the request type is "embeddings.search" `type-guards.ts:246-248`
- **isEmbeddingsStatsRequest** — Returns true if the request type is "embeddings.stats" `type-guards.ts:260-262`
- **isFaissAddRequest** — Validates if a GPU worker request is a Faiss addition request `type-guards.ts:126-128`
- **isFaissBatchSearchRequest** — Validates if a GPU worker request is a Faiss batch search request `type-guards.ts:147-149`
- **isFaissInitRequest** — Validates if a GPU worker request is a Faiss initialization request `type-guards.ts:112-114`
- **isFaissLoadRequest** — Validates if a GPU worker request is a Faiss load request `type-guards.ts:168-170`
- **isFaissRemoveRequest** — Validates if a GPU worker request is a Faiss removal request `type-guards.ts:154-156`
- **isFaissSaveRequest** — Validates if a GPU worker request is a Faiss save request `type-guards.ts:161-163`
- **isFaissSearchRequest** — Validates if a GPU worker request is a Faiss search request `type-guards.ts:140-142`
- **isFaissStatsRequest** — Validates if a GPU worker request is a Faiss statistics request `type-guards.ts:182-184`
- **isFaissTrainRequest** — Validates if a GPU worker request is a Faiss training request `type-guards.ts:175-177`
- **isGpuErrorResponse** — Type guard for checking error response `type-guards.ts:59-61`
- **isGpuSuccessResponse** — Type guard for checking success response `type-guards.ts:77-79`
- **isIvfType** — Checks if the index type requires training `faiss-handlers.ts:55-57`
- **loadContentCache** — Loads content cache from a file `gpu-worker.ts:243-256`
- **loadCuda** — Loads the CUDA addon if not disabled by environment variable `gpu-worker.ts:71-143`
- **log** — Logs messages to the console `gpu-worker.ts:149-151`
- **logError** — Logs error messages to the console `gpu-worker.ts:153-155`
- **main** — The main function of the GPU worker `gpu-worker.ts:580-711`
- **normalized** — Normalizes vectors using CUDA and returns a promise containing a Float32Array of normalized vectors and a boolean indicating if CUDA was used `gpu-client.ts:870-873`
- **parsePacket** — Parses a received packet into its components `named-pipe-transport.ts:436-460`
- **pipeExists** — Checks if the named pipe exists `named-pipe-transport.ts:472-479`
- **readLoop** — A loop to read from the GPU client's stdout `gpu-client.ts:400-413`
- **reconstructRequestWithVectors** — Reconstructs a request with vectors `gpu-worker.ts:477-536`
- **responsePromise** — A promise for the response from the GPU client `gpu-client.ts:582-585`
- **responsePromise** — Represents a promise for the response to a request `named-pipe-transport.ts:362-379`
- **saveContentCache** — Saves content cache to a file `gpu-worker.ts:227-241`
- **saveContentCacheToFile** — Saves the content cache to a file, logging success or failure `embeddings-handlers.ts:330-350`
- **sendError** — Sends an error response to the parent process `gpu-worker.ts:208-215`
- **sendResponse** — Sends a response to the parent process `gpu-worker.ts:199-206`
- **setContentCachePath** — Sets the path for content cache `gpu-worker.ts:223-225`
- **shouldUseCudaBatchCosine** — Determines if CUDA should be used for batch cosine similarity based on vector dimensions `adaptive-thresholds.ts:146-160`
- **shouldUseCudaNormalize** — Determines if CUDA should be used for normalization based on vector dimensions `adaptive-thresholds.ts:165-168`
- **shouldUseFaissBulkInsert** — Determines if Faiss should be used for bulk insert operations `adaptive-thresholds.ts:173-175`
- **shouldUseFaissRebuild** — Determines if Faiss should be used for index rebuild operations `adaptive-thresholds.ts:182-197`
- **shouldUseFaissSearch** — Determines if Faiss should be used for search operations `adaptive-thresholds.ts:202-214`
- **shutdownGpuClient** — Stops and closes the GPU client `gpu-client.ts:916-921`
- **syncLegacyState** — Synchronizes the state of the GPU worker with the index entry `faiss-handlers.ts:235-244`
- **timeoutPromise** — A promise for the timeout of the GPU client `gpu-client.ts:588-596`
- **timeoutPromise** — Returns a new promise that resolves immediately `gpu-client.ts:592-592`
- **timeoutPromise** — Represents a promise for a timeout event `named-pipe-transport.ts:382-390`
- **timeoutPromise** — Returns a promise that resolves to a buffer after a timeout `named-pipe-transport.ts:386-386`
- **totalLen** — Calculates the total length of query array and database arrays combined `request-helpers.ts:141-141`
- **wrapper** — A wrapper for the GPU client `gpu-client.ts:350-350`
- **wrapper** — Wraps an event handler for "exit" and "close" events, invoking a handler when the process exits or closes `gpu-client.ts:351-355`

### Method
- **adaptiveBatchCosineSimilarity** — Computes cosine similarity between multiple pairs of vectors using adaptive thresholds `gpu-client.ts:825-851`
- **adaptiveNormalizeVectors** — Normalizes vectors using adaptive thresholds `gpu-client.ts:853-876`
- **append** — Appends bytes to the buffer `named-pipe-transport.ts:95-99`
- **connect** — Establishes a connection to the named pipe `named-pipe-transport.ts:286-326`
- **constructor** — Initializes the GPU client `gpu-client.ts:180-188`
- **constructor** — Initializes a new instance of the NamedPipeServer `named-pipe-transport.ts:144-147`
- **constructor** — Constructor for the GrowableBuffer class `named-pipe-transport.ts:71-74`, `named-pipe-transport.ts:270-276`
- **consume** — Processes incoming data from the named pipe `named-pipe-transport.ts:117-125`
- **cudaBatchCosineSimilarity** — Computes cosine similarity between multiple pairs of vectors using CUDA `gpu-client.ts:792-802`
- **cudaCosineSimilarity** — Computes cosine similarity between two vectors using CUDA `gpu-client.ts:783-790`
- **cudaEuclideanDistance** — Computes Euclidean distance between two vectors using CUDA `gpu-client.ts:804-811`
- **cudaInfo** — Retrieves information about CUDA availability and configuration `gpu-client.ts:773-777`
- **cudaNormalizeVectors** — Normalizes vectors using CUDA `gpu-client.ts:813-819`
- **dataLength** — Returns the length of the buffer `named-pipe-transport.ts:102-104`
- **disconnect** — Handles the disconnection of the named pipe `named-pipe-transport.ts:395-401`
- **ensureCapacity** — Ensures capacity for additional bytes `named-pipe-transport.ts:77-85`
- **faissAdd** — Adds new vectors to a Faiss index `gpu-client.ts:652-700`
- **faissBatchSearch** — Searches for similar vectors in a Faiss index in a batch `gpu-client.ts:716-732`
- **faissGetStats** — Retrieves statistics about a Faiss index `gpu-client.ts:763-767`
- **faissInitialize** — Initializes a Faiss index with specified configuration and optional load path `gpu-client.ts:640-650`
- **faissLoad** — Loads a Faiss index from a file `gpu-client.ts:752-756`
- **faissRemove** — Removes vectors from a Faiss index `gpu-client.ts:758-761`
- **faissSave** — Saves a Faiss index to a file `gpu-client.ts:745-750`
- **faissSearch** — Searches for similar vectors in a Faiss index `gpu-client.ts:702-714`
- **faissTrain** — Trains a Faiss index `gpu-client.ts:734-743`
- **findWorkerPath** — Finds the path to the GPU worker process `gpu-client.ts:219-263`
- **getRecommendedStrategy** — Gets the recommended strategy for CUDA operations based on adaptive thresholds `gpu-client.ts:878-885`
- **getStats** — Returns GPU client statistics `gpu-client.ts:891-895`
- **handleConnection** — Handles incoming connections for the named pipe server `named-pipe-transport.ts:185-225`
- **handleData** — Processes incoming data packets `named-pipe-transport.ts:328-347`
- **handleResponse** — Handles the response from the GPU client `gpu-client.ts:445-453`
- **handleWorkerCrash** — Handles a crash in the GPU worker process `gpu-client.ts:505-522`
- **isConnected** — Checks if the named pipe client is connected `named-pipe-transport.ts:282-284`
- **isCudaAvailable** — Checks if CUDA is available `gpu-client.ts:779-781`
- **isRunning** — Checks if the GPU client is running `gpu-client.ts:557-559`
- **path** — The path to the named pipe used for communication `named-pipe-transport.ts:149-151`
- **path** — Getter method that returns the path to the named pipe `named-pipe-transport.ts:278-280`
- **processResponseBuffer** — Processes the response buffer from the GPU client `gpu-client.ts:425-443`
- **readUInt32LE** — Reads a 32-bit unsigned integer from the buffer `named-pipe-transport.ts:107-109`
- **registerCleanupHandlers** — Registers cleanup handlers for the GPU client `gpu-client.ts:190-217`
- **reset** — Resets the named pipe transport to its initial state `named-pipe-transport.ts:128-131`
- **send** — Sends a packet over the named pipe `named-pipe-transport.ts:349-393`
- **sendNamedPipeRequest** — Sends a named pipe request to the GPU client `gpu-client.ts:605-613`
- **sendNamedPipeRequestInternal** — Internal method to send a named pipe request to the GPU client `gpu-client.ts:618-634`
- **sendRequest** — Sends a request to the GPU client `gpu-client.ts:561-599`
- **setupStdoutReader** — Sets up a reader for the GPU client's stdout `gpu-client.ts:377-423`
- **shrinkIfEmpty** — Shrinks back to initial size when empty `named-pipe-transport.ts:88-92`
- **start** — Starts the GPU client `gpu-client.ts:265-283`
- **start** — Starts the named pipe server `named-pipe-transport.ts:153-183`
- **startInternal** — Internal method to start the GPU client `gpu-client.ts:285-375`
- **stop** — Stops the GPU client `gpu-client.ts:524-555`
- **stop** — Stops the named pipe server `named-pipe-transport.ts:227-252`
- **subarray** — Returns a new buffer containing a subarray of the current buffer `named-pipe-transport.ts:112-114`
- **waitForReady** — Waits for the GPU client to be ready `gpu-client.ts:455-503`

### Class
- **GpuSubprocessClient** — Client for interacting with the GPU via a subprocess `gpu-client.ts:158-896`
- **GrowableBuffer** — Pre-allocated buffer with dynamic growth for efficient chunk accumulation `named-pipe-transport.ts:66-132`
- **NamedPipeClient** — Manages a client for named pipe communication `named-pipe-transport.ts:259-402`
- **NamedPipeServer** — Manages a server for named pipe communication `named-pipe-transport.ts:138-253`

### Interface
- **AdaptiveThresholds** — Determines when to use CUDA vs CPU based on data size and vector dimensions `adaptive-thresholds.ts:19-53`
- **BinaryPacketHeader** — Defines the header structure for binary packets `gpu-worker.ts:471-475`
- **BunProcessWrapper** — Typed wrapper for Bun subprocess to match Node.js ChildProcess interface `gpu-client.ts:57-64`
- **ContentCacheEntry** — Represents an entry in the content cache, storing metadata and content `types.ts:438-441`
- **CUDAAddon** — Represents a CUDA GPU handler with methods for cosine similarity, Euclidean distance, vector normalization, and device information queries `cuda-handlers.ts:27-133`
- **CudaBatchCosineRequest** — Represents a request to compute cosine similarity for a batch of vectors using CUDA `types.ts:119-123`
- **CudaBatchCosineResponse** — Represents a response from a CUDA batch cosine similarity operation, including similarities and time taken `types.ts:318-322`
- **CudaCosineRequest** — Represents a request to compute cosine similarity using CUDA `types.ts:113-117`
- **CudaCosineResponse** — Returns the cosine similarity and time taken for a CUDA operation `types.ts:312-316`
- **CudaDeviceInfo** — Provides information about CUDA devices, such as device count, name, compute capability, memory, and multi-processor count `types.ts:33-39`
- **CudaEuclideanRequest** — Represents a request to compute Euclidean distance using CUDA `types.ts:125-129`
- **CudaEuclideanResponse** — Represents a response from a CUDA Euclidean distance operation, including the distance and time taken `types.ts:324-328`
- **CudaHandlerContext** — Manages the context for CUDA operations `cuda-handlers.ts:135-140`
- **CudaInfoRequest** — Represents a request to get information about CUDA devices `types.ts:109-111`
- **CudaInfoResponse** — Returns information about CUDA availability and device details `types.ts:306-310`
- **CudaNormalizeRequest** — Specifies a request to normalize vectors using CUDA `types.ts:131-134`
- **CudaNormalizeResponse** — Represents the response from normalizing CUDA vectors `types.ts:330-334`
- **EmbeddingItem** — Defines an item containing an embedding vector and optional metadata `types.ts:140-146`
- **EmbeddingsAddBatchRequest** — Represents a batch request to add multiple embedding items `types.ts:148-151`
- **EmbeddingsAddBatchResponse** — Represents the response from adding a batch of embeddings `types.ts:345-350`
- **EmbeddingsFlushRequest** — Indicates a request to flush embeddings `types.ts:160-162`
- **EmbeddingsFlushResponse** — Represents the response from flushing embeddings `types.ts:358-362`
- **EmbeddingsHandlerContext** — Manages the state and operations for embeddings using Faiss and content caching `embeddings-handlers.ts:34-43`
- **EmbeddingsRemoveRequest** — Specifies a request to remove embeddings by ID `types.ts:168-171`
- **EmbeddingsRemoveResponse** — Represents the response from removing embeddings `types.ts:375-379`
- **EmbeddingsSearchRequest** — Specifies a request to search for embeddings based on a vector `types.ts:153-158`
- **EmbeddingsSearchResponse** — Represents the response from searching embeddings `types.ts:352-356`
- **EmbeddingsSearchResultItem** — Represents an item in the search results `types.ts:338-343`
- **EmbeddingsStatsRequest** — Represents a request to get statistics about embeddings `types.ts:164-166`
- **EmbeddingsStatsResponse** — Represents the response from getting statistics of embeddings `types.ts:364-373`
- **ExtractedVectors** — Result of extracting vectors from request, containing vectors and header data `request-helpers.ts:23-35`
- **FaissAddRequest** — Represents a request to add vectors to a Faiss index `types.ts:52-57`
- **FaissAddResponse** — Represents the response from adding vectors to a Faiss index `types.ts:246-251`
- **FaissBatchSearchRequest** — Represents a batch search request to find similar vectors in a Faiss index `types.ts:67-73`
- **FaissBatchSearchResponse** — Represents the result of a batch Faiss search operation `types.ts:259-263`
- **FaissHandlerContext** — Manages Faiss index operations using the native FAISS addon `faiss-handlers.ts:39-49`
- **FaissIndexConfig** — Configures a Faiss index with parameters like dimensions, index type, metric, and other specific settings `types.ts:14-27`
- **FaissInitRequest** — Initializes a Faiss index with a configuration and optionally loads a path `types.ts:45-50`
- **FaissInitResponse** — Represents the response from initializing a Faiss index `types.ts:239-244`
- **FaissLoadRequest** — Represents a request to load a Faiss index `types.ts:87-91`
- **FaissLoadResponse** — Represents the result of a Faiss load operation `types.ts:277-281`
- **FaissRemoveRequest** — Represents a request to remove vectors from a Faiss index `types.ts:75-79`
- **FaissRemoveResponse** — Represents the result of a Faiss remove operation `types.ts:265-269`
- **FaissSaveRequest** — Represents a request to save a Faiss index `types.ts:81-85`
- **FaissSaveResponse** — Represents the result of a Faiss save operation `types.ts:271-275`
- **FaissSearchRequest** — Represents a request to search for similar vectors in a Faiss index `types.ts:59-65`
- **FaissSearchResponse** — Represents the result of a Faiss search operation `types.ts:253-257`
- **FaissSearchResult** — Represents the result of a Faiss search `types.ts:233-237`
- **FaissStatsRequest** — Represents a request to retrieve statistics about a Faiss index `types.ts:100-103`
- **FaissStatsResponse** — Provides statistics about a Faiss index `types.ts:289-302`
- **FaissTrainRequest** — Represents a request to train a Faiss index `types.ts:93-98`
- **FaissTrainResponse** — Represents the result of a Faiss train operation `types.ts:283-287`
- **GlobalWithCapture** — Represents a global object with capture functionality `gpu-worker.ts:191-193`
- **GpuClientConfig** — Configuration object for the GPU client `gpu-client.ts:124-137`
- **GpuErrorResponse** — Represents an error response from the GPU worker `types.ts:225-229`
- **GpuShutdownRequest** — Represents a request to shut down the GPU worker `types.ts:181-183`
- **GpuStatsRequest** — Represents a request to get GPU statistics `types.ts:177-179`
- **GpuStatsResponse** — Represents the GPU statistics response `types.ts:383-400`
- **GpuSuccessResponse** — Represents a successful response from the GPU worker `types.ts:220-223`
- **GpuWorkerState** — Represents the state of the GPU worker `types.ts:551-574`
- **IGpuClient** — Unified interface for GPU operations, including Faiss and CUDA functionalities `gpu-client.ts:70-118`
- **IndexEntry** — Represents an entry in the Faiss index `types.ts:536-549`
- **NamedPipeClientOptions** — Unique identifier for the pipe (appended to prefix), request timeout in ms, and connection/disconnection handlers `named-pipe-transport.ts:40-51`
- **NamedPipeServerOptions** — Unique identifier for the pipe (appended to prefix) and request handler for the server `named-pipe-transport.ts:29-38`
- **NativeFaissAddon** — Represents a native Faiss addon for GPU operations `types.ts:447-525`
- **PendingRequest** — Represents a pending request to the GPU client `gpu-client.ts:152-156`
- **StrategyRecommendation** — Recommendation for strategies based on data size and vector dimensions `adaptive-thresholds.ts:223-228`
- **TrainingBufferEntry** — Represents an entry in the training buffer for the Faiss index `types.ts:531-534`

### Type_alias
- **FaissIndexType** — Represents the type of Faiss index, such as flat, hnsw, ivf, ivfpq, or ivfsq `types.ts:12-12`
- **GpuWorkerRequest** — Represents a request to the GPU worker `types.ts:189-214`
- **GpuWorkerResponse** — Contains the response from the GPU worker, including success status and additional data `types.ts:406-432`
- **IndexStrategy** — Strategy for index building `adaptive-thresholds.ts:220-220`
- **ResponseWithVectors** — Represents a response containing vectors `gpu-worker.ts:562-564`
- **SearchStrategy** — Strategy for search operations `adaptive-thresholds.ts:221-221`

### Import_decl
- **../../logging/index.js** — Imports `../../logging/index.js` from `../../logging/index.js`. `adaptive-thresholds.ts:13-13`, `gpu-client.ts:15-15`
- **../../shared/storage-paths.js** — Imports `../../shared/storage-paths.js` from `../../shared/storage-paths.js`. `gpu-client.ts:16-16`
- **../../utils/runtime-detection.js** — Imports `../../utils/runtime-detection.js` from `../../utils/runtime-detection.js`. `named-pipe-transport.ts:17-17`
- **../../utils/runtime.js** — Imports `../../utils/runtime.js` from `../../utils/runtime.js`. `gpu-client.ts:17-17`
- **../../utils/simd-vector-ops.js** — Imports `../../utils/simd-vector-ops.js` from `../../utils/simd-vector-ops.js`. `gpu-client.ts:18-18`
- **./adaptive-thresholds.js** — Imports `./adaptive-thresholds.js`. `gpu-client.ts:19-24`
- **./cuda-handlers.js** — Imports `./cuda-handlers.js`. `gpu-worker.ts:22-30`
- **./embeddings-handlers.js** — Imports `./embeddings-handlers.js`. `gpu-worker.ts:31-38`
- **./faiss-handlers.js** — Imports `./faiss-handlers.js`. `gpu-worker.ts:40-51`
- **./named-pipe-transport.js** — Imports `./named-pipe-transport.js` from `./named-pipe-transport.js`. `gpu-client.ts:25-25`, `gpu-worker.ts:52-52`
- **./request-helpers.js** — Imports `./request-helpers.js` from `./request-helpers.js`. `gpu-client.ts:26-26`
- **./type-guards.js** — Imports `./type-guards.js` from `./type-guards.js`. `gpu-client.ts:27-27`
- **./type-guards.js** — Imports `./type-guards.js`. `request-helpers.ts:10-17`
- **./types.js** — Imports `./types.js`. `cuda-handlers.ts:13-21`, `embeddings-handlers.ts:15-28`, `faiss-handlers.ts:17-33`, `gpu-client.ts:28-48`, `gpu-worker.ts:54-62`, `type-guards.ts:10-37`
- **./types.js** — Imports `./types.js` from `./types.js`. `request-helpers.ts:18-18`
- **node:child_process** — Imports `node:child_process` from `node:child_process`. `gpu-client.ts:11-11`
- **node:fs** — Imports `node:fs` from `node:fs`. `embeddings-handlers.ts:13-13`, `faiss-handlers.ts:15-15`, `gpu-client.ts:12-12`, `gpu-worker.ts:18-18`, `named-pipe-transport.ts:15-15`
- **node:net** — Imports `node:net` from `node:net`. `named-pipe-transport.ts:16-16`
- **node:path** — Imports `node:path` from `node:path`. `gpu-client.ts:13-13`, `gpu-worker.ts:19-19`
- **node:readline** — Imports `node:readline` from `node:readline`. `gpu-worker.ts:20-20`
- **node:url** — Imports `node:url` from `node:url`. `gpu-client.ts:14-14`

### Property
- **_captureResponse** — Captures the response from a CUDA operation `gpu-worker.ts:192-192`
- **_cudaAvailable** — Boolean indicating whether CUDA is available `gpu-client.ts:167-167`
- **a** — Vector A for cosine similarity `cuda-handlers.ts:158-158`
- **a** — A number array used in the Euclidean distance calculation `cuda-handlers.ts:222-222`
- **a** — Represents the first vector for cosine similarity computation `types.ts:115-115`
- **a** — Stores an array of numbers `types.ts:127-127`
- **abortController** — Controller for aborting ongoing operations `gpu-client.ts:155-155`
- **activeProjectKey** — Stores the key of the active project `types.ts:564-564`
- **activeSockets** — Tracks active sockets for the named pipe server `named-pipe-transport.ts:142-142`
- **addedCount** — Represents the number of vectors added to a GPU index `cuda-handlers.ts:84-84`
- **addedCount** — The number of vectors added to the Faiss index `types.ts:248-248`
- **addedCount** — Counts the number of added vectors `types.ts:347-347`
- **addedCount** — Stores the count of vectors added to the Faiss index `types.ts:476-476`
- **addTimeMs** — The time taken to add vectors to the Faiss index in milliseconds `types.ts:250-250`
- **addTimeMs** — Stores the time in milliseconds for adding vectors `types.ts:349-349`
- **autoRestart** — Boolean indicating whether the GPU client should automatically restart on failure `gpu-client.ts:132-132`
- **available** — Indicates whether the index is available `types.ts:308-308`
- **available** — Indicates whether the CUDA device is available `types.ts:395-395`
- **b** — Vector B for cosine similarity `cuda-handlers.ts:158-158`
- **b** — A number array used in the Euclidean distance calculation `cuda-handlers.ts:222-222`
- **b** — Represents the second vector for cosine similarity computation `types.ts:116-116`
- **b** — Stores a number array `types.ts:128-128`
- **batchQueryThreshold** — Batch search threshold - use Faiss if query count exceeds this `adaptive-thresholds.ts:51-51`
- **buffer** — Internal buffer for the GrowableBuffer `named-pipe-transport.ts:67-67`
- **bulkInsertThreshold** — Use Faiss for bulk insert if count exceeds this `adaptive-thresholds.ts:39-39`
- **cacheMemoryMB** — Stores the cache memory usage in megabytes `types.ts:371-371`
- **computeCapability** — Returns the compute capability of the CUDA device `cuda-handlers.ts:35-35`
- **computeCapability** — Specifies the compute capability of a CUDA device `types.ts:36-36`
- **config** — Contains the configuration for the FAISS index `faiss-handlers.ts:251-251`
- **config** — Configuration for the GPU subprocess client `gpu-client.ts:159-159`
- **config** — Contains the configuration for the Faiss index `types.ts:48-48`
- **config** — Stores the configuration for the Faiss index `types.ts:537-537`
- **connected** — Indicates whether the named pipe client is connected `named-pipe-transport.ts:263-263`
- **content** — Content associated with an embedding `embeddings-handlers.ts:201-201`
- **content** — Contains the main content of a packet `gpu-worker.ts:474-474`
- **content** — Optionally stores a string or undefined `types.ts:144-144`
- **content** — Contains the content of the item `types.ts:341-341`
- **content** — Stores the actual content of a cache entry `types.ts:439-439`
- **contentCache** — Represents the content cache `types.ts:566-566`
- **contentCacheDirty** — Indicates if the content cache is dirty `types.ts:567-567`
- **contentCachePath** — Path to the content cache file `embeddings-handlers.ts:37-37`
- **contentCachePath** — Stores the path to the content cache `types.ts:546-546`
- **cuda** — Represents the CUDA device information `types.ts:394-398`
- **cudaAddon** — Provides CUDA GPU operations `cuda-handlers.ts:136-136`
- **cudaAvailable** — Checks if CUDA is available `types.ts:569-569`
- **cudaBatchCosine** — Minimum vectors for CUDA batch cosine similarity (per dimension tier) `adaptive-thresholds.ts:21-26`
- **cudaDeviceInfo** — Stores information about CUDA devices `types.ts:570-570`
- **cudaNormalize** — Minimum vectors for CUDA normalization `adaptive-thresholds.ts:29-34`
- **database** — Database context for GPU FAISS operations `cuda-handlers.ts:185-185`
- **database** — Represents the database vector for cosine similarity computation `types.ts:122-122`
- **deviceCount** — Returns the number of CUDA devices available `cuda-handlers.ts:33-33`
- **deviceCount** — Indicates the number of CUDA devices available `types.ts:34-34`
- **deviceInfo** — Contains information about the CUDA device `types.ts:309-309`
- **deviceInfo** — Stores the device information for CUDA `types.ts:396-396`
- **deviceName** — Returns the name of the CUDA device `cuda-handlers.ts:34-34`
- **deviceName** — Provides the name of a CUDA device `types.ts:35-35`
- **dim1024** — Minimum vectors for CUDA batch cosine similarity (per dimension tier) `adaptive-thresholds.ts:24-24`
- **dim1024** — Represents a dimension threshold value `adaptive-thresholds.ts:32-32`
- **dim1024** — Represents a dimension threshold value within the thresholds object `adaptive-thresholds.ts:134-134`
- **dim384** — Minimum vectors for CUDA batch cosine similarity (per dimension tier) `adaptive-thresholds.ts:22-22`
- **dim384** — Represents a dimension threshold value `adaptive-thresholds.ts:30-30`
- **dim384** — Represents a dimension threshold value within the thresholds object `adaptive-thresholds.ts:134-134`
- **dim768** — Minimum vectors for CUDA batch cosine similarity (per dimension tier) `adaptive-thresholds.ts:23-23`
- **dim768** — Represents a dimension threshold value `adaptive-thresholds.ts:31-31`
- **dim768** — Represents a dimension threshold value within the thresholds object `adaptive-thresholds.ts:134-134`
- **dim8192** — Minimum vectors for CUDA batch cosine similarity (per dimension tier) `adaptive-thresholds.ts:25-25`
- **dim8192** — Minimum vectors for CUDA batch cosine similarity in 8192-dim vectors `adaptive-thresholds.ts:33-33`
- **dim8192** — Represents a dimension threshold value within the thresholds object `adaptive-thresholds.ts:134-134`
- **dimensions** — Stores the dimensions of a vector `gpu-worker.ts:472-472`
- **dimensions** — Specifies the number of dimensions for the vectors in the Faiss index `types.ts:15-15`
- **dimensions** — The number of dimensions in the Faiss index `types.ts:242-242`
- **dimensions** — Indicates the number of dimensions in the vectors `types.ts:293-293`
- **dimensions** — Specifies the dimensions of the vectors `types.ts:369-369`
- **dimensions** — Specifies the dimensionality of the vectors `types.ts:388-388`
- **dimensions** — Represents the number of dimensions `types.ts:544-544`
- **dims** — Stores the dimensions of the vectors in the GPU FAISS index `cuda-handlers.ts:53-53`
- **dims** — Stores the dimensions of the vectors in a GPU index `cuda-handlers.ts:64-64`
- **dims** — Stores a number representing the dimensions `cuda-handlers.ts:117-117`
- **dims** — Represents the number of dimensions `cuda-handlers.ts:125-125`
- **dims** — Stores the dimensions of the vectors in the Faiss index `types.ts:456-456`
- **dims** — Specifies the dimensions of the vectors `types.ts:509-509`
- **dims** — Represents the dimensions of the index `types.ts:517-517`
- **distance** — Distance metric used for searching `faiss-handlers.ts:543-543`
- **distance** — Stores the distance between a query vector and a stored vector `faiss-handlers.ts:627-627`
- **distance** — Stores the distance between a query vector and a stored vector in the query results `faiss-handlers.ts:630-630`
- **distance** — The distance between the query vector and the result vector `types.ts:235-235`
- **distance** — Represents the distance between vectors `types.ts:326-326`
- **distances** — Stores distances from GPU FAISS search results `cuda-handlers.ts:43-43`
- **distances** — Stores the distances between the query vector and the nearest neighbors `cuda-handlers.ts:49-49`
- **distances** — Stores a `Float32Array` of distances `cuda-handlers.ts:94-94`
- **distances** — Stores an array of 32-bit floating-point numbers `cuda-handlers.ts:104-104`
- **distances** — Stores distances between vectors in the Faiss index `types.ts:486-486`
- **distances** — Stores the distances as a Float32Array `types.ts:496-496`
- **error** — Contains the error message in the response `types.ts:227-227`
- **factory** — Stores the factory string for the native FAISS index `cuda-handlers.ts:65-65`
- **factory** — Represents the factory string used in creating a GPU index `cuda-handlers.ts:127-127`
- **factory** — Represents the FAISS factory string `faiss-handlers.ts:66-66`
- **factory** — Represents the factory for creating Faiss index configurations `types.ts:457-457`
- **factory** — Represents the factory for creating Faiss indices `types.ts:519-519`
- **faiss** — Represents the Faiss index configuration `types.ts:385-393`
- **faissDimensions** — Specifies the dimensions of the Faiss index `types.ts:558-558`
- **faissIdMap** — Maps IDs to vectors in the Faiss index `types.ts:561-561`
- **faissIndexBuild** — Minimum vectors for using Faiss instead of LibSQL DiskANN `adaptive-thresholds.ts:37-44`
- **faissIndexType** — Defines the type of Faiss index `types.ts:557-557`
- **faissInitConfig** — Configuration for initializing a Faiss index `gpu-client.ts:165-165`
- **faissInitialized** — Indicates if Faiss has been initialized `types.ts:556-556`
- **faissIsTrained** — Determines if the Faiss index has been trained `types.ts:560-560`
- **faissReverseIdMap** — Maps vectors to IDs in the Faiss index `types.ts:562-562`
- **faissSearch** — Minimum vectors for using Faiss search instead of DiskANN `adaptive-thresholds.ts:47-52`
- **faissTotalVectors** — Represents the total number of vectors in the Faiss index `types.ts:559-559`
- **filterIds** — Optional array of IDs to filter the search results `types.ts:64-64`
- **flushedCount** — Counts the number of flushed vectors `types.ts:360-360`
- **flushTimeMs** — Stores the time in milliseconds for the flush operation `types.ts:361-361`
- **forceSubprocess** — Boolean indicating whether to force the use of a subprocess `gpu-client.ts:136-136`
- **gpuFaissAvailable** — Indicates whether GPU Faiss is available `types.ts:397-397`
- **gpuFaissAvailable** — Indicates if GPU Faiss is available `types.ts:571-571`
- **gpuMemoryMB** — Stores the GPU memory in MB used by the GPU FAISS index `cuda-handlers.ts:53-53`
- **hasGpuFaiss** — Indicates whether GPU FAISS is available `cuda-handlers.ts:39-39`
- **hasNativeFaiss** — Indicates whether native FAISS is available `cuda-handlers.ts:55-55`
- **header** — Extracts the header from a packet `named-pipe-transport.ts:437-437`
- **headerData** — Request header data without vectors, contains type, ids, k and other parameters `request-helpers.ts:34-34`
- **hnswEfConstruction** — Sets the number of neighbors to consider during the construction of the HNSW index `types.ts:19-19`
- **hnswEfConstruction** — Represents the construction efficiency factor for the HNSW index `types.ts:298-298`
- **hnswEfSearch** — Sets the number of neighbors to consider during the search in the HNSW index `types.ts:20-20`
- **hnswM** — Sets the number of neighbors to consider during construction of the HNSW index `types.ts:18-18`
- **hnswM** — Represents the maximum number of neighbors in the HNSW index `types.ts:297-297`
- **id** — Identifier for an embedding `embeddings-handlers.ts:199-199`
- **id** — ID of the vector being searched `faiss-handlers.ts:543-543`
- **id** — Stores the unique identifier of a vector `faiss-handlers.ts:627-627`
- **id** — Stores the unique identifier of a vector in the query results `faiss-handlers.ts:630-630`
- **id** — Identifies a specific item or request `gpu-worker.ts:474-474`
- **id** — Stores a string representing an identifier `types.ts:141-141`
- **id** — The ID of the search result `types.ts:234-234`
- **id** — Identifies the item `types.ts:339-339`
- **idMap** — Maps IDs to vectors in the Faiss index `types.ts:538-538`
- **ids** — Array of identifiers for embeddings `embeddings-handlers.ts:297-297`
- **ids** — List of IDs for the vectors being added `faiss-handlers.ts:368-368`
- **ids** — Contains the list of IDs to be removed from the Faiss project `faiss-handlers.ts:661-661`
- **ids** — Array of IDs for the vectors being added `types.ts:55-55`
- **ids** — Contains an array of string IDs `types.ts:78-78`
- **ids** — Stores the IDs of the vectors in the Faiss index `types.ts:170-170`
- **ids** — Stores an array of string IDs `types.ts:532-532`
- **includeContent** — Indicates whether to include content in the search results `types.ts:157-157`
- **incrementalDeltaPercent** — Use Faiss for incremental updates if delta exceeds this % of total `adaptive-thresholds.ts:43-43`
- **indexPool** — Manages a pool of indices `types.ts:553-553`
- **indexPoolKeys** — Stores the keys of the index pool `types.ts:392-392`
- **indexStrategy** — Strategy for index building `adaptive-thresholds.ts:224-224`
- **indexType** — Stores the type of the native FAISS index `cuda-handlers.ts:66-66`
- **indexType** — Specifies the type of index used in a GPU index `cuda-handlers.ts:118-118`
- **indexType** — Specifies the type of index used `cuda-handlers.ts:126-126`
- **indexType** — Defines the type of index used in Faiss, such as flat, hnsw, ivf, ivfpq, or ivfsq `types.ts:16-16`
- **indexType** — The type of the Faiss index `types.ts:241-241`
- **indexType** — Specifies the type of the Faiss index `types.ts:292-292`
- **indexType** — Defines the type of index used in Faiss `types.ts:370-370`
- **indexType** — Specifies the type of Faiss index `types.ts:387-387`
- **indexType** — Defines the type of the Faiss index `types.ts:458-458`
- **indexType** — Defines the type of index used (e.g., flat, hnsw, ivf) `types.ts:510-510`
- **indexType** — Represents the type of the index `types.ts:518-518`
- **indexType** — Represents the type of the Faiss index `types.ts:545-545`
- **initialized** — Indicates whether the Faiss index is initialized `types.ts:386-386`
- **initialSize** — Initial size of the buffer `named-pipe-transport.ts:69-69`
- **isDirty** — Indicates whether the index has been modified since the last save `types.ts:542-542`
- **isShuttingDown** — Boolean indicating whether the GPU client is shutting down `gpu-client.ts:164-164`
- **isTrained** — Indicates whether the native FAISS index is trained `cuda-handlers.ts:67-67`
- **isTrained** — Indicates whether a GPU index is trained `cuda-handlers.ts:76-76`
- **isTrained** — Indicates whether the FAISS index is trained `cuda-handlers.ts:116-116`
- **isTrained** — Indicates whether the model is trained `cuda-handlers.ts:129-129`, `types.ts:508-508`, `types.ts:521-521`, `types.ts:543-543`
- **isTrained** — Indicates whether the index is trained `faiss-handlers.ts:66-66`
- **isTrained** — Indicates whether the Faiss index is trained `types.ts:296-296`
- **isTrained** — Determines if the index has been trained `types.ts:459-459`
- **isTrained** — Indicates whether the model is trained as a boolean `types.ts:468-468`
- **items** — Represents a collection of items `gpu-worker.ts:474-474`
- **items** — Stores an array of EmbeddingItem objects `types.ts:150-150`
- **ivfNlist** — Sets the number of clusters for the IVF index `types.ts:21-21`
- **ivfNlist** — Represents the number of lists in the IVF index `types.ts:299-299`
- **ivfNprobe** — Sets the number of clusters to probe during the search in the IVF index `types.ts:22-22`
- **ivfNprobe** — Represents the number of probes per list in the IVF index `types.ts:300-300`
- **k** — Specifies the number of nearest neighbors to find in a search `cuda-handlers.ts:106-106`
- **k** — Number of nearest neighbors to return `faiss-handlers.ts:464-464`
- **k** — Represents the number of nearest neighbors to find `faiss-handlers.ts:574-574`
- **k** — Specifies the number of nearest neighbors to consider `types.ts:63-63`
- **k** — Stores the number of nearest neighbors to find in a search request `types.ts:72-72`
- **k** — Represents a number `types.ts:156-156`
- **k** — Represents the number of nearest neighbors to consider `types.ts:498-498`
- **kill** — () => void — method to kill the Bun subprocess `gpu-client.ts:62-62`
- **labels** — Stores labels from GPU FAISS search results `cuda-handlers.ts:43-43`
- **labels** — Contains the labels of the nearest neighbors found during a search `cuda-handlers.ts:49-49`
- **labels** — Stores a `BigInt64Array` of labels `cuda-handlers.ts:93-93`
- **labels** — Represents an array of 64-bit signed integers `cuda-handlers.ts:103-103`
- **labels** — Stores labels associated with vectors in the Faiss index `types.ts:485-485`
- **labels** — Stores the labels as a BigInt64Array `types.ts:495-495`
- **lastAccessedAt** — Stores the timestamp of the last access to the index `types.ts:541-541`
- **length** — Current length of the buffer `named-pipe-transport.ts:68-68`
- **loadContentCache** — Loads the content cache `faiss-handlers.ts:47-47`
- **loadedIndexes** — Represents the loaded indexes in the Faiss index `types.ts:391-391`
- **loadedVectors** — Represents the vectors loaded into a GPU index `cuda-handlers.ts:115-115`
- **loadedVectors** — The number of vectors loaded into the Faiss index `types.ts:243-243`
- **loadedVectors** — Stores the number of vectors loaded `types.ts:280-280`
- **loadedVectors** — Stores the vectors loaded into the Faiss index `types.ts:507-507`
- **loadPath** — Specifies the path to load the FAISS index from `faiss-handlers.ts:251-251`
- **loadPath** — Specifies the path to load the Faiss index from `types.ts:49-49`
- **log** — Logs messages to the console `embeddings-handlers.ts:38-38`
- **log** — Logs a message to the console `faiss-handlers.ts:42-42`
- **logError** — Logs error messages to the console `embeddings-handlers.ts:39-39`
- **logError** — Logs an error message to the console `faiss-handlers.ts:43-43`
- **maxLoadedIndexes** — Specifies the maximum number of indices that can be loaded `types.ts:554-554`
- **maxRestarts** — Maximum number of restarts allowed for the GPU client `gpu-client.ts:134-134`
- **memoryMB** — Stores the memory usage in megabytes for a GPU index `cuda-handlers.ts:128-128`
- **memoryMB** — Stores the memory usage in megabytes for the Faiss index `types.ts:520-520`
- **memoryUsageMB** — Stores the memory usage in megabytes `types.ts:295-295`
- **memoryUsageMB** — Represents the memory usage in megabytes `types.ts:390-390`
- **metadata** — Metadata associated with an embedding `embeddings-handlers.ts:202-202`
- **metadata** — Stores metadata associated with a packet `gpu-worker.ts:474-474`
- **metadata** — Optionally stores a record of key-value pairs `types.ts:145-145`
- **metadata** — Stores metadata associated with the item `types.ts:342-342`
- **metadata** — Stores metadata associated with a content cache entry `types.ts:440-440`
- **metric** — Determines the metric used for similarity calculations, such as l2, ip, or cosine `types.ts:17-17`
- **minIndexSize** — Use Faiss HNSW search if index size exceeds this `adaptive-thresholds.ts:49-49`
- **multiProcessorCount** — Specifies the number of multi-processors in a CUDA device `types.ts:38-38`
- **namedPipeClient** — Named pipe client for communication with the GPU worker `gpu-client.ts:170-170`
- **namedPipePath** — Path to the named pipe used for communication `gpu-client.ts:171-171`
- **namedPipeRequestQueue** — A queue for named pipe requests `gpu-client.ts:178-178`
- **nativeFaiss** — Reference to the native Faiss addon for GPU operations `embeddings-handlers.ts:35-35`
- **nativeFaiss** — Reference to the native FAISS addon `faiss-handlers.ts:40-40`
- **nlist** — Number of list elements in GPU FAISS `cuda-handlers.ts:130-130`
- **nlist** — Represents the number of lists in the Faiss index `types.ts:522-522`
- **nodePath** — Path to the Node.js executable `gpu-client.ts:126-126`
- **normalized** — Parses and normalizes vectors using CUDA if available `gpu-client.ts:108-108`
- **nprobe** — Number of probes for GPU FAISS `cuda-handlers.ts:131-131`
- **nprobe** — Represents the number of probes used in the Faiss index `types.ts:523-523`
- **nQueries** — Represents the number of queries performed in a batch search `cuda-handlers.ts:105-105`
- **nQueries** — Number of queries to perform in the batch search `faiss-handlers.ts:574-574`
- **nQueries** — Number of queries in the batch `types.ts:71-71`
- **nQueries** — Stores the number of queries in a batch search request `types.ts:497-497`
- **ntotal** — Stores the total number of vectors in the GPU FAISS index `cuda-handlers.ts:53-53`
- **ntotal** — Represents the total number of vectors in a GPU index `cuda-handlers.ts:124-124`
- **ntotal** — Represents the total number of vectors in the Faiss index `types.ts:516-516`
- **numThreads** — Specifies the number of threads to use for parallel processing `types.ts:26-26`
- **nVectors** — Represents the number of vectors used to train the Faiss index `faiss-handlers.ts:851-851`
- **nVectors** — Indicates the number of vectors in the training request `types.ts:97-97`
- **on** — (event: "exit" | "close", handler: (code: number | null) => void) => void — event handler for exit and close events of the Bun subprocess `gpu-client.ts:63-63`
- **onConnect** — Called on connection `named-pipe-transport.ts:46-46`
- **onDisconnect** — Called on disconnect `named-pipe-transport.ts:48-48`
- **onError** — Called on error `named-pipe-transport.ts:37-37`
- **onError** — Optional callback function to handle errors during the named pipe transport `named-pipe-transport.ts:50-50`
- **onReady** — Called when server is ready `named-pipe-transport.ts:35-35`
- **onRequest** — Request handler - receives raw packet, returns raw response `named-pipe-transport.ts:33-33`
- **options** — Configuration options for the named pipe server `named-pipe-transport.ts:140-140`
- **options** — Represents the configuration options for the named pipe transport `named-pipe-transport.ts:261-261`
- **path** — Stores the file path for GPU index operations `cuda-handlers.ts:108-108`
- **path** — Stores a string representing the file path `cuda-handlers.ts:114-114`
- **path** — Specifies the file path where the Faiss index will be saved or loaded `faiss-handlers.ts:712-712`
- **path** — Specifies the file path for the Faiss operation `faiss-handlers.ts:776-776`
- **path** — Stores a string representing a file path `types.ts:84-84`
- **path** — Provides the path to the Faiss index file `types.ts:90-90`
- **path** — Stores the path to the saved index `types.ts:273-273`
- **path** — Represents the path to the Faiss index `types.ts:279-279`
- **path** — Stores the file path `types.ts:500-500`
- **path** — Represents the file path as a string `types.ts:506-506`
- **pendingRequest** — Stores pending requests for the named pipe client `named-pipe-transport.ts:264-267`
- **pendingRequests** — List of pending requests to the GPU client `gpu-client.ts:161-161`
- **pid** — number — process ID of the Bun subprocess `gpu-client.ts:61-61`
- **pipeId** — Unique identifier for the pipe (appended to prefix) `named-pipe-transport.ts:31-31`
- **pipeId** — Stores the unique identifier for the named pipe `named-pipe-transport.ts:42-42`
- **pipePath** — The path to the named pipe used for communication `named-pipe-transport.ts:141-141`
- **pipePath** — Stores the path to the named pipe used for communication `named-pipe-transport.ts:262-262`
- **pqM** — Sets the number of PQ subspaces for the IVFPQ index `types.ts:23-23`
- **pqNbits** — Sets the number of bits per PQ subspace for the IVFPQ index `types.ts:24-24`
- **projectKey** — Stores the project key for GPU FAISS operations `cuda-handlers.ts:53-53`
- **projectKey** — Identifies the project key for GPU index operations `cuda-handlers.ts:63-63`
- **projectKey** — Represents the key for the current project `cuda-handlers.ts:123-123`
- **projectKey** — Identifier for the project or index `faiss-handlers.ts:368-368`
- **projectKey** — Represents the unique identifier for a project in the Faiss index management `faiss-handlers.ts:464-464`
- **projectKey** — Specifies the project key for the Faiss operation `faiss-handlers.ts:574-574`
- **projectKey** — Represents the key for the project in the request object `faiss-handlers.ts:661-661`
- **projectKey** — Parses the project key from the request object `faiss-handlers.ts:712-712`
- **projectKey** — Extracts the project key from the request object `faiss-handlers.ts:776-776`
- **projectKey** — Represents the key for the FAISS index `faiss-handlers.ts:251-251`, `faiss-handlers.ts:851-851`
- **projectKey** — Represents a project key `gpu-worker.ts:410-410`
- **projectKey** — Identifies the project key for the Faiss request `types.ts:47-47`
- **projectKey** — Identifies the project key for the request `types.ts:54-54`
- **projectKey** — Identifies the project key for Faiss operations `types.ts:61-61`
- **projectKey** — Identifies the project key for the Faiss index `types.ts:69-69`
- **projectKey** — Represents a string key for a project `types.ts:77-77`
- **projectKey** — Holds the project key as a string `types.ts:83-83`
- **projectKey** — Represents the key of the project `types.ts:89-89`
- **projectKey** — Represents the project key `types.ts:95-95`
- **projectKey** — Stores the project key as a string `types.ts:102-102`
- **projectKey** — Represents the unique identifier for a project `types.ts:455-455`
- **projectKey** — Represents the project key as a string `types.ts:515-515`
- **query** — Query vector for GPU FAISS operations `cuda-handlers.ts:185-185`
- **query** — Represents the query vector for cosine similarity computation `types.ts:121-121`
- **queryCount** — Counts the number of queries `gpu-worker.ts:473-473`
- **reason** — Reason for using a particular strategy `adaptive-thresholds.ts:227-227`
- **rebuildThreshold** — Use Faiss for index rebuild if current count exceeds this `adaptive-thresholds.ts:41-41`
- **reject** — Rejects a promise with a reason `gpu-client.ts:154-154`
- **reject** — Rejects a pending request for the named pipe client `named-pipe-transport.ts:266-266`
- **removedCount** — Stores the number of vectors removed `types.ts:267-267`
- **removedCount** — Stores the count of removed embeddings `types.ts:377-377`
- **requestId** — Unique identifier for a request `gpu-client.ts:162-162`
- **requestId** — Identifies the request in the response `types.ts:222-222`
- **requestId** — Optional string or undefined `types.ts:228-228`
- **resolve** — Resolves a promise with a value `gpu-client.ts:153-153`
- **resolve** — Resolves a pending request for the named pipe client `named-pipe-transport.ts:265-265`
- **responseBuffer** — Buffer for storing responses from the GPU client `gpu-client.ts:166-166`
- **responseBuffer** — Stores the response buffer for the named pipe client `named-pipe-transport.ts:268-268`
- **restartCount** — Count of restarts attempted by the GPU client `gpu-client.ts:163-163`
- **results** — Contains the search results `types.ts:255-255`
- **results** — Array of FaissSearchResult `types.ts:261-261`
- **results** — Contains an array of EmbeddingsSearchResultItem objects `types.ts:354-354`
- **reverseIdMap** — Maps vectors to IDs in the Faiss index `types.ts:539-539`
- **saveContentCache** — Saves the content cache to disk `embeddings-handlers.ts:42-42`
- **saveContentCache** — Saves the content cache `faiss-handlers.ts:48-48`
- **score** — Score associated with an embedding `embeddings-handlers.ts:200-200`
- **score** — Score metric used for searching `faiss-handlers.ts:543-543`
- **score** — Stores the score of a query vector relative to a stored vector `faiss-handlers.ts:627-627`
- **score** — Stores the score of a query vector relative to a stored vector in the query results `faiss-handlers.ts:630-630`
- **score** — The score of the search result `types.ts:236-236`
- **score** — Represents the similarity score `types.ts:340-340`
- **searchStrategy** — Strategy for search operations `adaptive-thresholds.ts:225-225`
- **searchTimeMs** — Stores the time taken for the search operation in milliseconds `types.ts:256-256`
- **searchTimeMs** — Stores the time in milliseconds for the search operation `types.ts:262-262`
- **searchTimeMs** — Represents the time taken for a search operation in milliseconds `types.ts:355-355`
- **sendError** — Sends an error response to the client `cuda-handlers.ts:139-139`
- **sendError** — Sends an error message to the GPU worker `embeddings-handlers.ts:41-41`, `faiss-handlers.ts:45-45`
- **sendResponse** — Sends a response to the client `cuda-handlers.ts:138-138`
- **sendResponse** — Sends a response to the GPU worker `embeddings-handlers.ts:40-40`, `faiss-handlers.ts:44-44`
- **server** — Represents the server instance for named pipe communication `named-pipe-transport.ts:139-139`
- **setContentCachePath** — Sets the path for content cache `faiss-handlers.ts:46-46`
- **similarities** — Returns a promise containing a Float32Array of similarities and a boolean indicating if CUDA was used `gpu-client.ts:107-107`, `gpu-client.ts:828-828`
- **similarities** — Stores an array of similarity scores `types.ts:320-320`
- **similarity** — Stores the similarity score `types.ts:314-314`
- **sizeBytes** — Stores the size of the saved index in bytes `types.ts:274-274`
- **socket** — Represents the socket for the named pipe client `named-pipe-transport.ts:260-260`
- **sqBits** — Sets the number of bits per subspace for the IVFSQ index `types.ts:25-25`
- **startPromise** — Promise for starting the GPU client `gpu-client.ts:175-175`
- **startTime** — Stores the start time of the process `types.ts:573-573`
- **state** — Represents the state of the GPU worker `cuda-handlers.ts:137-137`
- **state** — Current state of the GPU worker, including Faiss initialization and active project key `embeddings-handlers.ts:36-36`
- **state** — Stores the state of the GPU worker `faiss-handlers.ts:41-41`
- **stats** — Contains statistics about the embeddings index `types.ts:291-301`
- **stats** — Stores statistics related to the Faiss index `types.ts:366-372`
- **stderr** — NonNullable<ChildProcess["stderr"]> — stderr for the Bun subprocess `gpu-client.ts:60-60`
- **stdin** — NonNullable<ChildProcess["stdin"]> — stdin for the Bun subprocess `gpu-client.ts:58-58`
- **stdout** — NonNullable<ChildProcess["stdout"]> — stdout for the Bun subprocess `gpu-client.ts:59-59`
- **success** — Indicates the success status of GPU FAISS operations `cuda-handlers.ts:62-62`
- **success** — Indicates the success status of a CUDA operation `cuda-handlers.ts:74-74`
- **success** — Represents a boolean indicating success `cuda-handlers.ts:83-83`
- **success** — Returns a boolean indicating success `cuda-handlers.ts:108-108`, `cuda-handlers.ts:121-121`, `types.ts:513-513`
- **success** — Returns a boolean indicating success. `cuda `cuda-handlers.ts:113-113`
- **success** — Returns a boolean indicating the success of the operation `cuda-handlers.ts:120-120`
- **success** — Indicates success in the response `types.ts:221-221`
- **success** — Indicates whether an operation was successful `types.ts:226-226`
- **success** — Indicates the success status of an operation `types.ts:454-454`
- **success** — Indicates whether the operation was successful `types.ts:466-466`, `types.ts:475-475`, `types.ts:500-500`, `types.ts:505-505`
- **success** — Returns a boolean indicating the success of the Faiss index removal operation `types.ts:512-512`
- **timeMs** — Stores the time in milliseconds `types.ts:315-315`
- **timeMs** — Represents the time in milliseconds `types.ts:321-321`, `types.ts:327-327`, `types.ts:333-333`
- **timeout** — Timeout duration for GPU client operations `gpu-client.ts:130-130`
- **timeout** — Request timeout in ms `named-pipe-transport.ts:44-44`
- **totalMemoryMB** — Returns the total memory in MB of the CUDA device `cuda-handlers.ts:36-36`
- **totalMemoryMB** — Indicates the total memory in megabytes of a CUDA device `types.ts:37-37`
- **totalVectors** — Stores the total number of vectors in a GPU index `cuda-handlers.ts:85-85`
- **totalVectors** — The total number of vectors in the Faiss index `types.ts:249-249`
- **totalVectors** — Stores the total number of vectors in the index `types.ts:268-268`
- **totalVectors** — Stores the total number of vectors `types.ts:294-294`, `types.ts:540-540`
- **totalVectors** — Indicates the total number of vectors in the Faiss index `types.ts:348-348`
- **totalVectors** — Stores the total number of vectors in the Faiss index `types.ts:367-367`
- **totalVectors** — Represents the total number of vectors in the index `types.ts:378-378`
- **totalVectors** — Represents the total number of vectors `types.ts:389-389`, `types.ts:477-477`
- **totalWithContent** — Represents the total number of vectors with content `types.ts:368-368`
- **trainedOn** — Stores the number of vectors trained on the native FAISS index `cuda-handlers.ts:75-75`
- **trainedOn** — Stores the data used to train the index `types.ts:285-285`
- **trainedOn** — Stores the data on which the Faiss index was trained `types.ts:467-467`
- **trainingBuffer** — Holds the buffer for training the index `types.ts:548-548`
- **trainTimeMs** — Stores the time taken for the training operation in milliseconds `types.ts:286-286`
- **type** — Represents a type definition for GPU operations `gpu-worker.ts:458-458`
- **type** — Specifies the type of request, such as "faiss.init" `types.ts:46-46`
- **type** — Specifies the type of request `types.ts:53-53`
- **type** — Specifies the type of operation as "cuda.normalize" `types.ts:60-60`
- **type** — Specifies the type of operation as "embeddings.addBatch" `types.ts:68-68`
- **type** — Represents the type of embeddings operation `types.ts:76-76`
- **type** — Represents the type of GPU worker request `types.ts:82-82`
- **type** — Indicates the type of Faiss operation `types.ts:88-88`
- **type** — Represents the type of the Faiss index `types.ts:94-94`
- **type** — Specifies the type of operation or entity `types.ts:101-101`
- **type** — Represents the type of Faiss index `types.ts:110-110`
- **type** — Specifies the type as "cuda.cosine" `types.ts:114-114`
- **type** — Specifies the type as "cuda.batchCosine" `types.ts:120-120`
- **type** — Specifies the type as "cuda.euclidean" `types.ts:126-126`
- **type** — Specifies the type as "cuda.normalize" `types.ts:132-132`
- **type** — Specifies the type as "embeddings.addBatch" `types.ts:149-149`
- **type** — Specifies the type as "embeddings.search" `types.ts:154-154`
- **type** — Indicates the type as "embeddings.flush" `types.ts:161-161`
- **type** — Indicates the type as "embeddings.stats" `types.ts:165-165`
- **type** — Indicates the type as "embeddings.remove" `types.ts:169-169`
- **type** — Indicates the type as "stats" `types.ts:178-178`
- **type** — Indicates the type as "shutdown" `types.ts:182-182`
- **type** — Indicates the type as "faiss.init" `types.ts:240-240`
- **type** — Indicates the type as "faiss.add" `types.ts:247-247`
- **type** — Indicates the type as "faiss.search" `types.ts:254-254`
- **type** — Indicates the type as "faiss.batchSearch" `types.ts:260-260`
- **type** — Indicates the type of operation as "embeddings.addBatch" `types.ts:266-266`
- **type** — Indicates the type of operation as "embeddings.search" `types.ts:272-272`
- **type** — Indicates the type of operation as "embeddings.flush" `types.ts:278-278`, `types.ts:359-359`
- **type** — Indicates the type of operation as "embeddings.stats" `types.ts:284-284`, `types.ts:365-365`
- **type** — Indicates the type of operation as "embeddings.remove" `types.ts:290-290`, `types.ts:376-376`
- **type** — Indicates the type of operation as "stats" `types.ts:307-307`, `types.ts:384-384`
- **type** — Specifies the type as "embeddings.search". `types `types.ts:313-313`
- **type** — Specifies the type of operation as "embeddings.flush" `types.ts:319-319`
- **type** — Specifies the type of operation as "embeddings.stats" `types.ts:325-325`
- **type** — Specifies the type of operation as "embeddings.remove" `types.ts:331-331`
- **type** — Specifies the type of operation as "stats" `types.ts:346-346`
- **type** — Specifies the type of operation as "embeddings.search" `types.ts:353-353`
- **uptime** — Represents the time elapsed since the start of the process `types.ts:399-399`
- **useCudaForReranking** — Determines if CUDA should be used for reranking operations `adaptive-thresholds.ts:226-226`
- **usedCuda** — Asynchronously normalizes vectors using CUDA and returns a promise containing a Float32Array of normalized vectors and a boolean indicating if CUDA was used `gpu-client.ts:828-828`
- **usedCuda** — Returns a promise containing a Float32Array of normalized vectors and a boolean indicating if CUDA was used `gpu-client.ts:108-108`, `gpu-client.ts:853-853`
- **usedCuda** — Returns a promise containing a Float32Array of similarities and a boolean indicating if CUDA was used `gpu-client.ts:107-107`
- **useNamedPipe** — Boolean indicating whether to use a named pipe for communication `gpu-client.ts:172-172`
- **vector** — Single vector to be searched in the Faiss index `faiss-handlers.ts:464-464`
- **vector** — Represents a vector in the context of GPU operations `gpu-worker.ts:522-522`
- **vector** — Parses the request to include a vector property `gpu-worker.ts:632-632`
- **vector** — Array of numerical vector to be searched `types.ts:62-62`
- **vector** — Stores a Float32Array or a number array `types.ts:143-143`
- **vector** — Stores a vector of numbers `types.ts:155-155`
- **vectors** — Vectors for normalization `cuda-handlers.ts:248-248`
- **vectors** — List of vectors to be added to the Faiss index `faiss-handlers.ts:368-368`
- **vectors** — Represents the set of vectors used to train the Faiss index `faiss-handlers.ts:574-574`
- **vectors** — Contains the array of vectors for the request `faiss-handlers.ts:851-851`
- **vectors** — Stores a collection of vectors `gpu-worker.ts:563-563`
- **vectors** — Parses the request to include a vectors property `gpu-worker.ts:632-632`
- **vectors** — Extracts the vectors from a packet `named-pipe-transport.ts:438-438`
- **vectors** — Extracted vectors in Float32Array format, may be undefined for requests without vectors `request-helpers.ts:28-28`
- **vectors** — Array of numerical vectors to be added `types.ts:56-56`
- **vectors** — Contains the vectors for training the Faiss index `types.ts:70-70`
- **vectors** — Stores an array of number arrays `types.ts:96-96`
- **vectors** — Contains an array of vectors `types.ts:133-133`
- **vectors** — Stores the vectors in the Faiss index `types.ts:332-332`
- **vectors** — Stores a flat array of vectors `types.ts:533-533`
- **worker** — Worker process for the GPU client `gpu-client.ts:160-160`
- **workerPath** — Path to the worker script for the GPU client `gpu-client.ts:128-128`

## Data Flow

- **Inputs**: FAISS index configuration, vectors (Float32Array/number[]), query vectors, CUDA operation parameters.
- **Processing**: GpuClient routes requests to direct NAPI calls (Node.js) or subprocess via Named Pipe IPC (Bun); adaptive thresholds select CPU vs GPU execution path.
- **Outputs**: FAISS search results (id, distance, score), CUDA similarity scores, normalized vectors, comprehensive statistics.

## Public API

| Export | Type | Description | Location |
|--------|------|-------------|----------|
| `getGpuClient` | function | Singleton factory for IGpuClient (auto-detects runtime) | [`gpu-client.ts`](./gpu-client.ts) |
| `shutdownGpuClient` | function | Graceful shutdown of GPU worker | [`gpu-client.ts`](./gpu-client.ts) |
| `IGpuClient` | interface | Unified interface for FAISS + CUDA + embeddings operations | [`gpu-client.ts`](./gpu-client.ts) |
| `GpuWorkerRequest` | type | Union of all IPC request types (FAISS, CUDA, embeddings, lifecycle) | [`types.ts:179-213`](./types.ts) |
| `GpuWorkerResponse` | type | Union of all IPC response types | [`types.ts:393-428`](./types.ts) |
| `FaissIndexConfig` | interface | FAISS index configuration (dimensions, type, HNSW/IVF params) | [`types.ts:14-26`](./types.ts) |
| `FaissSearchResult` | interface | Search result with id, distance, and normalized score | [`types.ts:223-227`](./types.ts) |
| `CudaDeviceInfo` | interface | CUDA device information (name, compute capability, memory) | [`types.ts:32-38`](./types.ts) |
| `GpuStatsResponse` | interface | Combined FAISS + CUDA statistics | [`types.ts:373-387`](./types.ts) |
| `GpuWorkerState` | interface | Complete worker state including FAISS, CUDA, and content cache | [`types.ts:430-447`](./types.ts) |

## Dependencies

### Internal Modules

| Module | Purpose |
|--------|---------|
| `logging` | Structured logging |
| `shared/storage-paths` | Data directory resolution |
| `utils/simd-vector-ops` | CPU fallback for cosine similarity and L2 normalization |
| `utils/runtime` | Runtime detection and sleep utility |

### External Packages

| Package | Purpose |
|---------|---------|
| `ultracode_cuda.node` | Native CUDA addon with optional FAISS CPU (`ENABLE_FAISS_CPU`) and GPU (`ENABLE_FAISS_GPU`) support. Replaces `faiss-napi` in the GPU worker pipeline. |

## Behavioral Properties

| Property | Value |
|----------|-------|
| IPC transport | Named Pipes (Windows) / Unix domain sockets (Linux/macOS) |
| CUDA Blackwell support | Automatically skipped for compute capability >= 12.0 |
| CPU fallback | Automatic when CUDA is unavailable; uses SIMD-optimized operations |

## Error Handling

GPU client gracefully degrades to CPU when CUDA is unavailable or fails to initialize. Named Pipe transport implements reconnection logic for subprocess communication failures. Subprocess crashes are detected and logged. All GPU operations return typed error responses rather than throwing.

## IPC Protocol

### CUDA commands
```typescript
type CudaCommands =
  | { type: "cuda.info" }
  | { type: "cuda.cosine"; a: number[]; b: number[] }
  | { type: "cuda.batchCosine"; query: number[]; database: number[][] }
  | { type: "cuda.euclidean"; a: number[]; b: number[] }
  | { type: "cuda.normalize"; vectors: number[][] };
```

### Faiss commands (via native addon)
```typescript
// All faiss.* IPC messages carry projectKey field
type FaissCommands =
  | { type: "faiss.init"; config: FaissIndexConfig; projectKey: string; loadPath?: string }
  | { type: "faiss.add"; ids: string[]; vectors: number[]; projectKey: string }
  | { type: "faiss.search"; vector: number[]; k: number; projectKey: string }
  | { type: "faiss.batchSearch"; vectors: number[]; nQueries: number; k: number; projectKey: string }
  | { type: "faiss.train"; vectors: number[]; nVectors: number; projectKey: string }
  | { type: "faiss.save"; path: string; projectKey: string }
  | { type: "faiss.load"; path: string; projectKey: string }
  | { type: "faiss.remove"; ids: string[]; projectKey: string }
  | { type: "faiss.stats"; projectKey?: string };
```

## Implementation Notes

### Native FAISS Addon Integration
- `gpu-worker.ts` loads `ultracode_cuda.node` and checks `hasNativeFaiss` flag. If true, the addon is cast to `NativeFaissAddon` (defined in `types.ts`).
- `faiss-handlers.ts` uses `nativeFaiss.faissIndexCreate/Train/Add/Search/Save/Load` instead of `faiss-napi` methods. `IndexEntry` no longer holds a `FaissIndex` object — the C++ addon manages index state internally by `projectKey`.
- `embeddings-handlers.ts` uses `nativeFaiss` + `state.activeProjectKey` for all FAISS operations.
- IVF auto-training: vectors are buffered in TypeScript (`trainingBuffer` in `IndexEntry`) until `nlist * 39` threshold, then `faissIndexTrain()` + `faissIndexAdd()` are called to train and bulk-add.
- LRU eviction: when pool exceeds `MAX_LOADED_INDEXES=10`, oldest index is saved to disk (`faissIndexSave`) and removed from memory (`faissIndexRemove`).

### Addon Loading Path
Worker searches for `ultracode_cuda.node` in order:
1. `external-libs/cuda-{platform}-x64/` (canonical build output)
2. `dist/native/cuda/` (copied during `npm run build` via tsup)
3. `build/Release/` (raw cmake-js output)

### CPU-Only Mode
When `deviceCount === 0` (no NVIDIA GPU) but `hasNativeFaiss === true`, the worker still initializes successfully with CPU-only FAISS. All vector operations fall back to SIMD-accelerated CPU implementations.

## Known Limitations

- Named Pipe IPC adds serialization overhead for large vector batches compared to direct calls.
- Single GPU worker process may become a bottleneck under very high concurrency.
- `faiss-napi` is still used as legacy fallback in `faiss-client.ts` (in-process path). The GPU worker pipeline no longer uses it.

## Files

| File | Description |
|------|-------------|
| `adaptive-thresholds.ts` | Dynamic CPU vs GPU threshold selection based on vector dimensions and batch size |
| `cuda-handlers.ts` | CUDA operation handlers for cosine, euclidean, normalization, and batch operations. `CUDAAddon` interface extended with optional `NativeFaissAddon` methods. |
| `embeddings-handlers.ts` | Embeddings pipeline handlers for unified vector + content storage. Uses `nativeFaiss` + `activeProjectKey` instead of faiss-napi. |
| `faiss-handlers.ts` | FAISS operation handlers via native addon multi-index pool. Manages `IndexEntry` per projectKey, IVF auto-training buffer, LRU eviction. No faiss-napi dependency. |
| `gpu-client.ts` | Runtime-aware IGpuClient with direct (Node.js) and subprocess (Bun) modes |
| `gpu-worker.ts` | Node.js subprocess entry point. Loads `ultracode_cuda.node`, detects `hasNativeFaiss`, casts to `NativeFaissAddon`. Falls back to CPU-only FAISS when no GPU. |
| `index.ts` | Re-exports gpu-client and types |
| `named-pipe-transport.ts` | Named Pipe / Unix socket IPC transport with packet framing |
| `request-helpers.ts` | Request serialization helpers for Float32Array and batch vectors |
| `type-guards.ts` | Type guard utilities for GPU response types |
| `types.ts` | Complete IPC protocol types for FAISS, CUDA, embeddings, and lifecycle operations. Defines `NativeFaissAddon` interface and `IndexEntry` (no `index` field — C++ manages indexes internally). |
