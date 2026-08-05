# I18n (Setup)

## 🤖 Overview

The `i18n` module for the setup command provides translation functions for UI strings, supporting multiple languages such as English and Russian. It is used by developers to manage and access localized strings for the setup interface.

## 🤖 Architecture

```
  +-------------------+
  |   i18n Module     |
  +-------------------+
  |   - translations  |
  |     +-------------+     |
  |     | en.ts        |     |
  |     | ru.ts        |     |
  |     +-------------+     |
  |   - currentLanguage |
  |   - t()            |
  |   - ti()           |
  |   - ta()           |
  +-------------------+
```

## 🤖 Flow

```
  +-------------------+
  |   Set Language    |
  +-------------------+
  |   +-------------------+     |
  |   |   Get Translation  |     |
  |   +-------------------+     |
  |       +-------------------+
  |       |   Translate Key  |     |
  |       +-------------------+
  |           +-------------------+
  |           |   Interpolate    |     |
  |           +-------------------+
  |               +-------------------+
  |               |   Get String     |     |
  |               +-------------------+
  |                           |
  |                           v
  +---------------------------+
```

## 🤖 Entity Listing

### Function
- **getSetupLanguage** — Gets the current language `index.ts:31-33`
- **getStrings** — Returns the current language's setup strings `index.ts:133-135`
- **setSetupLanguage** — Sets the current language for setup UI `index.ts:24-26`
- **t** — Gets translated string by key path `index.ts:42-74`
- **ta** — Parses a key path to retrieve a translated string, falling back to English if not found `index.ts:100-128`
- **ti** — Gets translated string with interpolation `index.ts:83-91`

### Interface
- **ProviderStrings** — Interface for provider-specific strings (name, pros, cons) `types.ts:8-12`
- **SetupStrings** — Complete setup strings interface `types.ts:17-398`

### Import_decl
- **../../../i18n/types.js** — Imports `../../../i18n/types.js` from `../../../i18n/types.js`. `index.ts:10-10`
- **./en.js** — Imports `./en.js` from `./en.js`. `index.ts:11-11`
- **./ru.js** — Imports `./ru.js` from `./ru.js`. `index.ts:12-12`
- **./types.js** — Imports `./types.js` from `./types.js`. `en.ts:5-5`, `index.ts:13-13`, `ru.ts:5-5`

