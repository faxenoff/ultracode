# Sync

## 🤖 Overview

The `file-sync` module facilitates bidirectional synchronization between .md files on disk and an SQLite database. It ensures that changes made to .md files are validated and updated in the database, while changes in the database are reflected in the corresponding .md files. This module is used by developers and maintainers to keep documentation files and the database in sync, ensuring consistency and reliability.

## 🤖 Architecture

```
       +-------------------+
       |   File Sync Module |
       +-------------------+
           /         \
       +-------------+     +-------------+
       | Disk Files  |     | SQLite DB  |
       +-------------+     +-------------+
           \         /
       +-------------+
       | File Ops    |
       +-------------+
           |
           v
       +-------------------+
       |   File Sync Logic |
       +-------------------+
           |
           v
       +-------------------+
       |   Sync Results    |
       +-------------------+
```

## 🤖 Flow

```
       +-------------------+
       |   File Sync Module |
       +-------------------+
           /         \
       +-------------+     +-------------+
       | Disk Files  |     | SQLite DB  |
       +-------------+     +-------------+
           \         /
       +-------------+
       | File Ops    |
       +-------------+
           |
           v
       +-------------------+
       |   Sync Logic      |
       +-------------------+
           |
           v
       +-------------------+
       |   Sync Results    |
       +-------------------+
           |
           v
       +-------------------+
       |   Sync Results    |
       +-------------------+
```

## 🤖 Entity Listing

### Function
- **dbTime** — Calculates the latest update time from a list of documents `file-sync.ts:261-261`
- **findMarkdownFiles** — Function to find all .md files in a directory recursively `file-sync.ts:54-108`
- **generateMarkdownFromDocs** — Generates a markdown string from an array of documents, sorted by section `file-sync.ts:191-216`
- **groupDocsByFile** — Groups documents by their file path `file-sync.ts:176-186`
- **lastSync** — Calculates the last sync time based on existing documents `file-sync.ts:143-143`
- **levelResults** — Results from processing a level of directories in parallel `file-sync.ts:65-96`
- **readDocumentFromDisk** — Reads a document from a file `file-sync.ts:331-343`
- **sorted** — Sorts an array of documents by their section, with empty sections first `file-sync.ts:193-198`
- **syncBidirectional** — Synchronizes documents between disk and database in both directions `file-sync.ts:300-314`
- **syncDbToDisk** — Synchronizes changes from SQLite database to .md files on disk `file-sync.ts:237-291`
- **syncDiskToDb** — Synchronizes .md files from disk to SQLite database `file-sync.ts:118-167`
- **writeDocToFile** — Writes a document to a file `file-sync.ts:222-231`
- **writeDocumentToDisk** — Writes a document to a file `file-sync.ts:323-325`

### Interface
- **FileInfo** — Interface representing file information including path and modification time `file-sync.ts:41-44`
- **FileSyncResult** — Represents the result of file synchronization between disk and database `file-sync.ts:27-39`

### Import_decl
- **../../utils/file-ops.js** — Imports `../../utils/file-ops.js` from `../../utils/file-ops.js`. `file-sync.ts:19-19`
- **../../utils/parallel.js** — Imports `../../utils/parallel.js` from `../../utils/parallel.js`. `file-sync.ts:20-20`
- **../types.js** — Imports `../types.js` from `../types.js`. `file-sync.ts:21-21`
- **node:path** — Imports `node:path` from `node:path`. `file-sync.ts:18-18`

### Property
- **added** — Array of files added during disk to database sync `file-sync.ts:30-30`
- **content** — Reads the content of a document from disk and returns it along with the modification time `file-sync.ts:331-331`
- **dbToDisk** — Contains the result of syncing files from database to disk `file-sync.ts:35-38`
- **depth** — Depth of directory traversal `file-sync.ts:56-56`
- **depth** — Represents the depth of a directory path in an array `file-sync.ts:71-71`
- **diskToDb** — Contains the result of syncing files from disk to database `file-sync.ts:29-33`
- **error** — Represents an error encountered during file operations `file-sync.ts:32-32`
- **error** — Not applicable in this context `file-sync.ts:37-37`
- **errors** — Array of errors encountered during disk to database sync `file-sync.ts:32-32`
- **errors** — Stores an array of objects containing file paths and error messages `file-sync.ts:37-37`
- **file** — Represents a file in the file system `file-sync.ts:32-32`
- **file** — Not applicable in this context `file-sync.ts:37-37`
- **mtime** — Modification time of a file `file-sync.ts:43-43`
- **mtime** — Reads the modification time of a document from disk and returns it along with the content `file-sync.ts:331-331`
- **path** — Path to a file or directory `file-sync.ts:42-42`
- **path** — Represents a directory path and its depth in an array `file-sync.ts:56-56`
- **path** — Represents an array of subdirectories with their paths and depths `file-sync.ts:71-71`
- **updated** — Array of files updated during disk to database sync `file-sync.ts:31-31`
- **written** — Array of files written during database to disk sync `file-sync.ts:36-36`

