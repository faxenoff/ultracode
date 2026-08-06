# external-tools/native/cuda/src

## 🤖 Overview

This module provides CUDA-based operations for efficient vector similarity search, primarily used by developers working with machine learning models that require GPU acceleration. It includes bindings for C++ and CUDA, enabling seamless integration with existing applications.

## 🤖 Architecture

```
+---------------------+
|     binding.cpp     |
|     (C++ bindings)  |
+---------------------+
        |
        v
+---------------------+
|    binding.h        |
|     (header file)   |
+---------------------+
        |
        v
+---------------------+
|   cpu_ivf_ops.cpp   |
|     (CPU operations) |
+---------------------+
        |
        v
+---------------------+
|   gpu_ivf_ops.cpp   |
|     (GPU operations) |
+---------------------+
```

## 🤖 Flow

```
+---------------------+
|     binding.cpp     |
|     (C++ bindings)  |
+---------------------+
        |
        v
+---------------------+
|    binding.h        |
|     (header file)   |
+---------------------+
        |
        v
+---------------------+
|   cpu_ivf_ops.cpp   |
|     (CPU operations) |
+---------------------+
        |
        v
+---------------------+
|   gpu_ivf:
```

## 🤖 Entity Listing

### Function
- **BatchCosineSimilarity** — Computes batch cosine similarities (multiple pairs at once) `binding.cpp:73-140`
- **CosineSimilarity** — Computes cosine similarity between two embedding vectors using CUDA `binding.cpp:39-66`
- **ensureGpuResources** — Ensures that GPU resources are initialized and available `gpu_ivf_ops.cpp:56-62`
- **EuclideanDistance** — Computes the Euclidean distance between two vectors using CUDA `binding.cpp:147-171`
- **FAISS_TRY** — A macro for error handling around FAISS operations, wrapping them in try/catch blocks `cpu_ivf_ops.cpp:56-63`
- **FaissIndexAdd** — Not present in the provided code snippet `cpu_ivf_ops.cpp:192-220`
- **FaissIndexBatchSearch** — Not present in the provided code snippet `cpu_ivf_ops.cpp:283-339`
- **FaissIndexCreate** — Not present in the provided code snippet `cpu_ivf_ops.cpp:98-152`
- **FaissIndexLoad** — Not present in the provided code snippet `cpu_ivf_ops.cpp:371-418`
- **FaissIndexRemove** — Not present in the provided code snippet `cpu_ivf_ops.cpp:424-434`
- **FaissIndexReset** — Not present in the provided code snippet `cpu_ivf_ops.cpp:441-459`
- **FaissIndexSave** — Not present in the provided code snippet `cpu_ivf_ops.cpp:345-365`
- **FaissIndexSearch** — Not present in the provided code snippet `cpu_ivf_ops.cpp:227-277`
- **FaissIndexStats** — Not present in the provided code snippet `cpu_ivf_ops.cpp:465-515`
- **FaissIndexTrain** — Not present in the provided code snippet `cpu_ivf_ops.cpp:158-186`
- **getActiveIndex** — Retrieves the active index (either scalar quantizer or flat index) for a given entry `gpu_ivf_ops.cpp:64-68`
- **GetDeviceInfo** — Retrieves information about the CUDA device `binding.cpp:230-251`
- **GpuIvfAdd** — Adds vectors to the GPU index `gpu_ivf_ops.cpp:164-191`
- **GpuIvfBatchSearch** — Searches for vectors in the GPU index in batches `gpu_ivf_ops.cpp:248-290`
- **GpuIvfCreate** — Creates a GpuIndexIVFScalarQuantizer in the specified project key `gpu_ivf_ops.cpp:78-128`
- **GpuIvfLoad** — Loads the GPU index from disk `gpu_ivf_ops.cpp:328-377`
- **GpuIvfRemove** — Removes the GPU index for a given project key `gpu_ivf_ops.cpp:383-393`
- **GpuIvfSave** — Saves the GPU index to disk `gpu_ivf_ops.cpp:296-322`
- **GpuIvfSearch** — Searches for vectors in the GPU index `gpu_ivf_ops.cpp:197-242`
- **GpuIvfStats** — Provides statistics about the GPU index `gpu_ivf_ops.cpp:399-433`
- **GpuIvfTrain** — Trains the GPU index `gpu_ivf_ops.cpp:133-159`
- **Init** — Initializes the NAPI module with various functions for vector operations and device information `binding.cpp:292-331`
- **JSArrayToFloatVector** — Converts a JavaScript array to a C++ float vector `binding.cpp:12-26`
- **NormalizeVectors** — Normalizes a set of vectors using CUDA `binding.cpp:178-223`
- **readFloatArg** — A function to read float data from a JavaScript value, either as a Float32Array or an array `cpu_ivf_ops.cpp:73-89`

