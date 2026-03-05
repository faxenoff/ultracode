/**
 * Metrics Tool Handlers
 *
 * Handlers for monitoring and metrics operations:
 * - get_metrics
 * - get_version
 * - get_agent_metrics
 * - get_bus_stats
 * - clear_bus_topic
 */

import { z } from "zod";
import { log } from "../../logging/index.js";
import type { AgentMetrics } from "../../types/agent.js";
import { toError } from "../../utils/error-handling.js";
import { BaseToolHandler, type ToolResult } from "../base-tool-handler.js";

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

/**
 * System metrics
 */
interface SystemMetrics {
  memory: {
    heapUsed: number;
    heapTotal: number;
    external: number;
    rss: number;
    unit: string;
  };
  uptime: number;
  nodeVersion: string;
}

/**
 * Overall metrics result
 */
interface MetricsResult {
  timestamp: string;
  system?: SystemMetrics;
  graph?: unknown;
  agents?: Record<string, AgentMetrics>;
}

/**
 * Version information
 */
interface VersionResult {
  name: string;
  version: string;
  details?: {
    nodeVersion: string;
    platform: string;
    arch: string;
    pid: number;
    cwd: string;
  };
  features?: {
    semanticSearch: boolean;
    multiLanguage: boolean;
    branchManagement: boolean;
    snapshots: boolean;
  };
}

/**
 * Bus statistics result
 */
interface BusStatsResult {
  totalTopics: number;
  totalMessages: number;
  topics: Record<string, unknown>;
  recentMessages?: unknown[];
}

/**
 * Watcher status for FileWatcher/GitWatcher
 */
interface WatcherStatusResult {
  timestamp: string;
  indexerAgentExists: boolean;
  fileWatcher: { exists: boolean; reason?: string } | null;
  gitWatcher: { exists: boolean; isWatching?: boolean; currentBranch?: string } | null;
  repositoryPath: string | null;
  branchManager?: { exists: boolean };
  indexingStats?: Record<string, unknown>;
}

/**
 * IndexerAgent interface for type safety
 */
interface IndexerAgent {
  getFileWatcherStatus?: () => { exists: boolean; reason?: string };
  getGitWatcher?: (projectPath?: string) => {
    isWatching?: () => boolean;
    getBranch?: () => string | null;
  } | null;
  getBranchManager?: () => unknown | null;
  currentRepositoryPath?: string;
  getIndexingStats?: () => Record<string, unknown>;
}

// =============================================================================
// GET METRICS
// =============================================================================

const GetMetricsSchema = z.object({
  includeSystem: z.boolean().optional().default(true),
  includeGraph: z.boolean().optional().default(true),
  includeAgents: z.boolean().optional().default(false),
});

export class GetMetricsToolHandler extends BaseToolHandler<z.infer<typeof GetMetricsSchema>> {
  protected parseArgs(args: unknown) {
    return GetMetricsSchema.parse(args);
  }

  protected async execute(args: z.infer<typeof GetMetricsSchema>): Promise<ToolResult> {
    const metrics: MetricsResult = {
      timestamp: new Date().toISOString(),
    };

    if (args.includeSystem) {
      const { memoryUsage } = await import("node:process");
      const mem = memoryUsage();

      metrics.system = {
        memory: {
          heapUsed: Math.round(mem.heapUsed / 1024 / 1024),
          heapTotal: Math.round(mem.heapTotal / 1024 / 1024),
          external: Math.round(mem.external / 1024 / 1024),
          rss: Math.round(mem.rss / 1024 / 1024),
          unit: "MB",
        },
        uptime: Math.round(process.uptime()),
        nodeVersion: process.version,
      };
    }

    if (args.includeGraph) {
      try {
        const storage = await this.context.getGraphStorage();
        const stats = await storage.getStatistics();
        metrics.graph = stats;
      } catch {
        metrics.graph = { error: "Graph storage not available" };
      }
    }

    if (args.includeAgents) {
      const conductor = this.context.getConductor();
      metrics.agents = conductor.getAllAgentMetrics();
    }

    return {
      content: [{ type: "text", text: JSON.stringify(metrics, null, 2) }],
    };
  }
}

// =============================================================================
// GET VERSION
// =============================================================================

const GetVersionSchema = z.object({
  detailed: z.boolean().optional().default(false),
});

