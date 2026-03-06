/**
 * Conductor Orchestrator Agent
 *
 * Central coordinator for multi-agent system. Manages agent lifecycle,
 * health monitoring, and provides agent lookup via getAgentByType().
 *
 * Does NOT process tasks directly - use registered agents instead.
 */

import { log } from "../logging/index.js";
import {
  type Agent,
  type AgentMessage,
  type AgentMetrics,
  AgentStatus,
  type AgentTask,
  AgentType,
  type ResourceConstraints,
} from "../types/agent.js";
import { BaseAgent } from "./base.js";
import {
  type ConductorConfig,
  type ConductorConfigOverrides,
  getConductorAgentDefaults,
  isDirectImplementation,
} from "./conductor/index.js";
import { isEventfulAgent } from "./coordinator.js";

// Event-driven architecture: monitoring uses setInterval for Node.js, disabled for Bun

/** Bun global interface */
interface BunGlobal {
  Bun?: unknown;
}

/** Check if running in Bun */
function isBunRuntime(): boolean {
  return typeof (globalThis as BunGlobal).Bun !== "undefined";
}

export class ConductorOrchestrator extends BaseAgent {
  public agents: Map<string, Agent> = new Map();
  private config: ConductorConfig;
  private pendingTasks: Map<string, AgentTask> = new Map();
  private directImplementationAttempts = 0;

  private agentLoadCache: Map<string, { load: number; timestamp: number }> = new Map();
  private readonly LOAD_CACHE_TTL = 5000; // 5 seconds
  private performanceMetrics = {
    totalTasks: 0,
    avgProcessingTime: 0,
    overheadReduction: 0,
    cacheHitRate: 0,
  };

  // Heartbeat and health tracking (async loop pattern - no setInterval for Bun+OpenVINO compatibility)
  private heartbeatRunning = false;
  private healthMonitorRunning = false;
  private performanceLoopRunning = false;
  private readonly HEARTBEAT_INTERVAL_MS = 10000; // 10s (was 5s)
  private readonly HEALTH_CHECK_INTERVAL_MS = 30000; // 30s (was 10s)
  // HEALTH_CHECK_IDLE_MS removed - unused after event-driven refactoring
  private readonly PERFORMANCE_INTERVAL_MS = 60000; // 60s (was 30s)
  private readonly AGENT_STALE_MS = 60000; // 60s without activity (was 30s)
  private agentLastSeen: Map<string, number> = new Map();
  private stopped = false; // Flag to stop async loops on shutdown
  private lastRequestTime = Date.now(); // Track last MCP request for idle detection
  private readonly IDLE_THRESHOLD_MS = 60000; // Consider idle after 1 min of no requests

  constructor(config: ConductorConfigOverrides = {}) {
    const defaults = getConductorAgentDefaults();

    const resolvedCapabilities = {
      maxConcurrency: config.maxConcurrency ?? defaults.capabilities.maxConcurrency,
      memoryLimit: config.memoryLimit ?? defaults.capabilities.memoryLimit,
      priority: config.priority ?? defaults.capabilities.priority,
    };

    super(AgentType.COORDINATOR, resolvedCapabilities);

    const resourceConstraints: ResourceConstraints = {
      maxMemoryMB: config.resourceConstraints?.maxMemoryMB ?? defaults.config.resourceConstraints.maxMemoryMB,
      maxCpuPercent: config.resourceConstraints?.maxCpuPercent ?? defaults.config.resourceConstraints.maxCpuPercent,
      maxConcurrentAgents:
        config.resourceConstraints?.maxConcurrentAgents ?? defaults.config.resourceConstraints.maxConcurrentAgents,
      maxTaskQueueSize:
        config.resourceConstraints?.maxTaskQueueSize ?? defaults.config.resourceConstraints.maxTaskQueueSize,
    };

    this.config = {
      resourceConstraints,
      maxConcurrency: resolvedCapabilities.maxConcurrency,
      memoryLimit: resolvedCapabilities.memoryLimit,
      priority: resolvedCapabilities.priority,
      taskQueueLimit: config.taskQueueLimit ?? defaults.config.taskQueueLimit,
      loadBalancingStrategy: config.loadBalancingStrategy ?? defaults.config.loadBalancingStrategy,
      complexityThreshold: config.complexityThreshold ?? defaults.config.complexityThreshold,
      mandatoryDelegation:
        config.mandatoryDelegation !== undefined ? config.mandatoryDelegation : defaults.config.mandatoryDelegation,
    };
  }

