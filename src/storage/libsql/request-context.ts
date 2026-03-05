/**
 * Request-scoped Project Context via AsyncLocalStorage
 *
 * Solves the race condition where multiple MCP clients share a single
 * GraphStorage singleton. Without this, concurrent `setProject()` calls
 * from different clients overwrite each other's project context.
 *
 * Usage:
 * - Wrap tool execution in `runWithRequestContext(ctx, fn)`
 * - In EntityOperations/RelationshipOperations, `getContext()` delegate
 *   checks AsyncLocalStorage first, then falls back to adapter's currentContext
 */

import { AsyncLocalStorage } from "node:async_hooks";
import type { ProjectContext } from "./types.js";

const requestContextStorage = new AsyncLocalStorage<ProjectContext>();

/**
 * Run a function with a request-scoped project context.
 * All async operations within `fn` will see this context via `getRequestContext()`.
 */
export function runWithRequestContext<T>(ctx: ProjectContext, fn: () => T): T {
  return requestContextStorage.run(ctx, fn);
}

/**
 * Get the current request-scoped project context, if any.
 * Returns undefined if not running inside `runWithRequestContext`.
 */
export function getRequestContext(): ProjectContext | undefined {
  return requestContextStorage.getStore();
}
