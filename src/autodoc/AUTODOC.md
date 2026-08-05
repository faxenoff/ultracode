# Overview

## 🤖 Overview

The `autodoc` module provides an automatic documentation layer with semantic search, enabling users to store, parse, and manage code documentation. It is used by developers and maintainers to enhance code readability and maintainability through structured documentation.

## 🤖 Architecture

```
  +-------------------+
  |   AutoDocManager |
  +-------------------+
          |
          v
  +-------------------+
  |     DocStorage    |
  +-------------------+
          |
          v
  +-------------------+
  |     RefStorage    |
  +-------------------+
          |
          v
  +-------------------+
  |   LinkExtractor   |
  +-------------------+
          |
          v
  +-------------------+
  |   DocParser       |
  +-------------------+
          |
          v
  +-------------------+
  |   DocGenerator    |
  +-------------------+
```

## 🤖 Flow

```
  +-------------------+
  |   AutoDocManager |
  +-------------------+
          |
          v
  +-------------------+
  |     DocStorage    |
  +-------------------+
          |
          v
  +-------------------+
  |     RefStorage    |
  +-------------------+
          |
          v
  +-------------------+
  |   LinkExtractor   |
  +-------------------+
          |
          v
  +-------------------+
  |   DocParser       |
  +-------------------+
          |
          v
  +-------------------+
  |   DocGenerator    |
  +-------------------+
```

## 🤖 Entity Listing

### Function
- **parseSourceMeta** — Parses source metadata `types.ts:130-143`

### Interface
- **AutoDocConfig** — Configures automatic documentation settings `types.ts:308-319`
- **AutoDocStatus** — Tracks the status of automatic documentation `types.ts:324-348`
- **AutoDocTodo** — Represents a task or todo item for automatic documentation `types.ts:353-366`
- **ChangeLogEntry** — Represents an entry in the change log `types.ts:251-271`
- **ChangelogParams** — Parameters for managing the changelog of documentation entities `types.ts:576-580`
- **CommentRef** — Represents a reference to a comment in code `types.ts:276-299`
- **DocContext** — Represents the context or environment of a document or code entity `types.ts:404-433`
- **DocEntity** — Represents a documentation entity with various properties `types.ts:181-208`
- **DocSearchResult** — Represents a result from a documentation search `types.ts:375-399`
- **GetContextParams** — Parameters for getting context of a documentation entity `types.ts:560-564`
- **InitParams** — Parameters for initializing the documentation system `types.ts:525-528`
- **InitResult** — Represents the result of initializing the documentation system `types.ts:589-602`
- **OutdatedDoc** — Outdated documentation entity `types.ts:438-455`
- **ParsedDocument** — Represents a parsed documentation document `types.ts:505-516`
- **ParsedReference** — Represents a parsed reference between documentation entities `types.ts:485-500`
- **ParsedSection** — Represents a parsed section of documentation `types.ts:464-480`
- **Reference** — Represents a reference between documentation entities and code `types.ts:213-246`
- **SaveParams** — Parameters for saving documentation entities `types.ts:533-537`
- **SaveResult** — Represents the result of saving the documentation `types.ts:607-617`
- **SaveSectionParams** — Parameters for saving a section of documentation `types.ts:542-546`
- **SearchParams** — Parameters for searching documentation entities `types.ts:551-555`
- **SectionLocation** — Represents the location of a section in the source code `types.ts:163-172`
- **SourceLocation** — Represents the location of a source code entity `types.ts:152-158`
- **SourceMeta** — Stores metadata about the source code `types.ts:120-124`
- **ValidateParams** — Parameters for validating documentation entities `types.ts:569-571`
- **ValidateResult** — Represents the result of validating the documentation `types.ts:622-636`

### Enum_decl
- **ChangeKind** — Enumerates kinds of changes in documentation `types.ts:103-114`
- **ChangeType** — Enumerates types of changes in documentation `types.ts:87-92`
- **DocEntityType** — Types of documentation entities `types.ts:19-38`
- **RefSourceType** — Source types for references `types.ts:61-68`
- **RefTargetType** — Target types for references `types.ts:73-82`
- **RefType** — Types of references between docs and code `types.ts:43-56`

