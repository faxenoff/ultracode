import { describe, expect, it, mock } from "bun:test";
import { TaintAnalysisToolHandler } from "../../src/tools/handlers/taint-tool-handlers.js";
import { createMockGraphStorage, createMockToolContext, parseJsonResult } from "./_test-helpers.js";

describe("TaintAnalysisToolHandler", () => {
  function makeCtx() {
    const storage = createMockGraphStorage({
      findEntities: mock(async () => []),
      getAllEntities: mock(async () => []),
      getRelationshipsForEntity: mock(async () => []),
    });
    return createMockToolContext({ getGraphStorage: async () => storage as any });
  }

  it("runs taint analysis and returns results", async () => {
    const ctx = makeCtx();
    const handler = new TaintAnalysisToolHandler(ctx);
    const result = await handler.handle({});
    const data = parseJsonResult(result);

    expect(data.summary).toBeDefined();
    expect(data.stats).toBeDefined();
    expect(data.stats.sources).toBeDefined();
    expect(data.stats.sinks).toBeDefined();
    expect(data.stats.vulnerabilities).toBeDefined();
  });

  it("accepts category filter", async () => {
    const ctx = makeCtx();
    const handler = new TaintAnalysisToolHandler(ctx);
    const result = await handler.handle({ category: "sql_injection" });
    const data = parseJsonResult(result);

    expect(data.summary).toBeDefined();
  });

  it("applies pagination", async () => {
    const ctx = makeCtx();
    const handler = new TaintAnalysisToolHandler(ctx);
    const result = await handler.handle({ offset: 0, limit: 5 });
    const data = parseJsonResult(result);

    expect(data.pagination).toBeDefined();
  });
});
