# Module: src/hypothesis

## 🤖 Overview

The `hypothesis` module provides a 4-tier runtime relationship inference system for code that static AST analysis cannot connect. It includes a bridge module for handling path finding with stored hypotheses, catalogs for managing hypothesis entries, and an engine for generating and managing hypotheses. This module is used by developers to infer relationships between code elements that are not directly connected by static analysis.

## 🤖 Architecture

```
  +---------------------+
  |     Hypothesis     |
  |     Inference      |
  |     Module         |
  |     (Public API)   |
  +---------------------+
          | 
          v
  +---------------------+
  |     Hypothesis      |
  |     Store           |
  |     (HypothesisRef) |
  +---------------------+
          |
          v
  +---------------------+
  |     Hypothesis      |
  |     Engine          |
  |     (GenerateResult)|
  +---------------------+
          |
          v
  +---------------------+
  |     Hypothesis      |
  |     Catalogs        |
  |     (CALLBACK_ENTRIES)|
  +---------------------+
          |
          v
  +---------------------+
  |     Hypothesis      |
  |     Bridge          |
  |     (BridgePath)    |
  +---------------------+
```

## 🤖 Flow

```
  +---------------------+
  |     Hypothesis      |
  |     Inference      |
  |     Module         |
  |     (Public API)   |
  +---------------------+
          |
          v
  +---------------------+
  |     Hypothesis      |
  |     Store           |
  |     (HypothesisRef) |
  +---------------------+
          |
          v
  +---------------------+
  |     Hypothesis      |
  |     Engine          |
  |     (GenerateResult)|
  +---------------------+
          |
          v
  +---------------------+
  |     Hypothesis      |
  |     Catalogs        |
  |     (CALLBACK_ENTRIES)|
  +---------------------+
          |
          v
  +---------------------+
  |     Hypothesis      |
  |     Bridge          |
  |     (BridgePath)    |
  +---------------------+
```

## 🤖 Entity Listing

### Function
- **clearHypotheses** — Delete all hypotheses for a project/branch (before re-generation) `hypothesis-ops.ts:16-21`
- **countHypotheses** — Not applicable in this context `hypothesis-ops.ts:107-113`
- **findCallbackEntry** — A function to find a callback entry `catalogs.ts:334-336`
- **findDispatchPair** — A function to find a dispatch pair `catalogs.ts:329-331`
- **findPathWithHypotheses** — Finds paths between entities using hypothesis bridges `bridge.ts:45-144`
- **findRegisterPair** — A function to find a register pair `catalogs.ts:324-326`
- **generateHypotheses** — Generates hypotheses by running Tiers 1–3 strategies and persists results to cache.db `engine.ts:39-86`
- **getHypothesisStore** — Retrieves or initializes a global hypothesis store instance `engine.ts:104-109`
- **loadAll** — Load all hypotheses from cache.db into memory store `hypothesis-ops.ts:70-104`
- **loadCachedHypotheses** — Loads all cached hypotheses using a client and store, returning the number of hypotheses loaded `engine.ts:92-99`
- **matchesLanguage** — A function to check if the callback entry matches a language `catalogs.ts:317-321`
- **persistBatch** — Persist hypotheses to cache.db in batch `hypothesis-ops.ts:24-67`
- **stitchPath** — Asynchronously constructs a path between two entities using forward and backward visited maps, incorporating a hypothesis bridge step `bridge.ts:150-202`
- **values** — Not applicable in this context `hypothesis-ops.ts:37-37`

### Method
- **add** — Adds a hypothesis to the store, deduplicating by pair and keeping the highest confidence `types.ts:62-77`
- **clear** — Clears all stored hypotheses and their associated data `types.ts:102-107`
- **confidenceBar** — Returns a confidence bar representation based on the hypothesis confidence `types.ts:125-128`
- **confidenceMarker** — Returns a confidence marker based on the hypothesis confidence `types.ts:120-122`
- **count** — Returns the number of hypotheses stored `types.ts:94-96`
- **getAll** — Returns all stored hypotheses `types.ts:98-100`
- **getBridge** — Retrieves the best hypothesis bridging from → to `types.ts:80-82`
- **getFromSource** — Returns an array of hypotheses by their source ID `types.ts:85-87`
- **getToTarget** — Returns an array of hypotheses by their target ID `types.ts:90-92`
- **toRef** — Converts a hypothesis to a reference object with confidence marker and evidence `types.ts:110-117`

