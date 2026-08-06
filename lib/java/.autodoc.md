# lib/java

## Overview
JavaParserWrapper is a command-line utility that parses Java source code and extracts structural entity information into JSON format. It uses the JavaParser library to build an Abstract Syntax Tree (AST) from Java source, then traverses the AST to identify programming constructs. The tool is designed as a reusable component for code analysis pipelines that require semantic understanding of Java code.

## Flow
```
Java Source Code (stdin)
        ↓
  JavaParser.parse() → CompilationUnit AST
        ↓
  extractEntities() → Structured entity data
        ↓
  toJson() → JSON serialization
        ↓
  JSON Output (stdout) or Error Report
```

## Entity listing

### Classes
- **JavaParserWrapper** `JavaParserWrapper.java:11-300` — Command-line entry point that reads Java source from stdin, parses it into an AST, extracts structural entities, serializes to JSON, and outputs results with error handling.

## Dependencies

### External Libraries
- **JavaParser** (`com.github.javaparser`) — AST parsing library for Java source code
  - `com.github.javaparser` — Core parser API
  - `com.github.javaparser.ast` — AST node base types
  - `com.github.javaparser.ast.body` — Declaration nodes (classes, methods, fields)
  - `com.github.javaparser.ast.type` — Type system representation
  - `com.github.javaparser.ast.expr` — Expression nodes
  - `com.github.javaparser.ast.visitor` — AST visitor pattern implementation

### Java Standard Library
- `java.util` — Collections framework (List, Map, ArrayList, HashMap)
- `java.io` — Stream I/O (BufferedReader, InputStreamReader)

### Design Patterns
- **Pipeline Architecture**: Sequential transformation stages (parse → extract → serialize → output)
- **Visitor Pattern**: Traversal of AST nodes during entity extraction