# vector-ops-simd

## 🤖 Overview

This module provides a WebAssembly SIMD implementation for computing cosine similarity between two vectors, optimized for performance. It is used by developers and data scientists who need efficient vector operations in environments that support WebAssembly SIMD instructions.

## 🤖 Architecture

```
       +---------------------+
       |     SIMD Vector    |
       |     Operations     |
       |     (4-element)     |
       +---------------------+
           |
           v
       +---------------------+
       |     Dot Product     |
       |     Calculation     |
       +---------------------+
           |
           v
       +---------------------+
       |     Norm Squared    |
       |     Calculation     |
       +---------------------+
           |
           v
       +---------------------+
       |     Cosine Similarity|
       |     Calculation     |
       +---------------------+
```

## 🤖 Flow

```
       +---------------------+
       |     Input Vectors   |
       |     (a, b)          |
       +---------------------+
           |
           v
       +---------------------+
       |     SIMD Vector     |
       |     Operations      |
       |     (4-element)      |
       +---------------------+
           |
           v
       +---------------------+
       |     Dot Product     |
       |     Calculation     |
       +---------------------+
           |
           v
       +---------------------+
       |     Norm Squared    |
       |     Calculation     |
       +---------------------+
           |
           v
       +---------------------+
       |     Cosine Similarity|
       |     Calculation     |
       +---------------------+
           |
           v
       +---------------------+
       |     Output Result   |
       |     (cosine similarity)|
       +---------------------+
```

## 🤖 Entity Listing

### Function
- **cosine_similarity_simd** — Computes cosine similarity between two vectors using SIMD instructions for performance `lib.rs:15-96`
- **dot_product_simd** — Not present in the provided code `lib.rs:100-143`
- **l2_norm_simd** — Not present in the provided code `lib.rs:147-185`
- **normalize_simd** — Not present in the provided code `lib.rs:189-226`
- **test_cosine_similarity** — Tests the cosine similarity function `lib.rs:233-239`
- **test_dot_product** — Tests the dot product function `lib.rs:251-257`
- **test_l2_norm** — Tests the L2 norm function `lib.rs:260-264`
- **test_normalize** — Tests the normalize function `lib.rs:267-273`
- **test_orthogonal_vectors** — Tests the cosine similarity function with orthogonal vectors `lib.rs:242-248`

### Module
- **tests** — Contains test functions for vector operations `lib.rs:229-274`

### Import_decl
- **use std::arch::wasm32::*;** — Imports `use std::arch::wasm32::*;`. `lib.rs:32-32`, `lib.rs:111-111`, `lib.rs:154-154`, `lib.rs:201-201`
- **use super::*;** — Imports `use super::*;`. `lib.rs:230-230`
- **use wasm_bindgen::prelude::*;** — Imports `use wasm_bindgen::prelude::*;`. `lib.rs:1-1`

## Dependencies

**External:**
- `wasm_bindgen` — FFI bridge exposing Rust functions as JavaScript-callable WASM exports.
- `std::arch::wasm32` — WebAssembly SIMD intrinsics (`f32x4_*` operations) available under `target_feature = "simd128"`.

**Design Pattern:**
SIMD chunking pipeline—functions decompose vectors into 4-element chunks for parallel computation, then reduce remaining scalar elements, minimizing control flow overhead and maximizing instruction-level parallelism.