### Constant
- **ADDED** — Indicates a new addition to the documentation `types.ts:88-88`
- **ARCHITECTURE** — Project architecture overview `types.ts:21-21`
- **CODE** — Reference from code (imports, calls) `types.ts:67-67`
- **COMMENT** — Reference from code comment `types.ts:65-65`
- **COMMIT** — Represents a git commit `types.ts:81-81`
- **DELETED** — Indicates a deletion from the documentation `types.ts:90-90`
- **DEPENDENCY** — External dependencies `types.ts:27-27`
- **DEPENDS** — Documentation depends on another doc `types.ts:47-47`
- **DEPLOYMENT** — Deployment and CI/CD `types.ts:29-29`
- **DESCRIBES** — Documentation describes code entity `types.ts:45-45`
- **DOC** — Reference from MD documentation `types.ts:63-63`
- **DOC** — Represents a document type `types.ts:77-77`
- **ENTITIES_ADDED** — Represents the count of added entities `types.ts:107-107`
- **ENTITIES_REMOVED_MINOR** — Represents the count of minor removed entities `types.ts:111-111`
- **ENTITY** — Target is a code entity (AST) `types.ts:75-75`
- **ENTITY_DOC** — Entity-level documentation `types.ts:35-35`
- **EXAMPLE** — Code example reference `types.ts:49-49`
- **FLOW** — Business scenarios (user stories) `types.ts:23-23`
- **GLOSSARY** — Glossary terms `types.ts:31-31`
- **LINE_RANGE** — Target is a line range in file `types.ts:79-79`
- **LOC_CHANGED** — Represents the change in lines of code `types.ts:109-109`
- **MODIFIED** — Indicates a modification to the documentation `types.ts:89-89`
- **MODULE_INDEX** — Module index (_index.md) `types.ts:33-33`
- **MOVED** — Indicates a move of a documentation entity `types.ts:91-91`
- **NEW** — Indicates a new entity in the documentation `types.ts:105-105`
- **PARTICIPATES** — Process/flow participation `types.ts:53-53`
- **PROCESS** — Technical processes `types.ts:25-25`
- **SECTION** — Generic section `types.ts:37-37`
- **TEST** — Test reference `types.ts:51-51`
- **UNCHANGED** — Indicates no change in the documentation `types.ts:113-113`
- **USES** — Consumer relationship `types.ts:55-55`

### Type_alias
- **DocLanguage** — Represents the language of the documentation `types.ts:97-97`

