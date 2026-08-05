# Setup

Interactive setup wizard for semantic embeddings and LLM configuration

## Overview

The setup module orchestrates the multi-step interactive wizard for configuring semantic embedding and LLM providers. It detects GPU/CPU hardware, recommends providers (vLLM, TEI, llama.cpp, OVMS, Ollama), lets users select models, handles Docker container deployment or native binary installation, and saves the resulting configuration. The module is organized into hardware detection, selection dialogs, UI utilities, type definitions, installer routing, i18n support, and infrastructure utilities.

## Data Flow

- **Inputs:** Hardware detection results (CPU features, GPU architecture/VRAM), user selections via interactive prompts, JSON model configs from `config/` directory.
- **Processing:** Provider recommendation based on hardware, model filtering by provider/language compatibility, installation via Docker or native binaries, health checks.
- **Outputs:** `semantic-config.json` with embedding and LLM configuration, installed/running provider services.

## Public API

| Export | Type | Description | Location |
|--------|------|-------------|----------|
| `detectGPU` | function | Detects NVIDIA GPU via nvidia-smi | [`setup-hardware.ts:11-56`](./setup-hardware.ts) |
| `printHardwareInfo` | function | Displays CPU and GPU info | [`setup-hardware.ts:58-86`](./setup-hardware.ts) |
| `installProvider` | function | Routes embedding provider installation | [`setup-installers.ts:34-61`](./setup-installers.ts) |
| `selectLanguage` | function | Interactive code language selection | [`setup-selection.ts:14-31`](./setup-selection.ts) |
| `selectProvider` | function | Interactive provider selection with recommendations | [`setup-selection.ts:115-115`](./setup-selection.ts) |
| `selectModel` | function | Interactive embedding model selection | [`setup-selection.ts:152-286`](./setup-selection.ts) |
| `askEnableLLM` | function | Asks about enabling LLM for AutoDoc | [`setup-llm.ts:162-178`](./setup-llm.ts) |
| `selectLLMProvider` | function | Interactive LLM provider selection | [`setup-llm.ts:184-294`](./setup-llm.ts) |
| `selectLLMModel` | function | Interactive LLM model selection | [`setup-llm.ts:295-295`](./setup-llm.ts) |
| `installLLMProvider` | function | Installs and launches LLM provider | [`setup-llm.ts:300-498`](./setup-llm.ts) |
| `EmbeddingModel` | interface | Embedding model configuration | [`setup-types.ts:5-39`](./setup-types.ts) |
| `ModelsConfig` | interface | All available models and providers config | [`setup-types.ts:41-46`](./setup-types.ts) |
| `GPUInfo` | interface | GPU availability and architecture info | [`setup-types.ts:48-55`](./setup-types.ts) |
| `LLMConfig` | interface | LLM models and providers config | [`setup-types.ts:102-110`](./setup-types.ts) |
| `c` | const | ANSI color codes for console output | [`setup-ui.ts:13-30`](./setup-ui.ts) |
| `printBanner` | function | Displays setup welcome banner | [`setup-ui.ts:27-42`](./setup-ui.ts) |
| `printOK` / `printInfo` / `printWarn` / `printError` | functions | Colored status message printing | [`setup-ui.ts:44-46`](./setup-ui.ts) |
| `prompt` | function | Interactive string input from stdin | [`setup-ui.ts:55-70`](./setup-ui.ts) |
| `AgentDef` | interface | MCP agent configuration definition | [`mcp-installer.ts:33-39`](./mcp-installer.ts) |
| `AgentStatus` | interface | MCP agent installation and runtime status | [`mcp-installer.ts:172-175`](./mcp-installer.ts) |
| `ENTRY_NAME` | const | Constant name for MCP configuration entry | [`mcp-installer.ts:25-25`](./mcp-installer.ts) |
| `getAgents` | function | Retrieves list of available MCP agents | [`mcp-installer.ts:41-166`](./mcp-installer.ts) |
| `stripBom` | function | Removes Byte Order Mark from text content | [`mcp-installer.ts:177-179`](./mcp-installer.ts) |
| `detectAgents` | function | Detects installed MCP agents from configuration files | [`mcp-installer.ts:181-210`](./mcp-installer.ts) |
| `buildJsonEntry` | function | Constructs JSON configuration entry for MCP agent | [`mcp-installer.ts:216-233`](./mcp-installer.ts) |
| `ensureParentDir` | function | Creates parent directory if it does not exist | [`mcp-installer.ts:239-244`](./mcp-installer.ts) |
| `installJson` | function | Installs MCP agent configuration in JSON format | [`mcp-installer.ts:246-280`](./mcp-installer.ts) |
| `installToml` | function | Installs MCP agent configuration in TOML format | [`mcp-installer.ts:280-301`](./mcp-installer.ts) |
| `installToAgent` | function | Routes installation to correct agent configuration format | [`mcp-installer.ts:303-309`](./mcp-installer.ts) |
| `installMcpConfigs` | function | Main orchestrator for MCP agent installation and configuration | [`mcp-installer.ts:315-361`](./mcp-installer.ts) |
| `getCommandForAgent` | function | Generates command string for executing MCP agent | [`mcp-installer.ts:370-380`](./mcp-installer.ts) |
| `performInstall` | function | Executes the actual MCP installation and setup process | [`mcp-installer.ts:374-392`](./mcp-installer.ts) |

## Dependencies

### Internal Modules

| Module | Purpose |
|--------|---------|
| `setup/i18n` | Localized UI strings (English, Russian) |
| `setup/installers` | Provider-specific installation logic |
| `setup/utils` | Docker, NVIDIA toolkit, runtime helpers |

### External Packages

| Package | Purpose |
|---------|---------|
| `node:readline` | Interactive user prompts |
| `node:child_process` | Process spawning for nvidia-smi, Docker |

## Behavioral Properties

| Property | Value |
|----------|-------|
| Supported embedding providers | vLLM, TEI, llama.cpp, OVMS, OVMS-native, Ollama |
| Supported LLM providers | Claude Code, Ollama, TGI, Docker Model Runner |
| UI languages | English, Russian (auto-detected from system locale) |

## Error Handling

Provider installation failures are reported but do not block config saving. Missing Docker or nvidia-smi produce warning messages with installation hints. Health check timeouts log warnings but allow the setup to complete.

## Known Limitations

- GPU detection only supports NVIDIA via nvidia-smi; AMD and Intel GPUs are detected at a basic level.
- Interactive prompts require a TTY; non-interactive mode is not fully supported.
- LLM setup depends on external model config JSON files existing in the `config/` directory.

## Exports



## Files

| File | Description |
|------|-------------|
| `index.ts` | Re-exports all public functions and types |
| `setup-hardware.ts` | GPU and CPU detection, hardware info display |
| `setup-installers.ts` | Routes embedding provider installation |
| `setup-llm.ts` | LLM provider selection and installation |
| `setup-selection.ts` | Interactive dialogs for language, provider, model |
| `setup-types.ts` | TypeScript interfaces for models and providers |
| `setup-ui.ts` | ANSI colors, message printing, interactive input |
| `mcp-installer.ts` | MCP agent detection and installation configuration |