import { describe, expect, it, mock } from "bun:test";
import {
  ClearBusTopicToolHandler,
  GetAgentMetricsToolHandler,
  GetBusStatsToolHandler,
  GetMetricsToolHandler,
  GetVersionToolHandler,
  GetWatcherStatusToolHandler,
} from "../../src/tools/handlers/metrics-tool-handlers.js";
import {
  createMockConductor,
  createMockKnowledgeBus,
  createMockToolContext,
  expectError,
  parseJsonResult,
} from "./_test-helpers.js";

// ─── GetMetrics ───────────────────────────────────────────────────

describe("GetMetricsToolHandler", () => {
  it("includes system metrics when includeSystem=true", async () => {
    const ctx = createMockToolContext();
    const handler = new GetMetricsToolHandler(ctx);
    const result = await handler.handle({ includeSystem: true, includeGraph: false, includeAgents: false });
    const data = parseJsonResult(result);

    expect(data.timestamp).toBeDefined();
    expect(data.system).toBeDefined();
    expect(data.system.memory).toBeDefined();
    expect(data.system.nodeVersion).toBeDefined();
  });

  it("includes graph stats when includeGraph=true", async () => {
    const storage = {
      getStatistics: mock(async () => ({ totalEntities: 42, totalRelationships: 10, totalFiles: 5 })),
      setProject: mock(() => {}),
    };
    const ctx = createMockToolContext({ getGraphStorage: async () => storage as any });
    const handler = new GetMetricsToolHandler(ctx);
    const result = await handler.handle({ includeSystem: false, includeGraph: true, includeAgents: false });
    const data = parseJsonResult(result);

    expect(data.graph).toBeDefined();
    expect(data.graph.totalEntities).toBe(42);
  });

  it("returns graph error when storage unavailable", async () => {
    const ctx = createMockToolContext({
      getGraphStorage: async () => {
        throw new Error("storage down");
      },
    });
    const handler = new GetMetricsToolHandler(ctx);
    const result = await handler.handle({ includeSystem: false, includeGraph: true, includeAgents: false });
    const data = parseJsonResult(result);

    expect(data.graph.error).toBeDefined();
  });

  it("includes agent metrics when includeAgents=true", async () => {
    const conductor = createMockConductor({
      getAllAgentMetrics: mock(() => ({
        dev: { tasksProcessed: 5, lastActivity: Date.now() },
      })),
    });
    const ctx = createMockToolContext({ getConductor: () => conductor as any });
    const handler = new GetMetricsToolHandler(ctx);
    const result = await handler.handle({ includeSystem: false, includeGraph: false, includeAgents: true });
    const data = parseJsonResult(result);

    expect(data.agents).toBeDefined();
    expect(data.agents.dev).toBeDefined();
  });
});

// ─── GetVersion ───────────────────────────────────────────────────

describe("GetVersionToolHandler", () => {
  it("returns name and version with detailed=false", async () => {
    const ctx = createMockToolContext();
    const handler = new GetVersionToolHandler(ctx);
    const result = await handler.handle({ detailed: false });
    const data = parseJsonResult(result);

    expect(data.name).toBeDefined();
    expect(data.version).toBeDefined();
    expect(data.details).toBeUndefined();
  });

  it("returns details and features with detailed=true", async () => {
    const ctx = createMockToolContext();
    const handler = new GetVersionToolHandler(ctx);
    const result = await handler.handle({ detailed: true });
    const data = parseJsonResult(result);

    expect(data.details).toBeDefined();
    expect(data.details.nodeVersion).toBeDefined();
    expect(data.features).toBeDefined();
  });
});

// ─── GetAgentMetrics ──────────────────────────────────────────────

describe("GetAgentMetricsToolHandler", () => {
  it("returns all metrics without agentType filter", async () => {
    const conductor = createMockConductor({
      getAllAgentMetrics: mock(() => ({
        dev: { tasksProcessed: 10, lastActivity: Date.now() },
        indexer: { tasksProcessed: 3, lastActivity: Date.now() },
      })),
    });
    const ctx = createMockToolContext({ getConductor: () => conductor as any });
    const handler = new GetAgentMetricsToolHandler(ctx);
    const result = await handler.handle({});
    const data = parseJsonResult(result);

    expect(data.summary).toBeDefined();
    expect(data.summary.totalAgents).toBe(2);
    expect(data.agents.dev).toBeDefined();
    expect(data.agents.indexer).toBeDefined();
  });

  it("filters by agentType", async () => {
    const conductor = createMockConductor({
      getAllAgentMetrics: mock(() => ({
        dev: { tasksProcessed: 10, lastActivity: Date.now() },
      })),
    });
    const ctx = createMockToolContext({ getConductor: () => conductor as any });
    const handler = new GetAgentMetricsToolHandler(ctx);
    const result = await handler.handle({ agentType: "dev" });
    const data = parseJsonResult(result);

    expect(data.agents.tasksProcessed).toBe(10);
  });

  it("returns error for nonexistent agentType", async () => {
    const conductor = createMockConductor({
      getAllAgentMetrics: mock(() => ({})),
    });
    const ctx = createMockToolContext({ getConductor: () => conductor as any });
    const handler = new GetAgentMetricsToolHandler(ctx);
    const result = await handler.handle({ agentType: "nonexistent" });
    const data = parseJsonResult(result);

    expect(data.agents.error).toContain("not found");
  });
});

