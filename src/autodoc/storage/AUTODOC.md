# Storage

## 🤖 Overview

The `autodoc-storage` module provides storage classes for managing documentation entities and references. It includes `DocStorage` and `RefStorage` for handling documentation and references, respectively. The `AutoDocManager` class integrates these storage modules to manage the auto-documentation process.

## 🤖 Architecture

```
AutoDocManager
├── DocStorage
│   └── DocEntity
│       └── DocContext
│           └── DocEntityType
│               └── OutdatedDoc
│                   └── AutoDocTodo
│                       └── AutoDocStatus
│                           └── AutoDocConfig
│                               └── RefStorage
│                                   └── RefEntity
│                                       └── RefContext
│                                           └── RefSourceType
│                                               └── RefTargetType
│                                                   └── RefType
│                                                       └── Relationship
│                                                           └── GraphStorage
│                                                               └── GraphEntity
```

## 🤖 Flow

```
AutoDocManager
├── DocStorage
│   └── parseMarkdown
│       └── flattenSections
│           └── DocEntity
│               └── DocContext
│                   └── DocEntityType
│                       └── OutdatedDoc
│                           └── AutoDocTodo
│                               └── AutoDocStatus
│                                   └── AutoDocConfig
│                                       └── RefStorage
│                                           └── RefEntity
│                                               └── RefContext
│                                                   └── RefSourceType
│                                                       └── RefTargetType
│                                                           └── RefType
│                                                               └── Relationship
│                                                                   └── GraphStorage
│                                                                       └── GraphEntity
```

## 🤖 Entity Listing

### Function
- **callerEntities** — Stores entities that call a document `autodoc-manager.ts:357-360`
- **docsToSave** — Contains a list of documents to be saved `autodoc-manager.ts:171-181`
- **getAutoDocManager** — Retrieves the AutoDoc manager instance `autodoc-manager.ts:671-676`
- **resetAutoDocManager** — Resets the AutoDoc manager to its initial state `autodoc-manager.ts:681-686`
- **statements** — Stores SQL statements for database operations `doc-storage.ts:622-645`
- **statements** — Represents SQL statements for database operations `ref-storage.ts:501-543`
- **validationResults** — Stores the results of validation `autodoc-manager.ts:429-432`