### Class
- **CUDAVectorOps** — Represents a class for CUDA vector operations `binding.h:10-29`

### Struct_decl
- **FaissIndexEntry** — A struct containing a FAISS index, its dimensions, factory string, index type, training status, and total number of vectors `cpu_ivf_ops.cpp:41-48`
- **FloatData** — A struct to hold float data from JavaScript, either as a pointer or a buffer `cpu_ivf_ops.cpp:68-71`
- **GpuIndexEntry** — A struct containing GPU index entries for scalar quantizer and flat index `gpu_ivf_ops.cpp:40-48`

### Variable
- **g_faiss_mutex** — A global mutex for synchronizing access to FAISS operations `cpu_ivf_ops.cpp:39-39`
- **g_indexes** — A global map storing Faiss index entries for multiple repositories `cpu_ivf_ops.cpp:50-50`
- **gpu_indexes** — A map storing GPU indexes for different project keys `gpu_ivf_ops.cpp:50-50`
- **gpu_mutex** — A mutex for thread-safe access to GPU resources `gpu_ivf_ops.cpp:37-37`
- **gpu_res** — A unique pointer to GPU resources, one per process, thread-safe `gpu_ivf_ops.cpp:36-36`

### Constant
- **CUDA_BINDING_H** — CUDA Vector Operations - N-API Binding Header `binding.h:6-7`

### Import_decl
- **cuda_runtime.h** — Imports `cuda_runtime.h`. `binding.cpp:2-3`
- **embedding_kernels.cuh** — Imports `embedding_kernels.cuh`. `binding.cpp:4-5`
- **faiss/gpu/GpuAutoTune.h** — Imports `faiss/gpu/GpuAutoTune.h`. `gpu_ivf_ops.cpp:26-27`
- **faiss/gpu/GpuCloner.h** — Imports `faiss/gpu/GpuCloner.h`. `gpu_ivf_ops.cpp:25-26`
- **faiss/gpu/GpuClonerOptions.h** — Imports `faiss/gpu/GpuClonerOptions.h`. `gpu_ivf_ops.cpp:24-25`
- **faiss/gpu/GpuIndexFlat.h** — Imports `faiss/gpu/GpuIndexFlat.h`. `gpu_ivf_ops.cpp:22-23`
- **faiss/gpu/GpuIndexIVFFlat.h** — Imports `faiss/gpu/GpuIndexIVFFlat.h`. `gpu_ivf_ops.cpp:21-22`
- **faiss/gpu/GpuIndexIVFScalarQuantizer.h** — Imports `faiss/gpu/GpuIndexIVFScalarQuantizer.h`. `gpu_ivf_ops.cpp:20-21`
- **faiss/gpu/StandardGpuResources.h** — Imports `faiss/gpu/StandardGpuResources.h`. `gpu_ivf_ops.cpp:23-24`
- **faiss/impl/FaissException.h** — Imports `faiss/impl/FaissException.h`. `cpu_ivf_ops.cpp:33-34`
- **faiss/Index.h** — Imports `faiss/Index.h`. `cpu_ivf_ops.cpp:23-24`
- **faiss/index_factory.h** — Imports `faiss/index_factory.h`. `cpu_ivf_ops.cpp:30-31`
- **faiss/index_io.h** — Imports `faiss/index_io.h`. `cpu_ivf_ops.cpp:31-32`, `gpu_ivf_ops.cpp:27-28`
- **faiss/IndexFlat.h** — Imports `faiss/IndexFlat.h`. `cpu_ivf_ops.cpp:24-25`
- **faiss/IndexHNSW.h** — Imports `faiss/IndexHNSW.h`. `cpu_ivf_ops.cpp:25-26`
- **faiss/IndexIVF.h** — Imports `faiss/IndexIVF.h`. `cpu_ivf_ops.cpp:26-27`
- **faiss/IndexIVFFlat.h** — Imports `faiss/IndexIVFFlat.h`. `cpu_ivf_ops.cpp:28-29`
- **faiss/IndexIVFPQ.h** — Imports `faiss/IndexIVFPQ.h`. `cpu_ivf_ops.cpp:29-30`
- **faiss/IndexScalarQuantizer.h** — Imports `faiss/IndexScalarQuantizer.h`. `cpu_ivf_ops.cpp:27-28`, `gpu_ivf_ops.cpp:28-29`
- **faiss/MetricType.h** — Imports `faiss/MetricType.h`. `cpu_ivf_ops.cpp:32-33`, `gpu_ivf_ops.cpp:29-30`
- **memory** — Imports `memory`. `cpu_ivf_ops.cpp:19-20`, `gpu_ivf_ops.cpp:16-17`
- **mutex** — Imports `mutex`. `cpu_ivf_ops.cpp:20-21`, `gpu_ivf_ops.cpp:17-18`
- **napi.h** — Imports `napi.h`. `addon.cpp:4-5`, `binding.cpp:1-2`, `binding.h:8-9`, `cpu_ivf_ops.cpp:16-17`, `gpu_ivf_ops.cpp:13-14`
- **string** — Imports `string`. `binding.cpp:6-7`, `cpu_ivf_ops.cpp:17-18`, `gpu_ivf_ops.cpp:14-15`
- **unordered_map** — Imports `unordered_map`. `cpu_ivf_ops.cpp:18-19`, `gpu_ivf_ops.cpp:15-16`
- **vector** — Imports `vector`. `binding.cpp:5-6`, `cpu_ivf_ops.cpp:21-22`, `gpu_ivf_ops.cpp:18-19`
- **vector_ops.cuh** — Imports `vector_ops.cuh`. `binding.cpp:3-4`

