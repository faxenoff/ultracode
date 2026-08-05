# tests/gpu

## Overview

This module contains integration tests for GPU detection and WebGPU safety validation, specifically verifying Blackwell GPU compatibility. The test suite validates that Blackwell GPUs (compute capability 12.x) are correctly flagged as unsafe for WebGPU and that environment variable overrides work as expected. Rather than loading WebGPU/Dawn (which would crash on unsafe hardware), these tests focus on the safety detection logic itself, with an optional flag to test actual WebGPU loading on compatible GPUs.

## Flow

```
GPU Spec (CC, model) → GPUDetector.isWebGPUSafe() → Safety Check against Unsafe List → Result (safe: bool, reason: string)
                                                              ↓
                                                    Check Env Overrides (WEBGPU_FORCE_ENABLE/DISABLE)
                                                              ↓
                                                         Return Decision
```

## Entity Listing

### Setup and Teardown

- **beforeEach** — `webgpu-blackwell.test.ts:26-169` — Clears GPU detector cache and removes WebGPU-related environment variables before each test to ensure isolation.
- **afterEach** (implicit via afterEach hook) — Clears GPU detector cache after each test to prevent state leakage.

### Test Suites and Cases

- **isWebGPUSafe detection** — `webgpu-blackwell.test.ts:35-100` — Test suite verifying core safety detection logic for various GPU compute capabilities.
  - **test "should mark CC 12.0+ as unsafe (Blackwell)"** — `webgpu-blackwell.test.ts:39-49` — Verifies that GPU with compute capability 12.0 (Blackwell) is marked unsafe with appropriate reason.
  - **test with result validation** — `webgpu-blackwell.test.ts:51-58` — Tests safety detection result for another CC configuration.
  - **test with result validation** — `webgpu-blackwell.test.ts:60-68` — Tests safety detection for additional compute capability variant.
  - **test with result validation** — `webgpu-blackwell.test.ts:70-77` — Tests safety detection for further CC scenario.
  - **test with result validation** — `webgpu-blackwell.test.ts:79-86` — Tests safety detection edge case.
  - **test with result validation** — `webgpu-blackwell.test.ts:88-94` — Tests safety detection for compatible GPU variant.
  - **test with result validation** — `webgpu-blackwell.test.ts:96-99` — Tests safety detection final case.

- **Environment variable override tests** — `webgpu-blackwell.test.ts:102-111` — Tests that `WEBGPU_FORCE_ENABLE` and `WEBGPU_FORCE_DISABLE` environment variables correctly override default safety checks.
  - **expect assertion for FORCE_ENABLE** — `webgpu-blackwell.test.ts:103-105` — Verifies that forced enable overrides safety check.
  - **expect assertion for FORCE_DISABLE** — `webgpu-blackwell.test.ts:107-110` — Verifies that forced disable prevents detection.

- **Process and cache invalidation tests** — `webgpu-blackwell.test.ts:113-136` — Tests that cache is properly cleared and detection works across multiple calls.
  - **result from GPUDetector** — `webgpu-blackwell.test.ts:114-123` — Stores detection result for validation.
  - **process detection in first call** — `webgpu-blackwell.test.ts:125-129` — Tests initial detection execution.
  - **process detection after cache clear** — `webgpu-blackwell.test.ts:131-135` — Tests detection after invalidating cached result.

- **Integration with downstream code** — `webgpu-blackwell.test.ts:138-148` — Tests that WebGPU detection is properly skipped on unsafe architectures.
  - **process info extraction** — `webgpu-blackwell.test.ts:139-147` — Tests handling of process information in detection flow.

- **Multi-GPU scenarios** — `webgpu-blackwell.test.ts:150-168` — Tests detection behavior with multiple GPUs or mixed configurations.
  - **First GPU detection** — `webgpu-blackwell.test.ts:151-159` — Tests safety decision for first GPU in system.
  - **first variable assignment** — `webgpu-blackwell.test.ts:161-167` — Stores first GPU detection result.

### Test Data Variables

- **result variables** — `webgpu-blackwell.test.ts:41-44, 52-55, 61-64, 71-74, 80-82, 89-91, 97-97, 115-115, 127-127, 133-133` — Store detection results returned by `GPUDetector.isWebGPUSafe()` for assertion and validation.
- **info variable** — `webgpu-blackwell.test.ts:142-142, 179-179` — Stores GPU information objects used in detection tests.
- **first variable** — `webgpu-blackwell.test.ts:162-162` — Stores first GPU's safety detection result from multi-GPU scenario.
- **second variable** — `webgpu-blackwell.test.ts:163-163` — Stores second GPU's safety detection result from multi-GPU scenario.

### Key Test Helper

- **GPUDetector class reference** — `webgpu-blackwell.test.ts:35-37, 176-196` — The GPU detection utility being tested, imported from `src/gpu/detection/gpu-detector.js` and used throughout test suite.

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