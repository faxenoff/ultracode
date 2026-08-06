# Java

## 🤖 Overview

This module provides helper functions for extracting modifiers, annotations, inheritance, and parameters from Java AST nodes. It is used by developers to parse and analyze Java code structures.

## 🤖 Architecture

```
  +---------------------+
  | extraction-helpers.ts |
  +---------------------+
    |
    v
  +---------------------+
  |     types.ts        |
  +---------------------+
```

## 🤖 Flow

```
  +---------------------+
  | Java AST node       |
  +---------------------+
    |
    v
  +---------------------+
  | extraction-helpers.ts |
  +---------------------+
    |
    v
  +---------------------+
  |     types.ts        |
  +---------------------+
```

## 🤖 Entity Listing

### Function
- **extractAnnotations** — Function to extract annotations from an ANTLR context `extraction-helpers.ts:216-273`
- **extractAnnotationsFromFieldModifiers** — Extracts annotations from field modifiers `extraction-helpers.ts:296-300`
- **extractAnnotationsFromInterfaceModifiers** — Extracts annotations from interface modifiers `extraction-helpers.ts:278-282`
- **extractAnnotationsFromMethodModifiers** — Extracts annotations from method modifiers `extraction-helpers.ts:287-291`
- **extractCalls** — Extracts method calls from a method declarator context `extraction-helpers.ts:465-484`
- **extractClassInheritance** — Extracts class inheritance information `extraction-helpers.ts:309-333`
- **extractClassModifiers** — Function to extract class modifiers from an ANTLR context `extraction-helpers.ts:159-161`
- **extractConstantModifiers** — Function to extract constant modifiers from an ANTLR context `extraction-helpers.ts:204-206`
- **extractConstructorModifiers** — Function to extract constructor modifiers from an ANTLR context `extraction-helpers.ts:197-199`
- **extractConstructorParameters** — Extracts constructor parameters from a method declarator context `extraction-helpers.ts:409-434`
- **extractFieldModifiers** — Function to extract field modifiers from an ANTLR context `extraction-helpers.ts:190-192`
- **extractInterfaceInheritance** — Extracts interface inheritance information `extraction-helpers.ts:338-354`
- **extractInterfaceMethodModifiers** — Function to extract interface method modifiers from an ANTLR context `extraction-helpers.ts:183-185`
- **extractInterfaceModifiers** — Function to extract interface modifiers from an ANTLR context `extraction-helpers.ts:167-169`
- **extractMethodModifiers** — Function to extract method modifiers from an ANTLR context `extraction-helpers.ts:175-177`
- **extractMethodParameters** — Extracts method parameters `extraction-helpers.ts:363-404`
- **extractModifiersGeneric** — Function to extract generic modifiers from an ANTLR context `extraction-helpers.ts:141-153`
- **getLocation** — Function to get the location information from an ANTLR context `extraction-helpers.ts:114-132`

### Interface
- **AnnotationContext** — ANTLR context for annotations `extraction-helpers.ts:70-74`
- **AntlrContext** — Generic ANTLR context with location info `extraction-helpers.ts:38-44`
- **AntlrContextWithChildren** — ANTLR context with children `extraction-helpers.ts:49-51`
- **AntlrToken** — ANTLR Token interface with line, column, start, stop, and text properties `extraction-helpers.ts:27-33`
- **ConstructorDeclaratorContext** — ANTLR context for a constructor declarator `extraction-helpers.ts:86-88`
- **FormalParameterContext** — ANTLR context for a formal parameter `extraction-helpers.ts:101-105`
- **FormalParameterListContext** — ANTLR context for a list of formal parameters `extraction-helpers.ts:93-96`
- **JpaEntityInfo** — Represents information about JPA entities, including table name, relationships, and whether it is an entity `types.ts:48-56`
- **LombokInfo** — Represents information about Lombok annotations, including whether it has data, builder, getter, setter, slf4j, allArgsConstructor, and noArgsConstructor `types.ts:61-69`
- **MethodDeclaratorContext** — ANTLR context for a method declarator `extraction-helpers.ts:79-81`
- **ModifiersContext** — Modifiers context (class/interface/method/field modifiers) `extraction-helpers.ts:56-65`
- **SpringAnnotationInfo** — Represents information about Spring annotations, including type, path, method, and qualifiers `types.ts:38-43`

