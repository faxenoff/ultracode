# addons

## 🤖 Overview

The `src/addons` module provides a set of tools for parsing and managing C# code, primarily through the Roslyn library. It includes a native parser for C# files and a client for interacting with the Roslyn addon, along with lifecycle management for the Roslyn client. Developers and maintainers of C# projects can use this module to parse and analyze C# code efficiently.

## 🤖 Architecture

```
  +---------------------+
  | CSharpNativeParser |
  +---------------------+
          |
          v
  +---------------------+
  | RoslynAddonClient  |
  +---------------------+
          |
          v
  +---------------------+
  | RoslynClientOptions |
  +---------------------+
          |
          v
  +---------------------+
  | CSharpEntityMetadata |
  +---------------------+
```

## 🤖 Flow

```
  +---------------------+
  | CSharpNativeParser |
  +---------------------+
          |
          v
  +---------------------+
  | parseCSharpFile     |
  +---------------------+
          |
          v
  +---------------------+
  | CSharpParseResult   |
  +---------------------+
          |
          v
  +---------------------+
  | CSharpParsedEntity  |
  +---------------------+
          |
          v
  +---------------------+
  | CSharpEntityMetadata |
  +---------------------+
```

## 🤖 Entity Listing

### Function
- **cleanup** — Cleans up the Roslyn client and related resources on process exit `roslyn-lifecycle.ts:92-104`
- **doStart** — Starts the Roslyn client and returns the CSharpNativeParser if successful `roslyn-lifecycle.ts:156-183`
- **ensureRoslynStarted** — Ensures the Roslyn client is started and returns the CSharpNativeParser if available `roslyn-lifecycle.ts:132-154`
- **findAddonPath** — Function to find the path to the UltraCode.CSharp.dll `roslyn-client.ts:59-79`
- **findSolutionFile** — Find .sln or .slnx file in the root of a directory (non-recursive) `roslyn-lifecycle.ts:33-45`
- **getCSharpParser** — Returns the CSharpNativeParser if available `roslyn-lifecycle.ts:189-191`
- **getRoslynClient** — Initializes and returns a Roslyn client instance if not already initialized `roslyn-lifecycle.ts:114-121`
- **isRoslynAvailable** — Check if the Roslyn addon DLL is available on disk `roslyn-lifecycle.ts:56-78`
- **registerExitHandler** — Registers exit handlers to clean up the Roslyn client on process exit `roslyn-lifecycle.ts:88-109`
- **shutdownRoslynClient** — Shuts down the Roslyn client and related resources `roslyn-lifecycle.ts:196-209`
- **sln** — Finds the solution file in a list of entries `roslyn-lifecycle.ts:37-37`
- **slnx** — Finds the solution file in a list of entries `roslyn-lifecycle.ts:39-39`
- **timeout** — Sets a timeout for a request `roslyn-client.ts:263-265`
- **timer** — Manages a timer for request timeouts `roslyn-client.ts:161-164`

### Method
- **cleanup** — Cleans up resources used by the Roslyn analysis process `roslyn-client.ts:346-371`
- **connected** — Indicates whether the client is connected `roslyn-client.ts:101-103`
- **connectPipe** — Connects to the named pipe `roslyn-client.ts:259-278`
- **constructor** — Initializes the C# Native Parser `csharp-native-parser.ts:92-94`
- **constructor** — Initializes a new instance of the RoslynAddonClient `roslyn-client.ts:108-117`
- **flattenEntities** — Flattens the parsed entities into a single list `csharp-native-parser.ts:149-160`
- **handleMessage** — Handles incoming messages from the client `roslyn-client.ts:302-335`
- **isAvailable** — Checks if the C# Native Parser is available `csharp-native-parser.ts:97-99`
- **isAvailable** — Checks if the client is available `roslyn-client.ts:120-122`
- **off** — Unregisters an event handler `roslyn-client.ts:185-187`
- **on** — Registers an event handler `roslyn-client.ts:177-182`
- **parseBatch** — Parses a batch of C# files `csharp-native-parser.ts:129-143`
- **parseFile** — Parses a single C# file `csharp-native-parser.ts:110-123`
- **phase** — Returns the current phase value `roslyn-client.ts:98-100`
- **pipeName** — Stores the name of the named pipe `roslyn-client.ts:104-106`
- **request** — Sends a request to the client `roslyn-client.ts:147-174`
- **setClient** — Sets the client for the C# Native Parser `csharp-native-parser.ts:102-104`
- **setupSocketHandlers** — Sets up socket handlers for IPC communication `roslyn-client.ts:280-300`
- **shutdown** — Shuts down the client process `roslyn-client.ts:190-202`
- **spawnProcess** — Spawns a new process for the client `roslyn-client.ts:208-257`
- **start** — Starts the client process `roslyn-client.ts:125-144`
- **tryRestart** — Attempts to restart the Roslyn analysis process if it fails `roslyn-client.ts:337-344`

