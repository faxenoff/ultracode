---
module_name: cli
description: "Command-line interface for MCP server with argument parsing, setup wizard, debug tools, and log querying"
status: active
language: typescript
---

# CLI

> Command-line interface module providing argument parsing, interactive setup wizard, debug tooling visibility analysis, and structured log querying for the UltraCode server.

## Overview

The CLI module is the entry point for all command-line interactions with the MCP server. It parses CLI arguments (config path, transport mode, flags), delegates to the interactive setup wizard for embedding/LLM provider configuration, provides a debug tool that analyzes MCP tool descriptions for agent visibility quality, and includes a log query subsystem for filtering and analyzing structured logs.

## Data Flow

- **Inputs:** Command-line arguments (`process.argv`), user interactive input via stdin, log files from disk.
- **Processing:** Argument parsing into typed `ParsedArgs`, routing to setup/help/version commands, tool visibility analysis, log filtering with time/level/module/KV queries.
- **Outputs:** Parsed configuration objects, setup wizard execution, debug reports to stdout, filtered log entries in multiple formats (raw, JSON, CSV, table).

## Public API

| Export | Type | Description | Location |
|--------|------|-------------|----------|
| `ParsedArgs` | interface | Typed structure for all parsed CLI arguments | [`args-parser.ts:14-31`](./args-parser.ts) |
| `parseArgs` | function | Parses `process.argv` into `ParsedArgs` | [`args-parser.ts:36-109`](./args-parser.ts) |
| `printHelp` | function | Prints usage help message to stderr | [`args-parser.ts:114-145`](./args-parser.ts) |
| `handleSetupCommand` | function | Launches platform-specific setup script (PowerShell/Bash) | [`args-parser.ts:151-199`](./args-parser.ts) |
| `runSetup` | function | Main interactive setup flow for embedding and LLM providers | [`setup-command.ts:123-145`](./setup-command.ts) |

## Dependencies

### Internal Modules

| Module | Purpose |
|--------|---------|
| `cli/setup` | Interactive setup UI, hardware detection, provider installers |
| `cli/setup/i18n` | Localized strings for setup wizard |
| `cpu/cpu-detector` | CPU feature detection (AVX2, VNNI, AMX) |
| `i18n` | System locale detection |
| `utils/config-paths` | Config directory management and semantic config I/O |
| `tools/tool-definitions` | MCP tool list for debug visibility analysis |

### External Packages

| Package | Purpose |
|---------|---------|
| `node:child_process` | Spawning setup scripts |
| `node:fs` | Config file reading |
| `node:readline` | Interactive user input |

## Behavioral Properties

| Property | Value |
|----------|-------|
| Transport modes | stdio (default), pipe (multi-client) |
| Setup auto-detection | GPU architecture, CPU features, system locale |
| Log output formats | raw, table, JSON, CSV |

## Error Handling

Argument parsing errors print usage hints to stderr and call `process.exit(1)`. Setup failures are caught and reported with colored status messages. Missing setup scripts cause descriptive error messages before exit.

## Known Limitations

- The `handleSetupCommand` function always calls `process.exit()` and never returns.
- Debug tools visibility analysis requires all tool definitions to be synchronously available.
- Log query follow mode (`-f`) blocks indefinitely via `fs.watch`.

## Files

| File | Description |
|------|-------------|
| `args-parser.ts` | CLI argument parser with typed `ParsedArgs` output |
| `setup-command.ts` | Main interactive setup flow for embedding and LLM providers |
| `debug-tools-visibility.ts` | Analyzes MCP tool descriptions for agent visibility quality |
