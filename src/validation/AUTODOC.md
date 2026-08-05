# validation

## 🤖 Overview

The `code-validator.ts` module provides a comprehensive code validation system that supports multiple programming languages, including TypeScript, JavaScript, and Python. It offers features such as batch validation, before/after problem comparison, and severity categorization. This module is primarily used by developers and maintainers to ensure code quality and consistency across different projects and files.

## 🤖 Architecture

```
  +-------------------+
  |   Linter Interface |
  +-------------------+
          |
          v
  +-------------------+
  |     Language Linters |
  +-------------------+
          |
          v
  +-------------------+
  |     Validation Engine |
  +-------------------+
          |
          v
  +-------------------+
  |     Problem Reporter |
  +-------------------+
```

## 🤖 Flow

```
  +-------------------+
  |     File Selection |
  +-------------------+
          |
          v
  +-------------------+
  |     File Validation |
  +-------------------+
          |
          v
  +-------------------+
  |     Problem Reporting |
  +-------------------+
          |
          v
  +-------------------+
  |     Summary Generation |
  +-------------------+
```

## 🤖 Entity Listing

### Function
- **batchReports** — Method to generate batch reports `code-validator.ts:138-138`
- **walk** — Method to walk through files `code-validator.ts:259-288`

### Method
- **categorizeProblems** — Method to categorize problems `code-validator.ts:180-203`
- **compareReports** — Method to compare before and after reports `code-validator.ts:160-175`
- **constructor** — Constructor for the CodeValidator class `code-validator.ts:77-79`
- **findFiles** — Method to find files `code-validator.ts:256-291`
- **getOrLoadLinter** — Method to get or load a linter `code-validator.ts:228-251`
- **initializeLinters** — Method to initialize linters `code-validator.ts:84-87`
- **selectLinter** — Method to select a linter `code-validator.ts:208-223`
- **validateDirectory** — Method to validate a directory `code-validator.ts:127-143`
- **validateFile** — Method to validate a single file `code-validator.ts:92-122`
- **validateModification** — Method to validate a modification `code-validator.ts:148-155`

### Class
- **CodeValidator** — Class for code validation with linters `code-validator.ts:74-292`

### Interface
- **BeforeAfterReport** — Represents a report comparing before and after code validation `code-validator.ts:49-59`
- **Linter** — Interface for code linters `code-validator.ts:65-68`
- **ValidationProblem** — Represents a single problem found during code validation `code-validator.ts:40-47`
- **ValidationReport** — Represents a report of code validation results, including file path, timestamp, and problem details `code-validator.ts:27-38`

### Import_decl
- **../agents/dev/file-extensions.js** — Imports `../agents/dev/file-extensions.js` from `../agents/dev/file-extensions.js`. `code-validator.ts:19-19`
- **../logging/index.js** — Imports `../logging/index.js` from `../logging/index.js`. `code-validator.ts:20-20`
- **../utils/file-ops.js** — Imports `../utils/file-ops.js` from `../utils/file-ops.js`. `code-validator.ts:21-21`
- **node:path** — Imports `node:path` from `node:path`. `code-validator.ts:18-18`

### Property
- **after** — Contains the validation report after changes were made `code-validator.ts:51-51`
- **before** — Contains the validation report before any changes were made `code-validator.ts:50-50`
- **column** — Indicates the column number where the problem occurred `code-validator.ts:44-44`
- **errors** — Counts the number of errors in the validation report `code-validator.ts:32-32`
- **errorsFixed** — Number of errors fixed in the code `code-validator.ts:53-53`
- **filePath** — Stores the file path of the code being validated `code-validator.ts:28-28`
- **improvement** — Provides details on the improvement in the validation report `code-validator.ts:52-58`
- **info** — Counts the number of informational messages in the validation report `code-validator.ts:34-34`
- **line** — Indicates the line number where the problem occurred `code-validator.ts:43-43`
- **linters** — Map of linters `code-validator.ts:75-75`
- **linterUsed** — Indicates the linter used for validation `code-validator.ts:37-37`
- **message** — Contains the message describing the validation problem `code-validator.ts:42-42`
- **name** — Name of the linter `code-validator.ts:66-66`
- **netChange** — Net change in the number of errors and warnings `code-validator.ts:57-57`
- **newErrors** — Number of new errors introduced in the code `code-validator.ts:55-55`
- **newWarnings** — Number of new warnings introduced in the code `code-validator.ts:56-56`
- **problems** — Contains an array of validation problems `code-validator.ts:30-30`
- **ruleId** — Optional identifier for the rule that caused the problem `code-validator.ts:45-45`
- **severity** — Specifies the severity of the validation problem (error, warning, or info) `code-validator.ts:41-41`
- **source** — Optional identifier for the linter that reported the problem `code-validator.ts:46-46`
- **summary** — Provides a summary of the validation results, including error, warning, and info counts `code-validator.ts:31-36`
- **timestamp** — Records the timestamp of the validation process `code-validator.ts:29-29`
- **total** — Represents the total number of problems in the validation report `code-validator.ts:35-35`
- **warnings** — Counts the number of warnings in the validation report `code-validator.ts:33-33`
- **warningsFixed** — Number of warnings fixed in the code `code-validator.ts:54-54`

## Public API

