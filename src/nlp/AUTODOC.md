# Overview

## 🤖 Entity Listing

### Function
- **countTokens** — Counts the number of tokens in a given text `tokenizer.ts:353-362`
- **createPrfOnlyExpander** — Creates a QueryExpander instance with co-occurrence weight disabled `query-expander.ts:214-219`
- **documents** — Filters and maps results to content, ensuring non-empty strings `query-expander.ts:188-188`
- **documents** — Maps results to content and filters out empty or zero-length strings `query-expander.ts:188-188`
- **expandedTerms** — Maps sorted terms to their respective terms `query-expander.ts:139-139`
- **extractNgrams** — Extracts n-grams from a list of tokens `tokenizer.ts:371-379`
- **extractTopTerms** — Extracts top terms from a set of documents using TF-IDF scoring `tfidf.ts:195-203`
- **rawTokens** — Returns raw tokens without any preprocessing `tokenizer.ts:308-308`
- **sortedTerms** — Sorts terms by their weights in descending order `query-expander.ts:135-135`
- **splitCamelCase** — Splits camelCase identifiers into separate tokens `tokenizer.ts:263-271`
- **splitSnakeCase** — Splits snake_case identifiers into separate tokens `tokenizer.ts:279-281`
- **tokenize** — Tokenizes text into words and code identifiers `tokenizer.ts:296-339`
- **tokenizeUnique** — Tokenizes text and returns unique tokens `tokenizer.ts:345-347`
- **totalTokens** — Computes the total number of tokens across all terms in the term frequency map `tfidf.ts:92-92`

### Method
- **buildIdfMap** — Constructs an IDF map based on document frequencies from a list of documents `tfidf.ts:165-189`
- **clear** — Clears the storage `cooccurrence-index.ts:243-245`
- **constructor** — Initializes the co-occurrence index with a storage object and optional configuration `cooccurrence-index.ts:36-45`
- **constructor** — Initializes a QueryExpander with a co-occurrence index and configuration `query-expander.ts:60-77`
- **constructor** — Initializes the TF-IDF extractor with given options `tfidf.ts:44-51`
- **expand** — Expands a query using co-occurrence and PRF terms `query-expander.ts:86-150`
- **expandWithoutPrf** — Expands a query without using PRF terms `query-expander.ts:156-158`
- **extractPairs** — Extracts term pairs within a sliding window `cooccurrence-index.ts:143-165`
- **extractPrfTerms** — Extracts PRF terms from results, excluding specified terms `query-expander.ts:185-193`
- **extractTopTerms** — Parses and processes documents to extract top terms based on BM25 scores, excluding specified terms and filtering by document frequency `tfidf.ts:61-115`
- **extractWithPrecomputedIdf** — Calculates TF-IDF scores for a document using precomputed IDF values `tfidf.ts:126-156`
- **getConfig** — Returns the current configuration `query-expander.ts:205-207`
- **getCooccurrenceTerms** — Retrieves co-occurrence terms for a query, excluding specified terms `query-expander.ts:163-180`
- **getRelatedTerms** — Retrieves related terms for a given term from the storage `cooccurrence-index.ts:189-191`
- **getRelatedTermsForQuery** — Retrieves related terms for multiple terms, merges and dedups them, and returns the top results `cooccurrence-index.ts:200-219`
- **getStats** — Retrieves statistics from the storage `cooccurrence-index.ts:236-238`
- **hashChunk** — Generates a hash for a chunk based on its length and first/last characters `cooccurrence-index.ts:170-177`
- **pruneRarePairs** — Prunes rare co-occurrence pairs from the storage based on a minimum count `cooccurrence-index.ts:250-252`
- **recalculatePMI** — Recalculates the PMI (Pointwise Mutual Information) for co-occurrence pairs `cooccurrence-index.ts:229-231`
- **setConfig** — Sets configuration for query expansion `query-expander.ts:198-200`
- **updateFromChunk** — Updates co-occurrence counts from a text chunk `cooccurrence-index.ts:57-81`
- **updateFromChunks** — Aggregates term pairs and term counts from chunks, updates the database with these values `cooccurrence-index.ts:89-134`

### Class
- **CooccurrenceIndex** — Class for building and querying a co-occurrence index from text content `cooccurrence-index.ts:33-253`
- **QueryExpander** — Class for expanding queries using co-occurrence and PRF `query-expander.ts:56-208`
- **TfIdfExtractor** — Class for extracting top terms using TF-IDF scoring `tfidf.ts:41-190`

