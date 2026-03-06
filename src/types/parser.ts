/**
 * Parser system types: entity extraction, relationships, caching,
 * pattern detection, and incremental file parsing.
 */

export type {
  ASTNode,
  TreeSitterCursor,
  TreeSitterEdit,
  TreeSitterNode,
  TreeSitterTree,
} from "./parser-ast-types.js";

export type {
  ImportDependency,
  MagicType,
  PythonAnalysisConfig,
  PythonClassInfo,
  PythonMethodInfo,
  PythonParserMetrics,
} from "./parser-python-types.js";

import type { AgentTask } from "./agent.js";
import type { MagicType } from "./parser-python-types.js";

// -- Language constants -----------------------------------------------------

export const SUPPORTED_LANGUAGES = [
  "javascript",
  "typescript",
  "tsx",
  "jsx",
  "python",
  "c",
  "cpp",
  "csharp",
  "rust",
  "go",
  "java",
  "kotlin",
  "swift",
  "css",
  "html",
  "xml",
  "bash",
  "powershell",
  "batch",
  "json",
  "zig",
  "helm",
] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

// -- Source location --------------------------------------------------------

interface SourcePosition {
  line: number;
  column: number;
  index: number;
}

interface SourceSpan {
  start: SourcePosition;
  end: SourcePosition;
}

// -- Relationship types -----------------------------------------------------

export type RelationshipKind =
  | "inherits"
  | "implements"
  | "overrides"
  | "calls"
  | "imports"
  | "decorates"
  | "contains"
  | "member_of"
  | "depends_on"
  | "produces_api"
  | "consumes_api"
  | "generated_from";

export type ExtendedRelationshipKind =
  | RelationshipKind
  | "references"
  | "embeds"
  | "listens_to"
  | "dispatches"
  | "reduces"
  | "selects"
  | "dispatches_action"
  | "listens_to_action"
  | "handles_action"
  | "selects_state"
  | "modifies_state"
  | "defines_class"
  | "defines_function"
  | "has_method";

// -- Entity types -----------------------------------------------------------

export type EntityKind =
  | "function"
  | "async_function"
  | "method"
  | "abstract_method"
  | "class_method"
  | "static_method"
  | "constructor"
  | "lambda"
  | "generator"
  | "class"
  | "interface"
  | "type"
  | "struct"
  | "enum"
  | "enum_variant"
  | "record"
  | "protocol"
  | "trait"
  | "impl_block"
  | "union"
  | "dataclass"
  | "namedtuple"
  | "property"
  | "field"
  | "variable"
  | "constant"
  | "typedef"
  | "module"
  | "import"
  | "export"
  | "crate"
  | "namespace"
  | "file"
  | "magic_method"
  | "decorator"
  | "context_manager"
  | "actor"
  | "extension"
  | "delegate"
  | "event"
  | "macro"
  | "ngrx_effect"
  | "ngrx_action"
  | "ngrx_reducer"
  | "ngrx_selector";

export type SideEffectCategory = "io" | "network" | "storage" | "dom" | "global" | "state";

// -- ParsedEntity -----------------------------------------------------------

export interface ParsedEntity {
  name: string;
  type: EntityKind;
  location: SourceSpan;

  id?: string | undefined;
  path?: string | undefined;
  signature?: string | undefined;
  filePath?: string | undefined;
  language?: string | undefined;
  children?: ParsedEntity[] | undefined;

  references?: string[] | undefined;
  relationships?:
    | Array<{
        type: RelationshipKind;
        target: string;
        targetFile?: string | undefined;
        metadata?: Record<string, any> | undefined;
      }>
    | undefined;

  modifiers?: string[] | undefined;
  decorators?:
    | Array<{
        name: string;
        arguments?: string[] | undefined;
        isBuiltin?: boolean | undefined;
      }>
    | undefined;

  returnType?: string | undefined;
  parameters?:
    | Array<{
        name: string;
        type?: string | undefined;
        optional?: boolean | undefined;
        defaultValue?: string | undefined;
      }>
    | undefined;
  methodType?: "instance" | "class" | "static" | "property" | "abstract" | "magic" | undefined;

