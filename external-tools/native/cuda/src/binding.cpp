#include <napi.h>
#include <cuda_runtime.h>
#include "vector_ops.cuh"
#include "embedding_kernels.cuh"
#include <vector>
#include <string>

// =============================================================================
// Helper: Convert JS Array to C++ float vector
// =============================================================================

std::vector<float> JSArrayToFloatVector(const Napi::Array& jsArray) {
    std::vector<float> result;
    result.reserve(jsArray.Length());

    for (uint32_t i = 0; i < jsArray.Length(); i++) {
        Napi::Value val = jsArray[i];
        if (val.IsNumber()) {
            result.push_back(val.As<Napi::Number>().FloatValue());
        } else {
            throw Napi::TypeError::New(jsArray.Env(), "Array must contain only numbers");
        }
    }

    return result;
}

// =============================================================================
// N-API Wrapper Functions
// =============================================================================

/**
 * JS: cosineSimilarity(vec_a: number[], vec_b: number[]): number
 *
 * Computes cosine similarity between two embedding vectors using CUDA
 *
 * Performance: ~0.1-0.2ms for 8192-dim vectors (100-200x faster than CPU)
 */
Napi::Value CosineSimilarity(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    // Validate arguments
    if (info.Length() != 2) {
        throw Napi::TypeError::New(env, "Expected 2 arguments: vec_a, vec_b");
    }

    if (!info[0].IsArray() || !info[1].IsArray()) {
        throw Napi::TypeError::New(env, "Arguments must be arrays");
    }

    Napi::Array vec_a_js = info[0].As<Napi::Array>();
    Napi::Array vec_b_js = info[1].As<Napi::Array>();

    if (vec_a_js.Length() != vec_b_js.Length()) {
        throw Napi::TypeError::New(env, "Vectors must have the same dimension");
    }

    // Convert to C++ vectors
    std::vector<float> vec_a = JSArrayToFloatVector(vec_a_js);
    std::vector<float> vec_b = JSArrayToFloatVector(vec_b_js);

    // Call CUDA kernel
    float similarity = cuda_cosine_similarity(vec_a.data(), vec_b.data(), vec_a.size());

    return Napi::Number::New(env, similarity);
}

/**
 * JS: batchCosineSimilarity(vecs_a: number[][], vecs_b: number[][]): number[]
 *
 * Computes batch cosine similarities (multiple pairs at once)
 */
Napi::Value BatchCosineSimilarity(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if (info.Length() != 2) {
        throw Napi::TypeError::New(env, "Expected 2 arguments: vecs_a, vecs_b");
    }

    if (!info[0].IsArray() || !info[1].IsArray()) {
        throw Napi::TypeError::New(env, "Arguments must be arrays of vectors");
    }

    Napi::Array vecs_a_js = info[0].As<Napi::Array>();
    Napi::Array vecs_b_js = info[1].As<Napi::Array>();

    if (vecs_a_js.Length() != vecs_b_js.Length()) {
        throw Napi::TypeError::New(env, "Must have same number of vector pairs");
    }

    uint32_t num_pairs = vecs_a_js.Length();
    if (num_pairs == 0) {
        return Napi::Array::New(env, 0);
    }

    // Get dimension from first vector
    Napi::Array first_vec = vecs_a_js.Get(uint32_t(0)).As<Napi::Array>();
    uint32_t dim = first_vec.Length();

    // Flatten all vectors into contiguous arrays
    std::vector<float> vecs_a_flat;
    std::vector<float> vecs_b_flat;
    vecs_a_flat.reserve(num_pairs * dim);
    vecs_b_flat.reserve(num_pairs * dim);

    for (uint32_t i = 0; i < num_pairs; i++) {
        Napi::Array vec_a = vecs_a_js.Get(i).As<Napi::Array>();
        Napi::Array vec_b = vecs_b_js.Get(i).As<Napi::Array>();

        if (vec_a.Length() != dim || vec_b.Length() != dim) {
            throw Napi::TypeError::New(env, "All vectors must have same dimension");
        }

        std::vector<float> a = JSArrayToFloatVector(vec_a);
        std::vector<float> b = JSArrayToFloatVector(vec_b);

        vecs_a_flat.insert(vecs_a_flat.end(), a.begin(), a.end());
        vecs_b_flat.insert(vecs_b_flat.end(), b.begin(), b.end());
    }

    // Allocate result array
    std::vector<float> similarities(num_pairs);

    // Call CUDA batch kernel
    cuda_batch_cosine_similarity(
        vecs_a_flat.data(),
        vecs_b_flat.data(),
        similarities.data(),
        num_pairs,
        dim
    );

    // Convert result to JS array
    Napi::Array result = Napi::Array::New(env, num_pairs);
    for (uint32_t i = 0; i < num_pairs; i++) {
        result[i] = Napi::Number::New(env, similarities[i]);
    }

    return result;
}

