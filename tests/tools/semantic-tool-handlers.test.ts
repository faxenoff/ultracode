import { describe, expect, it, mock } from "bun:test";
import {
  CrossLanguageSearchToolHandler,
  DetectCodeClonesToolHandler,
  FindSimilarCodeToolHandler,
  SemanticSearchToolHandler,
} from "../../src/tools/handlers/semantic-tool-handlers.js";
import {
  createMockGraphStorage,
  createMockSemanticAgent,
  createMockToolContext,
  parseJsonResult,
} from "./_test-helpers.js";

// ─── SemanticSearch ───────────────────────────────────────────────

describe("SemanticSearchToolHandler", () => {
  it("returns search results for a query", async () => {
    const sa = createMockSemanticAgent({
      semanticSearch: mock(async () => ({
        results: [
          { id: "r1", name: "foo", type: "function", similarity: 0.95, metadata: { filePath: "/a.ts" } },
          { id: "r2", name: "bar", type: "class", similarity: 0.8, metadata: { filePath: "/b.ts" } },
        ],
        totalResults: 2,
      })),
    });
    const storage = createMockGraphStorage();
    const ctx = createMockToolContext({
      getSemanticAgent: async () => sa as any,
      getGraphStorage: async () => storage as any,
    });
    const handler = new SemanticSearchToolHandler(ctx);
    const result = await handler.handle({ query: "authentication logic" });
    const data = parseJsonResult(result);

    expect(data.query).toBe("authentication logic");
    expect(data.count).toBe(2);
    expect(data.results).toHaveLength(2);
    expect(data.results[0].similarity).toBe(0.95);
  });

  it("returns error when embedding init failed", async () => {
    const sa = createMockSemanticAgent({
      getEmbeddingInitError: mock(() => new Error("TEI server unreachable")),
    });
    const ctx = createMockToolContext({ getSemanticAgent: async () => sa as any });
    const handler = new SemanticSearchToolHandler(ctx);
    const result = await handler.handle({ query: "test" });
    const data = parseJsonResult(result);

    expect(data.success).toBe(false);
    expect(data.error).toContain("Embedding provider initialization failed");
    expect(data.hint).toBeDefined();
  });

  it("returns empty results", async () => {
    const sa = createMockSemanticAgent({
      semanticSearch: mock(async () => ({ results: [], totalResults: 0 })),
    });
    const storage = createMockGraphStorage();
    const ctx = createMockToolContext({
      getSemanticAgent: async () => sa as any,
      getGraphStorage: async () => storage as any,
    });
    const handler = new SemanticSearchToolHandler(ctx);
    const result = await handler.handle({ query: "nonexistent" });
    const data = parseJsonResult(result);

    expect(data.count).toBe(0);
    expect(data.results).toHaveLength(0);
  });

  it("applies metadata filters (minCyclomatic)", async () => {
    const sa = createMockSemanticAgent({
      semanticSearch: mock(async () => ({
        results: [
          { id: "r1", similarity: 0.9, metadata: { cyclomatic: 5 } },
          { id: "r2", similarity: 0.85, metadata: { cyclomatic: 2 } },
        ],
      })),
    });
    const storage = createMockGraphStorage();
    const ctx = createMockToolContext({
      getSemanticAgent: async () => sa as any,
      getGraphStorage: async () => storage as any,
    });
    const handler = new SemanticSearchToolHandler(ctx);
    const result = await handler.handle({ query: "complex code", minCyclomatic: 4 });
    const data = parseJsonResult(result);

    expect(data.count).toBe(1); // Only r1 passes filter
  });

  it("applies hasExceptions filter", async () => {
    const sa = createMockSemanticAgent({
      semanticSearch: mock(async () => ({
        results: [
          { id: "r1", similarity: 0.9, metadata: { hasExceptions: true } },
          { id: "r2", similarity: 0.85, metadata: { hasExceptions: false } },
        ],
      })),
    });
    const storage = createMockGraphStorage();
    const ctx = createMockToolContext({
      getSemanticAgent: async () => sa as any,
      getGraphStorage: async () => storage as any,
    });
    const handler = new SemanticSearchToolHandler(ctx);
    const result = await handler.handle({ query: "error handling", hasExceptions: true });
    const data = parseJsonResult(result);

    expect(data.count).toBe(1);
  });
});

