# Watcher

## 🤖 Overview

The `autodoc-watcher` module is used by developers to monitor and update documentation files incrementally. It provides a way to track changes in code files and update the `AUTODOC.md` file accordingly. This module is essential for maintaining up-to-date documentation as code evolves.

## 🤖 Architecture

```
  +-------------------+
  |   Module Resolver |
  |   (module-resolver.ts) |
  +-------------------+
           |
           v
  +-------------------+
  |   AutoDoc Updater |
  |   (autodoc-updater.ts) |
  +-------------------+
           |
           v
  +-------------------+
  |   AutoDoc Watcher |
  |   (autodoc-watcher.ts) |
  +-------------------+
```

## 🤖 Flow

```
  +-------------------+
  |   AutoDoc Watcher |
  |   (autodoc-watcher.ts) |
  +-------------------+
           |
           v
  +-------------------+
  |   Module Resolver |
  |   (module-resolver.ts) |
  +-------------------+
           |
           v
  +-------------------+
  |   AutoDoc Updater |
  |   (autodoc-updater.ts) |
  +-------------------+
           |
           v
  +-------------------+
  |   Update AUTODOC.md |
  +-------------------+
```

## 🤖 Entity Listing

### Function
- **added** — Added exports `autodoc-updater.ts:171-171`
- **added** — Represents the addition of an entity to the export list `autodoc-updater.ts:428-428`
- **detectDocumentationLanguage** — Detects the language of documentation `autodoc-updater.ts:667-751`
- **diffExports** — Compares the old and new exports to find differences `autodoc-updater.ts:424-432`
- **escapeRegex** — Escapes regular expressions for safe string manipulation `autodoc-updater.ts:417-419`
- **exampleExport** — An example of an exported name `autodoc-updater.ts:573-573`
- **exportsList** — Represents the list of exported names from a file `autodoc-updater.ts:568-568`
- **exportsList** — Maps exports to a list of strings `autodoc-updater.ts:569-569`
- **exportsList** — Maps each function's exports to a string representation and joins them with newlines `autodoc-updater.ts:569-569`
- **extractEntitiesFromContent** — Extracts entities from the content of a module `module-resolver.ts:184-253`
- **extractExportedNames** — Extracts exported names from a file `autodoc-updater.ts:756-806`
- **extractExportsFromContent** — Extracts export names from the content of a module `module-resolver.ts:96-144`
- **extractExportsFromFile** — Extracts export names from a file `module-resolver.ts:80-91`
- **filesSection** — Represents the files section in the AUTODOC.md content `autodoc-updater.ts:561-564`
- **filteredExports** — Filters the exports based on certain criteria `autodoc-updater.ts:200-200`
- **findBlockEnd** — Finds the end of a block in the content lines `module-resolver.ts:258-281`
- **findEntityLine** — Searches for a specific entity in a string by matching a regular expression pattern `module-resolver.ts:321-346`
- **findTypeEnd** — Parses a string to find the end of a type declaration by counting parentheses, braces, and angle brackets `module-resolver.ts:286-316`
- **generateExportDescription** — Generates a description for an export `autodoc-updater.ts:438-478`
- **generateModuleDescriptionLLM** — Generates a description for a module using an LLM `autodoc-updater.ts:484-661`
- **getAutoDocWatcher** — Returns an instance of the AutoDoc Watcher `autodoc-watcher.ts:926-934`
- **getModuleFiles** — Retrieves module files from a given path `module-resolver.ts:149-167`
- **getModuleForFile** — Finds the module directory that contains a file `module-resolver.ts:14-55`
- **hasIndexFile** — Checks if a directory has an index file `module-resolver.ts:63-75`
- **isPlaceholder** — Checks if a description is a placeholder `autodoc-updater.ts:986-986`
- **langResults** — Represents results from language detection `autodoc-updater.ts:738-738`
- **names** — Maps and filters names from export matches `module-resolver.ts:106-115`
- **names** — Filters names to ensure they are valid strings `module-resolver.ts:116-116`
- **newExportsList** — Contains the list of new exports `autodoc-updater.ts:206-206`
- **newExportsList** — Filters and maps exports to a list of strings `autodoc-updater.ts:216-216`
- **newExportsList** — Maps exports to a list of strings `autodoc-updater.ts:217-217`
- **newExportsSet** — Set of new exports `autodoc-updater.ts:168-168`
- **newFilesList** — Contains the list of new files `autodoc-updater.ts:275-275`
- **parentEntries** — Represents parent entries in the module `autodoc-updater.ts:677-677`
- **parseAutodoc** — Function to parse current AUTODOC.md content `autodoc-updater.ts:92-134`
- **parseLLMDocResponse** — Parses LLM response for documentation `autodoc-updater.ts:858-924`
- **removed** — Represents the removal of an entity from the export list `autodoc-updater.ts:172-172`
- **removed** — Filters and maps exports to a list of strings `autodoc-updater.ts:429-429`
- **resetAutoDocWatcher** — Resets the AutoDoc Watcher to its initial state `autodoc-watcher.ts:936-941`
- **sanitizeLLMOutput** — Sanitizes LLM output for description generation `autodoc-updater.ts:812-852`
- **singlePrompt** — A single prompt for LLM description generation `autodoc-updater.ts:594-594`
- **singlePrompt** — Maps lines to a list of strings `autodoc-updater.ts:602-605`
- **srcEntries** — Represents source entries in the module `autodoc-updater.ts:697-697`
- **totalExports** — Represents the total number of exports in a module `autodoc-updater.ts:551-551`
- **updateAutodocContent** — Function to update AUTODOC.md content incrementally `autodoc-updater.ts:50-87`
- **updateDescription** — Updates the description of a module `autodoc-updater.ts:929-1027`
- **updateExportsSection** — Function to update the exports section in AUTODOC.md `autodoc-updater.ts:140-230`
- **updateFilesSection** — Updates the files section in the AUTODOC.md content `autodoc-updater.ts:236-286`
- **updateLineReferences** — Updates the line number references in the changed files `autodoc-updater.ts:295-412`