### Method
- **addTodo** — Adds a new todo to the document `autodoc-manager.ts:264-266`
- **addTodo** — Adds a todo item to a document `doc-storage.ts:658-669`
- **clear** — Clears the manager's state `autodoc-manager.ts:644-647`
- **clear** — Clears all documents from the storage `doc-storage.ts:875-879`
- **clear** — Clears all references and comment references from the database `ref-storage.ts:866-870`
- **completeTodo** — Completes a todo related to a document `autodoc-manager.ts:271-273`
- **completeTodo** — Completes a todo item in a document `doc-storage.ts:674-682`
- **constructor** — Constructor for AutoDocManager, initializing DocStorage and RefStorage `autodoc-manager.ts:56-59`
- **constructor** — Initializes the DocStorage instance with a database path `doc-storage.ts:38-40`
- **constructor** — Initializes the RefStorage instance with a database path `ref-storage.ts:37-39`
- **countRefs** — Counts the number of references `ref-storage.ts:622-635`
- **createComment** — Creates a new comment in the database `ref-storage.ts:651-688`
- **createDoc** — Creates a new document in the database `doc-storage.ts:176-212`
- **createRef** — Creates a new reference `ref-storage.ts:162-209`
- **createRefs** — Creates new references in the database `ref-storage.ts:495-547`
- **createTables** — Creates necessary tables in the database `doc-storage.ts:88-159`
- **createTables** — Creates necessary tables in the SQLite database for storing references `ref-storage.ts:86-153`
- **deleteComment** — Deletes a comment from the database `ref-storage.ts:731-739`
- **deleteCommentsByFile** — Deletes comments by file `ref-storage.ts:773-782`
- **deleteDoc** — Deletes a document from the database `doc-storage.ts:257-265`
- **deleteRef** — Deletes a reference `ref-storage.ts:255-263`
- **deleteRefsBySource** — Deletes references by their source `ref-storage.ts:467-476`
- **deleteRefsByTarget** — Deletes references by their target `ref-storage.ts:481-490`
- **destroy** — Destroys the AutoDoc manager instance `autodoc-manager.ts:652-658`
- **destroy** — Removes a specific document from the storage `doc-storage.ts:884-890`
- **destroy** — Closes the client connection and sets the initialized flag to false `ref-storage.ts:875-881`
- **ensureReady** — Ensures the storage is ready for operations `doc-storage.ts:79-83`
- **ensureReady** — Ensures the storage is initialized before use `ref-storage.ts:77-81`
- **extractFilePath** — Extracts the file path `autodoc-manager.ts:604-608`
- **extractLineEnd** — Extracts the end line number `autodoc-manager.ts:621-624`
- **extractLineStart** — Extracts the start line number `autodoc-manager.ts:613-616`
- **generateCommentId** — Generates a unique comment ID `ref-storage.ts:644-646`
- **generateDocId** — Generates a unique document ID `doc-storage.ts:168-171`
- **getAllDocs** — Retrieves all documents `doc-storage.ts:375-431`
- **getAllDocuments** — Retrieves all documents `autodoc-manager.ts:278-280`
- **getAllReferences** — Retrieves all references `autodoc-manager.ts:457-459`
- **getAllRefs** — Retrieves all references from the database `ref-storage.ts:552-617`
- **getBrokenReferences** — Retrieves broken references in the document `autodoc-manager.ts:410-412`
- **getBrokenRefs** — Retrieves broken references `ref-storage.ts:387-425`
- **getChangelog** — Retrieves the changelog `autodoc-manager.ts:574-578`
- **getChangelog** — Retrieves the changelog for a document `doc-storage.ts:756-793`
- **getComment** — Retrieves a specific comment `ref-storage.ts:744-754`
- **getCommentsByFile** — Retrieves comments by file `ref-storage.ts:759-768`
- **getConfig** — Method to get AutoDoc configuration `autodoc-manager.ts:113-115`
- **getDoc** — Retrieves a document by ID `doc-storage.ts:270-311`
- **getDocByEntityId** — Retrieves a document by its entity ID `doc-storage.ts:524-529`
- **getDocContext** — Retrieves the context of a document `autodoc-manager.ts:298-387`
- **getDocsByFile** — Retrieves documents by file name `doc-storage.ts:316-356`
- **getDocsByType** — Retrieves documents by type `doc-storage.ts:361-370`
- **getDocument** — Retrieves a document from the storage `autodoc-manager.ts:236-238`
- **getDocumentsByFile** — Retrieves documents by file name `autodoc-manager.ts:243-245`
- **getLastSync** — Method to get last sync time `autodoc-manager.ts:140-143`
- **getMaxLastSync** — Retrieves the maximum last sync timestamp for documents `doc-storage.ts:436-445`
- **getOutdatedDocs** — Retrieves outdated documents based on confidence threshold `autodoc-manager.ts:250-252`
- **getOutdatedDocs** — Retrieves outdated documentation entries based on confidence threshold `doc-storage.ts:577-595`
- **getProjectContext** — Retrieves the current project context `doc-storage.ts:52-54`
- **getProjectContext** — Returns the current project context for branch isolation `ref-storage.ts:51-53`
- **getRef** — Retrieves a reference by ID `ref-storage.ts:268-278`
- **getReferences** — Retrieves references to a document `autodoc-manager.ts:396-398`
- **getReferencesTo** — Retrieves documents referenced by a given entity `autodoc-manager.ts:403-405`
- **getRefsBySource** — Retrieves references by source `ref-storage.ts:283-323`
- **getRefsByTarget** — Retrieves references by target `ref-storage.ts:328-367`
- **getRefsByTargetLines** — Retrieves references by target lines `ref-storage.ts:372-382`
- **getSourceHash** — Gets the source hash of a document `doc-storage.ts:535-544`
- **getStats** — Retrieves statistics about the document storage `doc-storage.ts:802-834`
- **getStats** — Retrieves statistics about references and comments `ref-storage.ts:791-809`
- **getStatus** — Method to get AutoDoc status `autodoc-manager.ts:120-135`
- **getTodos** — Retrieves todos related to documents `autodoc-manager.ts:257-259`
- **getTodos** — Retrieves all todo items in a document `doc-storage.ts:687-721`
- **inferDocType** — Infers the document type `autodoc-manager.ts:587-599`
- **initialize** — Method to initialize the AutoDoc manager `autodoc-manager.ts:64-75`
- **initialize** — Initializes the storage and creates tables if needed `doc-storage.ts:59-77`
- **initialize** — Initializes storage and creates tables if needed `ref-storage.ts:58-75`
- **invalidateRef** — Invalidates a reference `ref-storage.ts:430-434`
- **isInitialized** — Method to check if the AutoDoc manager is initialized `autodoc-manager.ts:95-97`
- **markOutdated** — Marks a document as outdated `doc-storage.ts:600-611`
- **onEntityModified** — Handles entity modification events `autodoc-manager.ts:530-554`
- **onFileRenamed** — Handles file renaming events `autodoc-manager.ts:559-569`
- **recordChange** — Records a change in a document `doc-storage.ts:730-751`
- **rowToComment** — Converts a row to a comment reference object `ref-storage.ts:847-861`
- **rowToDocEntity** — Converts a database row to a DocEntity object `doc-storage.ts:854-870`
- **rowToReference** — Converts a row to a reference object `ref-storage.ts:818-842`
- **saveDocument** — Saves a document to the storage `autodoc-manager.ts:153-217`
- **saveSectionContent** — Saves content of a section in a document `autodoc-manager.ts:222-231`
- **searchByText** — Searches for documents by text content `doc-storage.ts:450-514`
- **searchDocsByText** — Searches documents by text content `autodoc-manager.ts:286-288`
- **setConfig** — Method to set AutoDoc configuration `autodoc-manager.ts:106-108`
- **setGraphStorage** — Method to set GraphStorage for entity lookups `autodoc-manager.ts:80-82`
- **setProjectContext** — Sets the project context for both document and reference storage `autodoc-manager.ts:87-90`
- **setProjectContext** — Sets the current project context for branch-aware operations `doc-storage.ts:45-47`
- **setProjectContext** — Sets the project context for branch isolation `ref-storage.ts:44-46`
- **slugify** — Converts text to a slug `autodoc-manager.ts:629-635`
- **slugify** — Converts a string to a URL-friendly slug `doc-storage.ts:843-849`
- **updateComment** — Updates an existing comment `ref-storage.ts:693-726`
- **updateDoc** — Updates an existing document in the database `doc-storage.ts:217-252`
- **updateRef** — Updates an existing reference `ref-storage.ts:214-250`
- **updateReferencesForMove** — Updates references for a moved entity `autodoc-manager.ts:501-521`
- **updateTargetLines** — Updates the target lines of references `ref-storage.ts:448-462`
- **upsertDirectoryDoc** — Upserts a directory document into the storage `doc-storage.ts:550-572`
- **upsertDocs** — Upserts multiple documents into the storage `doc-storage.ts:616-649`
- **validateRef** — Validates a reference against the database schema `ref-storage.ts:439-443`
- **validateReferences** — Validates references in the document `autodoc-manager.ts:418-452`
- **validateSingleRef** — Validates a single reference `autodoc-manager.ts:464-496`

