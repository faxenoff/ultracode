---
module_name: utils
description: "Setup infrastructure utilities for Docker, NVIDIA toolkit, multi-device configuration, and runtime helpers"
status: active
language: typescript
---

# Utils (Setup)

> Infrastructure utilities for the setup wizard providing Docker availability checks, NVIDIA Container Toolkit configuration, multi-device inference setup, and cross-runtime helpers.

## Overview

The setup utils module provides foundational infrastructure needed by the setup wizard and provider installers. It includes Docker daemon availability checking, Ollama service verification with retry logic, NVIDIA Container Toolkit detection and automated configuration, multi-device (GPU + CPU) parallel inference configuration for OVMS, Docker llama-server process cleanup, and a cross-runtime async sleep function compatible with both Bun and Node.js.

## Data Flow

- **Inputs:** System environment (Docker daemon, nvidia-smi, Ollama service), GPU detection results.
- **Processing:** Subprocess execution for availability checks, Docker restart for toolkit configuration, endpoint generation for multi-device setups.
- **Outputs:** Boolean availability flags, multi-device endpoint arrays, OVMS configuration objects.

## Public API

| Export | Type | Description | Location |
|--------|------|-------------|----------|
| `checkDocker` | function | Checks Docker availability and daemon status | [`docker.ts:11-55`](./docker.ts) |
| `cleanupDockerLlamaServer` | function | Terminates Docker llama-server on Windows | [`docker.ts:65-78`](./docker.ts) |
| `checkOllama` | function | Checks Ollama installation with retry | [`docker.ts:80-119`](./docker.ts) |
| `createMultiDeviceConfig` | function | Creates GPU+CPU parallel inference config | [`multi-device.ts:52-203`](./multi-device.ts) |
| `generateEndpointsArray` | function | Generates endpoint URLs for multi-device setup | [`multi-device.ts:98-212`](./multi-device.ts) |
| `checkNvidiaContainerToolkit` | function | Checks and configures NVIDIA Container Toolkit | [`nvidia-toolkit.ts:17-179`](./nvidia-toolkit.ts) |
| `sleep` | function | Cross-runtime async sleep (Bun/Node.js) | [`runtime.ts:10-10`](./runtime.ts) |

## Dependencies

### Internal Modules

| Module | Purpose |
|--------|---------|
| `setup/i18n` | Localized status messages |
| `setup/setup-ui` | Status output functions |

### External Packages

| Package | Purpose |
|---------|---------|
| `node:child_process` | Docker, nvidia-smi, Ollama subprocess execution |
| `node:fs` | Docker daemon config reading/writing |

## Behavioral Properties

| Property | Value |
|----------|-------|
| Ollama check retries | Multiple attempts with configurable timeout |
| Multi-device support | GPU + CPU round-robin load balancing via separate OVMS instances |
| NVIDIA toolkit auto-config | Modifies Docker daemon.json and restarts Docker service |

## Error Handling

Docker and Ollama checks return structured result objects rather than throwing. NVIDIA toolkit configuration catches and reports subprocess failures with troubleshooting hints. Sleep function falls back to `setTimeout` when Bun runtime is unavailable.

## Known Limitations

- `cleanupDockerLlamaServer` only works on Windows (kills `com.docker.llama-server.exe`).
- NVIDIA Container Toolkit auto-configuration requires elevated permissions for Docker daemon restart.
- Multi-device config assumes OVMS with specific port conventions.

## Exports

- `checkDocker`
- `checkOllama`
- `createMultiDeviceConfig`
- `generateEndpointsArray`
- `checkNvidiaContainerToolkit`
- `sleep`

## Files

| File | Description |
|------|-------------|
| `index.ts` | Re-exports all utility functions |
| `docker.ts` | Docker and Ollama availability checks, llama-server cleanup |
| `multi-device.ts` | Multi-device (GPU+CPU) parallel inference configuration |
| `nvidia-toolkit.ts` | NVIDIA Container Toolkit check and auto-configuration |
| `runtime.ts` | Cross-platform async sleep for Bun and Node.js |