### Method
- **checkAutodocEnabled** — Checks if the AutoDoc watcher is enabled `autodoc-watcher.ts:152-169`
- **constructor** — Initializes the AutoDoc Watcher with configuration `autodoc-watcher.ts:110-120`
- **enrichPendingModules** — Enriches pending modules with descriptions `autodoc-watcher.ts:760-823`
- **forceUpdate** — Forces an update of the AUTODOC.md file immediately `autodoc-watcher.ts:894-903`
- **getModuleInfo** — Retrieves module information for a given file `autodoc-watcher.ts:828-889`
- **getStatus** — Returns the current status of the AutoDoc Watcher `autodoc-watcher.ts:908-920`
- **handleEvent** — Handles events related to the AutoDoc watcher `autodoc-watcher.ts:361-395`
- **handleFileChange** — Handles file change events `autodoc-watcher.ts:400-448`
- **handleIndexCompleted** — Handles the completion of an index `autodoc-watcher.ts:662-753`
- **invalidateAutodocCache** — Invalidates the cache for AutoDoc files `autodoc-watcher.ts:174-177`
- **processUpdate** — Processes the scheduled update for the AutoDoc watcher `autodoc-watcher.ts:508-657`
- **scanAndCreateMissingAutodocs** — Scans for missing AutoDoc files and creates them `autodoc-watcher.ts:248-325`
- **scheduleUpdate** — Schedules an update for the AutoDoc watcher `autodoc-watcher.ts:453-503`
- **shouldUseLlm** — Determines whether to use LLM for description generation `autodoc-watcher.ts:125-147`
- **start** — Starts the AutoDoc watcher `autodoc-watcher.ts:182-243`
- **stop** — Stops the AutoDoc watcher `autodoc-watcher.ts:330-356`

### Class
- **AutoDocWatcher** — Class for automatically updating AUTODOC.md files `autodoc-watcher.ts:83-921`

