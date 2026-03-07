/**
 * AutoDoc Updater
 *
 * Incrementally updates AUTODOC.md content based on code changes.
 * Updates:
 * - Export list (adds new, removes deleted)
 * - File list
 * - Line number references
 * - Timestamps
 */

import path from "node:path";
import { log } from "../../logging/index.js";
import { fileExists, readText } from "../../utils/file-ops.js";
import type { ModuleInfo } from "../generator/doc-generator.js";
import { aggregateLanguageDetection, detectLanguageFromCode } from "../i18n/language-detector.js";
import { extractEntitiesFromContent, extractExportsFromFile, getModuleFiles } from "./module-resolver.js";

export interface UpdateOptions {
  /** Use LLM for description generation */
  useLlm?: boolean | undefined;
  /** LLM config */
  llmConfig?:
    | {
        provider: "ollama" | "openai" | "tgi";
        model?: string | undefined;
        endpoint?: string | undefined;
      }
    | undefined;
}

/**
 * Extended ModuleInfo with LLM-generated descriptions
 */
interface ModuleInfoWithLLM extends ModuleInfo {
  _llmExportDescs?: Record<string, string>;
  _llmFileDescs?: Record<string, string>;
}

interface ParsedAutodoc {
  title: string;
  description: string;
  sections: Map<string, string>;
  rawContent: string;
}

/**
 * Update AUTODOC.md content incrementally
 */
export async function updateAutodocContent(
  currentContent: string,
  moduleInfo: ModuleInfo,
  changedFiles: string[],
  _options: UpdateOptions = {},
): Promise<string> {
  // Parse current AUTODOC structure
  const parsed = parseAutodoc(currentContent);

  // Get fresh module data
  const freshExports = await extractExportsFromFile(path.join(moduleInfo.path, "index.ts"));
  const freshFiles = await getModuleFiles(moduleInfo.path);

  // Update sections
  let updatedContent = currentContent;

  // 1. Update exports section
  updatedContent = updateExportsSection(updatedContent, freshExports, parsed);

  // 2. Update files section
  updatedContent = updateFilesSection(updatedContent, freshFiles, parsed);

  // 3. Update line number references in changed files
  for (const changedFile of changedFiles) {
    if (changedFile === "force-update") continue;
    updatedContent = await updateLineReferences(updatedContent, changedFile, moduleInfo.path);
  }

  // 4. Update description via LLM if it's a placeholder
  log.i("AUTODOC_LLM", "update_check", { module: moduleInfo.name, useLlm: _options.useLlm });
  if (_options.useLlm) {
    updatedContent = await updateDescription(updatedContent, moduleInfo, _options);
  }

  // Note: Timestamp updates removed - file modification time serves this purpose

  return updatedContent;
}

/**
 * Parse AUTODOC.md into sections
 */
function parseAutodoc(content: string): ParsedAutodoc {
  const lines = content.split("\n");
  let title = "";
  let description = "";
  const sections = new Map<string, string>();

  let currentSection = "";
  let currentContent: string[] = [];
  let inDescription = false;

  for (const line of lines) {
    // Title (# heading)
    if (line.startsWith("# ") && !title) {
      title = line.slice(2).trim();
      inDescription = true;
      continue;
    }

    // New section (## heading)
    if (line.startsWith("## ")) {
      // Save previous section
      if (currentSection) {
        sections.set(currentSection, currentContent.join("\n").trim());
      } else if (inDescription) {
        description = currentContent.join("\n").trim();
      }

      currentSection = line.slice(3).trim().toLowerCase();
      currentContent = [];
      inDescription = false;
      continue;
    }

    currentContent.push(line);
  }

  // Save last section
  if (currentSection) {
    sections.set(currentSection, currentContent.join("\n").trim());
  }

  return { title, description, sections, rawContent: content };
}

/**
 * Update exports section with fresh data
 * Preserves table format if present, otherwise uses list format
 */
