# Module: src/autodoc/generator

## 🤖 Overview

The `autodoc/generator` module generates AUTODOC.md templates for changed directories using a ChangeKind-based strategy. It integrates with LLM enrichment for full and incremental documentation. Developers and maintainers of codebases use this module to automate documentation generation and ensure consistency across code changes.

## 🤖 Architecture

```
  +-------------------+
  |   Batch AutoDoc   |
  |   Generator       |
  +-------------------+
          |
          v
  +-------------------+
  |   Directory Hash  |
  |   Computation     |
  +-------------------+
          |
          v
  +-------------------+
  |   Change Kind     |
  |   Detection       |
  +-------------------+
          |
          v
  +-------------------+
  |   Entity Summary  |
  |   Generation      |
  +-------------------+
          |
          v
  +-------------------+
  |   LLM Enrichment  |
  +-------------------+
```

## 🤖 Flow

```
  +-------------------+
  |   Scan Directory  |
  +-------------------+
          |
          v
  +-------------------+
  |   Compute Hash    |
  +-------------------+
          |
          v
  +-------------------+
  |   Detect Change   |
  +-------------------+
          |
          v
  +-------------------+
  |   Generate Summary|
  +-------------------+
          |
          v
  +-------------------+
  |   Enrich with LLM |
  +-------------------+
```

## 🤖 Entity Listing

### Function
- **addedChanges** — Tracks changes in code that have been added `incremental-updater.ts:476-476`
- **addedEntities** — Entities that were added to the documentation `incremental-updater.ts:333-333`
- **addedEntities** — Filters and maps changes to extract entity names that were added `incremental-updater.ts:333-333`
- **capitalizeFirst** — Capitalizes the first character of a string `batch-autodoc.ts:87-89`
- **computeDirectoryHash** — Computes a composite hash for a directory's entities using FNV-1a 64-bit algorithm `batch-autodoc.ts:45-62`
- **currentEntityNames** — A function to get current entity names `incremental-updater.ts:228-228`
- **deletedChanges** — Tracks changes in code that have been deleted `incremental-updater.ts:486-486`
- **detectChangeKind** — Not applicable `batch-autodoc.ts:216-257`
- **detectChanges** — A function to detect changes in the documentation `incremental-updater.ts:186-261`
- **detectDocLanguage** — Detects the language of the documentation `generate-handler-utils.ts:137-193`
- **enhancedDocs** — The enhanced documentation `generate-handler-utils.ts:224-226`
- **enhanceWithLLM** — Enhances the documentation with LLM `generate-handler-utils.ts:198-241`
- **ensureGeneralDocs** — Creates template files if they don't exist `general-docs.ts:181-194`
- **entity** — An entity in the documentation `incremental-updater.ts:244-244`
- **executeGenerateDocs** — Not present in the provided entities `generate-handler-utils.ts:319-397`
- **existsInOriginal** — A function to check if an entity exists in the original documentation `incremental-updater.ts:361-361`
- **exportedEntities** — Represents exported entities in a module `doc-generator.ts:308-308`
- **exportedEntities** — Filters and sorts exported entities by name `doc-generator.ts:308-308`
- **extractExports** — Extracts exported names from a file `doc-generator.ts:143-173`
- **extractReferences** — A function to extract code references from documentation content `incremental-updater.ts:84-121`
- **extractSections** — A function to extract documentation sections `incremental-updater.ts:126-177`
- **findRepoRoot** — Finds the root directory of the repository `generate-handler-utils.ts:121-132`
- **generateArchitectureDoc** — Generates architecture documentation for a module `doc-generator.ts:369-417`
- **generateDirectorySummary** — Not applicable `batch-autodoc.ts:145-206`
- **generateDocs** — Generates documentation for a module `doc-generator.ts:428-452`
- **generateModuleReadme** — Generates a module documentation file `doc-generator.ts:178-219`
- **generateModuleReadmeWithEntities** — Generates a module documentation file with entities `doc-generator.ts:237-364`
- **isKey** — Not applicable `batch-autodoc.ts:359-359`
- **markDeleted** — A function to mark deleted code in the documentation `incremental-updater.ts:376-410`
- **matching** — Not applicable `batch-autodoc.ts:178-178`
- **mdFiles** — A list of markdown files `generate-handler-utils.ts:163-163`
- **mergeNewEntities** — Not applicable `batch-autodoc.ts:270-310`
- **mergeWithExisting** — A function to merge new entities with existing ones `incremental-updater.ts:317-371`
- **movedChanges** — Tracks changes in code that have been moved `incremental-updater.ts:466-466`
- **names** — Names of exported entities `doc-generator.ts:156-156`
- **newItems** — New items added to the documentation `incremental-updater.ts:398-398`
- **newSection** — A new documentation section `incremental-updater.ts:327-327`
- **parseLocation** — Parses location information from a string `batch-autodoc.ts:98-119`
- **postProcessLlmOutput** — Not applicable `batch-autodoc.ts:419-460`
- **readCodeSnippets** — Not applicable `batch-autodoc.ts:342-382`
- **results** — Results from parallel directory scanning operations `doc-generator.ts:78-125`
- **scanModules** — Asynchronously scans a directory for modules and returns their information `doc-generator.ts:55-138`
- **sortedFiles** — Represents sorted files in a module `doc-generator.ts:346-346`
- **sortedRefs** — Sorts references in a file `general-docs.ts:219-219`
- **title** — Title of the module documentation `doc-generator.ts:184-184`
- **title** — Represents the title of a module `doc-generator.ts:268-268`
- **topLevel** — Represents the top-level module `doc-generator.ts:406-406`
- **uncategorized** — Not applicable `batch-autodoc.ts:193-193`
- **updateAllGeneralDocs** — Updates all general documentation files `general-docs.ts:246-264`
- **updateAllModuleDocs** — Updates all module documentation `incremental-updater.ts:511-543`
- **updateGeneralDocReferences** — Updates file references in existing documentation `general-docs.ts:200-241`
- **updateModuleDoc** — A function to update the module documentation `incremental-updater.ts:419-506`
- **updateReferences** — A function to update references in the documentation `incremental-updater.ts:270-308`
- **writeFilesIncremental** — Writes files incrementally `generate-handler-utils.ts:246-289`
- **writeFilesOverwrite** — Not present in the provided entities `generate-handler-utils.ts:294-314`

