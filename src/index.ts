#!/usr/bin/env node

/**
 * TASK-002: MCP Server for Code Graph Analysis with Semantic Tools
 * Multi-agent LiteRAG architecture optimized for commodity hardware
 *
 * This server implements 8 new semantic-aware MCP tools that leverage
 * QueryAgent and SemanticAgent for advanced code analysis capabilities.
 *
 * @task_id TASK-002
 * @history
 *  - 2025-09-14: Enhanced by Dev-Agent - TASK-002: Added 8 new semantic MCP tools
 */

// =============================================================================
// TYPE DEFINITIONS FOR GLOBAL EXTENSIONS (must be before first use)
// =============================================================================

/**
 * Global extensions (minimal - Bun types already provided by @types/bun)
 */
declare global {
  // eslint-disable-next-line no-var
  var env: Record<string, string> | undefined;
}

/**
 * Type alias for global with knowledge bus
 */
type GlobalWithKnowledgeBus = typeof global & {
  knowledgeBus?: unknown;
};

// =============================================================================
// EARLY INITIALIZATION
// =============================================================================

// CRITICAL: Check for --pipe flag BEFORE any imports (to prevent JSON-RPC corruption)
// Set env variable early so imported modules can check it
if (process.argv.includes("--pipe")) {
  process.env["MCP_QUIET_MODE"] = "true";
}

// CRITICAL: Override console BEFORE any imports (to prevent JSON-RPC corruption in --pipe mode)
// In Bun with native modules, even console function calls can cause crashes
// Make console completely no-op in quiet mode (when running as MCP server)
(() => {
  const isBun = typeof globalThis.Bun !== "undefined";
  const quietMode = process.env["MCP_QUIET_MODE"] === "true";

  // CRITICAL: In Bun+quiet mode, use absolute minimal no-op functions
  // Even argument spreading (...args) can cause issues with native modules
  if (isBun && quietMode) {
    // Absolute minimum - empty functions with no parameter handling
    const noop = () => {};
    console.error = noop;
    console.warn = noop;
    console.log = noop;
    console.info = noop;
    console.debug = noop;
  } else if (quietMode) {
    // Node.js quiet mode: suppress output but safely
    const noop = () => {};
    console.error = noop;
    console.warn = noop;
    console.log = noop;
    console.info = noop;
    console.debug = noop;
  }
  // Non-quiet mode: leave console as-is
})();

// TASK-001: Environment variable fallback for embedding model - MUST BE FIRST
function createSafeEnvironment() {
  // Provide safe defaults for environment variables that might be undefined
  const safeEnv = {
    ...process.env,
    // Ensure these are defined to prevent "env is not defined" errors
    NODE_ENV: process.env["NODE_ENV"] || "development",
    MCP_EMBEDDING_ENABLED: process.env["MCP_EMBEDDING_ENABLED"] || "true",
    MCP_EMBEDDING_PROVIDER: process.env["MCP_EMBEDDING_PROVIDER"] || "transformers",
    MCP_EMBEDDING_FALLBACK: process.env["MCP_EMBEDDING_FALLBACK"] || "true",
  };

  // Make env globally available for embedding models
  globalThis.env = safeEnv;
  return safeEnv;
}

// Initialize safe environment BEFORE any imports that might use embedding generator
createSafeEnvironment();

