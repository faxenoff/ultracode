/**
 * Универсальная единица кода для semantic merge.
 *
 * CodeUnit представляет любую семантическую единицу кода:
 * файл, класс, функцию, метод, блок кода.
 *
 * Поддерживает Fast Path (hash-based) и Slow Path (embedding-based) matching.
 */
export interface CodeUnit {
  // Identity
  id: string; // Stable ID (SHA256 от FQN)
  type: CodeUnitType; // File, Class, Function, etc.

  // Location
  filePath: string; // Relative path from project root
  name: string; // Simple name (e.g., "UserService")
  fullyQualifiedName: string; // Full namespace.class.method
  startLine: number; // 1-based line number
  endLine: number; // 1-based line number

  // Content
  content: string; // Normalized source code
  contentHash: string; // SHA256 hash (Fast Path Level 1)
  structuralHash: string; // AST hash, ignores whitespace (Fast Path Level 2)
  signature?: string | undefined; // FQN + params for functions (Fast Path Level 3)

  // Semantic (lazy-loaded)
  embedding?: Float32Array | undefined; // Vector embedding, generated on-demand (Slow Path)

  // Structure
  structure?: CodeStructure | undefined; // AST metadata and metrics

  // Hierarchy
  parentId?: string | undefined; // Parent unit ID (e.g., class for method)
  childIds: string[]; // Child unit IDs (e.g., methods in class)

  // Metadata
  language: string; // TypeScript, Python, Rust, etc.
  metadata: Record<string, any>; // Extra language-specific data
}

/**
 * Типы кодовых единиц.
 */
export enum CodeUnitType {
  File = "file",
  Module = "module",
  Class = "class",
  Interface = "interface",
  Function = "function",
  Method = "method",
  Property = "property",
  Block = "block",
  Statement = "statement",
}

/**
 * Структурные метаданные AST.
 */
export interface CodeStructure {
  normalizedAst: string; // Normalized AST representation
  identifiers: Set<string>; // All identifiers used
  imports: Set<string>; // All import statements
  exports: Set<string>; // All export statements
  complexityMetrics?: {
    cyclomaticComplexity: number; // Cyclomatic complexity
    linesOfCode: number; // Actual LOC (excluding comments/whitespace)
    branchCount: number; // Number of branches (if/else/switch)
    loopCount: number; // Number of loops (for/while)
  };
}
