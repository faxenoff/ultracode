# Configuration

## 🤖 Overview

The `src/config` module provides a comprehensive configuration system for the application, including default settings, logging, and embedding models. It is used by developers and system administrators to customize and manage the application's behavior and performance.

## 🤖 Architecture

```
  [config-defaults.ts] → [config-types.ts]
  [config-defaults.ts] → [yaml-config.ts]
  [yaml-config.ts] → [models-catalog.ts]
  [models-catalog.ts] → [worker-embedding-config.ts]
  [models-catalog.ts] → [logging-config.ts]
```

## 🤖 Flow

```
  [config-defaults.ts] → [config-types.ts] → [yaml-config.ts] → [models-catalog.ts] → [worker-
```

## 🤖 Entity Listing

### Function
- **buildWorkerEmbeddingConfig** — Builds a WorkerEmbeddingConfig object from YAML configuration for subprocess workers `worker-embedding-config.ts:381-472`
- **computeQueueBatchSize** — Computes the batch size for the worker embedding queue `worker-embedding-config.ts:352-371`
- **getActiveModel** — Function to retrieve the active model from the catalog `models-catalog.ts:124-127`
- **getAvailableModels** — Returns a list of available embedding models `models-catalog.ts:136-139`
- **getCdnUrl** — Returns the CDN URL for a given model `models-catalog.ts:142-149`
- **getConfig** — Retrieves the configuration from a YAML file or environment variables `yaml-config.ts:741-743`
- **getMCPConfigSafe** — Safely retrieves the configuration from a YAML file or environment variables `yaml-config.ts:748-756`
- **getModelById** — Returns an embedding model by its ID `models-catalog.ts:130-133`
- **getModelContextTokens** — Returns the context tokens of the model `worker-embedding-config.ts:176-193`
- **getModelDimensions** — Returns the dimensions of the model `worker-embedding-config.ts:125-138`
- **initializeConfig** — Initializes the configuration with default values and environment variables `yaml-config.ts:761-772`
- **loadModelsCatalog** — Function to load the models catalog from models.json, caching after the first load `models-catalog.ts:52-87`
- **model** — Represents an embedding model with its properties and metadata `models-catalog.ts:144-144`
- **parseCatalog** — Function to parse the raw JSON data into a ModelsCatalog object `models-catalog.ts:89-117`
- **parseDatabaseMode** — Parses database mode from string `yaml-config.ts:46-48`
- **parseEmbeddingProvider** — Parses embedding provider from string `yaml-config.ts:40-44`
- **parseLoadBalancingStrategy** — Parses load balancing strategy from string `yaml-config.ts:67-71`
- **parseLogFormat** — Parses log format from string `yaml-config.ts:62-65`
- **parseLogLevel** — Parses log level from string `yaml-config.ts:58-60`
- **parseOneOf** — Generic enum-like string validator `yaml-config.ts:28-31`
- **parseSynchronousLevel** — Parses synchronous level from string `yaml-config.ts:50-52`
- **parseTempStore** — Parses temporary store from string `yaml-config.ts:54-56`
- **pickBool** — Picks a boolean value from YAML or environment variables, with a fallback `yaml-config.ts:109-115`
- **pickNum** — Picks a number value from YAML or environment variables, with a fallback `yaml-config.ts:118-126`
- **pickStr** — Picks a string value from YAML or environment variables, with a fallback `yaml-config.ts:129-134`
- **resolveModelDimensions** — Resolves the dimensions of the model `worker-embedding-config.ts:335-346`
- **resolveProviderConfig** — Resolves the provider configuration based on the provider kind `worker-embedding-config.ts:203-330`
- **selectedModel** — Represents the selected model `worker-embedding-config.ts:217-217`, `worker-embedding-config.ts:243-243`, `worker-embedding-config.ts:290-290`, `worker-embedding-config.ts:313-313`
- **validateConfig** — Validates the configuration against predefined constraints `yaml-config.ts:781-809`

### Method
- **assembleConfig** — Assembles the configuration object from YAML and environment variables `yaml-config.ts:431-731`
- **buildEmbeddingConfig** — Builds the embedding configuration `yaml-config.ts:337-400`
- **buildResourceConstraints** — Builds the resource constraints `yaml-config.ts:405-426`
- **constructor** — Initializes the ConfigLoader instance with configuration and path `yaml-config.ts:148-151`
- **getAgentsConfig** — Retrieves the agents configuration `yaml-config.ts:221-223`
- **getConfig** — Returns the current configuration `yaml-config.ts:188-190`
- **getDatabaseConfig** — Retrieves the database configuration `yaml-config.ts:206-208`
- **getDevIndexBatchSize** — Retrieves the development index batch size `yaml-config.ts:235-237`
- **getEmbeddingConfig** — Retrieves the embedding configuration `yaml-config.ts:249-279`
- **getInstance** — Returns the singleton instance of ConfigLoader `yaml-config.ts:158-171`
- **getLoggingConfig** — Retrieves the logging configuration `yaml-config.ts:210-212`
- **getMCPConfig** — Retrieves the MCP configuration `yaml-config.ts:202-204`
- **getParserConfig** — Retrieves the parser configuration `yaml-config.ts:214-216`
- **isEmbeddingEnabled** — Checks if embedding is enabled `yaml-config.ts:242-244`
- **loadConfiguration** — Loads the configuration from the specified path `yaml-config.ts:313-332`
- **reload** — Reloads the configuration from the specified path `yaml-config.ts:195-197`
- **resolveConfigPath** — Resolves the configuration path `yaml-config.ts:288-308`
- **setOverridePath** — Sets the path for overriding configuration files `yaml-config.ts:177-183`
- **shouldUseParser** — Determines whether to use the parser `yaml-config.ts:228-230`

