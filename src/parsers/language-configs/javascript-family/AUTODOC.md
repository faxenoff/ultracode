# JavaScript Family

## 🤖 Overview

The `javascript-family` module provides language-specific configurations for JavaScript, JSX, TSX, and TypeScript. Developers and linters use these configurations to enforce coding standards and perform static analysis.

## 🤖 Architecture

```
  +-------------------+
  |   Language Configs |
  |   (JavaScript, JSX, TSX, TypeScript) |
  +-------------------+
          |
          v
  +-------------------+
  |   Exported Configs |
  |   (JAVASCRIPT_CONFIG, JSX_CONFIG, TSX_CONFIG, TYPESCRIPT_CONFIG) |
  +-------------------+
```

## 🤖 Flow

```
  +-------------------+
  |   Language Files |
  |   (javascript.ts, jsx.ts, tsx.ts, typescript.ts) |
  |   (4 entities each) |
  +-------------------+
          |
          v
  +-------------------+
  |   Language Configs |
  |   (JavaScript, JSX, TS
```

## 🤖 Entity Listing

### Function
- **JAVASCRIPT_CONFIG** — Defines the configuration for the JavaScript language, including keywords, node types, and extractors for parsing and analyzing JavaScript code `javascript.ts:33-45`, `javascript.ts:46-48`
- **TYPESCRIPT_CONFIG** — Represents the TypeScript language configuration with details on keywords, node types, and extractors `typescript.ts:41-57`, `typescript.ts:58-60`

### Import_decl
- **../shared/keywords.js** — Imports `../shared/keywords.js` from `../shared/keywords.js`. `javascript.ts:5-5`, `jsx.ts:5-5`, `tsx.ts:5-5`, `typescript.ts:5-5`
- **../shared/types.js** — Imports `../shared/types.js` from `../shared/types.js`. `javascript.ts:6-6`, `jsx.ts:6-6`, `tsx.ts:6-6`, `typescript.ts:6-6`
- **./javascript.js** — Imports `./javascript.js` from `./javascript.js`. `jsx.ts:7-7`
- **./typescript.js** — Imports `./typescript.js` from `./typescript.js`. `tsx.ts:7-7`

## Data Flow

- **Inputs:** Imported by `registry.ts` during initialization.
- **Processing:** Static configuration data; no runtime processing.
- **Outputs:** `LanguageConfig` objects registered in `LANGUAGE_CONFIGS`.

## Public API

| Export | Type | Description | Location |
|--------|------|-------------|----------|
| `JAVASCRIPT_CONFIG` | const | Standard JavaScript parser configuration | [`javascript.ts:8-53`](./javascript.ts) |
| `TYPESCRIPT_CONFIG` | const | Full TypeScript config with interfaces and types | [`typescript.ts:8-65`](./typescript.ts) |
| `JSX_CONFIG` | const | JavaScript + JSX element support | [`jsx.ts:9-18`](./jsx.ts) |
| `TSX_CONFIG` | const | TypeScript + TSX element support | [`tsx.ts:9-18`](./tsx.ts) |

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
| Extensions (JS) | `.js`, `.mjs`, `.cjs` |
| Extensions (TS) | `.ts`, `.mts`, `.cts` |
| Extensions (JSX/TSX) | `.jsx`, `.tsx` |

## Error Handling

Static configuration data with no runtime error paths. Validation performed by the registry module.

## Known Limitations

- JSX/TSX configs extend base configs but do not support all React-specific patterns.
- No distinction between CommonJS and ES module syntax at the config level.

## Exports

- `JAVASCRIPT_CONFIG`
- `JSX_CONFIG`
- `TSX_CONFIG`
- `TYPESCRIPT_CONFIG`

## Files

| File | Description |
|------|-------------|
| `index.ts` | Re-exports all JavaScript family configurations |
| `javascript.ts` | Standard JavaScript node types and extractors |
| `typescript.ts` | Full TypeScript with interfaces, types, enums, and modifiers |
| `jsx.ts` | JavaScript extended with JSX element syntax |
| `tsx.ts` | TypeScript extended with TSX element syntax |
