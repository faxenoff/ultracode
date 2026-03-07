/**
 * Java JPA/Hibernate Framework Extractor
 *
 * Extracts JPA-specific patterns and annotations from Java code.
 * Handles: @Entity, @Table, @Column, @OneToMany, @ManyToOne,
 *          @OneToOne, @ManyToMany, @JoinColumn, @Query, etc.
 *
 * Key features:
 * - Detects JPA entities
 * - Extracts relationship mappings
 * - Identifies repository patterns
 * - Extracts named queries
 */

import type { EntityRelationship, ParsedEntity } from "../../../types/parser.js";
import type { AnnotationInfo, JpaEntityInfo, LocationInfo } from "../types.js";

// =============================================================================
// JPA ANNOTATION PATTERNS
// =============================================================================

/**
 * JPA entity annotations
 */
const JPA_ENTITY_ANNOTATIONS = new Set(["Entity", "MappedSuperclass", "Embeddable"]);

/**
 * JPA relationship annotations
 */
const JPA_RELATIONSHIP_ANNOTATIONS = new Map<string, JpaEntityInfo["relationships"][0]["type"]>([
  ["OneToMany", "OneToMany"],
  ["ManyToOne", "ManyToOne"],
  ["OneToOne", "OneToOne"],
  ["ManyToMany", "ManyToMany"],
]);

/**
 * JPA field annotations (exported for external use)
 */
export const JPA_FIELD_ANNOTATIONS = new Set([
  "Column",
  "Id",
  "GeneratedValue",
  "Temporal",
  "Enumerated",
  "Lob",
  "Basic",
  "Transient",
  "Version",
]);

// =============================================================================
// DETECTION FUNCTIONS
// =============================================================================

/**
 * Check if code contains JPA framework imports
 */
export function detectJpaFramework(code: string): boolean {
  const jpaPatterns = [
    /import\s+javax\.persistence\./,
    /import\s+jakarta\.persistence\./,
    /import\s+org\.hibernate\./,
    /@Entity/,
    /@Repository/,
    /@Table/,
  ];

  return jpaPatterns.some((pattern) => pattern.test(code));
}

/**
 * Detect JPA framework confidence level
 */
export function getJpaConfidence(code: string): number {
  let confidence = 0;

  if (/import\s+(javax|jakarta)\.persistence\./.test(code)) confidence += 0.4;
  if (/import\s+org\.hibernate\./.test(code)) confidence += 0.2;
  if (/@Entity/.test(code)) confidence += 0.3;
  if (/@(OneToMany|ManyToOne|OneToOne|ManyToMany)/.test(code)) confidence += 0.1;

  return Math.min(confidence, 1.0);
}

// =============================================================================
// ANNOTATION EXTRACTION
// =============================================================================

/**
 * Extract JPA-specific information from annotations
 */
export function extractJpaInfo(
  annotations: AnnotationInfo[],
  _location: LocationInfo,
): {
  jpaInfo?: JpaEntityInfo | undefined;
  relationships: EntityRelationship[];
} {
  const relationships: EntityRelationship[] = [];
  let jpaInfo: JpaEntityInfo | undefined;

  for (const annotation of annotations) {
    const annotationName = annotation.name.replace(/^.*\./, ""); // Remove package prefix

    // Check for entity annotations
    if (JPA_ENTITY_ANNOTATIONS.has(annotationName)) {
      jpaInfo = {
        ...jpaInfo,
        isEntity: true,
        relationships: jpaInfo?.relationships || [],
      };
    }

    // Check for @Table annotation
    if (annotationName === "Table") {
      const tableName = extractTableName(annotation);
      if (tableName) {
        jpaInfo = {
          ...jpaInfo,
          tableName,
          isEntity: jpaInfo?.isEntity || false,
          relationships: jpaInfo?.relationships || [],
        };
      }
    }

    // Check for relationship annotations
    const relationType = JPA_RELATIONSHIP_ANNOTATIONS.get(annotationName);
    if (relationType) {
      const relationshipInfo = extractRelationshipInfo(annotation, relationType);
      if (relationshipInfo) {
        jpaInfo = {
          ...jpaInfo,
          isEntity: jpaInfo?.isEntity || false,
          relationships: [...(jpaInfo?.relationships || []), relationshipInfo],
        };
      }
    }
  }

  return { jpaInfo, relationships };
}

/**
 * Extract table name from @Table annotation
 */
function extractTableName(annotation: AnnotationInfo): string | undefined {
  if (!annotation.arguments || annotation.arguments.length === 0) {
    return undefined;
  }

  const arg = annotation.arguments[0];
  if (!arg) return undefined;
  const nameMatch = arg.match(/(?:name\s*=\s*)?["']([^"']+)["']/);

  return nameMatch?.[1];
}

/**
 * Extract relationship information from relationship annotation
 */
