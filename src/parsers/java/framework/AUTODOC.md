# Java Framework

## 🤖 Overview

The `jpa-extractor.ts` module is designed to extract JPA-specific patterns and annotations from Java code, particularly focusing on entities and their relationships. It is used by developers and tools that need to analyze or generate code based on JPA annotations, such as identifying entities, their relationships, and repository patterns.

## 🤖 Architecture

```
  +-------------------+
  | JPA Entity       |
  | (e.g., @Entity)  |
  +-------------------+
          |
          v
  +-------------------+
  | Relationship     |
  | (e.g., @OneToMany)|
  +-------------------+
          |
          v
  +-------------------+
  | Field             |
  | (e.g., @Column)   |
  +-------------------+
          |
          v
  +-------------------+
  | Named Query       |
  | (e.g., @Query)    |
  +-------------------+
```

## 🤖 Flow

```
  +-------------------+
  | Java Code        |
  | (e.g., @Entity)  |
  +-------------------+
          |
          v
  +-------------------+
  | JPA Entity       |
  | (e.g., @Entity)  |
  +-------------------+
          |
          v
  +-------------------+
  | Relationship     |
  | (e.g., @OneToMany)|
  +-------------------+
          |
          v
  +-------------------+
  | Field             |
  | (e.g., @Column)   |
  +-------------------+
          |
          v
  +-------------------+
  | Named Query       |
  | (e.g., @Query)    |
  +-------------------+
```

## 🤖 Entity Listing

### Function
- **detectJpaFramework** — Checks if code contains JPA framework imports `jpa-extractor.ts:59-70`
- **detectLombokFramework** — Checks if code contains Lombok imports or annotations `lombok-extractor.ts:63-71`
- **detectSpringFramework** — Checks if code contains Spring framework imports `spring-extractor.ts:59-68`
- **enrichEntityWithJpa** — Enriches an entity with JPA metadata and relationships `jpa-extractor.ts:197-237`
- **enrichEntityWithLombok** — Adds Lombok metadata to an entity and creates relationships `lombok-extractor.ts:285-317`
- **enrichEntityWithSpring** — Enriches a parsed entity with Spring framework metadata and relationships `spring-extractor.ts:192-238`
- **extractCustomQueries** — Extracts custom queries from repository methods `jpa-extractor.ts:292-334`
- **extractEndpoints** — Extracts endpoints from a parsed entity and its children `spring-extractor.ts:247-297`
- **extractJpaInfo** — Parses annotations to extract JPA entity information and relationships `jpa-extractor.ts:93-143`
- **extractLombokInfo** — Parses annotations to determine Lombok-related information `lombok-extractor.ts:94-138`
- **extractMethodFromAnnotation** — Extracts the HTTP method from a Spring annotation `spring-extractor.ts:171-183`
- **extractPathFromAnnotation** — Extracts the path from a Spring annotation `spring-extractor.ts:145-166`
- **extractRelationshipInfo** — Extracts relationship information from a JPA annotation `jpa-extractor.ts:163-188`
- **extractRepositoryEntityType** — Extracts the entity type from a JPA repository interface `jpa-extractor.ts:275-287`
- **extractSpringInfo** — Parses annotations to extract Spring framework information and relationships `spring-extractor.ts:91-140`
- **extractTableName** — Extracts the table name from a JPA @Table annotation `jpa-extractor.ts:148-158`
- **getJpaConfidence** — Detects JPA framework confidence level `jpa-extractor.ts:75-84`
- **getLoggerType** — Determines the logger type based on Lombok logging annotations `lombok-extractor.ts:335-347`
- **getLombokConfidence** — Detects Lombok framework confidence level based on code patterns `lombok-extractor.ts:76-85`
- **getSpringConfidence** — Detects Spring framework confidence level `spring-extractor.ts:73-82`
- **hasLombokLogging** — Checks if an entity has Lombok logging annotations `lombok-extractor.ts:326-330`
- **inferGeneratedMethods** — Infers generated methods based on Lombok annotations and fields `lombok-extractor.ts:147-276`
- **isJpaRepository** — Determines if an entity is a JPA repository `jpa-extractor.ts:246-270`
- **params** — Filters and maps fields to extract property names and types `lombok-extractor.ts:255-255`
- **params** — Maps fields to extract property names and types `lombok-extractor.ts:256-259`
- **parseDerivedQueryMethod** — Parses derived query methods from repository names `jpa-extractor.ts:339-355`

### Import_decl
- **../../../types/parser.js** — Imports `../../../types/parser.js` from `../../../types/parser.js`. `jpa-extractor.ts:15-15`, `lombok-extractor.ts:15-15`, `spring-extractor.ts:15-15`
- **../types.js** — Imports `../types.js` from `../types.js`. `jpa-extractor.ts:16-16`, `lombok-extractor.ts:16-16`, `spring-extractor.ts:16-16`

### Property
- **entity** — Represents a parsed entity `jpa-extractor.ts:201-201`, `lombok-extractor.ts:286-286`, `spring-extractor.ts:196-196`
- **handlerName** — Represents the handler name of an endpoint `spring-extractor.ts:253-253`
- **handlerName** — Stores the handler name `spring-extractor.ts:259-259`
- **isNative** — Optionally indicates if the query is native `jpa-extractor.ts:295-295`, `jpa-extractor.ts:300-300`
- **jpaInfo** — Represents JPA entity information `jpa-extractor.ts:97-97`
- **location** — Represents the location information `spring-extractor.ts:254-254`, `spring-extractor.ts:260-260`
- **method** — Represents the HTTP method of an endpoint `spring-extractor.ts:252-252`
- **method** — Stores the HTTP method `spring-extractor.ts:258-258`
- **methodName** — Represents the name of the method `jpa-extractor.ts:293-293`, `jpa-extractor.ts:298-298`
- **path** — Represents the path of an endpoint `spring-extractor.ts:251-251`
- **path** — Stores the request path `spring-extractor.ts:257-257`
- **query** — Optionally holds a string query `jpa-extractor.ts:294-294`, `jpa-extractor.ts:299-299`
- **relationships** — Stores entity relationships `jpa-extractor.ts:98-98`, `jpa-extractor.ts:202-202`
- **relationships** — Represents relationships between entities `lombok-extractor.ts:287-287`
- **relationships** — Stores an array of entity relationships `spring-extractor.ts:96-96`, `spring-extractor.ts:197-197`
- **springInfo** — Represents the Spring annotation information `spring-extractor.ts:95-95`

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
