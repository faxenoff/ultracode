# kotlin-k2-cli

## Overview

This module provides a Kotlin K2 compiler-based parser that extracts structural metadata from Kotlin source files via CLI. It parses Kotlin declarations (classes, objects, functions, properties, type aliases) and collects information about calls, modifiers, and source locations. The K2Parser class acts as the core analysis engine, while K2Cli orchestrates the parsing workflow from command-line arguments.

## Flow

```
CLI Input (args)
    ↓
initialize K2Parser (compiler context)
    ↓
parse Kotlin files (AST traversal)
    ↓
processDeclaration → process specific types
    ├── processClass (members, inheritance, modifiers)
    ├── processObject (companion objects, body)
    ├── processFunction (signature, calls, receiver type)
    ├── processProperty (accessors, modifiers)
    └── processTypeAlias (target type)
    ↓
extractCalls (call expressions, receivers)
extractModifiers (visibility, variance, etc.)
getLocation (source file positions)
    ↓
Output: Structured Kotlin metadata (JSON/console)
```

## Entity Listing

### Main Entry Point

- **main** — `K2Cli.kt:26-80` — Entry point that parses command-line arguments and initiates the parsing workflow.
- **handleParse** — `K2Cli.kt:82-110` — Processes parsed arguments and orchestrates file discovery and K2Parser execution.

### K2Parser Core

- **K2Parser** — `K2Parser.kt:23-521` — Main Kotlin K2 compiler-based parser class that analyzes source files and extracts structural metadata.

### Parser Lifecycle

- **initialize** — `K2Parser.kt:28-46` — Initializes the K2 compiler environment and creates the analysis context.
- **dispose** — `K2Parser.kt:48-53` — Cleans up compiler resources and releases memory allocated during parsing.

### Parsing Pipeline

- **parse** — `K2Parser.kt:55-120` — Orchestrates traversal of the AST and routes declarations to appropriate processing functions.
- **processDeclaration** — `K2Parser.kt:122-138` — Routes FIR declarations to type-specific processors (class, object, function, property, type alias).

### Declaration Processors

- **processClass** — `K2Parser.kt:140-233` — Extracts class metadata including members, base classes, modifiers, and nested declarations.
- **processObject** — `K2Parser.kt:235-284` — Extracts object metadata including companion objects, delegates, and body members.
- **processFunction** — `K2Parser.kt:286-329` — Extracts function signature, receiver type, calls, and modifier information.
- **processProperty** — `K2Parser.kt:331-379` — Extracts property accessors, modifiers, receiver type, and delegate information.
- **processTypeAlias** — `K2Parser.kt:381-400` — Extracts type alias targets and right-hand side type information.

### Analysis Utilities

- **extractCalls** — `K2Parser.kt:402-431` — Extracts function and method calls from expressions.
- **visitCallExpression** — `K2Parser.kt:409-429` — Visits call expression nodes to collect receiver and argument information.
- **extractModifiers** — `K2Parser.kt:433-470` — Extracts visibility, variance, mutability, and other declaration modifiers.
- **getLocation** — `K2Parser.kt:472-503` — Retrieves source file position (file path, line, column) for declarations.

### Type Analysis

- **isPrimitive** — `K2Parser.kt:505-510` — Determines if a type represents a Kotlin primitive (Int, String, Boolean, etc.).
- **isKotlinKeyword** — `K2Parser.kt:512-520` — Checks if an identifier is a reserved Kotlin keyword.

## Dependencies

**Key Internal Dependencies:**
- FIR (Fully Isolated Representation) — K2 compiler's intermediate representation
- K2 Analysis API — Compiler context and session management
- Kotlin Compiler Foundation — Core compiler infrastructure

**Key External Dependencies:**
- Kotlin K2 Compiler libraries (org.jetbrains.kotlin.*)
- Standard Kotlin/JVM libraries