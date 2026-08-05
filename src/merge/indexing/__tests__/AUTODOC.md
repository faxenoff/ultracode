# Module: src/merge/indexing/__tests__

## 🤖 Overview

The `merge/indexing` module contains test files for normalizing content, managing lazy embeddings, indexing multiple versions, generating signatures, and normalizing structural data. These tests ensure that the module's components handle various edge cases and data formats correctly.

## 🤖 Architecture

```
  +-------------------+
  | ContentNormalizer |
  +-------------------+
  | LazyEmbeddingCache |
  +-------------------+
  | MultiVersionIndexer |
  +-------------------+
  | SignatureGenerator |
  +-------------------+
  | StructuralNormalizer |
  +-------------------+
```

## 🤖 Flow

```
  +-------------------+
  | ContentNormalizer |
  +-------------------+
  |     /             |
  |    /              |
  |   /               |
  |  /                |
  | /                 |
  |/                  |
  +-------------------+
  | LazyEmbeddingCache |
  +-------------------+
  |     /             |
  |    /              |
  |   /               |
  |  /                |
  | /                 |
  |/                  |
  +-------------------+
  | MultiVersionIndexer |
  +-------------------+
  |     /             |
  |    /              |
  |   /               |
  |  /                |
  | /                 |
  |/                  |
  +-------------------+
  | SignatureGenerator |
  +-------------------+
  |     /             |
  |    /              |
  |   /               |
  |  /                |
  | /                 |
  |/                  |
  +-------------------+
  | StructuralNormalizer |
  +-------------------+
```

## 🤖 Entity Listing

### Function
- **createIndex** — Constructs a VersionedIndex object from an array of CodeUnits `lazy-embedding-cache.test.ts:46-68`
- **createUnit** — Creates a CodeUnit object with specified properties `lazy-embedding-cache.test.ts:27-43`
- **errorGenerator** — Not present in the provided code `lazy-embedding-cache.test.ts:252-254`
- **mockCheckoutBranch** — Mocks the checkoutBranch method to resolve to undefined `multi-version-indexer.test.ts:14-14`
- **mockCleanup** — Mocks the cleanup method to resolve to undefined `multi-version-indexer.test.ts:16-16`
- **mockDevAgentExecute** — Mocks the execute method of the dev agent to resolve to an object with success: true `multi-version-indexer.test.ts:19-19`
- **mockGetBranchMetadata** — Mocks the getBranchMetadata method to return null `multi-version-indexer.test.ts:9-9`
- **mockGetCommitHash** — Mocks the getCommitHash method to return a hash based on the reference `multi-version-indexer.test.ts:17-17`
- **mockGetMergeBase** — Mocks the getMergeBase method to return "base-commit-hash" `multi-version-indexer.test.ts:13-13`
- **mockGetRepositoryHash** — Mocks the getRepositoryHash method to return "repo-hash-123" `multi-version-indexer.test.ts:11-11`
- **mockHasBranchDatabase** — Mocks the hasBranchDatabase method to return false `multi-version-indexer.test.ts:8-8`
- **mockRestoreOriginalBranch** — Mocks the restoreOriginalBranch method to resolve to undefined `multi-version-indexer.test.ts:15-15`
- **mockUpdateBranchMetadata** — Mocks the updateBranchMetadata method to return an empty object `multi-version-indexer.test.ts:10-10`
- **units** — Not present in the provided code `lazy-embedding-cache.test.ts:267-267`

