```
         ██  ██
         ██  ██  ██    ██████ █████▄  ▄████▄
         ██  ██  ██      ██   ██▄▄██▄ ██▄▄██
         ██  ██  ██      ██   ██   ██ ██  ██
         ██  ██  ██████  ██   ██   ██ ██  ██
         ▀████▀          ▄████ ▄████▄ █████▄ █████
                         ██    ██  ██ ██  ██ ██▄▄▄
                         ▀████ ▀████▀ █████▀ ██▄▄▄

```

[![npm version](https://badge.fury.io/js/ultracode.svg)](https://www.npmjs.com/package/ultracode)
[![License: AGPL-3.0 / Commercial](https://img.shields.io/badge/License-AGPL--3.0_|_Commercial-blue.svg)](LICENSE)
[![Bun](https://img.shields.io/badge/bun-%3E%3D1.3.2-f472b6)](https://bun.sh)
[![Node.js](https://img.shields.io/badge/node-%3E%3D24.0.0-brightgreen)](https://nodejs.org/)

# Codebase RAG for Fast and Accurate Code Work

🌐 **Language**: [EN] | [RU](./README_ru.md)

---

Reduces time and token costs by up to 90% when working with code through AI agents. Code search, analysis, and modification operate on a complete code structure graph database. Local embedding models enable flexible queries with immediate verification and refinement.

**Full indexing of a medium-sized project takes 3 seconds**. Incremental indexing of changes happens on the fly.

| | ❌ Regular AI Agent Work | ✅ Work via UltraCode |
|---|---|---|
| **Search** | AI agent uses grep/replace for full-text keyword search. Reads and analyzes found files entirely, then follows file chains. <br />A simple task in a large project takes **30 minutes and 1M+ tokens**. And it won't find everything. | AI agent queries UltraCode and instantly receives complete and accurate information with line-of-code references. Semantics find even non-obvious connections. <br />Query executes in **100ms and returns 5K tokens** (18,000x faster, 200x cheaper). |
| **Editing** | AI agent edits files "blindly". Instead of careful modification, it goes through 10-20 iterations: breaks → checks → fixes → breaks. Plus dozens of requests to find bash/pwsh commands. <br />Takes **up to 1 hour and 2M+ tokens**. | UltraCode precisely modifies code at the structure level + linting + formatting + impact analysis with local tracing. If something breaks — reports it in the same response. <br />**18,000x faster, 200x cheaper.** |
| **Memory** | AI agent forgets what it did and recreates the same functionality next to existing code. Or debugs a function for hours that it disabled itself. <br />Takes **many hours and 10M+ tokens**. | Through UltraCode, the agent gets the complete code structure in compact form. AutoDoc automatically maintains documentation. Agent won't fall into the forgetfulness trap. <br />Everything correct immediately. |
| **Git** | When switching branches or making changes — agent won't detect this and will continue working with outdated code representation. <br />Need to forcefully trigger re-analysis. | All queries work with current code. Switch branches, modify files — incremental indexing of graph and semantics happens instantly. <br />Nothing additional needed, not even thinking about it. |

# Features

MCP server provides **72 tools** for code analysis and modification.

## Search and Navigation

| Tool | Description |
|------|-------------|
| [**semantic_search**](.autodoc/features/search.md#semantic_search) | Semantic search by meaning with filters (complexity, flow, docs) |
| [**pattern_search**](.autodoc/features/search.md#pattern_search) | Advanced search: regex, semantic, hybrid |
| [**query**](.autodoc/features/search.md#query) | NLP queries in natural language about code |
| [**find_similar_code**](.autodoc/features/search.md#find_similar_code) | Find functions with similar logic |
| [**cross_language_search**](.autodoc/features/search.md#cross_language_search) | Unified search across all project languages |
| [**find_related_concepts**](.autodoc/features/search.md#find_related_concepts) | Find related concepts |

## Code Analysis

| Tool | Description |
|------|-------------|
| [**analyze_code_impact**](.autodoc/features/analysis.md#analyze_code_impact) | Impact analysis — what will break on modification |
| [**find_duplicates**](.autodoc/features/analysis.md#find_duplicates) | Semantic code clone detection |
| [**jscpd_detect_clones**](.autodoc/features/analysis.md#jscpd_detect_clones) | jscpd-based clone detector |
| [**suggest_refactoring**](.autodoc/features/analysis.md#suggest_refactoring) | AI-powered code improvement suggestions |
| [**analyze_hotspots**](.autodoc/features/analysis.md#analyze_hotspots) | Complex areas with high cyclomatic complexity |
| [**analyze_state_chaos**](.autodoc/features/analysis.md#analyze_state_chaos) | Analysis of tangled data dependencies |
| [**analyze_swagger_impact**](.autodoc/features/swagger.md#analyze_swagger_impact) | Swagger/OpenAPI spec change impact analysis |
| [**detect_technology_stack**](.autodoc/features/analysis.md#detect_technology_stack) | Project technology stack detection |
| [**detect_patterns**](.autodoc/features/patterns.md#detect_patterns) | Detect anti-patterns, best-patterns, code smells, and optimization opportunities with semantic validation |
| [**check_entity_patterns**](.autodoc/features/patterns.md#check_entity_patterns) | Check specific entity for pattern matches with confidence scores |
| [**graph_metrics**](.autodoc/features/analysis.md#graph_metrics) | PageRank, Louvain community detection, centrality analysis, and bus factor for architecture understanding |
| [**taint_analysis**](.autodoc/features/security.md#taint_analysis) | Interprocedural taint analysis: trace untrusted data from sources to sinks, detect SQL injection, XSS, command injection |

## Static Tracing and Debugging

| Tool | Description |
|------|-------------|
| [**trace_flow**](.autodoc/features/tracing.md#trace_flow) | How code flows from point A to B |
| [**trace_backwards**](.autodoc/features/tracing.md#trace_backwards) | Why a function is not being called |
| [**trace_data_flow**](.autodoc/features/tracing.md#trace_data_flow) | How data affects state |
| [**analyze_state_impact**](.autodoc/features/tracing.md#analyze_state_impact) | What changes with different values |
| [**find_decision_points**](.autodoc/features/tracing.md#find_decision_points) | Branching points in code |

## Code Modification

| Tool | Description |
|------|-------------|
| [**modify_code**](.autodoc/features/modification.md#modify_code) | Structural AST-level editing with validation |
| [**create_file**](.autodoc/features/modification.md#create_file) | Create new file |
| [**copy_file**](.autodoc/features/modification.md#copy_file) | Copy file with graph updates |
| [**rename_file**](.autodoc/features/modification.md#rename_file) | Rename file with import updates |
| [**split_file**](.autodoc/features/modification.md#split_file) | Split file into parts |
| [**synthesize_files**](.autodoc/features/modification.md#synthesize_files) | Merge files |
| [**rename_symbol**](.autodoc/features/modification.md#rename_symbol) | Project-wide symbol renaming |
| [**add_member**](.autodoc/features/modification.md#add_member) | Add methods/properties to classes |

## Code Validation

| Tool | Description |
|------|-------------|
| [**validate_file**](.autodoc/features/validation.md#validate_file) | File validation via oxlint/Pylint/golint/clippy |
| [**validate_directory**](.autodoc/features/validation.md#validate_directory) | Batch directory validation |

## Documentation (AutoDoc)

| Tool | Description |
|------|-------------|
| [**autodoc_init**](.autodoc/features/autodoc.md#autodoc_init) | Initialize AutoDoc system |
| [**autodoc_generate**](.autodoc/features/autodoc.md#autodoc_generate) | Generate documentation for entities |
| [**autodoc_save**](.autodoc/features/autodoc.md#autodoc_save) | Save documentation to .autodoc |
| [**autodoc_get**](.autodoc/features/autodoc.md#autodoc_get) | Get entity documentation |
| [**autodoc_search**](.autodoc/features/autodoc.md#autodoc_search) | Semantic search through documentation |
| [**autodoc_validate**](.autodoc/features/autodoc.md#autodoc_validate) | Check documentation freshness |
| [**autodoc_status**](.autodoc/features/autodoc.md#autodoc_status) | Documentation coverage statistics |
| [**autodoc_sync**](.autodoc/features/autodoc.md#autodoc_sync) | Synchronize with code changes |
| [**autodoc_changelog**](.autodoc/features/autodoc.md#autodoc_changelog) | Documentation change history |
| [**autodoc_install_hooks**](.autodoc/features/autodoc.md#autodoc_install_hooks) | Install Git hooks for auto-updates |
| [**autodoc_detect_language**](.autodoc/features/autodoc.md#autodoc_detect_language) | Detect language for generation |

## Git Integration

| Tool | Description |
|------|-------------|
| [**list_branches**](.autodoc/features/git.md#list_branches) | List indexed branches |
| [**switch_branch**](.autodoc/features/git.md#switch_branch) | Switch branches with auto-reindexing |
| [**get_branch_status**](.autodoc/features/git.md#get_branch_status) | Current branch status |
| [**get_changed_files**](.autodoc/features/git.md#get_changed_files) | Compare files between branches |
| [**cleanup_branches**](.autodoc/features/git.md#cleanup_branches) | Clean up old branches (LRU) |

## Version History (Prolly Tree)

| Tool | Description |
|------|-------------|
| [**list_commits**](.autodoc/features/history.md#list_commits) | List graph commits (version snapshots) |
| [**get_entity_history**](.autodoc/features/history.md#get_entity_history) | Entity change history across commits |
| [**diff_commits**](.autodoc/features/history.md#diff_commits) | Compare two graph versions (added/modified/deleted) |
| [**checkout_commit**](.autodoc/features/history.md#checkout_commit) | Time travel — view graph at specific commit |

## Semantic Merge

| Tool | Description |
|------|-------------|
| [**semantic_merge**](.autodoc/features/merge.md#semantic_merge) | AI-powered 3-way merge with code understanding |
| [**analyze_merge_conflicts**](.autodoc/features/merge.md#analyze_merge_conflicts) | Analyze conflicts with explanations |
| [**get_merge_suggestions**](.autodoc/features/merge.md#get_merge_suggestions) | AI suggestions for conflict resolution |
| [**get_semantic_merge_info**](.autodoc/features/merge.md#get_semantic_merge_info) | Information about semantic differences |

## Snapshots and Safety

| Tool | Description |
|------|-------------|
| [**create_snapshot**](.autodoc/features/snapshots.md#create_snapshot) | Save restore point |
| [**undo**](.autodoc/features/snapshots.md#undo) | Instant rollback to snapshot |
| [**list_snapshots**](.autodoc/features/snapshots.md#list_snapshots) | List available snapshots |
| [**cleanup_snapshots**](.autodoc/features/snapshots.md#cleanup_snapshots) | Clean up old snapshots |

## Code Graph and Indexing

| Tool | Description |
|------|-------------|
| [**index**](.autodoc/features/indexing.md#index) | Index codebase |
| [**clean_index**](.autodoc/features/indexing.md#clean_index) | Full reindexing |
| [**get_members**](.autodoc/features/graph.md#get_members) | List entities in file |
| [**list_entity_relationships**](.autodoc/features/graph.md#list_entity_relationships) | Entity relationships and dependencies |
| [**get_graph**](.autodoc/features/graph.md#get_graph) | Get graph (JSON/GraphML/Mermaid) |
| [**get_graph_stats**](.autodoc/features/graph.md#get_graph_stats) | Graph statistics |
| [**get_graph_health**](.autodoc/features/graph.md#get_graph_health) | Graph health diagnostics |
| [**reset_graph**](.autodoc/features/graph.md#reset_graph) | Full graph cleanup |

## Metrics and Monitoring

| Tool | Description |
|------|-------------|
| [**get_metrics**](.autodoc/features/metrics.md#get_metrics) | System metrics and statistics |
| [**get_version**](.autodoc/features/metrics.md#get_version) | Server and runtime version |
| [**get_agent_metrics**](.autodoc/features/metrics.md#get_agent_metrics) | Multi-agent system telemetry |
| [**get_bus_stats**](.autodoc/features/metrics.md#get_bus_stats) | Knowledge bus statistics |
| [**clear_bus_topic**](.autodoc/features/metrics.md#clear_bus_topic) | Clear cached topic entries |
| [**get_watcher_status**](.autodoc/features/metrics.md#get_watcher_status) | Background watcher status |

---

## Additional Features

### Performance
- **SIMD/WebAssembly** — built-in CPU acceleration
- **CUDA/FAISS** — GPU acceleration for large projects
- **WebGPU/Dawn** — cross-platform GPU acceleration
- **Streaming indexing** — parsing and indexing in parallel
- **Local embeddings** — TEI/Ollama/vLLM/MLX without external APIs

### Language Support

| Language | Parser | Entities | Relationships | Metrics | Types |
|----------|--------|----------|--------------|---------|-------|
| **TypeScript** | TS Compiler API | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **JavaScript** | TS Compiler API | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Python** | ast + Pyright | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Kotlin** | kotlin-compiler | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Java** | JavaParser | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Go** | go/parser | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| **Rust** | syn + ANTLR | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| **Swift** | SwiftSyntax | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| **C#** | Roslyn Compiler | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **C/C++** | clang AST | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| **Zig** | regex + heuristics | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| **Bash** | regex + heuristics | ⭐⭐⭐ | ⭐⭐ | ⭐⭐ | — |
| **PowerShell** | regex + heuristics | ⭐⭐⭐ | ⭐⭐ | ⭐⭐ | — |
| **JSON/YAML** | native + OpenAPI | ⭐⭐⭐ | ⭐⭐⭐ | — | — |

**Legend:**
- **Entities** — functions, classes, interfaces, types, enums, variables
- **Relationships** — imports, calls, extends, implements, references
- **Metrics** — cyclomatic, cognitive complexity, control flow, documentation
- **Types** — type inference, type references, generics

### Low-Resource Languages Initiative

> **0b00000001 lives matter!**

We deliberately invest in first-class support for lesser-known yet promising languages and frameworks — so their communities get the same powerful code intelligence that mainstream ecosystems enjoy.

**Currently supported:** Zig — full entity extraction, relationships, and complexity metrics.

More languages coming. If your favorite niche language deserves better tooling — [open an issue](https://github.com/faxenoff/ultracode/issues).

### Frameworks

| Framework | Additional Capabilities |
|-----------|------------------------|
| **Angular** | Components, directives, pipes, services, modules, DI hierarchy, template bindings |
| **NgRx** | Actions, reducers, effects, selectors, feature states, action creators |
| **React** | JSX/TSX, functional/class components, hooks (useState, useEffect, useMemo, useCallback, useContext) |

### Built-in Documentation (MCP Prompts)

You can add a [short prompt](.autodoc/claude.cfg/add-to-CLAUDE.md) to your system prompts that will help the AI agent learn about UltraCode capabilities.

- **quick-start** — quick start and tool selection
- **tool-reference** — complete reference of 72 tools
- **workflows** — ready scenarios: analysis, refactoring, duplicate detection
- **tracing-guide** — tracing and debugging guide

### UltraCode Agent
- **Task delegation** — hand over complex tasks to `/ultracode` agent
- **Maximum efficiency** — agent selects optimal tools itself
- **Comprehensive analysis** — search, tracing, refactoring in one request
- **Natural language** — describe the task in your own words

### Client-Server Architecture
- **One process per machine** — when running multiple AI agents, only one UltraCode instance runs
- **Save 10+ GB RAM** — instead of N copies of indexes in memory — one shared
- **Instant connection** — new agents connect to running server in milliseconds
- **Session isolation** — each agent gets independent MCP session

# Installation

The project is optimized for [Bun](https://bun.sh) (an alternative JavaScript runtime) and runs 50% faster with it.

**Installing Bun** (one command):

```bash
# Windows (PowerShell)
powershell -c "irm bun.sh/install.ps1 | iex"

# macOS / Linux
curl -fsSL https://bun.sh/install | bash
```

**Installing UltraCode**

```bash
# Bun (recommended) — two steps:

# 1. Install package
bun install -g ultracode

# 2. Allow postinstall scripts for native modules
bun pm -g trust ultracode
```

```bash
# npm (alternative) — one step:
npm install -g ultracode
```

> **Why two steps for Bun?**
> To achieve ultra-speed, UltraCode uses native components:
>
> - **faiss-napi** — HNSW/IVF indexes for vector search (100x speedup)
> - **cbor-extract** — fast native metadata serialization
> - **webgpu** — Dawn GPU backend for AMD/Intel
> - **protobufjs** — binary protocol for IPC
> - **xxhash-wasm** — SIMD-accelerated file hashing
> - **libSQL** — native SQLite bindings with vector extension
> - **oxc-parser** — Rust parser for TS/JS (10x faster than tsc)
>
> Bun blocks postinstall scripts by default. The `bun pm trust` command allows their execution — no reinstall needed.

> **Note**: For full code analysis on different languages, runtimes are required:
>
> - TypeScript/JavaScript — built-in (TypeScript Compiler API)
> - Python — requires Python 3.8+ (`python --version`)
> - Java/Kotlin — requires JRE 11+ (`java --version`)
> - Go — requires Go 1.18+ (`go version`)
> - Rust — requires Rust toolchain (`rustc --version`)
> - C# — requires .NET SDK 8+ (`dotnet --version`)
> - Zig — built-in (regex-based, no Zig toolchain required)
> - C/C++ — requires Clang 12+ (`clang --version`)

**Claude Code Config** (`~/.claude.json`):

```json
{
  "mcpServers": {
    "ultracode": {
      "command": "ultracode"
    }
  }
}
```

> Configuration: [.autodoc/claude.cfg/add-to-CLAUDE.md](.autodoc/claude.cfg/add-to-CLAUDE.md)

## **Local Model Setup**

Local models are used for intelligent tasks: embedding model for semantic search and LLM for AutoDoc. This removes token costs from your main AI agent.

**After installation, a setup wizard will launch and download and configure everything needed.**

**Step 1: Embedding Provider** (semantic search)

| Provider | Speed | Recommendation |
|----------|-------|----------------|
| **vLLM** | 1352 emb/s | ⭐ NVIDIA GPU (recommended) |
| **TEI** | 1169 emb/s | ⭐ NVIDIA GPU (Blackwell: `120-latest` image) |
| **MLX** | ~500 emb/s | ⭐ macOS Apple Silicon (Metal GPU) |
| **llama.cpp** | 441 emb/s | AMD GPU (Vulkan), universal |
| **OVMS Native** | 260-326 emb/s | ⭐ CPU / Intel GPU. <br />Can help if main VRAM is occupied by local LLM. |

**Step 2: LLM Provider** (AutoDoc, refactoring)

| Provider | Models | Recommendation |
|----------|--------|----------------|
| **Docker Model Runner** | Qwen 2.5, DeepSeek R1, Phi-4, Llama 3.2 | ⭐ If Docker Desktop is installed |
| **Ollama** | qwen2.5-coder, deepseek-coder, phi4 | Universal option |
| **Skip** | — | Configure later |

The wizard automatically:
- Detects your GPU (NVIDIA Turing/Ampere/Ada/Hopper/Blackwell*)
- Suggests optimal models for your hardware
- Installs selected providers
- Saves configuration to system directory

> **Re-run wizard:**
> ```bash
> # Bun
> bunx ultracode setup
>
> # Node.js
> npx ultracode setup
> ```

*For Blackwell (RTX 50xx), an unofficial TEI fork is used

### AUTODOC Setup

To activate auto-documentation mode - create a `.autodoc` folder in the project root and enable LLM usage (easiest to use the same claude).

After running UltraCode with Autodoc mode enabled:

1. In all folders with source code (from supported languages), AUTODOC.md files will be created with a template listing files in the directory.
2. LLM will go through these files and generate descriptions in AUTODOC.md — what the code in the files specifically does.

After this, you can yourself (or with an AI agent's help) create needed files with project overview in the .autodoc directory and add "human descriptions" in AUTODOC.md files where needed. There you can use direct references to code lines in files (for describing start and end of code block, use two numbers. Example: FILE:XX-ZZ). UltraCode will track code changes and automatically update all code references to keep them current. It won't touch documentation text.

### macOS Apple Silicon (MLX Embeddings)

Native embedding support via Apple MLX framework (Metal GPU):

- **MLX provider** auto-detects macOS ARM64 and uses Metal GPU
- Setup wizard offers MLX as the default on Apple Silicon
- Models: `intfloat/multilingual-e5-base` (768d), `intfloat/multilingual-e5-small` (384d), `BAAI/bge-m3` (1024d, 8K context)
- Auto-installs Python venv with dependencies, downloads models from HuggingFace

```bash
# Re-run wizard to switch to MLX:
bunx ultracode setup
# Select "MLX" → auto-setup venv + model + server on port 8087
```

### GPU Acceleration (CUDA/WebGPU/Metal)

```bash
# macOS: Metal backend for CUDA-like acceleration
# Build requirements:
#   - Xcode Command Line Tools: xcode-select --install
#   - Homebrew: https://brew.sh
#   - CMake: brew install cmake
./node_modules/ultracode/scripts/build-native-libs-macos.sh
```

# Configuration

## Data Structure

All UltraCode data is stored in system directory:

- **Windows**: `%LOCALAPPDATA%\UltraCode\`
- **macOS**: `~/Library/Application Support/UltraCode/`
- **Linux**: `~/.local/share/UltraCode/`

```
UltraCode/
├── config/
│   ├── semantic-config.json    # Embedding/LLM providers (setup wizard)
│   └── parser-config.json      # Runtime paths (Java, Kotlin)
├── projects/
│   └── {hash}/                 # Project data (hash from path)
│       ├── faiss-*.bin         # FAISS index for vector search
│       └── *.json              # Index metadata
├── logs/                       # Server logs (daily rotation)
├── models/                     # Downloaded embedding models
├── llamacpp/                   # llama.cpp binaries and models
├── ovms/                       # OpenVINO Model Server models
├── hf-cache/                   # HuggingFace model cache
├── autodoc.db                  # AutoDoc documentation database
└── unified-storage.db          # Unified storage for graphs and entities
```

## Configuration Parameters

Advanced parameters can be set in `config/default.yaml` (for developers) or via environment variables.
Embedding/LLM are configured via setup wizard and stored in `semantic-config.json`.

Main parameters:

| Section | Parameter | Default | Description |
|---------|-----------|---------|-------------|
| **logging** | `level` | `info` | Log level: debug, info, warn, error |
| | `maxFiles` | `5` | Number of log files for rotation |
| **database** | `mode` | `WAL` | libSQL mode: WAL, DELETE, TRUNCATE |
| | `cacheSize` | `10000` | libSQL cache size |
| **indexing** | `autoSwitchOnBranchChange` | `true` | Auto-switch DB on branch change |
| | `maxBranchesPerRepo` | `10` | Max branches per repository |
| | `incrementalThreshold` | `20` | File threshold for full reindexing |
| **git** | `enabled` | `true` | Git integration |
| | `autoReindex` | `true` | Auto-index on branch change |
| | `debounceMs` | `60000` | Delay before indexing changes |
| **parser** | `maxFileSize` | `1048576` | Max file size (1MB) |
| | `timeout` | `60000` | Parsing timeout (60 sec) |
| **performance** | `maxWorkerThreads` | `4` | Parallel parsing workers |

# For AI Agents

**[LLM_INSTRUCTIONS.md](./LLM_INSTRUCTIONS.md)** — Why using UltraCode makes you a good boy.

# Contributing

Repository: https://github.com/faxenoff/ultracode

## License

**Dual License** — see [LICENSE](LICENSE)

- **Open Source**: [AGPL-3.0](https://www.gnu.org/licenses/agpl-3.0.html) — free to use, modify, and distribute with source code disclosure
- **Commercial**: for proprietary/closed-source use or SaaS without AGPL obligations — contact [faxenoff@gmail.com](mailto:faxenoff@gmail.com)
