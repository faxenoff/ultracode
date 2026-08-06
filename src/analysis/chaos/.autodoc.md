# Chaos

## 🤖 Overview

The `chaos` module is designed for detecting state sprawl and race conditions in codebases, particularly in Angular and C# projects. It provides utilities for identifying patterns that indicate potential issues in state management and concurrency. Developers and maintainers of large-scale applications can use this module to ensure robustness and reliability in their code.

## 🤖 Architecture

```
  +---------------------+
  |     Chaos Analyzer  |
  |     (core logic)    |
  |     +-------------+ |
  |     | State Detector |  |
  |     |     +-------+ |
  |     |     | Race Detector |  |
  |     |     +-------+ |
  |     +-------------+ |
  |     +-------------+ |
  |     | Angular Patterns |  |
  |     |     +-------+ |
  |     |     | C# Patterns |  |
  |     |     +-------+ |
  |     +-------------+ |
  +---------------------+
```

## 🤖 Flow

```
  +---------------------+
  |     Chaos Analyzer  |
  |     (core logic)    |
  |     +-------------+ |
  |     | State Detector |  |
  |     |     +-------+ |
  |     |     | Race Detector |  |
  |     |     +-------+ |
  |     +-------------+ |
  |     +-------------+ |
  |     | Angular Patterns |  |
  |     |     +-------+ |
  |     |     | C# Patterns |  |
  |     |     +-------+ |
  |     +-------------+ |
  +---------------------+
```

## 🤖 Entity Listing

### Function
- **allCode** — Joins code snippets from operations into a single string `chaos-analyzer.ts:496-496`
- **allCode** — Parses the code from each operation and joins them into a single string `chaos-analyzer.ts:530-530`
- **allUnprotected** — Represents all unprotected conditions `race-detector.ts:596-596`
- **asyncMutations** — Represents asynchronous mutations `race-detector.ts:510-510`
- **asyncResults** — Waits for all writer operations to be checked for asynchronous context `race-detector.ts:215-215`
- **buildRelationshipLookup** — Build O(1) relationship lookup from flat array `state-detector.ts:26-46`
- **conditionalWrites** — Represents conditional writes in state mutations `race-detector.ts:477-477`
- **conditions** — Represents conditions for race condition detection `race-detector.ts:389-389`
- **conditions** — Filters and maps mutations to their conditions `race-detector.ts:389-389`
- **detectCSharpChaosPatterns** — Detects C# anti-patterns in the code `csharp-patterns.ts:162-292`
- **existing** — Checks if a hotspot exists for a given file and entity name `chaos-analyzer.ts:451-451`
- **fileCount** — Counts the number of unique files in pattern operations `chaos-analyzer.ts:416-416`
- **files** — Represents a set of files involved in a pattern `chaos-analyzer.ts:71-71`
- **files** — Counts the number of unique files in pattern operations `chaos-analyzer.ts:558-558`
- **files** — Counts the number of unique files referenced in the operations `chaos-analyzer.ts:597-597`
- **files** — Not applicable in this context `state-detector.ts:484-484`
- **fileScore** — Calculates a score based on the number of unique files in pattern operations `chaos-analyzer.ts:394-394`
- **handlerMutations** — Represents handler mutations `race-detector.ts:538-538`
- **hasAsync** — Checks if a condition has asynchronous behavior `race-detector.ts:595-595`
- **hasSingletonIndicator** — Checks if the entity has a singleton indicator `csharp-patterns.ts:272-272`
- **isCSharpContext** — Determines if the pattern operations are in a C# context `chaos-analyzer.ts:533-533`
- **isCSharpStateIdentifier** — Determines if the entity is a C# state identifier `csharp-patterns.ts:84-153`
- **isStateIdentifier** — Determines if a given string is a state identifier based on predefined keywords and patterns `angular-patterns.ts:5-40`
- **mutationFiles** — Creates a set of files from write operations `chaos-analyzer.ts:111-111`
- **patterns** — Represents patterns for race condition detection `race-detector.ts:679-679`
- **readers** — Filters operations to include only read and check operations `race-detector.ts:169-169`
- **resets** — Represents resets in state mutations `race-detector.ts:463-463`
- **seenEntityIds** — Set of seen entity IDs `state-detector.ts:311-311`
- **sharedConditions** — Represents shared conditions for race condition detection `race-detector.ts:406-406`
- **summary** — Maps race conflicts to a structured format `chaos-analyzer.ts:96-101`
- **summary** — Maps locations to file:line format `chaos-analyzer.ts:99-99`
- **writeOps** — Filters operations to include write, initialize, and emit types `chaos-analyzer.ts:109-109`
- **writers** — Filters operations to include write, initialize, and emit operations `race-detector.ts:171-171`

