# benchmarks

## 🤖 Overview

This module contains benchmarking scripts for evaluating the performance of different configurations and tools. It includes tests for large projects, SIMD operations, and worker pools. The primary users are developers and performance analysts who need to assess the efficiency of their codebases and tools.

## 🤖 Architecture

```
  +---------------------+
  | benchmark-large-project.js |
  |     /         \        |
  |    /          \       |
  |   /           \      |
  |  /            \     |
  | /             \    |
  | /              \   |
  | /               \  |
  | /                \ |
  | /                 \|
  | /                  \|
  | /                   \|
  | /                    \|
  | /                     \|
  | /                      \|
  | /                       \|
  | /                        \|
  | /                         \|
  | /                          \|
  | /                           \|
  | /                            \|
  | /                             \|
  | /                              \|
  | /                               \|
  | /                                \|
  | /                                 \|
  | /                                  \|
  | /                                   \|
  | /                                    \|
  | /                                     \|
  | /                                      \|
  | /                                       \|
  | /                                        \|
  | /                                         \|
  | /                                          \|
  | /                                           \|
  | /                                            \|
  | /                                             \|
  | /                                              \|
  | /                                               \|
  | /                                                \|
  | /                                                 \|
  | /                                                  \|
  | /                                                   \|
  | /                                                    \|
  | /                                                     \|
  | /                                                      \|
  | /                                                       \|
  | /                                                        \|
  | /                                                         \|
  | /                                                          \|
  | /                                                           \|
  | /                                                            \|
  | /                                                             \|
  | /                                                              \|
  | /                                                               \|
  | /                                                                \|
  | /                                                                 \|
  | /                                                                  \|
  | /                                                                   \|
  | /                                                                    \|
  | /                                                                     \|
  | /                                                                      \|
  | /                                                                       \|
  | /                                                                        \|
  | /                                                                         \|
  | /                                                                          \|
  | /                                                                           \|
  | /                                                                            \|
  | /                                                                             \|
  | /                                                                              \|
  | /                                                                               \|
  | /                                                                                \|
  | /                                                                                 \|
  | /                                                                                  \|
  | /                                                                                   \|
  | /                                                                                    \|
  | /                                                                                     \|
  | /                                                                                      \|
  | /                                                                                       \|
  | /                                                                                        \|
  | /                                                                                         \|
  | /                                                                                          \|
  | /                                                                                           \|
  | /                                                                                            \|
  | /                                                                                             \|
  | /                                                                                              \|
```

## 🤖 Flow

```
  +---------------------+
  | benchmark-large-project.js |
  |     /         \        |
  |    /          \       |
  |   /           \      |
  |  /            \     |
  | /             \    |
  | /              \   |
  | /               \  |
  | /                \ |
  | /                 \|
  | /                  \|
  | /                   \|
  | /                    \|
  | /                     \|
  | /                      \|
  | /                       \|
  | /                        \|
  | /                         \|
  | /                          \|
  | /                           \|
  | /                            \|
  | /                             \|
  | /                              \|
  | /                               \|
  | /                                \|
  | /                                 \|
  | /                                  \|
  | /                                   \|
  | /                                    \|
  | /                                     \|
  | /                                      \|
  | /                                       \|
  | /                                        \|
  | /                                         \|
  | /                                          \|
  | /                                           \|
  | /                                            \|
  | /                                             \|
  | /                                              \|
  | /                                               \|
  | /                                                \|
  | /                                                 \|
  | /                                                  \|
  | /                                                   \|
  | /                                                    \|
  | /                                                     \|
  | /                                                      \|
  | /                                                       \|
  | /                                                        \|
  | /                                                         \|
  | /                                                          \|
  | /                                                           \|
  | /                                                            \|
  | /                                                             \|
  | /                                                              \|
  | /                                                               \|
  | /                                                                \|
  | /                                                                 \|
  | /                                                                  \|
  | /                                                                   \|
  | /                                                                    \|
  | /                                                                     \|
  | /                                                                      \|
  | /                                                                       \|
  | /                                                                        \|
  | /                                                                         \|
  | /                                                                          \|
  | /                                                                           \|
  | /                                                                            \|
  | /                                                                             \|
  | /                                                                              \|
  | /                                                                               \|
  | /                                                                                \|
  | /                                                                                 \|
  | /                                                                                  \|
  | /                                                                                   \|
  | /                                                                                    \|
  | /                                                                                     \|
  | /                                                                                      \|
  | /                                                                                       \|
  | /                                                                                        \|
  | /                                                                                         \|
  | /                                                                                          \|
  | /                                                                                           \|
  | /                                                                                            \|
  | /                                                                                             \|
  | /                                                                                              \|
  | /                                                                                               \|
  | /                                                                                                \|
  | /                                                                                                 \|
  | /                                                                                                  \|
  | /                                                                                                   \|
  | /                                                                                                    \|
  | /                                                                                                     \|
  | /                                                                                                      \|
  | /                                                                                                       \|
  | /                                                                                                        \|
  | /                                                                                                         \|
  | /                                                                                                          \|
  | /                                                                                                           \|
  | /                                                                                                            \|
  | /                                                                                                             \|
  | /                                                                                                              \|
  | /                                                                                                               \|
  | /                                                                                                                \|
  | /                                                                                                                 \|
  | /                                                                                                                  \|
  | /                                                                                                                   \|
  | /                                                                                                                    \|
  | /                                                                                                                     \|
  | /                                                                                                                      \|
  | /                                                                                                                       \|
  | /                                                                                                                        \|
  | /                                                                                                                         \|
  | /                                                                                                                          \|
  | /                                                                                                                           \|
  | /                                                                                                                            \|
  | /                                                                                                                             \|
  | /                                                                                                                              \|
  | /                                                                                                                               \|
  | /                                                                                                                                \|
  | /                                                                                                                                 \|
  | /                                                                                                                                  \|
  | /                                                                                                                                   \|
  | /                                                                                                                                    \|
  | /                                                                                                                                     \|
  | /                                                                                                                                      \|
  | /                                                                                                                                       \|
  | /                                                                                                                                        \|
  | /                                                                                                                                         \|
  | /                                                                                                                                          \|
  | /                                                                                                                                           \|
```