### Class
- **CSharpNativeParser** — Represents the C# Native Parser using Ultrasharp.Addon (Roslyn) for parsing C# files `csharp-native-parser.ts:89-161`
- **RoslynAddonClient** — Manages a C# UltraCode.CSharp subprocess for Roslyn analysis `roslyn-client.ts:85-372`

### Interface
- **CSharpEntityMetadata** — Metadata for a parsed entity, including namespace, fully qualified name, and various properties `csharp-native-parser.ts:33-83`
- **CSharpParsedEntity** — Represents a single entity parsed from a C# file, including its metadata and relationships `csharp-native-parser.ts:19-31`
- **CSharpParseResult** — Represents the result of parsing C# files, containing an array of parsed entities `csharp-native-parser.ts:15-17`
- **PendingRequest** — Represents a pending request with resolve and reject functions and a timer `roslyn-client.ts:43-47`
- **RoslynClientOptions** — Options for configuring the RoslynAddonClient `roslyn-client.ts:30-41`

### Type_alias
- **DiagnosticsHandler** — Handler for diagnostics in the RoslynAddonClient `roslyn-client.ts:50-50`
- **PhaseChangedHandler** — Handler for phase changes in the RoslynAddonClient `roslyn-client.ts:49-49`

### Import_decl
- **../logging/index.js** — Imports `../logging/index.js` from `../logging/index.js`. `csharp-native-parser.ts:8-8`, `roslyn-client.ts:16-16`, `roslyn-lifecycle.ts:11-11`
- **../shared/ipc-protocol.js** — Imports `../shared/ipc-protocol.js`. `roslyn-client.ts:17-23`
- **../utils/runtime-detection.js** — Imports `../utils/runtime-detection.js` from `../utils/runtime-detection.js`. `roslyn-client.ts:24-24`
- **./csharp-native-parser.js** — Imports `./csharp-native-parser.js` from `./csharp-native-parser.js`. `roslyn-lifecycle.ts:12-12`
- **./roslyn-client.js** — Imports `./roslyn-client.js` from `./roslyn-client.js`. `csharp-native-parser.ts:9-9`, `roslyn-lifecycle.ts:13-13`
- **node:child_process** — Imports `node:child_process` from `node:child_process`. `roslyn-client.ts:10-10`
- **node:crypto** — Imports `node:crypto` from `node:crypto`. `roslyn-client.ts:11-11`
- **node:fs** — Imports `node:fs` from `node:fs`. `roslyn-client.ts:12-12`, `roslyn-lifecycle.ts:8-8`
- **node:net** — Imports `node:net` from `node:net`. `roslyn-client.ts:13-13`
- **node:path** — Imports `node:path` from `node:path`. `roslyn-client.ts:14-14`, `roslyn-lifecycle.ts:9-9`
- **node:url** — Imports `node:url` from `node:url`. `roslyn-client.ts:15-15`, `roslyn-lifecycle.ts:10-10`

