# Shared Module

## 🤖 Overview

The `src/shared` module provides a set of utilities and worker systems for different runtimes, including Node.js and Bun. It includes an adaptive worker system that selects the optimal worker implementation based on the runtime environment. Additionally, it offers backward-compatible indexing context wrappers for project directory access, though these are deprecated in favor of direct usage of `ProjectContextManager`.

## 🤖 Architecture

```
  +-------------------+
  | Adaptive Worker   |
  | (runtime detection)|
  +-------------------+
          |
          v
  +-------------------+
  | Node.js Worker    |
  | (worker_threads)  |
  +-------------------+
          |
          v
  +-------------------+
  | Bun Worker        |
  | (Web Worker API)  |
  +-------------------+
          |
          v
  +-------------------+
  | Worker Task       |
  | (task execution)  |
  +-------------------+
```

## 🤖 Flow

```
  +-------------------+
  | Start Task        |
  +-------------------+
          |
          v
  +-------------------+
  | Detect Runtime    |
  +-------------------+
          |
          v
  +-------------------+
  | Create Worker     |
  +-------------------+
          |
          v
  +-------------------+
  | Execute Task      |
  +-------------------+
          |
          v
  +-------------------+
  | Handle Result     |
  +-------------------+
```

## 🤖 Entity Listing

### Function
- **acquireLock** — Acquires an exclusive lock on the core process by writing a lock file `runtime-detect.ts:133-155`
- **busy** — Indicates whether a worker is currently busy `adaptive-worker.ts:162-162`
- **clearWorktreeCache** — Clears the cache of worktree information `git-worktree.ts:84-88`
- **createErrorResponse** — Creates a new IPC error response message `ipc-protocol.ts:225-231`
- **createEvent** — Creates a new IPC event message `ipc-protocol.ts:236-244`
- **createRequest** — Creates a new IPC request message `ipc-protocol.ts:201-209`
- **createResponse** — Creates a new IPC response message `ipc-protocol.ts:214-220`
- **detectRuntime** — Detects the current runtime and caches the result `runtime-detect.ts:24-64`
- **detectSubmodules** — Detects submodules in the current repository `git-worktree.ts:309-319`
- **detectSubmodulesUncached** — Detects submodules without using the cache `git-worktree.ts:321-372`
- **detectSubtrees** — Detects subtrees in the current repository `git-worktree.ts:458-468`
- **detectSubtreesUncached** — Detects subtrees without using the cache `git-worktree.ts:470-516`
- **encodeMessage** — Encodes an IPC message into a buffer `ipc-protocol.ts:103-109`
- **ensureDataDir** — Ensure the data directory exists and create it if necessary `storage-paths.ts:62-68`
- **ensureGlobalDbDir** — Ensures the global database directory exists `storage-paths.ts:384-390`
- **ensureProjectDir** — Ensures the project directory exists `storage-paths.ts:373-379`
- **errorHandler** — Manages error handling for worker tasks `adaptive-worker.ts:320-325`
- **getASTCacheDir** — Retrieves the AST cache directory `storage-paths.ts:474-476`
- **getBranchPaths** — Retrieves paths for a given branch `storage-paths.ts:395-406`
- **getCacheDir** — Returns the directory path for cache `storage-paths.ts:92-94`
- **getConfigDir** — Returns the directory path for configuration `storage-paths.ts:104-106`
- **getConfigPath** — Returns the path to the configuration file `storage-paths.ts:108-110`
- **getCoreEntryPath** — Gets the path to the core entry file `runtime-detect.ts:91-98`
- **getCoreLockPath** — Returns the path to the core lock file `storage-paths.ts:120-122`
- **getCorePidPath** — Returns the path to the core PID file `storage-paths.ts:116-118`
- **getCurrentGitBranch** — Retrieves the current Git branch name `storage-paths.ts:319-359`
- **getCurrentGitBranchOrDefault** — Retrieves the current Git branch name or a default if not available `storage-paths.ts:366-368`
- **getCurrentIndexingDirectory** — Get the current directory being indexed, deprecated in favor of getProjectContext().getCurrentProject() `indexing-context.ts:16-18`
- **getCurrentIndexingDirectory** — Returns the current indexing directory `project-context.ts:270-272`
- **getCurrentProjectPath** — Returns the current project path `project-context.ts:247-249`
- **getDataDir** — Get the base data directory for UltraCode, using lowercase "ultracode" on Linux/macOS and "UltraCode" on Windows `storage-paths.ts:27-57`
- **getFaissHotBufferPath** — Retrieves the Faiss hot buffer path `storage-paths.ts:460-464`
- **getFaissIdMapPath** — Retrieves the Faiss ID map path `storage-paths.ts:451-455`
- **getFaissIndexPath** — Retrieves the Faiss index path `storage-paths.ts:420-430`
- **getFaissIndexPathByHash** — Retrieves the Faiss index path by hash `storage-paths.ts:436-446`
- **getGlobalDbPaths** — Returns paths for global database files, including deprecated paths `storage-paths.ts:222-237`
- **getIPCSocketPath** — Get the IPC socket/pipe path for UltraCode `storage-paths.ts:77-82`
- **getLogsDir** — Returns the directory path for logs `storage-paths.ts:88-90`
- **getMainRepoPath** — Returns the absolute path to the main repository `git-worktree.ts:213-216`
- **getModelsDir** — Returns the directory path for models `storage-paths.ts:100-102`
- **getMultiDbPaths** — Returns paths for multiple databases within a base directory `storage-paths.ts:243-251`
- **getParentRepo** — Returns the parent repository of a given path `git-worktree.ts:419-445`
- **getPerProjectMultiDbPaths** — Returns paths for multiple databases within a project directory `storage-paths.ts:261-270`
- **getProjectContext** — Retrieves the current project context `project-context.ts:237-242`
- **getProjectDir** — Returns the directory path for a project based on its hash `storage-paths.ts:158-161`
- **getProjectHash** — Returns a hash of the project path `storage-paths.ts:276-278`
- **getProjectPaths** — Returns an object containing paths related to a project `storage-paths.ts:167-180`
- **getProjectsDir** — Returns the directory path for projects `storage-paths.ts:96-98`
- **getRepoIdentity** — Returns the stable identity of the repository `git-worktree.ts:195-198`
- **getRuntimeExecutable** — Returns the executable path for the current runtime `runtime-detect.ts:69-82`
- **getSemanticConfigPath** — Returns the path to the semantic configuration file `storage-paths.ts:112-114`
- **getTreeSitterCacheDir** — Retrieves the Tree Sitter cache directory `storage-paths.ts:470-472`
- **getWorkerPool** — Retrieves the current worker pool `adaptive-worker.ts:372-380`
- **handler** — Handles worker tasks and messages `adaptive-worker.ts:237-259`
- **hashProjectPath** — Hashes the project path to generate a unique identifier `storage-paths.ts:137-152`
- **initializeStorageDirs** — Initializes storage directories for UltraCode `storage-paths.ts:485-493`
- **isBaseBranch** — Determines if a branch is the base branch `storage-paths.ts:304-308`
- **isCoreRunning** — Checks if the core process is running by attempting to kill it `runtime-detect.ts:103-124`
- **isGitWorktree** — Checks if a given path is a git worktree `git-worktree.ts:203-206`
- **isProjectIndexed** — Checks if the project is indexed `project-context.ts:261-263`
- **listSiblingWorktrees** — Lists sibling worktrees of the current repository `git-worktree.ts:222-269`
- **normalizeBranchName** — Normalizes the branch name for consistent storage `storage-paths.ts:284-287`
- **parseGitmodules** — Parses the gitmodules file to extract submodule information `git-worktree.ts:377-412`
- **pooledWorker** — Represents a pooled worker instance `adaptive-worker.ts:181-181`
- **releaseLock** — Releases the lock by removing the lock file `runtime-detect.ts:160-167`
- **resolveGitHeadPath** — Resolves the path to the current git head `git-worktree.ts:282-299`
- **resolveProjectPath** — Resolves and normalizes the project path `project-context.ts:254-256`
- **resolveWorktreeInfo** — Resolves worktree information for a given path `git-worktree.ts:100-110`
- **resolveWorktreeInfoUncached** — Resolves worktree information without using the cache `git-worktree.ts:112-188`
- **result** — Stores the result of a task execution `adaptive-worker.ts:236-272`
- **setCurrentIndexingDirectory** — Set the current directory being indexed, deprecated as project context is now managed via AsyncLocalStorage `indexing-context.ts:25-28`
- **setCurrentIndexingDirectory** — Sets the current indexing directory `project-context.ts:277-279`
- **shutdownWorkerPool** — Shuts down the worker pool and releases resources `adaptive-worker.ts:385-390`
- **terminatePromises** — Terminates all pending promises `adaptive-worker.ts:139-149`
- **wrappedHandler** — Wraps the handler to manage worker tasks and errors `adaptive-worker.ts:262-265`

