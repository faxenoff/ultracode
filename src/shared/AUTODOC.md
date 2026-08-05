# Shared Module

> Foundation utilities providing runtime detection, project state management, binary IPC protocol, platform-aware storage paths, git worktree/submodule/subtree introspection, and an adaptive worker pool that abstracts Bun/Node.js differences.

## Overview

The `shared` module contains cross-cutting concerns used throughout the ultracode project. It detects whether the runtime is Bun or Node.js and provides appropriate abstractions. ProjectContextManager tracks the active project as a singleton. The IPC protocol implements length-prefixed JSON over named pipes (Windows) or Unix domain sockets. Storage paths follow platform conventions (LOCALAPPDATA, XDG_DATA_HOME, Application Support) with hash-based project directories. Git introspection utilities discover worktrees, submodules, and subtrees. The adaptive worker pool manages concurrency with automatic retry and timeout handling.

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
| `IPCResponse` | interface | Response message shape | [`ipc-protocol.ts:27-32`](./ipc-protocol.ts) |
| `IPCEvent` | interface | Event message shape | [`ipc-protocol.ts:34-40`](./ipc-protocol.ts) |
| `IPCError` | interface | Error payload shape | [`ipc-protocol.ts:42-46`](./ipc-protocol.ts) |
| `IPCMessage` | type | Union of IPCRequest, IPCResponse, IPCEvent | [`ipc-protocol.ts:48-48`](./ipc-protocol.ts) |
| `ErrorCodes` | enum | RPC error code constants | [`ipc-protocol.ts:50-58`](./ipc-protocol.ts) |
| `Methods` | enum | Core RPC method names | [`ipc-protocol.ts:60-66`](./ipc-protocol.ts) |
| `Events` | enum | Core event names | [`ipc-protocol.ts:68-72`](./ipc-protocol.ts) |
| `encodeMessage()` | function | Encode IPC message to binary buffer | [`ipc-protocol.ts:80-95`](./ipc-protocol.ts) |
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
| `getWorkerPool()` | function | Get or create default worker pool | [`adaptive-worker.ts:275-283`](./adaptive-worker.ts) |
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