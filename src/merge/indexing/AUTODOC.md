# Indexing

## 🤖 Overview

The `merge/indexing` module normalizes file content and manages versioned indexing for semantic merge. It is used by developers to ensure consistent file comparisons and to track changes across versions.

## 🤖 Architecture

```
  +-------------------+
  | ContentNormalizer |
  +-------------------+
          |
          v
  +-------------------+
  | LazyEmbeddingCache |
  +-------------------+
          |
          v
  +-------------------+
  | MultiVersionIndexer |
  +-------------------+
          |
          v
  +-------------------+
  | SignatureGenerator |
  +-------------------+
          |
          v
  +-------------------+
  | StructuralNormalizer |
  +-------------------+
```

## 🤖 Flow

```
  +-------------------+
  | ContentNormalizer |
  +-------------------+
          |
          v
  +-------------------+
  | LazyEmbeddingCache |
  +-------------------+
          |
          v
  +----------------
  | MultiVersionIndexer |
  +----------------+
          |
          v
  +-------------------+
  | SignatureGenerator |
  +-------------------+
          |
          v
  +-------------------+
  | StructuralNormalizer |
  +-------------------+
```

## 🤖 Entity Listing

### Function
- **paramTypes** — Extracts parameter types from code content `signature-generator.ts:56-56`
- **unitsToProcess** — Units that need embeddings and don't have them `lazy-embedding-cache.ts:33-33`

### Method
- **addUnitToIndex** — Method to add a code unit to the index `multi-version-indexer.ts:354-389`
- **clearCache** — Clears the cache `lazy-embedding-cache.ts:87-89`
- **computeCacheKey** — Computes a cache key based on the content hash of a unit `lazy-embedding-cache.ts:80-82`
- **computeContentHash** — Computes SHA256 hash of content for Fast Path Level 1 matching `content-normalizer.ts:59-61`
- **computeSignatureHash** — Computes a hash for a signature `signature-generator.ts:187-189`
- **computeStructuralHash** — Computes structural hash of normalized code using SHA256 `structural-normalizer.ts:54-56`
- **constructor** — Initializes the LazyEmbeddingCache with an embedding generator and optional options `lazy-embedding-cache.ts:17-20`
- **constructor** — Constructor for MultiVersionIndexer `multi-version-indexer.ts:129-133`
- **detectEncoding** — Detects encoding via BOM detection `content-normalizer.ts:69-88`
- **entityToCodeUnit** — Method to convert an entity to a code unit `multi-version-indexer.ts:308-332`
- **estimateMemoryUsage** — Estimates the memory usage of the cache `lazy-embedding-cache.ts:104-109`
- **extractParameters** — Extracts parameters from code content `signature-generator.ts:98-125`
- **extractParameterType** — Extracts the type of a parameter `signature-generator.ts:130-150`
- **extractTypeParameters** — Extracts type parameters from code content `signature-generator.ts:155-179`
- **generateEmbeddings** — Generates embeddings for units in the index that don't have embeddings `lazy-embedding-cache.ts:31-53`
- **generateFunctionSignature** — Generates a function/method signature string `signature-generator.ts:45-59`
- **generateModuleSignature** — Generates a module signature string `signature-generator.ts:86-93`
- **generateSignature** — Generates a signature string for a CodeUnit `signature-generator.ts:19-37`
- **generateTypeSignature** — Generates a class/interface signature string `signature-generator.ts:67-78`
- **getCacheStats** — Returns cache statistics including size and memory usage `lazy-embedding-cache.ts:94-99`
- **getOrGenerateEmbedding** — Retrieves an embedding from the cache or generates a new one if not present `lazy-embedding-cache.ts:58-73`
- **hasCStyleComments** — Checks if the language uses C-style comments `structural-normalizer.ts:88-90`
- **indexBranch** — Method to index a single branch `multi-version-indexer.ts:214-249`
- **indexThreeBranches** — Method to index three branches `multi-version-indexer.ts:140-204`
- **loadCachedIndex** — Method to load a cached index `multi-version-indexer.ts:424-477`
- **mapEntityType** — Method to map an entity type `multi-version-indexer.ts:337-349`
- **normalize** — Normalizes a file and returns normalized content with metadata `content-normalizer.ts:20-49`
- **normalizeCode** — Normalizes code for structural comparison by removing comments, normalizing whitespace, and removing trailing semicolons `structural-normalizer.ts:19-43`
- **normalizeLineEndings** — Normalizes line endings to LF `content-normalizer.ts:96-102`
- **normalizeSignature** — Normalizes a signature string `signature-generator.ts:196-201`
- **normalizeWhitespace** — Normalizes whitespace in code `structural-normalizer.ts:103-133`
- **populateIndexFromStorage** — Method to populate the index from storage `multi-version-indexer.ts:394-419`
- **removeComments** — Removes comments from code based on the programming language `structural-normalizer.ts:68-83`
- **removeTrailingSemicolons** — Removes trailing semicolons from code if the language is TypeScript or JavaScript `structural-normalizer.ts:141-147`
- **runIndexing** — Method to run the indexing process `multi-version-indexer.ts:254-303`
- **saveCachedIndex** — Method to save the cached index `multi-version-indexer.ts:482-507`
- **trimTrailingWhitespace** — Trims trailing whitespace on each line `content-normalizer.ts:110-115`
- **wasCacheHit** — Method to check if the cache was hit `multi-version-indexer.ts:512-514`

