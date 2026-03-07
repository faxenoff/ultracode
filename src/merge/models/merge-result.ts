import type { CodeUnit } from "./code-unit.js";
import type { SemanticConflict } from "./semantic-conflict.js";
import type { VersionedIndex } from "./versioned-index.js";

/**
 * Типы merge actions
 */
export type MergeActionType =
  | "auto-merge" // Автоматический merge (идентичные изменения)
  | "manual-review" // Требуется ручной review
  | "add-from-branchA" // Добавить новый файл из branchA
  | "add-from-branchB" // Добавить новый файл из branchB
  | "delete-from-branchA" // Удалить файл (удалён в branchA)
  | "delete-from-branchB" // Удалить файл (удалён в branchB)
  | "rename" // Файл переименован
  | "conflict-delete-modify"; // Конфликт: удалён в одной ветке, изменён в другой

/**
 * Действие merge для отдельного unit
 */
export interface MergeAction {
  type: MergeActionType;
  unitId: string;
  description: string;

  /** Merged unit (для auto-merge) */
  mergedUnit?: CodeUnit;

  /** Конфликт (для manual-review) */
  conflict?: SemanticConflict | undefined;

  /** Source branch для add actions */
  sourceBranch?: "branchA" | "branchB";

  /** Информация о rename */
  renameInfo?: {
    oldPath: string;
    newPath: string;
    sourceBranch: "branchA" | "branchB";
  };
}

/**
 * Статистика merge
 */
export interface MergeStats {
  totalUnitsInBase: number;
  totalUnitsInA: number;
  totalUnitsInB: number;
  matchedCount: number;
  conflictCount: number;
  autoMergedCount: number;
  manualReviewCount: number;
  addedFromACount: number;
  addedFromBCount: number;
  deletedCount: number;
  renamedCount: number;
  mergeTimeMs: number;
}

/**
 * Результат 3-way merge
 */
export interface MergeResult {
  branchA: string;
  branchB: string;
  mergeBase: string;

  baseIndex: VersionedIndex;
  branchAIndex: VersionedIndex;
  branchBIndex: VersionedIndex;

  /** Matched units между ветками */
  matchedUnits: Array<{
    baseUnit: CodeUnit | null;
    branchAUnit: CodeUnit;
    branchBUnit: CodeUnit;
  }>;

  /** Units добавленные только в branchA */
  addedInA: CodeUnit[];

  /** Units добавленные только в branchB */
  addedInB: CodeUnit[];

  /** Units удалённые (есть в base, но нет в одной из веток) */
  deletedUnits: Array<{
    baseUnit: CodeUnit;
    deletedIn: "branchA" | "branchB";
    modifiedIn?: "branchA" | "branchB" | undefined; // Для conflict-delete-modify
  }>;

  /** Переименованные файлы */
  renamedUnits: Array<{
    oldPath: string;
    newPath: string;
    unit: CodeUnit;
    branch: "branchA" | "branchB";
  }>;

  /** Обнаруженные конфликты */
  conflicts: SemanticConflict[];

  /** Actions для выполнения merge */
  mergeActions: MergeAction[];

  stats: MergeStats;
}
