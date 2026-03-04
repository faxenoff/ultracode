import { describe, expect, it, mock } from "bun:test";
import {
  AutoDocDetectLanguageToolHandler,
  AutoDocInitToolHandler,
  AutoDocStatusToolHandler,
} from "../../src/tools/handlers/autodoc-tool-handlers.js";
import { createMockToolContext, parseJsonResult } from "./_test-helpers.js";

// AutoDoc handlers depend on ServiceContainer and AutoDocManager.
// We test the handlers that can work with minimal mocking.

describe("AutoDocInitToolHandler", () => {
  it("returns error when service container not available", async () => {
    const ctx = createMockToolContext({ getServiceContainer: undefined });
    const handler = new AutoDocInitToolHandler(ctx);
    const result = await handler.handle({});
    const data = parseJsonResult(result);

    // Should error about service container or manager
    expect(data.error !== undefined || data.success === false).toBe(true);
  });
});

describe("AutoDocStatusToolHandler", () => {
  it("returns error when service container not available", async () => {
    const ctx = createMockToolContext({ getServiceContainer: undefined });
    const handler = new AutoDocStatusToolHandler(ctx);
    const result = await handler.handle({});
    const data = parseJsonResult(result);

    expect(data.error !== undefined || data.success === false).toBe(true);
  });
});

describe("AutoDocDetectLanguageToolHandler", () => {
  it("returns result when service container not available", async () => {
    const ctx = createMockToolContext({ getServiceContainer: undefined });
    const handler = new AutoDocDetectLanguageToolHandler(ctx);
    const result = await handler.handle({});
    const data = parseJsonResult(result);

    // DetectLanguage works without service container (defaults to 'en')
    expect(data).toBeDefined();
    expect(data.detectedLanguage).toBeDefined();
  });
});