function updateExportsSection(content: string, exports: string[], parsed: ParsedAutodoc): string {
  // Find exports section
  const exportsSection = parsed.sections.get("exports") || parsed.sections.get("экспорты");
  if (!exportsSection && exports.length === 0) {
    return content;
  }

  // Find exports section in content
  const exportsSectionRegex = /## (?:Exports|Экспорты)\s*\n([\s\S]*?)(?=\n## |\n$|$)/i;
  const match = content.match(exportsSectionRegex);

  if (match) {
    const sectionContent = match[1] || "";
    const isTableFormat = sectionContent.includes("| Name |") || sectionContent.includes("|---");

    // If table format - preserve it, only update line numbers will be done by updateLineReferences
    if (isTableFormat) {
      // For table format, we need to:
      // 1. Add new exports that don't exist
      // 2. Remove exports that no longer exist
      // But keep existing line references
      const existingExports = new Set<string>();
      const tableRowRegex = /\|\s*`(\w+)`\s*\|/g;
      let rowMatch: RegExpExecArray | null;
      while ((rowMatch = tableRowRegex.exec(sectionContent)) !== null) {
        if (rowMatch[1]) existingExports.add(rowMatch[1]);
      }

      const newExportsSet = new Set(exports.filter((e) => e !== "*"));

      // Check if exports changed
      const added = [...newExportsSet].filter((e) => !existingExports.has(e));
      const removed = [...existingExports].filter((e) => !newExportsSet.has(e));

      if (added.length === 0 && removed.length === 0) {
        // No changes to exports
        return content;
      }

      // Table preserved as-is — line references updated separately
      return content;
    }

    // Check if list format with descriptions (- `export` — description)
    const hasDescriptions =
      sectionContent.includes("` —") || sectionContent.includes("` -") || sectionContent.includes("**");

    if (hasDescriptions) {
      // Preserve list format with descriptions
      return content;
    }

    // Check if prose text (not a simple list) - e.g., "The module has no public exports..."
    const isSimpleList = /^(\s*-\s*`\w+`\s*\n?)+$/m.test(sectionContent.trim());
    if (!isSimpleList && sectionContent.trim().length > 10) {
      // Preserve prose description
      return content;
    }

    // Simple list format without descriptions - update with fresh list
    const filteredExports = exports.filter((e) => e !== "*");
    if (filteredExports.length === 0) {
      // No exports - preserve existing content
      return content;
    }

    const newExportsList = filteredExports.map((e) => `- \`${e}\``).join("\n");

    const sectionHeader = match[0].split("\n")[0];
    const newSection = `${sectionHeader}\n\n${newExportsList}\n`;
    return content.replace(exportsSectionRegex, newSection);
  }

  // If no exports section exists and we have exports, add one before Files section
  if (exports.length > 0) {
    const newExportsList = exports
      .filter((e) => e !== "*")
      .map((e) => `- \`${e}\``)
      .join("\n");

    const filesRegex = /## (?:Files|Файлы)/i;
    const filesMatch = content.match(filesRegex);
    if (filesMatch) {
      const insertPoint = content.indexOf(filesMatch[0]);
      const exportsSectionText = `## Exports\n\n${newExportsList}\n\n`;
      return content.slice(0, insertPoint) + exportsSectionText + content.slice(insertPoint);
    }
  }

  return content;
}

/**
 * Update files section with fresh data
 * Preserves enhanced format (with entity summaries) if present
 */
function updateFilesSection(content: string, files: string[], _parsed: ParsedAutodoc): string {
  if (files.length === 0) {
    return content;
  }

  // Find files section in content
  const filesSectionRegex = /## (?:Files|Файлы)\s*\n([\s\S]*?)(?=\n## |\n$|$)/i;
  const match = content.match(filesSectionRegex);

  if (match) {
    const sectionContent = match[1] || "";

    // Check if table format (| File | Description |)
    const isTableFormat =
      sectionContent.includes("|---") || sectionContent.includes("| Файл |") || sectionContent.includes("| File |");

    if (isTableFormat) {
      // Preserve table format - it contains descriptions
      // Line references will be updated by updateLineReferences
      return content;
    }

    // Check if enhanced format (with entity summaries like "- **file.ts** — `func1`, `func2`")
    const isEnhancedFormat = sectionContent.includes("** —") || sectionContent.includes("** —");

    if (isEnhancedFormat) {
      // Preserve enhanced format - it contains entity information
      return content;
    }

    // Check if prose text (not a simple list)
    const isSimpleFileList = /^(\s*-\s*`[^`]+`\s*\n?)+$/m.test(sectionContent.trim());
    if (!isSimpleFileList && sectionContent.trim().length > 10) {
      // Preserve prose description
      return content;
    }

    // Simple format - update with fresh list
    const displayFiles = files.slice(0, 15);
    let newFilesList = displayFiles.map((f) => `- \`${f}\``).join("\n");
    if (files.length > 15) {
      newFilesList += `\n- ... and ${files.length - 15} more`;
    }

    const sectionHeader = match[0].split("\n")[0];
    const newSection = `${sectionHeader}\n\n${newFilesList}\n`;
    return content.replace(filesSectionRegex, newSection);
  }

  return content;
}

