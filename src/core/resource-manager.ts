/**
 * Resource Manager — monitors and manages CPU, memory, and I/O resources
 * for commodity hardware optimization.
 *
 * Rewritten with simplified internals:
 *  - Ring buffer implemented via fixed-size array with write cursor (no shift())
 *  - Unified pressure evaluation with hysteresis
 *  - Map-based allocation registry (retained from original)
 */

import { EventEmitter } from "node:events";
import os from "node:os";
import { log } from "../logging/index.js";
import type { ResourceConstraints } from "../types/agent.js";
import { knowledgeBus } from "./knowledge-bus.js";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const MB = 1048576;
const toMB = (bytes: number): number => Math.round(bytes / MB);

function isBunRuntime(): boolean {
  return typeof globalThis.Bun !== "undefined";
}

// ─── Exported Interfaces ─────────────────────────────────────────────────────

export interface ResourceSnapshot {
  timestamp: number;
  memory: {
    total: number;
    used: number;
    free: number;
    percentage: number;
  };
  cpu: {
    cores: number;
    usage: number;
    loadAverage: number[];
  };
  io: {
    pendingReads: number;
    pendingWrites: number;
  };
}

export interface ResourceAllocation {
  agentId: string;
  memoryMB: number;
  cpuPercent: number;
  priority: number;
}

// ─── Ring Buffer ─────────────────────────────────────────────────────────────

/**
 * Fixed-capacity ring buffer that avoids Array.shift() overhead.
 * Oldest entries are silently overwritten when capacity is reached.
 */
class SnapshotRing {
  private buf: (ResourceSnapshot | undefined)[];
  private head = 0; // next write position
  private len = 0;

  constructor(private readonly capacity: number) {
    this.buf = new Array<ResourceSnapshot | undefined>(capacity);
  }

  push(snap: ResourceSnapshot): void {
    this.buf[this.head] = snap;
    this.head = (this.head + 1) % this.capacity;
    if (this.len < this.capacity) this.len++;
  }

  /** Return the most recently pushed snapshot, or null. */
  latest(): ResourceSnapshot | null {
    if (this.len === 0) return null;
    const idx = (this.head - 1 + this.capacity) % this.capacity;
    return this.buf[idx]!;
  }

  /**
   * Return snapshots with timestamp >= cutoff, ordered oldest-first.
   * Uses binary search on the logical (unwrapped) array.
   */
  since(cutoffMs: number): ResourceSnapshot[] {
    if (this.len === 0) return [];

    // Build a logical view: oldest element is at logical index 0
    const start = this.len < this.capacity ? 0 : this.head; // oldest physical index

    // Binary search for first index where timestamp >= cutoff
    let lo = 0;
    let hi = this.len;
    while (lo < hi) {
      const mid = (lo + hi) >>> 1;
      const physIdx = (start + mid) % this.capacity;
      if (this.buf[physIdx]!.timestamp < cutoffMs) {
        lo = mid + 1;
      } else {
        hi = mid;
      }
    }

    // Collect from lo..len
    const result: ResourceSnapshot[] = [];
    for (let i = lo; i < this.len; i++) {
      result.push(this.buf[(start + i) % this.capacity]!);
    }
    return result;
  }

  get size(): number {
    return this.len;
  }
}

// ─── Resource Manager ────────────────────────────────────────────────────────

export class ResourceManager extends EventEmitter {
  // Constraints
  private constraints: ResourceConstraints;

  // Allocations
  private allocations = new Map<string, ResourceAllocation>();

  // Monitoring
  private snapshots: SnapshotRing;
  private monitoring = false;
  private tickTimer?: ReturnType<typeof setInterval> | undefined;

  // Adaptive polling
  private pollingIntervalMs = 1000;
  private static readonly POLL_FLOOR = 1000;
  private static readonly POLL_CEILING = 10_000;

  // Throttle
  private throttled = false;
  private readonly throttleThreshold = 0.8; // 80%

  constructor(constraints?: ResourceConstraints) {
    super();

    const systemMemGB = os.totalmem() / (1024 * 1024 * 1024);
    const cpuCount = os.cpus().length;
    const autoMemoryMB = Math.min(Math.max(4096, Math.floor(systemMemGB * 512)), 16384);

    this.constraints = constraints ?? {
      maxMemoryMB: autoMemoryMB,
      maxCpuPercent: 95,
      maxConcurrentAgents: Math.min(20, cpuCount * 3),
      maxTaskQueueSize: 200,
    };

    this.snapshots = new SnapshotRing(60);

    log.i("RESOURCEMGR", "init", {
      memMB: this.constraints.maxMemoryMB,
      maxAgents: this.constraints.maxConcurrentAgents,
    });
  }

