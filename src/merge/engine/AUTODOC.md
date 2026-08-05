# Engine

## 🤖 Overview

The `merge/engine` module provides a comprehensive solution for resolving code conflicts during merges. It includes an AI-assisted conflict resolver that uses embeddings for intelligent conflict resolution, a conflict resolver for traditional methods, and a three-way merger for handling complex merge scenarios. This module is used by developers and version control systems to ensure accurate and efficient code merging.

## 🤖 Architecture

```
  +---------------------+
  |     AI Conflict     |
  |     Resolver        |
  +---------------------+
          |
          v
  +---------------------+
  |   Conflict Resolver |
  +---------------------+
          |
          v
  +---------------------+
  |   Three Way Merger  |
  +---------------------+
          |
          v
  +---------------------+
  |     Diff3 Merger    |
  +---------------------+
```

## 🤖 Flow

```
  +---------------------+
  |     AI Conflict     |
  |     Resolver        |
  +---------------------+
          |
          v
  +---------------------+
  |   Conflict Resolver |
  +---------------------+
          |
          v
  +---------------------+
  |   Three Way Merger  |
  +---------------------+
          |
          v
  +----------------
  |     Diff3     |
  +----------------+
          |
          v
  +---------------------+
  |     Merge Result    |
  +---------------------+
```

## 🤖 Entity Listing

### Function
- **addedIds** — Identifies added IDs in the merge `three-way-merger.ts:147-147`, `three-way-merger.ts:147-147`
- **classifyInsertion** — Classifies insertion regions based on the lengths and equality of the lines in the arrays `diff3.ts:389-403`
- **computeHunks** — Computes change hunks for a two-way diff `diff3.ts:204-252`
- **computeLCS** — Computes the longest common subsequence between two arrays using dynamic programming `diff3.ts:186-202`
- **conflict** — Represents a conflict detected during the merge `three-way-merger.ts:543-543`
- **conflictIds** — Stores IDs of detected conflicts `three-way-merger.ts:537-537`
- **conflictsToDetect** — List of conflicts to be detected during the merge `three-way-merger.ts:354-361`
- **diff3Merge** — Function to perform the three-way merge `diff3.ts:57-126`
- **dp** — Initializes a 2D array for dynamic programming to store the length of the longest common subsequence `diff3.ts:189-189`
- **emitInsertion** — Adds insertion regions to the result based on the provided maps and arrays `diff3.ts:367-383`
- **linesEqual** — Checks if two arrays of strings are equal by comparing each corresponding element `diff3.ts:405-411`
- **matchedBIds** — Stores IDs of units from branch B that match units in branch A `three-way-merger.ts:274-274`
- **mergeHunks** — Merges hunks into three-way regions `diff3.ts:264-365`
- **remainingUnmatchedA** — Identifies unmatched files in branchA `three-way-merger.ts:149-149`
- **remainingUnmatchedB** — Identifies unmatched files in branchB `three-way-merger.ts:150-150`
- **renamedIds** — Identifies renamed IDs in the merge `three-way-merger.ts:148-148`
- **renamedInA** — Identifies renamed files in branchA `three-way-merger.ts:113-113`
- **renamedInB** — Identifies renamed files in branchB `three-way-merger.ts:114-114`
- **renameMapA** — Map of renamed units in branch A `three-way-merger.ts:397-397`
- **renameMapB** — Maps renamed paths from branch B `three-way-merger.ts:398-398`
- **renameNewPathsA** — Stores new paths for renamed units in branch A `three-way-merger.ts:399-399`
- **renameNewPathsB** — Stores new paths for renamed units in branch B `three-way-merger.ts:400-400`
- **splitLines** — Function to split lines of a string `diff3.ts:132-135`
- **stats** — Tracks statistics during the merge process `three-way-merger.ts:198-198`, `three-way-merger.ts:199-199`
- **tempIndexB** — Temporarily indexes units from branch B `three-way-merger.ts:310-310`
- **trimCommon** — Function to trim common prefix and suffix for LCS performance `diff3.ts:141-180`

