---
module_name: engine
description: "Three-way merge engine with AI-assisted conflict resolution"
status: active
language: typescript
---

# Engine

> Orchestrates 5-phase semantic three-way merge and resolves conflicts using traditional heuristics or AI-powered embedding analysis.

## Overview

The engine module is the core of the semantic merge system. ThreeWayMerger performs a 5-phase merge pipeline: multi-version indexing, fast-path matching, semantic matching, intent classification, and conflict detection. ConflictResolver generates resolution suggestions using strategy-based heuristics and optional AI analysis. AIConflictResolver leverages vector embeddings to compute semantic similarity between conflicting code versions, providing confidence-scored merge suggestions.

## Data Flow

- **Inputs**: Two branch names (branchA, branchB), BranchManager, GitIntegration, and optional ConductorOrchestrator.
- **Processing**: Indexes three branches in parallel, matches code units via hash and embedding similarity, classifies change intents, detects conflicts, and generates merge actions.
- **Outputs**: MergeResult containing matched units, conflicts, merge actions, added/deleted/renamed units, and statistics.

## Public API

| Export | Type | Description | Location |
|--------|------|-------------|----------|
| `ThreeWayMerger` | class | Main 5-phase semantic merge engine | [`three-way-merger.ts:45-618`](./three-way-merger.ts) |
| `ThreeWayMergerConfig` | interface | Configuration for merge phases and thresholds | [`three-way-merger.ts:28-43`](./three-way-merger.ts) |
| `ConflictResolver` | class | Resolves conflicts using heuristics and optional AI | [`conflict-resolver.ts:34-419`](./conflict-resolver.ts) |
| `ConflictResolverConfig` | interface | Configuration for resolution preferences and AI | [`conflict-resolver.ts:23-32`](./conflict-resolver.ts) |
| `AIConflictResolver` | class | Embedding-based conflict analysis and resolution | [`ai-conflict-resolver.ts:54-334`](./ai-conflict-resolver.ts) |
| `AIConflictResolverConfig` | interface | Similarity thresholds and confidence settings | [`ai-conflict-resolver.ts:16-28`](./ai-conflict-resolver.ts) |
| `AIAnalysisResult` | interface | Result of AI conflict analysis | [`ai-conflict-resolver.ts:33-52`](./ai-conflict-resolver.ts) |
| `MultiVersionIndexer` | class | Re-exported from indexing module for convenience | [`index.ts:1-1`](./index.ts) |

## Dependencies

### Internal Modules

| Module | Purpose |
|--------|---------|
| `merge/analysis` | ConflictDetector and IntentClassifier |
| `merge/indexing` | MultiVersionIndexer, LazyEmbeddingCache |
| `merge/matching` | FastPathMatcher, SemanticMatcher |
| `merge/models` | CodeUnit, MergeResult, SemanticConflict, ChangeIntent types |
| `merge/integration` | GitIntegration for file change detection |
| `core/branch-manager` | Branch database management |
| `logging` | Structured logging |
| `utils/fast-hash` | Content hash computation |
| `semantic/embedding-generator` | Embedding generation for AI resolver |

### External Packages

| Package | Purpose |
|---------|---------|
| (none) | No external dependencies |

## Behavioral Properties

| Property | Value |
|----------|-------|
| Default semantic threshold | 0.7 minimum combined score for semantic matching |
| AI confidence threshold | 0.5 minimum for accepting AI resolution |
| Auto-resolve default | Disabled (requires explicit opt-in via config) |

## Error Handling

ThreeWayMerger catches errors during merge and ensures git branch restoration via cleanup. ConflictResolver falls back to manual review when AI resolution fails or confidence is below threshold. AIConflictResolver logs warnings on embedding failures and returns null embeddings gracefully.

## Known Limitations

- Simple merge algorithm (attemptSimpleMerge) is a placeholder; no proper diff3 implementation yet.
- AI-assisted merge uses heuristic code length comparison rather than AST-based merge.
- Delete-modify conflicts use base unit as placeholder for both branch units.

## Exports

- `MultiVersionIndexer`
- `AIConflictResolver`
- `ConflictResolver`
- `diff3Merge`
- `ThreeWayMerger`

## Files

| File | Description |
|------|-------------|
| `ai-conflict-resolver.ts` | AI-powered conflict resolution using embedding similarity and cosine distance |
| `conflict-resolver.ts` | Strategy-based conflict resolution with AI fallback and Git-style conflict markers |
| `index.ts` | Re-exports all engine classes and interfaces |
| `three-way-merger.ts` | Main 5-phase merge orchestrator handling indexing, matching, classification, and conflict detection |