### Property
- **allRefs** — Represents all references between documentation entities and code `types.ts:513-513`
- **autoGenerated** — Indicates whether a documentation entity is auto-generated `types.ts:197-197`
- **branch** — Branch name associated with the change log entry `types.ts:259-259`
- **brokenRefs** — Counts the number of broken references in documentation `types.ts:344-344`
- **brokenRefs** — Stores the list of broken or invalid references in the documentation `types.ts:628-633`
- **callers** — List of callers for a documentation entity `types.ts:415-420`
- **changes** — Details of changes made in the change log entry `types.ts:263-268`
- **changeType** — Type of change in the change log entry `types.ts:265-265`
- **changeType** — Type of change affecting a documentation entity `types.ts:450-450`
- **charEnd** — Stores the end character number of the source code `types.ts:157-157`
- **charStart** — Stores the start character number of the source code `types.ts:156-156`
- **children** — Children of a parsed section `types.ts:479-479`
- **code** — Code snippet or reference related to a documentation entity `types.ts:411-411`
- **codeChanges** — Code changes related to a documentation entity `types.ts:448-452`
- **codeRefs** — Represents references to code entities in a document `types.ts:393-398`
- **column** — Column number of a parsed reference `types.ts:499-499`
- **commitHash** — Hash of the commit associated with the change log entry `types.ts:257-257`
- **confidence** — Represents the confidence level of a documentation entity `types.ts:199-199`
- **confidence** — Confidence level of a documentation entity `types.ts:454-454`
- **content** — Represents the content of a documentation entity `types.ts:193-193`
- **content** — Stores the content of a document `types.ts:286-286`
- **content** — Content of a parsed section `types.ts:472-472`
- **content** — Content of the documentation entity `types.ts:535-535`
- **content** — Contains content string `types.ts:545-545`
- **context** — Contextual information for a documentation entity `types.ts:419-419`
- **created** — Records the creation timestamp of a configuration `types.ts:316-316`
- **createdAt** — Represents the creation time of a documentation entity `types.ts:205-205`
- **createdAt** — Records the timestamp when a reference was created `types.ts:233-233`
- **createdAt** — Records the creation timestamp of a document `types.ts:296-296`
- **createdFiles** — Stores the list of files created during the initialization process `types.ts:592-592`
- **createTemplates** — Creates templates for documentation entities `types.ts:527-527`
- **dependencies** — List of dependencies for a documentation entity `types.ts:422-426`
- **diffHighlights** — Highlights of changes in the change log entry `types.ts:267-267`
- **docId** — Unique identifier for a documentation entity `types.ts:440-440`
- **docId** — Stores the unique identifier for a documentation file `types.ts:610-610`
- **docRefs** — Manages references to documentation entities `types.ts:290-290`
- **docsDir** — Points to the directory containing documentation files `types.ts:314-314`
- **enabled** — Indicates whether automatic documentation is enabled `types.ts:310-310`
- **enabled** — Indicates whether a feature is enabled `types.ts:326-326`
- **end** — Represents the end line number of a line range `types.ts:391-391`
- **entity** — Represents a documentation entity with a type and other attributes `types.ts:406-413`
- **entityCount** — Stores the count of entities in the source code `types.ts:122-122`
- **entityId** — ID of the entity affected by the change log entry `types.ts:264-264`
- **entityId** — Represents the ID of a code entity `types.ts:394-394`
- **entityId** — Unique identifier for a documentation entity `types.ts:449-449`
- **entityId** — Represents the unique identifier for a documentation entity `types.ts:536-536`
- **entityId** — Stores an entity ID string `types.ts:561-561`
- **entityId** — Optionally stores an entity ID string `types.ts:578-578`
- **entityRefs** — Manages references to code entities `types.ts:292-292`
- **error** — Represents an error or exception during the documentation process `types.ts:601-601`
- **error** — Represents an error message `types.ts:616-616`
- **error** — Represents an error message as a string `types.ts:632-632`
- **errors** — Stores error messages or validation results `types.ts:515-515`
- **existingDoc** — Existing documentation related to a documentation entity `types.ts:428-428`
- **extractedRefs** — Stores the list of extracted references from the documentation `types.ts:612-612`
- **filePath** — Stores the file path of the source code `types.ts:153-153`
- **filePath** — Represents the file path of a documentation entity `types.ts:187-187`
- **filePath** — File path of the comment reference `types.ts:280-280`
- **filePath** — Represents the file path of a document or code entity `types.ts:357-357`
- **filePath** — File path where a documentation entity is located `types.ts:387-387`
- **filePath** — File path of a parsed documentation document `types.ts:395-395`
- **filePath** — Path to the file where documentation is saved `types.ts:410-410`
- **filePath** — Stores the file path of a document `types.ts:418-418`
- **filePath** — Stores the file path of a file `types.ts:442-442`
- **filePath** — Stores a file path string `types.ts:507-507`
- **filePath** — Represents the file path of an entity as a string `types.ts:534-534`
- **filePath** — Stores the file path as a string `types.ts:543-543`
- **filledSections** — Counts the number of filled sections in documentation `types.ts:336-336`
- **fixBrokenRefs** — Fix broken references in documentation entities `types.ts:570-570`
- **fixedRefs** — Represents types of references between documentation and code entities `types.ts:635-635`
- **flowTags** — Tags flows for documentation `types.ts:294-294`
- **hash** — Stores the hash of the source code `types.ts:121-121`
- **highPriority** — Indicates a high-priority task or entity `types.ts:596-596`
- **id** — Represents the unique identifier of a documentation entity `types.ts:183-183`
- **id** — Unique identifier for a change log entry `types.ts:215-215`
- **id** — Represents the unique identifier for a document or code entity `types.ts:253-253`
- **id** — Unique identifier for a documentation entity `types.ts:278-278`
- **id** — Unique identifier for a parsed section `types.ts:377-377`
- **id** — Stores the unique identifier of a document `types.ts:407-407`
- **id** — Stores an identifier string `types.ts:416-416`
- **id** — Represents a unique identifier as a string `types.ts:423-423`, `types.ts:466-466`
- **impactedDocs** — Documentation files impacted by the change log entry `types.ts:270-270`
- **includeCallers** — Include callers in the context `types.ts:563-563`
- **includeCode** — Include code references in the context `types.ts:562-562`
- **language** — Specifies the language of the documentation `types.ts:312-312`
- **language** — Specifies the language of the document `types.ts:328-328`
- **language** — Represents a language type `types.ts:526-526`
- **lastSync** — Represents the last synchronization time of a documentation entity `types.ts:201-201`
- **lastSync** — Represents the last synchronization time for a document `types.ts:347-347`
- **level** — Represents the level of documentation entity `types.ts:165-165`
- **level** — Level of a parsed section `types.ts:468-468`
- **limit** — Limit on the number of results `types.ts:554-554`
- **limit** — Defines the maximum number of entities to process or return `types.ts:579-579`
- **line** — Line number of a parsed reference `types.ts:497-497`
- **lineEnd** — Stores the end line number of the source code `types.ts:155-155`
- **lineEnd** — Represents the end line of a documentation entity `types.ts:171-171`
- **lineEnd** — Represents the end of a line in a document `types.ts:284-284`
- **lineEnd** — Represents the end line number of a code entity `types.ts:397-397`
- **lineEnd** — End line number of a parsed section `types.ts:475-475`
- **lineRange** — Represents a range of lines in a file `types.ts:391-391`
- **lineStart** — Stores the start line number of the source code `types.ts:154-154`
- **lineStart** — Represents the start line of a documentation entity `types.ts:169-169`
- **lineStart** — Start line number of the comment reference `types.ts:282-282`
- **lineStart** — Represents the start line number of a code entity `types.ts:396-396`
- **lineStart** — Start line number of a parsed section `types.ts:474-474`
- **lowPriority** — Indicates a low-priority task or entity `types.ts:598-598`
- **mediumPriority** — Indicates a medium-priority task or entity `types.ts:597-597`
- **name** — Name of a documentation entity `types.ts:408-408`
- **name** — Stores the name of a document `types.ts:417-417`
- **name** — Stores the name of a document. `types `types.ts:424-424`
- **outdatedSections** — Counts the number of outdated sections in documentation `types.ts:338-338`
- **parentEntityId** — Identifies the parent entity of a document `types.ts:288-288`
- **priority** — Represents the priority level of a task or todo item `types.ts:361-361`
- **processes** — Processes related to a documentation entity `types.ts:432-432`
- **projectPath** — Specifies the path to the project `types.ts:318-318`
- **query** — Search query for documentation entities `types.ts:552-552`
- **reason** — Represents the reason or justification for a task or todo item `types.ts:363-363`
- **reason** — Reason for a documentation entity `types.ts:446-446`
- **refId** — Stores the unique identifier for a reference `types.ts:629-629`
- **refs** — References to other documentation entities `types.ts:477-477`
- **refSyntax** — Represents the syntax of a reference between documentation and code `types.ts:227-227`
- **refType** — Represents the type of a reference `types.ts:225-225`
- **relatedDocs** — Related documentation entities `types.ts:430-430`
- **relatedEntityId** — Represents the ID of a related entity in a document or code `types.ts:365-365`
- **scope** — Scope of the search `types.ts:553-553`
- **score** — Represents the relevance or score of a search result `types.ts:385-385`
- **section** — Represents a section within a documentation entity `types.ts:189-189`
- **section** — Represents a section within a document `types.ts:389-389`
- **section** — Section of a documentation entity `types.ts:444-444`
- **section** — Section of the documentation to be saved `types.ts:544-544`
- **sectionId** — Represents the unique identifier for a section in a document `types.ts:355-355`
- **sections** — Sections of a parsed documentation document `types.ts:511-511`
- **signature** — Signature of a function or method related to a documentation entity `types.ts:412-412`
- **since** — Version or date reference for the changelog `types.ts:577-577`
- **snippet** — Represents a code snippet or excerpt from a document or code `types.ts:383-383`
- **sourceFile** — Stores the source file from which a reference was extracted `types.ts:630-630`
- **sourceHash** — Represents the source hash of a documentation entity `types.ts:203-203`
- **sourceLocation** — Represents the source location of a reference `types.ts:219-219`
- **sourceType** — Represents the source type of a reference `types.ts:217-217`
- **start** — Represents the start line number of a line range `types.ts:391-391`
- **stats** — Stores statistics related to documentation `types.ts:330-345`
- **success** — Indicates a successful operation or state `types.ts:590-590`
- **success** — Indicates success status as a boolean `types.ts:608-608`
- **summary** — Summary of the change log entry `types.ts:261-261`
- **summary** — Brief summary of a documentation entity `types.ts:266-266`
- **summary** — Represents a summary string `types.ts:451-451`
- **syntax** — Syntax of a parsed reference `types.ts:487-487`
- **tags** — Represents the tags associated with a documentation entity `types.ts:195-195`
- **target** — Target of a parsed reference `types.ts:491-491`
- **targetEntityId** — Identifies the ID of the target code entity `types.ts:239-239`
- **targetFilePath** — Specifies the file path of the target code entity `types.ts:241-241`
- **targetId** — Represents the target ID of a reference `types.ts:223-223`
- **targetId** — ID of the target of a parsed reference `types.ts:495-495`
- **targetId** — Stores the target identifier for a reference `types.ts:631-631`
- **targetLineEnd** — Indicates the end line number of the target code entity `types.ts:245-245`
- **targetLineStart** — Indicates the start line number of the target code entity `types.ts:243-243`
- **targetType** — Represents the target type of a reference `types.ts:221-221`
- **targetType** — Type of target of a parsed reference `types.ts:493-493`
- **text** — Text of a parsed reference `types.ts:489-489`
- **timestamp** — Timestamp when the change log entry was created `types.ts:255-255`
- **title** — Represents the title of a documentation entity `types.ts:167-167`
- **title** — Represents the title or name of a document or code entity `types.ts:191-191`
- **title** — Title of a parsed section `types.ts:359-359`
- **title** — Stores the title of a document `types.ts:381-381`
- **title** — Holds a title string `types.ts:470-470`
- **title** — Represents the title of an entity as a string `types.ts:509-509`
- **totalDocs** — Counts the total number of documentation entities `types.ts:332-332`
- **totalLoc** — Stores the total lines of code in the source code `types.ts:123-123`
- **totalRefs** — Counts the total number of references in documentation `types.ts:340-340`
- **totalRefs** — Counts the total number of references in the documentation `types.ts:624-624`
- **totalSections** — Counts the total number of sections in documentation `types.ts:334-334`
- **totalSections** — Counts the total number of sections in the documentation `types.ts:595-595`
- **type** — Represents the type of a documentation entity `types.ts:185-185`
- **type** — Represents the type of a document or code entity `types.ts:379-379`
- **type** — Type of a documentation entity `types.ts:409-409`
- **type** — Represents the type of a file `types.ts:425-425`
- **updatedAt** — Represents the last update time of a documentation entity `types.ts:207-207`
- **updatedAt** — Records the timestamp when a reference was last updated `types.ts:235-235`
- **updatedAt** — Records the last update timestamp of a document `types.ts:298-298`
- **valid** — Indicates whether a reference is valid `types.ts:229-229`
- **validationError** — Stores an error message if a reference is invalid `types.ts:231-231`
- **validRefs** — Counts the number of valid references in documentation `types.ts:342-342`
- **validRefs** — Stores the list of valid references in the documentation `types.ts:626-626`
- **warnings** — Stores warnings generated during the documentation process `types.ts:614-614`
- **workPlan** — Represents the plan or strategy for the documentation work `types.ts:594-599`
