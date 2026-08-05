# Installers

## 🤖 Overview

This module provides installer functions for various AI model providers, including MLX, Ollama, OVMS Native, and TEI. It is used by users who need to set up and install these AI model providers on their systems.

## 🤖 Architecture

```
  +---------------------+
  |     Installer Core  |
  |     (shared logic)  |
  |     (installers)   |
  |     (utils)        |
  +---------------------+
          |
          v
  +---------------------+
  |     MLX Installer   |
  |     (installMLX)    |
  |     (utils)        |
  +---------------------+
          |
          v
  +---------------------+
  |     Ollama Installer|
  |     (installOllama) |
  |     (utils)        |
  +---------------------+
          |
          v
  +---------------------+
  |     OVMS Native     |
  |     (installOVMSNative)|
  |     (utils)        |
  +---------------------+
          |
          v
  +---------------------+
  |     TEI Installer   |
  |     (installTEI)    |
  |     (utils)        |
  +---------------------+
```

## 🤖 Flow

```
  +---------------------+
  |     Installer Core  |
  |     (shared logic)  |
  |     (installers)   |
  |     (utils)        |
  +---------------------+
          |
          v
  +---------------------+
  |     MLX Installer   |
  |     (installMLX)    |
  |     (utils)        |
  +---------------------+
          |
          v
  +---------------------+
  |     Ollama Installer|
  |     (installOllama) |
  |     (utils)        |
  +---------------------+
          |
          v
  +----------------
  |     OVMS Native     |
  |     (installOVMSNative)|
  |     (utils)        |
  +----------------
          |
          v
  +---------------------+
  |     TEI Installer   |
  |     (installTEI)    |
  |     (utils)        |
  +---------------------+
```

## 🤖 Entity Listing

### Function
- **asset** — Finds the matching asset based on the platform and backend `llamacpp-installer.ts:175-175`
- **cacheDirDocker** — Normalizes the cache directory path for Docker environments `tei-installer.ts:123-123`
- **cpuAsset** — Represents a CPU asset for the llama.cpp installation `llamacpp-installer.ts:182-182`
- **cpuCount** — Counts the number of CPU endpoints in the provided list `ovms-installer.ts:679-679`
- **curlDownload** — Downloads a file from a URL using curl and returns a boolean indicating success `mlx-installer.ts:29-35`
- **detectBackend** — Detect best available backend `llamacpp-installer.ts:74-118`
- **detectModelDimensions** — Detects model dimensions and model ID based on the hidden size in the model's configuration file `ovms-installer.ts:462-485`
- **detectTargetDevice** — Detects the target device for model compilation based on CPU and GPU information `ovms-installer.ts:25-75`
- **dllFiles** — Stores the list of DLL files required for the llama.cpp installation `llamacpp-installer.ts:451-451`
- **dlls** — Stores the list of DLL files required for the llama.cpp installation `llamacpp-installer.ts:521-521`
- **doGet** — Not present in the provided code `ovms-installer.ts:278-292`, `ovms-installer.ts:334-348`
- **downloadAndInstallBinary** — Downloads and installs the llama.cpp binary `llamacpp-installer.ts:408-489`
- **downloadFile** — Downloads a file from a given URL `llamacpp-installer.ts:257-284`
- **downloadGGUFModel** — Downloads a GGUF model for the llama.cpp binary `llamacpp-installer.ts:289-328`
- **downloadOvmsBinary** — Downloads the OVMS binary for the specified platform `ovms-installer.ts:77-148`
- **ensureModel** — Ensures a model is downloaded and stored in the specified directory, returning the model directory if successful `mlx-installer.ts:37-73`
- **exitCode** — Not present in the provided code `ovms-installer.ts:184-192`
- **exitCode** — Captures the exit code of a Docker command execution `ovms-installer.ts:427-434`
- **exportModelDocker** — Attempts to export a model using Docker, falling back to CDN if available `ovms-installer.ts:361-460`
- **exportModelNative** — Not present in the provided code `ovms-installer.ts:150-229`
- **exportModelPy** — Finds the path to the export model script if it exists `ovms-installer.ts:572-572`
- **extractArchive** — Extracts an archive file `llamacpp-installer.ts:333-360`
- **findServerBinary** — Finds the server binary for the llama.cpp installation `llamacpp-installer.ts:365-402`
- **getCudartDownloadUrl** — Retrieves the CUDA runtime download URL for the llama.cpp binary `llamacpp-installer.ts:241-252`
- **getDirectDownloadUrl** — Retrieves the direct download URL for the llama.cpp binary `llamacpp-installer.ts:199-236`
- **getDownloadUrl** — Fetches the download URL for the specified backend and platform `llamacpp-installer.ts:123-194`
- **getHFToken** — Get HuggingFace token from environment variables `tei-installer.ts:18-20`
- **getLatestVersion** — Get latest llama.cpp version from GitHub `llamacpp-installer.ts:36-60`
- **getOvmsBinPath** — Determines the path to the OVMS binary based on the operating system `ovms-installer.ts:512-519`
- **gpuCount** — Counts the number of GPU endpoints in the provided list `ovms-installer.ts:677-677`
- **installCudaDlls** — Installs the CUDA DLLs for the llama.cpp installation `llamacpp-installer.ts:494-547`
- **installLlamaCpp** — Installs the llama.cpp binary and its dependencies `llamacpp-installer.ts:552-728`
- **installMLX** — Installs MLX Native on macOS Apple Silicon, ensuring the model is downloaded and configured `mlx-installer.ts:75-118`
- **installOllama** — Installs Ollama and pulls the specified model if it is not already available `ollama-installer.ts:11-65`
- **installOVMSNative** — Installs the OVMS native binary and prepares the embedding model for use `ovms-installer.ts:487-696`
- **installTEI** — Install TEI (Text Embeddings Inference) Docker container based on GPU availability and model configuration `tei-installer.ts:22-219`
- **model** — Not present in the provided code `ovms-installer.ts:240-240`
- **npuCount** — Counts the number of NPU endpoints in the provided list `ovms-installer.ts:678-678`
- **tryDownloadFromCdn** — Not present in the provided code `ovms-installer.ts:236-359`