### Class
- **ConfigLoader** — A class for loading and managing configuration `yaml-config.ts:140-732`

### Interface
- **AgentResourceConstraints** — Specifies resource constraints for agents, including max memory, CPU percentage, concurrent agents, and task queue size `config-types.ts:283-288`
- **AgentRuntimeConfig** — Represents runtime configuration for an agent with properties like maxConcurrency, memoryLimit, and priority `config-types.ts:262-266`
- **AppConfig** — Application configuration `config-types.ts:355-372`
- **CombinedEmbeddingConfig** — Combined embedding configuration type from semantic-config.json and yaml-config `worker-embedding-config.ts:26-87`
- **ConductorConfig** — Configuration for the conductor `config-types.ts:296-299`
- **CoordinatorConfig** — Configuration for the coordinator `config-types.ts:290-294`
- **DatabaseConfig** — Configuration for the database `config-types.ts:204-211`
- **EmbeddingConfigResolved** — Resolves the embedding configuration `config-types.ts:123-198`
- **EmbeddingModel** — Represents an embedding model with properties like ID, name, Hugging Face repository, ONNX file, tokenizer file, dimension, max tokens, size in MB, language, note, MTEB score, and CDN URLs `models-catalog.ts:19-34`
- **GitConfig** — Configuration for Git `config-types.ts:320-336`
- **IndexerConfig** — Defines configuration for an indexer with properties like maxConcurrency, memoryLimit, priority, batchSize, cacheSize, and cacheTTL `config-types.ts:249-256`
- **IndexingConfig** — Configuration for indexing `config-types.ts:305-318`
- **LoggingConfig** — Defines logging configuration parameters `config-types.ts:213-220`
- **MCPConfig** — Represents the configuration for the Model Configuration Provider `config-types.ts:12-116`
- **ModelEntry** — Model configuration entry in provider configs `worker-embedding-config.ts:16-20`
- **ModelsCatalog** — Interface representing the catalog of embedding models, including active model, CDN base URL, and list of models `models-catalog.ts:36-40`
- **ParserConfig** — Configures the parser settings `config-types.ts:226-247`
- **QueryAgentConfig** — Extends AgentRuntimeConfig and adds properties for query timeouts and cache warmup size `config-types.ts:271-275`
- **SemanticAgentConfig** — Extends AgentRuntimeConfig and adds properties for queue batch size, batch size, and model path `config-types.ts:277-281`
- **VectorBackendConfig** — Configuration for the vector backend `config-types.ts:342-349`

### Type_alias
- **DevAgentConfig** — Defines the configuration for the DevAgent `config-types.ts:268-268`
- **DoraAgentConfig** — Defines the configuration for the DoraAgent `config-types.ts:269-269`
- **MCPLogCategory** — Represents a category of logs for the MCP system, defined as a type derived from the `MCP_LOG_CATEGORIES` object `logging-config.ts:35-35`

### Import_decl
- **../agents/dev/file-extensions.js** — Imports `../agents/dev/file-extensions.js` from `../agents/dev/file-extensions.js`. `config-defaults.ts:8-8`
- **../logging/index.js** — Imports `../logging/index.js` from `../logging/index.js`. `worker-embedding-config.ts:8-8`, `yaml-config.ts:14-14`
- **../shared/storage-paths.js** — Imports `../shared/storage-paths.js` from `../shared/storage-paths.js`. `logging-config.ts:1-1`
- **../types/semantic.js** — Imports `../types/semantic.js` from `../types/semantic.js`. `worker-embedding-config.ts:9-9`
- **../utils/config-paths.js** — Imports `../utils/config-paths.js` from `../utils/config-paths.js`. `worker-embedding-config.ts:10-10`
- **../utils/file-ops.js** — Imports `../utils/file-ops.js` from `../utils/file-ops.js`. `yaml-config.ts:15-15`
- **../utils/logger-types.js** — Imports `../utils/logger-types.js` from `../utils/logger-types.js`. `logging-config.ts:2-2`
- **./config-defaults.js** — Imports `./config-defaults.js` from `./config-defaults.js`. `yaml-config.ts:21-21`
- **./config-types.js** — Imports `./config-types.js` from `./config-types.js`. `config-defaults.ts:9-9`
- **./config-types.js** — Imports `./config-types.js`. `yaml-config.ts:95-102`
- **./yaml-config.js** — Imports `./yaml-config.js` from `./yaml-config.js`. `worker-embedding-config.ts:11-11`
- **node:fs** — Imports `node:fs` from `node:fs`. `models-catalog.ts:11-11`
- **node:path** — Imports `node:path` from `node:path`. `models-catalog.ts:12-12`, `yaml-config.ts:12-12`
- **node:url** — Imports `node:url` from `node:url`. `models-catalog.ts:13-13`
- **yaml** — YAML parsing and serialization. from `yaml`. `yaml-config.ts:13-13`