### Class
- **HypothesisStore** — A class for storing and managing hypotheses in an in-memory 3-index lookup `types.ts:51-129`

### Interface
- **BridgePath** — Represents a path between entities with steps and total confidence `bridge.ts:25-28`
- **BridgeStep** — A single step in a path, containing entity details and a hypothesis `bridge.ts:30-35`
- **CallbackEntry** — Represents a callback entry for hypothesis inference `catalogs.ts:23-29`
- **GenerateResult** — Represents the result of hypothesis generation with counts and duration `engine.ts:23-29`
- **Hypothesis** — An interface representing inferred runtime relationships with properties like id, fromId, toId, hypothesisType, confidence, relType, evidence, and strategy `types.ts:26-35`
- **HypothesisRef** — A lightweight reference for a hypothesis, containing confidence, marker, evidence, and type `types.ts:38-43`
- **RegisterDispatchPair** — Represents a pair of register and dispatch functions for hypothesis inference `catalogs.ts:12-21`

### Enum_decl
- **HypothesisType** — Represents inferred runtime relationships such as string key matches, callback arguments, interface narrowing, proximity bridges, and framework conventions `types.ts:14-20`

### Constant
- **CallbackArgument** — A type of hypothesis representing inferred runtime relationships `types.ts:16-16`
- **FrameworkConvention** — A type of hypothesis representing inferred runtime relationships `types.ts:19-19`
- **InterfaceNarrowing** — A type of hypothesis representing inferred runtime relationships `types.ts:17-17`
- **ProximityBridge** — A type of hypothesis representing inferred runtime relationships `types.ts:18-18`
- **StringKeyMatch** — A type of hypothesis representing inferred runtime relationships `types.ts:15-15`

### Import_decl
- **../logging/index.js** — Imports `../logging/index.js` from `../logging/index.js`. `engine.ts:10-10`, `hypothesis-ops.ts:7-7`
- **../storage/libsql/types.js** — Imports `../storage/libsql/types.js` from `../storage/libsql/types.js`. `engine.ts:11-11`, `hypothesis-ops.ts:8-8`
- **../types/storage.js** — Imports `../types/storage.js` from `../types/storage.js`. `bridge.ts:17-17`, `engine.ts:12-12`
- **./hypothesis-ops.js** — Imports `./hypothesis-ops.js` from `./hypothesis-ops.js`. `engine.ts:13-13`
- **./strategies/callback-arg.js** — Imports `./strategies/callback-arg.js` from `./strategies/callback-arg.js`. `engine.ts:14-14`
- **./strategies/interface-narrow.js** — Imports `./strategies/interface-narrow.js` from `./strategies/interface-narrow.js`. `engine.ts:15-15`
- **./strategies/proximity-bridge.js** — Imports `./strategies/proximity-bridge.js` from `./strategies/proximity-bridge.js`. `bridge.ts:18-18`
- **./strategies/string-key.js** — Imports `./strategies/string-key.js` from `./strategies/string-key.js`. `engine.ts:16-16`
- **./types.js** — Imports `./types.js` from `./types.js`. `bridge.ts:19-19`, `engine.ts:17-17`, `hypothesis-ops.ts:9-9`

