# modification

## 🤖 Overview

The `modification` module provides a robust framework for safe code modification, enabling users to replace code with version snapshots, previews, and validation. It is used by developers and maintainers to ensure code integrity and consistency during updates.

## 🤖 Architecture

```
  +-------------------+
  | Code Modifier     |
  | (code-modifier.ts)|
  +-------------------+
          |
          v
  +-------------------+
  | Version Manager   |
  | (version-manager.ts)|
  +-------------------+
          |
          v
  +-------------------+
  | Preview Manager   |
  | (preview-manager.ts)|
  +-------------------+
          |
          v
  +-------------------+
  | Code Validator    |
  | (code-validator.ts)|
  +-------------------+
          |
          v
  +-------------------+
  | Stream Helpers    |
  | (stream-helpers.ts)|
  +-------------------+
```

## 🤖 Flow

```
  +-------------------+
  | Code Modifier     |
  | (code-modifier.ts)|
  +-------------------+
          |
          v
  +-------------------+
  | Code Validator    |
  | (code-validator.ts)|
  +-------------------+
          |
          v
  +-------------------+
  | Version Manager   |
  | (version-manager.ts)|
  +-------------------+
          |
          v
  +----------------
  | Preview Manager  |
  | (preview-manager.ts)|
  +----------------+
          |
          v
  +-------------------+
  | Stream Helpers    |
  | (stream-helpers.ts)|
  +-------------------+
```

## 🤖 Entity Listing

### Function
- **copyResults** — Results of file copy operations `file-operations.ts:357-357`
- **entities** — Entities affected by file operations `file-operations.ts:174-174`
- **entities** — Represents entities in the graph storage `file-operations.ts:496-496`
- **entities** — Stores entities affected by the preview `preview-manager.ts:422-422`
- **hasGeneratedFrom** — Checks if the entity was generated from another entity `code-modifier.ts:162-162`
- **hasProducesApi** — Checks if the entity produces an API `code-modifier.ts:159-159`
- **newEntities** — New entities created by file operations `file-operations.ts:412-418`
- **updatedEntity** — Represents the updated entity after modification `code-modifier.ts:352-352`
- **validEntities** — Valid entities for file operations `file-operations.ts:175-175`
- **validEntities** — Represents valid entities in the graph storage `file-operations.ts:497-497`
- **validEntities** — Stores valid entities affected by the preview `preview-manager.ts:424-424`
- **walk** — Method to walk through a directory `file-operations.ts:329-377`

### Method
- **computeDiff** — Computes the diff between old and new file paths `preview-manager.ts:185-196`
- **computeDiffFallback** — Fallback method for computing diff if SIMD is not available `preview-manager.ts:201-245`
- **constructor** — Initializes the CodeModifier with graph storage, vector store, and working directory `code-modifier.ts:62-70`
- **constructor** — Constructor for the FileOperations class, initializing graph storage, vector store, and preview manager `file-operations.ts:69-73`
- **constructor** — Constructor for the PreviewManager class `preview-manager.ts:72-75`
- **copy** — Method to copy files or directories, supporting streaming for large files `file-operations.ts:78-100`
- **copyDirectory** — Method to copy a directory `file-operations.ts:318-388`
- **copyFile** — Method to copy a single file `file-operations.ts:282-316`
- **countAdditions** — Counts the number of additions in the diff hunks `preview-manager.ts:288-290`
- **countDeletions** — Counts the number of deletions in the diff hunks `preview-manager.ts:295-297`
- **detectSignatureChange** — Detects changes in the signature of the file `preview-manager.ts:323-349`
- **duplicateEmbeddings** — Duplicates embeddings for a given entity `file-operations.ts:453-457`
- **duplicateEntitiesInGraph** — Method to duplicate entities in the graph `file-operations.ts:404-423`
- **estimateImpact** — Estimates the impact of the preview on entities, embeddings, and relationships `preview-manager.ts:306-318`
- **findImporters** — Finds entities that import a given file `file-operations.ts:483-489`
- **initialize** — Initializes the version manager and preview manager `code-modifier.ts:75-79`
- **initialize** — Method to initialize the PreviewManager `preview-manager.ts:80-95`
- **mergeEmbeddings** — Merges embeddings from multiple entities `file-operations.ts:459-463`
- **mergeEntitiesInGraph** — Merges entities into the graph storage `file-operations.ts:425-439`
- **modifyEntity** — Modifies an entity in the graph storage `code-modifier.ts:84-191`
- **parseDiffHunks** — Parses diff hunks from the unified diff format `preview-manager.ts:250-283`
- **previewCodeModification** — Method to preview code modifications `preview-manager.ts:100-139`
- **previewCopy** — Provides a preview for copying a file `preview-manager.ts:358-387`
- **previewFileOperation** — Method to preview file operations `preview-manager.ts:144-176`
- **previewRename** — Provides a preview for renaming a file `preview-manager.ts:392-416`
- **previewSplit** — Provides a preview for splitting a file `preview-manager.ts:421-441`
- **previewSynthesize** — Synthesizes the preview for the file `preview-manager.ts:446-462`
- **removeEntitiesFromFile** — Removes entities from a file `file-operations.ts:495-513`
- **rename** — Method to rename files or directories with automatic import updates `file-operations.ts:105-155`
- **replaceEntityCode** — Replaces the code of an entity `code-modifier.ts:208-222`
- **replaceInMemory** — Replaces the code of an entity in memory `code-modifier.ts:227-263`
- **rollback** — Rolls back the last code modification `code-modifier.ts:196-199`
- **split** — Method to split files into entities and update the graph `file-operations.ts:160-214`
- **synthesize** — Method to synthesize multiple files into a single file `file-operations.ts:219-276`
- **updateEmbeddingsFilePath** — Updates the file path for embeddings `file-operations.ts:445-451`
- **updateEntityEmbedding** — Updates the embedding of an entity `code-modifier.ts:287-336`
- **updateEntityInGraph** — Updates an entity in the graph storage `code-modifier.ts:272-282`
- **updateFilePathInGraph** — Method to update file paths in the graph `file-operations.ts:394-402`
- **updateImportsAcrossProject** — Updates import paths across the project `file-operations.ts:469-481`
- **updateRelationships** — Updates the relationships of an entity `code-modifier.ts:341-378`

