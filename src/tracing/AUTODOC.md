# Tracing Module

## 🤖 Overview

The `src/tracing` module provides a comprehensive set of tools for static code flow analysis, enabling developers to understand and trace code execution paths, data flow, and state changes without runtime execution. This module is utilized by developers and static analysis tools to identify decision points, trace execution, and analyze code behavior.

## 🤖 Architecture

```
cfg-builder
    |
    v
condition-analyzer
    |
    v
condition-trace
    |
    v
data-flow-analyzer
    |
    v
graph-cache
    |
    v
graphology-path-builder
    |
    v
ngrx-resolution
    |
    v
ngrx-trace-engine
    |
    v
output-formatter
    |
    v
path-builder
    |
    v
path-enrichment
    |
    v
reaching-definitions
    |
    v
state-tracker
    |
    v
trace-engine
```

## 🤖 Flow

```
trace-engine
    |
    v
path-builder
    |
    v
path-enrichment
    |
    v
state-tracker
    |
    v
reaching-definitions
    |
    v
condition-analyzer
    |
    v
condition-trace
    |
    v
data-flow-analyzer
    |
    v
graph-cache
    |
    v
graphology-path-builder
    |
    v
ngrx-resolution
    |
    v
output-formatter
```

## 🤖 Entity Listing

### Function
- **affectsTarget** — Determine if a transformation affects the target state `data-flow-analyzer.ts:282-282`
- **alreadyExits** — Checks if a node already exists in the CFG `cfg-builder.ts:226-226`
- **analyzeConditions** — Analyzes conditions to determine path feasibility, contradictions, dead branches, and narrowed types `condition-types.ts:314-338`
- **analyzeVariableDepsTextBased** — Function analyzing variable dependencies using text-based indentation analysis `condition-trace.ts:52-102`
- **areContradictory** — Determines if two conditions are contradictory `condition-types.ts:254-278`
- **assignments** — Filters usages to find assignments `state-tracker.ts:377-377`
- **awaits** — Counts the number of await steps in the path `path-enrichment.ts:79-79`
- **best** — Selects the best matching entity `trace-engine.ts:757-761`
- **blockingConditions** — Blocking conditions in the graph `trace-engine.ts:539-539`, `trace-engine.ts:540-545`
- **branches** — Stores the branches of the path `graphology-path-builder.ts:1153-1153`
- **buildCfgFromSource** — Builds a control flow graph from a source code string `cfg-builder.ts:132-237`
- **buildNodeContext** — Function to build node context from entity and caller/callee IDs `trace-engine.ts:64-85`
- **calculateConfidence** — Calculates the confidence score for a path `path-enrichment.ts:50-64`
- **callChains** — Call chains in the graph `trace-engine.ts:548-553`, `trace-engine.ts:622-657`
- **callChains** — Represents a sequence of method calls in a code flow `trace-engine.ts:649-652`
- **calleeIds** — Stores callee IDs for a given entity `path-builder.ts:674-674`, `path-builder.ts:674-674`
- **callerIds** — Stores caller IDs for a given entity `path-builder.ts:647-647`, `path-builder.ts:647-647`
- **callers** — Callers in the graph `trace-engine.ts:529-535`, `trace-engine.ts:585-604`
- **candidateIds** — Stores candidate entity IDs for further processing `trace-engine.ts:846-846`
- **classifyLine** — Classifies a line of source code into a control flow strategy `cfg-builder.ts:78-89`
- **classifyLine** — Determines the kind of line based on variable name and line content `condition-trace.ts:110-124`
- **clearAllGraphCaches** — Clears all graph cache entries and their associated builders `graph-cache.ts:204-209`
- **conditionalCallers** — Identifies callers of a method with conditional logic `trace-engine.ts:1092-1092`
- **conditions** — Counts the number of condition steps in the path `path-enrichment.ts:78-78`
- **conditionUsages** — Filters usages to find condition usages `state-tracker.ts:388-388`
- **defReachesNode** — Determines if a definition reaches a given CFG node `reaching-definitions.ts:352-356`
- **defsReachingNode** — Returns a list of definitions that reach a given CFG node `reaching-definitions.ts:361-373`
- **detectContradictions** — Detects contradictions in conditions `condition-types.ts:283-292`
- **detectDeadBranches** — Detects dead branches in the control flow graph `condition-types.ts:297-299`
- **determineAction** — Determines the action type for a step based on node control flow `path-enrichment.ts:21-45`
- **dfs** — Performs a depth-first search on the graph `graphology-path-builder.ts:866-897`
- **dfs** — Performs depth-first search on the graph `path-builder.ts:486-522`
- **directMatches** — Finds direct matches for a given entity `trace-engine.ts:779-779`
- **doInvalidateAndPreload** — Invalidates a graph cache entry and optionally preloads it based on usage count `graph-cache.ts:168-199`
- **edgeTypeSummary** — Summarizes edge types in the graph `graphology-path-builder.ts:420-420`, `graphology-path-builder.ts:421-421`
- **enrichPath** — Enriches a raw path into a detailed trace path with steps, confidence, summary, and warnings `path-enrichment.ts:137-182`
- **enrichPaths** — Enriches multiple raw paths into detailed trace paths `path-enrichment.ts:187-189`
- **entityMap** — Not present in the provided code `path-builder.ts:101-101`
- **entryPoints** — Identifies entry points in a code flow `trace-engine.ts:1131-1131`, `trace-engine.ts:1131-1131`
- **escapeRegex** — Escapes a string for use in a regular expression `condition-trace.ts:162-164`
- **exact** — Matches exactly a pattern `path-builder.ts:627-627`, `path-builder.ts:633-633`
- **extractCondition** — Extracts conditions from source text `condition-types.ts:103-248`
- **extractConditionsBackward** — Extracts condition lines backward from a target line, ensuring they are at less indentation `condition-trace.ts:136-160`
- **extractContext** — Extracts the ProjectContext from the storage `graph-cache.ts:47-49`
- **extractDefinitionsFromLines** — Parses lines of code to extract variable definitions `reaching-definitions.ts:159-206`
- **extractFeatureFromName** — Extracts the feature name from an entity name `ngrx-resolution.ts:54-68`
- **extractNarrowedTypes** — Extracts narrowed types from conditions `condition-types.ts:304-308`
- **extractParameterDefs** — Extracts parameter definitions from method bodies `reaching-definitions.ts:209-236`
- **extractSimpleIdent** — Extracts simple identifiers from source text `condition-types.ts:95-98`
- **featureSelectors** — Filters selectors based on name or metadata to identify feature-related entities `ngrx-resolution.ts:94-105`
- **fileFiltered** — Filters entities by their file path `trace-engine.ts:750-753`
- **fileMatches** — Checks if a file matches a pattern `path-builder.ts:620-623`
- **filterByFile** — Filters entities by their file path `trace-engine.ts:724-733`
- **filtered** — Filters graph nodes or edges `graphology-path-builder.ts:275-275`
- **findIncomingNgRxRelationships** — Finds incoming relationships of a specified type for a given entity name `ngrx-resolution.ts:187-193`
- **findReducerToSelectorConnections** — Finds implicit reducer -> featureSelector connections `ngrx-resolution.ts:78-152`
- **generatePathSummary** — Generates a human-readable summary of a path `path-enrichment.ts:69-92`
- **generateWarnings** — Generates warnings based on the raw path and graph `path-enrichment.ts:97-123`
- **getCachedGraphBuilder** — Returns a cached graph builder instance or creates one if not present `graph-cache.ts:91-108`
- **getConfidenceLevel** — Determines the confidence level of a path based on its score `path-enrichment.ts:128-132`
- **getDirectory** — Extracts the directory from a file path `ngrx-resolution.ts:34-37`
- **getFeatureBaseName** — Extracts the base name of a feature from a file path `ngrx-resolution.ts:43-48`
- **getPredecessors** — Retrieves the predecessor nodes of a given node in the CFG `cfg-builder.ts:249-251`
- **getProjectKey** — Extracts the project key from the storage's current context `graph-cache.ts:38-42`
- **getSuccessors** — Retrieves the successor nodes of a given node in the CFG `cfg-builder.ts:242-244`
- **getTraceUsageCount** — Retrieves the usage count for a graph cache entry `graph-cache.ts:129-132`
- **hasGuard** — Checks if a node has a guard `graphology-path-builder.ts:1134-1134`
- **hasGuard** — Checks if a node has a guard condition `path-builder.ts:582-582`
- **hasTransformation** — Property indicating whether the node has a transformation `trace-engine.ts:69-69`
- **incrementTraceUsage** — Increments the usage count for a graph cache entry and logs the change `graph-cache.ts:114-124`
- **inputs** — Inputs in the data flow result `output-formatter.ts:405-405`
- **inputTypes** — Property representing input types in the NodeFlowContext `trace-engine.ts:67-67`
- **invalidateAndPreload** — Invalidates and preloads a graph cache entry if the usage count meets the threshold `graph-cache.ts:141-166`
- **isHeaderFile** — Indicates whether the file is a header file `graphology-path-builder.ts:1198-1200`
- **isHypothesis** — Check if a step is a hypothesis `output-formatter.ts:209-209`
- **isImplementationFile** — Indicates whether the file is an implementation file `graphology-path-builder.ts:1194-1196`
- **isInvertedNgRxRelation** — Checks if a relationship type is an inverted NgRx relationship `ngrx-resolution.ts:199-201`
- **isRealEntity** — Property indicating whether the entity is a real code entity `trace-engine.ts:88-93`
- **loadUsageFromDb** — Loads the trace usage count from the database into the cache entry `graph-cache.ts:55-69`
- **measureIndent** — Calculates the indentation level of a line `condition-trace.ts:126-134`
- **negateOp** — Returns the negation of a given comparison operator `condition-types.ts:31-47`
- **ngrxEntity** — Represents an entity in the NgRx flow `ngrx-trace-engine.ts:251-254`
- **outputs** — Outputs in the data flow result `output-formatter.ts:408-408`
- **paramStr** — Converts parameters to a string representation `trace-engine.ts:1229-1229`
- **parts** — Represents parts of an NgRx flow path `ngrx-trace-engine.ts:345-362`
- **persistUsageToDb** — Persists the trace usage count to the database `graph-cache.ts:74-85`
- **pointsPromises** — Promises for collecting decision points in parallel `condition-analyzer.ts:77-80`
- **predecessors** — Represents the predecessors of a CFG node `reaching-definitions.ts:300-300`
- **prioritized** — Prioritizes entities based on a specific criterion `trace-engine.ts:800-804`, `trace-engine.ts:817-821`
- **queue** — Not present in the provided code `path-builder.ts:92-92`
- **relevantPoints** — Filters cached decision points by entry points `condition-analyzer.ts:69-69`, `condition-analyzer.ts:69-69`
- **resolveNgRxTarget** — Resolves the target entity ID for a given phantom entity by searching for a real entity with the same name `ngrx-resolution.ts:159-181`
- **sameNameReal** — Identifies entities with the same name and real code type `trace-engine.ts:747-747`
- **solveReachingDefinitions** — Solves the reaching definitions problem using iterative fixed-point analysis `reaching-definitions.ts:251-343`
- **sorted** — Sorts entities based on a specific criterion `trace-engine.ts:782-786`
- **steps** — Stores the steps taken during graph traversal `graphology-path-builder.ts:1006-1016`, `graphology-path-builder.ts:1032-1044`
- **suffixMatches** — Finds entities that match a given suffix `trace-engine.ts:814-814`
- **summary** — Summary of the data flow analysis `data-flow-analyzer.ts:109-109`, `data-flow-analyzer.ts:109-109`
- **tracePath** — Traces path in the graph `trace-engine.ts:257-265`
- **validBatch** — Not present in the provided code `path-builder.ts:96-96`

