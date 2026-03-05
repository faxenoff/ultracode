/**
 * Pattern Detection Tool Handlers
 *
 * MCP handlers for detect_patterns and check_entity_patterns
 */

import type { z } from "zod";
import { PatternEngine } from "../../analysis/patterns/pattern-engine.js";
import { PatternFormatter } from "../../analysis/patterns/pattern-formatter.js";
import type { PatternCategory, PatternScanOptions } from "../../analysis/patterns/types.js";
import { log } from "../../logging/index.js";
import { toError } from "../../utils/error-handling.js";
import { BaseToolHandler, type ToolResult } from "../base-tool-handler.js";
import { CheckEntityPatternsSchema, DetectPatternsSchema } from "../schemas/pattern-schemas.js";

// Shared lazy PatternEngine instance
let sharedEngine: PatternEngine | null = null;

function getEngine(embeddingGen?: unknown): PatternEngine {
  if (!sharedEngine) {
    sharedEngine = new PatternEngine(embeddingGen as any);
  }
  return sharedEngine;
}

// ─── detect_patterns ───────────────────────────────────────────────

export class DetectPatternsToolHandler extends BaseToolHandler<z.infer<typeof DetectPatternsSchema>> {
  protected parseArgs(args: unknown): z.infer<typeof DetectPatternsSchema> {
    return DetectPatternsSchema.parse(args);
  }

  protected async execute(args: z.infer<typeof DetectPatternsSchema>): Promise<ToolResult> {
    try {
      const storage = await this.ensureGraphStorageForProject(args.projectPath);

      // Try to get embedding generator for semantic validation
      let embeddingGen: unknown;
      try {
        const semanticAgent = await this.context.getSemanticAgent();
        embeddingGen = (semanticAgent as any).embeddingGenerator ?? (semanticAgent as any).getEmbeddingGenerator?.();
      } catch {
        // No embedding generator — semantic validation disabled
      }

      const engine = getEngine(embeddingGen);

      const options: PatternScanOptions = {
        projectPath: this.resolveProjectPath(args),
        filePath: args.filePath,
        language: args.language,
        category: args.category as PatternCategory | "all",
        tags: args.tags,
        minConfidence: args.minConfidence,
        severity: args.severity === "all" ? "all" : args.severity,
        offset: args.offset,
        limit: args.limit,
        entityLimit: args.entityLimit,
        suppressPatterns: args.suppressPatterns,
      };

      const result = await engine.scan(options, storage);

      const nextSteps: string[] = [];
      const allMatches = [
        ...result.antiPatterns,
        ...result.bestPatterns,
        ...result.codeSmells,
        ...result.optimizations,
      ];
      const hasSecurityPatterns = allMatches.some((m) =>
        m.pattern.tags.some((t) => /security|injection|xss|auth/i.test(t)),
      );
      if (hasSecurityPatterns) {
        nextSteps.push("taint_analysis() — deep security analysis of detected vulnerable patterns");
      }
      nextSteps.push("graph_metrics({metric:'pagerank'}) — rank affected entities by importance");

      let output: string;
      if (args.format === "json") {
        const json = PatternFormatter.toJSON(result) as Record<string, unknown>;
        json["nextSteps"] = nextSteps;
        output = JSON.stringify(json, null, 2);
      } else if (args.format === "detailed") {
        output = PatternFormatter.format(result, "detailed");
        output += `\n\n---\nNext steps:\n${nextSteps.map((s) => `- ${s}`).join("\n")}`;
      } else {
        output = PatternFormatter.format(result, "summary");
        output += `\n\n---\nNext steps:\n${nextSteps.map((s) => `- ${s}`).join("\n")}`;
      }

      return {
        content: [{ type: "text", text: output }],
      };
    } catch (err) {
      const error = toError(err);
      log.e("DETECT_PATTERNS", "scan_error", { error: error.message });
      return {
        content: [{ type: "text", text: `Error: ${error.message}` }],
      };
    }
  }
}

// ─── check_entity_patterns ─────────────────────────────────────────

export class CheckEntityPatternsToolHandler extends BaseToolHandler<z.infer<typeof CheckEntityPatternsSchema>> {
  protected parseArgs(args: unknown): z.infer<typeof CheckEntityPatternsSchema> {
    return CheckEntityPatternsSchema.parse(args);
  }

  protected async execute(args: z.infer<typeof CheckEntityPatternsSchema>): Promise<ToolResult> {
    try {
      const storage = await this.ensureGraphStorageForProject(args.projectPath);

      let embeddingGen: unknown;
      try {
        const semanticAgent = await this.context.getSemanticAgent();
        embeddingGen = (semanticAgent as any).embeddingGenerator ?? (semanticAgent as any).getEmbeddingGenerator?.();
      } catch {
        // No embedding generator
      }

      const engine = getEngine(embeddingGen);

      const matches = await engine.checkEntity(args.entityId, storage, args.category as PatternCategory | "all");

      if (matches.length === 0) {
        return {
          content: [{ type: "text", text: `No pattern matches found for entity ${args.entityId}` }],
        };
      }

      const output = {
        entityId: args.entityId,
        matchCount: matches.length,
        matches: matches.map((m) => ({
          patternId: m.patternId,
          category: m.pattern.category,
          severity: m.pattern.severity,
          name: m.pattern.name,
          description: m.pattern.description,
          suggestion: m.pattern.suggestion,
          bigO: m.pattern.bigO,
          benchmark: m.pattern.benchmark,
          combinedScore: Number(m.combinedScore.toFixed(3)),
          structuralConfidence: Number(m.structuralConfidence.toFixed(3)),
          semanticSimilarity: Number(m.semanticSimilarity.toFixed(3)),
          matchedCriteria: m.matchedCriteria,
          closestExemplar: m.closestExemplar,
        })),
      };

      return {
        content: [{ type: "text", text: JSON.stringify(output, null, 2) }],
      };
    } catch (err) {
      const error = toError(err);
      log.e("CHECK_ENTITY_PATTERNS", "check_error", { error: error.message });
      return {
        content: [{ type: "text", text: `Error: ${error.message}` }],
      };
    }
  }
}
