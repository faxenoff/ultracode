# I18n

## 🤖 Overview

The `i18n` module provides language detection and localization utilities for the AutoDoc system. It is used by developers and maintainers to ensure consistent internationalization across different language versions of the documentation.

## 🤖 Architecture

```
language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language
```

## 🤖 Flow

```
language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language-detector.ts
    |
    v
    language-detector.ts
```

## 🤖 Entity Listing

### Function
- **aggregateLanguageDetection** — Aggregates language detection results `language-detector.ts:199-244`
- **classifyChar** — Fast character classification using charCodeAt (no regex overhead) `language-detector.ts:37-65`
- **detectLanguageFromCode** — Detects documentation language based on non-Latin characters in code `language-detector.ts:160-194`
- **detectLanguageFromComments** — Detects documentation language based on non-Latin characters in comments `language-detector.ts:150-154`
- **detectLanguageFromText** — Detects documentation language based on non-Latin characters in comments `language-detector.ts:88-145`
- **findSectionKey** — Finds the key corresponding to the given localized section name `section-names.ts:209-221`
- **getAllSectionNames** — Returns a record of all section names in the specified language `section-names.ts:202-204`
- **getDocTypeName** — Returns the document type name based on the provided type and language `section-names.ts:195-197`
- **getPlaceholder** — Returns the placeholder for the given key in the specified language `section-names.ts:256-258`
- **getSectionName** — Returns the localized section name for a given language and section key `section-names.ts:188-190`

### Interface
- **LanguageDetectionResult** — Result of language detection `language-detector.ts:70-82`

### Import_decl
- **../types.js** — Imports `../types.js` from `../types.js`. `language-detector.ts:12-12`, `section-names.ts:12-12`

### Property
- **charCounts** — Character counts by script `language-detector.ts:76-81`
- **chinese** — CJK Unified Ideographs and CJK Extension A `language-detector.ts:78-78`
- **confidence** — Confidence score (0-1) `language-detector.ts:74-74`
- **language** — Detected language code `language-detector.ts:72-72`
- **latin** — Latin characters `language-detector.ts:79-79`
- **other** — Other characters `language-detector.ts:80-80`
- **russian** — Cyrillic characters (Russian) `language-detector.ts:77-77`

## Data Flow

- **Inputs**: Raw text strings, code file content with extension, or arrays of detection results for aggregation.
- **Processing**: Character-by-character classification counts script types (Russian/Chinese/Latin), computes ratios against total, and applies thresholds (>30% for single text, >10% for AUTODOC.md analysis) to determine language.
- **Outputs**: `LanguageDetectionResult` with language code, confidence score, and character counts; localized strings from lookup tables.

## Public API

| Export | Type | Description | Location |
|--------|------|-------------|----------|
| `detectLanguageFromText` | function | Detects language from a text string using charCodeAt classification | [`language-detector.ts:88-145`](./language-detector.ts) |
| `detectLanguageFromComments` | function | Detects language from an array of code comments | [`language-detector.ts:150-154`](./language-detector.ts) |
| `detectLanguageFromCode` | function | Extracts comments from code and detects their language | [`language-detector.ts:160-194`](./language-detector.ts) |
| `aggregateLanguageDetection` | function | Aggregates detection results from multiple files | [`language-detector.ts:199-244`](./language-detector.ts) |
| `LanguageDetectionResult` | interface | Result with language, confidence, and charCounts | [`language-detector.ts:70-82`](./language-detector.ts) |
| `SECTION_NAMES` | const | Record of section name translations (en/ru/zh) | [`section-names.ts:17-144`](./section-names.ts) |
| `DOC_TYPE_NAMES` | const | Record of document type name translations (en/ru/zh) | [`section-names.ts:149-183`](./section-names.ts) |
| `TEMPLATE_PLACEHOLDERS` | const | Record of template placeholder translations (en/ru/zh) | [`section-names.ts:226-226`](./section-names.ts) |
| `getSectionName` | function | Gets localized section name by key and language | [`section-names.ts:188-190`](./section-names.ts) |
| `getDocTypeName` | function | Gets localized document type name | [`section-names.ts:195-197`](./section-names.ts) |
| `getAllSectionNames` | function | Gets all section names for a language (merged with en fallback) | [`section-names.ts:202-204`](./section-names.ts) |
| `findSectionKey` | function | Reverse lookup: finds section key from localized name | [`section-names.ts:209-221`](./section-names.ts) |
| `getPlaceholder` | function | Gets localized template placeholder text | [`section-names.ts:256-258`](./section-names.ts) |

## Dependencies

### Internal Modules

| Module | Purpose |
|--------|---------|
| `autodoc/types` | `DocLanguage` and `DocEntityType` type definitions |

### External Packages

| Package | Purpose |
|---------|---------|
| (none) | Pure TypeScript with no external dependencies |

## Behavioral Properties

| Property | Value |
|----------|-------|
| Supported languages | English (en), Russian (ru), Chinese (zh) |
| Detection threshold (single text) | >30% non-Latin character ratio |
| Detection method | charCodeAt Unicode range classification (~3x faster than regex) |

## Error Handling

Language detection returns `"en"` with zero confidence when input has no classifiable characters. Code comment extraction silently returns empty results for unrecognized file extensions. Section name lookups fall back to English when a key is missing in the requested language.

## Known Limitations

- Only three languages are supported; adding new languages requires extending both the detector Unicode ranges and all translation tables.
- Language detection is script-based, not NLP-based, so it cannot distinguish between languages sharing the same script (e.g., Ukrainian vs Russian Cyrillic).
- Python docstrings and comments are handled, but other language-specific comment syntaxes (e.g., Ruby `#`, Lua `--`) are not extracted.

## Files

| File | Description |
|------|-------------|
| [`language-detector.ts`](./language-detector.ts) | Fast Unicode-based language detection from text, comments, and code files |
| [`section-names.ts`](./section-names.ts) | Localized section titles, document type names, and template placeholders for en/ru/zh |
| [`index.ts`](./index.ts) | Module barrel file re-exporting language-detector and section-names |