## 🤖 Entity Listing

### Function
- **avgEntitySize** — Calculates the average size of code entities `embedding-benchmark.ts:668-668`
- **avgTime** — Calculates the average time taken for a benchmark `benchmark-simd.js:124-124`
- **baseline** — Represents the baseline performance of the cosine similarity computation `benchmark-simd.js:144-144`
- **baseline** — Parses the baseline result from the benchmark results array `benchmark-simd.js:221-221`
- **batchPromises** — Manages promises for batch processing of code texts `embedding-benchmark.ts:553-566`
- **benchmarkCosineSimilarity** — Benchmarks the cosine similarity computation `benchmark-simd.js:110-134`
- **benchmarkOllama** — Benchmarks the Ollama provider `embedding-benchmark.ts:301-395`
- **benchmarkOpenVINO** — Benchmarks the OpenVINO provider `embedding-benchmark.ts:237-299`
- **benchmarkOVMS** — Represents the benchmarking process for the OVMS provider `embedding-benchmark.ts:485-583`
- **benchmarkTEI** — Represents the benchmarking process for the TEI provider `embedding-benchmark.ts:397-475`
- **bestLargeContext** — Determines the best model for large context `embedding-benchmark.ts:752-752`
- **bestOllama** — Finds the best model for Ollama `embedding-benchmark.ts:754-754`
- **bestOpenVINO** — Finds the best model for OpenVINO `embedding-benchmark.ts:753-753`
- **bestOVMS** — Finds the best model for OVMS `embedding-benchmark.ts:755-755`
- **bestTEI** — Finds the best model for TEI `embedding-benchmark.ts:756-756`
- **checkOllamaModels** — Validates the availability of Ollama models `embedding-benchmark.ts:589-597`
- **checkOVMS** — Validates the availability of OVMS models `embedding-benchmark.ts:618-656`
- **checkTEI** — Validates the availability of TEI models `embedding-benchmark.ts:599-611`
- **cosineSimilarityJS** — Computes the cosine similarity between two vectors using pure JavaScript `benchmark-simd.js:51-66`
- **cosineSimilarityJSOptimized** — Computes the cosine similarity between two vectors using optimized JavaScript `benchmark-simd.js:68-104`
- **errored** — Indicates the status of the benchmark as errored `embedding-benchmark.ts:665-665`
- **extractEntitiesFromFile** — Extracts code entities from a file `embedding-benchmark.ts:64-130`
- **findBlockEnd** — Finds the end of a code block `embedding-benchmark.ts:132-152`
- **firstError** — Stores the first error encountered during benchmarking `embedding-benchmark.ts:373-373`
- **generateRandomVector** — Generates a random vector of specified dimension `benchmark-simd.js:30-36`
- **generateReport** — Generates a report based on the benchmark results `embedding-benchmark.ts:662-795`
- **generateTestData** — Generates a set of random vectors for benchmarking `benchmark-simd.js:38-45`
- **largestEntity** — Identifies the largest code entity `embedding-benchmark.ts:669-669`
- **largestEntity** — Identifies the entity with the highest line count from a list of entities `embedding-benchmark.ts:818-818`
- **loadProjectEntities** — Loads entities from the project `embedding-benchmark.ts:154-185`
- **main** — Runs benchmarks for single-threaded and multi-worker indexing, calculates speedup, and logs performance comparison `benchmark-large-project.js:129-174`
- **main** — Main function to execute the benchmark `benchmark-simd.js:165-239`
- **main** — Parses and runs benchmark tests for single-threaded and multi-worker indexing, logging performance metrics `benchmark-workers.js:129-178`
- **main** — Main function to run the benchmark `embedding-benchmark.ts:801-1121`
- **modelFilter** — Filters models based on model `embedding-benchmark.ts:810-810`
- **ollamaModelsList** — List of models for Ollama `embedding-benchmark.ts:896-896`
- **openvinoModels** — List of models for OpenVINO `embedding-benchmark.ts:856-856`
- **optimized** — Represents the optimized performance of the cosine similarity computation `benchmark-simd.js:222-222`
- **ovmsModelsList** — List of models for OVMS `embedding-benchmark.ts:1013-1013`
- **prepareChunksForProvider** — Prepares code chunks for a provider `embedding-benchmark.ts:198-231`
- **printResults** — Prints the benchmark results `benchmark-simd.js:136-159`
- **provider** — Represents a provider for benchmarking `embedding-benchmark.ts:269-269`
- **provider** — Represents the logging provider `embedding-benchmark.ts:269-269`
- **provider** — Represents a logging interface with methods for logging messages at different severity levels `embedding-benchmark.ts:269-269`
- **provider** — Represents the name of the embedding provider `embedding-benchmark.ts:269-269`
- **providerFilter** — Filters models based on provider `embedding-benchmark.ts:809-809`
- **responses** — Responses from the benchmarking process `embedding-benchmark.ts:363-368`
- **responses** — Processes the response from an API call and extracts JSON data `embedding-benchmark.ts:368-368`
- **roundRobinEndpoints** — Round-robin endpoints for models `embedding-benchmark.ts:1022-1022`
- **runIndexing** — Runs indexing with specific worker configuration and logs performance metrics `benchmark-large-project.js:23-124`, `benchmark-workers.js:23-124`
- **skipped** — Indicates the status of the benchmark as skipped `embedding-benchmark.ts:664-664`
- **successful** — Indicates the status of the benchmark as successful `embedding-benchmark.ts:663-663`
- **successful** — Indicates if the benchmark was successful `embedding-benchmark.ts:663-663`
- **successful** — Filters and sorts successful results by throughput `embedding-benchmark.ts:1084-1084`
- **successful** — Filters and sorts results based on their status and throughput chunks per second `embedding-benchmark.ts:1084-1084`
- **texts** — Extracts the content from each chunk to form an array of texts `embedding-benchmark.ts:280-280`
- **totalTokens** — Total number of tokens in texts `embedding-benchmark.ts:288-288`
- **totalTokens** — Tracks the total number of tokens processed in the benchmark `embedding-benchmark.ts:384-384`
- **totalTokens** — Calculates the total number of tokens across all chunks `embedding-benchmark.ts:464-464`, `embedding-benchmark.ts:572-572`
- **truncateToCharLimit** — Truncates code texts to a specified character limit `embedding-benchmark.ts:477-483`
- **walk** — Walks through the file system `embedding-benchmark.ts:158-181`

