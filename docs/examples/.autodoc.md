# Examples Module

## 🤖 Overview

The `docs/examples` module provides practical examples for various code analysis and modification tools. It includes usage scenarios for Chaos Analysis, Code Modification, and Layered Indexing, demonstrating how these tools can be applied in real-world development contexts. Developers and maintainers of codebases can use these examples to understand and implement the tools effectively.

## 🤖 Architecture

```
  [Chaos Analyzer] → [Graph Storage] → [Code Modification Tools]
  [Layered Index Manager] → [Branch Manager] → [Git Watcher]
```

## 🤖 Flow

```
  [User] → [Chaos Analyzer] → [Graph Storage] → [Code Modification Tools]
  [User] → [Layered Index Manager] → [Branch Manager] → [Git Watcher]
```

## 🤖 Entity Listing

### Function
- **analyzeAuthModule** — Analyzes the state management of an auth module, identifying potential chaos issues and providing recommendations `chaos-analysis-example.ts:94-137`
- **analyzeToken** — Analyzes a specific state identifier for chaos issues `chaos-analysis-example.ts:14-49`
- **autoDetectStateProblems** — Auto-detects all state management problems in the project `chaos-analysis-example.ts:55-88`
- **baseByPath** — Represents the base unit by path `demo-semantic-merge.ts:176-176`
- **basicSetupExample** — Initializes a LayeredIndexManager with existing components and basic configuration `layered-indexing-example.ts:26-49`
- **benchmark** — Benchmarks function execution time `cuda-example.ts:61-76`
- **branchAByPath** — Represents the unit of branch A by path `demo-semantic-merge.ts:177-177`
- **branchBByPath** — Represents the unit of branch B by path `demo-semantic-merge.ts:178-178`
- **branchManagementExample** — Switches to a different branch, retrieves cached branches, and switches back to main `layered-indexing-example.ts:106-122`
- **calculateTotalEntity** — Represents the entity to be modified `code-modification-example.ts:78-78`
- **cleanupExample** — Deletes a branch delta and gracefully shuts down the LayeredIndexManager `layered-indexing-example.ts:158-170`
- **corpus** — Creates an array of random vectors for a corpus `cuda-example.ts:240-240`
- **cosineSimilarityCPU** — Computes cosine similarity on CPU `cuda-example.ts:43-56`
- **countDefensive** — Counts the number of defensive patterns in a given object `chaos-analysis-example.ts:235-239`
- **cpuBatchTime** — Measures time for batch CPU cosine similarity calculations `cuda-example.ts:154-158`
- **cpuTime** — Benchmarks CPU cosine similarity calculation `cuda-example.ts:121-121`
- **cudaBatchTime** — Benchmarks batch CUDA cosine similarity calculations `cuda-example.ts:165-165`
- **cudaTime** — Benchmarks CUDA cosine similarity calculation `cuda-example.ts:126-126`
- **documents** — Creates an array of random vectors for documents `cuda-example.ts:142-142`
- **example10_synthesizeFiles** — Synthesizes multiple files into one and logs the result `code-modification-example.ts:191-203`
- **example11_safeRefactoring** — Safely refactors a code entity and logs the result `code-modification-example.ts:212-251`
- **example12_batchRestructure** — Restructures multiple files and logs the result `code-modification-example.ts:256-279`
- **example1_createSnapshot** — Creates a snapshot of specific files before risky changes `code-modification-example.ts:17-26`
- **example2_listSnapshots** — Lists available snapshots `code-modification-example.ts:31-40`
- **example3_rollback** — Rolls back to a previous snapshot `code-modification-example.ts:45-52`
- **example4_cleanup** — Cleans up old snapshots `code-modification-example.ts:57-63`
- **example5_previewModification** — Preview code modification `code-modification-example.ts:72-94`
- **example6_applyModification** — Applies a code modification and logs the result `code-modification-example.ts:99-124`
- **example7_copyFile** — Copies a file and logs the result `code-modification-example.ts:133-144`
- **example8_renameFile** — Renames a file and logs the result `code-modification-example.ts:149-162`
- **example9_splitFile** — Splits a file into multiple files and logs the result `code-modification-example.ts:167-186`
- **exec** — Executes a command in the specified directory and returns the output `demo-merge-simple.mjs:29-39`
- **findMutationHotspots** — Identifies mutation hotspots in the codebase, highlighting files and nodes with frequent state mutations `chaos-analysis-example.ts:143-186`
- **fromCache** — Parses the cache results to count how many entries are from the cache `parser-agent-demo.ts:132-132`
- **getFileContent** — Retrieves the content of a file from a specified branch using git show `demo-merge-simple.mjs:45-51`
- **hashContent** — Generates a SHA-256 hash of the provided content `demo-merge-simple.mjs:41-43`
- **indexed** — Maps similarities to indexed scores and sorts them `cuda-example.ts:256-256`
- **integratedAnalysis** — Performs an integrated analysis of services in the codebase, focusing on their state management and properties `chaos-analysis-example.ts:245-281`
- **main** — Initializes and runs the parser agent demo, including single file parsing and batch processing `parser-agent-demo.ts:12-172`
- **measureRefactoringImpact** — Measures the impact of a refactoring plan on a project's state management, comparing before and after metrics `chaos-analysis-example.ts:192-233`
- **mutationNodes** — Filters nodes in a flow map to find those with mutations `chaos-analysis-example.ts:161-161`
- **norm** — Computes the Euclidean norm of a vector `cuda-example.ts:187-187`, `cuda-example.ts:195-195`
- **orderHelperEntity** — Finds the OrderHelper entity in the list of entities `code-modification-example.ts:175-175`
- **queries** — Creates an array of random vectors for queries `cuda-example.ts:141-141`
- **queryEmbeddings** — Creates an array of random vectors for query embeddings `cuda-example.ts:243-243`
- **queryOperationsExample** — Demonstrates querying entities and relationships in different branches using a LayeredIndexManager `layered-indexing-example.ts:55-74`
- **randomVector** — Generates random embedding vector `cuda-example.ts:36-38`
- **results** — Compares query embeddings against a corpus and returns top-10 results `cuda-example.ts:250-260`
- **runChaosAnalysisExamples** — Runs a series of chaos analysis examples, including token analysis, state problem detection, auth module analysis, mutation hotspots, refactoring impact, and integrated analysis `chaos-analysis-example.ts:287-314`
- **runLayeredIndexingExample** — Executes a series of examples for Layered Indexing, including setup, query operations, semantic search, branch management, status monitoring, and cleanup `layered-indexing-example.ts:176-212`
- **semanticSearchExample** — Shows how to perform semantic search using vector embeddings with a LayeredIndexManager `layered-indexing-example.ts:80-100`
- **sorted** — Sorts state patterns by chaos score in descending order `chaos-analysis-example.ts:70-70`
- **sorted** — Sorts file groups by the length of their entries in descending order `chaos-analysis-example.ts:175-175`
- **sorted** — Not present in the provided entities `demo-merge-simple.mjs:172-176`
- **statusMonitoringExample** — Retrieves and logs the current status of the LayeredIndexManager, including initialization status, current branch, cached branches, and total entities `layered-indexing-example.ts:128-152`
- **userHelperEntity** — Finds the UserHelper entity in the list of entities `code-modification-example.ts:174-174`

