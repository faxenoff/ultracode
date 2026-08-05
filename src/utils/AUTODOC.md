# Utils

## 🤖 Overview

The `src/utils` module contains a collection of utility functions and classes for various tasks, including data processing, error handling, and configuration detection. Developers and maintainers use this module to streamline common operations and ensure consistent behavior across different parts of the application.

## 🤖 Architecture

```
BloomFilter
├── bits: Uint32Array
├── size: number
├── hashCount: number
└── add(item: string): void
     └── hashes item and sets bits
└── mightContain(item: string): boolean
     └── hashes item and checks bits
```

## 🤖 Flow

```
BloomFilter
├── add(item: string) → sets bits
└── mightContain(item: string) → checks bits
```

## 🤖 Entity Listing

### Function
- **availableWorker** — Represents an available worker thread `similarity-worker-pool.ts:162-162`
- **bunHash32** — Returns a 32-bit hexadecimal string representation of the hash of the input text using Bun.hash `fast-hash.ts:73-75`
- **bunHash64** — Returns a 64-bit hexadecimal string representation of the hash of the input text using Bun.hash `fast-hash.ts:77-79`
- **bunSleep** — Typed access to Bun.sleep with availability check `runtime-detection.ts:84-93`
- **checkOllamaStatus** — Asynchronously checks if Ollama is running and returns its status `ollama-checker.ts:25-56`
- **clearCachedKlsJvmPath** — Clears the cached JVM information for KLS `jvm-detection.ts:267-287`
- **clearJvmCache** — Clears the cached JVM information `jvm-detection.ts:425-427`
- **closeGlobalSimilarityPool** — Closes the global similarity worker pool and sets it to null. `similarity-worker `similarity-worker-pool.ts:302-307`
- **collectParallel** — Processes items concurrently and returns results and errors `parallel.ts:144-179`
- **commandExists** — Checks if a command exists in the system `shell.ts:624-629`
- **compatibleJvms** — Filters and sorts JVMs based on their version compatibility `jvm-detection.ts:332-332`
- **compatibleJvms** — Sorts the compatible JVMs by their major version in descending order `jvm-detection.ts:333-333`
- **copyFile** — Copies a file from one path to another `file-ops.ts:516-523`
- **cosineSimilarity** — Compute cosine similarity between two vectors `simd-vector-ops.ts:89-105`
- **countFiles** — Count files in a directory `shell.ts:400-435`
- **countSourceFiles** — Counts the number of source files in a directory `shell.ts:524-554`
- **createPatternMatcher** — Creates a pattern matcher `glob.ts:263-284`
- **createReadStream** — Creates a readable stream for a file `file-ops.ts:538-557`
- **createRequestId** — Generates a unique request ID `logger.ts:298-300`
- **createVectorPool** — Creates a new instance of a Float32ArrayPool with specified dimensions, maximum pool size, and prewarm size `float32-pool.ts:247-249`
- **detectCompatibleJvmForKls** — Detects compatible JVM for Kotlin Language Server `jvm-detection.ts:299-350`
- **detectJvm** — Detects the Java Virtual Machine installation on the system and returns its information `jvm-detection.ts:49-114`
- **detectJvmSync** — Synchronous version of the `detectJvm` function `jvm-detection.ts:120-150`
- **detectLinterConfigs** — Detects available linter configurations in the project using a cache `config-detector.ts:97-111`
- **detectLinterConfigsUncached** — Detects available linter configurations in the project without using a cache `config-detector.ts:48-81`
- **dotProduct** — Compute dot product of two vectors using loop unrolling for better performance `simd-vector-ops.ts:25-46`
- **enabledFeatures** — Lists enabled features based on the runtime `runtime.ts:232-232`
- **enabledFeatures** — Maps feature names to lowercase without "bun" `runtime.ts:233-233`
- **ensureConfigDir** — Ensures the configuration directory exists and returns its path `config-paths.ts:108-114`
- **ensureDataDir** — Ensures the data directory exists and returns its path `config-paths.ts:119-125`
- **ensureDir** — Ensures a directory exists, creating it if necessary `file-ops.ts:798-807`
- **ensureDirSync** — Synchronously ensures a directory exists, creating it if necessary `file-ops.ts:814-818`
- **ensureOllamaRunning** — Not present in the provided code `ollama-checker.ts:101-128`
- **entity** — Represents a code entity `comment-extractor.ts:229-229`
- **exec** — Asynchronously execute shell command using Bun's optimized API when available `shell.ts:86-94`
- **execBun** — Asynchronously execute shell command using Bun's optimized API `shell.ts:102-177`
- **execNode** — Asynchronously execute shell command using Node.js child_process.exec `shell.ts:182-215`
- **execSync** — Synchronously execute shell command using Bun's optimized API when available `shell.ts:230-262`
- **existsSync** — Checks if a file or directory exists `file-ops.ts:377-379`
- **fileExists** — Checks if a file exists at a given path `config-detector.ts:36-43`
- **fileExists** — Checks if a file exists `file-ops.ts:265-275`
- **files** — Not present in the provided code `logger.ts:128-128`
- **files** — Maps file names to their paths and modification times `logger.ts:129-132`
- **files** — Sorts the files by their modification times in descending order `logger.ts:133-133`
- **filteredEnv** — Filter environment variables for shell command execution `shell.ts:122-122`
- **filterParallel** — Filter items in parallel with controlled concurrency `parallel.ts:62-75`
- **findAllInstalledJvms** — Finds all installed JVMs on the system `jvm-detection.ts:356-420`
- **findConfigFiles** — Finds configuration files using glob patterns `glob.ts:392-394`
- **findCppFiles** — Finds C++ files using glob patterns `glob.ts:364-366`
- **findGoFiles** — Finds Go files using glob patterns `glob.ts:371-373`
- **findJavaFiles** — Finds Java files using glob patterns `glob.ts:385-387`
- **findJavaInPath** — Finds Java in the system PATH `jvm-detection.ts:451-466`
- **findJavaInPathSync** — Synchronously finds Java in the system PATH `jvm-detection.ts:468-483`
- **findPythonFiles** — Finds Python files `glob.ts:357-359`
- **findRustFiles** — Finds Rust files using glob patterns `glob.ts:378-380`
- **findSourceFiles** — Finds source files `glob.ts:350-352`
- **forceGC** — Forces garbage collection `logger.ts:340-351`
- **forEachParallel** — Execute async function for each item with controlled concurrency (no return) `parallel.ts:84-97`
- **getBunVersion** — Returns the version of the Bun runtime if it is detected, otherwise returns undefined `runtime-detection.ts:141-148`
- **getCodebaseMetrics** — Retrieves metrics for a codebase, including file count and size `shell.ts:564-612`
- **getCommonJavaPaths** — Parses common Java paths on Windows, including Eclipse Adoptium, Temurin, Microsoft OpenJDK, Oracle JDK, Amazon Corretto, Zulu, GraalVM, and JetBrains IDEs `jvm-detection.ts:485-583`
- **getConfigDir** — Returns the central configuration directory for UltraCode `config-paths.ts:27-30`
- **getDataDir** — Returns the central data directory for UltraCode `config-paths.ts:44-81`
- **getDirSize** — Calculates the size of a directory in bytes `shell.ts:445-485`
- **getDisplayPath** — Replaces the home directory path with a tilde (~) in the given path `config-paths.ts:507-513`
- **getEmbeddingModelsPath** — Returns the path to the embedding models configuration file `config-paths.ts:93-95`
- **getErrorMessage** — Not present in the provided code `error-handling.ts:100-114`
- **getErrorName** — Not present in the provided code `error-handling.ts:161-171`
- **getErrorStack** — Not present in the provided code `error-handling.ts:134-144`
- **getFileMimeType** — Determines the MIME type of a file based on its path `file-ops.ts:304-330`
- **getFileSize** — Gets the size of a file `file-ops.ts:286-293`
- **getGlobalSimilarityPool** — Returns or initializes the global similarity worker pool `similarity-worker-pool.ts:294-300`
- **getHasherStatus** — Not present in the provided code `fast-hash.ts:159-171`
- **getJavaExecutable** — Retrieves the Java executable path `jvm-detection.ts:433-449`
- **getJvmInfo** — Retrieves JVM information `jvm-detection.ts:585-593`
- **getJvmInfoSync** — Synchronously retrieves JVM information `jvm-detection.ts:595-603`
- **getLogsDir** — Returns the logs directory for UltraCode `config-paths.ts:35-37`
- **getModelDimensions** — Retrieves the vector size for a given model ID `config-paths.ts:408-410`
- **getOptimalHighWaterMark** — A function to determine the optimal high water mark based on the file size `stream-helpers.ts:41-46`
- **getOptimizationStatus** — Returns the current optimization status including technique, details, and backend `simd-vector-ops.ts:110-120`
- **getParserConfigPath** — Returns the path to the parser configuration file `config-paths.ts:101-103`
- **getRuntimeDescription** — Retrieves a description of the current runtime `runtime.ts:218-221`
- **getRuntimeName** — Returns "bun" if the runtime is Bun, otherwise returns "node" `runtime-detection.ts:161-163`
- **getSemanticConfigPath** — Returns the path to the semantic configuration file `config-paths.ts:86-88`
- **getStatusMessage** — Not present in the provided code `ollama-checker.ts:133-147`
- **getVectorDimensions** — Retrieves the vector size based on the semantic configuration or YAML configuration `config-paths.ts:419-502`
- **gitBranches** — Get all git branches `shell.ts:376-385`
- **gitCurrentBranch** — Get the current git branch `shell.ts:322-328`
- **gitDiff** — Get git diff between two branches or commits `shell.ts:276-282`
- **gitDiffUncommitted** — Get git diff of uncommitted changes `shell.ts:291-298`
- **gitMergeBase** — Get the merge base of two commits `shell.ts:308-314`
- **gitRevParse** — Parse git revision `shell.ts:362-368`
- **gitStatus** — Get git status `shell.ts:336-342`
- **glob** — Glob utility function `glob.ts:106-125`
- **globBun** — Bun-specific glob utility function `glob.ts:130-165`
- **globNode** — Represents a node in the glob tree `glob.ts:170-225`
- **hasBiomeConfig** — Checks if a biome configuration file exists in the project `config-detector.ts:50-50`
- **hasBiomeConfig** — Checks if a biome configuration exists `config-detector.ts:51-51`
- **hasESLintConfig** — Checks if an ESLint configuration file exists in the project `config-detector.ts:55-55`
- **hasESLintConfig** — Checks if an ESLint configuration exists `config-detector.ts:56-56`
- **hasGranite** — Checks if Ollama has a model named "granite-embedding" `ollama-checker.ts:37-37`
- **hashBigInt64** — Not present in the provided code `fast-hash.ts:115-121`
- **hashNumber** — Not present in the provided code `fast-hash.ts:138-140`
- **hashText** — Not present in the provided code `fast-hash.ts:89-95`
- **hashText64** — Not present in the provided code `fast-hash.ts:102-108`
- **hashTextAsync** — Not present in the provided code `fast-hash.ts:126-132`
- **hasOxlintConfig** — Checks if an oxlint configuration file exists in the project `config-detector.ts:60-60`
- **hasOxlintConfig** — Checks if an Oxlint configuration exists `config-detector.ts:61-61`
- **hrtime** — Returns the current time in nanoseconds as a bigint `runtime.ts:276-284`
- **ignoreMatchers** — Patterns to ignore (glob patterns) `glob.ts:147-147`
- **ignoreMatchers** — Creates an array of ignore matchers from the allIgnore array `glob.ts:314-314`
- **importForRuntime** — Imports runtime detection and feature flag utilities `runtime.ts:252-267`
- **initHasher** — Initializes the hashing backend, using Bun.hash (SIMD-native) when available, or falling back to xxhash-wasm for Node.js `fast-hash.ts:37-58`
- **initNewLogger** — Initializes a new logger instance `logger.ts:422-430`
- **isBunRuntime** — Safe check for Bun runtime availability `runtime-detection.ts:57-64`
- **isBunRuntime** — Check if running under Bun runtime `runtime.ts:63-65`
- **isDenoRuntime** — Check if running under Deno runtime `runtime.ts:82-84`
- **isError** — Type guard for checking Error objects `error-handling.ts:24-26`
- **isGitRepo** — Check if the current directory is a git repository `shell.ts:350-353`
- **isHasherReady** — Not present in the provided code `fast-hash.ts:152-154`
- **isJvmVersionInRange** — Checks if the detected JVM version is within a specified range `jvm-detection.ts:163-165`
- **isJvmVersionSupported** — Checks if the detected JVM version is supported `jvm-detection.ts:155-157`
- **isNodeRuntime** — Check if running under Node.js runtime `runtime.ts:70-77`
- **isQuiet** — Returns true if the MCP_QUIET_MODE environment variable is set to "true" `quiet-console.ts:8-8`
- **isSemanticConfigured** — Checks if the semantic configuration is enabled `config-paths.ts:363-366`
- **isTeiBatchDumpEnabled** — Determines if the Tei batch dump is enabled `logger.ts:418-420`
- **kv** — A function that constructs KVPairs from data and request ID, suitable for logging `provider-logger.ts:6-11`
- **leadingComments** — Maps line numbers to leading comments before that line `comment-extractor.ts:482-482`
- **limit** — Sets a limit on the number of files to read `file-ops.ts:591-603`
- **loadCachedKlsJvmPath** — Loads and validates the cached JVM path for KLS `jvm-detection.ts:188-230`
- **loadLogConfig** — Loads the logging configuration `logger.ts:382-415`
- **loadSemanticConfig** — Not present in the provided code `config-paths.ts:284-297`
- **loadSharedBaseConfig** — Not present in the provided code `config-paths.ts:303-327`
- **logFileOpsInfo** — Logs information about file operations `file-ops.ts:823-827`
- **logGlobInfo** — Logs information about glob operations `glob.ts:403-405`
- **LogLevelName** — Maps log levels to their corresponding names `logger-types.ts:13-13`
- **logMCPOperation** — Logs an operation to the MCP `logger.ts:302-319`
- **logMemoryProfile** — Logs memory profile information `logger.ts:321-338`
- **logRuntimeInfo** — Logs information about the current runtime `runtime.ts:226-237`
- **logShellInfo** — Logs information about shell command execution `shell.ts:634-638`
- **makeProviderLogger** — Creates a provider logger with methods for logging debug, info, warn, and error messages with additional data `provider-logger.ts:5-23`
- **mapParallel** — Map items in parallel with controlled concurrency `parallel.ts:27-37`
- **match** — Matches a file against a pattern `glob.ts:241-251`
- **mkdir** — Creates a directory `file-ops.ts:391-395`
- **mkdirSync** — Creates a directory synchronously `file-ops.ts:403-406`
- **modelConfig** — Finds the model configuration based on the selected model ID `config-paths.ts:456-456`
- **modelNames** — An array of model names available in Ollama `ollama-checker.ts:36-36`
- **norm2** — Compute L2 norm of a vector using loop unrolling for better performance `simd-vector-ops.ts:55-77`
- **notifyFileChange** — Notifies the file change hook about a file operation `file-ops.ts:103-111`
- **onExit** — Not present in the provided code `logger.ts:86-86`
- **parseJavaVersion** — Parses Java version string `jvm-detection.ts:605-639`
- **parseMajorVersion** — Parses major version from Java version string `jvm-detection.ts:641-653`
- **partition** — Splits an array into chunks of a specified size `parallel.ts:106-112`
- **preloadHasher** — Not present in the provided code `fast-hash.ts:145-147`
- **processBatches** — Processes batches of items concurrently and returns the results `parallel.ts:124-133`
- **quietConsole** — An object that wraps console methods to suppress output when MCP_QUIET_MODE is set `quiet-console.ts:11-13`
- **quietConsole** — If not in quiet mode, logs a warning message `quiet-console.ts:14-16`
- **quietConsole** — If not in quiet mode, logs a message `quiet-console.ts:17-19`
- **quietConsole** — If not in quiet mode, logs an informational message `quiet-console.ts:20-22`
- **quietConsole** — If not in quiet mode, logs a debug message `quiet-console.ts:23-25`
- **randomUUID** — Represents a function to generate a random UUID version 7 `runtime.ts:302-319`
- **readBinary** — Reads a binary file and returns an ArrayBuffer `file-ops.ts:162-169`
- **readByteRange** — Reads a range of bytes from a file `file-ops.ts:758-787`
- **readBytes** — Reads a file and returns a Uint8Array `file-ops.ts:180-186`
- **readdir** — Reads the contents of a directory `file-ops.ts:415-415`
- **readdir** — The function asynchronously reads the directory contents, including file types, recursively if the options object includes the recursive flag `file-ops.ts:416-416`
- **readdir** — The function asynchronously reads the directory contents, excluding file types, recursively if the options object includes the recursive flag `file-ops.ts:417-417`
- **readdir** — The function asynchronously reads the directory contents, including or excluding file types, recursively if the options object includes the recursive flag `file-ops.ts:418-425`
- **readdirSync** — Reads the contents of a directory synchronously `file-ops.ts:454-460`
- **readFilesParallel** — Reads multiple files in parallel `file-ops.ts:581-616`
- **readJSON** — Reads JSON from a file `file-ops.ts:145-151`
- **readJSONSync** — Synchronously reads JSON from a file `file-ops.ts:355-358`
- **readLineRange** — Reads a range of lines from a file `file-ops.ts:712-746`
- **readLines** — Reads lines from a file `file-ops.ts:643-668`
- **readLinesGenerator** — Generator function to read lines from a file `file-ops.ts:678-696`
- **readText** — Reads text from a file `file-ops.ts:128-134`
- **readTextSync** — Synchronously reads text from a file `file-ops.ts:344-347`
- **regexPattern** — Regular expression pattern `glob.ts:277-277`
- **results** — Maps each item to a promise that returns an object containing the item and a boolean indicating whether the predicate passed `parallel.ts:71-71`
- **rm** — Removes a file or directory `file-ops.ts:433-437`
- **runParallel** — Run async functions in parallel with controlled concurrency `parallel.ts:46-52`
- **saveCachedKlsJvmPath** — Saves the current JVM information to the cached configuration `jvm-detection.ts:235-262`
- **saveSemanticConfig** — Not present in the provided code `config-paths.ts:335-358`
- **scan** — Scans files `glob.ts:297-341`
- **setFileChangeHook** — Sets the file change hook function `file-ops.ts:96-98`
- **setLoggerProject** — Sets the project for the logger `logger.ts:432-434`
- **settled** — Maps each item to a promise that either returns the item with its value or an error `parallel.ts:155-163`
- **settled** — Processes each item in parallel, returning either the value or the error `parallel.ts:156-163`
- **shouldIgnore** — Determines if a file should be ignored `glob.ts:155-155`
- **shouldIgnore** — Checks if a path should be ignored based on the ignoreMatchers `glob.ts:203-203`
- **shouldIgnore** — Determines if a path should be ignored using the ignoreMatchers `glob.ts:317-317`
- **simdL2Normalize** — Normalizes a vector to have unit length using L2 normalization `simd-vector-ops.ts:209-255`
- **simdMeanPooling** — Computes the mean pooling of a sequence of vectors, normalizing the result `simd-vector-ops.ts:142-201`
- **simdVectorAdd** — Adds two vectors element-wise `simd-vector-ops.ts:263-281`
- **simdVectorScale** — Scales a vector by a scalar value `simd-vector-ops.ts:289-307`
- **sleep** — Safely calls Bun.sleep with availability check `runtime-detection.ts:118-126`
- **sleep** — Represents a function to sleep for a specified number of milliseconds `runtime.ts:289-297`
- **sortedKeys** — Creates a sorted array of keys from the pending partials `similarity-worker-pool.ts:142-142`
- **startOllamaService** — Attempts to start the Ollama service in the background `ollama-checker.ts:62-94`
- **stat** — Gets file status information `file-ops.ts:483-501`
- **statSync** — Gets file status information synchronously `file-ops.ts:468-475`
- **streamCopyFile** — A function to copy a file using streams, automatically selecting the optimal buffer size based on the file size `stream-helpers.ts:59-90`
- **streamReplaceInFile** — A function to replace content in a file using streams `stream-helpers.ts:164-189`
- **streamReplaceRange** — A function to replace a range of content in a file using streams `stream-helpers.ts:194-227`
- **streamToAsyncIterator** — Converts a file stream to an async iterator `file-ops.ts:621-632`
- **tasks** — Represents a task for file operations `file-ops.ts:605-612`
- **tasks** — The function reads the file content based on the encoding and the presence of the Bun file system `file-ops.ts:606-612`
- **terminatePromises** — Returns a promise that resolves when a worker exits `similarity-worker-pool.ts:274-278`
- **terminatePromises** — Creates a promise that resolves when a worker is terminated `similarity-worker-pool.ts:275-278`
- **toError** — Safe conversion of unknown to Error `error-handling.ts:50-81`
- **toMB** — Converts bytes to megabytes `logger.ts:323-323`
- **transformer** — The transformer function used to process each chunk of data in the stream `stream-helpers.ts:177-180`
- **tryGarbageCollect** — Attempts to garbage collect the runtime, returning true if successful, false otherwise `runtime-detection.ts:180-196`
- **unlinkSync** — Removes a file synchronously `file-ops.ts:444-446`
- **walk** — Walks through the file system `glob.ts:189-221`
- **walkDir** — Walk through a directory and collect files `shell.ts:406-431`
- **walkDir** — Recursively walks through a directory and processes its contents `shell.ts:451-481`
- **walkDir** — Recursively walks through a directory, counting files with specific extensions `shell.ts:530-550`
- **walkDir** — Recursively walks through a directory, counting files with specific extensions and calculating their total size `shell.ts:575-603`
- **withPooledArray** — Acquires a Float32Array from the pool, executes a function with it, and releases it back to the pool `float32-pool.ts:260-267`
- **withPooledArraySync** — Acquires a Float32Array from the pool, executes a synchronous function with it, and releases it back to the pool. `float `float32-pool.ts:272-279`
- **writeFile** — Writes to a file `file-ops.ts:206-242`
- **writeFileSync** — Synchronously writes to a file `file-ops.ts:367-369`
- **writeJSON** — Writes JSON to a file `file-ops.ts:251-254`