### Property
- **active** — ID of the currently active model in the catalog `models-catalog.ts:37-37`
- **agent** — Specifies the agent for parser operations `config-types.ts:237-246`
- **agents** — Manages agent configurations `config-types.ts:84-89`
- **apiKey** — Stores the API key for the embedding provider `config-types.ts:16-16`
- **apiKey** — API key for the provider `config-types.ts:54-54`, `config-types.ts:62-62`, `config-types.ts:69-69`, `config-types.ts:173-173`, `config-types.ts:182-182`
- **apiKey** — Stores the API key for the specified provider `config-types.ts:126-126`, `config-types.ts:163-163`
- **apiKey** — Stores the API key for embedding generation `worker-embedding-config.ts:60-60`
- **architecture** — Architecture for embedding configuration `worker-embedding-config.ts:28-28`
- **autodoc** — Enables automatic documentation generation `config-types.ts:94-115`
- **autoIndex** — Automatically index `config-types.ts:315-315`
- **autoIndexExtensions** — Extensions for automatic indexing `config-types.ts:317-317`
- **autoPull** — Enables automatic pulling of models for the Ollama provider `config-types.ts:47-47`
- **autoPull** — Enables automatic pulling of models `config-types.ts:154-154`
- **autoReindex** — Boolean indicating whether to automatically reindex the database `config-types.ts:329-329`
- **autoSwitchOnBranchChange** — Automatically switch on branch change `config-types.ts:307-307`
- **baseUrl** — Sets the base URL for the Ollama provider `config-types.ts:42-42`
- **baseUrl** — Base URL for the provider `config-types.ts:53-53`, `config-types.ts:61-61`, `config-types.ts:70-70`, `config-types.ts:77-77`, `config-types.ts:172-172`, `config-types.ts:183-183`, `config-types.ts:192-192`
- **baseUrl** — Stores the base URL for the provider `config-types.ts:149-149`, `config-types.ts:162-162`
- **baseUrl** — Base URL for provider-specific configurations `worker-embedding-config.ts:32-32`
- **baseUrl** — Sets the base URL for embedding generation `worker-embedding-config.ts:59-59`
- **batch_size** — Batch size for provider-specific configurations `worker-embedding-config.ts:45-45`
- **batch_size** — Specifies the batch size for embedding generation `worker-embedding-config.ts:67-67`
- **batchSize** — Controls request pressure during indexing `config-types.ts:242-242`, `config-types.ts:253-253`, `config-types.ts:279-279`
- **batchSize** — Batch size for provider-specific configurations `worker-embedding-config.ts:36-36`
- **batchSize** — Specifies the batch size for embedding generation `worker-embedding-config.ts:46-46`, `worker-embedding-config.ts:58-58`
- **batchSize** — Represents the batch size for the model `worker-embedding-config.ts:207-207`
- **bufferSize** — Specifies the buffer size for parser operations `config-types.ts:232-232`
- **bulkModeThreshold** — Threshold for switching to bulk mode `config-types.ts:335-335`
- **cacheSize** — Cache size for the database `config-types.ts:207-207`
- **cacheSize** — Sets the size of the parser cache `config-types.ts:235-235`
- **cacheSize** — Represents the size of the cache `config-types.ts:243-243`, `config-types.ts:254-254`
- **cacheTTL** — Sets the time-to-live for cached parser results `config-types.ts:235-235`
- **cacheTTL** — Represents the time-to-live for cache entries, which is optional `config-types.ts:255-255`
- **cacheWarmupLimit** — Sets the limit for cache warmup `config-types.ts:91-91`
- **cacheWarmupSize** — Defines the size of the cache warmup `config-types.ts:274-274`
- **cdn** — Record of CDN URLs for the model `models-catalog.ts:33-33`
- **cdnBase** — Base URL for CDN access `models-catalog.ts:38-38`
- **checkServer** — Checks the server status for the Ollama provider `config-types.ts:49-49`
- **checkServer** — Configures whether to check the server for updates `config-types.ts:80-80`
- **checkServer** — Checks the server status for the provider `config-types.ts:156-156`
- **checkServer** — Checks the server before making requests `config-types.ts:195-195`
- **cleanupIntervalMs** — Interval for cleanup in milliseconds `config-types.ts:311-311`
- **cloudru** — Configuration for CloudRU provider `config-types.ts:60-67`
- **cloudru** — Configuration for the cloudru provider `config-types.ts:170-179`
- **complexityThreshold** — Threshold for complexity `config-types.ts:297-297`
- **complexQueryTimeout** — Specifies the timeout for complex queries `config-types.ts:273-273`
- **compression** — Compression configuration `config-types.ts:345-345`
- **concurrency** — Sets the concurrency level for the Ollama provider `config-types.ts:45-45`
- **concurrency** — Maximum number of concurrent requests `config-types.ts:57-57`, `config-types.ts:65-65`, `config-types.ts:73-73`, `config-types.ts:79-79`
- **concurrency** — Sets the concurrency level for the provider `config-types.ts:152-152`
- **concurrency** — Controls the number of concurrent HTTP requests `config-types.ts:166-166`, `config-types.ts:176-176`, `config-types.ts:186-186`, `config-types.ts:194-194`
- **concurrency** — Concurrency for provider-specific configurations `worker-embedding-config.ts:38-38`
- **concurrency** — Determines the concurrency level for embedding generation `worker-embedding-config.ts:53-53`, `worker-embedding-config.ts:62-62`, `worker-embedding-config.ts:71-71`
- **conductor** — Configures the conductor settings `config-types.ts:369-369`
- **config** — Holds the loaded configuration object `yaml-config.ts:145-145`
- **configPath** — Stores the path to the configuration file `yaml-config.ts:146-146`
- **context_size** — Sets the context size for embedding generation `worker-embedding-config.ts:68-68`
- **context_tokens** — Represents the context tokens for the model `worker-embedding-config.ts:84-84`
- **contextTokens** — Represents the context tokens for the model `worker-embedding-config.ts:85-85`, `worker-embedding-config.ts:338-338`
- **coordinator** — Configures the coordinator settings `config-types.ts:368-368`
- **creating** — Indicates whether the ConfigLoader is currently being created `yaml-config.ts:144-144`
- **database** — Database configuration `config-types.ts:357-357`
- **dataDir** — Directory for data `config-types.ts:313-313`
- **debounceMs** — Sets the debounce time in milliseconds `config-types.ts:99-99`
- **debounceMs** — Interval in milliseconds for debouncing changes `config-types.ts:333-333`
- **debug** — Enables or disables debug mode `config-types.ts:371-371`
- **defaultTimeout** — Defines the default timeout value `config-types.ts:86-86`
- **devAgent** — Development agent configuration `config-types.ts:364-364`
- **devIndexBatch** — Controls the batch size for development indexing `config-types.ts:88-88`
- **diffMode** — Boolean indicating whether to use diff mode for indexing `config-types.ts:330-330`
- **dimension** — Dimension of the embedding model `models-catalog.ts:25-25`
- **dimensions** — Represents the dimensions for the model `worker-embedding-config.ts:83-83`, `worker-embedding-config.ts:338-338`
- **disabled** — Boolean indicating if the model is disabled `models-catalog.ts:31-31`
- **disabledReason** — Reason for disabling the model, if applicable `models-catalog.ts:32-32`
- **doraAgent** — Dora agent configuration `config-types.ts:365-365`
- **embedding** — Configures the embedding model and its provider `config-types.ts:13-82`
- **embeddingAvailable** — Checks if an embedding provider is available based on the configuration `yaml-config.ts:748-748`
- **enableConsole** — Enables or disables console logging `config-types.ts:219-219`
- **enabled** — Indicates whether the embedding model is enabled `config-types.ts:17-17`
- **enabled** — Indicates whether the provider is enabled `config-types.ts:127-127`
- **enabled** — Indicates whether the parser is enabled `config-types.ts:228-228`, `config-types.ts:235-235`
- **enabled** — Enabled status `config-types.ts:321-321`
- **encodingFormat** — Specifies the encoding format for embeddings `worker-embedding-config.ts:49-49`
- **endpoint** — Sets the endpoint for large language models `config-types.ts:111-111`
- **endpoint** — Endpoint for provider-specific configurations `worker-embedding-config.ts:31-31`, `worker-embedding-config.ts:42-42`
- **endpoint** — Defines the endpoint for embedding generation `worker-embedding-config.ts:65-65`
- **endpoints** — Defines the endpoints for embedding generation `worker-embedding-config.ts:47-47`
- **environment** — Specifies the environment for the configuration `config-types.ts:370-370`
- **errors** — Stores any errors encountered during configuration validation `yaml-config.ts:781-781`
- **evictionStrategy** — Strategy for eviction `config-types.ts:310-310`
- **format** — Determines the format of log messages `config-types.ts:215-215`
- **git** — Git configuration `config-types.ts:362-362`
- **grpcPort** — Specifies the gRPC port for embedding generation `worker-embedding-config.ts:51-51`
- **headers** — Stores headers for the Ollama provider `config-types.ts:46-46`
- **headers** — Stores headers for the provider `config-types.ts:153-153`
- **hfRepo** — Hugging Face repository URL for the embedding model `models-catalog.ts:22-22`
- **host** — Specifies the host address for the server `config-types.ts:83-83`
- **huggingface** — Configuration for HuggingFace provider `config-types.ts:68-75`
- **huggingface** — Configuration for the huggingface provider `config-types.ts:180-189`
- **id** — Unique identifier for an embedding model `models-catalog.ts:20-20`
- **id** — Model identifier `worker-embedding-config.ts:17-17`
- **includeUntracked** — Boolean indicating whether to include untracked files in the configuration `config-types.ts:328-328`
- **incremental** — Indicates whether parser operations should be incremental `config-types.ts:234-236`
- **incrementalThreshold** — Threshold for incremental updates `config-types.ts:312-312`
- **indexer** — Indexer configuration `config-types.ts:360-360`
- **indexing** — Indexing configuration `config-types.ts:361-361`
- **insertL** — Insert configuration `config-types.ts:347-347`
- **instance** — Represents a static instance of the ConfigLoader class `yaml-config.ts:141-141`
- **lang** — Language of the model, either "en" or "multi" `models-catalog.ts:28-28`
- **languageConfigs** — Configures language-specific parser settings `config-types.ts:229-229`
- **level** — Specifies the logging level (e.g., debug, info, warn, error) `config-types.ts:214-214`
- **libsql** — Configuration for the libsql backend `config-types.ts:343-348`
- **llamacpp** — Configures LlamaCPP for embedding generation `worker-embedding-config.ts:64-73`
- **llmConfig** — Configures large language model settings `config-types.ts:107-113`
- **loadBalancingStrategy** — Strategy for load balancing `config-types.ts:292-292`
- **logging** — Logging configuration `config-types.ts:358-358`
- **mandatoryDelegation** — Mandatory delegation setting `config-types.ts:298-298`
- **max_batch_size** — Represents the maximum batch size for the mlx provider `worker-embedding-config.ts:77-77`
- **max_client_batch_size** — Maximum client batch size for provider-specific configurations `worker-embedding-config.ts:35-35`
- **maxBatchSize** — Maximum number of texts per HTTP request `config-types.ts:58-58`, `config-types.ts:66-66`
- **maxBatchSize** — Sets the maximum number of texts per HTTP request `config-types.ts:167-167`, `config-types.ts:177-177`
- **maxBranchesPerRepo** — Maximum branches per repository `config-types.ts:308-308`
- **maxConcurrency** — Sets the maximum number of concurrent parser operations `config-types.ts:239-239`
- **maxConcurrency** — Represents the maximum concurrency level for agents, which is optional `config-types.ts:250-250`, `config-types.ts:263-263`
- **maxConcurrent** — Limits the maximum number of concurrent requests `config-types.ts:85-85`
- **maxConcurrentAgents** — Maximum number of concurrent agents `config-types.ts:286-286`
- **maxConcurrentAgents** — Represents the maximum number of concurrent agents `yaml-config.ts:407-407`, `yaml-config.ts:412-412`
- **maxCpuPercent** — Maximum CPU percentage usage for the system `config-types.ts:285-285`
- **maxCpuPercent** — Represents the maximum CPU percentage `yaml-config.ts:407-407`, `yaml-config.ts:412-412`
- **maxDebounceMs** — Sets the maximum debounce time in milliseconds `config-types.ts:103-103`
- **maxFiles** — Defines the maximum number of log files to retain `config-types.ts:218-218`
- **maxFileSize** — Sets the maximum size of log files `config-types.ts:217-217`, `config-types.ts:230-230`
- **maxMemoryMB** — Maximum memory in MB for the system `config-types.ts:284-284`
- **maxMemoryMB** — Represents the maximum memory in MB `yaml-config.ts:407-407`, `yaml-config.ts:412-412`
- **maxTaskQueueSize** — Maximum size of the task queue `config-types.ts:287-287`
- **maxTaskQueueSize** — Represents the maximum task queue size `yaml-config.ts:407-407`, `yaml-config.ts:412-412`
- **maxTokens** — Maximum number of tokens the model can handle `models-catalog.ts:26-26`
- **maxTokens** — Represents the maximum tokens for the model `worker-embedding-config.ts:86-86`
- **maxTotalBranches** — Maximum total branches `config-types.ts:309-309`
- **mcp** — MCP configuration `config-types.ts:356-356`
- **memoryLimit** — Sets the memory limit for parser operations `config-types.ts:240-240`
- **memoryLimit** — Represents the memory limit for agents, which is optional `config-types.ts:251-251`, `config-types.ts:264-264`
- **metric** — Metric configuration `config-types.ts:344-344`
- **minDebounceMs** — Defines the minimum debounce time in milliseconds `config-types.ts:101-101`
- **mlx** — Represents the model directory for the mlx provider `worker-embedding-config.ts:74-79`
- **mmapSize** — Represents the size of memory-mapped files used for temporary storage `config-types.ts:208-208`
- **mode** — Mode of the database `config-types.ts:206-206`
- **model** — Specifies the model to be used for embeddings `config-types.ts:14-14`
- **model** — Defines the model for large language models `config-types.ts:110-110`, `config-types.ts:124-124`
- **model** — Model for provider-specific configurations `worker-embedding-config.ts:34-34`, `worker-embedding-config.ts:44-44`
- **model** — Specifies the model for embedding generation `worker-embedding-config.ts:57-57`
- **model** — Represents the model for the mlx provider `worker-embedding-config.ts:80-80`
- **modelDir** — Represents the model directory for the mlx provider `worker-embedding-config.ts:75-75`
- **modelName** — Represents the name of the model `worker-embedding-config.ts:206-206`
- **modelPath** — Indicates the path to the model file `config-types.ts:280-280`
- **models** — Array of embedding models in the catalog `models-catalog.ts:39-39`
- **models** — Models for provider-specific configurations `worker-embedding-config.ts:39-39`
- **models** — Contains model configurations for embedding generation `worker-embedding-config.ts:54-54`, `worker-embedding-config.ts:72-72`
- **models** — Represents the list of models for the mlx provider `worker-embedding-config.ts:78-78`
- **mtebScore** — MTEB score for the model, if available `models-catalog.ts:30-30`
- **n_gpu_layers** — Specifies the number of GPU layers for embedding generation `worker-embedding-config.ts:69-69`
- **name** — Name of the embedding model `models-catalog.ts:21-21`
- **note** — Additional note or description about the model `models-catalog.ts:29-29`
- **ollama** — Configures the Ollama provider for embeddings `config-types.ts:41-51`
- **ollama** — Contains configuration for the Ollama provider `config-types.ts:147-159`
- **onnxFile** — Path to the ONNX file for the embedding model `models-catalog.ts:23-23`
- **openai** — Configuration for OpenAI provider `config-types.ts:52-59`
- **openai** — Contains configuration for the OpenAI provider `config-types.ts:160-169`
- **openai** — Configures OpenAI for embedding generation `worker-embedding-config.ts:56-63`
- **outputFile** — Specifies the file where logs should be written `config-types.ts:216-216`
- **overridePath** — Stores the override path for configuration `yaml-config.ts:142-142`
- **ovms** — Provider-specific configurations for OVMS `worker-embedding-config.ts:41-55`
- **parallelBatches** — Sets the maximum number of concurrent HTTP requests `config-types.ts:30-30`
- **parser** — Parser configuration `config-types.ts:359-359`
- **path** — Path to the database `config-types.ts:205-205`
- **platform** — Platform for embedding configuration `worker-embedding-config.ts:27-27`
- **pollIntervalMs** — Interval in milliseconds for polling changes `config-types.ts:331-331`
- **popularEntitiesTopic** — Defines the topic for popular entities `config-types.ts:92-92`
- **port** — Defines the port number for the server `config-types.ts:83-83`
- **priority** — Specifies the priority of parser operations `config-types.ts:241-241`
- **priority** — Represents the priority level for agents, which is optional `config-types.ts:252-252`
- **priority** — Represents the priority of a configuration option `config-types.ts:265-265`
- **protocol** — Defines the protocol for embedding generation `worker-embedding-config.ts:50-50`
- **provider** — Defines the provider for the embedding model `config-types.ts:15-15`
- **provider** — Specifies the provider for large language models `config-types.ts:109-109`
- **provider** — Specifies the provider for embeddings, such as "ollama", "openai", etc `config-types.ts:125-125`
- **providerKind** — Represents the kind of provider `worker-embedding-config.ts:204-204`
- **providerOptions** — Represents the options for the provider `worker-embedding-config.ts:205-205`
- **pullTimeoutMs** — Sets the pull timeout in milliseconds for the Ollama provider `config-types.ts:50-50`
- **pullTimeoutMs** — Sets the pull timeout in milliseconds for the provider `config-types.ts:157-157`
- **queryAgent** — Query agent configuration `config-types.ts:366-366`
- **queryLanguage** — Specifies the language for query optimization `config-types.ts:26-26`, `config-types.ts:136-136`
- **queueBatchSize** — Controls the number of texts per HTTP request `config-types.ts:29-29`
- **queueBatchSize** — Controls request pressure during indexing `config-types.ts:278-278`
- **rerankerFinalK** — Sets the final K value for reranking `config-types.ts:23-23`, `config-types.ts:133-133`
- **rerankerModel** — Specifies the reranker model to be used `config-types.ts:21-21`
- **rerankerModel** — Specifies the model used for reranking `config-types.ts:131-131`
- **rerankerTopK** — Sets the top K value for reranking `config-types.ts:22-22`, `config-types.ts:132-132`
- **resourceConstraints** — Resource constraints for the system `config-types.ts:293-293`
- **searchL** — Search configuration `config-types.ts:346-346`
- **selected_model** — Selected model for provider-specific configurations `worker-embedding-config.ts:33-33`, `worker-embedding-config.ts:43-43`
- **selected_model** — Specifies the selected model for embedding generation `worker-embedding-config.ts:66-66`
- **selected_model** — Represents the selected model for the mlx provider `worker-embedding-config.ts:76-76`
- **semantic** — Configures semantic-related settings `config-types.ts:90-93`
- **semanticAgent** — Represents the configuration for the semantic agent, including model, provider, and API key settings `config-types.ts:367-367`
- **server** — Represents the server configuration `config-types.ts:83-83`
- **simpleQueryTimeout** — Specifies the timeout for simple queries `config-types.ts:272-272`
- **sizeMb** — Size of the model in megabytes `models-catalog.ts:27-27`
- **synchronous** — Indicates whether operations should be performed synchronously `config-types.ts:209-209`
- **taskQueueLimit** — Limit for the task queue `config-types.ts:291-291`
- **tei** — Configuration for TEI provider `config-types.ts:76-81`
- **tei** — Configuration for the tei provider `config-types.ts:190-197`
- **tei** — Provider-specific configurations for TEI `worker-embedding-config.ts:30-40`
- **tempStore** — Configures temporary storage settings `config-types.ts:210-210`
- **timeout** — Sets the timeout for the Ollama provider `config-types.ts:43-43`
- **timeout** — Timeout for requests in seconds `config-types.ts:55-55`, `config-types.ts:63-63`, `config-types.ts:71-71`
- **timeout** — Sets the timeout duration for server requests `config-types.ts:83-83`
- **timeout** — Sets the timeout for the provider `config-types.ts:150-150`, `config-types.ts:164-164`
- **timeout** — Timeout for HTTP requests in seconds `config-types.ts:174-174`, `config-types.ts:184-184`
- **timeout** — Sets the timeout for parser operations `config-types.ts:231-231`
- **timeoutMs** — Sets the timeout in milliseconds for the Ollama provider `config-types.ts:44-44`
- **timeoutMs** — Timeout for requests in milliseconds `config-types.ts:56-56`, `config-types.ts:64-64`, `config-types.ts:72-72`, `config-types.ts:78-78`
- **timeoutMs** — Sets the timeout in milliseconds for the provider `config-types.ts:151-151`, `config-types.ts:165-165`
- **timeoutMs** — Timeout for HTTP requests in milliseconds `config-types.ts:175-175`, `config-types.ts:185-185`, `config-types.ts:193-193`
- **timeoutMs** — Timeout in milliseconds for provider-specific configurations `worker-embedding-config.ts:37-37`
- **timeoutMs** — Sets the timeout in milliseconds for embedding generation `worker-embedding-config.ts:52-52`, `worker-embedding-config.ts:61-61`, `worker-embedding-config.ts:70-70`
- **tokenizerFile** — Path to the tokenizer file for the embedding model `models-catalog.ts:24-24`
- **treeSitter** — Specifies the parser to use for parsing `config-types.ts:227-233`
- **twoPhaseMode** — Enables two-phase mode for embedding and DB insertion `config-types.ts:34-34`, `config-types.ts:140-140`
- **uncommittedPollIntervalMs** — Interval in milliseconds for polling uncommitted changes `config-types.ts:326-326`
- **useEmbeddingsApi** — Indicates whether to use the embeddings API `worker-embedding-config.ts:48-48`
- **useLayeredIndex** — Uses a layered FAISS index for embeddings `config-types.ts:38-38`
- **useLayeredIndex** — Uses a layered FAISS index for reduced disk usage `config-types.ts:144-144`
- **useLlm** — Determines if large language models are used `config-types.ts:105-105`
- **useParser** — Determines if a parser is used `config-types.ts:87-87`
- **useReranker** — Determines if reranking is used for the embedding model `config-types.ts:20-20`
- **useReranker** — Determines if reranking is used for two-stage retrieval `config-types.ts:130-130`
- **valid** — Indicates whether the configuration is valid `yaml-config.ts:781-781`
- **vector_dimensions** — Represents the vector dimensions for the model `worker-embedding-config.ts:82-82`
- **vector_size** — Vector size for the model `worker-embedding-config.ts:18-18`
- **vectorBackend** — Vector backend configuration `config-types.ts:363-363`
- **warmupText** — Specifies the warmup text for the Ollama provider `config-types.ts:48-48`
- **warmupText** — Warmup text for the provider `config-types.ts:74-74`
- **warmupText** — Specifies the warmup text for the provider `config-types.ts:155-155`
- **warmupText** — Text used for warming up the provider `config-types.ts:187-187`
- **watchBranchChanges** — Watch branch changes `config-types.ts:322-322`
- **watcherEnabled** — Controls whether a watcher is enabled `config-types.ts:97-97`
- **watchUncommitted** — Watch uncommitted changes `config-types.ts:324-324`
- **workerPoolSize** — Represents the size of the worker pool, which is optional `config-types.ts:244-244`

