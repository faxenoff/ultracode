# LLM

## 🤖 Overview

The `llm` module provides LLM integration for generating documentation, with `doc-writer.ts` handling the core logic of creating and improving documentation. Developers use this module to enhance code documentation through LLM-powered insights.

The `llm` module includes two main components: `doc-writer.ts` for generating and improving documentation, and `llm-provider.ts` for managing LLM providers and their configurations. These components work together to facilitate multi-language documentation generation and integration with various LLM services.

## 🤖 Architecture

```
  +-------------------+
  |   LLM Providers   |
  +-------------------+
          |
          v
  +-------------------+
  |   LLM Configuration |
  +-------------------+
          |
          v
  +-------------------+
  |   LLM Request     |
  +-------------------+
          |
          v
  +-------------------+
  |   LLM Response    |
  +-------------------+
          |
          v
  +-------------------+
  |   Documentation   |
  +-------------------+
```

## 🤖 Flow

```
  +-------------------+
  |   LLM Provider    |
  +-------------------+
          |
          v
  +-------------------+
  |   LLM Configuration |
  +-------------------+
          |
          v
  +-------------------+
  |   LLM Request     |
  +-------------------+
          |
          v
  +-------------------+
  |   LLM Response    |
  +----------------
```

## 🤖 Entity Listing

### Function
- **allModels** — Maps data to model IDs `llm-provider.ts:297-297`
- **batchGenerateDocs** — Generates documentation for multiple modules in batches `doc-writer.ts:457-506`
- **batchResults** — Maps each module to its documentation, handling errors by providing a fallback description `doc-writer.ts:478-495`
- **batchResults** — Maps each module's exports to a bullet list, joining them with newlines `doc-writer.ts:490-490`
- **buildFullEnrichPrompt** — System prompt for FULL documentation generation `doc-writer.ts:324-341`
- **buildIncrementalEnrichPrompt** — System prompt for INCREMENTAL documentation update `doc-writer.ts:347-361`
- **buildModulePrompt** — Builds a prompt for generating documentation for a module `doc-writer.ts:367-422`
- **calculateLLMGpuLayers** — Calculates the number of GPU layers for LLM `llm-provider.ts:1255-1259`
- **coderModel** — Represents a coder-specific model `llm-provider.ts:133-133`
- **configPaths** — Stores paths for LLM configurations `llm-provider.ts:1279-1279`
- **createLLMProvider** — Not present in the provided code snippet `llm-provider.ts:1444-1475`
- **detectLLMProviders** — Detects available LLM providers `llm-provider.ts:1307-1439`
- **detectVRAM** — Detects VRAM available for GPU layers `llm-provider.ts:1202-1237`
- **enrichSingleDoc** — Enriches a single documentation entry by generating or updating it `doc-writer.ts:264-314`
- **errorText** — Retrieves error text from the response `llm-provider.ts:381-381`
- **exportList** — Maps export names to a formatted string `doc-writer.ts:378-378`
- **fileList** — Maps file names to a formatted string `doc-writer.ts:371-371`
- **formatResponse** — Formats the response from an LLM to clean up artifacts and ensure proper structure `doc-writer.ts:424-452`
- **generateArchitectureDoc** — Generates an architecture overview for a project `doc-writer.ts:205-234`
- **generateExportDoc** — Describes a TypeScript/JavaScript export in 1-2 sentences `doc-writer.ts:162-179`
- **generateIncrementalDoc** — Updates existing documentation by adding new entities `doc-writer.ts:124-157`
- **generateModuleDoc** — Generates documentation for a module using an LLM `doc-writer.ts:98-114`
- **getClaudeCommand** — Generates a command for the Claude model `llm-provider.ts:741-808`
- **getIncrementalSystemPrompt** — Generates a system prompt for incremental documentation updates in the specified language `doc-writer.ts:73-93`
- **getLanguageName** — Returns the name of the programming language based on the provided code or default to English `doc-writer.ts:33-35`
- **getSystemPrompt** — Generates a system prompt for full documentation generation in the specified language `doc-writer.ts:41-67`
- **improveDoc** — Improves existing documentation to be clearer and more complete `doc-writer.ts:184-200`
- **llmModel** — Represents a general LLM model `llm-provider.ts:137-137`
- **llmModels** — Filters models to exclude those with embedding patterns `llm-provider.ts:301-304`
- **llmModels** — Returns whether the embedding patterns are not included in the lower case patterns `llm-provider.ts:303-303`
- **loadLLMConfig** — Loads LLM configuration `llm-provider.ts:1264-1302`
- **match** — Matches the input prompt against available models `llm-provider.ts:127-127`
- **moduleList** — Maps module information to a formatted string `doc-writer.ts:212-212`
- **normalize** — Normalizes the input prompt `llm-provider.ts:120-120`
- **parseClaudeJsonLines** — Parses JSON lines from the Claude model `llm-provider.ts:817-854`