### Method
- **_flush** — The method to flush the buffer after the stream ends `stream-helpers.ts:141-158`
- **_transform** — The method to transform each chunk of data in the stream `stream-helpers.ts:110-139`
- **acquire** — Acquires a Float32Array from the pool, returning a pooled array if available, otherwise allocating a new one `float32-pool.ts:78-95`
- **acquireMany** — Acquires multiple Float32Array objects from the pool `float32-pool.ts:127-158`
- **add** — Adds an item to the Bloom filter `bloom-filter.ts:26-32`
- **agentActivity** — Logs activity related to an agent `logger.ts:262-264`
- **associateCommentsWithEntities** — Method to associate comments with code entities `comment-extractor.ts:123-164`
- **batchCosineSimilarity** — Computes cosine similarity for a batch of vectors `similarity-worker-pool.ts:190-234`
- **bunCompression** — Compression utilities in Bun runtime `runtime.ts:186-188`
- **bunFile** — Provides a file object for Bun runtime `runtime.ts:151-153`
- **bunGlob** — Glob pattern matching in Bun runtime `runtime.ts:161-163`
- **bunHash** — Hash functions in Bun runtime `runtime.ts:181-183`
- **bunPassword** — Password handling in Bun runtime `runtime.ts:176-178`
- **bunSemver** — Semantic versioning utilities in Bun runtime `runtime.ts:206-208`
- **bunShell** — Executes shell commands in Bun runtime `runtime.ts:166-168`
- **bunSleep** — Sleep function in Bun runtime `runtime.ts:196-198`
- **bunSqlite** — SQLite database operations in Bun runtime `runtime.ts:171-173`
- **bunUuid** — UUID generation in Bun runtime `runtime.ts:201-203`
- **bunWrite** — Allows writing to a file in Bun runtime `runtime.ts:156-158`
- **bunYaml** — YAML parsing in Bun runtime `runtime.ts:191-193`
- **cancel** — Cancels a file operation `file-ops.ts:553-555`
- **canExecute** — Checks if the circuit breaker allows execution based on its current state `circuit-breaker.ts:77-99`
- **cleanupFailureWindow** — Cleans up the failure window by removing outdated failure times `circuit-breaker.ts:138-141`
- **clear** — Clears all bits in the Bloom filter `bloom-filter.ts:53-55`
- **clear** — Clears the pool of all Float32Array objects `float32-pool.ts:173-175`
- **close** — Closes the worker pool `similarity-worker-pool.ts:272-288`
- **constructor** — Initializes a new Bloom filter with specified size and hash count `bloom-filter.ts:17-21`
- **constructor** — Initializes a new instance of the CircuitBreaker class with optional configuration `circuit-breaker.ts:63-65`
- **constructor** — Initializes a new instance of the CircuitBreakerError with a given message `circuit-breaker.ts:203-206`
- **constructor** — Initializes a new instance of the Float32ArrayPool class `float32-pool.ts:56-63`
- **constructor** — Initializes the RotatedLogger with optional configuration `logger.ts:40-45`
- **constructor** — Initializes a new instance of the SimilarityWorkerPool `similarity-worker-pool.ts:64-66`
- **constructor** — The constructor function for the LineTransformStream class `stream-helpers.ts:103-108`
- **createCommentEntities** — Method to create comment entities `comment-extractor.ts:169-214`
- **createDocumentationRelationships** — Method to create documentation relationships `comment-extractor.ts:219-253`
- **createWorker** — Creates a new worker thread `similarity-worker-pool.ts:86-125`
- **critical** — Not present in the provided code `logger.ts:205-208`
- **debug** — Not present in the provided code `logger.ts:188-190`
- **detectLanguage** — Method to detect the programming language from a file path `comment-extractor.ts:434-461`
- **enhanceEntityContentWithComments** — Method to enhance entity content with comments `comment-extractor.ts:476-499`
- **ensureDir** — Ensures the log directory exists `logger.ts:96-100`
- **error** — Not present in the provided code `logger.ts:200-203`
- **execute** — Executes a request, updating the state and failure window as needed `circuit-breaker.ts:146-165`
- **extractCommentFromLine** — Method to extract comments from a line of code `comment-extractor.ts:259-344`
- **extractComments** — Method to extract comments from source code `comment-extractor.ts:70-118`
- **extractMultiLineComment** — Method to extract multi-line comments `comment-extractor.ts:346-415`
- **flush** — Not present in the provided code `logger.ts:81-83`
- **flushAsync** — Asynchronously flushes the log buffer to the current log file `logger.ts:63-75`
- **flushSync** — Synchronously flushes the log buffer and rotates the log file if necessary `logger.ts:47-61`
- **format** — Not present in the provided code `logger.ts:146-155`
- **generateCommentId** — Method to generate a unique ID for a comment `comment-extractor.ts:463-466`
- **generateEntityId** — Method to generate a unique ID for an entity `comment-extractor.ts:468-471`
- **getEfficiency** — Returns the efficiency of the Float32Array pool `float32-pool.ts:207-226`
- **getMetrics** — Returns metrics related to the circuit breaker's state and failure statistics `circuit-breaker.ts:180-192`
- **getState** — Returns the current state of the circuit breaker `circuit-breaker.ts:70-72`
- **getStats** — Returns the statistics for the Float32Array pool `float32-pool.ts:192-202`
- **getStats** — Returns statistics about the worker pool including initialization status, number of workers, busy workers, queue length, and pending tasks `similarity-worker-pool.ts:253-267`
- **handleWorkerResult** — Handles the result from a worker thread `similarity-worker-pool.ts:127-157`
- **hash** — Computes a hash value for a string using the FNV-1a algorithm `bloom-filter.ts:73-80`
- **incident** — Logs an incident `logger.ts:282-288`
- **info** — Not present in the provided code `logger.ts:192-194`
- **initialize** — Initializes the worker pool `similarity-worker-pool.ts:71-84`
- **isBun** — Check if running under Bun runtime `runtime.ts:91-93`
- **isDeno** — Check if running under Deno runtime `runtime.ts:101-103`
- **isEmpty** — Checks if the Bloom filter is empty `bloom-filter.ts:60-67`
- **isLeading** — Indicates if the comment is leading `comment-extractor.ts:423-432`
- **isNode** — Check if running under Node.js runtime `runtime.ts:96-98`
- **isStandalone** — Indicates if the comment is standalone `comment-extractor.ts:417-421`
- **localIso** — Not present in the provided code `logger.ts:229-240`
- **log** — Not present in the provided code `logger.ts:210-227`
- **logFilePath** — Returns the path to the current log file `logger.ts:102-105`
- **mcpError** — Represents an error encountered during MCP communication `logger.ts:258-260`
- **mcpRequest** — Represents a request to the MCP (Management Control Plane) system `logger.ts:242-244`
- **mcpResponse** — Represents a response from the MCP system `logger.ts:246-256`
- **mightContain** — Checks if an item might be in the Bloom filter `bloom-filter.ts:39-48`
- **name** — Represents the name of the runtime `runtime.ts:106-111`
- **parseActivity** — Parses and logs activity related to parsing `logger.ts:266-268`
- **performanceMetrics** — Stores performance metrics `logger.ts:274-276`
- **prewarm** — Pre-allocates Float32Array objects to avoid allocation overhead at runtime `float32-pool.ts:68-72`
- **processQueue** — Processes the task queue `similarity-worker-pool.ts:159-184`
- **pruneOld** — Not present in the provided code `logger.ts:125-144`
- **queryActivity** — Logs activity related to querying `logger.ts:270-272`
- **recordFailure** — Records a failed request and updates the state if necessary `circuit-breaker.ts:120-133`
- **recordSuccess** — Records a successful request and updates the state if necessary `circuit-breaker.ts:104-115`
- **recovery** — Logs recovery actions `logger.ts:290-292`
- **registerExitHandlers** — Not present in the provided code `logger.ts:85-94`
- **release** — Releases a Float32Array back to the pool `float32-pool.ts:101-121`
- **releaseMany** — Releases multiple Float32Array objects back to the pool `float32-pool.ts:163-167`
- **reset** — Resets the circuit breaker to its initial state `circuit-breaker.ts:170-175`
- **rotate** — Rotates the log file `logger.ts:113-123`
- **shouldRotate** — Determines if the log file should be rotated `logger.ts:107-111`
- **shrink** — Shrinks the pool to a smaller size `float32-pool.ts:181-187`
- **singleThreadedSimilarity** — Computes cosine similarity for a single vector `similarity-worker-pool.ts:239-248`
- **start** — Starts a file operation `file-ops.ts:545-552`
- **stopFlushLoop** — Stops the flush loop by synchronously flushing the log buffer `logger.ts:77-79`
- **systemEvent** — Logs system events `logger.ts:278-280`
- **trace** — Not present in the provided code `logger.ts:167-169`
- **traceStart** — Not present in the provided code `logger.ts:177-186`
- **traceTime** — Not present in the provided code `logger.ts:171-175`
- **version** — Retrieves the version of the current runtime environment `runtime.ts:114-125`
- **versionInfo** — Contains detailed version information of the runtime `runtime.ts:128-139`
- **warn** — Not present in the provided code `logger.ts:196-198`
- **writeLog** — Not present in the provided code `logger.ts:157-165`

