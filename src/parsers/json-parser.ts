/**
 * JSON Parser
 *
 * Parses JSON files with special support for:
 * - OpenAPI/Swagger specifications
 * - package.json (npm)
 * - tsconfig.json
 * - Generic JSON with normalized structure
 *
 * Features:
 * - Extracts entities from JSON structure
 * - Normalizes and sorts keys for consistent comparison
 * - Creates relationships between schemas
 *
 * No native modules required.
 */

import { basename } from "node:path";
import { log } from "../logging/index.js";
import type { EntityRelationship, ParsedEntity, ParseResult } from "../types/parser.js";

// =============================================================================
// JSONC PARSING (for tsconfig.json with comments)
// =============================================================================

/** Bun runtime with JSONC support (Bun 1.3.6+) */
interface BunWithJsonc {
  JSONC?: {
    parse(content: string): unknown;
  };
}

/**
 * Parse JSONC (JSON with Comments) - used for tsconfig.json, jsconfig.json
 * Uses Bun.JSONC if available (Bun 1.3.6+), otherwise strips comments manually
 */
function parseJsonc(content: string): unknown {
  // Use Bun.JSONC if available (faster, handles edge cases better)
  const bun = (globalThis as { Bun?: BunWithJsonc }).Bun;
  if (bun?.JSONC?.parse) {
    return bun.JSONC.parse(content);
  }

  // Fallback: strip comments manually for Node.js compatibility
  const stripped = content
    // Remove single-line comments (// ...)
    .replace(/\/\/[^\n\r]*/g, "")
    // Remove multi-line comments (/* ... */)
    .replace(/\/\*[\s\S]*?\*\//g, "")
    // Remove trailing commas before } or ]
    .replace(/,(\s*[}\]])/g, "$1");

  return JSON.parse(stripped);
}

// =============================================================================
// TYPES
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

interface JsonParseResult {
  entities: ParsedEntity[];
  relationships: EntityRelationship[];
  errors: Array<{ message: string; location?: { line: number; column: number } }>;
}

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

/**
 * TypeScript config structure (tsconfig.json, jsconfig.json)
 * Properly typed for noUncheckedIndexedAccess compliance
 */
interface TsConfigJson {
  extends?: string;
  compilerOptions?: {
    paths?: Record<string, string[]>;
    [key: string]: unknown;
  };
  include?: string[];
  exclude?: string[];
  files?: string[];
  references?: Array<{ path: string }>;
}

// =============================================================================
// JSON PARSER CLASS
// =============================================================================

