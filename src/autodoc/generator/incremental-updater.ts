/**
 * Incremental Documentation Updater
 *
 * Intelligent documentation updates that:
 * 1. Generate from scratch when docs don't exist
 * 2. Update line numbers and file references when code moves
 * 3. Supplement docs when code is added (without deleting existing content)
 * 4. Mark deleted code in documentation with timestamp
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { getGraphStorage } from "../../storage/graph-storage-factory.js";
import type { Entity } from "../../types/storage.js";

// =============================================================================
// Types
// =============================================================================

export interface DocReference {
  /** Original text in doc (e.g., "src/utils/file.ts:42") */
  original: string;
  /** File path */
  filePath: string;
  /** Line number (if present) */
  lineNumber?: number | undefined;
  /** Entity name (if referenced) */
  entityName?: string;
  /** Position in doc content */
  startIndex: number;
  endIndex: number;
}

export interface CodeChange {
  type: "added" | "modified" | "deleted" | "moved";
  entityId?: string | undefined;
  entityName: string;
  entityType: string;
  filePath: string;
  oldFilePath?: string;
  oldLineNumber?: number;
  newLineNumber?: number;
  timestamp: Date;
}

export interface DocSection {
  /** Section title (e.g., "## Exports") */
  title: string;
  /** Section content */
  content: string;
  /** Start line in doc */
  startLine: number;
  /** End line in doc */
  endLine: number;
  /** Related entities */
  relatedEntities: string[];
}

export interface UpdateResult {
  /** Path to documentation file */
  docPath: string;
  /** Whether doc was updated */
  updated: boolean;
  /** Changes made */
  changes: Array<{
    type: "reference_updated" | "content_added" | "content_marked_deleted" | "created_new";
    description: string;
  }>;
  /** New content (if updated) */
  newContent?: string;
}

// =============================================================================
// Reference Extraction
// =============================================================================

/**
 * Extract all code references from documentation content
 * Matches patterns like:
 * - `src/file.ts:42`
 * - [link](src/file.ts#L42)
 * - `ClassName` (entity references)
 */
