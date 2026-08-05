# Dev

## 🤖 Overview

The `dev` module in `src/agents` is designed for collecting and processing source files, particularly those related to code and data extensions. It is used by developers and data engineers to manage and index files efficiently. The module includes utilities for file collection, extension detection, and incremental indexing, making it a crucial component in the development and data engineering workflows.

## 🤖 Entity Listing

### Function
- **applyChangeAnalysis** — Applies change analysis to the files `indexing-pipeline.ts:255-281`
- **buildIndexingResult** — Builds the indexing result based on the context `indexing-pipeline.ts:826-839`
- **cleanStaleEntities** — Cleans stale entities from the graph `indexing-pipeline.ts:209-241`
- **collectFiles** — Collects files from a directory `file-collector.ts:298-362`
- **collectFilesAsync** — Asynchronously collects files using fast-glob `file-collector.ts:417-480`
- **collectFilesWithBunGlob** — Uses Bun.Glob.scan() to collect files under Bun runtime `file-collector.ts:182-226`
- **collectFilesWithFastGlob** — Collects files using fast-glob `file-collector.ts:369-407`
- **collectFilesWithNodeFs** — Collects files using Node.js fs module `file-collector.ts:232-290`
- **createHeuristicEntities** — Creates heuristic entities for a file that can't be parsed with AST, generating a single module entity representing the file `heuristic-parser.ts:48-88`
- **currentFilesSet** — Represents the current set of files used for indexing `indexing-pipeline.ts:173-173`
- **dbEntities** — Stores database entities `indexing-pipeline.ts:754-754`
- **defaultIgnorePatterns** — Default ignore patterns for file collection `file-collector.ts:195-195`, `file-collector.ts:376-376`
- **detectArchMirrors** — Detects architecture mirrors `vendored-detector.ts:200-255`
- **detectChangedFiles** — Detects changed files based on the current and previous file sets `indexing-pipeline.ts:125-196`
- **detectKnownVendored** — Detects known vendored path segments `vendored-detector.ts:164-194`
- **detectMassHeaders** — Detects mass headers `vendored-detector.ts:261-305`
- **detectVendoredDirectories** — Detects vendored/generated directories `vendored-detector.ts:84-158`
- **estimateAvgLoc** — Estimates average LOC for mass-header heuristic `vendored-detector.ts:310-331`
- **flushPendingEmbeddings** — Flushes pending embeddings from the parser agent to the FAISS index and saves the index to disk `incremental-indexer.ts:322-353`
- **getCachedRegex** — Creates and caches a regular expression based on a given pattern `file-collector.ts:103-117`
- **hasCodeEntities** — Checks if the directory contains code entities `indexing-pipeline.ts:653-653`
- **hasDbEntities** — Checks if the directory contains database entities `indexing-pipeline.ts:652-652`
- **hasGraphQL** — Checks if the directory contains GraphQL files `indexing-pipeline.ts:551-551`
- **hasProtobuf** — Checks if the files contain Protobuf links `indexing-pipeline.ts:451-451`
- **hasSwagger** — Checks if the files contain Swagger links `indexing-pipeline.ts:344-344`
- **initializeIndexing** — Initializes the indexing process with given options `indexing-pipeline.ts:90-113`
- **isCodeExtension** — Determines if a file extension is supported for code parsing and AST extraction `file-extensions.ts:146-148`
- **isDataExtension** — Determines if a file extension is supported for non-AST indexing and semantic merge `file-extensions.ts:151-153`
- **isSkipEmbeddingExtension** — Checks if a file extension should be skipped for embeddings `vendored-detector.ts:355-357`
- **isSupportedFile** — Checks if a file name is supported based on its extension or name `file-collector.ts:141-150`
- **isVendoredPath** — Checks if a path is a vendored path `vendored-detector.ts:341-350`
- **loadIgnoreFile** — Loads patterns from .ultracodeignore file if it exists `file-collector.ts:29-63`
- **matchingFiles** — Matches files for detection `vendored-detector.ts:292-295`
- **migEntity** — Represents a migration entity `indexing-pipeline.ts:760-760`
- **processHeuristicFiles** — Processes heuristic files to extract entities and queues them for indexing `incremental-indexer.ts:279-310`
- **processSupportedFiles** — Processes a list of files using the parser agent and queues the results for indexing `incremental-indexer.ts:220-270`
- **relationships** — Represents the relationships in the graph `indexing-pipeline.ts:372-382`, `indexing-pipeline.ts:475-485`
- **relationships** — Represents relationships between entities `indexing-pipeline.ts:575-585`, `indexing-pipeline.ts:693-703`
- **resolveDbSchemaLinks** — Resolves database schema links from the provided directory `indexing-pipeline.ts:648-801`
- **resolveGraphQLLinks** — Parses GraphQL links from the provided directory `indexing-pipeline.ts:547-637`
- **resolveProtobufLinks** — Resolves Protobuf links in the files `indexing-pipeline.ts:447-537`
- **resolveSwaggerLinks** — Resolves Swagger links in the files `indexing-pipeline.ts:340-437`
- **saveIndexToDisk** — Saves the FAISS index to disk if the layered index is enabled `incremental-indexer.ts:358-381`
- **separateCodeAndDataFiles** — Separates code and data files from the given files `indexing-pipeline.ts:301-327`
- **separateFilesBySupport** — Function to separate files into supported and other categories `incremental-indexer.ts:55-81`
- **setupEmbeddingGenerator** — Sets up an embedding generator using the provided configuration and initializes it `incremental-indexer.ts:159-206`
- **setupVectorProvider** — Initializes a vector provider based on the embedding configuration and current project context `incremental-indexer.ts:101-150`
- **shouldExclude** — Determines if a file path should be excluded based on provided patterns `file-collector.ts:123-136`
- **shouldUseIncrementalMode** — Determines if incremental mode should be used `indexing-pipeline.ts:813-815`
- **uniqueDirs** — Set of unique directories scanned `file-collector.ts:439-439`, `file-collector.ts:448-448`
- **walkDir** — Walks through a directory to collect files `file-collector.ts:241-285`

