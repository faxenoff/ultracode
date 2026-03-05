/**
 * Structural Detector — Fast metadata-based pattern detection
 *
 * Optimizations:
 * - Pre-compiled regex patterns (avoid new RegExp() in hot loop)
 * - Entity type pre-index (skip entities that can't match a pattern)
 * - Pre-extracted entity metadata (parse once per entity, not per pattern)
 * - Inline evaluation (no closure allocation per check)
 */

import { log } from "../../logging/index.js";
import type { Entity, GraphStorage, Relationship } from "../../types/storage.js";
import type {
  CustomDetectorFn,
  PatternDefinition,
  RelationshipCriteria,
  StructuralCandidate,
  StructuralCriteria,
} from "./types.js";

// ─── Custom Detector Registry ──────────────────────────────────────

const detectorRegistry: Map<string, CustomDetectorFn> = new Map();

export function registerDetector(name: string, fn: CustomDetectorFn): void {
  detectorRegistry.set(name, fn);
}

export function registerDetectors(detectors: Record<string, CustomDetectorFn>): void {
  for (const [name, fn] of Object.entries(detectors)) {
    detectorRegistry.set(name, fn);
  }
}

// ─── Compiled Pattern Cache ─────────────────────────────────────────

interface CompiledCriteria {
  entityTypeSet: Set<string> | null;
  returnTypeMatchRe: RegExp | null;
  returnTypeNotMatchRe: RegExp | null;
  paramTypeRequiredRe: RegExp | null;
  paramTypeAbsentRe: RegExp | null;
  callsIncludeRe: RegExp[] | null;
  callsExcludeRe: RegExp[] | null;
  decoratorMatchRe: RegExp[] | null;
  nameMatchRe: RegExp | null;
  nameNotMatchRe: RegExp | null;
  filePathNotMatchRe: RegExp | null;
  totalCriteriaCount: number;
}

const compiledCache = new WeakMap<PatternDefinition, CompiledCriteria>();

function getCompiled(pattern: PatternDefinition): CompiledCriteria {
  let compiled = compiledCache.get(pattern);
  if (compiled) return compiled;

  const c = pattern.structural;
  compiled = {
    entityTypeSet: c?.entityTypes ? new Set(c.entityTypes) : null,
    returnTypeMatchRe: c?.returnTypeMatch ? new RegExp(c.returnTypeMatch, "i") : null,
    returnTypeNotMatchRe: c?.returnTypeNotMatch ? new RegExp(c.returnTypeNotMatch, "i") : null,
    paramTypeRequiredRe: c?.paramTypeRequired ? new RegExp(c.paramTypeRequired, "i") : null,
    paramTypeAbsentRe: c?.paramTypeAbsent ? new RegExp(c.paramTypeAbsent, "i") : null,
    callsIncludeRe: c?.callsInclude ? c.callsInclude.map((p) => new RegExp(p, "i")) : null,
    callsExcludeRe: c?.callsExclude ? c.callsExclude.map((p) => new RegExp(p, "i")) : null,
    decoratorMatchRe: c?.decoratorMatch ? c.decoratorMatch.map((p) => new RegExp(p, "i")) : null,
    nameMatchRe: c?.nameMatch ? new RegExp(c.nameMatch, "i") : null,
    nameNotMatchRe: c?.nameNotMatch ? new RegExp(c.nameNotMatch, "i") : null,
    filePathNotMatchRe: c?.filePathNotMatch ? new RegExp(c.filePathNotMatch, "i") : null,
    totalCriteriaCount: countTotalCriteria(c ?? {}),
  };
  compiledCache.set(pattern, compiled);
  return compiled;
}

// ─── Pre-extracted Entity Metadata ──────────────────────────────────

interface EntityMeta {
  modifiers: string[];
  returnType: string | undefined;
  params: Array<{ name: string; type?: string }>;
  metrics: { cyclomaticComplexity: number; cognitiveComplexity: number; linesOfCode: number; nestingDepth: number };
  cf: { branches: number; loops: number; exceptions: number; awaits: number };
  callNames: string[];
  decoratorNames: string[];
  hasInheritance: boolean;
}

const metaCache = new WeakMap<Entity, EntityMeta>();

