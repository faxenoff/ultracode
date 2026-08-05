# Search Module

## 🤖 Overview

The `src/search` module implements a comprehensive search engine using various algorithms and data structures. It includes BM25 scoring, trigram indexing, and pattern matching for efficient document retrieval. This module is used by developers and data scientists to build and optimize search functionalities in applications.

## 🤖 Architecture

```
bm25.ts
    |
    v
code-classifier.ts
    |
    v
keyword-triage.ts
    |
    v
pattern-search.ts
    |
    v
stemmer.ts
    |
    v
stopwords.ts
    |
    v
trigram-extract.ts
    |
    v
trigram-index.ts
    |
    v
trigram-types.ts
    |
    v
varint.ts
```

## 🤖 Flow

```
searchQuery → patternSearch → trigramExtract → trigramIndex → BM25Score → codeClassifier → keywordTriage → finalResult
```

## 🤖 Entity Listing

### Function
- **applyRules** — Applies a set of rules to a word `stemmer.ts:138-149`
- **bm25Idf** — Computes IDF using the BM25 variant `bm25.ts:45-47`
- **bm25Score** — Computes BM25 score for a single term in a single document `bm25.ts:29-37`
- **bm25ScoreDocument** — Batch-scores multiple query terms against a document and returns the sum of BM25 scores `bm25.ts:59-74`
- **buildCodeBitmap** — Builds a bitmap of code classification for a given source array `code-classifier.ts:154-166`
- **containsVowel** — Checks if a word contains at least one vowel `stemmer.ts:49-54`
- **countNewlines** — Counts the number of newline characters in a source array `code-classifier.ts:182-206`
- **decode** — Decodes a LEB128-encoded u32 from buf `varint.ts:36-53`
- **decodeDelta** — Delta+LEB128 decodes `count` u32 file IDs from buf `varint.ts:73-85`
- **decomposePattern** — Parses a string pattern into a sorted array of trigram numbers `trigram-extract.ts:135-147`
- **encode** — Encodes a u32 value into buf using LEB128 `varint.ts:17-30`
- **encodeDelta** — Delta+LEB128 encodes a sorted array of u32 file IDs `varint.ts:59-68`
- **endsCvc** — Determines if a word ends with a consonant-vowel-consonant pattern `stemmer.ts:56-63`
- **endsWith** — Checks if a word ends with a specified suffix `stemmer.ts:65-71`
- **extractRegexLiterals** — Extracts literal alphanumeric substrings (≥3 chars) from a regex pattern `trigram-index.ts:33-45`
- **extractTrigrams** — Extracts all unique trigrams from content with bloom masks `trigram-extract.ts:26-66`
- **extractTrigramsFiltered** — Extract trigrams only from "live code" bytes `trigram-extract.ts:84-129`
- **extractTrigramsFromString** — Extract trigrams from a string (convenience wrapper) `trigram-extract.ts:71-73`
- **frameworkInfo** — Represents framework-aware filtering for pattern-based search `pattern-search.ts:431-431`
- **getKeywordsForLanguage** — Returns an array of keywords specific to a given programming language `keyword-triage.ts:123-154`
- **intersectSorted** — Returns the intersection of two sorted arrays `trigram-index.ts:444-460`
- **isCodeByte** — Checks if a specific byte in a code bitmap is classified as code `code-classifier.ts:171-176`
- **isConsonant** — Determines if a character is a consonant `stemmer.ts:19-28`
- **isDoubleEnd** — Checks if a word ends with a double consonant `stemmer.ts:106-108`
- **isIdentCont** — Checks if a character is part of an identifier continuation `keyword-triage.ts:110-117`
- **isStopword** — Checks if a given word is a stopword from the extended list of English, programming, and code tokens `stopwords.ts:272-274`
- **isVowel** — Checks if a character is a vowel `stemmer.ts:14-17`
- **isWordBoundary** — Determines if a character is a word boundary `code-classifier.ts:212-230`
- **kwBytes** — Encodes keywords as byte arrays for efficient scanning `keyword-triage.ts:50-50`
- **maxEncodedSize** — Not applicable in this context `varint.ts:88-90`
- **measure** — Counts VC groups in a word `stemmer.ts:31-47`
- **packTrigram** — Packs a trigram into a binary format `trigram-types.ts:91-93`
- **readHeader** — Reads the header from a file `trigram-types.ts:124-140`
- **replaceSuffix** — Replaces a suffix in a word `stemmer.ts:73-78`
- **scanForKeywords** — Scans a file for entity-defining keywords using CodeClassifier to skip strings/comments, returning a result with keyword presence and count `keyword-triage.ts:34-108`
- **sortedTrigrams** — Creates a sorted array of trigram keys `trigram-index.ts:111-111`
- **stem** — Applies all steps of the Porter algorithm to a word `stemmer.ts:269-294`
- **step1a** — Implements step 1a of the Porter algorithm `stemmer.ts:82-88`
- **step1b** — Implements step 1b of the Porter algorithm `stemmer.ts:110-124`
- **step1bFixup** — Fixes up step 1b of the Porter algorithm `stemmer.ts:90-104`
- **step1c** — Implements step 1c of the Porter algorithm `stemmer.ts:126-131`
- **step2** — Implements step 2 of the Porter algorithm `stemmer.ts:151-180`
- **step3** — Implements step 3 of the Porter algorithm `stemmer.ts:182-198`
- **step4** — Implements step 4 of the Porter algorithm `stemmer.ts:200-236`
- **step5** — Implements step 5 of the Porter algorithm `stemmer.ts:238-255`
- **trigramToString** — Converts a trigram to a string `trigram-types.ts:101-104`
- **unpackTrigram** — Unpacks a trigram from a binary format `trigram-types.ts:96-98`
- **writeHeader** — Writes the header to a file `trigram-types.ts:110-122`