### Import_decl
- **../../generated/java/Java20Parser.js** — Imports `../../generated/java/Java20Parser.js`. `extraction-helpers.ts:9-17`
- **./types.js** — Imports `./types.js` from `./types.js`. `extraction-helpers.ts:18-18`

### Property
- **_start** — Start position property of an ANTLR context `extraction-helpers.ts:41-41`
- **_stop** — Stop position property of an ANTLR context `extraction-helpers.ts:42-42`
- **annotation** — Annotation property of a modifiers context `extraction-helpers.ts:64-64`
- **children** — Children property of an ANTLR context with children `extraction-helpers.ts:50-50`
- **classModifier** — Class modifier property of a modifiers context `extraction-helpers.ts:57-57`
- **column** — Column number property of an ANTLR token `extraction-helpers.ts:29-29`
- **constantModifier** — Constant modifier property of a modifiers context `extraction-helpers.ts:62-62`
- **constructorModifier** — Constructor modifier property of a modifiers context `extraction-helpers.ts:63-63`
- **elementValue** — ANTLR context for an individual element-value pair in an annotation `extraction-helpers.ts:73-73`
- **elementValue** — Represents an element value in an annotation `extraction-helpers.ts:257-257`
- **elementValuePairList** — ANTLR context for the list of element-value pairs in an annotation `extraction-helpers.ts:72-72`
- **elementValuePairList** — Represents the list of element-value pairs in an annotation `extraction-helpers.ts:240-240`
- **fieldModifier** — Field modifier property of a modifiers context `extraction-helpers.ts:61-61`
- **formalParameter** — ANTLR context for a single formal parameter `extraction-helpers.ts:94-94`
- **formalParameterList** — ANTLR context for the list of formal parameters in a method declarator `extraction-helpers.ts:80-80`
- **formalParameterList** — Returns a function that creates a FormalParameterListContext `extraction-helpers.ts:87-87`
- **getText** — Method to get text from an ANTLR context `extraction-helpers.ts:43-43`
- **getText** — Returns the text of an ANTLR token `extraction-helpers.ts:236-236`
- **getText** — Returns the text of an ANTLR context `extraction-helpers.ts:240-240`
- **getText** — Extracts the text from a marker annotation `extraction-helpers.ts:248-248`
- **getText** — Extracts the text from a single-element annotation `extraction-helpers.ts:253-253`
- **getText** — Extracts the text from an element value `extraction-helpers.ts:257-257`
- **getText** — Extracts the identifier text from a variable declaration `extraction-helpers.ts:377-377`
- **getText** — Extracts the identifier text from a variable argument parameter `extraction-helpers.ts:392-392`
- **getText** — Extracts the unann type text from a variable argument parameter `extraction-helpers.ts:393-393`
- **getText** — Parses the identifier's text `extraction-helpers.ts:423-423`
- **hasAllArgsConstructor** — A type alias for the `hasAllArgsConstructor` property in the `LombokInfo` interface `types.ts:67-67`
- **hasBuilder** — A type alias for the `hasBuilder` property in the `LombokInfo` interface `types.ts:63-63`
- **hasData** — A type alias for the `hasData` property in the `LombokInfo` interface `types.ts:62-62`
- **hasGetter** — A type alias for the `hasGetter` property in the `LombokInfo` interface `types.ts:64-64`
- **hasNoArgsConstructor** — A type alias for the `hasNoArgsConstructor` property in the `LombokInfo` interface `types.ts:68-68`
- **hasSetter** — A type alias for the `hasSetter` property in the `LombokInfo` interface `types.ts:65-65`
- **hasSlf4j** — A type alias for the `hasSlf4j` property in the `LombokInfo` interface `types.ts:66-66`
- **identifier** — Represents an identifier in the ANTLR context `extraction-helpers.ts:377-377`
- **identifier** — Represents an identifier in the Java AST `extraction-helpers.ts:392-392`
- **identifier** — Extracts the identifier text from a variable declaration `extraction-helpers.ts:423-423`
- **interfaceMethodModifier** — Interface method modifier property of a modifiers context `extraction-helpers.ts:60-60`
- **interfaceModifier** — Interface modifier property of a modifiers context `extraction-helpers.ts:58-58`
- **interfaces** — Represents the list of interfaces `extraction-helpers.ts:339-339`
- **isEntity** — A type alias for the `isEntity` property in the `JpaEntityInfo` interface `types.ts:55-55`
- **lastFormalParameter** — ANTLR context for the last formal parameter in a list `extraction-helpers.ts:95-95`
- **line** — Line number property of an ANTLR token `extraction-helpers.ts:28-28`
- **mappedBy** — A type alias for the `mappedBy` property in the `JpaEntityInfo` interface `types.ts:53-53`
- **markerAnnotation** — Represents a marker annotation in the ANTLR context `extraction-helpers.ts:226-226`
- **method** — A type alias for the `method` property in the `SpringAnnotationInfo` interface `types.ts:41-41`
- **methodModifier** — Method modifier property of a modifiers context `extraction-helpers.ts:59-59`
- **normalAnnotation** — Represents a normal annotation in the ANTLR context `extraction-helpers.ts:225-225`
- **path** — A type alias for the `path` property in the `SpringAnnotationInfo` interface `types.ts:40-40`
- **qualifiers** — A type alias for the `qualifiers` property in the `SpringAnnotationInfo` interface `types.ts:42-42`
- **relationships** — A type alias for the `relationships` property in the `JpaEntityInfo` interface `types.ts:50-54`
- **singleElementAnnotation** — Represents a single-element annotation in the ANTLR context `extraction-helpers.ts:228-228`
- **start** — Start position property of an ANTLR token `extraction-helpers.ts:30-30`
- **start** — Represents the start token in the ANTLR parser `extraction-helpers.ts:39-39`
- **stop** — Stop position property of an ANTLR token `extraction-helpers.ts:31-31`
- **stop** — Represents the stop token in the ANTLR parser `extraction-helpers.ts:40-40`
- **tableName** — A type alias for the `tableName` property in the `JpaEntityInfo` interface `types.ts:49-49`
- **targetEntity** — A type alias for the `targetEntity` property in the `JpaEntityInfo` interface `types.ts:52-52`
- **text** — Text content property of an ANTLR token `extraction-helpers.ts:32-32`
- **type** — A type alias for the `AnnotationInfo` type `types.ts:39-39`
- **type** — Represents the type of relationship, either "OneToMany", "ManyToOne", "OneToOne", or "ManyToMany" `types.ts:51-51`
- **typeName** — ANTLR context for the type name of an annotation `extraction-helpers.ts:71-71`
- **typeName** — Represents the type name of an annotation in the ANTLR context `extraction-helpers.ts:236-236`
- **typeName** — Extracts the type name from a marker annotation `extraction-helpers.ts:248-248`
- **typeName** — Extracts the type name from a single-element annotation `extraction-helpers.ts:253-253`
- **unannType** — ANTLR context for an unannotated type `extraction-helpers.ts:102-102`
- **unannType** — Represents an unannotated type in the Java AST `extraction-helpers.ts:393-393`
- **variableArityParameter** — Represents a variable arity parameter in the ANTLR context `extraction-helpers.ts:389-389`
- **variableDeclaratorId** — ANTLR context for a variable declarator identifier `extraction-helpers.ts:103-103`
- **variableModifier** — ANTLR context for a variable modifier `extraction-helpers.ts:104-104`

