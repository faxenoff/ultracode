# src/storage/prolly/__tests__

## 🤖 Overview

This module contains test cases for the `commit-manager`, `node-store`, and `prolly-tree` modules, focusing on their internal logic and interactions. It is used by developers to verify the correctness of these modules under various scenarios.

## 🤖 Architecture

```
  +-------------------+
  |   Commit Manager  |
  |   (commit-manager)|
  +-------------------+
           |
           v
  +-------------------+
  |   Node Store      |
  |   (node-store)    |
  +-------------------+
           |
           v
  +-------------------+
  | Prolly Tree       |
  |   (prolly-tree)   |
  +-------------------+
```

## 🤖 Flow

```
  +-------------------+
  |   Commit Manager  |
  |   (commit-manager)|
  +-------------------+
           |
           v
  +-------------------+
  |   Node Store      |
  |   (node-store)    |
  +-------------------+
           |
           v
  +-------------------+
  | Prolly Tree       |
  |   (prolly-tree)   |
  +-------------------+
```

## 🤖 Entity Listing

### Function
- **createMockClient** — Mocks a database client for testing with predefined commit and branch head data `commit-manager.test.ts:5-89`
- **createMockClient** — Mocks a client for testing by simulating database operations `node-store.test.ts:6-102`
- **createMockClient** — Mocks a database client for testing purposes `prolly-tree.test.ts:6-54`
- **internals** — Filters and counts the number of internal nodes in the storage `node-store.test.ts:94-94`
- **leaves** — Filters and counts the number of leaf nodes in the storage `node-store.test.ts:93-93`
- **rows** — Represents the rows returned by the mock database client for a given SQL query `commit-manager.test.ts:65-68`, `commit-manager.test.ts:70-70`
- **rows** — Represents the rows returned by the SQL query `node-store.test.ts:56-56`, `node-store.test.ts:56-56`, `node-store.test.ts:62-62`, `node-store.test.ts:87-87`
- **rows** — Represents rows returned by SQL queries in the mock database client `prolly-tree.test.ts:39-39`

### Import_decl
- **../commit-manager.js** — Imports `../commit-manager.js` from `../commit-manager.js`. `commit-manager.test.ts:2-2`
- **../node-store.js** — Imports `../node-store.js` from `../node-store.js`. `node-store.test.ts:2-2`, `prolly-tree.test.ts:2-2`
- **../prolly-tree.js** — Imports `../prolly-tree.js` from `../prolly-tree.js`. `prolly-tree.test.ts:3-3`
- **../types.js** — Imports `../types.js` from `../types.js`. `node-store.test.ts:3-3`
- **bun:test** — Imports `bun:test` from `bun:test`. `commit-manager.test.ts:1-1`, `node-store.test.ts:1-1`, `prolly-tree.test.ts:1-1`

### Property
- **args** — Represents the arguments passed to the SQL query in the mock database client `commit-manager.test.ts:10-10`
- **args** — Represents the arguments passed to the SQL query `node-store.test.ts:10-10`
- **args** — Represents arguments passed to SQL statements in the mock database client `prolly-tree.test.ts:10-10`
- **sql** — Represents the SQL query string used in the mock database client `commit-manager.test.ts:10-10`
- **sql** — Represents the SQL query string being executed `node-store.test.ts:10-10`
- **sql** — Represents SQL statements used in the mock database client `prolly-tree.test.ts:10-10`

### embedded_sql
- **INSERT INTO graph_commits** — Checks if the SQL query includes an INSERT statement for graph_commits `commit-manager.test.ts:17-17`
- **SELECT * FROM graph_commits** — Checks if the SQL query includes a SELECT statement for graph_commits with an ORDER BY clause on created_at `commit-manager.test.ts:54-54`
- **SELECT * FROM graph_commits WHERE commit_hash** — Checks if the SQL query includes a SELECT statement for graph_commits with a WHERE clause on commit_hash `commit-manager.test.ts:47-47`
- **SELECT commit_hash FROM branch_heads** — Checks if the SQL query includes a SELECT statement for branch_heads to get commit_hash `commit-manager.test.ts:77-77`
- **SELECT content_hash FROM** — Checks if the SQL string contains a specific pattern related to content hash selection `node-store.test.ts:54-54`
- **SELECT content_hash FROM prolly_nodes** — Checks if the SQL string contains a specific pattern related to content hash selection from the prolly_nodes table `node-store.test.ts:86-86`

## Dependencies

Tests depend on:
- **CommitManager** (`../commit-manager.js`) — Core class managing commit storage and history queries.
- **NodeStore** (`../node-store.js`) — Core class handling persistent node storage.
- **ProllyTree** (`../prolly-tree.js`) — Core class implementing the Prolly tree data structure.
- **bun:test** — Bun's native test framework providing `describe`, `it`, `expect`, `beforeEach`, and `mock` utilities.
