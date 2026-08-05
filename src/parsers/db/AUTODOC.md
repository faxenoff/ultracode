# Db

Database schema analysis module linking ORM/SQL to code entities and detecting migrations.

## Overview

The Db module analyzes database schemas and links them to code entities, enabling detection of ORM patterns, Redis usage, and data access relationships throughout the codebase. It provides parsers for multiple schema definition formats (SQL, Prisma, LINQ) and pattern detectors to extract database usage from code. By connecting schema metadata to code entities, the module enables impact analysis of database changes and discovery of how applications interact with persistent data stores.

## Flow

```
Schema Files (SQL, Prisma, LINQ)
        ↓
    [Parsers]
    /   |   \
   ↓    ↓    ↓
 SqlParser  PrismaParser  LinqParser
        ↓
  [Schema Extraction]
  Tables, Columns, Constraints
        ↓
  [Pattern Detectors]
  /           \
 ↓             ↓
ORM Models    Redis Patterns
        ↓
[DbSchemaAnalysis]
        ↓
Code Entity → Database Entity Links
(reads_table, writes_table, maps_to_table)
```

## Entity Listing

### Type Definitions

| Entity | Description | Location |
|--------|-------------|----------|
| `DbEngine` | Identifier for supported database engines (postgres, mysql, sqlite, etc.). | types.ts:63 |
| `DbColumn` | Database column definition including name, type, constraints, and default values. | types.ts:10-19 |
| `DbIndex` | Index definition with indexed column names, uniqueness flag, and index type. | types.ts:21-26 |
| `DbForeignKey` | Foreign key constraint linking one or more columns to a referenced table. | types.ts:28-34 |
| `DbCodeLink` | Mapping between a code entity and a database entity with link type and context. | types.ts:36-45 |
| `DbSchemaAnalysis` | Complete database schema analysis result containing tables, indexes, foreign keys, relationships, and code links. | types.ts:47-52 |
| `DbRelationship` | Relationship between database entities defining cardinality and join conditions. | types.ts:54-61 |

### Parsers

| Entity | Description | Location |
|--------|-------------|----------|
| `SqlParser` | Parses SQL files with dialect detection (PostgreSQL, MySQL, SQLite) to extract table definitions, columns, indexes, and constraints. | sql-parser.ts:18-108 |
| `PrismaParser` | Parses Prisma schema files (.prisma) into structured database entity definitions with models and relationships. | prisma-parser.ts:16-116 |
| `LinqParser` | Extracts LINQ queries and metadata from .linq files for analyzing LINQ-based data access patterns. | linq-parser.ts:15-92 |

### Pattern Detectors

| Entity | Description | Location |
|--------|-------------|----------|
| `detectOrmSchemas` | Identifies ORM model classes from indexed code entities and maps them to database tables via naming and field matching. | orm-detector.ts:23-47 |
| `detectRedisPatterns` | Extracts Redis key patterns and data structure operations (sets, hashes, sorted sets) from code usage. | redis-detector.ts:18-38 |

## Dependencies

**Internal:**
- `Entity` type from ~~`../../types/storage.js`~~ (deleted) — indexed code entities representing classes, functions, and methods
- `RelationType` from ~~`../../types/storage.js`~~ (deleted) — enumeration of relationship types (reads_table, writes_table, maps_to_table) connecting code to database

## Design Patterns

- **Parser Pattern**: SqlParser, PrismaParser, and LinqParser follow a consistent interface for extracting structured data from different schema definition formats.
- **Detector Pattern**: ORM and Redis detectors use heuristics (naming conventions, field types, metadata analysis) to infer database usage without explicit markers.
- **Linker Pattern**: Creates relationship edges between code entities and database entities for impact analysis, following the pattern established by swagger-code-linker and protobuf-code-linker.

## New (pending description)

