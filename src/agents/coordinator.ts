/**
 * Coordinator agent — manages multi-agent workflows.
 *
 * Responsibilities:
 *  - Agent registration/unregistration (AgentPool contract)
 *  - Task routing with configurable load-balancing (round-robin / least-loaded / priority)
 *  - Resource-aware gating before dispatching
 *  - Periodic health monitoring (Node.js only; skipped under Bun)
 *  - Automatic single-retry on task failure with a different agent
 */

import { getConfig } from "../config/yaml-config.js";
import { log } from "../logging/index.js";
import {
  type Agent,
  type AgentMessage,
  type AgentPool,
  AgentStatus,
  type AgentTask,
  AgentType,
  type ResourceConstraints,
} from "../types/agent.js";
import { BaseAgent } from "./base.js";

// ---------------------------------------------------------------------------
// Helper types
// ---------------------------------------------------------------------------

/** Payload emitted on `task:completed` / `task:routed:completed`. */
interface TaskCompletedData {
  task: AgentTask;
  agentId: string;
  result?: unknown;
  [key: string]: unknown;
}

/** Payload emitted on `task:failed` / `task:routed:failed`. */
interface TaskFailedData {
  task: AgentTask;
  agentId: string;
  error: string | Error;
  [key: string]: unknown;
}

type EventListener = (...args: unknown[]) => void;

/** Agent that exposes an EventEmitter-style `on` method. */
type EventfulAgent = Agent & {
  on: (event: string, listener: EventListener) => void;
};

// ---------------------------------------------------------------------------
// Public type guard  (re-exported by conductor-orchestrator)
// ---------------------------------------------------------------------------

/** Returns `true` if the agent supports `.on()` event subscriptions. */
export function isEventfulAgent(agent: Agent): agent is EventfulAgent {
  return typeof (agent as EventfulAgent).on === "function";
}

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

type LoadBalancingStrategy = "round-robin" | "least-loaded" | "priority";

interface CoordinatorConfig {
  resourceConstraints: ResourceConstraints;
  taskQueueLimit: number;
  loadBalancingStrategy: LoadBalancingStrategy;
  maxConcurrency: number;
  memoryLimit: number;
  priority: number;
}

type CoordinatorConfigOverrides = Partial<Omit<CoordinatorConfig, "resourceConstraints">> & {
  resourceConstraints?: Partial<ResourceConstraints>;
};

const DEFAULTS: CoordinatorConfig = {
  resourceConstraints: {
    maxMemoryMB: 1024,
    maxCpuPercent: 80,
    maxConcurrentAgents: 10,
    maxTaskQueueSize: 100,
  },
  taskQueueLimit: 100,
  loadBalancingStrategy: "least-loaded",
  maxConcurrency: 100,
  memoryLimit: 128,
  priority: 10,
};

/** Mapping from task type string to the AgentType that handles it. */
const TASK_TYPE_TO_AGENT: Record<string, AgentType> = {
  parse: AgentType.PARSER,
  index: AgentType.INDEXER,
  query: AgentType.QUERY,
  semantic: AgentType.SEMANTIC,
};

const HEALTH_CHECK_INTERVAL_MS = 10_000;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isBunRuntime(): boolean {
  return typeof globalThis.Bun !== "undefined";
}

/** Merge partial overrides on top of base ResourceConstraints. */
function mergeConstraints(base: ResourceConstraints, overrides?: Partial<ResourceConstraints>): ResourceConstraints {
  if (!overrides) return { ...base };
  return {
    maxMemoryMB: overrides.maxMemoryMB ?? base.maxMemoryMB,
    maxCpuPercent: overrides.maxCpuPercent ?? base.maxCpuPercent,
    maxConcurrentAgents: overrides.maxConcurrentAgents ?? base.maxConcurrentAgents,
    maxTaskQueueSize: overrides.maxTaskQueueSize ?? base.maxTaskQueueSize,
  };
}

