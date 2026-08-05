# Recent Changes Enrichment

## Overview

This module enriches diagnostic tool results with recently-changed entity metadata extracted from Prolly Tree commit history. It provides core utilities for annotating diagnostic outputs (from tools like `trace_flow` and `trace_backwards`) with change timestamps and significance levels, eliminating boilerplate duplication across diagnostic systems. The module bridges diagnostic queries with version control metadata, enabling tools to highlight recently modified code as a signal for potential issues.

## Flow

```
Entity Locations / Diagnostic Results
              ↓
    Resolve Locations → Entity IDs (via query)
              ↓
    Analyze Commit History (Prolly Tree)
              ↓
    Build Change Summary (type, significance)
              ↓
    Annotate Entities In-Place
              ↓
    Format for Display
              ↓
    Enriched Diagnostic Output
```

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