### Interface
- **CooccurrenceIndexConfig** — Configuration for the co-occurrence index, including window size, minimum term length, and maximum terms per chunk `cooccurrence-index.ts:20-27`
- **ExpandedQuery** — Expanded query with original and expanded strings, original tokens, co-occurrence terms, PRF terms, and all terms `query-expander.ts:37-50`
- **QueryExpansionConfig** — Configuration for query expansion with weights and limits for co-occurrence, PRF, and expanded terms `query-expander.ts:20-35`
- **TermScore** — Represents a term with its score, term frequency, and inverse document frequency `tfidf.ts:19-24`
- **TfIdfOptions** — Configuration options for the TF-IDF extractor `tfidf.ts:26-35`

### Import_decl
- **../search/bm25.js** — Imports `../search/bm25.js` from `../search/bm25.js`. `tfidf.ts:12-12`
- **../search/stemmer.js** — Imports `../search/stemmer.js` from `../search/stemmer.js`. `tokenizer.ts:14-14`
- **../storage/libsql/cooccurrence-ops.js** — Imports `../storage/libsql/cooccurrence-ops.js` from `../storage/libsql/cooccurrence-ops.js`. `cooccurrence-index.ts:13-13`
- **./cooccurrence-index.js** — Imports `./cooccurrence-index.js` from `./cooccurrence-index.js`. `query-expander.ts:12-12`
- **./tfidf.js** — Imports `./tfidf.js` from `./tfidf.js`. `query-expander.ts:13-13`
- **./tokenizer.js** — Imports `./tokenizer.js` from `./tokenizer.js`. `cooccurrence-index.ts:14-14`, `query-expander.ts:14-14`, `tfidf.ts:13-13`

### Property
- **allTerms** — All terms with final weights (for debugging) `query-expander.ts:49-49`
- **config** — Configuration object for the co-occurrence index `cooccurrence-index.ts:34-34`
- **config** — Configuration for the query expander `query-expander.ts:57-57`
- **content** — Expands a query by adding terms based on co-occurrence and PRF scores `query-expander.ts:86-86`
- **content** — Extracts PRF terms from results, excluding specified terms `query-expander.ts:185-185`
- **cooccurrenceWeight** — Weight for co-occurrence terms `query-expander.ts:24-24`
- **coocTerms** — Co-occurrence expansion terms with weights `query-expander.ts:45-45`
- **expanded** — Expanded query string for embedding `query-expander.ts:41-41`
- **idf** — The inverse document frequency of a term `tfidf.ts:23-23`
- **logNormTf** — Boolean indicating whether to use log normalization for term frequency `tfidf.ts:30-30`
- **maxCoocTermsPerToken** — Maximum co-occurrence terms per query term `query-expander.ts:28-28`
- **maxDocFreqRatio** — Maximum document frequency ratio for terms `tfidf.ts:34-34`
- **maxExpandedTerms** — Maximum total terms in expanded query `query-expander.ts:32-32`
- **maxPrfTerms** — Maximum PRF terms to extract `query-expander.ts:30-30`
- **maxTermsPerChunk** — Maximum terms per chunk to process (default: 500) `cooccurrence-index.ts:26-26`
- **minDocFreq** — Minimum document frequency for terms `tfidf.ts:32-32`
- **minLength** — Minimum token length for terms `tfidf.ts:28-28`
- **minTermLength** — Minimum term length (default: 3) `cooccurrence-index.ts:24-24`
- **minTermLength** — Minimum term length `query-expander.ts:34-34`
- **options** — Configuration options for the TF-IDF extractor `tfidf.ts:42-42`
- **original** — Original query string `query-expander.ts:39-39`
- **originalTokens** — Original query tokens `query-expander.ts:43-43`
- **originalWeight** — Weight for original query terms `query-expander.ts:22-22`
- **prfTerms** — PRF expansion terms with weights `query-expander.ts:47-47`
- **prfWeight** — Weight for PRF terms `query-expander.ts:26-26`
- **score** — Returns an array of terms with their scores `query-expander.ts:166-166`
- **score** — The score of a term in the TF-IDF context `tfidf.ts:21-21`
- **term** — Stores PRF terms with their scores `query-expander.ts:102-102`
- **term** — Returns an array of terms with their scores `query-expander.ts:117-117`
- **term** — Stores co-occurrence terms with their weights `query-expander.ts:47-47`, `query-expander.ts:166-166`
- **term** — Term in co-occurrence or PRF expansion `query-expander.ts:45-45`
- **term** — A term in the document `tfidf.ts:20-20`
- **tf** — The term frequency of a term in a document `tfidf.ts:22-22`
- **tfidfExtractor** — TfIdfExtractor instance for term scoring `query-expander.ts:58-58`
- **weight** — Stores PRF terms with their scores `query-expander.ts:102-102`
- **weight** — Stores co-occurrence terms with their weights `query-expander.ts:47-47`, `query-expander.ts:117-117`
- **weight** — Weight of a term in co-occurrence or PRF expansion `query-expander.ts:45-45`
- **windowSize** — Sliding window size for co-occurrence (default: 5) `cooccurrence-index.ts:22-22`
