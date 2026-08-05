# src/merge/__tests__

## 🤖 Overview

The `ai-conflict-resolver.test.ts` file contains tests for the `AIConflictResolver` class, which resolves conflicts between code units based on semantic similarity. This module is used by developers to ensure code consistency and correctness during merges. The `conflict-detector.test.ts` and `conflict-resolver.test.ts` files also test related components for detecting and resolving conflicts, respectively.

## 🤖 Architecture

```
  +-------------------+
  | AIConflictResolver |
  +-------------------+
  | - embeddingGenerator |
  | - conflictDetector |
  | - conflictResolver |
  +-------------------+
  | + resolveConflict() |
  +-------------------+
```

## 🤖 Flow

```
  +-------------------+
  |  CodeUnit A       |
  +-------------------+
  |  CodeUnit B       |
  +-------------------+
  |  +-----------------+
  |  |  Compare       |
  |  |  +-------------+
  |  |  |  Semantic   |
  |  |  |  +----------+
  |  |  |  |  Conflict |
  |  |  |  +----------+
  |  |  +-------------+
  |  +-----------------+
  |  +-----------------+
  |  |  Resolve       |
  |  |  +-------------+
  |  |  |  Conflict   |
  |  |  |  +----------+
  |  |  |  |  Strategy |
  |  |  |  +----------+
  |  |  +-------------+
  |  +-----------------+
  |  +-----------------+
  |  |  Apply         |
  |  |  +-------------+
  |  |  |  Resolution |
  |  |  |  +----------+
  |  |  |  |  Strategy |
  |  |  |  +----------+
  |  |  +-------------+
  |  +-----------------+
  |  +-----------------+
  |  |  Output        |
  |  |  +-------------+
  |  |  |  Merged     |
  |  |  |  CodeUnits  |
  |  |  +-------------+
  |  +-----------------+
```

## 🤖 Entity Listing

### Function
- **createCodeUnit** — Creates a mock code unit for testing `ai-conflict-resolver.test.ts:50-65`
- **createCodeUnit** — Creates a test code unit with specified overrides `conflict-detector.test.ts:11-27`, `conflict-resolver.test.ts:20-35`, `intent-classifier.test.ts:9-24`
- **createConflict** — Creates a mock semantic conflict for testing `ai-conflict-resolver.test.ts:67-78`
- **createConflict** — Creates a test semantic conflict with specified overrides `conflict-resolver.test.ts:44-55`
- **createIntent** — Creates a test change intent with a given type `conflict-detector.test.ts:29-34`, `conflict-resolver.test.ts:37-42`
- **norm** — Normalizes the embedding vector `ai-conflict-resolver.test.ts:32-32`
- **prefix** — Creates a string of 100 lines prefixed with "prefix-line-" `diff3.test.ts:134-134`
- **suffix** — Creates a string of 100 lines suffixed with "suffix-line-" `diff3.test.ts:135-135`
- **types** — Extracts the types from the result's regions `diff3.test.ts:179-179`

### Method
- **generateEmbedding** — Generates a deterministic embedding for a given text `ai-conflict-resolver.test.ts:13-43`
- **initialize** — Initializes the MockEmbeddingGenerator `ai-conflict-resolver.test.ts:45-45`
- **setBatchSize** — Sets the batch size for the MockEmbeddingGenerator `ai-conflict-resolver.test.ts:46-46`

### Class
- **MockEmbeddingGenerator** — A mock class for generating embeddings based on text content `ai-conflict-resolver.test.ts:12-47`

### Import_decl
- **../../utils/fast-hash.js** — Imports `../../utils/fast-hash.js` from `../../utils/fast-hash.js`. `conflict-resolver.test.ts:2-2`
- **../analysis/conflict-detector.js** — Imports `../analysis/conflict-detector.js` from `../analysis/conflict-detector.js`. `conflict-detector.test.ts:2-2`
- **../analysis/intent-classifier.js** — Imports `../analysis/intent-classifier.js` from `../analysis/intent-classifier.js`. `intent-classifier.test.ts:2-2`
- **../engine/ai-conflict-resolver.js** — Imports `../engine/ai-conflict-resolver.js` from `../engine/ai-conflict-resolver.js`. `ai-conflict-resolver.test.ts:2-2`
- **../engine/conflict-resolver.js** — Imports `../engine/conflict-resolver.js` from `../engine/conflict-resolver.js`. `conflict-resolver.test.ts:3-3`
- **../engine/diff3.js** — Imports `../engine/diff3.js` from `../engine/diff3.js`. `diff3.test.ts:2-2`
- **../models/change-intent.js** — Imports `../models/change-intent.js` from `../models/change-intent.js`. `conflict-detector.test.ts:3-3`, `conflict-detector.test.ts:4-4`, `conflict-resolver.test.ts:4-4`, `conflict-resolver.test.ts:5-5`, `intent-classifier.test.ts:3-3`
- **../models/code-unit.js** — Imports `../models/code-unit.js` from `../models/code-unit.js`. `ai-conflict-resolver.test.ts:3-3`, `conflict-detector.test.ts:5-5`, `conflict-resolver.test.ts:6-6`, `intent-classifier.test.ts:4-4`
- **../models/semantic-conflict.js** — Imports `../models/semantic-conflict.js`. `ai-conflict-resolver.test.ts:4-9`, `conflict-resolver.test.ts:7-12`
- **../models/semantic-conflict.js** — Imports `../models/semantic-conflict.js` from `../models/semantic-conflict.js`. `conflict-detector.test.ts:6-6`
- **bun:test** — Imports `bun:test` from `bun:test`. `ai-conflict-resolver.test.ts:1-1`, `conflict-detector.test.ts:1-1`, `conflict-resolver.test.ts:1-1`, `diff3.test.ts:1-1`, `intent-classifier.test.ts:1-1`

## Dependencies

**Internal Dependencies:**
- `AIConflictResolver` — Semantic conflict resolution engine being tested
- `ConflictDetector` — Conflict detection and intent classification logic
- `ConflictResolver` — Core resolution strategy application
- `IntentClassifier` — Change intent analysis from code unit pairs
- `CodeUnit`, `SemanticConflict` — Domain models for test fixtures

**Test Framework:**
- `bun:test` — Test runner providing `describe`, `it`, `expect`, `spyOn` utilities
