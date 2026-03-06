/**
 * Kotlin Native Parser
 *
 * Uses Kotlin K2 Analysis API (via kotlin-k2-cli) for fast parsing when JVM is available.
 * Falls back to ANTLR-based parsing when JVM is not found.
 * Regex fallback as final option.
 *
 * Performance comparison:
 * - K2 API (kotlin-k2-cli): ~30-50ms/file (after warmup, 5-8s startup vs 20-35s KLS)
 * - ANTLR: ~150ms/file
 * - Regex: ~5-10ms/file (less accurate)
 *
 * Advantages of K2 over KLS:
 * - Faster startup (5-8s vs 20-35s)
 * - Direct API access (no LSP JSON-RPC overhead)
 * - Call graph extraction
 * - Better type resolution
 *
 * Requirements for K2 mode:
 * - JDK 11+ installed
 * - kotlin-k2-cli fat JAR (built from kotlin-k2-cli/ project)
 *
 * When kotlinc is available, provides additional syntax validation and diagnostics.
 */

import { workerLog } from "../agents/workers/worker-logging.js";
import { log } from "../logging/index.js";
import type { EntityRelationship, ParsedEntity, ParseResult, SupportedLanguage } from "../types/parser.js";
import { detectCompatibleJvmForKls, type JvmInfo } from "../utils/jvm-detection.js";
import {
  enhanceWithKotlinDiagnostics,
  findKotlinc,
  getKotlinVersion,
  isKotlincAvailable,
  isKotlinScript,
} from "./kotlin-compiler-integration.js";
import {
  getKotlinK2Provider,
  K2JavaVersionError,
  type KotlinK2Provider,
  stopKotlinK2Provider,
} from "./kotlin-k2-provider.js";

// Lazy-loaded ANTLR parser (loaded on first use to reduce initial bundle size)
type KotlinAntlrParserType = typeof import("./kotlin-antlr-parser.js").KotlinAntlrParser;
let KotlinAntlrParserClass: KotlinAntlrParserType | null = null;

async function getKotlinAntlrParser(): Promise<KotlinAntlrParserType> {
  if (!KotlinAntlrParserClass) {
    const module = await import("./kotlin-antlr-parser.js");
    KotlinAntlrParserClass = module.KotlinAntlrParser;
  }
  return KotlinAntlrParserClass;
}

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

// =============================================================================
// KOTLIN PARSER CLASS
// =============================================================================

export class KotlinNativeParser {
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

  private kotlincEnabled = true; // Try to use kotlinc by default
  private useKotlincDiagnostics = true; // Enhance with kotlinc diagnostics

  // K2 API integration (replaces LSP)
  private useK2 = true; // Use kotlin-k2-cli when JVM available
  private k2Provider: KotlinK2Provider | null = null;
  private jvmInfo: JvmInfo | null = null;
  private useAntlrFallback = true; // Fall back to ANTLR on K2 failure

  /**
   * Initialize the parser
   */
  async initialize(): Promise<void> {
    log.d("KOTLINPARSER", "init_start");
    workerLog("INFO", "KOTLINPARSER init_start", {
      useK2: this.useK2,
      envAntlr: process.env["ULTRACODE_KOTLIN_ANTLR"],
    });

    // Try to detect JVM for K2 mode
    if (this.useK2 && !process.env["ULTRACODE_KOTLIN_ANTLR"]) {
      try {
        workerLog("INFO", "KOTLINPARSER detecting compatible JVM for K2...");
        // Uses cached JVM path if available, otherwise scans and caches result
        const jvmInfo = await detectCompatibleJvmForKls();

        if (jvmInfo) {
          this.jvmInfo = jvmInfo;
          log.i("KOTLINPARSER", "jvm_found", { ver: jvmInfo.version, vendor: jvmInfo.vendor });
          workerLog("INFO", "KOTLINPARSER jvm_found", {
            ver: jvmInfo.version,
            vendor: jvmInfo.vendor,
            path: jvmInfo.javaPath,
          });

          // Try to start K2 CLI with the compatible Java
          const k2Result = await this.tryStartK2(jvmInfo);
          if (!k2Result.success) {
            workerLog("WARN", "KOTLINPARSER K2 start failed", { ver: jvmInfo.version });
          }
        } else {
          log.i("KOTLINPARSER", "no_compatible_jvm");
          workerLog("INFO", "KOTLINPARSER no_compatible_jvm", { need: "11+" });
        }
      } catch (jvmError) {
        log.w("KOTLINPARSER", "jvm_detect_fail", { err: String(jvmError) });
        workerLog("ERROR", "KOTLINPARSER jvm_detect_fail", { err: String(jvmError) });
      }
    } else {
      workerLog("INFO", "KOTLINPARSER skipping JVM detection", {
        useK2: this.useK2,
        envAntlr: !!process.env["ULTRACODE_KOTLIN_ANTLR"],
      });
    }

    // Try to find kotlinc for diagnostics
    if (this.kotlincEnabled) {
      const kotlinc = await findKotlinc();
      if (kotlinc) {
        const version = getKotlinVersion();
        log.i("KOTLINPARSER", "init_done", {
          k2: !!this.k2Provider,
          kotlinc: true,
          ver: version || "unknown",
        });
        workerLog("INFO", "KOTLINPARSER init_done", {
          k2: !!this.k2Provider,
          kotlinc: true,
          ver: version || "unknown",
        });
        return;
      }
    }

    log.i("KOTLINPARSER", "init_done", { k2: !!this.k2Provider, kotlinc: false });
    workerLog("INFO", "KOTLINPARSER init_done", { k2: !!this.k2Provider, kotlinc: false });
  }