### Class
- **AutoDocManager** — Central manager for AutoDoc functionality, integrating DocStorage, RefStorage, and GraphStorage `autodoc-manager.ts:49-659`
- **DocStorage** — Represents a class for managing documentation storage with CRUD operations and schema creation `doc-storage.ts:32-891`
- **RefStorage** — A class for managing references between documents, code, and comments `ref-storage.ts:31-882`

### Interface
- **ChangelogRow** — Represents a row in the changelog table `doc-storage.ts:925-933`
- **CommentRow** — Represents a row in the comment references table `ref-storage.ts:910-922`
- **DocEntityRow** — Represents a row in the database for a document entity `doc-storage.ts:897-911`
- **GraphStorageWithIncoming** — Extension interface for GraphStorage with optional getIncomingRelationships method `autodoc-manager.ts:45-47`
- **RefRow** — Represents a reference row with metadata about the source and target entities `ref-storage.ts:888-908`
- **TodoRow** — Represents a row in the database for a todo entity `doc-storage.ts:913-923`

### Import_decl
- **../../storage/libsql/types.js** — Imports `../../storage/libsql/types.js` from `../../storage/libsql/types.js`. `autodoc-manager.ts:13-13`, `doc-storage.ts:16-16`, `doc-storage.ts:17-17`, `ref-storage.ts:16-16`, `ref-storage.ts:17-17`
- **../../storage/native-sqlite-client.js** — Imports `../../storage/native-sqlite-client.js` from `../../storage/native-sqlite-client.js`. `doc-storage.ts:18-18`, `ref-storage.ts:18-18`
- **../../types/storage.js** — Imports `../../types/storage.js` from `../../types/storage.js`. `autodoc-manager.ts:14-14`
- **../../utils/parallel.js** — Imports `../../utils/parallel.js` from `../../utils/parallel.js`. `autodoc-manager.ts:15-15`
- **../parser/md-parser.js** — Imports `../parser/md-parser.js` from `../parser/md-parser.js`. `autodoc-manager.ts:16-16`
- **../types.js** — Imports `../types.js`. `autodoc-manager.ts:17-26`
- **../types.js** — Imports `../types.js` from `../types.js`. `autodoc-manager.ts:27-27`, `doc-storage.ts:19-19`, `ref-storage.ts:19-19`
- **./doc-storage.js** — Imports `./doc-storage.js` from `./doc-storage.js`. `autodoc-manager.ts:28-28`
- **./ref-storage.js** — Imports `./ref-storage.js` from `./ref-storage.js`. `autodoc-manager.ts:29-29`
- **nanoid** — Imports `nanoid` from `nanoid`. `doc-storage.ts:15-15`, `ref-storage.ts:15-15`

