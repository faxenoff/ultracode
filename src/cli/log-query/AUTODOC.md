# Log Query

## 🤖 Overview

The `ulog` CLI tool allows users to query logs efficiently by filtering based on log levels, modules, events, time, and key-value pairs. It is designed for developers and system administrators who need to analyze log files quickly without full-text search capabilities. The tool supports both static and dynamic log file analysis, including real-time following of log files.

## 🤖 Architecture

```
  +---------------------+
  |     log-query-cli   |
  |     (CLI entry point)|
  +---------------------+
           |
           v
  +---------------------+
  |   parseArgs         |
  |   (command-line args)|
  +---------------------+
           |
           v
  +---------------------+
  |   findLogFiles      |
  |   (log file discovery)|
  +---------------------+
           |
           v
  +---------------------+
  |   processLogFiles   |
  |   (log file processing)|
  +---------------------+
           |
           v
  +---------------------+
  |   log-reader        |
  |   (log file reading) |
  +---------------------+
           |
           v
  +---------------------+
  |   query-parser      |
  |   (query parsing)    |
  +---------------------+
           |
           v
  +---------------------+
  |   time-parser       |
  |   (time parsing)     |
  +---------------------+
```

## 🤖 Flow

```
  +---------------------+
  |     log-query-cli   |
  |     (CLI entry point)|
  +---------------------+
           |
           v
  +---------------------+
  |   parseArgs         |
  |   (command-line args)|
  +---------------------+
           |
           v
  +---------------------+
  |   findLogFiles      |
  |   (log file discovery)|
  +---------------------+
           |
           v
  +----------------
  |   processLogFiles   |
  |   (log file processing)|
  +---------------------+
           |
           v
  +---------------------+
  |   log-reader        |
  |   (log file reading) |
  +---------------------+
           |
           v
  +---------------------+
  |   query-parser      |
  |   (query parsing)    |
  +---------------------+
           |
           v
  +---------------------+
  |   time-parser       |
  |   (time parsing)     |
  +---------------------+
```

## 🤖 Entity Listing

### Function
- **collectEmbeddingSessions** — Collects embedding sessions `log-reader.ts:296-388`
- **createStats** — Creates an empty LogStats object `log-reader.ts:33-46`
- **files** — Represents log files being processed `log-reader.ts:163-163`
- **files** — Filters log files by type and ends with ".log" `log-reader.ts:157-162`, `log-reader.ts:164-168`
- **findLogFiles** — Finds log files in a specified directory, filtering by type and sorting by modification time `log-reader.ts:152-173`
- **followLogFile** — Continuously follows a log file `log-reader.ts:221-271`
- **formatEmbeddingStats** — Formats embedding statistics `log-reader.ts:393-437`
- **formatEntry** — Formats a parsed log entry for output `log-reader.ts:76-113`
- **formatFields** — Parses and formats log fields into a string `log-reader.ts:118-123`
- **formatRelativeTime** — Formats a date relative to the current time `time-parser.ts:127-143`
- **formatStats** — Formats log processing statistics `log-reader.ts:442-492`
- **getDefaultLogDir** — Determines the default directory for log files based on the operating system `log-reader.ts:128-145`
- **main** — Parses command-line arguments and processes log files based on specified filters and options `log-query-cli.ts:78-192`
- **matches** — Checks if the entry's module matches any of the provided module patterns `query-parser.ts:324-327`
- **matches** — Checks if the entry's event matches any of the provided event patterns `query-parser.ts:333-336`
- **matchesFilter** — Evaluates whether a log entry matches the specified filter criteria `query-parser.ts:308-387`
- **parseAbsoluteTime** — Parses an absolute time string in log format into a Date object `time-parser.ts:50-110`
- **parseArgs** — Parses command line arguments into LogQueryFilter structure `query-parser.ts:113-303`
- **parseKVFilter** — Parses key-value filter string into KVFilter interface `query-parser.ts:87-108`
- **parseLevels** — Parses level filter string into LogLevelChar array `query-parser.ts:57-69`
- **parseRelativeTime** — Parses a relative time string into a Date object `time-parser.ts:33-44`
- **parseTime** — Parses a time string into a Date object or null `time-parser.ts:115-122`
- **parseTimeRange** — Parses a time range from strings into a TimeRange object `time-parser.ts:153-166`
- **patternToRegex** — Converts glob pattern to regular expression `query-parser.ts:75-81`
- **processLogFiles** — Processes log files line by line `log-reader.ts:178-216`
- **summaryEntries** — Stores summary entries for log processing `log-reader.ts:298-298`
- **topEvents** — Represents a record of log events with statistics such as total, matched, by level, by module, by event, first timestamp, last timestamp, average duration, total duration, and duration count `log-reader.ts:477-477`
- **topModules** — Tracks top modules in log entries `log-reader.ts:468-468`
- **total** — Tracks the total count of log entries `log-reader.ts:352-352`
- **total** — Calculates the total count of entries in the current session `log-reader.ts:375-375`
- **updateStats** — Updates LogStats with a parsed log entry `log-reader.ts:51-71`
- **vectorEvents** — Stores vector events for log processing `log-reader.ts:323-323`