// ─── GetBusStats ──────────────────────────────────────────────────

describe("GetBusStatsToolHandler", () => {
  it("returns stats when bus is available", async () => {
    const bus = createMockKnowledgeBus({
      getStats: mock(() => ({ topicCount: 3, entryCount: 15, subscriptionCount: 2, messageQueueSize: 0 })),
    });
    const ctx = createMockToolContext({ getKnowledgeBus: () => bus as any });
    const handler = new GetBusStatsToolHandler(ctx);
    const result = await handler.handle({});
    const data = parseJsonResult(result);

    expect(data.totalTopics).toBe(3);
    expect(data.totalMessages).toBe(15);
  });

  it("returns error when bus is null", async () => {
    const ctx = createMockToolContext({ getKnowledgeBus: () => null as any });
    const handler = new GetBusStatsToolHandler(ctx);
    const result = await handler.handle({});
    const data = parseJsonResult(result);

    expect(data.error).toContain("not available");
  });

  it("includes recent messages when includeMessages=true", async () => {
    const bus = createMockKnowledgeBus({
      getRecentMessages: mock(async () => [{ topic: "test", data: "msg" }]),
    });
    const ctx = createMockToolContext({ getKnowledgeBus: () => bus as any });
    const handler = new GetBusStatsToolHandler(ctx);
    const result = await handler.handle({ includeMessages: true });
    const data = parseJsonResult(result);

    expect(data.recentMessages).toBeDefined();
    expect(data.recentMessages.length).toBe(1);
  });
});

// ─── ClearBusTopic ────────────────────────────────────────────────

describe("ClearBusTopicToolHandler", () => {
  it("returns warning when confirm=false", async () => {
    const ctx = createMockToolContext();
    const handler = new ClearBusTopicToolHandler(ctx);
    const result = await handler.handle({ topic: "test-topic", confirm: false });
    const data = parseJsonResult(result);

    expect(data.warning).toBeDefined();
    expect(data.hint).toContain("confirm: true");
  });

  it("clears topic when confirm=true", async () => {
    const bus = createMockKnowledgeBus();
    const ctx = createMockToolContext({ getKnowledgeBus: () => bus as any });
    const handler = new ClearBusTopicToolHandler(ctx);
    const result = await handler.handle({ topic: "test-topic", confirm: true });
    const data = parseJsonResult(result);

    expect(data.success).toBe(true);
    expect(bus.clearTopic).toHaveBeenCalled();
  });

  it("returns error when bus unavailable", async () => {
    const ctx = createMockToolContext({ getKnowledgeBus: () => null as any });
    const handler = new ClearBusTopicToolHandler(ctx);
    const result = await handler.handle({ topic: "test", confirm: true });
    const data = parseJsonResult(result);

    expect(data.error).toContain("not available");
  });
});

// ─── GetWatcherStatus ─────────────────────────────────────────────

describe("GetWatcherStatusToolHandler", () => {
  it("returns status with indexerAgentExists=false when no dev agent", async () => {
    const conductor = createMockConductor({ getAgentByType: mock(() => null) });
    const ctx = createMockToolContext({ getConductor: () => conductor as any });
    const handler = new GetWatcherStatusToolHandler(ctx);
    const result = await handler.handle({});
    const data = parseJsonResult(result);

    expect(data.indexerAgentExists).toBe(false);
    expect(data.timestamp).toBeDefined();
  });

  it("returns full status when indexer agent is available", async () => {
    const indexerAgent = {
      getFileWatcherStatus: () => ({ exists: true }),
      getGitWatcher: () => ({
        isWatching: () => true,
        getCurrentBranch: () => "dev",
      }),
      getBranchManager: () => ({}),
      currentRepositoryPath: "/test/repo",
      getIndexingStats: () => ({ filesProcessed: 100 }),
    };
    const devAgent = { getIndexerAgent: () => indexerAgent };
    const conductor = createMockConductor({
      getAgentByType: mock(() => devAgent),
    });
    const ctx = createMockToolContext({ getConductor: () => conductor as any });
    const handler = new GetWatcherStatusToolHandler(ctx);
    const result = await handler.handle({});
    const data = parseJsonResult(result);

    expect(data.indexerAgentExists).toBe(true);
    expect(data.fileWatcher.exists).toBe(true);
    expect(data.gitWatcher.exists).toBe(true);
    expect(data.gitWatcher.currentBranch).toBe("dev");
    expect(data.repositoryPath).toBe("/test/repo");
  });
});
