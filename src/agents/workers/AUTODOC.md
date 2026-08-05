# Workers

## 🤖 Overview

The `src/agents/workers` module provides a set of worker processes for language analysis and processing. It includes language-specific analyzers, embedding processors, and language detection tools. Developers and system administrators use this module to manage and execute tasks related to code analysis, embedding, and language detection.

## 🤖 Architecture

```
  +---------------------+
  | analyzer-loader.ts  |
  | (language analyzers)|
  +---------------------+
           |
           v
  +---------------------+
  | language-detection.ts |
  | (language detection) |
  +---------------------+
           |
           v
  +---------------------+
  | generic-language-worker.ts |
  | (language processing) |
  +---------------------+
           |
           v
  +---------------------+
  | embedding-processor.ts |
  | (embedding processing) |
  +---------------------+
           |
           v
  +---------------------+
  | worker-logging.ts |
  | (logging) |
  +---------------------+
```

## 🤖 Flow

```
  +---------------------+
  | language-detection.ts |
  | (determine language) |
  +---------------------+
           |
           v
  +---------------------+
  | analyzer-loader.ts |
  | (load analyzer) |
  +---------------------+
           |
           v
  +---------------------+
  | generic-language-worker.ts |
  | (process code) |
  +---------------------+
           |
           v
  +----------------
  | embedding-processor.ts |
  | (embed code) |
  +----------------
           |
           v
  +---------------------+
  | worker-logging.ts |
  | (log results) |
  +---------------------+
```

## 🤖 Entity Listing

### Function
- **addLangRecursive** — Adds language recursively `generic-language-worker.ts:593-602`
- **body** — Represents the main body of the WorkerEmbeddingClient class `worker-embedding-client.ts:313-313`
- **buildEmbeddingText** — Builds embedding text for entities `embedding-processor.ts:313-363`
- **checkShutdownTimeout** — Checks if the shutdown timeout has expired `language-worker-pool.ts:691-703`
- **checkTaskTimeout** — Checks if a task has exceeded its timeout `language-worker-pool.ts:433-441`
- **checkTimeout** — Checks if a task has exceeded its timeout `language-worker-pool.ts:322-336`
- **chunkPromises** — Manages promises for chunked tasks `language-worker-pool.ts:404-404`
- **chunks** — Splits files into chunks for parallel processing `parsing-subprocess-pool.ts:875-875`
- **clearAnalyzerCache** — Not directly described in the provided code `analyzer-loader.ts:300-303`
- **clearDeduplicationForFiles** — Method to clear deduplication for files `embedding-processor.ts:202-231`
- **clearEmbeddingClient** — Initializes a lightweight HTTP embedding client `embedding-processor.ts:301-303`
- **collectTextsForCentralizedEmbedding** — Collects texts for centralized embedding `embedding-processor.ts:627-697`
- **contentHash** — Generates a hash for the content of a file `python-worker.ts:130-130`
- **context** — Represents the context for a worker process `parsing-subprocess-pool.ts:242-242`, `parsing-subprocess-pool.ts:243-243`, `parsing-subprocess-pool.ts:244-244`
- **createAnalyzer** — Create analyzer for specific language (internal) `analyzer-loader.ts:59-295`
- **delayedTerminate** — Delays the termination of the worker pool `language-worker-pool.ts:711-718`
- **detectLanguage** — Detects the programming language from a file extension using a predefined mapping `language-detection.ts:103-106`
- **filteredEntities** — Filters entities for embedding generation `embedding-processor.ts:421-421`, `embedding-processor.ts:633-633`
- **findMinWorker** — Finds the worker with the minimum load `parsing-subprocess-pool.ts:883-907`
- **flattenEntities** — Flattens entities into a single array `generic-language-worker.ts:274-289`
- **GENERATED_FILENAME_MARKERS** — Placeholder for generated filename markers `generic-language-worker.ts:264-264`
- **GENERATED_FILENAME_MARKERS** — Represents markers for generated filenames `generic-language-worker.ts:267-267`, `generic-language-worker.ts:268-268`
- **GENERATED_HEADER_MARKERS** — Placeholder for generated header markers `generic-language-worker.ts:238-238`, `generic-language-worker.ts:242-242`, `generic-language-worker.ts:244-244`, `generic-language-worker.ts:246-246`, `generic-language-worker.ts:248-248`, `generic-language-worker.ts:251-251`, `generic-language-worker.ts:255-255`, `generic-language-worker.ts:257-257`, `generic-language-worker.ts:259-259`
- **generateEmbeddingsForEntities** — Generates embeddings in batches with concurrency `embedding-processor.ts:375-576`
- **getAnalyzer** — Get or create analyzer for specific language using promise caching `analyzer-loader.ts:23-54`
- **getEmbeddingClient** — Method to get the embedding client `embedding-processor.ts:236-238`
- **getEmbeddingConfig** — Method to get the embedding configuration `embedding-processor.ts:186-188`
- **getLocalDateForLog** — Returns the current local date in the format YYYY-MM-DD `worker-logging.ts:24-28`
- **getPythonAnalyzerWithBatch** — Not directly described in the provided code `analyzer-loader.ts:419-431`
- **getVendoredSkipCount** — Method to get the skip count for vendored files `embedding-processor.ts:156-158`
- **getWorkerGlobalCache** — Returns a single instance of WorkerGlobalCache `worker-global-cache.ts:90-93`
- **getWorkerId** — Method to get the worker ID `generic-language-worker.ts:190-198`
- **handleMessage** — Processes incoming messages and routes them to appropriate handlers based on message type `generic-language-worker.ts:716-816`
- **initEmbeddingClient** — Method to initialize the embedding client `embedding-processor.ts:244-296`
- **initializeParser** — Initializes the parser with a 100MB cache and sends an initialization message to the parent port if available `parser-worker.ts:42-66`
- **initializePythonParser** — Initializes the Python parser `python-worker.ts:62-90`
- **initPromise** — Promise for initializing the worker `generic-language-worker.ts:152-162`
- **isEmbeddingsReadyResponse** — Embeddings ready response (binary embeddings from worker) `parsing-subprocess-pool.ts:104-106`
- **isEmbeddingTextsResponse** — Checks if a response is an EmbeddingTextsResponse `parsing-subprocess-pool.ts:111-113`
- **isGeneratedCode** — Determines if the code is generated `generic-language-worker.ts:294-313`
- **isInitializedResponse** — Worker initialized response (with embeddings configured) `parsing-subprocess-pool.ts:97-99`
- **isVendoredFile** — Method to check if a file is vendored `embedding-processor.ts:122-153`
- **maxDeviation** — Determines the maximum deviation allowed in parsing `parsing-subprocess-pool.ts:947-947`
- **nonEmptyChunks** — Represents non-empty chunks of data `parsing-subprocess-pool.ts:944-944`
- **postWorkerMessage** — Method to post a message to the worker `generic-language-worker.ts:166-187`
- **processBatch** — Processes a batch of entities for embedding `embedding-processor.ts:475-547`
- **processTask** — Processes a task `generic-language-worker.ts:375-710`
- **processTask** — Processes a task by parsing files using the initialized parser, collects results and errors, and returns a structured result object `parser-worker.ts:72-106`
- **processTask** — Processes a task by parsing Python files and logging slow files `python-worker.ts:96-180`
- **promises** — Manages promises for asynchronous operations `parsing-subprocess-pool.ts:1044-1051`, `parsing-subprocess-pool.ts:1047-1050`
- **pythonFiles** — Manages Python-specific files and their parsing `python-worker-pool.ts:224-224`
- **readyHandler** — Handles the "ready" event from worker threads `language-worker-pool.ts:341-351`, `language-worker-pool.ts:355-362`
- **readyHandler** — Handles the message when a worker becomes ready `python-worker-pool.ts:194-201`
- **readyHandler** — Handles the "ready" message from a worker thread `worker-pool-manager.ts:146-153`
- **readyWorkers** — Returns a list of ready worker processes `parsing-subprocess-pool.ts:707-707`
- **resetVendoredSkipCount** — Method to reset the skip count for vendored files `embedding-processor.ts:161-163`
- **sendCollectedEmbeddings** — Sends collected embeddings via binary IPC transfer to main process `embedding-processor.ts:585-616`
- **sendCollectedTexts** — Sends collected texts to the main process if there are any texts to send `embedding-processor.ts:703-719`
- **setEmbeddingConfig** — Method to set the embedding configuration `embedding-processor.ts:193-195`
- **setupEventHandlers** — Sets up event handlers for worker threads `language-worker-pool.ts:284-312`
- **setWorkerIdGetter** — Sets a custom function to retrieve the worker ID `worker-logging.ts:46-48`
- **sorted** — Not present in the provided code snippet `worker-embedding-client.ts:322-322`
- **sortedChunkTimings** — Sorts chunk timings for analysis `parsing-subprocess-pool.ts:1059-1059`
- **supportsBatchParsing** — Not directly described in the provided code `analyzer-loader.ts:404-406`
- **timeout** — Sets a timeout for a task `parsing-subprocess-pool.ts:1315-1318`
- **totalEntities** — Total number of entities `generic-language-worker.ts:685-685`
- **totalWeight** — Calculates the total weight of parsed data `parsing-subprocess-pool.ts:945-945`
- **transferList** — List of ArrayBuffer for binary transfer `embedding-processor.ts:590-590`
- **walk** — Traverses through entities `generic-language-worker.ts:276-286`
- **warmupAnalyzer** — Not directly described in the provided code `analyzer-loader.ts:339-371`
- **weightedBatch** — Creates a weighted batch of files for parallel processing `parsing-subprocess-pool.ts:917-926`
- **workerIdGetter** — Provides the current worker ID `worker-logging.ts:41-41`
- **workerIds** — Stores the IDs of worker processes `parsing-subprocess-pool.ts:733-733`
- **workerLog** — Logs a message to the worker log file with timestamp, level, and optional data `worker-logging.ts:53-74`
- **workerStates** — Tracks the state of each worker process `parsing-subprocess-pool.ts:1110-1110`

