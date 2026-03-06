/**
 * Shell Utilities - Runtime-optimized command execution
 *
 * Provides unified shell command execution that uses Bun's optimized $ API
 * when available, with Node.js child_process fallbacks for compatibility.
 *
 * Key optimizations under Bun:
 * - Bun $ API is faster and more memory efficient
 * - Built-in variable escaping for security
 * - Cross-platform shell support (including Windows)
 *
 * Usage:
 *   import { exec, execSync, gitDiff } from "./shell.js";
 *   const result = await exec("git status", { cwd: "/project" });
 *   const diff = await gitDiff("main", "HEAD", "/project");
 */

import { log } from "../logging/index.js";
import { runtime } from "./runtime.js";

// =============================================================================
// TYPES
// =============================================================================

/**
 * Bun.spawn options interface
 */
interface BunSpawnOptions {
  cwd?: string | undefined;
  env?: Record<string, string> | undefined;
  stdout?: "pipe" | "inherit" | "ignore" | undefined;
  stderr?: "pipe" | "inherit" | "ignore" | undefined;
  stdin?: "pipe" | "inherit" | "ignore" | undefined;
  windowsHide?: boolean | undefined;
  [key: string]: unknown;
}

/**
 * Node.js ExecException interface
 */
interface NodeExecException extends Error {
  stdout?: string | Buffer;
  stderr?: string | Buffer;
  code?: number;
  status?: number;
}

export interface ShellResult {
  /** Standard output */
  stdout: string;
  /** Standard error */
  stderr: string;
  /** Exit code (0 = success) */
  exitCode: number;
  /** Command succeeded (exitCode === 0) */
  success: boolean;
}

export interface ShellOptions {
  /** Working directory */
  cwd?: string;
  /** Environment variables */
  env?: Record<string, string>;
  /** Timeout in milliseconds */
  timeout?: number | undefined;
  /** Encoding for output (default: utf-8) */
  encoding?: BufferEncoding;
  /** Suppress stderr in output */
  quiet?: boolean;
}

// =============================================================================
// ASYNC SHELL EXECUTION
// =============================================================================

/**
 * Execute shell command asynchronously
 *
 * Under Bun: Uses Bun.$ API for optimized execution
 * Under Node: Uses child_process.exec
 *
 * @param command - Command to execute
 * @param options - Execution options
 * @returns Shell result with stdout, stderr, and exitCode
 */
export async function exec(command: string, options: ShellOptions = {}): Promise<ShellResult> {
  const { cwd = process.cwd(), env, timeout, quiet = false } = options;

  if (runtime.isBun) {
    return execBun(command, { cwd, env, timeout, quiet });
  }

  return execNode(command, { cwd, env, timeout });
}

/**
 * Execute command using Bun's spawn API
 *
 * Note: Bun's $ template literal doesn't work well with dynamic command strings.
 * We use Bun.spawn directly for better control and Windows compatibility.
 */
async function execBun(
  command: string,
  options: {
    cwd: string;
    env?: Record<string, string> | undefined;
    timeout?: number | undefined;
    quiet?: boolean | undefined;
  },
): Promise<ShellResult> {
  try {
    // On Windows, use cmd.exe to execute the command
    // On Unix, use sh -c
    const isWindows = process.platform === "win32";
    const shell = isWindows ? "cmd.exe" : "sh";
    const shellArgs = isWindows ? ["/c", command] : ["-c", command];

    // Bun.spawn options - windowsHide is supported in Bun 1.0+
    // Filter out undefined values from process.env to satisfy Record<string, string> type
    const filteredEnv = options.env
      ? Object.fromEntries(
          Object.entries({ ...process.env, ...options.env }).filter(([_, v]) => v !== undefined) as Array<
            [string, string]
          >,
        )
      : undefined;

    const spawnOptions: BunSpawnOptions = {
      cwd: options.cwd,
      env: filteredEnv,
      stdout: "pipe",
      stderr: "pipe",
    };

    // Hide console window on Windows to prevent flashing
    if (isWindows) {
      spawnOptions.windowsHide = true;
    }

    // Use bracket notation for Bun.spawn to satisfy index signature type checking
    const bunSpawn = (globalThis as any)["Bun"]["spawn"] as (
      args: string[],
      options: BunSpawnOptions,
    ) => {
      stdout: ReadableStream;
      stderr: ReadableStream;
      exited: Promise<number>;
    };
    const proc = bunSpawn([shell, ...shellArgs], spawnOptions);

    // Read output
    const [stdoutBuffer, stderrBuffer] = await Promise.all([
      new Response(proc.stdout).arrayBuffer(),
      new Response(proc.stderr).arrayBuffer(),
    ]);

    const exitCode = await proc.exited;

    const stdout = new TextDecoder().decode(stdoutBuffer).trim();
    const stderr = new TextDecoder().decode(stderrBuffer).trim();

    return {
      stdout,
      stderr,
      exitCode,
      success: exitCode === 0,
    };
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    return {
      stdout: "",
      stderr: err.message,
      exitCode: 1,
      success: false,
    };
  }
}

