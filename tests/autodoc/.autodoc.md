# Module: tests/autodoc

## 🤖 Overview

This module contains test cases for the AutoDoc File Sync functionality, which identifies and reads markdown files from a directory. It is used by developers to ensure the correctness of file synchronization logic.

## 🤖 Architecture

```
  +-------------------+
  | findMarkdownFiles |
  +-------------------+
          |
          v
  +-------------------+
  | readDocumentFromDisk |
  +-------------------+
          |
          v
  +-------------------+
  | writeDocumentToDisk |
  +-------------------+
```

## 🤖 Flow

```
  +-------------------+
  | findMarkdownFiles |
  +-------------------+
          |
          v
  +-------------------+
  | readDocumentFromDisk |
  +-------------------+
          |
          v
  +-------------------+
  | writeDocumentToDisk |
  +-------------------+
```

## 🤖 Entity Listing

### Function
- **detailsSection** — Represents a detailed section within a markdown document `md-parser.test.ts:119-119`
- **falseResolver** — Not present in the provided code `link-extractor.test.ts:126-126`
- **mockResolver** — Not present in the provided code `link-extractor.test.ts:94-94`
- **titles** — Extracts section titles from parsed markdown content `md-parser.test.ts:45-45`

### Import_decl
- **../../src/autodoc/i18n/language-detector.js** — Imports `../../src/autodoc/i18n/language-detector.js`. `language-detector.test.ts:2-7`
- **../../src/autodoc/parser/link-extractor.js** — Imports `../../src/autodoc/parser/link-extractor.js`. `link-extractor.test.ts:2-12`
- **../../src/autodoc/parser/md-parser.js** — Imports `../../src/autodoc/parser/md-parser.js`. `md-parser.test.ts:2-10`
- **../../src/autodoc/sync/file-sync.js** — Imports `../../src/autodoc/sync/file-sync.js` from `../../src/autodoc/sync/file-sync.js`. `file-sync.test.ts:8-8`
- **bun:test** — Imports `bun:test` from `bun:test`. `file-sync.test.ts:5-5`, `language-detector.test.ts:1-1`, `link-extractor.test.ts:1-1`, `md-parser.test.ts:1-1`
- **node:fs/promises** — Imports `node:fs/promises` from `node:fs/promises`. `file-sync.test.ts:6-6`
- **node:path** — Imports `node:path` from `node:path`. `file-sync.test.ts:7-7`

## Test Suites

### File Synchronization Tests

Tests for file system scanning and synchronization logic that discovers source files and detects changes.

- **beforeEach** — `file-sync.test.ts:12-121` — Setup and teardown hook initializing test directory structure with various file hierarchies.
- **mkdir** — `file-sync.test.ts:13-15` — Creates temporary test directory.
- **rm** — `file-sync.test.ts:17-19` — Removes temporary test directory after tests complete.
- **it** — `file-sync.test.ts:21-76` — Test suite for basic file discovery and filtering.
- **Create** — `file-sync.test.ts:22-32` — Creates flat file structure containing regular, hidden, and node_modules files.
- **f** — `file-sync.test.ts:31-31` — File variable used in create test scenario.
- **subDir** — `file-sync.test.ts:34-43` — Creates nested subdirectory structure to test recursive discovery.
- **deep** — `file-sync.test.ts:45-57` — Creates deeply nested directory tree to validate deep path handling.
- **hidden** — `file-sync.test.ts:59-66` — Creates files prefixed with dot to test hidden file filtering.
- **nm** — `file-sync.test.ts:68-75` — Creates node_modules directory to test dependency exclusion.
- **it** — `file-sync.test.ts:78-100` — Test suite for file content reading and retrieval.
- **filePath** — `file-sync.test.ts:79-88` — First file path scenario for content verification.
- **filePath** — `file-sync.test.ts:90-99` — Second file path scenario with different content.
- **it** — `file-sync.test.ts:102-120` — Test suite for change detection and incremental updates.
- **result** — `file-sync.test.ts:103-106` — Initial file scan result variable.
- **filePath** — `file-sync.test.ts:108-119` — File path used in change detection scenario.

