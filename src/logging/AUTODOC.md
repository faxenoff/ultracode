---
module_name: logging
description: "Fixed-position structured logging with buffered file output, rotation, KV serialization, and memory tracking"
status: active
language: typescript
entry_point: index.ts
exports: [log, FixedLogger, getLogger, initLogger, setProjectHash, getBuildHash, getPid, setPid, resetBuildInfo, getBuildInfo, serializeKV, parseKV, kvOpStart, kvOpEnd, kvError, formatDuration, formatMemory, formatTimestamp, parseTimestamp, formatPid, formatBuildHash, formatModule, formatEvent, formatLogLine, parseLogLine, formatLogLineColored, extractFields, LogLevelChar, LOG_LEVEL_VALUES, LOG_LEVEL_NAMES, LOG_FIELD_POSITIONS, LOG_FIELD_LENGTHS, KV_CONSTRAINTS, KVValue, KVPairs, STANDARD_KEYS, LogEntry, ParsedLogLine, FixedLoggerConfig, DEFAULT_LOGGER_CONFIG, MODULES, ModuleName, LoggerAdapter, createLoggerAdapter, getMemoryStats, logMemory, logMemoryDelta, isMemoryHigh, formatMemoryStats, MemoryStats]
dependencies: [child_process, fs, path, process]
tags: [observability, structured-logging, fixed-position, buffering, file-rotation, memory-tracking]
---

# Logging

> Fixed-position structured logging system with machine-readable format, buffered file output with rotation, KV serialization, and memory monitoring utilities.

## Overview

The logging module provides a high-performance structured logging system where every log line has fields at exact character positions (`YYYYMMDD-HHmmss.mmm L PPPPP HHHHHHHH PPPPPPPP MODULE EVENT kv...`), enabling efficient machine parsing. It features a `FixedLogger` class with configurable buffering and automatic file rotation, key-value pair serialization with quoting and normalization, and a compatibility adapter for migrating from a legacy logger API. The module also includes memory monitoring utilities for tracking heap and RSS usage across components. All file I/O uses synchronous Node.js APIs with comprehensive error swallowing to ensure logging never crashes the application.

## Data Flow

### Inputs

| Source | Data | Type |
|--------|------|------|
| Application code | Log calls (`log.i()`, `log.e()`, etc.) with module, event, KV pairs | Function calls |
| Configuration | `FixedLoggerConfig` (logDir, minLevel, maxFileSize, bufferSize, etc.) | Object |
| Build metadata | Git hash, VERSION file, package.json version, process PID | String / Number |
| Memory API | `process.memoryUsage()` for heap, RSS, external stats | Node.js API |

### Processing

1. Collect build info: `getBuildHash()` tries `git rev-parse`, then VERSION file, then package.json, fallback `"00000000"`
2. Filter by level: compare log level against `minLevel` (T=0 < D=1 < I=2 < W=3 < E=4)
3. Serialize KV pairs: normalize keys (lowercase, underscore), quote values with spaces, enforce size limits
4. Format log line: place timestamp(19), level(1), PID(5), buildHash(8), projectHash(8), module(20), event(20) at fixed positions, append KV
5. Buffer or write: add formatted line to in-memory buffer; flush on timer (`flushInterval`), buffer full (`bufferSize`), or ERROR level
6. Rotate files: when file exceeds `maxFileSize`, rename to `.1`, `.2`, etc.; delete oldest when `maxTotalSize` exceeded
7. Optional console output: write colored version to stderr when `consoleOutput=true`

### Outputs

| Target | Data | Type |
|--------|------|------|
| Log files | `<logDir>/ultracode-YYYYMMDD.log` (with `.1`, `.2` rotations) | File (appendFileSync) |
| Console stderr | ANSI-colored formatted log lines | Stream |
| Callers | `ParsedLogLine` objects from `parseLogLine()` | Structured data |
| Memory callers | `MemoryStats` objects from `getMemoryStats()` | Structured data |

## Public API

