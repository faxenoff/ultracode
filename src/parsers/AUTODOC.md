---
module_name: parsers
description: Multi-language source code parsing framework with incremental caching, two-pass TS/JS analysis (OXC + TypeScript API), and layered analysis for Python/Rust
status: production
language: TypeScript
entry_point: incremental-parser.ts
exports:
  - IncrementalParser
  - UnifiedParser
  - TypeScriptParser
  - MultiPassOrchestrator
  - fastParse
  - fastParseBatch
dependencies:
  - typescript
  - oxc-parser
  - xxhash-wasm
  - lru-cache
tags:
  - parsing
  - ast
  - multi-language
  - incremental
  - caching
  - oxc
  - tree-sitter
---

# Parsers

Multi-language source code parsing framework supporting 20+ languages. Uses a two-pass architecture for TS/JS (OXC fast pass + TypeScript API), layered analysis for Python and Rust, and incremental xxhash-based LRU caching. Routes parsing via `UnifiedParser` with lazy-loaded language-specific parsers. Circuit breaker pattern prevents runaway recursion and timeouts.

## Data Flow

### Inputs

| Source | Type | Description |
|--------|------|-------------|
| File path + content | `string` | Source code to parse |
| `FileChange[]` | array | Incremental edits for delta parsing |
| `ParserOptions` | config | Batch size, timeout, cache size, multipass toggle |

### Processing

| Step | Component | Description |
|------|-----------|-------------|
| Hash | xxhash-wasm | Content hash for cache lookup |
| Cache check | LRU cache | Return `CacheEntry` on hit, else continue |
| Language detect | `UnifiedParser` | Map file extension to `SupportedLanguage` |
| Pass 1 (TS/JS) | OXC fast parser | Structural analysis ~0.5-2ms, complexity score |
| Pass 2 (TS/JS) | TypeScript API | Full type analysis if complexity > threshold |
| Native parse | Language analyzers | tree-sitter or native CLI for non-JS languages |

### Outputs

| Output | Type | Description |
|--------|------|-------------|
| `ParseResult` | object | Entities, relationships, patterns, metadata, timing |
| `BatchResult` | object | Array of results + errors + stats |
| `QuickParseResult` | object | Pass 1 lightweight entities + complexity score |

## Public API

| Export | Type | Location | Description |
|--------|------|----------|-------------|
| `IncrementalParser` | class | [`incremental-parser.ts:96-675`](./incremental-parser.ts) | Main parser with xxhash caching and batch support |
| `UnifiedParser` | class | [`unified-parser.ts:186-775`](./unified-parser.ts) | Routes to language-specific parsers, lazy loading |
| `TypeScriptParser` | class | [`typescript-parser.ts:164-332`](./typescript-parser.ts) | TS Compiler API parser with Angular/NgRx support |
| `MultiPassOrchestrator` | class | [`multipass/multipass-orchestrator.ts:38-405`](./multipass/multipass-orchestrator.ts) | Two-pass OXC + TS API coordinator |
| `getMultiPassOrchestrator` | function | [`multipass/multipass-orchestrator.ts:410-416`](./multipass/multipass-orchestrator.ts) | Singleton factory for orchestrator |
| `fastParse` | function | [`multipass/oxc-fast-parser.ts:136-142`](./multipass/oxc-fast-parser.ts) | OXC single-file fast parse |
| `fastParseBatch` | function | [`multipass/oxc-fast-parser.ts:180-181`](./multipass/oxc-fast-parser.ts) | OXC batch fast parse |
| `BaseParser` | interface | [`base-parser.ts:27-57`](./base-parser.ts) | Common interface for all parsers |
| `ParserStats` | interface | [`base-parser.ts:13-22`](./base-parser.ts) | Cache hits, throughput, error count |
| `LineOffsetMap` | class | [`base-parser-utils.ts:22-22`](./base-parser-utils.ts) | O(log n) index-to-line/column lookup |
| `CircuitBreakerError` | class | [`base-parser-utils.ts:65-70`](./base-parser-utils.ts) | Thrown on recursion/timeout breach |
| `checkCircuitBreakers` | function | [`base-parser-utils.ts:117-133`](./base-parser-utils.ts) | Guard against infinite loops |
| `ComplexityScore` | interface | [`multipass/types.ts:14-31`](./multipass/types.ts) | Complexity metrics (0-100 scale) |
| `QuickParseResult` | interface | [`multipass/types.ts:36-52`](./multipass/types.ts) | OXC Pass 1 result structure |


### Added Entities

- **ASTNode** — `condition-extractor.ts:57-64`
- **extractEnclosingConditions** — `condition-extractor.ts:77-94`
- **formatConditionText** — `condition-extractor.ts:100-169`
- **conditionPrefix** — `condition-extractor.ts:171-176`
- **detectBranch** — `condition-extractor.ts:179-188`
- **truncate** — `condition-extractor.ts:190-193`
- **MAX_WALK_STEPS** — `condition-extractor.ts:15-15`
- **MAX_CONDITION_LEVELS** — `condition-extractor.ts:16-16`
- **MAX_CONDITION_LENGTH** — `condition-extractor.ts:17-17`
- **CONDITION_NODE_TYPES** — `condition-extractor.ts:20-50`
- **conditions** — `condition-extractor.ts:78-78`
- **condText** — `condition-extractor.ts:84-84`
- **nt** — `condition-extractor.ts:101-101`
- **condExpr** — `condition-extractor.ts:112-112`
- **prefix** — `condition-extractor.ts:113-113`
- **branch** — `condition-extractor.ts:114-114`
- **text** — `condition-extractor.ts:115-115`
- **condExpr** — `condition-extractor.ts:121-121`
- **text** — `condition-extractor.ts:122-122`
- **iterExpr** — `condition-extractor.ts:128-128`
- **pattern** — `condition-extractor.ts:129-129`
- **value** — `condition-extractor.ts:138-138`
- **value** — `condition-extractor.ts:150-150`
- **cond** — `condition-extractor.ts:156-156`
- **param** — `condition-extractor.ts:162-162`
- **line** — `condition-extractor.ts:167-167`
- **alternative** — `condition-extractor.ts:181-181`
- **callStart** — `condition-extractor.ts:185-185`
- **altStart** — `condition-extractor.ts:186-186`
- **current** — `condition-extractor.ts:79-79`
- **steps** — `condition-extractor.ts:80-80`

## Dependencies

### Internal

| Module | Import | Usage |
|--------|--------|-------|
| `types/parser` | `ParseResult`, `ParsedEntity`, `ASTNode` | Core data structures |
| `logging` | `log` | Structured logging (`log.d`, `log.i`, `log.w`, `log.e`) |
| `utils/file-ops` | `readText`, `readFilesParallel` | File I/O |
| `utils/parallel` | `forEachParallel` | Concurrent batch processing |
| `utils/runtime-detection` | `sleep` | Bun-compatible timeout |
| `config/constants` | `PARSER_CONSTANTS` | Max recursion depth, timeout values |

### External

| Package | Usage |
|---------|-------|
| `typescript` | TS Compiler API for full type analysis (Pass 2) |
| `oxc-parser` | Rust-based fast structural parser (Pass 1, ~2x faster than SWC) |
| `xxhash-wasm` | WASM content hashing for incremental cache |
| `lru-cache` | Bounded memory cache (default 100MB) |
| `@oxc-project/types` | ESTree-compatible AST type definitions |

## Configuration

| Parameter | Default | Description |
|-----------|---------|-------------|
| `cacheSize` | `100MB` | LRU cache memory limit |
| `batchSize` | `50` | Files per batch |
| `timeoutMs` | `30000` | Per-file parse timeout |
| `multiPass` | `true` | Enable OXC + TS two-pass |
| `detailedThreshold` | `50` | Complexity score to trigger Pass 2 |
| `skipDetailedForSimple` | `true` | Skip TS API for low-complexity files |
| `oxcConcurrency` | `min(cpu*2, 16)` | OXC parallel workers |
| `tsConcurrency` | `min(cpu, 8)` | TS API parallel workers |

## Behavioral Properties

- **Caching**: xxhash content hash as cache key; LRU eviction at 100MB; `warmRestart()` restores from persisted data; `exportCache()` serializes for persistence.
- **Incremental**: Accepts `FileChange[]` with edit ranges; reuses cached AST when content hash matches; only re-parses changed files.
- **Batch**: Files split by language -- TS/JS to MultiPass, others to UnifiedParser. Batches of 20+ files trigger parallel OXC pass.
- **Two-pass (TS/JS)**: Pass 1 (OXC, ~0.5-2ms) extracts structure + complexity score. Pass 2 (TS API) runs only if complexity exceeds threshold.
- **Layered analysis**: Python uses 4 layers (basic -> features -> relationships -> patterns). Rust uses similar layered approach with pattern identification.
- **Lazy loading**: `UnifiedParser` only initializes parsers for detected project languages (checks package.json, Cargo.toml, etc.).

