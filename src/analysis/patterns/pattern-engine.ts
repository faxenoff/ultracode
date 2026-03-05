/**
 * Pattern Engine — Main orchestrator for pattern detection pipeline
 *
 * Pipeline:
 * 1. Initialize (lazy): load registry + exemplar store + register detectors
 * 2. Get entities from storage
 * 3. Auto-detect language
 * 4. Get applicable patterns
 * 5. Structural detection (fast pass)
 * 6. Semantic validation (embedding comparison)
 * 7. Filter, group, score → PatternScanResult
 */

import { join } from "node:path";
import { log } from "../../logging/index.js";
import type { EmbeddingGenerator } from "../../semantic/embedding-generator.js";
import type { Entity, GraphStorage } from "../../types/storage.js";
import * as commonDetectors from "./detectors/common.js";
import { ExemplarStore } from "./exemplar-store.js";
import { PatternRegistry } from "./pattern-registry.js";
import { SemanticValidator } from "./semantic-validator.js";
import { registerDetectors, StructuralDetector } from "./structural-detector.js";
import type { PatternCategory, PatternMatch, PatternScanOptions, PatternScanResult, PatternSeverity } from "./types.js";

const SEVERITY_WEIGHTS: Record<PatternSeverity, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
  info: 0,
};

/** Maps language keys to detector module paths */
const LANGUAGE_DETECTOR_MAP: Record<string, string> = {
  typescript: "./detectors/typescript.js",
  javascript: "./detectors/typescript.js", // JS uses same detectors as TS
  python: "./detectors/python.js",
  csharp: "./detectors/csharp.js",
  java: "./detectors/java.js",
  kotlin: "./detectors/java.js", // Kotlin uses same detectors as Java
  go: "./detectors/go.js",
};

export class PatternEngine {
  private registry = new PatternRegistry();
  private exemplarStore = new ExemplarStore();
  private structuralDetector = new StructuralDetector();
  private semanticValidator: SemanticValidator | null = null;
  private initialized = false;
  private loadedDetectorModules = new Set<string>();

  constructor(private embeddingGen?: EmbeddingGenerator) {}

  /**
   * Lazy initialization — loads YAML rules, exemplars, and common detectors.
   * Language-specific detectors are loaded on-demand per scan.
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    const baseDir = import.meta.dirname;

    // Load YAML rules and exemplars
    await this.registry.load(join(baseDir, "rules"));
    await this.exemplarStore.load(join(baseDir, "exemplars"));

    // Register only common detectors at init — language-specific loaded on demand
    registerDetectors(commonDetectors);

    // Setup semantic validator
    this.semanticValidator = new SemanticValidator(this.exemplarStore, this.embeddingGen);

    this.initialized = true;
    log.i("PATTERN_ENGINE", "initialized", {
      patterns: this.registry.size,
      exemplars: this.exemplarStore.size,
    });
  }

  /**
   * Load language-specific detectors on demand (cached — each module loaded only once)
   */
  private async ensureDetectorsForLanguage(language: string | undefined): Promise<void> {
    if (!language) return;

    const modulePath = LANGUAGE_DETECTOR_MAP[language.toLowerCase()];
    if (!modulePath || this.loadedDetectorModules.has(modulePath)) return;

    try {
      const detectors = await import(modulePath);
      registerDetectors(detectors);
      this.loadedDetectorModules.add(modulePath);
      log.i("PATTERN_ENGINE", "loaded_detectors", { language, module: modulePath });
    } catch {
      /* optional — detector module may not exist */
    }
  }

