/**
 * Zig Native Parser
 *
 * Uses regex-based parsing with rich Zig syntax support.
 * Works on ALL platforms (Windows, Linux, macOS) - no external dependencies.
 *
 * Architecture:
 * - Regex-based extraction for functions, structs, enums, unions, error sets
 * - Extracts Zig-specific constructs: comptime, test blocks, builtins
 * - Properly handles pub/export/extern/inline modifiers
 * - Extracts calls (including @builtins), control flow, and relationships
 *
 * No native modules or Zig toolchain required - pure TypeScript.
 */

import { execSync } from "node:child_process";
import { log } from "../logging/index.js";
import type { EntityRelationship, ParsedEntity, ParseResult, SupportedLanguage } from "../types/parser.js";
import { LineOffsetMap } from "./base-parser-utils.js";

// =============================================================================
// PARSER STATS
// =============================================================================

export interface ParserStats {
  filesParsed: number;
  cacheHits: number;
  cacheMisses: number;
  avgParseTimeMs: number;
  totalParseTimeMs: number;
  throughput: number;
  cacheMemoryMB: number;
  errorCount: number;
}

interface ZigParseResult {
  entities: ParsedEntity[];
  relationships: EntityRelationship[];
  errors: Array<{ message: string; location?: { line: number; column: number } }>;
}

// =============================================================================
// CACHED REGEX PATTERNS (avoid recreation on each parse)
// =============================================================================

// Imports: const std = @import("std");
const IMPORT_RE = /(?:pub\s+)?const\s+(\w+)\s*=\s*@import\s*\(\s*"([^"]+)"\s*\)/gm;

// Functions: pub fn name(...) ReturnType { ... }
// Return type can be: void, !void, anyerror!u32, ?*u8, *const T, align(...) T, callconv(.C) T
const FUNC_RE =
  /^[ \t]*(?:(pub)\s+)?(?:(export)\s+)?(?:(extern)\s+(?:"[^"]*"\s+)?)?(?:(inline)\s+)?fn\s+(\w+)\s*\(([^)]*)\)\s*([^{]*?)\s*\{/gm;

// Structs: const Foo = struct { ... }
const STRUCT_RE = /^[ \t]*(?:(pub)\s+)?const\s+(\w+)\s*=\s*(?:(extern)\s+|(packed)\s+)?struct(?:\s*\([^)]*\))?\s*\{/gm;

// Enums: const Color = enum { ... }
const ENUM_RE = /^[ \t]*(?:(pub)\s+)?const\s+(\w+)\s*=\s*enum(?:\s*\([^)]*\))?\s*\{/gm;

// Unions: const Val = union(enum) { ... }
const UNION_RE = /^[ \t]*(?:(pub)\s+)?const\s+(\w+)\s*=\s*union(?:\s*\([^)]*\))?\s*\{/gm;

// Error sets: const Err = error { ... }
const ERROR_SET_RE = /^[ \t]*(?:(pub)\s+)?const\s+(\w+)\s*=\s*error\s*\{/gm;

// Constants: const x = val; (excluding struct/enum/union/error/import definitions)
const CONST_RE =
  /^[ \t]*(?:(pub)\s+)?const\s+(\w+)\s*(?::\s*([^=\n]+?))?\s*=\s*(?!@import|struct|enum|union|error\s*\{)([^;\n]+)/gm;

// Variables: var x: T = val;
const VAR_RE = /^[ \t]*(?:(pub)\s+)?var\s+(\w+)\s*:\s*([^=;\n]+?)(?:\s*=\s*([^;\n]+))?;/gm;

// Test blocks: test "name" { ... }
const TEST_RE = /^[ \t]*test\s+"([^"]+)"\s*\{/gm;

// Comptime blocks: comptime { ... }
const COMPTIME_RE = /^[ \t]*comptime\s*\{/gm;

// Struct/enum methods within body: pub fn name(self, ...) ...
const METHOD_IN_BODY_RE = /^[ \t]*(?:(pub)\s+)?(?:(inline)\s+)?fn\s+(\w+)\s*\(([^)]*)\)\s*([^{]*?)\s*\{/gm;

// Control flow patterns
const IF_RE = /\bif\s*\(([^)]*)\)/g;
const ELSE_IF_RE = /\}\s*else\s+if\s*\(([^)]*)\)/g;
const ELSE_RE = /\}\s*else\s*\{/g;
const SWITCH_RE = /\bswitch\s*\(([^)]*)\)/g;
const FOR_RE = /\bfor\s*\(([^)]*)\)\s*\|([^|]*)\|/g;
const WHILE_RE = /\bwhile\s*\(([^)]*)\)/g;
const TRY_RE = /\btry\s+/g;
const CATCH_RE = /\bcatch\s*\|([^|]*)\|/g;
const DEFER_RE = /\bdefer\s+/g;
const ERRDEFER_RE = /\berrdefer\s+/g;
const RETURN_RE = /\breturn\s*([^;\n}]+)?/g;

