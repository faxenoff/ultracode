# Module: external-tools/native/faiss-cpu/src

## 🤖 Overview

This module provides a C++ interface to the FAISS library, enabling efficient similarity search and clustering operations. It is primarily used by developers and data scientists who need to integrate FAISS functionality into their applications, particularly for tasks involving large-scale vector similarity searches.

## 🤖 Architecture

```
[FAISS Library]
    |
    v
[addon.cpp] — Manages native FAISS operations and bindings
    |
    v
[binding.cpp] — Exposes FAISS functionalities to Python via bindings
```

## 🤖 Flow

```
[Python Application]
    |
    v
[Python bindings] — Calls FAISS functions through binding.cpp
    |
    v
[FAISS Library] — Performs similarity search or clustering
    |
    v
[Python Application] — Receives results and processes them
```

## 🤖 Entity Listing

### Function
- **GetDeviceInfo** — Returns no-GPU info (FAISS-only mode) `binding.cpp:31-37`
- **Init** — Initializes the FAISS bindings for macOS without CUDA `binding.cpp:39-60`

### Import_decl
- **napi.h** — Imports `napi.h`. `addon.cpp:1-2`, `binding.cpp:11-12`
- **string** — Imports `string`. `binding.cpp:12-13`