### Method
- **[Symbol.iterator]** — Iterates over the set bits in the BitSet, yielding their positions `reaching-definitions.ts:101-110`
- **addEdge** — Adds a new edge to the control flow graph `cfg-builder.ts:106-108`
- **addNode** — Adds a new node to the control flow graph `cfg-builder.ts:100-104`
- **addReducerSelectorEdges** — Adds edges between reducer and selector nodes in the graph `path-builder.ts:195-254`
- **analyzeActionFlow** — Analyzes the flow of actions in an NgRx application `ngrx-trace-engine.ts:369-398`
- **analyzeConditions** — Analyzes conditions to determine their impact `condition-analyzer.ts:389-424`
- **analyzeConditionsInPaths** — Analyzes conditional logic in code paths `trace-engine.ts:995-1030`
- **analyzeScenario** — Analyzes state usages to determine reachable and blocked paths `state-tracker.ts:306-343`
- **analyzeStateImpact** — Analyzes the impact of a state on scenarios `state-tracker.ts:211-236`
- **analyzeStatesInPaths** — Analyzes state dependencies in code paths `trace-engine.ts:877-928`
- **annotateApiContractBoundaries** — Annotates API contract boundaries `trace-engine.ts:354-436`
- **assessImpact** — Assesses the impact of a condition `condition-analyzer.ts:313-340`
- **buildAdjacencyGraph** — Method to build adjacency graph from storage `path-builder.ts:80-134`
- **buildBehaviorMatrix** — Constructs a matrix of behavior combinations for data flow analysis `data-flow-analyzer.ts:394-456`
- **buildOutcomes** — Builds outcomes based on conditions `condition-analyzer.ts:293-308`
- **buildStateDependencies** — Builds state dependencies for an entity `state-tracker.ts:445-463`
- **calculateConfidence** — Calculates the confidence level of a path `graphology-path-builder.ts:1138-1144`
- **calculateEdgeWeight** — Calculates the weight of an edge based on its type and conditions `path-builder.ts:300-319`
- **calculateRippleEffects** — Calculates ripple effects of state usages `state-tracker.ts:406-436`
- **calculateSummary** — Calculates a summary of decision points, including total, critical, possible outcomes, and states modified `condition-analyzer.ts:467-492`
- **classifyConditionType** — Classifies the type of a condition `condition-analyzer.ts:260-288`
- **classifyDataSource** — Classify a data source based on patterns `data-flow-analyzer.ts:164-171`
- **classifyTransformation** — Classify a transformation based on patterns `data-flow-analyzer.ts:299-315`
- **clear** — Clears the graph data `graphology-path-builder.ts:488-492`
- **clearCache** — Clears the decision point cache `condition-analyzer.ts:608-610`
- **clearCache** — Clears the cache used in data flow analysis `data-flow-analyzer.ts:518-520`
- **clearCache** — Clears the adjacency graph cache `path-builder.ts:568-571`
- **clearCache** — No cache for now `state-tracker.ts:508-510`
- **clearCache** — Clears the cache used by the trace engine `trace-engine.ts:1342-1346`
- **clone** — Clones a BitSet `reaching-definitions.ts:58-62`
- **collectDecisionPoints** — Collects decision points starting from an entry point `condition-analyzer.ts:142-179`
- **conditionInvolvesData** — Check if a condition involves data `data-flow-analyzer.ts:320-327`
- **constructor** — Initializes the ConditionAnalyzer with a graph storage instance `condition-analyzer.ts:39-41`
- **constructor** — Constructor for the DataFlowAnalyzer class `data-flow-analyzer.ts:63-67`
- **constructor** — Initializes the GraphologyPathBuilder instance `graphology-path-builder.ts:151-159`
- **constructor** — Initializes the NgRxTraceEngine `ngrx-trace-engine.ts:101-103`
- **constructor** — Constructor for the PathBuilder class `path-builder.ts:68-70`
- **constructor** — Initializes a new BitSet with a given size `reaching-definitions.ts:49-52`
- **constructor** — Initializes the StateTracker with a graph storage `state-tracker.ts:41-43`
- **constructor** — Constructor for the trace engine `trace-engine.ts:105-116`
- **deduplicateDecisionPoints** — Removes duplicate decision points based on their location and condition or action `condition-analyzer.ts:429-440`
- **detectConflicts** — Detects conflicts in state usages `state-tracker.ts:373-401`
- **detectStateChanges** — Detects state changes in an entity `state-tracker.ts:52-94`
- **detectStateReads** — Detects state reads from an entity's metadata `state-tracker.ts:99-128`
- **determineAction** — Determines the action to take during graph traversal `graphology-path-builder.ts:1066-1073`
- **determineStepType** — Determines the type of a step in the NgRx flow `ngrx-trace-engine.ts:292-317`
- **difference** — Computes the bitwise difference between the current BitSet and another BitSet `reaching-definitions.ts:84-90`
- **empty** — Creates an empty BitSet with a given size `reaching-definitions.ts:54-56`
- **enrichPaths** — Enriches paths with additional information `graphology-path-builder.ts:1030-1054`, `path-builder.ts:557-559`
- **ensureLoaded** — Ensures that the graph is loaded `graphology-path-builder.ts:1060-1064`
- **entityHandlesData** — Handles data flow analysis by tracing how data moves through the codebase `data-flow-analyzer.ts:357-385`
- **entityToNode** — Converts an entity to a graph node `path-builder.ts:259-295`
- **entityToNodeAttrs** — Maps entities to node attributes `graphology-path-builder.ts:449-460`
- **entityToStep** — Converts an entity to a step in the NgRx flow `ngrx-trace-engine.ts:273-287`
- **equals** — Checks if the current BitSet is equal to another BitSet `reaching-definitions.ts:93-98`
- **estimateMemoryUsage** — Estimates the memory usage of the graph `graphology-path-builder.ts:465-469`
- **evaluateFlowWithConditions** — Evaluates data flow with specified conditions `data-flow-analyzer.ts:461-478`
- **extractBranches** — Extracts branches from the graph `graphology-path-builder.ts:1075-1085`
- **extractDataDependencies** — Extracts data dependencies from conditions `condition-analyzer.ts:345-380`
- **extractDecisionPoints** — Extracts decision points from a scenario `condition-analyzer.ts:184-255`
- **extractMutationTarget** — Infers the mutation target from a call name `state-tracker.ts:158-168`
- **extractSideEffects** — Extracts side effects from the graph `graphology-path-builder.ts:1087-1108`
- **extractStatesFromCondition** — Extracts states from a condition string `state-tracker.ts:173-202`
- **findBlockingConditions** — Finds blocking conditions in code paths `trace-engine.ts:1035-1063`
- **findDecisionPoints** — Finds all decision points in a scenario, optimized with caching and parallel entry point collection `condition-analyzer.ts:54-110`
- **findEntity** — Finds an entity in the codebase based on a given identifier `data-flow-analyzer.ts:487-513`
- **findEntityByName** — Finds an entity by name in the graph `path-builder.ts:606-638`
- **findEntryPoints** — Finds entry points for a scenario `condition-analyzer.ts:115-137`
- **findModifiers** — Finds entities that modify a state `state-tracker.ts:468-488`
- **findNextInFlow** — Find the next entity in the data flow `data-flow-analyzer.ts:332-352`
- **findNgRxPaths** — Finds paths in the NgRx flow `ngrx-trace-engine.ts:147-219`
- **findNodeByName** — Finds a node by its name in the graph `graphology-path-builder.ts:584-604`
- **findPathMultiSegment** — Finds multi-segment paths in the graph `graphology-path-builder.ts:908-1025`
- **findPaths** — Finds all possible paths in the graph `graphology-path-builder.ts:849-902`
- **findPathsBackward** — Finds paths in the graph in reverse direction `path-builder.ts:470-527`
- **findPathsForward** — Finds paths in the graph from a starting node `path-builder.ts:334-410`
- **findShortestPath** — Finds the shortest path between two nodes in a graph `graphology-path-builder.ts:549-563`
- **findShortestPathByName** — Finds the shortest path between two nodes by name `graphology-path-builder.ts:568-579`
- **findStateDependencies** — Finds state dependencies in code paths `trace-engine.ts:933-952`
- **findStateModifiers** — Finds state modifiers in code paths `trace-engine.ts:957-969`
- **findStateUsages** — Searches for state usages in entities `state-tracker.ts:241-301`
- **formatDataFlowAsText** — Format data flow result as text `output-formatter.ts:358-418`
- **formatDecisionPointsAsText** — Format decision points result as text `output-formatter.ts:504-534`
- **formatStateImpactAsText** — Format state impact result as text `output-formatter.ts:443-495`
- **formatStep** — Format a single step in the trace flow `output-formatter.ts:112-151`
- **formatTraceBackwardsAsText** — Format trace backwards result as text `output-formatter.ts:230-317`
- **formatTraceFlowAsMermaid** — Format trace flow result as Mermaid `output-formatter.ts:173-221`
- **formatTraceFlowAsText** — Format trace flow result as text `output-formatter.ts:32-107`
- **generateDiagnosis** — Generates a diagnosis for a code path `trace-engine.ts:1072-1159`
- **generateFlowDiagram** — Generates a Mermaid flow diagram based on decision points and entry points `condition-analyzer.ts:501-562`
- **generateLinearSummary** — Generates a linear summary of the path `graphology-path-builder.ts:1146-1159`
- **generateMermaidDiagram** — Generates a Mermaid diagram of an NgRx flow `ngrx-trace-engine.ts:403-441`
- **generateMermaidDiagram** — Generates a Mermaid diagram for a code flow `trace-engine.ts:1168-1214`
- **generatePathSummary** — Generates a summary of the path `graphology-path-builder.ts:1161-1168`
- **generatePathSummary** — Generates a summary of an NgRx flow path `ngrx-trace-engine.ts:344-364`
- **generateStepDescription** — Generates a description for a step in the NgRx flow `ngrx-trace-engine.ts:322-339`
- **generateWarnings** — Generates warnings for the path `graphology-path-builder.ts:1170-1175`
- **getAllRelationships** — Retrieves all relationships in the graph `graphology-path-builder.ts:440-444`
- **getBatchNodeContext** — Builds a context for a batch of nodes in the flow `trace-engine.ts:1271-1333`
- **getCallees** — Asynchronously retrieves all entities that are called by a given entity, using relationships stored in the database `path-builder.ts:670-679`
- **getCallerNeighbors** — Retrieves caller neighbors for a given node `graphology-path-builder.ts:519-539`
- **getCallers** — Retrieves callers for a given entity `path-builder.ts:643-665`
- **getCallNeighbors** — Retrieves call neighbors for a given node `graphology-path-builder.ts:502-511`
- **getCallProbability** — Retrieves the call probability of a node `graphology-path-builder.ts:1130-1136`
- **getCallProbability** — Calculates the probability of a call `path-builder.ts:576-589`
- **getConfidenceLevel** — Retrieves the confidence level of the path `graphology-path-builder.ts:1180-1184`
- **getConfidenceLevel** — Determines the confidence level of a path `path-builder.ts:594-596`
- **getDataFlowIcon** — Get the icon for data flow `output-formatter.ts:423-434`
- **getEdgeWeight** — Retrieves the weight of an edge `graphology-path-builder.ts:1110-1128`
- **getEntitySignature** — Returns the signature of an entity `trace-engine.ts:1226-1232`
- **getGraph** — Returns the graph instance `graphology-path-builder.ts:161-163`
- **getGraphStats** — Retrieves graph statistics `trace-engine.ts:135-140`
- **getImpactIcon** — Get the icon for impact `output-formatter.ts:539-552`
- **getLikelihoodIcon** — Get the icon for likelihood `output-formatter.ts:338-349`
- **getNgRxRelationships** — Retrieves relationships in the NgRx flow `ngrx-trace-engine.ts:224-238`
- **getNodeFlowContext** — Builds a context for a node in the flow `trace-engine.ts:1243-1264`
- **getNodeShape** — Returns the open and close shapes for a decision point based on its type `condition-analyzer.ts:567-588`
- **getProbabilityIcon** — Get the icon for probability `output-formatter.ts:322-333`
- **getStats** — Retrieves statistics about the graph `graphology-path-builder.ts:481-483`
- **getStepIcon** — Get the icon for a step in the trace flow `output-formatter.ts:156-168`
- **groupBy** — Group the output `output-formatter.ts:572-584`
- **identifyDataSources** — Identify data sources in the codebase `data-flow-analyzer.ts:130-159`
- **inferFeatureFromPath** — Infers features from path strings `state-tracker.ts:365-368`
- **inferStateType** — Infers the state type of an entity `trace-engine.ts:974-986`
- **inferType** — Infers the type of a state `state-tracker.ts:493-499`
- **isLoaded** — Checks if the graph is loaded `graphology-path-builder.ts:474-476`
- **isMutatingCall** — Determines if a call is mutating `state-tracker.ts:133-153`
- **isOptimizedMode** — Checks if optimized mode is enabled `trace-engine.ts:128-130`
- **isSet** — Checks if a bit is set in the BitSet `reaching-definitions.ts:72-74`
- **linearTraceToTracePath** — Converts linear trace to trace path `trace-engine.ts:325-348`
- **loadGraph** — Loads the graph from storage `graphology-path-builder.ts:175-434`
- **processCallerDFS** — Processes caller paths using DFS `path-builder.ts:532-547`
- **processEntityEdges** — Builds adjacency graph from storage for efficient traversal `path-builder.ts:139-190`
- **processNeighbor** — Processes a neighbor node in the graph traversal `path-builder.ts:415-460`
- **resolveEntity** — Resolves an entity by its ID `trace-engine.ts:697-705`
- **resolveEntityUncached** — Resolves an entity by its ID without using a cache `trace-engine.ts:707-868`
- **resolveNgRxEntity** — Resolves an entity in the NgRx flow `ngrx-trace-engine.ts:243-268`
- **sanitize** — Sanitizes the input for an NgRx flow trace `ngrx-trace-engine.ts:446-448`
- **sanitize** — Sanitize the output `output-formatter.ts:561-567`
- **sanitizeMermaidId** — Sanitizes an ID for use in a Mermaid diagram `trace-engine.ts:1219-1221`
- **sanitizeMermaidLabel** — Replaces special characters and trims the input text to a maximum length of 50 characters `condition-analyzer.ts:593-599`
- **set** — Sets a bit in the BitSet `reaching-definitions.ts:64-66`
- **setOptimizedMode** — Sets optimized mode `trace-engine.ts:121-123`
- **simulateCondition** — Simulates condition evaluation for state usages `state-tracker.ts:348-360`
- **sortDecisionPoints** — Sorts decision points by impact, type, or location `condition-analyzer.ts:445-462`
- **traceBackwards** — Traces the flow of execution backwards through the graph `graphology-path-builder.ts:773-838`
- **traceBackwards** — Traces backwards in the graph `trace-engine.ts:511-681`
- **traceDataFlow** — Trace data flow from entry point to target state `data-flow-analyzer.ts:76-121`
- **traceFlow** — Traces flow in the graph `trace-engine.ts:150-160`
- **traceFlowLegacy** — Legacy trace flow `trace-engine.ts:441-501`
- **traceFlowOptimized** — Optimized trace flow `trace-engine.ts:165-320`
- **traceLinearFlow** — Traces the linear flow of execution through the graph `graphology-path-builder.ts:615-731`
- **traceLinearFlowByName** — Traces the linear flow of execution through the graph by name `graphology-path-builder.ts:736-763`
- **traceNgRxFlow** — Traces the NgRx flow from a starting point to an ending point `ngrx-trace-engine.ts:108-142`
- **traceSourceToTarget** — Trace data flow from a source to a target `data-flow-analyzer.ts:180-294`
- **union** — Unions two bitsets `reaching-definitions.ts:77-81`
- **unset** — Unsets a bit in the BitSet `reaching-definitions.ts:68-70`

