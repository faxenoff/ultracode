# Analysis

## 🤖 Overview

The `merge/analysis` module detects conflicts during code merges by analyzing changes from both branches. It is used by developers to identify and resolve conflicts before merging. The module includes a `ConflictDetector` class that determines conflict types and severities based on code unit changes.

## 🤖 Architecture

```
  +-------------------+
  | ConflictDetector |
  +-------------------+
    |
    v
  +-------------------+
  | detectConflict() |
  +-------------------+
    |
    v
  +-------------------+
  | detectAPIConflict() |
  +-------------------+
    |
    v
  +-------------------+
  | detectIntentConflict() |
  +-------------------+
```

## 🤖 Flow

```
  +-------------------+
  | detectConflict() |
  +-------------------+
    |
    v
  +-------------------+
  | detectAPIConflict() |
  +-------------------+
    |
    v
  +-------------------+
  | detectIntentConflict() |
  +-------------------+
    |
    v
  +-------------------+
  | return SemanticConflict |
  +-------------------+
```

## 🤖 Entity Listing

### Method
- **areIntentsCompatible** — Checks if two change intents are compatible based on a predefined matrix `conflict-detector.ts:127-146`
- **classifyIntent** — Determines the change intent for a given base and changed unit `intent-classifier.ts:31-83`
- **classifyNewUnit** — Classifies the intent for a new unit without a base unit `intent-classifier.ts:88-113`
- **classifySeverity** — Classifies the severity of a conflict based on the extent of changes in the code units `conflict-detector.ts:151-173`
- **collectAPIChangeEvidence** — Collects evidence for an API change intent `intent-classifier.ts:222-244`
- **collectBugFixEvidence** — Collects evidence for a bug fix intent `intent-classifier.ts:118-159`
- **collectFeatureAdditionEvidence** — Collects evidence for a feature addition intent `intent-classifier.ts:192-217`
- **collectRefactoringEvidence** — Collects evidence for a refactoring intent `intent-classifier.ts:164-187`
- **computeDifference** — Computes the difference between two code units based on their content lengths `conflict-detector.ts:178-187`
- **detectAPIConflict** — Detects API breaking changes between two code units `conflict-detector.ts:77-102`
- **detectConflict** — Determines whether there is a conflict between two changes and returns a semantic conflict if found `conflict-detector.ts:30-72`
- **detectConflicts** — Detects conflicts in a list of code unit matches and returns an array of semantic conflicts `conflict-detector.ts:224-250`
- **detectIntentConflict** — Detects incompatible intents between two code units `conflict-detector.ts:107-122`
- **isAutoResolvable** — Determines if a conflict can be auto-resolved based on its severity and the compatibility of the change intents `conflict-detector.ts:192-219`

### Class
- **ConflictDetector** — Detects conflicts during merge by analyzing changes in code units `conflict-detector.ts:19-251`
- **IntentClassifier** — Classifies change intents based on evidence collected from code units `intent-classifier.ts:23-245`

### Import_decl
- **../models/change-intent.js** — Imports `../models/change-intent.js` from `../models/change-intent.js`. `conflict-detector.ts:1-1`
- **../models/change-intent.js** — Imports `../models/change-intent.js`. `intent-classifier.ts:1-11`
- **../models/code-unit.js** — Imports `../models/code-unit.js` from `../models/code-unit.js`. `conflict-detector.ts:2-2`, `intent-classifier.ts:12-12`
- **../models/semantic-conflict.js** — Imports `../models/semantic-conflict.js`. `conflict-detector.ts:3-10`

### Property
- **baseUnit** — Represents the base code unit in the merge process `conflict-detector.ts:226-226`
- **branchAIntent** — Represents the change intent in branchA `conflict-detector.ts:229-229`
- **branchAUnit** — Represents the code unit in branchA `conflict-detector.ts:227-227`
- **branchBIntent** — Represents the change intent in branchB `conflict-detector.ts:230-230`
- **branchBUnit** — Represents the code unit in branchB `conflict-detector.ts:228-228`

## Data Flow

- **Inputs**: Base, branchA, and branchB CodeUnit objects with optional ChangeIntent metadata.
- **Processing**: ConflictDetector compares content hashes, signatures, and FQNs across branches; IntentClassifier collects evidence from code patterns to determine change type.
- **Outputs**: SemanticConflict objects with severity and auto-resolve flags; ChangeIntent objects with type, confidence, and evidence arrays.

## Public API

| Export | Type | Description | Location |
|--------|------|-------------|----------|
| `ConflictDetector` | class | Detects conflicts between branch code units with severity classification | [`conflict-detector.ts:19-251`](./conflict-detector.ts) |
| `IntentClassifier` | class | Classifies change intents using heuristic evidence collection | [`intent-classifier.ts:23-245`](./intent-classifier.ts) |

## Dependencies

### Internal Modules

| Module | Purpose |
|--------|---------|
| `merge/models` | CodeUnit, SemanticConflict, ChangeIntent, and related types |

### External Packages

| Package | Purpose |
|---------|---------|
| (none) | No external dependencies |

## Behavioral Properties

| Property | Value |
|----------|-------|
| Intent compatibility | Uses a compatibility matrix (BugFix+Refactoring compatible, APIChange incompatible with all) |
| Severity classification | Based on normalized length difference ratio between base and branch content |
| Auto-resolve threshold | Only Low severity with compatible intents qualifies for auto-resolution |

## Error Handling

The module does not throw exceptions. If evidence is insufficient for classification, IntentClassifier returns an Unknown intent with zero confidence. ConflictDetector returns null when no conflict is detected.

## Known Limitations

- Difference computation uses simplified length-based metric rather than true Levenshtein or diff-based analysis.
- Intent classification relies on regex heuristics and may misclassify complex refactorings.
- No cross-file conflict detection (operates on individual CodeUnit pairs only).

## Exports

- `ConflictDetector`
- `IntentClassifier`

## Files

| File | Description |
|------|-------------|
| `conflict-detector.ts` | Detects overlapping, API-breaking, and intent-incompatible conflicts between branch code units |
| `index.ts` | Re-exports ConflictDetector and IntentClassifier |
| `intent-classifier.ts` | Classifies changes as BugFix, Refactoring, FeatureAddition, or APIChange using pattern evidence |