function getMeta(entity: Entity): EntityMeta {
  let meta = metaCache.get(entity);
  if (meta) return meta;

  const md = entity.metadata;
  const metricsRaw = md?.["metrics"] as Record<string, number> | undefined;
  const cfRaw = md?.["controlFlow"] as Record<string, Array<unknown>> | undefined;
  const callsRaw = (md?.["calls"] ?? []) as Array<{ target?: string; name?: string }>;
  const decsRaw = (md?.decorators ?? []) as Array<{ name: string }>;
  const inheritanceRaw = md?.["inheritance"] as { baseClasses?: string[]; interfaces?: string[] } | undefined;

  meta = {
    modifiers: (md?.modifiers ?? []) as string[],
    returnType: md?.returnType as string | undefined,
    params: (md?.parameters ?? []) as Array<{ name: string; type?: string }>,
    metrics: {
      cyclomaticComplexity: metricsRaw?.["cyclomaticComplexity"] ?? 0,
      cognitiveComplexity: metricsRaw?.["cognitiveComplexity"] ?? 0,
      linesOfCode: metricsRaw?.["linesOfCode"] ?? 0,
      nestingDepth: metricsRaw?.["nestingDepth"] ?? 0,
    },
    cf: {
      branches: cfRaw?.["branches"]?.length ?? 0,
      loops: cfRaw?.["loops"]?.length ?? 0,
      exceptions: cfRaw?.["exceptions"]?.length ?? 0,
      awaits: cfRaw?.["awaits"]?.length ?? 0,
    },
    callNames: callsRaw.map((c) => `${c.target ?? ""}.${c.name ?? ""}`),
    decoratorNames: decsRaw.map((d) => d.name),
    hasInheritance: (inheritanceRaw?.baseClasses?.length ?? 0) > 0 || (inheritanceRaw?.interfaces?.length ?? 0) > 0,
  };
  metaCache.set(entity, meta);
  return meta;
}

// ─── Structural Detector ───────────────────────────────────────────

type EvalResult = { confidence: number; matchedCriteria: string[] };
const EVAL_ZERO: EvalResult = { confidence: 0, matchedCriteria: [] };

export class StructuralDetector {
  // Cache: entityId:patternId -> evaluation result (3B)
  private evalCache = new Map<string, EvalResult>();

  /** Clear evaluation cache (call when entities or patterns change) */
  clearEvalCache(): void {
    this.evalCache.clear();
  }