### Method
- **addFile** — Adds a file to the builder, ensuring it is not duplicated `trigram-index.ts:62-67`
- **build** — Builds the trigram index from the added files `trigram-index.ts:90-204`
- **classifyChunk** — Classifies a 32-byte chunk, returning a u32 bitmask where bit=1 means "live code" `code-classifier.ts:49-134`
- **clear** — Clears the file and file ID map of the trigram index `trigram-index.ts:207-210`
- **computeSemanticSimilarity** — Computes the semantic similarity between two entities `pattern-search.ts:398-424`
- **constructor** — Initializes the PatternSearch instance with necessary dependencies `pattern-search.ts:75-79`
- **constructor** — Initializes a new instance of the TrigramBuilder class `trigram-index.ts:222-226`
- **executeSearch** — Executes a search operation by decomposing the pattern into trigrams, looking up posting lists, intersecting them, and verifying matches by reading actual files `trigram-index.ts:294-436`
- **fallbackEntitySearch** — Fallback search method for entities `pattern-search.ts:301-321`
- **fileCount** — Returns the current number of files added to the builder `trigram-index.ts:70-72`
- **fileCount** — Returns the number of files currently in the builder `trigram-index.ts:242-244`
- **generateSnippet** — Generates a code snippet for the entity `pattern-search.ts:361-379`
- **getEntityContent** — Retrieves the content of an entity `pattern-search.ts:350-359`
- **getFilePath** — Retrieves the file path by file ID from the trigram index `trigram-index.ts:251-257`
- **getFilesForFrameworks** — Retrieves files for specified frameworks `pattern-search.ts:426-448`
- **initialize** — Initializes the embedding generator if not already initialized `pattern-search.ts:84-93`
- **lookupTrigram** — Performs a binary search to find a trigram in the trigram table and returns its entry or null `trigram-index.ts:260-282`
- **mergeFrom** — Merges another builder's postings into this one `trigram-index.ts:83-87`
- **mergeResults** — Merges search results from different modes `pattern-search.ts:381-396`
- **open** — Opens a file for reading or writing `trigram-index.ts:229-239`
- **readPostingList** — Parses a posting list from the buffer using the provided offset and count `trigram-index.ts:285-289`
- **reset** — Resets the state of a code classifier `code-classifier.ts:137-142`
- **search** — Performs a search based on the specified pattern and mode `pattern-search.ts:98-111`
- **searchContent** — Searches for content within entities matching the pattern `pattern-search.ts:156-197`
- **searchEntities** — Searches for entities matching the pattern `pattern-search.ts:117-150`
- **searchHybrid** — Performs a hybrid search combining entity, content, and semantic modes `pattern-search.ts:327-344`
- **searchSemantic** — Searches for semantic similarity matches `pattern-search.ts:203-296`
- **trigramCount** — Returns the count of trigrams in the trigram index `trigram-index.ts:246-248`

### Class
- **CodeClassifier** — Stateful classifier that tracks string/comment context across chunks `code-classifier.ts:34-143`
- **PatternSearch** — A class for performing pattern-based searches in code `pattern-search.ts:72-449`
- **TrigramBuilder** — A class for building a trigram index by adding files and merging postings `trigram-index.ts:57-211`
- **TrigramIndex** — Represents a trigram index file, providing methods to open, get file count, get trigram count, get file path by file ID, and look up trigrams `trigram-index.ts:217-437`

### Interface
- **BuilderFile** — Represents a file with its path, content hash, and trigrams `trigram-index.ts:51-55`
- **EntityFilters** — Filters for entity types, file paths, and names `pattern-search.ts:34-38`
- **FileEntry** — An interface representing a file entry in the trigram index file, containing path offset, path length, and content hash `trigram-types.ts:37-41`
- **FileTrigramData** — An interface representing per-file trigram data, containing an array of packed trigrams `trigram-types.ts:61-63`
- **Header** — Represents the header of the trigram index file, containing metadata such as magic number, version, and offsets `trigram-types.ts:26-35`
- **KeywordScanResult** — Represents the result of scanning a file for entity-defining keywords, including whether any keywords were found, the count of keywords, and an estimate of the number of entities `keyword-triage.ts:20-24`
- **PackedTrigram** — An interface representing a packed trigram, containing trigram, next mask, and location mask `trigram-types.ts:55-59`
- **PatternSearchQuery** — Query for pattern-based search with various modes and filters `pattern-search.ts:40-54`
- **PatternSearchResult** — Result of a pattern-based search `pattern-search.ts:56-66`
- **SearchMatch** — Represents a match found during a search `trigram-types.ts:77-84`
- **SearchOptions** — Configuration options for a search operation `trigram-types.ts:69-75`
- **StemRule** — Represents a rule for stemming `stemmer.ts:133-136`
- **TrigramTableEntry** — An interface representing a trigram table entry, containing bloom masks, trigram, posting offset, posting count, and location mask `trigram-types.ts:43-49`

