/**
 * Code Modifier - Entity-based Code Replacement
 *
 * Provides safe code modification with:
 * - Version snapshots before changes
 * - Preview before applying
 * - Automatic validation (before/after)
 * - Incremental embedding updates
 * - Streaming for large files
 *
 * Architecture References:
 * - Version Manager: src/versioning/version-manager.ts
 * - Preview Manager: src/modification/preview-manager.ts
 * - Code Validator: src/validation/code-validator.ts
 * - Stream Helpers: src/utils/stream-helpers.ts
 */

import { log } from "../logging/index.js";
import { EmbeddingGenerator } from "../semantic/embedding-generator.js";
import type { VectorStore } from "../semantic/vector-store.js";
import type { Entity, GraphStorage } from "../types/storage.js";
import { readText, stat, writeFile } from "../utils/file-ops.js";
import { streamReplaceRange } from "../utils/stream-helpers.js";
import { type BeforeAfterReport, CodeValidator } from "../validation/code-validator.js";
import { VersionManager } from "../versioning/version-manager.js";
import { type DiffPreview, PreviewManager } from "./preview-manager.js";

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

export interface CodeModificationRequest {
  entityId: string; // Entity ID from graph
  newCode: string; // New code for replacement
  preserveComments?: boolean; // Preserve comments
  updateImports?: boolean; // Update imports if signature changed
  preview?: boolean; // Preview mode (default: true)
  skipValidation?: boolean; // Skip validation
}

export interface CodeModificationResult {
  success: boolean;
  filesModified: string[];
  entitiesUpdated: string[];
  embeddingsUpdated: number;
  relationshipsUpdated: number;
  preview?: DiffPreview | undefined; // If preview: true
  validationReport?: BeforeAfterReport | undefined; // Auto-validation
  snapshotId?: string | undefined; // Snapshot ID for rollback
  swaggerWarning?: string | undefined; // Warning if entity is related to swagger contract
}

// =============================================================================
// CODE MODIFIER IMPLEMENTATION
// =============================================================================

export class CodeModifier {
  private versionManager: VersionManager;
  private previewManager: PreviewManager;
  private validator: CodeValidator;

  constructor(
    private graphStorage: GraphStorage,
    private vectorStore: VectorStore | null,
    workingDirectory: string,
  ) {
    this.versionManager = new VersionManager({ workingDirectory });
    this.previewManager = new PreviewManager(graphStorage, vectorStore);
    this.validator = new CodeValidator();
  }

  /**
   * Initialize Code Modifier
   */
  async initialize(): Promise<void> {
    await this.versionManager.initialize();
    await this.previewManager.initialize();
    log.i("CODEMOD", "init");
  }