/**
 * Update line number references for a changed file
 * Supports:
 * - Single line: [→ file.ts:25]
 * - Line range: [→ file.ts:10-25]
 * - Table format with entity name: | `entityName` | type | [→ file.ts:10-25] |
 */
async function updateLineReferences(content: string, changedFilePath: string, _modulePath: string): Promise<string> {
  const fileName = path.basename(changedFilePath);

  // Read the changed file to get current line numbers
  if (!(await fileExists(changedFilePath))) {
    return content;
  }

  let fileContent: string;
  try {
    fileContent = await readText(changedFilePath);
  } catch {
    return content;
  }

  // Extract entities with their current line numbers (including endLine)
  const entities = extractEntitiesFromContent(fileContent, fileName);
  const entityMap = new Map<string, { line: number; endLine: number }>();
  for (const entity of entities) {
    entityMap.set(entity.name, { line: entity.line, endLine: entity.endLine });
  }

  let updatedContent = content;

  // Pattern 1: Table row with entity name - most precise
  // Format: | `entityName` | type | [→ file.ts:10-25] |
  const tableRowPattern = new RegExp(
    `(\\|\\s*\`(\\w+)\`\\s*\\|[^|]*\\|\\s*\\[→\\s*${escapeRegex(fileName)}:)(\\d+)(?:-(\\d+))?(\\]\\s*\\|)`,
    "g",
  );

  updatedContent = updatedContent.replace(tableRowPattern, (match, prefix, entityName, startLine, endLine, suffix) => {
    const entityInfo = entityMap.get(entityName);
    if (!entityInfo) {
      return match; // Entity not found, keep original
    }

    const oldStart = parseInt(startLine, 10);
    const oldEnd = endLine ? parseInt(endLine, 10) : oldStart;

    // Check if lines actually changed
    if (entityInfo.line === oldStart && entityInfo.endLine === oldEnd) {
      return match; // No change needed
    }

    // Update with new line numbers
    if (entityInfo.line === entityInfo.endLine) {
      return `${prefix}${entityInfo.line}${suffix}`;
    }
    return `${prefix}${entityInfo.line}-${entityInfo.endLine}${suffix}`;
  });

  // Pattern 2: Standalone line range reference [→ file.ts:10-25]
  const rangeRefPattern = new RegExp(`(\\[→\\s*(?:[^\\]]*[\\/\\\\])?${escapeRegex(fileName)}:)(\\d+)-(\\d+)(\\])`, "g");

  updatedContent = updatedContent.replace(rangeRefPattern, (match, prefix, startLine, endLine, suffix) => {
    const oldStart = parseInt(startLine, 10);
    const oldEnd = parseInt(endLine, 10);

    // Find entity that was at this range
    for (const [_name, info] of entityMap) {
      // Match if start line is within 5 lines of old start
      if (Math.abs(info.line - oldStart) <= 5) {
        if (info.line !== oldStart || info.endLine !== oldEnd) {
          return `${prefix}${info.line}-${info.endLine}${suffix}`;
        }
        return match; // Already correct
      }
    }
    return match;
  });

  // Pattern 3: Single line reference [→ file.ts:25]
  const singleLinePattern = new RegExp(`(\\[→\\s*(?:[^\\]]*[\\/\\\\])?${escapeRegex(fileName)}:)(\\d+)(\\])(?!-)`, "g");

  updatedContent = updatedContent.replace(singleLinePattern, (match, prefix, lineNum, suffix) => {
    const oldLine = parseInt(lineNum, 10);

    // Find entity closest to old line
    let closestEntity: { line: number; endLine: number } | null = null;
    let minDiff = Infinity;

    for (const [_name, info] of entityMap) {
      const diff = Math.abs(info.line - oldLine);
      if (diff < minDiff) {
        minDiff = diff;
        closestEntity = info;
      }
    }

    // If found entity within 10 lines, update
    if (closestEntity && minDiff <= 10) {
      if (closestEntity.line !== oldLine) {
        return `${prefix}${closestEntity.line}${suffix}`;
      }
    }
    return match;
  });

  // Pattern 4: Markdown link format [text](file.ts:LINE)
  const linkPattern = new RegExp(`(\\]\\((?:[^)]*[\\/\\\\])?${escapeRegex(fileName)}:)(\\d+)(\\))`, "g");

  updatedContent = updatedContent.replace(linkPattern, (match, prefix, lineNum, suffix) => {
    const oldLine = parseInt(lineNum, 10);

    for (const [_name, info] of entityMap) {
      if (Math.abs(info.line - oldLine) <= 10) {
        if (info.line !== oldLine) {
          return `${prefix}${info.line}${suffix}`;
        }
        break;
      }
    }
    return match;
  });

  return updatedContent;
}