import { readFileSync } from "node:fs";
import { dirname, isAbsolute, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";
// Consolidated MCP SDK imports
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  GetPromptRequestSchema,
  ListPromptsRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
// Schema and Node.js built-ins
import type { z } from "zod";
// Import our multi-agent components
import { ConductorOrchestrator } from "./agents/conductor-orchestrator.js";
// AutoDoc: Semantic documentation layer
import { type AutoDocWatcherConfig, getAutoDocWatcher } from "./autodoc/index.js";
// CLI argument parsing
import { handleSetupCommand, parseArgs, printHelp } from "./cli/args-parser.js";
// TASK-001: Import new YAML configuration system
import { ConfigLoader, initializeConfig, validateConfig } from "./config/yaml-config.js";
import { getOrCreateAgent, registerAllAgents } from "./core/agent-registry.js";
// Auto-indexing
import {
  type AutoIndexContext,
  countSourceFiles,
  detectSupportedProject,
  performAutoIndex,
} from "./core/auto-indexer.js";
// VARIANT-C: DI Container integration
import { getGlobalContainer } from "./core/di-container.js";
// Indexing state management
import {
  areTimersSuspended,
  getIndexingStatus,
  isIndexing,
  isProjectIndexing,
  registerAsyncLoopStarter,
  resumeTimers,
  setIndexingState,
} from "./core/indexing-state.js";
import { knowledgeBus } from "./core/knowledge-bus.js";
// Skills auto-installer for Claude Code
import { installSkillsIfNeeded } from "./skills-installer.js";

// Make knowledgeBus available globally for tool handlers
(global as GlobalWithKnowledgeBus).knowledgeBus = knowledgeBus;

// Tool list (extracted to separate file)
import pLimit from "p-limit";
// Roslyn addon lifecycle (C# parsing)
import { ensureRoslynStarted, findSolutionFile, isRoslynAvailable, shutdownRoslynClient } from "./addons/index.js";
// v5: Per-client session isolation for multi-client support
import { ClientSession, registerSession, unregisterSession } from "./core/client-session.js";
import { PipeServer } from "./core/pipe-transport.js";
import { resourceManager } from "./core/resource-manager.js";
// LayeredIndexManager for branch-aware indexing
import type { LayeredIndexManager } from "./layered/index.js";
import { shutdownFaissProvider } from "./semantic/faiss/faiss-provider.js";
import { getGpuClient, shutdownGpuClient } from "./semantic/gpu/gpu-client.js";
// OVMS Native lifecycle management
import { initializeOVMSNative, type OVMSNativeConfig, shutdownOVMSNative } from "./semantic/ovms-native-manager.js";
// Storage initialization
import { getCurrentGitBranchOrDefault, getProjectHash, initializeStorageDirs } from "./shared/storage-paths.js";
import {
  configureGraphStorage,
  getGraphStorage,
  initializeGraphStorage,
  resetGraphStorage,
} from "./storage/graph-storage-factory.js";
import { createProjectContext } from "./storage/graph-storage-libsql.js";
import { runWithRequestContext } from "./storage/libsql/request-context.js";
import type { ToolContext } from "./tools/base-tool-handler.js";
import { MAX_RESPONSE_SIZE_BYTES, truncateResponse } from "./tools/response-limits.js";
import { getToolsList } from "./tools/tool-definitions.js";
import { toolRegistry } from "./tools/tool-registry.js";
// Re-export for external consumers
export {
  areTimersSuspended,
  getIndexingStatus,
  isIndexing,
  isProjectIndexing,
  registerAsyncLoopStarter,
  resumeTimers,
  setIndexingState,
};

import { expandHome, getVersionInfo } from "./core/environment-setup.js";
// Service container for dependency injection
import { initServiceContainer, type ServiceContainer } from "./core/service-container.js";
import { registerDebugSignalHandler, registerSignalHandlers, setShutdownContext } from "./core/shutdown-handlers.js";
import { runOllamaCheck, runOrphanedEmbeddingsCheck } from "./core/startup-checks.js";
// Import extracted modules
import {
  endTimer as _endTimer,
  startTimer as _startTimer,
  getLocalTimestamp,
  setProcessStartTime,
  sleep,
  writeToLogFile,
} from "./core/startup-utils.js";
import { log } from "./logging/index.js";
import { logMemory } from "./logging/memory-logger.js";
import { startEmbeddingWarmup } from "./semantic/embedding-warmup.js";
import type { Agent } from "./types/agent.js";
import { AgentType } from "./types/agent.js";
import { AgentBusyError } from "./types/errors.js";
import { getVectorDimensions, loadSemanticConfig } from "./utils/config-paths.js";
import { initHasher } from "./utils/fast-hash.js";
import { createRequestId, initNewLogger, setLoggerProject } from "./utils/logger.js";
import { tryGarbageCollect } from "./utils/runtime-detection.js";

// =============================================================================
// GLOBAL EXCEPTION HANDLERS - Catch crashes and log them to file
// =============================================================================

process.on("uncaughtException", (error, origin) => {
  const timestamp = getLocalTimestamp();
  const message = `[${timestamp}] [FATAL] [CRASH] Uncaught exception (${origin}): ${error.message}\n${error.stack}`;
  writeToLogFile(message);
  console.error(message);
  // Exit after brief delay without setTimeout (Bun compatibility)
  (async () => {
    const start = Date.now();
    while (Date.now() - start < 100) await sleep(10);
    process.exit(1);
  })();
});

process.on("unhandledRejection", (reason, _promise) => {
  const timestamp = getLocalTimestamp();
  const error = reason instanceof Error ? reason : new Error(String(reason));
  const message = `[${timestamp}] [FATAL] [CRASH] Unhandled rejection: ${error.message}\n${error.stack}`;
  writeToLogFile(message);
  console.error(message);
});

// SIGTERM/SIGINT handlers are defined later in startMcpServer() after all imports
// This allows proper async shutdown including OVMS Native

// === STARTUP TIMING ===
const PROCESS_START_TIME = Date.now();
setProcessStartTime(PROCESS_START_TIME);

// Initialize xxHash WASM BEFORE any hashing operations (required for deterministic project paths)
_startTimer("initHasher");
await initHasher();
_endTimer("initHasher");

// Initialize centralized storage directories BEFORE any storage operations
_startTimer("initializeStorageDirs");
initializeStorageDirs();
_endTimer("initializeStorageDirs");

// Parse command line arguments
const cliArgs = parseArgs();
const {
  configPath: overrideConfigPath,
  helpRequested,
  versionRequested,
  setupRequested,
  noAutoIndex,
  pipeServerMode,
  quietMode,
  positionalArgs,
} = cliArgs;

if (helpRequested) {
  printHelp();
  process.exit(0);
}

// Handle setup command - launch PowerShell/Bash script
if (setupRequested) {
  handleSetupCommand(import.meta.url);
}

const versionInfo = getVersionInfo(import.meta.url);

if (versionRequested) {
  console.error(
    `${versionInfo.name} ${versionInfo.version}\nNode ${versionInfo.nodeVersion} (${versionInfo.platform} ${versionInfo.arch})`,
  );
  process.exit(0);
}

// Default to cwd if no directory specified (for Comm proxy mode)
if (positionalArgs.length < 1) {
  positionalArgs.push(process.cwd());
}

if (overrideConfigPath) {
  ConfigLoader.setOverridePath(overrideConfigPath);
}

const directory = normalize(resolve(expandHome(positionalArgs[0]!)));

// Re-export from shared module for backward compatibility
import { getCurrentIndexingDirectory, setCurrentIndexingDirectory } from "./shared/indexing-context.js";
export { getCurrentIndexingDirectory };

type DebugRequest = {
  raw: string;
  parsed: unknown;
};

const debugRequestStrings = positionalArgs.slice(1);
const debugRequests: DebugRequest[] = [];
const isDebugMode = debugRequestStrings.length > 0;

for (const raw of debugRequestStrings) {
  const trimmed = raw.trim();
  if (!trimmed) continue;
  try {
    debugRequests.push({ raw: trimmed, parsed: JSON.parse(trimmed) });
  } catch (error) {
    // Pre-logger init - write to stderr directly
    process.stderr.write(`[Debug] Failed to parse JSON: ${error instanceof Error ? error.message : String(error)}\n`);
    process.exit(1);
  }
}

if (isDebugMode) {
  process.env["MCP_DEBUG_MODE"] = process.env["MCP_DEBUG_MODE"] ?? "1";
  if (!process.env["PARSER_DISABLE_CACHE"]) {
    process.env["PARSER_DISABLE_CACHE"] = "1";
  }
  process.env["MCP_DEBUG_DISABLE_SEMANTIC"] = process.env["MCP_DEBUG_DISABLE_SEMANTIC"] ?? "1";
}

function normalizeInputPath(rawPath: string): string;
function normalizeInputPath(rawPath?: string | null): string | undefined;
function normalizeInputPath(rawPath?: string | null): string | undefined {
  if (!rawPath) return undefined;
  const expanded = expandHome(rawPath);
  const target = isAbsolute(expanded) ? expanded : resolve(directory, expanded);
  return normalize(target);
}

// TASK-001: Initialize YAML configuration system
_startTimer("initializeConfig");
const config = initializeConfig();
_endTimer("initializeConfig");

// Validate configuration at startup
const validation = validateConfig(config);
if (!validation.valid) {
  // Can't use console.error in quiet mode, but this is a critical error
  if (!quietMode) {
    console.error("[Config] Configuration validation failed:");
    for (const error of validation.errors) {
      console.error(`  - ${error}`);
    }
  }
  process.exit(1);
}

// IMPORTANT: Set the indexing directory BEFORE creating SQLiteManager
// This ensures getDefaultDbPath() uses the correct project path
setCurrentIndexingDirectory(directory);

// Initialize new fixed-position logger with project context
initNewLogger();
setLoggerProject(getProjectHash(directory));
log.i("STARTUP", "init", { dir: directory, dbPath: config.database.path ?? "default", cwd: process.cwd() });

// SQLiteManager removed - using libsql-based storage via graph-storage-factory
// Storage initialization happens lazily via getGraphStorage()

// Initialize global GraphStorage (libsql unified storage)
log.i("STORAGE", "graph_init", { type: "libsql" });

// Configure vector dimensions from semantic-config.json BEFORE initializing storage
const vectorDimensions = getVectorDimensions();
configureGraphStorage({ dimensions: vectorDimensions });

_startTimer("initializeGraphStorage");
await initializeGraphStorage();
_endTimer("initializeGraphStorage");

// Early GPU worker startup (non-blocking) - starts Named Pipe connection in background
// This takes ~5s, so start early to overlap with other initialization
let gpuWorkerStartPromise: Promise<boolean> | null = null;
const gpuStartTime = Date.now();
try {
  const gpuClient = getGpuClient();
  gpuWorkerStartPromise = gpuClient.start();
  gpuWorkerStartPromise
    .then((success) => {
      log.i("GPU", "worker_started", { dur: Date.now() - gpuStartTime, ok: success });
    })
    .catch((err) => {
      log.e("GPU", "worker_start_fail", { err: (err as Error).message });
    });
  log.i("GPU", "worker_init", { blocking: false });
} catch (err) {
  log.e("GPU", "worker_init_fail", { err: (err as Error).message });
}

// Roslyn addon: start only if .sln/.slnx found AND DLL available
const slnPath = findSolutionFile(directory);
if (slnPath && isRoslynAvailable()) {
  ensureRoslynStarted(slnPath)
    .then((parser) => {
      log.i("ROSLYN", "addon_started", { sln: slnPath, available: !!parser });
    })
    .catch((err) => {
      log.e("ROSLYN", "addon_start_fail", { err: (err as Error).message });
    });
}

// v3: Set initial project context for GraphStorage
const initialStorage = await getGraphStorage();
const initialBranch = getCurrentGitBranchOrDefault(directory);
initialStorage.setProject(directory, initialBranch);
log.i("STORAGE", "project_set", { proj: getProjectHash(directory), branch: initialBranch });

// Log MCP server starting
log.i("SYSTEM", "mcp_starting", {
  dir: directory,
  node: process.version,
  plat: process.platform,
  env: config.environment,
});

// Initialize resource manager with configuration constraints
const conductorResources = config.conductor.resourceConstraints;

// Determine actual provider: semantic-config.json takes priority over YAML
const semanticConfig = loadSemanticConfig();
const semanticProvider = semanticConfig?.embedding?.platform;
const yamlProvider = config.mcp.embedding?.provider;
const actualProvider = semanticProvider || yamlProvider || "auto";

// EARLY WARMUP: Start embedding provider initialization in background
// This overlaps with storage init, agent registration, etc. - saves ~500ms
const embeddingWarmupPromise = startEmbeddingWarmup(semanticConfig, config);
embeddingWarmupPromise.catch((err) => {
  log.w("WARMUP", "Background warmup failed (will retry later)", { err: (err as Error).message });
});

// Start resource monitoring (disabled in pipe mode - Bun compatibility)
if (!pipeServerMode) {
  resourceManager.startMonitoring();
}

log.i("SYSTEM", "resource_mgr", {
  memMB: conductorResources.maxMemoryMB,
  cpu: conductorResources.maxCpuPercent,
  provider: actualProvider,
});

// Initialize OVMS Native if configured (auto-start embedding server)
if (actualProvider === "ovms-native") {
  const ovmsNativeConfig: OVMSNativeConfig = {
    enabled: true,
    autoStart: true,
    restPort: 8083,
    grpcPort: 9001,
    healthCheckIntervalMs: 30000,
    startupTimeoutMs: 120000, // 2 minutes for model loading
  };

  const ovmsStarted = await initializeOVMSNative(ovmsNativeConfig);
  if (ovmsStarted) {
    log.i("OVMS", "started", { port: 8083, grpc: 9001 });
  } else {
    log.e("OVMS", "start_fail", { hint: "run setup-embedding" });
  }
}

// VARIANT-C: Initialize DI Container and register all agents
_startTimer("registerAllAgents");
const container = getGlobalContainer();
// Storage is accessed via getGraphStorage() - no need to register SQLiteManager
await registerAllAgents(container);
_endTimer("registerAllAgents");
log.i("SYSTEM", "di_ready", { agents: "all" });

// Initialize conductor orchestrator lazily
let conductor: ConductorOrchestrator | null = null;

function getConductor(): ConductorOrchestrator {
  if (!conductor) {
    // TASK-001: Use YAML configuration for conductor setup
    conductor = new ConductorOrchestrator(config.conductor ?? {});
    // Update shutdown context with conductor reference
    setShutdownContext({ conductor });
  }
  return conductor;
}

// Global VectorStore instance (lazy-loaded from SemanticAgent)
// Used by code modification components (CodeModifier, FileOperations, PatternSearch)
const globalVectorStore: unknown | null = null;

// ============================================================================
// PHASE 8: Service Container initialization
// ============================================================================

// Initialize ServiceContainer (will be fully configured after getSemanticAgent is defined)
let serviceContainerInstance: ServiceContainer | null = null;

function getOrInitServiceContainer(): ServiceContainer {
  if (!serviceContainerInstance) {
    serviceContainerInstance = initServiceContainer({
      directory,
      getConductor,
      getGlobalVectorStore: () => globalVectorStore,
      getSemanticAgentFn: () => getSemanticAgent(),
    });
  }
  return serviceContainerInstance;
}

// LayeredIndexManager - orchestrates branch-aware indexing with delta layers
const layeredIndexManager: LayeredIndexManager | null = null;

// VARIANT-C: Unified agent getter using DI Container
async function getSemanticAgent(): Promise<Agent> {
  const currentDir = getCurrentIndexingDirectory();
  log.t("AGENT", "get_semantic", { dir: currentDir ?? "none" });

  const cond = getConductor();
  await cond.initialize();
  const agent = await getOrCreateAgent(container, cond, AgentType.SEMANTIC);

  // v3: Ensure agent's VectorStore has correct project context
  const semanticAgent = agent as any;
  if (agent && typeof semanticAgent.reinitializeForProject === "function" && currentDir) {
    const vectorStore = semanticAgent.getVectorStore?.();
    const currentContext = vectorStore?.getProjectContext?.();
    const expectedProjectHash = getProjectHash(currentDir);

    if (currentContext?.projectHash !== expectedProjectHash) {
      log.w("AGENT", "project_mismatch", { cur: currentContext?.projectHash, exp: expectedProjectHash });
      await semanticAgent.reinitializeForProject(currentDir);
    }
  }

  return agent;
}

async function getDevAgent(): Promise<Agent> {
  const cond = getConductor();
  await cond.initialize();
  return await getOrCreateAgent(container, cond, AgentType.DEV);
}

async function getDoraAgent(): Promise<Agent> {
  const cond = getConductor();
  await cond.initialize();
  return await getOrCreateAgent(container, cond, AgentType.DORA);
}

// NOTE: getIndexerAgent() was REMOVED to avoid duplicate IndexerAgent instances.
// DevAgent has its own private IndexerAgent, and all tools should use devAgent.getIndexerAgent()
// to ensure consistency. Using a separate conductor-registered IndexerAgent caused watchers
// to point to wrong directories.

// GraphStorage singleton is now managed by graph-storage-factory.ts

/**
 * v5: Create MCP server with optional session binding.
 *
 * In pipe mode, each client gets its own Server instance with a bound ClientSession.
 * This provides complete isolation between clients working on different projects.
 *
 * @param session - Optional ClientSession for per-client isolation (pipe mode)
 */
function createMcpServer(session?: ClientSession): Server {
  const srv = new Server(
    {
      name: versionInfo.name,
      version: versionInfo.version,
    },
    {
      capabilities: {
        tools: { listChanged: true },
        prompts: { listChanged: true },
      },
    },
  );

  // Handler for listing available prompts
  srv.setRequestHandler(ListPromptsRequestSchema, async () => {
    return {
      prompts: [
        {
          name: "quick-start",
          description: "Quick start guide for UltraCode - when and how to use tools",
        },
        {
          name: "tool-reference",
          description: "Complete reference of all 50+ tools with parameters and examples",
        },
        {
          name: "workflows",
          description: "Common workflows: analyze project, search & refactor, find duplicates, git integration",
        },
        {
          name: "tracing-guide",
          description: "Code tracing guide - trace_flow, trace_backwards, data flow analysis, state impact",
        },
        {
          name: "autodoc-guide",
          description: "AutoDoc guide - automatic documentation layer with semantic search, code-doc linking",
        },
        {
          name: "explore-guide",
          description: "Explore Agent guide - fast codebase reconnaissance, search & navigation optimized for speed",
        },
        {
          name: "planning-guide",
          description: "Planning Agent guide - risk assessment, impact analysis, tracing for safe refactoring",
        },
        {
          name: "modification-guide",
          description: "Modification Agent guide - safe code changes with snapshots, validation, and auto-rollback",
        },
        {
          name: "patterns-guide",
          description:
            "Pattern detection guide — anti-patterns, best-practices, code smells, optimization with semantic validation",
        },
      ],
    };
  });

  // Handler for getting a specific prompt
  srv.setRequestHandler(GetPromptRequestSchema, async (request) => {
    const { name } = request.params;
    const promptsDir = join(dirname(fileURLToPath(import.meta.url)), "..", "prompts");
    const promptFile = join(promptsDir, `${name}.md`);

    try {
      const content = readFileSync(promptFile, "utf-8");
      return {
        description: `UltraCode - ${name}`,
        messages: [
          {
            role: "user" as const,
            content: {
              type: "text" as const,
              text: content,
            },
          },
        ],
      };
    } catch {
      throw new Error(`Prompt not found: ${name}`);
    }
  });

  // Handler for listing available tools
  srv.setRequestHandler(ListToolsRequestSchema, async () => {
    return { tools: getToolsList() };
  });

  // v5: Handler for tool execution with session binding
  srv.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    const requestId = createRequestId();
    const startTime = Date.now();

    // Log with session info and brief args for debugging
    log.i("MCP", "request", {
      tool: name,
      req: requestId,
      sid: session?.sessionId,
      proj: session?.projectPath,
      args: briefArgs(args),
    });

    // v5: Pass session to executeToolCall for per-client isolation
    return executeToolCall(name, args, requestId, startTime, session);
  });

  return srv;
}

