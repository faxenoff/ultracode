# Build and Deployment

## Overview

This document describes the build, configuration, and deployment processes for UltraCode.

## Build

### Requirements

- **Node.js**: >=24.0.0
- **Bun**: recommended for development
- **Python**: 3.8+ (for the Python AST parser)
- **C++ Compiler**: for optional native modules (faiss-napi, CUDA)

### Build Commands

```bash
# Main build TypeScript → JavaScript
npm run build

# Build with watch mode
npm run build:watch

# Full build (TS + WASM)
npm run build:full

# Type checking without emit
npm run typecheck
```

### Standalone Binaries

```bash
# Current platform
npm run build:standalone

# Windows x64
npm run build:standalone:win

# Linux x64
npm run build:standalone:linux

# macOS ARM64
npm run build:standalone:mac
```

### Native Modules

```bash
# CUDA support (optional)
npm run build:cuda

# Communication module
npm run build:comm
```

## Configuration

### Environment Variables

| Variable | Description | Default Value |
|----------|-------------|---------------|
| `MCP_DEBUG` | Enable debug mode | `0` |
| `MCP_DEBUG_DISABLE_SEMANTIC` | Disable semantics | `0` |
| `MCP_EMBEDDING_PROVIDER` | Embedding provider | `auto` |
| `MCP_EMBEDDING_MODEL` | Embedding model | auto-detect |
| `MCP_LOG_LEVEL` | Log level | `info` |
| `OLLAMA_HOST` | Ollama API URL | ~~`http://localhost:11434`~~ (deleted) |
| `TEI_ENDPOINT` | TEI API URL | ~~`http://localhost:8080`~~ (deleted) |
| `OPENAI_API_KEY` | OpenAI API key | — |
| `HF_TOKEN` | HuggingFace token | — |

### Configuration Files

```
config/
├── embedding-models.json      # Embedding models
├── embedding-models.schema.json # JSON Schema
└── llm-models.json            # LLM models for AutoDoc
```

### MCP Server Config (claude_desktop_config.json)

```json
{
  "mcpServers": {
    "ultracode": {
      "command": "node",
      "args": ["/path/to/ultracode-mcp/dist/index.js"],
      "env": {
        "MCP_EMBEDDING_PROVIDER": "openvino",
        "MCP_LOG_LEVEL": "info"
      }
    }
  }
}
```

### Bun Configuration

```json
{
  "mcpServers": {
    "ultracode": {
      "command": "bun",
      "args": ["run", "/path/to/ultracode-mcp/src/index.ts"]
    }
  }
}
```

## Deployment

### NPM Publishing

```bash
# Preparation (automatic via prepublishOnly)
npm run build

# Publishing
npm publish
```

### Included Files

```json
{
  "files": [
    "bin/**/*.js",
    "dist/**/*.js",
    "dist/**/*.wasm",
    "dist/**/*.d.ts",
    "external-libs/cuda-*/*.node",
    "scripts/setup-*.sh",
    "scripts/setup-*.cmd",
    "config/*.json",
    "prompts/**/*.md"
  ]
}
```

### Docker (optional)

```dockerfile
FROM node:24-slim

WORKDIR /app

# Install dependencies for the Python parser (optional)
RUN apt-get update && apt-get install -y \
    python3 \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci --production --ignore-scripts

COPY dist/ ./dist/
COPY config/ ./config/

ENV MCP_EMBEDDING_PROVIDER=llamacpp
ENV NODE_ENV=production

CMD ["node", "dist/index.js"]
```

> **Note**: `--ignore-scripts` skips building optional native modules (faiss-napi, webgpu).
> For GPU acceleration, use external servers (llama.cpp, TEI, OVMS).

## Embedding Setup

### Interactive Setup

```bash
# Windows
scripts/setup-embeddings.cmd

# Linux/macOS
./scripts/setup-embeddings.sh
```

### Provider Selection

```
┌─────────────────────────────────────────────────────────────────┐
│                    Provider Selection                            │
└─────────────────────────────────────────────────────────────────┘

1. llama.cpp (recommended)
   - Native GGUF server
   - CUDA/Vulkan/CPU
   - 500-2000+ chunks/s (GPU)
   - Port 8085

2. TEI (Text Embeddings Inference)
   - Docker + NVIDIA GPU
   - 1000+ chunks/s
   - High quality
   - Port 8081

3. OVMS (OpenVINO Model Server)
   - Docker, Intel iGPU/CPU
   - 300-500 chunks/s
   - Port 8083

4. Ollama
   - Easy setup
   - CPU/GPU
   - 100-300 chunks/s
   - Port 11434

5. vLLM
   - Docker + NVIDIA GPU
   - High performance
   - Port 8000

6. Memory (fallback)
   - No ML
   - Hash-based similarity
   - For testing
```

### llama.cpp Setup (recommended)

