# Kotlin Utils

## 🤖 Overview

This module provides Kotlin-specific AST helper utilities for parsing and analyzing Kotlin code. It includes functions for extracting base type names, checking nullable types, and handling Kotlin-specific keywords. Developers working with Kotlin codebases can use this module to enhance their AST analysis capabilities.

## 🤖 Architecture

```
  +---------------------+
  | Kotlin AST Helpers |
  |     (ast-helpers.ts) |
  +---------------------+
           |
           v
  +---------------------+
  | Shared JVM Helpers |
  | (from shared-ast-helpers.js) |
  +---------------------+
           |
           v
  +---------------------+
  | Kotlin-Specific |
  | Type Extraction |
  | (extractBaseTypeName) |
  +---------------------+
           |
           v
  +---------------------+
  | Kotlin-Specific |
  | Keywords Check |
  | (isNullableType) |
  +---------------------+
           |
           v
  +---------------------+
  | Kotlin-Specific |
  | Keywords List |
  | (KOTLIN_KEYWORDS) |
  +---------------------+
```

## 🤖 Flow

```
  +---------------------+
  | Kotlin AST Parsing |
  | (from shared-ast-helpers.js) |
  +---------------------+
           |
           v
  +---------------------+
  | Kotlin-Specific |
  | Type Extraction |
  | (extractBaseTypeName) |
  +---------------------+
           |
           v
  +---------------------+
  | Kotlin-Specific |
  | Keywords Check |
  | (isNullableType) |
  +---------------------+
           |
           v
  +----------------
```

## 🤖 Entity Listing

### Function
- **determineCallTarget** — Analyzes an expression to determine its call target, name, and whether it's a safe call `ast-helpers.ts:200-224`
- **extractBaseTypeName** — Extracts the base type name from a Kotlin type expression by removing generics, nullable markers, and star projections `ast-helpers.ts:29-35`
- **extractReceiverType** — Extracts the receiver type from a function text `ast-helpers.ts:248-252`
- **isCompanionCall** — Checks if a target is a companion call `ast-helpers.ts:229-231`
- **isCoroutineBuilder** — Identifies if a given name is a Kotlin coroutine builder `ast-helpers.ts:181-183`
- **isExtensionFunction** — Checks if a function text represents an extension function `ast-helpers.ts:257-259`
- **isFlowOperator** — Checks if a given name is a Kotlin flow operator `ast-helpers.ts:188-190`
- **isKotlinKeyword** — Checks if a given name is a Kotlin keyword `ast-helpers.ts:167-169`
- **isLambdaInvocation** — Determines if an expression is a lambda invocation `ast-helpers.ts:236-239`
- **isNullableType** — Checks if a type is nullable by ending with a question mark `ast-helpers.ts:40-42`
- **isScopeFunction** — Determines if a given name is a Kotlin scope function `ast-helpers.ts:174-176`
- **parts** — Splits an expression text into parts based on the safe call pattern `ast-helpers.ts:209-209`

### Property
- **isSafeCall** — Determines if a call is safe `ast-helpers.ts:203-203`
- **name** — Represents the name of a call in the determined call target object `ast-helpers.ts:202-202`
- **target** — Represents the target of a call in the determined call target object `ast-helpers.ts:201-201`

## Data Flow

- **Inputs**: ANTLR `ParserRuleContext` nodes, `TerminalNode` instances, and type expression strings
- **Processing**: Traverses AST hierarchies, extracts token positions, classifies call patterns
- **Outputs**: `LocationInfo` objects, filtered node lists, classification booleans

## Public API

