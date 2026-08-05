# Configuration, Limits, Timeouts & Logging

Consolidated reference for all configuration files, limits, timeouts, logging system, and environment variables.

---

## Configuration Files

UltraCode uses **YAML-based configuration** loaded through `ConfigLoader` (`src/config/yaml-config.ts`):

| File | Purpose |
|------|---------|
| `config/default.yaml` | Base settings for all environments |
| `config/development.yaml` | Development overrides |
| `config/production.yaml` | Production optimizations |

Configuration is loaded with environment variable support. Key env vars:

| Variable | Description |
|----------|-------------|
| `MCP_EMBEDDING_PROVIDER` | Embedding provider selection |
| `MCP_USE_PARSER` | Enable/disable ParserAgent |
| `MCP_DEV_INDEX_BATCH` | Batch size for indexing |
| `MCP_DEBUG_DISABLE_SEMANTIC` | Disable semantic agent (debugging) |

---

## Limits & Timeouts

### Parser (Parsing)

#### Critical Timeouts

| Constant | Value | File | Description |
|----------|-------|------|-------------|
| `DEFAULT_TIMEOUT_MS` | **30000ms** (30s) | `src/parsers/incremental-parser.ts:35` | Timeout for parsing a single file. **File is skipped if not parsed in time.** |
| `PARSE_TIMEOUT_MS` | 5000ms | `src/config/constants.ts:113` | Base timeout for language-specific parsers |
| `DEFAULT_BATCH_SIZE` | 10 | `src/parsers/incremental-parser.ts:34` | Batch size for parallel parsing |

#### Size Limits

| Constant | Value | File | Description |
|----------|-------|------|-------------|
| `MAX_FILE_SIZE_BYTES` | 10MB | `src/config/constants.ts:123` | Maximum file size for parsing |
| `MAX_RECURSION_DEPTH` | 100 | `src/config/constants.ts:108` | Maximum recursion depth (prevents stack overflow) |
| `COMPLEXITY_THRESHOLD` | 100 | `src/config/constants.ts:118` | Complexity threshold for circuit breaker |
| `MAX_TEMPLATE_DEPTH` | 10 | `src/parsers/cpp-analyzer.ts:33` | Maximum C++ template nesting depth |

#### Worker Pools

| Constant | Value | File | Description |
|----------|-------|------|-------------|
| `WORKER_THRESHOLD` | 20 | `src/agents/parser-agent.ts:477,599` | Minimum files to activate worker threads |

---

### Indexing

#### Default Exclude Patterns

File: `src/index.ts` (IndexToolSchema.excludePatterns)

The following patterns are excluded by default during indexing:

```
node_modules/**     # NPM dependencies
.git/**             # Git metadata
dist/**             # Build output
build/**            # Build output
out/**              # Build output
.next/**            # Next.js cache
.nuxt/**            # Nuxt.js cache
coverage/**         # Test coverage
.nyc_output/**      # NYC coverage
__pycache__/**      # Python cache
*.pyc               # Python compiled
.pytest_cache/**    # Pytest cache
venv/**, .venv/**   # Python virtual envs
.env/**             # Environment
vendor/**           # Go/PHP dependencies
target/**           # Rust/Java build
.gradle/**          # Gradle cache
.idea/**            # JetBrains IDE
.vscode/**          # VS Code settings
**/.memory_bank/**  # Memory bank
tmp/**, temp/**     # Temporary files
*.log, *.tmp        # Temp files
**/*.md             # Markdown files
Archives            # .zip, .tar, .gz, .7z, .rar
```

**Note**: Patterns `**/test/**`, `**/tests/**`, `**/__tests__/**` are **NOT** excluded. Tests are code and are indexed by default.

**Customization**: Pass your own `excludePatterns` array to `index()` to override.

#### Operation Timeouts

