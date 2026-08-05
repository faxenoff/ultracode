# Stacktrace Parsers

## 🤖 Overview

The `src/analysis/stacktrace/parsers` module contains parsers for various programming languages, including C#, Go, JavaScript, JVM, Native, Python, Rust, and Zig. These parsers are used by developers to analyze and extract information from stacktraces, aiding in debugging and error analysis.

The parsers are designed to detect and parse stacktrace patterns specific to each language, providing structured data that can be further processed or displayed. They are essential tools for developers working with different programming languages to understand and resolve issues in their applications.

## 🤖 Architecture

```
  +---------------------+
  |     Language Parsers |
  |     (C#, Go, JS, JVM, Native, Python, Rust, Zig) |
  +---------------------+
  |         |
  |         v
  +---------------------+
  |     Stacktrace Parser |
  |     (Language-specific) |
  +---------------------+
  |         |
  |         v
  +---------------------+
  |     Parsed Stacktrace |
  |     (Language-specific) |
  +---------------------+
```

## 🤖 Flow

```
  +---------------------+
  |     Stacktrace Text |
  |     (Input)         |
  +---------------------+
  |         |
  |         v
  +---------------------+
  |     Language Parsers |
  |     (C#, Go, JS, JVM, Native, Python, Rust, Zig) |
  +---------------------+
  |         |
  |         v
  +---------------------+
  |     Stacktrace Parser |
  |     (Language-specific) |
  +---------------------+
  |         |
  |         v
  +----------------
  |     Parsed Stacktrace |
  |     (Language-specific) |
  +----------------+
```

## 🤖 Entity Listing

### Method
- **buildFrame** — Builds a stack frame from the parsed text `rust-parser.ts:90-121`
- **detect** — Detects .NET stacktrace patterns in the provided text and returns a confidence score `dotnet-parser.ts:20-27`
- **detect** — Detects the presence of Go stacktrace elements and returns a confidence score `go-parser.ts:29-34`
- **detect** — Detects JavaScript stacktrace patterns in the provided text `javascript-parser.ts:22-31`
- **detect** — Detects Java/Kotlin stacktrace patterns in the provided text `jvm-parser.ts:21-28`
- **detect** — Detects the type of stacktrace in the given text and returns a confidence score `native-parser.ts:29-35`
- **detect** — Detects Python tracebacks in the provided text and returns a confidence score `python-parser.ts:23-28`
- **detect** — Detects the presence of a Rust panic stacktrace in the given text `rust-parser.ts:27-32`
- **detect** — Detects Zig error traces and returns a confidence score `zig-parser.ts:26-30`
- **parse** — Parses the provided text to extract error type, message, and stack frames, returning a structured ParsedStacktrace object `dotnet-parser.ts:29-76`
- **parse** — Parses the text to extract error messages, goroutine information, and stack frames `go-parser.ts:36-100`
- **parse** — Parses the provided text to extract stacktrace frames and returns a parsed stacktrace object `javascript-parser.ts:33-82`
- **parse** — Parses the provided text into a ParsedStacktrace object `jvm-parser.ts:30-32`
- **parse** — Parses the text to extract stacktrace information, including error type, message, and frames `native-parser.ts:37-55`
- **parse** — Parses Python tracebacks to extract error type, message, and stack frames `python-parser.ts:30-66`
- **parse** — Parses the text to extract panic message and stack frames `rust-parser.ts:34-88`
- **parse** — Parses Zig error and panic traces into a structured format `zig-parser.ts:32-67`
- **parseASAN** — Parses ASAN-style stacktrace frames from the text `native-parser.ts:75-92`
- **parseGDB** — Parses GDB-style stacktrace frames from the text `native-parser.ts:57-73`
- **parseMacOS** — Parses macOS/LLDB-style stacktrace frames from the text `native-parser.ts:94-109`
- **parseSection** — Parses a section of the text into a ParsedStacktrace object, handling exception chains `jvm-parser.ts:34-91`