### Method
- **analyzeConflicts** — Represents a function to analyze conflicts between code units `demo-semantic-merge.ts:258-291`
- **constructor** — Initializes the SemanticMergeDemo class with project path and branch names `demo-semantic-merge.ts:54-105`
- **cosineSimilarity** — Represents a function to calculate cosine similarity between code units `demo-semantic-merge.ts:399-416`
- **detectLanguage** — Represents a function to detect the programming language of a code unit `demo-semantic-merge.ts:393-397`
- **fastPathMatch** — Matches branches using fast path (hashes) `demo-semantic-merge.ts:156-204`
- **generateId** — Represents a function to generate a unique identifier for a code unit `demo-semantic-merge.ts:378-380`
- **generateReport** — Represents a function to generate a report of the merge analysis `demo-semantic-merge.ts:337-374`
- **getUnitType** — Represents a function to determine the type of a code unit `demo-semantic-merge.ts:386-391`
- **hashContent** — Represents a function to hash the content of a code unit `demo-semantic-merge.ts:382-384`
- **indexBranch** — Indexes the branches for comparison `demo-semantic-merge.ts:117-151`
- **initialize** — Initializes the merge components `demo-semantic-merge.ts:107-112`
- **run** — Represents a function to run the semantic merge analysis `demo-semantic-merge.ts:296-332`
- **semanticMatch** — Represents a function to match code units based on semantic similarity `demo-semantic-merge.ts:209-253`

