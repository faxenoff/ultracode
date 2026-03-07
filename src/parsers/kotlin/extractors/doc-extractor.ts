/**
 * Kotlin KDoc Extractor
 *
 * Extracts and parses KDoc comments from Kotlin source code.
 * Handles standard KDoc tags: @param, @return, @throws, @property, @receiver, @sample, @see, @since, @author, @deprecated, @suppress
 *
 * Key features:
 * - Parses KDoc block comments
 * - Extracts structured parameter documentation
 * - Extracts return type documentation
 * - Extracts exception documentation
 * - Handles Kotlin-specific tags (@property, @receiver, @sample, @suppress)
 * - Extracts metadata tags (author, since, deprecated)
 */

import type { CommonTokenStream } from "antlr4ng";
import type { KDocInfo, KDocParam } from "../types.js";

// =============================================================================
// MAIN EXTRACTION FUNCTION
// =============================================================================

/**
 * Extract KDoc comment preceding a declaration
 *
 * @param tokenStream - The token stream from the parser
 * @param declarationStartIndex - The start index of the declaration
 * @returns Parsed KDoc information or undefined if not found
 */
export function extractKDoc(
  tokenStream: CommonTokenStream | null,
  declarationStartIndex: number,
): KDocInfo | undefined {
  if (!tokenStream) return undefined;

  // Look for comment tokens before the declaration
  const commentText = findKDocComment(tokenStream, declarationStartIndex);
  if (!commentText) return undefined;

  return parseKDoc(commentText);
}

/**
 * Extract KDoc from raw comment text
 */
export function parseKDocText(text: string): KDocInfo | undefined {
  if (!text) return undefined;
  return parseKDoc(text);
}

// =============================================================================
// COMMENT FINDING
// =============================================================================

/**
 * Find KDoc comment token before a declaration
 */
function findKDocComment(tokenStream: CommonTokenStream, startIndex: number): string | null {
  // Look backwards from the declaration for comment tokens

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
// KDOC PARSING
// =============================================================================

/**
 * Parse KDoc comment text into structured format
 */
function parseKDoc(commentText: string): KDocInfo {
  const result: KDocInfo = {};

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
 * Parse KDoc tags section
 */
function parseTags(tagSection: string, result: KDocInfo): void {
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
      case "@property":
        parsePropertyTag(tagContent, result);
        break;
      case "@receiver":
        result.receiver = (tagContent.split("\n")[0] || "").trim();
        break;
      case "@sample":
        parseSampleTag(tagContent, result);
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
      case "@deprecated":
        result.deprecated = tagContent ? (tagContent.split("\n")[0] || "").trim() : true;
        break;
      case "@suppress":
        parseSuppressTag(tagContent, result);
        break;
      case "@constructor":
        // Constructor documentation - add to description
        if (result.description) {
          result.description += "\n\nConstructor: " + (tagContent.split("\n")[0] || "").trim();
        }
        break;
      // Skip unknown tags
    }
  }
}

/**
 * Parse @param tag
 */
function parseParamTag(content: string, result: KDocInfo): void {
  if (!result.params) {
    result.params = [];
  }

  // Format: paramName description
  // or: <T> description (for type parameters)
  const match = content.match(/^<?(\w+)>?\s*([\s\S]*)/);
  if (match) {
    const name = match[1] || "";
    const description = (match[2]?.split(/(?=@\w+)/)[0] || "").trim();

    const paramEntry: KDocParam = { name };
    if (description) paramEntry.description = description;
    result.params.push(paramEntry);
  }
}

/**
 * Parse @return/@returns tag
 */
function parseReturnTag(content: string, result: KDocInfo): void {
  const description = (content.split(/(?=@\w+)/)[0] || "").trim();
  result.returns = {
    ...(description ? { description } : {}),
  };
}

/**
 * Parse @throws/@exception tag
 */
function parseThrowsTag(content: string, result: KDocInfo): void {
  if (!result.throws) {
    result.throws = [];
  }

  // Format: ExceptionType description
  const match = content.match(/^(\S+)\s*([\s\S]*)/);
  if (match) {
    const type = match[1] || "";
    const description = (match[2]?.split(/(?=@\w+)/)[0] || "").trim();

    result.throws.push({
      type,
      ...(description ? { description } : {}),
    });
  }
}

/**
 * Parse @property tag (Kotlin-specific)
 */
function parsePropertyTag(content: string, result: KDocInfo): void {
  if (!result.property) {
    result.property = [];
  }

  // Format: propertyName description
  const match = content.match(/^(\w+)\s*([\s\S]*)/);
  if (match) {
    const name = match[1] || "";
    const description = (match[2]?.split(/(?=@\w+)/)[0] || "").trim();

    result.property.push({
      name,
      ...(description ? { description } : {}),
    });
  }
}

/**
 * Parse @sample tag (Kotlin-specific)
 */
function parseSampleTag(content: string, result: KDocInfo): void {
  if (!result.sample) {
    result.sample = [];
  }

  const reference = (content.split("\n")[0] || "").trim();
  if (reference) {
    result.sample.push(reference);
  }
}

/**
 * Parse @see tag
 */
function parseSeeTag(content: string, result: KDocInfo): void {
  if (!result.see) {
    result.see = [];
  }

  const reference = (content.split("\n")[0] || "").trim();
  if (reference) {
    result.see.push(reference);
  }
}

/**
 * Parse @suppress tag (Kotlin-specific)
 */
function parseSuppressTag(content: string, result: KDocInfo): void {
  if (!result.suppress) {
    result.suppress = [];
  }

  // Format: "UNUSED_PARAMETER" or just the warning name
  const warning = (content.split("\n")[0] || "").trim().replace(/^["']|["']$/g, "");
  if (warning) {
    result.suppress.push(warning);
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
    .replace(/\[([^\]]+)\]/g, "`$1`") // Convert [refs] to backticks
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
 * Extract KDoc from source code at a specific line
 */
export function extractKDocFromSource(sourceCode: string, declarationLine: number): KDocInfo | undefined {
  const lines = sourceCode.split("\n");

  // Look backwards from declaration line for KDoc comment
  let commentEndLine = declarationLine - 2; // 0-indexed, before declaration
  let commentStartLine = -1;

  // Skip annotation lines
  while (commentEndLine >= 0) {
    const line = (lines[commentEndLine] || "").trim();
    if (line.startsWith("@") && !line.startsWith("/**")) {
      commentEndLine--;
      continue;
    }
    break;
  }

  // Find comment end (line with */)
  while (commentEndLine >= 0) {
    const line = (lines[commentEndLine] || "").trim();
    if (line.endsWith("*/")) {
      break;
    }
    if (line && !line.startsWith("*") && !line.startsWith("/")) {
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

  return parseKDoc(commentText);
}
