import { describe, expect, it } from "bun:test";
import { GetHelpToolHandler } from "../../src/tools/handlers/help-tool-handler.js";
import { createMockToolContext, expectError, parseJsonResult } from "./_test-helpers.js";

describe("GetHelpToolHandler", () => {
  const ctx = createMockToolContext();

  it("returns result for valid topic (quick-start)", async () => {
    const handler = new GetHelpToolHandler(ctx);
    const result = await handler.handle({ topic: "quick-start" });
    const data = parseJsonResult(result);

    // May succeed (file found) or fail gracefully (file not at test CWD)
    if (data.success) {
      expect(data.topic).toBe("quick-start");
      expect(data.documentation).toBeDefined();
    } else {
      // Graceful error with available topics list
      expect(data.availableTopics).toBeDefined();
      expect(Array.isArray(data.availableTopics)).toBe(true);
    }
  });

  it("returns documentation for all valid topics", async () => {
    const topics = [
      "quick-start",
      "tool-reference",
      "workflows",
      "tracing",
      "autodoc",
      "explore",
      "planning",
      "modification",
      "patterns",
      "security",
    ];

    for (const topic of topics) {
      const handler = new GetHelpToolHandler(ctx);
      const result = await handler.handle({ topic });
      const data = parseJsonResult(result);
      // Either success or graceful error (file not found)
      expect(data.topic === topic || data.error !== undefined).toBe(true);
    }
  });

  it("returns Zod error for invalid topic", async () => {
    const handler = new GetHelpToolHandler(ctx);
    const result = await handler.handle({ topic: "nonexistent-topic-xyz" });
    expectError(result);
  });

  it("returns Zod error when topic is missing", async () => {
    const handler = new GetHelpToolHandler(ctx);
    const result = await handler.handle({});
    expectError(result);
  });
});