### Method
- **advance** — Advances to the next file `generic-language-worker.ts:362-365`
- **assignTask** — Assigns a task to a worker process `parsing-subprocess-pool.ts:1153-1194`
- **assignTaskToWorker** — Assigns a task to a worker `language-worker-pool.ts:478-509`
- **assignTaskToWorker** — Assigns a task to a worker if available `python-worker-pool.ts:293-311`
- **assignTaskToWorker** — Assigns a task to a specific worker `worker-pool-manager.ts:223-238`
- **clear** — Clears the cache `generic-language-worker.ts:370-372`
- **configureEmbeddings** — Configures embeddings for the parsing subprocess pool `parsing-subprocess-pool.ts:1491-1528`
- **constructor** — Initializes the worker `generic-language-worker.ts:323-325`
- **constructor** — Initializes a new LanguageWorkerPool instance `language-worker-pool.ts:167-219`
- **constructor** — Initializes the parsing subprocess pool `parsing-subprocess-pool.ts:164-195`
- **constructor** — Initializes the PythonWorkerPool with specified parameters `python-worker-pool.ts:118-131`
- **constructor** — WorkerEmbeddingClient `worker-embedding-client.ts:71-93`
- **constructor** — Initializes the WorkerPoolManager with options `worker-pool-manager.ts:75-89`
- **createWorker** — Creates a new worker thread for the specified language `language-worker-pool.ts:244-366`
- **createWorker** — Creates a new worker thread for the pool `python-worker-pool.ts:150-217`, `worker-pool-manager.ts:108-169`
- **distributeFilesBySizeAsync** — Distributes files by size for parallel processing `parsing-subprocess-pool.ts:868-964`
- **ensureKeepaliveWorker** — Ensures a keepalive worker is running in the parsing subprocess pool `parsing-subprocess-pool.ts:1408-1456`
- **ensureWorkers** — Ensures that the required number of worker processes are running `parsing-subprocess-pool.ts:681-713`
- **estimateComplexity** — Estimates the complexity of parsing tasks `parsing-subprocess-pool.ts:797-848`
- **generateBatch** — WorkerEmbeddingClient `worker-embedding-client.ts:113-130`
- **generateLlamaCpp** — WorkerEmbeddingClient `worker-embedding-client.ts:298-324`
- **generateOllama** — Worker—or—WorkerEmbeddingClient `worker-embedding-client.ts:227-254`
- **generateOpenAI** — WorkerEmbeddingClient `worker-embedding-client.ts:259-293`
- **generateOVMS** — WorkerEmbeddingClient `worker-embedding-client.ts:162-222`
- **generateTEI** — WorkerEmbeddingClient `worker-embedding-client.ts:135-152`
- **get** — Retrieves a pre-built embedding for a given text `worker-global-cache.ts:76-84`
- **getActiveWorkerCount** — Returns the number of active workers in the parsing subprocess pool `parsing-subprocess-pool.ts:1393-1401`
- **getContent** — Retrieves content of a file `generic-language-worker.ts:348-357`
- **getEmbeddingStats** — Retrieves embedding statistics for the subprocess pool `parsing-subprocess-pool.ts:1236-1254`
- **getLanguage** — Retrieves the language for the worker pool `language-worker-pool.ts:674-676`
- **getLanguage** — Retrieves the language used by the subprocess pool `parsing-subprocess-pool.ts:1299-1301`
- **getOptimalWorkerCount** — Determines the optimal number of worker processes `parsing-subprocess-pool.ts:661-675`
- **getStats** — Retrieves statistics for the worker pool `language-worker-pool.ts:653-669`
- **getStats** — Retrieves statistics for the subprocess pool `parsing-subprocess-pool.ts:1214-1230`
- **getStats** — Retrieves statistics about the worker pool and tasks `python-worker-pool.ts:427-460`
- **getStats** — Retrieves statistics about the worker pool `worker-pool-manager.ts:349-370`
- **getTotalMemoryMB** — Returns the total memory used by the parsing subprocess pool `parsing-subprocess-pool.ts:1354-1360`
- **handleEmbeddingsReady** — Handles embeddings ready messages from a worker `language-worker-pool.ts:537-549`
- **handleResponse** — Handles the response from a worker process `parsing-subprocess-pool.ts:276-550`
- **handleTaskComplete** — Handles task complete messages from a worker `language-worker-pool.ts:554-581`
- **handleTaskComplete** — Handles the completion of a task `python-worker-pool.ts:333-371`
- **handleTaskError** — Handles task error messages from a worker `language-worker-pool.ts:586-596`
- **handleTaskError** — Handles errors during task execution `python-worker-pool.ts:376-387`
- **handleTaskTimeout** — Handles task timeout messages `language-worker-pool.ts:626-636`
- **handleTaskTimeout** — Handles tasks that exceed the expected processing time `python-worker-pool.ts:408-410`
- **handleTaskTimeout** — Handles tasks that have timed out `worker-pool-manager.ts:337-344`
- **handleWorkerError** — Handles worker error messages `language-worker-pool.ts:601-621`
- **handleWorkerError** — Handles errors from workers `python-worker-pool.ts:392-403`
- **handleWorkerError** — Handles errors from worker threads `worker-pool-manager.ts:324-332`
- **handleWorkerExit** — Handles the exit event of a worker process `parsing-subprocess-pool.ts:613-654`
- **handleWorkerMessage** — Handles messages from a worker `language-worker-pool.ts:514-531`
- **handleWorkerMessage** — Handles messages from workers, including results and errors `python-worker-pool.ts:316-328`
- **handleWorkerMessage** — Handles messages from worker threads `worker-pool-manager.ts:243-319`
- **hasEmbeddingConfig** — Checks if the parsing subprocess pool has an embedding configuration `parsing-subprocess-pool.ts:1533-1535`
- **initialize** — Sets up the worker pool and initializes necessary components `language-worker-pool.ts:224-237`
- **initialize** — Initializes the subprocess pool with necessary configurations `parsing-subprocess-pool.ts:200-214`
- **initialize** — Initializes the worker pool and starts the workers `python-worker-pool.ts:136-145`
- **initialize** — WorkerEmbeddingClient `worker-embedding-client.ts:95-108`
- **initialize** — Initializes the worker pool manager with specified options `worker-pool-manager.ts:94-103`
- **isKeepaliveMode** — Checks if the parsing subprocess pool is in keepalive mode `parsing-subprocess-pool.ts:1386-1388`
- **isReady** — Checks if the worker pool is ready `language-worker-pool.ts:740-742`
- **isReady** — Checks if the subprocess pool is ready for tasks `parsing-subprocess-pool.ts:1295-1297`
- **isReady** — Checks if a worker is ready to accept tasks `python-worker-pool.ts:499-501`
- **killAllIdleWorkers** — Kills all idle worker processes `parsing-subprocess-pool.ts:763-783`
- **killAndRespawn** — Kills and restarts a worker process `parsing-subprocess-pool.ts:589-608`
- **killIfMemoryHigh** — Kills a worker if memory usage exceeds a certain threshold `parsing-subprocess-pool.ts:1466-1484`
- **killWorkerOnly** — Kills a worker process without restarting it `parsing-subprocess-pool.ts:555-584`
- **load** — Loads pre-built files for a given model and dimension `worker-global-cache.ts:28-65`
- **pingWorkerMemory** — Pings the memory usage of a worker process `parsing-subprocess-pool.ts:1307-1335`
- **prefetchAhead** — Prefetches files ahead `generic-language-worker.ts:330-343`
- **processNextTask** — Processes the next task in the pool `language-worker-pool.ts:641-648`
- **processNextTask** — Processes the next task in the queue `parsing-subprocess-pool.ts:1199-1209`
- **processNextTask** — Processes the next available task in the queue `python-worker-pool.ts:415-422`
- **refreshAllWorkersMemory** — Refreshes the memory usage of all worker processes `parsing-subprocess-pool.ts:1341-1348`
- **resetEmbeddingStats** — Resets embedding statistics for the subprocess pool `parsing-subprocess-pool.ts:1260-1276`
- **scaleDownWorkers** — Scales down the number of worker processes `parsing-subprocess-pool.ts:719-756`
- **setKeepaliveMode** — Sets the keepalive mode for the parsing subprocess pool `parsing-subprocess-pool.ts:1367-1381`
- **shutdown** — Shuts down the worker pool `language-worker-pool.ts:681-735`
- **shutdown** — Shuts down the subprocess pool `parsing-subprocess-pool.ts:1281-1290`
- **shutdown** — Shuts down the worker pool and releases resources `python-worker-pool.ts:465-494`
- **shutdown** — Shuts down the worker pool manager `worker-pool-manager.ts:375-404`
- **size** — Returns the number of pre-built embeddings `worker-global-cache.ts:67-69`
- **spawnWorker** — Spawns a new worker process for parsing `parsing-subprocess-pool.ts:219-258`
- **submitSingleTask** — Submits a single task to the worker pool `language-worker-pool.ts:416-450`
- **submitSingleTask** — Submits a single task to the subprocess pool `parsing-subprocess-pool.ts:1103-1148`
- **submitTask** — Submits a task to the worker pool `language-worker-pool.ts:374-411`
- **submitTask** — Submits a task to the subprocess pool `parsing-subprocess-pool.ts:969-1098`
- **submitTask** — Submits a task to the worker pool for processing `python-worker-pool.ts:222-265`, `worker-pool-manager.ts:174-205`
- **tryAssignTask** — Tries to assign a task to a worker `language-worker-pool.ts:455-473`
- **tryAssignTask** — Attempts to assign a task to a worker `python-worker-pool.ts:270-288`
- **tryAssignTask** — Tries to assign a task to an available worker `worker-pool-manager.ts:210-218`
- **waitForReady** — Waits for a worker process to become ready `parsing-subprocess-pool.ts:263-271`

