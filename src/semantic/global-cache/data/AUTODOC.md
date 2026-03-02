---
module_name: data
description: "Built-in function and framework pattern definitions for global embedding cache"
status: active
language: typescript
---

# Data

> Contains statically defined built-in functions, standard library patterns, and framework-specific patterns for all supported programming languages, used to pre-seed the global embedding cache.

## Overview

The data submodule provides curated lists of language built-ins and framework patterns as GlobalCacheEntry arrays. Each entry includes the text to embed, a category (builtin, stdlib, framework, pattern), and the source language. Framework entries additionally specify the framework name. The getAllGlobalEntries() function aggregates all entries from all languages and frameworks into a single array for batch embedding generation.

## Data Flow

- **Inputs**: None; all entries are compile-time constants.
- **Processing**: getAllGlobalEntries() concatenates all exported arrays.
- **Outputs**: Complete GlobalCacheEntry[] array with all builtins and patterns.

## Public API

| Export | Type | Description | Location |
|--------|------|-------------|----------|
| `JAVASCRIPT_BUILTINS` | const | Array, Object, String, Promise, and other JS built-in methods | [`javascript.ts:10-12`](./javascript.ts) |
| `TYPESCRIPT_BUILTINS` | const | TypeScript utility types (Partial, Required, Pick, etc.) | [`javascript.ts:122-124`](./javascript.ts) |
| `PYTHON_BUILTINS` | const | Python built-in functions and typing module constructs | [`python.ts:10-12`](./python.ts) |
| `JAVA_BUILTINS` | const | Java Collections, Stream API, and standard library classes | [`java-kotlin.ts:10-12`](./java-kotlin.ts) |
| `KOTLIN_BUILTINS` | const | Kotlin scope functions, coroutines, and extensions | [`java-kotlin.ts:74-76`](./java-kotlin.ts) |
| `GO_BUILTINS` | const | Go built-in functions and standard library imports | [`go-rust.ts:10-12`](./go-rust.ts) |
| `RUST_BUILTINS` | const | Rust built-in types, traits, and error handling patterns | [`go-rust.ts:52-54`](./go-rust.ts) |
| `REACT_PATTERNS` | const | React hooks, components, and JSX patterns | [`frameworks.ts:10-12`](./frameworks.ts) |
| `ANGULAR_PATTERNS` | const | Angular decorators, RxJS operators, and DI patterns | [`frameworks.ts:60-62`](./frameworks.ts) |
| `VUE_PATTERNS` | const | Vue reactivity, composition API, and template patterns | [`frameworks.ts:127-129`](./frameworks.ts) |
| `EXPRESS_PATTERNS` | const | Express routes, middleware, and request handling | [`frameworks.ts:169-171`](./frameworks.ts) |
| `NESTJS_PATTERNS` | const | NestJS decorators, modules, and dependency injection | [`frameworks.ts:201-203`](./frameworks.ts) |
| `getAllGlobalEntries` | function | Aggregates all entries from all languages and frameworks | [`index.ts:29-44`](./index.ts) |

## Dependencies

### Internal Modules

| Module | Purpose |
|--------|---------|
| `global-cache/types` | GlobalCacheEntry interface |

### External Packages

| Package | Purpose |
|---------|---------|
| (none) | No external dependencies |

## Behavioral Properties

| Property | Value |
|----------|-------|
| Total languages | 7 (JS, TS, Python, Java, Kotlin, Go, Rust) |
| Total frameworks | 5 (React, Angular, Vue, Express, NestJS) |
| Entry format | Each entry has text, category, language, and optional framework |

## Error Handling

No runtime errors possible; all data is statically defined constant arrays.

## Known Limitations

- Entries are manually maintained and may lag behind latest language/framework versions.
- No C/C++, Swift, or Zig builtins currently included.
- Pattern descriptions are concise; more detailed descriptions could improve embedding quality.

## Exports

- `ANGULAR_PATTERNS`
- `EXPRESS_PATTERNS`
- `NESTJS_PATTERNS`
- `REACT_PATTERNS`
- `VUE_PATTERNS`
- `GO_BUILTINS`
- `RUST_BUILTINS`
- `JAVA_BUILTINS`
- `KOTLIN_BUILTINS`
- `JAVASCRIPT_BUILTINS`
- `JAVASCRIPT_ENTITY_PATTERNS`
- `TYPESCRIPT_BUILTINS`
- `NODEJS_BUILTINS`
- `PYTHON_BUILTINS`
- `TESTING_PATTERNS`
- `getAllGlobalEntries`

## Files

| File | Description |
|------|-------------|
| `frameworks.ts` | React, Angular, Vue, Express, and NestJS framework patterns |
| `go-rust.ts` | Go and Rust built-in functions, types, and standard library patterns |
| `index.ts` | Re-exports all entries and provides getAllGlobalEntries() aggregation |
| `java-kotlin.ts` | Java Collections/Stream API and Kotlin scope functions/coroutines |
| `javascript.ts` | JavaScript built-in methods and TypeScript utility types |
| `python.ts` | Python built-in functions, typing module, and standard library |