/** Resolve the full CoordinatorConfig by layering: yaml config -> constructor overrides -> defaults. */
function resolveConfig(overrides: CoordinatorConfigOverrides): CoordinatorConfig {
  const appCfg = getConfig();
  const yaml = (appCfg.coordinator ?? {}) as CoordinatorConfigOverrides;

  // Resource constraints: constructor > yaml > defaults
  // Special case: maxConcurrentAgents also falls back to mcp.agents.maxConcurrent
  const fallbackAgents =
    yaml.resourceConstraints?.maxConcurrentAgents ??
    appCfg.mcp.agents?.maxConcurrent ??
    DEFAULTS.resourceConstraints.maxConcurrentAgents;

  const yamlConstraints = mergeConstraints(DEFAULTS.resourceConstraints, yaml.resourceConstraints);
  yamlConstraints.maxConcurrentAgents = yaml.resourceConstraints?.maxConcurrentAgents ?? fallbackAgents;

  const resourceConstraints = mergeConstraints(yamlConstraints, overrides.resourceConstraints);

  const pick = <K extends keyof Omit<CoordinatorConfig, "resourceConstraints">>(key: K): CoordinatorConfig[K] =>
    (overrides[key] ?? yaml[key] ?? DEFAULTS[key]) as CoordinatorConfig[K];

  return {
    resourceConstraints,
    taskQueueLimit: pick("taskQueueLimit"),
    loadBalancingStrategy: pick("loadBalancingStrategy"),
    maxConcurrency: pick("maxConcurrency"),
    memoryLimit: pick("memoryLimit"),
    priority: pick("priority"),
  };
}

// ---------------------------------------------------------------------------
// CoordinatorAgent
// ---------------------------------------------------------------------------

export class CoordinatorAgent extends BaseAgent implements AgentPool {
  public agents: Map<string, Agent> = new Map();

  private readonly cfg: CoordinatorConfig;
  private readonly rrIndex = new Map<AgentType, number>();
  private readonly pending = new Map<string, AgentTask>();
  private healthTimer?: ReturnType<typeof setInterval> | undefined;
  private stopped = false;

  constructor(overrides: CoordinatorConfigOverrides = {}) {
    const cfg = resolveConfig(overrides);
    super(AgentType.COORDINATOR, {
      maxConcurrency: cfg.maxConcurrency,
      memoryLimit: cfg.memoryLimit,
      priority: cfg.priority,
    });
    this.cfg = cfg;
  }

  // ------------------------------------------------------------------
  // Lifecycle (BaseAgent hooks)
  // ------------------------------------------------------------------

  protected async onInitialize(): Promise<void> {
    log.i("COORDINATOR", "init", { ...this.cfg.resourceConstraints });
    this.startHealthMonitor();
  }

  protected async onShutdown(): Promise<void> {
    log.i("COORDINATOR", "shutdown_start");
    this.stopped = true;
    this.stopHealthMonitor();

    await Promise.all(
      [...this.agents.values()].map((a) =>
        a.shutdown().catch((err) => log.e("COORDINATOR", "shutdown_fail", { agent: a.id, err: String(err) })),
      ),
    );

    this.agents.clear();
    this.pending.clear();
  }

  // ------------------------------------------------------------------
  // Task processing (BaseAgent hooks)
  // ------------------------------------------------------------------

  protected canProcessTask(_task: AgentTask): boolean {
    return this.pending.size < this.cfg.taskQueueLimit;
  }

  protected async processTask(task: AgentTask): Promise<unknown> {
    const primary = await this.route(task);
    if (!primary) {
      throw new Error(`No available agent for task ${task.id} of type ${task.type}`);
    }

    this.pending.set(task.id, task);
    try {
      return await primary.process(task);
    } catch (error) {
      // Single retry with a different agent
      const fallback = await this.route(task);
      if (fallback && fallback.id !== primary.id) {
        log.d("COORDINATOR", "retry_task", { task: task.id, agent: fallback.id });
        return fallback.process(task);
      }
      throw error;
    } finally {
      this.pending.delete(task.id);
    }
  }

  // ------------------------------------------------------------------
  // Message handling (BaseAgent hook)
  // ------------------------------------------------------------------

  protected async handleMessage(message: AgentMessage): Promise<void> {
    switch (message.type) {
      case "register":
        log.d("COORDINATOR", "reg_request", { from: message.from });
        break;
      case "health":
        log.d("COORDINATOR", "health_update", { from: message.from });
        break;
      case "broadcast":
        await this.broadcast(message);
        break;
      default: {
        const target = this.agents.get(message.to);
        if (target) await target.receive(message);
      }
    }
  }

  // ------------------------------------------------------------------
  // AgentPool implementation
  // ------------------------------------------------------------------

  register(agent: Agent): void {
    const max = this.cfg.resourceConstraints.maxConcurrentAgents;
    if (this.agents.size >= max) {
      throw new Error(`Maximum number of agents (${max}) reached`);
    }

    this.agents.set(agent.id, agent);
    log.i("COORDINATOR", "agent_registered", { id: agent.id, type: agent.type });

    if (isEventfulAgent(agent)) {
      agent.on("task:completed", (data: unknown) => this.onTaskCompleted(data as TaskCompletedData));
      agent.on("task:failed", (data: unknown) => this.onTaskFailed(data as TaskFailedData));
    }

    this.emit("agent:registered", agent.id);
  }

