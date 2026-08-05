# Indexer

## 🤖 Overview

The `indexer` module provides a set of functions for resolving entity references and managing relationships between entities. It is used by developers to efficiently index and query entities within a codebase.

The `indexer` module is structured around several key files, each handling specific aspects of entity resolution and relationship management. These files include `entity-resolution.ts`, `external-placeholder.ts`, `git-event-handlers.ts`, `relationship-builder.ts`, `sem-id.ts`, and `stable-id.ts`.

## 🤖 Architecture

```
  +---------------------+
  | entity-resolution.ts |
  +---------------------+
  |     +-----------------+
  |     | external-placeholder.ts |
  |     +-----------------+
  |     +-----------------+
  |     | git-event-handlers.ts |
  |     +-----------------+
  |     +-----------------+
  |     | relationship-builder.ts |
  |     +-----------------+
  |     +-----------------+
  |     | sem-id.ts |
  |     +-----------------+
  |     +-----------------+
  |     | stable-id.ts |
  |     +-----------------+
  +---------------------+
```

## 🤖 Flow

```
  +---------------------+
  | entity-resolution.ts |
  +---------------------+
  |     +-----------------+
  |     | external-placeholder.ts |
  |     +-----------------+
  |     +-----------------+
  |     | git-event-handlers.ts |
  |     +-----------------+
  |     +-----------------+
  |     | relationship-builder.ts |
  |     +-----------------+
  |     +-----------------+
  |     | sem-id.ts |
  |     +-----------------+
  |     +-----------------+
  |     | stable-id.ts |
  |     +-----------------+
  +---------------------+
```

## 🤖 Entity Listing

### Function
- **absolutePaths** — Resolves relative paths to absolute paths for files `git-event-handlers.ts:37-37`
- **addEntitiesToNameMap** — Incrementally adds entities to both byName and bySuffix maps `entity-resolution.ts:42-62`
- **baseKey** — Not present in the provided code snippet `relationship-builder.ts:97-97`
- **buildEntityNameMap** — Builds a map of entity names to their instances for efficient lookup `entity-resolution.ts:21-29`
- **buildRelationships** — Builds relationships from parsed entities and storage entities `relationship-builder.ts:16-207`
- **containers** — Filters candidates to those with types that are containers `entity-resolution.ts:132-132`
- **createExternalPlaceholder** — Creates a placeholder entity for an external reference `external-placeholder.ts:60-99`
- **files** — List of changed files `git-event-handlers.ts:118-118`, `git-event-handlers.ts:119-119`
- **fileStem** — File stem for generating semIds `sem-id.ts:86-90`
- **generateRefId** — Function to generate reference IDs `sem-id.ts:145-147`
- **generateSemId** — Function to generate semantic IDs `sem-id.ts:108-139`
- **getChangedFilesBetweenBranches** — Parses the output of git diff to get files that differ between branches `git-event-handlers.ts:105-126`
- **handleBranchChange** — Switches to a new branch, retrieves changed files, and triggers reindexing for those files `git-event-handlers.ts:131-179`
- **handleDebouncedEmbeddingGeneration** — Handles debounced file changes for embedding generation, called after user stops editing `git-event-handlers.ts:74-100`
- **handleUncommittedChanges** — Handles uncommitted file changes detected by GitWatcher, triggering incremental reindexing for changed files `git-event-handlers.ts:29-66`
- **ifaceKey** — Not present in the provided code snippet `relationship-builder.ts:118-118`
- **initXXHash** — Initialize xxHash (delegates to fast-hash.ts) `stable-id.ts:25-27`
- **parseExternalId** — Parses an external ID string into source and symbol components `external-placeholder.ts:19-50`
- **placeholders** — Array to collect new placeholder entities `external-placeholder.ts:213-213`
- **processExternalRelationships** — Processes external relationships by resolving placeholders and updating relationships `external-placeholder.ts:111-136`
- **realEntities** — Filters entities to separate placeholders and real entities `external-placeholder.ts:214-214`
- **refKey** — Represents the key used to find referenced entities in the entity map `relationship-builder.ts:55-55`
- **resolveByNameAndLine** — Resolves an entity by name, optionally using line number for disambiguation `entity-resolution.ts:81-151`
- **resolveExternalPlaceholders** — Resolves placeholders by finding matching real entities and updating relationships, then deletes placeholders `external-placeholder.ts:194-255`
- **resolveOrCreatePlaceholder** — Resolves or creates placeholders for external IDs based on existing entities or by creating new placeholders `external-placeholder.ts:141-178`
- **sameFile** — Filters candidates to those with the same file path as the source file `entity-resolution.ts:122-122`
- **scheduleEmbeddingGeneration** — Schedules the generation of embeddings with a debounce period and abort controller `git-event-handlers.ts:194-221`
- **stableEntityId** — Generate semantic entity ID (Zig-compatible) `stable-id.ts:41-56`
- **stableRelationshipId** — Generate stable relationship ID based on source, target, and type `stable-id.ts:62-64`
- **targetKey** — Not present in the provided code snippet `relationship-builder.ts:143-148`
- **triggerEmbeddingGeneration** — Handles debounced file changes for embedding generation, called after user stops editing (debounce period elapsed) `git-event-handlers.ts:227-249`
- **typeAbbrev** — 2-char type abbreviation for semId encoding `sem-id.ts:77-79`

