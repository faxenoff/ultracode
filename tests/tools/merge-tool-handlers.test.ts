import { describe, expect, it } from "bun:test";
import { GetSemanticMergeInfoToolHandler } from "../../src/tools/handlers/merge-tool-handlers.js";
import { createMockToolContext, parseJsonResult } from "./_test-helpers.js";

// Note: SemanticMerge, AnalyzeMergeConflicts, and GetMergeSuggestions depend on
// DI container and MergeAgent initialization which is complex to mock.
// GetSemanticMergeInfo is a static info handler that's easily testable.

describe("GetSemanticMergeInfoToolHandler", () => {
  it("returns merge capabilities info", async () => {
    const ctx = createMockToolContext();
    const handler = new GetSemanticMergeInfoToolHandler(ctx);
    const result = await handler.handle({});
    const data = parseJsonResult(result);

    expect(data.name).toBe("Semantic Merge");
    expect(data.version).toBe("1.0.0");
    expect(data.capabilities).toBeDefined();
    expect(Array.isArray(data.capabilities)).toBe(true);
    expect(data.capabilities.length).toBeGreaterThan(0);
    expect(data.tools).toBeDefined();
    expect(data.tools).toHaveLength(3);
    expect(data.metrics).toBeDefined();
  });
});