### Import_decl
- **../analysis/technology-detector.js** — Imports `../analysis/technology-detector.js` from `../analysis/technology-detector.js`. `pattern-search.ts:22-22`
- **../logging/index.js** — Imports `../logging/index.js` from `../logging/index.js`. `pattern-search.ts:23-23`
- **../semantic/embedding-generator.js** — Imports `../semantic/embedding-generator.js` from `../semantic/embedding-generator.js`. `pattern-search.ts:24-24`
- **../semantic/vector-store.js** — Imports `../semantic/vector-store.js` from `../semantic/vector-store.js`. `pattern-search.ts:25-25`
- **../types/storage.js** — Imports `../types/storage.js` from `../types/storage.js`. `pattern-search.ts:26-26`
- **../utils/file-ops.js** — Imports `../utils/file-ops.js` from `../utils/file-ops.js`. `pattern-search.ts:27-27`
- **../utils/simd-vector-ops.js** — Imports `../utils/simd-vector-ops.js` from `../utils/simd-vector-ops.js`. `pattern-search.ts:28-28`
- **./code-classifier.js** — Imports `./code-classifier.js` from `./code-classifier.js`. `keyword-triage.ts:16-16`, `trigram-extract.ts:15-15`
- **./trigram-extract.js** — Imports `./trigram-extract.js` from `./trigram-extract.js`. `trigram-index.ts:13-13`
- **./trigram-types.js** — Imports `./trigram-types.js` from `./trigram-types.js`. `trigram-index.ts:14-14`, `trigram-extract.ts:16-16`, `trigram-extract.ts:17-17`
- **./trigram-types.js** — Imports `./trigram-types.js`. `trigram-index.ts:15-25`
- **./varint.js** — Imports `./varint.js` from `./varint.js`. `trigram-index.ts:26-26`
- **node:fs** — Imports `node:fs` from `node:fs`. `trigram-index.ts:12-12`

