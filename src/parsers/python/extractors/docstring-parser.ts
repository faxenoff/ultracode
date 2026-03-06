/**
 * Python Docstring Parser
 *
 * Parses Python docstrings in Google, NumPy, and reStructuredText formats.
 */

import type { ASTNode, ParsedEntity } from "../../../types/parser.js";
import { getNodeText } from "../utils/helpers.js";

// =============================================================================
// DOCSTRING PARSER CLASS
// =============================================================================

export class DocstringParser {
  /**
   * Extract documentation from Python docstrings
   * Supports Google, NumPy, and reStructuredText docstring formats
   */
  extractDocumentation(node: ASTNode, source: string): ParsedEntity["documentation"] {
    const bodyNode = node.namedChildren.find((c) => c.type === "block");
    if (!bodyNode) return undefined;

    const firstStmt = bodyNode.namedChildren[0];
    if (!firstStmt) return undefined;

    let docstringNode: ASTNode | null = null;
    if (firstStmt.type === "expression_statement") {
      const expr = firstStmt.namedChildren[0];
      if (expr && (expr.type === "string" || expr.type === "concatenated_string")) {
        docstringNode = expr;
      }
    }

    if (!docstringNode) return undefined;

    let docstring = getNodeText(docstringNode, source);
    docstring = docstring.replace(/^["']{3}|["']{3}$/g, "").trim();

    return this.parseDocstring(docstring);
  }

  /**
   * Parse docstring content into structured documentation
   * Supports Google, NumPy, and reStructuredText formats
   */
  parseDocstring(docstring: string): ParsedEntity["documentation"] {
    type ParamInfo = NonNullable<ParsedEntity["documentation"]>["params"];
    type ThrowsInfo = NonNullable<ParsedEntity["documentation"]>["throws"];

    const lines = docstring.split("\n");
    const params: NonNullable<ParamInfo> = [];
    const throws: NonNullable<ThrowsInfo> = [];
    const examples: string[] = [];
    // biome-ignore lint/style/useConst: reassigned later
    let description: string | undefined;
    let returns: { type?: string | undefined; description?: string | undefined } | undefined;
    let deprecated: string | boolean | undefined;
    let since: string | undefined;
    let author: string | undefined;
    const see: string[] = [];

    let currentSection: string | null = null;
    let currentExample = "";
    const descriptionLines: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]!;
      const trimmedLine = line.trim();

      if (this.isDocstringSection(trimmedLine)) {
        if (currentSection === "examples" && currentExample.trim()) {
          examples.push(currentExample.trim());
          currentExample = "";
        }
        currentSection = this.normalizeSection(trimmedLine);
        continue;
      }

      if (currentSection === null) {
        if (trimmedLine) {
          descriptionLines.push(trimmedLine);
        }
      } else if (currentSection === "args" || currentSection === "parameters") {
        const paramMatch = trimmedLine.match(/^(\w+)\s*(?:\(([^)]+)\)|:\s*(\w+(?:\[[\w,\s[\]]+\])?))?\s*[:-]?\s*(.*)$/);
        if (paramMatch) {
          const [, name, type1, type2, desc] = paramMatch;
          if (name) {
            params.push({
              name,
              type: type1 || type2,
              ...(desc && { description: desc }),
              optional: (type1 || type2 || "").includes("optional"),
            });
          }
        }
      } else if (currentSection === "returns" || currentSection === "return") {
        const returnMatch = trimmedLine.match(/^(?:(\w+(?:\[[\w,\s[\]]+\])?)\s*[:-]?\s*)?(.*)$/);
        if (returnMatch) {
          if (!returns) {
            returns = {
              ...(returnMatch[1] != null ? { type: returnMatch[1] } : {}),
              ...(returnMatch[2] != null ? { description: returnMatch[2] } : {}),
            };
          } else if (returnMatch[2]) {
            returns.description = (returns.description || "") + " " + returnMatch[2];
          }
        }
      } else if (currentSection === "raises" || currentSection === "exceptions") {
        const raiseMatch = trimmedLine.match(/^(\w+(?:\.\w+)*)\s*[:-]?\s*(.*)$/);
        if (raiseMatch) {
          throws.push({
            type: raiseMatch[1],
            description: raiseMatch[2] || undefined,
          });
        }
      } else if (currentSection === "examples" || currentSection === "example") {
        currentExample += line + "\n";
      } else if (currentSection === "deprecated") {
        deprecated = trimmedLine || true;
      } else if (currentSection === "see also" || currentSection === "seealso") {
        if (trimmedLine) {
          see.push(trimmedLine);
        }
      } else if (currentSection === "version" || currentSection === "since") {
        since = trimmedLine;
      } else if (currentSection === "author") {
        author = trimmedLine;
      }

      // Check for reStructuredText style tags in description
      if (currentSection === null) {
        const rstParamMatch = trimmedLine.match(/^:param\s+(\w+):\s*(.*)$/);
        if (rstParamMatch) {
          params.push({
            name: rstParamMatch[1]!,
            description: rstParamMatch[2] || undefined,
          });
          continue;
        }

        const rstTypeMatch = trimmedLine.match(/^:type\s+(\w+):\s*(.*)$/);
        if (rstTypeMatch) {
          const existing = params.find((p) => p.name === rstTypeMatch[1]);
          if (existing) {
            existing.type = rstTypeMatch[2];
          }
          continue;
        }

        const rstReturnMatch = trimmedLine.match(/^:returns?:\s*(.*)$/);
        if (rstReturnMatch) {
          returns = { ...(rstReturnMatch[1] != null ? { description: rstReturnMatch[1] } : {}) };
          continue;
        }

        const rstRtypeMatch = trimmedLine.match(/^:rtype:\s*(.*)$/);
        if (rstRtypeMatch) {
          if (!returns) returns = {};
          returns.type = rstRtypeMatch[1];
          continue;
        }

        const rstRaisesMatch = trimmedLine.match(/^:raises?\s+(\w+(?:\.\w+)*):\s*(.*)$/);
        if (rstRaisesMatch) {
          throws.push({
            type: rstRaisesMatch[1],
            description: rstRaisesMatch[2] || undefined,
          });
        }
      }
    }

