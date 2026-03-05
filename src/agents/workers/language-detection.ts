/**
 * Language Detection
 *
 * Detects programming language from file extension.
 */

import { extname } from "node:path";

/**
 * Extension to language mapping
 */
export const LANGUAGE_MAP: Record<string, string> = {
  ".py": "python",
  ".pyi": "python",
  ".pyw": "python",
  ".rs": "rust",
  ".cpp": "cpp",
  ".cxx": "cpp",
  ".cc": "cpp",
  ".hpp": "cpp",
  ".hxx": "cpp",
  ".hh": "cpp",
  ".java": "java",
  ".go": "go",
  ".c": "c",
  ".h": "c",
  ".kt": "kotlin",
  ".kts": "kotlin",
  ".sh": "bash",
  ".bash": "bash",
  ".zsh": "bash",
  ".fish": "bash",
  ".bat": "batch",
  ".cmd": "batch",
  ".ps1": "powershell",
  ".psm1": "powershell",
  ".psd1": "powershell",
  ".cs": "csharp",
  ".csx": "csharp",
  ".swift": "swift",
  ".zig": "zig",
  ".zon": "zig",
  ".css": "css",
  ".scss": "css",
  ".sass": "css",
  ".less": "css",
  ".html": "html",
  ".htm": "html",
  ".xml": "xml",
  ".ts": "typescript",
  ".tsx": "tsx",
  ".mts": "typescript",
  ".cts": "typescript",
  ".js": "javascript",
  ".jsx": "jsx",
  ".mjs": "javascript",
  ".cjs": "javascript",
  ".json": "json",
  ".tpl": "helm",
};

/**
 * List of all supported languages
 */
export const SUPPORTED_LANGUAGES = [
  "python",
  "rust",
  "cpp",
  "java",
  "go",
  "c",
  "csharp",
  "kotlin",
  "swift",
  "bash",
  "batch",
  "powershell",
  "typescript",
  "tsx",
  "javascript",
  "jsx",
  "json",
  "zig",
  "helm",
] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

/**
 * Detect language from file extension
 */
export function detectLanguage(filePath: string): string {
  const ext = extname(filePath).toLowerCase();
  return LANGUAGE_MAP[ext] || "unknown";
}
