---
module_name: parser
description: "Markdown parsing, reference extraction, and document structure manipulation"
status: active
language: typescript
---

# Parser

> Parses markdown documents into hierarchical section trees, extracts and validates typed references (code, entity, doc, commit), and provides utilities for generating reference syntax and manipulating document structure.

## Overview

The parser module is the markdown processing backbone of AutoDoc. The link extractor handles five reference types (line-range, entity, commit, doc, external URL) with generation and validation functions plus comment reference extraction (`@see`, `@flow`). The markdown parser converts documents into `ParsedDocument` structures with nested `ParsedSection` trees, supporting section lookup by ID/title, content updates, section insertion, and full markdown regeneration. Together they enable the incremental updater and storage modules to track and maintain documentation references.

## Data Flow

- **Inputs**: Raw markdown content strings and source file paths for context.
- **Processing**: Link extractor scans lines for markdown link syntax `[text](target)`, classifies targets by regex patterns (entity, commit, line-range, doc, external), and returns typed `ParsedReference` arrays. Markdown parser splits content by headings, builds a section hierarchy stack, and invokes link extraction per section.
- **Outputs**: `ParsedDocument` with title, nested `ParsedSection[]`, and aggregated `allRefs`; individual reference objects for validation; regenerated markdown strings after section updates.

## Public API

| Export | Type | Description | Location |
|--------|------|-------------|----------|
| `extractReferences` | function | Extracts all typed references from markdown content | [`link-extractor.ts:61-84`](./link-extractor.ts) |
| `generateCodeRef` | function | Generates `[-> file:line]` markdown link for code references | [`link-extractor.ts:231-239`](./link-extractor.ts) |
| `generateEntityRef` | function | Generates `[-> entity:ID]` markdown link for entity references | [`link-extractor.ts:241-376`](./link-extractor.ts) |
| `generateDocRef` | function | Generates `[-> doc]` markdown link for doc-to-doc references | [`link-extractor.ts:252-256`](./link-extractor.ts) |
| `validateReference` | function | Validates a parsed reference against a target resolver | [`link-extractor.ts:59-295`](./link-extractor.ts) |
| `updateLineNumbers` | function | Adjusts line numbers in reference syntax by a delta | [`link-extractor.ts:285-294`](./link-extractor.ts) |
| `extractCommentRefs` | function | Extracts @see doc/entity refs and @flow tags from code comments | [`link-extractor.ts:317-321`](./link-extractor.ts) |
| `generateSeeDocComment` | function | Generates `@see docs://path` comment syntax | [`link-extractor.ts:374-374`](./link-extractor.ts) |
| `generateSeeEntityComment` | function | Generates `@see entity:ID` comment syntax | [`link-extractor.ts:381-383`](./link-extractor.ts) |
| `generateFlowComment` | function | Generates `@flow tag1, tag2` comment syntax | [`link-extractor.ts:388-390`](./link-extractor.ts) |
| `parseMarkdown` | function | Parses markdown content into a structured ParsedDocument | [`md-parser.ts:29-127`](./md-parser.ts) |
| `flattenSections` | function | Converts nested section tree into a flat array | [`md-parser.ts:132-146`](./md-parser.ts) |
| `findSectionById` | function | Finds a section by slug ID in nested tree | [`md-parser.ts:152-163`](./md-parser.ts) |
| `findSectionByTitle` | function | Finds a section by title (case-insensitive) | [`md-parser.ts:168-181`](./md-parser.ts) |
| `updateSectionContent` | function | Replaces content of a section by title in raw markdown | [`md-parser.ts:186-233`](./md-parser.ts) |
| `insertSectionAfter` | function | Inserts a new section after a specified section | [`md-parser.ts:238-292`](./md-parser.ts) |
| `generateMarkdown` | function | Regenerates markdown string from a ParsedDocument | [`md-parser.ts:296-328`](./md-parser.ts) |
| `extractTitle` | function | Extracts the first H1 title from markdown content | [`md-parser.ts:349-361`](./md-parser.ts) |
| `getSectionPath` | function | Gets breadcrumb path to a section by ID | [`md-parser.ts:365-388`](./md-parser.ts) |

## Dependencies

### Internal Modules

| Module | Purpose |
|--------|---------|
| `autodoc/types` | `ParsedReference`, `ParsedDocument`, `ParsedSection`, `RefTargetType` type definitions |

### External Packages

| Package | Purpose |
|---------|---------|
| (none) | Pure TypeScript with no external dependencies |

## Behavioral Properties

| Property | Value |
|----------|-------|
| Reference types supported | LINE_RANGE, ENTITY, DOC, COMMIT (external URLs skipped) |
| Section hierarchy | Tracks heading levels 1-6 with parent-child nesting |
| Slug generation | Supports Cyrillic characters for Russian section IDs |

## Error Handling

The parser is tolerant of malformed markdown: missing headings result in "Untitled" documents, unclosed sections are flushed at EOF, and reference extraction silently skips unparseable links. Section update functions preserve all content outside the target section.

## Known Limitations

- Reference extraction uses regex rather than a full markdown AST parser, so references inside code blocks or HTML comments may be incorrectly matched.
- `updateSectionContent` replaces all content between the target heading and the next heading at the same or higher level, which may not handle deeply nested subsections as expected.
- The slugify function does not handle all Unicode scripts beyond Latin and Cyrillic.

## Exports

- `extractCommentRefs`
- `extractReferences`
- `generateCodeRef`
- `generateDocRef`
- `generateEntityRef`
- `generateFlowComment`
- `generateSeeDocComment`
- `generateSeeEntityComment`
- `updateLineNumbers`
- `validateReference`
- `extractTitle`
- `findSectionById`
- `findSectionByTitle`
- `flattenSections`
- `generateMarkdown`
- `getSectionPath`
- `insertSectionAfter`
- `parseMarkdown`
- `updateSectionContent`

## Files

| File | Description |
|------|-------------|
| [`link-extractor.ts`](./link-extractor.ts) | Reference extraction, generation, validation, line-number updates, and comment ref parsing |
| [`md-parser.ts`](./md-parser.ts) | Markdown-to-structure parser, section manipulation (find, update, insert), and markdown regeneration |
| [`index.ts`](./index.ts) | Module barrel file re-exporting link-extractor and md-parser |