### Import_decl
- **../../../agents/conductor-orchestrator.js** — Imports `../../../agents/conductor-orchestrator.js` from `../../../agents/conductor-orchestrator.js`. `multi-version-indexer.test.ts:2-2`
- **../../../core/branch-manager.js** — Imports `../../../core/branch-manager.js` from `../../../core/branch-manager.js`. `multi-version-indexer.test.ts:3-3`
- **../../integration/git-integration.js** — Imports `../../integration/git-integration.js` from `../../integration/git-integration.js`. `multi-version-indexer.test.ts:4-4`
- **../../models/code-unit.js** — Imports `../../models/code-unit.js` from `../../models/code-unit.js`. `lazy-embedding-cache.test.ts:2-2`, `lazy-embedding-cache.test.ts:3-3`, `signature-generator.test.ts:2-2`, `signature-generator.test.ts:3-3`
- **../../models/versioned-index.js** — Imports `../../models/versioned-index.js` from `../../models/versioned-index.js`. `lazy-embedding-cache.test.ts:4-4`
- **../content-normalizer.js** — Imports `../content-normalizer.js` from `../content-normalizer.js`. `content-normalizer.test.ts:5-5`
- **../lazy-embedding-cache.js** — Imports `../lazy-embedding-cache.js` from `../lazy-embedding-cache.js`. `lazy-embedding-cache.test.ts:5-5`, `lazy-embedding-cache.test.ts:6-6`
- **../multi-version-indexer.js** — Imports `../multi-version-indexer.js` from `../multi-version-indexer.js`. `multi-version-indexer.test.ts:5-5`
- **../signature-generator.js** — Imports `../signature-generator.js` from `../signature-generator.js`. `signature-generator.test.ts:4-4`
- **../structural-normalizer.js** — Imports `../structural-normalizer.js` from `../structural-normalizer.js`. `structural-normalizer.test.ts:2-2`
- **bun:test** — Imports `bun:test` from `bun:test`. `content-normalizer.test.ts:1-1`, `lazy-embedding-cache.test.ts:1-1`, `multi-version-indexer.test.ts:1-1`, `signature-generator.test.ts:1-1`, `structural-normalizer.test.ts:1-1`
- **node:fs/promises** — Imports `node:fs/promises` from `node:fs/promises`. `content-normalizer.test.ts:2-2`
- **node:os** — Imports `node:os` from `node:os`. `content-normalizer.test.ts:3-3`
- **node:path** — Imports `node:path` from `node:path`. `content-normalizer.test.ts:4-4`

## Test Suites by Component

### ContentNormalizer Tests

Test suite for file encoding detection, BOM removal, and line-ending normalization.

- **normalizer** — `content-normalizer.test.ts:7-118` - Main test suite for ContentNormalizer covering encoding and line-ending scenarios.
- **normalizer** — `content-normalizer.test.ts:11-14` - Setup hook creating a fresh ContentNormalizer instance.
- **fs** — `content-normalizer.test.ts:16-18` - Temporary file system operations for test fixtures.
- **filePath** — `content-normalizer.test.ts:20-31` - Test case validating UTF-8 with BOM normalization and detection.
- **filePath** — `content-normalizer.test.ts:33-42` - Test case validating UTF-8 without BOM handling.
- **filePath** — `content-normalizer.test.ts:44-52` - Test case validating CRLF line ending normalization to LF.
- **filePath** — `content-normalizer.test.ts:54-62` - Test case validating mixed line ending normalization.
- **filePath** — `content-normalizer.test.ts:64-72` - Test case validating LF-only line ending preservation.
- **filePath** — `content-normalizer.test.ts:74-82` - Test case validating Unicode content normalization.
- **content1** — `content-normalizer.test.ts:84-93` - Test case validating identical content produces identical normalized output.
- **content1** — `content-normalizer.test.ts:95-103` - Test case validating different encodings with same content normalize equivalently.
- **filePath** — `content-normalizer.test.ts:105-117` - Test case validating round-trip normalization idempotence.

### LazyEmbeddingCache Tests

Test suite for embedding/signature caching with lazy loading and concurrent access.

