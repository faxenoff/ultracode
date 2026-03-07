/**
 * RoslynAddonClient — manages a C# UltraCode.CSharp subprocess for Roslyn analysis.
 *
 * Spawns: `dotnet exec <path>/UltraCode.CSharp.dll --pipe <name> --parent-pid <pid>`
 * Connects via Named Pipe with binary framing (compatible with ipc-protocol.ts).
 *
 * Pattern from: gpu-client.ts (subprocess management)
 */

import { type ChildProcess, execSync, spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import { connect, type Socket } from "node:net";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { log } from "../logging/index.js";
import {
  encodeMessage,
  type IPCEvent,
  type IPCMessage,
  type IPCResponse,
  MessageDecoder,
} from "../shared/ipc-protocol.js";

// ============================================================================
// Types
// ============================================================================

export interface RoslynClientOptions {
  /** Path to UltraCode.CSharp.dll */
  addonPath?: string | undefined;
  /** Path to .sln for eager loading */
  slnPath?: string | undefined;
  /** Request timeout in ms (default: 60000) */
  requestTimeout?: number | undefined;
  /** Max restart attempts (default: 3) */
  maxRestarts?: number | undefined;
  /** Log directory for addon process */
  logDirectory?: string | undefined;
}

interface PendingRequest {
  resolve: (result: unknown) => void;
  reject: (error: Error) => void;
  timer: ReturnType<typeof setTimeout>;
}

export type PhaseChangedHandler = (phase: number) => void;
export type DiagnosticsHandler = (data: unknown) => void;

// ============================================================================
// Addon Discovery
// ============================================================================

const ADDON_DLL_NAME = "UltraCode.CSharp.dll";

/** Find addon DLL in known locations */
function findAddonPath(): string | null {
  const thisDir = dirname(fileURLToPath(import.meta.url));
  const candidates = [
    // Built alongside ultracode dist (produced by build-roslyn scripts)
    join(thisDir, "..", "roslyn-addon", ADDON_DLL_NAME),
    // External libs fallback
    join(process.cwd(), "external-libs", "roslyn-addon", ADDON_DLL_NAME),
    // Development: local dotnet build output
    resolve(process.cwd(), "roslyn", "UltraCode.CSharp", "bin", "Release", "net10.0", ADDON_DLL_NAME),
    // Development: dist/roslyn-addon from build pipeline
    resolve(process.cwd(), "dist", "roslyn-addon", ADDON_DLL_NAME),
  ];

  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      return candidate;
    }
  }

  return null;
}

// ============================================================================
// RoslynAddonClient
// ============================================================================

export class RoslynAddonClient {
  private process: ChildProcess | null = null;
  private socket: Socket | null = null;
  private decoder = new MessageDecoder();
  private pendingRequests = new Map<string, PendingRequest>();
  private eventHandlers = new Map<string, Set<(data: unknown) => void>>();
  private _phase = 0;
  private _connected = false;
  private _restartCount = 0;
  private _pipeName: string;
  private _options: Required<RoslynClientOptions>;
  private _shutdownRequested = false;

  get phase(): number {
    return this._phase;
  }
  get connected(): boolean {
    return this._connected;
  }
  get pipeName(): string {
    return this._pipeName;
  }

  constructor(options: RoslynClientOptions = {}) {
    this._pipeName = `UltraCode_Roslyn_${randomUUID().slice(0, 8)}`;
    this._options = {
      addonPath: options.addonPath || findAddonPath() || "",
      slnPath: options.slnPath || "",
      requestTimeout: options.requestTimeout ?? 60000,
      maxRestarts: options.maxRestarts ?? 3,
      logDirectory: options.logDirectory || "",
    };
  }

  /** Check if addon DLL is available */
  get isAvailable(): boolean {
    return !!this._options.addonPath && existsSync(this._options.addonPath);
  }

  /** Start the addon process and connect via Named Pipe */
  async start(): Promise<boolean> {
    if (!this.isAvailable) {
      log.w("RoslynAddon", "not_available", { path: this._options.addonPath });
      return false;
    }

    try {
      await this.spawnProcess();
      await this.connectPipe();
      this._connected = true;
      this._restartCount = 0;

      log.i("RoslynAddon", "started", { pipe: this._pipeName, sln: this._options.slnPath });
      return true;
    } catch (error) {
      log.e("RoslynAddon", "start_failed", { err: String(error) });
      this.cleanup();
      return false;
    }
  }

