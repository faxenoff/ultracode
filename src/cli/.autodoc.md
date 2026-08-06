# CLI

## 🤖 Overview

The `src/cli` module provides a command-line interface for the MCP server, allowing users to parse and process command-line arguments. It is used by developers and administrators to configure and manage the server through the command line.

## 🤖 Architecture

```
  +-------------------+
  | args-parser.ts    |
  +-------------------+
  | debug-tools-visibility.ts |
  +-------------------+
  | setup-command.ts  |
  +-------------------+
```

## 🤖 Flow

```
  +-------------------+
  | args-parser.ts    |
  +-------------------+
  |     /              |
  |     v              |
  +-------------------+
  | debug-tools-visibility.ts |
  +-------------------+
  |     /              |
  |     v              |
  +-------------------+
  | setup-command.ts  |
  +-------------------+
```

## 🤖 Entity Listing

### Function
- **analyzeTools** — Analyzes MCP tools for visibility, including statistics and checks for issues `debug-tools-visibility.ts:43-253`
- **buildEmbeddingConfig** — Constructs an embedding configuration based on provider, selected model, install result, GPU, and CPU information `setup-command.ts:149-264`
- **buildInferenceConfig** — Builds an inference configuration object with specified model and optimization settings `setup-command.ts:304-323`
- **buildLlmConfigFromResult** — Builds an LLM configuration record from an LLM result object, including platform-specific fields `setup-command.ts:271-298`
- **found** — Indicates whether a model was found during the setup process `setup-command.ts:392-392`
- **getPackageRoot** — Detects the root directory of the package `setup-command.ts:62-90`
- **handleSetupCommand** — Not present in the provided code `args-parser.ts:151-199`
- **loadModelsConfig** — Loads and parses the models configuration file, returning it or null if not found or parsing fails `setup-command.ts:99-110`
- **needsImprovement** — Filters tools that need improvement based on description length, example presence, help presence, and tag presence `debug-tools-visibility.ts:190-196`
- **parseArgs** — Parses command line arguments and returns a ParsedArgs object `args-parser.ts:36-109`
- **parseSetupArgs** — Parses command-line arguments into a SetupArgs object `setup-command.ts:123-145`
- **printHeader** — Prints a header with the given text and ANSI colors `debug-tools-visibility.ts:32-36`
- **printHelp** — Not present in the provided code `args-parser.ts:114-145`
- **printSubheader** — Prints a subheader with the given text and ANSI colors `debug-tools-visibility.ts:38-41`
- **runSetup** — Executes the setup process, including parsing arguments, detecting hardware, and optionally setting up LLM or embedding models `setup-command.ts:329-503`
- **sortedTags** — Sorts the tags by their counts in descending order `debug-tools-visibility.ts:127-127`
- **sortedTools** — Sorts the tools by their names in ascending order `debug-tools-visibility.ts:153-153`
- **zigModel** — Represents a model for embedding in the UltraCode setup command `setup-command.ts:387-387`

### Interface
- **ParsedArgs** — Represents parsed command line arguments for the MCP server `args-parser.ts:14-31`
- **SetupArgs** — Represents command-line arguments for setting up models, including provider, model, language, and whether to use only LLM `setup-command.ts:116-121`

### Import_decl
- **../cpu/cpu-detector.js** — Imports `../cpu/cpu-detector.js` from `../cpu/cpu-detector.js`. `setup-command.ts:18-18`
- **../i18n/index.js** — Imports `../i18n/index.js` from `../i18n/index.js`. `setup-command.ts:19-19`
- **../tools/tool-definitions.js** — Imports `../tools/tool-definitions.js` from `../tools/tool-definitions.js`. `debug-tools-visibility.ts:17-17`
- **../utils/config-paths.js** — Imports `../utils/config-paths.js`. `setup-command.ts:20-27`
- **./setup/i18n/index.js** — Imports `./setup/i18n/index.js` from `./setup/i18n/index.js`. `setup-command.ts:29-29`
- **./setup/index.js** — Imports `./setup/index.js`. `setup-command.ts:32-54`
- **./setup/setup-installers.js** — Imports `./setup/setup-installers.js` from `./setup/setup-installers.js`. `setup-command.ts:55-55`
- **./setup/utils/docker.js** — Imports `./setup/utils/docker.js` from `./setup/utils/docker.js`. `setup-command.ts:56-56`
- **node:child_process** — Imports `node:child_process` from `node:child_process`. `args-parser.ts:6-6`
- **node:fs** — Imports `node:fs` from `node:fs`. `args-parser.ts:7-7`, `setup-command.ts:15-15`
- **node:path** — Imports `node:path` from `node:path`. `args-parser.ts:8-8`, `setup-command.ts:16-16`
- **node:url** — Imports `node:url` from `node:url`. `args-parser.ts:9-9`, `setup-command.ts:17-17`

### Property
- **concurrency** — Optional number representing the concurrency level `setup-command.ts:218-218`
- **configPath** — Stores the path to the configuration file `args-parser.ts:16-16`
- **helpRequested** — Indicates whether help is requested `args-parser.ts:18-18`
- **langArg** — Optional string representing the language for model setup `setup-command.ts:119-119`
- **llmOnly** — Boolean indicating whether to use only LLM for model setup `setup-command.ts:120-120`
- **max_batch_tokens** — Optional number representing the maximum batch size for tokens `setup-command.ts:218-218`
- **max_client_batch_size** — Optional number representing the maximum client batch size `setup-command.ts:218-218`
- **modelArg** — Optional string representing the model for model setup `setup-command.ts:118-118`
- **noAutoIndex** — Indicates whether auto-indexing is disabled `args-parser.ts:24-24`
- **pipeServerMode** — Indicates whether pipe transport is used instead of stdio `args-parser.ts:26-26`
- **positionalArgs** — Stores positional arguments (directories) `args-parser.ts:30-30`
- **providerArg** — Optional string representing the provider for model setup `setup-command.ts:117-117`
- **quietMode** — Indicates whether quiet mode is enabled `args-parser.ts:28-28`
- **setupRequested** — Indicates whether the setup command is requested `args-parser.ts:22-22`
- **versionRequested** — Indicates whether version information is requested `args-parser.ts:20-20`

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