// Create default MCP server for stdio mode
const server = createMcpServer();

// Helper: enforce operation timeouts
async function withTimeout<T>(promise: Promise<T>, ms: number, label: string, requestId: string): Promise<T> {
  let aborted = false;

  const timeoutPromise = new Promise<never>((_, reject) => {
    const startTime = Date.now();
    const checkTimeout = async () => {
      while (!aborted && Date.now() - startTime < ms) {
        await sleep(100);
      }
      if (!aborted) {
        const err = new Error(`${label} timed out after ${ms}ms`);
        log.e("MCP", "timeout", { label, ms, req: requestId });
        reject(err);
      }
    };
    checkTimeout();
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    aborted = true;
  }
}

/**
 * Summarize tool arguments for logging (skip large values, truncate strings)
 */
function briefArgs(args: unknown): string {
  if (!args || typeof args !== "object") return "";
  const obj = args as Record<string, unknown>;
  const parts: string[] = [];
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined || value === null) continue;
    if (typeof value === "string") {
      parts.push(`${key}=${value.length > 60 ? value.slice(0, 60) + "…" : value}`);
    } else if (Array.isArray(value)) {
      parts.push(`${key}=[${value.length}]`);
    } else if (typeof value === "boolean" || typeof value === "number") {
      parts.push(`${key}=${value}`);
    }
  }
  return parts.join(" ");
}

