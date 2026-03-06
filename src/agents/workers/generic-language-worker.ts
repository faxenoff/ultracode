/**
 * Generic Language Worker
 *
 * Universal worker that can parse any supported language.
 * Dynamically loads appropriate analyzer based on language parameter.
 *
 * Supports 3 modes:
 * 1. Bun Web Worker (postMessage)
 * 2. Node.js worker_threads (parentPort)
 * 3. Subprocess (V8 native IPC via fork()) - for memory isolation
 *
 * Subprocess mode: process dies after batch, OS reclaims memory.
 *
 * Supported: TypeScript, JavaScript, Python, C, C++, C#, Rust, Go, Java, VBA
 */

import { readFile } from "node:fs/promises";
import type { ParseResult, ParserOptions } from "../../types/parser.js";
import type { WorkerEmbeddingConfig } from "../../types/semantic.js";
// Extracted modules
import { clearAnalyzerCache, getAnalyzer, SUPPORTED_WORKER_LANGUAGES, warmupAnalyzer } from "./analyzer-loader.js";
import {
  clearDeduplicationForFiles,
  clearEmbeddingClient,
  generateEmbeddingsForEntities,
  getEmbeddingClient,
  getEmbeddingConfig,
  initEmbeddingClient,
  sendCollectedEmbeddings,
  sendCollectedTexts,
  setEmbeddingConfig,
} from "./embedding-processor.js";
// WorkerEmbeddingConfig imported by embedding-processor
import { detectLanguage } from "./language-detection.js";
import { setWorkerIdGetter, WORKER_ID, workerLog } from "./worker-logging.js";

// =============================================================================
// WORKER MESSAGE TYPES
// =============================================================================

interface WorkerMessageBase {
  type: string;
  id?: string;
}

interface InitMessage extends WorkerMessageBase {
  type: "init";
  embeddingConfig?: unknown;
}

interface ConfigureEmbeddingsMessage extends WorkerMessageBase {
  type: "configure-embeddings";
  config: unknown;
}

interface ShutdownMessage extends WorkerMessageBase {
  type: "shutdown";
}

interface PingMessage extends WorkerMessageBase {
  type: "ping";
  id: string;
}

interface ParseMessage extends WorkerMessageBase {
  type: "parse";
  id: string;
  files: string[];
  language: string;
  options: ParserOptions;
  streamingMode?: boolean;
}

interface TaskMessage extends WorkerMessageBase {
  type: "task";
  payload: WorkerTask;
}

type WorkerIncomingMessage =
  | InitMessage
  | ConfigureEmbeddingsMessage
  | ShutdownMessage
  | PingMessage
  | ParseMessage
  | TaskMessage;

interface Analyzer {
  parse(file: string, content: string, hash: string): Promise<ParseResult>;
}

// Early stderr logging for debugging worker startup (process.stderr.write bypasses console)
process.stderr.write(`[WORKER:${WORKER_ID}] Starting worker process, pid=${process.pid}\n`);

// Global error handler to catch crashes
process.on("uncaughtException", (err) => {
  process.stderr.write(`[WORKER:${WORKER_ID}] UNCAUGHT EXCEPTION: ${err.message}\n`);
  process.stderr.write(`${err.stack}\n`);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  process.stderr.write(`[WORKER:${WORKER_ID}] UNHANDLED REJECTION: ${reason}\n`);
  process.exit(1);
});

// =============================================================================
// RUNTIME-AWARE WORKER COMMUNICATION
// =============================================================================

/**
 * Promise rejection event type (not available in Node.js/Bun typings)
 */
interface WorkerPromiseRejectionEvent {
  reason: unknown;
  promise: Promise<unknown>;
}

/**
 * Worker event types for addEventListener
 * Supports message, error, and unhandledrejection events with proper typing
 */
interface WorkerEventMap {
  message: { data: WorkerIncomingMessage };
  error: ErrorEvent;
  unhandledrejection: WorkerPromiseRejectionEvent;
}

