# Dev

Recursively collects source files respecting patterns, supports multiple languages via AST and heuristic parsing, and manages incremental indexing with vendored directory detection.

## Overview

The dev module provides the file discovery and classification layer for the DevAgent. It recursively scans directories using Bun.Glob or fast-glob (with `.ultracodeignore` support), classifies files by extension into code vs. data categories, and provides heuristic entity creation for unsupported languages. The module also contains the incremental indexer (file separation, vector provider setup, batch processing) and the indexing pipeline (phased initialization, change detection, stale entity cleanup, and result building).

## Data Flow

- **Inputs**: A root directory path, exclude patterns, and agent configuration.
- **Processing**: Scans directories (async via Bun.Glob/fast-glob or sync via Node.js fs), filters by supported extensions, separates files by language support, processes through parser or heuristic paths, manages incremental change detection.
- **Outputs**: `CollectFilesResult` with file paths and scan statistics; `IndexingResult` with counts of processed files, entities, and relationships.

## Public API

| Export | Type | Description | Location |
|--------|------|-------------|----------|
| `collectFiles` | function | Synchronously collects files with extension filtering | [`file-collector.ts:298-362`](./file-collector.ts) |
| `collectFilesAsync` | function | Async file collection using Bun.Glob or fast-glob | [`file-collector.ts:413-476`](./file-collector.ts) |
| `CollectFilesOptions` | interface | Options for file collection (patterns, agentId) | [`file-collector.ts:141-150`](./file-collector.ts) |
| `CollectFilesResult` | interface | Result with files array and scan statistics | [`file-collector.ts:153-161`](./file-collector.ts) |
| `loadIgnoreFile` | function | Loads patterns from `.ultracodeignore` | [`file-collector.ts:29-63`](./file-collector.ts) |
| `SUPPORTED_CODE_EXTENSIONS` | const | Extensions with AST parsing support | [`file-extensions.ts:12-77`](./file-extensions.ts) |
| `SUPPORTED_DATA_EXTENSIONS` | const | Extensions without AST parsing (configs, docs) | [`file-extensions.ts:44-77`](./file-extensions.ts) |
| `ALL_SUPPORTED_EXTENSIONS` | const | Combined array of all supported extensions | [`file-extensions.ts:72-72`](./file-extensions.ts) |
| `isCodeExtension` | function | Checks if extension supports AST parsing | [`file-extensions.ts:75-77`](./file-extensions.ts) |
| `isDataExtension` | function | Checks if extension is a data file | [`file-extensions.ts:80-82`](./file-extensions.ts) |
| `createHeuristicEntities` | function | Creates module entities for non-parseable files | [`heuristic-parser.ts:48-88`](./heuristic-parser.ts) |
| `separateFilesBySupport` | function | Separates files into supported and heuristic groups | [`incremental-indexer.ts:74-100`](./incremental-indexer.ts) |
| `setupVectorProvider` | function | Configures FAISS vector provider for incremental indexing | [`incremental-indexer.ts:101-150`](./incremental-indexer.ts) |
| `setupEmbeddingGenerator` | function | Configures EmbeddingGenerator for centralized mode | [`incremental-indexer.ts:178-225`](./incremental-indexer.ts) |
| `processSupportedFiles` | function | Batch-parses supported files through ParserAgent | [`incremental-indexer.ts:220-270`](./incremental-indexer.ts) |
| `processHeuristicFiles` | function | Processes unsupported files via heuristic parser | [`incremental-indexer.ts:279-310`](./incremental-indexer.ts) |
| `flushPendingEmbeddings` | function | Flushes accumulated embeddings to FAISS index | [`incremental-indexer.ts:335-366`](./incremental-indexer.ts) |
| `initializeIndexing` | function | Phase 1: validates params and collects files | [`indexing-pipeline.ts:90-113`](./indexing-pipeline.ts) |
| `detectChangedFiles` | function | Phase 2: detects changed, new, and deleted files | [`indexing-pipeline.ts:124-195`](./indexing-pipeline.ts) |
| `cleanStaleEntities` | function | Phase 3: removes entities for changed/deleted files | [`indexing-pipeline.ts:209-241`](./indexing-pipeline.ts) |
| `applyChangeAnalysis` | function | Phase 4: applies change analysis to indexing context | [`indexing-pipeline.ts:255-281`](./indexing-pipeline.ts) |
| `separateCodeAndDataFiles` | function | Phase 5: separates files by code vs data extension | [`indexing-pipeline.ts:301-327`](./indexing-pipeline.ts) |
| `buildIndexingResult` | function | Builds final indexing result summary | [`indexing-pipeline.ts:340-437`](./indexing-pipeline.ts) |
| `VendoredDetectionResult` | interface | Container for vendored directory detection results with prefixes and timing | [`vendored-detector.ts:58-70`](./vendored-detector.ts) |
| `detectVendoredDirectories` | function | Recursively scans directory tree to identify vendored code paths | [`vendored-detector.ts:84-158`](./vendored-detector.ts) |
| `detectKnownVendored` | function | Identifies directories matching known vendored path segment patterns | [`vendored-detector.ts:164-194`](./vendored-detector.ts) |
| `detectArchMirrors` | function | Detects architecture-specific mirror directories common in compiled projects | [`vendored-detector.ts:222-261`](./vendored-detector.ts) |
| `detectMassHeaders` | function | Identifies directories with many similar short files characteristic of generated code | [`vendored-detector.ts:261-305`](./vendored-detector.ts) |
| `estimateAvgLoc` | function | Samples files and estimates average lines of code in a directory | [`vendored-detector.ts:310-331`](./vendored-detector.ts) |
| `isVendoredPath` | function | Checks if a path matches known vendored directory patterns | [`vendored-detector.ts:341-350`](./vendored-detector.ts) |
| `isSkipEmbeddingExtension` | function | Determines if file extension should be excluded from embedding generation | [`vendored-detector.ts:355-357`](./vendored-detector.ts) |
| `KNOWN_VENDORED_SEGMENTS` | const | Set of path segment patterns indicating vendored or third-party code | [`vendored-detector.ts:23-37`](./vendored-detector.ts) |
| `SKIP_EMBEDDING_EXTENSIONS` | const | Set of file extensions excluded from semantic embedding | [`vendored-detector.ts:40-40`](./vendored-detector.ts) |
| `ARCH_MIRROR_MIN_SUBDIRS` | const | Minimum architecture subdirectories threshold for mirror detection | [`vendored-detector.ts:43-43`](./vendored-detector.ts) |
| `MASS_HEADER_MIN_FILES` | const | Minimum file count for identifying mass-generated content directories | [`vendored-detector.ts:46-46`](./vendored-detector.ts) |
| `MASS_HEADER_MAX_AVG_LOC` | const | Maximum average lines of code threshold for generated code detection | [`vendored-detector.ts:49-49`](./vendored-detector.ts) |
| `LOC_SAMPLE_SIZE` | const | Number of files sampled when estimating average lines of code | [`vendored-detector.ts:52-52`](./vendored-detector.ts) |