### Language Detection Tests

Tests for identifying programming languages from file content and applying language-specific parsing logic.

- **describe** — `language-detector.test.ts:9-106` — Test suite for language detection functionality.
- **it** — `language-detector.test.ts:10-38` — Test suite for detecting languages from code patterns.
- **result** — `language-detector.test.ts:11-15` — Detection result for first language sample.
- **result** — `language-detector.test.ts:17-21` — Detection result for second language sample.
- **result** — `language-detector.test.ts:23-27` — Detection result for third language sample.
- **result** — `language-detector.test.ts:29-32` — Detection result for fourth language sample.
- **result** — `language-detector.test.ts:34-37` — Detection result for fifth language sample.
- **it** — `language-detector.test.ts:40-51` — Test suite for comment-based language hints.
- **comments** — `language-detector.test.ts:41-45` — Code with explicit language comment directives.
- **result** — `language-detector.test.ts:47-50` — Detection result when comments override heuristics.
- **it** — `language-detector.test.ts:53-86` — Test suite for multi-block detection with mixed languages.
- **code** — `language-detector.test.ts:54-65` — First code block in multi-language sample.
- **code** — `language-detector.test.ts:67-79` — Second code block in multi-language sample.
- **code** — `language-detector.test.ts:81-85` — Third code block in multi-language sample.
- **it** — `language-detector.test.ts:88-105` — Test suite for language aggregation and confidence scoring.
- **results** — `language-detector.test.ts:89-99` — Array of detection results for aggregation.
- **aggregated** — `language-detector.test.ts:101-104` — Final aggregated language confidence scores.

### Link Extraction Tests

Tests for extracting and resolving documentation links from markdown content, including reference resolution and validation.

- **describe** — `link-extractor.test.ts:14-198` — Test suite for markdown link extraction and resolution.
- **it** — `link-extractor.test.ts:15-52` — Test suite for inline link extraction from markdown.
- **markdown** — `link-extractor.test.ts:16-27` — First markdown document with inline links.
- **markdown** — `link-extractor.test.ts:29-37` — Second markdown document with reference-style links.
- **markdown** — `link-extractor.test.ts:39-45` — Third markdown document with mixed link styles.
- **markdown** — `link-extractor.test.ts:47-51` — Fourth markdown document testing edge cases.
- **it** — `link-extractor.test.ts:54-66` — Test suite for resolving relative path references.
- **ref** — `link-extractor.test.ts:55-60` — First relative reference structure.
- **ref** — `link-extractor.test.ts:62-65` — Second relative reference structure.
- **it** — `link-extractor.test.ts:68-75` — Test suite for absolute path reference resolution.
- **ref** — `link-extractor.test.ts:69-74` — Absolute path reference structure.
- **it** — `link-extractor.test.ts:77-90` — Test suite for external URL validation.
- **ref** — `link-extractor.test.ts:78-83` — External URL reference structure.
- **ref** — `link-extractor.test.ts:85-89` — Alternative external URL reference.
- **Mock** — `link-extractor.test.ts:92-139` — Mock resolver for testing link validation with custom rules.
- **true** — `link-extractor.test.ts:94-94` — Validation result indicating link validity.
- **ref** — `link-extractor.test.ts:97-109` — First reference using mock resolver.
- **ref** — `link-extractor.test.ts:111-123` — Second reference using mock resolver.
- **falseResolver** — `link-extractor.test.ts:125-138` — Mock resolver configured to reject links.
- **false** — `link-extractor.test.ts:126-126` — Validation result indicating link invalidity.
- **it** — `link-extractor.test.ts:141-172` — Test suite for code block link extraction.
- **comment** — `link-extractor.test.ts:142-151` — First code comment containing links.
- **comment** — `link-extractor.test.ts:153-161` — Second code comment with documentation references.
- **comment** — `link-extractor.test.ts:163-171` — Third code comment testing language-specific formats.
- **it** — `link-extractor.test.ts:174-180` — Test suite for documentation block extraction.
- **comment** — `link-extractor.test.ts:175-179` — Documentation block with structured links.
- **it** — `link-extractor.test.ts:182-188` — Test suite for broken link detection.
- **comment** — `link-extractor.test.ts:183-187` — Documentation with intentionally broken reference.
- **it** — `link-extractor.test.ts:190-197` — Test suite for circular reference detection.
- **comment** — `link-extractor.test.ts:191-196` — Documentation with self-referential link.