/**
 * Escape special regex characters
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Diff exports to find added and removed
 */
export function diffExports(oldExports: string[], newExports: string[]): { added: string[]; removed: string[] } {
  const oldSet = new Set(oldExports);
  const newSet = new Set(newExports);

  const added = newExports.filter((e) => !oldSet.has(e));
  const removed = oldExports.filter((e) => !newSet.has(e));

  return { added, removed };
}

/**
 * Generate a brief description for a new export using simple heuristics
 * (without LLM)
 */
export function generateExportDescription(exportName: string, entityType: string | null): string {
  // Convert camelCase/PascalCase to words
  const words = exportName
    .replace(/([A-Z])/g, " $1")
    .trim()
    .toLowerCase();

  if (entityType === "class") {
    return `Class for ${words}`;
  }
  if (entityType === "interface") {
    return `Interface defining ${words}`;
  }
  if (entityType === "type") {
    return `Type definition for ${words}`;
  }
  if (entityType === "function") {
    // Check for common prefixes
    if (exportName.startsWith("get")) {
      return `Gets ${words.replace("get ", "")}`;
    }
    if (exportName.startsWith("set")) {
      return `Sets ${words.replace("set ", "")}`;
    }
    if (exportName.startsWith("create")) {
      return `Creates ${words.replace("create ", "")}`;
    }
    if (exportName.startsWith("is") || exportName.startsWith("has")) {
      return `Checks ${words}`;
    }
    return `Function for ${words}`;
  }
  if (entityType === "const") {
    if (exportName.toUpperCase() === exportName) {
      return `Constant ${exportName}`;
    }
    return `${words}`;
  }

  return words;
}

/**
 * Generate module description using LLM with file-grouped batching
 * Each file's exports are described together with that file's code context
 */