### Method
- **analyzeConflict** — Method to analyze a conflict using AI `ai-conflict-resolver.ts:69-103`
- **applyResolution** — Applies a resolution to a conflict `conflict-resolver.ts:388-404`
- **attemptIntelligentMerge** — Attempts to merge code units using intelligent methods `ai-conflict-resolver.ts:233-250`
- **attemptSimpleMerge** — Method to attempt a simple merge `conflict-resolver.ts:277-292`
- **autoResolve** — Method to automatically resolve conflicts `conflict-resolver.ts:115-139`
- **classifyIntents** — Classifies intents for units from branch A and branch B `three-way-merger.ts:332-345`
- **clearCache** — Clears the embedding cache `ai-conflict-resolver.ts:306-308`
- **computeHash** — Computes a hash for a given text `conflict-resolver.ts:409-411`
- **constructor** — Constructor for the AIConflictResolver class `ai-conflict-resolver.ts:59-61`
- **constructor** — Constructor for the ConflictResolver class `conflict-resolver.ts:39-49`
- **constructor** — Initializes the three-way merger with branch manager, Git integration, conductor, and configuration `three-way-merger.ts:58-85`
- **cosineDistance** — Calculates the cosine distance between two embeddings `ai-conflict-resolver.ts:279-282`
- **cosineSimilarity** — Calculates the cosine similarity between two embeddings `ai-conflict-resolver.ts:255-274`
- **createManualReviewResolution** — Generates a resolution for a conflict that requires manual review `conflict-resolver.ts:297-307`
- **createResolution** — Creates a resolution based on the analysis result `ai-conflict-resolver.ts:294-301`
- **detectAddedDeletedRenamed** — Detects added, deleted, and renamed units `three-way-merger.ts:369-475`
- **detectConflicts** — Detects conflicts between units from branch A and branch B `three-way-merger.ts:350-364`
- **detectDeleteModifyConflicts** — Detects conflicts between delete and modify operations `three-way-merger.ts:492-519`
- **determineStrategy** — Determines the resolution strategy based on semantic similarity and confidence `ai-conflict-resolver.ts:163-226`
- **fastPathMatch** — Matches files via fast path hashing `three-way-merger.ts:237-282`
- **findUnitByPath** — Finds a code unit by its path `three-way-merger.ts:480-487`
- **generateConflictMarkers** — Creates markers for conflicts in the code `conflict-resolver.ts:312-333`
- **generateMergeActions** — Generates merge actions based on detected conflicts `three-way-merger.ts:524-629`
- **getCacheKey** — Generates a cache key for embeddings `ai-conflict-resolver.ts:287-289`
- **getCacheStats** — Retrieves cache statistics `ai-conflict-resolver.ts:313-318`
- **getEmbedding** — Generates an embedding for a given code unit `ai-conflict-resolver.ts:108-134`
- **getPreview** — Provides a preview of the merged code for different resolution strategies `conflict-resolver.ts:356-379`
- **mergeBothChanges** — Method to merge both changes `conflict-resolver.ts:241-269`
- **performMerge** — Performs the three-way merge process `three-way-merger.ts:94-232`
- **prepareTextForEmbedding** — Prepares text for embedding by removing unnecessary characters `ai-conflict-resolver.ts:139-158`
- **resolveAPIBreakingChange** — Method to resolve API breaking changes `conflict-resolver.ts:217-220`
- **resolveConflict** — Method to resolve a conflict, using AI if enabled and available `conflict-resolver.ts:57-110`
- **resolveConflicts** — Resolves conflicts during the merge process `conflict-resolver.ts:338-347`
- **resolveIncompatibleIntents** — Method to resolve incompatible intents `conflict-resolver.ts:195-212`
- **resolveLogicConflict** — Method to resolve logic conflicts `conflict-resolver.ts:225-228`
- **resolveMovedAndModified** — Method to resolve moved and modified changes `conflict-resolver.ts:233-236`
- **resolveOverlappingChanges** — Method to resolve overlapping changes `conflict-resolver.ts:144-190`
- **semanticMatch** — Represents a semantic match between units from branch A and branch B `three-way-merger.ts:287-327`

### Class
- **AIConflictResolver** — Class for AI-assisted conflict resolution using embeddings `ai-conflict-resolver.ts:55-319`
- **ConflictResolver** — Class for resolving conflicts during merge `conflict-resolver.ts:35-412`
- **ThreeWayMerger** — Main three-way merger class that performs semantic merge in five phases `three-way-merger.ts:45-630`

