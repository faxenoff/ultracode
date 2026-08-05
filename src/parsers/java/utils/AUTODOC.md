# Java Utils

## 🤖 Overview

The `ast-helpers.ts` module provides utilities for parsing and manipulating Java ANTLR Abstract Syntax Trees (ASTs). It includes shared JVM helpers and Java-specific type extraction and method call detection. Developers using this module will primarily interact with the exported functions for type analysis and AST traversal.

## 🤖 Architecture

```
  extractGenericArguments
  findAllDescendants
  findAncestor
  getIdentifierText
  getLocation
  getTerminalLocation
  getText
  getTextTrimmed
  isSuperCall
  isThisCall
  visitChildren
  extractBaseTypeName
  JAVA_KEYWORDS
```

## 🤖 Flow

```
  extractGenericArguments
  findAllDescendants
  findAncestor
  getIdentifierText
  getLocation
  getTerminalLocation
  getText
  getTextTrimmed
  isSuperCall
  isThisCall
  visitChildren
  extractBaseTypeName
  JAVA_KEYWORDS
```

## 🤖 Entity Listing

### Function
- **determineCallTarget** — Parses an expression text to determine the call target and method name `ast-helpers.ts:120-136`
- **extractBaseTypeName** — Extracts the base type name from a Java type expression by removing generics, arrays, and varargs `ast-helpers.ts:29-35`
- **isJavaKeyword** — Checks if a given name is a Java keyword `ast-helpers.ts:102-104`
- **isJavaPrimitive** — Determines if a given type is a Java primitive `ast-helpers.ts:109-111`
- **isStaticCall** — Checks if a target is a static call by testing if it starts with an uppercase letter `ast-helpers.ts:141-144`

### Property
- **name** — Represents the method name part of a call target in the `determineCallTarget` function `ast-helpers.ts:120-120`
- **target** — Represents the target part of a call target in the `determineCallTarget` function `ast-helpers.ts:120-120`

## Data Flow

- **Inputs**: ANTLR `ParserRuleContext` nodes, `TerminalNode` instances, and type expression strings
- **Processing**: Traverses AST node hierarchies, extracts token positions, parses type strings for generics and base types
- **Outputs**: `LocationInfo` objects, filtered node lists, extracted text strings, parsed type components

## Public API

| Export | Type | Description | Location |
|--------|------|-------------|----------|
| `getLocation` | function | Extracts position information from an ANTLR context | [`ast-helpers.ts:29-35`](./ast-helpers.ts) |
| `getTerminalLocation` | function | Gets coordinates from a terminal node | [`ast-helpers.ts:40-57`](./ast-helpers.ts) |
| `visitChildren` | function | Recursively visits child nodes with a visitor function | [`ast-helpers.ts:66-80`](./ast-helpers.ts) |
| `findAllDescendants` | function | Finds all descendants matching a predicate | [`ast-helpers.ts:102-104`](./ast-helpers.ts) |
| `findAncestor` | function | Finds first ancestor matching a predicate | [`ast-helpers.ts:110-122`](./ast-helpers.ts) |
| `getText` | function | Safely gets context text or empty string | [`ast-helpers.ts:120-136`](./ast-helpers.ts) |
| `getTextTrimmed` | function | Gets trimmed context text | [`ast-helpers.ts:138-140`](./ast-helpers.ts) |
| `getIdentifierText` | function | Safely extracts identifier text | [`ast-helpers.ts:145-149`](./ast-helpers.ts) |
| `extractBaseTypeName` | function | Removes generics and arrays from type text | [`ast-helpers.ts:158-164`](./ast-helpers.ts) |
| `extractGenericArguments` | function | Parses generic type arguments from a string | [`ast-helpers.ts:169-194`](./ast-helpers.ts) |
| `JAVA_KEYWORDS` | const | Set of Java reserved words | [`ast-helpers.ts:203-263`](./ast-helpers.ts) |
| `JAVA_PRIMITIVES` | const | Set of Java primitive types | [`ast-helpers.ts:256-256`](./ast-helpers.ts) |
| `isJavaKeyword` | function | Checks if a string is a Java keyword | [`ast-helpers.ts:261-263`](./ast-helpers.ts) |
| `isJavaPrimitive` | function | Checks if a type is a Java primitive | [`ast-helpers.ts:268-270`](./ast-helpers.ts) |
| `determineCallTarget` | function | Parses expression to determine call target and name | [`ast-helpers.ts:279-279`](./ast-helpers.ts) |
| `isStaticCall` | function | Checks if target indicates a static call | [`ast-helpers.ts:300-303`](./ast-helpers.ts) |
| `isSuperCall` | function | Checks if target is a super call | [`ast-helpers.ts:308-310`](./ast-helpers.ts) |
| `isThisCall` | function | Checks if target is a this call | [`ast-helpers.ts:315-317`](./ast-helpers.ts) |

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
| Generic argument parsing | Handles nested generics via depth tracking |
| Static call heuristic | First character uppercase = static target |

## Error Handling

All functions use defensive optional chaining and return safe defaults (empty strings, empty arrays, null) when inputs are missing or malformed.

## Known Limitations

- `extractGenericArguments` uses simplified depth-tracking that does not handle all nested generic edge cases
- Static call detection is heuristic-based (uppercase first char) and may produce false positives for local variables

## Files

| File | Description |
|------|-------------|
| `ast-helpers.ts` | AST traversal, location extraction, text utilities, type helpers, keyword constants, and call target detection |