| Constant | Value | File | Description |
|----------|-------|------|-------------|
| `INDEX_DEFAULT_TIMEOUT` | 300000ms (5 min) | `src/index.ts:2061` | Indexing timeout |
| `CLEAN_INDEX_DEFAULT_TIMEOUT` | 300000ms (5 min) | `src/index.ts:2233` | Clean index timeout |

#### Codebase Size Thresholds

| Constant | Value | File | Description |
|----------|-------|------|-------------|
| `LARGE_CODEBASE_THRESHOLD` | 2000 files | `src/config/constants.ts:211` | "Large" codebase threshold -- enables batch processing |
| `VERY_LARGE_CODEBASE_THRESHOLD` | 5000 files | `src/config/constants.ts:216` | "Very large" codebase threshold |

#### Batch Processing

| Constant | Value | File | Description |
|----------|-------|------|-------------|
| `DEFAULT_BATCH_SIZE` | 100 | `src/config/constants.ts:206` | Default entity batch size |
| `MAX_ENTITIES_PER_BATCH` | 1000 | `src/config/constants.ts:221` | Maximum entities per batch |
| `INDEXING_CONCURRENCY` | 8 | `src/agents/dev-agent.ts:447` | Indexing concurrency |

---

### Database (SQLite)

#### SQLite Configuration

| Constant | Value | File | Description |
|----------|-------|------|-------------|
| `BUSY_TIMEOUT` | 5000ms | `src/config/constants.ts:87` | SQLite busy timeout |
| `PAGE_SIZE` | 4096 bytes | `src/config/constants.ts:67` | SQLite page size |
| `CACHE_SIZE_KB` | 65536 (64MB) | `src/config/constants.ts:72` | SQLite cache size |
| `MMAP_SIZE` | 268MB | `src/config/constants.ts:77` | Memory-mapped I/O size |
| `WAL_AUTOCHECKPOINT` | 1000 pages | `src/config/constants.ts:82` | WAL checkpoint threshold |
| `CONNECTION_POOL_SIZE` | 5 | `src/config/constants.ts:92` | Connection pool size |

#### Connection Pool

| Constant | Value | File | Description |
|----------|-------|------|-------------|
| `DEFAULT_MAX_CONNECTIONS` | 5 | ~~`src/storage/connection-pool.ts:25`~~ (deleted) | Max connections in pool |
| `DEFAULT_ACQUIRE_TIMEOUT` | 5000ms | ~~`src/storage/connection-pool.ts:27`~~ (deleted) | Timeout for acquiring a connection |
| `DEFAULT_IDLE_TIMEOUT` | 30000ms | ~~`src/storage/connection-pool.ts:28`~~ (deleted) | Idle connection timeout |

#### Batch Operations

| Constant | Value | File | Description |
|----------|-------|------|-------------|
| `DEFAULT_BATCH_SIZE` | 1000 | ~~`src/storage/batch-operations.ts:24`~~ (deleted) | Batch size for bulk operations |
| `MAX_BATCH_SIZE` | 5000 | ~~`src/storage/batch-operations.ts:25`~~ (deleted) | Maximum batch size |

---

### Agents

#### Conductor/Coordinator

| Constant | Value | File | Description |
|----------|-------|------|-------------|
| `MAX_CONCURRENT_AGENTS` | 10 | `src/config/constants.ts:139` | Max parallel agents |
| `DEFAULT_AGENT_TIMEOUT` | 30000ms | `src/config/constants.ts:144` | Default agent timeout |
| `COMPLEXITY_THRESHOLD` | 8 | `src/config/constants.ts:149` | Complexity threshold for delegation |
| `MAX_RETRIES` | 3 | `src/config/constants.ts:154` | Max retries per task |
| `RETRY_BACKOFF_MULTIPLIER` | 2 | `src/config/constants.ts:159` | Backoff multiplier |

#### Resource Management

