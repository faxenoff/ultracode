# Scripting Languages

## 🤖 Overview

This module provides configuration for various scripting languages, including Bash, Batch, PowerShell, and Python. It defines language-specific settings such as keywords, node types, and extractors for each language. Developers and script authors use this module to understand and parse the syntax and semantics of these scripting languages.

## 🤖 Architecture

```
  +---------------------+
  |     Language Configs     |
  |     (bash, batch, etc.)  |
  +---------------------+
          |
          v
  +---------------------+
  |     Language Keywords     |
  |     (from shared/keywords.js) |
  +---------------------+
          |
          v
  +---------------------+
  |     Language Node Types     |
  |     (defined per language)  |
  +---------------------+
          |
          v
  +---------------------+
  |     Language Extractors     |
  |     (for name and modifiers) |
  +---------------------+
```

## 🤖 Flow

```
  +---------------------+
  |     Language Configs     |
  |     (bash, batch, etc.)  |
  +---------------------+
          |
          v
  +---------------------+
  |     Language Keywords     |
  |     (from shared/keywords.js) |
  +---------------------+
          |
          v
  +----------------
  |     Language Node Types     |
  |     (defined per language)  |
  +----------------
          |
          v
  +---------------------+
  |     Language Extractors     |
  |     (for name and modifiers) |
  +---------------------+
          |
          v
  +---------------------+
  |     Language Parsing     |
  |     (uses extractors)     |
  +---------------------+
```

## 🤖 Entity Listing

### Function
- **BASH_CONFIG** — Represents the configuration for the Bash/Shell Script Language, including keywords, node types, and extractors for parsing and analyzing Bash scripts `bash.ts:23-36`
- **BASH_CONFIG** — Parses and returns modifiers for different node types in a BASH configuration `bash.ts:37-46`
- **BATCH_CONFIG** — Defines the configuration for the Batch/CMD language, including keywords, node types, and extractors `batch.ts:23-35`
- **BATCH_CONFIG** — Parses the node type and returns an array of modifiers `batch.ts:36-47`
- **POWERSHELL_CONFIG** — Defines the configuration for the PowerShell language, including keywords, node types, and extractors for parsing and analyzing PowerShell code `powershell.ts:23-38`
- **POWERSHELL_CONFIG** — Returns modifiers based on the node type `powershell.ts:39-48`
- **PYTHON_CONFIG** — Represents a comprehensive configuration for the Python language, including keywords, node types, and extractors for enhanced parsing and structural subtyping support `python.ts:75-127`
- **PYTHON_CONFIG** — Extracts modifiers for Python nodes based on their type `python.ts:128-159`

### Import_decl
- **../shared/keywords.js** — Imports `../shared/keywords.js` from `../shared/keywords.js`. `bash.ts:5-5`, `batch.ts:5-5`, `powershell.ts:5-5`, `python.ts:5-5`
- **../shared/types.js** — Imports `../shared/types.js` from `../shared/types.js`. `bash.ts:6-6`, `batch.ts:6-6`, `powershell.ts:6-6`, `python.ts:6-6`

## Data Flow

- **Inputs:** Imported by `registry.ts` during initialization.
- **Processing:** Static configuration data; no runtime processing.
- **Outputs:** `LanguageConfig` objects registered in `LANGUAGE_CONFIGS`.

## Public API

| Export | Type | Description | Location |
|--------|------|-------------|----------|
| `PYTHON_CONFIG` | const | Extended Python config with four-layer architecture | [`python.ts:8-164`](./python.ts) |
| `BASH_CONFIG` | const | Bash script and shell command configuration | [`bash.ts:8-51`](./bash.ts) |
| `BATCH_CONFIG` | const | Windows batch/cmd file configuration | [`batch.ts:8-52`](./batch.ts) |
| `POWERSHELL_CONFIG` | const | PowerShell script configuration with classes | [`powershell.ts:39-48`](./powershell.ts) |

## Dependencies

### Internal Modules

| Module | Purpose |
|--------|---------|
| `shared/types` | `LanguageConfig`, `NodeTypeConfig`, `ExtractorConfig` interfaces |

### External Packages

| Package | Purpose |
|---------|---------|
| (none) | Pure configuration data |

## Behavioral Properties

| Property | Value |
|----------|-------|
| Python extensions | `.py`, `.pyi`, `.pyw` |
| Bash extensions | `.sh`, `.bash` |
| Batch extensions | `.bat`, `.cmd` |
| PowerShell extensions | `.ps1`, `.psm1`, `.psd1` |

## Error Handling

Static configuration data with no runtime error paths. Validation performed by the registry module.

## Known Limitations

- Python extraction rules are the most complex and may miss very unusual constructs.
- Bash parsing does not cover all POSIX shell variants.
- Batch file parsing is limited to standard cmd.exe constructs.

## Exports

- `BASH_CONFIG`
- `BATCH_CONFIG`
- `POWERSHELL_CONFIG`
- `PYTHON_CONFIG`

## Files

| File | Description |
|------|-------------|
| `index.ts` | Re-exports all scripting language configurations |
| `python.ts` | Extended Python with decorators, comprehensions, async, magic methods |
| `bash.ts` | Bash shell script configuration |
| `batch.ts` | Windows batch/cmd file configuration |
| `powershell.ts` | PowerShell with cmdlets, classes, and filters |
