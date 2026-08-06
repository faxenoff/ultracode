# src/test-fixtures/go

## Overview

This module is a test fixture demonstrating Go patterns for interface-based design, in-memory storage, and concurrent processing. It implements a simple catalog system with CRUD operations on items and showcases goroutine-based parallel processing using channels. The module serves as an example codebase for validating code analysis tooling and teaching Go concurrency patterns.

## Flow

```
Item Data
    ↓
Catalog Interface (CRUD contract)
    ↓
MemCatalog (in-memory map storage)
    ↓
Lookup / Add / Modify / Remove operations
    ↓
RunParallel: distribute items to goroutines
    ↓
Transform & send via channel
    ↓
Aggregate results
```

## Entity Listing

### Types

- **Item** `sample.go:13-18` — Struct representing a catalog item with ID, label, body content, and completion status.
- **Catalog** `sample.go:20-25` — Interface defining abstract CRUD contract with Lookup, Add, Modify, and Remove operations.
- **MemCatalog** `sample.go:27-30` — In-memory map-based implementation of the Catalog interface with a serial counter.
- **PriorityItem** `sample.go:85-88` — Type alias for items with priority metadata or ordering semantics.

### Functions

- **NewCatalog** `sample.go:32-34` — Factory function that constructs and returns a new MemCatalog instance.
- **Lookup** `sample.go:36-42` — Receiver method on MemCatalog that retrieves an item by ID, returning an error if not found.
- **Add** `sample.go:44-51` — Receiver method on MemCatalog that inserts a new item, rejecting duplicates.
- **Modify** `sample.go:53-60` — Receiver method on MemCatalog that updates an existing item's data in place.
- **Remove** `sample.go:62-68` — Receiver method on MemCatalog that deletes an item by ID from storage.
- **RunParallel** `sample.go:70-83` — Function that distributes items across goroutines for concurrent transformation and aggregates results via channel.
- **x** `sample.go:73-77` — Closure function running in a goroutine that transforms item labels to uppercase and signals completion.
- **main** `sample.go:90-109` — Entry point demonstrating catalog usage, item lifecycle operations, and parallel processing patterns.

### Constants

- **AppVersion, PoolLimit** `sample.go:8-9` — Manifest constants: semantic version string and maximum concurrent pool size.

## Dependencies

- **Internal:** Interface-based abstraction (Catalog) decouples implementation from usage; MemCatalog depends on Item struct and Go's map/error types.
- **External:** Standard library only — `fmt` for error/output formatting, `strings` for text transformation, `sync` primitives implicit in goroutine/channel usage.