function extractRelationshipInfo(
  annotation: AnnotationInfo,
  type: JpaEntityInfo["relationships"][0]["type"],
): JpaEntityInfo["relationships"][0] | undefined {
  const result: JpaEntityInfo["relationships"][0] = { type };

  if (!annotation.arguments) {
    return result;
  }

  const arg = annotation.arguments.join(",");

  // Extract targetEntity
  const targetMatch = arg.match(/targetEntity\s*=\s*(\w+)\.class/);
  if (targetMatch?.[1]) {
    result.targetEntity = targetMatch[1];
  }

  // Extract mappedBy
  const mappedByMatch = arg.match(/mappedBy\s*=\s*["']([^"']+)["']/);
  if (mappedByMatch?.[1]) {
    result.mappedBy = mappedByMatch[1];
  }

  return result;
}

// =============================================================================
// ENTITY ENRICHMENT
// =============================================================================

/**
 * Enrich parsed entity with JPA information
 */
export function enrichEntityWithJpa(
  entity: ParsedEntity,
  _code: string,
): {
  entity: ParsedEntity;
  relationships: EntityRelationship[];
} {
  const relationships: EntityRelationship[] = [];

  if (!entity.decorators) {
    return { entity, relationships };
  }

  const { jpaInfo, relationships: jpaRelationships } = extractJpaInfo(entity.decorators, entity.location);

  if (jpaInfo) {
    entity.metadata = {
      ...entity.metadata,
      jpa: jpaInfo,
    };

    // Create relationships for JPA mappings
    for (const rel of jpaInfo.relationships) {
      if (rel.targetEntity) {
        relationships.push({
          from: entity.name,
          to: rel.targetEntity,
          type: "references",
          metadata: {
            jpaRelation: rel.type,
            mappedBy: rel.mappedBy,
          },
        });
      }
    }
  }

  relationships.push(...jpaRelationships);

  return { entity, relationships };
}

// =============================================================================
// REPOSITORY EXTRACTION
// =============================================================================

/**
 * Check if entity is a JPA Repository
 */
export function isJpaRepository(entity: ParsedEntity): boolean {
  if (entity.type !== "interface") return false;

  // Check inheritance
  if (entity.inheritance && entity.inheritance.interfaces) {
    const repositoryBases = ["JpaRepository", "CrudRepository", "PagingAndSortingRepository", "Repository"];

    for (const base of entity.inheritance.interfaces) {
      if (repositoryBases.some((r) => base.includes(r))) {
        return true;
      }
    }
  }

  // Check annotations
  if (entity.decorators) {
    for (const annotation of entity.decorators) {
      if (annotation.name.includes("Repository")) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Extract repository entity type from generic parameter
 */
export function extractRepositoryEntityType(entity: ParsedEntity): string | undefined {
  if (!entity.inheritance || !entity.inheritance.interfaces) return undefined;

  for (const iface of entity.inheritance.interfaces) {
    // Pattern: JpaRepository<EntityType, IdType>
    const match = iface.match(/(?:Jpa|Crud|PagingAndSorting)?Repository<(\w+),/);
    if (match?.[1]) {
      return match[1];
    }
  }

  return undefined;
}

/**
 * Extract custom queries from repository methods
 */
export function extractCustomQueries(methods: ParsedEntity[]): Array<{
  methodName: string;
  query?: string | undefined;
  isNative?: boolean;
}> {
  const queries: Array<{
    methodName: string;
    query?: string | undefined;
    isNative?: boolean;
  }> = [];

  for (const method of methods) {
    if (!method.decorators) continue;

    for (const annotation of method.decorators) {
      if (annotation.name.includes("Query") && annotation.arguments) {
        const arg = annotation.arguments.join(",");

        // Extract query string
        const queryMatch = arg.match(/(?:value\s*=\s*)?["']([^"']+)["']/);
        const isNative = /nativeQuery\s*=\s*true/.test(arg);

        queries.push({
          methodName: method.name,
          query: queryMatch ? queryMatch[1] : undefined,
          isNative,
        });
      }
    }

    // Check for derived query methods
    if (!method.decorators.some((a) => a.name.includes("Query"))) {
      const derivedQuery = parseDerivedQueryMethod(method.name);
      if (derivedQuery) {
        queries.push({
          methodName: method.name,
        });
      }
    }
  }

  return queries;
}

/**
 * Parse derived query method name
 */
function parseDerivedQueryMethod(methodName: string): boolean {
  const derivedQueryPatterns = [
    /^findBy/,
    /^findAllBy/,
    /^findFirstBy/,
    /^findTopBy/,
    /^countBy/,
    /^deleteBy/,
    /^removeBy/,
    /^existsBy/,
    /^readBy/,
    /^queryBy/,
    /^getBy/,
  ];

  return derivedQueryPatterns.some((pattern) => pattern.test(methodName));
}
