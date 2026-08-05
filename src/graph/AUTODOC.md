# Graph

## 🤖 Overview

The `basin-index.ts` module groups nodes by their sink, ensuring that nodes in different basins are unreachable from each other. This module is used as a pre-filter before BFS in trace-engine and impact analyzer to quickly determine reachability. The `bloom-reach.ts` module, on the other hand, is not described in detail here but likely deals with reachability checks using a Bloom filter approach.

## 🤖 Architecture

```
basin-index.ts
├── BasinBuildInput — input for building the basin index
├── BasinIndex — class to manage basin indices
├── NO_BASIN — constant for no basin
└── getFanCounts — method to get fan-in and fan-out counts for nodes
```

## 🤖 Flow

```
basin-index.ts
├── find sinks — nodes with fan_out=0 and fan_in>0
├── multi-source reverse BFS — each sink starts a basin
├── first basin to claim a node wins — nodes in different basins are unreachable
└── used in trace-engine and impact analyzer — pre-filter before BFS
```

## 🤖 Entity Listing

### Function
- **fwd** — Not directly described in the provided code `basin-index.ts:129-129`
- **fwd** — Represents a forward edge in the graph `bloom-reach.ts:215-215`
- **rev** — Not directly described in the provided code `basin-index.ts:130-130`

### Method
- **add** — Adds an item to the Bloom filter by hashing it and setting the corresponding bits `bloom-reach.ts:31-38`
- **basinCount** — A getter for the number of basins `basin-index.ts:33-35`
- **build** — A method to build the basin index from graph structure `basin-index.ts:50-96`
- **build** — A method to build the Bloom Reach Index `bloom-reach.ts:105-142`
- **buildFromAdjacency** — Not directly described in the provided code `basin-index.ts:116-155`
- **buildFromAdjacency** — Builds the Bloom Reach Index from adjacency lists `bloom-reach.ts:203-234`
- **canReach** — Checks if a hotspot can reach a node within a specified number of hops using Bloom filters `bloom-reach.ts:148-161`
- **constructor** — Initializes a Bloom filter with specified bit count and number of hashes `bloom-reach.ts:25-29`
- **hashA** — A static method for generating a hash using FNV-1a style `bloom-reach.ts:51-58`
- **hashB** — A static method for generating a hash using multiply-shift style `bloom-reach.ts:61-64`
- **invalidate** — A method to invalidate the basin index `basin-index.ts:43-45`
- **invalidate** — A method to invalidate the Bloom Reach Index `bloom-reach.ts:98-100`
- **mayContain** — Checks if an item is likely to be in the Bloom filter by hashing it and verifying the corresponding bits `bloom-reach.ts:40-48`
- **mayReach** — Not directly described in the provided code `basin-index.ts:103-110`
- **nodeCount** — The total number of nodes in the graph `basin-index.ts:36-38`
- **populateBloomBfs** — Populates Bloom filters for reachability checks using BFS `bloom-reach.ts:163-198`
- **valid** — A getter for the validity of the basin index `basin-index.ts:39-41`
- **valid** — A public field indicating the validity of the Bloom Reach Index `bloom-reach.ts:94-96`

### Class
- **BasinIndex** — A class to represent the basin index, storing basin IDs, node count, and validity `basin-index.ts:27-156`
- **BloomFilter** — A class for implementing a Bloom filter with specified bit count and number of hashes `bloom-reach.ts:20-65`
- **BloomReachIndex** — A class for precomputing Bloom filters for top-N hotspot nodes at multiple hop levels `bloom-reach.ts:88-235`

### Interface
- **BasinBuildInput** — An interface for input to build a basin index, including node count and methods to get fan counts and predecessors `basin-index.ts:18-25`
- **BloomReachBuildInput** — An interface for input parameters to build a Bloom Reach Index `bloom-reach.ts:78-86`

### Type_alias
- **ReachResult** — An enum representing the result of a reachability check `bloom-reach.ts:71-71`