### Markdown Parsing Tests

Tests for parsing markdown document structure, extracting headings, code blocks, and semantic sections.

- **sampleMarkdown** — `md-parser.test.ts:12-138` — Large markdown document fixture with multiple sections and code blocks.
- **it** — `md-parser.test.ts:34-57` — Test suite for heading extraction and hierarchy.
- **result** — `md-parser.test.ts:35-40` — Parsed heading structure from first markdown segment.
- **result** — `md-parser.test.ts:42-50` — Parsed heading hierarchy validation.
- **s** — `md-parser.test.ts:45-45` — String variable used in heading validation.
- **result** — `md-parser.test.ts:52-56` — Final heading extraction result.
- **it** — `md-parser.test.ts:59-67` — Test suite for code block extraction.
- **result** — `md-parser.test.ts:60-66` — Extracted code blocks with language identification.
- **it** — `md-parser.test.ts:69-84` — Test suite for list parsing and nesting.
- **result** — `md-parser.test.ts:70-76` — Parsed list structure with items.
- **result** — `md-parser.test.ts:78-83` — Nested list validation results.
- **it** — `md-parser.test.ts:86-101` — Test suite for table parsing.
- **result** — `md-parser.test.ts:87-93` — Extracted table rows and columns.
- **result** — `md-parser.test.ts:95-100` — Table cell content validation.
- **it** — `md-parser.test.ts:103-113` — Test suite for emphasis and formatting detection.
- **title** — `md-parser.test.ts:104-107` — Bold text extraction and validation.
- **title** — `md-parser.test.ts:109-112` — Italic text extraction and validation.
- **it** — `md-parser.test.ts:115-126` — Test suite for blockquote extraction.
- **result** — `md-parser.test.ts:116-125` — Extracted blockquote content and nesting levels.
- **s** — `md-parser.test.ts:119-119` — String variable for blockquote validation.
- **it** — `md-parser.test.ts:128-137` — Test suite for horizontal rule detection.
- **result** — `md-parser.test.ts:129-136` — Detected rule positions and content separation.

### Test Variables

Shared test fixtures and state management across test suites.

