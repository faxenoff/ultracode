# Module: src/diagrams

## 🤖 Overview

The `diagram-ir.ts` module defines a universal structure for diagram intermediate representation, used by collectors to generate DiagramIR and by renderers to produce various diagram formats. This module is essential for developers and data engineers who need to create and manipulate diagram data.

## 🤖 Architecture

```
DiagramIR
├── FieldMapping
│   ├── sourceParam
│   └── targetField
├── DataAnnotation
│   ├── inputTypes
│   └── outputType
├── DiagramNode
│   ├── id
│   └── label
├── DiagramEdge
│   ├── fromId
│   └── toId
└── EdgeStyle
```

## 🤖 Flow

```
DiagramIR
└── FieldMapping
    └── DataAnnotation
        └── DiagramNode
            └── DiagramEdge
```

## 🤖 Entity Listing

### Function
- **aClasses** — Stores the classes of type A `schema-collector.ts:239-239`
- **analyzeEntityFields** — Analyzes field mappings for a single entity, returning an array of field mappings `field-mapper.ts:65-143`
- **analyzeFieldMappings** — Analyzes field mappings for a batch of entities, returning a map of entity IDs to their mappings `field-mapper.ts:47-63`
- **bClasses** — Stores the classes of type B `schema-collector.ts:240-240`
- **childIds** — Stores the IDs of child nodes `schema-collector.ts:306-306`
- **childIds** — Filters and maps relational IDs to child IDs based on structural relationships `schema-collector.ts:306-306`
- **childNodes** — Stores the child nodes of a given node `schema-collector.ts:255-255`
- **children** — Stores the children of a node `schema-collector.ts:315-315`
- **classCount** — Counts the number of classes in the schema `schema-collector.ts:604-604`
- **clearDiagramCache** — Clears the diagram cache `schema-collector.ts:123-125`
- **entity** — Represents an entity in the schema `schema-collector.ts:262-262`
- **entityIds** — Stores the IDs of entities `schema-collector.ts:449-449`
- **fields** — Splits raw fields into an array of field names, trimming and splitting by colons and equals signs `field-mapper.ts:92-95`
- **funcCount** — Counts the number of functions in the schema `schema-collector.ts:606-606`
- **getCachedIR** — Retrieves cached diagram intermediate representation if it exists and is not expired `schema-collector.ts:103-111`
- **getCacheKey** — Generates a cache key based on collector options and project key `schema-collector.ts:98-101`
- **isCodeEntity** — Filters real code entities (not external stubs, not docs) `schema-collector.ts:56-61`
- **isCodeFile** — Determines if a file is a code file based on its extension `schema-collector.ts:50-53`
- **isSourceEntity** — Determines if an entity is a source entity, preferring src/ and lib/ directories `schema-collector.ts:72-77`
- **meaningful** — Determines if a node is meaningful `schema-collector.ts:253-253`
- **nodeIds** — Stores the IDs of collected nodes `schema-collector.ts:150-150`
- **oldest** — Parses the cache entries to find the oldest one based on creation time `schema-collector.ts:116-116`
- **paramNames** — Creates a set of parameter names from the entity's metadata parameters `field-mapper.ts:83-83`
- **setCachedIR** — Sets a cached diagram intermediate representation, evicting the oldest entry if the cache is full `schema-collector.ts:113-120`
- **sortedFiles** — Sorts the files in the project `schema-collector.ts:237-243`
- **transformNodeIds** — Transforms the IDs of nodes `schema-collector.ts:501-501`
- **transformNodeIds** — Filters and maps node IDs to transformation nodes based on the presence of a transformation `schema-collector.ts:501-501`

### Method
- **autoDetectDiagramType** — Automatically detects the type of diagram to generate `schema-collector.ts:603-612`
- **bfsFromEntity** — Performs BFS traversal starting from a specific entity `schema-collector.ts:282-294`
- **bfsFromRoot** — Performs BFS traversal starting from the root node `schema-collector.ts:200-280`
- **collect** — Collects nodes and edges for the schema `schema-collector.ts:135-176`
- **collectEdges** — Collects the edges between nodes `schema-collector.ts:365-437`
- **collectStructure** — Collects the structural hierarchy of nodes `schema-collector.ts:182-198`
- **constructor** — Initializes the Schema Collector with necessary dependencies `schema-collector.ts:130-133`
- **createFileNode** — Creates a node for a file in the diagram `schema-collector.ts:573-584`
- **edgeStyleForType** — Determines the style of edges based on their type `schema-collector.ts:591-601`
- **enrichFieldMappings** — Enriches the schema with field mappings `schema-collector.ts:499-526`
- **enrichWithDataFlow** — Enriches the schema with data flow information `schema-collector.ts:443-497`
- **entityToNode** — Maps entities to nodes in the diagram `schema-collector.ts:555-571`
- **expandChildren** — Expands the children of a node `schema-collector.ts:296-359`
- **resolveEntryPoint** — Resolves the entry point for the schema traversal `schema-collector.ts:532-553`
- **shortPath** — Provides a shortened path for file entities `schema-collector.ts:586-589`

