# tests/parsers

## 🤖 Overview

This module contains test suites for various language analyzers, including C, C++, Go, and others. Developers and QA engineers use it to validate the correctness of parser logic and code analysis features.

## 🤖 Architecture

```
  +-------------------+
  |   Language Tests  |
  +-------------------+
  |     C Tests       |
  |     C++ Tests     |
  |     Go Tests      |
  |     ...           |
  +-------------------+
  |   Parser Logic    |
  +-------------------+
  |     C Parser      |
  |     C++ Parser    |
  |     Go Parser     |
  |     ...           |
  +-------------------+
  |   Test Framework  |
  +-------------------+
```

## 🤖 Flow

```
  +-------------------+
  |   Test Case       |
  |     C Tests       |
  |     C++ Tests     |
  |     Go Tests      |
  |     ...           |
  +-------------------+
  |   Parser Logic    |
  +-------------------+
  |     C Parser      |
  |     C++ Parser    |
  |     Go Parser     |
  |     ...           |
  +-------------------+
  |   Test Execution  |
  +-------------------+
```

## 🤖 Entity Listing

### Function
- **actorEntity** — Represents an actor entity in the TypeScript parser `native-parsers.test.ts:868-868`
- **addCol** — Represents the addition of an email column to the users table `migration-detector.test.ts:177-177`
- **addFunc** — Represents the private function in the Go code `go-analyzer.test.ts:68-68`
- **addFunc** — Finds a function entity named "add" in the result entities `native-parsers.test.ts:457-457`
- **addFunc** — Not applicable in this context `native-parsers.test.ts:205-205`, `native-parsers.test.ts:590-590`
- **addFunc** — Not present in the provided code `native-parsers.test.ts:95-95`, `native-parsers.test.ts:784-784`
- **address** — Represents the Address message with fields street, city, and country `protobuf-parser.test.ts:97-97`
- **adminEmbeds** — Not present in the provided code `go-analyzer.test.ts:216-216`
- **analyticsCall** — Represents a call to analytics in the TypeScript parser `native-parsers.test.ts:963-963`
- **areaMethod** — Represents a specific method in the interface `go-analyzer.test.ts:136-136`
- **asyncFunc** — Not applicable in this context `native-parsers.test.ts:208-208`, `native-parsers.test.ts:594-594`
- **asyncFunc** — Not present in the provided code `native-parsers.test.ts:100-100`, `native-parsers.test.ts:788-788`
- **attr** — Represents an attribute node `rust-analyzer.test.ts:403-415`
- **attr** — Creates a mock node for an identifier with a specific name `rust-analyzer.test.ts:411-411`
- **auth** — A directive that requires a specific role to access a field `graphql-parser.test.ts:103-103`
- **avatarDrift** — Not present in the provided code `schema-drift-detector.test.ts:121-121`
- **avatarField** — Represents the field for storing avatar URLs in the users table `sql-parser.test.ts:159-159`
- **baseClass** — Represents the base class in the inheritance hierarchy `cpp-analyzer.test.ts:88-88`
- **borrowPattern** — Not applicable in the provided context `rust-analyzer.test.ts:235-235`
- **bracketOperator** — Represents the bracket operator in the C++ code `cpp-analyzer.test.ts:172-172`
- **builderPattern** — Not applicable in the provided context `rust-analyzer.test.ts:210-210`
- **callOperator** — Represents the call operator in the C++ code `cpp-analyzer.test.ts:174-174`
- **callRelations** — Not present in the provided code `go-analyzer.test.ts:255-255`
- **callsRelationships** — Represents calls to relationships in the TypeScript parser `native-parsers.test.ts:908-908`
- **callsRelationships** — Filters relationships to find those of type "calls" `native-parsers.test.ts:956-956`
- **child** — Represents the child relationship in the users table `sql-parser.test.ts:104-104`
- **classA** — Represents a class named A `cpp-analyzer.test.ts:407-407`
- **classEntity** — Represents a class entity in the C++ code `cpp-analyzer.test.ts:46-46`
- **classEntity** — Finds a class entity named "MyViewController" in the result entities `native-parsers.test.ts:411-411`, `native-parsers.test.ts:427-427`
- **classEntity** — Finds a class entity named "Config" in the result entities `native-parsers.test.ts:725-725`
- **classEntity** — Finds a class entity named "MyClass" in the result entities `native-parsers.test.ts:296-296`, `native-parsers.test.ts:829-829`
- **classEntity** — Represents a class declaration in the TypeScript parser `native-parsers.test.ts:191-191`, `native-parsers.test.ts:848-848`
- **classEntity** — Represents a class declaration in TypeScript `native-parsers.test.ts:64-64`
- **colorEnum** — Not present in the provided code `c-analyzer.test.ts:102-102`
- **colorEnum** — Represents an enum for colors `cpp-analyzer.test.ts:308-308`
- **complexMethod** — Represents a complex method in a class `cpp-analyzer.test.ts:281-281`
- **complexTemplate** — Represents a complex template in C++ `cpp-analyzer.test.ts:378-378`
- **constants** — Not present in the provided code `c-analyzer.test.ts:139-139`
- **constants** — Represents the constant definitions in the Go code `go-analyzer.test.ts:164-164`
- **constEntity** — Not applicable in this context `native-parsers.test.ts:649-649`
- **constMethod** — Represents a constant method in a class `cpp-analyzer.test.ts:272-272`
- **constructorMethod** — Represents a constructor method of the class `cpp-analyzer.test.ts:50-50`
- **createInput** — An input type for creating a user `graphql-parser.test.ts:156-156`
- **createMockAssociatedTypeNode** — Creates a mock associated type node `rust-analyzer.test.ts:486-499`
- **createMockBorrowingNode** — Creates a mock borrowing node `rust-analyzer.test.ts:565-567`
- **createMockBuilderNode** — Creates a mock builder node `rust-analyzer.test.ts:512-533`
- **createMockComplexNode** — Creates a mock complex node `rust-analyzer.test.ts:577-597`
- **createMockDeriveNode** — Creates a mock derive node for a struct `rust-analyzer.test.ts:398-422`
- **createMockEnumWithVariantsNode** — Creates a mock enum node with variants `rust-analyzer.test.ts:438-454`
- **createMockFunctionNode** — Creates a mock function node for testing function extraction `rust-analyzer.test.ts:302-315`
- **createMockGenericNode** — Not applicable in the provided context `rust-analyzer.test.ts:380-396`
- **createMockImplNode** — Not applicable in the provided context `rust-analyzer.test.ts:317-332`
- **createMockIteratorNode** — Creates a mock iterator node `rust-analyzer.test.ts:535-554`
- **createMockLifetimeAnnotationNode** — Creates a mock lifetime annotation node `rust-analyzer.test.ts:573-575`
- **createMockLifetimeNode** — Not applicable in the provided context `rust-analyzer.test.ts:365-378`
- **createMockNestedModuleNode** — Not applicable in the provided context `rust-analyzer.test.ts:350-363`
- **createMockNode** — Creates a mock node for testing entity extraction `rust-analyzer.test.ts:270-300`
- **createMockResultNode** — Creates a mock result node `rust-analyzer.test.ts:556-563`
- **createMockStructWithFieldsNode** — Creates a mock struct node with fields `rust-analyzer.test.ts:456-469`
- **createMockTraitExtensionNode** — Not applicable in the provided context `rust-analyzer.test.ts:334-348`
- **createMockTraitWithMethodsNode** — Creates a mock trait node with methods `rust-analyzer.test.ts:471-484`
- **createMockUnsafeNode** — Creates a mock unsafe node `rust-analyzer.test.ts:569-571`
- **createMockUseNode** — Creates a mock use node `rust-analyzer.test.ts:501-510`
- **createMockVisibilityNode** — Creates a mock visibility node `rust-analyzer.test.ts:424-436`
- **createUser** — Represents a request to create a user `protobuf-parser.test.ts:248-248`
- **dapperLink** — Finds a link with ORM set to "dapper" `orm-detector.test.ts:177-177`
- **dateTime** — Represents a scalar type for date and time `graphql-parser.test.ts:94-94`
- **derivedClass** — Represents the derived class in the inheritance hierarchy `cpp-analyzer.test.ts:92-92`
- **destructor** — Represents a destructor method of the class `cpp-analyzer.test.ts:54-54`
- **ds** — Represents a datasource entity in the Prisma schema `prisma-parser.test.ts:56-56`
- **email** — Represents the email column in the users table `sql-parser.test.ts:87-87`
- **emailField** — Represents an email field in the Prisma schema `prisma-parser.test.ts:89-89`
- **embedRelations** — Represents the embedded relations in the Go code `go-analyzer.test.ts:213-213`
- **enableIfFunc** — Represents a function with conditional compilation `cpp-analyzer.test.ts:242-242`
- **entity** — Tests the extraction of entities such as structs, enums, and traits `rust-analyzer.test.ts:128-128`
- **entity** — Finds a struct entity in the result entities `rust-analyzer.test.ts:136-136`
- **entity** — rust-analyzer.test.ts:144-144` — Finds the entity of type "struct" from the result entities `rust-analyzer.test.ts:144-144`
- **enumEntity** — Not applicable in this context `native-parsers.test.ts:328-328`, `native-parsers.test.ts:561-561`
- **enumEntity** — Not present in the provided code `native-parsers.test.ts:138-138`, `native-parsers.test.ts:767-767`
- **enumEntity** — Tests the extraction of enum entities `rust-analyzer.test.ts:169-169`
- **enums** — Not present in the provided code `c-analyzer.test.ts:99-99`
- **enums** — Defines enums in the GraphQL schema `graphql-parser.test.ts:308-308`
- **enums** — Filters entities with protoType "enum" `protobuf-parser.test.ts:299-299`
- **extended** — Not applicable in this context `graphql-parser.test.ts:235-235`
- **extEntity** — Represents an entity in the TypeScript parser `native-parsers.test.ts:815-815`
- **externFunc** — Not present in the provided code `c-analyzer.test.ts:207-207`
- **externVar** — Not present in the provided code `c-analyzer.test.ts:212-212`
- **extFunc** — Not applicable in this context `native-parsers.test.ts:500-500`
- **extRel** — Represents external relationships in the GraphQL schema `graphql-parser.test.ts:240-240`
- **f1** — Represents the function "add" in the first parsed code `parser-cache.test.ts:35-35`
- **f2** — Represents the function "sub" in the second parsed code `parser-cache.test.ts:36-36`
- **faxField** — Represents a field in the User message for fax number `protobuf-parser.test.ts:159-159`
- **fieldNames** — Contains the names of the fields in the struct `go-analyzer.test.ts:121-121`
- **fieldRefs** — References fields in the GraphQL schema `graphql-parser.test.ts:253-253`
- **fields** — Contains the fields of the struct in the Go code `go-analyzer.test.ts:119-119`
- **finalClass** — Represents a final class in the inheritance hierarchy `cpp-analyzer.test.ts:111-111`
- **finalMethod** — Represents a final method in the derived class `cpp-analyzer.test.ts:98-98`
- **fkRel** — Represents a foreign key relationship `sql-parser.test.ts:185-185`
- **func** — Tests the extraction of functions, including both synchronous and asynchronous functions `rust-analyzer.test.ts:50-50`
- **func** — Finds a function entity in the result entities `rust-analyzer.test.ts:59-59`
- **func** — rust-analyzer.test.ts:161-161` — Finds the entity of type "function" from the result entities `rust-analyzer.test.ts:161-161`
- **func** — Represents the function in the SQL schema `sql-parser.test.ts:138-138`
- **functionNames** — Filters entities to extract function names `c-analyzer.test.ts:49-49`
- **functionNames** — Filters and maps function entities from the result `c-analyzer.test.ts:49-49`
- **functionNames** — Maps each function to its name `go-analyzer.test.ts:260-260`
- **functionNames** — Contains the names of the functions in the Go code `go-analyzer.test.ts:58-58`
- **functionNames** — Not present in the provided code `go-analyzer.test.ts:58-58`
- **functions** — Not present in the provided code `c-analyzer.test.ts:182-182`
- **functions** — Tests the GoAnalyzer to parse basic Go functions and packages, checking for correct entities and their metadata `go-analyzer.test.ts:259-259`
- **gen** — Represents a generator entity in the Prisma schema `prisma-parser.test.ts:65-65`
- **getUser** — Represents a request to get a user by ID `protobuf-parser.test.ts:176-176`
- **getUser** — Finds the entity named "GetUser" in the result entities `protobuf-parser.test.ts:243-243`
- **globalCounterVar** — Represents a specific variable in the Go code `go-analyzer.test.ts:179-179`
- **hasAB** — Not present in the provided code snippet `python-analyzer.test.ts:131-134`
- **hasAB** — Parses the results to check if any cycle contains both "A" and "B" `python-analyzer.test.ts:177-180`
- **idField** — Not applicable in this context `graphql-parser.test.ts:133-133`
- **idField** — Represents an ID field in the Prisma schema `prisma-parser.test.ts:85-85`
- **idField** — Represents the id field in the organization table `sql-parser.test.ts:73-73`
- **idx** — Represents the index in the users table `sql-parser.test.ts:116-116`
- **implBlocks** — Not applicable in this context `native-parsers.test.ts:638-638`
- **implRels** — Implements relationships in the GraphQL schema `graphql-parser.test.ts:248-248`
- **implRels** — Not applicable in this context `graphql-parser.test.ts:150-150`
- **importPaths** — Contains the import paths in the Go code `go-analyzer.test.ts:75-75`
- **imports** — Contains the import paths in the Go code `go-analyzer.test.ts:73-73`
- **imports** — Filters entities to find those of type "import" `native-parsers.test.ts:344-344`, `native-parsers.test.ts:477-477`
- **imports** — Imports necessary modules for testing `native-parsers.test.ts:222-222`, `native-parsers.test.ts:607-607`
- **imports** — Imports necessary modules for testing TypeScript parsers `native-parsers.test.ts:113-113`, `native-parsers.test.ts:801-801`
- **inc1** — Contains the import "stdio.h" from the first parsed code `parser-cache.test.ts:40-40`
- **inc1** — Filters and maps import relationships from r1 to their targets `parser-cache.test.ts:40-40`
- **inc2** — Contains the import "stdlib.h" from the second parsed code `parser-cache.test.ts:41-41`
- **inc2** — Filters and maps import relationships from r2 to their targets `parser-cache.test.ts:41-41`
- **includePaths** — Not present in the provided code `c-analyzer.test.ts:251-251`
- **includes** — Filters relationships to find include statements `c-analyzer.test.ts:60-60`
- **includes** — Filters import relationships from the result `c-analyzer.test.ts:248-248`
- **innerNamespace** — Represents an inner namespace within another namespace `cpp-analyzer.test.ts:146-146`
- **interfaceEntity** — Finds an interface entity named "Service" in the result entities `native-parsers.test.ts:312-312`, `native-parsers.test.ts:443-443`
- **interfaceEntity** — Represents an interface declaration in TypeScript `native-parsers.test.ts:79-79`
- **interfaces** — Represents the interface definitions in the Go code `go-analyzer.test.ts:126-126`
- **isLoadingState** — Represents the loading state in the TypeScript parser `native-parsers.test.ts:990-990`
- **iteratorPattern** — Not applicable in the provided context `rust-analyzer.test.ts:219-219`
- **l2dbLink** — Finds a link with ORM set to "linq2db" `orm-detector.test.ts:195-195`
- **legacyDrift** — Not present in the provided code `schema-drift-detector.test.ts:144-144`
- **lifetimePattern** — Not applicable in the provided context `rust-analyzer.test.ts:251-251`
- **limitArg** — Not applicable in this context `graphql-parser.test.ts:217-217`
- **listUsers** — Represents a request to list users `protobuf-parser.test.ts:187-187`
- **loadUserProfileCalls** — Represents calls to load user profile in the TypeScript parser `native-parsers.test.ts:913-913`
- **loadUserProfileFunc** — Represents a function to load user profile in the TypeScript parser `native-parsers.test.ts:918-918`
- **loginFunc** — Represents a function to log in in the TypeScript parser `native-parsers.test.ts:1063-1063`
- **macroEntity** — Not applicable in this context `native-parsers.test.ts:668-668`
- **macros** — Not present in the provided code `c-analyzer.test.ts:132-132`
- **makeEntity** — Creates a mock entity with default properties and optional overrides `db-code-linker.test.ts:9-20`
- **makeEntity** — Creates an entity with default values and optional overrides `graphql-code-linker.test.ts:5-15`
- **makeEntity** — Creates a test entity with specified overrides `orm-detector.test.ts:9-20`
- **makeEntity** — Creates a mock entity with default values and optional overrides `protobuf-code-linker.test.ts:8-18`
- **maxFunc** — Not present in the provided code `c-analyzer.test.ts:202-202`
- **maxFunc** — Represents a function to find the maximum value `cpp-analyzer.test.ts:213-213`
- **messages** — Filters entities with protoType "message" `protobuf-parser.test.ts:293-293`
- **metadataField** — Represents the metadata field in the User message `protobuf-parser.test.ts:127-127`
- **methodEntity** — Extracts LINQ method syntax referenced tables from the parsed entities `linq-parser.test.ts:57-57`
- **methods** — Contains the methods of the interface in the Go code `go-analyzer.test.ts:133-133`
- **methods** — Not applicable in the provided context `rust-analyzer.test.ts:185-185`
- **mkImp** — Not present in the provided code snippet `python-analyzer.test.ts:140-148`
- **mockEntity** — Creates a mock Entity with specified name, filePath, and metadata `schema-drift-detector.test.ts:11-20`
- **mockMigrationSchema** — Creates a MigrationSchema with tables and their columns `schema-drift-detector.test.ts:23-42`
- **module** — Represents the parsed module metadata including query kind, connection, and nuget references `linq-parser.test.ts:36-36`
- **modules** — Not applicable in this context `native-parsers.test.ts:618-618`
- **msg** — Finds the entity named "OldMessage" `protobuf-parser.test.ts:272-272`
- **msgToEnum** — Filters references with context "message field type" and includes "UserStatus" `protobuf-parser.test.ts:209-209`
- **msgToMsg** — Filters references with context "message field type" and includes "Address" `protobuf-parser.test.ts:215-215`
- **mutation** — A type representing a mutation operation `graphql-parser.test.ts:192-192`
- **namespace** — Represents a namespace in the C++ code `cpp-analyzer.test.ts:135-135`
- **nestedClass** — Represents a nested class within another class `cpp-analyzer.test.ts:140-140`
- **node** — An interface that defines a common structure for nodes `graphql-parser.test.ts:126-126`
- **noexceptMethod** — Represents a noexcept method in a class `cpp-analyzer.test.ts:278-278`
- **objectEntity** — Not applicable in this context `native-parsers.test.ts:490-490`
- **operations** — Defines operations in the GraphQL schema `graphql-parser.test.ts:292-295`
- **org** — Represents the organization table in the SQL schema `sql-parser.test.ts:60-60`
- **org** — Finds the entity named "organizations" in the result `sql-parser.test.ts:71-71`
- **ormLink** — Creates an ORM link between a database entity and a code entity `schema-drift-detector.test.ts:45-55`
- **overrideMethod** — Represents an overridden method in the derived class `cpp-analyzer.test.ts:95-95`
- **packageEntity** — Not present in the provided code `native-parsers.test.ts:356-356`
- **packages** — Represents the package name in the Go code `go-analyzer.test.ts:53-53`
- **phoneField** — Represents the phone field in the oneofGroup of the User message `protobuf-parser.test.ts:155-155`
- **pkg** — Represents the package entity parsed from the protobuf file `protobuf-parser.test.ts:73-73`
- **plusOperator** — Represents the plus operator in the C++ code `cpp-analyzer.test.ts:168-168`
- **pointStruct** — Represents a specific struct in the Go code `go-analyzer.test.ts:114-114`
- **post** — Represents a post model in the Prisma schema `prisma-parser.test.ts:105-105`
- **postMobileConnect** — Represents a function to post mobile connect in the TypeScript parser `native-parsers.test.ts:946-946`
- **prefs** — Represents the Preferences message with fields notifications and theme `protobuf-parser.test.ts:136-136`
- **printFunc** — Finds the entity named "print_result" `c-analyzer.test.ts:55-55`
- **printFunc** — Represents the exported function in the Go code `go-analyzer.test.ts:64-64`
- **privateField** — Represents a private field of the class `cpp-analyzer.test.ts:63-63`
- **processDataFunc** — Represents a function to process data in the TypeScript parser `native-parsers.test.ts:1025-1025`
- **properties** — Represents properties of an entity in the TypeScript parser `native-parsers.test.ts:852-852`
- **protocolEntity** — Not applicable in this context `native-parsers.test.ts:753-753`
- **publicMethod** — Represents a public method of the class `cpp-analyzer.test.ts:58-58`
- **queries** — Not applicable in this context `linq-parser.test.ts:105-105`
- **query** — A type representing a query operation `graphql-parser.test.ts:184-184`
- **queryEntity** — Extracts LINQ query syntax referenced tables from the parsed entities `linq-parser.test.ts:47-47`
- **rawSql** — Extracts raw SQL string referenced tables from the parsed entities `linq-parser.test.ts:66-66`
- **rawSql** — Finds the entity with metadata indicating it is raw SQL `linq-parser.test.ts:79-79`
- **rectangle** — Not present in the provided code `c-analyzer.test.ts:93-93`
- **redValue** — Represents a value for the red color `cpp-analyzer.test.ts:312-312`
- **rels** — Represents relationships in the Prisma schema `prisma-parser.test.ts:95-95`
- **resultPattern** — Not applicable in the provided context `rust-analyzer.test.ts:227-227`
- **role** — An enum representing different user roles `graphql-parser.test.ts:112-112`
- **role** — Represents an enum role in the Prisma schema `prisma-parser.test.ts:112-112`
- **rpcRefs** — Filters references with context "rpc request type" `protobuf-parser.test.ts:203-203`
- **rpcs** — Filters entities with protoType "rpc" `protobuf-parser.test.ts:287-287`
- **serverNameVar** — Represents a specific variable in the Go code `go-analyzer.test.ts:175-175`
- **serverPosterCall** — Represents a call to a server poster in the TypeScript parser `native-parsers.test.ts:959-959`
- **service** — Defines a service in the UserService `protobuf-parser.test.ts:166-166`
- **services** — Filters entities with protoType "service" `protobuf-parser.test.ts:281-281`
- **shapeInterface** — Represents a specific interface in the Go code `go-analyzer.test.ts:129-129`
- **simpleClass** — Represents a simple class in the C++ code `cpp-analyzer.test.ts:249-249`
- **simpleClass** — Finds the entity named "SimpleClass" of type "class" in the result entities `native-parsers.test.ts:241-241`
- **st** — Not applicable in the provided context `rust-analyzer.test.ts:88-88`
- **standaloneFunc** — Represents a standalone function in the C++ code `cpp-analyzer.test.ts:143-143`
- **startTestFunc** — Represents a function to start tests in the TypeScript parser `native-parsers.test.ts:937-937`
- **stateProps** — Represents state properties in the TypeScript parser `native-parsers.test.ts:986-986`
- **stateRefs** — Represents state references in the TypeScript parser `native-parsers.test.ts:1076-1076`
- **staticEntity** — Not applicable in this context `native-parsers.test.ts:652-652`
- **staticMethod** — Represents a static method in a class `cpp-analyzer.test.ts:275-275`
- **status** — Represents the status column in the users table `sql-parser.test.ts:91-91`
- **statusDrift** — Not present in the provided code `schema-drift-detector.test.ts:159-159`
- **statusEnum** — Represents an enum for statuses `cpp-analyzer.test.ts:317-317`
- **structEntity** — Not applicable in this context `native-parsers.test.ts:546-546`
- **structEntity** — Finds a struct entity named "User" in the result entities `native-parsers.test.ts:740-740`
- **structs** — Not present in the provided code `c-analyzer.test.ts:89-89`
- **structs** — Represents the struct definitions in the Go code `go-analyzer.test.ts:110-110`
- **sub** — Not applicable in this context `graphql-parser.test.ts:200-200`
- **suspendFunc** — Not applicable in this context `native-parsers.test.ts:461-461`
- **swapFunc** — Represents a function to swap two values `cpp-analyzer.test.ts:217-217`
- **table** — Represents a database table `sql-parser.test.ts:171-171`
- **table** — Finds the entity named "events" in the result `sql-parser.test.ts:209-209`
- **tagsField** — Represents the tags field in the User message `protobuf-parser.test.ts:123-123`
- **templateClass** — Represents a template class in the C++ code `cpp-analyzer.test.ts:194-194`
- **trackEvent** — Represents a function to track events in the TypeScript parser `native-parsers.test.ts:951-951`
- **traitEntity** — Not applicable in this context `native-parsers.test.ts:574-574`
- **trigger** — Represents the trigger in the SQL schema `sql-parser.test.ts:147-147`
- **typedefs** — Not present in the provided code `c-analyzer.test.ts:110-110`
- **typedefs** — Filters type entities from the result `c-analyzer.test.ts:178-178`
- **typedefs** — Represents the type definitions in the Go code `go-analyzer.test.ts:206-206`
- **typeDrift** — Not present in the provided code `schema-drift-detector.test.ts:176-176`
- **typeEntity** — Represents a type entity in the TypeScript parser `native-parsers.test.ts:879-879`
- **typeEntity** — Not present in the provided code `native-parsers.test.ts:124-124`
- **types** — Defines types in the GraphQL schema `graphql-parser.test.ts:302-302`
- **union** — A union type representing a search result that can be either a user or a post `graphql-parser.test.ts:165-165`
- **unionRefs** — References unions in the GraphQL schema `graphql-parser.test.ts:258-258`
- **unionRefs** — Not applicable in this context `graphql-parser.test.ts:177-177`
- **unions** — Not present in the provided code `c-analyzer.test.ts:156-156`
- **uniqueIdx** — Represents the unique index in the users table `sql-parser.test.ts:122-122`
- **unsafePattern** — Not applicable in the provided context `rust-analyzer.test.ts:243-243`
- **updateUser** — Represents a request to update a user `protobuf-parser.test.ts:192-192`
- **user** — Defines the User type in the GraphQL schema `graphql-parser.test.ts:281-281`
- **user** — A type representing a user with various fields and relationships `graphql-parser.test.ts:140-140`
- **user** — Represents a user model in the Prisma schema `prisma-parser.test.ts:72-72`
- **user** — Finds the User entity in the result entities with a specific dbType `prisma-parser.test.ts:101-101`
- **user** — Represents the User message with fields id, name, email, status, address, tags, metadata, created_at, and contact `protobuf-parser.test.ts:112-112`
- **user** — Finds the entity named "User" in the result entities `protobuf-parser.test.ts:149-149`
- **userDataState** — Represents user data state in the TypeScript parser `native-parsers.test.ts:994-994`
- **userIDType** — Represents a specific type definition in the Go code `go-analyzer.test.ts:209-209`
- **users** — Represents the users table in the SQL schema `sql-parser.test.ts:79-79`
- **users** — Finds the entity named "users" in the result `sql-parser.test.ts:157-157`
- **usersField** — A field representing a list of users `graphql-parser.test.ts:210-210`
- **usersField** — Finds the field named "users" with metadata type "field" `graphql-parser.test.ts:226-226`
- **userStatus** — Represents the enum entity with values USER_STATUS_UNSPECIFIED, ACTIVE, and INACTIVE `protobuf-parser.test.ts:81-81`
- **variables** — Represents the variable definitions in the Go code `go-analyzer.test.ts:172-172`
- **variadicFunc** — Represents a function with variable arguments `cpp-analyzer.test.ts:245-245`
- **versionConst** — Represents a specific constant in the Go code `go-analyzer.test.ts:167-167`
- **view** — Represents the view in the SQL schema `sql-parser.test.ts:128-128`
- **virtualMethod** — Represents a virtual method in a class `cpp-analyzer.test.ts:285-285`

