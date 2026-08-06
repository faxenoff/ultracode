# cuda-custom

## Overview

The `cuda-custom` module provides runtime detection and native CUDA addon initialization for Node.js and Bun environments. It resolves the compiled native CUDA addon (`ultracode_cuda.node`) from local or fallback external-libs directories, loads it into the runtime, and validates GPU device detection capabilities through the native binding. This module serves as a bootstrap and verification point for GPU acceleration functionality within the ultracode ecosystem.

## Flow

```
Detect Runtime (Node.js vs Bun)
    ↓
Resolve Addon Path (local ./ultracode_cuda.node)
    ↓
Check Fallback (../../external-libs/cuda-win32-x64/ultracode_cuda.node)
    ↓
Load Native Module via require()
    ↓
Query GPU Device Info (getDeviceInfo if available)
    ↓
Report Status (SUCCESS or ERROR with diagnostics)
```

## Entity Listing

**Bootstrap & Validation**

- `test.js:1-1322` — Detects the active JavaScript runtime (Node.js or Bun), resolves and loads the native CUDA addon with fallback path logic, queries GPU device information through the native binding, and reports initialization success or provides diagnostic errors with path hints for resolution failures.

## Dependencies

**Native Addon**

- `ultracode_cuda.node` — Compiled C++ CUDA binding providing GPU device information retrieval; resolved from `./ultracode_cuda.node` (primary) or fallback location `../../external-libs/cuda-win32-x64/ultracode_cuda.node`.

**Node.js Built-in Modules**

- `path` — File path resolution and normalization for cross-platform addon location logic.
- `fs` — File system existence checks (`existsSync`) to validate addon presence before loading.

**Runtime Support**

- Node.js v14+ (primary, stable support).
- Bun runtime (known stability issues on certain configurations; included for compatibility testing).