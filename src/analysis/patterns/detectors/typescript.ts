/**
 * TypeScript-specific Custom Detectors
 */

import type { Entity } from "../../../types/storage.js";
import type { CustomDetectorResult } from "../types.js";

/**
 * Async void function — exceptions will crash the process
 */
export function checkAsyncVoid(entity: Entity): CustomDetectorResult {
  const mods = entity.metadata?.modifiers ?? [];
  const returnType = entity.metadata?.returnType as string | undefined;

  const isAsync = mods.includes("async");
  const isVoid = returnType === "void" || returnType === "undefined" || returnType == null;

  if (!isAsync || !isVoid) return { match: false, confidence: 0 };

  return {
    match: true,
    confidence: 0.95,
    matchedCriteria: ["async", "void-return"],
  };
}

/**
 * Empty catch block — swallows errors
 */
export function checkEmptyCatch(entity: Entity): CustomDetectorResult {
  const cf = entity.metadata?.["controlFlow"] as { exceptions?: Array<unknown> } | undefined;

  if (!cf?.exceptions?.length) return { match: false, confidence: 0 };

  // If entity has try-catch but very few statements after catch, it's suspicious
  // This is a heuristic — semantic validator refines it
  return {
    match: true,
    confidence: 0.6,
    matchedCriteria: ["has-try-catch"],
  };
}

/**
 * Nested callbacks: high nesting + no awaits (callback hell)
 */
export function checkNestedCallbacks(entity: Entity): CustomDetectorResult {
  const metrics = entity.metadata?.["metrics"] as { nestingDepth?: number } | undefined;
  const cf = entity.metadata?.["controlFlow"] as { awaits?: Array<unknown> } | undefined;

  const nesting = metrics?.nestingDepth ?? 0;
  const awaitsCount = cf?.awaits?.length ?? 0;

  if (nesting < 4 || awaitsCount > 0) return { match: false, confidence: 0 };

  return {
    match: true,
    confidence: Math.min(0.5 + (nesting - 4) * 0.1, 0.9),
    matchedCriteria: [`nesting=${nesting}`, "no-awaits"],
  };
}

/**
 * Promise without catch — unhandled rejection
 */
export function checkPromiseNoCatch(entity: Entity): CustomDetectorResult {
  const calls = entity.metadata?.["calls"] as Array<{ name?: string; target?: string }> | undefined;
  if (!calls) return { match: false, confidence: 0 };

  const hasPromise = calls.some(
    (c) => c.name === "then" || c.target?.includes("Promise") || c.name?.includes("promise"),
  );
  const hasCatch = calls.some((c) => c.name === "catch");
  const cf = entity.metadata?.["controlFlow"] as { exceptions?: Array<unknown> } | undefined;
  const hasTryCatch = (cf?.exceptions?.length ?? 0) > 0;

  if (!hasPromise || hasCatch || hasTryCatch) return { match: false, confidence: 0 };

  return {
    match: true,
    confidence: 0.7,
    matchedCriteria: ["promise-no-catch"],
  };
}

/**
 * Any type in parameters — losing type safety
 */
export function checkAnyTypeParam(entity: Entity): CustomDetectorResult {
  const params = (entity.metadata?.parameters ?? []) as Array<{ type?: string }>;
  const anyParams = params.filter((p) => p.type === "any");

  if (anyParams.length === 0) return { match: false, confidence: 0 };

  return {
    match: true,
    confidence: 0.8,
    matchedCriteria: [`any-params=${anyParams.length}`],
  };
}

// ─── JIT Optimization Detectors ─────────────────────────────────────

/**
 * Holey array via new Array(n) — HOLEY element kind never becomes PACKED
 */
export function checkHoleyArray(entity: Entity): CustomDetectorResult {
  // Reads jitHints, not calls[]: `isNew`/`argumentCount` are only emitted by the
  // Java/Kotlin extractors, so keying off them meant this rule could never fire
  // on TypeScript — the language it is registered for.
  const jitHints = entity.metadata?.["jitHints"] as { holeyArrayCount?: number } | undefined;
  if (!jitHints?.holeyArrayCount) return { match: false, confidence: 0 };

  return {
    match: true,
    confidence: 0.9,
    matchedCriteria: [`new-Array(n)-holey=${jitHints.holeyArrayCount}`],
  };
}

/**
 * delete on an object property — moves it to dictionary mode for good
 */
export function checkDeleteOperator(entity: Entity): CustomDetectorResult {
  const jitHints = entity.metadata?.["jitHints"] as { deleteCount?: number; hasLoops?: boolean } | undefined;
  if (!jitHints?.deleteCount) return { match: false, confidence: 0 };

  // In a loop the object is rebuilt as a dictionary over and over
  const inLoop = jitHints.hasLoops === true;
  return {
    match: true,
    confidence: inLoop ? 0.95 : 0.85,
    matchedCriteria: [`delete-count=${jitHints.deleteCount}`, ...(inLoop ? ["in-loop"] : [])],
  };
}

/**
 * Object literals of several different shapes built in one function —
 * the reads downstream go polymorphic and then megamorphic
 */
export function checkShapeDivergence(entity: Entity): CustomDetectorResult {
  const jitHints = entity.metadata?.["jitHints"] as
    | { objectShapeVariants?: number; conditionalFieldAddCount?: number; hasLoops?: boolean }
    | undefined;
  if (!jitHints) return { match: false, confidence: 0 };

  const variants = jitHints.objectShapeVariants ?? 0;
  const conditional = jitHints.conditionalFieldAddCount ?? 0;
  // V8 keeps a polymorphic inline cache up to 4 shapes; past that a call site
  // falls back to the generic hash lookup.
  const megamorphic = variants > 4;
  if (!megamorphic && conditional === 0) return { match: false, confidence: 0 };

  const criteria: string[] = [];
  if (megamorphic) criteria.push(`object-shapes=${variants}`);
  if (conditional > 0) criteria.push(`conditional-field-adds=${conditional}`);
  if (jitHints.hasLoops) criteria.push("in-loop");

  const confidence = megamorphic ? (jitHints.hasLoops ? 0.8 : 0.7) : conditional >= 3 ? 0.6 : 0.5;
  return { match: true, confidence, matchedCriteria: criteria };
}

