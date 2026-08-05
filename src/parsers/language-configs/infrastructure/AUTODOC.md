# Helm Language Configuration

## 🤖 Overview

This module provides language configuration for various programming languages used in infrastructure projects. Developers and maintainers of infrastructure systems use it to define and extract language-specific information for tools and analyzers.

## 🤖 Architecture

```
  +---------------------+
  |     Language Configs     |
  |     ---------------------|
  |     |                   |
  |     |     GraphQL       |
  |     |     ----------------|
  |     |     |              |
  |     |     |     Keywords |
  |     |     |     ----------------|
  |     |     |     |              |
  |     |     |     |     Node Types |
  |     |     |     |     ----------------|
  |     |     |     |     |              |
  |     |     |     |     |     Extractors |
  |     |     |     |     |     ----------------|
  |     |     |     |     |     |              |
  |     |     |     |     |     |     Extractors |
  |     |     |     |     |     |     ----------------|
  |     |     |     |     |     |     |              |
  |     |     |     |     |     |     |     Extractors |
  |     |     |     |     |     |     |     ----------------|
  |     |     |     |     |     |     |     |              |
  |     |     |     |     |     |     |     |     Extractors |
  |     |     |     |     |     |     |     |     ----------------|
  |     |     |     |     |     |     |     |     |              |
  |     |     |     |     |     |     |     |     |     Extractors |
  |     |     |
  |     |     +-----------------+
  |     |     |     Helm       |
  |     |     |     ----------------|
  |     |     |     |              |
  |     |     |     |     Keywords |
  |     |     |     |     ----------------|
  |     |     |     |     |              |
  |     |     |     |     |     Node Types |
  |     |     |     |     |     ----------------|
  |     |     |     |     |     |              |
  |     |     |     |     |     |     Extractors |
  |     |     |     |     |     |     ----------------|
  |     |     |     |     |     |     |              |
  |     |     |     |     |     |     |     Extractors |
  |     |     |     |     |     |     |     ----------------|
  |     |     |     |     |     |     |     |              |
  |     |     |     |     |     |     |     |     Extractors |
  |     |     |     |     |     |     |     |     ----------------|
  |     |     |     |     |     |     |     |     |              |
  |     |     |     |     |     |     |     |     |     Extractors |
  |     |     |
  |     |     +-----------------+
  |     |     |     Linq       |
  |     |     |     ----------------|
  |     |     |     |              |
  |     |     |     |     Keywords |
  |     |     |     |     ----------------|
  |     |     |     |     |              |
  |     |     |     |     |     Node Types |
  |     |     |     |     |     ----------------|
  |     |     |     |     |     |              |
  |     |     |     |     |     |     Extractors |
  |     |     |     |     |     |     ----------------|
  |     |     |     |     |     |     |              |
  |     |     |     |     |     |     |     Extractors |
  |     |     |     |     |     |     |     ----------------|
  |     |     |     |     |     |     |     |              |
  |     |     |     |     |     |     |     |     Extractors |
  |     |     |     |     |     |     |     |     ----------------|
  |     |     |     |     |     |     |     |     |              |
  |     |     |     |     |     |     |     |     |     Extractors |
  |     |     |
  |     |     +-----------------+
  |     |     |     Prisma     |
  |     |     |     ----------------|
  |     |     |     |              |
  |     |     |     |     Keywords |
  |     |     |     |     ----------------|
  |     |     |     |     |              |
  |     |     |     |     |     Node Types |
  |     |     |     |     |     ----------------|
  |     |     |     |     |     |              |
  |     |     |     |     |     |     Extractors |
  |     |     |     |     |     |     ----------------|
  |     |     |     |     |     |     |              |
  |     |     |     |     |     |     |     Extractors |
  |     |     |     |     |     |     |     ----------------|
  |     |     |     |     |     |     |     |              |
  |     |     |     |     |     |     |     |     Extractors |
  |     |     |     |     |     |     |     |     ----------------|
  |     |     |     |     |     |     |     |     |              |
  |     |     |     |     |     |     |     |     |     Extractors |
  |     |     |
  |     |     +-----------------+
  |     |     |     Protobuf   |
  |     |     |     ----------------|
  |     |     |     |              |
  |     |     |     |     Keywords |
  |     |     |     |     ----------------|
  |     |     |     |     |              |
  |     |     |     |     |     Node Types |
  |     |     |     |     |     ----------------|
  |     |     |     |     |     |              |
  |     |     |     |     |     |     Extractors |
  |     |     |     |     |     |     ----------------|
  |     |     |     |     |     |     |              |
  |     |     |     |     |     |     |
```

## 🤖 Entity Listing

### Function
- **GRAPHQL_CONFIG** — Defines the configuration for the GraphQL language, including keywords, node types, and extractors `graphql.ts:23-23`, `graphql.ts:24-24`
- **HELM_CONFIG** — Defines the configuration for the Helm language, including its language name, extensions, keywords, and node types `helm.ts:19-32`, `helm.ts:33-33`
- **LINQ_CONFIG** — Defines the configuration for the LINQ language, including its name, extensions, keywords, and various extractors `linq.ts:23-23`, `linq.ts:24-24`
- **PRISMA_CONFIG** — Defines the configuration for the Prisma language, including its keywords, node types, and extractors `prisma.ts:23-23`, `prisma.ts:24-24`
- **PROTOBUF_CONFIG** — Defines the configuration for Protocol Buffers language support, including keywords, node types, and extractors `protobuf.ts:23-23`, `protobuf.ts:24-24`
- **SQL_CONFIG** — Defines the configuration for the SQL language, including keywords, node types, and extractors `sql.ts:23-23`, `sql.ts:24-24`

### Import_decl
- **../shared/keywords.js** — Imports `../shared/keywords.js` from `../shared/keywords.js`. `graphql.ts:5-5`, `helm.ts:1-1`, `linq.ts:5-5`, `prisma.ts:5-5`, `protobuf.ts:5-5`, `sql.ts:5-5`
- **../shared/types.js** — Imports `../shared/types.js` from `../shared/types.js`. `graphql.ts:6-6`, `helm.ts:2-2`, `linq.ts:6-6`, `prisma.ts:6-6`, `protobuf.ts:6-6`, `sql.ts:6-6`

## Dependencies

**Internal:**
- `LANGUAGE_KEYWORDS` — shared keyword definitions from ~~`../shared/keywords.js`~~ (deleted) providing consistent language keyword sets across all supported language configurations
- `LanguageConfig` — shared type definition from ~~`../shared/types.js`~~ (deleted) establishing the structural contract for all language configuration objects

**Related Modules:**
- Part of the infrastructure language configuration family (`graphql.ts`, `linq.ts`, `prisma.ts`, `protobuf.ts`, `sql.ts`), all following identical configuration patterns for uniform handling in the semantic analysis pipeline

## Design Pattern

This module implements the **Language Configuration** pattern, where declarative configuration objects define language semantics (keywords, node type mappings, extraction rules) without embedding parsing logic. The structure decouples language definitions from analysis logic, enabling consistent semantic handling of multiple template and domain-specific languages within a single framework.