  // ─── Monitoring ──────────────────────────────────────────────────────────

  /** Start adaptive resource monitoring. Disabled under Bun runtime. */
  startMonitoring(): void {
    if (this.monitoring) return;
    this.monitoring = true;
    this.emit("monitoring:started");

    if (isBunRuntime()) return;

    this.tick();
    this.tickTimer = setInterval(() => this.tick(), 2000);
  }

  /** Stop resource monitoring and reset polling interval. */
  stopMonitoring(): void {
    if (!this.monitoring) return;
    this.monitoring = false;
    this.pollingIntervalMs = 1000;

    if (this.tickTimer) {
      clearInterval(this.tickTimer);
      this.tickTimer = undefined;
    }

    this.emit("monitoring:stopped");
  }

  // ─── Allocation ──────────────────────────────────────────────────────────

  /** Request resource allocation for an agent. Returns true on success. */
  requestAllocation(agentId: string, memoryMB: number, cpuPercent: number, priority = 5): boolean {
    const totals = this.sumAllocated();

    if (totals.memory + memoryMB > this.constraints.maxMemoryMB) {
      this.emit("allocation:denied", {
        agentId,
        reason: "memory_exceeded",
        requested: memoryMB,
        available: this.constraints.maxMemoryMB - totals.memory,
      });
      return false;
    }

    if (totals.cpu + cpuPercent > this.constraints.maxCpuPercent) {
      this.emit("allocation:denied", {
        agentId,
        reason: "cpu_exceeded",
        requested: cpuPercent,
        available: this.constraints.maxCpuPercent - totals.cpu,
      });
      return false;
    }

    this.allocations.set(agentId, { agentId, memoryMB, cpuPercent, priority });
    this.emit("allocation:granted", { agentId, memoryMB, cpuPercent });
    return true;
  }

  /** Release resources allocated to an agent. */
  releaseAllocation(agentId: string): void {
    const existing = this.allocations.get(agentId);
    if (existing) {
      this.allocations.delete(agentId);
      this.emit("allocation:released", existing);
    }
  }

  // ─── Queries ─────────────────────────────────────────────────────────────

  /** Get the most recent resource snapshot, or null if none recorded yet. */
  getCurrentUsage(): ResourceSnapshot | null {
    return this.snapshots.latest();
  }

  /**
   * Get resource usage history for the last N seconds.
   * O(log n) binary search on the internal ring buffer.
   */
  getHistory(seconds = 60): ResourceSnapshot[] {
    return this.snapshots.since(Date.now() - seconds * 1000);
  }

  /** Check if system should be throttled. */
  isSystemThrottled(): boolean {
    return this.throttled;
  }

  /** Get remaining available resources after all current allocations. */
  getAvailableResources(): { memoryMB: number; cpuPercent: number } {
    const totals = this.sumAllocated();
    return {
      memoryMB: Math.max(0, this.constraints.maxMemoryMB - totals.memory),
      cpuPercent: Math.max(0, this.constraints.maxCpuPercent - totals.cpu),
    };
  }

  /**
   * Suggest optimal allocation for a new agent based on priority (0-10).
   * Returns null if insufficient resources remain.
   */
  suggestAllocation(priority: number): { memoryMB: number; cpuPercent: number } | null {
    const avail = this.getAvailableResources();

    if (avail.memoryMB < 50 || avail.cpuPercent < 5) return null;

    const factor = priority / 10;
    return {
      memoryMB: Math.min(Math.floor(avail.memoryMB * factor * 0.5), 256),
      cpuPercent: Math.min(Math.floor(avail.cpuPercent * factor * 0.5), 25),
    };
  }

  /** Force garbage collection if the --expose-gc flag is active. */
  requestGarbageCollection(): void {
    if (global.gc) {
      log.i("RESOURCEMGR", "gc_forced");
      global.gc();
      this.emit("gc:completed");
    } else {
      log.w("RESOURCEMGR", "gc_not_exposed", { hint: "run with --expose-gc" });
    }
  }

