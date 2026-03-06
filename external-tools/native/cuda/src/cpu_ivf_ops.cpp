/**
 * Native FAISS Operations — full replacement for faiss-napi
 *
 * Provides all FAISS index operations (HNSW, Flat, IVF, IVF+SQ, IVF+PQ)
 * via FAISS C++ API with proper try/catch error handling.
 *
 * Multi-index pool (per projectKey) for serving multiple repositories.
 * All FAISS calls wrapped in FAISS_TRY to prevent process crashes.
 *
 * Compile flag: -DULTRACODE_FAISS_CPU=1
 * Links with: faiss.lib (CPU) from external-libs/faiss-gpu-win32-x64/
 */

#ifdef ULTRACODE_FAISS_CPU

#include <napi.h>
#include <string>
#include <unordered_map>
#include <memory>
#include <mutex>
#include <vector>

#include <faiss/Index.h>
#include <faiss/IndexFlat.h>
#include <faiss/IndexHNSW.h>
#include <faiss/IndexIVF.h>
#include <faiss/IndexScalarQuantizer.h>  // includes IndexIVFScalarQuantizer
#include <faiss/IndexIVFFlat.h>
#include <faiss/IndexIVFPQ.h>
#include <faiss/index_factory.h>
#include <faiss/index_io.h>
#include <faiss/MetricType.h>
#include <faiss/impl/FaissException.h>

// =============================================================================
// Global State
// =============================================================================

static std::mutex g_faiss_mutex;

struct FaissIndexEntry {
    std::unique_ptr<faiss::Index> index;
    int dims;
    std::string factory_string;
    std::string index_type; // "flat", "hnsw", "ivf", "ivfsq", "ivfpq"
    bool is_trained;
    faiss::idx_t ntotal;
};

static std::unordered_map<std::string, std::unique_ptr<FaissIndexEntry>> g_indexes;

// =============================================================================
// Error handling macro
// =============================================================================

#define FAISS_TRY(env, block) \
    try { block } \
    catch (const faiss::FaissException& e) { \
        throw Napi::Error::New(env, std::string("FAISS: ") + e.what()); \
    } catch (const std::exception& e) { \
        throw Napi::Error::New(env, std::string("Error: ") + e.what()); \
    }

// =============================================================================
// Helper: read float data from JS (Float32Array or number[])
// =============================================================================

struct FloatData {
    const float* ptr;
    std::vector<float> buf; // owns data if converted from Array
};

static FloatData readFloatArg(Napi::Env env, Napi::Value val) {
    FloatData fd;
    if (val.IsTypedArray()) {
        auto ta = val.As<Napi::Float32Array>();
        fd.ptr = ta.Data();
    } else if (val.IsArray()) {
        auto arr = val.As<Napi::Array>();
        fd.buf.resize(arr.Length());
        for (uint32_t i = 0; i < arr.Length(); i++) {
            fd.buf[i] = arr.Get(i).As<Napi::Number>().FloatValue();
        }
        fd.ptr = fd.buf.data();
    } else {
        throw Napi::TypeError::New(env, "Expected Float32Array or number[]");
    }
    return fd;
}

// =============================================================================
// faissIndexCreate(projectKey, dims, factoryString, metric?)
//
// Universal creation — supports any FAISS factory string:
//   "Flat", "HNSW32,Flat", "IVF256,SQ8", "IVF256,Flat", "IVF256,PQ8x8"
// =============================================================================

