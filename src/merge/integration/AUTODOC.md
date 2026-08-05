# Integration

## 🤖 Overview

The `merge/integration` module provides utilities for safe git operations during merge processes, particularly for managing branch checkouts, detecting changed files, and restoring branches. It is used by developers and tools that require robust git interaction for version control tasks.

## 🤖 Architecture

```
  +---------------------+
  | Git Integration     |
  | (merge/integration) |
  +---------------------+
  |     /               |
  |    /                |
  |   /                 |
  |  /                  |
  | /                   |
  |/                    |
  +---------------------+
  | GitBranchInfo       |
  | GitFileChange       |
  | GitDiffResult       |
  | GitIntegrationConfig |
  +---------------------+
```

## 🤖 Flow

```
  +---------------------+
  | Git Integration     |
  | (merge/integration) |
  +---------------------+
  |     /               |
  |    /                |
  |   /                 |
  |  /                  |
  | /                   |
  |/                    |
  +---------------------+
  | GitBranchInfo       |
  | GitFileChange       |
  | GitDiffResult       |
  | GitIntegrationConfig |
  +---------------------+
  |     /               |
  |    /                |
  |   /                 |
  |  /                  |
  | /                   |
  |/                    |
  +---------------------+
  | GitOperations       |
  | GitWatcher          |
  | BranchManager       |
  +---------------------+
```

## 🤖 Entity Listing

### Method
- **branchExists** — Not present in the provided code `git-integration.ts:139-150`
- **checkoutBranch** — Not present in the provided code `git-integration.ts:157-187`
- **cleanup** — Not present in the provided code `git-integration.ts:426-430`
- **constructor** — Initializes a GitIntegration instance with configuration and validates the repository exists `git-integration.ts:55-66`
- **getAllBranches** — Not present in the provided code `git-integration.ts:404-421`
- **getChangedFiles** — Not present in the provided code `git-integration.ts:382-399`
- **getChangedFilesBetween** — Not present in the provided code `git-integration.ts:234-286`
- **getCommitHash** — Not present in the provided code `git-integration.ts:121-134`
- **getCurrentBranch** — Not present in the provided code `git-integration.ts:87-116`
- **getDiffStats** — Not present in the provided code `git-integration.ts:291-326`
- **getFileContent** — Not present in the provided code `git-integration.ts:356-370`
- **getMergeBase** — Not present in the provided code `git-integration.ts:333-347`
- **hasUncommittedChanges** — Not present in the provided code `git-integration.ts:216-229`
- **isGitRepository** — Checks if the given path is a git repository `git-integration.ts:79-82`
- **repoPath** — Returns the repository path `git-integration.ts:72-74`
- **restoreOriginalBranch** — Not present in the provided code `git-integration.ts:192-211`

### Class
- **GitIntegration** — A class for performing git operations, including checking out branches, detecting changed files, and restoring the original branch `git-integration.ts:51-431`

### Interface
- **GitBranchInfo** — Represents information about a Git branch, including its name, commit hash, short hash, and whether it is detached `git-integration.ts:21-26`
- **GitDiffResult** — Represents the result of a git diff operation, including the list of changed files, insertions, deletions, and the number of files changed `git-integration.ts:34-39`
- **GitFileChange** — Represents a change in a file, including its path, status, and optionally the old path for renamed files `git-integration.ts:28-32`
- **GitIntegrationConfig** — Configuration for the Git integration, including the repository path, whether to allow detached heads, and whether to restore the original branch on error `git-integration.ts:41-45`

### Import_decl
- **../../logging/index.js** — Imports `../../logging/index.js` from `../../logging/index.js`. `git-integration.ts:4-4`
- **node:child_process** — Imports `node:child_process` from `node:child_process`. `git-integration.ts:1-1`
- **node:fs** — Imports `node:fs` from `node:fs`. `git-integration.ts:2-2`
- **node:path** — Imports `node:path` from `node:path`. `git-integration.ts:3-3`

