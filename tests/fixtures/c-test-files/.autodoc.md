# tests/fixtures/c-test-files

## Overview

This directory contains sample C source files (`basic_functions.c` and `structures.c`) used as input fixtures for validating the C parser, AST generation, and code analysis pipeline. These fixtures demonstrate core C language constructs including function declarations, struct and enum definitions, and control flow patterns. They serve as reference input for parser tests and semantic analysis verification.

## Structures

- **Point** (`structures.c:5-8`) — A 2D coordinate struct with integer x and y fields.
- **name** (`structures.c:11-15`) — An anonymous struct member aggregating name-related data fields.
- **add** (`structures.c:18-22`) — An anonymous struct member for arithmetic or computation-related fields.

## Enumerations

- **Status** (`structures.c:32-37`) — An enumeration defining program status or condition states.
- **RED** (`structures.c:40-45`) — A color enumeration value representing red in a color palette.

## Functions

### basic_functions.c

- **add** (`basic_functions.c:6-8`) — Returns the sum of two integer arguments.
- **multiply** (`basic_functions.c:11-13`) — Returns the product of two integer arguments.
- **print_hello** (`basic_functions.c:16-16`) — Outputs a greeting message to standard output.
- **square** (`basic_functions.c:19-21`) — Returns the square of an integer value.
- **cleanup** (`basic_functions.c:24-26`) — Deallocates or releases previously allocated resources.
- **concat_strings** (`basic_functions.c:29-36`) — Concatenates two input strings into a single output string.
- **main** (`basic_functions.c:39-48`) — Program entry point demonstrating invocation of utility functions and basic control flow.

### structures.c

- **distance** (`structures.c:55-59`) — Calculates the Euclidean distance between two Point structures.
- **Employee** (`structures.c:61-70`) — Initializes or constructs employee record data structures.
- **print_employee** (`structures.c:72-77`) — Outputs formatted employee information to standard output.

## Dependencies

This module is a standalone test fixture resource with no runtime dependencies on other codebase modules. Parser validation tests, semantic analysis verification suites, and code indexing pipelines reference these files as input to validate correct handling of C language syntax and AST generation across diverse language constructs.