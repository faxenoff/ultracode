/**
 * Base Branch Detection
 *
 * Determines which branch should be the "base" for the layered FAISS index.
 * Priority:
 * 1. Existing base config (if project was already indexed)
 * 2. Git remote default branch (origin/HEAD)
 * 3. Common base branch names (main, master, dev, develop)
 * 4. First fully indexed branch becomes base
 */

import { execSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { log } from "../../logging/index.js";
import { getCurrentGitBranch, getProjectDir, getProjectHash, isBaseBranch } from "../../shared/storage-paths.js";
import type { BaseIndexMetadata } from "./layered-types.js";

// =============================================================================
// CONSTANTS
// =============================================================================

/** Common base branch names in priority order */
const BASE_BRANCH_CANDIDATES = ["main", "master", "dev", "develop", "trunk"];

/** File name for base index metadata */
const BASE_META_FILENAME = "faiss-base.meta.json";

// =============================================================================
// BASE CONFIG PERSISTENCE
// =============================================================================

/**
 * Get path to base index metadata file
 */
export function getBaseMetaPath(projectPath: string): string {
  return join(getProjectDir(projectPath), BASE_META_FILENAME);
}

/**
 * Get path to base index metadata file by project hash
 */
export function getBaseMetaPathByHash(projectHash: string): string {
  const { getProjectsDir } = require("../../shared/storage-paths.js");
  return join(getProjectsDir(), projectHash, BASE_META_FILENAME);
}

/**
 * Load existing base index metadata
 */
export function loadBaseMetadata(projectPath: string): BaseIndexMetadata | null {
  const metaPath = getBaseMetaPath(projectPath);

  if (!existsSync(metaPath)) {
    return null;
  }

  try {
    const data = readFileSync(metaPath, "utf-8");
    return JSON.parse(data) as BaseIndexMetadata;
  } catch (error) {
    log.w("BASE_DETECT", "meta_read_fail", { path: metaPath, err: String(error) });
    return null;
  }
}

/**
 * Save base index metadata
 */
export function saveBaseMetadata(projectPath: string, metadata: BaseIndexMetadata): void {
  const metaPath = getBaseMetaPath(projectPath);

  try {
    writeFileSync(metaPath, JSON.stringify(metadata, null, 2), "utf-8");
    log.d("BASE_DETECT", "meta_saved", { branch: metadata.baseBranch, path: metaPath });
  } catch (error) {
    log.e("BASE_DETECT", "meta_save_fail", { path: metaPath, err: String(error) });
  }
}

// =============================================================================
// GIT DETECTION
// =============================================================================

/**
 * Get list of local branch names
 */
function getLocalBranches(projectPath: string): string[] {
  try {
    const output = execSync("git branch --list", {
      cwd: projectPath,
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "ignore"],
      windowsHide: true,
    });

    return output
      .split("\n")
      .map((line) => line.trim().replace(/^\* /, "")) // Remove current branch marker
      .filter((name) => name.length > 0);
  } catch {
    return [];
  }
}

/**
 * Try to get the default branch from remote (origin/HEAD)
 */
function getRemoteDefaultBranch(projectPath: string): string | null {
  try {
    // Get symbolic ref of origin/HEAD
    const ref = execSync("git symbolic-ref refs/remotes/origin/HEAD", {
      cwd: projectPath,
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "ignore"],
      windowsHide: true,
    }).trim();

    // refs/remotes/origin/main → main
    const parts = ref.split("/");
    return parts[parts.length - 1] || null;
  } catch {
    // Remote HEAD not configured or no remote
    return null;
  }
}

// =============================================================================
// MAIN DETECTION LOGIC
// =============================================================================

/**
 * Detect base branch for a project
 *
 * Priority:
 * 1. Existing base config (from previous indexing)
 * 2. Git remote default branch (origin/HEAD)
 * 3. Common base branch names that exist locally
 * 4. Current branch (if first time indexing)
 * 5. null (no git repo)
 */
