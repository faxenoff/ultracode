# Multipass

## 🤖 Overview

The `multipass` module implements a tiered parsing strategy for maximum performance, utilizing two distinct parsers: OXC for fast structural analysis and TS API for full type analysis. This module is used by developers and build tools to optimize parsing speed and accuracy.

## 🤖 Architecture

```
OXC Parser
    |
    v
Fast Structural Analysis
    |
    v
TS API Parser
    |
    v
Full Type Analysis
```

## 🤖 Flow

```
File
    |
    v
OXC Parser (Fast Structural Analysis)
    |
    v
TS API Parser (Full Type Analysis)
    |
    v
Parsed Results
```

## 🤖 Entity Listing

### Function
- **calculateComplexity** — Calculates the complexity score based on entities, imports, and other factors `oxc-fast-parser.ts:433-476`
- **chunkResults** — Maps a file to a QuickParseResult object, handling errors and parsing `oxc-fast-parser.ts:190-213`, `oxc-fast-parser.ts:192-212`
- **complexityMap** — Creates a map of file paths to their complexity totals from quick results `multipass-orchestrator.ts:208-208`
- **createEntity** — Creates a QuickEntity object from an AST node `oxc-fast-parser.ts:411-427`
- **extractExports** — Not `oxc-fast-parser.ts:252-279`
- **extractImports** — Extracts import information from an EcmaScriptModule `oxc-fast-parser.ts:226-250`
- **fastParse** — Parses a file using OXC and returns a QuickParseResult object `oxc-fast-parser.ts:99-175`
- **fastParseBatch** — Parses multiple files concurrently and returns an array of QuickParseResult objects `oxc-fast-parser.ts:180-220`
- **filesToParse** — Maps uncached files to objects containing their path and content `multipass-orchestrator.ts:156-159`
- **functionCount** — Represents the count of function entities `oxc-fast-parser.ts:444-444`
- **getContent** — Retrieves content from a file, using a cache if available `multipass-orchestrator.ts:237-241`
- **getMultiPassOrchestrator** — Initializes and returns a MultiPassOrchestrator instance if it hasn't been created yet `multipass-orchestrator.ts:410-416`
- **getOxc** — Lazy loads the OXC parser module `oxc-fast-parser.ts:73-82`
- **hasDecoratorsInNode** — Determines if the node or its body contains decorators `oxc-fast-parser.ts:485-496`
- **hasGenericsInNode** — Checks if the node has generic parameters `oxc-fast-parser.ts:478-483`
- **processClassBody** — Processes the body of a class node to extract method and property definitions `oxc-fast-parser.ts:377-409`
- **processNode** — Processes an AST node to extract entities and update nesting depth `oxc-fast-parser.ts:285-375`
- **typeCount** — Represents the count of entity types `oxc-fast-parser.ts:443-443`

### Method
- **buildStrategy** — Builds a strategy for detailed parsing based on file complexity and decorators `multipass-orchestrator.ts:183-215`
- **clearCache** — Clears the cache of quick and detailed results `multipass-orchestrator.ts:372-375`
- **constructor** — Constructor for the MultiPassOrchestrator `multipass-orchestrator.ts:53-65`
- **convertQuickToParseResult** — Converts QuickParseResult objects into ParseResult objects `multipass-orchestrator.ts:304-323`
- **detailedPass** — Processes high-complexity files with TypeScript API and medium-complexity files with workers, caching results `multipass-orchestrator.ts:221-278`
- **detectLanguage** — Detects the language of a file based on its extension `multipass-orchestrator.ts:342-356`
- **fastPass** — Quickly parses files, caching results if enabled, and then processes uncached files in parallel `multipass-orchestrator.ts:126-172`
- **getQuickAnalysis** — Gets a quick analysis of a file, caching the result if enabled `multipass-orchestrator.ts:390-404`
- **getStats** — Returns statistics about the cache and parsing process `multipass-orchestrator.ts:361-367`
- **getTypeScriptParser** — Lazy loads the TypeScript parser for detailed analysis `multipass-orchestrator.ts:328-337`
- **initialize** — Initialize orchestrator (lazy load TS parser) `multipass-orchestrator.ts:70-78`
- **invalidateFiles** — Invalidates specific files in the cache `multipass-orchestrator.ts:380-385`
- **mergeResults** — Merges quick and detailed results into a final list of ParseResult objects `multipass-orchestrator.ts:283-299`
- **parseBatch** — Parses a batch of files using a two-phase strategy, first with a fast pass and then with detailed parsing `multipass-orchestrator.ts:83-121`

