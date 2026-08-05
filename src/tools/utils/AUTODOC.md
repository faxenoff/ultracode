# Recent Changes Enrichment

## 🤖 Overview

The `recent-changes-enrichment.ts` module provides a utility for annotating diagnostic tool results with recently-changed entity status from Prolly Tree commit history. It is used by developers and maintainers to understand the impact of recent changes on diagnostic tools, helping them identify critical or high-significance changes that may affect tool behavior.

## 🤖 Architecture

```
  +-----------------------------+
  |     getRecentlyChangedEntities |
  +-----------------------------+
           |
           v
  +-----------------------------+
  |       enrichEntityInfo      |
  +-----------------------------+
           |
           v
  +-----------------------------+
  |       summarizeRecentChanges |
  +-----------------------------+
           |
           v
  +-----------------------------+
  |       logRecentChanges      |
  +-----------------------------+
```

## 🤖 Flow

```
  +-----------------------------+
  |       getRecentlyChangedEntities |
  +-----------------------------+
           |
           v
  +-----------------------------+
  |       enrichEntityInfo      |
  +-----------------------------+
           |
           v
  +-----------------------------+
  |       summarizeRecentChanges |
  +-----------------------------+
           |
           v
  +-----------------------------+
  |       logRecentChanges      |
  +----------------
```

## 🤖 Entity Listing

### Function
- **annotateEntitiesInPlace** — Annotates diagnostic tool results with recently-changed entity status from Prolly Tree commit history `recent-changes-enrichment.ts:124-136`
- **buildRecentChangeSummary** — Builds a summary of recently changed entities from given inputs `recent-changes-enrichment.ts:68-116`
- **formatRecentChangesSection** — Formats the recent changes section for display `recent-changes-enrichment.ts:211-227`
- **getAdapterFromStorage** — Extracts a GraphAdapter from storage, returning null if unavailable `recent-changes-enrichment.ts:44-47`
- **hintForSignificance** — Generates a hint based on the significance and number of commits `recent-changes-enrichment.ts:53-62`
- **resolveLocationsToEntities** — Resolves locations to entities `recent-changes-enrichment.ts:152-204`

### Interface
- **ChangedEntityInfo** — Represents information about an entity that has been changed, including its ID, name, file path, change type, significance, and a hint `recent-changes-enrichment.ts:16-23`
- **EntityInfoInput** — Input for entity information, including ID, significance, name, and file path `recent-changes-enrichment.ts:32-37`
- **RecentChangeSummary** — Summary of recently changed entities, including their details and statistics `recent-changes-enrichment.ts:25-30`
- **ResolvedLocation** — Represents the resolved location of an entity `recent-changes-enrichment.ts:140-146`

### Import_decl
- **../../logging/index.js** — Imports `../../logging/index.js` from `../../logging/index.js`. `recent-changes-enrichment.ts:9-9`
- **../../storage/graph-adapter.js** — Imports `../../storage/graph-adapter.js` from `../../storage/graph-adapter.js`. `recent-changes-enrichment.ts:10-10`
- **../../storage/prolly/recently-changed.js** — Imports `../../storage/prolly/recently-changed.js` from `../../storage/prolly/recently-changed.js`. `recent-changes-enrichment.ts:11-11`
- **../../types/storage.js** — Imports `../../types/storage.js` from `../../types/storage.js`. `recent-changes-enrichment.ts:12-12`

### Property
- **changeType** — Type of change to an entity, either "added" or "modified" `recent-changes-enrichment.ts:20-20`
- **commitsAnalyzed** — Number of commits analyzed `recent-changes-enrichment.ts:28-28`
- **entityId** — Unique identifier for an entity `recent-changes-enrichment.ts:17-17`, `recent-changes-enrichment.ts:33-33`
- **entityId** — Represents the unique identifier of an entity `recent-changes-enrichment.ts:125-125`, `recent-changes-enrichment.ts:144-144`
- **entityName** — Name of an entity `recent-changes-enrichment.ts:18-18`, `recent-changes-enrichment.ts:35-35`
- **entityName** — Represents the name of an entity `recent-changes-enrichment.ts:145-145`
- **filePath** — File path where an entity is located `recent-changes-enrichment.ts:19-19`, `recent-changes-enrichment.ts:36-36`
- **filePath** — Represents the file path of an entity `recent-changes-enrichment.ts:142-142`
- **getLibSQLAdapter** — Function to get a GraphAdapter from storage `recent-changes-enrichment.ts:45-45`
- **hint** — A hint or note related to the significance of the change `recent-changes-enrichment.ts:22-22`
- **line** — Represents the line number of an entity `recent-changes-enrichment.ts:143-143`, `recent-changes-enrichment.ts:159-159`
- **location** — Represents the location of an entity `recent-changes-enrichment.ts:141-141`, `recent-changes-enrichment.ts:159-159`
- **recentlyChangedEntities** — Array of recently changed entities `recent-changes-enrichment.ts:26-26`
- **significance** — Significance level of the change, either "critical", "high", or "medium" `recent-changes-enrichment.ts:21-21`, `recent-changes-enrichment.ts:34-34`
- **timeMs** — Time taken in milliseconds to analyze changes `recent-changes-enrichment.ts:29-29`
- **totalAnnotated** — Total number of annotated entities `recent-changes-enrichment.ts:27-27`

## Entities

### Public API

- `buildRecentChangeSummary` (recent-changes-enrichment.ts:68-116) — Analyzes commit history and identifies recently modified entities, returning aggregated metadata with change timestamps and significance levels.
- `annotateEntitiesInPlace` (recent-changes-enrichment.ts:124-125) — Marks diagnostic items with `recentlyChanged` flag and metadata based on detected change set.
- `resolveLocationsToEntities` (recent-changes-enrichment.ts:152-208) — Maps file:line location strings from diagnostic results to entity identifiers using semantic query, resolving symbol names and file paths.
- `formatRecentChangesSection` (recent-changes-enrichment.ts:215-231) — Formats change summary as human-readable text output section for diagnostic reports or CLI display.

### Internals

- `getAdapterFromStorage` (recent-changes-enrichment.ts:44-47) — Extracts GraphAdapter instance from storage context if available for entity resolution queries.

### Types

- `ChangedEntityInfo` (recent-changes-enrichment.ts:16-23) — Represents metadata for a single entity with recent change information: identity, change type (added/modified), and significance level.
- `RecentChangeSummary` (recent-changes-enrichment.ts:25-30) — Contains aggregated results of recently changed entities analysis: entity list, annotation count, commit count analyzed, and elapsed time.
- `EntityInfoInput` (recent-changes-enrichment.ts:32-37) — Specifies required and optional entity identification attributes (ID, name, path) used as input to enrichment functions.
- `ResolvedLocation` (recent-changes-enrichment.ts:140-146) — Contains resolved file location mapped to entity identity details after semantic query resolution.

## Dependencies

**Internal:**
- `GraphAdapter` — entity query interface for semantic symbol resolution
- `getRecentlyChangedEntities` — retrieves change metadata from Prolly Tree commit history
- `log` — diagnostic logging utility

**Key relationships:**
- Depends on ~~`storage/prolly/recently-changed.js`~~ (deleted) for commit history analysis
- Uses `GraphAdapter` from storage layer for entity-to-location mapping
- Provides enrichment layer between diagnostic tools and version control metadata