### Method
- **constructor** — Initializes the adaptive worker pool with given options `adaptive-worker.ts:89-104`
- **constructor** — Initializes a new instance of the MessageDecoder `ipc-protocol.ts:121-124`
- **constructor** — Initializes the IPC protocol for communication between Commer (proxy) and Core processes `ipc-protocol.ts:265-290`
- **constructor** — Initializes the ProjectContextManager with the current working directory `project-context.ts:47-54`
- **createWorker** — Creates a new worker instance based on the runtime `adaptive-worker.ts:295-339`
- **decode** — Decodes the buffer into an IPC message `ipc-protocol.ts:147-183`
- **ensureCapacity** — Ensures the buffer has enough capacity `ipc-protocol.ts:127-135`
- **execute** — Executes a task using a worker `adaptive-worker.ts:109-123`
- **executeAll** — Executes all tasks in the task queue `adaptive-worker.ts:128-130`
- **finishIndexing** — Completes the indexing process for the current project `project-context.ts:188-192`
- **getCurrentProject** — Returns the current project path `project-context.ts:62-64`
- **getProjectInfo** — Retrieves project information `project-context.ts:85-116`
- **getStats** — Retrieves statistics about the worker pool `adaptive-worker.ts:161-171`
- **getStatus** — Returns the current status of the project context `project-context.ts:204-216`
- **getStoragePaths** — Retrieves storage paths for the current project `project-context.ts:163-166`
- **handleMessage** — Handles incoming IPC messages `ipc-protocol.ts:340-365`
- **handleWorkerError** — Handles errors that occur during worker execution `adaptive-worker.ts:341-360`
- **isIndexingInProgress** — Tracks whether indexing is currently in progress `project-context.ts:171-174`
- **isProjectIndexed** — Checks if a project is indexed by retrieving its information and verifying the indexed status `project-context.ts:121-124`
- **off** — Removes a listener for IPC messages `ipc-protocol.ts:328-330`
- **on** — Listens for IPC messages `ipc-protocol.ts:318-323`
- **onProjectChange** — Handles changes in the current project path `project-context.ts:197-199`
- **processQueue** — Processes tasks in the task queue `adaptive-worker.ts:177-293`
- **request** — Sends an IPC request message `ipc-protocol.ts:295-313`
- **reset** — Resets the buffer and decoder `ipc-protocol.ts:188-191`
- **reset** — Resets the project context to its initial state `project-context.ts:221-228`
- **resolveProjectPath** — Parses a project path, normalizing it if necessary, and returns the resolved path `project-context.ts:72-80`
- **sendEvent** — Sends an IPC event message `ipc-protocol.ts:335-338`
- **shrinkIfEmpty** — Shrinks the buffer if it is empty `ipc-protocol.ts:138-142`
- **shutdown** — Shuts down the worker pool `adaptive-worker.ts:135-156`
- **startIndexing** — Begins the indexing process for the current project `project-context.ts:179-183`
- **switchProject** — Switches the current project `project-context.ts:131-158`

