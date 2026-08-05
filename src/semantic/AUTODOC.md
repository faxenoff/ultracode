---
module_name: semantic
description: Semantic analysis pipeline — embedding generation, vector indexing (Faiss HNSW), hybrid search (RRF), caching, GPU acceleration, and code similarity detection
status: active
language: TypeScript
entry_point: embedding-generator.ts
exports:
  - EmbeddingGenerator
  - VectorStore
  - HybridSearchEngine
  - SemanticCache
  - EmbeddingAccumulator
  - EmbeddingRouter
  - CodeAnalyzer
  - GlobalEmbeddingCache
  - LayeredFaissProvider
  - FaissProvider
  - getFaissClient
  - getGpuClient
  - createProvider
  - chunkCode
dependencies:
  - faiss-napi
  - lru-cache
  - ../logging
  - ../storage/libsql-graph-adapter
  - ../utils/simd-vector-ops
  - ../agents/query-agent
tags: [embeddings, vector-search, faiss, cuda, hybrid-search, rrf, semantic-cache, code-analysis]
---

## Overview

Full pipeline for semantic code analysis: embedding generation via pluggable providers (OVMS, TEI, Ollama, vLLM, MLX, llama.cpp), vector storage and search via Faiss (in-memory HNSW), hybrid search combining structural and semantic results with Reciprocal Rank Fusion (RRF), and code similarity detection. Architecture v6 introduces layered Faiss (base branch + delta) for multi-project support with `ProjectContext`. Adaptive thresholds select CPU vs CUDA execution paths. Three-tier caching: `EmbeddingGenerator` local LRU, `SemanticCache` global LRU with TTL, and `GlobalEmbeddingCache` for built-in types and framework patterns.

```
┌────────────────────────────────────────────────────────────────┐
│                    semantic module                              │
├────────────────────────────────────────────────────────────────┤
│  embedding-generator.ts ◄── providers/ ◄── TEI/OVMS/Ollama     │
│         │                                                       │
│         ▼                                                       │
│  vector-store.ts ────────► faiss/ (hot index, in-memory)       │
│         │                      │                                │
│         ▼                      ▼                                │
│  hybrid-search.ts         gpu/ (CUDA + Faiss via subprocess)   │
│         │                                                       │
│         ▼                                                       │
│  (legacy cold storage path — now FAISS-only in v5+)            │
└────────────────────────────────────────────────────────────────┘
```

## Data Flow

### Inputs

| Source | Type | Description |
|--------|------|-------------|
| Source code entities | `ParsedEntity` | AST-parsed code entities from parsers |
| Text queries | `string` | Natural language search queries |
| Project context | `ProjectContext` | Active project path, hash, branch |
| Provider config | `ProviderFactoryOptions` | Embedding provider selection and settings |

### Processing

| Step | Component | Operation |
|------|-----------|-----------|
| 1. Generate | `EmbeddingGenerator` | Text to 384-dim vector via provider (LRU cache check first) |
| 2. Accumulate | `EmbeddingAccumulator` | Buffer embeddings, auto-flush at threshold (500) |
| 3. Index | `FaissProvider` / `LayeredFaissProvider` | Add vectors to Faiss HNSW in-memory index |
| 4. Search | `VectorStore.adaptiveSearch()` | Strategy selection: Faiss HNSW / CUDA / batch |
| 5. Hybrid merge | `HybridSearchEngine` | Parallel structural + semantic search, RRF merge |

### Outputs

| Output | Type | Consumer |
|--------|------|----------|
| Embeddings | `Float32Array` (384-dim) | VectorStore, FaissProvider |
| Search results | `SimilarityResult[]` | MCP tools (semantic_search, find_similar_code) |
| Hybrid results | `HybridResult[]` | MCP tools (hybrid search) |
| Cache stats | `CacheStats` | Observability / metrics endpoint |

## Public API

| Export | Kind | Description | Location |
|--------|------|-------------|----------|
| `EmbeddingGenerator` | class | Embedding generation with local LRU cache and provider fallback | [`embedding-generator.ts:79-337`](./embedding-generator.ts) |
| `VectorStore` | class | Faiss index management with adaptive search strategy | [`vector-store.ts:51-1355`](./vector-store.ts) |
| `HybridSearchEngine` | class | Structural + semantic search with RRF fusion | [`hybrid-search.ts:100-451`](./hybrid-search.ts) |
| `SemanticCache` | class | Global LRU cache with TTL for embeddings and search results | [`semantic-cache.ts:77-372`](./semantic-cache.ts) |
| `EmbeddingAccumulator` | class | Buffered batch insertion into Faiss (flush threshold 500) | [`embedding-accumulator.ts:79-667`](./embedding-accumulator.ts) |
| `EmbeddingRouter` | class | GPU-aware batch routing for embedding operations | [`embedding-router.ts:51-402`](./embedding-router.ts) |
| `CodeAnalyzer` | class | Code similarity detection, clone finding, refactoring suggestions | [`code-analyzer.ts:113-130`](./code-analyzer.ts) |
| `GlobalEmbeddingCache` | class | Singleton cache for built-in types and framework patterns | [`global-embedding-cache.ts:49-298`](./global-embedding-cache.ts) |
| `LayeredFaissProvider` | class | Base + delta Faiss index for multi-project support (v6) | [`faiss/layered-faiss-provider.ts:91-861`](./faiss/layered-faiss-provider.ts) |
| `getFaissClient()` | function | Singleton Faiss NAPI client (runtime-aware) | [`faiss/faiss-client.ts:496-503`](./faiss/faiss-client.ts) |
| `initializeFaissProvider()` | function | Initialize and return Faiss provider singleton | [`faiss/faiss-provider.ts:765-769`](./faiss/faiss-provider.ts) |
| `getGpuClient()` | function | Singleton GPU client (Faiss + CUDA unified) | [`gpu/gpu-client.ts:828-834`](./gpu/gpu-client.ts) |
| `createProvider()` | function | Factory for embedding providers (OVMS, TEI, Ollama, etc.) | [`providers/factory.ts:218-227`](./providers/factory.ts) |
| `chunkCode()` | function | Split code into semantic chunks with overlap | [`smart-chunker.ts:162-268`](./smart-chunker.ts) |
| `getRecommendedStrategy()` | function | Adaptive CPU/GPU strategy recommendation | [`gpu/adaptive-thresholds.ts:233-270`](./gpu/adaptive-thresholds.ts) |


