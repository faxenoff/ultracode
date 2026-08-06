# Matching

## 🤖 Overview

The `merge/matching` module provides efficient matching algorithms for code units between different versions of a project. It is used by developers and tools to identify and resolve conflicts during code merges. The module includes both fast-path and semantic matchers, with the fast-path matcher offering high-performance lookups for common cases, while the semantic matcher handles more complex and less frequent scenarios.

## 🤖 Architecture

```
        +-------------------+
        |   Fast Path Matcher |
        |   (O(1) lookups)   |
        +-------------------+
              |
              v
        +-------------------+
        |   Semantic Matcher |
        |   (O(n) comparisons)|
        +-------------------+
              |
              v
        +-------------------+
        |   Versioned Index  |
        |   (base and target) |
        +-------------------+
```

## 🤖 Flow

```
        +-------------------+
        |   Fast Path Matcher |
        |   (O(1) lookups)   |
        +-------------------+
              |
              v
        +-------------------+
        |   Match Results    |
        |   (targetUnitId → MatchResult) |
        +-------------------+
              |
              v
        +-------------------+
        |   Semantic Matcher |
        |   (O(n) comparisons)|
        +-------------------+
              |
              v
        +-------------------+
        |   Conflict Resolution |
        |   (resolve conflicts) |
        +-------------------+
```

## 🤖 Entity Listing

### Function
- **bestCandidate** — Finds the best candidate with the same file path and name as the target unit `fast-path-matcher.ts:152-155`
- **sameFileCandidate** — Finds a candidate with the same file path as the target unit `fast-path-matcher.ts:115-118`
- **similarities** — Compute similarity for each candidate `semantic-matcher.ts:38-51`
- **typedCandidates** — Filters candidates to those with the same type as the target unit `fast-path-matcher.ts:142-145`
- **typedCandidates** — Filters candidates to those with units of the same type as the target unit `fast-path-matcher.ts:183-186`

### Method
- **bulkMatch** — Perform bulk matching between two indices `fast-path-matcher.ts:25-38`
- **bulkMatch** — Bulk semantic matching for multiple units `semantic-matcher.ts:80-96`
- **computeStatistics** — Computes statistics for fast path matches, including coverage and breakdown by match level `fast-path-matcher.ts:221-240`
- **computeStatistics** — Compute statistics for semantic matching `semantic-matcher.ts:164-189`
- **computeStructuralSimilarity** — Compute structural similarity between two units `semantic-matcher.ts:130-138`
- **computeVectorSimilarity** — Compute vector similarity between two units `semantic-matcher.ts:119-122`
- **findCandidates** — Search for candidates with embeddings in base index `semantic-matcher.ts:101-112`
- **findMatch** — Find match for a single unit in the base index `fast-path-matcher.ts:45-94`
- **findMatch** — Find semantic match for a unit in the base index `semantic-matcher.ts:24-70`
- **scoreToConfidence** — Convert combined score to confidence `semantic-matcher.ts:148-159`
- **tryExactMatch** — Try to match a unit in the base index with exact content `fast-path-matcher.ts:101-126`
- **tryIdMatch** — Try to match a unit in the base index with ID `fast-path-matcher.ts:206-216`
- **trySignatureMatch** — Try to match a unit in the base index with signature `fast-path-matcher.ts:171-198`
- **tryStructuralMatch** — Try to match a unit in the base index with structural hash `fast-path-matcher.ts:134-163`

### Class
- **FastPathMatcher** — Fast Path Matcher - O(1) matching via hash/signature lookups `fast-path-matcher.ts:17-241`
- **SemanticMatcher** — Semantic Matcher - Slow Path via vector embeddings `semantic-matcher.ts:15-190`

### Interface
- **FastPathMatchResult** — Represents the result of a fast path match `fast-path-matcher.ts:246-251`
- **FastPathStatistics** — Defines the structure of statistics for fast path matches, including total units, matched units, coverage, and breakdown by match level `fast-path-matcher.ts:266-276`
- **SemanticMatchResult** — Result of a semantic match `semantic-matcher.ts:195-202`
- **SemanticMatchStatistics** — Statistics for semantic matching `semantic-matcher.ts:207-214`

### Enum_decl
- **FastPathMatchLevel** — Enum representing match levels `fast-path-matcher.ts:256-261`

### Constant
- **ExactContent** — Enum value for exact content match `fast-path-matcher.ts:257-257`
- **Id** — Enum value for ID match `fast-path-matcher.ts:260-260`
- **Signature** — Enum value for signature match `fast-path-matcher.ts:259-259`
- **Structural** — Enum value for structural match `fast-path-matcher.ts:258-258`

### Import_decl
- **../../utils/simd-vector-ops.js** — Imports `../../utils/simd-vector-ops.js` from `../../utils/simd-vector-ops.js`. `semantic-matcher.ts:1-1`
- **../models/code-unit.js** — Imports `../models/code-unit.js` from `../models/code-unit.js`. `fast-path-matcher.ts:1-1`, `semantic-matcher.ts:2-2`
- **../models/versioned-index.js** — Imports `../models/versioned-index.js` from `../models/versioned-index.js`. `fast-path-matcher.ts:2-2`, `semantic-matcher.ts:3-3`

