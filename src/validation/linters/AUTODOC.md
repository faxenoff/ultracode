# Linters

## 🤖 Overview

The `Validation/linters` module provides a set of linters for code validation, including `biome-linter.ts`, `oxlint-linter.ts`, and `pylint-linter.ts`. These linters are used by developers to ensure code quality and adhere to coding standards.

## 🤖 Architecture

```
  +-------------------+
  |   Linter Factory  |
  +-------------------+
          |
          v
  +-------------------+
  |   Biome Linter    |
  +-------------------+
  |   Oxlint Linter   |
  +-------------------+
  |   Pylint Linter   |
  +-------------------+
          |
          v
  +-------------------+
  |   Code Validator  |
  +-------------------+
```

## 🤖 Flow

```
  +-------------------+
  |   Linter Factory  |
  +-------------------+
          |
          v
  +-------------------+
  |   Biome Linter    |
  +-------------------+
  |   Oxlint Linter   |
  +-------------------+
  |   Pylint Linter   |
  +-------------------+
          |
          v
  +-------------------+
  |   Code Validator  |
  +-------------------+
```

## 🤖 Entity Listing

### Method
- **checkPylintAvailable** — Checks if Pylint is available and returns a boolean `pylint-linter.ts:87-96`
- **getBinPath** — Get the path to the Biome binary `biome-linter.ts:101-126`
- **getBinPath** — Retrieves the path to the oxlint binary `oxlint-linter.ts:111-138`
- **lint** — Lint file with Biome `biome-linter.ts:19-73`
- **lint** — Lints a file with oxlint, optionally applying fixes and showing dry-run results `oxlint-linter.ts:26-83`
- **lint** — Lints a file with Pylint and returns validation problems `pylint-linter.ts:21-82`
- **parseOutput** — Parse Biome output into validation problems `biome-linter.ts:75-99`
- **parseOutput** — Parses the output from oxlint to extract validation problems `oxlint-linter.ts:85-109`

### Class
- **BiomeLinter** — Lint file with Biome `biome-linter.ts:8-127`
- **OxlintLinter** — Implements a fast linter for TypeScript/JavaScript files using oxlint binary `oxlint-linter.ts:15-139`
- **PylintLinter** — Implements a Pylint linter for Python files using subprocess `pylint-linter.ts:14-97`

### Import_decl
- **../../logging/index.js** — Imports `../../logging/index.js` from `../../logging/index.js`. `biome-linter.ts:4-4`, `oxlint-linter.ts:11-11`, `pylint-linter.ts:9-9`
- **../../utils/shell.js** — Imports `../../utils/shell.js` from `../../utils/shell.js`. `biome-linter.ts:5-5`, `oxlint-linter.ts:12-12`
- **../code-validator.js** — Imports `../code-validator.js` from `../code-validator.js`. `biome-linter.ts:6-6`, `oxlint-linter.ts:13-13`, `pylint-linter.ts:10-10`
- **node:child_process** — Imports `node:child_process` from `node:child_process`. `pylint-linter.ts:7-7`
- **node:fs/promises** — Imports `node:fs/promises` from `node:fs/promises`. `biome-linter.ts:1-1`, `oxlint-linter.ts:8-8`
- **node:os** — Imports `node:os` from `node:os`. `biome-linter.ts:2-2`, `oxlint-linter.ts:9-9`
- **node:path** — Imports `node:path` from `node:path`. `biome-linter.ts:3-3`, `oxlint-linter.ts:10-10`
- **node:util** — Imports `node:util` from `node:util`. `pylint-linter.ts:8-8`