### Property
- **BatchCosineSimilarity** — Computes the cosine similarity between multiple vectors `binding.h:20-20`
- **buf** — A buffer for float data within the FloatData struct `cpu_ivf_ops.cpp:70-70`
- **constructor** — Constructor for the CUDAVectorOps class `binding.h:16-16`
- **CosineSimilarity** — Computes the cosine similarity between two vectors `binding.h:19-19`
- **deviceId_** — Stores the device ID `binding.h:27-27`
- **dims** — The number of dimensions of the vectors in the FAISS index `cpu_ivf_ops.cpp:43-43`
- **dims** — The dimension of the vectors `gpu_ivf_ops.cpp:43-43`
- **EuclideanDistance** — Computes the Euclidean distance between two vectors `binding.h:21-21`
- **factory_string** — A string representing the factory used to create the FAISS index `cpu_ivf_ops.cpp:44-44`
- **flat_index** — A unique pointer to a GpuIndexIVFFlat `gpu_ivf_ops.cpp:42-42`
- **GetDeviceInfo** — Retrieves device information `binding.h:24-24`
- **index** — A unique pointer to a FAISS index `cpu_ivf_ops.cpp:42-42`
- **index_type** — A string indicating the type of FAISS index, such as "flat", "hnsw", "ivf", etc `cpu_ivf_ops.cpp:45-45`
- **Init** — Initializes the CUDAVectorOps class `binding.h:12-12`
- **initialized_** — Indicates whether the CUDAVectorOps instance is initialized `binding.h:28-28`
- **is_trained** — A boolean indicating whether the FAISS index is trained `cpu_ivf_ops.cpp:46-46`
- **is_trained** — A boolean indicating whether the index is trained `gpu_ivf_ops.cpp:46-46`
- **nlist** — The number of lists in the index `gpu_ivf_ops.cpp:44-44`
- **ntotal** — The total number of vectors in the FAISS index `cpu_ivf_ops.cpp:47-47`
- **ntotal** — Represents the total number of vectors in the index `gpu_ivf_ops.cpp:47-47`
- **ptr** — A pointer to float data within the FloatData struct `cpu_ivf_ops.cpp:69-69`
- **sq_bits** — The number of bits for scalar quantization `gpu_ivf_ops.cpp:45-45`
- **sq_index** — A unique pointer to a GpuIndexIVFScalarQuantizer `gpu_ivf_ops.cpp:41-41`

## Dependencies

**External Libraries:**
- FAISS — Facebook AI Similarity Search library for vector indexing and search
- CUDA Runtime — NVIDIA GPU compute platform and API
- Node-API (NAPI) — Node.js native addon interface for JavaScript/C++ interop

**Internal:**
- Shared GPU resource management across CPU and GPU implementations
- FAISS index lifecycle management (train → add → search → persist)
