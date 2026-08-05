# Types Module

## 🤖 Overview

The `src/types/` module provides all shared type contracts for the multi-agent code-analysis platform. It covers agent orchestration, code parsing (12+ languages), graph storage, semantic vector search, query engine, state chaos analysis, layered delta indexing, and WASM/Faiss interop. Every file is purely declarative — no classes are instantiated, no I/O is performed, and everything is erased at compile time (the sole exception is `AgentBusyError` in `errors.ts` and helper factory functions in `layered.ts` / `storage.ts`). There is currently no barrel `index.ts`; consumers import directly from individual files.

## 🤖 Entity Listing

### Function
- **createEmptyBranchDelta** — Creates an empty BranchDelta object `layered.ts:335-353`
- **createEmptyEntityDelta** — Creates an empty EntityDelta object `layered.ts:313-319`
- **createEmptyRelationshipDelta** — Creates an empty RelationshipDelta object `layered.ts:324-330`
- **createEmptyVectorDelta** — Creates an empty VectorDelta object `layered.ts:358-370`
- **createEmptyWorkingDelta** — Creates an empty WorkingDelta object `layered.ts:376-394`
- **fetch** — A function to make a request to a URL `global.d.ts:245-245`
- **finalizeEntity** — Finalizes an entity by adding an ID and timestamp `storage.ts:449-468`
- **flattenParsedEntities** — Flattens a list of parsed entities into a single list, preserving their hierarchical structure `storage.ts:470-519`
- **fromBuffer** — Creates a Faiss index from a buffer `faiss-node.d.ts:59-59`
- **fromFactory** — Creates a Faiss index from a factory string `faiss-node.d.ts:58-58`
- **isEntity** — Checks if an object is an entity by verifying it has id, name, type, and filePath properties `storage.ts:523-527`
- **isRelationship** — Determines if an object is a relationship by checking for id, fromId, toId, and type properties `storage.ts:529-533`
- **LayeredIndexConfigPresets** — Presets for LayeredIndexConfig `layered.ts:176-190`, `layered.ts:195-208`, `layered.ts:213-226`, `layered.ts:231-245`
- **parsedEntityToEntity** — Converts a parsed entity to an entity object, omitting certain fields `storage.ts:382-440`
- **read** — Reads a Faiss index from a file `faiss-node.d.ts:60-60`

### Method
- **constructor** — The constructor function for the AgentBusyError class, initializing the error with context and optional options `errors.ts:18-22`
- **details** — A getter that returns the context object containing details about the agent being busy `errors.ts:24-26`
- **totalChanges** — Counts the total number of changes in the BranchDelta `layered.ts:342-351`, `layered.ts:366-368`, `layered.ts:383-392`

### Class
- **AgentBusyError** — An error class representing an agent being busy, extending the standard Error class `errors.ts:15-27`
- **IndexFlatIP** — Implements the Faiss index for inner product metric `faiss-node.d.ts:35-44`
- **IndexFlatL2** — Implements the Faiss index for L2 distance metric `faiss-node.d.ts:24-33`
- **IndexHNSW** — Implements the Faiss index for HNSW metric `faiss-node.d.ts:46-55`

### Interface
- **Agent** — Agent interface with methods and properties `agent.ts:55-71`
- **AgentBusyDetails** — Represents details about an agent being busy, including its ID, status, reason, and other related metrics `errors.ts:3-13`
- **AgentCapabilities** — Interface defining capabilities of an agent `agent.ts:19-24`
- **AgentMessage** — Interface representing a message between agents `agent.ts:33-41`
- **AgentMetrics** — Metrics related to agent performance `agent.ts:84-93`
- **AgentPool** — Pool of agents with methods to manage agents `agent.ts:73-82`
- **AgentTask** — Task object containing task details and metadata `agent.ts:43-53`
- **ASTNode** — AST Node interface (generic, works with any parser) used for interoperability between different parser implementations `parser-ast-types.ts:16-41`
- **BatchResult** — A result from a batch operation `storage.ts:244-249`
- **BranchDelta** — Per-branch changes, including branch name, base commit SHA, entity changes, relationship changes, last modification timestamp, and total number of changes `layered.ts:49-67`
- **CacheEntry** — Represents an entry in the cache `parser.ts:466-471`
- **CacheEntry** — Represents a cache entry with key-value pairs and metadata `storage.ts:251-258`
- **CacheManager** — Manager for caching operations `storage.ts:342-348`
- **CacheStats** — Tracks statistics related to caching `query.ts:210-218`
- **Change** — A change in the graph `query.ts:124-128`
- **ChaosAnalysisOptions** — Not present in the provided code `chaos-analysis.ts:324-334`
- **ChaosAnalysisResult** — Represents the result of a chaos analysis `chaos-analysis.ts:307-315`
- **ChaosAnalysisSummary** — Provides a summary of chaos analysis, including overview metrics, hotspots, race conflicts, quick fixes, refactoring strategy, and estimated effort `chaos-analysis.ts:274-302`
- **ChaosMetrics** — Provides metrics for chaos analysis `chaos-analysis.ts:174-190`
- **CloneGroup** — Represents a group of similar code clones `semantic.ts:98-103`
- **ConnectionPool** — Defines an interface for managing a connection pool `storage.ts:350-356`
- **ConnectionPoolConfig** — Configures a connection pool for database connections `query.ts:225-231`
- **CouplingMetrics** — Measures the coupling between state variables `chaos-analysis.ts:148-153`
- **CrossLangResult** — Represents a result of cross-language similarity search `semantic.ts:110-122`
- **Cycle** — A cycle in the graph traversal `query.ts:87-91`
- **DefensivePatterns** — Detects defensive coding patterns like null checks and type guards `chaos-analysis.ts:158-164`
- **DependencyNode** — Single node inside a dependency tree `query.ts:79-84`
- **DependencyTree** — Top-level dependency tree rooted at a single entity `query.ts:72-76`
- **DiffSimdModule** — Interface for a SIMD module that computes the difference between two strings `wasm-modules.d.ts:9-11`
- **EmbeddingConfig** — Configuration for embedding generation `semantic.ts:292-391`
- **EmbeddingPoolStats** — Statistics related to the embedding pool `semantic.ts:266-285`
- **EnhancedCacheEntry** — An enhanced version of a cache entry with additional metadata `storage.ts:260-263`
- **Entity** — Represents a core data model for entities `storage.ts:69-114`
- **EntityChange** — Represents a change in an entity `storage.ts:189-195`
- **EntityDelta** — Tracks changes to entities, including added, modified, and deleted entities `layered.ts:19-28`
- **EntityFilter** — Criteria for narrowing entity lookup results `query.ts:38-45`
- **EntityQuery** — Represents a query for entities `storage.ts:142-154`
- **EntityRelationship** — Represents a relationship between entities `parser.ts:532-547`
- **FaissIndex** — Base interface for all Faiss index types `faiss-node.d.ts:15-22`
- **FileChange** — Represents a change in the file content `parser.ts:475-490`
- **FileInfo** — Represents information about a file `storage.ts:133-138`
- **FileUpdate** — File update `layered.ts:254-266`
- **FusionOptions** — Options for fusing code analysis results `semantic.ts:142-147`
- **GitDiffResult** — Represents the result of a Git diff operation `layered.ts:289-304`
- **GitFileChange** — Represents changes to a file in the Git repository `layered.ts:272-287`
- **Graph** — A rooted sub-graph extracted from the full graph `query.ts:60-65`
- **GraphQuery** — Defines a query for graph operations, including its type, operation, and parameters `query.ts:177-184`
- **GraphQuery** — Represents a query for a graph of entities and relationships `storage.ts:168-181`
- **GraphQueryResult** — Represents the result of a graph query `storage.ts:183-187`
- **GraphSchema** — Represents the schema of a graph `storage.ts:199-224`
- **GraphStorage** — A storage mechanism for graph data `storage.ts:292-340`
- **Hotspot** — A hotspot in the graph `query.ts:98-107`
- **HybridResult** — Combined result from both structural graph and semantic search `semantic.ts:50-56`
- **ImpactAnalysis** — An analysis of the impact of changes `query.ts:110-117`
- **ImportDependency** — Represents an import dependency in a Python module `parser-python-types.ts:200-237`
- **LayeredIndexConfig** — Configuration for the layered index `layered.ts:135-166`
- **MutationPoint** — Not present in the provided code `chaos-analysis.ts:359-369`
- **OptimizedQuery** — Represents an optimized SQL query with cost estimation and parameters `query.ts:198-203`
- **ParsedEntity** — Represents a parsed entity with its name, type, and location `parser.ts:159-444`
- **ParseResult** — Represents the result of parsing a file `parser.ts:448-464`
- **ParserOptions** — Represents the options for parsing `parser.ts:503-515`
- **ParserStats** — Statistics collected during parsing operations `parser.ts:519-528`
- **ParserTask** — Represents a task for parsing a file `parser.ts:494-501`
- **Path** — A path between two nodes in the graph `query.ts:52-57`
- **PatternAnalysis** — Analysis of patterns in the parsed code `parser.ts:551-595`
- **PerformanceMetric** — Represents a performance metric `storage.ts:273-279`
- **PoolStats** — Stores statistics about a connection pool `storage.ts:265-271`
- **ProcessEnv** — Represents the environment variables for the Node.js process `global.d.ts:7-186`
- **ProposedComponent** — Proposed component for the refactoring `chaos-analysis.ts:231-238`
- **PythonAnalysisConfig** — Python-specific analysis configuration `parser-python-types.ts:60-87`
- **PythonClassInfo** — Information about a Python class `parser-python-types.ts:148-191`
- **PythonMethodInfo** — Represents a method or property in Python with classification, async status, generator status, decorators, and other metadata `parser-python-types.ts:96-139`
- **PythonParserMetrics** — Stores metrics related to Python parsing `parser-python-types.ts:246-301`
- **QueryMetrics** — Tracks metrics related to query execution `query.ts:249-256`
- **QueryOperations** — Provides operations for querying entities, relationships, and analyzing dependencies and impact `query.ts:149-170`
- **QueryResult** — Stores the result of a query, including the data, query details, and metadata `query.ts:187-195`
- **RaceAnalysis** — Analyzes race conditions in state management `chaos-analysis.ts:388-398`
- **RaceConflict** — Not present in the provided code `chaos-analysis.ts:374-383`
- **RaceRiskFactors** — Identifies factors contributing to race conditions in state management `chaos-analysis.ts:403-410`
- **ReadableStream** — Represents a readable stream `global.d.ts:191-198`
- **ReadableStreamDefaultReader** — Represents the default reader for a readable stream `global.d.ts:200-205`
- **ReadableStreamReadResult** — Represents the result of reading from a readable stream `global.d.ts:207-210`
- **RefactoringBenefits** — Represents the benefits of refactoring, including percentage reduction in coupling, mutations, and complexity, along with testability and maintainability improvements `chaos-analysis.ts:243-250`
- **RefactoringPlan** — Details the plan for refactoring, including the state identifier, current metrics, strategy, reasoning, steps, new components, benefits, risks, and prerequisites `chaos-analysis.ts:255-265`
- **RefactoringStep** — Step in the refactoring process `chaos-analysis.ts:214-226`
- **RefactoringSuggestion** — Provides a suggestion for code refactoring `semantic.ts:129-135`
- **Relationship** — Represents a relationship between entities `storage.ts:116-131`
- **RelationshipDelta** — Tracks changes to relationships, including added, modified, and deleted relationships `layered.ts:34-43`
- **RelationshipQuery** — Represents a query for relationships between entities `storage.ts:156-166`
- **RequestInit** — Represents the configuration options for a fetch request `global.d.ts:230-243`
- **ResourceConstraints** — Interface defining resource constraints for agents `agent.ts:26-31`
- **Response** — Represents a response object `global.d.ts:212-228`
- **RippleEffect** — Represents the estimated risk and changes affecting entities in a query `query.ts:131-142`
- **SearchResult** — Represents the result of a search operation with distances and labels `faiss-node.d.ts:9-12`
- **SemanticAnalysis** — High-level semantic breakdown of a code fragment `semantic.ts:70-76`
- **SemanticMetrics** — Tracks metrics related to semantic operations `semantic.ts:435-442`
- **SemanticOperations** — Provides operations for semantic tasks `semantic.ts:398-415`
- **SemanticResult** — Aggregated output of a semantic search request `semantic.ts:59-63`
- **SimilarCode** — Represents a similar code fragment with metadata `semantic.ts:83-95`
- **SimilarityResult** — One entry returned by a cosine-similarity search `semantic.ts:42-47`
- **SourcePosition** — Defines the position within a source file, including line, column, and index `parser.ts:62-66`
- **SourceSpan** — Represents a span of source code, defined by a start and end position `parser.ts:68-71`
- **StateFlowEdge** — An edge in the state flow graph `chaos-analysis.ts:121-126`
- **StateFlowMap** — Represents a mapping of state variables to their operations and related identifiers `chaos-analysis.ts:131-139`
- **StateFlowNode** — A node in the state flow graph `chaos-analysis.ts:105-116`
- **StateOperation** — Single location where state is accessed/modified `chaos-analysis.ts:55-67`
- **StateOrigin** — Represents the origin of a state variable `chaos-analysis.ts:87-96`
- **StatePattern** — Detected state variable pattern `chaos-analysis.ts:72-78`
- **StorageMetrics** — A collection of metrics related to the storage system `storage.ts:228-242`
- **StreamOptions** — Configures options for streaming queries `query.ts:238-242`
- **TechnologyContext** — Technology detection result `chaos-analysis.ts:41-46`
- **TreeSitterCursor** — Represents a cursor in tree-sitter, with node type, text, and start and end positions `parser-ast-types.ts:76-87`
- **TreeSitterEdit** — Represents an edit operation in tree-sitter, including start and end indices and positions `parser-ast-types.ts:64-71`
- **TreeSitterTree** — Represents a tree structure for tree-sitter compatibility, with a root node and optional edit and walk methods `parser-ast-types.ts:55-59`
- **VectorDelta** — Represents a delta in embeddings for a branch, including added, modified, and deleted embeddings, along with metadata `layered.ts:108-129`
- **VectorEmbedding** — A single vector embedding tied to a content string `semantic.ts:29-35`
- **VectorEmbedding** — A data structure for embedding vectors `storage.ts:281-288`
- **VectorOpsSimdModule** — Interface for a SIMD module that provides vector operations such as cosine similarity, dot product, normalization, and top-k search `wasm-modules.d.ts:14-19`
- **VectorStoreConfig** — Configuration for vector store `semantic.ts:159-178`
- **WorkerEmbeddingConfig** — Configuration for embedding generation by a worker `semantic.ts:204-259`
- **WorkingDelta** — Uncommitted changes for a specific client, representing Layer 2 changes `layered.ts:84-102`

### Enum_decl
- **AgentStatus** — Enum representing the status of an agent `agent.ts:12-17`
- **AgentType** — Enum representing different types of agents `agent.ts:1-10`
- **EntityType** — Enumerates types of entities in the storage layer `storage.ts:20-32`
- **RelationType** — Enumerates types of relationships between entities `storage.ts:34-65`
- **SemanticTaskType** — Represents different types of semantic tasks `semantic.ts:422-428`

### Constant
- **ANALYZE** — Represents the analyze task type `semantic.ts:425-425`
- **BUSY** — Agent status indicating the agent is busy `agent.ts:14-14`
- **CALLED_BY** — Represents a relationship where an entity is called by another entity `storage.ts:46-46`
- **CALLS** — Represents a calls entity `storage.ts:35-35`
- **CLASS** — Represents a class entity `storage.ts:22-22`
- **CLONE_DETECT** — Represents the clone detection task type `semantic.ts:426-426`
- **COMMENT** — Represents a comment entity `storage.ts:31-31`
- **CONSTANT** — Represents a constant entity `storage.ts:29-29`
- **CONSUMES_API** — Represents a relationship where an entity consumes an API `storage.ts:59-59`
- **CONTAINS** — Represents the key for containing entities `storage.ts:41-41`
- **COORDINATOR** — Agent type for coordinating tasks `agent.ts:6-6`
- **DEPENDS_ON** — Represents the key for dependencies `storage.ts:42-42`
- **DEV** — Agent type for development tasks `agent.ts:7-7`
- **DISPATCHES_ACTION** — Represents a relationship where an entity dispatches an action `storage.ts:52-52`
- **DOCUMENTS** — Represents a relationship where an entity documents another entity `storage.ts:44-44`
- **DORA** — Agent type for DORA tasks `agent.ts:8-8`
- **EMBED** — Represents the embed task type `semantic.ts:423-423`
- **ERROR** — Agent status indicating an error occurred `agent.ts:15-15`
- **EXPORT** — Represents an export entity `storage.ts:27-27`
- **EXPORTS** — Represents the key for exporting entities `storage.ts:37-37`
- **EXTENDED_BY** — Represents a relationship where an entity is extended by another entity `storage.ts:49-49`
- **EXTENDS** — Represents the key for extending entities `storage.ts:38-38`
- **FUNCTION** — Represents a function entity `storage.ts:21-21`
- **GENERATED_FROM** — Represents a relationship where an entity is generated from another entity `storage.ts:60-60`
- **HANDLES_ACTION** — Represents a relationship where an entity handles an action `storage.ts:54-54`
- **IDLE** — Agent status indicating the agent is idle `agent.ts:13-13`
- **IMPLEMENTED_BY** — Represents a relationship where an entity is implemented by another entity `storage.ts:50-50`
- **IMPLEMENTS** — Represents the key for implementing interfaces `storage.ts:39-39`
- **IMPORT** — Represents an import entity `storage.ts:26-26`
- **IMPORTED_BY** — Represents a relationship where an entity is imported by another entity `storage.ts:47-47`
- **IMPORTS** — Represents the key for importing entities `storage.ts:36-36`
- **INDEXER** — Agent type for indexing tasks `agent.ts:3-3`
- **INTERFACE** — Represents an interface entity `storage.ts:24-24`
- **LISTENS_TO_ACTION** — Represents a relationship where an entity listens to an action `storage.ts:53-53`
- **MAPS_TO_TABLE** — Represents a relationship where an entity maps to a table `storage.ts:64-64`
- **MEMBER_OF** — Represents the key for member of entities `storage.ts:43-43`
- **MERGE** — Agent type for merging tasks `agent.ts:9-9`
- **METHOD** — Represents a method entity `storage.ts:23-23`
- **MODIFIES_STATE** — Represents a relationship where an entity modifies a state `storage.ts:56-56`
- **PACKAGE** — Represents a package entity `storage.ts:30-30`
- **PARSER** — Agent type for parsing tasks `agent.ts:2-2`
- **PRODUCES_API** — Represents a relationship where an entity produces an API `storage.ts:58-58`
- **QUERY** — Agent type for querying tasks `agent.ts:4-4`
- **READS_TABLE** — Represents a relationship where an entity reads a table `storage.ts:62-62`
- **REFACTOR** — Represents the refactor task type `semantic.ts:427-427`
- **REFERENCED_BY** — Represents a relationship where an entity is referenced by another entity `storage.ts:48-48`
- **REFERENCES** — Represents the key for referencing entities `storage.ts:40-40`
- **SEARCH** — Represents the search task type `semantic.ts:424-424`
- **SELECTS_STATE** — Represents a relationship where an entity selects a state `storage.ts:55-55`
- **SEMANTIC** — Agent type for semantic tasks `agent.ts:5-5`
- **SHUTDOWN** — Agent status indicating the agent is shut down `agent.ts:16-16`
- **TYPE** — Represents a type entity `storage.ts:25-25`
- **VARIABLE** — Represents a variable entity `storage.ts:28-28`
- **WRITES_TABLE** — Represents a relationship where an entity writes a table `storage.ts:63-63`