### Class
- **BloomFilter** — A class for implementing a Bloom filter with configurable bits and hash counts `bloom-filter.ts:12-81`
- **CircuitBreaker** — A class representing a circuit breaker with methods to manage its state and behavior `circuit-breaker.ts:56-193`
- **CircuitBreakerError** — Represents an error related to the circuit breaker's state or failure handling `circuit-breaker.ts:202-207`
- **CommentExtractor** — Class for extracting and associating comments with code entities `comment-extractor.ts:66-500`
- **Float32ArrayPool** — A class for managing a pool of Float32Array objects to optimize memory usage `float32-pool.ts:41-227`
- **LineTransformStream** — A stream that transforms lines in a stream, using the provided options `stream-helpers.ts:99-159`
- **RotatedLogger** — A class for logging with rotation of log files `logger.ts:31-293`
- **SimilarityWorkerPool** — A class that manages a pool of worker threads for parallel cosine similarity computation `similarity-worker-pool.ts:46-289`

### Interface
- **BunFile** — Bun.file() API interface `file-ops.ts:49-60`
- **BunFileSinkWriter** — Bun FileSink writer interface `file-ops.ts:40-44`
- **BunGlobConstructor** — Type definition for Bun.Glob constructor `glob.ts:29-31`
- **BunGlobInstance** — Type definition for Bun.Glob instance `glob.ts:36-39`
- **BunRuntime** — Bun runtime API `file-ops.ts:65-70`
- **BunRuntime** — Typed interface for Bun runtime with sleep, version, and garbage collection functions `runtime-detection.ts:13-31`
- **BunSpawnOptions** — Bun.spawn options interface `shell.ts:28-36`
- **BunWithNanoseconds** — Extended Bun interface with nanoseconds timer `runtime.ts:31-45`
- **CircuitBreakerConfig** — Defines the configuration for a circuit breaker, including failure threshold, recovery timeout, success threshold, monitor window, and name `circuit-breaker.ts:27-38`
- **CloudruEmbeddingRequest** — Represents an embedding request using Cloudru `fast-json.ts:313-316`
- **CommentBlock** — Represents a block of comments with its type, content, and location `comment-extractor.ts:36-45`
- **CommentExtractionResult** — Stores extracted comments and their associations `comment-extractor.ts:56-60`
- **DenoRuntime** — Deno runtime interface with version and runtime-specific features `runtime.ts:20-26`
- **GlobalWithRuntimes** — GlobalThis with runtime extensions `runtime.ts:50-54`
- **GlobOptions** — Options for glob operations `glob.ts:51-68`
- **JvmInfo** — Represents information about the detected Java Virtual Machine, including its path, version, major version, vendor, and whether it is a JDK `jvm-detection.ts:30-36`
- **LineTransformOptions** — Options for transforming lines in a stream, including encoding, skipping empty lines, and maximum line length `stream-helpers.ts:27-31`
- **LinterConfigInfo** — Represents information about available linter configurations in a project `config-detector.ts:5-10`
- **LlamacppBatchRequest** — Represents a batch request using Llama.cpp `fast-json.ts:298-300`
- **LlamacppEmbeddingRequest** — Represents an embedding request using Llama.cpp `fast-json.ts:294-296`
- **LogConfig** — Configuration for logging `logger.ts:369-374`
- **LogEntry** — Interface representing a log entry with various properties `logger-types.ts:26-35`
- **LogEntry** — Represents a log entry with timestamp, level, category, message, and optional data, stack trace, request ID, and duration `logger.ts:16-25`
- **LoggerConfig** — Configuration object for logging settings `logger-types.ts:16-24`
- **NodeExecException** — Node.js ExecException interface `shell.ts:41-46`
- **OllamaEmbeddingRequest** — Represents an embedding request for the Ollama provider `fast-json.ts:246-249`
- **OllamaPullRequest** — Represents a pull request for the Ollama provider `fast-json.ts:251-253`
- **OllamaStatus** — Represents the status of the Ollama service, including whether it's running, has models, and details about the models `ollama-checker.ts:15-20`
- **OpenAIEmbeddingRequest** — Represents an embedding request for the OpenAI provider `fast-json.ts:269-273`
- **OvmsInferRequest** — Represents an inference request for Ovms `fast-json.ts:309-311`
- **OvmsInput** — Represents an input for Ovms `fast-json.ts:302-307`
- **ParserConfig** — Defines the configuration interface for parsing JVM information `jvm-detection.ts:177-182`
- **PendingTask** — A task that needs to be processed by a worker, containing the query vector, chunk vectors, start index, and resolve/reject functions `similarity-worker-pool.ts:38-44`
- **PoolStats** — Represents statistics for a Float32Array pool, including dimensions, max pool size, current pool size, and other metrics `float32-pool.ts:27-35`
- **ScanOptions** — Options for scan operations `glob.ts:70-73`
- **SemanticConfig** — Defines a configuration interface for semantic-related settings `config-paths.ts:153-276`
- **SharedBaseConfig** — Defines a base configuration interface for shared settings `config-paths.ts:131-148`
- **ShellOptions** — Shell command options interface `shell.ts:59-70`
- **ShellResult** — Shell command result interface `shell.ts:48-57`
- **SourceLocation** — Represents the start and end positions of a comment in the source code `comment-extractor.ts:23-34`
- **StreamCopyOptions** — Options for copying files using streams, including chunk size, encoding, high water mark, and progress callback `stream-helpers.ts:20-25`
- **TeiBatchRequest** — Represents a batch input request for the TEI provider `fast-json.ts:259-261`
- **TeiRerankRequest** — Represents a rerank request for the TEI provider `fast-json.ts:263-267`
- **TeiSingleRequest** — Represents a single input request for the TEI provider `fast-json.ts:255-257`
- **VllmEmbeddingRequest** — Represents an embedding request for the vLLM provider `fast-json.ts:275-279`
- **VllmRerankRequest** — Represents a rerank request for the vLLM provider `fast-json.ts:281-286`
- **VllmScoreRequest** — Represents a request for scoring using vLLM `fast-json.ts:288-292`
- **WorkerMessage** — Represents a message containing a query vector, a database of vectors, and a start index for similarity computation `similarity-worker.ts:11-16`
- **WorkerResult** — Represents the result of similarity computations, containing an array of similarities and the start index `similarity-worker.ts:18-22`
- **WorkerState** — Represents the state of a worker thread, including its worker instance, busy status, and task ID `similarity-worker-pool.ts:32-36`

