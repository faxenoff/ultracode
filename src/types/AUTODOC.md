---
module_name: types
description: "Core TypeScript type definitions and interfaces for the ultracode multi-agent architecture"
status: active
language: typescript
entry_point: index.ts
exports: [AgentType, AgentStatus, Agent, AgentPool, ParsedEntity, ParseResult, SupportedLanguage, Entity, EntityType, Relationship, RelationType, GraphStorage, VectorEmbedding, SimilarityResult, EmbeddingConfig, GraphQuery, QueryResult, QueryOperations, ChaosMetrics, StatePattern, RefactoringPlan, LayeredIndexConfig, BranchDelta, VectorDelta]
dependencies: [config]
tags: [type-definitions, interfaces, enums, data-structures, compile-time-only]
---

# Types Module

> The type-definition backbone of ultracode: 240+ pure TypeScript declarations consumed by every runtime module, with zero runtime code or side effects.

## Overview

The `src/types/` module provides all shared type contracts for the multi-agent code-analysis platform. It covers agent orchestration, code parsing (12+ languages), graph storage, semantic vector search, query engine, state chaos analysis, layered delta indexing, and WASM/Faiss interop. Every file is purely declarative — no classes are instantiated, no I/O is performed, and everything is erased at compile time (the sole exception is `AgentBusyError` in `errors.ts` and helper factory functions in `layered.ts` / `storage.ts`). There is currently no barrel `index.ts`; consumers import directly from individual files.

## Data Flow

### Inputs

| Source | Data | Type |
|--------|------|------|
| ~~`config/constants.ts`~~ (deleted) | Numeric constants (cache sizes, pool sizes, vector dimensions) | `const` values |

### Processing

This is a passive type-definition module. It does not process data at runtime. Types are consumed at compile time by TypeScript's structural type system.

### Outputs

| Target | Data | Type |
|--------|------|------|
| `agents/*` | Agent, AgentTask, AgentPool, AgentMetrics | interfaces |
| `parsers/*` | ParsedEntity, ParseResult, SupportedLanguage, EntityRelationship | interfaces/types |
| `storage/*` | Entity, Relationship, GraphStorage, GraphSchema | interfaces/enums |
| `semantic/*` | VectorEmbedding, EmbeddingConfig, SimilarityResult | interfaces/types |
| `query/*` | GraphQuery, QueryResult, QueryOperations | interfaces |
| `tools/*` | ChaosMetrics, StatePattern, RefactoringPlan | interfaces/types |
| `indexing/*` | BranchDelta, VectorDelta, LayeredIndexConfig | interfaces |

## Public API

### agent.ts — Agent Orchestration

| Export | Type | Description | Location |
|--------|------|-------------|----------|
| `AgentType` | enum | 8 variants: COORDINATOR, DEV, DORA, INDEXER, MERGE, PARSER, QUERY, SEMANTIC | [`agent.ts:6-15`](./agent.ts) |
| `AgentStatus` | enum | 4 variants: IDLE, BUSY, ERROR, SHUTDOWN | [`agent.ts:17-22`](./agent.ts) |
| `Agent` | interface | Full agent contract: lifecycle, task processing, communication, resource mgmt | [`agent.ts:53-76`](./agent.ts) |
| `AgentPool` | interface | Agent registry with routing and broadcasting | [`agent.ts:78-90`](./agent.ts) |
| `AgentMetrics` | interface | Per-agent performance counters | [`agent.ts:99-108`](./agent.ts) |

See [`agent.ts`](./agent.ts) for complete list (AgentCapabilities, AgentMessage, AgentTask, ResourceConstraints).

### parser.ts — Code Parsing & AST

| Export | Type | Description | Location |
|--------|------|-------------|----------|
| `SUPPORTED_LANGUAGES` | const | 17 languages: TS, JS, Python, Go, Rust, Java, C#, C++, Swift, Kotlin, Zig, etc. | [`parser.ts:44-456`](./parser.ts) |
| `SupportedLanguage` | type | Union of all supported language strings | [`parser.ts:67-67`](./parser.ts) |
| `ParsedEntity` | interface | Core parsed entity with 45+ properties (name, type, location, AST data, embeddings) | [`parser.ts:76-456`](./parser.ts) |
| `ParseResult` | interface | File parse result: entities, relationships, patterns, timing | [`parser.ts:461-494`](./parser.ts) |
| `EntityRelationship` | interface | Inter-entity relationships with 20+ relation types | [`parser.ts:626-676`](./parser.ts) |