### Class
- **CodeModifier** — Provides safe code modification with version snapshots, previews, validation, and embedding updates `code-modifier.ts:57-379`
- **FileOperations** — Class for performing file operations with streaming and graph updates `file-operations.ts:68-514`
- **PreviewManager** — Class for managing code modification previews `preview-manager.ts:68-463`

### Interface
- **CodeModificationRequest** — Represents a request for modifying code with specific parameters `code-modifier.ts:32-39`
- **CodeModificationResult** — Represents the result of a code modification operation `code-modifier.ts:41-51`
- **CopyOptions** — Options for copying files, including preview mode and graph update `file-operations.ts:42-45`
- **CopyResult** — Result of a file copy operation `file-operations.ts:323-327`
- **DiffHunk** — Represents a hunk of a diff, including the start and end lines in both the old and new versions of the file `preview-manager.ts:56-62`
- **DiffPreview** — Represents a preview of a destructive operation, including operation details, files affected, and changes `preview-manager.ts:32-46`
- **FileDiff** — Represents a diff for a specific file, including its path, before and after content, and hunks `preview-manager.ts:48-54`
- **FileOperationResult** — Represents the outcome of a file operation, including success status, affected files, operation type, and optional preview or entity details `file-operations.ts:33-40`
- **RenameOptions** — Options for renaming files, including preview mode, import update, and graph update `file-operations.ts:47-51`
- **SplitOptions** — Options for splitting files, including preview mode and graph update `file-operations.ts:53-56`
- **SynthesizeOptions** — Options for synthesizing files, including preview mode, deleting originals, and updating the graph `file-operations.ts:58-62`

