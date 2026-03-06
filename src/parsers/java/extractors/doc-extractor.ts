/**
 * Java JavaDoc Extractor
 *
 * Extracts and parses JavaDoc comments from Java source code.
 * Handles standard JavaDoc tags: @param, @return, @throws, @see, @since, @author, @deprecated, @version
 *
 * Key features:
 * - Parses JavaDoc block comments
 * - Extracts structured parameter documentation
 * - Extracts return type documentation
 * - Extracts exception documentation
 * - Extracts metadata tags (author, since, version, deprecated)
 */

import type { CommonTokenStream } from "antlr4ng";
import type { JavaDocInfo, JavaDocParam } from "../types.js";

// =============================================================================
// MAIN EXTRACTION FUNCTION
// =============================================================================

/**
 * Extract JavaDoc comment preceding a declaration
 *
 * @param tokenStream - The token stream from the parser
 * @param declarationStartIndex - The start index of the declaration
 * @returns Parsed JavaDoc information or undefined if not found
 */
export function extractJavaDoc(
  tokenStream: CommonTokenStream | null,
  declarationStartIndex: number,
): JavaDocInfo | undefined {
  if (!tokenStream) return undefined;

  // Look for comment tokens before the declaration
  const commentText = findJavaDocComment(tokenStream, declarationStartIndex);
  if (!commentText) return undefined;

  return parseJavaDoc(commentText);
}

/**
 * Extract JavaDoc from raw comment text
 */
export function parseJavaDocText(text: string): JavaDocInfo | undefined {
  if (!text) return undefined;
  return parseJavaDoc(text);
}

// =============================================================================
// COMMENT FINDING
// =============================================================================

/**
 * Find JavaDoc comment token before a declaration
 */
function findJavaDocComment(tokenStream: CommonTokenStream, startIndex: number): string | null {
  // Look backwards from the declaration for comment tokens
  // In Java, JavaDoc comments are in hidden channel (typically channel 2)

  const tokens = tokenStream.getTokens?.();
  if (!tokens || tokens.length === 0) return null;

  // Find tokens before the start index
  for (let i = tokens.length - 1; i >= 0; i--) {
    const token = tokens[i];
    if (!token) continue;

    // Check if this token is before our declaration
    if ((token.start || 0) >= startIndex) continue;

    // Check for block comment that starts with /**
    const text = token.text;
    if (text && text.startsWith("/**") && !text.startsWith("/***")) {
      return text;
    }

    // Don't look too far back - stop at previous statement end
    if (text === ";" || text === "}" || text === "{") {
      break;
    }
  }

  return null;
}

// =============================================================================
// JAVADOC PARSING
// =============================================================================

/**
 * Parse JavaDoc comment text into structured format
 */
function parseJavaDoc(commentText: string): JavaDocInfo {
  const result: JavaDocInfo = {};

  // Remove comment markers and normalize
  const content = commentText
    .replace(/^\/\*\*\s*/, "") // Remove opening /**
    .replace(/\s*\*\/$/, "") // Remove closing */
    .split("\n")
    .map((line) =>
      line
        .replace(/^\s*\*\s?/, "") // Remove leading * from each line
        .trim(),
    )
    .join("\n")
    .trim();

  // Split into description and tags sections
  const tagStartIndex = content.search(/@\w+/);

  let description: string;
  let tagSection: string;

  if (tagStartIndex === -1) {
    description = content;
    tagSection = "";
  } else if (tagStartIndex === 0) {
    description = "";
    tagSection = content;
  } else {
    description = content.substring(0, tagStartIndex).trim();
    tagSection = content.substring(tagStartIndex);
  }

  // Set description if present
  if (description) {
    result.description = cleanDescription(description);
  }

  // Parse tags
  if (tagSection) {
    parseTags(tagSection, result);
  }

  return result;
}

/**
 * Parse JavaDoc tags section
 */
