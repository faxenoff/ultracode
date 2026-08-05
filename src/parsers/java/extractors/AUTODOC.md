# Java Extractors

## 🤖 Overview

This module provides a set of extractors for Java code, focusing on method calls, constructor calls, and static calls. It is used by developers and analysts to understand and analyze Java code structures.

## 🤖 Architecture

```
call-extractor.ts
│
├── extractCalls
│   └── visits method bodies to extract calls
│
├── complexity-analyzer.ts
│   └── analyzes code complexity
│
├── control-flow-extractor.ts
│   └── extracts control flow information
│
├── doc-extractor.ts
│   └── extracts documentation comments
│
└── unified-extractor.ts
    └── unifies and processes extracted information
```

## 🤖 Flow

```
call-extractor.ts
│
├── extractCalls
│   └── visits method bodies to extract calls
│
├── complexity-analyzer.ts
│   └── analyzes code complexity
│
├── control-flow-extractor.ts
│   └── extracts control flow information
│
├── doc-extractor.ts
│   └── extracts documentation comments
│
└── unified-extractor.ts
    └── unifies and processes extracted information
```

## 🤖 Entity Listing

### Function
- **calculateCognitiveComplexity** — Not explicitly defined in the provided code `complexity-analyzer.ts:125-174`
- **calculateComplexity** — Calculates complexity metrics for a given Java method body `complexity-analyzer.ts:67-94`
- **calculateCyclomaticComplexity** — Not explicitly defined in the provided code `complexity-analyzer.ts:100-119`
- **calculateLinesOfCode** — Method to calculate lines of code in a method body `unified-extractor.ts:629-650`
- **catchCount** — Not explicitly defined in the provided code `complexity-analyzer.ts:115-115`
- **countArguments** — Counts arguments of a method call `call-extractor.ts:328-338`
- **countArguments** — Method to count arguments in a method invocation `unified-extractor.ts:589-598`
- **exceedsThresholds** — Not explicitly defined in the provided code `complexity-analyzer.ts:184-186`
- **extractBranch** — Method to extract branch information `unified-extractor.ts:375-468`
- **extractCalls** — Extracts all method and constructor calls from a method body `call-extractor.ts:35-44`
- **extractCallsSimple** — Extracts calls and returns simple string array for backward compatibility `call-extractor.ts:49-55`
- **extractClassInstanceCreationInfo** — Extracts class instance creation information `call-extractor.ts:223-256`
- **extractClassInstanceCreationInfo** — Method to extract class instance creation information `unified-extractor.ts:300-330`
- **extractControlFlow** — Extracts control flow information from a method body `control-flow-extractor.ts:27-40`
- **extractDoWhileLoop** — Extracts do-while loops `control-flow-extractor.ts:251-256`
- **extractEnhancedForLoop** — Extracts enhanced for loops `control-flow-extractor.ts:231-236`
- **extractException** — Method to extract exception information `unified-extractor.ts:477-543`
- **extractForLoop** — Extracts for loops `control-flow-extractor.ts:221-226`
- **extractIfStatement** — Extracts conditional branches with conditions `control-flow-extractor.ts:112-143`
- **extractJavaDoc** — Extracts and parses JavaDoc comments using shared doc parsing from jvm/shared-doc-parser `doc-extractor.ts:28-38`
- **extractJavaDocFromSource** — Parses JavaDoc from source code at a specific declaration line `doc-extractor.ts:86-88`
- **extractMethodInvocationInfo** — Extracts method invocation information `call-extractor.ts:136-214`
- **extractMethodInvocationInfo** — Method to extract method invocation information `unified-extractor.ts:229-295`
- **extractPrimaryTarget** — Extracts primary target of a call `call-extractor.ts:306-323`
- **extractPrimaryTarget** — Method to extract primary target information `unified-extractor.ts:571-584`
- **extractReturn** — Method to extract return information `unified-extractor.ts:552-562`
- **extractReturnStatement** — Extracts return statements `control-flow-extractor.ts:341-352`
- **extractSwitchStatement** — Extracts switch statements `control-flow-extractor.ts:148-191`
- **extractTernaryExpression** — Extracts ternary expressions `control-flow-extractor.ts:196-212`
- **extractThrowStatement** — Extracts throw statements `control-flow-extractor.ts:311-332`
- **extractTryStatement** — Extracts try statements `control-flow-extractor.ts:265-306`
- **extractTypeArguments** — Extracts type arguments of a method call `call-extractor.ts:343-356`
- **extractTypeArguments** — Method to extract type arguments in a method invocation `unified-extractor.ts:603-616`
- **extractUnified** — Function to extract calls, control flow, and complexity metrics in a single AST pass `unified-extractor.ts:103-220`
- **extractUnqualifiedCreation** — Extracts unqualified class instance creation information `call-extractor.ts:261-297`
- **extractUnqualifiedCreation** — Method to extract unqualified class instance creation information `unified-extractor.ts:335-366`
- **extractWhileLoop** — Extracts while loops `control-flow-extractor.ts:241-246`
- **getCaughtExceptionTypes** — Retrieves the types of exceptions caught in the control flow `control-flow-extractor.ts:387-389`
- **getComplexityRating** — Not explicitly defined in the provided code `complexity-analyzer.ts:180-182`
- **getControlFlowStats** — Returns statistics about control flow, including branch count, loop count, exception count, return count, and whether there are early returns `control-flow-extractor.ts:361-375`
- **getRefactoringSuggestions** — Not explicitly defined in the provided code `complexity-analyzer.ts:188-190`
- **hasExceptionHandling** — Checks if the control flow has exception handling `control-flow-extractor.ts:380-382`
- **isClassInstanceCreation** — Checks if a node is a class instance creation `call-extractor.ts:117-119`
- **isMethodInvocation** — Checks if a node is a method invocation `call-extractor.ts:110-112`
- **isStaticTarget** — Checks if a call is a static call `call-extractor.ts:361-366`
- **isStaticTarget** — Method to determine if a target is static `unified-extractor.ts:621-624`
- **names** — Maps call info to names for simple extraction `call-extractor.ts:53-53`
- **parseJavaDoc** — Parses JavaDoc comment text and dispatches tag handling for Java-specific tags `doc-extractor.ts:49-80`
- **parseJavaDocText** — Parses JavaDoc text and returns a JavaDocInfo object `doc-extractor.ts:40-43`
- **result** — Placeholder for result of extraction `call-extractor.ts:353-353`
- **result** — Result object containing extracted information `unified-extractor.ts:613-613`
- **visit** — Method to traverse the AST and extract information `unified-extractor.ts:130-203`
- **visitNode** — Recursively visits all nodes to find calls `call-extractor.ts:69-101`
- **visitNode** — Recursively visits nodes to extract control flow `control-flow-extractor.ts:49-103`

