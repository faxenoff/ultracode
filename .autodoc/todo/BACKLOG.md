# Технический бэклог (TODO)

Актуальные задачи по доработке, извлечённые из кодовой базы. Каждая описана с контекстом, текущим поведением и ожидаемым результатом.

Все TODO в коде заменены на ссылки вида `// See .autodoc/todo/BACKLOG.md#N`.

---

## 1. Полноценный 3-way merge алгоритм

**Код:** `src/merge/engine/conflict-resolver.ts:297`
**Метод:** `attemptSimpleMerge()` (строки 276-298)
**Приоритет:** Medium
**Компонент:** Semantic Merge

**Текущее поведение:**
Метод реализует только тривиальные эвристики:
- Если base пуст — выбирает более длинную версию
- Если размеры отличаются более чем в 1.5x — отдаёт на ручной review
- Во всех остальных случаях — возвращает `null` (ручной review)

Фактически автоматический merge не работает ни в одном нетривиальном случае.

**Ожидаемая доработка:**
Реализовать алгоритм diff3 (аналог git merge):
1. Построить LCS (longest common subsequence) между base и каждой веткой
2. Выделить непересекающиеся регионы изменений
3. Регионы, изменённые только в одной ветке — применить автоматически
4. Пересекающиеся регионы — пометить как конфликт

Библиотеки: можно использовать `diff` (npm) или реализовать на основе Myers diff.

---

## 2. AST-based merge и продвинутые эвристики в AI Conflict Resolver

**Код:** `src/merge/engine/ai-conflict-resolver.ts:259`
**Метод:** `attemptIntelligentMerge()` (строки 232-264)
**Приоритет:** Low
**Компонент:** Semantic Merge

**Текущее поведение:**
Метод использует только две эвристики на основе длины контента и cosine similarity:
- Если оба добавили код и similarity >= 0.7 — берёт длиннейшую версию
- Если изменения < 100 символов и similarity >= 0.8 — берёт branchA

Это грубые приближения, которые не учитывают структуру кода.

**Ожидаемые доработки (3 направления):**

### 2a. AST-based merge
Парсить обе версии в AST (через существующие парсеры проекта), сравнивать дерево:
- Если изменения в разных функциях/методах — объединить
- Если изменения в одной функции, но в разных блоках — попробовать объединить
- Если конфликтуют на уровне AST-узла — отдать на review

### 2b. Line-by-line diff с семантическим скорингом
Построить line-level diff, для каждого hunk вычислить семантическую значимость (import, signature change, body change) и принимать решение на основе весов.

### 2c. LLM-based merge (опционально)
Отправить конфликт в LLM с контекстом (base, branchA, branchB, типы сущностей) для генерации merged-версии. Требует настройки LLM-провайдера.

---

## 3. Async collectFiles с Bun.Glob

**Код:** `src/agents/dev/file-collector.ts:306`
**Функция:** `collectFiles()` (строки 294-319)
**Приоритет:** Low
**Компонент:** File Collection / Indexing

**Текущее поведение:**
Функция `collectFiles()` имеет синхронный API (возвращает `CollectFilesResult`, не `Promise`). Из-за этого невозможно использовать `Bun.Glob.scan()` — асинхронный API Bun, который в ~3x быстрее синхронного `fs.readdirSync` с `withFileTypes`.

Флаг `useBunGlob = false` отключает Bun-путь, хотя код для него уже написан.

**Ожидаемая доработка:**
1. Изменить сигнатуру `collectFiles()` на `async` (возвращать `Promise<CollectFilesResult>`)
2. Обновить все вызовы (IndexerAgent, DevAgent, парсеры) на `await collectFiles()`
3. Включить `Bun.Glob.scan()` путь при `isBunRuntime()`

**Влияние:** ~15 вызовов по кодовой базе. Требует проверки, что все caller'ы могут работать с async API. В Node.js-пути ничего не меняется.

---

## 4. VectorStore.clear() для FaissProvider

**Код:** `src/semantic/vector-store.ts:1201`
**Метод:** `clear()` (строки 1200-1203)
**Приоритет:** Low
**Компонент:** Semantic Search / FAISS

**Текущее поведение:**
Метод `clear()` — пустой stub, выводит warning в лог. Не удаляет векторы из FAISS-индекса текущего проекта.

Обходной путь: `index(reset=true)` пересоздаёт индекс целиком, что покрывает основной use case.

**Ожидаемая доработка:**
Вызвать `nativeFaiss.faissIndexReset(projectKey)` (метод уже есть в native addon) из FaissProvider, затем сбросить ID-маппинг. Простая задача, но требует проверки, что GPU worker корректно обрабатывает reset для загруженного индекса.

---

## 5. Поддержка ESLint в validate_file

**Код:** `src/tools/handlers/validation-tool-handlers.ts:204`
**Блок:** строки 198-206
**Приоритет:** Low
**Компонент:** Validation Tools

**Текущее поведение:**
При обнаружении `.eslintrc` конфигурации инструмент `validate_file` логирует предупреждение и fallback'ит на oxlint. ESLint не вызывается.

Oxlint покрывает ~300 правил ESLint из коробки и работает в ~50-100x быстрее, поэтому для большинства проектов fallback достаточен.

**Ожидаемая доработка:**
1. Определить, установлен ли `eslint` в проекте (`node_modules/.bin/eslint`)
2. Запустить `eslint --format json <file>` и распарсить результат
3. Смёрджить с результатами oxlint (deduplicate по rule ID)
4. Поддержать ESLint flat config (`eslint.config.js`) и legacy (`.eslintrc.*`)

**Примечание:** ESLint v9 перешёл на flat config, нужно поддержать оба формата. Приоритет низкий — oxlint-fallback работает для подавляющего большинства случаев.

---

## 6. Layer 2 — Semantic Diff Layer

**Код:**
- `src/types/layered.ts:76` — тип `WorkingDelta`
- `src/types/layered.ts:160` — конфигурация Layer 2
- `src/types/layered.ts:372` — helper-функции
- `src/core/layered-index.ts:129,141,153,164` — методы интерфейса (`getWorkingDelta`, `setWorkingDelta`, `clearWorkingDelta`, `hasUncommittedChanges`)

**Приоритет:** Future
**Компонент:** Layered Index

**Текущее поведение:**
Layer 1 (File Change Layer) реализован: отслеживает файловые изменения, дельты, инкрементальные обновления. Layer 2 объявлен в типах и интерфейсах как заглушки (`throw new Error("Layer 2 not implemented")`).

**Ожидаемая доработка:**
Layer 2 — семантические диффы: вместо file-level дельт хранить entity-level изменения (добавлена функция, изменена сигнатура, удалён метод). Это позволит:
- Точный impact analysis при merge
- Семантический changelog
- Эффективный partial reindex (только изменённые сущности)

Зависит от стабилизации Layer 1 и реального demand.