/**
 * Execute command using Node.js child_process
 */
async function execNode(
  command: string,
  options: { cwd: string; env?: Record<string, string> | undefined; timeout?: number | undefined },
): Promise<ShellResult> {
  const { exec: nodeExec } = await import("node:child_process");
  const { promisify } = await import("node:util");
  const execAsync = promisify(nodeExec);

  try {
    const { stdout, stderr } = await execAsync(command, {
      cwd: options.cwd,
      env: options.env ? { ...process.env, ...options.env } : undefined,
      timeout: options.timeout,
      encoding: "utf-8",
      maxBuffer: 50 * 1024 * 1024, // 50MB buffer
      windowsHide: true,
    });

    return {
      stdout: stdout.trim(),
      stderr: stderr.trim(),
      exitCode: 0,
      success: true,
    };
  } catch (error: unknown) {
    const err = error as NodeExecException;
    return {
      stdout: err.stdout?.toString().trim() || "",
      stderr: err.stderr?.toString().trim() || err.message || "",
      exitCode: err.code ?? 1,
      success: false,
    };
  }
}

// =============================================================================
// SYNC SHELL EXECUTION
// =============================================================================

/**
 * Execute shell command synchronously
 *
 * WARNING: Blocks the event loop. Use sparingly, prefer async exec().
 *
 * @param command - Command to execute
 * @param options - Execution options
 * @returns Shell result
 */
export function execSync(command: string, options: ShellOptions = {}): ShellResult {
  const { cwd = process.cwd(), env, timeout } = options;

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { execSync: nodeExecSync } = require("node:child_process");

  try {
    const stdout = nodeExecSync(command, {
      cwd,
      env: env ? { ...process.env, ...env } : undefined,
      timeout,
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
      maxBuffer: 50 * 1024 * 1024,
      windowsHide: true,
    });

    return {
      stdout: (stdout as string).trim(),
      stderr: "",
      exitCode: 0,
      success: true,
    };
  } catch (error: unknown) {
    const err = error as NodeExecException;
    return {
      stdout: err.stdout?.toString().trim() || "",
      stderr: err.stderr?.toString().trim() || err.message || "",
      exitCode: err.status ?? 1,
      success: false,
    };
  }
}

// =============================================================================
// GIT-SPECIFIC HELPERS
// =============================================================================

/**
 * Get git diff between two refs
 *
 * @param base - Base ref (commit, branch, tag)
 * @param head - Head ref
 * @param cwd - Repository directory
 * @returns Diff output with file statuses
 */
export async function gitDiff(base: string, head: string, cwd: string): Promise<string> {
  const result = await exec(`git diff --name-status ${base}..${head}`, { cwd });
  if (!result.success) {
    throw new Error(`git diff failed: ${result.stderr}`);
  }
  return result.stdout;
}

/**
 * Get git diff for uncommitted changes
 *
 * @param cwd - Repository directory
 * @param staged - Include only staged changes
 * @returns Diff output
 */
export async function gitDiffUncommitted(cwd: string, staged: boolean = false): Promise<string> {
  const args = staged ? "--staged" : "";
  const result = await exec(`git diff --name-status ${args}`, { cwd });
  if (!result.success) {
    throw new Error(`git diff failed: ${result.stderr}`);
  }
  return result.stdout;
}

/**
 * Get merge base between two branches
 *
 * @param branch1 - First branch
 * @param branch2 - Second branch
 * @param cwd - Repository directory
 * @returns Merge base commit hash
 */
