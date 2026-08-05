# Semantic Merge Module

## Overview

A 3-way semantic merge engine that operates on code units (functions, classes, files) rather than raw text lines. The pipeline has five phases: (1) `MultiVersionIndexer` indexes base, branchA, and branchB via DevAgent with per-branch caching; (2) `FastPathMatcher` performs O(1) hash-based matching across four levels — exact content, structural, signature, and stable ID — covering ~90–95% of units; (3) `SemanticMatcher` handles the remaining ~5–10% via vector embedding cosine similarity combined with structural scoring (70/30 weighting); (4) `IntentClassifier` categorizes each change as BugFix, Refactoring, FeatureAddition, or APIChange using heuristic evidence collection; (5) `ConflictDetector` identifies conflicts by severity (Low/Medium/High/Critical) and type (Overlapping, IncompatibleIntents, APIBreaking, DeleteModify). The `ConflictResolver` applies rule-based resolution with optional `AIConflictResolver` fallback that uses embedding similarity to score strategies.

## Data Flow

```
GitIntegration
    ↓ (checkout, merge-base, rename detection)
MultiVersionIndexer (index base + branchA + branchB)
    ├─→ ContentNormalizer (encoding/BOM normalization)
    ├─→ StructuralNormalizer (AST normalization)
    ├─→ SignatureGenerator (FQN + params signature)
    └─→ LazyEmbeddingCache (on-demand vectors)
    ↓
FastPathMatcher (4-level hash matching, ~90–95%)
    ↓
SemanticMatcher (vector cosine similarity, ~5–10%)
    ↓
IntentClassifier (BugFix / Refactoring / Feature / APIChange)
    ↓
ConflictDetector (severity + type classification)
    ↓
ConflictResolver ─→ AIConflictResolver (optional)
    ↓
MergeResult (matched units, conflicts, actions, stats)
```

## Public API

### Main Merge Engine

| Entity | Kind | Description | Location |
|--------|------|-------------|----------|
| `ThreeWayMerger` | class | Main orchestrator implementing all 5 phases: indexing, matching, intent classification, conflict detection, and resolution. | [`engine/three-way-merger.ts:45–618`](./engine/three-way-merger.ts) |

### Conflict Handling

| Entity | Kind | Description | Location |
|--------|------|-------------|----------|
| `ConflictResolver` | class | Rule-based resolver applying Git-style conflict markers and resolution strategies with optional preview and application support. | [`engine/conflict-resolver.ts:34–419`](./engine/conflict-resolver.ts) |
| `AIConflictResolver` | class | Embedding-based resolver analyzing conflicts and suggesting intelligent merge strategies using vector similarity scoring. | [`engine/ai-conflict-resolver.ts:54–334`](./engine/ai-conflict-resolver.ts) |

### Indexing & Normalization

| Entity | Kind | Description | Location |
|--------|------|-------------|----------|
| `MultiVersionIndexer` | class | Indexes three branches (base, branchA, branchB) via DevAgent with per-branch caching and entity aggregation. | [`indexing/multi-version-indexer.ts:124–515`](./indexing/multi-version-indexer.ts) |
| `ContentNormalizer` | class | Normalizes files by handling BOM, encoding, and line endings; computes SHA256 content hashes. | [`indexing/content-normalizer.ts:13–116`](./indexing/content-normalizer.ts) |
| `StructuralNormalizer` | class | Strips comments and whitespace from code via regex; computes structural hash for semantic equivalence. | [`indexing/structural-normalizer.ts:11–43`](./indexing/structural-normalizer.ts) |
| `SignatureGenerator` | class | Generates fully qualified names and parameter signatures for functions and classes; computes signature hashes. | [`indexing/signature-generator.ts:12–202`](./indexing/signature-generator.ts) |
| `LazyEmbeddingCache` | class | On-demand generation and caching of vector embeddings with configurable batch size and cache statistics. | [`indexing/lazy-embedding-cache.ts:12–110`](./indexing/lazy-embedding-cache.ts) |

### Matching