```bash
# Automatic installation
pwsh scripts/setup-semantic-embedding.ps1

# Or manual setup
export MCP_EMBEDDING_PROVIDER=llamacpp
export LLAMACPP_URL=http://localhost:8085

# Start the server (CUDA)
./llama-server -m model.gguf --port 8085 --embedding
```

### TEI Setup

```bash
# Start Docker container
docker run -d --gpus all \
  -p 8081:80 \
  ghcr.io/huggingface/text-embeddings-inference:latest \
  --model-id sentence-transformers/all-MiniLM-L6-v2

# Configuration
export MCP_EMBEDDING_PROVIDER=tei
export TEI_ENDPOINT=http://localhost:8081
```

### OVMS (OpenVINO) Setup

```bash
# Automatic installation
pwsh scripts/setup-tei.ps1

# Configuration
export MCP_EMBEDDING_PROVIDER=openvino
export OVMS_ENDPOINT=http://localhost:8083
```

### Ollama Setup

```bash
# Install the model
ollama pull nomic-embed-text

# Configuration
export MCP_EMBEDDING_PROVIDER=ollama
export OLLAMA_HOST=http://localhost:11434
```

## CI/CD

### GitHub Actions (example)

```yaml
name: CI

on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '24'

      - run: npm ci
      - run: npm run build
      - run: npm run typecheck
      - run: npm run lint
      - run: npm test

  publish:
    needs: build
    if: startsWith(github.ref, 'refs/tags/')
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '24'
          registry-url: 'https://registry.npmjs.org'
      - run: npm ci
      - run: npm run build
      - run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### Pre-commit hooks

```json
{
  "simple-git-hooks": {
    "pre-commit": "npx lint-staged && npm run typecheck"
  },
  "lint-staged": {
    "*.{ts,tsx,js,jsx,json,css,md,yml,yaml}": "biome check --write"
  }
}
```

## Testing

### Running Tests

```bash
# All tests
npm test

# Watch mode
npm run test:watch

# With coverage
npm run test:coverage

# CI mode (bail on first failure)
npm run test:ci
```

### Smoke Tests

```bash
# Graph health check
npm run smoke

# With cleanup
npm run smoke:clean

# Semantic smoke test
npm run smoke:semantic
```

### Benchmarks

```bash
# All benchmarks
npm run bench

# Large projects
npm run bench:large

# SIMD operations
npm run bench:simd

# Worker threads
npm run bench:workers
```

## Monitoring

### Logging

```typescript
// Log levels
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

// Structured logs
logger.info('INDEXING', 'Started indexing', {
  directory: '/path/to/project',
  fileCount: 1000
}, requestId);
```

### Agent Metrics

```bash
# MCP tool
ultracode get_agent_metrics
```

Returns:
- Number of processed tasks
- Average processing time
- Queue size
- Error rate

## Deployment Procedures

~~[→ docs/deployment/deployment.md](../docs/deployment/deployment.md)~~ (deleted)

### Developer Setup

**Linux/macOS:**
```bash
chmod +x scripts/dev-setup.sh
./scripts/dev-setup.sh
```

**Windows:**
```powershell
PowerShell -ExecutionPolicy Bypass -File scripts\dev-setup.ps1
```

Developer setup installs: Node.js dependencies, Rust toolchain + wasm-pack, CUDA Toolkit (if available), WebGPU support, builds all backends, and runs tests.

### Production Installation

```bash
# From npm
npm install @er77/ultracode

# From git
npm install https://github.com/faxenoff/ultracode.git
```

On `npm install`, the `postinstall` script automatically detects available build tools, builds available GPU backends (WASM, CUDA if present), and gracefully falls back if build tools are unavailable.

### Runtime Backend Auto-Detection

At startup, `BackendSelector` automatically selects the optimal compute backend in priority order:

| Priority | Backend | Speedup | Requirements |
|----------|---------|---------|-------------|
| 100 | CUDA Native | 100-200x | NVIDIA GPU + CUDA addon |
| 80 | WebGPU Compute | 50-100x | Any GPU + webgpu package |
| 50 | WASM SIMD | 4-8x | WASM module built |
| 1 | Pure JS (Loop Unrolling) | 1.45x | None (always works) |

### What Ships in the npm Package

**Always included:** compiled TypeScript (`dist/`), TypeScript source, Rust WASM source, CUDA C++ source, build scripts, configuration files.

**NOT included (built on client):** compiled WASM module (`wasm/vector-ops/pkg/`), CUDA native addon (`build/Release/`), WebGPU optional dependency. CUDA native addons are platform-specific and must be built on the target machine. WASM modules are platform-independent but are built via optional postinstall.

### Postinstall Script Logic

~~`scripts/postinstall.js`~~ (deleted) checks the environment and builds what is available:
- Rust + wasm-pack detected: builds WASM backend
- CUDA Toolkit + CMake detected: builds CUDA backend
- Any GPU detected: installs WebGPU support
- Nothing available: Pure JS backend (always works)

The script never fails on errors -- build failures produce warnings, missing tools cause skips, and CI environments can skip GPU builds via `SKIP_GPU_BUILD=1`.

### Distribution Strategies

**Source-only (recommended):** Publish TypeScript/Rust/CUDA source with build scripts. Users build on their machine via postinstall. Produces optimal binaries, small package size, always compatible with the Node.js version.

**Pre-built WASM (optional):** Include compiled WASM module in the package for instant 4-8x speedup without requiring Rust. Adds ~100KB to package size.

**Multiple packages (advanced):** Split into core (`@er77/ultracode`), WASM backend (`@er77/ultracode-wasm`), and CUDA backend (`@er77/ultracode-cuda`) for user-controlled dependencies.

### CI/CD Configuration

Skip GPU builds in CI:
```yaml
env:
  SKIP_GPU_BUILD: "1"
