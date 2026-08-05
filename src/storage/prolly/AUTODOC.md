# Prolly

## 🤖 Overview

The `prolly` module provides a versioned graph storage system using Prolly Trees, enabling efficient branch synchronization, time travel, and deduplication. It is used by developers to manage and compare versions of data structures, particularly in version control systems and data storage applications.

## 🤖 Architecture

```
ProllyNodeStore
    |
    +-- ProllyTree
    |
    +-- CommitManager
    |
    +-- BranchDiffCache
    |
    +-- RecentlyChanged
    |
    +-- TimeTravel
```

## 🤖 Flow

```
User initializes ProllyNodeStore and ProllyTree.
User creates a CommitManager and sets context.
User builds the ProllyTree with entities.
User commits the changes using CommitManager.
User can then compare branches using BranchDiffCache.
User can also time travel using TimeTravel.
```

## 🤖 Entity Listing

### Function
- **addEvent** — Finds an event in the history that has a change type of "add" `time-travel.ts:190-190`
- **allHashes** — Returns all hashes of nodes in the store `node-store.ts:438-438`
- **createCachedTombstoneGetter** — Not present in the provided code snippet `branch-diff-cache.ts:227-248`
- **dbResult** — Represents the result of a database operation `node-store.ts:318-318`
- **deserializeEntity** — Deserializes a tree entity `prolly-tree.ts:736-738`
- **entriesA** — Represents entries in tree A `prolly-tree.ts:520-520`
- **entriesB** — Represents entries in tree B `prolly-tree.ts:521-521`
- **entry** — Represents an entry in a probabilistic B-Tree `prolly-tree.ts:278-278`
- **existing** — Checks if an entry exists in a probabilistic B-Tree `prolly-tree.ts:313-313`
- **existingCheck** — Checks if a node already exists in the store `node-store.ts:186-186`
- **existingCheck** — Maps the hash of each inserted node to an array of hashes `node-store.ts:187-187`
- **existingHashes** — Stores hashes of nodes that have been previously stored `node-store.ts:189-189`
- **filtered** — Filters entries in a probabilistic B-Tree `prolly-tree.ts:330-330`
- **fromSet** — Not present in the provided code `commit-manager.ts:237-237`
- **getRecentlyChangedEntities** — Asynchronously retrieves entity IDs that were recently changed based on Prolly Tree commit history `recently-changed.ts:37-115`
- **hash** — Computes a hash for a probabilistic B-Tree node `prolly-tree.ts:227-227`
- **keepHashes** — Keeps specific hashes in the commit history `commit-manager.ts:469-469`
- **newNodes** — Represents nodes that are being added to the store `node-store.ts:191-191`
- **orphaned** — Identifies orphaned nodes that are not referenced by any other nodes `node-store.ts:441-441`
- **result** — Represents the result of a database operation `commit-manager.ts:475-475`
- **result** — Represents the result of a node store operation, typically a ProllyNode instance `node-store.ts:375-375`
- **serializeEntity** — Serializes a tree entity `prolly-tree.ts:729-731`
- **sorted** — A sorted array of entries `prolly-tree.ts:88-88`
- **totalChanges** — Calculates the total number of changes across recent commits `time-travel.ts:389-389`
- **values** — Stores the values associated with nodes `node-store.ts:206-206`

