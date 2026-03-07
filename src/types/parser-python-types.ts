/**
 * Python-specific Parser Type Definitions
 *
 * Enhanced types for Python language analysis across 4 layers.
 */

// =============================================================================
// MAGIC METHOD TYPES
// =============================================================================

/**
 * Magic method type groups for Python special methods.
 * Organized by category for better readability and faster type checking.
 */
export const MagicMethodGroups = {
  /** Object lifecycle methods: __init__, __new__, __del__ */
  Lifecycle: ["init", "new", "del"] as const,

  /** String representation: __str__, __repr__, __format__, __bytes__ */
  Representation: ["str", "repr", "format", "bytes"] as const,

  /** Object identity: __hash__, __bool__ */
  Identity: ["hash", "bool"] as const,

  /** Callable: __call__ */
  Callable: ["call"] as const,

  /** Container methods: __len__, __getitem__, __setitem__, __delitem__, __contains__ */
  Container: ["len", "getitem", "setitem", "delitem", "contains"] as const,

  /** Iterator methods: __iter__, __next__, __reversed__ */
  Iterator: ["iter", "next", "reversed"] as const,

  /** Context manager: __enter__, __exit__, __aenter__, __aexit__ */
  ContextManager: ["enter", "exit", "aenter", "aexit"] as const,

  /** Comparison operators: __eq__, __ne__, __lt__, __le__, __gt__, __ge__ */
  Comparison: ["eq", "ne", "lt", "le", "gt", "ge"] as const,

  /** Arithmetic operators: __add__, __sub__, __mul__, __truediv__, __floordiv__, __mod__, __pow__ */
  Arithmetic: ["add", "sub", "mul", "truediv", "floordiv", "mod", "pow"] as const,

  /** Bitwise operators: __and__, __or__, __xor__, __lshift__, __rshift__, __invert__ */
  Bitwise: ["and", "or", "xor", "lshift", "rshift", "invert"] as const,
} as const;

/** All magic method categories */
export type MagicMethodCategory = keyof typeof MagicMethodGroups;

/** Union type of all magic method names (derived from MagicMethodGroups) */
export type MagicType = (typeof MagicMethodGroups)[MagicMethodCategory][number];

// =============================================================================
// PYTHON ANALYSIS CONFIGURATION
// =============================================================================

/**
 * Python-specific analysis configuration
 */
export interface PythonAnalysisConfig {
  /** Enable Layer 1: Enhanced basic parsing */
  enhancedBasicParsing: boolean;

  /** Enable Layer 2: Advanced feature analysis */
  advancedFeatureAnalysis: boolean;

  /** Enable Layer 3: Relationship mapping */
  relationshipMapping: boolean;

  /** Enable Layer 4: Pattern recognition */
  patternRecognition: boolean;

  /** Extract all magic methods */
  extractAllMagicMethods: boolean;

  /** Analyze property decorators */
  analyzePropertyDecorators: boolean;

  /** Build inheritance hierarchies */
  buildInheritanceHierarchies: boolean;

  /** Detect circular dependencies */
  detectCircularDependencies: boolean;

  /** Pattern detection thresholds */
  patternConfidenceThreshold: number;
}

// =============================================================================
// PYTHON METHOD INFO
// =============================================================================

/**
 * Enhanced Python method information
 */
export interface PythonMethodInfo {
  /** Method classification */
  classification: "instance" | "class" | "static" | "property" | "abstract" | "magic";

  /** Is this method async */
  isAsync: boolean;

  /** Is this a generator method */
  isGenerator: boolean;

  /** Decorator stack */
  decorators: Array<{
    name: string;
    module?: string;
    arguments?: string[];
    line: number;
  }>;

  /** Magic method type (if applicable) */
  magicType?: MagicType | undefined;

  /** Property information (if property) */
  propertyInfo?: {
    hasGetter: boolean;
    hasSetter: boolean;
    hasDeleter: boolean;
    getterName?: string;
    setterName?: string;
    deleterName?: string;
  };