### Property
- **_basinCount** — A private variable storing the number of basins `basin-index.ts:29-29`
- **_nodeCount** — A private variable storing the number of nodes `basin-index.ts:30-30`
- **_valid** — A private variable indicating whether the basin index is valid `basin-index.ts:31-31`
- **_valid** — A private field indicating the validity of the Bloom Reach Index `bloom-reach.ts:92-92`
- **basinIds** — An array storing the basin ID for each node `basin-index.ts:28-28`
- **bitCount** — The total number of bits in the Bloom filter `bloom-reach.ts:23-23`
- **bits** — An array of 32-bit unsigned integers representing the bits of the Bloom filter `bloom-reach.ts:21-21`
- **depth** — Represents the depth of a node in the BFS traversal `bloom-reach.ts:170-170`
- **fanIn** — Not directly described in the provided code `basin-index.ts:22-22`
- **fanOut** — Not directly described in the provided code `basin-index.ts:22-22`
- **filters** — An array of Bloom filters for different hop levels `bloom-reach.ts:90-90`
- **getFanCounts** — A method to get the fan in and fan out counts for a given node `basin-index.ts:22-22`
- **getPredecessors** — A method to get the predecessors of a given node `basin-index.ts:24-24`
- **getScore** — A function for scoring hotspots `bloom-reach.ts:81-81`
- **getSuccessors** — A function for getting successors of a node `bloom-reach.ts:83-83`
- **hotspotIndices** — An array of indices for hotspots `bloom-reach.ts:89-89`
- **hotspotLookup** — A lookup table for hotspots `bloom-reach.ts:91-91`
- **idx** — An index for the Bloom Reach Index `bloom-reach.ts:113-113`
- **index** — Not directly described in the provided code `basin-index.ts:117-117`
- **index** — Represents an index in the Bloom Reach Index `bloom-reach.ts:207-207`
- **node** — Represents a node in the graph `bloom-reach.ts:170-170`
- **nodeCount** — Represents the count of nodes in the basin `basin-index.ts:20-20`
- **nodeCount** — The number of nodes in the graph `bloom-reach.ts:79-79`
- **nodeIds** — Not directly described in the provided code `basin-index.ts:118-118`
- **nodeIds** — Stores node IDs for the Bloom Reach Index `bloom-reach.ts:207-207`
- **nodeToIdx** — Not directly described in the provided code `basin-index.ts:119-119`
- **nodeToIdx** — Maps node IDs to indices in the Bloom Reach Index `bloom-reach.ts:207-207`
- **numHashes** — The number of hash functions used in the Bloom filter `bloom-reach.ts:22-22`
- **score** — A score function for ranking hotspots `bloom-reach.ts:113-113`
- **topN** — A function for getting top N hotspots `bloom-reach.ts:85-85`

## Entities

### Types & Interfaces

- **`BasinBuildInput`** `[basin-index.ts:16-25]` — Configuration object providing node count, fan-in/fan-out accessor, and predecessor lookup for basin index construction.
- **`BloomReachBuildInput`** `[bloom-reach.ts:73-86]` — Configuration object specifying node count, adjacency list provider, and reachable-nodes callback for bloom reach index construction.
- **`ReachResult`** `[bloom-reach.ts:71]` — Type alias representing the result of a reachability query (true/false/ambiguous state).

### Classes

- **`BasinIndex`** `[basin-index.ts:27-159]` — Partitions graph nodes into basins (groups flowing to the same sink) via multi-source reverse BFS, enabling O(1) negative reachability pre-filtering by testing whether two nodes belong to the same basin.
- **`BloomFilter`** `[bloom-reach.ts:20-65]` — Probabilistic set membership data structure using bitwise hashing to compactly represent reachable nodes with configurable false-positive rate.
- **`BloomReachIndex`** `[bloom-reach.ts:88-235]` — Builds a Bloom filter of reachable nodes from each source via BFS, providing efficient `canReach()` queries that return definitive false for unreachable pairs and probable true for potential reaches.

### Constants

- **`NO_BASIN`** `[basin-index.ts:16-25]` — Sentinel value (0xffff) indicating a node belongs to multiple basins, marking ambiguous reachability that requires full traversal rather than pre-filtering.

## Dependencies

- **Basin Index** internally implements multi-source reverse BFS with queue-based traversal; used as first-stage filter in trace engine and impact analyzer.
- **Bloom Reach Index** depends on complete BFS traversal to populate Bloom filter state; serves as second-stage filter when basin index is ambiguous (both nodes in NO_BASIN).
- Both indexes assume a static graph structure (node count, edges, fan counts) that must be stable across multiple reachability queries; marked invalid when graph topology changes.