### Interface
- **AIAnalysisResult** — Result of AI conflict analysis including similarity, distances, strategy, confidence, explanation, and merged code `ai-conflict-resolver.ts:34-53`
- **AIConflictResolverConfig** — AI-Assisted Conflict Resolver configuration with embedding and similarity thresholds `ai-conflict-resolver.ts:17-29`
- **ConflictResolverConfig** — Configuration for the ConflictResolver, including AI integration and resolution preferences `conflict-resolver.ts:24-33`
- **Diff3Options** — Configuration options for the three-way merge algorithm `diff3.ts:19-24`
- **Diff3Region** — Represents a region in the three-way merge result `diff3.ts:26-31`
- **Diff3Result** — Result of the three-way merge operation `diff3.ts:33-39`
- **Hunk** — A contiguous change hunk from a two-way diff `diff3.ts:46-51`
- **ThreeWayMergerConfig** — Configuration for the three-way merger, including settings for fast path matching, semantic matching, intent classification, and conflict detection `three-way-merger.ts:28-43`

### Import_decl
- **../../agents/conductor-orchestrator.js** — Imports `../../agents/conductor-orchestrator.js` from `../../agents/conductor-orchestrator.js`. `three-way-merger.ts:1-1`
- **../../core/branch-manager.js** — Imports `../../core/branch-manager.js` from `../../core/branch-manager.js`. `three-way-merger.ts:2-2`
- **../../logging/index.js** — Imports `../../logging/index.js` from `../../logging/index.js`. `ai-conflict-resolver.ts:1-1`, `conflict-resolver.ts:1-1`, `three-way-merger.ts:3-3`
- **../../semantic/embedding-generator.js** — Imports `../../semantic/embedding-generator.js` from `../../semantic/embedding-generator.js`. `ai-conflict-resolver.ts:2-2`
- **../../utils/fast-hash.js** — Imports `../../utils/fast-hash.js` from `../../utils/fast-hash.js`. `conflict-resolver.ts:2-2`
- **../analysis/conflict-detector.js** — Imports `../analysis/conflict-detector.js` from `../analysis/conflict-detector.js`. `three-way-merger.ts:4-4`
- **../analysis/intent-classifier.js** — Imports `../analysis/intent-classifier.js` from `../analysis/intent-classifier.js`. `three-way-merger.ts:5-5`
- **../indexing/lazy-embedding-cache.js** — Imports `../indexing/lazy-embedding-cache.js` from `../indexing/lazy-embedding-cache.js`. `three-way-merger.ts:6-6`
- **../indexing/multi-version-indexer.js** — Imports `../indexing/multi-version-indexer.js` from `../indexing/multi-version-indexer.js`. `three-way-merger.ts:7-7`
- **../integration/git-integration.js** — Imports `../integration/git-integration.js` from `../integration/git-integration.js`. `three-way-merger.ts:8-8`
- **../matching/fast-path-matcher.js** — Imports `../matching/fast-path-matcher.js` from `../matching/fast-path-matcher.js`. `three-way-merger.ts:9-9`
- **../matching/semantic-matcher.js** — Imports `../matching/semantic-matcher.js` from `../matching/semantic-matcher.js`. `three-way-merger.ts:10-10`
- **../models/change-intent.js** — Imports `../models/change-intent.js` from `../models/change-intent.js`. `three-way-merger.ts:11-11`
- **../models/code-unit.js** — Imports `../models/code-unit.js` from `../models/code-unit.js`. `ai-conflict-resolver.ts:3-3`, `conflict-resolver.ts:3-3`, `three-way-merger.ts:12-12`
- **../models/merge-result.js** — Imports `../models/merge-result.js` from `../models/merge-result.js`. `three-way-merger.ts:13-13`
- **../models/semantic-conflict.js** — Imports `../models/semantic-conflict.js` from `../models/semantic-conflict.js`. `ai-conflict-resolver.ts:4-4`, `three-way-merger.ts:14-14`
- **../models/semantic-conflict.js** — Imports `../models/semantic-conflict.js`. `conflict-resolver.ts:4-10`
- **../models/versioned-index.js** — Imports `../models/versioned-index.js` from `../models/versioned-index.js`. `three-way-merger.ts:15-15`
- **./ai-conflict-resolver.js** — Imports `./ai-conflict-resolver.js` from `./ai-conflict-resolver.js`. `conflict-resolver.ts:11-11`
- **./diff3.js** — Imports `./diff3.js` from `./diff3.js`. `ai-conflict-resolver.ts:5-5`, `conflict-resolver.ts:12-12`

