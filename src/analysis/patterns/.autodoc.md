# Patterns

## 🤖 Overview

The `patterns` module provides a comprehensive system for detecting and analyzing code patterns. It is used by developers and data scientists to identify common code structures and their semantic meanings. The module includes a pattern engine that processes code to detect patterns, a semantic validator to ensure the correctness of detected patterns, and a formatter to present these patterns in a user-friendly manner.

The `patterns` module is structured around several key components: an exemplar store for caching and retrieving code examples, a pattern engine for detecting patterns, a semantic validator for ensuring pattern accuracy, and a structural detector for identifying code structures. These components work together to provide a robust framework for code analysis and pattern detection.

## 🤖 Architecture

```
  +-----------------------------+
  |     Exemplar Store         |
  |  (caches and retrieves code |
  |     examples for pattern    |
  |     detection)              |
  +-----------------------------+
           |
           v
  +-----------------------------+
  |     Pattern Engine         |
  |  (detects code patterns)   |
  +-----------------------------+
           |
           v
  +-----------------------------+
  | Semantic Validator         |
  |  (validates detected patterns) |
  +-----------------------------+
           |
           v
  +-----------------------------+
  | Structural Detector        |
  |  (identifies code structures) |
  +-----------------------------+
           |
           v
  +----------------
  | Pattern Registry |
  | (registers and |
  |   manages patterns) |
  +----------------+
           |
           v
  +-----------------------------+
  | Pattern Formatter         |
  |  (formats and presents patterns) |
  +-----------------------------+
```

## 🤖 Flow

```
  +-----------------------------+
  |     Exemplar Store         |
  |  (loads and caches code examples) |
  +-----------------------------+
           |
           v
  +-----------------------------+
  |     Pattern Engine         |
  |  (analyzes code to detect patterns) |
  +-----------------------------+
           |
           v
  +-----------------------------+
  | Semantic Validator         |
  |  (validates detected patterns) |
  +-----------------------------+
           |
           v
  +-----------------------------+
  | Structural Detector        |
  |  (identifies code structures) |
  +-----------------------------+
           |
           v
  +-----------------------------+
  | Pattern Registry         |
  |  (registers and manages patterns) |
  +-----------------------------+
           |
           v
  +-----------------------------+
  | Pattern Formatter         |
  |  (formats and presents patterns) |
  +-----------------------------+
```

## 🤖 Entity Listing

### Function
- **a** — Represents a variable or value `structural-detector.ts:557-560`
- **a** — Represents an entity `structural-detector.ts:605-608`
- **a** — Adds the total and passed counts from another object to the current object `structural-detector.ts:666-669`
- **a** — Adds the total and passed counts from another object `structural-detector.ts:711-714`
- **add** — Adds an entity to the evaluation `structural-detector.ts:487-490`
- **antiPatterns** — Identifies anti-patterns in the code `pattern-engine.ts:295-295`
- **applyPagination** — Applies pagination to the results of pattern detection `pattern-engine.ts:313-313`
- **bestPatterns** — Selects the best patterns from the detected ones `pattern-engine.ts:296-296`
- **codes** — Represents the code snippets of exemplars `exemplar-store.ts:185-185`
- **codeSmells** — Detects code smells in the code `pattern-engine.ts:297-297`
- **countTotalCriteria** — Counts the total number of criteria `structural-detector.ts:966-1049`
- **definitions** — Stores the Zod schema for validating YAML pattern definitions `pattern-registry.ts:176-180`
- **entityIds** — IDs of entities being evaluated `structural-detector.ts:326-326`
- **filtered** — Filters detected patterns based on certain criteria `pattern-engine.ts:286-286`
- **filtered** — Represents the count of filtered criteria `structural-detector.ts:926-930`
- **getCompiled** — Compiles a pattern definition into a set of criteria for matching entities, caching the result for efficiency `structural-detector.ts:55-77`
- **getMeta** — Retrieves metadata for an entity `structural-detector.ts:153-202`
- **hasReadOnly** — Checks if an entity has read-only properties `structural-detector.ts:803-803`
- **loadPage** — Loads a page of code for pattern detection `pattern-engine.ts:196-206`
- **mandatoryCount** — Represents the count of mandatory criteria `structural-detector.ts:884-884`
- **needsGraph** — Indicates if a graph is needed for evaluation `structural-detector.ts:307-307`
- **needsSemantic** — Filters structural candidates that require semantic validation `semantic-validator.ts:34-34`
- **noGraph** — Indicates if a graph is not needed for evaluation `structural-detector.ts:310-310`
- **optimizations** — Identifies optimization opportunities in the code `pattern-engine.ts:298-298`
- **patternMap** — Maps detected patterns to their respective entities `pattern-engine.ts:258-258`
- **patternMap** — Maps pattern IDs to their respective pattern objects `pattern-engine.ts:365-365`
- **registerDetector** — Registers a custom detector function with a given name `structural-detector.ts:25-27`
- **registerDetectors** — Registers multiple custom detectors at once `structural-detector.ts:29-33`
- **stripCandidates** — Removes candidates that do not meet the criteria for pattern detection `pattern-engine.ts:182-193`
- **structuralOnly** — Filters structural candidates that are structural-only, i.e., do not require semantic validation `semantic-validator.ts:35-35`
- **total** — Represents the total count of criteria `structural-detector.ts:942-943`