  /**
   * Enable or disable kotlinc integration
   */
  setKotlincEnabled(enabled: boolean): void {
    this.kotlincEnabled = enabled;
  }

  /**
   * Enable or disable kotlinc diagnostics enhancement
   */
  setKotlincDiagnosticsEnabled(enabled: boolean): void {
    this.useKotlincDiagnostics = enabled;
  }

  /**
   * Enable or disable K2 mode
   */
  setK2Enabled(enabled: boolean): void {
    this.useK2 = enabled;
  }

  /**
   * @deprecated Use setK2Enabled instead
   */
  setLspEnabled(enabled: boolean): void {
    this.useK2 = enabled;
  }

  /**
   * Enable or disable ANTLR fallback
   */
  setAntlrFallbackEnabled(enabled: boolean): void {
    this.useAntlrFallback = enabled;
  }

  /**
   * Check if K2 is available and ready
   */
  isK2Ready(): boolean {
    return this.k2Provider?.isReady() ?? false;
  }

  /**
   * @deprecated Use isK2Ready instead
   */
  isLspReady(): boolean {
    return this.isK2Ready();
  }

  /**
   * Get JVM info if available
   */
  getJvmInfo(): JvmInfo | null {
    return this.jvmInfo;
  }

  /**
   * Shutdown K2 provider
   */
  async shutdown(): Promise<void> {
    if (this.k2Provider) {
      await stopKotlinK2Provider();
      this.k2Provider = null;
    }
  }

  /**
   * Try to start K2 CLI with a specific JVM.
   * Returns success status and whether it was a version compatibility error.
   */
  private async tryStartK2(jvmInfo: JvmInfo): Promise<{ success: boolean; versionError: boolean }> {
    try {
      // Clear any previous instance to allow trying with different Java
      await stopKotlinK2Provider();

      workerLog("INFO", "KOTLINPARSER starting K2 provider...", { javaVer: jvmInfo.version });
      this.k2Provider = await getKotlinK2Provider(jvmInfo.javaPath);
      log.i("KOTLINPARSER", "k2_ready", { javaVer: jvmInfo.version });
      workerLog("INFO", "KOTLINPARSER k2_ready", { javaVer: jvmInfo.version });
      return { success: true, versionError: false };
    } catch (k2Error) {
      log.w("KOTLINPARSER", "k2_start_fail", { err: String(k2Error), javaVer: jvmInfo.version });
      workerLog("WARN", "KOTLINPARSER k2_start_fail", { err: String(k2Error), javaVer: jvmInfo.version });
      this.k2Provider = null;

      // Check if this was a Java version compatibility error
      if (k2Error instanceof K2JavaVersionError) {
        workerLog("INFO", "KOTLINPARSER K2 version error detected", { ver: k2Error.javaVersion });
        return { success: false, versionError: true };
      }

      return { success: false, versionError: false };
    }
  }

  /**
   * Check if this parser supports the given file
   */
  supportsFile(filePath: string): boolean {
    const lower = filePath.toLowerCase();
    return lower.endsWith(".kt") || lower.endsWith(".kts");
  }

  /**
   * Check if file is a Kotlin script
   */
  isKotlinScript(filePath: string): boolean {
    return isKotlinScript(filePath);
  }