Napi::Value FaissIndexCreate(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    std::lock_guard<std::mutex> lock(g_faiss_mutex);

    if (info.Length() < 3) {
        throw Napi::TypeError::New(env, "Expected: projectKey, dims, factoryString [, metric]");
    }

    std::string projectKey = info[0].As<Napi::String>().Utf8Value();
    int dims = info[1].As<Napi::Number>().Int32Value();
    std::string factory = info[2].As<Napi::String>().Utf8Value();
    std::string metric = info.Length() > 3 && info[3].IsString()
        ? info[3].As<Napi::String>().Utf8Value() : "l2";

    faiss::MetricType faiss_metric = (metric == "ip" || metric == "cosine")
        ? faiss::METRIC_INNER_PRODUCT
        : faiss::METRIC_L2;

    FAISS_TRY(env, {
        faiss::Index* raw = faiss::index_factory(dims, factory.c_str(), faiss_metric);

        auto entry = std::make_unique<FaissIndexEntry>();
        entry->index.reset(raw);
        entry->dims = dims;
        entry->factory_string = factory;
        entry->is_trained = raw->is_trained;
        entry->ntotal = 0;

        // Classify index type
        if (factory.find("HNSW") != std::string::npos) {
            entry->index_type = "hnsw";
        } else if (factory.find("PQ") != std::string::npos) {
            entry->index_type = "ivfpq";
        } else if (factory.find("SQ") != std::string::npos) {
            entry->index_type = "ivfsq";
        } else if (factory.find("IVF") != std::string::npos) {
            entry->index_type = "ivf";
        } else {
            entry->index_type = "flat";
        }

        g_indexes[projectKey] = std::move(entry);
    })

    auto* entry = g_indexes[projectKey].get();

    Napi::Object result = Napi::Object::New(env);
    result.Set("success", true);
    result.Set("projectKey", projectKey);
    result.Set("dims", dims);
    result.Set("factory", factory);
    result.Set("indexType", entry->index_type);
    result.Set("isTrained", entry->is_trained);
    return result;
}

// =============================================================================
// faissIndexTrain(projectKey, vectors, count)
// =============================================================================

Napi::Value FaissIndexTrain(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    std::lock_guard<std::mutex> lock(g_faiss_mutex);

    if (info.Length() < 3) {
        throw Napi::TypeError::New(env, "Expected: projectKey, vectors, count");
    }

    std::string projectKey = info[0].As<Napi::String>().Utf8Value();
    auto it = g_indexes.find(projectKey);
    if (it == g_indexes.end()) {
        throw Napi::Error::New(env, "Index not found: " + projectKey);
    }

    auto* entry = it->second.get();
    auto fd = readFloatArg(env, info[1]);
    int64_t count = info[2].As<Napi::Number>().Int64Value();

    FAISS_TRY(env, {
        entry->index->train(count, fd.ptr);
        entry->is_trained = entry->index->is_trained;
    })

    Napi::Object result = Napi::Object::New(env);
    result.Set("success", true);
    result.Set("trainedOn", static_cast<double>(count));
    result.Set("isTrained", entry->is_trained);
    return result;
}

// =============================================================================
// faissIndexAdd(projectKey, vectors, count)
// =============================================================================

Napi::Value FaissIndexAdd(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    std::lock_guard<std::mutex> lock(g_faiss_mutex);

    if (info.Length() < 3) {
        throw Napi::TypeError::New(env, "Expected: projectKey, vectors, count");
    }

    std::string projectKey = info[0].As<Napi::String>().Utf8Value();
    auto it = g_indexes.find(projectKey);
    if (it == g_indexes.end()) {
        throw Napi::Error::New(env, "Index not found: " + projectKey);
    }

    auto* entry = it->second.get();
    auto fd = readFloatArg(env, info[1]);
    int64_t count = info[2].As<Napi::Number>().Int64Value();

    FAISS_TRY(env, {
        entry->index->add(count, fd.ptr);
        entry->ntotal = entry->index->ntotal;
    })

    Napi::Object result = Napi::Object::New(env);
    result.Set("success", true);
    result.Set("addedCount", static_cast<double>(count));
    result.Set("totalVectors", static_cast<double>(entry->ntotal));
    return result;
}

// =============================================================================
// faissIndexSearch(projectKey, query, k [, nprobe])
// Returns: { labels: BigInt64Array, distances: Float32Array }
// =============================================================================