### Class
- **LanguageWorkerPool** — Manager for language-specific worker threads `language-worker-pool.ts:148-743`
- **ParsingSubprocessPool** — Subprocess-based parser pool for memory isolation `parsing-subprocess-pool.ts:119-1536`
- **PrefetchManager** — Manages prefetching of files `generic-language-worker.ts:318-373`
- **PythonWorkerPool** — Manages a pool of Python workers for efficient task processing `python-worker-pool.ts:106-502`
- **WorkerEmbeddingClient** — Lightweight Embedding Client for Workers `worker-embedding-client.ts:60-325`
- **WorkerGlobalCache** — Lightweight in-memory cache for pre-built global embeddings `worker-global-cache.ts:17-85`
- **WorkerPoolManager** — A class to manage a pool of worker threads `worker-pool-manager.ts:63-405`

### Interface
- **Analyzer** — Analyzer used for parsing files `generic-language-worker.ts:88-90`
- **AnalyzerWithBatch** — Not directly described in the provided code `analyzer-loader.ts:415-417`
- **BinaryEmbedding** — Binary embedding data `language-worker-pool.ts:124-129`
- **BunWorker** — Bun Worker extends the standard Worker with these methods `language-worker-pool.ts:24-29`
- **BunWorkerOptions** — Options for creating a Bun worker `language-worker-pool.ts:250-252`
- **CollectedEmbedding** — Collected embeddings for batch transfer to main process `embedding-processor.ts:36-41`
- **CollectedTextItem** — Represents a collected text item with its ID, text, and metadata `embedding-processor.ts:172-176`
- **ConfigureEmbeddingsMessage** — Interface for configuring embeddings messages extending WorkerMessageBase `generic-language-worker.ts:52-55`
- **EmbeddingApiResponse** — OVMS/OpenAI API embedding response `worker-embedding-client.ts:34-36`
- **EmbeddingProcessorContext** — Context for embedding processing, including a method to post worker messages `embedding-processor.ts:79-82`
- **EmbeddingResponseItem** — OVMS/OpenAI API embedding response item `worker-embedding-client.ts:26-29`
- **EmbeddingsReadyMessage** — Worker message for embeddings ready `embedding-processor.ts:46-59`
- **EmbeddingsReadyResponse** — Embeddings ready response (binary embeddings from worker) `parsing-subprocess-pool.ts:68-78`
- **EmbeddingsTextsMessage** — Represents a worker message for collected texts in centralized mode `embedding-processor.ts:64-72`
- **EmbeddingTextsResponse** — Embedding texts response (texts from worker) `parsing-subprocess-pool.ts:83-87`
- **InitializedResponse** — Worker initialized response (with embeddings configured) `parsing-subprocess-pool.ts:60-63`
- **InitMessage** — Interface for initialization messages extending WorkerMessageBase `generic-language-worker.ts:47-50`
- **LanguagePoolOptions** — Options for creating a language worker pool `language-worker-pool.ts:137-142`
- **LanguagePoolStats** — Statistics for a language worker pool `language-worker-pool.ts:109-119`
- **OllamaEmbeddingResponse** — Ollama embedding response `worker-embedding-client.ts:41-43`
- **ParsedEntityExtended** — Extended ParsedEntity with optional documentation field `embedding-processor.ts:24-30`
- **ParseMessage** — Interface for parse messages extending WorkerMessageBase `generic-language-worker.ts:66-73`
- **PendingTask** — Task that is pending processing `language-worker-pool.ts:100-107`
- **PendingTask** — Represents a pending task to be processed by a worker, including its ID, files, options, resolve function, reject function, and optional abort controller `python-worker-pool.ts:38-45`
- **PendingTask** — Represents a task that is pending to be processed, containing task details and callbacks for resolution and rejection `worker-pool-manager.ts:40-47`
- **PingMessage** — Interface for ping messages extending WorkerMessageBase `generic-language-worker.ts:61-64`
- **PoolStats** — An interface for statistics of the worker pool `worker-pool-manager.ts:49-57`
- **PythonParser** — Interface for Python-specific parser `python-worker.ts:50-53`
- **PythonPoolStats** — An interface that holds statistics about the Python worker pool, including total and active workers, task counts, and average processing times `python-worker-pool.ts:88-100`
- **ShutdownMessage** — Interface for shutdown messages extending WorkerMessageBase `generic-language-worker.ts:57-59`
- **TaskMessage** — Message type for task execution `generic-language-worker.ts:75-78`
- **TaskResultPayload** — Contains the results of a task execution `language-worker-pool.ts:76-84`
- **WorkerEmbeddingsReadyMessage** — Worker embeddings ready message `language-worker-pool.ts:67-71`
- **WorkerErrorMessage** — Worker error message `language-worker-pool.ts:57-62`
- **WorkerErrorMessage** — A message indicating an error occurred during task processing `python-worker-pool.ts:76-81`
- **WorkerEventMap** — Map of worker events `generic-language-worker.ts:123-127`
- **WorkerGlobalThis** — Lightweight Embedding Client for Workers `worker-embedding-client.ts:19-21`
- **WorkerMessage** — Represents a message sent between the main thread and worker threads, containing task details and results `worker-pool-manager.ts:20-29`
- **WorkerMessageBase** — Base interface for worker messages containing a type and an optional id `generic-language-worker.ts:42-45`
- **WorkerPromiseRejectionEvent** — Event for promise rejection `generic-language-worker.ts:114-117`
- **WorkerReadyMessage** — Worker ready message `language-worker-pool.ts:40-43`
- **WorkerReadyMessage** — A message indicating that a worker is ready to process tasks `python-worker-pool.ts:50-53`
- **WorkerResult** — Result of the parsing task `generic-language-worker.ts:215-225`
- **WorkerResult** — Contains the results of parsing tasks, including parsed files, errors, and performance statistics `parser-worker.ts:22-31`
- **WorkerResult** — Contains the results of parsing tasks, including task ID, parsed results, errors, and performance statistics `python-worker.ts:26-39`
- **WorkerResultMessage** — Worker result message `language-worker-pool.ts:48-52`
- **WorkerResultMessage** — A message containing the results of a task processed by a worker `python-worker-pool.ts:58-71`
- **WorkerState** — State of a worker thread `language-worker-pool.ts:91-98`
- **WorkerState** — Represents the state of a Python worker, including its ID, worker instance, busy status, tasks processed, total processing time, last task time, and layer timings `python-worker-pool.ts:23-36`
- **WorkerState** — Represents the state of a worker thread, including its ID, worker reference, busy status, and processing statistics `worker-pool-manager.ts:31-38`
- **WorkerTask** — Task object for worker execution `generic-language-worker.ts:207-213`
- **WorkerTask** — Represents a task for parsing multiple files with optional parser options `parser-worker.ts:16-20`
- **WorkerTask** — Represents a task for parsing Python files with an ID, list of files, and optional parser options `python-worker.ts:20-24`

