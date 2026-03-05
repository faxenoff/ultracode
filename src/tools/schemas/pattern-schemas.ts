/**
 * Pattern Detection Tool Schemas
 */

import { z } from "zod";

export const DetectPatternsSchema = z.object({
  projectPath: z.string().optional().describe("Project directory path"),
  filePath: z.string().optional().describe("Scan specific file only"),
  language: z
    .string()
    .optional()
    .describe("Filter by language (auto-detected if omitted). Values: typescript, python, csharp, java, go"),
  category: z
    .enum(["anti-pattern", "best-pattern", "code-smell", "optimization", "all"])
    .optional()
    .default("all")
    .describe("Pattern category to detect"),
  tags: z
    .array(z.string())
    .optional()
    .describe("Filter by tags: async, performance, memory, security, error-handling, architecture, etc."),
  minConfidence: z.number().min(0).max(1).optional().default(0.5).describe("Minimum combined score threshold (0-1)"),
  severity: z
    .enum(["critical", "high", "medium", "low", "info", "all"])
    .optional()
    .default("all")
    .describe("Filter by severity level"),
  format: z
    .enum(["summary", "detailed", "json"])
    .optional()
    .default("summary")
    .describe("Output format: summary (AI-friendly), detailed (human-readable), json (raw data)"),
  offset: z.number().optional().default(0).describe("Pagination offset"),
  limit: z.number().optional().default(50).describe("Maximum results per category"),
  entityLimit: z.number().optional().default(10000).describe("Max entities to scan from DB (default: 10000)"),
  suppressPatterns: z
    .array(z.string())
    .optional()
    .describe(
      "Pattern IDs to suppress (skip). Use for known false positives, e.g. ['cs:empty-interface', 'cs:no-asnotracking']",
    ),
});

export const CheckEntityPatternsSchema = z.object({
  entityId: z.string().describe("Entity ID to check"),
  projectPath: z.string().optional().describe("Project directory path"),
  category: z
    .enum(["anti-pattern", "best-pattern", "code-smell", "optimization", "all"])
    .optional()
    .default("all")
    .describe("Pattern category to check"),
});