  async detect(
    entities: Entity[],
    patterns: PatternDefinition[],
    storage?: GraphStorage,
  ): Promise<StructuralCandidate[]> {
    const candidates: StructuralCandidate[] = [];

    // Pre-index entities by type for O(1) lookup
    const entitiesByType = new Map<string, Entity[]>();
    for (const entity of entities) {
      const arr = entitiesByType.get(entity.type);
      if (arr) arr.push(entity);
      else entitiesByType.set(entity.type, [entity]);
    }

    // Phase 1: Fast metadata-only pass (type-indexed)
    const metadataCandidates: Array<{
      entity: Entity;
      pattern: PatternDefinition;
      confidence: number;
      matched: string[];
    }> = [];

    for (const pattern of patterns) {
      const compiled = getCompiled(pattern);

      // Determine which entities to check based on entityTypes
      let entitiesToCheck: Entity[];
      if (compiled.entityTypeSet) {
        entitiesToCheck = [];
        for (const type of compiled.entityTypeSet) {
          const arr = entitiesByType.get(type);
          if (arr) entitiesToCheck.push(...arr);
        }
      } else {
        entitiesToCheck = entities;
      }

      for (const entity of entitiesToCheck) {
        const result = this.evaluateMetadataCriteria(entity, pattern, compiled);
        if (result.confidence > 0) {
          metadataCandidates.push({
            entity,
            pattern,
            confidence: result.confidence,
            matched: result.matchedCriteria,
          });
        }
      }
    }

    // Phase 2: Split by graph needs
    const needsGraph = metadataCandidates.filter(
      (c) => c.pattern.structural?.relationships && c.pattern.structural.relationships.length > 0,
    );
    const noGraph = metadataCandidates.filter(
      (c) => !c.pattern.structural?.relationships || c.pattern.structural.relationships.length === 0,
    );

    for (const c of noGraph) {
      if (c.confidence >= c.pattern.minStructuralConfidence) {
        candidates.push({
          entity: c.entity,
          pattern: c.pattern,
          confidence: c.confidence,
          matchedCriteria: c.matched,
        });
      }
    }

    // Graph batch — single SQL query for all relationship needs
    if (needsGraph.length > 0 && storage) {
      const entityIds = [...new Set(needsGraph.map((c) => c.entity.id))];

      // Batch fetch all relationships in one query via findRelationships({ fromId: [...] })
      // Also need toId for incoming relationships — collect both directions
      let allRels: Relationship[] = [];
      try {
        const [outgoing, incoming] = await Promise.all([
          storage.findRelationships({ filters: { fromId: entityIds }, limit: 10000 }),
          storage.findRelationships({ filters: { toId: entityIds }, limit: 10000 }),
        ]);
        allRels = [...outgoing, ...incoming];
      } catch {
        // Fallback: no relationships available
      }

      // Index by entity ID (both directions)
      const relsByEntity = new Map<string, Relationship[]>();
      for (const rel of allRels) {
        const fromArr = relsByEntity.get(rel.fromId);
        if (fromArr) fromArr.push(rel);
        else relsByEntity.set(rel.fromId, [rel]);

        if (rel.fromId !== rel.toId) {
          const toArr = relsByEntity.get(rel.toId);
          if (toArr) toArr.push(rel);
          else relsByEntity.set(rel.toId, [rel]);
        }
      }

      for (const c of needsGraph) {
        const rels = relsByEntity.get(c.entity.id) ?? [];
        const graphResult = this.evaluateRelationshipCriteria(c.entity, rels, c.pattern.structural!.relationships!);

        if (graphResult.passed) {
          const totalMatched = c.matched.length + graphResult.matchedCriteria.length;
          const compiled = getCompiled(c.pattern);
          const adjustedConfidence = totalMatched / Math.max(compiled.totalCriteriaCount, 1);

          if (adjustedConfidence >= c.pattern.minStructuralConfidence) {
            candidates.push({
              entity: c.entity,
              pattern: c.pattern,
              confidence: Math.min(adjustedConfidence, 1),
              matchedCriteria: [...c.matched, ...graphResult.matchedCriteria],
            });
          }
        }
      }
    } else if (needsGraph.length > 0) {
      for (const c of needsGraph) {
        if (c.confidence >= c.pattern.minStructuralConfidence) {
          candidates.push({
            entity: c.entity,
            pattern: c.pattern,
            confidence: c.confidence,
            matchedCriteria: c.matched,
          });
        }
      }
    }

    log.i("STRUCTURAL_DETECTOR", "detection_complete", {
      entities: entities.length,
      patterns: patterns.length,
      candidates: candidates.length,
    });

    return candidates;
  }

  // ─── Metadata Evaluation (hot path — optimized) ─────────────────

  private evaluateMetadataCriteria(entity: Entity, pattern: PatternDefinition, compiled: CompiledCriteria): EvalResult {
    // 3B: Check cache first
    const cacheKey = `${entity.id}::${pattern.id}`;
    const cached = this.evalCache.get(cacheKey);
    if (cached) return cached;

    const result = this.evaluateMetadataUncached(entity, pattern, compiled);
    this.evalCache.set(cacheKey, result);
    return result;
  }

  // 3A: Mandatory checks separated for fast bail-out
  private evaluateRequired(
    entity: Entity,
    compiled: CompiledCriteria,
    criteria: StructuralCriteria,
    em: EntityMeta,
  ): string[] | null {
    const matched: string[] = [];

    if (compiled.entityTypeSet) {
      matched.push(`entityType:${entity.type}`);
    }

    if (criteria.requiredModifiers) {
      for (const req of criteria.requiredModifiers) {
        if (!em.modifiers.includes(req)) return null; // bail-out
      }
      matched.push(`modifiers:${criteria.requiredModifiers.join(",")}`);
    }

    if (criteria.forbiddenModifiers) {
      for (const f of criteria.forbiddenModifiers) {
        if (em.modifiers.includes(f)) return null; // bail-out
      }
      matched.push("no-forbidden-modifiers");
    }

    if (criteria.hasNoInheritance) {
      if (em.hasInheritance) return null; // bail-out: has base types
      matched.push("no-inheritance");
    }

    if (compiled.filePathNotMatchRe) {
      if (entity.filePath && compiled.filePathNotMatchRe.test(entity.filePath)) return null; // bail-out
    }

    // nameNotMatch is mandatory: if entity name matches exclusion, bail out (blocks custom detectors too)
    if (compiled.nameNotMatchRe) {
      if (compiled.nameNotMatchRe.test(entity.name)) return null; // bail-out
    }

    return matched;
  }

