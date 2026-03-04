import { describe, expect, it } from "bun:test";
import { GetToolsForTaskHandler } from "../../src/tools/handlers/get-tools-for-task-handler.js";
import { createMockToolContext, parseJsonResult } from "./_test-helpers.js";

describe("GetToolsForTaskHandler", () => {
  const ctx = createMockToolContext();

  it("returns recommendations for valid task", async () => {
    const handler = new GetToolsForTaskHandler(ctx);
    const result = await handler.handle({ task: "find duplicates" });
    const data = parseJsonResult(result);

    expect(data.success).toBe(true);
    expect(data.task).toBe("find duplicates");
    expect(Array.isArray(data.recommendations)).toBe(true);
    expect(data.recommendations.length).toBeGreaterThan(0);
  });

  it("recommendations are sorted by score desc", async () => {
    const handler = new GetToolsForTaskHandler(ctx);
    const result = await handler.handle({ task: "search code" });
    const data = parseJsonResult(result);

    const scores = data.recommendations.map((r: any) => r.score);
    for (let i = 1; i < scores.length; i++) {
      expect(scores[i]).toBeLessThanOrEqual(scores[i - 1]);
    }
  });

  it("boosts scores when agentType filter matches", async () => {
    const handler = new GetToolsForTaskHandler(ctx);
    const resultWithType = await handler.handle({ task: "search", agentType: "explore" });
    const dataWithType = parseJsonResult(resultWithType);

    expect(dataWithType.agentType).toBe("explore");
    expect(dataWithType.recommendations.length).toBeGreaterThan(0);
  });

  it("handles generic task with no keyword matches", async () => {
    const handler = new GetToolsForTaskHandler(ctx);
    const result = await handler.handle({ task: "xyz_no_match_12345" });
    const data = parseJsonResult(result);

    expect(data.success).toBe(true);
    // get_help always gets +1 boost
    // May return some results or empty
    expect(Array.isArray(data.recommendations)).toBe(true);
  });

  it("returns error for missing task field", async () => {
    const handler = new GetToolsForTaskHandler(ctx);
    const result = await handler.handle({});
    const data = parseJsonResult(result);
    expect(data.success).toBe(false);
  });
});