### Property
- **bin** — Represents the oxlint binary path `oxlint-linter.ts:122-122`
- **binPath** — Path to the Biome binary `biome-linter.ts:10-10`
- **binPath** — Stores the path to the oxlint binary `oxlint-linter.ts:17-17`
- **category** — Category of a diagnostic `biome-linter.ts:82-82`
- **code** — Represents the code associated with a diagnostic `oxlint-linter.ts:90-90`
- **column** — Column number of a diagnostic `biome-linter.ts:81-81`
- **column** — Represents the column number of a diagnostic `oxlint-linter.ts:92-92`
- **content** — Content of a message `biome-linter.ts:79-79`
- **diagnostics** — Array of diagnostics from Biome `biome-linter.ts:78-83`
- **diagnostics** — Represents the diagnostics from the linter `oxlint-linter.ts:88-93`
- **labels** — Represents the labels associated with a diagnostic `oxlint-linter.ts:92-92`
- **line** — Line number of a diagnostic `biome-linter.ts:81-81`
- **line** — Represents the line number of a diagnostic `oxlint-linter.ts:92-92`
- **location** — Location of a diagnostic `biome-linter.ts:81-81`
- **message** — Message content from a diagnostic `biome-linter.ts:79-79`
- **message** — Represents the message associated with a diagnostic `oxlint-linter.ts:89-89`
- **name** — Name of the linter `biome-linter.ts:9-9`
- **name** — Stores the name of the linter as "oxlint" `oxlint-linter.ts:16-16`
- **name** — Stores the name of the linter as "Pylint" `pylint-linter.ts:15-15`
- **pylintAvailable** — Checks if Pylint is available and stores the result `pylint-linter.ts:16-16`
- **severity** — Severity level of a diagnostic `biome-linter.ts:80-80`
- **severity** — Represents the severity of a diagnostic `oxlint-linter.ts:91-91`
- **span** — Span of a diagnostic `biome-linter.ts:81-81`
- **span** — Represents the span of a diagnostic `oxlint-linter.ts:92-92`
- **start** — Start position of a diagnostic `biome-linter.ts:81-81`
- **stderr** — Standard error from the Biome command `biome-linter.ts:65-65`
- **stderr** — Stores the standard error from the oxlint command `oxlint-linter.ts:75-75`
- **stdout** — Standard output from the Biome command `biome-linter.ts:65-65`
- **stdout** — Stores the standard output from the oxlint command `oxlint-linter.ts:75-75`
- **stdout** — Stores the output from the Pylint command `pylint-linter.ts:56-56`
- **stdout** — Parses the stdout property from an error object `pylint-linter.ts:58-58`

## Data Flow

- **Inputs:** File path and content from the validation tool handler.
- **Processing:** External tool execution via subprocess, JSON output parsing into `ValidationProblem` objects.
- **Outputs:** Array of `ValidationProblem` with severity, message, line, column, and rule ID.

## Public API

| Export | Type | Description | Location |
|--------|------|-------------|----------|
| `BiomeLinter` | class | Biome linter with JSON reporter and autofix support | [`biome-linter.ts:8-127`](./biome-linter.ts) |
| `OxlintLinter` | class | oxlint linter (~100x faster than ESLint) | [`oxlint-linter.ts:15-139`](./oxlint-linter.ts) |
| `PylintLinter` | class | Pylint linter for Python files via subprocess | [`pylint-linter.ts:14-97`](./pylint-linter.ts) |

## Dependencies

### Internal Modules

| Module | Purpose |
|--------|---------|
| `validation/code-validator` | `Linter` interface and `ValidationProblem` type |
| `utils/shell` | Shell command execution utility |
| `logging` | Warning and error logging |

### External Packages

| Package | Purpose |
|---------|---------|
| `@biomejs/biome` | Biome binary (resolved via `require.resolve`) |
| `node:fs/promises` | Temp file creation for dry-run mode |
| `node:child_process` | Subprocess execution for Pylint |

## Behavioral Properties

| Property | Value |
|----------|-------|
| Biome timeout | 30 seconds per lint operation |
| Dry-run approach | Copy to temp file, apply fixes, diff against original |
| Pylint availability | Checked once and cached |

## Error Handling

All linters catch subprocess errors and return empty arrays rather than throwing. Biome and oxlint attempt to parse JSON output even from error exits (since linters exit non-zero when issues are found). Pylint checks its own availability before attempting to lint.

## Known Limitations

- Biome binary path resolution depends on it being in `node_modules`.
- Pylint must be installed globally or in the project's Python environment.
- Autofix dry-run mode creates temporary files in the OS temp directory.

## Files

| File | Description |
|------|-------------|
| `biome-linter.ts` | Biome linter with JSON output parsing and dry-run support |
| `oxlint-linter.ts` | oxlint integration, ~100x faster than ESLint |
| `pylint-linter.ts` | Pylint integration for Python via subprocess |