export function extractReferences(content: string): DocReference[] {
  const refs: DocReference[] = [];

  // Pattern 1: file.ts:lineNumber in backticks or plain text
  const fileLinePattern =
    /(?:`([^`]+\.(?:ts|js|tsx|jsx|py|go|rs|java|kt|swift|cpp|c|h)):(\d+)`|([a-zA-Z0-9_\-/.]+\.(?:ts|js|tsx|jsx|py|go|rs|java|kt|swift|cpp|c|h)):(\d+))/g;
  let match: RegExpExecArray | null;
  while ((match = fileLinePattern.exec(content)) !== null) {
    const filePath = match[1] || match[3];
    const lineNum = match[2] || match[4];
    if (filePath && lineNum) {
      refs.push({
        original: match[0],
        filePath,
        lineNumber: parseInt(lineNum, 10),
        startIndex: match.index,
        endIndex: match.index + match[0].length,
      });
    }
  }

  // Pattern 2: Markdown links with line anchors [text](path#L42)
  const mdLinkPattern = /\[([^\]]+)\]\(([^)]+\.(?:ts|js|tsx|jsx|py|go|rs|java|kt|swift|cpp|c|h))(?:#L(\d+))?\)/g;
  while ((match = mdLinkPattern.exec(content)) !== null) {
    const mdFilePath = match[2];
    if (mdFilePath) {
      refs.push({
        original: match[0],
        filePath: mdFilePath,
        lineNumber: match[3] ? parseInt(match[3], 10) : undefined,
        startIndex: match.index,
        endIndex: match.index + match[0].length,
      });
    }
  }

  return refs;
}

/**
 * Extract sections from markdown content
 */
export function extractSections(content: string): DocSection[] {
  const lines = content.split("\n");
  const sections: DocSection[] = [];
  let currentSection: DocSection | null = null;
  let contentLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? "";
    const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);

    if (headerMatch?.[2]) {
      // Save previous section
      if (currentSection) {
        currentSection.content = contentLines.join("\n");
        currentSection.endLine = i - 1;
        sections.push(currentSection);
      }

      // Start new section
      currentSection = {
        title: headerMatch[2],
        content: "",
        startLine: i,
        endLine: i,
        relatedEntities: [],
      };
      contentLines = [];
    } else if (currentSection) {
      contentLines.push(line);

      // Extract entity references from content
      const entityRefs = line.match(/`([A-Z][a-zA-Z0-9_]+)`/g);
      if (entityRefs) {
        for (const ref of entityRefs) {
          const name = ref.slice(1, -1);
          if (!currentSection.relatedEntities.includes(name)) {
            currentSection.relatedEntities.push(name);
          }
        }
      }
    }
  }

  // Save last section
  if (currentSection) {
    currentSection.content = contentLines.join("\n");
    currentSection.endLine = lines.length - 1;
    sections.push(currentSection);
  }

  return sections;
}

// =============================================================================
// Change Detection
// =============================================================================

/**
 * Detect changes between code and existing documentation
 */
export async function detectChanges(
  modulePath: string,
  existingDoc: string,
  currentEntities: Entity[],
): Promise<CodeChange[]> {
  const changes: CodeChange[] = [];
  const refs = extractReferences(existingDoc);
  const sections = extractSections(existingDoc);

  // Get entity names mentioned in docs
  const documentedEntities = new Set<string>();
  for (const section of sections) {
    for (const entity of section.relatedEntities) {
      documentedEntities.add(entity);
    }
  }

  // Also extract from backticks in content
  const entityPattern = /`([A-Z][a-zA-Z0-9_]+)`/g;
  let match: RegExpExecArray | null;
  while ((match = entityPattern.exec(existingDoc)) !== null) {
    if (match[1]) {
      documentedEntities.add(match[1]);
    }
  }

  // Check for added entities (in code but not in docs)
  for (const entity of currentEntities) {
    if (!documentedEntities.has(entity.name)) {
      changes.push({
        type: "added",
        entityId: entity.id,
        entityName: entity.name,
        entityType: entity.type,
        filePath: entity.filePath,
        newLineNumber: entity.location?.start?.line,
        timestamp: new Date(),
      });
    }
  }

  // Check for deleted entities (in docs but not in code)
  const currentEntityNames = new Set(currentEntities.map((e) => e.name));
  for (const docEntity of documentedEntities) {
    if (!currentEntityNames.has(docEntity)) {
      changes.push({
        type: "deleted",
        entityName: docEntity,
        entityType: "unknown",
        filePath: modulePath,
        timestamp: new Date(),
      });
    }
  }

  // Check for moved/modified references (line numbers changed)
  for (const ref of refs) {
    if (ref.lineNumber && ref.entityName) {
      const entity = currentEntities.find((e) => e.name === ref.entityName);
      if (entity && entity.location?.start?.line !== ref.lineNumber) {
        changes.push({
          type: "moved",
          entityId: entity.id,
          entityName: entity.name,
          entityType: entity.type,
          filePath: entity.filePath,
          oldLineNumber: ref.lineNumber,
          newLineNumber: entity.location?.start?.line,
          timestamp: new Date(),
        });
      }
    }
  }

  return changes;
}

// =============================================================================
// Reference Updating
// =============================================================================

/**
 * Update file references and line numbers in documentation
 */
export function updateReferences(content: string, changes: CodeChange[]): string {
  let updated = content;

  // Build line number updates map
  const lineUpdates = new Map<string, { old: number; new: number }>();
  for (const change of changes) {
    if (change.type === "moved" && change.oldLineNumber && change.newLineNumber) {
      const key = `${change.filePath}:${change.oldLineNumber}`;
      lineUpdates.set(key, { old: change.oldLineNumber, new: change.newLineNumber });
    }
  }

  // Update file:line references
  const fileLinePattern = /(`[^`]+\.(?:ts|js|tsx|jsx)):(\d+)`/g;
  updated = updated.replace(fileLinePattern, (match, filePart, lineNum) => {
    const line = parseInt(lineNum, 10);
    // Find if this line was moved
    for (const [key, update] of lineUpdates) {
      if (key.endsWith(`:${line}`)) {
        return `${filePart}:${update.new}\``;
      }
    }
    return match;
  });

  // Update markdown link anchors
  const mdLinkPattern = /(\[[^\]]+\]\([^)]+\.(?:ts|js|tsx|jsx))#L(\d+)\)/g;
  updated = updated.replace(mdLinkPattern, (match, linkPart, lineNum) => {
    const line = parseInt(lineNum, 10);
    for (const [key, update] of lineUpdates) {
      if (key.endsWith(`:${line}`)) {
        return `${linkPart}#L${update.new})`;
      }
    }
    return match;
  });

  return updated;
}