### Class
- **BitSet** — A class for compact set operations on Uint32Array `reaching-definitions.ts:45-111`
- **Builder** — Builder for constructing a control flow graph from source code `cfg-builder.ts:95-109`
- **ConditionAnalyzer** — Analyzes branching conditions, guards, and decision points to identify critical control flow patterns `condition-analyzer.ts:35-611`
- **DataFlowAnalyzer** — Class for tracing data flow through the codebase `data-flow-analyzer.ts:58-521`
- **GraphologyPathBuilder** — Optimized graph traversal using graphology library `graphology-path-builder.ts:144-1185`
- **NgRxTraceEngine** — A specialized trace engine for NgRx/Redux event-driven architectures `ngrx-trace-engine.ts:98-449`
- **OutputFormatter** — Generates various output formats: text, Mermaid, JSON `output-formatter.ts:24-585`
- **PathBuilder** — Class for building paths in a graph `path-builder.ts:63-680`
- **StateTracker** — Tracks state changes along execution paths `state-tracker.ts:38-511`
- **TraceEngine** — Class for the main engine of static code flow analysis `trace-engine.ts:95-1347`

### Interface
- **AdjacencyGraph** — Type of action in a trace step `types.ts:637-646`
- **AnalyzeStateImpactParams** — Parameters for analyzing the impact of a state change `types.ts:444-454`
- **AnalyzeStateImpactResult** — The result of analyzing the impact of a state change `types.ts:501-516`
- **BehaviorCombination** — Represents combinations of behaviors in the code flow `types.ts:405-412`
- **BlockingCondition** — Condition that blocks a trace `types.ts:269-278`
- **CachedGraph** — Represents a cached graph with its builder, usage count, and whether the usage count has been loaded from the database `graph-cache.ts:26-31`
- **CallChain** — Chain of function calls leading to a particular point `types.ts:297-306`
- **CallerInfo** — Information about the caller of a function or method `types.ts:249-264`
- **CfgEdge** — Represents an edge in a control flow graph with its source and destination nodes `cfg-builder.ts:40-44`
- **CfgNode** — Represents a node in a control flow graph with its source line range `cfg-builder.ts:31-38`
- **Condition** — Represents a single condition with its variable, operator, value, negation status, and CFG node ID `condition-types.ts:49-56`
- **ConditionResult** — Represents the result of condition analysis, including feasibility, conditions, contradictions, dead branches, and narrowed types `condition-types.ts:72-78`
- **ConditionsSummary** — Represents a summary of conditions in the trace flow `types.ts:182-189`
- **Contradiction** — Represents a contradiction between two conditions `condition-types.ts:60-64`
- **DataFlow** — Represents the flow of data through the code `types.ts:391-400`
- **DataFlowStep** — Represents a step in data flow analysis `types.ts:364-386`
- **DecisionPoint** — Represents a decision point in the code flow `types.ts:539-562`
- **Definition** — An interface representing a variable definition with its variable name, CFG node ID, source line, and kind `reaching-definitions.ts:24-29`
- **DFSState** — Mutable traversal state carried through DFS recursion `path-builder.ts:45-49`
- **Diagnosis** — Represents a diagnosis of a code issue `types.ts:311-318`
- **FindDecisionPointsParams** — Parameters for finding decision points `types.ts:525-534`
- **FindDecisionPointsResult** — Result of finding decision points `types.ts:567-585`
- **GraphEdgeAttributes** — Edge attributes in graphology graph `graphology-path-builder.ts:50-54`
- **GraphNode** — Type of decision point `types.ts:608-632`
- **GraphNodeAttributes** — Node attributes in graphology graph `graphology-path-builder.ts:31-45`
- **GraphStats** — Graph statistics `graphology-path-builder.ts:99-104`
- **LinearTrace** — Linear trace with branch annotations `graphology-path-builder.ts:86-94`
- **LinearTraceStep** — Linear trace step with branch annotations `graphology-path-builder.ts:59-81`
- **MethodCfg** — Represents a method's control flow graph with nodes, edges, entry, and exit IDs `cfg-builder.ts:46-51`
- **NarrowedType** — Represents a narrowed type of a variable `condition-types.ts:66-70`
- **NgRxFlowPath** — Represents a complete path in an NgRx flow `ngrx-trace-engine.ts:55-61`
- **NgRxFlowStep** — Represents a single step in an NgRx flow with its properties `ngrx-trace-engine.ts:40-50`
- **NodeFlowContext** — Interface for node flow context used by diagram enrichment `trace-engine.ts:53-62`
- **PathContext** — Shared context references for DFS caller traversal `path-builder.ts:52-57`
- **PathFindingOptions** — Type of action in a trace step `types.ts:651-662`
- **QueueItem** — Represents an item in a queue for tracing NgRx flows `ngrx-trace-engine.ts:152-157`
- **RawPath** — Type of decision point `types.ts:594-603`
- **ReachingDefResult** — A result object containing definitions, reaching in and out bitsets, and a map from CFG node IDs to indices `reaching-definitions.ts:31-39`
- **ReducerSelectorConnection** — Connection between a reducer and a feature selector `ngrx-resolution.ts:25-29`
- **ScenarioAnalysis** — Represents the analysis of a scenario `types.ts:473-482`
- **SemanticSearchService** — Local interface for semantic search to avoid circular dependency `data-flow-analyzer.ts:25-27`
- **SemanticSearchService** — Interface for semantic search service with optional dependency `trace-engine.ts:33-35`
- **StateChange** — Defines the structure of a state change, including variable name, previous and new values, and whether it's a mutation or assignment `types.ts:94-103`
- **StateConflict** — Represents a conflict in the state analysis `types.ts:487-496`
- **StateDependency** — Dependency on a state for a trace `types.ts:283-292`
- **StatesSummary** — Represents a summary of state changes in the trace flow `types.ts:170-177`
- **StateUsage** — Represents the usage of a state in the code `types.ts:459-468`
- **TraceBackwardsParams** — Contains parameters for backward analysis, including target method, question type, depth, and whether to include states and effects `types.ts:233-244`
- **TraceBackwardsResult** — Stores the result of a backwards trace analysis `types.ts:323-341`
- **TraceDataFlowParams** — Parameters for data flow analysis `types.ts:350-359`
- **TraceDataFlowResult** — Represents the result of a trace data flow analysis `types.ts:417-435`
- **TraceFlowParams** — Parameters for trace_flow tool `types.ts:76-89`
- **TraceFlowResult** — Represents the result of a trace flow analysis `types.ts:194-219`
- **TraceNgRxFlowParams** — Parameters for tracing an NgRx flow `ngrx-trace-engine.ts:66-77`
- **TraceNgRxFlowResult** — Represents the result of tracing an NgRx flow `ngrx-trace-engine.ts:82-92`
- **TracePath** — Represents a path in the trace flow `types.ts:154-165`
- **TraceStep** — Represents a step in a trace, including order, entity name, file path, line number, action type, and additional context `types.ts:108-149`
- **VariableDep** — Interface representing variable dependencies with conditions, source line, and assignment text `condition-trace.ts:24-30`
- **VariableTraceResult** — Interface representing the result of variable dependency analysis `condition-trace.ts:32-38`

