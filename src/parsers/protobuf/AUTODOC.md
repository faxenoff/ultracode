# Protobuf

## 🤖 Overview

The `protobuf-code-linker.ts` and `protobuf-parser.ts` files are responsible for parsing and linking Protobuf code. The `types.ts` file defines the types used in the module. This module is used by developers to analyze and build relationships between Protobuf code and its generated code.

## 🤖 Architecture

```
protobuf-code-linker.ts
    |
    v
protobuf-parser.ts
    |
    v
types.ts
```

## 🤖 Flow

```
protobuf-parser.ts
    |
    v
protobuf-code-linker.ts
    |
    v
types.ts
```

## 🤖 Entity Listing

### Function
- **analyzeProtobufCodeLinks** — Analyzes relationships between protobuf service definitions and source code `protobuf-code-linker.ts:96-137`
- **buildProtobufRelationships** — Builds relationships between protobuf service definitions and source code `protobuf-code-linker.ts:142-194`
- **codeEntities** — Represents entities in the source code `protobuf-code-linker.ts:99-99`
- **codeTypes** — Represents types in the source code `protobuf-code-linker.ts:316-316`
- **computeNameSimilarity** — Computes the similarity between names of protobuf service definitions and source code entities `protobuf-code-linker.ts:449-460`
- **detectConsumers** — Detects gRPC client stubs (consumers) `protobuf-code-linker.ts:261-306`
- **detectProducers** — Detects gRPC server implementations (producers) `protobuf-code-linker.ts:200-255`
- **findCodegenConfigs** — Finds code generation configurations `protobuf-code-linker.ts:398-410`
- **findGeneratedMarkers** — Finds markers in generated protobuf files `protobuf-code-linker.ts:386-396`
- **getProtobufCodegenConfigFiles** — Gets protobuf code generation configuration files `protobuf-code-linker.ts:413-415`
- **getProtobufGeneratedCodeMarkers** — Gets markers in generated protobuf files `protobuf-code-linker.ts:418-420`
- **isGenerated** — Determines if a protobuf file is generated `protobuf-code-linker.ts:273-273`, `protobuf-code-linker.ts:328-328`
- **matching** — Represents the matching of protobuf types to code entities `protobuf-code-linker.ts:356-356`
- **matchProtoTypesToCode** — Matches protobuf types to code entities `protobuf-code-linker.ts:312-380`
- **nameMatches** — Represents name matches between protobuf types and code entities `protobuf-code-linker.ts:437-447`
- **protoEntities** — Represents entities in the protobuf code `protobuf-code-linker.ts:98-98`
- **protoFieldNames** — Represents field names in protobuf messages `protobuf-code-linker.ts:355-355`
- **protoMessages** — Represents protobuf message definitions `protobuf-code-linker.ts:113-113`
- **protoServices** — Represents protobuf service definitions `protobuf-code-linker.ts:112-112`
- **stripTypeSuffix** — Strips type suffixes from protobuf types `protobuf-code-linker.ts:426-435`

### Method
- **extractBlocks** — Extracts blocks from a .proto file `protobuf-parser.ts:179-242`
- **extractHttpOptionFromRpc** — Extracts HTTP options from an RPC in a .proto file `protobuf-parser.ts:562-591`
- **findLineInBody** — Finds the line number of a token in the body of a .proto file `protobuf-parser.ts:662-667`
- **findLineNumber** — Finds the line number of a token in a .proto file `protobuf-parser.ts:655-660`
- **getStats** — Returns statistics about the number of files parsed, average parse time, and error count `protobuf-parser.ts:70-81`
- **initialize** — Initializes the ProtobufParser class `protobuf-parser.ts:42-44`
- **isUserDefinedType** — Checks if a type is user-defined in a .proto file `protobuf-parser.ts:630-653`
- **makeLocation** — Creates a location object for a token in a .proto file `protobuf-parser.ts:669-674`
- **parse** — Parses a .proto file and returns the result `protobuf-parser.ts:50-68`
- **parseEnum** — Parses an enum in a .proto file `protobuf-parser.ts:442-476`
- **parseFields** — Parses fields in a .proto file `protobuf-parser.ts:482-529`
- **parseMessage** — Parses a message in a .proto file `protobuf-parser.ts:350-436`
- **parseOneofGroups** — Parses oneof groups in a .proto file `protobuf-parser.ts:531-556`
- **parseProto** — Parses a .proto file and returns a ProtoParseOutput object containing parsed entities, relationships, and errors `protobuf-parser.ts:87-173`
- **parseService** — Parses a service in a .proto file `protobuf-parser.ts:248-344`
- **removeNestedBlocks** — Removes nested blocks from a .proto file `protobuf-parser.ts:605-628`
- **stripComments** — Removes comments from a .proto file `protobuf-parser.ts:597-603`
- **supportsFile** — Checks if a file is a .proto file `protobuf-parser.ts:46-48`

