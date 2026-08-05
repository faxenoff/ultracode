# Parser Utils

## 🤖 Overview

The `parser-utils.ts` module provides performance optimizations for ANTLR parsing, including SLL mode with fallback, parser/lexer instance pooling, and unified AST traversal. It is used by developers to enhance parsing efficiency in their ANTLR-based applications.

## 🤖 Architecture

```
  parser
  |
  v
  SLL mode parser
  |
  v
  fallback to ALL(*) parser
  |
  v
  parser instance pool
  |
  v
  unified AST traversal
```

## 🤖 Flow

```
  input
  |
  v
  SLL mode parser
  |
  v
  parse result
  |
  v
  fallback to ALL(*) parser if needed
  |
  v
  parser instance pool
  |
  v
  parser/lexer instance reused
  |
  v
  unified AST traversal
```

## 🤖 Entity Listing

### Function
- **calculateLinesOfCode** — Counts the number of lines of code in a given string, excluding comments and empty lines `parser-utils.ts:418-439`
- **canContainCalls** — Determines if a node name is relevant for containing method invocations `parser-utils.ts:469-471`
- **logParserPerformance** — Logs performance metrics for parser operations if they exceed a certain duration `parser-utils.ts:476-484`
- **parseWithSLLFallback** — Parses with SLL mode first, falling back to ALL(*) on ambiguity `parser-utils.ts:36-67`
- **unifiedExtract** — Extracts method invocations, class instance creations, and control flow information from a parser context `parser-utils.ts:270-413`
- **visit** — Traces the nesting depth and identifies method invocations, class instance creations, and control flow structures in a parser context `parser-utils.ts:304-397`

### Method
- **acquire** — Function to acquire an object from the pool `parser-utils.ts:107-114`
- **clear** — Clears the object pool, releasing all instances back to the pool `parser-utils.ts:145-147`
- **constructor** — Represents the constructor for the object pool `parser-utils.ts:98-102`
- **getStats** — Function to get statistics about the object pool `parser-utils.ts:131-140`
- **release** — Function to release an object back to the pool `parser-utils.ts:119-126`

### Class
- **ObjectPool** — Represents an object pool for parser instances `parser-utils.ts:89-148`

### Interface
- **AwaitInfo** — Represents information about an await in the parser `parser-utils.ts:228-231`
- **BranchInfo** — Stores information about a specific branch in the control flow `parser-utils.ts:193-197`
- **CallInfo** — Stores information about a specific call to the parser `parser-utils.ts:166-177`
- **ComplexityMetrics** — Represents metrics for code complexity, including cyclomatic complexity, cognitive complexity, and other related metrics `parser-utils.ts:244-252`
- **ControlFlowInfo** — Stores information about the control flow of the parser `parser-utils.ts:182-188`
- **ExceptionInfo** — Represents information about an exception in the parser `parser-utils.ts:210-214`
- **LocationInfo** — Represents information about the location of a parser rule `parser-utils.ts:236-239`
- **LoopInfo** — Represents information about a loop in the parser `parser-utils.ts:202-205`
- **NodeTypeChecker** — Defines an interface for checking node types in a parser context `parser-utils.ts:257-265`
- **ParserWithInterpreter** — Interface for parser with interpreter `parser-utils.ts:72-77`
- **ReturnInfo** — Represents information about a return in the parser `parser-utils.ts:219-223`
- **UnifiedExtractionResult** — Represents the result of a unified AST traversal for extractors `parser-utils.ts:157-161`

### Import_decl
- **../../logging/index.js** — Imports `../../logging/index.js` from `../../logging/index.js`. `parser-utils.ts:16-16`
- **antlr4ng** — Imports `antlr4ng` from `antlr4ng`. `parser-utils.ts:15-15`

