# Module: src/analysis/stacktrace

## 🤖 Overview

The `stacktrace` module provides a comprehensive analysis of stack traces, enabling users to diagnose errors by parsing, classifying, and resolving frames. It is used by developers and system administrators to understand and fix issues in their applications.

## 🤖 Architecture

```
  +---------------------+
  |  StacktraceParser   |
  |     /               |
  |    /                |
  |   /                 |
  |  /                  |
  | /                   |
  |+---------------------+
  | DiagnosisEngine     |
  |     /               |
  |    /                |
  |   /                 |
  |  /                  |
  | /                   |
  |+---------------------+
  | ErrorClassifier     |
  |     /               |
  |    /                |
  |   /                 |
  |  /                  |
  | /                   |
  |+---------------------+
  | FrameResolver       |
  |     /               |
  |    /                |
  |   /                 |
  |  /                  |
  | /                   |
  |+---------------------+
```

## 🤖 Flow

```
  +---------------------+
  |  Parse Stacktrace   |
  |     /               |
  |    /                |
  |   /                 |
  |  /                  |
  | /                   |
  |+---------------------+
  | Classify Error      |
  |     /               |
  |    /                |
  |   /                 |
  |  /                  |
  | /                   |
  |+---------------------+
  | Resolve Frames      |
  |     /               |
  |    /                |
  |   /                 |
  |  /                  |
  | /                   |
  |+---------------------+
  | Generate Diagnosis  |
  |     /               |
  |    /                |
  |   /                 |
  |  /                  |
  | /                   |
  |+---------------------+
```

## 🤖 Entity Listing

### Function
- **classifyError** — Classifies an error based on predefined rules `error-classifier.ts:220-256`
- **containing** — Contains a stacktrace frame within a code graph entity `frame-resolver.ts:203-203`
- **crashFrame** — First resolved frame or first frame used as the crash point `diagnosis-engine.ts:54-54`
- **createEmptyFrame** — Creates an empty frame object with default values `diagnosis-engine.ts:198-206`
- **dependentFiles** — Creates a set of file paths from a list of dependent files `diagnosis-engine.ts:116-116`
- **dependentFiles** — Parses a list of file paths from a set of dependent entities `diagnosis-engine.ts:116-116`
- **diagnose** — Function to diagnose a stacktrace, resolving frames and generating a diagnosis `diagnosis-engine.ts:39-192`
- **fileMatch** — Matches a stacktrace frame against code graph entities by file path `frame-resolver.ts:243-243`
- **firstUserFrame** — Finds the first user frame in a list of resolved frames `diagnosis-engine.ts:227-227`
- **formatDiagnosis** — Formats the diagnosis output including severity, error details, call chain, and suggested fixes `diagnosis-engine.ts:283-386`
- **generateFixes** — Generates suggested fixes based on error classification and resolved frames `diagnosis-engine.ts:208-246`
- **generateMermaidDiagram** — Generates a Mermaid diagram representing the call chain of resolved frames `diagnosis-engine.ts:248-281`
- **getSupportedLanguages** — Not present in the provided code snippet `stacktrace-parser.ts:104-106`
- **isSystemFrame** — Function to determine if a frame is a system frame `frame-resolver.ts:55-59`
- **match** — Matches a stacktrace frame against code graph entities `frame-resolver.ts:170-170`
- **msgMatch** — Checks if the error message matches any of the message patterns `error-classifier.ts:228-228`
- **parser** — Represents a stacktrace parser for a specific language, implementing detect() to return confidence `stacktrace-parser.ts:69-69`
- **parseStacktrace** — Parses a stacktrace string, auto-detecting language and delegating to the appropriate parser `stacktrace-parser.ts:65-99`
- **resolveByName** — Resolves a stacktrace frame by name against code graph entities `frame-resolver.ts:233-268`
- **resolvedCount** — Counts the number of resolved frames in a list of resolved frames `diagnosis-engine.ts:173-173`
- **resolvedCount** — Parses frames to count resolved ones `diagnosis-engine.ts:293-293`
- **resolveFrameAgainstEntities** — Resolves a stacktrace frame against code graph entities `frame-resolver.ts:157-231`
- **resolveFrames** — Function to resolve all frames in a stacktrace against the code graph `frame-resolver.ts:65-155`
- **sanitize** — Sanitizes a string by removing certain characters and truncating it `diagnosis-engine.ts:388-394`
- **typeMatch** — Checks if the error type matches any of the type patterns `error-classifier.ts:226-226`
- **withLocation** — Resolves a stacktrace frame against code graph entities with location information `frame-resolver.ts:201-201`

