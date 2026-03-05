/**
 * File Operations - Token-Efficient File Manipulation
 *
 * Provides high-level file operations for LLM agents:
 * - Copy: Duplicate files/directories
 * - Rename: Rename with automatic import updates
 * - Split: Extract entities to separate files
 * - Synthesize: Combine multiple files
 *
 * Features:
 * - Streaming for large files
 * - Automatic graph/embedding updates
 * - Preview mode for all operations
 *
 * Architecture References:
 * - Stream Helpers: src/utils/stream-helpers.ts
 * - Preview Manager: src/modification/preview-manager.ts
 */

import { dirname, extname, join } from "node:path";
import { nanoid } from "nanoid";
import { log } from "../logging/index.js";
import type { VectorStore } from "../semantic/vector-store.js";
import { type Entity, EntityType, type GraphStorage } from "../types/storage.js";
import { mkdir, readdir, readText, rm, stat, writeFile } from "../utils/file-ops.js";
import { streamCopyFile } from "../utils/stream-helpers.js";
import type { DiffPreview, PreviewManager } from "./preview-manager.js";

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

export interface FileOperationResult {
  success: boolean;
  filesAffected: string[];
  operation: "copy" | "rename" | "split" | "synthesize";
  preview?: DiffPreview;
  entitiesAffected?: number;
  embeddingsUpdated?: number;
}

export interface CopyOptions {
  preview?: boolean;
  updateGraph?: boolean;
}

export interface RenameOptions {
  preview?: boolean;
  updateImports?: boolean;
  updateGraph?: boolean;
}

export interface SplitOptions {
  preview?: boolean;
  updateGraph?: boolean;
}

export interface SynthesizeOptions {
  preview?: boolean;
  deleteOriginals?: boolean;
  updateGraph?: boolean;
}

// =============================================================================
// FILE OPERATIONS IMPLEMENTATION
// =============================================================================

export class FileOperations {
  constructor(
    private graphStorage: GraphStorage,
    private vectorStore: VectorStore | null,
    private previewManager: PreviewManager,
  ) {}

  /**
   * Copy file or directory (streaming for large files)
   */
  async copy(source: string, target: string, options: CopyOptions = {}): Promise<FileOperationResult> {
    const { preview = true, updateGraph = true } = options;

    // Preview mode
    if (preview) {
      const previewData = await this.previewManager.previewFileOperation("copy", { source, target });
      return {
        success: true,
        preview: previewData,
        filesAffected: [],
        operation: "copy",
      };
    }

    // Check if source is directory
    const stats = await stat(source);

    if (stats.isDirectory()) {
      return this.copyDirectory(source, target, updateGraph);
    } else {
      return this.copyFile(source, target, updateGraph);
    }
  }

  /**
   * Rename file with automatic import updates
   */
  async rename(oldPath: string, newPath: string, options: RenameOptions = {}): Promise<FileOperationResult> {
    const { preview = true, updateImports = true, updateGraph = true } = options;

    // Preview mode
    if (preview) {
      const previewData = await this.previewManager.previewFileOperation("rename", { oldPath, newPath });
      return {
        success: true,
        preview: previewData,
        filesAffected: [],
        operation: "rename",
      };
    }

    // Create parent directories
    await mkdir(dirname(newPath), { recursive: true });

    // Read file
    const content = await readText(oldPath);

    // Write to new location
    await writeFile(newPath, content);

    // Update graph
    let entitiesAffected = 0;
    if (updateGraph) {
      entitiesAffected = await this.updateFilePathInGraph(oldPath, newPath);
    }

    // Update embeddings
    let embeddingsUpdated = 0;
    if (updateGraph && this.vectorStore) {
      embeddingsUpdated = await this.updateEmbeddingsFilePath(oldPath, newPath);
    }

    // Update imports in other files
    if (updateImports) {
      await this.updateImportsAcrossProject(oldPath, newPath);
    }

    // Delete original file (after successful copy)
    await rm(oldPath);

    return {
      success: true,
      filesAffected: [oldPath, newPath],
      operation: "rename",
      entitiesAffected,
      embeddingsUpdated,
    };
  }