### Added Entities

- **HashFilter** — `hash-filter.ts:32-93`
- **BoundedMinHeap** — `ivf-index.ts:61-122`
- **InvertedList** — `ivf-index.ts:128-154`
- **IvfIndex** — `ivf-index.ts:160-450`
- **KMeans** — `kmeans.ts:20-284`
- **NativeVectorIndex** — `native-vector-index.ts:36-391`
- **TurboQuant** — `turbo-quant.ts:144-541`
- **NativeVectorProvider** — `native-vector-provider.ts:57-356`
- **IvfConfig** — `ivf-index.ts:34-42`
- **IvfResult** — `ivf-index.ts:44-47`
- **ListPos** — `ivf-index.ts:49-52`
- **Scored** — `ivf-index.ts:425-428`
- **MlxNativeConfig** — `mlx-native.ts:21-26`
- **MlxNativeState** — `mlx-native.ts:28-33`
- **SearchResult** — `native-vector-index.ts:27-30`
- **NativeVectorProviderConfig** — `native-vector-provider.ts:32-48`
- **deterministicFloat** — `hash-filter.ts:22-30`
- **popcount64** — `hash-filter.ts:96-104`
- **l2Normalize** — `kmeans.ts:291-303`
- **wyhash** — `kmeans.ts:306-312`
- **findDylib** — `mlx-native.ts:40-59`
- **findMlxFramework** — `mlx-native.ts:64-84`
- **isAvailable** — `mlx-native.ts:89-92`
- **loadModel** — `mlx-native.ts:97-163`
- **embed** — `mlx-native.ts:174-201`
- **unload** — `mlx-native.ts:206-215`
- **getDimension** — `mlx-native.ts:220-222`
- **computeDot** — `native-vector-index.ts:398-404`
- **computeNorm** — `native-vector-index.ts:407-409`
- **classifyTier** — `quantization.ts:39-43`
- **tierBitWidth** — `quantization.ts:46-55`
- **lloydMaxQuantize4** — `turbo-quant.ts:63-79`
- **lloydMaxQuantize3** — `turbo-quant.ts:81-89`
- **lloydMaxQuantize2** — `turbo-quant.ts:91-95`
- **hadamardTransformInPlace** — `turbo-quant.ts:101-115`
- **hashSign** — `turbo-quant.ts:121-127`
- **nextPow2** — `turbo-quant.ts:129-138`
- **constructor** — `hash-filter.ts:37-53`
- **computeHash** — `hash-filter.ts:56-71`
- **prefilter** — `hash-filter.ts:77-87`
- **defaultThreshold** — `hash-filter.ts:90-92`
- **constructor** — `ivf-index.ts:66-69`
- **len** — `ivf-index.ts:71-73`
- **push** — `ivf-index.ts:75-84`
- **bubbleUp** — `ivf-index.ts:86-99`
- **siftDown** — `ivf-index.ts:101-115`
- **sortDescending** — `ivf-index.ts:117-121`
- **append** — `ivf-index.ts:133-137`
- **swapRemove** — `ivf-index.ts:139-153`
- **constructor** — `ivf-index.ts:170-180`
- **trainAndBuild** — `ivf-index.ts:183-209`
- **addEncoded** — `ivf-index.ts:212-220`
- **remove** — `ivf-index.ts:223-235`
- **search** — `ivf-index.ts:238-278`
- **needsRetrain** — `ivf-index.ts:280-283`
- **save** — `ivf-index.ts:289-354`
- **load** — `ivf-index.ts:356-416`
- **findNearestCentroids** — `ivf-index.ts:422-449`
- **constructor** — `kmeans.ts:26-31`
- **train** — `kmeans.ts:37-63`
- **assign** — `kmeans.ts:66-80`
- **batchAssign** — `kmeans.ts:83-85`
- **saveToBuffer** — `kmeans.ts:88-96`
- **loadFromBuffer** — `kmeans.ts:99-112`
- **computeNLists** — `kmeans.ts:118-122`
- **kmeansppInit** — `kmeans.ts:132-185`
- **assignStep** — `kmeans.ts:187-203`
- **updateStep** — `kmeans.ts:206-246`
- **handleEmptyClusters** — `kmeans.ts:249-283`
- **constructor** — `native-vector-index.ts:51-57`
- **setHashFilter** — `native-vector-index.ts:60-62`
- **count** — `native-vector-index.ts:65-67`
- **add** — `native-vector-index.ts:70-89`
- **addWithTier** — `native-vector-index.ts:92-95`
- **addBatch** — `native-vector-index.ts:98-121`
- **addBatchFlat** — `native-vector-index.ts:124-147`
- **remove** — `native-vector-index.ts:150-170`
- **hasEntity** — `native-vector-index.ts:173-178`
- **getEntityId** — `native-vector-index.ts:181-183`
- **getVectorsFlat** — `native-vector-index.ts:186-188`
- **search** — `native-vector-index.ts:191-234`
- **save** — `native-vector-index.ts:244-279`
- **load** — `native-vector-index.ts:284-356`
- **ensureCapacity** — `native-vector-index.ts:362-385`
- **grow** — `native-vector-index.ts:387-390`
- **constructor** — `turbo-quant.ts:154-180`
- **codeBytes** — `turbo-quant.ts:186-188`
- **normOffset** — `turbo-quant.ts:190-192`
- **residualNormOffset** — `turbo-quant.ts:194-196`
- **jlOffset** — `turbo-quant.ts:198-200`
- **jlBytes** — `turbo-quant.ts:202-204`
- **encodedSize** — `turbo-quant.ts:206-208`
- **encode** — `turbo-quant.ts:214-323`
- **rotateQuery** — `turbo-quant.ts:329-343`
- **precomputeJlProjection** — `turbo-quant.ts:345-357`
- **asymmetricIP** — `turbo-quant.ts:363-368`
- **asymmetricIPCorrected** — `turbo-quant.ts:370-391`
- **rawSumDispatch** — `turbo-quant.ts:395-406`
- **rawSum4** — `turbo-quant.ts:408-419`
- **rawSum3** — `turbo-quant.ts:421-439`
- **rawSum2** — `turbo-quant.ts:441-452`
- **asymmetricCosine** — `turbo-quant.ts:458-464`
- **asymmetricCosineCorrected** — `turbo-quant.ts:466-477`
- **batchAsymmetricCosine** — `turbo-quant.ts:479-499`
- **getStoredNorm** — `turbo-quant.ts:505-509`
- **getStoredResidualNorm** — `turbo-quant.ts:511-515`
- **saveToBuffer** — `turbo-quant.ts:521-528`
- **loadFromBuffer** — `turbo-quant.ts:530-540`
- **constructor** — `native-vector-provider.ts:80-95`
- **initialize** — `native-vector-provider.ts:98-136`
- **add** — `native-vector-provider.ts:139-161`
- **addBatch** — `native-vector-provider.ts:164-171`
- **search** — `native-vector-provider.ts:174-198`
- **remove** — `native-vector-provider.ts:201-205`
- **hasId** — `native-vector-provider.ts:208-210`
- **getExistingIds** — `native-vector-provider.ts:213-219`
- **count** — `native-vector-provider.ts:222-224`
- **flush** — `native-vector-provider.ts:227-231`
- **save** — `native-vector-provider.ts:237-260`
- **close** — `native-vector-provider.ts:263-266`
- **getStats** — `native-vector-provider.ts:269-283`
- **clearAll** — `native-vector-provider.ts:286-295`
- **removeInternal** — `native-vector-provider.ts:301-311`
- **maybeTrainIvf** — `native-vector-provider.ts:313-322`
- **trainIvf** — `native-vector-provider.ts:324-336`
- **getIvfConfig** — `native-vector-provider.ts:338-347`
- **maybeAutoSave** — `native-vector-provider.ts:349-355`
- **HASH_BITS** — `hash-filter.ts:16-16`
- **total** — `hash-filter.ts:39-39`
- **seed** — `hash-filter.ts:43-43`
- **hpOffset** — `hash-filter.ts:61-61`
- **candidates** — `hash-filter.ts:78-78`
- **xor** — `hash-filter.ts:80-80`
- **dist** — `hash-filter.ts:81-81`
- **FILE_MAGIC** — `ivf-index.ts:54-54`
- **FILE_VERSION** — `ivf-index.ts:55-55`
- **parent** — `ivf-index.ts:89-89`
- **tmp** — `ivf-index.ts:91-91`
- **left** — `ivf-index.ts:105-105`
- **right** — `ivf-index.ts:106-106`
- **tmp** — `ivf-index.ts:110-110`
- **result** — `ivf-index.ts:118-118`
- **last** — `ivf-index.ts:141-141`
- **dim** — `ivf-index.ts:184-184`
- **km** — `ivf-index.ts:189-189`
- **tq** — `ivf-index.ts:193-193`
- **vec** — `ivf-index.ts:200-200`
- **centroidIdx** — `ivf-index.ts:201-201`
- **encoded** — `ivf-index.ts:202-202`
- **pos** — `ivf-index.ts:203-203`
- **centroidIdx** — `ivf-index.ts:215-215`
- **encoded** — `ivf-index.ts:216-216`
- **pos** — `ivf-index.ts:217-217`
- **entry** — `ivf-index.ts:224-224`
- **swappedMaster** — `ivf-index.ts:227-227`
- **swapEntry** — `ivf-index.ts:229-229`
- **tq** — `ivf-index.ts:242-242`
- **km** — `ivf-index.ts:243-243`
- **rotated** — `ivf-index.ts:246-246`
- **queryNorm** — `ivf-index.ts:247-247`
- **jlProj** — `ivf-index.ts:251-251`
- **nprobe** — `ivf-index.ts:254-254`
- **probeIndices** — `ivf-index.ts:255-255`
- **heapCap** — `ivf-index.ts:258-258`
- **heap** — `ivf-index.ts:261-261`
- **list** — `ivf-index.ts:264-264`
- **enc** — `ivf-index.ts:268-268`
- **score** — `ivf-index.ts:269-271`
- **tq** — `ivf-index.ts:292-292`
- **km** — `ivf-index.ts:293-293`
- **esize** — `ivf-index.ts:294-294`
- **tqBuf** — `ivf-index.ts:296-296`
- **kmBuf** — `ivf-index.ts:297-297`
- **list** — `ivf-index.ts:303-303`
- **buf** — `ivf-index.ts:311-311`
- **list** — `ivf-index.ts:332-332`
- **enc** — `ivf-index.ts:339-339`
- **data** — `ivf-index.ts:357-357`
- **magic** — `ivf-index.ts:361-361`
- **version** — `ivf-index.ts:365-365`
- **dimension** — `ivf-index.ts:369-369`
- **nLists** — `ivf-index.ts:373-373`
- **totalEncoded** — `ivf-index.ts:375-375`
- **{ tq, bytesRead: tqBytes }** — `ivf-index.ts:378-378`
- **{ kmeans: km, bytesRead: kmBytes }** — `ivf-index.ts:381-381`
- **lists** — `ivf-index.ts:384-384`
- **reverseMap** — `ivf-index.ts:385-385`
- **count** — `ivf-index.ts:388-388`
- **esize** — `ivf-index.ts:389-389`
- **dataBytes** — `ivf-index.ts:394-394`
- **idxBytes** — `ivf-index.ts:395-395`
- **enc** — `ivf-index.ts:398-398`
- **masterIdx** — `ivf-index.ts:399-399`
- **ivf** — `ivf-index.ts:406-406`
- **probeCount** — `ivf-index.ts:423-423`
- **best** — `ivf-index.ts:430-430`
- **centroid** — `ivf-index.ts:433-433`
- **sim** — `ivf-index.ts:434-434`
- **tmp** — `ivf-index.ts:440-440`
- **{ k, dim }** — `kmeans.ts:40-40`
- **assignments** — `kmeans.ts:41-41`
- **counts** — `kmeans.ts:42-42`
- **accum** — `kmeans.ts:43-43`
- **converged** — `kmeans.ts:54-54`
- **{ k, dim }** — `kmeans.ts:67-67`
- **centroid** — `kmeans.ts:72-72`
- **sim** — `kmeans.ts:73-73`
- **headerSize** — `kmeans.ts:89-89`
- **dataSize** — `kmeans.ts:90-90`
- **buf** — `kmeans.ts:91-91`
- **k** — `kmeans.ts:100-100`
- **dim** — `kmeans.ts:101-101`
- **km** — `kmeans.ts:102-102`
- **dataSize** — `kmeans.ts:104-104`
- **src** — `kmeans.ts:105-105`
- **aligned** — `kmeans.ts:106-106`
- **sq** — `kmeans.ts:120-120`
- **{ k, dim }** — `kmeans.ts:133-133`
- **minDists** — `kmeans.ts:134-134`
- **firstIdx** — `kmeans.ts:137-137`
- **vec** — `kmeans.ts:143-143`
- **sim** — `kmeans.ts:144-144`
- **w** — `kmeans.ts:153-153`
- **hash** — `kmeans.ts:158-158`
- **w** — `kmeans.ts:163-163`
- **vec** — `kmeans.ts:177-177`
- **sim** — `kmeans.ts:178-178`
- **dist** — `kmeans.ts:179-179`
- **{ k, dim }** — `kmeans.ts:188-188`
- **vec** — `kmeans.ts:190-190`
- **centroid** — `kmeans.ts:194-194`
- **sim** — `kmeans.ts:195-195`
- **{ k, dim }** — `kmeans.ts:213-213`
- **c** — `kmeans.ts:219-219`
- **vecOff** — `kmeans.ts:221-221`
- **accOff** — `kmeans.ts:222-222`
- **invCount** — `kmeans.ts:232-232`
- **cOff** — `kmeans.ts:233-233`
- **newVal** — `kmeans.ts:236-236`
- **delta** — `kmeans.ts:237-237`
- **{ k, dim }** — `kmeans.ts:255-255`
- **vec** — `kmeans.ts:272-272`
- **cOff** — `kmeans.ts:273-273`
- **perturb** — `kmeans.ts:275-275`
- **norm** — `kmeans.ts:296-296`
- **inv** — `kmeans.ts:298-298`
- **baseDir** — `mlx-native.ts:41-41`
- **dataDir** — `mlx-native.ts:42-42`
- **candidates** — `mlx-native.ts:43-53`
- **baseDir** — `mlx-native.ts:65-65`
- **dataDir** — `mlx-native.ts:66-66`
- **candidates** — `mlx-native.ts:67-78`
- **dylibPath** — `mlx-native.ts:100-100`
- **mlxPath** — `mlx-native.ts:101-101`
- **mlxDir** — `mlx-native.ts:115-115`
- **existingPath** — `mlx-native.ts:116-116`
- **lib** — `mlx-native.ts:123-140`
- **maxBatch** — `mlx-native.ts:142-142`
- **maxSeq** — `mlx-native.ts:143-143`
- **hiddenDim** — `mlx-native.ts:144-144`
- **modelDirBuf** — `mlx-native.ts:146-146`
- **handle** — `mlx-native.ts:147-147`
- **version** — `mlx-native.ts:154-154`
- **outputSize** — `mlx-native.ts:182-182`
- **output** — `mlx-native.ts:183-183`
- **rc** — `mlx-native.ts:185-193`
- **norm** — `native-vector-index.ts:73-73`
- **offset** — `native-vector-index.ts:80-80`
- **vec** — `native-vector-index.ts:104-104`
- **norm** — `native-vector-index.ts:106-106`
- **offset** — `native-vector-index.ts:109-109`
- **dim** — `native-vector-index.ts:129-129`
- **vec** — `native-vector-index.ts:131-131`
- **norm** — `native-vector-index.ts:132-132`
- **offset** — `native-vector-index.ts:135-135`
- **last** — `native-vector-index.ts:153-153`
- **dim** — `native-vector-index.ts:161-161`
- **queryNorm** — `native-vector-index.ts:194-194`
- **n** — `native-vector-index.ts:197-197`
- **dim** — `native-vector-index.ts:200-200`
- **results** — `native-vector-index.ts:201-201`
- **queryHash** — `native-vector-index.ts:205-205`
- **candidates** — `native-vector-index.ts:206-206`
- **norm** — `native-vector-index.ts:210-210`
- **vec** — `native-vector-index.ts:212-212`
- **dot** — `native-vector-index.ts:213-213`
- **cosine** — `native-vector-index.ts:214-214`
- **norm** — `native-vector-index.ts:224-224`
- **vec** — `native-vector-index.ts:226-226`
- **dot** — `native-vector-index.ts:227-227`
- **cosine** — `native-vector-index.ts:228-228`
- **n** — `native-vector-index.ts:245-245`
- **dim** — `native-vector-index.ts:246-246`
- **vecBytes** — `native-vector-index.ts:247-247`
- **totalSize** — `native-vector-index.ts:254-254`
- **buf** — `native-vector-index.ts:256-256`
- **id** — `native-vector-index.ts:266-266`
- **idBuf** — `native-vector-index.ts:267-267`
- **vecSrc** — `native-vector-index.ts:275-275`
- **data** — `native-vector-index.ts:285-285`
- **dimension** — `native-vector-index.ts:288-288`
- **entryCount** — `native-vector-index.ts:289-289`
- **idx** — `native-vector-index.ts:291-291`
- **vecBytesPerEntry** — `native-vector-index.ts:293-293`
- **ids** — `native-vector-index.ts:297-297`
- **idLen** — `native-vector-index.ts:305-305`
- **expectedVecBytes** — `native-vector-index.ts:315-315`
- **vecBuf** — `native-vector-index.ts:322-322`
- **aligned** — `native-vector-index.ts:323-323`
- **f32** — `native-vector-index.ts:325-325`
- **vec** — `native-vector-index.ts:330-330`
- **idLen** — `native-vector-index.ts:341-341`
- **id** — `native-vector-index.ts:344-344`
- **vecRaw** — `native-vector-index.ts:346-346`
- **vecAligned** — `native-vector-index.ts:348-348`
- **vec** — `native-vector-index.ts:350-350`
- **newCap** — `native-vector-index.ts:364-364`
- **newFlat** — `native-vector-index.ts:366-366`
- **newNorms** — `native-vector-index.ts:372-372`
- **newHashes** — `native-vector-index.ts:376-376`
- **newTiers** — `native-vector-index.ts:380-380`
- **newCap** — `native-vector-index.ts:388-388`
- **TIER_HOT** — `quantization.ts:23-23`
- **TIER_WARM** — `quantization.ts:24-24`
- **TIER_COLD** — `quantization.ts:25-25`
- **HIGH_VALUE_TYPES** — `quantization.ts:27-36`
- **LLOYD_MAX_4BIT_LEVELS** — `turbo-quant.ts:32-35`
- **LLOYD_MAX_4BIT_THRESHOLDS** — `turbo-quant.ts:37-40`
- **LLOYD_MAX_3BIT_LEVELS** — `turbo-quant.ts:44-46`
- **LLOYD_MAX_3BIT_THRESHOLDS** — `turbo-quant.ts:48-48`
- **LLOYD_MAX_2BIT_LEVELS** — `turbo-quant.ts:52-52`
- **LLOYD_MAX_2BIT_THRESHOLDS** — `turbo-quant.ts:54-54`
- **QJL_SCALE** — `turbo-quant.ts:57-57`
- **t** — `turbo-quant.ts:64-64`
- **t** — `turbo-quant.ts:82-82`
- **t** — `turbo-quant.ts:92-92`
- **n** — `turbo-quant.ts:102-102`
- **a** — `turbo-quant.ts:107-107`
- **b** — `turbo-quant.ts:108-108`
- **padded** — `turbo-quant.ts:158-158`
- **jlTotal** — `turbo-quant.ts:174-174`
- **jlSeed** — `turbo-quant.ts:176-176`
- **norm** — `turbo-quant.ts:217-217`
- **pdim** — `turbo-quant.ts:218-218`
- **buf** — `turbo-quant.ts:221-221`
- **scale** — `turbo-quant.ts:231-231`
- **sigma** — `turbo-quant.ts:237-237`
- **invSigma** — `turbo-quant.ts:239-239`
- **encSize** — `turbo-quant.ts:246-246`
- **result** — `turbo-quant.ts:247-247`
- **c0** — `turbo-quant.ts:255-255`
- **c1** — `turbo-quant.ts:256-256`
- **r0** — `turbo-quant.ts:258-258`
- **r1** — `turbo-quant.ts:259-259`
- **bi** — `turbo-quant.ts:268-268`
- **c** — `turbo-quant.ts:269-269`
- **q3** — `turbo-quant.ts:271-271`
- **r** — `turbo-quant.ts:273-273`
- **c0** — `turbo-quant.ts:285-285`
- **c1** — `turbo-quant.ts:286-286`
- **c2** — `turbo-quant.ts:287-287`
- **c3** — `turbo-quant.ts:288-288`
- **codes** — `turbo-quant.ts:290-290`
- **r** — `turbo-quant.ts:292-292`
- **normView** — `turbo-quant.ts:302-302`
- **residualNormView** — `turbo-quant.ts:304-304`
- **jlOff** — `turbo-quant.ts:308-308`
- **rowOff** — `turbo-quant.ts:311-311`
- **byteIdx** — `turbo-quant.ts:316-316`
- **bitIdx** — `turbo-quant.ts:317-317`
- **pdim** — `turbo-quant.ts:330-330`
- **out** — `turbo-quant.ts:331-331`
- **s** — `turbo-quant.ts:338-338`
- **jlProj** — `turbo-quant.ts:346-346`
- **pdim** — `turbo-quant.ts:347-347`
- **rowOff** — `turbo-quant.ts:350-350`
- **rawSum** — `turbo-quant.ts:364-364`
- **vecNorm** — `turbo-quant.ts:365-365`
- **sigma** — `turbo-quant.ts:366-366`
- **rawSum** — `turbo-quant.ts:371-371`
- **residualNorm** — `turbo-quant.ts:374-374`
- **jlOff** — `turbo-quant.ts:377-377`
- **byteI** — `turbo-quant.ts:379-379`
- **bitI** — `turbo-quant.ts:380-380`
- **signBit** — `turbo-quant.ts:381-381`
- **sign** — `turbo-quant.ts:382-382`
- **vecNorm** — `turbo-quant.ts:388-388`
- **sigma** — `turbo-quant.ts:389-389`
- **pdim** — `turbo-quant.ts:409-409`
- **byte** — `turbo-quant.ts:412-412`
- **lo** — `turbo-quant.ts:413-413`
- **hi** — `turbo-quant.ts:414-414`
- **pdim** — `turbo-quant.ts:422-422`
- **bi** — `turbo-quant.ts:425-425`
- **b0** — `turbo-quant.ts:426-426`
- **b1** — `turbo-quant.ts:427-427`
- **b2** — `turbo-quant.ts:428-428`
- **pdim** — `turbo-quant.ts:442-442`
- **byte** — `turbo-quant.ts:445-445`
- **ip** — `turbo-quant.ts:459-459`
- **vecNorm** — `turbo-quant.ts:460-460`
- **denom** — `turbo-quant.ts:461-461`
- **ip** — `turbo-quant.ts:472-472`
- **vecNorm** — `turbo-quant.ts:473-473`
- **denom** — `turbo-quant.ts:474-474`
- **esize** — `turbo-quant.ts:487-487`
- **enc** — `turbo-quant.ts:490-490`
- **enc** — `turbo-quant.ts:495-495`
- **off** — `turbo-quant.ts:506-506`
- **dv** — `turbo-quant.ts:507-507`
- **off** — `turbo-quant.ts:512-512`
- **dv** — `turbo-quant.ts:513-513`
- **buf** — `turbo-quant.ts:522-522`
- **dim** — `turbo-quant.ts:531-531`
- **paddedDim** — `turbo-quant.ts:532-532`
- **bits** — `turbo-quant.ts:533-533`
- **seed** — `turbo-quant.ts:534-534`
- **tq** — `turbo-quant.ts:536-536`
- **VECTORS_FILENAME** — `native-vector-provider.ts:50-50`
- **IVF_FILENAME** — `native-vector-provider.ts:51-51`
- **vectorsPath** — `native-vector-provider.ts:102-102`
- **ivfPath** — `native-vector-provider.ts:103-103`
- **eid** — `native-vector-provider.ts:112-112`
- **vec** — `native-vector-provider.ts:140-140`
- **id** — `native-vector-provider.ts:141-141`
- **idx** — `native-vector-provider.ts:148-148`
- **total** — `native-vector-provider.ts:175-175`
- **ivfResults** — `native-vector-provider.ts:180-180`
- **id** — `native-vector-provider.ts:182-182`
- **results** — `native-vector-provider.ts:192-192`
- **existing** — `native-vector-provider.ts:214-214`
- **saved** — `native-vector-provider.ts:228-228`
- **vectorsPath** — `native-vector-provider.ts:244-244`
- **ivfPath** — `native-vector-provider.ts:248-248`
- **cachePath** — `native-vector-provider.ts:253-253`
- **cacheObj** — `native-vector-provider.ts:254-254`
- **idx** — `native-vector-provider.ts:302-302`
- **total** — `native-vector-provider.ts:314-314`
- **total** — `native-vector-provider.ts:325-325`
- **t0** — `native-vector-provider.ts:329-329`
- **ivf** — `native-vector-provider.ts:331-331`
- **h** — `hash-filter.ts:24-24`
- **i** — `hash-filter.ts:46-46`
- **sum** — `hash-filter.ts:47-47`
- **j** — `hash-filter.ts:48-48`
- **hash** — `hash-filter.ts:58-58`
- **bit** — `hash-filter.ts:60-60`
- **dot** — `hash-filter.ts:62-62`
- **i** — `hash-filter.ts:63-63`
- **i** — `hash-filter.ts:79-79`
- **count** — `hash-filter.ts:97-97`
- **x** — `hash-filter.ts:98-98`
- **i** — `ivf-index.ts:87-87`
- **i** — `ivf-index.ts:102-102`
- **smallest** — `ivf-index.ts:104-104`
- **i** — `ivf-index.ts:199-199`
- **i** — `ivf-index.ts:267-267`
- **totalSize** — `ivf-index.ts:300-300`
- **li** — `ivf-index.ts:302-302`
- **pos** — `ivf-index.ts:312-312`
- **li** — `ivf-index.ts:331-331`
- **i** — `ivf-index.ts:338-338`
- **j** — `ivf-index.ts:340-340`
- **i** — `ivf-index.ts:346-346`
- **pos** — `ivf-index.ts:359-359`
- **li** — `ivf-index.ts:387-387`
- **i** — `ivf-index.ts:397-397`
- **c** — `ivf-index.ts:432-432`
- **j** — `ivf-index.ts:438-438`
- **iter** — `kmeans.ts:49-49`
- **bestIdx** — `kmeans.ts:68-68`
- **bestSim** — `kmeans.ts:69-69`
- **c** — `kmeans.ts:71-71`
- **i** — `kmeans.ts:142-142`
- **c** — `kmeans.ts:149-149`
- **totalWeight** — `kmeans.ts:151-151`
- **i** — `kmeans.ts:152-152`
- **target** — `kmeans.ts:159-159`
- **chosen** — `kmeans.ts:161-161`
- **i** — `kmeans.ts:162-162`
- **i** — `kmeans.ts:176-176`
- **i** — `kmeans.ts:189-189`
- **bestIdx** — `kmeans.ts:191-191`
- **bestSim** — `kmeans.ts:192-192`
- **c** — `kmeans.ts:193-193`
- **i** — `kmeans.ts:218-218`
- **d** — `kmeans.ts:223-223`
- **maxDelta** — `kmeans.ts:229-229`
- **c** — `kmeans.ts:230-230`
- **d** — `kmeans.ts:235-235`
- **largestCluster** — `kmeans.ts:257-257`
- **largestCount** — `kmeans.ts:258-258`
- **i** — `kmeans.ts:259-259`
- **c** — `kmeans.ts:267-267`
- **i** — `kmeans.ts:270-270`
- **d** — `kmeans.ts:274-274`
- **sum** — `kmeans.ts:292-292`
- **i** — `kmeans.ts:293-293`
- **i** — `kmeans.ts:299-299`
- **h** — `kmeans.ts:307-307`
- **state** — `mlx-native.ts:35-35`
- **added** — `native-vector-index.ts:102-102`
- **i** — `native-vector-index.ts:103-103`
- **added** — `native-vector-index.ts:128-128`
- **i** — `native-vector-index.ts:130-130`
- **i** — `native-vector-index.ts:151-151`
- **i** — `native-vector-index.ts:174-174`
- **i** — `native-vector-index.ts:223-223`
- **idsTotal** — `native-vector-index.ts:250-250`
- **i** — `native-vector-index.ts:251-251`
- **pos** — `native-vector-index.ts:257-257`
- **i** — `native-vector-index.ts:265-265`
- **pos** — `native-vector-index.ts:296-296`
- **soaOk** — `native-vector-index.ts:298-298`
- **i** — `native-vector-index.ts:300-300`
- **i** — `native-vector-index.ts:329-329`
- **i** — `native-vector-index.ts:339-339`
- **sum** — `native-vector-index.ts:399-399`
- **i** — `native-vector-index.ts:400-400`
- **step** — `turbo-quant.ts:103-103`
- **i** — `turbo-quant.ts:105-105`
- **j** — `turbo-quant.ts:106-106`
- **h** — `turbo-quant.ts:122-122`
- **x** — `turbo-quant.ts:131-131`
- **i** — `turbo-quant.ts:170-170`
- **i** — `turbo-quant.ts:177-177`
- **i** — `turbo-quant.ts:225-225`
- **i** — `turbo-quant.ts:232-232`
- **i** — `turbo-quant.ts:240-240`
- **residualSq** — `turbo-quant.ts:250-250`
- **i** — `turbo-quant.ts:254-254`
- **dimI** — `turbo-quant.ts:267-267`
- **k** — `turbo-quant.ts:270-270`
- **i** — `turbo-quant.ts:284-284`
- **k** — `turbo-quant.ts:291-291`
- **j** — `turbo-quant.ts:309-309`
- **dot** — `turbo-quant.ts:310-310`
- **i** — `turbo-quant.ts:312-312`
- **i** — `turbo-quant.ts:334-334`
- **i** — `turbo-quant.ts:339-339`
- **j** — `turbo-quant.ts:348-348`
- **dot** — `turbo-quant.ts:349-349`
- **i** — `turbo-quant.ts:351-351`
- **correction** — `turbo-quant.ts:375-375`
- **j** — `turbo-quant.ts:378-378`
- **sum** — `turbo-quant.ts:410-410`
- **i** — `turbo-quant.ts:411-411`
- **sum** — `turbo-quant.ts:423-423`
- **di** — `turbo-quant.ts:424-424`
- **sum** — `turbo-quant.ts:443-443`
- **i** — `turbo-quant.ts:444-444`
- **i** — `turbo-quant.ts:489-489`
- **i** — `turbo-quant.ts:494-494`
- **i** — `native-vector-provider.ts:111-111`
- **Tier** — `quantization.ts:22-22`