### Interface
- **EmbeddingSchedulerContext** — Represents the context for scheduling embedding generation, including debounce period, abort controller, and pending generation status `git-event-handlers.ts:181-188`
- **GitEventContext** — Represents the context for handling Git events, including agent ID, current repository path, and branch manager `git-event-handlers.ts:19-23`
- **ParentContext** — Parent context for building hierarchical semIds `sem-id.ts:22-26`
- **PlaceholderResolutionResult** — Defines the result of resolving placeholders, including counts and unresolved placeholders `external-placeholder.ts:187-192`

### Type_alias
- **OrdinalMap** — Per-file ordinal tracker for disambiguating duplicate names in the same scope `sem-id.ts:29-29`

### Import_decl
- **../../core/branch-manager.js** — Imports `../../core/branch-manager.js` from `../../core/branch-manager.js`. `git-event-handlers.ts:14-14`
- **../../core/knowledge-bus.js** — Imports `../../core/knowledge-bus.js` from `../../core/knowledge-bus.js`. `git-event-handlers.ts:15-15`
- **../../logging/index.js** — Imports `../../logging/index.js` from `../../logging/index.js`. `git-event-handlers.ts:16-16`
- **../../types/parser.js** — Imports `../../types/parser.js` from `../../types/parser.js`. `relationship-builder.ts:9-9`
- **../../types/storage.js** — Imports `../../types/storage.js` from `../../types/storage.js`. `entity-resolution.ts:8-8`, `external-placeholder.ts:8-8`, `external-placeholder.ts:9-9`, `relationship-builder.ts:10-10`, `relationship-builder.ts:11-11`, `stable-id.ts:8-8`
- **../../utils/fast-hash.js** — Imports `../../utils/fast-hash.js` from `../../utils/fast-hash.js`. `stable-id.ts:9-9`
- **../../utils/runtime-detection.js** — Imports `../../utils/runtime-detection.js` from `../../utils/runtime-detection.js`. `git-event-handlers.ts:17-17`
- **./sem-id.js** — Imports `./sem-id.js` from `./sem-id.js`. `stable-id.ts:10-10`
- **./stable-id.js** — Imports `./stable-id.js` from `./stable-id.js`. `external-placeholder.ts:10-10`
- **nanoid** — Imports `nanoid` from `nanoid`. `relationship-builder.ts:8-8`
- **node:child_process** — Imports `node:child_process` from `node:child_process`. `git-event-handlers.ts:12-12`
- **node:path** — Imports `node:path` from `node:path`. `git-event-handlers.ts:13-13`, `sem-id.ts:15-15`