## Error Handling

- **Circuit breaker**: `checkCircuitBreakers()` throws `CircuitBreakerError` if recursion depth > 100 or elapsed time > 30s.
- **Partial results**: On per-file failure, `BatchResult.errors` accumulates errors while successful files still return results.
- **Timeout**: Each file parse wrapped in `Promise.race` with configurable timeout; throws on expiry.
- **Graceful degradation**: If OXC unavailable, falls back to TS API only. If tree-sitter unavailable, language parser skipped.
- **Logging on error**: `log.e()` with context tag and file path; `log.w()` for circuit breaker triggers.

## Observability

| Context Tag | Events | Level |
|-------------|--------|-------|
| `INCPARSER` | `init_start`, `init_done`, `batch_start`, `batch_done`, `cache_evict`, `parse_err` | info/debug/error |
| `MULTIPASS` | `oxc_warm`, `ts_parse_err`, `batch_strategy` | info/warn |
| `JAVAANALYZER` | `analyze_err`, `circuit_break` | error/warn |
| `GOANALYZER` | `circuit_break` | warn |
| `PYBASIC/2/3/4` | `layerX_start`, `layerX_done` | debug |

Stats via `parser.getStats()`: `filesParsed`, `cacheHits`, `cacheMisses`, `avgParseTimeMs`, `throughput`, `cacheMemoryMB`, `errorCount`.

## Known Limitations

- Max recursion depth is 100; deeply nested ASTs trigger circuit breaker and return empty results.
- OXC Pass 1 does not provide full type information; complex generics require Pass 2.
- Batch size of 50 may cause OOM on memory-constrained systems with large files.
- Angular template analysis parses inline templates only; external `.html` templates handled separately.
- Python async/coroutine analysis may miss some advanced patterns (e.g. `async for` in comprehensions).
- Cache invalidation on config change requires manual `clearCache()` call.
- No `index.ts` barrel file; consumers import specific files directly.

## TypeScript Notes

### Event Map

| Event | Emitter | Payload |
|-------|---------|---------|
| Cache eviction | `IncrementalParser` | `{ hash: string }` |
| Parse complete | `IncrementalParser` | `ParseResult` |
| Batch complete | `IncrementalParser` | `BatchResult` with stats |
| Circuit break | Analyzers | `CircuitBreakerError` (thrown, not emitted) |

### Module Boundary

No barrel `index.ts` exists. Entry points are imported directly:
- `IncrementalParser` from ~~`./parsers/incremental-parser.js`~~ (deleted)
- `UnifiedParser` from ~~`./parsers/unified-parser.js`~~ (deleted)
- `MultiPassOrchestrator` from ~~`./parsers/multipass/index.js`~~ (deleted)
- Language configs from ~~`./parsers/language-configs.js`~~ (deleted)

Key types consumed from `../types/parser.ts`: `ParseResult`, `ParsedEntity`, `EntityRelationship`, `ASTNode`, `SupportedLanguage`, `CacheEntry`, `FileChange`.

## Files

| File | Description |
|------|-------------|
| [`incremental-parser.ts`](./incremental-parser.ts) | Main parser with xxhash LRU caching and batch orchestration |
| [`unified-parser.ts`](./unified-parser.ts) | Language router with lazy-loaded parsers |
| [`base-parser.ts`](./base-parser.ts) | `BaseParser` interface and `ParserStats` |
| [`base-parser-utils.ts`](./base-parser-utils.ts) | `LineOffsetMap`, `CircuitBreakerError`, AST traversal helpers |
| [`typescript-parser.ts`](./typescript-parser.ts) | TS Compiler API parser (Pass 2) with Angular/NgRx |
| [`multipass/`](./multipass/) | OXC fast parser, orchestrator, shared types |
| [`angular-parser.ts`](./angular-parser.ts) | Angular component/directive metadata extraction |
| [`angular-analyzer.ts`](./angular-analyzer.ts) | Angular structure analyzer |
| [`ngrx-parser.ts`](./ngrx-parser.ts) | NgRx actions/reducers/effects/selectors parser |
| [`ngrx/`](./ngrx/) | NgRx builders, types, index |
| [`ts-*.ts`](.) | TS extractor modules (class, function, interface, type, import/export, JSDoc, NgRx, patterns) |
| [`java-analyzer.ts`](./java-analyzer.ts) | Java tree-sitter analyzer |
| [`java-antlr-parser.ts`](./java-antlr-parser.ts) | Java ANTLR grammar parser |
| [`java-chevrotain-parser.ts`](./java-chevrotain-parser.ts) | Java Chevrotain parser |
| [`java-native-parser.ts`](./java-native-parser.ts) | Java native tree-sitter parser |
| [`javaparser-integration.ts`](./javaparser-integration.ts) | JavaParser library integration |
| [`java/`](./java/) | Java extractors, framework support (Spring, JPA, Lombok) |
| [`kotlin-analyzer.ts`](./kotlin-analyzer.ts) | Kotlin tree-sitter analyzer |
| [`kotlin-antlr-parser.ts`](./kotlin-antlr-parser.ts) | Kotlin ANTLR parser |
| [`kotlin-native-parser.ts`](./kotlin-native-parser.ts) | Kotlin native tree-sitter parser |
| [`kotlin-k2-provider.ts`](./kotlin-k2-provider.ts) | Kotlin K2 compiler provider |
| [`kotlin-compiler-integration.ts`](./kotlin-compiler-integration.ts) | Kotlin compiler syntax validation |
| [`kotlin/`](./kotlin/) | Kotlin extractors, framework support (Android, Ktor, Coroutines) |
| ~~[`python-analyzer.ts`](./python-analyzer.ts)~~ (deleted) | Python entry-point analyzer |
| [`python-native-parser.ts`](./python-native-parser.ts) | Python native tree-sitter parser |
| [`pyright-integration.ts`](./pyright-integration.ts) | Pyright type checker integration |
| ~~[`python/`](./python/)~~ (deleted) | 4-layer Python analyzer, extractors, utils |
| [`go-analyzer.ts`](./go-analyzer.ts) | Go tree-sitter analyzer |
| [`go-native-parser.ts`](./go-native-parser.ts) | Go native tree-sitter parser |
| [`go-ast-cli.go`](./go-ast-cli.go) | Go AST CLI tool (subprocess) |
| [`rust-analyzer.ts`](./rust-analyzer.ts) | Rust layered analyzer |
| [`rust-native-parser.ts`](./rust-native-parser.ts) | Rust native tree-sitter parser |
| [`rust-analyzer-integration.ts`](./rust-analyzer-integration.ts) | rust-analyzer LSP integration |
| [`rust-antlr-parser.ts`](./rust-antlr-parser.ts) | Rust ANTLR parser |
| [`rust/`](./rust/) | Rust AST helpers, pattern identifier |
| [`c-analyzer.ts`](./c-analyzer.ts) | C tree-sitter analyzer |
| [`cpp-analyzer.ts`](./cpp-analyzer.ts) | C++ tree-sitter analyzer with STL support |
| [`cpp-native-parser.ts`](./cpp-native-parser.ts) | C++ native tree-sitter parser |
| [`cpp-declarator-utils.ts`](./cpp-declarator-utils.ts) | C++ declarator/qualifier extraction |
| [`cpp-template-utils.ts`](./cpp-template-utils.ts) | C++ template parameter extraction |
| [`bash-analyzer.ts`](./bash-analyzer.ts) | Bash script analyzer |
| [`bash-native-parser.ts`](./bash-native-parser.ts) | Bash native parser |
| [`powershell-analyzer.ts`](./powershell-analyzer.ts) | PowerShell analyzer |
| [`powershell-native-parser.ts`](./powershell-native-parser.ts) | PowerShell native parser |
| [`batch-analyzer.ts`](./batch-analyzer.ts) | Windows Batch script analyzer |
| [`json-parser.ts`](./json-parser.ts) | JSON parser with validation |
| [`html-analyzer.ts`](./html-analyzer.ts) | HTML structure analyzer |
| [`css-analyzer.ts`](./css-analyzer.ts) | CSS selectors/rules analyzer |
| [`xml-analyzer.ts`](./xml-analyzer.ts) | XML structure analyzer |
| [`swift-native-parser.ts`](./swift-native-parser.ts) | Swift native parser |
| [`zig-native-parser.ts`](./zig-native-parser.ts) | Zig native parser |
| [`python-ast-cli.py`](./python-ast-cli.py) | Python AST CLI tool (subprocess) |
| [`language-configs.ts`](./language-configs.ts) | Re-exports from language-configs/ |
| [`language-configs/`](./language-configs/) | Per-language configs (JS family, compiled, scripting, markup) |
| [`utils/parser-utils.ts`](./utils/parser-utils.ts) | Shared parser utility functions |

