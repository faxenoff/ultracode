# Compiled Languages

## 🤖 Overview

This module provides configuration for various compiled programming languages, including C, C++, C#, Go, Java, Kotlin, Rust, and Swift. Developers and language parsers use these configurations to identify and extract language-specific elements such as keywords, node types, and extractors.

## 🤖 Architecture

```
  +---------------------+
  |     Language Files  |
  +---------------------+
  |     +-----------------+
  |     |     C.ts       |
  |     +-----------------+
  |     +-----------------+
  |     |     CPP.ts      |
  |     +-----------------+
  |     +-----------------+
  |     |     CSHARP.ts   |
  |     +-----------------+
  |     +-----------------+
  |     |     GO.ts       |
  |     +-----------------+
  |     +-----------------+
  |     |     JAVA.ts     |
  |     +-----------------+
  |     +-----------------+
  |     |     KOTLIN.ts   |
  |     +-----------------+
  |     +-----------------+
  |     |     RUST.ts     |
  |     +-----------------+
  |     +-----------------+
  |     |     SWIFT.ts    |
  |     +-----------------+
  |     +-----------------+
  |     |     ZIG.ts      |
  |     +-----------------+
  |     +-----------------+
  |     |     Index.ts    |
  |     +-----------------+
  |     +-----------------+
  |     |     Shared Files|
  |     +-----------------+
  |     +-----------------+
  |     |     Keywords.js |
  |     +-----------------+
  |     +-----------------+
  |     |     Types.js    |
  |     +-----------------+
  |     +-----------------+
  |     |     Shared Types|
  |     +-----------------+
  |     +-----------------+
  |     |     Shared Types|
  |     +-----------------+
  |     +-----------------+
  |     |     Shared Types|
  |     +-----------------+
  |     +-----------------+
  |     |     Shared Types|
  |     +-----------------+
  |     +-----------------+
  |     |     Shared Types|
  |     +-----------------+
  |     +-----------------+
  |     |     Shared Types|
  |     +-----------------+
  |     +-----------------+
  |     |     Shared Types|
  |     +-----------------+
  |     +-----------------+
  |     |     Shared Types|
  |     +-----------------+
  |     +-----------------+
  |     |     Shared Types|
  |     +-----------------+
  |     +-----------------+
  |     |     Shared Types|
  |     +-----------------+
  |     +-----------------+
  |     |     Shared Types|
  |     +-----------------+
  |     +-----------------+
  |     |     Shared Types|
  |     +-----------------+
  |     +-----------------+
  |     |     Shared Types|
  |     +-----------------+
  |     +-----------------+
  |     |     Shared Types|
  |     +-----------------+
  |     +-----------------+
  |     |     Shared Types|
  |     +-----------------+
  |     +-----------------+
  |     |     Shared Types|
  |     +-----------------+
  |     +-----------------+
  |     |     Shared Types|
  |     +-----------------+
  |     +-----------------+
  |     |     Shared Types|
  |     +-----------------+
  |     +-----------------+
  |     |     Shared Types|
  |     +-----------------+
  |     +-----------------+
  |     |     Shared Types|
  |     +-----------------+
  |     +-----------------+
  |     |     Shared Types|
  |     +-----------------+
  |     +-----------------+
  |     |     Shared Types|
  |     +-----------------+
  |     +-----------------+
  |     |     Shared Types|
  |     +-----------------+
  |     +-----------------+
  |     |     Shared Types|
  |     +-----------------+
  |     +-----------------+
  |     |     Shared Types|
  |     +-----------------+
  |     +-----------------+
  |     |     Shared Types|
  |     +-----------------+
  |     +-----------------+
  |     |     Shared Types|
  |     +-----------------+
  |     +-----------------+
  |     |     Shared Types|
  |     +-----------------+
  |     +-----------------+
  |     |     Shared Types|
  |     +-----------------+
  |     +-----------------+
  |     |     Shared Types|
  |     +-----------------+
  |     +-----------------+
  |     |     Shared Types|
  |     +-----------------+
  |     +-----------------+
  |     |     Shared Types|
  |     +-----------------+
  |     +-----------------+
  |     |     Shared Types|
  |     +-----------------+
  |     +-----------------+
  |     |     Shared Types|
  |     +-----------------+
  |     +-----------------+
  |     |     Shared Types|
  |     +-----------------+
  |     +-----------------+
  |     |     Shared Types|
  |     +-----------------+
  |     +-----------------+
  |     |     Shared Types|
  |     +-----------------+
  |     +-----------------+
  |     |     Shared Types|
  |     +-----------------+
  |     +-----------------+
  |     |     Shared Types|
  |     +-----------------+
  |     +-----------------+
  |     |     Shared Types|
  |     +-----------------+
  |     +-----------------+
  |     |     Shared Types|
  |     +-----------------+
  |     +-----------------+
  |     |     Shared Types|
  |     +-----------------+
  |     +-----------------+
  |     |     Shared Types|
  |     +-----------------+
  |     +-----------------+
  |     |     Shared Types|
  |     +-----------------+
  |     +-----------------+
  |     |     Shared Types|
  |     +-----------------+
  |     +-----------------+
  |     |     Shared Types|
  |     +-----------------+
  |     +-----------------+
  |     |     Shared Types|
  |     +-----------------+
  |     +-----------------+
  |     |     Shared Types|
  |     +-----------------+
  |     +-----------------+
  |     |     Shared Types|
  |     +-----------------+
  |     +-----------------+
  |     |     Shared Types|
  |     +-----------------+
  |     +-----------------+
  |
```

