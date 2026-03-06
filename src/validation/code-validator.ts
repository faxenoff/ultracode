/**
 * Code Validator - Multi-language Linting and Validation
 *
 * Provides code validation with before/after comparison:
 * - oxlint for TypeScript/JavaScript (~100x faster than ESLint)
 * - Pylint for Python
 * - Extensible linter interface
 *
 * Features:
 * - Batch validation with concurrency
 * - Before/after problem comparison
 * - Severity categorization (error/warning/info)
 *
 * Architecture References:
 * - Linters: src/validation/linters/
 */

import { extname, join } from "node:path";
import { log } from "../logging/index.js";
import { readdir, readText } from "../utils/file-ops.js";

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

export interface ValidationReport {
  filePath: string;
  timestamp: number;
  problems: ValidationProblem[];
  summary: {
    errors: number;
    warnings: number;
    info: number;
    total: number;
  };
  linterUsed: string;
}

export interface ValidationProblem {
  severity: "error" | "warning" | "info";
  message: string;
  line: number;
  column: number;
  ruleId?: string | undefined;
  source?: string | undefined; // linter name
}

export interface BeforeAfterReport {
  before: ValidationReport;
  after: ValidationReport;
  improvement: {
    errorsFixed: number;
    warningsFixed: number;
    newErrors: number;
    newWarnings: number;
    netChange: number; // negative = improvement
  };
}

// =============================================================================
// LINTER INTERFACE
// =============================================================================

export interface Linter {
  name: string;
  lint(filePath: string, content: string, autofix?: boolean, dryRun?: boolean): Promise<ValidationProblem[]>;
}

// =============================================================================
// CODE VALIDATOR IMPLEMENTATION
// =============================================================================

export class CodeValidator {
  private linters: Map<string, Linter> = new Map();

  constructor() {
    this.initializeLinters();
  }

  /**
   * Initialize linters (lazy loading)
   */
  private async initializeLinters(): Promise<void> {
    // Linters will be loaded on-demand
    // This prevents import errors if oxlint/Pylint are not installed
  }

  /**
   * Validate a single file
   */
  async validateFile(filePath: string): Promise<ValidationReport> {
    const ext = extname(filePath).toLowerCase();
    const linter = await this.selectLinter(ext);

    if (!linter) {
      return {
        filePath,
        timestamp: Date.now(),
        problems: [],
        summary: { errors: 0, warnings: 0, info: 0, total: 0 },
        linterUsed: "none",
      };
    }

    // Read file
    const content = await readText(filePath);

    // Run linter
    const problems = await linter.lint(filePath, content);

    // Categorize problems by severity
    const summary = this.categorizeProblems(problems);

    return {
      filePath,
      timestamp: Date.now(),
      problems,
      summary,
      linterUsed: linter.name,
    };
  }

  /**
   * Validate multiple files in a directory
   */
  async validateDirectory(
    dirPath: string,
    extensions: string[] = [".ts", ".tsx", ".js", ".jsx", ".py"],
  ): Promise<ValidationReport[]> {
    const files = await this.findFiles(dirPath, extensions);
    const reports: ValidationReport[] = [];

    // Batch validation with concurrency limit
    const batchSize = 10;
    for (let i = 0; i < files.length; i += batchSize) {
      const batch = files.slice(i, i + batchSize);
      const batchReports = await Promise.all(batch.map((file) => this.validateFile(file)));
      reports.push(...batchReports);
    }

    return reports;
  }

  /**
   * Validate modification (before/after comparison)
   */
  async validateModification(filePath: string, beforeReport?: ValidationReport): Promise<BeforeAfterReport> {
    const before = beforeReport || (await this.validateFile(filePath));
    const after = await this.validateFile(filePath);

    const improvement = this.compareReports(before, after);

    return { before, after, improvement };
  }

  /**
   * Compare two validation reports
   */
  private compareReports(before: ValidationReport, after: ValidationReport): BeforeAfterReport["improvement"] {
    const errorsFixed = Math.max(0, before.summary.errors - after.summary.errors);
    const warningsFixed = Math.max(0, before.summary.warnings - after.summary.warnings);
    const newErrors = Math.max(0, after.summary.errors - before.summary.errors);
    const newWarnings = Math.max(0, after.summary.warnings - before.summary.warnings);

    const netChange = newErrors + newWarnings - (errorsFixed + warningsFixed);

    return {
      errorsFixed,
      warningsFixed,
      newErrors,
      newWarnings,
      netChange,
    };
  }

  /**
   * Categorize problems by severity
   */
  private categorizeProblems(problems: ValidationProblem[]): ValidationReport["summary"] {
    const summary = {
      errors: 0,
      warnings: 0,
      info: 0,
      total: problems.length,
    };

    for (const problem of problems) {
      switch (problem.severity) {
        case "error":
          summary.errors++;
          break;
        case "warning":
          summary.warnings++;
          break;
        case "info":
          summary.info++;
          break;
      }
    }

    return summary;
  }

  /**
   * Select appropriate linter for file extension
   */
  private async selectLinter(ext: string): Promise<Linter | null> {
    switch (ext) {
      case ".ts":
      case ".tsx":
      case ".js":
      case ".jsx":
      case ".mjs":
      case ".cjs":
        return this.getOrLoadLinter("oxlint");
      case ".py":
      case ".pyi":
        return this.getOrLoadLinter("pylint");
      default:
        return null;
    }
  }

  /**
   * Get or load linter (lazy loading)
   */
  private async getOrLoadLinter(linterName: string): Promise<Linter | null> {
    if (this.linters.has(linterName)) {
      return this.linters.get(linterName)!;
    }

    try {
      if (linterName === "oxlint") {
        const { OxlintLinter } = await import("./linters/oxlint-linter.js");
        const linter = new OxlintLinter();
        this.linters.set("oxlint", linter);
        return linter;
      } else if (linterName === "pylint") {
        const { PylintLinter } = await import("./linters/pylint-linter.js");
        const linter = new PylintLinter();
        this.linters.set("pylint", linter);
        return linter;
      }
    } catch (error) {
      log.w("CODEVALIDATOR", "linter_load_fail", { linter: linterName, err: String(error) });
      return null;
    }

    return null;
  }

  /**
   * Find files matching extensions (parallel directory traversal)
   */
  private async findFiles(dirPath: string, extensions: string[]): Promise<string[]> {
    const EXCLUDED_DIRS = new Set(["node_modules", ".git", "dist", "build", "coverage"]);

    async function walk(dir: string): Promise<string[]> {
      const entries = await readdir(dir, { withFileTypes: true });
      const files: string[] = [];
      const subdirPromises: Promise<string[]>[] = [];

      for (const entry of entries) {
        const fullPath = join(dir, entry.name);

        if (entry.isDirectory()) {
          // Skip excluded directories
          if (EXCLUDED_DIRS.has(entry.name)) {
            continue;
          }
          // Queue subdirectory for parallel processing
          subdirPromises.push(walk(fullPath));
        } else if (extensions.some((ext) => entry.name.endsWith(ext))) {
          files.push(fullPath);
        }
      }

      // Process all subdirectories in parallel
      if (subdirPromises.length > 0) {
        const subdirResults = await Promise.all(subdirPromises);
        for (const subdirFiles of subdirResults) {
          files.push(...subdirFiles);
        }
      }

      return files;
    }

    return walk(dirPath);
  }
}
