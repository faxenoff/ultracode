/**
 * Common Custom Detectors — Universal detectors for all languages
 */

import type { Entity } from "../../../types/storage.js";
import type { CustomDetectorResult } from "../types.js";

/**
 * God function: cyclomatic > 20 OR LOC > 200 (disjunction — either triggers)
 */
export function checkGodFunction(entity: Entity): CustomDetectorResult {
  // Skip partial methods — source-generated code (e.g. [LoggerMessage])
  const mods = (entity.metadata?.modifiers ?? []) as string[];
  if (mods.includes("partial")) return { match: false, confidence: 0 };

  const metrics = entity.metadata?.["metrics"] as { cyclomaticComplexity?: number; linesOfCode?: number } | undefined;

  const cyclomatic = metrics?.cyclomaticComplexity ?? 0;
  const loc = metrics?.linesOfCode ?? 0;
  const matched: string[] = [];

  if (cyclomatic > 20) matched.push(`cyclomatic=${cyclomatic}`);
  if (loc > 200) matched.push(`LOC=${loc}`);

  if (matched.length === 0) return { match: false, confidence: 0 };

  // Higher confidence for both criteria met
  const confidence = matched.length === 2 ? 0.95 : 0.8;
  return { match: true, confidence, matchedCriteria: matched };
}

/**
 * Deep nesting: nestingDepth > 5
 */
export function checkDeepNesting(entity: Entity): CustomDetectorResult {
  const metrics = entity.metadata?.["metrics"] as { nestingDepth?: number } | undefined;
  const depth = metrics?.nestingDepth ?? 0;

  if (depth <= 5) return { match: false, confidence: 0 };

  return {
    match: true,
    confidence: Math.min(0.5 + (depth - 5) * 0.1, 1.0),
    matchedCriteria: [`nestingDepth=${depth}`],
  };
}

/**
 * Too many parameters: > 7
 * Skips DI constructors: constructor modifier or most params are interface types (I[A-Z]...)
 */
export function checkTooManyParams(entity: Entity): CustomDetectorResult {
  const params = (entity.metadata?.parameters as Array<{ name?: string; type?: string }>) ?? [];
  if (params.length <= 7) return { match: false, confidence: 0 };

  const mods = (entity.metadata?.modifiers ?? []) as string[];

  // Skip constructors — DI constructors with many deps are standard in ASP.NET
  // Skip partial methods — source-generated (e.g. [LoggerMessage])
  if (mods.includes("constructor") || mods.includes("partial")) {
    return { match: false, confidence: 0 };
  }

  // Skip DI-style functions: ≥70% of params are interface types (IService, ILogger, etc.)
  const interfaceParams = params.filter((p) => p.type && /^I[A-Z]/.test(p.type)).length;
  if (params.length > 0 && interfaceParams / params.length >= 0.7) {
    return { match: false, confidence: 0 };
  }

  return {
    match: true,
    confidence: Math.min(0.6 + (params.length - 7) * 0.05, 1.0),
    matchedCriteria: [`paramCount=${params.length}`],
  };
}

/**
 * No documentation on public entity
 */
export function checkNoDocumentation(entity: Entity): CustomDetectorResult {
  const mods = (entity.metadata?.modifiers ?? []) as string[];
  const isPublic = mods.includes("public") || mods.includes("export") || mods.includes("exported");

  if (!isPublic) return { match: false, confidence: 0 };

  // Skip partial methods — source-generated, docs are pointless
  if (mods.includes("partial")) return { match: false, confidence: 0 };

  // Check for docs in metadata
  const signature = entity.metadata?.signature as string | undefined;
  const hasJsdoc = signature?.includes("/**") ?? false;
  const hasDocstring = entity.metadata?.["documentation"] != null || entity.metadata?.["description"] != null;

  if (hasJsdoc || hasDocstring) return { match: false, confidence: 0 };

  return {
    match: true,
    confidence: 0.7,
    matchedCriteria: ["public-no-docs"],
  };
}

/**
 * Small focused function: LOC < 30, cyclomatic < 5 (best-pattern)
 */
export function checkSmallFocusedFunction(entity: Entity): CustomDetectorResult {
  const metrics = entity.metadata?.["metrics"] as { cyclomaticComplexity?: number; linesOfCode?: number } | undefined;

  const cyclomatic = metrics?.cyclomaticComplexity ?? 0;
  const loc = metrics?.linesOfCode ?? 0;

  // Must have some code to be meaningful
  if (loc < 3) return { match: false, confidence: 0 };

  const matched: string[] = [];
  if (loc <= 30) matched.push(`LOC=${loc}`);
  if (cyclomatic <= 5) matched.push(`cyclomatic=${cyclomatic}`);

  if (matched.length < 2) return { match: false, confidence: 0 };

  return { match: true, confidence: 0.85, matchedCriteria: matched };
}

/**
 * Large class: LOC > 500 AND methods > 20
 */
export function checkLargeClass(entity: Entity): CustomDetectorResult {
  if (entity.type !== "class") return { match: false, confidence: 0 };

  const metrics = entity.metadata?.["metrics"] as { linesOfCode?: number } | undefined;
  const loc = metrics?.linesOfCode ?? 0;

  // We can approximate method count from metadata
  const methodCount = (entity.metadata?.["metrics"] as { methodCount?: number } | undefined)?.methodCount ?? 0;

  const matched: string[] = [];
  if (loc > 500) matched.push(`LOC=${loc}`);
  if (methodCount > 20) matched.push(`methods=${methodCount}`);

  if (loc <= 500) return { match: false, confidence: 0 };

  // LOC alone is a strong signal for large class
  return {
    match: true,
    confidence: matched.length === 2 ? 0.9 : 0.7,
    matchedCriteria: matched,
  };
}