## Dependencies

### Internal

| Module | Usage |
|--------|-------|
| `../logging` | Structured logging (log.i, log.e, log.w, log.d, log.t) |
| `../types/semantic` | `VectorEmbedding`, `SimilarityResult`, `HybridResult` |
| `../types/parser` | `ParsedEntity` for code analysis |
| `../types/storage` | `Entity`, `ProjectContext` |
| `../storage/libsql-graph-adapter` | GraphAdapter for entity metadata persistence (SQLite) |
| `../utils/simd-vector-ops` | SIMD-accelerated `cosineSimilarity`, `normalize` |
| `../utils/fast-hash` | `hashText` for cache keys |
| `../agents/query-agent` | `QueryAgent` for structural search in hybrid mode |
| `../nlp/query-expander` | `QueryExpander` for two-pass semantic search |
| `../config/constants` | `CACHE_CONSTANTS`, `DEFAULT_CONFIG` |

### External

| Package | Usage |
|---------|-------|
| `ultracode_cuda.node` | Native FAISS addon (CPU + optional GPU). Primary FAISS backend in GPU worker pipeline. Replaces `faiss-napi`. |
| `faiss-napi` | **Legacy** NAPI bindings for Faiss (used only in `faiss-client.ts` in-process fallback) |
| `lru-cache` | LRU cache with TTL for `SemanticCache` |
| gRPC (runtime) | OVMS Native provider communication |