### Property
- **avgCombinedScore** — Represents the combined score of vector similarity and structural similarity, weighted 70% and 30% respectively `semantic-matcher.ts:213-213`
- **avgStructuralSimilarity** — Average structural similarity score `semantic-matcher.ts:212-212`
- **avgVectorSimilarity** — Average vector similarity score `semantic-matcher.ts:211-211`
- **baseUnit** — Base unit in the match result `fast-path-matcher.ts:248-248`
- **baseUnit** — Represents a unit in the base index used for semantic matching `semantic-matcher.ts:197-197`
- **baseUnitId** — Base unit ID in the match result `fast-path-matcher.ts:247-247`
- **baseUnitId** — ID of the base unit in the match result `semantic-matcher.ts:196-196`
- **combinedScore** — Combined score of vector and structural similarity in the match result `semantic-matcher.ts:200-200`
- **confidence** — Confidence level in the result `fast-path-matcher.ts:250-250`
- **confidence** — Confidence score derived from the combined score `semantic-matcher.ts:201-201`
- **coverage** — Represents the coverage percentage for each matching level `fast-path-matcher.ts:269-269`
- **coverage** — Coverage percentage of matched units `semantic-matcher.ts:210-210`
- **exactContentMatches** — Not explicitly defined in the provided code `fast-path-matcher.ts:272-272`
- **idMatches** — Not explicitly defined in the provided code `fast-path-matcher.ts:275-275`
- **level** — Match level in the result `fast-path-matcher.ts:249-249`
- **signatureMatches** — Not explicitly defined in the provided code `fast-path-matcher.ts:274-274`
- **structuralMatches** — Not explicitly defined in the provided code `fast-path-matcher.ts:273-273`
- **structuralSimilarity** — Structural similarity score in the match result `semantic-matcher.ts:199-199`
- **totalMatched** — Not explicitly defined in the provided code `fast-path-matcher.ts:268-268`
- **totalMatched** — Total number of units matched `semantic-matcher.ts:209-209`
- **totalUnits** — Represents the total number of units in the index being matched `fast-path-matcher.ts:267-267`
- **totalUnits** — Total number of units processed `semantic-matcher.ts:208-208`
- **vectorSimilarity** — Vector similarity score in the match result `semantic-matcher.ts:198-198`

## Data Flow

- **Inputs**: CodeUnit objects from VersionedIndex with content hashes, structural hashes, signatures, embeddings, and IDs.
- **Processing**: FastPathMatcher tries exact content hash, structural hash, signature, and ID matching in order; SemanticMatcher computes vector similarity (70% weight) + structural similarity (30% weight).
- **Outputs**: Match results with confidence scores, match level/type, and matched base CodeUnit references.

## Public API

| Export | Type | Description | Location |
|--------|------|-------------|----------|
| `FastPathMatcher` | class | O(1) hash-based matching with 4 levels of decreasing strictness | [`fast-path-matcher.ts:17-241`](./fast-path-matcher.ts) |
| `FastPathMatchResult` | interface | Match result with base unit, match level, and confidence | [`fast-path-matcher.ts:246-251`](./fast-path-matcher.ts) |
| `FastPathMatchLevel` | enum | Match levels: ExactContent, Structural, Signature, Id | [`fast-path-matcher.ts:256-261`](./fast-path-matcher.ts) |
| `FastPathStatistics` | interface | Coverage statistics broken down by match level | [`fast-path-matcher.ts:266-276`](./fast-path-matcher.ts) |
| `SemanticMatcher` | class | Vector embedding-based matching for unmatched units | [`semantic-matcher.ts:15-190`](./semantic-matcher.ts) |
| `SemanticMatchResult` | interface | Match result with vector similarity, structural similarity, and combined score | [`semantic-matcher.ts:195-202`](./semantic-matcher.ts) |
| `SemanticMatchStatistics` | interface | Coverage and average similarity statistics | [`semantic-matcher.ts:207-214`](./semantic-matcher.ts) |

## Dependencies

### Internal Modules

| Module | Purpose |
|--------|---------|
| `merge/models` | CodeUnit and VersionedIndex types |
| `utils/simd-vector-ops` | SIMD-optimized cosine similarity for vector comparison |

### External Packages

| Package | Purpose |
|---------|---------|
| (none) | No external dependencies |

## Behavioral Properties

| Property | Value |
|----------|-------|
| Fast path confidence | ExactContent: 1.0, Structural: 0.95, Signature: 0.85, ID: 0.7 |
| Semantic score formula | vectorSimilarity * 0.7 + structuralSimilarity * 0.3 |
| Default similarity threshold | 0.7 minimum combined score for semantic matching |

## Error Handling

SemanticMatcher throws if a target unit is missing its embedding (requires LazyEmbeddingCache to generate first). FastPathMatcher returns undefined for unmatched units without throwing. Both matchers handle empty index edges gracefully.

## Known Limitations

- Structural similarity is binary (1.0 for matching hash, 0.0 otherwise); edit distance would provide finer granularity.
- SemanticMatcher candidate filtering only matches by type, not by file proximity or namespace.
- FastPathMatcher prefers same-file candidates for exact matches but falls back to first candidate for other levels.

## Files

| File | Description |
|------|-------------|
| `fast-path-matcher.ts` | Four-level O(1) hash/ID matching with bulk and single-unit operations |
| `index.ts` | Re-exports FastPathMatcher and SemanticMatcher |
| `semantic-matcher.ts` | Embedding-based matching with combined vector + structural scoring |
