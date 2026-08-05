# Language Configs

## 🤖 Overview

The `language-configs` module provides a comprehensive set of language configurations and utilities for various programming languages, including Python, JavaScript, and more. It is used by developers and tools that require language-specific parsing and analysis capabilities.

The `language-configs` module is structured to export language configurations and utilities, making it easy for other modules to access and utilize these configurations. It includes a registry for language configurations and helper functions for advanced usage.

## 🤖 Architecture

```
  +---------------------+
  |     Language Configs |
  +---------------------+
          |               |
          v               v
  +---------------------+   +---------------------+
  |     Python Helpers  |   |     Registry        |
  +---------------------+   +---------------------+
          |               |
          v               v
  +---------------------+   +---------------------+
  |     JavaScript      |   |     Shared Keywords  |
  +---------------------+   +---------------------+
          |               |
          v               v
  +---------------------+
  |     Markup Languages |
  +---------------------+
          |
          v
  +---------------------+
  |     Scripting       |
  +---------------------+
```

## 🤖 Flow

```
  +---------------------+
  |     Language Configs |
  +---------------------+
          |               |
          v               v
  +---------------------+   +---------------------+
  |     Python Helpers  |   |     Registry        |
  +---------------------+   +---------------------+
          |               |
          v               v
  +---------------------+   +---------------------+
  |     JavaScript      |   |     Shared Keywords  |
  +---------------------+   +---------------------+
          |               |
          v               v
  +---------------------+
  |     Markup Languages |
  +---------------------+
          |
          v
  +---------------------+
  |     Scripting       |
  +---------------------+
```

## 🤖 Entity Listing

### Function
- **getFileConfig** — Returns the configuration for a file based on its path `registry.ts:78-81`
- **getLanguageConfig** — Returns the configuration for a specified language `registry.ts:71-73`
- **getPythonNodeCategory** — Determines the category of a Python node based on its type and name, with layers of parsing and feature recognition `python-helpers.ts:103-143`
- **isAsyncNode** — Check if a node type represents an async pattern (Layer 2) `python-helpers.ts:24-27`
- **isClassNode** — Checks if a node type is a class node for a given language `registry.ts:94-97`
- **isComprehensionNode** — Check if a node type represents a comprehension (Layer 2) `python-helpers.ts:40-48`
- **isContextManagerNode** — Check if a node type represents a context manager pattern (Layer 4) `python-helpers.ts:53-56`
- **isDecoratorNode** — Check if a node type represents a decorator (Layer 1) `python-helpers.ts:75-78`
- **isExceptionHandlingNode** — Check if a node type represents exception handling (Layer 4) `python-helpers.ts:61-70`
- **isExportNode** — Checks if a node type is an export node for a given language `registry.ts:110-113`
- **isFunctionNode** — Checks if a node type is a function node for a given language `registry.ts:86-89`
- **isGeneratorNode** — Check if a node type represents a generator pattern (Layer 2) `python-helpers.ts:32-35`
- **isImportNode** — Checks if a node type is an import node for a given language `registry.ts:102-105`
- **isMagicMethodNode** — Check if a node type represents a magic/dunder method (Layer 2) `python-helpers.ts:14-19`
- **isSpecialClassNode** — Checks if a node is a special class node in Python, considering decorators and base classes `python-helpers.ts:83-98`
- **isTypeNode** — Checks if a node type is a type or interface node for a given language `registry.ts:118-121`
- **validateConfigurations** — Validates the configurations for all supported languages `registry.ts:126-138`

### Import_decl
- **../../logging/index.js** — Imports `../../logging/index.js` from `../../logging/index.js`. `registry.ts:7-7`
- **../../types/parser.js** — Imports `../../types/parser.js` from `../../types/parser.js`. `python-helpers.ts:8-8`, `registry.ts:8-8`
- **./compiled-languages/index.js** — Imports `./compiled-languages/index.js`. `registry.ts:9-19`
- **./infrastructure/index.js** — Imports `./infrastructure/index.js`. `registry.ts:20-27`
- **./javascript-family/index.js** — Imports `./javascript-family/index.js` from `./javascript-family/index.js`. `registry.ts:29-29`
- **./markup-languages/index.js** — Imports `./markup-languages/index.js` from `./markup-languages/index.js`. `registry.ts:30-30`
- **./registry.js** — Imports `./registry.js` from `./registry.js`. `python-helpers.ts:9-9`
- **./scripting-languages/index.js** — Imports `./scripting-languages/index.js` from `./scripting-languages/index.js`. `registry.ts:31-31`
- **./shared/types.js** — Imports `./shared/types.js` from `./shared/types.js`. `registry.ts:32-32`
- **./shared/utils.js** — Imports `./shared/utils.js` from `./shared/utils.js`. `registry.ts:33-33`

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
