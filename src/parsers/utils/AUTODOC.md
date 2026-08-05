---
module_name: parser-utils
description: "ANTLR parser utilities with SLL fallback, object pooling, and unified AST extraction"
status: active
language: typescript
---

# Parser Utils

> Provides performance-optimized utilities for ANTLR parsing: SLL-mode parsing with ALL(*) fallback, parser/lexer instance pooling, and a unified AST extraction function that combines calls, control flow, and complexity analysis in a single traversal.

## Overview

This module addresses three performance bottlenecks in ANTLR-based parsing. First, `parseWithSLLFallback` tries the faster SLL prediction mode (succeeds ~95% of the time for valid code) before falling back to ALL(*). Second, `ObjectPool` reuses parser and lexer instances to avoid constructor allocation overhead. Third, `unifiedExtract` performs call extraction, control flow analysis, and complexity calculation in one AST pass instead of three separate traversals, achieving 40-50% speedup.

## Data Flow

- **Inputs**: ANTLR parser instances, `ParserRuleContext` AST nodes, and `NodeTypeChecker` interfaces for language-specific node classification
- **Processing**: SLL/ALL(*) prediction mode switching; instance pool get/release lifecycle; single-pass recursive AST traversal with dispatch tables
- **Outputs**: Parse trees from SLL fallback; pooled instances; `UnifiedExtractionResult` with calls, control flow, and complexity metrics

## Public API

| Export | Type | Description | Location |
|--------|------|-------------|----------|
| `parseWithSLLFallback` | function | SLL-first parsing with ALL(*) fallback | [`parser-utils.ts:36-67`](./parser-utils.ts) |
| `ObjectPool` | class | Generic object pool for instance reuse | [`parser-utils.ts:93-93`](./parser-utils.ts) |
| `unifiedExtract` | function | Single-pass AST extraction for calls, flow, complexity | [`parser-utils.ts:270-413`](./parser-utils.ts) |
| `UnifiedExtractionResult` | interface | Combined extraction result type | [`parser-utils.ts:161-237`](./parser-utils.ts) |
| `CallInfo` | interface | Method/constructor call information | [`parser-utils.ts:170-170`](./parser-utils.ts) |
| `ControlFlowInfo` | interface | Code flow control information | [`parser-utils.ts:186-186`](./parser-utils.ts) |
| `BranchInfo` | interface | Conditional branch information | [`parser-utils.ts:197-237`](./parser-utils.ts) |
| `LoopInfo` | interface | Loop information | [`parser-utils.ts:206-214`](./parser-utils.ts) |
| `ExceptionInfo` | interface | Exception handling information | [`parser-utils.ts:214-237`](./parser-utils.ts) |
| `ReturnInfo` | interface | Return statement information | [`parser-utils.ts:223-237`](./parser-utils.ts) |
| `AwaitInfo` | interface | Async await information | [`parser-utils.ts:232-239`](./parser-utils.ts) |
| `LocationInfo` | interface | Source code position information | [`parser-utils.ts:240-252`](./parser-utils.ts) |
| `ComplexityMetrics` | interface | Cyclomatic and cognitive complexity | [`parser-utils.ts:248-248`](./parser-utils.ts) |
| `NodeTypeChecker` | interface | Language-specific node type classification | [`parser-utils.ts:257-265`](./parser-utils.ts) |
| `CALL_RELEVANT_NODE_TYPES` | const | Set of node types that can contain calls | [`parser-utils.ts:453-453`](./parser-utils.ts) |
| `canContainCalls` | function | Checks if a node can contain calls | [`parser-utils.ts:476-484`](./parser-utils.ts) |
| `logParserPerformance` | function | Logs slow parsing operations | [`parser-utils.ts:476-484`](./parser-utils.ts) |

## Dependencies

### Internal Modules
| Module | Purpose |
|--------|---------|
| `../../logging/index` | Logging infrastructure for performance warnings |

### External Packages
| Package | Purpose |
|---------|---------|
| `antlr4ng` | ANTLR4 runtime (`ParserRuleContext`, `PredictionMode`) |

## Behavioral Properties

| Property | Value |
|----------|-------|
| SLL success rate | ~95% for valid code |
| SLL performance gain | 15-20% faster than ALL(*) alone |
| Object pooling gain | 20-30% by avoiding allocations |
| Unified traversal gain | 40-50% faster than 3 separate passes |

## Error Handling

`parseWithSLLFallback` catches SLL prediction failures and retries with ALL(*). `ObjectPool` creates new instances when pool is empty. `logParserPerformance` warns on parsing operations exceeding time thresholds.

## Known Limitations

- `ObjectPool` does not limit pool size, which could use excess memory in extreme cases
- `unifiedExtract` requires a `NodeTypeChecker` to be provided for each language
- SLL fallback adds a single retry per parse, which may mask grammar ambiguity issues

## Files

| File | Description |
|------|-------------|
| `parser-utils.ts` | SLL fallback parsing, object pooling, unified extraction, type definitions, and performance logging |
