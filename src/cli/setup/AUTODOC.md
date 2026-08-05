# Setup

## 🤖 Overview

The `setup` module is designed to facilitate the initial configuration of a machine learning environment, particularly for setting up hardware, installing necessary components, and configuring the machine learning pipeline. It is used by developers and system administrators who need to automate the setup process for machine learning systems.

## 🤖 Architecture

```
setup
├── setup-hardware.ts — Detects and configures hardware components
├── setup-installers.ts — Manages the installation of software components
├── setup-llm.ts — Handles the setup of large language models
├── setup-selection.ts — Provides selection interfaces for configuration options
├── setup-types.ts — Defines types and interfaces for the setup process
├── setup-ui.ts — Implements user interface elements for setup
└── mcp-installer.ts — Installs machine configuration packages
```

## 🤖 Flow

```
setup
├── setup-hardware.ts → setup-installers.ts → setup-llm.ts → setup-selection.ts → setup-ui.ts → mcp-installer.ts
└── setup-installers.ts → setup-llm.ts → setup-selection.ts → setup-ui.ts → mcp-installer.ts
```

## 🤖 Entity Listing

### Function
- **askEnableLLM** — Asks the user to enable the LLM and returns a boolean `setup-llm.ts:162-178`
- **buildJsonEntry** — Builds a JSON entry for an AI agent based on its style `mcp-installer.ts:216-233`
- **checkClaudeCode** — Verifies that the Claude CLI is available and returns a boolean `setup-llm.ts:136-156`
- **checkDockerModelRunner** — Checks if Docker Model Runner is installed and running `setup-llm.ts:70-82`
- **clearScreen** — Clears the screen `setup-ui.ts:33-39`
- **defaultIdx** — Finds the index of the recommended model in the options array `setup-llm.ts:271-271`
- **defaultIdx** — Default index for the model selection `setup-selection.ts:270-270`
- **detectAgents** — Detects AI agents and returns their status `mcp-installer.ts:181-210`
- **detectAmdGPU** — Detects AMD GPU information using the `rocm-smi` command `setup-hardware.ts:68-80`
- **detectClaudeCli** — Detects the presence of the Claude CLI for LLM setup `setup-llm.ts:863-878`
- **detectGPU** — Detects GPU information using various methods including Apple Silicon, NVIDIA, and AMD GPUs `setup-hardware.ts:11-66`
- **ensureParentDir** — Ensures the parent directory of a file exists `mcp-installer.ts:239-244`
- **filtered** — Filtered list of models `setup-selection.ts:343-343`
- **getAgents** — Returns an array of agent definitions `mcp-installer.ts:41-166`
- **getClaudeCommand** — Determines the path to the Claude CLI and returns a command and its arguments `setup-llm.ts:88-134`
- **getCommandForAgent** — Constructs the command to install the MCP server entry for a specific AI agent `mcp-installer.ts:392-404`
- **getEntryName** — Returns the name of the entry to be added to the agent's configuration `mcp-installer.ts:410-412`
- **getNativeBinaryName** — Returns the name of the native binary for the MCP installer `mcp-installer.ts:370-380`
- **getProviderRecommendations** — Function to get provider recommendations `setup-selection.ts:160-247`
- **installClaudeCode** — Installs the Claude CLI if not found and tests it `setup-llm.ts:518-591`
- **installDMR_LLM** — Installs the Docker Model Runner and tests the model `setup-llm.ts:593-665`
- **installJson** — Installs an AI agent's configuration in JSON format `mcp-installer.ts:246-280`
- **installLLMProvider** — Installs the selected LLM provider `setup-llm.ts:504-516`
- **installMcpConfigs** — Installs UltraCode MCP configurations for detected AI agents `mcp-installer.ts:318-364`
- **installOllamaLLM** — Installs the Ollama LLM and checks if the service is running `setup-llm.ts:780-834`
- **installProvider** — Main Installation Router that handles OVMS (Native), TEI, llama.cpp, Ollama, and MLX embedding providers `setup-installers.ts:34-61`
- **installTGI_LLM** — Installs the TGI LLM and checks for existing containers `setup-llm.ts:667-778`
- **installToAgent** — Installs an AI agent's configuration based on its style `mcp-installer.ts:306-312`
- **installToml** — Installs an AI agent's configuration in TOML format `mcp-installer.ts:282-304`
- **names** — Parses the names of agents from a list of not configured agents and joins them with commas `mcp-installer.ts:355-355`
- **notConfigured** — Filters out AI agents that are not already configured `mcp-installer.ts:326-326`
- **parts** — Not applicable in this context `setup-hardware.ts:46-46`
- **performInstall** — Executes the installation process for the MCP server entry in the specified AI agent's configuration `mcp-installer.ts:414-432`
- **printBanner** — Prints a banner with a setup command title `setup-ui.ts:55-70`
- **printCompleteBanner** — Not present in the provided code `setup-ui.ts:131-137`
- **printError** — Not present in the provided code `setup-ui.ts:84-86`
- **printHardwareInfo** — Not applicable in this context `setup-hardware.ts:82-116`
- **printInfo** — Prints a message indicating information `setup-ui.ts:76-78`
- **printOK** — Prints a message indicating success `setup-ui.ts:72-74`
- **printWarn** — Prints a message indicating a warning `setup-ui.ts:80-82`
- **prompt** — Not present in the provided code `setup-ui.ts:88-129`
- **selectClaudeModel** — Selects the appropriate Claude model for LLM setup `setup-llm.ts:884-907`
- **selectDocLanguage** — Selects the language for the documentation or input text `setup-llm.ts:913-929`
- **selectLanguage** — Function to select a language for the model `setup-selection.ts:137-154`
- **selectLLMModel** — Selects the LLM model for the setup command `setup-llm.ts:300-498`
- **selectLLMProvider** — Selects the LLM provider for the setup command `setup-llm.ts:184-294`
- **selectModel** — Function to select a model `setup-selection.ts:329-404`
- **selectProvider** — Function to select a provider `setup-selection.ts:249-287`
- **setupLLM** — Sets up the LLM provider and model for the application `setup-llm.ts:942-1054`
- **stripBom** — Removes the byte order mark (BOM) from the start of a string `mcp-installer.ts:177-179`
- **tgiModels** — Filters the TGI models based on available VRAM `setup-llm.ts:392-392`
- **writeErr** — Safe stderr write that works even when process.stderr is broken `setup-ui.ts:13-30`
- **zigModelToEmbeddingModel** — Function to convert a Zig model to an embedding model `setup-selection.ts:297-322`