- **cache** — `lazy-embedding-cache.test.ts:8-276` - Main test suite for LazyEmbeddingCache covering caching, statistics, and error handling.
- **Create** — `lazy-embedding-cache.test.ts:12-24` - Test helper creating a sample code unit for testing.
- **code** — `lazy-embedding-cache.test.ts:14-21` - Sample TypeScript code string used in cache tests.
- **createUnit** — `lazy-embedding-cache.test.ts:27-43` - Factory function creating a complete compilation unit with metadata.
- **<anonymous>** — `lazy-embedding-cache.test.ts:27-27` - Async factory wrapper enabling promise-based unit creation.
- **createIndex** — `lazy-embedding-cache.test.ts:46-68` - Factory function creating a LazyEmbeddingCache instance populated with test units.
- **<anonymous>** — `lazy-embedding-cache.test.ts:46-46` - Async factory wrapper for cache initialization.
- **it** — `lazy-embedding-cache.test.ts:70-151` - Test case validating cache population, retrieval, and iteration of embeddings.
- **unit1** — `lazy-embedding-cache.test.ts:71-90` - First test unit with signature and embedding metadata.
- **unit1** — `lazy-embedding-cache.test.ts:92-106` - Second retrieval of unit1 validating consistent caching.
- **units** — `lazy-embedding-cache.test.ts:108-126` - Collection of all units retrieved from cache via iteration.
- **unit** — `lazy-embedding-cache.test.ts:128-138` - Individual unit from iterated collection validating structure.
- **unit** — `lazy-embedding-cache.test.ts:140-150` - Another individual unit validating embeddings array structure.
- **it** — `lazy-embedding-cache.test.ts:153-187` - Test case validating two separate indexes maintain independent caches.
- **Two** — `lazy-embedding-cache.test.ts:154-169` - First independent cache instance.
- **unit1** — `lazy-embedding-cache.test.ts:171-186` - Unit retrieved from first cache validating isolation.
- **it** — `lazy-embedding-cache.test.ts:189-215` - Test case validating cache statistics reporting.
- **units** — `lazy-embedding-cache.test.ts:190-207` - Collection of units used to populate cache for statistics validation.
- **stats** — `lazy-embedding-cache.test.ts:209-214` - Cache statistics object containing count and size metrics.
- **it** — `lazy-embedding-cache.test.ts:217-239` - Test case validating cache behavior with large embedding arrays.
- **unit** — `lazy-embedding-cache.test.ts:218-238` - Test unit with large number of embeddings.
- **it** — `lazy-embedding-cache.test.ts:241-275` - Test case validating error handling and generator cleanup.
- **index** — `lazy-embedding-cache.test.ts:242-249` - Cache instance under error testing.
- **errorGenerator** — `lazy-embedding-cache.test.ts:251-262` - Async generator that throws error during iteration for exception handling validation.
- **Error** — `lazy-embedding-cache.test.ts:252-254` - Error thrown during generator execution to test error propagation.
- **largeCache** — `lazy-embedding-cache.test.ts:264-274` - Cache with many units testing resource cleanup on error.
- **_** — `lazy-embedding-cache.test.ts:267-267` - Throwaway variable in error suppression context.

### MultiVersionIndexer Tests

Test suite for indexing across multiple git branches and version management.