  protected async onInitialize(): Promise<void> {
    const startTime = Date.now();
    log.t("CONDUCTOR", "init_start", { thresh: this.config.complexityThreshold, mandatory: true });

    log.t("CONDUCTOR", "health_monitor_start", {});
    this.startHealthMonitoring();
    log.t("CONDUCTOR", "health_monitor_done", { dur: Date.now() - startTime });

    log.t("CONDUCTOR", "heartbeat_start", {});
    this.startHeartbeat();

    log.t("CONDUCTOR", "delegation_init", {});
    this.initializeDelegationEnforcement();

    log.t("CONDUCTOR", "perf_opts_init", {});
    this.initializePerformanceOptimizations();
    log.t("CONDUCTOR", "init_done", { dur: Date.now() - startTime });
  }

  protected async onShutdown(): Promise<void> {
    log.i("CONDUCTOR", "shutdown_start", { agents: this.agents.size });

    // Stop all async loops
    this.stopped = true;

    // Clear timers
    if (this.healthMonitorTimer) {
      clearInterval(this.healthMonitorTimer);
      this.healthMonitorTimer = undefined;
    }
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = undefined;
    }
    if (this.performanceTimer) {
      clearInterval(this.performanceTimer);
      this.performanceTimer = undefined;
    }

    // Log statistics
    log.i("CONDUCTOR", "shutdown_stats", {
      blocked: this.directImplementationAttempts,
    });

    const shutdownPromises = Array.from(this.agents.values()).map((agent) =>
      agent.shutdown().catch((err) => log.e("CONDUCTOR", "agent_shutdown_fail", { agent: agent.id, err: String(err) })),
    );
    await Promise.all(shutdownPromises);
    this.agents.clear();

