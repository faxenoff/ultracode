# Project Dependencies

## Overview

This document describes all dependencies of UltraCode v3.1+, their purpose, and versions.

## Runtime Dependencies

### System Core

| Package | Version | Purpose |
|---------|---------|---------|
| `@modelcontextprotocol/sdk` | ^1.25.2 | MCP protocol, JSON-RPC server |
| `better-sqlite3` | ^11.7.0 | Native SQLite driver (Node.js); Bun uses built-in bun:sqlite |
| `zod` | ^4.3.5 | Schema validation, JSON Schema generation |
| `lru-cache` | ^11.2.4 | LRU cache for parsers and embeddings |
| `nanoid` | ^5.1.6 | Unique ID generation |
| `graphology` | ^0.26.0 | In-memory graph, traversal and analysis |
| `graphology-shortest-path` | ^2.1.0 | Shortest path search in graph |

### Semantic Layer

| Package | Version | Purpose |
|---------|---------|---------|
| `@huggingface/inference` | ^4.13.4 | HuggingFace API client |

**Embeddings via external servers:**

- **llama.cpp** — native GGUF server (port 8085), CUDA/Vulkan/CPU
- **OVMS** — OpenVINO Model Server (port 8083), Intel iGPU/CPU
- **vLLM** — Docker container (port 8000), NVIDIA GPU
- **TEI** — Docker container (port 8081), HuggingFace models
- **Ollama** — local LLM (port 11434), easy setup

> See ~~[EMBEDDINGS_PROVIDERS.md](../docs/EMBEDDINGS_PROVIDERS.md)~~ (deleted) for detailed provider documentation.

### Utilities

| Package | Version | Purpose |
|---------|---------|---------|
| `yaml` | ^2.8.2 | YAML config parsing |
| `eslint` | ^9.39.1 | JS/TS linting (validate_file) |
| `@types/eslint` | ^9.6.1 | TypeScript types for ESLint |

## Development Dependencies

### Build

| Package | Version | Purpose |
|---------|---------|---------|
| `tsup` | ^8.5.1 | TypeScript bundler |
| `typescript` | ^5.9.3 | TypeScript compiler |
| `@rollup/rollup-win32-x64-msvc` | ^4.53.3 | Rollup for Windows |
| `cmake-js` | ^7.4.0 | Native module build |
| `node-addon-api` | ^8.5.0 | N-API for native modules |
| `node-gyp` | ^12.1.0 | C++ addon build |

### Code Quality

| Package | Version | Purpose |
|---------|---------|---------|
| `@biomejs/biome` | ^2.3.8 | Linter and formatter |
| `@biomejs/cli-win32-x64` | ^2.3.8 | Biome CLI for Windows |
| `@commitlint/cli` | ^20.2.0 | Commit message linting |
| `@commitlint/config-conventional` | ^20.2.0 | Conventional Commits config |
| `lint-staged` | ^16.2.7 | Pre-commit linting |
| `simple-git-hooks` | ^2.13.1 | Git hooks |

### Testing

| Package | Version | Purpose |
|---------|---------|---------|
| `@types/bun` | latest | Bun test runner types |
| `@types/node` | ^24.10.1 | Node.js types |
| `@types/better-sqlite3` | ^7.6.13 | SQLite types |
| `minimatch` | ^10.1.1 | Glob matching for tests |

## Optional Dependencies

| Package | Version | Purpose | Status |
|---------|---------|---------|--------|
| `@webgpu/node` | npm:null@^2.0.0 | WebGPU for Node.js | **Stub** — empty package for transformers.js |
| `@webgpu/types` | ^0.1.69 | WebGPU TypeScript types | Types only, no executable code |
| `webgpu` | ^0.3.8 | Dawn WebGPU runtime | **Working** — used by WebGPUBackend |
| `faiss-napi` | ^0.10.3 | FAISS vector index | Working, HNSW/IVF indexes |

### WebGPU — Details

**`webgpu-backend.ts`** — a full GPU backend with a WGSL compute shader for cosine similarity.

Backend selection order (`backend-selector.ts`):

| Priority | Backend | Condition |
|----------|---------|-----------|
| 100 | CUDA Native | NVIDIA + Node.js runtime |
| 98-100 | CUDA Worker | NVIDIA (via subprocess for Bun) |
| 95 | Metal | Apple Silicon (macOS ARM64) |
| **80** | **WebGPU** | **When CUDA/Metal are unavailable** |
| 50 | WASM SIMD | CPU fallback |
| 1 | Pure JS | Always available |

