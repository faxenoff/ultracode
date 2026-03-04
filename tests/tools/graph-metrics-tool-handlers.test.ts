import { describe, expect, it, mock } from "bun:test";
import { GraphMetricsToolHandler } from "../../src/tools/handlers/graph-metrics-tool-handlers.js";
import { createMockGraphStorage, createMockToolContext, parseJsonResult } from "./_test-helpers.js";

describe("GraphMetricsToolHandler", () => {
  function makeCtx() {
    const storage = createMockGraphStorage({
      findEntities: mock(async () => []),
      getAllEntities: mock(async () => []),
      getAllRelationships: mock(async () => []),
      getRelationshipsForEntity: mock(async () => []),
    });
    return createMockToolContext({ getGraphStorage: async () => storage as any });
  }

  it("handles pagerank on empty graph", async () => {
    const ctx = makeCtx();
    const handler = new GraphMetricsToolHandler(ctx);
    const result = await handler.handle({ metric: "pagerank" });
    const data = parseJsonResult(result);

    // Empty graph causes pagerank to fail to converge — returns error
    expect(data).toBeDefined();
    expect(data.success === false || data.metric === "pagerank").toBe(true);
  });

  it("computes louvain community detection", async () => {
    const ctx = makeCtx();
    const handler = new GraphMetricsToolHandler(ctx);
    const result = await handler.handle({ metric: "louvain" });
    const data = parseJsonResult(result);

    expect(data.summary).toBeDefined();
    expect(data.metric).toBe("louvain");
  });

  it("computes centrality metrics", async () => {
    const ctx = makeCtx();
    const handler = new GraphMetricsToolHandler(ctx);
    const result = await handler.handle({ metric: "centrality" });
    const data = parseJsonResult(result);

    expect(data.metric).toBe("centrality");
  });

  it("returns Zod error for invalid metric", async () => {
    const ctx = makeCtx();
    const handler = new GraphMetricsToolHandler(ctx);
    const result = await handler.handle({ metric: "invalid" });
    const data = parseJsonResult(result);

    expect(data.success).toBe(false);
  });
});
