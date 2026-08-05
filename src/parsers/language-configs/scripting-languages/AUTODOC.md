---
module_name: scripting-languages
description: "Parser configurations for scripting languages: Python, Bash, Batch, PowerShell"
status: active
language: typescript
---

# Scripting Languages

> Parser configuration objects for interpreted scripting languages: Python (with four-layer architecture), Bash, Windows Batch, and PowerShell.

## Overview

The scripting-languages module provides `LanguageConfig` objects for Python, Bash, Batch (cmd), and PowerShell. The Python config is the most comprehensive, featuring a four-layer extraction architecture that handles functions, classes, decorators, comprehensions, context managers, async constructs, and magic methods. Bash covers shell functions and commands, Batch handles Windows cmd/bat files, and PowerShell includes cmdlet, function, class, and filter support.

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