### Method
- **build** — Builds a Prolly tree from a sorted array of entries and returns the root hash `prolly-tree.ts:72-109`
- **buildInternalLevel** — Builds internal nodes in a probabilistic B-Tree `prolly-tree.ts:197-247`
- **buildKeyRangeMap** — Builds a map of key ranges `prolly-tree.ts:610-624`
- **buildLeafLevel** — Builds the leaf level of the Prolly tree `prolly-tree.ts:114-192`
- **clearCache** — Clears the cache `node-store.ts:486-488`
- **collectChanges** — Collects changes between two trees `prolly-tree.ts:629-647`
- **collectEntries** — Collects entries from the tree `prolly-tree.ts:349-371`
- **collectGarbage** — Collects and removes orphaned nodes `node-store.ts:420-450`
- **collectRange** — Collects entries within a specified range `prolly-tree.ts:395-430`
- **commit** — Not present in the provided code `commit-manager.ts:103-150`
- **compareEntity** — Compares two entities at different commit hashes and returns whether they have changed `time-travel.ts:311-338`
- **compareNodes** — Compares two nodes in the tree `prolly-tree.ts:472-511`
- **computeDepth** — Computes the depth of the tree `prolly-tree.ts:685-699`
- **computeHash** — Computes the hash of a node's content `node-store.ts:97-112`
- **constructor** — Initializes the BranchDiffCache with nodeStore and commitManager `branch-diff-cache.ts:32-35`
- **constructor** — Initializes the ProllyNodeStore with a configuration object `node-store.ts:47-52`
- **constructor** — Initializes a new Prolly Tree with a node store and optional configuration `prolly-tree.ts:38-41`
- **constructor** — Initializes the TimeTravelManager with a node store and commit manager `time-travel.ts:27-30`
- **countNodes** — Counts the number of nodes in the tree `prolly-tree.ts:704-719`
- **createTable** — Creates the prolly_nodes table if it doesn't exist `node-store.ts:75-92`
- **createTables** — Creates the commits and branch_heads tables `commit-manager.ts:50-86`
- **delete** — Deletes a node by its hash `node-store.ts:354-365`
- **delete** — Deletes an entry from a probabilistic B-Tree `prolly-tree.ts:328-332`
- **deleteBatch** — Deletes multiple nodes in a batch `node-store.ts:370-386`
- **deserializeInternalData** — Deserializes internal node data from a storage format `node-store.ts:525-527`
- **deserializeLeafData** — Deserializes leaf node data `node-store.ts:511-513`
- **diff** — Computes the difference between two trees `prolly-tree.ts:440-467`
- **diffCommits** — Computes the difference between two commits `time-travel.ts:224-253`
- **diffFromHead** — Computes the difference from the head commit `time-travel.ts:258-263`
- **diffInternalNodes** — Computes the difference between two internal nodes `prolly-tree.ts:561-605`
- **diffLeafNodes** — Computes the difference between two leaf nodes `prolly-tree.ts:516-556`
- **existsOnCurrentBranch** — Checks if a commit exists on the current branch `branch-diff-cache.ts:127-130`
- **findChangedEntities** — Finds and returns the IDs of entities that have changed between two commit hashes `time-travel.ts:343-353`
- **findCommitsWhere** — Finds commits where an entity meets a predicate `time-travel.ts:199-215`
- **findCommitWhere** — Finds a commit based on certain conditions `commit-manager.ts:366-379`
- **findFirstAdded** — Finds the first commit where an entity was added `time-travel.ts:188-194`
- **findLastModified** — Finds the last commit where an entity was modified `time-travel.ts:176-183`
- **get** — Retrieves a node by its hash `node-store.ts:241-264`
- **get** — Retrieves a value from a probabilistic B-Tree `prolly-tree.ts:263-270`
- **getActiveRootHashes** — Retrieves active root hashes `commit-manager.ts:429-438`
- **getAddedIds** — Retrieves IDs of added commits `branch-diff-cache.ts:143-145`
- **getAllActiveRootHashes** — Retrieves all active root hashes `commit-manager.ts:445-451`
- **getAllBranchHeads** — Not present in the provided code `commit-manager.ts:321-340`
- **getAllEntitiesAt** — Retrieves all entities at a specific commit `time-travel.ts:73-83`
- **getAllEntries** — Returns all entries in the tree `prolly-tree.ts:337-344`
- **getBatch** — Retrieves multiple nodes in a batch `node-store.ts:299-331`
- **getBranchHead** — Not present in the provided code `commit-manager.ts:287-303`
- **getCommit** — Not present in the provided code `commit-manager.ts:155-167`
- **getCommitPath** — Not present in the provided code `commit-manager.ts:232-278`
- **getCommitsSince** — Not present in the provided code `commit-manager.ts:192-207`
- **getDeletedIds** — Retrieves IDs of deleted commits `branch-diff-cache.ts:136-138`
- **getEntityAt** — Retrieves an entity at a specific commit `time-travel.ts:54-68`
- **getEntityHistory** — Retrieves the history of an entity `time-travel.ts:120-171`
- **getFileTreeHashAt** — Returns the file tree hash at a specific commit `commit-manager.ts:358-360`
- **getGraphAt** — Retrieves the graph state at a specific commit `time-travel.ts:39-49`
- **getHistory** — Not present in the provided code `commit-manager.ts:172-186`
- **getHistoryFrom** — Not present in the provided code `commit-manager.ts:212-227`
- **getModifiedIds** — Retrieves IDs of modified commits `branch-diff-cache.ts:150-152`
- **getReachableNodes** — Retrieves nodes that are reachable from a given node `node-store.ts:391-414`
- **getRecentChanges** — Retrieves recent changes in commits `time-travel.ts:268-302`
- **getRollbackData** — Retrieves the data of a commit, including its tree entries, to facilitate rollback operations `time-travel.ts:363-372`
- **getRootHash** — Gets the current root hash of the Prolly Tree `prolly-tree.ts:53-55`
- **getRootHashAt** — Returns the root hash at a specific commit `commit-manager.ts:349-352`
- **getStats** — Retrieves cache statistics `branch-diff-cache.ts:186-216`
- **getStats** — Retrieves statistics about the commit history `commit-manager.ts:388-419`
- **getStats** — Retrieves statistics about the node store `node-store.ts:455-481`
- **getStats** — Retrieves statistics about the tree `prolly-tree.ts:656-680`
- **getStats** — Calculates and returns statistics about the commit history, including total commits, oldest commit age, and average change size `time-travel.ts:381-397`
- **has** — Checks if a node exists by its hash `node-store.ts:336-349`
- **hasCache** — Returns whether the cache is not null `branch-diff-cache.ts:179-181`
- **hashValue** — Computes the hash value for a given string using xxHash64 `node-store.ts:532-535`
- **initForBranch** — Initializes or refreshes the cache for a branch switch `branch-diff-cache.ts:41-97`
- **initialize** — Initializes the commit manager with a client `commit-manager.ts:32-38`
- **initialize** — Initializes the store with a database client `node-store.ts:57-63`
- **initialize** — Initializes the tree (must be called before use) `prolly-tree.ts:46-48`
- **insert** — Inserts an entry into a probabilistic B-Tree `prolly-tree.ts:309-322`
- **invalidate** — Invalidates the cache `branch-diff-cache.ts:171-174`
- **isAdded** — Checks if a commit is added in the current branch `branch-diff-cache.ts:111-114`
- **isDeleted** — Checks if a commit is deleted in the current branch `branch-diff-cache.ts:103-106`
- **isModified** — Checks if a commit is modified in the current branch `branch-diff-cache.ts:119-122`
- **isReady** — Checks if the commit manager is ready `commit-manager.ts:506-508`
- **isReady** — Checks if the node store is ready for use `node-store.ts:493-495`
- **isValid** — Checks if the cache is valid `branch-diff-cache.ts:158-165`
- **pruneHistory** — Prunes the commit history `commit-manager.ts:457-485`
- **put** — Stores a node in the store `node-store.ts:118-160`
- **putBatch** — Stores multiple nodes in the store `node-store.ts:166-236`
- **range** — Represents a range of keys in the tree `prolly-tree.ts:380-390`
- **rowToCommit** — Converts a database row to a commit object `commit-manager.ts:491-501`
- **rowToNode** — Converts a database row to a ProllyNode object `node-store.ts:267-294`
- **searchEntitiesAt** — Searches for entities at a specific commit hash `time-travel.ts:88-111`
- **searchNode** — Searches for a node in a probabilistic B-Tree `prolly-tree.ts:275-303`
- **serializeInternalData** — Serializes internal node data into a format suitable for storage `node-store.ts:518-520`
- **serializeLeafData** — Serializes leaf node data `node-store.ts:504-506`
- **setContext** — Not present in the provided code `commit-manager.ts:91-94`
- **setRootHash** — Sets the root hash of the Prolly Tree `prolly-tree.ts:60-62`
- **shouldChunkSplit** — Determines whether a chunk should be split in a probabilistic B-Tree `prolly-tree.ts:252-254`
- **updateBranchHead** — Not present in the provided code `commit-manager.ts:308-316`
- **updateClient** — Updates the client reference `commit-manager.ts:43-45`
- **updateClient** — Updates the client reference for the store `node-store.ts:68-70`

