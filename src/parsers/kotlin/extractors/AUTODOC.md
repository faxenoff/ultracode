# Kotlin Extractors

## 🤖 Overview

The `extractors` module provides a suite of tools for analyzing Kotlin code, focusing on extracting function calls, method invocations, and other relevant AST elements. Developers and static analysis tools use this module to understand and process Kotlin code structures.

## 🤖 Architecture

```
  +---------------------+
  |  call-extractor.ts  |
  +---------------------+
  |  complexity-analyzer.ts  |
  +---------------------+
  |  control-flow-extractor.ts  |
  +---------------------+
  |  doc-extractor.ts  |
  +---------------------+
  |  unified-extractor.ts  |
  +---------------------+
```

## 🤖 Flow

```
  +---------------------+
  |  call-extractor.ts  |
  +---------------------+
  |     /               |
  |    /                |
  |   /                 |
  |  /                  |
  | /                   |
  |/                    |
  +---------------------+
  |  unified-extractor.ts  |
  +---------------------+
  |     /               |
  |    /                |
  |   /                 |
  |  /                  |
  | /                   |
  |/                    |
  +---------------------+
```

## 🤖 Entity Listing

### Function
- **calculateCognitiveComplexity** — Evaluates the cognitive complexity of a code context `complexity-analyzer.ts:131-188`
- **calculateComplexity** — Calculates complexity metrics for a given code context `complexity-analyzer.ts:65-92`
- **calculateCoroutineComplexity** — Calculates the complexity of coroutine usage in the provided code `complexity-analyzer.ts:223-236`
- **calculateCyclomaticComplexity** — Determines the cyclomatic complexity of a control flow `complexity-analyzer.ts:98-125`
- **calculateKotlinSpecificComplexity** — Calculates specific complexity metrics for Kotlin code, including extension function count, scope function usage, null safety operators, and coroutine complexity `complexity-analyzer.ts:209-221`
- **calculateLinesOfCode** — Parses a string of code and counts the number of lines of code, excluding comments and empty lines `unified-extractor.ts:685-706`
- **catchCount** — Counts the number of catch blocks in the control flow `complexity-analyzer.ts:113-113`
- **checkSafeCall** — Checks if a call is a safe call (?.) `call-extractor.ts:310-317`, `unified-extractor.ts:643-649`
- **cleanKDocDescription** — Cleans the description part of a KDoc comment `doc-extractor.ts:145-147`
- **countArguments** — Counts the number of arguments in a call `call-extractor.ts:322-333`
- **countArguments** — Counts the number of arguments in a function call `unified-extractor.ts:654-665`
- **countNestedScopeFunctions** — Counts the number of nested scope functions in the provided code `complexity-analyzer.ts:190-203`
- **exceedsThresholds** — Determines if complexity metrics exceed predefined thresholds `complexity-analyzer.ts:246-248`
- **extractBranch** — Extracts branch information from a node `unified-extractor.ts:412-513`
- **extractCallFromSuffix** — Extracts a call from a suffix `call-extractor.ts:226-277`
- **extractCallFromSuffix** — Extracts a call from a suffix expression `unified-extractor.ts:361-403`
- **extractCalls** — Extracts all function and method calls from a function body `call-extractor.ts:37-46`
- **extractCallsFromPostfix** — Extracts calls from a PostfixUnaryExpression `call-extractor.ts:131-205`
- **extractCallsFromPostfix** — Extracts calls from a postfix expression `unified-extractor.ts:247-307`
- **extractCallsSimple** — Extracts calls and returns simple string array for backward compatibility `call-extractor.ts:51-57`
- **extractControlFlow** — Extracts control flow information from a function body `control-flow-extractor.ts:30-44`
- **extractDoWhileLoop** — Extracts do-while loops `control-flow-extractor.ts:253-258`
- **extractElvisExpression** — Handles elvis operator (?:) `control-flow-extractor.ts:204-224`
- **extractException** — Extracts exception information from a node `unified-extractor.ts:522-582`
- **extractFieldRefsFromPostfix** — Extracts field references from a postfix expression `unified-extractor.ts:313-356`
- **extractForLoop** — Extracts loop constructs `control-flow-extractor.ts:233-238`
- **extractIfExpression** — Extracts conditional branches with conditions `control-flow-extractor.ts:112-151`
- **extractJumpExpression** — Parses a return statement and records its location, value, and label if present `control-flow-extractor.ts:341-367`
- **extractJumpExpression** — Extracts jump expression information from a node `unified-extractor.ts:591-612`
- **extractKDoc** — Extracts and parses KDoc comments from a token stream `doc-extractor.ts:29-39`
- **extractKDocFromSource** — Extracts KDoc comments from a source file `doc-extractor.ts:153-155`
- **extractNavigationName** — Extracts the navigation name from a call `call-extractor.ts:286-305`
- **extractNavigationName** — Extracts navigation name information from a node `unified-extractor.ts:621-638`
- **extractThrowExpression** — Extracts throw expressions `control-flow-extractor.ts:311-332`
- **extractTryExpression** — Extracts exception handling patterns `control-flow-extractor.ts:267-306`
- **extractTypeArguments** — Extracts type arguments for a generic call `call-extractor.ts:338-348`
- **extractTypeArguments** — Extracts type arguments from a function call `unified-extractor.ts:670-680`
- **extractUnified** — Extracts calls, control flow, and complexity metrics in a single AST pass `unified-extractor.ts:113-238`
- **extractWhenExpression** — Handles Kotlin 'when' expressions `control-flow-extractor.ts:156-199`
- **extractWhileLoop** — Extracts while loops `control-flow-extractor.ts:243-248`
- **getCaughtExceptionTypes** — Retrieves the types of exceptions caught in the control flow `control-flow-extractor.ts:406-408`
- **getComplexityRating** — Determines the complexity rating based on given metrics and thresholds `complexity-analyzer.ts:242-244`
- **getControlFlowStats** — Returns statistics about control flow, including branch count, loop count, exception count, return count, and flags for early returns, when expressions, and elvis operators `control-flow-extractor.ts:376-394`
- **getRefactoringSuggestions** — Provides refactoring suggestions based on complexity metrics and code analysis `complexity-analyzer.ts:250-269`
- **hasExceptionHandling** — Checks if the control flow has exception handling `control-flow-extractor.ts:399-401`
- **hasLabeledReturns** — Determines if the control flow has labeled returns `control-flow-extractor.ts:413-415`
- **isCoroutineCall** — Checks if a call is a coroutine call `call-extractor.ts:357-359`
- **isPostfixUnaryExpression** — Checks if a node is a PostfixUnaryExpression `call-extractor.ts:100-102`
- **isPotentialSuspendCall** — Checks if a call is a potential suspend call `call-extractor.ts:371-385`
- **isScopeFunctionCall** — Checks if a call is a scope function call `call-extractor.ts:364-366`
- **names** — Maps call names to their target objects `call-extractor.ts:55-55`
- **parseKDoc** — Parses a KDoc comment and dispatches tag parsing `doc-extractor.ts:50-95`
- **parseKDocText** — Parses KDoc text and returns a KDocInfo object `doc-extractor.ts:41-44`
- **parsePropertyTag** — Parses a @property tag and updates the result object `doc-extractor.ts:101-116`
- **parseSampleTag** — Parses a @sample tag and updates the result object `doc-extractor.ts:118-127`
- **parseSuppressTag** — Parses a @suppress tag and updates the result object `doc-extractor.ts:129-138`
- **processSuffix** — Processes the suffix of a call `call-extractor.ts:210-221`
- **result** — Represents the result of a call extraction `call-extractor.ts:345-345`
- **result** — Represents the result of unified extraction, containing calls, field references, control flow, and complexity metrics `unified-extractor.ts:677-677`
- **visit** — A method for visiting nodes in the AST during the unified extraction `unified-extractor.ts:142-212`
- **visitNode** — Recursively visits all nodes to find calls `call-extractor.ts:71-91`
- **visitNode** — Recursively visits nodes to extract control flow `control-flow-extractor.ts:53-103`

