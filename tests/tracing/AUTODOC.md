# Module: tests/tracing

## 🤖 Overview

The `tracing-module.test.ts` file contains tests for the Semantic Tracing Module, focusing on core tracing functionalities such as path finding, state change detection, decision point analysis, and data flow tracing. These tests are used by developers to ensure the correctness and reliability of the tracing module's components.

## 🤖 Architecture

```
  +---------------------+
  |  PathBuilder       |
  +---------------------+
  |  StateTracker      |
  +---------------------+
  |  ConditionAnalyzer |
  +---------------------+
  |  DataFlowAnalyzer  |
  +---------------------+
  |  OutputFormatter   |
  +---------------------+
```

## 🤖 Flow

```
  +---------------------+
  |  PathBuilder       |
  +---------------------+
  |  StateTracker      |
  +---------------------+
  |  ConditionAnalyzer |
  +---------------------+
  |  DataFlowAnalyzer  |
  +---------------------+
  |  OutputFormatter   |
  +---------------------+
```

## 🤖 Entity Listing

### Function
- **createMockStorage** — Creates a mock storage for testing semantic tracing module functionalities `tracing-module.test.ts:25-61`
- **e** — Represents an entity in the test data `tracing-module.test.ts:41-41`
- **types** — Maps decision points to their types `tracing-module.test.ts:291-291`

### Import_decl
- **../../src/tracing/condition-analyzer.js** — Imports `../../src/tracing/condition-analyzer.js` from `../../src/tracing/condition-analyzer.js`. `tracing-module.test.ts:13-13`
- **../../src/tracing/data-flow-analyzer.js** — Imports `../../src/tracing/data-flow-analyzer.js` from `../../src/tracing/data-flow-analyzer.js`. `tracing-module.test.ts:14-14`
- **../../src/tracing/output-formatter.js** — Imports `../../src/tracing/output-formatter.js` from `../../src/tracing/output-formatter.js`. `tracing-module.test.ts:15-15`
- **../../src/tracing/path-builder.js** — Imports `../../src/tracing/path-builder.js` from `../../src/tracing/path-builder.js`. `tracing-module.test.ts:16-16`
- **../../src/tracing/state-tracker.js** — Imports `../../src/tracing/state-tracker.js` from `../../src/tracing/state-tracker.js`. `tracing-module.test.ts:17-17`
- **../../src/types/storage.js** — Imports `../../src/types/storage.js` from `../../src/types/storage.js`. `tracing-module.test.ts:18-18`, `tracing-module.test.ts:19-19`
- **bun:test** — Imports `bun:test` from `bun:test`. `tracing-module.test.ts:12-12`

### Property
- **namePattern** — A pattern used for searching entities by name in the mock storage `tracing-module.test.ts:29-29`

## Test Structure

Tests are organized by tracing component, each validating core behavior:

- **Graph Navigation Tests** (`tracing-module.test.ts:137-204`) — PathBuilder graph traversal, caller/callee resolution, and node attribute inference
- **State Tracking Tests** (`tracing-module.test.ts:210-255`) — StateTracker change detection and state impact analysis
- **Condition Analysis Tests** (`tracing-module.test.ts:261-324`) — ConditionAnalyzer decision point detection, dependency paths, and impact summarization
- **Data Flow Analysis Tests** (`tracing-module.test.ts:330-370`) — DataFlowAnalyzer variable flow, mutation tracking, and effect analysis
- **Output Formatting Tests** (`tracing-module.test.ts:376-598`) — OutputFormatter text and Mermaid diagram generation for all analysis types

## Test Helpers & Setup

- **createMockStorage** `tracing-module.test.ts:25-61` — Factory function creating a mock GraphStorage with stub implementations for entity lookup, relationship queries, and metadata retrieval
- **testEntities** `tracing-module.test.ts:67-125` — Predefined entity dataset covering function, variable, condition, and state entities for consistent test scenarios
- **testRelationships** `tracing-module.test.ts:127-131` — Call, read, write, and control-flow relationships linking test entities

## Core Component Tests

### PathBuilder Tests
- **graph (variable)** `tracing-module.test.ts:147-147` — Graph object extracted from storage for traversal operations
- **callers (function)** `tracing-module.test.ts:156-161` — Resolves entities calling a given target function
- **callees (function)** `tracing-module.test.ts:163-168` — Resolves entities called by a given function
- **entity (variable)** `tracing-module.test.ts:171-171` — Entity retrieved from graph for attribute inference
- **node (variable)** `tracing-module.test.ts:177-191` — Node object containing entity metadata and inferred attributes (complexity, async status, documentation availability)

