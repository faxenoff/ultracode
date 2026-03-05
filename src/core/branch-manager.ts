/**
 * Branch Manager - Branch-Aware Database Management
 *
 * Manages per-branch databases for Git repositories to ensure accurate indexing
 * when users switch branches or make large code changes.
 *
 * Architecture References:
 * - Design Doc: docs/BRANCH_AWARE_INDEXING.md
 * - SQLite Manager: src/storage/sqlite-manager.ts
 * - Config: src/config/yaml-config.ts
 */

import { execSync } from "node:child_process";
import { join } from "node:path";
import { log } from "../logging/index.js";
import { getProjectHash } from "../shared/storage-paths.js";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readTextSync,
  statSync,
  unlinkSync,
  writeFileSync,
} from "../utils/file-ops.js";

// =============================================================================
// 1. TYPES AND INTERFACES
// =============================================================================

export interface BranchMetadata {
  branch: string;
  repositoryPath: string;
  repositoryHash: string;
  lastCommitHash: string | null;
  lastIndexedAt: number;
  fileCount: number;
  entityCount: number;
  relationshipCount: number;
  indexVersion: string;
  accessedAt: number;
}

export interface BranchInfo {
  name: string;
  dbPath: string;
  lastAccessed: number;
  sizeBytes: number;
  metadata: BranchMetadata | null;
}

export interface BranchRegistryEntry {
  dbPath: string;
  lastAccessed: number;
  sizeBytes: number;
}

export interface BranchRegistry {
  repositories: Record<
    string,
    {
      path: string;
      branches: Record<string, BranchRegistryEntry>;
    }
  >;
  config: {
    maxBranchesPerRepo: number;
    maxTotalBranches: number;
    evictionStrategy: "LRU" | "LFU" | "FIFO";
  };
}

export interface BranchManagerConfig {
  enabled: boolean;
  dataDir: string;
  maxBranchesPerRepo: number;
  maxTotalBranches: number;
  evictionStrategy: "LRU" | "LFU" | "FIFO";
}

// =============================================================================
// 2. BRANCH MANAGER IMPLEMENTATION
// =============================================================================

export class BranchManager {
  private config: BranchManagerConfig;
  private registryPath: string;
  private registry: BranchRegistry;
  private currentBranch: string | null = null;
  private currentRepoPath: string | null = null;

  constructor(config: BranchManagerConfig) {
    this.config = config;
    this.registryPath = join(config.dataDir, "branch-registry.json");
    this.registry = this.loadRegistry();
  }

  /**
   * Get projects directory (centralized storage for all repos/branches)
   */
  private getProjectsDir(): string {
    return join(this.config.dataDir, "projects");
  }

  /**
   * Initialize the branch manager (no-op, kept for API compatibility)
   */
  async initialize(): Promise<void> {
    // Hash is now handled by getProjectHash() from storage-paths.ts
  }

  /**
   * Get current Git branch name
   */
  getCurrentBranch(repoPath?: string): string | null {
    const path = repoPath || this.currentRepoPath || process.cwd();

    try {
      const gitDir = join(path, ".git");
      if (!existsSync(gitDir)) {
        log.d("BRANCHMGR", "no_git_dir", { path });
        return null;
      }

      // Try symbolic-ref first (works for regular branches)
      try {
        const branch = execSync("git symbolic-ref --short HEAD", {
          cwd: path,
          encoding: "utf-8",
          stdio: ["pipe", "pipe", "ignore"],
          windowsHide: true,
        }).trim();

        this.currentBranch = branch;
        this.currentRepoPath = path;
        return branch;
      } catch {
        // Detached HEAD - try describe or rev-parse
        try {
          const describe = execSync("git describe --tags --exact-match", {
            cwd: path,
            encoding: "utf-8",
            stdio: ["pipe", "pipe", "ignore"],
            windowsHide: true,
          }).trim();
          this.currentBranch = `detached-${describe}`;
          this.currentRepoPath = path;
          return this.currentBranch;
        } catch {
          // Use short commit hash
          const hash = execSync("git rev-parse --short HEAD", {
            cwd: path,
            encoding: "utf-8",
            stdio: ["pipe", "pipe", "ignore"],
            windowsHide: true,
          }).trim();
          this.currentBranch = `detached-${hash}`;
          this.currentRepoPath = path;
          return this.currentBranch;
        }
      }
    } catch (error) {
      log.d("BRANCHMGR", "branch_get_fail", { err: String(error) });
      return null;
    }
  }

