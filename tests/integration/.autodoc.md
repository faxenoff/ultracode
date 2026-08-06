# Integration Module

## 🤖 Overview

The `tests/integration` module contains integration tests for various tools and methods, including the JSCPD clone detection tool and MCP methods. Developers and QA engineers use this module to validate the correctness and performance of these tools and methods.

## 🤖 Architecture

```
  +---------------------+
  |   JSCPD Clone Tool  |
  |     (integration)   |
  +---------------------+
          |
          v
  +---------------------+
  |   Test Runner       |
  |     (integration)   |
  +---------------------+
          |
          v
  +---------------------+
  |   Test Fixtures     |
  |     (integration)   |
  +---------------------+
```

## 🤖 Flow

```
  +---------------------+
  |   Test Runner       |
  |     (integration)   |
  +---------------------+
          |
          v
  +---------------------+
  |   JSCPD Clone Tool  |
  |     (integration)   |
  +---------------------+
          |
          v
  +---------------------+
  |   Test Fixtures     |
  |     (integration)   |
  +---------------------+
```

## 🤖 Entity Listing

### Function
- **dataHandler** — Handles incoming data to parse JSON responses and resolve promises `mcp-methods-dev.test.js:93-103`
- **dataHandler** — Handles incoming data for parsing JSON responses, logs results, and resolves the promise when a complete response is received `mcp-methods.test.js:93-103`
- **dfsFind** — Recursively searches for the first code file within a directory, respecting a maximum depth `test-mcp-tool.mjs:84-104`
- **findFirstCodeFile** — Finds the first code file in a directory, optionally preferring a subdirectory `test-mcp-tool.mjs:106-117`
- **formatResultPayload** — Formats the result payload for output `test-mcp-tool.mjs:184-201`
- **graphResult** — Validates the result of a graph query operation `mcp-methods-dev.test.js:210-213`
- **graphResult** — Validates the result of a graph query operation, ensuring it contains an array of entities `mcp-methods.test.js:210-213`
- **handleJsonMessage** — Handles JSON messages and processes them `test-mcp-tool.mjs:295-339`
- **isCodeFile** — Checks if a file has a code extension `test-mcp-tool.mjs:71-73`
- **killTimer** — Kills the child process after a timeout `test-mcp-tool.mjs:387-392`
- **logAppend** — Appends a message to the log file `test-mcp-tool.mjs:203-205`
- **pathExists** — Asynchronously checks if a file path exists `test-mcp-tool.mjs:75-82`
- **processLine** — Processes a line of input and handles JSON messages `test-mcp-tool.mjs:342-361`
- **queue** — Queues a tool call with arguments and a label `test-mcp-tool.mjs:231-238`
- **readSnippetOneLine** — Reads and returns the first maxLines lines of a file as a single string `test-mcp-tool.mjs:119-127`
- **scheduleEarlyExit** — Schedules an early exit for the process `test-mcp-tool.mjs:280-293`
- **sendRest** — Sends remaining requests after index processing `test-mcp-tool.mjs:316-325`
- **timeout** — A constant for server startup timeout `mcp-methods-dev.test.js:49-51`
- **timeout** — Sets a timeout for a method call, rejecting the promise if the method takes longer than the specified timeout `mcp-methods-dev.test.js:87-89`
- **timeout** — A constant representing the timeout duration for server startup `mcp-methods.test.js:49-51`
- **timeout** — Sets a timeout for a method call, rejecting the promise if it exceeds the specified duration `mcp-methods.test.js:87-89`
- **tryParseJSON** — Tries to parse a string as JSON and returns the parsed object or null if parsing fails `test-mcp-tool.mjs:129-135`
- **validate** — Validates the result payload using a validator function `test-mcp-tool.mjs:303-303`
- **validators** — Validates the payload for a specific operation, returning an object with ok and reason properties `test-mcp-tool.mjs:138-145`
- **validators** — Returns a validator function for a given concept `test-mcp-tool.mjs:146-151`
- **validators** — Analyzes the impact of code changes and returns a validation result `test-mcp-tool.mjs:152-156`
- **validators** — Suggests refactoring for a given payload `test-mcp-tool.mjs:157-161`
- **validators** — Retrieves metrics from a payload `test-mcp-tool.mjs:162-166`
- **validators** — Parses and validates the payload for code impact analysis `test-mcp-tool.mjs:167-167`
- **validators** — Detects code clones in the provided payload `test-mcp-tool.mjs:168-168`
- **validators** — Performs cross-language search based on the payload `test-mcp-tool.mjs:169-169`
- **validators** — Finds related concepts in the payload `test-mcp-tool.mjs:170-170`
- **validators** — Suggests refactoring based on the payload `test-mcp-tool.mjs:171-175`
- **validators** — Retrieves metrics from the payload `test-mcp-tool.mjs:176-176`
- **validators** — Parses the payload to extract conductor information and returns a validation result `test-mcp-tool.mjs:177-181`