### Class
- **SchemaCollector** — Collects schema information for a diagram, including nodes, edges, and groups, and caches the result `schema-collector.ts:129-613`

### Interface
- **CacheEntry** — Stores a diagram's intermediate representation and its creation timestamp `schema-collector.ts:91-94`
- **CollectorOptions** — Represents configuration options for schema collection, including entry point, depth, data flow level, diagram type, and direction `schema-collector.ts:81-87`
- **DataAnnotation** — Contains metadata about an edge, including input types, output type, and transformation `diagram-ir.ts:20-27`
- **DiagramEdge** — Represents an edge between nodes in a diagram with properties like fromId, toId, type, and style `diagram-ir.ts:49-56`
- **DiagramGroup** — Represents a group of nodes in a diagram with properties like id, label, parentId, and nodeIds `diagram-ir.ts:60-66`
- **DiagramIR** — Root interface representing the intermediate representation of a diagram with properties like title, direction, diagramType, nodes, edges, groups, and stats `diagram-ir.ts:76-90`
- **DiagramNode** — Represents a node in a diagram with properties like id, label, type, and field mappings `diagram-ir.ts:31-43`
- **FieldMapperResult** — Represents the result of field mapping analysis, containing entity ID and mappings `field-mapper.ts:37-40`
- **FieldMapping** — Represents a mapping between source and target fields with optional operations `diagram-ir.ts:11-16`

### Type_alias
- **DiagramDirection** — Enum representing the direction of a diagram, such as TD or LR `diagram-ir.ts:71-71`
- **DiagramFormat** — Enum representing the format of a diagram, such as mermaid, graphviz, or d2 `diagram-ir.ts:72-72`
- **DiagramType** — Enum representing the type of a diagram, such as flowchart, class, or component `diagram-ir.ts:70-70`
- **EdgeStyle** — Enum representing edge styles for a diagram `diagram-ir.ts:47-47`
- **Param** — Represents parameters for the schema collector `schema-collector.ts:556-556`

### Import_decl
- **../agents/dev/file-extensions.js** — Imports `../agents/dev/file-extensions.js` from `../agents/dev/file-extensions.js`. `schema-collector.ts:46-46`
- **../logging/index.js** — Imports `../logging/index.js` from `../logging/index.js`. `schema-collector.ts:16-16`
- **../tracing/trace-engine.js** — Imports `../tracing/trace-engine.js` from `../tracing/trace-engine.js`. `schema-collector.ts:17-17`
- **../types/storage.js** — Imports `../types/storage.js` from `../types/storage.js`. `field-mapper.ts:10-10`, `schema-collector.ts:18-18`
- **./diagram-ir.js** — Imports `./diagram-ir.js` from `./diagram-ir.js`. `field-mapper.ts:11-11`
- **./diagram-ir.js** — Imports `./diagram-ir.js`. `schema-collector.ts:19-28`
- **./field-mapper.js** — Imports `./field-mapper.js` from `./field-mapper.js`. `schema-collector.ts:29-29`
- **node:crypto** — Imports `node:crypto` from `node:crypto`. `schema-collector.ts:14-14`
- **node:fs/promises** — Imports `node:fs/promises` from `node:fs/promises`. `field-mapper.ts:8-8`

