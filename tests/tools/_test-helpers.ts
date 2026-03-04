/**
 * Shared mock factories for MCP tool handler tests.
 *
 * Provides createMock* helpers so each test file can build a
 * fully-mocked ToolContext in one line without real storage,
 * embedding, or conductor dependencies.
 */

import { mock } from "bun:test";
import type { ToolContext, ToolResult } from "../../src/tools/base-tool-handler.js";

// ─── GraphStorage ─────────────────────────────────────────────────
export function createMockGraphStorage(overrides: Record<string, unknown> = {}) {
  return {
    findEntities: mock(async () => []),
    searchEntities: mock(async () => []),
    getRelationshipsForEntity: mock(async () => []),
    findRelationships: mock(async () => []),
    getStatistics: mock(async () => ({
      totalEntities: 0,
      totalRelationships: 0,
      totalFiles: 0,
    })),
    getAllEntities: mock(async () => []),
    getAllRelationships: mock(async () => []),
    getEntity: mock(async () => null),
    updateEntity: mock(async () => {}),
    deleteEntity: mock(async () => {}),
    getEntityIdsByFilePath: mock(async () => []),
    clear: mock(async () => {}),
    setProject: mock(() => {}),
    ...overrides,
  };
}

// ─── SemanticAgent ────────────────────────────────────────────────
export function createMockSemanticAgent(overrides: Record<string, unknown> = {}) {
  return {
    semanticSearch: mock(async () => ({ results: [], totalResults: 0 })),
    findSimilarCode: mock(async () => []),
    detectClones: mock(async () => []),
    crossLanguageSearch: mock(async () => []),
    getVectorStore: mock(() => ({
      getProjectContext: () => null,
      clear: mock(async () => {}),
    })),
    getEmbeddingInitError: mock(() => null),
    getEmbeddingProvider: mock(() => null),
    reinitializeForProject: mock(async () => {}),
    ...overrides,
  };
}

// ─── BranchManager ────────────────────────────────────────────────
export function createMockBranchManager(overrides: Record<string, unknown> = {}) {
  return {
    getActiveBranches: mock(() => []),
    getCurrentBranch: mock(() => "main"),
    switchBranch: mock(async () => {}),
    getBranchMetadata: mock(() => null),
    getBranchDbPath: mock(() => "/tmp/branch.db"),
    hasBranchDatabase: mock(() => false),
    cleanupOldBranches: mock(async () => 0),
    ...overrides,
  };
}

// ─── VersionManager (Snapshot) ────────────────────────────────────
export function createMockSnapshotManager(overrides: Record<string, unknown> = {}) {
  return {
    createSnapshot: mock(async () => "snap-001"),
    rollback: mock(async () => {}),
    listSnapshots: mock(async () => []),
    deleteSnapshot: mock(async () => {}),
    ...overrides,
  };
}

// ─── ConductorOrchestrator ────────────────────────────────────────
export function createMockConductor(overrides: Record<string, unknown> = {}) {
  return {
    getAllAgentMetrics: mock(() => ({})),
    getAgentByType: mock(() => null),
    initialize: mock(async () => {}),
    ...overrides,
  };
}

// ─── KnowledgeBus ─────────────────────────────────────────────────
export function createMockKnowledgeBus(overrides: Record<string, unknown> = {}) {
  return {
    getStats: mock(() => ({
      topicCount: 0,
      entryCount: 0,
      subscriptionCount: 0,
      messageQueueSize: 0,
    })),
    clearTopic: mock(async () => {}),
    getRecentMessages: mock(async () => []),
    ...overrides,
  };
}

// ─── ToolContext (composite) ──────────────────────────────────────
export function createMockToolContext(overrides: Partial<ToolContext> = {}): ToolContext {
  const storage = createMockGraphStorage();
  const semanticAgent = createMockSemanticAgent();
  const branchManager = createMockBranchManager();
  const snapshotManager = createMockSnapshotManager();
  const conductor = createMockConductor();
  const bus = createMockKnowledgeBus();

  return {
    requestId: "test-req-001",
    config: {},
    projectPath: "/tmp/test-project",
    getConductor: () => conductor as any,
    getGraphStorage: async () => storage as any,
    getSQLiteManager: () => null,
    getSemanticAgent: async () => semanticAgent as any,
    getBranchManager: async () => branchManager as any,
    getSnapshotManager: async () => snapshotManager as any,
    getKnowledgeBus: () => bus as any,
    normalizeInputPath: (p?: string) => p,
    withTimeout: async <T>(promise: Promise<T>) => promise,
    createAutoIndexContext: () => ({}) as any,
    ...overrides,
  };
}

// ─── Result helpers ───────────────────────────────────────────────

/** Extract parsed JSON from ToolResult */
export function parseJsonResult(result: ToolResult): any {
  const text = result.content[0]?.text;
  if (!text) throw new Error("ToolResult has no text content");
  return JSON.parse(text);
}

/** Assert result is successful JSON with success:true or no error field */
export function expectSuccess(result: ToolResult): any {
  const data = parseJsonResult(result);
  if ("success" in data) {
    if (data.success !== true) {
      throw new Error(`Expected success:true but got: ${JSON.stringify(data)}`);
    }
  }
  if (data.error) {
    throw new Error(`Expected success but got error: ${data.error}`);
  }
  return data;
}

/** Assert result contains an error */
export function expectError(result: ToolResult, msgSubstring?: string): any {
  const data = parseJsonResult(result);
  const hasError = data.error || data.success === false;
  if (!hasError) {
    throw new Error(`Expected error but got: ${JSON.stringify(data)}`);
  }
  if (msgSubstring && data.error && !data.error.includes(msgSubstring)) {
    throw new Error(`Expected error containing "${msgSubstring}" but got: ${data.error}`);
  }
  return data;
}