### Class
- **AdaptiveWorkerPool** — Manages a pool of adaptive workers `adaptive-worker.ts:76-361`
- **IPCClient** — Represents an IPC client for communication `ipc-protocol.ts:259-366`
- **MessageDecoder** — Decodes an IPC message from a buffer `ipc-protocol.ts:116-192`
- **ProjectContextManager** — Manages project-specific storage and indexing operations `project-context.ts:44-229`

### Interface
- **AdaptiveWorkerOptions** — Configuration options for the adaptive worker system, including max workers, script path, timeout, smol mode, and retries `adaptive-worker.ts:39-50`
- **BunWorker** — Bun worker interface using Web Worker API methods `adaptive-worker.ts:56-61`
- **IPCError** — An interface for an IPC error message containing an error code and message `ipc-protocol.ts:42-46`
- **IPCEvent** — An interface for an IPC event message containing an ID, type, event name, and data `ipc-protocol.ts:34-40`
- **IPCRequest** — An interface for an IPC request message containing an ID, type, method, parameters, and project path `ipc-protocol.ts:19-25`
- **IPCResponse** — An interface for an IPC response message containing an ID, type, result, and error `ipc-protocol.ts:27-32`
- **PendingRequest** — Represents a pending IPC request `ipc-protocol.ts:250-254`
- **PooledWorker** — Represents a worker in a pool, including its worker instance, busy status, task ID, and creation time `adaptive-worker.ts:65-70`
- **ProjectContextState** — Manages the state of the current and previous projects `project-context.ts:35-38`
- **ProjectInfo** — Represents information about a project, including its path, hash, indexing status, and database presence `project-context.ts:26-33`
- **SiblingWorktree** — Represents information about a sibling worktree, including absolute path, branch checked out in this worktree, and whether this is the main working tree `git-worktree.ts:64-71`
- **SubmoduleInfo** — Represents information about a git submodule, including relative path, remote URL, tracking branch, pinned commit hash, and parent repo identity `git-worktree.ts:44-55`
- **SubtreeInfo** — Represents information about a git subtree, including path prefix and last merge commit `git-worktree.ts:57-62`
- **WorkerMessage** — Represents a message sent to or received from a worker, containing task details and potential errors `adaptive-worker.ts:25-31`
- **WorkerTask** — Represents a task to be executed by a worker, including task ID, type, and payload `adaptive-worker.ts:33-37`
- **WorktreeInfo** — Represents information about a git worktree, including whether it's a linked worktree, the main repository path, git common directory, repository identity, worktree name, and current working path `git-worktree.ts:29-42`

### Type_alias
- **AnyWorker** — Union type for either Node.js or Bun workers `adaptive-worker.ts:63-63`
- **IPCMessage** — Represents a message in the IPC protocol `ipc-protocol.ts:48-48`
- **IPCMessageType** — Represents the type of IPC message, either request, response, or event `ipc-protocol.ts:17-17`
- **NodeWorker** — Node.js worker type using worker_threads `adaptive-worker.ts:53-53`
- **Runtime** — Represents the current runtime as either "bun" or "node" `runtime-detect.ts:16-16`

