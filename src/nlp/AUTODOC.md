---
module_name: nlp
description: Natural language processing utilities for semantic search — tokenization, TF-IDF extraction, co-occurrence indexing, and automatic query expansion via PRF
status: active
language: TypeScript
entry_point: index.ts
exports:
  - CooccurrenceIndex
  - QueryExpander
  - TfIdfExtractor
  - tokenize
  - tokenizeUnique
  - countTokens
  - extractNgrams
  - extractTopTerms
  - createPrfOnlyExpander
  - STOP_WORDS
dependencies:
  - ../storage/libsql/cooccurrence-ops
tags: [nlp, tokenizer, tfidf, cooccurrence, query-expansion, prf, stop-words, semantic-search]
---

## Overview

Lightweight NLP pipeline for semantic search query improvement. No heavy ML dependencies. Four components form a chain: `tokenizer` splits text into normalized tokens (Unicode-aware, camelCase/snake_case splitting, bilingual stop words), `TfIdfExtractor` scores terms by TF-IDF for pseudo-relevance feedback, `CooccurrenceIndex` tracks term pair frequencies within a sliding window using PMI scoring persisted via LibSQL, and `QueryExpander` combines co-occurrence and PRF signals to produce weighted expanded queries. The module is consumed primarily by the `semantic` module's `HybridSearchEngine` for two-pass search.

```
query ──► tokenize() ──► QueryExpander.expand()
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
         original        CooccurrenceIndex  TfIdfExtractor
         tokens          (co-oc terms)      (PRF terms)
              │               │               │
              └───────────────┴───────────────┘
                              ▼
                        ExpandedQuery (weighted term map)
```

## Data Flow

### Inputs

| Source | Type | Description |
|--------|------|-------------|
| Raw text | `string` | Source code comments, docstrings, markdown chunks |
| Search queries | `string` | User natural language queries |
| Top search results | `Array<{ content: string }>` | Initial search results for PRF extraction |
| Storage backend | `CooccurrenceOperations` | SQLite persistence for co-occurrence pairs |

### Processing

| Step | Component | Operation |
|------|-----------|-----------|
| 1. Tokenize | `tokenize()` | Lowercase, split camelCase/snake_case, filter stop words |
| 2. Index | `CooccurrenceIndex.updateFromChunk()` | Sliding window pair extraction, PMI storage |
| 3. Expand | `QueryExpander.expand()` | Merge original + co-oc + PRF terms with weights |
| 4. Score | `TfIdfExtractor.extractTopTerms()` | TF-IDF over PRF documents, return top-k |

### Outputs

| Output | Type | Consumer |
|--------|------|----------|
| Expanded query | `ExpandedQuery` | `semantic/hybrid-search.ts` |
| Token list | `string[]` | Co-occurrence indexing, TF-IDF |
| Term scores | `TermScore[]` | QueryExpander PRF stage |
| Related terms | `RelatedTerm[]` | QueryExpander co-occurrence stage |

## Public API

| Export | Kind | Description | Location |
|--------|------|-------------|----------|
| `CooccurrenceIndex` | class | Term co-occurrence index with sliding window and PMI scoring | [`cooccurrence-index.ts:33-253`](./cooccurrence-index.ts) |
| `CooccurrenceIndexConfig` | interface | Config: windowSize, minTermLength, maxTermsPerChunk | [`cooccurrence-index.ts:20-27`](./cooccurrence-index.ts) |
| `QueryExpander` | class | Two-stage query expansion (co-occurrence + PRF) | [`query-expander.ts:56-208`](./query-expander.ts) |
| `QueryExpansionConfig` | interface | Config: weights, max terms, min length | [`query-expander.ts:20-35`](./query-expander.ts) |
| `ExpandedQuery` | interface | Expansion result with original/expanded strings and weight map | [`query-expander.ts:37-50`](./query-expander.ts) |
| `createPrfOnlyExpander` | function | Factory for PRF-only expander (no co-occurrence) | [`query-expander.ts:214-219`](./query-expander.ts) |
| `TfIdfExtractor` | class | TF-IDF scoring with log-norm TF and doc frequency filtering | [`tfidf.ts:40-189`](./tfidf.ts) |
| `TfIdfOptions` | interface | Config: minLength, logNormTf, minDocFreq, maxDocFreqRatio | [`tfidf.ts:25-34`](./tfidf.ts) |
| `TermScore` | interface | Term with score, tf, and idf values | [`tfidf.ts:18-23`](./tfidf.ts) |
| `extractTopTerms` | function | Convenience one-off TF-IDF extraction without instance | [`tfidf.ts:195-203`](./tfidf.ts) |
| `tokenize` | function | Text to normalized token array (Unicode, camelCase split) | [`tokenizer.ts:293-333`](./tokenizer.ts) |
| `tokenizeUnique` | function | Text to unique token `Set<string>` | [`tokenizer.ts:296-339`](./tokenizer.ts) |
| `countTokens` | function | Text to token frequency `Map<string, number>` | [`tokenizer.ts:347-356`](./tokenizer.ts) |
| `extractNgrams` | function | Extract n-grams from token array | [`tokenizer.ts:371-379`](./tokenizer.ts) |
| `STOP_WORDS` | const | Combined English + Russian stop word set (~150 words) | [`tokenizer.ts:247-247`](./tokenizer.ts) |