| Export | Type | Description | Location |
|--------|------|-------------|----------|
| `log` | const | Global logging object with `i()`, `e()`, `w()`, `d()`, `t()`, `op()` methods | [`fixed-logger.ts:346-351`](./fixed-logger.ts) |
| `FixedLogger` | class | Logger class with fixed field positions, buffering, and rotation | [`fixed-logger.ts:22-22`](./fixed-logger.ts) |
| `getLogger` | function | Get the global singleton logger instance | [`fixed-logger.ts:318-318`](./fixed-logger.ts) |
| `initLogger` | function | Initialize logger with configuration, replaces global instance | [`fixed-logger.ts:328-330`](./fixed-logger.ts) |
| `setProjectHash` | function | Set the project hash for all log lines | [`fixed-logger.ts:339-344`](./fixed-logger.ts) |
| `getBuildHash` | function | Get git commit hash (cached, with fallbacks) | [`build-info.ts:17-75`](./build-info.ts) |
| `getPid` | function | Get current process identifier (cached) | [`build-info.ts:81-87`](./build-info.ts) |
| `setPid` | function | Set custom process identifier (for workers) | [`build-info.ts:92-94`](./build-info.ts) |
| `resetBuildInfo` | function | Reset cached build hash and PID | [`build-info.ts:99-102`](./build-info.ts) |
| `getBuildInfo` | function | Get object with hash and pid | [`build-info.ts:107-107`](./build-info.ts) |
| `serializeKV` | function | Convert KV pairs to normalized string with quoting | [`kv-serializer.ts:70-99`](./kv-serializer.ts) |
| `parseKV` | function | Parse KV string back into typed object | [`kv-serializer.ts:114-183`](./kv-serializer.ts) |
| `kvOpStart` | function | Create KV pairs for operation start event | [`kv-serializer.ts:205-207`](./kv-serializer.ts) |
| `kvOpEnd` | function | Create KV pairs for operation end (dur, ok) | [`kv-serializer.ts:212-214`](./kv-serializer.ts) |
| `kvError` | function | Create KV pairs from Error object | [`kv-serializer.ts:219-222`](./kv-serializer.ts) |
| `formatDuration` | function | Format milliseconds as `"45ms"` string | [`kv-serializer.ts:190-192`](./kv-serializer.ts) |
| `formatMemory` | function | Convert bytes to whole MB number | [`kv-serializer.ts:198-200`](./kv-serializer.ts) |
| `formatTimestamp` | function | Format Date to `YYYYMMDD-HHmmss.mmm` (19 chars) | [`log-formatter.ts:17-17`](./log-formatter.ts) |
| `parseTimestamp` | function | Parse timestamp string back to Date | [`log-formatter.ts:45-55`](./log-formatter.ts) |
| `formatPid` | function | Format PID to 5-char padded string | [`log-formatter.ts:45-55`](./log-formatter.ts) |
| `formatBuildHash` | function | Format build hash to 8 chars (padEnd with '0') | [`log-formatter.ts:45-55`](./log-formatter.ts) |
| `formatModule` | function | Format module name to 20 chars (padEnd) | [`log-formatter.ts:68-70`](./log-formatter.ts) |
| `formatEvent` | function | Format event name to 20 chars (padEnd) | [`log-formatter.ts:75-77`](./log-formatter.ts) |
| `formatLogLine` | function | Format LogEntry into fixed-position string | [`log-formatter.ts:89-91`](./log-formatter.ts) |
| `parseLogLine` | function | Parse log string into ParsedLogLine or null | [`log-formatter.ts:108-118`](./log-formatter.ts) |
| `formatLogLineColored` | function | Format log line with ANSI color codes | [`log-formatter.ts:123-172`](./log-formatter.ts) |
| `extractFields` | function | Extract specific fields from a ParsedLogLine | [`log-formatter.ts:123-172`](./log-formatter.ts) |
| `LogLevelChar` | type | Log level character union: `E \| W \| I \| D \| T` | [`log-types.ts:8-8`](./log-types.ts) |
| `LOG_LEVEL_VALUES` | const | Numeric values for level filtering (T=0..E=4) | [`log-types.ts:8-8`](./log-types.ts) |
| `LOG_LEVEL_NAMES` | const | Full level names for display | [`log-types.ts:20-26`](./log-types.ts) |
| `LOG_FIELD_POSITIONS` | const | Start/end positions of fields in a log string | [`log-types.ts:29-44`](./log-types.ts) |
| `LOG_FIELD_LENGTHS` | const | Character lengths of each fixed field | [`log-types.ts:47-55`](./log-types.ts) |
| `KV_CONSTRAINTS` | const | Max key/value/total length constraints | [`log-types.ts:58-62`](./log-types.ts) |
| `KVValue` | type | Primitive value type: `string \| number \| boolean \| null \| undefined` | [`log-types.ts:65-65`](./log-types.ts) |
| `KVPairs` | type | Record of string keys to KVValue or complex types | [`log-types.ts:68-68`](./log-types.ts) |
| `STANDARD_KEYS` | const | Standard KV keys (dur, req, err, file, cnt, ok, op) | [`log-types.ts:65-65`](./log-types.ts) |
| `LogEntry` | interface | Complete log entry structure with all fields | [`log-types.ts:93-102`](./log-types.ts) |
| `ParsedLogLine` | interface | Parsed log line with metadata (extends LogEntry) | [`log-types.ts:105-108`](./log-types.ts) |
| `FixedLoggerConfig` | interface | Logger configuration parameters | [`log-types.ts:111-128`](./log-types.ts) |
| `DEFAULT_LOGGER_CONFIG` | const | Default config values for logger creation | [`log-types.ts:131-140`](./log-types.ts) |
| `MODULES` | const | Enum of application module names (PARSER, INDEXER, etc.) | [`log-types.ts:143-163`](./log-types.ts) |
| `ModuleName` | type | String union of allowed module names from MODULES | [`log-types.ts:165-165`](./log-types.ts) |
| `LoggerAdapter` | class | Compatibility adapter wrapping old logger API | [`logger-adapter.ts:135-275`](./logger-adapter.ts) |
| `createLoggerAdapter` | function | Create adapter for legacy logging API migration | [`logger-adapter.ts:280-282`](./logger-adapter.ts) |
| `getMemoryStats` | function | Get current heap, RSS, external memory in MB | [`memory-logger.ts:35-44`](./memory-logger.ts) |
| `logMemory` | function | Log memory stats for a component at INFO level | [`memory-logger.ts:58-67`](./memory-logger.ts) |
| `logMemoryDelta` | function | Log memory change between two snapshots | [`memory-logger.ts:76-89`](./memory-logger.ts) |
| `isMemoryHigh` | function | Check if heap usage exceeds a threshold in MB | [`memory-logger.ts:97-100`](./memory-logger.ts) |
| `formatMemoryStats` | function | Format MemoryStats as compact `heap=X rss=Y` string | [`memory-logger.ts:105-107`](./memory-logger.ts) |
| `MemoryStats` | interface | Interface for memory usage statistics (heapMB, rssMB, etc.) | [`memory-logger.ts:14-25`](./memory-logger.ts) |