- **mockHasBranchDatabase** — `multi-version-indexer.test.ts:8-8` - Mock for branch database existence check.
- **mockGetBranchMetadata** — `multi-version-indexer.test.ts:9-9` - Mock for retrieving branch metadata.
- **mockUpdateBranchMetadata** — `multi-version-indexer.test.ts:10-10` - Mock for updating branch metadata.
- **mockGetRepositoryHash** — `multi-version-indexer.test.ts:11-11` - Mock for getting repository hash.
- **mockGetMergeBase** — `multi-version-indexer.test.ts:13-13` - Mock for computing merge base between branches.
- **mockCheckoutBranch** — `multi-version-indexer.test.ts:14-14` - Mock for checking out a git branch.
- **mockRestoreOriginalBranch** — `multi-version-indexer.test.ts:15-15` - Mock for restoring original branch after operations.
- **mockCleanup** — `multi-version-indexer.test.ts:16-16` - Mock for cleanup operations.
- **mockGetCommitHash** — `multi-version-indexer.test.ts:17-17` - Mock for retrieving commit hash.
- **mockDevAgentExecute** — `multi-version-indexer.test.ts:19-19` - Mock for dev agent execution.
- **mockBranchManager** — `multi-version-indexer.test.ts:22-27` - Mock branch manager with all git operations.
- **mockGitIntegration** — `multi-version-indexer.test.ts:29-36` - Mock git integration providing repository operations.
- **mockConductor** — `multi-version-indexer.test.ts:38-38` - Mock conductor orchestrator.
- **mockDevAgent** — `multi-version-indexer.test.ts:40-42` - Mock dev agent for code analysis.
- **indexer** — `multi-version-indexer.test.ts:54-283` - Main test suite for MultiVersionIndexer covering reset, indexing, metadata, and error scenarios.
- **Reset** — `multi-version-indexer.test.ts:57-80` - Test helper validating state reset between indexing operations.
- **ref** — `multi-version-indexer.test.ts:74-74` - Reference state variable used in reset validation.
- **it** — `multi-version-indexer.test.ts:82-205` - Test case validating indexing workflow across multiple branches with branch switching and database operations.
- **result** — `multi-version-indexer.test.ts:83-105` - Indexing result from first branch containing code analysis.
- **mockGetMergeBase** — `multi-version-indexer.test.ts:107-111` - Mock implementation returning merge base commit.
- **mockCheckoutBranch** — `multi-version-indexer.test.ts:113-120` - Mock implementation handling branch checkout with metadata updates.
- **Mock** — `multi-version-indexer.test.ts:122-145` - Branch-specific metadata mock setup.
- **branch** — `multi-version-indexer.test.ts:125-136` - Branch name variable in metadata mock.
- **mockHasBranchDatabase** — `multi-version-indexer.test.ts:147-169` - Mock implementation checking branch database existence and returning appropriate values.
- **mockHasBranchDatabase** — `multi-version-indexer.test.ts:171-194` - Second branch database check mock for secondary branch validation.
- **result** — `multi-version-indexer.test.ts:196-204` - Final indexing result after branch operations.
- **it** — `multi-version-indexer.test.ts:207-250` - Test case validating selective indexing with branch database existence checks.
- **indexer** — `multi-version-indexer.test.ts:208-224` - Indexer instance for selective indexing test.
- **mockHasBranchDatabase** — `multi-version-indexer.test.ts:226-249` - Mock determining database availability for branch filtering.
- **it** — `multi-version-indexer.test.ts:252-282` - Test case validating error handling during branch metadata updates and dev agent execution.
- **mockDevAgentExecute** — `multi-version-indexer.test.ts:253-257` - Mock dev agent execution returning code analysis results.
- **mockHasBranchDatabase** — `multi-version-indexer.test.ts:259-270` - Mock for database existence checks in error scenario.
- **Error** — `multi-version-indexer.test.ts:261-263` - Error thrown during branch metadata update.
- **mockUpdateBranchMetadata** — `multi-version-indexer.test.ts:272-281` - Mock update operation that throws error.
- **Error** — `multi-version-indexer.test.ts:273-275` - Error message for failed metadata update.

### SignatureGenerator Tests

Test suite for creating deterministic signatures for code units.