## Configuration

| Parameter | Default | Description |
|-----------|---------|-------------|
| `EMBEDDING_DEBUG` | `false` | Enable debug logs in EmbeddingGenerator |
| `VECTOR_STORE_DEBUG` | `false` | Enable debug logs in VectorStore |
| `ADAPTIVE_DEBUG` | `false` | Log GPU/CPU strategy selection |
| `MCP_DEBUG_DISABLE_SEMANTIC` | `0` | Disable semantic warmup |
| Embedding model | `all-MiniLM-L6-v2` | 384 dimensions, configurable per provider |
| Flush threshold | `500` | EmbeddingAccumulator auto-flush count |
| Queue batch size | `200` | Texts per OVMS request |
| Parallel batches | `12` | Max concurrent OVMS requests |
| LRU cache max | `10000` | EmbeddingGenerator local cache entries |

## Behavioral Properties

### Async

All embedding generation, search, and Faiss operations are fully async. `EmbeddingAccumulator.flushAsync()` is fire-and-forget. `FaissProvider.pendingSave` persists index in background. `HybridSearchEngine` executes structural and semantic search in parallel via `Promise.all`. Lazy singleton initialization uses guarded `initPromise` pattern.

### Thread Safety

Single-threaded (Node.js/Bun event loop). GPU worker runs as a subprocess for CUDA operations. Faiss NAPI client is single-instance singleton. No shared mutable state across workers; IPC via JSON messages or named pipes (`NamedPipeTransport`).