| Export | Type | Description | Location |
|--------|------|-------------|----------|
| `getLocation` | function | Extracts position from an ANTLR context | [`ast-helpers.ts:29-35`](./ast-helpers.ts) |
| `getTerminalLocation` | function | Gets coordinates from a terminal node | [`ast-helpers.ts:40-42`](./ast-helpers.ts) |
| `visitChildren` | function | Visits child nodes with a visitor function | [`ast-helpers.ts:66-80`](./ast-helpers.ts) |
| `findAllDescendants` | function | Finds all descendants matching a predicate | [`ast-helpers.ts:85-105`](./ast-helpers.ts) |
| `findAncestor` | function | Finds first ancestor matching a predicate | [`ast-helpers.ts:110-122`](./ast-helpers.ts) |
| `getText` | function | Safely gets context text | [`ast-helpers.ts:131-133`](./ast-helpers.ts) |
| `getTextTrimmed` | function | Gets trimmed context text | [`ast-helpers.ts:138-140`](./ast-helpers.ts) |
| `getIdentifierText` | function | Safely extracts identifier text | [`ast-helpers.ts:145-149`](./ast-helpers.ts) |
| `extractBaseTypeName` | function | Removes generics/arrays from type text | [`ast-helpers.ts:159-165`](./ast-helpers.ts) |
| `extractGenericArguments` | function | Parses generic type arguments | [`ast-helpers.ts:170-194`](./ast-helpers.ts) |
| `isNullableType` | function | Checks if type ends with `?` | [`ast-helpers.ts:199-201`](./ast-helpers.ts) |
| `KOTLIN_KEYWORDS` | const | Set of Kotlin reserved words | [`ast-helpers.ts:210-328`](./ast-helpers.ts) |
| `KOTLIN_SCOPE_FUNCTIONS` | const | Set of scope functions (let, run, etc.) | [`ast-helpers.ts:287-287`](./ast-helpers.ts) |
| `KOTLIN_COROUTINE_BUILDERS` | const | Set of coroutine builders | [`ast-helpers.ts:292-328`](./ast-helpers.ts) |
| `KOTLIN_FLOW_OPERATORS` | const | Set of Flow operators | [`ast-helpers.ts:304-328`](./ast-helpers.ts) |
| `isKotlinKeyword` | function | Checks if name is a Kotlin keyword | [`ast-helpers.ts:326-328`](./ast-helpers.ts) |
| `isScopeFunction` | function | Checks if name is a scope function | [`ast-helpers.ts:333-335`](./ast-helpers.ts) |
| `isCoroutineBuilder` | function | Checks if name is a coroutine builder | [`ast-helpers.ts:340-342`](./ast-helpers.ts) |
| `isFlowOperator` | function | Checks if name is a Flow operator | [`ast-helpers.ts:347-349`](./ast-helpers.ts) |
| `determineCallTarget` | function | Parses expression for call target | [`ast-helpers.ts:359-363`](./ast-helpers.ts) |
| `isCompanionCall` | function | Checks for companion object call | [`ast-helpers.ts:388-390`](./ast-helpers.ts) |
| `isSuperCall` | function | Checks for super call | [`ast-helpers.ts:395-397`](./ast-helpers.ts) |
| `isThisCall` | function | Checks for this call | [`ast-helpers.ts:402-404`](./ast-helpers.ts) |
| `isLambdaInvocation` | function | Checks for lambda invocation | [`ast-helpers.ts:409-412`](./ast-helpers.ts) |
| `extractReceiverType` | function | Extracts receiver type for extension functions | [`ast-helpers.ts:421-425`](./ast-helpers.ts) |
| `isExtensionFunction` | function | Checks if function is an extension function | [`ast-helpers.ts:430-432`](./ast-helpers.ts) |

## Dependencies

### Internal Modules
| Module | Purpose |
|--------|---------|
| `../types` | `AntlrContext`, `LocationInfo` type definitions |

### External Packages
| Package | Purpose |
|---------|---------|
| `antlr4ng` | `ParserRuleContext`, `TerminalNode` types |

## Behavioral Properties

| Property | Value |
|----------|-------|
| Thread Safety | All functions are pure/stateless |
| Kotlin-specific pattern sets | Scope functions, coroutine builders, Flow operators |
| Companion call detection | Checks for `Companion` in target string |

## Error Handling

All functions use defensive optional chaining and return safe defaults (empty strings, false, null) for missing inputs.

## Known Limitations

- Extension function detection is heuristic-based (checks for receiver type in AST, not type resolution)
- Companion call detection uses simple string matching

## Files

| File | Description |
|------|-------------|
| `ast-helpers.ts` | AST traversal, location extraction, type helpers, Kotlin keyword/pattern constants, and call target classification |
