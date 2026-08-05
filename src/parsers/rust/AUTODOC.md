---
module_name: rust
description: "AST helpers and pattern identification for Rust code analysis"
status: active
language: typescript
---

# Rust

> Provides utility functions for Rust AST traversal and data extraction, plus pattern identification for Builder, Iterator, error handling, ownership, and unsafe code patterns.

## Overview

This module supports Rust code analysis with two components. The AST helpers provide functions for node traversal, text extraction, visibility/modifier checking, generic/lifetime extraction, derive/attribute parsing, type extraction (function parameters, return types, fields, aliases, constants, statics), macro rule extraction, and use tree resolution. The pattern identifier detects Rust-specific design and language patterns including Builder, Iterator, error handling (Result/Option chains), ownership patterns, and unsafe code blocks.

## Data Flow

- **Inputs**: tree-sitter `ASTNode` objects from Rust source code and `ParsedEntity[]` for pattern analysis
- **Processing**: Recursive AST traversal with node-type filtering; pattern matching against known Rust idioms
- **Outputs**: Extracted node lists, text content, visibility strings, generic parameters, trait bounds, `PatternAnalysis` results

## Public API

| Export | Type | Description | Location |
|--------|------|-------------|----------|
| `findNodes` | function | Finds all AST nodes of a specific type | [`ast-helpers.ts:18-31`](./ast-helpers.ts) |
| `getNodeText` | function | Returns text content of an AST node | [`ast-helpers.ts:36-38`](./ast-helpers.ts) |
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

## Exports



## Files

| File | Description |
|------|-------------|
| `index.ts` | Re-exports all Rust parser modules |
| `ast-helpers.ts` | AST traversal, text extraction, visibility/modifier/generic/lifetime/attribute helpers, type extraction, use tree parsing |
| `pattern-identifier.ts` | Rust pattern detection: Builder, Iterator, error handling, ownership, unsafe |