### Class
- **ContentNormalizer** — Normalizes files before comparison: encoding, BOM, line endings `content-normalizer.ts:13-116`
- **LazyEmbeddingCache** — Generates embeddings only for unmatched units and caches them for reuse `lazy-embedding-cache.ts:12-110`
- **MultiVersionIndexer** — Class for multi-version indexing `multi-version-indexer.ts:124-515`
- **SignatureGenerator** — Generates signatures for CodeUnit based on its type `signature-generator.ts:12-202`
- **StructuralNormalizer** — Normalizes AST for structural hash (Fast Path Level 2) `structural-normalizer.ts:11-148`

### Interface
- **CacheStats** — Defines the structure of cache statistics `lazy-embedding-cache.ts:127-130`
- **ConductorWithStorage** — ConductorOrchestrator with GraphStorage accessor `multi-version-indexer.ts:65-67`
- **DevAgentEntity** — Entity from DevAgent `multi-version-indexer.ts:45-60`
- **DevAgentIndexResult** — Result from DevAgent indexing `multi-version-indexer.ts:30-33`
- **DevAgentWithExecute** — DevAgent with execute method `multi-version-indexer.ts:38-40`
- **GraphStorage** — GraphStorage interface `multi-version-indexer.ts:72-75`
- **IndexCodebaseParams** — Task params for DevAgent indexing `multi-version-indexer.ts:19-25`
- **IndexingOptions** — Task params for DevAgent indexing `multi-version-indexer.ts:113-118`
- **LazyEmbeddingCacheOptions** — Options for the LazyEmbeddingCache constructor `lazy-embedding-cache.ts:120-122`
- **MultiVersionIndexResult** — Defines the structure of the multi-version index result `multi-version-indexer.ts:100-111`
- **NormalizedContent** — Represents normalized content with metadata `content-normalizer.ts:121-125`
- **VersionedIndexWithCache** — VersionedIndex with temporary cache flag `multi-version-indexer.ts:80-82`

### Type_alias
- **EmbeddingGeneratorFn** — Type for the embedding generator function `lazy-embedding-cache.ts:115-115`

### Import_decl
- **../../agents/conductor-orchestrator.js** — Imports `../../agents/conductor-orchestrator.js` from `../../agents/conductor-orchestrator.js`. `multi-version-indexer.ts:1-1`
- **../../core/agent-registry.js** — Imports `../../core/agent-registry.js` from `../../core/agent-registry.js`. `multi-version-indexer.ts:2-2`
- **../../core/branch-manager.js** — Imports `../../core/branch-manager.js` from `../../core/branch-manager.js`. `multi-version-indexer.ts:3-3`
- **../../core/di-container.js** — Imports `../../core/di-container.js` from `../../core/di-container.js`. `multi-version-indexer.ts:4-4`
- **../../logging/index.js** — Imports `../../logging/index.js` from `../../logging/index.js`. `multi-version-indexer.ts:5-5`
- **../../types/agent.js** — Imports `../../types/agent.js` from `../../types/agent.js`. `multi-version-indexer.ts:6-6`, `multi-version-indexer.ts:7-7`
- **../../utils/fast-hash.js** — Imports `../../utils/fast-hash.js` from `../../utils/fast-hash.js`. `content-normalizer.ts:1-1`, `signature-generator.ts:1-1`, `structural-normalizer.ts:1-1`
- **../../utils/file-ops.js** — Imports `../../utils/file-ops.js` from `../../utils/file-ops.js`. `content-normalizer.ts:2-2`
- **../integration/git-integration.js** — Imports `../integration/git-integration.js` from `../integration/git-integration.js`. `multi-version-indexer.ts:8-8`
- **../models/code-unit.js** — Imports `../models/code-unit.js` from `../models/code-unit.js`. `lazy-embedding-cache.ts:1-1`, `multi-version-indexer.ts:9-9`, `signature-generator.ts:2-2`
- **../models/versioned-index.js** — Imports `../models/versioned-index.js` from `../models/versioned-index.js`. `lazy-embedding-cache.ts:2-2`, `multi-version-indexer.ts:10-10`