// =============================================================================
// Content Merging
// =============================================================================

/**
 * Merge new documentation content with existing, preserving user edits
 */
export function mergeWithExisting(existingContent: string, newContent: string, changes: CodeChange[]): string {
  const existingSections = extractSections(existingContent);
  const newSections = extractSections(newContent);

  // Build result by merging sections
  const result: string[] = [];
  const processedNewSections = new Set<string>();

  for (const existingSection of existingSections) {
    // Find corresponding new section
    const newSection = newSections.find((s) => s.title === existingSection.title);

    if (newSection) {
      processedNewSections.add(newSection.title);

      // Keep existing section but append new entities
      const addedEntities = changes.filter((c) => c.type === "added").map((c) => c.entityName);

      if (addedEntities.length > 0 && existingSection.title.toLowerCase().includes("export")) {
        // Append new exports to existing section
        result.push(`## ${existingSection.title}`);
        result.push(existingSection.content);
        result.push("");
        result.push("### Added");
        result.push("");
        for (const entity of addedEntities) {
          result.push(`- \`${entity}\` *(added ${new Date().toISOString().split("T")[0]})*`);
        }
        result.push("");
      } else {
        // Keep existing content as-is
        result.push(`## ${existingSection.title}`);
        result.push(existingSection.content);
      }
    } else {
      // Section only in existing - keep it
      result.push(`## ${existingSection.title}`);
      result.push(existingSection.content);
    }
  }

  // Add new sections that don't exist in original
  for (const newSection of newSections) {
    if (!processedNewSections.has(newSection.title)) {
      const existsInOriginal = existingSections.some((s) => s.title === newSection.title);
      if (!existsInOriginal) {
        result.push("");
        result.push(`## ${newSection.title}`);
        result.push(newSection.content);
      }
    }
  }

  return result.join("\n");
}

/**
 * Mark deleted entities in documentation
 */
export function markDeleted(content: string, deletedEntities: CodeChange[]): string {
  if (deletedEntities.length === 0) return content;

  let updated = content;

  // Add "Deprecated/Deleted" section if not exists
  if (!updated.includes("## Deprecated") && !updated.includes("## Deleted")) {
    const timestamp = new Date().toISOString().split("T")[0];
    const deletedSection = ["", "## Deleted", "", "*The following items were removed from the codebase:*", ""];

    for (const deleted of deletedEntities) {
      deletedSection.push(`- ~~\`${deleted.entityName}\`~~ *(removed ${timestamp})*`);
    }

    deletedSection.push("");
    updated += deletedSection.join("\n");
  } else {
    // Append to existing Deleted section
    const timestamp = new Date().toISOString().split("T")[0];
    const insertPoint = updated.indexOf("## Deleted");
    if (insertPoint !== -1) {
      const afterHeader = updated.indexOf("\n\n", insertPoint) + 2;
      const newItems = deletedEntities.map((d) => `- ~~\`${d.entityName}\`~~ *(removed ${timestamp})*`).join("\n");
      updated = updated.slice(0, afterHeader) + newItems + "\n" + updated.slice(afterHeader);
    }
  }

  // Also strike through references in other sections
  for (const deleted of deletedEntities) {
    const pattern = new RegExp(`\`${deleted.entityName}\`(?![^~]*~~)`, "g");
    updated = updated.replace(pattern, `~~\`${deleted.entityName}\`~~`);
  }

  return updated;
}