  /** Adjust resource constraints for large codebases. */
  adjustForCodebaseSize(fileCount: number, projectSizeMB: number): void {
    let memLimit = this.constraints.maxMemoryMB;
    let agentLimit = this.constraints.maxConcurrentAgents;

    if (fileCount > 10_000) {
      memLimit = Math.min(this.constraints.maxMemoryMB * 3, 16384);
      agentLimit = 2;
      log.i("RESOURCEMGR", "xlarge_codebase", { files: fileCount, memMB: memLimit, agents: agentLimit });
    } else if (fileCount > 5000) {
      memLimit = Math.min(this.constraints.maxMemoryMB * 2, 12288);
      agentLimit = Math.max(4, Math.floor(agentLimit / 2));
      log.i("RESOURCEMGR", "vlarge_codebase", { files: fileCount, memMB: memLimit, agents: agentLimit });
    } else if (fileCount > 2000) {
      memLimit = Math.min(this.constraints.maxMemoryMB * 1.5, 8192);
      log.i("RESOURCEMGR", "large_codebase", { files: fileCount, memMB: memLimit });
    }

    this.constraints.maxMemoryMB = memLimit;
    this.constraints.maxConcurrentAgents = agentLimit;

    const payload = { fileCount, projectSizeMB, newMemoryLimit: memLimit, newAgentLimit: agentLimit };
    this.emit("resources:adjusted", payload);
    knowledgeBus.publish("resources:adjusted", payload, "resource-manager", 60_000);
  }

  /** Get a shallow copy of current resource constraints. */
  getConstraints(): ResourceConstraints {
    return { ...this.constraints };
  }

  // ─── Internals ───────────────────────────────────────────────────────────

  /** Single monitoring tick: capture snapshot, evaluate pressure, adapt interval. */
  private tick(): void {
    if (!this.monitoring) return;

    this.captureSnapshot();
    const pressure = this.evaluatePressure();

    // Adapt polling frequency
    if (pressure > 0.8) {
      this.pollingIntervalMs = ResourceManager.POLL_FLOOR;
    } else if (pressure < 0.3) {
      this.pollingIntervalMs = Math.min(ResourceManager.POLL_CEILING, Math.round(this.pollingIntervalMs * 1.5));
    } else {
      this.pollingIntervalMs = 2000;
    }
  }

  /** Capture a system resource snapshot and push it into the ring buffer. */
  private captureSnapshot(): void {
    const totalBytes = os.totalmem();
    const freeBytes = os.freemem();
    const usedBytes = totalBytes - freeBytes;
    const cores = os.cpus().length;

    const snap: ResourceSnapshot = {
      timestamp: Date.now(),
      memory: {
        total: toMB(totalBytes),
        used: toMB(usedBytes),
        free: toMB(freeBytes),
        percentage: (usedBytes / totalBytes) * 100,
      },
      cpu: {
        cores,
        usage: this.estimateCpuUsage(),
        loadAverage: os.loadavg(),
      },
      io: {
        pendingReads: 0,
        pendingWrites: 0,
      },
    };

    this.snapshots.push(snap);
    this.emit("snapshot:captured", snap);
  }

  /** Derive approximate CPU usage from 1-minute load average. */
  private estimateCpuUsage(): number {
    const avg = os.loadavg();
    const oneMin = Array.isArray(avg) && typeof avg[0] === "number" ? avg[0] : 0;
    const cores = os.cpus().length || 1;
    return Math.min(100, (oneMin / cores) * 100);
  }

  /**
   * Evaluate combined resource pressure (0..1).
   * Manages throttle state transitions and emits critical-level warnings.
   */
  private evaluatePressure(): number {
    const latest = this.getCurrentUsage();
    if (!latest) return 0;

    const memPressure = latest.memory.percentage / 100;
    const cpuPressure = latest.cpu.usage / 100;
    const pressure = Math.max(memPressure, cpuPressure);

    const thresholdPct = this.throttleThreshold * 100;
    const memOver = latest.memory.percentage > thresholdPct;
    const cpuOver = latest.cpu.usage > thresholdPct;
    const shouldThrottle = memOver || cpuOver;

    if (shouldThrottle && !this.throttled) {
      this.throttled = true;
      log.w("RESOURCEMGR", "throttle_on", { mem: memOver, cpu: cpuOver });
      this.emit("throttle:enabled", { memory: memOver, cpu: cpuOver });
      if (memOver) this.requestGarbageCollection();
    } else if (!shouldThrottle && this.throttled) {
      this.throttled = false;
      log.i("RESOURCEMGR", "throttle_off");
      this.emit("throttle:disabled");
    }

    if (latest.memory.percentage > 90) this.emit("memory:critical", latest.memory);
    if (latest.cpu.usage > 90) this.emit("cpu:critical", latest.cpu);

    return pressure;
  }

  /** Sum all current allocations. */
  private sumAllocated(): { memory: number; cpu: number } {
    let memory = 0;
    let cpu = 0;
    for (const alloc of this.allocations.values()) {
      memory += alloc.memoryMB;
      cpu += alloc.cpuPercent;
    }
    return { memory, cpu };
  }
}

// ─── Singleton ───────────────────────────────────────────────────────────────

export const resourceManager = new ResourceManager();