### Method
- **checkHealth** — Checks the health of the LLM provider `llm-provider.ts:94-116`
- **checkHealth** — Checks the health of the LLM provider and updates its availability status `llm-provider.ts:204-215`
- **checkHealth** — Checks the health of the Claude CLI by running the --version command and updating the availability status `llm-provider.ts:279-338`
- **checkHealth** — Asynchronously checks the health of the LLM provider `llm-provider.ts:454-477`
- **checkHealth** — Checks the health of the language model provider and updates its availability status `llm-provider.ts:632-684`
- **checkHealth** — Checks the health of the language model provider using the Claude CLI and updates its availability status `llm-provider.ts:935-952`
- **constructor** — Initializes the OllamaProvider instance `llm-provider.ts:81-84`
- **constructor** — Initializes the LLM provider with configuration `llm-provider.ts:196-198`
- **constructor** — Initializes the LLM provider with the given configuration `llm-provider.ts:269-273`
- **constructor** — Initializes the LLMProvider with configuration options `llm-provider.ts:440-444`
- **constructor** — Initializes the ClaudeCodeProvider with necessary parameters `llm-provider.ts:557-572`
- **constructor** — Initializes the LLM provider with a model configuration, defaulting to "haiku" and checking for the Claude CLI `llm-provider.ts:876-884`
- **findLLMModelPath** — Finds the path to the LLM model `llm-provider.ts:585-630`
- **generate** — Generates text using the LLM provider `llm-provider.ts:152-185`
- **generate** — Generates a response based on the provided prompt and options `llm-provider.ts:228-256`
- **generate** — Generates text based on a prompt `llm-provider.ts:353-417`
- **generate** — Generates text using the LLM provider based on the given prompt and options `llm-provider.ts:502-539`
- **generate** — Generates a response using the Claude CLI based on the provided prompt and options `llm-provider.ts:697-734`
- **generate** — Asynchronously generates a response based on the provided prompt and options `llm-provider.ts:958-976`
- **getUsageStats** — Retrieves usage statistics for the LLM provider `llm-provider.ts:889-907`
- **isAvailable** — Returns whether the LLM provider is available `llm-provider.ts:86-88`
- **isAvailable** — Indicates whether the LLM provider is available `llm-provider.ts:200-202`
- **isAvailable** — Checks if the LLM provider is available `llm-provider.ts:275-277`
- **isAvailable** — Gets the availability status of the LLM provider `llm-provider.ts:446-448`
- **isAvailable** — Returns the availability status of the Claude CLI `llm-provider.ts:574-576`
- **isAvailable** — Returns the availability status of the LLM provider `llm-provider.ts:927-929`
- **listModels** — Lists available models for the LLM provider `llm-provider.ts:141-150`
- **listModels** — Returns a promise of a list of available models `llm-provider.ts:217-226`
- **listModels** — Lists available models `llm-provider.ts:340-351`
- **listModels** — Returns a list of available models for the LLM provider `llm-provider.ts:491-500`
- **listModels** — Asynchronously lists available models for the LLM provider `llm-provider.ts:686-695`
- **listModels** — Returns an array of model names `llm-provider.ts:954-956`
- **logUsageStats** — Logs usage statistics for the LLM provider `llm-provider.ts:912-925`
- **runClaudeCommand** — Runs a command for the Claude provider `llm-provider.ts:978-1024`
- **runClaudeGenerate** — Generates text using the Claude provider `llm-provider.ts:1026-1125`
- **runClaudeWindows** — Runs a command for the Claude provider on Windows `llm-provider.ts:1132-1177`
- **selectBestModel** — Selects the best model for the LLM provider `llm-provider.ts:118-139`
- **selectBestModel** — Selects the best model based on available options `llm-provider.ts:479-489`
- **selectedModel** — Stores the currently active model for the LLM provider `llm-provider.ts:90-92`
- **selectedModel** — The currently active model `llm-provider.ts:450-452`
- **selectedModel** — Stores the currently selected model for the LLM provider `llm-provider.ts:578-580`
- **selectedModel** — Returns the currently selected model for the LLM provider `llm-provider.ts:931-933`