### Property
- **all** — A flat list of all hypotheses for iteration `types.ts:59-59`
- **argPos** — The position of the argument in the function `catalogs.ts:25-25`
- **byPair** — A map storing the best hypothesis for each pair of source and target entity IDs `types.ts:57-57`
- **bySource** — A map storing outgoing hypotheses by source entity ID `types.ts:53-53`
- **byTarget** — A map storing incoming hypotheses by target entity ID `types.ts:55-55`
- **confidence** — The confidence score of a hypothesis `bridge.ts:157-157`
- **confidence** — The confidence level of the register/dispatch pair `catalogs.ts:17-17`
- **confidence** — Represents the confidence level of a catalog entry `catalogs.ts:26-26`
- **confidence** — A confidence score for a hypothesis, ranging from 0.0 to 1.0 `types.ts:31-31`
- **confidence** — Represents the confidence level as a number `types.ts:39-39`
- **decoratorOnNextFn** — A boolean indicating whether the next function is decorated `catalogs.ts:20-20`
- **dispatch** — The name of the dispatch function `catalogs.ts:14-14`
- **durationMs** — Duration in milliseconds taken to generate hypotheses `engine.ts:28-28`
- **edgeType** — The type of edge connecting two entities `bridge.ts:33-33`
- **entityId** — The unique identifier of an entity `bridge.ts:31-31`
- **entityName** — The name of an entity `bridge.ts:32-32`
- **evidence** — Represents a hypothesis with its confidence and evidence `bridge.ts:157-157`
- **evidence** — The evidence supporting a hypothesis `types.ts:33-33`
- **evidence** — Stores the evidence as a string `types.ts:41-41`
- **fnName** — The name of the function `catalogs.ts:24-24`
- **fromId** — The identifier of the source entity `bridge.ts:157-157`
- **fromId** — The identifier of the source entity in a hypothesis `types.ts:28-28`
- **handlerArgPos** — The position of the handler argument in the dispatch function `catalogs.ts:16-16`
- **hypothesis** — A reference to a stored hypothesis `bridge.ts:34-34`
- **hypothesisType** — The type of hypothesis `bridge.ts:157-157`
- **hypothesisType** — The type of hypothesis, which is an enum value `types.ts:30-30`
- **id** — A unique identifier for a hypothesis `types.ts:27-27`
- **keyArgPos** — The position of the key argument in the register function `catalogs.ts:15-15`
- **languages** — The languages supported by the register/dispatch pair `catalogs.ts:19-19`
- **languages** — An array of languages supported by a catalog entry, with an empty array indicating all languages `catalogs.ts:28-28`
- **languages** — A function that checks if a catalog entry matches a given language `catalogs.ts:317-317`
- **marker** — A marker indicating the confidence level of a hypothesis reference `types.ts:40-40`
- **register** — The name of the register function `catalogs.ts:13-13`
- **relType** — The type of relationship between entities `bridge.ts:157-157`
- **relType** — The relationship type between the register and dispatch functions `catalogs.ts:18-18`
- **relType** — Specifies the relationship type of a catalog entry `catalogs.ts:27-27`
- **relType** — The type of relationship represented by a hypothesis `types.ts:32-32`
- **steps** — An array of steps in a path `bridge.ts:26-26`
- **strategy** — The strategy used to infer a hypothesis `types.ts:34-34`
- **tier1** — Count of hypotheses generated by Tier 1 strategy `engine.ts:25-25`
- **tier2** — Count of hypotheses generated by Tier 2 strategy `engine.ts:26-26`
- **tier3** — Count of hypotheses generated by Tier 3 strategy `engine.ts:27-27`
- **toId** — The identifier of the target entity `bridge.ts:157-157`
- **toId** — The identifier of the target entity in a hypothesis `types.ts:29-29`
- **total** — Total number of hypotheses generated `engine.ts:24-24`
- **totalConfidence** — The total confidence score of a path `bridge.ts:27-27`
- **type** — The type of hypothesis reference `types.ts:42-42`

### embedded_sql
- **DELETE FROM hypotheses WHERE project_hash = ? AND branch_name = ?** — Executes a SQL query to delete hypotheses based on project hash and branch name `hypothesis-ops.ts:18-18`
- **SELECT COUNT(*) as cnt FROM hypotheses WHERE project_hash = ? AND branch_name = ?** — Counts the number of hypotheses based on project hash and branch name `hypothesis-ops.ts:109-109`
- **SELECT id, from_id, to_id, hypothesis_type, confidence, rel_type, evidence, strategy FROM hypotheses** — Retrieves detailed information about hypotheses based on project hash and branch name, ordered by confidence `hypothesis-ops.ts:77-80`