/**
 * Excessive optional chaining — polymorphic IC at each ?. access
 */
export function checkExcessiveOptionalChaining(entity: Entity): CustomDetectorResult {
  const calls = entity.metadata?.["calls"] as Array<{ isOptional?: boolean }> | undefined;
  if (!calls) return { match: false, confidence: 0 };

  const optionalCount = calls.filter((c) => c.isOptional === true).length;
  if (optionalCount < 4) return { match: false, confidence: 0 };

  return {
    match: true,
    confidence: Math.min(0.5 + optionalCount * 0.05, 0.85),
    matchedCriteria: [`optional-chaining=${optionalCount}`],
  };
}

/**
 * Spread operator in hot path — creates new objects/arrays every iteration
 */
export function checkSpreadInHotPath(entity: Entity): CustomDetectorResult {
  const jitHints = entity.metadata?.["jitHints"] as
    | {
        spreadInCallCount?: number;
      }
    | undefined;
  // Require 4+ spread operations to filter out trivial [...path, name] patterns
  if (!jitHints || !jitHints.spreadInCallCount || jitHints.spreadInCallCount < 4) {
    return { match: false, confidence: 0 };
  }

  const cf = entity.metadata?.["controlFlow"] as { loops?: Array<unknown> } | undefined;
  const metrics = entity.metadata?.["metrics"] as { linesOfCode?: number } | undefined;
  const hasLoop = (cf?.loops?.length ?? 0) > 0;
  const isLargeFunction = (metrics?.linesOfCode ?? 0) > 50;

  if (!hasLoop && !isLargeFunction) return { match: false, confidence: 0 };

  return {
    match: true,
    confidence: hasLoop ? 0.75 : 0.6,
    matchedCriteria: [`spread-count=${jitHints.spreadInCallCount}`, hasLoop ? "in-loop" : "large-function"],
  };
}

/**
 * Dynamic property access in loop — megamorphic IC
 */
export function checkDynamicPropertyInLoop(entity: Entity): CustomDetectorResult {
  const jitHints = entity.metadata?.["jitHints"] as
    | {
        dynamicPropAccessCount?: number;
      }
    | undefined;
  // Require 5+ dynamic accesses — filters out normal arr[i] indexing
  if (!jitHints || !jitHints.dynamicPropAccessCount || jitHints.dynamicPropAccessCount < 5) {
    return { match: false, confidence: 0 };
  }

  const cf = entity.metadata?.["controlFlow"] as { loops?: Array<unknown> } | undefined;
  if (!cf?.loops?.length) return { match: false, confidence: 0 };

  return {
    match: true,
    confidence: 0.7,
    matchedCriteria: [`dynamic-prop-access=${jitHints.dynamicPropAccessCount}`, "in-loop"],
  };
}

// ─── Antipattern Detectors (Phase 1: Pure Metadata) ─────────────────

/**
 * TS-024: Boolean trap — 2+ boolean params make call sites unreadable
 */
export function checkBooleanTrap(entity: Entity): CustomDetectorResult {
  const params = (entity.metadata?.parameters ?? []) as Array<{ type?: string }>;
  const boolParams = params.filter((p) => p.type === "boolean");

  if (boolParams.length < 2) return { match: false, confidence: 0 };

  return {
    match: true,
    confidence: boolParams.length >= 3 ? 0.95 : 0.85,
    matchedCriteria: [`boolean-params=${boolParams.length}`],
  };
}

/**
 * TS-025: Inconsistent return type — union with 4+ members
 */
export function checkInconsistentReturn(entity: Entity): CustomDetectorResult {
  const returnType = entity.metadata?.returnType as string | undefined;
  if (!returnType) return { match: false, confidence: 0 };

  // Count union members by splitting on | (but not inside generics)
  const members = splitUnionType(returnType);
  if (members.length < 4) return { match: false, confidence: 0 };

  return {
    match: true,
    confidence: 0.7,
    matchedCriteria: [`union-members=${members.length}`],
  };
}

/**
 * TS-016: Async constructor — constructors cannot be async
 */
export function checkAsyncConstructor(entity: Entity): CustomDetectorResult {
  if (entity.name !== "constructor") return { match: false, confidence: 0 };

  const cf = entity.metadata?.["controlFlow"] as { awaits?: Array<unknown> } | undefined;
  const calls = entity.metadata?.["calls"] as Array<{ name?: string; isAwait?: boolean }> | undefined;

  const hasAwaits = (cf?.awaits?.length ?? 0) > 0;
  const hasAwaitCalls = calls?.some((c) => c.isAwait) ?? false;

  if (!hasAwaits && !hasAwaitCalls) return { match: false, confidence: 0 };

  return {
    match: true,
    confidence: 0.9,
    matchedCriteria: ["constructor-with-await"],
  };
}

/**
 * TS-021: Quadratic array operations — nested O(n) array methods
 */
