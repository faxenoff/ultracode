/**
 * AutoDoc Watcher
 *
 * Automatically updates AUTODOC.md files when source code changes.
 * Uses debouncing to batch changes and avoid excessive updates.
 *
 * Features:
 * - Watches for file changes via KnowledgeBus
 * - Debounces updates (default 30-60 seconds)
 * - Incrementally updates only affected modules
 * - Updates line number references
 * - Adds/removes exported entities
 */

import path, { join } from "node:path";
import { type KnowledgeEntry, knowledgeBus } from "../../core/knowledge-bus.js";
import { log } from "../../logging/index.js";
import { fileExists, readdir, readText, setFileChangeHook, writeFile } from "../../utils/file-ops.js";
import { sleep } from "../../utils/runtime-detection.js";
import { generateModuleReadmeWithEntities, type ModuleInfo } from "../generator/doc-generator.js";
import { ClaudeCodeProvider } from "../llm/llm-provider.js";
import { updateAutodocContent } from "./autodoc-updater.js";
import { extractEntitiesFromContent, extractExportsFromFile, getModuleForFile } from "./module-resolver.js";

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

/**
 * Event data for index:completed event
 */
interface IndexCompletedEventData {
  directory?: string;
  [key: string]: unknown;
}

/**
 * Module info with LLM-generated descriptions (temporary runtime properties)
 */
interface ModuleInfoWithLLM extends ModuleInfo {
  _llmExportDescs?: Record<string, string>;
  _llmFileDescs?: Record<string, string>;
}

// =============================================================================
// CONFIGURATION
// =============================================================================

export interface AutoDocWatcherConfig {
  /** Debounce delay in milliseconds (default: 45000 = 45 seconds) */
  debounceMs?: number | undefined;
  /** Minimum debounce delay (default: 30000 = 30 seconds) */
  minDebounceMs?: number | undefined;
  /** Maximum debounce delay (default: 60000 = 60 seconds) */
  maxDebounceMs?: number | undefined;
  /** Root directory to watch */
  rootDir: string;
  /** Enable/disable watcher */
  enabled?: boolean | undefined;
  /** Use LLM for description generation */
  useLlm?: boolean | undefined;
  /** LLM provider config */
  llmConfig?:
    | {
        provider: "ollama" | "openai" | "tgi";
        model?: string | undefined;
        endpoint?: string | undefined;
      }
    | undefined;
}

interface PendingUpdate {
  modulePath: string;
  changedFiles: Set<string>;
  firstChangeAt: number;
  lastChangeAt: number;
}

const MODULE_DOC_FILENAME = "AUTODOC.md";

export class AutoDocWatcher {
  private config: {
    debounceMs: number;
    minDebounceMs: number;
    maxDebounceMs: number;
    rootDir: string;
    enabled: boolean;
    useLlm: boolean | undefined;
    llmConfig: AutoDocWatcherConfig["llmConfig"];
  };
  private pendingUpdates: Map<string, PendingUpdate> = new Map();
  private debounceControllers: Map<string, AbortController> = new Map();
  private subscriptionId: string | null = null;
  private isProcessing = false;
  private moduleCache: Map<string, ModuleInfo> = new Map();
  private moduleCacheControllers: Map<string, AbortController> = new Map();
  /** Cached result of .autodoc folder check */
  private autodocEnabled: boolean | null = null;
  private autodocCheckTime = 0;
  /** Cache TTL for .autodoc check (5 minutes) */
  private static readonly AUTODOC_CHECK_TTL = 5 * 60 * 1000;
  /** Cached LLM availability (lazy check) */
  private llmAvailabilityChecked = false;
  private llmAvailabilityResult = false;

  constructor(config: AutoDocWatcherConfig) {
    this.config = {
      debounceMs: config.debounceMs ?? 5000,
      minDebounceMs: config.minDebounceMs ?? 3000,
      maxDebounceMs: config.maxDebounceMs ?? 15000,
      rootDir: config.rootDir,
      enabled: config.enabled ?? true,
      useLlm: config.useLlm, // Keep undefined for lazy check
      llmConfig: config.llmConfig ?? { provider: "ollama" },
    };
  }

