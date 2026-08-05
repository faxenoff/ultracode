---
module_name: autodoc
description: Automatic documentation layer with storage, parsing, synchronization, LLM generation, git hooks, i18n, and file watching
status: active
language: typescript
entry_point: index.ts
exports:
  - AutoDocManager
  - DocStorage
  - RefStorage
  - parseMarkdown
  - extractReferences
  - AutoDocWatcher
  - generateDocs
  - createLLMProvider
  - syncBidirectional
  - installPreCommitHook
  - detectLanguageFromText
dependencies:
  - "@libsql/client"
  - nanoid
  - "../../core/knowledge-bus"
  - "../../logging"
  - "../../utils/file-ops"
  - "../../utils/parallel"
  - "../../storage/libsql/types"
  - "../../types/storage"
tags:
  - documentation
  - autodoc
  - llm
  - markdown
  - sqlite
  - i18n
  - git-hooks
  - watcher
---

## Overview

The `autodoc` module provides a full documentation lifecycle: initialization, storage in native SQLite, markdown parsing, reference extraction, bidirectional file sync, LLM-powered doc generation, i18n support (en/ru/zh), git pre-commit validation, and live file watching with incremental updates.

It is organized into seven submodules: **storage** (DocStorage, RefStorage, AutoDocManager), **parser** (markdown and link extraction), **sync** (disk-DB bidirectional), **generator** (module scanning and doc generation), **llm** (Ollama/TGI/OpenAI/LlamaCpp/ClaudeCode providers), **hooks** (git pre-commit validation), **i18n** (language detection and section names), and **watcher** (KnowledgeBus-driven incremental updates).

Entry point `index.ts` re-exports the full public API from all submodules.

## Data Flow

1. `autodoc_init` creates `.autodoc/` directory with config and templates.
2. `scanModules` discovers modules; `generateDocs` produces AUTODOC.md per module.
3. `DocStorage` and `RefStorage` persist entities and references in SQLite.
4. `parseMarkdown` parses `.md` into `ParsedDocument`; `extractReferences` extracts typed refs.
5. `syncBidirectional` reconciles disk files with DB state in both directions.
6. `AutoDocWatcher` listens to `KnowledgeBus` events, debounces, and calls `updateAutodocContent`.
7. `installPreCommitHook` adds git hook; `runPreCommitCheck` validates refs before commit.
8. LLM providers generate or improve documentation text via `generateModuleDoc` / `improveDoc`.
9. `detectLanguageFromText` auto-detects doc language for i18n section names.

## Public API

### Storage

| Export | Kind | Location | Description |
|--------|------|----------|-------------|
| `AutoDocManager` | class | [`autodoc-manager.ts:49-658`](./storage/autodoc-manager.ts) | Central manager integrating DocStorage, RefStorage, GraphStorage |
| `getAutoDocManager` | function | [`autodoc-manager.ts:670-675`](./storage/autodoc-manager.ts) | Singleton accessor for AutoDocManager |
| `resetAutoDocManager` | function | [`autodoc-manager.ts:680-685`](./storage/autodoc-manager.ts) | Reset and recreate the singleton instance |
| `DocStorage` | class | [`doc-storage.ts:33-816`](./storage/doc-storage.ts) | CRUD for documentation entities in SQLite |
| `RefStorage` | class | [`ref-storage.ts:32-876`](./storage/ref-storage.ts) | CRUD for references between docs, code, comments |

### Parser