// Web Worker global scope type (for Bun Web Workers)
declare const self:
  | {
      postMessage: (message: unknown) => void;
      addEventListener<K extends keyof WorkerEventMap>(type: K, listener: (event: WorkerEventMap[K]) => void): void;
      addEventListener(type: string, listener: (event: unknown) => void): void;
      close?: () => void;
      name?: string | undefined;
    }
  | undefined;

// Detect runtime environment
// Priority: Subprocess > Bun Web Worker > Node.js worker_threads
// Subprocess mode: PARSING_WORKER_ID env var is set by parent process
const isSubprocess = !!process.env["PARSING_WORKER_ID"];
const isBunWorker = !isSubprocess && typeof self !== "undefined" && typeof self?.postMessage === "function";
const isNodeWorker = !isSubprocess && !isBunWorker;

// Node.js worker_threads (dynamic import handled at module load)
let parentPort: import("node:worker_threads").MessagePort | null = null;
let workerData: { workerId?: string } | null = null;

// Initialize worker_threads for Node.js (async IIFE)
const initPromise = (async () => {
  if (isNodeWorker) {
    try {
      const wt = await import("node:worker_threads");
      parentPort = wt.parentPort;
      workerData = wt.workerData;
    } catch {
      // Not in worker_threads context
    }
  }
})();

// Unified message posting (supports all 3 modes)
// transferList: ArrayBuffers to transfer (zero-copy) instead of clone
function postWorkerMessage(message: unknown, transferList?: ArrayBuffer[]): void {
  if (isSubprocess) {
    // Subprocess mode: V8 native IPC via process.send()
    // Note: process.send() doesn't support transferList, but uses structured clone
    process.send?.(message);
  } else if (isBunWorker && self) {
    // Bun Web Worker: supports transferList for zero-copy transfer
    if (transferList && transferList.length > 0) {
      // Bun Web Worker API supports transferList as second parameter
      (self.postMessage as (message: unknown, transfer?: ArrayBuffer[]) => void)(message, transferList);
    } else {
      self.postMessage(message);
    }
  } else if (parentPort) {
    // Node.js worker_threads: supports transferList
    if (transferList && transferList.length > 0) {
      parentPort.postMessage(message, transferList);
    } else {
      parentPort.postMessage(message);
    }
  }
}

// Get worker ID
function getWorkerId(): string {
  if (isSubprocess) {
    return process.env["PARSING_WORKER_ID"] || "subprocess-worker";
  }
  if (isBunWorker && self) {
    return self.name || "bun-worker";
  }
  return workerData?.workerId || "node-worker";
}

// Configure worker ID getter for extracted modules
setWorkerIdGetter(getWorkerId);

// =============================================================================
// TYPES
// =============================================================================

interface WorkerTask {
  id: string;
  files: string[];
  language: string; // Language identifier (e.g., "python", "rust", "typescript")
  options?: ParserOptions | undefined;
  streamingMode?: boolean | undefined; // If true, send results as they become ready (streaming_result messages)
}

interface WorkerResult {
  taskId: string;
  results: ParseResult[];
  errors?: Array<{ file: string; message: string }>;
  stats: {
    filesProcessed: number;
    totalTime: number;
    avgTimePerFile: number;
    language: string;
  };
}

// =============================================================================
// TASK PROCESSING
// =============================================================================

// Prefetch configuration
const PREFETCH_AHEAD = 3; // Number of files to read ahead