### Type_alias
- **AnyWorker** — Worker type that can be either BunWorker or NodeWorker `language-worker-pool.ts:31-31`
- **BatchParseFunction** — Not directly described in the provided code `analyzer-loader.ts:411-413`
- **BunWorkerConstructor** — Constructor for creating a Bun worker `language-worker-pool.ts:253-253`
- **EmbeddingsCallback** — Callback for embeddings `language-worker-pool.ts:135-135`
- **ExtendedParseResponse** — Represents extended parse response types `parsing-subprocess-pool.ts:92-92`
- **NodeWorker** — Runtime-aware worker type `language-worker-pool.ts:21-21`
- **SupportedLanguage** — Represents a list of all supported programming languages `language-detection.ts:98-98`
- **WorkerIncomingMessage** — Base interface for all incoming messages `generic-language-worker.ts:80-86`
- **WorkerMessage** — Union type for worker messages, including embeddings ready and texts messages `embedding-processor.ts:77-77`
- **WorkerMessage** — Message sent to a worker thread `language-worker-pool.ts:89-89`
- **WorkerMessage** — Represents a message sent between the worker thread and the main thread `parser-worker.ts:33-33`
- **WorkerMessage** — Defines the types of messages that can be sent to workers, including readiness, results, and error messages `python-worker-pool.ts:86-86`
- **WorkerMessage** — Represents a message type for communication between worker threads, including initialization, task, shutdown, and ping messages `python-worker.ts:44-44`

### Import_decl
- **../../logging/index.js** — Imports `../../logging/index.js` from `../../logging/index.js`. `language-worker-pool.ts:15-15`, `parsing-subprocess-pool.ts:22-22`, `python-worker-pool.ts:15-15`, `python-worker.ts:13-13`, `worker-pool-manager.ts:12-12`
- **../../parsers/base-parser.js** — Imports `../../parsers/base-parser.js` from `../../parsers/base-parser.js`. `analyzer-loader.ts:10-10`
- **../../parsers/incremental-parser.js** — Imports `../../parsers/incremental-parser.js` from `../../parsers/incremental-parser.js`. `parser-worker.ts:9-9`
- **../../shared/runtime-detect.js** — Imports `../../shared/runtime-detect.js` from `../../shared/runtime-detect.js`. `language-worker-pool.ts:16-16`
- **../../types/parser.js** — Imports `../../types/parser.js` from `../../types/parser.js`. `embedding-processor.ts:13-13`, `generic-language-worker.ts:18-18`, `language-worker-pool.ts:17-17`, `parser-worker.ts:10-10`, `parsing-subprocess-pool.ts:23-23`, `python-worker-pool.ts:16-16`, `python-worker.ts:14-14`, `worker-pool-manager.ts:13-13`
- **../../types/semantic.js** — Imports `../../types/semantic.js` from `../../types/semantic.js`. `embedding-processor.ts:14-14`, `generic-language-worker.ts:19-19`, `parsing-subprocess-pool.ts:24-24`, `worker-embedding-client.ts:14-14`
- **../../utils/fast-hash.js** — Imports `../../utils/fast-hash.js` from `../../utils/fast-hash.js`. `worker-global-cache.ts:14-14`
- **../../utils/runtime-detection.js** — Imports `../../utils/runtime-detection.js` from `../../utils/runtime-detection.js`. `language-worker-pool.ts:18-18`, `python-worker-pool.ts:17-17`, `worker-pool-manager.ts:14-14`
- **./analyzer-loader.js** — Imports `./analyzer-loader.js` from `./analyzer-loader.js`. `generic-language-worker.ts:21-21`
- **./embedding-processor.js** — Imports `./embedding-processor.js`. `generic-language-worker.ts:22-33`
- **./language-detection.js** — Imports `./language-detection.js` from `./language-detection.js`. `generic-language-worker.ts:35-35`
- **./subprocess-pool/index.js** — Imports `./subprocess-pool/index.js`. `parsing-subprocess-pool.ts:25-40`
- **./worker-logging.js** — Imports `./worker-logging.js` from `./worker-logging.js`. `embedding-processor.ts:15-15`, `generic-language-worker.ts:36-36`, `worker-global-cache.ts:15-15`
- **node:child_process** — Imports `node:child_process` from `node:child_process`. `parsing-subprocess-pool.ts:18-18`
- **node:fs** — Imports `node:fs` from `node:fs`. `python-worker.ts:11-11`, `worker-global-cache.ts:11-11`, `worker-logging.ts:8-8`
- **node:fs/promises** — Imports `node:fs/promises` from `node:fs/promises`. `generic-language-worker.ts:17-17`, `parsing-subprocess-pool.ts:19-19`
- **node:os** — Imports `node:os` from `node:os`. `language-worker-pool.ts:12-12`, `python-worker-pool.ts:11-11`, `worker-logging.ts:9-9`, `worker-pool-manager.ts:8-8`
- **node:path** — Imports `node:path` from `node:path`. `language-detection.ts:7-7`, `language-worker-pool.ts:13-13`, `parsing-subprocess-pool.ts:20-20`, `python-worker-pool.ts:12-12`, `worker-global-cache.ts:12-12`, `worker-logging.ts:10-10`, `worker-pool-manager.ts:9-9`
- **node:url** — Imports `node:url` from `node:url`. `language-worker-pool.ts:14-14`, `parsing-subprocess-pool.ts:21-21`, `python-worker-pool.ts:13-13`, `worker-global-cache.ts:13-13`, `worker-pool-manager.ts:10-10`
- **node:worker_threads** — Imports `node:worker_threads` from `node:worker_threads`. `parser-worker.ts:8-8`, `python-worker-pool.ts:14-14`, `python-worker.ts:12-12`, `worker-pool-manager.ts:11-11`