### Interface
- **EmbeddingModelWithGGUF** — EmbeddingModel with optional GGUF configuration `llamacpp-installer.ts:22-25`
- **ReleaseAsset** — Interface for release assets `llamacpp-installer.ts:65-68`
- **TargetDeviceResult** — Represents the result of detecting the target device for model compilation `ovms-installer.ts:16-23`

### Type_alias
- **Backend** — Type for detecting best available backend `llamacpp-installer.ts:63-63`

### Import_decl
- **../../../cpu/cpu-detector.js** — Imports `../../../cpu/cpu-detector.js` from `../../../cpu/cpu-detector.js`. `llamacpp-installer.ts:11-11`, `ovms-installer.ts:8-8`
- **../../../utils/config-paths.js** — Imports `../../../utils/config-paths.js` from `../../../utils/config-paths.js`. `llamacpp-installer.ts:12-12`, `mlx-installer.ts:11-11`, `ovms-installer.ts:9-9`, `tei-installer.ts:8-8`
- **../../../utils/error-handling.js** — Imports `../../../utils/error-handling.js` from `../../../utils/error-handling.js`. `llamacpp-installer.ts:13-13`, `ovms-installer.ts:10-10`, `tei-installer.ts:9-9`
- **../i18n/index.js** — Imports `../i18n/index.js` from `../i18n/index.js`. `llamacpp-installer.ts:14-14`, `ollama-installer.ts:6-6`, `ovms-installer.ts:11-11`, `tei-installer.ts:10-10`
- **../setup-types.js** — Imports `../setup-types.js` from `../setup-types.js`. `llamacpp-installer.ts:15-15`, `mlx-installer.ts:12-12`, `ollama-installer.ts:7-7`, `ovms-installer.ts:12-12`, `tei-installer.ts:11-11`
- **../setup-ui.js** — Imports `../setup-ui.js` from `../setup-ui.js`. `llamacpp-installer.ts:16-16`, `mlx-installer.ts:13-13`, `ollama-installer.ts:8-8`, `ovms-installer.ts:13-13`, `tei-installer.ts:12-12`
- **../utils/index.js** — Imports `../utils/index.js` from `../utils/index.js`. `llamacpp-installer.ts:17-17`, `ollama-installer.ts:9-9`, `ovms-installer.ts:14-14`, `tei-installer.ts:13-13`
- **node:child_process** — Imports `node:child_process` from `node:child_process`. `llamacpp-installer.ts:8-8`, `mlx-installer.ts:8-8`, `ollama-installer.ts:5-5`, `ovms-installer.ts:5-5`, `tei-installer.ts:5-5`
- **node:fs** — Imports `node:fs` from `node:fs`. `llamacpp-installer.ts:9-9`, `mlx-installer.ts:9-9`, `ovms-installer.ts:6-6`, `tei-installer.ts:6-6`
- **node:path** — Imports `node:path` from `node:path`. `llamacpp-installer.ts:10-10`, `mlx-installer.ts:10-10`, `ovms-installer.ts:7-7`, `tei-installer.ts:7-7`