  unregister(agentId: string): void {
    if (this.agents.delete(agentId)) {
      log.i("COORDINATOR", "agent_unregistered", { id: agentId });
      this.emit("agent:unregistered", agentId);
    }
  }

  getAgent(id: string): Agent | undefined {
    return this.agents.get(id);
  }

  getAgentsByType(type: AgentType): Agent[] {
    return [...this.agents.values()].filter((a) => a.type === type);
  }

  getAvailableAgent(type: AgentType): Agent | undefined {
    const idle = this.getAgentsByType(type).filter((a) => a.status === AgentStatus.IDLE);
    if (idle.length === 0) return undefined;

    switch (this.cfg.loadBalancingStrategy) {
      case "round-robin":
        return this.pickRoundRobin(type, idle);
      case "least-loaded":
        return this.pickLeastLoaded(idle);
      case "priority":
        return this.pickHighestPriority(idle);
      default:
        return idle[0];
    }
  }

  async broadcast(message: AgentMessage): Promise<void> {
    await Promise.all(
      [...this.agents.values()].map((a) =>
        a.receive(message).catch((err) => log.e("COORDINATOR", "msg_fail", { agent: a.id, err: String(err) })),
      ),
    );
  }

  async route(task: AgentTask): Promise<Agent | undefined> {
    const agentType = TASK_TYPE_TO_AGENT[task.type];
    if (!agentType) return undefined;

    if (!this.hasResources()) {
      log.w("COORDINATOR", "res_exceeded", { task: task.id });
      return undefined;
    }

    return this.getAvailableAgent(agentType);
  }

  // ------------------------------------------------------------------
  // Load-balancing strategies
  // ------------------------------------------------------------------

  private pickRoundRobin(type: AgentType, agents: Agent[]): Agent {
    const idx = this.rrIndex.get(type) ?? 0;
    const agent = agents[idx % agents.length]!;
    this.rrIndex.set(type, idx + 1);
    return agent;
  }

  private pickLeastLoaded(agents: Agent[]): Agent {
    let best = agents[0]!;
    let bestLoad = this.loadScore(best);
    for (let i = 1; i < agents.length; i++) {
      const score = this.loadScore(agents[i]!);
      if (score < bestLoad) {
        best = agents[i]!;
        bestLoad = score;
      }
    }
    return best;
  }

  private pickHighestPriority(agents: Agent[]): Agent {
    let best = agents[0]!;
    for (let i = 1; i < agents.length; i++) {
      if (agents[i]!.capabilities.priority > best.capabilities.priority) {
        best = agents[i]!;
      }
    }
    return best;
  }

  /** Composite load score: queue depth + normalised memory. */
  private loadScore(agent: Agent): number {
    return agent.getTaskQueue().length + agent.getMemoryUsage() / 100;
  }

  // ------------------------------------------------------------------
  // Resource check
  // ------------------------------------------------------------------

  private hasResources(): boolean {
    let mem = 0;
    let cpu = 0;
    for (const a of this.agents.values()) {
      mem += a.getMemoryUsage();
      cpu += a.getCpuUsage();
    }
    return mem < this.cfg.resourceConstraints.maxMemoryMB && cpu < this.cfg.resourceConstraints.maxCpuPercent;
  }

  // ------------------------------------------------------------------
  // Health monitoring
  // ------------------------------------------------------------------

  private startHealthMonitor(): void {
    if (this.healthTimer || isBunRuntime()) return;

    this.healthTimer = setInterval(() => {
      if (this.stopped) return;
      try {
        for (const [id, agent] of this.agents) {
          if (agent.status === AgentStatus.ERROR) {
            log.w("COORDINATOR", "agent_err_state", { agent: id });
            this.emit("agent:unhealthy", id);
          }
        }
      } catch (err) {
        log.e("COORDINATOR", "health_err", { err: String(err) });
      }
    }, HEALTH_CHECK_INTERVAL_MS);
  }

  private stopHealthMonitor(): void {
    if (this.healthTimer) {
      clearInterval(this.healthTimer);
      this.healthTimer = undefined;
    }
  }

  // ------------------------------------------------------------------
  // Event forwarding from registered agents
  // ------------------------------------------------------------------

  private onTaskCompleted(data: TaskCompletedData): void {
    log.d("COORDINATOR", "task_done", { task: data.task.id, agent: data.agentId });
    this.emit("task:routed:completed", data);
  }

  private onTaskFailed(data: TaskFailedData): void {
    const msg = data.error instanceof Error ? data.error.message : String(data.error);
    log.e("COORDINATOR", "task_fail", { task: data.task.id, agent: data.agentId, err: msg });
    this.emit("task:routed:failed", data);
  }
}
