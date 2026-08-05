# Module: src/parsers/jvm

## 🤖 Overview

This module provides shared AST helper utilities for JVM parsers, enabling consistent location extraction and parsing logic across Java and Kotlin. It is used by both Java and Kotlin ANTLR parsers to maintain uniformity in their AST handling.

## 🤖 Architecture

```
  +---------------------+
  | shared-ast-helpers.ts |
  +---------------------+
    |
    v
  +---------------------+
  | shared-complexity.ts |
  +---------------------+
    |
    v
  +---------------------+
  | shared-doc-parser.ts |
  +---------------------+
    |
    v
  +---------------------+
  | shared-types.ts     |
  +---------------------+
```

## 🤖 Flow

```
  +---------------------+
  | shared-ast-helpers.ts |
  +---------------------+
    |
    v
  +---------------------+
  | shared-complexity.ts |
  +---------------------+
    |
    v
  +---------------------+
  | shared-doc-parser.ts |
  +---------------------+
    |
    v
  +---------------------+
  | shared-types.ts     |
  +---------------------+
```

## 🤖 Entity Listing

### Function
- **calculateClassComplexity** — Computes complexity metrics for a class based on its methods `shared-complexity.ts:144-187`
- **calculateCommentDensity** — Calculates the density of comments in the code `shared-complexity.ts:53-90`
- **calculateLinesOfCode** — Parses the code to count lines of code, excluding comments and empty lines `shared-complexity.ts:16-47`
- **calculateNestingDepth** — Calculates the maximum nesting depth of a parser context `shared-complexity.ts:96-113`
- **calculatePhysicalLines** — Returns the number of physical lines in the code `shared-complexity.ts:49-51`
- **cleanDescriptionBase** — Cleans the base description of the doc comment `shared-doc-parser.ts:159-174`
- **content** — Extracts the content of the doc comment after removing the comment markers `shared-doc-parser.ts:57-57`
- **exceedsThresholds** — Checks if the complexity exceeds predefined thresholds `shared-complexity.ts:232-239`
- **extractDocFromSourceBase** — Extracts the documentation from the source code and returns a DocInfo object based on the comment text `shared-doc-parser.ts:180-232`
- **extractGenericArguments** — Extracts generic arguments from a type string `shared-ast-helpers.ts:136-160`
- **findAllDescendants** — Finds all descendants of a parser context that match a predicate `shared-ast-helpers.ts:74-94`
- **findAncestor** — Finds the nearest ancestor of a node that satisfies a predicate `shared-ast-helpers.ts:96-108`
- **findDocComment** — Finds the doc comment in the token stream starting from the given index `shared-doc-parser.ts:15-36`
- **formatComplexityMetrics** — Formats complexity metrics into a readable string `shared-complexity.ts:193-201`
- **getBaseRefactoringSuggestions** — Provides base refactoring suggestions based on complexity `shared-complexity.ts:241-261`
- **getComplexityRating** — Determines the complexity rating based on thresholds `shared-complexity.ts:214-230`
- **getIdentifierText** — Extracts the text of an identifier from a context object `shared-ast-helpers.ts:122-126`
- **getLocation** — Extracts the start and end locations from an ANTLR context `shared-ast-helpers.ts:16-33`
- **getTerminalLocation** — Extracts the start and end locations from a terminal node `shared-ast-helpers.ts:35-52`
- **getText** — Returns the text of a node or an empty string if the node is null or undefined `shared-ast-helpers.ts:114-116`
- **getTextTrimmed** — Returns the trimmed text of a node or an empty string if the node is null or undefined `shared-ast-helpers.ts:118-120`
- **isSuperCall** — Checks if a target string is a super call `shared-ast-helpers.ts:166-168`
- **isThisCall** — Checks if a target string is a this call `shared-ast-helpers.ts:170-172`
- **maxCyclomatic** — Finds the maximum cyclomatic complexity among all methods in a class `shared-complexity.ts:174-174`
- **parseDocComment** — Parses the doc comment text, dispatching tags to a language-specific handler `shared-doc-parser.ts:47-95`
- **parseParamTag** — Parses a parameter tag from the comment text and adds it to the result's parameters `shared-doc-parser.ts:101-116`
- **parseReturnTag** — Parses a return tag from the comment text and sets the result's return description `shared-doc-parser.ts:118-124`
- **parseSeeTag** — Parses a see tag from the comment text and adds the reference to the result's see list `shared-doc-parser.ts:144-153`
- **parseThrowsTag** — Parses a throws tag from the comment text and adds it to the result's throws list `shared-doc-parser.ts:126-142`
- **publicMethodCount** — Counts the number of public methods in a class `shared-complexity.ts:175-175`
- **totalCognitive** — Sums the cognitive complexity of all methods in a class `shared-complexity.ts:173-173`
- **totalCyclomatic** — Sums the cyclomatic complexity of all methods in a class `shared-complexity.ts:172-172`
- **visit** — Recursively visits nodes in the AST, collecting those that match a predicate `shared-ast-helpers.ts:80-90`
- **visitChildren** — Visits all children of a parser context and collects their results `shared-ast-helpers.ts:58-72`
- **visitForNesting** — Traverses a parser context to track nesting depth for specified structures `shared-complexity.ts:115-138`

