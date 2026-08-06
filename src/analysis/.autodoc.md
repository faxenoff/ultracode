# Analysis Module

## 🤖 Overview

The `src/analysis` module provides a base for detecting usage patterns in API contract files, with specific detectors for GraphQL, Protobuf, and Swagger. Developers and data analysts use this module to identify active API contracts and their usage signals.

## 🤖 Architecture

```
  +---------------------+
  | Base Usage Detector |
  +---------------------+
          |
          v
  +---------------------+
  | GraphQL Usage Detector |
  +---------------------+
          |
          v
  +---------------------+
  | Protobuf Usage Detector |
  +---------------------+
          |
          v
  +---------------------+
  | Swagger Usage Detector |
  +---------------------+
```

## 🤖 Flow

```
  +---------------------+
  | File Usage Detector |
  +---------------------+
          |
          v
  +---------------------+
  | Parse File |
  +---------------------+
          |
          v
  +---------------------+
  | Extract Usage Signals |
  +---------------------+
          |
          v
  +---------------------+
  | Score Usage Signals |
  +---------------------+
          |
          v
  +---------------------+
  | Generate Usage Result |
  +---------------------+
```

## 🤖 Entity Listing

### Function
- **activeFiles** — Number of files classified as active `base-usage-detector.ts:112-112`
- **addFile** — Adds a file to the detection process `technology-detector.ts:321-328`
- **analyzeCodegenConfigSignal** — Analyzes codegen config signals for usage detection `base-usage-detector.ts:198-214`
- **analyzeCodegenScriptSignal** — Analyzes codegen script signals for usage detection `base-usage-detector.ts:180-196`
- **analyzeGeneratedMarkersSignal** — Analyzes generated markers signals for usage detection `base-usage-detector.ts:216-229`
- **analyzeImportsSignal** — Analyzes import signals for usage detection `base-usage-detector.ts:158-178`
- **apiRels** — Relationships related to API entities `base-usage-detector.ts:166-166`
- **applyGraphQLUsageMetadata** — Applies metadata to the detected GraphQL usage result `graphql-usage-detector.ts:60-62`
- **applyProtobufUsageMetadata** — Applies metadata to the detected protobuf usage result `protobuf-usage-detector.ts:41-43`
- **applySwaggerUsageMetadata** — Applies metadata to the detected swagger/OpenAPI file usage `swagger-usage-detector.ts:52-54`
- **applyUsageMetadata** — Applies usage metadata to entities `base-usage-detector.ts:119-152`
- **detectGraphQLUsage** — Detects actively used GraphQL schema files using multi-signal scoring `graphql-usage-detector.ts:22-58`
- **detectProtobufUsage** — Detects actively used protobuf files by analyzing metadata and code patterns `protobuf-usage-detector.ts:22-39`
- **detectSwaggerUsage** — Detects actively used swagger/OpenAPI files using multi-signal scoring `swagger-usage-detector.ts:16-50`
- **detectUsage** — Detects usage of API contract files using multiple signals `base-usage-detector.ts:70-117`
- **entitiesByFile** — Entities grouped by file path `base-usage-detector.ts:125-125`
- **found** — Found entities for usage detection `base-usage-detector.ts:199-203`
- **found** — Determines if a configuration file name matches the given name or ends with the configuration file name `base-usage-detector.ts:202-202`
- **frameworkConfidence** — Calculates the confidence score for detected frameworks `technology-detector.ts:594-594`
- **matching** — Matching entities for usage detection `base-usage-detector.ts:182-185`
- **matching** — Checks if any keyword is present in the command string `base-usage-detector.ts:184-184`
- **matchingImports** — Matching imports for usage detection `base-usage-detector.ts:163-163`
- **scriptEntities** — Entities related to codegen scripts `base-usage-detector.ts:181-181`
- **usageConfidence** — Confidence level of usage detection `base-usage-detector.ts:101-101`