### Property
- **assets** — Parses the response to extract release assets `llamacpp-installer.ts:146-146`
- **browser_download_url** — Stores the URL for downloading the file `llamacpp-installer.ts:67-67`
- **dimensions** — Detects model dimensions based on the hidden size in the model's configuration file `ovms-installer.ts:462-462`
- **dtype** — Indicates the data type for operations in TEI `tei-installer.ts:127-127`
- **filename** — Asynchronously fetches the download URL for a specific backend. `llamac `llamacpp-installer.ts:123-123`
- **filename** — Stores the filename for the llama.cpp binary download `llamacpp-installer.ts:199-199`, `llamacpp-installer.ts:241-241`
- **gguf_file** — Represents the path to a GGUF file `llamacpp-installer.ts:24-24`
- **gguf_repo** — GitHub repo for llama.cpp (moved from ggerganov to ggml-org) `llamacpp-installer.ts:23-23`
- **hasIntelIGPU** — Checks if the system has an Intel iGPU `ovms-installer.ts:18-18`
- **hasNPU** — Checks if the system has an NPU `ovms-installer.ts:22-22`
- **isIntelArc** — Checks if the system has an Intel Arc GPU `ovms-installer.ts:19-19`
- **isIntelGPU** — Checks if the system has an Intel GPU `ovms-installer.ts:20-20`
- **isNvidiaGPU** — Checks if the system has an NVIDIA GPU `ovms-installer.ts:21-21`
- **max_batch_tokens** — Specifies the maximum number of tokens in a batch for TEI `tei-installer.ts:127-127`
- **max_client_batch_size** — Defines the maximum batch size for client-side operations in TEI `tei-installer.ts:127-127`
- **modelId** — Detects model dimensions based on the hidden size in the model's configuration file `ovms-installer.ts:462-462`
- **name** — Stores the name of the downloaded file `llamacpp-installer.ts:66-66`
- **tag_name** — Extracts the tag name from a JSON response `llamacpp-installer.ts:48-48`
- **targetDevice** — Determines the target device for model compilation based on CPU and GPU information `ovms-installer.ts:17-17`
- **tei_config** — Represents a configuration object for TEI with optional properties for batch tokens, client batch size, and data type `tei-installer.ts:127-127`
- **url** — Asynchronously fetches the download URL for a specific backend `llamacpp-installer.ts:123-123`
- **url** — Stores the URL for the llama.cpp binary download `llamacpp-installer.ts:199-199`, `llamacpp-installer.ts:241-241`

## Data Flow

- **Inputs:** Selected provider name, embedding model configuration, GPU info, CPU features.
- **Processing:** Prerequisite checks, image pulling or binary download, model preparation, container/process startup, health endpoint polling.
- **Outputs:** `InstallResult` with success status, detected dimensions, multi-device endpoints.

## Public API

| Export | Type | Description | Location |
|--------|------|-------------|----------|
| `installOllama` | function | Checks Ollama installation and starts embedding service | [`ollama-installer.ts:11-65`](./ollama-installer.ts) |
| `installOVMSNative` | function | Installs OpenVINO Model Server with multi-device support | [`ovms-installer.ts:16-23`](./ovms-installer.ts) |
| `installTEI` | function | Deploys Text Embeddings Inference via Docker | [`tei-installer.ts:18-20`](./tei-installer.ts) |
| `installVLLM` | function | Creates vLLM container with OpenAI-compatible API | ~~[~~`vllm-installer.ts:15-198`~~ (deleted)](./vllm-installer.ts)~~ (deleted) |
| `installLlamaCpp` | function | Downloads llama-server binary and GGUF models | [`llamacpp-installer.ts:408-489`](./llamacpp-installer.ts) |


### Added Entities

- **curlDownload** — `mlx-installer.ts:29-35`
- **ensureModel** — `mlx-installer.ts:37-73`
- **installMLX** — `mlx-installer.ts:75-118`
- **CDN_BASE** — `mlx-installer.ts:15-15`
- **MODEL_CDN_MAP** — `mlx-installer.ts:17-27`
- **r** — `mlx-installer.ts:30-33`
- **cdnName** — `mlx-installer.ts:38-38`
- **modelDir** — `mlx-installer.ts:44-44`
- **safetensors** — `mlx-installer.ts:45-45`
- **files** — `mlx-installer.ts:54-54`
- **dest** — `mlx-installer.ts:57-57`
- **label** — `mlx-installer.ts:60-60`
- **url** — `mlx-installer.ts:63-63`
- **dataDir** — `mlx-installer.ts:84-84`
- **mlxDir** — `mlx-installer.ts:85-85`
- **modelDir** — `mlx-installer.ts:98-98`
- **cdnModelId** — `mlx-installer.ts:89-89`

## Dependencies

### Internal Modules

| Module | Purpose |
|--------|---------|
| `setup/utils` | Docker checks, NVIDIA toolkit, sleep, multi-device config |
| `setup/i18n` | Localized installation messages |
| `setup/setup-ui` | Colored status output and user prompts |
| `setup/setup-types` | `EmbeddingModel`, `GPUInfo`, `InstallResult` types |

### External Packages

| Package | Purpose |
|---------|---------|
| `node:child_process` | Docker commands, binary execution |
| `node:fs` | File download, model storage, config writing |
| `node:https` | Binary and model downloads |

## Behavioral Properties

| Property | Value |
|----------|-------|
| Supported providers | Ollama, OVMS (native), TEI (Docker), vLLM (Docker), llama.cpp (native) |
| Health check timeout | Provider-specific, typically 60-120 seconds |
| Container naming | `tei-server`, `vllm-server`, etc. |

## Error Handling

Each installer catches and reports errors at each stage (download, extraction, startup, health check). Failures are accumulated into `InstallResult.success = false` but do not throw, allowing the setup wizard to save partial configuration.

## Known Limitations

- TEI and vLLM require Docker; no native alternatives.
- llama.cpp installer downloads platform-specific binaries and may not cover all architectures.
- OVMS native installer requires manual OpenVINO installation on some platforms.

## Exports

- `installMLX`
- `installOllama`
- `installOVMSNative`
- `installTEI`

## Files

| File | Description |
|------|-------------|
| `index.ts` | Re-exports all installer functions |
| `llamacpp-installer.ts` | llama.cpp binary download with GPU backend auto-detection |
| `ollama-installer.ts` | Ollama service check and embedding model download |
| `ovms-installer.ts` | OpenVINO Model Server native installation with NPU/GPU support |
| `tei-installer.ts` | Text Embeddings Inference Docker container deployment |
| `vllm-installer.ts` | vLLM Docker container deployment for NVIDIA GPUs |
