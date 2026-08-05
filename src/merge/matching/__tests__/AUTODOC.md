# src/merge/matching/__tests__

## Overview

This module contains comprehensive test suites for the merge matching subsystem, verifying both structural and semantic matching strategies. It tests `FastPathMatcher` (content and structural hash-based matching) and `SemanticMatcher` (embedding-based semantic similarity matching) with multiple scenarios including single matches, bulk matching, ranking, and edge cases. Helper functions construct standardized test data (CodeUnits, indices, embeddings) to ensure consistent test scenarios across both matchers.

## Flow

```
Test Setup
    ↓
Create Test Data (CodeUnits, Embeddings)
    ↓
Build Index
    ↓
Initialize Matcher
    ↓
Execute Query (find matches)
    ↓
Verify Results (ranking, scores)
```

## Entity Listing

### Test Suites

- **matcher** — `fast-path-matcher.test.ts:7-426` — Top-level test suite for FastPathMatcher covering content hashing, structural hashing, and bulk matching scenarios.
- **matcher** — `semantic-matcher.test.ts:7-306` — Top-level test suite for SemanticMatcher covering embedding-based similarity matching and edge cases.

### Helper Functions (Test Data Builders)

- **createUnit** — `fast-path-matcher.test.ts:15-38` — Constructs a CodeUnit with specified id, name, content hash, and structural hash for testing.
- **<anonymous>** — `fast-path-matcher.test.ts:15-15` — Setup hook for FastPathMatcher suite.
- **createIndex** — `fast-path-matcher.test.ts:41-84` — Builds a VersionedIndex from an array of CodeUnits with populated hash and path indices.
- **<anonymous>** — `fast-path-matcher.test.ts:41-41` — Setup hook for index creation.
- **createUnitWithEmbedding** — `semantic-matcher.test.ts:15-37` — Constructs a CodeUnit with an attached embedding vector for semantic matching.
- **<anonymous>** — `semantic-matcher.test.ts:15-15` — Setup hook for SemanticMatcher suite.
- **createIndex** — `semantic-matcher.test.ts:40-62` — Builds a VersionedIndex with embedded CodeUnits and populated indices.
- **<anonymous>** — `semantic-matcher.test.ts:40-40` — Setup hook for semantic index creation.
- **createSimilarEmbedding** — `semantic-matcher.test.ts:65-71` — Generates an embedding vector with high similarity to reference embeddings.
- **<anonymous>** — `semantic-matcher.test.ts:65-65` — Setup hook for similar embedding generation.
- **createDifferentEmbedding** — `semantic-matcher.test.ts:74-80` — Generates an embedding vector with low similarity to reference embeddings.
- **<anonymous>** — `semantic-matcher.test.ts:74-74` — Setup hook for different embedding generation.

### Test Cases

#### FastPathMatcher Tests

- **it** — `fast-path-matcher.test.ts:86-137` — Verifies matching finds exact content hash match between base and target units.
- **it** — `fast-path-matcher.test.ts:139-204` — Verifies matching by structural hash when content differs but structure is identical.
- **it** — `fast-path-matcher.test.ts:206-251` — Verifies matching prioritizes content hash over structural hash matches.
- **it** — `fast-path-matcher.test.ts:253-284` — Verifies matching works with signature-based unit identification.
- **it** — `fast-path-matcher.test.ts:286-323` — Verifies bulk matching handles multiple base units against single targets.
- **it** — `fast-path-matcher.test.ts:325-388` — Verifies bulk matching returns ranked results and statistics for multiple matches.
- **it** — `fast-path-matcher.test.ts:390-425` — Verifies matching handles edge cases with missing or partial unit metadata.

#### SemanticMatcher Tests

- **it** — `semantic-matcher.test.ts:82-175` — Verifies semantic matching finds highly similar embeddings above confidence threshold.
- **it** — `semantic-matcher.test.ts:177-237` — Verifies bulk semantic matching ranks results by similarity and handles missing embeddings gracefully.
- **it** — `semantic-matcher.test.ts:239-277` — Verifies statistics collection during matching including match counts and similarity scores.
- **it** — `semantic-matcher.test.ts:279-305` — Verifies similarity threshold enforcement rejects low-confidence matches.