### Method
- **calculateConfidence** — Calculates the confidence score for detected technologies `technology-detector.ts:581-602`
- **constructor** — Initializes the TechnologyDetector with a graph storage and working directory `technology-detector.ts:70-75`
- **detectBuildTools** — Detects build tools in the codebase `technology-detector.ts:441-494`
- **detectDependencies** — Detects dependencies in the codebase `technology-detector.ts:500-547`
- **detectFrameworks** — Detects frameworks in the codebase `technology-detector.ts:162-187`
- **detectFromBuildFiles** — Detects technologies from build files `technology-detector.ts:679-713`
- **detectFromGradle** — Detects technologies from a Gradle file `technology-detector.ts:761-825`
- **detectFromImports** — Detects frameworks and dependencies from import statements `technology-detector.ts:311-435`
- **detectFromPackageJson** — Detects frameworks and dependencies from package.json `technology-detector.ts:189-309`
- **detectFromPom** — Detects technologies from a Maven POM file `technology-detector.ts:715-759`
- **detectLanguages** — Detects programming languages in the codebase `technology-detector.ts:114-156`
- **detectStack** — Detects the full technology stack `technology-detector.ts:80-95`
- **generateTechContext** — Generates a technology context for embeddings `technology-detector.ts:100-108`
- **initializePatterns** — Initializes detection patterns for the TechnologyDetector `technology-detector.ts:604-670`
- **parseGradleDependencies** — Parses dependencies from a Gradle file `technology-detector.ts:549-575`

### Class
- **TechnologyDetector** — A class for detecting technology stack and frameworks `technology-detector.ts:67-826`

### Interface
- **BuildToolInfo** — An interface representing information about a detected build tool, including its name and configuration files `technology-detector.ts:52-55`
- **DependencyInfo** — Represents a dependency with its name, version, and type `technology-detector.ts:57-61`
- **DetectionPattern** — A pattern used for detecting technologies `technology-detector.ts:828-832`
- **FileUsage** — Represents the usage of a file, including its path, usage confidence, whether it is an active contract, and its signals `base-usage-detector.ts:23-28`
- **FrameworkInfo** — An interface representing information about a detected framework, including its name, version, category, confidence score, and evidence `technology-detector.ts:44-50`
- **LanguageInfo** — An interface representing information about a detected programming language, including its name, version, percentage, and file count `technology-detector.ts:37-42`
- **TechnologyStack** — Represents the detected stack of programming languages, frameworks, build tools, and dependencies with confidence scores `technology-detector.ts:29-35`
- **UsageDetectorConfig** — Configuration for the usage detector, including log tag, entity filter, import path matcher, codegen keywords, config file names, generated filter, signal weights, and active threshold `base-usage-detector.ts:40-57`
- **UsageResult** — Represents the result of the usage detection, including a map of files, total files, and active files `base-usage-detector.ts:30-34`
- **UsageSignal** — Represents a signal indicating usage of an API contract file, with type, weight, score, and details `base-usage-detector.ts:16-21`

### Type_alias
- **GraphQLFileUsage** — Represents the usage of a specific file in the context of GraphQL `graphql-usage-detector.ts:19-19`
- **GraphQLUsageResult** — Represents the result of detecting GraphQL schema usage `graphql-usage-detector.ts:18-18`
- **GraphQLUsageSignal** — Represents a signal indicating the usage of a GraphQL file `graphql-usage-detector.ts:20-20`
- **ProtobufFileUsage** — Represents the usage of a file in the context of protobuf `protobuf-usage-detector.ts:19-19`
- **ProtobufUsageResult** — Represents the result of detecting protobuf usage in a file `protobuf-usage-detector.ts:18-18`
- **ProtobufUsageSignal** — Represents a signal indicating the usage of protobuf in a file `protobuf-usage-detector.ts:20-20`
- **SwaggerFileUsage** — Represents the usage of a specific swagger/OpenAPI file `swagger-usage-detector.ts:13-13`
- **SwaggerUsageResult** — Represents the result of detecting swagger/OpenAPI file usage `swagger-usage-detector.ts:12-12`

### Import_decl
- **../logging/index.js** — Imports `../logging/index.js` from `../logging/index.js`. `base-usage-detector.ts:8-8`, `technology-detector.ts:22-22`
- **../types/storage.js** — Imports `../types/storage.js` from `../types/storage.js`. `base-usage-detector.ts:9-9`, `base-usage-detector.ts:10-10`, `graphql-usage-detector.ts:8-8`, `protobuf-usage-detector.ts:8-8`, `swagger-usage-detector.ts:8-8`, `technology-detector.ts:23-23`
- **./base-usage-detector.js** — Imports `./base-usage-detector.js`. `graphql-usage-detector.ts:9-15`, `protobuf-usage-detector.ts:9-15`
- **./base-usage-detector.js** — Imports `./base-usage-detector.js` from `./base-usage-detector.js`. `swagger-usage-detector.ts:9-9`
- **node:fs** — Imports `node:fs` from `node:fs`. `technology-detector.ts:19-19`
- **node:fs/promises** — Imports `node:fs/promises` from `node:fs/promises`. `technology-detector.ts:20-20`
- **node:path** — Imports `node:path` from `node:path`. `technology-detector.ts:21-21`

