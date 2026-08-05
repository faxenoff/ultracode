# tests/agents

## 🤖 Overview

The `tests/agents` module contains test cases for various agent types, including `BaseAgent`, `ParserAgent`, `ResourceAdjustmentAgent`, and `SemanticAgent`. These tests simulate agent behavior under different conditions, such as task processing, backpressure handling, and resource management.

The `base-agent.test.ts` file tests the `BaseAgent` class, focusing on its initialization, task processing, and backpressure handling. It includes a test case that verifies the `AgentBusyError` is thrown when an agent is busy, and the task is retried after the agent becomes available.

## 🤖 Architecture

```
       +---------------------+
       |     BaseAgent      |
       |     (Test Agent)   |
       |     (Test Agent)   |
       |     (Test Agent)   |
       +---------------------+
           |                |
           v                v
       +---------------------+
       |     TestAgent      |
       |     (Test Agent)   |
       |     (Test Agent)   |
       |     (Test Agent)   |
       +---------------------+
           |                |
           v                v
       +---------------------+
       |     ParserAgent     |
       |     (Test Agent)   |
       |     (Test Agent)   |
       |     (Test Agent)   |
       +---------------------+
           |                |
           v                v
       +---------------------+
       | ResourceAdjustment |
       |     (Test Agent)   |
       |     (Test Agent)   |
       |     (Test Agent)   |
       +---------------------+
           |                |
           v                v
       +---------------------+
       | SemanticAgent      |
       |     (Test Agent)   |
       |     (Test Agent)   |
       |     (Test Agent)   |
       +---------------------+
```

## 🤖 Flow

```
       +---------------------+
       |     BaseAgent      |
       |     (Test Agent)   |
       |     (Test Agent)   |
       |     (Test
       +---------------------+
           |                |
           v                v
       +---------------------+
       |     TestAgent      |
       |     (Test Agent)   |
       |     (Test Agent)   |
       |     (Test Agent)   |
       +---------------------+
           |                |
           v                v
       +---------------------+
       |     ParserAgent     |
       |     (Test Agent)   |
       |     (Test Agent)   |
       |     (Test Agent)   |
       +---------------------+
           |                |
           v                v
       +---------------------+
       | ResourceAdjustment |
       |     (Test Agent)   |
       |     (Test Agent)   |
       |     (Test Agent)   |
       +---------------------+
           |                |
           v                v
       +---------------------+
       | SemanticAgent      |
       |     (Test Agent)   |
       |     (Test Agent)   |
       |     (Test Agent)   |
       +---------------------+
```

## 🤖 Entity Listing

### Function
- **classEntity** — Represents a class entity in the test code `parser-agent.test.ts:158-158`
- **cleanupTestFiles** — Cleans up the temporary directory `parser-agent.test.ts:59-65`
- **createTestFiles** — Creates test files in the temporary directory `parser-agent.test.ts:45-54`
- **filePaths** — Maps each test file to a full path within the temporary directory `parser-agent.test.ts:349-349`, `parser-agent.test.ts:369-369`
- **filePaths** — An array of file paths `parser-agent.test.ts:213-213`
- **filePaths** — Maps test files to their full paths in the temporary directory `parser-agent.test.ts:323-323`
- **functionEntity** — Represents a function entity in the test code `parser-agent.test.ts:162-162`
- **generateSampleCode** — Generates sample JavaScript code for a test file `parser-agent.test.ts:70-99`
- **getGraphStorageMock** — Creates a mock for graph storage `semantic-agent.test.ts:118-125`
- **getGraphStorageMock** — Mocks the graph storage to return an empty query result `semantic-agent.test.ts:119-123`
- **getGraphStorageMock** — Mocks the graph storage to return null for any entity ID `semantic-agent.test.ts:124-124`
- **interfaceEntity** — Represents an interface entity in the test code `parser-agent.test.ts:194-194`
- **modifiedClass** — A modified class entity `parser-agent.test.ts:277-277`
- **task** — Assigns full paths to test files in the temporary directory `parser-agent.test.ts:418-418`
- **testFiles** — Creates an array of 50 test files with paths and sample code `parser-agent.test.ts:343-346`, `parser-agent.test.ts:363-366`
- **testFiles** — Create test files in temp directory `parser-agent.test.ts:316-319`, `parser-agent.test.ts:406-409`
- **testFiles** — An array of test files `parser-agent.test.ts:206-209`
- **typeEntity** — Represents a type entity in the test code `parser-agent.test.ts:198-198`
- **warmupMock** — Mocks the warmup function for semantic cache `semantic-agent.test.ts:15-15`