### Interface
- **UnifiedExtractionResult** — Result of unified extraction containing calls, control flow, and complexity metrics `unified-extractor.ts:34-38`

### Import_decl
- **../../../generated/java/Java20Parser.js** — Imports `../../../generated/java/Java20Parser.js`. `call-extractor.ts:16-24`, `unified-extractor.ts:16-23`
- **../../jvm/shared-complexity.js** — Imports `../../jvm/shared-complexity.js`. `complexity-analyzer.ts:10-21`
- **../../jvm/shared-doc-parser.js** — Imports `../../jvm/shared-doc-parser.js`. `doc-extractor.ts:10-18`
- **../types.js** — Imports `../types.js` from `../types.js`. `call-extractor.ts:25-25`, `complexity-analyzer.ts:22-22`, `control-flow-extractor.ts:17-17`, `doc-extractor.ts:19-19`, `unified-extractor.ts:24-24`
- **../utils/ast-helpers.js** — Imports `../utils/ast-helpers.js` from `../utils/ast-helpers.js`. `call-extractor.ts:26-26`, `control-flow-extractor.ts:18-18`, `unified-extractor.ts:25-25`
- **./control-flow-extractor.js** — Imports `./control-flow-extractor.js` from `./control-flow-extractor.js`. `complexity-analyzer.ts:23-23`
- **antlr4ng** — Imports `antlr4ng` from `antlr4ng`. `call-extractor.ts:15-15`, `complexity-analyzer.ts:9-9`, `control-flow-extractor.ts:16-16`, `doc-extractor.ts:9-9`, `unified-extractor.ts:15-15`

### Property
- **branchCount** — Represents the number of branches in the control flow `control-flow-extractor.ts:362-362`
- **calls** — Array of call information extracted from the method body `unified-extractor.ts:35-35`
- **complexity** — Complexity metrics extracted from the method body `unified-extractor.ts:37-37`
- **controlFlow** — Control flow information extracted from the method body `unified-extractor.ts:36-36`
- **exceptionCount** — Represents the number of exceptions in the control flow `control-flow-extractor.ts:364-364`
- **hasEarlyReturn** — Indicates whether there are multiple returns in the control flow `control-flow-extractor.ts:366-366`
- **loopCount** — Represents the number of loops in the control flow `control-flow-extractor.ts:363-363`
- **returnCount** — Represents the number of returns in the control flow `control-flow-extractor.ts:365-365`

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
