# Data

## 🤖 Overview

This module provides a comprehensive collection of global cache entries for various programming languages and frameworks, including React, Angular, Vue, Express, NestJS, Go, Rust, Java, Kotlin, JavaScript, TypeScript, Node.js, and Python. Developers and language designers can use these entries to understand and implement best practices and patterns specific to each language and framework.

## 🤖 Architecture

```
  +---------------------+
  |     Language Cache  |
  |     (Language-Specific) |
  +---------------------+
          |               |
          v               v
  +---------------------+   +---------------------+
  |     Framework Cache  |   |     Built-in Cache   |
  |     (Framework-Specific) |   |     (Language-Specific) |
  +---------------------+   +---------------------+
          |               |
          v               v
  +---------------------+
  |     Global Cache     |
  |     (Combined)       |
  +---------------------+
```

## 🤖 Flow

```
  +---------------------+
  |     Language Cache  |
  |     (Language-Specific) |
  +---------------------+
          |               |
          v               v
  +---------------------+   +---------------------+
  |     Framework Cache  |   |     Built-in Cache   |
  |     (Framework-Specific) |   |     (Language-Specific) |
  +---------------------+   +---------------------+
          |               |
          v               v
  +---------------------+
  |     Global Cache     |
  |     (Combined)       |
  +---------------------+
```

## 🤖 Entity Listing

### Function
- **getAllGlobalEntries** — Returns an array of all global cache entries combined `index.ts:33-51`

### Import_decl
- **../types.js** — Imports `../types.js` from `../types.js`. `frameworks.ts:5-5`, `go-rust.ts:5-5`, `index.ts:21-21`, `java-kotlin.ts:5-5`, `javascript.ts:5-5`, `nodejs.ts:5-5`, `python.ts:5-5`, `testing.ts:8-8`
- **./frameworks.js** — Imports `./frameworks.js` from `./frameworks.js`. `index.ts:22-22`
- **./go-rust.js** — Imports `./go-rust.js` from `./go-rust.js`. `index.ts:23-23`
- **./java-kotlin.js** — Imports `./java-kotlin.js` from `./java-kotlin.js`. `index.ts:24-24`
- **./javascript.js** — Imports `./javascript.js` from `./javascript.js`. `index.ts:25-25`
- **./nodejs.js** — Imports `./nodejs.js` from `./nodejs.js`. `index.ts:26-26`
- **./python.js** — Imports `./python.js` from `./python.js`. `index.ts:27-27`
- **./testing.js** — Imports `./testing.js` from `./testing.js`. `index.ts:28-28`

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
| `NODEJS_BUILTINS` | const | Node.js built-in modules and APIs for file system, HTTP, events, and process management | [`nodejs.ts:10-119`](./nodejs.ts) |
| `REACT_PATTERNS` | const | React hooks, components, and JSX patterns | [`frameworks.ts:10-12`](./frameworks.ts) |
| `ANGULAR_PATTERNS` | const | Angular decorators, RxJS operators, and DI patterns | [`frameworks.ts:60-62`](./frameworks.ts) |
| `VUE_PATTERNS` | const | Vue reactivity, composition API, and template patterns | [`frameworks.ts:127-129`](./frameworks.ts) |
| `EXPRESS_PATTERNS` | const | Express routes, middleware, and request handling | [`frameworks.ts:169-171`](./frameworks.ts) |
| `NESTJS_PATTERNS` | const | NestJS decorators, modules, and dependency injection | [`frameworks.ts:201-203`](./frameworks.ts) |
| `TESTING_PATTERNS` | const | Testing framework patterns including Jest, Mocha, and assertion utilities | [`testing.ts:13-173`](./testing.ts) |
| `getAllGlobalEntries` | function | Aggregates all entries from all languages and frameworks | [`index.ts:33-51`](./index.ts) |

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
| `nodejs.ts` | Node.js built-in modules and standard library APIs |
| `python.ts` | Python built-in functions, typing module, and standard library |
| `testing.ts` | Testing framework patterns and assertion utilities |
