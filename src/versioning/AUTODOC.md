# Versioning

Manages code snapshots with automatic git worktree or backup directory fallback.

## Overview

The Versioning module manages code snapshots using a hybrid backend strategy: Git-based snapshots (via stash/worktree) for Git repositories, and file-based backups for non-Git projects. It provides atomic snapshot creation, rollback, and lifecycle management with xxHash integrity verification and automatic cleanup of aged snapshots. The module abstracts away backend selection, allowing callers to snapshot, restore, and track file changes uniformly regardless of repository type.

## Flow

```
Initialize (detect Git/backup backend)
            ↓
    ┌───────┴────────┐
    ↓                ↓
 Git Worktree    Backup Dir
 (stash/refs)    (file copy)
    ↓                ↓
    └───────┬────────┘
            ↓
    Store Snapshot Metadata
    (ID, timestamp, hash, files)
            ↓
    ┌───────────────────────┐
    ↓                       ↓
 Cleanup Old Snapshots   Rollback to Snapshot
 (by age/count limit)    (restore state)
            ↓                       ↓
            └───────────┬──────────┘
                        ↓
                    Return result
```

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