### Interface
- **AutoDocWatcherConfig** — Configuration for the AutoDoc Watcher `autodoc-watcher.ts:51-72`
- **ExtractedEntity** — Represents an entity with its name, type, export status, and line numbers `module-resolver.ts:170-178`
- **IndexCompletedEventData** — Event data for index:completed event `autodoc-watcher.ts:34-37`
- **ModuleInfoWithLLM** — Extended ModuleInfo with LLM-generated descriptions `autodoc-updater.ts:35-38`
- **ModuleInfoWithLLM** — Module info with LLM-generated descriptions (temporary runtime properties) `autodoc-watcher.ts:42-45`
- **ParsedAutodoc** — Parsed structure of AUTODOC.md content `autodoc-updater.ts:40-45`
- **PendingUpdate** — Represents a pending update for a module `autodoc-watcher.ts:74-79`
- **UpdateOptions** — Configuration for using LLM for description generation `autodoc-updater.ts:19-30`

### Import_decl
- **../../agents/dev/file-extensions.js** — Imports `../../agents/dev/file-extensions.js` from `../../agents/dev/file-extensions.js`. `autodoc-watcher.ts:16-16`
- **../../core/indexing-state.js** — Imports `../../core/indexing-state.js` from `../../core/indexing-state.js`. `autodoc-watcher.ts:17-17`
- **../../core/knowledge-bus.js** — Imports `../../core/knowledge-bus.js` from `../../core/knowledge-bus.js`. `autodoc-watcher.ts:18-18`
- **../../logging/index.js** — Imports `../../logging/index.js` from `../../logging/index.js`. `autodoc-updater.ts:13-13`, `autodoc-watcher.ts:19-19`
- **../../utils/file-ops.js** — Imports `../../utils/file-ops.js` from `../../utils/file-ops.js`. `autodoc-updater.ts:14-14`, `autodoc-watcher.ts:20-20`, `module-resolver.ts:8-8`
- **../../utils/runtime-detection.js** — Imports `../../utils/runtime-detection.js` from `../../utils/runtime-detection.js`. `autodoc-watcher.ts:21-21`
- **../generator/doc-generator.js** — Imports `../generator/doc-generator.js` from `../generator/doc-generator.js`. `autodoc-updater.ts:15-15`, `autodoc-watcher.ts:22-22`
- **../i18n/language-detector.js** — Imports `../i18n/language-detector.js` from `../i18n/language-detector.js`. `autodoc-updater.ts:16-16`
- **../llm/llm-provider.js** — Imports `../llm/llm-provider.js` from `../llm/llm-provider.js`. `autodoc-watcher.ts:23-23`
- **./autodoc-updater.js** — Imports `./autodoc-updater.js` from `./autodoc-updater.js`. `autodoc-watcher.ts:24-24`
- **./module-resolver.js** — Imports `./module-resolver.js` from `./module-resolver.js`. `autodoc-updater.ts:17-17`, `autodoc-watcher.ts:25-25`
- **node:path** — Imports `node:path` from `node:path`. `autodoc-updater.ts:12-12`, `autodoc-watcher.ts:15-15`, `module-resolver.ts:7-7`

