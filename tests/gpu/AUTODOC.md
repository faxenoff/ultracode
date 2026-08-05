# tests/gpu

## 🤖 Overview

This module contains tests for detecting unsafe GPUs, specifically targeting Blackwell GPUs (CC 12.x) and verifying that environment variables override the detection logic. It ensures that WebGPU is not loaded on unsafe architectures, which is crucial for preventing crashes.

## 🤖 Architecture

```
  +-------------------+
  |   GPUDetector     |
  +-------------------+
  | - isWebGPUSafe()  |
  | - clearCache()    |
  +-------------------+
```

## 🤖 Flow

```
  +-------------------+
  |   Test Setup      |
  +-------------------+
  | - Clear cache     |
  | - Save original env |
  +-------------------+
  |   Test Execution  |
  |   +-----------------+
  |   | isWebGPUSafe() |
  |   +-----------------+
  |   | Check result   |
  |   +-----------------+
  |   Test Cleanup     |
  |   +-----------------+
  |   | Clear cache    |
  +-------------------+
```

## 🤖 Entity Listing

### Import_decl
- **../../src/gpu/detection/gpu-detector.js** — Imports `../../src/gpu/detection/gpu-detector.js`. `webgpu-blackwell.test.ts:20-24`
- **bun:test** — Imports `bun:test` from `bun:test`. `webgpu-blackwell.test.ts:19-19`

## Dependencies

**External imports:**
- `bun:test` — Bun's testing framework (`describe`, `test`, `expect`, `beforeEach`, `afterEach`)
- ~~`src/gpu/detection/gpu-detector.js`~~ (deleted) — Core module providing:
  - `GPUDetector` class with `isWebGPUSafe()` method and `clearCache()` utility
  - `WEBGPU_UNSAFE_MIN_CC` constant for minimum unsafe compute capability threshold
  - `WEBGPU_UNSTABLE_ARCHITECTURES` constant listing architectures incompatible with WebGPU

**Test configuration:**
- Environment variables: `WEBGPU_FORCE_ENABLE`, `WEBGPU_FORCE_DISABLE` — Control override behavior
- `process.env` — Checked and manipulated in setup/teardown for test isolation
