---
module_name: config
description: "Centralized configuration management with cascading YAML, environment variables, and typed defaults"
status: active
language: typescript
entry_point: yaml-config.ts
exports: [ConfigLoader, getConfig, getMCPConfigSafe, initializeConfig, validateConfig, buildWorkerEmbeddingConfig, CONSTANTS, CACHE_CONSTANTS, DATABASE_CONSTANTS, PARSER_CONSTANTS, AGENT_CONSTANTS, RESOURCE_CONSTANTS, INDEXING_CONSTANTS, VECTOR_CONSTANTS, LOGGING_CONFIG, MCP_LOG_CATEGORIES, DEFAULT_CONFIG]
dependencies: [logging, utils, shared, types]
tags: [configuration, yaml, environment-variables, singleton, constants]
---

# Configuration

> Centralized configuration system providing type-safe application settings through cascading YAML files, environment variables, and TypeScript defaults with a lazy-initialized singleton pattern.

## Overview

The configuration module manages all application-wide settings for the MCP server. It implements a cascading priority system: override path > environment-specific YAML > default YAML > environment variables > TypeScript defaults. The module uses a singleton `ConfigLoader` class with lazy initialization, ensuring thread-safe access after startup. It also provides a centralized constants catalog and specialized embedding provider configuration builder.

## Data Flow

### Inputs
| Source | Data | Type |
|--------|------|------|
| YAML files | `config/default.yaml`, `config/{NODE_ENV}.yaml` | File system |
| Environment | `MCP_*`, `DATABASE_*`, `LOG_*`, `PARSER_*` (100+ vars) | `process.env` |
| TypeScript defaults | `DEFAULT_CONFIG` | Static object |

### Processing
1. Resolve config file path (override > env-specific > default > env-only mode)
2. Read and parse YAML with `yaml.parse()` (sync, catch errors gracefully)
3. Merge YAML values with environment variables using typed parsers
4. Apply TypeScript defaults for any missing values
5. Cache result in singleton instance; cache `WorkerEmbeddingConfig` at module level

### Outputs
| Target | Data | Type |
|--------|------|------|
| All modules | `AppConfig` object | Via `getConfig()` |
| MCP tools | `MCPConfig & { embeddingAvailable }` | Via `getMCPConfigSafe()` |
| Worker processes | `WorkerEmbeddingConfig` | Via `buildWorkerEmbeddingConfig()` |

## Public API

| Export | Type | Description | Location |
|--------|------|-------------|----------|
| `ConfigLoader` | class | Singleton config loader with reload support | [`yaml-config.ts:130-804`](./yaml-config.ts) |
| `getConfig()` | function | Get global `AppConfig` | [`yaml-config.ts:813-815`](./yaml-config.ts) |
| `getMCPConfigSafe()` | function | Get MCP config with embedding availability flag | [`yaml-config.ts:820-820`](./yaml-config.ts) |
| `initializeConfig()` | function | Initialize config and log startup info | [`yaml-config.ts:833-844`](./yaml-config.ts) |
| `validateConfig()` | function | Validate config, return error array | [`yaml-config.ts:853-853`](./yaml-config.ts) |
| `buildWorkerEmbeddingConfig()` | function | Build worker-specific embedding config (cached) | [`worker-embedding-config.ts:214-249`](./worker-embedding-config.ts) |
| `CONSTANTS` | const | All constants as single aggregate object | [`constants.ts:277-285`](./constants.ts) |
| `CACHE_CONSTANTS` | const | Cache TTL, max entries, eviction settings | [`constants.ts:26-47`](./constants.ts) |
| `DATABASE_CONSTANTS` | const | SQLite pool size, page size, WAL limits | [`constants.ts:58-93`](./constants.ts) |
| `PARSER_CONSTANTS` | const | Parser circuit breaker limits | [`constants.ts:104-124`](./constants.ts) |
| `AGENT_CONSTANTS` | const | Multi-agent concurrency, timeouts | [`constants.ts:135-160`](./constants.ts) |
| `RESOURCE_CONSTANTS` | const | Memory, CPU allocation limits | [`constants.ts:171-191`](./constants.ts) |
| `INDEXING_CONSTANTS` | const | Batch sizes, thresholds | [`constants.ts:202-222`](./constants.ts) |
| `VECTOR_CONSTANTS` | const | Vector similarity search config | [`constants.ts:233-268`](./constants.ts) |
| `LOGGING_CONFIG` | const | Logger transport configuration | [`logging-config.ts:11-20`](./logging-config.ts) |
| `DEFAULT_CONFIG` | const | Default `AppConfig` values | [`config-defaults.ts:14-186`](./config-defaults.ts) |
| 30+ interfaces | type | `MCPConfig`, `DatabaseConfig`, `ParserConfig`, etc. | [`config-types.ts`](./config-types.ts) |


### Added Entities

- **EmbeddingModel** — `models-catalog.ts:19-34`
- **ModelsCatalog** — `models-catalog.ts:36-40`
- **loadModelsCatalog** — `models-catalog.ts:52-87`
- **parseCatalog** — `models-catalog.ts:89-117`
- **getActiveModel** — `models-catalog.ts:124-127`
- **getModelById** — `models-catalog.ts:130-133`
- **getAvailableModels** — `models-catalog.ts:136-139`
- **getCdnUrl** — `models-catalog.ts:142-149`
- **configDir** — `models-catalog.ts:57-57`
- **jsonPath** — `models-catalog.ts:58-58`
- **raw** — `models-catalog.ts:59-59`
- **models** — `models-catalog.ts:90-90`
- **rawModels** — `models-catalog.ts:91-91`
- **catalog** — `models-catalog.ts:125-125`
- **catalog** — `models-catalog.ts:131-131`
- **catalog** — `models-catalog.ts:137-137`
- **catalog** — `models-catalog.ts:143-143`
- **model** — `models-catalog.ts:144-144`
- **path** — `models-catalog.ts:146-146`
- **_cached** — `models-catalog.ts:46-46`

