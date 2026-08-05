# GraphQL

## 🤖 Overview

The `src/parsers/graphql` module provides tools for analyzing and linking GraphQL schema definitions with source code. It identifies resolver implementations, generated hooks/queries, and types, and re-exports these functionalities for use in other modules. Developers and tools that need to understand or manipulate GraphQL code structures will find this module useful.

## 🤖 Architecture

```
  +---------------------+
  |     GraphQL Parser  |
  +---------------------+
          |               |
          v               v
  +---------------------+   +---------------------+
  |  GraphQL Code Linker  |   |     Types Definitions  |
  +---------------------+   +---------------------+
          |               |
          v               v
  +---------------------+
  |     Re-exports      |
  +---------------------+
```

## 🤖 Flow

```
  +---------------------+
  |     GraphQL Parser  |
  +---------------------+
          |               |
          v               v
  +---------------------+   +---------------------+
  |  GraphQL Code Linker  |   |     Types Definitions  |
  +---------------------+   +---------------------+
          |               |
          v               v
  +---------------------+
  |     Re-exports      |
  +---------------------+
```

## 🤖 Entity Listing

### Function
- **analyzeGraphQLCodeLinks** — Analyzes relationships between GraphQL schema definitions and source code `graphql-code-linker.ts:113-168`
- **argsStr** — Converts a GraphQL argument list to a string `graphql-parser.ts:850-850`
- **buildGraphQLRelationships** — Builds relationships between GraphQL entities and code entities `graphql-code-linker.ts:173-225`
- **codeEntities** — Represents entities in the source code `graphql-code-linker.ts:117-117`
- **codeTypes** — Represents types in the source code `graphql-code-linker.ts:371-371`
- **decorators** — Represents decorators used in the source code `graphql-code-linker.ts:242-242`
- **detectConsumers** — Detects consumers of generated GraphQL files `graphql-code-linker.ts:305-348`
- **detectResolvers** — Detects resolver implementations in the source code `graphql-code-linker.ts:231-286`
- **findBestGraphQLMatch** — Finds the best match for a GraphQL entity in the source code `graphql-code-linker.ts:288-299`
- **findBestOperationMatch** — Finds the best match for an operation in the source code `graphql-code-linker.ts:350-363`
- **findCodegenConfigs** — Finds code generation configurations `graphql-code-linker.ts:437-449`
- **findGeneratedMarkers** — Finds markers in generated GraphQL files `graphql-code-linker.ts:425-435`
- **getGraphQLCodegenConfigFiles** — Gets files containing GraphQL code generation configurations `graphql-code-linker.ts:452-454`
- **getGraphQLGeneratedCodeMarkers** — Gets markers in generated GraphQL files `graphql-code-linker.ts:457-459`
- **graphqlEntities** — Represents entities in the GraphQL schema `graphql-code-linker.ts:115-115`
- **graphqlOperations** — Represents operations in the GraphQL schema `graphql-code-linker.ts:140-143`
- **graphqlTypes** — Represents types in the GraphQL schema `graphql-code-linker.ts:132-136`
- **interfaces** — Not present in the provided code `graphql-parser.ts:261-261`
- **isGenerated** — Determines if a file is generated `graphql-code-linker.ts:309-309`
- **isGenerated** — Checks if the file path matches any of the generated file patterns `graphql-code-linker.ts:382-382`
- **locations** — Not present in the provided code `graphql-parser.ts:573-573`
- **matchGraphQLTypesToCode** — Matches GraphQL types to code entities `graphql-code-linker.ts:369-419`
- **memberTypes** — Not present in the provided code `graphql-parser.ts:613-613`
- **metadata** — Not present in the provided code `graphql-parser.ts:268-275`
- **metadata** — Maps fields to an object containing name, type, isNonNull, isList, and defaultValue if present `graphql-parser.ts:395-401`
- **metadata** — Parses fields and their metadata, including name, type, isNonNull, isList, and defaultValue `graphql-parser.ts:446-452`
- **stripTypeSuffix** — Strips type suffixes from generated GraphQL types `graphql-code-linker.ts:465-474`