### Interface
- **BunGlob** — Represents a constructor for creating a BunGlob instance `file-collector.ts:170-172`
- **BunGlobInstance** — Defines an instance of BunGlob that can scan files based on options `file-collector.ts:174-176`
- **ChangeAnalysis** — Result of change analysis for files `indexing-pipeline.ts:46-51`
- **CollectFilesOptions** — Defines options for collecting files, including exclude patterns and agent ID `file-collector.ts:152-155`
- **CollectFilesResult** — Represents the result of collecting files, including the list of files and statistics `file-collector.ts:157-165`
- **EmbeddingResult** — Represents the result of embedding generation, including the count of embeddings and skipped files `indexing-pipeline.ts:75-78`
- **EmbeddingSetupContext** — An interface representing the context for setting up an embedding provider `incremental-indexer.ts:90-93`
- **FileSeparationResult** — Represents the result of separating files into supported and other categories `incremental-indexer.ts:26-29`
- **FileSeparationResult** — Represents the result of separating code and data files `indexing-pipeline.ts:290-293`
- **IndexingContext** — Context object passed between indexing phases `indexing-pipeline.ts:34-41`
- **IndexingOptions** — Indexing parameters for the DevAgent indexing pipeline `indexing-pipeline.ts:24-29`
- **IndexingResult** — Result of the indexing process `indexing-pipeline.ts:56-62`
- **ProcessingResult** — Represents the result of processing files, including success and error counts and elapsed time `incremental-indexer.ts:34-38`
- **SaveResult** — Represents the result of saving the graph, including entity and relationship counts `indexing-pipeline.ts:67-70`
- **VendoredDetectionResult** — Represents the result of detecting vendored/generated directories, including prefixes to skip embeddings and stats `vendored-detector.ts:58-70`