export class JsonParser {
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
    log.i("JSONPARSER", "init_done");
  }

  supportsFile(filePath: string): boolean {
    const lower = filePath.toLowerCase();
    return lower.endsWith(".json");
  }

  async parse(filePath: string, content: string, contentHash: string): Promise<ParseResult> {
    const startTime = Date.now();

    try {
      const fileName = basename(filePath).toLowerCase();

      let result: JsonParseResult;

      if (this.isOpenApiFile(content, fileName)) {
        result = this.parseOpenApi(filePath, content);
      } else if (fileName === "package.json") {
        result = this.parsePackageJson(filePath, content);
      } else if (fileName === "tsconfig.json" || fileName.startsWith("tsconfig.")) {
        result = this.parseTsConfig(filePath, content);
      } else {
        result = this.parseGenericJson(filePath, content);
      }

      const parseTime = Date.now() - startTime;
      this.updateStats(parseTime);

      return {
        filePath,
        contentHash,
        entities: result.entities,
        relationships: result.relationships,
        errors: result.errors,
        parseTimeMs: parseTime,
        language: "json",
        timestamp: Date.now(),
      };
    } catch (error) {
      const parseTime = Date.now() - startTime;
      this.stats.errorCount++;

      return {
        filePath,
        contentHash,
        entities: [],
        relationships: [],
        errors: [{ message: (error as Error).message }],
        parseTimeMs: parseTime,
        language: "json",
        timestamp: Date.now(),
      };
    }
  }

  // ===========================================================================
  // OPENAPI/SWAGGER PARSER
  // ===========================================================================

  private isOpenApiFile(content: string, fileName: string): boolean {
    if (fileName.includes("swagger") || fileName.includes("openapi")) {
      return true;
    }

    try {
      const json = JSON.parse(content);
      return !!(json.swagger || json.openapi || json.paths);
    } catch {
      return false;
    }
  }

  private parseOpenApi(filePath: string, content: string): JsonParseResult {
    const entities: ParsedEntity[] = [];
    const relationships: EntityRelationship[] = [];
    const errors: Array<{ message: string; location?: { line: number; column: number } }> = [];

    try {
      const json = JSON.parse(content);
      const lines = content.split("\n");

      // Extract API info
      const version = json.openapi || json.swagger || "unknown";
      const title = json.info?.title || "API";

      // Extract servers for base URL (OpenAPI 3.x)
      const servers = json.servers as Array<{ url: string; description?: string }> | undefined;
      const baseUrl = servers?.[0]?.url;

      entities.push({
        name: title,
        type: "module",
        filePath,
        location: this.findKeyLocation(lines, "info", 0),
        metadata: {
          apiVersion: version,
          description: json.info?.description,
          swaggerType: "api_spec",
          isApiContract: true,
          swaggerVersion: json.info?.version,
          specVersion: version,
          baseUrl,
          servers: servers?.map((s: { url: string; description?: string }) => ({
            url: s.url,
            description: s.description,
          })),
        },
      });

      // Extract paths (endpoints)
      if (json.paths) {
        const sortedPaths = Object.keys(json.paths).sort();

        for (const path of sortedPaths) {
          const pathObj = json.paths[path];
          const methods = ["get", "post", "put", "patch", "delete", "options", "head"];

          for (const method of methods) {
            if (pathObj[method]) {
              const operation = pathObj[method];
              const operationId = operation.operationId || `${method.toUpperCase()} ${path}`;
              const location = this.findKeyLocation(lines, `"${path}"`, 0);

              const entity: ParsedEntity = {
                name: operationId,
                type: "method",
                filePath,
                location,
                signature: `${method.toUpperCase()} ${path}`,
                metadata: {
                  httpMethod: method.toUpperCase(),
                  path,
                  summary: operation.summary,
                  description: operation.description,
                  tags: operation.tags,
                  deprecated: operation.deprecated,
                  parameters: this.extractParameters(operation.parameters),
                  requestBody: this.extractRequestBody(operation.requestBody),
                  responses: this.extractResponses(operation.responses),
                  swaggerType: "endpoint",
                  isApiContract: true,
                  operationId: operation.operationId,
                },
              };

              entities.push(entity);

              // Create relationships to schemas
              const refs = this.extractSchemaRefs(operation);
              for (const ref of refs) {
                relationships.push({
                  from: `${filePath}:method:${operationId}`,
                  to: `${filePath}:type:${ref}`,
                  type: "references",
                  metadata: { context: "uses schema" },
                });
              }
            }
          }
        }
      }

      // Extract schemas (OpenAPI 3.x)
      if (json.components?.schemas) {
        this.extractSchemas(json.components.schemas, filePath, lines, entities, relationships);
      }

      // Extract definitions (Swagger 2.x)
      if (json.definitions) {
        this.extractSchemas(json.definitions, filePath, lines, entities, relationships);
      }

      // Extract tags as categories
      if (json.tags && Array.isArray(json.tags)) {
        for (const tag of json.tags) {
          entities.push({
            name: tag.name,
            type: "constant",
            filePath,
            location: this.findKeyLocation(lines, `"${tag.name}"`, 0),
            metadata: {
              tagDescription: tag.description,
              externalDocs: tag.externalDocs,
              swaggerType: "tag",
              isApiContract: true,
            },
          });
        }
      }
    } catch (e) {
      errors.push({ message: `OpenAPI parse error: ${(e as Error).message}` });
    }

    return { entities, relationships, errors };
  }

  private extractSchemas(
    schemas: Record<string, JsonValue>,
    filePath: string,
    lines: string[],
    entities: ParsedEntity[],
    relationships: EntityRelationship[],
  ): void {
    const sortedSchemas = Object.keys(schemas).sort();

    for (const name of sortedSchemas) {
      const schema = schemas[name] as Record<string, JsonValue>;
      const location = this.findKeyLocation(lines, `"${name}"`, 0);

      const properties = schema["properties"] as Record<string, JsonValue> | undefined;
      const sortedProps = properties ? Object.keys(properties).sort() : [];

      const entity: ParsedEntity = {
        name,
        type: "type",
        filePath,
        location,
        metadata: {
          schemaType: schema["type"],
          description: schema["description"],
          required: schema["required"],
          properties: sortedProps.map((prop) => {
            const propDef = (properties as Record<string, Record<string, JsonValue>>)[prop];
            return {
              name: prop,
              type: propDef?.["type"] || propDef?.["$ref"],
              description: propDef?.["description"],
              required: Array.isArray(schema["required"]) && schema["required"].includes(prop),
            };
          }),
          enum: schema["enum"],
          swaggerType: "schema",
          isApiContract: true,
        },
      };

      entities.push(entity);

      // Create relationships from $ref
      const refs = this.extractSchemaRefs(schema);
      for (const ref of refs) {
        if (ref !== name) {
          relationships.push({
            from: `${filePath}:type:${name}`,
            to: `${filePath}:type:${ref}`,
            type: "references",
            metadata: { context: "schema reference" },
          });
        }
      }

      // Handle allOf/anyOf/oneOf inheritance
      for (const compositionType of ["allOf", "anyOf", "oneOf"]) {
        const composition = schema[compositionType] as JsonValue[] | undefined;
        if (Array.isArray(composition)) {
          for (const item of composition) {
            if (typeof item === "object" && item !== null && "$ref" in item) {
              const itemRef = (item as Record<string, string>)["$ref"];
              if (typeof itemRef !== "string") continue;
              const refName = this.extractRefName(itemRef);
              if (refName) {
                relationships.push({
                  from: `${filePath}:type:${name}`,
                  to: `${filePath}:type:${refName}`,
                  type: compositionType === "allOf" ? "inherits" : "references",
                  metadata: { compositionType },
                });
              }
            }
          }
        }
      }
    }
  }

  private extractParameters(params: JsonValue[] | undefined): Array<{ name: string; in: string; type: string }> {
    if (!Array.isArray(params)) return [];

    return params
      .filter((p): p is Record<string, JsonValue> => typeof p === "object" && p !== null)
      .map((p) => {
        const schema = p["schema"] as Record<string, JsonValue> | undefined;
        return {
          name: String(p["name"] || ""),
          in: String(p["in"] || ""),
          type: String(p["type"] || schema?.["type"] || ""),
          required: Boolean(p["required"]),
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  private extractRequestBody(body: JsonValue | undefined): { contentType: string; schema: string } | undefined {
    if (!body || typeof body !== "object") return undefined;

    const bodyObj = body as Record<string, JsonValue>;
    const content = bodyObj["content"] as Record<string, JsonValue> | undefined;

    if (content) {
      const contentTypes = Object.keys(content);
      const firstType = contentTypes[0];
      if (firstType) {
        const mediaType = content[firstType] as Record<string, JsonValue>;
        const schema = mediaType?.["schema"] as Record<string, string> | undefined;
        return {
          contentType: firstType,
          schema: schema?.["$ref"] ? this.extractRefName(schema["$ref"]) || "" : String(schema?.["type"] || ""),
        };
      }
    }

    return undefined;
  }

  private extractResponses(
    responses: JsonValue | undefined,
  ): Array<{ code: string; description: string; schema?: string }> {
    if (!responses || typeof responses !== "object") return [];

    const result: Array<{ code: string; description: string; schema?: string }> = [];
    const responsesObj = responses as Record<string, JsonValue>;

    for (const code of Object.keys(responsesObj).sort()) {
      const resp = responsesObj[code] as Record<string, JsonValue>;
      const respContent = resp["content"] as Record<string, Record<string, JsonValue>> | undefined;
      const jsonContent = respContent?.["application/json"];
      const schema =
        (jsonContent?.["schema"] as Record<string, string>) || (resp["schema"] as Record<string, string> | undefined);

      const schemaRef = schema?.["$ref"] ? this.extractRefName(schema["$ref"]) : undefined;
      result.push({
        code,
        description: String(resp["description"] || ""),
        ...(schemaRef != null ? { schema: schemaRef } : {}),
      });
    }

    return result;
  }

  private extractSchemaRefs(obj: JsonValue, refs: Set<string> = new Set()): string[] {
    if (!obj || typeof obj !== "object") return Array.from(refs);

    if (Array.isArray(obj)) {
      for (const item of obj) {
        this.extractSchemaRefs(item, refs);
      }
    } else {
      const record = obj as Record<string, JsonValue>;
      if (record["$ref"] && typeof record["$ref"] === "string") {
        const refName = this.extractRefName(record["$ref"]);
        if (refName) refs.add(refName);
      }

      for (const value of Object.values(record)) {
        this.extractSchemaRefs(value, refs);
      }
    }

    return Array.from(refs);
  }

  private extractRefName(ref: string): string | undefined {
    // #/components/schemas/User -> User
    // #/definitions/User -> User
    const match = ref.match(/\/([^/]+)$/);
    return match?.[1];
  }

  // ===========================================================================
  // PACKAGE.JSON PARSER
  // ===========================================================================

  private parsePackageJson(filePath: string, content: string): JsonParseResult {
    const entities: ParsedEntity[] = [];
    const relationships: EntityRelationship[] = [];
    const errors: Array<{ message: string; location?: { line: number; column: number } }> = [];

    try {
      const json = JSON.parse(content);
      const lines = content.split("\n");

      // Package info
      entities.push({
        name: json.name || "package",
        type: "module",
        filePath,
        location: this.findKeyLocation(lines, "name", 0),
        metadata: {
          version: json.version,
          description: json.description,
          main: json.main,
          types: json.types,
          license: json.license,
        },
      });

      // Dependencies
      const depTypes = ["dependencies", "devDependencies", "peerDependencies", "optionalDependencies"];

      for (const depType of depTypes) {
        if (json[depType]) {
          const sortedDeps = Object.keys(json[depType]).sort();

          for (const dep of sortedDeps) {
            const version = json[depType][dep];

            entities.push({
              name: dep,
              type: "import",
              filePath,
              location: this.findKeyLocation(lines, `"${dep}"`, 0),
              importData: {
                source: dep,
                specifiers: [{ local: dep }],
              },
              metadata: {
                dependencyType: depType,
                version,
              },
            });

            relationships.push({
              from: `${filePath}:module:${json.name || "package"}`,
              to: `external:${dep}`,
              type: "imports",
              metadata: { dependencyType: depType, version },
            });
          }
        }
      }

      // Scripts
      if (json.scripts) {
        const sortedScripts = Object.keys(json.scripts).sort();

        for (const script of sortedScripts) {
          entities.push({
            name: script,
            type: "function",
            filePath,
            location: this.findKeyLocation(lines, `"${script}"`, 0),
            metadata: {
              scriptCommand: json.scripts[script],
            },
          });
        }
      }

      // Exports
      if (json.exports) {
        this.extractExports(json.exports, filePath, lines, entities);
      }
    } catch (e) {
      errors.push({ message: `package.json parse error: ${(e as Error).message}` });
    }

    return { entities, relationships, errors };
  }

  private extractExports(
    exports: JsonValue,
    filePath: string,
    lines: string[],
    entities: ParsedEntity[],
    prefix = "",
  ): void {
    if (typeof exports === "string") {
      entities.push({
        name: prefix || ".",
        type: "export",
        filePath,
        location: this.findKeyLocation(lines, `"${prefix || "."}"`, 0),
        metadata: { exportPath: exports },
      });
    } else if (typeof exports === "object" && exports !== null) {
      const exportsObj = exports as Record<string, JsonValue>;
      const sortedKeys = Object.keys(exportsObj).sort();

      for (const key of sortedKeys) {
        const fullKey = prefix ? `${prefix}/${key}` : key;
        const value = exportsObj[key];
        if (value !== undefined) {
          this.extractExports(value, filePath, lines, entities, fullKey);
        }
      }
    }
  }

  // ===========================================================================
  // TSCONFIG.JSON PARSER
  // ===========================================================================

  private parseTsConfig(filePath: string, content: string): JsonParseResult {
    const entities: ParsedEntity[] = [];
    const relationships: EntityRelationship[] = [];
    const errors: Array<{ message: string; location?: { line: number; column: number } }> = [];

    try {
      // Use JSONC parser - tsconfig.json supports comments and trailing commas
      const json = parseJsonc(content) as TsConfigJson;
      const lines = content.split("\n");

      // Main config entity
      entities.push({
        name: basename(filePath),
        type: "module",
        filePath,
        location: { start: { line: 1, column: 0, index: 0 }, end: { line: 1, column: 1, index: 1 } },
        metadata: {
          extends: json.extends,
          compilerOptions: json.compilerOptions ? this.normalizeObject(json.compilerOptions as JsonValue) : undefined,
        },
      });

      // Extends relationship
      if (json.extends) {
        relationships.push({
          from: `${filePath}:module:${basename(filePath)}`,
          to: `external:${json.extends}`,
          type: "inherits",
          metadata: { context: "extends config" },
        });
      }

      // Path mappings
      const paths = json.compilerOptions?.paths;
      if (paths) {
        const sortedPaths = Object.keys(paths).sort();

        for (const alias of sortedPaths) {
          const targets = paths[alias];
          if (targets) {
            entities.push({
              name: alias,
              type: "type",
              filePath,
              location: this.findKeyLocation(lines, `"${alias}"`, 0),
              metadata: {
                pathAlias: true,
                targets,
              },
            });
          }
        }
      }

      // Include/exclude/files patterns - process each typed array explicitly
      const patternArrays: Array<{ patterns: string[] | undefined; patternType: string }> = [
        { patterns: json.include, patternType: "include" },
        { patterns: json.exclude, patternType: "exclude" },
        { patterns: json.files, patternType: "files" },
      ];

      for (const { patterns, patternType } of patternArrays) {
        if (patterns) {
          for (const pattern of [...patterns].sort()) {
            entities.push({
              name: pattern,
              type: "constant",
              filePath,
              location: this.findKeyLocation(lines, `"${pattern}"`, 0),
              metadata: { patternType },
            });
          }
        }
      }

      // References (project references)
      if (json.references) {
        for (const ref of json.references) {
          entities.push({
            name: ref.path,
            type: "import",
            filePath,
            location: this.findKeyLocation(lines, `"${ref.path}"`, 0),
            importData: {
              source: ref.path,
              specifiers: [{ local: ref.path }],
            },
            metadata: { projectReference: true },
          });

          relationships.push({
            from: `${filePath}:module:${basename(filePath)}`,
            to: `external:${ref.path}`,
            type: "references",
            metadata: { context: "project reference" },
          });
        }
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push({ message: `tsconfig.json parse error: ${message}` });
    }

    return { entities, relationships, errors };
  }

  // ===========================================================================
  // GENERIC JSON PARSER
  // ===========================================================================

  private parseGenericJson(filePath: string, content: string): JsonParseResult {
    const entities: ParsedEntity[] = [];
    const relationships: EntityRelationship[] = [];
    const errors: Array<{ message: string; location?: { line: number; column: number } }> = [];

    try {
      const json = JSON.parse(content);
      const lines = content.split("\n");
      const fileName = basename(filePath);

      // Root entity
      entities.push({
        name: fileName,
        type: "module",
        filePath,
        location: {
          start: { line: 1, column: 0, index: 0 },
          end: { line: lines.length, column: 0, index: content.length },
        },
        metadata: {
          rootType: Array.isArray(json) ? "array" : typeof json,
          normalized: this.normalizeObject(json),
        },
      });

      // Extract top-level keys as entities
      if (typeof json === "object" && json !== null && !Array.isArray(json)) {
        const sortedKeys = Object.keys(json).sort();

        for (const key of sortedKeys) {
          const value = json[key];
          const valueType = Array.isArray(value) ? "array" : typeof value;

          entities.push({
            name: key,
            type: valueType === "object" || valueType === "array" ? "type" : "constant",
            filePath,
            location: this.findKeyLocation(lines, `"${key}"`, 0),
            metadata: {
              valueType,
              arrayLength: Array.isArray(value) ? value.length : undefined,
              normalized: typeof value === "object" ? this.normalizeObject(value) : value,
            },
          });
        }
      }

      // For arrays, extract unique item structures
      if (Array.isArray(json) && json.length > 0) {
        const firstItem = json[0];
        if (typeof firstItem === "object" && firstItem !== null) {
          const sortedKeys = Object.keys(firstItem).sort();

          entities.push({
            name: "ArrayItemSchema",
            type: "type",
            filePath,
            location: { start: { line: 1, column: 0, index: 0 }, end: { line: 1, column: 1, index: 1 } },
            metadata: {
              properties: sortedKeys.map((k) => ({
                name: k,
                type: typeof firstItem[k],
              })),
              itemCount: json.length,
            },
          });
        }
      }
    } catch (e) {
      errors.push({ message: `JSON parse error: ${(e as Error).message}` });
    }

    return { entities, relationships, errors };
  }

  // ===========================================================================
  // UTILITIES
  // ===========================================================================

  /**
   * Normalize and sort JSON object recursively for consistent comparison
   */
  private normalizeObject(obj: JsonValue): JsonValue {
    if (obj === null || typeof obj !== "object") {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.normalizeObject(item));
    }

    const sorted: Record<string, JsonValue> = {};
    const keys = Object.keys(obj).sort();
    const objRecord = obj as Record<string, JsonValue>;

    for (const key of keys) {
      const value = objRecord[key];
      if (value !== undefined) {
        sorted[key] = this.normalizeObject(value);
      }
    }

    return sorted;
  }

  /**
   * Find approximate location of a key in JSON content
   */
  private findKeyLocation(
    lines: string[],
    searchKey: string,
    startLine: number,
  ): { start: { line: number; column: number; index: number }; end: { line: number; column: number; index: number } } {
    let index = 0;

    for (let i = startLine; i < lines.length; i++) {
      const line = lines[i];
      if (!line) continue;

      const col = line.indexOf(searchKey);

      if (col !== -1) {
        return {
          start: { line: i + 1, column: col, index: index + col },
          end: { line: i + 1, column: col + searchKey.length, index: index + col + searchKey.length },
        };
      }

      index += line.length + 1; // +1 for newline
    }

    // Default to start if not found
    return {
      start: { line: 1, column: 0, index: 0 },
      end: { line: 1, column: 1, index: 1 },
    };
  }

  private updateStats(parseTimeMs: number): void {
    this.stats.filesParsed++;
    this.stats.totalParseTimeMs += parseTimeMs;
    this.stats.avgParseTimeMs = this.stats.totalParseTimeMs / this.stats.filesParsed;
    this.stats.throughput = this.stats.filesParsed / (this.stats.totalParseTimeMs / 1000);
  }

  getStats(): ParserStats {
    return { ...this.stats };
  }

  resetStats(): void {
    this.stats = {
      filesParsed: 0,
      cacheHits: 0,
      cacheMisses: 0,
      avgParseTimeMs: 0,
      totalParseTimeMs: 0,
      throughput: 0,
      cacheMemoryMB: 0,
      errorCount: 0,
    };
  }
}
