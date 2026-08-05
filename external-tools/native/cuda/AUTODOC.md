# CUDA Module

## 🤖 Overview

The `external-tools/native/cuda` module provides CUDA-accelerated vector operations for embeddings, enabling significantly faster computations compared to CPU-based methods. It is primarily used by developers and data scientists who require high-performance GPU-accelerated similarity calculations for large-scale embedding vectors.

## 🤖 Architecture

```
       +-------------------+
       |   CUDA Context   |
       | (GPU memory)     |
       +-------------------+
           |
           v
       +-------------------+
       |   CUDA Kernel    |
       | (vector similarity)|
       +-------------------+
           |
           v
       +-------------------+
       |   Host Memory    |
       | (CPU memory)      |
       +-------------------+
           |
           v
       +-------------------+
       |   Host API       |
       | (CUDA API)        |
       +-------------------+
```

## 🤖 Flow

```
       +-------------------+
       |   Host API       |
       | (CUDA API)        |
       +-------------------+
           |
           v
       +-------------------+
       |   CUDA Kernel    |
       | (vector similarity)|
       +-------------------+
           |
           v
       +-------------------+
       |   CUDA Context   |
       | (GPU memory)     |
       +-------------------+
           |
           v
       +-------------------+
       |   Host Memory    |
       | (CPU memory)      |
       +-------------------+
```

## 🤖 Entity Listing

### Function
- **batchCosineSimilarity** — Computes batch cosine similarities on GPU `index.d.ts:60-60`
- **cosineSimilarity** — Computes cosine similarity between two vectors on GPU `index.d.ts:40-40`
- **euclideanDistance** — Computes Euclidean distance between two vectors on GPU `index.d.ts:75-75`
- **faissIndexAdd** — Function to add vectors to a FAISS index `index.d.ts:209-213`
- **faissIndexBatchSearch** — Function to perform batch searches in a FAISS index `index.d.ts:224-230`
- **faissIndexCreate** — Function to create a FAISS index `index.d.ts:194-199`
- **faissIndexLoad** — Loads a FAISS index from a specified path and returns metadata about the loaded index `index.d.ts:239-242`
- **faissIndexRemove** — Removes a vector from the FAISS index `index.d.ts:245-245`
- **faissIndexReset** — Resets the FAISS index `index.d.ts:248-248`
- **faissIndexSave** — Function to save a FAISS index `index.d.ts:233-236`
- **faissIndexSearch** — Function to search for vectors in a FAISS index `index.d.ts:216-221`
- **faissIndexStats** — Provides statistics about the FAISS index `index.d.ts:251-263`
- **faissIndexTrain** — Function to train a FAISS index `index.d.ts:202-206`
- **getDeviceInfo** — Retrieves device information for CUDA devices `index.d.ts:109-109`
- **gpuIvfAdd** — Adds vectors to the GPU IVF index `index.d.ts:139-143`
- **gpuIvfBatchSearch** — Function to perform batch search on GPU `index.d.ts:153-158`
- **gpuIvfCreate** — Creates a GPU IVF index `index.d.ts:123-129`
- **gpuIvfLoad** — Function to load GPU IVF index `index.d.ts:167-170`
- **gpuIvfRemove** — Function to remove GPU IVF index `index.d.ts:173-173`
- **gpuIvfSave** — Function to save GPU IVF index `index.d.ts:161-164`
- **gpuIvfSearch** — Searches for vectors in the GPU IVF index `index.d.ts:146-150`
- **gpuIvfStats** — Function to get statistics of GPU IVF index `index.d.ts:176-185`
- **gpuIvfTrain** — Trains a GPU IVF index `index.d.ts:132-136`
- **normalizeVectors** — Normalizes vectors to unit length on GPU `index.d.ts:90-90`

### Interface
- **CUDADeviceInfo** — Represents information about CUDA devices available on the system `index.d.ts:10-21`

### Module
- **ultracode-cuda-addon** — CUDA-accelerated vector operations for UltraCode `package.json:1-1`

### Import_decl
- **cmake-js** — Imports `cmake-js`. `package.json:0-0`
- **node-addon-api** — Imports `node-addon-api`. `package.json:0-0`

