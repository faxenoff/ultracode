import { describe, expect, it } from "bun:test";
import { ToolRegistry } from "../../src/tools/tool-registry.js";
import { createMockToolContext } from "./_test-helpers.js";

describe("ToolRegistry", () => {
  const registry = new ToolRegistry();

  describe("has()", () => {
    it("returns true for eager handler (get_help)", () => {
      expect(registry.has("get_help")).toBe(true);
    });

    it("returns true for eager handler (index)", () => {
      expect(registry.has("index")).toBe(true);
    });

    it("returns true for eager handler (get_members)", () => {
      expect(registry.has("get_members")).toBe(true);
    });

    it("returns true for lazy handler (semantic_search)", () => {
      expect(registry.has("semantic_search")).toBe(true);
    });

    it("returns true for lazy handler (trace_flow)", () => {
      expect(registry.has("trace_flow")).toBe(true);
    });

    it("returns false for unknown tool", () => {
      expect(registry.has("nonexistent_tool_xyz")).toBe(false);
    });
  });

  describe("getHandler()", () => {
    it("returns handler instance for eager tool", async () => {
      const ctx = createMockToolContext();
      const handler = await registry.getHandler("get_help", ctx);
      expect(handler).toBeDefined();
      expect(typeof handler.handle).toBe("function");
    });

    it("returns handler instance for lazy tool (loads module)", async () => {
      const freshRegistry = new ToolRegistry();
      const ctx = createMockToolContext();
      const handler = await freshRegistry.getHandler("semantic_search", ctx);
      expect(handler).toBeDefined();
      expect(typeof handler.handle).toBe("function");
    });

    it("caches lazy handler after first load", async () => {
      const freshRegistry = new ToolRegistry();
      const ctx = createMockToolContext();

      // First call loads from lazy
      const h1 = await freshRegistry.getHandler("trace_flow", ctx);
      // Second call uses cached constructor
      const h2 = await freshRegistry.getHandler("trace_flow", ctx);

      expect(h1).toBeDefined();
      expect(h2).toBeDefined();
      // Both should be instances of the same class
      expect(h1.constructor).toBe(h2.constructor);
    });

    it("throws for unknown tool", async () => {
      const ctx = createMockToolContext();
      await expect(registry.getHandler("unknown_tool_xyz", ctx)).rejects.toThrow("Unknown tool");
    });
  });

  describe("getRegisteredTools()", () => {
    it("contains all expected tools (60+)", () => {
      const tools = registry.getRegisteredTools();
      expect(tools.length).toBeGreaterThanOrEqual(60);
    });

    it("includes core eager tools", () => {
      const tools = registry.getRegisteredTools();
      const expected = [
        "get_help",
        "get_tools_for_task",
        "index",
        "reset_graph",
        "clean_index",
        "get_graph",
        "get_graph_stats",
        "get_graph_health",
        "get_members",
        "list_entity_relationships",
        "query",
        "get_metrics",
        "get_version",
        "get_agent_metrics",
        "get_bus_stats",
        "clear_bus_topic",
        "get_watcher_status",
      ];
      for (const name of expected) {
        expect(tools).toContain(name);
      }
    });

    it("includes lazy-loaded tools", () => {
      const tools = registry.getRegisteredTools();
      const expected = [
        "semantic_search",
        "find_similar_code",
        "find_duplicates",
        "trace_flow",
        "trace_backwards",
        "autodoc_init",
        "modify_code",
        "validate_file",
        "taint_analysis",
        "graph_metrics",
        "detect_patterns",
        "get_entity_history",
        "semantic_merge",
      ];
      for (const name of expected) {
        expect(tools).toContain(name);
      }
    });
  });
});