### Enum_decl
- **ConditionDependency** — Enum representing variable dependencies — existence, value, or unconditional `condition-trace.ts:15-22`

### Constant
- **Existence** — Variable may not exist without this condition (declaration in branch) `condition-trace.ts:17-17`
- **Unconditional** — Variable is always assigned (not in any branch) `condition-trace.ts:21-21`
- **Value** — Variable's value depends on this condition (assignment in branch) `condition-trace.ts:19-19`

### Type_alias
- **BackwardsQuestion** — Represents the type of backward analysis question `types.ts:228-228`
- **CallProbability** — Probability that a call happens `types.ts:30-30`
- **CfgEdgeType** — Represents the types of edges in a control flow graph `cfg-builder.ts:29-29`
- **CfgNodeType** — Represents the types of nodes in a control flow graph `cfg-builder.ts:17-27`
- **CfgStrategy** — Strategy for classifying lines in the source code `cfg-builder.ts:57-66`
- **CondOp** — Represents comparison operators used in conditions `condition-types.ts:17-29`
- **ConfidenceLevel** — Confidence level for trace results `types.ts:20-20`
- **DataFlowActionType** — Type of data flow action `types.ts:48-55`
- **DecisionPointType** — Type of decision point `types.ts:60-67`
- **DefKind** — Represents the kind of definition, either declaration, assignment, or parameter `condition-trace.ts:108-108`
- **DefKind** — Represents the kind of variable definition, such as assignment, parameter, declaration, etc `reaching-definitions.ts:22-22`
- **ImpactLevel** — Impact level for decision points `types.ts:25-25`
- **NgRxFlowStepType** — Represents the type of a step in an NgRx flow `ngrx-trace-engine.ts:29-35`
- **Param** — Type representing parameters in the NodeFlowContext `trace-engine.ts:65-65`
- **Parameter** — Represents a parameter in an entity `trace-engine.ts:1227-1227`
- **PathFeasibility** — Represents the feasibility of a path in the control flow graph `condition-types.ts:58-58`
- **TraceActionType** — Type of action in a trace step `types.ts:35-43`

### Import_decl
- **../logging/index.js** — Imports `../logging/index.js` from `../logging/index.js`. `graph-cache.ts:16-16`, `graphology-path-builder.ts:20-20`, `trace-engine.ts:13-13`
- **../storage/graph-storage-factory.js** — Imports `../storage/graph-storage-factory.js` from `../storage/graph-storage-factory.js`. `graph-cache.ts:17-17`
- **../storage/libsql/request-context.js** — Imports `../storage/libsql/request-context.js` from `../storage/libsql/request-context.js`. `graph-cache.ts:18-18`
- **../storage/libsql/types.js** — Imports `../storage/libsql/types.js` from `../storage/libsql/types.js`. `graph-cache.ts:19-19`
- **../types/storage.js** — Imports `../types/storage.js` from `../types/storage.js`. `condition-analyzer.ts:12-12`, `condition-analyzer.ts:13-13`, `data-flow-analyzer.ts:12-12`, `data-flow-analyzer.ts:13-13`, `graph-cache.ts:20-20`, `graphology-path-builder.ts:21-21`, `ngrx-resolution.ts:8-8`, `ngrx-resolution.ts:9-9`, `ngrx-trace-engine.ts:19-19`, `ngrx-trace-engine.ts:20-20`, `path-builder.ts:13-13`, `path-builder.ts:14-14`, `state-tracker.ts:12-12`, `state-tracker.ts:13-13`, `trace-engine.ts:14-14`
- **./cfg-builder.js** — Imports `./cfg-builder.js` from `./cfg-builder.js`. `condition-types.ts:11-11`, `reaching-definitions.ts:16-16`
- **./graphology-path-builder.js** — Imports `./graphology-path-builder.js` from `./graphology-path-builder.js`. `graph-cache.ts:21-21`, `trace-engine.ts:15-15`
- **./ngrx-resolution.js** — Imports `./ngrx-resolution.js`. `path-builder.ts:16-22`
- **./path-builder.js** — Imports `./path-builder.js` from `./path-builder.js`. `trace-engine.ts:16-16`
- **./path-enrichment.js** — Imports `./path-enrichment.js` from `./path-enrichment.js`. `path-builder.ts:23-23`
- **./state-tracker.js** — Imports `./state-tracker.js` from `./state-tracker.js`. `data-flow-analyzer.ts:14-14`
- **./types.js** — Imports `./types.js`. `condition-analyzer.ts:14-21`, `data-flow-analyzer.ts:15-22`, `output-formatter.ts:11-18`, `path-builder.ts:24-32`, `path-enrichment.ts:8-16`, `state-tracker.ts:14-22`, `trace-engine.ts:17-30`
- **./types.js** — Imports `./types.js` from `./types.js`. `graphology-path-builder.ts:22-22`
- **graphology** — Imports `graphology` from `graphology`. `graphology-path-builder.ts:18-18`
- **graphology-shortest-path** — Imports `graphology-shortest-path` from `graphology-shortest-path`. `graphology-path-builder.ts:19-19`

