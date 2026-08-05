---
module_name: storage
description: "SQLite-backed storage for documentation entities, references, and changelog"
status: active
language: typescript
---

# Storage

> Provides persistent SQLite storage for documentation entities, cross-reference tracking, and changelog management via the `AutoDocManager` orchestrator, `DocStorage` for document CRUD, and `RefStorage` for the unified reference registry.

## Overview

The storage module is the persistence layer of AutoDoc. `AutoDocManager` is the central orchestrator that integrates `DocStorage` (documentation sections), `RefStorage` (references between docs/code/comments), and optionally `GraphStorage` (code entity lookups). It provides high-level operations: saving documents with automatic reference extraction, building documentation context for entities, validating all references, handling code moves/renames, and tracking changes via a changelog. Both storage classes use native SQLite (better-sqlite3 / bun:sqlite via NativeSQLiteClient) for cross-runtime Bun/Node.js compatibility, support branch isolation via project context, and optimize bulk operations with batch SQL statements.

## Data Flow

- **Inputs**: Markdown content with file paths, parsed references from the parser module, code entity modification events, and configuration (database path, project context).
- **Processing**: `saveDocument` parses markdown into sections, batch-upserts doc entities, extracts references, and batch-creates ref records. `validateReferences` checks each ref target (entity via GraphStorage, doc via DocStorage, line-range via filesystem). `onEntityModified` marks impacted docs as outdated and records changelog entries.
- **Outputs**: `DocEntity[]` for document queries, `Reference[]` for ref lookups, `AutoDocStatus` with statistics, `OutdatedDoc[]` for stale detection, `AutoDocTodo[]` for documentation tasks.

## Public API

| Export | Type | Description | Location |
|--------|------|-------------|----------|
| `AutoDocManager` | class | Central manager integrating DocStorage, RefStorage, and GraphStorage | [`autodoc-manager.ts:49-658`](./autodoc-manager.ts) |
| `getAutoDocManager` | function | Singleton factory for AutoDocManager | [`autodoc-manager.ts:671-676`](./autodoc-manager.ts) |
| `resetAutoDocManager` | function | Destroys and resets the AutoDocManager singleton | [`autodoc-manager.ts:681-686`](./autodoc-manager.ts) |
| `DocStorage` | class | CRUD operations for doc_entities, doc_changelog, and doc_todos tables | [`doc-storage.ts:33-816`](./doc-storage.ts) |
| `RefStorage` | class | CRUD operations for doc_references and comment_refs tables | [`ref-storage.ts:32-876`](./ref-storage.ts) |

## Dependencies

### Internal Modules

| Module | Purpose |
|--------|---------|
| `autodoc/parser` | `parseMarkdown`, `flattenSections` for document parsing during save |
| `autodoc/types` | All AutoDoc type definitions (DocEntity, Reference, etc.) |
| `storage/libsql/types` | `ProjectContext` for branch isolation |
| `types/storage` | `GraphStorage`, `Entity`, `Relationship` interfaces |
| `utils/parallel` | `mapParallel` for parallel reference validation and caller fetching |

### External Packages

| Package | Purpose |
|---------|---------|
| `better-sqlite3` / `bun:sqlite` | Native SQLite via NativeSQLiteClient for cross-runtime compatibility |
| `nanoid` | Short unique ID generation for refs, changelog, and todos |

## Behavioral Properties

| Property | Value |
|----------|-------|
| Branch isolation | CTE-based queries with priority (current branch > base branch) |
| Outdated threshold | Confidence < 0.7 marks docs as outdated |
| Validation concurrency | Up to 8 parallel reference validations |
| Batch operations | Uses `NativeSQLiteClient.batch()` for bulk upserts and inserts |

## Error Handling

Both storage classes require explicit `initialize()` before use and throw if accessed before initialization. Database operations propagate SQLite errors. `AutoDocManager.validateReferences` catches per-reference validation failures and records them as `validationError` on the reference record. `saveDocument` transactionally deletes old refs before inserting new ones.

## Known Limitations

- `onFileRenamed` for `.md` files has a TODO for properly re-creating docs with the new path.
- Line-range and commit reference validation always returns `true` (would need filesystem/git access for real validation).
- The outdated confidence reduction is a fixed -0.3 decrement, not proportional to the severity of change.

## Exports

- `AutoDocManager`
- `getAutoDocManager`
- `resetAutoDocManager`
- `DocStorage`
- `RefStorage`

## Files

| File | Description |
|------|-------------|
| [`autodoc-manager.ts`](./autodoc-manager.ts) | Central AutoDoc manager: document save/query, context building, reference validation, code change handling, changelog |
| [`doc-storage.ts`](./doc-storage.ts) | SQLite CRUD for doc_entities, doc_changelog, doc_todos with branch-aware queries and batch upserts |
| [`ref-storage.ts`](./ref-storage.ts) | SQLite CRUD for doc_references and comment_refs with branch-aware queries, batch creates, and line updates |
| [`schema.sql`](./schema.sql) | SQL schema definition for all AutoDoc tables (doc_entities, doc_references, doc_changelog, comment_refs, doc_todos) |
| [`index.ts`](./index.ts) | Module barrel file re-exporting AutoDocManager, DocStorage, and RefStorage |