### Interface
- **AnnotationInfo** — Contains information about annotations, including their name and arguments `shared-types.ts:76-80`
- **AntlrContext** — Represents the context of an ANTLR parser `shared-types.ts:224-230`
- **AntlrContextWithChildren** — Represents the context of an ANTLR parser with children `shared-types.ts:232-236`
- **AntlrToken** — ANTLR token type `shared-types.ts:216-222`
- **BranchInfo** — Contains information about branches in the control flow, including their type and condition `shared-types.ts:107-123`
- **CallInfo** — Represents information about a function/method call, including name, target, location, and other optional fields `shared-types.ts:43-70`
- **ComplexityMetrics** — Complexity metrics for code analysis `shared-types.ts:202-210`
- **ComplexityThresholds** — Defines thresholds for cyclomatic, cognitive, lines of code, and nesting depth complexities `shared-complexity.ts:207-212`
- **ControlFlowInfo** — Stores information about control flow, including branches, loops, exceptions, returns, and awaits `shared-types.ts:143-153`
- **DocInfo** — Contains information about a documentation comment, including its description, parameters, and returns `shared-types.ts:165-196`
- **DocParam** — Represents a parameter in a documentation comment `shared-types.ts:159-163`
- **ExceptionInfo** — Represents information about an exception, including its type, location, and other relevant details `shared-types.ts:130-134`
- **InheritanceInfo** — Contains information about inheritance, including base classes and interfaces `shared-types.ts:86-89`
- **LoopInfo** — Contains information about loops in the control flow, including their type and location `shared-types.ts:125-128`
- **ParameterInfo** — Contains information about parameters, including their name, type, and other attributes `shared-types.ts:95-101`
- **ParserContext** — Represents the context of parsing, including file path, package name, entities, relationships, current class, and imports `shared-types.ts:21-28`
- **ReturnInfo** — Contains information about a return statement, including its location and whether it has a value `shared-types.ts:136-141`

### Type_alias
- **LocationInfo** — Represents the start and end locations of a parsed entity `shared-types.ts:34-37`

### Import_decl
- **../../types/parser.js** — Imports `../../types/parser.js` from `../../types/parser.js`. `shared-types.ts:15-15`
- **./shared-types.js** — Imports `./shared-types.js` from `./shared-types.js`. `shared-ast-helpers.ts:10-10`, `shared-complexity.ts:10-10`, `shared-doc-parser.ts:9-9`
- **antlr4ng** — Imports `antlr4ng` from `antlr4ng`. `shared-ast-helpers.ts:9-9`, `shared-complexity.ts:9-9`, `shared-doc-parser.ts:8-8`