### Class
- **ClaudeCodeProvider** — Represents a Claude code provider for AutoDoc `llm-provider.ts:861-1178`
- **DockerModelRunnerProvider** — Represents a provider for running models in a Docker container `llm-provider.ts:434-540`
- **LlamaCppLLMProvider** — Initializes and manages the LlamaCpp LLM provider with configuration options `llm-provider.ts:548-735`
- **OllamaProvider** — Represents the Ollama LLM provider implementation `llm-provider.ts:75-186`
- **OpenAIProvider** — Represents the OpenAI LLM provider `llm-provider.ts:262-418`
- **TGIProvider** — Implements the TGI provider for LLM services `llm-provider.ts:191-257`

### Interface
- **ClaudeCodeResponse** — Represents a response from the Claude code provider `llm-provider.ts:1180-1196`
- **EnrichableDoc** — Represents a document that can be enriched with additional information `doc-writer.ts:242-247`
- **EnrichResult** — Represents the result of enriching a document, including the enriched content and new metadata `doc-writer.ts:249-253`
- **GenerateOptions** — An interface representing options for generating text with the LLM provider, including max tokens, temperature, stop sequences, and system prompt `llm-provider.ts:48-53`
- **LLMConfig** — Configuration for an LLM provider, specifying provider type, base URL, model, API key, max tokens, temperature, and GPU layers `llm-provider.ts:17-26`
- **LLMProvider** — An interface representing an LLM provider, with methods for generating text, checking health, and listing models `llm-provider.ts:38-46`
- **LLMResponse** — An interface representing the response from an LLM provider, including the generated text and usage statistics `llm-provider.ts:28-36`

### Type_alias
- **EnrichMode** — Defines the modes for enriching documents, either full or incremental `doc-writer.ts:240-240`

### Import_decl
- **../../logging/index.js** — Imports `../../logging/index.js` from `../../logging/index.js`. `doc-writer.ts:7-7`, `llm-provider.ts:14-14`
- **../../utils/runtime-detection.js** — Imports `../../utils/runtime-detection.js` from `../../utils/runtime-detection.js`. `llm-provider.ts:15-15`
- **../generator/doc-generator.js** — Imports `../generator/doc-generator.js` from `../generator/doc-generator.js`. `doc-writer.ts:8-8`
- **./llm-provider.js** — Imports `./llm-provider.js` from `./llm-provider.js`. `doc-writer.ts:9-9`
- **node:child_process** — Imports `node:child_process` from `node:child_process`. `llm-provider.ts:10-10`
- **node:fs** — Imports `node:fs` from `node:fs`. `llm-provider.ts:11-11`
- **node:os** — Imports `node:os` from `node:os`. `llm-provider.ts:12-12`
- **node:path** — Imports `node:path` from `node:path`. `llm-provider.ts:13-13`

