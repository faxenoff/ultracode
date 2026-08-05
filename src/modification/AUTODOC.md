# modification

Safe entity-based code modification with snapshots, previews, and validation.

## Overview

Entity-based code and file modification engine with transactional workflow and full audit trail support. All destructive operations support preview-first mode, automatic snapshot creation for rollback, before/after validation tracking, and incremental graph and embedding updates. Handles large files (>1 MB) via streaming; uses WASM SIMD-accelerated diff when available. Three core classes collaborate: `CodeModifier` orchestrates entity code replacement, `FileOperations` provides copy/rename/split/synthesize workflows, and `PreviewManager` generates unified diffs with impact estimation. Operations default to dry-run (preview) mode unless explicitly applied.

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
| `.previewCodeModification(entityId, newCode)` | Generate unified diff for entity code replacement with metrics and impact estimation | [`preview-manager.ts:100-139`](./preview-manager.ts) |
| `.previewFileOperation(op, params)` | Generate unified diff for file operations (copy/rename/split/synthesize) | [`preview-manager.ts:144-147`](./preview-manager.ts) |
| `DiffPreview` | Unified diff with per-file hunks, summary statistics, and impact estimation (complexity/coverage changes) | [`preview-manager.ts:32-46`](./preview-manager.ts) |
| `FileDiff` | Single file diff with old/new paths and unified-format hunks | [`preview-manager.ts:48-54`](./preview-manager.ts) |
| `DiffHunk` | Hunk with old/new line ranges and unified diff line content | [`preview-manager.ts:56-62`](./preview-manager.ts) |

### File Operations

| Export | Description | Location |
|--------|-------------|----------|
| `FileOperations` | High-level file manipulation with streaming, graph sync, and import updates | [`file-operations.ts:68-517`](./file-operations.ts) |
| `.copy(source, target, opts)` | Copy file or directory tree with streaming support for large files | [`file-operations.ts:78-103`](./file-operations.ts) |
| `.rename(oldPath, newPath, opts)` | Rename file or directory with automatic import path updates across project | [`file-operations.ts:105-158`](./file-operations.ts) |
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