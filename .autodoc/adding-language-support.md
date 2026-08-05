# Adding New Language Support

This guide describes every step required to add support for a new programming language (parser) to UltraCode. The system has **10+ files** with language-specific registrations, all of which must be updated.

> **Example language used throughout**: `elixir` (files: `.ex`, `.exs`; project indicator: `mix.exs`).

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Step 1: Register the Language Type](#step-1-register-the-language-type)
3. [Step 2: Add File Extension Mappings](#step-2-add-file-extension-mappings)
4. [Step 3: Create Language Configuration](#step-3-create-language-configuration)
5. [Step 4: Implement the Parser](#step-4-implement-the-parser)
6. [Step 5: Register in UnifiedParser](#step-5-register-in-unifiedparser)
7. [Step 6: Register in Analyzer Loader (Worker)](#step-6-register-in-analyzer-loader-worker)
8. [Step 7: Configure Worker Pool](#step-7-configure-worker-pool)
9. [Step 8: Add Project Type Detection](#step-8-add-project-type-detection)
10. [Complete Checklist](#complete-checklist)
11. [Testing](#testing)

---

## 1. Architecture Overview

```
File on disk
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│  Extension Mappings (5 files)                           │
│  ".ex" → "elixir"                                       │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│  Language Config (keywords, node types, extractors)     │
│  src/parsers/language-configs/<category>/elixir.ts      │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│  Native Parser (implements BaseParser)                  │
│  src/parsers/elixir-native-parser.ts                    │
└───────────────────────┬─────────────────────────────────┘
                        │
            ┌───────────┴───────────┐
            ▼                       ▼
┌────────────────────┐   ┌────────────────────┐
│  UnifiedParser     │   │  Analyzer Loader   │
│  (direct parsing)  │   │  (worker threads)  │
└────────────────────┘   └────────────────────┘
```

The parser can be invoked in two contexts:
- **UnifiedParser** — direct in-process parsing (used during `initializeForWorkspace`)
- **Analyzer Loader** — inside worker threads (used by `LanguageWorkerPool` for parallel parsing)

---

## Step 1: Register the Language Type

### File: `src/types/parser.ts` (line ~28)

Add the language identifier to `SUPPORTED_LANGUAGES`:

```typescript
export const SUPPORTED_LANGUAGES = [
  "javascript",
  "typescript",
  // ... existing 22 languages ...
  "zig",
  "helm",
  "elixir",  // ← ADD HERE
] as const;
```

The `SupportedLanguage` type is derived automatically from this array:

```typescript
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];
```

---

## Step 2: Add File Extension Mappings

There are **5 files** that map file extensions to language identifiers. All must be updated.

> **Note**: `src/agents/parser-agent.ts` imports `detectLanguage` from `src/agents/workers/language-detection.ts` (single source of truth). No changes needed in parser-agent.ts.

### 2.1 `src/parsers/language-configs/shared/keywords.ts` (line ~12)

```typescript
export const FILE_EXTENSIONS: Record<string, SupportedLanguage> = {
  // ... existing ...
  ex: "elixir",
  exs: "elixir",
};
```

> Note: Extensions here are **without the dot**.

### 2.2 `src/agents/workers/language-detection.ts` (line ~12, ~65)

```typescript
export const LANGUAGE_MAP: Record<string, string> = {
  // ... existing ...
  ".ex": "elixir",
  ".exs": "elixir",
};
```

Also add `"elixir"` to the `SUPPORTED_LANGUAGES` array in the same file (line ~65).

> Note: Extensions here are **with the dot**.

### 2.3 `src/agents/dev/file-extensions.ts` (line ~12)

```typescript
export const SUPPORTED_CODE_EXTENSIONS = [
  // ... existing ...
  ".ex", ".exs",   // Elixir
] as const;
```

### 2.4 `src/agents/dev/heuristic-parser.ts` (line ~14)

```typescript
const EXTENSION_LANGUAGE_MAP: Record<string, SupportedLanguage> = {
  // ... existing ...
  ".ex": "elixir",
  ".exs": "elixir",
};
```

### 2.5 `src/parsers/unified-parser.ts` (line ~40)

```typescript
const EXTENSION_TO_LANGUAGE: Record<string, SupportedLanguage> = {
  // ... existing ...
  ".ex": "elixir",
  ".exs": "elixir",
};
```

And define the extension set (line ~86):

```typescript
const ELIXIR_EXTENSIONS = new Set([".ex", ".exs"]);
```

---

## Step 3: Create Language Configuration

### 3.1 Choose the category folder

Place your config in the appropriate subfolder under `src/parsers/language-configs/`:

| Folder | Languages |
|--------|-----------|
| `compiled-languages/` | C, C++, C#, Go, Java, Kotlin, Rust, Swift, Zig |
| `javascript-family/` | JavaScript, JSX, TypeScript, TSX |
| `scripting-languages/` | Bash, Batch, PowerShell, Python |
| `markup-languages/` | CSS, HTML, JSON, XML |
| `infrastructure/` | Helm |

For Elixir → ~~`scripting-languages/elixir.ts`~~ (deleted).

### 3.2 Create the config file

Implement the `LanguageConfig` interface from `src/parsers/language-configs/shared/types.ts`:

```typescript
// src/parsers/language-configs/scripting-languages/elixir.ts

import { LANGUAGE_KEYWORDS } from "../shared/keywords.js";
import type { LanguageConfig } from "../shared/types.js";

export const ELIXIR_CONFIG: LanguageConfig = {
  language: "elixir",
  extensions: ["ex", "exs"],
  keywords: LANGUAGE_KEYWORDS.elixir,
  nodeTypes: {
    functions: ["function_definition"],
    classes: ["module_definition"],
    methods: ["function_definition"],
    imports: ["import_statement", "use_statement", "alias_statement"],
    exports: ["defdelegate"],
    variables: ["match_expression"],
    types: ["type_spec", "typep_spec"],
    interfaces: ["behaviour_definition", "protocol_definition"],
  },
  extractors: {
    extractName: () => ["identifier"],
    extractModifiers: () => ["def", "defp", "defmacro", "defmacrop"],
    extractParameters: true,
    extractReturnType: false,  // Elixir uses dynamic typing
    extractReferences: true,
  },
};
```

**`NodeTypeConfig` fields:**

| Field | Description | Examples |
|-------|-------------|---------|
| `functions` | Top-level function declarations | `def`, `defp` |
| `classes` | Class-like constructs | `defmodule` |
| `methods` | Methods inside classes | `def` inside `defmodule` |
| `imports` | Import statements | `import`, `use`, `alias`, `require` |
| `exports` | Export declarations | `defdelegate`, public functions |
| `variables` | Variable declarations | `=` (match operator) |
| `types` | Type definitions | `@type`, `@typep` |
| `interfaces` | Interface-like constructs | `@behaviour`, `defprotocol` |

### 3.3 Add keywords

In `src/parsers/language-configs/shared/keywords.ts` (line ~108), add an entry to `LANGUAGE_KEYWORDS`:

```typescript
export const LANGUAGE_KEYWORDS: Record<SupportedLanguage, { ... }> = {
  // ... existing languages ...
  elixir: {
    functions: ["def", "defp", "defmacro", "defmacrop", "defguard", "defguardp"],
    classes: ["defmodule"],
    variables: ["="],
    types: ["@type", "@typep", "@opaque", "@spec", "@callback"],
    control: ["if", "unless", "case", "cond", "with", "for", "receive", "try"],
    async: ["Task.async", "spawn", "send", "receive"],
    decorators: ["@moduledoc", "@doc", "@spec", "@behaviour"],
    accessModifiers: ["defp"],
  },
};
```

### 3.4 Register in category index

Add the export to the category's `index.ts`:

```typescript
// src/parsers/language-configs/scripting-languages/index.ts
export { ELIXIR_CONFIG } from "./elixir.js";
```

### 3.5 Register in the global registry

In `src/parsers/language-configs/registry.ts`:

1. Add to the import:

```typescript
import { BASH_CONFIG, BATCH_CONFIG, ELIXIR_CONFIG, POWERSHELL_CONFIG, PYTHON_CONFIG }
  from "./scripting-languages/index.js";
```

2. Add to `LANGUAGE_CONFIGS` (line ~31):

```typescript
export const LANGUAGE_CONFIGS: Record<SupportedLanguage, LanguageConfig> = {
  // ... existing ...
  elixir: ELIXIR_CONFIG,
};
```

---

## Step 4: Implement the Parser

### 4.1 The `BaseParser` interface

All parsers must implement `BaseParser` from `src/parsers/base-parser.ts`:

```typescript
export interface BaseParser {
  initialize(): Promise<void>;
  supportsFile(filePath: string): boolean;
  parse(filePath: string, content: string, contentHash: string): Promise<ParseResult>;
  parseIncremental(filePath: string, content: string, contentHash: string, edits: unknown[]): Promise<ParseResult>;
  getStats(): ParserStats;
  clearCache(): void;
}
```

### 4.2 Parser approaches

The project uses several parsing strategies. Choose based on your language:

| Strategy | Used by | Pros | Cons |
|----------|---------|------|------|
| **Regex-based** | Zig, Bash, PowerShell, Go, C/C++ | No dependencies, fast, cross-platform | Less precise AST |
| **Native CLI subprocess** | Python (`python -c`), Java (Chevrotain) | Full language accuracy | Requires runtime installed |
| **TypeScript Compiler API** | TypeScript/JavaScript | Perfect AST | Only for TS/JS |
| **ANTLR grammar** | Kotlin (alternative), Rust (alternative) | Formal grammar | Slower, needs warmup |

**Recommended for most languages: Regex-based** — no external dependencies, works on all platforms.

### 4.3 Create the parser file

```typescript
// src/parsers/elixir-native-parser.ts

import { log } from "../logging/index.js";
import type { EntityRelationship, ParsedEntity, ParseResult, SupportedLanguage } from "../types/parser.js";
import type { BaseParser, ParserStats } from "./base-parser.js";

export class ElixirNativeParser implements BaseParser {
  private stats: ParserStats = {
    filesParsed: 0,
    cacheHits: 0,
    cacheMisses: 0,
    avgParseTimeMs: 0,
    totalParseTimeMs: 0,
    throughput: 0,
    cacheMemoryMB: 0,
    errorCount: 0,
  };

  async initialize(): Promise<void> {
    log.i("ELIXIR", "parser_init");
    // Optionally check for Elixir/Erlang runtime availability
  }

  supportsFile(filePath: string): boolean {
    return filePath.endsWith(".ex") || filePath.endsWith(".exs");
  }

  async parse(filePath: string, content: string, contentHash: string): Promise<ParseResult> {
    const startTime = Date.now();
    const entities: ParsedEntity[] = [];
    const relationships: EntityRelationship[] = [];
    const errors: Array<{ message: string; location?: { line: number; column: number } }> = [];

    try {
      // --- Implement parsing logic here ---
      // Extract modules, functions, macros, imports, etc.
      // Use regex patterns or subprocess to parse Elixir code

    } catch (error) {
      errors.push({ message: error instanceof Error ? error.message : String(error) });
      this.stats.errorCount++;
    }

    const parseTimeMs = Date.now() - startTime;
    this.stats.filesParsed++;
    this.stats.totalParseTimeMs += parseTimeMs;
    this.stats.avgParseTimeMs = this.stats.totalParseTimeMs / this.stats.filesParsed;

    return {
      filePath,
      language: "elixir" as SupportedLanguage,
      entities,
      relationships,
      contentHash,
      timestamp: Date.now(),
      parseTimeMs,
      errors,
    };
  }

  async parseIncremental(
    filePath: string,
    content: string,
    contentHash: string,
    _edits: unknown[],
  ): Promise<ParseResult> {
    // Most regex-based parsers simply do a full re-parse
    return this.parse(filePath, content, contentHash);
  }

  getStats(): ParserStats {
    return { ...this.stats };
  }

  clearCache(): void {
    // Clear any internal caches if applicable
  }
}
```

### 4.4 `ParseResult` structure

The parser must return `ParseResult` (from `src/types/parser.ts`):

```typescript
interface ParseResult {
  filePath: string;
  language: SupportedLanguage;
  entities: ParsedEntity[];         // Functions, classes, variables, etc.
  relationships?: EntityRelationship[];  // calls, imports, extends, etc.
  contentHash: string;
  timestamp: number;
  parseTimeMs: number;
  errors: Array<{ message: string; location?: { line: number; column: number } }>;
}
```

Each `ParsedEntity` should have:

```typescript
interface ParsedEntity {
  id?: string;           // Unique entity ID (auto-generated if omitted)
  name: string;          // Entity name
  type: string;          // "function" | "class" | "method" | "variable" | "interface" | "module" | ...
  filePath: string;      // Source file path
  language?: string;     // Language identifier
  location: {
    start: { line: number; column: number; index: number };
    end: { line: number; column: number; index: number };
  };
  modifiers?: string[];  // "public", "private", "async", "static", etc.
  parameters?: Array<{ name: string; type?: string }>;
  returnType?: string;
  body?: string;         // Code body (optional, for semantic indexing)
}
```

---

## Step 5: Register in UnifiedParser

File: `src/parsers/unified-parser.ts`

### 5.1 Add lazy type import (line ~24)

```typescript
type ElixirParserType = typeof import("./elixir-native-parser.js").ElixirNativeParser;
```

### 5.2 Add parser property (line ~186)

```typescript
export class UnifiedParser implements BaseParser {
  // ... existing parsers ...
  private elixirParser: InstanceType<ElixirParserType> | null = null;
```

### 5.3 Add `ensure` method (after line ~380)

```typescript
private async ensureElixirParser(): Promise<void> {
  if (this.elixirParser) return;
  const { ElixirNativeParser } = await import("./elixir-native-parser.js");
  this.elixirParser = new ElixirNativeParser();
  await this.elixirParser.initialize();
  this.initializedParsers.add("elixir");
}
```

### 5.4 Add to `initializeForWorkspace()` switch (line ~242)

```typescript
case "elixir":
  initPromises.push(this.ensureElixirParser());
  break;
```

### 5.5 Add to `parse()` routing (line ~413)

```typescript
} else if (ELIXIR_EXTENSIONS.has(ext)) {
  await this.ensureElixirParser();
  result = await this.elixirParser!.parse(filePath, content, contentHash);
}
```

### 5.6 Add to `parseIncremental()` routing (line ~493)

```typescript
if (ELIXIR_EXTENSIONS.has(ext)) {
  await this.ensureElixirParser();
  return this.elixirParser!.parseIncremental(filePath, content, contentHash, edits);
}
```

### 5.7 Add to `getStats()` (line ~720)

```typescript
if (this.elixirParser) allStats.push(this.elixirParser.getStats());
```

### 5.8 Add to `clearCache()` (line ~749)

```typescript
this.elixirParser?.clearCache();
```

---

## Step 6: Register in Analyzer Loader (Worker)

File: `src/agents/workers/analyzer-loader.ts`

### 6.1 Add case to `createAnalyzer()` (line ~59)

```typescript
case "elixir": {
  const { workerLog } = await import("./worker-logging.js");
  workerLog("INFO", `Loading ElixirNativeParser`);
  const { ElixirNativeParser } = await import("../../parsers/elixir-native-parser.js");
  analyzer = new ElixirNativeParser();
  await analyzer.initialize();
  workerLog("INFO", `ElixirNativeParser initialized`);
  break;
}
```

### 6.2 Add to `SUPPORTED_WORKER_LANGUAGES` (line ~282)

```typescript
export const SUPPORTED_WORKER_LANGUAGES = [
  // ... existing ...
  "elixir",
] as const;
```

### 6.3 (Optional) Add warmup snippet if ANTLR-based

Only needed for parsers that use ANTLR and benefit from JIT warmup:

```typescript
const WARMUP_SNIPPETS: Record<string, string> = {
  // ... existing ...
  elixir: `defmodule Warmup do\n  def warmup, do: :ok\nend`,
};

const WARMUP_LANGUAGES = new Set(["kotlin", "rust", "elixir"]);
```

---

## Step 7: Configure Worker Pool

File: `src/agents/workers/language-worker-pool.ts`

### 7.1 Add pool size (line ~180)

```typescript
const defaultPoolSizes: Record<string, number> = {
  // ... existing ...
  elixir: Math.min(cpus().length, 2),  // Choose based on parser speed
};
```

### 7.2 Add timeout (line ~196)

```typescript
const defaultTimeouts: Record<string, number> = {
  // ... existing ...
  elixir: 25000,  // Choose based on parser complexity
};
```

**Guidelines for pool size and timeout:**

| Parser speed | Suggested pool size | Suggested timeout |
|-------------|--------------------|--------------------|
| Fast (<20ms/file) | `Math.min(cpus().length, 2)` | 20000ms |
| Medium (20-50ms/file) | `Math.min(cpus().length, 3)` | 30000ms |
| Slow (>50ms/file) | `Math.min(cpus().length, 4)` | 45000ms |

---

## Step 8: Add Project Type Detection

File: `src/parsers/unified-parser.ts`

### 8.1 Add `ProjectType` (line ~103)

```typescript
export type ProjectType =
  // ... existing ...
  | "elixir"   // mix.exs
  | "mixed"
  | "unknown";
```

### 8.2 Add project indicator file (line ~133)

```typescript
const checks: Array<{ file: string; type: ProjectType; langs: SupportedLanguage[] }> = [
  // ... existing ...
  { file: "mix.exs", type: "elixir", langs: ["elixir"] },
];
```

---

## Complete Checklist

Use this checklist when adding a new language. Replace `<lang>` with your language name and `<ext>` with file extensions.

### Type Registration
- [ ] Add `"<lang>"` to `SUPPORTED_LANGUAGES` in `src/types/parser.ts`

### Extension Mappings (5 files)
- [ ] `src/parsers/language-configs/shared/keywords.ts` → `FILE_EXTENSIONS` (without dot)
- [ ] `src/agents/workers/language-detection.ts` → `LANGUAGE_MAP` (with dot) + `SUPPORTED_LANGUAGES`
- [ ] `src/agents/dev/file-extensions.ts` → `SUPPORTED_CODE_EXTENSIONS`
- [ ] `src/agents/dev/heuristic-parser.ts` → `EXTENSION_LANGUAGE_MAP` (with dot)
- [ ] `src/parsers/unified-parser.ts` → `EXTENSION_TO_LANGUAGE` (with dot) + `<LANG>_EXTENSIONS` Set

> `src/agents/parser-agent.ts` imports `detectLanguage` from `language-detection.ts` — no separate update needed.

### Language Configuration
- [ ] Create ~~`src/parsers/language-configs/<category>/<lang>.ts`~~ (deleted) with `LanguageConfig`
- [ ] Add keywords to `LANGUAGE_KEYWORDS` in `src/parsers/language-configs/shared/keywords.ts`
- [ ] Export from ~~`src/parsers/language-configs/<category>/index.ts`~~ (deleted)
- [ ] Import and register in `src/parsers/language-configs/registry.ts` → `LANGUAGE_CONFIGS`

### Parser Implementation
- [ ] Create ~~`src/parsers/<lang>-native-parser.ts`~~ (deleted) implementing `BaseParser`

### UnifiedParser Registration (8 spots in 1 file)
- [ ] Lazy type import
- [ ] Parser property in class
- [ ] `ensure<Lang>Parser()` method
- [ ] `initializeForWorkspace()` switch case
- [ ] `parse()` routing
- [ ] `parseIncremental()` routing
- [ ] `getStats()` aggregation
- [ ] `clearCache()` call

### Worker Registration
- [ ] `createAnalyzer()` case in `src/agents/workers/analyzer-loader.ts`
- [ ] `SUPPORTED_WORKER_LANGUAGES` array in `src/agents/workers/analyzer-loader.ts`

### Worker Pool Config
- [ ] `defaultPoolSizes` in `src/agents/workers/language-worker-pool.ts`
- [ ] `defaultTimeouts` in `src/agents/workers/language-worker-pool.ts`

### Project Detection
- [ ] `ProjectType` union in `src/parsers/unified-parser.ts`
- [ ] Project indicator file in `checks` array in `src/parsers/unified-parser.ts`

### Testing
- [ ] Unit tests for the parser
- [ ] Integration test with sample files
- [ ] Verify indexing works end-to-end

**Total: ~20 registration points across 10+ files.**

---

## Testing

### Unit test for the parser

Create ~~`tests/parsers/elixir-native-parser.test.ts`~~ (deleted):

```typescript
import { describe, it, expect, beforeAll } from "bun:test";
import { ElixirNativeParser } from "../../src/parsers/elixir-native-parser.js";

describe("ElixirNativeParser", () => {
  let parser: ElixirNativeParser;

  beforeAll(async () => {
    parser = new ElixirNativeParser();
    await parser.initialize();
  });

  it("should parse a module", async () => {
    const result = await parser.parse(
      "test.ex",
      `defmodule MyApp.User do\n  def name(user), do: user.name\nend`,
      "hash123",
    );
    expect(result.entities.length).toBeGreaterThan(0);
    expect(result.entities.some(e => e.type === "class" || e.type === "module")).toBe(true);
  });

  it("should parse functions", async () => {
    const result = await parser.parse(
      "test.ex",
      `def greet(name), do: "Hello #{name}"`,
      "hash456",
    );
    expect(result.entities.some(e => e.type === "function")).toBe(true);
  });
});
```

### Integration verification

1. Build: `npm run build`
2. Index a project with files of the new language
3. Verify entities appear in `semantic_search` and `get_members` results

---

## Related Documents

- [Architecture](./architecture.md) — system overview
- [Processes](./processes.md) — development processes
- [Dependencies](./dependencies.md) — external dependencies