### Idempotency

`EmbeddingGenerator.generate()` is idempotent (LRU cached). `VectorStore.addBatch()` overwrites existing IDs. `FaissProvider.initialize()` is guarded (no-op on re-call). Provider creation via factory is not idempotent (creates new instance each time).

### Side Effects

Faiss index persisted to disk on flush. SQLite metadata written on context switch. OVMS/TEI/Ollama HTTP calls to external services. Subprocess spawned for GPU worker. Embedding dump files written to data directory.

### State (Hot/Cold Paths)

```
New embeddings ──► Faiss (hot, in-memory, HNSW)
                         │
                         │ periodic flush
                         ▼
Old embeddings ──► Faiss on disk (cold, persistent)

Search = Faiss results → enrich from SQLite entity metadata
```

**Hot path:** New embeddings indexed in Faiss HNSW (O(log n) search, <1ms). **Cold path:** Periodic flush to disk; on restart, Faiss index rebuilt from persistent storage. **Layered (v6):** Base index (read-only, loaded on context switch) + delta index (writable, merged on flush).

## Error Handling

All provider calls wrapped in try/catch with structured logging. `EmbeddingGenerator` throws if no provider configured (`"No embedding provider available"`). `VectorStore` logs errors on LayeredFaissProvider initialization failure and continues with degraded search. `EmbeddingRouter` propagates flush errors after logging. 168+ try/catch blocks covering provider init, Faiss operations, HTTP requests, and file I/O. Logging levels: `log.e` (critical), `log.w` (degraded), `log.i` (lifecycle), `log.d` (detail), `log.t` (trace/timing).

