/**
 * Entity Tool Handlers
 *
 * Handlers for entity operations:
 * - get_members
 * - list_entity_relationships
 * - query
 */

import { z } from "zod";
import { log } from "../../logging/index.js";
import type { Entity, EntityType, Relationship } from "../../types/storage.js";
import { projectPathParam } from "../base-schemas.js";
import { BaseToolHandler, type ToolResult } from "../base-tool-handler.js";
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE, type PaginationMeta, paginate, SAFE_LIMITS } from "../response-limits.js";

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

/**
 * Filters for entity queries
 */
interface EntityFilters {
  filePath?: string | undefined;
  entityType?: EntityType[] | undefined;
  name?: string | undefined;
}

/**
 * Query results with entities and relationships
 */
interface QueryResults {
  entities?: Entity[];
  relationships?: Relationship[];
}

/**
 * Pagination mapping for query results
 */
interface PaginationMapping {
  entities?: PaginationMeta;
  relationships?: PaginationMeta;
}

// =============================================================================
// LIST FILE ENTITIES
// =============================================================================

const ListFileEntitiesSchema = z.object({
  filePath: z.string(),
  projectPath: projectPathParam,
  entityTypes: z.array(z.string()).optional(),
  offset: z.number().optional().default(0),
  limit: z.number().optional().default(SAFE_LIMITS.entities),
});

export class ListFileEntitiesToolHandler extends BaseToolHandler<z.infer<typeof ListFileEntitiesSchema>> {
  protected parseArgs(args: unknown) {
    return ListFileEntitiesSchema.parse(args);
  }

  protected async execute(args: z.infer<typeof ListFileEntitiesSchema>): Promise<ToolResult> {
    const normalizedPath = this.context.normalizeInputPath(args.filePath);
    // v3: Ensure correct project context for GraphStorage queries
    const storage = await this.ensureGraphStorageForProject(args.projectPath);

    const filters: EntityFilters = { filePath: normalizedPath };
    if (args.entityTypes) {
      filters.entityType = args.entityTypes as EntityType[];
    }

    // Fetch all entities for this file (storage handles its own limit)
    const allEntities = await storage.findEntities({ filters, limit: 5000 });

    // Apply pagination
    const safeLimit = Math.min(args.limit, MAX_PAGE_SIZE);
    const paginatedResult = paginate(allEntities, args.offset, safeLimit);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              file: normalizedPath,
              count: paginatedResult.data.length,
              pagination: paginatedResult.pagination,
              entities: paginatedResult.data.map((e: any) => ({
                id: e.id,
                name: e.name,
                type: e.type,
                location: e.location,
                signature: e.metadata?.signature,
              })),
            },
            null,
            2,
          ),
        },
      ],
    };
  }
}

// =============================================================================
// LIST ENTITY RELATIONSHIPS
// =============================================================================

const ListEntityRelationshipsSchema = z.object({
  entityId: z.string().optional(),
  entityName: z.string().optional(),
  projectPath: projectPathParam,
  relationshipTypes: z.array(z.string()).optional(),
  direction: z.enum(["incoming", "outgoing", "both"]).optional().default("both"),
  offset: z.number().optional().default(0),
  limit: z.number().optional().default(SAFE_LIMITS.relationships),
});

export class ListEntityRelationshipsToolHandler extends BaseToolHandler<z.infer<typeof ListEntityRelationshipsSchema>> {
  protected parseArgs(args: unknown) {
    return ListEntityRelationshipsSchema.parse(args);
  }