### Property
- **buf** — Stores the buffer of the trigram index file `trigram-index.ts:218-218`
- **caseInsensitive** — Whether the search is case-insensitive `trigram-types.ts:73-73`
- **column** — Column number in the line where the match was found `trigram-types.ts:80-80`
- **contains** — Content must contain this string `pattern-search.ts:48-48`
- **contentFilter** — Content filters for search `pattern-search.ts:47-51`
- **contentHash** — The content hash of the file `trigram-index.ts:53-53`
- **contentHash** — A field in the FileEntry interface representing the content hash of the file `trigram-types.ts:40-40`
- **contextAfter** — Context after the match `trigram-types.ts:83-83`
- **contextBefore** — Context before the match `trigram-types.ts:82-82`
- **contextLines** — Number of lines of context to include around each match `trigram-types.ts:71-71`
- **embeddingGenerator** — Generates embeddings for semantic similarity searches `pattern-search.ts:73-73`
- **end** — Marks the end position of the match `pattern-search.ts:64-64`
- **entity** — Entity found in the search `pattern-search.ts:57-57`
- **entityType** — Entity type for filtering `pattern-search.ts:35-35`
- **entityTypes** — Entity types for filtering `pattern-search.ts:43-43`
- **entries** — A field in the FileTrigramData interface representing the array of packed trigrams `trigram-types.ts:62-62`
- **estimatedEntities** — Estimates the number of entities based on the presence of entity-defining keywords `keyword-triage.ts:23-23`
- **fileCount** — A constant representing the size of the file entry array `trigram-types.ts:29-29`
- **fileIdMap** — A map from file paths to their indices in the files array `trigram-index.ts:59-59`
- **filePath** — File path for filtering `pattern-search.ts:36-36`
- **filePath** — Represents the file path of the entity being searched `pattern-search.ts:233-233`
- **filePath** — Path of the file where the match was found `trigram-types.ts:78-78`
- **filePattern** — Pattern to match files `trigram-types.ts:72-72`
- **files** — File paths for filtering `pattern-search.ts:44-44`
- **files** — An array of files added to the builder `trigram-index.ts:58-58`
- **fileTableOffset** — A constant representing the offset of the file table within the trigram index file `trigram-types.ts:31-31`
- **frameworks** — Frameworks for filtering `pattern-search.ts:45-45`
- **hasEntityKeywords** — Indicates whether the file contains any entity-defining keywords `keyword-triage.ts:21-21`
- **header** — Stores the header of the trigram index file `trigram-index.ts:220-220`
- **highlights** — Highlights the positions of the match within the code `pattern-search.ts:61-65`
- **inBlockComment** — Tracks whether the current chunk is inside a block comment `code-classifier.ts:38-38`
- **inLineComment** — Tracks whether the current chunk is inside a line comment `code-classifier.ts:37-37`
- **inString** — Tracks whether the current chunk is inside a string literal `code-classifier.ts:35-35`
- **isRegex** — Whether the search uses regular expressions `trigram-types.ts:74-74`
- **keywordCount** — Counts the number of entity-defining keywords found in the file `keyword-triage.ts:22-22`
- **len** — Not applicable in this context `varint.ts:36-36`
- **limit** — Limit for search results `pattern-search.ts:52-52`
- **lineContent** — Content of the line where the match was found `trigram-types.ts:81-81`
- **lineNumber** — Line number in the file where the match was found `trigram-types.ts:79-79`
- **locMask** — Bloom filter of occurrence positions mod 8 `trigram-extract.ts:30-30`
- **locMask** — Represents the location mask value for a given next mask `trigram-extract.ts:90-90`
- **locMask** — Stores the location mask for a trigram in a map `trigram-index.ts:93-93`
- **locMask** — A field in the TrigramTableEntry interface representing the bloom mask for the location `trigram-types.ts:48-48`
- **locMask** — Indicates an 8-bit unsigned integer `trigram-types.ts:58-58`
- **magic** — A 4-byte constant representing the magic number "TGI\x01" `trigram-types.ts:27-27`
- **matchType** — Indicates the type of match found in the search `pattern-search.ts:58-58`
- **maxResults** — Maximum number of results to return `trigram-types.ts:70-70`
- **mode** — Search mode: entity, content, semantic, or hybrid `pattern-search.ts:53-53`
- **name** — Regular expression for entity name filtering `pattern-search.ts:37-37`
- **name** — Represents the name of the entity being searched `pattern-search.ts:235-235`
- **nextMask** — Bloom filter of characters that follow this trigram `trigram-extract.ts:30-30`
- **nextMask** — Represents the next mask value for a given location mask `trigram-extract.ts:90-90`
- **nextMask** — Stores the next mask for a trigram in a map `trigram-index.ts:93-93`
- **nextMask** — A field in the TrigramTableEntry interface representing the bloom mask for the next character `trigram-types.ts:44-44`
- **nextMask** — Stores a 64-bit unsigned integer `trigram-types.ts:57-57`
- **path** — The file path `trigram-index.ts:52-52`
- **pathLen** — A field in the FileEntry interface representing the length of the file path `trigram-types.ts:39-39`
- **pathOffset** — A field in the FileEntry interface representing the offset of the file path in the string table `trigram-types.ts:38-38`
- **pattern** — Pattern or semantic query for search `pattern-search.ts:41-41`
- **postingCount** — A field in the TrigramTableEntry interface representing the number of postings `trigram-types.ts:47-47`
- **postingOffset** — A field in the TrigramTableEntry interface representing the byte offset of the postings section `trigram-types.ts:46-46`
- **postingsOffset** — A constant representing the offset of the postings section within the trigram index file `trigram-types.ts:34-34`
- **regex** — Content must match this regex `pattern-search.ts:49-49`
- **replacement** — Represents a replacement for a suffix `stemmer.ts:135-135`
- **scope** — Scope filters for entity types, files, and frameworks `pattern-search.ts:42-46`
- **score** — Represents the similarity score of the match `pattern-search.ts:59-59`
- **semantic** — Semantic similarity to this description `pattern-search.ts:50-50`
- **similarity** — Computes the similarity between two entities `pattern-search.ts:232-232`
- **snippet** — Provides a code snippet showing the match `pattern-search.ts:60-60`
- **start** — Marks the start position of the match `pattern-search.ts:63-63`
- **stringChar** — Stores the character that started the string literal `code-classifier.ts:36-36`
- **stringTableOffset** — A constant representing the offset of the string table within the trigram index file `trigram-types.ts:32-32`
- **suffix** — Represents a suffix for stemming `stemmer.ts:134-134`
- **trigram** — A field in the TrigramTableEntry interface representing the trigram value `trigram-types.ts:45-45`
- **trigram** — Represents a 24-bit unsigned integer `trigram-types.ts:56-56`
- **trigramCount** — A constant representing the size of the trigram entry array `trigram-types.ts:30-30`
- **trigrams** — The pre-extracted trigrams for the file `trigram-index.ts:54-54`
- **trigramTableOffset** — A constant representing the offset of the trigram table within the trigram index file `trigram-types.ts:33-33`
- **type** — Represents the type of the entity being searched `pattern-search.ts:234-234`
- **value** — Not applicable in this context `varint.ts:36-36`
- **version** — A constant representing the version of the trigram index file `trigram-types.ts:28-28`
- **view** — Stores the DataView of the trigram index file `trigram-index.ts:219-219`

## Data Flow

### Inputs
| Source | Data | Type |
|--------|------|------|
| MCP tool handler | `PatternSearchQuery` (pattern, mode, scope, contentFilter, limit) | Structured query |
| `GraphStorage` | Indexed entities with locations and metadata | Database |
| `VectorStore` | Pre-computed embedding vectors | In-memory FAISS |

### Processing
1. Route query to mode-specific handler (entity / content / semantic / hybrid)
2. Build scope filters (entity types, file paths, framework-aware file resolution)
3. Execute graph queries or vector similarity search
4. Apply content filters (substring, regex, semantic threshold >= 0.7)
5. Merge, deduplicate by entity ID, sort by score descending, apply limit

### Outputs
| Target | Data | Type |
|--------|------|------|
| Caller | `PatternSearchResult[]` with entity, matchType, score, snippet | Array |

## Public API

| Export | Type | Description | Location |
|--------|------|-------------|----------|
| `PatternSearch` | class | Main search engine with four modes and lazy embedding init | [`pattern-search.ts:72-406`](./pattern-search.ts) |
| `PatternSearchQuery` | interface | Query config: pattern, mode, scope filters, content filters, limit | [`pattern-search.ts:40-54`](./pattern-search.ts) |
| `PatternSearchResult` | interface | Result with entity, matchType, score, optional snippet and highlights | [`pattern-search.ts:56-66`](./pattern-search.ts) |

### Key Methods

| Method | Signature | Description |
|--------|-----------|-------------|
| `initialize` | `() => Promise<void>` | Load EmbeddingGenerator for semantic search; logs warning on failure |
| `search` | `(query: PatternSearchQuery) => Promise<PatternSearchResult[]>` | Dispatch to mode-specific handler |