See [`parser.ts`](./parser.ts) for complete list (FileChange, ParserTask, ParserOptions, CacheEntry, ParserStats, PatternAnalysis).

### storage.ts — Entity/Relationship Storage

| Export | Type | Description | Location |
|--------|------|-------------|----------|
| `EntityType` | enum | 11 variants: FUNCTION, CLASS, METHOD, INTERFACE, TYPE, IMPORT, EXPORT, VARIABLE, CONSTANT, PACKAGE, COMMENT | [`storage.ts:35-47`](./storage.ts) |
| `RelationType` | enum | 20 variants including reverse relations and NgRx state management | [`storage.ts:52-77`](./storage.ts) |
| `Entity` | interface | Core graph entity with location, metadata, complexity, embeddings | [`storage.ts:82-128`](./storage.ts) |
| `Relationship` | interface | Edge between entities with type, metadata, weight | [`storage.ts:133-148`](./storage.ts) |
| `GraphStorage` | interface | Full storage contract: CRUD, queries, maintenance, 20+ methods | [`storage.ts:322-389`](./storage.ts) |

See [`storage.ts`](./storage.ts) for complete list (FileInfo, EntityQuery, RelationshipQuery, GraphQuery, GraphQueryResult, EntityChange, GraphSchema, StorageMetrics, BatchResult, CacheEntry, PoolStats, CacheManager, ConnectionPool, PerformanceMetric, VectorEmbedding).

### semantic.ts — Vector Search & Embeddings

| Export | Type | Description | Location |
|--------|------|-------------|----------|
| `VectorEmbedding` | interface | Embedding with id, content, vector (Float32Array), metadata | [`semantic.ts:29-35`](./semantic.ts) |
| `SimilarityResult` | interface | Search result with similarity score | [`semantic.ts:46-51`](./semantic.ts) |
| `EmbeddingProviderKind` | type | Provider union: ollama, openai, cloudru, huggingface, tei, ovms, vllm, llamacpp, mlx, auto | [`semantic.ts:182-242`](./semantic.ts) |
| `EmbeddingConfig` | interface | Full embedding config with per-provider options (ollama, openai, tei, ovms, vllm, llamacpp, mlx) | [`semantic.ts:263-350`](./semantic.ts) |
| `SemanticOperations` | interface | Semantic search contract: search, similarity, clones, cross-language | [`semantic.ts:355-372`](./semantic.ts) |

See [`semantic.ts`](./semantic.ts) for complete list (HybridResult, SemanticAnalysis, SimilarCode, CloneGroup, CrossLangResult, RefactoringSuggestion, FusionOptions, SemanticResult, VectorStoreConfig, WorkerEmbeddingConfig, EmbeddingPoolStats, SemanticTaskType, SemanticMetrics).

### query.ts — Graph Queries & Impact Analysis

| Export | Type | Description | Location |
|--------|------|-------------|----------|
| `QueryOperations` | interface | 11 methods: entity lookup, traversal, dependencies, cycles, hotspots, impact | [`query.ts:149-170`](./query.ts) |
| `GraphQuery` | interface | Query descriptor with type, operation, params, hash | [`query.ts:178-185`](./query.ts) |
| `QueryResult` | interface | Result wrapper with execution metadata and cache info | [`query.ts:190-198`](./query.ts) |
| `ImpactAnalysis` | interface | Impact result: direct/indirect impacts, risk level, affected files | [`query.ts:118-125`](./query.ts) |
| `Hotspot` | interface | Code hotspot with score and metrics (relationships, complexity, change frequency) | [`query.ts:104-113`](./query.ts) |

See [`query.ts`](./query.ts) for complete list (EntityFilter, Path, Graph, DependencyTree, DependencyNode, Cycle, Change, RippleEffect, OptimizedQuery, CacheStats, ConnectionPoolConfig, StreamOptions, QueryMetrics).

### chaos-analysis.ts — State Chaos Detection

