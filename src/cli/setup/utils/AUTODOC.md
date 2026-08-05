# Utils (Setup)

## 🤖 Overview

The setup utils module provides foundational infrastructure needed by the setup wizard and provider installers. It includes Docker daemon availability checking, Ollama service verification with retry logic, NVIDIA Container Toolkit detection and automated configuration, multi-device (GPU + CPU) parallel inference configuration for OVMS, Docker llama-server process cleanup, and a cross-runtime async sleep function compatible with both Bun and Node.js.

## 🤖 Entity Listing

### Function
- **checkDocker** — Checks if Docker is installed and running, attempting to run `docker info` and `docker --version` to determine its status `docker.ts:11-55`
- **checkNvidiaContainerToolkit** — Check and ensure NVIDIA Container Toolkit is working for Docker GPU access `nvidia-toolkit.ts:17-179`
- **checkOllama** — Checks if Ollama is running by attempting to run `ollama --version` with increasing timeouts `docker.ts:80-119`
- **cleanupDockerLlamaServer** — Kills the Docker's built-in llama-server process if it is running on Windows, to avoid conflicts with the user's own llama-server `docker.ts:65-78`
- **copyModelFiles** — Copy model files (xml/bin/tokenizer) from source to target directory, skipping graph.pbtxt `multi-device.ts:43-57`
- **cpuEndpoint** — Finds the CPU endpoint in the list of endpoints `multi-device.ts:233-233`
- **createMultiDeviceConfig** — Creates a multi-device configuration for models, handling GPU, NPU, and CPU endpoints `multi-device.ts:98-212`
- **generateEndpointsArray** — Generates an array of endpoints, prioritizing GPU, NPU, and CPU endpoints `multi-device.ts:230-256`
- **generateGraphPbtxt** — Generate graph.pbtxt content for a given device configuration `multi-device.ts:62-83`
- **gpuEndpoint** — Finds the GPU endpoint in the list of endpoints `multi-device.ts:231-231`
- **modelFiles** — List of model files to be copied, excluding graph.pbtxt `multi-device.ts:45-45`
- **npuEndpoint** — Finds the NPU endpoint in the list of endpoints `multi-device.ts:232-232`
- **ovmsConfig** — Constructs an OVMS configuration object with endpoints mapped to base paths `multi-device.ts:202-205`

### Interface
- **OVMSConfig** — Defines an interface for an OVMS configuration with model and media pipe configurations `multi-device.ts:195-198`
- **OVMSEndpoint** — Defines an interface for an endpoint with a name and base path `multi-device.ts:190-193`

### Import_decl
- **../../../utils/error-handling.js** — Imports `../../../utils/error-handling.js` from `../../../utils/error-handling.js`. `docker.ts:8-8`, `nvidia-toolkit.ts:9-9`
- **../i18n/index.js** — Imports `../i18n/index.js` from `../i18n/index.js`. `nvidia-toolkit.ts:10-10`
- **../setup-ui.js** — Imports `../setup-ui.js` from `../setup-ui.js`. `docker.ts:9-9`, `multi-device.ts:27-27`, `nvidia-toolkit.ts:11-11`
- **./runtime.js** — Imports `./runtime.js` from `./runtime.js`. `nvidia-toolkit.ts:12-12`
- **node:child_process** — Imports `node:child_process` from `node:child_process`. `docker.ts:7-7`, `nvidia-toolkit.ts:7-7`
- **node:fs** — Imports `node:fs` from `node:fs`. `multi-device.ts:25-25`, `nvidia-toolkit.ts:8-8`
- **node:path** — Imports `node:path` from `node:path`. `multi-device.ts:26-26`

### Property
- **base_path** — Represents the base path for an endpoint `multi-device.ts:192-192`
- **mediapipe_config_list** — Contains a list of media pipe configurations for OVMS `multi-device.ts:197-197`
- **model_config_list** — Contains a list of model configurations for OVMS `multi-device.ts:196-196`
- **name** — Represents the name of an endpoint `multi-device.ts:191-191`
- **pluginConfig** — Plugin configuration for the graph.pbtxt generation `multi-device.ts:62-62`
- **targetDevice** — Device configuration for the graph.pbtxt generation `multi-device.ts:62-62`

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