  protected async execute(args: z.infer<typeof ListEntityRelationshipsSchema>): Promise<ToolResult> {
    // v3: Ensure correct project context for GraphStorage queries
    const storage = await this.ensureGraphStorageForProject(args.projectPath);

    let entityId = args.entityId;
    let resolvedFrom = "provided";

    // If name provided, find entity by name
    if (!entityId && args.entityName) {
      const entities = await storage.findEntities({
        filters: { name: args.entityName },
        limit: 1,
      });
      log.w("TOOL", "list_rels_findEntity", {
        name: args.entityName,
        found: entities.length,
        sample: entities
          .slice(0, 3)
          .map((e) => ({ id: e.id?.slice(0, 12), name: e.name, type: e.type, file: e.filePath?.split(/[/\\]/).pop() })),
      });
      if (entities.length > 0 && entities[0]) {
        entityId = entities[0].id;
        resolvedFrom = "byName";
      }
    }

    if (!entityId) {
      log.w("TOOL", "list_rels_not_found", { entityId: args.entityId, entityName: args.entityName });
      return {
        content: [{ type: "text", text: JSON.stringify({ error: "Entity not found" }) }],
      };
    }

    log.w("TOOL", "list_rels_query", { entityId: entityId.slice(0, 16), resolvedFrom, direction: args.direction });
    const relationships = await storage.getRelationshipsForEntity(entityId);
    log.w("TOOL", "list_rels_result", {
      entityId: entityId.slice(0, 16),
      totalRels: relationships.length,
      sample: relationships
        .slice(0, 5)
        .map((r) => ({ from: r.fromId?.slice(0, 12), to: r.toId?.slice(0, 12), type: r.type })),
    });

    // Filter by direction
    let filtered = relationships;
    if (args.direction === "outgoing") {
      filtered = relationships.filter((r: Relationship) => r.fromId === entityId);
    } else if (args.direction === "incoming") {
      filtered = relationships.filter((r: Relationship) => r.toId === entityId);
    }

    // Filter by type
    if (args.relationshipTypes) {
      filtered = filtered.filter((r: Relationship) => args.relationshipTypes!.includes(r.type));
    }

    // Apply pagination
    const safeLimit = Math.min(args.limit, MAX_PAGE_SIZE);
    const paginatedResult = paginate(filtered, args.offset, safeLimit);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              entityId,
              count: paginatedResult.data.length,
              pagination: paginatedResult.pagination,
              relationships: paginatedResult.data,
            },
            null,
            2,
          ),
        },
      ],
    };
  }
}

// =============================================================================
// QUERY
// =============================================================================

const QuerySchema = z.object({
  query: z.string(),
  projectPath: projectPathParam,
  type: z.enum(["entities", "relationships", "both"]).optional().default("both"),
  offset: z.number().optional().default(0),
  limit: z.number().optional().default(DEFAULT_PAGE_SIZE),
});

export class QueryToolHandler extends BaseToolHandler<z.infer<typeof QuerySchema>> {
  protected parseArgs(args: unknown) {
    return QuerySchema.parse(args);
  }

  protected async execute(args: z.infer<typeof QuerySchema>): Promise<ToolResult> {
    // v3: Ensure correct project context for GraphStorage queries
    const storage = await this.ensureGraphStorageForProject(args.projectPath);
    const safeLimit = Math.min(args.limit, MAX_PAGE_SIZE);

    const results: QueryResults = {};
    const pagination: PaginationMapping = {};

    if (args.type === "entities" || args.type === "both") {
      // Fetch more than needed for pagination info
      const allEntities = await storage.searchEntities({
        namePattern: args.query,
        limit: 1000,
      });
      const paginatedEntities = paginate(allEntities, args.offset, safeLimit);
      results.entities = paginatedEntities.data as Entity[];
      pagination.entities = paginatedEntities.pagination;
    }

    if (args.type === "relationships" || args.type === "both") {
      const allRelationships = await storage.findRelationships({
        filters: {},
        limit: 1000,
      });
      const paginatedRelationships = paginate(allRelationships, args.offset, safeLimit);
      results.relationships = paginatedRelationships.data as Relationship[];
      pagination.relationships = paginatedRelationships.pagination;
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              query: args.query,
              entitiesFound: results.entities?.length || 0,
              relationshipsFound: results.relationships?.length || 0,
              pagination,
              results,
            },
            null,
            2,
          ),
        },
      ],
    };
  }
}