### Property
- **_debug** — Debug information for trace flow result `output-formatter.ts:32-32`
- **_debug** — Contains debug information about the trace, including source and target entities, graph statistics, and trace summary `types.ts:208-218`
- **a** — Represents the first condition in a contradiction `condition-types.ts:61-61`
- **action** — Represents an action in the analysis process `condition-analyzer.ts:390-390`
- **action** — Trace action type `graphology-path-builder.ts:65-65`
- **action** — Specifies the type of action associated with the entity `types.ts:120-120`
- **action** — Describes the action in a step of data flow analysis `types.ts:370-370`
- **action** — Action taken at a decision point `types.ts:549-549`
- **actionChain** — An array of action types traversed in the flow path `ngrx-trace-engine.ts:60-60`
- **actionChain** — Represents the chain of actions in the NgRx flow `ngrx-trace-engine.ts:155-155`
- **actionFlow** — Represents the flow of actions in the NgRx trace `ngrx-trace-engine.ts:86-90`
- **actionType** — The type of action associated with the step `ngrx-trace-engine.ts:47-47`
- **adjacencyCache** — Cache for adjacency graphs `path-builder.ts:65-65`
- **affectedComponents** — Detects state changes in an entity `state-tracker.ts:409-409`
- **affectedComponents** — Lists components affected by a decision point `types.ts:514-514`
- **affectsTarget** — Indicates whether a data flow affects the target `types.ts:397-397`
- **assignmentText** — Text of the assignment line for the variable `condition-trace.ts:29-29`
- **awaits** — Node awaits information `graphology-path-builder.ts:41-41`
- **awaits** — Represents asynchronous await points in the trace flow `types.ts:134-134`
- **awaits** — Type of action in a trace step `types.ts:622-622`
- **awaitTarget** — Represents the target of an await in the trace flow `types.ts:136-136`
- **b** — Represents the second condition in a contradiction `condition-types.ts:62-62`
- **backward** — Type of action in a trace step `types.ts:643-643`
- **behaviorMatrix** — Represents the matrix of behaviors in the code flow `types.ts:425-427`
- **blockedPaths** — Paths that are blocked or unreachable from a given state `types.ts:477-477`
- **blockingConditions** — Identifies conditions that block a function or method `types.ts:334-334`
- **branches** — Represents a collection of decision paths with their conditions and branches `condition-analyzer.ts:390-390`
- **branches** — Represents an array of conditional branches for the path builder `graphology-path-builder.ts:39-39`
- **branches** — Represents the different branches in the trace flow `types.ts:126-126`, `types.ts:186-186`
- **branches** — Indicates different paths or branches in the code flow `types.ts:382-382`
- **branches** — Type of decision point `types.ts:620-620`
- **branchingPoints** — Represents the points in the code flow where branching occurs `types.ts:431-431`
- **builder** — A GraphologyPathBuilder instance used for building paths in a graph `graph-cache.ts:27-27`
- **callChains** — Represents the chain of function calls `types.ts:338-338`
- **callees** — Property representing callees in the NodeFlowContext `trace-engine.ts:61-61`
- **callers** — Represents the callers of a node in the graph `graphology-path-builder.ts:778-778`
- **callers** — Maintains a list of callers `trace-engine.ts:60-60`
- **callers** — Lists the callers of a function or method `types.ts:332-332`
- **calls** — Type of action in a trace step `types.ts:626-626`
- **callsOnly** — Type of action in a trace step `types.ts:657-657`
- **cfgNodeId** — Represents the CFG node ID associated with the condition `condition-types.ts:54-54`
- **cfgNodeId** — The ID of the CFG node where a variable is defined `reaching-definitions.ts:26-26`
- **chain** — Chain of function calls leading to a particular point `types.ts:299-299`
- **close** — Returns the close shape for a decision point based on its type `condition-analyzer.ts:567-567`
- **code** — Represents the code for the trace flow `types.ts:146-146`
- **code** — Code snippet or identifier for a specific code block `types.ts:263-263`
- **code** — Represents the code being analyzed `types.ts:385-385`
- **code** — The code snippet or identifier where a state is used `types.ts:465-465`
- **code** — Code snippet associated with a decision point `types.ts:561-561`
- **cognitive** — Type of action in a trace step `types.ts:630-630`
- **combinations** — Stores combinations of behavior types for data flow analysis `data-flow-analyzer.ts:397-397`
- **combinations** — Represents combinations of behaviors in the code flow `types.ts:426-426`
- **complexity** — Type of action in a trace step `types.ts:628-631`
- **condition** — Represents a condition in the analysis `condition-analyzer.ts:293-293`, `condition-analyzer.ts:313-313`
- **condition** — Analyzes branching conditions, guards, and decision points `condition-analyzer.ts:390-390`
- **condition** — Evaluates conditions for data flow analysis `data-flow-analyzer.ts:401-401`
- **condition** — Node condition `graphology-path-builder.ts:39-39`, `graphology-path-builder.ts:40-40`
- **condition** — Condition string for branch annotations `graphology-path-builder.ts:69-69`
- **condition** — Represents a conditional statement in the trace flow `types.ts:124-124`
- **condition** — Condition that must be met for a trace to occur `types.ts:259-259`, `types.ts:271-271`
- **condition** — Represents a logical condition in the code flow `types.ts:380-380`
- **condition** — Condition associated with a decision point `types.ts:547-547`
- **condition** — Type of action in a trace step `types.ts:620-620`, `types.ts:621-621`
- **conditionalHint** — Property indicating conditional hint in the NodeFlowContext `trace-engine.ts:59-59`
- **conditionCount** — Count of conditional paths in the current traversal `path-builder.ts:48-48`
- **conditionCount** — Counts the number of conditional paths in the graph traversal `path-builder.ts:356-356`, `path-builder.ts:421-421`, `path-builder.ts:429-429`
- **conditionCount** — Type of decision point `types.ts:602-602`
- **conditions** — Array of conditions for a variable dependency `condition-trace.ts:26-26`
- **conditions** — Stores an array of conditions `condition-types.ts:74-74`
- **conditions** — Represents conditions in the trace flow `types.ts:148-148`
- **conditionsSummary** — Offers a summary of conditions in the trace `types.ts:204-204`
- **confidence** — Confidence level of the reducer-selector connection `ngrx-resolution.ts:28-28`
- **confidence** — The confidence level of the flow path `ngrx-trace-engine.ts:57-57`
- **confidence** — Represents the confidence level for a trace result `types.ts:158-158`
- **conflicts** — Represents conflicts in code flow analysis `types.ts:509-509`
- **contradictions** — Contains an array of contradictions `condition-types.ts:75-75`
- **controlFlow** — Node control flow information `graphology-path-builder.ts:37-44`
- **controlFlow** — Type of decision point `types.ts:619-624`
- **critical** — Represents critical conditions in the trace flow `types.ts:176-176`
- **criticalConditions** — Represents critical conditions in the trace flow `types.ts:188-188`
- **criticalConditions** — Represents critical conditions in the code flow `types.ts:399-399`
- **criticalDecisions** — Represents critical decisions in the code flow `types.ts:433-433`
- **criticalPoints** — Counts the number of critical decision points in the analysis `condition-analyzer.ts:469-469`
- **criticalPoints** — Type of decision point `types.ts:581-581`
- **currentPath** — Current path being traversed `path-builder.ts:53-53`
- **currentRels** — Current relationships being traversed `path-builder.ts:54-54`
- **currentValue** — Current value of a variable or state `types.ts:275-275`
- **cyclomatic** — Type of action in a trace step `types.ts:629-629`
- **data** — The internal data array of the BitSet `reaching-definitions.ts:46-46`
- **dataDepends** — Data dependencies of a decision point `types.ts:557-557`
- **dataFlows** — Represents the data flows in the code flow `types.ts:423-423`
- **dataSources** — Lists data sources for data flow analysis `types.ts:356-356`
- **dataSourcesAnalyzed** — Represents the data sources analyzed in the code flow `types.ts:430-430`
- **dbLoaded** — A boolean indicating whether the usage count has been loaded from the database `graph-cache.ts:30-30`
- **deadBranches** — Keeps track of the number of dead branches in the control flow graph `condition-types.ts:76-76`
- **decisionPointCache** — Caches decision points for efficient retrieval `condition-analyzer.ts:37-37`
- **decisionPoints** — Type of decision point `types.ts:573-573`
- **definitions** — An array of definitions `reaching-definitions.ts:32-32`
- **depth** — Represents the depth of a node in the graph `graphology-path-builder.ts:777-777`, `graphology-path-builder.ts:778-778`, `graphology-path-builder.ts:784-784`, `graphology-path-builder.ts:785-785`
- **depth** — Indicates the depth of a node in the graph traversal `graphology-path-builder.ts:792-792`, `graphology-path-builder.ts:920-920`, `graphology-path-builder.ts:937-937`
- **depth** — Represents the depth of the NgRx flow trace `ngrx-trace-engine.ts:156-156`
- **depth** — Depth of the current traversal `path-builder.ts:46-46`, `path-builder.ts:92-92`
- **depth** — Tracks the current depth in the graph traversal `path-builder.ts:146-146`
- **depth** — Represents the depth of a node in a tree structure `types.ts:239-239`
- **description** — Description of the side effect `graphology-path-builder.ts:78-78`
- **description** — A description of the step `ngrx-trace-engine.ts:49-49`
- **description** — A description of a state or scenario `types.ts:489-489`
- **dfs** — Defines a function to perform depth-first search on a node with specified depth, weight, and condition count `path-builder.ts:56-56`
- **diagnosis** — Provides a diagnosis of a code issue `types.ts:340-340`
- **directEffects** — Parses state usages to count direct and indirect effects `state-tracker.ts:409-409`
- **directEffects** — Indicates direct effects of a decision point `types.ts:512-512`
- **dispatched** — Indicates actions that have been dispatched `ngrx-trace-engine.ts:87-87`
- **dispatched** — Indicates an action has been dispatched `ngrx-trace-engine.ts:370-370`
- **documentation** — Represents documentation for the trace flow `types.ts:144-144`
- **edges** — Array of edges in the method's control flow graph `cfg-builder.ts:48-48`, `cfg-builder.ts:97-97`
- **edges** — Number of edges in the graph `graphology-path-builder.ts:101-101`
- **edges** — Edges in the trace flow result `output-formatter.ts:47-47`
- **edges** — Edges in the graph `trace-engine.ts:135-135`
- **edges** — Represents the number of edges in the graph `types.ts:213-213`
- **effects** — Effects of a decision point `types.ts:553-553`
- **enabledFeatures** — Features that are enabled in the current state `types.ts:479-479`
- **entity** — Entity identifier in the trace `graphology-path-builder.ts:61-61`
- **entity** — Represents an entity in the graph `path-builder.ts:643-643`, `path-builder.ts:651-651`
- **entity** — Represents the entity name in the trace step `types.ts:112-112`
- **entityId** — Entity ID for semantic search results `data-flow-analyzer.ts:26-26`
- **entityId** — Unique identifier for the entity `graphology-path-builder.ts:62-62`
- **entityId** — The ID of the entity associated with the step `ngrx-trace-engine.ts:44-44`
- **entityId** — Identifies an entity in the NgRx flow `ngrx-trace-engine.ts:153-153`
- **entityId** — Property representing the entity ID in the NodeFlowContext `trace-engine.ts:34-34`, `trace-engine.ts:54-54`
- **entityId** — Represents the unique identifier of an entity `types.ts:114-114`
- **entityId** — Unique identifier for an entity `types.ts:253-253`
- **entityId** — Identifies an entity uniquely `types.ts:327-327`
- **entityIds** — Type of decision point `types.ts:596-596`
- **entityName** — The name of the entity associated with the step `ngrx-trace-engine.ts:43-43`
- **entityName** — The name of an entity or code element `types.ts:467-467`
- **entryId** — ID of the entry node in the method's control flow graph `cfg-builder.ts:49-49`
- **entryPoint** — Entry point of a function or method `types.ts:305-305`
- **entryPoint** — Specifies the entry point for data flow analysis `types.ts:352-352`
- **entryPoint** — Represents the starting point of the code flow `types.ts:419-419`
- **entryPoints** — Identifies entry points in the graph `graphology-path-builder.ts:777-777`
- **entryPoints** — Entry points for the analysis `types.ts:571-571`
- **exceptions** — Node exceptions information `graphology-path-builder.ts:42-42`
- **exceptions** — Type of action in a trace step `types.ts:623-623`
- **existenceDeps** — Array of variable dependencies indicating existence `condition-trace.ts:34-34`
- **exitId** — ID of the exit node in the method's control flow graph `cfg-builder.ts:50-50`
- **file** — Node file `graphology-path-builder.ts:34-34`
- **file** — File path where the entity is located `graphology-path-builder.ts:63-63`, `types.ts:255-255`
- **file** — Stores the file path associated with a node or edge `graphology-path-builder.ts:367-367`
- **file** — Represents the file where a node or edge is located `graphology-path-builder.ts:777-777`, `graphology-path-builder.ts:784-784`
- **file** — The file where the step is defined `ngrx-trace-engine.ts:45-45`
- **file** — Stores the name of the file associated with an entity `types.ts:116-116`
- **file** — References the file where an entity is defined `types.ts:328-328`
- **file** — Type of decision point `types.ts:571-571`, `types.ts:612-612`
- **flow** — Represents the sequence of data flow steps `types.ts:395-395`
- **flowDiagram** — Type of decision point `types.ts:575-577`
- **format** — The output format for the trace `ngrx-trace-engine.ts:76-76`
- **format** — Determines the format of the trace output `types.ts:88-88`
- **forward** — Type of action in a trace step `types.ts:641-641`
- **found** — Found status in the trace `graphology-path-builder.ts:88-88`
- **found** — Indicates whether a node was found `types.ts:216-216`
- **from** — Source node ID of the edge `cfg-builder.ts:41-41`
- **from** — The starting point for the trace `ngrx-trace-engine.ts:68-68`
- **from** — Specifies the starting point of the NgRx flow trace `ngrx-trace-engine.ts:83-83`
- **from** — Starting point (semantic search query or entity name) `types.ts:78-78`, `types.ts:98-98`, `types.ts:196-196`
- **fromCondition** — Represents the CFG node ID from which the narrowing originates `condition-types.ts:69-69`
- **getProjectContext** — Extracts the ProjectContext from the storage `graph-cache.ts:39-39`, `graph-cache.ts:48-48`
- **getProjectContext** — Retrieves the project context `graphology-path-builder.ts:189-189`, `graphology-path-builder.ts:190-190`
- **graph** — Represents the graph structure `graphology-path-builder.ts:146-146`
- **graph** — Adjacency graph for efficient traversal `path-builder.ts:55-55`
- **graphologyBuilder** — Builder for graphology `trace-engine.ts:99-99`
- **graphStats** — Contains statistics about the graph, including nodes, edges, load time, and memory usage `types.ts:213-213`
- **groupBy** — Groups decision points by a specific criterion `types.ts:533-533`
- **guards** — Represents guard conditions in the trace flow `types.ts:184-184`
- **guards** — Guards that must be met for a trace to occur `types.ts:301-301`
- **handled** — Indicates actions that have been handled `ngrx-trace-engine.ts:88-88`
- **handled** — Indicates an action has been handled `ngrx-trace-engine.ts:371-371`
- **hasConditionalLogic** — Property indicating whether the node has conditional logic `trace-engine.ts:58-58`
- **hasTransformation** — Indicates whether a transformation is present `trace-engine.ts:57-57`
- **id** — Unique identifier for a node `cfg-builder.ts:32-32`
- **id** — Represents an identifier for a node or edge `graphology-path-builder.ts:367-367`, `graphology-path-builder.ts:777-777`, `graphology-path-builder.ts:778-778`, `graphology-path-builder.ts:784-784`, `graphology-path-builder.ts:785-785`
- **id** — Represents the unique identifier for a node in the graph `graphology-path-builder.ts:792-792`, `graphology-path-builder.ts:920-920`, `graphology-path-builder.ts:937-937`
- **id** — The unique identifier for the flow path `ngrx-trace-engine.ts:56-56`
- **id** — Not present in the provided code `path-builder.ts:92-92`
- **id** — Represents a unique identifier for a graph node `path-builder.ts:146-146`
- **id** — Represents an identifier for a trace element `types.ts:156-156`
- **id** — Unique identifier for a decision point `types.ts:541-541`
- **id** — Type of decision point `types.ts:609-609`
- **impact** — Impact level of a decision point `types.ts:555-555`
- **includeActions** — Whether to include intermediate action details `ngrx-trace-engine.ts:74-74`
- **includeConditional** — Type of action in a trace step `types.ts:659-659`
- **includeEffects** — Indicates whether effects are included in the trace `types.ts:243-243`
- **includeEffects** — Includes effects in the analysis `types.ts:531-531`
- **includeGuards** — Includes guards in the analysis `types.ts:529-529`
- **includeStates** — Indicates whether state changes are included in the trace `types.ts:241-241`
- **incoming** — Represents incoming relationships to a graph node `path-builder.ts:147-147`
- **incoming** — Type of decision point `types.ts:617-617`
- **indirectEffects** — Parses state usages to count direct and indirect effects `state-tracker.ts:409-409`
- **indirectEffects** — Represents indirect effects of a decision point `types.ts:513-513`
- **input** — Represents the input to a step in data flow analysis `types.ts:372-372`
- **inputs** — Represents the inputs to the code flow `types.ts:407-407`
- **inputTypes** — Stores an array of input types `trace-engine.ts:55-55`
- **isAwait** — Indicates whether a node is an await node `path-builder.ts:286-286`
- **isAwait** — Type of action in a trace step `types.ts:626-626`
- **isMutation** — Indicates whether the state change is a mutation `types.ts:102-102`
- **kind** — Enum representing variable dependencies — existence, value, or unconditional `condition-trace.ts:25-25`
- **kind** — The kind of variable definition `reaching-definitions.ts:28-28`
- **label** — A label or identifier for a state or scenario `types.ts:450-450`
- **likelihood** — Likelihood of a trace occurring `types.ts:303-303`
- **limit** — Limit parameter for semantic search `data-flow-analyzer.ts:26-26`
- **limit** — Constant for limiting search results `trace-engine.ts:34-34`
- **line** — Node line number `graphology-path-builder.ts:35-35`
- **line** — Line number in the file where the entity is located `graphology-path-builder.ts:64-64`, `types.ts:257-257`
- **line** — The line number in the file where the step is defined `ngrx-trace-engine.ts:46-46`
- **line** — Indicates the line number within the file where the entity is defined `types.ts:118-118`
- **line** — Type of decision point `types.ts:613-613`
- **linearTraceSummary** — Provides a summary of the linear trace `types.ts:214-214`
- **loaded** — Indicates whether the graph is loaded `graphology-path-builder.ts:147-147`
- **loadedEdgeTypes** — Stores the types of edges that have been loaded `graphology-path-builder.ts:148-148`
- **loadStats** — Tracks statistics related to loading the graph `graphology-path-builder.ts:149-149`
- **loadTimeMs** — Time taken to load the graph in milliseconds `graphology-path-builder.ts:102-102`
- **loadTimeMs** — Load time in milliseconds `trace-engine.ts:135-135`
- **loadTimeMs** — Stores the load time of the graph in milliseconds `types.ts:213-213`
- **location** — Location in the code where the trace occurs `types.ts:273-273`
- **location** — Specifies the location of a step in data flow analysis `types.ts:368-368`
- **location** — The location or position in the code where a state is used `types.ts:461-461`, `types.ts:491-491`
- **location** — Location of a decision point in the code `types.ts:543-543`
- **loops** — Node loops information `graphology-path-builder.ts:40-40`
- **loops** — Type of action in a trace step `types.ts:621-621`
- **maxDepth** — The maximum depth of the trace `ngrx-trace-engine.ts:72-72`
- **maxDepth** — Specifies the maximum depth for backward analysis `types.ts:86-86`
- **maxDepth** — Type of action in a trace step `types.ts:653-653`
- **maxPaths** — Type of action in a trace step `types.ts:655-655`
- **memoryMB** — Represents the memory usage in megabytes `graphology-path-builder.ts:103-103`
- **memoryMB** — Stores the memory usage of the graph in megabytes `types.ts:213-213`
- **mermaid** — Outputs the NgRx flow trace in Mermaid format `ngrx-trace-engine.ts:91-91`
- **mermaid** — Optionally stores a Mermaid diagram string `types.ts:206-206`
- **mermaid** — Type of decision point `types.ts:576-576`
- **metadata** — Node metadata `graphology-path-builder.ts:36-36`
- **metadata** — Node attributes in graphology graph `graphology-path-builder.ts:53-53`
- **minSimilarity** — Minimum similarity threshold for semantic search `data-flow-analyzer.ts:26-26`
- **minSimilarity** — Constant for minimum similarity threshold `trace-engine.ts:34-34`
- **modified** — Represents whether a trace element has been modified `types.ts:172-172`
- **modifiedBy** — Entity or user that modified the state `types.ts:287-287`
- **mostLikely** — Indicates the most likely cause of a code issue `types.ts:317-317`
- **name** — Represents the name of the entity being analyzed `data-flow-analyzer.ts:369-369`, `data-flow-analyzer.ts:370-370`
- **name** — Node name `graphology-path-builder.ts:32-32`
- **name** — Represents the name of a node or edge `graphology-path-builder.ts:777-777`, `graphology-path-builder.ts:778-778`, `graphology-path-builder.ts:784-784`, `graphology-path-builder.ts:785-785`
- **name** — Represents the name of a graph node `path-builder.ts:286-286`
- **name** — Extracts the name from a call object `state-tracker.ts:158-158`
- **name** — Filters usages to find assignments `state-tracker.ts:288-288`
- **name** — Name of an entity or function `types.ts:251-251`
- **name** — Represents the name of an entity `types.ts:326-326`
- **name** — Type of action in a trace step `types.ts:571-571`, `types.ts:610-610`, `types.ts:626-626`
- **narrowedTo** — Represents the type to which the variable is narrowed `condition-types.ts:68-68`
- **narrowedTypes** — Holds an array of narrowed types `condition-types.ts:77-77`
- **negated** — Indicates whether the condition is negated `condition-types.ts:53-53`
- **nextId** — Next available ID for a new node `cfg-builder.ts:98-98`
- **nodeCache** — Cache for graph nodes `path-builder.ts:66-66`
- **nodeIdToIdx** — A map from CFG node IDs to indices in reachingIn and reachingOut arrays `reaching-definitions.ts:38-38`
- **nodes** — Array of nodes in the method's control flow graph `cfg-builder.ts:47-47`, `cfg-builder.ts:96-96`
- **nodes** — Number of nodes in the graph `graphology-path-builder.ts:100-100`
- **nodes** — Nodes in the trace flow result `output-formatter.ts:47-47`
- **nodes** — Nodes in the graph `trace-engine.ts:135-135`
- **nodes** — Represents the number of nodes in the graph `types.ts:213-213`
- **nodes** — Type of action in a trace step `types.ts:639-639`
- **nodesVisited** — Nodes visited in the trace `graphology-path-builder.ts:91-91`
- **nodesVisited** — Counts the number of nodes visited `types.ts:215-215`
- **open** — Returns the open shape for a decision point based on its type `condition-analyzer.ts:567-567`
- **operator** — Represents the comparison operator in a condition `condition-types.ts:51-51`
- **order** — Step order in the trace `graphology-path-builder.ts:60-60`
- **order** — The order of the step in the flow `ngrx-trace-engine.ts:41-41`
- **order** — Represents the order of the trace step `types.ts:110-110`
- **outcomes** — Outcomes of a decision point `types.ts:551-551`
- **outgoing** — Represents outgoing relationships from a graph node `path-builder.ts:147-147`
- **outgoing** — Type of decision point `types.ts:615-615`
- **output** — Represents the final result of a trace flow analysis `types.ts:374-374`
- **outputType** — Property representing output type in the NodeFlowContext `trace-engine.ts:56-56`
- **paramMutationCount** — Count of parameter mutations in the data flow `data-flow-analyzer.ts:220-220`
- **path** — Represents a path in the NgRx flow `ngrx-trace-engine.ts:154-154`
- **path** — Represents a path in the graph traversal `path-builder.ts:353-353`, `path-builder.ts:418-418`, `path-builder.ts:426-426`
- **path** — Represents the path taken in the code flow `types.ts:411-411`
- **pathBuilder** — Builder for path in graphology `trace-engine.ts:98-98`
- **pathFeasibility** — Represents the feasibility of a path in the control flow graph `condition-types.ts:73-73`
- **paths** — Stores the paths traced in the NgRx flow `ngrx-trace-engine.ts:85-85`
- **paths** — Contains an array of trace paths `types.ts:200-200`
- **possibleOutcomes** — Calculates the total number of possible outcomes from decision points `condition-analyzer.ts:470-470`
- **possibleOutcomes** — Represents the possible outcomes of the code flow `types.ts:432-432`
- **possibleOutcomes** — Type of decision point `types.ts:582-582`
- **possibleReasons** — Lists possible reasons for a code issue `types.ts:313-313`
- **postconditions** — Represents the conditions that must be met after a trace step `types.ts:142-142`
- **preconditions** — Represents the conditions that must be met before a trace step `types.ts:140-140`
- **probability** — Probability of the branch `graphology-path-builder.ts:71-71`
- **probability** — Represents the probability of a node being called `graphology-path-builder.ts:778-778`, `graphology-path-builder.ts:785-785`
- **probability** — Represents the probability of a path `path-builder.ts:643-643`, `path-builder.ts:651-651`
- **probability** — Probability that a call will occur `types.ts:261-261`
- **question** — Represents a backwards question `types.ts:237-237`
- **reachablePaths** — Paths that can be reached from a given state `types.ts:475-475`
- **reachingIn** — A bitset array representing definitions reaching in to each CFG node `reaching-definitions.ts:34-34`
- **reachingOut** — A bitset array representing definitions reaching out from each CFG node `reaching-definitions.ts:36-36`
- **read** — Represents whether a trace element has been read `types.ts:174-174`
- **reason** — Represents the reason for the contradiction `condition-types.ts:63-63`
- **recommendation** — Recommendation or suggestion for improving the code `types.ts:277-277`
- **recommendation** — A recommendation or suggestion for resolving a state or scenario issue `types.ts:495-495`
- **reducerId** — Identifier for a reducer `ngrx-resolution.ts:26-26`
- **relationships** — Represents relationships between nodes in the graph `path-builder.ts:354-354`, `path-builder.ts:419-419`, `path-builder.ts:427-427`
- **relationships** — Type of decision point `types.ts:598-598`
- **requiredValue** — Required value for a state or condition `types.ts:289-289`
- **resolveEntityCache** — Resolves entity cache `trace-engine.ts:103-103`
- **result** — Represents the result of a trace flow analysis `types.ts:409-409`
- **rippleEffects** — Describes the ripple effects of a decision point `types.ts:511-515`
- **risk** — The risk associated with a state or scenario `types.ts:493-493`
- **scenario** — Defines a scenario for analysis `types.ts:527-527`, `types.ts:569-569`
- **scenarioAnalysis** — The analysis of a scenario `types.ts:507-507`
- **scenarios** — A collection of scenarios to analyze `types.ts:448-451`
- **scope** — The scope or context in which a state or scenario is analyzed `types.ts:453-453`
- **selectorId** — Identifier for a feature selector `ngrx-resolution.ts:27-27`
- **semanticSearch** — Optional semantic search service for the data flow analyzer `data-flow-analyzer.ts:60-60`
- **semanticSearch** — Interface for semantic search service `trace-engine.ts:97-97`
- **sideEffects** — External influences (state, effects) `graphology-path-builder.ts:75-80`
- **signature** — Describes the signature of a function or method `types.ts:329-329`
- **size** — The size of the BitSet `reaching-definitions.ts:47-47`
- **source** — Identifies the source of data in the codebase `data-flow-analyzer.ts:401-401`
- **source** — Indicates the origin of the data flow `types.ts:393-393`
- **sourceEnd** — End index of the source line for the node `cfg-builder.ts:37-37`
- **sourceEntityId** — Stores the unique identifier of the source entity `types.ts:209-209`
- **sourceEntityName** — Stores the name of the source entity `types.ts:210-210`
- **sourceFile** — File path where the variable is defined `condition-trace.ts:28-28`
- **sourceLine** — Line number where the variable is defined `condition-trace.ts:27-27`
- **sourceLine** — Represents the source line number where the condition is located `condition-types.ts:55-55`
- **sourceLine** — The source line number where a variable is defined `reaching-definitions.ts:27-27`
- **sourceStart** — Start index of the source line for the node `cfg-builder.ts:35-35`
- **state** — State of the system at a particular point in time `types.ts:285-285`
- **state** — Represents the current state of the system `types.ts:446-446`, `types.ts:503-503`
- **stateChanges** — Tracks changes in the state during the NgRx trace `ngrx-trace-engine.ts:89-89`
- **stateChanges** — Tracks changes in the state during an NgRx flow `ngrx-trace-engine.ts:372-372`
- **stateChanges** — Represents changes in the state during the trace flow `types.ts:130-130`
- **stateChanges** — Changes in the state that occur during analysis `types.ts:481-481`
- **stateProperty** — The state property associated with the step `ngrx-trace-engine.ts:48-48`
- **statesDependencies** — Tracks dependencies on states `types.ts:336-336`
- **statesModified** — Stores the list of states modified by decision points `condition-analyzer.ts:471-471`
- **statesModified** — Type of decision point `types.ts:583-583`
- **statesSummary** — Provides a summary of states in the trace `types.ts:202-202`
- **stateTracker** — State tracker for the data flow analyzer `data-flow-analyzer.ts:61-61`
- **stateType** — Type of state (e.g., boolean, number, string) `types.ts:291-291`
- **step** — Represents a step in data flow analysis `types.ts:366-366`
- **steps** — Represents steps in the analysis process `condition-analyzer.ts:390-390`
- **steps** — Stores an array of linear trace steps for the path builder `graphology-path-builder.ts:87-87`
- **steps** — An array of steps in the flow path `ngrx-trace-engine.ts:58-58`
- **steps** — Represents steps in the trace flow `types.ts:160-160`
- **storage** — Stores graph data for analysis `condition-analyzer.ts:36-36`
- **storage** — Graph storage for the data flow analyzer `data-flow-analyzer.ts:59-59`
- **storage** — Stores graph data `graphology-path-builder.ts:145-145`
- **storage** — Manages the storage of trace data `ngrx-trace-engine.ts:99-99`
- **storage** — Graph storage for the path builder `path-builder.ts:64-64`
- **storage** — Stores graph data for state tracking `state-tracker.ts:39-39`
- **storage** — Constant for graph storage `trace-engine.ts:96-96`
- **success** — Boolean indicating if the analysis was successful `condition-trace.ts:33-33`
- **suggestedDebugPoints** — Suggests points to debug a code issue `types.ts:315-315`
- **summary** — Summary of the trace `graphology-path-builder.ts:89-89`
- **summary** — A summary of the flow path `ngrx-trace-engine.ts:59-59`
- **summary** — Represents a summary of the trace flow `types.ts:162-162`
- **summary** — Represents a summary of the code flow analysis `types.ts:429-434`
- **summary** — Type of decision point `types.ts:579-584`
- **target** — Represents a target in the analysis `condition-analyzer.ts:293-293`, `condition-analyzer.ts:313-313`
- **target** — Node target `graphology-path-builder.ts:39-39`, `graphology-path-builder.ts:41-41`
- **target** — Target string for branch annotations `graphology-path-builder.ts:70-70`
- **target** — Represents the target node in a graph relationship `path-builder.ts:286-286`
- **target** — Extracts the target from a call object `state-tracker.ts:158-158`
- **target** — Represents the target string `types.ts:235-235`
- **target** — Specifies the target entity for analysis `types.ts:325-330`
- **target** — Type of decision point `types.ts:620-620`, `types.ts:622-622`, `types.ts:626-626`
- **targetEntityId** — Stores the unique identifier of the target entity `types.ts:211-211`
- **targetEntityName** — Represents the name of the target entity `types.ts:212-212`
- **targetState** — Identifies the target state for data flow analysis `types.ts:354-354`
- **targetState** — Represents the state the code flow aims to reach `types.ts:421-421`
- **timeMs** — Time taken in milliseconds `graphology-path-builder.ts:93-93`
- **timeMs** — Represents the time in milliseconds for a node or edge `graphology-path-builder.ts:779-779`
- **timeMs** — Stores the time taken in milliseconds `types.ts:217-217`
- **to** — Destination node ID of the edge `cfg-builder.ts:42-42`
- **to** — The ending point for the trace `ngrx-trace-engine.ts:70-70`
- **to** — Specifies the ending point of the NgRx flow trace `ngrx-trace-engine.ts:84-84`
- **to** — Ending point (semantic search query or entity name) `types.ts:80-80`, `types.ts:100-100`, `types.ts:198-198`
- **totalDecisionPoints** — Counts the total number of decision points in the analysis `condition-analyzer.ts:468-468`
- **totalDecisionPoints** — Type of decision point `types.ts:580-580`
- **totalDefs** — Total number of variable definitions found `condition-trace.ts:37-37`
- **trackConditions** — Indicates whether to track conditions `types.ts:84-84`
- **trackStates** — Indicates whether to track state changes `types.ts:82-82`
- **trackTransformations** — Tracks transformations in data flow analysis `types.ts:358-358`
- **transformation** — Describes the process of changing data from one form to another `types.ts:376-376`
- **triggeredBy** — Triggers of a decision point `types.ts:559-559`
- **type** — Type of the node `cfg-builder.ts:33-33`, `cfg-builder.ts:43-43`
- **type** — Node type `graphology-path-builder.ts:33-33`, `graphology-path-builder.ts:40-40`, `graphology-path-builder.ts:42-42`, `graphology-path-builder.ts:51-51`
- **type** — Type of side effect `graphology-path-builder.ts:77-77`
- **type** — The type of the step in the flow `ngrx-trace-engine.ts:42-42`
- **type** — Type of a decision point `types.ts:545-545`
- **type** — Type of decision point `types.ts:611-611`
- **type** — Type of action in a trace step `types.ts:621-621`, `types.ts:623-623`
- **unconditionalDefs** — Array of variable dependencies indicating unconditional assignment `condition-trace.ts:36-36`
- **unsafeCastCount** — Count of unsafe casts in the data flow `data-flow-analyzer.ts:233-233`
- **usage** — The usage or application of a state in the code `types.ts:463-463`
- **usageCount** — The count of trace usage for a project `graph-cache.ts:28-28`
- **usages** — The usages or applications of a state in the code `types.ts:505-505`
- **useOptimized** — Boolean indicating optimized mode `trace-engine.ts:100-100`
- **value** — Represents the value in a condition `condition-types.ts:52-52`
- **value** — The value associated with a state or scenario `types.ts:449-449`
- **valueDeps** — Array of variable dependencies indicating value `condition-trace.ts:35-35`
- **variable** — Represents the variable in a condition `condition-types.ts:50-50`, `condition-types.ts:67-67`
- **variable** — A variable name in a definition `reaching-definitions.ts:25-25`
- **variable** — Represents the variable name in a state change `types.ts:96-96`
- **warnings** — Represents warnings related to the trace flow `types.ts:164-164`
- **weight** — Edge weight `graphology-path-builder.ts:52-52`
- **weight** — Weight of the current traversal `path-builder.ts:47-47`
- **weight** — Represents the weight of a path in the graph traversal `path-builder.ts:355-355`, `path-builder.ts:420-420`, `path-builder.ts:428-428`
- **weight** — Type of decision point `types.ts:600-600`
- **weights** — Type of action in a trace step `types.ts:645-645`
- **weightThreshold** — Defines the threshold weight for a node in a tree structure `types.ts:661-661`