### Types and Interfaces

| Export | Location | Description |
|--------|----------|-------------|
| `ValidationReport` | `code-validator.ts:26-37` | Single-file lint result containing file path, timestamp, problems array, and summary counts (errors, warnings, info). |
| `ValidationProblem` | `code-validator.ts:39-46` | Individual lint problem with severity level, message text, line and column position, optional rule identifier, and linter source. |
| `BeforeAfterReport` | `code-validator.ts:48-58` | Before/after validation comparison containing baseline and current reports with improvement metrics (errors fixed, warnings fixed, new errors introduced). |
| `Linter` | `code-validator.ts:49-59` | Pluggable linter interface defining `name` property and `lint(filePath: string, content: string)` method returning problems array. |

### Classes

| Export | Location | Description |
|--------|----------|-------------|
| `CodeValidator` | `code-validator.ts:73-291` | Main validation orchestrator that selects language-appropriate linters, validates individual files or entire directories with concurrency limits, and generates improvement reports comparing code quality before and after changes. |

### CodeValidator Methods

| Method | Location | Description |
|--------|----------|-------------|
| `.validateFile(filePath)` | `code-validator.ts:91-121` | Validates a single file and returns a `ValidationReport` with all lint problems discovered. |
| `.validateDirectory(dirPath, extensions?)` | `code-validator.ts:126-142` | Batch validates all files in a directory (recursively) matching specified extensions, respecting a concurrency limit of 10 parallel validations. |
| `.validateModification(filePath, beforeReport?)` | `code-validator.ts:147-154` | Performs before/after validation comparison, accepting an optional pre-computed baseline report or computing one automatically. |
| `.fixFile(filePath)` | `code-validator.ts:156-191` | Applies autofix for supported linters (oxlint, biome) to correct fixable lint problems in a file. |
| `.dryRunFix(filePath)` | `code-validator.ts:193-291` | Simulates autofix on a temporary file copy, compares results, and reports what would change without modifying the original file. |

## Linter Implementations

| Export | Location | Description |
|--------|----------|-------------|
| `OxlintLinter` | `linters/oxlint-linter.ts:15-139` | Fast oxlint implementation for JavaScript and TypeScript with autofix and dry-run support, using JSON output parsing and subprocess execution. |
| `BiomeLinter` | `linters/biome-linter.ts:8-127` | Biome-based linter for JavaScript and TypeScript with similar autofix and dry-run capabilities as OxlintLinter, offering an alternative to oxlint. |
| `PylintLinter` | `linters/pylint-linter.ts:14-97` | Python linter integration that invokes pylint as a subprocess with JSON output format, providing problem detection for `.py` and `.pyi` files. |

## Dependencies

| Module | Purpose |
|--------|---------|
| `../logging/index` | Structured logging for linter initialization failures and lint operation errors. |
| `../utils/file-ops` | File reading (`readText`), directory traversal (`readdir`), and file discovery for validation. |
| `../utils/shell` | Shell command execution wrapper for subprocess-based linters (oxlint, biome). |
| `oxlint` | External binary for fast JavaScript/TypeScript linting via subprocess. |
| `pylint` | External binary for Python linting invoked via subprocess. |
| `@biomejs/biome` | External binary for JavaScript/TypeScript linting as oxlint alternative. |
| `node:child_process` | Native Node subprocess execution for pylint integration. |
| `node:fs/promises` | Async file operations (`copyFile`, `readFile`, `unlink`) for dry-run temporary file handling. |
| `node:path` | Path utilities (`extname`, `join`, `dirname`) for file type detection and path construction. |
| `node:os` | Temporary directory access (`tmpdir`) for safe dry-run file copies. |
| `node:module` | Module resolution (`createRequire`) for locating oxlint and biome binary paths. |

## Configuration

| Setting | Value | Purpose |
|---------|-------|---------|
| Batch concurrency limit | 10 | Maximum number of parallel file validations in directory scans. |
| Lint timeout | 30000 ms | Maximum execution time for oxlint and biome subprocess calls. |
| Default file extensions | `.ts`, `.tsx`, `.js`, `.jsx`, `.py` | File types validated when no extensions filter is specified. |
| Excluded directories | `node_modules`, `.git`, `dist`, `build`, `coverage` | Directories skipped during recursive directory traversal. |
| Linter selection strategy | Extension-based routing | `.ts/.tsx/.js/.jsx/.mjs/.cjs` → oxlint; `.py/.pyi` → pylint. |

## Behavioral Properties

| Behavior | Detail |
|----------|--------|
| Lazy linter loading | Linters are dynamically imported on first use; missing binaries do not cause startup errors. |
| Linter instance caching | Successfully loaded linters are cached in a Map to avoid repeated initialization. |
| Graceful degradation | If a linter fails to load or is not installed, validation returns an empty problems array with a warning log. |
| Dry-run autofix safety | File is copied to temporary location, fixes applied, output compared, then temp file deleted; original never modified. |
| Parallel directory walk | Recursive directory traversal uses `Promise.all()` for concurrent subdirectory processing. |
| Non-zero exit tolerance | Linter subprocesses may exit with non-zero codes when problems are found; output is parsed regardless. |
| Problem categorization | Lint output is parsed and problems grouped by severity level (error, warning, info) for summary counts. |
