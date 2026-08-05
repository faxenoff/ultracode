# Graph Metrics

## 🤖 Overview

The `graph-metrics-analyzer.ts` module computes various graph metrics, including betweenness centrality using the Brandes algorithm. It is used by data scientists and network analysts to understand the structure and dynamics of complex networks.

The `metrics-formatter.ts` module formats the computed metrics into a structured JSON format, making it easier to process and visualize the results. It is used by developers and data engineers to integrate the metrics into applications and tools.

## 🤖 Architecture

```
graph-metrics-analyzer
├── brandes.ts — Implements Brandes algorithm for betweenness centrality
├── graph-metrics-analyzer.ts — Main entry point for graph metrics computation
├── metrics-formatter.ts — Formats metrics into JSON
└── types.ts — Defines types and interfaces for graph metrics
```

## 🤖 Flow

```
graph-metrics-analyzer
├── brandes.ts — Computes betweenness centrality
│   └── graph-metrics-analyzer.ts — Uses Brandes result to compute other metrics
│       └── metrics-formatter.ts — Formats metrics into JSON
└── types.ts — Provides types for graph metrics
```

## 🤖 Entity Listing

### Function
- **allScores** — Extracts scores from entries `graph-metrics-analyzer.ts:103-103`
- **authors** — Sorts authors by the number of lines they contributed `graph-metrics-analyzer.ts:307-307`
- **authors** — Maps author names and emails to the number of files they contributed `graph-metrics-analyzer.ts:363-363`
- **authors** — Sorts authors by the number of files they contributed in descending order `graph-metrics-analyzer.ts:364-364`
- **authorsWithPct** — Maps authors to include their contribution percentage `graph-metrics-analyzer.ts:310-315`
- **computeBetweenness** — Computes betweenness centrality for all nodes in a directed graph using Brandes' algorithm `brandes.ts:31-137`
- **entityIds** — Creates a set of entity IDs from entities `graph-metrics-analyzer.ts:164-164`
- **limitedCommunities** — Limits communities and their entities `graph-metrics-analyzer.ts:190-197`
- **mainFiles** — Sorts and maps file names from a list `graph-metrics-analyzer.ts:159-159`
- **mainFiles** — Maps file names from a list `graph-metrics-analyzer.ts:161-161`
- **mean** — Calculates the mean of all scores `graph-metrics-analyzer.ts:104-104`
- **sorted** — Sorts all scores in ascending order `graph-metrics-analyzer.ts:105-105`
- **topAuthors** — Maps author details to their contribution percentage and sorts them by the number of files contributed `graph-metrics-analyzer.ts:388-393`
- **topAuthors** — Sorts top authors by the number of files contributed in descending order `graph-metrics-analyzer.ts:394-394`
- **totalFiles** — Calculates the total number of unique files contributed by all authors `graph-metrics-analyzer.ts:366-366`
- **totalLines** — Calculates the total number of lines contributed by authors `graph-metrics-analyzer.ts:308-308`
- **variance** — Computes the variance of all scores `graph-metrics-analyzer.ts:108-108`

### Method
- **analyze** — Analyzes graph metrics based on provided parameters `graph-metrics-analyzer.ts:39-72`
- **computeBusFactor** — Computes bus factor metrics for a project `graph-metrics-analyzer.ts:251-416`
- **computeCentrality** — Computes centrality metrics for a graph `graph-metrics-analyzer.ts:208-249`
- **computeLouvain** — Computes Louvain community detection results `graph-metrics-analyzer.ts:119-206`
- **computePageRank** — Computes PageRank scores for graph nodes `graph-metrics-analyzer.ts:74-117`
- **constructor** — Initializes the GraphMetricsAnalyzer with storage and pathBuilder `graph-metrics-analyzer.ts:34-37`
- **formatAsJSON** — Serializes a graph metrics result into a JSON string `metrics-formatter.ts:30-32`
- **formatAsText** — Converts a graph metrics result into a text-based summary `metrics-formatter.ts:4-15`
- **formatBusFactor** — Formats a Bus Factor result into a text-based summary `metrics-formatter.ts:111-144`
- **formatCentrality** — Formats a Centrality result into a text-based summary `metrics-formatter.ts:91-109`
- **formatLouvain** — Formats a Louvain result into a text-based summary `metrics-formatter.ts:55-89`
- **formatPageRank** — Formats a PageRank result into a text-based summary `metrics-formatter.ts:34-53`
- **getBusFactorRisk** — Determines the risk level based on the bus factor `graph-metrics-analyzer.ts:451-456`
- **persistToEntityMetadata** — Persists graph metrics results to entity metadata `graph-metrics-analyzer.ts:418-449`
- **toSummary** — Generates a summary string for a graph metrics result `metrics-formatter.ts:17-28`

