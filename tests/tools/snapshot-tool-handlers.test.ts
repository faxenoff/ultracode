import { describe, expect, it, mock } from "bun:test";
import {
  CleanupSnapshotsToolHandler,
  CreateSnapshotToolHandler,
  ListSnapshotsToolHandler,
  RollbackSnapshotToolHandler,
} from "../../src/tools/handlers/snapshot-tool-handlers.js";
import { createMockSnapshotManager, createMockToolContext, expectError, parseJsonResult } from "./_test-helpers.js";

// ─── CreateSnapshot ───────────────────────────────────────────────

describe("CreateSnapshotToolHandler", () => {
  it("creates snapshot with description and returns snapshotId", async () => {
    const sm = createMockSnapshotManager({ createSnapshot: mock(async () => "snap-123") });
    const ctx = createMockToolContext({ getSnapshotManager: async () => sm as any });
    const handler = new CreateSnapshotToolHandler(ctx);
    const result = await handler.handle({ description: "Test snapshot", filePaths: ["/a.ts"] });
    const data = parseJsonResult(result);

    expect(data.success).toBe(true);
    expect(data.snapshotId).toBe("snap-123");
    expect(sm.createSnapshot).toHaveBeenCalled();
  });

  it("returns error when manager unavailable", async () => {
    const ctx = createMockToolContext({ getSnapshotManager: async () => null as any });
    const handler = new CreateSnapshotToolHandler(ctx);
    const result = await handler.handle({});
    const data = parseJsonResult(result);

    expect(data.error).toContain("not available");
  });

  it("returns error on exception", async () => {
    const sm = createMockSnapshotManager({
      createSnapshot: mock(async () => {
        throw new Error("disk full");
      }),
    });
    const ctx = createMockToolContext({ getSnapshotManager: async () => sm as any });
    const handler = new CreateSnapshotToolHandler(ctx);
    const result = await handler.handle({ description: "test" });
    const data = parseJsonResult(result);

    expect(data.error).toContain("disk full");
  });
});

// ─── RollbackSnapshot ─────────────────────────────────────────────

describe("RollbackSnapshotToolHandler", () => {
  it("rolls back to specified snapshotId", async () => {
    const sm = createMockSnapshotManager();
    const ctx = createMockToolContext({ getSnapshotManager: async () => sm as any });
    const handler = new RollbackSnapshotToolHandler(ctx);
    const result = await handler.handle({ snapshotId: "snap-001" });
    const data = parseJsonResult(result);

    expect(data.success).toBe(true);
    expect(data.restoredSnapshot).toBe("snap-001");
    expect(sm.rollback).toHaveBeenCalledWith("snap-001");
  });

  it("rolls back to latest snapshot when no snapshotId given (steps=1)", async () => {
    const sm = createMockSnapshotManager({
      listSnapshots: mock(async () => [{ id: "snap-latest", description: "latest", timestamp: Date.now() }]),
    });
    const ctx = createMockToolContext({ getSnapshotManager: async () => sm as any });
    const handler = new RollbackSnapshotToolHandler(ctx);
    const result = await handler.handle({});
    const data = parseJsonResult(result);

    expect(data.success).toBe(true);
    expect(data.restoredSnapshot).toBe("snap-latest");
  });

  it("returns error when no snapshots available", async () => {
    const sm = createMockSnapshotManager({ listSnapshots: mock(async () => []) });
    const ctx = createMockToolContext({ getSnapshotManager: async () => sm as any });
    const handler = new RollbackSnapshotToolHandler(ctx);
    const result = await handler.handle({});
    const data = parseJsonResult(result);

    expect(data.error).toContain("No snapshots available");
  });

  it("returns error when manager unavailable", async () => {
    const ctx = createMockToolContext({ getSnapshotManager: async () => null as any });
    const handler = new RollbackSnapshotToolHandler(ctx);
    const result = await handler.handle({});
    const data = parseJsonResult(result);

    expect(data.error).toContain("not available");
  });
});

// ─── ListSnapshots ────────────────────────────────────────────────

describe("ListSnapshotsToolHandler", () => {
  it("returns snapshots with details", async () => {
    const snapshots = [
      { id: "s1", description: "First", timestamp: 1700000000000, backend: "fs", filesCount: 3, sizeBytes: 1024 },
      { id: "s2", description: "Second", timestamp: 1700000100000, backend: "fs", filesCount: 5, sizeBytes: 2048 },
    ];
    const sm = createMockSnapshotManager({ listSnapshots: mock(async () => snapshots) });
    const ctx = createMockToolContext({ getSnapshotManager: async () => sm as any });
    const handler = new ListSnapshotsToolHandler(ctx);
    const result = await handler.handle({});
    const data = parseJsonResult(result);

    expect(data.count).toBe(2);
    expect(data.snapshots[0].id).toBe("s1");
    expect(data.snapshots[0].createdAt).toBeDefined();
  });

  it("returns error when manager unavailable", async () => {
    const ctx = createMockToolContext({ getSnapshotManager: async () => null as any });
    const handler = new ListSnapshotsToolHandler(ctx);
    const result = await handler.handle({});
    const data = parseJsonResult(result);

    expect(data.error).toContain("not available");
  });

  it("returns empty list when no snapshots", async () => {
    const sm = createMockSnapshotManager({ listSnapshots: mock(async () => []) });
    const ctx = createMockToolContext({ getSnapshotManager: async () => sm as any });
    const handler = new ListSnapshotsToolHandler(ctx);
    const result = await handler.handle({});
    const data = parseJsonResult(result);

    expect(data.count).toBe(0);
    expect(data.snapshots).toHaveLength(0);
  });
});

// ─── CleanupSnapshots ─────────────────────────────────────────────

describe("CleanupSnapshotsToolHandler", () => {
  const makeSnapshots = (count: number) =>
    Array.from({ length: count }, (_, i) => ({
      id: `s${i}`,
      description: `Snap ${i}`,
      timestamp: Date.now() - i * 86400000,
      backend: "fs",
      filesCount: 1,
      sizeBytes: 100,
    }));

  it("dryRun=true counts but does not delete", async () => {
    const sm = createMockSnapshotManager({ listSnapshots: mock(async () => makeSnapshots(15)) });
    const ctx = createMockToolContext({ getSnapshotManager: async () => sm as any });
    const handler = new CleanupSnapshotsToolHandler(ctx);
    const result = await handler.handle({ keepCount: 10, dryRun: true });
    const data = parseJsonResult(result);

    expect(data.dryRun).toBe(true);
    expect(data.snapshotsKept).toBe(10);
    expect(data.snapshotsCleaned).toBe(5);
    expect(sm.deleteSnapshot).not.toHaveBeenCalled();
  });

  it("dryRun=false actually deletes", async () => {
    const sm = createMockSnapshotManager({ listSnapshots: mock(async () => makeSnapshots(15)) });
    const ctx = createMockToolContext({ getSnapshotManager: async () => sm as any });
    const handler = new CleanupSnapshotsToolHandler(ctx);
    const result = await handler.handle({ keepCount: 10, dryRun: false });
    const data = parseJsonResult(result);

    expect(data.dryRun).toBe(false);
    expect(sm.deleteSnapshot).toHaveBeenCalledTimes(5);
  });

  it("returns error when manager unavailable", async () => {
    const ctx = createMockToolContext({ getSnapshotManager: async () => null as any });
    const handler = new CleanupSnapshotsToolHandler(ctx);
    const result = await handler.handle({});
    const data = parseJsonResult(result);

    expect(data.error).toContain("not available");
  });
});
