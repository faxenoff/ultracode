/**
 * GPU IVF Operations for FAISS
 *
 * Provides GPU-accelerated IVF (Inverted File) index operations using FAISS GPU.
 * Supports multi-index pool (per projectKey) for serving multiple repositories.
 *
 * Requires: FAISS compiled with GPU support (ENABLE_FAISS_GPU=ON)
 * Compile flag: -DULTRACODE_FAISS_GPU=1
 */

#ifdef ULTRACODE_FAISS_GPU

#include <napi.h>
#include <string>
#include <unordered_map>
#include <memory>
#include <mutex>
#include <vector>

#include <faiss/gpu/GpuIndexIVFScalarQuantizer.h>
#include <faiss/gpu/GpuIndexIVFFlat.h>
#include <faiss/gpu/GpuIndexFlat.h>
#include <faiss/gpu/StandardGpuResources.h>
#include <faiss/gpu/GpuClonerOptions.h>
#include <faiss/gpu/GpuCloner.h>
#include <faiss/gpu/GpuAutoTune.h>
#include <faiss/index_io.h>
#include <faiss/IndexScalarQuantizer.h>
#include <faiss/MetricType.h>

// =============================================================================
// Global State
// =============================================================================

// GPU resources (one per process, thread-safe)
static std::unique_ptr<faiss::gpu::StandardGpuResources> gpu_res;
static std::mutex gpu_mutex;

// Multi-index pool: projectKey → GPU index
struct GpuIndexEntry {
    std::unique_ptr<faiss::gpu::GpuIndexIVFScalarQuantizer> sq_index;
    std::unique_ptr<faiss::gpu::GpuIndexIVFFlat> flat_index;
    int dims;
    int nlist;
    int sq_bits;
    bool is_trained;
    faiss::idx_t ntotal;
};

static std::unordered_map<std::string, std::unique_ptr<GpuIndexEntry>> gpu_indexes;

// =============================================================================
// Helpers
// =============================================================================

static void ensureGpuResources() {
    if (!gpu_res) {
        gpu_res = std::make_unique<faiss::gpu::StandardGpuResources>();
        // Use 256MB temp memory (default is 1.5GB which is too much for multiple indexes)
        gpu_res->setTempMemory(256 * 1024 * 1024);
    }
}

static faiss::Index* getActiveIndex(GpuIndexEntry* entry) {
    if (entry->sq_index) return entry->sq_index.get();
    if (entry->flat_index) return entry->flat_index.get();
    return nullptr;
}

// =============================================================================
// N-API Functions
// =============================================================================

/**
 * gpuIvfCreate(projectKey, dims, nlist, sqBits, metric)
 * Creates a GpuIndexIVFScalarQuantizer in gpu_indexes[projectKey]
 */
Napi::Value GpuIvfCreate(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    std::lock_guard<std::mutex> lock(gpu_mutex);

    if (info.Length() < 4) {
        throw Napi::TypeError::New(env, "Expected: projectKey, dims, nlist, sqBits [, metric]");
    }

    std::string projectKey = info[0].As<Napi::String>().Utf8Value();
    int dims = info[1].As<Napi::Number>().Int32Value();
    int nlist = info[2].As<Napi::Number>().Int32Value();
    int sqBits = info[3].As<Napi::Number>().Int32Value();
    std::string metric = info.Length() > 4 ? info[4].As<Napi::String>().Utf8Value() : "l2";

    ensureGpuResources();

    auto entry = std::make_unique<GpuIndexEntry>();
    entry->dims = dims;
    entry->nlist = nlist;
    entry->sq_bits = sqBits;
    entry->is_trained = false;
    entry->ntotal = 0;

    faiss::MetricType faiss_metric = (metric == "ip" || metric == "cosine")
        ? faiss::METRIC_INNER_PRODUCT
        : faiss::METRIC_L2;

    // Map sqBits to FAISS ScalarQuantizer type
    faiss::ScalarQuantizer::QuantizerType qtype;
    switch (sqBits) {
        case 4:  qtype = faiss::ScalarQuantizer::QT_4bit; break;
        case 6:  qtype = faiss::ScalarQuantizer::QT_6bit; break;
        case 8:  qtype = faiss::ScalarQuantizer::QT_8bit; break;
        case 16: qtype = faiss::ScalarQuantizer::QT_fp16; break;
        default: qtype = faiss::ScalarQuantizer::QT_8bit; break;
    }

    entry->sq_index = std::make_unique<faiss::gpu::GpuIndexIVFScalarQuantizer>(
        gpu_res.get(), dims, nlist, qtype, faiss_metric
    );

    gpu_indexes[projectKey] = std::move(entry);

    Napi::Object result = Napi::Object::New(env);
    result.Set("success", true);
    result.Set("projectKey", projectKey);
    result.Set("dims", dims);
    result.Set("nlist", nlist);
    result.Set("sqBits", sqBits);
    return result;
}