### Import_decl
- **../../src/parsers/c-analyzer.js** — Imports `../../src/parsers/c-analyzer.js` from `../../src/parsers/c-analyzer.js`. `c-analyzer.test.ts:8-8`
- **../../src/parsers/cpp-analyzer.js** — Imports `../../src/parsers/cpp-analyzer.js` from `../../src/parsers/cpp-analyzer.js`. `cpp-analyzer.test.ts:13-13`
- **../../src/parsers/db/db-code-linker.js** — Imports `../../src/parsers/db/db-code-linker.js` from `../../src/parsers/db/db-code-linker.js`. `db-code-linker.test.ts:6-6`
- **../../src/parsers/db/linq-parser.js** — Imports `../../src/parsers/db/linq-parser.js` from `../../src/parsers/db/linq-parser.js`. `linq-parser.test.ts:6-6`
- **../../src/parsers/db/migration-detector.js** — Imports `../../src/parsers/db/migration-detector.js`. `migration-detector.test.ts:6-10`
- **../../src/parsers/db/orm-detector.js** — Imports `../../src/parsers/db/orm-detector.js` from `../../src/parsers/db/orm-detector.js`. `orm-detector.test.ts:6-6`
- **../../src/parsers/db/prisma-parser.js** — Imports `../../src/parsers/db/prisma-parser.js` from `../../src/parsers/db/prisma-parser.js`. `prisma-parser.test.ts:6-6`
- **../../src/parsers/db/schema-drift-detector.js** — Imports `../../src/parsers/db/schema-drift-detector.js` from `../../src/parsers/db/schema-drift-detector.js`. `schema-drift-detector.test.ts:6-6`
- **../../src/parsers/db/sql-parser.js** — Imports `../../src/parsers/db/sql-parser.js` from `../../src/parsers/db/sql-parser.js`. `sql-parser.test.ts:6-6`
- **../../src/parsers/db/types.js** — Imports `../../src/parsers/db/types.js` from `../../src/parsers/db/types.js`. `schema-drift-detector.test.ts:7-7`
- **../../src/parsers/go-analyzer.js** — Imports `../../src/parsers/go-analyzer.js` from `../../src/parsers/go-analyzer.js`. `go-analyzer.test.ts:8-8`
- **../../src/parsers/graphql/graphql-code-linker.js** — Imports `../../src/parsers/graphql/graphql-code-linker.js` from `../../src/parsers/graphql/graphql-code-linker.js`. `graphql-code-linker.test.ts:2-2`
- **../../src/parsers/graphql/graphql-parser.js** — Imports `../../src/parsers/graphql/graphql-parser.js` from `../../src/parsers/graphql/graphql-parser.js`. `graphql-parser.test.ts:2-2`
- **../../src/parsers/java-native-parser.js** — Imports `../../src/parsers/java-native-parser.js` from `../../src/parsers/java-native-parser.js`. `native-parsers.test.ts:8-8`
- **../../src/parsers/kotlin-native-parser.js** — Imports `../../src/parsers/kotlin-native-parser.js` from `../../src/parsers/kotlin-native-parser.js`. `native-parsers.test.ts:9-9`
- **../../src/parsers/protobuf/protobuf-code-linker.js** — Imports `../../src/parsers/protobuf/protobuf-code-linker.js`. `protobuf-code-linker.test.ts:2-5`
- **../../src/parsers/protobuf/protobuf-parser.js** — Imports `../../src/parsers/protobuf/protobuf-parser.js` from `../../src/parsers/protobuf/protobuf-parser.js`. `protobuf-parser.test.ts:2-2`
- **../../src/parsers/python-analyzer.js** — Imports `../../src/parsers/python-analyzer.js` from `../../src/parsers/python-analyzer.js`. `python-analyzer.test.ts:10-10`
- **../../src/parsers/python-native-parser.js** — Imports `../../src/parsers/python-native-parser.js` from `../../src/parsers/python-native-parser.js`. `native-parsers.test.ts:10-10`
- **../../src/parsers/rust-analyzer** — Imports `../../src/parsers/rust-analyzer` from `../../src/parsers/rust-analyzer`. `rust-analyzer.test.ts:12-12`
- **../../src/parsers/rust-native-parser.js** — Imports `../../src/parsers/rust-native-parser.js` from `../../src/parsers/rust-native-parser.js`. `native-parsers.test.ts:11-11`
- **../../src/parsers/swift-native-parser.js** — Imports `../../src/parsers/swift-native-parser.js` from `../../src/parsers/swift-native-parser.js`. `native-parsers.test.ts:12-12`
- **../../src/parsers/typescript-parser.js** — Imports `../../src/parsers/typescript-parser.js` from `../../src/parsers/typescript-parser.js`. `native-parsers.test.ts:13-13`
- **../../src/types/parser** — Imports `../../src/types/parser` from `../../src/types/parser`. `rust-analyzer.test.ts:13-13`
- **../../src/types/storage.js** — Imports `../../src/types/storage.js` from `../../src/types/storage.js`. `db-code-linker.test.ts:7-7`, `graphql-code-linker.test.ts:3-3`, `orm-detector.test.ts:7-7`, `protobuf-code-linker.test.ts:6-6`, `schema-drift-detector.test.ts:8-8`
- **bun:test** — Imports `bun:test` from `bun:test`. `c-analyzer.test.ts:7-7`, `cpp-analyzer.test.ts:12-12`, `db-code-linker.test.ts:5-5`, `go-analyzer.test.ts:7-7`, `graphql-code-linker.test.ts:1-1`, `graphql-parser.test.ts:1-1`, `linq-parser.test.ts:5-5`, `migration-detector.test.ts:5-5`, `native-parsers.test.ts:7-7`, `orm-detector.test.ts:5-5`, `parser-cache.test.ts:1-1`, `prisma-parser.test.ts:5-5`, `protobuf-code-linker.test.ts:1-1`, `protobuf-parser.test.ts:1-1`, `python-analyzer.test.ts:9-9`, `rust-analyzer.test.ts:11-11`, `schema-drift-detector.test.ts:5-5`, `sql-parser.test.ts:5-5`