## Dependencies

### External Libraries

| Dependency | Purpose |
|------------|---------|
| `graphology` | In-memory graph library for optimized O(V+E) path traversal and batch operations. |
| `graphology-shortest-path` | Bidirectional shortest-path algorithm for efficient forward/backward analysis. |

### Internal Dependencies

| Dependency | Purpose | Location |
|------------|---------|----------|
| `GraphStorage` | Core entity/relationship graph interface; provides node and edge access. | `src/types/storage.ts` |
| `Entity`, `Relationship`, `RelationType` | Storage types defining code entities and their relationships. | `src/types/storage.ts` |
| `logging` | Debug and info logging service for trace operations. | ~~`src/logging/index.js`~~ (deleted) |
| `SemanticSearchService` | Optional service for entity resolution via semantic similarity when exact matches fail. | `src/semantic/...` |

## Configuration & Constants

### Optimization Settings

| Parameter | Default | Purpose |
|-----------|---------|---------|
| `useOptimized` | `true` | Enable graphology-based fast path builder instead of BFS fallback. |
| `maxDepth` | 15 | Maximum traversal depth to prevent infinite cycles and bound complexity. |
| `maxPaths` | 5–10 | Maximum execution paths returned per analysis (engine: 5, builder: 10). |
| `CONDITION_WEIGHT` | 0.3 | Path score penalty for conditional branches; lowers confidence. |
| `CALL_WEIGHT` | 0.1 | Path score penalty for inter-function calls. |
| `ASYNC_WEIGHT` | 0.2 | Path score penalty for async boundaries (promises, async/await). |
| `minSimilarity` | 0.6 | Semantic search threshold for fuzzy entity resolution. |