- **generator** — `signature-generator.test.ts:6-374` - Main test suite for SignatureGenerator covering multiple language constructs and code patterns.
- **generator** — `signature-generator.test.ts:9-11` - Setup hook initializing SignatureGenerator instance.
- **it** — `signature-generator.test.ts:13-119` - Test case validating signature generation for various code structures (functions, classes, etc.).
- **unit** — `signature-generator.test.ts:14-33` - Test unit containing simple function definition.
- **unit** — `signature-generator.test.ts:35-54` - Test unit containing class definition with methods.
- **unit** — `signature-generator.test.ts:56-75` - Test unit containing arrow function expression.
- **unit** — `signature-generator.test.ts:77-97` - Test unit containing async function definition.
- **unit** — `signature-generator.test.ts:99-118` - Test unit containing type definition or interface.
- **it** — `signature-generator.test.ts:121-205` - Test case validating signature generation across different programming languages.
- **unit** — `signature-generator.test.ts:122-141` - Python code unit for cross-language signature validation.
- **unit** — `signature-generator.test.ts:143-162` - Go code unit for cross-language signature validation.
- **unit** — `signature-generator.test.ts:164-183` - Java code unit for cross-language signature validation.
- **unit** — `signature-generator.test.ts:185-204` - Rust code unit for cross-language signature validation.
- **it** — `signature-generator.test.ts:207-282` - Test case validating signature generation with code containing comments and whitespace variations.
- **unit** — `signature-generator.test.ts:208-233` - Code with extensive comments for normalization testing.
- **unit** — `signature-generator.test.ts:235-260` - Code with extra whitespace for normalization testing.
- **unit** — `signature-generator.test.ts:262-281` - Code with different formatting for normalization validation.
- **it** — `signature-generator.test.ts:284-326` - Test case validating deterministic signature generation with identical hashes for equivalent code.
- **unit** — `signature-generator.test.ts:285-304` - First equivalent code variant.
- **unit** — `signature-generator.test.ts:306-325` - Second equivalent code variant with different formatting.
- **it** — `signature-generator.test.ts:328-357` - Test case validating signature hashing with multiple units in same collection.
- **signature** — `signature-generator.test.ts:329-336` - Generated signature for first code unit.
- **sig1** — `signature-generator.test.ts:338-346` - Signature object for unit 1.
- **sig1** — `signature-generator.test.ts:348-356` - Second retrieval of unit 1 signature for consistency validation.
- **it** — `signature-generator.test.ts:359-373` - Test case validating signature normalization consistency.
- **signature** — `signature-generator.test.ts:360-365` - First signature instance for normalization comparison.
- **signature** — `signature-generator.test.ts:367-372` - Second signature instance for normalization comparison.

#### Signature Generation Test Variables

- **unit** — `signature-generator.test.ts:15-29` - First test unit with function definition.
- **signature** — `signature-generator.test.ts:31-31` - Generated signature from first unit.
- **unit** — `signature-generator.test.ts:36-50` - Second test unit with class definition.
- **signature** — `signature-generator.test.ts:52-52` - Generated signature from second unit.
- **unit** — `signature-generator.test.ts:57-71` - Third test unit with arrow function.
- **signature** — `signature-generator.test.ts:73-73` - Generated signature from third unit.
- **unit** — `signature-generator.test.ts:78-92` - Fourth test unit with async function.
- **signature** — `signature-generator.test.ts:94-94` - Generated signature from fourth unit.
- **unit** — `signature-generator.test.ts:100-114` - Fifth test unit with type definition.
- **signature** — `signature-generator.test.ts:116-116` - Generated signature from fifth unit.
- **unit** — `signature-generator.test.ts:123-137` - Python code unit.
- **signature** — `signature-generator.test.ts:139-139` - Generated signature from Python unit.
- **unit** — `signature-generator.test.ts:144-158` - Go code unit.
- **signature** — `signature-generator.test.ts:160-160` - Generated signature from Go unit.
- **unit** — `signature-generator.test.ts:165-179` - Java code unit.
- **signature** — `signature-generator.test.ts:181-181` - Generated signature from Java unit.
- **unit** — `signature-generator.test.ts:186-200` - Rust code unit.
- **signature** — `signature-generator.test.ts:202-202` - Generated signature from Rust unit.
- **unit** — `signature-generator.test.ts:209-229` - Code unit with comments for normalization testing.
- **signature** — `signature-generator.test.ts:231-231` - Generated signature from commented code.
- **unit** — `signature-generator.test.ts:236-256` - Code unit with extra whitespace.
- **signature** — `signature-generator.test.ts:258-258` - Generated signature from whitespace-padded code.
- **unit** — `signature-generator.test.ts:263-277` - Code unit with different formatting.
- **signature** — `signature-generator.test.ts:279-279` - Generated signature from reformatted code.
- **unit** — `signature-generator.test.ts:286-300` - First equivalent code variant for determinism test.
- **signature** — `signature-generator.test.ts:302-302` - Signature from first equivalent variant.
- **unit** — `signature-generator.test.ts:307-321` - Second equivalent code variant for determinism test.
- **signature** — `signature-generator.test.ts:323-323` - Signature from second equivalent variant.
- **signature** — `signature-generator.test.ts:330-330` - Signature object for consistency testing.
- **hash** — `signature-generator.test.ts:331-331` - Hash value from signature.
- **sig1** — `signature-generator.test.ts:339-339` - Signature from first unit in multi-unit test.
- **sig2** — `signature-generator.test.ts:340-340` - Signature from second unit in multi-unit test.
- **hash1** — `signature-generator.test.ts:342-342` - Hash of first signature.
- **hash2** — `signature-generator.test.ts:343-343` - Hash of second signature.
- **sig1** — `signature-generator.test.ts:349-349` - Re-retrieved signature from first unit for consistency.
- **sig2** — `signature-generator.test.ts:350-350` - Re-retrieved signature from second unit for consistency.
- **hash1** — `signature-generator.test.ts:352-352` - Re-computed hash of first signature.
- **hash2** — `signature-generator.test.ts:353-353` - Re-computed hash of second signature.
- **signature** — `signature-generator.test.ts:361-361` - Signature for normalization comparison.
- **normalized** — `signature-generator.test.ts:362-362` - Normalized representation of signature.
- **signature** — `signature-generator.test.ts:368-368` - Second signature for normalization comparison.
- **normalized** — `signature-generator.test.ts:369-369` - Normalized representation of second signature.