### Import_decl
- **../logging/index.js** — Imports `../logging/index.js` from `../logging/index.js`. `adaptive-worker.ts:17-17`, `git-worktree.ts:22-22`, `ipc-protocol.ts:10-10`, `project-context.ts:19-19`
- **../utils/fast-hash.js** — Imports `../utils/fast-hash.js` from `../utils/fast-hash.js`. `git-worktree.ts:23-23`, `storage-paths.ts:15-15`
- **../utils/runtime-detection.js** — Imports `../utils/runtime-detection.js` from `../utils/runtime-detection.js`. `adaptive-worker.ts:18-18`, `ipc-protocol.ts:11-11`
- **./git-worktree.js** — Imports `./git-worktree.js` from `./git-worktree.js`. `storage-paths.ts:16-16`
- **./project-context.js** — Imports `./project-context.js` from `./project-context.js`. `indexing-context.ts:10-10`
- **./runtime-detect.js** — Imports `./runtime-detect.js` from `./runtime-detect.js`. `adaptive-worker.ts:19-19`
- **./storage-paths.js** — Imports `./storage-paths.js` from `./storage-paths.js`. `project-context.ts:20-20`, `runtime-detect.ts:10-10`
- **node:child_process** — Imports `node:child_process` from `node:child_process`. `git-worktree.ts:19-19`, `storage-paths.ts:10-10`
- **node:crypto** — Imports `node:crypto` from `node:crypto`. `ipc-protocol.ts:8-8`
- **node:events** — Imports `node:events` from `node:events`. `adaptive-worker.ts:15-15`
- **node:fs** — Imports `node:fs` from `node:fs`. `git-worktree.ts:20-20`, `project-context.ts:17-17`, `runtime-detect.ts:7-7`, `storage-paths.ts:11-11`
- **node:net** — Imports `node:net` from `node:net`. `ipc-protocol.ts:9-9`
- **node:os** — Imports `node:os` from `node:os`. `adaptive-worker.ts:16-16`, `storage-paths.ts:12-12`
- **node:path** — Imports `node:path` from `node:path`. `git-worktree.ts:21-21`, `project-context.ts:18-18`, `runtime-detect.ts:8-8`, `storage-paths.ts:13-13`
- **node:url** — Imports `node:url` from `node:url`. `runtime-detect.ts:9-9`