### Interface
- **AgentDef** — Defines the configuration for an AI agent `mcp-installer.ts:33-39`
- **AgentStatus** — Represents the status of an AI agent, including whether it is already configured `mcp-installer.ts:172-175`
- **EmbeddingModel** — Represents an embedding model with various attributes like provider, model ID, and GPU support `setup-types.ts:5-39`
- **GPUInfo** — Provides information about available GPU devices `setup-types.ts:48-55`
- **InstallResult** — Represents the result of an installation `setup-types.ts:122-136`
- **LLMConfig** — Configuration for the LLM model `setup-types.ts:102-110`
- **LLMModel** — Represents a large language model with its configuration and performance metrics `setup-types.ts:57-73`
- **LLMResult** — Represents the result of an LLM setup or selection process `setup-llm.ts:845-858`
- **ModelsConfig** — Configures models and providers `setup-types.ts:41-46`
- **OllamaLLMModel** — Represents an LLM model using Ollama `setup-types.ts:90-100`
- **ProviderOption** — Represents a provider option with details like ID, name, recommended status, speed, pros, cons, and availability `setup-types.ts:112-120`
- **SelectedLLMModel** — Represents a selected LLM model `setup-types.ts:138-146`
- **TGIModel** — Represents a model for Text Generation Interface with its configuration `setup-types.ts:75-88`
- **ZigEmbeddingModel** — Represents a model in the Zig embedding model catalog `setup-selection.ts:19-30`

### Type_alias
- **EntryStyle** — Represents the style of the MCP entry `mcp-installer.ts:31-31`