  /**
   * Modify entity code
   */
  async modifyEntity(request: CodeModificationRequest): Promise<CodeModificationResult> {
    // Phase 1: Preview mode (if enabled)
    if (request.preview !== false) {
      const preview = await this.previewManager.previewCodeModification(request.entityId, request.newCode);

      return {
        success: true,
        preview,
        filesModified: [],
        entitiesUpdated: [],
        embeddingsUpdated: 0,
        relationshipsUpdated: 0,
      };
    }

    // Phase 2: Get entity from graph
    const entity = await this.graphStorage.getEntity(request.entityId);
    if (!entity) {
      throw new Error(`Entity ${request.entityId} not found`);
    }

    // Phase 3: Create snapshot
    const snapshotId = await this.versionManager.createSnapshot(`code-modification-${request.entityId}`, [
      entity.filePath,
    ]);

    log.i("CODEMOD", "snapshot_created", { id: snapshotId });

    try {
      // Phase 4: Validation BEFORE modification
      let beforeValidation: BeforeAfterReport["before"] | undefined;
      if (!request.skipValidation) {
        beforeValidation = await this.validator.validateFile(entity.filePath);
        log.i("CODEMOD", "validate_before", {
          errors: beforeValidation.summary.errors,
          warnings: beforeValidation.summary.warnings,
        });
      }

      // Phase 5: Modify file
      await this.replaceEntityCode(entity, request.newCode, request.preserveComments);

      // Phase 6: Update entity in graph
      await this.updateEntityInGraph(entity, request.newCode);

      // Phase 7: Update embedding (incremental)
      const embeddingUpdated = await this.updateEntityEmbedding(entity, request.newCode);

      // Phase 8: Update relationships (if imports changed)
      const relationshipsUpdated = request.updateImports ? await this.updateRelationships(entity) : 0;

      // Phase 9: Validation AFTER modification
      let validationReport: BeforeAfterReport | undefined;
      if (!request.skipValidation && beforeValidation) {
        const afterValidation = await this.validator.validateFile(entity.filePath);
        const improvement = this.validator["compareReports"](beforeValidation, afterValidation);

        validationReport = {
          before: beforeValidation,
          after: afterValidation,
          improvement,
        };

        log.i("CODEMOD", "validate_after", {
          errors: afterValidation.summary.errors,
          warnings: afterValidation.summary.warnings,
          net: improvement.netChange,
        });
      }

      // Phase 10: Swagger contract check
      let swaggerWarning: string | undefined;
      try {
        const rels = await this.graphStorage.getRelationshipsForEntity(entity.id);
        const hasProducesApi = rels.some(
          (r: { type: string; fromId: string }) => r.type === "produces_api" && r.fromId === entity.id,
        );
        const hasGeneratedFrom = rels.some(
          (r: { type: string; fromId: string }) => r.type === "generated_from" && r.fromId === entity.id,
        );

        if (hasProducesApi) {
          swaggerWarning = "This entity produces an API contract — swagger spec may need updating";
        } else if (hasGeneratedFrom) {
          swaggerWarning =
            "This file is generated from swagger — manual changes will be overwritten on next generation";
        }
      } catch {
        // Swagger check is non-critical — skip on error
      }

      return {
        success: true,
        filesModified: [entity.filePath],
        entitiesUpdated: [entity.id],
        embeddingsUpdated: embeddingUpdated ? 1 : 0,
        relationshipsUpdated,
        validationReport,
        snapshotId,
        swaggerWarning,
      };
    } catch (error) {
      // Rollback on error
      log.e("CODEMOD", "mod_fail_rollback", { err: String(error) });
      await this.versionManager.rollback(snapshotId);
      throw error;
    }
  }

  /**
   * Rollback to snapshot
   */
  async rollback(snapshotId: string): Promise<void> {
    await this.versionManager.rollback(snapshotId);
    log.i("CODEMOD", "rollback_done", { id: snapshotId });
  }

  // =============================================================================
  // PRIVATE: FILE MODIFICATION
  // =============================================================================

  /**
   * Replace entity code in file (streaming for large files)
   */
  private async replaceEntityCode(entity: Entity, newCode: string, preserveComments = true): Promise<void> {
    const filePath = entity.filePath;
    const { start, end } = entity.location;

    // Check file size
    const stats = await stat(filePath);

    if (stats.size < 1024 * 1024) {
      // Small file (<1MB) - in-memory replacement
      await this.replaceInMemory(filePath, start.line, end.line, newCode, preserveComments);
    } else {
      // Large file (>1MB) - streaming replacement
      await streamReplaceRange(filePath, start.line, end.line, newCode, { encoding: "utf-8" });
    }
  }

  /**
   * In-memory replacement for small files
   */
  private async replaceInMemory(
    filePath: string,
    startLine: number,
    endLine: number,
    newCode: string,
    preserveComments: boolean,
  ): Promise<void> {
    const content = await readText(filePath);
    const lines = content.split("\n");

    // Extract comments if preserving
    let leadingComments = "";
    if (preserveComments) {
      // Look for comments before entity (lines starting with //, /*, etc.)
      let commentStart = startLine - 1;
      while (commentStart > 0) {
        const line = lines[commentStart - 1]?.trim() || "";
        if (line.startsWith("//") || line.startsWith("/*") || line.startsWith("*")) {
          commentStart--;
        } else {
          break;
        }
      }

      if (commentStart < startLine - 1) {
        leadingComments = lines.slice(commentStart, startLine - 1).join("\n") + "\n";
      }
    }

    // Replace lines
    const before = lines.slice(0, startLine - 1).join("\n");
    const after = lines.slice(endLine).join("\n");

    const updated = `${before}\n${leadingComments}${newCode}\n${after}`;

    await writeFile(filePath, updated, "utf-8");
  }