### Import_decl
- **../logging/index.js** — Imports `../logging/index.js` from `../logging/index.js`. `code-modifier.ts:18-18`, `file-operations.ts:22-22`, `preview-manager.ts:20-20`
- **../semantic/embedding-generator.js** — Imports `../semantic/embedding-generator.js` from `../semantic/embedding-generator.js`. `code-modifier.ts:19-19`
- **../semantic/vector-store.js** — Imports `../semantic/vector-store.js` from `../semantic/vector-store.js`. `code-modifier.ts:20-20`, `file-operations.ts:23-23`, `preview-manager.ts:21-21`
- **../types/storage.js** — Imports `../types/storage.js` from `../types/storage.js`. `code-modifier.ts:21-21`, `file-operations.ts:24-24`, `preview-manager.ts:22-22`
- **../types/wasm-modules.js** — Imports `../types/wasm-modules.js` from `../types/wasm-modules.js`. `preview-manager.ts:23-23`
- **../utils/file-ops.js** — Imports `../utils/file-ops.js` from `../utils/file-ops.js`. `code-modifier.ts:22-22`, `file-operations.ts:25-25`
- **../utils/stream-helpers.js** — Imports `../utils/stream-helpers.js` from `../utils/stream-helpers.js`. `code-modifier.ts:23-23`, `file-operations.ts:26-26`
- **../validation/code-validator.js** — Imports `../validation/code-validator.js` from `../validation/code-validator.js`. `code-modifier.ts:24-24`
- **../versioning/version-manager.js** — Imports `../versioning/version-manager.js` from `../versioning/version-manager.js`. `code-modifier.ts:25-25`
- **./preview-manager.js** — Imports `./preview-manager.js` from `./preview-manager.js`. `code-modifier.ts:26-26`, `file-operations.ts:27-27`
- **nanoid** — Imports `nanoid` from `nanoid`. `file-operations.ts:21-21`
- **node:fs/promises** — Imports `node:fs/promises` from `node:fs/promises`. `preview-manager.ts:19-19`
- **node:path** — Imports `node:path` from `node:path`. `file-operations.ts:20-20`