### StateTracker Tests
- **stateTracker (variable)** `tracing-module.test.ts:212-212` — StateTracker instance analyzing entity state changes
- **entity (variable)** `tracing-module.test.ts:220-220` — Entity queried for state changes
- **changes (variable)** `tracing-module.test.ts:221-221` — Array of state mutations detected on the entity
- **entity (variable)** `tracing-module.test.ts:228-228` — Entity queried for read operations
- **reads (variable)** `tracing-module.test.ts:229-229` — Set of entities read by the queried entity
- **result (variable)** `tracing-module.test.ts:235-241` — Dependency object mapping affected entities and change types
- **deps (variable)** `tracing-module.test.ts:250-250` — Array of entities with cascading state impacts
- **d (variable)** `tracing-module.test.ts:253-253` — Individual dependent entity in cascade analysis

### ConditionAnalyzer Tests
- **analyzer (variable)** `tracing-module.test.ts:263-263` — ConditionAnalyzer instance detecting decision points
- **result (variable)** `tracing-module.test.ts:271-276` — Decision point array with branch conditions
- **result (variable)** `tracing-module.test.ts:283-288` — Dependency paths influencing decision outcomes
- **dp (variable)** `tracing-module.test.ts:291-291` — Individual dependency path in decision analysis
- **t (variable)** `tracing-module.test.ts:292-292` — Type of relationship in dependency path
- **result (variable)** `tracing-module.test.ts:296-301` — Impact summary of decision point effects
- **paths (variable)** `tracing-module.test.ts:308-316` — Array of possible execution paths through decision points
- **summary (variable)** `tracing-module.test.ts:318-318` — Summary statistics for decision impact analysis

### DataFlowAnalyzer Tests
- **analyzer (variable)** `tracing-module.test.ts:332-332` — DataFlowAnalyzer instance tracing variable flow
- **result (variable)** `tracing-module.test.ts:340-344` — Variables read by the analyzed entity
- **result (variable)** `tracing-module.test.ts:352-355` — Variables written (mutated) by the analyzed entity
- **result (variable)** `tracing-module.test.ts:362-365` — Entities affected by the analyzed entity's data flow

### OutputFormatter Tests
- **formatter (variable)** `tracing-module.test.ts:377-377` — OutputFormatter instance generating formatted output
- **result (variable)** `tracing-module.test.ts:384-401` — Text representation of graph analysis
- **text (variable)** `tracing-module.test.ts:403-403` — Formatted text output for graph display
- **result (variable)** `tracing-module.test.ts:412-428` — Mermaid diagram for call graph visualization
- **mermaid (variable)** `tracing-module.test.ts:430-430` — Mermaid diagram syntax output
- **result (variable)** `tracing-module.test.ts:437-461` — Text representation of state change analysis
- **text (variable)** `tracing-module.test.ts:463-463` — Formatted state change output
- **result (variable)** `tracing-module.test.ts:472-504` — Mermaid diagram for state impact visualization
- **text (variable)** `tracing-module.test.ts:506-506` — Mermaid diagram output for state tracking
- **result (variable)** `tracing-module.test.ts:515-544` — Text representation of condition analysis
- **text (variable)** `tracing-module.test.ts:546-546` — Formatted condition analysis output
- **result (variable)** `tracing-module.test.ts:556-588` — Mermaid diagram for decision point flow
- **text (variable)** `tracing-module.test.ts:590-590` — Mermaid diagram output for conditions

## Mock Storage Implementation Details

The mock storage factory implements `GraphStorage` interface with:
- **entities (function)** `tracing-module.test.ts:28-28` — Returns predefined test entity list
- **namePattern (function)** `tracing-module.test.ts:29-32` — Performs regex matching against entity names for filtered queries
- **entityId (function)** `tracing-module.test.ts:33-37` — Resolves entity IDs by name pattern matching
- **ids (function)** `tracing-module.test.ts:38-45` — Bulk resolves entity IDs from name patterns using Map for efficiency
- **_name (function)** `tracing-module.test.ts:46-48` — Stub implementation (returns undefined)
- **_opts (function)** `tracing-module.test.ts:49-51` — Stub implementation (returns undefined)

## Internal Test Functions

- **id (function)** `tracing-module.test.ts:27-27` — Maps entity to its identifier
- **e (function)** `tracing-module.test.ts:27-27` — Extracts entity from relationship tuple