### Property
- **_fromCache** — Indicates whether the index is loaded from cache `multi-version-indexer.ts:81-81`
- **base** — Represents the base versioned index `multi-version-indexer.ts:101-101`
- **batchSize** — Number of units to process in each batch `lazy-embedding-cache.ts:15-15`
- **batchSize** — Sets the batch size for parallel generation (default 32) `lazy-embedding-cache.ts:121-121`
- **branchA** — Represents the first branch versioned index `multi-version-indexer.ts:102-102`
- **branchB** — Represents the second branch versioned index `multi-version-indexer.ts:103-103`
- **branchManager** — Manager for handling branches `multi-version-indexer.ts:125-125`
- **cache** — In-memory cache for storing embeddings `lazy-embedding-cache.ts:14-14`
- **cacheHits** — Counts the number of branches loaded from cache `multi-version-indexer.ts:109-109`
- **childIds** — Entity from DevAgent `multi-version-indexer.ts:58-58`
- **conductor** — Orchestrator for tasks `multi-version-indexer.ts:127-127`
- **content** — Normalized content string `content-normalizer.ts:122-122`
- **content** — Entity from DevAgent `multi-version-indexer.ts:53-53`
- **directory** — Directory for codebase indexing `multi-version-indexer.ts:20-20`
- **embeddingGenerator** — Function to generate embeddings for code units `lazy-embedding-cache.ts:13-13`
- **encoding** — Detected encoding of the file `content-normalizer.ts:69-69`
- **endLine** — Entity from DevAgent `multi-version-indexer.ts:52-52`
- **entities** — Entities from DevAgent `multi-version-indexer.ts:31-31`
- **excludePatterns** — Array of strings representing patterns to exclude `multi-version-indexer.ts:116-116`
- **excludePatterns** — Array of patterns to exclude from indexing `multi-version-indexer.ts:23-23`
- **filePath** — File path of an entity `multi-version-indexer.ts:48-48`
- **fullScan** — Boolean indicating whether the indexing is a full scan `multi-version-indexer.ts:115-115`
- **fullScan** — Boolean indicating whether to perform a full scan `multi-version-indexer.ts:22-22`
- **fullyQualifiedName** — Entity from DevAgent `multi-version-indexer.ts:50-50`
- **gitIntegration** — Integration with Git `multi-version-indexer.ts:126-126`
- **hadBom** — Indicates whether the file had a BOM `content-normalizer.ts:124-124`
- **hasBom** — Indicates whether the file has a BOM `content-normalizer.ts:69-69`
- **id** — Unique identifier for an entity `multi-version-indexer.ts:46-46`
- **incremental** — Boolean indicating whether the indexing is incremental `multi-version-indexer.ts:114-114`
- **incremental** — Boolean indicating whether to perform an incremental scan `multi-version-indexer.ts:21-21`
- **indexingTimeMs** — Records the time taken for indexing in milliseconds `multi-version-indexer.ts:108-108`
- **language** — Entity from DevAgent `multi-version-indexer.ts:56-56`
- **memoryUsage** — Represents the estimated memory usage in bytes `lazy-embedding-cache.ts:129-129`
- **mergeBase** — Stores the common ancestor commit hash `multi-version-indexer.ts:104-104`
- **metadata** — Entity from DevAgent `multi-version-indexer.ts:59-59`
- **name** — Task params for DevAgent indexing `multi-version-indexer.ts:49-49`
- **originalEncoding** — Original encoding of the file `content-normalizer.ts:123-123`
- **params** — Parameters for DevAgent indexing `multi-version-indexer.ts:39-39`
- **parentId** — Entity from DevAgent `multi-version-indexer.ts:57-57`
- **reset** — Boolean indicating whether to reset the index `multi-version-indexer.ts:24-24`, `multi-version-indexer.ts:117-117`
- **signature** — Entity from DevAgent `multi-version-indexer.ts:55-55`
- **size** — Represents the number of cached embeddings `lazy-embedding-cache.ts:128-128`
- **startLine** — Entity from DevAgent `multi-version-indexer.ts:51-51`
- **stats** — Contains statistics about the indexing process `multi-version-indexer.ts:105-110`
- **structuralHash** — Entity from DevAgent `multi-version-indexer.ts:54-54`
- **task** — Task for DevAgent indexing `multi-version-indexer.ts:39-39`
- **totalFiles** — Tracks the total number of files indexed `multi-version-indexer.ts:107-107`
- **totalUnits** — Tracks the total number of units indexed `multi-version-indexer.ts:106-106`
- **type** — Type of an entity `multi-version-indexer.ts:47-47`