### Interface
- **ClassificationRule** — Represents a rule for classifying errors based on type and message patterns `error-classifier.ts:11-20`
- **DiagnosisOptions** — Options for diagnosis including backwards trace, impact analysis, depth, and project path `diagnosis-engine.ts:28-33`
- **DiagnosisTraceEngine** — Subset of TraceEngine used by diagnosis — accepts any object with traceBackwards `diagnosis-engine.ts:24-26`
- **ErrorClassification** — An interface for classifying errors with category, severity, and description `types.ts:65-70`
- **FrameResolverStorage** — Minimal interface for graph storage operations needed by the resolver `frame-resolver.ts:18-37`
- **LanguageStacktraceParser** — A single frame in a stacktrace `types.ts:142-146`
- **ParsedStacktrace** — Result of parsing a raw stacktrace string, containing parsed frames and error details `types.ts:33-41`
- **ResolvedFrame** — A StackFrame enriched with graph entity bindings `types.ts:79-85`
- **StackFrame** — A single frame in a stacktrace, with properties like index, functionName, and raw `types.ts:16-27`
- **StacktraceDiagnosis** — A diagnosis of a stacktrace `types.ts:97-132`
- **SuggestedFix** — A suggested fix for an error `types.ts:91-95`

### Type_alias
- **ErrorCategory** — An enum representing categories of errors `types.ts:47-61`
- **Severity** — An enum representing the severity of errors `types.ts:63-63`

### Import_decl
- **./error-classifier.js** — Imports `./error-classifier.js` from `./error-classifier.js`. `diagnosis-engine.ts:14-14`
- **./frame-resolver.js** — Imports `./frame-resolver.js` from `./frame-resolver.js`. `diagnosis-engine.ts:15-15`, `diagnosis-engine.ts:16-16`
- **./parsers/dotnet-parser.js** — Imports `./parsers/dotnet-parser.js` from `./parsers/dotnet-parser.js`. `stacktrace-parser.ts:9-9`
- **./parsers/go-parser.js** — Imports `./parsers/go-parser.js` from `./parsers/go-parser.js`. `stacktrace-parser.ts:10-10`
- **./parsers/javascript-parser.js** — Imports `./parsers/javascript-parser.js` from `./parsers/javascript-parser.js`. `stacktrace-parser.ts:11-11`
- **./parsers/jvm-parser.js** — Imports `./parsers/jvm-parser.js` from `./parsers/jvm-parser.js`. `stacktrace-parser.ts:12-12`
- **./parsers/native-parser.js** — Imports `./parsers/native-parser.js` from `./parsers/native-parser.js`. `stacktrace-parser.ts:13-13`
- **./parsers/python-parser.js** — Imports `./parsers/python-parser.js` from `./parsers/python-parser.js`. `stacktrace-parser.ts:14-14`
- **./parsers/rust-parser.js** — Imports `./parsers/rust-parser.js` from `./parsers/rust-parser.js`. `stacktrace-parser.ts:15-15`
- **./parsers/zig-parser.js** — Imports `./parsers/zig-parser.js` from `./parsers/zig-parser.js`. `stacktrace-parser.ts:16-16`
- **./types.js** — Imports `./types.js` from `./types.js`. `diagnosis-engine.ts:17-17`, `error-classifier.ts:9-9`, `frame-resolver.ts:15-15`, `stacktrace-parser.ts:17-17`