### Class
- **DotNetStacktraceParser** — Implements a parser for .NET stacktraces, detecting and parsing exception messages and stack frames `dotnet-parser.ts:17-77`
- **GoStacktraceParser** — Implements a parser for Go panic and goroutine stacktraces `go-parser.ts:26-101`
- **JavaScriptStacktraceParser** — Implements a parser for JavaScript/TypeScript stacktraces `javascript-parser.ts:19-83`
- **JvmStacktraceParser** — Implements a parser for Java/Kotlin stacktraces, detecting and parsing exception chains `jvm-parser.ts:18-92`
- **NativeStacktraceParser** — Implements a parser for C/C++/Swift native stacktraces, handling GDB, ASAN, and macOS/LLDB formats `native-parser.ts:26-110`
- **PythonStacktraceParser** — Implements a parser for Python tracebacks, detecting and parsing error messages and stack frames `python-parser.ts:20-67`
- **RustStacktraceParser** — Implements a parser for Rust panic stacktraces `rust-parser.ts:24-122`
- **ZigStacktraceParser** — Implements a parser for Zig error and panic traces `zig-parser.ts:23-68`

### Import_decl
- **../types.js** — Imports `../types.js` from `../types.js`. `dotnet-parser.ts:10-10`, `go-parser.ts:13-13`, `javascript-parser.ts:10-10`, `jvm-parser.ts:13-13`, `native-parser.ts:11-11`, `python-parser.ts:13-13`, `rust-parser.ts:12-12`, `zig-parser.ts:14-14`

### Property
- **language** — Sets the language to "csharp" `dotnet-parser.ts:18-18`
- **language** — Sets the language to "go" `go-parser.ts:27-27`
- **language** — Sets the language to "javascript" `javascript-parser.ts:20-20`
- **language** — Sets the language to "java" `jvm-parser.ts:19-19`
- **language** — Sets the language to "c/c++" `native-parser.ts:27-27`
- **language** — Sets the language to "python" `python-parser.ts:21-21`
- **language** — Sets the language to "rust" `rust-parser.ts:25-25`
- **language** — Sets the language to "zig" `zig-parser.ts:24-24`

## Language-Specific Parsers

- **`DotNetStacktraceParser`** (dotnet-parser.ts:12-77): Detects and parses .NET exception stacktraces into frames with file location metadata for C#, F#, and VB.NET.

- **`JvmStacktraceParser`** (jvm-parser.ts:15-92): Parses Java and Kotlin exception frames with recursive exception chain handling for multi-cause exceptions.

- **`JavaScriptStacktraceParser`** (javascript-parser.ts:12-83): Parses V8-style async-aware frames with source positions and async context information for JavaScript and TypeScript.

- **`PythonStacktraceParser`** (python-parser.ts:15-67): Parses Python exception frames with inverted index ordering from traceback format.

- **`GoStacktraceParser`** (go-parser.ts:10-13): Extracts goroutine context and panic frames from Go runtime dump format.

- **`RustStacktraceParser`** (rust-parser.ts:14-122): Extracts backtrace frames with crate, module, and type information from panic output.

- **`NativeStacktraceParser`** (native-parser.ts:13-110): Detects GDB, ASAN, and macOS formats for native C/C++/Swift code with address and symbol resolution.

- **`ZigStacktraceParser`** (zig-parser.ts:16-68): Parses Zig error traces with thread and function context information.

## Core Types and Interfaces

- **`LanguageStacktraceParser`** (types.js): Interface that all parsers implement, defining `detect(text): number` for format confidence scoring and `parse(text): ParsedStacktrace` for frame extraction.

- **`StackFrame`** (types.js): Normalized representation of a single stack frame containing file path, function name, line number, and optional column information.

- **`ParsedStacktrace`** (types.js): Container for parsed stacktrace output including exception type, message, and array of normalized `StackFrame` objects.

## Dependencies

### Internal

- `types.js` — Core interfaces (`LanguageStacktraceParser`) and types (`StackFrame`, `ParsedStacktrace`) for parser contracts and normalized output representation.

### External

- Standard TypeScript RegExp for pattern matching and text extraction.
- No third-party npm dependencies.

## Design Patterns

**Strategy Pattern**: Each parser implements `LanguageStacktraceParser` with `detect(text): number` and `parse(text): ParsedStacktrace` methods, enabling polymorphic selection based on detected format and graceful fallback handling.

**Confidence Scoring**: Detection methods return scores (0.0–1.0) from multiple pattern matches, allowing a dispatcher to select the highest-confidence parser when formats are ambiguous or overlapping.