### Property
- **addedInA** — Units added in branch A `three-way-merger.ts:378-378`
- **addedInB** — Units added in branch B `three-way-merger.ts:379-379`
- **aiEnabled** — Boolean indicating whether AI is enabled for conflict resolution `conflict-resolver.ts:26-26`
- **aiResolver** — AI resolver for semantic analysis, optional `conflict-resolver.ts:27-27`, `conflict-resolver.ts:37-37`
- **autoResolveConflicts** — Boolean indicating whether automatic conflict resolution is enabled `three-way-merger.ts:42-42`
- **baseEnd** — End index of the base lines in the hunk `diff3.ts:48-48`
- **baseLines** — Lines of the base branch `diff3.ts:28-28`
- **baseStart** — Start index of the base lines in the hunk `diff3.ts:47-47`
- **baseUnit** — Represents the base unit in the three-way merge `three-way-merger.ts:242-242`, `three-way-merger.ts:494-494`, `three-way-merger.ts:525-525`, `three-way-merger.ts:530-530`
- **baseUnit** — Represents the base unit for the three-way merge `three-way-merger.ts:247-247`, `three-way-merger.ts:291-291`, `three-way-merger.ts:302-302`, `three-way-merger.ts:333-333`, `three-way-merger.ts:351-351`
- **baseUnit** — Base unit of code used for comparison `three-way-merger.ts:381-381`, `three-way-merger.ts:390-390`
- **branch** — Represents a branch in the version control system `three-way-merger.ts:385-385`, `three-way-merger.ts:394-394`
- **branch** — Represents a branch in the three-way merge `three-way-merger.ts:534-534`
- **branchADistance** — Semantic distance from base to branchA `ai-conflict-resolver.ts:39-39`
- **branchAIntent** — Determines the intent of changes in branchA `three-way-merger.ts:162-162`
- **branchAIntent** — Represents the intent of a unit from branch A `three-way-merger.ts:334-334`, `three-way-merger.ts:335-335`
- **branchAIntent** — Determines the intent of changes in branch A `three-way-merger.ts:352-352`
- **branchALines** — Lines of branch A `diff3.ts:29-29`
- **branchAUnit** — Represents the branchA unit in the three-way merge `three-way-merger.ts:242-242`
- **branchAUnit** — Represents a unit from branch A `three-way-merger.ts:248-248`, `three-way-merger.ts:291-291`, `three-way-merger.ts:303-303`, `three-way-merger.ts:333-333`
- **branchAUnit** — Represents a unit of code from branch A `three-way-merger.ts:351-351`
- **branchAUnit** — Represents the unit in branch A `three-way-merger.ts:525-525`
- **branchBDistance** — Semantic distance from base to branchB `ai-conflict-resolver.ts:40-40`
- **branchBIntent** — Determines the intent of changes in branchB `three-way-merger.ts:162-162`
- **branchBIntent** — Represents the intent of a unit from branch B `three-way-merger.ts:334-334`, `three-way-merger.ts:335-335`
- **branchBIntent** — Determines the intent of changes in branch B `three-way-merger.ts:352-352`
- **branchBLines** — Lines of branch B `diff3.ts:30-30`
- **branchBUnit** — Represents a unit from branch B `three-way-merger.ts:242-242`, `three-way-merger.ts:249-249`, `three-way-merger.ts:291-291`, `three-way-merger.ts:304-304`, `three-way-merger.ts:333-333`
- **branchBUnit** — Represents a unit of code from branch B `three-way-merger.ts:351-351`
- **branchBUnit** — Represents the unit in branch B `three-way-merger.ts:525-525`
- **branchEnd** — End index of the branch A lines in the hunk `diff3.ts:50-50`
- **branchManager** — Manager for handling branches in the three-way merger `three-way-merger.ts:46-46`
- **branchStart** — Start index of the branch A lines in the hunk `diff3.ts:49-49`
- **classifyIntents** — Indicates whether to classify intents in the three-way merger `three-way-merger.ts:38-38`
- **conductor** — Orchestrates the conductor for the three-way merger `three-way-merger.ts:48-48`
- **confidence** — Confidence in the suggested strategy `ai-conflict-resolver.ts:46-46`
- **confidence** — Represents the confidence level in the resolution strategy `ai-conflict-resolver.ts:170-170`
- **config** — Configuration for the AI conflict resolver `ai-conflict-resolver.ts:56-56`
- **config** — Configuration object for the ConflictResolver `conflict-resolver.ts:36-36`
- **config** — Configures the three-way merger with settings for fast path, semantic matching, intent classification, and conflict detection `three-way-merger.ts:49-49`
- **conflictCount** — Number of conflicts in the merge `diff3.ts:36-36`
- **conflictDetector** — Detects and resolves conflicts during the merge `three-way-merger.ts:56-56`
- **deletedIn** — Units deleted in the merge `three-way-merger.ts:382-382`, `three-way-merger.ts:391-391`
- **deletedIn** — Indicates whether a unit was deleted in a branch `three-way-merger.ts:495-495`, `three-way-merger.ts:531-531`
- **deletedUnits** — Units deleted in the merge `three-way-merger.ts:380-384`
- **detectConflicts** — Determines if conflicts should be detected during the three-way merger `three-way-merger.ts:41-41`
- **embeddingCache** — Cache for embeddings to avoid redundant generation `ai-conflict-resolver.ts:57-57`
- **embeddingGenerator** — Embedding generator used for semantic similarity analysis `ai-conflict-resolver.ts:19-19`
- **embeddingGenerator** — Function for generating embeddings, optional `three-way-merger.ts:35-35`
- **explanation** — Explanation of the decision made by the AI `ai-conflict-resolver.ts:49-49`
- **explanation** — Provides an explanation of the resolution strategy `ai-conflict-resolver.ts:171-171`
- **fastPathEnabled** — Boolean indicating whether fast path matching is enabled `three-way-merger.ts:30-30`
- **fastPathMatcher** — Matches files via fast path hashing `three-way-merger.ts:53-53`
- **gitIntegration** — Represents the Git integration for the three-way merger `three-way-merger.ts:47-47`
- **hasConflicts** — Boolean indicating if there are conflicts in the merge `diff3.ts:35-35`
- **highSimilarityThreshold** — Threshold for high similarity between code changes `ai-conflict-resolver.ts:22-22`
- **intentClassifier** — Classifies the intent of changes `three-way-merger.ts:55-55`
- **labelA** — Label for branch A in the merge `diff3.ts:20-20`
- **labelB** — Label for branch B in the merge `diff3.ts:21-21`
- **labelBase** — Label for the base branch in the merge `diff3.ts:22-22`
- **lowSimilarityThreshold** — Threshold for low similarity between code changes `ai-conflict-resolver.ts:24-24`
- **matchedUnits** — Identifies matched units during the merge `three-way-merger.ts:242-242`
- **maxSize** — Sets the maximum size of the embedding cache `ai-conflict-resolver.ts:313-313`
- **mediumSimilarityThreshold** — Threshold for medium similarity between code changes `ai-conflict-resolver.ts:23-23`
- **mergedCode** — Merged code if AI was able to generate it `ai-conflict-resolver.ts:52-52`
- **mergedCode** — Stores the merged code if the AI was able to generate it `ai-conflict-resolver.ts:172-172`
- **mergedContent** — Merged content of the three-way merge `diff3.ts:38-38`
- **mergedLines** — Merged lines of the three-way merge `diff3.ts:37-37`
- **minConfidenceForAutoMerge** — Minimum confidence required for automatic merge `ai-conflict-resolver.ts:27-27`
- **minConfidenceForSuggestion** — Minimum confidence required for merge suggestion `ai-conflict-resolver.ts:28-28`
- **minConfidenceThreshold** — Minimum confidence threshold for AI resolution `conflict-resolver.ts:32-32`
- **modifiedIn** — Units modified in the merge `three-way-merger.ts:383-383`, `three-way-merger.ts:392-392`
- **modifiedIn** — Indicates whether a unit was modified in a branch `three-way-merger.ts:496-496`, `three-way-merger.ts:532-532`
- **multiVersionIndexer** — Indexes the base, branchA, and branchB versions for the three-way merger `three-way-merger.ts:52-52`
- **newPath** — New path of a unit after renaming `three-way-merger.ts:385-385`, `three-way-merger.ts:394-394`
- **newPath** — Stores the new path of a unit `three-way-merger.ts:534-534`
- **oldPath** — Old path of a unit before renaming `three-way-merger.ts:385-385`, `three-way-merger.ts:394-394`
- **oldPath** — Stores the old path of a unit `three-way-merger.ts:534-534`
- **preferBranchA** — Boolean indicating whether to prioritize branchA when conditions are equal `conflict-resolver.ts:30-30`
- **preferNewerCode** — Boolean indicating whether to prioritize newer code `conflict-resolver.ts:31-31`
- **prefix** — Common prefix of the base, branchA, and branchB lines `diff3.ts:146-146`
- **regions** — Array of regions in the three-way merge result `diff3.ts:34-34`
- **renamedUnits** — Units renamed in the merge `three-way-merger.ts:385-385`
- **semanticMatcher** — Matches files via semantic similarity `three-way-merger.ts:54-54`
- **semanticMatchingEnabled** — Boolean indicating whether semantic matching is enabled `three-way-merger.ts:33-33`
- **semanticThreshold** — Threshold for semantic matching, defaulting to 0.7 `three-way-merger.ts:34-34`
- **showBase** — Whether to include the base section in conflict markers `diff3.ts:23-23`
- **similarity** — Semantic similarity between branchA and branchB `ai-conflict-resolver.ts:36-36`
- **size** — Returns the size of the embedding cache `ai-conflict-resolver.ts:313-313`
- **strategy** — Represents the resolution strategy for a conflict `ai-conflict-resolver.ts:169-169`
- **suffix** — A contiguous change hunk from a two-way diff `diff3.ts:147-147`
- **suggestedStrategy** — Predicted resolution strategy for the conflict `ai-conflict-resolver.ts:43-43`
- **trimmedA** — A contiguous change hunk from a two-way diff `diff3.ts:149-149`
- **trimmedB** — A contiguous change hunk from a two-way diff `diff3.ts:150-150`
- **trimmedBase** — A contiguous change hunk from a two-way diff `diff3.ts:148-148`
- **type** — Type of the region (unchanged, branchA, branchB, or conflict) `diff3.ts:27-27`
- **unit** — Represents a unit of code `three-way-merger.ts:385-385`, `three-way-merger.ts:394-394`
- **unit** — Represents a code unit `three-way-merger.ts:534-534`
- **unmatchedA** — Stores units from branch A that do not match any units in branch B `three-way-merger.ts:243-243`
- **unmatchedB** — Stores units from branch B that do not match any units in branch A `three-way-merger.ts:244-244`