### Property
- **affectedEntities** — A single frame in a stacktrace `types.ts:119-119`
- **backwardsTrace** — A backwards trace of the stacktrace `types.ts:110-116`
- **blockingConditions** — A single frame in a stacktrace `types.ts:113-113`
- **callChain** — The call chain leading to the error `types.ts:107-107`
- **callers** — The callers of a frame `types.ts:112-112`
- **category** — Specifies the category of the error `error-classifier.ts:12-12`
- **category** — The category of the error `types.ts:66-66`
- **causedBy** — The inner cause of the error, if applicable `types.ts:40-40`
- **className** — The class name of the function in the stack frame `types.ts:19-19`
- **code** — Not explicitly defined in the provided code `frame-resolver.ts:25-25`
- **codeContext** — The context of the code `types.ts:105-105`
- **columnNumber** — The column number of the function in the stack frame `types.ts:23-23`
- **condition** — A single frame in a stacktrace `types.ts:113-113`
- **confidence** — The confidence level of a resolution `types.ts:84-84`
- **crashLocation** — The location where the crash occurred `types.ts:103-106`
- **dependentFiles** — A single frame in a stacktrace `types.ts:121-121`
- **depth** — Number indicating the depth of frames to resolve `diagnosis-engine.ts:31-31`
- **description** — Provides a brief description of the error category `error-classifier.ts:14-14`
- **description** — A description of the error `types.ts:68-68`
- **description** — A description of an error `types.ts:93-93`
- **diagnosis** — A single frame in a stacktrace `types.ts:114-114`
- **end** — End position of the entity in the file `frame-resolver.ts:97-97`
- **end** — Not explicitly defined in the provided code `frame-resolver.ts:26-26`, `frame-resolver.ts:164-164`
- **entityId** — An identifier for an entity `types.ts:80-80`
- **entityName** — The name of an entity `types.ts:81-81`
- **entityType** — The type of an entity `types.ts:82-82`
- **errorCategory** — The category of an error `types.ts:99-99`
- **errorHandlers** — A single frame in a stacktrace `types.ts:125-125`
- **errorMessage** — The error message in the stacktrace `types.ts:36-36`
- **errorMessage** — The message of an error `types.ts:101-101`
- **errorType** — The type of error in the stacktrace `types.ts:35-35`
- **errorType** — The type of an error `types.ts:100-100`
- **file** — A single frame in a stacktrace `types.ts:112-112`
- **filePath** — Path to the file containing the code entity `frame-resolver.ts:24-24`, `frame-resolver.ts:96-96`
- **filePath** — Paths that indicate framework/runtime code — skip resolution `frame-resolver.ts:19-19`, `frame-resolver.ts:163-163`
- **filePath** — Stores the file path associated with the frame `frame-resolver.ts:34-34`
- **filePath** — The file path of the function in the stack frame `types.ts:21-21`
- **filters** — Not explicitly defined in the provided code `frame-resolver.ts:19-19`
- **formatted** — A single frame in a stacktrace `types.ts:131-131`
- **frame** — A frame in a stacktrace `types.ts:104-104`
- **frames** — An array of StackFrame objects representing the stack trace frames `types.ts:37-37`
- **functionName** — The name of the function in the stack frame `types.ts:18-18`
- **guards** — A single frame in a stacktrace `types.ts:126-126`
- **id** — Unique identifier for the code entity `frame-resolver.ts:31-31`, `frame-resolver.ts:160-160`
- **id** — Not explicitly defined in the provided code `frame-resolver.ts:21-21`
- **id** — Assigns a unique identifier to the frame `frame-resolver.ts:93-93`
- **impactAnalysis** — A single frame in a stacktrace `types.ts:117-123`
- **includeBackwardsTrace** — Boolean indicating whether to include backwards trace in diagnosis `diagnosis-engine.ts:29-29`
- **includeImpactAnalysis** — Boolean indicating whether to include impact analysis in diagnosis `diagnosis-engine.ts:30-30`
- **index** — The index of the stack frame, with index=0 being the crash point `types.ts:17-17`
- **isAsync** — Indicates if the function is asynchronous `types.ts:25-25`
- **isNative** — Indicates if the function is native `types.ts:24-24`
- **language** — The programming language of the stacktrace `types.ts:34-34`
- **language** — A single frame in a stacktrace `types.ts:98-98`
- **language** — Represents the programming language used in the code `types.ts:143-143`
- **limit** — Not explicitly defined in the provided code `frame-resolver.ts:19-19`
- **line** — Line number where the entity starts `frame-resolver.ts:26-26`, `frame-resolver.ts:97-97`
- **line** — Not explicitly defined in the provided code `frame-resolver.ts:26-26`, `frame-resolver.ts:97-97`
- **line** — Represents the line number for the start and end locations `frame-resolver.ts:164-164`
- **line** — Represents the start and end line numbers of a location `frame-resolver.ts:164-164`
- **line** — A single frame in a stacktrace `types.ts:112-112`
- **lineNumber** — The line number of the function in the stack frame `types.ts:22-22`
- **location** — Location within the file where the entity is defined `frame-resolver.ts:97-97`
- **location** — Not explicitly defined in the provided code `frame-resolver.ts:26-26`, `frame-resolver.ts:164-164`
- **location** — The location of an error `types.ts:92-92`
- **location** — A single frame in a stacktrace `types.ts:113-113`
- **mermaidDiagram** — A single frame in a stacktrace `types.ts:130-130`
- **messagePatterns** — An array of regular expressions to match error messages `error-classifier.ts:18-18`
- **missingCheckHints** — An array of hints for missing checks that could prevent the error `error-classifier.ts:19-19`
- **missingCheckHints** — An array of hints for missing checks `types.ts:69-69`
- **missingChecks** — A single frame in a stacktrace `types.ts:127-127`
- **moduleName** — The module name of the function in the stack frame `types.ts:20-20`
- **name** — Name of the code entity `frame-resolver.ts:32-32`, `frame-resolver.ts:161-161`
- **name** — Not explicitly defined in the provided code `frame-resolver.ts:22-22`
- **name** — Specifies the name of the frame `frame-resolver.ts:94-94`
- **name** — A single frame in a stacktrace `types.ts:112-112`
- **namePattern** — Not explicitly defined in the provided code `frame-resolver.ts:29-29`
- **priority** — The priority of an error `types.ts:94-94`
- **projectPath** — String indicating the project path for diagnosis `diagnosis-engine.ts:32-32`
- **raw** — The raw string representation of the stack frame `types.ts:26-26`
- **rawText** — The raw text of the stacktrace `types.ts:38-38`
- **relatedPatterns** — A single frame in a stacktrace `types.ts:124-128`
- **resolved** — Indicates whether a frame is resolved `types.ts:83-83`
- **resolvedFrameCount** — The number of resolved frames `types.ts:108-108`
- **riskScore** — A single frame in a stacktrace `types.ts:120-120`
- **severity** — Indicates the severity level of the error `error-classifier.ts:13-13`
- **severity** — The severity of the error `types.ts:67-67`
- **severity** — The severity of an error `types.ts:102-102`
- **start** — Start position of the entity in the file `frame-resolver.ts:97-97`
- **start** — Not explicitly defined in the provided code `frame-resolver.ts:26-26`, `frame-resolver.ts:164-164`
- **suggestedFixes** — A single frame in a stacktrace `types.ts:129-129`
- **threadInfo** — Thread information associated with the stacktrace `types.ts:39-39`
- **totalFrameCount** — The total number of frames `types.ts:109-109`
- **type** — Type of the code entity `frame-resolver.ts:33-33`, `frame-resolver.ts:162-162`
- **type** — Not explicitly defined in the provided code `frame-resolver.ts:23-23`
- **type** — Defines the type of the frame `frame-resolver.ts:95-95`
- **typePatterns** — An array of regular expressions to match error types `error-classifier.ts:16-16`
