# __mocks__

## 🤖 Overview

The `src/__mocks__` module is a collection of mock implementations for testing purposes. It contains three files: `connection-pool.cjs`, `nanoid.cjs`, and `p-limit.cjs`, each providing mock functionalities for database connections, unique ID generation, and parallel task execution, respectively. These mocks are used by developers to simulate real-world scenarios without relying on actual services or databases.

## 🤖 Architecture

```
  +-------------------+
  | connection-pool.cjs |
  |     (mocks DB connections) |
  +-------------------+
           |
           v
  +-------------------+
  | nanoid.cjs        |
  |     (mocks ID generation) |
  +-------------------+
           |
           v
  +-------------------+
  | p-limit.cjs       |
  |     (mocks parallel tasks) |
  +-------------------+
```

## 🤖 Flow

```
  +-------------------+
  | p-limit.cjs       |
  |     (mocks parallel tasks) |
  +-------------------+
           |
           v
  +-------------------+
  | nanoid.cjs        |
  |     (mocks ID generation) |
  +-------------------+
           |
           v
  +-------------------+
  | connection-pool.cjs |
  |     (mocks DB connections) |
  +-------------------+
```

## 🤖 Entity Listing

### Function
- **customAlphabet** — Creates a function to generate a random string using a custom character set `nanoid.cjs:12-20`
- **nanoid** — Generates a random string of a specified length using a default character set `nanoid.cjs:5-10`
- **nanoidAsync** — Asynchronously generates a random string of a specified length using the default character set `nanoid.cjs:25-27`
- **pLimit** — A function that returns a new function with concurrency control `p-limit.cjs:1-5`
- **run** — An asynchronous function that executes a given function with its arguments `p-limit.cjs:2-2`
- **urlAlphabet** — Returns a function to generate a random string using the default character set, suitable for URLs `nanoid.cjs:22-24`

### Method
- **acquire** — Acquires a new connection from the pool, creating a new connection object and adding it to the pool `connection-pool.cjs:14-19`
- **constructor** — Initializes a new connection pool with configuration and an empty map for connections `connection-pool.cjs:4-8`
- **initialize** — Sets the connection pool to active state `connection-pool.cjs:10-12`
- **release** — Releases a connection back to the pool, marking it as not in use and updating its last used time `connection-pool.cjs:21-26`
- **shutdown** — Shuts down the connection pool by clearing all connections and setting the pool to inactive state `connection-pool.cjs:28-31`

### Class
- **ConnectionPool** — Represents a connection pool for managing database connections `connection-pool.cjs:3-32`

## Dependencies

**External dependencies mocked:**
- `node-postgres` / database driver (via `connection-pool`)
- `nanoid` (via `nanoid`)
- `p-limit` (via `p-limit`)

**Used by:**
- Test suites across the codebase that require database, ID generation, or concurrency operations

---

`★ Insight ─────────────────────────────────────`
Jest manual mocks use file naming conventions: placing files in `__mocks__` directories with the exact module name (e.g., `nanoid.cjs` mocks the `nanoid` package). Jest's module resolution automatically loads these when tests execute `jest.mock('nanoid')`, eliminating the need for explicit mock factory functions in test setup. This pattern is powerful for infrastructure modules where test speed and isolation matter more than integration testing.
`─────────────────────────────────────────────────`
