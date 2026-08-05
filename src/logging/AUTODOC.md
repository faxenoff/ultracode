# Logging

## 🤖 Overview

The `src/logging` module provides a fixed-position logging system for structured logging, used by developers and system administrators to track events and errors. It includes build information retrieval, logger initialization, and key-value serialization for logging events.

## 🤖 Architecture

```
  +-------------------+
  | build-info.ts     |
  +-------------------+
  |    /              |
  |    v              |
  +-------------------+
  | fixed-logger.ts   |
  +-------------------+
  |    /              |
  |    v              |
  +-------------------+
  | kv-serializer.ts  |
  +-------------------+
  |    /              |
  |    v              |
  +-------------------+
  | log-formatter.ts  |
  +-------------------+
  |    /              |
  |    v              |
  +-------------------+
  | log-types.ts      |
  +-------------------+
  |    /              |
  |    v              |
  +-------------------+
  | logger-adapter.ts |
  +-------------------+
  |    /              |
  |    v              |
  +-------------------+
  | memory-logger.ts  |
  +-------------------+
```

## 🤖 Flow

```
  +-------------------+
  | build-info.ts     |
  +-------------------+
  |    /              |
  |    v              |
  +-------------------+
  | fixed-logger.ts   |
  +-------------------+
  |    /              |
  |    v              |
  +-------------------+
  | kv-serializer.ts  |
  +-------------------+
  |    /              |
  |    v              |
  +-------------------+
  | log-formatter.ts  |
  +-------------------+
  |    /              |
  |    v              |
  +-------------------+
  | log-types.ts      |
  +-------------------+
  |    /              |
  |    v              |
  +-------------------+
  | logger-adapter.ts |
  +-------------------+
  |    /              |
  |    v              |
  +-------------------+
  | memory-logger.ts  |
  +----------------
```

## 🤖 Entity Listing

### Function
- **createLoggerAdapter** — Function to create a logger adapter for compatibility with old RotatedLogger API `logger-adapter.ts:280-282`
- **dataToKV** — Converts data to key-value pairs, normalizing keys and handling nested objects `logger-adapter.ts:92-130`
- **escapeValue** — Escape special characters in quoted string `kv-serializer.ts:14-16`
- **extractEvent** — Extract event from message `logger-adapter.ts:56-87`
- **extractFields** — Extracts specific fields from a ParsedLogLine object into a record `log-formatter.ts:250-287`
- **files** — Array of log files. (Repeated three times in the excerpt) `fixed-logger.ts:116-116`, `fixed-logger.ts:117-125`, `fixed-logger.ts:126-126`
- **formatBuildHash** — Format build hash (8 chars) `log-formatter.ts:68-70`
- **formatDuration** — Not present in the provided entities `kv-serializer.ts:190-192`
- **formatEvent** — Parses and pads the event string to a fixed length `log-formatter.ts:89-91`
- **formatLogLine** — Constructs a formatted log line from a LogEntry object `log-formatter.ts:108-118`
- **formatLogLineColored** — Formats a log line with ANSI colors based on the log level `log-formatter.ts:221-245`
- **formatMemory** — Not present in the provided entities `kv-serializer.ts:198-200`
- **formatMemoryStats** — Function to format memory statistics for logging `memory-logger.ts:105-107`
- **formatModule** — Format module name (20 chars, pad right) `log-formatter.ts:82-84`
- **formatPid** — Format PID with padding (5 chars) `log-formatter.ts:60-63`
- **formatProjectHash** — Format project hash (8 chars) `log-formatter.ts:75-77`
- **formatTimestamp** — Format timestamp as YYYYMMDD-HHmmss.mmm (19 chars) `log-formatter.ts:24-40`
- **getBuildHash** — Gets current git commit hash (first 8 chars) and caches result for performance `build-info.ts:17-75`
- **getBuildInfo** — Returns an object containing the build hash and process ID `build-info.ts:107-112`
- **getLogger** — Get the logger instance `fixed-logger.ts:401-406`
- **getMemoryStats** — Function to get current memory statistics `memory-logger.ts:35-44`
- **getPid** — Retrieves the current process ID, caching it if not already present `build-info.ts:81-87`
- **hash** — Maps each part of the version string to a two-digit string `build-info.ts:60-60`
- **initLogger** — Initializes a fixed-position logger instance with default or provided configuration `fixed-logger.ts:411-417`
- **isMemoryHigh** — Function to determine if memory usage is high `memory-logger.ts:97-100`
- **isValidKey** — Validate key format `kv-serializer.ts:25-27`
- **kvError** — Not present in the provided entities `kv-serializer.ts:219-222`
- **kvOpEnd** — Not present in the provided entities `kv-serializer.ts:212-214`
- **kvOpStart** — Not present in the provided entities `kv-serializer.ts:205-207`
- **logMemory** — Function to log memory statistics for a component `memory-logger.ts:58-67`
- **logMemoryDelta** — Function to log memory delta between two snapshots `memory-logger.ts:76-89`
- **mapCategory** — Map old category to new module `logger-adapter.ts:48-50`
- **needsQuoting** — Check if value needs quoting `kv-serializer.ts:9-11`
- **normalizeKey** — Normalize key to valid format `kv-serializer.ts:30-36`
- **PAD2** — Pre-computed padding lookup tables for hot path logging optimization `log-formatter.ts:17-17`
- **PAD3** — Pre-computed padding lookup tables for hot path logging optimization `log-formatter.ts:18-18`
- **PAD5** — Pre-computed padding lookup tables for hot path logging optimization `log-formatter.ts:19-19`
- **parseKV** — Not present in the provided entities `kv-serializer.ts:114-183`
- **parseLogLine** — Parses a log line into a ParsedLogLine object, handling both worker and main log formats `log-formatter.ts:177-216`
- **parseTimestamp** — Parse timestamp from YYYYMMDD-HHmmss.mmm format `log-formatter.ts:45-55`
- **parseWorkerLogLine** — Parses a worker log line into a ParsedLogLine object `log-formatter.ts:123-172`
- **parts** — Parses the version string into an array of integers `build-info.ts:58-58`
- **resetBuildInfo** — Resets the cached build hash and process ID `build-info.ts:99-102`
- **serializeComplexValue** — Serialize complex value to JSON string `kv-serializer.ts:54-62`
- **serializeKV** — Serialize KV pairs to string `kv-serializer.ts:70-99`
- **serializeValue** — Serialize single value `kv-serializer.ts:39-51`
- **setPid** — Sets the cached process ID to a specified value `build-info.ts:92-94`
- **setProjectHash** — Sets the project hash for the logger `fixed-logger.ts:422-424`
- **totalSize** — Total size of all log files `fixed-logger.ts:129-129`
- **truncate** — Truncate string with ellipsis `kv-serializer.ts:19-22`