### StructuralNormalizer Tests

Test suite for normalizing code structure for reliable comparison.

- **normalizer** — `structural-normalizer.test.ts:4-206` - Main test suite for StructuralNormalizer covering various code structure patterns.
- **normalizer** — `structural-normalizer.test.ts:7-9` - Setup hook initializing StructuralNormalizer instance.
- **it** — `structural-normalizer.test.ts:11-65` - Test case validating structural normalization for equivalent code with whitespace variations.
- **code1** — `structural-normalizer.test.ts:12-37` - First code variant with different spacing.
- **code1** — `structural-normalizer.test.ts:39-47` - Second code variant with minimal spacing.
- **code** — `structural-normalizer.test.ts:49-64` - Normalized output validating structure equivalence.
- **it** — `structural-normalizer.test.ts:67-92` - Test case validating comment removal during normalization.
- **code** — `structural-normalizer.test.ts:68-81` - Code with comments for comment removal testing.
- **code1** — `structural-normalizer.test.ts:83-91` - Normalized output with comments stripped.
- **it** — `structural-normalizer.test.ts:94-110` - Test case validating string literal normalization.
- **code** — `structural-normalizer.test.ts:95-109` - Code containing various string formats.
- **it** — `structural-normalizer.test.ts:112-176` - Test case validating comprehensive normalization with nested structures.
- **code1** — `structural-normalizer.test.ts:113-135` - Complex code structure variant 1.
- **code1** — `structural-normalizer.test.ts:137-148` - Complex code structure variant 2.
- **code1** — `structural-normalizer.test.ts:150-175` - Normalized output for complex structures.
- **it** — `structural-normalizer.test.ts:178-x** — `lazy-embedding-cache.test.ts:269-269` - Throwaway variable in cache stress test.

#### Structural Normalization Test Variables

- **code1** — `structural-normalizer.test.ts:13-18` - First code variant for equivalence testing.
- **code2** — `structural-normalizer.test.ts:20-24` - Second code variant for equivalence testing.
- **norm1** — `structural-normalizer.test.ts:26-26` - Normalized form of first code variant.
- **norm2** — `structural-normalizer.test.ts:27-27` - Normalized form of second code variant.
- **code1** — `structural-normalizer.test.ts:40-40` - Code variant with comments for comment removal test.
- **code2** — `structural-normalizer.test.ts:41-41` - Code without comments reference.
- **norm1** — `structural-normalizer.test.ts:43-43` - Normalized form with comments stripped.
- **norm2** — `structural-normalizer.test.ts:44-44` - Normalized form reference.
- **code** — `structural-normalizer.test.ts:50-57` - Code with multiple string literal formats.
- **normalized** — `structural-normalizer.test.ts:59-59` - Normalized string representation.
- **code** — `structural-normalizer.test.ts:69-74` - Code containing inline and block comments.
- **normalized** — `structural-normalizer.test.ts:76-76` - Code with all comments removed.
- **code1** — `structural-normalizer.test.ts:84-84` - First variant of equivalent code.
- **code2** — `structural-normalizer.test.ts:85-85` - Second variant of equivalent code.
- **norm1** — `structural-normalizer.test.ts:87-87` - Normalized first variant.
- **norm2** — `structural-normalizer.test.ts:88-88` - Normalized second variant.
- **code** — `structural-normalizer.test.ts:96-102` - Code with nested structures and various formatting.
- **normalized** — `structural-normalizer.test.ts:104-104` - Normalized nested structure.
- **code1** — `structural-normalizer.test.ts:114-114` - Complex structure variant 1.
- **code2** — `structural-normalizer.test.ts:115-115` - Complex structure variant 2.
- **norm1** — `structural-normalizer.test.ts:117-117` - Normalized complex structure 1.
- **norm2** — `structural-normalizer.test.ts:118-118` - Normalized complex structure 2.
- **hash1** — `structural-normalizer.test.ts:129-129` - Hash of first normalized structure.
- **hash2** — `structural-normalizer.test.ts:130-130` - Hash of second normalized structure.
- **code1** — `structural-normalizer.test.ts:138-138` - Code variant for hash equivalence.
- **code2** — `structural-normalizer.test.ts:139-139` - Code variant for hash equivalence.
- **norm1** — `structural-normalizer.test.ts:141-141` - Normalized form 1 for hashing.
- **norm2** — `structural-normalizer.test.ts:142-142` - Normalized form 2 for hashing.
- **hash1** — `structural-normalizer.test.ts:144-144` - Hash of normalized form 1.
- **hash2** — `structural-normalizer.test.ts:145-145` - Hash of normalized form 2.
- **code1** — `structural-normalizer.test.ts:151-157` - Multi-line code variant.
- **code2** — `structural-normalizer.test.ts:159-159` - Reference code for comparison.
- **norm1** — `structural-normalizer.test.ts:161-161` - Normalized multi-line code.
- **norm2** — `structural-normalizer.test.ts:162-162` - Reference normalized form.
- **hash1** — `structural-normalizer.test.ts:170-170` - Hash from first multi-line normalization.
- **hash2** — `structural-normalizer.test.ts:171-171` - Hash from second multi-line normalization.
- **code** — `structural-normalizer.test.ts:180-188` - Final comprehensive test code sample.
- **normalized** — `structural-normalizer.test.ts:190-190` - Normalized comprehensive test sample.
- **code** — `structural-normalizer.test.ts:196-196` - Additional test code sample.
- **normalized** — `structural-normalizer.test.ts:198-198` - Normalized additional sample.
- **lines** — `structural-normalizer.test.ts:199-199` - Line count from normalized output.

---

`★ Insight ─────────────────────────────────────`
These test suites form a layered validation pipeline: ContentNormalizer ensures files are standardized at the byte level, StructuralNormalizer normalizes code syntax across languages, SignatureGenerator creates deterministic semantic fingerprints, LazyEmbeddingCache efficiently stores and retrieves these signatures with statistics, and MultiVersionIndexer orchestrates everything across branches—demonstrating how the merge system handles file consistency, code comparison, and version-aware indexing as integrated concerns rather than isolated features.
`─────────────────────────────────────────────────`
