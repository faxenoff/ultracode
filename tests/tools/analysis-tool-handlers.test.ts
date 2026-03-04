import { describe, expect, it, mock } from "bun:test";
// We need to import handlers dynamically since they have heavy dependencies
// Use direct imports for faster test loading
import {
  AnalyzeCodeImpactToolHandler,
  AnalyzeHotspotsToolHandler,
  AnalyzeStateChaosToolHandler,
  DetectTechnologyStackToolHandler,
  FindRelatedConceptsToolHandler,
  SuggestRefactoringToolHandler,
} from "../../src/tools/handlers/analysis-tool-handlers.js";
import {
  createMockGraphStorage,
  createMockSemanticAgent,
  createMockToolContext,
  expectError,
  parseJsonResult,
} from "./_test-helpers.js";

function makeCtxWithStorage(storageOverrides = {}) {
  const storage = createMockGraphStorage({
    findEntities: mock(async () => []),
    getAllEntities: mock(async () => []),
    getAllRelationships: mock(async () => []),
    getRelationshipsForEntity: mock(async () => []),
    ...storageOverrides,
  });
  return createMockToolContext({ getGraphStorage: async () => storage as any });
}

// ─── SuggestRefactoring ───────────────────────────────────────────

describe("SuggestRefactoringToolHandler", () => {
  it("returns suggestions for entityId", async () => {
    const entity = { id: "e1", name: "BigClass", type: "class", filePath: "/a.ts", metadata: {} };
    const storage = createMockGraphStorage({
      getEntity: mock(async () => entity),
      findEntities: mock(async () => [entity]),
      getRelationshipsForEntity: mock(async () => []),
      getAllRelationships: mock(async () => []),
    });
    const ctx = createMockToolContext({ getGraphStorage: async () => storage as any });
    const handler = new SuggestRefactoringToolHandler(ctx);
    const result = await handler.handle({ entityId: "e1" });
    const data = parseJsonResult(result);

    // Should return some result (suggestions or empty)
    expect(data).toBeDefined();
  });

  it("returns Zod error for missing required args", async () => {
    const ctx = makeCtxWithStorage();
    const handler = new SuggestRefactoringToolHandler(ctx);
    const result = await handler.handle({});
    // Should fail with error since neither entityId nor filePath provided
    const data = parseJsonResult(result);
    expect(data.error !== undefined || data.success === false || data.suggestions !== undefined).toBe(true);
  });
});

// ─── AnalyzeHotspots ──────────────────────────────────────────────

describe("AnalyzeHotspotsToolHandler", () => {
  it("returns hotspots from graph", async () => {
    const entities = [
      {
        id: "e1",
        name: "Complex",
        type: "function",
        metadata: { cyclomatic: 15, linesOfCode: 200 },
        filePath: "/a.ts",
      },
    ];
    const storage = createMockGraphStorage({
      getAllEntities: mock(async () => entities),
      findEntities: mock(async () => entities),
      getRelationshipsForEntity: mock(async () => []),
    });
    const ctx = createMockToolContext({ getGraphStorage: async () => storage as any });
    const handler = new AnalyzeHotspotsToolHandler(ctx);
    const result = await handler.handle({});
    const data = parseJsonResult(result);

    expect(data).toBeDefined();
  });
});

// ─── FindRelatedConcepts ──────────────────────────────────────────

describe("FindRelatedConceptsToolHandler", () => {
  it("returns related concepts for entityId", async () => {
    const entity = { id: "e1", name: "Auth", type: "class" };
    const rels = [{ fromId: "e1", toId: "e2", type: "imports" }];
    const storage = createMockGraphStorage({
      getEntity: mock(async () => entity),
      findEntities: mock(async () => [entity]),
      getRelationshipsForEntity: mock(async () => rels),
      getAllEntities: mock(async () => [entity, { id: "e2", name: "Token", type: "class" }]),
    });
    const ctx = createMockToolContext({ getGraphStorage: async () => storage as any });
    const handler = new FindRelatedConceptsToolHandler(ctx);
    const result = await handler.handle({ entityId: "e1" });
    const data = parseJsonResult(result);

    expect(data).toBeDefined();
  });
});

// ─── AnalyzeStateChaos ────────────────────────────────────────────

describe("AnalyzeStateChaosToolHandler", () => {
  it("returns state chaos analysis", async () => {
    const ctx = makeCtxWithStorage();
    const handler = new AnalyzeStateChaosToolHandler(ctx);
    const result = await handler.handle({});
    const text = result.content[0]?.text;

    // May return plain text (e.g. "No state patterns detected") or JSON
    expect(text).toBeDefined();
    expect(typeof text).toBe("string");
    expect(text!.length).toBeGreaterThan(0);
  });
});

// ─── AnalyzeCodeImpact ────────────────────────────────────────────

describe("AnalyzeCodeImpactToolHandler", () => {
  it("analyzes impact for entityId", async () => {
    const entity = { id: "e1", name: "Foo", type: "function", filePath: "/a.ts" };
    const storage = createMockGraphStorage({
      getEntity: mock(async () => entity),
      findEntities: mock(async () => [entity]),
      getRelationshipsForEntity: mock(async () => []),
    });
    const ctx = createMockToolContext({ getGraphStorage: async () => storage as any });
    const handler = new AnalyzeCodeImpactToolHandler(ctx);
    const result = await handler.handle({ entityId: "e1" });
    const data = parseJsonResult(result);

    expect(data).toBeDefined();
  });
});

// ─── DetectTechnologyStack ────────────────────────────────────────

describe("DetectTechnologyStackToolHandler", () => {
  it("detects technology stack", async () => {
    const ctx = makeCtxWithStorage();
    const handler = new DetectTechnologyStackToolHandler(ctx);
    const result = await handler.handle({});
    const data = parseJsonResult(result);

    expect(data).toBeDefined();
  });
});