### Property
- **additions** — Counts the number of additions in the diff `preview-manager.ts:37-37`
- **after** — Contains the content of the file after the operation `preview-manager.ts:51-51`
- **before** — Contains the content of the file before the operation `preview-manager.ts:50-50`
- **changes** — Contains details of changes made to files `preview-manager.ts:35-35`
- **computeDiffSimd** — Function for computing SIMD-accelerated diff `preview-manager.ts:70-70`
- **deleteOriginals** — Option to delete original files after synthesis `file-operations.ts:60-60`
- **deletions** — Counts the number of deletions in the diff `preview-manager.ts:38-38`
- **dest** — Destination directory or file for file operations `file-operations.ts:332-332`
- **diff** — Represents the unified diff format of the file changes `preview-manager.ts:52-52`
- **embeddingsToUpdate** — Counts the number of embeddings that need to be updated `preview-manager.ts:43-43`
- **embeddingsUpdated** — Number of embeddings updated `code-modifier.ts:45-45`
- **embeddingsUpdated** — The number of embeddings updated by the operation `file-operations.ts:39-39`
- **embeddingsUpdated** — Embeddings updated by a file operation `file-operations.ts:326-326`
- **entitiesAffected** — The number of entities affected by the operation `file-operations.ts:38-38`
- **entitiesAffected** — Entities affected by a file operation `file-operations.ts:325-325`
- **entitiesAffected** — Counts the number of entities affected by the operation `preview-manager.ts:42-42`
- **entitiesUpdated** — Array of entity IDs updated `code-modifier.ts:44-44`
- **entityId** — Entity ID from the graph storage `code-modifier.ts:33-33`
- **entityIds** — IDs of entities affected by the operation `preview-manager.ts:149-149`
- **entityIds** — Stores IDs of entities affected by the preview `preview-manager.ts:165-165`, `preview-manager.ts:166-166`
- **estimatedImpact** — Estimates the impact of the operation on entities, embeddings, and relationships `preview-manager.ts:41-45`
- **filePath** — File path for the operation `preview-manager.ts:149-149`
- **filePath** — Stores the file path for preview operations `preview-manager.ts:165-165`, `preview-manager.ts:166-166`
- **files** — Files affected by the operation `preview-manager.ts:150-150`
- **files** — Stores a list of files affected by the preview `preview-manager.ts:170-170`, `preview-manager.ts:171-171`
- **filesAffected** — An array of file paths affected by the operation `file-operations.ts:35-35`
- **filesAffected** — Files affected by a file operation `file-operations.ts:324-324`
- **filesAffected** — Lists the files affected by the operation `preview-manager.ts:34-34`
- **filesModified** — Array of file paths modified `code-modifier.ts:43-43`
- **fromId** — Retrieves an entity by its ID `code-modifier.ts:159-159`, `code-modifier.ts:162-162`
- **hunks** — Contains the hunks of the diff `preview-manager.ts:53-53`
- **lines** — Array of lines in the code `preview-manager.ts:61-61`
- **modifications** — Counts the number of modifications in the diff `preview-manager.ts:39-39`
- **newCode** — New code for replacement `code-modifier.ts:34-34`
- **newLines** — Number of lines in the new code `preview-manager.ts:60-60`
- **newPath** — New path for the file operation `preview-manager.ts:148-148`, `preview-manager.ts:160-160`
- **newPath** — Represents the new file path after modification `preview-manager.ts:161-161`
- **newStart** — Starting index of the new code `preview-manager.ts:59-59`
- **oldLines** — Number of lines in the original code `preview-manager.ts:58-58`
- **oldPath** — Old path for the file operation `preview-manager.ts:148-148`, `preview-manager.ts:160-160`
- **oldPath** — Represents the original file path before modification `preview-manager.ts:161-161`
- **oldStart** — Represents the starting position of the old preview `preview-manager.ts:57-57`
- **operation** — The type of file operation performed, such as copy, rename, split, or synthesize `file-operations.ts:36-36`
- **operation** — Specifies the type of operation being previewed `preview-manager.ts:33-33`
- **path** — Specifies the path of the file being diffed `preview-manager.ts:49-49`
- **preserveComments** — Boolean flag to preserve comments during code modification `code-modifier.ts:35-35`
- **preview** — Boolean flag to enable preview mode `code-modifier.ts:37-37`, `code-modifier.ts:47-47`
- **preview** — An optional preview of the operation's changes `file-operations.ts:37-37`, `file-operations.ts:43-43`, `file-operations.ts:48-48`, `file-operations.ts:54-54`
- **preview** — Preview mode for file operations `file-operations.ts:59-59`
- **previewManager** — Manages previews for code modifications `code-modifier.ts:59-59`
- **relationshipsAffected** — Counts the number of relationships affected by the operation `preview-manager.ts:44-44`
- **relationshipsUpdated** — Number of relationships updated `code-modifier.ts:46-46`
- **skipValidation** — Boolean flag to skip validation `code-modifier.ts:38-38`
- **snapshotId** — Snapshot ID for rollback if versioning is enabled `code-modifier.ts:49-49`
- **source** — Source path for the file operation `preview-manager.ts:147-147`, `preview-manager.ts:155-155`, `preview-manager.ts:156-156`
- **src** — Source directory or file for file operations `file-operations.ts:332-332`
- **stats** — Provides statistics on the number of additions, deletions, and modifications `preview-manager.ts:36-40`
- **success** — Boolean indicating whether the modification was successful `code-modifier.ts:42-42`
- **success** — Indicates whether the file operation was successful `file-operations.ts:34-34`
- **swaggerWarning** — Represents a warning if the entity is related to the swagger contract `code-modifier.ts:50-50`
- **target** — Target path for the file operation `preview-manager.ts:147-147`, `preview-manager.ts:155-155`, `preview-manager.ts:156-156`
- **targetPath** — Target path for the file operation `preview-manager.ts:150-150`
- **targetPath** — Stores the target path for file operations `preview-manager.ts:170-170`, `preview-manager.ts:171-171`
- **type** — Represents the type of the entity `code-modifier.ts:159-159`, `code-modifier.ts:162-162`
- **updateGraph** — Indicates whether the graph should be updated after the operation `file-operations.ts:44-44`, `file-operations.ts:50-50`, `file-operations.ts:55-55`
- **updateGraph** — Option to update the graph after file operations `file-operations.ts:61-61`
- **updateImports** — Boolean flag to update imports if the signature changes `code-modifier.ts:36-36`
- **updateImports** — Indicates whether imports should be updated after the operation `file-operations.ts:49-49`
- **validationReport** — BeforeAfterReport object if validation is performed `code-modifier.ts:48-48`
- **validator** — Validates code modifications before and after changes `code-modifier.ts:60-60`
- **versionManager** — Manages version snapshots for code modifications `code-modifier.ts:58-58`
- **wasmDiffAvailable** — Boolean indicating if WASM diff is available `preview-manager.ts:69-69`

## Data Flow

```
Request (modifyEntity / copy / rename / split / synthesize)
  ↓
[1] PreviewManager generates DiffPreview (return early if preview=true)
  ↓
[2] VersionManager.createSnapshot() for rollback
  ↓
[3] CodeValidator.validateFile() pre-check (if !skipValidation)
  ↓
[4] Core modification (in-memory <1 MB, streaming >1 MB)
  ↓
[5] GraphStorage.updateEntity() with new hash/timestamps
  ↓
[6] EmbeddingGenerator + VectorStore.update() (if available)
  ↓
[7] Import updates across project (if updateImports, rename only)
  ↓
[8] CodeValidator post-check, compare improvement metrics
  ↓
Success: return result | Error: auto-rollback via VersionManager
```

## Public API

### Main Entry Point