// ─── FindSimilarCode ──────────────────────────────────────────────

describe("FindSimilarCodeToolHandler", () => {
  it("returns similar code results", async () => {
    const sa = createMockSemanticAgent({
      findSimilarCode: mock(async () => [{ id: "r1", name: "clone", similarity: 0.92, metadata: { path: "/x.ts" } }]),
    });
    const ctx = createMockToolContext({ getSemanticAgent: async () => sa as any });
    const handler = new FindSimilarCodeToolHandler(ctx);
    const result = await handler.handle({ code: "function foo() { return 1; }" });
    const data = parseJsonResult(result);

    expect(data.count).toBe(1);
    expect(data.results[0].similarity).toBe(0.92);
  });

  it("returns error when embedding init failed", async () => {
    const sa = createMockSemanticAgent({
      getEmbeddingInitError: mock(() => new Error("Ollama not running")),
    });
    const ctx = createMockToolContext({ getSemanticAgent: async () => sa as any });
    const handler = new FindSimilarCodeToolHandler(ctx);
    const result = await handler.handle({ code: "test" });
    const data = parseJsonResult(result);

    expect(data.success).toBe(false);
    expect(data.error).toContain("Embedding provider initialization failed");
  });
});

// ─── DetectCodeClones ─────────────────────────────────────────────

describe("DetectCodeClonesToolHandler", () => {
  it("returns clone groups", async () => {
    const sa = createMockSemanticAgent({
      detectClones: mock(async () => [
        {
          avgSimilarity: 0.95,
          cloneType: "type-2",
          members: [
            { id: "m1", name: "fn1", path: "/a.ts", startLine: 1, endLine: 10 },
            { id: "m2", name: "fn2", path: "/b.ts", startLine: 5, endLine: 15 },
          ],
        },
      ]),
    });
    const ctx = createMockToolContext({ getSemanticAgent: async () => sa as any });
    const handler = new DetectCodeClonesToolHandler(ctx);
    const result = await handler.handle({});
    const data = parseJsonResult(result);

    expect(data.groupsFound).toBe(1);
    expect(data.clones[0].members).toHaveLength(2);
  });

  it("returns groupsFound=0 when no clones", async () => {
    const sa = createMockSemanticAgent({ detectClones: mock(async () => []) });
    const ctx = createMockToolContext({ getSemanticAgent: async () => sa as any });
    const handler = new DetectCodeClonesToolHandler(ctx);
    const result = await handler.handle({});
    const data = parseJsonResult(result);

    expect(data.groupsFound).toBe(0);
  });

  it("handles null/undefined from detectClones gracefully", async () => {
    const sa = createMockSemanticAgent({ detectClones: mock(async () => null) });
    const ctx = createMockToolContext({ getSemanticAgent: async () => sa as any });
    const handler = new DetectCodeClonesToolHandler(ctx);
    const result = await handler.handle({});
    const data = parseJsonResult(result);

    expect(data.groupsFound).toBe(0);
  });
});

// ─── CrossLanguageSearch ──────────────────────────────────────────

describe("CrossLanguageSearchToolHandler", () => {
  it("returns cross-language results", async () => {
    const sa = createMockSemanticAgent({
      crossLanguageSearch: mock(async () => [
        { id: "r1", name: "handler", similarity: 0.88, metadata: { language: "python", path: "/app.py" } },
      ]),
    });
    const ctx = createMockToolContext({ getSemanticAgent: async () => sa as any });
    const handler = new CrossLanguageSearchToolHandler(ctx);
    const result = await handler.handle({ query: "http handler", languages: ["python", "go"] });
    const data = parseJsonResult(result);

    expect(data.query).toBe("http handler");
    expect(data.count).toBe(1);
  });
});