## Data Flow

### Inputs
| Source | Data | Type |
|--------|------|------|
| YAML files | `config/default.yaml`, `config/{NODE_ENV}.yaml` | File system |
| Environment | `MCP_*`, `DATABASE_*`, `LOG_*`, `PARSER_*` (100+ vars) | `process.env` |
| TypeScript defaults | `DEFAULT_CONFIG` | Static object |

### Processing
1. Resolve config file path (override > env-specific > default > env-only mode)
2. Read and parse YAML with `yaml.parse()` (sync, catch errors gracefully)
3. Merge YAML values with environment variables using typed parsers
4. Apply TypeScript defaults for any missing values
5. Cache result in singleton instance; cache `WorkerEmbeddingConfig` at module level

### Outputs
| Target | Data | Type |
|--------|------|------|
| All modules | `AppConfig` object | Via `getConfig()` |
| MCP tools | `MCPConfig & { embeddingAvailable }` | Via `getMCPConfigSafe()` |
| Worker processes | `WorkerEmbeddingConfig` | Via `buildWorkerEmbeddingConfig()` |

## Public API

| Export | Type | Description | Location |
|--------|------|-------------|----------|
| `ConfigLoader` | class | Singleton config loader with reload support | [`yaml-config.ts:130-804`](./yaml-config.ts) |
| `getConfig()` | function | Get global `AppConfig` | [`yaml-config.ts:813-815`](./yaml-config.ts) |
| `getMCPConfigSafe()` | function | Get MCP config with embedding availability flag | [`yaml-config.ts:820-820`](./yaml-config.ts) |
| `initializeConfig()` | function | Initialize config and log startup info | [`yaml-config.ts:833-844`](./yaml-config.ts) |
| `validateConfig()` | function | Validate config, return error array | [`yaml-config.ts:853-853`](./yaml-config.ts) |
| `buildWorkerEmbeddingConfig()` | function | Build worker-specific embedding config (cached) | [`worker-embedding-config.ts:214-249`](./worker-embedding-config.ts) |
| `CONSTANTS` | const | All constants as single aggregate object | [`constants.ts:277-285`](./constants.ts) |
| `CACHE_CONSTANTS` | const | Cache TTL, max entries, eviction settings | [`constants.ts:26-47`](./constants.ts) |
| `DATABASE_CONSTANTS` | const | SQLite pool size, page size, WAL limits | [`constants.ts:58-93`](./constants.ts) |
| `PARSER_CONSTANTS` | const | Parser circuit breaker limits | [`constants.ts:104-124`](./constants.ts) |
| `AGENT_CONSTANTS` | const | Multi-agent concurrency, timeouts | [`constants.ts:135-160`](./constants.ts) |
| `RESOURCE_CONSTANTS` | const | Memory, CPU allocation limits | [`constants.ts:171-191`](./constants.ts) |
| `INDEXING_CONSTANTS` | const | Batch sizes, thresholds | [`constants.ts:202-222`](./constants.ts) |
| `VECTOR_CONSTANTS` | const | Vector similarity search config | [`constants.ts:233-268`](./constants.ts) |
| `LOGGING_CONFIG` | const | Logger transport configuration | [`logging-config.ts:11-20`](./logging-config.ts) |
| `DEFAULT_CONFIG` | const | Default `AppConfig` values | [`config-defaults.ts:14-186`](./config-defaults.ts) |
| 30+ interfaces | type | `MCPConfig`, `DatabaseConfig`, `ParserConfig`, etc. | [`config-types.ts`](./config-types.ts) |