### Property
- **action_cancel** — Represents the action to cancel the current operation `types.ts:258-258`
- **action_cancel** — Action to cancel the setup process `types.ts:348-348`
- **action_reinstall** — Represents the action to reinstall the software `types.ts:257-257`
- **action_reinstall** — Action to reinstall the backend `types.ts:347-347`
- **action_use** — Represents the action to use the installed software `types.ts:256-256`
- **action_use** — Action to use the existing backend `types.ts:346-346`
- **already_installed** — Indicates that the software is already installed `types.ts:255-255`
- **already_installed** — Indicates that the backend is already installed `types.ts:345-345`
- **api** — Represents an API endpoint `types.ts:305-305`
- **api_key_from_env** — Represents a string for retrieving an API key from the environment `types.ts:101-101`
- **api_key_optional** — Represents a string indicating that an API key is optional `types.ts:105-105`
- **api_key_prompt** — Represents a string for prompting the user to enter an API key `types.ts:102-102`
- **auto_start_hint** — Provides a hint for automatic start `types.ts:306-306`
- **auto_start_hint** — Represents the auto start hint string `types.ts:374-374`
- **auto_stop_hint** — Provides a hint for automatic stop `types.ts:307-307`
- **banner** — Banner strings interface `types.ts:21-24`
- **batch_config** — Configures batch settings `types.ts:322-322`
- **binary_not_found** — Binary not found for the backend `types.ts:352-352`
- **blackwell_detected** — Indicates detection of Blackwell `types.ts:319-319`
- **blackwell_image** — Represents a Blackwell image `types.ts:320-320`
- **build_ovms_hint** — Provides a hint for building Ovms `types.ts:290-290`
- **checking** — Indicates that a check is being performed `types.ts:217-217`
- **claude** — Represents the Claude provider `types.ts:85-85`
- **claude_api** — Represents a provider-specific string for Claude API `types.ts:95-95`
- **claude_api_title** — Represents a title for a provider selection step `types.ts:100-100`
- **claude_available** — Indicates that the Claude model is available `types.ts:189-189`
- **claude_check_auth** — Checks the authentication status for the Claude model `types.ts:195-195`
- **claude_cli** — Represents a provider-specific string for Claude CLI `types.ts:94-94`
- **claude_cli_detected** — Represents a string indicating Claude CLI has been detected `types.ts:98-98`
- **claude_cli_not_found** — Represents a string indicating Claude CLI has not been found `types.ts:99-99`
- **claude_cost** — Represents the cost associated with using the Claude model `types.ts:193-193`
- **claude_haiku** — Represents a provider-specific string for Claude Haiku `types.ts:116-116`
- **claude_haiku_hint** — Represents a hint for selecting Claude Haiku `types.ts:117-117`
- **claude_install_hint** — Provides a hint for installing the Claude model `types.ts:188-188`
- **claude_model_title** — Represents a title for a model selection step `types.ts:115-115`
- **claude_not_found** — Indicates that the Claude model is not found `types.ts:187-187`
- **claude_opus** — Represents a provider-specific string for Claude Opus `types.ts:120-120`
- **claude_opus_hint** — Represents a hint for Claude Opus `types.ts:121-121`
- **claude_response** — Represents the response from the Claude model `types.ts:192-192`
- **claude_setup** — Represents the setup process for Claude `types.ts:186-186`
- **claude_sonnet** — Represents a provider-specific string for Claude Sonnet `types.ts:118-118`
- **claude_sonnet_hint** — Represents a hint for selecting Claude Sonnet `types.ts:119-119`
- **claude_test_failed** — Indicates that the Claude model test failed `types.ts:194-194`
- **claude_testing** — Indicates that the Claude model is being tested `types.ts:190-190`
- **claude_works** — Indicates that the Claude model works `types.ts:191-191`
- **codeLanguage** — Code language selection strings interface `types.ts:32-38`
- **common** — Represents common status messages `types.ts:392-397`
- **complete** — Complete setup title `types.ts:25-27`
- **config_created** — Indicates that the configuration was successfully created `types.ts:265-265`
- **config_failed** — Indicates that the configuration failed `types.ts:264-264`
- **configuring_model** — Indicates that the model is being configured `types.ts:259-259`
- **cons** — Provider disadvantages `types.ts:11-11`
- **container_action_cancel** — Represents the action of canceling a container operation `types.ts:158-158`
- **container_action_reinstall** — Represents the action to reinstall a container `types.ts:157-157`
- **container_action_restart** — Represents the action to restart a container `types.ts:156-156`
- **container_created** — Signifies the creation of a container `types.ts:161-161`
- **container_exists** — Indicates a container exists `types.ts:155-155`
- **container_removed** — Denotes the removal of a container `types.ts:160-160`
- **container_restarted** — Indicates that a container has been restarted `types.ts:159-159`
- **context_prompt** — Represents a string for prompting the user to select a context `types.ts:107-107`
- **convert_error** — Represents an error during model conversion `types.ts:296-296`
- **convert_quantization** — Represents the quantization of a model `types.ts:294-294`
- **convert_time_hint** — Provides a hint about the time taken for model conversion `types.ts:292-292`
- **copied_dlls** — Copied DLLs for the backend `types.ts:355-355`
- **copy_dlls_failed** — Failed to copy DLLs for the backend `types.ts:356-356`
- **copying_libs** — Copying libraries for the backend `types.ts:354-354`
- **cpu_backend** — Backend for CPU `types.ts:344-344`
- **cpu_basic** — Represents basic CPU performance `types.ts:138-138`
- **cpu_excellent** — Represents excellent CPU performance `types.ts:136-136`
- **cpu_fallback** — Represents a fallback to CPU usage if GPU is not available `types.ts:252-252`
- **cpu_good** — Represents good CPU performance `types.ts:137-137`
- **cpu_optimal** — Represents optimal CPU performance `types.ts:135-135`
- **cpu_unknown** — Represents unknown CPU performance `types.ts:140-140`
- **cpu_weak** — Represents weak CPU performance `types.ts:139-139`
- **cuda_backend** — Backend for CUDA `types.ts:342-342`
- **cuda_copy_failed** — Failed to copy CUDA backend `types.ts:359-359`
- **cuda_download_failed** — Failed to download CUDA backend `types.ts:360-360`
- **cuda_installed** — CUDA backend is installed `types.ts:358-358`
- **detected_backend** — Detected backend for the current platform `types.ts:341-341`
- **dmr** — Represents the DMR provider `types.ts:86-86`
- **dmr_api_endpoint** — Represents the API endpoint for the DMR model `types.ts:209-209`
- **dmr_available** — Indicates that the DMR model is available `types.ts:201-201`
- **dmr_cli_hint** — Provides a hint for using the DMR model in the CLI `types.ts:208-208`
- **dmr_enable_gpu** — Enables the DMR model with GPU support `types.ts:206-206`
- **dmr_enable_hint** — Provides a hint for enabling the DMR model `types.ts:200-200`
- **dmr_enable_tcp** — Enables the DMR model with TCP support `types.ts:207-207`
- **dmr_important** — Highlights the importance of the DMR model `types.ts:205-205`
- **dmr_not_available** — Indicates that the DMR model is not available `types.ts:198-198`
- **dmr_requires** — Lists the requirements for the DMR model `types.ts:199-199`
- **dmr_setup** — Represents the setup process for the DMR model `types.ts:197-197`
- **dmr_subtitle** — Represents a subtitle for DMR `types.ts:122-122`
- **dmr_test_failed** — Indicates that the DMR model test failed `types.ts:210-210`
- **dmr_testing** — Indicates that the DMR model is being tested `types.ts:202-202`
- **dmr_usage** — Represents the usage of the DMR model `types.ts:204-204`
- **dmr_works** — Indicates that the DMR model works `types.ts:203-203`
- **doc_lang_title** — Represents a title for a code language selection step `types.ts:92-92`
- **docker_available** — Indicates Docker is available `types.ts:151-151`
- **docker_converting** — Represents the conversion of a model using Docker `types.ts:291-291`
- **docker_fallback** — Represents a fallback to Docker if the model export fails `types.ts:287-287`
- **docker_install_hint** — Represents a hint for Docker installation `types.ts:152-152`
- **docker_install_url** — Represents the URL for Docker installation `types.ts:153-153`
- **docker_required** — Indicates Docker is required `types.ts:150-150`
- **docker_restart_failed** — Indicates that Docker restart failed `types.ts:231-231`
- **docker_restarting** — Indicates that Docker is in the process of restarting `types.ts:229-229`
- **docker_starting** — Shows that Docker is starting `types.ts:230-230`
- **download_error** — Represents an error during model download `types.ts:276-276`
- **download_time_hint** — Provides a hint about the estimated time for downloading a model `types.ts:365-365`
- **downloaded** — Indicates that the download was successful `types.ts:273-273`
- **downloading** — Represents the downloading process `types.ts:260-260`
- **downloading_cuda** — Downloading CUDA backend `types.ts:357-357`
- **downloading_gguf** — Represents the state of downloading a GGUF model `types.ts:364-364`
- **downloading_image** — Represents the download of an image `types.ts:293-293`
- **driver_not_found** — Indicates that the driver could not be found `types.ts:224-224`
- **driver_ok** — Denotes that the driver is in an optimal state `types.ts:220-220`
- **driver_old** — Signifies that the driver is outdated `types.ts:221-221`
- **driver_update_hint** — Provides a hint for updating the driver `types.ts:222-222`
- **driver_update_url** — Contains the URL for updating the driver `types.ts:223-223`
- **enable_hint** — Represents a hint message to enable a feature `types.ts:76-76`
- **enable_question** — Represents a question to enable a feature `types.ts:75-75`
- **endpoint_prompt** — Represents a string for prompting the user to enter an endpoint `types.ts:104-104`
- **error** — Represents an error status `types.ts:386-386`
- **export_error** — Represents an error during model export `types.ts:286-286`
- **export_exit_code** — Represents the exit code of the export process `types.ts:285-285`
- **export_failed** — Indicates that the model export failed `types.ts:297-297`
- **export_success** — Indicates successful model export `types.ts:283-283`
- **export_time_hint** — Provides a hint about the time taken for model export `types.ts:282-282`
- **exporting_via_ovms** — Represents the export of a model via Ovms `types.ts:280-280`
- **extracted** — Indicates that the extraction was successful `types.ts:262-262`
- **extracting** — Represents the process of extracting model files `types.ts:274-274`
- **extraction_failed** — Indicates that the extraction process failed `types.ts:261-261`
- **fallback_version** — Represents the fallback version of a model `types.ts:376-376`
- **gpu_available** — Indicates that the GPU is available `types.ts:237-237`
- **gpu_hint** — Represents a hint for GPU `types.ts:141-141`
- **gpu_not_detected** — Indicates GPU is not detected `types.ts:142-142`
- **gpu_still_unavailable** — Indicates that the GPU is still unavailable `types.ts:233-233`
- **grpc** — Defines gRPC API endpoints `types.ts:303-303`
- **hardware** — Represents hardware information `types.ts:133-143`
- **health_status** — Represents the health status of the system `types.ts:269-269`
- **health_timeout** — Denotes a timeout in health checks `types.ts:176-176`
- **health_waiting** — Indicates that health checks are waiting `types.ts:175-175`
- **hf_token_partial** — Represents a partial HF token `types.ts:323-323`
- **hf_token_set_hint** — Provides a hint for setting HF token `types.ts:318-318`
- **image_exists** — Checks if an image exists `types.ts:163-163`
- **info** — Represents informational status `types.ts:384-384`
- **install** — Represents an installation string `types.ts:148-211`
- **install_error** — Indicates an error during installation `types.ts:238-238`
- **installed** — Confirms that the installation is complete `types.ts:236-236`
- **installed** — Indicates that a model is already installed `types.ts:275-275`
- **installed** — Backend is installed `types.ts:353-353`
- **installing** — Indicates that installation is in progress `types.ts:235-235`
- **intel_arc_detected** — Indicates that an Intel ARC GPU is detected `types.ts:246-246`
- **intel_igpu_detected** — Indicates that an Intel GPU is detected `types.ts:247-247`
- **invalid_choice** — Represents an invalid choice `types.ts:396-396`
- **legacy** — Denotes a legacy or outdated option or setting `types.ts:60-60`
- **llamacpp** — LlamaCPP provider strings `types.ts:50-50`
- **llamacpp** — Represents LLaMA.cpp setup `types.ts:338-377`
- **llm** — Represents the LLM setup section `types.ts:73-109`
- **llmModels** — Represents a list of LLM models `types.ts:114-128`
- **loading_model** — Represents the state of loading a model `types.ts:370-370`
- **manual_start** — Indicates manual start `types.ts:308-308`
- **manual_start** — Represents the manual start option `types.ts:375-375`
- **model** — Embedding model selection strings interface `types.ts:57-68`
- **model_converted_no_mediapipe** — Represents the conversion of a model without MediaPipe `types.ts:295-295`
- **model_download_failed** — Indicates that a model download has failed `types.ts:368-368`
- **model_downloaded** — Indicates that a model has been successfully downloaded `types.ts:169-169`
- **model_downloaded** — Represents the model downloaded string `types.ts:367-367`
- **model_downloading** — Represents the downloading of a model `types.ts:167-167`
- **model_exists** — Model exists for the backend `types.ts:363-363`
- **model_exported_mediapipe** — Represents the successful export of a model using MediaPipe `types.ts:279-279`
- **model_failed** — Denotes that a model download has failed `types.ts:170-170`
- **model_prompt** — Represents a string for prompting the user to select a model `types.ts:106-106`
- **model_size_hint** — Provides a hint about the size of a model `types.ts:168-168`
- **model_title** — Represents the title of a model `types.ts:80-80`
- **multi_device_config** — Configures multi-device setup `types.ts:309-309`
- **name** — Provider name `types.ts:9-9`
- **need_docker_or_ovms** — Indicates that Docker or Ovms is required `types.ts:289-289`
- **no_download_url** — No download URL available for the backend `types.ts:351-351`
- **no_gguf_repo** — No GGUF repository found `types.ts:362-362`
- **no_hf_model** — Indicates that no Hugging Face model is available `types.ts:278-278`
- **no_mediapipe_note** — Indicates that MediaPipe is not available `types.ts:288-288`
- **no_models** — Represents a string indicating no models are available `types.ts:66-66`
- **npu_detected** — Indicates that an NPU (Neural Processing Unit) has been detected `types.ts:251-251`
- **nvidia** — Represents the NVIDIA model `types.ts:216-239`
- **nvidia_igpu_note** — Provides a note about the integrated GPU being available `types.ts:249-249`
- **nvidia_no_igpu** — Indicates that the integrated GPU is not available `types.ts:250-250`
- **nvidia_with_igpu** — Represents a configuration where both NVIDIA GPU and integrated GPU are available `types.ts:248-248`
- **ok** — Indicates a successful status `types.ts:383-383`
- **ollama** — Represents the Ollama provider `types.ts:88-88`
- **ollama** — Represents Ollama setup `types.ts:331-333`
- **ollama_available** — Indicates that Ollama is available `types.ts:182-182`
- **ollama_blackwell** — Represents a provider-specific string for Ollama Blackwell `types.ts:89-89`
- **ollama_cpu_only** — Indicates Ollama is running on CPU only `types.ts:126-126`
- **ollama_install_hint** — Provides a hint for installing Ollama `types.ts:179-179`
- **ollama_install_url** — Contains the URL for installing Ollama `types.ts:180-180`
- **ollama_no_models** — Indicates no models are available for Ollama `types.ts:127-127`
- **ollama_not_found** — Indicates that Ollama is not found `types.ts:178-178`
- **ollama_open_download** — Opens the download for Ollama `types.ts:181-181`
- **ollama_service_running** — Signifies that the Ollama service is running `types.ts:184-184`
- **ollama_service_starting** — Denotes that the Ollama service is starting `types.ts:183-183`
- **ollama_vram_available** — Indicates the available VRAM for Ollama `types.ts:125-125`
- **openai_compat** — Represents a provider-specific string for OpenAI compatibility `types.ts:96-96`
- **openai_title** — Represents a title for a provider selection step `types.ts:103-103`
- **option_en** — English option `types.ts:34-34`
- **option_en_hint** — English option hint `types.ts:35-35`
- **option_multi** — Multi-option `types.ts:36-36`
- **option_multi_hint** — Multi-option hint `types.ts:37-37`
- **option_no** — Represents the "no" option for a question `types.ts:78-78`
- **option_yes** — Represents the "yes" option for a question `types.ts:77-77`
- **ovms** — Ovms provider strings `types.ts:51-51`
- **ovms** — Represents the Open Virtual Machine Manager `types.ts:244-311`
- **ovms_config_created** — Represents the creation of an Ovms configuration `types.ts:284-284`
- **platform_not_supported** — Indicates that the current platform is not supported `types.ts:253-253`
- **preparing_model** — Represents the preparation of a model for export `types.ts:277-277`
- **preparing_model** — Preparing the model for the backend `types.ts:361-361`
- **preparing_model_dir** — Represents the preparation of the model directory `types.ts:263-263`
- **proceeding_existing** — Proceeding with the existing setup `types.ts:349-349`
- **prompt_choice** — Represents a prompt for a choice `types.ts:393-393`
- **pros** — Provider advantages `types.ts:10-10`
- **provider** — Embedding provider selection strings interface `types.ts:43-52`
- **provider_title** — Represents the title of a provider `types.ts:79-79`
- **pull_failed** — Indicates that pulling an image has failed `types.ts:166-166`
- **pull_progress** — Tracks the progress of pulling an image `types.ts:165-165`
- **pull_time_hint** — Provides a hint for pull time `types.ts:321-321`
- **pulling_image** — Indicates the process of pulling an image `types.ts:164-164`
- **recommended** — Recommended provider `types.ts:45-45`
- **recommended** — Indicates a recommended option or setting `types.ts:59-59`
- **reinstalling** — Reinstalling the backend `types.ts:350-350`
- **rest_api** — Defines REST API endpoints `types.ts:302-302`
- **round_robin_hint** — Provides a round-robin hint `types.ts:310-310`
- **section_512** — Represents a section or string related to 512 tokens `types.ts:61-61`
- **section_8k** — Represents a section or string related to 8k tokens `types.ts:62-62`
- **section_8k_hint** — Represents a hint message related to 8k tokens `types.ts:64-64`
- **section_8k_warning** — Represents a warning message related to 8k tokens `types.ts:63-63`
- **selected** — Selected provider `types.ts:46-46`
- **selected** — Indicates the selected option or setting `types.ts:65-65`
- **selected_model** — Represents the selected model `types.ts:83-83`
- **selected_provider** — Represents the selected provider `types.ts:82-82`
- **server_endpoint** — Represents the endpoint of a server `types.ts:174-174`
- **server_ready** — Signifies that a server is ready `types.ts:173-173`
- **server_ready** — Marks server as ready `types.ts:325-325`
- **server_started** — Indicates that the server has started `types.ts:268-268`
- **server_starting** — Indicates that a server is starting `types.ts:172-172`
- **setup** — Represents the setup process `types.ts:245-245`
- **setup** — Defines setup command strings `types.ts:317-317`
- **setup** — Type definitions for setup command i18n strings `types.ts:332-332`
- **setup** — Represents the setup string `types.ts:339-339`
- **setup_complete** — Indicates that the setup is complete `types.ts:270-270`
- **setup_complete** — Indicates that the setup process is complete `types.ts:373-373`
- **setup_complete_full** — Marks the completion of a full setup `types.ts:301-301`
- **size_mb** — Represents the size of the model in megabytes `types.ts:272-272`
- **size_mb** — Indicates the size of the model in megabytes `types.ts:366-366`
- **skip** — Represents a string indicating to skip a step `types.ts:67-67`
- **skip** — Represents a string for skipping a step in the setup process `types.ts:90-90`
- **skip** — Indicates a skip value `types.ts:97-97`
- **skipped** — Represents a string indicating a skipped step `types.ts:81-81`
- **source** — Represents the source of the model `types.ts:281-281`
- **starting_service** — Represents the starting of a service `types.ts:266-266`
- **startup_script_created** — Indicates the creation of a startup script `types.ts:300-300`
- **status** — Represents the current status of the setup process `types.ts:382-387`
- **subtitle** — Banner subtitle `types.ts:23-23`
- **target** — Specifies the target for setup `types.ts:304-304`
- **tei** — TEI provider strings `types.ts:48-48`
- **tei** — Represents a provider-specific string for TEI `types.ts:316-326`
- **tei_blackwell** — TEI Blackwell provider string `types.ts:49-49`
- **test_passed** — Indicates that a test has passed `types.ts:371-371`
- **test_timeout** — Indicates that a test has timed out `types.ts:372-372`
- **testing_startup** — Represents the state of testing the startup process `types.ts:369-369`
- **tgi** — Represents the TGI provider `types.ts:87-87`
- **tgi_no_models** — Indicates no models are available for TGI `types.ts:124-124`
- **tgi_vram_available** — Indicates the available VRAM for TGI `types.ts:123-123`
- **title** — Banner title `types.ts:22-22`
- **title** — Represents the title of a section or string `types.ts:26-26`
- **title** — Represents a title string `types.ts:33-33`
- **title** — Represents the title of a model `types.ts:44-44`
- **title** — Represents the title of a document `types.ts:58-58`
- **title** — Represents the title of a document or item `types.ts:74-74`, `types.ts:134-134`
- **toolkit_not_configured** — Indicates that the toolkit is not properly configured `types.ts:219-219`
- **toolkit_now_works** — States that the toolkit is now working `types.ts:232-232`
- **toolkit_works** — Represents the state where the toolkit is functioning correctly `types.ts:218-218`
- **troubleshoot_hints** — Provides hints for troubleshooting `types.ts:234-234`
- **unsupported_platform** — Not applicable for the current platform `types.ts:340-340`
- **use_alternative** — Suggests using an alternative method or configuration `types.ts:254-254`
- **v2_api_only** — Represents a setup command for API only `types.ts:299-299`
- **v3_api_available** — Indicates that the v3 API is available `types.ts:298-298`
- **vulkan_backend** — Backend for Vulkan `types.ts:343-343`
- **waiting_init** — Indicates waiting for initialization `types.ts:324-324`
- **waiting_response** — Indicates that a response is being awaited `types.ts:267-267`
- **warn** — Represents a warning status `types.ts:385-385`
- **wsl_check** — Checks the status of WSL `types.ts:225-225`
- **wsl_configure_hint** — Offers a hint for configuring WSL `types.ts:228-228`
- **wsl_configured** — Confirms that WSL is configured `types.ts:227-227`
- **wsl_requirements** — Lists the requirements for WSL `types.ts:226-226`
- **yes_default** — Represents a yes choice with a default `types.ts:395-395`
- **yes_no** — Represents a yes/no choice `types.ts:394-394`
- **zig** — Represents a provider-specific string for Zig `types.ts:93-108`