// Generated code detection markers
const GENERATED_HEADER_MARKERS = [
  // ANTLR parser generators
  {
    check: (h: string) => h.includes("generated from") && (h.includes("by antlr") || h.includes("antlr4")),
    type: "ANTLR",
  },
  // Protobuf
  { check: (h: string) => h.includes("code generated by protoc"), type: "Protobuf" },
  // gRPC
  { check: (h: string) => h.includes("code generated by protoc-gen"), type: "gRPC" },
  // Thrift
  { check: (h: string) => h.includes("autogenerated by thrift"), type: "Thrift" },
  // Bison/Yacc
  { check: (h: string) => h.includes("a bison parser") || h.includes("generated by bison"), type: "Bison" },
  // Flex/Lex
  {
    check: (h: string) => h.includes("generated by flex") || h.includes("a lexical scanner generated by flex"),
    type: "Flex",
  },
  // SWIG (C/C++ bindings)
  { check: (h: string) => h.includes("swig") && h.includes("generated"), type: "SWIG" },
  // PEG.js / Peggy
  { check: (h: string) => h.includes("generated by peg") || h.includes("generated by peggy"), type: "PEG" },
  // Tree-sitter bindings
  { check: (h: string) => h.includes("tree-sitter") && h.includes("generated"), type: "TreeSitter" },
];

const GENERATED_FILENAME_MARKERS = [
  {
    check: (f: string) => f.endsWith(".pb.go") || f.endsWith(".pb.ts") || f.endsWith("_pb.js") || f.endsWith("_pb2.py"),
    type: "Protobuf",
  },
  { check: (f: string) => f.includes("_grpc.pb."), type: "gRPC" },
  { check: (f: string) => f.endsWith(".min.js") || f.endsWith(".min.css"), type: "Minified" },
];

/**
 * Check if file content indicates generated code
 */
function isGeneratedCode(fileName: string, content: string): { skipped: boolean; type?: string } {
  const header = content.slice(0, 800).toLowerCase();
  const fileNameLower = fileName.toLowerCase();

  // Check header markers
  for (const marker of GENERATED_HEADER_MARKERS) {
    if (marker.check(header)) {
      return { skipped: true, type: marker.type };
    }
  }

  // Check filename patterns
  for (const marker of GENERATED_FILENAME_MARKERS) {
    if (marker.check(fileNameLower)) {
      return { skipped: true, type: marker.type };
    }
  }

  return { skipped: false };
}

/**
 * Prefetch manager for async file reading with overlap
 */
class PrefetchManager {
  private cache = new Map<string, Promise<string>>();
  private files: string[];
  private currentIdx = 0;

  constructor(files: string[]) {
    this.files = files;
  }

  /**
   * Start prefetching from current index
   */
  prefetchAhead(): void {
    const endIdx = Math.min(this.currentIdx + PREFETCH_AHEAD, this.files.length);

    for (let i = this.currentIdx; i < endIdx; i++) {
      const file = this.files[i];
      if (file && !this.cache.has(file)) {
        // Start async read, store promise
        this.cache.set(
          file,
          readFile(file, "utf-8").catch(() => ""),
        );
      }
    }
  }

  /**
   * Get file content (from cache or read)
   */
  async getContent(file: string): Promise<string> {
    const cached = this.cache.get(file);
    if (cached) {
      const content = await cached;
      this.cache.delete(file); // Free memory after use
      return content;
    }
    // Fallback to direct read if not in cache
    return readFile(file, "utf-8");
  }

  /**
   * Advance to next file and trigger prefetch
   */
  advance(): void {
    this.currentIdx++;
    this.prefetchAhead();
  }

  /**
   * Clear all cached content
   */
  clear(): void {
    this.cache.clear();
  }
}