/**
 * JS: euclideanDistance(vec_a: number[], vec_b: number[]): number
 *
 * Computes Euclidean distance (L2) on CUDA
 */
Napi::Value EuclideanDistance(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if (info.Length() != 2) {
        throw Napi::TypeError::New(env, "Expected 2 arguments: vec_a, vec_b");
    }

    if (!info[0].IsArray() || !info[1].IsArray()) {
        throw Napi::TypeError::New(env, "Arguments must be arrays");
    }

    Napi::Array vec_a_js = info[0].As<Napi::Array>();
    Napi::Array vec_b_js = info[1].As<Napi::Array>();

    if (vec_a_js.Length() != vec_b_js.Length()) {
        throw Napi::TypeError::New(env, "Vectors must have same dimension");
    }

    std::vector<float> vec_a = JSArrayToFloatVector(vec_a_js);
    std::vector<float> vec_b = JSArrayToFloatVector(vec_b_js);

    float distance = cuda_euclidean_distance(vec_a.data(), vec_b.data(), vec_a.size());

    return Napi::Number::New(env, distance);
}

/**
 * JS: normalizeVectors(vectors: number[][]): number[][]
 *
 * Normalize vectors to unit length (L2 norm = 1)
 */
Napi::Value NormalizeVectors(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if (info.Length() != 1) {
        throw Napi::TypeError::New(env, "Expected 1 argument: vectors");
    }

    if (!info[0].IsArray()) {
        throw Napi::TypeError::New(env, "Argument must be array of vectors");
    }

    Napi::Array vecs_js = info[0].As<Napi::Array>();
    uint32_t num_vectors = vecs_js.Length();

    if (num_vectors == 0) {
        return Napi::Array::New(env, 0);
    }

    Napi::Array first_vec = vecs_js.Get(uint32_t(0)).As<Napi::Array>();
    uint32_t dim = first_vec.Length();

    // Flatten vectors
    std::vector<float> vectors_flat;
    vectors_flat.reserve(num_vectors * dim);

    for (uint32_t i = 0; i < num_vectors; i++) {
        Napi::Array vec = vecs_js.Get(i).As<Napi::Array>();
        std::vector<float> v = JSArrayToFloatVector(vec);
        vectors_flat.insert(vectors_flat.end(), v.begin(), v.end());
    }

    // Normalize on GPU (modifies in-place)
    cuda_normalize_vectors(vectors_flat.data(), num_vectors, dim);

    // Convert back to JS arrays
    Napi::Array result = Napi::Array::New(env, num_vectors);
    for (uint32_t i = 0; i < num_vectors; i++) {
        Napi::Array vec = Napi::Array::New(env, dim);
        for (uint32_t j = 0; j < dim; j++) {
            vec[j] = Napi::Number::New(env, vectors_flat[i * dim + j]);
        }
        result[i] = vec;
    }

    return result;
}

/**
 * JS: getDeviceInfo(): object
 *
 * Returns CUDA device information
 */
Napi::Value GetDeviceInfo(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    int deviceCount = 0;
    cudaGetDeviceCount(&deviceCount);

    Napi::Object result = Napi::Object::New(env);
    result.Set("deviceCount", Napi::Number::New(env, deviceCount));

    if (deviceCount > 0) {
        cudaDeviceProp prop;
        cudaGetDeviceProperties(&prop, 0);

        result.Set("deviceName", Napi::String::New(env, prop.name));
        std::string capability = std::to_string(prop.major) + "." + std::to_string(prop.minor);
        result.Set("computeCapability", Napi::String::New(env, capability));
        result.Set("totalMemoryMB", Napi::Number::New(env, static_cast<double>(prop.totalGlobalMem / (1024 * 1024))));
        result.Set("multiProcessorCount", Napi::Number::New(env, static_cast<double>(prop.multiProcessorCount)));
    }

    return result;
}

// =============================================================================
// GPU FAISS IVF Operations (optional, requires ENABLE_FAISS_GPU)
// =============================================================================