| Export | Kind | Location | Description |
|--------|------|----------|-------------|
| `parseMarkdown` | function | [`md-parser.ts:29-127`](./parser/md-parser.ts) | Parse markdown into structured `ParsedDocument` |
| `flattenSections` | function | [`md-parser.ts:132-146`](./parser/md-parser.ts) | Flatten nested sections into a flat list |
| `findSectionById` | function | [`md-parser.ts:151-162`](./parser/md-parser.ts) | Find section by slugified ID |
| `findSectionByTitle` | function | [`md-parser.ts:167-180`](./parser/md-parser.ts) | Find section by title string |
| `updateSectionContent` | function | [`md-parser.ts:185-232`](./parser/md-parser.ts) | Replace content of a named section |
| `insertSectionAfter` | function | [`md-parser.ts:237-291`](./parser/md-parser.ts) | Insert new section after a given one |
| `generateMarkdown` | function | [`md-parser.ts:296-328`](./parser/md-parser.ts) | Serialize ParsedDocument back to markdown |
| `extractTitle` | function | [`md-parser.ts:348-360`](./parser/md-parser.ts) | Extract first H1 title from content |
| `getSectionPath` | function | [`md-parser.ts:365-388`](./parser/md-parser.ts) | Get breadcrumb path to a section |
| `extractReferences` | function | [`link-extractor.ts:58-81`](./parser/link-extractor.ts) | Extract typed references from markdown |
| `extractCommentRefs` | function | [`link-extractor.ts:317-321`](./parser/link-extractor.ts) | Extract doc/entity refs from code comments |
| `generateCodeRef` | function | [`link-extractor.ts:228-236`](./parser/link-extractor.ts) | Generate `[-> file:L1-L50]()` syntax |
| `generateEntityRef` | function | [`link-extractor.ts:241-376`](./parser/link-extractor.ts) | Generate `[-> entity:Name]()` syntax |
| `generateDocRef` | function | [`link-extractor.ts:249-253`](./parser/link-extractor.ts) | Generate `~~[-> Doc](./path.md)~~ (deleted)` syntax |
| `validateReference` | function | [`link-extractor.ts:262-265`](./parser/link-extractor.ts) | Validate correctness of a parsed reference |
| `updateLineNumbers` | function | [`link-extractor.ts:282-291`](./parser/link-extractor.ts) | Shift line numbers in refs by a delta |

### Sync

| Export | Kind | Location | Description |
|--------|------|----------|-------------|
| `syncDiskToDb` | function | [`file-sync.ts:118-167`](./sync/file-sync.ts) | Sync .md files from disk into SQLite |
| `syncDbToDisk` | function | [`file-sync.ts:237-291`](./sync/file-sync.ts) | Write DB entities back to .md files |
| `syncBidirectional` | function | [`file-sync.ts:300-314`](./sync/file-sync.ts) | Two-way sync with conflict resolution |
| `findMarkdownFiles` | function | [`file-sync.ts:54-108`](./sync/file-sync.ts) | Discover .md files up to maxDepth |
| `writeDocumentToDisk` | function | [`file-sync.ts:323-325`](./sync/file-sync.ts) | Write single doc to disk |
| `readDocumentFromDisk` | function | [`file-sync.ts:331-331`](./sync/file-sync.ts) | Read single doc with mtime |

### Generator

| Export | Kind | Location | Description |
|--------|------|----------|-------------|
| `scanModules` | function | [`doc-generator.ts:55-61`](./generator/doc-generator.ts) | Scan directory tree for modules |
| `generateModuleReadme` | function | [`doc-generator.ts:178-219`](./generator/doc-generator.ts) | Generate AUTODOC.md for a module |
| `generateArchitectureDoc` | function | [`doc-generator.ts:369-417`](./generator/doc-generator.ts) | Generate project architecture overview |
| `generateDocs` | function | [`doc-generator.ts:428-452`](./generator/doc-generator.ts) | Full doc generation pipeline |

### LLM

| Export | Kind | Location | Description |
|--------|------|----------|-------------|
| `createLLMProvider` | function | [`llm-provider.ts:1341-1371`](./llm/llm-provider.ts) | Factory for LLM provider instances |
| `detectLLMProviders` | function | [`llm-provider.ts:1206-1209`](./llm/llm-provider.ts) | Auto-detect available LLM backends |
| `OllamaProvider` | class | [`llm-provider.ts:73-255`](./llm/llm-provider.ts) | Ollama local LLM provider |
| `TGIProvider` | class | [`llm-provider.ts:189-416`](./llm/llm-provider.ts) | HuggingFace TGI provider |
| `OpenAIProvider` | class | [`llm-provider.ts:260-538`](./llm/llm-provider.ts) | OpenAI-compatible API provider |
| `generateModuleDoc` | function | [`doc-writer.ts:63-67`](./llm/doc-writer.ts) | LLM-generate module documentation |
| `generateExportDoc` | function | [`doc-writer.ts:84-101`](./llm/doc-writer.ts) | LLM-generate export-level doc |
| `improveDoc` | function | [`doc-writer.ts:106-108`](./llm/doc-writer.ts) | LLM-improve existing documentation |
| `batchGenerateDocs` | function | [`doc-writer.ts:252-259`](./llm/doc-writer.ts) | Batch LLM doc generation |

