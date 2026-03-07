/**
 * AutoDoc Generator
 *
 * Automatically generates documentation for the codebase:
 * - General docs in .autodoc/ (architecture, overview)
 * - Module docs as AUTODOC.md next to code
 */

import path from "node:path";
import { log } from "../../logging/index.js";
import { fileExists, readdir, readText } from "../../utils/file-ops.js";
import { mapParallel } from "../../utils/parallel.js";

export interface ModuleInfo {
  name: string;
  path: string;
  files: string[];
  hasIndex: boolean;
  exports: string[];
  description?: string | undefined;
}

export interface GenerateOptions {
  /** Root directory to scan */
  rootDir: string;
  /** Output directory for general docs (default: .autodoc) */
  autodocDir?: string | undefined;
  /** Patterns to exclude */
  exclude?: string[] | undefined;
  /** Max depth to scan */
  maxDepth?: number | undefined;
  /** Concurrency for parallel operations */
  concurrency?: number | undefined;
}

export interface GenerateResult {
  /** Modules found */
  modules: ModuleInfo[];
  /** Files that would be generated */
  files: Array<{
    path: string;
    type: "general" | "module";
    content: string;
  }>;
}

const DEFAULT_EXCLUDE = ["node_modules", "dist", "build", ".git", "__tests__", "fixtures", ".autodoc"];

/** Module documentation filename */
const MODULE_DOC_FILENAME = "AUTODOC.md";

/**
 * Scan directory for modules (folders with .ts/.js files)
 */
export async function scanModules(
  rootDir: string,
  options: {
    exclude?: string[] | undefined;
    maxDepth?: number | undefined;
    concurrency?: number | undefined;
  } = {},
): Promise<ModuleInfo[]> {
  const exclude = options.exclude || DEFAULT_EXCLUDE;
  const maxDepth = options.maxDepth ?? 4;
  const concurrency = options.concurrency ?? 8;

  const modules: ModuleInfo[] = [];

  // BFS scan
  const queue: Array<{ dir: string; depth: number }> = [{ dir: rootDir, depth: 0 }];

  while (queue.length > 0) {
    // Process directories in parallel batches
    const batch = queue.splice(0, concurrency);

    const results = await mapParallel(
      batch,
      async ({ dir, depth }) => {
        if (depth > maxDepth) return { subdirs: [], module: null };

        const entries = await readdir(dir, { withFileTypes: true });
        const subdirs: Array<{ dir: string; depth: number }> = [];
        const tsFiles: string[] = [];
        let hasIndex = false;

        for (const entry of entries) {
          const name = entry.name;
          const fullPath = path.join(dir, name);

          if (entry.isDirectory()) {
            if (!exclude.includes(name) && !name.startsWith(".")) {
              subdirs.push({ dir: fullPath, depth: depth + 1 });
            }
          } else if (entry.isFile()) {
            const isCodeFile =
              name.endsWith(".ts") || name.endsWith(".js") || name.endsWith(".mjs") || name.endsWith(".cjs");
            const isTestFile =
              name.endsWith(".test.ts") ||
              name.endsWith(".spec.ts") ||
              name.endsWith(".test.js") ||
              name.endsWith(".spec.js");
            if (isCodeFile && !isTestFile) {
              tsFiles.push(name);
              if (name === "index.ts" || name === "index.js" || name === "index.mjs" || name === "index.cjs") {
                hasIndex = true;
              }
            }
          }
        }

        // If directory has code files, it's a module
        let module: ModuleInfo | null = null;
        if (tsFiles.length > 0) {
          const exports = hasIndex ? await extractExports(path.join(dir, "index.ts")) : [];
          module = {
            name: path.basename(dir),
            path: dir,
            files: tsFiles,
            hasIndex,
            exports,
          };
        }

        return { subdirs, module };
      },
      concurrency,
    );

    for (const { subdirs, module } of results) {
      queue.push(...subdirs);
      if (module) {
        modules.push(module);
      }
    }
  }

  return modules;
}

/**
 * Extract export names from index.ts
 */