### Import_decl
- **../../cpu/cpu-detector.js** — Imports `../../cpu/cpu-detector.js` from `../../cpu/cpu-detector.js`. `setup-hardware.ts:6-6`, `setup-installers.ts:17-17`, `setup-llm.ts:17-17`, `setup-selection.ts:8-8`
- **../../utils/runtime-detection.js** — Imports `../../utils/runtime-detection.js` from `../../utils/runtime-detection.js`. `setup-llm.ts:18-18`
- **./i18n/index.js** — Imports `./i18n/index.js` from `./i18n/index.js`. `setup-hardware.ts:7-7`, `setup-llm.ts:19-19`, `setup-selection.ts:9-9`
- **./installers/llamacpp-installer.js** — Imports `./installers/llamacpp-installer.js` from `./installers/llamacpp-installer.js`. `setup-installers.ts:24-24`
- **./installers/mlx-installer.js** — Imports `./installers/mlx-installer.js` from `./installers/mlx-installer.js`. `setup-installers.ts:25-25`
- **./installers/ollama-installer.js** — Imports `./installers/ollama-installer.js` from `./installers/ollama-installer.js`. `setup-installers.ts:26-26`
- **./installers/ovms-installer.js** — Imports `./installers/ovms-installer.js` from `./installers/ovms-installer.js`. `setup-installers.ts:28-28`
- **./installers/tei-installer.js** — Imports `./installers/tei-installer.js` from `./installers/tei-installer.js`. `setup-installers.ts:29-29`
- **./setup-installers.js** — Imports `./setup-installers.js` from `./setup-installers.js`. `setup-llm.ts:20-20`
- **./setup-types.js** — Imports `./setup-types.js` from `./setup-types.js`. `setup-hardware.ts:8-8`, `setup-installers.ts:18-18`, `setup-llm.ts:21-21`, `setup-selection.ts:10-10`
- **./setup-ui.js** — Imports `./setup-ui.js` from `./setup-ui.js`. `mcp-installer.ts:23-23`, `setup-hardware.ts:9-9`, `setup-installers.ts:19-19`, `setup-llm.ts:22-22`, `setup-selection.ts:11-11`
- **node:child_process** — Imports `node:child_process` from `node:child_process`. `setup-hardware.ts:5-5`, `setup-llm.ts:8-8`
- **node:fs** — Imports `node:fs` from `node:fs`. `mcp-installer.ts:20-20`, `setup-llm.ts:9-9`, `setup-ui.ts:8-8`
- **node:os** — Imports `node:os` from `node:os`. `mcp-installer.ts:22-22`, `setup-llm.ts:10-10`
- **node:path** — Imports `node:path` from `node:path`. `mcp-installer.ts:21-21`, `setup-llm.ts:11-11`
- **node:readline** — Imports `node:readline` from `node:readline`. `setup-ui.ts:9-9`