  /**
   * Check if LLM should be used (lazy detection if not explicitly configured)
   */
  private async shouldUseLlm(): Promise<boolean> {
    // If explicitly configured, use that value
    if (this.config.useLlm !== undefined) {
      return this.config.useLlm;
    }

    // Lazy check: detect LLM availability once
    if (!this.llmAvailabilityChecked) {
      this.llmAvailabilityChecked = true;
      try {
        const { detectLLMProviders } = await import("../llm/llm-provider.js");
        const { recommended } = await detectLLMProviders();
        this.llmAvailabilityResult = !!recommended;
        if (this.llmAvailabilityResult) {
          log.i("AUTODOCWATCH", "llm_auto_detected", { provider: recommended?.name });
        }
      } catch {
        this.llmAvailabilityResult = false;
      }
    }

    return this.llmAvailabilityResult;
  }

  /**
   * Check if .autodoc folder exists (with caching)
   */
  private async checkAutodocEnabled(): Promise<boolean> {
    const now = Date.now();
    if (this.autodocEnabled !== null && now - this.autodocCheckTime < AutoDocWatcher.AUTODOC_CHECK_TTL) {
      return this.autodocEnabled;
    }

    const autodocDir = join(this.config.rootDir, ".autodoc");
    this.autodocEnabled = await fileExists(autodocDir);
    this.autodocCheckTime = now;

    log.d("AUTODOCWATCH", "check_autodoc_dir", {
      rootDir: this.config.rootDir,
      autodocDir,
      exists: this.autodocEnabled,
    });

    return this.autodocEnabled;
  }

  /**
   * Invalidate autodoc enabled cache (call after index:completed)
   */
  private invalidateAutodocCache(): void {
    this.autodocEnabled = null;
    this.autodocCheckTime = 0;
  }

  /**
   * Start watching for file changes
   */
  async start(): Promise<void> {
    if (!this.config.enabled) {
      log.i("AUTODOCWATCH", "watcher_disabled");
      return;
    }

    if (this.subscriptionId) {
      log.w("AUTODOCWATCH", "already_started");
      return;
    }

    // Check if .autodoc folder exists
    const autodocEnabled = await this.checkAutodocEnabled();
    if (!autodocEnabled) {
      log.i("AUTODOCWATCH", "autodoc_folder_not_found", {
        root_dir: this.config.rootDir,
        hint: "Create .autodoc folder or run autodoc_generate to enable automatic documentation",
      });
    }

    // Subscribe to indexing events via KnowledgeBus
    // - index:complete: triggered after each file is indexed (incremental)
    // - index:completed: triggered after full indexing via tool
    // - semantic:new_entities: triggered when new entities are discovered
    this.subscriptionId = knowledgeBus.subscribe(
      "autodoc-watcher",
      /^(index:complete|index:completed|semantic:new_entities)$/,
      this.handleEvent.bind(this),
    );

    // Also register file-ops hook for direct file write notifications
    setFileChangeHook((filePath, operation) => {
      if (operation === "write") {
        // Only handle code files
        const ext = path.extname(filePath).toLowerCase();
        if ([".ts", ".js", ".tsx", ".jsx", ".mjs", ".cjs"].includes(ext)) {
          this.handleFileChange(filePath);
        }
      }
    });

    log.i("AUTODOCWATCH", "watcher_started", {
      root_dir: this.config.rootDir,
      debounce_ms: this.config.debounceMs,
      autodoc_enabled: autodocEnabled,
    });

    // Scan for modules without AUTODOC.md and create them (deferred to not block startup)
    if (autodocEnabled) {
      // Use async sleep pattern for Bun compatibility
      (async () => {
        await sleep(5000); // Wait 5 seconds after startup
        try {
          await this.scanAndCreateMissingAutodocs();
        } catch (err) {
          log.e("AUTODOCWATCH", "initial_scan_error", { error: String(err) });
        }
      })();
    }
  }

