---
module_name: java-extractors
description: "AST-based extractors for calls, control flow, complexity, and documentation from Java code"
status: active
language: typescript
---

# Java Extractors

> Provides optimized AST-traversal extractors for method calls, control flow structures, complexity metrics, and JavaDoc documentation from Java ANTLR parse trees.

## Overview

This module contains specialized extractors that walk Java ANTLR AST nodes to produce detailed analysis results. The `unified-extractor` performs all three extractions (calls, control flow, complexity) in a single AST pass for 40-50% performance improvement. Individual extractors are retained for backward compatibility. The `doc-extractor` parses JavaDoc comments from token streams.

## Data Flow

- **Inputs**: ANTLR `ParserRuleContext` nodes from Java method bodies and `CommonTokenStream` for doc extraction
- **Processing**: Recursive AST traversal with node-type dispatch maps; single-pass unified extraction or individual specialized passes
- **Outputs**: `CallInfo[]`, `ControlFlowInfo`, `ComplexityMetrics`, `JavaDocInfo` structures

## Public API

| Export | Type | Description | Location |
|--------|------|-------------|----------|
| `extractUnified` | function | Single-pass extraction of calls, control flow, and complexity | [`unified-extractor.ts:103-220`](./unified-extractor.ts) |
| `UnifiedExtractionResult` | interface | Combined result type for unified extraction | [`unified-extractor.ts:34-38`](./unified-extractor.ts) |
| `extractCalls` | function | Extracts all method/constructor calls from a body | [`call-extractor.ts:35-44`](./call-extractor.ts) |
| `extractCallsSimple` | function | Returns call names as string array (backward compat) | [`call-extractor.ts:49-55`](./call-extractor.ts) |
| `extractCallsDetailed` | const | Alias for `extractCalls` | [`call-extractor.ts:60-60`](./call-extractor.ts) |
| `extractControlFlow` | function | Extracts branches, loops, exceptions, returns | [`control-flow-extractor.ts:27-40`](./control-flow-extractor.ts) |
| `getControlFlowStats` | function | Gets statistics from control flow info | [`control-flow-extractor.ts:361-367`](./control-flow-extractor.ts) |
| `hasExceptionHandling` | function | Checks for try/catch presence | [`control-flow-extractor.ts:380-382`](./control-flow-extractor.ts) |
| `getCaughtExceptionTypes` | function | Lists caught exception types | [`control-flow-extractor.ts:387-389`](./control-flow-extractor.ts) |
| `calculateComplexity` | function | Calculates all complexity metrics | [`complexity-analyzer.ts:27-61`](./complexity-analyzer.ts) |
| `calculateCyclomaticComplexity` | function | McCabe cyclomatic complexity | [`complexity-analyzer.ts:57-126`](./complexity-analyzer.ts) |
| `calculateCognitiveComplexity` | function | Sonar-style cognitive complexity | [`complexity-analyzer.ts:111-167`](./complexity-analyzer.ts) |
| `calculateClassComplexity` | function | Aggregate class-level metrics | [`complexity-analyzer.ts:336-340`](./complexity-analyzer.ts) |
| `getComplexityRating` | function | Returns low/medium/high/very-high rating | [`complexity-analyzer.ts:414-446`](./complexity-analyzer.ts) |
| `getRefactoringSuggestions` | function | Suggests refactoring based on metrics | [`complexity-analyzer.ts:451-475`](./complexity-analyzer.ts) |
| `COMPLEXITY_THRESHOLDS` | const | Threshold values for complexity ratings | [`complexity-analyzer.ts:388-409`](./complexity-analyzer.ts) |
| `extractJavaDoc` | function | Extracts JavaDoc from token stream | [`doc-extractor.ts:29-40`](./doc-extractor.ts) |
| `parseJavaDocText` | function | Parses raw JavaDoc text | [`doc-extractor.ts:45-48`](./doc-extractor.ts) |
| `extractJavaDocFromSource` | function | Extracts JavaDoc from source at a line | [`doc-extractor.ts:281-281`](./doc-extractor.ts) |

## Dependencies

### Internal Modules
| Module | Purpose |
|--------|---------|
| `../types` | Shared Java parser type definitions |
| `../utils/ast-helpers` | AST location extraction and keyword sets |
| `../../../generated/java/Java20Parser` | ANTLR-generated parser context types |

### External Packages
| Package | Purpose |
|---------|---------|
| `antlr4ng` | ANTLR4 runtime (`ParserRuleContext`, `CommonTokenStream`) |

## Behavioral Properties

| Property | Value |
|----------|-------|
| Unified pass performance | 40-50% faster than 3 separate passes |
| Call deduplication | By `line:column:name` key |
| Complexity base | Cyclomatic starts at 1 (base complexity) |

## Error Handling

All extractors handle null/undefined inputs by returning empty results. Node type detection uses constructor name strings, silently skipping unrecognized nodes.

## Known Limitations

- Constructor name-based type detection (`node.constructor.name`) may break with minification
- Cognitive complexity nesting tracking uses line-based map, which can collide on same-line structures
- JavaDoc extraction requires token stream access; may miss comments in edge cases

## Files

| File | Description |
|------|-------------|
| `unified-extractor.ts` | Single-pass extractor combining calls, control flow, and complexity analysis |
| `call-extractor.ts` | AST-aware extraction of method invocations and constructor calls |
| `complexity-analyzer.ts` | Cyclomatic/cognitive complexity calculation with thresholds and ratings |
| `control-flow-extractor.ts` | Extraction of branches, loops, exceptions, and return statements |
| `doc-extractor.ts` | JavaDoc comment parsing with support for all standard tags |