  // 3A: Optional checks separated from mandatory
  private evaluateOptional(
    entity: Entity,
    compiled: CompiledCriteria,
    criteria: StructuralCriteria,
    em: EntityMeta,
    matched: string[],
  ): { optionalTotal: number; optionalPassed: number } {
    let optionalTotal = 0;
    let optionalPassed = 0;

    // Return type
    if (compiled.returnTypeMatchRe) {
      optionalTotal++;
      if (typeof em.returnType === "string" && compiled.returnTypeMatchRe.test(em.returnType)) {
        optionalPassed++;
        matched.push(`returnType:~/${criteria.returnTypeMatch}/`);
      }
    }
    if (compiled.returnTypeNotMatchRe) {
      optionalTotal++;
      if (typeof em.returnType === "string" && !compiled.returnTypeNotMatchRe.test(em.returnType)) {
        optionalPassed++;
        matched.push(`returnType:!~/${criteria.returnTypeNotMatch}/`);
      }
    }

    // Parameters
    if (criteria.minParams != null) {
      optionalTotal++;
      if (em.params.length >= criteria.minParams) {
        optionalPassed++;
        matched.push(`params>=${criteria.minParams}`);
      }
    }
    if (criteria.maxParams != null) {
      optionalTotal++;
      if (em.params.length <= criteria.maxParams) {
        optionalPassed++;
        matched.push(`params<=${criteria.maxParams}`);
      }
    }
    if (compiled.paramTypeRequiredRe) {
      optionalTotal++;
      if (em.params.some((p) => p.type && compiled.paramTypeRequiredRe!.test(p.type))) {
        optionalPassed++;
        matched.push(`paramType:${criteria.paramTypeRequired}`);
      }
    }
    if (compiled.paramTypeAbsentRe) {
      optionalTotal++;
      if (!em.params.some((p) => p.type && compiled.paramTypeAbsentRe!.test(p.type))) {
        optionalPassed++;
        matched.push(`paramType:!${criteria.paramTypeAbsent}`);
      }
    }

    // Metrics
    if (criteria.minCyclomatic != null) {
      optionalTotal++;
      if (em.metrics.cyclomaticComplexity >= criteria.minCyclomatic) {
        optionalPassed++;
        matched.push(`cyclomatic>=${criteria.minCyclomatic}`);
      }
    }
    if (criteria.maxCyclomatic != null) {
      optionalTotal++;
      if (em.metrics.cyclomaticComplexity <= criteria.maxCyclomatic) {
        optionalPassed++;
        matched.push(`cyclomatic<=${criteria.maxCyclomatic}`);
      }
    }
    if (criteria.minCognitive != null) {
      optionalTotal++;
      if (em.metrics.cognitiveComplexity >= criteria.minCognitive) {
        optionalPassed++;
        matched.push(`cognitive>=${criteria.minCognitive}`);
      }
    }
    if (criteria.minNesting != null) {
      optionalTotal++;
      if (em.metrics.nestingDepth >= criteria.minNesting) {
        optionalPassed++;
        matched.push(`nesting>=${criteria.minNesting}`);
      }
    }
    if (criteria.minLOC != null) {
      optionalTotal++;
      if (em.metrics.linesOfCode >= criteria.minLOC) {
        optionalPassed++;
        matched.push(`LOC>=${criteria.minLOC}`);
      }
    }
    if (criteria.maxLOC != null) {
      optionalTotal++;
      if (em.metrics.linesOfCode <= criteria.maxLOC) {
        optionalPassed++;
        matched.push(`LOC<=${criteria.maxLOC}`);
      }
    }

    // ControlFlow
    if (criteria.hasLoops != null) {
      optionalTotal++;
      if (em.cf.loops > 0 === criteria.hasLoops) {
        optionalPassed++;
        matched.push(criteria.hasLoops ? "hasLoops" : "noLoops");
      }
    }
    if (criteria.hasExceptions != null) {
      optionalTotal++;
      if (em.cf.exceptions > 0 === criteria.hasExceptions) {
        optionalPassed++;
        matched.push(criteria.hasExceptions ? "hasExceptions" : "noExceptions");
      }
    }
    if (criteria.hasAwaits != null) {
      optionalTotal++;
      if (em.cf.awaits > 0 === criteria.hasAwaits) {
        optionalPassed++;
        matched.push(criteria.hasAwaits ? "hasAwaits" : "noAwaits");
      }
    }
    if (criteria.minBranches != null) {
      optionalTotal++;
      if (em.cf.branches >= criteria.minBranches) {
        optionalPassed++;
        matched.push(`branches>=${criteria.minBranches}`);
      }
    }

    // Calls
    if (criteria.minCallCount != null) {
      optionalTotal++;
      if (em.callNames.length >= criteria.minCallCount) {
        optionalPassed++;
        matched.push(`calls>=${criteria.minCallCount}`);
      }
    }
    if (compiled.callsIncludeRe) {
      for (let i = 0; i < compiled.callsIncludeRe.length; i++) {
        optionalTotal++;
        if (em.callNames.some((c) => compiled.callsIncludeRe![i]!.test(c))) {
          optionalPassed++;
          matched.push(`calls:~/${criteria.callsInclude![i]}/`);
        }
      }
    }
    if (compiled.callsExcludeRe) {
      for (let i = 0; i < compiled.callsExcludeRe.length; i++) {
        optionalTotal++;
        if (!em.callNames.some((c) => compiled.callsExcludeRe![i]!.test(c))) {
          optionalPassed++;
          matched.push(`calls:!~/${criteria.callsExclude![i]}/`);
        }
      }
    }

    // Decorators
    if (compiled.decoratorMatchRe) {
      for (let i = 0; i < compiled.decoratorMatchRe.length; i++) {
        optionalTotal++;
        if (em.decoratorNames.some((d) => compiled.decoratorMatchRe![i]!.test(d))) {
          optionalPassed++;
          matched.push(`decorator:~/${criteria.decoratorMatch![i]}/`);
        }
      }
    }

    // Name
    if (compiled.nameMatchRe) {
      optionalTotal++;
      if (compiled.nameMatchRe.test(entity.name)) {
        optionalPassed++;
        matched.push(`name:~/${criteria.nameMatch}/`);
      }
    }
    // nameNotMatch is handled in evaluateRequired as mandatory bail-out
    if (compiled.nameNotMatchRe) {
      // Already passed mandatory check — count as matched
      matched.push(`name:!~/${criteria.nameNotMatch}/`);
    }

    return { optionalTotal, optionalPassed };
  }