### Property
- **agent** — Stores the definition of an AI agent `mcp-installer.ts:173-173`
- **alreadyConfigured** — Indicates whether the AI agent is already configured `mcp-installer.ts:174-174`
- **api_key** — Stores the API key for LLM authentication `setup-llm.ts:851-851`
- **architecture** — Specifies the GPU architecture `setup-types.ts:51-51`
- **args** — Returns a command and its arguments for the Claude CLI `setup-llm.ts:88-88`
- **available** — Indicates whether the model is available `setup-types.ts:37-37`, `setup-types.ts:49-49`
- **available** — Indicates if a model is available `setup-types.ts:119-119`
- **avg_ms** — Optional average time in milliseconds for the model `setup-types.ts:27-27`
- **badge** — Optional badge associated with the embedding model `setup-types.ts:9-9`
- **badge** — Optional badge or icon for the model `setup-types.ts:61-61`, `setup-types.ts:79-79`
- **benchmark_chunks_per_sec** — Optional benchmark chunks per second for the model `setup-types.ts:23-23`
- **benchmark_note** — Note about the model's benchmark performance `setup-types.ts:99-99`
- **benchmark_toks** — Optional benchmark tokens for the model `setup-types.ts:22-22`
- **blackwell_status** — Status related to Blackwell compatibility `setup-types.ts:105-105`
- **cmd** — Returns a command and its arguments for the Claude CLI `setup-llm.ts:88-88`
- **computeCap** — Indicates the compute capability of the GPU `setup-types.ts:52-52`
- **config** — Configuration settings for models `setup-types.ts:125-125`
- **configFile** — The configuration file path for the AI agent `mcp-installer.ts:36-36`
- **cons** — The disadvantages of a model `setup-types.ts:118-118`
- **context** — Context length of the model `setup-selection.ts:23-23`
- **context_tokens** — Defines the maximum number of context tokens for the LLM model `setup-llm.ts:855-855`
- **context_tokens** — Maximum number of context tokens the model can handle `setup-types.ts:17-17`, `setup-types.ts:64-64`, `setup-types.ts:82-82`, `setup-types.ts:93-93`
- **context_tokens** — Specifies the number of context tokens supported by an embedding model `setup-types.ts:142-142`
- **default_models** — Defines default models for each provider `setup-types.ts:45-45`
- **default_models** — A record of default models for different providers `setup-types.ts:109-109`
- **default_port** — Specifies the default port for the provider `setup-types.ts:43-43`
- **description** — Description of the model `setup-types.ts:25-25`, `setup-types.ts:71-71`
- **description** — Describes the model `setup-types.ts:43-43`
- **description** — Provides a detailed description of the model `setup-types.ts:86-86`, `setup-types.ts:104-104`, `setup-types.ts:105-105`
- **detectDir** — The directory to detect the AI agent `mcp-installer.ts:35-35`
- **detectedDimensions** — Detected dimensions of a model `setup-types.ts:133-133`
- **detectedModelId** — Detected model ID `setup-types.ts:135-135`
- **device** — Optional device for the model `setup-types.ts:26-26`
- **device** — Specifies the device type for an embedding model `setup-types.ts:145-145`
- **devices** — List of devices the model is compatible with `setup-types.ts:63-63`
- **dimension** — Dimension of the model `setup-selection.ts:22-22`
- **dimensions** — Dimensions of the model `setup-types.ts:18-18`
- **doc_language** — Determines the language of the documentation or input text `setup-llm.ts:857-857`
- **docker_args** — Contains arguments for Docker commands `setup-types.ts:87-87`
- **endpoint** — Specifies the API endpoint for LLM communication `setup-llm.ts:849-849`
- **endpoints** — Endpoints for model inference `setup-types.ts:129-129`
- **error** — Indicates if an installation failed `setup-types.ts:124-124`
- **gpu_architectures** — Array of GPU architectures supported by the model `setup-types.ts:11-11`
- **gpu_architectures** — List of GPU architectures supported by the model `setup-types.ts:81-81`
- **gpu_support** — Boolean indicating if the model supports GPU `setup-types.ts:12-12`
- **hf_model** — Represents the Hugging Face model ID `setup-types.ts:31-31`
- **hf_repo** — Hugging Face repository URL for the model `setup-selection.ts:28-28`
- **id** — Unique identifier for the model `setup-selection.ts:20-20`, `setup-types.ts:58-58`, `setup-types.ts:76-76`, `setup-types.ts:91-91`
- **id** — Unique identifier for an embedding model `setup-types.ts:6-6`
- **id** — A unique identifier for a model `setup-types.ts:113-113`, `setup-types.ts:139-139`
- **image_cpu** — Optional CPU image for the model `setup-types.ts:15-15`
- **image_gpu** — Optional GPU image for the model `setup-types.ts:13-13`
- **image_gpu_blackwell** — Optional Blackwell GPU image for the model `setup-types.ts:14-14`
- **irPath** — The path to the inference repository `setup-types.ts:127-127`
- **isBlackwell** — Indicates whether the GPU is a Blackwell GPU `setup-types.ts:53-53`
- **lang** — Language of the model, either "en" or "multi" `setup-selection.ts:24-24`
- **language** — The language the model supports `setup-types.ts:16-16`
- **license** — License information for the model `setup-types.ts:72-72`
- **max_model_len** — Specifies the maximum model length `setup-types.ts:38-38`
- **model** — Selects the specific LLM model to be used `setup-llm.ts:853-853`
- **model_id** — Unique identifier for the model within the provider `setup-types.ts:10-10`
- **model_id** — The specific identifier for the model `setup-types.ts:62-62`, `setup-types.ts:80-80`
- **model_id** — The ID of a model `setup-types.ts:140-140`
- **modelName** — The name of a model `setup-types.ts:131-131`
- **models** — Contains a list of embedding models `setup-types.ts:44-44`
- **models** — Represents a collection of models for embedding `setup-types.ts:106-106`
- **mteb** — Mean Text Embedding Benchmark score `setup-selection.ts:25-25`
- **name** — The name of the AI agent `mcp-installer.ts:34-34`
- **name** — Name of the model `setup-selection.ts:21-21`, `setup-types.ts:92-92`, `setup-types.ts:104-104`, `setup-types.ts:105-105`
- **name** — The name of the embedding model `setup-types.ts:8-8`
- **name** — Provides the name of the model `setup-types.ts:43-43`, `setup-types.ts:50-50`
- **name** — The name of the model `setup-types.ts:60-60`, `setup-types.ts:78-78`
- **name** — The name of a model `setup-types.ts:114-114`
- **name** — Represents the name of an embedding model `setup-types.ts:141-141`
- **note_en** — Note in English for the model `setup-selection.ts:26-26`
- **note_ru** — Note in Russian for the model `setup-selection.ts:27-27`
- **ollama** — Indicates if the model is compatible with Ollama `setup-types.ts:104-104`
- **ollama_models** — Stores an array of OllamaLLMModel instances `setup-types.ts:107-107`
- **optimal_batch_size** — Optional optimal batch size for the model `setup-types.ts:28-28`
- **ov_repo** — Optional repository for the model `setup-types.ts:30-30`
- **ovms_format** — Specifies the format for the model `setup-types.ts:32-32`
- **platform** — Determines the platform (e.g., Docker, Ollama, etc.) for LLM setup `setup-llm.ts:847-847`
- **pooling** — Indicates the pooling method used `setup-types.ts:33-33`
- **pros** — The advantages of a model `setup-types.ts:117-117`
- **provider** — The provider of the embedding model `setup-types.ts:7-7`
- **provider** — The provider or vendor of the model `setup-types.ts:59-59`, `setup-types.ts:77-77`
- **providers** — Defines available providers and their details `setup-types.ts:43-43`
- **providers** — List of providers for the model `setup-types.ts:105-105`
- **quality** — Quality metrics for the model `setup-types.ts:69-69`
- **quality_overall** — Overall quality score of the model `setup-types.ts:97-97`
- **ram_gb** — Amount of RAM required by the model in gigabytes `setup-types.ts:66-66`
- **ram_mb** — Optional RAM size of the model in megabytes `setup-types.ts:21-21`
- **recommended** — Indicates if a model is recommended `setup-types.ts:115-115`
- **scenarios** — Scenarios where the model is used `setup-types.ts:104-104`
- **serversKey** — The key in the configuration file for servers `mcp-installer.ts:37-37`
- **size_gb** — Size of the model in gigabytes `setup-types.ts:65-65`, `setup-types.ts:83-83`, `setup-types.ts:94-94`
- **size_gb** — Indicates the size of an embedding model in gigabytes `setup-types.ts:143-143`
- **size_mb** — Size of the model in megabytes `setup-selection.ts:29-29`, `setup-types.ts:19-19`
- **speed** — The speed of a model `setup-types.ts:116-116`
- **style** — The style of the MCP entry `mcp-installer.ts:38-38`
- **success** — Indicates if an installation was successful `setup-types.ts:123-123`
- **tgi** — Indicates if the model is compatible with TGI `setup-types.ts:104-104`
- **tgi_models** — Stores an array of TGIModel instances `setup-types.ts:108-108`
- **tokens_per_sec_cpu** — Tokens per second the model can process on CPU `setup-types.ts:67-67`
- **tokens_per_sec_gpu** — Tokens per second the model can process on GPU `setup-types.ts:96-96`
- **tokens_per_sec_npu** — Tokens per second the model can process on NPU `setup-types.ts:68-68`
- **trust_remote_code** — Indicates whether to trust remote code `setup-types.ts:35-35`, `setup-types.ts:38-38`
- **use_case** — Use case for the model `setup-types.ts:24-24`
- **use_case** — Use case or application for the model `setup-types.ts:70-70`
- **use_case** — Describes the intended use case for the model `setup-types.ts:85-85`, `setup-types.ts:98-98`
- **useIR** — Indicates if inference is used `setup-types.ts:126-126`
- **v3_api** — Indicates whether the model uses the v3 API `setup-types.ts:34-34`
- **version** — Specifies the version of the configuration `setup-types.ts:42-42`
- **version** — Version of the model `setup-types.ts:103-103`
- **vllm_config** — Contains configuration for vLLM `setup-types.ts:38-38`
- **vram_gb** — Represents the amount of VRAM in gigabytes `setup-types.ts:84-84`, `setup-types.ts:95-95`
- **vram_gb** — Denotes the VRAM usage of an embedding model in gigabytes `setup-types.ts:144-144`
- **vram_mb** — Optional VRAM size of the model in megabytes `setup-types.ts:20-20`
- **vramMB** — Specifies the VRAM in MB of the GPU `setup-types.ts:54-54`
- **weight_format** — Specifies the weight format `setup-types.ts:36-36`

