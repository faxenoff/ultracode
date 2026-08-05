---
module_name: watcher
description: "File change watching with debounced incremental AUTODOC.md updates"
status: active
language: typescript
---

# Watcher

> Monitors source code changes via KnowledgeBus events and file-ops hooks, debounces updates per module, and incrementally regenerates AUTODOC.md files with updated exports, file lists, and line-number references.

## Overview

The watcher module ties together the entire AutoDoc pipeline into an automated, event-driven system. `AutoDocWatcher` subscribes to indexing events (`index:complete`, `index:completed`, `semantic:new_entities`) from the KnowledgeBus and direct file write notifications, groups changes by module, applies adaptive debouncing (3-15 seconds), and triggers incremental updates. The updater intelligently modifies existing AUTODOC.md content by refreshing export sections, file listings, line-number references (using entity-to-line matching), and optionally generating descriptions via LLM. The module resolver maps file paths to their parent modules and provides lightweight code entity extraction for line-range tracking.

## Data Flow

- **Inputs**: File change events (file paths from KnowledgeBus or file-ops hooks), module directory paths, existing AUTODOC.md content.
- **Processing**: Watcher maps changed files to modules, debounces per-module, reads current AUTODOC.md, calls `updateAutodocContent` which refreshes exports/files/line-refs, optionally invokes LLM for description generation. For new modules, `generateModuleReadmeWithEntities` creates initial content.
- **Outputs**: Updated or newly created AUTODOC.md files on disk; `autodoc:created` and `autodoc:updated` events published to KnowledgeBus.

## Public API

| Export | Type | Description | Location |
|--------|------|-------------|----------|
| `updateAutodocContent` | function | Incrementally updates AUTODOC.md content from module info and changed files | [`autodoc-updater.ts:50-87`](./autodoc-updater.ts) |
| `diffExports` | function | Computes added/removed exports between old and new export lists | [`autodoc-updater.ts:423-423`](./autodoc-updater.ts) |
| `generateExportDescription` | function | Generates heuristic description for an export name (without LLM) | [`autodoc-updater.ts:438-478`](./autodoc-updater.ts) |
| `UpdateOptions` | interface | Options for update (useLlm, llmConfig) | [`autodoc-updater.ts:19-28`](./autodoc-updater.ts) |
| `AutoDocWatcher` | class | Main watcher: subscribes to events, debounces, triggers updates | [`autodoc-watcher.ts:79-806`](./autodoc-watcher.ts) |
| `AutoDocWatcherConfig` | interface | Configuration for the watcher (debounce timings, rootDir, LLM settings) | [`autodoc-watcher.ts:49-68`](./autodoc-watcher.ts) |
| `getAutoDocWatcher` | function | Singleton factory for AutoDocWatcher | [`autodoc-watcher.ts:811-819`](./autodoc-watcher.ts) |
| `resetAutoDocWatcher` | function | Stops and resets the AutoDocWatcher singleton | [`autodoc-watcher.ts:821-826`](./autodoc-watcher.ts) |
| `ExtractedEntity` | interface | Entity info extracted from code (name, type, exported, line, endLine) | [`module-resolver.ts:169-178`](./module-resolver.ts) |
| `extractEntitiesFromContent` | function | Lightweight parser extracting functions/classes/interfaces/types/consts/enums with line ranges | [`module-resolver.ts:184-253`](./module-resolver.ts) |
| `extractExportsFromContent` | function | Extracts export names from file content via regex | [`module-resolver.ts:96-144`](./module-resolver.ts) |
| `extractExportsFromFile` | function | Reads a file and extracts export names | [`module-resolver.ts:80-91`](./module-resolver.ts) |
| `findEntityLine` | function | Finds line number of a named entity in file content | [`module-resolver.ts:321-346`](./module-resolver.ts) |
| `getModuleFiles` | function | Lists code files in a module directory | [`module-resolver.ts:149-167`](./module-resolver.ts) |
| `getModuleForFile` | function | Resolves which module a file belongs to by walking up directories | [`module-resolver.ts:14-55`](./module-resolver.ts) |

## Dependencies

### Internal Modules

| Module | Purpose |
|--------|---------|
| `autodoc/generator` | `generateModuleReadmeWithEntities`, `scanModules`, `ModuleInfo` for content generation |
| `autodoc/i18n` | Language detection for multi-language LLM descriptions |
| `autodoc/llm` | `detectLLMProviders`, `ClaudeCodeProvider` for LLM-enhanced descriptions |
| `core/knowledge-bus` | Event subscription for index and entity change notifications |
| `logging` | Structured logging throughout watcher lifecycle |
| `utils/file-ops` | File operations and `setFileChangeHook` for direct write notifications |
| `utils/runtime-detection` | `sleep` for debounce scheduling (Bun-compatible) |

### External Packages

| Package | Purpose |
|---------|---------|
| `node:path` | Path manipulation for module resolution and file joining |

## Behavioral Properties

| Property | Value |
|----------|-------|
| Default debounce | 5 seconds (min 3s, max 15s, adaptive based on change count) |
| Module cache TTL | 5 minutes |
| `.autodoc` check cache TTL | 5 minutes |
| LLM availability | Lazy-detected on first use if not explicitly configured |
| Initial scan | 5 seconds after start, creates AUTODOC.md for modules missing one |

## Error Handling

The watcher catches all errors during update processing and logs them without crashing. If an update fails mid-processing, the `isProcessing` flag is reset in a `finally` block. Debounce controllers use `AbortController` for clean cancellation. Module info reads silently return empty arrays on directory errors. LLM generation failures fall back to non-LLM content.

## Known Limitations

- Entity extraction uses lightweight regex parsing, not full AST; complex patterns (e.g., destructured exports, computed property names) may be missed.
- Line-number reference updates match entities within a 5-10 line tolerance, which may produce incorrect matches in densely-packed files.
- The watcher only creates AUTODOC.md for new modules when the `.autodoc` folder exists in the project root; it does not auto-create the folder.

## Exports

- `diffExports`
- `generateExportDescription`
- `updateAutodocContent`
- `AutoDocWatcher`
- `getAutoDocWatcher`
- `resetAutoDocWatcher`
- `extractEntitiesFromContent`
- `extractExportsFromContent`
- `extractExportsFromFile`
- `findEntityLine`
- `getModuleFiles`
- `getModuleForFile`

## Files

| File | Description |
|------|-------------|
| [`autodoc-updater.ts`](./autodoc-updater.ts) | Incremental AUTODOC.md content updates: export/file section refresh, line-number reference tracking, LLM description generation, language detection |
| [`autodoc-watcher.ts`](./autodoc-watcher.ts) | Event-driven watcher: KnowledgeBus subscription, adaptive debouncing, module scanning, AUTODOC.md creation/update orchestration |
| [`module-resolver.ts`](./module-resolver.ts) | Module resolution (file-to-module mapping), export extraction, entity parsing with line ranges |
| [`index.ts`](./index.ts) | Module barrel file re-exporting autodoc-updater, autodoc-watcher, and module-resolver |