### Import_decl
- **../../config/yaml-config.js** — Imports `../../config/yaml-config.js` from `../../config/yaml-config.js`. `incremental-indexer.ts:11-11`
- **../../logging/index.js** — Imports `../../logging/index.js` from `../../logging/index.js`. `file-collector.ts:15-15`, `incremental-indexer.ts:12-12`, `indexing-pipeline.ts:11-11`, `vendored-detector.ts:17-17`
- **../../storage/graph-storage-factory.js** — Imports `../../storage/graph-storage-factory.js` from `../../storage/graph-storage-factory.js`. `indexing-pipeline.ts:12-12`
- **../../types/parser.js** — Imports `../../types/parser.js` from `../../types/parser.js`. `heuristic-parser.ts:9-9`
- **../../types/storage.js** — Imports `../../types/storage.js` from `../../types/storage.js`. `indexing-pipeline.ts:13-13`
- **../../utils/error-handling.js** — Imports `../../utils/error-handling.js` from `../../utils/error-handling.js`. `incremental-indexer.ts:13-13`, `indexing-pipeline.ts:14-14`
- **../../utils/runtime.js** — Imports `../../utils/runtime.js` from `../../utils/runtime.js`. `file-collector.ts:16-16`
- **../dev/file-extensions.js** — Imports `../dev/file-extensions.js` from `../dev/file-extensions.js`. `incremental-indexer.ts:14-14`
- **../indexer-agent.js** — Imports `../indexer-agent.js` from `../indexer-agent.js`. `incremental-indexer.ts:15-15`
- **../parser-agent.js** — Imports `../parser-agent.js` from `../parser-agent.js`. `incremental-indexer.ts:16-16`
- **../semantic/provider-config.js** — Imports `../semantic/provider-config.js` from `../semantic/provider-config.js`. `incremental-indexer.ts:17-17`
- **./file-collector.js** — Imports `./file-collector.js` from `./file-collector.js`. `indexing-pipeline.ts:15-15`
- **./file-extensions.js** — Imports `./file-extensions.js` from `./file-extensions.js`. `file-collector.ts:17-17`
- **fast-glob** — Imports `fast-glob` from `fast-glob`. `file-collector.ts:14-14`
- **node:fs** — Imports `node:fs` from `node:fs`. `file-collector.ts:12-12`, `indexing-pipeline.ts:10-10`, `vendored-detector.ts:15-15`
- **node:path** — Imports `node:path` from `node:path`. `file-collector.ts:13-13`, `heuristic-parser.ts:8-8`, `incremental-indexer.ts:10-10`, `vendored-detector.ts:16-16`