### Added Entities

- **EmbeddingModel** — `models-catalog.ts:19-34`
- **ModelsCatalog** — `models-catalog.ts:36-40`
- **loadModelsCatalog** — `models-catalog.ts:52-87`
- **parseCatalog** — `models-catalog.ts:89-117`
- **getActiveModel** — `models-catalog.ts:124-127`
- **getModelById** — `models-catalog.ts:130-133`
- **getAvailableModels** — `models-catalog.ts:136-139`
- **getCdnUrl** — `models-catalog.ts:142-149`
- **configDir** — `models-catalog.ts:57-57`
- **jsonPath** — `models-catalog.ts:58-58`
- **raw** — `models-catalog.ts:59-59`
- **models** — `models-catalog.ts:90-90`
- **rawModels** — `models-catalog.ts:91-91`
- **catalog** — `models-catalog.ts:125-125`
- **catalog** — `models-catalog.ts:131-131`
- **catalog** — `models-catalog.ts:137-137`
- **catalog** — `models-catalog.ts:143-143`
- **model** — `models-catalog.ts:144-144`
- **path** — `models-catalog.ts:146-146`
- **_cached** — `models-catalog.ts:46-46`

## Dependencies

### Internal Modules
| Module | Purpose | Interaction |
|--------|---------|-------------|
| `logging` | Structured logging during config load | `log.i/w/e` calls |
| `utils` | File operations, config path resolution | `existsSync`, `readTextSync`, `loadSemanticConfig` |
| `shared` | Centralized log directory path | `getLogsDir()` |
| `types` | Embedding type definitions | `EmbeddingProviderKind`, `WorkerEmbeddingConfig` |