| Constant | Value | File | Description |
|----------|-------|------|-------------|
| `DEFAULT_MEMORY_LIMIT_MB` | 1024 | `src/config/constants.ts:175` | Default memory limit |
| `MAX_MEMORY_LIMIT_MB` | 8192 | `src/config/constants.ts:180` | Max memory limit |
| `CPU_THRESHOLD_PERCENT` | 80% | `src/config/constants.ts:185` | CPU threshold |
| `MEMORY_CHECK_INTERVAL_MS` | 5000ms | `src/config/constants.ts:190` | Memory check interval |
| `MAX_MONITORING_INTERVAL` | 10000ms | `src/core/resource-manager.ts:47-52` | Max monitoring interval |

---

### Query

#### Graph Storage

| Constant | Value | File | Description |
|----------|-------|------|-------------|
| `DEFAULT_QUERY_LIMIT` | 100 | ~~`src/storage/graph-storage.ts:40`~~ (deleted) | Default result limit |
| `MAX_QUERY_LIMIT` | 1000 | ~~`src/storage/graph-storage.ts:41`~~ (deleted) | Max result limit |
| `MAX_SUBGRAPH_DEPTH` | 5 | ~~`src/storage/graph-storage.ts:42`~~ (deleted) | Max subgraph depth |
| `MAX_TRAVERSAL_DEPTH` | 10 | ~~`src/query/graph-query-processor.ts:50`~~ (deleted) | Max graph traversal depth |

#### Query Optimizer

| Constant | Value | File | Description |
|----------|-------|------|-------------|
| `DEFAULT_LIMIT` | 100 | ~~`src/query/query-optimizer.ts:29`~~ (deleted) | Default limit |
| `MAX_LIMIT` | 1000 | ~~`src/query/query-optimizer.ts:30`~~ (deleted) | Max limit |
| `MAX_QUERY_DEPTH` | 10 | `src/types/query.ts:30` | Max query depth |
| `MAX_CONCURRENT_QUERIES` | 10 | `src/types/query.ts:32` | Max concurrent queries |

---

### Cache

#### LRU Cache

| Constant | Value | File | Description |
|----------|-------|------|-------------|
| `MAX_CACHE_ENTRIES` | 5000 | `src/config/constants.ts:31` | Max cache entries |
| `CACHE_TTL_MS` | 3600000 (1h) | `src/config/constants.ts:36` | Cache TTL |
| `L1_MAX_SIZE` | 100 | ~~`src/query/query-cache.ts:32`~~ (deleted) | Hot cache size |
| `L2_MAX_SIZE` | 1000 | ~~`src/query/query-cache.ts:33`~~ (deleted) | Warm cache size |

#### Storage Cache

| Constant | Value | File | Description |
|----------|-------|------|-------------|
| `DEFAULT_MAX_SIZE` | 50MB | `src/storage/cache-manager.ts:25` | Max file cache size |
| `DEFAULT_MAX_ENTRIES` | 1000 | `src/storage/cache-manager.ts:14-73` | Max entries |
| `DEFAULT_CACHE_SIZE` | 100MB | `src/parsers/incremental-parser.ts:14-73` | Parser cache |

#### Semantic Cache

| Constant | Value | File | Description |
|----------|-------|------|-------------|
| `DEFAULT_MAX_SIZE` | 5000 | `src/semantic/semantic-cache.ts:29` | Semantic cache size |
| `DEFAULT_MAX_AGE` | 86400000 (24h) | `src/semantic/semantic-cache.ts:31` | Entry TTL |

---

### Vector Search

| Constant | Value | File | Description |
|----------|-------|------|-------------|
| `DEFAULT_EMBEDDING_DIMENSIONS` | 384 | `src/config/constants.ts:237` | Embedding dimensions |
| `MIN_SIMILARITY_THRESHOLD` | 0.7 | `src/config/constants.ts:247` | Min similarity threshold |
| `DEFAULT_SEARCH_LIMIT` | 10 | `src/config/constants.ts:257` | Default search limit |
| `MAX_SEARCH_LIMIT` | 100 | `src/config/constants.ts:262` | Max search limit |
| `MAX_BATCH_SIZE` | 8 | `src/config/constants.ts:267` | Max embedding batch |
| `EMBEDDING_BATCH_SIZE` | 16 | `src/config/constants.ts:41` | Generation batch size |

