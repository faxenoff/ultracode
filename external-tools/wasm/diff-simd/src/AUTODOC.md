# external-tools/wasm/diff-simd/src

## 🤖 Overview

The `diff-simd` module implements a Myers diff algorithm with SIMD optimization for computing the difference between two strings efficiently. It is used by developers to generate unified diff formats for large codebases, leveraging SIMD instructions for performance improvements.

## 🤖 Architecture

```
  +-------------------+
  |   compute_diff_simd |
  +-------------------+
          |
          v
  +-------------------+
  |     myers_diff     |
  +-------------------+
          |
          v
  +-------------------+
  | generate_unified_diff |
  +-------------------+
```

## 🤖 Flow

```
  +-------------------+
  |   compute_diff_simd |
  +-------------------+
          |
          v
  +-------------------+
  |     myers_diff     |
  +-------------------+
          |
          v
  +-------------------+
  | generate_unified_diff |
  +-------------------+
          |
          v
  +-------------------+
  |     unified diff   |
  +-------------------+
```

## 🤖 Entity Listing

### Function
- **backtrack** — Backtracks through the trace to construct diff operations `lib.rs:73-112`
- **compute_diff_simd** — Computes the difference between two strings using the Myers algorithm with SIMD optimization `lib.rs:10-19`
- **generate_unified_diff** — Generates a unified diff format string from the LCS `lib.rs:143-187`
- **myers_diff** — Implements the Myers diff algorithm for string comparison `lib.rs:25-70`
- **simple_diff** — Provides a fallback diff algorithm for very large diffs `lib.rs:115-140`
- **test_deletion** — Tests the deletion operation in the diff `lib.rs:223-230`
- **test_insertion** — Tests the insertion operation in the diff `lib.rs:213-220`
- **test_simple_diff** — Tests the simple diff algorithm `lib.rs:202-210`

### Enum_decl
- **DiffOp** — Represents a diff operation, such as equal, delete, or insert `lib.rs:191-195`

### Constant
- **Delete** — Represents a delete operation in the diff `lib.rs:193-193`
- **Equal** — Represents an equal operation in the diff `lib.rs:192-192`
- **Insert** — Represents an insert operation in the diff `lib.rs:194-194`

### Module
- **tests** — Contains test functions for the diff algorithms `lib.rs:198-231`

### Import_decl
- **use super::*;** — Imports `use super::*;`. `lib.rs:199-199`
- **use wasm_bindgen::prelude::*;** — Imports `use wasm_bindgen::prelude::*;`. `lib.rs:1-1`

## Dependencies

- **wasm_bindgen** — Used to expose `compute_diff_simd` as a callable WASM function for JavaScript/WebAssembly interop.
- Internal algorithm dependencies: Myers algorithm uses iterative forward-pass trace collection and backtracking for operation reconstruction.