### Property
- **activeFiles** — Tracks the number of active files currently being used `base-usage-detector.ts:33-33`
- **activeThreshold** — Threshold for "active" classification (default: 0.3) `base-usage-detector.ts:56-56`
- **buildTools** — An array of detected build tools with their configuration files `technology-detector.ts:32-32`
- **category** — The category of a detected framework, such as frontend, backend, testing, build, or other `technology-detector.ts:47-47`
- **changes** — Changes made to entities `base-usage-detector.ts:129-129`
- **codegenKeywords** — Keywords in codegen scripts `base-usage-detector.ts:48-48`
- **confidence** — A confidence score between 0 and 1 indicating the certainty of the technology stack detection `technology-detector.ts:34-34`
- **confidence** — Represents the confidence level of the technology detection `technology-detector.ts:48-48`
- **configFileNames** — Config file names that indicate codegen is set up `base-usage-detector.ts:50-50`
- **configFiles** — An array of configuration files associated with a detected build tool `technology-detector.ts:54-54`
- **dependencies** — An array of detected dependencies with their versions and types `technology-detector.ts:33-33`
- **details** — Additional details about the usage signal `base-usage-detector.ts:20-20`
- **detectionPatterns** — A map of detection patterns used for identifying technologies `technology-detector.ts:68-68`
- **entityFilter** — A function to filter entities that represent API files `base-usage-detector.ts:44-44`
- **evidence** — An array of evidence strings supporting the framework detection `technology-detector.ts:49-49`
- **fileCount** — The number of files in the codebase that are written in a detected programming language `technology-detector.ts:41-41`
- **filePath** — The file path of the API contract file `base-usage-detector.ts:24-24`
- **files** — A map of files to their usage details `base-usage-detector.ts:31-31`
- **files** — Represents a collection of files used for detecting technology stack `technology-detector.ts:830-830`
- **frameworks** — An array of detected frameworks with their versions, categories, confidence scores, and evidence `technology-detector.ts:31-31`
- **generatedFilter** — A function to filter entities that appear to be generated from the API type `base-usage-detector.ts:52-52`
- **id** — Unique identifier for an entity `base-usage-detector.ts:129-129`
- **importPathMatcher** — A function to check if an import path matches generated paths for the API type `base-usage-detector.ts:46-46`
- **imports** — Import statements in the codebase `technology-detector.ts:829-829`
- **isActiveContract** — A boolean indicating whether the file is an active contract `base-usage-detector.ts:26-26`
- **keywords** — Represents an array of keywords used for technology detection `technology-detector.ts:831-831`
- **languages** — An array of detected programming languages with their versions, percentages, and file counts `technology-detector.ts:30-30`
- **logTag** — The log tag for the usage detector `base-usage-detector.ts:42-42`
- **name** — Stores the name of the detected technology `technology-detector.ts:53-53`, `technology-detector.ts:58-58`
- **name** — The name of a detected programming language `technology-detector.ts:38-38`
- **name** — The name of a dependency `technology-detector.ts:45-45`
- **percentage** — The percentage of the codebase that is written in a detected programming language `technology-detector.ts:40-40`
- **score** — The score calculated for a usage signal `base-usage-detector.ts:19-19`
- **signals** — An array of usage signals associated with the file `base-usage-detector.ts:27-27`
- **signalWeights** — Signal weights for different types of usage signals `base-usage-detector.ts:54-54`
- **totalFiles** — The total number of files processed `base-usage-detector.ts:32-32`
- **type** — The type of usage signal, such as imports, codegen_script, codegen_config, or generated_markers `base-usage-detector.ts:17-17`
- **type** — The type of a dependency, either "prod" or "dev" `technology-detector.ts:60-60`
- **usageConfidence** — Represents the confidence level of file usage detection `base-usage-detector.ts:25-25`
- **version** — The version of a dependency `technology-detector.ts:46-46`, `technology-detector.ts:59-59`
- **version** — The version of a detected programming language `technology-detector.ts:39-39`
- **weight** — The weight assigned to a usage signal `base-usage-detector.ts:18-18`

## Public API

### Core Classes