### Added Entities

- **CodeClassifier** — `code-classifier.ts:34-143`
- **TrigramBuilder** — `trigram-index.ts:38-192`
- **TrigramIndex** — `trigram-index.ts:198-357`
- **KeywordScanResult** — `keyword-triage.ts:20-24`
- **StemRule** — `stemmer.ts:133-136`
- **BuilderFile** — `trigram-index.ts:32-36`
- **Header** — `trigram-types.ts:26-35`
- **FileEntry** — `trigram-types.ts:37-41`
- **TrigramTableEntry** — `trigram-types.ts:43-49`
- **PackedTrigram** — `trigram-types.ts:55-59`
- **FileTrigramData** — `trigram-types.ts:61-63`
- **SearchOptions** — `trigram-types.ts:69-74`
- **SearchMatch** — `trigram-types.ts:76-83`
- **bm25Score** — `bm25.ts:29-37`
- **bm25Idf** — `bm25.ts:45-47`
- **bm25ScoreDocument** — `bm25.ts:59-74`
- **buildCodeBitmap** — `code-classifier.ts:154-166`
- **isCodeByte** — `code-classifier.ts:171-176`
- **countNewlines** — `code-classifier.ts:182-206`
- **isWordBoundary** — `code-classifier.ts:212-230`
- **scanForKeywords** — `keyword-triage.ts:34-108`
- **isIdentCont** — `keyword-triage.ts:110-117`
- **getKeywordsForLanguage** — `keyword-triage.ts:123-154`
- **isVowel** — `stemmer.ts:14-17`
- **isConsonant** — `stemmer.ts:19-28`
- **measure** — `stemmer.ts:31-47`
- **containsVowel** — `stemmer.ts:49-54`
- **endsCvc** — `stemmer.ts:56-63`
- **endsWith** — `stemmer.ts:65-71`
- **replaceSuffix** — `stemmer.ts:73-78`
- **step1a** — `stemmer.ts:82-88`
- **step1bFixup** — `stemmer.ts:90-104`
- **isDoubleEnd** — `stemmer.ts:106-108`
- **step1b** — `stemmer.ts:110-124`
- **step1c** — `stemmer.ts:126-131`
- **applyRules** — `stemmer.ts:138-149`
- **step2** — `stemmer.ts:151-180`
- **step3** — `stemmer.ts:182-198`
- **step4** — `stemmer.ts:200-236`
- **step5** — `stemmer.ts:238-255`
- **stem** — `stemmer.ts:269-294`
- **isStopword** — `stopwords.ts:272-274`
- **extractTrigrams** — `trigram-extract.ts:26-65`
- **extractTrigramsFromString** — `trigram-extract.ts:70-72`
- **extractTrigramsFiltered** — `trigram-extract.ts:83-127`
- **decomposePattern** — `trigram-extract.ts:133-145`
- **intersectSorted** — `trigram-index.ts:364-380`
- **packTrigram** — `trigram-types.ts:90-92`
- **unpackTrigram** — `trigram-types.ts:95-97`
- **trigramToString** — `trigram-types.ts:100-103`
- **writeHeader** — `trigram-types.ts:109-121`
- **readHeader** — `trigram-types.ts:123-139`
- **encode** — `varint.ts:17-30`
- **decode** — `varint.ts:36-53`
- **encodeDelta** — `varint.ts:59-68`
- **decodeDelta** — `varint.ts:73-84`
- **maxEncodedSize** — `varint.ts:87-89`
- **classifyChunk** — `code-classifier.ts:49-134`
- **reset** — `code-classifier.ts:137-142`
- **addFile** — `trigram-index.ts:43-48`
- **fileCount** — `trigram-index.ts:51-53`
- **mergeFrom** — `trigram-index.ts:64-68`
- **build** — `trigram-index.ts:71-185`
- **clear** — `trigram-index.ts:188-191`
- **constructor** — `trigram-index.ts:203-207`
- **open** — `trigram-index.ts:210-220`
- **fileCount** — `trigram-index.ts:223-225`
- **trigramCount** — `trigram-index.ts:227-229`
- **getFilePath** — `trigram-index.ts:232-238`
- **lookupTrigram** — `trigram-index.ts:241-263`
- **readPostingList** — `trigram-index.ts:266-270`
- **executeSearch** — `trigram-index.ts:275-356`
- **BM25_K1** — `bm25.ts:16-16`
- **BM25_B** — `bm25.ts:17-17`
- **idf** — `bm25.ts:33-33`
- **df** — `bm25.ts:68-68`
- **CHUNK_LEN** — `code-classifier.ts:18-18`
- **CH_DQUOTE** — `code-classifier.ts:21-21`
- **CH_SQUOTE** — `code-classifier.ts:22-22`
- **CH_BACKTICK** — `code-classifier.ts:23-23`
- **CH_SLASH** — `code-classifier.ts:24-24`
- **CH_STAR** — `code-classifier.ts:25-25`
- **CH_HASH** — `code-classifier.ts:26-26`
- **CH_NEWLINE** — `code-classifier.ts:27-27`
- **CH_BACKSLASH** — `code-classifier.ts:28-28`
- **end** — `code-classifier.ts:50-50`
- **chunkLen** — `code-classifier.ts:51-51`
- **c** — `code-classifier.ts:58-58`
- **absI** — `code-classifier.ts:86-86`
- **ch** — `code-classifier.ts:87-87`
- **bit** — `code-classifier.ts:88-88`
- **next** — `code-classifier.ts:119-119`
- **numChunks** — `code-classifier.ts:155-155`
- **bitmap** — `code-classifier.ts:158-158`
- **cc** — `code-classifier.ts:159-159`
- **chunkIdx** — `code-classifier.ts:172-172`
- **bitIdx** — `code-classifier.ts:173-173`
- **len** — `code-classifier.ts:183-183`
- **len8** — `code-classifier.ts:187-187`
- **CHUNK_LEN** — `keyword-triage.ts:18-18`
- **keywords** — `keyword-triage.ts:35-35`
- **hashComments** — `keyword-triage.ts:40-40`
- **firstBytes** — `keyword-triage.ts:43-43`
- **encoder** — `keyword-triage.ts:49-49`
- **kwBytes** — `keyword-triage.ts:50-50`
- **cc** — `keyword-triage.ts:52-52`
- **chunkLen** — `keyword-triage.ts:57-57`
- **codeMask** — `keyword-triage.ts:60-60`
- **bit** — `keyword-triage.ts:64-64`
- **absPos** — `keyword-triage.ts:67-67`
- **ch** — `keyword-triage.ts:68-68`
- **prev** — `keyword-triage.ts:74-74`
- **afterPos** — `keyword-triage.ts:92-92`
- **c** — `stemmer.ts:21-21`
- **c** — `stemmer.ts:61-61`
- **stemLen** — `stemmer.ts:141-141`
- **suffixes** — `stemmer.ts:202-222`
- **stemLen** — `stemmer.ts:225-225`
- **m** — `stemmer.ts:243-243`
- **_buf** — `stemmer.ts:260-260`
- **lower** — `stemmer.ts:272-272`
- **len** — `stemmer.ts:273-273`
- **STOPWORD_LIST** — `stopwords.ts:12-266`
- **STOPWORDS** — `stopwords.ts:269-269`
- **map** — `trigram-extract.ts:30-30`
- **last** — `trigram-extract.ts:32-32`
- **tri** — `trigram-extract.ts:34-34`
- **hasNext** — `trigram-extract.ts:37-37`
- **nextChar** — `trigram-extract.ts:38-38`
- **locBit** — `trigram-extract.ts:39-39`
- **existing** — `trigram-extract.ts:41-41`
- **entries** — `trigram-extract.ts:56-56`
- **bitmap** — `trigram-extract.ts:87-87`
- **map** — `trigram-extract.ts:89-89`
- **last** — `trigram-extract.ts:91-91`
- **tri** — `trigram-extract.ts:98-98`
- **hasNext** — `trigram-extract.ts:100-100`
- **nextChar** — `trigram-extract.ts:101-101`
- **locBit** — `trigram-extract.ts:102-102`
- **existing** — `trigram-extract.ts:104-104`
- **entries** — `trigram-extract.ts:118-118`
- **bytes** — `trigram-extract.ts:136-136`
- **trigrams** — `trigram-extract.ts:139-139`
- **fileId** — `trigram-index.ts:45-45`
- **trigramPostings** — `trigram-index.ts:73-73`
- **trigramMasks** — `trigram-index.ts:74-74`
- **masks** — `trigram-index.ts:85-85`
- **sortedTrigrams** — `trigram-index.ts:92-92`
- **encoder** — `trigram-index.ts:95-95`
- **pathBuffers** — `trigram-index.ts:96-96`
- **pathOffsets** — `trigram-index.ts:97-97`
- **encoded** — `trigram-index.ts:101-101`
- **postingBuffers** — `trigram-index.ts:107-107`
- **postingOffsets** — `trigram-index.ts:108-108`
- **ids** — `trigram-index.ts:111-111`
- **buf** — `trigram-index.ts:113-113`
- **written** — `trigram-index.ts:114-114`
- **fileTableOffset** — `trigram-index.ts:120-120`
- **fileTableSize** — `trigram-index.ts:121-121`
- **stringTableOffset** — `trigram-index.ts:122-122`
- **trigramTableOffset** — `trigram-index.ts:123-123`
- **trigramTableSize** — `trigram-index.ts:124-124`
- **postingsOffset** — `trigram-index.ts:125-125`
- **totalSize** — `trigram-index.ts:126-126`
- **output** — `trigram-index.ts:129-129`
- **view** — `trigram-index.ts:130-130`
- **bytes** — `trigram-index.ts:131-131`
- **header** — `trigram-index.ts:134-143`
- **off** — `trigram-index.ts:148-148`
- **off** — `trigram-index.ts:164-164`
- **tri** — `trigram-index.ts:165-165`
- **masks** — `trigram-index.ts:166-166`
- **ids** — `trigram-index.ts:167-167`
- **buf** — `trigram-index.ts:212-212`
- **view** — `trigram-index.ts:213-213`
- **header** — `trigram-index.ts:214-214`
- **off** — `trigram-index.ts:233-233`
- **pathOffset** — `trigram-index.ts:234-234`
- **pathLen** — `trigram-index.ts:235-235`
- **start** — `trigram-index.ts:236-236`
- **mid** — `trigram-index.ts:246-246`
- **off** — `trigram-index.ts:247-247`
- **midTri** — `trigram-index.ts:248-248`
- **start** — `trigram-index.ts:267-267`
- **buf** — `trigram-index.ts:268-268`
- **maxResults** — `trigram-index.ts:276-276`
- **contextLines** — `trigram-index.ts:277-277`
- **queryTrigrams** — `trigram-index.ts:280-280`
- **postingLists** — `trigram-index.ts:284-284`
- **entry** — `trigram-index.ts:286-286`
- **matches** — `trigram-index.ts:299-299`
- **{ join }** — `trigram-index.ts:300-300`
- **{ readFileSync: readFs }** — `trigram-index.ts:301-301`
- **filePath** — `trigram-index.ts:306-306`
- **fullPath** — `trigram-index.ts:307-307`
- **content** — `trigram-index.ts:310-310`
- **searchContent** — `trigram-index.ts:311-311`
- **searchPattern** — `trigram-index.ts:312-312`
- **idx** — `trigram-index.ts:316-316`
- **lines** — `trigram-index.ts:320-320`
- **lineNumber** — `trigram-index.ts:321-321`
- **column** — `trigram-index.ts:322-322`
- **allLines** — `trigram-index.ts:325-325`
- **lineIdx** — `trigram-index.ts:326-326`
- **lineContent** — `trigram-index.ts:327-327`
- **ctxBefore** — `trigram-index.ts:330-330`
- **ctxAfter** — `trigram-index.ts:331-331`
- **result** — `trigram-index.ts:365-365`
- **MAGIC** — `trigram-types.ts:15-15`
- **VERSION** — `trigram-types.ts:16-16`
- **HEADER_SIZE** — `trigram-types.ts:18-18`
- **FILE_ENTRY_SIZE** — `trigram-types.ts:19-19`
- **TRIGRAM_ENTRY_SIZE** — `trigram-types.ts:20-20`
- **[a, b, c]** — `trigram-types.ts:101-101`
- **magic** — `trigram-types.ts:125-125`
- **version** — `trigram-types.ts:127-127`
- **byte** — `varint.ts:21-21`
- **byte** — `varint.ts:40-40`
- **delta** — `varint.ts:63-63`
- **ids** — `varint.ts:74-74`
- **r** — `varint.ts:78-78`
- **score** — `bm25.ts:66-66`
- **hasStructural** — `code-classifier.ts:56-56`
- **k** — `code-classifier.ts:57-57`
- **codeMask** — `code-classifier.ts:83-83`
- **i** — `code-classifier.ts:85-85`
- **i** — `code-classifier.ts:161-161`
- **total** — `code-classifier.ts:184-184`
- **i** — `code-classifier.ts:188-188`
- **i** — `code-classifier.ts:201-201`
- **count** — `keyword-triage.ts:53-53`
- **offset** — `keyword-triage.ts:55-55`
- **j** — `keyword-triage.ts:63-63`
- **match** — `keyword-triage.ts:82-82`
- **k** — `keyword-triage.ts:83-83`
- **n** — `stemmer.ts:33-33`
- **i** — `stemmer.ts:34-34`
- **i** — `stemmer.ts:50-50`
- **i** — `stemmer.ts:67-67`
- **i** — `stemmer.ts:74-74`
- **result** — `stemmer.ts:240-240`
- **i** — `stemmer.ts:275-275`
- **n** — `stemmer.ts:279-279`
- **result** — `stemmer.ts:289-289`
- **i** — `stemmer.ts:290-290`
- **i** — `trigram-extract.ts:33-33`
- **idx** — `trigram-extract.ts:57-57`
- **i** — `trigram-extract.ts:92-92`
- **idx** — `trigram-extract.ts:119-119`
- **i** — `trigram-extract.ts:140-140`
- **fileId** — `trigram-index.ts:76-76`
- **posting** — `trigram-index.ts:78-78`
- **stringTableSize** — `trigram-index.ts:98-98`
- **postingsTotalSize** — `trigram-index.ts:109-109`
- **i** — `trigram-index.ts:147-147`
- **strPos** — `trigram-index.ts:156-156`
- **i** — `trigram-index.ts:163-163`
- **postPos** — `trigram-index.ts:178-178`
- **lo** — `trigram-index.ts:242-242`
- **hi** — `trigram-index.ts:243-243`
- **candidates** — `trigram-index.ts:292-292`
- **i** — `trigram-index.ts:293-293`
- **pos** — `trigram-index.ts:314-314`
- **c** — `trigram-index.ts:332-332`
- **c** — `trigram-index.ts:335-335`
- **i** — `trigram-index.ts:366-366`
- **j** — `trigram-index.ts:367-367`
- **v** — `varint.ts:18-18`
- **i** — `varint.ts:19-19`
- **result** — `varint.ts:37-37`
- **shift** — `varint.ts:38-38`
- **i** — `varint.ts:39-39`
- **pos** — `varint.ts:60-60`
- **prev** — `varint.ts:61-61`
- **pos** — `varint.ts:75-75`
- **prev** — `varint.ts:76-76`
- **i** — `varint.ts:77-77`