### Property
- **collectionTimeMs** — Stores the time taken to collect the diagram data in milliseconds `diagram-ir.ts:88-88`
- **complexityScore** — Optional complexity score for a diagram node `diagram-ir.ts:42-42`
- **conditionalHint** — Optional hint for conditional logic in an edge `diagram-ir.ts:26-26`
- **createdAt** — Number representing the timestamp when the cache entry was created `schema-collector.ts:93-93`
- **dataAnnotation** — Optional data annotation for the edge in a diagram `diagram-ir.ts:55-55`
- **dataFlowLevel** — Number indicating the data flow level for schema collection `schema-collector.ts:84-84`
- **depth** — Number indicating the depth of schema collection `schema-collector.ts:83-83`
- **diagramType** — Type of the diagram `diagram-ir.ts:79-79`
- **diagramType** — Optional string representing the diagram type for schema collection `schema-collector.ts:85-85`
- **direction** — Direction of the diagram `diagram-ir.ts:78-78`
- **direction** — Optional string representing the direction for schema collection `schema-collector.ts:86-86`
- **edges** — Array of edges in the diagram `diagram-ir.ts:81-81`
- **entityId** — The unique identifier of an entity being analyzed `field-mapper.ts:38-38`
- **entryPoint** — Optional string representing the entry point for schema collection `schema-collector.ts:82-82`
- **fieldMappings** — Array of field mappings for a diagram node `diagram-ir.ts:40-40`
- **filePath** — Optional file path for a diagram node `diagram-ir.ts:35-35`
- **filePath** — Optional file path for a diagram group `diagram-ir.ts:65-65`
- **fromId** — Identifier of the source node in a diagram edge `diagram-ir.ts:50-50`
- **groups** — Array of groups in the diagram `diagram-ir.ts:82-82`
- **groups** — Stores the groups of nodes `schema-collector.ts:182-182`
- **hasConditionalLogic** — Boolean indicating if an edge has conditional logic `diagram-ir.ts:25-25`
- **hasTransformation** — Boolean indicating if a diagram node has a transformation `diagram-ir.ts:39-39`
- **id** — Unique identifier for a diagram node `diagram-ir.ts:32-32`
- **id** — Unique identifier for a diagram group `diagram-ir.ts:61-61`
- **inputTypes** — Array of input types for an edge `diagram-ir.ts:21-21`
- **inputTypes** — Represents an array of input types `diagram-ir.ts:37-37`
- **ir** — Diagram's intermediate representation `schema-collector.ts:92-92`
- **label** — Label for a diagram node `diagram-ir.ts:33-33`
- **label** — Optional label for the edge in a diagram `diagram-ir.ts:53-53`
- **label** — Stores the label of a diagram element `diagram-ir.ts:62-62`
- **mappings** — An array of field mappings detected in the entity's source code `field-mapper.ts:39-39`
- **modifiers** — Array of modifiers for a diagram node `diagram-ir.ts:41-41`
- **nodeIds** — Array of node identifiers within a diagram group `diagram-ir.ts:64-64`
- **nodes** — Array of nodes in the diagram `diagram-ir.ts:80-80`
- **nodes** — Stores the collected nodes `schema-collector.ts:182-182`
- **operation** — Optional operation type for a field mapping `diagram-ir.ts:15-15`
- **outputType** — Optional output type for an edge `diagram-ir.ts:22-22`
- **outputType** — Optionally represents the output type `diagram-ir.ts:38-38`
- **parentId** — Optional parent ID for a diagram node `diagram-ir.ts:36-36`
- **parentId** — Optional parent identifier for a diagram group `diagram-ir.ts:63-63`
- **sourceField** — Optional identifier for the source field in a field mapping `diagram-ir.ts:13-13`
- **sourceFields** — Optional array of source fields for an edge `diagram-ir.ts:24-24`
- **sourceParam** — Identifier for the source parameter in a field mapping `diagram-ir.ts:12-12`
- **stats** — Statistics related to the diagram `diagram-ir.ts:83-89`
- **style** — Style of the edge in a diagram, such as solid, dashed, or dotted `diagram-ir.ts:54-54`
- **targetField** — Identifier for the target field in a field mapping `diagram-ir.ts:14-14`
- **title** — Title of the diagram `diagram-ir.ts:77-77`
- **toId** — Identifier of the target node in a diagram edge `diagram-ir.ts:51-51`
- **totalEdges** — Represents the count of edges in the diagram `diagram-ir.ts:85-85`
- **totalGroups** — Represents the count of groups in the diagram `diagram-ir.ts:86-86`
- **totalNodes** — Total number of nodes in the diagram `diagram-ir.ts:84-84`
- **transformation** — Optional transformation for an edge `diagram-ir.ts:23-23`
- **truncated** — Indicates whether the diagram is truncated `diagram-ir.ts:87-87`
- **type** — Type of a diagram node `diagram-ir.ts:34-34`
- **type** — Type of the edge in a diagram `diagram-ir.ts:52-52`
