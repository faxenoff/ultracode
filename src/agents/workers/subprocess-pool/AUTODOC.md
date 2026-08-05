# Subprocess Pool

## 🤖 Overview

The `subprocess-pool` module is designed to manage a pool of subprocesses, enabling efficient execution of tasks by reusing processes. It is primarily used by developers and system administrators to handle background tasks and resource-intensive operations, ensuring optimal performance and resource utilization.

## 🤖 Architecture

```
  +---------------------+
  |     Process Pool    |
  |     (subprocess-pool)|
  +---------------------+
          |
          v
  +---------------------+
  |     Spawner Module   |
  |     (spawner.ts)     |
  +---------------------+
          |
          v
  +---------------------+
  |     Types Module     |
  |     (types.ts)       |
  +---------------------+
```

## 🤖 Flow

```
  +---------------------+
  |     Process Pool    |
  |     (subprocess-pool)|
  +---------------------+
          |
          v
  +---------------------+
  |     Spawner Module   |
  |     (spawner.ts)     |
  +---------------------+
          |
          v
  +---------------------+
  |     Types Module     |
  |     (types.ts)       |
  +---------------------+
```

## 🤖 Entity Listing

### Function
- **bunProc** — Bun process object `spawner.ts:68-70`
- **killProcess** — Kills a child process if it exists, handling any potential errors silently `spawner.ts:162-169`
- **logBunStderr** — Logs stderr output from the subprocess `spawner.ts:37-52`
- **proc** — Process object `spawner.ts:78-78`
- **proc** — Sends a message to the process `spawner.ts:79-79`
- **proc** — Listens for "exit" or "close" events and calls a handler with the exit code `spawner.ts:80-84`
- **spawnBunProcess** — Spawns a Bun subprocess with native IPC `spawner.ts:57-102`
- **spawnNodeProcess** — Forks a Node.js process for a worker, sets up IPC communication, and logs its status `spawner.ts:107-146`
- **spawnProcess** — Spawns a process based on whether the context is using Bun or Node.js `spawner.ts:151-157`

### Interface
- **BinaryEmbedding** — Represents a binary embedding of text `types.ts:124-129`
- **BunProcess** — Bun process interface (compatible with ChildProcess for common operations) `types.ts:18-25`
- **BunProcessWrapper** — Bun process wrapper to match ChildProcess interface `spawner.ts:14-20`
- **EmbeddingTextItem** — Represents an item containing text and metadata for an embedding `types.ts:140-147`
- **ParseRequest** — Interface for a request sent to a subprocess for parsing `types.ts:69-76`
- **ParseResponse** — Interface for the response from a subprocess `types.ts:81-99`
- **PendingTask** — Pending task with resolve/reject callbacks `types.ts:30-35`
- **QueuedTask** — Represents a queued task with resolve and reject callbacks `types.ts:204-210`
- **SpawnContext** — Spawn context containing runtime info and callbacks `spawner.ts:25-32`
- **SubprocessPoolOptions** — Options for configuring a subprocess pool `types.ts:168-199`
- **SubprocessPoolStats** — Represents statistics of a subprocess pool, including worker states and task counts `types.ts:108-119`
- **SubprocessState** — State of a subprocess worker `types.ts:40-60`

### Type_alias
- **EmbeddingsCallback** — Callback function for handling embeddings `types.ts:134-134`
- **EmbeddingTextsCallback** — Callback function for handling multiple embeddings `types.ts:153-153`
- **StreamingResultCallback** — Callback function for handling streaming results `types.ts:158-163`

### Import_decl
- **../../../logging/index.js** — Imports `../../../logging/index.js` from `../../../logging/index.js`. `spawner.ts:8-8`
- **../../../types/parser.js** — Imports `../../../types/parser.js` from `../../../types/parser.js`. `types.ts:8-8`
- **../../../types/semantic.js** — Imports `../../../types/semantic.js` from `../../../types/semantic.js`. `types.ts:9-9`
- **./types.js** — Imports `./types.js` from `./types.js`. `spawner.ts:9-9`
- **node:child_process** — Imports `node:child_process` from `node:child_process`. `spawner.ts:7-7`, `types.ts:7-7`