## Dependencies

### Internal Modules
| Module | Import | Purpose |
|--------|--------|---------|
| `storage` | `GraphStorage` (via types) | Entity queries: `findEntities`, `getEntity`, `searchEntities` |
| `semantic` | `VectorStore`, `EmbeddingGenerator` | Vector similarity search and embedding generation |
| `analysis` | `TechnologyDetector` | Framework-aware file filtering via `detectStack()` |
| `logging` | `log` | Structured logging (info, warn, error) |
| `utils` | `readLineRange`, `cosineSimilarity` | File content reading and SIMD-accelerated cosine similarity |

### External Packages
| Package | Purpose |
|---------|---------|
| (none) | All dependencies are internal modules or Node.js built-ins |

## Configuration

| Parameter | Default | Description |
|-----------|---------|-------------|
| `query.mode` | (required) | `"entity"` / `"content"` / `"semantic"` / `"hybrid"` |
| `query.limit` | `100` | Max results returned (semantic mode defaults to `10`) |
| `query.scope.entityTypes` | all | Filter by `EntityType[]` |
| `query.scope.files` | all | Filter by file path list |
| `query.scope.frameworks` | all | Filter by framework names (requires TechnologyDetector) |
| `query.contentFilter.contains` | none | Substring match on entity body |
| `query.contentFilter.regex` | none | Regex match on entity body (pre-compiled once) |
| `query.contentFilter.semantic` | none | Semantic similarity threshold >= 0.7 |

