# Kotlin Framework

## 🤖 Overview

The `kotlin/framework` module is designed to extract and analyze Android-specific patterns from Kotlin code. It identifies key Android components such as Activities, Fragments, ViewModels, and LiveData/StateFlow patterns. Developers and data analysts use this module to understand and process Android application code, particularly focusing on component structures and lifecycle management.

## 🤖 Architecture

```
  +---------------------+
  |     Android        |
  |     Components     |
  |     (Activity,     |
  |     Fragment,      |
  |     ViewModel, etc.)|
  +---------------------+
          |               |
          v               v
  +---------------------+   +---------------------+
  |     State Holders  |   |     Lifecycle        |
  |     (LiveData,     |   |     (LifecycleScope) |
  |     StateFlow)     |   |     (CoroutineScope) |
  +---------------------+   +---------------------+
          |               |
          v               v
  +---------------------+   +---------------------+
  |     Resource       |   |     Compose         |
  |     References     |   |     Functions       |
  +---------------------+   +---------------------+
```

## 🤖 Flow

```
  +---------------------+
  |     Kotlin Code    |
  |     (Android)      |
  +---------------------+
          |
          v
  +---------------------+
  |     Android        |
  |     Component      |
  |     Detection      |
  +---------------------+
          |
          v
  +---------------------+
  |     State Holder   |
  |     Pattern        |
  |     Extraction     |
  +---------------------+
          |
          v
  +---------------------+
  |     Resource       |
  |     Reference      |
  |     Extraction     |
  +---------------------+
          |
          v
  +---------------------+
  |     Compose        |
  |     Function       |
  |     Detection      |
  +---------------------+
```

## 🤖 Entity Listing

### Function
- **detectAndroidFramework** — Checks if code contains Android framework imports `android-extractor.ts:79-91`
- **detectCoroutinesFramework** — Detects the presence of Kotlin Coroutines framework in the code `coroutines-extractor.ts:115-125`
- **detectKtorFramework** — Checks if the code contains Ktor framework imports `ktor-extractor.ts:79-89`
- **enrichEntityWithAndroid** — Enriches a parsed entity with Android-related metadata, including inheritance and annotations `android-extractor.ts:205-266`
- **enrichEntityWithCoroutines** — Enriches an entity with coroutine information `coroutines-extractor.ts:291-342`
- **enrichEntityWithKtor** — Enriches a parsed entity with Ktor-related metadata and relationships `ktor-extractor.ts:339-382`
- **extractAndroidInfo** — Extracts Android-related information from annotations, including Composable, Preview, and lifecycle events `android-extractor.ts:115-153`
- **extractAuthenticationConfig** — Extracts authentication configuration details from the code `ktor-extractor.ts:296-330`
- **extractChannelInfo** — Extracts information about channels `coroutines-extractor.ts:351-381`
- **extractComposeStateUsages** — Extracts usage patterns of Compose state management functions from code `android-extractor.ts:285-310`
- **extractCoroutineExceptionHandling** — Parses the code to determine if it contains an exception handler, a supervisor job, and a catch operator `coroutines-extractor.ts:390-400`
- **extractCoroutineScopeInfo** — Extracts information about a coroutine scope `coroutines-extractor.ts:250-282`
- **extractFlowInfo** — Extracts information about Flow patterns `coroutines-extractor.ts:198-223`
- **extractFlowOperatorChain** — Extracts the chain of Flow operators `coroutines-extractor.ts:228-241`
- **extractHttpClientConfig** — Extracts HTTP client configuration details from the code `ktor-extractor.ts:391-430`
- **extractInstalledPlugins** — Extracts installed Ktor plugins and their configuration status from the provided code `ktor-extractor.ts:234-260`
- **extractKtorRoutes** — Extracts HTTP routes and their handlers from the provided code `ktor-extractor.ts:112-176`
- **extractNavigationDestinations** — Extracts navigation destinations from Android code `android-extractor.ts:353-384`
- **extractResourceReferences** — Extracts references to Android resources from code `android-extractor.ts:319-344`
- **extractRouteHandlers** — Extracts route handlers and their metadata from the provided code `ktor-extractor.ts:181-225`
- **extractSerializationConfig** — Extracts serialization formats and their custom configuration status from the provided code `ktor-extractor.ts:265-287`
- **extractSuspendFunctionInfo** — Extracts information about a suspend function `coroutines-extractor.ts:155-189`
- **extractViewModelInfo** — Extracts ViewModel-related information from a parsed entity, including state flows and LiveData `android-extractor.ts:162-196`
- **extractWebSocketRoutes** — Extracts WebSocket routes and their incoming/outgoing handler status from the provided code `ktor-extractor.ts:439-466`
- **getAllEndpoints** — Extracts all Ktor HTTP method handlers and their corresponding routes `ktor-extractor.ts:482-514`
- **getAndroidConfidence** — Calculates the confidence level of Android-related code based on specific patterns `android-extractor.ts:96-106`
- **getCoroutineComplexityScore** — Calculates a complexity score based on the number of coroutine builders, Flow operators, and nested coroutines in the code `coroutines-extractor.ts:409-431`
- **getCoroutinesConfidence** — Returns the confidence level of detecting Kotlin Coroutines patterns `coroutines-extractor.ts:130-139`
- **getKtorConfidence** — Parses the code to determine the confidence level of Ktor usage `ktor-extractor.ts:94-103`
- **isComposableFunction** — Checks if a function is annotated with Composable `android-extractor.ts:275-280`
- **isKtorApplication** — Checks if the code contains Ktor application patterns `ktor-extractor.ts:475-477`
- **isSuspendFunction** — Checks if a function is a suspend function `coroutines-extractor.ts:148-150`
- **usesStructuredConcurrency** — Checks if the code uses structured concurrency patterns like coroutineScope, supervisorScope, viewModelScope, or lifecycleScope, and avoids using GlobalScope `coroutines-extractor.ts:436-444`