### Property
- **_llmExportDescs** — Record of LLM-generated export descriptions `autodoc-updater.ts:36-36`
- **_llmExportDescs** — Stores descriptions for exported functions from LLM `autodoc-watcher.ts:43-43`
- **_llmFileDescs** — Record of LLM-generated file descriptions `autodoc-updater.ts:37-37`
- **_llmFileDescs** — Stores descriptions for files from LLM `autodoc-watcher.ts:44-44`
- **added** — Returns an object with arrays of added and removed exports `autodoc-updater.ts:424-424`
- **AUTODOC_CHECK_TTL** — Represents the time-to-live for checking the availability of LLM `autodoc-watcher.ts:105-105`
- **autodocCheckTime** — Time interval for checking for changes `autodoc-watcher.ts:103-103`
- **autodocEnabled** — Boolean indicating if auto-doc is enabled `autodoc-watcher.ts:102-102`
- **autodocPath** — Stores the path to an AutoDoc file `autodoc-watcher.ts:762-762`
- **changedFiles** — Set of files that have changed `autodoc-watcher.ts:76-76`
- **code** — Represents the code content of a file `autodoc-updater.ts:502-502`
- **code** — Stores an array of file data containing file names, code, and exports `autodoc-updater.ts:669-669`
- **config** — Configuration for the AutoDocWatcher `autodoc-watcher.ts:84-92`
- **config** — Provides configuration for the AutoDoc Watcher `autodoc-watcher.ts:912-912`
- **content** — Stores the content of an AutoDoc file `autodoc-watcher.ts:762-762`
- **debounceControllers** — Controllers for debouncing updates `autodoc-watcher.ts:94-94`
- **debounceMs** — Debounce delay in milliseconds `autodoc-watcher.ts:85-85`
- **debounceMs** — Debounce delay in milliseconds (default: 300000 = 5 minutes) `autodoc-watcher.ts:53-53`
- **description** — Description of the AUTODOC.md content `autodoc-updater.ts:42-42`
- **directory** — Represents the directory path for documentation `autodoc-watcher.ts:35-35`
- **enabled** — Boolean indicating if the watcher is enabled `autodoc-watcher.ts:89-89`
- **enabled** — Indicates whether the AutoDoc Watcher is enabled `autodoc-watcher.ts:909-909`
- **enabled** — Enable/disable watcher `autodoc-watcher.ts:61-61`
- **endLine** — Represents the end of a line in the file `autodoc-updater.ts:312-312`
- **endLine** — Represents the line number and end line number of the closest entity `autodoc-updater.ts:374-374`
- **endLine** — Stores the ending line number of the entity `module-resolver.ts:177-177`
- **endpoint** — LLM endpoint URL `autodoc-updater.ts:27-27`
- **endpoint** — LLM provider endpoint `autodoc-watcher.ts:69-69`
- **exportDescs** — Represents descriptions of exported names `autodoc-updater.ts:863-863`
- **exportDescs** — Exports descriptions for modules `autodoc-watcher.ts:269-269`
- **exportDescs** — Represents a record of exported descriptions `autodoc-watcher.ts:556-556`, `autodoc-watcher.ts:693-693`
- **exported** — Indicates whether the entity is exported `module-resolver.ts:173-173`
- **exports** — Represents the exports of a module `autodoc-updater.ts:502-502`
- **exports** — Represents the exported names from a file `autodoc-updater.ts:669-669`
- **file** — Represents a file in the file system `autodoc-updater.ts:502-502`
- **file** — Represents a file in the module `autodoc-updater.ts:669-669`
- **fileDescs** — Represents descriptions of files `autodoc-updater.ts:864-864`
- **fileDescs** — Stores file descriptions `autodoc-watcher.ts:269-269`
- **fileDescs** — Represents a record of file descriptions `autodoc-watcher.ts:556-556`, `autodoc-watcher.ts:693-693`
- **firstChangeAt** — Timestamp of the first change `autodoc-watcher.ts:77-77`
- **lastChangeAt** — Timestamp of the last change `autodoc-watcher.ts:78-78`
- **line** — Represents a line in the file `autodoc-updater.ts:312-312`
- **line** — Represents the line number and end line number of the closest entity `autodoc-updater.ts:374-374`
- **line** — Stores the starting line number of the entity `module-resolver.ts:175-175`
- **llmAvailabilityChecked** — Indicates whether the LLM availability has been checked `autodoc-watcher.ts:107-107`
- **llmAvailabilityResult** — Stores the result of checking LLM availability `autodoc-watcher.ts:108-108`
- **llmConfig** — Configuration for LLM, including provider, model, and endpoint `autodoc-updater.ts:23-29`
- **llmConfig** — LLM provider configuration `autodoc-watcher.ts:91-91`
- **llmConfig** — LLM provider config `autodoc-watcher.ts:65-71`
- **maxDebounceMs** — Maximum debounce delay in milliseconds `autodoc-watcher.ts:87-87`
- **maxDebounceMs** — Maximum debounce delay (default: 60—or 10 minutes) `autodoc-watcher.ts:57-57`
- **minDebounceMs** — Minimum debounce delay in milliseconds `autodoc-watcher.ts:86-86`
- **minDebounceMs** — Minimum debounce delay (default: 120000 = 2 minutes) `autodoc-watcher.ts:55-55`
- **model** — LLM model name `autodoc-updater.ts:26-26`
- **model** — LLM model used for generating descriptions `autodoc-watcher.ts:68-68`
- **modPath** — Stores the path to a module `autodoc-watcher.ts:762-762`
- **moduleCache** — Cache for module information `autodoc-watcher.ts:97-97`
- **moduleCacheControllers** — Controllers for module cache `autodoc-watcher.ts:98-98`
- **moduleDesc** — Represents the description of a module `autodoc-updater.ts:862-862`
- **modulePath** — Path to the module being updated `autodoc-watcher.ts:75-75`
- **name** — Stores the name of the entity `module-resolver.ts:171-171`
- **pendingUpdates** — List of pending updates `autodoc-watcher.ts:93-93`
- **pendingUpdates** — Manages pending updates for modules `autodoc-watcher.ts:911-911`
- **processingModules** — Modules currently being processed `autodoc-watcher.ts:96-96`
- **provider** — LLM provider, either "ollama", "openai", or "tgi" `autodoc-updater.ts:25-25`
- **provider** — Specifies the LLM provider for documentation generation `autodoc-watcher.ts:67-67`
- **rawContent** — Raw content of the AUTODOC.md file `autodoc-updater.ts:44-44`
- **removed** — Returns an object with arrays of added and removed exports `autodoc-updater.ts:424-424`
- **rootDir** — Root directory to watch for changes `autodoc-watcher.ts:88-88`
- **rootDir** — Root directory to watch `autodoc-watcher.ts:59-59`
- **running** — Indicates whether the AutoDoc Watcher is currently running `autodoc-watcher.ts:910-910`
- **sections** — Map of sections in the AUTODOC.md content `autodoc-updater.ts:43-43`
- **stopped** — Boolean indicating if the watcher is stopped `autodoc-watcher.ts:100-100`
- **subscriptionId** — Subscription ID for the watcher `autodoc-watcher.ts:95-95`
- **title** — Title of the AUTODOC.md content `autodoc-updater.ts:41-41`
- **type** — Specifies the type of the entity, such as function, class, or interface `module-resolver.ts:172-172`
- **useLlm** — Boolean flag to determine if LLM should be used for description generation `autodoc-updater.ts:21-21`
- **useLlm** — Boolean indicating if LLM is used for description generation `autodoc-watcher.ts:90-90`
- **useLlm** — Use LLM for description generation `autodoc-watcher.ts:63-63`