export class GetVersionToolHandler extends BaseToolHandler<z.infer<typeof GetVersionSchema>> {
  protected parseArgs(args: unknown) {
    return GetVersionSchema.parse(args);
  }

  protected async execute(args: z.infer<typeof GetVersionSchema>): Promise<ToolResult> {
    const { readJSON } = await import("../../utils/file-ops.js");
    const { join } = await import("node:path");

    try {
      // Read package.json for version - use resolveProjectPath for directory
      const projectPath = this.resolveProjectPath({});
      const packagePath = join(projectPath, "package.json");
      let version = "unknown";
      let name = "ultracode";

      try {
        const pkg = (await readJSON(packagePath)) as { name?: string | undefined; version?: string };
        version = pkg.version || version;
        name = pkg.name || name;
      } catch {
        // Use defaults
      }

      const result: VersionResult = {
        name,
        version,
      };

      if (args.detailed) {
        result.details = {
          nodeVersion: process.version,
          platform: process.platform,
          arch: process.arch,
          pid: process.pid,
          cwd: process.cwd(),
        };

        // Check available features
        result.features = {
          semanticSearch: true,
          multiLanguage: true,
          branchManagement: !!(await this.context.getBranchManager()),
          snapshots: !!this.context.getSnapshotManager(),
        };
      }

      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    } catch (error: unknown) {
      const err = toError(error);
      return {
        content: [{ type: "text", text: JSON.stringify({ error: err.message }) }],
      };
    }
  }
}

// =============================================================================
// GET AGENT METRICS
// =============================================================================

const GetAgentMetricsSchema = z.object({
  agentType: z.string().optional(),
  includeHistory: z.boolean().optional().default(false),
});

export class GetAgentMetricsToolHandler extends BaseToolHandler<z.infer<typeof GetAgentMetricsSchema>> {
  protected parseArgs(args: unknown) {
    return GetAgentMetricsSchema.parse(args);
  }

  protected async execute(args: z.infer<typeof GetAgentMetricsSchema>): Promise<ToolResult> {
    const conductor = this.context.getConductor();

    const allMetrics = conductor.getAllAgentMetrics();

    let metrics: Record<string, AgentMetrics> | AgentMetrics | { error: string };
    if (args.agentType) {
      const agentMetrics = allMetrics[args.agentType];
      metrics = agentMetrics ?? { error: `Agent '${args.agentType}' not found` };
    } else {
      metrics = allMetrics;
    }

    // Add summary - consider agent active if it had activity in last 5 minutes
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    const metricsArray = Object.values(allMetrics);
    const summary = {
      totalAgents: Object.keys(allMetrics).length,
      activeAgents: metricsArray.filter((m) => m.lastActivity > fiveMinutesAgo).length,
      totalTasksProcessed: metricsArray.reduce((sum, m) => sum + m.tasksProcessed, 0),
    };

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              summary,
              agents: metrics,
            },
            null,
            2,
          ),
        },
      ],
    };
  }
}

// =============================================================================
// GET BUS STATS
// =============================================================================

const GetBusStatsSchema = z.object({
  topic: z.string().optional(),
  includeMessages: z.boolean().optional().default(false),
  messageLimit: z.number().optional().default(10),
});

export class GetBusStatsToolHandler extends BaseToolHandler<z.infer<typeof GetBusStatsSchema>> {
  protected parseArgs(args: unknown) {
    return GetBusStatsSchema.parse(args);
  }

  protected async execute(args: z.infer<typeof GetBusStatsSchema>): Promise<ToolResult> {
    const bus = this.context.getKnowledgeBus();

    if (!bus) {
      return {
        content: [{ type: "text", text: JSON.stringify({ error: "Knowledge bus not available" }) }],
      };
    }

    const stats = bus.getStats?.() || { topicCount: 0, entryCount: 0, subscriptionCount: 0, messageQueueSize: 0 };

    const result: BusStatsResult = {
      totalTopics: stats.topicCount,
      totalMessages: stats.entryCount,
      topics: {
        summary: {
          topicCount: stats.topicCount,
          entryCount: stats.entryCount,
          subscriptionCount: stats.subscriptionCount,
          messageQueueSize: stats.messageQueueSize,
        },
      },
    };

    if (args.topic) {
      // Individual topic stats would require additional API
      result.topics[args.topic] = { info: "Topic-specific stats not available in current API" };
    }

    // Add recent messages if requested
    if (args.includeMessages && bus.getRecentMessages) {
      const messages = await bus.getRecentMessages();
      result.recentMessages = messages;
    }

    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  }
}