export async function generateModuleDescriptionLLM(
  moduleInfo: ModuleInfo,
  options: UpdateOptions,
): Promise<string | null> {
  if (!options.useLlm) return null;

  try {
    const { detectLLMProviders } = await import("../llm/llm-provider.js");
    const { recommended } = await detectLLMProviders();

    if (!recommended) {
      log.i("AUTODOC_LLM", "no_llm_provider", { module: moduleInfo.name });
      return null;
    }

    log.i("AUTODOC_LLM", "llm_provider_found", { module: moduleInfo.name, provider: recommended.name });

    // Read all files and extract their exports
    const fileData: Array<{ file: string; code: string; exports: string[] }> = [];

    for (const file of moduleInfo.files) {
      try {
        const filePath = path.join(moduleInfo.path, file);
        const content = await readText(filePath);

        // Extract exported names from this file
        const exports = extractExportedNames(content);

        if (exports.length > 0 || file === "index.ts") {
          fileData.push({
            file,
            code: content.split("\n").slice(0, 120).join("\n"),
            exports,
          });
        }
      } catch {
        // Skip files that can't be read
      }
    }

    if (fileData.length === 0) {
      log.i("AUTODOC_LLM", "no_files_with_exports", { module: moduleInfo.name });
      return null;
    }

    // Detect language - prioritize existing AUTODOC.md files, then code comments
    const docLang = await detectDocumentationLanguage(moduleInfo.path, fileData);

    log.i("AUTODOC_LLM", "language_detected", {
      module: moduleInfo.name,
      language: docLang,
    });

    // Language instruction for LLM - strict to prevent mixing
    const langInstruction =
      docLang === "ru"
        ? "CRITICAL: Write ALL descriptions ONLY in Russian. Пиши ВСЕ описания ТОЛЬКО на русском языке. Do NOT mix languages. Do NOT use Chinese or English."
        : docLang === "zh"
          ? "CRITICAL: Write ALL descriptions ONLY in Chinese. 用中文写所有描述。Do NOT mix languages."
          : "Write all descriptions in English only.";

    // Initialize results
    const allExportDescs: Record<string, string> = {};
    const allFileDescs: Record<string, string> = {};
    let moduleDesc = "";

    // Count total exports for token estimation
    const totalExports = fileData.reduce((sum, f) => sum + f.exports.length, 0);

    log.i("AUTODOC_LLM", "single_batch_start", {
      module: moduleInfo.name,
      files: fileData.length,
      totalExports,
    });

    // Build comprehensive prompt with all files and exports in ONE request
    const filesSection = fileData
      .map((f) => {
        const exportsLine = f.exports.length > 0 ? `\nExports: ${f.exports.join(", ")}` : "";
        return `### ${f.file}${exportsLine}\n\`\`\`typescript\n${f.code}\n\`\`\``;
      })
      .join("\n\n");

    const exportsList = fileData
      .filter((f) => f.exports.length > 0)
      .map((f) => f.exports.map((e) => `- ${e} (${f.file})`).join("\n"))
      .join("\n");

    // Build example to guide LLM
    const exampleExport = fileData.find((f) => f.exports.length > 0)?.exports[0] || "ExampleFunc";
    const exampleFile = fileData[0]?.file || "index.ts";
    const exampleDesc =
      docLang === "ru" ? "Описание функции для работы с данными" : "Function description for data processing";
    const exampleFileDesc = docLang === "ru" ? "Основной файл модуля с экспортами" : "Main module file with exports";

    const singlePrompt = `Document this TypeScript module.
${langInstruction}

Module: ${moduleInfo.name}

${filesSection}

=== OUTPUT FORMAT (follow exactly) ===

MODULE_DESC: One sentence describing what this module does

FILES:
- ${exampleFile}: ${exampleFileDesc}
${fileData
  .slice(1)
  .map((f) => `- ${f.file}:`)
  .join("\n")}

EXPORTS:
- ${exampleExport}: ${exampleDesc}
${exportsList
  .split("\n")
  .slice(1)
  .map((line) => {
    const name = line.match(/^-\s*(\w+)/)?.[1] || "";
    return name ? `- ${name}:` : "";
  })
  .filter(Boolean)
  .join("\n")}

=== RULES ===
1. Write description after EVERY colon (:)
2. Each description: 5-10 words
3. ${docLang === "ru" ? "ALL descriptions in Russian" : docLang === "zh" ? "ALL descriptions in Chinese" : "English only"}`;

    const response = await recommended.generate(singlePrompt, {
      maxTokens: 200 + fileData.length * 40 + totalExports * 40,
      temperature: 0.2,
      systemPrompt: "Technical documentation writer. Document every file and export precisely.",
    });

    const responseText = response.text.trim();
    log.i("AUTODOC_LLM", "single_batch_raw", {
      module: moduleInfo.name,
      length: responseText.length,
      preview: responseText.slice(0, 300),
    });

    const result = parseLLMDocResponse(responseText, docLang);
    moduleDesc = result.moduleDesc;
    Object.assign(allFileDescs, result.fileDescs);
    Object.assign(allExportDescs, result.exportDescs);

    log.i("AUTODOC_LLM", "single_batch_done", {
      module: moduleInfo.name,
      moduleDesc: moduleDesc.length,
      files: Object.keys(allFileDescs).length,
      exports: Object.keys(allExportDescs).length,
    });

    // Store all descriptions
    if (Object.keys(allExportDescs).length > 0 || Object.keys(allFileDescs).length > 0) {
      const moduleInfoExt = moduleInfo as ModuleInfoWithLLM;
      moduleInfoExt._llmExportDescs = allExportDescs;
      moduleInfoExt._llmFileDescs = allFileDescs;
      log.i("AUTODOC_LLM", "all_descriptions_stored", {
        module: moduleInfo.name,
        exports: Object.keys(allExportDescs).length,
        files: Object.keys(allFileDescs).length,
      });
    }

    if (moduleDesc && moduleDesc.length > 10) {
      return moduleDesc;
    }

    log.i("AUTODOC_LLM", "no_module_desc", { module: moduleInfo.name });
  } catch (error) {
    log.e("AUTODOC_LLM", "generation_failed", { module: moduleInfo.name, error: String(error) });
  }

  return null;
}

/**
 * Detect documentation language by analyzing existing AUTODOC.md files and code comments.
 * Priority: existing AUTODOC.md > code comments (with 10% threshold)
 */