## Data Flow

- **Inputs:** Hardware detection results (CPU features, GPU architecture/VRAM), user selections via interactive prompts, JSON model configs from `config/` directory.
- **Processing:** Provider recommendation based on hardware, model filtering by provider/language compatibility, installation via Docker or native binaries, health checks.
- **Outputs:** `semantic-config.json` with embedding and LLM configuration, installed/running provider services.

## Public API

| Export | Type | Description | Location |
|--------|------|-------------|----------|
| `detectGPU` | function | Detects NVIDIA GPU via nvidia-smi | [`setup-hardware.ts:11-56`](./setup-hardware.ts) |
| `printHardwareInfo` | function | Displays CPU and GPU info | [`setup-hardware.ts:58-86`](./setup-hardware.ts) |
| `installProvider` | function | Routes embedding provider installation | [`setup-installers.ts:34-61`](./setup-installers.ts) |
| `selectLanguage` | function | Interactive code language selection | [`setup-selection.ts:14-31`](./setup-selection.ts) |
| `selectProvider` | function | Interactive provider selection with recommendations | [`setup-selection.ts:96-117`](./setup-selection.ts) |
| `selectModel` | function | Interactive embedding model selection | [`setup-selection.ts:152-286`](./setup-selection.ts) |
| `askEnableLLM` | function | Asks about enabling LLM for AutoDoc | [`setup-llm.ts:162-178`](./setup-llm.ts) |
| `selectLLMProvider` | function | Interactive LLM provider selection | [`setup-llm.ts:184-294`](./setup-llm.ts) |
| `selectLLMModel` | function | Interactive LLM model selection | [`setup-llm.ts:295-295`](./setup-llm.ts) |
| `installLLMProvider` | function | Installs and launches LLM provider | [`setup-llm.ts:300-498`](./setup-llm.ts) |
| `EmbeddingModel` | interface | Embedding model configuration | [`setup-types.ts:5-39`](./setup-types.ts) |
| `ModelsConfig` | interface | All available models and providers config | [`setup-types.ts:41-46`](./setup-types.ts) |
| `GPUInfo` | interface | GPU availability and architecture info | [`setup-types.ts:48-55`](./setup-types.ts) |
| `LLMConfig` | interface | LLM models and providers config | [`setup-types.ts:102-110`](./setup-types.ts) |
| `c` | const | ANSI color codes for console output | [`setup-ui.ts:13-30`](./setup-ui.ts) |
| `printBanner` | function | Displays setup welcome banner | [`setup-ui.ts:13-30`](./setup-ui.ts) |
| `printOK` / `printInfo` / `printWarn` / `printError` | functions | Colored status message printing | [`setup-ui.ts:44-46`](./setup-ui.ts) |
| `prompt` | function | Interactive string input from stdin | [`setup-ui.ts:55-70`](./setup-ui.ts) |
| `AgentDef` | interface | MCP agent configuration definition | [`mcp-installer.ts:33-39`](./mcp-installer.ts) |
| `AgentStatus` | interface | MCP agent installation and runtime status | [`mcp-installer.ts:172-175`](./mcp-installer.ts) |
| `ENTRY_NAME` | const | Constant name for MCP configuration entry | [`mcp-installer.ts:25-25`](./mcp-installer.ts) |
| `getAgents` | function | Retrieves list of available MCP agents | [`mcp-installer.ts:41-166`](./mcp-installer.ts) |
| `stripBom` | function | Removes Byte Order Mark from text content | [`mcp-installer.ts:177-179`](./mcp-installer.ts) |
| `detectAgents` | function | Detects installed MCP agents from configuration files | [`mcp-installer.ts:158-203`](./mcp-installer.ts) |
| `buildJsonEntry` | function | Constructs JSON configuration entry for MCP agent | [`mcp-installer.ts:216-233`](./mcp-installer.ts) |
| `ensureParentDir` | function | Creates parent directory if it does not exist | [`mcp-installer.ts:239-244`](./mcp-installer.ts) |
| `installJson` | function | Installs MCP agent configuration in JSON format | [`mcp-installer.ts:246-280`](./mcp-installer.ts) |
| `installToml` | function | Installs MCP agent configuration in TOML format | [`mcp-installer.ts:282-304`](./mcp-installer.ts) |
| `installToAgent` | function | Routes installation to correct agent configuration format | [`mcp-installer.ts:303-309`](./mcp-installer.ts) |
| `installMcpConfigs` | function | Main orchestrator for MCP agent installation and configuration | [`mcp-installer.ts:315-361`](./mcp-installer.ts) |
| `getCommandForAgent` | function | Generates command string for executing MCP agent | [`mcp-installer.ts:356-379`](./mcp-installer.ts) |
| `performInstall` | function | Executes the actual MCP installation and setup process | [`mcp-installer.ts:374-392`](./mcp-installer.ts) |