---

### MCP Server

#### Server Timeouts

| Constant | Value | File | Description |
|----------|-------|------|-------------|
| `server.timeout` | 30000ms | `src/config/yaml-config.ts:327` | MCP server timeout |
| `agents.defaultTimeout` | 5000ms | `src/config/yaml-config.ts:361` | Agent default timeout |

#### CLI Timeouts

| Constant | Value | File | Description |
|----------|-------|------|-------------|
| Ollama check | 2000ms | `src/utils/ollama-checker.ts:12` | Health check timeout |
| Docker pull | 600000ms (10m) | `src/cli/setup-command.ts:741` | Docker pull timeout |
| Model pull | 1200000ms (20m) | `src/cli/setup-command.ts:837` | Ollama model pull timeout |
| LLM generation | 120000ms (2m) | `src/autodoc/llm/llm-provider.ts:38-46` | LLM request timeout |

---

### Response Limits

| Constant | Value | File | Description |
|----------|-------|------|-------------|
| `MAX_RESPONSE_SIZE_BYTES` | 50KB | `src/tools/response-limits.ts:11` | Max response size |
| `MAX_PAGE_SIZE` | 200 | `src/tools/response-limits.ts:15` | Max records per page |
| `MAX_SNIPPET` | 10000 chars | `src/index.ts:2857` | Max snippet size |

---

### Tracing

| Constant | Value | File | Description |
|----------|-------|------|-------------|
| `DEFAULT_MAX_DEPTH` | 15 | `src/tracing/trace-engine.ts:39` | Trace depth |
| `DEFAULT_MAX_PATHS` | 5-10 | `src/tracing/path-builder.ts:24-32` | Max paths |

---

### Clone Detection

| Constant | Value | File | Description |
|----------|-------|------|-------------|
| `MAX_FILES_TO_PROCESS` | 500 | `src/tools/jscpd.ts:8` | Max files for jscpd |
| `MAX_FILE_SIZE_BYTES` | 500KB | `src/tools/jscpd.ts:9` | Max file size |
| `MAX_TOTAL_TOKENS` | 500000 | `src/tools/jscpd.ts:10` | Max tokens |

---

### AutoDoc Concurrency

| Constant | Value | File | Description |
|----------|-------|------|-------------|
| `MAX_FILE_CONCURRENCY` | 8 | `src/autodoc/hooks/pre-commit-check.ts:90-113` | File concurrency |
| `MAX_REF_CONCURRENCY` | 4 | `src/autodoc/hooks/pre-commit-check.ts:147` | Reference concurrency |
| `OUTDATED_THRESHOLD` | 0.7 | `src/autodoc/storage/autodoc-manager.ts:34-41` | Outdated threshold |

---

### Centralized Constants

Main constants are located in `src/config/constants.ts`. When changing values, prefer modifying them there so changes apply globally.

```typescript
import { PARSER_CONSTANTS, DATABASE_CONSTANTS } from './config/constants.js';

const timeout = PARSER_CONSTANTS.PARSE_TIMEOUT_MS;
const busyTimeout = DATABASE_CONSTANTS.BUSY_TIMEOUT;
```

---

## Logging System

### Log Format

All logs use fixed-position fields for easy parsing:

```
20260107-143045.123 I 12345 a1b2c3d4 PARSER               file_parsed          file=/src/index.ts dur=45ms
```

| Field | Position | Length | Description |
|-------|----------|--------|-------------|
| Timestamp | 0-18 | 19 | `YYYYMMDD-HHmmss.mmm` |
| Level | 20 | 1 | `E/W/I/D/T` |
| PID | 22-26 | 5 | Process ID |
| BuildHash | 28-35 | 8 | Git commit hash |
| Module | 37-56 | 20 | Category (ALL CAPS, padded right) |
| Event | 58-77 | 20 | Event (snake_case, padded right) |
| KV Pairs | 79+ | var | `key=value` pairs |