### I18N

| Export | Kind | Location | Description |
|--------|------|----------|-------------|
| `detectLanguageFromText` | function | [`language-detector.ts:88-145`](./i18n/language-detector.ts) | Detect language via Unicode char analysis |
| `detectLanguageFromComments` | function | [`language-detector.ts:150-154`](./i18n/language-detector.ts) | Detect language from code comments |
| `detectLanguageFromCode` | function | [`language-detector.ts:160-194`](./i18n/language-detector.ts) | Detect language from source file |
| `aggregateLanguageDetection` | function | [`language-detector.ts:199-244`](./i18n/language-detector.ts) | Merge multiple detection results |
| `SECTION_NAMES` | const | [`section-names.ts:17-144`](./i18n/section-names.ts) | Localized section title mappings |
| `getSectionName` | function | [`section-names.ts:188-190`](./i18n/section-names.ts) | Get section name by key and language |
| `getPlaceholder` | function | [`section-names.ts:256-258`](./i18n/section-names.ts) | Get template placeholder text |

### Hooks

| Export | Kind | Location | Description |
|--------|------|----------|-------------|
| `installPreCommitHook` | function | [`hook-installer.ts:105-161`](./hooks/hook-installer.ts) | Install git pre-commit hook |
| `uninstallHooks` | function | [`hook-installer.ts:166-230`](./hooks/hook-installer.ts) | Remove installed hooks |
| `getHookStatus` | function | [`hook-installer.ts:235-239`](./hooks/hook-installer.ts) | Check hook installation status |
| `isHookInstalled` | function | [`hook-installer.ts:89-100`](./hooks/hook-installer.ts) | Check if specific hook exists |
| `runPreCommitCheck` | function | [`pre-commit-check.ts:153-216`](./hooks/pre-commit-check.ts) | Validate staged file references |
| `formatPreCommitResult` | function | [`pre-commit-check.ts:221-245`](./hooks/pre-commit-check.ts) | Format check result for terminal |

### Watcher

| Export | Kind | Location | Description |
|--------|------|----------|-------------|
| `AutoDocWatcher` | class | [`autodoc-watcher.ts:79-806`](./watcher/autodoc-watcher.ts) | File watcher with debounced incremental updates |
| `getAutoDocWatcher` | function | [`autodoc-watcher.ts:811-819`](./watcher/autodoc-watcher.ts) | Singleton accessor for watcher |
| `resetAutoDocWatcher` | function | [`autodoc-watcher.ts:821-826`](./watcher/autodoc-watcher.ts) | Reset watcher singleton |
| `updateAutodocContent` | function | [`autodoc-updater.ts:48-52`](./watcher/autodoc-updater.ts) | Incrementally update AUTODOC.md content |
| `diffExports` | function | [`autodoc-updater.ts:423-423`](./watcher/autodoc-updater.ts) | Diff old vs new export lists |
| `getModuleForFile` | function | [`module-resolver.ts:14-55`](./watcher/module-resolver.ts) | Resolve file path to parent module |
| `extractExportsFromFile` | function | [`module-resolver.ts:80-91`](./watcher/module-resolver.ts) | Extract export names from index.ts |
| `extractEntitiesFromContent` | function | [`module-resolver.ts:184-253`](./watcher/module-resolver.ts) | Extract typed entities from source |

## Dependencies