### Enum_decl
- **CircuitBreakerState** — Represents the state of a circuit breaker, which can be CLOSED, OPEN, or HALF_OPEN `circuit-breaker.ts:21-25`
- **CommentType** — Enumerates the types of comments `comment-extractor.ts:47-54`

### Constant
- **BLOCK** — Represents a block comment `comment-extractor.ts:49-49`
- **CLOSED** — Indicates the circuit breaker is in normal operation, allowing requests to flow through `circuit-breaker.ts:22-22`
- **HALF_OPEN** — Indicates the circuit breaker is in a half-open state, allowing limited requests to test if the service has recovered `circuit-breaker.ts:24-24`
- **HTML** — Represents HTML comments `comment-extractor.ts:51-51`
- **JSDOC** — Represents a JSDoc comment `comment-extractor.ts:50-50`
- **LINE** — Represents a line comment `comment-extractor.ts:48-48`
- **OPEN** — Indicates the circuit breaker is in an open state, blocking requests and using fallback `circuit-breaker.ts:23-23`
- **PYTHON_DOUBLE** — Represents multi-line Python comments `comment-extractor.ts:53-53`
- **PYTHON_SINGLE** — Represents single-line Python comments `comment-extractor.ts:52-52`

### Type_alias
- **FileChangeHook** — Defines the type of a file change hook function `file-ops.ts:89-89`
- **GlobalWithBun** — Extension of globalThis with Bun runtime `runtime-detection.ts:36-38`
- **GlobalWithBunGlob** — Extended globalThis with typed Bun.Glob `glob.ts:44-49`
- **LogLevel** — Represents different levels of log severity `logger-types.ts:10-10`