### External Packages
| Package | Purpose |
|---------|---------|
| `yaml` | YAML file parsing |
| `node:path` | Path resolution |

## Configuration

The config module itself defines 100+ parameters organized by section. Key sections:

| Section | Parameters | Key Env Vars | Description |
|---------|-----------|-------------|-------------|
| `mcp.embedding` | model, provider, enabled, useReranker | `MCP_EMBEDDING_*` | Embedding provider settings |
| `mcp.server` | host, port, timeout | `MCP_SERVER_*` | MCP server binding |
| `mcp.agents` | maxConcurrent, defaultTimeout | `MCP_MAX_CONCURRENT_AGENTS` | Agent runtime limits |
| `database` | path, mode, cacheSize, mmapSize | `DATABASE_*` | SQLite tuning (WAL, sync, cache) |
| `logging` | level, format, outputFile, maxFiles | `LOG_*` | Log output configuration |
| `parser` | treeSitter settings, incremental cache | `PARSER_*` | Tree-sitter and cache settings |
| `indexing` | autoSwitch, incrementalThreshold, dataDir | `INDEXING_*` | Branch management, reindex strategy |
| `git` | watchBranch, pollInterval, debounce | `GIT_*` | Git watcher configuration |
| Agent sections | maxConcurrency, memoryLimit, priority | `*_AGENT_*` | Per-agent resource limits |