### Property
- **abortController** — Represents the abort controller for managing the cancellation of embedding generation `git-event-handlers.ts:184-184`
- **agentId** — Stores the ID of the agent handling the Git event `git-event-handlers.ts:20-20`, `git-event-handlers.ts:182-182`
- **branchManager** — Stores the branch manager for managing branches `git-event-handlers.ts:22-22`
- **currentRepositoryPath** — Stores the current path of the repository `git-event-handlers.ts:21-21`
- **debouncePeriodMs** — Represents the debounce period in milliseconds for scheduling embedding generation `git-event-handlers.ts:183-183`
- **deleteEntity** — Deletes a placeholder by its ID `external-placeholder.ts:200-200`
- **entityType** — Type of the entity `sem-id.ts:25-25`
- **fromId** — Represents the fromId property in the relationship type `external-placeholder.ts:112-112`
- **fromId** — Returns a promise of an array of objects containing placeholder details `external-placeholder.ts:198-198`
- **getAllEntities** — Retrieves all entities from the storage `external-placeholder.ts:195-195`
- **getRelationships** — Retrieves relationships from the storage based on the toId `external-placeholder.ts:196-198`
- **id** — Represents the ID of an entity `external-placeholder.ts:112-112`, `external-placeholder.ts:198-198`
- **name** — Name of the entity `sem-id.ts:24-24`
- **pendingGeneration** — Indicates whether embedding generation is pending `git-event-handlers.ts:185-185`
- **relationshipsUpdated** — Counts the number of relationships that were updated during placeholder resolution `external-placeholder.ts:191-191`
- **resolved** — Counts the number of placeholders that were resolved `external-placeholder.ts:189-189`
- **semId** — Semantic ID (SemId) generation — Zig-compatible entity IDs `sem-id.ts:23-23`
- **setAbortController** — Sets the abort controller for managing the cancellation of embedding generation `git-event-handlers.ts:187-187`
- **setPendingGeneration** — Sets the pending generation flag `git-event-handlers.ts:186-186`
- **source** — Represents the source component of an external ID `external-placeholder.ts:19-19`
- **symbol** — Represents the symbol component of an external ID `external-placeholder.ts:19-19`
- **toId** — Represents the toId property in the relationship type `external-placeholder.ts:112-112`
- **toId** — Represents a string identifier for a placeholder `external-placeholder.ts:197-197`
- **toId** — Returns a promise of an array of objects containing placeholder details `external-placeholder.ts:198-198`
- **toId** — Updates a relationship by changing the toId of a placeholder `external-placeholder.ts:199-199`
- **totalPlaceholders** — Counts the total number of placeholders `external-placeholder.ts:188-188`
- **type** — Represents the type of an entity `external-placeholder.ts:112-112`
- **type** — Represents the type of an entity, specifically an import type `external-placeholder.ts:198-198`
- **unresolved** — Stores the names of placeholders that could not be resolved `external-placeholder.ts:190-190`
- **updateRelationship** — Updates a relationship by changing the toId of a placeholder `external-placeholder.ts:199-199`

## Data Flow

- **Inputs**: Parsed entities from ParserAgent, raw relationships from parsers, Git change events.
- **Processing**: Maps entity names for O(1) lookup, resolves references by name/line/file proximity, creates placeholder entities for external references, builds typed relationships, generates stable IDs via xxHash.
- **Outputs**: Resolved entity IDs, `Relationship[]` arrays for graph storage, placeholder entities for unresolved external references.

## Public API