  /**
   * Split file into multiple files by entities
   */
  async split(filePath: string, entityIds: string[], options: SplitOptions = {}): Promise<FileOperationResult> {
    const { preview = true, updateGraph = true } = options;

    // Preview mode
    if (preview) {
      const previewData = await this.previewManager.previewFileOperation("split", { filePath, entityIds });
      return {
        success: true,
        preview: previewData,
        filesAffected: [],
        operation: "split",
      };
    }

    const entities = await Promise.all(entityIds.map((id) => this.graphStorage.getEntity(id)));
    const validEntities = entities.filter((e) => e !== null) as Entity[];

    const fileContent = await readText(filePath);
    const lines = fileContent.split("\n");
    const filesCreated: string[] = [];

    for (const entity of validEntities) {
      // Extract entity code
      const entityCode = lines.slice(entity.location.start.line - 1, entity.location.end.line).join("\n");

      // Determine new file path
      const newFilePath = join(dirname(filePath), `${entity.name}${extname(filePath)}`);

      // Write entity to new file
      await writeFile(newFilePath, entityCode, "utf-8");

      // Update graph
      if (updateGraph) {
        await this.graphStorage.updateEntity(entity.id, {
          filePath: newFilePath,
          location: {
            start: { line: 1, column: 0, index: 0 },
            end: { line: entityCode.split("\n").length, column: 0, index: entityCode.length },
          },
        });
      }

      filesCreated.push(newFilePath);
    }

    // Remove entities from original file
    await this.removeEntitiesFromFile(filePath, entityIds);

    return {
      success: true,
      filesAffected: [filePath, ...filesCreated],
      operation: "split",
      entitiesAffected: validEntities.length,
    };
  }

  /**
   * Synthesize multiple files into one
   */
  async synthesize(files: string[], targetPath: string, options: SynthesizeOptions = {}): Promise<FileOperationResult> {
    const { preview = true, deleteOriginals = false, updateGraph = true } = options;

    // Preview mode
    if (preview) {
      const previewData = await this.previewManager.previewFileOperation("synthesize", { files, targetPath });
      return {
        success: true,
        preview: previewData,
        filesAffected: [],
        operation: "synthesize",
      };
    }

    // Read all files and combine
    const contents: string[] = [];

    for (const file of files) {
      const content = await readText(file);
      contents.push(content);
    }

    const combined = contents.join("\n\n");

    // Create parent directories
    await mkdir(dirname(targetPath), { recursive: true });

    // Write combined file
    await writeFile(targetPath, combined, "utf-8");

    // Update graph: merge entities
    let entitiesAffected = 0;
    if (updateGraph) {
      entitiesAffected = await this.mergeEntitiesInGraph(files, targetPath);
    }

    // Update embeddings
    let embeddingsUpdated = 0;
    if (updateGraph && this.vectorStore) {
      embeddingsUpdated = await this.mergeEmbeddings(files, targetPath);
    }

    // Delete original files if requested
    if (deleteOriginals) {
      const { unlink } = await import("node:fs/promises");
      for (const file of files) {
        await unlink(file);
      }
    }

    return {
      success: true,
      filesAffected: [...files, targetPath],
      operation: "synthesize",
      entitiesAffected,
      embeddingsUpdated,
    };
  }

  // =============================================================================
  // PRIVATE: COPY OPERATIONS
  // =============================================================================

  private async copyFile(source: string, target: string, updateGraph: boolean): Promise<FileOperationResult> {
    // Create parent directories
    await mkdir(dirname(target), { recursive: true });

    // Stream copy
    const stats = await stat(source);

    if (stats.size > 1024 * 1024) {
      // Large file - streaming
      await streamCopyFile(source, target);
    } else {
      // Small file - direct copy (uses copyFile for Bun optimization)
      const { copyFile } = await import("../utils/file-ops.js");
      await copyFile(source, target);
    }

    // Update graph
    let entitiesAffected = 0;
    let embeddingsUpdated = 0;

    if (updateGraph) {
      entitiesAffected = await this.duplicateEntitiesInGraph(source, target);
      if (this.vectorStore) {
        embeddingsUpdated = await this.duplicateEmbeddings(source, target);
      }
    }

    return {
      success: true,
      filesAffected: [source, target],
      operation: "copy",
      entitiesAffected,
      embeddingsUpdated,
    };
  }

  private async copyDirectory(source: string, target: string, updateGraph: boolean): Promise<FileOperationResult> {
    const COPY_CONCURRENCY = 8; // Concurrency limit for file copying
    const operations = this;

    // Copy results
    interface CopyResult {
      filesAffected: string[];
      entitiesAffected: number;
      embeddingsUpdated: number;
    }

    async function walk(srcDir: string, destDir: string): Promise<CopyResult> {
      const entries = await readdir(srcDir, { withFileTypes: true });

      const files: Array<{ src: string; dest: string }> = [];
      const subdirPromises: Promise<CopyResult>[] = [];

      // First create directories and collect files
      for (const entry of entries) {
        const srcPath = join(srcDir, entry.name);
        const destPath = join(destDir, entry.name);

        if (entry.isDirectory()) {
          await mkdir(destPath, { recursive: true });
          // Recursively process subdirectories in parallel
          subdirPromises.push(walk(srcPath, destPath));
        } else {
          files.push({ src: srcPath, dest: destPath });
        }
      }

      // Copy files in parallel with concurrency limit
      const filesAffected: string[] = [];
      let entitiesAffected = 0;
      let embeddingsUpdated = 0;

      for (let i = 0; i < files.length; i += COPY_CONCURRENCY) {
        const chunk = files.slice(i, i + COPY_CONCURRENCY);
        const copyResults = await Promise.all(
          chunk.map(async ({ src, dest }) => operations.copyFile(src, dest, updateGraph)),
        );
        for (const result of copyResults) {
          filesAffected.push(...result.filesAffected);
          entitiesAffected += result.entitiesAffected || 0;
          embeddingsUpdated += result.embeddingsUpdated || 0;
        }
      }

      // Wait for results from all subdirectories
      if (subdirPromises.length > 0) {
        const subdirResults = await Promise.all(subdirPromises);
        for (const subResult of subdirResults) {
          filesAffected.push(...subResult.filesAffected);
          entitiesAffected += subResult.entitiesAffected;
          embeddingsUpdated += subResult.embeddingsUpdated;
        }
      }

      return { filesAffected, entitiesAffected, embeddingsUpdated };
    }

    const result = await walk(source, target);

    return {
      success: true,
      filesAffected: result.filesAffected,
      operation: "copy",
      entitiesAffected: result.entitiesAffected,
      embeddingsUpdated: result.embeddingsUpdated,
    };
  }

