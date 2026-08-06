# bin

## 🤖 Overview

UltraCode is a module that resolves paths and launches the Comm proxy binary, serving as an entry point for the application. It is used by developers and users to manage the application's execution environment, ensuring the correct paths and dependencies are resolved before launching the Comm proxy.

## 🤖 Architecture

```
UltraCode → ultracode.js → ultracode.com (Comm) → Core (index.js)
```

## 🤖 Flow

```
UltraCode resolves paths and launches the Comm proxy binary, which then communicates with the Core (index.js) to execute the application.
```

## 🤖 Entity Listing

### Function
- **quotedArgs** — Maps each argument to a quoted string and joins them with spaces, suitable for passing to the Comm binary on macOS `ultracode.js:57-57`
- **runSetup** — Executes the setup command by dynamically importing the specified script path `ultracode-setup.cjs:50-56`
- **tryBunPath** — Tries to find the setup-command.js path using bun's global installation `ultracode-setup.cjs:34-48`

### Import_decl
- **node:child_process** — Imports `node:child_process` from `node:child_process`. `ultracode.js:12-12`
- **node:fs** — Imports `node:fs` from `node:fs`. `ultracode.js:13-13`
- **node:os** — Imports `node:os` from `node:os`. `ultracode.js:14-14`
- **node:path** — Imports `node:path` from `node:path`. `ultracode.js:15-15`
- **node:url** — Imports `node:url` from `node:url`. `ultracode.js:16-16`

## Dependencies

### Node.js Built-ins
- `node:child_process` — `spawn` for launching the Comm process
- `node:fs` — `existsSync` for validating file existence
- `node:os` — `platform` for detecting operating system
- `node:path` — `dirname`, `join` for path resolution
- `node:url` — `fileURLToPath` for converting ES module URLs to file paths

### External Dependencies
- **Comm binary** (`dist/ultracode.com`) — Cosmopolitan-based proxy binary that routes requests from Claude Code to the Core server
- **Core MCP server** (`dist/index.js`) — Main UltraCode server that processes requests