## Dependencies

### Internal Modules

| Module | Purpose |
|--------|---------|
| `logging` | Structured logging |
| `storage/graph-storage-factory` | Graph storage for change detection |
| `semantic/faiss/*` | FAISS vector provider initialization |
| `semantic/embedding-generator` | Embedding generation |
| `config/yaml-config` | Configuration loading |
| `utils/runtime` | Bun runtime detection |

### External Packages

| Package | Purpose |
|---------|---------|
| `fast-glob` | Async glob-based file scanning on Node.js |

## Behavioral Properties

| Property | Value |
|----------|-------|
| Supported code languages | JS, TS, Python, Go, Rust, Java, C/C++, Kotlin, Swift, C#, CSS, HTML, JSON, Zig |
| Ignore file | `.ultracodeignore` (gitignore-style syntax) |
| Async scanning | Bun.Glob on Bun runtime, fast-glob on Node.js |

## Error Handling

File read errors and stat failures are logged and skipped without aborting the scan. Heuristic parser creates minimal module entities as fallback for any file that cannot be AST-parsed.

## Known Limitations

- Synchronous `collectFiles` does not use Bun.Glob (reserved for async path).
- Heuristic parser only creates a single module-level entity per file with no internal structure.
- Change detection relies on mtime comparison, which may miss files modified within the same second.

## Exports

- `collectFiles`
- `collectFilesAsync`
- `ALL_SUPPORTED_EXTENSIONS`
- `isCodeExtension`
- `isDataExtension`
- `SUPPORTED_CODE_EXTENSIONS`
- `SUPPORTED_DATA_EXTENSIONS`

## Files

| File | Description |
|------|-------------|
| `file-collector.ts` | Recursive file collection with exclude pattern support and runtime-aware scanning |
| `file-extensions.ts` | Supported file extension constants and classification functions |
| `heuristic-parser.ts` | Creates simple module entities for unsupported languages |
| `incremental-indexer.ts` | Incremental reindexing: file separation, provider setup, batch processing |
| `indexing-pipeline.ts` | Multi-phase indexing pipeline: init, change detection, cleanup, file separation |
| `vendored-detector.ts` | Detects vendored and generated code directories using heuristic analysis |
| `index.ts` | Re-exports file collector and extension utilities |