async function detectDocumentationLanguage(
  modulePath: string,
  fileData: Array<{ file: string; code: string; exports: string[] }>,
): Promise<"en" | "ru" | "zh"> {
  // First, try to find existing AUTODOC.md files in parent directories
  const autodocTexts: string[] = [];

  // Check current module's parent for AUTODOC.md files
  const parentDir = path.dirname(modulePath);
  try {
    const parentEntries = await import("node:fs/promises").then((fs) => fs.readdir(parentDir, { withFileTypes: true }));
    for (const entry of parentEntries) {
      if (entry.isDirectory()) {
        const autodocPath = path.join(parentDir, entry.name, "AUTODOC.md");
        try {
          const content = await readText(autodocPath);
          autodocTexts.push(content);
        } catch {
          // File doesn't exist, skip
        }
      }
    }
  } catch {
    // Parent not readable
  }

  // Also check sibling AUTODOC.md files in src directory
  const srcDir = modulePath.includes("src") ? modulePath.split("src")[0] + "src" : null;
  if (srcDir && srcDir !== parentDir) {
    try {
      const srcEntries = await import("node:fs/promises").then((fs) => fs.readdir(srcDir, { withFileTypes: true }));
      for (const entry of srcEntries.slice(0, 10)) {
        if (entry.isDirectory()) {
          const autodocPath = path.join(srcDir, entry.name, "AUTODOC.md");
          try {
            const content = await readText(autodocPath);
            autodocTexts.push(content);
          } catch {
            // Skip
          }
        }
      }
    } catch {
      // Skip
    }
  }

  // Analyze AUTODOC.md content for language (with low 10% threshold)
  if (autodocTexts.length > 0) {
    const combinedText = autodocTexts.join("\n");
    const { detectLanguageFromText } = await import("../i18n/language-detector.js");
    const result = detectLanguageFromText(combinedText);

    // Use 10% threshold for non-English languages
    const total = result.charCounts.russian + result.charCounts.chinese + result.charCounts.latin;
    if (total > 0) {
      const russianRatio = result.charCounts.russian / total;
      const chineseRatio = result.charCounts.chinese / total;

      if (russianRatio > 0.1) {
        log.d("AUTODOC_LLM", "language_from_autodoc", { lang: "ru", ratio: russianRatio.toFixed(2) });
        return "ru";
      }
      if (chineseRatio > 0.1) {
        log.d("AUTODOC_LLM", "language_from_autodoc", { lang: "zh", ratio: chineseRatio.toFixed(2) });
        return "zh";
      }
    }
  }

  // Fallback: analyze code comments (with 10% threshold)
  const langResults = fileData.map((f) => detectLanguageFromCode(f.code, path.extname(f.file)));
  const langDetection = aggregateLanguageDetection(langResults);

  const total = langDetection.charCounts.russian + langDetection.charCounts.chinese + langDetection.charCounts.latin;
  if (total > 0) {
    const russianRatio = langDetection.charCounts.russian / total;
    const chineseRatio = langDetection.charCounts.chinese / total;

    if (russianRatio > 0.1) return "ru";
    if (chineseRatio > 0.1) return "zh";
  }

  return "en";
}

/**
 * Extract exported symbol names from file content
 */
function extractExportedNames(content: string): string[] {
  const exports: string[] = [];
  const lines = content.split("\n");

  for (const line of lines) {
    if (!line.includes("export ")) continue;

    // export function name
    const funcMatch = line.match(/export\s+(?:async\s+)?function\s+(\w+)/);
    if (funcMatch?.[1]) {
      exports.push(funcMatch[1]);
      continue;
    }

    // export class name
    const classMatch = line.match(/export\s+(?:abstract\s+)?class\s+(\w+)/);
    if (classMatch?.[1]) {
      exports.push(classMatch[1]);
      continue;
    }

    // export interface name
    const ifaceMatch = line.match(/export\s+interface\s+(\w+)/);
    if (ifaceMatch?.[1]) {
      exports.push(ifaceMatch[1]);
      continue;
    }

    // export type name
    const typeMatch = line.match(/export\s+type\s+(\w+)/);
    if (typeMatch?.[1]) {
      exports.push(typeMatch[1]);
      continue;
    }

    // export const/let/var name
    const varMatch = line.match(/export\s+(?:const|let|var)\s+(\w+)/);
    if (varMatch?.[1]) {
      exports.push(varMatch[1]);
      continue;
    }

    // export enum name
    const enumMatch = line.match(/export\s+enum\s+(\w+)/);
    if (enumMatch?.[1]) {
      exports.push(enumMatch[1]);
    }
  }

  return exports;
}

/**
 * Sanitize LLM output by removing characters from wrong language script.
 * Fixes LLM "hallucinations" where it mixes languages despite instructions.
 */
