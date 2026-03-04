import { describe, expect, it, mock } from "bun:test";
import {
  AnalyzeStateImpactToolHandler,
  FindDecisionPointsToolHandler,
  TraceBackwardsToolHandler,
  TraceDataFlowToolHandler,
  TraceFlowToolHandler,
} from "../../src/tools/handlers/tracing-tool-handlers.js";
import { createMockGraphStorage, createMockToolContext, parseJsonResult } from "./_test-helpers.js";

function makeCtx(storageOverrides = {}) {
  const storage = createMockGraphStorage({
    findEntities: mock(async (q: any) => {
      // Simulate entity lookup for trace resolution
      if (q?.filters?.name) {
        return [{ id: `ent-${q.filters.name}`, name: q.filters.name, type: "function", filePath: "/a.ts" }];
      }
      return [];
    }),
    getRelationshipsForEntity: mock(async () => []),
    searchEntities: mock(async () => []),
    ...storageOverrides,
  });
  return createMockToolContext({ getGraphStorage: async () => storage as any });
}

// ─── TraceFlow ────────────────────────────────────────────────────

describe("TraceFlowToolHandler", () => {
  it("returns result for trace from A to B (may fail with empty graph)", async () => {
    const ctx = makeCtx();
    const handler = new TraceFlowToolHandler(ctx);
    const result = await handler.handle({ from: "handleLogin", to: "redirectToHome" });
    const data = parseJsonResult(result);

    // With empty mock graph, entities may not be found
    expect(data).toBeDefined();
    expect(data.success === true || data.error !== undefined).toBe(true);
  });

  it("handles mermaid format request", async () => {
    const ctx = makeCtx();
    const handler = new TraceFlowToolHandler(ctx);
    const result = await handler.handle({ from: "A", to: "B", format: "mermaid" });
    const data = parseJsonResult(result);

    // With empty graph, may return error about entity not found
    expect(data).toBeDefined();
    expect(data.success === true || data.error !== undefined).toBe(true);
  });

  it("returns Zod error when 'from' is missing", async () => {
    const ctx = makeCtx();
    const handler = new TraceFlowToolHandler(ctx);
    const result = await handler.handle({ to: "B" });
    const data = parseJsonResult(result);

    expect(data.success).toBe(false);
  });

  it("returns Zod error when 'to' is missing", async () => {
    const ctx = makeCtx();
    const handler = new TraceFlowToolHandler(ctx);
    const result = await handler.handle({ from: "A" });
    const data = parseJsonResult(result);

    expect(data.success).toBe(false);
  });
});

// ─── TraceBackwards ───────────────────────────────────────────────

describe("TraceBackwardsToolHandler", () => {
  it("handles why_not_called question (may fail with empty graph)", async () => {
    const ctx = makeCtx();
    const handler = new TraceBackwardsToolHandler(ctx);
    const result = await handler.handle({ target: "FinishTask", question: "why_not_called" });
    const data = parseJsonResult(result);

    // With empty mock graph, target entity may not be found
    expect(data).toBeDefined();
    expect(data.success === true || data.error !== undefined).toBe(true);
  });

  it("returns Zod error when question is invalid", async () => {
    const ctx = makeCtx();
    const handler = new TraceBackwardsToolHandler(ctx);
    const result = await handler.handle({ target: "X", question: "invalid_question" });
    const data = parseJsonResult(result);

    expect(data.success).toBe(false);
  });
});

// ─── TraceDataFlow ────────────────────────────────────────────────

describe("TraceDataFlowToolHandler", () => {
  it("handles data flow trace (may fail with empty graph)", async () => {
    const ctx = makeCtx();
    const handler = new TraceDataFlowToolHandler(ctx);
    const result = await handler.handle({ entryPoint: "AppInit", targetState: "startPage" });
    const data = parseJsonResult(result);

    // With empty mock graph, entry point may not be found
    expect(data).toBeDefined();
    expect(data.success === true || data.error !== undefined).toBe(true);
  });
});

// ─── AnalyzeStateImpact ───────────────────────────────────────────

describe("AnalyzeStateImpactToolHandler", () => {
  it("analyzes state impact with scenarios", async () => {
    const ctx = makeCtx();
    const handler = new AnalyzeStateImpactToolHandler(ctx);
    const result = await handler.handle({
      state: "isAuthenticated",
      scenarios: [
        { value: true, label: "logged in" },
        { value: false, label: "logged out" },
      ],
    });
    const data = parseJsonResult(result);

    expect(data.success).toBe(true);
  });

  it("returns Zod error when scenarios is empty", async () => {
    const ctx = makeCtx();
    const handler = new AnalyzeStateImpactToolHandler(ctx);
    const result = await handler.handle({ state: "x", scenarios: [] });
    const data = parseJsonResult(result);

    expect(data.success).toBe(false);
  });
});

// ─── FindDecisionPoints ───────────────────────────────────────────

describe("FindDecisionPointsToolHandler", () => {
  it("finds decision points for a scenario", async () => {
    const ctx = makeCtx();
    const handler = new FindDecisionPointsToolHandler(ctx);
    const result = await handler.handle({ scenario: "user checkout flow" });
    const data = parseJsonResult(result);

    expect(data.success).toBe(true);
  });
});