### Property
- **auto_generated** — Indicates if the document was auto-generated `doc-storage.ts:905-905`
- **autoGenerated** — Indicates whether a document is auto-generated `autodoc-manager.ts:158-158`
- **branch** — Specifies the branch for the changelog `autodoc-manager.ts:575-575`
- **branch** — Represents the branch context for document operations `doc-storage.ts:757-757`
- **branch** — Stores the branch name of a document entity `doc-storage.ts:929-929`
- **broken** — Indicates the number of broken references `autodoc-manager.ts:421-421`
- **brokenRefs** — Returns the number of broken references `ref-storage.ts:791-791`
- **changes** — Lists the changes made to a document entity `doc-storage.ts:931-931`
- **client** — Stores the NativeSQLiteClient instance for database operations `doc-storage.ts:33-33`
- **client** — A NativeSQLiteClient instance for interacting with the database `ref-storage.ts:32-32`
- **commit_hash** — Stores the commit hash of a document entity `doc-storage.ts:928-928`
- **completed** — Indicates whether a document has been completed `doc-storage.ts:920-920`
- **completed_at** — Stores the timestamp when a document was completed `doc-storage.ts:922-922`
- **confidence** — Confidence level of the document entity `doc-storage.ts:906-906`
- **config** — AutoDoc configuration `autodoc-manager.ts:54-54`
- **content** — Content of the document entity `doc-storage.ts:903-903`
- **content** — Content of a reference `ref-storage.ts:915-915`
- **count** — Counts the number of documents `doc-storage.ts:806-806`
- **count** — Counts the number of documents in the storage `doc-storage.ts:811-811`
- **count** — Calculates the count of filled sections from a database query result `doc-storage.ts:816-816`
- **count** — Parses the count from outdated sections result `doc-storage.ts:822-822`
- **count** — Counts the number of references `ref-storage.ts:634-634`
- **count** — Extracts the count of valid references from a database query result `ref-storage.ts:795-795`
- **count** — Extracts the count of total comments from a database query result `ref-storage.ts:798-798`
- **count** — Parses the count from a database query result `ref-storage.ts:801-801`
- **created_at** — Creation time of the document entity `doc-storage.ts:909-909`
- **created_at** — Stores the timestamp when a document was created `doc-storage.ts:921-921`
- **created_at** — Stores the timestamp when the reference was created `ref-storage.ts:902-902`
- **created_at** — Timestamp when a reference was created `ref-storage.ts:920-920`
- **currentContext** — Stores the current project context for branch-aware operations `doc-storage.ts:36-36`
- **currentContext** — The current project context for branch isolation `ref-storage.ts:35-35`
- **dbPath** — Holds the path to the database file `doc-storage.ts:34-34`
- **dbPath** — The file path to the database `ref-storage.ts:33-33`
- **doc_refs** — References to documents `ref-storage.ts:917-917`
- **docStorage** — Instance of DocStorage for document management `autodoc-manager.ts:50-50`
- **entity_refs** — References to entities `ref-storage.ts:918-918`
- **error** — Stores an error message `autodoc-manager.ts:421-421`
- **error** — Stores a reference and its associated error in an array `autodoc-manager.ts:424-424`
- **error** — Validates a single reference and returns whether it is valid along with an optional error message `autodoc-manager.ts:464-464`
- **file_path** — File path of the document entity `doc-storage.ts:900-900`
- **file_path** — Stores the file path of a document entity `doc-storage.ts:915-915`
- **file_path** — Path to the file containing the reference `ref-storage.ts:912-912`
- **flow_tags** — Flow tags associated with a reference `ref-storage.ts:919-919`
- **fromId** — Retrieves a document by its ID `autodoc-manager.ts:335-335`
- **getIncomingRelationships** — Method to get incoming relationships for an entity `autodoc-manager.ts:46-46`
- **graphStorage** — GraphStorage instance for entity lookups `autodoc-manager.ts:52-52`
- **id** — Unique identifier for a document entity `doc-storage.ts:898-898`
- **id** — Represents the unique identifier of a document entity `doc-storage.ts:914-914`
- **id** — Represents the unique identifier for a document `doc-storage.ts:926-926`
- **id** — Stores the unique identifier for a reference row `ref-storage.ts:889-889`
- **id** — Unique identifier for a reference `ref-storage.ts:911-911`
- **impacted_docs** — Lists the documents impacted by a change `doc-storage.ts:932-932`
- **includeCallers** — Includes callers in the document context `autodoc-manager.ts:302-302`
- **includeCode** — Includes code in the document context `autodoc-manager.ts:301-301`
- **initialized** — Boolean indicating if the AutoDoc manager is initialized `autodoc-manager.ts:53-53`
- **initialized** — Indicates whether the storage has been initialized `doc-storage.ts:35-35`
- **initialized** — A boolean indicating whether the storage has been initialized `ref-storage.ts:34-34`
- **last_sync** — Last synchronization time of the document entity `doc-storage.ts:907-907`
- **limit** — Limits the number of changelog entries `autodoc-manager.ts:575-575`
- **limit** — Limits the number of changelog entries returned `doc-storage.ts:757-757`
- **limit** — Defines the maximum number of documents to retrieve in a single query `doc-storage.ts:375-375`
- **limit** — Limits the number of references returned `ref-storage.ts:552-552`
- **line** — Represents a line of code or text `autodoc-manager.ts:335-335`
- **line_end** — End line number of a reference `ref-storage.ts:914-914`
- **line_start** — Start line number of a reference `ref-storage.ts:913-913`
- **max_sync** — Stores the maximum sync timestamp for documents `doc-storage.ts:443-443`
- **maxCallers** — Sets the maximum number of callers to include `autodoc-manager.ts:303-303`
- **offset** — Represents the offset for pagination in query results `doc-storage.ts:375-375`
- **offset** — Sets the starting point for retrieving references `ref-storage.ts:552-552`
- **parent_entity_id** — ID of the parent entity for a reference `ref-storage.ts:916-916`
- **priority** — Priority level of the todo entity `doc-storage.ts:917-917`
- **reason** — Reason for the todo entity `doc-storage.ts:918-918`
- **ref** — Stores a reference `autodoc-manager.ts:421-421`
- **ref** — Stores a reference and its associated error in an array `autodoc-manager.ts:424-424`
- **ref_syntax** — Represents the syntax of the reference `ref-storage.ts:899-899`
- **ref_type** — Represents the type of reference `ref-storage.ts:898-898`
- **refStorage** — Instance of RefStorage for reference management `autodoc-manager.ts:51-51`
- **related_entity_id** — Represents the ID of a related entity in the database `doc-storage.ts:919-919`
- **relatedEntityId** — Stores the ID of a related entity `autodoc-manager.ts:159-159`
- **section** — Section of the document entity `doc-storage.ts:901-901`
- **sectionId** — Represents the ID of a section within a document `doc-storage.ts:658-658`
- **since** — Specifies the start date for the changelog `autodoc-manager.ts:575-575`
- **since** — Specifies the start date for changelog retrieval `doc-storage.ts:757-757`
- **source_char_end** — Stores the end character number of the source entity for a reference, or null if not applicable `ref-storage.ts:895-895`
- **source_char_start** — Stores the start character number of the source entity for a reference, or null if not applicable `ref-storage.ts:894-894`
- **source_file_path** — Stores the file path of the source entity for a reference `ref-storage.ts:891-891`
- **source_hash** — Stores the source hash of a document `doc-storage.ts:543-543`
- **source_hash** — Hash of the source of the document entity `doc-storage.ts:908-908`
- **source_line_end** — Indicates the end line number of the source entity for a reference `ref-storage.ts:893-893`
- **source_line_start** — Indicates the start line number of the source entity for a reference `ref-storage.ts:892-892`
- **source_type** — Specifies the type of the source entity for a reference `ref-storage.ts:890-890`
- **summary** — Provides a summary of a document entity `doc-storage.ts:930-930`
- **tags** — Tags associated with the document entity `doc-storage.ts:904-904`
- **target_entity_id** — Stores the ID of the target entity `ref-storage.ts:904-904`
- **target_file_path** — Stores the file path of the target entity `ref-storage.ts:905-905`
- **target_id** — Represents the unique identifier for a target in the database `ref-storage.ts:897-897`
- **target_line_end** — Represents the end line number of a target entity `ref-storage.ts:907-907`
- **target_line_start** — Stores the start line number of the target entity `ref-storage.ts:906-906`
- **target_type** — Specifies the type of the target entity for a reference `ref-storage.ts:896-896`
- **timestamp** — Stores the timestamp of a document entity `doc-storage.ts:927-927`
- **title** — Title of the document entity `doc-storage.ts:902-902`
- **title** — Stores the title of a document entity `doc-storage.ts:916-916`
- **total** — Represents the total number of references `autodoc-manager.ts:419-419`
- **totalComments** — Returns the total number of comments `ref-storage.ts:791-791`
- **totalRefs** — Returns the total number of references `ref-storage.ts:791-791`
- **type** — Represents the type of a document `autodoc-manager.ts:157-157`
- **type** — Type of the document entity `doc-storage.ts:899-899`
- **updated_at** — Last update time of the document entity `doc-storage.ts:910-910`
- **updated_at** — Stores the timestamp when the reference was last updated `ref-storage.ts:903-903`
- **updated_at** — Timestamp when a reference was last updated `ref-storage.ts:921-921`
- **valid** — Indicates the number of valid references `autodoc-manager.ts:420-420`
- **valid** — Validates a single reference and returns whether it is valid along with an optional error message `autodoc-manager.ts:464-464`
- **valid** — Indicates whether the reference is valid `ref-storage.ts:900-900`
- **validation_error** — Stores the validation error message if the reference is invalid `ref-storage.ts:901-901`
- **validOnly** — Filters references to only valid ones `ref-storage.ts:552-552`
- **validRefs** — Returns the number of valid references `ref-storage.ts:791-791`