  // =============================================================================
  // PRIVATE: GRAPH AND EMBEDDING UPDATES
  // =============================================================================

  /**
   * Update entity in graph
   */
  private async updateEntityInGraph(entity: Entity, newCode: string): Promise<void> {
    // Compute new hash for entity
    const xxhash = await import("xxhash-wasm");
    const xxhashInstance = await xxhash.default();
    const newHash = xxhashInstance.h64ToString(newCode).slice(0, 16);

    // Update entity
    await this.graphStorage.updateEntity(entity.id, {
      hash: newHash,
      updatedAt: Date.now(),
    });
  }

  /**
   * Update entity embedding (incremental)
   */
  private async updateEntityEmbedding(entity: Entity, newCode: string): Promise<boolean> {
    if (!this.vectorStore) {
      log.w("CODEMOD", "no_vectorstore");
      return false;
    }

    try {
      // Extract and enhance with comments
      const { CommentExtractor } = await import("../utils/comment-extractor.js");

      const fileContent = await readText(entity.filePath);
      const commentsResult = CommentExtractor.extractComments(fileContent, entity.filePath);

      // Entity from storage is compatible with ParsedEntity structure
      const parsedEntity = entity as unknown as import("../types/parser.js").ParsedEntity;
      const associations = CommentExtractor.associateCommentsWithEntities(
        commentsResult.comments,
        [parsedEntity],
        commentsResult.leadingComments,
      );

      const entityComments = associations.get(entity.id) || [];
      const enhancedContent = CommentExtractor.enhanceEntityContentWithComments(
        newCode,
        `${entity.type} ${entity.name}`,
        entityComments,
      );

      // Generate new embedding
      const generator = new EmbeddingGenerator();
      await generator.initialize();
      const embedding = await generator.generateCodeEmbedding(enhancedContent, entity.language);

      // Update embedding in vector store
      await this.vectorStore.update(entity.id, embedding, {
        entityId: entity.id,
        entityType: entity.type,
        filePath: entity.filePath,
        name: entity.name,
        updatedAt: Date.now(),
      });

      log.i("CODEMOD", "embedding_updated", { entityId: entity.id });
      await generator.cleanup();
      return true;
    } catch (error) {
      log.e("CODEMOD", "embedding_fail", { err: String(error) });
      return false;
    }
  }

  /**
   * Update relationships (if signature changed)
   */
  private async updateRelationships(entity: Entity): Promise<number> {
    // Check if signature changed by re-parsing
    try {
      const { IncrementalParser } = await import("../parsers/incremental-parser.js");
      const parser = new IncrementalParser();
      await parser.initialize();

      const content = await readText(entity.filePath);
      const parseResult = await parser.parseFile(entity.filePath, content);

      // Find updated entity
      const updatedEntity = parseResult.entities.find((e) => e.name === entity.name && e.type === entity.type);

      if (!updatedEntity) {
        return 0;
      }

      // Compare signatures
      const oldSignature = entity.metadata.signature || "";
      const newSignature = updatedEntity.signature || "";

      if (oldSignature === newSignature) {
        return 0; // No change
      }

      // Signature changed - update relationships
      const relationships = await this.graphStorage.getRelationshipsForEntity(entity.id);

      log.i("CODEMOD", "sig_changed", { rels: relationships.length });

      // For now, just return count
      // In full implementation, would update import statements in dependent files
      return relationships.length;
    } catch (error) {
      log.e("CODEMOD", "rel_update_fail", { err: String(error) });
      return 0;
    }
  }
}