### Interface
- **EmbeddingSession** — Represents an embedding session `log-reader.ts:276-290`
- **KVFilter** — Defines a key-value filter with a key, operation, and value `query-parser.ts:18-22`
- **LogQueryFilter** — A structure for filtering log queries based on time range, levels, modules, events, and key-value filters `query-parser.ts:27-37`
- **LogStats** — Stats accumulator for log file processing `log-reader.ts:17-28`
- **OutputOptions** — Options for output formatting and filtering `query-parser.ts:42-51`
- **TimeRange** — Represents a time range with from and to dates `time-parser.ts:148-151`

### Type_alias
- **KVFilterOp** — Represents a comparison operation for key-value filters `query-parser.ts:13-13`

### Import_decl
- **../../logging/log-formatter.js** — Imports `../../logging/log-formatter.js` from `../../logging/log-formatter.js`. `log-reader.ts:9-9`
- **../../logging/log-types.js** — Imports `../../logging/log-types.js` from `../../logging/log-types.js`. `log-query-cli.ts:20-20`, `log-reader.ts:10-10`, `log-reader.ts:11-11`, `query-parser.ts:6-6`, `query-parser.ts:7-7`
- **./log-reader.js** — Imports `./log-reader.js`. `log-query-cli.ts:21-33`
- **./query-parser.js** — Imports `./query-parser.js` from `./query-parser.js`. `log-query-cli.ts:34-34`, `log-reader.ts:12-12`
- **./time-parser.js** — Imports `./time-parser.js` from `./time-parser.js`. `query-parser.ts:8-8`
- **node:fs** — Imports `node:fs` from `node:fs`. `log-reader.ts:6-6`
- **node:path** — Imports `node:path` from `node:path`. `log-reader.ts:7-7`
- **node:readline** — Imports `node:readline` from `node:readline`. `log-reader.ts:8-8`

### Property
- **avgDuration** — Average duration of log entries `log-reader.ts:25-25`
- **avgMsPerEmb** — Tracks the average time per embedding `log-reader.ts:285-285`
- **batches** — Manages batches of log entries `log-reader.ts:282-282`
- **byEvent** — Count of log entries by their event `log-reader.ts:22-22`
- **byLevel** — Count of log entries by their level `log-reader.ts:20-20`
- **byModule** — Count of log entries by their module `log-reader.ts:21-21`
- **cacheHits** — Tracks cache hits during embedding `log-reader.ts:289-289`
- **countOnly** — Boolean indicating whether to count log query results `query-parser.ts:44-44`
- **durationCount** — Number of log entries with duration `log-reader.ts:27-27`
- **durationMs** — Tracks the duration in milliseconds of log entries `log-reader.ts:279-279`
- **embeddings** — Boolean flag for output options `query-parser.ts:49-49`
- **entries** — Stores log entries for processing `log-reader.ts:331-331`
- **events** — Events for filtering log queries `query-parser.ts:31-31`
- **fields** — Fields to include in log query results `query-parser.ts:48-48`
- **files** — Stores an array of file names `query-parser.ts:116-116`
- **filter** — Represents a query filter structure `query-parser.ts:114-114`
- **firstTimestamp** — Earliest timestamp of log entries `log-reader.ts:23-23`
- **follow** — Boolean indicating whether to follow log query results `query-parser.ts:46-46`
- **format** — Output format for log query results `query-parser.ts:43-43`
- **from** — Represents the start date of a time range `time-parser.ts:149-149`
- **key** — A key in a key-value filter `query-parser.ts:19-19`
- **kvFilters** — Key-value filters for log queries `query-parser.ts:32-32`
- **lastTimestamp** — Latest timestamp of log entries `log-reader.ts:24-24`
- **levels** — Levels for filtering log queries `query-parser.ts:29-29`
- **limit** — Limit for log query results `query-parser.ts:35-35`
- **logType** — Log type for output options `query-parser.ts:50-50`
- **matched** — Number of log entries that match the query filters `log-reader.ts:19-19`
- **maxBatchMs** — Tracks the maximum batch time in milliseconds `log-reader.ts:287-287`
- **modules** — Modules for filtering log queries `query-parser.ts:30-30`
- **noColor** — Boolean indicating whether to disable color in log query results `query-parser.ts:47-47`
- **offset** — Offset for log query results `query-parser.ts:36-36`
- **op** — An operation in a key-value filter `query-parser.ts:20-20`
- **output** — Represents output options `query-parser.ts:115-115`
- **pid** — Process ID for filtering log queries `query-parser.ts:33-33`
- **provider** — Provides the embedding provider `log-reader.ts:283-283`
- **requestId** — Request ID for filtering log queries `query-parser.ts:34-34`
- **speedPerSec** — Tracks the speed in seconds per log entry `log-reader.ts:280-280`
- **stats** — Boolean indicating whether to include statistics in log query results `query-parser.ts:45-45`
- **timeRange** — A time range for filtering log queries `query-parser.ts:28-28`
- **timestamp** — Stores the timestamp of a log entry `log-reader.ts:277-277`
- **to** — Represents the end date of a time range `time-parser.ts:150-150`
- **total** — Represents the total count of log entries `log-reader.ts:18-18`
- **totalDuration** — Total duration of log entries `log-reader.ts:26-26`
- **value** — A value in a key-value filter `query-parser.ts:21-21`
- **workers** — Manages worker processes for log processing `log-reader.ts:281-281`
- **workers** — Represents the set of worker IDs in the current session `log-reader.ts:331-331`