### Class
- **BranchDiffCache** — Caches the diff between current branch and base branch using Prolly Tree `branch-diff-cache.ts:27-217`
- **CommitManager** — Manages commits (snapshots) of the graph state `commit-manager.ts:23-509`
- **ProllyNodeStore** — A class for storing Prolly Tree nodes by their content hash `node-store.ts:41-536`
- **ProllyTree** — A probabilistic B-Tree with Merkle hashing for versioned graph storage `prolly-tree.ts:33-720`
- **TimeTravelManager** — Manages time travel through commits, providing access to historical graph states `time-travel.ts:23-398`

### Interface
- **BranchDiffCache** — Cache for branch differences `types.ts:306-327`
- **BranchHead** — Represents the head of a branch `types.ts:122-127`
- **CommitDiff** — Represents the difference between two commits `types.ts:190-205`
- **EntityChange** — Change in an entity `types.ts:346-352`
- **EntryChange** — Represents a change in an entry `types.ts:136-142`
- **FileChange** — Represents a change in a file `types.ts:168-173`
- **FileDiff** — Represents the difference between two versions of a file `types.ts:178-185`
- **FileMerkleNode** — Represents a Merkle node for a file or directory with its ID, project hash, branch name, path, hash, parent path, isLeaf status, children count, and update timestamp `types.ts:361-388`
- **GraphCommit** — Represents a commit in the graph with its hash, project hash, branch name, parent hash, root node hash, optional message, and creation timestamp `types.ts:96-117`
- **GraphSnapshot** — Snapshot of the graph `types.ts:336-341`
- **InternalNodeData** — Serialized format for internal node data `types.ts:80-87`
- **LeafNodeData** — Serialized format for leaf node data `types.ts:73-75`
- **MerkleFileInfo** — Represents file information including path, hash, optional size, and optional modification time `types.ts:393-398`
- **NodeStoreConfig** — An interface for configuring the Prolly Node Store, including cache size and enable cache settings `node-store.ts:25-30`
- **ProllyEntry** — Entry stored in a leaf node `types.ts:59-68`
- **ProllyNode** — A node in the Prolly Tree (content-addressed) `types.ts:26-54`
- **ProllyTreeConfig** — Configuration for the Prolly Tree `types.ts:251-285`
- **RecentChangeFilter** — Takes last N commits or commits since a Unix timestamp `recently-changed.ts:14-19`
- **RecentChangeResult** — Contains sets of changed, added, modified, and deleted entity IDs, along with analyzed commits and time taken `recently-changed.ts:21-29`
- **TreeDiff** — Represents a difference between two trees `types.ts:147-163`
- **VerifyError** — Represents an error during verification of a node's integrity `types.ts:237-242`
- **VerifyResult** — Represents the result of verifying a node `types.ts:214-232`

### Type_alias
- **ProllyNodeType** — Node type in the Prolly Tree `types.ts:21-21`

### Import_decl
- **../../logging/index.js** — Imports `../../logging/index.js` from `../../logging/index.js`. `branch-diff-cache.ts:17-17`, `commit-manager.ts:14-14`, `node-store.ts:16-16`, `prolly-tree.ts:16-16`, `recently-changed.ts:9-9`
- **../../utils/fast-hash.js** — Imports `../../utils/fast-hash.js` from `../../utils/fast-hash.js`. `commit-manager.ts:15-15`, `node-store.ts:17-17`, `prolly-tree.ts:17-17`
- **../graph-adapter.js** — Imports `../graph-adapter.js` from `../graph-adapter.js`. `recently-changed.ts:10-10`
- **../libsql/types.js** — Imports `../libsql/types.js` from `../libsql/types.js`. `commit-manager.ts:16-16`, `node-store.ts:18-18`
- **./commit-manager.js** — Imports `./commit-manager.js` from `./commit-manager.js`. `branch-diff-cache.ts:18-18`, `time-travel.ts:14-14`
- **./node-store.js** — Imports `./node-store.js` from `./node-store.js`. `branch-diff-cache.ts:19-19`, `prolly-tree.ts:18-18`, `time-travel.ts:15-15`
- **./prolly-tree.js** — Imports `./prolly-tree.js` from `./prolly-tree.js`. `branch-diff-cache.ts:20-20`, `time-travel.ts:16-16`
- **./time-travel.js** — Imports `./time-travel.js` from `./time-travel.js`. `recently-changed.ts:11-11`
- **./types.js** — Imports `./types.js` from `./types.js`. `branch-diff-cache.ts:21-21`, `commit-manager.ts:17-17`, `node-store.ts:19-19`, `recently-changed.ts:12-12`, `time-travel.ts:17-17`
- **./types.js** — Imports `./types.js`. `prolly-tree.ts:19-27`
- **cbor-x** — Imports `cbor-x` from `cbor-x`. `node-store.ts:14-14`, `prolly-tree.ts:15-15`
- **lru-cache** — Imports `lru-cache` from `lru-cache`. `node-store.ts:15-15`

