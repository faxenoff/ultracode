# Rust

## 🤖 Overview

The `rust` module provides utility functions for parsing and traversing Rust Abstract Syntax Trees (ASTs), primarily through the `ast-helpers.ts` file. It is used by developers and tools that need to analyze or manipulate Rust code structures.

## 🤖 Architecture

```
  +---------------------+
  |     AST Node       |
  +---------------------+
  |     findNodes      |
  |     getNodeText    |
  |     extractVisibility |
  |     hasModifier    |
  +---------------------+
  |     pattern-identifier.ts |
  +---------------------+
```

## 🤖 Flow

```
  +---------------------+
  |     parse AST       |
  +---------------------+
  |     extract visibility |
  |     find nodes       |
  |     check modifiers  |
  +---------------------+
  |     pattern-identifier.ts |
  +---------------------+
```

## 🤖 Entity Listing

### Function
- **buildMethod** — Filters methods that are named "build" and have metadata indicating they are implementations of the entity `pattern-identifier.ts:66-66`
- **countNestedItems** — Counts nested items in the AST node `ast-helpers.ts:176-195`
- **extractAliasedType** — Extracts the aliased type from a node `ast-helpers.ts:319-322`
- **extractAttributes** — Extracts attribute names from the AST node `ast-helpers.ts:135-144`
- **extractConstType** — Extracts the constant type from a node `ast-helpers.ts:327-330`
- **extractDerives** — Extracts derive attributes from the AST node `ast-helpers.ts:113-130`
- **extractDiscriminant** — Extracts the discriminant from a node `ast-helpers.ts:347-358`
- **extractFieldType** — Parses the type field of an AST node and returns its text value `ast-helpers.ts:311-314`
- **extractFunctionParameters** — Extracts function parameters and their types from the AST node `ast-helpers.ts:256-294`
- **extractGenerics** — Extract generic parameters from a node `ast-helpers.ts:72-87`
- **extractLifetimes** — Parses the AST node to extract lifetime parameters `ast-helpers.ts:92-104`
- **extractMacroRules** — Extracts macro rules from a node `ast-helpers.ts:363-375`
- **extractReturnType** — Extracts the return type from the AST node `ast-helpers.ts:299-302`
- **extractStaticType** — Extracts the static type from a node `ast-helpers.ts:335-338`
- **extractSupertraits** — Extracts supertraits from the AST node `ast-helpers.ts:221-233`
- **extractTraitBounds** — Extracts trait bounds from the AST node `ast-helpers.ts:204-216`
- **extractTypeBounds** — Extracts type bounds from the AST node `ast-helpers.ts:238-247`
- **extractUseTree** — Extracts the use tree from a node `ast-helpers.ts:384-426`
- **extractVisibility** — Extract visibility modifier from a node `ast-helpers.ts:47-50`
- **findNodes** — Find all nodes of a specific type `ast-helpers.ts:18-31`
- **getAttributeName** — Retrieves the name of an attribute from the AST node `ast-helpers.ts:149-152`
- **getNodeText** — Get text content of a node `ast-helpers.ts:36-38`
- **hasBody** — Checks if a node has a body `ast-helpers.ts:169-171`
- **hasModifier** — Check if a node has a specific modifier `ast-helpers.ts:55-63`
- **hasModifier** — Checks if a node has a child with the specified modifier type `pattern-identifier.ts:197-205`
- **identifyBuilderPattern** — Identify Builder pattern `pattern-identifier.ts:59-81`
- **identifyErrorHandlingPatterns** — Identify Error handling patterns `pattern-identifier.ts:125-156`
- **identifyIteratorPattern** — Identify Iterator pattern `pattern-identifier.ts:86-116`
- **identifyOwnershipPatterns** — Identify Ownership patterns `pattern-identifier.ts:161-192`
- **identifyPatterns** — Identify Rust patterns (Layer 4) `pattern-identifier.ts:19-50`
- **identifyUnsafePatterns** — Identify unsafe code blocks `pattern-identifier.ts:210-236`
- **impls** — Finds and filters implementation items that have a trait node with the text "Iterator" `pattern-identifier.ts:103-106`
- **isTupleStruct** — Determines if a node is a tuple struct by checking its body `ast-helpers.ts:161-164`
- **iteratorImpls** — Filters methods that are named "next" and have metadata indicating they are implementations of the "Iterator" trait `pattern-identifier.ts:92-92`
- **mutReferences** — Filters references that have a child with the type "mutable_specifier" `pattern-identifier.ts:166-166`
- **processUseTree** — Processes the use tree from a node `ast-helpers.ts:387-418`
- **resolveName** — Resolves the name from a node `ast-helpers.ts:438-462`
- **resultTypes** — Finds and filters generic type nodes that have a type name including "Result" `pattern-identifier.ts:129-133`
- **unsafeFunctions** — Filters function items that have the "unsafe" modifier `pattern-identifier.ts:215-215`
- **unsafeImpls** — Filters impl items that have the "unsafe" modifier `pattern-identifier.ts:217-217`
- **unsafeTraits** — Filters trait items that have the "unsafe" modifier `pattern-identifier.ts:216-216`
- **visit** — Traverse AST nodes and collect nodes of a specific type `ast-helpers.ts:20-28`