### Class
- **MultiPassOrchestrator** — Multi-Pass Parser Orchestrator `multipass-orchestrator.ts:38-405`

### Interface
- **BatchStrategy** — Strategy for batch processing `types.ts:93-100`
- **ComplexityScore** — Complexity score for prioritizing detailed parsing `types.ts:14-31`
- **ExportInfo** — Export information including name, default status, and type-only status `types.ts:83-88`
- **ImportInfo** — Import information including source, specifiers, and flags `types.ts:73-78`
- **MultiPassConfig** — Configuration for multi-pass parsing strategy `types.ts:105-122`
- **OxcModule** — OXC module type `oxc-fast-parser.ts:29-31`
- **OxcParserOptions** — Defines options for parsing code, including TypeScript, JSX, and content retention `oxc-fast-parser.ts:87-94`
- **QuickEntity** — Lightweight entity from fast pass `types.ts:57-68`
- **QuickParseResult** — Quick parse result from OXC (Pass 1) `types.ts:36-52`

### Type_alias
- **ClassNode** — Class node with body members `oxc-fast-parser.ts:58-68`
- **ExtendedStatement** — Extended statement node with common properties from ESTree `oxc-fast-parser.ts:36-53`
- **TypeScriptParser** — Lazy imports for TypeScript parser (heavy) `multipass-orchestrator.ts:33-33`

### Import_decl
- **../../logging/index.js** — Imports `../../logging/index.js` from `../../logging/index.js`. `multipass-orchestrator.ts:25-25`
- **../../types/parser.js** — Imports `../../types/parser.js` from `../../types/parser.js`. `multipass-orchestrator.ts:26-26`
- **../../utils/file-ops.js** — Imports `../../utils/file-ops.js` from `../../utils/file-ops.js`. `multipass-orchestrator.ts:27-27`
- **../../utils/parallel.js** — Imports `../../utils/parallel.js` from `../../utils/parallel.js`. `multipass-orchestrator.ts:28-28`
- **./oxc-fast-parser.js** — Imports `./oxc-fast-parser.js` from `./oxc-fast-parser.js`. `multipass-orchestrator.ts:29-29`
- **./types.js** — Imports `./types.js` from `./types.js`. `multipass-orchestrator.ts:30-30`, `oxc-fast-parser.ts:22-22`
- **@oxc-project/types** — Imports `@oxc-project/types` from `@oxc-project/types`. `oxc-fast-parser.ts:20-20`
- **node:os** — Imports `node:os` from `node:os`. `multipass-orchestrator.ts:24-24`
- **oxc-parser** — Imports `oxc-parser` from `oxc-parser`. `oxc-fast-parser.ts:21-21`