## Observability

| Component | Method | Metrics |
|-----------|--------|---------|
| `EmbeddingGenerator` | `getCacheStats()` | size, hits, misses, hitRate |
| `SemanticCache` | `getStats()` | size, hits, misses, evictions, hitRate, memoryUsage |
| `VectorStore` | `getStats()` | vectorCount, indexSize, lastIndexTime, indexDuration |
| `HybridSearchEngine` | `getMetrics()` | totalSearches, avgSearchTime, avgResultCount |
| `EmbeddingRouter` | `getStats()` | totalAdded, totalFlushed, flushCount, avgFlushTimeMs, pendingCount |

Log channels: `EMBEDDING`, `VECTOR`, `HYBRID`, `CACHE`, `ACCUMULATOR`, `ROUTER`, `ADAPTIVE`, `FAISS`, `GPU`, `FACTORY`.

## Known Limitations

1. **Memory:** EmbeddingGenerator LRU cache ~15MB at capacity (10K entries x 384 floats). Faiss HNSW optimal for <1M vectors; beyond that, switch to IVF.
2. **Provider dependency:** If the configured provider (OVMS/TEI/Ollama) is unavailable, embedding generation blocks. No automatic fallback to built-in Xenova model.
3. **QueryAgent coupling:** HybridSearchEngine requires QueryAgent for structural search; returns empty structural results if not configured.
4. **Layered index (v6):** LayeredFaissProvider is evolving; project context switches may be slow with large base indexes.
5. **RRF pre-computation:** Float32Array optimization is memory-efficient but may slow down for result sets >1000 items.