| Dependency | Purpose |
|------------|---------|
| `better-sqlite3` / `bun:sqlite` | Native SQLite driver via NativeSQLiteClient |
| `nanoid` | Unique ID generation for entities and references |
| `../../core/knowledge-bus` | Event bus for watcher file-change notifications |
| `../../logging` | Structured logging |
| `../../utils/file-ops` | Cross-runtime file operations (Bun/Node) |
| `../../utils/parallel` | `mapParallel` / `collectParallel` for concurrent I/O |
| `../../storage/libsql/types` | `ProjectContext` for branch-aware storage |
| `../../types/storage` | `GraphStorage` / `Relationship` interfaces |
| `../../utils/runtime-detection` | `isBunRuntime` / `sleep` utilities |

## Configuration

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `AutoDocConfig.enabled` | `boolean` | `true` | Enable/disable AutoDoc |
| `AutoDocConfig.language` | `DocLanguage` | `"en"` | Documentation language (en/ru/zh) |
| `AutoDocConfig.docsDir` | `string?` | `.autodoc` | Directory for generated docs |
| `AutoDocWatcherConfig.debounceMs` | `number` | `45000` | Debounce delay for file changes |
| `AutoDocWatcherConfig.minDebounceMs` | `number` | `30000` | Minimum debounce delay |
| `AutoDocWatcherConfig.maxDebounceMs` | `number` | `60000` | Maximum debounce delay |
| `LLMConfig.provider` | `string` | - | `ollama`, `tgi`, `openai`, `llamacpp`, `docker-model-runner`, `claude-code` |
| `LLMConfig.model` | `string` | auto | Model name; auto-selects from preferred list |

## Behavioral Properties

- **Singleton pattern**: `AutoDocManager`, `AutoDocWatcher` use singleton accessors with explicit reset.
- **Branch isolation**: DocStorage and RefStorage scope queries to `ProjectContext` (branch + project).
- **Debounced updates**: Watcher batches file changes within 30-60s window before updating AUTODOC.md.
- **Incremental sync**: Only changed modules are updated; unchanged docs are preserved.
- **Parallel I/O**: File discovery and sync use `mapParallel` with configurable concurrency (default 8).
- **LLM auto-detection**: `detectLLMProviders` probes Ollama, TGI, OpenAI endpoints and picks best model.
- **CRLF normalization**: Markdown parser normalizes line endings to LF before parsing.

## Error Handling

- Storage operations catch SQLite errors and return `success: false` with `error` messages.
- `validateReference` returns `valid: false` with `validationError` for broken refs.
- Pre-commit check collects all broken refs and reports them; does not throw.
- LLM providers return empty text on timeout (default 120s) or connection failure.
- File sync logs errors per-file and continues processing remaining files.
- Watcher catches update errors and logs them; does not crash the process.

## Observability

- All submodules use `log()` from `../../logging` for structured logging.
- `AutoDocStatus.stats` provides counts: totalDocs, totalSections, filledSections, outdatedSections, totalRefs, validRefs, brokenRefs.
- `ValidateResult` reports totalRefs, validRefs, brokenRefs with per-ref error details.
- `PreCommitCheckResult` lists broken refs with file, line, target, and error message.
- Watcher logs debounce timing and update counts per cycle.

## Known Limitations

- LLM generation requires a running local model server (Ollama, TGI, or compatible endpoint).
- Language detection relies on Unicode character classification; mixed-language docs may misdetect.
- Pre-commit hook requires `ultracode` to be in PATH for CLI validation.
- SQLite storage is single-writer; concurrent writes from multiple processes may conflict.
- Watcher depends on `KnowledgeBus` events; direct file edits outside the watched flow are missed until next index cycle.

## TypeScript Notes

- All types are defined in `types.ts` and re-exported from `index.ts`.
- Enums (`DocEntityType`, `RefType`, `RefSourceType`, `RefTargetType`, `ChangeType`) use string values.
- `DocLanguage` is a union type: `"en" | "ru" | "zh"`.
- LLM provider classes implement the `LLMProvider` interface with `generate()` and `checkHealth()`.
- Storage classes accept `ProjectContext` for branch-scoped queries.

## Exports

