# Global Cache

## 🤖 Overview

The `global-cache` module provides a centralized cache for semantic embeddings, used by applications requiring efficient retrieval and storage of embedding data. It is designed for developers and data scientists who need to manage and access semantic embeddings across different modules and services.

## 🤖 Architecture

```
GlobalCache
├── EmbeddingCache
│   ├── Embedding
│   └── EmbeddingSet
├── CacheManager
│   ├── Cache
│   └── CacheEntry
└── Data
    └── EmbeddingData
```

## 🤖 Flow

```
GlobalCache
│
├── EmbeddingCache
│   ├── Embedding
│   │   └── EmbeddingSet
│   └── CacheManager
│       └── Cache
│           └── CacheEntry
│
└── Data
    └── EmbeddingData
```

## 🤖 Entity Listing

### Interface
- **GlobalCacheEntry** — Represents an entry in the global embedding cache with text, optional embedding text, category, language, and framework `types.ts:5-22`
- **GlobalCacheMetadata** — Metadata for the global embedding cache, including version, model, dimension, last updated time, and entry counts `types.ts:24-30`

### Property
- **category** — The category of the cache entry, either "builtin", "stdlib", "framework", or "pattern" `types.ts:19-19`
- **dimension** — The dimension of the model used for the global embedding cache `types.ts:27-27`
- **embeddingText** — Optional full embedding text used for pipeline cache hits when the entity name matches a known pattern `types.ts:18-18`
- **entryCounts** — A record of counts for different types of cache entries `types.ts:29-29`
- **framework** — Optional framework associated with the cache entry `types.ts:21-21`
- **language** — The programming language associated with the cache entry `types.ts:20-20`
- **lastUpdated** — The timestamp when the global embedding cache metadata was last updated `types.ts:28-28`
- **model** — The model used for the global embedding cache `types.ts:26-26`
- **text** — The text content of the cache entry `types.ts:6-6`
- **version** — The version of the global embedding cache metadata `types.ts:25-25`

## Data Flow

- **Inputs**: None at runtime; entries are statically defined in the data submodule.
- **Processing**: getAllGlobalEntries() aggregates all language builtins and framework patterns into a single GlobalCacheEntry array.
- **Outputs**: GlobalCacheEntry arrays consumed by GlobalEmbeddingCache for pre-seeding vector indexes.

## Public API

| Export | Type | Description | Location |
|--------|------|-------------|----------|
| `GlobalEmbeddingCache` | class | Re-exported cache manager from parent semantic module | [`index.ts:7-7`](./index.ts) |
| `GlobalCacheEntry` | interface | Cache entry with text, category, language, and optional framework | [`types.ts:5-10`](./types.ts) |
| `GlobalCacheMetadata` | interface | Cache metadata with version, model, dimension, and entry counts | [`types.ts:12-18`](./types.ts) |

## Dependencies

### Internal Modules

| Module | Purpose |
|--------|---------|
| `semantic/global-embedding-cache` | GlobalEmbeddingCache class implementation |
| `global-cache/data` | Built-in and framework pattern definitions |

### External Packages

| Package | Purpose |
|---------|---------|
| (none) | No external dependencies |

## Behavioral Properties

| Property | Value |
|----------|-------|
| Entry categories | builtin, stdlib, framework, pattern |
| Supported languages | JavaScript, TypeScript, Python, Java, Kotlin, Go, Rust |
| Supported frameworks | React, Angular, Vue, Express, NestJS |

## Error Handling

No runtime errors are possible; all data is statically defined. The module exports pure type definitions and constant arrays.

## Known Limitations

- Framework patterns are manually curated and may not cover all versions or APIs.
- No automatic updates when new language versions add built-in functions.

## Exports

- `GlobalEmbeddingCache`

## Files

| File | Description |
|------|-------------|
| `index.ts` | Re-exports GlobalEmbeddingCache, data submodule, and types |
| `types.ts` | GlobalCacheEntry and GlobalCacheMetadata interfaces |