  /** Override information */
  overrideInfo?: {
    overrides: string; // Parent method being overridden
    parentClass: string;
    callsSuper: boolean;
    changeSignature: boolean;
  };

  location?: {
    start: { line: number; column: number; index: number };
    end: { line: number; column: number; index: number };
  };
}

// =============================================================================
// PYTHON CLASS INFO
// =============================================================================

/**
 * Enhanced Python class information
 */
export interface PythonClassInfo {
  /** Class type */
  classType: "regular" | "abstract" | "dataclass" | "namedtuple" | "enum" | "protocol";

  /** Base classes */
  baseClasses: string[];

  /** Method Resolution Order */
  mro: string[];

  /** Abstract methods that need implementation */
  abstractMethods: string[];

  /** Magic methods implemented */
  magicMethods: string[];

  /** Properties defined */
  properties: Array<{
    name: string;
    hasGetter: boolean;
    hasSetter: boolean;
    hasDeleter: boolean;
  }>;

  /** Metaclass information */
  metaclass?: string;

  /** Decorator information */
  classDecorators: Array<{
    name: string;
    arguments?: string[] | undefined;
  }>;

  methods: string[];

  decorators?: string[] | undefined;

  location?: {
    start: { line: number; column: number; index: number };
    end: { line: number; column: number; index: number };
  };

  methodResolutionOrder?: string[];
}

// =============================================================================
// IMPORT DEPENDENCY
// =============================================================================

/**
 * Import dependency information for Layer 3
 */
export interface ImportDependency {
  /** Source file */
  sourceFile: string;

  /** Target module/file */
  targetModule: string;

  /** Import type */
  importType: "absolute" | "relative" | "conditional" | "dynamic";

  /** Imported symbols */
  symbols: Array<{
    name: string;
    alias?: string | undefined;
    isDefault?: boolean;
  }>;

  /** Line number of import */
  line: number;

  /** Is this import used */
  isUsed: boolean;

  /** Usage locations */
  usageLocations: Array<{ line: number; column: number; context: string }>;

  module?: string;

  imported?: string | undefined;

  alias?: string | undefined;

  isLocal?: boolean;

  metadata?: Record<string, any>;

  type?: "import" | "from_import" | "use" | "extern_crate";
}

// =============================================================================
// PYTHON PARSER METRICS
// =============================================================================

/**
 * Performance metrics for enhanced Python parsing
 */
export interface PythonParserMetrics {
  /** Layer 1 metrics */
  basicParsing: {
    methodsClassified: number;
    typeHintsProcessed: number;
    decoratorsExtracted: number;
    parseTimeMs: number;
  };

  /** Layer 2 metrics */
  advancedFeatures: {
    magicMethodsFound: number;
    propertiesAnalyzed: number;
    asyncPatternsDetected: number;
    generatorsFound: number;
    dataclassesProcessed: number;
    analysisTimeMs: number;
  };

  /** Layer 3 metrics */
  relationshipMapping: {
    inheritanceHierarchiesBuilt: number;
    methodOverridesDetected: number;
    crossFileReferencesResolved: number;
    circularDependenciesFound: number;
    mappingTimeMs: number;

    timeMs?: number;
    inheritanceRelationships?: number;
    methodOverrides?: number;
    importDependencies?: number;
    crossReferences?: number;
    mroCalculations?: number;
  };

  /** Layer 4 metrics */
  patternRecognition: {
    contextManagersDetected: number;
    exceptionPatternsFound: number;
    designPatternsIdentified: number;
    pythonIdiomsDetected: number;
    recognitionTimeMs: number;

    timeMs?: number;
    totalPatternsFound?: number;
  };

  /** Overall metrics */
  overall: {
    totalEntities: number;
    totalRelationships: number;
    totalPatterns: number;
    totalTimeMs: number;
    memoryUsedMB: number;
  };
}