### Class
- **SemanticMergeDemo** — Class for demonstrating semantic merge between branches `demo-semantic-merge.ts:40-417`

### Interface
- **MergeMetrics** — Interface for tracking merge performance metrics `demo-semantic-merge.ts:25-38`

### Import_decl
- **../../src/agents/parser-agent.js** — Imports `../../src/agents/parser-agent.js` from `../../src/agents/parser-agent.js`. `parser-agent-demo.ts:9-9`
- **../../src/analysis/chaos/index.js** — Imports `../../src/analysis/chaos/index.js` from `../../src/analysis/chaos/index.js`. `chaos-analysis-example.ts:7-7`
- **../../src/core/branch-manager.js** — Imports `../../src/core/branch-manager.js` from `../../src/core/branch-manager.js`. `demo-semantic-merge.ts:15-15`, `layered-indexing-example.ts:16-16`
- **../../src/core/git-watcher.js** — Imports `../../src/core/git-watcher.js` from `../../src/core/git-watcher.js`. `layered-indexing-example.ts:17-17`
- **../../src/layered/index.js** — Imports `../../src/layered/index.js` from `../../src/layered/index.js`. `layered-indexing-example.ts:18-18`
- **../../src/merge/analysis/conflict-detector.js** — Imports `../../src/merge/analysis/conflict-detector.js` from `../../src/merge/analysis/conflict-detector.js`. `demo-semantic-merge.ts:16-16`
- **../../src/merge/analysis/intent-classifier.js** — Imports `../../src/merge/analysis/intent-classifier.js` from `../../src/merge/analysis/intent-classifier.js`. `demo-semantic-merge.ts:17-17`
- **../../src/merge/engine/ai-conflict-resolver.js** — Imports `../../src/merge/engine/ai-conflict-resolver.js` from `../../src/merge/engine/ai-conflict-resolver.js`. `demo-semantic-merge.ts:18-18`
- **../../src/merge/engine/conflict-resolver.js** — Imports `../../src/merge/engine/conflict-resolver.js` from `../../src/merge/engine/conflict-resolver.js`. `demo-semantic-merge.ts:19-19`
- **../../src/merge/integration/git-integration.js** — Imports `../../src/merge/integration/git-integration.js` from `../../src/merge/integration/git-integration.js`. `demo-semantic-merge.ts:20-20`
- **../../src/merge/models/code-unit.js** — Imports `../../src/merge/models/code-unit.js` from `../../src/merge/models/code-unit.js`. `demo-semantic-merge.ts:21-21`
- **../../src/semantic/embedding-generator.js** — Imports `../../src/semantic/embedding-generator.js` from `../../src/semantic/embedding-generator.js`. `demo-semantic-merge.ts:22-22`
- **../../src/semantic/vector-store.js** — Imports `../../src/semantic/vector-store.js` from `../../src/semantic/vector-store.js`. `layered-indexing-example.ts:19-19`
- **../../src/types/parser.js** — Imports `../../src/types/parser.js` from `../../src/types/parser.js`. `parser-agent-demo.ts:10-10`
- **../../src/types/storage.js** — Imports `../../src/types/storage.js` from `../../src/types/storage.js`. `chaos-analysis-example.ts:8-8`, `layered-indexing-example.ts:20-20`
- **node:child_process** — Imports `node:child_process` from `node:child_process`. `demo-merge-simple.mjs:9-9`
- **node:crypto** — Imports `node:crypto` from `node:crypto`. `demo-merge-simple.mjs:10-10`, `demo-semantic-merge.ts:14-14`
- **node:events** — Imports `node:events` from `node:events`. `parser-agent-demo.ts:8-8`
- **node:perf_hooks** — Imports `node:perf_hooks` from `node:perf_hooks`. `cuda-example.ts:16-16`