async function extractExports(indexPath: string): Promise<string[]> {
  if (!(await fileExists(indexPath))) {
    return [];
  }

  try {
    const content = await readText(indexPath);
    const exports: string[] = [];

    // Match: export { Foo, Bar } from
    const reExportMatch = content.matchAll(/export\s*\{([^}]+)\}/g);
    for (const match of reExportMatch) {
      if (match[1]) {
        const names = match[1].split(",").map((n) => n.trim().split(" ")[0]);
        exports.push(...names.filter((n): n is string => !!n && !n.startsWith("type")));
      }
    }

    // Match: export class/function/const Foo
    const directMatch = content.matchAll(/export\s+(?:class|function|const|interface|type)\s+(\w+)/g);
    for (const match of directMatch) {
      if (match[1]) {
        exports.push(match[1]);
      }
    }

    return [...new Set(exports)].slice(0, 20); // Limit to 20
  } catch {
    return [];
  }
}

/**
 * Generate README content for a module
 */
export function generateModuleReadme(module: ModuleInfo): string {
  const lines: string[] = [];

  // Title
  const title = module.name
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  lines.push(`# ${title}`);
  lines.push("");

  // Description placeholder
  if (module.description) {
    lines.push(module.description);
  } else {
    lines.push(`Module for ${module.name} functionality.`);
  }
  lines.push("");

  // Exports
  if (module.exports.length > 0) {
    lines.push("## Exports");
    lines.push("");
    for (const exp of module.exports) {
      lines.push(`- \`${exp}\``);
    }
    lines.push("");
  }

  // Files
  lines.push("## Files");
  lines.push("");
  for (const file of module.files.slice(0, 15)) {
    lines.push(`- \`${file}\``);
  }
  if (module.files.length > 15) {
    lines.push(`- ... and ${module.files.length - 15} more`);
  }
  lines.push("");

  return lines.join("\n");
}

/** Extended module info with entities */
export interface ModuleInfoWithEntities extends ModuleInfo {
  entities: Array<{
    file: string;
    name: string;
    type: string;
    exported: boolean;
    line: number;
    endLine: number;
  }>;
}

/**
 * Generate README content for a module with entity line ranges
 * Format: `[→ file.ts:10-25]` for AI-friendly code navigation
 */
export async function generateModuleReadmeWithEntities(
  module: ModuleInfo,
  extractEntities: (
    content: string,
    fileName: string,
  ) => Array<{
    name: string;
    type: string;
    exported: boolean;
    line: number;
    endLine: number;
  }>,
  llmDescriptions?: {
    exportDescs?: Record<string, string> | undefined;
    fileDescs?: Record<string, string> | undefined;
  },
): Promise<string> {
  // Debug logging
  log.i("AUTODOC_GEN", "generate_readme", {
    module: module.name,
    hasLlmDescs: !!llmDescriptions,
    exportDescsCount: llmDescriptions?.exportDescs ? Object.keys(llmDescriptions.exportDescs).length : 0,
    fileDescsCount: llmDescriptions?.fileDescs ? Object.keys(llmDescriptions.fileDescs).length : 0,
    moduleDesc: module.description?.slice(0, 50) || "none",
  });

  const lines: string[] = [];

  // Title
  const title = module.name
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  lines.push(`# ${title}`);
  lines.push("");

  // Description placeholder
  if (module.description) {
    lines.push(module.description);
  } else {
    lines.push(`Module for ${module.name} functionality.`);
  }
  lines.push("");

  // Collect all entities from files
  const allEntities: Array<{
    file: string;
    name: string;
    type: string;
    exported: boolean;
    line: number;
    endLine: number;
  }> = [];

  for (const file of module.files) {
    const filePath = path.join(module.path, file);
    try {
      const content = await readText(filePath);
      const fileEntities = extractEntities(content, file);
      for (const entity of fileEntities) {
        allEntities.push({
          file,
          ...entity,
        });
      }
    } catch {
      // Skip files that can't be read
    }
  }

  // Exports section with line ranges and descriptions (sorted alphabetically)
  const exportedEntities = allEntities.filter((e) => e.exported).sort((a, b) => a.name.localeCompare(b.name));
  const hasExportDescs = llmDescriptions?.exportDescs && Object.keys(llmDescriptions.exportDescs).length > 0;

  if (exportedEntities.length > 0) {
    lines.push("## Exports");
    lines.push("");

    if (hasExportDescs) {
      // Table with Description column - show ALL exports
      lines.push("| Name | Type | Description | Location |");
      lines.push("|------|------|-------------|----------|");
      for (const entity of exportedEntities) {
        const location =
          entity.line === entity.endLine
            ? `${entity.file}:${entity.line}`
            : `${entity.file}:${entity.line}-${entity.endLine}`;
        const desc = llmDescriptions!.exportDescs![entity.name] || "";
        lines.push(`| \`${entity.name}\` | ${entity.type} | ${desc} | [→ ${location}] |`);
      }
    } else {
      // Table without Description column - show ALL exports
      lines.push("| Name | Type | Location |");
      lines.push("|------|------|----------|");
      for (const entity of exportedEntities) {
        const location =
          entity.line === entity.endLine
            ? `${entity.file}:${entity.line}`
            : `${entity.file}:${entity.line}-${entity.endLine}`;
        lines.push(`| \`${entity.name}\` | ${entity.type} | [→ ${location}] |`);
      }
    }
    lines.push("");
  }

  // Files section with descriptions (sorted alphabetically)
  lines.push("## Files");
  lines.push("");

  const sortedFiles = [...module.files].sort((a, b) => a.localeCompare(b));
  for (const file of sortedFiles.slice(0, 15)) {
    // Prefer LLM description if available
    const llmDesc = llmDescriptions?.fileDescs?.[file];

    if (llmDesc) {
      lines.push(`- **${file}** — ${llmDesc}`);
    } else {
      // No description available - just show filename
      lines.push(`- \`${file}\``);
    }
  }
  if (sortedFiles.length > 15) {
    lines.push(`- ... and ${sortedFiles.length - 15} more files`);
  }
  lines.push("");

  return lines.join("\n");
}

