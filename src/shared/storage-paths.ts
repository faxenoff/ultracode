/**
 * Storage paths management for UltraCode
 *
 * All data is stored in a central location:
 * - Windows: %LOCALAPPDATA%\UltraCode\
 * - macOS: ~/Library/Application Support/UltraCode/
 * - Linux: ~/.local/share/UltraCode/
 */

import { execSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

import { hashText } from "../utils/fast-hash.js";

// =============================================================================
// Base Directory
// =============================================================================

/**
 * Get the base data directory for UltraCode
 */
export function getDataDir(): string {
  let baseDir: string;

  switch (process.platform) {
    case "win32":
      baseDir = process.env["LOCALAPPDATA"] || join(homedir(), "AppData", "Local");
      break;
    case "darwin":
      baseDir = join(homedir(), "Library", "Application Support");
      break;
    default:
      // Linux and others
      baseDir = process.env["XDG_DATA_HOME"] || join(homedir(), ".local", "share");
  }

  return join(baseDir, "UltraCode");
}

/**
 * Ensure the data directory exists
 */
export function ensureDataDir(): string {
  const dir = getDataDir();
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  return dir;
}

// =============================================================================
// IPC Socket Path
// =============================================================================

/**
 * Get the IPC socket/pipe path
 */
export function getIPCSocketPath(): string {
  if (process.platform === "win32") {
    return "\\\\.\\pipe\\ultracode-core";
  }
  return "/tmp/ultracode-core.sock";
}

// =============================================================================
// Subdirectories
// =============================================================================

export function getLogsDir(): string {
  return join(getDataDir(), "logs");
}

export function getCacheDir(): string {
  return join(getDataDir(), "cache");
}

export function getProjectsDir(): string {
  return join(getDataDir(), "projects");
}

export function getModelsDir(): string {
  return join(getDataDir(), "models");
}

export function getConfigDir(): string {
  return join(getDataDir(), "config");
}

export function getConfigPath(): string {
  return join(getDataDir(), "config.yaml");
}

export function getSemanticConfigPath(): string {
  return join(getConfigDir(), "semantic-config.json");
}

export function getCorePidPath(): string {
  return join(getDataDir(), "core.pid");
}

export function getCoreLockPath(): string {
  return join(getDataDir(), "core.lock");
}

// =============================================================================
// Project-specific paths
// =============================================================================

/**
 * Generate a stable hash for a project path
 * Uses xxHash (initialized at module load, no fallback race condition)
 */
export function hashProjectPath(projectPath: string): string {
  if (!projectPath) {
    throw new Error(
      `hashProjectPath: projectPath must not be empty (got ${JSON.stringify(projectPath)}). ` +
        "Ensure projectPath is provided in tool args or resolved from session/context.",
    );
  }
  // Normalize path for consistent hashing
  const normalized = projectPath.toLowerCase().replace(/\\/g, "/").replace(/\/$/, "");
  return hashText(normalized);
}

/**
 * Get the directory for a specific project
 * @deprecated Use getGlobalDbPaths() for unified database access
 */
export function getProjectDir(projectPath: string): string {
  const hash = hashProjectPath(projectPath);
  return join(getProjectsDir(), hash);
}

/**
 * Get paths for project databases
 * @deprecated Use getGlobalDbPaths() for unified database access
 */
export function getProjectPaths(projectPath: string) {
  const projectDir = getProjectDir(projectPath);

  return {
    dir: projectDir,
    metaPath: join(projectDir, "meta.json"),
    graphDbPath: join(projectDir, "graph.db"),
    vectorsDbPath: join(projectDir, "vectors.db"),
    branchesDir: join(projectDir, "branches"),
    // Cache persistence paths
    parserCachePath: join(projectDir, "parser-cache.json"),
    semanticCachePath: join(projectDir, "semantic-cache.json"),
  };
}

// =============================================================================
// UNIFIED DATABASE ARCHITECTURE
// =============================================================================

/**
 * UNIFIED DATABASE DESIGN
 *
 * All projects and branches share a single database with composite keys:
 *
 * Tables structure:
 * - entities: PRIMARY KEY (project_hash, branch_name, id)
 * - relationships: PRIMARY KEY (project_hash, branch_name, id)
 * - doc_embeddings: PRIMARY KEY (project_hash, branch_name, id)
 * - files: PRIMARY KEY (project_hash, branch_name, path)
 *
 * Indexing strategy:
 * - Composite indexes (project_hash, branch_name, ...) for efficient filtering
 * - SQLite B-tree provides O(log n) seeks, no full table scans
 * - With 10 projects × 1M rows, query for 1000-row project reads only ~1000 rows
 *
 * Branch handling:
 * - Default branch: "main" or "master" (auto-detected)
 * - Branch switch = just change query parameter, no DB reconnection
 * - Cross-branch queries possible: "compare feature/x with main"
 *
 * Benefits over per-project DBs:
 * - No context switching complexity (reinitializeForProject, switchProject)
 * - Cross-project queries: "find similar code in project A and B"
 * - Single connection pool, simpler resource management
 * - Atomic cross-project operations possible
 */

/**
 * Get paths for the global unified database
 * All projects share the same database files with project_hash partitioning
 *
 * Current architecture (v6+):
 * - 4 split databases: graph.db, semantic.db, versioning.db, cache.db
 * - FAISS indexes: Per-project at projects/{hash}/faiss-{branch}.bin
 */
export function getGlobalDbPaths() {
  const dataDir = getDataDir();

  return {
    dir: dataDir,
    /** @deprecated Use multi-db paths instead */
    graphDbPath: join(dataDir, "graph.db"),
    /** @deprecated FAISS is used for vectors, not SQLite */
    vectorsDbPath: join(dataDir, "graph.db"),
    /** @deprecated Use getMultiDbPaths() instead */
    unifiedDbPath: join(dataDir, "graph.db"),
    metaPath: join(dataDir, "global-meta.json"),
    cacheDir: getCacheDir(),
    projectsDir: getProjectsDir(),
  };
}

/**
 * Get paths for the 4 split databases.
 * Each database handles independent data groups for parallel I/O.
 */
export function getMultiDbPaths(basePath?: string) {
  const dir = basePath ?? getDataDir();
  return {
    graph: join(dir, "graph.db"),
    semantic: join(dir, "semantic.db"),
    versioning: join(dir, "versioning.db"),
    cache: join(dir, "cache.db"),
  };
}

/**
 * Get project hash for use in queries
 * Returns the xxHash32 of the normalized project path
 */
export function getProjectHash(projectPath: string): string {
  return hashProjectPath(projectPath);
}

/**
 * Get branch name for use in queries
 * Sanitizes branch name for safe storage (replaces special chars)
 */
export function normalizeBranchName(branchName: string): string {
  // Normalize branch name: lowercase, replace problematic chars
  return branchName.toLowerCase().replace(/[<>:"/\\|?*]/g, "_");
}

/**
 * Default branch name - INTERNAL USE ONLY.
 * Prefer getCurrentGitBranch() which returns null if git unavailable.
 * @deprecated Use getCurrentGitBranch() and handle null case explicitly
 */
export const DEFAULT_BRANCH = "main";

/**
 * Common base branch names to check
 */
const BASE_BRANCH_CANDIDATES = ["main", "master", "dev", "develop", "trunk"];

/**
 * Check if a branch name is likely a base/main branch
 */
export function isBaseBranch(branchName: string | null): boolean {
  if (!branchName) return false;
  const normalized = branchName.toLowerCase();
  return BASE_BRANCH_CANDIDATES.includes(normalized);
}

/**
 * Get current Git branch name for a given directory.
 * Returns null if:
 * - Directory is not a git repository
 * - Git command fails
 * - Detached HEAD with no ref
 *
 * Caller MUST handle null case explicitly.
 */
export function getCurrentGitBranch(projectPath: string): string | null {
  if (!projectPath) {
    return null;
  }
  try {
    const gitDir = join(projectPath, ".git");
    if (!existsSync(gitDir)) {
      return null; // Not a git repo
    }
    const branch = execSync("git symbolic-ref --short HEAD", {
      cwd: projectPath,
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "ignore"],
      windowsHide: true,
    }).trim();
    return branch || null;
  } catch {
    // Fallback for detached HEAD or other issues
    try {
      const ref = execSync("git rev-parse --abbrev-ref HEAD", {
        cwd: projectPath,
        encoding: "utf-8",
        stdio: ["pipe", "pipe", "ignore"],
        windowsHide: true,
      }).trim();
      // "HEAD" means detached without ref - return detached-{hash}
      if (ref === "HEAD") {
        const hash = execSync("git rev-parse --short HEAD", {
          cwd: projectPath,
          encoding: "utf-8",
          stdio: ["pipe", "pipe", "ignore"],
          windowsHide: true,
        }).trim();
        return hash ? `detached-${hash}` : null;
      }
      return ref || null;
    } catch {
      return null; // Git unavailable or error
    }
  }
}

/**
 * Get current Git branch with fallback to DEFAULT_BRANCH.
 * Use this ONLY when you absolutely need a non-null value.
 * Prefer getCurrentGitBranch() and handle null explicitly.
 */
export function getCurrentGitBranchOrDefault(projectPath: string): string {
  return getCurrentGitBranch(projectPath) || DEFAULT_BRANCH;
}

/**
 * Ensure project directory exists
 */
export function ensureProjectDir(projectPath: string): string {
  const paths = getProjectPaths(projectPath);
  if (!existsSync(paths.dir)) {
    mkdirSync(paths.dir, { recursive: true });
  }
  return paths.dir;
}

/**
 * Ensure global database directory exists
 */
export function ensureGlobalDbDir(): string {
  const paths = getGlobalDbPaths();
  if (!existsSync(paths.dir)) {
    mkdirSync(paths.dir, { recursive: true });
  }
  return paths.dir;
}

/**
 * Get paths for a specific branch
 */
export function getBranchPaths(projectPath: string, branchName: string) {
  const { branchesDir } = getProjectPaths(projectPath);
  // Sanitize branch name for filesystem
  const safeBranchName = branchName.replace(/[<>:"/\\|?*]/g, "_");
  const branchDir = join(branchesDir, safeBranchName);

  return {
    dir: branchDir,
    graphDbPath: join(branchDir, "graph.db"),
    vectorsDbPath: join(branchDir, "vectors.db"),
  };
}

// =============================================================================
// FAISS Index Paths (per-project, branch-aware)
// =============================================================================

/**
 * Get FAISS index path for a specific project and branch
 * Structure: projects/{projectHash}/faiss-{branchName}.bin
 *
 * This allows:
 * - Separate FAISS indices per project
 * - Delta indices per branch (for fast branch switching)
 */
export function getFaissIndexPath(projectPath: string, branchName: string): string {
  const projectDir = getProjectDir(projectPath);
  const safeBranch = normalizeBranchName(branchName);

  // Ensure project directory exists
  if (!existsSync(projectDir)) {
    mkdirSync(projectDir, { recursive: true });
  }

  return join(projectDir, `faiss-${safeBranch}.bin`);
}

/**
 * Get FAISS index path using projectHash directly (when projectPath is not available)
 * Structure: projects/{projectHash}/faiss-{branchName}.bin
 */
export function getFaissIndexPathByHash(projectHash: string, branchName: string): string {
  const projectDir = join(getProjectsDir(), projectHash);
  const safeBranch = normalizeBranchName(branchName);

  // Ensure project directory exists
  if (!existsSync(projectDir)) {
    mkdirSync(projectDir, { recursive: true });
  }

  return join(projectDir, `faiss-${safeBranch}.bin`);
}

/**
 * Get FAISS ID mapping path (maps FAISS internal IDs to entity IDs)
 */
export function getFaissIdMapPath(projectPath: string, branchName: string): string {
  const projectDir = getProjectDir(projectPath);
  const safeBranch = normalizeBranchName(branchName);
  return join(projectDir, `faiss-${safeBranch}.idmap.json`);
}

/**
 * Get hot buffer path for delta changes before merge into main index
 */
export function getFaissHotBufferPath(projectPath: string, branchName: string): string {
  const projectDir = getProjectDir(projectPath);
  const safeBranch = normalizeBranchName(branchName);
  return join(projectDir, `faiss-${safeBranch}-hot.bin`);
}

// =============================================================================
// Cache paths
// =============================================================================

export function getTreeSitterCacheDir(): string {
  return join(getCacheDir(), "tree-sitter");
}

export function getASTCacheDir(): string {
  return join(getCacheDir(), "ast");
}

// =============================================================================
// Initialization
// =============================================================================

/**
 * Initialize all required directories
 */
export function initializeStorageDirs(): void {
  const dirs = [getDataDir(), getLogsDir(), getProjectsDir(), getModelsDir(), getConfigDir()];

  for (const dir of dirs) {
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
  }
}