### Import_decl
- **../agents/dev/file-extensions.js** — Imports `../agents/dev/file-extensions.js` from `../agents/dev/file-extensions.js`. `shell.ts:492-492`
- **../agents/workers/worker-logging.js** — Imports `../agents/workers/worker-logging.js` from `../agents/workers/worker-logging.js`. `jvm-detection.ts:20-20`
- **../config/logging-config.js** — Imports `../config/logging-config.js` from `../config/logging-config.js`. `logger.ts:27-27`
- **../logging/index.js** — Imports `../logging/index.js` from `../logging/index.js`. `circuit-breaker.ts:15-15`, `config-paths.ts:17-17`, `file-ops.ts:30-30`, `float32-pool.ts:21-21`, `glob.ts:19-19`, `jvm-detection.ts:21-21`, `logger.ts:365-365`, `ollama-checker.ts:9-9`, `provider-logger.ts:1-1`, `shell.ts:18-18`, `similarity-worker-pool.ts:18-18`
- **../logging/log-types.js** — Imports `../logging/log-types.js` from `../logging/log-types.js`. `provider-logger.ts:2-2`
- **../semantic/providers/base.js** — Imports `../semantic/providers/base.js` from `../semantic/providers/base.js`. `provider-logger.ts:3-3`
- **../shared/storage-paths.js** — Imports `../shared/storage-paths.js` from `../shared/storage-paths.js`. `logger.ts:366-366`
- **../types/parser.js** — Imports `../types/parser.js` from `../types/parser.js`. `comment-extractor.ts:15-15`
- **../types/storage.js** — Imports `../types/storage.js` from `../types/storage.js`. `comment-extractor.ts:16-16`
- **./config-paths.js** — Imports `./config-paths.js` from `./config-paths.js`. `jvm-detection.ts:22-22`
- **./fast-hash.js** — Imports `./fast-hash.js` from `./fast-hash.js`. `comment-extractor.ts:17-17`
- **./file-ops.js** — Imports `./file-ops.js` from `./file-ops.js`. `config-paths.ts:18-18`
- **./logger-types.js** — Imports `./logger-types.js` from `./logger-types.js`. `logger.ts:13-13`, `logger.ts:14-14`
- **./runtime-detection.js** — Imports `./runtime-detection.js` from `./runtime-detection.js`. `ollama-checker.ts:10-10`
- **./runtime.js** — Imports `./runtime.js` from `./runtime.js`. `file-ops.ts:31-31`, `glob.ts:20-20`, `shell.ts:19-19`
- **./simd-vector-ops.js** — Imports `./simd-vector-ops.js` from `./simd-vector-ops.js`. `similarity-worker-pool.ts:19-19`, `similarity-worker.ts:9-9`
- **fast-json-stringify** — Imports `fast-json-stringify` from `fast-json-stringify`. `fast-json.ts:6-6`
- **lru-cache** — Imports `lru-cache` from `lru-cache`. `config-detector.ts:3-3`
- **node:child_process** — Imports `node:child_process` from `node:child_process`. `jvm-detection.ts:16-16`, `ollama-checker.ts:8-8`
- **node:fs** — Imports `node:fs` from `node:fs`. `file-ops.ts:19-19`, `jvm-detection.ts:17-17`, `stream-helpers.ts:12-12`
- **node:fs** — Imports `node:fs`. `file-ops.ts:20-29`, `logger.ts:1-10`
- **node:fs/promises** — Imports `node:fs/promises` from `node:fs/promises`. `config-detector.ts:1-1`, `logger.ts:11-11`
- **node:os** — Imports `node:os` from `node:os`. `config-paths.ts:15-15`, `similarity-worker-pool.ts:14-14`
- **node:path** — Imports `node:path` from `node:path`. `config-detector.ts:2-2`, `config-paths.ts:16-16`, `glob.ts:18-18`, `jvm-detection.ts:18-18`, `logger.ts:12-12`, `similarity-worker-pool.ts:15-15`
- **node:stream** — Imports `node:stream` from `node:stream`. `stream-helpers.ts:13-13`
- **node:url** — Imports `node:url` from `node:url`. `similarity-worker-pool.ts:16-16`
- **node:util** — Imports `node:util` from `node:util`. `jvm-detection.ts:19-19`, `stream-helpers.ts:14-14`
- **node:worker_threads** — Imports `node:worker_threads` from `node:worker_threads`. `similarity-worker-pool.ts:17-17`, `similarity-worker.ts:8-8`
- **p-limit** — Imports `p-limit` from `p-limit`. `parallel.ts:10-10`
- **xxhash-wasm** — Imports `xxhash-wasm` from `xxhash-wasm`. `fast-hash.ts:12-12`