## TypeScript Notes

### Event Map

No EventEmitter usage. Communication with GPU worker uses JSON IPC messages (`GpuWorkerRequest` / `GpuWorkerResponse` discriminated unions). Named pipe transport available for high-throughput scenarios.

### Module Boundary

```typescript
// Discriminated union for strategy selection
type IndexStrategy = "libsql-diskann" | "faiss-hnsw" | "faiss-ivf" | "hybrid";
type SearchStrategy = "libsql" | "faiss" | "cuda-bruteforce" | "hybrid";

// Generic cache accessor
SemanticCache.get<T = CacheValue>(key: string): T | undefined;

// Lazy singleton guard pattern
private initPromise: Promise<void> | null = null;
async initialize(): Promise<void> {
  if (this.initPromise) return this.initPromise;
  this.initPromise = this.initializeInternal();
  return this.initPromise;
}
```

Key type exports: `EmbeddingProvider` (interface, `providers/base.ts:87`), `IFaissClient` (interface, `faiss/faiss-client.ts:59-72`), `IGpuClient` (interface, `gpu/gpu-client.ts:70-118`), `IVectorProvider` (interface, `faiss/types.ts:24-35`).

## Files

| File | Description |
|------|-------------|
| `embedding-generator.ts` | Core embedding generation with LRU cache and provider dispatch |
| `vector-store.ts` | Faiss index management, adaptive search strategy selection |
| `hybrid-search.ts` | Structural + semantic search with RRF score merging |
| `semantic-cache.ts` | Global LRU cache with TTL (embeddings, search, general) |
| `embedding-accumulator.ts` | Buffered batch insertion with debounced async flush |
| `embedding-router.ts` | GPU-aware embedding batch routing and flush coordination |
| `code-analyzer.ts` | Semantic code similarity, clone detection, refactoring |
| `smart-chunker.ts` | Code chunking with overlap for large entities |
| `entity-expander.ts` | Expand large classes into method-level entities |
| `global-embedding-cache.ts` | Pre-computed embeddings for built-in types |
| `embedding-warmup.ts` | Background provider warmup on startup |
| `embedding-dump.ts` | Serialize/deserialize embeddings for debugging |
| `ovms-native-manager.ts` | OVMS (OpenVINO Model Server) lifecycle management |
| `llamacpp-server-manager.ts` | llama.cpp server lifecycle management |
| `mlx-server-manager.ts` | MLX server lifecycle (macOS ARM64 Metal GPU) |
| `faiss/faiss-client.ts` | Unified Faiss NAPI client (runtime-aware singleton) |
| `faiss/faiss-provider.ts` | Hot/cold hybrid Faiss index provider |
| `faiss/layered-faiss-provider.ts` | Base + delta layered index for multi-project (v6) |
| `faiss/base-branch-detector.ts` | Detect base branch for layered index initialization |
| `faiss/types.ts` | IPC protocol types for Faiss operations |
| `faiss/layered-types.ts` | Types for layered index config, delta, paths |
| `faiss/provider-interface.ts` | `IFaissProvider` interface contract |
| `gpu/gpu-client.ts` | Unified GPU client (Faiss + CUDA) with auto-runtime detection |
| `gpu/gpu-worker.ts` | Node.js subprocess for CUDA addon operations |
| `gpu/adaptive-thresholds.ts` | CPU/GPU strategy selection based on vector count and dimensions |
| `gpu/faiss-handlers.ts` | Faiss operation handlers for GPU worker |
| `gpu/cuda-handlers.ts` | CUDA similarity handlers (cosine, euclidean, normalize) |
| `gpu/embeddings-handlers.ts` | Embedding batch operations in GPU worker |
| `gpu/named-pipe-transport.ts` | Named pipe IPC for high-throughput GPU communication |
| `gpu/types.ts` | Unified IPC protocol (Faiss + CUDA request/response) |
| `gpu/type-guards.ts` | Type guard functions for IPC message discrimination |
| `gpu/request-helpers.ts` | Vector extraction helpers for IPC requests |
| `providers/base.ts` | `EmbeddingProvider` interface and shared types |
| `providers/factory.ts` | Provider factory with priority-based selection |
| `providers/ovms-provider.ts` | OVMS gRPC provider (highest priority) |
| `providers/tei-provider.ts` | TEI Docker HTTP provider |
| `providers/ollama-provider.ts` | Ollama local HTTP provider |
| ~~`providers/vllm-provider.ts`~~ (deleted) | vLLM Docker OpenAI-compatible provider |
| `providers/mlx-provider.ts` | MLX provider (macOS Metal GPU) |
| `providers/llamacpp-provider.ts` | llama.cpp HTTP provider |
| `providers/openai-provider.ts` | OpenAI API remote provider |
| `providers/huggingface-provider.ts` | HuggingFace API remote provider |
| `providers/cloudru-provider.ts` | Cloud.ru API provider |
| `providers/http-engine.ts` | Shared HTTP engine with retry and timeout |
| `providers/ovms-grpc-client.ts` | gRPC client for OVMS native communication |
| ~~`providers/ovms-container.ts`~~ (deleted) | Docker container management for OVMS |
| `providers/ovms-utils.ts` | OVMS helper utilities (normalize, model map, warmup) |
| `global-cache/index.ts` | Aggregate all global cache entries |
| `global-cache/types.ts` | Global cache entry type definitions |
| `global-cache/data/javascript.ts` | JavaScript built-in type embeddings |
| `global-cache/data/python.ts` | Python built-in type embeddings |
| `global-cache/data/frameworks.ts` | React, Angular, NestJS pattern embeddings |
| `global-cache/data/go-rust.ts` | Go and Rust built-in type embeddings |
| `global-cache/data/java-kotlin.ts` | Java and Kotlin built-in type embeddings |
| `global-cache/data/index.ts` | Aggregate data module entries |