  private evaluateMetadataUncached(entity: Entity, pattern: PatternDefinition, compiled: CompiledCriteria): EvalResult {
    const criteria = pattern.structural;

    if (!criteria && !pattern.customDetector) {
      return EVAL_ZERO;
    }

    const matched: string[] = [];
    const em = getMeta(entity);

    if (criteria) {
      // 3A: Fast bail-out on mandatory checks
      const requiredMatched = this.evaluateRequired(entity, compiled, criteria, em);
      if (requiredMatched === null) return EVAL_ZERO;
      matched.push(...requiredMatched);

      // 3A: Optional checks
      const { optionalTotal, optionalPassed } = this.evaluateOptional(entity, compiled, criteria, em, matched);

      // Confidence calculation
      const mandatoryCount = requiredMatched.length;

      if (optionalTotal === 0) {
        if (matched.length > 0 && !pattern.customDetector) {
          return { confidence: 1.0, matchedCriteria: matched };
        }
      } else {
        const conf = optionalPassed / optionalTotal;
        if ((conf > 0 || matched.length > mandatoryCount) && !pattern.customDetector) {
          return { confidence: conf, matchedCriteria: matched };
        }
      }
    }

    // === Custom detector ===
    if (pattern.customDetector) {
      const detector = detectorRegistry.get(pattern.customDetector);
      if (detector) {
        try {
          const result = detector(entity);
          if (result.match) {
            const customMatched = result.matchedCriteria ?? [`custom:${pattern.customDetector}`];
            const allMatched = [...matched, ...customMatched];

            const mandatoryCount = matched.filter(
              (m) => m.startsWith("entityType:") || m.startsWith("modifiers:") || m === "no-forbidden-modifiers",
            ).length;
            const hasOptionalStructural = matched.length > mandatoryCount;

            const blended = hasOptionalStructural
              ? (result.confidence + matched.length / Math.max(compiled.totalCriteriaCount, 1)) / 2
              : result.confidence;

            return { confidence: blended, matchedCriteria: allMatched };
          }
          return EVAL_ZERO;
        } catch (err) {
          log.w("STRUCTURAL_DETECTOR", "custom_detector_error", {
            detector: pattern.customDetector,
            error: String(err),
          });
          return EVAL_ZERO;
        }
      }
      return EVAL_ZERO;
    }

    if (matched.length > 0 && !criteria) {
      return { confidence: 0.5, matchedCriteria: matched };
    }

    return {
      confidence: matched.length > 0 ? matched.length / Math.max(compiled.totalCriteriaCount, 1) : 0,
      matchedCriteria: matched,
    };
  }