### Property
- **absolute** — Return absolute paths `glob.ts:137-137`
- **absolute** — Return absolute paths (default: false) `glob.ts:61-61`, `glob.ts:177-177`
- **architecture** — Defines the architecture of the embedding model `config-paths.ts:157-157`
- **associatedEntityId** — The ID of the entity this comment documents `comment-extractor.ts:44-44`
- **auto_detection** — Enables or disables automatic detection of model parameters `config-paths.ts:235-241`
- **auto_start** — Enables or disables automatic startup of the model `config-paths.ts:207-207`
- **auto_start** — Determines if the model should start automatically `config-paths.ts:223-223`
- **backend** — Not present in the provided code `fast-hash.ts:163-163`
- **backend** — Specifies the backend used for optimization `simd-vector-ops.ts:113-113`
- **batch_size** — Defines the batch size for OVMS `config-paths.ts:161-161`
- **batch_size** — Determines the size of the batch for model input `config-paths.ts:203-203`
- **bits** — An array of 32-bit unsigned integers representing the bits of the Bloom filter `bloom-filter.ts:13-13`
- **buf** — Buffer for log entries `logger.ts:35-35`
- **BUF_CAP** — Maximum buffer capacity for log entries `logger.ts:36-36`
- **buffer** — The buffer used to store data during the transformation process `stream-helpers.ts:100-100`
- **Bun** — Bun module `glob.ts:45-48`
- **Bun** — A module for building and running applications `logger.ts:341-341`
- **Bun** — Safe check for Bun runtime availability `runtime-detection.ts:37-37`
- **Bun** — Bun runtime detection `runtime.ts:52-52`
- **bun** — Represents the Bun runtime interface with nanoseconds timer `runtime.ts:253-253`
- **busy** — Indicates whether the worker is currently busy with a task `similarity-worker-pool.ts:34-34`
- **busyWorkers** — Represents the number of busy worker threads `similarity-worker-pool.ts:256-256`
- **category** — Category or type of the log entry `logger-types.ts:29-29`
- **category** — Indicates the category of the log entry `logger.ts:19-19`
- **chunk** — An array of chunk vectors used in the cosine similarity calculation `similarity-worker-pool.ts:40-40`
- **chunks** — Represents the number of chunks processed `similarity-worker-pool.ts:58-58`
- **chunkSize** — The size of each chunk to read from the source file `stream-helpers.ts:21-21`
- **claude** — Not present in the provided code `config-paths.ts:247-252`
- **code** — Exit code `shell.ts:44-44`
- **codebase_size** — Not present in the provided code `config-paths.ts:239-239`
- **column** — The column number of the comment's start position `comment-extractor.ts:26-26`
- **column** — Represents the column number in the code `comment-extractor.ts:31-31`
- **comment** — Represents a comment block `comment-extractor.ts:265-265`
- **comment** — Returns a comment block and the number of lines consumed `comment-extractor.ts:353-353`
- **comments** — Array of comment blocks `comment-extractor.ts:57-57`
- **concurrency** — Number of concurrent requests for the TEI model, defaulting to 16 `config-paths.ts:184-184`
- **concurrency** — Controls the level of concurrency for model execution `config-paths.ts:206-206`
- **concurrency** — Specifies the level of concurrency for processing `config-paths.ts:222-222`
- **concurrency** — Sets the maximum number of concurrent file reads `file-ops.ts:583-583`
- **config** — The configuration for the circuit breaker `circuit-breaker.ts:61-61`
- **config** — Configuration for the RotatedLogger `logger.ts:32-32`
- **container_name** — Not present in the provided code `config-paths.ts:265-265`
- **content** — The content of the comment block `comment-extractor.ts:38-38`
- **content** — Represents the content of a request `fast-json.ts:295-295`
- **content** — Contains an array of content strings `fast-json.ts:299-299`
- **context_size** — Specifies the maximum context length for model input `config-paths.ts:198-198`
- **context_tokens** — Not present in the provided code `config-paths.ts:250-250`
- **context_tokens** — Sets the maximum number of context tokens allowed `config-paths.ts:257-257`
- **context_tokens** — Specifies the maximum number of context tokens allowed for the model `config-paths.ts:264-264`
- **context_tokens** — Defines the maximum number of context tokens allowed in the API request `config-paths.ts:272-272`
- **ctime** — Returns the creation time of a file `file-ops.ts:488-488`
- **currentLogFile** — Current log file path `logger.ts:33-33`
- **currentPoolSize** — The current number of Float32Array objects in the pool `float32-pool.ts:30-30`
- **cwd** — The current working directory `glob.ts:133-133`, `glob.ts:173-173`
- **cwd** — Base directory for search (default: current working directory) `glob.ts:37-37`
- **cwd** — Base directory for search `glob.ts:53-53`
- **cwd** — Set the working directory for shell command execution `shell.ts:61-61`, `shell.ts:105-105`
- **cwd** — Working directory `shell.ts:29-29`, `shell.ts:184-184`
- **data** — Represents the data of an input `fast-json.ts:306-306`
- **data** — Additional data associated with the log entry `logger-types.ts:31-31`
- **data** — Optional field for additional data associated with the log entry `logger.ts:21-21`
- **database** — An array of Float32Array vectors against which the query vector is compared `similarity-worker.ts:14-14`
- **datatype** — Represents the data type of an input `fast-json.ts:305-305`
- **deno** — Deno runtime version `runtime.ts:22-22`
- **Deno** — Deno runtime detection `runtime.ts:51-51`
- **details** — Provides detailed information about the optimization technique `simd-vector-ops.ts:112-112`
- **dimension** — The dimension of the Float32Array objects in the pool `float32-pool.ts:28-28`
- **dimension** — Represents the dimension of the float32 pool `float32-pool.ts:43-43`
- **doc_language** — Defines the language of the documents `config-paths.ts:137-137`
- **docker_model_runner** — Not present in the provided code `config-paths.ts:268-274`
- **documents** — Represents a collection of documents `fast-json.ts:284-284`
- **dot** — Include dot files/directories `glob.ts:65-65`, `glob.ts:138-138`
- **dot** — Include dot files/directories (default: false) `glob.ts:37-37`, `glob.ts:178-178`
- **duration** — Duration of the log entry `logger-types.ts:34-34`
- **duration** — Optional field for the duration of the log entry `logger.ts:24-24`
- **embedding** — Configures the embedding platform and its settings `config-paths.ts:155-234`
- **embedding_dimension** — Specifies the dimension of the embedding vectors `config-paths.ts:135-135`
- **embedding_model** — Represents the model used for embedding `config-paths.ts:133-133`
- **enabled** — Not present in the provided code `config-paths.ts:245-245`
- **enabled** — Indicates whether the configuration is enabled `config-paths.ts:154-154`
- **enabled** — Determines if the hashing backend is initialized and ready for use `fast-hash.ts:162-162`
- **enableRotation** — Boolean indicating if log rotation is enabled `logger-types.ts:21-21`
- **enableStackTrace** — Boolean indicating if stack traces are included in logs `logger-types.ts:23-23`
- **enableTimestamp** — Boolean indicating if timestamps are included in logs `logger-types.ts:22-22`
- **encoding** — Specifies the encoding for file reads `file-ops.ts:583-583`
- **encoding** — Encoding for output `shell.ts:67-67`
- **encoding** — The encoding to use for the data read from the source file `stream-helpers.ts:22-22`
- **encoding** — Represents the encoding type for the stream `stream-helpers.ts:28-28`
- **encoding** — Specifies the encoding type for the stream options `stream-helpers.ts:199-199`
- **encoding_format** — Specifies the encoding format for the OpenAI provider `fast-json.ts:272-272`
- **encoding_format** — Specifies the encoding format `fast-json.ts:278-278`
- **encodingFormat** — Specifies the response format for the model, defaulting to base64 `config-paths.ts:176-176`
- **end** — The ending position of a comment `comment-extractor.ts:29-33`
- **endpoint** — Specifies the endpoint for OVMS `config-paths.ts:160-160`
- **endpoint** — The URL endpoint for the TEI model `config-paths.ts:181-181`
- **endpoint** — Represents the endpoint for model inference `config-paths.ts:197-197`
- **endpoint** — Not present in the provided code `config-paths.ts:220-220`
- **endpoint** — Specifies the API endpoint for the model `config-paths.ts:255-255`
- **endpoint** — Represents the endpoint URL for API requests `config-paths.ts:262-262`
- **endpoint** — Represents the API endpoint URL `config-paths.ts:270-270`
- **endpoints** — Lists multiple endpoints for round-robin load balancing in OVMS `config-paths.ts:166-166`
- **env** — Set environment variables for shell command execution `shell.ts:63-63`, `shell.ts:106-106`
- **env** — Environment variables `shell.ts:30-30`, `shell.ts:184-184`
- **error** — Represents an error encountered during processing of an item `parallel.ts:150-150`
- **error** — Stores an array of objects containing an item and its corresponding error `parallel.ts:168-168`
- **errors** — Stores errors encountered during processing of items `parallel.ts:150-150`
- **exitCode** — Exit code `shell.ts:54-54`
- **exited** — Determine if shell command execution exited successfully `shell.ts:147-147`
- **failureThreshold** — The number of failures before the circuit breaker opens `circuit-breaker.ts:29-29`
- **failureWindow** — An array to track the times of failures within the monitor window `circuit-breaker.ts:58-58`
- **fallback** — Not present in the provided code `fast-hash.ts:161-161`
- **fallback** — Represents a fallback function that returns a promise of type T `runtime.ts:255-255`
- **file** — Bun runtime file operations `runtime.ts:34-34`
- **fileCount** — Returns the count of files in a directory `shell.ts:565-565`
- **followSymlinks** — Follow symbolic links (default: false) `glob.ts:63-63`
- **gc** — Performs garbage collection `logger.ts:341-341`
- **gc** — Assigns a reference to the global garbage collection function `logger.ts:341-341`
- **gc** — Trigger garbage collection (synchronous) `runtime-detection.ts:189-189`
- **Glob** — Glob utility function `glob.ts:46-46`
- **Glob** — Bun runtime Glob operations `runtime.ts:36-36`
- **gpu_architecture** — Not present in the provided code `config-paths.ts:238-238`
- **gzipSync** — Bun runtime gzipSync operations `runtime.ts:39-39`
- **hasBiomeConfig** — Indicates whether a biome configuration is present `config-detector.ts:6-6`
- **hasESLintConfig** — Indicates whether an ESLint configuration is present `config-detector.ts:7-7`
- **hasGranite** — Represents whether the model has the Granite feature `ollama-checker.ts:19-19`
- **hash** — Bun runtime hash operations `runtime.ts:38-38`
- **hashCount** — The number of hash functions used in the Bloom filter `bloom-filter.ts:15-15`
- **hasModels** — Determines if Ollama has any models available `ollama-checker.ts:17-17`
- **hasOxlintConfig** — Indicates whether an Oxlint configuration is present `config-detector.ts:8-8`
- **highWaterMark** — Sets the high water mark for the file writer `file-ops.ts:56-56`
- **highWaterMark** — The maximum amount of data to be buffered before the stream emits a 'drain' event `stream-helpers.ts:23-23`
- **hitRate** — Represents the percentage of acquires from the pool compared to new allocations `float32-pool.ts:208-208`
- **id** — Identifies a model in the OVMS configuration `config-paths.ts:169-169`
- **id** — The unique identifier for a model configuration `config-paths.ts:188-188`
- **id** — Represents the unique identifier for a model `config-paths.ts:211-211`
- **id** — Represents a unique identifier `config-paths.ts:227-227`
- **id** — Represents the unique identifier for a specific configuration or model instance `config-paths.ts:429-429`
- **ignore** — An array of strings to be ignored `glob.ts:136-136`
- **ignore** — Patterns to ignore (glob patterns) `glob.ts:59-59`, `glob.ts:176-176`
- **index** — The index of the comment's start position `comment-extractor.ts:27-27`
- **index** — Represents the index in the code `comment-extractor.ts:32-32`
- **inference** — Contains configuration for inference processes `config-paths.ts:143-143`
- **initialized** — Indicates whether the hashing backend has been initialized `fast-hash.ts:160-160`
- **initialized** — Indicates whether the worker pool is initialized `similarity-worker-pool.ts:254-254`
- **initialized** — A flag indicating whether the worker pool has been initialized `similarity-worker-pool.ts:49-49`
- **inlineComments** — Map of line numbers to inline comments `comment-extractor.ts:59-59`
- **input** — Contains the input string or array of strings for the OpenAI provider `fast-json.ts:271-271`
- **input** — Represents the input for an embedding request `fast-json.ts:276-276`
- **input** — Stores an array of input strings `fast-json.ts:315-315`
- **inputs** — Contains the input string for the TEI provider `fast-json.ts:256-256`
- **inputs** — Represents the inputs for an inference request `fast-json.ts:260-260`
- **inputs** — Holds an array of OvmsInput objects `fast-json.ts:310-310`
- **io_threads** — Sets the number of I/O threads for parallel processing `config-paths.ts:145-145`
- **isDirectory** — Checks if a file is a directory `file-ops.ts:470-470`
- **isDirectory** — Checks if a given path is a directory `file-ops.ts:485-485`
- **isFile** — Checks if a file is a regular file `file-ops.ts:469-469`
- **isFile** — Checks if a given path is a file `file-ops.ts:484-484`
- **isInline** — Indicates if the comment is inline (inside the entity) `comment-extractor.ts:42-42`
- **isJdk** — Indicates whether the detected Java Virtual Machine is a JDK `jvm-detection.ts:35-35`
- **isLeading** — Indicates whether the comment is leading before the entity `comment-extractor.ts:41-41`
- **isRunning** — Indicates whether the Ollama service is currently running `ollama-checker.ts:16-16`
- **isTrailing** — Indicates if the comment is trailing (after the code line) `comment-extractor.ts:43-43`
- **item** — Represents an item in the array being processed `parallel.ts:149-149`, `parallel.ts:167-167`, `parallel.ts:168-168`
- **item** — Stores the error encountered during processing each item `parallel.ts:150-150`
- **javaPath** — Stores the path to the Java executable found during JVM detection `jvm-detection.ts:31-31`
- **klsJavaMajorVersion** — Represents the major version of the Java Virtual Machine (JVM) used by KLS `jvm-detection.ts:180-180`
- **klsJavaPath** — Represents the path to the Java Virtual Machine (JVM) used by KLS `jvm-detection.ts:178-178`
- **klsJavaVersion** — Represents the version of the Java Virtual Machine (JVM) used by KLS `jvm-detection.ts:179-179`
- **language** — Not present in the provided code `config-paths.ts:240-240`
- **languages** — Lists the languages supported by a model in OVMS `config-paths.ts:170-170`
- **languages** — An array of languages supported by a model configuration `config-paths.ts:189-189`
- **languages** — Lists the supported languages for model inference `config-paths.ts:212-212`
- **languages** — Lists the languages supported by the selected model `config-paths.ts:228-228`
- **lastDrain** — Last time the log buffer was drained `logger.ts:38-38`
- **lastFailureTime** — The time of the last failure `circuit-breaker.ts:59-59`
- **lastFailureTime** — Tracks the time of the last failure `circuit-breaker.ts:183-183`
- **lastUpdated** — Represents the timestamp of the last update to the cached JVM information `jvm-detection.ts:181-181`
- **leadingComments** — Maps line numbers to arrays of comment blocks before that line `comment-extractor.ts:58-58`
- **level** — Log level of the entry `logger-types.ts:28-28`
- **level** — Specifies the log level `logger.ts:18-18`
- **line** — The line number of the comment's start position `comment-extractor.ts:25-25`
- **line** — Represents the line number in the code `comment-extractor.ts:30-30`
- **lineNumber** — The current line number being processed `stream-helpers.ts:101-101`
- **linesConsumed** — Number of lines consumed during comment extraction `comment-extractor.ts:265-265`
- **linesConsumed** — Returns the number of lines consumed by the comment block `comment-extractor.ts:353-353`
- **llamacpp** — Contains configuration for the LlamaCPP model, including endpoint, performance tuning, and client settings `config-paths.ts:195-217`
- **llm** — Not present in the provided code `config-paths.ts:242-275`
- **llm_model** — Specifies the model for the large language model `config-paths.ts:141-141`
- **llm_platform** — Indicates the platform for the large language model `config-paths.ts:139-139`
- **location** — The location of the comment block in the source code `comment-extractor.ts:39-39`
- **logDir** — Directory path for log files `logger-types.ts:17-17`
- **logDir** — Directory where log files are stored `logger.ts:34-34`
- **logLevel** — Current log level to be used `logger-types.ts:20-20`
- **majorVersion** — Stores the major version of the detected Java Virtual Machine `jvm-detection.ts:33-33`
- **max_batch_size** — Sets the maximum size of the batch for model input `config-paths.ts:205-205`
- **max_batch_size** — Represents the maximum batch size for processing `config-paths.ts:221-221`
- **max_batch_tokens** — Maximum number of tokens per batch for the TEI model `config-paths.ts:182-182`
- **max_client_batch_size** — Maximum number of texts per HTTP request for the TEI model `config-paths.ts:183-183`
- **maxDepth** — Maximum depth to traverse `glob.ts:67-67`, `glob.ts:179-179`
- **maxFiles** — Maximum number of log files to retain `logger-types.ts:19-19`
- **maxFileSize** — Maximum size of log files `logger-types.ts:18-18`
- **maxLineLength** — The maximum length of a line to be processed `stream-helpers.ts:30-30`
- **maxPoolSize** — The maximum number of Float32Array objects that can be held in the pool `float32-pool.ts:29-29`
- **maxPoolSize** — Defines the maximum size of the float32 pool `float32-pool.ts:44-44`
- **message** — Message content of the log entry `logger-types.ts:30-30`
- **message** — Contains the message of the log entry `logger.ts:20-20`
- **minLevel** — Minimum log level for logging `logger.ts:370-370`
- **mlx** — Indicates the use of MLX for model inference `config-paths.ts:218-233`
- **model** — Specifies the model name for the Ollama provider `fast-json.ts:247-247`
- **model** — Represents a model schema `fast-json.ts:270-270`
- **model** — Represents the model name `fast-json.ts:277-277`, `fast-json.ts:282-282`, `fast-json.ts:289-289`, `fast-json.ts:314-314`
- **model** — Not applicable in this context `ollama-checker.ts:34-34`
- **model_id** — Not present in the provided code `config-paths.ts:249-249`
- **model_id** — Stores the unique identifier for the selected model `config-paths.ts:256-256`
- **model_id** — Stores the unique identifier for the machine learning model `config-paths.ts:263-263`
- **model_id** — Specifies the model identifier for the API request `config-paths.ts:271-271`
- **models** — Contains an array of model configurations for OVMS `config-paths.ts:167-173`
- **models** — An array of model configurations for the TEI model `config-paths.ts:186-192`
- **models** — Contains a list of available models for inference `config-paths.ts:209-215`
- **models** — Defines an array of available models with their properties `config-paths.ts:225-231`
- **models** — An array of model names available in Ollama `ollama-checker.ts:18-18`
- **models** — Parses the JSON response to extract an array of model objects `ollama-checker.ts:34-34`
- **monitorWindow** — The time window for counting failures `circuit-breaker.ts:35-35`
- **mtime** — Returns the modification time of a file `file-ops.ts:487-487`
- **mtimeMs** — Gets the modification time of a file in milliseconds `file-ops.ts:472-472`
- **n_gpu_layers** — Defines the number of GPU layers used for model inference `config-paths.ts:199-199`
- **name** — The name of the circuit breaker for logging purposes `circuit-breaker.ts:37-37`
- **name** — Specifies the name for the Ollama pull request `fast-json.ts:252-252`
- **name** — Represents the name of an input `fast-json.ts:303-303`
- **name** — Not applicable in this context `ollama-checker.ts:34-34`
- **nanoseconds** — Bun runtime nanoseconds timer `runtime.ts:33-33`
- **nextTaskId** — The next available task ID for new tasks `similarity-worker-pool.ts:51-51`
- **node** — Represents the Node.js runtime interface `runtime.ts:254-254`
- **numWorkers** — Stores the number of worker threads `similarity-worker-pool.ts:255-255`
- **numWorkers** — The number of worker threads in the pool `similarity-worker-pool.ts:48-48`
- **ollama** — Not present in the provided code `config-paths.ts:253-259`
- **onlyDirectories** — Returns only directories `glob.ts:135-135`
- **onlyDirectories** — Return only directories `glob.ts:57-57`, `glob.ts:175-175`
- **onlyFiles** — Returns only files `glob.ts:55-55`, `glob.ts:134-134`
- **onlyFiles** — Return only files (default: true) `glob.ts:37-37`, `glob.ts:174-174`
- **onMatch** — Callback for each matched file `glob.ts:72-72`
- **onProgress** — A callback function to track the progress of the file copy operation `stream-helpers.ts:24-24`
- **optimal_qd** — Determines the optimal query depth for the model `config-paths.ts:147-147`
- **ovms** — Represents configuration for OVMS, including endpoint, batch size, mini batch, selected model, target device, endpoints, and models `config-paths.ts:158-178`
- **ovms_mini_batch** — Sets the mini batch size for OVMS `config-paths.ts:162-162`
- **parallel_slots** — Indicates the number of parallel slots for model execution `config-paths.ts:201-201`
- **partials** — Stores partial results for a task `similarity-worker-pool.ts:60-60`
- **password** — Bun runtime password operations `runtime.ts:37-37`
- **peakUsage** — The peak number of concurrent Float32Array objects in use `float32-pool.ts:34-34`
- **pendingResults** — A map of pending results, indexed by task ID, containing the results, resolve/reject functions, and partial results `similarity-worker-pool.ts:52-62`
- **pendingTasks** — Stores pending tasks `similarity-worker-pool.ts:258-258`
- **platform** — Not present in the provided code `config-paths.ts:246-246`
- **platform** — Specifies the platform for the embedding model `config-paths.ts:156-156`
- **pool** — An array of Float32Array objects managed by the pool `float32-pool.ts:42-42`
- **preferredFixerForTS** — Determines the preferred TypeScript fixer based on available linter configurations `config-detector.ts:9-9`
- **prewarmSize** — The number of Float32Array objects to pre-allocate at startup `float32-pool.ts:45-45`
- **prompt** — Provides the prompt for the Ollama provider `fast-json.ts:248-248`
- **query** — Specifies the query for the TEI rerank request `fast-json.ts:264-264`
- **query** — Stores the query string `fast-json.ts:283-283`
- **query** — The query vector used in the cosine similarity calculation `similarity-worker-pool.ts:39-39`
- **query** — A Float32Array representing the query vector used for similarity computation `similarity-worker.ts:13-13`
- **queueLength** — Represents the length of the task queue `similarity-worker-pool.ts:257-257`
- **quiet** — Suppress stderr output in shell command execution `shell.ts:108-108`
- **quiet** — Suppress stderr in output `shell.ts:69-69`
- **randomUUIDv7** — Bun runtime randomUUIDv7 operations `runtime.ts:42-42`
- **raw** — The raw content of the comment block `comment-extractor.ts:40-40`
- **received** — Indicates the number of chunks received `similarity-worker-pool.ts:59-59`
- **recentFailures** — Stores a list of recent failure times within the monitor window `circuit-breaker.ts:182-182`
- **recoveryTimeout** — The time before the circuit breaker transitions from OPEN to HALF_OPEN `circuit-breaker.ts:31-31`
- **recursive** — Creates a directory and any necessary parent directories `file-ops.ts:391-391`
- **recursive** — The function creates a directory recursively if the options object includes the recursive flag `file-ops.ts:403-403`
- **recursive** — The function asynchronously reads the directory contents, including file types, recursively if the options object includes the recursive flag `file-ops.ts:416-416`
- **recursive** — The function asynchronously reads the directory contents, excluding file types, recursively if the options object includes the recursive flag `file-ops.ts:417-417`
- **recursive** — Parses the recursive flag from the options object `file-ops.ts:420-420`
- **reject** — Rejects a task with an error `similarity-worker-pool.ts:57-57`
- **reject** — A function to reject the result of a task `similarity-worker-pool.ts:43-43`
- **releaseRate** — Tracks the percentage of acquired arrays that are released back to the pool `float32-pool.ts:210-210`
- **requestId** — Request ID associated with the log entry `logger-types.ts:33-33`
- **requestId** — Optional field for the request ID associated with the log entry `logger.ts:23-23`
- **resolve** — A function to resolve the result of a task `similarity-worker-pool.ts:42-42`
- **resolve** — Resolves a promise when a worker exits `similarity-worker-pool.ts:56-56`
- **results** — Array of results in same order as input `parallel.ts:149-149`
- **results** — A collection of results from the cosine similarity calculations `similarity-worker-pool.ts:55-55`
- **runtime** — Detects the current JavaScript runtime (Bun vs Node.js) `runtime.ts:128-128`
- **runtime** — Initializes the runtime information object `runtime.ts:129-129`
- **selected_model** — Indicates the selected model for OVMS `config-paths.ts:163-163`
- **selected_model** — The selected model for the TEI configuration `config-paths.ts:185-185`
- **selected_model** — Stores the currently selected model for inference `config-paths.ts:208-208`
- **selected_model** — Stores the selected model identifier `config-paths.ts:224-224`
- **semver** — Bun runtime semver operations `runtime.ts:43-43`
- **shape** — Represents the shape of an input `fast-json.ts:304-304`
- **similarities** — An array of Float32Array containing the cosine similarities computed for each vector in the database `similarity-worker.ts:20-20`
- **size** — The number of bits in the Bloom filter `bloom-filter.ts:14-14`
- **size** — Gets the size of a file `file-ops.ts:471-471`
- **size** — Returns the size of a file in bytes `file-ops.ts:486-486`
- **size** — Size property of BunFile `file-ops.ts:58-58`
- **sizeBytes** — Returns the size of a directory in bytes `shell.ts:566-566`
- **sizeMB** — Returns the size of a directory in megabytes `shell.ts:567-567`
- **skipEmpty** — A boolean indicating whether to skip empty lines in the stream `stream-helpers.ts:29-29`
- **sleep** — Returns a function that pauses execution for a specified number of milliseconds `runtime.ts:41-41`
- **stackTrace** — Stack trace of the log entry `logger-types.ts:32-32`
- **stackTrace** — Optional field for the stack trace of the log entry `logger.ts:22-22`
- **STALE_MS** — Time in milliseconds before log files are considered stale `logger.ts:37-37`
- **start** — The starting position of a comment `comment-extractor.ts:24-28`
- **startIdx** — The starting index of the chunk vectors in the cosine similarity calculation `similarity-worker-pool.ts:41-41`
- **startIdx** — The starting index in the database for similarity computation `similarity-worker.ts:15-15`
- **startIdx** — Stores the starting index for the similarity calculation `similarity-worker.ts:21-21`
- **state** — The current state of the circuit breaker `circuit-breaker.ts:57-57`
- **state** — Represents the current state of the circuit breaker (CLOSED, OPEN, or HALF_OPEN) `circuit-breaker.ts:181-181`
- **stats** — An object containing statistics for the Float32Array pool `float32-pool.ts:48-54`
- **status** — Exit status `shell.ts:45-45`
- **stderr** — Stores the standard error of a shell command `shell.ts:52-52`, `shell.ts:146-146`
- **stderr** — Standard error `shell.ts:32-32`
- **stderr** — Capture standard error from shell command execution `shell.ts:43-43`
- **stdin** — Standard input `shell.ts:33-33`
- **stdout** — Stores the standard output of a shell command `shell.ts:50-50`, `shell.ts:145-145`
- **stdout** — Standard output `shell.ts:31-31`
- **stdout** — Capture standard output from shell command execution `shell.ts:42-42`
- **success** — Command succeeded `shell.ts:56-56`
- **successCount** — The count of successful requests `circuit-breaker.ts:60-60`
- **successCount** — Counts the number of successful requests within the monitor window `circuit-breaker.ts:184-184`
- **successThreshold** — The number of successes needed to transition from HALF_OPEN to CLOSED `circuit-breaker.ts:33-33`
- **syncWrite** — Synchronously writes logs `logger.ts:373-373`
- **target_device** — Specifies the target device for OVMS `config-paths.ts:164-164`
- **taskId** — The unique identifier for the task currently being processed by the worker `similarity-worker-pool.ts:35-35`
- **taskQueue** — A queue of pending tasks to be processed by the worker threads `similarity-worker-pool.ts:50-50`
- **technique** — Represents the optimization technique used in the code `simd-vector-ops.ts:111-111`
- **tei** — Contains configuration for the TEI model, including endpoint, batch size, concurrency, and model details `config-paths.ts:179-194`
- **teiBatchDump** — Dumps a batch of TEI (Test Event Interface) logs `logger.ts:371-371`
- **text_1** — Represents the first text input `fast-json.ts:290-290`
- **text_2** — Represents the second text input `fast-json.ts:291-291`
- **texts** — Contains the array of text strings for the TEI rerank request `fast-json.ts:265-265`
- **tgi** — Not present in the provided code `config-paths.ts:260-267`
- **timeout** — Set a timeout for shell command execution in milliseconds `shell.ts:107-107`
- **timeout** — Timeout in milliseconds `shell.ts:65-65`, `shell.ts:184-184`
- **timestamp** — Timestamp of the log entry `logger-types.ts:27-27`
- **timestamp** — Stores the timestamp of the log entry `logger.ts:17-17`
- **top_n** — Represents the top N results `fast-json.ts:285-285`
- **totalAcquired** — The total number of Float32Array objects acquired from the pool `float32-pool.ts:31-31`
- **totalAllocated** — The total number of new Float32Array objects allocated when the pool was empty `float32-pool.ts:33-33`
- **totalReleased** — The total number of Float32Array objects released back to the pool `float32-pool.ts:32-32`
- **truncate** — Indicates whether to truncate the texts for the TEI rerank request `fast-json.ts:266-266`
- **type** — The type of the comment block `comment-extractor.ts:37-37`
- **type** — Type property of BunFile `file-ops.ts:59-59`
- **type** — Indicates the type of message, either "compute" or "ready" `similarity-worker.ts:12-12`
- **type** — Represents the type of the result `similarity-worker.ts:19-19`
- **ubatch_size** — Sets the size of the unbatched batch for model input `config-paths.ts:202-202`
- **useEmbeddingsApi** — Determines whether to use the /v3/embeddings API for OVMS `config-paths.ts:175-175`
- **utilizationRate** — Indicates the percentage of pool capacity that is currently being used `float32-pool.ts:209-209`
- **v8** — Returns an object containing runtime and version information, possibly including V8 version `runtime.ts:128-128`
- **v8** — Initializes an object with runtime and version information, possibly including V8 version `runtime.ts:129-129`
- **value** — Represents the result of processing an item `parallel.ts:149-149`
- **value** — Stores the value obtained from processing each item `parallel.ts:167-167`
- **vector_size** — Specifies the vector size for a model in OVMS `config-paths.ts:171-171`
- **vector_size** — The vector size for a model configuration `config-paths.ts:190-190`
- **vector_size** — Defines the size of the vector used for model input `config-paths.ts:213-213`
- **vector_size** — Represents the size of the vector `config-paths.ts:229-229`
- **vector_size** — Defines the size of the vector used for embedding or representation in the model `config-paths.ts:430-430`
- **vendor** — Stores the vendor of the detected Java Virtual Machine `jvm-detection.ts:34-34`
- **version** — Stores the version of the detected Java Virtual Machine `jvm-detection.ts:32-32`
- **version** — Bun runtime version `runtime-detection.ts:23-23`
- **version** — Deno runtime version `runtime.ts:21-24`
- **version** — Stores the version of the runtime `runtime.ts:32-32`
- **version** — Returns the runtime version information `runtime.ts:128-128`
- **version** — Returns the runtime version `runtime.ts:129-129`
- **windowsHide** — Windows hide flag `shell.ts:34-34`
- **withFileTypes** — Reads the contents of a directory with file types `file-ops.ts:416-416`
- **withFileTypes** — The function asynchronously reads the directory contents, excluding file types, recursively if the options object includes the recursive flag `file-ops.ts:417-417`
- **withFileTypes** — The function asynchronously reads the directory contents, including file types, recursively if the options object includes the recursive flag `file-ops.ts:420-420`
- **withFileTypes** — The function synchronously reads the directory contents, excluding file types, if the options object includes the withFileTypes flag `file-ops.ts:454-454`
- **worker** — A worker thread instance `similarity-worker-pool.ts:33-33`
- **workers** — An array of worker thread states `similarity-worker-pool.ts:47-47`
- **write** — Bun runtime write operations `runtime.ts:35-35`
- **YAML** — Bun runtime YAML operations `runtime.ts:40-40`