### Method
- **analyze** — Analyzes state patterns for chaos and race conditions based on given options `chaos-analyzer.ts:36-218`
- **analyzeIdentifier** — Analyze an identifier for state pattern `state-detector.ts:190-221`
- **analyzeMutations** — Analyzes state mutations for race conditions `race-detector.ts:213-228`
- **analyzeRaces** — Analyzes state mutations for race conditions `race-detector.ts:167-207`
- **assessConflictSeverity** — Assesses the severity of a conflict `race-detector.ts:594-604`
- **assessDivergenceRisk** — Assesses divergence risk for a pattern `chaos-analyzer.ts:414-425`
- **autoDetectStateIdentifiers** — Auto-detect state identifiers `state-detector.ts:158-188`
- **calculateChaosScore** — Calculates the chaos score for a pattern `chaos-analyzer.ts:392-398`
- **calculateRaceRisk** — Calculates the risk level of a race condition `race-detector.ts:609-642`
- **calculateRiskFactors** — Analyzes state mutations to determine potential race conditions `race-detector.ts:388-450`
- **chooseStrategy** — Выбирает стратегию рефакторинга на основе анализа гонок и других факторов `chaos-analyzer.ts:520-570`
- **classifyMutation** — Classifies mutations for race condition analysis `race-detector.ts:359-383`
- **classifyOperation** — Classify an operation as a state operation `state-detector.ts:353-356`
- **classifyOperationFromCode** — Classifies an operation based on its code content `state-detector.ts:361-391`
- **clearEntityCache** — Clears the entity cache `race-detector.ts:150-154`
- **constructor** — Initializes the ChaosAnalyzer with a graph storage `chaos-analyzer.ts:26-29`
- **constructor** — Initializes the RaceDetector instance `race-detector.ts:135-135`
- **constructor** — Constructor for StateDetector class `state-detector.ts:72-74`
- **csharpPatterns** — Returns C# anti-patterns detected in the last analyze() call `chaos-analyzer.ts:32-34`
- **detectConflicts** — Detects conflicts in state mutations `race-detector.ts:455-552`
- **detectLockPattern** — Detects lock patterns in state mutations `race-detector.ts:306-329`
- **detectPatterns** — Detect state patterns and their operations across the codebase `state-detector.ts:76-156`
- **estimateEffort** — Оценивает усилия рефакторинга на основе количества файлов и конфликтов `chaos-analyzer.ts:596-603`
- **extractCondition** — Extracts conditions from state mutations `race-detector.ts:334-354`
- **extractRelevantCode** — Extracts relevant code from a given entity `state-detector.ts:396-408`
- **findOppositeConditionGroups** — Finds opposite condition groups `race-detector.ts:557-589`
- **findRelatedIdentifiers** — Finds related identifiers for a given entity `state-detector.ts:428-453`
- **findStateOperations** — Find state operations in the code `state-detector.ts:223-348`
- **formatCSharpPatternsForAI** — Форматирует C# анти-паттерны в структурированный текст для AI `chaos-analyzer.ts:281-313`
- **formatDetailed** — Форматирует детали анализа состояния в структурированный текст `chaos-analyzer.ts:318-387`
- **formatForAI** — Форматирует результаты анализа в структурированный текст для AI `chaos-analyzer.ts:223-276`
- **generateHotspots** — Generates hotspots from operations and race conflicts `chaos-analyzer.ts:430-467`
- **generateQuickFixes** — Generates quick fixes based on analysis `chaos-analyzer.ts:472-515`
- **generateRaceReason** — Generates a reason for a race condition `race-detector.ts:661-684`
- **generateReasoning** — Генерирует обоснование выбора стратегии рефакторинга `chaos-analyzer.ts:575-591`
- **getContext** — Retrieves context information for a given entity `state-detector.ts:413-416`
- **getEntityCached** — Retrieves an entity from the cache `race-detector.ts:157-162`
- **getRiskEmoji** — Возвращает эмодзи на основе уровня риска гонок `chaos-analyzer.ts:608-617`
- **inferScope** — Infers the scope of a state operation `state-detector.ts:483-489`
- **inferStateType** — Infers the type of state from the code `state-detector.ts:458-478`
- **isAsyncContext** — Determines if an operation is in an asynchronous context by checking code patterns and entity metadata `race-detector.ts:235-301`
- **isDefensiveCode** — Determines if the code is defensive `state-detector.ts:421-423`
- **raceRiskToScore** — Converts race risk to a score `chaos-analyzer.ts:400-409`
- **riskLevel** — Represents the risk level of a race condition `race-detector.ts:647-656`
- **setEntityCache** — Sets the entity cache `race-detector.ts:141-143`
- **setRelationshipCache** — Sets the relationship cache `race-detector.ts:146-148`