### Type_alias
- **AngularStatePattern** — Angular-specific state management pattern `chaos-analysis.ts:28-36`
- **DivergenceRisk** — Assesses the risk of state divergence `chaos-analysis.ts:169-169`
- **EmbeddingProviderKind** — Represents the type of embedding provider used for generating embeddings `semantic.ts:185-194`
- **EntityKind** — Represents the kind of entity being parsed `parser.ts:108-153`
- **ExtendedRelationshipKind** — Extends the relationship kind with additional types `parser.ts:89-104`
- **FileChangeType** — Type of file change `layered.ts:252-252`
- **MagicMethodCategory** — Magic method type groups for Python special methods `parser-python-types.ts:48-48`
- **MagicType** — Union type of all magic method names (derived from MagicMethodGroups) `parser-python-types.ts:51-51`
- **RacePatternType** — Not present in the provided code `chaos-analysis.ts:343-349`
- **RaceRisk** — Not present in the provided code `chaos-analysis.ts:354-354`
- **RefactoringStrategy** — Strategy for refactoring the code `chaos-analysis.ts:199-209`
- **RelationshipKind** — Defines the kind of relationship between entities `parser.ts:75-87`
- **SideEffectCategory** — Categorizes side effects in parsed entities `parser.ts:155-155`
- **StateOperationType** — Operation type on state variable `chaos-analysis.ts:15-23`
- **SupportedLanguage** — Represents a supported programming language for parsing `parser.ts:58-58`
- **TreeSitterNode** — @deprecated Use ASTNode instead. Kept for backward compatibility with analyzers `parser-ast-types.ts:50-50`
- **VectorBackend** — Backend for vector operations `semantic.ts:156-156`

### Import_decl
- **../config/constants.js** — Imports `../config/constants.js` from `../config/constants.js`. `query.ts:13-13`, `semantic.ts:13-13`, `storage.ts:6-6`
- **../logging/index.js** — Imports `../logging/index.js` from `../logging/index.js`. `storage.ts:7-7`
- **./agent.js** — Imports `./agent.js` from `./agent.js`. `errors.ts:1-1`, `parser.ts:23-23`
- **./parser-python-types.js** — Imports `./parser-python-types.js` from `./parser-python-types.js`. `parser.ts:24-24`
- **./parser.js** — Imports `./parser.js` from `./parser.js`. `storage.ts:8-8`
- **./storage.js** — Imports `./storage.js` from `./storage.js`. `layered.ts:13-13`, `query.ts:14-14`

