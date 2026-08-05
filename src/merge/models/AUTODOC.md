# Models

## 🤖 Overview

The `merge/models` module provides a framework for semantic code merge, focusing on classifying change intents and managing versioned code indices. Developers and code reviewers use this module to analyze and resolve conflicts in code changes, ensuring accurate and efficient merging of code versions.

## 🤖 Architecture

```
  +---------------------+
  |     ChangeIntent    |
  +---------------------+
          | 
          v
  +---------------------+
  |   ChangeEvidence    |
  +---------------------+
          |
          v
  +---------------------+
  |   CodeUnit          |
  +---------------------+
          |
          v
  +---------------------+
  | VersionedIndex      |
  +---------------------+
          |
          v
  +---------------------+
  | MergeResult         |
  +---------------------+
          |
          v
  +---------------------+
  | SemanticConflict    |
  +---------------------+
```

## 🤖 Flow

```
  +---------------------+
  |     ChangeIntent    |
  +---------------------+
          | 
          v
  +---------------------+
  |   ChangeEvidence    |
  +---------------------+
          |
          v
  +---------------------+
  |   CodeUnit          |
  +---------------------+
          |
          v
  +---------------------+
  | VersionedIndex      |
  +---------------------+
          |
          v
  +----------------
  | MergeResult     |
  +----------------+
          |
          v
  +----------------+
  | SemanticConflict|
  +----------------+
```

## 🤖 Entity Listing

### Function
- **addToMultiMap** — Adds a value to a map, ensuring the key exists and the value is pushed to the corresponding array `versioned-index.ts:113-118`
- **addUnitToIndex** — Добавить CodeUnit в индекс (обновляет все lookup таблицы) `versioned-index.ts:58-77`
- **createAPIBreakingConflict** — Создать конфликт с API-разрывом `semantic-conflict.ts:138-156`
- **createAPIChangeIntent** — Создать намерение изменения — изменение API/сигнатуры `change-intent.ts:104-111`
- **createBugFixIntent** — Создать намерение изменения — исправление бага `change-intent.ts:68-75`
- **createFeatureAdditionIntent** — Создать намерение изменения — добавление новой функциональности `change-intent.ts:92-99`
- **createIncompatibleIntentsConflict** — Создать конфликт с несовместимыми намерениями `semantic-conflict.ts:111-133`
- **createOverlappingConflict** — Создать конфликт с пересекающимися изменениями `semantic-conflict.ts:88-106`
- **createRefactoringIntent** — Создать намерение изменения — рефакторинг без изменения логики `change-intent.ts:80-87`
- **createUnknownIntent** — Создать намерение изменения — неизвестное намерение `change-intent.ts:116-123`
- **createVersionedIndex** — Создать пустой индекс для ветки `versioned-index.ts:36-53`
- **findByContentHash** — Найти units по contentHash (Fast Path Level 1) `versioned-index.ts:82-85`
- **findByFilePath** — Returns an array of CodeUnit instances based on a file path `versioned-index.ts:106-109`
- **findBySignature** — Returns an array of CodeUnit instances based on a signature `versioned-index.ts:98-101`
- **findByStructuralHash** — Returns an array of CodeUnit instances based on a structural hash `versioned-index.ts:90-93`
- **incrementMapValue** — Increments the value associated with a key in a map `versioned-index.ts:120-122`

### Interface
- **ChangeEvidence** — Доказательство для классификации намерения `change-intent.ts:32-37`
- **ChangeIntent** — Детали намерения изменения `change-intent.ts:22-27`
- **CodeStructure** — Represents structural metadata of an AST `code-unit.ts:60-71`
- **CodeUnit** — Универсальная единица кода для semantic merge `code-unit.ts:9-40`
- **ConflictRegion** — Регион кода, где возник конфликт `semantic-conflict.ts:60-66`
- **MergeAction** — Действие merge для отдельного unit `merge-result.ts:21-41`
- **MergeResult** — Результат 3-way merge `merge-result.ts:64-108`
- **MergeStats** — Статистика merge `merge-result.ts:46-59`
- **Resolution** — Предложенное решение конфликта `semantic-conflict.ts:71-76`
- **SemanticConflict** — Конфликт между двумя версиями unit `semantic-conflict.ts:30-55`
- **VersionedIndex** — Индекс для одной версии кода (base/branchA/branchB), содержащий все CodeUnit для версии плюс оптимизированные lookup индексы для Fast Path matching `versioned-index.ts:9-31`