export async function gitMergeBase(branch1: string, branch2: string, cwd: string): Promise<string> {
  const result = await exec(`git merge-base ${branch1} ${branch2}`, { cwd });
  if (!result.success) {
    throw new Error(`git merge-base failed: ${result.stderr}`);
  }
  return result.stdout.trim();
}

/**
 * Get current git branch name
 *
 * @param cwd - Repository directory
 * @returns Current branch name
 */
export async function gitCurrentBranch(cwd: string): Promise<string> {
  const result = await exec("git rev-parse --abbrev-ref HEAD", { cwd });
  if (!result.success) {
    throw new Error(`git rev-parse failed: ${result.stderr}`);
  }
  return result.stdout.trim();
}

/**
 * Get git status (short format)
 *
 * @param cwd - Repository directory
 * @returns Status output
 */
export async function gitStatus(cwd: string): Promise<string> {
  const result = await exec("git status --porcelain", { cwd });
  if (!result.success) {
    throw new Error(`git status failed: ${result.stderr}`);
  }
  return result.stdout;
}

/**
 * Check if directory is a git repository
 *
 * @param cwd - Directory to check
 * @returns true if git repository
 */
export async function isGitRepo(cwd: string): Promise<boolean> {
  const result = await exec("git rev-parse --is-inside-work-tree", { cwd, quiet: true });
  return result.success && result.stdout === "true";
}

/**
 * Get commit hash for a ref
 *
 * @param ref - Git ref (branch, tag, HEAD, etc.)
 * @param cwd - Repository directory
 * @returns Full commit hash
 */
export async function gitRevParse(ref: string, cwd: string): Promise<string> {
  const result = await exec(`git rev-parse ${ref}`, { cwd });
  if (!result.success) {
    throw new Error(`git rev-parse failed: ${result.stderr}`);
  }
  return result.stdout.trim();
}

/**
 * Get list of all local branches
 *
 * @param cwd - Repository directory
 * @returns Array of branch names
 */
export async function gitBranches(cwd: string): Promise<string[]> {
  const result = await exec("git branch --format='%(refname:short)'", { cwd });
  if (!result.success) {
    throw new Error(`git branch failed: ${result.stderr}`);
  }
  return result.stdout
    .split("\n")
    .map((b) => b.trim().replace(/^'|'$/g, ""))
    .filter(Boolean);
}

// =============================================================================
// FILE COUNTING HELPERS (replacing find/du commands)
// =============================================================================

/**
 * Count files in directory (cross-platform, no shell dependency)
 *
 * Replaces: find "${dir}" -type f | wc -l
 *
 * @param dir - Directory to count files in
 * @param _pattern - Optional glob pattern (reserved for future use)
 * @returns Number of files
 */
export async function countFiles(dir: string, _pattern: string = "**/*"): Promise<number> {
  const { readdir } = await import("node:fs/promises");
  const { join } = await import("node:path");

  let count = 0;

  async function walkDir(currentDir: string): Promise<void> {
    try {
      const entries = await readdir(currentDir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = join(currentDir, entry.name);

        // Skip common ignored directories
        if (entry.isDirectory()) {
          if (
            entry.name === "node_modules" ||
            entry.name === ".git" ||
            entry.name === "dist" ||
            entry.name === "build"
          ) {
            continue;
          }
          await walkDir(fullPath);
        } else if (entry.isFile()) {
          count++;
        }
      }
    } catch {
      // Ignore permission errors
    }
  }

  await walkDir(dir);
  return count;
}

/**
 * Get directory size in bytes (cross-platform, no shell dependency)
 *
 * Replaces: du -sb "${dir}" | cut -f1
 *
 * @param dir - Directory to measure
 * @returns Size in bytes
 */
export async function getDirSize(dir: string): Promise<number> {
  const { readdir, stat } = await import("node:fs/promises");
  const { join } = await import("node:path");

  let totalSize = 0;

  async function walkDir(currentDir: string): Promise<void> {
    try {
      const entries = await readdir(currentDir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = join(currentDir, entry.name);

        if (entry.isDirectory()) {
          // Skip common ignored directories
          if (
            entry.name === "node_modules" ||
            entry.name === ".git" ||
            entry.name === "dist" ||
            entry.name === "build"
          ) {
            continue;
          }
          await walkDir(fullPath);
        } else if (entry.isFile()) {
          try {
            const stats = await stat(fullPath);
            totalSize += stats.size;
          } catch {
            // Ignore stat errors
          }
        }
      }
    } catch {
      // Ignore permission errors
    }
  }

  await walkDir(dir);
  return totalSize;
}