### Interface
- **AutoDocManager** — Interface for managing auto-generated documentation `generate-handler-utils.ts:32-35`
- **BatchResult** — Represents the result of a batch auto-doc generation process, including counts of generated, skipped, errors, and synced entities `batch-autodoc.ts:18-23`
- **CodeChange** — Represents a change in code, including type, entity ID, entity name, entity type, file path, old file path, old line number, new line number, and timestamp `incremental-updater.ts:34-44`
- **DirectoryDoc** — Represents a document for a directory, containing entity ID, content, source hash, and title `batch-autodoc.ts:25-30`
- **DirectorySummaryEntity** — Represents a summary entity for a directory `batch-autodoc.ts:121-129`
- **DocReference** — Represents a reference to a code entity in documentation, including original text, file path, line number, entity name, and content position `incremental-updater.ts:20-32`
- **DocSection** — Represents a section in documentation, including title, content, start line, end line, and related entities `incremental-updater.ts:46-57`
- **FileToGenerate** — An interface for file generation with path, type, and content `generate-handler-utils.ts:59-63`
- **GenerateDocsContext** — Represents the context for generating documentation, including input path normalization, request ID, and auto doc manager retrieval `generate-handler-utils.ts:85-89`
- **GenerateDocsOptions** — Options for documentation generation `generate-handler-utils.ts:17-27`
- **GenerateDocsResult** — Contains the result of the documentation generation process, including success status, preview mode, use of LLM, LLM status, incremental generation, language, modules found, files to generate, files written, and detailed module and file information `generate-handler-utils.ts:94-116`
- **GenerateOptions** — Configuration options for generating documentation `doc-generator.ts:23-34`
- **GenerateResult** — The result of the documentation generation process `doc-generator.ts:36-45`
- **LLMProvider** — An interface for LLM providers with a name and selected model `generate-handler-utils.ts:68-71`
- **ModuleExport** — Information about a module export `generate-handler-utils.ts:40-44`
- **ModuleInfo** — Represents information about a module, including its name, path, files, and exports `doc-generator.ts:14-21`
- **ModuleInfo** — Information about a module `generate-handler-utils.ts:49-54`
- **ModuleInfoWithEntities** — Interface for module information including entities `doc-generator.ts:222-231`
- **UpdateChange** — An interface for incremental update changes with a description, type, and section `generate-handler-utils.ts:76-80`
- **UpdateResult** — An object containing the path to the documentation file, whether it was updated, and the changes made `incremental-updater.ts:59-71`

