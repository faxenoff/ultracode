# Language Parsers — Полнота поддержки

Детальное описание возможностей парсеров для каждого языка. Все парсеры извлекают сущности, связи, control flow и метрики сложности через единый интерфейс `ParseResult`.

> Ссылка из README → [Language Support](#language-support)

---

## Tier 1: Full Semantic Analysis

Языки с выделенным компилятором/парсером, полным type resolution и cross-file analysis.

### TypeScript / JavaScript

**Парсер:** `typescript-parser.ts` (332 LOC) + 6 экстракторов (`ts-class-extractor`, `ts-function-extractor`, `ts-control-flow-extractor`, `ts-js-patterns-extractor`, и др.)
**Технология:** TS Compiler API (полный type checker)
**Файлы:** `.ts`, `.tsx`, `.mts`, `.cts`, `.js`, `.jsx`, `.mjs`, `.cjs`

| Возможность | Поддержка |
|------------|-----------|
| Entities | functions, arrow functions, generators, classes, abstract classes, methods, variables, type aliases, interfaces, enums, namespaces |
| Relationships | imports (ES/CJS), calls, extends, implements, references |
| Control Flow | branches (if/switch/ternary), loops (for/while/do), exceptions (try/catch/finally), returns, awaits |
| Types | Full type inference, generics, union/intersection, type guards |
| Frameworks | Angular (components, directives, pipes, DI), NgRx (store, actions, effects, selectors), React (hooks, JSX) |
| Metrics | Cyclomatic complexity, cognitive complexity, documentation status |

**Уникальное:** OXC fast-parser (Rust, ~10x быстрее tsc) для первого прохода, multipass-orchestrator для deep analysis.

---

### C\#

**Парсер:** Roslyn addon (`roslyn/`)
**Технология:** .NET Roslyn Compiler (полный semantic model)
**Файлы:** `.cs`

| Возможность | Поддержка |
|------------|-----------|
| Entities | classes, structs, records, interfaces, enums, methods, properties, fields, events, delegates, namespaces |
| Relationships | using imports, calls, extends, implements, references |
| Control Flow | branches, loops, exceptions, returns, awaits (async/await) |
| Types | Full type resolution через Roslyn semantic model, generics, nullable reference types |
| Metrics | Cyclomatic complexity, documentation (XML docs) |

**Уникальное:** Roslyn-addon — отдельный .NET процесс, взаимодействие через JSON IPC.

---

### Python

**Парсер:** `python/` directory — `layer1-basic.ts` + extractors (`controlflow-extractor.ts`, и др.)
**Технология:** Regex + AST heuristics, опциональная интеграция с Pyright
**Файлы:** `.py`, `.pyi`

| Возможность | Поддержка |
|------------|-----------|
| Entities | functions, async functions, classes, methods, variables, decorators, type aliases |
| Relationships | imports (absolute/relative), calls, extends (inheritance), references |
| Control Flow | branches (if/elif/match), loops (for/while), exceptions (try/except/finally), returns, awaits |
| Types | Type hints, generics (PEP 585/604), Pyright integration for full inference |
| Frameworks | Django, Flask, FastAPI — endpoint detection |
| Metrics | Cyclomatic complexity, documentation (docstrings) |

---

### Java

**Парсер:** `java-antlr-parser.ts` + `java/extractors/` (unified-extractor, complexity-analyzer, control-flow-extractor)
**Технология:** ANTLR4 Java20 grammar (full syntax parsing)
**Файлы:** `.java`

| Возможность | Поддержка |
|------------|-----------|
| Entities | classes, interfaces, enums, records, methods, constructors, fields, annotations |
| Relationships | imports, calls, extends, implements, references |
| Control Flow | branches (if/switch/ternary), loops (for/while/do/enhanced-for), exceptions (try/catch/finally/try-with-resources), returns |
| Types | Generics, bounded type parameters, wildcard types |
| Frameworks | Spring (annotations, DI), JPA |
| Metrics | Cyclomatic + cognitive complexity |

**Уникальное:** Chevrotain fallback parser для recovery при ANTLR errors.

---

### Kotlin

**Парсер:** `kotlin-antlr-parser.ts` + `kotlin/extractors/` (unified-extractor, complexity-analyzer, control-flow-extractor)
**Технология:** ANTLR4 Kotlin grammar
**Файлы:** `.kt`, `.kts`

| Возможность | Поддержка |
|------------|-----------|
| Entities | classes, data classes, sealed classes, objects, interfaces, functions, extension functions, properties, enums, annotations |
| Relationships | imports, calls, extends, implements, references |
| Control Flow | branches (if/when), loops (for/while/do), exceptions (try/catch/finally), returns |
| Types | Generics, nullable types, type aliases |
| Frameworks | Kotlin coroutines (suspend, launch, async), Ktor, Android |
| Metrics | Cyclomatic + cognitive complexity |

---

## Tier 2: Rich Extraction (regex/native, без type inference)

Полное извлечение сущностей, связей, control flow и complexity — но без cross-file type resolution.

### Swift

**Парсер:** `swift-native-parser.ts` (1342 LOC)
**Технология:** Regex-based (не SwiftSyntax — не требует Swift toolchain)
**Файлы:** `.swift`

| Возможность | Поддержка |
|------------|-----------|
| Entities | classes, structs, enums, protocols, actors, extensions, functions, initializers, properties, typealias, **@State/@Published/@Binding wrappers** |
| Relationships | imports, calls, **extends (class inheritance) + implements (protocol conformance) — разделены**, contains |
| Control Flow | branches (if, guard, switch), loops (for-in, while), exceptions (do/catch), returns, awaits |
| Types | Partial — return types, parameter types, property types (из сигнатур, без inference) |
| Metrics | Cyclomatic complexity (из control flow) |

**Уникальное:** Различает class inheritance и protocol conformance (parseInheritanceInfo). Извлекает SwiftUI property wrappers (@State, @Published, @StateObject, @ObservedObject, @EnvironmentObject, @Binding, @Observable).

---

### Zig

**Парсер:** `zig-native-parser.ts` (1154 LOC)
**Технология:** Regex-based (не требует Zig toolchain)
**Файлы:** `.zig`, `.zon`

| Возможность | Поддержка |
|------------|-----------|
| Entities | functions, structs, enums, unions, error sets, constants, variables, **test blocks, comptime blocks**, methods (в struct body) |
| Relationships | imports (@import), calls (включая @builtins), contains |
| Control Flow | branches (if/switch), loops (for/while), exceptions (catch/errdefer), returns |
| Types | Partial — return types, parameter types, const types (из сигнатур) |
| Modifiers | pub, export, extern, inline, comptime |
| Metrics | Cyclomatic complexity (из control flow) |

**Уникальное:** Извлекает Zig-специфичные конструкции: test blocks, comptime blocks, @builtins (@import, @intCast и др.), error sets, packed/extern structs.

---

### Go

**Парсер:** `go-native-parser.ts` + `go-ast-cli.go` (скомпилированный Go binary)
**Технология:** go/parser + go/ast (нативный Go AST)
**Файлы:** `.go`

| Возможность | Поддержка |
|------------|-----------|
| Entities | functions, methods, structs, interfaces, type aliases, constants, variables |
| Relationships | imports, calls, implements (interface satisfaction), contains |
| Control Flow | branches (if/switch/select), loops (for/range), exceptions (defer/recover), returns, goroutines (go) |
| Types | Partial — из сигнатур |
| Metrics | Cyclomatic complexity |

---

### Rust

**Парсер:** `rust-native-parser.ts` + ANTLR fallback
**Технология:** Regex + ANTLR4 Rust grammar
**Файлы:** `.rs`

| Возможность | Поддержка |
|------------|-----------|
| Entities | functions, structs, enums, traits, impl blocks, type aliases, constants, modules, macros |
| Relationships | use imports, calls, implements (impl Trait for Type), contains |
| Control Flow | branches (if/match), loops (for/while/loop), exceptions (Result/?), returns |
| Types | Partial — generics, lifetime annotations, trait bounds |
| Metrics | Cyclomatic complexity |

---

### C / C++

**Парсер:** `cpp-native-parser.ts` + `c-analyzer.ts` / `cpp-analyzer.ts`
**Технология:** Regex + optional clang AST dump
**Файлы:** `.c`, `.h`, `.cpp`, `.hpp`, `.cc`, `.cxx`

| Возможность | Поддержка |
|------------|-----------|
| Entities | functions, classes, structs, namespaces, templates, enums, typedefs, macros, global variables |
| Relationships | #include, calls, extends (inheritance), contains |
| Control Flow | branches, loops, exceptions (try/catch) |
| Types | Partial — templates, const/pointer qualifiers |
| Metrics | Cyclomatic complexity |

**Уникальное:** Специальные утилиты для C++ template parsing и declarator resolution.

---

## Tier 3: Entity Extraction

Извлечение сущностей и связей. Control flow — через отдельный analyzer (tree-sitter).

### Bash / Shell

**Парсер:** `bash-native-parser.ts` (384 LOC) + `bash-analyzer.ts` (420 LOC)
**Технология:** shfmt AST (если доступен) + regex fallback; tree-sitter-bash для analyzer
**Файлы:** `.sh`, `.bash`, `.zsh`, `.bashrc`, `.zshrc`, `.profile`

| Возможность | Поддержка |
|------------|-----------|
| Entities | functions, variables (declare/local/export), source/import, commands, pipelines |
| Relationships | calls, imports (source), contains |
| Control Flow | if/while/for/case (через bash-analyzer с tree-sitter) |
| Validation | Undefined variables, dangerous patterns (rm -rf, eval), unquoted variables, best practices (set -e) |

**Два пути парсинга:**
1. **shfmt -tojson** (если установлен) — полный AST, точные позиции
2. **Regex fallback** — работает без зависимостей

---

### PowerShell

**Парсер:** `powershell-analyzer.ts`
**Технология:** tree-sitter-powershell
**Файлы:** `.ps1`, `.psm1`, `.psd1`

| Возможность | Поддержка |
|------------|-----------|
| Entities | functions, filters, classes (PS 5.0+), enums, variables, cmdlets |
| Relationships | Import-Module, calls, contains |
| Validation | Invoke-Expression security, hardcoded credentials, approved verbs |

---

### Batch / CMD

**Парсер:** `batch-analyzer.ts`
**Технология:** Regex-based
**Файлы:** `.bat`, `.cmd`

| Возможность | Поддержка |
|------------|-----------|
| Entities | labels, CALL targets, variables (SET/SETX), control flow (IF/FOR) |
| Relationships | GOTO, CALL |
| Validation | Unused labels, dangerous commands, ERRORLEVEL patterns |

---

## Infrastructure Languages

### Helm Charts

**Парсер:** `helm-parser.ts`
**Файлы:** `.tpl`, `Chart.yaml`, `values.yaml`

| Возможность | Поддержка |
|------------|-----------|
| Entities | named templates (define), chart metadata, value keys, template variables |
| Relationships | include/template calls, dependencies (Chart.yaml) |
| Control Flow | if/else, range, with |

---

### JSON / YAML / OpenAPI

**Парсер:** `json-parser.ts` + Swagger integration
**Файлы:** `.json`, `.yaml`, `.yml`

| Возможность | Поддержка |
|------------|-----------|
| Entities | OpenAPI paths, schemas, parameters, responses |
| Relationships | $ref references, schema composition (allOf/oneOf/anyOf) |

---

## Сводная таблица

| Язык | Технология | Entities | Relationships | Control Flow | Types | Complexity |
|------|-----------|----------|--------------|-------------|-------|-----------|
| TypeScript | TS Compiler + OXC | Full | Full | Full | Full inference | Full |
| JavaScript | TS Compiler + OXC | Full | Full | Full | Partial | Full |
| C# | Roslyn | Full | Full | Full | Full inference | Full |
| Python | Regex + Pyright | Full | Full | Full | Hints + Pyright | Full |
| Java | ANTLR4 | Full | Full | Full | Generics | Full |
| Kotlin | ANTLR4 | Full | Full | Full | Generics + nullable | Full |
| Swift | Regex (1342 LOC) | Full + SwiftUI | Full + inheritance/protocol split | Full | From signatures | Full |
| Zig | Regex (1154 LOC) | Full + test/comptime | Imports + calls | Full | From signatures | Full |
| Go | go/parser binary | Full | Full | Full + goroutines | From signatures | Full |
| Rust | Regex + ANTLR | Full + macros | Full | Full | Generics + lifetimes | Full |
| C/C++ | Regex + clang | Full + templates | Full | Full | Templates | Full |
| Bash | shfmt/regex + tree-sitter | Functions + vars | Calls + source | Via analyzer | — | — |
| PowerShell | tree-sitter | Functions + cmdlets | Imports + calls | Via analyzer | — | — |
| Batch | Regex | Labels + vars | GOTO + CALL | — | — | — |

---

**Version:** 6.3.0
**Updated:** 2026-03-06