  /**
   * Scan for modules without AUTODOC.md and create them
   */
  private async scanAndCreateMissingAutodocs(): Promise<void> {
    log.i("AUTODOCWATCH", "scanning_for_missing_autodocs", { root: this.config.rootDir });

    try {
      const { scanModules } = await import("../generator/doc-generator.js");
      const modules = await scanModules(this.config.rootDir, {
        maxDepth: 4,
        concurrency: 8,
      });

      let created = 0;
      for (const mod of modules) {
        const autodocPath = path.join(mod.path, "AUTODOC.md");
        const exists = await fileExists(autodocPath);

        if (!exists) {
          const useLlm = await this.shouldUseLlm();
          log.i("AUTODOCWATCH", "creating_missing_autodoc", { module: mod.name, path: mod.path, useLlm });

          // Generate LLM descriptions first (includes export/file descriptions)
          let llmDescriptions:
            | { exportDescs?: Record<string, string> | undefined; fileDescs?: Record<string, string> | undefined }
            | undefined;
          if (useLlm) {
            const { generateModuleDescriptionLLM } = await import("./autodoc-updater.js");
            const desc = await generateModuleDescriptionLLM(mod, {
              useLlm,
              ...(this.config.llmConfig != null ? { llmConfig: this.config.llmConfig } : {}),
            });
            if (desc) {
              mod.description = desc;
              // Get parsed descriptions from moduleInfo (set by generateModuleDescriptionLLM)
              llmDescriptions = {
                exportDescs: (mod as ModuleInfoWithLLM)._llmExportDescs,
                fileDescs: (mod as ModuleInfoWithLLM)._llmFileDescs,
              };
            }
          }

          const content = await generateModuleReadmeWithEntities(mod, extractEntitiesFromContent, llmDescriptions);

          log.i("AUTODOCWATCH", "writing_autodoc", {
            module: mod.name,
            path: autodocPath,
            contentLength: content.length,
            hasModuleDesc: !!mod.description,
            hasExportDescs: !!llmDescriptions?.exportDescs && Object.keys(llmDescriptions.exportDescs).length > 0,
            hasFileDescs: !!llmDescriptions?.fileDescs && Object.keys(llmDescriptions.fileDescs).length > 0,
            source: "initial_scan",
          });

          await writeFile(autodocPath, content);
          created++;

          knowledgeBus.publish(
            "autodoc:created",
            {
              modulePath: mod.path,
              autodocPath,
              isNew: true,
              source: "initial_scan",
            },
            "autodoc-watcher",
          );
        }
      }

      if (created > 0) {
        log.i("AUTODOCWATCH", "initial_scan_created", { count: created, total_modules: modules.length });
        // Log Claude Code usage stats if used
        ClaudeCodeProvider.logUsageStats();
      } else {
        log.d("AUTODOCWATCH", "initial_scan_all_exist", { total_modules: modules.length });
      }
    } catch (error) {
      log.e("AUTODOCWATCH", "scan_modules_error", { error: String(error) });
    }
  }

  /**
   * Stop watching
   */
  stop(): void {
    if (this.subscriptionId) {
      knowledgeBus.unsubscribe(this.subscriptionId);
      this.subscriptionId = null;
    }

    // Remove file-ops hook
    setFileChangeHook(null);

    // Abort all pending debounce controllers
    for (const controller of this.debounceControllers.values()) {
      controller.abort();
    }
    this.debounceControllers.clear();
    this.pendingUpdates.clear();

    // Abort module cache controllers to prevent memory leaks
    for (const controller of this.moduleCacheControllers.values()) {
      controller.abort();
    }
    this.moduleCacheControllers.clear();
    this.moduleCache.clear();

    log.i("AUTODOCWATCH", "watcher_stopped");
  }

  /**
   * Handle incoming events from KnowledgeBus
   */
  private async handleEvent(entry: KnowledgeEntry): Promise<void> {
    const data = entry.data;

    switch (entry.topic) {
      case "index:complete":
        // Single file indexed - update its module's AUTODOC
        if (data && typeof data === "object" && "filePath" in data && data.filePath) {
          log.d("AUTODOCWATCH", "index_complete_event", { file: data.filePath as string });
          await this.handleFileChange(data.filePath as string);
        }
        break;

      case "semantic:new_entities":
        // New entities discovered - update AUTODOC for affected files
        if (Array.isArray(data)) {
          const files = new Set<string>();
          for (const entity of data) {
            if (entity && typeof entity === "object" && "filePath" in entity && entity.filePath) {
              files.add(entity.filePath as string);
            }
          }
          log.d("AUTODOCWATCH", "new_entities_event", { files: files.size });
          for (const filePath of files) {
            await this.handleFileChange(filePath);
          }
        }
        break;

      case "index:completed":
        // Full indexing completed via tool - update all AUTODOC files
        await this.handleIndexCompleted(data as IndexCompletedEventData);
        break;
    }
  }

