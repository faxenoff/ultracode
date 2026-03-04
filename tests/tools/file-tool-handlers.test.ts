import { describe, expect, it, mock } from "bun:test";
import {
  AddMemberToolHandler,
  CopyFileToolHandler,
  CreateFileToolHandler,
  ModifyEntityCodeToolHandler,
  RenameFileToolHandler,
  RenameSymbolToolHandler,
  SplitFileToolHandler,
  SynthesizeFilesToolHandler,
} from "../../src/tools/handlers/file-tool-handlers.js";
import { createMockGraphStorage, createMockToolContext, expectError, parseJsonResult } from "./_test-helpers.js";

function makeCtx(storageOverrides = {}) {
  const storage = createMockGraphStorage({
    findEntities: mock(async () => []),
    getEntity: mock(async () => null),
    ...storageOverrides,
  });
  return createMockToolContext({ getGraphStorage: async () => storage as any });
}

// ─── ModifyEntityCode ─────────────────────────────────────────────

describe("ModifyEntityCodeToolHandler", () => {
  it("returns error when entity not found (no entityId or filePath)", async () => {
    const ctx = makeCtx();
    const handler = new ModifyEntityCodeToolHandler(ctx);
    const result = await handler.handle({ newCode: "const x = 1;" });
    const data = parseJsonResult(result);

    expect(data.error).toContain("Entity not found");
  });

  it("returns error when entity not found by filePath", async () => {
    const storage = createMockGraphStorage({
      findEntities: mock(async () => []),
    });
    const ctx = createMockToolContext({ getGraphStorage: async () => storage as any });
    const handler = new ModifyEntityCodeToolHandler(ctx);
    const result = await handler.handle({ filePath: "/nonexistent.ts", newCode: "x" });
    const data = parseJsonResult(result);

    expect(data.error).toContain("Entity not found");
  });
});

// ─── CopyFile ─────────────────────────────────────────────────────

describe("CopyFileToolHandler", () => {
  it("validates required args", async () => {
    const ctx = makeCtx();
    const handler = new CopyFileToolHandler(ctx);
    const result = await handler.handle({});
    const data = parseJsonResult(result);

    expect(data.success).toBe(false);
  });
});

// ─── RenameFile ───────────────────────────────────────────────────

describe("RenameFileToolHandler", () => {
  it("validates required args", async () => {
    const ctx = makeCtx();
    const handler = new RenameFileToolHandler(ctx);
    const result = await handler.handle({});
    const data = parseJsonResult(result);

    expect(data.success).toBe(false);
  });
});

// ─── SplitFile ────────────────────────────────────────────────────

describe("SplitFileToolHandler", () => {
  it("returns nothing to split when only 1 entity found", async () => {
    const storage = createMockGraphStorage({
      findEntities: mock(async () => [{ id: "e1", name: "Single", type: "class" }]),
    });
    const ctx = createMockToolContext({ getGraphStorage: async () => storage as any });
    const handler = new SplitFileToolHandler(ctx);
    const result = await handler.handle({ filePath: "/a.ts", preview: true });
    const data = parseJsonResult(result);

    expect(data.success).toBe(false);
    expect(data.message).toContain("nothing to split");
  });

  it("returns planned files in preview mode", async () => {
    const storage = createMockGraphStorage({
      findEntities: mock(async () => [
        { id: "e1", name: "ClassA", type: "class" },
        { id: "e2", name: "ClassB", type: "class" },
      ]),
    });
    const ctx = createMockToolContext({ getGraphStorage: async () => storage as any });
    const handler = new SplitFileToolHandler(ctx);
    const result = await handler.handle({ filePath: "/a.ts", preview: true });
    const data = parseJsonResult(result);

    expect(data.preview).toBe(true);
    expect(data.entitiesToSplit).toBe(2);
    expect(data.plannedFiles).toHaveLength(2);
  });
});

// ─── SynthesizeFiles ──────────────────────────────────────────────