### Pattern Recognition

| Pattern | Purpose |
|---------|---------|
| Guard patterns: `/^if\s*\([^)]+\)\s*(return\|throw)/` | Detects early-exit guards. |
| Validation patterns: `/valid\|check\|verify\|assert/i` | Identifies validation logic. |
| Setter patterns: `/^set[A-Z]/` | Recognizes state setters. |
| Getter patterns: `/^get[A-Z]/` | Recognizes state getters. |
| Boolean patterns: `/^(is\|has\|should\|can\|will)[A-Z]/` | Identifies boolean properties. |

## Key Behavioral Properties

- **Entity Resolution**: Supports file-qualified format (`src/file.ts:symbol`); falls back through exact name match → suffix match → partial match → semantic search; excludes external/import stubs; prioritizes real code definitions.
- **Graph Caching**: `PathBuilder` caches adjacency graphs keyed by `${nodeIds}:${maxDepth}`; processes nodes in batches of 16 for efficiency; `GraphologyPathBuilder` loads full graph once and reuses for subsequent calls.
- **State Classification**: `StateTracker` uses regex patterns to classify entities (setter, getter, boolean) and tracks property mutations with change history.
- **Condition Detection**: `ConditionAnalyzer` identifies guards (if-return), validation (valid/verify), and caches decision points per scenario to avoid reanalysis.
- **Data Source Classification**: `DataFlowAnalyzer` categorizes sources (API, storage, props, state, config, user_input) and transformations (parse, map, validate, normalize, merge) via regex matching.
- **Optimized vs. Fallback Mode**: Optimized mode (default) loads graphology graph once; fallback uses BFS/DFS with caching; both produce identical results, optimized is 5–10x faster for batch operations.

## Error Handling

- **Unresolvable Entities**: `TraceEngine` throws `Error("Could not find source/target entity: ${name}")` when source or target cannot be resolved through all fallback strategies.
- **Data Flow Resolution**: `DataFlowAnalyzer` throws errors when entry point or target state is unresolvable; includes available entity suggestions in error message.
- **Circular Dependencies**: Both `PathBuilder` and `GraphologyPathBuilder` detect cycles and mark edges as circular; traced paths halt at cycle detection to prevent infinite output.
- **Empty Results**: Analysis methods return empty arrays (not errors) when no paths/decisions/flows are found, allowing downstream consumers to handle no-result cases gracefully.