async function processTask(task: WorkerTask): Promise<WorkerResult> {
  const startTime = Date.now();
  const results: ParseResult[] = [];
  const errors: Array<{ file: string; message: string }> = [];

  // Clear deduplication cache for files being parsed
  // This ensures embeddings are regenerated for modified files during incremental indexing
  const clearedDedup = clearDeduplicationForFiles(task.files);

  workerLog("INFO", `Task started`, {
    taskId: task.id,
    language: task.language,
    fileCount: task.files.length,
    ...(clearedDedup > 0 && { clearedDedup }),
  });

  // For universal mode, we get analyzer per-file based on detected language
  // For specific language, we use one analyzer for all files
  const isUniversalMode = task.language === "universal";
  let sharedAnalyzer: Analyzer | null = null;

  if (!isUniversalMode) {
    try {
      sharedAnalyzer = await getAnalyzer(task.language);
    } catch (error) {
      return {
        taskId: task.id,
        results: [],
        errors: [{ file: "all", message: (error as Error).message }],
        stats: {
          filesProcessed: 0,
          totalTime: Date.now() - startTime,
          avgTimePerFile: 0,
          language: task.language,
        },
      };
    }
  }

  // Track file contents for embedding generation
  const fileContents = new Map<string, string>();

  // Initialize prefetch manager for async I/O overlap
  const prefetch = new PrefetchManager(task.files);
  prefetch.prefetchAhead(); // Start prefetching first batch

  let ioTime = 0;
  let parseTime = 0;

  // =========================================================================
  // BATCH MODE: For Python, parse all files in a single Python process
  // This is much faster than spawning Python per file
  // =========================================================================
  if (task.language === "python" && task.files.length > 1) {
    const { getPythonAnalyzerWithBatch, supportsBatchParsing } = await import("./analyzer-loader.js");
    if (supportsBatchParsing("python")) {
      const batchAnalyzer = await getPythonAnalyzerWithBatch();
      if (batchAnalyzer) {
        workerLog("INFO", `Using Python batch mode`, { files: task.files.length });
        const batchStart = Date.now();

        // Read all files first
        const filesToParse: Array<{ filePath: string; content: string; contentHash: string }> = [];
        for (const file of task.files) {
          try {
            const content = await prefetch.getContent(file);
            prefetch.advance();

            // Skip generated code
            const generated = isGeneratedCode(file, content);
            if (generated.skipped) {
              workerLog("DEBUG", `Skipping ${generated.type}-generated file`, { file });
              continue;
            }

            fileContents.set(file, content);
            const hash = Date.now().toString(16);
            filesToParse.push({ filePath: file, content, contentHash: hash });
          } catch (err) {
            errors.push({ file, message: (err as Error).message });
            prefetch.advance();
          }
        }

        ioTime = Date.now() - batchStart;

        // Parse all files in one Python process
        if (filesToParse.length > 0) {
          const parseStart = Date.now();
          try {
            const batchResults = await batchAnalyzer.parseBatch(filesToParse);

            // Add language field to entities
            for (const result of batchResults) {
              if (result.entities) {
                for (const entity of result.entities) {
                  if (!entity.language) {
                    entity.language = "python";
                  }
                }
              }
              results.push(result);
            }

            parseTime = Date.now() - parseStart;
            workerLog("INFO", `Python batch parse complete`, {
              files: batchResults.length,
              ioMs: ioTime,
              parseMs: parseTime,
              avgMs: Math.round(parseTime / batchResults.length),
            });
          } catch (err) {
            workerLog("ERROR", `Python batch parse failed, falling back to sequential`, {
              error: (err as Error).message,
            });
            // Fall through to sequential processing below
          }
        }

        // If batch succeeded, skip the per-file loop
        if (results.length > 0) {
          prefetch.clear();
          // Jump to embedding generation (after the for loop)
          // We use a goto-like pattern by checking results.length
        }
      }
    }
  }

  // Sequential processing (for non-Python or batch fallback)
  // Skip if batch mode already processed files
  const skipSequential = results.length > 0 && task.language === "python";

  for (const file of skipSequential ? [] : task.files) {
    try {
      // Verify language matches (skip check for universal pool)
      const detectedLang = detectLanguage(file);
      // DEBUG: Log every file received by worker
      if (detectedLang === "kotlin") {
        workerLog("INFO", `[KOTLIN_DEBUG] Processing Kotlin file`, { file, detectedLang });
      }
      if (task.language !== "universal" && detectedLang !== task.language && detectedLang !== "unknown") {
        errors.push({
          file,
          message: `Language mismatch: expected ${task.language}, got ${detectedLang}`,
        });
        prefetch.advance();
        continue;
      }

      const fileStart = Date.now();

      // Get file content from prefetch cache (async, but likely already loaded)
      const ioStart = Date.now();
      const content = await prefetch.getContent(file);
      ioTime += Date.now() - ioStart;

      // Advance prefetch to load next files while we parse
      prefetch.advance();

      // Skip generated code (huge files with low semantic value)
      const generated = isGeneratedCode(file, content);
      if (generated.skipped) {
        workerLog("DEBUG", `Skipping ${generated.type}-generated file`, { file });
        continue;
      }

      fileContents.set(file, content); // Save for embedding generation

      // Parse file with native parser
      const parseStart = Date.now();
      const hash = Date.now().toString(16); // Simple hash for worker

      // Get analyzer: use shared for specific language, or per-file for universal mode
      let analyzer: Analyzer;
      if (isUniversalMode) {
        const fileLang = detectLanguage(file);
        try {
          analyzer = await getAnalyzer(fileLang);
        } catch (err) {
          const errMsg = (err as Error).message;
          workerLog("ERROR", `getAnalyzer failed: ${file}`, { language: fileLang, error: errMsg });
          errors.push({ file, message: `No analyzer for language: ${fileLang}: ${errMsg}` });
          prefetch.advance();
          continue;
        }
      } else {
        // In non-universal mode, sharedAnalyzer must be initialized
        if (!sharedAnalyzer) {
          errors.push({ file, message: "Shared analyzer not initialized" });
          prefetch.advance();
          continue;
        }
        analyzer = sharedAnalyzer;
      }

      const result: ParseResult = await analyzer.parse(file, content, hash);
      parseTime += Date.now() - parseStart;

      // Add language field to all entities that don't have it
      // This ensures all parsers (not just Kotlin) produce entities with language
      if (result.entities && detectedLang !== "unknown") {
        const addLangRecursive = (entities: typeof result.entities): void => {
          for (const entity of entities!) {
            if (!entity.language) {
              entity.language = detectedLang;
            }
            if (entity.children) {
              addLangRecursive(entity.children);
            }
          }
        };
        addLangRecursive(result.entities);
      }

      // Log parse result for every file (debugging totalEntities: 0 issue)
      workerLog("DEBUG", `Parsed file`, {
        file,
        entities: result.entities?.length || 0,
        relationships: result.relationships?.length || 0,
        language: task.language,
      });

      results.push(result);

      const fileDuration = Date.now() - fileStart;

      // Streaming mode: send result immediately via IPC
      if (task.streamingMode) {
        postWorkerMessage({
          type: "streaming_result",
          taskId: task.id,
          result: result,
          fileIndex: results.length - 1,
          totalFiles: task.files.length,
        });
      }

      // STREAMING EMBEDDINGS: Generate and send embeddings for this file immediately
      // This allows main process to start FAISS indexing while worker continues parsing
      const embConfig = getEmbeddingConfig();
      if (embConfig?.enabled && result.entities && result.entities.length > 0) {
        const content = fileContents.get(file) || "";
        await generateEmbeddingsForEntities(result.entities, content, result.filePath);

        // Send embeddings every 10 files to reduce IPC contention
        // With smaller chunks (40 files), this means ~4 IPC calls per chunk
        if (results.length % 10 === 0) {
          if (embConfig.centralizedEmbeddings) {
            sendCollectedTexts({ postWorkerMessage, getWorkerId });
          } else {
            sendCollectedEmbeddings({ postWorkerMessage, getWorkerId });
          }
        }
      }

      // Log slow files for monitoring
      if (fileDuration > 300) {
        workerLog("WARN", `Slow parse: ${file} took ${fileDuration}ms`);
      }
    } catch (error) {
      const errMsg = (error as Error).message;
      const errStack = (error as Error).stack?.split("\n").slice(0, 3).join(" ");
      workerLog("ERROR", `Parse failed: ${file}`, { error: errMsg, stack: errStack });
      errors.push({
        file,
        message: errMsg,
      });
      prefetch.advance(); // Continue prefetching even on error
    }
  }

  // Clear prefetch cache
  prefetch.clear();

  // Send any remaining embeddings that weren't sent during streaming
  const config = getEmbeddingConfig();
  if (config?.enabled) {
    const isCentralized = config.centralizedEmbeddings === true;

    // Send remaining collected embeddings/texts
    if (isCentralized) {
      sendCollectedTexts({ postWorkerMessage, getWorkerId });
    } else {
      sendCollectedEmbeddings({ postWorkerMessage, getWorkerId });
    }
  }

  // Clear file contents to free memory
  fileContents.clear();

  const totalTime = Date.now() - startTime;
  const totalEntities = results.reduce((sum, r) => sum + (r.entities?.length || 0), 0);

  workerLog("INFO", `Task completed`, {
    taskId: task.id,
    language: task.language,
    filesProcessed: task.files.length,
    totalEntities,
    errors: errors.length,
    totalTimeMs: totalTime,
    ioTimeMs: ioTime,
    parseTimeMs: parseTime,
    ioOverlapRatio: `${Math.round((1 - ioTime / totalTime) * 100)}%`,
  });

  return {
    taskId: task.id,
    results,
    ...(errors.length > 0 && { errors: errors }),
    stats: {
      filesProcessed: task.files.length,
      totalTime,
      avgTimePerFile: task.files.length > 0 ? totalTime / task.files.length : 0,
      language: task.language,
    },
  };
}