### Property
- **agentId** — A string representing the agent ID for file collection `file-collector.ts:154-154`
- **agentId** — Unique identifier for the agent performing indexing `indexing-pipeline.ts:28-28`, `indexing-pipeline.ts:38-38`
- **allFiles** — Array of all files in the directory `indexing-pipeline.ts:39-39`
- **archMirrors** — Detects directories with architecture mirrors `vendored-detector.ts:65-65`
- **Bun** — Runtime environment for Bun.Glob `file-collector.ts:186-186`, `file-collector.ts:433-433`
- **byExtension** — Maps file extensions to their exclusion counts `file-collector.ts:163-163`
- **changedFiles** — Array of files that have changed `indexing-pipeline.ts:47-47`
- **codeFiles** — Represents the list of code files separated `indexing-pipeline.ts:291-291`
- **count** — Represents the count of embeddings generated `indexing-pipeline.ts:76-76`
- **currentDir** — The current directory path used to determine the project hash and git branch `incremental-indexer.ts:92-92`
- **cwd** — Sets the current working directory for scanning files `file-collector.ts:175-175`
- **dataFiles** — Represents the list of data files separated `indexing-pipeline.ts:292-292`
- **deletedEntities** — Represents the number of entities deleted during the indexing `indexing-pipeline.ts:61-61`
- **deletedEntityIds** — Array of IDs of deleted entities `indexing-pipeline.ts:40-40`
- **deletedFiles** — Array of deleted files `indexing-pipeline.ts:49-49`
- **directory** — Directory path for indexing `indexing-pipeline.ts:25-25`, `indexing-pipeline.ts:35-35`
- **dirsScanned** — A number representing the number of directories scanned during file collection `file-collector.ts:160-160`
- **dirsScanned** — Set of directories scanned `file-collector.ts:235-235`
- **elapsedMs** — Time elapsed in milliseconds during file processing `incremental-indexer.ts:37-37`
- **entitiesExtracted** — Represents the number of entities extracted during the indexing process `indexing-pipeline.ts:58-58`
- **entityCount** — Represents the count of entities in the graph `indexing-pipeline.ts:68-68`
- **errorCount** — Count of files that failed to be processed `incremental-indexer.ts:36-36`, `incremental-indexer.ts:224-224`
- **errorCount** — Represents the number of failed file processing operations `incremental-indexer.ts:282-282`
- **excludedByDefault** — Represents the number of files excluded by default `file-collector.ts:162-162`
- **excludedByDefault** — Boolean indicating if default exclusions are applied `file-collector.ts:235-235`
- **excludedByPattern** — Represents the number of files excluded by a pattern `file-collector.ts:161-161`
- **excludedByPattern** — Array of file paths excluded by patterns `file-collector.ts:185-185`, `file-collector.ts:235-235`, `file-collector.ts:372-372`
- **excludePatterns** — An array of strings representing patterns to exclude files `file-collector.ts:153-153`
- **excludePatterns** — Array of patterns to exclude files from indexing `indexing-pipeline.ts:26-26`, `indexing-pipeline.ts:36-36`
- **files** — An array of strings representing the files collected `file-collector.ts:158-158`
- **files** — Array of collected files `file-collector.ts:185-185`, `file-collector.ts:235-235`, `file-collector.ts:372-372`
- **filesProcessed** — Number of files processed during indexing `indexing-pipeline.ts:57-57`
- **Glob** — Glob pattern matching `file-collector.ts:186-186`, `file-collector.ts:433-433`
- **ignore** — Specifies patterns to ignore during file scanning `file-collector.ts:175-175`
- **incremental** — Boolean indicating if the indexing is incremental `indexing-pipeline.ts:27-27`
- **isIncremental** — Boolean indicating if the indexing is incremental `indexing-pipeline.ts:37-37`
- **knownVendored** — Detects known vendored path segments `vendored-detector.ts:67-67`
- **massHeaders** — Detects directories with mass headers `vendored-detector.ts:66-66`
- **newFiles** — Array of new files `indexing-pipeline.ts:48-48`
- **onlyFiles** — Specifies whether to only return files and not directories `file-collector.ts:175-175`
- **otherFiles** — List of files that are not supported for full parsing `incremental-indexer.ts:28-28`
- **parserAgent** — A parser agent used for parsing and embedding files `incremental-indexer.ts:91-91`
- **relationshipCount** — Represents the count of relationships in the graph `indexing-pipeline.ts:69-69`
- **relationshipsCreated** — Represents the number of relationships created during the indexing process `indexing-pipeline.ts:59-59`
- **skipExtensions** — Contains individual file extensions to always skip embeddings for `vendored-detector.ts:62-62`
- **skipped** — Represents the number of files skipped during the embedding generation `indexing-pipeline.ts:77-77`
- **stats** — An object containing statistics about the file collection process `file-collector.ts:159-164`
- **stats** — Logs statistics for arch mirrors, mass headers, known vendored directories, and total skipped files `vendored-detector.ts:64-69`
- **successCount** — Count of successfully processed files `incremental-indexer.ts:35-35`, `incremental-indexer.ts:224-224`
- **successCount** — Represents the number of successful file processing operations `incremental-indexer.ts:282-282`
- **supportedFiles** — List of files that are supported for full parsing `incremental-indexer.ts:27-27`
- **totalFiles** — Represents the total number of files processed during the indexing `indexing-pipeline.ts:60-60`
- **totalSkippedFiles** — Counts total skipped files `vendored-detector.ts:68-68`
- **unchangedFiles** — Array of unchanged files `indexing-pipeline.ts:50-50`
- **vendoredPrefixes** — Stores directory prefixes where embedding should be skipped `vendored-detector.ts:60-60`

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