### Method
- **constructor** — Initializes the MCPTester with results and server process `mcp-methods-dev.test.js:25-34`
- **constructor** — Initializes the MCPTester with results tracking and server process handling `mcp-methods.test.js:25-34`
- **generateReport** — Generates a detailed report of test results, logs summary statistics, and saves the report to a file `mcp-methods-dev.test.js:410-467`
- **generateReport** — Creates a detailed report of test results, logs summary statistics, and saves the report to a file `mcp-methods.test.js:410-467`
- **log** — Logs messages with ANSI color codes `mcp-methods-dev.test.js:36-38`
- **log** — Logs a message with an optional color code `mcp-methods.test.js:36-38`
- **runAllTests** — Runs a series of tests for core and query operations, logs results, and generates a summary report `mcp-methods-dev.test.js:162-408`
- **runAllTests** — Executes a series of tests for core and query operations, logs detailed results, and generates a summary report `mcp-methods.test.js:162-408`
- **runTest** — Asynchronously runs a test method, logs results, and validates responses `mcp-methods-dev.test.js:110-160`
- **runTest** — Executes a test method, logs the test name and method, sends a request, validates the response, and logs the result or error `mcp-methods.test.js:110-160`
- **sendRequest** — Sends a request to the MCP server and returns a promise `mcp-methods-dev.test.js:75-108`
- **sendRequest** — Sends a JSON-RPC request to the MCP server and returns a promise `mcp-methods.test.js:75-108`
- **startServer** — Starts the MCP server and returns a promise `mcp-methods-dev.test.js:40-73`
- **startServer** — Starts the MCP server and returns a promise that resolves when the server is ready `mcp-methods.test.js:40-73`

### Class
- **MCPTester** — A class for testing MCP methods with the actual MCP server `mcp-methods-dev.test.js:24-468`
- **MCPTester** — A class for testing all 22 MCP methods with the actual MCP server `mcp-methods.test.js:24-468`

### Import_decl
- **../../src/tools/jscpd.js** — Imports `../../src/tools/jscpd.js` from `../../src/tools/jscpd.js`. `jscpd-tool.test.ts:5-5`
- **bun:test** — Imports `bun:test` from `bun:test`. `jscpd-tool.test.ts:1-1`, `mcp-methods.test.ts:6-6`
- **node:child_process** — Imports `node:child_process` from `node:child_process`. `mcp-methods-dev.test.js:7-7`, `mcp-methods.test.js:7-7`, `test-mcp-tool.mjs:8-8`
- **node:fs** — Imports `node:fs` from `node:fs`. `mcp-methods-dev.test.js:8-8`, `mcp-methods.test.js:8-8`, `test-mcp-tool.mjs:9-9`
- **node:fs/promises** — Imports `node:fs/promises` from `node:fs/promises`. `test-mcp-tool.mjs:10-10`
- **node:os** — Imports `node:os` from `node:os`. `test-mcp-tool.mjs:11-11`
- **node:path** — Imports `node:path` from `node:path`. `jscpd-tool.test.ts:2-2`, `mcp-methods-dev.test.js:9-9`, `mcp-methods.test.js:9-9`, `test-mcp-tool.mjs:12-12`
- **node:url** — Imports `node:url` from `node:url`. `jscpd-tool.test.ts:3-3`, `test-mcp-tool.mjs:13-13`

## Design Notes

This module follows an internal-only design pattern with no public API exports. It is intended exclusively for testing MCP protocol implementations and verifying integration points with external systems. The module operates as a self-contained testing utility without exposing reusable abstractions.

## Dependencies

- MCP Protocol — for integration protocol validation
- External system APIs — validated through MCP tooling