### Class
- **ChaosAnalyzer** — Analyzes state patterns for chaos and race conditions, providing AI-friendly and detailed output formats `chaos-analyzer.ts:21-618`
- **RaceDetector** — Analyzes state mutations to detect potential race conditions `race-detector.ts:128-685`
- **StateDetector** — State pattern detector class `state-detector.ts:64-490`

### Interface
- **CSharpChaosPattern** — Represents a detected C# anti-pattern with its severity, entity details, and a suggestion `csharp-patterns.ts:19-28`
- **EntityWithCode** — Extended entity with optional code content `race-detector.ts:27-29`
- **EntityWithCode** — Extended entity with optional code content (code may come from metadata or file reading) `state-detector.ts:56-58`
- **StatePatternWithRaces** — State pattern with race analysis `state-detector.ts:60-62`

### Type_alias
- **RelationshipLookup** — Relationship lookup type: entityId → all relationships where entity is source or target `state-detector.ts:20-20`

### Import_decl
- **../../logging/index.js** — Imports `../../logging/index.js` from `../../logging/index.js`. `chaos-analyzer.ts:8-8`, `race-detector.ts:11-11`, `state-detector.ts:8-8`
- **../../types/chaos-analysis.js** — Imports `../../types/chaos-analysis.js`. `chaos-analyzer.ts:9-16`, `race-detector.ts:12-19`, `state-detector.ts:9-15`
- **../../types/storage.js** — Imports `../../types/storage.js` from `../../types/storage.js`. `chaos-analyzer.ts:17-17`, `csharp-patterns.ts:12-12`, `csharp-patterns.ts:13-13`, `race-detector.ts:20-20`, `race-detector.ts:21-21`, `state-detector.ts:16-16`, `state-detector.ts:17-17`
- **./angular-patterns.js** — Imports `./angular-patterns.js` from `./angular-patterns.js`. `state-detector.ts:48-48`
- **./csharp-patterns.js** — Imports `./csharp-patterns.js` from `./csharp-patterns.js`. `chaos-analyzer.ts:18-18`, `state-detector.ts:49-49`
- **./race-detector.js** — Imports `./race-detector.js` from `./race-detector.js`. `state-detector.ts:50-50`
- **./state-detector.js** — Imports `./state-detector.js` from `./state-detector.js`. `chaos-analyzer.ts:19-19`, `race-detector.ts:22-22`

### Property
- **_cachedEntities** — Pre-loaded entities for body scanning `state-detector.ts:66-66`
- **_cachedFunctions** — Pre-loaded functions/methods for body scanning `state-detector.ts:68-68`
- **_csharpPatterns** — Stores C# anti-patterns detected in the last analyze() call `chaos-analyzer.ts:24-24`
- **_entityCache** — Internal cache for entities `race-detector.ts:129-129`
- **_relCache** — Internal cache for relationships `race-detector.ts:133-133`
- **_relLookup** — Internal lookup for relationships `race-detector.ts:131-131`
- **_relLookup** — Pre-loaded relationships indexed by entityId for O(1) lookup `state-detector.ts:70-70`
- **allocCallCount** — Counts allocation calls `race-detector.ts:426-426`
- **code** — Known async/problematic browser APIs that appear synchronous but have hidden async behavior or can cause race conditions due to I/O delays `race-detector.ts:28-28`
- **code** — Code content for an entity `state-detector.ts:57-57`
- **description** — Detailed description of the C# anti-pattern `csharp-patterns.ts:26-26`
- **detector** — Detects state patterns for chaos and race conditions `chaos-analyzer.ts:22-22`
- **entityId** — Unique identifier for the entity in the C# code `csharp-patterns.ts:22-22`
- **entityName** — Name of the entity in the C# code `csharp-patterns.ts:23-23`
- **filePath** — File path where the C# anti-pattern is located `csharp-patterns.ts:24-24`
- **forceUnwrapCount** — Counts forced unwraps `race-detector.ts:426-426`
- **freeCallCount** — Counts free calls `race-detector.ts:426-426`
- **line** — Line number in the file where the C# anti-pattern is located `csharp-patterns.ts:25-25`
- **orWithDefaultCount** — Counts mutations with default values `race-detector.ts:417-417`
- **paramMutationCount** — Counts parameter mutations `race-detector.ts:417-417`
- **pattern** — Specifies the type of C# anti-pattern detected `csharp-patterns.ts:20-20`
- **raceAnalysis** — Race analysis for a state pattern `state-detector.ts:61-61`
- **raceDetector** — Race detector instance `state-detector.ts:65-65`
- **severity** — Indicates the criticality of the detected C# anti-pattern `csharp-patterns.ts:21-21`
- **storage** — Stores graph data for analysis `chaos-analyzer.ts:23-23`
- **suggestion** — Suggestion for fixing the C# anti-pattern `csharp-patterns.ts:27-27`