### Property
- **__workerLog** — Worker global scope with logger `worker-embedding-client.ts:20-20`
- **abortController** — An AbortController instance used to signal cancellation of a task `python-worker-pool.ts:44-44`
- **abortController** — An AbortController instance to abort a task `worker-pool-manager.ts:46-46`
- **activeWorkers** — Number of workers currently active `language-worker-pool.ts:112-112`
- **activeWorkers** — Indicates the number of workers currently active in the pool `python-worker-pool.ts:90-90`
- **activeWorkers** — The number of active workers in the pool `worker-pool-manager.ts:51-51`
- **avgLayer1Time** — Computes the average time spent on layer 1 processing `python-worker-pool.ts:96-96`
- **avgLayer2Time** — Computes the average time spent on layer 2 processing `python-worker-pool.ts:97-97`
- **avgLayer3Time** — Computes the average time spent on layer 3 processing `python-worker-pool.ts:98-98`
- **avgLayer4Time** — Computes the average time spent on layer 4 processing `python-worker-pool.ts:99-99`
- **avgProcessingTime** — Average processing time of tasks `language-worker-pool.ts:117-117`
- **avgProcessingTime** — Calculates the average processing time for tasks `python-worker-pool.ts:95-95`
- **avgProcessingTime** — The average processing time of tasks `worker-pool-manager.ts:56-56`
- **avgTimePerFile** — Average time taken per file `generic-language-worker.ts:222-222`
- **avgTimePerFile** — Average time taken per file in the task `parser-worker.ts:29-29`, `python-worker.ts:33-33`
- **baseUrl** — WorkerEmbeddingConfig `worker-embedding-client.ts:62-62`
- **busy** — Indicates whether a worker is currently busy `language-worker-pool.ts:94-94`
- **busy** — Boolean indicating whether the worker is currently busy `python-worker-pool.ts:26-26`
- **busy** — Boolean indicating whether the worker thread is currently busy `worker-pool-manager.ts:34-34`
- **cache** — Stores cached data `generic-language-worker.ts:319-319`
- **cacheHits** — Counts the number of cache hits during embedding generation `embedding-processor.ts:56-56`
- **cacheHits** — Embeddings ready response (binary embeddings from worker) `parsing-subprocess-pool.ts:76-76`
- **cliScriptAvailable** — Not directly described in the provided code `analyzer-loader.ts:70-70`
- **close** — Method to close the worker `generic-language-worker.ts:135-135`
- **completedTasks** — Number of tasks completed `language-worker-pool.ts:115-115`, `language-worker-pool.ts:153-153`
- **completedTasks** — Counts the number of completed tasks `parsing-subprocess-pool.ts:124-124`
- **completedTasks** — Keeps track of tasks that have been successfully completed `python-worker-pool.ts:93-93`, `python-worker-pool.ts:110-110`
- **completedTasks** — The number of completed tasks `worker-pool-manager.ts:54-54`, `worker-pool-manager.ts:67-67`
- **config** — Property for configuration in configuring embeddings messages `generic-language-worker.ts:54-54`
- **config** — WorkerEmbeddingConfig `worker-embedding-client.ts:61-61`
- **content** — Not directly described in the provided code `analyzer-loader.ts:412-412`
- **content** — Content of the embedding `embedding-processor.ts:39-39`
- **content** — Content of the file `generic-language-worker.ts:437-437`
- **content** — Content of a task or file `language-worker-pool.ts:127-127`
- **contentHash** — Not directly described in the provided code `analyzer-loader.ts:412-412`
- **contentHash** — Hash of the file content `generic-language-worker.ts:437-437`
- **count** — Count of embeddings in the message `embedding-processor.ts:48-48`
- **count** — Indicates the number of items in the message `embedding-processor.ts:66-66`
- **count** — Represents the number of workers in the pool `language-worker-pool.ts:70-70`
- **count** — Embeddings ready response (binary embeddings from worker) `parsing-subprocess-pool.ts:70-70`, `parsing-subprocess-pool.ts:85-85`
- **currentIdx** — Current index in the files list `generic-language-worker.ts:321-321`
- **data** — Data associated with the message `generic-language-worker.ts:124-124`
- **data** — Parses the incoming message data `generic-language-worker.ts:850-850`
- **data** — Stores data related to worker tasks `language-worker-pool.ts:288-288`
- **data** — OVMS/OpenAI API embedding response `worker-embedding-client.ts:35-35`
- **data** — Stores the embedding response data from the API `worker-embedding-client.ts:318-318`
- **dedicatedEndpoint** — WorkerEmbeddingClient `worker-embedding-client.ts:69-69`
- **description** — Description of the entity `embedding-processor.ts:26-26`, `embedding-processor.ts:27-27`, `embedding-processor.ts:28-28`
- **dim** — Dimension of the embeddings `worker-global-cache.ts:21-21`
- **documentation** — Optional documentation field for ParsedEntityExtended `embedding-processor.ts:25-29`
- **embedding** — OVMS/OpenAI API embedding response `worker-embedding-client.ts:27-27`, `worker-embedding-client.ts:42-42`
- **embedding** — Contains the embedding result from the API `worker-embedding-client.ts:318-318`
- **embeddingConfig** — Property for embedding configuration in initialization messages `generic-language-worker.ts:49-49`
- **embeddingConfig** — Optional configuration for embeddings `parsing-subprocess-pool.ts:135-135`
- **embeddingEnabled** — Worker initialized response (with embeddings configured) `parsing-subprocess-pool.ts:62-62`
- **embeddings** — Array of embeddings in the message `embedding-processor.ts:49-49`
- **embeddings** — Worker embeddings ready message embeddings `language-worker-pool.ts:69-69`
- **embeddings** — Embeddings ready response (binary embeddings from worker) `parsing-subprocess-pool.ts:71-71`
- **embeddingsBuf** — Buffer containing pre-built embeddings `worker-global-cache.ts:20-20`
- **embeddingStatsAgg** — Aggregates statistics for embedding processes `parsing-subprocess-pool.ts:149-159`
- **endpointIndex** — WorkerEmbeddingClient `worker-embedding-client.ts:68-68`
- **endpoints** — WorkerEmbeddingClient `worker-embedding-client.ts:67-67`
- **entity** — Represents an entity with optional documentation `embedding-processor.ts:424-424`
- **entityId** — Represents an entity ID `embedding-processor.ts:424-424`
- **error** — Error associated with the message `generic-language-worker.ts:125-125`
- **error** — Worker error message error `language-worker-pool.ts:61-61`
- **error** — The error message associated with the task processing `python-worker-pool.ts:80-80`
- **error** — Error message if the task failed `worker-pool-manager.ts:28-28`
- **errors** — Array of errors encountered during parsing `generic-language-worker.ts:218-218`
- **errors** — Array of error messages for each file `parser-worker.ts:25-25`
- **errors** — Array of error messages for the task `python-worker.ts:29-29`
- **failedTasks** — Number of tasks that failed `language-worker-pool.ts:116-116`
- **failedTasks** — Tracks the number of tasks that failed to process `language-worker-pool.ts:154-154`
- **failedTasks** — Counts the number of failed tasks `parsing-subprocess-pool.ts:125-125`
- **failedTasks** — Logs tasks that failed during processing `python-worker-pool.ts:94-94`, `python-worker-pool.ts:111-111`
- **failedTasks** — The number of failed tasks `worker-pool-manager.ts:55-55`, `worker-pool-manager.ts:68-68`
- **file** — Single file path to be processed `generic-language-worker.ts:218-218`
- **file** — Represents a file `generic-language-worker.ts:378-378`
- **file** — Represents a single file being parsed `parser-worker.ts:25-25`, `parser-worker.ts:79-79`
- **file** — File path associated with a result `python-worker.ts:29-29`
- **file** — Stores an array of error messages related to file parsing `python-worker.ts:103-103`
- **filePath** — Not directly described in the provided code `analyzer-loader.ts:412-412`
- **filePath** — Path of the file `generic-language-worker.ts:437-437`
- **files** — Property for files in parse messages `generic-language-worker.ts:69-69`
- **files** — Array of file paths to be processed `generic-language-worker.ts:209-209`
- **files** — List of files to process `generic-language-worker.ts:320-320`
- **files** — Files associated with a task `language-worker-pool.ts:102-102`
- **files** — Array of file paths to be parsed `parser-worker.ts:18-18`, `python-worker-pool.ts:40-40`, `python-worker.ts:22-22`
- **files** — Manages files related to parsing tasks `parsing-subprocess-pool.ts:1157-1157`
- **files** — Represents the files to be processed `worker-pool-manager.ts:42-42`
- **filesProcessed** — Number of files processed `generic-language-worker.ts:220-220`, `language-worker-pool.ts:118-118`
- **filesProcessed** — Number of files processed by a worker `language-worker-pool.ts:82-82`
- **filesProcessed** — Number of files processed in the task `parser-worker.ts:27-27`, `python-worker.ts:31-31`
- **filesProcessed** — The number of files processed in the task `python-worker-pool.ts:65-65`
- **getWorkerId** — Method to get the worker ID `embedding-processor.ts:81-81`
- **hashToIndex** — Map of hash strings to row indices in embeddings.bin `worker-global-cache.ts:19-19`
- **id** — Unique identifier for the embedding `embedding-processor.ts:37-37`
- **id** — Unique identifier for a text item `embedding-processor.ts:68-68`, `embedding-processor.ts:173-173`
- **id** — Optional property for message identification `generic-language-worker.ts:44-44`, `generic-language-worker.ts:63-63`, `generic-language-worker.ts:68-68`
- **id** — Unique identifier for the task `generic-language-worker.ts:208-208`
- **id** — Worker result message ID `language-worker-pool.ts:50-50`, `language-worker-pool.ts:60-60`
- **id** — Unique identifier for a task or worker `language-worker-pool.ts:77-77`, `language-worker-pool.ts:92-92`, `language-worker-pool.ts:101-101`
- **id** — Unique identifier for a worker or task `language-worker-pool.ts:125-125`
- **id** — Unique identifier for a task `parser-worker.ts:17-17`
- **id** — Identifies a specific task or worker `parsing-subprocess-pool.ts:1156-1156`
- **id** — Unique identifier for a worker `python-worker-pool.ts:24-24`, `python-worker-pool.ts:39-39`
- **id** — The unique identifier for the task in the WorkerResultMessage `python-worker-pool.ts:60-60`, `python-worker-pool.ts:79-79`
- **id** — Unique identifier for a worker task `python-worker.ts:21-21`
- **id** — Unique identifier for the worker thread `worker-pool-manager.ts:32-32`, `worker-pool-manager.ts:41-41`
- **idleWorkers** — Number of workers currently idle `language-worker-pool.ts:113-113`
- **idleWorkers** — Tracks the number of idle workers in the pool `python-worker-pool.ts:91-91`
- **idleWorkers** — The number of idle workers in the pool `worker-pool-manager.ts:52-52`
- **index** — OVMS/OpenAI API embedding response `worker-embedding-client.ts:28-28`
- **index** — Represents the index of the embedding response item `worker-embedding-client.ts:318-318`
- **initialized** — WorkerEmbeddingClient `worker-embedding-client.ts:63-63`
- **isBatchProcessing** — Indicates whether batch processing is in progress `parsing-subprocess-pool.ts:146-146`
- **isBun** — Checks if the environment is running under Bun `parsing-subprocess-pool.ts:162-162`
- **isShuttingDown** — Indicates whether the subprocess pool is shutting down `parsing-subprocess-pool.ts:161-161`
- **keepaliveMemoryLimitMB** — Specifies the memory limit for keepalive mode `parsing-subprocess-pool.ts:143-143`
- **keepaliveMode** — Indicates whether keepalive mode is enabled `parsing-subprocess-pool.ts:142-142`
- **killAfterBatch** — Indicates whether to kill the subprocess after processing a batch `parsing-subprocess-pool.ts:133-133`
- **language** — The language parameter used to determine the appropriate analyzer `generic-language-worker.ts:70-70`
- **language** — Language of the files to be parsed `generic-language-worker.ts:210-210`, `generic-language-worker.ts:223-223`
- **language** — Programming language for the worker pool `language-worker-pool.ts:110-110`
- **language** — Language for which the worker pool is specialized `language-worker-pool.ts:149-149`
- **language** — Stores the language used for processing `parsing-subprocess-pool.ts:120-120`
- **lastTaskTime** — Time taken for the last task processed by a worker `language-worker-pool.ts:97-97`
- **lastTaskTime** — Time of the last task processed by the worker `python-worker-pool.ts:29-29`
- **lastTaskTime** — Time taken to process the last task by the worker thread `worker-pool-manager.ts:37-37`
- **layer1** — Time taken for the first layer of processing `python-worker-pool.ts:31-31`
- **layer1Time** — The time taken for the first layer of processing `python-worker-pool.ts:66-66`
- **layer1Time** — Time spent in Layer 1 of the parsing process `python-worker.ts:34-34`
- **layer2** — Time taken for the second layer of processing `python-worker-pool.ts:32-32`
- **layer2** — Represents metadata including layer timing information `python-worker.ts:140-140`
- **layer2Time** — The time taken for the second layer of processing `python-worker-pool.ts:67-67`
- **layer2Time** — Time spent in Layer 2 of the parsing process `python-worker.ts:35-35`
- **layer3** — Time taken for the third layer of processing `python-worker-pool.ts:33-33`
- **layer3** — Represents metadata including layer timing information `python-worker.ts:140-140`
- **layer3Time** — The time taken for the third layer of processing `python-worker-pool.ts:68-68`
- **layer3Time** — Time spent in Layer 3 of the parsing process `python-worker.ts:36-36`
- **layer4** — Time taken for the fourth layer of processing `python-worker-pool.ts:34-34`
- **layer4** — Represents metadata including layer timing information `python-worker.ts:140-140`
- **layer4Time** — The time taken for the fourth layer of processing `python-worker-pool.ts:69-69`
- **layer4Time** — Time spent in Layer 4 of the parsing process `python-worker.ts:37-37`
- **layerTiming** — Represents metadata including layer timing information `python-worker.ts:140-140`
- **layerTimings** — Object containing the time taken for each of the four layers in the worker's processing `python-worker-pool.ts:30-35`
- **loaded** — Boolean indicating whether the cache has been loaded `worker-global-cache.ts:22-22`
- **maxBatchMs** — Tracks the maximum batch time in milliseconds for embedding generation `embedding-processor.ts:55-55`
- **maxBatchMs** — Embeddings ready response (binary embeddings from worker) `parsing-subprocess-pool.ts:75-75`
- **maxFilesPerChunk** — Specifies the maximum number of files per chunk `parsing-subprocess-pool.ts:134-134`
- **memoryLimitMB** — Sets the memory limit for worker processes in megabytes `parsing-subprocess-pool.ts:132-132`
- **message** — Message object `generic-language-worker.ts:124-124`
- **message** — Message object containing task details `generic-language-worker.ts:218-218`
- **message** — Represents a message `generic-language-worker.ts:378-378`
- **message** — Stores messages sent to or received from worker threads `language-worker-pool.ts:292-292`
- **message** — Error message for a file `parser-worker.ts:25-25`
- **message** — Represents a message object used for communication between the worker thread and the main thread `parser-worker.ts:79-79`
- **message** — Error message associated with a file `python-worker.ts:29-29`
- **message** — Represents a message type for worker communication `python-worker.ts:103-103`
- **metadata** — Metadata for the embedding `embedding-processor.ts:40-40`
- **metadata** — Additional metadata for a text item `embedding-processor.ts:70-70`, `embedding-processor.ts:175-175`
- **metadata** — Metadata associated with a task or file `language-worker-pool.ts:128-128`
- **metadata** — Represents metadata including layer timing information `python-worker.ts:140-140`
- **name** — Name of the entity `embedding-processor.ts:27-27`
- **name** — Name of the worker `generic-language-worker.ts:136-136`
- **nodeWorkerModule** — Imports the Node.js worker_threads module `language-worker-pool.ts:165-165`
- **onEmbeddings** — Callback for embeddings `language-worker-pool.ts:141-141`
- **onEmbeddings** — Handles embeddings ready messages from workers `language-worker-pool.ts:161-161`
- **onEmbeddings** — Optional callback for embeddings `parsing-subprocess-pool.ts:136-136`
- **onEmbeddingTexts** — Optional callback for embedding texts `parsing-subprocess-pool.ts:137-137`
- **onStreamingResult** — Optional callback for streaming results `parsing-subprocess-pool.ts:138-138`
- **options** — ParserOptions used for parsing files `generic-language-worker.ts:71-71`
- **options** — Parser options for the language `generic-language-worker.ts:211-211`
- **options** — Options for a task `language-worker-pool.ts:103-103`
- **options** — Optional parser options for the task `parser-worker.ts:19-19`, `python-worker-pool.ts:41-41`, `python-worker.ts:23-23`
- **options** — Stores configuration options for parsing tasks `parsing-subprocess-pool.ts:1158-1158`
- **options** — Contains configuration options for the worker pool `worker-pool-manager.ts:43-43`
- **params** — Parameters for the entity `embedding-processor.ts:27-27`
- **parseBatch** — Not directly described in the provided code `analyzer-loader.ts:416-416`, `analyzer-loader.ts:423-423`
- **parseFast** — Parses the file quickly `generic-language-worker.ts:573-573`
- **payload** — Payload of the message `generic-language-worker.ts:77-77`
- **payload** — Payload of the message, containing the task details for a message of type "task" `parser-worker.ts:33-33`
- **payload** — Contains the task details and statistics for the task `worker-pool-manager.ts:23-27`
- **pendingTasks** — Tasks that are pending `language-worker-pool.ts:151-151`
- **pendingTasks** — Holds tasks that are currently pending and waiting to be processed `python-worker-pool.ts:108-108`
- **pendingTasks** — A map of pending tasks `worker-pool-manager.ts:65-65`
- **poolSize** — Size of the worker pool `language-worker-pool.ts:138-138`
- **poolSize** — Determines the number of worker threads in the pool `language-worker-pool.ts:159-159`
- **poolSize** — Defines the maximum number of worker processes `parsing-subprocess-pool.ts:131-131`
- **poolSize** — Determines the number of workers in the pool `python-worker-pool.ts:115-115`, `python-worker-pool.ts:120-120`
- **poolSize** — The size of the worker pool `worker-pool-manager.ts:72-72`, `worker-pool-manager.ts:77-77`
- **postMessage** — Method to post a message to the worker `generic-language-worker.ts:132-132`
- **postWorkerMessage** — Method to send worker messages to the main process `embedding-processor.ts:80-80`
- **processRestarts** — Counts the number of process restarts `parsing-subprocess-pool.ts:128-128`
- **promise** — Promise object `generic-language-worker.ts:116-116`
- **pythonAvailable** — Not directly described in the provided code `analyzer-loader.ts:70-70`
- **queuedTasks** — Number of tasks currently queued `language-worker-pool.ts:114-114`
- **queuedTasks** — Stores the list of tasks waiting to be processed `python-worker-pool.ts:92-92`
- **queuedTasks** — The number of tasks currently queued `worker-pool-manager.ts:53-53`
- **reason** — Reason for promise rejection `generic-language-worker.ts:115-115`
- **reject** — Function to reject a promise `language-worker-pool.ts:105-105`
- **reject** — Rejects a promise with an error `parsing-subprocess-pool.ts:1160-1160`
- **reject** — Function to reject the task's result `python-worker-pool.ts:43-43`
- **reject** — A function to reject a task's result `worker-pool-manager.ts:45-45`
- **resolve** — Function to resolve a promise `language-worker-pool.ts:104-104`
- **resolve** — Resolves a promise with a value `parsing-subprocess-pool.ts:1159-1159`
- **resolve** — Function to resolve the task's result `python-worker-pool.ts:42-42`
- **resolve** — A function to resolve a task's result `worker-pool-manager.ts:44-44`
- **results** — Array of parsed entities `generic-language-worker.ts:217-217`
- **results** — Worker result message results `language-worker-pool.ts:51-51`
- **results** — Array of results from a task `language-worker-pool.ts:79-79`
- **results** — Array of parsed results for each file `parser-worker.ts:24-24`
- **results** — The results of the task processed by the worker `python-worker-pool.ts:62-62`
- **results** — Array of parsed results for the task `python-worker.ts:28-28`
- **results** — Array of results from the task processing `worker-pool-manager.ts:25-25`
- **returns** — Returns description for the entity `embedding-processor.ts:28-28`
- **runtime** — Detects and stores the runtime environment `language-worker-pool.ts:164-164`
- **skipped** — Indicates skipped entities `generic-language-worker.ts:294-294`
- **smol** — A lightweight worker module for Node.js `language-worker-pool.ts:251-251`
- **stats** — Statistics about the parsing task `generic-language-worker.ts:219-224`
- **stats** — Statistics related to a task or worker `language-worker-pool.ts:80-83`
- **stats** — Performance statistics for the task, including files processed, total time, and average time per file `parser-worker.ts:26-30`
- **stats** — Statistics related to the task processing, including total time and files processed `python-worker-pool.ts:63-70`
- **stats** — Performance statistics for the task, including files processed, total time, average time per file, and time spent in each of the four layers `python-worker.ts:30-38`
- **stats** — Statistics for the task, including total processing time `worker-pool-manager.ts:26-26`
- **streamingMode** — Boolean indicating whether parsing is done in streaming mode `generic-language-worker.ts:72-72`
- **streamingMode** — Boolean indicating if parsing should be done in streaming mode `generic-language-worker.ts:212-212`
- **streamingMode** — Indicates whether streaming mode is enabled `parsing-subprocess-pool.ts:139-139`
- **task** — Represents a task for processing Python files `python-worker.ts:44-44`
- **taskId** — Unique identifier for the task `generic-language-worker.ts:216-216`
- **taskId** — Worker error message task ID `language-worker-pool.ts:59-59`
- **taskId** — Unique identifier for a task `language-worker-pool.ts:78-78`
- **taskId** — Unique identifier for the result of a task `parser-worker.ts:23-23`
- **taskId** — The task ID associated with the results in the WorkerResultMessage `python-worker-pool.ts:61-61`, `python-worker-pool.ts:78-78`
- **taskId** — Unique identifier for the result of a parsing task `python-worker.ts:27-27`
- **taskId** — Unique identifier for the task being processed `worker-pool-manager.ts:22-22`, `worker-pool-manager.ts:24-24`
- **taskQueue** — Queue of tasks `language-worker-pool.ts:152-152`
- **taskQueue** — Holds a queue of tasks to be processed `parsing-subprocess-pool.ts:122-122`
- **taskQueue** — Manages the queue of tasks to be processed by workers `python-worker-pool.ts:109-109`
- **taskQueue** — An array of pending tasks `worker-pool-manager.ts:66-66`
- **tasksProcessed** — Number of tasks processed by a worker `language-worker-pool.ts:95-95`
- **tasksProcessed** — Number of tasks processed by the worker `python-worker-pool.ts:27-27`
- **tasksProcessed** — Number of tasks processed by the worker thread `worker-pool-manager.ts:35-35`
- **taskTimeout** — Timeout for tasks `language-worker-pool.ts:139-139`
- **taskTimeout** — Sets the maximum time a task can run before being considered failed `language-worker-pool.ts:160-160`
- **taskTimeout** — Sets the maximum time a task can be processed before it is considered failed `python-worker-pool.ts:116-116`, `python-worker-pool.ts:121-121`
- **taskTimeout** — The timeout for tasks `worker-pool-manager.ts:73-73`
- **taskTimeout** — Sets the maximum time a task can be processed before it is considered timed out `worker-pool-manager.ts:78-78`
- **teiMetrics** — TEI inference metrics from this worker `embedding-processor.ts:51-58`
- **teiMetrics** — Embeddings ready response (binary embeddings from worker) `parsing-subprocess-pool.ts:72-77`
- **text** — The actual text content `embedding-processor.ts:69-69`, `embedding-processor.ts:174-174`
- **text** — Represents a text string `embedding-processor.ts:424-424`
- **texts** — Contains an array of text items with their metadata `embedding-processor.ts:67-71`
- **texts** — Embedding texts response (texts from worker) `parsing-subprocess-pool.ts:86-86`
- **timeoutAbort** — Function to abort a task due to timeout `language-worker-pool.ts:106-106`
- **totalFilesProcessed** — Counts the total number of files processed `language-worker-pool.ts:156-156`, `parsing-subprocess-pool.ts:127-127`
- **totalGenCount** — Stores the total generation count `embedding-processor.ts:54-54`
- **totalGenCount** — Embeddings ready `parsing-subprocess-pool.ts:74-74`
- **totalGenTimeMs** — Stores the total generation time in milliseconds `embedding-processor.ts:53-53`
- **totalGenTimeMs** — Embeddings ready response (binary embeddings from worker) `parsing-subprocess-pool.ts:73-73`
- **totalProcessingTime** — Total time spent processing tasks by a worker `language-worker-pool.ts:96-96`
- **totalProcessingTime** — Accumulates the total time spent processing tasks `language-worker-pool.ts:155-155`
- **totalProcessingTime** — Tracks the total processing time `parsing-subprocess-pool.ts:126-126`
- **totalProcessingTime** — Total time spent processing tasks by the worker `python-worker-pool.ts:28-28`
- **totalProcessingTime** — Tracks the total time spent on processing tasks `python-worker-pool.ts:112-112`
- **totalProcessingTime** — Total time spent processing tasks by the worker thread `worker-pool-manager.ts:36-36`
- **totalProcessingTime** — The total processing time of all tasks `worker-pool-manager.ts:69-69`
- **totalTime** — Total time taken for the parsing task `generic-language-worker.ts:221-221`
- **totalTime** — Total time taken for a task or worker `language-worker-pool.ts:81-81`
- **totalTime** — Total time taken to process the task `parser-worker.ts:28-28`, `python-worker.ts:32-32`, `worker-pool-manager.ts:26-26`
- **totalTime** — The total time taken to process the task `python-worker-pool.ts:64-64`
- **totalWorkers** — Total number of workers in the pool `language-worker-pool.ts:111-111`
- **totalWorkers** — Represents the total number of workers in the pool `python-worker-pool.ts:89-89`
- **totalWorkers** — The total number of workers in the pool `worker-pool-manager.ts:50-50`
- **type** — Type of the entity `embedding-processor.ts:27-27`, `embedding-processor.ts:28-28`, `embedding-processor.ts:47-47`
- **type** — Specifies the type of worker message `embedding-processor.ts:65-65`
- **type** — Property indicating the type of the message `generic-language-worker.ts:43-43`, `generic-language-worker.ts:48-48`, `generic-language-worker.ts:53-53`, `generic-language-worker.ts:58-58`, `generic-language-worker.ts:62-62`, `generic-language-worker.ts:67-67`
- **type** — Type of message `generic-language-worker.ts:76-76`
- **type** — Specifies the type of entity `generic-language-worker.ts:294-294`
- **type** — Worker ready message type `language-worker-pool.ts:41-41`, `language-worker-pool.ts:49-49`, `language-worker-pool.ts:58-58`, `language-worker-pool.ts:68-68`
- **type** — Type of the message, such as initialization or task processing `parser-worker.ts:33-33`, `parser-worker.ts:33-33`, `parser-worker.ts:33-33`
- **type** — Worker initialized response (with embeddings configured) `parsing-subprocess-pool.ts:61-61`, `parsing-subprocess-pool.ts:69-69`, `parsing-subprocess-pool.ts:84-84`
- **type** — The type of the message, which is "ready" for WorkerReadyMessage `python-worker-pool.ts:51-51`, `python-worker-pool.ts:59-59`, `python-worker-pool.ts:77-77`
- **type** — Defines the types of messages that can be sent to the worker `python-worker.ts:44-44`, `python-worker.ts:44-44`
- **type** — Represents a type of worker message `python-worker.ts:44-44`, `python-worker.ts:44-44`
- **type** — Indicates the type of message, such as "ready", "initialized", "result", or "error" `worker-pool-manager.ts:21-21`
- **unhandledrejection** — Event for unhandled promise rejections `generic-language-worker.ts:126-126`
- **vectorBuffer** — Binary data for zero-copy transfer `embedding-processor.ts:38-38`
- **vectorBuffer** — Buffer for vector data `language-worker-pool.ts:126-126`
- **worker** — Worker thread instance `language-worker-pool.ts:93-93`
- **worker** — Node.js Worker instance for a Python file `python-worker-pool.ts:25-25`
- **worker** — Reference to the worker thread `worker-pool-manager.ts:33-33`
- **workerId** — Unique identifier for the worker `generic-language-worker.ts:149-149`
- **workerId** — Worker ready message worker ID `language-worker-pool.ts:42-42`
- **workerId** — The unique identifier for the worker in the WorkerReadyMessage `python-worker-pool.ts:52-52`
- **workers** — Array of worker threads `language-worker-pool.ts:150-150`
- **workers** — Manages a map of worker processes and their states `parsing-subprocess-pool.ts:121-121`
- **workers** — Maintains a list of worker threads in the pool `python-worker-pool.ts:107-107`
- **workers** — A map of worker states `worker-pool-manager.ts:64-64`
- **workerScript** — Script for worker threads `language-worker-pool.ts:140-140`
- **workerScript** — Specifies the script used to create worker threads `language-worker-pool.ts:158-158`, `python-worker-pool.ts:114-114`
- **workerScript** — Stores the script used for worker processes `parsing-subprocess-pool.ts:130-130`
- **workerScript** — The script used to create worker threads `worker-pool-manager.ts:71-71`