  inheritance?:
    | {
        baseClasses: string[];
        interfaces?: string[] | undefined;
        mro?: string[] | undefined;
        isAbstract?: boolean | undefined;
      }
    | undefined;

  asyncInfo?:
    | {
        isAsync?: boolean | undefined;
        isGenerator?: boolean | undefined;
        isAsyncGenerator?: boolean | undefined;
        yieldsFrom?: string[] | undefined;
        awaitCount?: number | undefined;
        yieldCount?: number | undefined;
        generatorType?: "simple" | "delegating" | undefined;
        asyncPatterns?: string[] | undefined;
      }
    | undefined;

  importData?:
    | {
        source: string;
        specifiers: Array<{
          local: string;
          imported?: string | undefined;
          alias?: string | undefined;
        }>;
        isDefault?: boolean | undefined;
        isNamespace?: boolean | undefined;
        isRelative?: boolean | undefined;
        fromModule?: string | undefined;
      }
    | undefined;

  pythonInfo?:
    | {
        magicMethodType?: MagicType | "other" | undefined;
        decorators?:
          | Array<{
              name: string;
              module?: string | undefined;
              arguments?: string[] | undefined;
              line?: number | undefined;
            }>
          | undefined;
        isProperty?: boolean | undefined;
        hasGetter?: boolean | undefined;
        hasSetter?: boolean | undefined;
        isDataclass?: boolean | undefined;
        specialClassType?: "dataclass" | "enum" | "namedtuple" | "protocol" | "abstract" | undefined;
      }
    | undefined;

  patterns?:
    | {
        isContextManager?: boolean | undefined;
        exceptionHandling?:
          | {
              hasTryExcept?: boolean | undefined;
              exceptTypes?: string[] | undefined;
              hasFinally?: boolean | undefined;
            }
          | undefined;
        designPatterns?: string[] | undefined;
        pythonIdioms?: string[] | undefined;
      }
    | undefined;

  calls?:
    | Array<{
        name: string;
        argumentCount: number;
        location: SourceSpan;
        target?: string | undefined;
        isAwait?: boolean | undefined;
        isOptional?: boolean | undefined;
        isNew?: boolean | undefined;
        typeArguments?: string[] | undefined;
      }>
    | undefined;

  controlFlow?:
    | {
        branches: Array<{
          type: "if" | "else" | "else-if" | "switch" | "case" | "default" | "ternary";
          condition?: string | undefined;
          location: SourceSpan;
        }>;
        loops: Array<{
          type: "for" | "for-of" | "for-in" | "while" | "do-while";
          location: SourceSpan;
        }>;
        exceptions: Array<{
          type: "try" | "catch" | "finally" | "throw";
          catchType?: string | undefined;
          location: SourceSpan;
        }>;
        returns: Array<{
          hasValue: boolean;
          location: SourceSpan;
        }>;
        awaits: Array<{
          expression: string;
          location: SourceSpan;
        }>;
      }
    | undefined;

  documentation?:
    | {
        description?: string | undefined;
        params?:
          | Array<{
              name: string;
              type?: string | undefined;
              description?: string | undefined;
              optional?: boolean | undefined;
            }>
          | undefined;
        returns?:
          | {
              type?: string | undefined;
              description?: string | undefined;
            }
          | undefined;
        throws?:
          | Array<{
              type?: string | undefined;
              description?: string | undefined;
            }>
          | undefined;
        examples?: string[] | undefined;
        deprecated?: string | boolean | undefined;
        see?: string[] | undefined;
        since?: string | undefined;
        author?: string | undefined;
      }
    | undefined;

  typeReferences?:
    | Array<{
        name: string;
        kind: "parameter" | "return" | "variable" | "property" | "generic" | "extends" | "implements";
        location: SourceSpan;
      }>
    | undefined;

  complexity?:
    | {
        cyclomatic: number;
        cognitive: number;
        linesOfCode: number;
        linesOfLogic: number;
        nestingDepth: number;
        parameterCount: number;
        returnCount: number;
      }
    | undefined;

  typeParameters?:
    | Array<{
        name: string;
        constraint?: string | undefined;
        default?: string | undefined;
      }>
    | undefined;

