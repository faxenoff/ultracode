# NgRx

## 🤖 Overview

The `src/parsers/ngrx` module is responsible for parsing NgRx analysis results and converting them into graph entities and relationships. It is used by developers and data analysts to understand and visualize the structure of NgRx applications.

## 🤖 Architecture

```
  +---------------------+
  |     NgRx Analysis   |
  +---------------------+
          | 
          v
  +---------------------+
  | NgRx Entity Builders |
  +---------------------+
          |
          v
  +---------------------+
  | NgRx Relationship Builders |
  +---------------------+
          |
          v
  +---------------------+
  | NgRx Parser Module   |
  +---------------------+
```

## 🤖 Flow

```
  +---------------------+
  | NgRx Analysis       |
  +---------------------+
          | 
          v
  +---------------------+
  | NgRx Entity Builders |
  +---------------------+
          |
          v
  +---------------------+
  | NgRx Relationship Builders |
  +---------------------+
          |
          v
  +---------------------+
  | NgRx Parser Module   |
  +---------------------+
```

## 🤖 Entity Listing

### Function
- **buildNgRxEntities** — Parses and returns an array of parsed entities for NgRx analysis, including actions, effects, and reducers `builders.ts:99-178`
- **buildNgRxRelationships** — Builds NgRx relationships from analysis results, including effect → action, reducer → action, and selector → selector relationships `builders.ts:14-94`

### Interface
- **NgRxAction** — Represents an action in NgRx state management with properties like name, type, and file path `types.ts:12-19`
- **NgRxAnalysis** — Represents an analysis of NgRx constructs `types.ts:88-95`
- **NgRxDispatch** — Represents a dispatch call in NgRx `types.ts:67-73`
- **NgRxEffect** — Defines an effect in NgRx state management with properties like name, listensTo, and isRoot `types.ts:24-32`
- **NgRxReducer** — Defines a reducer in NgRx state management with properties like name, stateName, and handlers `types.ts:45-51`
- **NgRxReducerHandler** — Defines a handler for a reducer in NgRx state management with properties like actionType and stateChanges `types.ts:37-40`
- **NgRxRelationship** — Represents a relationship between NgRx entities `types.ts:100-108`
- **NgRxSelect** — Represents a select call in NgRx `types.ts:78-83`
- **NgRxSelector** — Represents a selector in NgRx state management `types.ts:56-62`

### Import_decl
- **../../types/parser.js** — Imports `../../types/parser.js` from `../../types/parser.js`. `builders.ts:7-7`
- **../../types/storage.js** — Imports `../../types/storage.js` from `../../types/storage.js`. `builders.ts:8-8`, `types.ts:7-7`
- **./types.js** — Imports `./types.js` from `./types.js`. `builders.ts:9-9`

### Property
- **actionName** — The name of the action being dispatched `types.ts:68-68`
- **actions** — An array of NgRxAction objects `types.ts:89-89`
- **actionType** — The type of the action being dispatched `types.ts:69-69`
- **actionType** — Specifies the type of an NgRx action `types.ts:105-105`
- **actionType** — The type of action the handler responds to `types.ts:38-38`
- **callerEntity** — The entity that initiated the dispatch `types.ts:70-70`
- **callerEntity** — Represents the entity that called the current function `types.ts:80-80`
- **context** — Represents an optional string context `types.ts:106-106`
- **dependencies** — Other selectors this selector depends on `types.ts:58-58`
- **dispatches** — An array of NgRxDispatch objects `types.ts:93-93`
- **dispatches** — The action types this effect dispatches `types.ts:27-27`
- **effects** — An array of NgRxEffect objects `types.ts:90-90`
- **filePath** — Stores the file path of the current file `types.ts:49-49`, `types.ts:60-60`
- **filePath** — The file path where the selector is defined `types.ts:30-30`, `types.ts:71-71`
- **filePath** — The file path where the action is defined `types.ts:17-17`, `types.ts:81-81`
- **fromName** — Represents the name of the source entity in a relation `types.ts:101-101`
- **functional** — Indicates whether the effect is created using createEffect or @Effect decorator `types.ts:29-29`
- **handlers** — An array of reducer handlers `types.ts:48-48`
- **hasProps** — Indicates whether the action has properties `types.ts:15-15`
- **isRoot** — Indicates whether the effect is a root effect `types.ts:28-28`
- **line** — Indicates the line number in the file `types.ts:50-50`, `types.ts:61-61`
- **line** — The line number where the selector is defined `types.ts:31-31`, `types.ts:72-72`
- **line** — The line number in the file where the action is defined `types.ts:18-18`, `types.ts:82-82`
- **listensTo** — The action types this effect responds to `types.ts:26-26`
- **metadata** — Stores additional information about a relation `types.ts:104-107`
- **name** — Stores the name of the entity `types.ts:46-46`, `types.ts:57-57`
- **name** — The name of the action `types.ts:13-13`
- **name** — The name of the selector `types.ts:25-25`
- **propsType** — The type of properties if the action has them `types.ts:16-16`
- **reducers** — An array of NgRxReducer objects `types.ts:91-91`
- **selectorName** — The name of the selector being selected `types.ts:79-79`
- **selectors** — An array of NgRxSelector objects `types.ts:92-92`
- **selects** — An array of NgRxSelect objects `types.ts:94-94`
- **stateChanges** — The properties modified by the handler `types.ts:39-39`
- **stateName** — The name of the state the reducer manages `types.ts:47-47`
- **statePath** — The state path for the selector `types.ts:59-59`
- **toName** — Represents the name of the target entity in a relation `types.ts:102-102`
- **type** — Defines the type of a relation `types.ts:103-103`
- **type** — The type of the action, e.g., '[Task] Load Tasks' `types.ts:14-14`