export function checkQuadraticArrayOps(entity: Entity): CustomDetectorResult {
  const calls = entity.metadata?.["calls"] as Array<{ name?: string }> | undefined;
  const cf = entity.metadata?.["controlFlow"] as { loops?: Array<unknown> } | undefined;
  if (!calls) return { match: false, confidence: 0 };

  const callNames = calls.map((c) => c.name ?? "");
  const hasIteration = callNames.some((n) => /^(filter|map|forEach|reduce|flatMap|find|some|every)$/.test(n));
  const hasLookup = callNames.some((n) => /^(includes|indexOf|find|some|findIndex)$/.test(n));
  const hasLoop = (cf?.loops?.length ?? 0) > 0;

  if (!hasIteration || !hasLookup) return { match: false, confidence: 0 };
  if (!hasLoop && !callNames.some((n) => /^(filter|map|forEach|reduce|flatMap)$/.test(n))) {
    return { match: false, confidence: 0 };
  }

  return {
    match: true,
    confidence: 0.75,
    matchedCriteria: ["nested-array-ops"],
  };
}

/**
 * TS-020: Event listener leak — addEventListener without removeEventListener
 * Enhanced: higher confidence when closure captures outer scope data.
 *
 * Excludes bounded-lifetime objects where listeners die with the object:
 * - Child processes (spawn/exec/fork + aliases like spawnProcess) — die on exit
 * - File streams (createReadStream/createWriteStream + aliases) — die on EOF
 * - HTTP responses (httpsGet, http.get, http.request) — die on response end
 * - Workers (new Worker()) — die on worker termination
 */
const BOUNDED_LIFETIME_CALLS = /[Ss]pawn|[Ee]xec(?:File)?|[Ff]ork|[Cc]reate(Read|Write)Stream|^https?Get$|^Worker$/;
const HTTP_METHOD_NAME = /^(get|request)$/;
const HTTP_TARGET = /^(https?|nodeHttps?|http|res|response)$/i;

export function checkEventListenerLeak(entity: Entity): CustomDetectorResult {
  const calls = entity.metadata?.["calls"] as Array<{ name?: string; target?: string }> | undefined;
  if (!calls) return { match: false, confidence: 0 };

  const callNames = calls.map((c) => c.name ?? "");
  const hasAdd = callNames.some((n) => /^(addEventListener|on|subscribe|addListener)$/.test(n));
  const hasRemove = callNames.some((n) => /^(removeEventListener|off|unsubscribe|removeListener)$/.test(n));

  if (!hasAdd || hasRemove) return { match: false, confidence: 0 };

  // Bounded-lifetime: child processes, file streams, workers
  if (callNames.some((n) => BOUNDED_LIFETIME_CALLS.test(n))) return { match: false, confidence: 0 };

  // HTTP methods on http/https modules: nodeHttps.get(), http.request(), etc.
  if (calls.some((c) => HTTP_METHOD_NAME.test(c.name ?? "") && HTTP_TARGET.test(c.target ?? ""))) {
    return { match: false, confidence: 0 };
  }

  // Check closureHints — if inner function captures data, the leak is more severe
  const ch = getClosureHints(entity);
  const hasCapturedData = ch != null && (ch.capturedVarCount ?? 0) > 0;

  return {
    match: true,
    confidence: hasCapturedData ? 0.85 : 0.65,
    matchedCriteria: ["listener-no-cleanup", ...(hasCapturedData ? ["closure-captures-data"] : [])],
  };
}

/**
 * TS-022: JSON.parse(JSON.stringify()) for deep clone
 */
export function checkJsonDeepClone(entity: Entity): CustomDetectorResult {
  const calls = entity.metadata?.["calls"] as Array<{ name?: string; target?: string }> | undefined;
  if (!calls) return { match: false, confidence: 0 };

  const hasParse = calls.some((c) => c.name === "parse" && c.target === "JSON");
  const hasStringify = calls.some((c) => c.name === "stringify" && c.target === "JSON");

  if (!hasParse || !hasStringify) return { match: false, confidence: 0 };

  return {
    match: true,
    confidence: 0.85,
    matchedCriteria: ["json-clone-pattern"],
  };
}

/**
 * TS-023: Accumulating spread in reduce — O(n²) copies
 */
export function checkAccumulatingSpread(entity: Entity): CustomDetectorResult {
  const calls = entity.metadata?.["calls"] as Array<{ name?: string }> | undefined;
  const jitHints = entity.metadata?.["jitHints"] as { spreadInCallCount?: number } | undefined;
  if (!calls) return { match: false, confidence: 0 };

  const hasReduce = calls.some((c) => c.name === "reduce");
  const hasSpread = (jitHints?.spreadInCallCount ?? 0) > 0;

  if (!hasReduce || !hasSpread) return { match: false, confidence: 0 };

  return {
    match: true,
    confidence: 0.8,
    matchedCriteria: ["reduce-with-spread"],
  };
}

// ─── Antipattern Detectors (Phase 2: AntipatternHints) ──────────────

type AntipatternHintsLike = {
  typeAssertionCount?: number;
  doubleAssertionCount?: number;
  nonNullAssertionCount?: number;
  throwNonErrorCount?: number;
  innerHtmlAssignCount?: number;
  orWithDefaultCount?: number;
  paramMutationCount?: number;
  regexLiterals?: string[];
};

function getAntipatternHints(entity: Entity): AntipatternHintsLike | null {
  return (entity.metadata?.["antipatternHints"] as AntipatternHintsLike) ?? null;
}

/**
 * TS-002: Unsafe type assertion — `as Type` bypasses type checking
 */
export function checkUnsafeTypeAssertion(entity: Entity): CustomDetectorResult {
  const hints = getAntipatternHints(entity);
  if (!hints || !hints.typeAssertionCount || hints.typeAssertionCount === 0) {
    return { match: false, confidence: 0 };
  }

  const hasDouble = (hints.doubleAssertionCount ?? 0) > 0;
  return {
    match: true,
    confidence: hasDouble ? 0.9 : 0.7,
    matchedCriteria: [
      `type-assertions=${hints.typeAssertionCount}`,
      ...(hasDouble ? [`double-assertions=${hints.doubleAssertionCount}`] : []),
    ],
  };
}