## Data Flow

- **Inputs:** Various -- file paths, string data for hashing, vectors for similarity, shell commands for execution.
- **Processing:** Utility-specific operations (hashing, filtering, pooling, subprocess management).
- **Outputs:** Processed results returned to callers across the codebase.

## Public API

| Export | Type | Description | Location |
|--------|------|-------------|----------|
| `BloomFilter` | class | Probabilistic O(1) membership testing | [`bloom-filter.ts:12-81`](./bloom-filter.ts) |
| `CircuitBreaker` | class | Three-state fault tolerance pattern | [`circuit-breaker.ts:15-15`](./circuit-breaker.ts) |
| `extractComments` | function | Extracts comments from source code | [`comment-extractor.ts`](./comment-extractor.ts) |
| `getConfigDir` | function | Returns platform-specific config directory | [`config-paths.ts`](./config-paths.ts) |
| `loadSemanticConfig` | function | Loads semantic-config.json | [`config-paths.ts`](./config-paths.ts) |
| `saveSemanticConfig` | function | Saves semantic-config.json | [`config-paths.ts`](./config-paths.ts) |
| `detectLinterConfig` | function | Detects project linter configuration | [`config-detector.ts`](./config-detector.ts) |
| `isError` | function | Type guard for Error objects in catch blocks | [`error-handling.ts`](./error-handling.ts) |
| `toError` | function | Safe unknown-to-Error conversion | [`error-handling.ts`](./error-handling.ts) |
| `fastHash` | function | Fast string hashing (xxHash-style) | [`fast-hash.ts`](./fast-hash.ts) |
| `Float32Pool` | class | Float32Array object pool for embeddings | [`float32-pool.ts`](./float32-pool.ts) |
| `globMatch` | function | File glob pattern matching | [`glob.ts`](./glob.ts) |
| `isBun` | function | Detects Bun runtime | [`runtime-detection.ts`](./runtime-detection.ts) |
| `exec` | function | Shell command execution wrapper | [`shell.ts`](./shell.ts) |
| `SimilarityWorkerPool` | class | Worker pool for parallel similarity computation | [`similarity-worker-pool.ts`](./similarity-worker-pool.ts) |