### Property
- **_intentClassifier** — Classifies the intent of code units `demo-semantic-merge.ts:51-51`
- **aiResolved** — Number of conflicts resolved by AI `demo-semantic-merge.ts:33-33`
- **aiResolver** — Resolves conflicts using AI `demo-semantic-merge.ts:49-49`
- **baseUnit** — Represents the base unit of code `demo-semantic-merge.ts:161-161`
- **baseUnit** — Represents a base code unit for comparison `demo-semantic-merge.ts:169-169`
- **baseUnit** — Analyzes conflicts between base units and branch units `demo-semantic-merge.ts:258-258`
- **branchA** — Name of the first branch to merge `demo-semantic-merge.ts:42-42`
- **branchAUnit** — Represents the unit of branch A `demo-semantic-merge.ts:161-161`
- **branchAUnit** — Represents a code unit from branch A `demo-semantic-merge.ts:170-170`
- **branchAUnit** — Analyzes conflicts between base units and branch units `demo-semantic-merge.ts:258-258`
- **branchB** — Represents the branch being compared in the semantic merge `demo-semantic-merge.ts:43-43`
- **branchBUnit** — Represents the unit of branch B `demo-semantic-merge.ts:161-161`
- **branchBUnit** — Represents a code unit from branch B `demo-semantic-merge.ts:171-171`
- **branchBUnit** — Analyzes conflicts between base units and branch units `demo-semantic-merge.ts:258-258`
- **branchManager** — Manages branch operations and configurations `demo-semantic-merge.ts:46-46`
- **conflictDetectionTime** — Time taken to detect conflicts `demo-semantic-merge.ts:37-37`
- **conflictDetector** — Detects conflicts between branches `demo-semantic-merge.ts:52-52`
- **conflictResolver** — Resolves conflicts between branches `demo-semantic-merge.ts:50-50`
- **conflictsDetected** — Number of conflicts detected during the merge `demo-semantic-merge.ts:32-32`
- **embeddingGen** — Generates embeddings for code units `demo-semantic-merge.ts:48-48`
- **embeddingGenerationTime** — Time taken to generate embeddings `demo-semantic-merge.ts:35-35`
- **endTime** — End time of the merge process `demo-semantic-merge.ts:27-27`
- **fastPathMatches** — Number of files matched via fast path (hash comparison) `demo-semantic-merge.ts:29-29`
- **gitIntegration** — Handles Git operations and repository interactions `demo-semantic-merge.ts:47-47`
- **manualReviewRequired** — Number of conflicts requiring manual review `demo-semantic-merge.ts:34-34`
- **matched** — Indicates whether a branch is matched `demo-semantic-merge.ts:161-161`
- **matchingTime** — Time taken to match files `demo-semantic-merge.ts:36-36`
- **metrics** — Tracks performance metrics during the semantic merge process `demo-semantic-merge.ts:44-44`
- **projectPath** — Path to the project directory `demo-semantic-merge.ts:41-41`
- **semanticMatches** — Number of files matched via semantic analysis (embeddings) `demo-semantic-merge.ts:30-30`
- **similarity** — Represents a function to calculate similarity between code units `demo-semantic-merge.ts:212-212`
- **similarity** — Represents the similarity score between two CodeUnits in a match array `demo-semantic-merge.ts:221-221`
- **similarity** — Represents the similarity score in a best match object `demo-semantic-merge.ts:231-231`
- **startTime** — Start time of the merge process `demo-semantic-merge.ts:26-26`
- **totalFiles** — Total number of files processed during the merge `demo-semantic-merge.ts:28-28`
- **unitA** — Represents a code unit from branch A `demo-semantic-merge.ts:212-212`
- **unitA** — Represents a CodeUnit in a match array `demo-semantic-merge.ts:221-221`
- **unitB** — Represents a code unit from branch B `demo-semantic-merge.ts:212-212`
- **unitB** — Represents a CodeUnit in a match array `demo-semantic-merge.ts:221-221`
- **unitB** — Represents a CodeUnit in a best match object `demo-semantic-merge.ts:231-231`
- **unmatchedA** — Indicates whether branch A is unmatched `demo-semantic-merge.ts:162-162`
- **unmatchedB** — Indicates whether branch B is unmatched `demo-semantic-merge.ts:163-163`
- **unmatchedUnits** — Number of code units not matched by either fast or semantic paths `demo-semantic-merge.ts:31-31`

