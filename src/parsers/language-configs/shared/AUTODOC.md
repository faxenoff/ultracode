# Shared

## 🤖 Overview

The `shared` module provides shared language configuration utilities for parsing and analyzing code. It is used by developers and tools that need to identify and extract language-specific information from code files.

## 🤖 Architecture

```
  +---------------------+
  |     keywords.ts     |
  |     types.ts        |
  |     utils.ts        |
  +---------------------+
  |     index.ts        |
  +---------------------+
```

## 🤖 Flow

```
  +---------------------+
  |     index.ts        |
  |     keywords.ts     |
  |     types.ts        |
  |     utils.ts        |
  +---------------------+
  |     shared module   |
  +---------------------+
```

## 🤖 Entity Listing

### Function
- **detectLanguageFromPath** — Detects the programming language based on the file path `utils.ts:13-30`
- **getSupportedExtensions** — Returns a list of all supported file extensions `utils.ts:43-45`
- **isFileSupported** — Checks if a file has a supported extension `utils.ts:35-38`

### Interface
- **ExtractorConfig** — Extraction patterns and rules for parsing `types.ts:38-44`
- **LanguageConfig** — Language configuration for parsing `types.ts:13-19`
- **NodeTypeConfig** — Tree-sitter node types for each language construct `types.ts:24-33`

### Import_decl
- **../../../types/parser.js** — Imports `../../../types/parser.js` from `../../../types/parser.js`. `keywords.ts:7-7`, `types.ts:7-7`, `utils.ts:7-7`
- **./keywords.js** — Imports `./keywords.js` from `./keywords.js`. `types.ts:8-8`, `utils.ts:8-8`

### Property
- **classes** — Not applicable in this context `keywords.ts:121-121`
- **classes** — Node types for classes `types.ts:26-26`
- **exports** — Not applicable in this context `keywords.ts:123-123`
- **exports** — Node types for exports `types.ts:29-29`
- **extensions** — File extensions associated with the language `types.ts:15-15`
- **extractModifiers** — Function to extract modifiers from node types `types.ts:40-40`
- **extractName** — Function to extract names from node types `types.ts:39-39`
- **extractors** — Extraction patterns and rules for parsing `types.ts:18-18`
- **extractParameters** — Boolean indicating whether to extract parameters `types.ts:41-41`
- **extractReferences** — Boolean indicating whether to extract references `types.ts:43-43`
- **extractReturnType** — Boolean indicating whether to extract return types `types.ts:42-42`
- **functions** — Not applicable in this context `keywords.ts:120-120`
- **functions** — Node types for functions `types.ts:25-25`
- **imports** — Not applicable in this context `keywords.ts:122-122`
- **imports** — Node types for imports `types.ts:28-28`
- **interfaces** — Node types for interfaces `types.ts:32-32`
- **keywords** — Keywords specific to the language `types.ts:16-16`
- **language** — Supported language for parsing `types.ts:14-14`
- **methods** — Node types for methods `types.ts:27-27`
- **nodeTypes** — Tree-sitter node types for each language construct `types.ts:17-17`
- **types** — Not applicable in this context `keywords.ts:124-124`
- **types** — Node types for types `types.ts:31-31`
- **variables** — Node types for variables `types.ts:30-30`

## Data Flow

- **Inputs:** File paths for language detection, language names for keyword lookup.
- **Processing:** Extension extraction and mapping, keyword dictionary lookup.
- **Outputs:** `SupportedLanguage` values, boolean support checks, extension lists.

## Public API

| Export | Type | Description | Location |
|--------|------|-------------|----------|
| `LanguageConfig` | interface | Language configuration with extensions, keywords, nodeTypes, extractors | [`types.ts:13-19`](./types.ts) |
| `NodeTypeConfig` | interface | Tree-sitter node types for code constructs | [`types.ts:24-33`](./types.ts) |
| `ExtractorConfig` | interface | Name, modifier, and parameter extraction rules | [`types.ts:38-44`](./types.ts) |
| `FILE_EXTENSIONS` | const | Mapping of file extensions to supported languages | [`keywords.ts:12-100`](./keywords.ts) |
| `LANGUAGE_KEYWORDS` | const | Keyword dictionaries for each language | [`keywords.ts:105-113`](./keywords.ts) |
| `detectLanguageFromPath` | function | Detects language from a file path's extension | [`utils.ts:13-30`](./utils.ts) |
| `isFileSupported` | function | Checks if a file extension is supported | [`utils.ts:35-38`](./utils.ts) |
| `getSupportedExtensions` | function | Returns all supported file extensions | [`utils.ts:43-45`](./utils.ts) |

## Dependencies

### Internal Modules

| Module | Purpose |
|--------|---------|
| `types/parser` | `SupportedLanguage` union type |

### External Packages

| Package | Purpose |
|---------|---------|
| (none) | Pure TypeScript types and data |

## Behavioral Properties

| Property | Value |
|----------|-------|
| Total mapped extensions | 40+ file extensions across all languages |
| Default language fallback | `javascript` for unrecognized extensions |
| Special cases | `.h` defaults to C; capital `.C` maps to C++ |

## Error Handling

`detectLanguageFromPath` falls back to `javascript` for unknown extensions rather than throwing. `isFileSupported` returns `false` for unsupported files.

## Known Limitations

- Extension-only detection cannot distinguish ambiguous files (e.g., `.h` could be C or C++).
- Keyword dictionaries are used for pattern matching, not for full lexical analysis.

## Exports

- `FILE_EXTENSIONS`
- `LANGUAGE_KEYWORDS`
- `detectLanguageFromPath`
- `getSupportedExtensions`
- `isFileSupported`

## Files

| File | Description |
|------|-------------|
| `index.ts` | Re-exports all public types, constants, and utilities |
| `types.ts` | `LanguageConfig`, `NodeTypeConfig`, `ExtractorConfig` interfaces |
| `keywords.ts` | File extension mappings and language keyword dictionaries |
| `utils.ts` | Language detection from path, support checking, extension listing |
