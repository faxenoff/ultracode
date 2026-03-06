/**
 * Java Spring Framework Extractor
 *
 * Extracts Spring-specific patterns and annotations from Java code.
 * Handles: @Controller, @Service, @Repository, @Component,
 *          @Autowired, @RequestMapping, @GetMapping, etc.
 *
 * Key features:
 * - Detects Spring component types
 * - Extracts REST endpoint mappings
 * - Identifies dependency injection points
 * - Extracts configuration patterns
 */

import type { EntityRelationship, ParsedEntity } from "../../../types/parser.js";
import type { AnnotationInfo, LocationInfo, SpringAnnotationInfo } from "../types.js";

// =============================================================================
// SPRING ANNOTATION PATTERNS
// =============================================================================

/**
 * Spring stereotype annotations
 */
const SPRING_STEREOTYPES = new Map<string, SpringAnnotationInfo["type"]>([
  ["Controller", "controller"],
  ["RestController", "controller"],
  ["Service", "service"],
  ["Repository", "repository"],
  ["Component", "component"],
  ["Configuration", "configuration"],
  ["Bean", "bean"],
]);

/**
 * Spring request mapping annotations
 */
const SPRING_REQUEST_MAPPINGS = new Map<string, SpringAnnotationInfo["method"]>([
  ["GetMapping", "GET"],
  ["PostMapping", "POST"],
  ["PutMapping", "PUT"],
  ["DeleteMapping", "DELETE"],
  ["PatchMapping", "PATCH"],
  ["RequestMapping", undefined], // Method determined by annotation params
]);

/**
 * Spring DI annotations
 */
const SPRING_DI_ANNOTATIONS = new Set(["Autowired", "Inject", "Resource", "Value", "Qualifier"]);

// =============================================================================
// DETECTION FUNCTIONS
// =============================================================================

/**
 * Check if code contains Spring framework imports
 */
export function detectSpringFramework(code: string): boolean {
  const springPatterns = [
    /import\s+org\.springframework\./,
    /@(Controller|Service|Repository|Component|Configuration)/,
    /@(Autowired|RequestMapping|GetMapping|PostMapping)/,
    /@SpringBootApplication/,
  ];

  return springPatterns.some((pattern) => pattern.test(code));
}

/**
 * Detect Spring framework confidence level
 */
export function getSpringConfidence(code: string): number {
  let confidence = 0;

  if (/import\s+org\.springframework\./.test(code)) confidence += 0.4;
  if (/@(Controller|RestController|Service|Repository|Component)/.test(code)) confidence += 0.3;
  if (/@(Autowired|Inject)/.test(code)) confidence += 0.2;
  if (/@(RequestMapping|GetMapping|PostMapping|PutMapping|DeleteMapping)/.test(code)) confidence += 0.1;

  return Math.min(confidence, 1.0);
}

// =============================================================================
// ANNOTATION EXTRACTION
// =============================================================================

/**
 * Extract Spring-specific information from annotations
 */
export function extractSpringInfo(
  annotations: AnnotationInfo[],
  _location: LocationInfo,
): {
  springInfo?: SpringAnnotationInfo | undefined;
  relationships: EntityRelationship[];
} {
  const relationships: EntityRelationship[] = [];
  let springInfo: SpringAnnotationInfo | undefined;

  for (const annotation of annotations) {
    const annotationName = annotation.name.replace(/^.*\./, ""); // Remove package prefix

    // Check for stereotype annotations
    const stereotype = SPRING_STEREOTYPES.get(annotationName);
    if (stereotype) {
      springInfo = {
        ...springInfo,
        type: stereotype,
      };
    }

    // Check for request mappings
    const requestMethod = SPRING_REQUEST_MAPPINGS.get(annotationName);
    if (requestMethod !== undefined || annotationName === "RequestMapping") {
      const path = extractPathFromAnnotation(annotation);
      const method = requestMethod || extractMethodFromAnnotation(annotation);

      springInfo = {
        ...springInfo,
        type: springInfo?.type || "controller",
        ...(path != null ? { path } : {}),
        ...(method != null ? { method } : {}),
      };
    }

    // Check for DI annotations
    if (SPRING_DI_ANNOTATIONS.has(annotationName)) {
      if (annotationName === "Qualifier" && annotation.arguments) {
        springInfo = {
          ...springInfo,
          type: springInfo?.type || "component",
          qualifiers: annotation.arguments,
        };
      }
    }
  }

  return { springInfo, relationships };
}