### Quick Start

```typescript
import { log } from "../logging/index.js";

log.i("PARSER", "file_parsed", { file: "index.ts", dur: 45 });
log.e("INDEXER", "batch_failed", { err: "timeout", retry: 2 });
log.w("EMBEDDING", "rate_limited", { wait: 1000 });
log.d("STORAGE", "cache_hit", { key: "abc123" });
log.t("QUERY", "sql_exec", { rows: 150 });
```

### Log Levels

| Level | Method | When to Use |
|-------|--------|------------|
| **Error** | `log.e()` | Errors requiring attention. Operation failed. |
| **Warn** | `log.w()` | Potential issues. Operation succeeded with caveats. |
| **Info** | `log.i()` | Important events: start/stop, operation completion, state changes. |
| **Debug** | `log.d()` | Debugging details. Intermediate steps, cache states. |
| **Trace** | `log.t()` | Maximum detail. SQL queries, every algorithm step. |

### Level Examples

```typescript
// ERROR - operation failed
log.e("INDEXER", "parse_failed", { file: "broken.ts", err: "SyntaxError" });

// WARN - works but has issues
log.w("EMBEDDING", "fallback_used", { from: "ollama", to: "openai" });

// INFO - key events
log.i("STARTUP", "server_ready", { port: 3000, mode: "production" });
log.i("INDEXER", "scan_complete", { files: 1500, dur: 3200 });

// DEBUG - development details
log.d("CACHE", "evicted", { key: "embed_abc", reason: "lru" });

// TRACE - maximum detail
log.t("STORAGE", "sql_query", { sql: "SELECT...", rows: 42 });
```

### Module Naming

Module is the component category (up to 20 characters, ALL CAPS).

| Module | Component |
|--------|-----------|
| `STARTUP` | Server initialization |
| `SHUTDOWN` | Shutdown process |
| `MCP` | MCP protocol, requests/responses |
| `PARSER` | File parsing |
| `INDEXER` | Codebase indexing |
| `EMBEDDING` | Embedding generation |
| `STORAGE` | Storage operations |
| `QUERY` | Query processing |
| `SEMANTIC` | Semantic search |
| `FAISS` | FAISS index |
| `OLLAMA` | Ollama provider |
| `OVMS` | OpenVINO Model Server |
| `WORKER` | Worker processes |
| `CACHE` | Caching |
| `BRANCH` | Branch operations |
| `MERGE` | Merge operations |
| `AUTODOC` | Auto-documentation |

**Rules**:
- ALL CAPS, up to 20 characters
- Words can be concatenated (e.g., `GRAPHSTORAGE`)
- No lowercase, no mixed case

### Event Naming

Event is the specific action (up to 20 characters, snake_case).

**Standard patterns**:

```typescript
// Lifecycle
log.i("MODULE", "init", {});
log.i("MODULE", "ready", {});
log.i("MODULE", "shutdown", {});

// Operations
log.i("MODULE", "op_start", { op: "scan" });
log.i("MODULE", "op_done", { op: "scan", dur: 100 });
log.e("MODULE", "op_failed", { op: "scan", err: "..." });

// State
log.d("MODULE", "cache_hit", {});
log.d("MODULE", "cache_miss", {});
log.w("MODULE", "rate_limited", {});
log.w("MODULE", "fallback_used", {});
```

### Standard KV Keys

| Key | Type | Description |
|-----|------|-------------|
| `dur` | number | Duration in ms |
| `err` | string | Error message |
| `file` | string | File path |
| `cnt` / `count` | number | Item count |
| `op` | string | Operation name |
| `retry` | number | Retry number |
| `mem` | number | Memory usage (bytes) |
| `ok` | boolean | Operation success |
| `req` / `reqId` | string | Request ID |

### Operation Tracking