/**
 * Heavy analysis tools that benefit from serialization and response limits.
 */
const analysisQueue = pLimit(1);

const HEAVY_ANALYSIS_TOOLS = new Set([
  "taint_analysis",
  "graph_metrics",
  "analyze_hotspots",
  "analyze_code_impact",
  "suggest_refactoring",
  "analyze_state_chaos",
  "analyze_swagger_impact",
  "louvain_communities",
  "pagerank",
  "centrality_analysis",
  "bus_factor",
]);

/**
 * Transport-level safety net: prevent oversized responses from crashing MCP stdio.
 * Checks cumulative byte size of all content items BEFORE they reach the transport.
 * If over limit, truncates and injects a pagination hint.
 */
function enforceResponseLimit(
  toolName: string,
  result: { content: Array<{ type: "text"; text: string }> },
): { content: Array<{ type: "text"; text: string }> } {
  let totalBytes = 0;
  for (const item of result.content) {
    totalBytes += Buffer.byteLength(item.text, "utf8");
  }

  if (totalBytes <= MAX_RESPONSE_SIZE_BYTES) {
    return result;
  }

  const newContent = result.content.map((item) => {
    const size = Buffer.byteLength(item.text, "utf8");
    if (size <= MAX_RESPONSE_SIZE_BYTES) return item;

    try {
      const data = JSON.parse(item.text);
      const truncated = truncateResponse(data, MAX_RESPONSE_SIZE_BYTES);
      const parsed = JSON.parse(truncated.text);
      parsed._responseMeta = {
        truncated: true,
        originalSizeBytes: truncated.originalSize,
        truncatedSizeBytes: truncated.truncatedSize,
        hint: `Response from ${toolName} was truncated. Use 'offset' and 'limit' parameters for pagination.`,
      };
      return { type: "text" as const, text: JSON.stringify(parsed, null, 2) };
    } catch {
      const sliced = item.text.slice(0, MAX_RESPONSE_SIZE_BYTES);
      return {
        type: "text" as const,
        text: sliced + `\n\n[TRUNCATED by enforceResponseLimit — use offset/limit for ${toolName}]`,
      };
    }
  });

  return { content: newContent };
}

/**
 * v5: Execute tool call with session-aware context.
 *
 * @param name - Tool name
 * @param args - Tool arguments
 * @param requestId - Request ID for logging
 * @param _startTime - Start time for metrics
 * @param session - Optional ClientSession for per-client isolation (pipe mode)
 */
