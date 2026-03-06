/**
 * LLM-powered Documentation Writer
 *
 * Uses LLM to generate meaningful documentation from code.
 */

import type { ModuleInfo } from "../generator/doc-generator.js";
import type { LLMProvider } from "./llm-provider.js";

function getSystemPrompt(language?: string): string {
  if (language === "ru") {
    return `Ты технический писатель документации для TypeScript/JavaScript проектов.
Пиши понятную, практичную документацию в формате Markdown.
ОБЯЗАТЕЛЬНО пиши ВСЁ на РУССКОМ языке.

Правила:
- Определяй назначение по именам файлов (например, "logger.ts" → логирование, "cache-manager.ts" → кэширование)
- Будь конкретным в описании каждого файла
- Описания должны быть краткими (1-2 предложения на файл)
- Используй форматирование кода для имён файлов и экспортов

КРИТИЧЕСКИ ВАЖНО:
- Выводи ТОЛЬКО markdown-документацию, БЕЗ вступлений и заключений
- НЕ пиши фразы типа "Документация готова", "Вот документация", "Для применения..." и т.п.
- Начинай сразу с заголовка "# ..." и заканчивай последним разделом документации`;
  }

  if (language === "zh") {
    return `You are a technical documentation writer for TypeScript/JavaScript projects.
Write clear, practical documentation in Markdown format.
IMPORTANT: Write ALL documentation in CHINESE.

Rules:
- Infer purpose from file names (e.g., "logger.ts" → logging, "cache-manager.ts" → caching)
- Be specific about what each file likely does based on its name
- Keep descriptions concise (1-2 sentences per file)
- Use code formatting for file names and exports

CRITICAL:
- Output ONLY the markdown documentation, NO preamble or closing remarks
- Do NOT write phrases like "Here is the documentation", "Documentation ready", etc.
- Start directly with the "# ..." heading and end with the last section`;
  }

  return `You are a technical documentation writer for TypeScript/JavaScript projects.
Write clear, practical documentation in Markdown format.

Rules:
- Infer purpose from file names (e.g., "logger.ts" → logging, "cache-manager.ts" → caching)
- Be specific about what each file likely does based on its name
- Keep descriptions concise (1-2 sentences per file)
- Use code formatting for file names and exports

CRITICAL:
- Output ONLY the markdown documentation, NO preamble or closing remarks
- Do NOT write phrases like "Here is the documentation", "Documentation ready", etc.
- Start directly with the "# ..." heading and end with the last section`;
}

/**
 * Generate module documentation using LLM
 */
export async function generateModuleDoc(
  llm: LLMProvider,
  module: ModuleInfo,
  codeSnippets?: string[],
  options?: { language?: string },
): Promise<string> {
  const prompt = buildModulePrompt(module, codeSnippets, options?.language);
  const systemPrompt = getSystemPrompt(options?.language);

  const response = await llm.generate(prompt, {
    systemPrompt,
    maxTokens: 2500,
    temperature: 0.3,
  });

  return formatResponse(module.name, response.text);
}

/**
 * Generate description for a single export
 */
export async function generateExportDoc(llm: LLMProvider, exportName: string, code: string): Promise<string> {
  const prompt = `Describe this TypeScript/JavaScript export in 1-2 sentences:

\`\`\`typescript
${code.slice(0, 2000)}
\`\`\`

Export name: ${exportName}
Description:`;

  const response = await llm.generate(prompt, {
    systemPrompt: getSystemPrompt(),
    maxTokens: 200,
    temperature: 0.2,
  });

  return response.text.trim();
}

/**
 * Improve existing documentation
 */
export async function improveDoc(llm: LLMProvider, existingDoc: string, codeContext?: string): Promise<string> {
  const prompt = `Improve this documentation. Make it clearer and more complete.
${codeContext ? `\nCode context:\n\`\`\`\n${codeContext.slice(0, 3000)}\n\`\`\`` : ""}

Current documentation:
${existingDoc}

Improved documentation:`;

  const response = await llm.generate(prompt, {
    systemPrompt: getSystemPrompt(),
    maxTokens: 2000,
    temperature: 0.3,
  });

  return response.text.trim();
}

/**
 * Generate architecture overview
 */
export async function generateArchitectureDoc(
  llm: LLMProvider,
  projectName: string,
  modules: ModuleInfo[],
): Promise<string> {
  const moduleList = modules
    .slice(0, 30) // Limit to avoid context overflow
    .map((m) => `- ${m.name}: ${m.files.length} files, exports: ${m.exports.slice(0, 5).join(", ") || "internal"}`)
    .join("\n");

  const prompt = `Generate an architecture overview for the "${projectName}" project.

Modules:
${moduleList}

Write:
1. Brief overview (2-3 sentences)
2. Main components and their responsibilities
3. How modules relate to each other

Architecture documentation:`;

  const response = await llm.generate(prompt, {
    systemPrompt: getSystemPrompt(),
    maxTokens: 2000,
    temperature: 0.4,
  });

  return `# ${projectName} Architecture\n\n${response.text.trim()}`;
}