## Data Flow

- **Inputs**: `NgRxAnalysis` results containing actions, effects, reducers, selectors, dispatches, and selects
- **Processing**: Iterates over analysis results to generate typed relationships (listens_to, dispatches, handles, modifies, depends_on, reads_state)
- **Outputs**: `NgRxRelationship[]` for graph edges and `ParsedEntity[]` for graph nodes

## Public API

| Export | Type | Description | Location |
|--------|------|-------------|----------|
| `buildNgRxRelationships` | function | Converts NgRx analysis into graph relationships | [`builders.ts:14-94`](./builders.ts) |
| `buildNgRxEntities` | function | Converts NgRx analysis into graph entities | [`builders.ts:99-178`](./builders.ts) |
| `NgRxAction` | interface | Action with type string and props | [`types.ts:12-19`](./types.ts) |
| `NgRxEffect` | interface | Effect with action dependencies | [`types.ts:24-32`](./types.ts) |
| `NgRxReducerHandler` | interface | Reducer handler with state changes | [`types.ts:37-40`](./types.ts) |
| `NgRxReducer` | interface | Reducer with handlers and state name | [`types.ts:45-51`](./types.ts) |
| `NgRxSelector` | interface | Selector with dependencies | [`types.ts:56-62`](./types.ts) |
| `NgRxDispatch` | interface | Store dispatch call | [`types.ts:67-73`](./types.ts) |
| `NgRxSelect` | interface | Store select call | [`types.ts:78-83`](./types.ts) |
| `NgRxAnalysis` | interface | Complete NgRx analysis result | [`types.ts:88-95`](./types.ts) |
| `NgRxRelationship` | interface | Relationship for graph storage | [`types.ts:100-108`](./types.ts) |
| `isNgRxFile` | function | Checks if file contains NgRx patterns | (re-exported from `../ngrx-parser`) |
| `NgRxParser` | class | Parser for NgRx source files | (re-exported from `../ngrx-parser`) |
| `parseNgRxFile` | function | Parses an NgRx file | (re-exported from `../ngrx-parser`) |

## Dependencies

### Internal Modules
| Module | Purpose |
|--------|---------|
| `../../types/parser` | `ParsedEntity` type |
| `../../types/storage` | `RelationType` enum for graph relationships |
| `../ngrx-parser` | NgRx file parser (re-exported) |

### External Packages

_None_

## Behavioral Properties

| Property | Value |
|----------|-------|
| Relationship types | listens_to_action, dispatches_action, handles_action, modifies_state, depends_on_selector, reads_state |
| Entity types | action, effect, reducer, selector |
| Effect support | Both `createEffect` and `@Effect` decorator patterns |

## Error Handling

Builders iterate over arrays and skip entries with missing data. Empty analysis produces empty relationship and entity arrays.

## Known Limitations

- Relationship building assumes action names are globally unique within analysis scope
- Does not resolve action type strings across separate files
- Selector dependency tracking is limited to explicitly declared dependencies

## Exports

- `isNgRxFile`
- `NgRxParser`
- `parseNgRxFile`

## Files

| File | Description |
|------|-------------|
| `index.ts` | Re-exports NgRx parser, builders, and types |
| `builders.ts` | Converts NgRx analysis into graph entities and relationships |
| `types.ts` | Type definitions for all NgRx constructs (actions, effects, reducers, selectors, dispatches, selects) |