| Export | Description | Location |
|--------|-------------|----------|
| `CodeModifier` | Main entity code replacement engine with 9-phase workflow | [`code-modifier.ts:56-357`](./code-modifier.ts) |
| `.initialize()` | Initialize VersionManager, PreviewManager, and CodeValidator | [`code-modifier.ts:74-78`](./code-modifier.ts) |
| `.modifyEntity(request)` | Execute full entity modification workflow with snapshot, validation, and embedding updates | [`code-modifier.ts:83-168`](./code-modifier.ts) |
| `.rollback(snapshotId)` | Rollback filesystem and graph state to a specific snapshot | [`code-modifier.ts:173-176`](./code-modifier.ts) |

### Request & Result Types

| Export | Description | Location |
|--------|-------------|----------|
| `CodeModificationRequest` | Entity modification request specifying entity ID, new code, and control options (preview, validation, import updates) | [`code-modifier.ts:32-39`](./code-modifier.ts) |
| `CodeModificationResult` | Result object with modified files, embedding metadata, validation report, and snapshots created | [`code-modifier.ts:41-50`](./code-modifier.ts) |

### Preview System

| Export | Description | Location |
|--------|-------------|----------|
| `PreviewManager` | Universal preview engine supporting entity modification, copy, rename, split, and synthesize operations | [`preview-manager.ts:68-463`](./preview-manager.ts) |
| `.previewCodeModification(entityId, newCode)` | Generate unified diff for entity code replacement with metrics and impact estimation | [`preview-manager.ts:68-463`](./preview-manager.ts) |
| `.previewFileOperation(op, params)` | Generate unified diff for file operations (copy/rename/split/synthesize) | [`preview-manager.ts:144-147`](./preview-manager.ts) |
| `DiffPreview` | Unified diff with per-file hunks, summary statistics, and impact estimation (complexity/coverage changes) | [`preview-manager.ts:32-46`](./preview-manager.ts) |
| `FileDiff` | Single file diff with old/new paths and unified-format hunks | [`preview-manager.ts:48-54`](./preview-manager.ts) |
| `DiffHunk` | Hunk with old/new line ranges and unified diff line content | [`preview-manager.ts:56-62`](./preview-manager.ts) |

### File Operations

| Export | Description | Location |
|--------|-------------|----------|
| `FileOperations` | High-level file manipulation with streaming, graph sync, and import updates | [`file-operations.ts:68-517`](./file-operations.ts) |
| `.copy(source, target, opts)` | Copy file or directory tree with streaming support for large files | [`file-operations.ts:78-103`](./file-operations.ts) |
| `.rename(oldPath, newPath, opts)` | Rename file or directory with automatic import path updates across project | [`file-operations.ts:105-155`](./file-operations.ts) |
| `.split(filePath, entityIds, opts)` | Extract specific entities from a file into separate files | [`file-operations.ts:160-217`](./file-operations.ts) |
| `.synthesize(files, targetPath, opts)` | Merge multiple files into a single target with optional deletion of sources | [`file-operations.ts:219-276`](./file-operations.ts) |

### Operation Options & Results

| Export | Description | Location |
|--------|-------------|----------|
| `CopyOptions` | Configuration for copy operation (preview mode, graph updates) | [`file-operations.ts:42-45`](./file-operations.ts) |
| `RenameOptions` | Configuration for rename operation (preview mode, import updates, graph updates) | [`file-operations.ts:47-51`](./file-operations.ts) |
| `SplitOptions` | Configuration for split operation (preview mode, graph updates) | [`file-operations.ts:54-54`](./file-operations.ts) |
| `SynthesizeOptions` | Configuration for synthesize operation (preview mode, delete originals, graph updates) | [`file-operations.ts:58-62`](./file-operations.ts) |
| `FileOperationResult` | Result object with affected file counts, embeddings metadata, and validation report | [`file-operations.ts:33-40`](./file-operations.ts) |

## Architecture & Design Patterns

### Three-Class Collaboration

**CodeModifier** (`code-modifier.ts`) orchestrates the full modification lifecycle for entity code replacement:
1. Snapshot creation before any changes
2. Diff preview generation
3. Pre-validation check
4. Core replacement (in-memory or streaming)
5. Graph entity update with hash/timestamp
6. Embedding generation and vector store sync
7. Cross-project import path updates
8. Post-validation and metrics comparison
9. Auto-rollback on failure

**FileOperations** (`file-operations.ts`) provides batched file-level mutations:
- Copy/rename/split/synthesize with optional preview mode
- Streaming support for files >1 MB (via `streamCopyFile`, `streamReplaceRange`)
- Automatic graph entity creation/deletion and embedding sync
- Import path rewriting on rename via regex-based search

