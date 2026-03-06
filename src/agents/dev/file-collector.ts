/**
 * File Collector
 *
 * Recursively collects source files from a directory,
 * respecting exclude patterns and default exclusions.
 *
 * Performance optimizations:
 * - Uses readdirSync with withFileTypes (eliminates separate lstat calls)
 * - Uses Bun.Glob.scan() when running under Bun (3x faster, native async iterator)
 */

import { type Dirent, existsSync, readdirSync, readFileSync } from "node:fs";
import { basename, extname, join, relative } from "node:path";
import fg from "fast-glob";
import { log } from "../../logging/index.js";
import { isBunRuntime } from "../../utils/runtime.js";
import { isCodeExtension, isDataExtension, SUPPORTED_DATA_EXTENSIONS } from "./file-extensions.js";

/** Name of the ignore file */
const IGNORE_FILE_NAME = ".ultracodeignore";

/**
 * Load patterns from .ultracodeignore file if it exists
 * Supports gitignore-style syntax:
 * - Lines starting with # are comments
 * - Empty lines are ignored
 * - Patterns follow glob syntax
 */
export function loadIgnoreFile(directory: string): string[] {
  const ignoreFilePath = join(directory, IGNORE_FILE_NAME);
  if (!existsSync(ignoreFilePath)) {
    return [];
  }

  try {
    const content = readFileSync(ignoreFilePath, "utf-8");
    const patterns: string[] = [];

    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      // Skip empty lines and comments
      if (!trimmed || trimmed.startsWith("#")) {
        continue;
      }
      // Convert to glob pattern if needed
      let pattern = trimmed;
      // If pattern doesn't have glob markers, treat as directory/file name
      if (!pattern.includes("*") && !pattern.includes("/")) {
        pattern = `**/${pattern}/**`;
      }
      patterns.push(pattern);
    }

    if (patterns.length > 0) {
      log.i("FILESCAN", "ignore_loaded", { path: ignoreFilePath, cnt: patterns.length });
    }

    return patterns;
  } catch (error) {
    log.w("FILESCAN", "ignore_read_fail", { path: ignoreFilePath, err: String(error) });
    return [];
  }
}

/** Default directory names to exclude from scanning */
const DEFAULT_EXCLUDED_DIR_NAMES = new Set([
  "node_modules",
  "tmp",
  "temp",
  "cache",
  "__pycache__",
  ".pytest_cache",
  "venv",
  ".venv",
  ".memory_bank",
  "build",
  "dist",
  "out",
  ".next",
  ".nuxt",
  "coverage",
  "archives",
  "archive",
  "backups",
  "backup",
]);

/**
 * In-memory cache for compiled RegExp patterns
 * - Lives for the duration of the process
 * - No disk persistence needed (RegExp compilation is fast)
 * - Automatically populated on first use of each pattern
 */
const regexCache = new Map<string, RegExp>();

/**
 * Get or create a cached RegExp for a glob pattern
 */
function getCachedRegex(pattern: string): RegExp {
  let regex = regexCache.get(pattern);
  if (!regex) {
    const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, "\\$&");
    const regexStr = escaped
      .replace(/\*\*\//g, "(?:[^/]+/)*")
      .replace(/\/\*\*/g, "(?:/[^/]+)*")
      .replace(/\*\*/g, ".*")
      .replace(/\*/g, "[^/]*")
      .replace(/\(\?:\/\[\^\/\]\+\)\*$/, "(?:/[^/]+)*");
    regex = new RegExp(regexStr);
    regexCache.set(pattern, regex);
  }
  return regex;
}

/**
 * Check if a file path should be excluded based on patterns
 * Uses cached RegExp to avoid repeated compilation
 */