| Entity | Kind | Description | Location |
|--------|------|-------------|----------|
| `FastPathMatcher` | class | O(1) hash-based matching across content, structural, signature, and stable ID levels; covers ~90–95% of units. | [`matching/fast-path-matcher.ts:17–241`](./matching/fast-path-matcher.ts) |
| `SemanticMatcher` | class | Vector cosine similarity matching with 70/30 structural+embedding weighting; handles ~5–10% of remaining units. | [`matching/semantic-matcher.ts:15–190`](./matching/semantic-matcher.ts) |

### Analysis

| Entity | Kind | Description | Location |
|--------|------|-------------|----------|
| `IntentClassifier` | class | Classifies changes into BugFix, Refactoring, FeatureAddition, or APIChange using heuristic pattern evidence. | [`analysis/intent-classifier.ts:23–245`](./analysis/intent-classifier.ts) |
| `ConflictDetector` | class | Detects conflicts by analyzing overlapping changes and intent compatibility; assigns severity and type. | [`analysis/conflict-detector.ts:19–251`](./analysis/conflict-detector.ts) |

### Git Integration

| Entity | Kind | Description | Location |
|--------|------|-------------|----------|
| `GitIntegration` | class | Safe git operations: branch checkout, merge-base discovery, diff calculation, branch restore, and rename detection. | [`integration/git-integration.ts:51–431`](./integration/git-integration.ts) |

## Models

| Entity | Kind | Description | Location |
|--------|------|-------------|----------|
| `CodeUnit` | interface | Universal code unit with id, content, hashes (content/structural/signature), embedding, hierarchy, and metadata. | [`models/code-unit.ts:9–40`](./models/code-unit.ts) |
| `VersionedIndex` | interface | Per-branch index with hash-to-unit maps, signature maps, and filePath reverse lookup for fast entity retrieval. | [`models/versioned-index.ts:9–31`](./models/versioned-index.ts) |
| `MergeResult` | interface | Full merge output containing matched units, conflicts, actions, deleted units, renamed units, and merge statistics. | [`models/merge-result.ts:64–108`](./models/merge-result.ts) |
| `SemanticConflict` | interface | Conflict details with type, severity, file region, involved unit IDs, resolution suggestions, and AI metadata. | [`models/semantic-conflict.ts:30–55`](./models/semantic-conflict.ts) |
| `ChangeIntent` | interface | Intent classification with type (BugFix/Refactoring/Feature/APIChange), confidence score, and evidence list. | [`models/change-intent.ts:22–27`](./models/change-intent.ts) |

## Supporting Types & Enums

| Entity | Kind | Description | Location |
|--------|------|-------------|----------|
| `CodeUnitType` | enum | Discriminator for code unit kind: Function, Class, Interface, Type, Module, File. | [`models/code-unit.ts`](./models/code-unit.ts) |
| `ChangeIntentType` | enum | Change category: BugFix, Refactoring, FeatureAddition, APIChange. | [`models/change-intent.ts`](./models/change-intent.ts) |
| `EvidenceType` | enum | Pattern evidence kind: AddedAsserts, RemovedThrows, RenamedVariables, SignatureChange, etc. | [`models/change-intent.ts`](./models/change-intent.ts) |
| `ConflictSeverity` | enum | Severity level: Low, Medium, High, Critical. | [`models/semantic-conflict.ts`](./models/semantic-conflict.ts) |
| `ConflictType` | enum | Conflict kind: Overlapping, IncompatibleIntents, APIBreaking, DeleteModify. | [`models/semantic-conflict.ts`](./models/semantic-conflict.ts) |
| `ResolutionStrategy` | enum | Strategy choice: TakeA, TakeB, Merge, Manual, AI. | [`models/semantic-conflict.ts`](./models/semantic-conflict.ts) |
| `FastPathMatchLevel` | enum | Match level: ContentMatch, StructuralMatch, SignatureMatch, StableIdMatch, NoMatch. | [`matching/fast-path-matcher.ts`](./matching/fast-path-matcher.ts) |
| `MergeActionType` | enum | Action kind: Keep, Delete, Rename, Add, Conflict. | [`models/merge-result.ts`](./models/merge-result.ts) |

