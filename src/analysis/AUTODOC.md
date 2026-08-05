# Analysis Module

Multi-signal usage detection for API contract files (GraphQL, Protobuf, Swagger) and technology stack discovery.

## Overview

The analysis module provides three core capabilities for understanding codebases: **technology stack detection** via `TechnologyDetector`, which scans entities, relationships, and project manifests to identify languages, frameworks, build tools, and dependencies with confidence scores; **state chaos analysis** via `ChaosAnalyzer`, which detects scattered mutable state, race conditions, and C#-specific anti-patterns by analyzing entity graphs and their relationships; and **API contract usage detection** via swagger/GraphQL/Protobuf detectors, which identify which specification files are actively used via multi-signal analysis (imports, codegen scripts, config files). The module is designed as a read-only analysis layer operating on `GraphStorage` entity and relationship graphs, producing structured metadata suitable for AI-driven refactoring recommendations.

## Flow

```
┌─────────────────────────────────────────────────────────────┐
│            GraphStorage (entities + relationships)           │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
        ▼            ▼            ▼
   ┌──────────┐ ┌──────────┐ ┌──────────────┐
   │TechStack │ │  Chaos   │ │  Swagger/    │
   │Detector  │ │ Analyzer │ │  GraphQL/    │
   └────┬─────┘ └────┬─────┘ │  Protobuf    │
        │            │       │  Detector    │
        │      ┌─────┴────────┘─────┬───────┘
        │      ▼              ▼     │
        │  StateDetector + RaceDetector
        │  + C# Patterns
        │      │
        ▼      ▼              ▼
   ┌─────────────────────────────────────┐
   │ Structured Analysis Results:        │
   │ - TechnologyStack                   │
   │ - ChaosAnalysisResult[]             │
   │ - SwaggerUsageResult                │
   │ - GraphQLUsageResult                │
   │ - ProtobufUsageResult               │
   └─────────────────────────────────────┘
```

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
| `detectCSharpChaosPatterns` | `chaos/csharp-patterns.ts:144-274` | Scans entity array for C# anti-patterns: mutable statics, async-void methods, god-service classes, missing CancellationToken, and singleton mutable state. |
| `buildRelationshipLookup` | `chaos/state-detector.ts:26-46` | Creates O(1) lookup map from entity ID to their relationships, enabling efficient mutation analysis without repeated linear scans. |
| `isStateIdentifier` | `chaos/angular-patterns.ts:5-40` | Determines if a name is likely a state variable using keyword matching and regex heuristics (detects Angular, Redux, and general state patterns). |
| `isCSharpStateIdentifier` | `chaos/csharp-patterns.ts:84-153` | C# state variable detection using entity metadata inspection (field keywords, property patterns, naming conventions). |
| `detectSwaggerUsage` | `swagger-usage-detector.ts:74-134` | Multi-signal detection of swagger file usage: analyzes imports (weight 0.4), codegen scripts (0.3), config files (0.2), and generated markers (0.1); returns results with confidence >= 0.3. |
| `applySwaggerUsageMetadata` | `swagger-usage-detector.ts:140-167` | Applies swagger usage detection results to entities in graph storage, enriching them with usage metadata and 1-sentence descriptions. |
| `detectGraphQLUsage` | `graphql-usage-detector.ts:60-62` | Multi-signal detection of GraphQL schema file usage via imports, codegen scripts, config files, and generated markers; returns results with confidence >= 0.3. |
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

