# Versioning

## 🤖 Overview

The `version-manager.ts` module manages code snapshots for both Git worktrees and non-git projects, providing features like streaming file copy, xxHash integrity checks, and automatic cleanup. It is used by developers to maintain version control and backup their code effectively.

## 🤖 Architecture

```
  +-------------------+
  |   Version Manager |
  |   (Git Worktree)  |
  +-------------------+
          |
          v
  +-------------------+
  |   Snapshot Manager |
  |   (Snapshot Logic) |
  +-------------------+
          |
          v
  +-------------------+
  |   Stream Helpers  |
  |   (File Copy)     |
  +-------------------+
          |
          v
  +-------------------+
  |   xxHash Integrity |
  |   (File Check)    |
  +-------------------+
```

## 🤖 Flow

```
  +-------------------+
  |   Version Manager |
  |   (Git Worktree)  |
  +-------------------+
          |
          v
  +-------------------+
  |   Snapshot Manager |
  |   (Snapshot Logic) |
  +-------------------+
          |
          v
  +-------------------+
  |   Stream Helpers  |
  |   (File Copy)     |
  +-------------------+
          |
          v
  +-------------------+
  |   xxHash Integrity |
  |   (File Check)    |
  +-------------------+
          |
          v
  +-------------------+
  |   Backup Manager  |
  |   (Backup Logic)  |
  +-------------------+
```

## 🤖 Entity Listing

### Function
- **walk** — Walks through the file system to find tracked files `version-manager.ts:440-458`

### Method
- **cleanup** — Cleans up old snapshots based on the configured auto cleanup days `version-manager.ts:201-217`
- **constructor** — Initializes the Version Manager with a configuration `version-manager.ts:66-73`
- **createBackupSnapshot** — Creates a backup snapshot `version-manager.ts:331-392`
- **createGitSnapshot** — Creates a Git worktree snapshot `version-manager.ts:230-283`
- **createSnapshot** — Creates a new snapshot of the current working directory `version-manager.ts:96-102`
- **deleteSnapshot** — Deletes a specific snapshot `version-manager.ts:163-196`
- **detectGit** — Detects whether the current directory is a Git repository `version-manager.ts:468-475`
- **getAllTrackedFiles** — Retrieves all tracked files in the current working directory `version-manager.ts:427-462`
- **getGitChangedFiles** — Retrieves changed files in a Git worktree snapshot `version-manager.ts:302-325`
- **getSnapshotMetadata** — Retrieves metadata for a specific snapshot `version-manager.ts:222-224`
- **initialize** — Initializes the Version Manager, setting up necessary components `version-manager.ts:78-91`
- **listSnapshots** — Lists all available snapshots `version-manager.ts:126-158`
- **loadMetadata** — Loads metadata for a snapshot `version-manager.ts:485-499`
- **rollback** — Rolls back to a previous snapshot `version-manager.ts:107-121`
- **rollbackBackup** — Rolls back to a backup snapshot `version-manager.ts:394-425`
- **rollbackGit** — Rolls back to a Git worktree snapshot `version-manager.ts:285-300`
- **saveMetadata** — Saves metadata for a snapshot `version-manager.ts:477-483`

### Class
- **VersionManager** — Manages code snapshots with automatic backend selection `version-manager.ts:62-500`

### Interface
- **SnapshotListEntry** — Represents an entry in the list of snapshots, including ID, timestamp, description, backend type, size in bytes, and number of files `version-manager.ts:49-56`
- **SnapshotMetadata** — Represents metadata for a code snapshot, including its ID, timestamp, description, backend type, affected files, total size, hash, and optional git stash reference or backup path `version-manager.ts:30-40`
- **VersionManagerConfig** — Configuration for the Version Manager, including working directory, backup directory, maximum number of snapshots, and automatic cleanup days `version-manager.ts:42-47`

### Import_decl
- **../logging/index.js** — Imports `../logging/index.js` from `../logging/index.js`. `version-manager.ts:22-22`
- **../utils/fast-hash.js** — Imports `../utils/fast-hash.js` from `../utils/fast-hash.js`. `version-manager.ts:23-23`
- **../utils/stream-helpers.js** — Imports `../utils/stream-helpers.js` from `../utils/stream-helpers.js`. `version-manager.ts:24-24`
- **node:child_process** — Imports `node:child_process` from `node:child_process`. `version-manager.ts:18-18`
- **node:fs** — Imports `node:fs` from `node:fs`. `version-manager.ts:19-19`
- **node:fs/promises** — Imports `node:fs/promises` from `node:fs/promises`. `version-manager.ts:20-20`
- **node:path** — Imports `node:path` from `node:path`. `version-manager.ts:21-21`