## Data Flow

- **Inputs**: ANTLR-generated Java AST context nodes from the Java20 grammar
- **Processing**: Traverses AST nodes to extract modifiers, annotations, inheritance info, parameters, and calls using type-safe wrappers around ANTLR contexts
- **Outputs**: Typed extraction results (`AnnotationInfo`, `InheritanceInfo`, `ParameterInfo`, `LocationInfo`, call lists)

## Public API

| Export | Type | Description | Location |
|--------|------|-------------|----------|
| `getLocation` | function | Extracts position information from an AST node | [`extraction-helpers.ts:114-132`](./extraction-helpers.ts) |
| `extractClassModifiers` | function | Gets modifiers from a class declaration | [`extraction-helpers.ts:159-161`](./extraction-helpers.ts) |
| `extractInterfaceModifiers` | function | Gets modifiers from an interface declaration | [`extraction-helpers.ts:167-169`](./extraction-helpers.ts) |
| `extractMethodModifiers` | function | Gets modifiers from a method declaration | [`extraction-helpers.ts:175-177`](./extraction-helpers.ts) |
| `extractInterfaceMethodModifiers` | function | Gets modifiers from an interface method | [`extraction-helpers.ts:183-185`](./extraction-helpers.ts) |
| `extractFieldModifiers` | function | Gets modifiers from a field declaration | [`extraction-helpers.ts:190-192`](./extraction-helpers.ts) |
| `extractConstructorModifiers` | function | Gets modifiers from a constructor | [`extraction-helpers.ts:197-199`](./extraction-helpers.ts) |
| `extractConstantModifiers` | function | Gets modifiers from a constant field | [`extraction-helpers.ts:204-206`](./extraction-helpers.ts) |
| `extractAnnotations` | function | Extracts annotations from class/enum modifiers | [`extraction-helpers.ts:216-273`](./extraction-helpers.ts) |
| `extractAnnotationsFromInterfaceModifiers` | function | Extracts annotations from interface modifiers | [`extraction-helpers.ts:278-282`](./extraction-helpers.ts) |
| `extractAnnotationsFromMethodModifiers` | function | Extracts annotations from method modifiers | [`extraction-helpers.ts:287-291`](./extraction-helpers.ts) |
| `extractAnnotationsFromFieldModifiers` | function | Extracts annotations from field modifiers | [`extraction-helpers.ts:296-300`](./extraction-helpers.ts) |
| `extractClassInheritance` | function | Gets class extends/implements information | [`extraction-helpers.ts:309-333`](./extraction-helpers.ts) |
| `extractInterfaceInheritance` | function | Gets interface extends information | [`extraction-helpers.ts:338-340`](./extraction-helpers.ts) |
| `extractMethodParameters` | function | Extracts parameters from a method | [`extraction-helpers.ts:363-404`](./extraction-helpers.ts) |
| `extractConstructorParameters` | function | Extracts parameters from a constructor | [`extraction-helpers.ts:409-434`](./extraction-helpers.ts) |
| `extractCalls` | function | Gets method calls via regex from body text | [`extraction-helpers.ts:465-484`](./extraction-helpers.ts) |
| `ParserContext` | interface | Context passed through Java parsing functions | [`types.ts:17-24`](./types.ts) |
| `LocationInfo` | type | Position information for AST nodes | [`types.ts:33-36`](./types.ts) |
| `CallInfo` | interface | Method/function call information | [`types.ts:45-62`](./types.ts) |
| `AnnotationInfo` | interface | Annotation extracted from modifiers | [`types.ts:71-74`](./types.ts) |
| `InheritanceInfo` | interface | Base classes and interfaces | [`types.ts:83-86`](./types.ts) |
| `ParameterInfo` | interface | Method/constructor parameter | [`types.ts:95-101`](./types.ts) |
| `ControlFlowInfo` | interface | Complete control flow structure | [`types.ts:144-149`](./types.ts) |
| `ComplexityMetrics` | interface | Code complexity metrics | [`types.ts:192-200`](./types.ts) |
| `SpringAnnotationInfo` | interface | Spring framework annotation info | [`types.ts:209-214`](./types.ts) |
| `JpaEntityInfo` | interface | JPA entity information | [`types.ts:219-227`](./types.ts) |
| `LombokInfo` | interface | Lombok annotation information | [`types.ts:232-240`](./types.ts) |

