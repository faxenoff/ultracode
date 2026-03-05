/**
 * C# Native Parser — uses Ultrasharp.Addon (Roslyn) for parsing C# files.
 * Falls back to tree-sitter if addon is not available.
 *
 * Implements the same ParsedEntity interface as other language parsers.
 */

import { log } from "../logging/index.js";
import type { RoslynAddonClient } from "./roslyn-client.js";

// ============================================================================
// Types (compatible with src/types/parser.ts)
// ============================================================================

export interface CSharpParseResult {
  entities: CSharpParsedEntity[];
}

export interface CSharpParsedEntity {
  id: string;
  name: string;
  type: string;
  filePath: string;
  startLine: number;
  endLine: number;
  content: string;
  language: string;
  parentId?: string;
  metadata?: CSharpEntityMetadata;
  children?: CSharpParsedEntity[];
}

export interface CSharpEntityMetadata {
  namespace?: string;
  fqn?: string;
  accessibility?: string;
  isStatic?: boolean;
  isAsync?: boolean;
  isAbstract?: boolean;
  isReadonly?: boolean;
  isConst?: boolean;
  isVirtual?: boolean;
  isOverride?: boolean;
  isSealed?: boolean;
  returnType?: string;
  parameters?: Array<{ name: string; type: string; isOptional?: boolean; defaultValue?: string }>;
  baseTypes?: string[];
  interfaces?: string[];
  usings?: string[];
  attributes?: string[];
  typeParameters?: string[];
  fieldType?: string;
  propertyType?: string;
  calls?: Array<{ name: string; receiver?: string; receiverType?: string; line: number }>;
  diagnostics?: Array<{ id: string; message: string; severity: string; line: number; column: number }>;
  complexity?: number;
  docComment?: string;
}

// ============================================================================
// CSharpNativeParser
// ============================================================================

export class CSharpNativeParser {
  private client: RoslynAddonClient | null = null;

  constructor(client: RoslynAddonClient | null) {
    this.client = client;
  }

  /** Check if native parsing is available */
  get isAvailable(): boolean {
    return !!this.client?.connected;
  }

  /** Update the client reference (e.g., after reconnect) */
  setClient(client: RoslynAddonClient | null): void {
    this.client = client;
  }

  /**
   * Parse a single C# file using Roslyn.
   * Returns null if addon is not available (caller should fall back to tree-sitter).
   */
  async parseFile(filePath: string, content?: string): Promise<CSharpParseResult | null> {
    if (!this.isAvailable) return null;

    try {
      const result = await this.client!.request<CSharpParseResult>("parse", {
        filePath,
        content,
      });
      return result;
    } catch (error) {
      log.w("CSharpParser", "parse_failed", { file: filePath, err: String(error) });
      return null;
    }
  }

  /**
   * Parse multiple C# files in batch using Roslyn.
   * Returns null if addon is not available.
   */
  async parseBatch(files: Array<{ filePath: string; content?: string }>): Promise<{
    files: Array<{ filePath: string; entities: CSharpParsedEntity[] }>;
  } | null> {
    if (!this.isAvailable) return null;

    try {
      const result = await this.client!.request<{
        files: Array<{ filePath: string; entities: CSharpParsedEntity[] }>;
      }>("parseBatch", { files });
      return result;
    } catch (error) {
      log.w("CSharpParser", "batch_failed", { count: files.length, err: String(error) });
      return null;
    }
  }

  /**
   * Flatten entities from Roslyn parse result into a flat array with parent references.
   * Useful for indexing into the graph database.
   */
  flattenEntities(entities: CSharpParsedEntity[]): CSharpParsedEntity[] {
    const result: CSharpParsedEntity[] = [];

    for (const entity of entities) {
      result.push(entity);
      if (entity.children) {
        result.push(...this.flattenEntities(entity.children));
      }
    }

    return result;
  }
}
