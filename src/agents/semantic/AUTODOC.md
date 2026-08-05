# Semantic

## 🤖 Overview

The `semantic` module provides a suite of tools for semantic analysis, including cache warmup, comment processing, embedding generation, and vector index management. It is used by developers and data scientists to enhance the performance and accuracy of semantic operations in applications.

## 🤖 Architecture

```
  [cache-warmup.ts]
    |
    v
  [comment-processor.ts]
    |
    v
  [embedding-processor.ts]
    |
    v
  [provider-config.ts]
    |
    v
  [vector-index-manager.ts]
```

## 🤖 Flow

```
  [vector-index-manager.ts]
    |
    v
  [embedding-processor.ts]
    |
    v
  [cache-warmup.ts]
    |
    v
  [comment-processor.ts]
    |
    v
  [provider-config.ts]
```

## 🤖 Entity Listing

### Function
- **buildEmbeddingGeneratorOptions** — Builds embedding generator options `provider-config.ts:236-306`
- **buildEmbeddingText** — Constructs the text for embedding generation `embedding-processor.ts:136-206`
- **buildVectorMetadata** — Builds metadata for vector embeddings `embedding-processor.ts:211-298`
- **buildWarmupText** — Builds warmup text from entity data `cache-warmup.ts:41-68`
- **buildWorkerProviderOptions** — Constructs worker provider options `provider-config.ts:179-231`
- **cacheEntries** — Stores cache entries for embeddings `embedding-processor.ts:487-492`
- **codeExtractionPromises** — Extracts code snippets and their metadata from a list of hotspots `vector-index-manager.ts:120-171`
- **commentTexts** — Maps all comment entities to their content strings `comment-processor.ts:124-124`
- **deduplicateAndCheckCaches** — Deduplicates texts and checks caches `embedding-processor.ts:374-457`
- **entityIds** — Maps and filters entity IDs from a list of hotspot items `vector-index-manager.ts:94-97`
- **entityIds** — Filters entity IDs to ensure they are strings `vector-index-manager.ts:98-98`
- **generateEmbeddings** — Generates embeddings for entities `embedding-processor.ts:466-504`
- **getBatchSizeFromConfig** — Retrieves the batch size from configuration `provider-config.ts:311-320`
- **getModelNameFromSemanticConfig** — Retrieves the model name from semantic configuration `provider-config.ts:153-174`
- **isTrivialEntity** — Determines if an entity is trivial for embedding generation `embedding-processor.ts:118-131`
- **items** — Maps items with pending semantic to an array of HotspotItem objects, including entityId, filePath, name, language, structuralScore, semantic, and snippet `vector-index-manager.ts:198-209`
- **itemsWithPendingSemantic** — Creates a new list of extracted data items with pending semantic analysis `vector-index-manager.ts:176-179`
- **mapSemanticConfigToProvider** — Maps semantic configuration to provider settings `provider-config.ts:128-148`
- **newMutex** — Creates a new mutex for embedding generation `cache-warmup.ts:190-192`
- **newMutex** — Creates a promise that resolves when a mutex is released `comment-processor.ts:112-114`
- **originalIndexToHash** — Maps original indices to text hashes `embedding-processor.ts:380-380`
- **pLog** — Function to log detailed profiling information for comment processing `comment-processor.ts:57-60`
- **processPreGeneratedEmbeddings** — Processes pre-generated embeddings from workers `embedding-processor.ts:307-354`
- **processStandaloneComments** — Function to process standalone comments and create comment entities and relationships `comment-processor.ts:47-161`
- **results** — Results from fetching entities for comment processing `comment-processor.ts:79-79`
- **results** — Parses a batch of file paths and maps each to a list of entities found in storage, limited to 10000 per query `comment-processor.ts:79-79`
- **results** — Maps and filters entity IDs to get entities from storage `vector-index-manager.ts:106-112`
- **shouldExcludeFromEmbedding** — Not specified in the excerpt `embedding-processor.ts:95-103`
- **vectorEmbeddings** — Generates vector embeddings for comment entities, including metadata and timestamps `comment-processor.ts:129-142`
- **warmupSemanticCache** — Warms up semantic cache with popular entities `cache-warmup.ts:77-243`