// =============================================================================
// MESSAGE HANDLER (Runtime-aware: Node.js worker_threads + Bun Web Worker)
// =============================================================================

async function handleMessage(message: WorkerIncomingMessage): Promise<void> {
  try {
    if (message.type === "init") {
      // Initialize embedding client if config provided
      if (message.embeddingConfig) {
        const config = message.embeddingConfig as WorkerEmbeddingConfig;
        setEmbeddingConfig(config);
        await initEmbeddingClient(config);
      }

      postWorkerMessage({
        type: "initialized",
        workerId: getWorkerId(),
        embeddingEnabled: getEmbeddingClient() !== null,
        supportedLanguages: SUPPORTED_WORKER_LANGUAGES,
      });
      return;
    }

    // Configure embeddings after init (for late configuration)
    if (message.type === "configure-embeddings") {
      const config = message.config as WorkerEmbeddingConfig;
      setEmbeddingConfig(config);
      await initEmbeddingClient(config);
      postWorkerMessage({
        type: "embeddings-configured",
        enabled: getEmbeddingClient() !== null,
      });
      return;
    }

    if (message.type === "shutdown") {
      // Clear caches
      clearAnalyzerCache();
      // Cleanup embedding client (nothing to do for HTTP client)
      clearEmbeddingClient();
      if (isBunWorker && self) {
        self.close?.();
      } else {
        process.exit(0);
      }
      return;
    }

    // Handle memory ping - returns current memory usage (for killIfMemoryHigh)
    if (message.type === "ping") {
      const memUsage = process.memoryUsage();
      postWorkerMessage({
        type: "pong",
        id: message.id,
        memoryMB: Math.round(memUsage.heapUsed / 1024 / 1024),
        rssMB: Math.round(memUsage.rss / 1024 / 1024),
      });
      return;
    }

    // Handle "parse" from ParsingSubprocessPool (subprocess mode)
    if (message.type === "parse") {
      const task: WorkerTask = {
        id: message.id,
        files: message.files,
        language: message.language,
        options: message.options,
        streamingMode: message.streamingMode,
      };
      const result = await processTask(task);
      // Subprocess pool expects flat response format with memoryUsed
      postWorkerMessage({
        type: "result",
        id: result.taskId,
        results: result.results,
        stats: {
          filesProcessed: result.stats.filesProcessed,
          totalTime: result.stats.totalTime,
          memoryUsed: process.memoryUsage().heapUsed,
        },
      });
      return;
    }

    // Handle "task" from LanguageWorkerPool (Web Worker / worker_threads mode)
    if (message.type === "task") {
      const task = message.payload as WorkerTask;
      const result = await processTask(task);
      postWorkerMessage({
        type: "result",
        payload: result,
      });
    }
  } catch (error) {
    const taskId =
      message.type === "task" ? (message.payload as WorkerTask).id : message.type === "parse" ? message.id : undefined;

    postWorkerMessage({
      type: "error",
      taskId,
      error: (error as Error).message,
      stack: (error as Error).stack,
    });
  }
}