## Dependencies

### Internal Modules
| Module | Purpose |
|--------|---------|
| `../../generated/java/Java20Parser` | ANTLR-generated Java 20 parser context types |
| `../../types/parser` | Shared `ParsedEntity` and `EntityRelationship` types |

### External Packages
| Package | Purpose |
|---------|---------|
| `antlr4ng` | ANTLR4 runtime for TypeScript (parser contexts) |

## Behavioral Properties

| Property | Value |
|----------|-------|
| Thread Safety | Stateless functions, safe for concurrent use |
| Parser Grammar | Java SE 20 (ANTLR4 grammar) |
| Annotation handling | Supports marker, single-element, and normal annotations |

## Error Handling

Functions return empty arrays or default values when AST nodes are missing or null. No exceptions are thrown; all extraction is defensive with optional chaining.

## Known Limitations

- `extractCalls` in `extraction-helpers.ts` uses regex-based extraction (simple heuristic); the AST-based call extractor in `extractors/` is more accurate
- Generic type arguments in annotations are not deeply parsed
- Does not handle annotation processors or compile-time code generation

## Files

| File | Description |
|------|-------------|
| `index.ts` | Re-exports all Java parser modules |
| `types.ts` | Type definitions for parser context, calls, annotations, control flow, complexity, and framework patterns |
| `extraction-helpers.ts` | Helper functions for extracting modifiers, annotations, inheritance, parameters, and calls from ANTLR AST nodes |