### Method
- **agentActivity** — Logs agent activity with data `logger-adapter.ts:230-234`
- **cleanupOldLogs** — Method to clean up old log files `fixed-logger.ts:109-153`
- **close** — Close the logger and flush any remaining log entries `fixed-logger.ts:383-389`
- **configure** — Configure the logger with a new configuration `fixed-logger.ts:376-378`
- **constructor** — Constructor for the FixedLogger class `fixed-logger.ts:38-58`
- **constructor** — Initializes the logger with optional configuration `logger-adapter.ts:138-140`
- **critical** — Logs a critical message with category, message, and optional data `logger-adapter.ts:189-200`
- **d** — Log a debug message `fixed-logger.ts:285-287`
- **d** — Represents a debug log entry `fixed-logger.ts:439-441`
- **debug** — Logs a debug message with category, message, and optional data `logger-adapter.ts:154-160`
- **e** — Log an error message `fixed-logger.ts:270-272`
- **e** — Represents an error log entry `fixed-logger.ts:430-432`
- **error** — Log an error message `fixed-logger.ts:337-339`
- **error** — Logs an error message `fixed-logger.ts:445-447`
- **error** — Logs an error message with category, message, and optional data `logger-adapter.ts:178-187`
- **fixed** — Adapter for compatibility with old RotatedLogger API, allowing gradual migration from old logger to new fixed-position logger `logger-adapter.ts:272-274`
- **flush** — Flush the log buffer to the file `fixed-logger.ts:186-200`
- **flush** — Flushes the logger buffer to the log file `fixed-logger.ts:457-459`
- **flush** — Flushes the logger `logger-adapter.ts:260-262`
- **flushSync** — Synchronously flush the log buffer to the file `fixed-logger.ts:205-220`
- **flushSync** — Synchronously flushes the logger buffer to the log file `fixed-logger.ts:460-462`
- **getLogFilePath** — Method to get the current log file path `fixed-logger.ts:63-67`
- **getProjectHash** — Get the project hash for logging `fixed-logger.ts:369-371`
- **getTodayDateStr** — Method to get today's date string `fixed-logger.ts:100-103`
- **i** — Log an informational message `fixed-logger.ts:280-282`
- **i** — Represents an info log entry `fixed-logger.ts:436-438`
- **incident** — Logs incident activity with data `logger-adapter.ts:246-249`
- **info** — Logs an info message with category, message, and optional data `logger-adapter.ts:162-168`
- **log** — Log a message with the specified level `fixed-logger.ts:225-263`
- **mcpError** — Logs an MCP error with method, error message, and request ID `logger-adapter.ts:222-228`
- **mcpRequest** — Logs an MCP request with method, parameters, and request ID `logger-adapter.ts:206-212`
- **mcpResponse** — Logs an MCP response with method, duration, and request ID `logger-adapter.ts:214-220`
- **op** — Log an operation with start and end `fixed-logger.ts:318-328`
- **op** — Represents an operation log entry `fixed-logger.ts:454-456`
- **opEnd** — End an operation log entry `fixed-logger.ts:310-313`
- **opEnd** — Ends an operation log entry `fixed-logger.ts:451-453`
- **opStart** — Start an operation log entry `fixed-logger.ts:302-305`
- **opStart** — Starts an operation log entry `fixed-logger.ts:448-450`
- **parseActivity** — Logs parsed activity with data `logger-adapter.ts:236-239`
- **queryActivity** — Logs query activity with data `logger-adapter.ts:241-244`
- **recovery** — Logs recovery activity with data `logger-adapter.ts:251-254`
- **rotate** — Method to rotate the log file `fixed-logger.ts:79-95`
- **setBuildHash** — Set the build hash for logging `fixed-logger.ts:355-357`
- **setPid** — Set the process ID for logging `fixed-logger.ts:348-350`
- **setProject** — Sets the project hash for the logger `fixed-logger.ts:463-465`
- **setProjectHash** — Sets the project hash to the first 8 characters of the provided hash or to NO_PROJECT if no hash is provided `fixed-logger.ts:362-364`
- **shouldRotate** — Method to check if log rotation is needed `fixed-logger.ts:72-74`
- **stopFlushLoop** — Stops the flush loop by closing the logger `logger-adapter.ts:264-266`
- **t** — Log a trace message `fixed-logger.ts:290-292`
- **t** — Represents a trace log entry `fixed-logger.ts:442-444`
- **trace** — Logs a trace message with category, message, and optional data `logger-adapter.ts:146-152`
- **w** — Write a message to the log buffer `fixed-logger.ts:275-277`
- **w** — Represents a warning log entry `fixed-logger.ts:433-435`
- **warn** — Logs a warn message with category, message, and optional data `logger-adapter.ts:170-176`
- **writeLine** — Write a line to the log buffer `fixed-logger.ts:158-181`