## Data Flow

- **Inputs:** Log files from the default log directory or user-specified paths, CLI arguments for filter and output configuration.
- **Processing:** Line-by-line parsing of structured log entries, filter matching against time ranges/levels/modules/events/KV pairs, statistics accumulation.
- **Outputs:** Filtered log entries in chosen format (raw/table/JSON/CSV), statistics summaries, embedding session reports.

## Public API

| Export | Type | Description | Location |
|--------|------|-------------|----------|
| `LogStats` | interface | Statistics accumulator for matched log entries | [`log-reader.ts:17-28`](./log-reader.ts) |
| `createStats` | function | Creates an empty log statistics object | [`log-reader.ts:33-46`](./log-reader.ts) |
| `updateStats` | function | Updates statistics with a matched entry | [`log-reader.ts:51-71`](./log-reader.ts) |
| `formatEntry` | function | Formats a log entry for the chosen output format | [`log-reader.ts:76-113`](./log-reader.ts) |
| `getDefaultLogDir` | function | Returns platform-specific default log directory | [`log-reader.ts:123-172`](./log-reader.ts) |
| `findLogFiles` | function | Finds log files in a directory by type (main/worker/all) | [`log-reader.ts:123-172`](./log-reader.ts) |
| `processLogFiles` | async generator | Streams filtered log entries from files | [`log-reader.ts:178-216`](./log-reader.ts) |
| `followLogFile` | function | Follows a log file for new entries (tail -f style) | [`log-reader.ts:221-271`](./log-reader.ts) |
| `EmbeddingSession` | interface | Embedding generation session data | [`log-reader.ts:276-284`](./log-reader.ts) |
| `collectEmbeddingSessions` | function | Aggregates embedding sessions from log entries | [`log-reader.ts:290-379`](./log-reader.ts) |
| `LogQueryFilter` | interface | Complete filter structure for log queries | [`query-parser.ts:27-37`](./query-parser.ts) |
| `OutputOptions` | interface | Output format and display options | [`query-parser.ts:48-48`](./query-parser.ts) |
| `parseArgs` | function | Parses CLI arguments into filter, output, and file list | [`query-parser.ts:113-117`](./query-parser.ts) |
| `matchesFilter` | function | Tests if a log entry matches a filter | [`query-parser.ts:308-387`](./query-parser.ts) |
| `TimeRange` | interface | Time range with from/to dates | [`time-parser.ts:148-151`](./time-parser.ts) |
| `parseTime` | function | Parses relative or absolute time string | [`time-parser.ts:115-122`](./time-parser.ts) |
| `parseTimeRange` | function | Parses from/to into a TimeRange | [`time-parser.ts:153-166`](./time-parser.ts) |

## Dependencies

### Internal Modules

| Module | Purpose |
|--------|---------|
| `logging/log-formatter` | Colored log line formatting and field extraction |
| `logging/log-types` | Log level types and constants |

### External Packages

| Package | Purpose |
|---------|---------|
| `node:fs` | File reading, directory listing, file watching |
| `node:readline` | Line-by-line stream reading |

## Behavioral Properties

| Property | Value |
|----------|-------|
| Default result limit | 1000 entries |
| Session grouping window | 60 seconds between embedding events |
| Time formats supported | Relative (5m, 1h, 2d) and absolute (YYYYMMDD-HHmmss) |

## Error Handling

Missing log directories return empty file lists gracefully. Unparseable log lines are silently skipped. Follow mode handles file truncation by resetting the read position. JSON parse errors in KV filters return `false` for the match.

## Known Limitations

- Follow mode uses `fs.watch` which may miss rapid changes on some platforms.
- Embedding session grouping uses a fixed 60-second window which may split long sessions.
- No support for compressed (.gz) log files.

## Files

| File | Description |
|------|-------------|
| `log-query-cli.ts` | Main CLI entry point for the ulog command |
| `log-reader.ts` | Log file reading, processing, statistics, and embedding session collection |
| `query-parser.ts` | CLI argument parsing into filter and output structures |
| `time-parser.ts` | Relative and absolute time format parsing |