### Interface
- **ExtractedRoute** — Stores route information without location for regex extraction `ktor-extractor.ts:22-26`

### Type_alias
- **HttpMethod** — Represents HTTP methods used in Ktor routing `ktor-extractor.ts:19-19`

### Import_decl
- **../../../types/parser.js** — Imports `../../../types/parser.js` from `../../../types/parser.js`. `android-extractor.ts:16-16`, `coroutines-extractor.ts:16-16`, `ktor-extractor.ts:16-16`
- **../types.js** — Imports `../types.js` from `../types.js`. `android-extractor.ts:17-17`, `coroutines-extractor.ts:17-17`

### Property
- **androidAnnotations** — Represents Android-related annotations found in the code `android-extractor.ts:119-119`
- **arguments** — Stores arguments for a route in Android navigation `android-extractor.ts:355-355`
- **arguments** — Optionally stores an array of strings as arguments `android-extractor.ts:359-359`
- **authMethods** — Lists the authentication methods required `ktor-extractor.ts:298-298`
- **channelTypes** — Represents types of channels `coroutines-extractor.ts:353-353`
- **engine** — Represents the engine used `ktor-extractor.ts:393-393`
- **engine** — Initializes an object with properties for client presence, engine, and plugins `ktor-extractor.ts:396-396`
- **entity** — Represents a parsed entity in the code `android-extractor.ts:209-209`
- **entity** — Represents an entity in the code `coroutines-extractor.ts:295-295`
- **entity** — Represents the parsed entity `ktor-extractor.ts:343-343`
- **flowType** — Determines the type of Flow `coroutines-extractor.ts:201-201`
- **format** — Specifies the format of the entity `ktor-extractor.ts:266-266`, `ktor-extractor.ts:270-270`
- **hasAuthentication** — Determines if the code includes authentication-related patterns `ktor-extractor.ts:297-297`
- **hasCallReceive** — Indicates whether the handler contains a call.receive method `ktor-extractor.ts:183-183`
- **hasCallReceive** — Indicates whether call receive is present `ktor-extractor.ts:189-189`
- **hasCallRespond** — Indicates whether the handler contains a call.respond method `ktor-extractor.ts:184-184`
- **hasCallRespond** — Indicates whether call respond is present `ktor-extractor.ts:190-190`
- **hasCatchOperator** — Indicates whether the code contains a catch operator `coroutines-extractor.ts:393-393`
- **hasChannel** — Checks if a channel is present `coroutines-extractor.ts:352-352`
- **hasClient** — Determines if the code includes HTTP client-related patterns `ktor-extractor.ts:392-392`
- **hasClient** — Represents the presence of a client in the result object `ktor-extractor.ts:396-396`
- **hasConfiguration** — Indicates whether the entity has a configuration `ktor-extractor.ts:236-236`
- **hasConfiguration** — Indicates whether configuration is present `ktor-extractor.ts:240-240`
- **hasCustomConfig** — Checks if the code contains custom configuration settings `ktor-extractor.ts:267-267`
- **hasCustomConfig** — Indicates whether a custom configuration is present `ktor-extractor.ts:271-271`
- **hasExceptionHandler** — Indicates whether the code contains an exception handler `coroutines-extractor.ts:391-391`
- **hasIncoming** — Determines if the code includes incoming request patterns `ktor-extractor.ts:441-441`
- **hasIncoming** — Indicates whether incoming data is present `ktor-extractor.ts:446-446`
- **hasJobCancellation** — Checks if job cancellation is present `coroutines-extractor.ts:256-256`
- **hasJobCancellation** — Indicates whether the coroutine supports job cancellation `coroutines-extractor.ts:258-258`
- **hasOutgoing** — Determines if the code includes outgoing response patterns `ktor-extractor.ts:442-442`
- **hasOutgoing** — Indicates whether outgoing data is present `ktor-extractor.ts:447-447`
- **hasStructuredConcurrency** — Checks if structured concurrency is present `coroutines-extractor.ts:255-255`
- **hasStructuredConcurrency** — Indicates whether the coroutine has structured concurrency `coroutines-extractor.ts:258-258`
- **hasSupervisorJob** — Indicates whether the code contains a supervisor job `coroutines-extractor.ts:392-392`
- **isAuthenticated** — Indicates if the route requires authentication `ktor-extractor.ts:25-25`
- **isCold** — Checks if a Flow is cold `coroutines-extractor.ts:202-202`
- **isComposable** — Represents whether a Composable annotation is present `android-extractor.ts:116-116`
- **isFlow** — Checks if a function is a Flow `coroutines-extractor.ts:200-200`
- **isHot** — Checks if a Flow is hot `coroutines-extractor.ts:203-203`
- **isPreview** — Represents whether a Preview annotation is present `android-extractor.ts:117-117`
- **lifecycleEvents** — Represents lifecycle events annotated in the code `android-extractor.ts:118-118`
- **location** — Optionally stores location information for the entity `android-extractor.ts:287-287`
- **method** — Represents an HTTP method type used in Ktor routing `ktor-extractor.ts:483-483`
- **method** — Specifies the HTTP method for a route `ktor-extractor.ts:23-23`, `ktor-extractor.ts:488-488`
- **name** — Stores the name of the entity `android-extractor.ts:321-321`
- **name** — Stores the name of the entity as a string `android-extractor.ts:325-325`
- **name** — Represents a Ktor HTTP method handler `ktor-extractor.ts:235-235`
- **name** — Represents the name of the extractor `ktor-extractor.ts:239-239`
- **operations** — Extracts Kotlin Coroutines patterns from code `coroutines-extractor.ts:354-354`
- **path** — Stores a string representing a file path `ktor-extractor.ts:440-440`
- **path** — Represents a route path in Ktor routing `ktor-extractor.ts:445-445`
- **path** — Stores the path in the result object `ktor-extractor.ts:484-484`
- **path** — Defines the URL path for a route `ktor-extractor.ts:24-24`, `ktor-extractor.ts:489-489`
- **plugins** — Represents an array of plugin names `ktor-extractor.ts:394-394`
- **plugins** — Stores an array of plugins in the result object `ktor-extractor.ts:396-396`
- **protectedRoutes** — Lists the protected routes `ktor-extractor.ts:299-299`
- **regex** — Stores a regular expression for pattern matching `android-extractor.ts:294-294`
- **relationships** — Represents a list of entity relationships `android-extractor.ts:210-210`
- **relationships** — Represents relationships between entities `coroutines-extractor.ts:296-296`
- **relationships** — Stores the relationships of the entity `ktor-extractor.ts:344-344`
- **responseType** — Stores the response type if present in the handler `ktor-extractor.ts:185-185`
- **responseType** — Represents the type of response expected `ktor-extractor.ts:191-191`
- **route** — Represents a route in Android navigation `android-extractor.ts:354-354`
- **route** — Stores the route of the entity as a string `android-extractor.ts:358-358`
- **route** — Represents a route in Ktor `ktor-extractor.ts:182-182`
- **route** — Represents an extracted route `ktor-extractor.ts:188-188`
- **scope** — Represents the scope of a coroutine `coroutines-extractor.ts:254-254`
- **scope** — Represents the scope of the coroutine `coroutines-extractor.ts:258-258`
- **type** — Specifies the type of the entity, which can be "remember", "rememberSaveable", "derivedStateOf", or "collectAsState" `android-extractor.ts:286-286`
- **type** — Specifies the type of the entity, which can be "string", "drawable", "layout", "id", "color", "dimen", "style", or "other" `android-extractor.ts:290-290`
- **type** — Represents the type of the entity, which can be "remember", "rememberSaveable", "derivedStateOf", or "collectAsState" `android-extractor.ts:295-295`
- **type** — Represents the type of the entity, which can be "string", "drawable", "layout", "id", "color", "dimen", "style", or "other" `android-extractor.ts:320-320`
- **type** — Represents the type of resource or attribute, with options including string, drawable, layout, id, color, dimen, style, and other `android-extractor.ts:324-324`
- **type** — Represents a type of HTTP method in Ktor routing `ktor-extractor.ts:485-485`
- **type** — Specifies the type as either "http" or "websocket" `ktor-extractor.ts:490-490`

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