### Enum_decl
- **ChangeIntentType** — Определяет, какую цель преследовало изменение кода `change-intent.ts:11-17`
- **CodeUnitType** — Типы кодовых единиц `code-unit.ts:45-55`
- **ConflictSeverity** — Определяет уровень тяжести конфликта `semantic-conflict.ts:11-16`
- **ConflictType** — Определяет тип конфликта `semantic-conflict.ts:18-25`
- **EvidenceType** — Тип доказательства `change-intent.ts:39-63`
- **ResolutionStrategy** — Стратегия решения конфликта `semantic-conflict.ts:78-83`

### Constant
- **AddedNullCheck** — Добавлены проверки на null `change-intent.ts:43-43`
- **AddedTryCatch** — Добавлен try-catch блок `change-intent.ts:41-41`
- **AddedValidation** — Добавлены проверки `change-intent.ts:42-42`
- **APIBreakingChange** — Breaking change в API `semantic-conflict.ts:21-21`
- **APIChange** — Изменение API/сигнатуры `change-intent.ts:15-15`
- **Block** — Represents a block of code within a code unit `code-unit.ts:53-53`
- **BugFix** — Исправление бага `change-intent.ts:12-12`
- **CFGPreserved** — Control Flow Graph не изменился `change-intent.ts:50-50`
- **Class** — Тип кодовой единицы `code-unit.ts:48-48`
- **Critical** — Критический уровень тяжести конфликта (breaking changes) `semantic-conflict.ts:15-15`
- **DeleteModify** — Удалён в одной ветке, изменён в другой `semantic-conflict.ts:24-24`
- **ExtractedMethod** — Метод вынесен `change-intent.ts:48-48`
- **FeatureAddition** — Добавление новой функциональности `change-intent.ts:14-14`
- **File** — Тип кодовой единицы `code-unit.ts:46-46`
- **FixedOffByOne** — Исправлено смещение на один `change-intent.ts:44-44`
- **Function** — Тип кодовой единицы `code-unit.ts:50-50`
- **High** — Требует ручного разрешения уровень тяжести конфликта `semantic-conflict.ts:14-14`
- **IncompatibleIntents** — Несовместимые намерения `semantic-conflict.ts:20-20`
- **InlinedVariable** — Переменная встроена `change-intent.ts:49-49`
- **Interface** — Тип кодовой единицы `code-unit.ts:49-49`
- **LogicConflict** — Конфликт в логике `semantic-conflict.ts:22-22`
- **Low** — Автоматически разрешимый уровень тяжести конфликта `semantic-conflict.ts:12-12`
- **ManualReview** — Ручной анализ `semantic-conflict.ts:82-82`
- **Medium** — Требует проверки уровень тяжести конфликта `semantic-conflict.ts:13-13`
- **MergeBoth** — Объединить обе версии `semantic-conflict.ts:81-81`
- **Method** — Тип кодовой единицы `code-unit.ts:51-51`
- **Module** — Тип кодовой единицы `code-unit.ts:47-47`
- **MovedAndModified** — Файл перемещён и изменён `semantic-conflict.ts:23-23`
- **NewClass** — Доказательство для классификации намерения изменения — добавление нового класса `change-intent.ts:53-53`
- **NewMethod** — Доказательство для классификации намерения изменения — добавление нового метода `change-intent.ts:54-54`
- **NewParameter** — Доказательство для классификации намерения изменения — добавление нового параметра `change-intent.ts:56-56`
- **NewProperty** — Доказательство для классификации намерения изменения — добавление нового свойства `change-intent.ts:55-55`
- **OverlappingChanges** — Оба изменили одно и то же код `semantic-conflict.ts:19-19`
- **ParameterAdded** — Доказательство для классификации намерения изменения — добавление нового параметра `change-intent.ts:61-61`
- **ParameterRemoved** — Доказательство для классификации намерения изменения — удаление параметра `change-intent.ts:62-62`
- **Property** — Represents a property within a code unit `code-unit.ts:52-52`
- **Refactoring** — Рефакторинг без изменения логики `change-intent.ts:13-13`
- **RenamedVariable** — Переменная переименована `change-intent.ts:47-47`
- **ReturnTypeChanged** — Доказательство для классификации намерения изменения — изменение возвращаемого типа метода `change-intent.ts:60-60`
- **SignatureChanged** — Доказательство для классификации намерения изменения — изменение сигнатуры метода `change-intent.ts:59-59`
- **Statement** — Represents a statement within a code unit `code-unit.ts:54-54`
- **TakeBranchA** — Взять версию из branchA `semantic-conflict.ts:79-79`
- **TakeBranchB** — Взять версию из branchB `semantic-conflict.ts:80-80`
- **Unknown** — Неизвестный тип изменения `change-intent.ts:16-16`