### Property
- **activeWorkers** — Number of active workers currently processing tasks `types.ts:111-111`
- **avgProcessingTime** — Average processing time for tasks `types.ts:116-116`
- **busy** — boolean indicating if the subprocess is busy `types.ts:43-43`
- **completedTasks** — Number of tasks that have been successfully completed `types.ts:114-114`
- **content** — Text content associated with the embedding `types.ts:127-127`
- **embeddingConfig** — Configures the embedding process `types.ts:183-183`
- **error** — Error message if parsing failed `types.ts:85-85`
- **exited** — Promise<number> representing the exit code of the subprocess `types.ts:24-24`
- **failedTasks** — Number of tasks that have failed `types.ts:115-115`
- **fileCount** — number representing the number of files in a task `types.ts:34-34`
- **fileIndex** — Index of the file being processed `types.ts:97-97`
- **files** — Array of file paths to be parsed `types.ts:72-72`
- **files** — Array of files associated with a task `types.ts:206-206`
- **filesProcessed** — Number of files processed `types.ts:87-87`
- **filesProcessed** — Total number of files processed `types.ts:117-117`
- **id** — Unique identifier for the request `types.ts:71-71`
- **id** — number representing the ID of the subprocess worker `types.ts:41-41`, `types.ts:83-83`
- **id** — Unique identifier for an embedding `types.ts:125-125`
- **id** — Unique identifier for a task `types.ts:142-142`
- **id** — Unique identifier for the result `types.ts:205-205`
- **idleWorkers** — Number of idle workers not currently processing tasks `types.ts:112-112`
- **intentionalKill** — Boolean flag to distinguish intentional kill from crash `types.ts:59-59`
- **isBun** — Boolean indicating if the process is a Bun process `spawner.ts:28-28`
- **isShuttingDown** — Method to check if the process is shutting down `spawner.ts:29-29`
- **keepaliveMemoryLimitMB** — Sets the memory limit for keepalive processes `types.ts:181-181`
- **keepaliveMode** — Determines if the process should remain alive `types.ts:179-179`
- **kill** — Method to kill the spawned process `spawner.ts:17-17`
- **killAfterBatch** — Indicates whether to kill the process after a batch of tasks `types.ts:172-172`
- **language** — Language of the worker process `spawner.ts:26-26`
- **language** — Language of the files to be parsed `types.ts:73-73`
- **language** — Specifies the language for parsing tasks `types.ts:109-109`
- **maxFilesPerChunk** — Defines the maximum number of files per chunk `types.ts:173-173`
- **memoryLimitMB** — Specifies the maximum memory limit in megabytes for a task `types.ts:171-171`
- **memoryMB** — Memory used in megabytes `types.ts:92-92`
- **memoryUsage** — number representing the memory usage `types.ts:46-46`
- **memoryUsed** — Memory used during parsing `types.ts:89-89`
- **metadata** — Metadata associated with the embedding `types.ts:128-128`
- **metadata** — Optional metadata associated with the result `types.ts:146-146`
- **on** — Event listener for process exit or close events `spawner.ts:19-19`
- **onEmbeddings** — Handles the embeddings result `types.ts:185-185`
- **onEmbeddingTexts** — Processes the embedding texts `types.ts:191-191`
- **onMessage** — Callback for messages from the worker process `spawner.ts:30-30`
- **onStreamingResult** — Handles the streaming result `types.ts:198-198`
- **onUnexpectedExit** — Callback for unexpected exit of the worker process `spawner.ts:31-31`
- **options** — Optional parser options `types.ts:74-74`
- **options** — Options for a task `types.ts:207-207`
- **pendingPingResolve** — Function to resolve a pending ping task with memory usage `types.ts:57-57`
- **pendingReject** — ((error: Error) => void) | null for pending reject `types.ts:52-52`
- **pendingResolve** — ((results: ParseResult[]) => void) | null for pending resolve `types.ts:51-51`
- **pendingTasks** — Map<string, PendingTask> for concurrent task handling `types.ts:49-49`
- **pid** — Process ID of the spawned process `spawner.ts:16-16`
- **pid** — number representing the process ID of the subprocess `types.ts:22-22`
- **poolSize** — Size of the subprocess pool `types.ts:169-169`
- **process** — ChildProcess | BunProcess | null representing the subprocess `types.ts:42-42`
- **processRestarts** — Number of times the subprocess pool has been restarted `types.ts:118-118`
- **queuedTasks** — Number of tasks waiting to be processed `types.ts:113-113`
- **readyReject** — Function to reject a pending task with an error `types.ts:55-55`
- **readyResolve** — (() => void) | null for ready signal `types.ts:54-54`
- **reject** — Callback to reject a task `types.ts:209-209`
- **reject** — Function to reject a pending task with an error `types.ts:32-32`
- **resolve** — Callback to resolve a task `types.ts:208-208`
- **resolve** — Function to resolve a pending task with results `types.ts:31-31`
- **result** — Result of the parsing `types.ts:96-96`
- **results** — Array of results from the parsing `types.ts:84-84`
- **rssMB** — Resident set size in megabytes `types.ts:93-93`
- **send** — Method to send a message to the spawned process `spawner.ts:18-18`
- **sendTime** — number for IPC overhead measurement `types.ts:33-33`
- **stats** — Statistics about the parsing process `types.ts:86-90`
- **stderr** — ReadableStream<Uint8Array> for stderr output `spawner.ts:15-15`
- **stderr** — ReadableStream<Uint8Array> for error output from the subprocess `types.ts:21-21`
- **stdin** — WritableStream<Uint8Array> for input to the subprocess `types.ts:19-19`
- **stdout** — ReadableStream<Uint8Array> for output from the subprocess `types.ts:20-20`
- **streamingMode** — Boolean indicating if the worker should send streaming results `types.ts:75-75`
- **streamingMode** — Indicates if the process should handle streaming `types.ts:196-196`
- **taskId** — Task ID for the parsing `types.ts:95-95`
- **tasksProcessed** — number representing the number of tasks processed `types.ts:44-44`
- **taskTimeout** — Represents the timeout duration for a task `types.ts:170-170`
- **text** — Text content associated with the embedding text item `types.ts:144-144`
- **totalFiles** — Total number of files to be processed `types.ts:98-98`
- **totalProcessingTime** — number representing the total processing time `types.ts:45-45`
- **totalTime** — Total time taken for parsing `types.ts:88-88`
- **totalWorkers** — Total number of workers in the subprocess pool `types.ts:110-110`
- **type** — Type of the request, set to "parse" `types.ts:70-70`
- **type** — Represents the type of a result, error, or other status `types.ts:82-82`
- **vectorBuffer** — Buffer containing the binary vector of the embedding `types.ts:126-126`
- **workerScript** — Script to be executed by the worker process `spawner.ts:27-27`