  /**
   * Get last commit hash for current branch
   */
  getLastCommitHash(repoPath?: string): string | null {
    const path = repoPath || this.currentRepoPath || process.cwd();

    try {
      const hash = execSync("git rev-parse HEAD", {
        cwd: path,
        encoding: "utf-8",
        stdio: ["pipe", "pipe", "ignore"],
        windowsHide: true,
      }).trim();
      return hash;
    } catch (error) {
      log.d("BRANCHMGR", "commit_hash_fail", { err: String(error) });
      return null;
    }
  }

  /**
   * Get repository hash for path isolation
   * Uses the same hash as storage-paths.ts for consistency
   */
  getRepositoryHash(repoPath: string): string {
    // Use centralized getProjectHash for consistent hashing across the codebase
    return getProjectHash(repoPath);
  }

  /**
   * Sanitize branch name for filesystem
   */
  sanitizeBranchName(branch: string): string {
    return branch
      .replace(/\//g, "-")
      .replace(/\\/g, "-")
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .replace(/^-+|-+$/g, "");
  }

  /**
   * Get database path for a specific branch
   * Returns the unified storage database path (same for all branches)
   */
  getBranchDbPath(_branch: string, _repoPath?: string): string {
    // Multi-db storage: graph.db is the primary database
    return join(this.config.dataDir, "graph.db");
  }

  /**
   * Get FAISS index path for a specific branch
   */
  getFaissIndexPath(branch: string, repoPath?: string): string {
    const path = repoPath || this.currentRepoPath || process.cwd();
    const repoHash = this.getRepositoryHash(path);
    const sanitizedBranch = this.sanitizeBranchName(branch);
    return join(this.getProjectsDir(), repoHash, `faiss-${sanitizedBranch}.bin`);
  }

  /**
   * Get metadata for a branch
   */
  getBranchMetadata(branch: string, repoPath?: string): BranchMetadata | null {
    const path = repoPath || this.currentRepoPath || process.cwd();
    const repoHash = this.getRepositoryHash(path);
    const sanitizedBranch = this.sanitizeBranchName(branch);
    const metadataPath = join(this.getProjectsDir(), repoHash, sanitizedBranch, "metadata.json");

    if (!existsSync(metadataPath)) {
      return null;
    }

    try {
      const data = readTextSync(metadataPath);
      return JSON.parse(data);
    } catch (error) {
      log.e("BRANCHMGR", "metadata_read_fail", { err: String(error) });
      return null;
    }
  }

  /**
   * Update branch metadata
   */
  updateBranchMetadata(metadata: BranchMetadata): void {
    const sanitizedBranch = this.sanitizeBranchName(metadata.branch);
    const metadataPath = join(this.getProjectsDir(), metadata.repositoryHash, sanitizedBranch, "metadata.json");

    const dir = join(this.getProjectsDir(), metadata.repositoryHash, sanitizedBranch);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    writeFileSync(metadataPath, JSON.stringify(metadata, null, 2), "utf-8");

    // Update registry
    this.updateRegistry(metadata.repositoryPath, metadata.branch, metadataPath);
  }

  /**
   * Get all indexed branches for a repository
   * Detects branches by FAISS index files (faiss-{branch}.bin)
   */
  getActiveBranches(repoPath?: string): BranchInfo[] {
    const path = repoPath || this.currentRepoPath || process.cwd();
    const repoHash = this.getRepositoryHash(path);
    const repoDir = join(this.getProjectsDir(), repoHash);

    if (!existsSync(repoDir)) {
      return [];
    }

    const branches: BranchInfo[] = [];
    const files = readdirSync(repoDir);

    // Find FAISS index files: faiss-{branch}.bin
    const faissPattern = /^faiss-(.+)\.bin$/;
    for (const file of files) {
      const match = file.match(faissPattern);
      if (!match || !match[1]) continue;

      const branchName: string = match[1];
      const faissPath = join(repoDir, file);
      const stats = statSync(faissPath);

      // Try to load metadata from branch subdirectory
      const metadata = this.getBranchMetadata(branchName, path);

      branches.push({
        name: branchName,
        dbPath: faissPath,
        lastAccessed: metadata?.accessedAt || stats.mtimeMs,
        sizeBytes: stats.size,
        metadata,
      });
    }

    return branches.sort((a, b) => b.lastAccessed - a.lastAccessed);
  }

  /**
   * Cleanup old branches using LRU eviction
   */
  async cleanupOldBranches(keep?: number): Promise<number> {
    const keepCount = keep || this.config.maxBranchesPerRepo;
    const branches = this.getActiveBranches();

    if (branches.length <= keepCount) {
      return 0;
    }

    // Sort by last accessed (LRU)
    const toDelete = branches.slice(keepCount);
    let deletedCount = 0;

    for (const branch of toDelete) {
      try {
        const branchDir = join(this.getProjectsDir(), branch.metadata?.repositoryHash || "", branch.name);

        // Delete all files in branch directory
        const files = readdirSync(branchDir);
        for (const file of files) {
          unlinkSync(join(branchDir, file));
        }

        // Remove from registry
        if (branch.metadata) {
          this.removeFromRegistry(branch.metadata.repositoryPath, branch.name);
        }

        deletedCount++;
        log.i("BRANCHMGR", "branch_cleaned", { branch: branch.name });
      } catch (error) {
        log.e("BRANCHMGR", "cleanup_fail", { branch: branch.name, err: String(error) });
      }
    }

    return deletedCount;
  }

  /**
   * Switch to a different branch
   */
  async switchBranch(newBranch: string, repoPath?: string): Promise<void> {
    const path = repoPath || this.currentRepoPath || process.cwd();
    const oldBranch = this.currentBranch;

    this.currentBranch = newBranch;
    this.currentRepoPath = path;

    log.i("BRANCHMGR", "branch_switched", { from: oldBranch, to: newBranch });

    // Update access time in metadata
    const metadata = this.getBranchMetadata(newBranch, path);
    if (metadata) {
      metadata.accessedAt = Date.now();
      this.updateBranchMetadata(metadata);
    }
  }

  /**
   * Check if branch has been indexed (FAISS index exists)
   */
  hasBranchDatabase(branch: string, repoPath?: string): boolean {
    const faissPath = this.getFaissIndexPath(branch, repoPath);
    return existsSync(faissPath);
  }

  // =============================================================================
  // PRIVATE METHODS - Registry Management
  // =============================================================================

  private loadRegistry(): BranchRegistry {
    if (!existsSync(this.registryPath)) {
      return {
        repositories: {},
        config: {
          maxBranchesPerRepo: this.config.maxBranchesPerRepo,
          maxTotalBranches: this.config.maxTotalBranches,
          evictionStrategy: this.config.evictionStrategy,
        },
      };
    }

    try {
      const data = readTextSync(this.registryPath);
      return JSON.parse(data);
    } catch (error) {
      log.e("BRANCHMGR", "registry_load_fail", { err: String(error) });
      return {
        repositories: {},
        config: {
          maxBranchesPerRepo: this.config.maxBranchesPerRepo,
          maxTotalBranches: this.config.maxTotalBranches,
          evictionStrategy: this.config.evictionStrategy,
        },
      };
    }
  }

  private saveRegistry(): void {
    const dir = join(this.config.dataDir);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    writeFileSync(this.registryPath, JSON.stringify(this.registry, null, 2), "utf-8");
  }

  private updateRegistry(repoPath: string, branch: string, dbPath: string): void {
    const repoHash = this.getRepositoryHash(repoPath);

    if (!this.registry.repositories[repoHash]) {
      this.registry.repositories[repoHash] = {
        path: repoPath,
        branches: {},
      };
    }

    const sanitizedBranch = this.sanitizeBranchName(branch);
    const stats = existsSync(dbPath) ? statSync(dbPath) : { size: 0, mtimeMs: Date.now() };

    this.registry.repositories[repoHash].branches[sanitizedBranch] = {
      dbPath,
      lastAccessed: Date.now(),
      sizeBytes: stats.size,
    };

    this.saveRegistry();
  }

  private removeFromRegistry(repoPath: string, branch: string): void {
    const repoHash = this.getRepositoryHash(repoPath);
    const sanitizedBranch = this.sanitizeBranchName(branch);

    if (this.registry.repositories[repoHash]?.branches[sanitizedBranch]) {
      delete this.registry.repositories[repoHash].branches[sanitizedBranch];
      this.saveRegistry();
    }
  }
}