### Property
- **body** — Body of the statement `oxc-fast-parser.ts:39-41`, `oxc-fast-parser.ts:40-40`, `oxc-fast-parser.ts:59-67`
- **body** — Represents the body of a statement or class node `oxc-fast-parser.ts:60-66`
- **cacheQuickResults** — Caches quick results for reuse `types.ts:117-117`
- **complexity** — Complexity analysis for prioritization `types.ts:41-41`
- **config** — Configuration for the MultiPassOrchestrator `multipass-orchestrator.ts:39-39`
- **content** — Stores the file content in the files array `oxc-fast-parser.ts:181-181`
- **content** — Cached content for reuse in detailed pass `types.ts:51-51`
- **declaration** — Declaration of the statement `oxc-fast-parser.ts:42-42`
- **declarations** — Declarations of the statement `oxc-fast-parser.ts:43-46`
- **decorated** — Has decorators? `types.ts:65-65`
- **decorators** — Decorators of the declaration `oxc-fast-parser.ts:47-47`
- **decorators** — Represents the decorators of a statement or class node `oxc-fast-parser.ts:63-63`
- **decorators** — Represents an array of unknown decorators `oxc-fast-parser.ts:393-393`
- **detailed** — Indicates if detailed processing is used `types.ts:97-97`
- **detailedCache** — Map to cache detailed parse results `multipass-orchestrator.ts:42-42`
- **detailedThreshold** — Threshold for detailed pass processing `types.ts:109-109`
- **enableFastPass** — Enables fast pass processing `types.ts:107-107`
- **end** — End position of the declaration `oxc-fast-parser.ts:52-52`
- **end** — Indicates the end position of a node `oxc-fast-parser.ts:65-65`
- **end** — Represents the end position of a key `oxc-fast-parser.ts:392-392`
- **endLine** — End line `types.ts:61-61`
- **entities** — Basic entities (name, type, location only) `types.ts:39-39`
- **error** — Represents an error message in the QuickParseResult `oxc-fast-parser.ts:137-137`, `oxc-fast-parser.ts:212-212`
- **exported** — Exported? `types.ts:63-63`
- **exports** — Exports for API surface `types.ts:45-45`
- **fastOnly** — Indicates if only fast processing is used `types.ts:95-95`
- **filePath** — File path `types.ts:37-37`
- **functionCount** — Number of functions/methods `types.ts:20-20`
- **hasDecorators** — Has decorators (Angular, etc.) `types.ts:26-26`
- **hasGenerics** — Has generics/complex types `types.ts:24-24`
- **hasJsx** — Has JSX/TSX `types.ts:28-28`
- **id** — Identifier of the statement `oxc-fast-parser.ts:38-38`, `oxc-fast-parser.ts:44-44`
- **imports** — Imports for dependency graph `types.ts:43-43`
- **init** — Initializer of the declaration `oxc-fast-parser.ts:45-45`
- **isDefault** — Indicates if the export is a default export `types.ts:85-85`
- **isDynamic** — Indicates if the import is dynamic `types.ts:77-77`
- **isTypeOnly** — Indicates if the import is type-only `types.ts:76-76`, `types.ts:86-86`
- **jsx** — Indicates whether JSX is enabled `oxc-fast-parser.ts:91-91`
- **keepContent** — Determines if content should be kept `oxc-fast-parser.ts:93-93`
- **key** — Represents the key of a property in a class node `oxc-fast-parser.ts:62-62`
- **key** — Represents a key with name and value `oxc-fast-parser.ts:390-390`
- **lines** — Line count `types.ts:30-30`
- **maxNesting** — Estimated nesting depth `types.ts:22-22`
- **name** — Name of the identifier `oxc-fast-parser.ts:38-38`, `oxc-fast-parser.ts:44-44`
- **name** — Represents the name of a property or identifier `oxc-fast-parser.ts:62-62`
- **name** — Represents the name of a key `oxc-fast-parser.ts:390-390`
- **name** — Name `types.ts:58-58`
- **name** — Name of the exported entity `types.ts:84-84`
- **needsDetailedPass** — Whether detailed pass is recommended `types.ts:49-49`
- **oxcConcurrency** — Concurrency setting for OXC parser `types.ts:111-111`
- **params** — Parameters of the declaration `oxc-fast-parser.ts:49-49`
- **parent** — Parent entity name for nested entities `types.ts:67-67`
- **parseSync** — Function to parse code synchronously `oxc-fast-parser.ts:30-30`
- **parseTimeMs** — Parse time in ms `types.ts:47-47`
- **path** — Stores the file path in the files array `oxc-fast-parser.ts:181-181`
- **quickCache** — Map to cache quick parse results `multipass-orchestrator.ts:41-41`
- **simpleFileThreshold** — Threshold for simple files `types.ts:121-121`
- **skipDetailedForSimple** — Skips detailed pass for simple files `types.ts:119-119`
- **source** — Source of the import `types.ts:74-74`, `types.ts:87-87`
- **specifiers** — List of specifiers for the import `types.ts:75-75`
- **start** — Start position of the declaration `oxc-fast-parser.ts:51-51`
- **start** — Indicates the start position of a node `oxc-fast-parser.ts:64-64`
- **start** — Represents the start position of a key `oxc-fast-parser.ts:391-391`
- **startLine** — Start line `types.ts:60-60`
- **stats** — Statistics for the MultiPassOrchestrator `multipass-orchestrator.ts:45-51`
- **total** — Overall complexity (0-100) `types.ts:16-16`
- **tsConcurrency** — Concurrency setting for TypeScript parser `types.ts:113-113`
- **tsParser** — TypeScript parser instance `multipass-orchestrator.ts:40-40`
- **type** — Type of the statement `oxc-fast-parser.ts:37-37`, `oxc-fast-parser.ts:45-45`
- **type** — Specifies the type of a statement or class node `oxc-fast-parser.ts:61-61`
- **type** — Extended Statement node with common properties from ESTree `oxc-fast-parser.ts:389-389`
- **type** — Type `types.ts:59-59`
- **typeCount** — Number of classes/interfaces `types.ts:18-18`
- **typeParameters** — Type parameters of the declaration `oxc-fast-parser.ts:48-50`
- **typescript** — Indicates whether TypeScript is enabled `oxc-fast-parser.ts:89-89`
- **value** — Value of the identifier `oxc-fast-parser.ts:38-38`
- **value** — Represents the value of a property or identifier `oxc-fast-parser.ts:62-62`
- **value** — Represents the value of a key `oxc-fast-parser.ts:390-390`
- **workerPoolSize** — Size of the worker pool `types.ts:115-115`
- **workers** — Number of workers for parallel processing `types.ts:99-99`