```typescript
// Manual tracking
const start = Date.now();
await doWork();
log.i("MODULE", "work_done", { dur: Date.now() - start });

// opStart/opEnd
const start = log.opStart("MODULE", "heavy_op", { items: 100 });
await heavyOperation();
log.opEnd("MODULE", "heavy_op", start, true, { processed: 100 });

// Wrapper op()
const result = await log.op("MODULE", "async_op", async () => {
  return await fetchData();
}, { url: "https://..." });
```

### Error Logging

```typescript
// Correct pattern
try {
  await riskyOperation();
} catch (error) {
  log.e("MODULE", "op_failed", {
    err: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined
  });
  throw error;
}

// WRONG - do not pass Error object directly
// log.e("MODULE", "failed", error);
// log.e("MODULE", "failed", { error });
```

### Logging Configuration

In `config/default.yaml`:

```yaml
logging:
  level: info        # trace, debug, info, warn, error
  fileLevel: debug   # file level (usually lower)
  maxFiles: 7        # log rotation
  maxSizeMB: 50      # max file size
```

### Log File Locations

```
Windows: %LOCALAPPDATA%\UltraCode\logs\mcp-server-YYYY-MM-DD.log
Linux:   ~/.local/share/ultracode/logs/mcp-server-YYYY-MM-DD.log
macOS:   ~/Library/Application Support/ultracode/logs/mcp-server-YYYY-MM-DD.log
```

---

## CLI Log Viewer: ulog

```bash
# Filter by level
ulog -l E,W logs/server.log

# Filter by module
ulog -m "PARSER" logs/server.log
ulog -m "EMBED*" logs/            # Modules starting with EMBED

# Filter by time
ulog --from 1h logs/server.log       # Last hour
ulog --from 30m logs/                 # Last 30 minutes
ulog --from "20260107-1400" logs/     # From specific time
ulog -t 15m logs/server.log           # Short form of --from

# Filter by KV pairs
ulog -k "dur>100" logs/server.log  # Operations longer than 100ms
ulog -k "err=*" logs/              # All entries with errors
ulog -k "retry>1" logs/            # With retries

# Output
ulog --stats logs/server.log      # Level/module statistics
ulog -c logs/server.log           # Count only
ulog -f logs/server.log           # Follow mode (tail -f)
ulog -o json logs/server.log      # JSON format
ulog --fields "ts,module,err" logs/  # Specific fields only

# Combined filters
ulog -l E -m PARSER --from 1h -k "dur>50" logs/
```

### read-logs.ps1 Script (Recommended for Windows)

```powershell
# From project root:
.\scripts\read-logs.ps1 PERFORMANCE              # PERFORMANCE logs (last 50)
.\scripts\read-logs.ps1 ERROR                    # ERROR and FATAL
.\scripts\read-logs.ps1 PERFORMANCE -Lines 100   # More lines
.\scripts\read-logs.ps1 -Stats                   # Statistics by categories
.\scripts\read-logs.ps1 PERFORMANCE -Date 2025-12-24  # Specific date
```

---

## PERFORMANCE Logs (Embedding Phases)

Format: `[PERFORMANCE] <PHASE> | entities: N | ms: X | speed: X/s`

| Phase | Description |
|-------|-------------|
| `1_FILE_READ` | Reading files and computing content hash |
| `2_COMMENT_EXTRACT` | Extracting comments from files |
| `3_TEXT_BUILD` | Building texts for embedding |
| `4_EMBEDDING_GEN` | Generating embeddings via TEI/OVMS |
| `5_DB_INSERT` | Inserting into vector store |
| `6_INDEX_REBUILD` | Rebuilding index (bulk mode) |
| `BATCH_COMPLETE` | Batch summary (50 entities) |
| `QUEUE_COMPLETE` | Full queue summary |

**Example output**:

```
[PERFORMANCE] 1_FILE_READ       | entities: 50 | ms: 12  | speed: 4166/s
[PERFORMANCE] 2_COMMENT_EXTRACT | entities: 50 | ms: 8   | speed: 6250/s
[PERFORMANCE] 3_TEXT_BUILD      | entities: 50 | ms: 3   | speed: 16666/s
[PERFORMANCE] 4_EMBEDDING_GEN   | entities: 50 | ms: 45  | speed: 1111/s
[PERFORMANCE] 5_DB_INSERT       | entities: 50 | ms: 15  | speed: 3333/s
[PERFORMANCE] BATCH_COMPLETE    | entities: 50 | totalMs: 83 | speed: 602/s
```

---

## Environment Variables

Many limits can be overridden via environment variables. Full list in `src/config/yaml-config.ts`:

### Parser

| Variable | Description |
|----------|-------------|
| `PARSER_MAX_FILE_SIZE` | Max file size |
| `PARSER_TIMEOUT` | Parser timeout |
| `PARSER_AGENT_MAX_CONCURRENCY` | Parser concurrency |
| `PARSER_AGENT_BATCH_SIZE` | Batch size |

### Agents

| Variable | Description |
|----------|-------------|
| `MCP_MAX_CONCURRENT_AGENTS` | Max agents |
| `MCP_AGENT_TIMEOUT` | Agent timeout |
| `DEV_AGENT_MAX_CONCURRENCY` | Dev-agent concurrency |
| `SEMANTIC_AGENT_BATCH_SIZE` | Semantic-agent batch size |

### Embedding Providers

| Variable | Description |
|----------|-------------|
| `OLLAMA_TIMEOUT_MS` | Ollama timeout |
| `OLLAMA_CONCURRENCY` | Ollama concurrency |
| `OPENAI_TIMEOUT_MS` | OpenAI timeout |
| `OPENAI_MAX_BATCH_SIZE` | OpenAI max batch |
| `TEI_TIMEOUT_MS` | TEI timeout |
| `TEI_CONCURRENCY` | TEI concurrency |

### Indexing

| Variable | Description |
|----------|-------------|
| `INDEXING_MAX_BRANCHES_PER_REPO` | Max branches |
| `INDEXING_CLEANUP_INTERVAL_MS` | Cleanup interval |
| `INDEXING_INCREMENTAL_THRESHOLD` | Incremental threshold |

### GPU Control

| Variable | Values | Description |
|----------|--------|-------------|
| `WEBGPU_FORCE_DISABLE` | `1` | Disable WebGPU detection |
| `WEBGPU_FORCE_ENABLE` | `1` | Force WebGPU (may crash on Blackwell) |
| `CUDA_FORCE_DISABLE` | `1` | Disable CUDA native addon |
| `CUDA_PATH` | path | CUDA Toolkit installation directory |
| `ULTRACODE_SKIP_POSTINSTALL` | `1` | Skip postinstall script |

---

## Troubleshooting

### Files not indexing
**Cause**: `DEFAULT_TIMEOUT_MS` is too small for complex files.
**Fix**: Increase the value in `src/parsers/incremental-parser.ts:35`.

### "Connection acquire timeout"
**Cause**: Connection pool is exhausted.
**Fix**: Increase `DEFAULT_MAX_CONNECTIONS` or `DEFAULT_ACQUIRE_TIMEOUT`.

### Slow search on large codebases
**Cause**: Small `MAX_QUERY_LIMIT`.
**Fix**: Increase limits in ~~`src/storage/graph-storage.ts`~~ (deleted).

### Out of memory during indexing
**Cause**: Batch sizes too large or too many parallel agents.
**Fix**: Decrease `MAX_ENTITIES_PER_BATCH` or `MAX_CONCURRENT_AGENTS`.

---

## Key Source Files

| File | Purpose |
|------|---------|
| `src/config/constants.ts` | Centralized constants |
| `src/config/yaml-config.ts` | YAML config loader with env var support |
| `src/logging/fixed-logger.ts` | Fixed-position log formatter |
| `src/logging/index.ts` | Logger entry point |
| `config/default.yaml` | Base configuration |
| `config/production.yaml` | Production settings |