### Property
- **allowDetachedHead** — Whether to allow checkout of commits or tags `git-integration.ts:43-43`
- **commitHash** — The full commit hash of the branch `git-integration.ts:23-23`
- **config** — The configuration for the Git integration `git-integration.ts:52-52`
- **deletions** — The number of deletions in the diff `git-integration.ts:37-37`
- **files** — The list of changed files `git-integration.ts:35-35`
- **filesChanged** — The number of files that have changed `git-integration.ts:38-38`
- **insertions** — The number of insertions in the diff `git-integration.ts:36-36`
- **isDetached** — Indicates whether the branch is detached `git-integration.ts:25-25`
- **name** — The name of the Git branch `git-integration.ts:22-22`
- **oldPath** — The old path of the file if it has been renamed `git-integration.ts:31-31`
- **originalBranch** — The original branch before any git operations `git-integration.ts:53-53`
- **path** — The path of the file that has changed `git-integration.ts:29-29`
- **repoPath** — Stores the path to the repository `git-integration.ts:42-42`
- **restoreOnError** — Whether to restore the original branch on error `git-integration.ts:44-44`
- **shortHash** — The short commit hash of the branch `git-integration.ts:24-24`
- **status** — The status of the file change, such as added, modified, deleted, or renamed `git-integration.ts:30-30`

## Data Flow

- **Inputs**: Repository path, branch names, and git references (commits, tags).
- **Processing**: Executes git CLI commands (checkout, diff, merge-base, rev-parse) via child_process.execSync.
- **Outputs**: GitFileChange arrays, GitDiffResult statistics, commit hashes, branch info, and file content at specific revisions.

## Public API

| Export | Type | Description | Location |
|--------|------|-------------|----------|
| `GitIntegration` | class | Safe git operations for merge with automatic branch restoration | [`git-integration.ts:51-431`](./git-integration.ts) |
| `GitIntegrationConfig` | interface | Configuration with repoPath and safety flags | [`git-integration.ts:41-45`](./git-integration.ts) |
| `GitBranchInfo` | interface | Branch name, commit hash, and detached state info | [`git-integration.ts:21-26`](./git-integration.ts) |
| `GitFileChange` | interface | File change with path, status, and optional oldPath for renames | [`git-integration.ts:28-32`](./git-integration.ts) |
| `GitDiffResult` | interface | Diff statistics with file changes, insertions, and deletions | [`git-integration.ts:34-39`](./git-integration.ts) |

## Dependencies

### Internal Modules

| Module | Purpose |
|--------|---------|
| `logging` | Structured logging |

### External Packages

| Package | Purpose |
|---------|---------|
| `node:child_process` | Git CLI execution via execSync |
| `node:fs` | Repository .git directory validation |
| `node:path` | Path joining for git directory check |

## Behavioral Properties

| Property | Value |
|----------|-------|
| Branch restoration | Automatic on error when restoreOnError is true (default) |
| Uncommitted changes | Checkout is blocked if working directory has uncommitted changes |
| Detached HEAD | Supported via allowDetachedHead config option (default: false) |

## Error Handling

Throws descriptive errors when branches do not exist, commit hashes cannot be resolved, or checkout fails with uncommitted changes. On checkout failure with restoreOnError enabled, automatically restores the original branch before re-throwing. Diff and merge-base operations return empty results on failure rather than throwing.

## Known Limitations

- Uses synchronous execSync for git commands, which blocks the event loop during execution.
- No support for worktree-based parallel checkout (would eliminate sequential branch switching).
- Rename detection relies on git's built-in rename scoring rather than semantic analysis.

## Files

| File | Description |
|------|-------------|
| `git-integration.ts` | Git CLI wrapper with safe checkout, diff, merge-base, and branch restoration |
| `index.ts` | Re-exports all git integration types and classes |
