# tests/analysis

## 🤖 Overview

The `tests/analysis` module contains unit tests for Python custom detectors, focusing on identifying and validating patterns in Python code. These tests are used by developers to ensure that the detectors accurately flag potential issues in codebases.

## 🤖 Architecture

```
  +---------------------+
  |  Python Detectors   |
  |  (unit tests)       |
  +---------------------+
          |
          v
  +---------------------+
  |  Mock Entity Objects |
  |  (embeddingText, metadata) |
  +---------------------+
          |
          v
  +---------------------+
  |  Detector Functions |
  |  (checkAsyncioRunInLoop, ...) |
  +---------------------+
```

## 🤖 Flow

```
  +---------------------+
  |  Test Runner        |
  |  (bun:test)         |
  +---------------------+
          |
          v
  +---------------------+
  |  Test Case         |
  |  (checkAsyncioRunInLoop) |
  +---------------------+
          |
          v
  +---------------------+
  |  Mock Entity        |
  |  (embeddingText, metadata) |
  +---------------------+
          |
          v
  +---------------------+
  |  Detector Logic     |
  |  (checkAsyncioRunInLoop) |
  +---------------------+
          |
          v
  +---------------------+
  |  Test Result        |
  |  (pass/fail)        |
  +---------------------+
```

## 🤖 Entity Listing

### Function
- **crashFrame** — Represents a frame in a stacktrace with properties like function name, file path, line number, and whether it's an async frame `stacktrace-parsers.test.ts:129-129`
- **files** — Stores the file paths for Python pattern rules `python-rules.test.ts:226-226`
- **hintsRules** — Contains the rules for hinting in Python pattern validation `python-rules.test.ts:188-199`
- **ids** — Represents the unique identifiers for Python pattern rules `python-rules.test.ts:148-148`
- **makeEntity** — Creates a mock Entity object with specified overrides and embeddingText `python-detectors.test.ts:51-64`
- **makeParsed** — Creates a ParsedStacktrace object with specified error type and message `stacktrace-classifier.test.ts:11-19`

### Import_decl
- **../../src/analysis/patterns/detectors/python.js** — Imports `../../src/analysis/patterns/detectors/python.js`. `python-detectors.test.ts:9-46`
- **../../src/analysis/patterns/detectors/python.js** — Imports `../../src/analysis/patterns/detectors/python.js` from `../../src/analysis/patterns/detectors/python.js`. `python-rules.test.ts:13-13`
- **../../src/analysis/stacktrace/error-classifier** — Imports `../../src/analysis/stacktrace/error-classifier` from `../../src/analysis/stacktrace/error-classifier`. `stacktrace-classifier.test.ts:8-8`
- **../../src/analysis/stacktrace/parsers/dotnet-parser** — Imports `../../src/analysis/stacktrace/parsers/dotnet-parser` from `../../src/analysis/stacktrace/parsers/dotnet-parser`. `stacktrace-parsers.test.ts:9-9`
- **../../src/analysis/stacktrace/parsers/go-parser** — Imports `../../src/analysis/stacktrace/parsers/go-parser` from `../../src/analysis/stacktrace/parsers/go-parser`. `stacktrace-parsers.test.ts:10-10`
- **../../src/analysis/stacktrace/parsers/javascript-parser** — Imports `../../src/analysis/stacktrace/parsers/javascript-parser` from `../../src/analysis/stacktrace/parsers/javascript-parser`. `stacktrace-parsers.test.ts:11-11`
- **../../src/analysis/stacktrace/parsers/jvm-parser** — Imports `../../src/analysis/stacktrace/parsers/jvm-parser` from `../../src/analysis/stacktrace/parsers/jvm-parser`. `stacktrace-parsers.test.ts:12-12`
- **../../src/analysis/stacktrace/parsers/native-parser** — Imports `../../src/analysis/stacktrace/parsers/native-parser` from `../../src/analysis/stacktrace/parsers/native-parser`. `stacktrace-parsers.test.ts:13-13`
- **../../src/analysis/stacktrace/parsers/python-parser** — Imports `../../src/analysis/stacktrace/parsers/python-parser` from `../../src/analysis/stacktrace/parsers/python-parser`. `stacktrace-parsers.test.ts:14-14`
- **../../src/analysis/stacktrace/parsers/rust-parser** — Imports `../../src/analysis/stacktrace/parsers/rust-parser` from `../../src/analysis/stacktrace/parsers/rust-parser`. `stacktrace-parsers.test.ts:15-15`
- **../../src/analysis/stacktrace/parsers/zig-parser** — Imports `../../src/analysis/stacktrace/parsers/zig-parser` from `../../src/analysis/stacktrace/parsers/zig-parser`. `stacktrace-parsers.test.ts:16-16`
- **../../src/analysis/stacktrace/stacktrace-parser** — Imports `../../src/analysis/stacktrace/stacktrace-parser` from `../../src/analysis/stacktrace/stacktrace-parser`. `stacktrace-parsers.test.ts:17-17`
- **../../src/analysis/stacktrace/types** — Imports `../../src/analysis/stacktrace/types` from `../../src/analysis/stacktrace/types`. `stacktrace-classifier.test.ts:9-9`
- **../../src/types/storage.js** — Imports `../../src/types/storage.js` from `../../src/types/storage.js`. `python-detectors.test.ts:47-47`
- **bun:test** — Imports `bun:test` from `bun:test`. `python-detectors.test.ts:8-8`, `python-rules.test.ts:8-8`, `stacktrace-classifier.test.ts:7-7`, `stacktrace-parsers.test.ts:8-8`
- **node:fs** — Imports `node:fs` from `node:fs`. `python-rules.test.ts:9-9`
- **node:path** — Imports `node:path` from `node:path`. `python-rules.test.ts:10-10`
- **yaml** — YAML parsing and serialization. from `yaml`. `python-rules.test.ts:11-11`
- **zod** — Imports `zod` from `zod`. `python-rules.test.ts:12-12`

### Property
- **embeddingText** — Represents the text content of an entity, used in tests to check for specific patterns `python-detectors.test.ts:51-51`

## Dependencies

**Internal:**
- ~~`src/analysis/patterns/detectors/python.js`~~ (deleted) — Python anti-pattern detection functions (checkAssertTrueBool, checkDjangoSqlInjection, checkPdDataLeakage, etc.)
- ~~`src/analysis/stacktrace/classifier.ts`~~ (deleted) — Stacktrace classification engine
- `src/analysis/stacktrace/parsers/*` — Language-specific stacktrace parsers (JavaScript, Java, Python, etc.)
- ~~`src/types/storage.js`~~ (deleted) — Entity and EntityType type definitions

**External:**
- `zod` — Schema validation library for rule file parsing