### Method
- **buildFieldSignature** — Builds a field signature from a GraphQL field definition `graphql-parser.ts:847-856`
- **extractBaseType** — Extracts the base type from a GraphQL type string `graphql-parser.ts:828-833`
- **extractBlocks** — Not present in the provided code `graphql-parser.ts:155-235`
- **extractDescriptions** — Extracts descriptions from a GraphQL type definition `graphql-parser.ts:789-814`
- **findOriginalLine** — Finds the original line number of a GraphQL string `graphql-parser.ts:840-845`
- **getStats** — Not present in the provided code `graphql-parser.ts:82-93`
- **initialize** — A method to initialize the parser, though no initialization is needed for this parser `graphql-parser.ts:54-56`
- **isBuiltinType** — Checks if a type is a built-in type `graphql-parser.ts:835-838`
- **makeLocation** — Creates a location object for a GraphQL error `graphql-parser.ts:858-863`
- **parse** — Parses a GraphQL file and returns a result object containing entities, relationships, and errors `graphql-parser.ts:62-80`
- **parseArguments** — Not present in the provided code `graphql-parser.ts:719-741`
- **parseDirectives** — Not present in the provided code `graphql-parser.ts:559-595`
- **parseEnum** — Not present in the provided code `graphql-parser.ts:485-520`
- **parseFields** — Not present in the provided code `graphql-parser.ts:684-717`
- **parseGraphQL** — Parses a GraphQL file and returns a result object containing entities, relationships, and errors `graphql-parser.ts:99-149`
- **parseInput** — Not present in the provided code `graphql-parser.ts:434-479`
- **parseInterface** — Not present in the provided code `graphql-parser.ts:383-428`
- **parseScalars** — Not present in the provided code `graphql-parser.ts:526-557`
- **parseSchemaDefinition** — Not present in the provided code `graphql-parser.ts:647-678`
- **parseType** — Not present in the provided code `graphql-parser.ts:241-377`
- **parseTypeString** — Parses a type string to extract its base type and modifiers `graphql-parser.ts:763-783`
- **parseUnions** — Not present in the provided code `graphql-parser.ts:597-645`
- **splitArguments** — Not present in the provided code `graphql-parser.ts:743-761`
- **stripComments** — Removes comments from a GraphQL string `graphql-parser.ts:820-826`
- **supportsFile** — A method to check if a file supports parsing, returning true if the file ends with ".graphql" or ".gql" `graphql-parser.ts:58-60`

### Class
- **GraphQLSchemaParser** — A class for parsing GraphQL files, extracting entities, relationships, and errors `graphql-parser.ts:49-864`

### Interface
- **GraphQLAnalysis** — Complete GraphQL analysis result for a project `types.ts:33-44`
- **GraphQLArg** — Represents an argument for a GraphQL field `types.ts:67-71`
- **GraphQLBlock** — Represents a block of GraphQL code, including its keyword, name, body, and location `graphql-parser.ts:25-33`
- **GraphQLCodeLink** — A link between a GraphQL entity and a code entity `types.ts:13-28`
- **GraphQLFieldDef** — Defines a field in the GraphQL schema `types.ts:76-83`
- **GraphQLParseResult** — Represents the result of parsing a GraphQL file, containing entities, relationships, and errors `graphql-parser.ts:19-23`
- **GraphQLRelationship** — GraphQL relationship for graph storage `types.ts:49-62`

