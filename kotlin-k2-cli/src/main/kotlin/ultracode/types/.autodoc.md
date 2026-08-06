# kotlin-k2-cli/src/main/kotlin/ultracode/types

## Overview

This module defines core data transfer objects (DTOs) for representing parsed Kotlin code entities extracted by the K2 compiler backend. It provides type-safe structures for capturing parsed commands, results, code locations, parameters, and relationships between code entities. These types serve as the common contract between the K2 parser and downstream analysis/indexing consumers, enabling semantic understanding of Kotlin code at the AST level.

## Entity Listing

### Core Message Types

- **Command** — `ParsedTypes.kt:5-11` — Represents a parsed command or action to be executed with associated metadata and parameters.
- **ParseResult** — `ParsedTypes.kt:13-21` — Encapsulates the outcome of parsing a Kotlin source file, including success/failure status and extracted entities.

### Entity Representation

- **ParsedEntity** — `ParsedTypes.kt:23-35` — Represents a single parsed code entity (class, function, variable, etc.) with its defining characteristics and code location.
- **Parameter** — `ParsedTypes.kt:50-56` — Describes a function or method parameter including its name, type, and optional annotations.

### Location and Position

- **Location** — `ParsedTypes.kt:37-41` — Encodes the source file location and range (file path, line, column) where a code entity is defined.
- **Position** — `ParsedTypes.kt:43-48` — Represents a single point in source code as line and column coordinates.

### Relationships and Dependencies

- **EntityRelationship** — `ParsedTypes.kt:58-64` — Captures relationships between parsed entities such as inheritance, implementation, or composition.
- **CallEdge** — `ParsedTypes.kt:66-71` — Represents a direct call or reference from one code entity to another, useful for building call graphs.

## Dependencies

- **K2 Compiler Framework** — These types are designed as output structures from K2's AST analysis, representing the contract between parser and consumers.
- **Source Location Tracking** — The module integrates position/location types for precise code indexing and error reporting.