### Type_alias
- **GeneralDocFile** — Represents a file in the .autodoc/ directory `general-docs.ts:25-25`

### Import_decl
- **../../logging/index.js** — Imports `../../logging/index.js` from `../../logging/index.js`. `batch-autodoc.ts:11-11`, `doc-generator.ts:10-10`, `generate-handler-utils.ts:9-9`
- **../../storage/graph-storage-factory.js** — Imports `../../storage/graph-storage-factory.js` from `../../storage/graph-storage-factory.js`. `incremental-updater.ts:13-13`
- **../../types/storage.js** — Imports `../../types/storage.js` from `../../types/storage.js`. `incremental-updater.ts:14-14`
- **../../utils/file-ops.js** — Imports `../../utils/file-ops.js` from `../../utils/file-ops.js`. `doc-generator.ts:11-11`
- **../../utils/parallel.js** — Imports `../../utils/parallel.js` from `../../utils/parallel.js`. `doc-generator.ts:12-12`
- **../sync/file-sync.js** — Imports `../sync/file-sync.js` from `../sync/file-sync.js`. `generate-handler-utils.ts:10-10`
- **../types.js** — Imports `../types.js` from `../types.js`. `batch-autodoc.ts:12-12`
- **./doc-generator.js** — Imports `./doc-generator.js` from `./doc-generator.js`. `generate-handler-utils.ts:11-11`
- **./general-docs.js** — Imports `./general-docs.js` from `./general-docs.js`. `generate-handler-utils.ts:12-12`
- **./incremental-updater.js** — Imports `./incremental-updater.js` from `./incremental-updater.js`. `general-docs.ts:13-13`
- **node:child_process** — Imports `node:child_process` from `node:child_process`. `generate-handler-utils.ts:7-7`
- **node:fs** — Imports `node:fs` from `node:fs`. `general-docs.ts:11-11`, `incremental-updater.ts:11-11`
- **node:fs/promises** — Imports `node:fs/promises` from `node:fs/promises`. `batch-autodoc.ts:9-9`
- **node:path** — Imports `node:path` from `node:path`. `batch-autodoc.ts:10-10`, `doc-generator.ts:9-9`, `general-docs.ts:12-12`, `generate-handler-utils.ts:8-8`, `incremental-updater.ts:12-12`