#ifdef ULTRACODE_FAISS_GPU
// Forward declarations from gpu_ivf_ops.cpp
Napi::Value GpuIvfCreate(const Napi::CallbackInfo& info);
Napi::Value GpuIvfTrain(const Napi::CallbackInfo& info);
Napi::Value GpuIvfAdd(const Napi::CallbackInfo& info);
Napi::Value GpuIvfSearch(const Napi::CallbackInfo& info);
Napi::Value GpuIvfBatchSearch(const Napi::CallbackInfo& info);
Napi::Value GpuIvfSave(const Napi::CallbackInfo& info);
Napi::Value GpuIvfLoad(const Napi::CallbackInfo& info);
Napi::Value GpuIvfRemove(const Napi::CallbackInfo& info);
Napi::Value GpuIvfStats(const Napi::CallbackInfo& info);
#endif

// =============================================================================
// CPU FAISS Operations — full faiss-napi replacement (HNSW, Flat, IVF, SQ, PQ)
// =============================================================================

#ifdef ULTRACODE_FAISS_CPU
// Forward declarations from cpu_ivf_ops.cpp
Napi::Value FaissIndexCreate(const Napi::CallbackInfo& info);
Napi::Value FaissIndexTrain(const Napi::CallbackInfo& info);
Napi::Value FaissIndexAdd(const Napi::CallbackInfo& info);
Napi::Value FaissIndexSearch(const Napi::CallbackInfo& info);
Napi::Value FaissIndexBatchSearch(const Napi::CallbackInfo& info);
Napi::Value FaissIndexSave(const Napi::CallbackInfo& info);
Napi::Value FaissIndexLoad(const Napi::CallbackInfo& info);
Napi::Value FaissIndexRemove(const Napi::CallbackInfo& info);
Napi::Value FaissIndexReset(const Napi::CallbackInfo& info);
Napi::Value FaissIndexStats(const Napi::CallbackInfo& info);
#endif

// =============================================================================
// Module initialization
// =============================================================================

Napi::Object Init(Napi::Env env, Napi::Object exports) {
    exports.Set("cosineSimilarity", Napi::Function::New(env, CosineSimilarity));
    exports.Set("batchCosineSimilarity", Napi::Function::New(env, BatchCosineSimilarity));
    exports.Set("euclideanDistance", Napi::Function::New(env, EuclideanDistance));
    exports.Set("normalizeVectors", Napi::Function::New(env, NormalizeVectors));
    exports.Set("getDeviceInfo", Napi::Function::New(env, GetDeviceInfo));

#ifdef ULTRACODE_FAISS_GPU
    exports.Set("gpuIvfCreate", Napi::Function::New(env, GpuIvfCreate));
    exports.Set("gpuIvfTrain", Napi::Function::New(env, GpuIvfTrain));
    exports.Set("gpuIvfAdd", Napi::Function::New(env, GpuIvfAdd));
    exports.Set("gpuIvfSearch", Napi::Function::New(env, GpuIvfSearch));
    exports.Set("gpuIvfBatchSearch", Napi::Function::New(env, GpuIvfBatchSearch));
    exports.Set("gpuIvfSave", Napi::Function::New(env, GpuIvfSave));
    exports.Set("gpuIvfLoad", Napi::Function::New(env, GpuIvfLoad));
    exports.Set("gpuIvfRemove", Napi::Function::New(env, GpuIvfRemove));
    exports.Set("gpuIvfStats", Napi::Function::New(env, GpuIvfStats));
    exports.Set("hasGpuFaiss", Napi::Boolean::New(env, true));
#else
    exports.Set("hasGpuFaiss", Napi::Boolean::New(env, false));
#endif

#ifdef ULTRACODE_FAISS_CPU
    exports.Set("faissIndexCreate", Napi::Function::New(env, FaissIndexCreate));
    exports.Set("faissIndexTrain", Napi::Function::New(env, FaissIndexTrain));
    exports.Set("faissIndexAdd", Napi::Function::New(env, FaissIndexAdd));
    exports.Set("faissIndexSearch", Napi::Function::New(env, FaissIndexSearch));
    exports.Set("faissIndexBatchSearch", Napi::Function::New(env, FaissIndexBatchSearch));
    exports.Set("faissIndexSave", Napi::Function::New(env, FaissIndexSave));
    exports.Set("faissIndexLoad", Napi::Function::New(env, FaissIndexLoad));
    exports.Set("faissIndexRemove", Napi::Function::New(env, FaissIndexRemove));
    exports.Set("faissIndexReset", Napi::Function::New(env, FaissIndexReset));
    exports.Set("faissIndexStats", Napi::Function::New(env, FaissIndexStats));
    exports.Set("hasNativeFaiss", Napi::Boolean::New(env, true));
#else
    exports.Set("hasNativeFaiss", Napi::Boolean::New(env, false));
#endif

    return exports;
}

// NOTE: MODULE registration is done in addon.cpp