async function executeToolCall(
  name: string,
  args: unknown,
  requestId: string,
  _startTime: number,
  session?: ClientSession,
) {
  // Check if indexing is in progress for the CURRENT project only
  // Other projects are NOT blocked (fix for cross-project blocking bug)
  const allowedDuringIndexing = new Set([
    "index",
    "clean_index",
    "reset_graph",
    "get_version",
    "get_metrics",
    "get_agent_metrics",
    "get_bus_stats",
    "get_graph_stats",
    "get_graph_health",
  ]);

  // v5: Get target directory from session (if available), args, or fallback to global
  const argsObj = args as Record<string, unknown>;
  const argPath = (argsObj?.["directory"] as string) || (argsObj?.["projectPath"] as string);
  const targetDir = (argPath ? (session?.resolvePath(argPath) ?? argPath) : session?.projectPath) ?? directory;

  // Only block if THIS SPECIFIC project is being indexed
  if (isProjectIndexing(targetDir) && !allowedDuringIndexing.has(name)) {
    const status = getIndexingStatus();
    const message =
      `⏳ Indexing is currently in progress for this project. Please wait and retry.\n\n` +
      `📂 Directory: ${targetDir}\n` +
      `⏱️ Elapsed: ${status.elapsedSeconds || 0} seconds\n\n` +
      `Tip: You can work with other projects while this one is indexing.`;

    log.i("INDEXER", "tool_blocked", { tool: name, dir: targetDir, elapsed: status.elapsedSeconds ?? 0 });

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              success: false,
              errorType: "indexing_in_progress",
              error: "Indexing is currently in progress for this project. Please retry after indexing completes.",
              message,
              status: {
                directory: targetDir,
                elapsedSeconds: status.elapsedSeconds,
                otherProjectsBlocked: false, // Important: other projects are NOT blocked
              },
              retryAfterSeconds: 10,
            },
            null,
            2,
          ),
        },
      ],
    };
  }

  try {
    // ==========================================================================
    // All tools handled by ToolRegistry (O(1) lookup, cleaner architecture)
    // Handlers are in src/tools/handlers/*-tool-handlers.ts
    // ==========================================================================

    // v5: Determine project path from session or fallback to global
    const projectPath = session?.projectPath ?? targetDir ?? directory;

    // v5: Mark activity for idle tracking (both session and conductor)
    session?.markActivity();
    getConductor().markActivity();

    const toolContext: ToolContext = {
      requestId,
      config,
      // v5: Session-aware context
      session,
      projectPath,
      getConductor,
      // v6: CRITICAL FIX - Set project context when returning storage!
      // Without this, queries would use the last-set project context (wrong project).
      getGraphStorage: async () => {
        const storage = await getGraphStorage();
        const branch = getCurrentGitBranchOrDefault(projectPath);
        storage.setProject(projectPath, branch);
        return storage;
      },
      getSQLiteManager: () => null, // Legacy - now using libsql via getGraphStorage()
      getSemanticAgent: getSemanticAgent as () => Promise<any>,
      getBranchManager: async () => {
        // Use DevAgent's IndexerAgent for consistency with other tools
        const conductor = getConductor();
        await conductor.initialize();
        type DevAgentWithIndexer = { getIndexerAgent?: () => { getBranchManager?: () => unknown } | null };
        const devAgent = conductor.getAgentByType?.(AgentType.DEV) as DevAgentWithIndexer | undefined;
        const indexerAgent = devAgent?.getIndexerAgent?.();
        return (indexerAgent?.getBranchManager?.() || null) as any;
      },
      getSnapshotManager: async () => {
        const container = getOrInitServiceContainer();
        return await container.getVersionManager();
      },
      getKnowledgeBus: () => knowledgeBus,
      getServiceContainer: () => getOrInitServiceContainer(),
      normalizeInputPath,
      withTimeout,
      createAutoIndexContext,
    };

    if (toolRegistry.has(name)) {
      // v7: Wrap tool execution in request-scoped project context
      // This prevents race conditions when multiple MCP clients share
      // the global GraphStorage singleton — each tool call gets its own
      // immutable project context via AsyncLocalStorage.
      const requestCtx = createProjectContext(projectPath);

      if (HEAVY_ANALYSIS_TOOLS.has(name)) {
        return await analysisQueue(() =>
          runWithRequestContext(requestCtx, async () => {
            const handler = await toolRegistry.getHandler(name, toolContext);
            const result = await handler.handle(args);
            return enforceResponseLimit(name, result);
          }),
        );
      }
      return runWithRequestContext(requestCtx, async () => {
        const handler = await toolRegistry.getHandler(name, toolContext);
        return handler.handle(args);
      });
    }

    throw new Error(`Unknown tool: ${name}. Available tools: ${toolRegistry.getRegisteredTools().join(", ")}`);

    // Legacy switch removed - all 47 case statements now in src/tools/handlers/
    // This reduces index.ts from 5165 to ~2900 lines (-44%)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    if (error instanceof AgentBusyError) {
      log.w("AGENT", "busy", { agent: error.details.agentId, tool: name, req: requestId });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: false,
                errorType: "agent_busy",
                error: errorMessage,
                details: error.details,
              },
              null,
              2,
            ),
          },
        ],
      };
    }

    log.e("MCP", "error", { tool: name, req: requestId, err: errorMessage });

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              success: false,
              error: errorMessage,
            },
            null,
            2,
          ),
        },
      ],
    };
  }
}

// v5: Handler removed - now defined inside createMcpServer() with session binding
// The global 'server' instance uses createMcpServer() which sets up the handler

async function processDebugRequests(requests: DebugRequest[]): Promise<void> {
  for (const { parsed, raw } of requests) {
    const callRequest: z.infer<typeof CallToolRequestSchema> = (() => {
      try {
        return CallToolRequestSchema.parse(parsed);
      } catch (error: unknown) {
        log.e("DEBUG", "invalid_payload", { raw });
        throw error;
      }
    })();

    const { name, arguments: args } = callRequest.params;
    const parsedObj = parsed as Record<string, unknown>;
    const responseIdValue = parsedObj?.["id"];
    const responseId =
      typeof responseIdValue === "string" || typeof responseIdValue === "number" ? responseIdValue : createRequestId();
    const requestId = typeof responseId === "string" ? responseId : String(responseId);
    const startTime = Date.now();

    // Mark activity to prevent idle mode during active requests
    getConductor().markActivity();

    log.i("MCP", "request", { tool: name, req: requestId, args: briefArgs(args) });
    const result = await executeToolCall(name, args, requestId, startTime);

    const response = {
      jsonrpc: "2.0",
      id: responseId,
      result,
    };

    console.error(JSON.stringify(response, null, 2));
  }
}

// Register signal handlers from extracted module
registerSignalHandlers({ pipeMode: pipeServerMode });
registerDebugSignalHandler();

/**
 * Create context for auto-indexer
 */
function createAutoIndexContext(): AutoIndexContext {
  return {
    getSemanticAgent,
    getDevAgent,
    getDoraAgent,
    getConductor,
    getGraphStorage,
    setCurrentIndexingDirectory,
    processStartTime: PROCESS_START_TIME,
  };
}

/**
 * Start background services that don't block server readiness.
 * Fire-and-forget: skills install, ollama check, orphaned embeddings check,
 * autodoc watcher init, periodic GC loop.
 */