### Property
- **abortController** — An abort controller for managing request aborts `ipc-protocol.ts:253-253`
- **branch** — Represents the tracking branch of a submodule `git-worktree.ts:68-68`, `git-worktree.ts:377-377`
- **branch** — Tracking branch (null if not set) `git-worktree.ts:50-50`, `git-worktree.ts:378-378`
- **buffer** — A buffer used for IPC communication `ipc-protocol.ts:117-117`
- **busy** — Represents the current state of the worker being busy or not `adaptive-worker.ts:67-67`
- **code** — The error code for the IPC error `ipc-protocol.ts:43-43`
- **commitHash** — Pinned commit hash `git-worktree.ts:52-52`
- **createdAt** — Records the timestamp when a worker was created `adaptive-worker.ts:69-69`
- **currentProject** — Stores the current active project path `project-context.ts:205-205`
- **currentProject** — The currently active project path `project-context.ts:36-36`
- **data** — Stores or processes data related to worker tasks `adaptive-worker.ts:263-263`
- **data** — Represents the data being processed `ipc-protocol.ts:45-45`
- **data** — Optional data for the IPC event `ipc-protocol.ts:38-38`
- **decoder** — A decoder for IPC messages `ipc-protocol.ts:260-260`
- **error** — Optional field for error messages `adaptive-worker.ts:29-29`
- **error** — An optional error object for the IPC response `ipc-protocol.ts:31-31`
- **event** — The name of the event `ipc-protocol.ts:37-37`
- **eventHandlers** — A collection of event handlers for IPC events `ipc-protocol.ts:262-262`
- **gitCommonDir** — Absolute path to the git common directory `git-worktree.ts:35-35`
- **hasGraphDb** — Indicates whether the project has a graph database `project-context.ts:30-30`
- **hash** — A unique identifier for the project `project-context.ts:28-28`
- **hasVectorsDb** — Indicates whether the project has a vectors database `project-context.ts:31-31`
- **id** — Unique identifier for the worker task `adaptive-worker.ts:34-34`
- **id** — A unique identifier for an IPC message `ipc-protocol.ts:20-20`
- **id** — Represents the unique identifier for an IPC message `ipc-protocol.ts:28-28`
- **id** — Represents the unique identifier for an IPC event `ipc-protocol.ts:35-35`
- **indexingInProgress** — Tracks whether indexing is in progress `project-context.ts:208-208`
- **indexingInProgress** — Tracks projects currently being indexed `project-context.ts:56-56`
- **initialSize** — The initial size of the buffer `ipc-protocol.ts:119-119`
- **isIndexed** — Checks if the current project is indexed `project-context.ts:207-207`
- **isIndexed** — Indicates whether the project is indexed `project-context.ts:29-29`
- **isMain** — Represents whether the current worktree is the main one `git-worktree.ts:70-70`
- **isShuttingDown** — Indicates whether the worker pool is shutting down `adaptive-worker.ts:86-86`
- **isWorktree** — Indicates whether the current worktree is a linked worktree (not the main working tree) `git-worktree.ts:31-31`
- **lastIndexedAt** — The timestamp of the last indexing operation `project-context.ts:32-32`
- **lastMergeCommit** — Last merge commit involving this subtree `git-worktree.ts:61-61`
- **length** — The length of the buffer `ipc-protocol.ts:118-118`
- **mainRepoPath** — Absolute path to the main repository (the one with the real .git dir) `git-worktree.ts:33-33`
- **maxWorkers** — Maximum number of concurrent workers `adaptive-worker.ts:41-41`
- **message** — Represents a message sent to or received from a worker `adaptive-worker.ts:321-321`
- **message** — The error message for the IPC error `ipc-protocol.ts:44-44`
- **method** — The method name for the IPC request `ipc-protocol.ts:22-22`
- **nodeWorkerModule** — Imports the Node.js worker_threads module `adaptive-worker.ts:87-87`
- **onProjectChangeCallbacks** — Stores callbacks for project change events `project-context.ts:57-57`
- **options** — Contains configuration options for the adaptive worker pool `adaptive-worker.ts:78-78`
- **params** — Optional parameters for the IPC request `ipc-protocol.ts:23-23`
- **parentRepoIdentity** — repoIdentity of the parent repo `git-worktree.ts:54-54`
- **path** — Relative path inside parent repo `git-worktree.ts:46-46`
- **path** — Represents the file path `git-worktree.ts:66-66`
- **path** — The file system path to the project directory `project-context.ts:27-27`
- **payload** — Contains the data or command for the worker task `adaptive-worker.ts:28-28`
- **payload** — Represents the data being processed by the worker `adaptive-worker.ts:36-36`
- **pendingRequests** — A collection of pending IPC requests `ipc-protocol.ts:261-261`
- **prefix** — Path prefix in the repo (e.g., "libs/shared") `git-worktree.ts:59-59`
- **previousProject** — Stores the previous project path `project-context.ts:206-206`
- **previousProject** — The previous project path, if any `project-context.ts:37-37`
- **projectPath** — Optional project path for the IPC request `ipc-protocol.ts:24-24`
- **projectPath** — Optional string representing the path to the project, or undefined `ipc-protocol.ts:39-39`
- **reject** — Rejects a promise when a task fails `adaptive-worker.ts:83-83`
- **reject** — Rejects a pending request `ipc-protocol.ts:252-252`
- **repoIdentity** — Stable identity: xxHash32(normalized gitCommonDir) — same for all worktrees `git-worktree.ts:37-37`
- **requestTimeout** — A timeout for IPC requests `ipc-protocol.ts:263-263`
- **requestTimeout** — Sets the timeout for IPC requests `ipc-protocol.ts:267-267`
- **resolve** — Resolves a promise when a task is completed `adaptive-worker.ts:82-82`
- **resolve** — Resolves a pending request `ipc-protocol.ts:251-251`
- **result** — The result of the IPC request `ipc-protocol.ts:30-30`
- **retries** — Number of retries for failed tasks `adaptive-worker.ts:49-49`
- **retries** — Tracks the number of retries for a task `adaptive-worker.ts:84-84`
- **runtime** — Determines the runtime environment (Node.js or Bun) `adaptive-worker.ts:77-77`
- **scriptPath** — Path to the worker script `adaptive-worker.ts:43-43`
- **smol** — Enables smol mode for Bun workers, reducing memory usage `adaptive-worker.ts:300-300`
- **smolMode** — Boolean indicating whether to use smol mode for Bun workers `adaptive-worker.ts:47-47`
- **stack** — Optional field for error stack trace `adaptive-worker.ts:30-30`
- **state** — Stores the state of the project context, including current and previous projects `project-context.ts:45-45`
- **task** — Represents a task to be executed by a worker `adaptive-worker.ts:81-81`
- **taskId** — Optional field for task identification `adaptive-worker.ts:27-27`
- **taskId** — Stores the task ID associated with a worker `adaptive-worker.ts:68-68`
- **taskQueue** — Holds tasks waiting to be processed by workers `adaptive-worker.ts:80-85`
- **timeout** — Timeout duration for worker tasks in milliseconds `adaptive-worker.ts:45-45`
- **type** — Indicates the type of message `adaptive-worker.ts:26-26`
- **type** — Determines the type of worker (Node.js or Bun) `adaptive-worker.ts:35-35`
- **type** — Specifies the type of worker to be created `adaptive-worker.ts:300-300`
- **type** — The type of IPC message, either request, response, or event `ipc-protocol.ts:21-21`
- **type** — Specifies the type of IPC message, either "response" or "event" `ipc-protocol.ts:29-29`
- **type** — Specifies the type of the IPC event as "event" `ipc-protocol.ts:36-36`
- **url** — Represents the remote URL of a submodule `git-worktree.ts:377-377`
- **url** — Remote URL `git-worktree.ts:48-48`, `git-worktree.ts:378-378`
- **worker** — Represents a worker instance in the adaptive worker system `adaptive-worker.ts:66-66`
- **workers** — Maintains an array of pooled worker instances `adaptive-worker.ts:79-79`
- **worktreeName** — Name of this worktree (null for main) `git-worktree.ts:39-39`
- **worktreePath** — Current working path of this worktree `git-worktree.ts:41-41`

## Data Flow

### Inputs

| Source | Data | Type |
|--------|------|------|
| `process.platform` / `process.versions` | OS and runtime info | string |
| `process.env` | LOCALAPPDATA, XDG_DATA_HOME | string |
| `git` CLI | Branch name via `execSync`, worktree list, submodule status | string |
| Socket data stream | Binary-framed JSON messages | Buffer |
| Worker messages | Task requests from queue | WorkerMessage |
| `.git/`, `.gitmodules`, `git log` | Worktree, submodule, subtree metadata | filesystem / git objects |

### Processing

