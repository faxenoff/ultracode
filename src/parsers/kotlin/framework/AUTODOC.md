---
module_name: kotlin-framework
description: "Extractors for Kotlin framework patterns: Android, Coroutines, and Ktor"
status: active
language: typescript
---

# Kotlin Framework

> Detects and extracts framework-specific patterns from Kotlin code, including Android components/Compose, Kotlin Coroutines/Flow, and Ktor routing/plugins.

## Overview

This module provides framework-aware analysis for Kotlin projects. The Android extractor handles ViewModel, LiveData/StateFlow, Composable functions, lifecycle patterns, and navigation. The Coroutines extractor detects suspend functions, Flow operators, coroutine builders, dispatchers, and structured concurrency. The Ktor extractor identifies routing definitions, HTTP handlers, plugins, authentication, and serialization configuration.

## Data Flow

- **Inputs**: `ParsedEntity` objects, `AnnotationInfo[]`, and raw source code strings
- **Processing**: Regex-based import/annotation scanning, confidence scoring, pattern detection against known framework APIs
- **Outputs**: Framework-specific metadata, enriched entities, and `EntityRelationship[]`

## Public API

| Export | Type | Description | Location |
|--------|------|-------------|----------|
| `detectAndroidFramework` | function | Checks for Android imports/annotations | [`android-extractor.ts:79-91`](./android-extractor.ts) |
| `getAndroidConfidence` | function | Returns 0-1 confidence for Android usage | [`android-extractor.ts:96-106`](./android-extractor.ts) |
| `extractAndroidInfo` | function | Extracts Android component metadata | [`android-extractor.ts:115-120`](./android-extractor.ts) |
| `extractViewModelInfo` | function | Extracts ViewModel state patterns | [`android-extractor.ts:162-196`](./android-extractor.ts) |
| `enrichEntityWithAndroid` | function | Enriches entity with Android metadata | [`android-extractor.ts:205-211`](./android-extractor.ts) |
| `isComposableFunction` | function | Checks for @Composable annotation | [`android-extractor.ts:275-280`](./android-extractor.ts) |
| `extractComposeStateUsages` | function | Extracts Compose state usages | [`android-extractor.ts:285-288`](./android-extractor.ts) |
| `extractResourceReferences` | function | Extracts Android resource references | [`android-extractor.ts:319-322`](./android-extractor.ts) |
| `extractNavigationDestinations` | function | Extracts navigation destinations | [`android-extractor.ts:353-356`](./android-extractor.ts) |
| `detectCoroutinesFramework` | function | Checks for coroutine imports | [`coroutines-extractor.ts:115-125`](./coroutines-extractor.ts) |
| `getCoroutinesConfidence` | function | Returns 0-1 confidence for coroutines usage | [`coroutines-extractor.ts:130-139`](./coroutines-extractor.ts) |
| `isSuspendFunction` | function | Checks if function is suspend | [`coroutines-extractor.ts:148-150`](./coroutines-extractor.ts) |
| `extractSuspendFunctionInfo` | function | Extracts suspend function details | [`coroutines-extractor.ts:155-189`](./coroutines-extractor.ts) |
| `extractFlowInfo` | function | Extracts Flow usage information | [`coroutines-extractor.ts:198-204`](./coroutines-extractor.ts) |
| `extractFlowOperatorChain` | function | Extracts Flow operator chains | [`coroutines-extractor.ts:228-241`](./coroutines-extractor.ts) |
| `extractCoroutineScopeInfo` | function | Extracts coroutine scope information | [`coroutines-extractor.ts:250-257`](./coroutines-extractor.ts) |
| `enrichEntityWithCoroutines` | function | Enriches entity with coroutine metadata | [`coroutines-extractor.ts:292-298`](./coroutines-extractor.ts) |
| `extractChannelInfo` | function | Extracts Channel usage info | [`coroutines-extractor.ts:352-356`](./coroutines-extractor.ts) |
| `extractCoroutineExceptionHandling` | function | Extracts coroutine exception handling | [`coroutines-extractor.ts:391-395`](./coroutines-extractor.ts) |
| `getCoroutineComplexityScore` | function | Calculates coroutine complexity score | [`coroutines-extractor.ts:409-431`](./coroutines-extractor.ts) |
| `usesStructuredConcurrency` | function | Checks for structured concurrency patterns | [`coroutines-extractor.ts:436-444`](./coroutines-extractor.ts) |
| `detectKtorFramework` | function | Checks for Ktor imports | [`ktor-extractor.ts:79-89`](./ktor-extractor.ts) |
| `getKtorConfidence` | function | Returns 0-1 confidence for Ktor usage | [`ktor-extractor.ts:94-103`](./ktor-extractor.ts) |
| `extractKtorRoutes` | function | Extracts Ktor route definitions | [`ktor-extractor.ts:112-176`](./ktor-extractor.ts) |
| `extractRouteHandlers` | function | Extracts HTTP method handlers | [`ktor-extractor.ts:181-186`](./ktor-extractor.ts) |
| `extractInstalledPlugins` | function | Extracts installed Ktor plugins | [`ktor-extractor.ts:234-237`](./ktor-extractor.ts) |
| `extractSerializationConfig` | function | Extracts serialization configuration | [`ktor-extractor.ts:267-267`](./ktor-extractor.ts) |
| `extractAuthenticationConfig` | function | Extracts authentication configuration | [`ktor-extractor.ts:296-300`](./ktor-extractor.ts) |
| `enrichEntityWithKtor` | function | Enriches entity with Ktor metadata | [`ktor-extractor.ts:339-345`](./ktor-extractor.ts) |
| `extractHttpClientConfig` | function | Extracts Ktor HttpClient config | [`ktor-extractor.ts:391-395`](./ktor-extractor.ts) |
| `extractWebSocketRoutes` | function | Extracts WebSocket route definitions | [`ktor-extractor.ts:442-442`](./ktor-extractor.ts) |
| `isKtorApplication` | function | Checks if entity is a Ktor application | [`ktor-extractor.ts:475-477`](./ktor-extractor.ts) |
| `getAllEndpoints` | function | Gets all HTTP endpoints from analysis | [`ktor-extractor.ts:483-487`](./ktor-extractor.ts) |

## Dependencies

### Internal Modules
| Module | Purpose |
|--------|---------|
| `../types` | `AnnotationInfo`, `ViewModelInfo`, `CoroutineInfo`, `KtorRouteInfo` types |
| `../../../types/parser` | `ParsedEntity` and `EntityRelationship` types |

### External Packages

_None_

## Behavioral Properties

| Property | Value |
|----------|-------|
| Detection strategy | Regex-based import/annotation scanning with confidence scoring |
| Android component detection | Activity, Fragment, ViewModel, Service, BroadcastReceiver |
| Ktor route extraction | Nested routing blocks with path concatenation |

## Error Handling

Returns empty results when source code or annotations are missing. Confidence scores are clamped to [0, 1]. All regex matching uses safe optional chaining.

## Known Limitations

- Compose state detection is pattern-based and may miss custom state holders
- Coroutine dispatcher detection relies on string patterns, not type resolution
- Ktor route path extraction does not resolve path parameters or handle complex routing DSLs

## Files

| File | Description |
|------|-------------|
| `android-extractor.ts` | Android component detection, ViewModel/LiveData/Compose patterns, resource references, navigation |
| `coroutines-extractor.ts` | Coroutine builder detection, Flow operator extraction, scope/dispatcher analysis, structured concurrency |
| `ktor-extractor.ts` | Ktor routing extraction, plugin detection, authentication/serialization config, WebSocket routes |