## Data Flow

- **Inputs**: File change events (file paths from KnowledgeBus or file-ops hooks), module directory paths, existing AUTODOC.md content.
- **Processing**: Watcher maps changed files to modules, debounces per-module, reads current AUTODOC.md, calls `updateAutodocContent` which refreshes exports/files/line-refs, optionally invokes LLM for description generation. For new modules, `generateModuleReadmeWithEntities` creates initial content.
- **Outputs**: Updated or newly created AUTODOC.md files on disk; `autodoc:created` and `autodoc:updated` events published to KnowledgeBus.

## Public API

| Export | Type | Description | Location |
|--------|------|-------------|----------|
| `updateAutodocContent` | function | Incrementally updates AUTODOC.md content from module info and changed files | [`autodoc-updater.ts:50-87`](./autodoc-updater.ts) |
| `diffExports` | function | Computes added/removed exports between old and new export lists | [`autodoc-updater.ts:423-423`](./autodoc-updater.ts) |
| `generateExportDescription` | function | Generates heuristic description for an export name (without LLM) | [`autodoc-updater.ts:438-478`](./autodoc-updater.ts) |
| `UpdateOptions` | interface | Options for update (useLlm, llmConfig) | [`autodoc-updater.ts:19-28`](./autodoc-updater.ts) |
| `AutoDocWatcher` | class | Main watcher: subscribes to events, debounces, triggers updates | [`autodoc-watcher.ts:79-806`](./autodoc-watcher.ts) |
| `AutoDocWatcherConfig` | interface | Configuration for the watcher (debounce timings, rootDir, LLM settings) | [`autodoc-watcher.ts:49-68`](./autodoc-watcher.ts) |
| `getAutoDocWatcher` | function | Singleton factory for AutoDocWatcher | [`autodoc-watcher.ts:811-819`](./autodoc-watcher.ts) |
| `resetAutoDocWatcher` | function | Stops and resets the AutoDocWatcher singleton | [`autodoc-watcher.ts:821-826`](./autodoc-watcher.ts) |
| `ExtractedEntity` | interface | Entity info extracted from code (name, type, exported, line, endLine) | [`module-resolver.ts:169-178`](./module-resolver.ts) |
| `extractEntitiesFromContent` | function | Lightweight parser extracting functions/classes/interfaces/types/consts/enums with line ranges | [`module-resolver.ts:184-253`](./module-resolver.ts) |
| `extractExportsFromContent` | function | Extracts export names from file content via regex | [`module-resolver.ts:96-144`](./module-resolver.ts) |
| `extractExportsFromFile` | function | Reads a file and extracts export names | [`module-resolver.ts:80-91`](./module-resolver.ts) |
| `findEntityLine` | function | Finds line number of a named entity in file content | [`module-resolver.ts:321-346`](./module-resolver.ts) |
| `getModuleFiles` | function | Lists code files in a module directory | [`module-resolver.ts:149-167`](./module-resolver.ts) |
| `getModuleForFile` | function | Resolves which module a file belongs to by walking up directories | [`module-resolver.ts:14-55`](./module-resolver.ts) |