### Property
- **acquired** — Represents the number of objects acquired from the pool `parser-utils.ts:95-95`
- **acquired** — Returns the number of acquired objects `parser-utils.ts:131-131`
- **argumentCount** — Stores the number of arguments passed to the call `parser-utils.ts:170-170`
- **awaits** — Counts the number of await statements in the control flow `parser-utils.ts:187-187`
- **branches** — Counts the number of branches in the control flow `parser-utils.ts:183-183`
- **calls** — Counts the number of calls made to the parser `parser-utils.ts:158-158`
- **catchType** — Represents the type of exception caught `parser-utils.ts:212-212`
- **cognitive** — Cognitive complexity metric `parser-utils.ts:246-246`
- **column** — Represents the column number of a parser rule `parser-utils.ts:237-237`
- **column** — Stores the column number of the end position `parser-utils.ts:238-238`
- **complexity** — Measures the complexity of the parser's control flow `parser-utils.ts:160-160`
- **condition** — Represents a condition for parsing `parser-utils.ts:195-195`
- **controlFlow** — Analyzes the control flow of the parser `parser-utils.ts:159-159`
- **created** — Represents the number of objects created in the pool `parser-utils.ts:94-94`
- **created** — Returns the number of created objects `parser-utils.ts:131-131`
- **cyclomatic** — Cyclomatic complexity metric `parser-utils.ts:245-245`
- **end** — Represents the end position of a parser rule `parser-utils.ts:238-238`
- **exceptions** — Counts the number of exceptions in the control flow `parser-utils.ts:185-185`
- **expression** — Represents an expression in the parser `parser-utils.ts:230-230`
- **factory** — Represents the factory for creating parser instances `parser-utils.ts:91-91`
- **factory** — Initializes the parser with a factory function `parser-utils.ts:98-98`
- **hasValue** — Indicates whether a value is present `parser-utils.ts:221-221`
- **hitRate** — Indicates the rate at which the object pool is hit, i.e., the frequency of reusing existing instances `parser-utils.ts:131-131`
- **index** — Represents the index of a parser rule `parser-utils.ts:237-237`
- **index** — Provides performance optimizations for ANTLR parsing `parser-utils.ts:238-238`
- **interpreter** — Represents the parser's interpreter `parser-utils.ts:73-75`
- **isExtensionCall** — Indicates whether the call is an extension call `parser-utils.ts:175-175`
- **isNew** — Indicates whether the call is new or reused `parser-utils.ts:171-171`
- **isSafeCall** — Indicates whether the call is safe `parser-utils.ts:174-174`
- **isStatic** — Indicates whether the call is static `parser-utils.ts:172-172`
- **isSuper** — Indicates whether the call is a super call `parser-utils.ts:173-173`
- **label** — Represents a label in the parser `parser-utils.ts:222-222`
- **line** — Represents the line number of a parser rule `parser-utils.ts:237-237`
- **line** — Stores the line number of the end position `parser-utils.ts:238-238`
- **linesOfCode** — Lines of code metric `parser-utils.ts:247-247`
- **linesOfLogic** — Lines of logic metric `parser-utils.ts:248-248`
- **location** — Stores the location of the call `parser-utils.ts:169-169`
- **location** — Represents the location of a parser rule `parser-utils.ts:196-196`
- **location** — Stores the location information for the parser `parser-utils.ts:204-204`
- **location** — Represents the location information of a parsed element `parser-utils.ts:213-213`
- **location** — Represents the location information for a parser `parser-utils.ts:220-220`, `parser-utils.ts:229-229`
- **loops** — Counts the number of loops in the control flow `parser-utils.ts:184-184`
- **maxSize** — Represents the maximum size of the object pool `parser-utils.ts:93-93`
- **maxSize** — Sets the maximum size for the parser `parser-utils.ts:98-98`
- **name** — Stores the name of the call `parser-utils.ts:167-167`
- **nestingDepth** — Nesting depth metric `parser-utils.ts:249-249`
- **parameterCount** — Represents the count of parameters in a function `parser-utils.ts:250-250`
- **pool** — Represents the object pool `parser-utils.ts:90-90`
- **poolSize** — Represents the size of the object pool used for parser instances `parser-utils.ts:131-131`
- **predictionMode** — Represents the prediction mode of the parser `parser-utils.ts:74-74`
- **released** — Represents the number of objects released back to the pool `parser-utils.ts:96-96`
- **released** — Returns the number of released objects `parser-utils.ts:131-131`
- **reset** — Function to reset parser state before retry `parser-utils.ts:76-76`
- **reset** — Resets the object `parser-utils.ts:92-92`
- **reset** — Initializes the parser with a factory function `parser-utils.ts:98-98`
- **returnCount** — Represents the count of return statements in a function `parser-utils.ts:251-251`
- **returns** — Counts the number of return statements in the control flow `parser-utils.ts:186-186`
- **start** — Represents the start position of a parser rule `parser-utils.ts:237-237`
- **target** — Stores the target of the call `parser-utils.ts:168-168`
- **type** — Represents the type of a parser rule `parser-utils.ts:194-194`
- **type** — Specifies the type of loop or control structure `parser-utils.ts:203-203`
- **type** — Specifies the type of exception handling `parser-utils.ts:211-211`
- **typeArguments** — Stores the type arguments for the call `parser-utils.ts:176-176`

## Data Flow

- **Inputs**: ANTLR parser instances, `ParserRuleContext` AST nodes, and `NodeTypeChecker` interfaces for language-specific node classification
- **Processing**: SLL/ALL(*) prediction mode switching; instance pool get/release lifecycle; single-pass recursive AST traversal with dispatch tables
- **Outputs**: Parse trees from SLL fallback; pooled instances; `UnifiedExtractionResult` with calls, control flow, and complexity metrics

## Public API

| Export | Type | Description | Location |
|--------|------|-------------|----------|
| `parseWithSLLFallback` | function | SLL-first parsing with ALL(*) fallback | [`parser-utils.ts:36-67`](./parser-utils.ts) |
| `ObjectPool` | class | Generic object pool for instance reuse | [`parser-utils.ts:89-148`](./parser-utils.ts) |
| `unifiedExtract` | function | Single-pass AST extraction for calls, flow, complexity | [`parser-utils.ts:270-413`](./parser-utils.ts) |
| `UnifiedExtractionResult` | interface | Combined extraction result type | [`parser-utils.ts:162-292`](./parser-utils.ts) |
| `CallInfo` | interface | Method/constructor call information | [`parser-utils.ts:170-170`](./parser-utils.ts) |
| `ControlFlowInfo` | interface | Code flow control information | [`parser-utils.ts:186-186`](./parser-utils.ts) |
| `BranchInfo` | interface | Conditional branch information | [`parser-utils.ts:197-237`](./parser-utils.ts) |
| `LoopInfo` | interface | Loop information | [`parser-utils.ts:206-214`](./parser-utils.ts) |
| `ExceptionInfo` | interface | Exception handling information | [`parser-utils.ts:214-237`](./parser-utils.ts) |
| `ReturnInfo` | interface | Return statement information | [`parser-utils.ts:223-237`](./parser-utils.ts) |
| `AwaitInfo` | interface | Async await information | [`parser-utils.ts:21-618`](./parser-utils.ts) |
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