## Submodules

| Submodule | Description |
|-----------|-------------|
| [subprocess-pool/](./subprocess-pool/AUTODOC.md) | Types, interfaces, and subprocess spawning for parsing pools |

## Data Flow

- **Inputs**: File paths grouped by language, parser options, embedding configuration.
- **Processing**: Distributes files across workers using size+complexity-aware load balancing, each worker reads files (with prefetch overlap), detects language, loads analyzer, parses to AST entities, optionally generates embeddings via HTTP client or collects texts for centralized generation.
- **Outputs**: `ParseResult[]` with entities and relationships per file, binary embeddings or text items sent via IPC to main process.

## Public API

| Export | Type | Description | Location |
|--------|------|-------------|----------|
| `ParsingSubprocessPool` | class | Subprocess pool with memory isolation and dynamic scaling | [`parsing-subprocess-pool.ts:113-1505`](./parsing-subprocess-pool.ts) |
| `WorkerPoolManager` | class | Thread-based worker pool with task queuing | [`worker-pool-manager.ts:63-407`](./worker-pool-manager.ts) |
| `LanguageWorkerPool` | class | Language-specific thread pool with runtime detection | [`language-worker-pool.ts:156-763`](./language-worker-pool.ts) |
| `PythonWorkerPool` | class | Specialized pool for Python with 4-layer timing | [`python-worker-pool.ts:126-522`](./python-worker-pool.ts) |
| `WorkerGlobalCache` | class | Global cache for worker-wide state, analyzers, and embeddings | [`worker-global-cache.ts:17-85`](./worker-global-cache.ts) |
| `detectLanguage` | function | Detects language from file extension | [`language-detection.ts:80-83`](./language-detection.ts) |
| `LANGUAGE_MAP` | const | Extension-to-language mapping | [`language-detection.ts:12-53`](./language-detection.ts) |
| `SUPPORTED_LANGUAGES` | const | List of all supported language identifiers | [`language-detection.ts:61-84`](./language-detection.ts) |
| `getAnalyzer` | function | Gets or creates cached language analyzer | [`analyzer-loader.ts:23-54`](./analyzer-loader.ts) |
| `getWorkerGlobalCache` | function | Retrieves or initializes the global worker cache instance | [`worker-global-cache.ts:90-93`](./worker-global-cache.ts) |
| `warmupAnalyzer` | function | Pre-warms ANTLR parsers for JIT compilation | [`analyzer-loader.ts:59-295`](./analyzer-loader.ts) |
| `SUPPORTED_WORKER_LANGUAGES` | const | Languages supported by the generic worker | [`analyzer-loader.ts:287-309`](./analyzer-loader.ts) |
| `WorkerEmbeddingClient` | class | Lightweight HTTP client for embedding generation in workers | [`worker-embedding-client.ts:60-325`](./worker-embedding-client.ts) |
| `workerLog` | function | File-based logging from worker processes | [`worker-logging.ts:53-74`](./worker-logging.ts) |

