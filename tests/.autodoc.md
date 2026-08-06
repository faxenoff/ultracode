# MCP Test Module

## 🤖 Overview

This module contains test scripts for the MCP protocol, specifically for the `test-mcp-direct.js` and `test-mcp-protocol.js` files. It is used by developers to verify the functionality of the MCP server and client tools.

## 🤖 Architecture

```
  +-------------------+
  |   test-mcp-direct.js |
  +-------------------+
  |     /             |
  |    /              |
  |   /               |
  |  /                |
  | /                 |
  |-------------------|
  |   test-mcp-protocol.js |
  +-------------------+
```

## 🤖 Flow

```
  +-------------------+
  |   test-mcp-direct.js |
  +-------------------+
  |     /             |
  |    /              |
  |   /               |
  |  /                |
  | /                 |
  |-------------------|
  |   test-mcp-protocol.js |
  +-------------------+
  |     \             |
  |    \              |
  |   \               |
  |  \                |
  | \                 |
  |-------------------|
  |   MCP Server       |
  +-------------------+
```

## 🤖 Entity Listing

### Function
- **checkReady** — A function to check if the server is ready `test-mcp-protocol.js:58-65`
- **main** — Asynchronously runs the MCP protocol tests by initializing the server, running the tests, and stopping the server `test-mcp-protocol.js:306-318`
- **testMCPServer** — Starts an MCP server as a subprocess, creates an MCP client, connects to the server, lists available tools, and tests each tool category `test-mcp-direct.js:17-143`

### Method
- **constructor** — Initializes the MCPTester with default values `test-mcp-protocol.js:18-22`
- **processResponses** — Processes server responses `test-mcp-protocol.js:90-112`
- **runTests** — Executes a series of tests for the MCP protocol, including initializing the server, listing tools, analyzing a graph, indexing a directory, searching for queries, and finding entities `test-mcp-protocol.js:117-283`
- **sendRequest** — Sends a JSON-RPC request to the server `test-mcp-protocol.js:72-85`
- **sleep** — Returns a promise that resolves after a specified number of milliseconds `test-mcp-protocol.js:288-290`
- **startServer** — Starts the MCP server process `test-mcp-protocol.js:27-51`
- **stopServer** — Stops the MCP server process and logs the server stop status `test-mcp-protocol.js:295-302`
- **waitForReady** — Waits for the server to be ready `test-mcp-protocol.js:56-67`

### Class
- **MCPTester** — A class for testing the MCP protocol `test-mcp-protocol.js:17-303`

### Import_decl
- **@modelcontextprotocol/sdk/client/index.js** — Imports `@modelcontextprotocol/sdk/client/index.js` from `@modelcontextprotocol/sdk/client/index.js`. `test-mcp-direct.js:9-9`
- **@modelcontextprotocol/sdk/client/stdio.js** — Imports `@modelcontextprotocol/sdk/client/stdio.js` from `@modelcontextprotocol/sdk/client/stdio.js`. `test-mcp-direct.js:10-10`
- **node:child_process** — Imports `node:child_process` from `node:child_process`. `test-mcp-direct.js:8-8`, `test-mcp-protocol.js:8-8`
- **node:path** — Imports `node:path` from `node:path`. `test-mcp-protocol.js:9-9`

## Dependencies

### External Libraries
- `@modelcontextprotocol/sdk` — MCP SDK providing `Client` and `StdioClientTransport` for server communication and protocol handling.
- `node:child_process` — Node.js built-in module for spawning the MCP server subprocess.

### Environment Configuration
- `TEST_DIR` / `TARGET_DIR` / `PROJECT_DIR` — Environment variables specifying the target repository path for analysis.
- `DIST_JS` — Environment variable pointing to the compiled MCP server entry point (defaults to `dist/index.js`).

### Design Pattern

**Client-Server Test Architecture** — Tests spawn an MCP server subprocess and communicate via stdio transport, validating real protocol interaction rather than mocking server behavior. This ensures tests verify actual MCP implementation correctness including subprocess lifecycle, stdio communication, and protocol-level request/response exchange.