## Behavioral Properties

| Property | Value |
|----------|-------|
| Async | Yes -- all search methods are async; embedding init is lazy |
| State | `embeddingGenerator` cached after first `initialize()` call |
| Thread Safety | Stateless per-query; only shared state is the cached embedding generator |
| Idempotency | `search()` is idempotent for identical queries and unchanged graph |
| Side Effects | File reads via `readLineRange` for content search; structured logging |
| Performance | SIMD-accelerated cosine similarity; pre-compiled regex; Set-based O(1) scope filtering |

## Error Handling

| Error | When | Recovery |
|-------|------|----------|
| Embedding init failure | `initialize()` | Log warning, set generator to null; semantic falls back to entity search |
| VectorStore unavailable | `searchSemantic()` | Log warning, return empty results |
| EmbeddingGenerator unavailable | `searchSemantic()` after retry | Log warning, fall back to `fallbackEntitySearch` with score 0.5 |
| Entity file read failure | `getEntityContent()` | Log warning, return empty string (entity skipped in content filter) |
| Similarity computation failure | `computeSemanticSimilarity()` | Log error, fall back to case-insensitive string matching |
| Unknown search mode | `search()` | Throw `Error("Unknown search mode: ...")` |

## Observability

| Event | Level | When |
|-------|-------|------|
| `PATTERNSEARCH.embgen_init` | info | Embedding generator initialized successfully |
| `PATTERNSEARCH.embgen_init_fail` | warn | Embedding generator failed to initialize |
| `PATTERNSEARCH.vectorstore_unavail` | warn | Semantic search called without VectorStore |
| `PATTERNSEARCH.embgen_unavail_fallback` | warn | Falling back to entity search (no embeddings) |
| `PATTERNSEARCH.semantic_results` | info | Semantic search completed: vectorStoreHits, resolvedEntities, missed |
| `PATTERNSEARCH.semantic_fail` | error | Semantic search threw an exception |
| `PATTERNSEARCH.entity_read_fail` | warn | Failed to read entity content from file |
| `PATTERNSEARCH.sim_compute_fail` | error | Cosine similarity computation failed |