### Property
- **abstractMethods** — Abstract methods of the class `parser-python-types.ts:159-159`
- **acquireTimeout** — Defines the timeout for acquiring a connection from the pool `query.ts:229-229`
- **active** — Number of active connections in the pool `storage.ts:267-267`
- **ADAPTIVE_DEBUG** — Enables debug mode for adaptive features `global.d.ts:184-184`
- **added** — Entities added in this layer (not present in parent layer) `layered.ts:21-21`, `layered.ts:36-36`
- **addedEmbeddings** — Entities added in this layer (not present in parent layer) `layered.ts:116-116`
- **additions** — Counts the number of additions in the file change `layered.ts:283-283`
- **addListenerCount** — Counts the number of `addListener` calls `parser.ts:417-417`
- **advancedFeatureAnalysis** — Enable Layer 2: Advanced feature analysis `parser-python-types.ts:65-65`
- **advancedFeatures** — Indicates whether advanced features are enabled `parser-python-types.ts:256-263`
- **affectedComponents** — Lists components affected by state variable changes `chaos-analysis.ts:150-150`
- **affectedEntities** — Maps entity IDs to their impact level and reason `query.ts:134-141`
- **affectedFiles** — Files affected by the change `query.ts:116-116`
- **agentId** — Unique identifier for an agent `agent.ts:85-85`
- **agentId** — The unique identifier of the agent that is busy `errors.ts:4-4`
- **agents** — Map of agent IDs to agent instances `agent.ts:74-74`
- **alias** — Represents an alias for a Python identifier `parser-python-types.ts:213-213`, `parser-python-types.ts:230-230`
- **alias** — Manages alias information for imports `parser.ts:234-234`
- **analysisTimeMs** — Records the time taken for the analysis in milliseconds `parser-python-types.ts:262-262`
- **analyzeAsync** — Represents asynchronous analysis in parsing `parser.ts:509-509`
- **analyzePropertyDecorators** — Analyze property decorators `parser-python-types.ts:77-77`
- **angularPattern** — Angular-specific state management pattern `chaos-analysis.ts:62-62`
- **angularPattern** — The Angular-specific state management pattern used `chaos-analysis.ts:93-93`, `chaos-analysis.ts:111-111`
- **antipatternHints** — Provides hints for common antipatterns `parser.ts:398-409`
- **anyTypeCount** — Counts the number of `any` type usages `parser.ts:433-433`
- **apiKey** — The API key for the embedding provider `semantic.ts:243-243`
- **apiKey** — API key for the OpenAI API `semantic.ts:318-318`
- **apiKey** — Represents an optional string for API key `semantic.ts:328-328`, `semantic.ts:337-337`
- **APPDATA** — Represents the application data directory `global.d.ts:12-12`
- **argumentCount** — Counts the number of arguments in a function call `parser.ts:280-280`
- **arguments** — Stores the arguments of the decorator `parser-python-types.ts:110-110`
- **arguments** — Stores the arguments of a function or method `parser-python-types.ts:178-178`
- **arguments** — Stores arguments for the entity `parser.ts:190-190`
- **arguments** — Stores function arguments `parser.ts:250-250`
- **arguments** — Represents optional arguments for a function `storage.ts:103-103`
- **argumentsRefCount** — Counts the number of references to arguments in the parsed entity `parser.ts:391-391`
- **asyncBoundaries** — Defines boundaries for asynchronous state management `chaos-analysis.ts:405-405`
- **asyncInfo** — Stores information about asynchronous functions `parser.ts:215-226`
- **asyncNoAwaitCount** — Counts the number of `async` functions without `await `parser.ts:437-437`
- **asyncPatterns** — Detects patterns in asynchronous code `parser.ts:224-224`
- **asyncPatternsDetected** — Stores detected async patterns in the Python code `parser-python-types.ts:259-259`
- **asyncWriters** — Lists the asynchronous writers of a state variable `chaos-analysis.ts:392-392`
- **author** — Not applicable `parser.ts:344-344`
- **autoDetect** — Not present in the provided code `chaos-analysis.ts:327-327`
- **autoPull** — Indicates whether to automatically pull data `semantic.ts:308-308`
- **autoStart** — Boolean flag to auto-start server `semantic.ts:379-379`
- **averageMutationsPerComponent** — Average number of mutations per component `chaos-analysis.ts:182-182`
- **averageProcessingTime** — Average time taken to process tasks `agent.ts:89-89`
- **averageQueryTimeMs** — The average time taken for queries in milliseconds `storage.ts:235-235`
- **averageResponseTime** — Stores the average time taken to respond to queries `query.ts:254-254`
- **avgEmbeddingTime** — Stores the average time taken to generate embeddings `semantic.ts:440-440`
- **avgMsPerEmb** — The average time in milliseconds per embedding `semantic.ts:280-280`
- **avgParseTimeMs** — Average time taken to parse a file in milliseconds `parser.ts:523-523`
- **avgSearchTime** — Stores the average time taken to perform searches `semantic.ts:441-441`
- **avgSimilarity** — Average similarity score for a clone group `semantic.ts:100-100`
- **awaitCount** — Counts the number of `await` expressions in an asynchronous function `parser.ts:221-221`
- **awaits** — Represents awaits in the parser system `parser.ts:310-313`
- **backgroundScheduler** — Background scheduler `layered.ts:155-158`
- **bareExceptCount** — Counts the number of bare `except` blocks `parser.ts:428-428`
- **baseClasses** — Base classes of the current class `parser-python-types.ts:153-153`
- **baseClasses** — Lists base classes for the entity `parser.ts:208-208`
- **baseCommitSha** — Base commit SHA from which this delta was computed `layered.ts:54-54`, `layered.ts:113-113`
- **baseUrl** — The base URL for the embedding provider `semantic.ts:242-242`
- **baseUrl** — The base URL for the embedding service `semantic.ts:304-304`
- **baseUrl** — Base URL for the OpenAI API `semantic.ts:317-317`
- **baseUrl** — Base URL for the CloudRU API `semantic.ts:327-327`
- **baseUrl** — Represents an optional string for base URL `semantic.ts:338-338`
- **baseUrl** — Specifies the base URL for the TEI service `semantic.ts:347-347`
- **baseUrl** — Base URL for API requests `semantic.ts:356-356`, `semantic.ts:371-371`
- **basicParsing** — Indicates whether basic parsing is enabled `parser-python-types.ts:248-253`
- **batches** — The number of batches processed `semantic.ts:276-276`
- **batchSize** — Number of files to process in a single batch `parser.ts:513-513`
- **batchSize** — Sets the batch size for streaming queries `query.ts:239-239`
- **batchSize** — The size of the batch for embedding generation `semantic.ts:216-216`
- **batchSize** — The size of each batch for embedding generation `semantic.ts:294-294`
- **benefits** — Lists the benefits of the refactoring `chaos-analysis.ts:237-237`
- **benefits** — Details the benefits of the refactoring strategy `chaos-analysis.ts:262-262`
- **bidirectionalBindings** — Identifies bidirectional state bindings `chaos-analysis.ts:152-152`
- **body** — Represents the body of the response `global.d.ts:217-217`
- **body** — Contains the body of the request `global.d.ts:233-233`
- **bodyUsed** — Indicates whether the body of the response has been used `global.d.ts:218-218`
- **branches** — Represents branches in the code `parser.ts:292-296`
- **branchName** — Branch name (e.g., "feature/auth") `layered.ts:51-51`, `layered.ts:89-89`, `layered.ts:110-110`
- **breakingChange** — Whether the refactoring introduces breaking changes `chaos-analysis.ts:219-219`
- **buildInheritanceHierarchies** — Build inheritance hierarchies `parser-python-types.ts:80-80`
- **BUNDLED** — Represents whether the application is bundled `global.d.ts:16-16`
- **cache** — Specifies the cache mode for the request `global.d.ts:236-236`
- **cachedAt** — Records the time at which the content was cached `parser.ts:469-469`
- **cacheHitRate** — Represents the rate at which cached queries are successfully retrieved `query.ts:253-253`
- **cacheHitRate** — Stores the cache hit rate `semantic.ts:439-439`
- **cacheHitRate** — The rate at which cache hits occur `storage.ts:234-234`
- **cacheHits** — Number of cache hits during parsing `parser.ts:521-521`
- **cacheHits** — The number of cache hits `semantic.ts:284-284`
- **cacheLevel** — Specifies the cache level used for the query result `query.ts:193-193`
- **cacheMemoryMB** — Memory used for caching during parsing `parser.ts:526-526`
- **cacheMisses** — Number of cache misses during parsing `parser.ts:522-522`
- **cacheSize** — Size of the cache `semantic.ts:163-163`
- **calls** — Tracks function calls in the code `parser.ts:277-288`
- **callsSuper** — Indicates whether the method calls the parent class `parser-python-types.ts:131-131`
- **capabilities** — Agent capabilities including priority, concurrency, memory, etc `agent.ts:59-59`
- **capturedVarCount** — Counts the number of captured variables `parser.ts:414-414`
- **catchType** — Represents a catch type in the parser system `parser.ts:303-303`
- **centralizedEmbeddings** — Indicates whether embeddings are centralized `semantic.ts:229-229`
- **changeFrequency** — The frequency of changes in the graph `query.ts:103-103`
- **changes** — Represents the changes to be made to the files `parser.ts:498-498`
- **changes** — Stores an array of changes affecting entities `query.ts:133-133`
- **changeSignature** — Changes the method signature `parser-python-types.ts:132-132`
- **changeType** — Indicates the type of change in the file content `parser.ts:477-477`
- **chaosScore** — Represents the overall chaos score of the codebase `chaos-analysis.ts:279-279`
- **checkServer** — Determines if the server should be checked `semantic.ts:309-309`
- **checkServer** — Function to check server status `semantic.ts:350-350`, `semantic.ts:359-359`, `semantic.ts:377-377`
- **childCount** — Represents the count of child nodes of the AST node `parser-ast-types.ts:25-25`
- **children** — Represents the list of child nodes of the AST node `parser-ast-types.ts:23-23`
- **children** — Represents the children of a parsed entity `parser.ts:169-169`
- **children** — Represents the child nodes in the graph `query.ts:83-83`
- **circular** — Indicates whether the graph traversal is circular `query.ts:82-82`
- **circularDependencies** — Detects circular dependencies in the parsed code `parser.ts:579-583`
- **circularDependenciesFound** — Identifies circular dependencies in the Python code `parser-python-types.ts:270-270`
- **classDecorators** — Stores the decorators applied to a class `parser-python-types.ts:176-179`
- **classification** — Specifies the classification of the method or property `parser-python-types.ts:98-98`
- **classType** — Type of the class `parser-python-types.ts:150-150`
- **cleanupIntervalMinutes** — Cleanup interval in minutes `layered.ts:157-157`
- **clientId** — Client ID for the working delta `layered.ts:86-86`
- **cloneType** — Type of the clone group `semantic.ts:101-101`
- **closed** — Indicates whether a stream is closed `global.d.ts:201-201`
- **closureHints** — Provides hints for closures `parser.ts:411-424`
- **cloudru** — Configuration for the CloudRU API `semantic.ts:325-333`
- **CLOUDRU_API_KEY** — Stores the API key for the CloudRU API `global.d.ts:55-55`
- **CLOUDRU_BASE_URL** — Sets the base URL for the CloudRU API `global.d.ts:54-54`
- **CLOUDRU_CONCURRENCY** — Sets the concurrency level for CloudRU API calls `global.d.ts:57-57`
- **CLOUDRU_MAX_BATCH_SIZE** — Defines the maximum batch size for CloudRU API calls `global.d.ts:58-58`
- **CLOUDRU_TIMEOUT_MS** — Specifies the timeout in milliseconds for CloudRU API calls `global.d.ts:56-56`
- **code** — Code snippet `chaos-analysis.ts:63-63`
- **code** — The code snippet where the state variable is accessed or modified `chaos-analysis.ts:94-94`
- **code** — Not present in the provided code `chaos-analysis.ts:368-368`
- **code** — Represents the code snippet being analyzed `semantic.ts:134-134`
- **cognitive** — Not applicable `parser.ts:359-359`
- **cognitiveComplexity** — Cognitive complexity of the code `chaos-analysis.ts:187-187`
- **column** — Column number `chaos-analysis.ts:58-58`
- **column** — Represents the column number of the starting position `parser-ast-types.ts:18-18`, `parser-ast-types.ts:19-19`, `parser-ast-types.ts:39-39`
- **column** — The column number of a position `parser-ast-types.ts:68-68`, `parser-ast-types.ts:69-69`, `parser-ast-types.ts:70-70`, `parser-ast-types.ts:79-79`, `parser-ast-types.ts:80-80`
- **column** — Column number of the method `parser-python-types.ts:136-136`, `parser-python-types.ts:137-137`
- **column** — Represents the column number of a Python element `parser-python-types.ts:186-186`, `parser-python-types.ts:187-187`
- **column** — Represents the column number in the Python code `parser-python-types.ts:224-224`
- **column** — Represents the column number in a source file `parser.ts:64-64`
- **column** — Indicates the column number of the error `parser.ts:461-461`
- **column** — Represents the column number of a source position `parser.ts:485-485`, `parser.ts:486-486`, `parser.ts:487-487`
- **column** — Indicates the column number of a source code element `parser.ts:561-561`, `parser.ts:575-575`
- **column** — Represents the column number in the source code `parser.ts:591-591`
- **column** — Represents the column number in a file `storage.ts:76-76`, `storage.ts:77-77`
- **column** — Represents the column number in the file where the entity is located `storage.ts:124-124`
- **commitSha** — Tracks the commit SHA from which the delta was computed `layered.ts:265-265`
- **compactionIntervalMinutes** — Compaction interval in minutes `layered.ts:156-156`
- **compactionThreshold** — Compaction threshold `layered.ts:149-149`
- **completedAt** — Time when the task completed `agent.ts:50-50`
- **complexity** — Complexity of the codebase `chaos-analysis.ts:185-188`
- **complexity** — Not applicable `parser.ts:356-366`
- **complexity** — The complexity of the graph traversal `query.ts:102-102`
- **complexity** — The complexity of the code fragment `semantic.ts:72-72`
- **complexity** — Represents the complexity of an entity `storage.ts:111-111`
- **componentsWithMutations** — List of components with mutations `chaos-analysis.ts:181-181`
- **componentType** — Component type (class, functional, unknown) `chaos-analysis.ts:45-45`
- **compression** — Compression level for the database `semantic.ts:173-173`
- **concepts** — Concepts involved in the semantic analysis `semantic.ts:75-75`
- **concurrency** — The level of concurrency for the embedding provider `semantic.ts:247-247`
- **concurrency** — The level of concurrency for the embedding service `semantic.ts:306-306`
- **concurrency** — Number of concurrent API requests `semantic.ts:321-321`
- **concurrency** — Represents an optional number for concurrency level `semantic.ts:331-331`
- **concurrency** — Represents an optional number for concurrency level. `semantic `semantic.ts:340-340`
- **concurrency** — Maximum number of concurrent requests `semantic.ts:349-349`, `semantic.ts:358-358`, `semantic.ts:373-373`
- **concurrentConnections** — The number of concurrent connections to the storage `storage.ts:241-241`
- **concurrentQueries** — Defines the maximum number of queries that can be processed concurrently `query.ts:255-255`
- **condition** — Not present in the provided code `chaos-analysis.ts:365-365`
- **condition** — Represents a condition in the parser system `parser.ts:294-294`
- **CONDUCTOR_COMPLEXITY_THRESHOLD** — Represents the complexity threshold for the conductor `global.d.ts:167-167`
- **CONDUCTOR_LOAD_BALANCING_STRATEGY** — Determines the load balancing strategy for the conductor `global.d.ts:165-165`
- **CONDUCTOR_MANDATORY_DELEGATION** — Specifies whether mandatory delegation is enabled for the conductor `global.d.ts:166-166`
- **CONDUCTOR_MAX_CONCURRENCY** — Represents the maximum number of concurrent agents for the conductor `global.d.ts:157-157`
- **CONDUCTOR_MAX_CONCURRENT_AGENTS** — Represents the maximum number of concurrent agents for the conductor `global.d.ts:161-161`
- **CONDUCTOR_MAX_CPU_PERCENT** — Represents the maximum CPU percentage for the conductor `global.d.ts:164-164`
- **CONDUCTOR_MAX_MEMORY_MB** — Specifies the maximum memory in MB for the conductor `global.d.ts:163-163`
- **CONDUCTOR_MAX_TASK_QUEUE_SIZE** — Represents the maximum size of the task queue for the conductor `global.d.ts:162-162`
- **CONDUCTOR_MEMORY_LIMIT** — Specifies the memory limit for the conductor `global.d.ts:158-158`
- **CONDUCTOR_PRIORITY** — Determines the priority of the conductor `global.d.ts:159-159`
- **CONDUCTOR_TASK_QUEUE_LIMIT** — Represents the limit for the task queue of the conductor `global.d.ts:160-160`
- **confidence** — Confidence level of the relationship `parser.ts:541-541`
- **confidence** — Represents the confidence level of a parsed entity `parser.ts:569-569`
- **confidence** — Indicates the confidence level of a parsed entity `parser.ts:589-589`
- **confidence** — Measures the confidence level of a refactoring suggestion `semantic.ts:132-132`
- **conflicts** — Detects conflicts in the codebase `chaos-analysis.ts:283-283`
- **conflicts** — Lists conflicts in state management `chaos-analysis.ts:396-396`
- **connectionTestInterval** — Defines the interval for testing connections in the pool `query.ts:230-230`
- **constraint** — Not applicable `parser.ts:371-371`
- **consumers** — The consumers of the state flow node `chaos-analysis.ts:115-115`
- **consumers** — Lists the components that will use the refactoring `chaos-analysis.ts:236-236`
- **content** — Stores the new content of the file `parser.ts:478-478`
- **content** — The content string associated with the embedding `semantic.ts:32-32`, `semantic.ts:45-45`, `semantic.ts:55-55`
- **content** — Content of the code fragment `semantic.ts:87-87`, `semantic.ts:115-115`
- **content** — The textual content of an entity `storage.ts:284-284`
- **contentHash** — Stores the hash of the content parsed `parser.ts:452-452`
- **context** — Surrounding context (3 lines) `chaos-analysis.ts:64-64`
- **context** — The context object containing details about the agent being busy `errors.ts:16-16`
- **context** — Represents the context in which a Python identifier is used `parser-python-types.ts:224-224`
- **context** — Represents the context of the entity `storage.ts:125-125`
- **contextManagers** — Managers for context during parsing `parser.ts:552-556`
- **contextManagersDetected** — Detects context managers in the Python code `parser-python-types.ts:283-283`
- **contextSize** — The size of the context for semantic analysis `semantic.ts:255-255`
- **contextSize** — Maximum context size for model `semantic.ts:376-376`
- **contextTokens** — The number of context tokens allowed for embedding generation `semantic.ts:212-212`
- **controlFlow** — Manages control flow in the code `parser.ts:290-315`
- **COORDINATOR_LOAD_BALANCING_STRATEGY** — Represents the load balancing strategy for the coordinator `global.d.ts:177-177`
- **COORDINATOR_MAX_CONCURRENCY** — Represents the maximum number of concurrent agents for the coordinator `global.d.ts:169-169`
- **COORDINATOR_MAX_CONCURRENT_AGENTS** — Represents the maximum number of concurrent agents for the coordinator `global.d.ts:173-173`
- **COORDINATOR_MAX_CPU_PERCENT** — Represents the maximum CPU percentage for the coordinator `global.d.ts:176-176`
- **COORDINATOR_MAX_MEMORY_MB** — Specifies the maximum memory in MB for the coordinator `global.d.ts:175-175`
- **COORDINATOR_MAX_TASK_QUEUE_SIZE** — Represents the maximum size of the task queue for the coordinator `global.d.ts:174-174`
- **COORDINATOR_MEMORY_LIMIT** — Specifies the memory limit for the coordinator `global.d.ts:170-170`
- **COORDINATOR_PRIORITY** — Determines the priority of the coordinator `global.d.ts:171-171`
- **COORDINATOR_TASK_QUEUE_LIMIT** — Represents the limit for the task queue of the coordinator `global.d.ts:172-172`
- **correlationId** — Optional unique identifier for message correlation `agent.ts:40-40`
- **cost** — Number for path cost `query.ts:56-56`
- **count** — Number of entities or operations `storage.ts:307-307`
- **coupling** — Measures the coupling between state variables `chaos-analysis.ts:176-176`
- **cpuAffinity** — CPU affinity for an agent `agent.ts:23-23`
- **created_at** — Represents the creation timestamp of an entity `storage.ts:208-208`
- **createdAt** — Time when the task was created `agent.ts:47-47`
- **createdAt** — The timestamp when the embedding was created `semantic.ts:33-33`
- **createdAt** — Represents the timestamp when an entity was created `storage.ts:109-109`, `storage.ts:130-130`, `storage.ts:278-278`, `storage.ts:287-287`
- **credentials** — Controls whether credentials are sent with the request `global.d.ts:235-235`
- **crossFileReferencesResolved** — Resolves cross-file references in the Python code `parser-python-types.ts:269-269`
- **crossReferences** — Stores cross-references found in the Python code `parser-python-types.ts:277-277`
- **CUDA_FORCE_DISABLE** — Forces CUDA to be disabled `global.d.ts:179-179`
- **currentCpuPercent** — Current CPU usage percentage `agent.ts:91-91`
- **currentMemoryMB** — Current memory usage in megabytes `agent.ts:90-90`
- **currentMetrics** — Represents the current state of chaos metrics `chaos-analysis.ts:257-257`
- **cycle** — Represents a cycle in the parsed code `parser.ts:580-580`
- **cycles** — Array of Cycle for dependency tree cycles `query.ts:74-74`
- **cyclomatic** — Not applicable `parser.ts:358-358`
- **cyclomaticComplexity** — Cyclomatic complexity of the code `chaos-analysis.ts:186-186`
- **data** — Holds the result data of the query `query.ts:188-188`
- **DATABASE_CACHE_SIZE** — Defines the size of the database cache `global.d.ts:76-76`
- **DATABASE_MMAP_SIZE** — Sets the size of the memory-mapped database file `global.d.ts:77-77`
- **DATABASE_MODE** — Sets the mode for the database (e.g., read-only, read-write) `global.d.ts:75-75`
- **DATABASE_PATH** — Specifies the path to the database file `global.d.ts:74-74`
- **DATABASE_SYNCHRONOUS** — Determines if the database operations are synchronous `global.d.ts:78-78`
- **DATABASE_TEMP_STORE** — Specifies the temporary storage path for the database `global.d.ts:79-79`
- **databaseSizeMB** — The size of the database in megabytes `storage.ts:232-232`
- **dataclassesProcessed** — Tracks the number of dataclass definitions processed `parser-python-types.ts:261-261`
- **dbPath** — Path to the database file `semantic.ts:161-161`
- **DEBUG** — Represents the debug mode for the Node.js process `global.d.ts:9-9`
- **decorators** — Stores the decorator stack for the method or property `parser-python-types.ts:107-112`
- **decorators** — Stores the decorators applied to a method `parser-python-types.ts:183-183`
- **decorators** — Represents decorators for the entity `parser.ts:187-193`
- **decorators** — Manages decorator information `parser.ts:246-253`
- **decorators** — Stores decorators for an entity `storage.ts:100-106`
- **decoratorsExtracted** — Stores extracted decorators in the Python code `parser-python-types.ts:251-251`
- **default** — Not applicable `parser.ts:372-372`
- **defaultValue** — Stores the default value of the entity `parser.ts:201-201`
- **defaultValue** — Specifies the default value of a parameter `storage.ts:87-87`
- **defaultValues** — Detects default values assigned to state variables `chaos-analysis.ts:161-161`
- **defensive** — Indicates defensive coding patterns `chaos-analysis.ts:177-177`
- **deleteCount** — Counts the number of deletions in the parsed entity `parser.ts:390-390`
- **deleted** — Entity IDs deleted in this layer (present in parent but removed) `layered.ts:27-27`, `layered.ts:42-42`
- **deletedEmbeddingIds** — Entity IDs deleted in this layer (present in parent but removed) `layered.ts:122-122`
- **deleterName** — Name of the deleter method `parser-python-types.ts:124-124`
- **deletions** — Counts the number of deletions in the file change `layered.ts:286-286`
- **dependencies** — Map of string to DependencyNode for dependency tree dependencies `query.ts:75-75`
- **deprecated** — Not applicable `parser.ts:341-341`
- **depth** — Distance from origin (0 = source) `chaos-analysis.ts:66-66`
- **depth** — The depth of the state flow node in the graph `chaos-analysis.ts:112-112`
- **depth** — Number for graph depth `query.ts:62-62`
- **depth** — The depth of the graph traversal `query.ts:81-81`
- **depth** — Specifies the depth of the graph query `storage.ts:178-178`
- **description** — Description of the refactoring step `chaos-analysis.ts:216-216`
- **description** — Provides a detailed description of a state management issue `chaos-analysis.ts:378-378`
- **description** — Represents a description in the parser system `parser.ts:319-319`, `parser.ts:324-324`
- **description** — Parser system types: entity extraction, relationships, caching, pattern detection, and incremental file parsing `parser.ts:331-331`, `parser.ts:337-337`
- **description** — Provides a description of a parsed entity `parser.ts:570-570`
- **description** — Provides a textual description of a parsed entity `parser.ts:590-590`
- **description** — Describes the nature of a code change `semantic.ts:133-133`
- **designPatterns** — Represents design patterns in the code `parser.ts:272-272`
- **designPatterns** — Describes design patterns used in the parser system `parser.ts:566-571`
- **designPatternsIdentified** — Identifies design patterns in the Python code `parser-python-types.ts:285-285`
- **details** — Provides detailed information about the parsed entities `parser.ts:380-384`
- **detectCircularDependencies** — Indicates whether circular dependencies are being detected `parser-python-types.ts:83-83`
- **detectPatterns** — Represents detecting patterns in parsing `parser.ts:508-508`
- **DEV_AGENT_MAX_CONCURRENCY** — Represents the maximum number of concurrent agents for development `global.d.ts:149-149`
- **DEV_AGENT_MEMORY_LIMIT** — Specifies the memory limit for development agents `global.d.ts:150-150`
- **DEV_AGENT_PRIORITY** — Determines the priority of development agents `global.d.ts:151-151`
- **dimensions** — Dimensionality of the vector space `semantic.ts:160-160`
- **dimensions** — The dimensionality of the embeddings `semantic.ts:222-222`
- **directImpacts** — Direct impacts of the change `query.ts:113-113`
- **distances** — An array of distances from the query vectors to the index vectors `faiss-node.d.ts:10-10`
- **divergenceRisk** — Risk of divergence in state management patterns `chaos-analysis.ts:184-184`
- **divergenceRisk** — Indicates the risk of state divergence in the codebase `chaos-analysis.ts:280-280`
- **documentation** — Represents documentation in the parser system `parser.ts:317-346`
- **done** — Indicates whether the stream has reached the end `global.d.ts:208-208`
- **DORA_AGENT_MAX_CONCURRENCY** — Represents the maximum number of concurrent agents for Dora `global.d.ts:153-153`
- **DORA_AGENT_MEMORY_LIMIT** — Specifies the memory limit for Dora agents `global.d.ts:154-154`
- **DORA_AGENT_PRIORITY** — Determines the priority of Dora agents `global.d.ts:155-155`
- **doubleAssertionCount** — Counts the number of double type assertions `parser.ts:401-401`
- **durationMs** — The duration in milliseconds for embedding generation `semantic.ts:270-270`
- **durationMs** — Duration of the operation in milliseconds `storage.ts:276-276`
- **dynamicPropAccessCount** — Counts the number of dynamic property accesses `parser.ts:394-394`
- **edges** — Represents edges in a state flow graph `chaos-analysis.ts:135-135`
- **edges** — Array of Relationship for path edges `query.ts:53-53`
- **edges** — The edges in the graph `query.ts:90-90`
- **edits** — Stores the edits made to the file content `parser.ts:480-489`
- **EMBEDDING_DEBUG** — Enables debug mode for embedding operations `global.d.ts:38-38`
- **embeddingBase64** — Embeds base64 encoded data `parser.ts:441-441`
- **embeddingsGenerated** — Stores the number of embeddings generated `semantic.ts:437-437`
- **embeddingText** — Embeds text data `parser.ts:442-442`
- **enabled** — Indicates whether the embedding provider is enabled `semantic.ts:206-206`
- **enableOrphanedCleanup** — Enable orphaned cleanup `layered.ts:152-152`
- **enablePersistence** — Enable persistence `layered.ts:140-140`
- **enableVectorDeltas** — Enable vector deltas `layered.ts:143-143`
- **enableWorkingDeltas** — Enable working deltas `layered.ts:162-162`
- **encoding** — Specifies the encoding for streaming queries `query.ts:241-241`
- **encodingFormat** — The encoding format for the embeddings `semantic.ts:250-250`
- **encodingFormat** — Encoding format for embeddings `semantic.ts:362-362`
- **end** — End position of the method `parser-python-types.ts:137-137`
- **end** — Represents the end position of a Python element `parser-python-types.ts:187-187`
- **end** — Represents the end position of a source span `parser.ts:70-70`
- **end** — Represents the end position in a file `storage.ts:77-77`
- **endIndex** — Represents the end index of the AST node `parser-ast-types.ts:21-21`
- **endIndex** — Represents the end index of an AST node, used for interoperability between different parser implementations `parser-ast-types.ts:82-82`
- **endLine** — End line number of the code fragment `semantic.ts:94-94`
- **endLine** — Represents the end of a line in code `semantic.ts:121-121`
- **endpoints** — A list of endpoints for semantic operations `semantic.ts:254-254`
- **endpoints** — List of endpoints for API requests `semantic.ts:365-365`
- **endPosition** — Represents the ending position of the AST node `parser-ast-types.ts:19-19`
- **endPosition** — Indicates the end position of the AST node in terms of row and column numbers `parser-ast-types.ts:80-80`
- **enhancedBasicParsing** — Enable Layer 1: Enhanced basic parsing `parser-python-types.ts:62-62`
- **entities** — Represents the entities extracted from the source code `parser.ts:451-451`
- **entities** — Lists entities in the parser system `parser.ts:568-568`
- **entities** — Represents a collection of parsed entities `parser.ts:588-588`
- **entities** — Map of string to Entity for graph entities `query.ts:63-63`
- **entities** — Entities involved in the semantic analysis `semantic.ts:74-74`
- **entities** — Represents a collection of entities in the storage layer `storage.ts:184-184`, `storage.ts:200-210`
- **entities** — Collection of entities `storage.ts:327-327`
- **entity** — Represents an entity in the codebase `chaos-analysis.ts:288-288`
- **entity** — Represents an entity in the parser system `parser.ts:553-553`
- **entity** — Represents an entity in the query `query.ts:80-80`
- **entity** — An entity in the graph `query.ts:100-100`
- **entity** — Criteria for narrowing entity lookup results `query.ts:137-137`
- **entity** — Represents an entity in the storage layer `storage.ts:191-191`
- **entity_count** — The number of entities in the storage `storage.ts:222-222`
- **entityCount** — Represents the count of entities `storage.ts:137-137`
- **entityDelta** — Entity changes `layered.ts:57-57`, `layered.ts:92-92`
- **entityId** — Entity ID from Code Graph RAG `chaos-analysis.ts:59-59`
- **entityId** — The unique identifier for the state variable `chaos-analysis.ts:90-90`, `chaos-analysis.ts:108-108`
- **entityId** — Not present in the provided code `chaos-analysis.ts:362-362`
- **entityId** — The ID of the entity `query.ts:125-125`
- **entityId** — Represents the unique identifier of an entity `storage.ts:192-192`
- **entityId** — Identifier for an entity within a specific context `storage.ts:283-283`
- **entityName** — Function/class/component name `chaos-analysis.ts:60-60`
- **entityName** — The name of the entity (function/class/component) where the state variable is used `chaos-analysis.ts:91-91`, `chaos-analysis.ts:109-109`
- **entityName** — Not present in the provided code `chaos-analysis.ts:363-363`
- **entityType** — Enumerates the types of entities in the storage layer `storage.ts:145-145`, `storage.ts:172-172`
- **error** — Error encountered during task execution `agent.ts:52-52`
- **error** — Represents an error object `storage.ts:247-247`
- **errorCount** — Number of parsing errors encountered `parser.ts:527-527`
- **errorRate** — Calculates the error rate of queries `query.ts:252-252`
- **errors** — Stores any errors encountered during parsing `parser.ts:458-463`
- **errors** — Stores error messages or error objects `storage.ts:247-247`
- **estimatedCost** — Represents the estimated cost of a query `query.ts:200-200`
- **estimatedEffort** — Estimated effort required for the refactoring `chaos-analysis.ts:218-218`
- **estimatedEffort** — Estimates the effort required to fix issues `chaos-analysis.ts:301-301`
- **estimatedLOCChange** — Represents the estimated change in lines of code `chaos-analysis.ts:249-249`
- **estimatedRisk** — Stores the estimated risk of a query `query.ts:132-132`
- **evalExecCount** — Counts the number of `eval` calls that execute `parser.ts:434-434`
- **evalInClosureCount** — Counts the number of `eval` calls within closures `parser.ts:416-416`
- **examples** — Not applicable `parser.ts:340-340`
- **exceptionHandling** — Manages exception handling in the code `parser.ts:265-271`
- **exceptionHandling** — Handles exceptions during parsing and analysis `parser.ts:558-564`
- **exceptionPatternsFound** — Identifies exception patterns in the Python code `parser-python-types.ts:284-284`
- **exceptions** — Represents exceptions in the parser system `parser.ts:301-305`
- **exceptPassCount** — Counts the number of `except` blocks that pass `parser.ts:429-429`
- **exceptTypes** — Stores exception types in a try-except block `parser.ts:268-268`
- **exceptTypes** — Specifies types of exceptions handled `parser.ts:560-560`
- **excludePatterns** — Not present in the provided code `chaos-analysis.ts:332-332`
- **executionTimeMs** — Records the time taken to execute the query in milliseconds `query.ts:192-192`
- **explanation** — Explains the cause of a state management issue `chaos-analysis.ts:381-381`
- **expression** — Represents an expression in the parser system `parser.ts:311-311`
- **expression** — Represents the parsed expression `parser.ts:382-382`
- **extractAllMagicMethods** — Extract all magic methods `parser-python-types.ts:74-74`
- **extractInheritance** — Represents extracting inheritance relationships in parsing `parser.ts:506-506`
- **extractMagicMethods** — Represents extracting magic methods in parsing `parser.ts:510-510`
- **extractOverrides** — Represents extracting method overrides in parsing `parser.ts:507-507`
- **extractReferences** — Represents extracting references in parsing `parser.ts:505-505`
- **failed** — Indicates a failed operation or state `storage.ts:246-246`
- **file** — File path `chaos-analysis.ts:56-56`
- **file** — The file path where the state variable is defined `chaos-analysis.ts:88-88`, `chaos-analysis.ts:107-107`
- **file** — Represents a file in the codebase `chaos-analysis.ts:287-287`
- **file** — Not present in the provided code `chaos-analysis.ts:360-360`
- **file_path** — Represents the file path of an entity in the schema `storage.ts:204-204`
- **fileCount** — Count of files `storage.ts:307-307`
- **filePath** — Represents the file path in the layered indexing architecture `layered.ts:259-259`
- **filePath** — Represents the file path of a parsed entity `parser.ts:167-167`
- **filePath** — Stores the file path of the parsed code `parser.ts:449-449`
- **filePath** — Stores the file path of the changed content `parser.ts:476-476`
- **filePath** — String or array of string for file path `query.ts:43-43`
- **filePath** — Represents the file path of an entity `storage.ts:73-73`, `storage.ts:193-193`
- **filePath** — Stores the file path of an entity `storage.ts:146-146`, `storage.ts:174-174`
- **filePath** — File path where an entity is located `storage.ts:304-304`
- **files** — List of files involved in the refactoring `chaos-analysis.ts:217-217`
- **files** — Stores the list of files in the GitDiffResult `layered.ts:291-291`
- **files** — Represents the files to be parsed `parser.ts:497-497`
- **files** — A collection of files related to the entity `storage.ts:218-223`
- **filesParsed** — Total number of files parsed `parser.ts:520-520`
- **filesWithMutations** — List of files containing mutations `chaos-analysis.ts:180-180`
- **filters** — Represents a set of filters for querying entities `storage.ts:143-149`, `storage.ts:157-163`, `storage.ts:170-177`
- **firstChild** — Represents the first child node of the AST node `parser-ast-types.ts:35-35`
- **firstNamedChild** — Represents the first named child node of the AST node `parser-ast-types.ts:37-37`
- **flowMap** — Maps the flow of state management in the codebase `chaos-analysis.ts:309-309`
- **framework** — Framework type (angular, react, vue, vanilla, unknown) `chaos-analysis.ts:42-42`
- **from** — Sender of the message `agent.ts:36-36`
- **from** — The source node of the state flow edge `chaos-analysis.ts:122-122`
- **from** — Source entity in a relationship `parser.ts:533-533`
- **from_id** — Represents the identifier of the source entity in a relationship `storage.ts:213-213`
- **fromCache** — Indicates whether the parsed content was retrieved from the cache `parser.ts:455-455`
- **fromCache** — Indicates whether the query result was fetched from cache `query.ts:191-191`
- **fromId** — Represents the identifier of the entity from which the relationship originates `storage.ts:118-118`
- **fromId** — Specifies the ID of the entity from which the relationship originates `storage.ts:160-160`
- **fromModule** — Specifies the module from which an import is taken `parser.ts:239-239`
- **fullObjectCaptureCount** — Counts the number of full object captures in the code `parser.ts:415-415`
- **generateRefactoringPlan** — Not present in the provided code `chaos-analysis.ts:329-329`
- **generatorsFound** — Counts the number of generator functions found in the Python code `parser-python-types.ts:260-260`
- **generatorType** — Determines the type of a generator `parser.ts:223-223`
- **genericRaiseCount** — Counts the number of generic `raise` statements `parser.ts:430-430`
- **getterName** — Name of the getter method `parser-python-types.ts:122-122`
- **GIT_AUTO_REINDEX** — Automatically reindex Git repositories `global.d.ts:95-95`
- **GIT_ENABLED** — Enable Git operations `global.d.ts:94-94`
- **GIT_INCLUDE_UNTRACKED** — Include untracked files in Git operations `global.d.ts:100-100`
- **GIT_POLL_INTERVAL_MS** — Interval in milliseconds for polling Git changes `global.d.ts:96-96`
- **GIT_UNCOMMITTED_POLL_INTERVAL_MS** — Interval in milliseconds for polling uncommitted changes `global.d.ts:99-99`
- **GIT_WATCH_BRANCH_CHANGES** — Watch for branch changes in Git `global.d.ts:97-97`
- **GIT_WATCH_UNCOMMITTED** — Watch for uncommitted changes in Git `global.d.ts:98-98`
- **grpcPort** — The port number for gRPC communication `semantic.ts:252-252`
- **grpcPort** — Port number for gRPC communication `semantic.ts:364-364`
- **hasDeleter** — Indicates whether a deleter method exists `parser-python-types.ts:121-121`
- **hasDeleter** — Indicates whether a property has a deleter method `parser-python-types.ts:169-169`
- **hasElse** — Checks if an else clause is present in a conditional statement `parser.ts:562-562`
- **hasFinally** — Checks if a node has a finally block `parser.ts:269-269`
- **hasFinally** — Checks if a finally block is present in a try-catch statement `parser.ts:563-563`
- **hasGetter** — Indicates whether a property has a getter `parser-python-types.ts:119-119`
- **hasGetter** — Indicates whether a property has a getter method `parser-python-types.ts:167-167`
- **hasGetter** — Checks if a node has a getter `parser.ts:255-255`
- **hash** — Stores the hash of the cached content `parser.ts:467-467`
- **hash** — Represents a unique identifier for the query `query.ts:179-179`
- **hash** — Represents the hash of an entity `storage.ts:74-74`, `storage.ts:207-207`
- **hash** — Represents the hash of the file `storage.ts:135-135`
- **hash** — A unique identifier for the entity, typically a hash of its content `storage.ts:220-220`
- **hasLock** — Not present in the provided code `chaos-analysis.ts:367-367`
- **hasLocks** — Indicates whether locks are used in state management `chaos-analysis.ts:408-408`
- **hasMutation** — Indicates if the state flow node has mutations `chaos-analysis.ts:114-114`
- **hasRelationType** — RelationType for entity relation type `query.ts:44-44`
- **hasSetter** — Indicates whether a property has a setter `parser-python-types.ts:120-120`
- **hasSetter** — Indicates whether a property has a setter method `parser-python-types.ts:168-168`
- **hasSetter** — Checks if a node has a setter `parser.ts:256-256`
- **hasSideEffects** — Returns true if the expression has side effects `parser.ts:378-378`
- **hasTryExcept** — Checks if a node has a try-except block `parser.ts:267-267`
- **hasValue** — Represents hasValue in the parser system `parser.ts:307-307`
- **hasWithStatement** — Indicates whether the parsed entity contains a with statement `parser.ts:392-392`
- **headers** — Represents the headers of the response `global.d.ts:216-216`
- **headers** — Defines the headers to be sent with the request `global.d.ts:232-232`
- **headers** — Represents optional headers for requests `semantic.ts:307-307`
- **HF_API_TOKEN** — Stores the Hugging Face API token `global.d.ts:66-66`
- **HF_TOKEN** — Stores the Hugging Face API token `global.d.ts:65-65`
- **highWaterMark** — Sets the high water mark for streaming queries `query.ts:240-240`
- **hitRate** — Calculates the hit rate of cache operations `query.ts:211-211`
- **hitRate** — Returns statistics about the storage, including size, hits, misses, and hit rate `storage.ts:347-347`
- **hits** — Counts the number of cache hits `storage.ts:256-256`
- **hits** — Number of cache hits `storage.ts:347-347`
- **HOME** — Represents the home directory of the user `global.d.ts:10-10`
- **hotspots** — Identifies hotspots in the codebase `chaos-analysis.ts:285-291`
- **HUGGING_FACE_HUB_TOKEN** — Stores the Hugging Face Hub token `global.d.ts:67-67`
- **huggingface** — Represents an optional object with properties for Hugging Face API configuration `semantic.ts:335-343`
- **HUGGINGFACE_API_KEY** — Stores the API key for the Hugging Face API `global.d.ts:61-61`
- **HUGGINGFACE_BASE_URL** — Sets the base URL for the Hugging Face API `global.d.ts:60-60`
- **HUGGINGFACE_CONCURRENCY** — Specifies the number of concurrent API requests to Hugging Face `global.d.ts:63-63`
- **HUGGINGFACE_TIMEOUT_MS** — Sets the timeout for Hugging Face API requests in milliseconds `global.d.ts:62-62`
- **HUGGINGFACE_WARMUP_TEXT** — Defines the text used to warm up the Hugging Face API `global.d.ts:64-64`
- **id** — Unique identifier for an agent `agent.ts:34-34`, `agent.ts:44-44`, `agent.ts:56-56`
- **id** — The unique identifier for the state flow node `chaos-analysis.ts:106-106`
- **id** — Represents the unique identifier of a parsed entity `parser.ts:164-164`
- **id** — String or array of string for entity ID `query.ts:42-42`
- **id** — Stores the ID of a graph query `query.ts:178-178`
- **id** — A unique identifier for the embedding `semantic.ts:30-30`, `semantic.ts:43-43`, `semantic.ts:51-51`
- **id** — Identifier for a semantic analysis result `semantic.ts:84-84`, `semantic.ts:99-99`, `semantic.ts:111-111`
- **id** — Represents the unique identifier of an entity `storage.ts:70-70`, `storage.ts:117-117`
- **id** — Represents the unique identifier of an entity in the schema `storage.ts:201-201`, `storage.ts:212-212`
- **id** — Unique identifier for a performance metric `storage.ts:274-274`
- **id** — Unique identifier for an entity `storage.ts:282-282`
- **identifier** — Variable name (e.g., "token", "userId") `chaos-analysis.ts:73-73`
- **idiom** — Represents a specific Python idiom `parser.ts:574-574`
- **idle** — Number of idle connections in the pool `storage.ts:268-268`
- **idleTimeout** — Defines the idle timeout for connections in the pool `query.ts:228-228`
- **impact** — Indicates the impact of a code change `semantic.ts:131-131`
- **impactedEntities** — Entities impacted by the change `query.ts:115-115`
- **impactLevel** — Represents the impact level of an affected entity `query.ts:138-138`
- **importChain** — The chain of imports leading to the state variable `chaos-analysis.ts:95-95`
- **importData** — Manages import data for a module `parser.ts:228-241`
- **importData** — Imports data into the storage `storage.ts:90-97`
- **importDependencies** — Tracks import dependencies in the Python code `parser-python-types.ts:276-276`
- **imported** — Indicates whether a Python identifier is imported `parser-python-types.ts:228-228`
- **imported** — Tracks imported modules `parser.ts:233-233`
- **imported** — Indicates whether an import is imported `storage.ts:93-93`
- **importType** — Represents the type of an import `parser-python-types.ts:208-208`
- **improvedMaintainability** — Indicates whether maintainability has been improved `chaos-analysis.ts:248-248`
- **improvedTestability** — Indicates whether testability has been improved `chaos-analysis.ts:247-247`
- **includeSourceSnippets** — Represents including source snippets in parsing `parser.ts:511-511`
- **includeVisualization** — Not present in the provided code `chaos-analysis.ts:328-328`
- **incomingRelationships** — The incoming relationships of an entity `query.ts:104-104`
- **index** — Index of the method `parser-python-types.ts:136-136`, `parser-python-types.ts:137-137`
- **index** — Represents the index of a Python element `parser-python-types.ts:186-186`, `parser-python-types.ts:187-187`
- **index** — Represents the character index in a source file `parser.ts:65-65`
- **index** — Represents the index position in a file `storage.ts:76-76`, `storage.ts:77-77`
- **index** — Returns an array of indices and scores for the top k vectors closest to the query vector `wasm-modules.d.ts:18-18`
- **INDEXER_AGENT_BATCH_SIZE** — The batch size for indexer agents `global.d.ts:145-145`
- **INDEXER_AGENT_CACHE_SIZE** — The cache size for indexer agents `global.d.ts:146-146`
- **INDEXER_AGENT_CACHE_TTL** — The time-to-live for cache entries in indexer agents `global.d.ts:147-147`
- **INDEXER_AGENT_MAX_CONCURRENCY** — The maximum number of concurrent indexer agents `global.d.ts:142-142`
- **INDEXER_AGENT_MEMORY_LIMIT** — The memory limit for indexer agents `global.d.ts:143-143`
- **INDEXER_AGENT_PRIORITY** — The priority level for indexer agents `global.d.ts:144-144`
- **INDEXING_AUTO_SWITCH** — Automatically switch indexing branches `global.d.ts:103-103`
- **INDEXING_BRANCH_AWARE** — Indexing is branch-aware `global.d.ts:102-102`
- **INDEXING_CLEANUP_INTERVAL_MS** — Interval in milliseconds for cleaning up indexing data `global.d.ts:107-107`
- **INDEXING_DATA_DIR** — Directory for indexing data `global.d.ts:104-104`
- **INDEXING_INCREMENTAL_THRESHOLD** — Threshold for incremental indexing `global.d.ts:108-108`
- **INDEXING_MAX_BRANCHES_PER_REPO** — Maximum number of branches per repository `global.d.ts:105-105`
- **INDEXING_MAX_TOTAL_BRANCHES** — Maximum total number of branches `global.d.ts:106-106`
- **indexSizeMB** — The size of the index in megabytes `storage.ts:233-233`
- **indirectImpacts** — Indirect impacts of the change `query.ts:114-114`
- **inheritance** — Stores inheritance information `parser.ts:206-213`
- **inheritanceHierarchiesBuilt** — Counts the number of inheritance hierarchies built `parser-python-types.ts:267-267`
- **inheritanceRelationships** — Stores inheritance relationships between classes `parser-python-types.ts:274-274`
- **innerFunctionCount** — Counts the number of inner functions `parser.ts:413-413`
- **innerHtmlAssignCount** — Counts the number of innerHTML assignments `parser.ts:404-404`
- **insertL** — Length of the insert operation `semantic.ts:174-174`
- **integrity** — Provides an integrity constraint for the request `global.d.ts:240-240`
- **interface** — Defines types for state operations and Angular-specific state management patterns `chaos-analysis.ts:235-235`
- **interfaces** — Lists interfaces for the entity `parser.ts:209-209`
- **isAbstract** — Indicates if the entity is abstract `parser.ts:211-211`
- **isAsync** — Not present in the provided code `chaos-analysis.ts:366-366`
- **isAsync** — Indicates if the method is asynchronous `parser-python-types.ts:101-101`
- **isAsync** — Determines if a function is asynchronous `parser.ts:217-217`
- **isAsyncGenerator** — Identifies if a function is an asynchronous generator `parser.ts:219-219`
- **isAwait** — Determines if a node is an await expression `parser.ts:283-283`
- **isBuiltin** — Indicates if the entity is a built-in type `parser.ts:191-191`
- **isBuiltin** — Represents whether an entity is built-in `storage.ts:104-104`
- **isContextManager** — Determines if a node is a context manager `parser.ts:264-264`
- **isDataclass** — Identifies if a node is a dataclass `parser.ts:257-257`
- **isDefault** — Indicates whether a Python identifier is a default value `parser-python-types.ts:214-214`
- **isDefault** — Checks if an import is a default import `parser.ts:236-236`
- **isDefault** — Indicates whether an import is a default import `storage.ts:94-94`
- **isDefensive** — Has null checks, type guards, etc `chaos-analysis.ts:65-65`
- **isDefensive** — Indicates if the state flow node has defensive checks `chaos-analysis.ts:113-113`
- **isDirectRelation** — Boolean indicating if the relationship is direct `parser.ts:542-542`
- **isGenerator** — Indicates if the method is a generator `parser-python-types.ts:104-104`
- **isGenerator** — Checks if a function is a generator `parser.ts:218-218`
- **isLocal** — Indicates whether a Python identifier is local `parser-python-types.ts:232-232`
- **isNamespace** — Determines if an import is a namespace import `parser.ts:237-237`
- **isNamespace** — Indicates whether an import is a namespace import `storage.ts:95-95`
- **isNew** — Determines if a node is a new expression `parser.ts:285-285`
- **isOptional** — Checks if a node is optional `parser.ts:284-284`
- **isProperty** — Determines if a node is a property `parser.ts:254-254`
- **isRelative** — Identifies if an import is relative `parser.ts:238-238`
- **issues** — Lists issues found in the codebase `chaos-analysis.ts:289-289`
- **isUsed** — Indicates whether a Python identifier is used in the code `parser-python-types.ts:221-221`
- **item** — Represents an item in the storage or cache `storage.ts:247-247`
- **jitHints** — Provides hints for Just-In-Time compilation `parser.ts:388-396`
- **k** — A parameter for similarity search `semantic.ts:143-143`
- **keepalive** — Indicates whether the request should be kept alive `global.d.ts:241-241`
- **key** — The key associated with a cache entry `storage.ts:252-252`
- **kind** — Not applicable `parser.ts:351-351`
- **kind** — Specifies the type of relationship or entity `parser.ts:587-587`
- **l1Entries** — Tracks entries in the L1 cache `query.ts:215-215`
- **l2Entries** — Tracks entries in the L2 cache `query.ts:216-216`
- **l3Entries** — Tracks entries in the L3 cache `query.ts:217-217`
- **label** — The label of the state flow edge `chaos-analysis.ts:125-125`
- **labels** — An array of indices corresponding to the distances `faiss-node.d.ts:11-11`
- **language** — Represents the programming language of a parsed entity `parser.ts:168-168`
- **language** — Stores the language of the parsed code `parser.ts:450-450`
- **language** — Language of the cross-language result `semantic.ts:113-113`
- **language** — Specifies the programming language of an entity `storage.ts:99-99`
- **language** — Represents the programming language of the entity `storage.ts:112-112`
- **last_indexed** — The timestamp when the entity was last indexed `storage.ts:221-221`
- **lastAccessed** — The last time a cache entry was accessed `storage.ts:262-262`
- **lastActivity** — Timestamp of the last activity of the agent `agent.ts:92-92`
- **lastChild** — Represents the last child node of the AST node `parser-ast-types.ts:36-36`
- **lastIndexed** — Represents the timestamp when the file was last indexed `storage.ts:136-136`
- **lastModified** — Last modification timestamp `layered.ts:63-63`, `layered.ts:98-98`, `layered.ts:125-125`
- **lastNamedChild** — Represents the last named child node of the AST node `parser-ast-types.ts:38-38`
- **lastVacuum** — The timestamp of the last vacuum operation `storage.ts:236-236`
- **length** — Number for path length `query.ts:55-55`
- **libsql** — Library used for SQL operations `semantic.ts:170-177`
- **LIBSQL_COMPRESSION** — Enables or disables compression for the LIBSQL library `global.d.ts:83-83`
- **LIBSQL_INSERT_L** — Sets the insert limit for the LIBSQL library `global.d.ts:85-85`
- **LIBSQL_METRIC** — Stores the metric for the LIBSQL library `global.d.ts:82-82`
- **LIBSQL_SEARCH_L** — Sets the search limit for the LIBSQL library `global.d.ts:84-84`
- **lightweight** — Indicates whether a query is lightweight `storage.ts:153-153`
- **limit** — The maximum number of results to return `semantic.ts:144-144`
- **limit** — Defines the maximum number of results to return in a query `storage.ts:150-150`, `storage.ts:164-164`, `storage.ts:179-179`
- **limit** — Maximum limit for a batch of operations `storage.ts:305-305`
- **line** — Line number `chaos-analysis.ts:57-57`
- **line** — The line number in the file where the state variable is defined `chaos-analysis.ts:89-89`
- **line** — Not present in the provided code `chaos-analysis.ts:361-361`
- **line** — Stores the line number of the decorator `parser-python-types.ts:111-111`
- **line** — Line number of the method `parser-python-types.ts:136-136`, `parser-python-types.ts:137-137`
- **line** — Represents the line number of a Python element `parser-python-types.ts:186-186`, `parser-python-types.ts:187-187`
- **line** — Represents the line number in the Python code `parser-python-types.ts:218-218`, `parser-python-types.ts:224-224`
- **line** — Represents the line number in a source file `parser.ts:63-63`
- **line** — Represents a line number in the source code `parser.ts:251-251`
- **line** — Indicates the line number of the error `parser.ts:461-461`
- **line** — Line number in the source file `parser.ts:540-540`
- **line** — Indicates the line number of a source code element `parser.ts:561-561`, `parser.ts:575-575`
- **line** — Represents the line number in the source code `parser.ts:591-591`
- **line** — Represents the line number in a file `storage.ts:76-76`, `storage.ts:77-77`
- **line** — Represents the line number in the file where the entity is located `storage.ts:123-123`
- **linesOfCode** — Not applicable `parser.ts:360-360`
- **linesOfLogic** — Not applicable `parser.ts:361-361`
- **llamacpp** — Represents configuration for Llama.cpp server with optional parameters `semantic.ts:369-381`
- **local** — Indicates local import information `parser.ts:232-232`
- **local** — Indicates whether an import is local `storage.ts:93-93`
- **LOCALAPPDATA** — Represents the local application data directory `global.d.ts:13-13`
- **localCopies** — Detects local copies of state variables `chaos-analysis.ts:163-163`
- **localPath** — The local path to the model `semantic.ts:296-296`
- **location** — Location of the method `parser-python-types.ts:135-138`
- **location** — Represents the location of a Python element `parser-python-types.ts:185-188`
- **location** — Represents the location of a parsed entity `parser.ts:162-162`
- **location** — Stores the location of a node in the source code `parser.ts:281-281`
- **location** — Represents a location in the parser system `parser.ts:295-295`, `parser.ts:299-299`, `parser.ts:304-304`, `parser.ts:308-308`, `parser.ts:312-312`
- **location** — Not applicable `parser.ts:352-352`
- **location** — Indicates the location of the parsed entity in the source code `parser.ts:383-383`
- **location** — Specifies the location of the error in the source code `parser.ts:461-461`
- **location** — Represents the location of a source code element `parser.ts:561-561`
- **location** — Represents the location of an entity `storage.ts:75-78`
- **location** — Represents the location of an entity in the schema `storage.ts:205-205`
- **locations** — Identifies the locations of issues found in the codebase `chaos-analysis.ts:296-296`
- **locations** — Lists the locations where state is accessed or modified `chaos-analysis.ts:379-379`
- **locations** — Stores locations of source code elements `parser.ts:575-575`
- **locations** — Stores the source code locations of parsed entities `parser.ts:591-591`
- **locked** — Indicates whether a stream is locked `global.d.ts:192-192`
- **LOG_ENABLE_CONSOLE** — Enable console logging `global.d.ts:92-92`
- **LOG_FILE** — Specifies the file to write log messages to `global.d.ts:89-89`
- **LOG_FORMAT** — Defines the format of the log messages `global.d.ts:88-88`
- **LOG_LEVEL** — Sets the logging level (e.g., debug, info, warn, error) `global.d.ts:87-87`
- **LOG_MAX_FILE_SIZE** — Sets the maximum size of the log file `global.d.ts:90-90`
- **LOG_MAX_FILES** — Maximum number of log files to keep `global.d.ts:91-91`
- **loops** — Represents loops in the parser system `parser.ts:297-300`
- **magicMethods** — Magic methods of the class `parser-python-types.ts:162-162`
- **magicMethodsFound** — Stores the magic methods found in the Python code `parser-python-types.ts:257-257`
- **magicMethodType** — Determines the type of a magic method `parser.ts:245-245`
- **magicType** — Stores the magic method type if applicable `parser-python-types.ts:115-115`
- **mapNewCount** — Counts the number of `new Map()` instances `parser.ts:419-419`
- **mappingTimeMs** — Records the time taken for mapping relationships in milliseconds `parser-python-types.ts:271-271`
- **maxBatchMs** — The maximum batch time in milliseconds `semantic.ts:282-282`
- **maxBatchSize** — The maximum batch size for the embedding provider `semantic.ts:248-248`
- **maxBatchSize** — Maximum batch size for API requests `semantic.ts:320-320`
- **maxBatchSize** — Represents an optional number for maximum batch size `semantic.ts:330-330`
- **maxBatchSize** — Maximum batch size for processing `semantic.ts:374-374`
- **maxBatchSize** — Optimal batch size for 4-core CPU `semantic.ts:387-387`
- **maxBranchDeltas** — Maximum number of branch deltas `layered.ts:137-137`
- **maxConcurrency** — Maximum number of concurrent tasks an agent can handle `agent.ts:21-21`
- **maxConcurrentAgents** — Maximum number of concurrent agents `agent.ts:28-28`
- **maxConnections** — Sets the maximum number of connections in the pool `query.ts:226-226`
- **maxCpuPercent** — Maximum CPU percentage for agents `agent.ts:29-29`
- **maxDepth** — Determines the maximum depth of state variable operations `chaos-analysis.ts:138-138`
- **maxDepth** — Not present in the provided code `chaos-analysis.ts:331-331`
- **maxDepth** — Maximum depth for parsing nested structures `parser.ts:512-512`
- **maxMemoryMB** — Maximum memory in MB for agents `agent.ts:27-27`
- **maxQueue** — The maximum length of the agent's task queue `errors.ts:8-8`
- **maxSeqLen** — Represents the maximum sequence length for model input `semantic.ts:388-388`
- **maxTaskQueueSize** — Maximum task queue size for agents `agent.ts:30-30`
- **maxTokens** — The maximum number of tokens allowed for embedding generation `semantic.ts:214-214`
- **maxWorkingDeltas** — Maximum number of working deltas `layered.ts:165-165`
- **MCP_AGENT_TIMEOUT** — Represents the timeout for the agent `global.d.ts:26-26`
- **MCP_DEBUG** — Represents the debug mode for the application `global.d.ts:18-18`
- **MCP_DEBUG_DISABLE_SEMANTIC** — Represents whether semantic debugging is disabled `global.d.ts:20-20`
- **MCP_DEBUG_MODE** — Represents the debug mode for the application `global.d.ts:19-19`
- **MCP_DEV_INDEX_BATCH** — Represents the batch size for the development index `global.d.ts:28-28`
- **MCP_EMBEDDING_API_KEY** — Stores the API key for the embedding provider `global.d.ts:35-35`
- **MCP_EMBEDDING_ENABLED** — Represents whether embedding is enabled `global.d.ts:32-32`
- **MCP_EMBEDDING_FALLBACK** — Indicates the fallback provider if the main provider fails `global.d.ts:36-36`
- **MCP_EMBEDDING_MODEL** — Defines the model used for embeddings `global.d.ts:34-34`
- **MCP_EMBEDDING_PROVIDER** — Specifies the provider for embedding models `global.d.ts:33-33`
- **MCP_EMBEDDING_TWO_PHASE** — Enables a two-phase embedding process `global.d.ts:37-37`
- **MCP_MAX_CONCURRENT_AGENTS** — Represents the maximum number of concurrent agents `global.d.ts:27-27`
- **MCP_QUIET_MODE** — Represents the quiet mode for the application `global.d.ts:21-21`
- **MCP_SEMANTIC_WARMUP_LIMIT** — Represents the limit for semantic warmup `global.d.ts:29-29`
- **MCP_SEMANTIC_WARMUP_TOPIC** — Represents the topic for semantic warmup `global.d.ts:30-30`
- **MCP_SERVER_HOST** — Represents the host of the server `global.d.ts:23-23`
- **MCP_SERVER_PORT** — Represents the port of the server `global.d.ts:24-24`
- **MCP_SERVER_TIMEOUT** — Represents the timeout for the server `global.d.ts:25-25`
- **MCP_USE_PARSER** — Represents whether the parser is used `global.d.ts:22-22`
- **members** — Members of the clone group `semantic.ts:102-102`
- **memoryLimit** — Memory limit for an agent `agent.ts:22-22`
- **memoryLimitMB** — The maximum memory limit for the agent in megabytes `errors.ts:12-12`
- **memoryUsageMB** — The current memory usage of the agent in megabytes `errors.ts:11-11`
- **memoryUsageMB** — Measures memory usage in megabytes `query.ts:214-214`
- **memoryUsageMB** — The memory usage of the storage in megabytes `storage.ts:240-240`
- **memoryUsedMB** — Represents the memory usage in megabytes during Python analysis `parser-python-types.ts:299-299`
- **mergeBaseSha** — Stores the merge base commit SHA for the Git diff `layered.ts:300-300`
- **message** — Contains the error message if an error occurred `parser.ts:460-460`
- **metaclass** — Represents the metaclass of a Python class `parser-python-types.ts:173-173`
- **metadata** — Stores metadata related to a Python identifier `parser-python-types.ts:234-234`
- **metadata** — Contains metadata about the entity `parser.ts:182-182`
- **metadata** — Stores metadata about the parsed code `parser.ts:443-443`
- **metadata** — Metadata associated with the relationship `parser.ts:538-546`
- **metadata** — Stores additional metadata about parsed entities `parser.ts:592-592`
- **metadata** — Stores metadata about the query execution `query.ts:190-194`
- **metadata** — Optional metadata for the embedding `semantic.ts:34-34`, `semantic.ts:46-46`, `semantic.ts:54-54`
- **metadata** — Stores metadata associated with an entity `storage.ts:79-108`
- **metadata** — Stores additional metadata about the entity `storage.ts:121-128`
- **metadata** — Represents metadata associated with an entity `storage.ts:206-206`
- **metadata** — Stores additional information about the entity, such as modifiers `storage.ts:216-216`
- **method** — Specifies the HTTP method for the request `global.d.ts:231-231`
- **methodOverrides** — Stores method overrides found in the Python code `parser-python-types.ts:275-275`
- **methodOverridesDetected** — Detects method overrides in the Python code `parser-python-types.ts:268-268`
- **methodResolutionOrder** — Represents the method resolution order of a class `parser-python-types.ts:190-190`
- **methods** — Represents the methods of a class `parser-python-types.ts:181-181`
- **methods** — Contains methods for parsing and analyzing code `parser.ts:555-555`
- **methodsClassified** — Stores classified methods in the Python code `parser-python-types.ts:249-249`
- **methodType** — Represents the type of the method `parser.ts:204-204`
- **metric** — Metric used for similarity search `semantic.ts:172-172`
- **metrics** — Provides metrics for the chaos analysis `chaos-analysis.ts:310-310`
- **metrics** — Metrics related to the graph traversal `query.ts:101-106`
- **minConnections** — Sets the minimum number of connections in the pool `query.ts:227-227`
- **miniBatchSize** — Size of mini-batch for processing `semantic.ts:360-360`
- **missCount** — Counts the number of cache misses `storage.ts:261-261`
- **misses** — Number of cache misses `storage.ts:347-347`
- **mlx** — Represents configuration for MLX model with optional parameters `semantic.ts:383-390`
- **mode** — Determines the mode of the request (e.g., 'cors', 'no-cors', 'same-origin') `global.d.ts:234-234`
- **modelDir** — The directory containing the model for the embedding provider `semantic.ts:245-245`
- **modelDir** — Directory path for model files `semantic.ts:386-386`
- **modelName** — The name of the model used for embedding generation `semantic.ts:210-210`, `semantic.ts:293-293`
- **modelName** — Name of the model used for embeddings `storage.ts:286-286`
- **modified** — Entities modified in this layer (present in parent but changed) `layered.ts:24-24`, `layered.ts:39-39`
- **modifiedEmbeddings** — Entities modified in this layer (present in parent but changed) `layered.ts:119-119`
- **modifiers** — Stores modifiers for the entity `parser.ts:186-186`
- **modifiers** — Stores modifiers for an entity `storage.ts:80-80`
- **module** — Stores the module name of the decorator `parser-python-types.ts:109-109`
- **module** — Represents the module in which a Python identifier is defined `parser-python-types.ts:226-226`
- **module** — Represents a module in the code `parser.ts:249-249`
- **mro** — Method Resolution Order of the class `parser-python-types.ts:156-156`
- **mro** — Represents the method resolution order `parser.ts:210-210`
- **mroCalculations** — Calculates method resolution order (MRO) for classes `parser-python-types.ts:278-278`
- **mroPosition** — Position in the method resolution order `parser.ts:543-543`
- **mutationPoints** — Identifies points in the code where state variables are mutated `chaos-analysis.ts:137-137`
- **mutations** — Lists mutations in state management `chaos-analysis.ts:397-397`
- **mutationSpread** — Measures the spread of state mutations `chaos-analysis.ts:178-183`
- **mutationType** — Not present in the provided code `chaos-analysis.ts:364-364`
- **name** — Name of the proposed component `chaos-analysis.ts:232-232`
- **name** — Stores the name of the decorator `parser-python-types.ts:108-108`
- **name** — Represents the name of a Python class or method `parser-python-types.ts:166-166`, `parser-python-types.ts:177-177`
- **name** — Represents the name of a Python identifier `parser-python-types.ts:212-212`
- **name** — Represents the name of a parsed entity `parser.ts:160-160`
- **name** — Provides the name of the entity `parser.ts:189-189`, `parser.ts:198-198`
- **name** — Stores the name of a function or variable `parser.ts:248-248`
- **name** — Represents the name of a node `parser.ts:279-279`
- **name** — Represents a name in the parser system `parser.ts:322-322`
- **name** — Not applicable `parser.ts:350-350`, `parser.ts:370-370`
- **name** — String or regular expression for entity name `query.ts:40-40`
- **name** — Name of the code fragment `semantic.ts:90-90`, `semantic.ts:117-117`
- **name** — Represents the name of an entity `storage.ts:71-71`, `storage.ts:84-84`, `storage.ts:102-102`
- **name** — Stores the name of an entity `storage.ts:147-147`, `storage.ts:175-175`
- **name** — Represents the name of an entity in the schema `storage.ts:202-202`
- **namedChildCount** — Represents the count of named child nodes of the AST node `parser-ast-types.ts:26-26`
- **namedChildren** — Represents the list of named child nodes of the AST node `parser-ast-types.ts:24-24`
- **namePattern** — String for entity name pattern `query.ts:41-41`
- **namePattern** — Pattern for naming entities `storage.ts:302-302`
- **nestingDepth** — Not applicable `parser.ts:362-362`
- **newComponents** — Contains the proposed new components for the refactoring `chaos-analysis.ts:261-261`
- **newEndIndex** — The new end index of an edit operation `parser-ast-types.ts:67-67`
- **newEndIndex** — Represents the new end index of a source span `parser.ts:484-484`
- **newEndPosition** — The new end position of an edit operation `parser-ast-types.ts:70-70`
- **newEndPosition** — Represents the new end position of a source span `parser.ts:487-487`
- **nextSibling** — Represents the next sibling node of the AST node `parser-ast-types.ts:28-28`
- **nGpuLayers** — The number of GPU layers used for embedding generation `semantic.ts:256-256`
- **nGpuLayers** — Number of GPU layers for model `semantic.ts:375-375`
- **node** — Represents a node in the parsed entity stack `storage.ts:472-472`
- **NODE_ENV** — Represents the environment in which the Node.js process is running `global.d.ts:8-8`
- **nodes** — Represents nodes in a state flow graph `chaos-analysis.ts:134-134`
- **nodes** — Array of Entity for path nodes `query.ts:54-54`
- **nodes** — The nodes in the graph `query.ts:89-89`
- **nodeText** — Stores the text content of the AST node `parser-ast-types.ts:78-78`
- **nodeType** — Represents the type of the AST node `parser-ast-types.ts:77-77`
- **nonNullAssertionCount** — Counts the number of non-null assertions `parser.ts:402-402`
- **ntotal** — Number of vectors in the index `faiss-node.d.ts:21-21`, `faiss-node.d.ts:31-31`, `faiss-node.d.ts:42-42`, `faiss-node.d.ts:53-53`
- **nullChecks** — Identifies null checks in the code `chaos-analysis.ts:159-159`
- **offset** — Specifies the starting point for a query `storage.ts:151-151`, `storage.ts:165-165`, `storage.ts:180-180`
- **ok** — Indicates whether the response is successful `global.d.ts:213-213`
- **oldEndIndex** — The old end index of an edit operation `parser-ast-types.ts:66-66`
- **oldEndIndex** — Indicates the end index of the previous content `parser.ts:483-483`
- **oldEndPosition** — The old end position of an edit operation `parser-ast-types.ts:69-69`
- **oldEndPosition** — Represents the old end position of a source span `parser.ts:486-486`
- **oldPath** — Stores the old path of the file change `layered.ts:280-280`
- **ollama** — The provider of the embedding service `semantic.ts:302-313`
- **OLLAMA_AUTO_PULL** — Enables automatic pulling of models from Ollama `global.d.ts:43-43`
- **OLLAMA_BASE_URL** — Sets the base URL for the Ollama API `global.d.ts:40-40`
- **OLLAMA_CHECK_SERVER** — Checks the server status before making Ollama API calls `global.d.ts:45-45`
- **OLLAMA_CONCURRENCY** — Sets the concurrency level for Ollama API calls `global.d.ts:42-42`
- **OLLAMA_PULL_TIMEOUT_MS** — Sets the timeout in milliseconds for pulling models from Ollama `global.d.ts:46-46`
- **OLLAMA_TIMEOUT_MS** — Specifies the timeout in milliseconds for Ollama API calls `global.d.ts:41-41`
- **OLLAMA_WARMUP_TEXT** — Provides warmup text for Ollama API `global.d.ts:44-44`
- **openai** — Configuration for the OpenAI API `semantic.ts:315-323`
- **OPENAI_API_KEY** — Stores the API key for the OpenAI API `global.d.ts:49-49`
- **OPENAI_BASE_URL** — Sets the base URL for the OpenAI API `global.d.ts:48-48`
- **OPENAI_CONCURRENCY** — Sets the concurrency level for OpenAI API calls `global.d.ts:51-51`
- **OPENAI_MAX_BATCH_SIZE** — Defines the maximum batch size for OpenAI API calls `global.d.ts:52-52`
- **OPENAI_TIMEOUT_MS** — Specifies the timeout in milliseconds for OpenAI API calls `global.d.ts:50-50`
- **openWithoutWithCount** — Counts the number of `open` calls without `with `parser.ts:436-436`
- **operation** — Specifies the type of operation performed `query.ts:182-182`
- **operations** — All operations on this state `chaos-analysis.ts:76-76`
- **operations** — List of operations to be performed in the refactoring `chaos-analysis.ts:220-225`
- **operationType** — Operation type on state variable `chaos-analysis.ts:61-61`
- **operationType** — The type of operation on the state variable `chaos-analysis.ts:110-110`
- **oppositeConditions** — Lists opposite conditions affecting state management `chaos-analysis.ts:407-407`
- **optional** — Indicates if the entity is optional `parser.ts:200-200`
- **optional** — Represents optional in the parser system `parser.ts:325-325`
- **optional** — Indicates whether a parameter is optional `storage.ts:86-86`
- **options** — Represents the options for parsing `parser.ts:499-499`
- **origin** — Indicates the origin or source of a state variable `chaos-analysis.ts:133-133`
- **orWithDefaultCount** — Counts the number of or-with-default expressions `parser.ts:405-405`
- **otherPatterns** — Stores additional patterns detected during parsing `parser.ts:585-594`
- **outgoingRelationships** — The outgoing relationships of an entity `query.ts:105-105`
- **OV_DEBUG** — Enables debug mode for the OV (OpenVINO) library `global.d.ts:185-185`
- **overall** — Represents the overall analysis result `parser-python-types.ts:294-300`
- **overrideInfo** — Information about method overriding `parser-python-types.ts:128-133`
- **overrides** — List of overridden methods `parser-python-types.ts:129-129`
- **overview** — Provides an overview of the chaos analysis, including key metrics and risks `chaos-analysis.ts:275-284`
- **ovms** — Represents configuration for OVMS server with optional parameters `semantic.ts:354-367`
- **parallelBatches** — The number of parallel batches for embedding generation `semantic.ts:220-220`
- **parameterCount** — Not applicable `parser.ts:363-363`
- **parameters** — Stores parameters for the entity `parser.ts:196-203`
- **parameters** — Specifies the parameters of a function `storage.ts:82-89`
- **paramMutationCount** — Counts the number of parameter mutations `parser.ts:406-406`
- **params** — Represents parameters in the parser system `parser.ts:320-327`
- **params** — Contains parameters used in the query `query.ts:183-183`
- **params** — Stores parameters for a query `query.ts:201-201`
- **parent** — Represents the parent node of the AST node `parser-ast-types.ts:27-27`
- **parentClass** — Parent class of the current class `parser-python-types.ts:130-130`
- **parentName** — Represents the name of the parent entity `parser.ts:173-173`
- **parentPath** — Represents the parent path of the node in the parsed entity stack `storage.ts:472-472`
- **parentSemId** — Represents the parent semantic ID of a parsed entity `parser.ts:172-172`
- **parentType** — Indicates the type of the parent entity `parser.ts:174-174`
- **PARSER_AGENT_BATCH_SIZE** — The batch size for parsing agents `global.d.ts:125-125`
- **PARSER_AGENT_CACHE_SIZE** — The cache size for parsing agents `global.d.ts:126-126`
- **PARSER_AGENT_MAX_CONCURRENCY** — The maximum number of concurrent parsing agents `global.d.ts:122-122`
- **PARSER_AGENT_MEMORY_LIMIT** — The memory limit for parsing agents `global.d.ts:123-123`
- **PARSER_AGENT_PRIORITY** — The priority level for parsing agents `global.d.ts:124-124`
- **PARSER_AGENT_WORKER_POOL_SIZE** — The size of the worker pool for parsing agents `global.d.ts:127-127`
- **PARSER_BUFFER_SIZE** — Buffer size for parsing `global.d.ts:112-112`
- **PARSER_CACHE_SIZE** — Cache size for parsing `global.d.ts:113-113`
- **PARSER_CACHE_TTL** — Time-to-live for parsing cache `global.d.ts:114-114`
- **PARSER_DISABLE_CACHE** — Disable parsing cache `global.d.ts:115-115`
- **PARSER_INCREMENTAL_ENABLED** — Enable incremental parsing `global.d.ts:117-117`
- **PARSER_LANGUAGES** — List of supported languages for parsing `global.d.ts:118-118`
- **PARSER_MAX_FILE_SIZE** — Maximum file size for parsing `global.d.ts:111-111`
- **PARSER_TIMEOUT** — Timeout for parser operations `global.d.ts:110-110`
- **PARSER_TREE_SITTER_ENABLED** — Enable Tree Sitter parser `global.d.ts:116-116`
- **PARSER_USE_WORKERS** — Determines whether the parser uses worker threads `global.d.ts:119-119`
- **parseTimeMs** — Stores the time taken to parse the Python code in milliseconds `parser-python-types.ts:252-252`
- **parseTimeMs** — Measures the time taken to parse the content in milliseconds `parser.ts:454-454`
- **PARSING_WORKER_ID** — The ID of the parsing worker thread `global.d.ts:120-120`
- **PATH** — Represents the path to executable files `global.d.ts:11-11`
- **path** — Stores the file path for GitFileChange `layered.ts:274-274`
- **path** — Represents the file path of a parsed entity `parser.ts:165-165`
- **path** — Path to the code fragment `semantic.ts:86-86`, `semantic.ts:114-114`
- **path** — Represents the file path `storage.ts:134-134`
- **path** — The file path of the entity `storage.ts:219-219`
- **pattern** — Represents a state management pattern in the codebase `chaos-analysis.ts:294-294`
- **pattern** — Not present in the provided code `chaos-analysis.ts:375-375`
- **pattern** — Represents a specific design pattern in the parser system `parser.ts:567-567`
- **patternConfidenceThreshold** — Sets the confidence threshold for pattern matching `parser-python-types.ts:86-86`
- **patternRecognition** — Enable Layer 4: Pattern recognition `parser-python-types.ts:71-71`
- **patternRecognition** — Recognizes patterns in the Python code `parser-python-types.ts:282-291`
- **patterns** — Stores patterns for code analysis `parser.ts:262-275`
- **patterns** — Detects and stores patterns in the parsed content `parser.ts:457-457`
- **payload** — Data content of the message `agent.ts:39-39`, `agent.ts:48-48`
- **payload** — Represents the payload of a parser task `parser.ts:496-500`
- **performanceMetricsCount** — The count of performance metrics `storage.ts:239-239`
- **phase** — Phase of the refactoring process `chaos-analysis.ts:215-215`
- **prefix** — Represents the prefix of the node in the parsed entity stack `storage.ts:472-472`
- **prerequisites** — Specifies the prerequisites for executing the refactoring strategy `chaos-analysis.ts:264-264`
- **previousHash** — Stores the hash of the previous content `parser.ts:479-479`
- **previousSibling** — Represents the previous sibling node of the AST node `parser-ast-types.ts:29-29`
- **priority** — Priority level of an agent `agent.ts:20-20`
- **priority** — Priority level of the task `agent.ts:46-46`
- **priority** — Determines the priority of issues found in the codebase `chaos-analysis.ts:290-290`
- **processed** — Indicates whether a batch operation was processed `storage.ts:245-245`
- **processingTime** — The time taken to process the semantic search `semantic.ts:61-61`
- **projectRoot** — The root directory of the project `semantic.ts:238-238`
- **properties** — Properties of the class `parser-python-types.ts:165-170`
- **propertiesAnalyzed** — Stores analyzed properties in the Python code `parser-python-types.ts:258-258`
- **propertyInfo** — Represents information about a property's getter, setter, and deleter `parser-python-types.ts:118-125`
- **protocol** — The protocol used for the embedding provider `semantic.ts:251-251`
- **protocol** — Communication protocol used `semantic.ts:363-363`
- **provider** — Specifies the provider used for embedding generation `semantic.ts:208-208`
- **provider** — The provider of the embedding service `semantic.ts:278-278`, `semantic.ts:300-300`
- **providerOptions** — Options for the embedding provider `semantic.ts:240-258`
- **pullTimeoutMs** — Sets the timeout for pulling data in milliseconds `semantic.ts:311-311`
- **pythonHints** — Stores Python-specific hints or annotations `parser.ts:426-439`
- **pythonIdioms** — Stores Python-specific idioms `parser.ts:273-273`
- **pythonIdioms** — Contains idioms specific to Python `parser.ts:573-577`
- **pythonIdiomsDetected** — Detects Python idioms in the code `parser-python-types.ts:286-286`
- **pythonInfo** — Provides information about Python code `parser.ts:243-260`
- **quantized** — Whether the model is quantized `semantic.ts:295-295`
- **query** — Defines the graph query to be executed `query.ts:189-189`
- **query** — The query string used in the semantic search `semantic.ts:60-60`
- **QUERY_AGENT_CACHE_WARMUP** — The cache warmup setting for query agents `global.d.ts:140-140`
- **QUERY_AGENT_COMPLEX_TIMEOUT** — The complex timeout for query agents `global.d.ts:139-139`
- **QUERY_AGENT_MAX_CONCURRENCY** — The maximum number of concurrent query agents `global.d.ts:135-135`
- **QUERY_AGENT_MEMORY_LIMIT** — The memory limit for query agents `global.d.ts:136-136`
- **QUERY_AGENT_PRIORITY** — The priority level for query agents `global.d.ts:137-137`
- **QUERY_AGENT_SIMPLE_TIMEOUT** — The simple timeout for query agents `global.d.ts:138-138`
- **queryTimeMs** — Stores the time taken for a query in milliseconds `storage.ts:186-186`
- **queueBatchSize** — The size of the batch for embedding generation in the queue `semantic.ts:218-218`
- **queueBatchSize** — The size of the batch queue `semantic.ts:298-298`
- **queueLength** — The current length of the agent's task queue `errors.ts:7-7`
- **quickFixes** — Lists quick fixes for issues found in the codebase `chaos-analysis.ts:299-299`
- **raceAnalysis** — Analyzes race conditions in the codebase `chaos-analysis.ts:311-311`
- **raceConflicts** — Detects race conflicts in the codebase `chaos-analysis.ts:292-298`
- **raceReason** — Explains the reason for a race condition in state management `chaos-analysis.ts:395-395`
- **raceRisk** — Measures the risk of race conditions in the codebase `chaos-analysis.ts:281-281`
- **raceRisk** — Indicates the risk of race conditions in state management `chaos-analysis.ts:394-394`
- **readers** — Lists the readers of a state variable `chaos-analysis.ts:390-390`
- **reason** — Reason for the refactoring operation `chaos-analysis.ts:224-224`
- **reason** — The reason the agent is busy, which can be one of several predefined values `errors.ts:6-6`
- **reason** — Stores the reason for the impact level of an affected entity `query.ts:139-139`
- **reasoning** — Provides the rationale for choosing the current refactoring strategy `chaos-analysis.ts:259-259`
- **recognitionTimeMs** — Records the time taken for pattern recognition in milliseconds `parser-python-types.ts:287-287`
- **redirect** — Determines how the browser handles redirects `global.d.ts:237-237`
- **redirected** — Indicates whether the response was redirected `global.d.ts:221-221`
- **reducedComplexity** — Represents the percentage reduction in complexity `chaos-analysis.ts:246-246`
- **reducedCoupling** — Represents the percentage reduction in coupling `chaos-analysis.ts:244-244`
- **reducedMutations** — Represents the number of mutation points removed `chaos-analysis.ts:245-245`
- **refactoringPlan** — Provides a refactoring plan for the codebase `chaos-analysis.ts:312-312`
- **refactoringStrategy** — Provides a refactoring strategy for the codebase `chaos-analysis.ts:300-300`
- **references** — Stores references to other entities `parser.ts:176-176`
- **referrer** — Sets the referrer for the request `global.d.ts:238-238`
- **referrerPolicy** — Specifies the referrer policy for the request `global.d.ts:239-239`
- **regexLiterals** — Represents the regex literals in the parsed entity `parser.ts:407-407`
- **relatedIdentifiers** — Similar names (e.g., ["_token", "tokenValue", "savedToken"]) `chaos-analysis.ts:77-77`
- **relationshipDelta** — Relationship changes `layered.ts:60-60`, `layered.ts:95-95`
- **relationshipMapping** — Enable Layer 3: Relationship mapping `parser-python-types.ts:68-68`
- **relationshipMapping** — Maps relationships between classes and methods `parser-python-types.ts:266-279`
- **relationships** — Defines relationships between entities `parser.ts:177-184`
- **relationships** — Defines the relationships between different entities `parser.ts:456-456`
- **relationships** — Map of string to Relationship for graph relationships `query.ts:64-64`
- **relationships** — Represents a collection of relationships between entities `storage.ts:185-185`, `storage.ts:211-217`
- **relationshipType** — Enumerates the types of relationships between entities `storage.ts:159-159`, `storage.ts:173-173`
- **removeListenerCount** — Counts the number of `removeListener` calls `parser.ts:418-418`
- **replacement** — Replacement for the refactoring operation `chaos-analysis.ts:223-223`
- **resetPoints** — Lists points where state management can be reset `chaos-analysis.ts:409-409`
- **responsibility** — Responsibility of the proposed component `chaos-analysis.ts:234-234`
- **result** — Result of the task execution `agent.ts:51-51`
- **result** — Stores the result of the parsing operation `parser.ts:468-468`
- **results** — An array of similarity results from the semantic search `semantic.ts:62-62`
- **retryAfterMs** — The number of milliseconds to wait before retrying the task `errors.ts:9-9`
- **returnCount** — Not applicable `parser.ts:364-364`
- **returns** — Represents returns in the parser system `parser.ts:306-309`, `parser.ts:328-333`
- **returnType** — Specifies the return type of the entity `parser.ts:195-195`
- **returnType** — Specifies the return type of a function `storage.ts:81-81`
- **riskLevel** — The risk level of the impact analysis `query.ts:112-112`
- **risks** — Lists the potential issues associated with the refactoring strategy `chaos-analysis.ts:263-263`
- **root** — Entity for dependency tree root `query.ts:73-73`
- **rootId** — String for graph root ID `query.ts:61-61`
- **rootNode** — The root node of the tree-sitter tree `parser-ast-types.ts:56-56`
- **row** — Represents the row number of the starting position `parser-ast-types.ts:18-18`, `parser-ast-types.ts:19-19`, `parser-ast-types.ts:39-39`
- **row** — The row number of a position `parser-ast-types.ts:68-68`, `parser-ast-types.ts:69-69`, `parser-ast-types.ts:70-70`, `parser-ast-types.ts:79-79`, `parser-ast-types.ts:80-80`
- **row** — Represents the row number of a source position `parser.ts:485-485`, `parser.ts:486-486`, `parser.ts:487-487`
- **scope** — Scope of the state variable `chaos-analysis.ts:75-75`
- **scope** — Not present in the provided code `chaos-analysis.ts:325-325`
- **score** — Evaluates the score of state variable patterns `chaos-analysis.ts:149-149`
- **score** — Overall score for the codebase `chaos-analysis.ts:189-189`
- **score** — The score of the entity or relationship `query.ts:99-99`
- **score** — The score of the hybrid result `semantic.ts:52-52`
- **score** — Returns an array of indices and scores for the top k vectors closest to the query vector `wasm-modules.d.ts:18-18`
- **searchesPerformed** — Stores the number of searches performed `semantic.ts:438-438`
- **searchL** — Length of the search operation `semantic.ts:175-175`
- **see** — Not applicable `parser.ts:342-342`
- **SEMANTIC_AGENT_BATCH_SIZE** — The batch size for semantic agents `global.d.ts:132-132`
- **SEMANTIC_AGENT_MAX_CONCURRENCY** — The maximum number of concurrent semantic agents `global.d.ts:129-129`
- **SEMANTIC_AGENT_MEMORY_LIMIT** — The memory limit for semantic agents `global.d.ts:130-130`
- **SEMANTIC_AGENT_MODEL_PATH** — The path to the semantic agent model `global.d.ts:133-133`
- **SEMANTIC_AGENT_PRIORITY** — The priority level for semantic agents `global.d.ts:131-131`
- **semanticType** — High-level semantic breakdown of a code fragment `semantic.ts:73-73`
- **semanticWeight** — Weight for semantic analysis in hybrid results `semantic.ts:146-146`
- **setNewCount** — Counts the number of `new Set()` instances `parser.ts:421-421`
- **setterName** — Name of the setter method `parser-python-types.ts:123-123`
- **severity** — Determines the severity of issues found in the codebase `chaos-analysis.ts:295-295`
- **severity** — Represents the severity level of a state management issue `chaos-analysis.ts:376-376`
- **severity** — Represents the severity level of a parsed entity `parser.ts:582-582`
- **sharedCondition** — Indicates a shared condition affecting multiple state variables `chaos-analysis.ts:380-380`
- **sharedConditions** — Lists shared conditions affecting state management `chaos-analysis.ts:406-406`
- **sharedStateCount** — Counts shared state variables across components `chaos-analysis.ts:151-151`
- **sideEffects** — Indicates whether the expression has side effects `parser.ts:376-386`
- **signal** — Provides a signal to abort the request `global.d.ts:242-242`
- **signature** — Represents the signature of a parsed entity `parser.ts:166-166`
- **signature** — Represents the signature of a function `storage.ts:98-98`
- **similarity** — The similarity score between the query and the result `semantic.ts:44-44`
- **similarity** — Similarity score for a code fragment `semantic.ts:85-85`, `semantic.ts:112-112`
- **since** — Not applicable `parser.ts:343-343`
- **size** — Stores the size of the cached content `parser.ts:470-470`
- **size** — Represents the size of the entity `storage.ts:113-113`
- **size** — Represents the size of a cache entry `storage.ts:257-257`
- **size** — Size of the cache `storage.ts:347-347`
- **slowQueries** — Counts the number of slow queries `query.ts:251-251`
- **source** — Represents the source code being parsed `parser.ts:230-230`
- **source** — The source of the hybrid result, either structural, semantic, or hybrid `semantic.ts:53-53`
- **source** — Represents the source of an entity `storage.ts:92-92`
- **sourceBranch** — Indicates the source branch of the Git diff `layered.ts:294-294`
- **sourceEntity** — The source entity in the impact analysis `query.ts:111-111`
- **sourceFile** — Represents the source file of a Python module `parser-python-types.ts:202-202`
- **sourceFile** — Source file of the relationship `parser.ts:536-536`
- **specialClassType** — Represents a special class type `parser.ts:258-258`
- **specifiers** — Stores import specifiers `parser.ts:231-235`
- **specifiers** — Specifies the specifiers for an import `storage.ts:93-93`
- **speedPerSec** — The speed of embedding generation in embeddings per second `semantic.ts:272-272`
- **spreadInCallCount** — Counts the number of spread operators in calls `parser.ts:393-393`
- **sql** — Contains the SQL query string `query.ts:199-199`
- **SQLITE_LIB_PATH** — Sets the path to the SQLite library `global.d.ts:80-80`
- **start** — Start position of the method `parser-python-types.ts:136-136`
- **start** — Represents the start position of a Python element `parser-python-types.ts:186-186`
- **start** — Represents the start position of a source span `parser.ts:69-69`
- **start** — Represents the start location of an entity `storage.ts:76-76`
- **startedAt** — Time when the task started `agent.ts:49-49`
- **startIndex** — Represents the start index of the AST node `parser-ast-types.ts:20-20`
- **startIndex** — The starting index of an edit operation `parser-ast-types.ts:65-65`, `parser-ast-types.ts:81-81`
- **startIndex** — Indicates the start index of the edits `parser.ts:482-482`
- **startLine** — Start line number of the code fragment `semantic.ts:92-92`, `semantic.ts:119-119`
- **startPosition** — Represents the starting position of the AST node `parser-ast-types.ts:18-18`
- **startPosition** — The starting position of an edit operation `parser-ast-types.ts:68-68`, `parser-ast-types.ts:79-79`
- **startPosition** — Represents the start position of a source span `parser.ts:485-485`
- **stateIdentifier** — Identifies a specific state variable in the code `chaos-analysis.ts:132-132`, `chaos-analysis.ts:175-175`
- **stateIdentifier** — Identifies the state for the refactoring plan `chaos-analysis.ts:256-256`
- **stateIdentifier** — Identifies the current state of the chaos analysis `chaos-analysis.ts:276-276`
- **stateIdentifier** — Identifies a specific state variable or pattern `chaos-analysis.ts:377-377`, `chaos-analysis.ts:389-389`
- **stateIdentifiers** — Not present in the provided code `chaos-analysis.ts:326-326`
- **stateManagement** — State management libraries used `chaos-analysis.ts:44-44`
- **statePattern** — Represents a state management pattern in the codebase `chaos-analysis.ts:308-308`
- **stats** — Stores statistics related to the storage layer `storage.ts:186-186`
- **status** — Current status of the agent `agent.ts:58-58`
- **status** — The current status of the agent, which is an enum value `errors.ts:5-5`
- **status** — Represents the HTTP status code of the response `global.d.ts:214-214`
- **status** — Indicates the status of the file change `layered.ts:277-277`
- **statusText** — Represents the HTTP status text of the response `global.d.ts:215-215`
- **steps** — Lists the steps involved in the refactoring process `chaos-analysis.ts:260-260`
- **strategy** — Specifies the refactoring strategy to be applied `chaos-analysis.ts:258-258`
- **stringConcatInLoopCount** — Counts the number of string concatenations in loops `parser.ts:435-435`
- **structuralWeight** — Weight for structural analysis in hybrid results `semantic.ts:145-145`
- **success** — Indicates a successful operation `storage.ts:277-277`
- **suggestion** — Provides a suggestion for fixing an issue `chaos-analysis.ts:297-297`
- **suggestion** — Offers a suggestion for refactoring a state management issue `chaos-analysis.ts:382-382`
- **summary** — Summarizes the chaos analysis results `chaos-analysis.ts:313-313`
- **summary** — A summary of the semantic analysis `semantic.ts:71-71`
- **symbols** — Represents the symbols in a Python module `parser-python-types.ts:211-215`
- **target** — Target of the refactoring operation `chaos-analysis.ts:222-222`
- **target** — Points to the target entity `parser.ts:180-180`
- **target** — Represents the target of a function call `parser.ts:282-282`
- **targetBranch** — Indicates the target branch of the Git diff `layered.ts:297-297`
- **targetFile** — Indicates the file where the target entity is located `parser.ts:181-181`
- **targetFile** — Target file of the relationship `parser.ts:537-537`
- **targetModule** — Represents the target module of an import `parser-python-types.ts:205-205`
- **taskId** — The ID of the task that is causing the agent to be busy `errors.ts:10-10`
- **tasksFailed** — Count of tasks that failed to be processed `agent.ts:88-88`
- **tasksProcessed** — Count of tasks processed by the agent `agent.ts:86-86`
- **tasksSucceeded** — Count of tasks that were successfully processed `agent.ts:87-87`
- **technology** — Not present in the provided code `chaos-analysis.ts:333-333`
- **tei** — Defines optional configuration for the TEI (Text Encoding Initiative) service, including base URL, timeout, concurrency, and server check `semantic.ts:345-352`
- **TEI_BASE_URL** — Sets the base URL for the TEI API `global.d.ts:69-69`
- **TEI_CHECK_SERVER** — Checks the server status before making TEI API requests `global.d.ts:72-72`
- **TEI_CONCURRENCY** — Specifies the number of concurrent TEI API requests `global.d.ts:71-71`
- **TEI_TIMEOUT_MS** — Sets the timeout for TEI API requests in milliseconds `global.d.ts:70-70`
- **text** — Represents the text content of the AST node `parser-ast-types.ts:22-22`
- **throughput** — Rate of files parsed per unit time `parser.ts:525-525`
- **throwNonErrorCount** — Counts the number of throws that do not throw errors `parser.ts:403-403`
- **throws** — Not applicable `parser.ts:334-339`
- **timeMs** — Records the total time taken for the analysis in milliseconds `parser-python-types.ts:273-273`, `parser-python-types.ts:289-289`
- **timeMs** — Stores the time in milliseconds `storage.ts:248-248`
- **timeoutMs** — Timeout duration in milliseconds for parsing operations `parser.ts:514-514`
- **timeoutMs** — The timeout in milliseconds for the embedding provider `semantic.ts:246-246`
- **timeoutMs** — The timeout in milliseconds for the embedding service `semantic.ts:305-305`
- **timeoutMs** — Timeout for API requests in milliseconds `semantic.ts:319-319`
- **timeoutMs** — Represents an optional number for timeout in milliseconds `semantic.ts:329-329`, `semantic.ts:339-339`
- **timeoutMs** — Timeout duration for server requests `semantic.ts:348-348`, `semantic.ts:357-357`, `semantic.ts:372-372`
- **timeouts** — Number of timeout events in the pool `storage.ts:270-270`
- **timestamp** — Time when the message was sent `agent.ts:38-38`
- **timestamp** — Not present in the provided code `chaos-analysis.ts:314-314`
- **timestamp** — Stores the timestamp of the last modification `layered.ts:262-262`
- **timestamp** — Records the timestamp of the parsing operation `parser.ts:453-453`
- **timestamp** — The timestamp of the change `query.ts:126-126`
- **timestamp** — Stores the time when the query was executed `query.ts:180-180`
- **timestamp** — Represents the timestamp of an entity `storage.ts:194-194`
- **timestamp** — The timestamp when a cache entry was last accessed or created `storage.ts:254-254`
- **to** — Recipient of the message `agent.ts:37-37`
- **to** — The destination node of the state flow edge `chaos-analysis.ts:123-123`
- **to** — Target entity in a relationship `parser.ts:534-534`
- **to_id** — Represents the identifier of the target entity in a relationship `storage.ts:214-214`
- **toId** — Represents the identifier of the entity to which the relationship points `storage.ts:119-119`
- **toId** — Specifies the ID of the entity to which the relationship points `storage.ts:161-161`
- **tokens** — Tokens used in processing `storage.ts:327-327`
- **toolName** — Name of the tool or system generating the performance metric `storage.ts:275-275`
- **total** — The total number of embeddings in the pool `semantic.ts:268-268`
- **total** — Total number of connections in the pool `storage.ts:266-266`
- **totalChanges** — Returns the total number of vector changes in the delta `layered.ts:66-66`
- **totalEmbeddings** — The total number of embeddings in the storage `storage.ts:237-237`
- **totalEntities** — Counts the total number of entities processed `parser-python-types.ts:295-295`
- **totalEntities** — Represents the total number of entities `storage.ts:186-186`
- **totalEntities** — The total number of entities in the storage `storage.ts:229-229`
- **totalEntities** — Total number of entities `storage.ts:339-339`
- **totalFiles** — Counts the total number of files analyzed `chaos-analysis.ts:277-277`
- **totalFiles** — Counts the total number of files in the Git diff `layered.ts:303-303`
- **totalFiles** — The total number of files in the storage `storage.ts:231-231`
- **totalFiles** — Total number of files `storage.ts:339-339`
- **totalHits** — Counts the total number of cache hits `query.ts:212-212`
- **totalMisses** — Counts the total number of cache misses `query.ts:213-213`
- **totalMutations** — Total number of mutations detected in the codebase `chaos-analysis.ts:179-179`
- **totalOperations** — Counts the total number of operations on state variables `chaos-analysis.ts:136-136`
- **totalOperations** — Counts the total number of operations analyzed `chaos-analysis.ts:278-278`
- **totalParseTimeMs** — Total time taken to parse all files in milliseconds `parser.ts:524-524`
- **totalPatterns** — Represents the total number of patterns identified during Python analysis `parser-python-types.ts:297-297`
- **totalPatternsFound** — Counts the total number of patterns found `parser-python-types.ts:290-290`
- **totalQueries** — Counts the total number of queries executed `query.ts:250-250`
- **totalRelationships** — Represents the total number of relationships found during Python analysis `parser-python-types.ts:296-296`
- **totalRelationships** — Represents the total number of relationships `storage.ts:186-186`
- **totalRelationships** — The total number of relationships in the storage `storage.ts:230-230`
- **totalRelationships** — Total number of relationships `storage.ts:339-339`
- **totalTimeMs** — Represents the total time taken in milliseconds for Python analysis `parser-python-types.ts:298-298`
- **tryCatch** — Identifies try-catch blocks in the code `chaos-analysis.ts:162-162`
- **ttl** — The time-to-live duration for a cache entry `storage.ts:255-255`
- **type** — Type of the agent, such as parser, indexer, etc `agent.ts:35-35`, `agent.ts:45-45`, `agent.ts:57-57`
- **type** — TypeScript type `chaos-analysis.ts:74-74`
- **type** — The type of the state variable `chaos-analysis.ts:92-92`, `chaos-analysis.ts:124-124`
- **type** — Type of the refactoring operation `chaos-analysis.ts:221-221`, `chaos-analysis.ts:233-233`
- **type** — Represents the type of the response `global.d.ts:220-220`
- **type** — Type of entity `layered.ts:256-256`
- **type** — Represents the type of the AST node `parser-ast-types.ts:17-17`
- **type** — Represents the type of a Python identifier `parser-python-types.ts:236-236`
- **type** — Represents the type of a parsed entity `parser.ts:161-161`
- **type** — Specifies the type of the entity `parser.ts:179-179`, `parser.ts:199-199`
- **type** — Represents a type in the parser system `parser.ts:293-293`, `parser.ts:298-298`, `parser.ts:302-302`, `parser.ts:323-323`, `parser.ts:330-330`
- **type** — Not applicable `parser.ts:336-336`
- **type** — Specifies the type of the parsed entity `parser.ts:381-381`
- **type** — Represents the type of a parser task `parser.ts:495-495`
- **type** — Type of relationship `parser.ts:535-535`
- **type** — Defines a type for entities in the parser system `parser.ts:554-554`, `parser.ts:559-559`, `parser.ts:581-581`
- **type** — EntityType or array of EntityType `query.ts:39-39`
- **type** — The type of the entity or relationship `query.ts:88-88`
- **type** — Query type definitions for graph operations and traversal `query.ts:127-127`, `query.ts:181-181`
- **type** — Type of the code fragment `semantic.ts:88-88`
- **type** — Defines the type of a semantic analysis `semantic.ts:130-130`
- **type** — Represents the type of an entity `storage.ts:72-72`
- **type** — Specifies the type of an entity `storage.ts:85-85`, `storage.ts:190-190`, `storage.ts:203-203`
- **type** — Represents the type of the relationship `storage.ts:120-120`
- **type** — Specifies the type of the graph query `storage.ts:169-169`
- **type** — Specifies the type of the entity, such as function, class, method, etc `storage.ts:215-215`
- **typeArguments** — Stores type arguments in a function call `parser.ts:286-286`
- **typeAssertionCount** — Counts the number of type assertions `parser.ts:400-400`
- **typeGuards** — Identifies type guards in the code `chaos-analysis.ts:160-160`
- **typeHintsProcessed** — Stores processed type hints in the Python code `parser-python-types.ts:250-250`
- **typeIgnoreCount** — Counts the number of `@type:ignore` annotations `parser.ts:432-432`
- **typeParameters** — Not applicable `parser.ts:368-374`
- **typeReferences** — Not applicable `parser.ts:348-354`
- **types** — Represents the types of the parsed entities `parser.ts:379-379`
- **types** — Types of entities `storage.ts:303-303`
- **ULTRACODE_NO_SUBPROCESS** — Disables subprocesses for UltraCode `global.d.ts:183-183`
- **unprotectedWriters** — Lists the unprotected writers of a state variable `chaos-analysis.ts:393-393`
- **updated_at** — Represents the last update timestamp of an entity `storage.ts:209-209`
- **updatedAt** — Represents the timestamp when an entity was last updated `storage.ts:110-110`
- **url** — Represents the URL of the response `global.d.ts:219-219`
- **usage** — Describes the usage of a parsed entity `parser.ts:576-576`
- **usageLocations** — Stores the locations where a Python identifier is used `parser-python-types.ts:224-224`
- **useCache** — Represents whether to use caching in parsing `parser.ts:504-504`
- **useEmbeddings** — Not present in the provided code `chaos-analysis.ts:330-330`
- **useEmbeddingsApi** — Indicates whether to use the embeddings API `semantic.ts:249-249`
- **useEmbeddingsApi** — Boolean flag to use embeddings API `semantic.ts:361-361`
- **useIndex** — Indicates whether to use an index for query execution `query.ts:202-202`
- **useLayeredIndex** — Boolean indicating if a layered index is used `semantic.ts:167-167`
- **USERPROFILE** — Represents the user profile directory `global.d.ts:14-14`
- **value** — Represents the value read from the stream `global.d.ts:209-209`
- **value** — The value stored in a cache entry `storage.ts:253-253`
- **vector** — A Float32Array representing the vector embedding `semantic.ts:31-31`
- **VECTOR_STORE_DEBUG** — Enables debug mode for the vector store `global.d.ts:182-182`
- **vectorData** — Data related to vector embeddings `storage.ts:285-285`
- **vectorSearchEnabled** — Indicates whether vector search is enabled `storage.ts:238-238`
- **vectorsStored** — Stores the number of vectors stored `semantic.ts:436-436`
- **vendoredPrefixes** — The prefixes used for vendored embeddings `semantic.ts:234-234`
- **version** — Framework version `chaos-analysis.ts:43-43`
- **waiting** — Number of waiting connections in the pool `storage.ts:269-269`
- **walMode** — Write-ahead log mode for the database `semantic.ts:162-162`
- **warmupText** — Specifies the warmup text for the model `semantic.ts:310-310`
- **warmupText** — Represents an optional string for warming up the model `semantic.ts:341-341`
- **weakMapNewCount** — Counts the number of `new WeakMap()` instances `parser.ts:420-420`
- **weakSetNewCount** — Counts the number of `new WeakSet()` instances `parser.ts:422-422`
- **WEBGPU_FORCE_DISABLE** — Forces WebGPU to be disabled `global.d.ts:181-181`
- **WEBGPU_FORCE_ENABLE** — Forces WebGPU to be enabled `global.d.ts:180-180`
- **weight** — Represents the weight of the entity `storage.ts:129-129`
- **wideTryBlockCount** — Counts the number of wide `try` blocks `parser.ts:431-431`
- **workerIndex** — The index of the worker in the embedding generation process `semantic.ts:224-224`
- **workers** — The number of workers used for embedding generation `semantic.ts:274-274`
- **workingDirectory** — Working directory `layered.ts:146-146`
- **workingDirectory** — Working directory for the application `semantic.ts:164-164`
- **writerCount** — Counts the number of writers for a state variable `chaos-analysis.ts:404-404`
- **writers** — Identifies the writers of the codebase `chaos-analysis.ts:282-282`
- **writers** — Lists the writers of a state variable `chaos-analysis.ts:391-391`
- **XDG_DATA_HOME** — Represents the XDG data home directory `global.d.ts:15-15`
- **yieldCount** — Counts the number of yield expressions in a generator `parser.ts:222-222`
- **yieldsFrom** — Tracks the yield points in a generator `parser.ts:220-220`

### Namespace
- **"faiss-napi"** — Provides NAPI bindings for Faiss that work under both Node.js and Bun `faiss-node.d.ts:8-62`
- **Index** — Namespace for functions to create and read Faiss indices `faiss-node.d.ts:57-61`
- **NodeJS** — Represents the Node.js environment `global.d.ts:6-187`

## Data Flow

### Inputs

| Source | Data | Type |
|--------|------|------|
| ~~`config/constants.ts`~~ (deleted) | Numeric constants (cache sizes, pool sizes, vector dimensions) | `const` values |

### Processing

This is a passive type-definition module. It does not process data at runtime. Types are consumed at compile time by TypeScript's structural type system.

### Outputs

| Target | Data | Type |
|--------|------|------|
| `agents/*` | Agent, AgentTask, AgentPool, AgentMetrics | interfaces |
| `parsers/*` | ParsedEntity, ParseResult, SupportedLanguage, EntityRelationship | interfaces/types |
| `storage/*` | Entity, Relationship, GraphStorage, GraphSchema | interfaces/enums |
| `semantic/*` | VectorEmbedding, EmbeddingConfig, SimilarityResult | interfaces/types |
| `query/*` | GraphQuery, QueryResult, QueryOperations | interfaces |
| `tools/*` | ChaosMetrics, StatePattern, RefactoringPlan | interfaces/types |
| `indexing/*` | BranchDelta, VectorDelta, LayeredIndexConfig | interfaces |

## Public API

### agent.ts — Agent Orchestration

| Export | Type | Description | Location |
|--------|------|-------------|----------|
| `AgentType` | enum | 8 variants: COORDINATOR, DEV, DORA, INDEXER, MERGE, PARSER, QUERY, SEMANTIC | [`agent.ts:6-15`](./agent.ts) |
| `AgentStatus` | enum | 4 variants: IDLE, BUSY, ERROR, SHUTDOWN | [`agent.ts:17-22`](./agent.ts) |
| `Agent` | interface | Full agent contract: lifecycle, task processing, communication, resource mgmt | [`agent.ts:53-76`](./agent.ts) |
| `AgentPool` | interface | Agent registry with routing and broadcasting | [`agent.ts:78-90`](./agent.ts) |
| `AgentMetrics` | interface | Per-agent performance counters | [`agent.ts:99-108`](./agent.ts) |

See [`agent.ts`](./agent.ts) for complete list (AgentCapabilities, AgentMessage, AgentTask, ResourceConstraints).

### parser.ts — Code Parsing & AST

| Export | Type | Description | Location |
|--------|------|-------------|----------|
| `SUPPORTED_LANGUAGES` | const | 17 languages: TS, JS, Python, Go, Rust, Java, C#, C++, Swift, Kotlin, Zig, etc. | [`parser.ts:44-456`](./parser.ts) |
| `SupportedLanguage` | type | Union of all supported language strings | [`parser.ts:67-67`](./parser.ts) |
| `ParsedEntity` | interface | Core parsed entity with 45+ properties (name, type, location, AST data, embeddings) | [`parser.ts:76-456`](./parser.ts) |
| `ParseResult` | interface | File parse result: entities, relationships, patterns, timing | [`parser.ts:461-494`](./parser.ts) |
| `EntityRelationship` | interface | Inter-entity relationships with 20+ relation types | [`parser.ts:626-676`](./parser.ts) |

See [`parser.ts`](./parser.ts) for complete list (FileChange, ParserTask, ParserOptions, CacheEntry, ParserStats, PatternAnalysis).

### storage.ts — Entity/Relationship Storage

| Export | Type | Description | Location |
|--------|------|-------------|----------|
| `EntityType` | enum | 11 variants: FUNCTION, CLASS, METHOD, INTERFACE, TYPE, IMPORT, EXPORT, VARIABLE, CONSTANT, PACKAGE, COMMENT | [`storage.ts:35-47`](./storage.ts) |
| `RelationType` | enum | 20 variants including reverse relations and NgRx state management | [`storage.ts:52-77`](./storage.ts) |
| `Entity` | interface | Core graph entity with location, metadata, complexity, embeddings | [`storage.ts:82-128`](./storage.ts) |
| `Relationship` | interface | Edge between entities with type, metadata, weight | [`storage.ts:133-148`](./storage.ts) |
| `GraphStorage` | interface | Full storage contract: CRUD, queries, maintenance, 20+ methods | [`storage.ts:322-389`](./storage.ts) |

See [`storage.ts`](./storage.ts) for complete list (FileInfo, EntityQuery, RelationshipQuery, GraphQuery, GraphQueryResult, EntityChange, GraphSchema, StorageMetrics, BatchResult, CacheEntry, PoolStats, CacheManager, ConnectionPool, PerformanceMetric, VectorEmbedding).

### semantic.ts — Vector Search & Embeddings

| Export | Type | Description | Location |
|--------|------|-------------|----------|
| `VectorEmbedding` | interface | Embedding with id, content, vector (Float32Array), metadata | [`semantic.ts:29-35`](./semantic.ts) |
| `SimilarityResult` | interface | Search result with similarity score | [`semantic.ts:46-51`](./semantic.ts) |
| `EmbeddingProviderKind` | type | Provider union: ollama, openai, cloudru, huggingface, tei, ovms, vllm, llamacpp, mlx, auto | [`semantic.ts:182-242`](./semantic.ts) |
| `EmbeddingConfig` | interface | Full embedding config with per-provider options (ollama, openai, tei, ovms, vllm, llamacpp, mlx) | [`semantic.ts:263-350`](./semantic.ts) |
| `SemanticOperations` | interface | Semantic search contract: search, similarity, clones, cross-language | [`semantic.ts:355-372`](./semantic.ts) |

See [`semantic.ts`](./semantic.ts) for complete list (HybridResult, SemanticAnalysis, SimilarCode, CloneGroup, CrossLangResult, RefactoringSuggestion, FusionOptions, SemanticResult, VectorStoreConfig, WorkerEmbeddingConfig, EmbeddingPoolStats, SemanticTaskType, SemanticMetrics).

### query.ts — Graph Queries & Impact Analysis

| Export | Type | Description | Location |
|--------|------|-------------|----------|
| `QueryOperations` | interface | 11 methods: entity lookup, traversal, dependencies, cycles, hotspots, impact | [`query.ts:149-170`](./query.ts) |
| `GraphQuery` | interface | Query descriptor with type, operation, params, hash | [`query.ts:178-185`](./query.ts) |
| `QueryResult` | interface | Result wrapper with execution metadata and cache info | [`query.ts:190-198`](./query.ts) |
| `ImpactAnalysis` | interface | Impact result: direct/indirect impacts, risk level, affected files | [`query.ts:124-128`](./query.ts) |
| `Hotspot` | interface | Code hotspot with score and metrics (relationships, complexity, change frequency) | [`query.ts:104-113`](./query.ts) |

See [`query.ts`](./query.ts) for complete list (EntityFilter, Path, Graph, DependencyTree, DependencyNode, Cycle, Change, RippleEffect, OptimizedQuery, CacheStats, ConnectionPoolConfig, StreamOptions, QueryMetrics).

### chaos-analysis.ts — State Chaos Detection

| Export | Type | Description | Location |
|--------|------|-------------|----------|
| `ChaosMetrics` | interface | Chaos score, coupling, defensive patterns, mutation spread, divergence risk | [`chaos-analysis.ts:174-190`](./chaos-analysis.ts) |
| `StatePattern` | interface | Detected state variable with operations and related identifiers | [`chaos-analysis.ts:72-78`](./chaos-analysis.ts) |
| `RefactoringPlan` | interface | Complete plan: strategy, steps, new components, benefits, risks | [`chaos-analysis.ts:255-265`](./chaos-analysis.ts) |
| `ChaosAnalysisResult` | interface | Full analysis output: pattern, flow map, metrics, race analysis, plan, summary | [`chaos-analysis.ts:307-315`](./chaos-analysis.ts) |
| `RaceAnalysis` | interface | Race condition detection: readers, writers, async writers, conflicts | [`chaos-analysis.ts:388-398`](./chaos-analysis.ts) |

See [`chaos-analysis.ts`](./chaos-analysis.ts) for complete list (StateOperationType, AngularStatePattern, TechnologyContext, StateOperation, StateOrigin, StateFlowNode, StateFlowEdge, StateFlowMap, CouplingMetrics, DefensivePatterns, DivergenceRisk, RefactoringStrategy, RefactoringStep, ProposedComponent, RefactoringBenefits, ChaosAnalysisSummary, ChaosAnalysisOptions, RacePatternType, RaceRisk, MutationPoint, RaceConflict, RaceRiskFactors).

### layered.ts — Delta-Based Indexing

| Export | Type | Description | Location |
|--------|------|-------------|----------|
| `BranchDelta` | interface | Per-branch entity/relationship changes with commit tracking | [`layered.ts:49-67`](./layered.ts) |
| `VectorDelta` | interface | Per-branch embedding changes (added/modified/deleted) | [`layered.ts:108-129`](./layered.ts) |
| `LayeredIndexConfig` | interface | Config for 3-layer architecture: persistence, compaction, scheduling | [`layered.ts:157-157`](./layered.ts) |
| `LayeredIndexConfigPresets` | const | 4 preset factories: default, development, production, server | [`layered.ts:172-246`](./layered.ts) |
| `createEmptyBranchDelta` | function | Factory for empty BranchDelta | [`layered.ts:335-353`](./layered.ts) |

See [`layered.ts`](./layered.ts) for complete list (EntityDelta, RelationshipDelta, WorkingDelta, FileChangeType, FileUpdate, GitFileChange, GitDiffResult, createEmptyEntityDelta, createEmptyRelationshipDelta, createEmptyVectorDelta, createEmptyWorkingDelta).

### Supporting Files

| Export | Type | Description | Location |
|--------|------|-------------|----------|
| `AgentBusyError` | class | Error subclass for busy agents with retry details | [`errors.ts:15-23`](./errors.ts) |
| `AgentBusyDetails` | interface | Busy reason, queue length, memory usage | [`errors.ts:3-13`](./errors.ts) |
| `ASTNode` | interface | Generic AST node interface (tree-sitter compatible) | [`parser-ast-types.ts:16-41`](./parser-ast-types.ts) |
| `MagicMethodGroups` | const | Python magic method categories (10 groups) | [`parser-python-types.ts:15-45`](./parser-python-types.ts) |
| `PythonClassInfo` | interface | Python class metadata: type, bases, MRO, abstract methods | [`parser-python-types.ts:148-191`](./parser-python-types.ts) |
| `DiffSimdModule` | interface | WASM SIMD diff operations | [`wasm-modules.d.ts:9-11`](./wasm-modules.d.ts) |
| `VectorOpsSimdModule` | interface | WASM SIMD vector operations (cosine, dot product, normalize, top-k) | [`wasm-modules.d.ts:14-19`](./wasm-modules.d.ts) |

See [`parser-python-types.ts`](./parser-python-types.ts), [`faiss-node.d.ts`](./faiss-node.d.ts), [`global.d.ts`](./global.d.ts) for complete lists.

## Dependencies

### Internal Modules

| Module | Purpose | Interaction |
|--------|---------|-------------|
| `config/constants` | Numeric constants (CACHE_TTL_MS, VECTOR_DIMENSIONS, DATABASE pool sizes) | Imported by `query.ts`, `semantic.ts`, `storage.ts` |
| `logging` | Logger instance | Imported by `storage.ts` (log helper in `parsedEntityToEntity`) |

### External Packages

| Package | Purpose |
|---------|---------|
| `@types/bun` | Bun runtime globals referenced in `global.d.ts` |
| `faiss-napi` | NAPI bindings for Faiss vector index (ambient module declaration) |

## Configuration

No runtime configuration — pure type definitions. The only configurable values are constants re-exported from ~~`config/constants.ts`~~ (deleted) (e.g., `VECTOR_DIMENSIONS`, `MAX_BATCH_SIZE`, `DEFAULT_CACHE_TTL`).

## Behavioral Properties

| Property | Value |
|----------|-------|
| Async | No — compile-time only (except `layered.ts` factory functions and `storage.ts` helper) |
| Thread Safety | N/A — no runtime code |
| Idempotency | N/A |
| Side Effects | None |
| State | Stateless |

## Error Handling

No runtime error handling — type errors caught at compile time. The only exception is `AgentBusyError` (in `errors.ts`), a concrete `Error` subclass thrown at runtime by agent code.

## Observability

No runtime observability — type-only module.

## Known Limitations

- No barrel `index.ts` — consumers must import from individual files, creating tight coupling to internal file structure.
- `ParsedEntity` has 45+ optional properties, making it difficult to know which fields are populated for a given language.
- `global.d.ts` declares 100+ environment variables; not all are used in practice.
- Layer 2 (Working Deltas) in `layered.ts` is marked `[FUTURE]` with 3 TODO comments — not yet implemented.
- `parser-ast-types.ts` contains deprecated tree-sitter compatibility types kept for backward compat.
- WASM module interfaces assume dynamic loading; actual `.wasm` files may not exist at compile time.
- Types provide no runtime validation; consumer modules are responsible for data correctness.

## TypeScript Notes

### Module Boundary

There is no `index.ts` barrel file. All consumers import directly from individual type files:

```typescript
import type { Agent, AgentType } from './types/agent.js';
import type { ParsedEntity, ParseResult } from './types/parser.js';
import type { Entity, Relationship, GraphStorage } from './types/storage.js';
import type { VectorEmbedding, EmbeddingConfig } from './types/semantic.js';
```

Cross-file re-exports exist in three places:
- `storage.ts` re-exports `ParsedEntity` from `parser.ts`
- `query.ts` re-exports `Entity`, `Relationship` from `storage.ts`
- `parser.ts` re-exports AST types from `parser-ast-types.ts` and Python types from `parser-python-types.ts`

## Files

| File | Description |
|------|-------------|
| [`agent.ts`](./agent.ts) | Agent orchestration: types, statuses, capabilities, pools, metrics (109 lines) |
| [`chaos-analysis.ts`](./chaos-analysis.ts) | State chaos analysis: operations, patterns, flow maps, metrics, race detection, refactoring (411 lines) |
| [`errors.ts`](./errors.ts) | AgentBusyError class and details interface (23 lines) |
| [`faiss-node.d.ts`](./faiss-node.d.ts) | Ambient module declaration for faiss-napi NAPI bindings (62 lines) |
| [`global.d.ts`](./global.d.ts) | Global declarations: 100+ env vars, Bun globals, fetch/stream APIs |
| [`layered.ts`](./layered.ts) | Three-layer delta indexing: entity/relationship/vector deltas, config presets, factory helpers (394 lines) |
| [`parser.ts`](./parser.ts) | Code parsing: ParsedEntity (45+ props), ParseResult, relationships, patterns, stats (729 lines) |
| [`parser-ast-types.ts`](./parser-ast-types.ts) | Generic AST node interface and deprecated tree-sitter compat types (88 lines) |
| [`parser-python-types.ts`](./parser-python-types.ts) | Python-specific: magic methods, class/method info, import deps, analysis config |
| [`query.ts`](./query.ts) | Graph queries: filters, traversal, dependencies, cycles, hotspots, impact, caching (256 lines) |
| [`semantic.ts`](./semantic.ts) | Semantic search: embeddings, similarity, clones, cross-language, 8 provider configs (395 lines) |
| [`storage.ts`](./storage.ts) | Graph storage: entities, relationships, schemas, CRUD interface, cache, connection pool |
| [`wasm-modules.d.ts`](./wasm-modules.d.ts) | WASM SIMD interfaces: diff and vector operations (20 lines) |