### Method
- **analyzeHotspots** — Analyzes hotspots semantically by enriching structural hotspots with semantic summaries and complexity indicators `vector-index-manager.ts:83-219`
- **constructor** — Initializes the VectorIndexManager with a vector store, code analyzer, and embedding generator `vector-index-manager.ts:43-47`
- **dropVectorIndex** — Drops vector index for faster bulk inserts during initial indexing `vector-index-manager.ts:53-57`
- **rebuildVectorIndex** — Rebuilds vector index after bulk inserts, using FAISS HNSW or falling back to LibSQL DiskANN `vector-index-manager.ts:64-76`

### Class
- **VectorIndexManager** — Manages vector index operations such as dropping and rebuilding the index `vector-index-manager.ts:42-220`

### Interface
- **AnalyzeHotspotsResult** — Result of analyzing hotspots, containing a metric and an array of hotspot items `vector-index-manager.ts:32-35`
- **CacheWarmupContext** — Context for cache warmup with semantic entities `cache-warmup.ts:24-32`
- **CommentProcessorContext** — Context for comment processing containing embedding generator, vector store, embedding dimension, and a mutex `comment-processor.ts:27-33`
- **DeduplicationResult** — Represents the result of deduplication `embedding-processor.ts:360-369`
- **EmbeddingProcessorContext** — Context for embedding processing allowing dependency injection from SemanticAgent `embedding-processor.ts:63-86`
- **HotspotItem** — Represents a hotspot with metadata such as entity ID, file path, name, language, structural score, semantic analysis, and code snippet details `vector-index-manager.ts:16-30`
- **LlamacppConfigExtended** — Extended llama.cpp configuration with runtime fields `provider-config.ts:55-70`
- **MlxConfigExtended** — Extended MLX configuration with runtime fields `provider-config.ts:46-50`
- **OvmsConfigExtended** — Extended OVMS configuration with runtime fields `provider-config.ts:28-41`
- **ParsedEntityWithEmbedding** — ParsedEntity with pre-generated embedding from worker `embedding-processor.ts:27-30`
- **TeiConfigExtended** — Extended TEI configuration with runtime fields `provider-config.ts:75-83`
- **WorkerProviderOptions** — Options for the worker provider `provider-config.ts:108-120`
- **YamlConfig** — YAML configuration for the provider `provider-config.ts:88-103`

### Type_alias
- **HotspotInput** — Input for hotspot analysis, either an entity or an object containing an entity field `vector-index-manager.ts:40-40`
- **ProviderKind** — Represents the type of semantic agent provider `provider-config.ts:13-23`

### Import_decl
- **../../config/yaml-config.js** — Imports `../../config/yaml-config.js` from `../../config/yaml-config.js`. `cache-warmup.ts:8-8`
- **../../core/knowledge-bus.js** — Imports `../../core/knowledge-bus.js` from `../../core/knowledge-bus.js`. `cache-warmup.ts:9-9`
- **../../logging/index.js** — Imports `../../logging/index.js` from `../../logging/index.js`. `cache-warmup.ts:10-10`, `comment-processor.ts:14-14`, `embedding-processor.ts:16-16`, `vector-index-manager.ts:8-8`
- **../../semantic/code-analyzer.js** — Imports `../../semantic/code-analyzer.js` from `../../semantic/code-analyzer.js`. `vector-index-manager.ts:9-9`
- **../../semantic/embedding-generator.js** — Imports `../../semantic/embedding-generator.js` from `../../semantic/embedding-generator.js`. `cache-warmup.ts:11-11`, `comment-processor.ts:15-15`, `embedding-processor.ts:17-17`, `vector-index-manager.ts:10-10`
- **../../semantic/global-embedding-cache.js** — Imports `../../semantic/global-embedding-cache.js` from `../../semantic/global-embedding-cache.js`. `embedding-processor.ts:18-18`
- **../../semantic/semantic-cache.js** — Imports `../../semantic/semantic-cache.js` from `../../semantic/semantic-cache.js`. `cache-warmup.ts:12-12`
- **../../semantic/vector-store.js** — Imports `../../semantic/vector-store.js` from `../../semantic/vector-store.js`. `comment-processor.ts:16-16`, `embedding-processor.ts:19-19`, `vector-index-manager.ts:11-11`
- **../../storage/graph-storage-factory.js** — Imports `../../storage/graph-storage-factory.js` from `../../storage/graph-storage-factory.js`. `cache-warmup.ts:13-13`, `vector-index-manager.ts:12-12`
- **../../types/parser.js** — Imports `../../types/parser.js` from `../../types/parser.js`. `embedding-processor.ts:20-20`
- **../../types/semantic.js** — Imports `../../types/semantic.js` from `../../types/semantic.js`. `cache-warmup.ts:14-14`, `embedding-processor.ts:21-21`, `provider-config.ts:7-7`, `vector-index-manager.ts:13-13`
- **../../types/storage.js** — Imports `../../types/storage.js` from `../../types/storage.js`. `cache-warmup.ts:15-15`, `comment-processor.ts:17-17`, `vector-index-manager.ts:14-14`
- **../../utils/comment-extractor.js** — Imports `../../utils/comment-extractor.js` from `../../utils/comment-extractor.js`. `comment-processor.ts:18-18`
- **../../utils/config-paths.js** — Imports `../../utils/config-paths.js` from `../../utils/config-paths.js`. `provider-config.ts:8-8`
- **../../utils/fast-hash.js** — Imports `../../utils/fast-hash.js` from `../../utils/fast-hash.js`. `embedding-processor.ts:22-22`