  /**
   * Full scan — the main entry point
   */
  async scan(options: PatternScanOptions, storage: GraphStorage): Promise<PatternScanResult> {
    await this.initialize();

    const startMs = Date.now();
    const {
      filePath,
      language,
      category = "all",
      tags,
      minConfidence = 0.5,
      severity = "all",
      offset = 0,
      limit = 50,
      entityLimit = 10_000,
      suppressPatterns,
    } = options;

    // 1. Get entities
    const dbLimit = entityLimit;
    let entities: Entity[];
    if (filePath) {
      // Directory path (no file extension or ends with / or \) → use directory search
      const isDirectory = /[\\/]$/.test(filePath) || !/\.\w+$/.test(filePath.split(/[\\/]/).pop() ?? "");
      if (isDirectory && typeof (storage as any).searchEntitiesInDirectory === "function") {
        entities = await (storage as any).searchEntitiesInDirectory(filePath);
      } else {
        entities = await storage.findEntities({ filters: { filePath }, limit: dbLimit });
      }
    } else {
      entities = await storage.findEntities({ limit: dbLimit });
    }

    if (entities.length === 0) {
      return this.emptyResult();
    }

    // 2. Auto-detect language from entities
    const detectedLanguage = language ?? this.detectLanguage(entities);

    // 3. Load detectors for detected language (lazy, cached)
    await this.ensureDetectorsForLanguage(detectedLanguage);

    // 4. Get applicable patterns
    let patterns = this.registry.getPatterns({
      language: detectedLanguage,
      category: category as PatternCategory | "all",
      tags,
      enabledOnly: true,
    });

    // 4b. Apply suppressions
    if (suppressPatterns?.length) {
      const suppressSet = new Set(suppressPatterns);
      patterns = patterns.filter((p) => !suppressSet.has(p.id));
    }

    if (patterns.length === 0) {
      return this.emptyResult(entities.length);
    }

    // 5. Structural detection (fast)
    const candidates = await this.structuralDetector.detect(entities, patterns, storage);

    // 6. Semantic validation
    const patternMap = new Map(patterns.map((p) => [p.id, p]));
    const confirmed = this.semanticValidator
      ? await this.semanticValidator.validate(candidates, patternMap)
      : candidates.map(
          (c) =>
            ({
              patternId: c.pattern.id,
              pattern: c.pattern,
              entityId: c.entity.id,
              entityName: c.entity.name,
              entityType: c.entity.type,
              filePath: c.entity.filePath,
              line: c.entity.location?.start?.line ?? 0,
              structuralConfidence: c.confidence,
              semanticSimilarity: 1.0,
              combinedScore: c.confidence,
              matchedCriteria: c.matchedCriteria,
            }) as PatternMatch,
        );

    // 7. Filter by minConfidence and severity
    let filtered = confirmed.filter((m) => m.combinedScore >= minConfidence);
    if (severity !== "all") {
      filtered = filtered.filter((m) => m.pattern.severity === severity);
    }

    // Sort by combined score descending
    filtered.sort((a, b) => b.combinedScore - a.combinedScore);

    // 8. Group by category
    const antiPatterns = filtered.filter((m) => m.pattern.category === "anti-pattern");
    const bestPatterns = filtered.filter((m) => m.pattern.category === "best-pattern");
    const codeSmells = filtered.filter((m) => m.pattern.category === "code-smell");
    const optimizations = filtered.filter((m) => m.pattern.category === "optimization");

    // 9. Compute health score + top issues
    const healthScore = this.computeHealthScore(antiPatterns, bestPatterns, codeSmells);
    const topIssues = this.computeTopIssues([...antiPatterns, ...codeSmells, ...optimizations]);

    // 10. Apply pagination
    const applyPagination = <T>(arr: T[]): T[] => arr.slice(offset, offset + limit);

    const result: PatternScanResult = {
      antiPatterns: applyPagination(antiPatterns),
      bestPatterns: applyPagination(bestPatterns),
      codeSmells: applyPagination(codeSmells),
      optimizations: applyPagination(optimizations),
      summary: {
        totalEntitiesScanned: entities.length,
        antiPatternCount: antiPatterns.length,
        bestPatternCount: bestPatterns.length,
        codeSmellCount: codeSmells.length,
        optimizationCount: optimizations.length,
        topIssues,
        healthScore,
      },
    };

    log.i("PATTERN_ENGINE", "scan_complete", {
      entities: entities.length,
      patterns: patterns.length,
      candidates: candidates.length,
      confirmed: confirmed.length,
      filtered: filtered.length,
      durationMs: Date.now() - startMs,
    });

    return result;
  }

