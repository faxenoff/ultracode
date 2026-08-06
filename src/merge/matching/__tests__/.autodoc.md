# src/merge/matching/__tests__

## 🤖 Overview

The `fast-path-matcher.test.ts` file contains tests for the `FastPathMatcher` class, which is used to efficiently match code units based on their structural and semantic properties. The `semantic-matcher.test.ts` file, on the other hand, tests the `SemanticMatcher` class, which is designed to match code units based on their semantic meaning and context.

## 🤖 Architecture

```
  +---------------------+
  | FastPathMatcher     |
  +---------------------+
  | - matcher: FastPathMatcher |
  | - units: CodeUnit[]   |
  | - index: VersionedIndex |
  +---------------------+
  | + matchUnits()       |
  | + createUnit()       |
  | + createIndex()      |
  +---------------------+
```

## 🤖 Flow

```
  +---------------------+
  | createUnit()        |
  +---------------------+
  |     |
  |     v
  +---------------------+
  | createIndex()       |
  +---------------------+
  |     |
  |     v
  +---------------------+
  | matchUnits()        |
  +---------------------+
  |     |
  |     v
  +---------------------+
  | return matched units |
  +---------------------+
```

## 🤖 Entity Listing

### Function
- **createDifferentEmbedding** — Generates a Float32Array with different values to a base value `semantic-matcher.test.ts:74-80`
- **createIndex** — Creates a VersionedIndex object with a list of CodeUnits `fast-path-matcher.test.ts:41-84`
- **createIndex** — Creates a VersionedIndex with given CodeUnits `semantic-matcher.test.ts:40-62`
- **createSimilarEmbedding** — Generates a Float32Array with similar values to a base value `semantic-matcher.test.ts:65-71`
- **createUnit** — Creates a CodeUnit object with specified properties `fast-path-matcher.test.ts:15-38`
- **createUnitWithEmbedding** — Creates a CodeUnit with specified embedding and structural hash `semantic-matcher.test.ts:15-37`

### Import_decl
- **../../models/code-unit.js** — Imports `../../models/code-unit.js` from `../../models/code-unit.js`. `fast-path-matcher.test.ts:2-2`, `fast-path-matcher.test.ts:3-3`, `semantic-matcher.test.ts:2-2`, `semantic-matcher.test.ts:3-3`
- **../../models/versioned-index.js** — Imports `../../models/versioned-index.js` from `../../models/versioned-index.js`. `fast-path-matcher.test.ts:4-4`, `semantic-matcher.test.ts:4-4`
- **../fast-path-matcher.js** — Imports `../fast-path-matcher.js` from `../fast-path-matcher.js`. `fast-path-matcher.test.ts:5-5`
- **../semantic-matcher.js** — Imports `../semantic-matcher.js` from `../semantic-matcher.js`. `semantic-matcher.test.ts:5-5`
- **bun:test** — Imports `bun:test` from `bun:test`. `fast-path-matcher.test.ts:1-1`, `semantic-matcher.test.ts:1-1`

## Dependencies

**Internal:**
- `CodeUnit`, `CodeUnitType` — code unit models from ~~`../../models/code-unit.js`~~ (deleted)
- `VersionedIndex` — indexed code structure from ~~`../../models/versioned-index.js`~~ (deleted)
- `FastPathMatcher`, `FastPathMatchLevel` — structural/content matching implementation from ~~`../fast-path-matcher.js`~~ (deleted)
- `SemanticMatcher` — embedding-based matching from ~~`../semantic-matcher.js`~~ (deleted)

**External:**
- `bun:test` — Bun test framework (`describe`, `it`, `beforeEach`, `expect`)