  // =============================================================================
  // PRIVATE: GRAPH UPDATES
  // =============================================================================

  private async updateFilePathInGraph(oldPath: string, newPath: string): Promise<number> {
    const entities = await this.graphStorage.findEntities({
      filters: { filePath: oldPath },
    });

    await Promise.all(entities.map((entity) => this.graphStorage.updateEntity(entity.id, { filePath: newPath })));

    return entities.length;
  }

  private async duplicateEntitiesInGraph(source: string, target: string): Promise<number> {
    const entities = await this.graphStorage.findEntities({
      filters: { filePath: source },
    });

    if (entities.length === 0) return 0;

    const now = Date.now();
    const newEntities = entities.map((entity) => ({
      ...entity,
      id: nanoid(),
      filePath: target,
      createdAt: now,
      updatedAt: now,
    }));

    await this.graphStorage.insertEntities(newEntities);

    return entities.length;
  }

  private async mergeEntitiesInGraph(files: string[], targetPath: string): Promise<number> {
    let totalEntities = 0;

    for (const file of files) {
      const entities = await this.graphStorage.findEntities({
        filters: { filePath: file },
      });

      await Promise.all(entities.map((entity) => this.graphStorage.updateEntity(entity.id, { filePath: targetPath })));

      totalEntities += entities.length;
    }

    return totalEntities;
  }

  // =============================================================================
  // PRIVATE: EMBEDDING UPDATES
  // =============================================================================

  private async updateEmbeddingsFilePath(_oldPath: string, _newPath: string): Promise<number> {
    // Note: VectorStore doesn't have a direct method to update filePath
    // In full implementation, would need to add this method to VectorStore
    // For now, return 0
    log.w("FILEOPS", "emb_path_not_impl");
    return 0;
  }

  private async duplicateEmbeddings(_source: string, _target: string): Promise<number> {
    // Note: Would need to implement in VectorStore
    log.w("FILEOPS", "emb_dup_not_impl");
    return 0;
  }

  private async mergeEmbeddings(_files: string[], _targetPath: string): Promise<number> {
    // Note: Would need to implement in VectorStore
    log.w("FILEOPS", "emb_merge_not_impl");
    return 0;
  }

  // =============================================================================
  // PRIVATE: IMPORT UPDATES
  // =============================================================================

  private async updateImportsAcrossProject(oldPath: string, newPath: string): Promise<void> {
    // Find all entities that import from oldPath
    const importers = await this.findImporters(oldPath);

    for (const importer of importers) {
      const content = await readText(importer.filePath);

      // Update import statements
      const updated = content.replace(new RegExp(`from ['"]${oldPath}['"]`, "g"), `from '${newPath}'`);

      await writeFile(importer.filePath, updated, "utf-8");
    }
  }

  private async findImporters(targetPath: string): Promise<Entity[]> {
    const allEntities = await this.graphStorage.findEntities({
      filters: { entityType: EntityType.IMPORT },
    });

    return allEntities.filter((entity) => entity.metadata.importData?.source === targetPath);
  }

  // =============================================================================
  // PRIVATE: FILE CONTENT MANIPULATION
  // =============================================================================

  private async removeEntitiesFromFile(filePath: string, entityIds: string[]): Promise<void> {
    const entities = await Promise.all(entityIds.map((id) => this.graphStorage.getEntity(id)));
    const validEntities = entities.filter((e) => e !== null) as Entity[];

    if (validEntities.length === 0) return;

    const content = await readText(filePath);
    const lines = content.split("\n");

    // Sort entities by line number (descending) to remove from bottom to top
    validEntities.sort((a, b) => b.location.start.line - a.location.start.line);

    // Remove entities
    for (const entity of validEntities) {
      lines.splice(entity.location.start.line - 1, entity.location.end.line - entity.location.start.line + 1);
    }

    await writeFile(filePath, lines.join("\n"), "utf-8");
  }
}
