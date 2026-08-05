# Getting Started with UltraCode

Welcome! This guide will help you get started with UltraCode.

## Installation

```bash
npm install ultracode
```

After installation, you'll see a welcome message with setup instructions.

## Quick Start

### 1. Configure Your MCP Client

Add to your Claude Desktop configuration file:

**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Linux**: `~/.config/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "ultracode": {
      "command": "node",
      "args": [
        "node_modules/ultracode/dist/index.js"
      ]
    }
  }
}
```

### 2. Start Using

The MCP server provides the following key tools:

- **`index`** - Index your codebase for analysis
- **`query`** - Query the code graph with natural language
- **`semantic_search`** - Search code semantically
- **`get_members`** - List parsed entities in a file
- **`list_entity_relationships`** - List relationships for an entity
- **`analyze_code_impact`** - Analyze the impact of code changes

### 3. Basic Workflow

```
1. Index your project:
   Use the 'index' tool with your project directory

2. Query your code:
   Use 'query' or 'semantic_search' to find relevant code

3. Analyze relationships:
   Use 'list_entity_relationships' to understand dependencies
```

## Optional: Embeddings Setup

UltraCode works out of the box with hash-based embeddings. For **better semantic search**, you can set up ML-powered embeddings.

### Option 1: TEI (Text Embeddings Inference) - Recommended

**Best for**: Production use, GPU acceleration

```bash
cd node_modules/ultracode
scripts\setup-embeddings.cmd --provider tei
```

This will:
- Check Docker installation
- Auto-detect GPU capabilities
- Download and configure TEI model
- Start container with auto-restart

### Option 2: Ollama - Easy Setup

**Best for**: Quick start, no Docker needed

```bash
cd node_modules/ultracode
scripts\setup-embeddings.cmd --provider ollama
```

This will:
- Check Ollama installation (prompts to install if missing)
- Pull the selected embedding model
- Verify setup

### Option 3: Memory Provider - No Setup

**Best for**: No ML needed, instant start

The default hash-based provider works without any setup. No configuration needed!

## Configuration

After setting up embeddings, update your config file:

**Location**: `node_modules/ultracode/config/default.yaml`

### For TEI:

```yaml
mcp:
  embedding:
    provider: "tei"
    model: "Alibaba-NLP/gte-large-en-v1.5"
    enabled: true
    tei:
      baseUrl: "http://127.0.0.1:8080"
```

### For Ollama:

```yaml
mcp:
  embedding:
    provider: "ollama"
    model: "mxbai-embed-large"
    enabled: true
    ollama:
      baseUrl: "http://127.0.0.1:11434"
```

### For Memory (default):

```yaml
mcp:
  embedding:
    provider: "memory"
    enabled: true
```

## GPU Acceleration (Optional)

UltraCode supports multiple acceleration backends:

### WASM SIMD (Included)
Automatically enabled. Provides 2-4x speedup on modern CPUs.

### CUDA (NVIDIA GPUs)
Requires CUDA Toolkit 12.x. See [gpu-and-native.md](gpu-and-native.md) for setup instructions.

### WebGPU (Cross-platform)
Auto-detected. Note: disabled on Blackwell GPUs (RTX 50xx). See [known-issues.md](known-issues.md).

## Troubleshooting

### Postinstall Script Doesn't Run

If you don't see the welcome message after installation:

```bash
node node_modules/ultracode/scripts/postinstall.js
```

### Embeddings Setup Issues

**Docker not found (TEI)**:
1. Install Docker Desktop: https://www.docker.com/products/docker-desktop
2. Start Docker Desktop
3. Run setup again

**Ollama not found**:
1. Install Ollama: https://ollama.com/download
2. Start Ollama service: `ollama serve`
3. Run setup again

### MCP Server Not Responding

1. Check that the path in `claude_desktop_config.json` is correct
2. Verify Node.js is installed: `node --version` (requires 24.0.0+)
3. Check logs in Claude Desktop's developer console

## Next Steps

- Read ~~[README.md](../../README.md)~~ (deleted) for detailed features
- Explore ~~[config/embedding-models.json](../../config/embedding-models.json)~~ (deleted) for available models
- Check [deployment.md](deployment.md) for production deployment
- See [benchmarks.md](benchmarks.md) for provider speed comparison

## Need Help?

- Report issues: https://github.com/faxenoff/ultracode/issues
- Read documentation in the `node_modules/ultracode` directory

---

**Ready to analyze your codebase!** 🚀