## Dependencies

### Internal

| Module | Usage |
|--------|-------|
| `../storage/libsql/cooccurrence-ops` | `CooccurrenceOperations` class and `RelatedTerm` type for persistence |

### External

None. The module is dependency-free beyond Node.js/Bun built-ins.

## Configuration

| Parameter | Default | Description |
|-----------|---------|-------------|
| `windowSize` | `5` | Sliding window size for co-occurrence pair extraction |
| `minTermLength` | `3` | Minimum token length (shared across components) |
| `maxTermsPerChunk` | `500` | Token cap per chunk to prevent memory issues |
| `originalWeight` | `1.0` | Weight for original query terms in expansion |
| `cooccurrenceWeight` | `0.6` | Weight for co-occurrence expansion terms |
| `prfWeight` | `0.4` | Weight for pseudo-relevance feedback terms |
| `maxCoocTermsPerToken` | `3` | Max co-occurrence terms per query token |
| `maxPrfTerms` | `5` | Max PRF terms extracted via TF-IDF |
| `maxExpandedTerms` | `15` | Total term cap in expanded query |
| `logNormTf` | `true` | Use `1 + log(tf)` normalization in TF-IDF |
| `maxDocFreqRatio` | `0.9` | Exclude terms appearing in >90% of documents |

## Behavioral Properties

### Async

`CooccurrenceIndex.updateFromChunk()` and `getRelatedTerms()` are async (SQLite I/O). `QueryExpander.expand()` is async due to co-occurrence lookup. `TfIdfExtractor` and `tokenize()` are synchronous (pure computation). `updateFromChunks()` aggregates pairs in memory before a single batch write.

### Idempotency

`tokenize()`, `countTokens()`, `extractNgrams()` are pure functions (same input, same output). `CooccurrenceIndex.updateFromChunk()` is additive (counts accumulate). `TfIdfExtractor.extractTopTerms()` is pure given same documents. `recalculatePMI()` is idempotent (recomputes from current counts).

### Side Effects

`CooccurrenceIndex` writes to SQLite via `CooccurrenceOperations` (pair counts, term frequencies, PMI scores). `clear()` deletes all co-occurrence data. `pruneRarePairs()` removes low-count pairs. No file I/O, no network calls, no subprocess spawning.

### State

`CooccurrenceIndex` is stateless in memory; all state persisted in SQLite. `TfIdfExtractor` holds immutable config only. `QueryExpander` holds config and a `TfIdfExtractor` instance. `STOP_WORDS` is a module-level frozen constant.

## Error Handling

No explicit try/catch blocks in this module. Errors from `CooccurrenceOperations` (SQLite failures) propagate to callers as unhandled rejections. `tokenize()` guards against null/non-string input (returns `[]`). `extractTopTerms()` returns `[]` for empty document arrays. `updateFromChunk()` short-circuits on fewer than 2 tokens. `QueryExpander` gracefully handles null `coocIndex` (skips co-occurrence stage).

## Observability

| Component | Method | Metrics |
|-----------|--------|---------|
| `CooccurrenceIndex` | `getStats()` | Pair count, term count (delegated to storage) |
| `QueryExpander` | `getConfig()` | Current expansion configuration |
| `ExpandedQuery` | `allTerms` | Full weighted term map for debugging |
| `ExpandedQuery` | `coocTerms`, `prfTerms` | Separate expansion source breakdown |

No structured logging in this module. Debugging relies on `ExpandedQuery.allTerms` inspection.

## Known Limitations

1. **No stemming/lemmatization:** Tokens are lowercased but not stemmed. "running" and "run" are treated as different terms.
2. **Stop words are static:** English + Russian only. No support for adding custom stop words at runtime.
3. **CamelCase heuristic:** Acronym splitting (`XMLParser` -> `xml`, `parser`) uses regex heuristics that may mishandle edge cases.
4. **No error recovery:** SQLite failures in `CooccurrenceIndex` propagate unhandled; callers must wrap in try/catch.
5. **Memory on large batches:** `updateFromChunks()` accumulates all pairs in memory before flushing; very large batch inputs may spike memory.

## TypeScript Notes

### Module Boundary

```typescript
// Config interfaces use optional fields with ?? defaults in constructors
interface CooccurrenceIndexConfig {
  windowSize?: number;    // default 5
  minTermLength?: number; // default 3
}

// ExpandedQuery uses Map for weighted terms (not Record)
allTerms: Map<string, number>;

// CooccurrenceIndex requires a storage adapter (dependency injection)
constructor(storage: CooccurrenceOperations, config?: CooccurrenceIndexConfig)
```

Key imported types: `CooccurrenceOperations` (class, `../storage/libsql/cooccurrence-ops.ts:34-364`), `RelatedTerm` (interface, `../storage/libsql/cooccurrence-ops.ts:18-22`).

## Exports



## Files

| File | Description |
|------|-------------|
| `index.ts` | Barrel re-export of all module components |
| `tokenizer.ts` | Unicode-aware tokenization with camelCase/snake_case splitting and bilingual stop words |
| `tfidf.ts` | TF-IDF scoring for pseudo-relevance feedback term extraction |
| `cooccurrence-index.ts` | Sliding-window term co-occurrence index with PMI scoring via SQLite |
| `query-expander.ts` | Two-stage query expansion combining co-occurrence and PRF signals |