// ============================================================================
// Helper Functions
// ============================================================================

function buildModulePrompt(module: ModuleInfo, codeSnippets?: string[], language?: string): string {
  // Format files as a list for better LLM understanding
  const fileList = module.files
    .slice(0, 25) // Limit to avoid token overflow
    .map((f) => `- ${f}`)
    .join("\n");

  const exportList =
    module.exports.length > 0
      ? module.exports
          .slice(0, 15)
          .map((e) => `- \`${e}\``)
          .join("\n")
      : language === "ru"
        ? "Нет публичных экспортов (внутренний модуль)"
        : "No public exports (internal module)";

  // Language instruction at the start for better compliance
  const langInstruction =
    language === "ru"
      ? "ВАЖНО: Пиши документацию на РУССКОМ языке.\n\n"
      : language === "zh"
        ? "IMPORTANT: Write documentation in CHINESE.\n\n"
        : "";

  let prompt = `${langInstruction}Generate documentation for the "${module.name}" module in a TypeScript project.

## Module Files:
${fileList}
${module.files.length > 25 ? `\n... and ${module.files.length - 25} more files` : ""}

## Public Exports:
${exportList}

## Task:
Write a complete AUTODOC.md with these sections:

1. **Title and Overview** - What this module does (2-3 sentences)
2. **Files** - Table with each file and what it does:
   | File | Description |
   |------|-------------|
   | \`filename.ts\` | What this file does |
3. **Exports** - If any public exports, describe each one
4. **Usage** - Brief example if applicable`;

  if (codeSnippets && codeSnippets.length > 0) {
    prompt += `\n\n## Code Context:\n`;
    for (const snippet of codeSnippets.slice(0, 2)) {
      prompt += `\`\`\`typescript\n${snippet.slice(0, 1000)}\n\`\`\`\n`;
    }
  }

  prompt += `\n\nGenerate the documentation now:`;

  return prompt;
}

function formatResponse(moduleName: string, text: string): string {
  // Clean up LLM artifacts (DeepSeek tokenizer artifacts, etc.)
  let cleanText = text
    .replace(/<｜[^｜]+｜>/g, "") // DeepSeek artifacts like <｜begin▁of▁sentence｜>
    .replace(/<\|[^|]+\|>/g, "") // Alternative format <|...|>
    .replace(/\|>\s*\|/g, "|") // Fix broken table cells
    .trim();

  // Remove meta-text preamble (before first heading)
  const firstHeading = cleanText.indexOf("# ");
  if (firstHeading > 0) {
    cleanText = cleanText.slice(firstHeading);
  }

  // Remove meta-text postamble (after last code block or section)
  // Common patterns: "---\n\nDocumentation ready", "Documentation ready for..."
  cleanText = cleanText
    .replace(/\n---\n+(?:Документация|Documentation|Для применения|Ready for|This documentation)[\s\S]*$/i, "")
    .replace(/\n+(?:Документация готова|Documentation (?:ready|complete)|Для применения|Ready for use)[\s\S]*$/i, "")
    .trim();

  // Ensure it starts with a proper title
  if (!cleanText.startsWith("#")) {
    const title = moduleName.charAt(0).toUpperCase() + moduleName.slice(1).replace(/-/g, " ");
    return `# ${title}\n\n${cleanText}`;
  }

  return cleanText;
}

/**
 * Batch generate documentation for multiple modules
 */
export async function batchGenerateDocs(
  llm: LLMProvider,
  modules: ModuleInfo[],
  options?: {
    concurrency?: number | undefined;
    language?: string | undefined;
    onProgress?: (completed: number, total: number) => void;
  },
): Promise<Map<string, string>> {
  const results = new Map<string, string>();
  // Claude Code CLI: sequential (1) to avoid multiple sessions and rate limits
  // Other LLMs: conservative concurrency (2)
  const concurrency = options?.concurrency ?? (llm.name === "claude-code" ? 1 : 2);
  const language = options?.language;
  let completed = 0;

  // Process in batches
  for (let i = 0; i < modules.length; i += concurrency) {
    const batch = modules.slice(i, i + concurrency);

    const batchResults = await Promise.all(
      batch.map(async (mod) => {
        try {
          const doc = await generateModuleDoc(llm, mod, undefined, language != null ? { language } : {});
          return { path: mod.path, doc };
        } catch (_error) {
          // Fallback to basic template on error
          const fallbackTitle = language === "ru" ? "Модуль" : "Module";
          const fallbackDesc =
            language === "ru" ? `${fallbackTitle} ${mod.name}.` : `Module for ${mod.name} functionality.`;
          return {
            path: mod.path,
            doc: `# ${mod.name}\n\n${fallbackDesc}\n\n## Exports\n\n${
              mod.exports.map((e) => `- \`${e}\``).join("\n") ||
              (language === "ru" ? "Внутренний модуль" : "Internal module")
            }`,
          };
        }
      }),
    );

    for (const { path, doc } of batchResults) {
      results.set(path, doc);
      completed++;
      options?.onProgress?.(completed, modules.length);
    }
  }

  return results;
}