describe("SynthesizeFilesToolHandler", () => {
  it("validates required args (filePaths, outputPath)", async () => {
    const ctx = makeCtx();
    const handler = new SynthesizeFilesToolHandler(ctx);
    const result = await handler.handle({});
    const data = parseJsonResult(result);

    expect(data.success).toBe(false);
  });
});

// ─── CreateFile ───────────────────────────────────────────────────

describe("CreateFileToolHandler", () => {
  it("validates required args", async () => {
    const ctx = makeCtx();
    const handler = new CreateFileToolHandler(ctx);
    const result = await handler.handle({});
    const data = parseJsonResult(result);

    expect(data.success).toBe(false);
  });
});

// ─── RenameSymbol ─────────────────────────────────────────────────

describe("RenameSymbolToolHandler", () => {
  it("returns error when entity not found", async () => {
    const storage = createMockGraphStorage({
      getEntity: mock(async () => null),
      findEntities: mock(async () => []),
    });
    const ctx = createMockToolContext({ getGraphStorage: async () => storage as any });
    const handler = new RenameSymbolToolHandler(ctx);
    const result = await handler.handle({ entityName: "NotFound", newName: "NewName" });
    const data = parseJsonResult(result);

    expect(data.error).toContain("Entity not found");
  });

  it("returns preview info when preview=true", async () => {
    const entity = { id: "e1", name: "OldName", type: "function", filePath: "/a.ts" };
    const storage = createMockGraphStorage({
      getEntity: mock(async () => entity),
      findEntities: mock(async () => [entity]),
      getRelationshipsForEntity: mock(async () => []),
    });
    const ctx = createMockToolContext({ getGraphStorage: async () => storage as any });
    const handler = new RenameSymbolToolHandler(ctx);
    const result = await handler.handle({ entityId: "e1", newName: "NewName", preview: true });
    const data = parseJsonResult(result);

    expect(data.preview).toBe(true);
    expect(data.entity.name).toBe("OldName");
    expect(data.newName).toBe("NewName");
  });
});

// ─── AddMember ────────────────────────────────────────────────────

describe("AddMemberToolHandler", () => {
  it("returns error when target entity not found", async () => {
    const storage = createMockGraphStorage({
      getEntity: mock(async () => null),
      findEntities: mock(async () => []),
    });
    const ctx = createMockToolContext({ getGraphStorage: async () => storage as any });
    const handler = new AddMemberToolHandler(ctx);
    const result = await handler.handle({ targetEntityName: "NotFound", memberCode: "method() {}" });
    const data = parseJsonResult(result);

    expect(data.error).toContain("not found");
  });

  it("returns error for invalid entity type", async () => {
    const entity = { id: "e1", name: "fn", type: "function", filePath: "/a.ts" };
    const storage = createMockGraphStorage({
      getEntity: mock(async () => entity),
      findEntities: mock(async () => [entity]),
    });
    const ctx = createMockToolContext({ getGraphStorage: async () => storage as any });
    const handler = new AddMemberToolHandler(ctx);
    const result = await handler.handle({ targetEntityId: "e1", memberCode: "method() {}" });
    const data = parseJsonResult(result);

    expect(data.error).toContain("Invalid target type");
  });

  it("returns preview info for valid class target", async () => {
    const entity = {
      id: "e1",
      name: "MyClass",
      type: "class",
      filePath: "/a.ts",
      location: { start: { line: 1 }, end: { line: 20 } },
    };
    const storage = createMockGraphStorage({
      getEntity: mock(async () => entity),
      findEntities: mock(async () => [entity]),
    });
    const ctx = createMockToolContext({ getGraphStorage: async () => storage as any });
    const handler = new AddMemberToolHandler(ctx);
    const result = await handler.handle({ targetEntityId: "e1", memberCode: "newMethod() {}", preview: true });
    const data = parseJsonResult(result);

    expect(data.preview).toBe(true);
    expect(data.target.name).toBe("MyClass");
  });
});