## Dependencies

### Internal Modules

| Module | Purpose |
|--------|---------|
| `autodoc/generator` | `generateModuleReadmeWithEntities`, `scanModules`, `ModuleInfo` for content generation |
| `autodoc/i18n` | Language detection for multi-language LLM descriptions |
| `autodoc/llm` | `detectLLMProviders`, `ClaudeCodeProvider` for LLM-enhanced descriptions |
| `core/knowledge-bus` | Event subscription for index and entity change notifications |
| `logging` | Structured logging throughout watcher lifecycle |
| `utils/file-ops` | File operations and `setFileChangeHook` for direct write notifications |
| `utils/runtime-detection` | `sleep` for debounce scheduling (Bun-compatible) |

### External Packages

| Package | Purpose |
|---------|---------|
| `node:path` | Path manipulation for module resolution and file joining |

## Behavioral Properties

| Property | Value |
|----------|-------|
| Default debounce | 5 seconds (min 3s, max 15s, adaptive based on change count) |
| Module cache TTL | 5 minutes |
| `.autodoc` check cache TTL | 5 minutes |
| LLM availability | Lazy-detected on first use if not explicitly configured |
| Initial scan | 5 seconds after start, creates AUTODOC.md for modules missing one |

## Error Handling

The watcher catches all errors during update processing and logs them without crashing. If an update fails mid-processing, the `isProcessing` flag is reset in a `finally` block. Debounce controllers use `AbortController` for clean cancellation. Module info reads silently return empty arrays on directory errors. LLM generation failures fall back to non-LLM content.

## Known Limitations

- Entity extraction uses lightweight regex parsing, not full AST; complex patterns (e.g., destructured exports, computed property names) may be missed.
- Line-number reference updates match entities within a 5-10 line tolerance, which may produce incorrect matches in densely-packed files.
- The watcher only creates AUTODOC.md for new modules when the `.autodoc` folder exists in the project root; it does not auto-create the folder.

## Exports

- `diffExports`
- `generateExportDescription`
- `updateAutodocContent`
- `AutoDocWatcher`
- `getAutoDocWatcher`
- `resetAutoDocWatcher`
- `extractEntitiesFromContent`
- `extractExportsFromContent`
- `extractExportsFromFile`
- `findEntityLine`
- `getModuleFiles`
- `getModuleForFile`

## Files

| File | Description |
|------|-------------|
| [`autodoc-updater.ts`](./autodoc-updater.ts) | Incremental AUTODOC.md content updates: export/file section refresh, line-number reference tracking, LLM description generation, language detection |
| [`autodoc-watcher.ts`](./autodoc-watcher.ts) | Event-driven watcher: KnowledgeBus subscription, adaptive debouncing, module scanning, AUTODOC.md creation/update orchestration |
| [`module-resolver.ts`](./module-resolver.ts) | Module resolution (file-to-module mapping), export extraction, entity parsing with line ranges |
| [`index.ts`](./index.ts) | Module barrel file re-exporting autodoc-updater, autodoc-watcher, and module-resolver |