## Implementation Notes

### Semantic Search — Batch Entity Resolution
`searchSemantic()` receives `SimilarityResult[]` from `VectorStore.search()`, which are already enriched with entity metadata (`filePath`, `name`, `type`) from SQLite. However, vector store IDs use `"ent:filePath:type:name"` format while GraphStorage expects 16-char hash IDs.

**Resolution strategy** (avoids 200+ individual `getEntity()` calls):
1. Extract `filePath`/`name`/`type` from enriched metadata (or parse from vector ID as fallback)
2. Group results by `filePath` — typically 30-50 unique files out of 200 results
3. Batch-fetch all entities per file via `findEntities({filePath})` in parallel
4. Build `entityLookup` Map keyed by `"filePath:type:name"` for O(1) resolution
5. Match each vector result to its entity via the lookup

This approach reduced entity resolution from O(N) DB queries to O(unique_files) queries.

**Observability**: `PATTERNSEARCH.semantic_results` log entry shows `vectorStoreHits`, `resolvedEntities`, and `missed` counts for debugging.

## Known Limitations

- No index.ts barrel file; consumers import directly from `pattern-search.ts`
- Semantic search depends on EmbeddingGenerator availability; degrades silently to entity matching
- Content search loads all candidate entities first (`pattern: ".*"`), which can be expensive on large graphs
- Framework filtering requires TechnologyDetector and scans all import entities linearly
- Snippet generation uses a fixed 50-char context window before and after the match
- Hybrid mode runs entity + content + semantic sequentially (no parallelism)
- Cosine similarity normalization maps [-1, 1] to [0, 1], which compresses score resolution

## TypeScript Notes

`PatternSearch` receives its dependencies via constructor injection (`GraphStorage`, `VectorStore | null`, `TechnologyDetector | null`). The nullable VectorStore and TechnologyDetector allow graceful degradation. Internal `EntityFilters` interface is not exported. `EntityType` is imported from `types/storage.ts` and cast via `as EntityType` for import entity queries. The class is instantiated in `ServiceContainer.getPatternSearch()` at `src/core/service-container.ts`.

## Files

| File | Description |
|------|-------------|
| [`pattern-search.ts`](./pattern-search.ts) | Main implementation (407 lines): PatternSearch class with four search modes, content filtering, SIMD similarity, and result merging |