### Class
- **FixedLogger** — Fixed-position logger instance with buffered writes and rotation `fixed-logger.ts:28-390`
- **LoggerAdapter** — Adapter for compatibility with old RotatedLogger API `logger-adapter.ts:135-275`

### Interface
- **FixedLoggerConfig** — Defines configuration for a fixed logger with properties for log directory, minimum log level, file size, number of files, total size, buffer size, flush interval, and console output `log-types.ts:111-128`
- **LogEntry** — Represents a log entry with various properties `log-types.ts:93-102`
- **MemoryStats** — Interface representing memory usage statistics in MB `memory-logger.ts:14-25`
- **ParsedKVPair** — Not present in the provided entities `kv-serializer.ts:102-106`
- **ParsedLogLine** — Extends LogEntry with additional properties for parsed log lines `log-types.ts:105-108`

### Type_alias
- **KVPairs** — KV pairs record - values can be primitives, arrays, or objects (serialized to JSON) `log-types.ts:68-68`
- **KVValue** — Primitive value types allowed in KV pairs `log-types.ts:65-65`
- **LogLevelChar** — Log level single character `log-types.ts:8-8`
- **ModuleName** — Represents a module name as a type derived from the MODULES object `log-types.ts:165-165`

### Import_decl
- **./build-info.js** — Imports `./build-info.js` from `./build-info.js`. `fixed-logger.ts:9-9`
- **./fixed-logger.js** — Imports `./fixed-logger.js` from `./fixed-logger.js`. `logger-adapter.ts:6-6`
- **./index.js** — Imports `./index.js` from `./index.js`. `memory-logger.ts:8-8`
- **./kv-serializer.js** — Imports `./kv-serializer.js` from `./kv-serializer.js`. `fixed-logger.ts:10-10`, `log-formatter.ts:6-6`
- **./log-formatter.js** — Imports `./log-formatter.js` from `./log-formatter.js`. `fixed-logger.ts:11-11`
- **./log-types.js** — Imports `./log-types.js`. `fixed-logger.ts:12-20`, `log-formatter.ts:7-14`
- **./log-types.js** — Imports `./log-types.js` from `./log-types.js`. `kv-serializer.ts:6-6`, `logger-adapter.ts:7-7`, `logger-adapter.ts:8-8`
- **child_process** — Imports `child_process` from `child_process`. `build-info.ts:6-6`
- **fs** — Imports `fs` from `fs`. `build-info.ts:7-7`
- **node:fs** — Imports `node:fs` from `node:fs`. `fixed-logger.ts:6-6`
- **node:fs/promises** — Imports `node:fs/promises` from `node:fs/promises`. `fixed-logger.ts:7-7`
- **node:path** — Imports `node:path` from `node:path`. `fixed-logger.ts:8-8`
- **path** — Imports `path` from `path`. `build-info.ts:8-8`