/**
 * TS-003: Non-null assertion abuse — 3+ uses of `!` operator
 */
export function checkNonNullAssertionAbuse(entity: Entity): CustomDetectorResult {
  const hints = getAntipatternHints(entity);
  if (!hints || !hints.nonNullAssertionCount || hints.nonNullAssertionCount < 3) {
    return { match: false, confidence: 0 };
  }

  return {
    match: true,
    confidence: Math.min(0.6 + hints.nonNullAssertionCount * 0.05, 0.9),
    matchedCriteria: [`non-null-assertions=${hints.nonNullAssertionCount}`],
  };
}

/**
 * TS-006: Nullish vs OR confusion — || with falsy defaults instead of ??
 */
export function checkNullishVsOrConfusion(entity: Entity): CustomDetectorResult {
  const hints = getAntipatternHints(entity);
  if (!hints || !hints.orWithDefaultCount || hints.orWithDefaultCount === 0) {
    return { match: false, confidence: 0 };
  }

  return {
    match: true,
    confidence: 0.75,
    matchedCriteria: [`or-with-default=${hints.orWithDefaultCount}`],
  };
}

/**
 * TS-011: Throw non-Error — throwing strings/objects loses stack trace
 */
export function checkThrowNonError(entity: Entity): CustomDetectorResult {
  const hints = getAntipatternHints(entity);
  if (!hints || !hints.throwNonErrorCount || hints.throwNonErrorCount === 0) {
    return { match: false, confidence: 0 };
  }

  return {
    match: true,
    confidence: 0.8,
    matchedCriteria: [`throw-non-error=${hints.throwNonErrorCount}`],
  };
}

/**
 * TS-017: Parameter mutation — modifying function arguments
 */
export function checkParameterMutation(entity: Entity): CustomDetectorResult {
  const hints = getAntipatternHints(entity);
  if (!hints || !hints.paramMutationCount || hints.paramMutationCount === 0) {
    return { match: false, confidence: 0 };
  }

  return {
    match: true,
    confidence: 0.75,
    matchedCriteria: [`param-mutations=${hints.paramMutationCount}`],
  };
}

/**
 * TS-034: Unsafe innerHTML — XSS vulnerability
 */
export function checkUnsafeInnerHtml(entity: Entity): CustomDetectorResult {
  const hints = getAntipatternHints(entity);
  if (!hints || !hints.innerHtmlAssignCount || hints.innerHtmlAssignCount === 0) {
    return { match: false, confidence: 0 };
  }

  return {
    match: true,
    confidence: 0.85,
    matchedCriteria: [`innerHTML-assigns=${hints.innerHtmlAssignCount}`],
  };
}

/**
 * TS-036: ReDoS vulnerability — regex with nested quantifiers
 */
export function checkRedosVulnerability(entity: Entity): CustomDetectorResult {
  const hints = getAntipatternHints(entity);
  if (!hints?.regexLiterals?.length) return { match: false, confidence: 0 };

  const vulnerableRegexes: string[] = [];
  for (const regex of hints.regexLiterals) {
    if (isRedosVulnerable(regex)) {
      vulnerableRegexes.push(regex);
    }
  }

  if (vulnerableRegexes.length === 0) return { match: false, confidence: 0 };

  return {
    match: true,
    confidence: 0.8,
    matchedCriteria: [`redos-patterns=${vulnerableRegexes.length}`],
  };
}

/**
 * TS-004: Missing generic constraint — generic type parameter without constraint
 */
export function checkMissingGenericConstraint(entity: Entity): CustomDetectorResult {
  const typeParams = entity.metadata?.["typeParameters"] as Array<{ name: string; constraint?: string }> | undefined;
  if (!typeParams?.length) return { match: false, confidence: 0 };

  const unconstrained = typeParams.filter((tp) => !tp.constraint);
  if (unconstrained.length === 0) return { match: false, confidence: 0 };

  // Only flag if the function has enough complexity to suggest the generic is used meaningfully
  const metrics = entity.metadata?.["metrics"] as { linesOfCode?: number } | undefined;
  if ((metrics?.linesOfCode ?? 0) < 5) return { match: false, confidence: 0 };

  return {
    match: true,
    confidence: 0.6,
    matchedCriteria: [`unconstrained-generics=${unconstrained.length}`],
  };
}

// ─── Antipattern Detectors (Phase 3: Module/Type Level) ─────────────

/**
 * TS-037: Enum pitfalls — numeric enum without initializers
 */
export function checkEnumPitfalls(entity: Entity): CustomDetectorResult {
  if ((entity.type as string) !== "enum") return { match: false, confidence: 0 };

  const isConst = entity.metadata?.["isConstEnum"] as boolean | undefined;
  const hasStringInit = entity.metadata?.["hasStringInit"] as boolean | undefined;

  // Numeric enums without string initializers are fragile (insertion changes values)
  if (hasStringInit) return { match: false, confidence: 0 };

  return {
    match: true,
    confidence: isConst ? 0.6 : 0.75,
    matchedCriteria: ["numeric-enum", ...(isConst ? ["const-enum"] : [])],
  };
}

/**
 * TS-038: Namespace antipattern — modules should use ES imports
 */
export function checkNamespaceAntipattern(entity: Entity): CustomDetectorResult {
  if ((entity.type as string) !== "namespace") return { match: false, confidence: 0 };

  return {
    match: true,
    confidence: 0.85,
    matchedCriteria: ["namespace-declaration"],
  };
}

/**
 * TS-039: Conditional type abuse — deeply nested conditional types
 */