### Method
- **analyzeCodeSemantics** — Analyzes the semantics of code `semantic-agent.test.ts:142-150`
- **canProcessTask** — Determines if a task can be processed by the agent `base-agent.test.ts:18-20`
- **cleanup** — Cleans up the embedding generator `semantic-agent.test.ts:47-47`
- **clear** — Clears the semantic cache `semantic-agent.test.ts:100-104`
- **close** — Closes the vector store `semantic-agent.test.ts:30-30`
- **constructor** — Initializes a TestAgent with specified agent type and configuration `base-agent.test.ts:7-13`
- **count** — Counts the number of vectors in the vector store `semantic-agent.test.ts:31-33`
- **crossLanguageSearch** — Performs cross-language search `semantic-agent.test.ts:157-159`
- **detectClones** — Detects code clones `semantic-agent.test.ts:151-153`
- **findSimilarCode** — Finds similar code `semantic-agent.test.ts:154-156`
- **generateBatch** — Generates embeddings for a batch of texts `semantic-agent.test.ts:51-53`
- **generateCodeEmbedding** — Generates an embedding for code `semantic-agent.test.ts:139-141`
- **generateCodeEmbedding** — Generates an embedding for a given code snippet `semantic-agent.test.ts:54-56`
- **generateEmbedding** — Generates an embedding for a given text `semantic-agent.test.ts:48-50`
- **get** — Retrieves a value from the semantic cache `semantic-agent.test.ts:91-96`
- **getStats** — Returns statistics for the semantic agent `semantic-agent.test.ts:105-108`
- **handleMessage** — A placeholder method for handling messages `base-agent.test.ts:27-27`
- **initialize** — Initializes the vector store `semantic-agent.test.ts:29-29`
- **initialize** — Asynchronously initializes the semantic agent `semantic-agent.test.ts:46-46`
- **insertBatch** — Inserts a batch of vectors into the vector store `semantic-agent.test.ts:34-34`
- **onInitialize** — A placeholder method for agent initialization `base-agent.test.ts:15-15`
- **onShutdown** — A placeholder method for agent shutdown `base-agent.test.ts:16-16`
- **processTask** — Processes a task and returns a result after a delay `base-agent.test.ts:22-25`
- **semanticSearch** — Performs semantic search using the hybrid search engine `semantic-agent.test.ts:69-77`
- **set** — Sets a value in the semantic cache `semantic-agent.test.ts:97-99`
- **setBatchSize** — Sets the batch size for embedding generation `semantic-agent.test.ts:57-57`
- **setQueryAgent** — Sets the query agent for the hybrid search engine `semantic-agent.test.ts:68-68`
- **suggestRefactoring** — Suggests code refactoring `semantic-agent.test.ts:160-162`
- **update** — Updates a vector in the vector store `semantic-agent.test.ts:35-35`
- **warmup** — Initializes the semantic agent for testing `semantic-agent.test.ts:109-111`

### Class
- **CodeAnalyzer** — Analyzes code semantics `semantic-agent.test.ts:138-163`
- **EmbeddingGenerator** — Represents an embedding generator with methods for initialization, cleanup, generating embeddings, generating batches, and generating code embeddings `semantic-agent.test.ts:45-58`
- **HybridSearchEngine** — Represents a hybrid search engine with methods for setting the query agent and performing semantic search `semantic-agent.test.ts:67-78`
- **SemanticCache** — Represents a semantic cache with methods for mapping, hits, reqs, get, set, and clear `semantic-agent.test.ts:87-112`
- **TestAgent** — Represents a test agent that extends BaseAgent with specific configurations and methods `base-agent.test.ts:6-28`
- **VectorStore** — Represents a vector store with methods for initialization, closing, counting, inserting batches, and updating `semantic-agent.test.ts:28-36`

### Interface
- **TestFile** — Represents a test file with a path and content `parser-agent.test.ts:33-36`