| Export | File:Lines | Description |
|--------|-----------|-------------|
| `TechnologyDetector` | `technology-detector.ts:67-826` | Detects programming languages, frameworks, build tools, and dependencies by scanning entities, relationships, and project manifests (package.json, pom.xml, build.gradle). |
| `ChaosAnalyzer` | `chaos/chaos-analyzer.ts:21-618` | Coordinator for state chaos analysis: detects mutable state patterns, race conditions, C# anti-patterns, and produces chaos scoring, divergence risk assessment, and refactoring hotspots. |
| `StateDetector` | `chaos/state-detector.ts:64-490` | Identifies mutable state patterns in codebases via heuristic scanning of entity names and relationship mutations; integrates race condition detection on results. |
| `RaceDetector` | `chaos/race-detector.ts:128-651` | Analyzes state operations for race conditions: competing writes, check-then-act patterns, async boundary violations, and lock inadequacy. |

### Result Types

| Export | File:Lines | Description |
|--------|-----------|-------------|
| `TechnologyStack` | `technology-detector.ts:29-35` | Result interface containing detected languages, frameworks, build tools, dependencies, and overall confidence score. |
| `LanguageInfo` | `technology-detector.ts:37-42` | Language detection result with name, detected version, percentage of codebase, and file count. |
| `FrameworkInfo` | `technology-detector.ts:44-50` | Framework detection result with name, version, category (web/mobile/etc), confidence level, and evidence sources. |
| `BuildToolInfo` | `technology-detector.ts:52-55` | Build tool metadata: tool name and paths to configuration files found. |
| `DependencyInfo` | `technology-detector.ts:57-61` | Dependency metadata: name, detected version, and classification (production or development). |
| `StatePatternWithRaces` | `chaos/state-detector.ts:60-62` | State pattern extended with embedded race condition analysis and severity assessment. |
| `CSharpChaosPattern` | `chaos/csharp-patterns.ts:19-28` | C# anti-pattern detection result: pattern type, severity, affected entity ID, and refactoring suggestion. |
| `SwaggerUsageResult` | `swagger-usage-detector.ts:16-50` | Swagger/OpenAPI usage detection summary: files map, total count, and active file count. |
| `SwaggerFileUsage` | `swagger-usage-detector.ts:16-50` | Per-file usage data: confidence score, active status, and array of detection signals with weights. |
| `UsageSignal` | `swagger-usage-detector.ts:16-50` | Individual usage signal: signal type, weight, calculated score, and descriptive details. |
| `GraphQLUsageResult` | `graphql-usage-detector.ts:22-58` | GraphQL schema usage detection summary containing per-file usage data and active schema counts. |
| `GraphQLFileUsage` | `graphql-usage-detector.ts:22-58` | Per GraphQL schema file usage metrics: confidence score, active status, and array of detection signals. |
| `GraphQLUsageSignal` | `graphql-usage-detector.ts:22-58` | Individual GraphQL usage detection signal: signal type, weight, calculated score, and descriptive details. |
| `ProtobufUsageResult` | `protobuf-usage-detector.ts:22-39` | Protobuf schema usage detection summary containing per-file usage data and active schema counts. |
| `ProtobufFileUsage` | `protobuf-usage-detector.ts:22-39` | Per Protobuf schema file usage metrics: confidence score, active status, and array of detection signals. |
| `ProtobufUsageSignal` | `protobuf-usage-detector.ts:37-42` | Individual Protobuf usage detection signal: signal type, weight, calculated score, and descriptive details. |

### Utility Functions

| Export | File:Lines | Description |
|--------|-----------|-------------|
| `detectCSharpChaosPatterns` | `chaos/csharp-patterns.ts:272-272` | Scans entity array for C# anti-patterns: mutable statics, async-void methods, god-service classes, missing CancellationToken, and singleton mutable state. |
| `buildRelationshipLookup` | `chaos/state-detector.ts:26-46` | Creates O(1) lookup map from entity ID to their relationships, enabling efficient mutation analysis without repeated linear scans. |
| `isStateIdentifier` | `chaos/angular-patterns.ts:5-40` | Determines if a name is likely a state variable using keyword matching and regex heuristics (detects Angular, Redux, and general state patterns). |
| `isCSharpStateIdentifier` | `chaos/csharp-patterns.ts:84-153` | C# state variable detection using entity metadata inspection (field keywords, property patterns, naming conventions). |
| `detectSwaggerUsage` | `swagger-usage-detector.ts:74-134` | Multi-signal detection of swagger file usage: analyzes imports (weight 0.4), codegen scripts (0.3), config files (0.2), and generated markers (0.1); returns results with confidence >= 0.3. |
| `applySwaggerUsageMetadata` | `swagger-usage-detector.ts:140-167` | Applies swagger usage detection results to entities in graph storage, enriching them with usage metadata and 1-sentence descriptions. |
| `detectGraphQLUsage` | `graphql-usage-detector.ts:36-67` | Multi-signal detection of GraphQL schema file usage via imports, codegen scripts, config files, and generated markers; returns results with confidence >= 0.3. |
| `applyGraphQLUsageMetadata` | `graphql-usage-detector.ts:122-143` | Applies GraphQL usage detection results to entities in graph storage, enriching them with usage metadata. |
| `detectProtobufUsage` | `protobuf-usage-detector.ts:61-117` | Multi-signal detection of Protobuf schema file usage via imports, codegen scripts, config files, and generated markers; returns results with confidence >= 0.3. |
| `applyProtobufUsageMetadata` | `protobuf-usage-detector.ts:119-140` | Applies Protobuf usage detection results to entities in graph storage, enriching them with usage metadata. |

