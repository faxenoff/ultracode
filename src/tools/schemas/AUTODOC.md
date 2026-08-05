# Schemas

Central collection of Zod schemas for validating tool parameters across code analysis, documentation generation, entity management, graph operations, and file modification tools.

## Overview

The schemas module contains all Zod schema definitions that validate and type-check input arguments for MCP tool handlers. Schemas are organized by domain: analysis, autodoc, diagram, entity, graph, graph-metrics, history, index, merge, modification, pattern, semantic, snapshot, taint, and validation. Each schema defines required and optional parameters with descriptions, defaults, and constraints. The central `index.ts` re-exports all schemas for convenient consumption by the tool registry.

## Data Flow

- **Inputs:** Raw `unknown` arguments from MCP protocol requests.
- **Processing:** Zod schema parsing with validation, type coercion, and default value application.
- **Outputs:** Typed argument objects consumed by tool handlers.

## Public API

| Export | Type | Description | Location |
|--------|------|-------------|----------|
| `AnalyzeHotspotsSchema` | const | Hotspot analysis with historical metrics options | [`analysis-schemas.ts:45-50`](./analysis-schemas.ts) |
| `AnalyzeStateChaosSchema` | const | State chaos and race condition analysis params | [`analysis-schemas.ts:53-53`](./analysis-schemas.ts) |
| `JscpdCloneDetectionSchema` | const | Duplicate code detection parameters | [`analysis-schemas.ts:8-8`](./analysis-schemas.ts) |
| `DetectPatternsSchema` | const | Code pattern detection and identification parameters | [`pattern-schemas.ts`](./pattern-schemas.ts) |
| `AutoDocGenerateSchema` | const | LLM documentation generation parameters | [`autodoc-schemas.ts:61-87`](./autodoc-schemas.ts) |
| `GetArchitectureDiagramSchema` | const | Architecture diagram generation parameters | [`diagram-schemas.ts:9-47`](./diagram-schemas.ts) |
| `IndexToolSchema` | const | Project indexing with exclude patterns | [`index-schemas.ts:54-60`](./index-schemas.ts) |
| `SemanticSearchSchema` | const | Natural language semantic search | [`semantic-schemas.ts:8-13`](./semantic-schemas.ts) |
| `AnalyzeCodeImpactSchema` | const | Code change impact analysis | [`semantic-schemas.ts:22-37`](./semantic-schemas.ts) |
| `ModifyEntityCodeSchema` | const | Entity code modification params | [`modification-schemas.ts:8-15`](./modification-schemas.ts) |
| `RenameSymbolSchema` | const | Symbol rename with reference updates | [`modification-schemas.ts:55-62`](./modification-schemas.ts) |
| `SemanticMergeSchema` | const | Semantic branch merge with conflict resolution | [`merge-schemas.ts:8-21`](./merge-schemas.ts) |
| `ValidateFileSchema` | const | Single file syntax validation | [`validation-schemas.ts:8-18`](./validation-schemas.ts) |
| `GetEntityHistorySchema` | const | Entity change history via Prolly Tree | [`history-schemas.ts:11-11`](./history-schemas.ts) |
| `TaintAnalysisSchema` | const | Taint analysis with category, offset/limit pagination | [`taint-schemas.ts`](./taint-schemas.ts) |
| `GraphMetricsSchema` | const | Graph metrics: pagerank, louvain, centrality, bus_factor | [`graph-metrics-schemas.ts`](./graph-metrics-schemas.ts) |
| `AnalyzeApiImpactSchema` | const | Unified API impact analysis across Swagger, Protobuf, GraphQL | [`semantic-schemas.ts:29-39`](./semantic-schemas.ts) |
| `AnalyzeSwaggerImpactSchema` | const | Swagger/OpenAPI spec change impact analysis | [`semantic-schemas.ts:12-25`](./semantic-schemas.ts) |
| `GetDatabaseSchemaSchema` | const | Database schema reconstruction with ORM, migrations, drift detection | [`semantic-schemas.ts:73-78`](./semantic-schemas.ts) |
| `DEFAULT_EXCLUDE_PATTERNS` | const | Default file exclusion patterns for indexing | [`index-schemas.ts:9-60`](./index-schemas.ts) |


### Added Entities