### Interface
- **FieldReferenceInfo** — Represents a reference to a field with its name, target, and line number `unified-extractor.ts:42-46`
- **UnifiedExtractionResult** — The result of a unified extraction, containing calls, field references, control flow, and complexity metrics `unified-extractor.ts:48-53`

### Import_decl
- **../../../generated/kotlin/KotlinParser.js** — Imports `../../../generated/kotlin/KotlinParser.js`. `call-extractor.ts:18-26`, `unified-extractor.ts:24-31`
- **../../jvm/shared-complexity.js** — Imports `../../jvm/shared-complexity.js`. `complexity-analyzer.ts:10-21`
- **../../jvm/shared-doc-parser.js** — Imports `../../jvm/shared-doc-parser.js`. `doc-extractor.ts:10-19`
- **../types.js** — Imports `../types.js` from `../types.js`. `call-extractor.ts:27-27`, `complexity-analyzer.ts:22-22`, `control-flow-extractor.ts:20-20`, `doc-extractor.ts:20-20`, `unified-extractor.ts:32-32`
- **../utils/ast-helpers.js** — Imports `../utils/ast-helpers.js` from `../utils/ast-helpers.js`. `call-extractor.ts:28-28`, `control-flow-extractor.ts:21-21`, `unified-extractor.ts:33-33`
- **./control-flow-extractor.js** — Imports `./control-flow-extractor.js` from `./control-flow-extractor.js`. `complexity-analyzer.ts:23-23`
- **antlr4ng** — Imports `antlr4ng` from `antlr4ng`. `call-extractor.ts:17-17`, `complexity-analyzer.ts:9-9`, `control-flow-extractor.ts:19-19`, `doc-extractor.ts:9-9`, `unified-extractor.ts:23-23`