### Property
- **added** — Counts the number of added entities `time-travel.ts:271-271`, `time-travel.ts:279-279`
- **added** — List of added nodes `types.ts:149-149`
- **addedCount** — Represents the count of added IDs in the branch diff cache `branch-diff-cache.ts:190-190`
- **addedIds** — Set of entity IDs that were added `recently-changed.ts:24-24`
- **addedIds** — IDs of added entities `types.ts:314-314`
- **averageChangeSize** — Stores the average change size `time-travel.ts:384-384`
- **baseBranch** — Base branch for the diff `branch-diff-cache.ts:188-188`
- **baseBranch** — Base branch in the Prolly Tree `types.ts:308-308`
- **branchCount** — Returns the number of branches `commit-manager.ts:390-390`
- **branchName** — Name of the branch `commit-manager.ts:26-26`
- **branchName** — Represents a branch in the Prolly Tree, identified by content hash and type `types.ts:104-104`
- **branchName** — Represents a branch in the Prolly Tree, identified by content hash and level `types.ts:124-124`
- **branchName** — Stores the name of the branch `types.ts:369-369`
- **cache** — Branch Diff Cache data structure `branch-diff-cache.ts:30-30`
- **cache** — An LRU cache for storing nodes `node-store.ts:44-44`
- **cacheAge** — Represents the age of the branch diff cache in milliseconds `branch-diff-cache.ts:193-193`
- **cacheHits** — Tracks the number of cache hits `node-store.ts:460-460`
- **cacheSize** — Represents the maximum size of the cache `node-store.ts:459-459`
- **cacheSize** — The maximum number of nodes to keep in the cache `node-store.ts:27-27`
- **cacheSize** — Size of the cache `types.ts:284-284`
- **changed** — Indicates whether the entity has changed `time-travel.ts:318-318`
- **changedIds** — Set of entity IDs that were changed (added or modified) `recently-changed.ts:23-23`
- **changes** — Represents the changes made to a file `types.ts:179-179`
- **changeType** — Indicates the type of change, either "add", "modify", or "delete" `types.ts:349-349`
- **children** — Represents an array of child nodes with their hash, key range, and entry count `types.ts:81-86`
- **childrenCount** — Number of child nodes `types.ts:384-384`
- **childrenHashes** — For internal nodes: ordered list of child content hashes `types.ts:37-37`
- **chunkPattern** — Pattern for probabilistic chunking `types.ts:258-258`
- **client** — Reference to the database client `commit-manager.ts:24-24`
- **client** — A reference to the database client used for storing nodes `node-store.ts:42-42`
- **commit** — Represents a commit in the graph `time-travel.ts:270-270`, `time-travel.ts:278-278`
- **commit** — Commit information `types.ts:337-337`
- **commitHash** — Content hash of the commit `types.ts:98-98`
- **commitHash** — Content hash (xxHash64) - serves as the node's identity `types.ts:125-125`
- **commitHash** — Represents the commit hash `types.ts:347-347`
- **commitManager** — Commit Manager instance used for getting branch heads `branch-diff-cache.ts:29-29`
- **commitManager** — Manages commits, allowing retrieval of commit details `time-travel.ts:25-25`
- **commitPath** — Represents the path of the commit `types.ts:204-204`
- **commitsAnalyzed** — Number of commits analyzed `recently-changed.ts:27-27`
- **config** — The configuration object for the Prolly Node Store `node-store.ts:43-43`
- **config** — Configuration for the Prolly Tree `prolly-tree.ts:35-35`
- **contentHash** — Content hash (xxHash64) - serves as the node's identity `types.ts:28-28`
- **count** — Counts the number of entries in a probabilistic B-Tree `prolly-tree.ts:119-119`
- **count** — Represents the count of occurrences for a key in a hash map `prolly-tree.ts:198-198`
- **count** — Stores the count of occurrences for a key in an array of internal nodes `prolly-tree.ts:199-199`
- **count** — The count of entries in a range `prolly-tree.ts:116-116`, `prolly-tree.ts:202-202`
- **createdAt** — Timestamp when node was created. Not in Zig schema `types.ts:53-53`
- **createdAt** — Timestamp when the commit was created `types.ts:116-116`
- **createdAt** — Timestamp when the node was created `types.ts:326-326`
- **currentBranch** — Current branch for the diff `branch-diff-cache.ts:189-189`
- **currentBranch** — Current branch in the Prolly Tree `types.ts:311-311`
- **data** — For leaf nodes: serialized data (CBOR encoded). In-memory representation `types.ts:34-34`
- **deleted** — Counts the number of deleted entities `time-travel.ts:273-273`, `time-travel.ts:281-281`
- **deleted** — List of deleted nodes `types.ts:155-155`
- **deletedCount** — Represents the count of deleted IDs in the branch diff cache `branch-diff-cache.ts:192-192`
- **deletedIds** — Set of entity IDs that were deleted `recently-changed.ts:26-26`
- **deletedIds** — IDs of deleted entities `types.ts:320-320`
- **depth** — Represents the depth of the tree `prolly-tree.ts:659-659`
- **dirsCompared** — Represents the number of directories compared `types.ts:181-181`
- **dirsSkipped** — Represents the number of directories skipped `types.ts:182-182`
- **enableCache** — A boolean indicating whether the cache is enabled `node-store.ts:29-29`
- **enableCache** — Boolean indicating whether caching is enabled `types.ts:278-278`
- **end** — Represents the end of a range `prolly-tree.ts:613-613`
- **end** — Stores the end of a key in a map `prolly-tree.ts:614-614`
- **entityA** — Stores a nullable entity of type T `time-travel.ts:316-316`
- **entityB** — Stores a nullable entity of type T `time-travel.ts:317-317`
- **entityCount** — Not present in the provided code `commit-manager.ts:106-106`
- **entityCount** — Count of entities in the graph `types.ts:338-338`
- **entries** — Entries in the leaf node `types.ts:74-74`
- **entryCount** — Represents the number of entries in the tree `prolly-tree.ts:658-658`
- **entryCount** — Number of entries in this subtree. Computed in memory, not persisted `types.ts:51-51`
- **entryCount** — Represents the count of entries `types.ts:85-85`
- **errors** — Represents the number of errors `types.ts:228-228`
- **fileCount** — Count of files in the graph `types.ts:340-340`
- **fileDiff** — Represents the difference between two files `types.ts:201-201`
- **fromCommit** — Represents the commit from which the difference is taken `types.ts:192-192`
- **hasCache** — Checks if the cache is initialized `branch-diff-cache.ts:187-187`
- **hash** — Computes the hash of a node's content `node-store.ts:171-171`
- **hash** — Parses a hash value and returns an array of objects containing hash, key start, key end, and count `prolly-tree.ts:116-116`
- **hash** — Content hash for integrity verification `types.ts:43-43`
- **hash** — Represents the hash value `types.ts:82-82`, `types.ts:395-395`
- **hash** — Stores the hash value `types.ts:375-375`
- **id** — Unique identifier for the entity `types.ts:363-363`
- **internalNodes** — Returns the number of internal nodes in the store `node-store.ts:458-458`
- **isInitialized** — Indicates if the commit manager is initialized `commit-manager.ts:27-27`
- **isInitialized** — A boolean indicating whether the store has been initialized `node-store.ts:45-45`
- **isLeaf** — Boolean indicating if the entity is a leaf node `types.ts:381-381`
- **key** — Represents the key in an array of entries `prolly-tree.ts:337-337`
- **key** — Represents a key in the tree `prolly-tree.ts:115-115`, `prolly-tree.ts:349-349`
- **key** — The key of an entry `prolly-tree.ts:72-72`, `prolly-tree.ts:360-360`
- **key** — Retrieves rollback data for a target commit hash `time-travel.ts:363-363`
- **key** — Unique key for this entry (entity ID, file path, etc.) `types.ts:61-61`
- **key** — Unique key for the entry `types.ts:137-137`
- **keyEnd** — Represents the end of a key in a probabilistic B-Tree `prolly-tree.ts:119-119`
- **keyEnd** — Represents the end of a key in a hash map `prolly-tree.ts:198-198`
- **keyEnd** — Stores the end of a key in an array of internal nodes `prolly-tree.ts:199-199`
- **keyEnd** — The end key of a range `prolly-tree.ts:116-116`, `prolly-tree.ts:202-202`
- **keyRangeEnd** — B-tree key range: end key (inclusive). Computed in memory, not persisted `types.ts:49-49`
- **keyRangeEnd** — Represents the end of the key range `types.ts:84-84`
- **keyRangeStart** — B-tree key range: start key (inclusive). Computed in memory, not persisted `types.ts:47-47`
- **keyRangeStart** — Represents the start of the key range `types.ts:83-83`
- **keyStart** — Represents the start of a key in a probabilistic B-Tree `prolly-tree.ts:119-119`
- **keyStart** — Represents the start of a key in a hash map `prolly-tree.ts:198-198`
- **keyStart** — Stores the start of a key in an array of internal nodes `prolly-tree.ts:199-199`
- **keyStart** — The start key of a range `prolly-tree.ts:116-116`, `prolly-tree.ts:202-202`
- **lastCommits** — Number of commits to consider `recently-changed.ts:16-16`
- **leafNodes** — Returns the number of leaf nodes in the store `node-store.ts:457-457`
- **level** — Tree level: 0 = leaf, >0 = internal `types.ts:40-40`
- **maxLeafEntries** — Maximum number of entries in a leaf node `types.ts:272-272`
- **message** — Message associated with the commit `types.ts:113-113`
- **message** — Message associated with the node `types.ts:241-241`
- **minLeafEntries** — Minimum number of entries in a leaf node `types.ts:265-265`
- **missingNodes** — Represents the number of missing nodes `types.ts:225-225`
- **modified** — Counts the number of modified entities `time-travel.ts:272-272`, `time-travel.ts:280-280`
- **modified** — List of modified nodes `types.ts:152-152`
- **modifiedCount** — Represents the count of modified IDs in the branch diff cache `branch-diff-cache.ts:191-191`
- **modifiedIds** — Set of entity IDs that were modified `recently-changed.ts:25-25`
- **modifiedIds** — IDs of modified entities `types.ts:317-317`
- **mtime** — Optional field for modification time `types.ts:397-397`
- **newestCommit** — Returns the newest commit `commit-manager.ts:392-392`
- **newHash** — Hash of the new value `types.ts:141-141`
- **newHash** — Represents the new hash of the file `types.ts:172-172`
- **newValue** — New value of the entry `types.ts:139-139`
- **newValue** — Optional field storing the new value as a Uint8Array `types.ts:351-351`
- **node** — Represents a node in the Prolly Tree `node-store.ts:171-171`
- **nodeCount** — Counts the number of nodes in the tree `prolly-tree.ts:660-660`
- **nodeCount** — Represents the number of nodes `types.ts:219-219`
- **nodeHash** — Content hash (xxHash64) serving as the node's identity `types.ts:239-239`
- **nodesCompared** — Number of nodes compared in the diff `types.ts:159-159`
- **nodesSkipped** — Number of nodes skipped in the diff `types.ts:160-160`
- **nodeStore** — Prolly Node Store instance used for computing diffs `branch-diff-cache.ts:28-28`
- **nodeStore** — A store for nodes in the Prolly Tree `prolly-tree.ts:34-34`
- **nodeStore** — Stores nodes for efficient retrieval in the Prolly Tree `time-travel.ts:24-24`
- **oldestCommit** — Returns the oldest commit `commit-manager.ts:391-391`
- **oldestCommitAge** — Stores the age of the oldest commit `time-travel.ts:383-383`
- **oldHash** — Hash of the old value `types.ts:140-140`
- **oldHash** — Represents the old hash of the file `types.ts:171-171`
- **oldValue** — Old value of the entry `types.ts:138-138`
- **oldValue** — Optional field storing the old value as a Uint8Array `types.ts:350-350`
- **orphanedNodes** — Represents the number of orphaned nodes `types.ts:222-222`
- **parentHash** — Content hash of the parent commit `types.ts:107-107`
- **parentHash** — Content hash of the parent node `types.ts:240-240`
- **parentPath** — Optional path of the parent entity `types.ts:378-378`
- **path** — Represents the file path `types.ts:169-169`
- **path** — Path of the entity `types.ts:372-372`
- **path** — Stores the file path `types.ts:394-394`
- **projectHash** — Hash of the project `commit-manager.ts:25-25`
- **projectHash** — Content hash of the project `types.ts:101-101`
- **projectHash** — Hash representing the project `types.ts:123-123`
- **projectHash** — Represents the project hash `types.ts:366-366`
- **relationshipCount** — Not present in the provided code `commit-manager.ts:106-106`
- **relationshipCount** — Count of relationships in the graph `types.ts:339-339`
- **rootHash** — Represents the root hash of the tree `prolly-tree.ts:657-657`
- **rootHash** — The hash of the root node of the Prolly Tree `prolly-tree.ts:36-36`
- **rootNodeHash** — Content hash of the root node `types.ts:110-110`
- **sinceTimestamp** — Unix timestamp for commits since `recently-changed.ts:18-18`
- **size** — Optional field for file size `types.ts:396-396`
- **start** — Represents the start of a range `prolly-tree.ts:613-613`
- **start** — Stores the start of a key in a map `prolly-tree.ts:614-614`
- **stats** — Statistics about the tree diff `types.ts:158-162`
- **stats** — Represents statistics related to the file `types.ts:180-184`
- **timeMs** — Time taken in milliseconds to analyze commits `recently-changed.ts:28-28`
- **timeMs** — Represents the time in milliseconds `types.ts:161-161`, `types.ts:183-183`, `types.ts:231-231`
- **timestamp** — Timestamp when node was created `types.ts:348-348`
- **toCommit** — Represents the commit to which the difference is taken `types.ts:195-195`
- **totalCommits** — Returns the total number of commits `commit-manager.ts:389-389`
- **totalCommits** — Stores the total number of commits `time-travel.ts:382-382`
- **totalNodes** — Returns the total number of nodes in the store `node-store.ts:456-456`
- **treeDiff** — Represents the difference between two trees `types.ts:198-198`
- **type** — Type of node: internal (branch), leaf (data), or file_tree (for FS Merkle) `types.ts:31-31`
- **type** — Represents the type of the file `types.ts:170-170`
- **type** — Node type in the Prolly Tree, either internal, leaf, or file_tree `types.ts:238-238`
- **updatedAt** — Timestamp when the commit was last updated `types.ts:126-126`
- **updatedAt** — Timestamp of the last update `types.ts:387-387`
- **valid** — Indicates whether the node is valid `types.ts:216-216`
- **validUntilCommit** — Timestamp until which the branch is valid `types.ts:323-323`
- **value** — Represents the value in an array of entries `prolly-tree.ts:337-337`
- **value** — Represents a value in the tree `prolly-tree.ts:115-115`, `prolly-tree.ts:349-349`
- **value** — The value of an entry `prolly-tree.ts:72-72`, `prolly-tree.ts:360-360`
- **value** — Parses a rollback data promise `time-travel.ts:363-363`
- **value** — Serialized value (CBOR encoded) `types.ts:64-64`
- **valueHash** — Hash of the value (for change detection) `types.ts:67-67`

