# Kotlin

## 🤖 Overview

The `kotlin` parser module in `src/parsers/kotlin` provides a set of types and interfaces for parsing Kotlin code, particularly focusing on coroutine and Android ViewModel patterns. It re-exports shared JVM types and includes Kotlin-specific type definitions for backward compatibility and framework-specific information.

## 🤖 Architecture

```
  +---------------------+
  |     Kotlin Parser   |
  +---------------------+
  |     +-----------------+     |
  |     | Shared JVM Types |     |
  |     +-----------------+     |
  |     +-----------------+     |
  |     | Kotlin-Specific |     |
  |     |   Types         |     |
  |     +-----------------+     |
  |     +-----------------+     |
  |     | Framework Types |     |
  |     +-----------------+     |
  |     +-----------------+     |
  |     | Coroutine Info   |     |
  |     +-----------------+     |
  |     +-----------------+     |
  |     | ViewModel Info   |     |
  |     +-----------------+     |
  +---------------------+
```

## 🤖 Flow

```
  +---------------------+
  |     Kotlin Parser   |
  +---------------------+
  |     +-----------------+     |
  |     | Parse Kotlin    |     |
  |     |   Code          |     |
  |     +-----------------+     |
  |     +-----------------+     |
  |     | Extract Shared  |     |
  |     |   JVM Types     |     |
  |     +-----------------+     |
  |     +-----------------+     |
  |     | Extract Kotlin  |     |
  |     |   Specific Types|     |
  |     +-----------------+     |
  |     +-----------------+     |
  |     | Extract Framework|     |
  |     |   Types         |     |
  |     +-----------------+     |
  |     +-----------------+     |
  |     | Process Coroutine|     |
  |     |   Info          |     |
  |     +-----------------+     |
  |     +-----------------+     |
  |     | Process ViewModel|     |
  |     |   Info          |     |
  |     +-----------------+     |
  +---------------------+
```

## 🤖 Entity Listing

### Interface
- **CoroutineInfo** — Represents coroutine-specific information including suspend status and associated coroutine types `types.ts:40-48`
- **KtorRouteInfo** — Represents Ktor routing pattern information including HTTP method, path, and location `types.ts:66-70`
- **ViewModelInfo** — Represents Android ViewModel pattern information including state flows and live data `types.ts:57-61`

### Import_decl
- **../jvm/shared-types.js** — Imports `../jvm/shared-types.js` from `../jvm/shared-types.js`. `types.ts:7-7`

### Property
- **dispatcherUsed** — Specifies the dispatcher used by the coroutine `types.ts:46-46`
- **hasAsync** — Indicates whether a coroutine uses the async function `types.ts:43-43`
- **hasFlow** — Indicates whether a coroutine uses the flow function `types.ts:44-44`
- **hasLaunch** — Indicates whether a coroutine uses the launch function `types.ts:42-42`
- **hasWithContext** — Indicates whether a coroutine uses the withContext function `types.ts:45-45`
- **isSuspend** — Indicates whether a coroutine is suspendable `types.ts:41-41`
- **liveData** — Lists LiveData associated with the ViewModel `types.ts:59-59`
- **location** — Provides location information for the Ktor route `types.ts:69-69`
- **method** — Specifies the HTTP method used in the Ktor route `types.ts:67-67`
- **path** — Specifies the path of the Ktor route `types.ts:68-68`
- **savedStateHandle** — Indicates whether the ViewModel uses a savedStateHandle `types.ts:60-60`
- **scopeType** — Indicates the scope type of the coroutine `types.ts:47-47`
- **stateFlows** — Lists state flows associated with the ViewModel `types.ts:58-58`

## Data Flow

- **Inputs**: N/A (type definitions only)
- **Processing**: Types are consumed by extractors, framework analyzers, and the main Kotlin parser
- **Outputs**: Type contracts for all Kotlin parser modules

## Public API

| Export | Type | Description | Location |
|--------|------|-------------|----------|
| `ParserContext` | interface | Context passed through all parsing functions | [`types.ts:17-24`](./types.ts) |
| `LocationInfo` | type | AST node position information | [`types.ts:33-36`](./types.ts) |
| `CallInfo` | interface | Function/method call information with Kotlin-specific fields | [`types.ts:45-66`](./types.ts) |
| `AnnotationInfo` | interface | Annotation information from modifiers | [`types.ts:75-78`](./types.ts) |
| `InheritanceInfo` | interface | Class/interface inheritance data | [`types.ts:87-90`](./types.ts) |
| `ParameterInfo` | interface | Function/constructor parameter info | [`types.ts:99-105`](./types.ts) |
| `BranchInfo` | interface | Branch info including `when` and `elvis` types | [`types.ts:114-118`](./types.ts) |
| `LoopInfo` | interface | Loop information (for/while/do-while) | [`types.ts:123-126`](./types.ts) |
| `ExceptionInfo` | interface | Exception handling information | [`types.ts:131-135`](./types.ts) |
| `ReturnInfo` | interface | Return statement info with label support | [`types.ts:140-144`](./types.ts) |
| `ControlFlowInfo` | interface | Complete control flow with awaits | [`types.ts:149-158`](./types.ts) |
| `KDocParam` | interface | KDoc parameter documentation | [`types.ts:167-171`](./types.ts) |
| `KDocInfo` | interface | Parsed KDoc with Kotlin-specific tags | [`types.ts:176-198`](./types.ts) |
| `CoroutineInfo` | interface | Coroutine and suspend function info | [`types.ts:207-215`](./types.ts) |
| `ComplexityMetrics` | interface | Code complexity metrics | [`types.ts:224-232`](./types.ts) |
| `ViewModelInfo` | interface | Android ViewModel pattern info | [`types.ts:241-245`](./types.ts) |
| `KtorRouteInfo` | interface | Ktor HTTP route info | [`types.ts:250-254`](./types.ts) |
| `AntlrToken` | interface | ANTLR token with position info | [`types.ts:263-269`](./types.ts) |
| `AntlrContext` | interface | Generic ANTLR context | [`types.ts:274-280`](./types.ts) |
| `AntlrContextWithChildren` | interface | ANTLR context with children | [`types.ts:285-289`](./types.ts) |

## Dependencies

### Internal Modules
| Module | Purpose |
|--------|---------|
| `../../types/parser` | Shared `ParsedEntity` and `EntityRelationship` types |

### External Packages

_None_

## Behavioral Properties

| Property | Value |
|----------|-------|
| Kotlin-specific branch types | `when`, `when-entry`, `elvis` |
| Labeled returns | `ReturnInfo.label` for `return@name` |
| Coroutine awareness | `CallInfo.isAwait`, `CoroutineInfo` with scope/dispatcher tracking |

## Error Handling

N/A (type definitions only).

## Known Limitations

- `CallInfo.isAwait` is set by extractors but not all suspend calls are detectable statically
- `ViewModelInfo` and `KtorRouteInfo` are simplified representations of complex framework patterns

## Files

| File | Description |
|------|-------------|
| `types.ts` | All shared type definitions for the Kotlin parser pipeline |