export function checkConditionalTypeAbuse(entity: Entity): CustomDetectorResult {
  if ((entity.type as string) !== "type") return { match: false, confidence: 0 };

  const depth = entity.metadata?.["conditionalTypeDepth"] as number | undefined;
  if (!depth || depth <= 3) return { match: false, confidence: 0 };

  return {
    match: true,
    confidence: 0.65,
    matchedCriteria: [`conditional-depth=${depth}`],
  };
}

// ─── Antipattern Detectors (Phase 4: Test & Heuristic) ──────────────

/**
 * TS-031: Snapshot test abuse — too many snapshot assertions
 */
export function checkSnapshotAbuse(entity: Entity): CustomDetectorResult {
  const calls = entity.metadata?.["calls"] as Array<{ name?: string }> | undefined;
  if (!calls) return { match: false, confidence: 0 };

  const snapshotCount = calls.filter((c) => c.name === "toMatchSnapshot" || c.name === "toMatchInlineSnapshot").length;

  if (snapshotCount < 3) return { match: false, confidence: 0 };

  return {
    match: true,
    confidence: 0.6,
    matchedCriteria: [`snapshot-assertions=${snapshotCount}`],
  };
}

/**
 * TS-032: Implementation testing — spying on private methods
 */
export function checkImplementationTesting(entity: Entity): CustomDetectorResult {
  const calls = entity.metadata?.["calls"] as Array<{ name?: string; target?: string }> | undefined;
  if (!calls) return { match: false, confidence: 0 };

  const hasSpyOn = calls.some((c) => c.name === "spyOn");
  if (!hasSpyOn) return { match: false, confidence: 0 };

  // Check for private method patterns (underscore prefix or string with private-looking names)
  const spyTargets = calls.filter((c) => c.name === "spyOn");
  const hasPrivateTarget = spyTargets.some(
    (c) => c.target && (c.target.startsWith("_") || c.target.includes("private")),
  );

  if (!hasPrivateTarget) return { match: false, confidence: 0 };

  return {
    match: true,
    confidence: 0.55,
    matchedCriteria: ["spy-on-private"],
  };
}

/**
 * TS-026: Stringly-typed API — too many string params
 */
export function checkStringlyTypedApi(entity: Entity): CustomDetectorResult {
  const params = (entity.metadata?.parameters ?? []) as Array<{ type?: string }>;
  const mods = (entity.metadata?.modifiers ?? []) as string[];

  if (!mods.includes("export")) return { match: false, confidence: 0 };

  const stringParams = params.filter((p) => p.type === "string");
  if (stringParams.length < 2) return { match: false, confidence: 0 };

  return {
    match: true,
    confidence: 0.55,
    matchedCriteria: [`string-params=${stringParams.length}`],
  };
}

/**
 * RxJS subscribe in loop — only fires when the entity actually uses RxJS.
 * Without RxJS signals (pipe, Observable, Subject, etc.), `subscribe()` is just
 * an EventEmitter/KnowledgeBus method — not a leak-prone RxJS subscription.
 */
const RXJS_SIGNALS =
  /^(pipe|Observable|Subject|BehaviorSubject|ReplaySubject|AsyncSubject|switchMap|mergeMap|concatMap|exhaustMap|takeUntil|combineLatest|forkJoin|of|from|firstValueFrom|lastValueFrom|toObservable|asObservable)$/;

export function checkRxjsSubscribeInLoop(entity: Entity): CustomDetectorResult {
  const calls = entity.metadata?.["calls"] as Array<{ name?: string }> | undefined;
  if (!calls) return { match: false, confidence: 0 };

  const callNames = calls.map((c) => c.name ?? "");

  // Must actually use RxJS — not just any .subscribe()
  if (!callNames.some((n) => RXJS_SIGNALS.test(n))) return { match: false, confidence: 0 };

  return {
    match: true,
    confidence: 0.75,
    matchedCriteria: ["subscribe-in-loop", "rxjs-context"],
  };
}

/**
 * TS-015: Await in loop — sequential async where parallel is possible
 */
export function checkAwaitInLoop(entity: Entity): CustomDetectorResult {
  const cf = entity.metadata?.["controlFlow"] as
    | {
        loops?: Array<{ location: { start: { line: number }; end: { line: number } } }>;
        awaits?: Array<{ location: { start: { line: number } } }>;
      }
    | undefined;

  if (!cf?.loops?.length || !cf?.awaits?.length) return { match: false, confidence: 0 };

  // Check if any await is within a loop's line range
  const awaitsInLoop = cf.awaits.filter((a) =>
    cf.loops!.some(
      (l) => a.location.start.line >= l.location.start.line && a.location.start.line <= l.location.end.line,
    ),
  );

  if (awaitsInLoop.length === 0) return { match: false, confidence: 0 };

  return {
    match: true,
    confidence: 0.75,
    matchedCriteria: [`awaits-in-loop=${awaitsInLoop.length}`],
  };
}

// ─── Remaining Detectors (Group 1: Heuristic, Group 2: Cross-Entity) ─

/**
 * TS-005: Unsafe index access — array/object indexing without bounds check
 */
export function checkUnsafeIndexAccess(entity: Entity): CustomDetectorResult {
  const jitHints = entity.metadata?.["jitHints"] as { dynamicPropAccessCount?: number } | undefined;
  const dynCount = jitHints?.dynamicPropAccessCount ?? 0;
  if (dynCount === 0) return { match: false, confidence: 0 };

  const cf = entity.metadata?.["controlFlow"] as { branches?: Array<unknown>; loops?: Array<unknown> } | undefined;
  const branchCount = cf?.branches?.length ?? 0;
  const hasLoop = (cf?.loops?.length ?? 0) > 0;

  // If in a loop, it's already caught by jit-dynamic-property — skip to avoid double flagging
  if (hasLoop && dynCount >= 5) return { match: false, confidence: 0 };

  // Heuristic: low branch count relative to dynamic accesses suggests missing bounds/null checks
  if (branchCount >= dynCount) return { match: false, confidence: 0 };

  return {
    match: true,
    confidence: 0.5,
    matchedCriteria: [`dynamic-access=${dynCount}`, `branches=${branchCount}`],
  };
}