### embedded_sql
- **CREATE INDEX IF NOT EXISTS idx_commits_branch ON commits(project_hash, branch_name, created_at DESC)** — Creates an index for faster query performance on commit data `commit-manager.ts:65-65`
- **CREATE TABLE IF NOT EXISTS branch_diffs ( id TEXT NOT NULL PRIMARY KEY, project_hash TEXT NOT NULL, f** — Creates a table to store branch diff information `commit-manager.ts:67-74`
- **CREATE TABLE IF NOT EXISTS branch_heads ( project_hash TEXT NOT NULL, branch_name TEXT NOT NULL, com** — Creates a table to store branch head information `commit-manager.ts:76-82`
- **CREATE TABLE IF NOT EXISTS commits ( id TEXT NOT NULL PRIMARY KEY, project_hash TEXT NOT NULL, branc** — Creates a table to store commit information `commit-manager.ts:56-64`
- **CREATE TABLE IF NOT EXISTS prolly_nodes ( id TEXT NOT NULL PRIMARY KEY, level INTEGER DEFAULT 0, "ke** — Creates a table for storing node data if it doesn't exist `node-store.ts:81-88`
- **DELETE FROM commits WHERE project_hash = ? AND branch_name = ? AND id NOT IN (${Array.from(keepHashe** — Creates a SQL query to delete commits that do not match specified project hash, branch name, and are not in a list of keep hashes `commit-manager.ts:472-476`
- **DELETE FROM prolly_nodes WHERE id = ?** — Deletes a row from the prolly_nodes table where the id matches the given value `node-store.ts:358-358`
- **DELETE FROM prolly_nodes WHERE id IN (${hashes.map(() => "?").join(",")})** — Deletes rows from the prolly_nodes table where the ids are in the provided list `node-store.ts:375-375`
- **INSERT INTO commits (id, project_hash, branch_name, parent_id, root_id, message, created_at) VALUES (** — Inserts a new commit into the commits table `commit-manager.ts:129-130`
- **INSERT INTO prolly_nodes (id, level, "keys", "values", children, hash) VALUES (?, ?, ?, ?, ?, ?)** — Inserts a new node into the prolly_nodes table with specified values `node-store.ts:149-150`
- **SELECT * FROM branch_heads WHERE project_hash = ?** — Retrieves all branch heads for a specific project `commit-manager.ts:327-327`
- **SELECT * FROM commits WHERE id = ?** — Retrieves a commit by its ID `commit-manager.ts:159-159`
- **SELECT * FROM commits WHERE project_hash = ? AND branch_name = ? AND created_at >= ? ORDER BY create** — Retrieves commits for a specific project and branch with a creation time greater than or equal to a given value, ordered by creation time `commit-manager.ts:196-200`
- **SELECT * FROM commits WHERE project_hash = ? AND branch_name = ? ORDER BY created_at DESC LIMIT ?** — Retrieves commits for a specific project and branch, ordered by creation time `commit-manager.ts:176-179`
- **SELECT * FROM prolly_nodes WHERE id = ?** — Selects all columns from the prolly_nodes table where the id matches the given value `node-store.ts:250-250`
- **SELECT * FROM prolly_nodes WHERE id IN (${toFetch.map(() => "?").join(",")})** — Selects all columns from the prolly_nodes table where the ids are in the provided list `node-store.ts:318-318`
- **SELECT 1 FROM prolly_nodes WHERE id = ?** — Selects a row from the prolly_nodes table where the id matches the given value `node-store.ts:130-130`
- **SELECT 1 FROM prolly_nodes WHERE id = ?** — Defines a SQL query to check the existence of a node by its ID `node-store.ts:344-344`
- **SELECT commit_hash FROM branch_heads WHERE project_hash = ? AND branch_name = ?** — Retrieves the commit hash for a specific project and branch `commit-manager.ts:294-294`
- **SELECT COUNT(DISTINCT branch_name) as branches FROM branch_heads WHERE project_hash = ?** — Counts the number of distinct branches for a specific project `commit-manager.ts:407-407`
- **SELECT DISTINCT root_id FROM commits** — Executes a query to select distinct root IDs from the commits table `commit-manager.ts:448-448`
- **SELECT DISTINCT root_id FROM commits WHERE project_hash = ?** — Retrieves distinct root IDs for commits of a specific project `commit-manager.ts:433-433`
- **SELECT id FROM commits WHERE project_hash = ? AND branch_name = ? ORDER BY created_at DESC LIMIT ?** — Constructs a SQL query to select commit IDs based on project hash and branch name, ordered by creation time, with a limit `commit-manager.ts:462-465`
- **SELECT id FROM prolly_nodes** — Selects ids from the prolly_nodes table `node-store.ts:434-434`
- **SELECT id FROM prolly_nodes WHERE id IN (${toInsert.map(() => "?").join(",")})** — Selects ids from the prolly_nodes table where the ids are in the provided list `node-store.ts:186-186`

## Data Flow

- **Inputs**: Entity objects serialized to CBOR, commit messages, branch names, and project hashes.
- **Processing**: Entries are sorted, chunked into leaf nodes via probabilistic boundaries (xxHash64), and organized into a B-tree with internal nodes; commits reference the tree root hash.
- **Outputs**: GraphCommit objects, TreeDiff results (added/modified/deleted entries), entity snapshots at historical points, and BranchDiffCache for O(1) lookups.

## Public API

| Export | Type | Description | Location |
|--------|------|-------------|----------|
| `ProllyTree` | class | Probabilistic B-tree with build, get, insert, and O(log n) diff | [`prolly-tree.ts:33-717`](./prolly-tree.ts) |
| `serializeEntity` | function | Serializes entity objects to CBOR Uint8Array | [`prolly-tree.ts`](./prolly-tree.ts) |
| `deserializeEntity` | function | Deserializes CBOR Uint8Array back to entity objects | [`prolly-tree.ts`](./prolly-tree.ts) |
| `ProllyNodeStore` | class | Content-addressed node storage with LRU cache and CBOR serialization | [`node-store.ts:41-565`](./node-store.ts) |
| `NodeStoreConfig` | interface | Cache size and enable/disable configuration | [`node-store.ts:25-30`](./node-store.ts) |
| `CommitManager` | class | Graph versioning with commit creation and branch head management | [`commit-manager.ts:23-520`](./commit-manager.ts) |
| `TimeTravelManager` | class | Historical queries: entity history, commit diffs, entity-at-version | [`time-travel.ts:23-398`](./time-travel.ts) |
| `BranchDiffCache` | class | O(1) branch diff cache replacing tombstone queries | [`branch-diff-cache.ts:27-217`](./branch-diff-cache.ts) |
| `createCachedTombstoneGetter` | function | Creates tombstone getter backed by BranchDiffCache | [`branch-diff-cache.ts`](./branch-diff-cache.ts) |
| `getRecentlyChangedEntities` | function | Extracts recently changed entity IDs from commit history | [`recently-changed.ts:37-115`](./recently-changed.ts) |
| `GraphCommit` | interface | Commit snapshot with root hash, parent, counts, and timestamp | [`types.ts:92-122`](./types.ts) |
| `TreeDiff` | interface | Diff result with added, modified, deleted entries and statistics | [`types.ts:152-168`](./types.ts) |
| `ProllyNode` | interface | Content-addressed tree node with hash, type, and child references | [`types.ts:26-50`](./types.ts) |
| `ProllyTreeConfig` | interface | Chunk pattern, min/max leaf entries, and cache settings | [`types.ts:251-285`](./types.ts) |

## Dependencies

### Internal Modules

| Module | Purpose |
|--------|---------|
| `logging` | Structured logging |
| `storage/libsql-graph-adapter` | GraphAdapter reference for recently-changed utility |

### External Packages

| Package | Purpose |
|---------|---------|
| `better-sqlite3` / `bun:sqlite` | Native SQLite via NativeSQLiteClient for node and commit persistence |
| `cbor-x` | CBOR serialization for compact binary node storage |
| `xxhash-wasm` | xxHash64 for fast content-based hashing |
| `lru-cache` | LRU cache for hot node access in ProllyNodeStore |

## Behavioral Properties

| Property | Value |
|----------|-------|
| Default chunk pattern | 0xFFF (~4KB average chunk size) |
| Default leaf entries | min: 4, max: 256 |
| Default node cache size | 1000 nodes LRU |

## Error Handling

CommitManager validates client initialization before operations. ProllyNodeStore returns null for missing nodes rather than throwing. TimeTravelManager returns null when commits or entities are not found at requested versions. BranchDiffCache sets cache to null when branch commits are unavailable.

## Performance

| Operation | Complexity | Typical Time |
|----------|-----------|----------------|
| Tree building (1000 entities) | O(n log n) | ~50ms |
| Diff of two commits (1000 changes) | O(log n + k) | ~30ms |
| Entity history (50 commits) | O(k * log n) | ~100ms |
| Branch diff lookup | O(1) | <1ms |

## Key Concepts

### Prolly Tree

Prolly Tree (Probabilistic B-tree) is a B-tree where node boundaries are determined by content hash rather than fixed size. This provides:

- **Structural sharing** — identical subtrees are shared between versions
- **Efficient diff** — O(log n) version comparison via root hashes
- **Content-addressability** — nodes are identified by content hash

### Commits

Each commit contains:
- `commitHash` — unique identifier (SHA-256)
- `rootNodeHash` — Prolly Tree root at the time of the commit
- `parentHash` — reference to the previous commit
- `entityCount`, `relationshipCount` — statistics
- `message` — optional description
- `createdAt` — timestamp

### Branch Diff Cache

Optimization for feature branches:
- Instead of O(n) tombstone queries — O(1) lookup in the cache
- Cache is built when switching to a feature branch
- Contains a set of deleted entity IDs

## API

### ProllyTree

```typescript
const tree = new ProllyTree(nodeStore);
await tree.initialize();

// Build tree from entries
const entries = entities.map(e => ({
  key: e.id,
  value: serializeEntity(e)
}));
const rootHash = await tree.build(entries);

// Get value by key
const value = await tree.get(entityId);

// Compare with another version
tree.setRootHash(commitA.rootNodeHash);
const diff = await tree.diff(commitB.rootNodeHash);
// diff = { added: [...], modified: [...], deleted: [...] }
```

### CommitManager

```typescript
const commitManager = new CommitManager();
await commitManager.initialize(client);
commitManager.setContext(projectHash, branchName);

// Create a commit
const commit = await commitManager.commit(
  rootHash,
  null, // fileTreeHash
  { entityCount: 100, relationshipCount: 50 },
  "Index: 42 files"
);

// Get history
const history = await commitManager.getHistory(100);

// Get HEAD of the current branch
const head = await commitManager.getBranchHead();

// Get commits for a period (for analyze_hotspots)
const sinceTimestamp = Date.now() - 30 * 24 * 60 * 60 * 1000; // 30 days
const recentCommits = await commitManager.getCommitsSince(sinceTimestamp, 1000);
```

### TimeTravelManager

```typescript
const timeTravel = new TimeTravelManager(nodeStore, commitManager);

// Entity change history
const history = await timeTravel.getEntityHistory(entityId, 50);
// [{commitHash, changeType: 'add'|'modify'|'delete', timestamp, oldValue?, newValue?}]

// Get entity at a specific version
const entity = await timeTravel.getEntityAt(entityId, commitHash);

// Diff between commits
const diff = await timeTravel.diffCommits(commitA, commitB);
// {fromCommit, toCommit, treeDiff: {added, modified, deleted}, commitPath}

// Compare entity between versions
const cmp = await timeTravel.compareEntity(entityId, commitA, commitB);
// {entityA, entityB, changed: boolean}
```

## MCP Tools

### list_commits

```json
{
  "commits": [
    {
      "hash": "abc123...",
      "message": "Index: 42 files",
      "entityCount": 1500,
      "relationshipCount": 3200,
      "createdAt": "2024-01-15T10:30:00Z",
      "parentHash": "def456"
    }
  ],
  "total": 15
}
```

### get_entity_history

```json
{
  "entityId": "e1a2b3c4",
  "changes": [
    {
      "commitHash": "abc123...",
      "changeType": "modify",
      "timestamp": "2024-01-15T10:30:00Z",
      "entitySnapshot": { "name": "MyClass", "type": "class" }
    },
    {
      "commitHash": "def456...",
      "changeType": "add",
      "timestamp": "2024-01-10T09:00:00Z"
    }
  ],
  "totalChanges": 2
}
```

### diff_commits

```json
{
  "commitA": "def456...",
  "commitB": "abc123...",
  "summary": {
    "added": 5,
    "modified": 12,
    "deleted": 2
  },
  "added": [{"key": "newEntity1"}],
  "modified": [{"key": "changedEntity1"}],
  "deleted": [{"key": "removedEntity1"}]
}
```

### checkout_commit

```json
{
  "commit": {
    "hash": "def456...",
    "message": "Index: 30 files",
    "entityCount": 1200,
    "createdAt": "2024-01-10T09:00:00Z"
  },
  "entity": { "id": "e1a2b3c4", "name": "MyClass", "type": "class" }
}
```

## Integration

### DevAgent

After indexing, a graph commit is automatically created:

```typescript
// In performRealIndexing() and handleIncrementalReindex()
const adapter = storage.getLibSQLAdapter();
if (adapter?.createGraphCommit) {
  const commitHash = await adapter.createGraphCommit(`Index: ${filesProcessed} files`);
}
```

### switch_branch

When switching to a feature branch, BranchDiffCache is initialized:

```typescript
// In SwitchBranchToolHandler.execute()
if (!baseBranches.includes(branchName)) {
  await adapter.initBranchDiff(baseBranch);
}
```

## Database Tables

### prolly_nodes

```sql
CREATE TABLE prolly_nodes (
  hash TEXT PRIMARY KEY,
  data BLOB NOT NULL,
  ref_count INTEGER DEFAULT 1,
  created_at INTEGER NOT NULL
)
```

### graph_commits

```sql
CREATE TABLE graph_commits (
  commit_hash TEXT PRIMARY KEY,
  project_hash TEXT NOT NULL,
  branch_name TEXT NOT NULL,
  root_node_hash TEXT NOT NULL,
  file_tree_hash TEXT,
  parent_hash TEXT,
  entity_count INTEGER NOT NULL,
  relationship_count INTEGER NOT NULL,
  message TEXT,
  created_at INTEGER NOT NULL
)
```

### branch_heads

```sql
CREATE TABLE branch_heads (
  project_hash TEXT NOT NULL,
  branch_name TEXT NOT NULL,
  commit_hash TEXT NOT NULL,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (project_hash, branch_name)
)
```

## Integration with analyze_hotspots

Prolly Tree is used for calculating `changeFrequency` in `analyze_hotspots`:

```typescript
// In AnalyzeHotspotsToolHandler.preloadChangeFrequencies():
// 1. Get commits for the specified period
const recentCommits = await commitManager.getCommitsSince(sinceTimestamp);

// 2. Compare each pair of commits
for (let i = 0; i < recentCommits.length - 1; i++) {
  const diff = await timeTravel.diffCommits(parent.commitHash, current.commitHash);
  // Count changes for each entity
}

// 3. Git fallback for entities without Prolly data
const gitCount = getChangeFrequencyFromGit(filePath, lookbackDays);
```

**Schema parameters:**
- `includeHistoricalMetrics` (default: true) — use history for changeFrequency
- `lookbackDays` (default: 30) — analysis period in days

**Result:**
```json
{
  "changeFrequency": 5,
  "changeFrequencyScore": 17.92,
  "changeSource": "prolly | git | none"
}
```

## Known Limitations

- File system Merkle tree (file_tree) is defined in types but not yet fully implemented (fileCount always returns 0).
- Garbage collection for orphaned nodes is defined but not automatically triggered.
- Commit history traversal is linear (no merge commit support).

## Exports

- `BranchDiffCache`
- `createCachedTombstoneGetter`
- `CommitManager`
- `ProllyNodeStore`
- `deserializeEntity`
- `ProllyTree`
- `serializeEntity`
- `getRecentlyChangedEntities`
- `TimeTravelManager`

## Files

| File | Description |
|------|-------------|
| `branch-diff-cache.ts` | O(1) branch diff cache computed from Prolly Tree diff on branch switch |
| `commit-manager.ts` | Commit creation, branch head management, and history traversal |
| `index.ts` | Re-exports all Prolly Tree components and types |
| `node-store.ts` | Content-addressed node storage with xxHash64, LRU cache, and CBOR serialization |
| `prolly-tree.ts` | Core Prolly Tree with probabilistic chunking, build, get, insert, and O(log n) diff |
| `recently-changed.ts` | Utility for extracting recently changed entity IDs from commit history |
| `time-travel.ts` | Historical query API: entity-at-version, entity history, and commit diffs |
| `types.ts` | Complete type definitions for nodes, commits, diffs, verification, and configuration |