## Data Flow

- **Inputs**: Documentation directory path, callback functions for DB queries (`getDocsByFile`, `getAllDocs`, `saveDocument`), and concurrency settings.
- **Processing**: `findMarkdownFiles` performs BFS with parallel directory reads and stat calls. `syncDiskToDb` compares file mtimes against `lastSync` timestamps. `syncDbToDisk` groups docs by file, generates markdown, and compares DB `updatedAt` against file mtime.
- **Outputs**: `FileSyncResult` with disk-to-DB results (added/updated/errors) and DB-to-disk results (written/errors).

## Public API

| Export | Type | Description | Location |
|--------|------|-------------|----------|
| `FileInfo` | interface | File path and modification time | [`file-sync.ts:43-43`](./file-sync.ts) |
| `FileSyncResult` | interface | Combined result of bidirectional sync (diskToDb + dbToDisk) | [`file-sync.ts:27-39`](./file-sync.ts) |
| `findMarkdownFiles` | function | Recursively discovers all .md files with BFS and parallel stat | [`file-sync.ts:54-108`](./file-sync.ts) |
| `syncDiskToDb` | function | Syncs newer disk files to database via provided callbacks | [`file-sync.ts:118-167`](./file-sync.ts) |
| `syncDbToDisk` | function | Syncs database documents to disk when DB is newer | [`file-sync.ts:237-291`](./file-sync.ts) |
| `syncBidirectional` | function | Full bidirectional sync: disk-to-DB then DB-to-disk | [`file-sync.ts:300-314`](./file-sync.ts) |
| `writeDocumentToDisk` | function | Writes a single document to disk, creating directories as needed | [`file-sync.ts:323-325`](./file-sync.ts) |
| `readDocumentFromDisk` | function | Reads a document from disk returning content and mtime, or null | [`file-sync.ts:331-331`](./file-sync.ts) |

## Dependencies

### Internal Modules

| Module | Purpose |
|--------|---------|
| `autodoc/types` | `DocEntity` type definition for document records |
| `utils/file-ops` | Optimized file operations (readdir, readText, writeFile, fileExists, stat, mkdir) |
| `utils/parallel` | `mapParallel` for concurrent file discovery and sync operations |

### External Packages

| Package | Purpose |
|---------|---------|
| `node:path` | Path manipulation for directory traversal and file joining |

## Behavioral Properties

| Property | Value |
|----------|-------|
| Default concurrency | 8 parallel file operations |
| Max directory depth | 5 levels for markdown file discovery |
| Sync direction priority | Disk-to-DB first (preserves user edits), then DB-to-disk |

## Error Handling

File discovery silently skips unreadable directories and files that cannot be stat'd. Sync operations catch per-file errors and collect them in the `errors` array of the result rather than failing the entire operation. Directory creation for write operations uses `recursive: true` to handle missing parent directories.

## Known Limitations

- Timestamp-based change detection may miss simultaneous edits where the file and database have the same modification time.
- The `generateMarkdownFromDocs` function infers heading levels from section ID depth, which may not match the original document structure.
- Hidden directories and `node_modules` are always skipped during file discovery with no configuration option.

## Exports

- `findMarkdownFiles`
- `readDocumentFromDisk`
- `syncBidirectional`
- `syncDbToDisk`
- `syncDiskToDb`
- `writeDocumentToDisk`

## Files

| File | Description |
|------|-------------|
| [`file-sync.ts`](./file-sync.ts) | Complete sync implementation: BFS file discovery, disk-to-DB/DB-to-disk sync, bidirectional sync, single-file read/write |
| [`index.ts`](./index.ts) | Module barrel file re-exporting file-sync types and functions |