function sanitizeLLMOutput(text: string, targetLang: "en" | "ru" | "zh"): string {
  if (!text) return text;

  const original = text;
  let sanitized = text;

  // Remove markdown artifacts: ** bold **, ` code `, _ italic _
  sanitized = sanitized.replace(/^\*\*\s*/g, "").replace(/\s*\*\*$/g, "");
  sanitized = sanitized.replace(/^`\s*/g, "").replace(/\s*`$/g, "");
  sanitized = sanitized.replace(/^_\s*/g, "").replace(/\s*_$/g, "");
  // Also clean inline bold/italic that wraps the whole text
  sanitized = sanitized.replace(/^\*\*(.*)\*\*$/, "$1").replace(/^_(.*?)_$/, "$1");

  if (targetLang === "ru") {
    // For Russian: remove CJK characters (Chinese/Japanese/Korean)
    // Keep: Cyrillic (0400-04FF), Latin (for code), numbers, punctuation, whitespace
    sanitized = sanitized.replace(/[\u4E00-\u9FFF\u3400-\u4DBF\u3000-\u303F]/g, "");
    // Clean up double spaces or orphan punctuation left behind
    sanitized = sanitized.replace(/\s{2,}/g, " ").trim();
  } else if (targetLang === "zh") {
    // For Chinese: remove Cyrillic characters
    sanitized = sanitized.replace(/[\u0400-\u04FF]/g, "");
    sanitized = sanitized.replace(/\s{2,}/g, " ").trim();
  } else {
    // For English: remove both Cyrillic and CJK
    sanitized = sanitized.replace(/[\u0400-\u04FF\u4E00-\u9FFF\u3400-\u4DBF\u3000-\u303F]/g, "");
    sanitized = sanitized.replace(/\s{2,}/g, " ").trim();
  }

  // Log if characters were removed
  if (sanitized !== original) {
    log.d("AUTODOC_LLM", "sanitized_text", {
      lang: targetLang,
      originalLen: original.length,
      sanitizedLen: sanitized.length,
      removed: original.length - sanitized.length,
    });
  }

  return sanitized;
}

/**
 * Parse LLM documentation response into structured format
 * Handles various LLM output formats: "- name:", "* name:", "name:", etc.
 */