/**
 * gpuIvfTrain(projectKey, vectors: Float32Array, count)
 */
Napi::Value GpuIvfTrain(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    std::lock_guard<std::mutex> lock(gpu_mutex);

    std::string projectKey = info[0].As<Napi::String>().Utf8Value();
    Napi::Float32Array vectors = info[1].As<Napi::Float32Array>();
    int count = info[2].As<Napi::Number>().Int32Value();

    auto it = gpu_indexes.find(projectKey);
    if (it == gpu_indexes.end()) {
        throw Napi::Error::New(env, "Index not found: " + projectKey);
    }

    auto* entry = it->second.get();
    auto* index = getActiveIndex(entry);
    if (!index) {
        throw Napi::Error::New(env, "No active index for: " + projectKey);
    }

    index->train(count, vectors.Data());
    entry->is_trained = true;

    Napi::Object result = Napi::Object::New(env);
    result.Set("success", true);
    result.Set("trainedOn", count);
    return result;
}

/**
 * gpuIvfAdd(projectKey, vectors: Float32Array, count)
 */
Napi::Value GpuIvfAdd(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    std::lock_guard<std::mutex> lock(gpu_mutex);

    std::string projectKey = info[0].As<Napi::String>().Utf8Value();
    Napi::Float32Array vectors = info[1].As<Napi::Float32Array>();
    int count = info[2].As<Napi::Number>().Int32Value();

    auto it = gpu_indexes.find(projectKey);
    if (it == gpu_indexes.end()) {
        throw Napi::Error::New(env, "Index not found: " + projectKey);
    }

    auto* entry = it->second.get();
    auto* index = getActiveIndex(entry);
    if (!index) {
        throw Napi::Error::New(env, "No active index for: " + projectKey);
    }

    index->add(count, vectors.Data());
    entry->ntotal = index->ntotal;

    Napi::Object result = Napi::Object::New(env);
    result.Set("success", true);
    result.Set("addedCount", count);
    result.Set("totalVectors", static_cast<double>(entry->ntotal));
    return result;
}

/**
 * gpuIvfSearch(projectKey, query: Float32Array, k)
 * Returns: { labels: BigInt64Array, distances: Float32Array }
 */