### Import_decl
- **../../src/agents/base.js** — Imports `../../src/agents/base.js` from `../../src/agents/base.js`. `base-agent.test.ts:2-2`
- **../../src/agents/dev-agent.js** — Imports `../../src/agents/dev-agent.js` from `../../src/agents/dev-agent.js`. `resource-adjustment.test.ts:2-2`
- **../../src/agents/parser-agent.js** — Imports `../../src/agents/parser-agent.js` from `../../src/agents/parser-agent.js`. `parser-agent.test.ts:20-20`
- **../../src/agents/semantic-agent** — Imports `../../src/agents/semantic-agent` from `../../src/agents/semantic-agent`. `semantic-agent.test.ts:169-169`
- **../../src/agents/semantic-agent.js** — Imports `../../src/agents/semantic-agent.js` from `../../src/agents/semantic-agent.js`. `resource-adjustment.test.ts:3-3`
- **../../src/core/knowledge-bus** — Imports `../../src/core/knowledge-bus` from `../../src/core/knowledge-bus`. `semantic-agent.test.ts:170-170`
- **../../src/core/knowledge-bus.js** — Imports `../../src/core/knowledge-bus.js` from `../../src/core/knowledge-bus.js`. `resource-adjustment.test.ts:4-4`
- **../../src/types/agent** — Imports `../../src/types/agent` from `../../src/types/agent`. `semantic-agent.test.ts:171-171`, `semantic-agent.test.ts:172-172`
- **../../src/types/agent.js** — Imports `../../src/types/agent.js` from `../../src/types/agent.js`. `base-agent.test.ts:3-3`, `parser-agent.test.ts:21-21`
- **../../src/types/errors.js** — Imports `../../src/types/errors.js` from `../../src/types/errors.js`. `base-agent.test.ts:4-4`
- **../../src/types/parser.js** — Imports `../../src/types/parser.js` from `../../src/types/parser.js`. `parser-agent.test.ts:22-22`
- **../../src/types/semantic** — Imports `../../src/types/semantic` from `../../src/types/semantic`. `semantic-agent.test.ts:173-173`
- **bun:test** — Imports `bun:test` from `bun:test`. `base-agent.test.ts:1-1`, `parser-agent.test.ts:15-15`, `resource-adjustment.test.ts:1-1`, `semantic-agent.test.ts:12-12`
- **node:events** — Imports `node:events` from `node:events`. `parser-agent.test.ts:16-16`
- **node:fs** — Imports `node:fs` from `node:fs`. `parser-agent.test.ts:17-17`
- **node:os** — Imports `node:os` from `node:os`. `parser-agent.test.ts:18-18`
- **node:path** — Imports `node:path` from `node:path`. `parser-agent.test.ts:19-19`

### Property
- **content** — The content of a test file `parser-agent.test.ts:35-35`
- **hits** — Tracks the number of hits in the semantic cache `semantic-agent.test.ts:89-89`
- **map** — Maps a function over the semantic cache `semantic-agent.test.ts:88-88`
- **path** — The file path for a test file `parser-agent.test.ts:34-34`
- **reqs** — Tracks the number of requests in the semantic cache `semantic-agent.test.ts:90-90`

## Key Patterns & Dependencies

### Testing Patterns

**Mock Service Layer** — Isolates agent behavior by replacing real dependencies (vector store, embedding service, code analyzer) with deterministic test doubles. Each mock enforces contract compatibility while enabling controlled test scenarios and performance measurement.

**Fixture-Driven Test Design** — Uses centralized task, file, and entity fixtures to ensure consistency across test suites and reduce test setup boilerplate. Fixtures are re-used across multiple test cases within each suite.

**Backpressure & Concurrency Testing** — Validates agent queue limits and concurrent processing through deliberate overload scenarios, ensuring AgentBusyError is thrown when task backlog exceeds configured capacity.

**Resource Lifecycle Management** — Test infrastructure automatically creates and cleans up temporary test files, mock service instances, and agent state, ensuring no test pollution or resource leaks between test runs.

### Dependencies Between Test Suites

- **base-agent.test.ts** — Foundation for all agent tests; validates core concurrency and backpressure mechanisms inherited by specialized agents.
- **parser-agent.test.ts** — Depends on file system utilities and sample code generation; exercises agent task dispatch and result collection.
- **semantic-agent.test.ts** — Depends on mock embedding and vector store implementations; validates embedding pipeline, hybrid search, and graph storage integration.
- **resource-adjustment.test.ts** — Validates concurrent resource allocation across all agent types during high-load scenarios.

### Mock Service Contracts

- **VectorStore** implements insertion, retrieval, and count operations mirroring production graph storage APIs.
- **EmbeddingGenerator** produces fixed-size Float32Array outputs with deterministic values based on input hash.
- **HybridSearchEngine** combines vector similarity and keyword matching with configurable scoring for relevance validation.
- **SemanticCache** tracks hit/miss rates and stores query results, enabling cache behavior assertions.