## Dependencies

| Dependency | Kind | Purpose |
|------------|------|---------|
| ~~`src/logging/index.js`~~ (deleted) | internal | Structured logging with `log.i()`, `log.d()`, `log.w()`, `log.e()` |
| ~~`src/utils/fast-hash.js`~~ (deleted) | internal | SHA256 hashing via `hashText()` for content, structural, and signature digests |
| ~~`src/utils/file-ops.js`~~ (deleted) | internal | File I/O via `readBytes()` for raw file reading in ContentNormalizer |
| ~~`src/utils/simd-vector-ops.js`~~ (deleted) | internal | SIMD-optimized cosine similarity and vector normalization |
| ~~`src/core/branch-manager.js`~~ (deleted) | internal | Branch state and metadata management |
| ~~`src/core/di-container.js`~~ (deleted) | internal | Dependency injection for service instantiation |
| ~~`src/core/agent-registry.js`~~ (deleted) | internal | Agent registration and discovery |
| ~~`src/agents/conductor-orchestrator.js`~~ (deleted) | internal | Multi-agent orchestration for DevAgent control |
| ~~`src/semantic/embedding-generator.js`~~ (deleted) | internal | External embedding service for vector generation |
| ~~`src/types/agent.js`~~ (deleted) | internal | TypeScript types for agent interfaces |

## Architecture & Design Patterns

**Five-Phase Pipeline:**
1. **Indexing** — MultiVersionIndexer parallels three branches with DevAgent, applying ContentNormalizer, StructuralNormalizer, SignatureGenerator, and LazyEmbeddingCache.
2. **Fast Path Matching** — FastPathMatcher covers ~90–95% with O(1) lookups across content, structural, signature, and stable ID hashes.
3. **Semantic Matching** — SemanticMatcher handles remaining ~5–10% via vector cosine similarity (70% structural, 30% embedding).
4. **Intent Classification** — IntentClassifier categorizes each change via heuristic evidence patterns.
5. **Conflict Detection & Resolution** — ConflictDetector identifies conflicts; ConflictResolver applies rules; AIConflictResolver provides embedding-based fallback.

**Key Patterns:**
- **Lazy Evaluation** — LazyEmbeddingCache defers embedding generation until needed, reducing startup cost.
- **Multi-Level Hashing** — FastPathMatcher uses four hash levels (content → structural → signature → stable ID) to maximize O(1) matches.
- **Weighted Scoring** — SemanticMatcher combines structural hash distance and embedding cosine similarity (70/30) for nuanced matching.
- **Evidence-Based Classification** — IntentClassifier collects heuristic evidence patterns (added asserts, removed throws, variable renames, signature changes) to classify intent.
- **Severity & Type Matrix** — ConflictDetector uses a 4×4 matrix of intents to classify conflict severity (Low/Medium/High/Critical) and type (Overlapping/IncompatibleIntents/APIBreaking/DeleteModify).

## File Organization