## Dependencies

### Internal Modules

| Module | Purpose |
|--------|---------|
| `logging` | Structured logging used by circuit breaker and other utilities |

### External Packages

| Package | Purpose |
|---------|---------|
| `lru-cache` | LRU caching in config detector |
| `node:child_process` | Shell command execution |
| `node:worker_threads` | Parallel worker management |

## Behavioral Properties

| Property | Value |
|----------|-------|
| Bloom filter defaults | 256 bits, 3 hash functions, ~5% FPR at 50 items |
| Circuit breaker states | CLOSED, OPEN, HALF_OPEN |
| Float32Pool strategy | Pre-allocated arrays with reuse for zero-allocation embedding ops |

## Error Handling

`isError()` and `toError()` provide safe error handling for `unknown` catch variables. Circuit breaker tracks failure counts and opens automatically after threshold. Shell execution returns structured results with stdout/stderr separation.

## Known Limitations

- SIMD vector operations require specific WASM module availability.
- Similarity worker pool creates Node.js worker threads which are not available in all runtimes.
- Bloom filter has inherent false positives; not suitable for exact membership testing.

## Files

| File | Description |
|------|-------------|
| `bloom-filter.ts` | Probabilistic set membership with configurable false positive rate |
| `circuit-breaker.ts` | Three-state circuit breaker for cascading failure protection |
| `comment-extractor.ts` | Source code comment extraction for documentation |
| `config-detector.ts` | Detects project linter configs (Biome, ESLint, oxlint) |
| `config-paths.ts` | Platform-specific config directory and semantic config I/O |
| `error-handling.ts` | Type-safe error utilities for `unknown` catch variables |
| `fast-hash.ts` | Fast string hashing for deduplication and indexing |
| `fast-json.ts` | Optimized JSON serialization helpers |
| `file-ops.ts` | File system operation utilities |
| `float32-pool.ts` | Float32Array pool for zero-allocation embedding operations |
| `glob.ts` | File glob pattern matching |
| `jvm-detection.ts` | JVM runtime detection for Java/Kotlin tools |
| `logger.ts` | Structured logging implementation |
| `logger-types.ts` | Logging type definitions |
| `ollama-checker.ts` | Ollama service availability checking |
| `parallel.ts` | Parallel task execution utilities |
| `provider-logger.ts` | Embedding provider event logging |
| `quiet-console.ts` | Console output suppression for pipe mode |
| `runtime.ts` | Runtime environment utilities |
| `runtime-detection.ts` | Bun vs Node.js runtime detection |
| `shell.ts` | Shell command execution wrapper |
| `simd-vector-ops.ts` | SIMD-accelerated vector operations |
| `similarity-worker.ts` | Single similarity computation worker |
| `similarity-worker-pool.ts` | Worker pool for parallel similarity |
| `stream-helpers.ts` | Data stream helper functions |
