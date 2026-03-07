/**
 * CLI Arguments Parser
 * Parses command line arguments for the MCP server
 */

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Parsed CLI arguments
 */
export interface ParsedArgs {
  /** Override config file path */
  configPath?: string | undefined;
  /** Show help and exit */
  helpRequested: boolean;
  /** Show version and exit */
  versionRequested: boolean;
  /** Run setup command */
  setupRequested: boolean;
  /** Disable auto-indexing on startup */
  noAutoIndex: boolean;
  /** Use pipe transport instead of stdio */
  pipeServerMode: boolean;
  /** Quiet mode (no console output) */
  quietMode: boolean;
  /** Positional arguments (directories) */
  positionalArgs: string[];
}

/**
 * Parse command line arguments
 */
export function parseArgs(argv: string[] = process.argv.slice(2)): ParsedArgs {
  const result: ParsedArgs = {
    configPath: undefined,
    helpRequested: false,
    versionRequested: false,
    setupRequested: false,
    noAutoIndex: false,
    pipeServerMode: false,
    quietMode: false,
    positionalArgs: [],
  };

  // Check for "setup" command first
  if (argv[0] === "setup") {
    result.setupRequested = true;
  }

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]!;

    // Skip "setup" if it was the first argument
    if (result.setupRequested && i === 0) {
      continue;
    }

    if (arg === "--config") {
      const next = argv[++i];
      if (!next) {
        console.error("Error: --config requires a path argument");
        console.error("Usage: ultracode [--config <path>] <directory>");
        process.exit(1);
      }
      result.configPath = next;
    } else if (arg.startsWith("--config=")) {
      const value = arg.slice("--config=".length);
      if (!value) {
        console.error("Error: --config requires a non-empty path");
        console.error("Usage: ultracode [--config <path>] <directory>");
        process.exit(1);
      }
      result.configPath = value;
    } else if (arg === "--help" || arg === "-h") {
      result.helpRequested = true;
    } else if (arg === "--version" || arg === "-v") {
      result.versionRequested = true;
    } else if (arg === "--no-auto-index") {
      result.noAutoIndex = true;
    } else if (arg === "--stdio") {
      result.pipeServerMode = false;
    } else if (arg === "--pipe") {
      result.pipeServerMode = true;
      result.quietMode = true;
      process.env["MCP_QUIET_MODE"] = "true";
    } else if (arg === "-d" || arg === "--directory") {
      const next = argv[++i];
      if (next) {
        result.positionalArgs.push(next);
      }
    } else if (arg.startsWith("-d=") || arg.startsWith("--directory=")) {
      const value = arg.includes("=") ? arg.split("=")[1] : undefined;
      if (value) {
        result.positionalArgs.push(value);
      }
    } else if (arg.startsWith("-")) {
      console.error(`Unknown option: ${arg}`);
      console.error("Usage: ultracode [--config <path>] [-d] <directory>");
      process.exit(1);
    } else {
      result.positionalArgs.push(arg);
    }
  }

  return result;
}

/**
 * Print help message
 */
export function printHelp(): void {
  console.error(`UltraCode Server

Usage:
  ultracode [options] <directory>
  ultracode [options] -d <directory>
  ultracode setup [--provider <tei|ollama|memory>]

Commands:
  setup             Interactive setup for semantic embedding providers

Options:
  -d, --directory   Project directory to index (alternative syntax)
  --config <path>   Use an alternate YAML configuration file
  --no-auto-index   Disable automatic indexing on startup
  --stdio           Use stdio transport (default)
  --pipe            Use pipe transport for multi-client mode
  --help, -h        Show this help message and exit
  --version, -v     Print version information and exit

Setup Options:
  --provider <provider>   Choose provider (tei, ollama, memory)
  --model <model-id>      Choose specific model

Examples:
  ultracode /path/to/project
  ultracode --config config/production.yaml /repo
  ultracode setup
  ultracode setup --provider ollama
  ultracode --version
`);
}

/**
 * Handle setup command - launches PowerShell/Bash setup script
 * @returns never - always exits the process
 */
export function handleSetupCommand(importMetaUrl: string): never {
  const __filename = fileURLToPath(importMetaUrl);
  const __dirname = dirname(__filename);

  // Find scripts directory (works for both dev and installed package)
  let scriptsDir = join(__dirname, "..", "scripts");
  if (!existsSync(scriptsDir)) {
    scriptsDir = join(__dirname, "scripts");
  }

  const isWindows = process.platform === "win32";

  if (isWindows) {
    const ps1Script = join(scriptsDir, "setup-semantic-embedding.ps1");
    if (existsSync(ps1Script)) {
      // Try pwsh first, fallback to powershell
      const pwshResult = spawnSync("pwsh", ["-ExecutionPolicy", "Bypass", "-File", ps1Script], {
        stdio: "inherit",
        windowsHide: true,
      });
      if (pwshResult.error) {
        // Fallback to Windows PowerShell
        const psResult = spawnSync("powershell", ["-ExecutionPolicy", "Bypass", "-File", ps1Script], {
          stdio: "inherit",
          windowsHide: true,
        });
        process.exit(psResult.status ?? 1);
      } else {
        process.exit(pwshResult.status ?? 0);
      }
    } else {
      console.error(`Setup script not found: ${ps1Script}`);
      process.exit(1);
    }
  } else {
    // Linux/macOS - use bash script
    const shScript = join(scriptsDir, "setup-embeddings-interactive.sh");
    if (existsSync(shScript)) {
      const result = spawnSync("bash", [shScript], { stdio: "inherit" });
      process.exit(result.status ?? 0);
    } else {
      console.error(`Setup script not found: ${shScript}`);
      process.exit(1);
    }
  }

  // TypeScript requires this even though we always exit above
  process.exit(1);
}