### Test Data Variables

#### FastPathMatcher Test Data

- **baseUnit** — `fast-path-matcher.test.ts:88-88` — Single base CodeUnit instance for matching.
- **targetUnit** — `fast-path-matcher.test.ts:89-89` — Target CodeUnit to match against base.
- **baseIndex** — `fast-path-matcher.test.ts:91-91` — VersionedIndex containing base units for content/structural lookup.
- **result** — `fast-path-matcher.test.ts:93-93` — Matching result with confidence score and match level.
- **baseUnit1** — `fast-path-matcher.test.ts:103-103` — First base unit in multi-unit test scenario.
- **baseUnit2** — `fast-path-matcher.test.ts:106-106` — Second base unit in multi-unit test scenario.
- **baseUnit** — `fast-path-matcher.test.ts:141-141` — Base unit for structural matching test.
- **targetUnit** — `fast-path-matcher.test.ts:142-142` — Target unit with same structure but different content.
- **baseIndex** — `fast-path-matcher.test.ts:144-144` — Index for structural hash lookup.
- **result** — `fast-path-matcher.test.ts:146-146` — Structural match result.
- **baseClass** — `fast-path-matcher.test.ts:155-155` — CodeUnit representing a class definition.
- **baseFunction** — `fast-path-matcher.test.ts:158-158` — CodeUnit representing a function within class.
- **targetUnit** — `fast-path-matcher.test.ts:161-161` — Target class for nested matching.
- **baseClass** — `fast-path-matcher.test.ts:191-191` — Base class for priority testing.
- **targetFunction** — `fast-path-matcher.test.ts:194-194` — Target function for cross-structure matching.
- **baseClass** — `fast-path-matcher.test.ts:235-235` — Base class for signature-based matching.
- **baseFunction** — `fast-path-matcher.test.ts:238-238` — Function with signature for type-safe matching.
- **targetClass** — `fast-path-matcher.test.ts:241-241` — Target class with matching signature.
- **baseUnits** — `fast-path-matcher.test.ts:287-310` — Array of multiple base units for bulk matching.
- **baseUnits** — `fast-path-matcher.test.ts:312-322` — Second batch of base units for extended bulk test.
- **results** — `fast-path-matcher.test.ts:354-365` — Array of match results from bulk query.
- **baseUnits** — `fast-path-matcher.test.ts:367-387` — Base units for edge case testing with partial metadata.
- **targetUnit** — `fast-path-matcher.test.ts:391-398` — Target for edge case matching.
- **Unit** — `fast-path-matcher.test.ts:410-424` — Edge case unit with minimal or absent fields.

#### SemanticMatcher Test Data

