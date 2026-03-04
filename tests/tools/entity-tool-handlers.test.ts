import { describe, expect, it, mock } from "bun:test";
import {
  ListEntityRelationshipsToolHandler,
  ListFileEntitiesToolHandler,
  QueryToolHandler,
} from "../../src/tools/handlers/entity-tool-handlers.js";
import { createMockGraphStorage, createMockToolContext, parseJsonResult } from "./_test-helpers.js";

// ─── ListFileEntities ─────────────────────────────────────────────

describe("ListFileEntitiesToolHandler", () => {
  it("returns entities for a file path", async () => {
    const storage = createMockGraphStorage({
      findEntities: mock(async () => [
        {
          id: "e1",
          name: "Foo",
          type: "class",
          location: { start: { line: 1 } },
          metadata: { signature: "class Foo" },
        },
        { id: "e2", name: "bar", type: "function", location: { start: { line: 10 } }, metadata: {} },
      ]),
    });
    const ctx = createMockToolContext({ getGraphStorage: async () => storage as any });
    const handler = new ListFileEntitiesToolHandler(ctx);
    const result = await handler.handle({ filePath: "src/foo.ts" });
    const data = parseJsonResult(result);

    expect(data.count).toBe(2);
    expect(data.entities).toHaveLength(2);
    expect(data.entities[0].name).toBe("Foo");
    expect(data.entities[0].type).toBe("class");
    expect(data.pagination).toBeDefined();
  });

  it("passes entityTypes filter to findEntities", async () => {
    const findEntities = mock(async () => []);
    const storage = createMockGraphStorage({ findEntities });
    const ctx = createMockToolContext({ getGraphStorage: async () => storage as any });
    const handler = new ListFileEntitiesToolHandler(ctx);
    await handler.handle({ filePath: "src/foo.ts", entityTypes: ["function"] });

    expect(findEntities).toHaveBeenCalled();
    const callArgs = findEntities.mock.calls[0]?.[0] as any;
    expect(callArgs.filters.entityType).toEqual(["function"]);
  });

  it("returns empty array when no entities found", async () => {
    const storage = createMockGraphStorage({ findEntities: mock(async () => []) });
    const ctx = createMockToolContext({ getGraphStorage: async () => storage as any });
    const handler = new ListFileEntitiesToolHandler(ctx);
    const result = await handler.handle({ filePath: "nonexistent.ts" });
    const data = parseJsonResult(result);

    expect(data.count).toBe(0);
    expect(data.entities).toHaveLength(0);
  });

  it("applies pagination with offset and limit", async () => {
    const entities = Array.from({ length: 20 }, (_, i) => ({
      id: `e${i}`,
      name: `Entity${i}`,
      type: "function",
      location: {},
      metadata: {},
    }));
    const storage = createMockGraphStorage({ findEntities: mock(async () => entities) });
    const ctx = createMockToolContext({ getGraphStorage: async () => storage as any });
    const handler = new ListFileEntitiesToolHandler(ctx);
    const result = await handler.handle({ filePath: "src/foo.ts", offset: 5, limit: 3 });
    const data = parseJsonResult(result);

    expect(data.count).toBe(3);
    expect(data.pagination.offset).toBe(5);
    expect(data.pagination.hasMore).toBe(true);
  });
});

// ─── ListEntityRelationships ──────────────────────────────────────

