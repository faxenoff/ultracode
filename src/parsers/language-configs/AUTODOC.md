---
module_name: language-configs
description: "Language-specific parsing configurations for 20+ programming languages with AST node types and extraction rules"
status: active
language: typescript
---

# Language Configs

> Central registry of language-specific parsing configurations defining AST node types, file extensions, keywords, and extraction rules for 20+ programming languages.

## Overview

The language-configs module provides `LanguageConfig` objects for every supported programming language, organized into four sub-modules: compiled languages (C, C++, C#, Go, Java, Kotlin, Rust, Swift, Zig), JavaScript family (JS, TS, JSX, TSX), scripting languages (Python, Bash, Batch, PowerShell), and markup languages (CSS, HTML, JSON, XML). The central registry maps language names to configs and provides lookup functions for determining language from file paths, checking AST node types (function, class, import, export, type), and validating configurations.

## Data Flow

- **Inputs:** File paths or language names from the parser module.
- **Processing:** Extension-based language detection, config lookup from the registry map.
- **Outputs:** `LanguageConfig` objects with node types, keywords, extractors for the AST parser.

## Public API

| Export | Type | Description | Location |
|--------|------|-------------|----------|
| `LANGUAGE_CONFIGS` | const | Registry mapping all language names to configs | [`registry.ts:31-53`](./registry.ts) |
| `getLanguageConfig` | function | Gets config by language name | [`registry.ts:58-60`](./registry.ts) |
| `getFileConfig` | function | Gets config by file path (auto-detection) | [`registry.ts:65-68`](./registry.ts) |
| `isFunctionNode` | function | Checks if AST node is a function | [`registry.ts:71-73`](./registry.ts) |
| `isClassNode` | function | Checks if AST node is a class | [`registry.ts:78-81`](./registry.ts) |
| `isImportNode` | function | Checks if AST node is an import | [`registry.ts:86-89`](./registry.ts) |
| `isExportNode` | function | Checks if AST node is an export | [`registry.ts:94-97`](./registry.ts) |
| `isTypeNode` | function | Checks if AST node is a type/interface | [`registry.ts:102-105`](./registry.ts) |
| `validateConfigurations` | function | Validates all configs at startup | [`registry.ts:113-125`](./registry.ts) |
| `isMagicMethodNode` | function | Checks for Python magic methods | [`python-helpers.ts:14-19`](./python-helpers.ts) |
| `getPythonNodeCategory` | function | Returns extended Python node category | [`python-helpers.ts:103-143`](./python-helpers.ts) |

## Dependencies

### Internal Modules

| Module | Purpose |
|--------|---------|
| `types/parser` | `SupportedLanguage` type definition |
| `logging` | Validation result logging |

### External Packages

| Package | Purpose |
|---------|---------|
| (none) | Pure TypeScript configuration data |

## Behavioral Properties

| Property | Value |
|----------|-------|
| Supported languages | 20 (JS, TS, JSX, TSX, Python, C, C++, C#, Rust, Go, Java, Kotlin, Swift, Zig, CSS, HTML, XML, JSON, Bash, PowerShell, Batch) |
| Default language | `javascript` when extension is unrecognized |
| Config structure | Extensions, keywords, nodeTypes, extractors |

## Error Handling

`detectLanguageFromPath` falls back to `javascript` for unknown extensions. `validateConfigurations` logs errors for invalid configs and returns `false`. Config lookups are type-safe via the `SupportedLanguage` union type.

## Known Limitations

- Language detection is extension-based only; file content analysis is not performed.
- `.h` files default to C; C++ detection requires path hints.
- No support for languages without Tree-sitter grammars.

## Exports

- `C_CONFIG`
- `CPP_CONFIG`
- `CSHARP_CONFIG`
- `GO_CONFIG`
- `JAVA_CONFIG`
- `KOTLIN_CONFIG`
- `RUST_CONFIG`
- `SWIFT_CONFIG`
- `HELM_CONFIG`
- `JAVASCRIPT_CONFIG`
- `JSX_CONFIG`
- `TSX_CONFIG`
- `TYPESCRIPT_CONFIG`
- `CSS_CONFIG`
- `HTML_CONFIG`
- `JSON_CONFIG`
- `XML_CONFIG`
- `getPythonNodeCategory`
- `isAsyncNode`
- `isComprehensionNode`
- `isContextManagerNode`
- `isDecoratorNode`
- `isExceptionHandlingNode`
- `isGeneratorNode`
- `isMagicMethodNode`
- `isSpecialClassNode`
- `getFileConfig`
- `getLanguageConfig`
- `isClassNode`
- `isExportNode`
- `isFunctionNode`
- `isImportNode`
- `isTypeNode`
- `LANGUAGE_CONFIGS`
- `validateConfigurations`
- `BASH_CONFIG`
- `BATCH_CONFIG`
- `POWERSHELL_CONFIG`
- `PYTHON_CONFIG`
- `FILE_EXTENSIONS`
- `LANGUAGE_KEYWORDS`
- `detectLanguageFromPath`
- `getSupportedExtensions`
- `isFileSupported`

## Files

| File | Description |
|------|-------------|
| `index.ts` | Re-exports all configs, helpers, types, and registry functions |
| `registry.ts` | Central language config registry with lookup and validation |
| `python-helpers.ts` | Python-specific AST node type utilities |
