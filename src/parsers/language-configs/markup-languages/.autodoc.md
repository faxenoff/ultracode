# Markup Languages

## 🤖 Overview

This module provides language configurations for various markup languages, including CSS, HTML, JSON, and XML. Developers and tools that need to parse or highlight these languages can use these configurations to enhance their functionality.

## 🤖 Architecture

```
  +-------------------+
  |   Language Config |
  +-------------------+
  |     - CSS         |
  |     - HTML        |
  |     - JSON        |
  |     - XML         |
  +-------------------+
  |     Language      |
  |     - Keywords     |
  |     - Node Types   |
  |     - Extractors   |
  +-------------------+
```

## 🤖 Flow

```
  +-------------------+
  |   Language Config |
  |     - CSS         |
  |     - HTML        |
  |     - JSON        |
  |     - XML         |
  +-------------------+
  |     Language      |
  |     - Keywords     |
  |     - Node Types   |
  |     - Extractors   |
  +-------------------+
  |     Language      |
  |     - Keywords     |
  |     - Node Types   |
  |     - Extractors   |
  +-------------------+
```

## 🤖 Entity Listing

### Function
- **CSS_CONFIG** — Defines the configuration for the CSS language, including its name, file extensions, keywords, node types, and extractors `css.ts:23-23`
- **CSS_CONFIG** — Parses the CSS configuration `css.ts:24-24`
- **HTML_CONFIG** — Represents the configuration for the HTML language, including its keywords, node types, and extractors `html.ts:23-23`
- **HTML_CONFIG** — Parses the HTML configuration `html.ts:24-24`
- **JSON_CONFIG** — Defines the configuration for the JSON language, including keywords, node types, and extractors `json.ts:23-23`
- **JSON_CONFIG** — Parses a JSON configuration object `json.ts:24-24`
- **XML_CONFIG** — Defines the configuration for the XML language, including its name, extensions, keywords, and various extractors `xml.ts:23-23`
- **XML_CONFIG** — Parses the XML configuration and extracts modifiers `xml.ts:24-24`

### Import_decl
- **../shared/keywords.js** — Imports `../shared/keywords.js` from `../shared/keywords.js`. `css.ts:5-5`, `html.ts:5-5`, `json.ts:5-5`, `xml.ts:5-5`
- **../shared/types.js** — Imports `../shared/types.js` from `../shared/types.js`. `css.ts:6-6`, `html.ts:6-6`, `json.ts:6-6`, `xml.ts:6-6`

## Data Flow

- **Inputs:** Imported by `registry.ts` during initialization.
- **Processing:** Static configuration data; no runtime processing.
- **Outputs:** `LanguageConfig` objects registered in `LANGUAGE_CONFIGS`.

## Public API

| Export | Type | Description | Location |
|--------|------|-------------|----------|
| `CSS_CONFIG` | const | CSS config with SCSS/Sass/Less support | [`css.ts:8-29`](./css.ts) |
| `HTML_CONFIG` | const | HTML markup configuration | [`html.ts:8-29`](./html.ts) |
| `JSON_CONFIG` | const | JSON config for dependencies and schemas | [`json.ts:8-29`](./json.ts) |
| `XML_CONFIG` | const | XML document configuration | [`xml.ts:8-29`](./xml.ts) |

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
| CSS extensions | `.css`, `.scss`, `.sass`, `.less` |
| JSON scope | `.json` including package.json, tsconfig.json, OpenAPI specs |
| HTML/XML parsing | Element and attribute node type extraction |

## Error Handling

Static configuration data with no runtime error paths. Validation performed by the registry module.

## Known Limitations

- Markup language parsing extracts structure but not semantic meaning.
- JSON config does not validate JSON Schema compliance.

## Exports

- `CSS_CONFIG`
- `HTML_CONFIG`
- `JSON_CONFIG`
- `XML_CONFIG`

## Files

| File | Description |
|------|-------------|
| `index.ts` | Re-exports all markup language configurations |
| `css.ts` | CSS with preprocessor (SCSS, Sass, Less) support |
| `html.ts` | HTML element and attribute configuration |
| `json.ts` | JSON with OpenAPI and npm package support |
| `xml.ts` | XML element and processing instruction configuration |
