import type { ConductorOrchestrator } from "../agents/conductor-orchestrator.js";
import type { KnowledgeBus } from "../core/knowledge-bus.js";
import type { ResourceManager } from "../core/resource-manager.js";
import type { Agent, AgentMetrics, AgentStatus, AgentType, ResourceConstraints } from "../types/agent.js";

interface AgentExt extends Agent {
  currentTask?: { type: string; [k: string]: unknown };
}

interface PerfSnapshot {
  totalTasks?: number;
  avgProcessingTime?: number;
  overheadReduction?: number;
  cacheHitRate?: number;
}

interface ConductorInternal {
  agents: Map<string, Agent>;
  getPerformanceMetrics?(): PerfSnapshot;
  pendingTasks?: Map<string, unknown> | Set<unknown>;
  approvalRequired?: Map<string, unknown> | Set<unknown>;
  directImplementationAttempts?: number;
}

interface AgentSummary {
  id: string;
  type: AgentType;
  status: AgentStatus;
  queueLength: number;
  memoryUsageMB: number;
  cpuUsagePercent: number;
  capabilities: { maxConcurrency: number; memoryLimitMB: number; priority: number };
  metrics: AgentMetrics;
  currentTaskType?: string | undefined;
  lastActivity: number;
}

interface ResSummary {
  throttled: boolean;
  constraints: ResourceConstraints;
  currentUsage?: ReturnType<ResourceManager["getCurrentUsage"]>;
}

interface BusSummary {
  topicCount: number;
  entryCount: number;
  subscriptionCount: number;
  messageQueueSize: number;
}

export interface AgentMetricsSnapshot {
  timestamp: string;
  conductor: {
    registeredAgents: number;
    totalTasks: number;
    averageProcessingTime: number;
    overheadReduction: number;
    cacheHitRate: number;
    pendingTasks: number;
    approvalsPending: number;
    directImplementationAttempts: number;
  };
  agents: AgentSummary[];
  resources: ResSummary;
  knowledgeBus: BusSummary;
}

function summarize(a: Agent): AgentSummary {
  const m = a.getMetrics();
  return {
    id: a.id,
    type: a.type,
    status: a.status,
    queueLength: a.getTaskQueue().length,
    memoryUsageMB: a.getMemoryUsage(),
    cpuUsagePercent: a.getCpuUsage(),
    capabilities: {
      maxConcurrency: a.capabilities.maxConcurrency,
      memoryLimitMB: a.capabilities.memoryLimit,
      priority: a.capabilities.priority,
    },
    metrics: m,
    currentTaskType: (a as AgentExt).currentTask?.type,
    lastActivity: m.lastActivity,
  };
}

export async function collectAgentMetrics(opts: {
  conductor: ConductorOrchestrator;
  resourceManager: ResourceManager;
  knowledgeBus: KnowledgeBus;
}): Promise<AgentMetricsSnapshot> {
  const ci = opts.conductor as unknown as ConductorInternal;
  const agents: Agent[] = ci.agents instanceof Map ? Array.from(ci.agents.values()) : [];
  const perf: PerfSnapshot = typeof ci.getPerformanceMetrics === "function" ? ci.getPerformanceMetrics() : {};

  const res: ResSummary = {
    throttled: opts.resourceManager.isSystemThrottled(),
    constraints: opts.resourceManager.getConstraints(),
  };
  const usage = opts.resourceManager.getCurrentUsage();
  if (usage) res.currentUsage = usage;

  const bs = opts.knowledgeBus.getStats();
  return {
    timestamp: new Date().toISOString(),
    conductor: {
      registeredAgents: agents.length,
      totalTasks: perf.totalTasks ?? 0,
      averageProcessingTime: perf.avgProcessingTime ?? 0,
      overheadReduction: perf.overheadReduction ?? 0,
      cacheHitRate: perf.cacheHitRate ?? 0,
      pendingTasks: ci.pendingTasks?.size ?? 0,
      approvalsPending: ci.approvalRequired?.size ?? 0,
      directImplementationAttempts: ci.directImplementationAttempts ?? 0,
    },
    agents: agents.map(summarize),
    resources: res,
    knowledgeBus: {
      topicCount: bs.topicCount,
      entryCount: bs.entryCount,
      subscriptionCount: bs.subscriptionCount,
      messageQueueSize: bs.messageQueueSize,
    },
  };
}