1. **Runtime Detection**: Check `globalThis.Bun`, `process.versions.bun`, `process.execPath`, `Bun.version`; cache result.
2. **Path Resolution**: Platform switch to base directory, append `UltraCode`, hash project path with xxHash for subdirectories.
3. **Git Branch Detection**: Check `.git` dir, run `symbolic-ref --short HEAD`, fall back to `rev-parse`, handle detached HEAD.
4. **Worktree Introspection**: Parse `.git` file or directory, detect linked worktrees via `git worktree list`, resolve main repo path.
5. **Submodule Detection**: Parse `.gitmodules`, run `git config --file .gitmodules`, correlate with `git status` for commit hashes.
6. **Subtree Detection**: Scan `git log` for subtree merge commits, extract split history via regex.
7. **IPC Decode**: Buffer incoming chunks, extract 4-byte BE length prefix, parse JSON payload, handle partial frames.
8. **Project Context**: Resolve path, update singleton state, trigger `onProjectChange` callbacks.
9. **Worker Dispatch**: Queue task, find or create idle worker, post message, collect result via Promise, retry on failure.

### Outputs

| Target | Data | Type |
|--------|------|------|
| Consumers | Runtime type `"bun"` or `"node"` | `Runtime` |
| File system | Platform-specific storage directories | string paths |
| IPC wire | Binary-encoded request/response/event | Buffer |
| Callers | Project state, indexing status | `ProjectInfo` |
| Callers | Worktree/submodule/subtree metadata | `WorktreeInfo`, `SubmoduleInfo`, etc. |
| Callers | Worker task results | `Promise<T>` |

## Public API