  /**
   * Parse a Kotlin file using K2 API (with ANTLR/regex fallback)
   */
  async parse(filePath: string, content: string, contentHash: string): Promise<ParseResult> {
    const startTime = Date.now();
    log.d("KOTLINPARSER", "parse_start", { file: filePath, size: content.length });

    try {
      let entities: ParsedEntity[];
      let relationships: EntityRelationship[] | undefined;

      // Try K2 first (fastest when available, replaces LSP)
      if (this.k2Provider?.isReady()) {
        try {
          log.d("KOTLINPARSER", "try_k2");
          const k2Result = await this.k2Provider.parse(filePath, content);
          // Add language field to all entities (K2 CLI doesn't provide it)
          entities = this.addLanguageToEntities(k2Result.entities);

          // Merge relationships from K2: general relationships + call graph
          const allRelationships: EntityRelationship[] = [...k2Result.relationships];

          // Convert callGraph to "calls" relationships for tracing support
          for (const call of k2Result.callGraph) {
            if (call.from && call.to) {
              allRelationships.push({
                from: call.from,
                to: call.to,
                type: "calls",
                metadata: { line: call.line },
              });
            }
          }

          relationships = allRelationships.length > 0 ? allRelationships : undefined;

          // K2 provides package/import entities, no need to add them manually

          // Log parse results with call graph sample
          const callsSample = k2Result.callGraph.slice(0, 3).map((c) => `${c.from}->${c.to}`);
          log.i("KOTLINPARSER", "k2_ok", {
            ent: entities.length,
            rel: relationships?.length || 0,
            calls: k2Result.callGraph.length,
            sample: callsSample.length > 0 ? callsSample : undefined,
          });
        } catch (k2Error) {
          log.w("KOTLINPARSER", "k2_fail", { err: String(k2Error) });

          // Fallback to ANTLR
          if (this.useAntlrFallback) {
            const fallbackResult = await this.parseWithAntlr(filePath, content);
            entities = fallbackResult.entities;
            relationships = fallbackResult.relationships;
          } else {
            entities = this.parseKotlinRegex(filePath, content);
            log.d("KOTLINPARSER", "regex_fallback_ok", { cnt: entities.length });
          }
        }
      } else if (this.useAntlrFallback) {
        // No K2, use ANTLR
        const antlrResult = await this.parseWithAntlr(filePath, content);
        entities = antlrResult.entities;
        relationships = antlrResult.relationships;
      } else {
        // Regex-only mode
        entities = this.parseKotlinRegex(filePath, content);
      }

      // Enhance with kotlinc diagnostics if available
      if (this.useKotlincDiagnostics && isKotlincAvailable() && entities.length > 0) {
        try {
          enhanceWithKotlinDiagnostics(entities, filePath, content);
        } catch (kotlincError) {
          log.d("KOTLINPARSER", "kotlinc_fail", { err: String(kotlincError) });
        }
      }

      const parseTimeMs = Date.now() - startTime;

      // Update stats
      this.stats.filesParsed++;
      this.stats.totalParseTimeMs += parseTimeMs;
      this.stats.avgParseTimeMs = this.stats.totalParseTimeMs / this.stats.filesParsed;

      return {
        filePath,
        language: "kotlin" as SupportedLanguage,
        entities,
        relationships,
        contentHash,
        timestamp: Date.now(),
        parseTimeMs,
      };
    } catch (error) {
      this.stats.errorCount++;
      const parseTimeMs = Date.now() - startTime;

      return {
        filePath,
        language: "kotlin" as SupportedLanguage,
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
   * Parse with ANTLR (internal helper)
   */
  private async parseWithAntlr(
    filePath: string,
    content: string,
  ): Promise<{ entities: ParsedEntity[]; relationships: EntityRelationship[] | undefined }> {
    try {
      log.d("KOTLINPARSER", "try_antlr");
      const KotlinAntlrParser = await getKotlinAntlrParser();
      const antlrResult = KotlinAntlrParser.parse(filePath, content);
      log.d("KOTLINPARSER", "antlr_ok", {
        ent: antlrResult.entities.length,
        rel: antlrResult.relationships.length,
      });
      return {
        // Add language field to all entities (ANTLR doesn't provide it)
        entities: this.addLanguageToEntities(antlrResult.entities),
        relationships: antlrResult.relationships.length > 0 ? antlrResult.relationships : undefined,
      };
    } catch (antlrError) {
      log.w("KOTLINPARSER", "antlr_fail", { err: String(antlrError) });
      const entities = this.parseKotlinRegex(filePath, content);
      log.d("KOTLINPARSER", "regex_ok", { cnt: entities.length });
      return { entities, relationships: undefined };
    }
  }

  /**
   * Add language: "kotlin" to all entities recursively (including children)
   */
  private addLanguageToEntities(entities: ParsedEntity[]): ParsedEntity[] {
    const addLang = (e: ParsedEntity): ParsedEntity => ({
      ...e,
      language: "kotlin",
      children: e.children ? e.children.map(addLang) : undefined,
    });
    return entities.map(addLang);
  }

  /**
   * Parse Kotlin code using regex patterns (fallback when ANTLR fails)
   */
  private parseKotlinRegex(filePath: string, content: string): ParsedEntity[] {
    const entities: ParsedEntity[] = [];

    // Package declaration
    const packageMatch = /^\s*package\s+([\w.]+)/m.exec(content);
    if (packageMatch?.[1]) {
      entities.push({
        name: packageMatch[1],
        type: "module",
        language: "kotlin",
        filePath,
        location: this.getLocationFromIndex(content, packageMatch.index),
      });
    }

    // Imports
    const importRe = /^\s*import\s+([\w.]+)(?:\s+as\s+(\w+))?/gm;
    let match: RegExpExecArray | null;
    while ((match = importRe.exec(content))) {
      const source = match[1];
      if (!source) continue;
      const alias = match[2];

      entities.push({
        name: source,
        type: "import",
        language: "kotlin",
        filePath,
        location: this.getLocationFromIndex(content, match.index),
        importData: {
          source,
          specifiers: [
            {
              local: alias || source.split(".").pop() || source,
              ...(alias && { alias: alias }),
            },
          ],
        },
      });
    }

    // Class/Interface/Object/Enum/Data class/Sealed class declarations
    const typeRe =
      /(?:^|\s)((?:public|private|protected|internal|abstract|final|open|sealed|data|inner|inline|value|enum|annotation|external|actual|expect)\s+)*(class|interface|object|typealias)\s+(\w+)(?:\s*<[^>]+>)?(?:\s*(?:constructor\s*)?\([^)]*\))?(?:\s*:\s*([^{]+))?/gm;

    while ((match = typeRe.exec(content))) {
      const modifiers = (match[1] || "").trim().split(/\s+/).filter(Boolean);
      const kind = match[2];
      const name = match[3];
      if (!kind || !name) continue;
      const inheritance = match[4];

      let entityType: ParsedEntity["type"] = "class";
      if (kind === "interface") entityType = "interface";
      if (kind === "object") entityType = "class"; // Kotlin object is a singleton class
      if (modifiers.includes("enum")) entityType = "enum";
      if (modifiers.includes("data")) modifiers.push("dataclass");

      const baseClasses: string[] = [];
      const interfaces: string[] = [];

      if (inheritance) {
        // Parse inheritance: BaseClass(), Interface1, Interface2
        const parts = inheritance.split(",").map((s) => s.trim());
        for (const part of parts) {
          const typeName = part
            .replace(/\([^)]*\)/, "")
            .replace(/<[^>]+>/, "")
            .trim();
          if (typeName) {
            if (part.includes("(")) {
              baseClasses.push(typeName);
            } else {
              interfaces.push(typeName);
            }
          }
        }
      }

      const entity: ParsedEntity = {
        name,
        type: entityType,
        language: "kotlin",
        filePath,
        location: this.getLocationFromIndex(content, match.index),
        ...(modifiers.length > 0 && { modifiers: modifiers }),
        inheritance:
          baseClasses.length > 0 || interfaces.length > 0
            ? {
                baseClasses,
                ...(interfaces.length > 0 && { interfaces: interfaces }),
                isAbstract: modifiers.includes("abstract"),
              }
            : undefined,
        children: [],
      };

      entities.push(entity);
    }

    // Functions (fun keyword)
    const funRe =
      /(?:^|\s)((?:public|private|protected|internal|inline|infix|operator|suspend|tailrec|external|actual|expect|override|open|final|abstract)\s+)*fun\s+(?:<[^>]+>\s+)?(?:(\w+)\s*\.\s*)?(\w+)\s*(?:<[^>]+>)?\s*\(([^)]*)\)(?:\s*:\s*([^{=]+))?/gm;

    while ((match = funRe.exec(content))) {
      const modifiers = (match[1] || "").trim().split(/\s+/).filter(Boolean);
      const receiver = match[2]; // Extension function receiver
      const name = match[3];
      if (!name) continue;
      const paramsStr = match[4] || "";
      const returnType = match[5]?.trim();

      const isSuspend = modifiers.includes("suspend");

      entities.push({
        name: receiver ? `${receiver}.${name}` : name,
        type: isSuspend ? "async_function" : "function",
        language: "kotlin",
        filePath,
        location: this.getLocationFromIndex(content, match.index),
        ...(modifiers.length > 0 && { modifiers: modifiers }),
        ...(returnType && { returnType: returnType }),
        parameters: this.parseParameters(paramsStr),
      });
    }

    // Properties (val/var)
    const propRe =
      /(?:^|\s)((?:public|private|protected|internal|const|lateinit|override|open|final|abstract|actual|expect)\s+)*(val|var)\s+(?:(\w+)\s*\.\s*)?(\w+)(?:\s*:\s*([^{=\n]+))?/gm;

    while ((match = propRe.exec(content))) {
      const modifiers = (match[1] || "").trim().split(/\s+/).filter(Boolean);
      const kind = match[2]; // val or var
      const receiver = match[3];
      const name = match[4];
      if (!kind || !name) continue;
      const type = match[5]?.trim();

      const isConst = kind === "val" || modifiers.includes("const");

      entities.push({
        name: receiver ? `${receiver}.${name}` : name,
        type: isConst ? "constant" : "property",
        language: "kotlin",
        filePath,
        location: this.getLocationFromIndex(content, match.index),
        modifiers: [...modifiers, kind].filter(Boolean),
        metadata: type ? { propertyType: type } : undefined,
      });
    }

    // Type aliases
    const typealiasRe = /(?:^|\s)typealias\s+(\w+)(?:\s*<[^>]+>)?\s*=\s*([^\n]+)/gm;
    while ((match = typealiasRe.exec(content))) {
      const aliasName = match[1];
      const aliasedType = match[2];
      if (!aliasName || !aliasedType) continue;
      entities.push({
        name: aliasName,
        type: "type",
        language: "kotlin",
        filePath,
        location: this.getLocationFromIndex(content, match.index),
        metadata: { aliasedType: aliasedType.trim() },
      });
    }

    // Phase 1: Extract KDoc for top-level declarations
    for (const entity of entities) {
      if (entity.type !== "import" && entity.type !== "module") {
        const doc = this.extractKDoc(content, entity.location.start.index);
        if (doc) {
          entity.documentation = doc;
        }
      }
    }

    // Phase 1: Parse class/interface bodies for members
    this.parseClassBodies(content, filePath, entities);

    return entities;
  }

  // =============================================================================
  // KDOC EXTRACTION (Kotlin Phase 1)
  // =============================================================================

  /**
   * Extract KDoc comment before a declaration
   * KDoc format: starts with slash-star-star and ends with star-slash
   */
  private extractKDoc(content: string, declarationIndex: number): ParsedEntity["documentation"] | undefined {
    // Look backwards from declaration to find /** ... */
    const before = content.slice(0, declarationIndex);

    // Find last occurrence of */
    const endIndex = before.lastIndexOf("*/");
    if (endIndex === -1) return undefined;

    // Find matching /**
    const searchStart = Math.max(0, endIndex - 5000); // Limit search range
    const startIndex = before.lastIndexOf("/**", endIndex);
    if (startIndex === -1 || startIndex < searchStart) return undefined;

    // Check there's only whitespace between comment end and declaration
    const between = before.slice(endIndex + 2).trim();
    // Allow annotations between KDoc and declaration
    if (between && !/^(?:@\w+(?:\([^)]*\))?\s*)*$/.test(between)) {
      return undefined;
    }

    const kdocContent = before.slice(startIndex + 3, endIndex);
    return this.parseKDoc(kdocContent);
  }

  /**
   * Parse KDoc content into structured documentation
   */
  private parseKDoc(kdocContent: string): ParsedEntity["documentation"] {
    const lines = kdocContent.split("\n").map(
      (line) => line.replace(/^\s*\*\s?/, "").trim(), // Remove leading * from each line
    );

    const params: Array<{
      name: string;
      type?: string | undefined;
      description?: string | undefined;
      optional?: boolean;
    }> = [];
    const throws: Array<{ type?: string | undefined; description?: string | undefined }> = [];
    // biome-ignore lint/style/useConst: reassigned later in the function
    let description: string | undefined;
    let returns: { type?: string | undefined; description?: string | undefined } | undefined;
    let since: string | undefined;
    let author: string | undefined;
    let deprecated: string | boolean | undefined;
    const see: string[] = [];

    const descriptionLines: string[] = [];
    let inDescription = true;

    for (const line of lines) {
      if (!line) continue;

      // @param name description
      const paramMatch = line.match(/^@param\s+(\w+)\s*(.*)/);
      if (paramMatch) {
        inDescription = false;
        params.push({
          name: paramMatch[1]!,
          description: paramMatch[2] || undefined,
        });
        continue;
      }

      // @return/@returns description
      const returnMatch = line.match(/^@returns?\s+(.*)/);
      if (returnMatch) {
        inDescription = false;
        returns = { ...(returnMatch[1] != null ? { description: returnMatch[1] } : {}) };
        continue;
      }

      // @throws/@exception Type description
      const throwsMatch = line.match(/^@(?:throws|exception)\s+(\w+)?\s*(.*)/);
      if (throwsMatch) {
        inDescription = false;
        throws.push({
          ...(throwsMatch[1] != null ? { type: throwsMatch[1] } : {}),
          ...(throwsMatch[2] ? { description: throwsMatch[2] } : {}),
        });
        continue;
      }

      // @since version
      const sinceMatch = line.match(/^@since\s+(.*)/);
      if (sinceMatch) {
        inDescription = false;
        since = sinceMatch[1];
        continue;
      }

      // @author name
      const authorMatch = line.match(/^@author\s+(.*)/);
      if (authorMatch) {
        inDescription = false;
        author = authorMatch[1];
        continue;
      }

      // @deprecated description
      const deprecatedMatch = line.match(/^@deprecated\s*(.*)/);
      if (deprecatedMatch) {
        inDescription = false;
        deprecated = deprecatedMatch[1] || true;
        continue;
      }

      // @see reference
      const seeMatch = line.match(/^@see\s+(.*)/);
      if (seeMatch) {
        inDescription = false;
        see.push(seeMatch[1]!);
        continue;
      }

      // @property/@receiver/@suppress - skip
      if (/^@(?:property|receiver|suppress|sample|constructor)/.test(line)) {
        inDescription = false;
        continue;
      }

      // Other @ tags - treat as end of description
      if (line.startsWith("@")) {
        inDescription = false;
        continue;
      }

      // Regular line - add to description if we haven't seen tags yet
      if (inDescription) {
        descriptionLines.push(line);
      }
    }

    description = descriptionLines.join(" ").trim() || undefined;

    if (!description && params.length === 0 && !returns && throws.length === 0) {
      return undefined;
    }

    return {
      description,
      ...(params.length > 0 && { params: params }),
      returns,
      ...(throws.length > 0 && { throws: throws }),
      deprecated,
      ...(see.length > 0 && { see: see }),
      since,
      author,
    };
  }

  // =============================================================================
  // CLASS BODY PARSING (Kotlin Phase 1)
  // =============================================================================

  /**
   * Parse methods and properties inside class/interface bodies
   */
  private parseClassBodies(content: string, filePath: string, entities: ParsedEntity[]): void {
    // Find class/interface/object entities and parse their bodies
    const classEntities = entities.filter((e) => e.type === "class" || e.type === "interface" || e.type === "enum");

    for (const classEntity of classEntities) {
      const bodyStart = this.findClassBodyStart(content, classEntity.location.start.index);
      if (bodyStart === -1) continue;

      const bodyEnd = this.findMatchingBrace(content, bodyStart);
      if (bodyEnd === -1) continue;

      const bodyContent = content.slice(bodyStart + 1, bodyEnd);
      const members = this.parseClassMembers(bodyContent, filePath, classEntity.name, bodyStart + 1);

      if (members.length > 0) {
        classEntity.children = members;
      }
    }
  }

  /**
   * Find the opening brace of a class body
   */
  private findClassBodyStart(content: string, fromIndex: number): number {
    let i = fromIndex;
    let parenDepth = 0;
    let angleDepth = 0;

    while (i < content.length) {
      const char = content[i];

      if (char === "(") parenDepth++;
      else if (char === ")") parenDepth--;
      else if (char === "<") angleDepth++;
      else if (char === ">") angleDepth--;
      else if (char === "{" && parenDepth === 0 && angleDepth === 0) {
        return i;
      } else if (char === "\n" && parenDepth === 0 && angleDepth === 0) {
        // Check if line continues or ends (no body for abstract/interface without body)
        const rest = content.slice(i).trimStart();
        if (!rest.startsWith("{")) {
          return -1; // No body
        }
      }

      i++;
    }

    return -1;
  }

  /**
   * Find the matching closing brace
   */
  private findMatchingBrace(content: string, openIndex: number): number {
    let depth = 1;
    let i = openIndex + 1;
    let inString = false;
    let stringChar = "";

    while (i < content.length && depth > 0) {
      const char = content[i];
      const prevChar = content[i - 1];

      // Handle strings
      if ((char === '"' || char === "'") && prevChar !== "\\") {
        if (!inString) {
          inString = true;
          stringChar = char;
        } else if (char === stringChar) {
          inString = false;
        }
      }

      if (!inString) {
        if (char === "{") depth++;
        else if (char === "}") depth--;
      }

      i++;
    }

    return depth === 0 ? i - 1 : -1;
  }

  /**
   * Parse members inside a class body
   */
  private parseClassMembers(
    bodyContent: string,
    filePath: string,
    _className: string,
    baseOffset: number,
  ): ParsedEntity[] {
    const members: ParsedEntity[] = [];

    // Methods (fun keyword)
    const funRe =
      /(?:^|\s)((?:public|private|protected|internal|inline|infix|operator|suspend|tailrec|external|actual|expect|override|open|final|abstract)\s+)*fun\s+(?:<[^>]+>\s+)?(?:(\w+)\s*\.\s*)?(\w+)\s*(?:<[^>]+>)?\s*\(([^)]*)\)(?:\s*:\s*([^{=]+))?/gm;

    let match: RegExpExecArray | null;
    while ((match = funRe.exec(bodyContent))) {
      const modifiers = (match[1] || "").trim().split(/\s+/).filter(Boolean);
      const receiver = match[2];
      const name = match[3];
      if (!name) continue;
      const paramsStr = match[4] || "";
      const returnType = match[5]?.trim();

      const isSuspend = modifiers.includes("suspend");

      // Extract calls from method body
      const methodBodyStart = this.findMethodBodyStart(bodyContent, match.index + match[0].length);
      let calls: ParsedEntity["calls"];
      if (methodBodyStart !== -1) {
        const methodBodyEnd = this.findMatchingBrace(bodyContent, methodBodyStart);
        if (methodBodyEnd !== -1) {
          const methodBody = bodyContent.slice(methodBodyStart + 1, methodBodyEnd);
          calls = this.extractCalls(methodBody);
        }
      }

      const member: ParsedEntity = {
        name: receiver ? `${receiver}.${name}` : name,
        type: isSuspend ? "async_function" : "method",
        language: "kotlin",
        filePath,
        location: this.getLocationFromIndex(bodyContent, match.index, baseOffset),
        ...(modifiers.length > 0 && { modifiers: modifiers }),
        ...(returnType && { returnType: returnType }),
        parameters: this.parseParameters(paramsStr),
        calls,
      };

      // Extract KDoc for method
      const doc = this.extractKDoc(bodyContent, match.index);
      if (doc) {
        member.documentation = doc;
      }

      members.push(member);
    }

    // Properties (val/var)
    const propRe =
      /(?:^|\s)((?:public|private|protected|internal|const|lateinit|override|open|final|abstract|actual|expect)\s+)*(val|var)\s+(\w+)(?:\s*:\s*([^{=\n]+))?/gm;

    while ((match = propRe.exec(bodyContent))) {
      const modifiers = (match[1] || "").trim().split(/\s+/).filter(Boolean);
      const kind = match[2];
      const name = match[3];
      if (!kind || !name) continue;
      const type = match[4]?.trim();

      const isConst = kind === "val" || modifiers.includes("const");

      const member: ParsedEntity = {
        name,
        type: isConst ? "constant" : "property",
        language: "kotlin",
        filePath,
        location: this.getLocationFromIndex(bodyContent, match.index, baseOffset),
        modifiers: [...modifiers, kind].filter(Boolean),
        metadata: type ? { propertyType: type } : undefined,
      };

      // Extract KDoc for property
      const doc = this.extractKDoc(bodyContent, match.index);
      if (doc) {
        member.documentation = doc;
      }

      members.push(member);
    }

    return members;
  }

  /**
   * Find the start of a method body (opening brace or = for expression body)
   */
  private findMethodBodyStart(content: string, fromIndex: number): number {
    let i = fromIndex;
    let parenDepth = 0;

    while (i < content.length) {
      const char = content[i];

      if (char === "(") parenDepth++;
      else if (char === ")") parenDepth--;
      else if (char === "{" && parenDepth === 0) {
        return i;
      } else if (char === "=" && parenDepth === 0) {
        // Expression body - no braces
        return -1;
      } else if (char === "\n" && parenDepth === 0) {
        // Check if next line has body
        const rest = content.slice(i).trimStart();
        if (rest.startsWith("{")) {
          return content.indexOf("{", i);
        }
        // Abstract method or expression body
        return -1;
      }

      i++;
    }

    return -1;
  }

  // =============================================================================
  // CALL GRAPH EXTRACTION (Kotlin Phase 1)
  // =============================================================================

  /**
   * Extract function calls from method body (simple regex-based)
   */
  private extractCalls(bodyContent: string): ParsedEntity["calls"] {
    const calls: NonNullable<ParsedEntity["calls"]> = [];

    // Keywords to exclude
    const kotlinKeywords = new Set([
      "if",
      "else",
      "when",
      "for",
      "while",
      "do",
      "try",
      "catch",
      "finally",
      "throw",
      "return",
      "break",
      "continue",
      "class",
      "interface",
      "object",
      "fun",
      "val",
      "var",
      "is",
      "in",
      "as",
      "true",
      "false",
      "null",
      "this",
      "super",
      "it",
      "constructor",
      "init",
      "get",
      "set",
      "by",
      "where",
      "import",
      "package",
      "typeof",
      "suspend",
      "inline",
    ]);

    // Pattern: identifier( or identifier.identifier(
    // Captures: target (optional), name
    const callRe = /(?:(\w+(?:\.\w+)*)\s*\.\s*)?(\w+)\s*(?:<[^>]+>)?\s*\(/g;

    let match: RegExpExecArray | null;
    while ((match = callRe.exec(bodyContent))) {
      const target = match[1];
      const name = match[2];

      if (!name || kotlinKeywords.has(name)) continue;

      // Skip if it looks like a type (PascalCase without target and followed by typical constructor patterns)
      if (!target && /^[A-Z]/.test(name)) {
        // Could be constructor call - still include it
      }

      calls.push({
        name,
        target,
        location: {
          start: { line: 0, column: 0, index: match.index },
          end: { line: 0, column: 0, index: match.index + match[0].length },
        },
        argumentCount: 0, // Unknown from regex
      });
    }

    return calls.length > 0 ? calls : undefined;
  }

  /**
   * Parse function parameters
   */
  private parseParameters(paramsStr: string): ParsedEntity["parameters"] {
    if (!paramsStr.trim()) return [];

    const params: ParsedEntity["parameters"] = [];
    // Simple split by comma (doesn't handle lambdas with commas inside)
    let depth = 0;
    let current = "";
    const parts: string[] = [];

    for (const char of paramsStr) {
      if (char === "(" || char === "<" || char === "[") depth++;
      else if (char === ")" || char === ">" || char === "]") depth--;
      else if (char === "," && depth === 0) {
        parts.push(current.trim());
        current = "";
        continue;
      }
      current += char;
    }
    if (current.trim()) parts.push(current.trim());

    for (const part of parts) {
      if (!part) continue;

      // Pattern: [vararg] name: Type [= default]
      const paramMatch = /(?:vararg\s+)?(\w+)\s*:\s*([^=]+)(?:\s*=\s*(.+))?/.exec(part);
      if (paramMatch?.[1] && paramMatch[2]) {
        params.push({
          name: paramMatch[1],
          type: paramMatch[2].trim(),
          optional: !!paramMatch[3],
          defaultValue: paramMatch[3]?.trim(),
        });
      }
    }

    return params;
  }

  /**
   * Get location from character index
   * @param content - The content to search in
   * @param index - Character index in content
   * @param baseOffset - Base offset to add to the index (for parsing class bodies)
   */
  private getLocationFromIndex(content: string, index: number, baseOffset: number = 0): ParsedEntity["location"] {
    let line = 1;
    let column = 0;
    for (let i = 0; i < index; i++) {
      if (content[i] === "\n") {
        line++;
        column = 0;
      } else {
        column++;
      }
    }

    const actualIndex = index + baseOffset;
    return {
      start: { line, column, index: actualIndex },
      end: { line, column: column + 1, index: actualIndex + 1 },
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
    // No internal cache
  }
}