    // Clear all caches
    this.agentLastSeen.clear();
    this.agentLoadCache.clear();
    this.pendingTasks.clear();
  }

  protected canProcessTask(_task: AgentTask): boolean {
    return this.pendingTasks.size < this.config.taskQueueLimit;
  }

  protected async processTask(task: AgentTask): Promise<unknown> {
    log.i("CONDUCTOR", "process_task", { task: task.id, type: task.type });
    // ConductorOrchestrator does not process tasks directly
    // All processing should go through registered agents via getAgentByType()
    throw new Error("[CONDUCTOR] Direct task processing is not supported. Use registered agents.");
  }

  private initializeDelegationEnforcement(): void {
    // Override any attempt to bypass delegation
    const originalProcess = this.process.bind(this);
    this.process = async (task: AgentTask) => {
      if (this.checkDirectImplementation(task)) {
        this.directImplementationAttempts++;
        log.w("CONDUCTOR", "direct_blocked", { attempt: this.directImplementationAttempts, task: task.id });
        throw new Error(
          "CONDUCTOR VIOLATION: Direct implementation is FORBIDDEN. " +
            "All tasks MUST be delegated to dev-agent or Dora. " +
            "This is attempt #" +
            this.directImplementationAttempts,
        );
      }
      return originalProcess(task);
    };
  }

  private checkDirectImplementation(task: AgentTask): boolean {
    return isDirectImplementation(task);
  }

  register(agent: Agent): void {
    if (this.agents.size >= this.config.resourceConstraints.maxConcurrentAgents) {
      throw new Error(`Maximum number of agents (${this.config.resourceConstraints.maxConcurrentAgents}) reached`);
    }

    this.agents.set(agent.id, agent);
    log.i("CONDUCTOR", "agent_registered", { agent: agent.id, type: agent.type });

    if (isEventfulAgent(agent)) {
      agent.on("task:completed", this.handleTaskCompleted.bind(this) as (...args: unknown[]) => void);
      agent.on("task:failed", this.handleTaskFailed.bind(this) as (...args: unknown[]) => void);
    }

    this.emit("agent:registered", agent.id);
  }

  unregister(agentId: string): void {
    const agent = this.agents.get(agentId);
    if (agent) {
      this.agents.delete(agentId);
      log.i("CONDUCTOR", "agent_unregistered", { agent: agentId });
      this.emit("agent:unregistered", agentId);
    }
  }

  getAgent(id: string): Agent | undefined {
    return this.agents.get(id);
  }

  getAgentsByType(type: AgentType): Agent[] {
    return Array.from(this.agents.values()).filter((agent) => agent.type === type);
  }

  /**
   * Get the first registered agent of a specific type.
   * Use this instead of getAgent(AgentType.X) since agent IDs include random suffixes.
   */
  getAgentByType(type: AgentType): Agent | undefined {
    const agents = this.getAgentsByType(type);
    if (agents.length === 0) {
      log.d("CONDUCTOR", "agent_not_found", {
        type,
        registered: Array.from(this.agents.keys()),
        types: Array.from(this.agents.values()).map((a) => a.type),
      });
    }
    return agents[0];
  }

  /**
   * Check if server is idle (no requests for IDLE_THRESHOLD_MS)
   */
  private isIdle(): boolean {
    return Date.now() - this.lastRequestTime > this.IDLE_THRESHOLD_MS;
  }

  /**
   * Mark that a request was received (resets idle timer)
   */
  public markActivity(): void {
    this.lastRequestTime = Date.now();
  }

  /** Timer handles for Node.js setInterval */
  private healthMonitorTimer?: ReturnType<typeof setInterval> | undefined;
  private heartbeatTimer?: ReturnType<typeof setInterval> | undefined;
  private performanceTimer?: ReturnType<typeof setInterval> | undefined;

  /**
   * Start health monitoring
   * Event-driven: uses setInterval for Node.js, disabled for Bun (no polling)
   */
  private startHealthMonitoring(): void {
    if (this.healthMonitorRunning) return;
    this.healthMonitorRunning = true;

    // For Bun: skip health monitoring loop to avoid CPU spinning
    if (isBunRuntime()) return;

    // For Node.js: use setInterval with dynamic interval based on idle state
    this.healthMonitorTimer = setInterval(() => {
      if (!this.stopped) {
        try {
          this.checkAgentHealth();
        } catch (error) {
          log.e("CONDUCTOR", "health_check_fail", { err: String(error) });
        }
      }
    }, this.HEALTH_CHECK_INTERVAL_MS);
  }

  private checkAgentHealth(): void {
    const isIdle = this.isIdle();

    for (const [agentId, agent] of this.agents) {
      if (agent.status === AgentStatus.ERROR) {
        log.w("CONDUCTOR", "agent_error_state", { agent: agentId, type: agent.type });
        this.emit("agent:unhealthy", agentId);
      }

      // Staleness detection based on metrics
      // Skip logging when idle - stale agents are expected
      if (!isIdle) {
        try {
          const metrics: { lastActivity?: number } | undefined =
            "getMetrics" in agent && typeof agent.getMetrics === "function" ? agent.getMetrics() : undefined;
          const last = metrics?.lastActivity ?? Date.now();
          this.agentLastSeen.set(agentId, last);
          if (Date.now() - last > this.AGENT_STALE_MS) {
            log.d("CONDUCTOR", "agent_stale", { agent: agentId, lastMs: Date.now() - last });
          }
        } catch {
          // ignore metric errors
        }
      }
    }
  }

  /**
   * Start heartbeat
   * Event-driven: uses setInterval for Node.js, disabled for Bun (no polling)
   */
  private startHeartbeat(): void {
    if (this.heartbeatRunning) return;
    this.heartbeatRunning = true;

    // For Bun: skip heartbeat loop to avoid CPU spinning
    if (isBunRuntime()) return;

    // For Node.js: use setInterval
    this.heartbeatTimer = setInterval(() => {
      if (!this.stopped && !this.isIdle()) {
        try {
          this.emit("heartbeat", {
            agentId: this.id,
            timestamp: Date.now(),
            agents: this.agents.size,
          });
        } catch (error) {
          log.e("CONDUCTOR", "heartbeat_fail", { err: String(error) });
        }
      }
    }, this.HEARTBEAT_INTERVAL_MS);
  }

  protected async handleMessage(message: AgentMessage): Promise<void> {
    switch (message.type) {
      case "register":
        log.d("CONDUCTOR", "msg_register", { from: message.from });
        break;
      case "health":
        log.t("CONDUCTOR", "msg_health", { from: message.from });
        break;
      default: {
        const targetAgent = this.agents.get(message.to);
        if (targetAgent) {
          await targetAgent.receive(message);
        }
      }
    }
  }

  private handleTaskCompleted(data: { task: AgentTask; agentId: string }): void {
    log.d("CONDUCTOR", "task_completed", { task: data.task.id, agent: data.agentId });
    this.emit("task:routed:completed", data);
  }

  private handleTaskFailed(data: { task: AgentTask; agentId: string; error: unknown }): void {
    log.e("CONDUCTOR", "task_failed", { task: data.task.id, agent: data.agentId, err: String(data.error) });
    this.emit("task:routed:failed", data);
  }

  private initializePerformanceOptimizations(): void {
    log.t("CONDUCTOR", "perf_init_start", {});

    // Start async performance loop (safe for Bun + OpenVINO)
    this.startPerformanceLoop();

    log.t("CONDUCTOR", "perf_init_done", {});
  }

  /**
   * Start performance metrics loop
   * Event-driven: uses setInterval for Node.js, disabled for Bun (no polling)
   */
  private startPerformanceLoop(): void {
    if (this.performanceLoopRunning) return;
    this.performanceLoopRunning = true;

    // For Bun: skip performance loop to avoid CPU spinning
    if (isBunRuntime()) return;

    // For Node.js: use setInterval
    this.performanceTimer = setInterval(() => {
      if (!this.stopped && !this.isIdle()) {
        try {
          this.updatePerformanceMetrics();
          this.cleanupCaches();
        } catch (error) {
          log.e("CONDUCTOR", "perf_loop_fail", { err: String(error) });
        }
      }
    }, this.PERFORMANCE_INTERVAL_MS);
  }

  private updatePerformanceMetrics(): void {
    const cacheHits = this.agentLoadCache.size;
    const totalRequests = this.performanceMetrics.totalTasks;

    if (totalRequests > 0) {
      this.performanceMetrics.cacheHitRate = cacheHits / totalRequests;
      this.performanceMetrics.overheadReduction = Math.min(40, (cacheHits / totalRequests) * 100);
    }

    // Log performance improvements every 100 tasks
    if (this.performanceMetrics.totalTasks > 0 && this.performanceMetrics.totalTasks % 100 === 0) {
      log.i("CONDUCTOR", "perf_stats", {
        overhead: this.performanceMetrics.overheadReduction,
        tasks: this.performanceMetrics.totalTasks,
      });
    }
  }

  private cleanupCaches(): void {
    const now = Date.now();

    // Clean up agent load cache
    for (const [agentId, data] of this.agentLoadCache) {
      if (now - data.timestamp > this.LOAD_CACHE_TTL) {
        this.agentLoadCache.delete(agentId);
      }
    }
  }

  /**
   * TASK-004B: Get performance metrics for monitoring
   */
  getPerformanceMetrics(): typeof this.performanceMetrics {
    return { ...this.performanceMetrics };
  }

  /**
   * Get pending tasks count
   * Public getter to avoid intersection type issues with private pendingTasks field
   */
  getPendingTasksCount(): number {
    return this.pendingTasks.size;
  }

  /**
   * Get metrics for all registered agents
   * Returns a map of agent type to agent metrics
   */
  getAllAgentMetrics(): Record<string, AgentMetrics> {
    const result: Record<string, AgentMetrics> = {};

    for (const [, agent] of this.agents) {
      const metrics = agent.getMetrics();
      result[agent.type] = metrics;
    }

    return result;
  }
}