## Data Flow

- **Inputs**: Git branch names, BranchManager, GitIntegration, and ConductorOrchestrator for DevAgent-based indexing.
- **Processing**: Checks branch caches, checks out branches, runs DevAgent indexing, builds VersionedIndex with hash indexes (content, structural, signature, filePath).
- **Outputs**: MultiVersionIndexResult with three VersionedIndex objects (base, branchA, branchB) and merge-base commit hash.

## Public API

| Export | Type | Description | Location |
|--------|------|-------------|----------|
| `ContentNormalizer` | class | Normalizes file encoding, BOM, and line endings for consistent hashing | [`content-normalizer.ts:13-116`](./content-normalizer.ts) |
| `NormalizedContent` | interface | Result of file normalization with encoding metadata | [`content-normalizer.ts:121-125`](./content-normalizer.ts) |
| `LazyEmbeddingCache` | class | On-demand batch embedding generation with in-memory caching | [`lazy-embedding-cache.ts:12-110`](./lazy-embedding-cache.ts) |
| `EmbeddingGeneratorFn` | type | Function type for generating embeddings from code strings | [`lazy-embedding-cache.ts:115-115`](./lazy-embedding-cache.ts) |
| `MultiVersionIndexer` | class | Parallel indexing of base + branchA + branchB with cache support | [`multi-version-indexer.ts:124-515`](./multi-version-indexer.ts) |
| `MultiVersionIndexResult` | interface | Result containing three VersionedIndex objects and statistics | [`multi-version-indexer.ts:100-111`](./multi-version-indexer.ts) |
| `SignatureGenerator` | class | Generates FQN-based signatures for functions, classes, and modules | [`signature-generator.ts:12-202`](./signature-generator.ts) |
| `StructuralNormalizer` | class | Strips comments and whitespace for structural hash comparison | [`structural-normalizer.ts:11-43`](./structural-normalizer.ts) |

## Dependencies

### Internal Modules

| Module | Purpose |
|--------|---------|
| `merge/models` | CodeUnit, VersionedIndex types |
| `merge/integration` | GitIntegration for branch checkout |
| `core/branch-manager` | Branch database caching |
| `core/di-container` | Dependency injection container |
| `core/agent-registry` | DevAgent creation for indexing |
| `logging` | Structured logging |
| `utils/fast-hash` | SHA256 hashing via hashText |
| `utils/file-ops` | File reading via readBytes |

### External Packages

| Package | Purpose |
|---------|---------|
| (none) | No external dependencies |

## Behavioral Properties

| Property | Value |
|----------|-------|
| Default batch size | 32 embeddings per batch in LazyEmbeddingCache |
| Cache key strategy | Content hash (same content produces same embedding) |
| Incremental indexing | Enabled by default; skips branches with up-to-date cache |

## Error Handling

MultiVersionIndexer ensures git branch cleanup on indexing errors. LazyEmbeddingCache skips units that already have embeddings. ContentNormalizer defaults to UTF-8 when BOM detection fails. Cache load failures are logged and cause fresh re-indexing.

## Known Limitations

- SignatureGenerator uses regex-based parameter extraction; full AST parsing would improve accuracy.
- StructuralNormalizer comment removal is regex-based and may fail on edge cases (strings containing comment markers).
- MultiVersionIndexer requires sequential branch checkout (cannot index branches in parallel due to git working directory constraints).

## Files

| File | Description |
|------|-------------|
| `content-normalizer.ts` | Normalizes file encoding, BOM, line endings, and trailing whitespace |
| `index.ts` | Re-exports all indexing module components |
| `lazy-embedding-cache.ts` | On-demand embedding generation with in-memory caching and batch processing |
| `multi-version-indexer.ts` | Indexes three git branches sequentially with branch database caching |
| `signature-generator.ts` | Generates function signatures (FQN + parameters) and class type signatures |
| `structural-normalizer.ts` | Normalizes code by removing comments, whitespace, and optional semicolons for structural comparison |