## Dependencies

### Internal Modules

| Module | Purpose |
|--------|---------|
| `setup/i18n` | Localized UI strings (English, Russian) |
| `setup/installers` | Provider-specific installation logic |
| `setup/utils` | Docker, NVIDIA toolkit, runtime helpers |

### External Packages

| Package | Purpose |
|---------|---------|
| `node:readline` | Interactive user prompts |
| `node:child_process` | Process spawning for nvidia-smi, Docker |

## Behavioral Properties

| Property | Value |
|----------|-------|
| Supported embedding providers | vLLM, TEI, llama.cpp, OVMS, OVMS-native, Ollama |
| Supported LLM providers | Claude Code, Ollama, TGI, Docker Model Runner |
| UI languages | English, Russian (auto-detected from system locale) |

## Error Handling

Provider installation failures are reported but do not block config saving. Missing Docker or nvidia-smi produce warning messages with installation hints. Health check timeouts log warnings but allow the setup to complete.

## Known Limitations

- GPU detection only supports NVIDIA via nvidia-smi; AMD and Intel GPUs are detected at a basic level.
- Interactive prompts require a TTY; non-interactive mode is not fully supported.
- LLM setup depends on external model config JSON files existing in the `config/` directory.

## Files

| File | Description |
|------|-------------|
| `index.ts` | Re-exports all public functions and types |
| `setup-hardware.ts` | GPU and CPU detection, hardware info display |
| `setup-installers.ts` | Routes embedding provider installation |
| `setup-llm.ts` | LLM provider selection and installation |
| `setup-selection.ts` | Interactive dialogs for language, provider, model |
| `setup-types.ts` | TypeScript interfaces for models and providers |
| `setup-ui.ts` | ANSI colors, message printing, interactive input |
| `mcp-installer.ts` | MCP agent detection and installation configuration |