### Property
- **agentId** — Identifier for the semantic agent `cache-warmup.ts:29-29`
- **asyncNoAwaitCount** — Counts entities that are processed asynchronously without awaiting `embedding-processor.ts:279-279`
- **auto_start** — Boolean indicating if the provider should start automatically `provider-config.ts:67-67`
- **autoStart** — Boolean indicating if the provider should start automatically `provider-config.ts:68-68`
- **bareExceptCount** — Counts entities that are excluded from embedding generation `embedding-processor.ts:279-279`
- **baseUrl** — Base URL for the provider `provider-config.ts:77-77`
- **baseUrl** — Represents the base URL for the provider `provider-config.ts:109-109`
- **batch_size** — Size of the batch `provider-config.ts:63-63`
- **batch_size** — Defines the batch size for the provider `provider-config.ts:30-30`
- **cache** — Semantic cache for storing embeddings `cache-warmup.ts:26-26`
- **cacheHits** — Counts cache hits during embedding generation `embedding-processor.ts:364-364`
- **checkServer** — Function to check the server status `provider-config.ts:82-82`
- **complexity** — Extracts the complexity from an entity object `vector-index-manager.ts:199-199`
- **concurrency** — Level of concurrency for the provider `provider-config.ts:66-66`
- **concurrency** — Defines the number of concurrent requests `provider-config.ts:80-80`
- **concurrency** — Defines the concurrency level for the provider `provider-config.ts:40-40`, `provider-config.ts:112-112`
- **context_size** — Defines the context size for llama.cpp `provider-config.ts:57-57`
- **contextSize** — Represents the context size for the model `provider-config.ts:118-118`
- **contextSize** — Represents the context size for llama.cpp `provider-config.ts:58-58`
- **dumpBatchIndex** — Index for dumping batches `embedding-processor.ts:75-75`
- **embedding** — Embedding configuration `provider-config.ts:96-100`
- **embeddingBase64** — Base64 encoded embedding `embedding-processor.ts:28-28`
- **embeddingBatchSize** — Batch size for embedding generation `embedding-processor.ts:71-71`
- **embeddingDim** — Dimension of embeddings used in semantic cache `cache-warmup.ts:28-28`
- **embeddingDim** — Dimension of the embedding space `comment-processor.ts:30-30`
- **embeddingDim** — Dimension of the embedding `embedding-processor.ts:70-70`
- **embeddingGen** — Embedding generator for semantic cache warmup `cache-warmup.ts:25-25`
- **embeddingGen** — Embedding generator used for creating comment embeddings `comment-processor.ts:28-28`
- **embeddingGen** — Embedding generator `embedding-processor.ts:65-65`
- **embeddingMutex** — Mutex for embedding generation to prevent concurrent access `cache-warmup.ts:30-30`
- **embeddingMutex** — Mutex for managing embedding generation `comment-processor.ts:31-31`
- **embeddingMutex** — Mutex for thread safety `embedding-processor.ts:79-79`
- **embeddingText** — Text representation of the embedding `embedding-processor.ts:29-29`
- **encodingFormat** — Specifies the encoding format for embeddings `provider-config.ts:115-115`
- **encodingFormat** — Specifies the encoding format for the provider `provider-config.ts:36-36`
- **endLine** — Represents the end line of a code snippet `vector-index-manager.ts:124-124`
- **endLine** — Ending line number of the code snippet `vector-index-manager.ts:26-26`
- **endpoint** — Endpoint URL for the provider `provider-config.ts:56-56`, `provider-config.ts:76-76`
- **endpoint** — Specifies the endpoint for the provider `provider-config.ts:29-29`
- **endpoints** — Lists multiple endpoints for the provider `provider-config.ts:34-34`
- **entities** — Number of comment entities created `comment-processor.ts:52-52`
- **entity** — Entity used in hotspot analysis `vector-index-manager.ts:40-40`
- **entityId** — Unique identifier for an entity `vector-index-manager.ts:17-17`
- **evalExecCount** — Counts entities that are evaluated for execution `embedding-processor.ts:279-279`
- **failed** — Indicates the status of failed entities `embedding-processor.ts:311-311`
- **filePath** — Path to the file containing the entity `vector-index-manager.ts:18-18`
- **globalCache** — Global embedding cache `embedding-processor.ts:67-67`
- **globalCacheHitCount** — Counts global cache hits `embedding-processor.ts:367-367`
- **grpcPort** — Sets the gRPC port for communication `provider-config.ts:117-117`
- **grpcPort** — Specifies the gRPC port for the provider `provider-config.ts:38-38`
- **items** — Represents a collection of hotspot items `vector-index-manager.ts:34-34`
- **language** — Programming language of the entity `vector-index-manager.ts:20-20`
- **length** — Represents the length of a code snippet `vector-index-manager.ts:124-124`
- **length** — Length of the code snippet `vector-index-manager.ts:27-27`
- **max_batch_size** — Maximum batch size `provider-config.ts:64-64`
- **max_batch_size** — Defines the maximum batch size for MLX `provider-config.ts:48-48`
- **max_batch_tokens** — Maximum number of tokens per batch `provider-config.ts:78-78`
- **max_client_batch_size** — Maximum client batch size `provider-config.ts:79-79`
- **maxBatchSize** — Determines the maximum batch size for requests `provider-config.ts:113-113`
- **mcp** — Model configuration provider `provider-config.ts:94-102`
- **metric** — Metric used in the hotspot analysis `vector-index-manager.ts:33-33`
- **modelDir** — Specifies the directory for model files `provider-config.ts:110-110`
- **modelDir** — Specifies the model directory for MLX `provider-config.ts:47-47`
- **modelPath** — Path to the model `provider-config.ts:91-91`
- **n_gpu_layers** — Specifies the number of GPU layers for llama.cpp `provider-config.ts:59-59`
- **name** — Name of the entity `vector-index-manager.ts:19-19`
- **nGpuLayers** — Number of GPU layers for the model `provider-config.ts:60-60`
- **nGpuLayers** — Specifies the number of GPU layers `provider-config.ts:119-119`
- **onDumpBatchIndexIncrement** — Not specified in the excerpt `embedding-processor.ts:83-83`
- **onMetricsUpdate** — Not specified in the excerpt `embedding-processor.ts:84-84`
- **onVectorsStoredUpdate** — Not specified in the excerpt `embedding-processor.ts:85-85`
- **openWithoutWithCount** — Counts entities that are opened without using `with `embedding-processor.ts:279-279`
- **originalIndexToHash** — Stores a mapping from original indices to their corresponding hash values `embedding-processor.ts:362-362`
- **ovms_mini_batch** — Specifies the mini batch size for OVMS `provider-config.ts:31-31`
- **parallel_slots** — Number of parallel slots for the model `provider-config.ts:61-61`
- **path** — Extracts the path from an entity object `vector-index-manager.ts:199-199`
- **persistentCacheHitCount** — Counts persistent cache hits `embedding-processor.ts:368-368`
- **processed** — Indicates the status of processed entities `embedding-processor.ts:311-311`
- **protocol** — Defines the communication protocol `provider-config.ts:116-116`
- **protocol** — Defines the protocol for the provider `provider-config.ts:37-37`
- **relationships** — Number of comment relationships created `comment-processor.ts:52-52`
- **score** — Extracts the score from an entity object `vector-index-manager.ts:199-199`
- **seenHashes** — Tracks seen text hashes `embedding-processor.ts:363-363`
- **selected_model** — Selected model for the provider `provider-config.ts:49-49`, `provider-config.ts:69-69`
- **selected_model** — Indicates the selected model for the provider `provider-config.ts:32-32`
- **semantic** — Semantic analysis of the entity `vector-index-manager.ts:22-22`
- **semanticAgent** — Semantic agent configuration `provider-config.ts:89-93`
- **semanticMetrics** — Semantic metrics for tracking cache warmup performance `cache-warmup.ts:27-27`
- **semanticMetrics** — Semantic metrics `embedding-processor.ts:76-76`
- **setEmbeddingMutex** — Sets the embedding generation mutex `cache-warmup.ts:31-31`
- **setEmbeddingMutex** — Function to set the embedding mutex `comment-processor.ts:32-32`
- **setEmbeddingMutex** — Sets the embedding mutex `embedding-processor.ts:80-80`
- **snippet** — Code snippet details including start and end lines and length `vector-index-manager.ts:23-29`
- **startLine** — Represents the start line of a code snippet `vector-index-manager.ts:124-124`
- **startLine** — Starting line number of the code snippet `vector-index-manager.ts:25-25`
- **strategy** — Strategy used for rebuilding the vector index `vector-index-manager.ts:64-64`
- **structuralScore** — Score indicating the structural complexity of the entity `vector-index-manager.ts:21-21`
- **target_device** — Specifies the target device for the provider `provider-config.ts:33-33`
- **tei** — TEI configuration `provider-config.ts:98-98`
- **textsNeedingGeneration** — Stores texts that need embedding generation `embedding-processor.ts:365-365`
- **textsNeedingGenerationHashes** — Stores hashes of texts needing generation `embedding-processor.ts:366-366`
- **timeMs** — Time taken in milliseconds for the vector index rebuild `vector-index-manager.ts:64-64`
- **timeoutMs** — Timeout in milliseconds for the provider `provider-config.ts:65-65`
- **timeoutMs** — Sets the timeout duration in milliseconds `provider-config.ts:81-81`
- **timeoutMs** — Sets the timeout in milliseconds for the provider `provider-config.ts:39-39`, `provider-config.ts:111-111`
- **twoPhaseMode** — Boolean indicating two-phase mode `embedding-processor.ts:72-72`
- **ubatch_size** — Size of the unbatched batch `provider-config.ts:62-62`
- **uniqueTexts** — Stores unique texts for deduplication `embedding-processor.ts:361-361`
- **usedFaiss** — Boolean indicating whether FAISS was used during the rebuild `vector-index-manager.ts:64-64`
- **useEmbeddingsApi** — Indicates whether to use the embeddings API `provider-config.ts:114-114`
- **useEmbeddingsApi** — Determines whether to use the embeddings API `provider-config.ts:35-35`
- **vectorStore** — Vector store for storing comment embeddings `comment-processor.ts:29-29`
- **vectorStore** — Vector store for storing embeddings `embedding-processor.ts:66-66`

## Data Flow

- **Inputs**: Parsed entities with location data, file content, embedding configuration, semantic-config.json settings.
- **Processing**: Filters entities by exclude patterns, builds embedding text from code + metadata, deduplicates against global cache, generates embeddings in batches via EmbeddingGenerator, stores vectors in VectorStore.
- **Outputs**: Vector embeddings stored in FAISS, cache-warmed semantic cache, comment entities with documentation relationships.

## Public API

| Export | Type | Description | Location |
|--------|------|-------------|----------|
| `buildEmbeddingText` | function | Constructs embedding text from entity code and metadata | [`embedding-processor.ts:104-174`](./embedding-processor.ts) |
| `buildVectorMetadata` | function | Builds vector metadata for storage | [`embedding-processor.ts:179-236`](./embedding-processor.ts) |
| `shouldExcludeFromEmbedding` | function | Checks if file path matches exclude patterns | [`embedding-processor.ts:95-103`](./embedding-processor.ts) |
| `deduplicateAndCheckCaches` | function | Deduplicates texts and checks global cache | [`embedding-processor.ts:312-395`](./embedding-processor.ts) |
| `generateEmbeddings` | function | Generates embeddings in batches and stores in vector store | [`embedding-processor.ts:374-457`](./embedding-processor.ts) |
| `processPreGeneratedEmbeddings` | function | Processes embeddings already generated by workers | [`embedding-processor.ts:211-298`](./embedding-processor.ts) |
| `EMBEDDING_EXCLUDE_PATTERNS` | const | Path patterns excluded from embedding generation | [`embedding-processor.ts:46-82`](./embedding-processor.ts) |
| `EmbeddingProcessorContext` | interface | Dependency injection context for embedding processing | [`embedding-processor.ts:59-82`](./embedding-processor.ts) |
| `DeduplicationResult` | interface | Result of deduplication and cache check | [`embedding-processor.ts:298-307`](./embedding-processor.ts) |
| `mapSemanticConfigToProvider` | function | Maps semantic-config.json to provider kind | [`provider-config.ts:88-145`](./provider-config.ts) |
| `getModelNameFromSemanticConfig` | function | Extracts model name from semantic config | [`provider-config.ts:153-174`](./provider-config.ts) |
| `buildWorkerProviderOptions` | function | Builds worker embedding provider options | [`provider-config.ts:179-231`](./provider-config.ts) |
| `buildEmbeddingGeneratorOptions` | function | Builds EmbeddingGenerator options from config | [`provider-config.ts:236-306`](./provider-config.ts) |
| `getBatchSizeFromConfig` | function | Gets batch size from provider-specific config | [`provider-config.ts:325-334`](./provider-config.ts) |
| `ProviderKind` | type | Union type of all supported embedding providers | [`provider-config.ts:13-42`](./provider-config.ts) |
| `VectorIndexManager` | class | Manages vector index drop, rebuild, and hotspot analysis | [`vector-index-manager.ts:40-218`](./vector-index-manager.ts) |
| `HotspotItem` | interface | Code hotspot analysis result item | [`vector-index-manager.ts:16-28`](./vector-index-manager.ts) |
| `AnalyzeHotspotsResult` | interface | Hotspot analysis result | [`vector-index-manager.ts:30-33`](./vector-index-manager.ts) |
| `warmupSemanticCache` | function | Warms up semantic cache with popular entities | [`cache-warmup.ts:77-239`](./cache-warmup.ts) |
| `buildWarmupText` | function | Builds warmup text from entity data | [`cache-warmup.ts:41-68`](./cache-warmup.ts) |
| `CacheWarmupContext` | interface | Context for cache warmup operations | [`cache-warmup.ts:24-32`](./cache-warmup.ts) |
| `processStandaloneComments` | function | Processes comments as searchable entities | [`comment-processor.ts:47-161`](./comment-processor.ts) |
| `CommentProcessorContext` | interface | Context for comment processing | [`comment-processor.ts:27-33`](./comment-processor.ts) |

## Dependencies

### Internal Modules

| Module | Purpose |
|--------|---------|
| `semantic/embedding-generator` | Batch embedding generation |
| `semantic/vector-store` | Vector storage and search |
| `semantic/global-embedding-cache` | Cross-session embedding deduplication |
| `semantic/code-analyzer` | Code complexity analysis for hotspots |
| `storage/graph-storage-factory` | Entity retrieval for warmup |
| `logging` | Structured logging |
| `utils/fast-hash` | Text hashing for deduplication |

### External Packages

| Package | Purpose |
|---------|---------|
| (none) | No direct external dependencies |

## Behavioral Properties

| Property | Value |
|----------|-------|
| Supported providers | auto, tei, ovms, ovms-native, vllm, llamacpp, mlx, ollama, openai, cloudru, huggingface |
| Exclude patterns | `src/generated/`, `/autogenerated/` |
| Two-phase mode | Bulk insert with deferred index rebuild |

## Error Handling

Embedding generation failures for individual batches are logged and skipped, allowing remaining batches to proceed. Cache warmup failures are non-fatal. The VectorIndexManager requires FAISS for vector search (LibSQL DiskANN fallback removed in v5).

## Known Limitations

- Embedding text is truncated by character count (not actual token count), which may underutilize model context.
- Comment processing requires pre-extracted comment blocks from the comment-extractor utility.
- Cache warmup uses a fixed entity priority heuristic rather than usage-based popularity.

## Files

| File | Description |
|------|-------------|
| `cache-warmup.ts` | Semantic cache warmup with popular entities |
| `comment-processor.ts` | Standalone comment extraction and embedding |
| `embedding-processor.ts` | Entity embedding generation, deduplication, and storage |
| `provider-config.ts` | Maps semantic-config.json to embedding provider options |
| `vector-index-manager.ts` | Vector index lifecycle and hotspot analysis |
| `index.ts` | Re-exports all semantic module members |
