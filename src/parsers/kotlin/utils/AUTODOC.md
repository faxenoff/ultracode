---
module_name: kotlin-utils
description: "AST helper utilities for Kotlin ANTLR parser traversal and data extraction"
status: active
language: typescript
---

# Kotlin Utils

> Provides utility functions for traversing Kotlin ANTLR AST nodes, extracting text and locations, handling types, and detecting Kotlin-specific patterns like scope functions, coroutine builders, and extension functions.

## Overview

This module contains shared helper functions used by all Kotlin extractors. It provides AST location extraction, node traversal utilities, text helpers, type parsing (including nullable types and generics), and Kotlin-specific constants and checks for keywords, scope functions, coroutine builders, Flow operators, companion objects, and extension functions.

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