  /** Send a request and wait for response */
  async request<T = unknown>(method: string, params?: unknown): Promise<T> {
    if (!this._connected || !this.socket) {
      throw new Error("Addon not connected");
    }

    const id = randomUUID();
    const msg: IPCMessage = {
      id,
      type: "request",
      method,
      params,
    };

    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pendingRequests.delete(id);
        reject(new Error(`Request timeout: ${method} (${this._options.requestTimeout}ms)`));
      }, this._options.requestTimeout);

      this.pendingRequests.set(id, {
        resolve: resolve as (r: unknown) => void,
        reject,
        timer,
      });

      this.socket!.write(encodeMessage(msg));
    });
  }

  /** Subscribe to addon events */
  on(event: string, handler: (data: unknown) => void): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(handler);
  }

  /** Unsubscribe from events */
  off(event: string, handler: (data: unknown) => void): void {
    this.eventHandlers.get(event)?.delete(handler);
  }

  /** Graceful shutdown */
  async shutdown(): Promise<void> {
    this._shutdownRequested = true;
    this._connected = false;

    // Reject all pending
    for (const [, pending] of this.pendingRequests) {
      clearTimeout(pending.timer);
      pending.reject(new Error("Addon shutting down"));
    }
    this.pendingRequests.clear();

    this.cleanup();
  }

  // ==========================================================================
  // Private
  // ==========================================================================

  private async spawnProcess(): Promise<void> {
    const args: string[] = [
      "exec",
      this._options.addonPath!,
      "--pipe",
      this._pipeName,
      "--parent-pid",
      String(process.pid),
    ];

    if (this._options.slnPath) {
      args.push("--sln", this._options.slnPath);
    }
    if (this._options.logDirectory) {
      args.push("--log-directory", this._options.logDirectory);
    }

    this.process = spawn("dotnet", args, {
      stdio: ["ignore", "pipe", "pipe"],
      windowsHide: true,
      env: {
        ...Object.fromEntries(Object.entries(process.env).filter((e): e is [string, string] => e[1] != null)),
        // Disable MSBuild node reuse — prevents orphaned dotnet worker processes
        // that MSBuildWorkspace spawns for parallel project evaluation.
        MSBUILDDISABLENODEREUSE: "1",
      },
    });

    // NOTE: No process.unref() — we WANT the parent to track and kill the child on exit.
    // Previously, unref() caused orphaned dotnet processes (20+ zombie .NET processes).

    // Log stderr
    this.process!.stderr?.on("data", (data: Buffer) => {
      const text = data.toString().trim();
      if (text) {
        log.d("RoslynAddon", "stderr", { msg: text });
      }
    });

    this.process!.on("exit", (code) => {
      log.i("RoslynAddon", "process_exit", { code });
      this._connected = false;
      if (!this._shutdownRequested) {
        this.tryRestart();
      }
    });

    // Wait a moment for pipe server to initialize
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  private async connectPipe(): Promise<void> {
    const pipePath = process.platform === "win32" ? `\\\\.\\pipe\\${this._pipeName}` : `/tmp/${this._pipeName}.sock`;

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Pipe connection timeout: ${pipePath}`));
      }, 10000);

      this.socket = connect(pipePath, () => {
        clearTimeout(timeout);
        this.setupSocketHandlers();
        resolve();
      });

      this.socket.on("error", (err) => {
        clearTimeout(timeout);
        reject(err);
      });
    });
  }

  private setupSocketHandlers(): void {
    if (!this.socket) return;

    this.socket.on("data", (chunk: Buffer) => {
      const messages = this.decoder.decode(chunk);
      for (const msg of messages) {
        this.handleMessage(msg);
      }
    });

    this.socket.on("close", () => {
      this._connected = false;
      if (!this._shutdownRequested) {
        log.w("RoslynAddon", "pipe_closed");
      }
    });

    this.socket.on("error", (err) => {
      log.e("RoslynAddon", "pipe_error", { err: String(err) });
    });
  }

  private handleMessage(msg: IPCMessage): void {
    if (msg.type === "response") {
      const resp = msg as IPCResponse;
      const pending = this.pendingRequests.get(resp.id);
      if (pending) {
        clearTimeout(pending.timer);
        this.pendingRequests.delete(resp.id);
        if (resp.error) {
          pending.reject(new Error(`${resp.error.code}: ${resp.error.message}`));
        } else {
          pending.resolve(resp.result);
        }
      }
    } else if (msg.type === "event") {
      const evt = msg as IPCEvent;
      // Track phase changes
      if (evt.event === "phaseChanged" && evt.data && typeof evt.data === "object" && "phase" in evt.data) {
        this._phase = (evt.data as { phase: number }).phase;
        log.i("RoslynAddon", "phase_changed", { phase: this._phase });
      }

      // Dispatch to handlers
      const handlers = this.eventHandlers.get(evt.event);
      if (handlers) {
        for (const handler of handlers) {
          try {
            handler(evt.data);
          } catch {
            /* ignore */
          }
        }
      }
    }
  }

  private tryRestart(): void {
    // Disabled auto-restart: was causing 20+ orphaned .NET processes.
    // The lifecycle manager (roslyn-lifecycle.ts) handles recovery.
    log.w("RoslynAddon", "process_exited_no_restart", {
      restartCount: this._restartCount,
      hint: "Auto-restart disabled. Use ensureRoslynStarted() for recovery.",
    });
  }

  private cleanup(): void {
    if (this.socket) {
      this.socket.destroy();
      this.socket = null;
    }
    if (this.process) {
      const pid = this.process.pid;
      try {
        // On Windows, kill the entire process tree (dotnet + any MSBuild workers)
        if (process.platform === "win32" && pid) {
          try {
            execSync(`taskkill /PID ${pid} /T /F`, { stdio: "ignore", timeout: 5000 });
          } catch {
            // Fallback to regular kill
            this.process.kill();
          }
        } else {
          this.process.kill();
        }
      } catch {
        /* already dead */
      }
      this.process = null;
    }
    this.decoder.reset();
  }
}