| Export | Type | Description | Location |
|--------|------|-------------|----------|
| `Runtime` | type | `"bun" \| "node"` | [`runtime-detect.ts:16-16`](./runtime-detect.ts) |
| `detectRuntime()` | function | Detect and cache current runtime | [`runtime-detect.ts:24-64`](./runtime-detect.ts) |
| `getRuntimeExecutable()` | function | Get executable path for runtime | [`runtime-detect.ts:69-82`](./runtime-detect.ts) |
| `getCoreEntryPath()` | function | Path to Core entry point | [`runtime-detect.ts:91-98`](./runtime-detect.ts) |
| `isCoreRunning()` | function | Check if Core process is alive via PID | [`runtime-detect.ts:103-124`](./runtime-detect.ts) |
| `acquireLock()` | function | Acquire singleton lock file | [`runtime-detect.ts:133-155`](./runtime-detect.ts) |
| `releaseLock()` | function | Release lock file | [`runtime-detect.ts:160-167`](./runtime-detect.ts) |
| `ProjectContextManager` | class | Central project state manager (singleton) | [`project-context.ts:44-228`](./project-context.ts) |
| `getProjectContext()` | function | Get singleton ProjectContextManager | [`project-context.ts:237-242`](./project-context.ts) |
| `getCurrentProjectPath()` | function | Get current project path | [`project-context.ts:247-249`](./project-context.ts) |
| `resolveProjectPath()` | function | Resolve path relative to CWD | [`project-context.ts:254-256`](./project-context.ts) |
| `isProjectIndexed()` | function | Check if project has graph DB | [`project-context.ts:261-263`](./project-context.ts) |
| `ProjectInfo` | interface | Project metadata | [`project-context.ts:26-33`](./project-context.ts) |
| `ProjectContextState` | interface | Internal state shape | [`project-context.ts:35-38`](./project-context.ts) |
| `getDataDir()` | function | Platform-specific base data directory | [`storage-paths.ts:27-57`](./storage-paths.ts) |
| `ensureDataDir()` | function | Create data directory if needed | [`storage-paths.ts:27-57`](./storage-paths.ts) |
| `getIPCSocketPath()` | function | IPC socket/pipe path | [`storage-paths.ts:62-68`](./storage-paths.ts) |
| `getGlobalDbPaths()` | function | Unified database paths (v5+) | [`storage-paths.ts:189-204`](./storage-paths.ts) |
| `hashProjectPath()` | function | xxHash-based project path hash | [`storage-paths.ts:116-118`](./storage-paths.ts) |
| `getCurrentGitBranch()` | function | Git branch name or null | [`storage-paths.ts:253-290`](./storage-paths.ts) |
| `DEFAULT_BRANCH` | constant | `"main"` fallback | [`storage-paths.ts:222-237`](./storage-paths.ts) |
| `isBaseBranch()` | function | Check if branch is main/master/dev/etc | [`storage-paths.ts:238-242`](./storage-paths.ts) |
| `getFaissIndexPath()` | function | FAISS index path per project+branch | [`storage-paths.ts:319-359`](./storage-paths.ts) |
| `initializeStorageDirs()` | function | Create all required directories | [`storage-paths.ts:420-430`](./storage-paths.ts) |
| `WorktreeInfo` | interface | Metadata about a Git worktree including path, branch, and configuration | [`git-worktree.ts:29-42`](./git-worktree.ts) |
| `SubmoduleInfo` | interface | Information about a Git submodule including URL, path, and commit hash | [`git-worktree.ts:44-55`](./git-worktree.ts) |
| `SubtreeInfo` | interface | Details about a Git subtree split including path, hash, and branch | [`git-worktree.ts:57-62`](./git-worktree.ts) |
| `SiblingWorktree` | interface | Reference to another worktree in the same repository | [`git-worktree.ts:64-71`](./git-worktree.ts) |
| `clearWorktreeCache()` | function | Clear cached worktree information | [`git-worktree.ts:84-88`](./git-worktree.ts) |
| `resolveWorktreeInfo()` | function | Resolve cached worktree info with automatic cache miss handling | [`git-worktree.ts:100-110`](./git-worktree.ts) |
| `resolveWorktreeInfoUncached()` | function | Directly resolve worktree info by inspecting .git and filesystem | [`git-worktree.ts:112-188`](./git-worktree.ts) |
| `getRepoIdentity()` | function | Get unique identifier for the repository | [`git-worktree.ts:191-194`](./git-worktree.ts) |
| `isGitWorktree()` | function | Check if the current path is a linked Git worktree | [`git-worktree.ts:199-202`](./git-worktree.ts) |
| `getMainRepoPath()` | function | Get the main repository path for a worktree | [`git-worktree.ts:209-212`](./git-worktree.ts) |
| `listSiblingWorktrees()` | function | List all other worktrees in the same repository | [`git-worktree.ts:222-269`](./git-worktree.ts) |
| `resolveGitHeadPath()` | function | Resolve the path to the Git HEAD file | [`git-worktree.ts:282-299`](./git-worktree.ts) |
| `detectSubmodules()` | function | Detect all Git submodules with caching | [`git-worktree.ts:309-319`](./git-worktree.ts) |
| `detectSubmodulesUncached()` | function | Directly detect submodules from .gitmodules and git status | [`git-worktree.ts:317-368`](./git-worktree.ts) |
| `parseGitmodules()` | function | Parse .gitmodules file into submodule metadata | [`git-worktree.ts:373-408`](./git-worktree.ts) |
| `getParentRepo()` | function | Get the parent repository information for a submodule | [`git-worktree.ts:419-445`](./git-worktree.ts) |
| `detectSubtrees()` | function | Detect all Git subtrees with caching | [`git-worktree.ts:458-468`](./git-worktree.ts) |
| `detectSubtreesUncached()` | function | Directly detect subtrees from git log history | [`git-worktree.ts:466-512`](./git-worktree.ts) |
| `IPCMessageType` | type | `"request" \| "response" \| "event"` | [`ipc-protocol.ts:17-17`](./ipc-protocol.ts) |
| `IPCRequest` | interface | Request message shape | [`ipc-protocol.ts:19-25`](./ipc-protocol.ts) |
| `IPCResponse` | interface | Response message shape | [`ipc-protocol.ts:20-28`](./ipc-protocol.ts) |
| `IPCEvent` | interface | Event message shape | [`ipc-protocol.ts:34-40`](./ipc-protocol.ts) |
| `IPCError` | interface | Error payload shape | [`ipc-protocol.ts:42-46`](./ipc-protocol.ts) |
| `IPCMessage` | type | Union of IPCRequest, IPCResponse, IPCEvent | [`ipc-protocol.ts:48-48`](./ipc-protocol.ts) |
| `ErrorCodes` | enum | RPC error code constants | [`ipc-protocol.ts:50-58`](./ipc-protocol.ts) |
| `Methods` | enum | Core RPC method names | [`ipc-protocol.ts:60-66`](./ipc-protocol.ts) |
| `Events` | enum | Core event names | [`ipc-protocol.ts:59-81`](./ipc-protocol.ts) |
| `encodeMessage()` | function | Encode IPC message to binary buffer | [`ipc-protocol.ts:80-91`](./ipc-protocol.ts) |
| `MessageDecoder` | class | Stateful decoder for binary IPC stream | [`ipc-protocol.ts:102-140`](./ipc-protocol.ts) |
| `createRequest()` | function | Create IPCRequest | [`ipc-protocol.ts:148-153`](./ipc-protocol.ts) |
| `createResponse()` | function | Create IPCResponse | [`ipc-protocol.ts:158-165`](./ipc-protocol.ts) |
| `createErrorResponse()` | function | Create error IPCResponse | [`ipc-protocol.ts:170-176`](./ipc-protocol.ts) |
| `createEvent()` | function | Create IPCEvent | [`ipc-protocol.ts:181-187`](./ipc-protocol.ts) |
| `PendingRequest` | interface | Pending RPC state | [`ipc-protocol.ts:116-192`](./ipc-protocol.ts) |
| `IPCClient` | class | Bidirectional IPC client (request/response/events) | [`ipc-protocol.ts:204-290`](./ipc-protocol.ts) |
| `AdaptiveWorkerPool` | class | Runtime-aware worker pool with queue, retry, and timeout | [`adaptive-worker.ts:57-267`](./adaptive-worker.ts) |
| `WorkerMessage` | type | Worker message envelope | [`adaptive-worker.ts:25-31`](./adaptive-worker.ts) |
| `WorkerTask` | interface | Worker task definition | [`adaptive-worker.ts:27-35`](./adaptive-worker.ts) |
| `AdaptiveWorkerOptions` | interface | Pool configuration | [`adaptive-worker.ts:37-46`](./adaptive-worker.ts) |
| `getWorkerPool()` | function | Get or create default worker pool | [`adaptive-worker.ts:76-361`](./adaptive-worker.ts) |
| `shutdownWorkerPool()` | function | Shutdown default worker pool | [`adaptive-worker.ts:288-296`](./adaptive-worker.ts) |
| `getCurrentIndexingDirectory()` | function | Get current indexing directory from context | [`indexing-context.ts:5-7`](./indexing-context.ts) |
| `setCurrentIndexingDirectory()` | function | Set current indexing directory in context | [`indexing-context.ts:16-18`](./indexing-context.ts) |