| Export | Type | Description | Location |
|--------|------|-------------|----------|
| `ChaosMetrics` | interface | Chaos score, coupling, defensive patterns, mutation spread, divergence risk | [`chaos-analysis.ts:174-190`](./chaos-analysis.ts) |
| `StatePattern` | interface | Detected state variable with operations and related identifiers | [`chaos-analysis.ts:72-78`](./chaos-analysis.ts) |
| `RefactoringPlan` | interface | Complete plan: strategy, steps, new components, benefits, risks | [`chaos-analysis.ts:255-265`](./chaos-analysis.ts) |
| `ChaosAnalysisResult` | interface | Full analysis output: pattern, flow map, metrics, race analysis, plan, summary | [`chaos-analysis.ts:307-315`](./chaos-analysis.ts) |
| `RaceAnalysis` | interface | Race condition detection: readers, writers, async writers, conflicts | [`chaos-analysis.ts:388-398`](./chaos-analysis.ts) |

See [`chaos-analysis.ts`](./chaos-analysis.ts) for complete list (StateOperationType, AngularStatePattern, TechnologyContext, StateOperation, StateOrigin, StateFlowNode, StateFlowEdge, StateFlowMap, CouplingMetrics, DefensivePatterns, DivergenceRisk, RefactoringStrategy, RefactoringStep, ProposedComponent, RefactoringBenefits, ChaosAnalysisSummary, ChaosAnalysisOptions, RacePatternType, RaceRisk, MutationPoint, RaceConflict, RaceRiskFactors).

### layered.ts — Delta-Based Indexing

| Export | Type | Description | Location |
|--------|------|-------------|----------|
| `BranchDelta` | interface | Per-branch entity/relationship changes with commit tracking | [`layered.ts:49-67`](./layered.ts) |
| `VectorDelta` | interface | Per-branch embedding changes (added/modified/deleted) | [`layered.ts:108-129`](./layered.ts) |
| `LayeredIndexConfig` | interface | Config for 3-layer architecture: persistence, compaction, scheduling | [`layered.ts:135-166`](./layered.ts) |
| `LayeredIndexConfigPresets` | const | 4 preset factories: default, development, production, server | [`layered.ts:172-246`](./layered.ts) |
| `createEmptyBranchDelta` | function | Factory for empty BranchDelta | [`layered.ts:335-353`](./layered.ts) |

See [`layered.ts`](./layered.ts) for complete list (EntityDelta, RelationshipDelta, WorkingDelta, FileChangeType, FileUpdate, GitFileChange, GitDiffResult, createEmptyEntityDelta, createEmptyRelationshipDelta, createEmptyVectorDelta, createEmptyWorkingDelta).

### Supporting Files

| Export | Type | Description | Location |
|--------|------|-------------|----------|
| `AgentBusyError` | class | Error subclass for busy agents with retry details | [`errors.ts:15-23`](./errors.ts) |
| `AgentBusyDetails` | interface | Busy reason, queue length, memory usage | [`errors.ts:3-13`](./errors.ts) |
| `ASTNode` | interface | Generic AST node interface (tree-sitter compatible) | [`parser-ast-types.ts:16-41`](./parser-ast-types.ts) |
| `MagicMethodGroups` | const | Python magic method categories (10 groups) | [`parser-python-types.ts:15-45`](./parser-python-types.ts) |
| `PythonClassInfo` | interface | Python class metadata: type, bases, MRO, abstract methods | [`parser-python-types.ts:148-191`](./parser-python-types.ts) |
| `DiffSimdModule` | interface | WASM SIMD diff operations | [`wasm-modules.d.ts:9-11`](./wasm-modules.d.ts) |
| `VectorOpsSimdModule` | interface | WASM SIMD vector operations (cosine, dot product, normalize, top-k) | [`wasm-modules.d.ts:14-19`](./wasm-modules.d.ts) |

See [`parser-python-types.ts`](./parser-python-types.ts), [`faiss-node.d.ts`](./faiss-node.d.ts), [`global.d.ts`](./global.d.ts) for complete lists.

## Dependencies

### Internal Modules

| Module | Purpose | Interaction |
|--------|---------|-------------|
| `config/constants` | Numeric constants (CACHE_TTL_MS, VECTOR_DIMENSIONS, DATABASE pool sizes) | Imported by `query.ts`, `semantic.ts`, `storage.ts` |
| `logging` | Logger instance | Imported by `storage.ts` (log helper in `parsedEntityToEntity`) |