### Interface
- **BenchmarkResult** — Represents the result of an embedding model benchmark with various metrics and status `embedding-benchmark.ts:28-48`
- **CodeEntity** — Represents a code entity extracted from a file `embedding-benchmark.ts:50-58`
- **OVMSModelConfig** — Configuration for OVMS models `embedding-benchmark.ts:979-986`
- **OVMSStatus** — Represents the status of the OVMS benchmarking `embedding-benchmark.ts:613-616`
- **PreparedChunk** — Represents a prepared chunk of code `embedding-benchmark.ts:191-196`

### Import_decl
- **../src/semantic/smart-chunker.js** — Imports `../src/semantic/smart-chunker.js` from `../src/semantic/smart-chunker.js`. `embedding-benchmark.ts:16-16`
- **node:child_process** — Imports `node:child_process` from `node:child_process`. `benchmark-large-project.js:9-9`, `benchmark-workers.js:8-8`
- **node:fs** — Imports `node:fs` from `node:fs`. `embedding-benchmark.ts:14-14`
- **node:os** — Imports `node:os` from `node:os`. `benchmark-workers.js:11-11`
- **node:path** — Imports `node:path` from `node:path`. `benchmark-large-project.js:10-10`, `benchmark-workers.js:9-9`, `embedding-benchmark.ts:15-15`
- **node:perf_hooks** — Imports `node:perf_hooks` from `node:perf_hooks`. `benchmark-simd.js:16-16`
- **node:url** — Imports `node:url` from `node:url`. `benchmark-large-project.js:11-11`, `benchmark-workers.js:10-10`

