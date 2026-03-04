import { describe, expect, it, mock } from "bun:test";
import {
  CheckoutCommitToolHandler,
  DiffCommitsToolHandler,
  GetEntityHistoryToolHandler,
  ListCommitsToolHandler,
} from "../../src/tools/handlers/history-tool-handlers.js";
import { createMockGraphStorage, createMockToolContext, expectError, parseJsonResult } from "./_test-helpers.js";

function makeCtxNoProlly() {
  // Storage without Prolly Tree support
  const storage = createMockGraphStorage();
  (storage as any).getLibSQLAdapter = () => null;
  return createMockToolContext({ getGraphStorage: async () => storage as any });
}

function makeCtxWithProlly(overrides: Record<string, unknown> = {}) {
  const nodeStore = {};
  const commitManager = {
    getBranchHead: mock(async () => ({ commitHash: "abc123" })),
    getCommit: mock(async () => ({
      commitHash: "abc123",
      message: "test commit",
      entityCount: 10,
      relationshipCount: 5,
      createdAt: Date.now(),
      parentHash: null,
    })),
    getHistory: mock(async () => [
      {
        commitHash: "abc123",
        message: "test",
        entityCount: 10,
        relationshipCount: 5,
        createdAt: Date.now(),
        parentHash: null,
      },
    ]),
    ...overrides,
  };
  const adapter = {
    getProllyNodeStore: () => nodeStore,
    getCommitManager: () => commitManager,
  };
  const storage = createMockGraphStorage();
  (storage as any).getLibSQLAdapter = () => adapter;
  return createMockToolContext({ getGraphStorage: async () => storage as any });
}

// ─── GetEntityHistory ─────────────────────────────────────────────

describe("GetEntityHistoryToolHandler", () => {
  it("returns error when Prolly Tree not available", async () => {
    const ctx = makeCtxNoProlly();
    const handler = new GetEntityHistoryToolHandler(ctx);
    const result = await handler.handle({ entityId: "e1" });
    const data = parseJsonResult(result);

    expect(data.error).toContain("Prolly Tree not available");
  });

  it("validates required entityId arg", async () => {
    const ctx = makeCtxNoProlly();
    const handler = new GetEntityHistoryToolHandler(ctx);
    const result = await handler.handle({});
    const data = parseJsonResult(result);

    expect(data.error !== undefined || data.success === false).toBe(true);
  });
});

// ─── DiffCommits ──────────────────────────────────────────────────

describe("DiffCommitsToolHandler", () => {
  it("returns error when Prolly Tree not available", async () => {
    const ctx = makeCtxNoProlly();
    const handler = new DiffCommitsToolHandler(ctx);
    const result = await handler.handle({ commitA: "aaa" });
    const data = parseJsonResult(result);

    expect(data.error).toContain("Prolly Tree not available");
  });
});

// ─── CheckoutCommit ───────────────────────────────────────────────

describe("CheckoutCommitToolHandler", () => {
  it("returns error when Prolly Tree not available", async () => {
    const ctx = makeCtxNoProlly();
    const handler = new CheckoutCommitToolHandler(ctx);
    const result = await handler.handle({ commitHash: "abc" });
    const data = parseJsonResult(result);

    expect(data.error).toContain("Prolly Tree not available");
  });
});

// ─── ListCommits ──────────────────────────────────────────────────

describe("ListCommitsToolHandler", () => {
  it("returns error when Prolly Tree not available", async () => {
    const ctx = makeCtxNoProlly();
    const handler = new ListCommitsToolHandler(ctx);
    const result = await handler.handle({});
    const data = parseJsonResult(result);

    expect(data.error).toContain("Prolly Tree not available");
  });

  it("returns commits list when Prolly Tree available", async () => {
    const ctx = makeCtxWithProlly();
    const handler = new ListCommitsToolHandler(ctx);
    const result = await handler.handle({});
    const data = parseJsonResult(result);

    expect(data.commits).toBeDefined();
    expect(data.commits).toHaveLength(1);
    expect(data.commits[0].hash).toBe("abc123");
    expect(data.total).toBe(1);
  });
});