Napi::Value GpuIvfSearch(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    std::lock_guard<std::mutex> lock(gpu_mutex);

    std::string projectKey = info[0].As<Napi::String>().Utf8Value();
    Napi::Float32Array query = info[1].As<Napi::Float32Array>();
    int k = info[2].As<Napi::Number>().Int32Value();

    auto it = gpu_indexes.find(projectKey);
    if (it == gpu_indexes.end()) {
        throw Napi::Error::New(env, "Index not found: " + projectKey);
    }

    auto* entry = it->second.get();
    auto* index = getActiveIndex(entry);
    if (!index) {
        throw Napi::Error::New(env, "No active index for: " + projectKey);
    }

    int actual_k = std::min(k, static_cast<int>(entry->ntotal));
    if (actual_k <= 0) {
        Napi::Object result = Napi::Object::New(env);
        result.Set("labels", Napi::BigInt64Array::New(env, 0));
        result.Set("distances", Napi::Float32Array::New(env, 0));
        return result;
    }

    std::vector<faiss::idx_t> labels(actual_k);
    std::vector<float> distances(actual_k);

    index->search(1, query.Data(), actual_k, distances.data(), labels.data());

    // Convert to JS typed arrays
    auto jsLabels = Napi::BigInt64Array::New(env, actual_k);
    auto jsDistances = Napi::Float32Array::New(env, actual_k);

    for (int i = 0; i < actual_k; i++) {
        jsLabels[i] = labels[i];
        jsDistances[i] = distances[i];
    }

    Napi::Object result = Napi::Object::New(env);
    result.Set("labels", jsLabels);
    result.Set("distances", jsDistances);
    return result;
}

/**
 * gpuIvfBatchSearch(projectKey, queries: Float32Array, nQueries, k)
 * Batch search on GPU — main performance win
 */
Napi::Value GpuIvfBatchSearch(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    std::lock_guard<std::mutex> lock(gpu_mutex);

    std::string projectKey = info[0].As<Napi::String>().Utf8Value();
    Napi::Float32Array queries = info[1].As<Napi::Float32Array>();
    int nQueries = info[2].As<Napi::Number>().Int32Value();
    int k = info[3].As<Napi::Number>().Int32Value();

    auto it = gpu_indexes.find(projectKey);
    if (it == gpu_indexes.end()) {
        throw Napi::Error::New(env, "Index not found: " + projectKey);
    }

    auto* entry = it->second.get();
    auto* index = getActiveIndex(entry);
    if (!index) {
        throw Napi::Error::New(env, "No active index for: " + projectKey);
    }

    int actual_k = std::min(k, static_cast<int>(entry->ntotal));
    size_t total_results = static_cast<size_t>(nQueries) * actual_k;

    std::vector<faiss::idx_t> labels(total_results);
    std::vector<float> distances(total_results);

    index->search(nQueries, queries.Data(), actual_k, distances.data(), labels.data());

    auto jsLabels = Napi::BigInt64Array::New(env, total_results);
    auto jsDistances = Napi::Float32Array::New(env, total_results);

    for (size_t i = 0; i < total_results; i++) {
        jsLabels[i] = labels[i];
        jsDistances[i] = distances[i];
    }

    Napi::Object result = Napi::Object::New(env);
    result.Set("labels", jsLabels);
    result.Set("distances", jsDistances);
    result.Set("nQueries", nQueries);
    result.Set("k", actual_k);
    return result;
}

/**
 * gpuIvfSave(projectKey, path)
 * GPU→CPU copy then save to disk
 */
Napi::Value GpuIvfSave(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    std::lock_guard<std::mutex> lock(gpu_mutex);

    std::string projectKey = info[0].As<Napi::String>().Utf8Value();
    std::string path = info[1].As<Napi::String>().Utf8Value();

    auto it = gpu_indexes.find(projectKey);
    if (it == gpu_indexes.end()) {
        throw Napi::Error::New(env, "Index not found: " + projectKey);
    }

    auto* entry = it->second.get();
    auto* gpu_index = getActiveIndex(entry);
    if (!gpu_index) {
        throw Napi::Error::New(env, "No active index for: " + projectKey);
    }

    // GPU → CPU transfer
    std::unique_ptr<faiss::Index> cpu_index(faiss::gpu::index_gpu_to_cpu(gpu_index));
    faiss::write_index(cpu_index.get(), path.c_str());

    Napi::Object result = Napi::Object::New(env);
    result.Set("success", true);
    result.Set("path", path);
    return result;
}