### Type_alias
- **MergeActionType** — Типы merge actions `merge-result.ts:8-16`

### Import_decl
- **./change-intent.js** — Imports `./change-intent.js` from `./change-intent.js`. `semantic-conflict.ts:1-1`
- **./code-unit.js** — Imports `./code-unit.js` from `./code-unit.js`. `merge-result.ts:1-1`, `semantic-conflict.ts:2-2`, `versioned-index.ts:1-1`
- **./semantic-conflict.js** — Imports `./semantic-conflict.js` from `./semantic-conflict.js`. `merge-result.ts:2-2`
- **./versioned-index.js** — Imports `./versioned-index.js` from `./versioned-index.js`. `merge-result.ts:3-3`

### Property
- **addedFromACount** — Количество unit добавленных только в branchA `merge-result.ts:54-54`
- **addedFromBCount** — Количество unit добавленных только в branchB `merge-result.ts:55-55`
- **addedInA** — Единицы добавленные только в ветке A `merge-result.ts:81-81`
- **addedInB** — Единицы добавленные только в ветке B `merge-result.ts:84-84`
- **aiConfidence** — Уверенность AI в предложении решения `semantic-conflict.ts:54-54`
- **aiSuggestions** — AI-сгенерированные предложения для разрешения конфликта `semantic-conflict.ts:53-53`
- **autoMergedCount** — Количество автоматически merged unit `merge-result.ts:52-52`
- **autoResolvable** — Можно ли автоматически разрешить конфликт `semantic-conflict.ts:49-49`
- **baseContent** — Контент из base (если есть) `semantic-conflict.ts:65-65`
- **baseIndex** — Индекс основной ветки `merge-result.ts:69-69`
- **baseUnit** — Единица основной ветки `merge-result.ts:75-75`, `merge-result.ts:88-88`
- **baseUnit** — Unit в base (может не быть для новых) `semantic-conflict.ts:36-36`
- **branch** — Ветка `merge-result.ts:98-98`
- **branch** — Имя ветки (например, "main", "feature/auth") `versioned-index.ts:11-11`
- **branchA** — Имя ветки A `merge-result.ts:65-65`
- **branchAContent** — Контент из branchA `semantic-conflict.ts:63-63`
- **branchAIndex** — Индекс ветки A `merge-result.ts:70-70`
- **branchAIntent** — Намерение из branchA `semantic-conflict.ts:41-41`
- **branchAUnit** — Единица ветки A `merge-result.ts:76-76`
- **branchAUnit** — Unit в branchA `semantic-conflict.ts:37-37`
- **branchB** — Имя ветки B `merge-result.ts:66-66`
- **branchBContent** — Контент из branchB `semantic-conflict.ts:64-64`
- **branchBIndex** — Индекс ветки B `merge-result.ts:71-71`
- **branchBIntent** — Намерение из branchB `semantic-conflict.ts:42-42`
- **branchBUnit** — Единица ветки B `merge-result.ts:77-77`
- **branchBUnit** — Unit в branchB `semantic-conflict.ts:38-38`
- **branchCount** — Number of branches in the code unit `code-unit.ts:68-68`
- **byFile** — Счетчик CodeUnit по путям файлов `versioned-index.ts:29-29`
- **byLanguage** — Счетчик CodeUnit по языкам программирования `versioned-index.ts:28-28`
- **byType** — Счетчик CodeUnit по их типам `versioned-index.ts:27-27`
- **childIds** — Child unit IDs (e.g., methods in class) `code-unit.ts:35-35`
- **commit** — Git commit hash (если доступен) `versioned-index.ts:12-12`
- **complexityMetrics** — Complexity metrics for the code unit `code-unit.ts:65-70`
- **confidence** — Уверенность в классификации (0.0-1.0) `change-intent.ts:24-24`
- **confidence** — Уверенность в решении `semantic-conflict.ts:73-73`
- **conflict** — Конфликт (для manual-review) `merge-result.ts:30-30`
- **conflictCount** — Количество конфликтов `merge-result.ts:51-51`
- **conflictingRegions** — Конфликтующие участки кода `semantic-conflict.ts:46-46`
- **conflicts** — Конфликт между ветками `merge-result.ts:102-102`
- **content** — Normalized source code `code-unit.ts:22-22`
- **contentHash** — SHA256 hash (Fast Path Level 1) `code-unit.ts:23-23`
- **contentHashIndex** — Индекс для быстрого поиска по хешу содержимого `versioned-index.ts:19-19`
- **cyclomaticComplexity** — Cyclomatic complexity of the code unit `code-unit.ts:66-66`
- **deletedCount** — Количество удалённых файлов `merge-result.ts:56-56`
- **deletedIn** — Удалённые единицы `merge-result.ts:89-89`
- **deletedUnits** — Удалённые единицы `merge-result.ts:87-91`
- **description** — Человекочитаемое описание `change-intent.ts:26-26`, `change-intent.ts:34-34`
- **description** — Описание merge действия `merge-result.ts:24-24`
- **description** — Человекочитаемое описание конфликта `semantic-conflict.ts:45-45`
- **embedding** — Vector embedding, generated on-demand (Slow Path) `code-unit.ts:28-28`
- **endLine** — 1-based line number `code-unit.ts:19-19`
- **endLine** — Конечная строка конфликта `semantic-conflict.ts:62-62`
- **evidence** — Доказательства для классификации `change-intent.ts:25-25`
- **explanation** — Объяснение решения `semantic-conflict.ts:75-75`
- **exports** — Set of all export statements in the code unit `code-unit.ts:64-64`
- **filePath** — Relative path from project root `code-unit.ts:15-15`
- **filePathIndex** — Индекс для быстрого поиска по пути файла `versioned-index.ts:22-22`
- **fullyQualifiedName** — Full namespace.class.method `code-unit.ts:17-17`
- **id** — Stable ID (SHA256 от FQN) `code-unit.ts:11-11`
- **id** — Уникальный ID конфликта `semantic-conflict.ts:31-31`
- **identifiers** — Set of all identifiers used in the code unit `code-unit.ts:62-62`
- **imports** — Set of all import statements in the code unit `code-unit.ts:63-63`
- **indexedAt** — Таймстамп, когда индекс был создан `versioned-index.ts:13-13`
- **language** — TypeScript, Python, Rust, etc `code-unit.ts:38-38`
- **linesOfCode** — Actual lines of code in the code unit `code-unit.ts:67-67`
- **location** — Где найдено (file:line) `change-intent.ts:35-35`
- **loopCount** — Number of loops in the code unit `code-unit.ts:69-69`
- **manualReviewCount** — Количество unit требующих ручного review `merge-result.ts:53-53`
- **matchedCount** — Количество совпадающих unit `merge-result.ts:50-50`
- **matchedUnits** — Сопоставленные единицы между ветками `merge-result.ts:74-78`
- **mergeActions** — Действие merge для отдельного unit `merge-result.ts:105-105`
- **mergeBase** — Основная ветка для merge `merge-result.ts:67-67`
- **mergedCode** — Результирующий код после разрешения конфликта `semantic-conflict.ts:74-74`
- **mergedUnit** — Merged unit (для auto-merge) `merge-result.ts:27-27`
- **mergeTimeMs** — Время merge в миллисекундах `merge-result.ts:58-58`
- **metadata** — Extra language-specific data `code-unit.ts:39-39`
- **modifiedIn** — Изменённые единицы `merge-result.ts:90-90`
- **name** — Simple name (e.g., "UserService") `code-unit.ts:16-16`
- **newPath** — Новый путь файла `merge-result.ts:38-38`, `merge-result.ts:96-96`
- **normalizedAst** — Normalized AST representation of the code unit `code-unit.ts:61-61`
- **oldPath** — Старый путь файла `merge-result.ts:37-37`, `merge-result.ts:95-95`
- **parentId** — Parent unit ID (e.g., class for method) `code-unit.ts:34-34`
- **renamedCount** — Количество переименованных файлов `merge-result.ts:57-57`
- **renamedUnits** — Переименованные единицы `merge-result.ts:94-99`
- **renameInfo** — Информация о rename `merge-result.ts:36-40`
- **severity** — Уровень тяжести конфликта `semantic-conflict.ts:33-33`
- **signature** — FQN + params for functions (Fast Path Level 3) `code-unit.ts:25-25`
- **signatureIndex** — Индекс для быстрого поиска по подписи `versioned-index.ts:21-21`
- **snippet** — Фрагмент кода `change-intent.ts:36-36`
- **sourceBranch** — Источная ветка для add actions `merge-result.ts:33-33`, `merge-result.ts:39-39`
- **startLine** — 1-based line number `code-unit.ts:18-18`
- **startLine** — Начальная строка конфликта `semantic-conflict.ts:61-61`
- **stats** — Статистика merge `merge-result.ts:107-107`
- **stats** — Статистика, включающая общее количество CodeUnit, их типы, языки и пути файлов `versioned-index.ts:25-30`
- **strategy** — Стратегия решения конфликта `semantic-conflict.ts:72-72`
- **structuralHash** — AST hash, ignores whitespace (Fast Path Level 2) `code-unit.ts:24-24`
- **structuralHashIndex** — Индекс для быстрого поиска по структурному хешу `versioned-index.ts:20-20`
- **structure** — AST metadata and metrics `code-unit.ts:31-31`
- **suggestedResolution** — Предложенное решение конфликта `semantic-conflict.ts:50-50`
- **totalUnits** — Общее количество CodeUnit в индексе `versioned-index.ts:26-26`
- **totalUnitsInA** — Общее количество unit в branchA `merge-result.ts:48-48`
- **totalUnitsInB** — Общее количество unit в branchB `merge-result.ts:49-49`
- **totalUnitsInBase** — Общее количество unit в базе `merge-result.ts:47-47`
- **type** — Тип изменения `change-intent.ts:23-23`, `change-intent.ts:33-33`
- **type** — Тип кодовой единицы `code-unit.ts:12-12`
- **type** — Тип merge действия `merge-result.ts:22-22`
- **type** — Тип конфликта `semantic-conflict.ts:32-32`
- **unit** — Единица `merge-result.ts:97-97`
- **unitId** — Идентификатор unit `merge-result.ts:23-23`
- **units** — Хранилище CodeUnit для версии `versioned-index.ts:16-16`