### Property
- **arrayBuffers** — ArrayBuffers in MB `memory-logger.ts:22-22`
- **buffer** — Array to buffer log entries `fixed-logger.ts:30-30`
- **bufferSize** — Sets the buffer size for log messages `log-types.ts:123-123`
- **buildHash** — Build hash of the project `fixed-logger.ts:34-34`
- **buildHash** — Field positions in log line (0-indexed) `log-types.ts:97-97`
- **config** — Configuration object for the FixedLogger `fixed-logger.ts:29-29`
- **consoleOutput** — Indicates whether console output is enabled `log-types.ts:127-127`
- **currentFileSize** — Current size of the log file `fixed-logger.ts:33-33`
- **currentLogFile** — Current log file path `fixed-logger.ts:32-32`
- **event** — Field positions in log line (0-indexed) `log-types.ts:100-100`
- **external** — External memory in MB `memory-logger.ts:20-20`
- **flushInterval** — Defines the interval at which logs are flushed `log-types.ts:125-125`
- **flushTimer** — Timer to flush the buffer periodically `fixed-logger.ts:31-31`
- **hash** — Returns the build hash as part of the getBuildInfo function `build-info.ts:107-107`
- **heapTotal** — Total heap size in MB `memory-logger.ts:18-18`
- **heapUsed** — Heap used memory in MB `memory-logger.ts:16-16`
- **key** — Not present in the provided entities `kv-serializer.ts:103-103`
- **kv** — Field positions in log line (0-indexed) `log-types.ts:101-101`
- **level** — Field positions in log line (0-indexed) `log-types.ts:95-95`
- **lineNumber** — Stores the line number of the log entry `log-types.ts:107-107`
- **logDir** — Specifies the directory where logs are stored `log-types.ts:113-113`
- **logger** — Stores a reference to a fixed logger instance `logger-adapter.ts:136-136`
- **maxFiles** — Determines the maximum number of log files to retain `log-types.ts:119-119`
- **maxFileSize** — Sets the maximum file size for log files `log-types.ts:117-117`
- **maxTotalSize** — Specifies the total size of all log files `log-types.ts:121-121`
- **minLevel** — Defines the minimum log level to be considered `log-types.ts:115-115`
- **module** — Field positions in log line (0-indexed) `log-types.ts:99-99`
- **mtime** — Modification time of the log file `fixed-logger.ts:126-126`
- **name** — Name of the log file `fixed-logger.ts:126-126`
- **path** — Path to the log file `fixed-logger.ts:126-126`
- **pid** — Returns the process ID as part of the getBuildInfo function `build-info.ts:107-107`
- **pid** — Process ID of the current process `fixed-logger.ts:36-36`
- **pid** — Field positions in log line (0-indexed) `log-types.ts:96-96`
- **projectHash** — Project hash, defaulting to "--------" `fixed-logger.ts:35-35`
- **projectHash** — Field positions in log line (0-indexed) `log-types.ts:98-98`
- **raw** — Not present in the provided entities `kv-serializer.ts:105-105`
- **raw** — Represents the raw log line as a string `log-types.ts:106-106`
- **rss** — Resident Set Size in MB `memory-logger.ts:24-24`
- **size** — Size of the log file `fixed-logger.ts:126-126`
- **timestamp** — Field positions in log line (0-indexed) `log-types.ts:94-94`
- **value** — Not present in the provided entities `kv-serializer.ts:104-104`

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
| `log` | const | Global logging object with `i()`, `e()`, `w()`, `d()`, `t()`, `op()` methods | [`fixed-logger.ts:28-390`](./fixed-logger.ts) |
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
| `LOG_FIELD_POSITIONS` | const | Start/end positions of fields in a log string | [`log-types.ts:33-46`](./log-types.ts) |
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
