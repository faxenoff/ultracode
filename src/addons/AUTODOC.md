# addons

Manages external process addons (Roslyn) for C# code parsing and analysis.

## Overview

The `addons` module provides C# code parsing by managing an external Roslyn-based .NET subprocess (`Ultrasharp.Addon.dll`), connected via Named Pipes using a binary IPC protocol. It exposes a `CSharpNativeParser` facade for single-file and batch parsing, with a singleton lifecycle manager handling lazy initialization, concurrent-call deduplication, solution file discovery, and graceful shutdown. When the Roslyn addon is unavailable, all parse methods return `null`, enabling transparent fallback to tree-sitter parsing.

## Flow

```
┌─────────────────────────────────────────────────────────────┐
│ Caller: parseFile(filePath) / parseBatch(files)             │
└────────────────────┬────────────────────────────────────────┘
                     ↓
        ┌────────────────────────────┐
        │ ensureRoslynStarted()       │
        │ Check DLL availability      │
        │ Deduplicate concurrent init │
        └────────────┬───────────────┘
                     ↓
        ┌────────────────────────────────────────┐
        │ RoslynAddonClient.start()               │
        │ Spawn: dotnet exec Addon.dll --pipe... │
        │ Connect via Named Pipe                  │
        └────────────┬─────────────────────────────┘
                     ↓
        ┌──────────────────────────────────────┐
        │ CSharpNativeParser.parseFile()        │
        │ Encode JSON-RPC request + binary      │
        │ Send over Named Pipe socket           │
        └────────────┬──────────────────────────┘
                     ↓
        ┌──────────────────────────────────────┐
        │ Roslyn Subprocess (Ultrasharp)        │
        │ Parse C# → extract entities/metadata  │
        │ Encode response + binary framing      │
        └────────────┬──────────────────────────┘
                     ↓
        ┌──────────────────────────────────────┐
        │ MessageDecoder                        │
        │ Match response by UUID                │
        │ Resolve pending promise               │
        └────────────┬──────────────────────────┘
                     ↓
        ┌──────────────────────────────────────┐
        │ CSharpParseResult                     │
        │ [CSharpParsedEntity[], metadata]      │
        │ or null if unavailable                │
        └──────────────────────────────────────┘
```

## Public API

### Types

| Entity | Description | Location |
|--------|-------------|----------|
| `CSharpParseResult` | Parse result containing an array of C# entities extracted from source. | `csharp-native-parser.ts:15-17` |
| `CSharpParsedEntity` | Single parsed C# entity with hierarchical structure, including name, type, line range, and optional metadata and child entities. | `csharp-native-parser.ts:19-31` |
| `CSharpEntityMetadata` | Rich metadata for C# entities including namespace, fully qualified name, accessibility modifiers, method/property signatures, base types, usings, attributes, and diagnostic information. | `csharp-native-parser.ts:33-53` |
| `RoslynClientOptions` | Configuration object for `RoslynAddonClient` specifying addon path, solution path, timeouts, restart limits, and log directory. | `roslyn-client.ts:29-40` |
| `PhaseChangedHandler` | Callback type invoked when Roslyn initialization phase changes (e.g., loading solution, analyzing code). | `roslyn-client.ts:48-48` |
| `DiagnosticsHandler` | Callback type invoked when the Roslyn addon emits diagnostic data (warnings, errors, analysis results). | `roslyn-client.ts:49-49` |

### Classes

| Entity | Description | Location |
|--------|-------------|----------|
| `CSharpNativeParser` | Facade over `RoslynAddonClient` providing `parseFile`, `parseBatch`, and `flattenEntities` methods for convenient single-file and batch C# parsing. | `csharp-native-parser.ts:59-131` |
| `RoslynAddonClient` | IPC client managing subprocess lifecycle, Named Pipe connection, request/response protocol, event dispatching, and error recovery. | `roslyn-client.ts:84-364` |

## Lifecycle Management

| Entity | Description | Location |
|--------|-------------|----------|
| `ensureRoslynStarted` | Lazy-starts the Roslyn client and returns a `CSharpNativeParser` singleton; deduplicates concurrent startup calls; returns `null` if addon unavailable. | `roslyn-lifecycle.ts:132-154` |
| `getRoslynClient` | Returns or creates the singleton `RoslynAddonClient` instance without starting the subprocess. | `roslyn-lifecycle.ts:114-114` |
| `getCSharpParser` | Returns the current `CSharpNativeParser` singleton if the subprocess is connected; returns `null` otherwise. | `roslyn-lifecycle.ts:189-191` |
| `shutdownRoslynClient` | Gracefully shuts down the Roslyn subprocess, terminates its process tree (on Windows via `taskkill`), and clears all singleton state. | `roslyn-lifecycle.ts:196-209` |
| `findSolutionFile` | Discovers `.sln` or `.slnx` files in a given directory (non-recursive); prioritizes `.sln` over `.slnx`. | `roslyn-lifecycle.ts:33-45` |
| `isRoslynAvailable` | Checks if `Ultrasharp.Addon.dll` exists in any known candidate installation path. | `roslyn-lifecycle.ts:56-78` |

## Dependencies

| Dependency | Kind | Purpose |
|------------|------|---------|
| ~~`../logging/index.js`~~ (deleted) | internal | Structured logging via `log.i`, `log.w`, `log.e`, `log.d`. |
| ~~`../shared/ipc-protocol.js`~~ (deleted) | internal | Binary IPC protocol implementation for Named Pipe communication with Roslyn subprocess. |
| Node.js `child_process` | standard | Spawn and manage the Roslyn addon subprocess. |
| Node.js `net` | standard | Named Pipe socket connection and message framing. |
| Roslyn/.NET | external | `Ultrasharp.Addon.dll` C# parser and analyzer (optional; graceful fallback if unavailable). |