### Import_decl
- **../../types/parser.js** — Imports `../../types/parser.js` from `../../types/parser.js`. `graphql-parser.ts:11-11`
- **../../types/storage.js** — Imports `../../types/storage.js` from `../../types/storage.js`. `graphql-code-linker.ts:11-11`, `graphql-code-linker.ts:12-12`, `types.ts:8-8`
- **../base-parser.js** — Imports `../base-parser.js` from `../base-parser.js`. `graphql-parser.ts:12-12`
- **./types.js** — Imports `./types.js` from `./types.js`. `graphql-code-linker.ts:13-13`, `graphql-parser.ts:13-13`

### Property
- **args** — Arguments for the field `types.ts:81-81`
- **baseType** — Determines the base type of a given GraphQL type `graphql-parser.ts:764-764`
- **body** — The body of the block, containing the actual GraphQL code `graphql-parser.ts:29-29`
- **codeEntityName** — Name of the resolver/type in code `types.ts:17-17`
- **codeFilePath** — File path of the code entity `types.ts:19-19`
- **codegenConfigs** — Codegen config files found `types.ts:43-43`
- **column** — Not present in the provided code `graphql-parser.ts:102-102`
- **column** — The column number of an error message `graphql-parser.ts:22-22`
- **confidence** — Confidence score 0-1 `types.ts:25-25`
- **confidence** — Represents the confidence level, which is optional `types.ts:56-56`
- **consumers** — Generated hooks/queries (consumers) `types.ts:37-37`
- **context** — Contextual information for the field `types.ts:60-60`
- **defaultValue** — Default value for the field or argument `types.ts:70-70`
- **description** — Description of the field or argument `types.ts:82-82`
- **endLine** — The ending line number of the block `graphql-parser.ts:31-31`
- **entities** — An array of parsed entities from the GraphQL file `graphql-parser.ts:20-20`
- **errorCount** — The total number of errors encountered during parsing `graphql-parser.ts:52-52`
- **errors** — An array of error messages with their locations in the parsed file `graphql-parser.ts:22-22`
- **evidence** — Evidence for why these were linked `types.ts:27-27`
- **evidence** — Represents an array of evidence, which is optional `types.ts:57-57`
- **fieldName** — Name of the field in the GraphQL schema `types.ts:59-59`
- **filesParsed** — A counter for the number of files parsed `graphql-parser.ts:50-50`
- **fromFile** — File path of the entity in the relationship `types.ts:53-53`
- **fromName** — Name of the entity in the relationship `types.ts:50-50`
- **generatedFileMarkers** — Markers found in generated files `types.ts:41-41`
- **generatedTypes** — Generated types `types.ts:39-39`
- **graphqlEntityName** — Name of the type/query/mutation in GraphQL `types.ts:15-15`
- **graphqlFilePath** — File path of the GraphQL schema `types.ts:21-21`
- **implementsClause** — The implements clause of the block, if present `graphql-parser.ts:28-28`
- **isExtension** — A boolean indicating whether the block is an extension `graphql-parser.ts:32-32`
- **isList** — Checks if a type is a list `graphql-parser.ts:766-766`
- **isList** — Indicates whether the field is a list `types.ts:80-80`
- **isNonNull** — Checks if a type is non-null `graphql-parser.ts:765-765`
- **isNonNull** — Indicates whether the field is non-null `types.ts:79-79`
- **keyword** — The keyword defining the block, such as "query", "mutation", or "subscription" `graphql-parser.ts:26-26`
- **line** — Not present in the provided code `graphql-parser.ts:102-102`
- **line** — The line number of an error message `graphql-parser.ts:22-22`
- **linkType** — Type of link `types.ts:23-23`
- **location** — Not present in the provided code `graphql-parser.ts:102-102`
- **location** — The location of an error message, specified by line and column numbers `graphql-parser.ts:22-22`
- **message** — Not present in the provided code `graphql-parser.ts:102-102`
- **message** — A message associated with an error `graphql-parser.ts:22-22`
- **metadata** — Metadata for the relationship `types.ts:55-61`
- **name** — Represents the name of an entity `graphql-code-linker.ts:241-241`
- **name** — The name of the block, such as a query or mutation name `graphql-parser.ts:27-27`
- **name** — Name of the field or argument `types.ts:68-68`
- **name** — Represents the name of a type `types.ts:77-77`
- **relationships** — An array of entity relationships extracted from the GraphQL file `graphql-parser.ts:21-21`
- **resolvers** — Resolver implementations `types.ts:35-35`
- **startLine** — The starting line number of the block `graphql-parser.ts:30-30`
- **toFile** — File path of the entity in the relationship `types.ts:54-54`
- **toName** — Name of the entity in the relationship `types.ts:51-51`
- **totalParseTimeMs** — The total time taken to parse all files in milliseconds `graphql-parser.ts:51-51`
- **type** — Type of the field or argument `types.ts:69-69`
- **type** — Type of the relationship `types.ts:52-52`, `types.ts:78-78`
- **typeName** — Type name for the relationship `types.ts:58-58`