> **Conclusion**: WebGPU is a fallback option for systems without NVIDIA/Apple Silicon.
> In practice it is rarely used: CUDA/Metal have higher priority.
> Dawn WebGPU also has compatibility issues with newer GPUs (Blackwell).

## System Requirements

### Node.js

```json
{
  "engines": {
    "node": ">=24.0.0"
  }
}
```

### External Parsers (optional)

| Language | Requirement | Version |
|----------|-------------|---------|
| Python | Python runtime | 3.8+ |
| Java/Kotlin | JRE | 11+ |
| Go | Go toolchain | 1.18+ |
| Rust | Rust toolchain | stable |
| C/C++ | Clang | 14+ |
| Swift | Swift toolchain | 5.5+ |
| C# | .NET SDK | 6.0+ |

## Dependency Graph

```
ultracode
├── Core
│   ├── @modelcontextprotocol/sdk ── JSON-RPC, MCP protocol
│   ├── better-sqlite3 ───────────── Native SQLite (Node.js) / bun:sqlite (Bun)
│   ├── graphology ───────────────── In-memory graph + algorithms
│   └── zod ──────────────────────── Schema validation
│
├── Semantic (external servers)
│   ├── llama.cpp ────────────────── Native GGUF (CUDA/Vulkan/CPU)
│   ├── OVMS ─────────────────────── OpenVINO Model Server (Intel)
│   ├── vLLM ─────────────────────── NVIDIA GPU Docker
│   ├── TEI ──────────────────────── HuggingFace Docker
│   ├── Ollama ───────────────────── Local LLM
│   └── @huggingface/inference ───── HF Cloud API
│
├── GPU Backends (priority)
│   ├── CUDA Native ──────────────── NVIDIA + Node.js (100)
│   ├── CUDA Worker ──────────────── NVIDIA + Bun (98-100)
│   ├── Metal ────────────────────── Apple Silicon (95)
│   ├── WebGPU (Dawn) ────────────── Universal fallback (80)
│   ├── WASM SIMD ────────────────── CPU SIMD (50)
│   └── Pure JS ──────────────────── Always available (1)
│
├── Storage
│   ├── lru-cache ────────────────── In-memory caching
│   └── faiss-napi ───────────────── HNSW/IVF vector index (optional)
│
└── Utils
    ├── yaml ─────────────────────── Config parsing
    ├── nanoid ───────────────────── ID generation
    ├── oxc-parser ───────────────── Fast JS/TS parsing
    └── eslint ───────────────────── JS/TS validation
```

## Versioning

### Overrides

Current overrides in package.json:

```json
{
  "overrides": {
    "boolean": "3.2.0",
    "sharp": "npm:null@^2.0.0",
    "onnxruntime-node": "npm:null@^2.0.0"
  }
}
```

| Override | Reason |
|----------|--------|
| `boolean@3.2.0` | Deprecated transitive dependency, package is unsupported but works |
| `sharp → null` | Not needed — only tokenization from transformers.js is used |
| `onnxruntime-node → null` | Replaced by OVMS Docker for inference |

### Trusted Dependencies

```json
{
  "trustedDependencies": [
    "cbor-extract",
    "esbuild",
    "faiss-napi",
    "protobufjs",
    "webgpu"
  ]
}
```

> Packages with postinstall scripts for building native modules.

## Updating Dependencies

### Safe Update

```bash
# Check outdated packages
npm outdated

# Update patch/minor versions
npm update

# Security audit
npm audit
npm audit fix
```

### Critical Dependencies

Full testing is required when updating the following packages:

1. **better-sqlite3** — Native SQLite driver, verify prebuilt binaries
2. **@modelcontextprotocol/sdk** — API changes, verify MCP compatibility
3. **zod** — breaking changes in v4, verify validation
4. **faiss-napi** — native extension, verify HNSW indexes
5. **oxc-parser** — JS/TS parser, verify AST compatibility

## Related Documents

- [→ ARCHITECTURE.md](./architecture.md) — system architecture
- [→ DEPLOYMENT.md](./deployment.md) — build and deployment
- [→ PROCESSES.md](./processes.md) — technical processes