/**
 * Extract path from mapping annotation
 */
function extractPathFromAnnotation(annotation: AnnotationInfo): string | undefined {
  if (!annotation.arguments || annotation.arguments.length === 0) {
    return undefined;
  }

  const arg = annotation.arguments[0];
  if (!arg) return undefined;

  // Handle value = "..." or path = "..." or just "..."
  const pathMatch = arg.match(/(?:value\s*=\s*|path\s*=\s*)?["']([^"']+)["']/);
  if (pathMatch) {
    return pathMatch[1];
  }

  // Handle array of paths
  const arrayMatch = arg.match(/\{["']([^"']+)["']/);
  if (arrayMatch) {
    return arrayMatch[1];
  }

  return undefined;
}

/**
 * Extract HTTP method from RequestMapping annotation
 */
function extractMethodFromAnnotation(annotation: AnnotationInfo): SpringAnnotationInfo["method"] {
  if (!annotation.arguments) return undefined;

  const arg = annotation.arguments.join(",");

  if (/method\s*=\s*RequestMethod\.GET/.test(arg)) return "GET";
  if (/method\s*=\s*RequestMethod\.POST/.test(arg)) return "POST";
  if (/method\s*=\s*RequestMethod\.PUT/.test(arg)) return "PUT";
  if (/method\s*=\s*RequestMethod\.DELETE/.test(arg)) return "DELETE";
  if (/method\s*=\s*RequestMethod\.PATCH/.test(arg)) return "PATCH";

  return undefined;
}

// =============================================================================
// ENTITY ENRICHMENT
// =============================================================================

/**
 * Enrich parsed entity with Spring information
 */
export function enrichEntityWithSpring(
  entity: ParsedEntity,
  code: string,
): {
  entity: ParsedEntity;
  relationships: EntityRelationship[];
} {
  const relationships: EntityRelationship[] = [];

  if (!entity.decorators) {
    return { entity, relationships };
  }

  const { springInfo, relationships: springRelationships } = extractSpringInfo(entity.decorators, entity.location);

  if (springInfo) {
    entity.metadata = {
      ...entity.metadata,
      spring: springInfo,
    };

    // Add framework-specific relationships
    if (springInfo.type === "controller" || springInfo.type === "service") {
      // Look for @Autowired fields/constructors
      const autowiredMatches = code.matchAll(/@Autowired[\s\S]*?(?:private|protected|public)?\s+(\w+)\s+(\w+)/g);
      for (const match of autowiredMatches) {
        const typeName = match[1];
        const fieldName = match[2];
        if (typeName) {
          relationships.push({
            from: entity.name,
            to: typeName,
            type: "depends_on",
            metadata: {
              injectionType: "autowired",
              fieldName: fieldName || "",
            },
          });
        }
      }
    }
  }

  relationships.push(...springRelationships);

  return { entity, relationships };
}

// =============================================================================
// ENDPOINT EXTRACTION
// =============================================================================

/**
 * Extract all REST endpoints from a controller class
 */
export function extractEndpoints(
  entity: ParsedEntity,
  children: ParsedEntity[],
): Array<{
  path: string;
  method: string;
  handlerName: string;
  location: LocationInfo;
}> {
  const endpoints: Array<{
    path: string;
    method: string;
    handlerName: string;
    location: LocationInfo;
  }> = [];

  // Get base path from class-level @RequestMapping
  let basePath = "";
  if (entity.decorators) {
    for (const annotation of entity.decorators) {
      if (annotation.name.includes("RequestMapping")) {
        basePath = extractPathFromAnnotation(annotation) || "";
        break;
      }
    }
  }

  // Extract method-level endpoints
  for (const child of children) {
    if (child.type !== "method" || !child.decorators) continue;

    for (const annotation of child.decorators) {
      const annotationName = annotation.name.replace(/^.*\./, "");
      const method = SPRING_REQUEST_MAPPINGS.get(annotationName);

      if (method !== undefined || annotationName === "RequestMapping") {
        const methodPath = extractPathFromAnnotation(annotation) || "";
        const httpMethod = method || extractMethodFromAnnotation(annotation) || "GET";

        endpoints.push({
          path: `${basePath}${methodPath}`,
          method: httpMethod,
          handlerName: child.name,
          location: child.location,
        });
      }
    }
  }

  return endpoints;
}