Napi::Value FaissIndexSearch(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    std::lock_guard<std::mutex> lock(g_faiss_mutex);

    if (info.Length() < 3) {
        throw Napi::TypeError::New(env, "Expected: projectKey, query, k [, nprobe]");
    }

    std::string projectKey = info[0].As<Napi::String>().Utf8Value();
    auto it = g_indexes.find(projectKey);
    if (it == g_indexes.end()) {
        throw Napi::Error::New(env, "Index not found: " + projectKey);
    }

    auto* entry = it->second.get();
    auto fd = readFloatArg(env, info[1]);
    int k = info[2].As<Napi::Number>().Int32Value();

    // Optional nprobe for IVF indexes
    if (info.Length() > 3 && info[3].IsNumber()) {
        auto* ivf = dynamic_cast<faiss::IndexIVF*>(entry->index.get());
        if (ivf) ivf->nprobe = info[3].As<Napi::Number>().Int32Value();
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

    FAISS_TRY(env, {
        entry->index->search(1, fd.ptr, actual_k, distances.data(), labels.data());
    })

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

// =============================================================================
// faissIndexBatchSearch(projectKey, queries, nQueries, k [, nprobe])
// =============================================================================

Napi::Value FaissIndexBatchSearch(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    std::lock_guard<std::mutex> lock(g_faiss_mutex);

    if (info.Length() < 4) {
        throw Napi::TypeError::New(env, "Expected: projectKey, queries, nQueries, k [, nprobe]");
    }

    std::string projectKey = info[0].As<Napi::String>().Utf8Value();
    auto it = g_indexes.find(projectKey);
    if (it == g_indexes.end()) {
        throw Napi::Error::New(env, "Index not found: " + projectKey);
    }

    auto* entry = it->second.get();
    Napi::Float32Array queries = info[1].As<Napi::Float32Array>();
    int nQueries = info[2].As<Napi::Number>().Int32Value();
    int k = info[3].As<Napi::Number>().Int32Value();

    if (info.Length() > 4 && info[4].IsNumber()) {
        auto* ivf = dynamic_cast<faiss::IndexIVF*>(entry->index.get());
        if (ivf) ivf->nprobe = info[4].As<Napi::Number>().Int32Value();
    }

    int actual_k = std::min(k, static_cast<int>(entry->ntotal));
    size_t total = static_cast<size_t>(nQueries) * actual_k;

    if (actual_k <= 0) {
        Napi::Object result = Napi::Object::New(env);
        result.Set("labels", Napi::BigInt64Array::New(env, 0));
        result.Set("distances", Napi::Float32Array::New(env, 0));
        result.Set("nQueries", nQueries);
        result.Set("k", 0);
        return result;
    }

    std::vector<faiss::idx_t> labels(total);
    std::vector<float> distances(total);

    FAISS_TRY(env, {
        entry->index->search(nQueries, queries.Data(), actual_k, distances.data(), labels.data());
    })

    auto jsLabels = Napi::BigInt64Array::New(env, total);
    auto jsDistances = Napi::Float32Array::New(env, total);
    for (size_t i = 0; i < total; i++) {
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

// =============================================================================
// faissIndexSave(projectKey, path)
// =============================================================================

Napi::Value FaissIndexSave(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    std::lock_guard<std::mutex> lock(g_faiss_mutex);

    std::string projectKey = info[0].As<Napi::String>().Utf8Value();
    std::string path = info[1].As<Napi::String>().Utf8Value();

    auto it = g_indexes.find(projectKey);
    if (it == g_indexes.end()) {
        throw Napi::Error::New(env, "Index not found: " + projectKey);
    }

    FAISS_TRY(env, {
        faiss::write_index(it->second->index.get(), path.c_str());
    })

    Napi::Object result = Napi::Object::New(env);
    result.Set("success", true);
    result.Set("path", path);
    return result;
}

// =============================================================================
// faissIndexLoad(projectKey, path)
// =============================================================================

Napi::Value FaissIndexLoad(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    std::lock_guard<std::mutex> lock(g_faiss_mutex);

    if (info.Length() < 2) {
        throw Napi::TypeError::New(env, "Expected: projectKey, path");
    }

    std::string projectKey = info[0].As<Napi::String>().Utf8Value();
    std::string path = info[1].As<Napi::String>().Utf8Value();

    FAISS_TRY(env, {
        faiss::Index* raw = faiss::read_index(path.c_str());

        auto entry = std::make_unique<FaissIndexEntry>();
        entry->index.reset(raw);
        entry->dims = raw->d;
        entry->is_trained = raw->is_trained;
        entry->ntotal = raw->ntotal;
        entry->factory_string = "loaded";

        // Classify loaded index type
        if (dynamic_cast<faiss::IndexIVFScalarQuantizer*>(raw)) {
            entry->index_type = "ivfsq";
        } else if (dynamic_cast<faiss::IndexIVFPQ*>(raw)) {
            entry->index_type = "ivfpq";
        } else if (dynamic_cast<faiss::IndexIVFFlat*>(raw)) {
            entry->index_type = "ivf";
        } else if (dynamic_cast<faiss::IndexHNSW*>(raw)) {
            entry->index_type = "hnsw";
        } else {
            entry->index_type = "flat";
        }

        g_indexes[projectKey] = std::move(entry);
    })

    auto* entry = g_indexes[projectKey].get();

    Napi::Object result = Napi::Object::New(env);
    result.Set("success", true);
    result.Set("path", path);
    result.Set("loadedVectors", static_cast<double>(entry->ntotal));
    result.Set("isTrained", entry->is_trained);
    result.Set("dims", entry->dims);
    result.Set("indexType", entry->index_type);
    return result;
}

// =============================================================================
// faissIndexRemove(projectKey)
// =============================================================================

Napi::Value FaissIndexRemove(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    std::lock_guard<std::mutex> lock(g_faiss_mutex);

    std::string projectKey = info[0].As<Napi::String>().Utf8Value();
    g_indexes.erase(projectKey);

    Napi::Object result = Napi::Object::New(env);
    result.Set("success", true);
    return result;
}

// =============================================================================
// faissIndexReset(projectKey)
// Reset index (remove all vectors, keep trained state)
// =============================================================================

Napi::Value FaissIndexReset(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    std::lock_guard<std::mutex> lock(g_faiss_mutex);

    std::string projectKey = info[0].As<Napi::String>().Utf8Value();
    auto it = g_indexes.find(projectKey);
    if (it == g_indexes.end()) {
        throw Napi::Error::New(env, "Index not found: " + projectKey);
    }

    FAISS_TRY(env, {
        it->second->index->reset();
        it->second->ntotal = 0;
    })

    Napi::Object result = Napi::Object::New(env);
    result.Set("success", true);
    return result;
}

// =============================================================================
// faissIndexStats(projectKey?)
// =============================================================================

Napi::Value FaissIndexStats(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    std::lock_guard<std::mutex> lock(g_faiss_mutex);

    std::string filterKey = info.Length() > 0 && info[0].IsString()
        ? info[0].As<Napi::String>().Utf8Value() : "";

    Napi::Array arr = Napi::Array::New(env);
    uint32_t idx = 0;

    for (const auto& [key, entry] : g_indexes) {
        if (!filterKey.empty() && key != filterKey) continue;

        double memMB = 0;
        if (entry->ntotal > 0) {
            // Rough estimate
            double bytesPerVector;
            if (entry->index_type == "ivfsq") {
                bytesPerVector = entry->dims * 1.0 + 8;   // SQ8 + overhead
            } else if (entry->index_type == "hnsw") {
                bytesPerVector = entry->dims * 4.0 + 32 * 2 * 4; // float + HNSW links
            } else {
                bytesPerVector = entry->dims * 4.0 + 8;   // flat
            }
            memMB = (entry->ntotal * bytesPerVector) / (1024.0 * 1024.0);
        }

        // Get nprobe/nlist for IVF
        int nlist = 0;
        int nprobe = 0;
        auto* ivf = dynamic_cast<faiss::IndexIVF*>(entry->index.get());
        if (ivf) {
            nlist = static_cast<int>(ivf->nlist);
            nprobe = static_cast<int>(ivf->nprobe);
        }

        Napi::Object stat = Napi::Object::New(env);
        stat.Set("projectKey", key);
        stat.Set("ntotal", static_cast<double>(entry->ntotal));
        stat.Set("dims", entry->dims);
        stat.Set("indexType", entry->index_type);
        stat.Set("factory", entry->factory_string);
        stat.Set("memoryMB", memMB);
        stat.Set("isTrained", entry->is_trained);
        stat.Set("nlist", nlist);
        stat.Set("nprobe", nprobe);
        arr[idx++] = stat;
    }

    return arr;
}

#endif // ULTRACODE_FAISS_CPU