- `AutoDocManager`
- `getAutoDocManager`
- `resetAutoDocManager`
- `DocStorage`
- `RefStorage`
- `extractCommentRefs`
- `extractReferences`
- `generateCodeRef`
- `generateDocRef`
- `generateEntityRef`
- `generateFlowComment`
- `generateSeeDocComment`
- `generateSeeEntityComment`
- `updateLineNumbers`
- `validateReference`
- `extractTitle`
- `findSectionById`
- `findSectionByTitle`
- `flattenSections`
- `generateMarkdown`
- `getSectionPath`
- `insertSectionAfter`
- `parseMarkdown`
- `updateSectionContent`
- `aggregateLanguageDetection`
- `detectLanguageFromCode`
- `detectLanguageFromComments`
- `detectLanguageFromText`
- `DOC_TYPE_NAMES`
- `findSectionKey`
- `getAllSectionNames`
- `getDocTypeName`
- `getPlaceholder`
- `getSectionName`
- `SECTION_NAMES`
- `TEMPLATE_PLACEHOLDERS`
- `getGitHooksDir`
- `getHookStatus`
- `installPreCommitHook`
- `isHookInstalled`
- `uninstallHooks`
- `checkReferenceTarget`
- `formatPreCommitResult`
- `getStagedCodeFiles`
- `getStagedMdFiles`
- `runPreCommitCheck`
- `findMarkdownFiles`
- `readDocumentFromDisk`
- `syncBidirectional`
- `syncDbToDisk`

## Files

| File | Description |
|------|-------------|
| [`index.ts`](./index.ts) | Barrel re-exports for the entire autodoc public API |
| [`types.ts`](./types.ts) | All type definitions: enums, interfaces, param/result types |
| [`storage/autodoc-manager.ts`](./storage/autodoc-manager.ts) | Central manager integrating doc, ref, and graph storage |
| [`storage/doc-storage.ts`](./storage/doc-storage.ts) | SQLite CRUD for DocEntity with batch ops |
| [`storage/ref-storage.ts`](./storage/ref-storage.ts) | SQLite CRUD for Reference and CommentRef |
| [`storage/schema.sql`](./storage/schema.sql) | DDL for autodoc SQLite tables |
| [`parser/md-parser.ts`](./parser/md-parser.ts) | Markdown-to-ParsedDocument parser with hierarchy |
| [`parser/link-extractor.ts`](./parser/link-extractor.ts) | Reference extraction and generation utilities |
| [`sync/file-sync.ts`](./sync/file-sync.ts) | Bidirectional disk-DB synchronization |
| [`generator/doc-generator.ts`](./generator/doc-generator.ts) | Module scanning and AUTODOC.md generation |
| [`generator/general-docs.ts`](./generator/general-docs.ts) | Templates for general project docs |
| [`generator/incremental-updater.ts`](./generator/incremental-updater.ts) | Incremental doc update with diff detection |
| [`generator/generate-handler-utils.ts`](./generator/generate-handler-utils.ts) | Utilities for generate handler pipeline |
| [`llm/llm-provider.ts`](./llm/llm-provider.ts) | LLM provider implementations (Ollama, TGI, OpenAI, LlamaCpp, ClaudeCode) |
| [`llm/doc-writer.ts`](./llm/doc-writer.ts) | LLM-powered doc generation functions |
| [`i18n/language-detector.ts`](./i18n/language-detector.ts) | Unicode-based language detection |
| [`i18n/section-names.ts`](./i18n/section-names.ts) | Localized section names and templates |
| [`hooks/hook-installer.ts`](./hooks/hook-installer.ts) | Git pre-commit hook installation |
| [`hooks/pre-commit-check.ts`](./hooks/pre-commit-check.ts) | Pre-commit reference validation logic |
| [`watcher/autodoc-watcher.ts`](./watcher/autodoc-watcher.ts) | File watcher with KnowledgeBus integration |
| [`watcher/autodoc-updater.ts`](./watcher/autodoc-updater.ts) | Incremental AUTODOC.md content updater |
| [`watcher/module-resolver.ts`](./watcher/module-resolver.ts) | Module boundary detection and export extraction |
