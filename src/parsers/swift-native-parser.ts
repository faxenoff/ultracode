/**
 * Swift Native Parser
 *
 * Uses regex-based parsing with rich Swift syntax support.
 * Works on ALL platforms (Windows, Linux, macOS) - no external dependencies.
 *
 * Note: swiftc availability is checked but NOT required for parsing.
 * The parser uses pure regex-based extraction which works everywhere.
 *
 * Architecture:
 * - Regex-based extraction for classes, structs, enums, protocols, functions
 * - Extracts Swift-specific constructs: extensions, actors, computed properties
 * - Properly distinguishes class inheritance from protocol conformance
 * - Handles Swift-specific syntax: optional chaining, trailing closures, etc.
 *
 * No native modules or Swift toolchain required - pure TypeScript.
 */

import { execSync } from "node:child_process";
import { log } from "../logging/index.js";
import type { EntityRelationship, ParsedEntity, ParseResult, SupportedLanguage } from "../types/parser.js";

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

interface SwiftParseResult {
  entities: ParsedEntity[];
  relationships: EntityRelationship[];
  errors: Array<{ message: string; location?: { line: number; column: number } }>;
}

// =============================================================================
// CACHED REGEX PATTERNS (avoid recreation on each parse)
// =============================================================================

const IMPORT_RE = /^\s*import\s+(?:(?:typealias|struct|class|enum|protocol|let|var|func)\s+)?(\w+(?:\.\w+)*)/gm;
const PROTOCOL_RE =
  /^\s*(?:public\s+|private\s+|internal\s+|fileprivate\s+|open\s+)?protocol\s+(\w+)(?:\s*:\s*([^{]+))?/gm;
const CLASS_RE =
  /^\s*(?:public\s+|private\s+|internal\s+|fileprivate\s+|open\s+)?(?:final\s+)?class\s+(\w+)(?:<[^>]+>)?(?:\s*:\s*([^{]+))?/gm;
const STRUCT_RE =
  /^\s*(?:public\s+|private\s+|internal\s+|fileprivate\s+)?struct\s+(\w+)(?:<[^>]+>)?(?:\s*:\s*([^{]+))?/gm;
const ENUM_RE =
  /^\s*(?:public\s+|private\s+|internal\s+|fileprivate\s+)?(?:indirect\s+)?enum\s+(\w+)(?:<[^>]+>)?(?:\s*:\s*([^{]+))?/gm;
const ACTOR_RE =
  /^\s*(?:public\s+|private\s+|internal\s+|fileprivate\s+)?actor\s+(\w+)(?:<[^>]+>)?(?:\s*:\s*([^{]+))?/gm;
const EXTENSION_RE = /^\s*(?:public\s+|private\s+|internal\s+|fileprivate\s+)?extension\s+(\w+)(?:\s*:\s*([^{]+))?/gm;
const FUNC_RE =
  /^\s*(?:@\w+(?:\([^)]*\))?\s+)*(?:public\s+|private\s+|internal\s+|fileprivate\s+|open\s+)?(?:override\s+)?(?:static\s+|class\s+)?(?:final\s+)?(?:mutating\s+)?func\s+(\w+)(?:<[^>]+>)?\s*\(([^)]*)\)\s*(async\s*)?(?:throws|rethrows)?\s*(?:->\s*([^{]+))?/gm;
const INIT_RE =
  /^\s*(?:@\w+(?:\([^)]*\))?\s+)*(?:public\s+|private\s+|internal\s+|fileprivate\s+)?(?:required\s+)?(?:convenience\s+)?init\s*[?!]?\s*\(([^)]*)\)/gm;
const PROP_RE =
  /^\s*(?:@\w+(?:\([^)]*\))?\s+)*(?:public\s+|private\s+|internal\s+|fileprivate\s+|open\s+)?(?:static\s+|class\s+)?(?:lazy\s+)?(?:weak\s+|unowned\s+)?(?:let|var)\s+(\w+)\s*:\s*([^={\n]+)/gm;
const TYPEALIAS_RE = /^\s*(?:public\s+|private\s+|internal\s+|fileprivate\s+)?typealias\s+(\w+)\s*=\s*([^\n]+)/gm;
const FUNC_WITH_BODY_RE = /(?:func\s+(\w+)|init)\s*(?:<[^>]+>)?\s*\([^)]*\)[^{]*\{/g;

// State property wrappers (@State, @Published, @StateObject, etc.)
const STATE_PROP_RE =
  /^\s*(@State|@Published|@StateObject|@ObservedObject|@EnvironmentObject|@Binding|@Observable|@ObservationTracked)\s+(?:private\s+|public\s+|internal\s+|fileprivate\s+)?(?:var|let)\s+(\w+)\s*(?::\s*([^=\n]+))?/gm;

// Control flow patterns for extracting branches/loops
const IF_RE = /\bif\s+(?:let\s+\w+\s*=\s*)?([^{]+)\{/g;
const GUARD_RE = /\bguard\s+(?:let\s+\w+\s*=\s*)?([^{]+)else\s*\{/g;
const SWITCH_RE = /\bswitch\s+(\w+)\s*\{/g;
const FOR_RE = /\bfor\s+(\w+)\s+in\s+([^{]+)\{/g;
const WHILE_RE = /\bwhile\s+([^{]+)\{/g;
const DO_CATCH_RE = /\bdo\s*\{/g;
const CATCH_RE = /\}\s*catch\s*(?:let\s+\w+)?\s*\{/g;

// Assignment patterns for data flow
const SELF_ASSIGN_RE = /\bself\.(\w+)\s*=\s*([^;\n]+)/g;
const VAR_ASSIGN_RE = /\b(let|var)\s+(\w+)\s*=\s*([^;\n]+)/g;

// =============================================================================
// SWIFT PARSER CLASS
// =============================================================================

export class SwiftNativeParser {
  /** Whether swiftc is available on this system (macOS/Linux with Swift toolchain) */
  public swiftcAvailable: boolean | null = null;
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

  /**
   * Initialize the parser and check if swiftc is available
   */
  async initialize(): Promise<void> {
    log.d("SWIFTPARSER", "check_avail");

    try {
      execSync("swiftc --version", { stdio: "ignore", windowsHide: true });
      this.swiftcAvailable = true;
      log.i("SWIFTPARSER", "init_done", { swiftc: true });
    } catch {
      this.swiftcAvailable = false;
      log.i("SWIFTPARSER", "init_done", { swiftc: false });
    }
  }

  /**
   * Check if this parser supports the given file
   */
  supportsFile(filePath: string): boolean {
    return filePath.toLowerCase().endsWith(".swift");
  }

  /**
   * Parse a Swift file
   */
  async parse(filePath: string, content: string, contentHash: string): Promise<ParseResult> {
    const startTime = Date.now();

    try {
      const result = this.parseWithRegex(filePath, content);
      const parseTimeMs = Date.now() - startTime;

      // Update stats
      this.stats.filesParsed++;
      this.stats.totalParseTimeMs += parseTimeMs;
      this.stats.avgParseTimeMs = this.stats.totalParseTimeMs / this.stats.filesParsed;

      return {
        filePath,
        language: "swift" as SupportedLanguage,
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
        language: "swift" as SupportedLanguage,
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

  /**
   * Reset regex lastIndex for reuse
   */
  private resetRegex(re: RegExp): void {
    re.lastIndex = 0;
  }

  /**
   * Regex-based parser for Swift
   */
  private parseWithRegex(filePath: string, content: string): SwiftParseResult {
    const entities: ParsedEntity[] = [];
    const relationships: EntityRelationship[] = [];
    let match: RegExpExecArray | null;

    // Track current context for nested declarations
    let currentType: string | null = null;

    // =======================================================================
    // IMPORTS
    // =======================================================================
    this.resetRegex(IMPORT_RE);
    while ((match = IMPORT_RE.exec(content))) {
      const importPath = match[1];
      if (!importPath) continue;

      const importId = `${filePath}:import:${importPath}`;
      entities.push({
        id: importId,
        name: importPath,
        type: "import",
        filePath,
        location: this.getLocationFromIndex(content, match.index),
        modifiers: [],
        importData: {
          source: importPath,
          specifiers: [{ local: importPath.split(".").pop() || importPath }],
        },
      });
    }

    // =======================================================================
    // PROTOCOLS
    // =======================================================================
    this.resetRegex(PROTOCOL_RE);
    while ((match = PROTOCOL_RE.exec(content))) {
      const name = match[1];
      if (!name) continue;

      const protocolId = `${filePath}:protocol:${name}`;
      const inheritance = match[2]?.trim();

      // Parse parent protocols for inheritance field
      const parentProtocols = inheritance
        ? (inheritance
            .split(",")
            .map((p) => p.trim().split("<")[0]?.trim())
            .filter(Boolean) as string[])
        : [];
      const inheritanceInfo = parentProtocols.length > 0 ? { baseClasses: [], interfaces: parentProtocols } : undefined;

      entities.push({
        id: protocolId,
        name,
        type: "protocol",
        filePath,
        location: this.getLocationFromIndex(content, match.index),
        modifiers: this.extractModifiersFromMatch(match[0]),
        ...(inheritanceInfo && { inheritance: inheritanceInfo }),
      });

      // Note: protocol inheritance relationships are created by relationship-builder from entity.inheritance
    }

    // =======================================================================
    // CLASSES
    // =======================================================================
    this.resetRegex(CLASS_RE);
    while ((match = CLASS_RE.exec(content))) {
      const name = match[1];
      if (!name) continue;

      const classId = `${filePath}:class:${name}`;
      const inheritanceClause = match[2]?.trim();
      const modifiers = this.extractModifiersFromMatch(match[0]);

      // Parse inheritance to extract base classes and protocols
      const inheritanceInfo = inheritanceClause ? this.parseInheritanceInfo(inheritanceClause) : undefined;

      entities.push({
        id: classId,
        name,
        type: "class",
        filePath,
        location: this.getLocationFromIndex(content, match.index),
        modifiers,
        ...(inheritanceInfo && { inheritance: inheritanceInfo }),
      });

      // Note: inheritance relationships are created by relationship-builder from entity.inheritance

      currentType = name;
    }

    // =======================================================================
    // STRUCTS
    // =======================================================================
    this.resetRegex(STRUCT_RE);
    while ((match = STRUCT_RE.exec(content))) {
      const name = match[1];
      if (!name) continue;

      const structId = `${filePath}:struct:${name}`;
      const conformance = match[2]?.trim();
      const modifiers = this.extractModifiersFromMatch(match[0]);

      // Parse conformance to extract protocols (structs don't have base classes)
      const inheritanceInfo = conformance
        ? {
            baseClasses: [],
            interfaces: conformance
              .split(",")
              .map((p) => p.trim().split("<")[0]?.trim())
              .filter(Boolean) as string[],
          }
        : undefined;

      entities.push({
        id: structId,
        name,
        type: "struct",
        filePath,
        location: this.getLocationFromIndex(content, match.index),
        modifiers,
        metadata: { isValueType: true },
        ...(inheritanceInfo &&
          inheritanceInfo.interfaces &&
          inheritanceInfo.interfaces.length > 0 && { inheritance: inheritanceInfo }),
      });

      // Note: conformance relationships are created by relationship-builder from entity.inheritance

      currentType = name; // Track current type for member qualification
    }

    // =======================================================================
    // ENUMS
    // =======================================================================
    this.resetRegex(ENUM_RE);
    while ((match = ENUM_RE.exec(content))) {
      const name = match[1];
      if (!name) continue;

      const enumId = `${filePath}:enum:${name}`;
      const rawTypeOrConformance = match[2]?.trim();
      const modifiers = this.extractModifiersFromMatch(match[0]);

      // Parse raw type / protocol conformance (enums can have raw type or protocols)
      const inheritanceInfo = rawTypeOrConformance
        ? {
            baseClasses: [],
            interfaces: rawTypeOrConformance
              .split(",")
              .map((p) => p.trim().split("<")[0]?.trim())
              .filter(Boolean) as string[],
          }
        : undefined;

      entities.push({
        id: enumId,
        name,
        type: "enum",
        filePath,
        location: this.getLocationFromIndex(content, match.index),
        modifiers,
        metadata: { isValueType: true },
        ...(inheritanceInfo &&
          inheritanceInfo.interfaces &&
          inheritanceInfo.interfaces.length > 0 && { inheritance: inheritanceInfo }),
      });

      // Note: conformance relationships are created by relationship-builder from entity.inheritance
    }

    // =======================================================================
    // ACTORS
    // =======================================================================
    this.resetRegex(ACTOR_RE);
    while ((match = ACTOR_RE.exec(content))) {
      const name = match[1];
      if (!name) continue;

      const actorId = `${filePath}:actor:${name}`;
      const conformance = match[2]?.trim();
      const modifiers = this.extractModifiersFromMatch(match[0]);

      // Parse conformance to extract protocols (actors don't have base classes)
      const inheritanceInfo = conformance
        ? {
            baseClasses: [],
            interfaces: conformance
              .split(",")
              .map((p) => p.trim().split("<")[0]?.trim())
              .filter(Boolean) as string[],
          }
        : undefined;

      entities.push({
        id: actorId,
        name,
        type: "actor",
        filePath,
        location: this.getLocationFromIndex(content, match.index),
        modifiers,
        metadata: { isActor: true, supportsAsync: true },
        ...(inheritanceInfo &&
          inheritanceInfo.interfaces &&
          inheritanceInfo.interfaces.length > 0 && { inheritance: inheritanceInfo }),
      });

      // Note: conformance relationships are created by relationship-builder from entity.inheritance
    }

    // =======================================================================
    // EXTENSIONS
    // =======================================================================
    this.resetRegex(EXTENSION_RE);
    while ((match = EXTENSION_RE.exec(content))) {
      const extendedType = match[1];
      if (!extendedType) continue;

      const extensionId = `${filePath}:extension:${extendedType}`;
      const conformance = match[2]?.trim();

      // Parse conformance to extract protocols
      const protocols = conformance
        ? (conformance
            .split(",")
            .map((p) => p.trim().split("<")[0]?.trim())
            .filter(Boolean) as string[])
        : [];
      // Extensions have the extended type as "base class" and protocols as interfaces
      const inheritanceInfo = { baseClasses: [extendedType], interfaces: protocols };

      entities.push({
        id: extensionId,
        name: extendedType,
        type: "extension",
        filePath,
        location: this.getLocationFromIndex(content, match.index),
        modifiers: [],
        metadata: { isExtension: true, extendedType },
        inheritance: inheritanceInfo,
      });

      // Note: extension relationships are created by relationship-builder from entity.inheritance
    }

    // =======================================================================
    // FUNCTIONS (Top-level and methods)
    // =======================================================================
    // Swift: async/throws come AFTER parameters: func foo() async throws -> T
    this.resetRegex(FUNC_RE);
    while ((match = FUNC_RE.exec(content))) {
      const name = match[1];
      if (!name) continue;

      const fullName = currentType ? `${currentType}.${name}` : name;
      const funcId = `${filePath}:function:${fullName}`;
      const modifiers = this.extractModifiersFromMatch(match[0]);
      const paramsStr = match[2] || "";
      const hasAsyncKeyword = !!match[3]; // async after params
      const returnType = match[4]?.trim();

      // Check for async both in modifiers and after parameters
      const isAsync = hasAsyncKeyword || modifiers.includes("async");
      if (hasAsyncKeyword && !modifiers.includes("async")) {
        modifiers.push("async");
      }
      const parameters = this.parseParameters(paramsStr);

      // Determine function type based on context and async modifier
      const funcType: "function" | "method" | "async_function" = isAsync
        ? "async_function"
        : currentType
          ? "method"
          : "function";

      entities.push({
        id: funcId,
        name: fullName, // Use qualified name (ClassName.methodName) for cross-module resolution
        type: funcType,
        filePath,
        location: this.getLocationFromIndex(content, match.index),
        modifiers,
        ...(parameters.length > 0 && { parameters }),
        ...(returnType && { returnType }),
      });

      // Link to parent type using NAMES (not IDs) for indexer resolution
      if (currentType) {
        const funcLocation = this.getLocationFromIndex(content, match.index);
        relationships.push({
          from: fullName, // Use qualified name
          to: currentType,
          type: "member_of",
          metadata: { line: funcLocation.start.line },
        });
      }
    }

    // =======================================================================
    // INITIALIZERS
    // =======================================================================
    this.resetRegex(INIT_RE);
    while ((match = INIT_RE.exec(content))) {
      const fullName = currentType ? `${currentType}.init` : "init";
      const funcId = `${filePath}:function:${fullName}`;
      const modifiers = this.extractModifiersFromMatch(match[0]);
      const paramsStr = match[1] || "";

      const parameters = this.parseParameters(paramsStr);
      const initLocation = this.getLocationFromIndex(content, match.index);

      entities.push({
        id: funcId,
        name: fullName, // Use qualified name (ClassName.init) for cross-module resolution
        type: "method",
        filePath,
        location: initLocation,
        modifiers,
        metadata: { isInitializer: true },
        ...(parameters.length > 0 && { parameters }),
      });

      if (currentType) {
        relationships.push({
          from: fullName, // Use qualified name
          to: currentType,
          type: "member_of",
          metadata: { line: initLocation.start.line },
        });
      }
    }

    // =======================================================================
    // PROPERTIES
    // =======================================================================
    this.resetRegex(PROP_RE);
    while ((match = PROP_RE.exec(content))) {
      const name = match[1];
      if (!name) continue;

      const fullName = currentType ? `${currentType}.${name}` : name;
      const propId = `${filePath}:property:${fullName}`;
      const modifiers = this.extractModifiersFromMatch(match[0]);
      const propType = match[2]?.trim();
      const propLocation = this.getLocationFromIndex(content, match.index);

      entities.push({
        id: propId,
        name: fullName, // Use qualified name (ClassName.propertyName) for cross-module resolution
        type: "property",
        filePath,
        location: propLocation,
        modifiers,
        ...(propType && { returnType: propType }),
      });

      if (currentType) {
        relationships.push({
          from: fullName, // Use qualified name
          to: currentType,
          type: "member_of",
          metadata: { line: propLocation.start.line },
        });
      }
    }

    // =======================================================================
    // TYPE ALIASES
    // =======================================================================
    this.resetRegex(TYPEALIAS_RE);
    while ((match = TYPEALIAS_RE.exec(content))) {
      const name = match[1];
      if (!name) continue;

      entities.push({
        id: `${filePath}:type:${name}`,
        name,
        type: "type",
        filePath,
        location: this.getLocationFromIndex(content, match.index),
        modifiers: this.extractModifiersFromMatch(match[0]),
        metadata: { aliasOf: match[2]?.trim() },
      });
    }

    // =======================================================================
    // STATE PROPERTIES (@State, @Published, @StateObject, etc.)
    // =======================================================================
    this.resetRegex(STATE_PROP_RE);
    while ((match = STATE_PROP_RE.exec(content))) {
      const wrapper = match[1]; // @State, @Published, etc.
      const name = match[2];
      const propType = match[3]?.trim();
      if (!name) continue;

      const fullName = currentType ? `${currentType}.${name}` : name;
      const stateId = `${filePath}:state:${fullName}`;
      const stateLocation = this.getLocationFromIndex(content, match.index);

      entities.push({
        id: stateId,
        name: fullName, // Use qualified name (ClassName.propertyName) for cross-module resolution
        type: "property",
        filePath,
        location: stateLocation,
        modifiers: [wrapper?.slice(1) || "State"], // Remove @
        returnType: propType,
        metadata: {
          isState: true,
          stateWrapper: wrapper,
          stateType: this.classifyStateWrapper(wrapper || "@State"),
        },
      });

      // Link to parent type using NAMES for indexer resolution
      if (currentType) {
        relationships.push({
          from: fullName, // Use qualified name
          to: currentType,
          type: "member_of",
          metadata: { line: stateLocation.start.line },
        });

        // Create state_dependency relationship for reactive tracking
        relationships.push({
          from: currentType,
          to: fullName, // Use qualified name
          type: "depends_on",
          metadata: { line: stateLocation.start.line, stateType: wrapper, reactive: true },
        });
      }
    }

    // =======================================================================
    // EXTRACT CALLS AND DATA FLOW FROM FUNCTION BODIES (Second Pass)
    // =======================================================================
    this.extractCallsAndDataFlow(content, filePath, entities, relationships);

    // DEBUG: Log relationships created
    const callsRels = relationships.filter((r) => r.type === "calls");
    const inheritRels = relationships.filter((r) => r.type === "inherits" || r.type === "implements");
    const memberRels = relationships.filter((r) => r.type === "member_of");
    if (relationships.length > 0) {
      log.i("SWIFT", "parse_relationships", {
        file: filePath.split(/[/\\]/).pop(),
        total: relationships.length,
        calls: callsRels.length,
        inherit: inheritRels.length,
        member_of: memberRels.length,
        callsSample: callsRels.slice(0, 3).map((r) => `${r.from}->${r.to}`),
      });
    }

    return { entities, relationships, errors: [] };
  }

  /**
   * Classify state wrapper type for analysis
   */
  private classifyStateWrapper(
    wrapper: string,
  ): "local" | "published" | "object" | "observed" | "environment" | "binding" | "observable" {
    switch (wrapper) {
      case "@State":
        return "local";
      case "@Published":
        return "published";
      case "@StateObject":
        return "object";
      case "@ObservedObject":
        return "observed";
      case "@EnvironmentObject":
        return "environment";
      case "@Binding":
        return "binding";
      case "@Observable":
      case "@ObservationTracked":
        return "observable";
      default:
        return "local";
    }
  }

  /**
   * Extract function calls, control flow, and data flow from function bodies
   */
  private extractCallsAndDataFlow(
    content: string,
    _filePath: string,
    entities: ParsedEntity[],
    relationships: EntityRelationship[],
  ): void {
    // Collect state property names per class for data flow detection
    // Key: class name, Value: set of SIMPLE property names (for matching self.propName in body)
    const statePropsPerClass = new Map<string, Set<string>>();
    for (const entity of entities) {
      const meta = entity.metadata as Record<string, unknown> | undefined;
      if (entity.type === "property" && meta?.["isState"] && entity.id) {
        // Entity ID format: "FilePath:state:ClassName.propName" or "FilePath:property:ClassName.propName"
        const idParts = entity.id.split(":");
        const fullName = idParts[idParts.length - 1]; // "ClassName.propName"
        const dotIndex = fullName?.lastIndexOf(".");
        if (dotIndex && dotIndex > 0) {
          const className = fullName!.substring(0, dotIndex);
          const simplePropName = fullName!.substring(dotIndex + 1); // Extract simple name for body matching
          if (!statePropsPerClass.has(className)) {
            statePropsPerClass.set(className, new Set());
          }
          statePropsPerClass.get(className)!.add(simplePropName);
        }
      }
    }

    // Find all functions/methods with their bodies
    this.resetRegex(FUNC_WITH_BODY_RE);

    let funcMatch: RegExpExecArray | null;
    let functionsProcessed = 0;
    let functionsWithCalls = 0;
    while ((funcMatch = FUNC_WITH_BODY_RE.exec(content))) {
      const funcName = funcMatch[1] || "init";
      const bodyStartIndex = funcMatch.index + funcMatch[0].length - 1; // Position of '{'
      const funcLine = content.slice(0, funcMatch.index).split("\n").length;

      // Extract the function body
      const body = this.extractBraceBlock(content, bodyStartIndex);
      if (!body) continue;

      // Find which entity this function belongs to - match by name AND approximate line number
      // This handles multiple functions with same name in different classes
      // Entity names are now qualified (ClassName.methodName), so match both exact and suffix
      const funcEntity = entities.find(
        (e) =>
          (e.type === "function" || e.type === "method" || e.type === "async_function") &&
          (e.name === funcName ||
            e.name.endsWith(`.${funcName}`) ||
            (funcName === "init" && e.name.endsWith(".init"))) &&
          Math.abs(e.location.start.line - funcLine) <= 5, // Allow small line number variance
      );

      if (!funcEntity || !funcEntity.id) {
        // DEBUG: Log when entity not found
        log.d("SWIFT", "func_entity_not_found", { funcName, funcLine, entitiesCount: entities.length });
        continue;
      }

      functionsProcessed++;

      // Determine parent class from entity ID (format: "FilePath:type:ClassName.methodName")
      const idParts = funcEntity.id.split(":");
      const fullName = idParts[idParts.length - 1]; // "ClassName.methodName"
      const dotIndex = fullName?.indexOf(".");
      const parentClass = dotIndex && dotIndex > 0 ? fullName!.substring(0, dotIndex) : null;
      const classStateProps = parentClass ? statePropsPerClass.get(parentClass) : undefined;

      // Extract calls from the body
      const calls = this.extractCallsFromBody(body);

      // Extract control flow
      const controlFlow = this.extractControlFlowFromBody(body);

      // Extract data flow (state reads and modifications) - pass state property names
      const dataFlow = this.extractDataFlowFromBody(body, classStateProps);

      // Add calls to entity
      if (calls.length > 0) {
        functionsWithCalls++;
        funcEntity.calls = calls.map((c) => ({
          name: c.name,
          ...(c.target && { target: c.target }),
          location: {
            start: { line: 0, column: 0, index: 0 },
            end: { line: 0, column: 0, index: 0 },
          },
          argumentCount: c.argumentCount,
          ...(c.isAwait && { isAwait: true }),
          ...(c.isOptional && { isOptional: true }),
        }));

        // Create 'calls' relationships
        for (const call of calls) {
          // Build qualified call name: TargetClass.methodName or just methodName
          const qualifiedCallName = call.target
            ? `${call.target.charAt(0).toUpperCase() + call.target.slice(1)}.${call.name}`
            : call.name;

          // Try to find the target entity in current file by qualified name
          const targetEntity = entities.find(
            (e) =>
              (e.type === "function" || e.type === "method" || e.type === "async_function") &&
              (e.name === qualifiedCallName || e.name === call.name || e.name.endsWith(`.${call.name}`)),
          );

          if (targetEntity) {
            // Local call within same file - use entity NAME (not id) for indexer resolution
            relationships.push({
              from: funcEntity.name,
              to: targetEntity.name,
              type: "calls",
              metadata: {
                line: funcEntity.location.start.line,
                calledName: call.name,
                ...(call.target && { target: call.target }),
                ...(call.isAwait && { isAsync: true }),
              },
            });
          } else {
            // External/cross-module call - use qualified name (ClassName.methodName)
            // The indexer will add external: prefix if entity is not found
            relationships.push({
              from: funcEntity.name,
              to: qualifiedCallName, // Just the name, e.g., "ServerPoster.postMobileConnect"
              type: "calls",
              metadata: {
                line: funcEntity.location.start.line,
                calledName: call.name,
                ...(call.target && { target: call.target }),
                ...(call.isAwait && { isAsync: true }),
                crossModule: true,
                ...(call.target && {
                  targetClass: call.target.charAt(0).toUpperCase() + call.target.slice(1),
                }),
              },
            });
          }
        }
      }

      // Add control flow to entity
      if (controlFlow.branches.length > 0 || controlFlow.loops.length > 0 || controlFlow.exceptions.length > 0) {
        funcEntity.controlFlow = controlFlow;
      }

      // Add data flow to entity metadata
      if (dataFlow.stateReads.length > 0 || dataFlow.stateModifications.length > 0) {
        funcEntity.metadata = {
          ...funcEntity.metadata,
          stateReads: dataFlow.stateReads,
          stateModifications: dataFlow.stateModifications,
        };

        // Create relationships for state dependencies
        // Create depends_on relationships for state dependencies (used by trace_data_flow)
        for (const stateRead of dataFlow.stateReads) {
          relationships.push({
            from: funcEntity.name,
            to: stateRead,
            type: "depends_on",
            metadata: { line: funcEntity.location.start.line, accessType: "read", isState: true },
          });
        }

        for (const stateMod of dataFlow.stateModifications) {
          relationships.push({
            from: funcEntity.name,
            to: stateMod,
            type: "depends_on",
            metadata: { line: funcEntity.location.start.line, accessType: "write", isState: true },
          });
        }
      }
    }

    // Log summary of call extraction
    if (functionsProcessed > 0 || functionsWithCalls > 0) {
      const callsRels = relationships.filter((r) => r.type === "calls").length;
      log.i("SWIFT", "extractCallsAndDataFlow_done", {
        file: _filePath.split(/[/\\]/).pop(),
        functionsProcessed,
        functionsWithCalls,
        callsRelationships: callsRels,
      });
    }
  }

  /**
   * Extract control flow information from a function body
   */
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

    // Extract if statements
    this.resetRegex(IF_RE);
    let match: RegExpExecArray | null;
    while ((match = IF_RE.exec(body))) {
      branches.push({ type: "if", condition: match[1]?.trim(), location: dummyLocation });
    }

    // Extract guard statements (treat as if for type compatibility)
    this.resetRegex(GUARD_RE);
    while ((match = GUARD_RE.exec(body))) {
      branches.push({ type: "if", condition: `guard: ${match[1]?.trim()}`, location: dummyLocation });
    }

    // Extract switch statements
    this.resetRegex(SWITCH_RE);
    while ((match = SWITCH_RE.exec(body))) {
      branches.push({ type: "switch", condition: match[1]?.trim(), location: dummyLocation });
    }

    // Extract for loops
    this.resetRegex(FOR_RE);
    while ((match = FOR_RE.exec(body))) {
      loops.push({ type: "for-in", location: dummyLocation });
    }

    // Extract while loops
    this.resetRegex(WHILE_RE);
    while ((match = WHILE_RE.exec(body))) {
      loops.push({ type: "while", location: dummyLocation });
    }

    // Extract do-catch
    this.resetRegex(DO_CATCH_RE);
    while ((match = DO_CATCH_RE.exec(body))) {
      exceptions.push({ type: "try", location: dummyLocation });
    }

    this.resetRegex(CATCH_RE);
    while ((match = CATCH_RE.exec(body))) {
      exceptions.push({ type: "catch", location: dummyLocation });
    }

    // Extract returns
    const returnRe = /\breturn\s*([^;\n}]+)?/g;
    while ((match = returnRe.exec(body))) {
      returns.push({ hasValue: !!match[1]?.trim(), location: dummyLocation });
    }

    // Extract awaits
    const awaitRe = /\bawait\s+(\w+(?:\.\w+)*)/g;
    while ((match = awaitRe.exec(body))) {
      awaits.push({ expression: match[1] || "unknown", location: dummyLocation });
    }

    return {
      branches,
      loops,
      exceptions,
      returns,
      awaits,
    };
  }

  /**
   * Extract data flow information (state reads and modifications) from a function body
   * @param body - Function body content
   * @param knownStateProps - Known state property names for this class (to detect without self.)
   */
  private extractDataFlowFromBody(
    body: string,
    knownStateProps?: Set<string>,
  ): {
    stateReads: string[];
    stateModifications: string[];
  } {
    const stateReads = new Set<string>();
    const stateModifications = new Set<string>();

    // Extract self.property = value (state modifications)
    this.resetRegex(SELF_ASSIGN_RE);
    let match: RegExpExecArray | null;
    while ((match = SELF_ASSIGN_RE.exec(body))) {
      const propName = match[1];
      if (propName) {
        stateModifications.add(propName);
      }
    }

    // Extract property reads: self.property (not followed by =)
    const selfReadRe = /\bself\.(\w+)(?!\s*=)/g;
    while ((match = selfReadRe.exec(body))) {
      const propName = match[1];
      if (propName && !stateModifications.has(propName)) {
        stateReads.add(propName);
      }
    }

    // Extract bare state property usage (without self.) - Swift allows this
    if (knownStateProps && knownStateProps.size > 0) {
      for (const stateProp of knownStateProps) {
        // Check for assignment: propName = value (but not ==, !=, <=, >=)
        const assignRe = new RegExp(`\\b${stateProp}\\s*(?<![=!<>])=(?!=)`, "g");
        if (assignRe.test(body)) {
          stateModifications.add(stateProp);
        }

        // Check for read: propName used in expression (not assignment target)
        // Look for propName followed by operators, method calls, or in conditions
        const readPatterns = [
          `\\bif\\s+.*\\b${stateProp}\\b`, // in if condition
          `\\bguard\\s+.*\\b${stateProp}\\b`, // in guard
          `\\bswitch\\s+${stateProp}\\b`, // switch subject
          `\\breturn\\s+.*\\b${stateProp}\\b`, // in return
          `\\b${stateProp}\\s*\\.`, // method/property access
          `\\b${stateProp}\\s*\\?`, // optional chaining
          `!${stateProp}\\b`, // negation
          `\\(\\s*${stateProp}\\s*\\)`, // in parentheses
          `\\b${stateProp}\\s*[+\\-*/%&|^]`, // in arithmetic/bitwise
          `,\\s*${stateProp}\\b`, // as argument
          `\\(${stateProp}\\b`, // first argument
        ];
        for (const pattern of readPatterns) {
          const re = new RegExp(pattern);
          if (re.test(body) && !stateModifications.has(stateProp)) {
            stateReads.add(stateProp);
            break;
          }
        }
      }
    }

    // Extract local variable assignments for data flow tracking
    this.resetRegex(VAR_ASSIGN_RE);
    while ((match = VAR_ASSIGN_RE.exec(body))) {
      const varName = match[2];
      const value = match[3];
      if (varName && value) {
        // Check if the value references self.property
        const selfRefMatch = value.match(/self\.(\w+)/);
        if (selfRefMatch?.[1]) {
          stateReads.add(selfRefMatch[1]);
        }
        // Check if the value references a known state property
        if (knownStateProps) {
          for (const stateProp of knownStateProps) {
            if (new RegExp(`\\b${stateProp}\\b`).test(value)) {
              stateReads.add(stateProp);
            }
          }
        }
      }
    }

    return {
      stateReads: Array.from(stateReads),
      stateModifications: Array.from(stateModifications),
    };
  }

  /**
   * Extract a brace-delimited block starting at the given index
   */
  private extractBraceBlock(content: string, startIndex: number): string | null {
    if (content[startIndex] !== "{") return null;

    let depth = 1;
    let i = startIndex + 1;
    const maxLen = Math.min(content.length, startIndex + 50000); // Limit to 50k chars

    while (i < maxLen && depth > 0) {
      const char = content[i];
      if (char === "{") depth++;
      else if (char === "}") depth--;
      // Skip strings
      else if (char === '"') {
        i++;
        while (i < maxLen && content[i] !== '"') {
          if (content[i] === "\\") i++; // Skip escaped char
          i++;
        }
      }
      i++;
    }

    if (depth !== 0) return null;
    return content.slice(startIndex + 1, i - 1);
  }

  /**
   * Extract function/method calls from a function body
   */
  private extractCallsFromBody(body: string): Array<{
    name: string;
    target?: string;
    argumentCount: number;
    isAwait?: boolean;
    isOptional?: boolean;
  }> {
    const calls: Array<{
      name: string;
      target?: string;
      argumentCount: number;
      isAwait?: boolean;
      isOptional?: boolean;
    }> = [];

    const seen = new Set<string>();

    // Pattern for function calls:
    // - await? target?.methodName(args)
    // - await? functionName(args)
    // - self.methodName(args)
    // - ClassName.staticMethod(args)
    // - ClassName.shared.methodName(args) - singleton pattern
    // Captures chain like "ServerPoster.shared" or "self" or "instance"
    const callRe = /(?:(await)\s+)?(?:(try[?!]?)\s+)?((?:[\w]+[?!]?\.)+)?(\w+)\s*\(/g;

    let match: RegExpExecArray | null;
    while ((match = callRe.exec(body))) {
      const isAwait = !!match[1];
      const chain = match[3]?.replace(/[?!]/g, "").replace(/\.$/, ""); // e.g., "ServerPoster.shared" or "self"
      const name = match[4];

      // Extract target class from chain (first identifier if uppercase, or last for instance)
      let target: string | undefined;
      if (chain) {
        const parts = chain.split(".");
        // Check if first part is a class name (starts with uppercase)
        if (parts[0] && /^[A-Z]/.test(parts[0])) {
          target = parts[0]; // ClassName from ClassName.shared.method()
        } else if (parts.length > 0) {
          target = parts[parts.length - 1]; // Last part for instance.method()
        }
      }

      if (!name) continue;

      // Skip common keywords that aren't function calls
      if (["if", "guard", "while", "for", "switch", "catch", "return", "throw", "let", "var", "case"].includes(name)) {
        continue;
      }

      // Skip duplicate calls (same target.name)
      const callKey = target ? `${target}.${name}` : name;
      if (seen.has(callKey)) continue;
      seen.add(callKey);

      // Count arguments (simple heuristic)
      const afterCall = body.slice(match.index + match[0].length - 1);
      const argumentCount = this.countArgumentsSimple(afterCall);

      const isOptional = match[0].includes("?.");

      calls.push({
        name,
        ...(target && { target }),
        argumentCount,
        ...(isAwait && { isAwait: true }),
        ...(isOptional && { isOptional: true }),
      });
    }

    return calls;
  }

  /**
   * Simple argument counter - counts commas at depth 0
   */
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

    // If there's content, args = commas + 1; if empty (), args = 0
    return hasContent ? commas + 1 : 0;
  }

  /**
   * Parse inheritance clause and return inheritance info object
   */
  private parseInheritanceInfo(inheritance: string): {
    baseClasses: string[];
    interfaces?: string[];
  } {
    const parts = inheritance
      .split(",")
      .map((p) => p.trim().split("<")[0]?.trim())
      .filter(Boolean) as string[];

    const baseClasses: string[] = [];
    const interfaces: string[] = [];

    // Known protocols (patterns)
    const isLikelyProtocol = (name: string): boolean => {
      return (
        name.endsWith("Delegate") ||
        name.endsWith("DataSource") ||
        name.endsWith("Protocol") ||
        name.endsWith("able") ||
        name.endsWith("ible") ||
        name.endsWith("Type") ||
        ["Equatable", "Hashable", "Comparable", "Codable", "Identifiable", "Error", "Sendable"].includes(name)
      );
    };

    parts.forEach((typeName, index) => {
      if (!typeName) return;

      if (isLikelyProtocol(typeName)) {
        interfaces.push(typeName);
      } else if (index === 0) {
        // First non-protocol is likely a base class
        baseClasses.push(typeName);
      } else {
        // Default to protocol for subsequent items
        interfaces.push(typeName);
      }
    });

    return {
      baseClasses,
      ...(interfaces.length > 0 && { interfaces }),
    };
  }

  /**
   * Extract modifiers from a match string
   */
  private extractModifiersFromMatch(matchStr: string): string[] {
    const modifiers: string[] = [];
    const modifierKeywords = [
      "public",
      "private",
      "internal",
      "fileprivate",
      "open",
      "final",
      "static",
      "class",
      "override",
      "mutating",
      "nonmutating",
      "lazy",
      "weak",
      "unowned",
      "required",
      "convenience",
      "async",
      "throws",
      "rethrows",
      "indirect",
    ];

    for (const mod of modifierKeywords) {
      if (new RegExp(`\\b${mod}\\b`).test(matchStr)) {
        modifiers.push(mod);
      }
    }

    return modifiers;
  }

  /**
   * Parse function parameters
   */
  private parseParameters(
    paramsStr: string,
  ): Array<{ name: string; type?: string; optional?: boolean; defaultValue?: string }> {
    if (!paramsStr.trim()) return [];

    const params: Array<{ name: string; type?: string; optional?: boolean; defaultValue?: string }> = [];

    // Split by comma, but respect nested generics/closures
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
      // Pattern: externalName internalName: Type = defaultValue
      // or: _ name: Type
      // or: name: Type
      const paramMatch = part.match(/^(?:(\w+|_)\s+)?(\w+)\s*:\s*([^=]+?)(?:\s*=\s*(.+))?$/);
      if (paramMatch) {
        const [, _external, name, type, defaultValue] = paramMatch;
        if (name) {
          params.push({
            name,
            ...(type?.trim() ? { type: type.trim() } : {}),
            ...(defaultValue !== undefined || type?.includes("?") ? { optional: true } : {}),
            ...(defaultValue ? { defaultValue: defaultValue.trim() } : {}),
          });
        }
      }
    }

    return params;
  }

  /**
   * Get location from character index
   */
  private getLocationFromIndex(content: string, index: number): ParsedEntity["location"] {
    let line = 1;
    let column = 0;
    for (let i = 0; i < index && i < content.length; i++) {
      if (content[i] === "\n") {
        line++;
        column = 0;
      } else {
        column++;
      }
    }

    return {
      start: { line, column, index },
      end: { line, column: column + 1, index: index + 1 },
    };
  }

  /**
   * Parse with incremental support (just calls regular parse)
   */
  async parseIncremental(
    filePath: string,
    content: string,
    contentHash: string,
    _edits: unknown[],
  ): Promise<ParseResult> {
    return this.parse(filePath, content, contentHash);
  }

  /**
   * Get parser statistics
   */
  getStats(): ParserStats {
    return { ...this.stats };
  }

  /**
   * Clear any internal caches
   */
  clearCache(): void {
    // No cache to clear
  }
}