## New (pending description)

- **HelmParser** — `helm-parser.ts:71-898`
- **<anonymous>** — `helm-parser.ts:71-71`
- **ParserStats** — `helm-parser.ts:44-53`
- **IndentUsage** — `helm-parser.ts:55-65`
- **DefineStart** — `helm-parser.ts:446-450`
- **RegexExtractionRule** — `regex-entity-extractor.ts:27-35`
- **AntipatternHints** — `ts-antipattern-hints-extractor.ts:14-23`
- **ClassExtractorContext** — `ts-class-extractor.ts:19-24`
- **MemberContext** — `ts-class-extractor.ts:190-199`
- **FunctionExtractorContext** — `ts-function-extractor.ts:23-28`
- **ImportExportExtractorContext** — `ts-import-export-extractor.ts:11-16`
- **InterfaceExtractorContext** — `ts-interface-extractor.ts:13-18`
- **JitHints** — `ts-jit-hints-extractor.ts:10-16`
- **JSPatternsExtractorContext** — `ts-js-patterns-extractor.ts:21-26`
- **NgRxEffectInfo** — `ts-ngrx-extractor.ts:14-33`
- **NgRxReducerInfo** — `ts-ngrx-extractor.ts:35-41`
- **NgRxSelectorInfo** — `ts-ngrx-extractor.ts:43-51`
- **NgRxStoreUsageInfo** — `ts-ngrx-extractor.ts:53-64`
- **TypeExtractorContext** — `ts-type-extractor.ts:13-18`
- **u** — `helm-parser.ts:377-383`
- **a** — `helm-parser.ts:500-500`
- **index** — `helm-parser.ts:735-747`
- **runRegexExtractors** — `regex-entity-extractor.ts:51-78`
- **<anonymous>** — `regex-entity-extractor.ts:51-51`
- **index** — `regex-entity-extractor.ts:54-54`
- **extractAntipatternHints** — `ts-antipattern-hints-extractor.ts:29-157`
- **<anonymous>** — `ts-antipattern-hints-extractor.ts:29-29`
- **visit** — `ts-antipattern-hints-extractor.ts:55-123`
- **<anonymous>** — `ts-antipattern-hints-extractor.ts:55-55`
- **isNewErrorExpression** — `ts-antipattern-hints-extractor.ts:173-179`
- **<anonymous>** — `ts-antipattern-hints-extractor.ts:173-173`
- **isAssignmentOperator** — `ts-antipattern-hints-extractor.ts:181-189`
- **<anonymous>** — `ts-antipattern-hints-extractor.ts:181-181`
- **isLiteralDefault** — `ts-antipattern-hints-extractor.ts:191-196`
- **<anonymous>** — `ts-antipattern-hints-extractor.ts:191-191`
- **getBaseIdentifier** — `ts-antipattern-hints-extractor.ts:198-203`
- **<anonymous>** — `ts-antipattern-hints-extractor.ts:198-198`
- **getBody** — `ts-antipattern-hints-extractor.ts:205-218`
- **<anonymous>** — `ts-antipattern-hints-extractor.ts:205-205`
- **getExtension** — `ts-ast-helpers.ts:41-44`
- **<anonymous>** — `ts-ast-helpers.ts:41-41`
- **getLanguage** — `ts-ast-helpers.ts:46-60`
- **<anonymous>** — `ts-ast-helpers.ts:46-46`
- **getPosition** — `ts-ast-helpers.ts:62-65`
- **<anonymous>** — `ts-ast-helpers.ts:62-62`
- **getLocation** — `ts-ast-helpers.ts:67-72`
- **<anonymous>** — `ts-ast-helpers.ts:67-67`
- **getModifiers** — `ts-ast-helpers.ts:74-124`
- **<anonymous>** — `ts-ast-helpers.ts:74-74`
- **getParameters** — `ts-ast-helpers.ts:126-140`
- **<anonymous>** — `ts-ast-helpers.ts:126-126`
- **param** — `ts-ast-helpers.ts:127-139`
- **getReturnType** — `ts-ast-helpers.ts:142-147`
- **<anonymous>** — `ts-ast-helpers.ts:142-142`
- **getDecorators** — `ts-ast-helpers.ts:149-172`
- **<anonymous>** — `ts-ast-helpers.ts:149-149`
- **arg** — `ts-ast-helpers.ts:161-161`
- **extractCalls** — `ts-call-extractor.ts:21-79`
- **<anonymous>** — `ts-call-extractor.ts:21-21`
- **visit** — `ts-call-extractor.ts:24-55`
- **<anonymous>** — `ts-call-extractor.ts:24-24`
- **arg** — `ts-call-extractor.ts:38-38`
- **arg** — `ts-call-extractor.ts:49-49`
- **child** — `ts-call-extractor.ts:54-54`
- **extractCallInfo** — `ts-call-extractor.ts:84-161`
- **<anonymous>** — `ts-call-extractor.ts:84-84`
- **t** — `ts-call-extractor.ts:148-148`
- **extractTypeReferences** — `ts-call-extractor.ts:172-359`
- **<anonymous>** — `ts-call-extractor.ts:172-172`
- **addRef** — `ts-call-extractor.ts:176-205`
- **<anonymous>** — `ts-call-extractor.ts:176-176`
- **extractFromTypeNode** — `ts-call-extractor.ts:207-243`
- **<anonymous>** — `ts-call-extractor.ts:207-207`
- **addTypeReferenceRelationships** — `ts-class-extractor.ts:29-49`
- **<anonymous>** — `ts-class-extractor.ts:29-29`
- **extractClassDeclaration** — `ts-class-extractor.ts:54-188`
- **<anonymous>** — `ts-class-extractor.ts:54-54`
- **memberName** — `ts-class-extractor.ts:141-171`
- **name** — `ts-class-extractor.ts:183-183`
- **extractClassMember** — `ts-class-extractor.ts:204-234`
- **<anonymous>** — `ts-class-extractor.ts:204-204`
- **extractMethod** — `ts-class-extractor.ts:239-333`
- **<anonymous>** — `ts-class-extractor.ts:239-239`
- **d** — `ts-class-extractor.ts:277-277`
- **s** — `ts-class-extractor.ts:278-278`
- **extractProperty** — `ts-class-extractor.ts:338-433`
- **<anonymous>** — `ts-class-extractor.ts:338-338`
- **a** — `ts-class-extractor.ts:355-355`
- **a** — `ts-class-extractor.ts:376-376`
- **a** — `ts-class-extractor.ts:377-377`
- **s** — `ts-class-extractor.ts:379-379`
- **extractConstructor** — `ts-class-extractor.ts:438-465`
- **<anonymous>** — `ts-class-extractor.ts:438-438`
- **extractAccessor** — `ts-class-extractor.ts:470-506`
- **<anonymous>** — `ts-class-extractor.ts:470-470`
- **extractComplexity** — `ts-complexity-analyzer.ts:16-184`
- **<anonymous>** — `ts-complexity-analyzer.ts:16-16`
- **visit** — `ts-complexity-analyzer.ts:36-132`
- **<anonymous>** — `ts-complexity-analyzer.ts:36-36`
- **c** — `ts-complexity-analyzer.ts:63-63`
- **child** — `ts-complexity-analyzer.ts:84-84`
- **child** — `ts-complexity-analyzer.ts:131-131`
- **extractControlFlow** — `ts-control-flow-extractor.ts:22-194`
- **<anonymous>** — `ts-control-flow-extractor.ts:22-22`
- **visit** — `ts-control-flow-extractor.ts:29-166`
- **<anonymous>** — `ts-control-flow-extractor.ts:29-29`
- **extractDocumentation** — `ts-doc-extractor.ts:16-151`
- **<anonymous>** — `ts-doc-extractor.ts:16-16`
- **c** — `ts-doc-extractor.ts:36-36`
- **c** — `ts-doc-extractor.ts:49-49`
- **addFunctionCallRelationships** — `ts-function-extractor.ts:33-54`
- **<anonymous>** — `ts-function-extractor.ts:33-33`
- **addTypeReferenceRelationships** — `ts-function-extractor.ts:59-80`
- **<anonymous>** — `ts-function-extractor.ts:59-59`
- **extractFunctionDeclaration** — `ts-function-extractor.ts:85-122`
- **<anonymous>** — `ts-function-extractor.ts:85-85`
- **extractArrowFunctionOrExpression** — `ts-function-extractor.ts:127-173`
- **<anonymous>** — `ts-function-extractor.ts:127-127`
- **m** — `ts-function-extractor.ts:138-138`
- **extractVariableWithNgRx** — `ts-function-extractor.ts:178-271`
- **<anonymous>** — `ts-function-extractor.ts:178-178`
- **a** — `ts-function-extractor.ts:214-214`
- **s** — `ts-function-extractor.ts:241-241`
- **extractImportDeclaration** — `ts-import-export-extractor.ts:21-108`
- **<anonymous>** — `ts-import-export-extractor.ts:21-21`
- **extractExportDeclaration** — `ts-import-export-extractor.ts:113-126`
- **<anonymous>** — `ts-import-export-extractor.ts:113-113`
- **addTypeReferenceRelationships** — `ts-interface-extractor.ts:23-43`
- **<anonymous>** — `ts-interface-extractor.ts:23-23`
- **extractInterfaceDeclaration** — `ts-interface-extractor.ts:48-101`
- **<anonymous>** — `ts-interface-extractor.ts:48-48`
- **extractJitHints** — `ts-jit-hints-extractor.ts:22-110`
- **<anonymous>** — `ts-jit-hints-extractor.ts:22-22`
- **visit** — `ts-jit-hints-extractor.ts:45-88`
- **<anonymous>** — `ts-jit-hints-extractor.ts:45-45`
- **isPropertyName** — `ts-jit-hints-extractor.ts:116-128`
- **<anonymous>** — `ts-jit-hints-extractor.ts:116-116`
- **getBody** — `ts-jit-hints-extractor.ts:130-143`
- **<anonymous>** — `ts-jit-hints-extractor.ts:130-130`
- **addCallsRelationships** — `ts-js-patterns-extractor.ts:31-52`
- **<anonymous>** — `ts-js-patterns-extractor.ts:31-31`
- **extractPrototypeMethod** — `ts-js-patterns-extractor.ts:57-124`
- **<anonymous>** — `ts-js-patterns-extractor.ts:57-57`
- **m** — `ts-js-patterns-extractor.ts:79-79`
- **extractCommonJSExport** — `ts-js-patterns-extractor.ts:129-236`
- **<anonymous>** — `ts-js-patterns-extractor.ts:129-129`
- **m** — `ts-js-patterns-extractor.ts:192-192`
- **extractObjectLiteralWithMethods** — `ts-js-patterns-extractor.ts:241-385`
- **<anonymous>** — `ts-js-patterns-extractor.ts:241-241`
- **m** — `ts-js-patterns-extractor.ts:308-308`
- **extractIIFE** — `ts-js-patterns-extractor.ts:390-455`
- **<anonymous>** — `ts-js-patterns-extractor.ts:390-390`
- **m** — `ts-js-patterns-extractor.ts:426-426`
- **extractCommonJSRequire** — `ts-js-patterns-extractor.ts:460-555`
- **<anonymous>** — `ts-js-patterns-extractor.ts:460-460`
- **markConstructorFunction** — `ts-js-patterns-extractor.ts:560-597`
- **<anonymous>** — `ts-js-patterns-extractor.ts:560-560`
- **n** — `ts-js-patterns-extractor.ts:573-581`
- **e** — `ts-js-patterns-extractor.ts:586-586`
- **isThisKeyword** — `ts-ngrx-extractor.ts:71-73`
- **<anonymous>** — `ts-ngrx-extractor.ts:71-71`
- **visitOfTypePattern** — `ts-ngrx-extractor.ts:78-90`
- **<anonymous>** — `ts-ngrx-extractor.ts:78-78`
- **visitMapPattern** — `ts-ngrx-extractor.ts:95-124`
- **<anonymous>** — `ts-ngrx-extractor.ts:95-95`
- **bodyNode** — `ts-ngrx-extractor.ts:104-121`
- **visitServiceCallPattern** — `ts-ngrx-extractor.ts:129-173`
- **<anonymous>** — `ts-ngrx-extractor.ts:129-129`
- **extractNgRxEffectInfo** — `ts-ngrx-extractor.ts:183-233`
- **<anonymous>** — `ts-ngrx-extractor.ts:183-183`
- **visitNode** — `ts-ngrx-extractor.ts:215-223`
- **<anonymous>** — `ts-ngrx-extractor.ts:215-215`
- **extractNgRxReducerInfo** — `ts-ngrx-extractor.ts:243-274`
- **<anonymous>** — `ts-ngrx-extractor.ts:243-243`
- **extractNgRxSelectorInfo** — `ts-ngrx-extractor.ts:283-324`
- **<anonymous>** — `ts-ngrx-extractor.ts:283-283`
- **extractNgRxStoreUsage** — `ts-ngrx-extractor.ts:333-386`
- **<anonymous>** — `ts-ngrx-extractor.ts:333-333`
- **visitNode** — `ts-ngrx-extractor.ts:336-382`
- **<anonymous>** — `ts-ngrx-extractor.ts:336-336`
- **addTypeReferenceRelationships** — `ts-type-extractor.ts:23-43`
- **<anonymous>** — `ts-type-extractor.ts:23-23`
- **extractTypeAliasDeclaration** — `ts-type-extractor.ts:48-72`
- **<anonymous>** — `ts-type-extractor.ts:48-48`
- **extractEnumDeclaration** — `ts-type-extractor.ts:77-116`
- **<anonymous>** — `ts-type-extractor.ts:77-77`
- **extractNamespaceDeclaration** — `ts-type-extractor.ts:121-133`
- **<anonymous>** — `ts-type-extractor.ts:121-121`
- **measureConditionalTypeDepth** — `ts-type-extractor.ts:140-158`
- **<anonymous>** — `ts-type-extractor.ts:140-140`
- **walk** — `ts-type-extractor.ts:143-154`
- **<anonymous>** — `ts-type-extractor.ts:143-143`
- **child** — `ts-type-extractor.ts:153-153`
- **initialize** — `helm-parser.ts:88-90`
- **supportsFile** — `helm-parser.ts:100-125`
- **parse** — `helm-parser.ts:130-175`
- **parseIncremental** — `helm-parser.ts:180-187`
- **getStats** — `helm-parser.ts:192-194`
- **clearCache** — `helm-parser.ts:199-201`
- **isHelmContext** — `helm-parser.ts:208-237`
- **parseChartYaml** — `helm-parser.ts:246-308`
- **parseValuesYaml** — `helm-parser.ts:313-357`
- **parseHelmTemplate** — `helm-parser.ts:363-428`
- **extractDefines** — `helm-parser.ts:438-541`
- **extractIncludes** — `helm-parser.ts:547-605`
- **extractValueReferences** — `helm-parser.ts:611-626`
- **extractControlFlow** — `helm-parser.ts:631-689`
- **extractVariableAssigns** — `helm-parser.ts:694-720`
- **extractIndentUsage** — `helm-parser.ts:726-819`
- **getLocationFromIndex** — `helm-parser.ts:829-849`
- **getLocationFromIndexWithEnd** — `helm-parser.ts:855-897`
- **DEFINE_RE** — `helm-parser.ts:26-26`
- **END_RE** — `helm-parser.ts:27-27`
- **INCLUDE_RE** — `helm-parser.ts:28-28`
- **TEMPLATE_RE** — `helm-parser.ts:29-29`
- **VALUE_REF_RE** — `helm-parser.ts:30-30`
- **IF_RE** — `helm-parser.ts:31-31`
- **RANGE_RE** — `helm-parser.ts:32-32`
- **WITH_RE** — `helm-parser.ts:33-33`
- **ELSE_RE** — `helm-parser.ts:34-34`
- **VAR_ASSIGN_RE** — `helm-parser.ts:35-35`
- **NINDENT_RE** — `helm-parser.ts:36-36`
- **INDENT_RE** — `helm-parser.ts:37-37`
- **TOYAML_INDENT_RE** — `helm-parser.ts:38-38`
- **ext** — `helm-parser.ts:101-101`
- **base** — `helm-parser.ts:102-102`
- **startTime** — `helm-parser.ts:131-131`
- **base** — `helm-parser.ts:134-134`
- **result** — `helm-parser.ts:135-135`
- **parseTimeMs** — `helm-parser.ts:145-145`
- **parseTimeMs** — `helm-parser.ts:159-159`
- **dir** — `helm-parser.ts:209-209`
- **maxLevels** — `helm-parser.ts:210-210`
- **i** — `helm-parser.ts:212-212`
- **cached** — `helm-parser.ts:214-214`
- **chartYamlPath** — `helm-parser.ts:219-219`
- **parentDir** — `helm-parser.ts:226-226`
- **entities** — `helm-parser.ts:247-247`
- **relationships** — `helm-parser.ts:248-248`
- **nameMatch** — `helm-parser.ts:251-251`
- **chartName** — `helm-parser.ts:252-252`
- **versionMatch** — `helm-parser.ts:255-255`
- **appVersionMatch** — `helm-parser.ts:256-256`
- **descriptionMatch** — `helm-parser.ts:257-257`
- **metadata** — `helm-parser.ts:259-261`
- **nameIndex** — `helm-parser.ts:267-267`
- **depsBlockMatch** — `helm-parser.ts:277-277`
- **depsBlock** — `helm-parser.ts:279-279`
- **depNameRe** — `helm-parser.ts:280-280`
- **depMatch** — `helm-parser.ts:281-281`
- **depName** — `helm-parser.ts:284-284`
- **entities** — `helm-parser.ts:314-314`
- **lines** — `helm-parser.ts:315-315`
- **topLevelKeyRe** — `helm-parser.ts:316-316`
- **i** — `helm-parser.ts:318-318`
- **line** — `helm-parser.ts:319-319`
- **match** — `helm-parser.ts:320-320`
- **keyName** — `helm-parser.ts:323-323`
- **colonIdx** — `helm-parser.ts:325-325`
- **valueHint** — `helm-parser.ts:326-326`
- **charIndex** — `helm-parser.ts:329-329`
- **j** — `helm-parser.ts:330-330`
- **entities** — `helm-parser.ts:364-364`
- **{ entities: defineEntities, endPositions }** — `helm-parser.ts:364-364`
- **calls** — `helm-parser.ts:365-365`
- **{ calls, relationships }** — `helm-parser.ts:365-365`
- **valueReferences** — `helm-parser.ts:366-366`
- **controlFlow** — `helm-parser.ts:367-367`
- **variableEntities** — `helm-parser.ts:368-368`
- **indentUsage** — `helm-parser.ts:369-369`
- **children** — `helm-parser.ts:372-372`
- **indentMetadata** — `helm-parser.ts:375-375`
- **fileEntity** — `helm-parser.ts:387-417`
- **entities** — `helm-parser.ts:442-442`
- **endPositions** — `helm-parser.ts:443-443`
- **defineStarts** — `helm-parser.ts:452-452`
- **endIndices** — `helm-parser.ts:453-453`
- **match** — `helm-parser.ts:459-459`
- **name** — `helm-parser.ts:462-462`
- **depth** — `helm-parser.ts:481-481`
- **matchedEndIndex** — `helm-parser.ts:482-482`
- **directives** — `helm-parser.ts:486-486`
- **startLoc** — `helm-parser.ts:514-514`
- **endLoc** — `helm-parser.ts:515-515`
- **loc** — `helm-parser.ts:519-519`
- **calls** — `helm-parser.ts:551-551`
- **relationships** — `helm-parser.ts:552-552`
- **fileBase** — `helm-parser.ts:553-553`
- **match** — `helm-parser.ts:554-554`
- **templateName** — `helm-parser.ts:562-562`
- **location** — `helm-parser.ts:565-565`
- **templateName** — `helm-parser.ts:584-584`
- **location** — `helm-parser.ts:587-587`
- **refs** — `helm-parser.ts:612-612`
- **match** — `helm-parser.ts:613-613`
- **root** — `helm-parser.ts:618-618`
- **path** — `helm-parser.ts:619-619`
- **branches** — `helm-parser.ts:632-632`
- **loops** — `helm-parser.ts:633-633`
- **exceptions** — `helm-parser.ts:634-634`
- **returns** — `helm-parser.ts:635-635`
- **awaits** — `helm-parser.ts:636-636`
- **match** — `helm-parser.ts:637-637`
- **condition** — `helm-parser.ts:647-647`
- **location** — `helm-parser.ts:648-648`
- **isElseIf** — `helm-parser.ts:651-651`
- **location** — `helm-parser.ts:661-661`
- **location** — `helm-parser.ts:670-670`
- **condition** — `helm-parser.ts:679-679`
- **location** — `helm-parser.ts:680-680`
- **entities** — `helm-parser.ts:695-695`
- **match** — `helm-parser.ts:696-696`
- **varName** — `helm-parser.ts:701-701`
- **expression** — `helm-parser.ts:702-702`
- **location** — `helm-parser.ts:705-705`
- **results** — `helm-parser.ts:727-727`
- **lines** — `helm-parser.ts:728-728`
- **match** — `helm-parser.ts:729-729`
- **getLineContext** — `helm-parser.ts:735-747`
- **charCount** — `helm-parser.ts:736-736`
- **i** — `helm-parser.ts:737-737`
- **lineLen** — `helm-parser.ts:738-738`
- **lineText** — `helm-parser.ts:740-740`
- **leadingSpaces** — `helm-parser.ts:741-741`
- **indentValue** — `helm-parser.ts:752-752`
- **ctx** — `helm-parser.ts:753-753`
- **location** — `helm-parser.ts:754-754`
- **lineText** — `helm-parser.ts:757-757`
- **contextStart** — `helm-parser.ts:758-758`
- **context** — `helm-parser.ts:759-759`
- **preceedingChar** — `helm-parser.ts:775-775`
- **indentValue** — `helm-parser.ts:778-778`
- **ctx** — `helm-parser.ts:779-779`
- **location** — `helm-parser.ts:780-780`
- **lineText** — `helm-parser.ts:782-782`
- **contextStart** — `helm-parser.ts:783-783`
- **context** — `helm-parser.ts:784-784`
- **indentValue** — `helm-parser.ts:799-799`
- **ctx** — `helm-parser.ts:800-800`
- **location** — `helm-parser.ts:801-801`
- **isNindent** — `helm-parser.ts:803-803`
- **lineText** — `helm-parser.ts:804-804`
- **contextStart** — `helm-parser.ts:805-805`
- **context** — `helm-parser.ts:806-806`
- **line** — `helm-parser.ts:833-833`
- **column** — `helm-parser.ts:834-834`
- **i** — `helm-parser.ts:836-836`
- **line** — `helm-parser.ts:860-860`
- **column** — `helm-parser.ts:861-861`
- **startLine** — `helm-parser.ts:862-862`
- **startColumn** — `helm-parser.ts:863-863`
- **foundStart** — `helm-parser.ts:864-864`
- **endLine** — `helm-parser.ts:865-865`
- **endColumn** — `helm-parser.ts:866-866`
- **limit** — `helm-parser.ts:868-868`
- **i** — `helm-parser.ts:870-870`
- **entities** — `regex-entity-extractor.ts:52-52`
- **lineMap** — `regex-entity-extractor.ts:53-53`
- **getLocation** — `regex-entity-extractor.ts:54-54`
- **seen** — `regex-entity-extractor.ts:55-55`
- **match** — `regex-entity-extractor.ts:59-59`
- **key** — `regex-entity-extractor.ts:63-63`
- **entity** — `regex-entity-extractor.ts:70-70`
- **typeAssertionCount** — `ts-antipattern-hints-extractor.ts:30-30`
- **doubleAssertionCount** — `ts-antipattern-hints-extractor.ts:31-31`
- **nonNullAssertionCount** — `ts-antipattern-hints-extractor.ts:32-32`
- **throwNonErrorCount** — `ts-antipattern-hints-extractor.ts:33-33`
- **innerHtmlAssignCount** — `ts-antipattern-hints-extractor.ts:34-34`
- **orWithDefaultCount** — `ts-antipattern-hints-extractor.ts:35-35`
- **paramMutationCount** — `ts-antipattern-hints-extractor.ts:36-36`
- **regexLiterals** — `ts-antipattern-hints-extractor.ts:37-37`
- **paramNames** — `ts-antipattern-hints-extractor.ts:40-40`
- **leftText** — `ts-antipattern-hints-extractor.ts:87-87`
- **leftName** — `ts-antipattern-hints-extractor.ts:102-102`
- **methodName** — `ts-antipattern-hints-extractor.ts:110-110`
- **objName** — `ts-antipattern-hints-extractor.ts:111-111`
- **body** — `ts-antipattern-hints-extractor.ts:126-126`
- **MUTATING_METHODS** — `ts-antipattern-hints-extractor.ts:161-171`
- **ctorText** — `ts-antipattern-hints-extractor.ts:175-175`
- **SCRIPT_TARGETS** — `ts-ast-helpers.ts:15-24`
- **SCRIPT_KINDS** — `ts-ast-helpers.ts:26-35`
- **match** — `ts-ast-helpers.ts:42-42`
- **ext** — `ts-ast-helpers.ts:47-47`
- **line** — `ts-ast-helpers.ts:63-63`
- **{ line, character }** — `ts-ast-helpers.ts:63-63`
- **modifiers** — `ts-ast-helpers.ts:75-75`
- **mods** — `ts-ast-helpers.ts:78-78`
- **name** — `ts-ast-helpers.ts:128-128`
- **param** — `ts-ast-helpers.ts:129-129`
- **type** — `ts-ast-helpers.ts:129-129`
- **optional** — `ts-ast-helpers.ts:130-130`
- **defaultValue** — `ts-ast-helpers.ts:131-131`
- **decorators** — `ts-ast-helpers.ts:150-150`
- **decs** — `ts-ast-helpers.ts:153-153`
- **name** — `ts-ast-helpers.ts:156-156`
- **args** — `ts-ast-helpers.ts:157-157`
- **calls** — `ts-call-extractor.ts:22-22`
- **callInfo** — `ts-call-extractor.ts:33-33`
- **callInfo** — `ts-call-extractor.ts:44-44`
- **name** — `ts-call-extractor.ts:90-90`
- **target** — `ts-call-extractor.ts:91-91`
- **isOptional** — `ts-call-extractor.ts:92-92`
- **expr** — `ts-call-extractor.ts:94-94`
- **arg** — `ts-call-extractor.ts:132-132`
- **typeArguments** — `ts-call-extractor.ts:146-146`
- **refs** — `ts-call-extractor.ts:173-173`
- **seenTypes** — `ts-call-extractor.ts:174-174`
- **key** — `ts-call-extractor.ts:196-196`
- **typeName** — `ts-call-extractor.ts:209-209`
- **kind** — `ts-call-extractor.ts:285-285`
- **typeName** — `ts-call-extractor.ts:287-287`
- **typeName** — `ts-call-extractor.ts:315-315`
- **sourceFile** — `ts-class-extractor.ts:57-57`
- **{ sourceFile, filePath, entities, relationships }** — `ts-class-extractor.ts:57-57`
- **className** — `ts-class-extractor.ts:58-58`
- **modifiers** — `ts-class-extractor.ts:59-59`
- **baseClasses** — `ts-class-extractor.ts:62-62`
- **interfaces** — `ts-class-extractor.ts:63-63`
- **typeName** — `ts-class-extractor.ts:67-67`
- **classDocumentation** — `ts-class-extractor.ts:77-77`
- **classTypeRefs** — `ts-class-extractor.ts:78-78`
- **classLocation** — `ts-class-extractor.ts:79-79`
- **classEntity** — `ts-class-extractor.ts:81-99`
- **classDecorators** — `ts-class-extractor.ts:124-124`
- **addMemberRelationships** — `ts-class-extractor.ts:141-171`
- **calledTarget** — `ts-class-extractor.ts:156-156`
- **className** — `ts-class-extractor.ts:240-240`
- **{ className, baseClasses, classEntity, sourceFile, filePath, relationships }** — `ts-class-extractor.ts:240-240`
- **methodName** — `ts-class-extractor.ts:241-241`
- **methodModifiers** — `ts-class-extractor.ts:242-242`
- **isAsync** — `ts-class-extractor.ts:243-243`
- **methodCalls** — `ts-class-extractor.ts:244-244`
- **methodControlFlow** — `ts-class-extractor.ts:245-245`
- **methodDoc** — `ts-class-extractor.ts:246-246`
- **methodTypeRefs** — `ts-class-extractor.ts:247-247`
- **methodComplexity** — `ts-class-extractor.ts:248-248`
- **methodJitHints** — `ts-class-extractor.ts:249-249`
- **methodAntipatternHints** — `ts-class-extractor.ts:250-250`
- **methodLocation** — `ts-class-extractor.ts:251-251`
- **methodDecorators** — `ts-class-extractor.ts:252-252`
- **ngrxStoreUsage** — `ts-class-extractor.ts:255-255`
- **className** — `ts-class-extractor.ts:339-339`
- **{ className, classEntity, sourceFile, filePath, relationships }** — `ts-class-extractor.ts:339-339`
- **propName** — `ts-class-extractor.ts:340-340`
- **propDoc** — `ts-class-extractor.ts:341-341`
- **propTypeRefs** — `ts-class-extractor.ts:342-342`
- **propLocation** — `ts-class-extractor.ts:343-343`
- **ngrxEffectInfo** — `ts-class-extractor.ts:346-346`
- **entityType** — `ts-class-extractor.ts:347-347`
- **propEntity** — `ts-class-extractor.ts:361-369`
- **className** — `ts-class-extractor.ts:439-439`
- **{ className, classEntity, sourceFile, filePath }** — `ts-class-extractor.ts:439-439`
- **constructorCalls** — `ts-class-extractor.ts:440-440`
- **constructorControlFlow** — `ts-class-extractor.ts:441-441`
- **constructorDoc** — `ts-class-extractor.ts:442-442`
- **constructorTypeRefs** — `ts-class-extractor.ts:443-443`
- **constructorComplexity** — `ts-class-extractor.ts:444-444`
- **constructorAntipatternHints** — `ts-class-extractor.ts:445-445`
- **constructorLocation** — `ts-class-extractor.ts:446-446`
- **className** — `ts-class-extractor.ts:475-475`
- **{ className, classEntity, sourceFile, filePath }** — `ts-class-extractor.ts:475-475`
- **accessorName** — `ts-class-extractor.ts:476-476`
- **accessorCalls** — `ts-class-extractor.ts:477-477`
- **accessorControlFlow** — `ts-class-extractor.ts:478-478`
- **accessorDoc** — `ts-class-extractor.ts:479-479`
- **accessorTypeRefs** — `ts-class-extractor.ts:480-480`
- **accessorComplexity** — `ts-class-extractor.ts:481-481`
- **accessorLocation** — `ts-class-extractor.ts:482-482`
- **entity** — `ts-class-extractor.ts:484-495`
- **cyclomatic** — `ts-complexity-analyzer.ts:17-17`
- **cognitive** — `ts-complexity-analyzer.ts:18-18`
- **maxNestingDepth** — `ts-complexity-analyzer.ts:19-19`
- **returnCount** — `ts-complexity-analyzer.ts:20-20`
- **parameterCount** — `ts-complexity-analyzer.ts:21-21`
- **caseCount** — `ts-complexity-analyzer.ts:63-63`
- **body** — `ts-complexity-analyzer.ts:135-135`
- **startLine** — `ts-complexity-analyzer.ts:168-168`
- **endLine** — `ts-complexity-analyzer.ts:169-169`
- **linesOfCode** — `ts-complexity-analyzer.ts:170-170`
- **linesOfLogic** — `ts-complexity-analyzer.ts:173-173`
- **branches** — `ts-control-flow-extractor.ts:23-23`
- **loops** — `ts-control-flow-extractor.ts:24-24`
- **exceptions** — `ts-control-flow-extractor.ts:25-25`
- **returns** — `ts-control-flow-extractor.ts:26-26`
- **awaits** — `ts-control-flow-extractor.ts:27-27`
- **catchType** — `ts-control-flow-extractor.ts:125-127`
- **body** — `ts-control-flow-extractor.ts:169-169`
- **jsDocs** — `ts-doc-extractor.ts:18-18`
- **description** — `ts-doc-extractor.ts:21-21`
- **params** — `ts-doc-extractor.ts:22-22`
- **returns** — `ts-doc-extractor.ts:23-23`
- **throws** — `ts-doc-extractor.ts:24-24`
- **examples** — `ts-doc-extractor.ts:25-25`
- **deprecated** — `ts-doc-extractor.ts:26-26`
- **see** — `ts-doc-extractor.ts:27-27`
- **since** — `ts-doc-extractor.ts:28-28`
- **author** — `ts-doc-extractor.ts:29-29`
- **commentText** — `ts-doc-extractor.ts:35-36`
- **tagName** — `ts-doc-extractor.ts:45-45`
- **tagComment** — `ts-doc-extractor.ts:46-50`
- **paramName** — `ts-doc-extractor.ts:57-57`
- **paramType** — `ts-doc-extractor.ts:58-58`
- **paramDesc** — `ts-doc-extractor.ts:59-59`
- **isOptional** — `ts-doc-extractor.ts:60-60`
- **calledTarget** — `ts-function-extractor.ts:40-40`
- **sourceFile** — `ts-function-extractor.ts:88-88`
- **{ sourceFile, filePath, entities, relationships }** — `ts-function-extractor.ts:88-88`
- **functionName** — `ts-function-extractor.ts:89-89`
- **modifiers** — `ts-function-extractor.ts:90-90`
- **isAsync** — `ts-function-extractor.ts:91-91`
- **calls** — `ts-function-extractor.ts:92-92`
- **controlFlow** — `ts-function-extractor.ts:93-93`
- **documentation** — `ts-function-extractor.ts:94-94`
- **typeRefs** — `ts-function-extractor.ts:95-95`
- **complexity** — `ts-function-extractor.ts:96-96`
- **jitHints** — `ts-function-extractor.ts:97-97`
- **antipatternHints** — `ts-function-extractor.ts:98-98`
- **sourceFile** — `ts-function-extractor.ts:128-128`
- **{ sourceFile, filePath, entities, relationships }** — `ts-function-extractor.ts:128-128`
- **extracted** — `ts-function-extractor.ts:129-129`
- **name** — `ts-function-extractor.ts:133-133`
- **modifiers** — `ts-function-extractor.ts:134-134`
- **isAsync** — `ts-function-extractor.ts:135-138`
- **calls** — `ts-function-extractor.ts:139-139`
- **controlFlow** — `ts-function-extractor.ts:140-140`
- **documentation** — `ts-function-extractor.ts:141-141`
- **typeRefs** — `ts-function-extractor.ts:142-142`
- **complexity** — `ts-function-extractor.ts:143-143`
- **jitHints** — `ts-function-extractor.ts:144-144`
- **antipatternHints** — `ts-function-extractor.ts:145-145`
- **sourceFile** — `ts-function-extractor.ts:179-179`
- **{ sourceFile, filePath, entities, relationships }** — `ts-function-extractor.ts:179-179`
- **varName** — `ts-function-extractor.ts:188-188`
- **modifiers** — `ts-function-extractor.ts:189-189`
- **isConst** — `ts-function-extractor.ts:190-190`
- **varLocation** — `ts-function-extractor.ts:191-191`
- **reducerInfo** — `ts-function-extractor.ts:194-194`
- **selectorInfo** — `ts-function-extractor.ts:200-200`
- **reducerEntity** — `ts-function-extractor.ts:206-217`
- **selectorEntity** — `ts-function-extractor.ts:233-245`
- **sourceFile** — `ts-import-export-extractor.ts:22-22`
- **{ sourceFile, filePath, entities, relationships }** — `ts-import-export-extractor.ts:22-22`
- **moduleSpecifier** — `ts-import-export-extractor.ts:23-23`
- **source** — `ts-import-export-extractor.ts:24-24`
- **specifiers** — `ts-import-export-extractor.ts:26-30`
- **isDefault** — `ts-import-export-extractor.ts:31-31`
- **isNamespace** — `ts-import-export-extractor.ts:32-32`
- **importEntityName** — `ts-import-export-extractor.ts:61-61`
- **location** — `ts-import-export-extractor.ts:76-76`
- **importedSymbol** — `ts-import-export-extractor.ts:78-78`
- **sourceFile** — `ts-import-export-extractor.ts:114-114`
- **{ sourceFile, filePath, entities }** — `ts-import-export-extractor.ts:114-114`
- **sourceFile** — `ts-interface-extractor.ts:49-49`
- **{ sourceFile, filePath, entities, relationships }** — `ts-interface-extractor.ts:49-49`
- **interfaceName** — `ts-interface-extractor.ts:50-50`
- **modifiers** — `ts-interface-extractor.ts:51-51`
- **interfaceDoc** — `ts-interface-extractor.ts:52-52`
- **interfaceTypeRefs** — `ts-interface-extractor.ts:53-53`
- **interfaceEntity** — `ts-interface-extractor.ts:55-64`
- **propDoc** — `ts-interface-extractor.ts:72-72`
- **propTypeRefs** — `ts-interface-extractor.ts:73-73`
- **methodDoc** — `ts-interface-extractor.ts:84-84`
- **methodTypeRefs** — `ts-interface-extractor.ts:85-85`
- **deleteCount** — `ts-jit-hints-extractor.ts:23-23`
- **argumentsRefCount** — `ts-jit-hints-extractor.ts:24-24`
- **hasWithStatement** — `ts-jit-hints-extractor.ts:25-25`
- **spreadInCallCount** — `ts-jit-hints-extractor.ts:26-26`
- **dynamicPropAccessCount** — `ts-jit-hints-extractor.ts:27-27`
- **paramNames** — `ts-jit-hints-extractor.ts:30-30`
- **arg** — `ts-jit-hints-extractor.ts:81-81`
- **body** — `ts-jit-hints-extractor.ts:91-91`
- **parent** — `ts-jit-hints-extractor.ts:117-117`
- **calledTarget** — `ts-js-patterns-extractor.ts:38-38`
- **expr** — `ts-js-patterns-extractor.ts:60-60`
- **sourceFile** — `ts-js-patterns-extractor.ts:63-63`
- **{ sourceFile, filePath, entities, relationships }** — `ts-js-patterns-extractor.ts:63-63`
- **left** — `ts-js-patterns-extractor.ts:64-64`
- **right** — `ts-js-patterns-extractor.ts:65-65`
- **leftText** — `ts-js-patterns-extractor.ts:69-69`
- **prototypeMatch** — `ts-js-patterns-extractor.ts:70-70`
- **className** — `ts-js-patterns-extractor.ts:76-76`
- **[, className, methodName]** — `ts-js-patterns-extractor.ts:76-76`
- **modifiers** — `ts-js-patterns-extractor.ts:77-77`
- **isAsync** — `ts-js-patterns-extractor.ts:78-79`
- **calls** — `ts-js-patterns-extractor.ts:84-84`
- **controlFlow** — `ts-js-patterns-extractor.ts:85-85`
- **documentation** — `ts-js-patterns-extractor.ts:86-86`
- **complexity** — `ts-js-patterns-extractor.ts:87-87`
- **expr** — `ts-js-patterns-extractor.ts:132-132`
- **sourceFile** — `ts-js-patterns-extractor.ts:135-135`
- **{ sourceFile, filePath, entities, relationships }** — `ts-js-patterns-extractor.ts:135-135`
- **left** — `ts-js-patterns-extractor.ts:136-136`
- **right** — `ts-js-patterns-extractor.ts:137-137`
- **leftText** — `ts-js-patterns-extractor.ts:141-141`
- **exportLocation** — `ts-js-patterns-extractor.ts:145-145`
- **propName** — `ts-js-patterns-extractor.ts:151-151`
- **exportName** — `ts-js-patterns-extractor.ts:168-168`
- **exportsMatch** — `ts-js-patterns-extractor.ts:185-185`
- **exportName** — `ts-js-patterns-extractor.ts:187-187`
- **[, exportName]** — `ts-js-patterns-extractor.ts:187-187`
- **exportLocation** — `ts-js-patterns-extractor.ts:188-188`
- **isAsync** — `ts-js-patterns-extractor.ts:191-192`
- **calls** — `ts-js-patterns-extractor.ts:194-194`
- **controlFlow** — `ts-js-patterns-extractor.ts:195-195`
- **documentation** — `ts-js-patterns-extractor.ts:196-196`
- **complexity** — `ts-js-patterns-extractor.ts:197-197`
- **sourceFile** — `ts-js-patterns-extractor.ts:242-242`
- **{ sourceFile, filePath, entities, relationships }** — `ts-js-patterns-extractor.ts:242-242`
- **extracted** — `ts-js-patterns-extractor.ts:243-243`
- **objectName** — `ts-js-patterns-extractor.ts:250-250`
- **isConst** — `ts-js-patterns-extractor.ts:251-251`
- **objectLocation** — `ts-js-patterns-extractor.ts:252-252`
- **objectDoc** — `ts-js-patterns-extractor.ts:253-253`
- **methodCount** — `ts-js-patterns-extractor.ts:255-255`
- **propCount** — `ts-js-patterns-extractor.ts:256-256`
- **children** — `ts-js-patterns-extractor.ts:257-257`
- **methodName** — `ts-js-patterns-extractor.ts:263-263`
- **methodModifiers** — `ts-js-patterns-extractor.ts:264-264`
- **isAsync** — `ts-js-patterns-extractor.ts:265-265`
- **methodCalls** — `ts-js-patterns-extractor.ts:266-266`
- **methodControlFlow** — `ts-js-patterns-extractor.ts:267-267`
- **methodDoc** — `ts-js-patterns-extractor.ts:268-268`
- **methodComplexity** — `ts-js-patterns-extractor.ts:269-269`
- **methodLocation** — `ts-js-patterns-extractor.ts:270-270`
- **propName** — `ts-js-patterns-extractor.ts:301-301`
- **propValue** — `ts-js-patterns-extractor.ts:302-302`
- **isAsync** — `ts-js-patterns-extractor.ts:306-308`
- **methodCalls** — `ts-js-patterns-extractor.ts:310-310`
- **methodControlFlow** — `ts-js-patterns-extractor.ts:311-311`
- **methodDoc** — `ts-js-patterns-extractor.ts:312-312`
- **methodComplexity** — `ts-js-patterns-extractor.ts:313-313`
- **methodLocation** — `ts-js-patterns-extractor.ts:314-314`
- **sourceFile** — `ts-js-patterns-extractor.ts:393-393`
- **{ sourceFile, filePath, entities, relationships }** — `ts-js-patterns-extractor.ts:393-393`
- **callExpr** — `ts-js-patterns-extractor.ts:394-394`
- **funcExpr** — `ts-js-patterns-extractor.ts:395-395`
- **inner** — `ts-js-patterns-extractor.ts:399-399`
- **propAccess** — `ts-js-patterns-extractor.ts:406-406`
- **inner** — `ts-js-patterns-extractor.ts:408-408`
- **methodName** — `ts-js-patterns-extractor.ts:410-410`
- **iifeName** — `ts-js-patterns-extractor.ts:420-423`
- **isAsync** — `ts-js-patterns-extractor.ts:425-426`
- **calls** — `ts-js-patterns-extractor.ts:428-428`
- **controlFlow** — `ts-js-patterns-extractor.ts:429-429`
- **documentation** — `ts-js-patterns-extractor.ts:430-430`
- **complexity** — `ts-js-patterns-extractor.ts:431-431`
- **sourceFile** — `ts-js-patterns-extractor.ts:461-461`
- **{ sourceFile, filePath, entities, relationships }** — `ts-js-patterns-extractor.ts:461-461`
- **extracted** — `ts-js-patterns-extractor.ts:462-462`
- **arg** — `ts-js-patterns-extractor.ts:475-475`
- **source** — `ts-js-patterns-extractor.ts:478-478`
- **location** — `ts-js-patterns-extractor.ts:479-479`
- **specifiers** — `ts-js-patterns-extractor.ts:508-508`
- **local** — `ts-js-patterns-extractor.ts:512-512`
- **imported** — `ts-js-patterns-extractor.ts:513-514`
- **funcName** — `ts-js-patterns-extractor.ts:563-563`
- **hasThisAssignments** — `ts-js-patterns-extractor.ts:570-570`
- **thisProperties** — `ts-js-patterns-extractor.ts:571-571`
- **checkThisUsage** — `ts-js-patterns-extractor.ts:573-581`
- **existingEntity** — `ts-js-patterns-extractor.ts:586-586`
- **calleeExpr** — `ts-ngrx-extractor.ts:79-79`
- **actionName** — `ts-ngrx-extractor.ts:83-83`
- **line** — `ts-ngrx-extractor.ts:84-84`
- **{ line, character }** — `ts-ngrx-extractor.ts:84-84`
- **calleeExpr** — `ts-ngrx-extractor.ts:96-96`
- **findActionCalls** — `ts-ngrx-extractor.ts:104-121`
- **actionCallee** — `ts-ngrx-extractor.ts:106-106`
- **name** — `ts-ngrx-extractor.ts:109-109`
- **line** — `ts-ngrx-extractor.ts:112-112`
- **{ line, character }** — `ts-ngrx-extractor.ts:112-112`
- **calleeExpr** — `ts-ngrx-extractor.ts:130-130`
- **objectExpr** — `ts-ngrx-extractor.ts:133-133`
- **methodName** — `ts-ngrx-extractor.ts:134-134`
- **serviceName** — `ts-ngrx-extractor.ts:138-138`
- **line** — `ts-ngrx-extractor.ts:141-141`
- **{ line, character }** — `ts-ngrx-extractor.ts:141-141`
- **actionName** — `ts-ngrx-extractor.ts:165-165`
- **line** — `ts-ngrx-extractor.ts:166-166`
- **{ line, character }** — `ts-ngrx-extractor.ts:166-166`
- **callee** — `ts-ngrx-extractor.ts:187-187`
- **result** — `ts-ngrx-extractor.ts:190-195`
- **configArg** — `ts-ngrx-extractor.ts:199-199`
- **callee** — `ts-ngrx-extractor.ts:246-246`
- **result** — `ts-ngrx-extractor.ts:249-249`
- **argCallee** — `ts-ngrx-extractor.ts:254-254`
- **i** — `ts-ngrx-extractor.ts:258-258`
- **actionArg** — `ts-ngrx-extractor.ts:259-259`
- **actionName** — `ts-ngrx-extractor.ts:261-261`
- **line** — `ts-ngrx-extractor.ts:262-262`
- **{ line, character }** — `ts-ngrx-extractor.ts:262-262`
- **callee** — `ts-ngrx-extractor.ts:286-286`
- **result** — `ts-ngrx-extractor.ts:289-289`
- **featureArg** — `ts-ngrx-extractor.ts:294-294`
- **i** — `ts-ngrx-extractor.ts:309-309`
- **selectorArg** — `ts-ngrx-extractor.ts:310-310`
- **selectorName** — `ts-ngrx-extractor.ts:312-312`
- **line** — `ts-ngrx-extractor.ts:313-313`
- **{ line, character }** — `ts-ngrx-extractor.ts:313-313`
- **result** — `ts-ngrx-extractor.ts:334-334`
- **calleeExpr** — `ts-ngrx-extractor.ts:338-338`
- **methodName** — `ts-ngrx-extractor.ts:341-341`
- **objectExpr** — `ts-ngrx-extractor.ts:342-342`
- **isStoreCall** — `ts-ngrx-extractor.ts:345-349`
- **actionName** — `ts-ngrx-extractor.ts:355-355`
- **line** — `ts-ngrx-extractor.ts:361-361`
- **{ line, character }** — `ts-ngrx-extractor.ts:361-361`
- **selectorName** — `ts-ngrx-extractor.ts:369-369`
- **line** — `ts-ngrx-extractor.ts:370-370`
- **{ line, character }** — `ts-ngrx-extractor.ts:370-370`
- **sourceFile** — `ts-type-extractor.ts:49-49`
- **{ sourceFile, filePath, entities, relationships }** — `ts-type-extractor.ts:49-49`
- **typeName** — `ts-type-extractor.ts:50-50`
- **typeDoc** — `ts-type-extractor.ts:51-51`
- **typeRefs** — `ts-type-extractor.ts:52-52`
- **conditionalTypeDepth** — `ts-type-extractor.ts:55-55`
- **sourceFile** — `ts-type-extractor.ts:78-78`
- **{ sourceFile, filePath, entities }** — `ts-type-extractor.ts:78-78`
- **enumDoc** — `ts-type-extractor.ts:79-79`
- **modifiers** — `ts-type-extractor.ts:80-80`
- **isConstEnum** — `ts-type-extractor.ts:83-83`
- **hasStringInit** — `ts-type-extractor.ts:84-84`
- **enumEntity** — `ts-type-extractor.ts:92-104`
- **sourceFile** — `ts-type-extractor.ts:122-122`
- **{ sourceFile, filePath, entities }** — `ts-type-extractor.ts:122-122`
- **nameDoc** — `ts-type-extractor.ts:123-123`
- **maxDepth** — `ts-type-extractor.ts:141-141`
- **newDepth** — `ts-type-extractor.ts:145-145`
- **Directive** — `helm-parser.ts:485-485`
- **CallInfo** — `ts-call-extractor.ts:16-16`
- **TypeReference** — `ts-call-extractor.ts:167-167`
- **Complexity** — `ts-complexity-analyzer.ts:11-11`
- **ControlFlow** — `ts-control-flow-extractor.ts:12-12`
- **BranchInfo** — `ts-control-flow-extractor.ts:13-13`
- **LoopInfo** — `ts-control-flow-extractor.ts:14-14`
- **ExceptionInfo** — `ts-control-flow-extractor.ts:15-15`
- **ReturnInfo** — `ts-control-flow-extractor.ts:16-16`
- **AwaitInfo** — `ts-control-flow-extractor.ts:17-17`
- **Documentation** — `ts-doc-extractor.ts:11-11`