## Dependencies

### Internal Modules

| Module | Purpose |
|--------|---------|
| `parsers/*` | Language-specific parsers (UnifiedParser, PythonNativeParser, etc.) |
| `types/parser` | ParseResult, ParserOptions types |
| `types/semantic` | WorkerEmbeddingConfig, EmbeddingPoolStats types |
| `logging` | Structured logging from main process |
| `shared/runtime-detect` | Bun vs Node.js runtime detection |
| `workers/subprocess-pool` | Subprocess spawning and type definitions |

### External Packages

| Package | Purpose |
|---------|---------|
| `undici` | HTTP keep-alive connection pooling for embedding clients |

## Behavioral Properties

| Property | Value |
|----------|-------|
| Supported languages | 14 (TS, JS, Python, Go, Rust, C, C++, Java, Kotlin, Swift, Zig, Bash, PowerShell, JSON) |
| Worker scaling | Dynamic 1-8 workers based on file count |
| Embedding providers | TEI, OVMS, Ollama, OpenAI, vLLM, llama.cpp |
| IPC serialization | V8 native structured clone (Bun and Node.js) |

## Error Handling

Worker crashes are caught and pending tasks are rejected with descriptive errors. Subprocess unexpected exits trigger automatic respawn if work remains in the queue. Task timeouts reject promises after configurable delays. Embedding failures for individual batches are logged and skipped. Generated code (ANTLR, Protobuf, minified) is automatically detected and skipped.