### Property
- **addedCount** — Count of vectors added to the IVF index `index.d.ts:143-143`
- **addedCount** — Count of vectors added to the index `index.d.ts:213-213`
- **computeCapability** — CUDA compute capability of the GPU device (e.g., "7.5") `index.d.ts:16-16`
- **deviceCount** — Number of CUDA devices available `index.d.ts:12-12`
- **deviceName** — Name of the GPU device (e.g., "NVIDIA GeForce GTX 1650 Ti") `index.d.ts:14-14`
- **dims** — Dimensions of the vectors `index.d.ts:129-129`
- **dims** — Dimension of vectors in the index `index.d.ts:181-181`
- **dims** — Dimensionality of the vectors `index.d.ts:199-199`
- **dims** — Represents the dimensions of the vectors `index.d.ts:242-242`
- **dims** — Represents the dimensions `index.d.ts:256-256`
- **distances** — Array of distances between vectors `index.d.ts:150-150`
- **distances** — Distances from the search results `index.d.ts:158-158`
- **distances** — Returns an array of labels and distances `index.d.ts:221-221`
- **distances** — Returns an array of labels, distances, number of queries, and k `index.d.ts:230-230`
- **factory** — Factory for creating CUDA operations `index.d.ts:199-199`
- **factory** — Represents the factory for creating indices `index.d.ts:258-258`
- **gpuMemoryMB** — Total GPU memory in MB `index.d.ts:183-183`
- **indexType** — Type of index used for vector operations `index.d.ts:199-199`
- **indexType** — Specifies the type of index used `index.d.ts:242-242`
- **indexType** — Represents the index type `index.d.ts:257-257`
- **isTrained** — Boolean indicating if the index is trained `index.d.ts:184-184`
- **isTrained** — Boolean indicating if the model is trained `index.d.ts:199-199`
- **isTrained** — Indicates whether the model is trained `index.d.ts:206-206`
- **isTrained** — Returns a boolean indicating success, the path, the number of loaded vectors, whether the index is trained, the dimensions, and the index type `index.d.ts:242-242`
- **isTrained** — Represents whether the index is trained. `index.d.ts:260-2 `index.d.ts:260-260`
- **k** — Number of nearest neighbors to find `index.d.ts:158-158`
- **k** — Number of nearest neighbors to return `index.d.ts:230-230`
- **labels** — Array of labels for vectors `index.d.ts:150-150`
- **labels** — Labels associated with the search results `index.d.ts:158-158`
- **labels** — Returns an array of labels and distances `index.d.ts:221-221`
- **labels** — Returns an array of labels, distances, number of queries, and k `index.d.ts:230-230`
- **loadedVectors** — Array of vectors loaded from GPU IVF index `index.d.ts:170-170`
- **loadedVectors** — Stores the loaded vectors `index.d.ts:242-242`
- **memoryMB** — Represents the memory usage in MB `index.d.ts:259-259`
- **multiProcessorCount** — Number of streaming multiprocessors in the GPU `index.d.ts:20-20`
- **nlist** — Number of lists in the IVF index `index.d.ts:129-129`
- **nlist** — Number of lists in the index `index.d.ts:182-182`
- **nlist** — Represents the number of lists in the index `index.d.ts:261-261`
- **nprobe** — Represents the number of probes used in the index `index.d.ts:262-262`
- **nQueries** — Number of queries in batch search `index.d.ts:158-158`
- **nQueries** — Number of queries in the batch search `index.d.ts:230-230`
- **ntotal** — Total number of vectors in the index `index.d.ts:180-180`
- **ntotal** — Represents the total number of vectors `index.d.ts:255-255`
- **path** — Path to save the GPU IVF index `index.d.ts:164-164`
- **path** — Path to save the FAISS index `index.d.ts:170-170`
- **path** — Represents the file path `index.d.ts:236-236`
- **path** — Returns a boolean indicating success, the path, the number of loaded vectors, whether the index is trained, the dimensions, and the index type `index.d.ts:242-242`
- **projectKey** — Key for the project `index.d.ts:129-129`
- **projectKey** — Key identifier for the project `index.d.ts:179-179`
- **projectKey** — Represents the project key `index.d.ts:199-199`, `index.d.ts:254-254`
- **sqBits** — Square bits for the IVF index `index.d.ts:129-129`
- **success** — Indicates the success of an operation `index.d.ts:129-129`
- **success** — Boolean indicating success of operation `index.d.ts:136-136`
- **success** — Boolean indicating the success of an operation `index.d.ts:143-143`
- **success** — Returns a boolean indicating success and a path string `index.d.ts:164-164`, `index.d.ts:236-236`
- **success** — Returns a boolean indicating success, a path string, and the number of loaded vectors `index.d.ts:170-170`
- **success** — Returns a boolean indicating success `index.d.ts:173-173`, `index.d.ts:245-245`, `index.d.ts:248-248`
- **success** — Returns a boolean indicating success, a project key, dimensions, factory, index type, and whether the index is trained `index.d.ts:199-199`
- **success** — Returns a boolean indicating success, the number of vectors trained on, and whether the index is trained `index.d.ts:206-206`
- **success** — Returns a boolean indicating success, the number of vectors added, and the total number of vectors `index.d.ts:213-213`
- **success** — Returns a boolean indicating success, a path string, the number of loaded vectors, whether the index is trained, dimensions, and index type `index.d.ts:242-242`
- **totalMemoryMB** — Total GPU memory in MB `index.d.ts:18-18`
- **totalVectors** — Total number of vectors in the IVF index `index.d.ts:143-143`
- **totalVectors** — Total number of vectors in the index `index.d.ts:213-213`
- **trainedOn** — Indicates the data used to train the IVF index `index.d.ts:136-136`
- **trainedOn** — Information about the training data `index.d.ts:206-206`

## Entities

### Modules

**ultracode-cuda-addon** — `package.json:1-1`

Native CUDA addon package providing GPU-accelerated vector similarity operations for Node.js.

### Interfaces

**CUDADeviceInfo** — ~~`external-tools/native/cuda/src/index.d.ts:10-16`~~ (deleted)

Exposes NVIDIA GPU device metadata and capabilities: device count, model identifier, compute architecture version, total memory, and multiprocessor count for runtime capability negotiation.

### Functions

**cosineSimilarity** — ~~`external-tools/native/cuda/src/index.d.ts:18-27`~~ (deleted)

Computes cosine similarity between two equal-length vectors on the GPU, returning a normalized score in [0, 1] range; typical latency 0.1–0.2ms for 8192-dimensional vectors.

**batchCosineSimilarity** — ~~`external-tools/native/cuda/src/index.d.ts:29-40`~~ (deleted)

Computes cosine similarities for multiple vector pairs in parallel on the GPU, scaling throughput with batch size while maintaining constant per-operation latency.

## Dependencies

### External

- **NVIDIA CUDA Driver** — runtime GPU device management and kernel execution
- **CUDA Compute Toolkit** — build-time compilation of `.cu` kernels to PTX/binary

### Internal

- None; module is self-contained as a native extension with TypeScript type declarations