| File | Lines | Purpose |
|------|-------|---------|
| [`index.ts`](./index.ts) | 4 | Module barrel: re-exports indexing, matching, models, analysis, engine, integration |
| [`models/index.ts`](./models/index.ts) | 7 | Models barrel: re-exports all model types and enums |
| [`models/code-unit.ts`](./models/code-unit.ts) | 71 | CodeUnit interface, CodeUnitType enum, CodeStructure interface |
| [`models/change-intent.ts`](./models/change-intent.ts) | 123 | ChangeIntent, ChangeIntentType, EvidenceType enums, factory functions |
| [`models/semantic-conflict.ts`](./models/semantic-conflict.ts) | 156 | SemanticConflict, ConflictSeverity, ConflictType, ResolutionStrategy enums, factory functions |
| [`models/merge-result.ts`](./models/merge-result.ts) | 108 | MergeResult, MergeAction, MergeStats, MergeActionType enums |
| [`models/versioned-index.ts`](./models/versioned-index.ts) | 122 | VersionedIndex interface, createVersionedIndex factory, hash lookup helpers |
| [`indexing/index.ts`](./indexing/index.ts) | 6 | Indexing barrel: re-exports all indexing components |
| [`indexing/content-normalizer.ts`](./indexing/content-normalizer.ts) | 125 | BOM/encoding/line-ending normalization, SHA256 content hashing |
| [`indexing/structural-normalizer.ts`](./indexing/structural-normalizer.ts) | 148 | AST normalization via regex comment/whitespace stripping, structural hash |
| [`indexing/signature-generator.ts`](./indexing/signature-generator.ts) | 202 | Function/class/module signature generation, FQN extraction, parameter hashing |
| [`indexing/lazy-embedding-cache.ts`](./indexing/lazy-embedding-cache.ts) | 130 | On-demand embedding generation with in-memory caching and statistics |
| [`indexing/multi-version-indexer.ts`](./indexing/multi-version-indexer.ts) | 515 | 3-branch parallel indexing via DevAgent with per-branch caching and entity aggregation |
| [`matching/index.ts`](./matching/index.ts) | 3 | Matching barrel: re-exports FastPathMatcher and SemanticMatcher |
| [`matching/fast-path-matcher.ts`](./matching/fast-path-matcher.ts) | 276 | 4-level O(1) hash-based matching (content/structural/signature/stable ID) with statistics |
| [`matching/semantic-matcher.ts`](./matching/semantic-matcher.ts) | 214 | Vector cosine similarity matching with 70/30 structural+embedding weighted scoring |
| [`analysis/index.ts`](./analysis/index.ts) | 2 | Analysis barrel: re-exports ConflictDetector and IntentClassifier |
| [`analysis/intent-classifier.ts`](./analysis/intent-classifier.ts) | 245 | Heuristic intent classification via pattern evidence collection and scoring |
| [`analysis/conflict-detector.ts`](./analysis/conflict-detector.ts) | 251 | Conflict detection, severity assignment, intent compatibility matrix |
| [`engine/index.ts`](./engine/index.ts) | 8 | Engine barrel: re-exports ThreeWayMerger, ConflictResolver, AIConflictResolver |
| [`engine/three-way-merger.ts`](./engine/three-way-merger.ts) | 618 | Main 5-phase orchestrator with rename/delete-modify detection and merge result aggregation |
| [`engine/conflict-resolver.ts`](./engine/conflict-resolver.ts) | 419 | Rule-based resolution with Git-style conflict markers, preview, and application |
| [`engine/ai-conflict-resolver.ts`](./engine/ai-conflict-resolver.ts) | 334 | Embedding-based conflict analysis with vector similarity scoring and intelligent merge heuristics |
| [`integration/index.ts`](./integration/index.ts) | 2 | Integration barrel: re-exports GitIntegration |
| [`integration/git-integration.ts`](./integration/git-integration.ts) | 431 | Safe git operations: checkout, merge-base, diff, branch restore, rename detection |

## Known Limitations

1. **Simple Merge Stub** — `ConflictResolver.attemptSimpleMerge()` returns `null` for most cases; proper diff3/tree-merge is not implemented.
2. **Regex-Based Normalization** — `StructuralNormalizer` uses regex comment removal rather than AST parsing; may mishandle comments inside strings.
3. **Parameter Extraction** — `SignatureGenerator` uses regex for parameter parsing; complex generics and destructured parameters may be missed.
4. **Intent Heuristics** — `IntentClassifier` relies on pattern matching; cannot detect subtle semantic intent changes.
5. **Simplistic AI Heuristic** — `AIConflictResolver` intelligent merge takes the longer version without AST-aware merging.
6. **Sequential Indexing** — `MultiVersionIndexer` indexes branches sequentially to avoid concurrent git checkout conflicts.
7. **Blocking Git Operations** — `GitIntegration` uses synchronous `execSync` for all git operations, blocking the event loop.
8. **External Embedding Dependency** — Vector embeddings require an external `EmbeddingGenerator`; without it, semantic matching and AI resolution are unavailable.