## Known Limitations

- `PythonWorkerPool` and `python-worker.ts` are legacy thread-based workers; Python parsing now primarily uses `ParsingSubprocessPool` with batch mode.
- `WorkerPoolManager` resolves worker script path relative to bundled dist directory, which may break in non-standard build setups.
- Keepalive memory monitoring relies on ping/pong with a 2-second timeout, which may miss rapid memory spikes.

## Files

| File | Description |
|------|-------------|
| `parsing-subprocess-pool.ts` | Subprocess pool with dynamic scaling, memory isolation, and embedding support |
| `generic-language-worker.ts` | Universal worker supporting all languages, embedding generation, and 3 runtime modes |
| `language-worker-pool.ts` | Thread-based pool with runtime-aware worker creation (Bun/Node.js) |
| `worker-pool-manager.ts` | Thread-based pool manager with task queuing and load balancing |
| `parser-worker.ts` | Tree-sitter-based parser worker thread for batch file parsing |
| `python-worker-pool.ts` | Specialized Python pool with 4-layer timing support |
| `python-worker.ts` | Dedicated Python worker with 4-layer analysis architecture |
| `embedding-processor.ts` | Worker-side embedding generation, deduplication, and IPC transfer |
| `worker-embedding-client.ts` | Lightweight HTTP embedding client supporting 6 providers |
| `language-detection.ts` | File extension to programming language detection |
| `analyzer-loader.ts` | Dynamic language analyzer loading with caching and warmup |
| `worker-logging.ts` | File-based logging from worker/subprocess processes |
| `worker-global-cache.ts` | Global cache for managing worker-wide state and shared resources |