// Setup message listener based on runtime
// Priority: Subprocess > Bun Web Worker > Node.js worker_threads
if (isSubprocess) {
  // Subprocess mode: V8 native IPC via process.on('message')
  process.on("message", async (message: WorkerIncomingMessage) => {
    await handleMessage(message);
  });

  // Handle IPC disconnect
  process.on("disconnect", () => {
    process.exit(0);
  });

  // Signal ready via V8 IPC
  postWorkerMessage({
    type: "ready",
    workerId: getWorkerId(),
    mode: "subprocess-v8-ipc",
    pid: process.pid,
    memoryUsage: process.memoryUsage().heapUsed,
  });

  // Pre-warm ANTLR parser for this language (async, non-blocking)
  // This triggers JIT compilation before real files arrive, improving first-file latency
  const workerLanguage = process.env["PARSING_WORKER_LANGUAGE"];
  if (workerLanguage) {
    warmupAnalyzer(workerLanguage).catch(() => {
      // Warmup failure is non-fatal, just log in warmupAnalyzer
    });
  }
} else if (isBunWorker && self) {
  // Bun Web Worker API
  self.addEventListener("message", (event: { data: WorkerIncomingMessage }) => {
    handleMessage(event.data);
  });

  // Signal ready
  postWorkerMessage({
    type: "ready",
    workerId: getWorkerId(),
    mode: "bun-web-worker",
  });
} else {
  // Node.js: wait for worker_threads import then setup
  initPromise.then(() => {
    if (parentPort) {
      parentPort.on("message", handleMessage);

      // Signal ready
      postWorkerMessage({
        type: "ready",
        workerId: getWorkerId(),
        mode: "node-worker-threads",
      });
    }
  });
}