## Data Flow

- **Inputs**: Raw code entities from DevAgent indexing or GraphStorage.
- **Processing**: Factory functions create typed instances with computed hashes and IDs; helper functions manage multi-map indexes.
- **Outputs**: Strongly typed objects consumed by analysis, matching, engine, indexing, and integration modules.

## Public API

| Export | Type | Description | Location |
|--------|------|-------------|----------|
| `CodeUnit` | interface | Universal code unit with identity, content, hashes, and embeddings | [`code-unit.ts:9-40`](./code-unit.ts) |
| `CodeUnitType` | enum | Unit types: File, Module, Class, Interface, Function, Method, Property, Block, Statement | [`code-unit.ts:45-55`](./code-unit.ts) |
| `CodeStructure` | interface | AST metadata with identifiers, imports, exports, and complexity metrics | [`code-unit.ts:60-71`](./code-unit.ts) |
| `VersionedIndex` | interface | Branch index with code units and O(1) hash lookup maps | [`versioned-index.ts:9-31`](./versioned-index.ts) |
| `createVersionedIndex` | function | Creates empty VersionedIndex for a branch | [`versioned-index.ts:36-53`](./versioned-index.ts) |
| `addUnitToIndex` | function | Adds a CodeUnit to an index, updating all lookup maps | [`versioned-index.ts:58-77`](./versioned-index.ts) |
| `findByContentHash` | function | Fast Path Level 1 lookup by content hash | [`versioned-index.ts:82-85`](./versioned-index.ts) |
| `findByStructuralHash` | function | Fast Path Level 2 lookup by structural hash | [`versioned-index.ts:90-93`](./versioned-index.ts) |
| `findBySignature` | function | Fast Path Level 3 lookup by signature | [`versioned-index.ts:98-101`](./versioned-index.ts) |
| `ChangeIntent` | interface | Change classification with type, confidence, and evidence | [`change-intent.ts:22-27`](./change-intent.ts) |
| `ChangeIntentType` | enum | Intent types: BugFix, Refactoring, FeatureAddition, APIChange, Unknown | [`change-intent.ts:11-17`](./change-intent.ts) |
| `EvidenceType` | enum | Evidence types for intent classification | [`change-intent.ts:39-63`](./change-intent.ts) |
| `SemanticConflict` | interface | Conflict between two branch versions with severity and resolution info | [`semantic-conflict.ts:30-55`](./semantic-conflict.ts) |
| `ConflictSeverity` | enum | Severity levels: Low, Medium, High, Critical | [`semantic-conflict.ts:11-16`](./semantic-conflict.ts) |
| `ConflictType` | enum | Conflict types: OverlappingChanges, IncompatibleIntents, APIBreakingChange, etc. | [`semantic-conflict.ts:18-25`](./semantic-conflict.ts) |
| `Resolution` | interface | Conflict resolution with strategy, confidence, and merged code | [`semantic-conflict.ts:71-76`](./semantic-conflict.ts) |
| `ResolutionStrategy` | enum | Resolution strategies: TakeBranchA, TakeBranchB, MergeBoth, ManualReview | [`semantic-conflict.ts:78-83`](./semantic-conflict.ts) |
| `MergeResult` | interface | Complete three-way merge result with all matched, added, deleted, and renamed units | [`merge-result.ts:64-108`](./merge-result.ts) |
| `MergeAction` | interface | Individual merge action for a code unit | [`merge-result.ts:21-41`](./merge-result.ts) |
| `MergeStats` | interface | Merge statistics including counts and timing | [`merge-result.ts:46-59`](./merge-result.ts) |

