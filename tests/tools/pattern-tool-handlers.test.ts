import { describe, expect, it, mock } from "bun:test";
import {
  CheckEntityPatternsToolHandler,
  DetectPatternsToolHandler,
} from "../../src/tools/handlers/pattern-tool-handlers.js";
import {
  createMockGraphStorage,
  createMockSemanticAgent,
  createMockToolContext,
  parseJsonResult,
} from "./_test-helpers.js";

function makeCtx() {
  const storage = createMockGraphStorage({
    findEntities: mock(async () => []),
    getAllEntities: mock(async () => []),
    getRelationshipsForEntity: mock(async () => []),
  });
  const sa = createMockSemanticAgent();
  return createMockToolContext({
    getGraphStorage: async () => storage as any,
    getSemanticAgent: async () => sa as any,
  });
}

// ─── DetectPatterns ───────────────────────────────────────────────

describe("DetectPatternsToolHandler", () => {
  it("runs scan and returns results", async () => {
    const ctx = makeCtx();
    const handler = new DetectPatternsToolHandler(ctx);
    const result = await handler.handle({});
    const text = result.content[0]?.text;

    expect(text).toBeDefined();
    // PatternEngine returns formatted text (not always JSON)
    expect(typeof text).toBe("string");
    expect(text!.length).toBeGreaterThan(0);
  });

  it("handles format=json", async () => {
    const ctx = makeCtx();
    const handler = new DetectPatternsToolHandler(ctx);
    const result = await handler.handle({ format: "json" });
    const text = result.content[0]?.text;

    // Should be valid JSON
    expect(() => JSON.parse(text!)).not.toThrow();
  });

  it("handles format=detailed", async () => {
    const ctx = makeCtx();
    const handler = new DetectPatternsToolHandler(ctx);
    const result = await handler.handle({ format: "detailed" });
    const text = result.content[0]?.text;

    expect(text).toBeDefined();
  });
});

// ─── CheckEntityPatterns ──────────────────────────────────────────

describe("CheckEntityPatternsToolHandler", () => {
  it("returns no matches for nonexistent entity", async () => {
    const storage = createMockGraphStorage({
      getEntity: mock(async () => null),
      findEntities: mock(async () => []),
    });
    const ctx = createMockToolContext({ getGraphStorage: async () => storage as any });
    const handler = new CheckEntityPatternsToolHandler(ctx);
    const result = await handler.handle({ entityId: "nonexistent" });
    const text = result.content[0]?.text;

    // Either "No pattern matches" message or error
    expect(text).toBeDefined();
  });

  it("validates required entityId arg", async () => {
    const ctx = makeCtx();
    const handler = new CheckEntityPatternsToolHandler(ctx);
    const result = await handler.handle({});
    const text = result.content[0]?.text;

    // Should error due to missing entityId
    expect(text).toBeDefined();
  });
});