  /**
   * Handle a single file change
   */
  private async handleFileChange(filePath: string): Promise<void> {
    if (!filePath) return;

    // Skip non-code files
    const ext = path.extname(filePath).toLowerCase();
    if (![".ts", ".js", ".tsx", ".jsx", ".mjs", ".cjs"].includes(ext)) {
      return;
    }

    // Skip test files
    if (filePath.includes(".test.") || filePath.includes(".spec.")) {
      return;
    }

    // Find which module this file belongs to
    const modulePath = await getModuleForFile(filePath, this.config.rootDir);
    if (!modulePath) {
      log.d("AUTODOCWATCH", "no_module_found", { file: filePath });
      return;
    }

    log.d("AUTODOCWATCH", "file_change_detected", { file: filePath, module: modulePath });

    // Add to pending updates
    const now = Date.now();
    let pending = this.pendingUpdates.get(modulePath);

    if (!pending) {
      pending = {
        modulePath,
        changedFiles: new Set(),
        firstChangeAt: now,
        lastChangeAt: now,
      };
      this.pendingUpdates.set(modulePath, pending);
    }

    pending.changedFiles.add(filePath);
    pending.lastChangeAt = now;

    // Schedule debounced update
    this.scheduleUpdate(modulePath);
  }

  /**
   * Schedule a debounced update for a module
   */
  private scheduleUpdate(modulePath: string): void {
    // Abort existing controller
    const existingController = this.debounceControllers.get(modulePath);
    if (existingController) {
      existingController.abort();
    }

    const pending = this.pendingUpdates.get(modulePath);
    if (!pending) return;

    // Calculate adaptive debounce delay
    // More changes = longer delay (up to max)
    const changeCount = pending.changedFiles.size;
    const baseDelay = this.config.debounceMs;
    const adaptiveDelay = Math.min(
      this.config.maxDebounceMs,
      Math.max(this.config.minDebounceMs, baseDelay + changeCount * 1000),
    );

    // Check if we've been waiting too long (force update after maxDebounceMs from first change)
    const timeSinceFirstChange = Date.now() - pending.firstChangeAt;
    const remainingMaxWait = Math.max(0, this.config.maxDebounceMs - timeSinceFirstChange);
    const finalDelay = Math.min(adaptiveDelay, remainingMaxWait);

    if (finalDelay <= 0) {
      // Max wait exceeded, update immediately
      this.processUpdate(modulePath);
      return;
    }

    // Schedule update using async sleep pattern (Bun compatible)
    const abortController = new AbortController();
    this.debounceControllers.set(modulePath, abortController);

    (async () => {
      await sleep(finalDelay);
      if (!abortController.signal.aborted) {
        this.processUpdate(modulePath);
      }
    })();

    log.d("AUTODOCWATCH", "update_scheduled", {
      module_path: modulePath,
      changed_files: changeCount,
      delay_ms: finalDelay,
    });
  }