/**
 * gpuIvfLoad(projectKey, path)
 * Load CPU index then transfer to GPU
 */
Napi::Value GpuIvfLoad(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    std::lock_guard<std::mutex> lock(gpu_mutex);

    std::string projectKey = info[0].As<Napi::String>().Utf8Value();
    std::string path = info[1].As<Napi::String>().Utf8Value();

    ensureGpuResources();

    // Read CPU index
    std::unique_ptr<faiss::Index> cpu_index(faiss::read_index(path.c_str()));

    // CPU → GPU transfer
    faiss::gpu::GpuClonerOptions options;
    std::unique_ptr<faiss::Index> gpu_index(
        faiss::gpu::index_cpu_to_gpu(gpu_res.get(), 0, cpu_index.get(), &options)
    );

    auto entry = std::make_unique<GpuIndexEntry>();
    entry->dims = cpu_index->d;
    entry->ntotal = gpu_index->ntotal;
    entry->is_trained = gpu_index->is_trained;
    entry->nlist = 0;
    entry->sq_bits = 8;

    // Try to cast to specific GPU index type
    auto* sq_idx = dynamic_cast<faiss::gpu::GpuIndexIVFScalarQuantizer*>(gpu_index.get());
    if (sq_idx) {
        gpu_index.release();
        entry->sq_index.reset(sq_idx);
        entry->nlist = sq_idx->nlist;
    } else {
        auto* flat_idx = dynamic_cast<faiss::gpu::GpuIndexIVFFlat*>(gpu_index.get());
        if (flat_idx) {
            gpu_index.release();
            entry->flat_index.reset(flat_idx);
            entry->nlist = flat_idx->nlist;
        } else {
            throw Napi::Error::New(env, "Loaded index is not IVF type");
        }
    }

    gpu_indexes[projectKey] = std::move(entry);

    Napi::Object result = Napi::Object::New(env);
    result.Set("success", true);
    result.Set("path", path);
    result.Set("loadedVectors", static_cast<double>(gpu_indexes[projectKey]->ntotal));
    return result;
}

/**
 * gpuIvfRemove(projectKey)
 * Remove index from GPU memory
 */
Napi::Value GpuIvfRemove(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    std::lock_guard<std::mutex> lock(gpu_mutex);

    std::string projectKey = info[0].As<Napi::String>().Utf8Value();
    gpu_indexes.erase(projectKey);

    Napi::Object result = Napi::Object::New(env);
    result.Set("success", true);
    return result;
}

/**
 * gpuIvfStats(projectKey?)
 * Returns stats for one or all indexes
 */
Napi::Value GpuIvfStats(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    std::lock_guard<std::mutex> lock(gpu_mutex);

    std::string filterKey = info.Length() > 0 && info[0].IsString()
        ? info[0].As<Napi::String>().Utf8Value() : "";

    Napi::Array arr = Napi::Array::New(env);
    uint32_t idx = 0;

    for (const auto& [key, entry] : gpu_indexes) {
        if (!filterKey.empty() && key != filterKey) continue;

        // Rough GPU memory estimate
        double gpuMemMB = 0;
        if (entry->ntotal > 0) {
            // SQ8: dims * 1 byte per vector + overhead
            double bytesPerVector = entry->sq_bits <= 8
                ? entry->dims * 1.0
                : entry->dims * 4.0;
            gpuMemMB = (entry->ntotal * bytesPerVector) / (1024.0 * 1024.0);
        }

        Napi::Object stat = Napi::Object::New(env);
        stat.Set("projectKey", key);
        stat.Set("ntotal", static_cast<double>(entry->ntotal));
        stat.Set("dims", entry->dims);
        stat.Set("nlist", entry->nlist);
        stat.Set("gpuMemoryMB", gpuMemMB);
        stat.Set("isTrained", entry->is_trained);
        arr[idx++] = stat;
    }

    return arr;
}

#endif // ULTRACODE_FAISS_GPU