## Entities

### Public API

| Name | Description | Location |
|------|-------------|----------|
| `analyzeGraphQLCodeLinks` | Analyzes and returns links between GraphQL schema entities and their resolver implementations, generated types, and consumer code | graphql-code-linker.ts:113-168 |
| `buildGraphQLRelationships` | Constructs a relationship graph from parsed GraphQL schema definitions, organizing entities and their connections for storage | graphql-code-linker.ts:173-225 |
| `getGraphQLCodegenConfigFiles` | Returns list of detected GraphQL code generation configuration files in the project | graphql-code-linker.ts:452-454 |
| `getGraphQLGeneratedCodeMarkers` | Returns markers and patterns used to identify GraphQL code generation artifacts in output files | graphql-code-linker.ts:452-454 |

### Parsers

| Name | Description | Location |
|------|-------------|----------|
| `GraphQLSchemaParser` | Parser for .graphql/.gql schema files that extracts field definitions, types, arguments, and mutations into structured entities | graphql-parser.ts:49 |

### Types

| Name | Description | Location |
|------|-------------|----------|
| `GraphQLAnalysis` | Complete analysis result containing all discovered GraphQL entities, relationships, and code links for a project | types.ts:33-44 |
| `GraphQLCodeLink` | Represents a bidirectional link between a GraphQL schema entity and a code entity (resolver, generated type, consumer) | types.ts:13-28 |
| `GraphQLRelationship` | Relationship entry for storage in the graph system, tracking connections between GraphQL definitions and code | types.ts:49-62 |
| `GraphQLFieldDef` | Schema field definition including name, type, arguments, and description | types.ts:76-83 |
| `GraphQLArg` | Field argument definition with type information and default values | types.ts:67-71 |

## Exports

- `analyzeGraphQLCodeLinks`
- `buildGraphQLRelationships`
- `getGraphQLCodegenConfigFiles`
- `getGraphQLGeneratedCodeMarkers`

## Files

| File | Purpose |
|------|---------|
| graphql-code-linker.ts | Core analysis engine that links GraphQL schema definitions to resolver implementations and generated code, using patterns for type suffixes, generated file markers, and resolver framework detection |
| graphql-parser.ts | Text-based parser for .graphql/.gql schema files that extracts type definitions, fields, arguments, and mutations into entity structures |
| index.ts | Module exports aggregating parsing and linking functionality |
| types.ts | Type definitions for GraphQL analysis results, code links, relationships, and schema entities |

## Key Dependencies

- **types/storage.ts** — Provides `Entity` and `RelationType` for representing GraphQL entities and their relationships within the storage graph system
- **swagger-code-linker.ts** — Design reference; GraphQL linker implements the same pattern-based linking approach for schema-to-code relationship analysis

## Design Patterns

**Pattern Linking**: Detector uses generated file patterns (`.generated.ts`, `__generated__/`, markers like `@generated`) and resolver framework patterns (Apollo, tRPC, Fastify) to establish code-to-schema relationships without explicit imports.
