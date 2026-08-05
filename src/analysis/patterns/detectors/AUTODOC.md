# Detectors

## 🤖 Overview

The `detectors` module contains custom detectors for various programming languages, including C#, Go, Java, Python, TypeScript, and Zig. These detectors identify specific code patterns and metrics, such as cyclomatic complexity and nesting depth, to help developers understand and optimize their code. Developers and static analysis tools use this module to detect potential issues in code quality and maintainability.

## 🤖 Architecture

```
  +-------------------+
  |   Common Detectors |
  |     (universal)    |
  |     (18 entities)  |
  |     (18 entities)  |
  |     (18 entities)  |
  |     (1:
```

## 🤖 Flow

```
  +-------------------+
  |   Language-Specific |
  |     Detectors       |
  |     (C#, Go, Java, |
  |     Python, TypeScript, Zig) |
  |     (172 entities) |
  |     (18 entities) |
  |     (49 entities) |
  |     (91 entities) |
  |     (169 entities) |
  |     (58 entities) |
  |     (172 entities) |
  |     (18 entities) |
  |     (49 entities) |
  |     (91 entities) |
  |     (169 entities) |
  |     (58 entities) |
  |     (172 entities) |
  |     (18 entities) |
  |     (49 entities) |
  |     (91 entities) |
  |     (169 entities) |
  |     (58 entities) |
  |     (172 entities) |
  |     (18 entities) |
  |     (49 entities) |
  |     (91 entities) |
  |     (169 entities) |
  |     (58 entities) |
  |     (172 entities) |
  |     (18 entities) |
  |     (49 entities) |
  |     (91 entities) |
  |     (169 entities) |
  |     (58 entities) |
  |     (172 entities) |
  |     (18 entities) |
  |     (49 entities) |
  |     (91 entities) |
  |     (169 entities) |
  |     (58 entities) |
  |     (172 entities) |
  |     (18 entities) |
  |     (49 entities) |
  |     (91 entities) |
  |     (169 entities) |
  |     (58 entities) |
  |     (172 entities) |
  |     (18 entities) |
  |     (49 entities) |
  |     (91 entities) |
  |     (169 entities) |
  |     (58 entities) |
  |     (172 entities) |
  |     (18 entities) |
  |     (49 entities) |
  |     (91 entities) |
  |     (169 entities) |
  |     (58 entities) |
  |     (172 entities) |
  |     (18 entities) |
  |     (49 entities) |
  |     (91 entities) |
  |     (169 entities) |
  |     (58 entities) |
  |     (172 entities) |
  |     (18 entities) |
  |     (49 entities) |
  |     (91 entities) |
  |     (169 entities) |
  |     (58 entities) |
  |     (172 entities) |
  |     (18 entities) |
  |     (49 entities) |
  |     (91 entities) |
  |     (169 entities) |
  |     (58 entities) |
  |     (172 entities) |
  |     (18 entities) |
  |     (49 entities) |
  |     (91 entities) |
  |     (169 entities) |
  |     (58 entities) |
  |     (172 entities) |
  |     (18 entities) |
  |     (49 entities) |
  |     (91 entities) |
  |     (169 entities) |
  |     (58 entities) |
  |     (172 entities) |
  |     (18 entities) |
  |     (49 entities) |
  |     (91 entities) |
  |     (169 entities) |
  |     (58 entities) |
  |     (172 entities) |
  |     (18 entities) |
  |     (49 entities) |
  |     (91 entities) |
  |     (169 entities) |
  |     (58 entities) |
  |     (172 entities) |
  |     (18 entities) |
  |     (49 entities) |
  |     (91 entities) |
  |     (169 entities) |
  |     (58 entities) |
  |     (172 entities) |
  |     (18 entities) |
  |     (49 entities) |
  |     (91 entities) |
  |     (169 entities) |
  |     (58 entities) |
  |     (172 entities) |
  |     (18 entities) |
  |     (49 entities) |
  |     (91 entities) |
  |
```

## 🤖 Entity Listing

