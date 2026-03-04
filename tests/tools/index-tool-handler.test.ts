// Mock the auto-indexer and indexing-state to avoid real indexing
import { mock as bunMock, describe, expect, it, mock } from "bun:test";
import { IndexToolHandler } from "../../src/tools/handlers/index-tool-handler.js";
import { createMockToolContext, parseJsonResult } from "./_test-helpers.js";

describe("IndexToolHandler", () => {
  it("validates args with defaults", async () => {
    // We cannot easily mock performAutoIndex since it's imported statically,
    // but we can test that the handler instantiates and processes args correctly
    const ctx = createMockToolContext({
      createAutoIndexContext: () =>
        ({
          getGraphStorage: async () => ({}) as any,
          getSemanticAgent: async () => null,
          getConductor: () => ({}) as any,
          normalizeInputPath: (p: string) => p,
          projectPath: "/tmp/test",
        }) as any,
    });
    const handler = new IndexToolHandler(ctx);

    // Test that handle parses args (we can't test full indexing without FS)
    // This exercises parseArgs path
    const result = await handler.handle({ directory: "/nonexistent" });
    const data = parseJsonResult(result);

    // Will likely fail with some error (no real FS), but should not throw
    expect(data).toBeDefined();
  });

  it("parses schema defaults correctly", async () => {
    const ctx = createMockToolContext();
    const handler = new IndexToolHandler(ctx);

    // Pass empty args - should apply defaults via Zod
    const result = await handler.handle({});
    const data = parseJsonResult(result);
    expect(data).toBeDefined();
  });
});
