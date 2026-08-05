# tests/search

## Overview

This test suite validates the code classification, keyword scanning, and trigram extraction components that power semantic code search. It covers three key modules: CodeClassifier (character-level parsing with string/comment awareness), keyword-triage (rapid keyword detection), and trigram-extract (n-gram generation for fuzzy matching). Tests are ported from the Zig reference implementation to ensure parity across search indexing layers.

## Flow

```
Source code bytes
       ↓
   [CodeClassifier]
       ↓
Character classification mask (code vs. non-code)
       ↓
[Keyword Triage / Trigram Extract]
       ↓
Keywords + Trigrams for indexing
```

## Test Cases & Fixtures

### CodeClassifier Tests

- **enc** (code-classifier.test.ts:19-19) — TextEncoder instance for converting strings to byte arrays in test setup.
- **cc** (code-classifier.test.ts:28-28) — CodeClassifier instance for the "skips strings" test case.
- **src** (code-classifier.test.ts:29-29) — Test input bytes containing string literals to verify correct classification.
- **mask** (code-classifier.test.ts:30-30) — Bitmask output from classifyChunk showing which byte positions are code vs. string content.
- **cc** (code-classifier.test.ts:48-48) — CodeClassifier instance for the "skips comments" test case.
- **src** (code-classifier.test.ts:49-49) — Test input bytes containing C-style comments to verify comment skipping.
- **mask** (code-classifier.test.ts:50-50) — Bitmask output verifying comment regions are marked as non-code.
- **cc** (code-classifier.test.ts:65-65) — CodeClassifier instance for the "handles escaped quotes" test case.
- **src** (code-classifier.test.ts:66-66) — Test input bytes with escaped quote sequences within strings.
- **mask** (code-classifier.test.ts:67-67) — Bitmask output verifying escaped quotes don't prematurely close strings.
- **cc** (code-classifier.test.ts:84-84) — CodeClassifier instance for the "handles single quotes" test case.
- **src** (code-classifier.test.ts:85-85) — Test input bytes with single-quoted strings.
- **mask** (code-classifier.test.ts:86-86) — Bitmask output verifying single-quoted string regions are correctly identified.
- **cc** (code-classifier.test.ts:97-97) — CodeClassifier instance for the "handles template literals" test case.
- **src** (code-classifier.test.ts:98-98) — Test input bytes with backtick-delimited template literals.
- **mask** (code-classifier.test.ts:99-99) — Bitmask output verifying template literal content is marked as non-code.
- **cc** (code-classifier.test.ts:108-108) — CodeClassifier instance for multi-chunk processing test.
- **chunk1** (code-classifier.test.ts:110-110) — First chunk of input bytes for multi-chunk state-preservation test.
- **chunk2** (code-classifier.test.ts:111-111) — Second chunk of input bytes for multi-chunk state-preservation test.
- **mask1** (code-classifier.test.ts:113-113) — Classification bitmask for the first chunk.
- **mask2** (code-classifier.test.ts:118-118) — Classification bitmask for the second chunk, verifying state carries across chunks.
- **cc** (code-classifier.test.ts:126-126) — CodeClassifier instance for the "handles single-line comments" test case.
- **src** (code-classifier.test.ts:127-127) — Test input bytes with single-line (// or #) comment syntax.
- **mask** (code-classifier.test.ts:128-128) — Bitmask output verifying single-line comment regions are excluded from code.
- **cc** (code-classifier.test.ts:139-139) — CodeClassifier instance for the "handles regex literals" test case.
- **src** (code-classifier.test.ts:140-140) — Test input bytes with regex pattern literals.
- **mask** (code-classifier.test.ts:141-141) — Bitmask output verifying regex content is marked as non-code.
- **cc** (code-classifier.test.ts:148-148) — CodeClassifier instance for newline counting test.
- **src** (code-classifier.test.ts:153-153) — Test input bytes with embedded newlines in strings and code.
- **mask** (code-classifier.test.ts:154-154) — Bitmask output for newline position verification.

### Keyword Triage Tests

- **src** (code-classifier.test.ts:167-167) — Test input bytes for keyword scanning.
- **bitmap** (code-classifier.test.ts:168-168) — Classification bitmap used to filter non-code regions during keyword triage.
- **bitmap** (code-classifier.test.ts:185-185) — Classification bitmap for multi-line keyword presence test.
- **bitmap** (code-classifier.test.ts:190-190) — Classification bitmap for keyword-in-string exclusion test.

### buildCodeBitmap Tests

- **src** (code-classifier.test.ts:242-242) — Test input bytes for bitmap construction tests.
- **result** (code-classifier.test.ts:243-243) — Bitmap output from buildCodeBitmap for a short code sample.
- **src** (code-classifier.test.ts:249-249) — Test input bytes for empty code bitmap test.
- **result** (code-classifier.test.ts:250-250) — Bitmap output (all zeros) for empty input.
- **src** (code-classifier.test.ts:255-255) — Test input bytes containing only code (no strings).
- **result** (code-classifier.test.ts:256-256) — Bitmap output with all bits set to 1 (all bytes are code).
- **src** (code-classifier.test.ts:265-265) — Test input bytes for whitespace-only sections.
- **result** (code-classifier.test.ts:266-266) — Bitmap output verifying whitespace is classified as code.
- **src** (code-classifier.test.ts:271-271) — Test input bytes for mixed code and string content.
- **result** (code-classifier.test.ts:272-272) — Bitmap output showing alternating code and non-code regions.
- **result** (code-classifier.test.ts:284-284) — Bitmap output for newline-only input (classified as code).
- **src** (code-classifier.test.ts:289-289) — Test input bytes for tab character handling.
- **result** (code-classifier.test.ts:290-290) — Bitmap output confirming tabs are classified as code.
- **src** (code-classifier.test.ts:295-295) — Test input bytes for mixed whitespace types.
- **result** (code-classifier.test.ts:296-296) — Bitmap output verifying all whitespace is code-classified.
- **src** (code-classifier.test.ts:302-302) — Test input bytes for isWordBoundary validation.
- **result** (code-classifier.test.ts:303-303) — Bitmap output for word boundary test.

### Trigram Extraction Tests

- **src** (code-classifier.test.ts:314-314) — Test input bytes for trigram extraction.
- **filtered** (code-classifier.test.ts:315-315) — Trigrams extracted from code-only regions (using bitmap filter).
- **unfiltered** (code-classifier.test.ts:316-316) — Trigrams extracted from entire input (including non-code).
- **trigramStrings** (code-classifier.test.ts:323-328) — Array of expected trigram strings for validation in filtered extraction test.
- **b0** (code-classifier.test.ts:324-324) — First byte of a trigram string in test validation array.
- **b1** (code-classifier.test.ts:325-325) — Second byte of a trigram string in test validation array.
- **b2** (code-classifier.test.ts:326-326) — Third byte of a trigram string in test validation array.
- **src** (code-classifier.test.ts:337-337) — Test input bytes for multi-byte character trigram handling.
- **filtered** (code-classifier.test.ts:338-338) — Trigrams extracted from multi-byte character input with filtering.
- **trigramStrings** (code-classifier.test.ts:340-345) — Array of expected trigrams for multi-byte input validation.
- **b0** (code-classifier.test.ts:341-341) — First byte of trigram in multi-byte test validation.
- **b1** (code-classifier.test.ts:342-342) — Second byte of trigram in multi-byte test validation.
- **b2** (code-classifier.test.ts:343-343) — Third byte of trigram in multi-byte test validation.
- **result** (code-classifier.test.ts:354-354) — Trigram extraction result for edge case validation.
- **src** (code-classifier.test.ts:359-359) — Test input bytes for newline handling in trigram extraction.
- **filtered** (code-classifier.test.ts:360-360) — Trigrams extracted from input with newlines and bitmap filtering.
- **unfiltered** (code-classifier.test.ts:361-361) — Trigrams extracted without bitmap filtering for comparison.

### Utility Test Variables

- **s** (code-classifier.test.ts:218-218) — String buffer used in newline counting validation loops.
- **i** (code-classifier.test.ts:219-219) — Loop index counter in newline counting iteration.

## Dependencies

**Tested modules:**
- ~~`src/search/code-classifier.js`~~ (deleted) — Character classification with string/comment awareness
- ~~`src/search/keyword-triage.js`~~ (deleted) — Keyword detection in code regions
- ~~`src/search/trigram-extract.js`~~ (deleted) — N-gram generation for fuzzy matching

**Test framework:**
- `bun:test` — Test runner and assertion library