### Method
- **checkEntity** — Checks if an entity is suitable for pattern detection `pattern-engine.ts:346-385`
- **chkBoolEq** — Checks if two boolean values are equal `structural-detector.ts:534-547`
- **chkHas** — Checks if an object has a specific property `structural-detector.ts:524-531`
- **chkMax** — Checks if a value is less than or equal to a maximum value `structural-detector.ts:514-521`
- **chkMin** — Checks if a value is greater than or equal to a minimum value `structural-detector.ts:504-511`
- **clearEvalCache** — Clears the compiled pattern cache `structural-detector.ts:220-222`
- **computeHash** — Computes a hash for all exemplar codes `exemplar-store.ts:183-189`
- **computeHealthScore** — Computes the health score of the code based on detected patterns `pattern-engine.ts:401-417`
- **computeTopIssues** — Computes the top issues in the code based on detected patterns `pattern-engine.ts:419-439`
- **constructor** — Initializes the Exemplar Store with optional directories for exemplars and cache `exemplar-store.ts:44-49`
- **constructor** — Initializes the PatternEngine with an optional embedding generator `pattern-engine.ts:67-67`
- **constructor** — Initializes the PatternRegistry instance `pattern-registry.ts:150-150`
- **constructor** — Initializes a SemanticValidator with an exemplar store and an optional embedding generator `semantic-validator.ts:17-20`
- **createMatch** — Creates a PatternMatch object for a structural candidate with a given similarity score and optional exemplar `semantic-validator.ts:94-121`
- **detect** — Method to detect structural patterns in entities `structural-detector.ts:224-402`
- **detectLanguage** — Detects the language of the code being analyzed `pattern-engine.ts:389-399`
- **emptyResult** — Returns an empty result when no patterns are detected `pattern-engine.ts:441-457`
- **ensureDetectorsForLanguage** — Ensures language-specific detectors are loaded for the current language `pattern-engine.ts:98-110`
- **ensureEmbeddings** — Ensures that all exemplars have embeddings `exemplar-store.ts:103-137`
- **evalCallsAndDecorators** — Evaluates function calls and decorators `structural-detector.ts:628-657`
- **evalJitAndAntipatternHints** — Evaluates JIT compilation and antipattern hints `structural-detector.ts:659-702`
- **evalLanguageSpecific** — Evaluates language-specific criteria `structural-detector.ts:704-811`
- **evalMetricsAndControlFlow** — Evaluates metrics and control flow of a function `structural-detector.ts:598-626`
- **evalNameCriteria** — Evaluates name-related criteria `structural-detector.ts:813-833`
- **evalReturnTypeAndParams** — Evaluates the return type and parameters of a function `structural-detector.ts:549-596`
- **evaluateMetadataCriteria** — Evaluates metadata criteria for an entity `structural-detector.ts:406-409`
- **evaluateMetadataUncached** — Evaluates metadata without using a cache `structural-detector.ts:835-914`
- **evaluateOptional** — Evaluates optional criteria for an entity `structural-detector.ts:477-499`
- **evaluateRelationshipCriteria** — Evaluates relationship-related criteria `structural-detector.ts:918-961`
- **evaluateRequired** — Evaluates required criteria for an entity `structural-detector.ts:412-474`
- **findSimilarExemplars** — Finds similar exemplars based on a given pattern `exemplar-store.ts:142-161`
- **format** — Format scan result based on output format `pattern-formatter.ts:11-21`
- **formatDetailed** — Format scan result into a detailed string `pattern-formatter.ts:80-129`
- **formatSummary** — Format scan result into a summary string `pattern-formatter.ts:23-78`
- **get** — Retrieves an exemplar by its ID `exemplar-store.ts:166-168`
- **getEntityEmbedding** — Retrieves the embedding for an entity, generating it on-the-fly if necessary `semantic-validator.ts:123-139`
- **getForPattern** — Retrieves exemplars by their pattern ID `exemplar-store.ts:173-175`
- **getLanguages** — Retrieves all languages for which patterns are defined `pattern-registry.ts:249-251`
- **getPattern** — Retrieves a specific pattern by its name `pattern-registry.ts:242-244`
- **getPatterns** — Retrieves all loaded pattern definitions `pattern-registry.ts:209-237`
- **initialize** — Lazy initialization of the engine, loading YAML rules, exemplars, and common detectors `pattern-engine.ts:73-93`
- **load** — Loads exemplar YAML files and initializes the store `exemplar-store.ts:54-98`
- **load** — Loads all pattern definitions from the specified directory `pattern-registry.ts:155-204`
- **matchToJSON** — Not present in the provided code `pattern-formatter.ts:144-165`
- **saveCache** — Saves the current state of the store to the cache `exemplar-store.ts:209-230`
- **scan** — Initiates the pattern detection process for a given entity `pattern-engine.ts:115-341`
- **size** — Returns the number of exemplars in the store `exemplar-store.ts:177-179`
- **size** — Returns the number of loaded pattern definitions `pattern-registry.ts:256-258`
- **toJSON** — Not present in the provided code `pattern-formatter.ts:134-142`
- **tryLoadCache** — Attempts to load cached embeddings `exemplar-store.ts:191-207`
- **validate** — Validates structural candidates with semantic similarity, returning confirmed PatternMatch[] with combined scores `semantic-validator.ts:27-90`

### Class
- **ExemplarStore** — A class for loading and managing code examples, lazy embedding them, and caching embeddings `exemplar-store.ts:36-231`
- **PatternEngine** — Main orchestrator for pattern detection pipeline `pattern-engine.ts:59-458`
- **PatternFormatter** — Format scan result based on output format `pattern-formatter.ts:7-166`
- **PatternRegistry** — Loads and indexes YAML pattern definitions `pattern-registry.ts:145-259`
- **SemanticValidator** — A class for embedding similarity validation of structural candidates `semantic-validator.ts:16-140`
- **StructuralDetector** — Class for detecting structural patterns in metadata `structural-detector.ts:213-962`