  /**
   * Check patterns for a specific entity
   */
  async checkEntity(
    entityId: string,
    storage: GraphStorage,
    category: PatternCategory | "all" = "all",
  ): Promise<PatternMatch[]> {
    await this.initialize();

    const entity = await storage.getEntity(entityId);
    if (!entity) return [];

    const language = entity.language ?? (entity.metadata?.language as string | undefined);
    await this.ensureDetectorsForLanguage(language);
    const patterns = this.registry.getPatterns({ language, category, enabledOnly: true });

    const candidates = await this.structuralDetector.detect([entity], patterns, storage);
    const patternMap = new Map(patterns.map((p) => [p.id, p]));

    return this.semanticValidator
      ? await this.semanticValidator.validate(candidates, patternMap)
      : candidates.map(
          (c) =>
            ({
              patternId: c.pattern.id,
              pattern: c.pattern,
              entityId: c.entity.id,
              entityName: c.entity.name,
              entityType: c.entity.type,
              filePath: c.entity.filePath,
              line: c.entity.location?.start?.line ?? 0,
              structuralConfidence: c.confidence,
              semanticSimilarity: 1.0,
              combinedScore: c.confidence,
              matchedCriteria: c.matchedCriteria,
            }) as PatternMatch,
        );
  }

  // ─── Helpers ──────────────────────────────────────────────────────

  private detectLanguage(entities: Entity[]): string | undefined {
    const langCounts = new Map<string, number>();
    for (const e of entities) {
      const lang = e.language ?? (e.metadata?.language as string | undefined);
      if (lang) {
        langCounts.set(lang, (langCounts.get(lang) ?? 0) + 1);
      }
    }
    if (langCounts.size === 0) return undefined;
    return [...langCounts.entries()].sort((a, b) => b[1] - a[1])[0]![0];
  }

  private computeHealthScore(
    antiPatterns: PatternMatch[],
    bestPatterns: PatternMatch[],
    codeSmells: PatternMatch[],
  ): number {
    let antiWeight = 0;
    for (const m of antiPatterns) {
      antiWeight += SEVERITY_WEIGHTS[m.pattern.severity] ?? 1;
    }
    for (const m of codeSmells) {
      antiWeight += (SEVERITY_WEIGHTS[m.pattern.severity] ?? 1) * 0.5;
    }

    const bestWeight = bestPatterns.length;
    const score = Math.round((100 * (bestWeight + 1)) / (bestWeight + antiWeight + 1));
    return Math.max(0, Math.min(100, score));
  }

  private computeTopIssues(
    matches: PatternMatch[],
  ): Array<{ patternId: string; count: number; severity: PatternSeverity }> {
    const counts = new Map<string, { count: number; severity: PatternSeverity }>();
    for (const m of matches) {
      const existing = counts.get(m.patternId);
      if (existing) {
        existing.count++;
      } else {
        counts.set(m.patternId, { count: 1, severity: m.pattern.severity });
      }
    }

    return [...counts.entries()]
      .map(([patternId, data]) => ({ patternId, ...data }))
      .sort((a, b) => {
        const severityDiff = (SEVERITY_WEIGHTS[b.severity] ?? 0) - (SEVERITY_WEIGHTS[a.severity] ?? 0);
        return severityDiff !== 0 ? severityDiff : b.count - a.count;
      })
      .slice(0, 10);
  }

  private emptyResult(scanned = 0): PatternScanResult {
    return {
      antiPatterns: [],
      bestPatterns: [],
      codeSmells: [],
      optimizations: [],
      summary: {
        totalEntitiesScanned: scanned,
        antiPatternCount: 0,
        bestPatternCount: 0,
        codeSmellCount: 0,
        optimizationCount: 0,
        topIssues: [],
        healthScore: 100,
      },
    };
  }
}