### Property
- **autoCleanupDays** — Days after which old snapshots are automatically cleaned up, defaulting to 7 days `version-manager.ts:46-46`
- **backend** — Indicates whether the snapshot is from a git worktree or a backup directory `version-manager.ts:34-34`
- **backend** — Determines the backend for snapshot management, either Git worktree or backup `version-manager.ts:53-53`
- **backupDir** — Backup directory for the Version Manager, defaulting to ".backup" `version-manager.ts:44-44`
- **backupPath** — Optional backup path for backup backend snapshots `version-manager.ts:39-39`
- **config** — Configuration for the Version Manager, including working directory, backup directory, max snapshots, and auto cleanup days `version-manager.ts:63-63`
- **description** — Description of the snapshot `version-manager.ts:33-33`
- **description** — Manages code snapshots with automatic backend selection `version-manager.ts:52-52`
- **filesAffected** — List of files affected by the snapshot `version-manager.ts:35-35`
- **filesCount** — Represents the number of files affected by a snapshot `version-manager.ts:55-55`
- **gitStashRef** — Optional git stash reference for git backend snapshots `version-manager.ts:38-38`
- **hasGit** — Indicates whether the project is a Git repository `version-manager.ts:64-64`
- **hash** — xxHash of the snapshot content `version-manager.ts:37-37`
- **id** — Unique identifier for a snapshot `version-manager.ts:31-31`
- **id** — Represents the unique identifier for a version `version-manager.ts:50-50`
- **maxSnapshots** — Maximum number of snapshots to keep, defaulting to 10 `version-manager.ts:45-45`
- **sizeBytes** — Represents the size of a snapshot in bytes `version-manager.ts:54-54`
- **timestamp** — Timestamp when the snapshot was created `version-manager.ts:32-32`
- **timestamp** — Stores the timestamp of the version `version-manager.ts:51-51`
- **totalSizeBytes** — Total size of the snapshot in bytes `version-manager.ts:36-36`
- **workingDirectory** — Working directory for the Version Manager `version-manager.ts:43-43`

## Entities

### Interfaces

**SnapshotMetadata** (`version-manager.ts:30-40`) — Stores snapshot identity, timestamp, description, backend type, affected files, total size, xxHash for integrity, and backend-specific references (git stash ref or backup path).

**VersionManagerConfig** (`version-manager.ts:42-47`) — Configuration object specifying working directory, optional backup directory path, and maximum snapshot count before automatic cleanup.

**SnapshotListEntry** (`version-manager.ts:49-56`) — Summary entry for snapshot listings containing ID, timestamp, description, and backend type.

### Classes

**VersionManager** (`version-manager.ts:62-506`) — Main class managing the complete snapshot lifecycle including creation, rollback, metadata storage, and automatic cleanup with transparent Git/backup backend selection.

### Public API Methods

**constructor** (`version-manager.ts:67-74`) — Initializes the VersionManager with configuration and sets up internal state for snapshot operations.

**initialize** (`version-manager.ts:79-93`) — Detects Git repository presence and creates backup directory if needed, setting up the snapshot backend.

**createSnapshot** (`version-manager.ts:98-108`) — Creates a new snapshot using the appropriate backend (Git or backup) with provided description and returns snapshot ID.

**rollback** (`version-manager.ts:113-127`) — Restores project state to a previously captured snapshot using the backend that originally created it.

**listSnapshots** (`version-manager.ts:132-164`) — Returns array of available snapshots with metadata, loading information from disk and applying optional filtering.

**deleteSnapshot** (`version-manager.ts:169-202`) — Permanently removes a snapshot's metadata and backend storage (git stash or backup files).

**cleanup** (`version-manager.ts:62-500`) — Removes snapshots older than specified retention period (default 30 days) to maintain disk space.

### Git Backend Methods

**createGitSnapshot** (`version-manager.ts:236-289`) — Creates snapshot via Git stash or worktree, captures current repository state, stores metadata with Git references, and computes xxHash.

**rollbackGit** (`version-manager.ts:291-306`) — Restores Git repository state from stashed changes or worktree reference.

**getGitChangedFiles** (`version-manager.ts:308-331`) — Returns list of modified files since last commit by parsing Git diff output.

### Backup Backend Methods

**createBackupSnapshot** (`version-manager.ts:337-398`) — Creates snapshot by streaming files to backup directory, computing xxHash for each file, and storing comprehensive metadata.

**rollbackBackup** (`version-manager.ts:400-431`) — Restores files from backup snapshot directory back to working tree.

### Utility Methods

**getSnapshotMetadata** (`version-manager.ts:62-500`) — Retrieves full metadata object for a specific snapshot ID.

**getAllTrackedFiles** (`version-manager.ts:62-500`) — Gathers all project files excluding node_modules and build artifacts via recursive directory walk with exclude patterns.

**detectGit** (`version-manager.ts:474-481`) — Checks if working directory is a Git repository by looking for .git directory.

**saveMetadata** (`version-manager.ts:483-489`) — Writes snapshot metadata to JSON file in metadata directory.

**loadMetadata** (`version-manager.ts:485-499`) — Reads and parses snapshot metadata from JSON file.

### Internal Functions

**walk** (`version-manager.ts:446-464`) — Recursively traverses directory tree yielding relative paths of files not matching exclude patterns.

**pattern** (`version-manager.ts:427-462`) — Converts glob pattern string to RegExp for exclude matching during file enumeration.

## Dependencies

**Internal:**
- `src/utils/stream-helpers.ts` — Streaming file copy utilities for large file handling
- ~~`src/logging/index.js`~~ (deleted) — Logging system for snapshot operations

**External:**
- `xxhash-wasm` — WebAssembly-based xxHash for file integrity verification
- Node.js built-ins: `child_process` (Git execution), `fs/promises` (async file operations), `path` (path utilities)