### Class
- **GraphMetricsAnalyzer** — Analyzes graph metrics based on specified parameters `graph-metrics-analyzer.ts:29-457`
- **GraphMetricsFormatter** — A class that formats graph metrics results into different representations `metrics-formatter.ts:3-145`

### Interface
- **BrandesResult** — Represents the result of computing betweenness centrality, including scores for each node, total number of nodes, and sources used `brandes.ts:15-22`
- **BusFactorFileEntry** — Represents a file entry with authors, bus factor, and risk level `types.ts:69-74`
- **BusFactorModuleEntry** — Represents a module entry with authors, bus factor, and risk level `types.ts:76-81`
- **BusFactorResult** — Represents the result of a bus factor analysis, including metric, overall bus factor, and risk level `types.ts:83-93`
- **CacheEntry** — Represents a cached result with a timestamp `graph-metrics-analyzer.ts:22-25`
- **CentralityEntry** — An interface representing an entry in a centrality analysis `types.ts:50-59`
- **CentralityResult** — An interface representing the result of a centrality analysis `types.ts:61-65`
- **GraphMetricsParams** — Parameters for graph metric calculations `types.ts:97-103`
- **LouvainCommunity** — An interface representing a community found by the Louvain algorithm, containing community details and entities `types.ts:25-38`
- **LouvainResult** — An interface representing the result of a Louvain community detection algorithm `types.ts:40-46`
- **PageRankEntry** — An interface representing a single entry in the PageRank result, containing entity details and scores `types.ts:3-11`
- **PageRankResult** — An interface representing the result of the PageRank algorithm, including metric, entries, distribution, and total nodes `types.ts:13-23`

### Type_alias
- **BusFactorRiskLevel** — An enum representing the risk level of a bus factor analysis `types.ts:67-67`
- **CentralityRole** — An enum representing the role of a node in a centrality analysis `types.ts:48-48`
- **GraphMetricsResult** — The result of a graph metric calculation, containing metric type, entries, and distribution statistics `types.ts:95-95`
- **GraphMetricType** — Represents the types of graph metrics, including page rank, louvain, centrality, and bus factor `types.ts:1-1`

### Import_decl
- **../../logging/index.js** — Imports `../../logging/index.js` from `../../logging/index.js`. `graph-metrics-analyzer.ts:2-2`
- **../../tracing/graphology-path-builder.js** — Imports `../../tracing/graphology-path-builder.js` from `../../tracing/graphology-path-builder.js`. `graph-metrics-analyzer.ts:3-3`, `graph-metrics-analyzer.ts:4-4`
- **../../types/storage.js** — Imports `../../types/storage.js` from `../../types/storage.js`. `graph-metrics-analyzer.ts:5-5`
- **./types.js** — Imports `./types.js`. `graph-metrics-analyzer.ts:6-20`
- **./types.js** — Imports `./types.js` from `./types.js`. `metrics-formatter.ts:1-1`
- **graphology** — Imports `graphology` from `graphology`. `graph-metrics-analyzer.ts:1-1`

