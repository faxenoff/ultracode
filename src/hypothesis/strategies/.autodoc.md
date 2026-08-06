# Strategies

## 🤖 Overview

The `callback-arg.ts` file is responsible for detecting callback patterns in code, such as `setTimeout(fn)`, `promise.then(fn)`, and `array.map(fn)`. It identifies these patterns by scanning for known callback APIs and checking adjacent edges for referenced functions. This module is used by the hypothesis generation system to infer potential callback arguments in code.

## 🤖 Architecture

```
  +-------------------+
  |   callback-arg.ts |
  +-------------------+
    |
    v
  +-------------------+
  |   findCallbackEntry |
  +-------------------+
    |
    v
  +-------------------+
  |   generate         |
  +-------------------+
    |
    v
  +-------------------+
  |   storage         |
  +-------------------+
    |
    v
  +-------------------+
  |   hypothesisStore |
  +-------------------+
```

## 🤖 Flow

```
  +-------------------+
  |   callback-arg.ts |
  +-------------------+
    |
    v
  +-------------------+
  |   storage         |
  +-------------------+
    |
    v
  +-------------------+
  |   hypothesisStore |
  +-------------------+
    |
    v
  +-------------------+
  |   generate         |
  +-------------------+
    |
    v
  +-------------------+
  |   findCallbackEntry |
  +-------------------+
    |
    v
  +-------------------+
  |   bySource         |
  +-------------------+
    |
    v
  +-------------------+
  |   allRels          |
  +-------------------+
    |
    v
  +-------------------+
  |   rel              |
  +-------------------+
    |
    v
  +-------------------+
  |   targetEntity     |
  +-------------------+
    |
    v
  +-------------------+
  |   entry            |
  +-------------------+
```

## 🤖 Entity Listing

### Function
- **generate** — Analyzes relationships in the graph storage to identify callback argument patterns and stores hypotheses in the hypothesis store `callback-arg.ts:21-68`
- **generate** — Analyzes relationships to identify interface method calls and their confidence levels, then stores these as hypotheses `interface-narrow.ts:20-78`
- **generate** — Generates hypotheses using both decorator-based and name-based strategies `string-key.ts:20-25`
- **generateDecoratorHypotheses** — Generates hypotheses based on decorator patterns `string-key.ts:28-58`
- **generateForPair** — Generates proximity-based hypotheses for a specific source→target pair `proximity-bridge.ts:28-110`
- **generateNameMatchHypotheses** — Generates hypotheses based on name-based register/dispatch matching `string-key.ts:61-126`
- **nextId** — Generates a unique identifier for hypotheses `callback-arg.ts:17-19`
- **nextId** — Returns a unique identifier for hypothesis entities `interface-narrow.ts:16-18`
- **nextId** — Generates a unique identifier for proximity-based hypotheses `proximity-bridge.ts:23-25`
- **nextId** — Returns a unique identifier for hypotheses `string-key.ts:16-18`
- **scorePair** — Computes the score for a pair of nodes based on shared lexemes and file/dir relationships `proximity-bridge.ts:113-135`
- **sharesMeaningfulLexeme** — Determines if two nodes share a meaningful lexeme `proximity-bridge.ts:138-147`

### Import_decl
- **../../types/storage.js** — Imports `../../types/storage.js` from `../../types/storage.js`. `callback-arg.ts:10-10`, `interface-narrow.ts:10-10`, `proximity-bridge.ts:14-14`, `string-key.ts:11-11`
- **../catalogs.js** — Imports `../catalogs.js` from `../catalogs.js`. `callback-arg.ts:11-11`, `string-key.ts:12-12`
- **../types.js** — Imports `../types.js` from `../types.js`. `callback-arg.ts:12-12`, `interface-narrow.ts:11-11`, `proximity-bridge.ts:15-15`, `string-key.ts:13-13`
- **node:path** — Imports `node:path` from `node:path`. `proximity-bridge.ts:13-13`, `string-key.ts:10-10`

### Property
- **bwdId** — Represents a node in the backward BFS frontier `proximity-bridge.ts:72-72`
- **callerFile** — Not present in the provided code `string-key.ts:66-66`
- **callerFile** — Stores the file name associated with each dispatch call `string-key.ts:67-67`
- **callerId** — Not present in the provided code `string-key.ts:66-66`
- **callerId** — Stores the caller ID associated with each dispatch call `string-key.ts:67-67`
- **fwdId** — Represents a node in the forward BFS frontier `proximity-bridge.ts:72-72`
- **score** — Calculates the score for a pair of nodes based on their proximity `proximity-bridge.ts:72-72`

## Module Files

| File | Purpose | Tier |
|------|---------|------|
| **string-key.ts** | Matches decorator applications and event registration/dispatch patterns via string-based symbol lookup | Tier 1 |
| **callback-arg.ts** | Resolves callback function arguments in async patterns (setTimeout, Promise.then, array methods) | Tier 2 |
| **interface-narrow.ts** | Infers concrete implementations for interface methods by matching type signatures and parameter compatibility | Tier 3 |
| **proximity-bridge.ts** | Bridges gaps between unconnected entities using bidirectional BFS and proximity-weighted heuristics | Tier 4 |

## Dependencies

- **GraphStorage** — provides read access to entities and relationships in the code graph; required by all strategies to enumerate and inspect graph structure
- **HypothesisStore** — accepts newly inferred relationships and hypothesis records with confidence scores; strategies write results here
- **Callback Catalog** — maps known callback APIs (setTimeout, Promise.then, etc.) to parameter positions and invocation patterns for Tier 2 matching
- **Type System** — entity language and type information used for signature matching in Tier 3 interface narrowing and compatibility checks
- **BFS Traversal** — graph traversal primitives for proximity-bridge bidirectional search and distance calculation across entity neighborhoods