  /**
   * Process pending update for a module
   */
  private async processUpdate(modulePath: string): Promise<void> {
    const pending = this.pendingUpdates.get(modulePath);
    if (!pending) return;

    // Remove from pending
    this.pendingUpdates.delete(modulePath);
    this.debounceControllers.delete(modulePath);

    // Skip if already processing
    if (this.isProcessing) {
      // Re-queue for later
      for (const file of pending.changedFiles) {
        await this.handleFileChange(file);
      }
      return;
    }

    this.isProcessing = true;

    try {
      log.i("AUTODOCWATCH", "processing_update", {
        module_path: modulePath,
        changed_files: pending.changedFiles.size,
      });

      const autodocPath = path.join(modulePath, MODULE_DOC_FILENAME);
      const autodocExists = await fileExists(autodocPath);

      // Check if .autodoc folder exists in root (autodoc is enabled)
      const autodocEnabled = await this.checkAutodocEnabled();

      if (!autodocExists) {
        // If .autodoc is enabled, create new AUTODOC.md for new modules
        if (autodocEnabled) {
          const useLlm = await this.shouldUseLlm();
          log.i("AUTODOCWATCH", "creating_new_autodoc", { module_path: modulePath, useLlm });

          // Get module info to generate initial content with entity line ranges
          const moduleInfo = await this.getModuleInfo(modulePath);

          // Generate LLM descriptions first (includes export/file descriptions)
          let llmDescriptions:
            | { exportDescs?: Record<string, string> | undefined; fileDescs?: Record<string, string> | undefined }
            | undefined;
          if (useLlm) {
            const { generateModuleDescriptionLLM } = await import("./autodoc-updater.js");
            const desc = await generateModuleDescriptionLLM(moduleInfo, {
              useLlm,
              ...(this.config.llmConfig != null ? { llmConfig: this.config.llmConfig } : {}),
            });
            if (desc) {
              moduleInfo.description = desc;
              llmDescriptions = {
                exportDescs: (moduleInfo as ModuleInfoWithLLM)._llmExportDescs,
                fileDescs: (moduleInfo as ModuleInfoWithLLM)._llmFileDescs,
              };
            }
          }

          const initialContent = await generateModuleReadmeWithEntities(
            moduleInfo,
            extractEntitiesFromContent,
            llmDescriptions,
          );

          log.i("AUTODOCWATCH", "writing_autodoc", {
            module: moduleInfo.name,
            path: autodocPath,
            contentLength: initialContent.length,
            hasModuleDesc: !!moduleInfo.description,
            hasExportDescs: !!llmDescriptions?.exportDescs && Object.keys(llmDescriptions.exportDescs).length > 0,
            hasFileDescs: !!llmDescriptions?.fileDescs && Object.keys(llmDescriptions.fileDescs).length > 0,
            source: "processUpdate_new",
          });

          await writeFile(autodocPath, initialContent);

          log.i("AUTODOCWATCH", "autodoc_created", {
            module_path: modulePath,
            autodoc_path: autodocPath,
            usedLlm: useLlm,
          });

          // Publish event for new module
          knowledgeBus.publish(
            "autodoc:created",
            {
              modulePath,
              autodocPath,
              isNew: true,
            },
            "autodoc-watcher",
          );
          return;
        }

        log.d("AUTODOCWATCH", "autodoc_not_found_disabled", {
          module_path: modulePath,
          hint: "Create .autodoc folder to enable auto-generation",
        });
        return;
      }

      // Read current AUTODOC content
      const currentContent = await readText(autodocPath);

      // Get updated module info
      const moduleInfo = await this.getModuleInfo(modulePath);

      // Update content incrementally
      const useLlmForUpdate = await this.shouldUseLlm();
      const updatedContent = await updateAutodocContent(currentContent, moduleInfo, Array.from(pending.changedFiles), {
        useLlm: useLlmForUpdate,
        ...(this.config.llmConfig != null ? { llmConfig: this.config.llmConfig } : {}),
      });

      if (updatedContent !== currentContent) {
        await writeFile(autodocPath, updatedContent);

        log.i("AUTODOCWATCH", "autodoc_updated", {
          module_path: modulePath,
          changed_files: pending.changedFiles.size,
        });

        // Publish event
        knowledgeBus.publish(
          "autodoc:updated",
          {
            modulePath,
            autodocPath,
            changedFiles: Array.from(pending.changedFiles),
          },
          "autodoc-watcher",
        );
      }
    } catch (error) {
      log.e("AUTODOCWATCH", "update_failed", {
        module_path: modulePath,
        error: String(error),
      });
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Handle index:completed event - update all AUTODOC files
   */
  private async handleIndexCompleted(data: IndexCompletedEventData): Promise<void> {
    // Invalidate autodoc cache after indexing (folder might have been created)
    this.invalidateAutodocCache();

    const autodocEnabled = await this.checkAutodocEnabled();
    if (!autodocEnabled) {
      log.d("AUTODOCWATCH", "index_completed_autodoc_disabled");
      return;
    }

    log.i("AUTODOCWATCH", "index_completed_scanning", { dir: data.directory || this.config.rootDir });

    // Scan for new modules without AUTODOC.md and create them
    try {
      const { scanModules } = await import("../generator/doc-generator.js");
      const modules = await scanModules(this.config.rootDir, {
        maxDepth: 4,
        concurrency: 8,
      });

      let created = 0;
      for (const mod of modules) {
        const autodocPath = path.join(mod.path, MODULE_DOC_FILENAME);
        const exists = await fileExists(autodocPath);

        if (!exists) {
          const useLlm = await this.shouldUseLlm();
          log.i("AUTODOCWATCH", "creating_autodoc_for_new_module", { module: mod.name, useLlm });

          // Generate LLM descriptions first (includes export/file descriptions)
          let llmDescriptions:
            | { exportDescs?: Record<string, string> | undefined; fileDescs?: Record<string, string> | undefined }
            | undefined;
          if (useLlm) {
            const { generateModuleDescriptionLLM } = await import("./autodoc-updater.js");
            const desc = await generateModuleDescriptionLLM(mod, {
              useLlm,
              ...(this.config.llmConfig != null ? { llmConfig: this.config.llmConfig } : {}),
            });
            if (desc) {
              mod.description = desc;
              // Get parsed descriptions from moduleInfo (set by generateModuleDescriptionLLM)
              llmDescriptions = {
                exportDescs: (mod as ModuleInfoWithLLM)._llmExportDescs,
                fileDescs: (mod as ModuleInfoWithLLM)._llmFileDescs,
              };
            }
          }

          const content = await generateModuleReadmeWithEntities(mod, extractEntitiesFromContent, llmDescriptions);

          log.i("AUTODOCWATCH", "writing_autodoc", {
            module: mod.name,
            path: autodocPath,
            contentLength: content.length,
            hasModuleDesc: !!mod.description,
            hasExportDescs: !!llmDescriptions?.exportDescs && Object.keys(llmDescriptions.exportDescs).length > 0,
            hasFileDescs: !!llmDescriptions?.fileDescs && Object.keys(llmDescriptions.fileDescs).length > 0,
            source: "index_completed",
          });

          await writeFile(autodocPath, content);
          created++;

          knowledgeBus.publish(
            "autodoc:created",
            {
              modulePath: mod.path,
              autodocPath,
              isNew: true,
              source: "index_completed",
            },
            "autodoc-watcher",
          );
        }
      }

      if (created > 0) {
        log.i("AUTODOCWATCH", "index_completed_created", { count: created, total_modules: modules.length });
        // Log Claude Code usage stats if used
        ClaudeCodeProvider.logUsageStats();
      } else {
        log.d("AUTODOCWATCH", "index_completed_all_exist", { total_modules: modules.length });
      }
    } catch (error) {
      log.e("AUTODOCWATCH", "index_completed_error", { error: String(error) });
    }
  }

  /**
   * Get module info for a directory
   */
  private async getModuleInfo(modulePath: string): Promise<ModuleInfo> {
    // Check cache
    const cached = this.moduleCache.get(modulePath);
    if (cached) {
      return cached;
    }

    // Build module info
    const name = path.basename(modulePath);
    const indexPath = path.join(modulePath, "index.ts");
    const hasIndex = await fileExists(indexPath);
    const exports = hasIndex ? await extractExportsFromFile(indexPath) : [];

    // Get all code files in module (single pass)
    const files: string[] = [];
    try {
      const entries = await readdir(modulePath, { withFileTypes: true });
      for (const e of entries) {
        if (
          e.isFile() &&
          /\.(ts|js|tsx|jsx|mjs|cjs)$/.test(e.name) &&
          !e.name.includes(".test.") &&
          !e.name.includes(".spec.")
        ) {
          files.push(e.name);
        }
      }
    } catch {
      // Directory might not exist
    }

    const moduleInfo: ModuleInfo = {
      name,
      path: modulePath,
      files,
      hasIndex,
      exports,
    };

    // Cache for 5 minutes with tracked abort controller
    this.moduleCache.set(modulePath, moduleInfo);

    // Abort existing controller if any
    const existingController = this.moduleCacheControllers.get(modulePath);
    if (existingController) {
      existingController.abort();
    }

    const abortController = new AbortController();
    this.moduleCacheControllers.set(modulePath, abortController);

    // Schedule cache eviction using async sleep pattern (Bun compatible)
    (async () => {
      await sleep(5 * 60 * 1000);
      if (!abortController.signal.aborted) {
        this.moduleCache.delete(modulePath);
        this.moduleCacheControllers.delete(modulePath);
      }
    })();

    return moduleInfo;
  }

  /**
   * Force update a specific module's AUTODOC.md
   */
  async forceUpdate(modulePath: string): Promise<void> {
    const pending: PendingUpdate = {
      modulePath,
      changedFiles: new Set(["force-update"]),
      firstChangeAt: Date.now(),
      lastChangeAt: Date.now(),
    };
    this.pendingUpdates.set(modulePath, pending);
    await this.processUpdate(modulePath);
  }

  /**
   * Get watcher status
   */
  getStatus(): {
    enabled: boolean;
    running: boolean;
    pendingUpdates: number;
    config: AutoDocWatcherConfig;
  } {
    return {
      enabled: this.config.enabled ?? true,
      running: this.subscriptionId !== null,
      pendingUpdates: this.pendingUpdates.size,
      config: this.config,
    };
  }
}

// Singleton instance
let watcherInstance: AutoDocWatcher | null = null;

export function getAutoDocWatcher(config?: AutoDocWatcherConfig): AutoDocWatcher {
  if (!watcherInstance && config) {
    watcherInstance = new AutoDocWatcher(config);
  }
  if (!watcherInstance) {
    throw new Error("AutoDocWatcher not initialized. Provide config on first call.");
  }
  return watcherInstance;
}

export function resetAutoDocWatcher(): void {
  if (watcherInstance) {
    watcherInstance.stop();
    watcherInstance = null;
  }
}