// =============================================================================
// SOURCE FILE COUNTING
// =============================================================================

/** Supported source file extensions for indexing */
const SOURCE_EXTENSIONS = new Set([
  ".js",
  ".ts",
  ".jsx",
  ".tsx",
  ".mjs",
  ".cjs",
  ".py",
  ".java",
  ".cpp",
  ".c",
  ".cc",
  ".cxx",
  ".h",
  ".hpp",
  ".go",
  ".rs",
  ".kt",
  ".kts",
  ".swift",
  ".css",
  ".scss",
  ".sass",
  ".less",
  ".html",
  ".htm",
  ".xml",
]);

/** Directories to skip when counting source files */
const SKIP_DIRS = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  "coverage",
  "__pycache__",
  ".pytest_cache",
  "vendor",
  ".venv",
  "venv",
  ".next",
  ".nuxt",
  "out",
  "target",
  "bin",
  "obj",
]);

/**
 * Count source files in directory (cross-platform, optimized)
 *
 * Replaces: find "${dir}" -type f \( -name "*.js" -o -name "*.ts" ... \) | wc -l
 *
 * @param dir - Directory to count source files in
 * @returns Number of source files
 */
export async function countSourceFiles(dir: string): Promise<number> {
  const { readdir } = await import("node:fs/promises");
  const { join, extname } = await import("node:path");

  let count = 0;

  async function walkDir(currentDir: string): Promise<void> {
    try {
      const entries = await readdir(currentDir, { withFileTypes: true });

      for (const entry of entries) {
        if (entry.isDirectory()) {
          if (SKIP_DIRS.has(entry.name) || entry.name.startsWith(".")) {
            continue;
          }
          await walkDir(join(currentDir, entry.name));
        } else if (entry.isFile()) {
          const ext = extname(entry.name).toLowerCase();
          if (SOURCE_EXTENSIONS.has(ext)) {
            count++;
          }
        }
      }
    } catch {
      // Ignore permission errors
    }
  }

  await walkDir(dir);
  return count;
}

/**
 * Get codebase metrics (file count and size) - combined operation
 *
 * More efficient than separate countSourceFiles + getDirSize calls
 *
 * @param dir - Directory to analyze
 * @returns Object with fileCount and sizeBytes
 */
export async function getCodebaseMetrics(dir: string): Promise<{
  fileCount: number;
  sizeBytes: number;
  sizeMB: number;
}> {
  const { readdir, stat } = await import("node:fs/promises");
  const { join, extname } = await import("node:path");

  let fileCount = 0;
  let sizeBytes = 0;

  async function walkDir(currentDir: string): Promise<void> {
    try {
      const entries = await readdir(currentDir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = join(currentDir, entry.name);

        if (entry.isDirectory()) {
          if (SKIP_DIRS.has(entry.name) || entry.name.startsWith(".")) {
            continue;
          }
          await walkDir(fullPath);
        } else if (entry.isFile()) {
          const ext = extname(entry.name).toLowerCase();
          if (SOURCE_EXTENSIONS.has(ext)) {
            fileCount++;
            try {
              const stats = await stat(fullPath);
              sizeBytes += stats.size;
            } catch {
              // Ignore stat errors
            }
          }
        }
      }
    } catch {
      // Ignore permission errors
    }
  }

  await walkDir(dir);

  return {
    fileCount,
    sizeBytes,
    sizeMB: Math.floor(sizeBytes / (1024 * 1024)),
  };
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Check if a command exists in PATH
 *
 * @param command - Command name to check
 * @returns true if command exists
 */
export async function commandExists(command: string): Promise<boolean> {
  const checkCmd = process.platform === "win32" ? `where ${command}` : `which ${command}`;

  const result = await exec(checkCmd, { quiet: true });
  return result.success;
}

/**
 * Log shell utilities info (for debugging)
 */
export function logShellInfo(): void {
  log.i("SHELL", `[Shell] Runtime: ${runtime.name}`);
  log.i("SHELL", `[Shell] Platform: ${process.platform}`);
  log.i("SHELL", `[Shell] Bun shell: ${runtime.isBun ? "enabled" : "disabled"}`);
}