### Import_decl
- **../../types/parser.js** — Imports `../../types/parser.js` from `../../types/parser.js`. `ast-helpers.ts:8-8`, `pattern-identifier.ts:8-8`
- **../base-parser-utils.js** — Imports `../base-parser-utils.js` from `../base-parser-utils.js`. `ast-helpers.ts:9-9`, `pattern-identifier.ts:9-9`
- **./ast-helpers.js** — Imports `./ast-helpers.js` from `./ast-helpers.js`. `pattern-identifier.ts:10-10`

### Property
- **name** — Extracts function parameters and stores their names and types in an array `ast-helpers.ts:256-256`
- **name** — Initializes an array to store function parameters `ast-helpers.ts:257-257`
- **type** — Extracts function parameters and stores their names and types in an array `ast-helpers.ts:256-256`
- **type** — Initializes an array to store function parameters `ast-helpers.ts:257-257`

## Data Flow

- **Inputs**: tree-sitter `ASTNode` objects from Rust source code and `ParsedEntity[]` for pattern analysis
- **Processing**: Recursive AST traversal with node-type filtering; pattern matching against known Rust idioms
- **Outputs**: Extracted node lists, text content, visibility strings, generic parameters, trait bounds, `PatternAnalysis` results

## Public API

| Export | Type | Description | Location |
|--------|------|-------------|----------|
| `findNodes` | function | Finds all AST nodes of a specific type | [`ast-helpers.ts:18-31`](./ast-helpers.ts) |
| `getNodeText` | function | Returns text content of an AST node | [`ast-helpers.ts:27-57`](./ast-helpers.ts) |
| `extractVisibility` | function | Extracts visibility modifier (pub, pub(crate), etc.) | [`ast-helpers.ts:47-50`](./ast-helpers.ts) |
| `hasModifier` | function | Checks for a specific modifier in a node | [`ast-helpers.ts:55-63`](./ast-helpers.ts) |
| `extractGenerics` | function | Extracts generic parameters from definitions | [`ast-helpers.ts:72-87`](./ast-helpers.ts) |
| `extractLifetimes` | function | Extracts lifetime parameters | [`ast-helpers.ts:92-104`](./ast-helpers.ts) |
| `extractDerives` | function | Extracts derived traits from attributes | [`ast-helpers.ts:113-130`](./ast-helpers.ts) |
| `extractAttributes` | function | Extracts all attributes from a node | [`ast-helpers.ts:135-144`](./ast-helpers.ts) |
| `getAttributeName` | function | Returns attribute name from a node | [`ast-helpers.ts:149-152`](./ast-helpers.ts) |
| `isTupleStruct` | function | Checks if struct is a tuple struct | [`ast-helpers.ts:161-164`](./ast-helpers.ts) |
| `hasBody` | function | Checks for body in function/block | [`ast-helpers.ts:169-171`](./ast-helpers.ts) |
| `countNestedItems` | function | Counts nested items in a container | [`ast-helpers.ts:176-195`](./ast-helpers.ts) |
| `extractTraitBounds` | function | Extracts trait bounds from a parameter | [`ast-helpers.ts:204-216`](./ast-helpers.ts) |
| `extractSupertraits` | function | Extracts supertraits from trait definition | [`ast-helpers.ts:221-233`](./ast-helpers.ts) |
| `extractTypeBounds` | function | Extracts type bounds from generics | [`ast-helpers.ts:238-247`](./ast-helpers.ts) |
| `extractFunctionParameters` | function | Extracts function parameters from signature | [`ast-helpers.ts:256-256`](./ast-helpers.ts) |
| `extractReturnType` | function | Extracts return type from function | [`ast-helpers.ts:299-302`](./ast-helpers.ts) |
| `extractFieldType` | function | Extracts struct field type | [`ast-helpers.ts:311-314`](./ast-helpers.ts) |
| `extractAliasedType` | function | Extracts type from type alias | [`ast-helpers.ts:319-322`](./ast-helpers.ts) |
| `extractConstType` | function | Extracts constant type | [`ast-helpers.ts:327-330`](./ast-helpers.ts) |
| `extractStaticType` | function | Extracts static variable type | [`ast-helpers.ts:335-338`](./ast-helpers.ts) |
| `extractDiscriminant` | function | Extracts enum discriminant value | [`ast-helpers.ts:347-358`](./ast-helpers.ts) |
| `extractMacroRules` | function | Extracts rules from macro definitions | [`ast-helpers.ts:363-375`](./ast-helpers.ts) |
| `extractUseTree` | function | Extracts import tree from use expressions | [`ast-helpers.ts:384-426`](./ast-helpers.ts) |
| `resolveName` | function | Resolves full identifier name in context | [`ast-helpers.ts:438-462`](./ast-helpers.ts) |
| `identifyPatterns` | function | Analyzes code for Rust patterns | [`pattern-identifier.ts:19-50`](./pattern-identifier.ts) |
| `identifyBuilderPattern` | function | Detects Builder pattern usage | [`pattern-identifier.ts:59-81`](./pattern-identifier.ts) |
| `identifyIteratorPattern` | function | Detects Iterator trait implementations | [`pattern-identifier.ts:86-116`](./pattern-identifier.ts) |
| `identifyErrorHandlingPatterns` | function | Finds error handling patterns | [`pattern-identifier.ts:125-156`](./pattern-identifier.ts) |
| `identifyOwnershipPatterns` | function | Identifies ownership patterns | [`pattern-identifier.ts:161-192`](./pattern-identifier.ts) |
| `identifyUnsafePatterns` | function | Detects unsafe code blocks | [`pattern-identifier.ts:210-236`](./pattern-identifier.ts) |

## Dependencies

### Internal Modules
| Module | Purpose |
|--------|---------|
| `../../types/parser` | `ASTNode`, `ParsedEntity`, `PatternAnalysis` types |
| `../base-parser-utils` | `hasChild` utility function |

### External Packages

_None_

## Behavioral Properties

| Property | Value |
|----------|-------|
| AST backend | tree-sitter nodes |
| Pattern detection | Builder, Iterator, error handling, ownership, unsafe |
| Use tree resolution | Handles nested use groups and glob imports |

## Error Handling

Functions return empty arrays or default values when nodes are missing. Pattern identification returns empty pattern arrays when no patterns are detected.

## Known Limitations

- Generic parameter extraction does not handle deeply nested lifetime bounds
- Pattern identification is heuristic-based and may miss non-standard implementations
- Use tree resolution does not handle `pub(in path)` visibility in all cases

## Files

| File | Description |
|------|-------------|
| `index.ts` | Re-exports all Rust parser modules |
| `ast-helpers.ts` | AST traversal, text extraction, visibility/modifier/generic/lifetime/attribute helpers, type extraction, use tree parsing |
| `pattern-identifier.ts` | Rust pattern detection: Builder, Iterator, error handling, ownership, unsafe |