export function detectBaseBranch(projectPath: string): string | null {
  const projectHash = getProjectHash(projectPath);
  const metaPath = getBaseMetaPath(projectPath);

  log.d("BASE_DETECT", "start", {
    projectPath,
    projectHash,
    metaPath,
    metaExists: existsSync(metaPath),
  });

  // 1. Check existing base config
  const existingMeta = loadBaseMetadata(projectPath);
  if (existingMeta?.baseBranch) {
    log.d("BASE_DETECT", "using_existing", {
      project: projectHash,
      branch: existingMeta.baseBranch,
    });
    return existingMeta.baseBranch;
  }

  // 2. Try remote default branch
  const remoteDefault = getRemoteDefaultBranch(projectPath);
  if (remoteDefault) {
    log.d("BASE_DETECT", "using_remote_default", {
      project: projectHash,
      branch: remoteDefault,
    });
    return remoteDefault;
  }

  // 3. Check common base branch names
  const localBranches = getLocalBranches(projectPath);
  for (const candidate of BASE_BRANCH_CANDIDATES) {
    if (localBranches.includes(candidate)) {
      log.d("BASE_DETECT", "using_common_name", {
        project: projectHash,
        branch: candidate,
      });
      return candidate;
    }
  }

  // 4. Use current branch
  const currentBranch = getCurrentGitBranch(projectPath);
  if (currentBranch) {
    log.d("BASE_DETECT", "using_current", {
      project: projectHash,
      branch: currentBranch,
    });
    return currentBranch;
  }

  // 5. Not a git repo
  log.w("BASE_DETECT", "no_git_repo", { project: projectHash });
  return null;
}

/**
 * Check if current branch should be the base
 *
 * Returns true if:
 * - No base config exists (first time indexing)
 * - Current branch matches base config
 * - Current branch is a known base branch name
 */
export function shouldUseCurrentAsBase(projectPath: string): boolean {
  const currentBranch = getCurrentGitBranch(projectPath);
  if (!currentBranch) {
    return false;
  }

  // Check existing config
  const existingMeta = loadBaseMetadata(projectPath);
  if (existingMeta?.baseBranch) {
    return existingMeta.baseBranch === currentBranch;
  }

  // No config yet - current branch becomes base
  return true;
}

/**
 * Determine if a branch should use delta storage
 *
 * Returns true if:
 * - Base branch is configured
 * - Current branch is different from base
 * - Current branch is not a known base branch name
 */
export function shouldUseDelta(projectPath: string, branchName: string): boolean {
  const existingMeta = loadBaseMetadata(projectPath);

  // No base configured yet - everything goes to base
  if (!existingMeta?.baseBranch) {
    return false;
  }

  // On base branch - don't use delta
  if (existingMeta.baseBranch === branchName) {
    return false;
  }

  // Check if this is itself a common base branch
  // (e.g., switching from main to master shouldn't create delta)
  if (isBaseBranch(branchName)) {
    log.d("BASE_DETECT", "branch_is_base_type", { branch: branchName });
    // Could be a migration scenario - still use delta for safety
  }

  return true;
}

/**
 * Create initial base metadata when first indexing
 */
export function createInitialBaseMetadata(
  projectPath: string,
  branchName: string,
  dimensions: number,
  vectorCount = 0,
  indexType: "flat" | "hnsw" | "ivf" | "ivfpq" | "ivfsq" = "ivfsq",
): BaseIndexMetadata {
  const metadata: BaseIndexMetadata = {
    baseBranch: branchName,
    vectorCount,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    dimensions,
    indexType,
  };

  // Try to get current commit hash
  try {
    const commit = execSync("git rev-parse --short HEAD", {
      cwd: projectPath,
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "ignore"],
      windowsHide: true,
    }).trim();

    if (commit) {
      metadata.baseCommit = commit;
    }
  } catch {
    // Ignore - commit is optional
  }

  saveBaseMetadata(projectPath, metadata);

  log.i("BASE_DETECT", "base_created", {
    project: getProjectHash(projectPath),
    branch: branchName,
    vectors: vectorCount,
    dimensions,
  });

  return metadata;
}

/**
 * Update base metadata after reindexing
 */
export function updateBaseMetadata(projectPath: string, vectorCount: number, commit?: string): void {
  const existing = loadBaseMetadata(projectPath);
  if (!existing) {
    log.w("BASE_DETECT", "update_no_existing", { project: getProjectHash(projectPath) });
    return;
  }

  existing.vectorCount = vectorCount;
  existing.updatedAt = Date.now();

  if (commit) {
    existing.baseCommit = commit;
  }

  saveBaseMetadata(projectPath, existing);
}