## Dependencies

### Internal Modules

| Module | Purpose | Interaction |
|--------|---------|-------------|
| None | This is a foundational module | Other modules depend on logging, not the reverse |

### External Packages

| Package | Purpose |
|---------|---------|
| `child_process` (Node.js) | `execSync` for `git rev-parse` to get build hash |
| `fs` (Node.js) | `appendFileSync`, `mkdirSync`, `renameSync`, `statSync` for log file I/O |
| `path` (Node.js) | `path.join` for constructing file paths |
| `process` (Node.js) | `process.pid`, `process.memoryUsage()` for runtime info |

No third-party NPM dependencies.

## Configuration

| Parameter | Default | Description |
|-----------|---------|-------------|
| `logDir` | `""` | Directory for log files; empty string disables file output |
| `minLevel` | `"I"` | Minimum log level to record (T < D < I < W < E) |
| `maxFileSize` | `10485760` (10 MB) | Max single log file size before rotation |
| `maxFiles` | `20` | Max number of rotated log files to keep |
| `maxTotalSize` | `104857600` (100 MB) | Max total size of all log files |
| `bufferSize` | `50` | Number of lines to buffer before flushing to disk |
| `flushInterval` | `500` | Flush interval in milliseconds (via setInterval) |
| `consoleOutput` | `false` | Whether to also write colored output to stderr |

## Behavioral Properties

| Property | Value |
|----------|-------|
| Async | Mostly synchronous -- `log.i/e/w/d/t()` are sync void; `log.op()` is async (wraps a Promise); flush uses `appendFileSync` |
| Thread Safety | Single-threaded (Node.js event loop); for `worker_threads`, each worker needs its own instance with unique PID via `setPid()` |
| Idempotency | Log calls are append-only and independently repeatable; `setProjectHash`, `setPid` are idempotent setters |
| Side Effects | File creation/append, file rotation/deletion, stderr output, setInterval timer for flush |
| State | Singleton -- global `FixedLogger` instance with cached build hash, PID, buffer, and flush timer |

## Error Handling

The module follows a "never crash" philosophy: all file I/O and external process calls are wrapped in try-catch blocks that silently swallow errors with graceful degradation. `getBuildHash()` uses a three-level fallback chain (git -> VERSION file -> package.json -> `"00000000"`). `log.op()` catches errors from the wrapped function, logs them with `kvError()`, then re-throws.