/**
 * TS-007: Missing null check — nullable params without narrowing
 */
export function checkMissingNullCheck(entity: Entity): CustomDetectorResult {
  const params = (entity.metadata?.parameters ?? []) as Array<{ name: string; type?: string; optional?: boolean }>;
  if (params.length === 0) return { match: false, confidence: 0 };

  // Count params with nullable types
  const nullableParams = params.filter(
    (p) =>
      p.optional === true ||
      (p.type && /\|\s*(null|undefined)/.test(p.type)) ||
      p.type === "null" ||
      p.type === "undefined",
  );

  if (nullableParams.length === 0) return { match: false, confidence: 0 };

  const cf = entity.metadata?.["controlFlow"] as { branches?: Array<unknown> } | undefined;
  const branchCount = cf?.branches?.length ?? 0;

  // Heuristic: fewer branches than nullable params suggests missing null checks
  if (branchCount >= nullableParams.length) return { match: false, confidence: 0 };

  return {
    match: true,
    confidence: 0.45,
    matchedCriteria: [`nullable-params=${nullableParams.length}`, `branches=${branchCount}`],
  };
}

/**
 * TS-018: Missing readonly — class property that could be readonly
 */
export function checkMissingReadonly(entity: Entity): CustomDetectorResult {
  // Only applies to property/field entities (parser EntityKind, stored via metadata)
  const entityType = entity.type as string;
  if (entityType !== "property" && entityType !== "field" && entityType !== "variable") {
    return { match: false, confidence: 0 };
  }

  const mods = (entity.metadata?.modifiers ?? []) as string[];

  // Already readonly or const
  if (mods.includes("readonly") || mods.includes("const")) return { match: false, confidence: 0 };

  // Must be a class member (not a standalone variable)
  // Heuristic: class members often have visibility modifiers or are inside a class context
  const isClassMember = mods.includes("public") || mods.includes("private") || mods.includes("protected");
  if (!isClassMember) return { match: false, confidence: 0 };

  // Private properties are less concerning (internal mutation is expected)
  if (mods.includes("private")) return { match: false, confidence: 0 };

  return {
    match: true,
    confidence: 0.5,
    matchedCriteria: ["class-property-not-readonly"],
  };
}

/**
 * TS-035: Missing input validation — exported function with params but no validation branches
 */
export function checkMissingInputValidation(entity: Entity): CustomDetectorResult {
  const mods = (entity.metadata?.modifiers ?? []) as string[];
  if (!mods.includes("export")) return { match: false, confidence: 0 };

  const params = (entity.metadata?.parameters ?? []) as Array<{ name: string; type?: string }>;
  if (params.length === 0) return { match: false, confidence: 0 };

  const cf = entity.metadata?.["controlFlow"] as { branches?: Array<unknown> } | undefined;
  const branchCount = cf?.branches?.length ?? 0;

  // Heuristic: exported function with 2+ params and zero/very few branches
  if (params.length < 2 || branchCount > 0) return { match: false, confidence: 0 };

  const metrics = entity.metadata?.["metrics"] as { linesOfCode?: number } | undefined;
  const loc = metrics?.linesOfCode ?? 0;

  // Only flag substantial functions (not one-liners)
  if (loc < 5) return { match: false, confidence: 0 };

  return {
    match: true,
    confidence: 0.5,
    matchedCriteria: [`exported-params=${params.length}`, "no-validation-branches"],
  };
}

/**
 * TS-029: Side-effect import — import with no specifiers (import './polyfill')
 */
export function checkSideEffectImport(entity: Entity): CustomDetectorResult {
  if ((entity.type as string) !== "import") return { match: false, confidence: 0 };

  const importData = entity.metadata?.importData as
    | { source: string; specifiers: Array<unknown>; isDefault?: boolean; isNamespace?: boolean }
    | undefined;
  if (!importData) return { match: false, confidence: 0 };

  // Side-effect import: no specifiers, not default, not namespace
  if (importData.specifiers.length > 0 || importData.isDefault || importData.isNamespace) {
    return { match: false, confidence: 0 };
  }

  // Some side-effect imports are legitimate (polyfills, CSS imports)
  const source = importData.source;
  const isLikelyPolyfill = /polyfill|shim|zone|reflect-metadata/i.test(source);
  const isStyleImport = /\.(css|scss|sass|less|styl)$/.test(source);

  if (isLikelyPolyfill || isStyleImport) return { match: false, confidence: 0 };

  return {
    match: true,
    confidence: 0.6,
    matchedCriteria: [`side-effect-import=${source}`],
  };
}

/**
 * TS-040: Declaration merging trap — multiple interfaces with same name in same file
 * Requires allEntities parameter for cross-entity detection.
 */
export function checkDeclarationMergingTrap(entity: Entity, allEntities?: Entity[]): CustomDetectorResult {
  if ((entity.type as string) !== "interface") return { match: false, confidence: 0 };
  if (!allEntities) return { match: false, confidence: 0 };

  // Find other interfaces with same name in the same file
  const duplicates = allEntities.filter(
    (e) =>
      e.id !== entity.id &&
      e.name === entity.name &&
      e.filePath === entity.filePath &&
      (e.type as string) === "interface",
  );

  if (duplicates.length === 0) return { match: false, confidence: 0 };

  return {
    match: true,
    confidence: 0.7,
    matchedCriteria: [`duplicate-interfaces=${duplicates.length + 1}`],
  };
}

/**
 * TS-028: Circular dependency — mutual imports between files
 * Detects 2-node import cycles via allEntities cross-reference.
 */
