---
module_name: providers
description: "Embedding provider system with factory pattern for multiple LLM backends"
status: active
language: typescript
---

# Providers

> Implements a pluggable embedding provider system supporting 10+ backends (OpenAI, OVMS, Ollama, vLLM, TEI, llama.cpp, MLX, HuggingFace, Cloud.ru) with auto-detection and a unified EmbeddingProvider interface.

## Overview

The providers module uses the factory pattern to create embedding provider instances based on configuration. The factory supports an "auto" mode that probes local ports to detect available inference servers in priority order (MLX on macOS ARM64, then OVMS, llama.cpp, vLLM, TEI). All providers implement the EmbeddingProvider interface with embed(), optional embedBatch(), and extended capabilities like rerank and score. The base module defines provider types, capability interfaces, and the common logger contract.

## Data Flow

- **Inputs**: ProviderFactoryOptions with provider kind, model name, and per-provider configuration (URLs, API keys, batch sizes).
- **Processing**: createProvider() auto-detects or directly instantiates the requested provider, initializing HTTP connections and health checks.
- **Outputs**: EmbeddingProvider instance ready for embed() and embedBatch() calls returning Float32Array vectors.

## Public API

| Export | Type | Description | Location |
|--------|------|-------------|----------|
| `createProvider` | function | Factory function creating configured EmbeddingProvider instances | [`factory.ts:218-227`](./factory.ts) |
| `ProviderFactoryOptions` | interface | Configuration for provider creation with per-provider settings | [`factory.ts:128-216`](./factory.ts) |
| `EmbeddingProvider` | interface | Common interface: embed(), embedBatch(), initialize(), getDimension() | [`base.ts:87-118`](./base.ts) |
| `ProviderKind` | type | Union of all supported provider names including "auto" | [`base.ts:1-22`](./base.ts) |
| `ProviderInfo` | interface | Provider metadata: name, model, dimension, batch support | [`base.ts:14-22`](./base.ts) |
| `ProviderCapabilities` | interface | Feature flags: embeddings, rerank, score, classify | [`base.ts:65-76`](./base.ts) |
| `RerankResult` | interface | Reranking result with index, score, and text | [`base.ts:42-45`](./base.ts) |
| `ScoreResult` | interface | Pairwise similarity score result | [`base.ts:62-65`](./base.ts) |

## Dependencies

### Internal Modules

| Module | Purpose |
|--------|---------|
| `logging` | Structured logging |
| `utils/provider-logger` | Provider-specific logger factory |
| `semantic/llamacpp-server-manager` | llama.cpp server port constant |
| `semantic/mlx-server-manager` | MLX server port constant |
| `semantic/ovms-native-manager` | OVMS native port constants |

### External Packages

| Package | Purpose |
|---------|---------|
| (none) | HTTP fetch is used via global fetch API |

## Behavioral Properties

| Property | Value |
|----------|-------|
| Auto-detection order (macOS ARM64) | MLX (8087) > OVMS (8083) > llama.cpp (8085) > vLLM (8000) > TEI (8081) |
| Auto-detection order (other) | OVMS (8083) > llama.cpp (8085) > vLLM (8000) > TEI (8081) |
| Health check timeout | 2 seconds per provider probe |

## Error Handling

Auto-detection catches connection failures for each provider and moves to the next. If no provider is available, throws with a detailed message listing all supported providers and setup instructions. Individual provider constructors validate required options (e.g., API keys for OpenAI and HuggingFace).

## Known Limitations

- Auto-detection probes ports sequentially, adding up to 10 seconds latency if all providers are unavailable.
- OVMS gRPC client uses protobuf serialization which requires proto files in the proto/ subdirectory.
- No automatic model dimension detection; callers must know the correct dimension for their model.

## Files

| File | Description |
|------|-------------|
| `base.ts` | ProviderKind type, EmbeddingProvider interface, ProviderCapabilities, and scoring types |
| `cloudru-provider.ts` | Cloud.ru cloud model embedding provider |
| `factory.ts` | Provider factory with auto-detection and per-provider configuration |
| `http-engine.ts` | Shared HTTP engine for provider API requests |
| `huggingface-provider.ts` | HuggingFace Inference API embedding provider |
| `llamacpp-provider.ts` | llama.cpp native GGUF model embedding provider with auto-start |
| `mlx-provider.ts` | Apple MLX embedding provider for macOS ARM64 Metal GPU |
| `ollama-provider.ts` | Ollama local model embedding provider with auto-pull support |
| `openai-provider.ts` | OpenAI API embedding provider |
| `ovms-container.ts` | OVMS Docker container management utilities |
| `ovms-grpc-client.ts` | OVMS gRPC client for binary protobuf communication |
| `ovms-provider.ts` | OpenVINO Model Server provider with REST and gRPC support |
| `ovms-utils.ts` | OVMS utility functions for response parsing |
| `proto` | Protocol buffer definitions for OVMS gRPC |
| `tei-provider.ts` | Text Embeddings Inference (TEI) Docker provider |
| `vllm-provider.ts` | vLLM Docker container embedding provider |