### Property
- **_connected** — Internal state indicating whether the client is connected `roslyn-client.ts:92-92`
- **_options** — Stores configuration options for the Roslyn client `roslyn-client.ts:95-95`
- **_phase** — Internal state representing the current phase of the client `roslyn-client.ts:91-91`
- **_pipeName** — Internal state storing the name of the named pipe `roslyn-client.ts:94-94`
- **_restartCount** — Internal state tracking the number of restart attempts `roslyn-client.ts:93-93`
- **_shutdownRequested** — Internal state indicating if shutdown has been requested `roslyn-client.ts:96-96`
- **accessibility** — Accessibility level of the parsed entity `csharp-native-parser.ts:36-36`
- **addonPath** — Path to the UltraCode.CSharp.dll for the Roslyn analysis `roslyn-client.ts:32-32`
- **attributes** — Lists the attributes of the entity `csharp-native-parser.ts:51-51`
- **awaits** — await statements in the control flow `csharp-native-parser.ts:70-70`
- **baseTypes** — Lists the base types of the entity `csharp-native-parser.ts:48-48`
- **branches** — branches in the control flow of a parsed entity `csharp-native-parser.ts:60-60`
- **calls** — Lists the method calls within the entity `csharp-native-parser.ts:55-55`
- **catchType** — type of exception caught `csharp-native-parser.ts:64-64`
- **children** — Array of child entities related to the parsed entity `csharp-native-parser.ts:30-30`
- **client** — Represents the client used by the C# Native Parser `csharp-native-parser.ts:90-90`
- **column** — column number where a diagnostic message occurs `csharp-native-parser.ts:56-56`
- **complexity** — complexity score of a parsed entity `csharp-native-parser.ts:57-57`
- **content** — Content of the entity in the C# file `csharp-native-parser.ts:26-26`
- **content** — Represents the content of the C# file being parsed `csharp-native-parser.ts:129-129`
- **controlFlow** — control flow analysis of a parsed entity `csharp-native-parser.ts:59-71`
- **csharpHints** — C# code hints for a parsed entity `csharp-native-parser.ts:72-82`
- **decoder** — Represents a message decoder for IPC communication `roslyn-client.ts:88-88`
- **defaultValue** — Specifies the default value of the parameter `csharp-native-parser.ts:47-47`
- **diagnostics** — Lists the diagnostics for the entity `csharp-native-parser.ts:56-56`
- **docComment** — documentation comment associated with a parsed entity `csharp-native-parser.ts:58-58`
- **emptyCatchCount** — Counts the number of empty catch blocks in the C# code `csharp-native-parser.ts:81-81`
- **endLine** — Ending line number of the entity in the C# file `csharp-native-parser.ts:25-25`
- **entities** — An array of parsed entities from a C# file `csharp-native-parser.ts:16-16`
- **entities** — Represents the parsed entities from the C# file `csharp-native-parser.ts:130-130`
- **entities** — Contains an array of file entities with their file paths and parsed entities `csharp-native-parser.ts:136-136`
- **eventHandlers** — Stores event handlers for phase changes and diagnostics `roslyn-client.ts:90-90`
- **exceptions** — exception handling in the control flow `csharp-native-parser.ts:62-68`
- **expression** — expression associated with an await statement `csharp-native-parser.ts:70-70`
- **fieldType** — Specifies the type of the field `csharp-native-parser.ts:53-53`
- **filePath** — File path of the C# file from which the entity was parsed `csharp-native-parser.ts:23-23`
- **filePath** — Represents the file path of the C# file being parsed `csharp-native-parser.ts:129-129`
- **filePath** — Represents an array of file entities with their file paths and parsed entities `csharp-native-parser.ts:130-130`
- **filePath** — Represents the file path of a C# native parser `csharp-native-parser.ts:136-136`
- **files** — Represents the list of files being parsed `csharp-native-parser.ts:130-130`
- **files** — Contains an array of file entities with their file paths and parsed entities `csharp-native-parser.ts:136-136`
- **fqn** — Fully qualified name of the parsed entity `csharp-native-parser.ts:35-35`
- **hasParallelForEachAsync** — Indicates whether the C# code contains parallel foreach async operations `csharp-native-parser.ts:79-79`
- **hasRethrow** — whether the exception is rethrown `csharp-native-parser.ts:65-65`
- **hasThrowEx** — whether the exception is thrown `csharp-native-parser.ts:67-67`
- **id** — Unique identifier for a parsed entity `csharp-native-parser.ts:20-20`
- **id** — Represents the unique identifier of the diagnostic `csharp-native-parser.ts:56-56`
- **innerCalls** — inner calls within a loop `csharp-native-parser.ts:61-61`
- **interfaces** — Lists the interfaces implemented by the entity `csharp-native-parser.ts:49-49`
- **isAbstract** — Indicates whether the parsed entity is abstract `csharp-native-parser.ts:39-39`
- **isAsync** — Indicates whether the parsed entity is asynchronous `csharp-native-parser.ts:38-38`
- **isConst** — Indicates whether the parsed entity is a constant `csharp-native-parser.ts:41-41`
- **isEmpty** — whether the exception is empty `csharp-native-parser.ts:66-66`
- **isOptional** — Indicates whether the parameter is optional `csharp-native-parser.ts:47-47`
- **isOverride** — Indicates whether the entity overrides a virtual method `csharp-native-parser.ts:43-43`
- **isPartial** — Indicates whether the entity is partial `csharp-native-parser.ts:45-45`
- **isReadonly** — Indicates whether the parsed entity is read-only `csharp-native-parser.ts:40-40`
- **isSealed** — Indicates whether the entity is sealed `csharp-native-parser.ts:44-44`
- **isStatic** — Indicates whether the parsed entity is static `csharp-native-parser.ts:37-37`
- **isVirtual** — Indicates whether the entity is virtual `csharp-native-parser.ts:42-42`
- **kind** — kind of loop in the control flow `csharp-native-parser.ts:61-61`
- **language** — Language of the parsed entity, which is always "C#" `csharp-native-parser.ts:27-27`
- **line** — Indicates the line number of the method call `csharp-native-parser.ts:55-55`
- **line** — line number where a diagnostic message occurs `csharp-native-parser.ts:56-56`
- **line** — Stores an array of branch entities with their line numbers `csharp-native-parser.ts:60-60`
- **line** — Contains an array of loop entities with their kind, line numbers, and inner calls `csharp-native-parser.ts:61-61`
- **line** — Represents a single line number `csharp-native-parser.ts:63-63`
- **line** — Stores an array of return entities with their line numbers `csharp-native-parser.ts:69-69`
- **line** — Contains an array of await entities with their expressions and line numbers `csharp-native-parser.ts:70-70`
- **lockOnThisCount** — Counts the number of lock on this operations in the C# code `csharp-native-parser.ts:75-75`
- **logDirectory** — Directory for logging the addon process `roslyn-client.ts:40-40`
- **loops** — loops in the control flow of a parsed entity `csharp-native-parser.ts:61-61`
- **maxRestarts** — Maximum number of restart attempts for the RoslynAddonClient (default: 3) `roslyn-client.ts:38-38`
- **message** — Represents the message of the diagnostic `csharp-native-parser.ts:56-56`
- **metadata** — Metadata associated with the parsed entity `csharp-native-parser.ts:29-29`
- **name** — Name of the parsed entity `csharp-native-parser.ts:21-21`
- **name** — Represents the name of the entity `csharp-native-parser.ts:47-47`
- **name** — Represents an array of call entities with their respective details `csharp-native-parser.ts:55-55`
- **namespace** — Namespace of the parsed entity `csharp-native-parser.ts:34-34`
- **newDisposableNoUsingCount** — Counts the number of new disposable objects without using in the C# code `csharp-native-parser.ts:78-78`
- **newHttpClientCount** — Counts the number of new HttpClient instances in the C# code `csharp-native-parser.ts:77-77`
- **nullForgivingCount** — Counts the number of null forgiving operations in the C# code `csharp-native-parser.ts:74-74`
- **parameters** — Lists the parameters of the entity `csharp-native-parser.ts:47-47`
- **parentId** — Parent ID of the parsed entity `csharp-native-parser.ts:28-28`
- **pendingRequests** — Manages pending requests with resolve and reject functions `roslyn-client.ts:89-89`
- **phase** — Represents the current phase of the Roslyn analysis process `roslyn-client.ts:319-319`
- **process** — Child process for the RoslynAddonClient `roslyn-client.ts:86-86`
- **propertyType** — Specifies the type of the property `csharp-native-parser.ts:54-54`
- **receiver** — Specifies the receiver of the method call `csharp-native-parser.ts:55-55`
- **receiverType** — Specifies the type of the receiver of the method call `csharp-native-parser.ts:55-55`
- **reject** — Function to reject a pending request `roslyn-client.ts:45-45`
- **requestTimeout** — Timeout in milliseconds for requests (default: 60000) `roslyn-client.ts:36-36`
- **resolve** — Function to resolve a pending request `roslyn-client.ts:44-44`
- **returns** — return statements in the control flow `csharp-native-parser.ts:69-69`
- **returnType** — Specifies the return type of the entity `csharp-native-parser.ts:46-46`
- **severity** — severity of a diagnostic message `csharp-native-parser.ts:56-56`
- **slnPath** — Path to the .sln file for eager loading `roslyn-client.ts:34-34`
- **slnPath** — Represents the path to the solution file `roslyn-lifecycle.ts:114-114`
- **socket** — Socket for communication with the RoslynAddonClient `roslyn-client.ts:87-87`
- **startLine** — Starting line number of the entity in the C# file `csharp-native-parser.ts:24-24`
- **stringConcatInLoopCount** — Counts the number of string concatenation in loops in the C# code `csharp-native-parser.ts:76-76`
- **syncOverAsyncCount** — count of synchronous operations over asynchronous ones `csharp-native-parser.ts:73-73`
- **throwExCount** — Counts the number of throw Ex operations in the C# code `csharp-native-parser.ts:80-80`
- **timer** — Represents a timer set using `setTimeout `roslyn-client.ts:46-46`
- **type** — Type of the parsed entity `csharp-native-parser.ts:22-22`
- **type** — Specifies the type of the entity `csharp-native-parser.ts:47-47`
- **typeParameters** — Lists the type parameters of the entity `csharp-native-parser.ts:52-52`
- **usings** — Lists the using directives for the entity `csharp-native-parser.ts:50-50`

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