### Class
- **ProtobufParser** — A class for parsing .proto files and extracting entities and relationships `protobuf-parser.ts:37-675`

### Interface
- **ProtoBlock** — A block of parsed content with its keyword, name, body, and line range `protobuf-parser.ts:24-31`
- **ProtobufAnalysis** — Complete protobuf analysis result for a project `types.ts:33-44`
- **ProtobufCodeLink** — A link between a protobuf entity and a code entity `types.ts:13-28`
- **ProtobufRelationship** — Protobuf relationship for graph storage `types.ts:49-63`
- **ProtoEnumValue** — Value of the enum in the protobuf specification `types.ts:82-85`
- **ProtoField** — Definition of a field in the protobuf specification `types.ts:68-77`
- **ProtoParseOutput** — Represents the result of parsing a .proto file, containing entities, relationships, and errors `protobuf-parser.ts:14-18`

### Import_decl
- **../../types/parser.js** — Imports `../../types/parser.js` from `../../types/parser.js`. `protobuf-parser.ts:10-10`
- **../../types/storage.js** — Imports `../../types/storage.js` from `../../types/storage.js`. `protobuf-code-linker.ts:11-11`, `protobuf-code-linker.ts:12-12`, `types.ts:8-8`
- **../base-parser.js** — Imports `../base-parser.js` from `../base-parser.js`. `protobuf-parser.ts:11-11`
- **./types.js** — Imports `./types.js` from `./types.js`. `protobuf-code-linker.ts:13-13`, `protobuf-parser.ts:12-12`

### Property
- **body** — The content of a block in the .proto file `protobuf-parser.ts:27-27`
- **codeEntityName** — Name of the implementation/type in code `types.ts:17-17`
- **codeFilePath** — File path of the code entity `types.ts:19-19`
- **codegenConfigs** — Codegen config files found `types.ts:43-43`
- **column** — The column number of an error or a parsed entity in the .proto file `protobuf-parser.ts:17-17`
- **column** — Represents a column in a .proto file `protobuf-parser.ts:90-90`
- **confidence** — Confidence score 0-1 `types.ts:25-25`, `types.ts:56-56`
- **consumers** — gRPC client stubs `types.ts:37-37`
- **context** — Context of the protobuf entity `types.ts:61-61`
- **depth** — The depth of a block in the .proto file `protobuf-parser.ts:30-30`
- **endLine** — The ending line number of a block in the .proto file `protobuf-parser.ts:29-29`
- **entities** — An array of parsed entities such as services, rpcs, messages, and enums `protobuf-parser.ts:15-15`
- **errorCount** — The number of errors encountered during parsing `protobuf-parser.ts:40-40`
- **errors** — An array of error messages with their locations in the .proto file `protobuf-parser.ts:17-17`
- **evidence** — Evidence for why these were linked `types.ts:27-27`, `types.ts:57-57`
- **filesParsed** — The number of .proto files parsed `protobuf-parser.ts:38-38`
- **fromFile** — File path of the entity in the relationship `types.ts:53-53`
- **fromName** — Name of the entity in the relationship `types.ts:50-50`
- **generatedFileMarkers** — Markers found in generated files `types.ts:41-41`
- **generatedTypes** — Generated message types `types.ts:39-39`
- **keyword** — The keyword that starts a block in the .proto file `protobuf-parser.ts:25-25`
- **line** — The line number of an error or a parsed entity in the .proto file `protobuf-parser.ts:17-17`
- **line** — Represents a line in a .proto file `protobuf-parser.ts:90-90`
- **linkType** — Type of link `types.ts:23-23`
- **location** — The location of an error or a parsed entity in the .proto file `protobuf-parser.ts:17-17`
- **location** — Represents the location of a token in a .proto file `protobuf-parser.ts:90-90`
- **mapKey** — Key type of the map field `types.ts:74-74`
- **mapValue** — Value type of the map field `types.ts:75-75`
- **message** — A parsed message or service definition `protobuf-parser.ts:17-17`
- **message** — Represents a message in a .proto file `protobuf-parser.ts:90-90`
- **messageType** — Type of the message in the protobuf specification `types.ts:60-60`
- **metadata** — Metadata for the relationship `types.ts:55-62`
- **method** — Represents a method in a .proto file `protobuf-parser.ts:562-562`
- **name** — Represents the name of an entity `protobuf-code-linker.ts:352-352`, `protobuf-code-linker.ts:353-353`
- **name** — The name of a block or entity in the .proto file `protobuf-parser.ts:26-26`
- **name** — Name of the field `types.ts:69-69`, `types.ts:83-83`
- **number** — Number of the field `types.ts:71-71`, `types.ts:84-84`
- **oneofGroup** — Group of the oneof field `types.ts:76-76`
- **optional** — Indicates if the field is optional `types.ts:73-73`
- **path** — Represents the path of a method in a .proto file `protobuf-parser.ts:562-562`
- **producers** — gRPC service implementations (servers) `types.ts:35-35`
- **protoEntityName** — Name of the service/message/enum in proto `types.ts:15-15`
- **protoFilePath** — File path of the proto file `types.ts:21-21`
- **relationships** — An array of relationships between parsed entities `protobuf-parser.ts:16-16`
- **repeated** — Indicates if the field is repeated `types.ts:72-72`
- **rpcName** — Name of the RPC method in the protobuf specification `types.ts:59-59`
- **serviceName** — Service name for the relationship `types.ts:58-58`
- **startLine** — The starting line number of a block in the .proto file `protobuf-parser.ts:28-28`
- **toFile** — File path of the entity in the relationship `types.ts:54-54`
- **toName** — Name of the entity in the relationship `types.ts:51-51`
- **totalParseTimeMs** — The total time taken to parse all .proto files in milliseconds `protobuf-parser.ts:39-39`
- **type** — Type of the relationship `types.ts:52-52`
- **type** — Type of the field `types.ts:70-70`