// =============================================================================
// ERROR HANDLING (Runtime-aware)
// =============================================================================

if (isSubprocess) {
  // Subprocess error handling - write to stderr and exit
  process.on("uncaughtException", (error) => {
    postWorkerMessage({
      type: "error",
      error: `Uncaught exception in subprocess: ${error.message}`,
      stack: error.stack,
    });
    process.exit(1);
  });

  process.on("unhandledRejection", (reason) => {
    postWorkerMessage({
      type: "error",
      error: `Unhandled rejection in subprocess: ${reason}`,
    });
    process.exit(1);
  });
} else if (isBunWorker && self) {
  // Bun Web Worker error handling with properly typed events
  self.addEventListener("error", (event: ErrorEvent) => {
    postWorkerMessage({
      type: "error",
      error: `Uncaught error in bun-worker: ${event.message}`,
    });
  });

  self.addEventListener("unhandledrejection", (event: WorkerPromiseRejectionEvent) => {
    postWorkerMessage({
      type: "error",
      error: `Unhandled rejection in bun-worker: ${event.reason}`,
    });
  });
} else {
  // Node.js worker_threads error handling
  process.on("uncaughtException", (error) => {
    postWorkerMessage({
      type: "error",
      error: `Uncaught exception in node-worker: ${error.message}`,
      stack: error.stack,
    });
    process.exit(1);
  });

  process.on("unhandledRejection", (reason) => {
    postWorkerMessage({
      type: "error",
      error: `Unhandled rejection in node-worker: ${reason}`,
    });
    process.exit(1);
  });
}