- **targetEmbedding** — `semantic-matcher.test.ts:83-99` — Embedding vector for high-similarity matching test.
- **targetEmbedding** — `semantic-matcher.test.ts:101-119` — Embedding vector for medium-similarity test.
- **targetEmbedding** — `semantic-matcher.test.ts:121-133` — Embedding vector for low-similarity test.
- **targetUnit** — `semantic-matcher.test.ts:135-142` — CodeUnit with embedding for semantic matching.
- **matcher** — `semantic-matcher.test.ts:141-141` — SemanticMatcher instance for single-match test.
- **targetEmbedding** — `semantic-matcher.test.ts:144-159` — Reference embedding for similarity comparison.
- **targetEmbedding** — `semantic-matcher.test.ts:161-174` — Embedding below confidence threshold.
- **target1Embedding** — `semantic-matcher.test.ts:178-202` — First target embedding for bulk matching.
- **target1WithEmbedding** — `semantic-matcher.test.ts:204-224` — First target CodeUnit with embedding.
- **targetUnits** — `semantic-matcher.test.ts:226-236` — Array of target units for bulk query.
- **embedding1** — `semantic-matcher.test.ts:240-264` — First embedding for statistics test.
- **results** — `semantic-matcher.test.ts:266-276` — Match results with embedded confidence metrics.
- **targetUnit** — `semantic-matcher.test.ts:280-287` — Target unit for threshold enforcement test.
- **targetEmbedding** — `semantic-matcher.test.ts:289-304` — Embedding below match threshold.
- **targetUEmbedding** — `semantic-matcher.test.ts:180-180` — Target user embedding instance.
- **base1Embedding** — `semantic-matcher.test.ts:182-182` — First base embedding vector.
- **base2Embedding** — `semantic-matcher.test.ts:183-183` — Second base embedding vector.
- **targetUnits** — `semantic-matcher.test.ts:185-188` — Target units array for bulk test.
- **baseUnits** — `semantic-matcher.test.ts:190-193` — Array of base units with embeddings.
- **baseIndex** — `semantic-matcher.test.ts:195-195` — Index for base unit lookup in bulk match.
- **results** — `semantic-matcher.test.ts:197-197` — Ranked match results from bulk query.
- **target1WithEmbedding** — `semantic-matcher.test.ts:205-210` — First target with embedding data.
- **target2WithoutEmbedding** — `semantic-matcher.test.ts:211-211` — Target unit without embedding for graceful fallback test.
- **baseUnit** — `semantic-matcher.test.ts:214-214` — Single base unit for fallback scenario.
- **targetUnits** — `semantic-matcher.test.ts:216-216` — Mixed targets with and without embeddings.
- **baseIndex** — `semantic-matcher.test.ts:217-217` — Index for fallback test.
- **results** — `semantic-matcher.test.ts:219-219` — Results handling units with missing embeddings.
- **targetUnits** — `semantic-matcher.test.ts:227-227` — Targets for statistics collection test.
- **baseUnits** — `semantic-matcher.test.ts:229-229` — Bases for statistics collection test.
- **baseIndex** — `semantic-matcher.test.ts:231-231` — Index for stats test.
- **results** — `semantic-matcher.test.ts:233-233` — Results including statistical metadata.
- **embedding2** — `semantic-matcher.test.ts:242-242` — Second embedding for stats verification.
- **targetUnits** — `semantic-matcher.test.ts:244-247` — Target units for stats test.
- **baseUnits** — `semantic-matcher.test.ts:249-252` — Base units for stats test.
- **baseIndex** — `semantic-matcher.test.ts:254-254` — Index for stats collection.
- **results** — `semantic-matcher.test.ts:255-255` — First batch of match results.
- **stats** — `semantic-matcher.test.ts:256-256` — Statistical summary from first match batch.
- **results** — `semantic-matcher.test.ts:267-267` — Second batch of match results.
- **stats** — `semantic-matcher.test.ts:268-268` — Statistical summary from second batch.
- **baseIndex** — `semantic-matcher.test.ts:282-282` — Index for threshold test.
- **result** — `semantic-matcher.test.ts:284-284` — Match result for threshold validation.
- **baseEmbedding** — `semantic-matcher.test.ts:291-291` — Base unit embedding for comparison.
- **baseUnit** — `semantic-matcher.test.ts:294-294` — Base unit for threshold test.
- **baseIndex** — `semantic-matcher.test.ts:296-296` — Index for low-confidence match.
- **resultLow** — `semantic-matcher.test.ts:299-299` — Result with similarity below threshold.

## Dependencies

**Internal:**
- `CodeUnit`, `CodeUnitType` — code unit models from ~~`../../models/code-unit.js`~~ (deleted)
- `VersionedIndex` — indexed code structure from ~~`../../models/versioned-index.js`~~ (deleted)
- `FastPathMatcher`, `FastPathMatchLevel` — structural/content matching implementation from ~~`../fast-path-matcher.js`~~ (deleted)
- `SemanticMatcher` — embedding-based matching from ~~`../semantic-matcher.js`~~ (deleted)

**External:**
- `bun:test` — Bun test framework (`describe`, `it`, `beforeEach`, `expect`)