/**
 * Generate general architecture doc
 */
export function generateArchitectureDoc(projectName: string, modules: ModuleInfo[]): string {
  const lines: string[] = [];

  lines.push(`# ${projectName} Architecture`);
  lines.push("");
  lines.push("## Overview");
  lines.push("");
  lines.push(`This project contains ${modules.length} modules.`);
  lines.push("");

  // Group modules by parent directory
  const groups = new Map<string, ModuleInfo[]>();
  for (const mod of modules) {
    const parent = path.basename(path.dirname(mod.path));
    let arr = groups.get(parent);
    if (!arr) {
      arr = [];
      groups.set(parent, arr);
    }
    arr.push(mod);
  }

  lines.push("## Module Structure");
  lines.push("");

  for (const [group, mods] of groups) {
    if (mods.length > 1) {
      lines.push(`### ${group}/`);
      for (const mod of mods) {
        lines.push(`- **${mod.name}**: ${mod.files.length} files`);
      }
      lines.push("");
    }
  }

  // Top-level modules
  const firstModulePath = modules[0]?.path;
  const topLevel = firstModulePath ? modules.filter((m) => path.dirname(m.path) === path.dirname(firstModulePath)) : [];
  if (topLevel.length > 0) {
    lines.push("## Core Modules");
    lines.push("");
    for (const mod of topLevel) {
      lines.push(`- **${mod.name}**: ${mod.exports.slice(0, 5).join(", ") || "internal"}`);
    }
    lines.push("");
  }

  return lines.join("\n");
}

/**
 * Generate all documentation files (preview mode)
 *
 * NOTE: .autodoc/ files (architecture, dependencies, etc.) are NOT generated here.
 * They are handled separately by ensureGeneralDocs() which:
 * - Creates template files if they don't exist
 * - Only updates file references (line numbers) in existing files
 * - NEVER overwrites user content
 */
export async function generateDocs(options: GenerateOptions): Promise<GenerateResult> {
  const modules = await scanModules(options.rootDir, {
    ...(options.exclude != null ? { exclude: options.exclude } : {}),
    maxDepth: options.maxDepth,
    concurrency: options.concurrency,
  });

  const files: GenerateResult["files"] = [];

  // NOTE: We intentionally DO NOT generate .autodoc/ files here
  // Those files contain high-level documentation written by humans
  // and should only have their file references updated, not content

  // Generate module AUTODOC.md files only
  for (const mod of modules) {
    const autodocPath = path.join(mod.path, MODULE_DOC_FILENAME);
    files.push({
      path: autodocPath,
      type: "module",
      content: generateModuleReadme(mod),
    });
  }

  return { modules, files };
}