- **GrepIndexSchema** — `missing-tool-schemas.ts:12-20`
- **BatchModifySchema** — `missing-tool-schemas.ts:26-47`
- **BatchRenameSchema** — `missing-tool-schemas.ts:53-68`
- **SecurityScanSchema** — `missing-tool-schemas.ts:74-76`
- **GetReviewContextSchema** — `missing-tool-schemas.ts:82-86`
- **DetectArchitectureLayersSchema** — `missing-tool-schemas.ts:92-94`
- **GenerateOnboardingSchema** — `missing-tool-schemas.ts:100-103`
- **AutoDocBatchGenerateSchema** — `missing-tool-schemas.ts:109-114`
- **SetupEmbeddingSchema** — `missing-tool-schemas.ts:120-128`
- **AnalyzeStacktraceSchema** — `stacktrace-schemas.ts:8-24`
- **SpawnAgentWorktreeSchema** — `worktree-schemas.ts:7-12`
- **ListWorktreeAgentsSchema** — `worktree-schemas.ts:14-16`
- **CleanupWorktreeSchema** — `worktree-schemas.ts:18-21`
- **GetWorktreeInfoSchema** — `worktree-schemas.ts:23-25`

## Dependencies

### Internal Modules

| Module | Purpose |
|--------|---------|
| (none) | Schemas are self-contained with no internal dependencies |

### External Packages

| Package | Purpose |
|---------|---------|
| `zod` | Schema definition and validation |

## Behavioral Properties

| Property | Value |
|----------|-------|
| Total schemas | 65+ validation schemas |
| Schema groups | 16 domain files (analysis, autodoc, diagram, entity, graph, graph-metrics, history, index, merge, modification, pattern, semantic, snapshot, taint, validation) |
| Validation approach | Zod parse with descriptive error messages |

## Error Handling

Invalid inputs produce Zod validation errors with field-level messages describing what was expected. All schemas use `.describe()` for self-documenting parameters visible in MCP tool listings.

## Known Limitations

- Schemas validate structure only; semantic validation (e.g., file existence) is handled by handlers.
- No runtime schema composition; each tool has a standalone schema definition.

## Exports

- `AnalyzeHotspotsSchema`
- `AnalyzeStateChaosSchema`
- `JscpdCloneDetectionSchema`
- `SuggestRefactoringSchema`
- `AutoDocChangelogSchema`
- `AutoDocDetectLanguageSchema`
- `AutoDocGenerateSchema`
- `AutoDocGetSchema`
- `AutoDocInitSchema`
- `AutoDocInstallHooksSchema`
- `AutoDocSaveSchema`
- `AutoDocSearchSchema`
- `AutoDocStatusSchema`
- `AutoDocSyncSchema`
- `AutoDocValidateSchema`
- `GetArchitectureDiagramSchema`
- `ListEntitiesToolSchema`
- `ListRelationshipsToolSchema`
- `QueryToolSchema`
- `GraphMetricsSchema`
- `ClearBusTopicSchema`
- `GetBusStatsSchema`
- `GetGraphHealthSchema`
- `GetGraphSchema`
- `GetGraphStatsSchema`
- `CheckoutCommitSchema`
- `DiffCommitsSchema`
- `GetEntityHistorySchema`
- `ListCommitsSchema`
- `CleanIndexSchema`
- `DEFAULT_EXCLUDE_PATTERNS`
- `GetAgentMetricsSchema`
- `IndexToolSchema`
- `AnalyzeMergeConflictsSchema`
- `GetMergeSuggestionsSchema`
- `GetSemanticMergeInfoSchema`
- `SemanticMergeSchema`
- `AddMemberSchema`
- `CopyFileSchema`
- `CreateFileSchema`
- `ModifyEntityCodeSchema`
- `RenameFileSchema`
- `RenameSymbolSchema`
- `SplitFileSchema`
- `SynthesizeFilesSchema`
- `CheckEntityPatternsSchema`
- `DetectPatternsSchema`
- `AnalyzeApiImpactSchema`
- `AnalyzeCodeImpactSchema`
- `AnalyzeSwaggerImpactSchema`

## Files

| File | Description |
|------|-------------|
| `index.ts` | Central re-export of all schemas |
| `analysis-schemas.ts` | Schemas for code analysis, clone detection, hotspots, state chaos |
| `autodoc-schemas.ts` | Schemas for documentation generation and management |
| `diagram-schemas.ts` | Schemas for architecture diagram generation |
| `entity-schemas.ts` | Schemas for entity listing, relationships, queries |
| `graph-schemas.ts` | Schemas for knowledge graph and data bus operations |
| `graph-metrics-schemas.ts` | Schema for graph_metrics tool (metric, topN, minCommunitySize, persist) |
| `history-schemas.ts` | Schemas for entity history and commit time travel |
| `index-schemas.ts` | Schemas for indexing and exclude patterns |
| `merge-schemas.ts` | Schemas for semantic merging and conflict resolution |
| `modification-schemas.ts` | Schemas for code modification and file operations |
| `pattern-schemas.ts` | Schemas for pattern detection and analysis |
| `semantic-schemas.ts` | Schemas for semantic search and code analysis |
| `snapshot-schemas.ts` | Schemas for snapshot management |
| `taint-schemas.ts` | Schemas for taint analysis |
| `validation-schemas.ts` | Schemas for file validation |