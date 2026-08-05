---
module_name: llm
description: "LLM provider abstraction and LLM-powered documentation generation"
status: active
language: typescript
---

# LLM

> Provides a unified LLM provider abstraction supporting multiple backends (Ollama, TGI, OpenAI, Docker Model Runner, llama.cpp, Claude Code CLI) and uses them to generate, improve, and batch-produce module documentation from code.

## Overview

The llm module consists of two layers: a provider abstraction that normalizes access to six different LLM backends behind a common `LLMProvider` interface, and a documentation writer that uses any provider to generate module docs, export descriptions, architecture overviews, and doc improvements. The provider layer handles auto-detection of available backends, model selection (preferring code-specialized models), health checks, and configuration from `semantic-config.json`. The doc writer constructs structured prompts with language awareness and cleans LLM output artifacts.

## Data Flow

- **Inputs**: Module metadata (name, files, exports), optional code snippets, language preference, and LLM provider configuration.
- **Processing**: `detectLLMProviders` probes all configured/default backends in parallel, selects the best available. `batchGenerateDocs` sends per-module prompts to the selected provider with system prompts, temperature, and token limits. Responses are cleaned of tokenizer artifacts and formatted.
- **Outputs**: Generated markdown documentation strings per module path (`Map<string, string>`), individual export descriptions, or improved documentation text.

## Public API

| Export | Type | Description | Location |
|--------|------|-------------|----------|
| `generateModuleDoc` | function | Generates full AUTODOC.md content for a single module via LLM | [`doc-writer.ts:41-67`](./doc-writer.ts) |
| `generateExportDoc` | function | Generates a 1-2 sentence description for a single export | [`doc-writer.ts:84-101`](./doc-writer.ts) |
| `improveDoc` | function | Improves existing documentation using LLM with optional code context | [`doc-writer.ts:98-114`](./doc-writer.ts) |
| `generateArchitectureDoc` | function | Generates project architecture overview from module list | [`doc-writer.ts:127-156`](./doc-writer.ts) |
| `batchGenerateDocs` | function | Batch generates docs for multiple modules with progress callback | [`doc-writer.ts:252-259`](./doc-writer.ts) |
| `LLMProvider` | interface | Common interface for all LLM backends (generate, checkHealth, listModels) | [`llm-provider.ts:36-44`](./llm-provider.ts) |
| `LLMConfig` | interface | Configuration for creating an LLM provider (provider type, baseUrl, model, apiKey) | [`llm-provider.ts:17-26`](./llm-provider.ts) |
| `LLMResponse` | interface | Response from LLM generation (text, optional usage stats) | [`llm-provider.ts:28-34`](./llm-provider.ts) |
| `GenerateOptions` | interface | Options for generate() calls (maxTokens, temperature, stopSequences, systemPrompt) | [`llm-provider.ts:46-51`](./llm-provider.ts) |
| `OllamaProvider` | class | Ollama local LLM backend with auto model selection | [`llm-provider.ts:73-255`](./llm-provider.ts) |
| `TGIProvider` | class | HuggingFace Text Generation Inference backend | [`llm-provider.ts:189-416`](./llm-provider.ts) |
| `OpenAIProvider` | class | OpenAI-compatible API backend (works with vLLM, LocalAI, etc.) | [`llm-provider.ts:260-538`](./llm-provider.ts) |
| `createLLMProvider` | function | Factory function to create a provider from LLMConfig | [`llm-provider.ts:1307-1439`](./llm-provider.ts) |
| `detectLLMProviders` | function | Auto-detects all available LLM providers and selects recommended one | [`llm-provider.ts:1202-1237`](./llm-provider.ts) |

## Dependencies

### Internal Modules

| Module | Purpose |
|--------|---------|
| `autodoc/generator` | `ModuleInfo` type for module metadata input |
| `logging` | Structured logging for provider detection and generation |
| `utils/runtime-detection` | Bun runtime check for Claude Code CLI path resolution |
| `semantic/llamacpp-server-manager` | Auto-start llama.cpp server for LlamaCppLLMProvider |

### External Packages

| Package | Purpose |
|---------|---------|
| `node:child_process` | Claude Code CLI spawning, nvidia-smi/rocm-smi VRAM detection |
| `node:fs` | Config file and model path lookups |
| `node:os` | Home directory for config/model paths |
| `node:path` | Cross-platform path resolution |

## Behavioral Properties

| Property | Value |
|----------|-------|
| Provider priority | Config > Claude Code > Docker Model Runner > Ollama > llama.cpp > TGI > OpenAI |
| Default generation timeout | 120 seconds |
| Preferred models | devstral-small, qwen3-coder:30b, qwen2.5-coder:14b, and 7 more code-specialized models |
| Batch concurrency | 1 for Claude Code (rate limits), 2 for other providers |

## Error Handling

Provider health checks use 5-second timeouts and return `false` on failure without throwing. `batchGenerateDocs` catches per-module LLM errors and falls back to basic template content. `detectLLMProviders` logs warnings when a configured provider is unavailable. The doc writer strips LLM tokenizer artifacts (DeepSeek, etc.) and meta-text preamble/postamble from responses.

## Known Limitations

- LlamaCppLLMProvider auto-start only works when explicitly configured (not as fallback) to avoid unwanted server launches.
- VRAM detection is limited to NVIDIA (nvidia-smi) and AMD (rocm-smi); Intel GPUs are not detected.
- Claude Code CLI provider requires the `@anthropic-ai/claude-code` package to be globally installed.

## Exports

- `batchGenerateDocs`
- `generateArchitectureDoc`
- `generateExportDoc`
- `generateModuleDoc`
- `improveDoc`
- `createLLMProvider`
- `detectLLMProviders`
- `OllamaProvider`
- `OpenAIProvider`
- `TGIProvider`

## Files

| File | Description |
|------|-------------|
| [`doc-writer.ts`](./doc-writer.ts) | LLM-powered documentation generation: module docs, export docs, architecture, batch generation, response cleaning |
| [`llm-provider.ts`](./llm-provider.ts) | Provider abstraction with 6 backends (Ollama, TGI, OpenAI, Docker Model Runner, llama.cpp, Claude Code), auto-detection, config loading, VRAM detection |
| [`index.ts`](./index.ts) | Module barrel file re-exporting doc-writer functions and llm-provider classes/types |