### Property
- **allChanges** — Stores all changes made to files `general-docs.ts:249-249`
- **autodocDir** — The output directory for general documentation `doc-generator.ts:27-27`
- **autodocDir** — Directory for auto-generated documentation `generate-handler-utils.ts:19-19`
- **autoGenerated** — Boolean indicating whether the document is auto-generated `generate-handler-utils.ts:33-33`
- **changes** — Stores changes made to a file `general-docs.ts:203-203`
- **changes** — Returns an object containing the total number of updated lines and an array of changes per file `general-docs.ts:249-249`
- **changes** — Stores an array of objects containing file names and their respective change strings `general-docs.ts:250-250`
- **changes** — Contains the changes made to the documentation `generate-handler-utils.ts:104-104`
- **changes** — Represents an incremental update change `generate-handler-utils.ts:251-251`
- **changes** — Represents an array of changes `generate-handler-utils.ts:254-254`
- **changes** — Represents an array of incremental changes `generate-handler-utils.ts:360-360`
- **changes** — An array of changes made to the documentation `incremental-updater.ts:65-68`
- **concurrency** — Number of parallel operations for directory scanning `doc-generator.ts:60-60`
- **concurrency** — The number of parallel operations to perform `doc-generator.ts:33-33`
- **content** — Content of the entity document `batch-autodoc.ts:27-27`
- **content** — The content of the generated documentation file `doc-generator.ts:43-43`
- **content** — The content of the file to be generated `generate-handler-utils.ts:62-62`
- **content** — Content of the documentation section `incremental-updater.ts:50-50`
- **depth** — Current depth in the directory scanning process `doc-generator.ts:70-70`
- **depth** — Represents the depth of a directory `doc-generator.ts:82-82`
- **description** — An optional description of the module `doc-generator.ts:20-20`
- **description** — The description of the incremental update change `generate-handler-utils.ts:77-77`
- **description** — A description of the change made to the documentation `incremental-updater.ts:67-67`
- **dir** — Directory path for scanning modules `doc-generator.ts:70-70`
- **dir** — Represents a directory with its depth `doc-generator.ts:82-82`
- **docPath** — The path to the documentation file `incremental-updater.ts:61-61`
- **end** — End position of a location `batch-autodoc.ts:98-98`
- **end** — Not applicable `batch-autodoc.ts:125-125`
- **endIndex** — End index in documentation content `incremental-updater.ts:31-31`
- **endLine** — End line number of a location `batch-autodoc.ts:100-100`
- **endLine** — End line number of an entity `doc-generator.ts:229-229`
- **endLine** — Represents the end line of a file `doc-generator.ts:247-247`
- **endLine** — Stores the end line number of an entity `doc-generator.ts:288-288`
- **endLine** — Represents the end line number of a section in the documentation `incremental-updater.ts:54-54`
- **entities** — Entities within a module `doc-generator.ts:223-230`
- **entityId** — Unique identifier for an entity within a directory `batch-autodoc.ts:26-26`
- **entityId** — ID of the entity (if applicable) `incremental-updater.ts:36-36`
- **entityName** — Name of the referenced code entity (if referenced) `incremental-updater.ts:28-28`
- **entityName** — Stores the name of the entity being updated `incremental-updater.ts:37-37`
- **entityType** — Type of the entity `incremental-updater.ts:38-38`
- **errors** — Count of entities that caused errors in the batch auto-doc process `batch-autodoc.ts:21-21`
- **exclude** — Patterns to exclude during scanning `doc-generator.ts:29-29`
- **exclude** — Optionally excludes certain entities from being exported `doc-generator.ts:58-58`
- **exclude** — List of files or directories to exclude `generate-handler-utils.ts:20-20`
- **exportDescs** — Describes exported entities in a module `doc-generator.ts:250-250`
- **exported** — Whether an entity is exported `doc-generator.ts:227-227`
- **exported** — Represents exported entities in a module `doc-generator.ts:245-245`
- **exported** — Indicates whether an entity is exported `doc-generator.ts:286-286`
- **exports** — An array of exported names from the module `doc-generator.ts:19-19`
- **exports** — An array of module export information `generate-handler-utils.ts:53-53`
- **exports** — The exports of a module `generate-handler-utils.ts:109-109`
- **file** — File path for a module `doc-generator.ts:224-224`
- **file** — Represents a file in a module `doc-generator.ts:283-283`
- **file** — Represents a file in the .autodoc/ directory `general-docs.ts:249-249`
- **file** — Stores an array of changes per file `general-docs.ts:250-250`
- **fileDescs** — Describes files in a module `doc-generator.ts:251-251`
- **filePath** — Not applicable `batch-autodoc.ts:124-124`
- **filePath** — File path of the referenced code entity `incremental-updater.ts:24-24`
- **filePath** — Stores the file path of the entity being updated `incremental-updater.ts:39-39`
- **files** — An array of file names within the module `doc-generator.ts:17-17`
- **files** — Stores an array of file objects with their paths, types, and content `doc-generator.ts:40-44`
- **files** — An array of file paths to be processed `generate-handler-utils.ts:52-52`
- **files** — A list of files involved in the documentation generation `generate-handler-utils.ts:108-108`
- **files** — Stores an array of file objects with their paths, types, and optional previews `generate-handler-utils.ts:111-115`
- **filesToGenerate** — A list of files that need to be generated based on the documentation options `generate-handler-utils.ts:102-102`
- **filesWritten** — Tracks the number of files written during the documentation generation `generate-handler-utils.ts:103-103`
- **filesWritten** — Returns the number of files written and an array of incremental changes `generate-handler-utils.ts:251-251`
- **generated** — Count of entities that were successfully generated in the batch auto-doc process `batch-autodoc.ts:19-19`
- **getAutoDocManager** — Retrieves the auto doc manager for documentation generation `generate-handler-utils.ts:88-88`
- **hash** — Hash value computed by the `computeDirectoryHash` function `batch-autodoc.ts:45-45`
- **hash** — Not applicable `batch-autodoc.ts:128-128`
- **hasIndex** — Indicates whether the module has an index file `doc-generator.ts:18-18`
- **incremental** — Indicates if the documentation generation is incremental `generate-handler-utils.ts:99-99`
- **incremental** — Boolean indicating whether to perform incremental updates `generate-handler-utils.ts:25-25`
- **incrementalChanges** — Stores the incremental changes made to the documentation `generate-handler-utils.ts:104-104`
- **incrementalChanges** — Returns an array of incremental changes `generate-handler-utils.ts:251-251`
- **language** — Not applicable `batch-autodoc.ts:126-126`
- **language** — Specifies the language for documentation generation `generate-handler-utils.ts:34-34`, `generate-handler-utils.ts:100-100`
- **language** — Language for documentation generation `generate-handler-utils.ts:26-26`
- **line** — Line number of a location `batch-autodoc.ts:98-98`
- **line** — Not applicable `batch-autodoc.ts:98-98`
- **line** — Represents the location of a line in a file, either as a string or an object with start and end line numbers `batch-autodoc.ts:125-125`
- **line** — Represents a location with optional start and end line numbers `batch-autodoc.ts:125-125`
- **line** — Line number of an entity `doc-generator.ts:228-228`
- **line** — Represents a line in a file `doc-generator.ts:246-246`
- **line** — Stores the line number of an entity `doc-generator.ts:287-287`
- **lineNumber** — Line number of the referenced code entity (if present) `incremental-updater.ts:26-26`
- **llmEnhancer** — Enhances documentation updates using an LLM `incremental-updater.ts:425-425`
- **llmEnhancer** — A function to enhance content with changes using an LLM `incremental-updater.ts:516-516`
- **llmStatus** — Stores the status of the LLM used for documentation generation `generate-handler-utils.ts:98-98`
- **llmStatus** — The status of the LLM enhancement `generate-handler-utils.ts:203-203`
- **location** — Not applicable `batch-autodoc.ts:125-125`
- **maxDepth** — Maximum depth to scan for modules `doc-generator.ts:59-59`
- **maxDepth** — The maximum depth to scan modules `doc-generator.ts:31-31`
- **maxDepth** — Maximum depth for documentation generation `generate-handler-utils.ts:21-21`
- **module** — Module name for documentation generation `generate-handler-utils.ts:22-22`
- **modules** — An array of ModuleInfo objects representing found modules `doc-generator.ts:38-38`
- **modules** — A collection of module information `generate-handler-utils.ts:105-110`
- **modulesFound** — Represents a collection of modules found during the documentation generation process `generate-handler-utils.ts:101-101`
- **name** — Batch AutoDoc Generator — ported from Zig batch_generator.zig `batch-autodoc.ts:122-122`
- **name** — Name of an entity `doc-generator.ts:225-225`
- **name** — Represents the name of a module `doc-generator.ts:243-243`
- **name** — The name of the module `doc-generator.ts:15-15`, `doc-generator.ts:284-284`
- **name** — The name of the LLM provider `generate-handler-utils.ts:50-50`, `generate-handler-utils.ts:69-69`
- **name** — The name of a module or file `generate-handler-utils.ts:106-106`
- **name** — Name of the module export `generate-handler-utils.ts:41-41`
- **new** — The new version of an entity `incremental-updater.ts:274-274`
- **newContent** — The new content of the documentation file if it was updated `incremental-updater.ts:70-70`
- **newLine** — Represents a new line in a file `general-docs.ts:202-202`
- **newLine** — Represents the new line number in a file `general-docs.ts:248-248`
- **newLineNumber** — New line number of the entity (if moved) `incremental-updater.ts:42-42`
- **normalizeInputPath** — Normalizes the input path for documentation generation `generate-handler-utils.ts:86-86`
- **old** — The old version of an entity `incremental-updater.ts:274-274`
- **oldFilePath** — Old file path of the entity (if moved) `incremental-updater.ts:40-40`
- **oldLine** — Represents an old line in a file `general-docs.ts:202-202`
- **oldLine** — Represents the old line number in a file `general-docs.ts:248-248`
- **oldLineNumber** — Old line number of the entity (if moved) `incremental-updater.ts:41-41`
- **original** — Original text in documentation (e.g., "src/utils/file.ts:42") `incremental-updater.ts:22-22`
- **path** — The file system path to the module `doc-generator.ts:16-16`
- **path** — Stores the path of a file `doc-generator.ts:41-41`
- **path** — Represents the file path for documentation generation `generate-handler-utils.ts:51-51`
- **path** — Represents the file path for the documentation generation `generate-handler-utils.ts:60-60`
- **path** — Represents the path of a file `generate-handler-utils.ts:104-104`
- **path** — Represents the file path `generate-handler-utils.ts:107-107`
- **path** — Represents the file path as a string `generate-handler-utils.ts:112-112`
- **path** — Returns a promise containing the number of files written and an array of incremental changes `generate-handler-utils.ts:251-251`
- **path** — Initializes an array to store incremental changes `generate-handler-utils.ts:254-254`
- **path** — Stores an array of incremental changes for paths and their associated changes `generate-handler-utils.ts:360-360`
- **preview** — Specifies whether the documentation generation is in preview mode `generate-handler-utils.ts:96-96`
- **preview** — Indicates whether a preview is enabled for the documentation `generate-handler-utils.ts:114-114`
- **preview** — Boolean indicating whether to preview documentation `generate-handler-utils.ts:24-24`
- **preview** — Provides a preview of the documentation updates `incremental-updater.ts:514-514`
- **relatedEntities** — An array of related entities for a documentation section `incremental-updater.ts:56-56`
- **requestId** — Stores the request ID for documentation generation `generate-handler-utils.ts:87-87`
- **rootDir** — The root directory to scan for modules `doc-generator.ts:25-25`
- **rootDir** — Root directory for documentation generation `generate-handler-utils.ts:18-18`
- **section** — The section of the incremental update change `generate-handler-utils.ts:79-79`
- **selectedModel** — The selected model for the LLM provider `generate-handler-utils.ts:70-70`
- **signature** — Signature of the module export `generate-handler-utils.ts:43-43`
- **size** — Not applicable `batch-autodoc.ts:127-127`
- **skipped** — Count of entities that were skipped in the batch auto-doc process `batch-autodoc.ts:20-20`
- **sourceHash** — Hash of the source code for the entity `batch-autodoc.ts:28-28`
- **start** — Start position of a location `batch-autodoc.ts:98-98`
- **start** — Not applicable `batch-autodoc.ts:125-125`
- **startIndex** — Start index in documentation content `incremental-updater.ts:30-30`
- **startLine** — Start line number of a location `batch-autodoc.ts:99-99`
- **startLine** — Start line in documentation content `incremental-updater.ts:52-52`
- **success** — Indicates whether the documentation generation was successful `generate-handler-utils.ts:95-95`
- **synced** — Count of entities that were synced in the batch auto-doc process `batch-autodoc.ts:22-22`
- **timestamp** — Timestamp of the change `incremental-updater.ts:43-43`
- **title** — Title of the entity document `batch-autodoc.ts:29-29`
- **title** — Title of the documentation section `incremental-updater.ts:48-48`
- **totalUpdated** — Tracks the total number of updated files `general-docs.ts:249-249`
- **type** — BatchResult `batch-autodoc.ts:123-123`
- **type** — Type of an entity `doc-generator.ts:226-226`
- **type** — Represents the type of a module `doc-generator.ts:244-244`
- **type** — The type of the generated documentation file (general or module) `doc-generator.ts:42-42`, `doc-generator.ts:285-285`
- **type** — The type of the file to be generated `generate-handler-utils.ts:61-61`
- **type** — The type of a module or file `generate-handler-utils.ts:78-78`
- **type** — Type of the module export `generate-handler-utils.ts:42-42`, `generate-handler-utils.ts:113-113`
- **type** — The type of change made to the documentation `incremental-updater.ts:66-66`
- **type** — Type of code change (added, modified, deleted, moved) `incremental-updater.ts:35-35`
- **updated** — Indicates a file has been updated `general-docs.ts:203-203`
- **updated** — A boolean indicating whether the documentation was updated `incremental-updater.ts:63-63`
- **useLlm** — Determines if the LLM is used for documentation generation `generate-handler-utils.ts:97-97`
- **useLlm** — Boolean indicating whether to use an LLM for documentation `generate-handler-utils.ts:23-23`
- **useLlm** — Uses an LLM to enhance documentation updates `incremental-updater.ts:424-424`
- **useLlm** — Indicates whether to use an LLM for enhancement `incremental-updater.ts:515-515`