  // ─── Relationship Evaluation ─────────────────────────────────────

  private evaluateRelationshipCriteria(
    entity: Entity,
    relationships: Relationship[],
    criteria: RelationshipCriteria[],
  ): { passed: boolean; matchedCriteria: string[] } {
    const matched: string[] = [];

    for (const crit of criteria) {
      const filtered = relationships.filter((r) => {
        const matchesType = r.type === crit.type;
        const matchesDirection = crit.direction === "outgoing" ? r.fromId === entity.id : r.toId === entity.id;
        return matchesType && matchesDirection;
      });

      const count = filtered.length;

      if (crit.minCount != null && count < crit.minCount) {
        return { passed: false, matchedCriteria: matched };
      }
      if (crit.maxCount != null && count > crit.maxCount) {
        return { passed: false, matchedCriteria: matched };
      }

      if (crit.crossFileRatio) {
        const total = relationships.filter((r) =>
          crit.direction === "outgoing" ? r.fromId === entity.id : r.toId === entity.id,
        ).length;

        if (total > 0) {
          const ratio = filtered.length / total;
          if (crit.crossFileRatio.min != null && ratio < crit.crossFileRatio.min) {
            return { passed: false, matchedCriteria: matched };
          }
          if (crit.crossFileRatio.max != null && ratio > crit.crossFileRatio.max) {
            return { passed: false, matchedCriteria: matched };
          }
        }
      }

      matched.push(`rel:${crit.direction}:${crit.type}=${count}`);
    }

    return { passed: true, matchedCriteria: matched };
  }
}

// ─── Helper ──────────────────────────────────────────────────────────

function countTotalCriteria(criteria: StructuralCriteria): number {
  let count = 0;
  if (criteria.entityTypes) count++;
  if (criteria.requiredModifiers) count++;
  if (criteria.forbiddenModifiers) count++;
  if (criteria.returnTypeMatch) count++;
  if (criteria.returnTypeNotMatch) count++;
  if (criteria.minParams != null) count++;
  if (criteria.maxParams != null) count++;
  if (criteria.paramTypeRequired) count++;
  if (criteria.paramTypeAbsent) count++;
  if (criteria.minCyclomatic != null) count++;
  if (criteria.maxCyclomatic != null) count++;
  if (criteria.minCognitive != null) count++;
  if (criteria.minNesting != null) count++;
  if (criteria.minLOC != null) count++;
  if (criteria.maxLOC != null) count++;
  if (criteria.hasLoops != null) count++;
  if (criteria.hasExceptions != null) count++;
  if (criteria.hasAwaits != null) count++;
  if (criteria.minBranches != null) count++;
  if (criteria.minCallCount != null) count++;
  if (criteria.callsInclude) count += criteria.callsInclude.length;
  if (criteria.callsExclude) count += criteria.callsExclude.length;
  if (criteria.decoratorMatch) count += criteria.decoratorMatch.length;
  if (criteria.hasNoInheritance) count++;
  if (criteria.filePathNotMatch) count++;
  if (criteria.nameMatch) count++;
  if (criteria.nameNotMatch) count++;
  if (criteria.relationships) count += criteria.relationships.length;
  return count;
}