### Property
- **_isAvailable** — Indicates whether the LLM provider is available `llm-provider.ts:77-77`
- **_isAvailable** — A private property indicating the availability of the LLM provider `llm-provider.ts:193-193`
- **_isAvailable** — Indicates whether the provider is available `llm-provider.ts:264-264`
- **_isAvailable** — Indicates whether the model is available, initialized to false `llm-provider.ts:436-436`
- **_isAvailable** — Represents the availability status of the LLM provider `llm-provider.ts:550-550`
- **_isAvailable** — Indicates whether the language model provider is currently available `llm-provider.ts:863-863`
- **_totalUsage** — Stores the total usage statistics for the LLM provider `llm-provider.ts:868-874`
- **apiKey** — Stores the API key for the LLM provider `llm-provider.ts:267-267`
- **apiKey** — The API key for the LLM provider, if applicable `llm-provider.ts:21-21`, `llm-provider.ts:269-269`
- **args** — Stores arguments for the LLM provider `llm-provider.ts:741-741`
- **args** — Stores the arguments for running the LLM provider `llm-provider.ts:865-865`
- **autoStart** — Indicates whether the LLM provider should start automatically `llm-provider.ts:561-561`
- **autoStartAttempted** — Indicates whether auto-start was attempted `llm-provider.ts:554-554`
- **autoStartEnabled** — Indicates whether auto-start is enabled `llm-provider.ts:555-555`
- **available** — Indicates if the LLM provider is available `llm-provider.ts:1308-1308`
- **baseUrl** — Stores the base URL for the LLM provider `llm-provider.ts:78-78`
- **baseUrl** — The base URL for the LLM provider's API `llm-provider.ts:19-19`, `llm-provider.ts:81-81`
- **baseUrl** — Represents the base URL for the LLM provider `llm-provider.ts:194-194`
- **baseUrl** — The base URL for the LLM provider `llm-provider.ts:196-196`
- **baseUrl** — Sets the base URL for the LLM provider `llm-provider.ts:265-265`
- **baseUrl** — Initializes the provider with a base URL `llm-provider.ts:269-269`
- **baseUrl** — Stores the base URL of the provider `llm-provider.ts:437-437`
- **baseUrl** — Defines the base URL as an optional string `llm-provider.ts:440-440`
- **baseUrl** — Optionally stores the base URL for the LLM provider `llm-provider.ts:551-551`
- **baseUrl** — Represents the base URL for the language model provider `llm-provider.ts:558-558`
- **cache_creation_input_tokens** — Tracks input tokens created in cache `llm-provider.ts:1194-1194`
- **cache_read_input_tokens** — Tracks input tokens read from cache `llm-provider.ts:1193-1193`
- **cacheCreationTokens** — Stores the tokens created in the cache `llm-provider.ts:893-893`
- **cacheReadTokens** — Stores the tokens read from the cache `llm-provider.ts:892-892`
- **choices** — Represents choices with messages and content `llm-provider.ts:394-394`
- **choices** — Represents an array of message objects with content `llm-provider.ts:527-527`
- **choices** — Stores choices generated by the LLM provider `llm-provider.ts:722-722`
- **claudeCmd** — Stores the command for running Claude `llm-provider.ts:865-865`
- **cmd** — Stores the command for the LLM provider `llm-provider.ts:741-741`
- **cmd** — Stores the command for running the LLM provider `llm-provider.ts:865-865`
- **completion_tokens** — Represents the number of completion tokens used in the generated response `llm-provider.ts:395-395`
- **completion_tokens** — The number of tokens used in the completion `llm-provider.ts:528-528`
- **completion_tokens** — Stores the number of completion tokens used `llm-provider.ts:723-723`
- **completionTokens** — The number of completion tokens used in the LLM response `llm-provider.ts:33-33`
- **concurrency** — Optional number representing the concurrency level for document writing `doc-writer.ts:461-461`
- **content** — Stores the content of the entity `doc-writer.ts:244-244`
- **content** — Initializes an array of messages with roles and content `llm-provider.ts:354-354`
- **content** — Represents a message object with content `llm-provider.ts:394-394`
- **content** — Represents a message object with role and content `llm-provider.ts:503-503`
- **content** — Stores content generated by the LLM provider `llm-provider.ts:527-527`
- **content** — Initializes an array of messages with role and content properties `llm-provider.ts:698-698`
- **content** — Represents the message content within the choices array `llm-provider.ts:722-722`
- **data** — Represents the data structure for LLM configurations `llm-provider.ts:296-296`
- **data** — Stores the parsed JSON response containing an array of IDs `llm-provider.ts:346-346`
- **data** — Stores data related to the LLM provider `llm-provider.ts:495-495`
- **data** — Parses the JSON response to extract data containing an array of IDs `llm-provider.ts:690-690`
- **duration_api_ms** — Measures the API call duration in milliseconds `llm-provider.ts:1185-1185`
- **duration_ms** — Measures the duration of the response in milliseconds `llm-provider.ts:1184-1184`
- **endpoint** — Specifies the endpoint for the LLM provider `llm-provider.ts:1267-1267`
- **enriched** — Represents the enriched content of the document `doc-writer.ts:250-250`
- **entityId** — Stores the unique identifier of the entity `doc-writer.ts:243-243`
- **eval_count** — Evaluates the count of something `llm-provider.ts:176-176`
- **generated_text** — Extracts the generated text from the response `llm-provider.ts:252-252`
- **id** — Extracts the model IDs from the response `llm-provider.ts:296-296`
- **id** — Stores the parsed JSON response containing an array of IDs `llm-provider.ts:346-346`
- **id** — Stores an identifier for the LLM provider `llm-provider.ts:495-495`
- **id** — Extracts the ID from the parsed JSON data `llm-provider.ts:690-690`
- **input_tokens** — Counts the input tokens used `llm-provider.ts:1191-1191`
- **inputTokens** — Stores the input tokens used in the LLM provider `llm-provider.ts:890-890`
- **is_error** — Determines if the response is an error `llm-provider.ts:1183-1183`
- **isAvailable** — Indicates whether the language model provider is currently available `llm-provider.ts:40-40`
- **language** — An optional parameter specifying the language for documentation generation `doc-writer.ts:102-102`
- **language** — Language name mapping — synced with Zig's batch_generator.zig (16 languages) `doc-writer.ts:128-128`
- **language** — Parses the language option from the configuration `doc-writer.ts:269-269`
- **language** — Returns the language option from the configuration `doc-writer.ts:462-462`
- **maxTokens** — The maximum number of tokens allowed for the LLM response `llm-provider.ts:22-22`
- **maxTokens** — Represents the maximum number of tokens or undefined `llm-provider.ts:49-49`
- **message** — Represents a message object with content `llm-provider.ts:394-394`
- **message** — Stores a message related to the LLM provider `llm-provider.ts:527-527`
- **message** — Represents the message content within the choices array `llm-provider.ts:722-722`
- **model** — Stores the selected model for the LLM provider `llm-provider.ts:79-79`
- **model** — The specific model to use for the LLM provider `llm-provider.ts:20-20`, `llm-provider.ts:81-81`
- **model** — Stores the model name for the LLM provider `llm-provider.ts:266-266`
- **model** — Represents the selected model for the LLM provider `llm-provider.ts:269-269`
- **model** — The name of the selected model `llm-provider.ts:438-438`
- **model** — Sets the model to use for the LLM provider `llm-provider.ts:440-440`
- **model** — Specifies the LLM model `llm-provider.ts:552-552`
- **model** — Represents the model name or undefined `llm-provider.ts:559-559`
- **model** — Stores the model name or undefined `llm-provider.ts:864-864`
- **model** — Initializes the model property with a given configuration `llm-provider.ts:876-876`
- **model** — Optionally stores the selected model for the LLM provider `llm-provider.ts:1266-1266`
- **model_id** — Extracts the model ID from the response `llm-provider.ts:221-221`
- **models** — Stores a list of available models for the LLM provider `llm-provider.ts:145-145`
- **name** — Stores the name of the LLM provider `llm-provider.ts:76-76`
- **name** — Represents the name of the LLM provider `llm-provider.ts:145-145`
- **name** — Represents the name of the provider as "openai" `llm-provider.ts:192-192`
- **name** — Represents the name of the provider as "docker-model-runner" `llm-provider.ts:263-263`
- **name** — Represents the name of the provider as "llamacpp" `llm-provider.ts:435-435`
- **name** — Sets the name of the provider to "claude-code" `llm-provider.ts:549-549`
- **name** — The name of the LLM provider `llm-provider.ts:39-39`, `llm-provider.ts:862-862`
- **newSourceHash** — Stores the hash of the new source content `doc-writer.ts:251-251`
- **newVersion** — Indicates the version number of the new source `doc-writer.ts:252-252`
- **nGpuLayers** — The number of GPU layers to use for the model `llm-provider.ts:553-553`
- **nGpuLayers** — Sets the number of GPU layers for the LLM provider `llm-provider.ts:560-560`
- **nGpuLayers** — Specifies the number of GPU layers for the LLM `llm-provider.ts:1268-1268`
- **nGpuLayers** — The number of GPU layers to use for the LLM model, if applicable `llm-provider.ts:25-25`
- **num_turns** — Counts the number of turns in the conversation `llm-provider.ts:1186-1186`
- **onProgress** — Represents a callback function to handle progress updates `doc-writer.ts:463-463`
- **output_tokens** — Counts the output tokens generated `llm-provider.ts:1192-1192`
- **outputTokens** — Stores the output tokens generated by the LLM provider `llm-provider.ts:891-891`
- **prompt_eval_count** — Counts the number of prompt evaluations `llm-provider.ts:175-175`
- **prompt_tokens** — Represents the number of prompt tokens used in the generated response `llm-provider.ts:395-395`
- **prompt_tokens** — The number of tokens used in the prompt `llm-provider.ts:528-528`
- **prompt_tokens** — Stores the number of prompt tokens used `llm-provider.ts:723-723`
- **promptTokens** — The number of prompt tokens used in the LLM response `llm-provider.ts:32-32`
- **provider** — Specifies the LLM provider `llm-provider.ts:1265-1265`
- **provider** — The type of LLM provider, such as "ollama", "tgi", "openai", etc `llm-provider.ts:18-18`
- **recommended** — LLM Provider Abstraction for AutoDoc, supporting multiple backends including Ollama, TGI, and OpenAI API compatible endpoints `llm-provider.ts:1309-1309`
- **requests** — Stores the number of requests made to the LLM provider `llm-provider.ts:894-894`
- **response** — Stores the response from the LLM provider `llm-provider.ts:174-174`
- **result** — Contains the result of the response `llm-provider.ts:1187-1187`
- **role** — Initializes an array of messages with roles and content `llm-provider.ts:354-354`
- **role** — Represents a message object with role and content `llm-provider.ts:503-503`
- **role** — Represents the role of the LLM provider `llm-provider.ts:698-698`
- **selectedModel** — Represents the currently active model for the language model provider `llm-provider.ts:41-41`
- **session_id** — Identifies the session ID `llm-provider.ts:1188-1188`
- **sourceHash** — Stores the hash of the source code `doc-writer.ts:245-245`
- **stopSequences** — Defines sequences that will stop the model from generating text `llm-provider.ts:51-51`
- **subtype** — Indicates the subtype of the response `llm-provider.ts:1182-1182`
- **systemPrompt** — Provides a system prompt to guide the model's behavior `llm-provider.ts:52-52`
- **temperature** — Sets the temperature parameter for the language model `llm-provider.ts:50-50`
- **temperature** — The temperature parameter for the LLM response `llm-provider.ts:23-23`
- **text** — The generated text from the LLM provider `llm-provider.ts:29-29`
- **total_cost_usd** — Calculates the total cost in USD `llm-provider.ts:1189-1189`
- **type** — Specifies the type of the response `llm-provider.ts:1181-1181`
- **usage** — Represents the usage statistics for the generated response `llm-provider.ts:395-395`
- **usage** — Contains usage statistics for the generated text `llm-provider.ts:528-528`
- **usage** — Stores usage statistics for the LLM provider `llm-provider.ts:723-723`
- **usage** — Tracks the usage of tokens `llm-provider.ts:1190-1195`
- **usage** — The usage statistics for the LLM response, including prompt tokens and completion tokens `llm-provider.ts:30-35`
- **version** — Stores the version number of the entity. `doc-writer.ts:246-2 `doc-writer.ts:246-246`

## Data Flow

- **Inputs**: Module metadata (name, files, exports), optional code snippets, language preference, and LLM provider configuration.
- **Processing**: `detectLLMProviders` probes all configured/default backends in parallel, selects the best available. `batchGenerateDocs` sends per-module prompts to the selected provider with system prompts, temperature, and token limits. Responses are cleaned of tokenizer artifacts and formatted.
- **Outputs**: Generated markdown documentation strings per module path (`Map<string, string>`), individual export descriptions, or improved documentation text.

## Public API

| Export | Type | Description | Location |
|--------|------|-------------|----------|
| `generateModuleDoc` | function | Generates full AUTODOC.md content for a single module via LLM | [`doc-writer.ts:41-67`](./doc-writer.ts) |
| `generateExportDoc` | function | Generates a 1-2 sentence description for a single export | [`doc-writer.ts:84-101`](./doc-writer.ts) |
| `improveDoc` | function | Improves existing documentation using LLM with optional code context | [`doc-writer.ts:98-114`](./doc-writer.ts) |
| `generateArchitectureDoc` | function | Generates project architecture overview from module list | [`doc-writer.ts:127-156`](./doc-writer.ts) |
| `batchGenerateDocs` | function | Batch generates docs for multiple modules with progress callback | [`doc-writer.ts:252-259`](./doc-writer.ts) |
| `LLMProvider` | interface | Common interface for all LLM backends (generate, checkHealth, listModels) | [`llm-provider.ts:36-44`](./llm-provider.ts) |
| `LLMConfig` | interface | Configuration for creating an LLM provider (provider type, baseUrl, model, apiKey) | [`llm-provider.ts:17-26`](./llm-provider.ts) |
| `LLMResponse` | interface | Response from LLM generation (text, optional usage stats) | [`llm-provider.ts:30-35`](./llm-provider.ts) |
| `GenerateOptions` | interface | Options for generate() calls (maxTokens, temperature, stopSequences, systemPrompt) | [`llm-provider.ts:46-51`](./llm-provider.ts) |
| `OllamaProvider` | class | Ollama local LLM backend with auto model selection | [`llm-provider.ts:73-255`](./llm-provider.ts) |
| `TGIProvider` | class | HuggingFace Text Generation Inference backend | [`llm-provider.ts:189-416`](./llm-provider.ts) |
| `OpenAIProvider` | class | OpenAI-compatible API backend (works with vLLM, LocalAI, etc.) | [`llm-provider.ts:260-538`](./llm-provider.ts) |
| `createLLMProvider` | function | Factory function to create a provider from LLMConfig | [`llm-provider.ts:1307-1439`](./llm-provider.ts) |
| `detectLLMProviders` | function | Auto-detects all available LLM providers and selects recommended one | [`llm-provider.ts:1202-1237`](./llm-provider.ts) |

## Dependencies

### Internal Modules

| Module | Purpose |
|--------|---------|
| `autodoc/generator` | `ModuleInfo` type for module metadata input |
| `logging` | Structured logging for provider detection and generation |
| `utils/runtime-detection` | Bun runtime check for Claude Code CLI path resolution |
| `semantic/llamacpp-server-manager` | Auto-start llama.cpp server for LlamaCppLLMProvider |

### External Packages

| Package | Purpose |
|---------|---------|
| `node:child_process` | Claude Code CLI spawning, nvidia-smi/rocm-smi VRAM detection |
| `node:fs` | Config file and model path lookups |
| `node:os` | Home directory for config/model paths |
| `node:path` | Cross-platform path resolution |

## Behavioral Properties

| Property | Value |
|----------|-------|
| Provider priority | Config > Claude Code > Docker Model Runner > Ollama > llama.cpp > TGI > OpenAI |
| Default generation timeout | 120 seconds |
| Preferred models | devstral-small, qwen3-coder:30b, qwen2.5-coder:14b, and 7 more code-specialized models |
| Batch concurrency | 1 for Claude Code (rate limits), 2 for other providers |

## Error Handling

Provider health checks use 5-second timeouts and return `false` on failure without throwing. `batchGenerateDocs` catches per-module LLM errors and falls back to basic template content. `detectLLMProviders` logs warnings when a configured provider is unavailable. The doc writer strips LLM tokenizer artifacts (DeepSeek, etc.) and meta-text preamble/postamble from responses.

## Known Limitations

- LlamaCppLLMProvider auto-start only works when explicitly configured (not as fallback) to avoid unwanted server launches.
- VRAM detection is limited to NVIDIA (nvidia-smi) and AMD (rocm-smi); Intel GPUs are not detected.
- Claude Code CLI provider requires the `@anthropic-ai/claude-code` package to be globally installed.

## Exports

- `batchGenerateDocs`
- `generateArchitectureDoc`
- `generateExportDoc`
- `generateModuleDoc`
- `improveDoc`
- `createLLMProvider`
- `detectLLMProviders`
- `OllamaProvider`
- `OpenAIProvider`
- `TGIProvider`

## Files

| File | Description |
|------|-------------|
| [`doc-writer.ts`](./doc-writer.ts) | LLM-powered documentation generation: module docs, export docs, architecture, batch generation, response cleaning |
| [`llm-provider.ts`](./llm-provider.ts) | Provider abstraction with 6 backends (Ollama, TGI, OpenAI, Docker Model Runner, llama.cpp, Claude Code), auto-detection, config loading, VRAM detection |
| [`index.ts`](./index.ts) | Module barrel file re-exporting doc-writer functions and llm-provider classes/types |