function parseTags(tagSection: string, result: JavaDocInfo): void {
  // Split by tags while preserving the tag names
  const tagPattern = /(@\w+)/g;
  const parts = tagSection.split(tagPattern).filter(Boolean);

  for (let i = 0; i < parts.length; i += 2) {
    const tagName = parts[i];
    const tagContent = parts[i + 1]?.trim() || "";

    switch (tagName) {
      case "@param":
        parseParamTag(tagContent, result);
        break;
      case "@return":
      case "@returns":
        parseReturnTag(tagContent, result);
        break;
      case "@throws":
      case "@exception":
        parseThrowsTag(tagContent, result);
        break;
      case "@see":
        parseSeeTag(tagContent, result);
        break;
      case "@since":
        result.since = (tagContent.split("\n")[0] || "").trim();
        break;
      case "@author":
        result.author = (tagContent.split("\n")[0] || "").trim();
        break;
      case "@version":
        result.version = (tagContent.split("\n")[0] || "").trim();
        break;
      case "@deprecated":
        result.deprecated = tagContent ? (tagContent.split("\n")[0] || "").trim() : true;
        break;
      // Skip unknown tags
    }
  }
}

/**
 * Parse @param tag
 */
function parseParamTag(content: string, result: JavaDocInfo): void {
  if (!result.params) {
    result.params = [];
  }

  // Format: paramName description
  // or: <T> description (for type parameters)
  const match = content.match(/^<?(\w+)>?\s*([\s\S]*)/);
  if (match) {
    const name = match[1] || "";
    const descPart = match[2]?.split(/(?=@\w+)/)[0];
    const description = descPart ? descPart.trim() : undefined;

    const paramEntry: JavaDocParam = { name };
    if (description) paramEntry.description = description;
    result.params.push(paramEntry);
  }
}

/**
 * Parse @return/@returns tag
 */
function parseReturnTag(content: string, result: JavaDocInfo): void {
  const descPart = content.split(/(?=@\w+)/)[0];
  const description = descPart ? descPart.trim() : undefined;
  result.returns = {
    ...(description ? { description } : {}),
  };
}

/**
 * Parse @throws/@exception tag
 */
function parseThrowsTag(content: string, result: JavaDocInfo): void {
  if (!result.throws) {
    result.throws = [];
  }

  // Format: ExceptionType description
  const match = content.match(/^(\S+)\s*([\s\S]*)/);
  if (match) {
    const type = match[1] || "";
    const descPart = match[2]?.split(/(?=@\w+)/)[0];
    const description = descPart ? descPart.trim() : undefined;

    result.throws.push({
      type,
      ...(description ? { description } : {}),
    });
  }
}

/**
 * Parse @see tag
 */
function parseSeeTag(content: string, result: JavaDocInfo): void {
  if (!result.see) {
    result.see = [];
  }

  const reference = (content.split("\n")[0] || "").trim();
  if (reference) {
    result.see.push(reference);
  }
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Clean description text
 */
function cleanDescription(text: string): string {
  return text
    .replace(/\s+/g, " ") // Normalize whitespace
    .replace(/<\/?p>/gi, "\n\n") // Convert <p> to paragraphs
    .replace(/<\/?code>/gi, "`") // Convert <code> to backticks
    .replace(/<\/?pre>/gi, "```") // Convert <pre> to code blocks
    .replace(/<\/?em>/gi, "*") // Convert <em> to emphasis
    .replace(/<\/?strong>/gi, "**") // Convert <strong> to bold
    .replace(/<br\s*\/?>/gi, "\n") // Convert <br> to newlines
    .replace(/<[^>]+>/g, "") // Remove remaining HTML tags
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .trim();
}

/**
 * Extract JavaDoc from source code at a specific line
 */
export function extractJavaDocFromSource(sourceCode: string, declarationLine: number): JavaDocInfo | undefined {
  const lines = sourceCode.split("\n");

  // Look backwards from declaration line for JavaDoc comment
  let commentEndLine = declarationLine - 2; // 0-indexed, before declaration
  let commentStartLine = -1;

  // Find comment end (line with */)
  while (commentEndLine >= 0) {
    const line = (lines[commentEndLine] || "").trim();
    if (line.endsWith("*/")) {
      break;
    }
    if (line && !line.startsWith("@") && !line.startsWith("*") && !line.startsWith("/")) {
      // Non-comment content found
      return undefined;
    }
    commentEndLine--;
  }

  if (commentEndLine < 0) return undefined;

  // Find comment start (line with /**)
  commentStartLine = commentEndLine;
  while (commentStartLine >= 0) {
    const line = (lines[commentStartLine] || "").trim();
    if (line.startsWith("/**")) {
      break;
    }
    commentStartLine--;
  }

  if (commentStartLine < 0) return undefined;

  // Extract comment text
  const commentLines = lines.slice(commentStartLine, commentEndLine + 1);
  const commentText = commentLines.join("\n");

  return parseJavaDoc(commentText);
}