### embedded_sql
- **ALTER TABLE doc_entities ADD COLUMN source_hash TEXT NOT NULL DEFAULT** — Adds a new column `source_hash` to the `doc_entities` table with a default value of an empty string `doc-storage.ts:156-156`
- **CREATE INDEX IF NOT EXISTS idx_changelog_branch ON doc_changelog(branch)** — Creates an index on the `branch` column of the `doc_changelog` table if it does not exist `doc-storage.ts:133-133`
- **CREATE INDEX IF NOT EXISTS idx_changelog_commit ON doc_changelog(commit_hash)** — Creates an index on the commit_hash column of the doc_changelog table `doc-storage.ts:132-132`
- **CREATE INDEX IF NOT EXISTS idx_changelog_time ON doc_changelog(timestamp)** — Creates an index on the timestamp column of the doc_changelog table `doc-storage.ts:131-131`
- **CREATE INDEX IF NOT EXISTS idx_comment_branch ON comment_refs(project_hash, branch_name)** — Creates an index on the project_hash and branch_name columns of the comment_refs table `ref-storage.ts:151-151`
- **CREATE INDEX IF NOT EXISTS idx_comment_file ON comment_refs(file_path)** — Creates an index on the file_path column of the comment_refs table `ref-storage.ts:145-145`
- **CREATE INDEX IF NOT EXISTS idx_comment_lines ON comment_refs(file_path, line_start, line_end)** — Creates an index on the file_path, line_start, and line_end columns of the comment_refs table `ref-storage.ts:148-148`
- **CREATE INDEX IF NOT EXISTS idx_comment_parent ON comment_refs(parent_entity_id)** — Creates an index on the parent_entity_id column of the comment_refs table `ref-storage.ts:146-146`
- **CREATE INDEX IF NOT EXISTS idx_doc_branch ON doc_entities(project_hash, branch_name)** — Creates an index on the project_hash and branch_name columns of the doc_entities table `doc-storage.ts:116-116`
- **CREATE INDEX IF NOT EXISTS idx_doc_confidence ON doc_entities(confidence)** — Creates an index on the confidence column of the doc_entities table `doc-storage.ts:114-114`
- **CREATE INDEX IF NOT EXISTS idx_doc_file ON doc_entities(file_path)** — Creates an index on the file_path column of the doc_entities table `doc-storage.ts:111-111`
- **CREATE INDEX IF NOT EXISTS idx_doc_section ON doc_entities(section)** — Creates an index on the section column of the doc_entities table `doc-storage.ts:113-113`
- **CREATE INDEX IF NOT EXISTS idx_doc_type ON doc_entities(type)** — Creates an index on the type column of the doc_entities table `doc-storage.ts:112-112`
- **CREATE INDEX IF NOT EXISTS idx_doc_updated ON doc_entities(updated_at)** — Creates an index on the updated_at column of the doc_entities table `doc-storage.ts:115-115`
- **CREATE INDEX IF NOT EXISTS idx_ref_branch ON doc_references(project_hash, branch_name)** — Creates an index on the combination of `project_hash` and `branch_name` columns of the `doc_references` table if it doesn't already exist `ref-storage.ts:124-124`
- **CREATE INDEX IF NOT EXISTS idx_ref_source_file ON doc_references(source_file_path)** — Creates an index on the source file path column of the doc_references table `ref-storage.ts:116-116`
- **CREATE INDEX IF NOT EXISTS idx_ref_source_type ON doc_references(source_type)** — Creates an index on the source type column of the doc_references table `ref-storage.ts:117-117`
- **CREATE INDEX IF NOT EXISTS idx_ref_target_entity ON doc_references(target_entity_id)** — Creates an index on the target entity ID column of the doc_references table `ref-storage.ts:120-120`
- **CREATE INDEX IF NOT EXISTS idx_ref_target_file ON doc_references(target_file_path)** — Creates an index on the target file path column of the doc_references table `ref-storage.ts:121-121`
- **CREATE INDEX IF NOT EXISTS idx_ref_target_id ON doc_references(target_id)** — Creates an index on the target ID column of the doc_references table `ref-storage.ts:118-118`
- **CREATE INDEX IF NOT EXISTS idx_ref_target_type ON doc_references(target_type)** — Creates an index on the target type column of the doc_references table `ref-storage.ts:119-119`
- **CREATE INDEX IF NOT EXISTS idx_ref_type ON doc_references(ref_type)** — Creates an index on the `ref_type` column of the `doc_references` table if it doesn't already exist `ref-storage.ts:123-123`
- **CREATE INDEX IF NOT EXISTS idx_ref_valid ON doc_references(valid)** — Creates an index on the `valid` column of the `doc_references` table if it doesn't already exist `ref-storage.ts:122-122`
- **CREATE INDEX IF NOT EXISTS idx_todo_completed ON doc_todos(completed)** — Creates an index on the `completed` column of the `doc_todos` table `doc-storage.ts:151-151`
- **CREATE INDEX IF NOT EXISTS idx_todo_file ON doc_todos(file_path)** — Creates an index on the `file_path` column of the `doc_todos` table `doc-storage.ts:152-152`
- **CREATE INDEX IF NOT EXISTS idx_todo_priority ON doc_todos(priority)** — Creates an index on the `priority` column of the `doc_todos` table `doc-storage.ts:150-150`
- **CREATE TABLE IF NOT EXISTS comment_refs ( id TEXT PRIMARY KEY, file_path TEXT NOT NULL, line_start I** — Creates a table `comment_refs` with specified columns if it doesn't already exist `ref-storage.ts:127-143`
- **CREATE TABLE IF NOT EXISTS doc_changelog ( id TEXT PRIMARY KEY, timestamp INTEGER NOT NULL, commit_h** — Creates a new table for storing changelog information if it does not exist `doc-storage.ts:119-129`
- **CREATE TABLE IF NOT EXISTS doc_entities ( id TEXT PRIMARY KEY, type TEXT NOT NULL, file_path TEXT NO** — Creates a table to store document entities with various attributes `doc-storage.ts:92-109`
- **CREATE TABLE IF NOT EXISTS doc_references ( id TEXT PRIMARY KEY, source_type TEXT NOT NULL, source_f** — Creates a table for storing document references with various fields `ref-storage.ts:90-114`
- **CREATE TABLE IF NOT EXISTS doc_todos ( id TEXT PRIMARY KEY, file_path TEXT NOT NULL, title TEXT NOT N** — Creates a table `doc_todos` with specified columns and constraints if it does not exist `doc-storage.ts:136-148`
- **DELETE FROM comment_refs** — Deletes all comment references `ref-storage.ts:869-869`
- **DELETE FROM comment_refs WHERE file_path = ?** — Deletes comment references by file path `ref-storage.ts:777-777`
- **DELETE FROM comment_refs WHERE id = ?** — Deletes a comment reference by its ID `ref-storage.ts:735-735`
- **DELETE FROM doc_changelog** — Deletes all entries from the doc_changelog table `doc-storage.ts:878-878`
- **DELETE FROM doc_entities** — Deletes all rows from the doc_entities table. `doc-storage.ts:878 `doc-storage.ts:878-878`
- **DELETE FROM doc_entities WHERE id = ?** — Deletes a document entity from the database based on its ID `doc-storage.ts:261-261`
- **DELETE FROM doc_references** — Deletes all document references `ref-storage.ts:869-869`
- **DELETE FROM doc_references WHERE id = ?** — Deletes a record from the doc_references table where the id matches the specified value. `ref-storage.ts `ref-storage.ts:259-259`
- **DELETE FROM doc_references WHERE source_file_path = ?** — Executes a SQL query to delete references from a specific file path `ref-storage.ts:471-471`
- **DELETE FROM doc_references WHERE target_id = ?** — Deletes references where the target ID matches the provided value `ref-storage.ts:485-485`
- **DELETE FROM doc_todos** — Deletes all entries from the doc_todos table `doc-storage.ts:878-878`
- **INSERT INTO comment_refs ( id, file_path, line_start, line_end, content, parent_entity_id, doc_refs,** — Inserts a new comment reference into the database with specified fields. `ref-storage.ts:665-6 `ref-storage.ts:665-669`
- **INSERT INTO doc_changelog (id, timestamp, commit_hash, branch, summary, changes, impacted_docs) VALU** — Inserts a new changelog entry into the database `doc-storage.ts:737-738`
- **INSERT INTO doc_entities (id, type, file_path, section, title, content, tags, auto_generated, confid** — Inserts a new document entity into the `doc_entities` table with specified fields `doc-storage.ts:190-191`
- **INSERT INTO doc_entities (id, type, file_path, section, title, content, tags, auto_generated, confid** — Inserts a new document entity into the database `doc-storage.ts:555-557`
- **INSERT INTO doc_references ( id, source_type, source_file_path, source_line_start, source_line_end, s** — Inserts a new record into the doc_references table with specified fields `ref-storage.ts:176-182`
- **INSERT INTO doc_references ( id, source_type, source_file_path, source_line_start, source_line_end, s** — Inserts a new reference into the database with specified fields `ref-storage.ts:512-518`
- **SELECT * FROM comment_refs WHERE file_path = ? ORDER BY line_start** — Retrieves comment references by file path and orders them by line start `ref-storage.ts:763-763`
- **SELECT * FROM comment_refs WHERE id = ?** — Retrieves a comment reference by its ID `ref-storage.ts:748-748`
- **SELECT * FROM doc_changelog WHERE 1=1** — Parses a SQL query to select all rows from the doc_changelog table `doc-storage.ts:763-763`
- **SELECT * FROM doc_entities WHERE (title LIKE ? COLLATE NOCASE OR content LIKE ? COLLATE NOCASE) AND p** — Selects entities based on title or content matching a pattern `doc-storage.ts:458-464`
- **SELECT * FROM doc_entities WHERE confidence < ? ORDER BY confidence ASC** — Selects document entities with confidence less than a given value, ordered by confidence `doc-storage.ts:581-581`
- **SELECT * FROM doc_entities WHERE file_path = ? AND project_hash = ? AND branch_name = ? ORDER BY sec** — Retrieves document entities based on their file path, project hash, and branch name, ordered by section `doc-storage.ts:322-322`
- **SELECT * FROM doc_entities WHERE id = ? AND project_hash = ? AND branch_name = ?** — Retrieves a document entity based on its ID, project hash, and branch name `doc-storage.ts:276-276`
- **SELECT * FROM doc_entities WHERE project_hash = ? AND branch_name = ? ORDER BY file_path, section** — Parses a SQL query to select entities based on project hash and branch name `doc-storage.ts:382-382`
- **SELECT * FROM doc_entities WHERE type = ? ORDER BY file_path, section** — Retrieves document entities based on their type, ordered by file path and section `doc-storage.ts:365-365`
- **SELECT * FROM doc_references WHERE id = ?** — Selects all columns from the `ref-storage.ts:272-272`
- **SELECT * FROM doc_references WHERE project_hash = ? AND branch_name = ?** — Selects all references where the project hash and branch name match the provided values `ref-storage.ts:559-559`
- **SELECT * FROM doc_references WHERE source_file_path = ? AND project_hash = ? AND branch_name = ? ORD** — Executes a SQL query to select all references from a specific file path, project hash, and branch name `ref-storage.ts:289-289`
- **SELECT * FROM doc_references WHERE target_file_path = ? AND target_line_start >= ? AND target_line_e** — Selects references where the target file path matches and the line range is within the specified bounds `ref-storage.ts:376-377`
- **SELECT * FROM doc_references WHERE target_id = ? AND project_hash = ? AND branch_name = ?** — Executes a SQL query to select all references with a specific target ID, project hash, and branch name `ref-storage.ts:334-334`
- **SELECT * FROM doc_references WHERE valid = 0 AND project_hash = ? AND branch_name = ? ORDER BY sourc** — Retrieves invalid references for a specific project and branch, ordered by source file path and line start `ref-storage.ts:393-393`
- **SELECT * FROM doc_todos WHERE completed = 0 AND priority = ? ORDER BY created_at ASC** — Selects incomplete todos with a specific priority, ordered by creation time `doc-storage.ts:693-695`
- **SELECT * FROM doc_todos WHERE completed = 0 ORDER BY CASE priority WHEN 'high' THEN 1 WHEN 'medium' T** — Selects incomplete todos ordered by priority and creation time `doc-storage.ts:699-707`
- **SELECT COUNT(*) as count FROM comment_refs** — Counts the number of comment references `ref-storage.ts:800-800`
- **SELECT COUNT(*) as count FROM doc_entities** — Executes a SQL query to count all rows in the doc_entities table `doc-storage.ts:805-805`
- **SELECT COUNT(*) as count FROM doc_entities WHERE confidence < ?** — Executes a SQL query to count rows in the doc_entities table where the confidence is less than a given value `doc-storage.ts:819-819`
- **SELECT COUNT(*) as count FROM doc_entities WHERE section IS NOT NULL** — Executes a SQL query to count rows in the doc_entities table where the section is not null `doc-storage.ts:809-809`
- **SELECT COUNT(*) as count FROM doc_entities WHERE section IS NOT NULL AND LENGTH(content) > 50** — Executes a SQL query to count rows in the doc_entities table where the section is not null and the content length is greater than 50 `doc-storage.ts:814-814`
- **SELECT COUNT(*) as count FROM doc_references** — Counts the number of references in the database `ref-storage.ts:625-625`
- **SELECT COUNT(*) as count FROM doc_references** — Counts the number of document references `ref-storage.ts:794-794`
- **SELECT COUNT(*) as count FROM doc_references WHERE valid = 1** — Counts the number of valid document references `ref-storage.ts:797-797`
- **SELECT MAX(last_sync) as max_sync FROM doc_entities WHERE last_sync IS NOT NULL** — Returns the maximum last sync timestamp from entities `doc-storage.ts:440-440`
- **SELECT source_hash FROM doc_entities WHERE id = ? AND project_hash = ? AND branch_name = ?** — Retrieves the source hash of a document entity based on its ID, project hash, and branch name `doc-storage.ts:539-539`
- **UPDATE comment_refs SET content = ?, parent_entity_id = ?, doc_refs = ?, entity_refs = ?, flow_tags =** — Updates comment references with new content, parent entity ID, doc references, entity references, flow tags, and updated_at `ref-storage.ts:710-713`
- **UPDATE doc_entities SET type = ?, title = ?, content = ?, tags = ?, auto_generated = ?, confidence =** — Updates the type, title, content, tags, auto_generated, confidence, last_sync, source_hash, and updated_at fields of a document entity `doc-storage.ts:234-236`
- **UPDATE doc_references SET target_id = ?, ref_syntax = ?, valid = ?, validation_error = ?, updated_at** — Updates the target_id, ref_syntax, valid, validation_error, and updated_at fields of the doc_references table `ref-storage.ts:231-234`
- **UPDATE doc_references SET target_line_start = target_line_start + ?, target_line_end = target_line_e** — Updates the line range and timestamp for references where the target file path matches and the line start is greater than or equal to a specified value `ref-storage.ts:452-457`
- **UPDATE doc_todos SET completed = 1, completed_at = ? WHERE id = ?** — Updates the status of a todo item to completed with a specific completion time `doc-storage.ts:678-678`
- **WITH combined AS ( SELECT *, 1 as priority FROM doc_entities WHERE (title LIKE ? COLLATE NOCASE OR c** — Builds a SQL query to combine entities with different priorities based on title or content `doc-storage.ts:480-498`
- **WITH combined AS ( SELECT *, 1 as priority FROM doc_entities WHERE file_path = ? AND project_hash = ?** — Combines and prioritizes document entities based on their file path, project hash, and branch name `doc-storage.ts:331-344`
- **WITH combined AS ( SELECT *, 1 as priority FROM doc_entities WHERE id = ? AND project_hash = ? AND b** — Combines and prioritizes document entities based on their ID, project hash, and branch name `doc-storage.ts:286-298`
- **WITH combined AS ( SELECT *, 1 as priority FROM doc_entities WHERE project_hash = ? AND branch_name =** — Builds a SQL query to combine entities with different priorities `doc-storage.ts:399-412`
- **WITH combined AS ( SELECT *, 1 as priority FROM doc_references WHERE project_hash = ? AND branch_nam** — Combines references with a priority and selects the top one based on the priority `ref-storage.ts:585-598`
- **WITH combined AS ( SELECT *, 1 as priority FROM doc_references WHERE source_file_path = ? AND projec** — Constructs a SQL query to combine references with priority and select the top one `ref-storage.ts:298-311`
- **WITH combined AS ( SELECT *, 1 as priority FROM doc_references WHERE target_id = ? AND project_hash =** — Constructs a SQL query to combine references with priority and select the top one `ref-storage.ts:343-355`
- **WITH combined AS ( SELECT *, 1 as priority FROM doc_references WHERE valid = 0 AND project_hash = ? A** — Constructs a SQL query to combine references with priority and select the top one `ref-storage.ts:402-415`

## Data Flow

- **Inputs**: Markdown content with file paths, parsed references from the parser module, code entity modification events, and configuration (database path, project context).
- **Processing**: `saveDocument` parses markdown into sections, batch-upserts doc entities, extracts references, and batch-creates ref records. `validateReferences` checks each ref target (entity via GraphStorage, doc via DocStorage, line-range via filesystem). `onEntityModified` marks impacted docs as outdated and records changelog entries.
- **Outputs**: `DocEntity[]` for document queries, `Reference[]` for ref lookups, `AutoDocStatus` with statistics, `OutdatedDoc[]` for stale detection, `AutoDocTodo[]` for documentation tasks.

## Public API

| Export | Type | Description | Location |
|--------|------|-------------|----------|
| `AutoDocManager` | class | Central manager integrating DocStorage, RefStorage, and GraphStorage | [`autodoc-manager.ts:49-658`](./autodoc-manager.ts) |
| `getAutoDocManager` | function | Singleton factory for AutoDocManager | [`autodoc-manager.ts:671-676`](./autodoc-manager.ts) |
| `resetAutoDocManager` | function | Destroys and resets the AutoDocManager singleton | [`autodoc-manager.ts:681-686`](./autodoc-manager.ts) |
| `DocStorage` | class | CRUD operations for doc_entities, doc_changelog, and doc_todos tables | [`doc-storage.ts:33-816`](./doc-storage.ts) |
| `RefStorage` | class | CRUD operations for doc_references and comment_refs tables | [`ref-storage.ts:32-876`](./ref-storage.ts) |

## Dependencies

### Internal Modules

| Module | Purpose |
|--------|---------|
| `autodoc/parser` | `parseMarkdown`, `flattenSections` for document parsing during save |
| `autodoc/types` | All AutoDoc type definitions (DocEntity, Reference, etc.) |
| `storage/libsql/types` | `ProjectContext` for branch isolation |
| `types/storage` | `GraphStorage`, `Entity`, `Relationship` interfaces |
| `utils/parallel` | `mapParallel` for parallel reference validation and caller fetching |

### External Packages

| Package | Purpose |
|---------|---------|
| `better-sqlite3` / `bun:sqlite` | Native SQLite via NativeSQLiteClient for cross-runtime compatibility |
| `nanoid` | Short unique ID generation for refs, changelog, and todos |

## Behavioral Properties

| Property | Value |
|----------|-------|
| Branch isolation | CTE-based queries with priority (current branch > base branch) |
| Outdated threshold | Confidence < 0.7 marks docs as outdated |
| Validation concurrency | Up to 8 parallel reference validations |
| Batch operations | Uses `NativeSQLiteClient.batch()` for bulk upserts and inserts |

## Error Handling

Both storage classes require explicit `initialize()` before use and throw if accessed before initialization. Database operations propagate SQLite errors. `AutoDocManager.validateReferences` catches per-reference validation failures and records them as `validationError` on the reference record. `saveDocument` transactionally deletes old refs before inserting new ones.

## Known Limitations

- `onFileRenamed` for `.md` files has a TODO for properly re-creating docs with the new path.
- Line-range and commit reference validation always returns `true` (would need filesystem/git access for real validation).
- The outdated confidence reduction is a fixed -0.3 decrement, not proportional to the severity of change.

## Exports

- `AutoDocManager`
- `getAutoDocManager`
- `resetAutoDocManager`
- `DocStorage`
- `RefStorage`

## Files

| File | Description |
|------|-------------|
| [`autodoc-manager.ts`](./autodoc-manager.ts) | Central AutoDoc manager: document save/query, context building, reference validation, code change handling, changelog |
| [`doc-storage.ts`](./doc-storage.ts) | SQLite CRUD for doc_entities, doc_changelog, doc_todos with branch-aware queries and batch upserts |
| [`ref-storage.ts`](./ref-storage.ts) | SQLite CRUD for doc_references and comment_refs with branch-aware queries, batch creates, and line updates |
| [`schema.sql`](./schema.sql) | SQL schema definition for all AutoDoc tables (doc_entities, doc_references, doc_changelog, comment_refs, doc_todos) |
| [`index.ts`](./index.ts) | Module barrel file re-exporting AutoDocManager, DocStorage, and RefStorage |