## Data Flow

- **Inputs:** Language code set via `setSetupLanguage()`, key paths like `"provider.title"`, interpolation parameters.
- **Processing:** Dot-separated key path traversal through the translations object, fallback to English if key is missing.
- **Outputs:** Localized strings ready for console output.

## Public API

| Export | Type | Description | Location |
|--------|------|-------------|----------|
| `setSetupLanguage` | function | Sets the current UI language | [`index.ts:24-26`](./index.ts) |
| `getSetupLanguage` | function | Returns the current UI language | [`index.ts:31-33`](./index.ts) |
| `t` | function | Gets a translated string by dot-separated key path | [`index.ts:42-74`](./index.ts) |
| `ti` | function | Gets a translated string with `{param}` interpolation | [`index.ts:83-91`](./index.ts) |
| `ta` | function | Gets a translated string array by key path | [`index.ts:100-128`](./index.ts) |
| `getStrings` | function | Returns the full `SetupStrings` object for current language | [`index.ts:133-135`](./index.ts) |
| `SetupStrings` | interface | Complete type definition for all setup UI strings | [`types.ts:17-397`](./types.ts) |
| `ProviderStrings` | interface | Provider name, pros, and cons strings | [`types.ts:8-12`](./types.ts) |

## Dependencies

### Internal Modules

| Module | Purpose |
|--------|---------|
| `i18n/types` | `UILanguage` type definition |

### External Packages

| Package | Purpose |
|---------|---------|
| (none) | Pure TypeScript with no external dependencies |

## Behavioral Properties

| Property | Value |
|----------|-------|
| Default language | English (`en`) |
| Fallback behavior | Always falls back to English for missing keys |
| Supported languages | `en`, `ru` |

## Error Handling

If a key path is not found in any language, the key path string itself is returned (e.g., `"provider.unknown_key"`), which aids debugging. Array lookups return an empty array for missing keys.

## Known Limitations

- Only English and Russian are currently supported.
- No plural form handling; pluralization must be handled by the caller.
- String interpolation only supports simple `{key}` replacement, not nested expressions.

## Exports

- `setSetupLanguage`
- `getSetupLanguage`
- `t`
- `ti`
- `ta`
- `getStrings`

## Files

| File | Description |
|------|-------------|
| `index.ts` | Translation lookup functions (`t`, `ti`, `ta`) and language management |
| `types.ts` | `SetupStrings` and `ProviderStrings` interface definitions |
| `en.ts` | English translation strings |
| `ru.ts` | Russian translation strings |