### Function
- **addCalls** — Adds calls to a list of entities `csharp.ts:303-303`
- **addCalls** — Not applicable in this context `java.ts:131-132`
- **addCount** — Not applicable in this context `java.ts:289-289`
- **addTargets** — Adds targets to a list of entities `csharp.ts:308-308`
- **addTargets** — Not applicable in this context `java.ts:137-137`
- **allAttrs** — Combines decorator names and attribute names into a single array `csharp.ts:193-193`
- **allAttrs** — Creates an array of attribute names from decorators and attributes. `csharp `csharp.ts:235-235`
- **allAttrs** — Not described in the provided excerpt `csharp.ts:921-921`
- **allocCalls** — Filters calls to find alloc-related calls `zig.ts:18-18`, `zig.ts:47-47`
- **allRethrow** — Returns `csharp.ts:638-638`
- **anyParams** — Not applicable in this context `typescript.ts:91-91`
- **awaitsInLoop** — Validates await usage in loops `typescript.ts:709-712`, `typescript.ts:711-711`
- **bareCatchCount** — Counts bare catch blocks in exception handling `zig.ts:77-77`
- **boolParams** — Not described in the provided excerpt `csharp.ts:891-891`, `python.ts:445-448`
- **boolParams** — Counts boolean parameters `typescript.ts:239-239`
- **callNames** — Not applicable in this context `java.ts:282-282`
- **callNames** — Gets the names of the calls `typescript.ts:297-297`
- **callNames** — Extracts call names from entity metadata `typescript.ts:332-332`
- **callNames** — Stores names of called functions `typescript.ts:683-683`
- **callNames** — Represents the names of calls within an entity `typescript.ts:984-984`
- **checkAccumulatingSpread** — Detects patterns indicating the use of reduce with spread in entity calls `typescript.ts:379-394`
- **checkAllocWithoutFree** — Not present in the provided code `zig.ts:239-254`
- **checkAnyTypeParam** — Not applicable in this context `typescript.ts:89-100`
- **checkAsyncConstructor** — Checks for async constructor usage `typescript.ts:271-287`
- **checkAsyncFireAndForget** — Checks for async void methods that do not handle exceptions `csharp.ts:357-384`
- **checkAsyncioRunInLoop** — Checks if an entity uses `asyncio.run` within an async context `python.ts:548-559`
- **checkAsyncLockWithAwait** — Parses code for lock or Monitor.Enter usage alongside awaits `csharp.ts:521-535`
- **checkAsyncVoid** — Async void function — exceptions will crash the process `typescript.ts:11-25`
- **checkAwaitInLoop** — Validates await usage in loops `typescript.ts:698-722`
- **checkBareExcept** — Checks for bare except in Python code `python.ts:11-21`
- **checkBooleanBlindness** — Not described in the provided excerpt `csharp.ts:888-899`
- **checkBooleanTrap** — Checks for boolean trap in the entity `typescript.ts:237-248`
- **checkBoolTrap** — Not described in the provided excerpt `python.ts:437-456`
- **checkCaptiveDependency** — Not described in the provided excerpt `csharp.ts:771-792`
- **checkCatchGeneric** — Evaluates if generic exceptions are caught in a `csharp.ts:628-646`
- **checkCatchRethrowOnly** — Identifies catch blocks that only rethrow exceptions `csharp.ts:865-883`
- **checkCircularDependency** — Checks for circular dependencies `typescript.ts:901-952`
- **checkClosureEvalScopeLeak** — Checks for eval scope leaks in closures `typescript.ts:1025-1037`
- **checkClosureFullObjectCapture** — Checks for full object capture in closures `typescript.ts:999-1018`
- **checkClosureNoCleanup** — Checks for closures that do not clean up `typescript.ts:1104-1136`
- **checkConditionalTypeAbuse** — Identifies abuse of conditional types `typescript.ts:594-605`
- **checkCSharpAsyncVoid** — Async void method: exceptions crash the process `csharp.ts:30-42`
- **checkDapperBufferedLargeQuery** — Not present in the provided code `csharp.ts:1320-1347`
- **checkDapperImplicitNvarchar** — Not present in the provided code `csharp.ts:1088-1124`
- **checkDapperNoCommandTimeout** — Not present in the provided code `csharp.ts:1291-1314`
- **checkDapperNPlusOne** — Not present in the provided code `csharp.ts:1246-1285`
- **checkDapperQueryThenFirst** — Not present in the provided code `csharp.ts:1130-1169`
- **checkDapperSqlInjection** — Not present in the provided code `csharp.ts:1175-1240`
- **checkDeclarationMergingTrap** — Checks for declaration merging traps `typescript.ts:875-895`
- **checkDeepNesting** — Deep nesting: nestingDepth > 5 `common.ts:35-46`
- **checkDeepNesting** — Identifies deeply nested functions `python.ts:693-702`
- **checkDeleteOperator** — Not applicable in this context `typescript.ts:124-135`
- **checkDelFinalizer** — Checks if the entity name ends with "__del__" or `python.ts:504-513`
- **checkDictCheckThenAct** — Verifies if the entity's metadata contains both ContainsKey and Add calls, and checks for a pattern in the code `csharp.ts:735-766`
- **checkDiServiceLocator** — Determines if the entity uses service locator patterns in its calls, excluding certain files `csharp.ts:255-270`
- **checkDiTooManyDeps** — Parses constructor or method parameters to detect excessive dependencies `csharp.ts:275-292`
- **checkDynamicPropertyInLoop** — Validates dynamic property access in loops `typescript.ts:211-230`
- **checkEfCartesianExplosion** — Not applicable in this context `csharp.ts:150-163`
- **checkEfClientSideEval** — Detects EF client-side evaluation patterns in code. `csharp.ts `csharp.ts:570-598`
- **checkEfEntityAsApiResponse** — Checks if an entity is an API response by looking for HTTP attributes and entity return types `csharp.ts:190-220`
- **checkEfFindInLoop** — Checks for database calls within loops in Entity Framework code `csharp.ts:540-565`
- **checkEfLoadEntireTable** — Not applicable in this context `csharp.ts:168-185`
- **checkEfRawSqlInjection** — Detects raw SQL injection risks in Entity Framework calls `csharp.ts:840-860`
- **checkEfSaveChangesNoTransaction** — Not present in the provided excerpt `csharp.ts:603-623`
- **checkEmptyCatch** — Empty catch block — swallows errors `typescript.ts:30-42`
- **checkEmptyCatch** — Detects empty catch blocks in exception handling `zig.ts:71-85`
- **checkEnumPitfalls** — Checks for pitfalls in enum usage `typescript.ts:562-576`
- **checkEventHandlerLeak** — Not present in the provided excerpt `csharp.ts:684-730`
- **checkEventListenerLeak** — Analyzes entity metadata to detect potential memory leaks in event listener usage `typescript.ts:328-355`
- **checkExceptionFlowControl** — Not present in the provided excerpt `csharp.ts:651-678`
- **checkExcessiveOptionalChaining** — Validates excessive optional chaining usage `typescript.ts:166-178`
- **checkGilThread** — Not described in the provided excerpt `python.ts:518-529`
- **checkGodClass** — Identifies classes that are too large and complex `python.ts:643-652`
- **checkGodFunction** — God function: cyclomatic > 20 OR LOC > 200 (disjunction — either triggers) `common.ts:11-30`
- **checkGodService** — God service: constructor with >= 10 parameters `csharp.ts:47-66`
- **checkGoroutineLeak** — Represents Go-specific custom detector for goroutine leaks `go.ts:35-52`
- **checkGrpcChannelPerCall** — Checks for gRPC channels per call `csharp.ts:465-484`
- **checkGrpcMissingDeadline** — Checks for missing deadlines in gRPC calls `csharp.ts:441-460`
- **checkHardcodedConnection** — Not present in the provided code `csharp.ts:1037-1076`
- **checkHasDeinit** — Determines if the entity has cleanup calls, returning a confidence score and matched criteria `zig.ts:274-292`
- **checkHighComplexity** — Detects functions with high complexity `python.ts:707-716`
- **checkHoleyArray** — Not applicable in this context `typescript.ts:107-119`
- **checkIgnoredError** — Parses Go function that returns error but caller ignores it `go.ts:11-30`
- **checkImplementationTesting** — Checks for implementation testing issues `typescript.ts:630-650`
- **checkInconsistentReturn** — Validates inconsistent return types `typescript.ts:253-266`
- **checkInitTooComplex** — Detects complex initialization in constructors `python.ts:629-638`
- **checkInnerClassReferenceLeak** — Not applicable in this context `java.ts:361-411`
- **checkIsinstanceChain** — Checks for chains of isinstance checks `python.ts:721-730`
- **checkJavaEmptyCatch** — Detects empty catch blocks in Java `java.ts:44-53`
- **checkJavaMutableStatic** — Checks for mutable static fields in Java `java.ts:58-71`
- **checkJsonDeepClone** — Checks for patterns indicating deep cloning of JSON objects `typescript.ts:360-374`
- **checkLargeClass** — Evaluates if an entity is a large class based on lines of code and method count `common.ts:136-157`
- **checkLargeTryBlock** — Not present in the provided code `csharp.ts:955-992`
- **checkLinqInHotpath** — Not applicable in this context `csharp.ts:121-143`
- **checkLinqPrematureMaterialization** — Not described in the provided excerpt `csharp.ts:798-833`
- **checkListenerLeak** — Not applicable in this context `java.ts:276-304`
- **checkManyPosArgs** — Checks for functions with many positional arguments `python.ts:417-432`
- **checkMapInsteadOfWeakMap** — Checks for using `Map` instead of `WeakMap `typescript.ts:1048-1067`
- **checkMinimalApiFatLambda** — Checks for minimal API fat lambda expressions `csharp.ts:389-406`
- **checkMinimalApiNoValidation** — Checks for minimal API methods without validation `csharp.ts:411-436`
- **checkMissingCancellation** — Missing CancellationToken: async Task method without cancellation support `csharp.ts:71-89`
- **checkMissingDeferFree** — Parses entity metadata to detect missing defer calls relative to alloc calls `zig.ts:13-34`
- **checkMissingErrdefer** — Detects missing errdefer calls in error-returning functions `zig.ts:39-66`
- **checkMissingGenericConstraint** — Identifies missing generic constraints `typescript.ts:539-555`
- **checkMissingInputValidation** — Validates input parameters `typescript.ts:815-839`
- **checkMissingNullCheck** — Validates missing null checks in an entity `typescript.ts:754-780`
- **checkMissingReadonly** — Checks for missing readonly properties `typescript.ts:785-810`
- **checkMissingRepr** — Not described in the provided excerpt `python.ts:595-608`
- **checkMissingSlots** — Flags classes that do not have slots and have a sufficient number of methods `python.ts:578-590`
- **checkMixedAsyncSync** — Checks for mixed async and sync operations in an entity `csharp.ts:936-950`
- **checkMutableDefaultArg** — Detects mutable default arguments in Python functions `python.ts:26-47`
- **checkMutableStatic** — Mutable static field: shared across threads without protection `csharp.ts:11-25`
- **checkMutexNotDeferred** — Not present in the provided code `zig.ts:192-219`
- **checkNakedReturn** — Represents Go-specific custom detector for naked return statements `go.ts:73-92`
- **checkNamespaceAntipattern** — Detects namespace antipatterns `typescript.ts:581-589`
- **checkNestedCallbacks** — Nested callbacks: high nesting + no awaits (callback hell) `typescript.ts:47-61`
- **checkNoConfigureAwait** — Checks if an entity uses awaits without ConfigureAwait, flags library-like `csharp.ts:904-931`
- **checkNoDocumentation** — No documentation on public entity `common.ts:80-110`
- **checkNonNullAssertionAbuse** — Checks for abuse of non-null assertions `typescript.ts:436-447`
- **checkNoSeed** — Not described in the provided excerpt `python.ts:463-478`
- **checkNoTypeHints** — Detects functions without type hints `python.ts:73-95`
- **checkNpFloatCmp** — Validates float comparisons in numpy `python.ts:237-252`
- **checkNpLoop** — Detects numpy loops `python.ts:221-232`
- **checkNullishVsOrConfusion** — Identifies confusion between nullish coalescing and logical OR `typescript.ts:452-463`
- **checkOpenNoEncoding** — Verifies that open() is not used without encoding `python.ts:398-410`
- **checkParameterMutation** — Validates parameter mutation in functions `typescript.ts:484-495`
- **checkPdChainedIndexing** — Checks for chained indexing in pandas `python.ts:140-150`
- **checkPdCsvNoDtype** — Checks if pandas CSV reading does not specify a dtype `python.ts:205-214`
- **checkPdInplaceTrue** — Validates if pandas operations are performed in-place `python.ts:155-164`
- **checkPdMissingCopy** — Ensures that pandas operations do not result in missing copies `python.ts:169-185`
- **checkPdNanComparison** — Verifies that NaN comparisons are handled correctly in pandas `python.ts:190-200`
- **checkPiiInLogs** — Checks for personally identifiable information in logs `csharp.ts:340-352`
- **checkPltNoClose** — Verifies that matplotlib is not closed prematurely `python.ts:329-341`
- **checkPltStateConfusion** — Checks for matplotlib state confusion `python.ts:346-356`
- **checkPromiseNoCatch** — Promise without catch — unhandled rejection `typescript.ts:66-84`
- **checkPropertyNoSetter** — Checks for properties without setters `python.ts:613-624`
- **checkQuadraticArrayOps** — Validates quadratic array operations `typescript.ts:292-312`
- **checkRawTypes** — Identifies raw types used without type parameters `java.ts:19-39`
- **checkRedosVulnerability** — Detects potential vulnerabilities in Redos `typescript.ts:516-534`
- **checkReflectionInHotpath** — Not applicable in this context `java.ts:94-114`
- **checkRegexNoTimeout** — Not present in the provided code `csharp.ts:998-1031`
- **checkReRaiseDifferent** — Detects re-raises of exceptions of different types `python.ts:735-744`
- **checkRxjsSubscribeInLoop** — Validates RxJS subscribe usage in loops `typescript.ts:679-693`
- **checkSetInsteadOfWeakSet** — Checks for using `Set` instead of `WeakSet `typescript.ts:1077-1094`
- **checkShapeDivergence** — Not applicable in this context `typescript.ts:141-161`
- **checkSideEffectImport** — Checks for side effects in imports `typescript.ts:844-869`
- **checkSingletonMutableState** — Not applicable in this context `csharp.ts:94-116`
- **checkSkCvLeakage** — Ensures that scikit-learn cross-validation does not leak data `python.ts:309-322`
- **checkSkDataLeakage** — Checks for data leakage in scikit-learn `python.ts:259-272`
- **checkSkNoPipeline** — Ensures that scikit-learn pipelines are not used `python.ts:277-287`
- **checkSkNoRandomState** — Validates that scikit-learn does not use a random state `python.ts:292-304`
- **checkSmallFocusedFunction** — Evaluates if a function is `common.ts:115-131`
- **checkSnapshotAbuse** — Detects abuse of snapshot testing `typescript.ts:612-625`
- **checkSpreadInHotPath** — Checks for spread in hot path `typescript.ts:183-206`
- **checkSqlInjection** — Ensures SQL injection vulnerabilities are not present `python.ts:380-393`
- **checkStarImport** — Identifies star imports in Python code `python.ts:52-68`
- **checkStaticCollectionLeak** — Checks for static fields with Add calls and no corresponding Remove/Clear/Dequeue/Pop calls `csharp.ts:297-335`
- **checkStaticCollectionLeak** — Detects static collections with add() but no remove()/clear() `java.ts:125-170`
- **checkStringConcatInLoop** — Detects string concatenation in loops `java.ts:76-89`
- **checkStringlyTypedApi** — Checks for stringly typed API calls `typescript.ts:655-669`
- **checkSubprocessShell** — Validates subprocess shell usage `python.ts:363-375`
- **checkSwallowedError** — Not applicable in this context `zig.ts:90-108`
- **checkTaskRunInAspnet** — Checks if a task run is present in an ASP.NET context `csharp.ts:225-250`
- **checkTestFloatEq** — Not described in the provided excerpt `python.ts:485-497`
- **checkThreadLocalLeak** — Detects ThreadLocal.set() without finally { remove() } `java.ts:180-216`
- **checkThreadpoolNoMax** — Not described in the provided excerpt `python.ts:534-543`
- **checkThrowNonError** — Detects throwing non-error types `typescript.ts:468-479`
- **checkTooManyParams** — Too many parameters: > 7 `common.ts:52-75`
- **checkTooManyReturns** — Validates Go function with too many return statements `go.ts:57-68`
- **checkTooManyReturns** — Checks for functions with too many return statements `python.ts:679-688`
- **checkUnboundedCache** — Not applicable in this context `java.ts:227-261`
- **checkUnclosedResource** — Not applicable in this context `java.ts:316-347`
- **checkUnreachableAbuse** — Checks if the number of unreachable operations is greater than 2, returning a confidence score and matched criteria `zig.ts:259-269`
- **checkUnsafeCastAbuse** — Not present in the provided code `zig.ts:224-234`
- **checkUnsafeIndexAccess** — Validates unsafe index access in an entity `typescript.ts:729-749`
- **checkUnsafeInnerHtml** — Checks for unsafe innerHTML usage `typescript.ts:500-511`
- **checkUnsafeOptionalUnwrap** — Not present in the provided code `zig.ts:152-186`
- **checkUnsafeTypeAssertion** — Validates unsafe type assertions in TypeScript `typescript.ts:416-431`
- **checkWrongNaming** — Not present in the provided code `zig.ts:115-146`
- **complexParams** — Checks for complex parameters in an entity `csharp.ts:419-421`
- **dapperCalls** — Not present in the provided code `csharp.ts:1090-1090`, `csharp.ts:1177-1177`, `csharp.ts:1293-1293`
- **dapperInLoop** — Not present in the provided code `csharp.ts:1255-1255`
- **dbCalls** — Filters inner calls for database-related patterns `csharp.ts:551-551`
- **duplicates** — Counts duplicate entities `typescript.ts:881-885`
- **errdeferCount** — Counts errdefer exceptions in control flow metadata `zig.ts:56-56`
- **genericCatches** — Parses a condition to check if an exception type is either "Exception", "System.Exception", or null `csharp.ts:633-633`
- **getAntipatternHints** — Returns hints for common TypeScript antipatterns `typescript.ts:409-411`
- **getCalls** — Not applicable in this context `java.ts:234-234`
- **getCalls** — Returns an array of call information from the entity's metadata, or an empty array if not present `python.ts:107-109`
- **getCf** — Retrieves control flow data for an entity `csharp.ts:513-515`
- **getClassMeta** — Retrieves the class metadata for an entity `python.ts:571-573`
- **getClosureHints** — Retrieves closure hints for an entity `typescript.ts:969-971`
- **getPyCfExt** — Retrieves Python-specific control flow extensions `python.ts:664-674`
- **grpcCalls** — Checks for gRPC calls in an entity `csharp.ts:444-447`
- **hasAdd** — Checks if the entity has a method named "Add" or "set `csharp.ts:738-738`
- **hasAdd** — Not applicable in this context `java.ts:283-283`
- **hasAdd** — Determines if any call names match a set of predefined patterns for adding event listeners `typescript.ts:333-333`
- **hasAwaitCalls** — Checks for await calls in the entity `typescript.ts:278-278`
- **hasCallWith** — Checks if there is a call in the provided calls array that matches the given name regular expression and optional keyword argument criteria `python.ts:112-131`
- **hasCancellation** — Not applicable in this context `csharp.ts:81-81`
- **hasCatch** — Not applicable in this context `typescript.ts:73-73`
- **hasChannelCreate** — Checks if an entity has a channel create operation `csharp.ts:468-470`
- **hasCleanup** — Tests if a call has a name or target that matches cleanup keywords `zig.ts:281-282`
- **hasCloseCall** — Not applicable in this context `java.ts:331-331`
- **hasConfigureAwait** — Not described in the provided excerpt `csharp.ts:915-915`
- **hasContainsKey** — Determines if the entity's metadata contains a call to ContainsKey `csharp.ts:737-737`
- **hasContext** — Not applicable in this context `go.ts:43-43`
- **hasDbCalls** — Checks if the entity has calls to DbContext or `csharp.ts:212-212`
- **hasDbRef** — Determines if any call references a `csharp.ts:177-177`
- **hasDbRef** — Not present in the provided excerpt `csharp.ts:577-577`
- **hasDeferUnlock** — Not present in the provided code `zig.ts:207-207`
- **hasEventCalls** — Checks if any event calls are present in the entity's metadata `csharp.ts:688-691`
- **hasEviction** — Not applicable in this context `java.ts:239-242`
- **hasFilter** — Checks if any call has a name matching a filter pattern `csharp.ts:173-173`
- **hasGoroutine** — Not applicable in this context `go.ts:39-39`
- **hasHttpAttr** — Determines if the entity has HTTP-related attributes `csharp.ts:195-195`
- **hasIteration** — Checks for iteration in the entity `typescript.ts:298-298`
- **hasLinq** — Checks if any call in the entity's metadata uses LINQ methods `csharp.ts:804-805`
- **hasLock** — Not present in the provided code `zig.ts:196-196`
- **hasLongLivedListeners** — Checks if there are long-lived listeners `typescript.ts:978-989`
- **hasLookup** — Checks if any call names match a set of predefined patterns `typescript.ts:299-299`
- **hasMapEndpoint** — Checks if an entity has a map endpoint `csharp.ts:391-391`, `csharp.ts:413-413`
- **hasMaterializer** — Determines if the entity has calls to materializer methods like ToList `csharp.ts:573-573`
- **hasMaterializer** — Not described in the provided excerpt `csharp.ts:801-801`
- **hasParse** — Checks if any call names match a specific pattern for parsing JSON `typescript.ts:364-364`
- **hasPrivateTarget** — Checks if a target is private `typescript.ts:640-640`
- **hasPromise** — Not applicable in this context `typescript.ts:71-71`
- **hasRawSql** — Checks if any call has a name matching FromSqlRaw, ExecuteSqlRaw, or ExecuteSqlRawAsync `csharp.ts:842-842`
- **hasReduce** — Determines if any call names match a specific pattern for reduce `typescript.ts:384-384`
- **hasRegexCall** — Not present in the provided code `csharp.ts:1001-1005`
- **hasRemove** — Not applicable in this context `java.ts:284-284`
- **hasRemove** — Determines if any call names match a set of predefined patterns for removing event listeners `typescript.ts:334-334`
- **hasSeed** — Not described in the provided excerpt `python.ts:471-471`
- **hasServiceResolution** — Checks if any call has a name starting with "GetRequiredService" or "GetService". `csharp `csharp.ts:781-781`
- **hasSingleton** — Checks if any call has a name starting with "AddSingleton" `csharp.ts:778-778`
- **hasSingletonDecorator** — Not applicable in this context `csharp.ts:104-104`
- **hasSplitQuery** — Not applicable in this context `csharp.ts:155-155`
- **hasSpyOn** — Checks if a spy is on a target `typescript.ts:634-634`
- **hasStringify** — Checks if any call names match a specific pattern for stringifying JSON `typescript.ts:365-365`
- **hasTaskRun** — Determines if the entity has a `csharp.ts:227-227`
- **hasTransaction** — Checks if any call matches transaction-related names `csharp.ts:609-610`
- **hasUnlock** — Not present in the provided code `zig.ts:199-199`
- **hasUnreachable** — Not applicable in this context `zig.ts:95-95`
- **hasUnreachable** — Not present in the provided code `zig.ts:167-167`
- **hasValidation** — Checks if an entity has validation `csharp.ts:426-427`
- **includeCount** — Not applicable in this context `csharp.ts:152-152`
- **interfaceParams** — Calculates the number of interface parameters that match the pattern I[A-Z] `common.ts:65-65`
- **isAspnet** — Checks if the entity has attributes related to ASP.NET controllers or HTTP methods `csharp.ts:241-241`
- **isRedosVulnerable** — Checks if an entity is vulnerable to Redos `typescript.ts:1162-1174`
- **linqCalls** — Not applicable in this context `csharp.ts:126-129`
- **match** — Determines if any call in the entity's calls matches the pattern of `asyncio.run `python.ts:552-552`
- **matched** — Not applicable in this context `python.ts:157-157`
- **materializers** — Not applicable in this context `csharp.ts:170-170`
- **meaningful** — Filters out infrastructure parameters from `csharp.ts:283-283`
- **mutableDefaults** — Filters parameters with default values that are arrays, objects, or sets `python.ts:33-38`
- **noSeed** — Checks if a random seed is set `python.ts:297-297`
- **nullableParams** — Specifies parameters that can be null `typescript.ts:760-764`
- **optionalCount** — Counts the number of optional properties `typescript.ts:170-170`
- **orelseCount** — Not present in the provided code `zig.ts:162-162`
- **otherRemoves** — Removes entities from a list `csharp.ts:321-322`
- **otherRemoves** — Not applicable in this context `java.ts:152-153`
- **posParams** — Not described in the provided excerpt `python.ts:425-425`
- **putCalls** — Not applicable in this context `java.ts:233-233`
- **queryCalls** — Not present in the provided code `csharp.ts:1323-1323`
- **randomCalls** — Not described in the provided excerpt `python.ts:465-468`
- **rawParams** — Filters parameters with raw types `java.ts:26-26`
- **readOnly** — Identifies read-only properties `python.ts:617-617`
- **reflectionCalls** — Not applicable in this context `java.ts:99-101`
- **removeCalls** — Removes calls from a list of entities `csharp.ts:312-312`
- **removeCalls** — Not applicable in this context `java.ts:141-142`, `java.ts:195-197`
- **resourceTypes** — Not applicable in this context `java.ts:339-339`
- **reverseImports** — Reverses the import statements `typescript.ts:921-943`
- **safeCode** — Returns a substring of the entity's metadata embedding text, limited to 8000 characters `python.ts:102-104`
- **sameFile** — Checks if two entities are in the same file `csharp.ts:317-317`
- **sameFile** — Not applicable in this context `java.ts:148-148`
- **saveCount** — Not present in the provided excerpt `csharp.ts:605-605`
- **setCalls** — Not applicable in this context `java.ts:187-189`
- **skCalls** — Counts scikit-learn function calls `python.ts:294-295`
- **slCalls** — Filters calls to "GetService" or "GetRequiredService" `csharp.ts:257-257`
- **snapshotCount** — Counts the number of snapshots `typescript.ts:616-616`
- **splitUnionType** — Splits a union type into individual types `typescript.ts:1141-1159`
- **spyTargets** — Represents the targets of spies `typescript.ts:638-638`
- **stringParams** — Stores string parameters for an entity `typescript.ts:661-661`
- **unconstrained** — Represents an unconstrained type `typescript.ts:543-543`
- **untypedParams** — Filters parameters that do not have a specified type `python.ts:79-79`
- **uselessCatches** — Filters exceptions that only rethrow and are not empty. `c `csharp.ts:870-870`
- **usesNp** — Identifies if numpy is used in the code `python.ts:245-245`
- **usesProperCache** — Not applicable in this context `java.ts:247-248`

### Interface
- **CfAwait** — Represents an await operation in control flow `csharp.ts:501-504`
- **CfException** — Represents an exception in control flow `csharp.ts:489-495`
- **CfLoop** — Represents a loop in control flow `csharp.ts:496-500`
- **ControlFlowData** — Represents data in control flow `csharp.ts:505-511`
- **PyCfExt** — Represents Python-specific control flow extensions `python.ts:656-662`

### Type_alias
- **AntipatternHintsLike** — Represents a set of counts and strings related to common antipatterns in TypeScript `typescript.ts:398-407`
- **CallInfo** — Represents information about a method call, including its name and keyword arguments `python.ts:99-99`
- **ClassMeta** — Defines metadata for a class, including slots, double-underscore methods, properties, and method counts `python.ts:563-569`
- **ClosureHintsLike** — Represents closure hints `typescript.ts:956-967`

### Import_decl
- **../../../types/storage.js** — Imports `../../../types/storage.js` from `../../../types/storage.js`. `common.ts:5-5`, `csharp.ts:5-5`, `go.ts:5-5`, `java.ts:13-13`, `python.ts:5-5`, `typescript.ts:5-5`, `zig.ts:5-5`
- **../types.js** — Imports `../types.js` from `../types.js`. `common.ts:6-6`, `csharp.ts:6-6`, `go.ts:6-6`, `java.ts:14-14`, `python.ts:6-6`, `typescript.ts:6-6`, `zig.ts:6-6`

### Property
- **absent** — Indicates whether the keyword argument is absent `python.ts:115-115`
- **addListenerCount** — Counts the number of `addListener` calls `typescript.ts:961-961`
- **allocCallCount** — Not present in the provided code `zig.ts:241-241`
- **awaits** — Represents awaits in control `csharp.ts:510-510`
- **awaits** — Not applicable in this context `typescript.ts:49-49`
- **awaits** — Counts the number of awaits `typescript.ts:274-274`
- **awaits** — Stores await statements in an entity `typescript.ts:702-702`
- **branches** — Represents branches in control flow `csharp.ts:506-506`
- **branches** — Not applicable in this context `go.ts:16-16`
- **branches** — Represents branch structures in an entity `typescript.ts:734-734`
- **branches** — Counts the number of branches in a control flow `typescript.ts:769-769`, `typescript.ts:822-822`
- **branches** — Counts branches in control flow metadata `zig.ts:22-22`
- **capturedVarCount** — Counts captured variables `typescript.ts:958-958`
- **catchType** — Represents the type of exception caught `csharp.ts:491-491`
- **catchType** — Not applicable in this context `zig.ts:53-53`, `zig.ts:74-74`
- **catchType** — Not present in the provided code `zig.ts:159-159`, `zig.ts:204-204`
- **conditionalFieldAddCount** — Not applicable in this context `typescript.ts:143-143`
- **constraint** — Represents a constraint in TypeScript `typescript.ts:540-540`
- **cyclomaticComplexity** — Retrieves cyclomatic complexity from entity metadata `common.ts:16-16`
- **cyclomaticComplexity** — Extracts the cyclomatic complexity from the entity's metadata `common.ts:116-116`
- **cyclomaticComplexity** — Calculates the cyclomatic complexity of a function `python.ts:659-659`
- **defaultValue** — Not described in the provided excerpt `python.ts:30-30`
- **defaultValue** — Not applicable in this context `python.ts:422-422`
- **defaultValue** — The default value of the parameter `python.ts:442-442`
- **deferCount** — Represents a property in the metadata for defer count `zig.ts:241-241`
- **deleteCount** — Not applicable in this context `typescript.ts:125-125`
- **doubleAssertionCount** — Represents the count of double assertions in the entity `typescript.ts:400-400`
- **dunderMethods** — Stores the names of double-underscore methods `python.ts:565-565`
- **dynamicPropAccessCount** — Counts dynamic property access in loops `typescript.ts:214-214`
- **dynamicPropAccessCount** — Counts dynamic property accesses in an entity `typescript.ts:730-730`
- **end** — Represents the end line of an entity `typescript.ts:701-701`
- **evalInClosureCount** — Counts occurrences of `eval` within closures `typescript.ts:960-960`
- **exceptions** — Represents exceptions in control flow `csharp.ts:508-508`
- **exceptions** — Not applicable in this context `go.ts:16-16`, `java.ts:45-45`, `java.ts:203-203`, `typescript.ts:31-31`, `typescript.ts:74-74`, `zig.ts:22-22`, `zig.ts:53-53`, `zig.ts:74-74`
- **exceptions** — Not described in the provided excerpt `python.ts:12-12`
- **exceptions** — Represents a custom detector for missing defer free `zig.ts:98-98`, `zig.ts:159-159`, `zig.ts:204-204`
- **expression** — Represents an expression in the code `csharp.ts:502-502`
- **forceUnwrapCount** — Not present in the provided code `zig.ts:153-153`
- **freeCallCount** — Represents a property in the metadata for free call count `zig.ts:241-241`
- **fullObjectCaptureCount** — Counts full object captures `typescript.ts:959-959`
- **hasLoops** — Not applicable in this context `typescript.ts:125-125`
- **hasLoops** — Checks for loops in the entity `typescript.ts:143-143`
- **hasRethrow** — Checks if an exception is rethrown `csharp.ts:492-492`
- **hasSetter** — Indicates whether a property has a setter `python.ts:566-566`
- **hasSlots** — Indicates whether the class has slots `python.ts:564-564`
- **hasThrowEx** — Checks if an entity throws an exception `csharp.ts:494-494`
- **holeyArrayCount** — Not applicable in this context `typescript.ts:111-111`
- **initCallCount** — Tracks the number of times the initialization method is called `python.ts:567-567`
- **innerCalls** — Represents inner calls in control flow `csharp.ts:499-499`
- **innerFunctionCount** — Counts inner functions `typescript.ts:957-957`
- **innerHtmlAssignCount** — Represents the count of innerHTML assignments in the entity `typescript.ts:403-403`
- **isAwait** — Determines if the entity is an await `typescript.ts:275-275`
- **isDefault** — Indicates if an entity is a default export `typescript.ts:848-848`
- **isEmpty** — Checks if an entity is empty `csharp.ts:493-493`
- **isinstanceCount** — Counts the number of isinstance checks in a function `python.ts:660-660`
- **isNamespace** — Indicates whether the entity is a namespace `python.ts:56-56`
- **isNamespace** — Indicates if an entity is a namespace `typescript.ts:848-848`
- **isOptional** — Determines if a property is optional `typescript.ts:167-167`
- **key** — The key of a keyword argument `python.ts:115-115`
- **kind** — Represents the kind of an entity `csharp.ts:497-497`
- **kwargs** — A record of keyword arguments for the function or method `python.ts:99-99`
- **line** — Represents a line in the code `csharp.ts:490-490`, `csharp.ts:498-498`, `csharp.ts:503-503`, `csharp.ts:506-506`, `csharp.ts:509-509`
- **line** — Represents a line number `typescript.ts:701-701`, `typescript.ts:701-701`, `typescript.ts:702-702`
- **linesOfCode** — Retrieves lines of code from entity metadata `common.ts:16-16`
- **linesOfCode** — Parses the lines of code metric from the entity metadata `common.ts:116-116`
- **linesOfCode** — Returns the lines of code metric from the entity metadata `common.ts:139-139`
- **linesOfCode** — Counts the number of lines of code in an entity `csharp.ts:395-395`
- **linesOfCode** — Not applicable in this context `go.ts:74-74`
- **linesOfCode** — Counts the number of lines of code `typescript.ts:195-195`, `typescript.ts:547-547`, `typescript.ts:828-828`
- **local** — A local name within a namespace `python.ts:56-56`
- **location** — Stores the location of an entity `typescript.ts:701-701`, `typescript.ts:702-702`
- **loops** — Not applicable in this context `csharp.ts:125-125`, `java.ts:77-77`, `java.ts:106-106`
- **loops** — Represents loops in control flow `csharp.ts:507-507`
- **loops** — Detects loops in the code `python.ts:331-331`
- **loops** — Counts the number of loops `typescript.ts:194-194`, `typescript.ts:222-222`, `typescript.ts:294-294`
- **loops** — Represents loop structures in an entity `typescript.ts:701-701`, `typescript.ts:734-734`
- **mapNewCount** — Counts the number of `new Map()` instances `typescript.ts:963-963`
- **methodCount** — Parses the method count from the entity metadata `common.ts:143-143`
- **methodCount** — Counts the number of methods in the class `python.ts:568-568`
- **name** — Extracts parameters from entity metadata `common.ts:53-53`, `csharp.ts:890-890`
- **name** — Not applicable in this context `csharp.ts:74-74`, `csharp.ts:103-103`, `csharp.ts:122-122`, `csharp.ts:151-151`, `csharp.ts:169-169`, `go.ts:12-12`, `go.ts:36-36`, `java.ts:95-95`, `java.ts:128-128`, `java.ts:151-151`, `python.ts:420-420`, `typescript.ts:67-67`, `zig.ts:14-14`, `zig.ts:43-43`, `zig.ts:91-91`
- **name** — Extracts the names of decorators from an entity's metadata. `csharp.ts:191-191 `csharp.ts:191-191`
- **name** — Not described in the provided excerpt `csharp.ts:211-211`, `csharp.ts:233-233`, `csharp.ts:256-256`, `csharp.ts:775-775`, `csharp.ts:800-800`, `csharp.ts:841-841`, `csharp.ts:919-919`, `python.ts:28-28`
- **name** — Extracts the name of calls from the entity metadata `csharp.ts:226-226`
- **name** — csharp.ts:281-281` — Parses the parameters metadata of the entity `csharp.ts:281-281`
- **name** — csharp.ts:301-301` — Parses the calls metadata of the entity `csharp.ts:301-301`
- **name** — Represents the name of an entity `csharp.ts:320-320`, `csharp.ts:390-390`, `csharp.ts:412-412`, `csharp.ts:417-417`, `csharp.ts:442-442`, `csharp.ts:466-466`, `typescript.ts:540-540`, `typescript.ts:613-613`, `typescript.ts:631-631`, `typescript.ts:680-680`, `typescript.ts:755-755`, `typescript.ts:981-981`
- **name** — Extracts the name from the metadata calls array. `csharp.ts `csharp.ts:571-571`
- **name** — Not present in the provided excerpt `csharp.ts:604-604`
- **name** — Extracts the name from the metadata calls array `csharp.ts:686-686`, `typescript.ts:361-361`, `typescript.ts:380-380`
- **name** — Extracts the name from the metadata calls array. `csharp.ts:73 `csharp.ts:736-736`
- **name** — Not present in the provided code `csharp.ts:1000-1000`, `csharp.ts:1089-1089`, `csharp.ts:1176-1176`, `csharp.ts:1292-1292`, `csharp.ts:1321-1321`, `zig.ts:165-165`, `zig.ts:193-193`
- **name** — Represents a function to check for raw types in Java entities `java.ts:183-183`, `java.ts:230-230`, `java.ts:279-279`, `java.ts:330-330`
- **name** — The name of the function or method `python.ts:99-99`
- **name** — The name of the parameter `python.ts:440-440`
- **name** — Gets the name of the entity `typescript.ts:275-275`, `typescript.ts:293-293`
- **name** — Extracts call names from entity metadata `typescript.ts:329-329`
- **name** — Stores the name of an entity `typescript.ts:819-819`
- **name** — Extracts the name from the entity metadata `zig.ts:277-277`
- **nestingDepth** — Retrieves nesting depth from entity metadata `common.ts:36-36`
- **nestingDepth** — Measures the depth of nested functions `python.ts:658-658`
- **nestingDepth** — Not applicable in this context `typescript.ts:48-48`
- **nonNullAssertionCount** — Represents the count of non-null assertions in the entity `typescript.ts:401-401`
- **objectShapeVariants** — Not applicable in this context `typescript.ts:143-143`
- **optional** — Not applicable in this context `python.ts:421-421`
- **optional** — Indicates whether an entity is optional `typescript.ts:755-755`
- **orWithDefaultCount** — Represents the count of or-with-default expressions in the entity `typescript.ts:404-404`
- **paramMutationCount** — Represents the count of parameter mutations in the entity `typescript.ts:405-405`
- **properties** — Represents properties of the class with their setter availability `python.ts:566-566`
- **regexLiterals** — Stores an array of regex literals in the entity `typescript.ts:406-406`
- **removeListenerCount** — Counts the number of `removeListener` calls `typescript.ts:962-962`
- **reRaiseDifferentType** — Detects re-raises of exceptions of different types `python.ts:661-661`
- **returnCount** — Not applicable in this context `go.ts:58-58`, `go.ts:74-74`
- **returnCount** — Counts the number of return statements in a function `python.ts:657-657`
- **returns** — Represents returns in control flow `csharp.ts:509-509`
- **safeUnwrapCount** — Not present in the provided code `zig.ts:153-153`
- **setNewCount** — Counts the number of `new Set()` instances `typescript.ts:965-965`
- **source** — Stores the source code of an entity `typescript.ts:848-848`, `typescript.ts:905-905`, `typescript.ts:925-925`
- **specifiers** — An array of local names within a namespace `python.ts:56-56`
- **specifiers** — Specifies the import specifiers `typescript.ts:848-848`
- **spreadInCallCount** — Counts spread in calls `typescript.ts:186-186`
- **spreadInCallCount** — Retrieves the spread in call count from the JIT hints metadata `typescript.ts:381-381`
- **start** — Represents the start line of an entity `typescript.ts:701-701`, `typescript.ts:702-702`
- **syncOverAsyncCount** — Not described in the provided excerpt `csharp.ts:941-941`
- **target** — Not applicable in this context `csharp.ts:151-151`, `csharp.ts:169-169`, `go.ts:12-12`, `go.ts:36-36`, `java.ts:95-95`, `java.ts:128-128`, `java.ts:183-183`, `java.ts:230-230`, `java.ts:279-279`, `typescript.ts:67-67`, `zig.ts:14-14`, `zig.ts:43-43`, `zig.ts:91-91`
- **target** — Not described in the provided excerpt `csharp.ts:211-211`, `csharp.ts:775-775`
- **target** — Extracts the target of calls from the entity metadata. `csharp.ts `csharp.ts:226-226`
- **target** — Represents a target entity for code analysis `csharp.ts:301-301`, `csharp.ts:442-442`
- **target** — Represents the target of an entity `csharp.ts:466-466`, `typescript.ts:981-981`
- **target** — Not present in the provided excerpt `csharp.ts:571-571`, `csharp.ts:604-604`
- **target** — Extracts the target from the metadata calls array `csharp.ts:686-686`, `csharp.ts:736-736`, `typescript.ts:361-361`
- **target** — Not present in the provided code `csharp.ts:1000-1000`, `csharp.ts:1089-1089`, `zig.ts:165-165`, `zig.ts:193-193`
- **target** — Extracts call targets from entity metadata `typescript.ts:329-329`
- **target** — Represents the target of a test `typescript.ts:631-631`
- **target** — Extracts the target from the entity metadata `zig.ts:277-277`
- **throwNonErrorCount** — Represents the count of non-error throws in the entity `typescript.ts:402-402`
- **type** — Extracts parameters from entity metadata `common.ts:53-53`
- **type** — Not applicable in this context `csharp.ts:74-74`, `go.ts:42-42`, `java.ts:20-20`, `typescript.ts:90-90`, `zig.ts:53-53`, `zig.ts:74-74`
- **type** — csharp.ts:281-281` — Parses the parameters metadata of the entity `csharp.ts:281-281`
- **type** — Represents the type of an entity `csharp.ts:417-417`, `typescript.ts:656-656`, `typescript.ts:755-755`, `typescript.ts:819-819`
- **type** — Extracts parameters from entity metadata. `csharp.ts:89 `csharp.ts:890-890`
- **type** — Not described in the provided excerpt `python.ts:29-29`
- **type** — The type of the parameter `python.ts:76-76`, `python.ts:441-441`
- **type** — Determines the type of the entity `typescript.ts:238-238`
- **type** — Not present in the provided code `zig.ts:159-159`, `zig.ts:204-204`
- **typeAssertionCount** — Represents the count of type assertions in the entity `typescript.ts:399-399`
- **unreachableCount** — Retrieves the unreachable count from the entity metadata `zig.ts:260-260`
- **unsafeCastCount** — Not present in the provided code `zig.ts:225-225`
- **value** — The value of a keyword argument `python.ts:115-115`
- **weakMapNewCount** — Counts the number of `new WeakMap()` instances `typescript.ts:964-964`
- **weakSetNewCount** — Counts the number of `new WeakSet()` instances `typescript.ts:966-966`

## Dependencies

- **Input Type**: `Entity` from `../../../types/storage.js` — code entity with metadata (metrics, modifiers, signatures)
- **Output Type**: `CustomDetectorResult` from `../types.js` — standardized detection result with match status and confidence score
- **Metadata Access**: Detectors examine `entity.metadata` to extract metrics (cyclomatic complexity, lines of code), modifiers (async, static, public), and structural properties (nesting depth, parameter count)
