# Patterns

Pattern detection system identifying code patterns, anti-patterns, and best practices.

## Overview

The Patterns module is a multi-language code analysis system that detects anti-patterns, code smells, optimizations, and best practices through a two-stage pipeline combining structural metadata matching with semantic embedding validation. It orchestrates custom detectors, exemplar storage, and semantic similarity scoring to classify code patterns with configurable severity levels. The system uses YAML-based pattern definitions indexed by language, curated code examples with cached embeddings, and a formatter that supports multiple output formats for scan results.

## Flow

```
Source Code
    ↓
[StructuralDetector]
  Match metadata & graph criteria
    ↓
[Candidates] → [ExemplarStore + SemanticValidator]
              Compare embeddings via cosine similarity
    ↓
[PatternMatches]
    ↓
[PatternFormatter]
  Format as summary/detailed/JSON
    ↓
ScanResult
```

## Entity Listing

### Core Orchestration

- **PatternEngine** (pattern-engine.ts:38-44) — Orchestrates structural detection and semantic validation pipeline across code entities.

### Detectors & Validators

- **StructuralDetector** (structural-detector.ts:37-51) — Detects pattern candidates by applying metadata and graph relationship criteria to source code AST nodes.
- **SemanticValidator** (semantic-validator.ts:16-161) — Validates pattern candidates by computing cosine similarity between candidate embeddings and curated exemplar embeddings.

### Data Storage & Indexing

- **ExemplarStore** (exemplar-store.ts:36-231) — Loads curated code examples from YAML, lazy-embeds them on demand, and maintains a file-backed cache of float32 embeddings (~300KB for 200–500 exemplars).
- **PatternRegistry** (pattern-registry.ts:90-112) — Indexes pattern definitions loaded from YAML files by language for fast lookup and filtering.

### Output Formatting

- **PatternFormatter** (pattern-formatter.ts:7-166) — Formats scan results in summary (aggregated counts), detailed (per-match), or JSON output formats.

### Registration Utilities

- **registerDetector** (structural-detector.ts:23-27) — Registers a single custom detector function for structural pattern matching.
- **registerDetectors** (structural-detector.ts:29-35) — Registers multiple detector functions from a module's exported functions.

### Type Definitions

- **PatternCategory** (types.ts:9) — Union type classifying pattern categories: anti-pattern, code smell, optimization, or best-practice.
- **PatternSeverity** (types.ts:11) — Union type for match severity levels: critical, high, medium, low, or info.
- **StructuralCriteria** (types.ts:24-137) — Defines structural matching requirements including node types, properties, graph relationships, and custom detectors.
- **RelationshipCriteria** (types.ts:15-23) — Specifies graph relationship matching rules for AST or dependency graph analysis.
- **PatternDefinition** (types.ts:74-102) — Complete pattern rule definition including id, category, severity, criteria, exemplars, and documentation.
- **PatternExemplar** (types.ts:102-132) — Metadata for curated code example including id, language, code snippet, and embedding vector.
- **StructuralCandidate** (types.ts:162-197) — Represents a candidate code section detected by structural criteria before semantic validation.
- **CustomDetectorResult** (types.ts:142-160) — Result object returned by custom detector functions containing match metadata and confidence scores.
- **CustomDetectorFn** (types.ts:175) — Function signature for custom detector callbacks accepting a code entity and returning structured match results.
- **PatternMatch** (types.ts:126-153) — Complete match result including pattern id, entity location, severity, category, exemplar references, and confidence score.
- **PatternScanOptions** (types.ts:141-171) — Configuration object for scan execution including language filters, severity thresholds, and detector selection.
- **PatternScanResult** (types.ts:200-220) — Complete scan results with array of matches, summary counts by severity, duration, and language statistics.

## Dependencies

**Internal:**
- `semantic/embedding-generator` — Generates float32 embeddings for exemplars and candidates
- `utils/simd-vector-ops` — Cosine similarity computation for embedding comparison
- `logging` — Debug and info logging for detector and validator operations
- Metadata graph system (AST/dependency graph) — Provides node types, properties, and relationships for structural matching

**External:**
- `yaml` — Parses YAML pattern definitions and exemplar manifests
- `node:crypto`, `node:fs` — File I/O and hashing for embedding cache management

## Design Patterns

**Two-Stage Validation:** Structural matching filters candidates efficiently, then semantic validation with embeddings reduces false positives by comparing code similarity against curated exemplars.

**Lazy Embedding:** Exemplar embeddings are computed on-demand and cached to disk, avoiding upfront computation cost while maintaining fast lookup.

**Language-Indexed Registry:** Pattern definitions keyed by language enable fast filtering and allow language-specific rules to coexist in a single system.