export function checkCircularDependency(entity: Entity, allEntities?: Entity[]): CustomDetectorResult {
  if ((entity.type as string) !== "import") return { match: false, confidence: 0 };
  if (!allEntities) return { match: false, confidence: 0 };

  const importData = entity.metadata?.importData as { source: string } | undefined;
  if (!importData) return { match: false, confidence: 0 };

  const thisFile = entity.filePath;
  const importedSource = importData.source;

  // Only check relative imports (./foo, ../bar) — npm packages can't create cycles
  if (!importedSource.startsWith(".")) return { match: false, confidence: 0 };

  // Normalize: resolve the imported path relative to the current file
  // We can't do full resolution, but we can check if any import entity in the target file
  // imports back from a path that could resolve to thisFile
  const thisFileBase = thisFile.replace(/\\/g, "/").replace(/\.(ts|tsx|js|jsx)$/, "");
  const thisFileName = thisFileBase.split("/").pop()!;

  // Find import entities from other files whose source could match our file
  const reverseImports = allEntities.filter((e) => {
    if ((e.type as string) !== "import") return false;
    if (e.filePath === thisFile) return false;

    const eImportData = e.metadata?.importData as { source: string } | undefined;
    if (!eImportData) return false;

    // Check if this entity's file could be the target of our import
    const eFileBase = e.filePath.replace(/\\/g, "/").replace(/\.(ts|tsx|js|jsx)$/, "");
    const eFileName = eFileBase.split("/").pop()!;

    // Heuristic: does the imported source end with the target filename?
    const importedNorm = importedSource.replace(/\\/g, "/").replace(/\.(ts|tsx|js|jsx)$/, "");
    const importedName = importedNorm.split("/").pop()!;

    if (importedName !== eFileName) return false;

    // Check if the reverse import's source matches our file
    const reverseSource = eImportData.source.replace(/\\/g, "/").replace(/\.(ts|tsx|js|jsx)$/, "");
    const reverseName = reverseSource.split("/").pop()!;

    return reverseName === thisFileName && eImportData.source.startsWith(".");
  });

  if (reverseImports.length === 0) return { match: false, confidence: 0 };

  return {
    match: true,
    confidence: 0.8,
    matchedCriteria: [`mutual-import-with=${importedSource}`],
  };
}

// ─── Closure Memory Leak Detectors ─────────────────────────────────

type ClosureHintsLike = {
  innerFunctionCount?: number;
  capturedVarCount?: number;
  fullObjectCaptureCount?: number;
  evalInClosureCount?: number;
  addListenerCount?: number;
  removeListenerCount?: number;
  mapNewCount?: number;
  weakMapNewCount?: number;
  setNewCount?: number;
  weakSetNewCount?: number;
};

function getClosureHints(entity: Entity): ClosureHintsLike | null {
  return (entity.metadata?.["closureHints"] as ClosureHintsLike) ?? null;
}

/**
 * True when closures are attached to genuinely long-lived listeners.
 * Excludes bounded-lifetime objects (child processes, file streams, HTTP, workers)
 * where listeners die with the object — same exclusion as checkEventListenerLeak.
 */
function hasLongLivedListeners(entity: Entity, ch: ClosureHintsLike): boolean {
  if ((ch.addListenerCount ?? 0) === 0 || (ch.removeListenerCount ?? 0) > 0) return false;

  const calls = entity.metadata?.["calls"] as Array<{ name?: string; target?: string }> | undefined;
  if (!calls) return true; // can't determine — assume long-lived

  const callNames = calls.map((c) => c.name ?? "");
  if (callNames.some((n) => BOUNDED_LIFETIME_CALLS.test(n))) return false;
  if (calls.some((c) => HTTP_METHOD_NAME.test(c.name ?? "") && HTTP_TARGET.test(c.target ?? ""))) return false;

  return true;
}

/**
 * Closure captures entire object when only a property is used.
 * Pattern: function handler(data) { return () => data.id; }
 * Fix: const {id} = data; return () => id;
 *
 * Only flags long-lived closures (event listeners / subscriptions).
 * Sync closures and Promise-bounded async closures die with their scope — no GC risk.
 */
export function checkClosureFullObjectCapture(entity: Entity): CustomDetectorResult {
  const ch = getClosureHints(entity);
  if (!ch || !ch.fullObjectCaptureCount || ch.fullObjectCaptureCount === 0) {
    return { match: false, confidence: 0 };
  }

  // Only flag when closures are attached to long-lived event sources
  // Sync visitors, Promise.all lambdas, .map() callbacks — all short-lived, no GC risk
  if (!hasLongLivedListeners(entity, ch)) return { match: false, confidence: 0 };

  return {
    match: true,
    confidence: Math.min(0.7 + ch.fullObjectCaptureCount * 0.05, 0.9),
    matchedCriteria: [
      `full-object-captures=${ch.fullObjectCaptureCount}`,
      `captured-vars=${ch.capturedVarCount ?? 0}`,
      "has-listeners",
    ],
  };
}

/**
 * eval() inside closure forces engine to retain ALL outer scope variables.
 * Pattern: function outer(x, y, bigData) { return () => eval("x + 1"); }
 * The engine retains x, y, AND bigData — even though eval only uses x.
 */
export function checkClosureEvalScopeLeak(entity: Entity): CustomDetectorResult {
  const ch = getClosureHints(entity);
  if (!ch || !ch.evalInClosureCount || ch.evalInClosureCount === 0) {
    return { match: false, confidence: 0 };
  }

  // eval in closure is always dangerous — high confidence
  return {
    match: true,
    confidence: 0.95,
    matchedCriteria: [`eval-in-closure=${ch.evalInClosureCount}`, `inner-functions=${ch.innerFunctionCount ?? 0}`],
  };
}

