# webgpu-custom

## Overview

The **webgpu-custom** module is a test harness for verifying the custom-built Dawn WebGPU native addon integration. It handles runtime detection, locates the compiled `dawn.node` binary from fallback paths, and validates basic WebGPU API functionality (adapter enumeration and device creation). This is an internal verification script, not a public API module—it serves to confirm that the native WebGPU binding works correctly in both Node.js and Bun environments.

## Flow

```
Runtime Detection
      ↓
Locate dawn.node (primary → fallback path)
      ↓
Load Native Addon
      ↓
Create GPU Context
      ↓
Request Adapter
      ↓
Request Device
      ↓
Verification Complete
```

## Entities

### Test Execution

- **Runtime Detection** (`test.js`) — Identifies whether the script runs under Node.js or Bun and logs version information for debugging cross-runtime issues.

- **dawn.node Locator** (`test.js`) — Attempts to load the native addon from the local directory first, then falls back to `../../external-libs/dawn-win32-x64/dawn.node` if not found, with explicit error reporting if both paths fail.

- **Addon Initialization** (`test.js`) — Dynamically requires and instantiates the compiled WebGPU addon, creating the GPU context entry point.

- **Adapter Enumeration** (`test.js`) — Requests an available GPU adapter from the system, with fallback error handling if none are found.

- **Device Creation** (`test.js`) — Requests a logical GPU device from the selected adapter to enable command submission and resource management.

## Dependencies

- **External Binary**: `dawn.node` — custom-built WebGPU native addon (compiled from Dawn project for Windows x64); located in `../../external-libs/dawn-win32-x64/` or current directory.
- **Node.js/Bun Modules**: Standard `path` and `fs` modules for file system operations and path resolution.