  sideEffects?:
    | {
        hasSideEffects: boolean;
        types: SideEffectCategory[];
        details: Array<{
          type: SideEffectCategory;
          expression: string;
          location: SourceSpan;
        }>;
      }
    | undefined;

  embeddingBase64?: string | undefined;
  embeddingText?: string | undefined;
  metadata?: Record<string, any> | undefined;
}

// -- Parse results ----------------------------------------------------------

export interface ParseResult {
  filePath: string;
  language: SupportedLanguage;
  entities: ParsedEntity[];
  contentHash: string;
  timestamp: number;
  parseTimeMs: number;
  fromCache?: boolean | undefined;
  relationships?: EntityRelationship[] | undefined;
  patterns?: PatternAnalysis | undefined;
  errors?:
    | Array<{
        message: string;
        location?: { line: number; column: number } | undefined;
      }>
    | undefined;
}

export interface CacheEntry {
  hash: string;
  result: ParseResult;
  cachedAt: number;
  size: number;
}

// -- Incremental parsing ----------------------------------------------------

export interface FileChange {
  filePath: string;
  changeType: "created" | "modified" | "deleted";
  content?: string | undefined;
  previousHash?: string | undefined;
  edits?:
    | Array<{
        startIndex: number;
        oldEndIndex: number;
        newEndIndex: number;
        startPosition: { row: number; column: number };
        oldEndPosition: { row: number; column: number };
        newEndPosition: { row: number; column: number };
      }>
    | undefined;
}

// -- Parser task & options --------------------------------------------------

export interface ParserTask extends AgentTask {
  type: "parse:file" | "parse:batch" | "parse:incremental";
  payload: {
    files?: string[] | undefined;
    changes?: FileChange[] | undefined;
    options?: ParserOptions | undefined;
  };
}

export interface ParserOptions {
  useCache?: boolean | undefined;
  extractReferences?: boolean | undefined;
  extractInheritance?: boolean | undefined;
  extractOverrides?: boolean | undefined;
  detectPatterns?: boolean | undefined;
  analyzeAsync?: boolean | undefined;
  extractMagicMethods?: boolean | undefined;
  includeSourceSnippets?: boolean | undefined;
  maxDepth?: number | undefined;
  batchSize?: number | undefined;
  timeoutMs?: number | undefined;
}

// -- Performance stats ------------------------------------------------------

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

// -- Entity relationships ---------------------------------------------------

export interface EntityRelationship {
  from: string;
  to: string;
  type: ExtendedRelationshipKind;
  sourceFile?: string | undefined;
  targetFile?: string | undefined;
  metadata?:
    | {
        line?: number | undefined;
        confidence?: number | undefined;
        isDirectRelation?: boolean | undefined;
        mroPosition?: number | undefined;
        [key: string]: any;
      }
    | undefined;
}

// -- Pattern analysis -------------------------------------------------------

export interface PatternAnalysis {
  contextManagers: Array<{
    entity: string;
    type: "class_based" | "function_based" | "async";
    methods: string[];
  }>;

  exceptionHandling: Array<{
    type: "try_except" | "try_finally" | "try_except_finally";
    exceptTypes: string[];
    location: { line: number; column: number };
    hasElse?: boolean | undefined;
    hasFinally?: boolean | undefined;
  }>;

  designPatterns: Array<{
    pattern: "singleton" | "observer" | "factory" | "builder" | "strategy" | "decorator" | "iterator";
    entities: string[];
    confidence: number;
    description: string;
  }>;

  pythonIdioms: Array<{
    idiom: "list_comprehension" | "dict_comprehension" | "generator_expression" | "context_manager" | "duck_typing";
    locations: Array<{ line: number; column: number }>;
    usage: string;
  }>;

  circularDependencies: Array<{
    cycle: string[];
    type: "import" | "inheritance" | "reference";
    severity: "warning" | "error";
  }>;

  otherPatterns?:
    | Array<{
        kind: string;
        entities?: string[] | undefined;
        confidence?: number | undefined;
        description?: string | undefined;
        locations?: Array<{ line: number; column: number }> | undefined;
        metadata?: Record<string, any> | undefined;
      }>
    | undefined;
}