### Property
- **autoIncrement** — Represents an auto-increment field in the Prisma schema `prisma-parser.test.ts:81-81`
- **columns** — Represents columns in the Prisma schema `prisma-parser.test.ts:102-102`
- **columns** — Represents the columns of a table `schema-drift-detector.test.ts:24-24`
- **default** — Indicates the default value for the name column in the users table `sql-parser.test.ts:84-84`
- **defaultValue** — Not applicable in this context `graphql-parser.test.ts:214-214`
- **isNonNull** — Not applicable in this context `graphql-parser.test.ts:131-131`
- **mapKey** — Represents the map key field in the User message `protobuf-parser.test.ts:119-119`
- **mapValue** — Represents the map value field in the User message `protobuf-parser.test.ts:120-120`
- **name** — A field representing the name of a user `graphql-parser.test.ts:131-131`
- **name** — Extracts the name of the argument from the metadata `graphql-parser.test.ts:214-214`
- **name** — Represents a field name in the Prisma schema `prisma-parser.test.ts:77-77`
- **name** — Extracts the name of the index from the user's metadata `prisma-parser.test.ts:102-102`
- **name** — Represents the name field in the User message `protobuf-parser.test.ts:87-87`
- **name** — Extracts the name field from the fields array `protobuf-parser.test.ts:103-103`
- **name** — Represents the name field as a string `protobuf-parser.test.ts:116-116`
- **name** — Extracts fields from metadata `protobuf-parser.test.ts:141-141`
- **name** — Represents a field name `protobuf-parser.test.ts:151-151`
- **name** — Represents the name of a column or table `schema-drift-detector.test.ts:24-24`
- **name** — Represents a map of column names to their types and nullable status `schema-drift-detector.test.ts:24-24`
- **name** — Initializes a map to store column names, types, and nullable status `schema-drift-detector.test.ts:28-28`
- **name** — Represents a string property `sql-parser.test.ts:81-81`, `sql-parser.test.ts:158-158`
- **name** — Represents the name column in the organization table `sql-parser.test.ts:64-64`
- **name** — Represents the name of a database entity `sql-parser.test.ts:72-72`
- **nullable** — Indicates whether a column is nullable `schema-drift-detector.test.ts:24-24`
- **nullable** — Represents a nullable boolean in a column definition `schema-drift-detector.test.ts:28-28`
- **nullable** — Indicates whether the name column is nullable in the users table `sql-parser.test.ts:82-82`
- **number** — Represents the number field in the User message `protobuf-parser.test.ts:87-87`
- **number** — Extracts the number field from the fields array `protobuf-parser.test.ts:103-103`
- **onDelete** — Represents the on delete constraint in the child relationship `sql-parser.test.ts:107-107`
- **oneofGroup** — Represents the oneofGroup in the User message `protobuf-parser.test.ts:152-152`
- **primaryKey** — Represents a primary key field in the Prisma schema `prisma-parser.test.ts:79-79`
- **primaryKey** — Indicates the primary key field in the organization table `sql-parser.test.ts:72-72`
- **refTable** — Represents the referenced table in the child relationship `sql-parser.test.ts:106-106`
- **repeated** — Represents the repeated field in the User message `protobuf-parser.test.ts:118-118`
- **type** — A field representing the type of a user `graphql-parser.test.ts:131-131`
- **type** — Extracts the type of the argument from the metadata `graphql-parser.test.ts:214-214`
- **type** — Represents a field type in the Prisma schema `prisma-parser.test.ts:78-78`
- **type** — Represents the type field in the User message `protobuf-parser.test.ts:103-103`
- **type** — Represents the type field as a string `protobuf-parser.test.ts:117-117`
- **type** — Extracts the type field from the fields array `protobuf-parser.test.ts:141-141`
- **type** — Represents the data type of a column `schema-drift-detector.test.ts:24-24`
- **type** — Represents a map of column names to their types and nullable status `schema-drift-detector.test.ts:28-28`
- **type** — Represents the type of the organization table `sql-parser.test.ts:64-64`
- **unique** — Represents a unique constraint field in the Prisma schema `prisma-parser.test.ts:80-80`
- **unique** — Indicates whether the name column is unique in the users table `sql-parser.test.ts:83-83`