## Data Flow

- **Inputs:** `GraphStorage` containing all entities and relationships, `ChaosAnalysisOptions` with scope and depth settings.
- **Processing:** Bulk entity/relationship loading, state pattern detection via code analysis, race condition detection via mutation point cross-referencing, C#/Angular anti-pattern matching.
- **Outputs:** `ChaosAnalysisResult[]` with state patterns, race risks, mutation points, and refactoring plans.

## Public API

| Export | Type | Description | Location |
|--------|------|-------------|----------|
| `ChaosAnalyzer` | class | Main orchestrator for chaos analysis | [`chaos-analyzer.ts:21-618`](./chaos-analyzer.ts) |
| `StateDetector` | class | Detects state patterns and operations across files | [`state-detector.ts`](./state-detector.ts) |
| `RaceDetector` | class | Detects race conditions from mutation analysis | [`race-detector.ts`](./race-detector.ts) |
| `StatePatternWithRaces` | type | State pattern enriched with race analysis | [`state-detector.ts`](./state-detector.ts) |
| `isStateIdentifier` | function | Checks if a name represents state (Angular) | [`angular-patterns.ts:5-40`](./angular-patterns.ts) |
| `CSharpChaosPattern` | interface | C# anti-pattern detection result | [`csharp-patterns.ts:19-28`](./csharp-patterns.ts) |
| `detectCSharpChaosPatterns` | function | Detects C# state and async anti-patterns | [`csharp-patterns.ts`](./csharp-patterns.ts) |

## Dependencies

### Internal Modules

| Module | Purpose |
|--------|---------|
| `types/chaos-analysis` | Type definitions for analysis results and options |
| `types/storage` | `GraphStorage`, `Entity`, `Relationship` types |
| `logging` | Performance and debug logging |

### External Packages

| Package | Purpose |
|---------|---------|
| (none) | Pure TypeScript analysis with no external dependencies |

## Behavioral Properties

| Property | Value |
|----------|-------|
| Relationship loading | Bulk O(1) lookup via pre-built Map index |
| Race detection patterns | Competing mutations, check-then-act, async boundaries, hidden APIs |
| C# anti-patterns | mutable-static, async-void, god-service, missing-cancellation, singleton-mutable-state |

## Error Handling

Analysis catches and logs errors at each stage, continuing with partial results. Missing code content on entities is handled gracefully by skipping code-level pattern matching. Performance timing is logged for each analysis phase.

## Known Limitations

- Static analysis only; does not execute code or trace runtime behavior.
- Race condition detection is heuristic-based and may produce false positives.
- C# and Angular pattern detection requires entities to have code content in the graph.

## Exports

- `ChaosAnalyzer`
- `RaceDetector`
- `StateDetector`

## Files

| File | Description |
|------|-------------|
| `index.ts` | Re-exports all public types, classes, and functions |
| `chaos-analyzer.ts` | Main `ChaosAnalyzer` orchestrating state and race analysis |
| `state-detector.ts` | `StateDetector` for finding state patterns and operations |
| `race-detector.ts` | `RaceDetector` for competing mutations and async race detection |
| `angular-patterns.ts` | Angular-specific state identifier detection |
| `csharp-patterns.ts` | C# anti-pattern detection (5 high-value patterns) |