### Property
- **branchCount** — Represents the count of branches in the control flow `control-flow-extractor.ts:377-377`
- **calls** — An array of call information extracted during the unified extraction `unified-extractor.ts:49-49`
- **complexity** — Complexity metrics extracted during the unified extraction `unified-extractor.ts:52-52`
- **controlFlow** — Control flow information extracted during the unified extraction `unified-extractor.ts:51-51`
- **coroutineComplexity** — Represents the complexity of coroutine usage in the code `complexity-analyzer.ts:213-213`
- **exceptionCount** — Represents the count of exceptions in the control flow `control-flow-extractor.ts:379-379`
- **extensionFunctionCount** — Represents the count of extension functions in the code `complexity-analyzer.ts:210-210`
- **fieldReferences** — An array of field reference information extracted during the unified extraction `unified-extractor.ts:50-50`
- **hasEarlyReturn** — Indicates if the control flow has multiple returns `control-flow-extractor.ts:381-381`
- **hasElvisOperator** — Indicates if the control flow has an elvis operator `control-flow-extractor.ts:383-383`
- **hasWhenExpression** — Indicates if the control flow has a when expression `control-flow-extractor.ts:382-382`
- **line** — The line number where the field reference occurs `unified-extractor.ts:45-45`
- **loopCount** — Represents the count of loops in the control flow `control-flow-extractor.ts:378-378`
- **name** — The name of a field reference `unified-extractor.ts:43-43`
- **nullSafetyOperators** — Represents the count of null safety operators in the code `complexity-analyzer.ts:212-212`
- **returnCount** — Represents the count of returns in the control flow `control-flow-extractor.ts:380-380`
- **scopeFunctionUsage** — Represents the usage count of scope functions in the code `complexity-analyzer.ts:211-211`
- **target** — The target of a field reference, if applicable `unified-extractor.ts:44-44`

## Data Flow

- **Inputs**: ANTLR `ParserRuleContext` nodes from Kotlin function bodies and `CommonTokenStream` for KDoc
- **Processing**: Recursive AST traversal with node-type dispatch maps; handles Kotlin's `PostfixUnaryExpression` call chains
- **Outputs**: `CallInfo[]`, `ControlFlowInfo`, `ComplexityMetrics`, `KDocInfo` structures

## Public API