## Constraints

| Concern | Detail |
|---------|--------|
| Purity | Most read operations (`get*`, `detect*`, `resolve*`) are idempotent; lock/state mutation is not |
| Side Effects | File I/O (lock files, mkdir), git execSync, worker process creation |
| State | Singletons: ProjectContextManager, default AdaptiveWorkerPool, cached Runtime |

## Error Handling

Errors use try-catch with fallback values for I/O operations (git, fs). The IPC protocol defines JSON-RPC-style error codes. All errors are logged with context tags before propagation.

| Error | When | Recovery |
|-------|------|----------|
| `PARSE_ERROR (-32700)` | IPC JSON parsing fails | Log, drop message |
| `METHOD_NOT_FOUND (-32601)` | Unknown RPC method | Reject promise |
| `PROJECT_NOT_FOUND (-32001)` | Project not registered | Reject promise |
| `WORKER_ERROR (-32002)` | Worker task failed | Reject, retry if configured |
| `EEXIST` on lock file | Another Core process running | Check if PID alive, takeover if dead |
| Git command failure | git CLI unavailable or parse error | Return null, use defaults |
| Connection closed | IPC socket closes | Reject all pending, clear handlers |
| Request timeout | No response in 30s | Reject with timeout error |
| Task timeout | Worker exceeds time limit | Remove worker, reject, retry |

## Observability

| Event | Level | When |
|-------|-------|------|
| `[AdaptiveWorkerPool] Initialized` | info | Pool created with runtime and config |
| `Created Bun/Node.js worker` | info | New worker spawned |
| `Shutting down N workers` | info | Pool shutdown initiated |
| `Task {id} timed out` | warn | Worker task exceeded timeout |
| `Task {id} failed, retrying` | warn | Task retry triggered |
| `worker_create_fail` | error | Worker instantiation failed |
| `worker_error` | error | Worker emitted error event |
| `[ProjectContext] Switched project` | info | Active project changed |
| `Indexing started/completed for` | info | Indexing state transitions |
| `parse_fail` | error | IPC message JSON parse error |
| `handler_error` | error | IPC event handler threw exception |

## Known Limitations

- **Not thread-safe**: ProjectContextManager and AdaptiveWorkerPool use mutable state without locks; safe only in single-threaded event loop.
- **Git dependency**: Worktree and submodule detection require `.git` directory and git binary; returns empty/null on failure.
- **Platform IPC divergence**: Windows uses named pipe (`\\.\pipe\`), Unix uses domain socket; consumers must handle both.
- **No stack traces over IPC**: Error responses carry code and message only; stack traces are lost across the wire.
- **Deprecated APIs**: `indexing-context.ts`, `getProjectDir()`, `getProjectPaths()` kept for backward compatibility; prefer `ProjectContextManager` and `getGlobalDbPaths()`.
- **Worker pool fixed timeout**: Task timeout is set at pool creation and cannot be overridden per-task.
- **Worktree cache assumes stable repos**: Cache does not invalidate on external git operations; call `clearWorktreeCache()` after high-level git commands.

## TypeScript Notes

### Module Boundary

All types, interfaces, classes, and functions listed in Public API are exported. Internal state (`cachedRuntime`, `state`, `workers`, `taskQueue`, `pendingRequests`, `eventHandlers`, `nodeWorkerModule`, `indexingInProgress`, `onProjectChangeCallbacks`, `worktreeCache`, `submoduleCache`, `subtreeCache`) is private. Generic type parameters on `execute<T>`, `executeAll<T>`, and `request<T>` default to `unknown`. The `BunWorker` and `PooledWorker` interfaces are file-private to `adaptive-worker.ts`. Union types `Runtime`, `IPCMessageType`, and `IPCMessage` discriminate via string literals.

## Files

| File | Description |
|------|-------------|
| [`adaptive-worker.ts`](./adaptive-worker.ts) | Runtime-aware worker pool with Bun/Node.js abstraction, queue, retry, and timeout |
| [`git-worktree.ts`](./git-worktree.ts) | Git worktree, submodule, and subtree introspection with caching |
| [`indexing-context.ts`](./indexing-context.ts) | Deprecated backward-compatible wrapper around ProjectContextManager |
| [`ipc-protocol.ts`](./ipc-protocol.ts) | Binary wire protocol (length-prefixed JSON), message types, encoder/decoder, IPC client |
| [`project-context.ts`](./project-context.ts) | Singleton project state manager with change callbacks and indexing tracking |
| [`runtime-detect.ts`](./runtime-detect.ts) | Bun/Node.js runtime detection, Core process lifecycle, lock file management |
| [`storage-paths.ts`](./storage-paths.ts) | Platform-aware directory structure, project hashing, git branch detection, FAISS paths |
