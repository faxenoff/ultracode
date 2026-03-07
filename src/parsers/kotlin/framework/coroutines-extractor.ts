/**
 * Kotlin Coroutines Framework Extractor
 *
 * Extracts Kotlin Coroutines patterns from code.
 * Handles: suspend functions, Flow, launch, async, withContext,
 *          coroutine scopes, dispatchers, etc.
 *
 * Key features:
 * - Detects suspend functions
 * - Extracts Flow operators and transformations
 * - Identifies coroutine builders (launch, async, runBlocking)
 * - Extracts dispatcher usage
 * - Detects structured concurrency patterns
 */

import type { EntityRelationship, ParsedEntity } from "../../../types/parser.js";
import type { CoroutineInfo } from "../types.js";

// =============================================================================
// COROUTINE PATTERNS
// =============================================================================

/**
 * Coroutine builders
 */
const COROUTINE_BUILDERS = new Map<string, string>([
  ["launch", "launch"],
  ["async", "async"],
  ["runBlocking", "runBlocking"],
  ["withContext", "withContext"],
  ["coroutineScope", "coroutineScope"],
  ["supervisorScope", "supervisorScope"],
]);

/**
 * Flow operators
 */
export const FLOW_OPERATORS = new Set([
  // Creation
  "flow",
  "flowOf",
  "asFlow",
  "callbackFlow",
  "channelFlow",
  // Intermediate
  "map",
  "filter",
  "transform",
  "take",
  "drop",
  "distinctUntilChanged",
  "debounce",
  "sample",
  "flatMapConcat",
  "flatMapMerge",
  "flatMapLatest",
  "combine",
  "zip",
  "onEach",
  "onStart",
  "onCompletion",
  "catch",
  "retry",
  "retryWhen",
  "buffer",
  "conflate",
  "flowOn",
  // Terminal
  "collect",
  "collectLatest",
  "first",
  "firstOrNull",
  "single",
  "singleOrNull",
  "toList",
  "toSet",
  "reduce",
  "fold",
  "launchIn",
]);

/**
 * Coroutine dispatchers
 */
const DISPATCHERS = new Set([
  "Dispatchers.Main",
  "Dispatchers.IO",
  "Dispatchers.Default",
  "Dispatchers.Unconfined",
  "Main",
  "IO",
  "Default",
  "Unconfined",
]);

/**
 * Coroutine scopes
 */
const COROUTINE_SCOPES = new Set([
  "CoroutineScope",
  "GlobalScope",
  "MainScope",
  "viewModelScope",
  "lifecycleScope",
  "rememberCoroutineScope",
]);

// =============================================================================
// DETECTION FUNCTIONS
// =============================================================================

/**
 * Check if code contains Coroutines imports
 */
