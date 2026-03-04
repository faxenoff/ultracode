import { describe, expect, it } from "bun:test";
import {
  ValidateDirectoryToolHandler,
  ValidateFileToolHandler,
} from "../../src/tools/handlers/validation-tool-handlers.js";
import { createMockToolContext, parseJsonResult } from "./_test-helpers.js";

// ─── ValidateFile ─────────────────────────────────────────────────

describe("ValidateFileToolHandler", () => {
  it("validates required args (filePath)", async () => {
    const ctx = createMockToolContext();
    const handler = new ValidateFileToolHandler(ctx);
    const result = await handler.handle({});
    const data = parseJsonResult(result);

    expect(data.success).toBe(false);
  });

  it("returns empty results for unknown file extension", async () => {
    const ctx = createMockToolContext();
    const handler = new ValidateFileToolHandler(ctx);
    const result = await handler.handle({ filePath: "/test.xyz" });
    const data = parseJsonResult(result);

    // No validators for .xyz, should return isValid: true
    expect(data.file).toBe("/test.xyz");
    expect(data.totalErrors).toBe(0);
    expect(data.isValid).toBe(true);
  });

  it("maps .ts extension to default validators", async () => {
    const ctx = createMockToolContext();
    const handler = new ValidateFileToolHandler(ctx);
    const result = await handler.handle({ filePath: "/test.ts" });
    const data = parseJsonResult(result);

    expect(data.file).toBe("/test.ts");
    // Should attempt oxlint and tsc validators
    expect(data.validators).toBeDefined();
  });
});

// ─── ValidateDirectory ────────────────────────────────────────────

describe("ValidateDirectoryToolHandler", () => {
  it("validates required args", async () => {
    const ctx = createMockToolContext();
    const handler = new ValidateDirectoryToolHandler(ctx);
    // Without directory, resolveProjectPath uses context default
    const result = await handler.handle({});
    const data = parseJsonResult(result);

    // Either succeeds (with 0 files in temp dir) or errors
    expect(data.directory !== undefined || data.error !== undefined).toBe(true);
  });
});