### embedded_sql
- **ALTER TABLE users ADD COLUMN email VARCHAR(255);** — Parses the SQL statement to extract migration operations `migration-detector.test.ts:176-176`
- **CREATE TABLE events ( event_date Date, user_id UInt64, action String ) ENGINE = MergeTree() ORDER BY** — Parses a SQL statement with a MergeTree engine and ordering `sql-parser.test.ts:199-207`
- **CREATE TABLE parent (id INT PRIMARY KEY); CREATE TABLE child ( id INT PRIMARY KEY, parent_id INT, FO** — Parses a SQL statement with a foreign key constraint `sql-parser.test.ts:96-102`
- **CREATE TABLE parent (id INT PRIMARY KEY); CREATE TABLE child ( id INT PRIMARY KEY, parent_id INT, FO** — Defines SQL statements for creating tables parent and child with a foreign key constraint `sql-parser.test.ts:176-182`
- **CREATE TABLE products (id INT PRIMARY KEY, name TEXT)** — Parses a SQL statement to create a products table with id and name columns `db-code-linker.test.ts:92-92`
- **CREATE TABLE users (id INT); CREATE TABLE posts (id INT);** — Parses the SQL statements to extract migration operations `migration-detector.test.ts:163-163`
- **DROP TABLE IF EXISTS users;** — Parses the SQL statement to extract migration operations `migration-detector.test.ts:169-169`

## Language Analyzer Test Suites

### C Language (c-analyzer.test.ts)

- **parser** — `c-analyzer.test.ts:13-258` — Complete C language analyzer test suite validating parsing of functions, static declarations, macros, and include handling.
- **parser** — `c-analyzer.test.ts:17-21` — Parser initialization and setup.
- **code** — `c-analyzer.test.ts:23-63` — Test input: basic C functions with static modifiers and declarations.
- **e** — `c-analyzer.test.ts:49-49` — Extracted function entity from test.
- **e** — `c-analyzer.test.ts:55-55` — Extracted static function entity.
- **r** — `c-analyzer.test.ts:60-60` — Parse result verification.
- **code** — `c-analyzer.test.ts:65-112` — Test input: struct definitions, typedefs, and pointer declarations.
- **e** — `c-analyzer.test.ts:89-89` — Struct entity extraction.
- **e** — `c-analyzer.test.ts:93-93` — Typedef entity extraction.
- **e** — `c-analyzer.test.ts:99-99` — Pointer type entity.
- **e** — `c-analyzer.test.ts:102-102` — Nested field entity.
- **c** — `c-analyzer.test.ts:105-105` — Field count assertion.
- **c** — `c-analyzer.test.ts:106-106` — Field name assertion.
- **c** — `c-analyzer.test.ts:107-107` — Field type assertion.
- **e** — `c-analyzer.test.ts:110-110` — Union type entity.
- **code** — `c-analyzer.test.ts:114-141` — Test input: macro definitions and preprocessor directives.
- **e** — `c-analyzer.test.ts:132-132` — Macro entity extraction.
- **e** — `c-analyzer.test.ts:135-135` — Define macro entity.
- **e** — `c-analyzer.test.ts:136-136` — Function-like macro entity.
- **e** — `c-analyzer.test.ts:139-139` — Preprocessor if entity.
- **c** — `c-analyzer.test.ts:140-140` — Macro count assertion.
- **code** — `c-analyzer.test.ts:143-159` — Test input: external function declarations.
- **e** — `c-analyzer.test.ts:156-156` — External function entity.
- **code** — `c-analyzer.test.ts:161-185` — Test input: variable declarations with different scopes.
- **e** — `c-analyzer.test.ts:178-178` — Global variable entity.
- **t** — `c-analyzer.test.ts:179-179` — Variable type assertion.
- **e** — `c-analyzer.test.ts:182-182` — Static variable entity.
- **f** — `c-analyzer.test.ts:183-183` — Static modifier flag.
- **f** — `c-analyzer.test.ts:184-184` — Extern modifier flag.
- **code** — `c-analyzer.test.ts:187-214` — Test input: include statements and header references.
- **e** — `c-analyzer.test.ts:202-202` — Maximum function length entity.
- **e** — `c-analyzer.test.ts:207-207` — External function reference.
- **e** — `c-analyzer.test.ts:212-212` — External variable reference.
- **Create** — `c-analyzer.test.ts:216-232` — Factory function creating mock C entities for testing.
- **code** — `c-analyzer.test.ts:234-257` — Test input: edge cases and boundary conditions.
- **r** — `c-analyzer.test.ts:248-248` — Result variable in edge case test.
- **i** — `c-analyzer.test.ts:251-251` — Include path handling assertion.

### C++ Language (cpp-analyzer.test.ts)

- **_analyzer** — `cpp-analyzer.test.ts:18-429` — Complete C++ language analyzer test suite.
- **_analyzer** — `cpp-analyzer.test.ts:22-26` — Analyzer initialization and setup.
- **it** — `cpp-analyzer.test.ts:28-114` — Test cases for basic C++ classes, constructors, destructors, and methods.
- **code** — `cpp-analyzer.test.ts:29-66` — Test input: basic class structure with constructor and method.
- **e** — `cpp-analyzer.test.ts:46-46` — Class entity extraction.
- **e** — `cpp-analyzer.test.ts:50-50` — Constructor method entity.
- **e** — `cpp-analyzer.test.ts:54-54` — Destructor method entity.
- **e** — `cpp-analyzer.test.ts:58-58` — Public method entity.
- **e** — `cpp-analyzer.test.ts:63-63` — Private field entity.
- **code** — `cpp-analyzer.test.ts:68-100` — Test input: inheritance and virtual methods.
- **e** — `cpp-analyzer.test.ts:88-88` — Base class entity.
- **e** — `cpp-analyzer.test.ts:92-92` — Derived class entity.
- **e** — `cpp-analyzer.test.ts:95-95` — Override method entity.
- **e** — `cpp-analyzer.test.ts:98-98` — Final method entity.
- **code** — `cpp-analyzer.test.ts:102-113` — Test input: final class declaration.
- **e** — `cpp-analyzer.test.ts:111-111` — Final class entity.
- **it** — `cpp-analyzer.test.ts:116-149` — Test cases for inheritance patterns.
- **code** — `cpp-analyzer.test.ts:117-148` — Test input: namespace nesting and class relationships.
- **e** — `cpp-analyzer.test.ts:135-135` — Namespace entity.
- **e** — `cpp-analyzer.test.ts:140-140` — Nested class entity.
- **e** — `cpp-analyzer.test.ts:143-143` — Standalone function entity.
- **e** — `cpp-analyzer.test.ts:146-146` — Inner namespace entity.
- **it** — `cpp-analyzer.test.ts:151-177` — Test cases for operator overloading.
- **code** — `cpp-analyzer.test.ts:152-176` — Test input: operator overloads (addition, subscript, call).
- **e** — `cpp-analyzer.test.ts:168-168` — Addition operator entity.
- **e** — `cpp-analyzer.test.ts:172-172` — Bracket subscript operator entity.
- **e** — `cpp-analyzer.test.ts:174-174` — Function call operator entity.
- **it** — `cpp-analyzer.test.ts:179-252` — Test cases for templates and template specialization.
- **code** — `cpp-analyzer.test.ts:180-198` — Test input: generic template class.
- **e** — `cpp-analyzer.test.ts:194-194` — Template class entity.
- **m** — `cpp-analyzer.test.ts:197-197` — Template method parameter count.
- **code** — `cpp-analyzer.test.ts:200-221` — Test input: template functions with specialization.
- **e** — `cpp-analyzer.test.ts:213-213` — Template function entity.
- **e** — `cpp-analyzer.test.ts:217-217` — Template specialization entity.
- **m** — `cpp-analyzer.test.ts:219-219` — Method parameter count.
- **m** — `cpp-analyzer.test.ts:220-220` — Return type specification.
- **code** — `cpp-analyzer.test.ts:223-251` — Test input: SFINAE and variadic templates.
- **e** — `cpp-analyzer.test.ts:242-242` — SFINAE enable_if function entity.
- **e** — `cpp-analyzer.test.ts:245-245` — Variadic template function entity.
- **e** — `cpp-analyzer.test.ts:249-249` — Simple class entity.
- **it** — `cpp-analyzer.test.ts:254-288` — Test cases for method qualifiers.
- **code** — `cpp-analyzer.test.ts:255-287` — Test input: const, static, noexcept, virtual qualifiers.
- **e** — `cpp-analyzer.test.ts:272-272` — Const method entity.
- **e** — `cpp-analyzer.test.ts:275-275` — Static method entity.
- **e** — `cpp-analyzer.test.ts:278-278` — Noexcept method entity.
- **e** — `cpp-analyzer.test.ts:281-281` — Complex qualified method entity.
- **e** — `cpp-analyzer.test.ts:285-285` — Virtual method entity.
- **it** — `cpp-analyzer.test.ts:290-321` — Test cases for enumeration types.
- **code** — `cpp-analyzer.test.ts:291-320` — Test input: scoped and unscoped enums.
- **e** — `cpp-analyzer.test.ts:308-308` — Color enum entity.
- **e** — `cpp-analyzer.test.ts:312-312` — Enum value entity.
- **e** — `cpp-analyzer.test.ts:317-317` — Status enum entity.
- **it** — `cpp-analyzer.test.ts:323-381` — Test cases for template generation and validation.
- **Generate** — `cpp-analyzer.test.ts:324-339` — Template code generation test.
- **code** — `cpp-analyzer.test.ts:341-358` — Generated template code input.
- **Generate** — `cpp-analyzer.test.ts:360-380` — Template instantiation generation test.
- **e** — `cpp-analyzer.test.ts:378-378` — Complex template instantiation entity.
- **it** — `cpp-analyzer.test.ts:383-410` — Test cases for friend declarations.
- **code** — `cpp-analyzer.test.ts:384-409` — Test input: friend function and class declarations.
- **e** — `cpp-analyzer.test.ts:407-407` — Friend class A entity.
- **it** — `cpp-analyzer.test.ts:412-428` — Test cases for exception specifications.
- **code** — `cpp-analyzer.test.ts:413-427` — Test input: exception handling and throw specifications.

### Go Language (go-analyzer.test.ts)

- **parser** — `go-analyzer.test.ts:13-265` — Complete Go language analyzer test suite validating package, struct, interface, and function parsing.
- **parser** — `go-analyzer.test.ts:17-21` — Parser initialization and setup.
- **code** — `go-analyzer.test.ts:23-78` — Test input: package declaration, imports, and basic functions.
- **e** — `go-analyzer.test.ts:53-53` — Package entity extraction.
- **e** — `go-analyzer.test.ts:58-58` — Function name entity.
- **e** — `go-analyzer.test.ts:64-64` — Simple function entity.
- **e** — `go-analyzer.test.ts:68-68` — Complex function with parameters entity.
- **r** — `go-analyzer.test.ts:73-73` — Return value assertion.
- **i** — `go-analyzer.test.ts:75-75` — Import statement assertion.
- **code** — `go-analyzer.test.ts:80-139` — Test input: struct definitions with fields and methods.
- **e** — `go-analyzer.test.ts:110-110` — Struct entity extraction.
- **e** — `go-analyzer.test.ts:114-114` — Struct field entity.
- **e** — `go-analyzer.test.ts:119-119` — Interface entity extraction.
- **f** — `go-analyzer.test.ts:121-121` — Interface field count.
- **e** — `go-analyzer.test.ts:126-126` — Method entity extraction.
- **e** — `go-analyzer.test.ts:129-129` — Shape interface entity.
- **e** — `go-analyzer.test.ts:133-133` — Method on struct entity.
- **e** — `go-analyzer.test.ts:136-136` — Area calculation method entity.
- **code** — `go-analyzer.test.ts:141-182` — Test input: constants, variables, and type definitions.
- **e** — `go-analyzer.test.ts:164-164` — Constant entity extraction.
- **e** — `go-analyzer.test.ts:167-167` — Version constant entity.
- **e** — `go-analyzer.test.ts:172-172` — Variable entity extraction.
- **e** — `go-analyzer.test.ts:175-175` — Server name variable entity.
- **e** — `go-analyzer.test.ts:179-179` — Global counter variable entity.
- **code** — `go-analyzer.test.ts:184-219` — Test input: custom types and embedded types.
- **e** — `go-analyzer.test.ts:206-206` — Typedef entity extraction.
- **e** — `go-analyzer.test.ts:209-209` — User ID type entity.
- **r** — `go-analyzer.test.ts:213-213` — Embed relation assertion.
- **r** — `go-analyzer.test.ts:216-216` — Admin embed relation.
- **code** — `go-analyzer.test.ts:221-264` — Test input: function calls and dependencies.
- **r** — `go-analyzer.test.ts:255-255` — Call relation extraction.
- **e** — `go-analyzer.test.ts:259-259` — Function entity from call test.
- **f** — `go-analyzer.test.ts:260-260` — Function name field.

### Python Language (python-analyzer.test.ts)

- **detector** — `python-analyzer.test.ts:13-13` — Python dependency detector instance.
- **dependencyCache** — `python-analyzer.test.ts:14-14` — Cached dependency graph for testing.
- **test** — `python-analyzer.test.ts:52-137` — Pre/post-condition validation for Python import analysis.
- **Pre** — `python-analyzer.test.ts:53-83` — Precondition setup for dependency tests.
- **Step** — `python-analyzer.test.ts:85-136` — Test step execution and assertion.
- **c** — `python-analyzer.test.ts:131-134` — Cycle detection in dependencies.
- **mkImp** — `python-analyzer.test.ts:139-253` — Helper factory building mock Python import structures.
- **sourceFile** — `python-analyzer.test.ts:140-148` — Source file creation helper.
- **Build** — `python-analyzer.test.ts:150-182` — Dependency graph construction test.
- **r** — `python-analyzer.test.ts:173-173` — Result from graph build.
- **r** — `python-analyzer.test.ts:174-174` — Result assertion.
- **r** — `python-analyzer.test.ts:177-180` — Result validation loop.
- **Seed** — `python-analyzer.test.ts:184-224` — Graph seeding with initial dependencies.
- **r** — `python-analyzer.test.ts:223-223` — Result from seeding.
- **Manually** — `python-analyzer.test.ts:226-252` — Manual cycle detection test.
- **r** — `python-analyzer.test.ts:251-251` — Manual detection result.

### Rust Language (rust-analyzer.test.ts)

- **analyzer** — `rust-analyzer.test.ts:15-267` — Complete Rust language analyzer test suite validating complex type systems and patterns.
- **analyzer** — `rust-analyzer.test.ts:18-20` — Analyzer initialization and setup.
- **it** — `rust-analyzer.test.ts:22-98` — Test cases for basic Rust items (functions, structs, enums, traits, impl).
- **mockNode** — `rust-analyzer.test.ts:23-30` — Mock function node creation.
- **mockNode** — `rust-analyzer.test.ts:32-37` — Mock struct node creation.
- **e** — `rust-analyzer.test.ts:36-36` — Struct entity extraction.
- **mockNode** — `rust-analyzer.test.ts:39-44` — Mock enum node creation.
- **e** — `rust-analyzer.test.ts:43-43` — Enum entity extraction.
- **mockNode** — `rust-analyzer.test.ts:46-53` — Mock trait node creation.
- **e** — `rust-analyzer.test.ts:50-50` — Trait entity extraction.
- **mockNode** — `rust-analyzer.test.ts:55-61` — Mock impl block node creation.
- **e** — `rust-analyzer.test.ts:59-59` — Impl block entity extraction.
- **mockNode** — `rust-analyzer.test.ts:63-68` — Mock module node creation.
- **e** — `rust-analyzer.test.ts:67-67` — Module entity extraction.
- **mockNode** — `rust-analyzer.test.ts:70-75` — Mock type alias node creation.
- **e** — `rust-analyzer.test.ts:74-74` — Type alias entity extraction.
- **mockNode** — `rust-analyzer.test.ts:77-82` — Mock const declaration node creation.
- **e** — `rust-analyzer.test.ts:81-81` — Const entity extraction.
- **mockNode** — `rust-analyzer.test.ts:84-90` — Mock static declaration node creation.
- **e** — `rust-analyzer.test.ts:88-88` — Static entity extraction.
- **mockNode** — `rust-analyzer.test.ts:92-97` — Mock macro invocation node creation.
- **e** — `rust-analyzer.test.ts:96-96` — Macro entity extraction.
- **it** — `rust-analyzer.test.ts:100-121` — Test cases for visibility and access control.
- **mockNode** — `rust-analyzer.test.ts:101-106` — Mock public function node creation.
- **r** — `rust-analyzer.test.ts:105-105` — Public visibility result.
- **mockNode** — `rust-analyzer.test.ts:108-113` — Mock private function node creation.
- **r** — `rust-analyzer.test.ts:112-112` — Private visibility result.
- **mockNode** — `rust-analyzer.test.ts:115-120` — Mock crate-visibility function node creation.
- **r** — `rust-analyzer.test.ts:119-119` — Crate visibility result.
- **it** — `rust-analyzer.test.ts:123-203` — Test cases for generics, lifetimes, and associated types.
- **mockNode** — `rust-analyzer.test.ts:124-130` — Mock generic struct node creation.
- **e** — `rust-analyzer.test.ts:128-128` — Generic struct entity.
- **mockNode** — `rust-analyzer.test.ts:132-138` — Mock generic function node creation.
- **e** — `rust-analyzer.test.ts:136-136` — Generic function entity.
- **mockNode** — `rust-analyzer.test.ts:140-147` — Mock generic impl block node creation.
- **e** — `rust-analyzer.test.ts:144-144` — Generic impl entity.
- **mockNode** — `rust-analyzer.test.ts:149-155` — Mock lifetime struct node creation.
- **mockNode** — `rust-analyzer.test.ts:157-163` — Mock lifetime function node creation.
- **e** — `rust-analyzer.test.ts:161-161` — Lifetime function entity.
- **mockNode** — `rust-analyzer.test.ts:165-172` — Mock associated type trait node creation.
- **e** — `rust-analyzer.test.ts:169-169` — Associated type entity.
- **mockNode** — `rust-analyzer.test.ts:174-179` — Mock trait bound node creation.
- **e** — `rust-analyzer.test.ts:178-178` — Trait bound entity.
- **mockNode** — `rust-analyzer.test.ts:181-187` — Mock where clause node creation.
- **e** — `rust-analyzer.test.ts:185-185` — Where clause entity.
- **mockNode** — `rust-analyzer.test.ts:189-194` — Mock complex generic node creation.
- **e** — `rust-analyzer.test.ts:193-193` — Complex generic entity.
- **it** — `rust-analyzer.test.ts:205-254` — Test cases for Rust patterns (builder, iterator, result).
- **mockNode** — `rust-analyzer.test.ts:206-213` — Mock builder pattern node creation.
- **p** — `rust-analyzer.test.ts:210-210` — Builder pattern assertion.
- **mockNode** — `rust-analyzer.test.ts:215-221` — Mock iterator implementation node creation.
- **p** — `rust-analyzer.test.ts:219-219` — Iterator pattern assertion.
- **mockNode** — `rust-analyzer.test.ts:223-229` — Mock result wrapper node creation.
- **p** — `rust-analyzer.test.ts:227-227` — Result pattern assertion.
- **mockNode** — `rust-analyzer.test.ts:231-237` — Mock option wrapper node creation.
- **p** — `rust-analyzer.test.ts:235-235` — Option pattern assertion.
- **mockNode** — `rust-analyzer.test.ts:239-245` — Mock async/await node creation.
- **p** — `rust-analyzer.test.ts:243-243` — Async pattern assertion.
- **mockNode** — `rust-analyzer.test.ts:247-253` — Mock RAII pattern node creation.
- **p** — `rust-analyzer.test.ts:251-251` — RAII pattern assertion.
- **it** — `rust-analyzer.test.ts:256-266` — Test cases for trait implementations.
- **mockNode** — `rust-analyzer.test.ts:257-265` — Mock trait implementation node creation.

## Mock Factory Functions

Helper functions for creating test AST nodes and entities:

- **createMockNode** — `rust-analyzer.test.ts:270-300` — Factory creating mock Rust AST nodes with configurable type and fields.
- **null** — `rust-analyzer.test.ts:279-279` — Null parent node reference.
- **null** — `rust-analyzer.test.ts:280-280` — Null source reference.
- **as** — `rust-analyzer.test.ts:290-290` — Type cast for node field.
- **<anonymous>** — `rust-analyzer.test.ts:291-291` — Anonymous children array initialization.
- **field** — `rust-analyzer.test.ts:293-298` — Field array building for mock node.
- **createMockFunctionNode** — `rust-analyzer.test.ts:302-315` — Factory creating function node with signature and parameters.
- **index** — `rust-analyzer.test.ts:309-313` — Parameter indexing in function.
- **createMockImplNode** — `rust-analyzer.test.ts:317-332` — Factory creating impl block node with associated items.
- **field** — `rust-analyzer.test.ts:319-330` — Field definitions for impl node.
- **createMockNode** — `rust-analyzer.test.ts:326-326` — Nested mock node creation.
- **createMockTraitExtensionNode** — `rust-analyzer.test.ts:334-348` — Factory creating trait extension implementation node.
- **field** — `rust-analyzer.test.ts:336-346` — Field definitions for trait extension.
- **createMockNode** — `rust-analyzer.test.ts:342-342` — Nested trait node creation.
- **createMockNestedModuleNode** — `rust-analyzer.test.ts:350-363` — Factory creating nested module node with children.
- **field** — `rust-analyzer.test.ts:352-361` — Field definitions for module.
- **createMockNode** — `rust-analyzer.test.ts:357-357` — Nested item creation.
- **createMockLifetimeNode** — `rust-analyzer.test.ts:365-378` — Factory creating lifetime parameter node.
- **field** — `rust-analyzer.test.ts:367-376` — Field definitions for lifetime.
- **createMockNode** — `rust-analyzer.test.ts:372-372` — Lifetime bounds node.
- **createMockGenericNode** — `rust-analyzer.test.ts:380-396` — Factory creating generic type parameter node.
- **field** — `rust-analyzer.test.ts:382-394` — Field definitions for generic.
- **createMockNode** — `rust-analyzer.test.ts:387-390` — Nested generic constraint nodes.
- **f** — `rust-analyzer.test.ts:389-389` — Field iteration variable.
- **createMockDeriveNode** — `rust-analyzer.test.ts:398-422` — Factory creating derive attribute node with macro list.
- **field** — `rust-analyzer.test.ts:403-415` — Field definitions for derive.
- **i** — `rust-analyzer.test.ts:411-411` — Iteration index for derives.
- **i** — `rust-analyzer.test.ts:420-420` — Iteration index for derives.
- **createMockVisibilityNode** — `rust-analyzer.test.ts:424-436` — Factory creating visibility modifier node.
- **field** — `rust-analyzer.test.ts:426-434` — Field definitions for visibility.
- **createMockEnumWithVariantsNode** — `rust-analyzer.test.ts:438-454` — Factory creating enum with variant definitions.
- **field** — `rust-analyzer.test.ts:440-452` — Field definitions for enum.
- **i** — `rust-analyzer.test.ts:445-448` — Iteration for variant creation.
- **createMockNode** — `rust-analyzer.test.ts:447-447` — Variant node creation.
- **createMockStructWithFieldsNode** — `rust-analyzer.test.ts:456-469` — Factory creating struct with field definitions.
- **field** — `rust-analyzer.test.ts:458-467` — Field definitions for struct.
- **createMockNode** — `rust-analyzer.test.ts:463-463` — Field node creation.
- **createMockTraitWithMethodsNode** — `rust-analyzer.test.ts:471-484` — Factory creating trait with method definitions.
- **field** — `rust-analyzer.test.ts:473-482` — Field definitions for trait.
- **createMockNode** — `rust-analyzer.test.ts:478-478` — Method node creation.
- **createMockAssociatedTypeNode** — `rust-analyzer.test.ts:486-499` — Factory creating associated type in trait.
- **field** — `rust-analyzer.test.ts:488-497` — Field definitions for associated type.
- **createMockNode** — `rust-analyzer.test.ts:493-493` — Type bound node creation.
- **createMockUseNode** — `rust-analyzer.test.ts:501-510` — Factory creating use/import statement node.
- **field** — `rust-analyzer.test.ts:503-508` — Field definitions for use statement.
- **createMockBuilderNode** — `rust-analyzer.test.ts:512-533` — Factory creating builder pattern implementation.
- **field** — `rust-analyzer.test.ts:515-528` — Field definitions for builder.
- **createMockNode** — `rust-analyzer.test.ts:520-524` — Nested builder method nodes.
- **f** — `rust-analyzer.test.ts:522-522` — Field iteration in builder.
- **i** — `rust-analyzer.test.ts:531-531` — Index in builder pattern.
- **createMockIteratorNode** — `rust-analyzer.test.ts:535-554` — Factory creating iterator trait implementation.
- **field** — `rust-analyzer.test.ts:538-552` — Field definitions for iterator.
- **createMockNode** — `rust-analyzer.test.ts:544-548` — Iterator method nodes.
- **f** — `rust-analyzer.test.ts:546-546` — Field iteration in iterator.
- **createMockResultNode** — `rust-analyzer.test.ts:556-563` — Factory creating Result type wrapper structure.
- **field** — `rust-analyzer.test.ts:558-561` — Field definitions for Result.
- **createMockBorrowingNode** — `rust-analyzer.test.ts:565-567` — Factory creating borrowing/reference annotation.
- **createMockUnsafeNode** — `rust-analyzer.test.ts:569-571` — Factory creating unsafe block annotation.
- **createMockLifetimeAnnotationNode** — `rust-analyzer.test.ts:573-575` — Factory creating lifetime constraint annotation.
- **createMockComplexNode** — `rust-analyzer.test.ts:577-597` — Factory creating complex nested mock structure.
- **index** — `rust-analyzer.test.ts:580-595` — Index iteration for complex node construction.

## Schema Parser Test Suites

### SQL Parser (sql-parser.test.ts)

- **parser** — `sql-parser.test.ts:8-8` — SQL DDL test suite validating table, index, constraint, view, and trigger parsing.
- **POSTGRES_SQL** — `sql-parser.test.ts:10-49` — Comprehensive PostgreSQL schema with multiple tables, constraints, and indexes.
- **result** — `sql-parser.test.ts:59-59` — Parse result from SQL schema.
- **org** — `sql-parser.test.ts:60-60` — Organization table entity.
- **fields** — `sql-parser.test.ts:64-64` — Organization table field assertion.
- **result** — `sql-parser.test.ts:70-70` — Parse result for users table.
- **org** — `sql-parser.test.ts:71-71` — Organization table reference.
- **fields** — `sql-parser.test.ts:72-72` — Users table field count.
- **idField** — `sql-parser.test.ts:73-73` — ID field entity from users table.
- **result** — `sql-parser.test.ts:78-78` — Parse result for child table.
- **users** — `sql-parser.test.ts:79-79` — Users table entity reference.
- **fields** — `sql-parser.test.ts:80-85` — Child table field definitions.
- **email** — `sql-parser.test.ts:87-87` — Email field entity.
- **status** — `sql-parser.test.ts:91-91` — Status field enum type.
- **sql** — `sql-parser.test.ts:96-102` — SQL create table statement.
- **result** — `sql-parser.test.ts:103-103` — Parse result for schema.
- **child** — `sql-parser.test.ts:104-104` — Child table entity.
- **fks** — `sql-parser.test.ts:105-108` — Foreign key relationships.
- **result** — `sql-parser.test.ts:115-115` — Parse result for indexes.
- **idx** — `sql-parser.test.ts:116-116` — Index entity extraction.
- **uniqueIdx** — `sql-parser.test.ts:122-122` — Unique constraint entity.
- **result** — `sql-parser.test.ts:127-127` — Parse result for view.
- **view** — `sql-parser.test.ts:128-128` — View entity extraction.
- **sourceTables** — `sql-parser.test.ts:131-131` — Source tables referenced in view.
- **result** — `sql-parser.test.ts:137-137` — Parse result for function.
- **result** — `sql-parser.test.ts:138-138` — Function entity parsing.
- **func** — `sql-parser.test.ts:138-138` — SQL function entity.
- **result** — `sql-parser.test.ts:146-146` — Parse result for trigger.
- **trigger** — `sql-parser.test.ts:147-147` — Trigger entity extraction.
- **result** — `sql-parser.test.ts:156-156` — Parse result for schema evolution.
- **users** — `sql-parser.test.ts:157-157` — Users table entity from evolution.
- **fields** — `sql-parser.test.ts:158-158` — Field count after evolution.
- **avatarField** — `sql-parser.test.ts:159-159` — New avatar field entity.
- **result** — `sql-parser.test.ts:165-165` — Parse result for multiple schemas.
- **result** — `sql-parser.test.ts:170-170` — Parse result for relationship mapping.
- **table** — `sql-parser.test.ts:171-171` — Table entity from relationship test.
- **sql** — `sql-parser.test.ts:176-182` — SQL for relationship definition.
- **result** — `sql-parser.test.ts:183-183` — Parse result of relationship SQL.
- **fkRel** — `sql-parser.test.ts:185-185` — Foreign key relationship entity.
- **result** — `sql-parser.test.ts:190-190` — Parse result for complex queries.
- **result2** — `sql-parser.test.ts:194-194` — Second parse result.
- **ch** — `sql-parser.test.ts:199-207` — Change detection result.
- **result** — `sql-parser.test.ts:208-208` — Final parse result.
- **table** — `sql-parser.test.ts:209-209` — Table entity from final result.

### Prisma Parser (prisma-parser.test.ts)

- **content** — `prisma-parser.test.ts:94-94` — Prisma schema model definitions.

### Protocol Buffer Parser (protobuf-parser.test.ts)

- **parser** — `protobuf-parser.test.ts:4-4` — Protocol Buffer schema test suite.
- **FULL_PROTO** — `protobuf-parser.test.ts:6-68` — Complete protobuf schema with messages, services, enums, and HTTP bindings.
- **result** — `protobuf-parser.test.ts:72-72` — Parse result from full schema.
- **pkg** — `protobuf-parser.test.ts:73-73` — Package entity extraction.
- **result** — `protobuf-parser.test.ts:80-80` — Parse result for enum.
- **userStatus** — `protobuf-parser.test.ts:81-81` — UserStatus enum entity.
- **values** — `protobuf-parser.test.ts:87-87` — Enum value extraction.
- **result** — `protobuf-parser.test.ts:96-96` — Parse result for message.
- **address** — `protobuf-parser.test.ts:97-97` — Address message entity.
- **fields** — `protobuf-parser.test.ts:103-103` — Address message field extraction.
- **result** — `protobuf-parser.test.ts:111-111` — Parse result for complex message.
- **user** — `protobuf-parser.test.ts:112-112` — User message entity.
- **fields** — `protobuf-parser.test.ts:115-121` — User message field listing.
- **tagsField** — `protobuf-parser.test.ts:123-123` — Tags field entity in message.
- **metadataField** — `protobuf-parser.test.ts:127-127` — Metadata field entity.
- **result** — `protobuf-parser.test.ts:135-135` — Parse result for nested message.
- **prefs** — `protobuf-parser.test.ts:136-136` — Preferences nested message entity.
- **fields** — `protobuf-parser.test.ts:141-141` — Nested message field extraction.
- **result** — `protobuf-parser.test.ts:148-148` — Parse result for map fields.
- **user** — `protobuf-parser.test.ts:149-149` — User entity from map test.
- **fields** — `protobuf-parser.test.ts:150-153` — Fields in message with maps.
- **phoneField** — `protobuf-parser.test.ts:155-155` — Phone map field entity.
- **faxField** — `protobuf-parser.test.ts:159-159` — Fax field entity.
- **result** — `protobuf-parser.test.ts:165-165` — Parse result for service.
- **service** — `protobuf-parser.test.ts:166-166` — Service entity extraction.
- **result** — `protobuf-parser.test.ts:174-174` — Parse result for RPC methods.
- **getUser** — `protobuf-parser.test.ts:176-176` — GetUser RPC method entity.
- **listUsers** — `protobuf-parser.test.ts:187-187` — ListUsers RPC method entity.
- **updateUser** — `protobuf-parser.test.ts:192-192` — UpdateUser RPC method entity.
- **result** — `protobuf-parser.test.ts:199-199` — Parse result for references.
- **rpcRefs** — `protobuf-parser.test.ts:202-204` — RPC method references mapping.
- **msgToEnum** — `protobuf-parser.test.ts:208-210` — Message to enum mapping.
- **msgToMsg** — `protobuf-parser.test.ts:214-216` — Message to message relationship.
- **httpProto** — `protobuf-parser.test.ts:221-240` — Protobuf with HTTP binding annotations.
- **result** — `protobuf-parser.test.ts:241-241` — Parse result for HTTP bindings.
- **getUser** — `protobuf-parser.test.ts:243-243` — GetUser HTTP RPC entity.
- **createUser** — `protobuf-parser.test.ts:248-248` — CreateUser HTTP RPC entity.
- **minimal** — `protobuf-parser.test.ts:255-255` — Minimal protobuf definition.
- **result** — `protobuf-parser.test.ts:256-256` — Parse result for minimal.
- **proto2** — `protobuf-parser.test.ts:262-270` — Proto2 syntax schema test.
- **result** — `protobuf-parser.test.ts:271-271` — Parse result for proto2.
- **msg** — `protobuf-parser.test.ts:272-272` — Message entity from proto2.
- **result** — `protobuf-parser.test.ts:278-278` — Parse result for complex structure.
- **services** — `protobuf-parser.test.ts:281-281` — Service entity extraction.
- **rpcs** — `protobuf-parser.test.ts:287-287` — RPC method listing.
- **messages** — `protobuf-parser.test.ts:293-293` — Message entity listing.
- **enums** — `protobuf-parser.test.ts:299-299` — Enum type listing.

### GraphQL Parser (graphql-parser.test.ts)

- **parser** — `graphql-parser.test.ts:4-4` — GraphQL schema test suite.

## Native Multi-Language Parser Test Suite

Unified parser tests for multiple languages using tree-sitter:

- **parser** — `native-parsers.test.ts:19-148` — Test suite for TypeScript/JavaScript language parsing.
- **parser** — `native-parsers.test.ts:22-25` — Parser initialization.
- **expect** — `native-parsers.test.ts:27-31` — TypeScript class entity expectation.
- **expect** — `native-parsers.test.ts:33-36` — TypeScript interface entity expectation.
- **Note** — `native-parsers.test.ts:38-43` — Test documentation note.
- **content** — `native-parsers.test.ts:45-67` — TypeScript class definition test input.
- **e** — `native-parsers.test.ts:64-64` — Class entity from TypeScript test.
- **content** — `native-parsers.test.ts:69-81` — TypeScript interface definition test input.
- **e** — `native-parsers.test.ts:79-79` — Interface entity from TypeScript test.
- **content** — `native-parsers.test.ts:83-103` — TypeScript functions and imports test input.
- **e** — `native-parsers.test.ts:95-95` — Function entity extraction.
- **e** — `native-parsers.test.ts:100-100` — Async function entity.
- **content** — `native-parsers.test.ts:105-115` — TypeScript type alias test input.
- **e** — `native-parsers.test.ts:113-113` — Type alias entity.
- **content** — `native-parsers.test.ts:117-126` — TypeScript enum definition test input.
- **e** — `native-parsers.test.ts:124-124` — Enum entity extraction.
- **content** — `native-parsers.test.ts:128-140` — TypeScript namespace test input.
- **e** — `native-parsers.test.ts:138-138` — Namespace entity.
- **stats** — `native-parsers.test.ts:142-147` — Parsing statistics for TypeScript.
- **parser** — `native-parsers.test.ts:154-250` — Test suite for Go language parsing.
- **parser** — `native-parsers.test.ts:157-160` — Go parser initialization.
- **expect** — `native-parsers.test.ts:162-166` — Go struct entity expectation.
- **expect** — `native-parsers.test.ts:168-170` — Go enum entity expectation.
- **expect** — `native-parsers.test.ts:172-175` — Go interface entity expectation.
- **content** — `native-parsers.test.ts:177-193` — Go struct definition test input.
- **e** — `native-parsers.test.ts:191-191` — Struct entity from Go test.
- **content** — `native-parsers.test.ts:195-211` — Go enum definition test input.
- **e** — `native-parsers.test.ts:205-205` — Enum entity.
- **e** — `native-parsers.test.ts:208-208` — Enum value entity.
- **content** — `native-parsers.test.ts:213-224` — Go interface definition test input.
- **e** — `native-parsers.test.ts:222-222` — Interface entity.
- **content** — `native-parsers.test.ts:226-243` — Go package and imports test input.
- **e** — `native-parsers.test.ts:241-241` — Package entity.
- **stats** — `native-parsers.test.ts:245-249` — Parsing statistics for Go.
- **parser** — `native-parsers.test.ts:256-366` — Test suite for Rust language parsing.
- **parser** — `native-parsers.test.ts:259-262` — Rust parser initialization.
- **expect** — `native-parsers.test.ts:264-268` — Rust struct entity expectation.
- **expect** — `native-parsers.test.ts:270-273` — Rust enum entity expectation.
- **content** — `native-parsers.test.ts:275-299` — Rust struct definition test input.
- **e** — `native-parsers.test.ts:296-296` — Struct entity from Rust test.
- **content** — `native-parsers.test.ts:301-314` — Rust enum definition test input.
- **e** — `native-parsers.test.ts:312-312` — Enum entity.
- **content** — `native-parsers.test.ts:316-330` — Rust trait definition test input.
- **e** — `native-parsers.test.ts:328-328` — Trait entity.
- **content** — `native-parsers.test.ts:332-346` — Rust module definition test input.
- **e** — `native-parsers.test.ts:344-344` — Module entity.
- **content** — `native-parsers.test.ts:348-359` — Rust impl block test input.
- **e** — `native-parsers.test.ts:356-356` — Impl block entity.
- **stats** — `native-parsers.test.ts:361-365` — Parsing statistics for Rust.
- **parser** — `native-parsers.test.ts:372-509` — Test suite for Kotlin language parsing.
- **parser** — `native-parsers.test.ts:375-378` — Kotlin parser initialization.
- **expect** — `native-parsers.test.ts:380-384` — Kotlin class entity expectation.
- **expect** — `native-parsers.test.ts:386-389` — Kotlin object entity expectation.
- **expect** — `native-parsers.test.ts:391-394` — Kotlin interface entity expectation.
- **content** — `native-parsers.test.ts:396-413` — Kotlin class definition test input.
- **e** — `native-parsers.test.ts:411-411` — Class entity from Kotlin test.
- **content** — `native-parsers.test.ts:415-430` — Kotlin object definition test input.
- **e** — `native-parsers.test.ts:427-427` — Object entity.
- **content** — `native-parsers.test.ts:432-445` — Kotlin interface definition test input.
- **e** — `native-parsers.test.ts:443-443` — Interface entity.
- **content** — `native-parsers.test.ts:447-465` — Kotlin functions test input.
- **e** — `native-parsers.test.ts:457-457` — Function entity.
- **e** — `native-parsers.test.ts:461-461` — Suspend function entity.
- **content** — `native-parsers.test.ts:467-479` — Kotlin extension functions test input.
- **e** — `native-parsers.test.ts:477-477` — Extension function entity.
- **content** — `native-parsers.test.ts:481-492` — Kotlin enum definition test input.
- **e** — `native-parsers.test.ts:490-490` — Enum entity.
- **content** — `native-parsers.test.ts:494-502` — Kotlin type alias test input.
- **e** — `native-parsers.test.ts:500-500` — Type alias entity.
- **stats** — `native-parsers.test.ts:504-508` — Parsing statistics for Kotlin.
- **parser** — `native-parsers.test.ts:515-678` — Test suite for Swift language parsing.
- **parser** — `native-parsers.test.ts:518-521` — Swift parser initialization.
- **expect** — `native-parsers.test.ts:523-527` — Swift class entity expectation.
- **expect** — `native-parsers.test.ts:529-532` — Swift struct entity expectation.
- **content** — `native-parsers.test.ts:534-549` — Swift class definition test input.
- **e** — `native-parsers.test.ts:546-546` — Class entity from Swift test.
- **content** — `native-parsers.test.ts:551-563` — Swift struct definition test input.
- **e** — `native-parsers.test.ts:561-561` — Struct entity.
- **content** — `native-parsers.test.ts:565-576` — Swift enum definition test input.
- **e** — `native-parsers.test.ts:574-574` — Enum entity.
- **content** — `native-parsers.test.ts:578-597` — Swift protocol definition test input.
- **e** — `native-parsers.test.ts:590-590` — Protocol entity.
- **e** — `native-parsers.test.ts:594-594` — Extension implementation entity.
- **content** — `native-parsers.test.ts:599-609` — Swift function definition test input.
- **e** — `native-parsers.test.ts:607-607` — Function entity.
- **content** — `native-parsers.test.ts:611-620` — Swift import statement test input.
- **e** — `native-parsers.test.ts:618-618` — Import entity.
- **content** — `native-parsers.test.ts:622-640` — Swift closure definition test input.
- **e** — `native-parsers.test.ts:638-638` — Closure entity.
- **content** — `native-parsers.test.ts:642-656` — Swift property definition test input.
- **e** — `native-parsers.test.ts:649-649` — Property entity.
- **e** — `native-parsers.test.ts:652-652` — Computed property entity.
- **content** — `native-parsers.test.ts:658-671` — Swift subscript definition test input.
- **e** — `native-parsers.test.ts:668-668` — Subscript entity.
- **stats** — `native-parsers.test.ts:673-677` — Parsing statistics for Swift.
- **parser** — `native-parsers.test.ts:684-1085` — Test suite for Java language parsing.
- **parser** — `native-parsers.test.ts:687-690` — Java parser initialization.
- **expect** — `native-parsers.test.ts:692-696` — Java class entity expectation.
- **expect** — `native-parsers.test.ts:698-702` — Java interface entity expectation.
- **content** — `native-parsers.test.ts:704-728` — Java class definition test input.
- **e** — `native-parsers.test.ts:725-725` — Class entity from Java test.
- **content** — `native-parsers.test.ts:730-742` — Java interface definition test input.
- **e** — `native-parsers.test.ts:740-740` — Interface entity.
- **content** — `native-parsers.test.ts:744-755` — Java enum definition test input.
- **e** — `native-parsers.test.ts:753-753` — Enum entity.
- **content** — `native-parsers.test.ts:757-769` — Java annotation definition test input.
- **e** — `native-parsers.test.ts:767-767` — Annotation entity.
- **content** — `native-parsers.test.ts:771-791` — Java inner classes and methods test input.
- **e** — `native-parsers.test.ts:784-784` — Inner class entity.
- **e** — `native-parsers.test.ts:788-788` — Method entity.
- **content** — `native-parsers.test.ts:793-803` — Java constructor definition test input.
- **e** — `native-parsers.test.ts:801-801` — Constructor entity.
- **content** — `native-parsers.test.ts:805-817` — Java field definition test input.
- **e** — `native-parsers.test.ts:815-815` — Field entity.
- **content** — `native-parsers.test.ts:819-833` — Java modifier handling test input.
- **e** — `native-parsers.test.ts:829-829` — Abstract method entity.
- **content** — `native-parsers.test.ts:835-854` — Java generics test input.
- **e** — `native-parsers.test.ts:848-848` — Generic class entity.
- **e** — `native-parsers.test.ts:852-852` — Generic method entity.
- **content** — `native-parsers.test.ts:856-870` — Java static members test input.
- **e** — `native-parsers.test.ts:868-868` — Static field entity.
- **content** — `native-parsers.test.ts:872-881` — Java package and imports test input.
- **e** — `native-parsers.test.ts:879-879` — Package entity.
- **content** — `native-parsers.test.ts:883-922` — Java exception handling test input.
- **r** — `native-parsers.test.ts:908-908` — throws clause reference.
- **r** — `native-parsers.test.ts:913-913` — catch block reference.
- **e** — `native-parsers.test.ts:918-918` — Exception type entity.
- **content** — `native-parsers.test.ts:924-965` — Java inheritance and interfaces test input.
- **e** — `native-parsers.test.ts:937-937` — Base class entity.
- **c** — `native-parsers.test.ts:946-946` — Implements count assertion.
- **c** — `native-parsers.test.ts:951-951` — Extends assertion.
- **r** — `native-parsers.test.ts:956-956` — Implements relationship.
- **r** — `native-parsers.test.ts:959-959` — Extends relationship.
- **r** — `native-parsers.test.ts:963-963` — Interface relationship.
- **content** — `native-parsers.test.ts:967-997` — Java complex class structure test input.
- **e** — `native-parsers.test.ts:986-986` — Complex structure entity.
- **e** — `native-parsers.test.ts:990-990` — Inner class in complex structure.
- **e** — `native-parsers.test.ts:994-994` — Method in complex structure.
- **content** — `native-parsers.test.ts:999-1040` — Java method overloading test input.
- **e** — `native-parsers.test.ts:1025-1025` — Overloaded method entity.
- **content** — `native-parsers.test.ts:1042-1078` — Java lambda and functional programming test input.
- **e** — `native-parsers.test.ts:1063-1063` — Lambda function entity.
- **r** — `native-parsers.test.ts:1076-1076` — Functional interface reference.
- **stats** — `native-parsers.test.ts:1080-1084` — Parsing statistics for Java.

## Code Linking Test Suites

### Database-Code Linker (db-code-linker.test.ts)

- **makeEntity** — `db-code-linker.test.ts:9-20` — Helper factory creating mock database and code entities for linking tests.
- **<anonymous>** — `db-code-linker.test.ts:9-9` — Anonymous factory function.
- **it** — `db-code-linker.test.ts:22-174` — Main test suite validating database-code linking.
- **dbEntity** — `db-code-linker.test.ts:23-41` — Test case: database model entity linking.
- **dbEntity** — `db-code-linker.test.ts:43-60` — Test case: repository code entity linking.
- **dbEntity** — `db-code-linker.test.ts:62-79` — Test case: migration entity linking.
- **dbEntity** — `db-code-linker.test.ts:81-99` — Test case: complex schema relationship linking.
- **dbEntity** — `db-code-linker.test.ts:101-117` — Test case: bidirectional link validation.
- **analysis** — `db-code-linker.test.ts:119-148` — Comprehensive analysis test combining multiple entity types.
- **codeEntity** — `db-code-linker.test.ts:150-161` — Code entity extraction and linking test.
- **apiEntity** — `db-code-linker.test.ts:163-173` — API endpoint entity linking test.

### GraphQL-Code Linker (graphql-code-linker.test.ts)

- **makeEntity** — `graphql-code-linker.test.ts:5-15` — Helper factory creating mock GraphQL and code entities.
- **<anonymous>** — `graphql-code-linker.test.ts:5-5` — Anonymous factory function.
- **it** — `graphql-code-linker.test.ts:17-190` — Main test suite validating GraphQL schema-code linking.
- **entities** — `graphql-code-linker.test.ts:18-38` — GraphQL type entity test input.
- **entities** — `graphql-code-linker.test.ts:40-59` — GraphQL field entity test input.
- **entities** — `graphql-code-linker.test.ts:62-81` — GraphQL query root type test input.
- **analysis** — `graphql-code-linker.test.ts:83-83` — Query type linking analysis.
- **entities** — `graphql-code-linker.test.ts:89-102` — GraphQL mutation root type test input.
- **analysis** — `graphql-code-linker.test.ts:104-104` — Mutation type linking analysis.
- **entities** — `graphql-code-linker.test.ts:110-123` — GraphQL subscription root type test input.
- **analysis** — `graphql-code-linker.test.ts:125-125` — Subscription type linking analysis.
- **entities** — `graphql-code-linker.test.ts:130-149` — GraphQL input type test input.
- **analysis** — `graphql-code-linker.test.ts:151-151` — Input type linking analysis.
- **entities** — `graphql-code-linker.test.ts:157-171` — GraphQL interface type test input.
- **analysis** — `graphql-code-linker.test.ts:173-173` — Interface type linking analysis.
- **rels** — `graphql-code-linker.test.ts:174-174` — Relationship mapping extraction.
- **entities** — `graphql-code-linker.test.ts:183-183` — Code implementation entities.
- **analysis** — `graphql-code-linker.test.ts:185-185` — Implementation linking analysis.

### Protobuf-Code Linker (protobuf-code-linker.test.ts)

- **entities** — `protobuf-code-linker.test.ts:22-41` — Protobuf message definitions for linking test.
- **analysis** — `protobuf-code-linker.test.ts:43-43` — Message-to-code linking analysis.
- **entities** — `protobuf-code-linker.test.ts:50-63` — Protobuf enum definitions for linking.
- **analysis** — `protobuf-code-linker.test.ts:65-65` — Enum-to-code linking analysis.
- **entities** — `protobuf-code-linker.test.ts:70-83` — Protobuf service definition for linking.
- **analysis** — `protobuf-code-linker.test.ts:85-85` — Service-to-code linking analysis.
- **entities** — `protobuf-code-linker.test.ts:90-103` — Protobuf oneof field definitions.
- **analysis** — `protobuf-code-linker.test.ts:105-105` — Oneof linking analysis.
- **entities** — `protobuf-code-linker.test.ts:111-124` — Protobuf map field definitions.
- **analysis** — `protobuf-code-linker.test.ts:126-126` — Map field linking analysis.
- **entities** — `protobuf-code-linker.test.ts:131-144` — Protobuf message nesting definitions.
- **analysis** — `protobuf-code-linker.test.ts:146-146` — Nested message linking analysis.
- **rels** — `protobuf-code-linker.test.ts:147-147` — Relationship mapping extraction.
- **entities** — `protobuf-code-linker.test.ts:156-156` — Code implementation entities.
- **analysis** — `protobuf-code-linker.test.ts:158-158` — Implementation linking analysis.

## Detector Test Suites

### Migration Detector (migration-detector.test.ts)

- **ops** — `migration-detector.test.ts:163-163` — Detected migration operations.
- **ops** — `migration-detector.test.ts:169-169` — Migration drop operation detection.
- **ops** — `migration-detector.test.ts:176-176` — Migration alter operation detection.
- **o** — `migration-detector.test.ts:177-177` — Column addition operation.
- **content** — `migration-detector.test.ts:183-193` — Test input: SQL add column migration.
- **o** — `migration-detector.test.ts:190-190` — Operation type assertion.
- **o** — `migration-detector.test.ts:191-191` — Target table assertion.
- **o** — `migration-detector.test.ts:192-192` — Column name assertion.
- **content** — `migration-detector.test.ts:195-205` — Test input: SQL rename column migration.
- **o** — `migration-detector.test.ts:202-202` — Rename operation type.
- **o** — `migration-detector.test.ts:203-203` — Old name assertion.
- **o** — `migration-detector.test.ts:204-204` — New name assertion.
- **content** — `migration-detector.test.ts:207-217` — Test input: SQL drop column migration.
- **o** — `migration-detector.test.ts:214-214` — Drop operation type.
- **o** — `migration-detector.test.ts:215-215` — Table reference assertion.
- **o** — `migration-detector.test.ts:216-216` — Column reference assertion.

### ORM Detector (orm-detector.test.ts)

- **makeEntity** — `orm-detector.test.ts:9-20` — Helper factory creating mock ORM entity definitions.
- **<anonymous>** — `orm-detector.test.ts:9-9` — Anonymous factory function.
- **TypeORM** — `orm-detector.test.ts:22-209` — Main test suite for TypeORM decorator detection.
- **entity** — `orm-detector.test.ts:24-37` — Test case: basic TypeORM entity column.
- **entity** — `orm-detector.test.ts:39-50` — Test case: primary key column.
- **entity** — `orm-detector.test.ts:53-65` — Test case: unique constraint column.
- **entity** — `orm-detector.test.ts:68-81` — Test case: nullable column.
- **entity** — `orm-detector.test.ts:83-96` — Test case: default value column.
- **entity** — `orm-detector.test.ts:99-112` — Test case: indexed column.
- **entity** — `orm-detector.test.ts:114-126` — Test case: generated column.
- **entity** — `orm-detector.test.ts:129-142` — Test case: enum column.
- **entity** — `orm-detector.test.ts:145-162` — Test case: relationship decorator.

### Schema Drift Detector (schema-drift-detector.test.ts)

- **ormLinks** — `schema-drift-detector.test.ts:181-185` — ORM entity database mapping definitions.
- **schema** — `schema-drift-detector.test.ts:186-186` — Actual database schema for comparison.
- **entities** — `schema-drift-detector.test.ts:187-191` — ORM entity definitions in code.
- **drift** — `schema-drift-detector.test.ts:193-193` — Detected schema drift between ORM and database.
- **ormLinks** — `schema-drift-detector.test.ts:200-200` — Alternative ORM mapping definitions.
- **schema** — `schema-drift-detector.test.ts:201-204` — Different database schema for comparison.
- **entities** — `schema-drift-detector.test.ts:205-212` — Alternative ORM entity definitions.
- **drift** — `schema-drift-detector.test.ts:214-214` — Drift detection with alternative mapping.
- **drift** — `schema-drift-detector.test.ts:222-222` — Complex drift scenario validation.

## Dependencies

**Core Testing Framework:**
- `bun:test` — Provides describe, it, expect, beforeAll testing utilities

**Tested Modules:**
- Language Analyzers — C, C++, Go, Python, Rust analyzer implementations
- Schema Parsers — SQL, Prisma, Protobuf, GraphQL schema parsing implementations
- Code Linkers — Database-code, GraphQL-code, Protobuf-code relationship mappers
- Detectors — Migration detection, ORM pattern analysis, schema drift identification

**Key Patterns:**
- Parser/Analyzer initialization via beforeAll hooks
- Entity extraction validation using expect assertions
- Relationship mapping tests validating schema-to-code linkage
- Mock AST node factories for language-specific structure generation
