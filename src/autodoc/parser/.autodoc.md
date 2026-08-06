# Parser

## 🤖 Overview

The `autodoc/parser` module is designed for parsing and extracting references from Markdown documents. It provides a set of functions for generating code and documentation references, validating references, and manipulating Markdown content. This module is used by developers and documentation authors to maintain and update reference links within their Markdown files.

## 🤖 Architecture

```
  +---------------------+
  |     link-extractor  |
  +---------------------+
  |     md-parser       |
  +---------------------+
  |     index.ts        |
  +---------------------+
```

## 🤖 Flow

```
  +---------------------+
  |     index.ts        |
  +---------------------+
  |     extractCommentRefs |
  |     extractReferences |
  |     generateCodeRef |
  |     generateDocRef |
  |     generateEntityRef |
  |     generateFlowComment |
  |     generateSeeDocComment |
  |     generateSeeEntityComment |
  |     updateLineNumbers |
  |     validateReference |
  +---------------------+
  |     extractTitle |
  |     findSectionById |
  |     findSectionByTitle |
  |     flattenSections |
  |     generateMarkdown |
  |     getSectionPath |
  |     insertSectionAfter |
  |     parseMarkdown |
  |     updateSectionContent |
  +---------------------+
```

## 🤖 Entity Listing

### Function
- **addSection** — Adds a new section to the document, maintaining hierarchy `md-parser.ts:59-74`
- **extractCommentRefs** — Extracts comment references `link-extractor.ts:320-372`
- **extractReferences** — Extracts all references from markdown content `link-extractor.ts:61-84`
- **extractTitle** — Extracts the title from a markdown content string `md-parser.ts:349-361`
- **findAllLinks** — Finds all markdown links in a given line `link-extractor.ts:89-120`
- **findSectionById** — Searches for a section by its ID in a nested list of sections `md-parser.ts:152-163`
- **findSectionByTitle** — Searches for a section by its title in a nested list of sections `md-parser.ts:168-181`
- **flattenSections** — Recursively flattens a nested list of sections into a single-level list `md-parser.ts:133-147`
- **flushContent** — Flushes content buffer to a section if it's not empty `md-parser.ts:46-57`
- **generateCodeRef** — Generates a code reference `link-extractor.ts:231-239`
- **generateDocRef** — Generates a doc reference `link-extractor.ts:252-256`
- **generateEntityRef** — Generates an entity reference `link-extractor.ts:244-247`
- **generateFlowComment** — Not present in the provided code `link-extractor.ts:391-393`
- **generateMarkdown** — Generates a markdown string from a parsed document `md-parser.ts:297-329`
- **generateSeeDocComment** — Not present in the provided code `link-extractor.ts:377-379`
- **generateSeeEntityComment** — Not present in the provided code `link-extractor.ts:384-386`
- **getSectionPath** — Retrieves the path to a section by its ID in a nested list of sections `md-parser.ts:366-389`
- **hasTitle** — Checks if the document has a title section `md-parser.ts:318-318`
- **insertSectionAfter** — Inserts a new section after a specified section in a markdown document `md-parser.ts:238-292`
- **parseMarkdown** — Parses a markdown document into structured sections with hierarchy `md-parser.ts:30-128`
- **parseReference** — Parses a reference from its text and target `link-extractor.ts:125-222`
- **renderSection** — Renders a section and its children into a markdown string `md-parser.ts:300-315`
- **slugify** — Converts a string to a slug by normalizing and replacing characters `md-parser.ts:338-344`
- **tags** — Regex patterns for different reference types `link-extractor.ts:349-349`
- **tags** — Maps each tag to its trimmed version `link-extractor.ts:361-361`
- **traverse** — Recursively traverses a list of sections, pushing each section to the result array `md-parser.ts:136-143`
- **traverse** — Recursively searches for a section with a specific ID in a list of parsed sections, updating the path as it goes `md-parser.ts:369-385`
- **updateLineNumbers** — Updates line numbers for references `link-extractor.ts:285-294`
- **updateSectionContent** — Updates the content of a section in a markdown document `md-parser.ts:186-233`
- **validateReference** — Validates a reference `link-extractor.ts:265-280`

### Import_decl
- **../types.js** — Imports `../types.js` from `../types.js`. `link-extractor.ts:21-21`, `link-extractor.ts:22-22`, `md-parser.ts:13-13`
- **./link-extractor.js** — Imports `./link-extractor.js` from `./link-extractor.js`. `md-parser.ts:14-14`
- **node:path** — Imports `node:path` from `node:path`. `link-extractor.ts:20-20`, `md-parser.ts:12-12`

### Property
- **column** — Represents the column number of a reference `link-extractor.ts:93-93`
- **column** — Stores the column number of the link `link-extractor.ts:99-99`
- **docRefs** — Stores doc references `link-extractor.ts:321-321`
- **entityRefs** — Stores entity references `link-extractor.ts:322-322`
- **error** — Indicates whether a reference is invalid `link-extractor.ts:268-268`
- **flowTags** — Represents flow tags `link-extractor.ts:323-323`
- **syntax** — Represents the syntax of a reference `link-extractor.ts:90-90`
- **syntax** — Stores the syntax of the link `link-extractor.ts:96-96`
- **target** — Represents the target URL of a reference `link-extractor.ts:92-92`
- **target** — Stores the target URL of the link `link-extractor.ts:98-98`
- **text** — Represents the text of a reference `link-extractor.ts:91-91`
- **text** — Stores the text of the link `link-extractor.ts:97-97`
- **valid** — Indicates whether a reference is valid `link-extractor.ts:268-268`

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