See [`config-types.ts`](./config-types.ts) for full interface definitions. See [`config-defaults.ts`](./config-defaults.ts) for all default values.

## Behavioral Properties

| Property | Value |
|----------|-------|
| Async | No -- all operations synchronous (`readTextSync`, no Promises) |
| Thread Safety | Singleton pattern; safe after initialization (read-only access) |
| Idempotency | Yes -- `getConfig()` returns same object; `reload()` is explicit |
| Side Effects | Reads filesystem (YAML), reads `process.env`, logs via logger, `process.exit(1)` on missing override |
| State | Singleton -- `ConfigLoader.instance` + module-level `WorkerEmbeddingConfig` cache |

## Error Handling

Graceful degradation: YAML parse failure falls back to environment variables; invalid env vars fall back to defaults. Only a missing override path causes `process.exit(1)`.

| Error | When | Recovery |
|-------|------|----------|
| YAML parse failure | Malformed or missing config file | Log warning, fall back to env vars + defaults |
| Missing override path | `setOverridePath()` with non-existent file | Log error, `process.exit(1)` |
| Invalid enum env var | Unrecognized value for provider/mode/level | Parser returns `undefined`, default used |
| Validation errors | `validateConfig()` called post-load | Returns error array; app continues |

## Observability

| Event | Level | When |
|-------|-------|------|
| `CONFIG:loaded` | info | Config file successfully parsed |
| `CONFIG:yaml_load_fail` | warn | YAML parse error, falling back |
| `CONFIG:fallback_env` | warn | Using env vars only |
| `CONFIG:override_not_found` | error | Override path does not exist |
| `CONFIG:init` | info | Configuration initialized (env, debug, embEnabled) |
| `WORKEMBCONF:config_built` | info | Worker embedding config created |