export function detectCoroutinesFramework(code: string): boolean {
  const coroutinePatterns = [
    /import\s+kotlinx\.coroutines\./,
    /\bsuspend\s+fun\b/,
    /\bFlow<[^>]+>/,
    /\b(launch|async|runBlocking)\s*\{/,
    /\bwithContext\s*\(/,
  ];

  return coroutinePatterns.some((pattern) => pattern.test(code));
}

/**
 * Detect Coroutines framework confidence level
 */
export function getCoroutinesConfidence(code: string): number {
  let confidence = 0;

  if (/import\s+kotlinx\.coroutines\./.test(code)) confidence += 0.4;
  if (/\bsuspend\s+fun\b/.test(code)) confidence += 0.3;
  if (/\bFlow<[^>]+>/.test(code)) confidence += 0.2;
  if (/\b(launch|async)\s*\{/.test(code)) confidence += 0.1;

  return Math.min(confidence, 1.0);
}

// =============================================================================
// SUSPEND FUNCTION EXTRACTION
// =============================================================================

/**
 * Check if function is a suspend function
 */
export function isSuspendFunction(entity: ParsedEntity): boolean {
  return entity.modifiers?.includes("suspend") || false;
}

/**
 * Extract suspend function information
 */
export function extractSuspendFunctionInfo(entity: ParsedEntity, code: string): CoroutineInfo | undefined {
  if (!isSuspendFunction(entity)) return undefined;

  const info: CoroutineInfo = {
    isSuspend: true,
  };

  // Check coroutine builders
  if (/\blaunch\s*[{(]/.test(code)) info.hasLaunch = true;
  if (/\basync\s*[{(]/.test(code)) info.hasAsync = true;
  if (/\bwithContext\s*[{(]/.test(code)) info.hasWithContext = true;
  if (/Flow<|\.flow\s*\{/.test(code)) info.hasFlow = true;

  // Extract first dispatcher used
  for (const dispatcher of DISPATCHERS) {
    if (code.includes(dispatcher)) {
      info.dispatcherUsed = dispatcher;
      break;
    }
  }

  // Detect scope type
  for (const scope of COROUTINE_SCOPES) {
    if (code.includes(scope)) {
      if (scope === "GlobalScope") info.scopeType = "GlobalScope";
      else if (scope === "viewModelScope") info.scopeType = "viewModelScope";
      else if (scope === "lifecycleScope") info.scopeType = "lifecycleScope";
      else if (scope === "CoroutineScope") info.scopeType = "CoroutineScope";
      else info.scopeType = "other";
      break;
    }
  }

  return info;
}

// =============================================================================
// FLOW EXTRACTION
// =============================================================================

/**
 * Extract Flow property information
 */
export function extractFlowInfo(entity: ParsedEntity):
  | {
      isFlow: boolean;
      flowType?: string;
      isCold?: boolean;
      isHot?: boolean;
    }
  | undefined {
  if (entity.type !== "property") return undefined;

  const propertyType = (entity.metadata as any)?.propertyType || "";

  // Check for Flow types
  if (!propertyType.includes("Flow")) return undefined;

  const isStateFlow = propertyType.includes("StateFlow");
  const isSharedFlow = propertyType.includes("SharedFlow");
  const isColdFlow = propertyType.startsWith("Flow<") && !isStateFlow && !isSharedFlow;

  return {
    isFlow: true,
    flowType: isStateFlow ? "StateFlow" : isSharedFlow ? "SharedFlow" : "Flow",
    isCold: isColdFlow,
    isHot: isStateFlow || isSharedFlow,
  };
}

/**
 * Extract Flow operators chain from code
 */
export function extractFlowOperatorChain(code: string): string[] {
  const operators: string[] = [];

  // Match flow operator chains like .map { }.filter { }.collect { }
  const chainPattern =
    /\.(map|filter|transform|take|drop|distinctUntilChanged|debounce|sample|flatMapConcat|flatMapMerge|flatMapLatest|combine|zip|onEach|onStart|onCompletion|catch|retry|retryWhen|buffer|conflate|flowOn|collect|collectLatest|first|firstOrNull|single|singleOrNull|toList|toSet|reduce|fold|launchIn)\s*[{(]/g;

  let match: RegExpExecArray | null;
  while ((match = chainPattern.exec(code)) !== null) {
    if (match[1]) operators.push(match[1]);
  }

  return operators;
}

// =============================================================================
// COROUTINE SCOPE EXTRACTION
// =============================================================================

/**
 * Extract coroutine scope information
 */
export function extractCoroutineScopeInfo(
  _entity: ParsedEntity,
  code: string,
): {
  scope?: string | undefined;
  hasStructuredConcurrency: boolean;
  hasJobCancellation: boolean;
} {
  const result: { scope?: string | undefined; hasStructuredConcurrency: boolean; hasJobCancellation: boolean } = {
    hasStructuredConcurrency: false,
    hasJobCancellation: false,
  };

  // Detect scope usage
  for (const scope of COROUTINE_SCOPES) {
    if (code.includes(scope)) {
      result.scope = scope;
      break;
    }
  }

  // Check for structured concurrency patterns
  if (/coroutineScope\s*\{/.test(code) || /supervisorScope\s*\{/.test(code)) {
    result.hasStructuredConcurrency = true;
  }

  // Check for job cancellation
  if (/\.cancel\s*\(/.test(code) || /\.cancelAndJoin\s*\(/.test(code)) {
    result.hasJobCancellation = true;
  }

  return result;
}

// =============================================================================
// ENTITY ENRICHMENT
// =============================================================================

/**
 * Enrich parsed entity with Coroutines information
 */
export function enrichEntityWithCoroutines(
  entity: ParsedEntity,
  code: string,
): {
  entity: ParsedEntity;
  relationships: EntityRelationship[];
} {
  const relationships: EntityRelationship[] = [];

  // Check for suspend functions
  if (entity.type === "function" && isSuspendFunction(entity)) {
    const coroutineInfo = extractSuspendFunctionInfo(entity, code);

    if (coroutineInfo) {
      entity.metadata = {
        ...entity.metadata,
        coroutines: coroutineInfo,
      };

      // Add relationship for dispatcher if used
      if (coroutineInfo.dispatcherUsed) {
        relationships.push({
          from: entity.name,
          to: coroutineInfo.dispatcherUsed,
          type: "references",
          metadata: {
            usageType: "dispatcher",
          },
        });
      }
    }
  }

  // Check for Flow properties
  if (entity.type === "property") {
    const flowInfo = extractFlowInfo(entity);

    if (flowInfo) {
      entity.metadata = {
        ...entity.metadata,
        coroutines: {
          isFlow: true,
          flowType: flowInfo.flowType,
          isColdFlow: flowInfo.isCold,
          isHotFlow: flowInfo.isHot,
        },
      };
    }
  }

  return { entity, relationships };
}

// =============================================================================
// CHANNEL EXTRACTION
// =============================================================================

/**
 * Extract Channel usage information
 */
export function extractChannelInfo(code: string): {
  hasChannel: boolean;
  channelTypes: string[];
  operations: string[];
} {
  const result = {
    hasChannel: false,
    channelTypes: [] as string[],
    operations: [] as string[],
  };

  // Check for Channel types
  const channelTypes = ["Channel", "BroadcastChannel", "ConflatedBroadcastChannel"];
  for (const type of channelTypes) {
    if (code.includes(type)) {
      result.hasChannel = true;
      result.channelTypes.push(type);
    }
  }

  // Check for channel operations
  const operations = ["send", "receive", "trySend", "tryReceive", "close", "offer", "poll"];
  for (const op of operations) {
    const opPattern = new RegExp(`\\.${op}\\s*\\(`, "g");
    if (opPattern.test(code)) {
      result.operations.push(op);
    }
  }

  return result;
}

// =============================================================================
// EXCEPTION HANDLING EXTRACTION
// =============================================================================

/**
 * Extract coroutine exception handling patterns
 */
export function extractCoroutineExceptionHandling(code: string): {
  hasExceptionHandler: boolean;
  hasSupervisorJob: boolean;
  hasCatchOperator: boolean;
} {
  return {
    hasExceptionHandler: /CoroutineExceptionHandler/.test(code),
    hasSupervisorJob: /SupervisorJob/.test(code) || /supervisorScope/.test(code),
    hasCatchOperator: /\.catch\s*\{/.test(code),
  };
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get coroutine complexity score
 */
export function getCoroutineComplexityScore(code: string): number {
  let score = 0;

  // Count coroutine builders
  const builders = [...COROUTINE_BUILDERS.keys()];
  for (const builder of builders) {
    const matches = code.match(new RegExp(`\\b${builder}\\s*\\{`, "g"));
    if (matches) {
      score += matches.length;
    }
  }

  // Count Flow operators
  const operators = extractFlowOperatorChain(code);
  score += operators.length * 0.5;

  // Check for nested coroutines
  if (/launch\s*\{[\s\S]*launch\s*\{/.test(code) || /async\s*\{[\s\S]*async\s*\{/.test(code)) {
    score += 2;
  }

  return score;
}

/**
 * Check if code uses structured concurrency properly
 */
export function usesStructuredConcurrency(code: string): boolean {
  // Good: coroutineScope, supervisorScope, viewModelScope, lifecycleScope
  const goodPatterns = /\b(coroutineScope|supervisorScope|viewModelScope|lifecycleScope)\s*[{.]/.test(code);

  // Bad: GlobalScope
  const badPatterns = /GlobalScope\s*\./.test(code);

  return goodPatterns && !badPatterns;
}
