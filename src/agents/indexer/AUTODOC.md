---
module_name: indexer
description: "Entity resolution, relationship building, stable ID generation, and Git event handling for code indexing"
status: active
language: typescript
---

# Indexer

> Core indexing infrastructure for resolving entities by name, building relationships from parsed code, generating deterministic IDs with xxHash, and handling Git events for incremental index updates.

## Overview

The indexer module provides the data processing layer between parser output and graph storage. It resolves entity references using name and line-based disambiguation (with suffix matching for cross-module calls), builds typed relationships (imports, calls, extends, contains, etc.) from parsed entities, and generates deterministic IDs using xxHash for stable cross-session entity identity. The Git event handlers manage branch changes, uncommitted file changes, and debounced embedding generation.

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

## Exports



## Files

| File | Description |
|------|-------------|
| `entity-resolution.ts` | Entity name map building and name/line-based resolution |
| `external-placeholder.ts` | External reference placeholder creation and post-indexing resolution |
| `git-event-handlers.ts` | Git event handlers for branch changes and incremental updates |
| `relationship-builder.ts` | Builds typed relationships from parsed entities |
| `stable-id.ts` | Deterministic ID generation using xxHash |
| `index.ts` | Re-exports all indexer module members |