- **OrmTableInfo** — `schema-drift-detector.ts:140-145`
- **analyzeDbCodeLinks** — `db-code-linker.ts:22-60`
- **<anonymous>** — `db-code-linker.ts:22-22`
- **e** — `db-code-linker.ts:24-24`
- **e** — `db-code-linker.ts:25-25`
- **buildDbRelationships** — `db-code-linker.ts:69-112`
- **<anonymous>** — `db-code-linker.ts:69-69`
- **detectRepositoryLinks** — `db-code-linker.ts:118-168`
- **<anonymous>** — `db-code-linker.ts:118-118`
- **detectSqlStringsInCode** — `db-code-linker.ts:170-195`
- **<anonymous>** — `db-code-linker.ts:170-170`
- **detectMigrationLinks** — `db-code-linker.ts:197-217`
- **<anonymous>** — `db-code-linker.ts:197-197`
- **isMigrationFile** — `db-code-linker.ts:223-225`
- **<anonymous>** — `db-code-linker.ts:223-223`
- **findTableForModel** — `db-code-linker.ts:227-239`
- **<anonymous>** — `db-code-linker.ts:227-227`
- **detectMigration** — `migration-detector.ts:23-33`
- **<anonymous>** — `migration-detector.ts:23-23`
- **isMigrationFile** — `migration-detector.ts:38-40`
- **<anonymous>** — `migration-detector.ts:38-38`
- **classifyMigrations** — `migration-detector.ts:46-67`
- **<anonymous>** — `migration-detector.ts:46-46`
- **a** — `migration-detector.ts:65-65`
- **extractMigrationOperations** — `migration-detector.ts:73-238`
- **<anonymous>** — `migration-detector.ts:73-73`
- **detectFlyway** — `migration-detector.ts:261-278`
- **<anonymous>** — `migration-detector.ts:261-261`
- **detectPrismaMigration** — `migration-detector.ts:281-298`
- **<anonymous>** — `migration-detector.ts:281-281`
- **detectEfCore** — `migration-detector.ts:301-322`
- **<anonymous>** — `migration-detector.ts:301-301`
- **detectAlembic** — `migration-detector.ts:325-347`
- **<anonymous>** — `migration-detector.ts:325-325`
- **detectDjango** — `migration-detector.ts:350-369`
- **<anonymous>** — `migration-detector.ts:350-350`
- **detectTypeOrmMigration** — `migration-detector.ts:372-406`
- **<anonymous>** — `migration-detector.ts:372-372`
- **detectSequelizeMigration** — `migration-detector.ts:409-426`
- **<anonymous>** — `migration-detector.ts:409-409`
- **detectKnexMigration** — `migration-detector.ts:429-450`
- **<anonymous>** — `migration-detector.ts:429-429`
- **detectGoose** — `migration-detector.ts:453-473`
- **<anonymous>** — `migration-detector.ts:453-453`
- **detectDbmate** — `migration-detector.ts:476-496`
- **<anonymous>** — `migration-detector.ts:476-476`
- **detectGenericSqlMigration** — `migration-detector.ts:499-546`
- **<anonymous>** — `migration-detector.ts:499-499`
- **extractAffectedTables** — `migration-detector.ts:552-576`
- **<anonymous>** — `migration-detector.ts:552-552`
- **extractTimestampFromContent** — `migration-detector.ts:603-606`
- **<anonymous>** — `migration-detector.ts:603-603`
- **extractOrderFromPath** — `migration-detector.ts:608-611`
- **<anonymous>** — `migration-detector.ts:608-608`
- **extractNameFromPath** — `migration-detector.ts:613-617`
- **<anonymous>** — `migration-detector.ts:613-613`
- **toSnakeCase** — `migration-detector.ts:619-624`
- **<anonymous>** — `migration-detector.ts:619-619`
- **buildMigrationSchema** — `migration-schema-builder.ts:26-62`
- **<anonymous>** — `migration-schema-builder.ts:26-26`
- **m** — `migration-schema-builder.ts:52-52`
- **buildSchemaFromSql** — `migration-schema-builder.ts:68-93`
- **<anonymous>** — `migration-schema-builder.ts:68-68`
- **applyMigration** — `migration-schema-builder.ts:99-115`
- **<anonymous>** — `migration-schema-builder.ts:99-99`
- **e** — `migration-schema-builder.ts:101-101`
- **applyOperation** — `migration-schema-builder.ts:117-223`
- **<anonymous>** — `migration-schema-builder.ts:117-117`
- **i** — `migration-schema-builder.ts:197-197`
- **i** — `migration-schema-builder.ts:209-209`
- **addTableFromEntity** — `migration-schema-builder.ts:229-267`
- **<anonymous>** — `migration-schema-builder.ts:229-229`
- **i** — `migration-schema-builder.ts:244-244`
- **applyRawSqlToSchema** — `migration-schema-builder.ts:273-345`
- **<anonymous>** — `migration-schema-builder.ts:273-273`
- **c** — `migration-schema-builder.ts:298-302`
- **c** — `migration-schema-builder.ts:305-309`
- **detectSchemaDrift** — `schema-drift-detector.ts:29-134`
- **<anonymous>** — `schema-drift-detector.ts:29-29`
- **buildOrmTableMap** — `schema-drift-detector.ts:147-178`
- **<anonymous>** — `schema-drift-detector.ts:147-147`
- **e** — `schema-drift-detector.ts:157-157`
- **extractColumnsFromEntity** — `schema-drift-detector.ts:180-202`
- **<anonymous>** — `schema-drift-detector.ts:180-180`
- **typesMatch** — `schema-drift-detector.ts:211-219`
- **<anonymous>** — `schema-drift-detector.ts:211-211`
- **group** — `schema-drift-detector.ts:218-218`
- **normalizeType** — `schema-drift-detector.ts:221-228`
- **<anonymous>** — `schema-drift-detector.ts:221-221`
- **normalizeOrmType** — `schema-drift-detector.ts:230-248`
- **<anonymous>** — `schema-drift-detector.ts:230-230`
- **calculateDriftScore** — `schema-drift-detector.ts:278-290`
- **<anonymous>** — `schema-drift-detector.ts:278-278`
- **generateSummary** — `schema-drift-detector.ts:292-320`
- **<anonymous>** — `schema-drift-detector.ts:292-292`
- **m** — `schema-drift-detector.ts:296-296`
- **o** — `schema-drift-detector.ts:301-301`
- **issue** — `schema-drift-detector.ts:310-310`
- **dbEntities** — `db-code-linker.ts:24-24`
- **codeEntities** — `db-code-linker.ts:25-25`
- **tableNames** — `db-code-linker.ts:27-27`
- **name** — `db-code-linker.ts:30-30`
- **tableLinks** — `db-code-linker.ts:35-35`
- **repositories** — `db-code-linker.ts:36-36`
- **repoLinks** — `db-code-linker.ts:40-40`
- **sqlLinks** — `db-code-linker.ts:44-44`
- **migrationLinks** — `db-code-linker.ts:49-49`
- **relationships** — `db-code-linker.ts:70-70`
- **links** — `db-code-linker.ts:119-119`
- **name** — `db-code-linker.ts:120-120`
- **repoSuffixes** — `db-code-linker.ts:123-123`
- **prefix** — `db-code-linker.ts:126-126`
- **superClass** — `db-code-linker.ts:149-149`
- **jpaMatch** — `db-code-linker.ts:150-150`
- **modelName** — `db-code-linker.ts:152-152`
- **tableName** — `db-code-linker.ts:153-153`
- **links** — `db-code-linker.ts:171-171`
- **body** — `db-code-linker.ts:172-172`
- **sqlMatches** — `db-code-linker.ts:175-175`
- **seenTables** — `db-code-linker.ts:177-177`
- **table** — `db-code-linker.ts:179-179`
- **isWrite** — `db-code-linker.ts:182-182`
- **links** — `db-code-linker.ts:198-198`
- **body** — `db-code-linker.ts:199-199`
- **tableMatches** — `db-code-linker.ts:201-203`
- **table** — `db-code-linker.ts:205-205`
- **snake** — `db-code-linker.ts:228-231`
- **normalized** — `migration-detector.ts:24-24`
- **result** — `migration-detector.ts:28-28`
- **migrations** — `migration-detector.ts:47-47`
- **body** — `migration-detector.ts:53-53`
- **info** — `migration-detector.ts:54-54`
- **ops** — `migration-detector.ts:74-74`
- **upper** — `migration-detector.ts:75-75`
- **createTableRe** — `migration-detector.ts:78-79`
- **dropTableRe** — `migration-detector.ts:85-85`
- **alterAddColRe** — `migration-detector.ts:91-91`
- **alterDropColRe** — `migration-detector.ts:101-101`
- **alterRe** — `migration-detector.ts:112-112`
- **renameTableRe** — `migration-detector.ts:119-119`
- **createIndexRe** — `migration-detector.ts:129-130`
- **dropIndexRe** — `migration-detector.ts:140-140`
- **efCreateRe** — `migration-detector.ts:147-147`
- **efAddColRe** — `migration-detector.ts:151-151`
- **efDropTableRe** — `migration-detector.ts:159-159`
- **efDropColRe** — `migration-detector.ts:163-163`
- **djCreateRe** — `migration-detector.ts:175-175`
- **djAddFieldRe** — `migration-detector.ts:179-179`
- **djRemoveFieldRe** — `migration-detector.ts:187-187`
- **djDeleteRe** — `migration-detector.ts:195-195`
- **djRenameRe** — `migration-detector.ts:199-199`
- **tormCreateRe** — `migration-detector.ts:211-211`
- **tormDropRe** — `migration-detector.ts:215-215`
- **knexCreateRe** — `migration-detector.ts:223-223`
- **knexDropRe** — `migration-detector.ts:227-227`
- **knexAlterRe** — `migration-detector.ts:231-231`
- **FRAMEWORK_DETECTORS** — `migration-detector.ts:246-258`
- **match** — `migration-detector.ts:262-262`
- **vType** — `migration-detector.ts:265-265`
- **version** — `migration-detector.ts:266-266`
- **description** — `migration-detector.ts:267-267`
- **match** — `migration-detector.ts:286-286`
- **match** — `migration-detector.ts:305-305`
- **match** — `migration-detector.ts:326-326`
- **order** — `migration-detector.ts:330-330`
- **revMatch** — `migration-detector.ts:332-332`
- **match** — `migration-detector.ts:351-351`
- **tsMatch** — `migration-detector.ts:378-378`
- **order** — `migration-detector.ts:393-393`
- **match** — `migration-detector.ts:414-414`
- **match** — `migration-detector.ts:433-433`
- **match** — `migration-detector.ts:458-458`
- **match** — `migration-detector.ts:481-481`
- **tsMatch** — `migration-detector.ts:518-518`
- **seqMatch** — `migration-detector.ts:532-532`
- **tables** — `migration-detector.ts:553-553`
- **patterns** — `migration-detector.ts:555-564`
- **name** — `migration-detector.ts:568-568`
- **SQL_KEYWORDS** — `migration-detector.ts:578-601`
- **match** — `migration-detector.ts:604-604`
- **match** — `migration-detector.ts:609-609`
- **parts** — `migration-detector.ts:614-614`
- **fileName** — `migration-detector.ts:615-615`
- **schema** — `migration-schema-builder.ts:27-31`
- **entitiesByFile** — `migration-schema-builder.ts:34-34`
- **list** — `migration-schema-builder.ts:36-36`
- **fileEntities** — `migration-schema-builder.ts:43-43`
- **isMigrationEntity** — `migration-schema-builder.ts:52-52`
- **tableName** — `migration-schema-builder.ts:55-55`
- **schema** — `migration-schema-builder.ts:69-73`
- **ops** — `migration-schema-builder.ts:76-76`
- **migration** — `migration-schema-builder.ts:77-85`
- **tableEntities** — `migration-schema-builder.ts:101-101`
- **tableName** — `migration-schema-builder.ts:106-106`
- **tableName** — `migration-schema-builder.ts:118-118`
- **table** — `migration-schema-builder.ts:145-145`
- **colName** — `migration-schema-builder.ts:147-147`
- **table** — `migration-schema-builder.ts:162-162`
- **colName** — `migration-schema-builder.ts:164-164`
- **table** — `migration-schema-builder.ts:172-172`
- **newName** — `migration-schema-builder.ts:174-174`
- **table** — `migration-schema-builder.ts:186-186`
- **table** — `migration-schema-builder.ts:194-194`
- **indexName** — `migration-schema-builder.ts:196-196`
- **indexName** — `migration-schema-builder.ts:207-207`
- **idx** — `migration-schema-builder.ts:209-209`
- **existing** — `migration-schema-builder.ts:230-230`
- **fields** — `migration-schema-builder.ts:232-232`
- **indexes** — `migration-schema-builder.ts:233-233`
- **foreignKeys** — `migration-schema-builder.ts:234-234`
- **columns** — `migration-schema-builder.ts:253-253`
- **createTableRe** — `migration-schema-builder.ts:275-276`
- **tableName** — `migration-schema-builder.ts:279-279`
- **body** — `migration-schema-builder.ts:280-280`
- **columns** — `migration-schema-builder.ts:282-282`
- **foreignKeys** — `migration-schema-builder.ts:283-283`
- **trimmed** — `migration-schema-builder.ts:287-287`
- **fkMatch** — `migration-schema-builder.ts:293-295`
- **colMatch** — `migration-schema-builder.ts:317-317`
- **col** — `migration-schema-builder.ts:319-322`
- **drift** — `schema-drift-detector.ts:34-40`
- **ormTables** — `schema-drift-detector.ts:43-43`
- **migTable** — `schema-drift-detector.ts:68-68`
- **migCol** — `schema-drift-detector.ts:73-73`
- **map** — `schema-drift-detector.ts:148-148`
- **tableName** — `schema-drift-detector.ts:153-153`
- **entity** — `schema-drift-detector.ts:157-157`
- **columns** — `schema-drift-detector.ts:159-159`
- **fields** — `schema-drift-detector.ts:163-163`
- **columns** — `schema-drift-detector.ts:181-181`
- **dbFields** — `schema-drift-detector.ts:184-184`
- **members** — `schema-drift-detector.ts:188-188`
- **a** — `schema-drift-detector.ts:212-212`
- **b** — `schema-drift-detector.ts:213-213`
- **map** — `schema-drift-detector.ts:232-245`
- **lower** — `schema-drift-detector.ts:246-246`
- **TYPE_EQUIVALENCES** — `schema-drift-detector.ts:250-272`
- **totalTables** — `schema-drift-detector.ts:281-281`
- **missingWeight** — `schema-drift-detector.ts:284-284`
- **orphanedWeight** — `schema-drift-detector.ts:285-285`
- **columnWeight** — `schema-drift-detector.ts:286-286`
- **rawScore** — `schema-drift-detector.ts:288-288`
- **parts** — `schema-drift-detector.ts:293-293`
- **tables** — `schema-drift-detector.ts:296-296`
- **tables** — `schema-drift-detector.ts:301-301`
- **byIssue** — `schema-drift-detector.ts:306-306`
- **issues** — `schema-drift-detector.ts:310-310`
- **score** — `schema-drift-detector.ts:318-318`
- **FrameworkDetector** — `migration-detector.ts:244-244`