## Known Limitations

- No event-based reload notification -- consumers must re-call `getConfig()` after `reload()`
- Synchronous only -- cannot load config from remote sources
- Validation is opt-in (separate `validateConfig()` call, not enforced on load)
- `WorkerEmbeddingConfig` cache has no TTL (lives for application lifetime)
- No config format migration/versioning system
- API keys are static after load (no secrets rotation)

## TypeScript Notes

### Module Boundary
`index.ts` re-exports all public symbols. Internal: `ConfigLoader` private methods (`loadConfiguration`, `mergeWithEnvironment`, type parsers). Constants use `as const` for literal type inference.

## Files

| File | Description |
|------|-------------|
| [`yaml-config.ts`](./yaml-config.ts) | Main ConfigLoader class, cascading merge logic, public API functions |
| [`config-types.ts`](./config-types.ts) | 30+ TypeScript interfaces for all configuration sections |
| [`config-defaults.ts`](./config-defaults.ts) | `DEFAULT_CONFIG` with all default values |
| [`constants.ts`](./constants.ts) | Global constants catalog (7 groups + aggregate) |
| [`logging-config.ts`](./logging-config.ts) | Logger transport and category configuration |
| [`worker-embedding-config.ts`](./worker-embedding-config.ts) | Embedding config builder for worker subprocesses |