- **TEST_DIR** — `file-sync.test.ts:10-10` — Temporary directory path for file synchronization tests.
- **files** — `file-sync.test.ts:28-28` — Array of files created in flat structure test.
- **subDir** — `file-sync.test.ts:35-35` — Subdirectory path in recursive discovery test.
- **files** — `file-sync.test.ts:40-40` — Array of files in subdirectory.
- **deep** — `file-sync.test.ts:46-46` — Deep path variable for nested structure testing.
- **files** — `file-sync.test.ts:51-51` — Array of deeply nested files.
- **files2** — `file-sync.test.ts:55-55` — Additional file array for change detection.
- **hidden** — `file-sync.test.ts:60-60` — Path to hidden files directory.
- **files** — `file-sync.test.ts:64-64` — Array of hidden files.
- **nm** — `file-sync.test.ts:69-69` — Path to node_modules directory.
- **files** — `file-sync.test.ts:73-73` — Files in node_modules (should be excluded).
- **filePath** — `file-sync.test.ts:80-80` — Path to test file for content reading.
- **content** — `file-sync.test.ts:81-81` — Content written to test file.
- **result** — `file-sync.test.ts:85-85` — Result from file content retrieval operation.
- **filePath** — `file-sync.test.ts:91-91` — Second test file path.
- **content** — `file-sync.test.ts:92-92` — Content for second test file.
- **result** — `file-sync.test.ts:96-96` — Result from second content retrieval.
- **result** — `file-sync.test.ts:104-104` — Result from initial file scan.
- **filePath** — `file-sync.test.ts:109-109` — File path in change detection test.
- **content** — `file-sync.test.ts:110-110` — New content for modified file.
- **result** — `file-sync.test.ts:113-113` — Change detection result.
- **result** — `language-detector.test.ts:12-12` — Detection result for language sample one.
- **result** — `language-detector.test.ts:18-18` — Detection result for language sample two.
- **result** — `language-detector.test.ts:24-24` — Detection result for language sample three.
- **result** — `language-detector.test.ts:30-30` — Detection result for language sample four.
- **result** — `language-detector.test.ts:35-35` — Detection result for language sample five.
- **comments** — `language-detector.test.ts:42-42` — String containing code with comment hints.
- **result** — `language-detector.test.ts:43-43` — Detection result with comment-based identification.
- **result** — `language-detector.test.ts:48-48` — Validation of comment-based detection.
- **code** — `language-detector.test.ts:55-62` — First code block in multi-language test.
- **result** — `language-detector.test.ts:63-63` — Detection result for first block.
- **code** — `language-detector.test.ts:68-76` — Second code block in multi-language test.
- **result** — `language-detector.test.ts:77-77` — Detection result for second block.
- **code** — `language-detector.test.ts:82-82` — Third code block in multi-language test.
- **result** — `language-detector.test.ts:83-83` — Detection result for third block.
- **results** — `language-detector.test.ts:90-94` — Array of detection results for aggregation.
- **aggregated** — `language-detector.test.ts:95-95` — Initial aggregation variable.
- **aggregated** — `language-detector.test.ts:102-102` — Final aggregated confidence scores.
- **markdown** — `link-extractor.test.ts:17-22` — First markdown document fixture.
- **refs** — `link-extractor.test.ts:23-23` — Extracted references from first markdown.
- **markdown** — `link-extractor.test.ts:30-32` — Second markdown document fixture.
- **refs** — `link-extractor.test.ts:33-33` — Extracted references from second markdown.
- **markdown** — `link-extractor.test.ts:40-42` — Third markdown document fixture.
- **refs** — `link-extractor.test.ts:43-43` — Extracted references from third markdown.
- **markdown** — `link-extractor.test.ts:48-48` — Fourth markdown document fixture.
- **refs** — `link-extractor.test.ts:49-49` — Extracted references from fourth markdown.
- **ref** — `link-extractor.test.ts:56-56` — Single reference from relative path test.
- **ref** — `link-extractor.test.ts:63-63` — Reference from second relative path test.
- **ref** — `link-extractor.test.ts:70-70` — Reference in absolute path test.
- **ref** — `link-extractor.test.ts:79-79` — External URL reference.
- **ref** — `link-extractor.test.ts:86-86` — Alternative external URL reference.
- **mockResolver** — `link-extractor.test.ts:94-94` — Mock resolver returning validation success.
- **RefTargetType** — `link-extractor.test.ts:95-95` — Type enumeration for reference targets.
- **{ RefTargetType }** — `link-extractor.test.ts:95-95` — Type import statement.
- **ref** — `link-extractor.test.ts:97-109` — First reference validated by mock resolver.
- **ref** — `link-extractor.test.ts:111-123` — Second reference validated by mock resolver.
- **falseResolver** — `link-extractor.test.ts:125-138` — Mock resolver configured to reject validation.