function parseLLMDocResponse(
  response: string,
  targetLang: "en" | "ru" | "zh" = "en",
): {
  moduleDesc: string;
  exportDescs: Record<string, string>;
  fileDescs: Record<string, string>;
} {
  log.d("AUTODOC_LLM", "parse_start", { responseLen: response.length, targetLang });

  const result = {
    moduleDesc: "",
    exportDescs: {} as Record<string, string>,
    fileDescs: {} as Record<string, string>,
  };

  // Extract MODULE_DESC (various formats)
  const moduleDescMatch = response.match(
    /(?:MODULE_DESC|Description|Summary):\s*(.+?)(?=\n(?:EXPORTS|FILES|##)|\n\n|$)/is,
  );
  if (moduleDescMatch) {
    result.moduleDesc = sanitizeLLMOutput(moduleDescMatch[1]!.trim(), targetLang);
  }

  // Extract EXPORTS section - more flexible matching
  // Matches: "EXPORTS:", "Exports:", "## Exports", etc.
  const exportsMatch = response.match(
    /(?:^|\n)(?:##?\s*)?EXPORTS:?\s*\n([\s\S]*?)(?=\n(?:##?\s*)?FILES|\n(?:##?\s*)?RULES|\n===|\n\n\n|$)/i,
  );
  if (exportsMatch) {
    const lines = exportsMatch[1]!.split("\n");
    for (const line of lines) {
      if (!line.trim()) continue;
      // Match: "- name: description", "- name (file.ts): description", "* `name`: description"
      const match = line.match(/^(?:[-*•]\s*)?\*{0,2}`?([A-Za-z_]\w*)`?\*{0,2}(?:\s*\([^)]+\))?\s*[:—–-]\s*(.+)/);
      if (match && match[2]!.trim().length > 0) {
        result.exportDescs[match[1]!] = sanitizeLLMOutput(match[2]!.trim(), targetLang);
      }
    }
  }

  // Extract FILES section - more flexible matching
  const filesMatch = response.match(
    /(?:^|\n)(?:##?\s*)?FILES:?\s*\n([\s\S]*?)(?=\n(?:##?\s*)?EXPORTS|\n(?:##?\s*)?RULES|\n===|\n\n\n|$)/i,
  );
  if (filesMatch) {
    const lines = filesMatch[1]!.split("\n");
    for (const line of lines) {
      if (!line.trim()) continue;
      // Match: "- filename.ts: description", "- **filename.ts**: description", "- `filename.ts`: description"
      const match = line.match(/^(?:[-*•]\s*)?\*{0,2}`?([a-zA-Z0-9_.-]+\.[a-z]{1,4})`?\*{0,2}\s*[:—–-]\s*(.+)/i);
      if (match && match[2]!.trim().length > 0) {
        result.fileDescs[match[1]!.trim()] = sanitizeLLMOutput(match[2]!.trim(), targetLang);
      }
    }
  }

  log.d("AUTODOC_LLM", "parse_done", {
    moduleDescLen: result.moduleDesc.length,
    exportDescsCount: Object.keys(result.exportDescs).length,
    fileDescsCount: Object.keys(result.fileDescs).length,
    exportNames: Object.keys(result.exportDescs).slice(0, 5).join(", "),
    fileNames: Object.keys(result.fileDescs).slice(0, 5).join(", "),
  });

  return result;
}

/**
 * Update description in AUTODOC content if it's a placeholder
 */
export async function updateDescription(
  content: string,
  moduleInfo: ModuleInfo,
  options: UpdateOptions,
): Promise<string> {
  log.i("AUTODOC_LLM", "update_description_start", { module: moduleInfo.name, useLlm: options.useLlm });

  // Check if current description is a placeholder
  const placeholderPatterns = [
    /Module for \w+ functionality\./,
    /^Module for /m,
    /^TODO:/m,
    /^Description placeholder/m,
  ];

  // Try two formats:
  // Format 1: Description between # Title and ## Section
  // Format 2: Description inside ## Module Description or ## Title and Description section

  const titleMatch = content.match(/^# .+\n+/);
  if (!titleMatch) {
    log.d("AUTODOC_LLM", "no_title_found", { module: moduleInfo.name });
    return content;
  }

  const afterTitle = content.slice(titleMatch[0].length);
  const nextSectionMatch = afterTitle.match(/^## /m);
  let currentDescription = "";
  let descriptionLocation: "after_title" | "in_section" = "after_title";

  if (nextSectionMatch) {
    const descriptionEnd = afterTitle.indexOf(nextSectionMatch[0]);
    currentDescription = afterTitle.slice(0, descriptionEnd).trim();

    // If no description after title, check for description inside "## Description" or "## Title" section
    if (currentDescription.length < 10) {
      const descSectionMatch = content.match(
        /## (?:Описание модуля|Заголовок и описание|Description)\s*\n+([\s\S]*?)(?=\n## |\n$|$)/i,
      );
      if (descSectionMatch?.[1]) {
        currentDescription = descSectionMatch[1].trim();
        descriptionLocation = "in_section";
      }
    }
  } else {
    currentDescription = afterTitle.trim();
  }

  log.i("AUTODOC_LLM", "current_description", {
    module: moduleInfo.name,
    descLength: currentDescription.length,
    descPreview: currentDescription.slice(0, 50),
    location: descriptionLocation,
  });

  // Check if it's a placeholder or empty
  // Short descriptions (< 200 chars) are considered incomplete and should be enhanced by LLM
  const isPlaceholder = currentDescription.length === 0 || placeholderPatterns.some((p) => p.test(currentDescription));
  const isShortDescription = currentDescription.length < 200;

  if (!isPlaceholder && !isShortDescription) {
    // Description exists, is not a placeholder, and is detailed enough
    log.d("AUTODOC_LLM", "description_exists", {
      module: moduleInfo.name,
      isPlaceholder: false,
      length: currentDescription.length,
    });
    return content;
  }

  log.i("AUTODOC_LLM", "generating_description", {
    module: moduleInfo.name,
    isPlaceholder,
    descLength: currentDescription.length,
  });

  // Generate new description via LLM
  const newDescription = await generateModuleDescriptionLLM(moduleInfo, options);
  if (!newDescription) {
    log.d("AUTODOC_LLM", "llm_returned_null", { module: moduleInfo.name });
    return content;
  }

  log.i("AUTODOC_LLM", "description_generated", { module: moduleInfo.name, newDescLength: newDescription.length });

  // Replace placeholder with new description based on location
  if (descriptionLocation === "in_section") {
    // Replace content in the description section
    const descSectionRegex =
      /(## (?:Описание модуля|Заголовок и описание|Description)\s*\n+)([\s\S]*?)((?=\n## )|\n$|$)/i;
    return content.replace(descSectionRegex, `$1${newDescription}\n\n$3`);
  }

  // Format 1: Insert after title
  const beforeDescription = titleMatch[0];
  const afterDescription = nextSectionMatch ? afterTitle.slice(afterTitle.indexOf(nextSectionMatch[0])) : "";

  return `${beforeDescription}${newDescription}\n\n${afterDescription}`;
}