| Error | When | Recovery |
|-------|------|----------|
| `git rev-parse` fails | No git repo or git not installed | Falls back to VERSION file, then package.json |
| `appendFileSync` fails | Disk full, permissions, path invalid | Silently ignored; log line lost |
| `renameSync` fails | During file rotation | Silently ignored; continues writing to current file |
| `JSON.parse` fails | Parsing KV string with invalid JSON | Returns raw string as `{data: kvString}` |
| Wrapped function throws | Inside `log.op()` callback | Logs error with `ok=false`, re-throws to caller |

## Observability

This IS the observability module for the system. It provides structured logging, operation tracking, and memory monitoring to all other modules.

**Structured logging**: Fixed-position fields enable grep/awk parsing; KV pairs carry rich context (duration, error messages, file paths, counts). **Operation tracking**: `log.opStart()`/`log.opEnd()`/`log.op()` measure duration with automatic `dur` and `ok` fields. **Error tracking**: `log.error()` and `kvError()` extract messages from Error objects into structured KV. **Memory monitoring**: `getMemoryStats()`, `logMemory()`, `logMemoryDelta()`, and `isMemoryHigh()` track heap/RSS usage per component. **Process identification**: Build hash, project hash, PID, and module name in every line enable tracing across processes and versions.

## Known Limitations

- Fixed field lengths truncate long values: module and event names capped at 20 chars, KV keys at 16, KV values at 64
- Synchronous `appendFileSync` blocks the event loop during flush; mitigated by buffering but not eliminated
- File rotation is size-based only, not time-based; a single file may span multiple days if volume is low
- No built-in log shipping to external aggregation services; logs are local files and stderr only
- Large buffer sizes increase memory pressure; the buffer holds formatted strings until flush
- `parseLogLine()` may misparse lines containing `[WORKER:` in the message body

## TypeScript Notes

### Module Boundary

`index.ts` re-exports 52 symbols from 6 internal files. Not re-exported (internal only): `formatProjectHash` from log-formatter.ts, `ParsedKVPair` interface from kv-serializer.ts, and internal padding/lookup tables. The `log` const uses getter proxies to forward calls to the global `FixedLogger` singleton, making it safe to import at module load time before `initLogger()` is called. `LoggerAdapter` provides a bridge from legacy API (`logger.info(category, message, data)`) to the new fixed-position API.

## Exports

- `getBuildHash`
- `getBuildInfo`
- `getPid`
- `resetBuildInfo`
- `setPid`
- `FixedLogger`
- `getLogger`
- `initLogger`
- `log`
- `setProjectHash`
- `formatDuration`
- `formatMemory`
- `kvError`
- `kvOpEnd`
- `kvOpStart`
- `parseKV`
- `serializeKV`
- `extractFields`
- `formatBuildHash`
- `formatEvent`
- `formatLogLine`
- `formatLogLineColored`
- `formatModule`
- `formatPid`
- `formatTimestamp`
- `parseLogLine`
- `parseTimestamp`
- `DEFAULT_LOGGER_CONFIG`
- `KV_CONSTRAINTS`
- `LOG_FIELD_LENGTHS`
- `LOG_FIELD_POSITIONS`
- `LOG_LEVEL_NAMES`
- `LOG_LEVEL_VALUES`
- `MODULES`
- `STANDARD_KEYS`
- `createLoggerAdapter`
- `LoggerAdapter`
- `formatMemoryStats`
- `getMemoryStats`
- `isMemoryHigh`
- `logMemory`
- `logMemoryDelta`

## Files

| File | Description |
|------|-------------|
| [`index.ts`](./index.ts) | Public API re-exports from all submodules (105 lines) |
| [`build-info.ts`](./build-info.ts) | Git commit hash retrieval with fallbacks, PID caching (113 lines) |
| [`fixed-logger.ts`](./fixed-logger.ts) | Core FixedLogger class with buffering, rotation, and global `log` object (444 lines) |
| [`kv-serializer.ts`](./kv-serializer.ts) | KV pair serialization, parsing, quoting, normalization, and helpers (223 lines) |
| [`log-formatter.ts`](./log-formatter.ts) | Fixed-position log line formatting, parsing, coloring, and field extraction (288 lines) |
| [`log-types.ts`](./log-types.ts) | Type definitions, constants, field positions, level values, MODULES enum (166 lines) |
| [`logger-adapter.ts`](./logger-adapter.ts) | Legacy API compatibility adapter with category-to-module mapping (283 lines) |
| [`memory-logger.ts`](./memory-logger.ts) | Memory usage tracking, delta logging, threshold checking (108 lines) |