| Export | Type | Description | Location |
|--------|------|-------------|----------|
| `buildEntityNameMap` | function | Builds name-to-entity map for O(1) lookup | [`entity-resolution.ts:21-29`](./entity-resolution.ts) |
| `addEntitiesToNameMap` | function | Incrementally adds entities to name and suffix maps (O(k)) | [`entity-resolution.ts:42-62`](./entity-resolution.ts) |
| `resolveByNameAndLine` | function | Resolves entity by name with line/file/container disambiguation | [`entity-resolution.ts:81-145`](./entity-resolution.ts) |
| `buildRelationships` | function | Builds relationships from parsed entities and storage entities | [`relationship-builder.ts:16-190`](./relationship-builder.ts) |
| `parseExternalId` | function | Parses external ID into source and symbol (Windows-safe) | [`external-placeholder.ts:19-19`](./external-placeholder.ts) |
| `createExternalPlaceholder` | function | Creates placeholder entity for unresolved external reference | [`external-placeholder.ts:60-99`](./external-placeholder.ts) |
| `processExternalRelationships` | function | Replaces external IDs with real or placeholder entity IDs | [`external-placeholder.ts:111-112`](./external-placeholder.ts) |
| `resolveExternalPlaceholders` | function | Post-indexing resolution of placeholder entities to real entities | [`external-placeholder.ts:194-201`](./external-placeholder.ts) |
| `initXXHash` | function | Initializes xxHash WASM instance (call once at startup) | [`stable-id.ts:25-27`](./stable-id.ts) |
| `stableEntityId` | function | Generates deterministic entity ID from properties | [`stable-id.ts:41-56`](./stable-id.ts) |
| `stableRelationshipId` | function | Generates deterministic relationship ID from endpoints and type | [`stable-id.ts:66-68`](./stable-id.ts) |
| `handleUncommittedChanges` | function | Processes uncommitted file changes for incremental reindex | [`git-event-handlers.ts:29-66`](./git-event-handlers.ts) |
| `handleBranchChange` | function | Handles Git branch switch with full reindex trigger | [`git-event-handlers.ts:131-179`](./git-event-handlers.ts) |
| `handleDebouncedEmbeddingGeneration` | function | Debounced embedding generation after file changes | [`git-event-handlers.ts:74-100`](./git-event-handlers.ts) |
| `scheduleEmbeddingGeneration` | function | Schedules delayed embedding generation | [`git-event-handlers.ts:201-228`](./git-event-handlers.ts) |
| `triggerEmbeddingGeneration` | function | Triggers immediate embedding generation | [`git-event-handlers.ts:227-249`](./git-event-handlers.ts) |


### Added Entities

- **ParentContext** — `sem-id.ts:22-26`
- **typeAbbrev** — `sem-id.ts:77-79`
- **fileStem** — `sem-id.ts:86-90`
- **generateSemId** — `sem-id.ts:108-139`
- **generateRefId** — `sem-id.ts:145-147`
- **TYPE_ABBREV** — `sem-id.ts:36-74`
- **base** — `sem-id.ts:87-87`
- **ext** — `sem-id.ts:88-88`
- **mod** — `sem-id.ts:115-115`
- **abbrev** — `sem-id.ts:116-116`
- **nameCapped** — `sem-id.ts:117-117`
- **parentAbbrev** — `sem-id.ts:122-122`
- **parentName** — `sem-id.ts:123-123`
- **existing** — `sem-id.ts:130-130`
- **next** — `sem-id.ts:132-132`
- **base** — `sem-id.ts:120-120`
- **OrdinalMap** — `sem-id.ts:29-29`

## Dependencies

### Internal Modules

| Module | Purpose |
|--------|---------|
| `types/storage` | Entity, Relationship, RelationType types |
| `types/parser` | ParsedEntity type |
| `logging` | Structured logging |

### External Packages

| Package | Purpose |
|---------|---------|
| `xxhash-wasm` | Fast xxHash-based deterministic ID generation |
| `nanoid` | Random ID generation for relationships |

## Behavioral Properties

| Property | Value |
|----------|-------|
| ID length | 12 characters (truncated xxHash h64) |
| Entity resolution | Exact match, then suffix match with `.simpleName` |
| Global entity types | `package` and `import` (no filePath in ID) |

## Error Handling

Entity resolution returns `undefined` when no match is found rather than throwing. External placeholder creation is idempotent via a seen-external map. xxHash throws if `initXXHash()` was not called before use.

## Known Limitations

- `buildRelationships` uses positional matching between parsed and storage entities (index-based), which requires consistent ordering.
- Suffix-based entity resolution without the pre-built suffix index falls back to O(n) scan.
- External placeholder resolution is name-based only; overloaded names may resolve to the wrong entity.

## Files

| File | Description |
|------|-------------|
| `entity-resolution.ts` | Entity name map building and name/line-based resolution |
| `external-placeholder.ts` | External reference placeholder creation and post-indexing resolution |
| `git-event-handlers.ts` | Git event handlers for branch changes and incremental updates |
| `relationship-builder.ts` | Builds typed relationships from parsed entities |
| `stable-id.ts` | Deterministic ID generation using xxHash |
| `index.ts` | Re-exports all indexer module members |