async function startBackgroundServices(ctx: {
  config: ReturnType<ConfigLoader["getConfig"]>;
  directory: string;
  pipeServerMode: boolean;
  processStartTime: number;
}): Promise<void> {
  // Install Claude Code Skills in background (non-blocking)
  // Skills enable auto-activation when working with TS/JS/Python/etc projects
  installSkillsIfNeeded().catch((err) => {
    log.w("SKILLS", "install_failed", { err: (err as Error).message });
  });

  log.i("STARTUP", "server_starting", { dir: ctx.directory });
  log.i("STARTUP", "architecture", { type: "multi_agent_literag" });
  log.i("STARTUP", "constraints", { mem: "1GB", cpu: "80%", agents: 10 });

  // Check and auto-start Ollama if embeddings are enabled (non-blocking)
  const embeddingEnabled = ctx.config.mcp?.embedding?.enabled ?? false;
  const embeddingProvider: string = ctx.config.mcp?.embedding?.provider ?? "auto";

  // Run startup checks in background (extracted to startup-checks.ts)
  runOllamaCheck({
    embeddingEnabled,
    embeddingProvider,
    pipeServerMode: ctx.pipeServerMode,
    processStartTime: ctx.processStartTime,
  });

  runOrphanedEmbeddingsCheck({
    embeddingEnabled,
    pipeServerMode: ctx.pipeServerMode,
    processStartTime: ctx.processStartTime,
    getSemanticAgent,
  });
  // Initialize AutoDoc Watcher for automatic documentation updates
  log.t("STARTUP", "autodoc_check", { ms: Date.now() - ctx.processStartTime });
  const autodocWatcherEnabled = ctx.config.mcp?.autodoc?.watcherEnabled ?? true;
  if (autodocWatcherEnabled) {
    log.t("STARTUP", "autodoc_init", { ms: Date.now() - ctx.processStartTime });
    try {
      // Auto-detect LLM if not explicitly configured
      let useLlm = ctx.config.mcp?.autodoc?.useLlm;
      if (useLlm === undefined) {
        try {
          const { detectLLMProviders } = await import("./autodoc/llm/llm-provider.js");
          const { recommended } = await detectLLMProviders();
          useLlm = !!recommended;
          if (useLlm) {
            log.i("AUTODOC", "llm_auto_detected", { provider: recommended?.name });
          }
        } catch {
          useLlm = false;
        }
      }

      const watcherConfig: AutoDocWatcherConfig = {
        rootDir: ctx.directory,
        enabled: true,
        debounceMs: ctx.config.mcp?.autodoc?.debounceMs ?? 45000,
        minDebounceMs: ctx.config.mcp?.autodoc?.minDebounceMs ?? 30000,
        maxDebounceMs: ctx.config.mcp?.autodoc?.maxDebounceMs ?? 60000,
        useLlm,
        llmConfig: ctx.config.mcp?.autodoc?.llmConfig,
      };
      const watcher = getAutoDocWatcher(watcherConfig);
      watcher.start();
      log.i("AUTODOC", "watcher_started", { dir: ctx.directory, debounce: watcherConfig.debounceMs ?? 0, useLlm });

      // Background init: trigger AutoDocManager initialization and sync
      // This runs async to not block server startup (Bun-compatible using async sleep)
      (async () => {
        await sleep(2000); // Delay 2s to let server start first
        try {
          const adm = await getOrInitServiceContainer().getAutoDocManager();
          if (adm) {
            log.i("AUTODOC", "manager_initialized", { enabled: !!adm.getConfig()?.enabled });
          }
        } catch {
          // Ignore - non-critical background operation
        }
      })();
    } catch (error) {
      log.w("AUTODOC", "watcher_failed", { err: (error as Error).message });
    }
  }

  // Start periodic GC loop (every 5 minutes) - helps prevent memory fragmentation
  const GC_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
  (async () => {
    await sleep(60_000); // Wait 1 minute after startup before first GC
    while (true) {
      await sleep(GC_INTERVAL_MS);
      const beforeMem = process.memoryUsage();
      if (tryGarbageCollect(true)) {
        const afterMem = process.memoryUsage();
        const freedMB = Math.round((beforeMem.heapUsed - afterMem.heapUsed) / 1024 / 1024);
        logMemory("MAIN", { event: "periodic_gc", freedMB });
      }
    }
  })();
}

