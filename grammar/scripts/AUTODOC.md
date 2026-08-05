# Module: grammar/scripts

## 🤖 Overview

This module provides scripts for downloading and generating code in Java, Kotlin, and Rust. Developers and maintainers of these languages can use the scripts to automate the process of downloading and generating code snippets, enhancing productivity and consistency in code generation.

## 🤖 Architecture

```
download-java.sh
    |
    v
download-kotlin.sh
    |
    v
download-rust.sh
    |
    v
generate-java.sh
    |
    v
generate-kotlin.sh
    |
    v
generate-rust.sh
```

## 🤖 Flow

```
download-java.sh
    |
    v
generate-java.sh
    |
    v
download-kotlin.sh
    |
    v
generate-kotlin.sh
    |
    v
download-rust.sh
    |
    v
generate-rust.sh
```

## 🤖 Entity Listing

### Variable
- **GRAMMAR_DIR** — Specifies the target directory for downloading Java ANTLR grammar files `download-java.sh:6-6`
- **GRAMMAR_DIR** — Specifies the target directory for downloading Kotlin ANTLR grammar files `download-kotlin.sh:7-7`
- **GRAMMAR_DIR** — Specifies the target directory for downloading Rust ANTLR grammar files `download-rust.sh:6-6`
- **GRAMMAR_DIR** — Points to the directory containing Java ANTLR grammar files `generate-java.sh:6-6`
- **GRAMMAR_DIR** — Specifies the directory containing Kotlin ANTLR grammar files `generate-kotlin.sh:7-7`
- **JAVA_GRAMMAR_BASE** — Holds the base URL for downloading Java ANTLR grammar files `download-java.sh:7-7`
- **KOTLIN_SPEC_BASE** — Defines the base URL for downloading Kotlin ANTLR grammar files `download-kotlin.sh:8-8`
- **OUTPUT_DIR** — Specifies the directory where generated TypeScript code will be saved `generate-java.sh:7-7`
- **OUTPUT_DIR** — Defines the directory where generated TypeScript code will be saved `generate-kotlin.sh:8-8`
- **PROJECT_ROOT** — Represents the root directory of the project `generate-java.sh:8-8`
- **PROJECT_ROOT** — Points to the root directory of the project `generate-kotlin.sh:9-9`
- **RUST_GRAMMAR_BASE** — Provides the base URL for downloading Rust ANTLR grammar files `download-rust.sh:7-7`
- **SCRIPT_DIR** — Stores the directory of the current script `download-java.sh:5-5`
- **SCRIPT_DIR** — Sets the directory of the current script `download-kotlin.sh:6-6`
- **SCRIPT_DIR** — Stores the directory path of the current script `download-rust.sh:5-5`, `generate-kotlin.sh:6-6`
- **SCRIPT_DIR** — Stores the directory path of the current script file `generate-java.sh:5-5`
