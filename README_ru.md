```
         ██  ██
         ██  ██  ██    ██████ █████▄  ▄████▄
         ██  ██  ██      ██   ██▄▄██▄ ██▄▄██
         ██  ██  ██      ██   ██   ██ ██  ██
         ██  ██  ██████  ██   ██   ██ ██  ██
         ▀████▀          ▄████ ▄████▄ █████▄ █████
                         ██    ██  ██ ██  ██ ██▄▄▄
                         ▀████ ▀████▀ █████▀ ██▄▄▄

```

[![npm version](https://badge.fury.io/js/ultracode.svg)](https://www.npmjs.com/package/ultracode)
[![License: AGPL-3.0 / Commercial](https://img.shields.io/badge/License-AGPL--3.0_|_Commercial-blue.svg)](LICENSE)
[![Bun](https://img.shields.io/badge/bun-%3E%3D1.3.2-f472b6)](https://bun.sh)
[![Node.js](https://img.shields.io/badge/node-%3E%3D24.0.0-brightgreen)](https://nodejs.org/)

# Codebase RAG для быстрой и точной работы с кодом

🌐 **Language**: [EN](./README.md) | [RU]

---

Сокращает до 90% затраты времени и токенов при работе с кодом через ИИ-агентов. Поиск, анализ, изменение кода происходят по базе графов полной структуры кода. Локальная embedding-модель позволяет делать запросы в произвольной форме, тут же проверять и дополнять результат.  

**Полная индексация среднего проекта - 3 секунды**. Инкрементная индексация изменений - на лету.

| | ❌ Обычная работа с ИИ-агентом | ✅ Работа через UltraCode |
|---|---|---|
| **Поиск** | ИИ-агент использует grep/replace для полнотекстового поиска по ключевым словам. Найденные файлы читает и анализирует целиком, потом идёт по цепочке из файлов. <br />На простую задачу в большом проекте уходит **30 минут и 1М+ токенов**. При этом найдёт не всё. | ИИ-агент запрашивает UltraCode и моментально получает полные и точные сведения со ссылками на строки кода. Семантика находит даже неочевидные связи. <br />Запрос выполняется **100мс и возвращает 5К токенов** (быстрее в 18 000 раз, дешевле в 200 раз). |
| **Редактирование** | ИИ-агент редактирует файлы "вслепую". Вместо аккуратного изменения возникает 10-20 итераций: ломает → проверяет → чинит → ломает. Плюс десяток запросов на подбор bash/pwsh команд. <br />Уходит **до 1 часа и 2М+ токенов**. | UltraCode точно меняет код на уровне структуры + линтинг + форматирование + анализ изменений с локальной трассировкой. Если что-то сломается — сообщит в том же ответе. <br />**В 18 000 раз быстрее, в 200 раз дешевле.** |
| **Память** | ИИ-агент забывает что делал и повторно создаёт тот же функционал рядом с существующим. Или часами отлаживает функцию, которую сам же отключил. <br />Уходит **много часов и 10М+ токенов**. | Через UltraCode агент получает полную структуру кода в компактном виде. AutoDoc автоматически ведёт документацию. Агент не попадёт в ловушку беспамятства. <br />Всё сразу корректно. |
| **Git** | При переключении ветки или ваших изменениях — агент не определит это и продолжит работать с устаревшим представлением о коде. <br />Нужно принудительно заставлять проводить повторный анализ. | Все запросы идут по актуальному коду. Переключайте ветки, меняйте файлы — инкрементная индексация графа и семантики происходит мгновенно. <br />Не нужно ничего делать дополнительно и даже задумываться об этом. |

# Возможности

MCP-сервер предоставляет **72 инструмента** для анализа и модификации кода.

## Поиск и навигация

| Инструмент | Описание |
|------------|----------|
| [**semantic_search**](.autodoc/features/search_ru.md#semantic_search) | Семантический поиск по смыслу с фильтрами (complexity, flow, docs) |
| [**pattern_search**](.autodoc/features/search_ru.md#pattern_search) | Продвинутый поиск: regex, семантический, гибридный |
| [**query**](.autodoc/features/search_ru.md#query) | NLP-запросы на естественном языке о коде |
| [**find_similar_code**](.autodoc/features/search_ru.md#find_similar_code) | Поиск функций с аналогичной логикой |
| [**cross_language_search**](.autodoc/features/search_ru.md#cross_language_search) | Единый поиск по всем языкам проекта |
| [**find_related_concepts**](.autodoc/features/search_ru.md#find_related_concepts) | Поиск связанных концепций |

## Анализ кода

| Инструмент | Описание |
|------------|----------|
| [**analyze_code_impact**](.autodoc/features/analysis_ru.md#analyze_code_impact) | Анализ влияния — что сломается при изменении |
| [**find_duplicates**](.autodoc/features/analysis_ru.md#find_duplicates) | Семантический поиск клонов кода |
| [**jscpd_detect_clones**](.autodoc/features/analysis_ru.md#jscpd_detect_clones) | Детектор клонов на базе jscpd |
| [**suggest_refactoring**](.autodoc/features/analysis_ru.md#suggest_refactoring) | AI-предложения по улучшению кода |
| [**analyze_hotspots**](.autodoc/features/analysis_ru.md#analyze_hotspots) | Сложные участки с высокой цикломатической сложностью |
| [**analyze_state_chaos**](.autodoc/features/analysis_ru.md#analyze_state_chaos) | Анализ запутанных зависимостей данных |
| [**analyze_swagger_impact**](.autodoc/features/swagger_ru.md#analyze_swagger_impact) | Анализ влияния изменений Swagger/OpenAPI спецификаций |
| [**detect_technology_stack**](.autodoc/features/analysis_ru.md#detect_technology_stack) | Определение стека технологий проекта |
| [**detect_patterns**](.autodoc/features/patterns_ru.md#detect_patterns) | Обнаружение анти-паттернов, лучших практик, code smells и возможностей оптимизации с семантической валидацией |
| [**check_entity_patterns**](.autodoc/features/patterns_ru.md#check_entity_patterns) | Проверка конкретной entity на совпадение с паттернами |
| [**graph_metrics**](.autodoc/features/analysis_ru.md#graph_metrics) | PageRank, кластеризация Louvain, анализ центральности и bus factor для понимания архитектуры |
| [**taint_analysis**](.autodoc/features/security_ru.md#taint_analysis) | Межпроцедурный taint-анализ: отслеживание ненадёжных данных от источников до приёмников, детекция SQL-инъекций, XSS, command injection |

## Статическая трассировка и отладка

| Инструмент | Описание |
|------------|----------|
| [**trace_flow**](.autodoc/features/tracing_ru.md#trace_flow) | Как код попадает от точки A к B |
| [**trace_backwards**](.autodoc/features/tracing_ru.md#trace_backwards) | Почему функция не вызывается |
| [**trace_data_flow**](.autodoc/features/tracing_ru.md#trace_data_flow) | Как данные влияют на состояние |
| [**analyze_state_impact**](.autodoc/features/tracing_ru.md#analyze_state_impact) | Что изменится при другом значении |
| [**find_decision_points**](.autodoc/features/tracing_ru.md#find_decision_points) | Точки ветвления в коде |

## Модификация кода

| Инструмент | Описание |
|------------|----------|
| [**modify_code**](.autodoc/features/modification_ru.md#modify_code) | Структурное редактирование на уровне AST с валидацией |
| [**create_file**](.autodoc/features/modification_ru.md#create_file) | Создание нового файла |
| [**copy_file**](.autodoc/features/modification_ru.md#copy_file) | Копирование файла с обновлением графа |
| [**rename_file**](.autodoc/features/modification_ru.md#rename_file) | Переименование файла с обновлением импортов |
| [**split_file**](.autodoc/features/modification_ru.md#split_file) | Разделение файла на части |
| [**synthesize_files**](.autodoc/features/modification_ru.md#synthesize_files) | Объединение файлов |
| [**rename_symbol**](.autodoc/features/modification_ru.md#rename_symbol) | Переименование по всему проекту |
| [**add_member**](.autodoc/features/modification_ru.md#add_member) | Добавление методов/свойств в классы |

## Валидация кода

| Инструмент | Описание |
|------------|----------|
| [**validate_file**](.autodoc/features/validation_ru.md#validate_file) | Валидация файла через oxlint/Pylint/golint/clippy |
| [**validate_directory**](.autodoc/features/validation_ru.md#validate_directory) | Пакетная валидация директории |

## Документация (AutoDoc)

| Инструмент | Описание |
|------------|----------|
| [**autodoc_init**](.autodoc/features/autodoc_ru.md#autodoc_init) | Инициализация системы AutoDoc |
| [**autodoc_generate**](.autodoc/features/autodoc_ru.md#autodoc_generate) | Генерация документации для сущностей |
| [**autodoc_save**](.autodoc/features/autodoc_ru.md#autodoc_save) | Сохранение документации в .autodoc |
| [**autodoc_get**](.autodoc/features/autodoc_ru.md#autodoc_get) | Получение документации сущности |
| [**autodoc_search**](.autodoc/features/autodoc_ru.md#autodoc_search) | Семантический поиск по документации |
| [**autodoc_validate**](.autodoc/features/autodoc_ru.md#autodoc_validate) | Проверка актуальности документации |
| [**autodoc_status**](.autodoc/features/autodoc_ru.md#autodoc_status) | Статистика документирования |
| [**autodoc_sync**](.autodoc/features/autodoc_ru.md#autodoc_sync) | Синхронизация с изменениями кода |
| [**autodoc_changelog**](.autodoc/features/autodoc_ru.md#autodoc_changelog) | История изменений документации |
| [**autodoc_install_hooks**](.autodoc/features/autodoc_ru.md#autodoc_install_hooks) | Установка Git hooks для автообновления |
| [**autodoc_detect_language**](.autodoc/features/autodoc_ru.md#autodoc_detect_language) | Определение языка для генерации |

## Git-интеграция

| Инструмент | Описание |
|------------|----------|
| [**list_branches**](.autodoc/features/git_ru.md#list_branches) | Список проиндексированных веток |
| [**switch_branch**](.autodoc/features/git_ru.md#switch_branch) | Переключение между ветками с автопереиндексацией |
| [**get_branch_status**](.autodoc/features/git_ru.md#get_branch_status) | Статус текущей ветки |
| [**get_changed_files**](.autodoc/features/git_ru.md#get_changed_files) | Сравнение файлов между ветками |
| [**cleanup_branches**](.autodoc/features/git_ru.md#cleanup_branches) | Очистка старых веток (LRU) |

## История версий (Prolly Tree)

| Инструмент | Описание |
|------------|----------|
| [**list_commits**](.autodoc/features/history_ru.md#list_commits) | Список коммитов графа (версионные снапшоты) |
| [**get_entity_history**](.autodoc/features/history_ru.md#get_entity_history) | История изменений сущности по коммитам |
| [**diff_commits**](.autodoc/features/history_ru.md#diff_commits) | Сравнение двух версий графа (добавленные/изменённые/удалённые) |
| [**checkout_commit**](.autodoc/features/history_ru.md#checkout_commit) | Time travel — просмотр графа на момент коммита |

## Семантический мерж

| Инструмент | Описание |
|------------|----------|
| [**semantic_merge**](.autodoc/features/merge_ru.md#semantic_merge) | AI-powered 3-way мерж с пониманием кода |
| [**analyze_merge_conflicts**](.autodoc/features/merge_ru.md#analyze_merge_conflicts) | Анализ конфликтов с объяснением причин |
| [**get_merge_suggestions**](.autodoc/features/merge_ru.md#get_merge_suggestions) | AI-предложения по разрешению конфликтов |
| [**get_semantic_merge_info**](.autodoc/features/merge_ru.md#get_semantic_merge_info) | Информация о семантических различиях |

## Снапшоты и безопасность

| Инструмент | Описание |
|------------|----------|
| [**create_snapshot**](.autodoc/features/snapshots_ru.md#create_snapshot) | Сохранение точки восстановления |
| [**undo**](.autodoc/features/snapshots_ru.md#undo) | Мгновенный откат к снапшоту |
| [**list_snapshots**](.autodoc/features/snapshots_ru.md#list_snapshots) | Список доступных снапшотов |
| [**cleanup_snapshots**](.autodoc/features/snapshots_ru.md#cleanup_snapshots) | Очистка старых снапшотов |

## Граф кода и индексация

| Инструмент | Описание |
|------------|----------|
| [**index**](.autodoc/features/indexing_ru.md#index) | Индексация кодовой базы |
| [**clean_index**](.autodoc/features/indexing_ru.md#clean_index) | Полная переиндексация |
| [**get_members**](.autodoc/features/graph_ru.md#get_members) | Список сущностей в файле |
| [**list_entity_relationships**](.autodoc/features/graph_ru.md#list_entity_relationships) | Связи и зависимости сущности |
| [**get_graph**](.autodoc/features/graph_ru.md#get_graph) | Получение графа (JSON/GraphML/Mermaid) |
| [**get_graph_stats**](.autodoc/features/graph_ru.md#get_graph_stats) | Статистика графа |
| [**get_graph_health**](.autodoc/features/graph_ru.md#get_graph_health) | Диагностика состояния графа |
| [**reset_graph**](.autodoc/features/graph_ru.md#reset_graph) | Полная очистка графа |

> **Архитектура хранения**: [Prolly Tree](.autodoc/architecture/prolly-tree_ru.md) — версионируемое хранилище графа с O(log n) diff между ветками

## Метрики и мониторинг

| Инструмент | Описание |
|------------|----------|
| [**get_metrics**](.autodoc/features/metrics_ru.md#get_metrics) | Системные метрики и статистика |
| [**get_version**](.autodoc/features/metrics_ru.md#get_version) | Версия сервера и runtime |
| [**get_agent_metrics**](.autodoc/features/metrics_ru.md#get_agent_metrics) | Телеметрия многоагентной системы |
| [**get_bus_stats**](.autodoc/features/metrics_ru.md#get_bus_stats) | Статистика шины знаний |
| [**clear_bus_topic**](.autodoc/features/metrics_ru.md#clear_bus_topic) | Очистка кешированных записей топика |
| [**get_watcher_status**](.autodoc/features/metrics_ru.md#get_watcher_status) | Статус фоновых наблюдателей |

---

## Дополнительные возможности

### Производительность
- **SIMD/WebAssembly** — встроенное ускорение на CPU
- **CUDA/FAISS** — GPU-ускорение для больших проектов
- **WebGPU/Dawn** — кросс-платформенное GPU-ускорение
- **Streaming индексация** — парсинг и индексация параллельно
- **Локальные эмбеддинги** — TEI/Ollama/vLLM/MLX без внешних API

### Поддержка языков

| Язык | Парсер | Сущности | Связи | Метрики | Типы |
|------|--------|----------|-------|---------|------|
| **TypeScript** | TS Compiler API | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **JavaScript** | TS Compiler API | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Python** | ast + Pyright | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Kotlin** | kotlin-compiler | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Java** | JavaParser | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Go** | go/parser | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| **Rust** | syn + ANTLR | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| **Swift** | SwiftSyntax | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| **C#** | Roslyn Compiler | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **C/C++** | clang AST | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| **Zig** | regex + heuristics | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| **Bash** | regex + heuristics | ⭐⭐⭐ | ⭐⭐ | ⭐⭐ | — |
| **PowerShell** | regex + heuristics | ⭐⭐⭐ | ⭐⭐ | ⭐⭐ | — |
| **JSON/YAML** | native + OpenAPI | ⭐⭐⭐ | ⭐⭐⭐ | — | — |

**Легенда:**
- **Сущности** — функции, классы, интерфейсы, типы, enums, переменные
- **Связи** — imports, calls, extends, implements, references
- **Метрики** — cyclomatic, cognitive complexity, control flow, documentation
- **Типы** — type inference, type references, generics

### Поддержка малых языков

> **Любой 0b00000001 важен!**

Мы целенаправленно инвестируем в первоклассную поддержку малоизвестных, но перспективных языков и фреймворков — чтобы их сообщества получили такие же мощные инструменты анализа кода, как и мейнстрим-экосистемы.

**Сейчас поддерживается:** Zig — полное извлечение сущностей, связей и метрик сложности.

Список будет расти. Если ваш любимый нишевый язык заслуживает лучших инструментов — [откройте issue](https://github.com/faxenoff/ultracode/issues).

### Фреймворки

| Фреймворк | Дополнительные возможности |
|-----------|---------------------------|
| **Angular** | Компоненты, директивы, pipes, services, модули, DI-иерархия, template bindings |
| **NgRx** | Actions, reducers, effects, selectors, feature states, action creators |
| **React** | JSX/TSX, functional/class components, hooks (useState, useEffect, useMemo, useCallback, useContext) |

### Встроенная документация (MCP Prompts)

В системные промпты можно добавить [короткий промпт](.autodoc/claude.cfg/add-to-CLAUDE.md) который поможет ИИ-агенту узнать о способе получения информации о работе UltraCode.

- **quick-start** — быстрый старт и выбор инструментов
- **tool-reference** — полный справочник 72 инструментов
- **workflows** — готовые сценарии: анализ, рефакторинг, поиск дубликатов
- **tracing-guide** — руководство по трассировке и отладке

### UltraCode Agent
- **Делегирование задач** — передайте сложную задачу агенту `/ultracode`
- **Максимальная эффективность** — агент сам выберет оптимальные инструменты
- **Комплексный анализ** — поиск, трассировка, рефакторинг в одном запросе
- **Естественный язык** — опишите задачу своими словами

### Клиент-серверная архитектура
- **Один процесс на машину** — при запуске множества ИИ-агентов работает только один UltraCode
- **Экономия 10+ ГБ RAM** — вместо N копий индексов в памяти — один общий
- **Мгновенное подключение** — новые агенты подключаются к работающему серверу за миллисекунды
- **Изоляция сессий** — каждый агент получает независимую MCP-сессию

# Установка

Проект оптимизирован под [Bun](https://bun.sh) (это альтернативный JavaScript-runtime) и работает под ним на 50% быстрее.

**Установка Bun** (одной командой):

```bash
# Windows (PowerShell)
powershell -c "irm bun.sh/install.ps1 | iex"

# macOS / Linux
curl -fsSL https://bun.sh/install | bash
```

**Установка UltraCode**

```bash
# Bun (рекомендуется) — два шага:

# 1. Установка пакета
bun install -g ultracode

# 2. Разрешить postinstall скрипты для нативных модулей
bun pm -g trust ultracode
```

```bash
# npm (альтернатива) — один шаг:
npm install -g ultracode
```

> **Почему два шага для Bun?** 
> Для достижения ultra-скорости UltraCode использует нативные компоненты:
>
> - **faiss-napi** — HNSW/IVF индексы для векторного поиска (100x ускорение)
> - **cbor-extract** — быстрая нативная сериализация метаданных
> - **webgpu** — Dawn GPU backend для AMD/Intel
> - **protobufjs** — бинарный протокол для IPC
> - **xxhash-wasm** — SIMD-ускоренное хеширование файлов
> - **libSQL** — нативные SQLite bindings с векторным расширением
> - **oxc-parser** — Rust-парсер для TS/JS (в 10x быстрее tsc)
>
> Bun блокирует postinstall скрипты по умолчанию. Команда `bun pm trust` разрешает их выполнение — повторная установка не нужна.

> **Примечание**: Для полноценного анализа кода на разных языках требуются runtime:
> 
> - TypeScript/JavaScript — встроено (TypeScript Compiler API)
> - Python — требуется Python 3.8+ (`python --version`)
> - Java/Kotlin — требуется JRE 11+ (`java --version`)
> - Go — требуется Go 1.18+ (`go version`)
> - Rust — требуется Rust toolchain (`rustc --version`)
> - C# — требуется .NET SDK 8+ (`dotnet --version`)
> - Zig — встроено (regex-based, Zig toolchain не требуется)
> - C/C++ — требуется Clang 12+ (`clang --version`)

**Конфиг Claude Code** (`~/.claude.json`):

```json
{
  "mcpServers": {
    "ultracode": {
      "command": "ultracode"
    }
  }
}
```

> Конфигурация: [.autodoc/claude.cfg/add-to-CLAUDE.md](.autodoc/claude.cfg/add-to-CLAUDE.md)

## **Настройка локальных моделей**

Для интеллектуальных задач используются локальные модели: embedding-модель для семантического поиска и LLM для AutoDoc. Это снимает затраты токенов с вашего основного ИИ-агента.

**После установки запустится мастер настройки, который скачает и настроит всё необходимое.**

**Шаг 1: Embedding-провайдер** (семантический поиск)

| Провайдер | Скорость | Рекомендация |
|-----------|----------|--------------|
| **vLLM** | 1352 emb/s | ⭐ NVIDIA GPU (рекомендуется) |
| **TEI** | 1169 emb/s | ⭐ NVIDIA GPU (Blackwell: image `120-latest`) |
| **MLX** | ~500 emb/s | ⭐ macOS Apple Silicon (Metal GPU) |
| **llama.cpp** | 441 emb/s | AMD GPU (Vulkan), универсальный |
| **OVMS Native** | 260-326 emb/s | ⭐ CPU / Intel GPU. <br />Может выручить, если основная VRAM будет занята локальной LLM. |

**Шаг 2: LLM-провайдер** (AutoDoc, рефакторинг)

| Провайдер | Модели | Рекомендация |
|-----------|--------|--------------|
| **Docker Model Runner** | Qwen 2.5, DeepSeek R1, Phi-4, Llama 3.2 | ⭐ Если установлен Docker Desktop |
| **Ollama** | qwen2.5-coder, deepseek-coder, phi4 | Универсальный вариант |
| **Пропустить** | — | Настроить позже |

Мастер автоматически:
- Определит вашу GPU (NVIDIA Turing/Ampere/Ada/Hopper/Blackwell*)
- Предложит оптимальные модели под ваше железо
- Установит выбранные провайдеры
- Сохранит конфигурацию в системную директорию

> **Повторный запуск мастера:**
> ```bash
> # Bun
> bunx ultracode setup
>
> # Node.js
> npx ultracode setup
> ```

*Для Blackwell (RTX 50xx) используется неофициальный форк TEI

### Настройка AUTODOC

Для активации режима автодокументирования - создайте в корне проекта папку ``.autodoc`` и включите использование LLM (проще всего использовать ту же claude).

После запуска UltraCode со включённым режимом Autodoc:

1. Во всех папках с исходным кодом (из поддерживаемых языков) будут созданы файлы AUTODOC.md в которых будет сгенерирован шаблон со списком файлов в директории.
2. LLM пройдёт по этим файлам и сгенерирует в AUTODOC.md их описание - что конкретно делает код в файлах.

После этого вы можете сами (или с помощью ИИ-агента) сделать нужные вам файлы с общим описанием проекта в директории .autodoc и добавить "человеческое описание" в файлы AUTODOC.md где вам потребуется. Там вы можете использовать прямые ссылки на строки кода в файлах (для описания начала и конца блока кода используйте два числа. Пример: FILE:XX-ZZ). UltraCode будет отслеживать изменения кода и автоматически обновлять все ссылки на код, чтобы они всегда оставались актуальными. Текст документации он трогать не будет. 

### macOS Apple Silicon (MLX Эмбеддинги)

Нативная поддержка эмбеддингов через Apple MLX (Metal GPU):

- **MLX провайдер** автоматически определяет macOS ARM64 и использует Metal GPU
- Мастер настройки предлагает MLX по умолчанию на Apple Silicon
- Модели: `intfloat/multilingual-e5-base` (768d), `intfloat/multilingual-e5-small` (384d), `BAAI/bge-m3` (1024d, 8K контекст)
- Автоматически создаёт Python venv, устанавливает зависимости, скачивает модели с HuggingFace

```bash
# Перезапустите мастер для выбора MLX:
bunx ultracode setup
# Выберите "MLX" → автонастройка venv + модель + сервер на порту 8087
```

### GPU ускорение (CUDA/WebGPU/Metal)

```bash
# macOS: Metal backend для CUDA-подобного ускорения
# Требования для сборки:
#   - Xcode Command Line Tools: xcode-select --install
#   - Homebrew: https://brew.sh
#   - CMake: brew install cmake
./node_modules/ultracode/scripts/build-native-libs-macos.sh
```

# Конфигурация

## Структура данных

Все данные UltraCode хранятся в системной директории:

- **Windows**: `%LOCALAPPDATA%\UltraCode\`
- **macOS**: `~/Library/Application Support/UltraCode/`
- **Linux**: `~/.local/share/UltraCode/`

```
UltraCode/
├── config/
│   ├── semantic-config.json    # Embedding/LLM провайдеры (setup wizard)
│   └── parser-config.json      # Пути к runtime (Java, Kotlin)
├── projects/
│   └── {hash}/                 # Данные проекта (hash от пути)
│       ├── faiss-*.bin         # FAISS индекс для векторного поиска
│       └── *.json              # Метаданные индекса
├── logs/                       # Логи сервера (ротация по дням)
├── models/                     # Скачанные embedding модели
├── llamacpp/                   # llama.cpp бинарники и модели
├── ovms/                       # OpenVINO Model Server модели
├── hf-cache/                   # Кеш HuggingFace моделей
├── autodoc.db                  # База AutoDoc документации
└── unified-storage.db          # Единое хранилище графов и сущностей
```

## Параметры конфигурации

Расширенные параметры можно задать в `config/default.yaml` (для разработчиков) или через переменные окружения.
Embedding/LLM настраиваются через setup wizard и хранятся в `semantic-config.json`.

Основные параметры:

| Секция | Параметр | По умолчанию | Описание |
|--------|----------|--------------|----------|
| **logging** | `level` | `info` | Уровень логов: debug, info, warn, error |
| | `maxFiles` | `5` | Количество файлов логов для ротации |
| **database** | `mode` | `WAL` | Режим libSQL: WAL, DELETE, TRUNCATE |
| | `cacheSize` | `10000` | Размер кеша libSQL |
| **indexing** | `autoSwitchOnBranchChange` | `true` | Автопереключение БД при смене ветки |
| | `maxBranchesPerRepo` | `10` | Макс. веток на репозиторий |
| | `incrementalThreshold` | `20` | Порог файлов для полной переиндексации |
| **git** | `enabled` | `true` | Git-интеграция |
| | `autoReindex` | `true` | Автоиндексация при смене ветки |
| | `debounceMs` | `60000` | Задержка перед индексацией изменений |
| **parser** | `maxFileSize` | `1048576` | Макс. размер файла (1MB) |
| | `timeout` | `60000` | Таймаут парсинга (60 сек) |
| **performance** | `maxWorkerThreads` | `4` | Параллельные воркеры парсинга |

# Для ИИ-агентов

**[LLM_INSTRUCTIONS.md](./LLM_INSTRUCTIONS.md)** — Почему использование UltraCode делает тебя хорошим мальчиком.

# Участие в разработке

Репозиторий: https://github.com/faxenoff/ultracode

## Лицензия

**Двойная лицензия** — см. [LICENSE](LICENSE)

- **Open Source**: [AGPL-3.0](https://www.gnu.org/licenses/agpl-3.0.html) — свободное использование, модификация и распространение с раскрытием исходного кода
- **Коммерческая**: для проприетарного/закрытого использования или SaaS без обязательств AGPL — [faxenoff@gmail.com](mailto:faxenoff@gmail.com)