// Start the server
async function main() {
  const mainStartTime = Date.now();
  log.t("STARTUP", "main_started", { ms: mainStartTime - PROCESS_START_TIME });

  const config = ConfigLoader.getInstance().getConfig();

  // Start background services (fire-and-forget)
  startBackgroundServices({
    config,
    directory,
    pipeServerMode,
    processStartTime: PROCESS_START_TIME,
  });

  // Connect transport FIRST for fast readiness
  let transportType: string;

  if (pipeServerMode) {
    // Pipe server mode: multi-client support
    // Each client gets its own MCP Server instance, sharing the same storage/agents
    const pipeServer = new PipeServer();
    let clientCount = 0;
    let activeClients = 0;
    let shutdownScheduled = false; // Flag instead of NodeJS.Timeout (Bun compatibility)
    let shutdownGeneration = 0; // Monotonic counter to invalidate stale async loops
    let isShuttingDown = false;

    // Graceful shutdown delay (ms) - wait briefly before shutdown to allow reconnects
    const SHUTDOWN_DELAY_MS = 2000;

    /**
     * Perform graceful shutdown when all clients disconnect
     */
    async function performGracefulShutdown() {
      if (isShuttingDown) return;
      isShuttingDown = true;

      log.i("PIPE", "shutdown_start", { reason: "all_clients_disconnected" });

      try {
        // 1. Close pipe server to prevent new connections
        await pipeServer.close();
        log.i("PIPE", "server_closed", {});

        // 2. Wait for pending indexing operations to complete
        if (conductor) {
          log.t("PIPE", "wait_pending", {});

          // Poll until all agent task queues are empty
          let waitIterations = 0;
          const maxWaitMs = 30000; // 30 sec max wait
          const pollIntervalMs = 100;
          const maxIterations = maxWaitMs / pollIntervalMs;

          while (waitIterations < maxIterations) {
            let totalPending = 0;
            for (const agent of conductor.agents.values()) {
              totalPending += agent.getTaskQueue().length;
            }
            if (totalPending === 0) break;

            if (waitIterations % 50 === 0) {
              // Log every 5 sec
              log.t("PIPE", "pending_tasks", { cnt: totalPending });
            }
            // Real sleep without busy-wait
            await sleep(100);
            waitIterations++;
          }
          log.i("PIPE", "agents_idle", {});
        }

        // 2.5. Shutdown OVMS Native (if running)
        try {
          log.t("OVMS", "shutdown_start", {});
          await shutdownOVMSNative();
          log.i("OVMS", "shutdown_ok", {});
        } catch (error) {
          log.e("OVMS", "shutdown_err", { err: String(error) });
        }

        // 2.6. Shutdown GPU worker (if running)
        try {
          log.t("GPU", "shutdown_start", {});
          await shutdownGpuClient();
          log.i("GPU", "shutdown_ok", {});
        } catch (error) {
          log.e("GPU", "shutdown_err", { err: String(error) });
        }

        // 2.7. Shutdown FAISS provider (if running)
        try {
          log.t("FAISS", "shutdown_start", {});
          await shutdownFaissProvider();
          log.i("FAISS", "shutdown_ok", {});
        } catch (error) {
          log.e("FAISS", "shutdown_err", { err: String(error) });
        }

        // 2.8. Shutdown Roslyn addon (if running)
        try {
          log.t("ROSLYN", "shutdown_start", {});
          await shutdownRoslynClient();
          log.i("ROSLYN", "shutdown_ok", {});
        } catch (error) {
          log.e("ROSLYN", "shutdown_err", { err: String(error) });
        }

        // 3. Shutdown conductor and agents
        if (conductor) {
          log.t("CONDUCTOR", "shutdown_start", {});
          await conductor.shutdown();
          log.i("CONDUCTOR", "shutdown_ok", {});
        }

        // 4. Shutdown layered index manager
        if (layeredIndexManager) {
          log.t("INDEXER", "shutdown_start", {});
          await layeredIndexManager.shutdown();
          log.i("INDEXER", "shutdown_ok", {});
        }

        // 5. Close database connections (release file locks before exit)
        try {
          log.t("STORAGE", "shutdown_start", {});
          await resetGraphStorage();
          log.i("STORAGE", "shutdown_ok", {});
        } catch (error) {
          log.e("STORAGE", "shutdown_err", { err: String(error) });
        }

        // 6. Stop resource monitoring
        resourceManager.stopMonitoring();

        log.i("PIPE", "shutdown_complete", { exitCode: 0 });

        process.exit(0);
      } catch (error) {
        log.e("PIPE", "shutdown_err", { err: (error as Error).message });
        process.exit(1);
      }
    }

    /**
     * Schedule shutdown after delay (allows for quick reconnects).
     * Uses a monotonic generation counter so that stale async loops
     * become no-ops even if the flag is re-set by a later call.
     */
    function scheduleShutdown() {
      // Bump generation — any in-flight async loop with an older generation will exit
      const gen = ++shutdownGeneration;
      shutdownScheduled = true;

      log.i("PIPE", "shutdown_scheduled", { delay: SHUTDOWN_DELAY_MS, clients: 0, gen });

      (async () => {
        const startTime = Date.now();
        while (shutdownScheduled && shutdownGeneration === gen && Date.now() - startTime < SHUTDOWN_DELAY_MS) {
          await sleep(50);
        }
        // Only proceed if THIS generation is still active AND no clients reconnected
        if (shutdownScheduled && shutdownGeneration === gen && activeClients === 0) {
          performGracefulShutdown();
        }
      })();
    }

    /**
     * Cancel scheduled shutdown (client reconnected)
     */
    function cancelShutdown() {
      if (shutdownScheduled) {
        shutdownScheduled = false;
        shutdownGeneration++; // Invalidate any in-flight async loop
        log.i("PIPE", "shutdown_cancelled", { reason: "client_reconnected" });
      }
    }

    log.i("PIPE", "starting", { path: pipeServer.getPath(), mode: "multi-client" });

    await pipeServer.start(async (clientTransport) => {
      // Reject connections if shutdown is already in progress
      if (isShuttingDown) {
        log.w("PIPE", "reject_during_shutdown", { reason: "shutdown_in_progress" });
        clientTransport.close();
        return;
      }

      clientCount++;
      activeClients++;
      const clientId = clientCount;

      // Cancel any pending shutdown
      cancelShutdown();

      // v5.1: Read init message to get client's working directory (pre-MCP handshake)
      // comm.c sends ULTRACODE_CWD:/path/to/project\n immediately after connecting
      let clientProjectPath = directory; // Default to server's directory
      try {
        const clientCwd = await clientTransport.readInitMessage(2000);
        if (clientCwd) {
          clientProjectPath = normalize(resolve(clientCwd));
          log.i("PIPE", "client_cwd", { client: clientId, cwd: clientProjectPath });
        }
      } catch (err) {
        log.w("PIPE", "init_msg_fail", { client: clientId, err: (err as Error).message });
      }

      // v5: Create isolated session for this client
      // The session ensures all operations are scoped to this client's project
      const clientSession = new ClientSession({
        projectPath: clientProjectPath, // Use client's cwd if provided, else server default
        clientId,
      });

      // Register session for tracking
      registerSession(clientSession);

      log.i("PIPE", "client_connected", {
        client: clientId,
        active: activeClients,
        sid: clientSession.sessionId,
        proj: clientSession.projectPath,
      });

      // v5: Create MCP Server with session binding
      // All tool calls through this server will use the client's isolated session
      const clientServer = createMcpServer(clientSession);

      // Handle client disconnect
      clientTransport.onclose = () => {
        activeClients--;

        // v5: Unregister session on disconnect
        unregisterSession(clientSession.sessionId);

        log.i("PIPE", "client_disconnected", {
          client: clientId,
          active: activeClients,
          sid: clientSession.sessionId,
        });

        // Schedule shutdown if no more clients
        if (activeClients === 0) {
          scheduleShutdown();
        }
      };

      // Connect server to client transport (server.connect() calls transport.start() internally)
      // Note: MCP SDK Server.connect() expects a specific transport type, cast required
      await clientServer.connect(clientTransport as unknown as Parameters<typeof clientServer.connect>[0]);

      log.i("PIPE", "client_ready", {
        client: clientId,
        active: activeClients,
        sid: clientSession.sessionId,
      });

      // v5.1: Trigger auto-indexing for new project if different from server's initial directory
      if (clientProjectPath !== directory) {
        setImmediate(async () => {
          try {
            const indexingConfig = config.indexing;
            const shouldAutoIndex = indexingConfig?.autoIndex ?? true;

            if (!shouldAutoIndex) {
              log.t("INDEXER", "autoindex_disabled_client", { client: clientId });
              return;
            }

            // Check if this project is already indexed
            const graphStorage = await getGraphStorage();
            const projectHash = getProjectHash(clientProjectPath);
            const currentBranch = getCurrentGitBranchOrDefault(clientProjectPath);
            graphStorage.setProject(clientProjectPath, currentBranch);
            const stats = await graphStorage.getStatistics();
            const entityCount = stats.totalEntities ?? 0;

            if (entityCount > 0) {
              log.i("INDEXER", "client_project_indexed", {
                client: clientId,
                proj: projectHash,
                entities: entityCount,
              });
              return;
            }

            // Detect and index the new project
            const extensions = indexingConfig?.autoIndexExtensions ?? [
              ".ts",
              ".tsx",
              ".js",
              ".jsx",
              ".py",
              ".go",
              ".rs",
              ".kt",
              ".swift",
              ".c",
              ".cpp",
              ".java",
              ".cs",
            ];

            const detection = await detectSupportedProject(clientProjectPath, extensions);
            if (!detection.supported) {
              log.i("INDEXER", "client_no_files", { client: clientId, dir: clientProjectPath });
              return;
            }

            log.i("INDEXER", "client_autoindex_start", {
              client: clientId,
              dir: clientProjectPath,
              ext: detection.detectedExt,
            });

            // Set indexing directory for this project
            setCurrentIndexingDirectory(clientProjectPath);

            await performAutoIndex(clientProjectPath, extensions, createAutoIndexContext(), false);

            log.i("INDEXER", "client_autoindex_done", { client: clientId, dir: clientProjectPath });
          } catch (error) {
            log.e("INDEXER", "client_autoindex_fail", {
              client: clientId,
              err: (error as Error).message,
            });
          }
        });
      }
    });

    transportType = "pipe-multi";
    log.i("MCP", "server_ready", { dir: directory, transport: transportType, tools: getToolsList().length });
  } else {
    // Default: stdio transport (single client)
    log.t("STARTUP", "stdio_connect", { ms: Date.now() - PROCESS_START_TIME });
    const transport = new StdioServerTransport();
    transportType = "stdio";

    const connectStartTime = Date.now();
    // Note: MCP SDK Server.connect() expects a specific transport type, cast required
    await server.connect(transport as unknown as Parameters<typeof server.connect>[0]);
    log.t("STARTUP", "stdio_connected", { ms: Date.now() - PROCESS_START_TIME, dur: Date.now() - connectStartTime });
    log.i("MCP", "server_ready", { dir: directory, transport: transportType, tools: getToolsList().length });
  }

  if (debugRequests.length > 0) {
    try {
      await getDevAgent();
      await getDoraAgent();
      if (process.env["MCP_DEBUG_DISABLE_SEMANTIC"] !== "1") {
        await getSemanticAgent();
      }
      await processDebugRequests(debugRequests);
      log.i("DEBUG", "requests_complete", {});
      process.exit(0);
    } catch (error) {
      log.e("DEBUG", "request_failed", { err: error instanceof Error ? error.message : String(error) });
      process.exit(1);
    }
    return;
  }

  // Set default indexing directory for background agent initialization
  // Will be updated in case "index" if a different directory is provided
  setCurrentIndexingDirectory(directory);

  // All agents are initialized lazily when first used (prevents stdio blocking in MCP)
  log.i("STARTUP", "agents_registered", {});

  // =============================================================================
  // AUTO-INDEXING: Check and index project on startup
  // =============================================================================
  log.t("STARTUP", "autoindex_check", { ms: Date.now() - PROCESS_START_TIME });
  const indexingConfig = config.indexing;
  const shouldAutoIndex = !noAutoIndex && (indexingConfig?.autoIndex ?? true);
  log.t("INDEXER", "autoindex_config", { shouldAutoIndex, noAutoIndex });

  if (shouldAutoIndex) {
    const extensions = indexingConfig?.autoIndexExtensions ?? [
      ".ts",
      ".tsx",
      ".js",
      ".jsx",
      ".py",
      ".go",
      ".rs",
      ".kt",
      ".swift",
      ".c",
      ".cpp",
      ".java",
      ".cs",
    ];

    // Run detection and indexing in background (don't block MCP ready state)
    setImmediate(async () => {
      try {
        // Check if we already have entities for THIS directory (not global count)
        // v4: Use libsql unified storage instead of better-sqlite3
        const graphStorage = await getGraphStorage();
        const projectHash = getProjectHash(directory);
        const currentBranch = getCurrentGitBranchOrDefault(directory);
        log.t("INDEXER", "check_index", { dir: directory, hash: projectHash, branch: currentBranch });
        graphStorage.setProject(directory, currentBranch);
        const stats = await graphStorage.getStatistics();
        const entityCount = stats.totalEntities ?? 0;
        log.t("INDEXER", "stats", { entities: entityCount, rels: stats.totalRelationships, files: stats.totalFiles });

        // Track whether we need incremental vs full indexing
        let useIncrementalMode = false;
        // Threshold for cumulative changes to trigger full rebuild (40% of total files)
        const CUMULATIVE_REBUILD_THRESHOLD = 0.4;

        if (entityCount > 0) {
          // Quick consistency check: compare file count on disk vs indexed files
          const diskFileCount = await countSourceFiles(directory, extensions);
          const indexedFileCount = stats.totalFiles ?? 0;

          // Check cumulative incremental changes
          const trackingInfo = await graphStorage.getIncrementalTrackingInfo();
          const cumulativeChanges = trackingInfo.incrementalChangesCount;
          const cumulativePercent = indexedFileCount > 0 ? cumulativeChanges / indexedFileCount : 0;

          // If cumulative changes exceed threshold, force full rebuild
          if (cumulativePercent > CUMULATIVE_REBUILD_THRESHOLD) {
            log.i("INDEXER", "cumulative_threshold", {
              changes: cumulativeChanges,
              files: indexedFileCount,
              pct: (cumulativePercent * 100).toFixed(1),
              threshold: (CUMULATIVE_REBUILD_THRESHOLD * 100).toFixed(0),
            });
            // Full rebuild - don't use incremental mode
            useIncrementalMode = false;
          } else {
            // If disk has significantly more files (>20% or >10 files), run incremental index
            const missingFiles = diskFileCount - indexedFileCount;
            const mismatchPercent = indexedFileCount > 0 ? (missingFiles / indexedFileCount) * 100 : 0;

            if (diskFileCount > 0 && (missingFiles > 10 || mismatchPercent > 20)) {
              log.i("INDEXER", "index_incomplete", {
                indexed: indexedFileCount,
                disk: diskFileCount,
                missing: missingFiles,
                changes: cumulativeChanges,
              });
              // Use incremental mode - only index new/changed files
              useIncrementalMode = true;
            } else {
              log.i("INDEXER", "index_exists", {
                entities: entityCount,
                files: indexedFileCount,
                disk: diskFileCount,
                changes: cumulativeChanges,
              });

              // IMPORTANT: Start watchers and agents even when skipping re-indexing
              // This ensures incremental parsing and embedding generation works after restart
              try {
                // Initialize DevAgent for incremental parsing (subscribes to file:changed events)
                const devAgent = await getDevAgent();
                log.i("DEVAGENT", "init_for_incremental", { hasAgent: !!devAgent });

                // Initialize SemanticAgent for embedding generation
                const semanticAgent = await getSemanticAgent();
                log.i("SEMANTIC", "init_for_incremental", { hasAgent: !!semanticAgent });

                // Use DevAgent's IndexerAgent for watchers (consistent with index tool handler)
                // NOTE: Do NOT use getIndexerAgent() - that creates a SEPARATE IndexerAgent
                // registered with conductor, which is different from DevAgent's internal one.
                // All tools use devAgent.getIndexerAgent(), so we must use the same instance.
                type DevAgentWithIndexer = {
                  getIndexerAgent?: () => {
                    setProjectContext?: (path: string) => void;
                    setRepositoryPath?: (path: string) => Promise<void>;
                  } | null;
                };
                const devAgentWithIndexer = devAgent as DevAgentWithIndexer;
                const indexerAgent = devAgentWithIndexer?.getIndexerAgent?.() ?? null;
                if (indexerAgent?.setRepositoryPath) {
                  // Set project context before starting watchers
                  if (indexerAgent.setProjectContext) {
                    indexerAgent.setProjectContext(directory);
                  }
                  await indexerAgent.setRepositoryPath(directory);
                  log.i("INDEXER", "watcher_started_existing", { dir: directory });
                } else {
                  log.w("INDEXER", "watcher_no_agent", {
                    hasAgent: !!indexerAgent,
                    reason: "DevAgent.getIndexerAgent() returned null",
                  });
                }
              } catch (watcherError) {
                log.w("INDEXER", "watcher_start_fail", { err: (watcherError as Error).message });
              }

              return;
            }
          }
        }

        // Detect if project has supported files
        const detection = await detectSupportedProject(directory, extensions);
        if (!detection.supported) {
          log.i("INDEXER", "no_files", { dir: directory });
          return;
        }

        log.i("INDEXER", "project_detected", {
          ext: detection.detectedExt ?? "unknown",
          sample: detection.sampleFile ?? "none",
        });

        // Perform indexing with extension filter
        // Use incremental mode when resuming incomplete index
        await performAutoIndex(directory, extensions, createAutoIndexContext(), useIncrementalMode);
      } catch (error) {
        log.e("INDEXER", "autoindex_failed", { err: (error as Error).message });
      }
    });
  }
}

main().catch((error) => {
  log.e("STARTUP", "server_failed", { err: error.message });
  process.exit(1);
});
