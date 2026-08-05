# Helm Language Configuration

Provides language configuration objects for infrastructure and DSL languages, enabling AST-based code analysis across multiple schema and query syntaxes.

## Overview

Provides language configuration for semantic code parsing of Helm templates. This module defines syntax rules, keywords, node types, and semantic extraction rules that enable code analysis tools to understand Helm's template structure. The configuration follows a declarative pattern consistent with other language definitions in the infrastructure module, allowing Helm to integrate seamlessly into the semantic analysis pipeline alongside GraphQL, LINQ, Prisma, Protobuf, and SQL.

## Entity Listing

### Public API

| Name | Type | Description | Location |
|------|------|-------------|----------|
| `HELM_CONFIG` | const | Language configuration object for Helm templates specifying extensions, keywords, node type mappings, and semantic extraction rules for templating constructs | helm.ts:4-38 |

### Module Exports

| Name | Type | Description | Location |
|------|------|-------------|----------|
| `HELM_CONFIG` | re-export | Aggregated export making Helm configuration available to dependent modules through unified language configuration API | index.ts |

## Dependencies

**Internal:**
- `LANGUAGE_KEYWORDS` — shared keyword definitions from ~~`../shared/keywords.js`~~ (deleted) providing consistent language keyword sets across all supported language configurations
- `LanguageConfig` — shared type definition from ~~`../shared/types.js`~~ (deleted) establishing the structural contract for all language configuration objects

**Related Modules:**
- Part of the infrastructure language configuration family (`graphql.ts`, `linq.ts`, `prisma.ts`, `protobuf.ts`, `sql.ts`), all following identical configuration patterns for uniform handling in the semantic analysis pipeline

## Design Pattern

This module implements the **Language Configuration** pattern, where declarative configuration objects define language semantics (keywords, node type mappings, extraction rules) without embedding parsing logic. The structure decouples language definitions from analysis logic, enabling consistent semantic handling of multiple template and domain-specific languages within a single framework.