## Data Flow

- **Inputs**: Two branch names (branchA, branchB), BranchManager, GitIntegration, and optional ConductorOrchestrator.
- **Processing**: Indexes three branches in parallel, matches code units via hash and embedding similarity, classifies change intents, detects conflicts, and generates merge actions.
- **Outputs**: MergeResult containing matched units, conflicts, merge actions, added/deleted/renamed units, and statistics.

## Public API

| Export | Type | Description | Location |
|--------|------|-------------|----------|
| `ThreeWayMerger` | class | Main 5-phase semantic merge engine | [`three-way-merger.ts:45-618`](./three-way-merger.ts) |
| `ThreeWayMergerConfig` | interface | Configuration for merge phases and thresholds | [`three-way-merger.ts:28-43`](./three-way-merger.ts) |
| `ConflictResolver` | class | Resolves conflicts using heuristics and optional AI | [`conflict-resolver.ts:34-419`](./conflict-resolver.ts) |
| `ConflictResolverConfig` | interface | Configuration for resolution preferences and AI | [`conflict-resolver.ts:23-32`](./conflict-resolver.ts) |
| `AIConflictResolver` | class | Embedding-based conflict analysis and resolution | [`ai-conflict-resolver.ts:54-334`](./ai-conflict-resolver.ts) |
| `AIConflictResolverConfig` | interface | Similarity thresholds and confidence settings | [`ai-conflict-resolver.ts:16-28`](./ai-conflict-resolver.ts) |
| `AIAnalysisResult` | interface | Result of AI conflict analysis | [`ai-conflict-resolver.ts:33-52`](./ai-conflict-resolver.ts) |
| `MultiVersionIndexer` | class | Re-exported from indexing module for convenience | [`index.ts:1-1`](./index.ts) |
| `Diff3Options` | interface | Configuration options for the diff3 merge algorithm | [`diff3.ts:21-21`](./diff3.ts) |
| `Diff3Region` | interface | Represents a contiguous region of changes in the three-way diff | [`diff3.ts:26-31`](./diff3.ts) |
| `Diff3Result` | interface | Result of a diff3 merge operation containing regions and conflict information | [`diff3.ts:33-39`](./diff3.ts) |
| `Hunk` | interface | A contiguous block of matching or differing lines in a diff | [`diff3.ts:46-51`](./diff3.ts) |
| `diff3Merge` | function | Performs a three-way merge using the diff3 algorithm | [`diff3.ts:57-126`](./diff3.ts) |
| `splitLines` | function | Splits text into individual lines for processing | [`diff3.ts:125-174`](./diff3.ts) |
| `trimCommon` | function | Removes common prefix and suffix lines from three versions | [`diff3.ts:141-180`](./diff3.ts) |
| `computeLCS` | function | Computes the longest common subsequence between two line arrays | [`diff3.ts:186-202`](./diff3.ts) |
| `computeHunks` | function | Identifies contiguous blocks of changes in a diff | [`diff3.ts:204-252`](./diff3.ts) |
| `mergeHunks` | function | Merges hunks from two branches and detects conflicts | [`diff3.ts:264-365`](./diff3.ts) |
| `emitInsertion` | function | Writes insertion changes to the merge output | [`diff3.ts:367-383`](./diff3.ts) |
| `classifyInsertion` | function | Determines the conflict classification of an insertion | [`diff3.ts:389-403`](./diff3.ts) |
| `linesEqual` | function | Compares two lines for equality | [`diff3.ts:405-411`](./diff3.ts) |