| Export | Type | Description | Location |
|--------|------|-------------|----------|
| `extractUnified` | function | Single-pass extraction of calls, control flow, and complexity | [`unified-extractor.ts:106-106`](./unified-extractor.ts) |
| `UnifiedExtractionResult` | interface | Combined result type | [`unified-extractor.ts:42-46`](./unified-extractor.ts) |
| `extractCalls` | function | Extracts all function/method calls from a body | [`call-extractor.ts:37-46`](./call-extractor.ts) |
| `extractCallsSimple` | function | Returns call names as string array | [`call-extractor.ts:51-57`](./call-extractor.ts) |
| `extractCallsDetailed` | const | Alias for `extractCalls` | [`call-extractor.ts:62-62`](./call-extractor.ts) |
| `isCoroutineCall` | function | Checks if call is a coroutine builder | [`call-extractor.ts:357-359`](./call-extractor.ts) |
| `isScopeFunctionCall` | function | Checks if call is a scope function | [`call-extractor.ts:364-366`](./call-extractor.ts) |
| `isPotentialSuspendCall` | function | Heuristic check for suspend function calls | [`call-extractor.ts:371-385`](./call-extractor.ts) |
| `extractControlFlow` | function | Extracts branches, loops, exceptions, returns | [`control-flow-extractor.ts:30-44`](./control-flow-extractor.ts) |
| `getControlFlowStats` | function | Gets control flow statistics | [`control-flow-extractor.ts:376-384`](./control-flow-extractor.ts) |
| `hasExceptionHandling` | function | Checks for try/catch presence | [`control-flow-extractor.ts:399-401`](./control-flow-extractor.ts) |
| `getCaughtExceptionTypes` | function | Lists caught exception types | [`control-flow-extractor.ts:406-408`](./control-flow-extractor.ts) |
| `hasLabeledReturns` | function | Checks for labeled return statements | [`control-flow-extractor.ts:413-415`](./control-flow-extractor.ts) |
| `calculateComplexity` | function | Calculates all complexity metrics | [`complexity-analyzer.ts:28-62`](./complexity-analyzer.ts) |
| `calculateCyclomaticComplexity` | function | McCabe complexity with Kotlin extras | [`complexity-analyzer.ts:72-289`](./complexity-analyzer.ts) |
| `calculateCognitiveComplexity` | function | Sonar-style with Kotlin-specific penalties | [`complexity-analyzer.ts:116-181`](./complexity-analyzer.ts) |
| `calculateKotlinSpecificComplexity` | function | Extension/scope/null-safety/coroutine metrics | [`complexity-analyzer.ts:413-418`](./complexity-analyzer.ts) |
| `calculateClassComplexity` | function | Aggregate class-level metrics | [`complexity-analyzer.ts:361-365`](./complexity-analyzer.ts) |
| `getComplexityRating` | function | Returns low/medium/high/very-high rating | [`complexity-analyzer.ts:481-510`](./complexity-analyzer.ts) |
| `getRefactoringSuggestions` | function | Kotlin-aware refactoring suggestions | [`complexity-analyzer.ts:515-556`](./complexity-analyzer.ts) |
| `COMPLEXITY_THRESHOLDS` | const | Kotlin-tuned threshold values | [`complexity-analyzer.ts:455-476`](./complexity-analyzer.ts) |
| `extractKDoc` | function | Extracts KDoc from token stream | [`doc-extractor.ts:30-41`](./doc-extractor.ts) |
| `parseKDocText` | function | Parses raw KDoc text | [`doc-extractor.ts:36-67`](./doc-extractor.ts) |
| `extractKDocFromSource` | function | Extracts KDoc from source at a line | [`doc-extractor.ts:344-344`](./doc-extractor.ts) |

## Dependencies

### Internal Modules
| Module | Purpose |
|--------|---------|
| `../types` | Shared Kotlin type definitions |
| `../utils/ast-helpers` | AST location, keyword checks, scope/coroutine detection |
| `../../../generated/kotlin/KotlinParser` | ANTLR-generated parser context types |

### External Packages
| Package | Purpose |
|---------|---------|
| `antlr4ng` | ANTLR4 runtime (`ParserRuleContext`, `CommonTokenStream`) |

## Behavioral Properties

| Property | Value |
|----------|-------|
| Unified pass performance | 40-50% faster than 3 separate passes |
| Kotlin-specific cyclomatic additions | `?.let{}`, `?.run{}` add to cyclomatic complexity |
| Cognitive complexity extras | Labeled returns, nested scope functions add penalties |

## Error Handling

All extractors return empty/default results for null inputs. Node type detection uses constructor name strings. KDoc parsing is defensive with regex-based tag splitting.

## Known Limitations

- Safe call + scope function complexity is estimated via regex on code text, not precise AST analysis
- KDoc `@suppress` tag handling is simplified (single warning per tag)
- Nested coroutine complexity detection uses heuristic regex matching

## Files

| File | Description |
|------|-------------|
| `unified-extractor.ts` | Single-pass extractor for calls, control flow, and complexity with Kotlin-specific handling |
| `call-extractor.ts` | AST-aware extraction of function calls, safe calls, scope functions, and coroutine builders |
| `complexity-analyzer.ts` | Complexity calculation with Kotlin-specific metrics (scope functions, null safety, coroutines) |
| `control-flow-extractor.ts` | Extraction of if/when/elvis branches, loops, exceptions, and labeled returns |
| `doc-extractor.ts` | KDoc comment parsing with Kotlin-specific tags (@property, @receiver, @sample, @suppress) |
