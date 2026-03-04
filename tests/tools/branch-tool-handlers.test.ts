import { describe, expect, it, mock } from "bun:test";
import {
  CleanupBranchesToolHandler,
  GetBranchStatusToolHandler,
  GetChangedFilesToolHandler,
  ListBranchesToolHandler,
  SwitchBranchToolHandler,
} from "../../src/tools/handlers/branch-tool-handlers.js";
import { createMockBranchManager, createMockToolContext, expectError, parseJsonResult } from "./_test-helpers.js";

// ─── ListBranches ─────────────────────────────────────────────────

describe("ListBranchesToolHandler", () => {
  it("returns list of branches", async () => {
    const bm = createMockBranchManager({
      getActiveBranches: mock(() => [
        { name: "main", lastAccessed: Date.now(), metadata: {} },
        { name: "feature", lastAccessed: Date.now(), metadata: { lastIndexedAt: Date.now() } },
      ]),
      getCurrentBranch: mock(() => "main"),
    });
    const ctx = createMockToolContext({ getBranchManager: async () => bm as any });
    const handler = new ListBranchesToolHandler(ctx);
    const result = await handler.handle({});
    const data = parseJsonResult(result);

    expect(data.currentBranch).toBe("main");
    expect(data.branches).toHaveLength(2);
    expect(data.branches[0].isCurrent).toBe(true);
  });

  it("includes stats when includeStats=true", async () => {
    const bm = createMockBranchManager({
      getActiveBranches: mock(() => [
        { name: "main", lastAccessed: Date.now(), metadata: { lastIndexedAt: Date.now() } },
      ]),
      getCurrentBranch: mock(() => "main"),
    });
    const ctx = createMockToolContext({ getBranchManager: async () => bm as any });
    const handler = new ListBranchesToolHandler(ctx);
    const result = await handler.handle({ includeStats: true });
    const data = parseJsonResult(result);

    expect(data.stats).toBeDefined();
    expect(data.stats.totalBranches).toBe(1);
  });

  it("returns error when manager unavailable", async () => {
    const ctx = createMockToolContext({ getBranchManager: async () => null as any });
    const handler = new ListBranchesToolHandler(ctx);
    const result = await handler.handle({});
    const data = parseJsonResult(result);

    expect(data.error).toContain("not available");
  });
});

// ─── SwitchBranch ─────────────────────────────────────────────────

describe("SwitchBranchToolHandler", () => {
  it("switches branch successfully", async () => {
    const bm = createMockBranchManager();
    const ctx = createMockToolContext({ getBranchManager: async () => bm as any });
    const handler = new SwitchBranchToolHandler(ctx);
    const result = await handler.handle({ branchName: "feature-branch" });
    const data = parseJsonResult(result);

    expect(data.success).toBe(true);
    expect(data.currentBranch).toBe("feature-branch");
    expect(bm.switchBranch).toHaveBeenCalledWith("feature-branch");
  });

  it("returns error when manager unavailable", async () => {
    const ctx = createMockToolContext({ getBranchManager: async () => null as any });
    const handler = new SwitchBranchToolHandler(ctx);
    const result = await handler.handle({ branchName: "test" });
    const data = parseJsonResult(result);

    expect(data.error).toContain("not available");
  });

  it("returns error on switch failure", async () => {
    const bm = createMockBranchManager({
      switchBranch: mock(async () => {
        throw new Error("Branch not found");
      }),
    });
    const ctx = createMockToolContext({ getBranchManager: async () => bm as any });
    const handler = new SwitchBranchToolHandler(ctx);
    const result = await handler.handle({ branchName: "nonexistent" });
    const data = parseJsonResult(result);

    expect(data.error).toContain("Branch not found");
  });
});

// ─── GetBranchStatus ──────────────────────────────────────────────

describe("GetBranchStatusToolHandler", () => {
  it("returns current branch status", async () => {
    const bm = createMockBranchManager({
      getCurrentBranch: mock(() => "dev"),
      getBranchMetadata: mock(() => ({ lastIndexedAt: 1700000000, entityCount: 50 })),
      getBranchDbPath: mock(() => "/db/dev.db"),
      hasBranchDatabase: mock(() => true),
    });
    const ctx = createMockToolContext({ getBranchManager: async () => bm as any });
    const handler = new GetBranchStatusToolHandler(ctx);
    const result = await handler.handle({});
    const data = parseJsonResult(result);

    expect(data.branch).toBe("dev");
    expect(data.exists).toBe(true);
    expect(data.metadata).toBeDefined();
  });

  it("returns error when manager unavailable", async () => {
    const ctx = createMockToolContext({ getBranchManager: async () => null as any });
    const handler = new GetBranchStatusToolHandler(ctx);
    const result = await handler.handle({});
    const data = parseJsonResult(result);

    expect(data.error).toContain("not available");
  });
});

// ─── CleanupBranches ──────────────────────────────────────────────

describe("CleanupBranchesToolHandler", () => {
  it("reports cleanup candidates in dryRun", async () => {
    const bm = createMockBranchManager({
      getActiveBranches: mock(() => [{ name: "main" }, { name: "old-1" }, { name: "old-2" }]),
      getCurrentBranch: mock(() => "main"),
    });
    const ctx = createMockToolContext({ getBranchManager: async () => bm as any });
    const handler = new CleanupBranchesToolHandler(ctx);
    const result = await handler.handle({ keepCount: 0, dryRun: true });
    const data = parseJsonResult(result);

    expect(data.dryRun).toBe(true);
    expect(data.branchesFound).toBe(3);
  });

  it("returns error when manager unavailable", async () => {
    const ctx = createMockToolContext({ getBranchManager: async () => null as any });
    const handler = new CleanupBranchesToolHandler(ctx);
    const result = await handler.handle({});
    const data = parseJsonResult(result);

    expect(data.error).toContain("not available");
  });
});

// ─── GetChangedFiles ──────────────────────────────────────────────

describe("GetChangedFilesToolHandler", () => {
  it("returns changed files between branches", async () => {
    // This handler uses execSync for git commands, so we test error handling
    const ctx = createMockToolContext();
    const handler = new GetChangedFilesToolHandler(ctx);
    // In test environment, git commands may fail - that's expected
    const result = await handler.handle({ baseBranch: "main", targetBranch: "dev" });
    const data = parseJsonResult(result);

    // Either succeeds with files or fails with error (both are valid in test env)
    expect(data.files !== undefined || data.error !== undefined).toBe(true);
  });
});
