---
module_name: java-framework
description: "Extractors for Java framework patterns: Spring, JPA/Hibernate, and Lombok"
status: active
language: typescript
---

# Java Framework

> Detects and extracts framework-specific patterns from Java code, including Spring stereotypes/endpoints, JPA entity mappings, and Lombok code generation annotations.

## Overview

This module provides framework-aware analysis for Java projects. Each extractor handles a specific framework ecosystem: Spring (DI, REST endpoints, component types), JPA/Hibernate (entities, relationships, repositories, queries), and Lombok (generated methods, builder pattern, logging). Extractors work with annotation data from the parser to enrich entities with framework metadata and generate additional relationships.

## Data Flow

- **Inputs**: `AnnotationInfo[]` from parsed Java entities, raw source code strings, and `ParsedEntity` objects
- **Processing**: Pattern matching against known framework annotations, regex-based code scanning for imports and patterns, confidence scoring
- **Outputs**: Framework-specific metadata (`SpringAnnotationInfo`, `JpaEntityInfo`, `LombokInfo`), enriched entities, and generated `EntityRelationship[]`

## Public API

| Export | Type | Description | Location |
|--------|------|-------------|----------|
| `detectSpringFramework` | function | Checks for Spring imports/annotations | [`spring-extractor.ts:59-68`](./spring-extractor.ts) |
| `getSpringConfidence` | function | Returns 0-1 confidence for Spring usage | [`spring-extractor.ts:73-82`](./spring-extractor.ts) |
| `extractSpringInfo` | function | Extracts Spring metadata from annotations | [`spring-extractor.ts:91-97`](./spring-extractor.ts) |
| `enrichEntityWithSpring` | function | Enriches entity with Spring info and DI relationships | [`spring-extractor.ts:196-196`](./spring-extractor.ts) |
| `extractEndpoints` | function | Extracts REST endpoints from controller class | [`spring-extractor.ts:247-255`](./spring-extractor.ts) |
| `detectJpaFramework` | function | Checks for JPA/Hibernate imports | [`jpa-extractor.ts:59-70`](./jpa-extractor.ts) |
| `getJpaConfidence` | function | Returns 0-1 confidence for JPA usage | [`jpa-extractor.ts:75-84`](./jpa-extractor.ts) |
| `extractJpaInfo` | function | Extracts JPA metadata from annotations | [`jpa-extractor.ts:93-99`](./jpa-extractor.ts) |
| `enrichEntityWithJpa` | function | Enriches entity with JPA relationships | [`jpa-extractor.ts:197-203`](./jpa-extractor.ts) |
| `isJpaRepository` | function | Checks if entity is a JPA repository | [`jpa-extractor.ts:246-270`](./jpa-extractor.ts) |
| `extractRepositoryEntityType` | function | Extracts entity type from repository generics | [`jpa-extractor.ts:275-287`](./jpa-extractor.ts) |
| `extractCustomQueries` | function | Extracts @Query annotations and derived queries | [`jpa-extractor.ts:292-296`](./jpa-extractor.ts) |
| `detectLombokFramework` | function | Checks for Lombok imports/annotations | [`lombok-extractor.ts:63-71`](./lombok-extractor.ts) |
| `getLombokConfidence` | function | Returns 0-1 confidence for Lombok usage | [`lombok-extractor.ts:76-85`](./lombok-extractor.ts) |
| `extractLombokInfo` | function | Extracts Lombok metadata from annotations | [`lombok-extractor.ts:94-138`](./lombok-extractor.ts) |
| `inferGeneratedMethods` | function | Infers getter/setter/builder methods from Lombok annotations | [`lombok-extractor.ts:147-276`](./lombok-extractor.ts) |
| `enrichEntityWithLombok` | function | Enriches entity with Lombok metadata | [`lombok-extractor.ts:285-288`](./lombok-extractor.ts) |
| `hasLombokLogging` | function | Checks for Lombok logging annotations | [`lombok-extractor.ts:326-330`](./lombok-extractor.ts) |
| `getLoggerType` | function | Gets logger type from Lombok annotation | [`lombok-extractor.ts:335-347`](./lombok-extractor.ts) |

## Dependencies

### Internal Modules
| Module | Purpose |
|--------|---------|
| `../types` | Shared Java type definitions (`AnnotationInfo`, `SpringAnnotationInfo`, etc.) |
| `../../../types/parser` | `ParsedEntity` and `EntityRelationship` types |

### External Packages

_None_

## Behavioral Properties

| Property | Value |
|----------|-------|
| Detection strategy | Regex-based import/annotation scanning with confidence scoring |
| Lombok method inference | Generates virtual `ParsedEntity` objects for getters, setters, builders, constructors |
| Spring DI | Detects `@Autowired` fields and creates `depends_on` relationships |

## Error Handling

Returns empty results when annotations or decorators are missing. Confidence scores are clamped to [0, 1]. Annotation argument parsing uses regex with graceful fallback.

## Known Limitations

- Spring endpoint path concatenation is simple (no path variable resolution)
- JPA derived query parsing only validates method name prefixes, not full query semantics
- Lombok `@Value` is detected as `hasData: true` + `hasGetter: true` but immutability constraints are not tracked

## Files

| File | Description |
|------|-------------|
| `spring-extractor.ts` | Spring framework detection, annotation extraction, endpoint mapping, and DI relationship building |
| `jpa-extractor.ts` | JPA/Hibernate entity detection, relationship mapping, repository analysis, and query extraction |
| `lombok-extractor.ts` | Lombok annotation detection, generated method inference, and logging pattern identification |