### Property
- **_totalEntities** — The total number of entities before per-community limit was applied `types.ts:37-37`
- **authors** — Represents an array of authors in the BusFactorFileEntry `types.ts:71-71`
- **authors** — Represents an array of author objects with name, email, and files contributed `types.ts:78-78`
- **busFactor** — Represents the bus factor of a file in the BusFactorFileEntry `types.ts:72-72`
- **busFactor** — Stores a numerical value representing the bus factor `types.ts:79-79`, `types.ts:86-86`
- **byFile** — A metric calculated per file in the BusFactorFileEntry `types.ts:91-91`
- **byModule** — A metric calculated per module in the BusFactorModuleEntry `types.ts:92-92`
- **cache** — Caches results of graph metrics analysis `graph-metrics-analyzer.ts:32-32`
- **cohesion** — A measure of the internal cohesion of a Louvain community `types.ts:35-35`
- **communities** — An array of LouvainCommunity objects representing detected communities `types.ts:42-42`
- **communityId** — The unique identifier for a community `types.ts:26-26`
- **distribution** — An object containing the mean, median, max, and standard deviation of the PageRank scores `types.ts:16-21`
- **email** — Represents a map of file names to a map of author names to their email and line count `graph-metrics-analyzer.ts:274-274`
- **email** — Represents a map of author names to their email and set of files they authored `graph-metrics-analyzer.ts:304-304`
- **email** — Represents a map of module names to a map of author names to their email and set of files they authored `graph-metrics-analyzer.ts:345-345`
- **email** — Represents the email of an author in the BusFactorFileEntry `types.ts:71-71`
- **email** — An email address used in the BusFactorFileEntry `types.ts:78-78`
- **email** — Contains an array of top authors with their name, email, files contributed, and percentage `types.ts:89-89`
- **entities** — An array of entities within a community `types.ts:27-32`
- **entityId** — Represents a map of community IDs to an array of entities with their IDs, names, files, and types `graph-metrics-analyzer.ts:135-135`
- **entityId** — A unique identifier for an entity `types.ts:4-4`
- **entityId** — The unique identifier of an entity in the graph `types.ts:28-28`
- **entityId** — Stores a unique identifier for an entity `types.ts:51-51`
- **entries** — An array of PageRankEntry objects `types.ts:15-15`
- **entries** — An array of CentralityEntry objects representing the results of the centrality analysis `types.ts:63-63`
- **file** — Represents a map of community IDs to an array of entities with their IDs, names, files, and types `graph-metrics-analyzer.ts:135-135`
- **file** — Represents a file in the BusFactorFileEntry `types.ts:53-53`, `types.ts:70-70`
- **file** — The file associated with an entity `types.ts:6-6`
- **file** — The file associated with an entity in the graph `types.ts:30-30`
- **files** — Represents a map of author names to their email and set of files they authored `graph-metrics-analyzer.ts:304-304`
- **files** — Initializes a map to store module information `graph-metrics-analyzer.ts:345-345`
- **filesContributed** — Represents the number of files contributed by an author in the BusFactorModuleEntry `types.ts:78-78`
- **filesContributed** — The number of files contributed by an author in the BusFactorModuleEntry `types.ts:89-89`
- **inDegree** — The in-degree of an entity in the graph `types.ts:9-9`
- **inDegree** — Represents the in-degree of an entity `types.ts:55-55`
- **lines** — Represents a map of file names to a map of author names to their email and line count `graph-metrics-analyzer.ts:274-274`
- **linesChanged** — Represents the number of lines changed by an author in the BusFactorFileEntry `types.ts:71-71`
- **mainFiles** — An array of main files associated with a Louvain community `types.ts:34-34`
- **max** — The maximum PageRank score `types.ts:19-19`
- **mean** — The mean of the PageRank scores `types.ts:17-17`
- **median** — The median of the PageRank scores `types.ts:18-18`
- **metric** — Represents the metric type of the bus factor result `types.ts:62-62`, `types.ts:84-84`
- **metric** — The type of graph metric being calculated `types.ts:99-99`
- **metric** — The metric type, such as "pagerank" `types.ts:14-14`
- **metric** — The type of metric used in the result, such as "louvain" `types.ts:41-41`
- **minCommunitySize** — The minimum size of a community in the LouvainResult `types.ts:101-101`
- **modularity** — A measure of the quality of the community detection in LouvainResult `types.ts:43-43`
- **module** — Represents a module in the BusFactorModuleEntry `types.ts:77-77`
- **name** — Represents a map of community IDs to an array of entities with their IDs, names, files, and types `graph-metrics-analyzer.ts:135-135`
- **name** — Represents a map of file names to a map of author names to their email and line count `graph-metrics-analyzer.ts:274-274`
- **name** — Represents a map of author names to their email and set of files they authored `graph-metrics-analyzer.ts:304-304`
- **name** — Represents a map of module names to a map of author names to their email and set of files they authored `graph-metrics-analyzer.ts:345-345`
- **name** — Represents the name of an author in the BusFactorFileEntry `types.ts:52-52`, `types.ts:71-71`
- **name** — The name of an entity in the graph `types.ts:29-29`, `types.ts:78-78`
- **name** — The name of an entity `types.ts:5-5`, `types.ts:89-89`
- **outDegree** — The out-degree of an entity in the graph `types.ts:10-10`
- **outDegree** — Represents the out-degree of an entity `types.ts:56-56`
- **overall** — Represents the overall bus factor of the result `types.ts:85-90`
- **pathBuilder** — Builds paths for graph analysis `graph-metrics-analyzer.ts:30-30`
- **percentage** — Represents the percentage of lines changed by an author in the BusFactorFileEntry `types.ts:71-71`
- **percentage** — A percentage value used in the BusFactorFileEntry `types.ts:89-89`
- **persist** — A flag indicating whether the result should be persisted `types.ts:102-102`
- **projectPath** — The path to the project directory `types.ts:98-98`
- **result** — Stores the result of graph metrics analysis `graph-metrics-analyzer.ts:23-23`
- **riskLevel** — Represents the risk level of a file in the BusFactorFileEntry `types.ts:73-73`
- **riskLevel** — Represents the risk level associated with the bus factor `types.ts:80-80`, `types.ts:87-87`
- **role** — The role of an entity in the graph, such as "hub" or "authority" `types.ts:58-58`
- **score** — The score of an entity in the PageRank algorithm `types.ts:8-8`
- **scores** — A map of node IDs to their betweenness centrality scores `brandes.ts:17-17`
- **size** — Represents the number of entities in a Louvain community `types.ts:33-33`
- **sourcesUsed** — The number of source nodes used in the computation `brandes.ts:21-21`
- **stdDev** — The standard deviation of the PageRank scores `types.ts:20-20`
- **storage** — Stores graph data for analysis `graph-metrics-analyzer.ts:31-31`
- **timestamp** — Stores the timestamp of the cached result `graph-metrics-analyzer.ts:24-24`
- **topAuthors** — Represents the top authors in the result `types.ts:89-89`
- **topN** — The top N entities in the metric result `types.ts:100-100`
- **totalAuthors** — Represents the total number of authors in the result `types.ts:88-88`
- **totalCommunities** — The total number of communities detected in LouvainResult `types.ts:44-44`
- **totalDegree** — The total degree of an entity in the graph `types.ts:57-57`
- **totalNodes** — The total number of nodes in the graph `brandes.ts:19-19`
- **totalNodes** — Represents the total number of nodes in a graph metric result `types.ts:22-22`, `types.ts:45-45`, `types.ts:64-64`
- **type** — Represents a map of community IDs to an array of entities with their IDs, names, files, and types `graph-metrics-analyzer.ts:135-135`
- **type** — The type of an entity `types.ts:7-7`
- **type** — The type of an entity in the graph `types.ts:31-31`
- **type** — Specifies the type of an entity `types.ts:54-54`

## Dependencies

**Internal:**
- `GraphologyPathBuilder` — Loads and manages code dependency graphs from storage for analysis.
- `GraphStorage` — Persistence layer providing access to code dependency and graph data.
- `logging` — Application logging for execution traces and analysis diagnostics.

**External:**
- `graphology` — Graph algorithm library providing PageRank, community detection, and centrality computations.