## Dependencies

### Internal Modules

| Module | Purpose |
|--------|---------|
| `merge/analysis` | ConflictDetector and IntentClassifier |
| `merge/indexing` | MultiVersionIndexer, LazyEmbeddingCache |
| `merge/matching` | FastPathMatcher, SemanticMatcher |
| `merge/models` | CodeUnit, MergeResult, SemanticConflict, ChangeIntent types |
| `merge/integration` | GitIntegration for file change detection |
| `core/branch-manager` | Branch database management |
| `logging` | Structured logging |
| `utils/fast-hash` | Content hash computation |
| `semantic/embedding-generator` | Embedding generation for AI resolver |

### External Packages

| Package | Purpose |
|---------|---------|
| (none) | No external dependencies |

## Behavioral Properties

| Property | Value |
|----------|-------|
| Default semantic threshold | 0.7 minimum combined score for semantic matching |
| AI confidence threshold | 0.5 minimum for accepting AI resolution |
| Auto-resolve default | Disabled (requires explicit opt-in via config) |

## Error Handling

ThreeWayMerger catches errors during merge and ensures git branch restoration via cleanup. ConflictResolver falls back to manual review when AI resolution fails or confidence is below threshold. AIConflictResolver logs warnings on embedding failures and returns null embeddings gracefully.

## Known Limitations

- Simple merge algorithm (attemptSimpleMerge) is a placeholder; no proper diff3 implementation yet.
- AI-assisted merge uses heuristic code length comparison rather than AST-based merge.
- Delete-modify conflicts use base unit as placeholder for both branch units.

## Exports

- `MultiVersionIndexer`
- `AIConflictResolver`
- `ConflictResolver`
- `diff3Merge`
- `ThreeWayMerger`

## Files

| File | Description |
|------|-------------|
| `ai-conflict-resolver.ts` | AI-powered conflict resolution using embedding similarity and cosine distance |
| `conflict-resolver.ts` | Strategy-based conflict resolution with AI fallback and Git-style conflict markers |
| `diff3.ts` | Three-way merge algorithm with diff computation, hunk merging, and conflict detection |
| `index.ts` | Re-exports all engine classes and interfaces |
| `three-way-merger.ts` | Main 5-phase merge orchestrator handling indexing, matching, classification, and conflict detection |
