/**
 * Swagger/OpenAPI Code Linking Types
 *
 * Type definitions for linking swagger specifications to source code.
 * Follows the pattern from src/parsers/ngrx/types.ts.
 */

import type { RelationType } from "../../types/storage.js";

/**
 * A link between a swagger entity and a code entity
 */
export interface SwaggerCodeLink {
  /** Name of the endpoint/schema in swagger */
  swaggerEntityName: string;
  /** Name of the controller/type in code */
  codeEntityName: string;
  /** File path of the code entity */
  codeFilePath: string;
  /** File path of the swagger spec */
  swaggerFilePath: string;
  /** Type of link */
  linkType: "produces_api" | "consumes_api" | "generated_from";
  /** Confidence score 0-1 */
  confidence: number;
  /** Evidence for why these were linked */
  evidence: string[];
}

/**
 * Complete swagger analysis result for a project
 */
export interface SwaggerAnalysis {
  /** Controllers/routes that produce the API described in swagger */
  producers: SwaggerCodeLink[];
  /** Generated clients that consume the API */
  consumers: SwaggerCodeLink[];
  /** Generated DTOs/types from swagger schemas */
  generatedTypes: SwaggerCodeLink[];
  /** Markers found in generated files */
  generatedFileMarkers: string[];
  /** Codegen config files found */
  codegenConfigs: string[];
}

/**
 * Swagger relationship for graph storage
 */
export interface SwaggerRelationship {
  fromName: string;
  toName: string;
  type: RelationType;
  fromFile?: string;
  toFile?: string;
  metadata: {
    confidence?: number;
    evidence?: string[];
    httpMethod?: string;
    path?: string;
    schemaName?: string;
    context?: string;
  };
}

/**
 * Producer detection patterns per framework
 */
export interface ProducerPattern {
  framework: string;
  /** Decorator names that indicate a controller */
  controllerDecorators: string[];
  /** Decorator names that indicate HTTP methods */
  routeDecorators: string[];
  /** Swagger-specific decorators */
  swaggerDecorators: string[];
}

/**
 * Codegen config definition
 */
export interface CodegenConfig {
  /** Config file name pattern */
  configFile: string;
  /** Generator name */
  generator: string;
  /** File markers in generated code */
  fileMarkers: string[];
}

/**
 * Normalized route info extracted from code
 */
export interface CodeRoute {
  /** HTTP method (GET, POST, etc.) */
  httpMethod: string;
  /** Route path (normalized) */
  path: string;
  /** Entity name in code */
  entityName: string;
  /** File path */
  filePath: string;
  /** Controller prefix path */
  controllerPrefix?: string;
}

/**
 * Normalized endpoint info from swagger
 */
export interface SwaggerEndpoint {
  /** HTTP method */
  httpMethod: string;
  /** Path from swagger */
  path: string;
  /** Operation ID */
  operationId?: string | undefined;
  /** Entity name in graph */
  entityName: string;
  /** Swagger file path */
  filePath: string;
}