## Core Examples

### State Analysis

**docs/examples/chaos-analysis-example.ts** — Demonstrates chaos score computation for detecting hidden state management issues, identifying mutation points, and generating AI-driven refactoring recommendations for complex state patterns.

### Code Modification

**docs/examples/code-modification-example.ts** — Shows snapshot-based version management for safe mutations, entity-level code replacement (functions, classes), and file operations (copy, rename, split, synthesize) with automatic rollback capability.

### GPU-Accelerated Operations

**docs/examples/cuda-example.ts** — Demonstrates GPU vector operations on CUDA hardware: cosine similarity, normalization, Euclidean distance, and semantic search with 100–200× performance gains over CPU implementations.

### Semantic Merging

**docs/examples/demo-merge-simple.mjs** — Simplified semantic merge workflow: hash-based content matching, conflict detection, and deterministic merge strategy selection without AI intervention.

**docs/examples/demo-semantic-merge.ts** — Full-featured semantic merge combining embedding-based intent classification, intelligent conflict resolution, and AI-powered strategies for complex branch scenarios.

### Multi-Branch Indexing

**docs/examples/layered-indexing-example.ts** — Shows branch lifecycle management, cross-branch semantic search, delta computation, and caching optimization for efficient multi-branch analysis.

### Parser Integration

**docs/examples/parser-agent-demo.ts** — Demonstrates tree-sitter AST parsing: single-file and batch processing, syntax tree analysis, cache efficiency metrics, and performance profiling for large codebases.

### Placeholder Examples

**docs/examples/analysis-example.ts** — Expansion point for general code analysis demonstrations beyond state-specific use cases.

## Key Patterns

- **Snapshot-Rollback Pattern**: Code modification examples demonstrate safe mutation via version snapshots, enabling risk-free refactoring and instant rollback.
- **Pipeline Composition**: Semantic merge and parser examples chain analysis stages (classification → detection → resolution).
- **Performance Profiling**: All examples include timing and resource metrics for production tuning guidance.
- **AI-Driven Workflows**: Chaos and semantic merge examples leverage embeddings and intent classification for intelligent recommendations.

## Dependencies and Integration

Examples depend on:
- **Analysis module** (`src/analysis/`): ChaosAnalyzer for state mutation detection.
- **Modifier module** (`src/tools/`): Code modification and file operation tooling.
- **GPU module** (`src/gpu/`): CUDA-accelerated vector operations.
- **Merge engine** (`src/merge/`): Semantic and hash-based conflict resolution.
- **Parser framework** (`src/parsers/`): Tree-sitter AST processing and caching.
- **Storage layer** (`src/storage/`): Graph and index persistence for branch and semantic data.

Examples are designed to run independently on a real codebase or test fixtures, making them suitable for CI/CD validation, feature documentation, and developer onboarding.

## Execution

All examples execute via:

```bash
bun examples/<filename>.ts
```

Examples automatically output analysis results, performance metrics, and actionable recommendations to the console.