// =============================================================================
// CLEAR BUS TOPIC
// =============================================================================

const ClearBusTopicSchema = z.object({
  topic: z.string(),
  confirm: z.boolean().optional().default(false),
});

export class ClearBusTopicToolHandler extends BaseToolHandler<z.infer<typeof ClearBusTopicSchema>> {
  protected parseArgs(args: unknown) {
    return ClearBusTopicSchema.parse(args);
  }

  protected async execute(args: z.infer<typeof ClearBusTopicSchema>): Promise<ToolResult> {
    if (!args.confirm) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              warning: "This will clear all messages in the topic",
              topic: args.topic,
              hint: "Set confirm: true to proceed",
            }),
          },
        ],
      };
    }

    const bus = this.context.getKnowledgeBus();

    if (!bus) {
      return {
        content: [{ type: "text", text: JSON.stringify({ error: "Knowledge bus not available" }) }],
      };
    }

    try {
      await bus.clearTopic?.(args.topic);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              success: true,
              topic: args.topic,
              message: "Topic cleared successfully",
            }),
          },
        ],
      };
    } catch (error: unknown) {
      const err = toError(error);
      return {
        content: [{ type: "text", text: JSON.stringify({ error: err.message }) }],
      };
    }
  }
}

// =============================================================================
// GET WATCHER STATUS - Diagnostic tool to check FileWatcher/GitWatcher status
// =============================================================================

const GetWatcherStatusSchema = z.object({});

export class GetWatcherStatusToolHandler extends BaseToolHandler<z.infer<typeof GetWatcherStatusSchema>> {
  protected parseArgs(args: unknown) {
    return GetWatcherStatusSchema.parse(args);
  }

  protected async execute(_args: z.infer<typeof GetWatcherStatusSchema>): Promise<ToolResult> {
    try {
      const { AgentType } = await import("../../types/agent.js");
      const conductor = this.context.getConductor();

      // Get IndexerAgent through DevAgent (IndexerAgent is a private member of DevAgent)
      const devAgent = conductor.getAgentByType?.(AgentType.DEV) as
        | { getIndexerAgent?: () => IndexerAgent | null }
        | undefined;
      log.d("METRICS", "watcher_status_diag", {
        hasDevAgent: !!devAgent,
        hasGetIndexerAgent: !!devAgent?.getIndexerAgent,
      });
      const indexerAgent = devAgent?.getIndexerAgent?.() ?? undefined;
      log.d("METRICS", "watcher_status_diag2", {
        hasIndexerAgent: !!indexerAgent,
        indexerAgentType: indexerAgent ? typeof indexerAgent : "undefined",
      });

      const result: WatcherStatusResult = {
        timestamp: new Date().toISOString(),
        indexerAgentExists: !!indexerAgent,
        fileWatcher: null,
        gitWatcher: null,
        repositoryPath: null,
      };

      if (indexerAgent) {
        // Check FileWatcher using public method
        result.fileWatcher = indexerAgent.getFileWatcherStatus?.() ?? { exists: false, reason: "Method not available" };

        // Check GitWatcher
        const gitWatcher = indexerAgent.getGitWatcher?.();
        if (gitWatcher) {
          result.gitWatcher = {
            exists: true,
            isWatching: gitWatcher.isWatching?.() ?? false,
            currentBranch: gitWatcher.getBranch?.() ?? "unknown",
          };
        } else {
          result.gitWatcher = { exists: false };
        }

        // Check BranchManager
        const branchManager = indexerAgent.getBranchManager?.();
        result.branchManager = { exists: !!branchManager };

        // Check repository path
        result.repositoryPath = indexerAgent.currentRepositoryPath ?? null;

        // Check indexing stats
        result.indexingStats = indexerAgent.getIndexingStats?.() ?? {};
      }

      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    } catch (error: unknown) {
      const err = toError(error);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              error: err.message,
              stack: err.stack?.split("\n").slice(0, 5),
            }),
          },
        ],
      };
    }
  }
}