## Data Flow

- **Inputs**: File paths and source code strings for TypeScript/JavaScript files
- **Processing**: Phase 1 OXC fast parse for all files, complexity scoring, Phase 2 TS API selective parse with parallel workers
- **Outputs**: `QuickParseResult` (fast) and `ParseResult` (detailed) per file, with batch strategy classification

## Public API

| Export | Type | Description | Location |
|--------|------|-------------|----------|
| `MultiPassOrchestrator` | class | Orchestrates tiered parsing strategy | [`multipass-orchestrator.ts:38-405`](./multipass-orchestrator.ts) |
| `fastParse` | function | OXC-based fast parse for a single file | [`oxc-fast-parser.ts`](./oxc-fast-parser.ts) |
| `fastParseBatch` | function | OXC-based batch parse for multiple files | [`oxc-fast-parser.ts`](./oxc-fast-parser.ts) |
| `QuickParseResult` | interface | Result from fast OXC pass | [`types.ts:36-52`](./types.ts) |
| `QuickEntity` | interface | Lightweight entity from fast pass | [`types.ts:57-68`](./types.ts) |
| `ComplexityScore` | interface | Complexity score for prioritization | [`types.ts:14-31`](./types.ts) |
| `ImportInfo` | interface | Import information | [`types.ts:73-78`](./types.ts) |
| `ExportInfo` | interface | Export information | [`types.ts:83-88`](./types.ts) |
| `BatchStrategy` | interface | Batch processing strategy classification | [`types.ts:93-100`](./types.ts) |
| `MultiPassConfig` | interface | Configuration for orchestrator | [`types.ts:105-122`](./types.ts) |
| `DEFAULT_MULTIPASS_CONFIG` | const | Default configuration values | [`types.ts:124-133`](./types.ts) |

## Dependencies

### Internal Modules
| Module | Purpose |
|--------|---------|
| `../../types/parser` | `ParseResult`, `ParserOptions` types |
| `../../logging/index` | Logging infrastructure |
| `../../utils/file-ops` | `readFilesParallel`, `readText` for file I/O |
| `../../utils/parallel` | `forEachParallel` for concurrent processing |
| `../typescript-parser` | TypeScript API parser (lazy-loaded for Phase 2) |

### External Packages
| Package | Purpose |
|---------|---------|
| `oxc-parser` | Rust-based fast parser for Phase 1 (~2x faster than SWC) |
| `@oxc-project/types` | ESTree-compatible AST type definitions |

## Behavioral Properties

| Property | Value |
|----------|-------|
| OXC parse speed | ~0.5-2ms per file |
| Overall speedup | 3-10x for large codebases |
| Default complexity threshold | 50 (files below skip detailed pass) |
| Default worker pool size | 16 threads |

## Error Handling

OXC parse failures fall back to empty results without blocking other files. TypeScript parser is lazy-loaded and errors are logged. Caching prevents re-parsing on repeated access.

## Known Limitations

- OXC fast pass does not extract type information or complex generics
- Worker pool uses OS CPU count heuristic which may not be optimal for all environments
- Detailed pass cache does not persist across sessions

## Files

| File | Description |
|------|-------------|
| `index.ts` | Re-exports orchestrator, fast parser, and types |
| `multipass-orchestrator.ts` | Main orchestrator with Phase 1/2/3 coordination, caching, and batch strategy |
| `oxc-fast-parser.ts` | OXC-based fast structural parser with entity/import/export/complexity extraction |
| `types.ts` | Type definitions for quick parse results, entities, imports, exports, complexity, config |