**PreviewManager** (`preview-manager.ts`) generates unified diffs for all operations:
- Line-by-line diff calculation (WASM SIMD-accelerated if available)
- Hunk aggregation with context
- Impact estimation (complexity delta, coverage impact)
- Supports both code modification and file operations

### Streaming Strategy

Files under 1 MB are held in memory; files over 1 MB use Node.js streams to avoid memory overhead. The `streamReplaceRange()` helper reads the source file in chunks, buffers unchanged regions, and writes the replacement target atomically.

### Validation Workflow

Before/after validation phases compare:
- Syntax validity (parser acceptance)
- Complexity metrics (cyclomatic, cognitive)
- Test coverage changes
- Custom rule violations

Results tracked in `CodeModificationResult.validationReport` for audit trail.

### Snapshot & Rollback

`VersionManager.createSnapshot()` captures filesystem and graph state before modifications. On error or user request, `rollback(snapshotId)` restores all modified files and graph entities atomically.

## Dependencies

| Module | Purpose | Import Path |
|--------|---------|-------------|
| VersionManager | Snapshot creation and atomic rollback | ~~`../versioning/version-manager.js`~~ (deleted) |
| CodeValidator | Before/after validation and metrics comparison | ~~`../validation/code-validator.js`~~ (deleted) |
| EmbeddingGenerator | Generate code embeddings for vector database | ~~`../semantic/embedding-generator.js`~~ (deleted) |
| VectorStore (type) | Vector embedding storage and query interface | ~~`../semantic/vector-store.js`~~ (deleted) |
| GraphStorage (type) | Entity and relationship CRUD operations | ~~`../types/storage.js`~~ (deleted) |
| IncrementalParser | Re-parse modified code for signature changes | ~~`../parsers/incremental-parser.js`~~ (deleted) |
| CommentExtractor | Extract and associate code comments with entities | ~~`../utils/comment-extractor.js`~~ (deleted) |
| readText, stat, writeFile, mkdir, readdir, rm, copyFile | File system I/O operations | ~~`../utils/file-ops.js`~~ (deleted) |
| streamReplaceRange, streamCopyFile | Streaming for large file handling | ~~`../utils/stream-helpers.js`~~ (deleted) |
| log | Structured logging interface | ~~`../logging/index.js`~~ (deleted) |
| nanoid | Generate unique entity identifiers | `nanoid` |
| xxhash-wasm | WASM SIMD-accelerated 64-bit hashing for diff performance | `xxhash-wasm` |

## Known Limitations & Design Trade-offs

1. **WASM diff fallback** — WASM SIMD module may not exist at runtime; JavaScript fallback (line-by-line) is slower for large diffs (>100 KB).

2. **Comment preservation scope** — Only detects `//`, `/*`, `*` prefixes; upward scan from entity start stops at first non-comment line, so multi-line doc comments separated from code may be missed.

3. **Import update regex-based** — Uses pattern `from ['"]${oldPath}['"]` only; does not handle CommonJS `require()`, dynamic imports, or re-exports.

4. **No partial-failure rollback** — If error occurs after file write but before graph update, snapshot rollback may leave graph state inconsistent with filesystem.

5. **VectorStore optional** — Constructor accepts `VectorStore | null`; guarded by runtime checks before every use, but embedding features silently disabled if null.

6. **Entity type casting** — Dynamic storage/parser type mismatch requires `entity as unknown as ParsedEntity` cast in `updateEntityEmbedding()`.

7. **Copy operation idempotency** — Existing target files are overwritten without confirmation in apply mode; preview mode shows affected count but does not diff each target.

## Files

| File | Lines | Exports | Purpose |
|------|-------|---------|---------|
| [`code-modifier.ts`](./code-modifier.ts) | 357 | CodeModificationRequest, CodeModificationResult, CodeModifier | Entity code replacement engine with 9-phase workflow (snapshot, preview, validation, embedding, import sync, rollback) |
| [`file-operations.ts`](./file-operations.ts) | 517 | FileOperationResult, CopyOptions, RenameOptions, SplitOptions, SynthesizeOptions, FileOperations | Copy/rename/split/synthesize with streaming, graph entity sync, and cross-project import updates |
| [`preview-manager.ts`](./preview-manager.ts) | 463 | DiffPreview, FileDiff, DiffHunk, PreviewManager | Universal diff preview with WASM SIMD acceleration, hunk aggregation, and impact estimation |