describe("ListEntityRelationshipsToolHandler", () => {
  it("returns relationships for entityId", async () => {
    const rels = [
      { fromId: "e1", toId: "e2", type: "calls" },
      { fromId: "e3", toId: "e1", type: "imports" },
    ];
    const storage = createMockGraphStorage({
      getRelationshipsForEntity: mock(async () => rels),
    });
    const ctx = createMockToolContext({ getGraphStorage: async () => storage as any });
    const handler = new ListEntityRelationshipsToolHandler(ctx);
    const result = await handler.handle({ entityId: "e1" });
    const data = parseJsonResult(result);

    expect(data.entityId).toBe("e1");
    expect(data.count).toBe(2);
    expect(data.relationships).toHaveLength(2);
  });

  it("resolves entityName to entityId", async () => {
    const storage = createMockGraphStorage({
      findEntities: mock(async () => [{ id: "e1", name: "MyClass" }]),
      getRelationshipsForEntity: mock(async () => []),
    });
    const ctx = createMockToolContext({ getGraphStorage: async () => storage as any });
    const handler = new ListEntityRelationshipsToolHandler(ctx);
    const result = await handler.handle({ entityName: "MyClass" });
    const data = parseJsonResult(result);

    expect(data.entityId).toBe("e1");
  });

  it("returns error when neither entityId nor entityName resolves", async () => {
    const storage = createMockGraphStorage({
      findEntities: mock(async () => []),
    });
    const ctx = createMockToolContext({ getGraphStorage: async () => storage as any });
    const handler = new ListEntityRelationshipsToolHandler(ctx);
    const result = await handler.handle({ entityName: "NotFound" });
    const data = parseJsonResult(result);

    expect(data.error).toContain("Entity not found");
  });

  it("filters by direction=outgoing", async () => {
    const rels = [
      { fromId: "e1", toId: "e2", type: "calls" },
      { fromId: "e3", toId: "e1", type: "imports" },
    ];
    const storage = createMockGraphStorage({
      getRelationshipsForEntity: mock(async () => rels),
    });
    const ctx = createMockToolContext({ getGraphStorage: async () => storage as any });
    const handler = new ListEntityRelationshipsToolHandler(ctx);
    const result = await handler.handle({ entityId: "e1", direction: "outgoing" });
    const data = parseJsonResult(result);

    expect(data.count).toBe(1);
    expect(data.relationships[0].fromId).toBe("e1");
  });

  it("filters by direction=incoming", async () => {
    const rels = [
      { fromId: "e1", toId: "e2", type: "calls" },
      { fromId: "e3", toId: "e1", type: "imports" },
    ];
    const storage = createMockGraphStorage({
      getRelationshipsForEntity: mock(async () => rels),
    });
    const ctx = createMockToolContext({ getGraphStorage: async () => storage as any });
    const handler = new ListEntityRelationshipsToolHandler(ctx);
    const result = await handler.handle({ entityId: "e1", direction: "incoming" });
    const data = parseJsonResult(result);

    expect(data.count).toBe(1);
    expect(data.relationships[0].toId).toBe("e1");
  });

  it("filters by relationshipTypes", async () => {
    const rels = [
      { fromId: "e1", toId: "e2", type: "calls" },
      { fromId: "e1", toId: "e3", type: "imports" },
    ];
    const storage = createMockGraphStorage({
      getRelationshipsForEntity: mock(async () => rels),
    });
    const ctx = createMockToolContext({ getGraphStorage: async () => storage as any });
    const handler = new ListEntityRelationshipsToolHandler(ctx);
    const result = await handler.handle({ entityId: "e1", relationshipTypes: ["calls"] });
    const data = parseJsonResult(result);

    expect(data.count).toBe(1);
    expect(data.relationships[0].type).toBe("calls");
  });
});

// ─── Query ────────────────────────────────────────────────────────

describe("QueryToolHandler", () => {
  it("searches both entities and relationships with type=both", async () => {
    const storage = createMockGraphStorage({
      searchEntities: mock(async () => [{ id: "e1", name: "Foo" }]),
      findRelationships: mock(async () => [{ fromId: "e1", toId: "e2", type: "calls" }]),
    });
    const ctx = createMockToolContext({ getGraphStorage: async () => storage as any });
    const handler = new QueryToolHandler(ctx);
    const result = await handler.handle({ query: "Foo", type: "both" });
    const data = parseJsonResult(result);

    expect(data.entitiesFound).toBe(1);
    expect(data.relationshipsFound).toBe(1);
  });

  it("searches only entities with type=entities", async () => {
    const searchEntities = mock(async () => []);
    const findRelationships = mock(async () => []);
    const storage = createMockGraphStorage({ searchEntities, findRelationships });
    const ctx = createMockToolContext({ getGraphStorage: async () => storage as any });
    const handler = new QueryToolHandler(ctx);
    await handler.handle({ query: "Foo", type: "entities" });

    expect(searchEntities).toHaveBeenCalled();
    expect(findRelationships).not.toHaveBeenCalled();
  });

  it("searches only relationships with type=relationships", async () => {
    const searchEntities = mock(async () => []);
    const findRelationships = mock(async () => []);
    const storage = createMockGraphStorage({ searchEntities, findRelationships });
    const ctx = createMockToolContext({ getGraphStorage: async () => storage as any });
    const handler = new QueryToolHandler(ctx);
    await handler.handle({ query: "Foo", type: "relationships" });

    expect(searchEntities).not.toHaveBeenCalled();
    expect(findRelationships).toHaveBeenCalled();
  });

  it("applies pagination", async () => {
    const entities = Array.from({ length: 100 }, (_, i) => ({ id: `e${i}`, name: `E${i}` }));
    const storage = createMockGraphStorage({
      searchEntities: mock(async () => entities),
      findRelationships: mock(async () => []),
    });
    const ctx = createMockToolContext({ getGraphStorage: async () => storage as any });
    const handler = new QueryToolHandler(ctx);
    const result = await handler.handle({ query: "E", type: "both", offset: 10, limit: 5 });
    const data = parseJsonResult(result);

    expect(data.pagination.entities.offset).toBe(10);
    expect(data.pagination.entities.limit).toBe(5);
    expect(data.pagination.entities.hasMore).toBe(true);
  });
});