function shouldExclude(filePath: string, excludePatterns: string[]): boolean {
  const normalizedPath = filePath.replace(/\\/g, "/");
  for (const pattern of excludePatterns) {
    if (pattern.includes("**")) {
      if (getCachedRegex(pattern).test(normalizedPath)) return true;
    } else {
      const normalizedPattern = pattern.replace(/\*/g, "").replace(/\\/g, "/");
      if (normalizedPath.includes(normalizedPattern)) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Check if a file should be included based on extension
 */
function isSupportedFile(fileName: string): boolean {
  const ext = extname(fileName).toLowerCase();
  const lowerName = fileName.toLowerCase();
  return (
    isCodeExtension(ext) ||
    isDataExtension(ext) ||
    // Dotfiles without extension (e.g. .gitignore, .dockerignore)
    SUPPORTED_DATA_EXTENSIONS.some((d) => lowerName === d.slice(1) || lowerName.endsWith(d))
  );
}

export interface CollectFilesOptions {
  excludePatterns: string[];
  agentId: string;
}

export interface CollectFilesResult {
  files: string[];
  stats: {
    dirsScanned: number;
    excludedByPattern: number;
    excludedByDefault: number;
    byExtension: Record<string, number>;
  };
}

/**
 * Bun.Glob interface for type safety
 */
interface BunGlob {
  new (pattern: string): BunGlobInstance;
}

interface BunGlobInstance {
  scan(options: { cwd: string; onlyFiles?: boolean; ignore?: string[] }): AsyncIterable<string>;
}

/**
 * Collect files using Bun.Glob.scan() - 3x faster than fs operations
 * Uses native async iterator for streaming results with ignore patterns
 */
async function collectFilesWithBunGlob(
  directory: string,
  excludePatterns: string[],
): Promise<{ files: string[]; excludedByPattern: number }> {
  const BunGlobClass = (globalThis as unknown as { Bun?: { Glob?: BunGlob } }).Bun?.Glob;
  if (!BunGlobClass) {
    throw new Error("Bun.Glob not available");
  }

  const files: string[] = [];
  let excludedByPattern = 0;

  // Build ignore patterns for Bun.Glob - includes default exclusions and user patterns
  const defaultIgnorePatterns = Array.from(DEFAULT_EXCLUDED_DIR_NAMES).map((dir) => `**/${dir}/**`);
  const ignorePatterns = [
    ...defaultIgnorePatterns,
    "**/.*", // Hidden files/dirs
    "**/.*/**", // Files inside hidden dirs
    ...excludePatterns,
  ];

  const glob = new BunGlobClass("**/*");
  const startTime = Date.now();

  for await (const relativePath of glob.scan({ cwd: directory, onlyFiles: true, ignore: ignorePatterns })) {
    const fullPath = join(directory, relativePath);
    const fileName = basename(relativePath);

    // Double-check exclude patterns (in case Bun.Glob ignore doesn't match all)
    if (shouldExclude(fullPath, excludePatterns)) {
      excludedByPattern++;
      continue;
    }

    // Check if supported file type
    if (isSupportedFile(fileName)) {
      files.push(fullPath);
    }
  }

  const elapsed = Date.now() - startTime;
  log.d("FILESCAN", "bun_glob_scan", { files: files.length, elapsed: `${elapsed}ms` });

  return { files, excludedByPattern };
}

/**
 * Collect files using Node.js fs with withFileTypes optimization
 * Eliminates separate lstat() calls - Dirent already has type info
 */
function collectFilesWithNodeFs(
  directory: string,
  excludePatterns: string[],
): { files: string[]; dirsScanned: number; excludedByPattern: number; excludedByDefault: number } {
  const files: string[] = [];
  let excludedByPattern = 0;
  let excludedByDefault = 0;
  let dirsScanned = 0;

  function walkDir(dir: string) {
    try {
      dirsScanned++;
      // withFileTypes: true returns Dirent objects with isDirectory()/isFile()
      // This eliminates the need for separate lstatSync calls!
      const entries: Dirent[] = readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = join(dir, entry.name);

        // Skip symlinks early
        if (entry.isSymbolicLink()) {
          continue;
        }

        // Check exclude patterns
        if (shouldExclude(fullPath, excludePatterns)) {
          excludedByPattern++;
          continue;
        }

        if (entry.isDirectory()) {
          const lowerName = entry.name.toLowerCase();

          // Check default excluded directories
          if (DEFAULT_EXCLUDED_DIR_NAMES.has(lowerName)) {
            excludedByDefault++;
            continue;
          }

          // Skip hidden directories
          if (!entry.name.startsWith(".")) {
            walkDir(fullPath);
          }
        } else if (entry.isFile()) {
          // Check if supported file type
          if (isSupportedFile(entry.name)) {
            files.push(fullPath);
          }
        }
      }
    } catch (error) {
      log.e("FILESCAN", "dir_read_error", { dir, err: String(error) });
    }
  }

  walkDir(directory);

  return { files, dirsScanned, excludedByPattern, excludedByDefault };
}

/**
 * Recursively collect source files from a directory
 * Automatically uses the fastest method available:
 * - Bun.Glob.scan() when running under Bun (3x faster)
 * - Node.js fs with withFileTypes optimization otherwise
 */
export function collectFiles(directory: string, options: CollectFilesOptions): CollectFilesResult {
  const { excludePatterns: baseExcludePatterns } = options;

  // Load project-specific ignore patterns from .ultracodeignore
  const ignorePatterns = loadIgnoreFile(directory);
  const excludePatterns = [...baseExcludePatterns, ...ignorePatterns];

  const startTime = Date.now();

  // Try Bun.Glob first (async, but we need sync interface)
  // For now, use sync Node.js approach but with withFileTypes optimization
  // Bun.Glob will be used when we can make collectFiles async
  const useBunGlob = false; // See .autodoc/todo/BACKLOG.md#3

  let files: string[];
  let dirsScanned = 0;
  let excludedByPattern = 0;
  let excludedByDefault = 0;

  if (useBunGlob && isBunRuntime()) {
    // Bun.Glob path - currently disabled as collectFiles is sync
    // Will be enabled when we can make the API async
    log.d("FILESCAN", "using_bun_glob");
    const result = collectFilesWithNodeFs(directory, excludePatterns);
    files = result.files;
    dirsScanned = result.dirsScanned;
    excludedByPattern = result.excludedByPattern;
    excludedByDefault = result.excludedByDefault;
  } else {
    // Node.js path with withFileTypes optimization (no lstat calls!)
    const result = collectFilesWithNodeFs(directory, excludePatterns);
    files = result.files;
    dirsScanned = result.dirsScanned;
    excludedByPattern = result.excludedByPattern;
    excludedByDefault = result.excludedByDefault;
  }

  const elapsed = Date.now() - startTime;

  // Count files by extension for diagnostics
  const extStats: Record<string, number> = {};
  for (const f of files) {
    const ext = extname(f).toLowerCase() || "(no ext)";
    extStats[ext] = (extStats[ext] || 0) + 1;
  }

  log.i("FILESCAN", "scan_done", {
    root: directory,
    dirs: dirsScanned,
    files: files.length,
    excludedPat: excludedByPattern,
    excludedDef: excludedByDefault,
    elapsed: `${elapsed}ms`,
  });

  return {
    files,
    stats: {
      dirsScanned,
      excludedByPattern,
      excludedByDefault,
      byExtension: extStats,
    },
  };
}

/**
 * Collect files using fast-glob with ignore patterns
 * Async, supports ignore patterns natively - skips excluded directories entirely
 * ~2x faster than node-glob, ~5x faster than tiny-glob
 */
async function collectFilesWithFastGlob(
  directory: string,
  excludePatterns: string[],
): Promise<{ files: string[]; excludedByPattern: number }> {
  const files: string[] = [];

  // Build ignore patterns - includes default exclusions and user patterns
  const defaultIgnorePatterns = Array.from(DEFAULT_EXCLUDED_DIR_NAMES).map((dir) => `**/${dir}/**`);
  const ignorePatterns = [
    ...defaultIgnorePatterns,
    "**/.*", // Hidden files
    "**/.*/**", // Files inside hidden dirs
    ...excludePatterns,
  ];

  const startTime = Date.now();

  // fast-glob supports ignore natively and is very fast
  const allFiles = await fg("**/*", {
    cwd: directory,
    ignore: ignorePatterns,
    onlyFiles: true,
    absolute: true,
    dot: false, // Skip hidden files
  });

  // Filter to supported file types only
  for (const fullPath of allFiles) {
    const fileName = basename(fullPath);
    if (isSupportedFile(fileName)) {
      files.push(fullPath);
    }
  }

  const elapsed = Date.now() - startTime;
  log.d("FILESCAN", "fast_glob_scan", { files: files.length, elapsed: `${elapsed}ms` });

  return { files, excludedByPattern: 0 }; // excludedByPattern is 0 because glob skips them entirely
}

/**
 * Async version of collectFiles using Bun.Glob or fast-glob
 * Use this when async API is acceptable for better performance
 *
 * Runtime selection:
 * - Bun: Bun.Glob.scan() with ignore patterns (native, 3x faster, skips excluded dirs)
 * - Node.js: fast-glob with ignore patterns (async, ~2x faster than node-glob, skips excluded dirs)
 */
export async function collectFilesAsync(directory: string, options: CollectFilesOptions): Promise<CollectFilesResult> {
  const { excludePatterns: baseExcludePatterns } = options;

  // Load project-specific ignore patterns from .ultracodeignore
  const ignorePatterns = loadIgnoreFile(directory);
  const excludePatterns = [...baseExcludePatterns, ...ignorePatterns];

  const startTime = Date.now();

  let files: string[];
  let dirsScanned = 0;
  let excludedByPattern = 0;
  const excludedByDefault = 0;
  let method: "bun_glob" | "fast_glob";

  // Use Bun.Glob when available (native, 3x faster with ignore patterns)
  if (isBunRuntime() && (globalThis as unknown as { Bun?: { Glob?: BunGlob } }).Bun?.Glob) {
    method = "bun_glob";
    const result = await collectFilesWithBunGlob(directory, excludePatterns);
    files = result.files;
    excludedByPattern = result.excludedByPattern;
    // Bun.Glob doesn't track dirs scanned, estimate from file paths
    const uniqueDirs = new Set(files.map((f) => relative(directory, f).split(/[/\\]/)[0]));
    dirsScanned = uniqueDirs.size;
  } else {
    // Node.js: use fast-glob with ignore patterns - skips excluded directories entirely
    method = "fast_glob";
    const result = await collectFilesWithFastGlob(directory, excludePatterns);
    files = result.files;
    excludedByPattern = result.excludedByPattern;
    // Estimate dirs from file paths
    const uniqueDirs = new Set(files.map((f) => relative(directory, f).split(/[/\\]/)[0]));
    dirsScanned = uniqueDirs.size;
  }

  const elapsed = Date.now() - startTime;

  // Count files by extension for diagnostics
  const extStats: Record<string, number> = {};
  for (const f of files) {
    const ext = extname(f).toLowerCase() || "(no ext)";
    extStats[ext] = (extStats[ext] || 0) + 1;
  }

  log.i("FILESCAN", "scan_done", {
    root: directory,
    dirs: dirsScanned,
    files: files.length,
    excludedPat: excludedByPattern,
    excludedDef: excludedByDefault,
    elapsed: `${elapsed}ms`,
    method,
  });

  return {
    files,
    stats: {
      dirsScanned,
      excludedByPattern,
      excludedByDefault,
      byExtension: extStats,
    },
  };
}
