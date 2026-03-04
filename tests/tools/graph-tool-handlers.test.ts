import { describe, expect, it, mock } from "bun:test";
import {
  CleanIndexToolHandler,
  GetGraphHealthToolHandler,
  GetGraphStatsToolHandler,
  GetGraphToolHandler,
  ResetGraphToolHandler,
} from "../../src/tools/handlers/graph-tool-handlers.js";
import {
  createMockConductor,
  createMockGraphStorage,
  createMockToolContext,
  expectError,
  parseJsonResult,
} from "./_test-helpers.js";

// ─── ResetGraph ───────────────────────────────────────────────────

describe("ResetGraphToolHandler", () => {
  it("calls storage.clear() and returns success", async () => {
    const storage = createMockGraphStorage();
    const ctx = createMockToolContext({ getGraphStorage: async () => storage as any });
    const handler = new ResetGraphToolHandler(ctx);
    const result = await handler.handle({});
    const data = parseJsonResult(result);

    expect(data.success).toBe(true);
    expect(storage.clear).toHaveBeenCalled();
  });
});

// ─── CleanIndex ───────────────────────────────────────────────────

describe("CleanIndexToolHandler", () => {
  it("throws error when DevAgent is unavailable", async () => {
    const storage = createMockGraphStorage();
    const conductor = createMockConductor({ getAgentByType: mock(() => null) });
    const ctx = createMockToolContext({
      getGraphStorage: async () => storage as any,
      getConductor: () => conductor as any,
    });
    const handler = new CleanIndexToolHandler(ctx);
    const result = await handler.handle({});
    expectError(result, "DevAgent not available");
  });

  it("clears storage and processes index task when DevAgent is available", async () => {
    const storage = createMockGraphStorage();
    const devAgent = { process: mock(async () => ({ success: true })) };
    const conductor = createMockConductor({
      getAgentByType: mock(() => devAgent),
      initialize: mock(async () => {}),
    });
    const ctx = createMockToolContext({
      getGraphStorage: async () => storage as any,
      getConductor: () => conductor as any,
    });
    const handler = new CleanIndexToolHandler(ctx);
    const result = await handler.handle({});
    const data = parseJsonResult(result);

    expect(data.success).toBe(true);
    expect(storage.clear).toHaveBeenCalled();
    expect(devAgent.process).toHaveBeenCalled();
  });
});

// ─── GetGraph ─────────────────────────────────────────────────────

describe("GetGraphToolHandler", () => {
  it("returns entities and relationships with pagination", async () => {
    const entities = [
      { id: "e1", name: "Foo", type: "class" },
      { id: "e2", name: "Bar", type: "function" },
    ];
    const rels = [{ fromId: "e1", toId: "e2", type: "calls" }];
    const storage = createMockGraphStorage({
      findEntities: mock(async () => entities),
      findRelationships: mock(async () => rels),
    });
    const ctx = createMockToolContext({ getGraphStorage: async () => storage as any });
    const handler = new GetGraphToolHandler(ctx);
    const result = await handler.handle({});
    const data = parseJsonResult(result);

    expect(data.entities).toBe(2);
    expect(data.relationships).toBe(1);
    expect(data.pagination).toBeDefined();
    expect(data.data.entities).toHaveLength(2);
  });

  it("applies entityTypes filter", async () => {
    const findEntities = mock(async () => []);
    const storage = createMockGraphStorage({ findEntities });
    const ctx = createMockToolContext({ getGraphStorage: async () => storage as any });
    const handler = new GetGraphToolHandler(ctx);
    await handler.handle({ entityTypes: ["class"] });

    const callArgs = findEntities.mock.calls[0]?.[0] as any;
    expect(callArgs.filters.entityType).toEqual(["class"]);
  });

  it("skips relationships when includeRelationships=false", async () => {
    const findRelationships = mock(async () => []);
    const storage = createMockGraphStorage({
      findEntities: mock(async () => []),
      findRelationships,
    });
    const ctx = createMockToolContext({ getGraphStorage: async () => storage as any });
    const handler = new GetGraphToolHandler(ctx);
    await handler.handle({ includeRelationships: false });

    expect(findRelationships).not.toHaveBeenCalled();
  });

  it("returns empty graph", async () => {
    const storage = createMockGraphStorage();
    const ctx = createMockToolContext({ getGraphStorage: async () => storage as any });
    const handler = new GetGraphToolHandler(ctx);
    const result = await handler.handle({});
    const data = parseJsonResult(result);

    expect(data.entities).toBe(0);
    expect(data.relationships).toBe(0);
  });
});

// ─── GetGraphStats ────────────────────────────────────────────────

describe("GetGraphStatsToolHandler", () => {
  it("returns storage statistics", async () => {
    const storage = createMockGraphStorage({
      getStatistics: mock(async () => ({
        totalEntities: 100,
        totalRelationships: 200,
        totalFiles: 50,
      })),
    });
    const ctx = createMockToolContext({ getGraphStorage: async () => storage as any });
    const handler = new GetGraphStatsToolHandler(ctx);
    const result = await handler.handle({});
    const data = parseJsonResult(result);

    expect(data.totalEntities).toBe(100);
    expect(data.totalRelationships).toBe(200);
    expect(data.totalFiles).toBe(50);
  });

  it("includes cooccurrence stats when available", async () => {
    const storage = createMockGraphStorage({
      getStatistics: mock(async () => ({ totalEntities: 10 })),
      getCooccurrenceOps: () => ({ getStats: async () => ({ pairs: 50 }) }),
    });
    const ctx = createMockToolContext({ getGraphStorage: async () => storage as any });
    const handler = new GetGraphStatsToolHandler(ctx);
    const result = await handler.handle({});
    const data = parseJsonResult(result);

    expect(data.cooccurrence).toBeDefined();
    expect(data.cooccurrence.pairs).toBe(50);
  });
});

// ─── GetGraphHealth ───────────────────────────────────────────────

describe("GetGraphHealthToolHandler", () => {
  it("returns healthy status with database info", async () => {
    const storage = createMockGraphStorage({
      getStatistics: mock(async () => ({
        totalEntities: 100,
        totalRelationships: 200,
        totalFiles: 50,
      })),
    });
    const ctx = createMockToolContext({ getGraphStorage: async () => storage as any });
    const handler = new GetGraphHealthToolHandler(ctx);
    const result = await handler.handle({});
    const data = parseJsonResult(result);

    expect(data.status).toBe("healthy");
    expect(data.database).toBeDefined();
    expect(data.database.entities).toBe(100);
  });

  it("includes swagger health when swagger entities exist", async () => {
    const entities = [
      { id: "e1", type: "api_spec", filePath: "spec.yaml", metadata: { swaggerType: "api_spec" }, updatedAt: 1000 },
    ];
    const storage = createMockGraphStorage({
      getStatistics: mock(async () => ({ totalEntities: 1, totalRelationships: 0, totalFiles: 1 })),
      getAllEntities: mock(async () => entities),
      getAllRelationships: mock(async () => []),
    });
    const ctx = createMockToolContext({ getGraphStorage: async () => storage as any });
    const handler = new GetGraphHealthToolHandler(ctx);
    const result = await handler.handle({});
    const data = parseJsonResult(result);

    expect(data.swagger).toBeDefined();
    expect(data.swagger.swaggerFilesFound).toBe(1);
  });
});