## Dependencies

### Internal Modules
| Module | Purpose | Interaction |
|--------|---------|-------------|
| `logging` | Structured logging during config load | `log.i/w/e` calls |
| `utils` | File operations, config path resolution | `existsSync`, `readTextSync`, `loadSemanticConfig` |
| `shared` | Centralized log directory path | `getLogsDir()` |
| `types` | Embedding type definitions | `EmbeddingProviderKind`, `WorkerEmbeddingConfig` |

### External Packages
| Package | Purpose |
|---------|---------|
| `yaml` | YAML file parsing |
| `node:path` | Path resolution |

## Configuration

The config module itself defines 100+ parameters organized by section. Key sections:

| Section | Parameters | Key Env Vars | Description |
|---------|-----------|-------------|-------------|
| `mcp.embedding` | model, provider, enabled, useReranker | `MCP_EMBEDDING_*` | Embedding provider settings |
| `mcp.server` | host, port, timeout | `MCP_SERVER_*` | MCP server binding |
| `mcp.agents` | maxConcurrent, defaultTimeout | `MCP_MAX_CONCURRENT_AGENTS` | Agent runtime limits |
| `database` | path, mode, cacheSize, mmapSize | `DATABASE_*` | SQLite tuning (WAL, sync, cache) |
| `logging` | level, format, outputFile, maxFiles | `LOG_*` | Log output configuration |
| `parser` | treeSitter settings, incremental cache | `PARSER_*` | Tree-sitter and cache settings |
| `indexing` | autoSwitch, incrementalThreshold, dataDir | `INDEXING_*` | Branch management, reindex strategy |
| `git` | watchBranch, pollInterval, debounce | `GIT_*` | Git watcher configuration |
| Agent sections | maxConcurrency, memoryLimit, priority | `*_AGENT_*` | Per-agent resource limits |

See [`config-types.ts`](./config-types.ts) for full interface definitions. See [`config-defaults.ts`](./config-defaults.ts) for all default values.

## Behavioral Properties

| Property | Value |
|----------|-------|
| Async | No -- all operations synchronous (`readTextSync`, no Promises) |
| Thread Safety | Singleton pattern; safe after initialization (read-only access) |
| Idempotency | Yes -- `getConfig()` returns same object; `reload()` is explicit |
| Side Effects | Reads filesystem (YAML), reads `process.env`, logs via logger, `process.exit(1)` on missing override |
| State | Singleton -- `ConfigLoader.instance` + module-level `WorkerEmbeddingConfig` cache |

## Error Handling

Graceful degradation: YAML parse failure falls back to environment variables; invalid env vars fall back to defaults. Only a missing override path causes `process.exit(1)`.

| Error | When | Recovery |
|-------|------|----------|
| YAML parse failure | Malformed or missing config file | Log warning, fall back to env vars + defaults |
| Missing override path | `setOverridePath()` with non-existent file | Log error, `process.exit(1)` |
| Invalid enum env var | Unrecognized value for provider/mode/level | Parser returns `undefined`, default used |
| Validation errors | `validateConfig()` called post-load | Returns error array; app continues |

## Observability

| Event | Level | When |
|-------|-------|------|
| `CONFIG:loaded` | info | Config file successfully parsed |
| `CONFIG:yaml_load_fail` | warn | YAML parse error, falling back |
| `CONFIG:fallback_env` | warn | Using env vars only |
| `CONFIG:override_not_found` | error | Override path does not exist |
| `CONFIG:init` | info | Configuration initialized (env, debug, embEnabled) |
| `WORKEMBCONF:config_built` | info | Worker embedding config created |

## Known Limitations

- No event-based reload notification -- consumers must re-call `getConfig()` after `reload()`
- Synchronous only -- cannot load config from remote sources
- Validation is opt-in (separate `validateConfig()` call, not enforced on load)
- `WorkerEmbeddingConfig` cache has no TTL (lives for application lifetime)
- No config format migration/versioning system
- API keys are static after load (no secrets rotation)

## TypeScript Notes

### Module Boundary
`index.ts` re-exports all public symbols. Internal: `ConfigLoader` private methods (`loadConfiguration`, `mergeWithEnvironment`, type parsers). Constants use `as const` for literal type inference.

## Files

| File | Description |
|------|-------------|
| [`yaml-config.ts`](./yaml-config.ts) | Main ConfigLoader class, cascading merge logic, public API functions |
| [`config-types.ts`](./config-types.ts) | 30+ TypeScript interfaces for all configuration sections |
| [`config-defaults.ts`](./config-defaults.ts) | `DEFAULT_CONFIG` with all default values |
| [`constants.ts`](./constants.ts) | Global constants catalog (7 groups + aggregate) |
| [`logging-config.ts`](./logging-config.ts) | Logger transport and category configuration |
| [`worker-embedding-config.ts`](./worker-embedding-config.ts) | Embedding config builder for worker subprocesses |