### Interface
- **CachedEmbeddings** — An object containing a hash of all exemplar codes and a map of base64 Float32Array embeddings `exemplar-store.ts:29-32`
- **CompiledCriteria** — Represents compiled criteria for structural pattern detection `structural-detector.ts:37-51`
- **CustomDetectorResult** — Result of a custom detector function `types.ts:239-243`
- **EntityMeta** — Represents metadata about an entity, including its modifiers, return type, parameters, and various complexity and code quality metrics `structural-detector.ts:81-149`
- **ExemplarFile** — Represents a YAML file containing an array of code examples `exemplar-store.ts:19-27`
- **PatternDefinition** — Definition of a pattern `types.ts:141-171`
- **PatternExemplar** — Represents a pattern exemplar with an ID, pattern ID, language, code, and description `types.ts:175-181`
- **PatternMatch** — Represents a match of a pattern `types.ts:185-199`
- **PatternScanOptions** — Defines the options for a pattern scan `types.ts:221-235`
- **PatternScanResult** — Stores the result of a pattern scan `types.ts:203-217`
- **RelationshipCriteria** — Specifies criteria for relationship detection, including type, direction, and counts `types.ts:15-22`
- **StructuralCandidate** — Candidate entity for structural pattern detection `types.ts:253-258`
- **StructuralCriteria** — Defines structural criteria for pattern detection, including entity types, modifiers, return types, parameters, and metrics `types.ts:24-137`

### Type_alias
- **CustomDetectorFn** — Function for custom pattern detection `types.ts:245-249`
- **EvalResult** — Represents the result of evaluating a structural pattern `structural-detector.ts:206-206`
- **OptEval** — Optimized evaluation of structural patterns `structural-detector.ts:210-210`
- **PatternCategory** — Represents the category of a detected pattern, such as anti-pattern, best-pattern, code-smell, or optimization `types.ts:9-9`
- **PatternSeverity** — Defines the severity level of a detected pattern, ranging from critical to info `types.ts:11-11`

### Import_decl
- **../../logging/index.js** — Imports `../../logging/index.js` from `../../logging/index.js`. `exemplar-store.ts:12-12`, `pattern-engine.ts:15-15`, `pattern-registry.ts:15-15`, `semantic-validator.ts:11-11`, `structural-detector.ts:11-11`
- **../../semantic/embedding-generator.js** — Imports `../../semantic/embedding-generator.js` from `../../semantic/embedding-generator.js`. `exemplar-store.ts:13-13`, `pattern-engine.ts:16-16`, `semantic-validator.ts:12-12`
- **../../types/storage.js** — Imports `../../types/storage.js` from `../../types/storage.js`. `pattern-engine.ts:17-17`, `structural-detector.ts:12-12`
- **../../utils/simd-vector-ops.js** — Imports `../../utils/simd-vector-ops.js` from `../../utils/simd-vector-ops.js`. `exemplar-store.ts:14-14`
- **./detectors/common.js** — Imports `./detectors/common.js` from `./detectors/common.js`. `pattern-engine.ts:18-18`
- **./detectors/csharp.js** — Imports `./detectors/csharp.js` from `./detectors/csharp.js`. `pattern-engine.ts:19-19`
- **./detectors/go.js** — Imports `./detectors/go.js` from `./detectors/go.js`. `pattern-engine.ts:20-20`
- **./detectors/java.js** — Imports `./detectors/java.js` from `./detectors/java.js`. `pattern-engine.ts:21-21`
- **./detectors/python.js** — Imports `./detectors/python.js` from `./detectors/python.js`. `pattern-engine.ts:22-22`
- **./detectors/typescript.js** — Imports `./detectors/typescript.js` from `./detectors/typescript.js`. `pattern-engine.ts:23-23`
- **./detectors/zig.js** — Imports `./detectors/zig.js` from `./detectors/zig.js`. `pattern-engine.ts:24-24`
- **./exemplar-store.js** — Imports `./exemplar-store.js` from `./exemplar-store.js`. `pattern-engine.ts:25-25`, `semantic-validator.ts:13-13`
- **./pattern-registry.js** — Imports `./pattern-registry.js` from `./pattern-registry.js`. `pattern-engine.ts:26-26`
- **./semantic-validator.js** — Imports `./semantic-validator.js` from `./semantic-validator.js`. `pattern-engine.ts:27-27`
- **./structural-detector.js** — Imports `./structural-detector.js` from `./structural-detector.js`. `pattern-engine.ts:28-28`
- **./types.js** — Imports `./types.js` from `./types.js`. `exemplar-store.ts:15-15`, `pattern-formatter.ts:5-5`, `pattern-registry.ts:16-16`, `semantic-validator.ts:14-14`
- **./types.js** — Imports `./types.js`. `pattern-engine.ts:29-36`, `structural-detector.ts:13-19`
- **node:crypto** — Imports `node:crypto` from `node:crypto`. `exemplar-store.ts:8-8`
- **node:fs** — Imports `node:fs` from `node:fs`. `exemplar-store.ts:9-9`, `pattern-registry.ts:11-11`
- **node:path** — Imports `node:path` from `node:path`. `exemplar-store.ts:10-10`, `pattern-engine.ts:14-14`, `pattern-registry.ts:12-12`
- **yaml** — YAML parsing and serialization. from `yaml`. `exemplar-store.ts:11-11`, `pattern-registry.ts:13-13`
- **zod** — Imports `zod` from `zod`. `pattern-registry.ts:14-14`