### Property
- **_start** — Represents the start of a file `shared-types.ts:227-227`
- **_stop** — Represents the stop of a file `shared-types.ts:228-228`
- **argumentCount** — Represents the number of arguments `shared-types.ts:53-53`
- **arguments** — Represents the arguments of the call `shared-types.ts:78-78`
- **author** — Not applicable in this context `shared-types.ts:182-182`
- **averageCognitive** — Computes the average cognitive complexity of methods in a class `shared-complexity.ts:154-154`
- **averageCyclomatic** — Computes the average cyclomatic complexity of methods in a class `shared-complexity.ts:151-151`
- **awaits** — Represents the await statements in a control flow `shared-types.ts:149-152`
- **baseClasses** — Represents the base classes of the inheritance `shared-types.ts:87-87`
- **branches** — Represents the branches in a control flow `shared-types.ts:144-144`
- **catchType** — Indicates the type of exception caught in a catch block `shared-types.ts:132-132`
- **children** — Represents the children of an ANTLR context `shared-types.ts:233-233`
- **cognitive** — Represents cognitive complexity `shared-complexity.ts:209-209`
- **cognitive** — Cognitive complexity metric `shared-types.ts:204-204`
- **column** — Represents the column number of the start location `shared-types.ts:35-35`, `shared-types.ts:36-36`
- **column** — Represents a column in a file `shared-types.ts:218-218`
- **complexity** — Represents the complexity metrics of a method `shared-complexity.ts:146-146`
- **condition** — Represents the condition of the branch `shared-types.ts:121-121`
- **currentClass** — Represents the current class being parsed `shared-types.ts:26-26`
- **cyclomatic** — Stores cyclomatic complexity thresholds for low, medium, and high levels `shared-complexity.ts:208-208`
- **cyclomatic** — Cyclomatic complexity metric `shared-types.ts:203-203`
- **defaultValue** — Represents the default value of the parameter `shared-types.ts:99-99`
- **deprecated** — Not applicable in this context `shared-types.ts:183-183`
- **description** — Provides a description of a parameter or entity `shared-types.ts:162-162`, `shared-types.ts:166-166`
- **description** — JVM Shared Parser Types — Unified type definitions shared between Java and Kotlin ANTLR parsers `shared-types.ts:171-171`, `shared-types.ts:177-177`, `shared-types.ts:190-190`
- **end** — Represents the end location of a parsed entity `shared-types.ts:36-36`
- **entities** — Contains an array of parsed entities `shared-types.ts:24-24`
- **exceptions** — Represents the exceptions in a control flow `shared-types.ts:146-146`
- **expression** — Represents an expression in the code `shared-types.ts:151-151`
- **filePath** — Stores the file path of the parsed code `shared-types.ts:22-22`
- **getChild** — Returns a child of an ANTLR context `shared-types.ts:235-235`
- **getChildCount** — Returns the number of children in an ANTLR context `shared-types.ts:234-234`
- **getText** — Not fully described in the provided excerpt `shared-ast-helpers.ts:124-124`
- **getText** — Returns the text content `shared-types.ts:229-229`
- **hasValue** — Represents whether a value is present `shared-types.ts:138-138`
- **high** — Represents a high complexity rating `shared-complexity.ts:208-208`, `shared-complexity.ts:209-209`, `shared-complexity.ts:210-210`, `shared-complexity.ts:211-211`
- **imports** — Maps import statements to their corresponding paths `shared-types.ts:27-27`
- **index** — Represents the index of the start location `shared-types.ts:35-35`, `shared-types.ts:36-36`
- **interfaces** — Represents the interfaces of the inheritance `shared-types.ts:88-88`
- **isAwait** — Indicates whether the call is an await/suspend call in Kotlin `shared-types.ts:63-63`
- **isBuiltin** — Indicates whether the annotation is a built-in annotation `shared-types.ts:79-79`
- **isExtensionCall** — Indicates whether the call is an extension function call in Kotlin `shared-types.ts:67-67`
- **isNew** — Indicates whether this is a constructor call `shared-types.ts:51-51`
- **isPublic** — Indicates whether a method is public `shared-complexity.ts:147-147`
- **isSafeCall** — Indicates whether the call is a safe call in Kotlin `shared-types.ts:65-65`
- **isStatic** — Indicates whether this is a static call (Java-specific) `shared-types.ts:58-58`
- **isSuper** — Indicates whether the call is a super call in Java `shared-types.ts:60-60`
- **isVararg** — Indicates whether the parameter is a vararg `shared-types.ts:100-100`
- **label** — Represents a label in the code, such as a loop or switch label `shared-types.ts:140-140`
- **line** — Represents the line number of the start location `shared-types.ts:35-35`, `shared-types.ts:36-36`
- **line** — Line number in code `shared-types.ts:217-217`
- **linesOfCode** — Calculates the number of lines of code in a given string `shared-complexity.ts:210-210`
- **linesOfCode** — Lines of code metric `shared-types.ts:205-205`
- **linesOfLogic** — Lines of logic metric `shared-types.ts:206-206`
- **location** — Represents the location of the call `shared-types.ts:49-49`
- **location** — Represents the location of the branch `shared-types.ts:122-122`, `shared-types.ts:127-127`
- **location** — Provides the location information for a code entity `shared-types.ts:133-133`, `shared-types.ts:137-137`, `shared-types.ts:150-150`
- **loops** — Represents the loops in a control flow `shared-types.ts:145-145`
- **low** — Represents a low complexity rating `shared-complexity.ts:208-208`, `shared-complexity.ts:209-209`, `shared-complexity.ts:210-210`, `shared-complexity.ts:211-211`
- **maxCyclomatic** — Stores the maximum cyclomatic complexity value for a class `shared-complexity.ts:152-152`
- **medium** — Represents a medium complexity rating `shared-complexity.ts:208-208`, `shared-complexity.ts:209-209`, `shared-complexity.ts:210-210`, `shared-complexity.ts:211-211`
- **methodCount** — Represents the count of methods in a class `shared-complexity.ts:155-155`
- **name** — Represents the name of the called function/method `shared-types.ts:45-45`
- **name** — Represents the name of the called function or method `shared-types.ts:77-77`, `shared-types.ts:96-96`
- **name** — Specifies the name of a parameter or entity `shared-types.ts:160-160`
- **name** — Not applicable in this context `shared-types.ts:189-189`
- **nestingDepth** — Represents the nesting depth of code `shared-complexity.ts:211-211`
- **nestingDepth** — Nesting depth metric `shared-types.ts:207-207`
- **optional** — Indicates whether the parameter is optional `shared-types.ts:98-98`
- **packageName** — Stores the package name of the parsed code `shared-types.ts:23-23`
- **parameterCount** — Parameter count metric `shared-types.ts:208-208`
- **params** — Represents the parameters of a documentation comment `shared-types.ts:167-167`
- **property** — Not applicable in this context `shared-types.ts:187-192`
- **publicMethodCount** — Counts the number of public methods in a class `shared-complexity.ts:156-156`
- **receiver** — Not applicable in this context `shared-types.ts:193-193`
- **receiverType** — Represents the receiver type for extension functions in Kotlin `shared-types.ts:69-69`
- **relationships** — Stores relationships between parsed entities `shared-types.ts:25-25`
- **returnCount** — Return count metric `shared-types.ts:209-209`
- **returns** — Represents the return statements in a control flow `shared-types.ts:147-147`, `shared-types.ts:168-173`
- **sample** — Not applicable in this context `shared-types.ts:194-194`
- **see** — Not applicable in this context `shared-types.ts:180-180`
- **since** — Not applicable in this context `shared-types.ts:181-181`
- **start** — Represents the start location of a parsed entity `shared-types.ts:35-35`
- **start** — Represents the start of a file `shared-types.ts:219-219`, `shared-types.ts:225-225`
- **stop** — Represents the stop of a file `shared-types.ts:220-220`, `shared-types.ts:226-226`
- **suppress** — Not applicable in this context `shared-types.ts:195-195`
- **target** — Represents the target object for method calls `shared-types.ts:47-47`
- **text** — Represents text content `shared-types.ts:221-221`
- **throws** — Not applicable in this context `shared-types.ts:174-179`
- **totalCognitive** — Represents the total cognitive complexity of a class `shared-complexity.ts:153-153`
- **totalCyclomatic** — Represents the total cyclomatic complexity of a class `shared-complexity.ts:150-150`
- **type** — Represents the type of the parameter `shared-types.ts:97-97`, `shared-types.ts:108-120`, `shared-types.ts:126-126`
- **type** — Specifies the type of an entity or value `shared-types.ts:131-131`, `shared-types.ts:161-161`, `shared-types.ts:170-170`
- **type** — Not applicable in this context `shared-types.ts:176-176`
- **typeArguments** — Represents type arguments for generic calls `shared-types.ts:55-55`
- **version** — Not applicable in this context `shared-types.ts:185-185`
- **weightedMethodsPerClass** — Calculates the weighted methods per class based on complexity `shared-complexity.ts:157-157`