// Function with body pattern (for second-pass call extraction)
const FUNC_WITH_BODY_RE = /\bfn\s+(\w+)\s*\([^)]*\)[^{]*\{/g;

// =============================================================================
// ZIG PARSER CLASS
// =============================================================================

export class ZigNativeParser {
  public zigAvailable: boolean | null = null;
  private stats: ParserStats = {
    filesParsed: 0,
    cacheHits: 0,
    cacheMisses: 0,
    avgParseTimeMs: 0,
    totalParseTimeMs: 0,
    throughput: 0,
    cacheMemoryMB: 0,
    errorCount: 0,
  };

  async initialize(): Promise<void> {
    log.d("ZIGPARSER", "check_avail");

    try {
      execSync("zig version", { stdio: "ignore", windowsHide: true });
      this.zigAvailable = true;
      log.i("ZIGPARSER", "init_done", { zig: true });
    } catch {
      this.zigAvailable = false;
      log.i("ZIGPARSER", "init_done", { zig: false });
    }
  }

  supportsFile(filePath: string): boolean {
    const lower = filePath.toLowerCase();
    return lower.endsWith(".zig") || lower.endsWith(".zon");
  }

  async parse(filePath: string, content: string, contentHash: string): Promise<ParseResult> {
    const startTime = Date.now();

    try {
      const result = this.parseWithRegex(filePath, content);
      const parseTimeMs = Date.now() - startTime;

      this.stats.filesParsed++;
      this.stats.totalParseTimeMs += parseTimeMs;
      this.stats.avgParseTimeMs = this.stats.totalParseTimeMs / this.stats.filesParsed;

      return {
        filePath,
        language: "zig" as SupportedLanguage,
        entities: result.entities,
        relationships: result.relationships,
        contentHash,
        timestamp: Date.now(),
        parseTimeMs,
        ...(result.errors.length > 0 && { errors: result.errors }),
      };
    } catch (error) {
      this.stats.errorCount++;
      const parseTimeMs = Date.now() - startTime;

      return {
        filePath,
        language: "zig" as SupportedLanguage,
        entities: [],
        contentHash,
        timestamp: Date.now(),
        parseTimeMs,
        errors: [
          {
            message: error instanceof Error ? error.message : String(error),
          },
        ],
      };
    }
  }

  // ===========================================================================
  // REGEX-BASED PARSER
  // ===========================================================================

  private resetRegex(re: RegExp): void {
    re.lastIndex = 0;
  }

  private parseWithRegex(filePath: string, content: string): ZigParseResult {
    const entities: ParsedEntity[] = [];
    const relationships: EntityRelationship[] = [];
    let match: RegExpExecArray | null;

    // Pre-compute line offset map: O(n) build, O(log n) per lookup
    const lineMap = new LineOffsetMap(content);

    // Pre-computed type body ranges for O(log n) isInsideTypeBody checks
    const typeBodyRanges: Array<{ start: number; end: number }> = [];

    // =========================================================================
    // IMPORTS
    // =========================================================================
    this.resetRegex(IMPORT_RE);
    while ((match = IMPORT_RE.exec(content))) {
      const localName = match[1];
      const source = match[2];
      if (!localName || !source) continue;

      const importId = `${filePath}:import:${localName}`;
      entities.push({
        id: importId,
        name: localName,
        type: "import",
        filePath,
        location: lineMap.getEntityLocation(match.index),
        modifiers: [],
        importData: {
          source,
          specifiers: [{ local: localName }],
        },
      });

      relationships.push({
        from: filePath,
        to: source,
        type: "imports",
        metadata: { localName },
      });
    }

    // =========================================================================
    // STRUCTS (with body parsing for fields and methods)
    // =========================================================================
    this.resetRegex(STRUCT_RE);
    while ((match = STRUCT_RE.exec(content))) {
      const isPub = !!match[1];
      const name = match[2];
      const isExtern = !!match[3];
      const isPacked = !!match[4];
      if (!name) continue;

      const structId = `${filePath}:struct:${name}`;
      const modifiers: string[] = [];
      if (isPub) modifiers.push("pub");
      if (isExtern) modifiers.push("extern");
      if (isPacked) modifiers.push("packed");

      const bodyStartIdx = content.indexOf("{", match.index + match[0].length - 1);
      const body = bodyStartIdx >= 0 ? this.extractBraceBlock(content, bodyStartIdx) : null;

      const children: ParsedEntity[] = [];
      if (body) {
        // Record type body range for O(log n) isInsideTypeBody
        typeBodyRanges.push({ start: bodyStartIdx, end: bodyStartIdx + body.length + 2 });
        this.parseStructBody(body, filePath, name, children, relationships);
      }

      entities.push({
        id: structId,
        name,
        type: "struct",
        filePath,
        location: lineMap.getEntityLocation(match.index),
        modifiers,
        metadata: { isValueType: true },
        ...(children.length > 0 && { children }),
      });
    }

    // =========================================================================
    // ENUMS (with body parsing for variants and methods)
    // =========================================================================
    this.resetRegex(ENUM_RE);
    while ((match = ENUM_RE.exec(content))) {
      const isPub = !!match[1];
      const name = match[2];
      if (!name) continue;

      const enumId = `${filePath}:enum:${name}`;
      const modifiers: string[] = [];
      if (isPub) modifiers.push("pub");

      const bodyStartIdx = content.indexOf("{", match.index + match[0].length - 1);
      const body = bodyStartIdx >= 0 ? this.extractBraceBlock(content, bodyStartIdx) : null;

      const children: ParsedEntity[] = [];
      if (body) {
        typeBodyRanges.push({ start: bodyStartIdx, end: bodyStartIdx + body.length + 2 });
        this.parseEnumBody(body, filePath, name, children, relationships);
      }

      entities.push({
        id: enumId,
        name,
        type: "enum",
        filePath,
        location: lineMap.getEntityLocation(match.index),
        modifiers,
        ...(children.length > 0 && { children }),
      });
    }

    // =========================================================================
    // UNIONS
    // =========================================================================
    this.resetRegex(UNION_RE);
    while ((match = UNION_RE.exec(content))) {
      const isPub = !!match[1];
      const name = match[2];
      if (!name) continue;

      const unionId = `${filePath}:union:${name}`;
      const modifiers: string[] = [];
      if (isPub) modifiers.push("pub");

      const bodyStartIdx = content.indexOf("{", match.index + match[0].length - 1);
      const body = bodyStartIdx >= 0 ? this.extractBraceBlock(content, bodyStartIdx) : null;

      const children: ParsedEntity[] = [];
      if (body) {
        typeBodyRanges.push({ start: bodyStartIdx, end: bodyStartIdx + body.length + 2 });
        // Union body is similar to struct body (fields + methods)
        this.parseStructBody(body, filePath, name, children, relationships);
      }

      entities.push({
        id: unionId,
        name,
        type: "union",
        filePath,
        location: lineMap.getEntityLocation(match.index),
        modifiers,
        ...(children.length > 0 && { children }),
      });
    }

    // =========================================================================
    // ERROR SETS
    // =========================================================================
    this.resetRegex(ERROR_SET_RE);
    while ((match = ERROR_SET_RE.exec(content))) {
      const isPub = !!match[1];
      const name = match[2];
      if (!name) continue;

      const errorId = `${filePath}:type:${name}`;
      const modifiers: string[] = [];
      if (isPub) modifiers.push("pub");
      modifiers.push("error_set");

      const bodyStartIdx = content.indexOf("{", match.index + match[0].length - 1);
      const body = bodyStartIdx >= 0 ? this.extractBraceBlock(content, bodyStartIdx) : null;

      const children: ParsedEntity[] = [];
      if (body) {
        // Error set members: ErrorName,
        const bodyLineMap = new LineOffsetMap(body);
        const memberRe = /(\w+)\s*,/g;
        let memberMatch: RegExpExecArray | null;
        while ((memberMatch = memberRe.exec(body))) {
          const memberName = memberMatch[1];
          if (memberName) {
            children.push({
              name: memberName,
              type: "enum_variant",
              filePath,
              location: bodyLineMap.getEntityLocation(memberMatch.index),
            });
          }
        }
      }

      entities.push({
        id: errorId,
        name,
        type: "type",
        filePath,
        location: lineMap.getEntityLocation(match.index),
        modifiers,
        ...(children.length > 0 && { children }),
      });
    }

    // Sort type body ranges for binary search
    typeBodyRanges.sort((a, b) => a.start - b.start);

    // =========================================================================
    // TOP-LEVEL FUNCTIONS
    // =========================================================================
    this.resetRegex(FUNC_RE);
    while ((match = FUNC_RE.exec(content))) {
      const isPub = !!match[1];
      const isExport = !!match[2];
      const isExtern = !!match[3];
      const isInline = !!match[4];
      const name = match[5];
      const paramsStr = match[6] || "";
      const rawReturnType = match[7]?.trim();
      const returnType = rawReturnType ? this.cleanReturnType(rawReturnType) : undefined;
      if (!name) continue;

      // Skip if this function is inside a struct/enum body (already parsed as method)
      if (this.isInsideTypeBodyFast(match.index, typeBodyRanges)) continue;

      const funcId = `${filePath}:function:${name}`;
      const modifiers: string[] = [];
      if (isPub) modifiers.push("pub");
      if (isExport) modifiers.push("export");
      if (isExtern) modifiers.push("extern");
      if (isInline) modifiers.push("inline");

      const parameters = this.parseParameters(paramsStr);

      entities.push({
        id: funcId,
        name,
        type: "function",
        filePath,
        location: lineMap.getEntityLocation(match.index),
        modifiers,
        ...(parameters.length > 0 && { parameters }),
        ...(returnType && { returnType }),
      });
    }

    // =========================================================================
    // TEST BLOCKS
    // =========================================================================
    this.resetRegex(TEST_RE);
    while ((match = TEST_RE.exec(content))) {
      const testName = match[1];
      if (!testName) continue;

      const testId = `${filePath}:function:test_${testName.replace(/\s+/g, "_")}`;
      entities.push({
        id: testId,
        name: testName,
        type: "function",
        filePath,
        location: lineMap.getEntityLocation(match.index),
        modifiers: ["test"],
      });
    }

    // =========================================================================
    // COMPTIME BLOCKS
    // =========================================================================
    this.resetRegex(COMPTIME_RE);
    let comptimeIdx = 0;
    while ((match = COMPTIME_RE.exec(content))) {
      const comptimeId = `${filePath}:function:comptime_${comptimeIdx++}`;
      entities.push({
        id: comptimeId,
        name: `comptime_block_${comptimeIdx}`,
        type: "function",
        filePath,
        location: lineMap.getEntityLocation(match.index),
        modifiers: ["comptime"],
      });
    }

    // =========================================================================
    // TOP-LEVEL CONSTANTS (not already captured as struct/enum/union/error/import)
    // =========================================================================
    const knownNames = new Set(entities.map((e) => e.name));
    this.resetRegex(CONST_RE);
    while ((match = CONST_RE.exec(content))) {
      const isPub = !!match[1];
      const name = match[2];
      const typeAnnotation = match[3]?.trim();
      if (!name || knownNames.has(name)) continue;

      // Skip if inside a struct/enum body
      if (this.isInsideTypeBodyFast(match.index, typeBodyRanges)) continue;

      const constId = `${filePath}:constant:${name}`;
      const modifiers: string[] = [];
      if (isPub) modifiers.push("pub");

      entities.push({
        id: constId,
        name,
        type: "constant",
        filePath,
        location: lineMap.getEntityLocation(match.index),
        modifiers,
        ...(typeAnnotation && { returnType: typeAnnotation }),
      });
    }

    // =========================================================================
    // TOP-LEVEL VARIABLES
    // =========================================================================
    this.resetRegex(VAR_RE);
    while ((match = VAR_RE.exec(content))) {
      const isPub = !!match[1];
      const name = match[2];
      const typeAnnotation = match[3]?.trim();
      if (!name || knownNames.has(name)) continue;

      if (this.isInsideTypeBodyFast(match.index, typeBodyRanges)) continue;

      const varId = `${filePath}:variable:${name}`;
      const modifiers: string[] = [];
      if (isPub) modifiers.push("pub");

      entities.push({
        id: varId,
        name,
        type: "variable",
        filePath,
        location: lineMap.getEntityLocation(match.index),
        modifiers,
        ...(typeAnnotation && { returnType: typeAnnotation }),
      });
    }

    // =========================================================================
    // EXTRACT CALLS AND CONTROL FLOW (Second Pass)
    // =========================================================================
    this.extractCallsAndControlFlow(content, filePath, entities, relationships, lineMap);

    // Log summary
    const callsRels = relationships.filter((r) => r.type === "calls");
    const memberRels = relationships.filter((r) => r.type === "member_of");
    if (relationships.length > 0) {
      log.i("ZIG", "parse_relationships", {
        file: filePath.split(/[/\\]/).pop(),
        total: relationships.length,
        calls: callsRels.length,
        member_of: memberRels.length,
      });
    }

    return { entities, relationships, errors: [] };
  }

  // ===========================================================================
  // STRUCT BODY PARSING
  // ===========================================================================

  private parseStructBody(
    body: string,
    filePath: string,
    parentName: string,
    children: ParsedEntity[],
    relationships: EntityRelationship[],
  ): void {
    const bodyLineMap = new LineOffsetMap(body);

    // Parse methods first (so we can exclude them from field detection)
    const methodNames = new Set<string>();
    this.resetRegex(METHOD_IN_BODY_RE);
    let match: RegExpExecArray | null;

    while ((match = METHOD_IN_BODY_RE.exec(body))) {
      const isPub = !!match[1];
      const isInline = !!match[2];
      const name = match[3];
      const paramsStr = match[4] || "";
      const rawRetType = match[5]?.trim();
      const returnType = rawRetType ? this.cleanReturnType(rawRetType) : undefined;
      if (!name) continue;

      methodNames.add(name);

      const fullName = `${parentName}.${name}`;
      const isMethod = this.isMethodParam(paramsStr, parentName);
      const modifiers: string[] = [];
      if (isPub) modifiers.push("pub");
      if (isInline) modifiers.push("inline");

      const parameters = this.parseParameters(paramsStr);
      const location = bodyLineMap.getEntityLocation(match.index);

      children.push({
        id: `${filePath}:${isMethod ? "method" : "function"}:${fullName}`,
        name: fullName,
        type: isMethod ? "method" : "function",
        filePath,
        location,
        modifiers,
        ...(parameters.length > 0 && { parameters }),
        ...(returnType && { returnType }),
      });

      relationships.push({
        from: fullName,
        to: parentName,
        type: "member_of",
        metadata: { line: location.start.line },
      });

      // Extract calls from method body
      const methodBodyStart = body.indexOf("{", match.index + match[0].length - 1);
      if (methodBodyStart >= 0) {
        const methodBody = this.extractBraceBlock(body, methodBodyStart);
        if (methodBody) {
          const calls = this.extractCallsFromBody(methodBody);
          const controlFlow = this.extractControlFlowFromBody(methodBody);

          const childEntity = children[children.length - 1]!;
          if (calls.length > 0) {
            childEntity.calls = calls.map((c) => ({
              name: c.name,
              ...(c.target && { target: c.target }),
              location: { start: { line: 0, column: 0, index: 0 }, end: { line: 0, column: 0, index: 0 } },
              argumentCount: c.argumentCount,
            }));

            for (const call of calls) {
              const qualifiedCallName = call.target ? `${call.target}.${call.name}` : call.name;
              relationships.push({
                from: fullName,
                to: qualifiedCallName,
                type: "calls",
                metadata: { calledName: call.name, ...(call.target && { target: call.target }) },
              });
            }
          }

          if (controlFlow.branches.length > 0 || controlFlow.loops.length > 0 || controlFlow.exceptions.length > 0) {
            childEntity.controlFlow = controlFlow;
          }
        }
      }
    }

    // Parse fields (lines that look like "name: Type," but not fn declarations)
    const lines = body.split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      // Skip empty, comments, fn declarations
      if (!trimmed || trimmed.startsWith("//") || trimmed.startsWith("fn ") || trimmed.startsWith("pub fn ")) continue;

      const fieldMatch = trimmed.match(/^(\w+)\s*:\s*([^,=}\n]+?)\s*(?:=\s*([^,}\n]+))?\s*,?\s*$/);
      if (fieldMatch) {
        const fieldName = fieldMatch[1];
        const fieldType = fieldMatch[2]?.trim();
        if (!fieldName || methodNames.has(fieldName)) continue;

        // Skip if it looks like a function parameter rather than a field
        if (fieldName === "self" || fieldName === "ptr") continue;

        const fullName = `${parentName}.${fieldName}`;
        children.push({
          id: `${filePath}:field:${fullName}`,
          name: fullName,
          type: "field",
          filePath,
          location: bodyLineMap.getEntityLocation(body.indexOf(trimmed)),
          ...(fieldType && { returnType: fieldType }),
        });
      }
    }
  }

  // ===========================================================================
  // ENUM BODY PARSING
  // ===========================================================================

  private parseEnumBody(
    body: string,
    filePath: string,
    parentName: string,
    children: ParsedEntity[],
    relationships: EntityRelationship[],
  ): void {
    const bodyLineMap = new LineOffsetMap(body);

    // Parse methods first
    const methodNames = new Set<string>();
    this.resetRegex(METHOD_IN_BODY_RE);
    let match: RegExpExecArray | null;

    while ((match = METHOD_IN_BODY_RE.exec(body))) {
      const isPub = !!match[1];
      const name = match[3];
      const paramsStr = match[4] || "";
      const rawRetType = match[5]?.trim();
      const returnType = rawRetType ? this.cleanReturnType(rawRetType) : undefined;
      if (!name) continue;

      methodNames.add(name);

      const fullName = `${parentName}.${name}`;
      const isMethod = this.isMethodParam(paramsStr, parentName);
      const modifiers: string[] = [];
      if (isPub) modifiers.push("pub");

      const parameters = this.parseParameters(paramsStr);

      children.push({
        id: `${filePath}:${isMethod ? "method" : "function"}:${fullName}`,
        name: fullName,
        type: isMethod ? "method" : "function",
        filePath,
        location: bodyLineMap.getEntityLocation(match.index),
        modifiers,
        ...(parameters.length > 0 && { parameters }),
        ...(returnType && { returnType }),
      });

      relationships.push({
        from: fullName,
        to: parentName,
        type: "member_of",
      });
    }

    // Parse enum variants (simple identifiers followed by comma, not functions)
    const lines = body.split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("//") || trimmed.startsWith("fn ") || trimmed.startsWith("pub fn ")) continue;

      // Match: variant_name, or variant_name = value,
      const variantMatch = trimmed.match(/^(\w+)\s*(?:=\s*([^,}\n]+))?\s*,?\s*$/);
      if (variantMatch) {
        const variantName = variantMatch[1];
        if (!variantName || methodNames.has(variantName)) continue;
        // Skip _ (discard pattern)
        if (variantName === "_") continue;

        const fullName = `${parentName}.${variantName}`;
        children.push({
          id: `${filePath}:enum_variant:${fullName}`,
          name: fullName,
          type: "enum_variant",
          filePath,
          location: bodyLineMap.getEntityLocation(body.indexOf(trimmed)),
        });
      }
    }
  }

  // ===========================================================================
  // CALLS AND CONTROL FLOW EXTRACTION (Second Pass)
  // ===========================================================================

  private extractCallsAndControlFlow(
    content: string,
    filePath: string,
    entities: ParsedEntity[],
    relationships: EntityRelationship[],
    lineMap: LineOffsetMap,
  ): void {
    this.resetRegex(FUNC_WITH_BODY_RE);

    // Build HashMaps for O(1) entity lookup instead of O(n) entities.find()
    const funcEntitiesByName = new Map<string, ParsedEntity[]>();
    const entityByFullName = new Map<string, ParsedEntity>();
    for (const e of entities) {
      if (e.type === "function" || e.type === "method") {
        const shortName = e.name.includes(".") ? e.name.split(".").pop()! : e.name;
        const list = funcEntitiesByName.get(shortName);
        if (list) list.push(e);
        else funcEntitiesByName.set(shortName, [e]);
        entityByFullName.set(e.name, e);
      }
    }

    let funcMatch: RegExpExecArray | null;
    let functionsProcessed = 0;

    while ((funcMatch = FUNC_WITH_BODY_RE.exec(content))) {
      const funcName = funcMatch[1];
      if (!funcName) continue;

      const bodyStartIndex = funcMatch.index + funcMatch[0].length - 1;
      const funcLine = lineMap.getLine(funcMatch.index);

      const body = this.extractBraceBlock(content, bodyStartIndex);
      if (!body) continue;

      // Find matching entity via HashMap O(1) + small array scan
      const candidates = funcEntitiesByName.get(funcName);
      const funcEntity = candidates?.find(
        (e) =>
          (e.name === funcName || e.name.endsWith(`.${funcName}`)) && Math.abs(e.location.start.line - funcLine) <= 5,
      );

      if (!funcEntity || !funcEntity.id) continue;
      // Skip if already has calls (parsed in struct body)
      if (funcEntity.calls) continue;

      functionsProcessed++;

      const calls = this.extractCallsFromBody(body);
      const controlFlow = this.extractControlFlowFromBody(body);

      if (calls.length > 0) {
        funcEntity.calls = calls.map((c) => ({
          name: c.name,
          ...(c.target && { target: c.target }),
          location: { start: { line: 0, column: 0, index: 0 }, end: { line: 0, column: 0, index: 0 } },
          argumentCount: c.argumentCount,
        }));

        for (const call of calls) {
          const qualifiedCallName = call.target ? `${call.target}.${call.name}` : call.name;

          // O(1) lookup via HashMap instead of O(n) entities.find()
          let targetEntity = entityByFullName.get(qualifiedCallName) || entityByFullName.get(call.name);
          if (!targetEntity) {
            const targetCandidates = funcEntitiesByName.get(call.name);
            if (targetCandidates && targetCandidates.length > 0) {
              targetEntity = targetCandidates[0];
            }
          }

          if (targetEntity) {
            relationships.push({
              from: funcEntity.name,
              to: targetEntity.name,
              type: "calls",
              metadata: { calledName: call.name, ...(call.target && { target: call.target }) },
            });
          } else {
            relationships.push({
              from: funcEntity.name,
              to: qualifiedCallName,
              type: "calls",
              metadata: {
                calledName: call.name,
                ...(call.target && { target: call.target }),
                crossModule: true,
              },
            });
          }
        }
      }

      if (controlFlow.branches.length > 0 || controlFlow.loops.length > 0 || controlFlow.exceptions.length > 0) {
        funcEntity.controlFlow = controlFlow;
      }
    }

    if (functionsProcessed > 0) {
      log.i("ZIG", "extractCallsAndControlFlow_done", {
        file: filePath.split(/[/\\]/).pop(),
        functionsProcessed,
      });
    }
  }

  // ===========================================================================
  // EXTRACT CALLS FROM BODY
  // ===========================================================================

  private extractCallsFromBody(body: string): Array<{
    name: string;
    target?: string;
    argumentCount: number;
  }> {
    const calls: Array<{ name: string; target?: string; argumentCount: number }> = [];
    const seen = new Set<string>();

    // Builtin calls: @intCast(...), @import(...), etc.
    const builtinRe = /@(\w+)\s*\(/g;
    let match: RegExpExecArray | null;
    while ((match = builtinRe.exec(body))) {
      const name = match[1];
      if (!name) continue;
      const callKey = `@${name}`;
      if (seen.has(callKey)) continue;
      seen.add(callKey);

      const afterCall = body.slice(match.index + match[0].length - 1);
      const argumentCount = this.countArgumentsSimple(afterCall);

      calls.push({ name: `@${name}`, argumentCount });
    }

    // Regular calls: name(...), obj.method(...)
    const callRe = /((?:[\w]+\.)*)([\w]+)\s*\(/g;
    while ((match = callRe.exec(body))) {
      const chain = match[1]?.replace(/\.$/, "");
      const name = match[2];
      if (!name) continue;

      // Skip keywords
      if (
        [
          "if",
          "while",
          "for",
          "switch",
          "catch",
          "return",
          "const",
          "var",
          "fn",
          "pub",
          "try",
          "test",
          "comptime",
          "struct",
          "enum",
          "union",
          "error",
        ].includes(name)
      ) {
        continue;
      }

      // Skip if it looks like a type (starts with uppercase and no chain — likely a struct literal)
      if (!chain && /^[A-Z]/.test(name)) continue;

      let target: string | undefined;
      if (chain) {
        const parts = chain.split(".");
        target = parts.length > 1 ? chain : parts[0];
      }

      const callKey = target ? `${target}.${name}` : name;
      if (seen.has(callKey)) continue;
      seen.add(callKey);

      const afterCall = body.slice(match.index + match[0].length - 1);
      const argumentCount = this.countArgumentsSimple(afterCall);

      calls.push({
        name,
        ...(target && { target }),
        argumentCount,
      });
    }

    return calls;
  }

  // ===========================================================================
  // EXTRACT CONTROL FLOW FROM BODY
  // ===========================================================================

  private extractControlFlowFromBody(body: string): NonNullable<ParsedEntity["controlFlow"]> {
    const dummyLocation = {
      start: { line: 0, column: 0, index: 0 },
      end: { line: 0, column: 0, index: 0 },
    };

    const branches: NonNullable<ParsedEntity["controlFlow"]>["branches"] = [];
    const loops: NonNullable<ParsedEntity["controlFlow"]>["loops"] = [];
    const exceptions: NonNullable<ParsedEntity["controlFlow"]>["exceptions"] = [];
    const returns: NonNullable<ParsedEntity["controlFlow"]>["returns"] = [];
    const awaits: NonNullable<ParsedEntity["controlFlow"]>["awaits"] = [];

    let match: RegExpExecArray | null;

    // if statements
    this.resetRegex(IF_RE);
    while ((match = IF_RE.exec(body))) {
      branches.push({ type: "if", condition: match[1]?.trim(), location: dummyLocation });
    }

    // else if
    this.resetRegex(ELSE_IF_RE);
    while ((match = ELSE_IF_RE.exec(body))) {
      branches.push({ type: "else-if", condition: match[1]?.trim(), location: dummyLocation });
    }

    // else
    this.resetRegex(ELSE_RE);
    while ((match = ELSE_RE.exec(body))) {
      branches.push({ type: "else", location: dummyLocation });
    }

    // switch
    this.resetRegex(SWITCH_RE);
    while ((match = SWITCH_RE.exec(body))) {
      branches.push({ type: "switch", condition: match[1]?.trim(), location: dummyLocation });
    }

    // for loops
    this.resetRegex(FOR_RE);
    while ((match = FOR_RE.exec(body))) {
      loops.push({ type: "for-in", location: dummyLocation });
    }

    // while loops
    this.resetRegex(WHILE_RE);
    while ((match = WHILE_RE.exec(body))) {
      loops.push({ type: "while", location: dummyLocation });
    }

    // try
    this.resetRegex(TRY_RE);
    while ((match = TRY_RE.exec(body))) {
      exceptions.push({ type: "try", location: dummyLocation });
    }

    // catch
    this.resetRegex(CATCH_RE);
    while ((match = CATCH_RE.exec(body))) {
      exceptions.push({ type: "catch", location: dummyLocation });
    }

    // defer (similar to finally)
    this.resetRegex(DEFER_RE);
    while ((match = DEFER_RE.exec(body))) {
      exceptions.push({ type: "finally", location: dummyLocation });
    }

    // errdefer (catch-like)
    this.resetRegex(ERRDEFER_RE);
    while ((match = ERRDEFER_RE.exec(body))) {
      exceptions.push({ type: "catch", location: dummyLocation });
    }

    // returns
    this.resetRegex(RETURN_RE);
    while ((match = RETURN_RE.exec(body))) {
      returns.push({ hasValue: !!match[1]?.trim(), location: dummyLocation });
    }

    return { branches, loops, exceptions, returns, awaits };
  }

  // ===========================================================================
  // UTILITY METHODS
  // ===========================================================================

  private extractBraceBlock(content: string, startIndex: number): string | null {
    if (content[startIndex] !== "{") return null;

    let depth = 1;
    let i = startIndex + 1;
    const maxLen = Math.min(content.length, startIndex + 50000);

    while (i < maxLen && depth > 0) {
      const char = content[i];
      if (char === "{") depth++;
      else if (char === "}") depth--;
      else if (char === '"') {
        i++;
        while (i < maxLen && content[i] !== '"') {
          if (content[i] === "\\") i++;
          i++;
        }
      } else if (char === "/" && i + 1 < maxLen && content[i + 1] === "/") {
        // Skip line comments
        while (i < maxLen && content[i] !== "\n") i++;
      }
      i++;
    }

    if (depth !== 0) return null;
    return content.slice(startIndex + 1, i - 1);
  }

  private cleanReturnType(raw: string): string | undefined {
    if (!raw) return undefined;
    // Remove align(...) and callconv(...) prefixes
    const cleaned = raw
      .replace(/\balign\s*\([^)]*\)\s*/g, "")
      .replace(/\bcallconv\s*\([^)]*\)\s*/g, "")
      .trim();
    return cleaned || undefined;
  }

  private isMethodParam(paramsStr: string, parentName: string): boolean {
    const firstParam = paramsStr.split(",")[0]?.trim() || "";
    return (
      firstParam.includes("self") ||
      firstParam.includes("*Self") ||
      firstParam.includes("*@This()") ||
      firstParam.includes(`*${parentName}`) ||
      firstParam.includes(`*const ${parentName}`)
    );
  }

  private isInsideTypeBodyFast(index: number, typeBodyRanges: Array<{ start: number; end: number }>): boolean {
    // Binary search: find last range where start <= index
    let lo = 0;
    let hi = typeBodyRanges.length - 1;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (typeBodyRanges[mid]!.start <= index) lo = mid + 1;
      else hi = mid - 1;
    }
    // hi is the index of the last range with start <= index
    return hi >= 0 && index < typeBodyRanges[hi]!.end;
  }

  private parseParameters(
    paramsStr: string,
  ): Array<{ name: string; type?: string; optional?: boolean; defaultValue?: string }> {
    if (!paramsStr.trim()) return [];

    const params: Array<{ name: string; type?: string; optional?: boolean; defaultValue?: string }> = [];
    let depth = 0;
    let current = "";
    const parts: string[] = [];

    for (const char of paramsStr) {
      if (char === "(" || char === "<" || char === "[" || char === "{") depth++;
      if (char === ")" || char === ">" || char === "]" || char === "}") depth--;
      if (char === "," && depth === 0) {
        parts.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    if (current.trim()) parts.push(current.trim());

    for (const part of parts) {
      // Pattern: name: Type
      const paramMatch = part.match(/^(\w+)\s*:\s*(.+)$/);
      if (paramMatch) {
        const name = paramMatch[1]!;
        const type = paramMatch[2]?.trim();
        // Skip self-like params from the output (they indicate method, not a real param)
        if (name === "self" || name === "ptr") continue;
        params.push({
          name,
          ...(type != null ? { type } : {}),
          optional: type?.startsWith("?") || false,
        });
      }
    }

    return params;
  }

  private countArgumentsSimple(afterOpenParen: string): number {
    if (!afterOpenParen.startsWith("(")) return 0;

    let depth = 1;
    let commas = 0;
    let hasContent = false;

    for (let i = 1; i < afterOpenParen.length && depth > 0; i++) {
      const char = afterOpenParen[i]!;
      if (char === "(" || char === "[" || char === "{") depth++;
      else if (char === ")" || char === "]" || char === "}") depth--;
      else if (char === "," && depth === 1) commas++;
      else if (depth === 1 && char.trim() && char !== ")") hasContent = true;
    }

    return hasContent ? commas + 1 : 0;
  }

  async parseIncremental(
    filePath: string,
    content: string,
    contentHash: string,
    _edits: unknown[],
  ): Promise<ParseResult> {
    return this.parse(filePath, content, contentHash);
  }

  getStats(): ParserStats {
    return { ...this.stats };
  }

  clearCache(): void {
    // No cache to clear
  }
}