// =============================================================================
// Main Update Function
// =============================================================================

/**
 * Incrementally update documentation for a module
 */
export async function updateModuleDoc(
  modulePath: string,
  docPath: string,
  newContent: string,
  options: {
    useLlm?: boolean | undefined;
    llmEnhancer?: ((content: string, changes: CodeChange[]) => Promise<string>) | undefined;
  } = {},
): Promise<UpdateResult> {
  const result: UpdateResult = {
    docPath,
    updated: false,
    changes: [],
  };

  // Check if doc exists
  const docExists = existsSync(docPath);

  if (!docExists) {
    // Case 1: No existing doc - generate from scratch
    result.updated = true;
    result.newContent = newContent;
    result.changes.push({
      type: "created_new",
      description: "Created new documentation file",
    });
    return result;
  }

  // Read existing doc
  const existingContent = readFileSync(docPath, "utf-8");

  // Get current entities from graph storage (search by directory)
  const storage = await getGraphStorage();
  const currentEntities = await storage.searchEntitiesInDirectory(modulePath);

  // Detect changes
  const changes = await detectChanges(modulePath, existingContent, currentEntities);

  if (changes.length === 0) {
    // No changes detected
    return result;
  }

  let updatedContent = existingContent;

  // Case 2: Update references (line numbers, file paths)
  const movedChanges = changes.filter((c) => c.type === "moved");
  if (movedChanges.length > 0) {
    updatedContent = updateReferences(updatedContent, movedChanges);
    result.changes.push({
      type: "reference_updated",
      description: `Updated ${movedChanges.length} line/file references`,
    });
  }

  // Case 3: Add new content for added entities
  const addedChanges = changes.filter((c) => c.type === "added");
  if (addedChanges.length > 0) {
    updatedContent = mergeWithExisting(updatedContent, newContent, addedChanges);
    result.changes.push({
      type: "content_added",
      description: `Added documentation for ${addedChanges.length} new entities: ${addedChanges.map((c) => c.entityName).join(", ")}`,
    });
  }

  // Case 4: Mark deleted entities
  const deletedChanges = changes.filter((c) => c.type === "deleted");
  if (deletedChanges.length > 0) {
    updatedContent = markDeleted(updatedContent, deletedChanges);
    result.changes.push({
      type: "content_marked_deleted",
      description: `Marked ${deletedChanges.length} deleted entities: ${deletedChanges.map((c) => c.entityName).join(", ")}`,
    });
  }

  // Optional: LLM enhancement for added content
  if (options.useLlm && options.llmEnhancer && addedChanges.length > 0) {
    updatedContent = await options.llmEnhancer(updatedContent, addedChanges);
  }

  if (updatedContent !== existingContent) {
    result.updated = true;
    result.newContent = updatedContent;
  }

  return result;
}

/**
 * Batch update all module docs in a directory
 */
export async function updateAllModuleDocs(
  rootDir: string,
  options: {
    preview?: boolean;
    useLlm?: boolean | undefined;
    llmEnhancer?: ((content: string, changes: CodeChange[]) => Promise<string>) | undefined;
  } = {},
): Promise<UpdateResult[]> {
  const results: UpdateResult[] = [];

  // Import dynamically to avoid circular deps
  const { scanModules, generateModuleReadme } = await import("./doc-generator.js");

  const modules = await scanModules(rootDir);

  for (const mod of modules) {
    const docPath = path.join(mod.path, "AUTODOC.md");
    const newContent = generateModuleReadme(mod);

    const result = await updateModuleDoc(mod.path, docPath, newContent, {
      ...(options.useLlm != null ? { useLlm: options.useLlm } : {}),
      ...(options.llmEnhancer != null ? { llmEnhancer: options.llmEnhancer } : {}),
    });

    if (result.updated && !options.preview && result.newContent) {
      writeFileSync(docPath, result.newContent, "utf-8");
    }

    results.push(result);
  }

  return results;
}