## Design Patterns & Dependencies

### Detector Pattern

Each analysis capability follows a detector pattern: `TechnologyDetector`, `StateDetector`, and `RaceDetector` are specialized analyzers that operate independently on the shared `GraphStorage` graph, each producing typed result objects suitable for downstream AI analysis or UI presentation. Contract detectors (`detectSwaggerUsage`, `detectGraphQLUsage`, `detectProtobufUsage`) extend this pattern to multiple specification file types.

### Composition in ChaosAnalyzer

The `ChaosAnalyzer` coordinates multiple sub-detectors (`StateDetector`, `RaceDetector`, `detectCSharpChaosPatterns`) to produce a unified chaos assessment, demonstrating how multiple concerns (state scattering, concurrency hazards, language-specific anti-patterns) are composed into a single analysis result.

### Multi-Signal Analysis

Contract usage detectors (`detectSwaggerUsage`, `detectGraphQLUsage`, `detectProtobufUsage`) demonstrate weighted multi-signal analysis: each detection signal (import statements, codegen scripts, config references, codegen markers) contributes independently with a configurable weight (0.4, 0.3, 0.2, 0.1), and results are filtered by a confidence threshold (>= 0.3) to eliminate false positives.

### Heuristic-Based Identification

State pattern detection (`isStateIdentifier`, `isCSharpStateIdentifier`) uses language-specific naming and structural heuristics rather than type analysis, enabling lightweight scanning across polyglot codebases without requiring full semantic parsing.

### Added Entities

- **UsageSignal** — `base-usage-detector.ts:16-21`
- **FileUsage** — `base-usage-detector.ts:23-28`
- **UsageResult** — `base-usage-detector.ts:30-34`
- **UsageDetectorConfig** — `base-usage-detector.ts:40-57`
- **detectUsage** — `base-usage-detector.ts:70-117`
- **applyUsageMetadata** — `base-usage-detector.ts:119-140`
- **analyzeImportsSignal** — `base-usage-detector.ts:146-166`
- **analyzeCodegenScriptSignal** — `base-usage-detector.ts:168-184`
- **analyzeCodegenConfigSignal** — `base-usage-detector.ts:186-202`
- **analyzeGeneratedMarkersSignal** — `base-usage-detector.ts:204-217`
- **DEFAULT_WEIGHTS** — `base-usage-detector.ts:59-64`
- **allEntities** — `base-usage-detector.ts:71-71`
- **allRelationships** — `base-usage-detector.ts:72-72`
- **weights** — `base-usage-detector.ts:73-73`
- **threshold** — `base-usage-detector.ts:74-74`
- **apiEntities** — `base-usage-detector.ts:77-77`
- **apiFiles** — `base-usage-detector.ts:78-78`
- **files** — `base-usage-detector.ts:89-89`
- **signals** — `base-usage-detector.ts:92-97`
- **usageConfidence** — `base-usage-detector.ts:99-102`
- **activeFiles** — `base-usage-detector.ts:112-112`
- **entities** — `base-usage-detector.ts:123-123`
- **matchingImports** — `base-usage-detector.ts:151-151`
- **apiRels** — `base-usage-detector.ts:153-155`
- **hasImports** — `base-usage-detector.ts:157-157`
- **scriptEntities** — `base-usage-detector.ts:169-169`
- **matching** — `base-usage-detector.ts:170-173`
- **cmd** — `base-usage-detector.ts:171-171`
- **found** — `base-usage-detector.ts:187-191`
- **name** — `base-usage-detector.ts:188-188`
- **fp** — `base-usage-detector.ts:189-189`
- **generated** — `base-usage-detector.ts:209-209`
- **updated** — `base-usage-detector.ts:120-120`