### Property
- **after** — After code snippet for the pattern `types.ts:152-152`
- **allPatterns** — Returns all loaded pattern definitions `pattern-registry.ts:147-147`
- **antiPatternCount** — Counts the number of anti-patterns detected `types.ts:210-210`
- **antipatternHints** — Provides hints for antipatterns `structural-detector.ts:97-106`
- **antiPatterns** — Contains anti-patterns detected in the code `types.ts:204-204`
- **anyTypeCount** — Counts `any` type usage `structural-detector.ts:129-129`
- **argumentsRefCount** — Counts the number of arguments referenced in a function or method `structural-detector.ts:92-92`
- **asyncNoAwaitCount** — Counts the number of `async` functions without `await` statements `structural-detector.ts:133-133`
- **awaits** — Counts the number of await expressions in a function or method `structural-detector.ts:86-86`
- **bareExceptCount** — Counts bare `except` blocks `structural-detector.ts:124-124`
- **baseClasses** — Represents the base classes of an entity `structural-detector.ts:162-162`
- **before** — Before code snippet for the pattern `types.ts:151-151`
- **benchmark** — Benchmark for the pattern `types.ts:155-155`
- **bestPatternCount** — Counts the number of best practices patterns detected `types.ts:211-211`
- **bestPatterns** — Contains best practices patterns detected in the code `types.ts:205-205`
- **bigO** — Big O notation for the pattern `types.ts:149-154`
- **branches** — Counts the number of branches in a function or method `structural-detector.ts:86-86`
- **cacheDir** — The directory where the cache files are stored `exemplar-store.ts:42-42`
- **callNames** — Stores the names of function calls `structural-detector.ts:87-87`
- **callsExclude** — Entities that must not be called by the entity `types.ts:59-59`
- **callsExcludeRe** — An array of regular expressions for excluded calls `structural-detector.ts:44-44`
- **callsInclude** — Entities that must be called by the entity `types.ts:58-58`
- **callsIncludeRe** — An array of regular expressions for included calls `structural-detector.ts:43-43`
- **category** — Represents the category of the pattern `pattern-registry.ts:211-211`
- **category** — Category of the pattern `types.ts:144-144`
- **category** — Categorizes the type of pattern `types.ts:225-225`
- **cf** — Contains counts of branches, loops, exceptions, and awaits in the entity's code `structural-detector.ts:86-86`
- **classMeta** — Represents the metadata of a class `structural-detector.ts:142-148`
- **closestExemplar** — Represents the closest exemplar for a pattern `types.ts:197-197`
- **code** — The code snippet of an exemplar, truncated to 400 characters `exemplar-store.ts:24-24`
- **code** — Represents the code snippet of the pattern `types.ts:179-179`
- **codeSmellCount** — Counts the number of code smells detected `types.ts:212-212`
- **codeSmells** — Contains code smells detected in the code `types.ts:206-206`
- **codeSnippet** — Represents a snippet of code `types.ts:198-198`
- **cognitiveComplexity** — Evaluates the mental effort required to understand a function or method `structural-detector.ts:85-85`
- **combinedScore** — Represents the combined score of a pattern match `types.ts:195-195`
- **confidence** — Stores the confidence level of a match `structural-detector.ts:206-206`
- **confidence** — Stores the confidence level of a structural detection `structural-detector.ts:253-253`
- **confidence** — Confidence level of a detected pattern `types.ts:241-241`
- **confidence** — Indicates the confidence level of a match `types.ts:256-256`
- **count** — Counts the number of detected patterns `pattern-engine.ts:421-421`
- **count** — Stores counts and severities for patterns `pattern-engine.ts:422-422`
- **count** — Counts the occurrences of a pattern `types.ts:214-214`
- **crossFileRatio** — Defines the ratio of relationships crossing file boundaries `types.ts:21-21`
- **csharpHints** — Counts C# syntax hints `structural-detector.ts:112-122`
- **currentEntities** — Current entities being evaluated `structural-detector.ts:217-217`
- **customDetector** — Optional string for a custom detector, e.g., "checkPromiseNoCatch" `types.ts:163-163`
- **cyclomaticComplexity** — Measures the complexity of a function or method `structural-detector.ts:85-85`
- **cyclomaticComplexity** — Calculates the cyclomatic complexity of the code `structural-detector.ts:138-138`
- **decoratorMatch** — Regular expression patterns for decorators `types.ts:62-62`
- **decoratorMatchRe** — An array of regular expressions for matching decorators `structural-detector.ts:45-45`
- **decoratorNames** — Stores the names of decorators `structural-detector.ts:88-88`
- **deleteCount** — Counts the number of delete operations in a function or method `structural-detector.ts:91-91`
- **description** — A brief description of an exemplar `exemplar-store.ts:25-25`
- **description** — Represents the description of an exemplar `exemplar-store.ts:146-146`
- **description** — Stores the description of a result `exemplar-store.ts:150-150`
- **description** — Provides a description of the closest exemplar `semantic-validator.ts:97-97`
- **description** — Description of the pattern `types.ts:147-147`
- **description** — Represents a description of the pattern `types.ts:180-180`
- **description** — Provides a detailed description of a code entity `types.ts:197-197`
- **direction** — Indicates the direction of the relationship, either incoming or outgoing `types.ts:17-17`
- **doubleAssertionCount** — Counts the number of double type assertions `structural-detector.ts:99-99`
- **dunderMethods** — Counts the number of `__` methods in the code `structural-detector.ts:144-144`
- **dynamicPropAccessCount** — Counts the number of dynamic property accesses `structural-detector.ts:95-95`
- **embedded** — A boolean indicating whether the exemplar embeddings have been generated `exemplar-store.ts:41-41`
- **embeddings** — A map of base64 Float32Array embeddings for each exemplar ID `exemplar-store.ts:31-31`
- **embeddings** — Stores a map of embeddings `exemplar-store.ts:39-39`
- **emptyCatchCount** — Counts empty catch blocks `structural-detector.ts:121-121`
- **enabled** — Indicates if the pattern is enabled `types.ts:157-157`
- **enabledOnly** — Filters patterns to only include enabled ones `pattern-registry.ts:213-213`
- **entity** — Entity being evaluated `structural-detector.ts:251-251`
- **entity** — Entity being analyzed for structural patterns `types.ts:254-254`
- **entityId** — Represents an identifier for an entity `types.ts:188-188`
- **entityLimit** — Limit on the number of entities to consider `types.ts:232-232`
- **entityName** — Represents the name of an entity `types.ts:189-189`
- **entityType** — Represents the type of an entity `types.ts:190-190`
- **entityTypes** — Specifies the types of entities to consider `types.ts:26-26`
- **entityTypeSet** — A set of entity types that match the pattern `structural-detector.ts:38-38`
- **evalCache** — Cache for compiled pattern criteria `structural-detector.ts:215-215`
- **evalExecCount** — Counts the number of `eval` calls in the code `structural-detector.ts:130-130`
- **exceptions** — Counts the number of exception handling blocks in a function or method `structural-detector.ts:86-86`
- **exceptPassCount** — Counts `except pass` blocks `structural-detector.ts:125-125`
- **exemplarIds** — Optional array of exemplar IDs `types.ts:166-166`
- **exemplars** — A map of pattern IDs to an array of PatternExemplar objects `exemplar-store.ts:20-26`
- **exemplars** — Stores a map of pattern exemplars `exemplar-store.ts:37-37`
- **exemplarsByPattern** — A map of pattern IDs to an array of PatternExemplar objects `exemplar-store.ts:38-38`
- **exemplarStore** — Stores exemplar patterns `pattern-engine.ts:61-61`
- **filePath** — Represents the file path of an entity `types.ts:191-191`
- **filePath** — Specifies the path to the file `types.ts:223-223`
- **filePathMatch** — Regular expression pattern for file paths `types.ts:68-68`
- **filePathMatchRe** — A regular expression for matching file paths `structural-detector.ts:48-48`
- **filePathNotMatch** — Regular expression pattern for file paths to exclude `types.ts:69-69`
- **filePathNotMatchRe** — A regular expression for not matching file paths `structural-detector.ts:49-49`
- **forbiddenModifiers** — Lists forbidden modifiers for the entity `types.ts:30-30`
- **forceUnwrapCount** — Counts the use of `!` to force unwrap optional values `structural-detector.ts:108-108`
- **genericRaiseCount** — Counts generic `raise` statements `structural-detector.ts:126-126`
- **hasArgumentsReference** — Indicates whether the entity references arguments `types.ts:77-77`
- **hasAwaits** — Indicates whether the entity contains await expressions `types.ts:53-53`
- **hasDeleteExpression** — Indicates whether the entity contains delete expressions `types.ts:76-76`
- **hasExceptions** — Indicates whether the entity contains exception handling `types.ts:52-52`
- **hash** — A hash of all exemplar codes `exemplar-store.ts:30-30`
- **hasInheritance** — Indicates whether an entity has inheritance `structural-detector.ts:89-89`
- **hasInnerHtmlAssign** — Indicates whether the entity contains innerHTML assignments `types.ts:85-85`
- **hasLockOnThis** — Indicates whether the code uses a lock on `this `types.ts:99-99`
- **hasLoops** — Indicates whether the entity contains loops `types.ts:51-51`
- **hasNewDisposableNoUsing** — Determines if the code uses a new disposable object without `using `types.ts:101-101`
- **hasNewHttpClient** — Checks if the code uses a new `HttpClient `types.ts:100-100`
- **hasNoInheritance** — Indicates whether the entity has no inheritance `types.ts:65-65`
- **hasOrWithDefault** — Indicates whether the entity uses or with default parameters `types.ts:87-87`
- **hasParallelForEachAsync** — Counts the use of `Parallel.ForEachAsync `structural-detector.ts:119-119`
- **hasParallelForEachAsync** — Indicates whether the code uses a parallel `forEach` with `async `types.ts:102-102`
- **hasParamMutation** — Indicates whether the entity mutates parameters `types.ts:86-86`
- **hasPyAsyncNoAwait** — Determines if the code uses `async` without `await `types.ts:117-117`
- **hasPyOpenWithoutWith** — Indicates if the code uses `open` without `with `types.ts:116-116`
- **hasPyPropertyNoSetter** — Indicates if the pattern has a property without a setter `types.ts:133-133`
- **hasPyReRaiseDifferent** — Indicates if the pattern has different re-raise statements `types.ts:124-124`
- **hasPySlots** — Indicates if the pattern has slots `types.ts:127-127`
- **hasPyStringConcatInLoop** — Checks if the code uses string concatenation in a loop in Python `types.ts:115-115`
- **hasRegexLiterals** — Indicates whether the code uses regular expression literals `types.ts:89-89`
- **hasSetter** — Checks if an entity has a setter method `structural-detector.ts:145-145`
- **hasSlots** — Checks if a class has slots `structural-detector.ts:143-143`
- **hasStringConcatInLoop** — Checks if the code uses string concatenation in a loop `types.ts:105-105`
- **hasThrowNonError** — Indicates whether the entity throws non-error values `types.ts:88-88`
- **hasWithStatement** — Indicates whether an entity contains a with statement `structural-detector.ts:93-93`
- **hasWithStatement** — Indicates whether the entity contains with statements `types.ts:78-78`
- **healthScore** — Evaluates the health score of the code `types.ts:215-215`
- **id** — A unique identifier for an exemplar `exemplar-store.ts:21-21`
- **id** — Represents the unique identifier of an exemplar `exemplar-store.ts:146-146`
- **id** — Stores the ID of a result `exemplar-store.ts:150-150`
- **id** — Represents the ID of the closest exemplar `semantic-validator.ts:97-97`
- **id** — Unique identifier for a pattern `types.ts:142-142`
- **id** — Represents an identifier for a pattern `types.ts:176-176`
- **id** — Optionally holds the ID and similarity of the closest exemplar, along with its description `types.ts:197-197`
- **initCallCount** — Counts the number of `__init__` calls in the code `structural-detector.ts:146-146`
- **initialized** — Indicates whether the engine has been initialized `pattern-engine.ts:64-64`
- **innerHtmlAssignCount** — Counts occurrences of innerHTML assignment in the code `structural-detector.ts:102-102`
- **interfaces** — Represents the interfaces of an entity `structural-detector.ts:162-162`
- **isinstanceCount** — Counts the number of `isinstance` calls in the code `structural-detector.ts:139-139`
- **jitHints** — Provides hints related to Just-In-Time compilation, including delete count, arguments reference count, and other properties `structural-detector.ts:90-96`
- **language** — The programming language of the code in an exemplar `exemplar-store.ts:23-23`
- **language** — Represents the language of the pattern `pattern-registry.ts:210-210`
- **language** — Language of the pattern `types.ts:143-143`
- **language** — Represents the programming language of the pattern `types.ts:178-178`
- **language** — Specifies the programming language `types.ts:224-224`
- **limit** — Limit value for pattern detection `types.ts:230-230`
- **line** — Represents the line number of an entity `types.ts:192-192`
- **linesOfCode** — Counts the number of lines in a function or method `structural-detector.ts:85-85`
- **loaded** — A boolean indicating whether the exemplar YAML files have been loaded `exemplar-store.ts:40-40`
- **loaded** — Indicates whether the pattern registry has been loaded `pattern-registry.ts:148-148`
- **loadedDetectorModules** — Tracks loaded detector modules `pattern-engine.ts:65-65`
- **lockOnThisCount** — Counts `lock(this)` usage `structural-detector.ts:115-115`
- **loops** — Counts the number of loops in a function or method `structural-detector.ts:86-86`
- **match** — Match criteria for pattern detection `types.ts:240-240`
- **matched** — Indicates if a pattern was matched `structural-detector.ts:254-254`
- **matchedCriteria** — Indicates which criteria were matched `structural-detector.ts:206-206`
- **matchedCriteria** — Represents the count of matched criteria `structural-detector.ts:922-922`
- **matchedCriteria** — Represents the criteria matched by a pattern `types.ts:196-196`
- **matchedCriteria** — Criteria matched by a detected pattern `types.ts:242-242`
- **matchedCriteria** — Contains an array of matched criteria strings `types.ts:257-257`
- **max** — Not applicable in this context `types.ts:21-21`
- **maxCount** — Sets the maximum count of relationships to consider `types.ts:19-19`
- **maxCyclomatic** — Sets the maximum cyclomatic complexity `types.ts:44-44`
- **maxLOC** — Maximum number of lines of code (LOC) for an entity `types.ts:48-48`
- **maxParams** — Sets the maximum number of parameters `types.ts:38-38`
- **methodCount** — Counts the number of methods in the code `structural-detector.ts:147-147`
- **metrics** — Stores various code metrics for structural analysis `structural-detector.ts:85-85`
- **min** — Not applicable in this context `types.ts:21-21`
- **minAnyType** — Determines the minimum number of `any` type usages `types.ts:113-113`
- **minBareExcept** — Specifies the minimum number of bare `except` blocks `types.ts:108-108`
- **minBranches** — Minimum number of branches in the control flow graph `types.ts:54-54`
- **minCallCount** — Minimum number of calls to other entities `types.ts:57-57`
- **minCognitive** — Sets the minimum cognitive complexity `types.ts:45-45`
- **minConfidence** — Minimum confidence threshold for pattern detection `types.ts:227-227`
- **minCount** — Sets the minimum count of relationships to consider `types.ts:18-18`
- **minCyclomatic** — Sets the minimum cyclomatic complexity `types.ts:43-43`
- **minCyclomaticPy** — Minimum cyclomatic complexity for a pattern `types.ts:122-122`
- **minDynamicPropertyAccess** — Minimum number of dynamic property accesses `types.ts:80-80`
- **minEmptyCatch** — Defines the minimum number of empty catch blocks `types.ts:104-104`
- **minEvalExec** — Sets the minimum number of `eval` or `exec` calls `types.ts:114-114`
- **minExceptPass** — Determines the minimum number of `except pass` blocks `types.ts:109-109`
- **minForceUnwraps** — Specifies the minimum number of force unwraps in the code `types.ts:92-92`
- **minGenericRaise** — Sets the minimum number of generic `raise` calls `types.ts:110-110`
- **minIsinstanceCount** — Minimum count of isinstance calls for a pattern `types.ts:123-123`
- **minLOC** — Sets the minimum lines of code `types.ts:47-47`
- **minNesting** — Sets the minimum nesting level `types.ts:46-46`
- **minNestingDepth** — Defines the minimum nesting depth of code blocks `types.ts:121-121`
- **minNonNullAssertions** — Minimum number of non-null assertions `types.ts:84-84`
- **minNullForgiving** — Specifies the minimum number of null forgiving operations `types.ts:98-98`
- **minParams** — Sets the minimum number of parameters `types.ts:37-37`
- **minPyInitCalls** — Minimum number of __init__ calls for a pattern `types.ts:131-131`
- **minPyMethodCount** — Minimum number of methods for a pattern `types.ts:132-132`
- **minReturnCount** — Specifies the minimum number of return statements `types.ts:120-120`
- **minSemanticSimilarity** — Minimum semantic similarity threshold, defaulting to 0 `types.ts:167-167`
- **minSpreadInCalls** — Minimum number of spread operators in calls `types.ts:79-79`
- **minStructuralConfidence** — Minimum structural confidence threshold, defaulting to 0.6 `types.ts:170-170`
- **minSyncOverAsync** — Determines the minimum number of synchronous operations over asynchronous ones `types.ts:97-97`
- **minThrowEx** — Sets the minimum number of `throw` expressions `types.ts:103-103`
- **minTypeAssertions** — Minimum number of type assertions `types.ts:83-83`
- **minTypeIgnore** — Specifies the minimum number of type ignore statements `types.ts:112-112`
- **minUnreachable** — Sets the minimum number of unreachable code blocks `types.ts:94-94`
- **minUnsafeCasts** — Defines the minimum number of unsafe casts in the code `types.ts:93-93`
- **minWideTryBlock** — Defines the minimum number of wide try blocks `types.ts:111-111`
- **missingPyRepr** — Indicates if the pattern is missing __repr__ method `types.ts:129-129`
- **missingPySlots** — Indicates if the pattern is missing slots `types.ts:128-128`
- **missingPyStr** — Indicates if the pattern is missing __str__ method `types.ts:130-130`
- **modifiers** — An array of modifier strings for an entity `structural-detector.ts:82-82`
- **name** — Represents the name of an entity `structural-detector.ts:160-160`
- **name** — Represents the parameters of a method `structural-detector.ts:161-161`
- **name** — Represents an array of parameter objects, each containing a name and an optional type `structural-detector.ts:84-84`, `structural-detector.ts:167-167`
- **name** — Name of the pattern `types.ts:146-146`
- **nameMatch** — Regular expression pattern for entity names `types.ts:72-72`
- **nameMatchRe** — A regular expression for matching names `structural-detector.ts:46-46`
- **nameNotMatch** — Regular expression pattern for entity names to exclude `types.ts:73-73`
- **nameNotMatchRe** — A regular expression for not matching names `structural-detector.ts:47-47`
- **nestingDepth** — Determines the maximum depth of nested blocks in a function or method `structural-detector.ts:85-85`
- **nestingDepth** — Measures the maximum nesting depth of function calls `structural-detector.ts:137-137`
- **newDisposableNoUsingCount** — Counts `new Disposable()` without `using `structural-detector.ts:118-118`
- **newHttpClientCount** — Counts `new HttpClient()` usage `structural-detector.ts:117-117`
- **nonNullAssertionCount** — Counts the number of non-null assertions `structural-detector.ts:100-100`
- **nullForgivingCount** — Counts null forgiving casts `structural-detector.ts:114-114`
- **offset** — Offset value for pattern detection `types.ts:229-229`
- **openWithoutWithCount** — Counts the number of `open` calls without `with` statements `structural-detector.ts:132-132`
- **optimizationCount** — Counts the number of optimization opportunities detected `types.ts:213-213`
- **optimizations** — Contains optimization opportunities detected in the code `types.ts:207-207`
- **optionalPassed** — Number of optional criteria passed `structural-detector.ts:483-483`
- **optionalTotal** — Total number of optional criteria `structural-detector.ts:483-483`
- **orWithDefaultCount** — Counts the use of `||` with a default value `structural-detector.ts:103-103`
- **paramMutationCount** — Counts parameter mutations in function calls `structural-detector.ts:104-104`
- **params** — An array of parameter objects, each containing a name and an optional type `structural-detector.ts:84-84`
- **paramTypeAbsent** — Specifies an absent parameter type `types.ts:40-40`
- **paramTypeAbsentRe** — A regular expression for absent parameter types `structural-detector.ts:42-42`
- **paramTypeRequired** — Specifies a required parameter type `types.ts:39-39`
- **paramTypeRequiredRe** — A regular expression for required parameter types `structural-detector.ts:41-41`
- **passed** — Number of entities that passed the evaluation `structural-detector.ts:210-210`
- **passed** — Represents a boolean indicating whether a condition is met `structural-detector.ts:487-487`
- **passed** — Represents the number of passed criteria `structural-detector.ts:554-554`
- **passed** — Returns the total and passed counts of a structural detection `structural-detector.ts:557-557`
- **passed** — Returns a boolean indicating whether the criteria were met `structural-detector.ts:602-602`, `structural-detector.ts:922-922`
- **passed** — Parses a function that takes an object with total and passed properties and returns an object with updated total and passed values `structural-detector.ts:605-605`
- **passed** — Returns an object with total and passed properties `structural-detector.ts:633-633`
- **passed** — Parses a function that takes an object with total and passed properties and returns an object with updated total and passed values. `structural `structural-detector.ts:663-663`
- **passed** — Returns a boolean indicating if the criteria are met `structural-detector.ts:666-666`
- **passed** — Returns a function that takes an object with total and passed properties and returns a new object with the same properties `structural-detector.ts:708-708`
- **passed** — Represents a function that takes an object with total and passed properties and returns a new object with the same properties `structural-detector.ts:711-711`
- **passed** — Returns a function that takes an object with passed and matchedCriteria properties and returns a new object with the same properties `structural-detector.ts:818-818`
- **pattern** — Pattern definition for structural detection `structural-detector.ts:252-252`
- **pattern** — Represents the pattern itself `types.ts:187-187`
- **pattern** — Pattern being matched against an entity `types.ts:255-255`
- **patternId** — The ID of the pattern associated with an exemplar `exemplar-store.ts:22-22`
- **patternId** — Identifies the ID of a detected pattern `pattern-engine.ts:421-421`
- **patternId** — Represents an identifier for a pattern `types.ts:177-177`
- **patternId** — Represents a unique identifier for a pattern `types.ts:186-186`
- **patternId** — Stores an array of top issues, each with a pattern ID, count, and severity `types.ts:214-214`
- **patterns** — Stores all loaded pattern definitions `pattern-registry.ts:146-146`
- **projectPath** — Specifies the path to the project `types.ts:222-222`
- **properties** — Represents the properties of an entity `structural-detector.ts:145-145`
- **pythonCfExt** — Not applicable in this context `structural-detector.ts:135-141`
- **pythonHints** — Counts Python syntax hints `structural-detector.ts:123-134`
- **regexLiterals** — Counts the use of regex literals in the code `structural-detector.ts:105-105`
- **registry** — Stores pattern rules `pattern-engine.ts:60-60`
- **relationships** — Relationships between entities `types.ts:136-136`
- **requiredModifiers** — Lists required modifiers for the entity `types.ts:29-29`
- **reRaiseDifferentType** — Counts the number of `reRaise` calls with different types `structural-detector.ts:140-140`
- **returnCount** — Counts the number of `return` statements in the code `structural-detector.ts:136-136`
- **returnType** — The return type of an entity, which can be a string or undefined `structural-detector.ts:83-83`
- **returnTypeMatch** — Matches return types using regular expressions `types.ts:33-33`
- **returnTypeMatchRe** — A regular expression for matching return types `structural-detector.ts:39-39`
- **returnTypeNotMatch** — Excludes entities with return types that match the given regular expression `types.ts:34-34`
- **returnTypeNotMatchRe** — A regular expression for not matching return types `structural-detector.ts:40-40`
- **semanticSimilarity** — Represents the semantic similarity of a pattern match `types.ts:194-194`
- **semanticValidator** — Validates semantic patterns `pattern-engine.ts:63-63`
- **severity** — Determines the severity of a detected pattern `pattern-engine.ts:421-421`
- **severity** — Stores counts and severities for patterns `pattern-engine.ts:422-422`
- **severity** — Severity level of the pattern `types.ts:145-145`
- **severity** — Determines the severity of a detected issue `types.ts:214-214`
- **severity** — Severity level of a detected pattern `types.ts:228-228`
- **similarity** — Represents the similarity score between exemplars `exemplar-store.ts:146-146`
- **similarity** — Stores the similarity score of a result `exemplar-store.ts:150-150`
- **similarity** — Indicates the similarity score of the closest exemplar `semantic-validator.ts:97-97`
- **similarity** — Measures the similarity between code entities `types.ts:197-197`
- **spreadInCallCount** — Counts the number of spread operators in function calls `structural-detector.ts:94-94`
- **stringConcatInLoopCount** — Counts string concatenation in loops `structural-detector.ts:116-116`
- **stringConcatInLoopCount** — Counts the number of string concatenations inside loops `structural-detector.ts:131-131`
- **structural** — Represents structural criteria for pattern detection `types.ts:160-160`
- **structuralConfidence** — Represents the structural confidence of a pattern match `types.ts:193-193`
- **structuralDetector** — Detects structural patterns `pattern-engine.ts:62-62`
- **suggestion** — Suggestion for improving the pattern `types.ts:148-148`
- **summary** — Summarizes the findings of the pattern scan `types.ts:208-216`
- **suppressPatterns** — Patterns to suppress during detection `types.ts:234-234`
- **syncOverAsyncCount** — Counts synchronous code over asynchronous code `structural-detector.ts:113-113`
- **tags** — Represents the tags associated with the pattern `pattern-registry.ts:212-212`
- **tags** — Tags associated with the pattern `types.ts:156-156`
- **tags** — Tags the detected patterns `types.ts:226-226`
- **target** — Represents the target of a method call `structural-detector.ts:160-160`
- **throwExCount** — Counts `throw new Exception()` usage `structural-detector.ts:120-120`
- **throwNonErrorCount** — Counts the number of non-error throws `structural-detector.ts:101-101`
- **topIssues** — Lists the top issues found in the code `types.ts:214-214`
- **total** — Represents the total number of evaluations `structural-detector.ts:210-210`
- **totalCriteriaCount** — The total number of criteria in the compiled pattern `structural-detector.ts:50-50`
- **totalEntitiesScanned** — Counts the total number of entities scanned `types.ts:209-209`
- **type** — Represents the type of an entity `structural-detector.ts:84-84`
- **type** — Represents the parameters of a method `structural-detector.ts:167-167`
- **type** — Specifies the type of relationship, such as calls, imports, or extends `types.ts:16-16`
- **typeAssertionCount** — Counts the number of type assertions `structural-detector.ts:98-98`
- **typeIgnoreCount** — Counts type ignore statements `structural-detector.ts:128-128`
- **unreachableCount** — Counts unreachable code `structural-detector.ts:110-110`
- **unsafeCastCount** — Counts unsafe type casts `structural-detector.ts:109-109`
- **wideTryBlockCount** — Counts wide try blocks `structural-detector.ts:127-127`
- **zigOps** — Counts the use of Zig operations `structural-detector.ts:107-111`

## Dependencies

**Internal:**
- `semantic/embedding-generator` — Generates float32 embeddings for exemplars and candidates
- `utils/simd-vector-ops` — Cosine similarity computation for embedding comparison
- `logging` — Debug and info logging for detector and validator operations
- Metadata graph system (AST/dependency graph) — Provides node types, properties, and relationships for structural matching

**External:**
- `yaml` — Parses YAML pattern definitions and exemplar manifests
- `node:crypto`, `node:fs` — File I/O and hashing for embedding cache management

## Design Patterns

**Two-Stage Validation:** Structural matching filters candidates efficiently, then semantic validation with embeddings reduces false positives by comparing code similarity against curated exemplars.

**Lazy Embedding:** Exemplar embeddings are computed on-demand and cached to disk, avoiding upfront computation cost while maintaining fast lookup.

**Language-Indexed Registry:** Pattern definitions keyed by language enable fast filtering and allow language-specific rules to coexist in a single system.