    if (currentSection === "examples" && currentExample.trim()) {
      examples.push(currentExample.trim());
    }

    description = descriptionLines.join(" ").trim() || undefined;

    if (!description && params.length === 0 && !returns && throws.length === 0 && examples.length === 0) {
      return undefined;
    }

    return {
      description,
      ...(params.length > 0 && { params: params }),
      returns,
      ...(throws.length > 0 && { throws: throws }),
      ...(examples.length > 0 && { examples: examples }),
      deprecated,
      ...(see.length > 0 && { see: see }),
      since,
      author,
    };
  }

  /**
   * Check if a line is a docstring section header
   */
  isDocstringSection(line: string): boolean {
    const sections = [
      "args:",
      "arguments:",
      "parameters:",
      "params:",
      "returns:",
      "return:",
      "yields:",
      "yield:",
      "raises:",
      "raise:",
      "exceptions:",
      "except:",
      "examples:",
      "example:",
      "attributes:",
      "attrs:",
      "notes:",
      "note:",
      "warnings:",
      "warning:",
      "see also:",
      "seealso:",
      "references:",
      "reference:",
      "deprecated:",
      "deprecation:",
      "version:",
      "since:",
      "author:",
      "authors:",
      "todo:",
      "todos:",
    ];

    const lower = line.toLowerCase();
    return sections.some((s) => lower === s || lower === s.slice(0, -1));
  }

  /**
   * Normalize section name
   */
  normalizeSection(line: string): string {
    const normalized = line.toLowerCase().replace(":", "").trim();

    const aliases: Record<string, string> = {
      arguments: "args",
      params: "parameters",
      return: "returns",
      yield: "yields",
      raise: "raises",
      except: "raises",
      exceptions: "raises",
      example: "examples",
      attrs: "attributes",
      note: "notes",
      warning: "warnings",
      reference: "references",
      deprecation: "deprecated",
      authors: "author",
      todos: "todo",
      seealso: "see also",
    };

    return aliases[normalized] || normalized;
  }
}