## Entities

### Functions

| Name | Location | Description |
|------|----------|-------------|
| `analyzeProtobufCodeLinks` | protobuf-code-linker.ts:96-137 | Analyzes links between protobuf definitions and source code implementations, identifying producers and consumers of protobuf types. |
| `buildProtobufRelationships` | protobuf-code-linker.ts:142-194 | Constructs a graph representation of protobuf definitions and their relationships for storage in the analysis system. |
| `getProtobufCodegenConfigFiles` | protobuf-code-linker.ts:413-415 | Identifies configuration files that control protobuf code generation. |
| `getProtobufGeneratedCodeMarkers` | protobuf-code-linker.ts:413-415 | Detects markers within generated protobuf source files to distinguish hand-written from auto-generated code. |

### Classes

| Name | Location | Description |
|------|----------|-------------|
| `ProtobufParser` | protobuf-parser.ts:37-37 | Text-based parser that extracts services, messages, fields, and enums from `.proto` file content. |

### Interfaces & Types

| Name | Location | Description |
|------|----------|-------------|
| `ProtobufAnalysis` | types.ts:33-44 | Result container holding producers, consumers, and analyzed protobuf types from code linking. |
| `ProtobufCodeLink` | types.ts:13-28 | Represents a connection between a protobuf entity and its corresponding source code implementation. |
| `ProtobufRelationship` | types.ts:49-63 | Graph storage entity representing a protobuf definition node and its relationships within the analysis system. |
| `ProtoField` | types.ts:68-77 | Describes a single field definition within a protobuf message, including type and field number. |
| `ProtoEnumValue` | types.ts:80-85 | Represents a single value definition within a protobuf enum type. |

## Exports

- `analyzeProtobufCodeLinks`
- `buildProtobufRelationships`
- `getProtobufCodegenConfigFiles`
- `getProtobufGeneratedCodeMarkers`

## Files

| File | Purpose |
|------|---------|
| index.ts | Main module entry point, re-exporting parser and linking functionality. |
| protobuf-parser.ts | Implements `ProtobufParser` for lexical analysis and extraction of protobuf definitions. |
| protobuf-code-linker.ts | Implements code linking analysis and relationship graph construction from parsed protobuf definitions. |
| types.ts | Type definitions for protobuf analysis results, code links, and relationship storage. |

## Dependencies

**Internal:**
- Depends on a broader code analysis pipeline for matching protobuf entities to source code implementations
- Integrates with graph storage system for relationship persistence

**External:**
- No external dependencies visible; uses standard text parsing and graph construction patterns

**Patterns:**
- **Parser Pattern**: `ProtobufParser` implements single-responsibility lexical analysis of `.proto` syntax
- **Linker Pattern**: `analyzeProtobufCodeLinks` and `buildProtobufRelationships` form a two-phase linking pipeline (analysis → graph construction)
- **Graph Model**: `ProtobufRelationship` enables storage of complex protobuf definition hierarchies for downstream analysis