### External Packages

| Package | Purpose |
|---------|---------|
| `@types/bun` | Bun runtime globals referenced in `global.d.ts` |
| `faiss-napi` | NAPI bindings for Faiss vector index (ambient module declaration) |

## Configuration

No runtime configuration — pure type definitions. The only configurable values are constants re-exported from ~~`config/constants.ts`~~ (deleted) (e.g., `VECTOR_DIMENSIONS`, `MAX_BATCH_SIZE`, `DEFAULT_CACHE_TTL`).

## Behavioral Properties

| Property | Value |
|----------|-------|
| Async | No — compile-time only (except `layered.ts` factory functions and `storage.ts` helper) |
| Thread Safety | N/A — no runtime code |
| Idempotency | N/A |
| Side Effects | None |
| State | Stateless |

## Error Handling

No runtime error handling — type errors caught at compile time. The only exception is `AgentBusyError` (in `errors.ts`), a concrete `Error` subclass thrown at runtime by agent code.

## Observability

No runtime observability — type-only module.

## Known Limitations

- No barrel `index.ts` — consumers must import from individual files, creating tight coupling to internal file structure.
- `ParsedEntity` has 45+ optional properties, making it difficult to know which fields are populated for a given language.
- `global.d.ts` declares 100+ environment variables; not all are used in practice.
- Layer 2 (Working Deltas) in `layered.ts` is marked `[FUTURE]` with 3 TODO comments — not yet implemented.
- `parser-ast-types.ts` contains deprecated tree-sitter compatibility types kept for backward compat.
- WASM module interfaces assume dynamic loading; actual `.wasm` files may not exist at compile time.
- Types provide no runtime validation; consumer modules are responsible for data correctness.

## TypeScript Notes

### Module Boundary

There is no `index.ts` barrel file. All consumers import directly from individual type files:

```typescript
import type { Agent, AgentType } from './types/agent.js';
import type { ParsedEntity, ParseResult } from './types/parser.js';
import type { Entity, Relationship, GraphStorage } from './types/storage.js';
import type { VectorEmbedding, EmbeddingConfig } from './types/semantic.js';
```

Cross-file re-exports exist in three places:
- `storage.ts` re-exports `ParsedEntity` from `parser.ts`
- `query.ts` re-exports `Entity`, `Relationship` from `storage.ts`
- `parser.ts` re-exports AST types from `parser-ast-types.ts` and Python types from `parser-python-types.ts`

## Files

| File | Description |
|------|-------------|
| [`agent.ts`](./agent.ts) | Agent orchestration: types, statuses, capabilities, pools, metrics (109 lines) |
| [`chaos-analysis.ts`](./chaos-analysis.ts) | State chaos analysis: operations, patterns, flow maps, metrics, race detection, refactoring (411 lines) |
| [`errors.ts`](./errors.ts) | AgentBusyError class and details interface (23 lines) |
| [`faiss-node.d.ts`](./faiss-node.d.ts) | Ambient module declaration for faiss-napi NAPI bindings (62 lines) |
| [`global.d.ts`](./global.d.ts) | Global declarations: 100+ env vars, Bun globals, fetch/stream APIs |
| [`layered.ts`](./layered.ts) | Three-layer delta indexing: entity/relationship/vector deltas, config presets, factory helpers (394 lines) |
| [`parser.ts`](./parser.ts) | Code parsing: ParsedEntity (45+ props), ParseResult, relationships, patterns, stats (729 lines) |
| [`parser-ast-types.ts`](./parser-ast-types.ts) | Generic AST node interface and deprecated tree-sitter compat types (88 lines) |
| [`parser-python-types.ts`](./parser-python-types.ts) | Python-specific: magic methods, class/method info, import deps, analysis config |
| [`query.ts`](./query.ts) | Graph queries: filters, traversal, dependencies, cycles, hotspots, impact, caching (256 lines) |
| [`semantic.ts`](./semantic.ts) | Semantic search: embeddings, similarity, clones, cross-language, 8 provider configs (395 lines) |
| [`storage.ts`](./storage.ts) | Graph storage: entities, relationships, schemas, CRUD interface, cache, connection pool |
| [`wasm-modules.d.ts`](./wasm-modules.d.ts) | WASM SIMD interfaces: diff and vector operations (20 lines) |