```

For GPU testing, use self-hosted runners with NVIDIA GPUs or install Rust for WASM testing.

## NPM Publishing

~~[→ docs/deployment/NPM_PUBLISHING.md](../docs/deployment/NPM_PUBLISHING.md)~~ (deleted)

### Package Preparation Checklist

1. Verify `package.json` fields: `name`, `version` (semver), `description`, `keywords`, `license`, `repository`, `files`
2. Build the project: `npm run build` (or `.\scripts\build.cmd` on Windows)
3. Verify build output: `dist/index.js`, WASM modules, CUDA module (optional)
4. Build tree-sitter prebuilds: `npm run build:tree-sitter` (required for Node.js 24+ due to C++20 requirement)

### Packaging

```bash
# Dry run (preview what will be included)
npm pack --dry-run

# PowerShell script with checks (recommended)
.\scripts\pack-npm.ps1           # Preview
.\scripts\pack-npm.ps1 -Apply    # Create .tgz in ./dist-packages/
```

Expected package size: ~30-35 MB with tree-sitter prebuilds.

### First Publication

```bash
# Login to npm
npm login
npm whoami    # verify

# Check name availability
npm view ultracode  # should return 404

# Publish
npm publish --access public

# Or from .tgz
npm publish ./dist-packages/ultracode-1.0.0.tgz --access public
```

### Version Updates (Semver)

```bash
npm version patch    # 1.0.0 -> 1.0.1 (bugfix)
npm version minor    # 1.0.0 -> 1.1.0 (new feature)
npm version major    # 1.0.0 -> 2.0.0 (breaking change)
npm version prerelease --preid=beta  # 1.0.0 -> 1.0.1-beta.0
```

These commands automatically update `package.json`, create a git commit, and create a git tag.

### Standard Update Process

```bash
git status                    # Verify clean state
npm version patch             # Bump version
.\scripts\build.cmd           # Build
.\scripts\pack-npm.ps1 -Apply # Package (optional, for verification)
npm publish                   # Publish
git push origin main --tags   # Push changes
```

### Beta/Canary Releases

```bash
# Beta
npm version prerelease --preid=beta
npm publish --tag beta
# Install: npm install ultracode@beta

# Canary (per-commit)
npm version 1.0.1-canary.$(git rev-parse --short HEAD)
npm publish --tag canary
```

### Automated Publishing via GitHub Actions

Create `.github/workflows/publish.yml` triggered by version tags (`v*.*.*`):

```yaml
on:
  push:
    tags: ['v*.*.*']
jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '24'
          registry-url: 'https://registry.npmjs.org'
      - run: npm ci
      - run: npm run build
      - run: npm test
      - run: npm publish --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

Setup: Create an npm automation token at npmjs.com, add it as `NPM_TOKEN` in GitHub repository secrets.

### Rollback

```bash
# Unpublish a version (within 72 hours)
npm unpublish ultracode@1.0.1

# Deprecate a version (preferred)
npm deprecate ultracode@1.0.1 "Critical bug, use 1.0.2+"
```

### Testing Before Publication

1. **Local .tgz install**: `npm install /path/to/dist-packages/ultracode-1.0.0.tgz` in a test project
2. **npm link**: `npm link` in package dir, `npm link ultracode` in test project
3. **Docker test**: Build a minimal `node:24-alpine` image that installs the .tgz
4. **Cross-platform**: Test on Linux via Docker to verify tree-sitter prebuilds

### Pre-Publication Checklist

- [ ] All tests pass (`npm test`)
- [ ] Code builds without errors (`npm run build`)
- [ ] `package.json` contains correct metadata
- [ ] `README.md` is updated
- [ ] Version updated (`npm version`)
- [ ] Tree-sitter prebuilds built (`npm run build:tree-sitter`)
- [ ] Package packed and verified (`.\scripts\pack-npm.ps1`)
- [ ] Package size is acceptable (~30-35 MB with prebuilds)
- [ ] Local installation from .tgz verified
- [ ] Git changes committed, tag created
- [ ] Logged into npm (`npm whoami`)

## Related Documents

- [→ ARCHITECTURE.md](./architecture.md) — system architecture
- [→ DEPENDENCIES.md](./dependencies.md) — dependencies
- [→ PROCESSES.md](./processes.md) — technical processes
