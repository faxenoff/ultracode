/**
 * llama.cpp Server Manager
 *
 * Manages the lifecycle of llama-server processes:
 * - Starts server when embedding/LLM is requested (if configured)
 * - Stops server when MCP server shuts down
 * - Health monitoring and auto-restart
 *
 * Port allocation:
 * - Embedding: 8085 (llama-server --embedding)
 * - LLM: 8086 (llama-server for chat completions)
 *
 * llama.cpp uses OpenAI-compatible API:
 * - /v1/embeddings for embedding generation
 * - /v1/chat/completions for LLM
 * - /health for health checks
 */

import { type ChildProcess, exec, spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { promisify } from "node:util";
import { log } from "../logging/index.js";
import { getDataDir } from "../utils/config-paths.js";
import { toError } from "../utils/error-handling.js";
import { isBunRuntime, sleep } from "../utils/runtime.js";

const execAsync = promisify(exec);

// Cache for detected P-cores count
let cachedPCoresCount: number | null = null;

/**
 * Detect optimal thread count based on P-cores (Performance cores).
 * For hybrid CPUs (Intel 12th+ gen, AMD), using all logical threads hurts performance.
 * Optimal is P-cores count (not E-cores, not hyperthreading).
 *
 * Fallback hierarchy:
 * 1. Physical cores (approximates P-cores)
 * 2. Logical cores / 2 (assume hyperthreading)
 * 3. Default 4
 */
async function detectOptimalThreads(): Promise<number> {
  if (cachedPCoresCount !== null) {
    return cachedPCoresCount;
  }

  try {
    const isWindows = process.platform === "win32";

    if (isWindows) {
      // Windows: detect hybrid CPU (Intel 12th+) vs regular CPU
      // NumberOfCores includes BOTH P-cores and E-cores on hybrid!
      // Strategy: get NumberOfCores and NumberOfLogicalProcessors
      // - Regular CPU: cores = physical, logical = cores * 2 (HT)
      // - Hybrid CPU: cores = P + E, logical = P*2 + E (only P-cores have HT)
      // Heuristic: if logical < cores * 2, it's hybrid - use (logical - cores) as P-cores estimate
      const { stdout } = await execAsync("wmic cpu get NumberOfCores,NumberOfLogicalProcessors /value", {
        timeout: 3000,
      });
      const coresMatch = stdout.match(/NumberOfCores=(\d+)/);
      const logicalMatch = stdout.match(/NumberOfLogicalProcessors=(\d+)/);

      if (coresMatch?.[1] && logicalMatch?.[1]) {
        const physicalCores = Number.parseInt(coresMatch[1], 10);
        const logicalCores = Number.parseInt(logicalMatch[1], 10);

        // Detect hybrid CPU: on hybrid, logical > physical AND logical < physical * 2
        // because E-cores don't have hyperthreading, only P-cores do
        // - Regular CPU with HT: logical = physical * 2
        // - Regular CPU no HT: logical = physical
        // - Hybrid CPU: logical > physical AND logical < physical * 2
        const isHybrid = logicalCores > physicalCores && logicalCores < physicalCores * 2;

        if (isHybrid) {
          // Hybrid CPU (Intel 12th+): P-cores = logical - physical
          // Example: 32 logical - 24 physical = 8 P-cores (each P has 2 threads)
          // Actually: P-cores * 2 + E-cores = logical
          // And: P-cores + E-cores = physical
          // So: P-cores = logical - physical
          const pCores = Math.max(4, logicalCores - physicalCores);
          cachedPCoresCount = pCores;
          log.i("LLAMACPP", "Detected P-cores (hybrid)", {
            pCores,
            physical: physicalCores,
            logical: logicalCores,
            method: "wmic-hybrid",
          });
          return pCores;
        } else {
          // Regular CPU: use physical cores (no E-cores)
          cachedPCoresCount = physicalCores;
          log.i("LLAMACPP", "Detected P-cores (regular)", {
            cores: physicalCores,
            logical: logicalCores,
            method: "wmic",
          });
          return physicalCores;
        }
      }
    } else {
      // Linux/Mac: use /proc/cpuinfo or sysctl
      if (process.platform === "darwin") {
        // macOS: physical cores
        const { stdout } = await execAsync("sysctl -n hw.physicalcpu", { timeout: 3000 });
        const cores = Number.parseInt(stdout.trim(), 10);
        if (cores > 0) {
          cachedPCoresCount = cores;
          log.i("LLAMACPP", "Detected P-cores", { cores, method: "sysctl" });
          return cores;
        }
      } else {
        // Linux: read cpu cores from /proc/cpuinfo
        const { stdout } = await execAsync('grep "^cpu cores" /proc/cpuinfo | head -1', { timeout: 3000 });
        const match = stdout.match(/cpu cores\s*:\s*(\d+)/);
        if (match?.[1]) {
          const coresPerSocket = Number.parseInt(match[1], 10);
          // Get socket count
          const { stdout: socketsOut } = await execAsync('grep "^physical id" /proc/cpuinfo | sort -u | wc -l', {
            timeout: 3000,
          });
          const sockets = Number.parseInt(socketsOut.trim(), 10) || 1;
          const cores = coresPerSocket * sockets;
          if (cores > 0) {
            cachedPCoresCount = cores;
            log.i("LLAMACPP", "Detected P-cores", { cores, method: "procfs" });
            return cores;
          }
        }
      }
    }

    // Fallback: use logical cores / 2 (assume hyperthreading)
    const logical = require("node:os").cpus().length;
    const estimated = Math.max(4, Math.floor(logical / 2));
    cachedPCoresCount = estimated;
    log.w("LLAMACPP", "Using estimated P-cores (logical/2)", { logical, estimated });
    return estimated;
  } catch (error: unknown) {
    const err = toError(error);
    log.w("LLAMACPP", "Failed to detect P-cores, using default", { error: err.message });
    cachedPCoresCount = 4;
    return 4;
  }
}

export const LLAMACPP_EMBEDDING_PORT = 8085;
export const LLAMACPP_LLM_PORT = 8086;

export type LlamaCppServerMode = "embedding" | "llm";

export interface LlamaCppServerConfig {
  enabled: boolean;
  mode: LlamaCppServerMode;
  modelPath: string; // Path to GGUF model file
  port?: number | undefined;
  contextSize?: number | undefined;
  nGpuLayers?: number | undefined; // -1 = auto, 0 = CPU only, >0 = specific layers
  ubatchSize?: number | undefined; // Micro-batch size for embeddings (default: 2048)
  batchSize?: number | undefined; // Batch size (default: 4096)
  autoStart?: boolean | undefined;
  healthCheckIntervalMs?: number | undefined;
  startupTimeoutMs?: number | undefined;
  // Performance optimizations
  flashAttn?: boolean | undefined; // Enable Flash Attention (default: true)
  parallelSlots?: number | undefined; // Number of parallel slots for concurrent requests (default: 4)
  mlock?: boolean | undefined; // Lock model in RAM to prevent swapping (default: true)
  noKvOffload?: boolean | undefined; // Don't offload KV cache to GPU (for low VRAM) (default: false)
  threads?: number | undefined; // Number of CPU threads (default: auto)
  threadsBatch?: number | undefined; // Number of threads for batch processing (default: auto)
}

interface LlamaCppServerState {
  process: ChildProcess | null;
  pid: number | null;
  isRunning: boolean;
  isStarting: boolean; // Prevents race condition during startup
  startedAt: number | null;
  restartCount: number;
  lastHealthCheck: number | null;
  lastError: string | null;
  mode: LlamaCppServerMode | null;
  modelPath: string | null;
}

class LlamaCppServerManager {
  private state: LlamaCppServerState = {
    process: null,
    pid: null,
    isRunning: false,
    isStarting: false,
    startedAt: null,
    restartCount: 0,
    lastHealthCheck: null,
    lastError: null,
    mode: null,
    modelPath: null,
  };

  private config: LlamaCppServerConfig = {
    enabled: false,
    mode: "embedding",
    modelPath: "",
    port: LLAMACPP_EMBEDDING_PORT,
    // IMPORTANT: ctx-size is divided by parallel slots!
    // With parallel=4, each slot gets contextSize/4 tokens
    // So for 512 tokens per request, need contextSize = 512 * 8 = 4096
    contextSize: 4096,
    nGpuLayers: 99, // Default: offload all to GPU
    // Optimized based on benchmarks: ubatch=1536 gives +11% vs ubatch=512
    ubatchSize: 1536,
    batchSize: 3072,
    autoStart: true,
    healthCheckIntervalMs: 30000,
    startupTimeoutMs: 120000, // 2 minutes for model loading
    // Performance optimizations (enabled by default)
    flashAttn: true, // Flash Attention for faster KV cache
    parallelSlots: 8, // 4 concurrent requests
    mlock: true, // Lock model in RAM
    noKvOffload: false, // Allow KV cache on GPU
    threads: undefined, // Auto-detect
    threadsBatch: undefined, // Auto-detect
  };

  private healthCheckRunning = false;
  private shutdownPromise: Promise<void> | null = null;
  private healthCheckTimer?: ReturnType<typeof setInterval> | undefined;

  /**
   * Find llama-server binary
   * Searches in:
   * 1. ~/.ultracode/llamacpp/bin/
   * 2. System PATH
   */
  private findBinary(): string | null {
    const dataDir = getDataDir();
    const llamacppDir = join(dataDir, "llamacpp", "bin");
    const isWindows = process.platform === "win32";
    const binaryName = isWindows ? "llama-server.exe" : "llama-server";

    // Check installed location first
    const installedPath = join(llamacppDir, binaryName);
    if (existsSync(installedPath)) {
      return installedPath;
    }

    // Check alternative names (some releases use different names)
    const altNames = isWindows
      ? ["llama-server.exe", "server.exe", "llama-cpp-server.exe"]
      : ["llama-server", "server", "llama-cpp-server"];

    for (const name of altNames) {
      const altPath = join(llamacppDir, name);
      if (existsSync(altPath)) {
        return altPath;
      }
    }

    // Check if binary is in PATH (system-wide installation)
    try {
      const { execSync } = require("node:child_process");
      const cmd = isWindows ? `where ${binaryName}` : `which ${binaryName}`;
      const result = execSync(cmd, { encoding: "utf-8", timeout: 2000 }).trim();
      if (result && existsSync(result.split("\n")[0])) {
        return result.split("\n")[0];
      }
    } catch {
      // Not in PATH
    }

    return null;
  }

  /**
   * Kill existing processes using the specified port
   */
  private async killProcessOnPort(port: number): Promise<void> {
    const isWindows = process.platform === "win32";

    try {
      if (isWindows) {
        const { stdout } = await execAsync(`netstat -ano | findstr ":${port}" | findstr "LISTENING"`, {
          timeout: 2000,
        });

        const lines = stdout.trim().split("\n").filter(Boolean);
        const pidsToKill = new Set<string>();

        for (const line of lines) {
          const parts = line.trim().split(/\s+/);
          const pid = parts[parts.length - 1];
          if (pid && pid !== "0" && /^\d+$/.test(pid)) {
            pidsToKill.add(pid);
          }
        }

        for (const pid of pidsToKill) {
          try {
            const { stdout: taskInfo } = await execAsync(`tasklist /FI "PID eq ${pid}" /FO CSV`, { timeout: 2000 });
            if (taskInfo.includes("llama") || taskInfo.includes("server")) {
              log.w("LLAMACPP", `Killing orphaned process on port ${port}`, { pid });
              await execAsync(`taskkill /F /PID ${pid}`, { timeout: 3000 });
            }
          } catch {
            // Process already dead or permission denied
          }
        }
      } else {
        // Linux/Mac: use lsof and kill
        try {
          const { stdout } = await execAsync(`lsof -ti:${port}`, { timeout: 2000 });
          const pids = stdout.trim().split("\n").filter(Boolean);
          for (const pid of pids) {
            log.w("LLAMACPP", `Killing orphaned process on port ${port}`, { pid });
            await execAsync(`kill -9 ${pid}`, { timeout: 2000 });
          }
        } catch {
          // No process on port
        }
      }
    } catch {
      // No process found on this port
    }
  }

  /**
   * Check if llama.cpp is installed
   */
  isInstalled(): boolean {
    return this.findBinary() !== null;
  }

  /**
   * Get installed binary path
   */
  getBinaryPath(): string | null {
    return this.findBinary();
  }

  /**
   * Configure the manager
   */
  configure(config: Partial<LlamaCppServerConfig>): void {
    this.config = { ...this.config, ...config };

    // Set default port based on mode
    if (!config.port) {
      this.config.port = this.config.mode === "embedding" ? LLAMACPP_EMBEDDING_PORT : LLAMACPP_LLM_PORT;
    }

    log.i("LLAMACPP", "configured", {
      mode: this.config.mode,
      port: this.config.port,
      model: this.config.modelPath,
      contextSize: this.config.contextSize,
      nGpuLayers: this.config.nGpuLayers,
      batchSize: this.config.batchSize,
      ubatchSize: this.config.ubatchSize,
      flashAttn: this.config.flashAttn,
      parallel: this.config.parallelSlots,
      mlock: this.config.mlock,
    });
  }

  /**
   * Get current state
   */
  getState(): Readonly<LlamaCppServerState> {
    return { ...this.state };
  }

  /**
   * Get endpoint URL
   */
  getEndpoint(): string {
    return `http://127.0.0.1:${this.config.port}`;
  }

  /**
   * Start llama-server process
   */
  async start(): Promise<boolean> {
    if (this.state.isRunning) {
      log.i("LLAMACPP", "Already running", { pid: this.state.pid, mode: this.state.mode });
      return true;
    }

    // Prevent race condition: if another start() is in progress, wait for it
    if (this.state.isStarting) {
      log.i("LLAMACPP", "Start already in progress, waiting...");
      // Wait for startup to complete (poll every 500ms, max 2 minutes)
      const maxWait = 120_000;
      const startWait = Date.now();
      while (this.state.isStarting && Date.now() - startWait < maxWait) {
        await sleep(500);
      }
      // Return current running state after waiting
      return this.state.isRunning;
    }

    // Mark as starting to prevent concurrent starts
    this.state.isStarting = true;

    const binaryPath = this.findBinary();
    if (!binaryPath) {
      this.state.lastError = "llama-server binary not found";
      log.e("LLAMACPP", this.state.lastError);
      this.state.isStarting = false;
      return false;
    }

    if (!this.config.modelPath || !existsSync(this.config.modelPath)) {
      this.state.lastError = `Model file not found: ${this.config.modelPath}`;
      log.e("LLAMACPP", this.state.lastError);
      this.state.isStarting = false;
      return false;
    }

    // Debug: skip subprocess spawning if disabled
    if (process.env["ULTRACODE_NO_SUBPROCESS"] === "1") {
      log.w("LLAMACPP", "SKIPPED (ULTRACODE_NO_SUBPROCESS=1)");
      this.state.isStarting = false;
      return false;
    }

    log.i("LLAMACPP", "Starting llama-server", {
      binary: binaryPath,
      model: this.config.modelPath,
      mode: this.config.mode,
      port: this.config.port,
      contextSize: this.config.contextSize,
      nGpuLayers: this.config.nGpuLayers,
    });

    // Kill any orphaned processes on our port
    await this.killProcessOnPort(this.config.port!);
    await sleep(200);

    try {
      const args = [
        "--model",
        this.config.modelPath,
        "--port",
        String(this.config.port),
        "--host",
        "127.0.0.1",
        "--ctx-size",
        String(this.config.contextSize),
        "--n-gpu-layers",
        String(this.config.nGpuLayers),
      ];

      // Add mode-specific args
      if (this.config.mode === "embedding") {
        args.push("--embedding");
        // Batch sizes for embedding mode
        if (this.config.ubatchSize) {
          args.push("--ubatch-size", String(this.config.ubatchSize));
        }
        if (this.config.batchSize) {
          args.push("--batch-size", String(this.config.batchSize));
        }
      }

      // Performance optimizations
      if (this.config.flashAttn) {
        // Note: newer llama.cpp requires value: on|off|auto
        args.push("--flash-attn", "on");
      }
      if (this.config.parallelSlots && this.config.parallelSlots > 1) {
        args.push("--parallel", String(this.config.parallelSlots));
      }
      if (this.config.mlock) {
        args.push("--mlock");
      }
      if (this.config.noKvOffload) {
        args.push("--no-kv-offload");
      }

      // Thread optimization: use P-cores count for best performance
      // IMPORTANT: Do NOT use all logical threads on hybrid CPUs (Intel 12th+)
      // E-cores and hyperthreading hurt llama.cpp performance
      const optimalThreads =
        this.config.threads && this.config.threads > 0 ? this.config.threads : await detectOptimalThreads();
      args.push("--threads", String(optimalThreads));

      // Use same thread count for batch processing unless explicitly set
      const batchThreads =
        this.config.threadsBatch && this.config.threadsBatch > 0 ? this.config.threadsBatch : optimalThreads;
      args.push("--threads-batch", String(batchThreads));

      // NOTE: Continuous batching is ENABLED by default in llama-server.
      // Do NOT add --no-cont-batching as it severely hurts throughput!
      // Continuous batching allows processing multiple requests concurrently.

      const binDir = dirname(binaryPath);
      const isWindows = process.platform === "win32";

      // Environment setup
      const env: Record<string, string | undefined> = { ...process.env };

      if (isWindows) {
        // Add bin directory to PATH for DLLs
        env["PATH"] = `${binDir};${process.env["PATH"] || ""}`;
      } else if (process.platform === "darwin") {
        // macOS uses DYLD_LIBRARY_PATH (not LD_LIBRARY_PATH)
        env["DYLD_LIBRARY_PATH"] = `${binDir}:${process.env["DYLD_LIBRARY_PATH"] || ""}`;
      } else {
        // Linux
        env["LD_LIBRARY_PATH"] = `${binDir}:${process.env["LD_LIBRARY_PATH"] || ""}`;
      }

      log.d("LLAMACPP", "Spawning process", {
        args: args.join(" "),
        threads: optimalThreads,
        batchThreads,
      });

      this.state.process = spawn(binaryPath, args, {
        detached: false,
        stdio: ["ignore", "pipe", "pipe"],
        windowsHide: true,
        cwd: binDir,
        env,
      });

      const proc = this.state.process;
      if (!proc) {
        throw new Error("Failed to spawn llama-server process");
      }

      this.state.pid = proc.pid ?? null;
      this.state.startedAt = Date.now();
      this.state.mode = this.config.mode;
      this.state.modelPath = this.config.modelPath;

      // Handle stdout
      proc.stdout?.on("data", (data: Buffer) => {
        const msg = data.toString().trim();
        if (msg) {
          log.d("LLAMACPP", `stdout: ${msg.slice(0, 300)}`);
        }
      });

      // Handle stderr (llama.cpp logs to stderr)
      proc.stderr?.on("data", (data: Buffer) => {
        const msg = data.toString().trim();
        if (msg) {
          if (msg.includes("error") || msg.includes("Error") || msg.includes("ERROR")) {
            log.w("LLAMACPP", `stderr: ${msg.slice(0, 400)}`);
          } else if (msg.includes("model loaded") || msg.includes("server listening")) {
            log.i("LLAMACPP", msg.slice(0, 200));
          } else {
            log.d("LLAMACPP", `stderr: ${msg.slice(0, 200)}`);
          }
        }
      });

      // Handle process exit
      proc.on("exit", (code, signal) => {
        log.i("LLAMACPP", "Process exited", { code, signal, pid: this.state.pid });
        this.state.isRunning = false;
        this.state.process = null;
        this.state.pid = null;
      });

      // Handle process error
      proc.on("error", (err) => {
        this.state.lastError = err.message;
        log.e("LLAMACPP", "Process error", { error: err.message });
        this.state.isRunning = false;
      });

      // Wait for server to be ready
      const ready = await this.waitForReady(this.config.startupTimeoutMs!);

      if (ready) {
        this.state.isRunning = true;
        this.state.isStarting = false;
        this.startHealthCheck();
        log.i("LLAMACPP", "Started successfully", {
          pid: this.state.pid,
          mode: this.config.mode,
          endpoint: this.getEndpoint(),
        });
        return true;
      } else {
        this.state.lastError = "Startup timeout";
        log.e("LLAMACPP", "Startup timeout - killing process");
        await this.stop();
        this.state.isStarting = false;
        return false;
      }
    } catch (error: unknown) {
      const err = toError(error);
      this.state.lastError = err.message;
      log.e("LLAMACPP", "Failed to start", { error: err.message });
      this.state.isStarting = false;
      return false;
    }
  }

  /**
   * Wait for llama-server to be ready
   * llama.cpp has /health endpoint that returns 200 when ready
   */
  private async waitForReady(timeoutMs: number): Promise<boolean> {
    const startTime = Date.now();
    const checkInterval = 500;

    while (Date.now() - startTime < timeoutMs) {
      try {
        const response = await fetch(`${this.getEndpoint()}/health`, {
          method: "GET",
          signal: AbortSignal.timeout(2000),
        });

        if (response.ok) {
          const elapsed = Date.now() - startTime;
          log.i("LLAMACPP", "Server ready", { elapsedMs: elapsed });
          return true;
        }
      } catch {
        // Server not ready yet
      }

      // Check if process exited
      if (this.state.process?.exitCode !== null) {
        log.e("LLAMACPP", "Process exited during startup");
        return false;
      }

      await sleep(checkInterval);
    }

    return false;
  }

  /**
   * Stop llama-server process
   */
  async stop(): Promise<void> {
    if (this.shutdownPromise) {
      return this.shutdownPromise;
    }

    this.shutdownPromise = this.doStop();
    await this.shutdownPromise;
    this.shutdownPromise = null;
  }

  private async doStop(): Promise<void> {
    this.stopHealthCheck();

    if (!this.state.process) {
      this.state.isRunning = false;
      return;
    }

    const pid = this.state.pid;
    log.i("LLAMACPP", "Stopping llama-server", { pid });

    return new Promise((resolve) => {
      const abortController = new AbortController();

      // Force kill timeout
      (async () => {
        await sleep(5000);
        if (!abortController.signal.aborted) {
          if (this.state.process || pid) {
            log.w("LLAMACPP", "Force killing process");
            await this.forceKillProcess(pid);
          }
          this.state.isRunning = false;
          this.state.process = null;
          this.state.pid = null;
          resolve();
        }
      })();

      this.state.process!.once("exit", () => {
        abortController.abort();
        this.state.isRunning = false;
        this.state.process = null;
        this.state.pid = null;
        log.i("LLAMACPP", "Stopped successfully");
        resolve();
      });

      if (process.platform === "win32" && pid) {
        this.killWindowsProcess(pid).catch(() => {
          this.state.process?.kill("SIGTERM");
        });
      } else {
        this.state.process!.kill("SIGTERM");
      }
    });
  }

  private async killWindowsProcess(pid: number | null): Promise<void> {
    if (!pid) return;

    try {
      await execAsync(`taskkill /F /PID ${pid}`, { timeout: 5000 });
      log.d("LLAMACPP", "Process killed via taskkill", { pid });
    } catch (_error: unknown) {
      log.d("LLAMACPP", "taskkill error (process may already be dead)", { pid });
    }
  }

  private async forceKillProcess(pid: number | null): Promise<void> {
    if (process.platform === "win32") {
      await this.killWindowsProcess(pid);
    } else if (pid) {
      try {
        process.kill(pid, "SIGKILL");
      } catch {
        // Process already dead
      }
    }
  }

  /**
   * Start health check loop
   */
  private startHealthCheck(): void {
    if (this.healthCheckRunning) return;
    this.healthCheckRunning = true;

    if (isBunRuntime()) return;

    const checkHealth = async () => {
      if (!this.healthCheckRunning || !this.state.isRunning) return;

      try {
        const response = await fetch(`${this.getEndpoint()}/health`, {
          method: "GET",
          signal: AbortSignal.timeout(5000),
        });

        this.state.lastHealthCheck = Date.now();

        if (!response.ok) {
          log.w("LLAMACPP", "Health check failed", { status: response.status });
        }
      } catch (error: unknown) {
        const err = toError(error);
        log.w("LLAMACPP", "Health check error", { error: err.message });
      }
    };

    const interval = this.config.healthCheckIntervalMs ?? 30000;
    this.healthCheckTimer = setInterval(checkHealth, interval);
  }

  private stopHealthCheck(): void {
    this.healthCheckRunning = false;
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = undefined;
    }
  }

  /**
   * Check if server is healthy
   */
  async isHealthy(): Promise<boolean> {
    if (!this.state.isRunning) return false;

    try {
      const response = await fetch(`${this.getEndpoint()}/health`, {
        method: "GET",
        signal: AbortSignal.timeout(2000),
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Restart server
   */
  async restart(): Promise<boolean> {
    log.i("LLAMACPP", "Restarting");
    await this.stop();
    this.state.restartCount++;
    return this.start();
  }

  /**
   * Ensure server is running with the given config
   * Starts if not running, restarts if config changed
   */
  async ensureRunning(config: Partial<LlamaCppServerConfig>): Promise<boolean> {
    const needsRestart =
      this.state.isRunning &&
      (this.state.mode !== config.mode ||
        this.state.modelPath !== config.modelPath ||
        this.config.port !== config.port);

    if (needsRestart) {
      log.i("LLAMACPP", "Config changed, restarting", {
        oldMode: this.state.mode,
        newMode: config.mode,
        oldModel: this.state.modelPath,
        newModel: config.modelPath,
      });
      await this.stop();
    }

    if (!this.state.isRunning) {
      this.configure({ ...config, enabled: true });
      return this.start();
    }

    return true;
  }
}

// Singleton instances for embedding and LLM
export const llamacppEmbeddingManager = new LlamaCppServerManager();
export const llamacppLLMManager = new LlamaCppServerManager();

/**
 * Initialize llama.cpp embedding server
 */
export async function initializeLlamaCppEmbedding(config: Partial<LlamaCppServerConfig>): Promise<boolean> {
  if (!config.modelPath) {
    log.w("LLAMACPP", "No model path configured for embedding");
    return false;
  }

  llamacppEmbeddingManager.configure({
    ...config,
    mode: "embedding",
    port: config.port ?? LLAMACPP_EMBEDDING_PORT,
  });

  if (config.autoStart !== false) {
    return llamacppEmbeddingManager.start();
  }

  return true;
}

/**
 * Initialize llama.cpp LLM server
 */
export async function initializeLlamaCppLLM(config: Partial<LlamaCppServerConfig>): Promise<boolean> {
  if (!config.modelPath) {
    log.w("LLAMACPP", "No model path configured for LLM");
    return false;
  }

  llamacppLLMManager.configure({
    ...config,
    mode: "llm",
    port: config.port ?? LLAMACPP_LLM_PORT,
  });

  if (config.autoStart !== false) {
    return llamacppLLMManager.start();
  }

  return true;
}

/**
 * Shutdown all llama.cpp servers
 */
export async function shutdownLlamaCpp(): Promise<void> {
  const shutdowns: Promise<void>[] = [];

  if (llamacppEmbeddingManager.getState().isRunning) {
    shutdowns.push(llamacppEmbeddingManager.stop());
  }

  if (llamacppLLMManager.getState().isRunning) {
    shutdowns.push(llamacppLLMManager.stop());
  }

  await Promise.all(shutdowns);
}

// Synchronous kill for exit handlers
function killLlamaCppSync(pid: number | null): void {
  if (!pid) return;

  try {
    if (process.platform === "win32") {
      const { spawnSync } = require("node:child_process");
      spawnSync("taskkill", ["/F", "/PID", String(pid)], {
        timeout: 3000,
        windowsHide: true,
        stdio: "ignore",
      });
    } else {
      process.kill(pid, "SIGKILL");
    }
  } catch {
    // Best effort
  }
}

// Register signal handlers
let signalHandlersRegistered = false;

function registerSignalHandlers(): void {
  if (signalHandlersRegistered) return;
  signalHandlersRegistered = true;

  const shutdownHandler = async (signal: string) => {
    log.i("LLAMACPP", "signal_received", { signal });
    try {
      await shutdownLlamaCpp();
    } catch (error) {
      log.e("LLAMACPP", "shutdown_error", { signal, err: String(error) });
    }
  };

  process.on("SIGINT", () => shutdownHandler("SIGINT"));
  process.on("SIGTERM", () => shutdownHandler("SIGTERM"));

  if (process.platform === "win32") {
    process.on("SIGBREAK", () => shutdownHandler("SIGBREAK"));
  } else {
    process.on("SIGHUP", () => shutdownHandler("SIGHUP"));
  }

  process.on("exit", () => {
    const embState = llamacppEmbeddingManager.getState();
    const llmState = llamacppLLMManager.getState();

    if (embState.isRunning && embState.pid) {
      killLlamaCppSync(embState.pid);
    }
    if (llmState.isRunning && llmState.pid) {
      killLlamaCppSync(llmState.pid);
    }
  });

  process.on("beforeExit", async () => {
    await shutdownLlamaCpp();
  });

  log.d("LLAMACPP", "Signal handlers registered");
}

registerSignalHandlers();
