/**
 * Git Watcher - Git Repository Change Detection
 *
 * Watches for Git branch changes and file modifications to trigger
 * automatic reindexing.
 *
 * Architecture References:
 * - Design Doc: docs/BRANCH_AWARE_INDEXING.md
 * - Branch Manager: src/core/branch-manager.ts
 * - Knowledge Bus: src/core/knowledge-bus.ts
 */

import { execSync } from "node:child_process";
import { existsSync, type FSWatcher, watch } from "node:fs";
import { join } from "node:path";
import { log } from "../logging/index.js";

// Event-driven architecture: git polling uses setInterval for Node.js, disabled for Bun

/** Check if running in Bun */
function isBunRuntime(): boolean {
  return typeof globalThis.Bun !== "undefined";
}

/**
 * Runtime-aware sleep - uses Bun.sleep for Bun, setTimeout for Node.js
 */
async function sleep(ms: number): Promise<void> {
  if (typeof globalThis.Bun !== "undefined" && typeof globalThis.Bun.sleep === "function") {
    await globalThis.Bun.sleep(ms);
  } else {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// =============================================================================
// 1. TYPES AND INTERFACES
// =============================================================================

export type BranchChangeCallback = (newBranch: string, oldBranch: string) => void;
export type CommitCallback = (commitHash: string) => void;
export type FileChangeCallback = (files: string[]) => void;
/** Debounced callback with bulk mode flag */
export type DebouncedFileChangeCallback = (files: string[], bulkMode: boolean) => void;

export interface GitWatcherConfig {
  enabled: boolean;
  pollIntervalMs: number;
  autoReindex: boolean;
  /** Watch uncommitted file changes via git status polling */
  watchUncommitted?: boolean;
  /** Interval for uncommitted changes polling in ms (default: 10000) */
  uncommittedPollIntervalMs?: number;
  /** Include untracked (new) files in uncommitted watch (default: true) */
  includeUntracked?: boolean;
  /** Debounce delay for file changes in ms (default: 60000 = 1 min) */
  debounceMs?: number;
  /** Threshold for bulk mode (drop/rebuild index). Files > threshold = bulk mode */
  bulkModeThreshold?: number;
}

export interface FileChange {
  path: string;
  status: "added" | "modified" | "deleted" | "renamed";
}

// =============================================================================
// 2. GIT WATCHER IMPLEMENTATION
// =============================================================================

export class GitWatcher {
  private config: GitWatcherConfig;
  private repoPath: string | null = null;
  private watcher: FSWatcher | null = null;
  private commitPollRunning = false;
  private uncommittedPollRunning = false;
  private stopped = false; // Flag to stop async loops

  private currentBranch: string | null = null;
  private currentCommit: string | null = null;
  /** Tracks last known uncommitted files to detect changes */
  private lastUncommittedFiles: Set<string> = new Set();

  /** Debounce: accumulated pending changes */
  private pendingChanges: Set<string> = new Set();
  /** Debounce: abort controller for canceling pending debounce */
  private debounceAbortController: AbortController | null = null;
  /** Debounce delay in ms */
  private debounceMs: number;
  /** Bulk mode threshold */
  private bulkModeThreshold: number;

  private branchChangeCallbacks: BranchChangeCallback[] = [];
  private commitCallbacks: CommitCallback[] = [];
  private fileChangeCallbacks: FileChangeCallback[] = [];
  /** Callbacks specifically for uncommitted file changes */
  private uncommittedChangeCallbacks: FileChangeCallback[] = [];
  /** Debounced callbacks with bulk mode flag */
  private debouncedChangeCallbacks: DebouncedFileChangeCallback[] = [];

  constructor(config: GitWatcherConfig) {
    this.config = {
      ...config,
      watchUncommitted: config.watchUncommitted ?? true,
      uncommittedPollIntervalMs: config.uncommittedPollIntervalMs ?? 10000,
      includeUntracked: config.includeUntracked ?? true,
    };
    // Debounce: wait 60 seconds after last change before processing
    this.debounceMs = config.debounceMs ?? 60_000;
    // Bulk mode: if more than 1000 files changed, use drop/rebuild index
    this.bulkModeThreshold = config.bulkModeThreshold ?? 1000;
  }

  /**
   * Start watching a Git repository
   */
  startWatching(repoPath: string): void {
    if (!this.config.enabled) {
      log.i("GITWATCHER", "disabled");
      return;
    }

    this.repoPath = repoPath;
    const gitHeadPath = join(repoPath, ".git", "HEAD");

    if (!existsSync(gitHeadPath)) {
      log.i("GITWATCHER", "no_git_dir");
      return;
    }

    // Initialize current state
    this.currentBranch = this.getCurrentBranch();
    this.currentCommit = this.getCurrentCommit();

    log.i("GITWATCHER", "started", { path: repoPath });
    log.i("GITWATCHER", "current_branch", { branch: this.currentBranch });
    log.i("GITWATCHER", "current_commit", { commit: this.currentCommit });

    // Reset stop flag for new watching session
    this.stopped = false;

    // Close existing watcher to prevent leaks on repeated startWatching calls
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
    }

    // Watch .git/HEAD for branch changes
    this.watcher = watch(gitHeadPath, (eventType) => {
      if (eventType === "change") {
        this.checkBranchChange();
      }
    });

    // Start async loop for commit changes (safe for Bun + OpenVINO)
    this.startCommitPollLoop();

    // Poll for uncommitted file changes (working directory)
    if (this.config.watchUncommitted) {
      log.i("GITWATCHER", "uncommitted_watch_on", { interval: this.config.uncommittedPollIntervalMs });

      // Initial check to populate lastUncommittedFiles
      this.getUncommittedFiles().then((files) => {
        this.lastUncommittedFiles = new Set(files.map((f) => f.path));
        log.i("GITWATCHER", "init_uncommitted", { count: this.lastUncommittedFiles.size });
      });

      // Start async loop for uncommitted changes (safe for Bun + OpenVINO)
      this.startUncommittedPollLoop();
    }
  }

  /** Timer handles for Node.js setInterval */
  private commitPollTimer?: ReturnType<typeof setInterval> | undefined;
  private uncommittedPollTimer?: ReturnType<typeof setInterval> | undefined;

  /**
   * Start commit and branch polling
   * Node.js: uses setInterval
   * Bun: uses async loop with Bun.sleep
   * Also polls for branch changes as fs.watch() is unreliable on Windows
   */
  private startCommitPollLoop(): void {
    if (this.commitPollRunning) return;
    this.commitPollRunning = true;

    if (isBunRuntime()) {
      // Bun: use async loop with Bun.sleep
      (async () => {
        while (!this.stopped) {
          await sleep(this.config.pollIntervalMs);
          if (this.stopped) break;
          try {
            this.checkBranchChange();
            this.checkCommitChange();
          } catch (error) {
            log.w("GITWATCHER", "poll_err", { err: String(error) });
          }
        }
        this.commitPollRunning = false;
      })();
    } else {
      // Node.js: use setInterval
      this.commitPollTimer = setInterval(() => {
        if (!this.stopped) {
          try {
            this.checkBranchChange();
            this.checkCommitChange();
          } catch (error) {
            log.w("GITWATCHER", "poll_err", { err: String(error) });
          }
        }
      }, this.config.pollIntervalMs);
    }
  }

  /**
   * Start uncommitted file polling
   * Node.js: uses setInterval
   * Bun: uses async loop with Bun.sleep
   */
  private startUncommittedPollLoop(): void {
    if (this.uncommittedPollRunning) return;
    this.uncommittedPollRunning = true;

    if (isBunRuntime()) {
      // Bun: use async loop with Bun.sleep
      (async () => {
        while (!this.stopped) {
          await sleep(this.config.uncommittedPollIntervalMs!);
          if (this.stopped) break;
          try {
            await this.checkUncommittedChanges();
          } catch (error) {
            log.w("GITWATCHER", "uncommitted_poll_err", { err: String(error) });
          }
        }
        this.uncommittedPollRunning = false;
      })();
    } else {
      // Node.js: use setInterval
      this.uncommittedPollTimer = setInterval(() => {
        if (!this.stopped) {
          this.checkUncommittedChanges().catch((error) => {
            log.w("GITWATCHER", "uncommitted_poll_err", { err: String(error) });
          });
        }
      }, this.config.uncommittedPollIntervalMs!);
    }
  }

  /**
   * Get the current tracked branch name
   */
  getBranch(): string | null {
    return this.currentBranch;
  }

  /**
   * Check if watcher is currently active
   */
  isWatching(): boolean {
    return !this.stopped && (!!this.watcher || this.commitPollRunning || this.uncommittedPollRunning);
  }

  /**
   * Stop watching the repository
   */
  stopWatching(): void {
    // Stop all async loops
    this.stopped = true;

    // Clear timers
    if (this.commitPollTimer) {
      clearInterval(this.commitPollTimer);
      this.commitPollTimer = undefined;
    }
    if (this.uncommittedPollTimer) {
      clearInterval(this.uncommittedPollTimer);
      this.uncommittedPollTimer = undefined;
    }

    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
    }

    // Abort pending debounce
    if (this.debounceAbortController) {
      this.debounceAbortController.abort();
      this.debounceAbortController = null;
    }

    this.lastUncommittedFiles.clear();
    this.pendingChanges.clear();
    log.i("GITWATCHER", "stopped");
  }

  /**
   * Register callback for branch changes
   */
  onBranchChange(callback: BranchChangeCallback): void {
    this.branchChangeCallbacks.push(callback);
  }

  /**
   * Register callback for new commits
   */
  onCommit(callback: CommitCallback): void {
    this.commitCallbacks.push(callback);
  }

  /**
   * Register callback for file changes (after commits)
   */
  onFileChange(callback: FileChangeCallback): void {
    this.fileChangeCallbacks.push(callback);
  }

  /**
   * Register callback for uncommitted file changes (working directory)
   * These are files that have been modified but not yet committed
   */
  onUncommittedChange(callback: FileChangeCallback): void {
    this.uncommittedChangeCallbacks.push(callback);
  }

  /**
   * Register debounced callback for file changes.
   * Callback receives accumulated files after debounce period and bulk mode flag.
   * - bulkMode=true: many files changed, caller should drop/rebuild index
   * - bulkMode=false: few files changed, caller should use incremental insert
   */
  onDebouncedChange(callback: DebouncedFileChangeCallback): void {
    this.debouncedChangeCallbacks.push(callback);
  }

  /**
   * Get count of pending changes waiting for debounce
   */
  getPendingChangesCount(): number {
    return this.pendingChanges.size;
  }

  /**
   * Force flush pending changes immediately (bypasses debounce)
   */
  forceFlush(): void {
    if (this.debounceAbortController) {
      this.debounceAbortController.abort();
      this.debounceAbortController = null;
    }
    this.flushPendingChanges();
  }

  /**
   * Flush accumulated pending changes and trigger debounced callbacks
   */
  private flushPendingChanges(): void {
    if (this.pendingChanges.size === 0) return;

    const files = Array.from(this.pendingChanges);
    const bulkMode = files.length >= this.bulkModeThreshold;

    // Detect swagger file changes for special handling
    const swaggerFiles = files.filter((f) => {
      const lower = f.toLowerCase();
      return (
        lower.includes("swagger") ||
        lower.includes("openapi") ||
        (lower.endsWith(".json") && (lower.includes("api") || lower.includes("spec")))
      );
    });

    if (swaggerFiles.length > 0) {
      log.i("GITWATCHER", "swagger_files_changed", {
        swaggerFiles: swaggerFiles.length,
        files: swaggerFiles,
        warning: "Generated code may need regeneration",
      });
    }

    log.i("GITWATCHER", "flushing", {
      count: files.length,
      bulkMode,
      threshold: this.bulkModeThreshold,
      swaggerChanges: swaggerFiles.length,
    });

    // Clear pending changes
    this.pendingChanges.clear();

    // Trigger debounced callbacks
    for (const callback of this.debouncedChangeCallbacks) {
      try {
        callback(files, bulkMode);
      } catch (error) {
        log.w("GITWATCHER", "debounce_cb_err", { err: String(error) });
      }
    }
  }

  /**
   * Schedule debounced flush - resets timer on each call
   */
  private scheduleDebouncedFlush(): void {
    // Abort existing debounce
    if (this.debounceAbortController) {
      this.debounceAbortController.abort();
    }

    // Create new abort controller for this debounce cycle
    const abortController = new AbortController();
    this.debounceAbortController = abortController;

    // Schedule new flush using async sleep pattern (Bun compatible)
    (async () => {
      await sleep(this.debounceMs);
      if (!abortController.signal.aborted) {
        this.debounceAbortController = null;
        this.flushPendingChanges();
      }
    })();

    log.i("GITWATCHER", "debounce_scheduled", {
      pending: this.pendingChanges.size,
      flushInSec: this.debounceMs / 1000,
    });
  }

  /**
   * Get files changed since a specific commit/branch
   */
  async getChangedFiles(since: string): Promise<FileChange[]> {
    if (!this.repoPath) {
      return [];
    }

    try {
      // Get changed files between commits
      const output = execSync(`git diff --name-status ${since}..HEAD`, {
        cwd: this.repoPath,
        encoding: "utf-8",
        stdio: ["pipe", "pipe", "ignore"],
        windowsHide: true,
      });

      const changes: FileChange[] = [];
      const lines = output.trim().split("\n");

      for (const line of lines) {
        if (!line) continue;

        const [status, ...pathParts] = line.split("\t");
        if (!status) continue;

        const path = pathParts.join("\t");

        let changeStatus: FileChange["status"];
        switch (status[0]) {
          case "A":
            changeStatus = "added";
            break;
          case "M":
            changeStatus = "modified";
            break;
          case "D":
            changeStatus = "deleted";
            break;
          case "R":
            changeStatus = "renamed";
            break;
          default:
            changeStatus = "modified";
        }

        changes.push({ path, status: changeStatus });
      }

      return changes;
    } catch (error) {
      log.w("GITWATCHER", "get_changed_fail", { err: String(error) });
      return [];
    }
  }

  /**
   * Get changed files between two branches
   */
  async getChangedFilesBetweenBranches(oldBranch: string, newBranch: string): Promise<FileChange[]> {
    if (!this.repoPath) {
      return [];
    }

    try {
      const output = execSync(`git diff --name-status ${oldBranch}...${newBranch}`, {
        cwd: this.repoPath,
        encoding: "utf-8",
        stdio: ["pipe", "pipe", "ignore"],
        windowsHide: true,
      });

      const changes: FileChange[] = [];
      const lines = output.trim().split("\n");

      for (const line of lines) {
        if (!line) continue;

        const [status, ...pathParts] = line.split("\t");
        if (!status) continue;

        const path = pathParts.join("\t");

        let changeStatus: FileChange["status"];
        switch (status[0]) {
          case "A":
            changeStatus = "added";
            break;
          case "M":
            changeStatus = "modified";
            break;
          case "D":
            changeStatus = "deleted";
            break;
          case "R":
            changeStatus = "renamed";
            break;
          default:
            changeStatus = "modified";
        }

        changes.push({ path, status: changeStatus });
      }

      return changes;
    } catch (error) {
      log.w("GITWATCHER", "get_branch_diff_fail", { err: String(error) });
      return [];
    }
  }

  // =============================================================================
  // PRIVATE METHODS
  // =============================================================================

  private getCurrentBranch(): string | null {
    if (!this.repoPath) return null;

    try {
      const branch = execSync("git symbolic-ref --short HEAD", {
        cwd: this.repoPath,
        encoding: "utf-8",
        stdio: ["pipe", "pipe", "ignore"],
        windowsHide: true,
      }).trim();

      return branch;
    } catch {
      // Detached HEAD
      try {
        const hash = execSync("git rev-parse --short HEAD", {
          cwd: this.repoPath,
          encoding: "utf-8",
          stdio: ["pipe", "pipe", "ignore"],
          windowsHide: true,
        }).trim();
        return `detached-${hash}`;
      } catch {
        return null;
      }
    }
  }

  private getCurrentCommit(): string | null {
    if (!this.repoPath) return null;

    try {
      const commit = execSync("git rev-parse HEAD", {
        cwd: this.repoPath,
        encoding: "utf-8",
        stdio: ["pipe", "pipe", "ignore"],
        windowsHide: true,
      }).trim();

      return commit;
    } catch {
      return null;
    }
  }

  private checkBranchChange(): void {
    const newBranch = this.getCurrentBranch();

    if (newBranch && newBranch !== this.currentBranch) {
      const oldBranch = this.currentBranch || "unknown";
      log.i("GITWATCHER", "branch_changed", { from: oldBranch, to: newBranch });

      this.currentBranch = newBranch;
      this.currentCommit = this.getCurrentCommit();

      // Trigger callbacks (handle async rejections properly)
      for (const callback of this.branchChangeCallbacks) {
        try {
          const result: unknown = callback(newBranch, oldBranch);
          if (result && typeof (result as Promise<void>).catch === "function") {
            (result as Promise<void>).catch((error) => {
              log.e("GITWATCHER", "branch_cb_async_err", { err: String(error) });
            });
          }
        } catch (error) {
          log.w("GITWATCHER", "branch_cb_err", { err: String(error) });
        }
      }
    }
  }

  private checkCommitChange(): void {
    const newCommit = this.getCurrentCommit();

    if (newCommit && newCommit !== this.currentCommit) {
      log.i("GITWATCHER", "new_commit", { commit: newCommit.slice(0, 8) });

      const oldCommit = this.currentCommit;
      this.currentCommit = newCommit;

      // Trigger callbacks
      for (const callback of this.commitCallbacks) {
        try {
          callback(newCommit);
        } catch (error) {
          log.w("GITWATCHER", "commit_cb_err", { err: String(error) });
        }
      }

      // Get changed files since last commit
      if (oldCommit) {
        this.getChangedFiles(oldCommit).then((files) => {
          if (files.length > 0) {
            for (const callback of this.fileChangeCallbacks) {
              try {
                callback(files.map((f) => f.path));
              } catch (error) {
                log.w("GITWATCHER", "file_cb_err", { err: String(error) });
              }
            }
          }
        });
      }

      // Clear uncommitted tracking after commit (files are now committed)
      this.lastUncommittedFiles.clear();
    }
  }

  /**
   * Get uncommitted files (modified + staged + optionally untracked)
   * Uses `git status --porcelain` for efficient parsing
   */
  async getUncommittedFiles(): Promise<FileChange[]> {
    if (!this.repoPath) {
      return [];
    }

    try {
      // --porcelain gives machine-readable output
      // -uall shows all untracked files (not just directories)
      const untrackedFlag = this.config.includeUntracked ? "-uall" : "-uno";
      const output = execSync(`git status --porcelain ${untrackedFlag}`, {
        cwd: this.repoPath,
        encoding: "utf-8",
        stdio: ["pipe", "pipe", "ignore"],
        windowsHide: true,
      });

      const changes: FileChange[] = [];
      const lines = output.trim().split("\n");

      for (const line of lines) {
        if (!line || line.length < 3) continue;

        // Format: XY PATH or XY ORIG -> PATH (for renames)
        const indexStatus = line[0]; // Status in index (staged)
        const workTreeStatus = line[1]; // Status in work tree
        const filePath = line.slice(3).split(" -> ").pop() || line.slice(3);

        // Determine change type based on status codes
        let changeStatus: FileChange["status"];

        // Prioritize work tree status, then index status
        const status = workTreeStatus !== " " ? workTreeStatus : indexStatus;

        switch (status) {
          case "A":
          case "?": // Untracked = new file
            changeStatus = "added";
            break;
          case "M":
            changeStatus = "modified";
            break;
          case "D":
            changeStatus = "deleted";
            break;
          case "R":
            changeStatus = "renamed";
            break;
          default:
            changeStatus = "modified";
        }

        changes.push({ path: filePath, status: changeStatus });
      }

      return changes;
    } catch (error) {
      log.w("GITWATCHER", "get_uncommitted_fail", { err: String(error) });
      return [];
    }
  }

  /**
   * Check for uncommitted file changes and trigger callbacks
   */
  private async checkUncommittedChanges(): Promise<void> {
    const currentFiles = await this.getUncommittedFiles();
    const currentSet = new Set(currentFiles.map((f) => f.path));

    // Find changed files (new, modified, or removed from uncommitted list)
    const changedFiles: string[] = [];

    // Files that are now uncommitted but weren't before
    for (const file of currentFiles) {
      if (!this.lastUncommittedFiles.has(file.path)) {
        changedFiles.push(file.path);
      }
    }

    // Files that were uncommitted but now aren't (could be reverted or staged differently)
    // We also track these as they might need reindexing
    for (const filePath of this.lastUncommittedFiles) {
      if (!currentSet.has(filePath)) {
        changedFiles.push(filePath);
      }
    }

    // Update tracking
    this.lastUncommittedFiles = currentSet;

    // Trigger callbacks if there are changes
    if (changedFiles.length > 0) {
      log.i("GITWATCHER", "uncommitted_detected", { count: changedFiles.length });

      // Immediate callbacks (legacy, for non-debounced consumers)
      for (const callback of this.uncommittedChangeCallbacks) {
        try {
          callback(changedFiles);
        } catch (error) {
          log.w("GITWATCHER", "uncommitted_cb_err", { err: String(error) });
        }
      }

      // Also trigger general file change callbacks (immediate)
      for (const callback of this.fileChangeCallbacks) {
        try {
          callback(changedFiles);
        } catch (error) {
          log.w("GITWATCHER", "file_cb_err", { err: String(error) });
        }
      }

      // Accumulate for debounced callbacks (for embedding generation)
      if (this.debouncedChangeCallbacks.length > 0) {
        for (const file of changedFiles) {
          this.pendingChanges.add(file);
        }
        // Reset debounce timer - waits for user to stop editing
        this.scheduleDebouncedFlush();
      }
    }
  }
}