### Property
- **batchIndex** — Manages the index for batch processing of code texts `embedding-benchmark.ts:539-539`
- **code** — Represents the code content of a file `embedding-benchmark.ts:55-55`
- **content** — Content of a code entity `embedding-benchmark.ts:193-193`
- **contextTokens** — The number of context tokens used in the benchmark `embedding-benchmark.ts:33-33`
- **device** — The device on which the model is running `embedding-benchmark.ts:32-32`
- **dimensions** — The number of dimensions in the embedding space `embedding-benchmark.ts:34-34`
- **displayName** — Display name for a model `embedding-benchmark.ts:981-981`
- **endpoint** — Specifies the endpoint URL for the benchmarking provider `embedding-benchmark.ts:539-539`
- **endpoint** — Stores the API endpoint URL `embedding-benchmark.ts:614-614`
- **endpointPrefix** — Prefix for model endpoints `embedding-benchmark.ts:985-985`
- **entityId** — Unique identifier for an entity `embedding-benchmark.ts:194-194`
- **error** — Error message if the benchmark failed `embedding-benchmark.ts:47-47`
- **filePath** — File path of the code entity `embedding-benchmark.ts:54-54`
- **id** — Unique identifier for a code entity `embedding-benchmark.ts:51-51`, `embedding-benchmark.ts:192-192`
- **id** — Unique identifier for a model `embedding-benchmark.ts:980-980`
- **id** — Unique identifier for the benchmark result `embedding-benchmark.ts:29-29`
- **initTimeMs** — Time taken to initialize the model in milliseconds `embedding-benchmark.ts:39-39`
- **lineCount** — Counts the number of lines in the code `embedding-benchmark.ts:56-56`
- **maxChars** — Maximum characters for a model `embedding-benchmark.ts:983-983`
- **maxTokens** — Maximum tokens for a model `embedding-benchmark.ts:982-982`
- **model** — The specific model used for the benchmark `embedding-benchmark.ts:31-31`
- **models** — Contains the list of models used in the benchmarking `embedding-benchmark.ts:615-615`
- **multilingual** — Indicates if the model is multilingual `embedding-benchmark.ts:984-984`
- **multilingual** — Indicates whether the model supports multilingual text `embedding-benchmark.ts:35-35`
- **name** — Name of the code entity `embedding-benchmark.ts:52-52`
- **peakMemoryMB** — Peak memory usage in megabytes `embedding-benchmark.ts:44-44`
- **perChunkMs** — Time taken per code chunk in milliseconds `embedding-benchmark.ts:40-40`
- **provider** — Represents the name of the embedding provider used `embedding-benchmark.ts:30-30`
- **status** — Status of the benchmark result `embedding-benchmark.ts:46-46`
- **texts** — Contains the code texts used for benchmarking `embedding-benchmark.ts:539-539`
- **throughputChunksPerSec** — Chunks processed per second `embedding-benchmark.ts:42-42`
- **tokenCount** — Counts the number of tokens in a code entity `embedding-benchmark.ts:195-195`
- **tokenEstimate** — Estimates the number of tokens in the code `embedding-benchmark.ts:57-57`
- **tokensPerSec** — Tokens processed per second `embedding-benchmark.ts:41-41`
- **totalChunks** — Total number of code chunks processed in the benchmark `embedding-benchmark.ts:37-37`
- **totalTimeMs** — Total time taken for the benchmark in milliseconds `embedding-benchmark.ts:38-38`
- **type** — Type of the code entity (class, function, interface, type) `embedding-benchmark.ts:53-53`

## Dependencies

- **Node.js child_process module** — Spawns isolated indexer processes with environment-variable configuration for testing different code paths.
- **Timing utilities** — Uses `Date.now()` or equivalent for measuring wall-clock execution duration and throughput calculations.
- **Project distribution artifacts** — References compiled `dist/index.js` for running benchmark tests against production build output.
- **Environment configuration flags** — Respects `PARSER_USE_WORKERS` and similar env vars to toggle optimization features during testing.
- **File system access** — Reads project directories and test fixtures to establish realistic indexing workloads.