## 🤖 Entity Listing

### Function
- **C_CONFIG** — Represents the configuration for the C programming language, including its language identifier, file extensions, keywords, node types, and extractors for parsing and analyzing C code `c.ts:30-49`, `c.ts:50-62`
- **CPP_CONFIG** — Represents the configuration for the C++ language, including its extensions, keywords, node types, and extractors `cpp.ts:38-62`, `cpp.ts:63-77`
- **CSHARP_CONFIG** — Defines the configuration for the C# language, including keywords, node types, and extractors for parsing and extracting code elements `csharp.ts:30-50`, `csharp.ts:51-80`
- **GO_CONFIG** — Defines the configuration for the Go language, including keywords, node types, and extractors for parsing and analyzing Go code `go.ts:23-43`, `go.ts:44-55`
- **JAVA_CONFIG** — Defines the configuration for the Java language, including keywords, node types, and extractors for parsing and analyzing Java code `java.ts:29-48`, `java.ts:49-74`
- **KOTLIN_CONFIG** — Represents the configuration for the Kotlin language, including its extensions, keywords, node types, and extractors `kotlin.ts:23-23`, `kotlin.ts:24-24`
- **RUST_CONFIG** — Represents the configuration for the Rust language, including keywords, node types, and extractors for parsing and extracting information from Rust code `rust.ts:50-79`, `rust.ts:80-100`
- **SWIFT_CONFIG** — Represents the configuration for the Swift language, including its keywords, node types, and extractors `swift.ts:23-23`, `swift.ts:24-24`
- **ZIG_CONFIG** — Defines the configuration for the Zig language, including its name, extensions, keywords, node types, and extractors `zig.ts:23-23`, `zig.ts:24-24`

### Import_decl
- **../shared/keywords.js** — Imports `../shared/keywords.js` from `../shared/keywords.js`. `c.ts:5-5`, `cpp.ts:5-5`, `csharp.ts:5-5`, `go.ts:5-5`, `java.ts:5-5`, `kotlin.ts:5-5`, `rust.ts:5-5`, `swift.ts:5-5`, `zig.ts:5-5`
- **../shared/types.js** — Imports `../shared/types.js` from `../shared/types.js`. `c.ts:6-6`, `cpp.ts:6-6`, `csharp.ts:6-6`, `go.ts:6-6`, `java.ts:6-6`, `kotlin.ts:6-6`, `rust.ts:6-6`, `swift.ts:6-6`, `zig.ts:6-6`

## Data Flow

- **Inputs:** Imported by `registry.ts` during initialization.
- **Processing:** Static configuration data; no runtime processing.
- **Outputs:** `LanguageConfig` objects registered in `LANGUAGE_CONFIGS`.

## Public API

| Export | Type | Description | Location |
|--------|------|-------------|----------|
| `C_CONFIG` | const | C language parser configuration | [`c.ts:8-67`](./c.ts) |
| `CPP_CONFIG` | const | C++ configuration with templates and methods | [`cpp.ts:8-82`](./cpp.ts) |
| `CSHARP_CONFIG` | const | C# configuration with access modifiers | [`csharp.ts:8-85`](./csharp.ts) |
| `GO_CONFIG` | const | Go configuration with interfaces and types | [`go.ts:8-60`](./go.ts) |
| `JAVA_CONFIG` | const | Java configuration with access modifiers | [`java.ts:8-79`](./java.ts) |
| `KOTLIN_CONFIG` | const | Kotlin configuration with core elements | [`kotlin.ts:24-24`](./kotlin.ts) |
| `RUST_CONFIG` | const | Rust configuration with traits and visibility | [`rust.ts:8-105`](./rust.ts) |
| `SWIFT_CONFIG` | const | Swift configuration with protocols | [`swift.ts:8-29`](./swift.ts) |
| `ZIG_CONFIG` | const | Zig language parser configuration | [`zig.ts:8-29`](./zig.ts) |

## Dependencies

### Internal Modules

| Module | Purpose |
|--------|---------|
| `shared/types` | `LanguageConfig`, `NodeTypeConfig`, `ExtractorConfig` interfaces |

### External Packages

| Package | Purpose |
|---------|---------|
| (none) | Pure configuration data |

## Behavioral Properties

| Property | Value |
|----------|-------|
| Languages covered | C, C++, C#, Go, Java, Kotlin, Rust, Swift, Zig |
| Config completeness | Full node type mappings and extractor rules per language |

## Error Handling

Configs are static data and do not produce runtime errors. Validation is performed by `validateConfigurations()` in the registry.

## Known Limitations

- Zig support is minimal compared to more established languages.
- Kotlin config uses simplified extraction logic.

## Exports

- `C_CONFIG`
- `CPP_CONFIG`
- `CSHARP_CONFIG`
- `GO_CONFIG`
- `JAVA_CONFIG`
- `KOTLIN_CONFIG`
- `RUST_CONFIG`
- `SWIFT_CONFIG`
- `ZIG_CONFIG`

## Files

| File | Description |
|------|-------------|
| `index.ts` | Re-exports all compiled language configurations |
| `c.ts` | C language parser configuration |
| `cpp.ts` | C++ with template and class support |
| `csharp.ts` | C# with access modifiers and properties |
| `go.ts` | Go with interfaces and goroutine types |
| `java.ts` | Java with annotations and access modifiers |
| `kotlin.ts` | Kotlin with simplified extraction |
| `rust.ts` | Rust with traits, visibility, and lifetimes |
| `swift.ts` | Swift with protocols and modifiers |
| `zig.ts` | Zig language configuration |