## Data Flow

- **Inputs**: Worker ID, subprocess state reference, spawn context with runtime info and callbacks.
- **Processing**: Spawns subprocess using Bun.spawn or Node.js fork(), sets up IPC message handlers, configures stderr logging, registers unexpected exit handlers.
- **Outputs**: Initialized subprocess with IPC channel, ready for parse request messages.

## Public API

| Export | Type | Description | Location |
|--------|------|-------------|----------|
| `spawnProcess` | function | Spawns subprocess based on runtime (Bun or Node.js) | [`spawner.ts:151-157`](./spawner.ts) |
| `spawnBunProcess` | function | Spawns Bun subprocess with native IPC | [`spawner.ts:57-100`](./spawner.ts) |
| `spawnNodeProcess` | function | Spawns Node.js subprocess via fork() with IPC | [`spawner.ts:107-146`](./spawner.ts) |
| `killProcess` | function | Safely terminates a subprocess | [`spawner.ts:162-169`](./spawner.ts) |
| `SpawnContext` | interface | Context with runtime info, callbacks, and worker script path | [`spawner.ts:25-32`](./spawner.ts) |
| `BunProcess` | interface | Bun process interface with IPC support | [`types.ts:18-25`](./types.ts) |
| `PendingTask` | interface | Task resolve/reject callbacks with timing metadata | [`types.ts:30-35`](./types.ts) |
| `SubprocessState` | interface | Worker state with process, pending tasks map, and flags | [`types.ts:55-63`](./types.ts) |
| `ParseRequest` | interface | IPC parse request with files, language, and options | [`types.ts:59-81`](./types.ts) |
| `ParseResponse` | interface | IPC response with results, errors, or streaming data | [`types.ts:92-92`](./types.ts) |
| `SubprocessPoolStats` | interface | Pool statistics (workers, tasks, timing, restarts) | [`types.ts:108-119`](./types.ts) |
| `SubprocessPoolOptions` | interface | Pool creation options (size, memory, keepalive, streaming) | [`types.ts:168-199`](./types.ts) |
| `QueuedTask` | interface | Queued task with files and resolve/reject | [`types.ts:204-210`](./types.ts) |
| `BinaryEmbedding` | interface | Binary embedding with vector buffer and metadata | [`types.ts:124-129`](./types.ts) |
| `EmbeddingTextItem` | interface | Text item for centralized embedding generation | [`types.ts:140-147`](./types.ts) |
| `EmbeddingsCallback` | type | Callback for receiving binary embeddings | [`types.ts:134-134`](./types.ts) |
| `EmbeddingTextsCallback` | type | Callback for receiving embedding texts | [`types.ts:153-153`](./types.ts) |
| `StreamingResultCallback` | type | Callback for streaming parse results | [`types.ts:158-199`](./types.ts) |

## Dependencies

### Internal Modules

| Module | Purpose |
|--------|---------|
| `types/parser` | ParseResult, ParserOptions types |
| `types/semantic` | WorkerEmbeddingConfig type |
| `logging` | Structured logging |

### External Packages

| Package | Purpose |
|---------|---------|
| (none) | Uses Node.js built-in `child_process` module |

## Behavioral Properties

| Property | Value |
|----------|-------|
| IPC serialization | V8 native `advanced` mode (structured clone) |
| Concurrent task handling | `Map<taskId, PendingTask>` per worker (no race conditions) |
| Process types | Bun.spawn or Node.js fork(), auto-detected |

## Error Handling

Subprocess kill errors are silently ignored (process may already be dead). Unexpected exit events are forwarded to the parent pool via `onUnexpectedExit` callback. Bun stderr is read asynchronously with read errors suppressed on process exit.

## Known Limitations

- Bun process wrapper provides only a subset of ChildProcess interface (no full event emitter support).
- Legacy `pendingResolve`/`pendingReject` fields on SubprocessState are kept for backward compatibility but should not be used.
- Worker environment variables are the only way to pass initial configuration (language, worker ID).

## Files

| File | Description |
|------|-------------|
| `types.ts` | Type definitions for processes, IPC messages, pool configuration, and embeddings |
| `spawner.ts` | Platform-specific subprocess creation for Bun and Node.js |
| `index.ts` | Re-exports spawner functions and all types |