/**
 * Map used instead of WeakMap for object references in long-lived closure context.
 * Pattern: function cache() { const m = new Map(); return (obj) => m.set(obj, compute(obj)); }
 * Fix: use new WeakMap() — entries are GC'd when key becomes unreachable.
 *
 * Only flags when Map is captured in a long-lived closure (event listeners).
 * Most Maps use string/number keys where WeakMap is impossible — we can't
 * distinguish key types statically, so require strong long-lived signal.
 */
export function checkMapInsteadOfWeakMap(entity: Entity): CustomDetectorResult {
  const ch = getClosureHints(entity);
  if (!ch) return { match: false, confidence: 0 };

  const mapCount = ch.mapNewCount ?? 0;
  const hasWeakMap = (ch.weakMapNewCount ?? 0) > 0;
  const hasInnerFn = (ch.innerFunctionCount ?? 0) > 0;

  if (mapCount === 0 || hasWeakMap || !hasInnerFn) return { match: false, confidence: 0 };

  // Without long-lived closures (listeners), the Map is GC'd with the scope.
  // Most Maps use string keys where WeakMap is impossible anyway.
  if (!hasLongLivedListeners(entity, ch)) return { match: false, confidence: 0 };

  return {
    match: true,
    confidence: mapCount >= 3 ? 0.75 : 0.65,
    matchedCriteria: [`new-Map=${mapCount}`, "no-WeakMap", "has-listeners", "long-lived-closure"],
  };
}

/**
 * Set used instead of WeakSet for tracking objects in long-lived closure context.
 * Pattern: function tracker() { const s = new Set(); return (obj) => { s.add(obj); }; }
 * Fix: use new WeakSet() — entries are GC'd when object becomes unreachable.
 *
 * Same rationale as Map/WeakMap: most Sets store primitives, and without
 * long-lived closures the Set is GC'd with the scope anyway.
 */
export function checkSetInsteadOfWeakSet(entity: Entity): CustomDetectorResult {
  const ch = getClosureHints(entity);
  if (!ch) return { match: false, confidence: 0 };

  const setCount = ch.setNewCount ?? 0;
  const hasWeakSet = (ch.weakSetNewCount ?? 0) > 0;
  const hasInnerFn = (ch.innerFunctionCount ?? 0) > 0;

  if (setCount === 0 || hasWeakSet || !hasInnerFn) return { match: false, confidence: 0 };

  if (!hasLongLivedListeners(entity, ch)) return { match: false, confidence: 0 };

  return {
    match: true,
    confidence: 0.6,
    matchedCriteria: [`new-Set=${setCount}`, "no-WeakSet", "has-listeners", "long-lived-closure"],
  };
}

/**
 * Closure captures variables that are never cleaned up (nulled).
 * Pattern: function setup(bigData) { btn.addEventListener('click', () => console.log(bigData.length)); }
 * Fix: bigData = null after use inside the handler.
 *
 * Heuristic: flags when captured var count is high relative to inner function count,
 * and the function deals with event listeners (higher risk of long-lived closures).
 */
export function checkClosureNoCleanup(entity: Entity): CustomDetectorResult {
  const ch = getClosureHints(entity);
  if (!ch || !ch.capturedVarCount || ch.capturedVarCount === 0) {
    return { match: false, confidence: 0 };
  }

  const hasInnerFn = (ch.innerFunctionCount ?? 0) > 0;
  if (!hasInnerFn) return { match: false, confidence: 0 };

  const capturedVars = ch.capturedVarCount;

  // Only flag closures attached to long-lived event sources.
  // Sync visitors, .map() lambdas, Promise-bounded callbacks — all short-lived.
  if (!hasLongLivedListeners(entity, ch)) return { match: false, confidence: 0 };

  if (capturedVars >= 5) {
    return {
      match: true,
      confidence: 0.8,
      matchedCriteria: [`captured-vars=${capturedVars}`, "has-listeners", "long-lived-closure", "heavy-capture"],
    };
  }

  if (capturedVars >= 3) {
    return {
      match: true,
      confidence: 0.7,
      matchedCriteria: [`captured-vars=${capturedVars}`, "has-listeners", "long-lived-closure"],
    };
  }

  return { match: false, confidence: 0 };
}

// ─── Helpers ────────────────────────────────────────────────────────

/** Split union type string respecting generic nesting */
function splitUnionType(typeStr: string): string[] {
  const members: string[] = [];
  let depth = 0;
  let current = "";
  for (const ch of typeStr) {
    if (ch === "<" || ch === "(" || ch === "[" || ch === "{") depth++;
    else if (ch === ">" || ch === ")" || ch === "]" || ch === "}") depth--;
    else if (ch === "|" && depth === 0) {
      const trimmed = current.trim();
      if (trimmed) members.push(trimmed);
      current = "";
      continue;
    }
    current += ch;
  }
  const trimmed = current.trim();
  if (trimmed) members.push(trimmed);
  return members;
}

/** Check if regex pattern is vulnerable to ReDoS (nested quantifiers) */
function isRedosVulnerable(regexStr: string): boolean {
  // Strip leading/trailing slashes and flags
  const match = regexStr.match(/^\/(.*)\/[a-z]*$/);
  const pattern = match ? match[1]! : regexStr;

  // Heuristic: nested quantifiers like (a+)+, (a*)+, (a+)*, (.+)+
  if (/\([^)]*[+*]\)[+*]/.test(pattern)) return true;
  // Overlapping alternation with quantifiers: (a|a)+
  if (/\([^)]*\|[^)]*\)[+*]/.test(pattern)) return true;
  // Nested star/plus: .+.+ in group
  if (/\([^)]*\.[*+][^)]*\.[*+][^)]*\)/.test(pattern)) return true;
  return false;
}
