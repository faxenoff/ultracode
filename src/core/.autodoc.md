# Core

## 🤖 Overview

The `core` module is the system's backbone, coordinating all major subsystems. It manages object lifecycles through a DI container with circular dependency detection, enables decoupled communication via a Bloom-filter-optimized knowledge bus, and monitors CPU/memory pressure with adaptive throttling. Git-aware indexing tracks branch switches and file changes with debouncing and bulk-mode detection. Multi-client isolation (pipe mode) is handled through per-client sessions, while graceful shutdown ensures proper cleanup of all resources.

## 🤖 Entity Listing

### Function
- **addSessionToRepoIndex** — Adds the session to the repository index `client-session.ts:356-363`
- **areTimersSuspended** — Checks if background timers are suspended `indexing-state.ts:43-45`
- **autodocResult** — Represents the result of auto-doc synchronization `service-container.ts:207-207`
- **autodocResult** — Maps filePath and content to saveDocument `service-container.ts:208-208`
- **bgPromise** — Represents a background promise for asynchronous operations `auto-indexer.ts:476-582`
- **buildAutoIndexExcludePatterns** — Builds exclude patterns for source file counting and indexing `auto-indexer.ts:163-257`
- **buildTrigramIndex** — Builds a trigram index for text processing `auto-indexer.ts:616-683`
- **changeEvents** — Tracks events related to file changes `merkle-file-tracker.ts:200-204`
- **changeEvents** — Events related to file changes `merkle-file-tracker.ts:168-172`
- **checkQuietMode** — Check for --pipe flag and set MCP_QUIET_MODE environment variable `environment-setup.ts:53-57`
- **childHashes** — Stores the hashes of child nodes `file-merkle.ts:424-424`
- **childHashes** — Maps children to their hashes and sorts them `file-merkle.ts:588-588`
- **children** — Filters nodes to find children of a given node `file-merkle.ts:587-587`
- **cleanup** — Cleans up the pipe or socket path `pipe-transport.ts:122-125`
- **countSourceFiles** — Counts the number of source files in a project `auto-indexer.ts:136-155`
- **createAgentFactory** — Creates a new agent factory configuration `di-container.ts:388-404`
- **createFileWatcher** — Creates a new FileWatcher instance `file-watcher.ts:440-444`
- **createSafeEnvironment** — Creates a safe environment object with default values for critical environment variables and makes it globally available `environment-setup.ts:67-80`
- **currentMap** — Creates a map of current leaves by their paths and hashes `file-merkle.ts:515-515`
- **currentSet** — Creates a set of current file paths `git-watcher.ts:787-787`
- **dataHandler** — Handles incoming data `pipe-transport.ts:135-182`
- **descriptor** — Represents a service descriptor with factory, metadata, and dependencies `di-container.ts:143-143`
- **detectSupportedProject** — Detects a supported project based on file extensions `auto-indexer.ts:104-130`
- **dispatchPromise** — Dispatches a promise to subscribers and logs an error if it fails `knowledge-bus.ts:118-120`
- **doResolve** — Resolves the pipe or socket path `pipe-transport.ts:127-132`
- **endTimer** — Not present in the provided entities `startup-utils.ts:94-100`
- **evictStaleLocks** — Evicts stale indexing locks that exceeded the safety timeout `indexing-state.ts:59-72`
- **expandHome** — Not present in the provided code `environment-setup.ts:150-155`
- **extList** — A list of supported file extensions `auto-indexer.ts:111-111`
- **extList** — Parses extensions to remove leading dots and joins them with commas `auto-indexer.ts:138-138`
- **faissSavePromise** — Represents a promise for saving Faiss index data `auto-indexer.ts:482-494`
- **generateEmbeddings** — Generates embeddings for code snippets `service-container.ts:251-270`
- **generateId** — Generates a unique ID for a knowledge entry `knowledge-bus.ts:32-34`
- **generateSessionId** — Generates a unique session ID for a new ClientSession `client-session.ts:473-478`
- **getActiveSessions** — Retrieves a list of currently active ClientSession instances `client-session.ts:430-432`
- **getGlobalContainer** — Retrieves the global DI container `di-container.ts:443-448`
- **getIndexingStatus** — Returns the current indexing status including in-progress status, directory, elapsed time, and all projects `indexing-state.ts:99-118`
- **getLocalDateString** — Get local date string for log file names (YYYY-MM-DD in local time) `startup-utils.ts:37-41`
- **getLocalTimestamp** — Get local timestamp with timezone (e.g., 2026-01-01T03:45:30.123+04 `startup-utils.ts:24-32`
- **getOrCreateAgent** — Retrieves or creates an agent from the DI container and registers it with the conductor if it does not exist `agent-registry.ts:138-165`
- **getPipePath** — Get the pipe/socket path based on platform `pipe-transport.ts:15-20`
- **getPostIndexingStatus** — Returns the current status of post-indexing operations, including active status, directories, and elapsed time `indexing-state.ts:181-192`
- **getProcessStartTime** — Get the process start time `startup-utils.ts:78-80`
- **getServiceContainer** — Retrieves the service container `service-container.ts:435-440`
- **getSession** — Creates a new ClientSession instance with specified configuration `client-session.ts:423-425`
- **getSessionsForProject** — Finds all ClientSession instances associated with a given project `client-session.ts:438-449`
- **getSessionsForRepo** — Finds all ClientSession instances associated with a given repository `client-session.ts:455-465`
- **getVersionInfo** — Not present in the provided code `environment-setup.ts:105-139`
- **idx** — Finds the index of a subscription in a list by its ID `knowledge-bus.ts:164-164`
- **initServiceContainer** — Initializes the service container `service-container.ts:429-432`
- **isBunRuntime** — Checks if the runtime is Bun `resource-manager.ts:22-24`
- **isIndexing** — Checks if indexing is currently in progress for any project `indexing-state.ts:77-80`
- **isPostIndexing** — Checks if a given directory has a pending post-indexing promise `indexing-state.ts:149-151`
- **isProjectIndexing** — Checks if a given directory is currently being indexed `indexing-state.ts:85-94`
- **isServiceContainerInitialized** — Checks if the service container is initialized `service-container.ts:443-445`
- **isShuttingDown** — Boolean indicating if the system is in the process of shutting down `shutdown-handlers.ts:46-48`
- **msValues** — Stores the time values in milliseconds for various operations `auto-indexer.ts:423-423`
- **nodeMap** — Creates a map of nodes by their paths `file-merkle.ts:582-582`
- **nodes** — Converts database rows to node objects `file-merkle.ts:581-581`
- **noop** — Define a no-op function for Bun+quiet mode `environment-setup.ts:27-27`
- **noop** — Defines an empty function `environment-setup.ts:35-35`
- **normalizeDir** — Normalizes a directory path by converting it to lowercase and replacing backslashes with forward slashes `indexing-state.ts:126-128`
- **otherMap** — Creates a map of other leaves by their paths and hashes `file-merkle.ts:516-516`
- **patterns** — Base exclude patterns for source file counting and indexing, used by both countSourceFiles and buildAutoIndexExcludePatterns for consistency `auto-indexer.ts:114-114`
- **patterns** — Stores the include and exclude patterns for file filtering `file-watcher.ts:147-148`
- **performAutoIndex** — Executes the automatic indexing process `auto-indexer.ts:306-606`
- **performGlobalShutdown** — Performs a graceful shutdown of the application, handling signals like SIGINT and SIGTERM `shutdown-handlers.ts:78-139`
- **readBranchFromHead** — Reads branch name from .git/HEAD file (no child process) `git-watcher.ts:42-57`
- **readCommitFromRefs** — Reads current commit SHA from .git/refs/heads/<branch> or packed-refs (no child process) `git-watcher.ts:62-96`
- **registerAgentWithConductor** — Registers an agent with the conductor if it is not already registered `agent-registry.ts:115-133`
- **registerAllAgents** — Registers all agents in DI container with lazy initialization `agent-registry.ts:22-110`
- **registerAsyncLoopStarter** — Legacy export for compatibility (no-op now) `indexing-state.ts:31-31`
- **registerDebugSignalHandler** — Sets up a handler for the SIGUSR1 signal to capture diagnostic information `shutdown-handlers.ts:200-229`
- **registerSession** — Registers the session `client-session.ts:379-392`
- **registerSignalHandlers** — Registers signal handlers for process termination and debug signals `shutdown-handlers.ts:153-191`
- **removeSessionFromRepoIndex** — Removes the session from the repository index `client-session.ts:366-374`
- **resetGlobalContainer** — Resets the global DI container `di-container.ts:453-458`
- **resolveAgentCapabilities** — Resolves the capabilities of an agent `di-container.ts:409-432`
- **resolveGitDir** — Resolves the .git directory path (handles worktrees) `git-watcher.ts:24-36`
- **results** — Stores the results of file scanning and Merkle tree operations `merkle-file-tracker.ts:237-250`
- **resumeTimers** — Resumes background timers `indexing-state.ts:51-53`
- **runOllamaCheck** — Function to run an asynchronous Ollama availability check `startup-checks.ts:25-53`
- **runOrphanedEmbeddingsCheck** — Function to check for orphaned embeddings and resume generation `startup-checks.ts:66-123`
- **setIndexingState** — Stores the start time and directory for a single indexing operation in a map `indexing-state.ts:198-219`
- **setPostIndexingPromise** — Sets a promise for post-indexing operations and auto-cleans up when the promise completes `indexing-state.ts:136-144`
- **setProcessStartTime** — Set the process start time (call once at startup) `startup-utils.ts:71-73`
- **setShutdownContext** — Sets the shutdown context for the application `shutdown-handlers.ts:67-69`
- **setupConsoleOverride** — Override console methods for quiet mode to prevent JSON-RPC corruption in --pipe mode `environment-setup.ts:19-43`
- **sizes** — Stores the sizes of the input data `auto-indexer.ts:424-424`
- **sizeStr** — Converts sizes to a string representation `auto-indexer.ts:425-425`
- **sortedDirs** — Sorts directories by their depth `file-merkle.ts:166-166`
- **srcResult** — Represents the result of source code modification `service-container.ts:222-222`
- **srcResult** — Maps filePath and content to saveDocument `service-container.ts:223-223`
- **startTimer** — Not present in the provided entities `startup-utils.ts:85-89`
- **suspendTimers** — Suspends background timers `indexing-state.ts:47-49`
- **swaggerFiles** — Filters files to include those related to Swagger or OpenAPI specifications `git-watcher.ts:457-464`
- **timer** — Manages a timer for data handling `pipe-transport.ts:187-190`
- **toMB** — Converts bytes to megabytes `resource-manager.ts:20-20`
- **unregisterSession** — Unregisters the session `client-session.ts:397-418`
- **values** — Creates a string of placeholders for batch operations `file-merkle.ts:258-258`
- **waitForPostIndexing** — Waits for a post-indexing promise to complete or a timeout to occur `indexing-state.ts:157-176`
- **watcher** — Represents the file watcher for a specific directory `file-watcher.ts:227-240`
- **watcher** — Initializes a file watcher to monitor changes in a directory and queue changes accordingly `file-watcher.ts:266-279`
- **writeToLogFile** — Write message to log file `startup-utils.ts:46-59`

### Method
- **_publishInternal** — Internal method for publishing knowledge to a topic `knowledge-bus.ts:85-124`
- **adjustForCodebaseSize** — Adjusts resource allocation based on codebase size `resource-manager.ts:288-311`
- **append** — Append a chunk of data to the buffer `pipe-transport.ts:28-30`
- **branch** — Returns the branch name for the session `client-session.ts:132-134`
- **build** — Builds the Merkle tree for a set of files `file-merkle.ts:89-212`
- **captureSnapshot** — Captures a resource usage snapshot `resource-manager.ts:338-365`
- **checkBranchChange** — Checks for branch change events `git-watcher.ts:649-673`
- **checkCommitChange** — Checks for commit change events `git-watcher.ts:675-715`
- **checkProjectIndexed** — Checks if the project is indexed `client-session.ts:337-340`
- **checkUncommittedChanges** — Checks for uncommitted changes `git-watcher.ts:785-841`
- **cleanupOldBranches** — Removes old branches based on the eviction strategy `branch-manager.ts:311-346`
- **clear** — Clears all services and agents from the container `di-container.ts:309-314`
- **clear** — Clears the file merkle tree `file-merkle.ts:620-627`
- **clear** — Clear the buffer `pipe-transport.ts:48-50`
- **clearAgentInstances** — Clears all agent instances from the container `di-container.ts:295-304`
- **clearTopic** — Clears all entries for a specific topic in the knowledge bus `knowledge-bus.ts:248-251`
- **clearTransients** — Clears all transient services from the container `di-container.ts:282-289`
- **close** — Closes the pipe transport `pipe-transport.ts:233-237`
- **close** — Closes the server and cleans up the socket file `pipe-transport.ts:327-341`
- **closeAllWatchers** — Closes all active Git watchers `git-watcher.ts:295-308`
- **compileWildcard** — Compiles a wildcard pattern into a regular expression for efficient topic matching `knowledge-bus.ts:298-305`
- **computeFileHash** — Computes the hash of a file `merkle-file-tracker.ts:264-274`
- **constructor** — Initializes the branch manager with configuration `branch-manager.ts:92-96`
- **constructor** — Initializes a new ClientSession instance with project path and optional configuration `client-session.ts:82-116`
- **constructor** — Constructor for DIContainer `di-container.ts:78-81`
- **constructor** — Initializes the FileWatcher with configuration options `file-watcher.ts:71-80`
- **constructor** — Initializes the GitWatcher `git-watcher.ts:169-180`
- **constructor** — Initializes the KnowledgeBus with event-driven architecture and sets up internal data structures `knowledge-bus.ts:52-55`
- **constructor** — Constructor for MerkleFileTracker, initializing fileWatcher and fileMerkle `merkle-file-tracker.ts:54-67`
- **constructor** — Initializes the pipe transport `pipe-transport.ts:257-259`
- **constructor** — Initializes a new instance of the PipeClientTransport class with a socket `pipe-transport.ts:100-100`
- **constructor** — Initializes a new instance of the SnapshotRing class `resource-manager.ts:65-67`
- **constructor** — Initializes resource manager with constraints, calculates memory and CPU limits, and logs initialization details `resource-manager.ts:141-161`
- **constructor** — Constructor for ServiceContainer `service-container.ts:63-65`
- **createScope** — Creates a new scope for the container `di-container.ts:367-378`
- **createTable** — Creates the file_merkle table in the database `file-merkle.ts:47-70`
- **deleteFile** — Deletes a file from the file merkle tree `file-merkle.ts:379-417`
- **diffBranches** — Compares two branches of the file merkle tree `file-merkle.ts:485-542`
- **diffWithFS** — Compares the file merkle tree with the file system `file-merkle.ts:436-480`
- **directory** — Get working directory `service-container.ts:68-70`
- **dispatchToSubscribers** — Notifies subscribers of a new knowledge entry, handling both exact and wildcard topic matches `knowledge-bus.ts:317-342`
- **dispose** — Disposes of all disposable resources in the container `di-container.ts:319-344`
- **dispose** — Disposes of the knowledge bus and clears all internal resources `knowledge-bus.ts:60-68`
- **ensureNotDisposed** — Ensures that the container is not disposed `di-container.ts:358-362`
- **ensureProjectInitialized** — Ensures the project is initialized `client-session.ts:312-332`
- **estimateCpuUsage** — Estimates CPU usage `resource-manager.ts:368-373`
- **evaluatePressure** — Evaluates resource pressure `resource-manager.ts:379-407`
- **fastStartup** — Method to perform fast startup verification `merkle-file-tracker.ts:134-185`
- **finishIndexing** — Finishes the indexing process `client-session.ts:268-272`
- **flush** — Flushes the queued changes and emits events `file-watcher.ts:394-418`
- **flushPendingChanges** — Flushes pending changes `git-watcher.ts:415-492`
- **forceFlush** — Forces a flush of pending changes `git-watcher.ts:394-406`
- **fullScanAndBuild** — Performs a full scan of files and builds the Merkle tree `merkle-file-tracker.ts:190-220`
- **generateAutoDocEmbeddings** — Generates embeddings for auto-doc data `service-container.ts:292-396`
- **getActiveBranches** — Lists all active branches in the repository `branch-manager.ts:271-306`
- **getAgentTypes** — Retrieves the types of all registered agents `di-container.ts:258-266`
- **getAllLeaves** — Retrieves all leaf nodes from the file merkle tree `file-merkle.ts:547-557`
- **getAutoDocManager** — Get autoDoc manager `service-container.ts:155-192`
- **getAvailableResources** — Gets the available resources `resource-manager.ts:252-258`
- **getBranch** — Returns the current branch name or null for detached HEAD `git-watcher.ts:258-260`
- **getBranchDbPath** — Constructs the path to the branch database `branch-manager.ts:212-215`
- **getBranchMetadata** — Fetches metadata for the specified branch `branch-manager.ts:230-247`
- **getChangedFiles** — Returns a list of changed files `git-watcher.ts:525-576`
- **getChangedFilesBetweenBranches** — Returns a list of changed files between two branches `git-watcher.ts:581-631`
- **getChildren** — Returns the children of a node `file-merkle.ts:328-342`
- **getCodeModifier** — Get code modifier `service-container.ts:97-105`
- **getCodeValidator** — Get code validator `service-container.ts:120-125`
- **getConductor** — Get conductor orchestrator `service-container.ts:78-80`
- **getConstraints** — Retrieves resource constraints `resource-manager.ts:314-316`
- **getCurrentBranch** — Retrieves the current branch `branch-manager.ts:115-166`
- **getCurrentBranch** — Returns the current branch name `git-watcher.ts:638-641`
- **getCurrentCommit** — Returns the current commit SHA `git-watcher.ts:644-647`
- **getCurrentUsage** — Returns the current resource usage `resource-manager.ts:234-236`
- **getDependencyGraph** — Retrieves the dependency graph of the container `di-container.ts:271-277`
- **getFaissIndexPath** — Retrieves the path to the Faiss index for the branch `branch-manager.ts:220-225`
- **getFileMerkle** — Gets the Merkle tree instance `merkle-file-tracker.ts:304-306`
- **getFileOperations** — Get file operations `service-container.ts:108-117`
- **getFileWatcher** — Gets the file watcher instance `merkle-file-tracker.ts:297-299`
- **getGlobalVectorStore** — Get global vector store `service-container.ts:83-85`
- **getGraphStorage** — Get graph storage `service-container.ts:73-75`
- **getHistory** — Retrieves the history of resource usage `resource-manager.ts:242-244`
- **getInfo** — Returns information about the current project session `client-session.ts:295-303`
- **getLastCommitHash** — Parses the last commit hash of the current branch `branch-manager.ts:171-186`
- **getNode** — Retrieves a specific node from the file merkle tree `file-merkle.ts:309-323`
- **getPath** — Gets the path for the pipe or socket `pipe-transport.ts:343-345`
- **getPatternSearch** — Get pattern search `service-container.ts:137-146`
- **getPendingChangesCount** — Returns the count of pending changes `git-watcher.ts:387-389`
- **getProjectDir** — Returns the project directory `client-session.ts:176-178`
- **getProjectsDir** — Retrieves the directory for projects `branch-manager.ts:101-103`
- **getRecentMessages** — Retrieves the most recent messages from the message queue `knowledge-bus.ts:241-243`
- **getRepositoryHash** — Retrieves the hash of the current repository `branch-manager.ts:192-195`
- **getRootHash** — Returns the root hash of the file merkle tree `file-merkle.ts:292-304`
- **getRootHash** — Gets the root hash of the Merkle tree `merkle-file-tracker.ts:311-314`
- **getSemanticAgent** — Retrieves the semantic agent `service-container.ts:399-404`
- **getServiceNames** — Retrieves the names of all registered services `di-container.ts:251-253`
- **getStats** — Retrieves statistics about the file merkle tree `file-merkle.ts:676-699`
- **getStats** — Calculates and returns statistics about the knowledge bus, including topic count, entry count, subscription count, and message queue size `knowledge-bus.ts:256-279`
- **getStatus** — Returns the current status of the file watcher `file-watcher.ts:423-433`
- **getStatus** — Gets the current status of the Merkle file tracker `merkle-file-tracker.ts:326-346`
- **getStoragePaths** — Returns storage paths for the current project `client-session.ts:169-171`
- **getTechnologyDetector** — Get technology detector `service-container.ts:128-134`
- **getUncommittedFiles** — Returns a list of uncommitted files `git-watcher.ts:721-780`
- **getVersionManager** — Get version manager `service-container.ts:88-94`
- **has** — Checks if a service is registered in the container `di-container.ts:237-239`
- **hasAgent** — Checks if an agent is registered in the container `di-container.ts:244-246`
- **hasBranchDatabase** — Checks if a branch database exists for the specified branch `branch-manager.ts:371-374`
- **idleTimeMs** — Calculates the idle time in milliseconds `client-session.ts:288-290`
- **initialize** — Initializes the branch manager `branch-manager.ts:108-110`
- **initialize** — Initializes the file merkle tree with a client `file-merkle.ts:36-42`
- **initialize** — Method to initialize MerkleFileTracker with a database client and project hash `merkle-file-tracker.ts:72-78`
- **insertNode** — Inserts a node into the Merkle tree `file-merkle.ts:217-235`
- **insertNodes** — Inserts multiple nodes into the Merkle tree `file-merkle.ts:240-283`
- **invokeHandler** — Invokes a handler for a subscription, logging any errors that occur during the invocation `knowledge-bus.ts:344-351`
- **isAutoDocEnabled** — Check if autoDoc is enabled `service-container.ts:149-152`
- **isDisposable** — Checks if a service is disposable `di-container.ts:349-353`
- **isIndexing** — Checks if indexing is in progress `client-session.ts:252-254`
- **isReady** — Checks if the file merkle tree is initialized `file-merkle.ts:669-671`
- **isSystemThrottled** — Checks if the system is throttled `resource-manager.ts:247-249`
- **isWatching** — Checks if the Git watcher is currently active `git-watcher.ts:265-267`
- **isWorktree** — Determines if the project is a worktree `client-session.ts:155-157`
- **latest** — Returns the most recently pushed resource snapshot `resource-manager.ts:76-80`
- **loadRegistry** — Loads the branch registry configuration `branch-manager.ts:380-406`
- **markActivity** — Marks the session as active `client-session.ts:281-283`
- **matchesPatterns** — Checks if a file path matches the include and exclude patterns `file-watcher.ts:297-315`
- **normalizePath** — Normalizes the file path for consistent handling `file-merkle.ts:636-650`
- **notifyFileChange** — Notifies the system of a file change event `git-watcher.ts:315-343`
- **onBranchChange** — Handles branch change events `git-watcher.ts:348-350`
- **onCommit** — Handles commit events `git-watcher.ts:355-357`
- **onDebouncedChange** — Handles debounced change events `git-watcher.ts:380-382`
- **onFileChange** — Handles file change events `git-watcher.ts:362-364`
- **onFileChange** — Handles events when a file changes `merkle-file-tracker.ts:279-292`
- **onUncommittedChange** — Handles uncommitted change events `git-watcher.ts:370-372`
- **processReadBuffer** — Processes the read buffer for messages `pipe-transport.ts:219-231`
- **projectHash** — Returns the project hash for the session `client-session.ts:140-142`
- **projectPath** — Returns the project path for the session `client-session.ts:125-127`
- **publish** — Publishes knowledge to a topic without waiting for subscriber handlers to complete `knowledge-bus.ts:73-75`
- **publishAsync** — Publishes knowledge and awaits all subscriber handlers to complete `knowledge-bus.ts:81-83`
- **push** — Adds a new resource snapshot to the ring buffer `resource-manager.ts:69-73`
- **query** — Queries the knowledge bus for entries matching a topic and returns them `knowledge-bus.ts:178-219`
- **queueChange** — Queues a file change event for debouncing `file-watcher.ts:350-367`
- **readInitMessage** — Reads the init message before MCP handshake, supporting both v3.0 JSON and v2.x plain text protocols `pipe-transport.ts:112-192`
- **readMessage** — Read a newline-delimited JSON message from the buffer `pipe-transport.ts:32-46`
- **rebuild** — Rebuilds the Merkle tree from scratch `merkle-file-tracker.ts:359-362`
- **recomputeDirHash** — Recomputes the hash of a directory `file-merkle.ts:422-426`
- **register** — Method to register a service `di-container.ts:86-107`
- **registerAgent** — Registers an agent with the container `di-container.ts:177-184`
- **registerInstance** — Registers a service with a factory function and lifetime strategy `di-container.ts:134-150`
- **registerSingleton** — Method to register a singleton service `di-container.ts:112-118`
- **registerTransient** — Method to register a transient service `di-container.ts:123-129`
- **releaseAllocation** — Releases a resource allocation `resource-manager.ts:223-229`
- **removeFromRegistry** — Removes a branch from the registry `branch-manager.ts:439-447`
- **repoIdentity** — Returns the repository identity of the current project, or null if not available `client-session.ts:148-150`
- **requestAllocation** — Requests a resource allocation `resource-manager.ts:194-220`
- **requestGarbageCollection** — Requests garbage collection `resource-manager.ts:277-285`
- **reset** — Resets the service container `service-container.ts:407-422`
- **resetBloomFilter** — Clears and re-adds topics to the bloom filter to ensure accurate topic matching `knowledge-bus.ts:285-290`
- **resolve** — Resolves a service instance based on its name and lifetime `di-container.ts:189-224`
- **resolveAgent** — Resolves an agent instance based on its type and capabilities `di-container.ts:229-232`
- **resolvePath** — Resolves a given path relative to the current project path `client-session.ts:231-243`
- **rowToNode** — Converts a database row to a Merkle tree node `file-merkle.ts:652-664`
- **runAutoDocSync** — Synchronizes auto-doc data with the vector store `service-container.ts:195-235`
- **sanitizeBranchName** — Sanitizes the branch name to ensure it is valid `branch-manager.ts:200-206`
- **saveRegistry** — Saves the branch registry configuration `branch-manager.ts:408-415`
- **scanFiles** — Scans the root directory for files and initializes watchers `file-watcher.ts:146-173`
- **scanFilesWithHashes** — Scans files and computes their hashes `merkle-file-tracker.ts:225-259`
- **scheduleDebouncedFlush** — Schedules a debounced flush of pending changes `git-watcher.ts:497-520`
- **scheduleFlush** — Schedules a flush of queued changes `file-watcher.ts:372-389`
- **send** — Sends a message through the pipe transport `pipe-transport.ts:239-247`
- **sendMessage** — Sends a message to the knowledge bus and optionally broadcasts it `knowledge-bus.ts:224-236`
- **setContext** — Sets the context for file merkle operations `file-merkle.ts:75-79`
- **simpleMatch** — Provides a simple match function for file paths `file-watcher.ts:320-345`
- **since** — Builds a logical view of resource snapshots and collects those with timestamps greater than or equal to a cutoff `resource-manager.ts:86-111`
- **size** — Returns the current number of resource snapshots `resource-manager.ts:113-115`
- **start** — Starts the file watcher and initializes the necessary watchers `file-watcher.ts:85-110`
- **start** — Method to start the MerkleFileTracker `merkle-file-tracker.ts:84-129`
- **start** — Starts the pipe transport `pipe-transport.ts:194-217`
- **start** — Initializes the server and sets up event listeners for connection, error, and close events `pipe-transport.ts:296-325`
- **startBunWatcher** — Starts the Bun watcher for file changes when running under Bun `file-watcher.ts:178-209`
- **startIndexing** — Starts the indexing process `client-session.ts:259-263`
- **startMonitoring** — Starts monitoring resource usage `resource-manager.ts:166-175`
- **startNodeWatcher** — Starts the Node.js watcher for file changes `file-watcher.ts:217-255`
- **startPerDirWatcher** — Starts a watcher for a specific directory `file-watcher.ts:258-292`
- **startWatching** — Starts watching for Git repository changes `git-watcher.ts:191-253`
- **stop** — Stops the file watcher and cleans up resources `file-watcher.ts:115-140`
- **stop** — Stops the Merkle file tracker `merkle-file-tracker.ts:319-321`
- **stopMonitoring** — Stops monitoring resource usage `resource-manager.ts:178-189`
- **stopWatching** — Stops the Git watcher from monitoring changes `git-watcher.ts:272-292`
- **subscribe** — Subscribes an agent to a topic and returns a subscription ID `knowledge-bus.ts:129-152`
- **subscribeToIndexCompleted** — Subscribes to the completion of index generation `service-container.ts:238-289`
- **suggestAllocation** — Suggests a resource allocation `resource-manager.ts:264-274`
- **sumAllocated** — Sums allocated resources `resource-manager.ts:410-418`
- **switchBranch** — Switches the current branch to the specified one `branch-manager.ts:351-366`
- **switchProject** — Switches the current project to a new path and branch, updating session information `client-session.ts:188-226`
- **tick** — Updates resource usage metrics `resource-manager.ts:321-335`
- **topicMatches** — Determines if a stored topic matches a given pattern, handling both wildcard and exact matches `knowledge-bus.ts:307-315`
- **unsubscribe** — Unsubscribes an agent from a topic and removes the subscription `knowledge-bus.ts:158-172`
- **updateBranchMetadata** — Updates metadata for the specified branch `branch-manager.ts:252-265`
- **updateFile** — Updates a file in the file merkle tree `file-merkle.ts:351-374`
- **updateInstance** — Updates the cached singleton instance of a service `di-container.ts:155-172`
- **updateRegistry** — Updates the branch registry configuration `branch-manager.ts:417-437`
- **verify** — Verifies the integrity of the file merkle tree `file-merkle.ts:566-611`
- **verify** — Verifies the Merkle tree against a given root hash `merkle-file-tracker.ts:351-354`
- **waitForConnection** — Waits for a connection to the pipe `pipe-transport.ts:264-291`
- **worktreeInfo** — Returns the worktree detection information `client-session.ts:162-164`

### Class
- **BranchManager** — Manages branch-aware databases for Git repositories `branch-manager.ts:85-448`
- **ClientSession** — Class representing a per-client session with isolated state `client-session.ts:66-341`
- **DIContainer** — Dependency Injection Container `di-container.ts:73-379`
- **FileMerkleTree** — Represents a Merkle Tree for file system change detection `file-merkle.ts:26-700`
- **FileWatcher** — A class for watching files and emitting change events `file-watcher.ts:58-434`
- **GitWatcher** — Manages Git repository change detection and triggers automatic reindexing `git-watcher.ts:133-842`
- **KnowledgeBus** — Manages knowledge sharing between agents using a pub/sub pattern `knowledge-bus.ts:36-355`
- **MerkleFileTracker** — Class for Merkle File Tracker, wrapping FileWatcher with Merkle tree support `merkle-file-tracker.ts:48-363`
- **PipeClientTransport** — Represents a client-side transport for a pipe, handling message reading and error handling `pipe-transport.ts:92-248`
- **PipeServer** — Represents a server for the pipe transport `pipe-transport.ts:253-346`
- **ReadBuffer** — ReadBuffer for parsing newline-delimited JSON messages `pipe-transport.ts:25-51`
- **ResourceManager** — Manages and monitors resource usage for commodity hardware `resource-manager.ts:120-419`
- **ServiceContainer** — Centralized service container with lazy initialization `service-container.ts:47-423`
- **SnapshotRing** — A fixed-capacity ring buffer for storing resource snapshots `resource-manager.ts:60-116`

### Interface
- **AgentFactoryConfig** — Agent factory configuration `di-container.ts:53-60`
- **AgentWithEmbeddingStats** — Interface for an agent that includes embedding statistics `auto-indexer.ts:34-46`
- **AgentWithRepositoryPath** — An interface for an agent that can set its repository path `auto-indexer.ts:51-53`
- **AutoIndexContext** — Manages the context for automatic indexing operations `auto-indexer.ts:292-300`
- **AutoIndexOptions** — Options for auto-indexing `auto-indexer.ts:262-267`
- **AutoIndexResult** — Represents the result of an auto-indexing task `auto-indexer.ts:272-286`
- **BranchInfo** — Represents information about a branch, including its name, database path, last accessed time, size in bytes, and metadata `branch-manager.ts:44-50`
- **BranchManagerConfig** — Configuration for the branch manager `branch-manager.ts:73-79`
- **BranchMetadata** — Represents metadata for a Git repository branch, including branch name, repository path, repository hash, last commit hash, and other indexing details `branch-manager.ts:31-42`
- **BranchRegistry** — Manages repositories and their branches, storing metadata and configuration `branch-manager.ts:58-71`
- **BranchRegistryEntry** — Represents an entry in the branch registry, including database path, last accessed time, and size in bytes `branch-manager.ts:52-56`
- **ClientSessionConfig** — Interface for configuring a client session with project path, session ID, client ID, branch, and agent ID `client-session.ts:29-44`
- **DiagnosticSnapshot** — Represents a snapshot of diagnostic information including process ID, memory usage, uptime, and conductor details `shutdown-handlers.ts:20-35`
- **Disposable** — Disposable resource interface `di-container.ts:65-67`
- **FastStartupResult** — Result object containing fast startup status, changed files count, startup time, and root hash `merkle-file-tracker.ts:33-42`
- **FileChange** — Represents a change in a file, specifying the file path and its status `git-watcher.ts:124-127`
- **FileChangeEvent** — An event object containing the file path, change type, and timestamp `file-watcher.ts:31-35`
- **FileWatcherConfig** — Configuration object for the file watcher, including root directory, include/exclude patterns, debounce time, and bulk threshold `file-watcher.ts:37-43`
- **GitWatcherConfig** — Defines configuration for monitoring Git changes, including polling intervals and file status tracking `git-watcher.ts:108-122`
- **ILayeredIndex** — Interface for a three-layer index architecture, providing operations for building, querying, and managing entities and relationships across multiple layers `layered-index.ts:20-230`
- **ILayeredVectorIndex** — Search similar vectors with three-layer merging, get vector delta for a branch, set/replace vector delta, and generate embeddings for branch delta `layered-index.ts:236-277`
- **IndexingState** — State for a single indexing operation `indexing-state.ts:9-12`
- **InitMessage** — Parsed init message from comm.c client `pipe-transport.ts:80-87`
- **KnowledgeEntry** — Represents a piece of knowledge with an ID, topic, data, source, timestamp, and optional time-to-live `knowledge-bus.ts:13-20`
- **LayeredQueryResult** — Represents the result of a layered query, including data, layer contributions, and query performance metrics `layered-index.ts:286-304`
- **MerkleFileTrackerConfig** — Configuration for Merkle File Tracker, including enableMerkle and hashAlgorithm `merkle-file-tracker.ts:26-31`
- **OrphanedEmbeddingsCheckConfig** — Configuration for checking orphaned embeddings and resuming generation `startup-checks.ts:55-60`
- **ResourceAllocation** — Represents resource allocation for an agent `resource-manager.ts:47-52`
- **ResourceSnapshot** — Represents a snapshot of resource usage `resource-manager.ts:28-45`
- **ServiceContainerConfig** — Configuration for ServiceContainer with working directory, conductor orchestrator, and global vector store functions `service-container.ts:33-42`
- **ServiceDescriptor** — Service descriptor with factory and metadata `di-container.ts:37-48`
- **SessionProjectInfo** — Interface for session project information including path, hash, branch, indexing status, and last accessed time `client-session.ts:46-52`
- **ShutdownContext** — Represents the context for shutdown operations, including conductor and layered index manager `shutdown-handlers.ts:54-57`
- **StartupCheckConfig** — Configuration for startup checks including embedding settings and server mode `startup-checks.ts:14-19`
- **Subscription** — Represents a subscription to a topic with an ID, agent ID, topic, and handler function `knowledge-bus.ts:22-27`
- **TaskProcessingResult** — Represents the result of task processing, including success status, entities extracted, files processed, and extracted data `auto-indexer.ts:20-29`
- **Transport** — Transport interface matching MCP SDK `pipe-transport.ts:56-63`
- **VersionInfo** — Not present in the provided code `environment-setup.ts:90-100`

### Enum_decl
- **ServiceLifetime** — Service lifetime determines how instances are created and cached `di-container.ts:27-32`

### Constant
- **SINGLETON** — Single instance shared across all resolutions `di-container.ts:29-29`
- **TRANSIENT** — New instance created for each resolution `di-container.ts:31-31`

### Type_alias
- **BranchChangeCallback** — A callback function to handle branch change events `git-watcher.ts:102-102`
- **CommitCallback** — A callback function to handle commit events `git-watcher.ts:103-103`
- **DebouncedFileChangeCallback** — A callback function to handle debounced file change events, including bulk mode status `git-watcher.ts:106-106`
- **FileChangeCallback** — A callback function to handle file change events `git-watcher.ts:104-104`
- **FileChangeType** — Represents the type of file change, either add, change, or unlink `file-watcher.ts:29-29`

### Import_decl
- **../agents/conductor-orchestrator.js** — Imports `../agents/conductor-orchestrator.js` from `../agents/conductor-orchestrator.js`. `agent-registry.ts:8-8`, `service-container.ts:10-10`, `shutdown-handlers.ts:8-8`
- **../analysis/technology-detector.js** — Imports `../analysis/technology-detector.js` from `../analysis/technology-detector.js`. `service-container.ts:11-11`, `service-container.ts:12-12`
- **../autodoc/storage/autodoc-manager.js** — Imports `../autodoc/storage/autodoc-manager.js` from `../autodoc/storage/autodoc-manager.js`. `service-container.ts:13-13`, `service-container.ts:14-14`
- **../config/yaml-config.js** — Imports `../config/yaml-config.js` from `../config/yaml-config.js`. `di-container.ts:16-16`
- **../layered/index.js** — Imports `../layered/index.js` from `../layered/index.js`. `shutdown-handlers.ts:9-9`
- **../logging/index.js** — Imports `../logging/index.js` from `../logging/index.js`. `agent-registry.ts:9-9`, `auto-indexer.ts:9-9`, `branch-manager.ts:15-15`, `client-session.ts:15-15`, `di-container.ts:17-17`, `file-merkle.ts:17-17`, `file-watcher.ts:21-21`, `git-watcher.ts:16-16`, `knowledge-bus.ts:7-7`, `merkle-file-tracker.ts:16-16`, `pipe-transport.ts:10-10`, `resource-manager.ts:13-13`, `shutdown-handlers.ts:10-10`, `startup-checks.ts:11-11`, `startup-utils.ts:10-10`
- **../logging/log-types.js** — Imports `../logging/log-types.js` from `../logging/log-types.js`. `shutdown-handlers.ts:11-11`
- **../modification/code-modifier.js** — Imports `../modification/code-modifier.js` from `../modification/code-modifier.js`. `service-container.ts:15-15`, `service-container.ts:16-16`
- **../modification/file-operations.js** — Imports `../modification/file-operations.js` from `../modification/file-operations.js`. `service-container.ts:17-17`, `service-container.ts:18-18`
- **../modification/preview-manager.js** — Imports `../modification/preview-manager.js` from `../modification/preview-manager.js`. `service-container.ts:19-19`
- **../search/pattern-search.js** — Imports `../search/pattern-search.js` from `../search/pattern-search.js`. `service-container.ts:20-20`, `service-container.ts:21-21`
- **../semantic/faiss/faiss-provider.js** — Imports `../semantic/faiss/faiss-provider.js` from `../semantic/faiss/faiss-provider.js`. `shutdown-handlers.ts:12-12`
- **../semantic/gpu/gpu-client.js** — Imports `../semantic/gpu/gpu-client.js` from `../semantic/gpu/gpu-client.js`. `shutdown-handlers.ts:13-13`
- **../semantic/mlx-native.js** — Imports `../semantic/mlx-native.js` from `../semantic/mlx-native.js`. `shutdown-handlers.ts:14-14`
- **../semantic/ovms-native-manager.js** — Imports `../semantic/ovms-native-manager.js` from `../semantic/ovms-native-manager.js`. `shutdown-handlers.ts:15-15`
- **../shared/git-worktree.js** — Imports `../shared/git-worktree.js` from `../shared/git-worktree.js`. `auto-indexer.ts:10-10`, `client-session.ts:16-16`
- **../shared/storage-paths.js** — Imports `../shared/storage-paths.js` from `../shared/storage-paths.js`. `branch-manager.ts:16-16`, `startup-utils.ts:11-11`
- **../shared/storage-paths.js** — Imports `../shared/storage-paths.js`. `client-session.ts:17-23`
- **../storage/graph-storage-factory.js** — Imports `../storage/graph-storage-factory.js` from `../storage/graph-storage-factory.js`. `service-container.ts:22-22`, `shutdown-handlers.ts:16-16`
- **../storage/libsql/types.js** — Imports `../storage/libsql/types.js` from `../storage/libsql/types.js`. `file-merkle.ts:18-18`, `merkle-file-tracker.ts:17-17`
- **../storage/prolly/types.js** — Imports `../storage/prolly/types.js` from `../storage/prolly/types.js`. `file-merkle.ts:19-19`, `merkle-file-tracker.ts:18-18`
- **../types/agent.js** — Imports `../types/agent.js` from `../types/agent.js`. `agent-registry.ts:10-10`, `agent-registry.ts:11-11`, `auto-indexer.ts:11-11`, `auto-indexer.ts:12-12`, `di-container.ts:18-18`, `knowledge-bus.ts:8-8`, `resource-manager.ts:14-14`, `shutdown-handlers.ts:17-17`
- **../types/layered.js** — Imports `../types/layered.js` from `../types/layered.js`. `layered-index.ts:13-13`
- **../types/storage.js** — Imports `../types/storage.js` from `../types/storage.js`. `layered-index.ts:14-14`
- **../utils/bloom-filter.js** — Imports `../utils/bloom-filter.js` from `../utils/bloom-filter.js`. `knowledge-bus.ts:9-9`
- **../utils/fast-hash.js** — Imports `../utils/fast-hash.js` from `../utils/fast-hash.js`. `file-merkle.ts:20-20`
- **../utils/file-ops.js** — Imports `../utils/file-ops.js`. `branch-manager.ts:17-25`
- **../utils/logger.js** — Imports `../utils/logger.js` from `../utils/logger.js`. `auto-indexer.ts:13-13`
- **../utils/ollama-checker.js** — Imports `../utils/ollama-checker.js` from `../utils/ollama-checker.js`. `startup-checks.ts:12-12`
- **../utils/runtime-detection.js** — Imports `../utils/runtime-detection.js` from `../utils/runtime-detection.js`. `file-watcher.ts:22-22`, `git-watcher.ts:17-17`, `service-container.ts:23-23`, `startup-utils.ts:12-12`
- **../validation/code-validator.js** — Imports `../validation/code-validator.js` from `../validation/code-validator.js`. `service-container.ts:24-24`, `service-container.ts:25-25`
- **../versioning/version-manager.js** — Imports `../versioning/version-manager.js` from `../versioning/version-manager.js`. `service-container.ts:26-26`, `service-container.ts:27-27`
- **./branch-manager.js** — Imports `./branch-manager.js` from `./branch-manager.js`. `agent-registry.ts:12-12`
- **./di-container.js** — Imports `./di-container.js` from `./di-container.js`. `agent-registry.ts:13-13`
- **./file-merkle.js** — Imports `./file-merkle.js` from `./file-merkle.js`. `merkle-file-tracker.ts:19-19`
- **./file-watcher.js** — Imports `./file-watcher.js` from `./file-watcher.js`. `merkle-file-tracker.ts:20-20`
- **./indexing-state.js** — Imports `./indexing-state.js` from `./indexing-state.js`. `auto-indexer.ts:14-14`, `file-watcher.ts:23-23`, `git-watcher.ts:18-18`
- **./knowledge-bus.js** — Imports `./knowledge-bus.js` from `./knowledge-bus.js`. `auto-indexer.ts:15-15`, `resource-manager.ts:15-15`, `service-container.ts:28-28`
- **./resource-manager.js** — Imports `./resource-manager.js` from `./resource-manager.js`. `shutdown-handlers.ts:18-18`
- **fast-glob** — Imports `fast-glob` from `fast-glob`. `file-watcher.ts:20-20`
- **node:child_process** — Imports `node:child_process` from `node:child_process`. `branch-manager.ts:13-13`, `git-watcher.ts:13-13`
- **node:crypto** — Imports `node:crypto` from `node:crypto`. `merkle-file-tracker.ts:14-14`
- **node:events** — Imports `node:events` from `node:events`. `file-watcher.ts:16-16`, `knowledge-bus.ts:6-6`, `resource-manager.ts:11-11`
- **node:fs** — Imports `node:fs` from `node:fs`. `client-session.ts:13-13`, `environment-setup.ts:86-86`, `file-watcher.ts:17-17`, `git-watcher.ts:14-14`, `pipe-transport.ts:8-8`, `service-container.ts:8-8`, `startup-utils.ts:8-8`
- **node:fs/promises** — Imports `node:fs/promises` from `node:fs/promises`. `auto-indexer.ts:8-8`, `file-watcher.ts:18-18`, `merkle-file-tracker.ts:15-15`
- **node:net** — Imports `node:net` from `node:net`. `pipe-transport.ts:9-9`
- **node:os** — Imports `node:os` from `node:os`. `environment-setup.ts:145-145`, `resource-manager.ts:12-12`
- **node:path** — Imports `node:path` from `node:path`. `branch-manager.ts:14-14`, `client-session.ts:14-14`, `environment-setup.ts:87-87`, `file-merkle.ts:16-16`, `file-watcher.ts:19-19`, `git-watcher.ts:15-15`, `service-container.ts:9-9`, `startup-utils.ts:9-9`
- **node:url** — Imports `node:url` from `node:url`. `environment-setup.ts:88-88`

### Property
- **_autodocEmbeddingsGenerated** — Boolean indicating if autoDoc embeddings are generated `service-container.ts:60-60`
- **_autodocEmbeddingsSubscriptionId** — Subscription ID for autoDoc embeddings `service-container.ts:61-61`
- **_autoDocManager** — AutoDoc manager instance `service-container.ts:57-57`
- **_branch** — Private branch name for the session `client-session.ts:75-75`
- **_codeModifier** — Code modifier instance `service-container.ts:52-52`
- **_codeValidator** — Code validator instance `service-container.ts:54-54`
- **_fileOperations** — File operations instance `service-container.ts:53-53`
- **_indexingInProgress** — Private boolean indicating if indexing is in progress `client-session.ts:76-76`
- **_lastActivityAt** — Tracks the last activity time for the session `client-session.ts:77-77`
- **_patternSearch** — Pattern search instance `service-container.ts:56-56`
- **_projectPath** — Private project path for the session `client-session.ts:74-74`
- **_technologyDetector** — Technology detector instance `service-container.ts:55-55`
- **_versionManager** — Version manager instance `service-container.ts:51-51`
- **_worktreeInfo** — Stores worktree detection information for the project `client-session.ts:80-80`
- **accessedAt** — Records the timestamp of the last access `branch-manager.ts:41-41`
- **active** — Indicates whether post-indexing operations are currently active `indexing-state.ts:181-181`
- **agentId** — Agent identifier for multi-agent coordination `client-session.ts:43-43`
- **agentId** — Holds the identifier for the agent, which may be null `client-session.ts:72-72`
- **agentId** — Agent ID associated with the subscription `knowledge-bus.ts:24-24`
- **agentId** — Agent ID `pipe-transport.ts:86-86`
- **agentId** — Unique identifier for the agent `resource-manager.ts:48-48`
- **agents** — Array of agent details including ID, type, status, memory usage, queue size, and last activity `shutdown-handlers.ts:26-33`
- **aiMessage** — Stores an AI-generated message or response `auto-indexer.ts:285-285`
- **allocations** — Map-based registry of resource allocations `resource-manager.ts:125-125`
- **allProjects** — Lists all projects currently being indexed `indexing-state.ts:103-103`
- **arch** — Not present in the provided code `environment-setup.ts:98-98`
- **autoReindex** — Determines if automatic reindexing is enabled `git-watcher.ts:111-111`
- **avgMsPerEmb** — Average time per embedding in milliseconds `auto-indexer.ts:41-41`
- **batches** — Number of batches processed for embedding `auto-indexer.ts:40-40`
- **bloom** — Bloom filter for efficient topic existence checks `knowledge-bus.ts:44-44`
- **branch** — Represents the current branch name `branch-manager.ts:32-32`
- **branch** — Optionally stores the branch name `client-session.ts:40-40`
- **branch** — Branch information `pipe-transport.ts:84-84`
- **branchChangeCallbacks** — Callbacks for branch changes `git-watcher.ts:161-161`
- **branches** — A record of branches within a repository `branch-manager.ts:63-63`
- **branchName** — Stores the name of the branch `file-merkle.ts:29-29`
- **buf** — The internal buffer for storing resource snapshots `resource-manager.ts:61-61`
- **buffer** — Buffer for storing incoming data `pipe-transport.ts:26-26`
- **bulkModeThreshold** — Threshold for bulk mode `git-watcher.ts:154-154`
- **bulkModeThreshold** — Sets the threshold for bulk mode `git-watcher.ts:121-121`
- **bulkThreshold** — The threshold for bulk changes to trigger a single notification `file-watcher.ts:42-42`
- **bunWatcher** — Represents the Bun watcher for file changes when running under Bun `file-watcher.ts:69-69`
- **cacheHits** — Number of cache hits during embedding processing `auto-indexer.ts:43-43`
- **capabilities** — Agent capabilities `di-container.ts:57-57`
- **changedFiles** — Number of changed files detected during startup `merkle-file-tracker.ts:37-37`
- **childrenCount** — Represents the number of children a node has `file-merkle.ts:146-146`, `file-merkle.ts:246-246`
- **client** — Stores the database client for file merkle operations `file-merkle.ts:27-27`
- **clientId** — Client identifier from transport `client-session.ts:37-37`
- **clientId** — Stores the unique identifier for the client `client-session.ts:68-68`
- **commitCallbacks** — Callbacks for commit changes `git-watcher.ts:162-162`
- **conductor** — An instance of ConductorOrchestrator used in shutdown operations `shutdown-handlers.ts:55-55`
- **conductor** — Optional object containing conductor-related information such as pending tasks and agents `shutdown-handlers.ts:24-34`
- **config** — Configuration for the branch manager, including max branches per repo and total branches `branch-manager.ts:66-70`
- **config** — Stores the configuration for the branch manager `branch-manager.ts:86-86`
- **config** — Optional configuration override `di-container.ts:59-59`
- **config** — The configuration object for the file watcher `file-watcher.ts:59-59`
- **config** — Configuration settings for the GitWatcher `git-watcher.ts:134-134`
- **config** — Configuration object for MerkleFileTracker `merkle-file-tracker.ts:51-51`
- **config** — Configuration for ServiceContainer `service-container.ts:48-48`
- **constraints** — Resource constraints for allocation `resource-manager.ts:122-122`
- **content** — Represents the content of a code snippet `service-container.ts:324-324`
- **cores** — Number of CPU cores `resource-manager.ts:37-37`
- **cpu** — Represents CPU usage `resource-manager.ts:410-410`
- **cpu** — Stores CPU-related metrics `resource-manager.ts:36-40`
- **cpuPercent** — Represents CPU usage percentage `resource-manager.ts:252-252`
- **cpuPercent** — CPU allocation percentage `resource-manager.ts:50-50`, `resource-manager.ts:264-264`
- **createdAt** — Creation time of the session `client-session.ts:69-69`
- **currentBranch** — The current branch being managed `branch-manager.ts:89-89`
- **currentBranch** — Current branch name `git-watcher.ts:142-142`
- **currentCommit** — Current commit SHA `git-watcher.ts:143-143`
- **currentRepoPath** — The current repository path `branch-manager.ts:90-90`
- **cwd** — Current working directory `pipe-transport.ts:82-82`
- **d** — Represents a depth or dimension `service-container.ts:248-248`
- **data** — Contains additional data about the task processing, including entity count and extracted entities `auto-indexer.ts:24-27`
- **data** — Data content of the knowledge entry `knowledge-bus.ts:16-16`
- **data** — Stores an array of type T `layered-index.ts:288-288`
- **dataDir** — Directory where branch data is stored `branch-manager.ts:75-75`
- **dbPath** — Stores the path to the database `branch-manager.ts:46-46`
- **dbPath** — Stores the path to the database file `branch-manager.ts:53-53`
- **debounceAbort** — Manages the abort controller for debouncing file change notifications `file-watcher.ts:66-66`
- **debounceAbortController** — Controller for debouncing changes `git-watcher.ts:150-150`
- **debouncedChangeCallbacks** — Debounced callbacks for changes `git-watcher.ts:167-167`
- **debounceMs** — The debounce time in milliseconds for change notifications `file-watcher.ts:41-41`
- **debounceMs** — Debounce interval in milliseconds `git-watcher.ts:152-152`
- **debounceMs** — Specifies the debounce interval in milliseconds `git-watcher.ts:119-119`
- **dependencies** — Optional dependencies for graph tracking `di-container.ts:45-45`
- **description** — Not present in the provided code `environment-setup.ts:93-93`
- **detectedExt** — Stores the detected file extension `auto-indexer.ts:107-107`
- **directories** — Lists all directories currently involved in post-indexing operations `indexing-state.ts:181-181`
- **directory** — Resolves the directory configuration from the container `agent-registry.ts:73-73`
- **directory** — Directory associated with an indexing operation `indexing-state.ts:11-11`
- **directory** — Represents the directory path for indexing operations `indexing-state.ts:101-101`
- **directory** — Represents the directory path `service-container.ts:35-35`
- **dirNodes** — Represents directory nodes in the file merkle tree `file-merkle.ts:679-679`
- **dirNodes** — Stores the number of directory nodes in the Merkle tree `merkle-file-tracker.ts:328-328`
- **disposed** — Boolean indicating if the container is disposed `di-container.ts:76-76`
- **duration** — The duration of the auto-indexing process `auto-indexer.ts:275-275`
- **durationMs** — Duration in milliseconds for embedding processing `auto-indexer.ts:37-37`
- **durationSeconds** — Measures the time taken for embedding operations in seconds `auto-indexer.ts:280-280`
- **elapsedSeconds** — Represents the elapsed time in seconds for the current indexing operation `indexing-state.ts:102-102`
- **elapsedSeconds** — Returns an array of elapsed seconds for indexing status `indexing-state.ts:181-181`
- **embeddingEnabled** — Boolean indicating whether embeddings are enabled `startup-checks.ts:15-15`
- **embeddingEnabled** — Represents whether embedding is enabled `startup-checks.ts:56-56`
- **embeddingPerformance** — Tracks the performance metrics of embedding operations `auto-indexer.ts:277-284`
- **embeddingProvider** — String specifying the embedding provider `startup-checks.ts:16-16`
- **embeddingsPerSecond** — Calculates the rate of embeddings processed per second `auto-indexer.ts:281-281`
- **embeddingStats** — Embedding statistics for the auto-indexing process `auto-indexer.ts:276-276`
- **enabled** — Indicates whether the branch manager is enabled `branch-manager.ts:74-74`
- **enabled** — Indicates whether the watcher is enabled `git-watcher.ts:109-109`
- **enableMerkle** — Boolean flag to enable Merkle-based fast startup `merkle-file-tracker.ts:28-28`
- **entities** — Array of extracted entities `auto-indexer.ts:26-26`
- **entities** — Represents an optional array of unknown entities `auto-indexer.ts:28-28`
- **entitiesExtracted** — Counts the number of entities extracted during task processing `auto-indexer.ts:22-22`
- **entityCount** — Represents the count of entities extracted `auto-indexer.ts:25-25`
- **entityCount** — The number of entities extracted during auto-indexing `auto-indexer.ts:274-274`
- **entityCount** — Counts the number of entities in the repository `branch-manager.ts:38-38`
- **entryCap** — Maximum capacity of the knowledge entry storage `knowledge-bus.ts:41-41`
- **entryCount** — Represents the count of entries in the knowledge bus `knowledge-bus.ts:258-258`
- **error** — Not present in the provided code `environment-setup.ts:99-99`
- **errors** — Stores any errors encountered during operations `file-merkle.ts:568-568`
- **errors** — Stores any errors encountered during Merkle tree operations `merkle-file-tracker.ts:351-351`
- **evictionStrategy** — Strategy for evicting branches when the limit is exceeded `branch-manager.ts:69-69`
- **evictionStrategy** — Specifies the strategy for evicting branches when the maximum number is exceeded `branch-manager.ts:78-78`
- **exclude** — An array of glob patterns to exclude from the file watch `file-watcher.ts:40-40`
- **extraExcludePatterns** — Additional exclude patterns for source file counting and indexing `auto-indexer.ts:265-265`
- **factory** — Factory function to create instances `di-container.ts:41-41`
- **fastStartup** — Indicates whether the startup process is fast `merkle-file-tracker.ts:35-35`
- **fileChangeCallbacks** — Callbacks for file changes `git-watcher.ts:163-163`
- **fileCount** — Counts the number of files in the repository `branch-manager.ts:37-37`
- **fileMerkle** — FileMerkleTree instance for Merkle tree operations `merkle-file-tracker.ts:50-50`
- **fileNodes** — Represents nodes in the file merkle tree `file-merkle.ts:678-678`
- **fileNodes** — Stores the number of file nodes in the Merkle tree `merkle-file-tracker.ts:328-328`
- **filesProcessed** — Counts the number of files processed during task processing `auto-indexer.ts:23-23`
- **fileWatcher** — FileWatcher instance for monitoring file changes `merkle-file-tracker.ts:49-49`
- **flushAndSave** — Flushes and saves the vector store `service-container.ts:390-390`
- **flushRetryAbort** — Controller for retrying flush operations `git-watcher.ts:156-156`
- **flushRetryCount** — Count of flush retries `git-watcher.ts:159-159`
- **free** — Free memory in bytes `resource-manager.ts:33-33`
- **fullScan** — Indicates whether the auto-indexing is a full scan `auto-indexer.ts:266-266`
- **generated** — Indicates whether the auto-indexing was generated `auto-indexer.ts:276-276`
- **generated** — Not applicable in this context `startup-checks.ts:106-106`
- **generateEmbedding** — Generates an embedding for a given code snippet `service-container.ts:320-320`
- **getConductor** — Retrieves a conductor agent for tasks `auto-indexer.ts:296-296`
- **getConductor** — Returns a conductor orchestrator instance `service-container.ts:37-37`
- **getDevAgent** — Retrieves a development agent for tasks `auto-indexer.ts:294-294`
- **getDoraAgent** — Retrieves a Dora agent for tasks `auto-indexer.ts:295-295`
- **getEmbeddingStats** — Method to retrieve embedding statistics for an agent `auto-indexer.ts:35-44`
- **getGlobalVectorStore** — Returns a global vector store instance `service-container.ts:39-39`
- **getGraphStorage** — Retrieves graph storage for tasks `auto-indexer.ts:297-297`
- **getIndexerAgent** — Retrieves an indexer agent for tasks `auto-indexer.ts:519-519`
- **getSemanticAgent** — Retrieves a semantic agent for processing tasks `auto-indexer.ts:293-293`
- **getSemanticAgent** — Function to get a semantic agent `startup-checks.ts:59-59`
- **getSemanticAgentFn** — Function to get semantic agent `service-container.ts:41-41`
- **getTeiBatchLog** — Returns an array of objects containing the number of entities and the time in milliseconds for each batch `auto-indexer.ts:45-45`
- **getVectorStore** — Retrieves the vector store `service-container.ts:303-303`
- **gitDir** — Absolute path to the .git directory `git-watcher.ts:136-136`
- **handler** — Function to handle the knowledge entry when it is published `knowledge-bus.ts:26-26`
- **handlersByTopic** — Maps topics to their associated subscriptions `knowledge-bus.ts:38-38`
- **hash** — Hash of the project `client-session.ts:48-48`
- **hash** — Represents the hash of a node `file-merkle.ts:143-143`
- **hash** — Represents the hash of the file `file-merkle.ts:243-243`
- **hashAlgorithm** — Hash algorithm for file content, either "xxhash" or "sha256" `merkle-file-tracker.ts:30-30`
- **head** — The next write position in the ring buffer `resource-manager.ts:62-62`
- **headWatcher** — Watches for changes in the HEAD file `git-watcher.ts:137-137`
- **homepage** — Not present in the provided code `environment-setup.ts:94-94`
- **i** — Represents an index or identifier `service-container.ts:246-246`
- **id** — Unique identifier for a knowledge entry `knowledge-bus.ts:14-14`
- **id** — Represents a unique identifier for a knowledge bus entity `knowledge-bus.ts:23-23`
- **id** — Returns a promise of an array containing objects with id and similarity `layered-index.ts:251-251`
- **id** — Represents an identifier or unique ID `service-container.ts:323-323`
- **id** — Unique identifier for an agent `shutdown-handlers.ts:27-27`
- **include** — An array of glob patterns to include in the file watch `file-watcher.ts:39-39`
- **includeUntracked** — Determines if untracked files should be included `git-watcher.ts:117-117`
- **incremental** — Indicates whether the auto-indexing is incremental `auto-indexer.ts:263-263`
- **indexVersion** — Stores the version of the index `branch-manager.ts:40-40`
- **inProgress** — Indicates whether indexing is currently in progress `indexing-state.ts:100-100`
- **insert** — Inserts a new entry into the vector store `service-container.ts:322-327`
- **instance** — Cached singleton instance (if applicable) `di-container.ts:47-47`
- **io** — Stores I/O-related metrics `resource-manager.ts:41-44`
- **isIndexed** — Boolean indicating if the project is indexed `client-session.ts:50-50`
- **isInitialized** — Indicates whether the file merkle tree is initialized `file-merkle.ts:31-31`
- **isInitialized** — Boolean flag indicating if the MerkleFileTracker is initialized `merkle-file-tracker.ts:52-52`
- **isLeaf** — Indicates whether a node is a leaf node `file-merkle.ts:145-145`, `file-merkle.ts:245-245`
- **isRunning** — A boolean indicating whether the file watcher is running `file-watcher.ts:62-62`
- **lastAccessed** — Stores the timestamp of the last access `branch-manager.ts:47-47`
- **lastAccessed** — Tracks the last accessed time for a branch `branch-manager.ts:54-54`
- **lastAccessedAt** — Last accessed time of the project `client-session.ts:51-51`
- **lastActivity** — Last activity timestamp of an agent `shutdown-handlers.ts:32-32`
- **lastCommitHash** — Stores the hash of the last commit `branch-manager.ts:35-35`
- **lastIndexedAt** — Records the timestamp of the last index `branch-manager.ts:36-36`
- **lastUncommittedFiles** — List of last uncommitted files `git-watcher.ts:145-145`
- **layer0Count** — Represents the count of layer0 in a layered index `layered-index.ts:292-292`
- **layer0TimeMs** — Stores the time taken for layer0 in a layered index `layered-index.ts:299-299`
- **layer1Count** — Represents the count of layer1 in a layered index `layered-index.ts:293-293`
- **layer1TimeMs** — Stores the time taken for layer1 in a layered index `layered-index.ts:300-300`
- **layer2Count** — Represents the count of layer2 in a layered index `layered-index.ts:294-294`
- **layer2TimeMs** — Stores the time taken for layer2 in a layered index `layered-index.ts:301-301`
- **layeredIndexManager** — An instance of LayeredIndexManager used in shutdown operations `shutdown-handlers.ts:56-56`
- **layers** — Represents the count of layers in a layered index `layered-index.ts:291-295`
- **len** — The current length of the ring buffer `resource-manager.ts:63-63`
- **lifetime** — Service lifetime strategy `di-container.ts:43-43`
- **loadAverage** — Load average for CPU `resource-manager.ts:39-39`
- **MAX_FLUSH_RETRIES** — Maximum number of flush retries `git-watcher.ts:158-158`
- **maxBatchMs** — Maximum time taken for a batch of embeddings in milliseconds `auto-indexer.ts:42-42`
- **maxBranchesPerRepo** — Maximum number of branches per repository `branch-manager.ts:67-67`
- **maxBranchesPerRepo** — Represents the maximum number of branches allowed per repository `branch-manager.ts:76-76`
- **maxConcurrency** — Sets the maximum concurrency for service resolution `di-container.ts:422-422`
- **maxTokens** — Sets the maximum token limit for input processing `auto-indexer.ts:285-285`
- **maxTotalBranches** — Maximum total number of branches across all repositories `branch-manager.ts:68-68`
- **maxTotalBranches** — Defines the total number of branches that can be managed by the branch manager `branch-manager.ts:77-77`
- **memMB** — Memory usage in megabytes `shutdown-handlers.ts:30-30`
- **memory** — Represents memory usage `resource-manager.ts:410-410`
- **memory** — Stores memory-related metrics `resource-manager.ts:30-35`
- **memory** — Memory usage details of the process `shutdown-handlers.ts:22-22`
- **memoryLimit** — Sets the memory limit for the container `di-container.ts:423-423`
- **memoryMB** — Represents memory usage in megabytes `resource-manager.ts:252-252`
- **memoryMB** — Memory allocation in megabytes `resource-manager.ts:49-49`, `resource-manager.ts:264-264`
- **merkleStats** — Stores statistics related to the Merkle tree `merkle-file-tracker.ts:328-328`
- **messageQueueSize** — Represents the size of the message queue in the knowledge bus `knowledge-bus.ts:260-260`
- **metadata** — Holds metadata about the branch, which can be null `branch-manager.ts:49-49`
- **metadata** — Represents metadata associated with a code snippet `service-container.ts:326-326`
- **metrics** — Stores metrics for each layer and total time in a layered index `layered-index.ts:298-303`
- **monitoring** — Monitoring functionality for resource usage `resource-manager.ts:129-129`
- **ms** — Represents the time in milliseconds for a batch `auto-indexer.ts:45-45`
- **msgQueue** — Queue for storing messages `knowledge-bus.ts:39-39`
- **n** — Represents the number of entities in a batch `auto-indexer.ts:45-45`
- **name** — Represents the name of the branch manager `branch-manager.ts:45-45`
- **name** — Unique service name/identifier `di-container.ts:39-39`
- **name** — Not present in the provided code `environment-setup.ts:91-91`
- **nodeCount** — Represents the number of nodes in the file merkle tree `file-merkle.ts:569-569`
- **nodeVersion** — Not present in the provided code `environment-setup.ts:96-96`
- **onclose** — Callback for close events `pipe-transport.ts:62-62`
- **onclose** — Defines a callback function to handle the close event `pipe-transport.ts:98-98`
- **onerror** — Callback for error events `pipe-transport.ts:61-61`
- **onerror** — Defines a callback function to handle errors `pipe-transport.ts:97-97`
- **onmessage** — Callback for message events `pipe-transport.ts:60-60`
- **onmessage** — Defines a callback function to handle incoming messages `pipe-transport.ts:96-96`
- **oversizedCount** — Counts the number of oversized inputs `auto-indexer.ts:285-285`
- **oversizedWarning** — Issues a warning if the size of the input exceeds a certain threshold `auto-indexer.ts:285-285`
- **packedRefsWatcher** — Watches for changes in the packed-refs file `git-watcher.ts:139-139`
- **parentPath** — Stores the parent path of a file node `file-merkle.ts:244-244`
- **parentPath** — Represents the parent path of a node `file-merkle.ts:144-144`
- **path** — The file path to a repository `branch-manager.ts:62-62`
- **path** — Path of the project `client-session.ts:47-47`
- **path** — Represents the path of a node `file-merkle.ts:142-142`
- **path** — Represents the file path `file-merkle.ts:242-242`
- **path** — The file path associated with the change event `file-watcher.ts:32-32`
- **path** — Stores the path for the watcher `git-watcher.ts:125-125`
- **patternCache** — Cache for regular expressions to avoid recompiling on each call `knowledge-bus.ts:47-47`
- **pendingChanges** — A map of pending file change events `file-watcher.ts:65-65`
- **pendingChanges** — List of pending changes `git-watcher.ts:148-148`
- **pendingReads** — Number of pending reads `resource-manager.ts:42-42`
- **pendingTasks** — Number of pending tasks in the conductor `shutdown-handlers.ts:25-25`
- **pendingWrites** — Number of pending writes `resource-manager.ts:43-43`
- **percentage** — Percentage of memory used `resource-manager.ts:34-34`
- **pid** — Process ID of the running process `shutdown-handlers.ts:21-21`
- **pipeMode** — Indicates whether the application is in pipe mode, affecting how stdin is handled `shutdown-handlers.ts:153-153`
- **pipePath** — The path for the pipe or socket `pipe-transport.ts:255-255`
- **pipeServerMode** — Boolean indicating whether the server is in pipe server mode `startup-checks.ts:17-17`
- **pipeServerMode** — Indicates whether the server is running in pipe mode `startup-checks.ts:57-57`
- **platform** — Not present in the provided code `environment-setup.ts:97-97`
- **POLL_CEILING** — Maximum polling interval `resource-manager.ts:135-135`
- **POLL_FLOOR** — Minimum polling interval `resource-manager.ts:134-134`
- **pollingIntervalMs** — Interval for polling resource usage `resource-manager.ts:133-133`
- **pollIntervalMs** — Specifies the interval in milliseconds for polling changes `git-watcher.ts:110-110`
- **priority** — Sets the priority for service resolution `di-container.ts:424-424`
- **priority** — Represents the priority level of resource allocation `resource-manager.ts:51-51`
- **processStartTime** — Records the start time of the indexing process `auto-indexer.ts:299-299`
- **processStartTime** — Number representing the start time of the process `startup-checks.ts:18-18`
- **processStartTime** — Stores the start time of the process `startup-checks.ts:58-58`
- **projectHash** — Stores the hash of the project `file-merkle.ts:28-28`
- **projectPath** — Stores the path to the project `client-session.ts:31-31`
- **promise** — Promise for post-indexing background work `indexing-state.ts:21-21`
- **queue** — Size of the agent's task queue `shutdown-handlers.ts:31-31`
- **queueCap** — Maximum capacity of the message queue `knowledge-bus.ts:40-40`
- **readBuffer** — ReadBuffer for parsing newline-delimited JSON messages `pipe-transport.ts:93-93`
- **refsWatcher** — Watches for changes in the refs directory `git-watcher.ts:138-138`
- **registry** — The branch registry object `branch-manager.ts:88-88`
- **registryPath** — Path to the branch registry file `branch-manager.ts:87-87`
- **relationshipCount** — Counts the number of relationships in the repository `branch-manager.ts:39-39`
- **repoPath** — Path to the Git repository `git-watcher.ts:135-135`
- **repositories** — A record of repositories, each containing their branches `branch-manager.ts:59-65`
- **repository** — Not present in the provided code `environment-setup.ts:95-95`
- **repositoryHash** — Holds the hash of the repository `branch-manager.ts:34-34`
- **repositoryPath** — Stores the path to the repository `branch-manager.ts:33-33`
- **reset** — Resets the auto-indexing state `auto-indexer.ts:264-264`
- **resolutionStack** — Set of resolution stack `di-container.ts:75-75`
- **rootDir** — The root directory to watch for file changes `file-watcher.ts:38-38`
- **rootHash** — Stores the root hash of the Merkle tree `merkle-file-tracker.ts:329-329`
- **rootHash** — Root hash after startup `merkle-file-tracker.ts:41-41`
- **rootPath** — Stores the root path of the file system `file-merkle.ts:30-30`
- **sampleFile** — A sample file used for project detection `auto-indexer.ts:107-107`
- **server** — The server instance for the pipe transport `pipe-transport.ts:254-254`
- **services** — Map of services `di-container.ts:74-74`
- **sessionId** — Unique session ID for logging and debugging `client-session.ts:34-34`
- **sessionId** — Represents the unique identifier for the client session `client-session.ts:67-67`
- **setCurrentIndexingDirectory** — Sets the current directory for indexing operations `auto-indexer.ts:298-298`
- **setRepositoryPath** — A method to set the repository path for an agent `auto-indexer.ts:52-52`
- **similarity** — Returns a promise of an array containing objects with id and similarity `layered-index.ts:251-251`
- **sizeBytes** — Represents the size of a branch in bytes `branch-manager.ts:55-55`
- **sizeBytes** — Represents the size of the branch in bytes `branch-manager.ts:48-48`
- **skipped** — Indicates whether the auto-indexing was skipped `auto-indexer.ts:276-276`
- **skipped** — Not applicable in this context `startup-checks.ts:106-106`
- **snapshots** — Collection of resource snapshots `resource-manager.ts:128-128`
- **source** — Source of the knowledge entry `knowledge-bus.ts:17-17`
- **speedPerSec** — Speed of embedding processing in embeddings per second `auto-indexer.ts:38-38`
- **started** — Indicates whether the transport has been started `pipe-transport.ts:94-94`
- **startTime** — Start time of an indexing operation `indexing-state.ts:10-10`
- **startTime** — Stores the start time of the indexing process `indexing-state.ts:21-21`
- **startupMs** — Time taken for startup in milliseconds `merkle-file-tracker.ts:39-39`
- **status** — Represents the status of the file change (added, modified, deleted, renamed) `git-watcher.ts:126-126`
- **status** — Status of an agent `shutdown-handlers.ts:29-29`
- **stop** — Represents a method to stop the watcher `file-watcher.ts:69-69`
- **stopped** — Indicates whether the GitWatcher is stopped `git-watcher.ts:140-140`
- **subIdToKey** — A map for reverse indexing subscriptions by their IDs `knowledge-bus.ts:50-50`
- **subscriptionCount** — Represents the count of subscriptions in the knowledge bus `knowledge-bus.ts:259-259`
- **success** — Indicates whether the task processing was successful `auto-indexer.ts:21-21`
- **success** — Indicates whether the auto-indexing was successful `auto-indexer.ts:273-273`
- **supported** — Indicates whether a project is supported `auto-indexer.ts:107-107`
- **throttled** — Indicates if resource allocation is throttled `resource-manager.ts:138-138`
- **throttleThreshold** — Threshold for throttling resource allocation `resource-manager.ts:139-139`
- **tickTimer** — Timer for monitoring resource usage `resource-manager.ts:130-130`
- **timestamp** — The timestamp of the file change `file-watcher.ts:34-34`
- **timestamp** — Timestamp when the knowledge entry was created `knowledge-bus.ts:18-18`
- **timestamp** — Stores the timestamp of the resource snapshot `resource-manager.ts:29-29`
- **topic** — Topic to which the knowledge entry is associated `knowledge-bus.ts:15-15`
- **topic** — Defines the topic or topics that the knowledge bus entity is associated with, which can be a string or a regular expression `knowledge-bus.ts:25-25`
- **topicCount** — Represents the count of topics in the knowledge bus `knowledge-bus.ts:257-257`
- **topicStore** — Stores knowledge entries by topic `knowledge-bus.ts:37-37`
- **total** — Total number of embeddings processed `auto-indexer.ts:36-36`
- **total** — Total memory in bytes `resource-manager.ts:31-31`
- **totalEmbeddings** — Counts the total number of embeddings processed `auto-indexer.ts:279-279`
- **totalNodes** — Returns the total number of nodes in the file merkle tree `file-merkle.ts:677-677`
- **totalNodes** — Stores the total number of nodes in the Merkle tree `merkle-file-tracker.ts:328-328`
- **totalTimeMs** — Stores the total time taken for all layers in a layered index `layered-index.ts:302-302`
- **ttl** — Time to live in milliseconds for the knowledge entry `knowledge-bus.ts:19-19`
- **type** — Agent type `di-container.ts:55-55`
- **type** — The type of file change, either add, change, or unlink `file-watcher.ts:33-33`
- **type** — Type of an agent `shutdown-handlers.ts:28-28`
- **uncommittedChangeCallbacks** — Callbacks for uncommitted changes `git-watcher.ts:165-165`
- **uncommittedPollIntervalMs** — Specifies the interval in milliseconds for polling uncommitted changes `git-watcher.ts:115-115`
- **uptime** — Uptime of the process in seconds `shutdown-handlers.ts:23-23`
- **usage** — CPU usage percentage `resource-manager.ts:38-38`
- **used** — Used memory in bytes `resource-manager.ts:32-32`
- **valid** — Indicates whether the file merkle tree is valid `file-merkle.ts:567-567`
- **valid** — Checks if the Merkle tree is valid `merkle-file-tracker.ts:351-351`
- **vector** — Represents the vector representation of a code snippet `service-container.ts:325-325`
- **version** — Not present in the provided code `environment-setup.ts:92-92`
- **w** — Represents a width or weight `service-container.ts:247-247`
- **watchedFiles** — A set of file paths that are being watched `file-watcher.ts:61-61`
- **watchers** — A map of file watchers `file-watcher.ts:60-60`
- **watcherStatus** — Gets the status of the file watcher `merkle-file-tracker.ts:327-327`
- **watchUncommitted** — Indicates whether to watch uncommitted changes `git-watcher.ts:113-113`
- **workers** — Number of workers used for embedding processing `auto-indexer.ts:39-39`
- **workersUsed** — Indicates the number of workers used for embedding tasks `auto-indexer.ts:282-282`

### embedded_sql
- **CREATE INDEX IF NOT EXISTS idx_file_merkle_hash ON file_merkle(hash)** — Creates an index on the hash column `file-merkle.ts:66-66`
- **CREATE INDEX IF NOT EXISTS idx_file_merkle_parent ON file_merkle(project_hash, branch_name, parent_p** — Creates an index on the project_hash, branch_name, and parent_path columns `file-merkle.ts:65-65`
- **CREATE INDEX IF NOT EXISTS idx_file_merkle_project ON file_merkle(project_hash, branch_name)** — Creates an index on the project_hash and branch_name columns `file-merkle.ts:64-64`
- **CREATE TABLE IF NOT EXISTS file_merkle ( id TEXT PRIMARY KEY, project_hash TEXT NOT NULL, branch_nam** — Creates a table for storing Merkle tree data `file-merkle.ts:52-63`
- **DELETE FROM file_merkle WHERE project_hash = ? AND branch_name = ?** — Executes a SQL DELETE statement to remove file_merkle records based on project_hash and branch_name `file-merkle.ts:624-624`
- **DELETE FROM file_merkle WHERE project_hash = ? AND branch_name = ? AND path = ?** — Executes a SQL DELETE statement to remove a specific file_merkle record based on project_hash, branch_name, and path `file-merkle.ts:386-387`
- **DELETE FROM file_merkle WHERE project_hash = ? AND branch_name = ? AND path = ?** — Constructs a SQL query to delete records from the file_merkle table based on project_hash, branch_name, and path `file-merkle.ts:399-400`
- **SELECT * FROM file_merkle WHERE project_hash = ? AND branch_name = ?** — Executes a SQL SELECT statement to retrieve file_merkle records based on project_hash and branch_name `file-merkle.ts:577-577`
- **SELECT * FROM file_merkle WHERE project_hash = ? AND branch_name = ? AND is_leaf = 1** — Executes a SQL SELECT statement to retrieve leaf file_merkle records based on project_hash, branch_name, and is_leaf `file-merkle.ts:551-552`
- **SELECT * FROM file_merkle WHERE project_hash = ? AND branch_name = ? AND parent_path ${parentPath ==** — Selects all nodes with a specific parent path `file-merkle.ts:335-337`
- **SELECT * FROM file_merkle WHERE project_hash = ? AND branch_name = ? AND path = ?** — Selects all nodes for a given path `file-merkle.ts:315-316`
- **SELECT hash FROM file_merkle WHERE project_hash = ? AND branch_name = ? AND path = '.** — Selects the hash of the root node `file-merkle.ts:296-297`

## Data Flow

### Inputs

| Source | Data | Type |
|--------|------|------|
| Git repository | Branch changes, file diffs | `BranchChangeCallback`, `FileChange[]` |
| OS metrics | CPU load, memory usage | `os.loadavg()`, `os.freemem()` |
| Agent requests | Service resolution, resource allocation | `DIContainer.resolve()`, `ResourceManager.requestAllocation()` |
| Client connections | Session config, project paths | `ClientSessionConfig` |

### Processing

1. **Environment setup** -- `checkQuietMode()` and `createSafeEnvironment()` configure console output and env vars
2. **Service container init** -- `initServiceContainer()` lazily registers VersionManager, CodeModifier, PatternSearch, etc.
3. **Agent registration** -- `registerAllAgents()` imports 7 agent types with lazy factory patterns
4. **Git watching** -- `GitWatcher` polls `.git/HEAD` for branch changes and debounces file changes (60s window, 1000-file bulk threshold)
5. **Resource monitoring** -- `ResourceManager` captures snapshots every 2s (adaptive 1-10s), emits throttle/critical events at >80% pressure
6. **Knowledge distribution** -- `KnowledgeBus` routes topic-based messages with Bloom filter fast-path and TTL expiry
7. **Shutdown orchestration** -- `performGlobalShutdown()` disposes conductor, index manager, FAISS, GPU client, then DI container in reverse order

### Outputs

| Target | Data | Type |
|--------|------|------|
| Agents | Resolved instances, messages | `Agent`, `KnowledgeEntry` |
| Indexing pipeline | Changed file lists, branch metadata | `FileChange[]`, `BranchMetadata` |
| MCP transport | Pipe/socket streams | `PipeTransport` |
| System | Throttle signals, shutdown | Events via `EventEmitter` |

## Public API

| Export | Type | Description | Location |
|--------|------|-------------|----------|
| `KnowledgeBus` | Class | Pub/sub engine with Bloom filter and TTL support | [`knowledge-bus.ts:29-331`](./knowledge-bus.ts) |
| `knowledgeBus` | Instance | Singleton knowledge bus | [`knowledge-bus.ts:334-334`](./knowledge-bus.ts) |
| `DIContainer` | Class | DI with circular dependency detection | [`di-container.ts:73-379`](./di-container.ts) |
| `getGlobalContainer()` | Function | Get or create the global DI container | [`di-container.ts:443-448`](./di-container.ts) |
| `GitWatcher` | Class | Git branch and commit change detection with debounce | [`git-watcher.ts:71-739`](./git-watcher.ts) |
| `ResourceManager` | Class | Adaptive CPU/memory monitoring and allocation | [`resource-manager.ts:45-456`](./resource-manager.ts) |
| `resourceManager` | Instance | Singleton resource manager | [`resource-manager.ts:459-459`](./resource-manager.ts) |
| `BranchManager` | Class | Per-branch database paths and LRU eviction | [`branch-manager.ts:85-448`](./branch-manager.ts) |
| `FileWatcher` | Class | Debounced file change detection (Bun/Node) | [`file-watcher.ts:57-390`](./file-watcher.ts) |
| `ClientSession` | Class | Per-client state isolation for pipe mode | [`client-session.ts:59-276`](./client-session.ts) |
| `ServiceContainer` | Class | Lazy service initialization container | [`service-container.ts:48-419`](./service-container.ts) |
| `registerAllAgents()` | Function | Register 7 agent types into DI container | [`agent-registry.ts:22-96`](./agent-registry.ts) |
| `performGlobalShutdown()` | Function | Graceful shutdown with resource cleanup | [`shutdown-handlers.ts:78-139`](./shutdown-handlers.ts) |
| `performAutoIndex()` | Function | Auto-detect and index supported projects | [`auto-indexer.ts:273-445`](./auto-indexer.ts) |
| `setupConsoleOverride()` | Function | Quiet mode console override for --pipe | [`environment-setup.ts:19-43`](./environment-setup.ts) |

See [`agent-registry.ts`](./agent-registry.ts), [`shutdown-handlers.ts`](./shutdown-handlers.ts), [`environment-setup.ts`](./environment-setup.ts), [`startup-checks.ts`](./startup-checks.ts), [`startup-utils.ts`](./startup-utils.ts), [`indexing-state.ts`](./indexing-state.ts) for additional exports.

## Dependencies

### Internal Modules

| Module | Purpose | Interaction |
|--------|---------|-------------|
| `logging` | Structured logging (`log.i`, `log.e`, `log.d`) | All core files import `../logging/index` |
| `types/agent` | Agent, AgentType, AgentMessage, ResourceConstraints | DI container, knowledge bus, resource manager |
| `config/yaml-config` | AppConfig type | DI container agent capability resolution |
| `storage/graph-storage-factory` | Graph database creation | Service container lazy init |
| `shared/storage-paths` | `getProjectHash()`, path helpers | Branch manager, client session |
| `utils/bloom-filter` | BloomFilter for O(1) topic lookups | Knowledge bus |
| `agents/*` | 7 agent type implementations | Agent registry (lazy dynamic imports) |
| `semantic/faiss` | FAISS provider shutdown | Shutdown handlers |

### External Packages

| Package | Purpose |
|---------|---------|
| `node:events` | EventEmitter base for KnowledgeBus, ResourceManager, FileWatcher |
| `node:child_process` | Git command execution (`execSync`) |
| `node:fs` | File operations for config, metadata, watchers |
| `node:os` | System metrics: `totalmem`, `freemem`, `loadavg` |
| `node:path` | Path utilities |
| `node:net` | Pipe/socket transport |
| `fast-glob` | File pattern matching for auto-indexer |

## Configuration

| Parameter | Default | Description |
|-----------|---------|-------------|
| `MCP_QUIET_MODE` | `"false"` | Suppress console output in --pipe mode |
| `MCP_DEBUG_DISABLE_SEMANTIC` | `"1"` | Skip semantic indexing |
| `MCP_EMBEDDING_ENABLED` | `"true"` | Enable/disable embedding generation |
| `MCP_EMBEDDING_PROVIDER` | `"transformers"` | Embedding backend selection |
| `maxMemoryMB` | 50% system RAM | ResourceManager max memory constraint |
| `maxCpuPercent` | 95% | ResourceManager max CPU constraint |
| `maxConcurrentAgents` | `cpus * 3` (cap 20) | Max concurrent agent count |
| `debounceMs` | 60000 | GitWatcher file change debounce window |
| `bulkModeThreshold` | 1000 | File count threshold triggering full reindex |
| `evictionStrategy` | `"LRU"` | BranchManager cleanup policy |

## Behavioral Properties

| Property | Value |
|----------|-------|
| Async | Yes -- all resolve/init paths are async; KnowledgeBus handlers execute sequentially via `await` in loop |
| Thread Safety | Safe for single-threaded Node.js; Map/EventEmitter ops are synchronous; no file locking in BranchManager |
| Idempotency | DIContainer.dispose() is idempotent (disposed flag); publish() creates distinct entries per call |
| Side Effects | Emits events, writes metadata/registry JSON to disk, spawns Git child processes, requests GC |
| State | Singleton pattern for KnowledgeBus, ResourceManager, DIContainer; ClientSession is per-client instance |

## Error Handling

Core components use defensive try/catch with continuation semantics: errors in one subscriber/service do not block others. KnowledgeBus catches handler exceptions and emits `subscription:error` events. DIContainer throws on unregistered services and circular dependencies (with cycle path in message) but catches individual dispose failures. GitWatcher and BranchManager return empty/null on git command failures and continue polling.

| Error | When | Recovery |
|-------|------|----------|
| Circular dependency detected | `DIContainer.resolve()` finds cycle in resolution stack | Throws with full cycle path; caller must fix registration |
| Service not registered | `DIContainer.resolve()` with unknown name | Throws `Error`; caller catches |
| Handler exception | `KnowledgeBus` subscriber throws | Caught, emits `subscription:error`, continues next subscriber |
| Git command failure | `GitWatcher.getChangedFiles()` exec error | Returns empty array, logs warning |
| Metadata read failure | `BranchManager.getBranchMetadata()` | Returns null, logs error |
| Bun.watch unavailable | `FileWatcher.start()` | Falls back to `fs.watch()` |

## Observability

| Event | Level | When |
|-------|-------|------|
| `knowledge:published` | info | Entry published to a topic |
| `subscription:error` | error | Subscriber handler threw an exception |
| `monitoring:started` / `stopped` | info | Resource monitoring lifecycle |
| `throttle:enabled` / `disabled` | warn | System pressure crosses 80% threshold |
| `memory:critical` / `cpu:critical` | error | Resource pressure exceeds critical level |
| `allocation:denied` | warn | Resource request rejected due to constraints |
| `branch_changed` | info | Git branch switch detected |
| `new_commit` | info | New commit detected on current branch |
| `disposed` | info | DI container fully disposed |

## Known Limitations

- **Layer 2 (Working Deltas) not implemented** -- LayeredIndex defines a 3-layer interface but Layer 2 is marked `[FUTURE]` in [`layered-index.ts`](./layered-index.ts)
- **No file locking in BranchManager** -- Registry JSON written directly; potential race condition in concurrent write scenarios
- **Knowledge Bus TTL is lazy** -- Expired entries only cleaned on `query()`, not proactively removed
- **Regex cache unbounded** -- KnowledgeBus pattern cache can grow indefinitely with many unique subscription patterns
- **fs.watch() unreliable on Windows** -- GitWatcher falls back to polling for branch changes on Windows
- **No persistent debounce state** -- If server crashes during the debounce window, pending file changes are lost

## TypeScript Notes

### Event Map

| Event | Payload | When |
|-------|---------|------|
| `knowledge:published` | `KnowledgeEntry` | Topic entry created |
| `subscription:created` | `Subscription` | New subscription registered |
| `subscription:removed` | `string` (subscriptionId) | Subscription unsubscribed |
| `subscription:error` | `{ subscription: Subscription, error: Error }` | Handler threw |
| `message:sent` | `AgentMessage` | Direct agent message sent |
| `topic:cleared` | `string` (topic) | Topic entries cleared |
| `throttle:enabled` | `{ memory: boolean, cpu: boolean }` | Pressure > 80% |
| `allocation:denied` | `{ agentId: string, reason: string, requested: number, available: number }` | Resource request rejected |
| `snapshot:captured` | `ResourceSnapshot` | Monitoring tick completed |

### Module Boundary

The module has no `index.ts` barrel file; each file exports directly. Public surface: `KnowledgeBus`, `DIContainer`, `GitWatcher`, `ResourceManager`, `BranchManager`, `FileWatcher`, `ClientSession`, `ServiceContainer` classes plus their singleton instances (`knowledgeBus`, `resourceManager`) and key functions (`registerAllAgents`, `getGlobalContainer`, `getServiceContainer`, `initServiceContainer`, `performGlobalShutdown`, `performAutoIndex`). Internal helpers like `BloomFilter` usage and `resolutionStack` tracking are not exposed. `ServiceDescriptor` is exported for advanced DI usage only.

## Files

| File | Description |
|------|-------------|
| [`agent-registry.ts`](./agent-registry.ts) | Agent factory registration for 7 agent types with lazy dynamic imports |
| [`auto-indexer.ts`](./auto-indexer.ts) | Auto-detection of supported projects and index orchestration |
| [`branch-manager.ts`](./branch-manager.ts) | Per-branch database paths, metadata persistence, and LRU eviction |
| [`client-session.ts`](./client-session.ts) | Per-client state isolation for pipe mode with session registry |
| [`di-container.ts`](./di-container.ts) | Dependency injection container with circular dependency detection |
| [`environment-setup.ts`](./environment-setup.ts) | Quiet mode, safe environment creation, version info |
| [`file-merkle.ts`](./file-merkle.ts) | Content-hash-based Merkle tree for incremental file tracking |
| [`file-watcher.ts`](./file-watcher.ts) | Debounced file change detection with Bun/Node fallback |
| [`git-watcher.ts`](./git-watcher.ts) | Git branch polling, commit detection, and debounced file change callbacks |
| [`indexing-state.ts`](./indexing-state.ts) | Per-project indexing state tracking and timer suspension |
| [`knowledge-bus.ts`](./knowledge-bus.ts) | Pub/sub knowledge bus with Bloom filter optimization and TTL |
| [`layered-index.ts`](./layered-index.ts) | 3-layer index interface (Layer 2 future) |
| [`merkle-file-tracker.ts`](./merkle-file-tracker.ts) | File content tracking via Merkle hashes for incremental indexing |
| [`pipe-transport.ts`](./pipe-transport.ts) | Named pipe/socket transport for multi-client MCP communication |
| [`resource-manager.ts`](./resource-manager.ts) | Adaptive CPU/memory monitoring with throttle and allocation control |
| [`service-container.ts`](./service-container.ts) | Lazy service initialization with global container access |
| [`shutdown-handlers.ts`](./shutdown-handlers.ts) | Graceful shutdown orchestration with signal handlers |
| [`startup-checks.ts`](./startup-checks.ts) | Ollama availability check and orphaned embeddings cleanup |
| [`startup-utils.ts`](./startup-utils.ts) | Timing utilities, log file I/O, and timestamp formatting |