## Dependencies

### Internal Modules

| Module | Purpose |
|--------|---------|
| (none) | Pure type definitions with no internal imports |

### External Packages

| Package | Purpose |
|---------|---------|
| (none) | No external dependencies |

## Behavioral Properties

| Property | Value |
|----------|-------|
| Intent confidence formula | min(0.7 + evidence.length * 0.1, 1.0) |
| VersionedIndex lookup complexity | O(1) via Map-based hash indexes |
| Conflict ID generation | Composite of unit IDs and timestamp for uniqueness |

## Error Handling

Factory functions (createOverlappingConflict, createBugFixIntent, etc.) always return valid objects without throwing. VersionedIndex helper functions return empty arrays for missing keys.

## Known Limitations

- CodeUnit.metadata uses `Record<string, any>` without strict typing for language-specific data.
- MergeActionType is a string union rather than an enum, making exhaustive checks more verbose.
- No built-in validation for CodeUnit fields (callers must ensure content hash consistency).

## Files

| File | Description |
|------|-------------|
| `change-intent.ts` | ChangeIntent types, EvidenceType enum, and factory functions for each intent type |
| `code-unit.ts` | CodeUnit interface, CodeUnitType enum, and CodeStructure AST metadata |
| `index.ts` | Re-exports all model types and functions |
| `merge-result.ts` | MergeResult, MergeAction, MergeStats, and MergeActionType definitions |
| `semantic-conflict.ts` | SemanticConflict, ConflictSeverity, ConflictType, Resolution, and factory functions |
| `versioned-index.ts` | VersionedIndex interface with O(1) lookup indexes and helper functions |
