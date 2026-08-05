# Scripts Module

## 🤖 Entity Listing

### Function
- **_buildCUDA** — Asynchronously builds the CUDA native backend, checking for CUDA Toolkit and CMake installations, and executing the build command `postinstall-gpu.js:150-200`
- **_printWarning** — Prints a warning message `postinstall.cjs:100-102`
- **allFilesExist** — Checks if all required files exist in the output directory `build-global-embeddings.ts:68-69`
- **answer** — Prompts the user to confirm whether to reinstall the OVMS native binary `install-ovms-native.ts:332-337`
- **ask_install** — Asks the user to install a package if it is not already installed `user-setup-linux.sh:55-68`
- **ask_install** — Asks the user to install a dependency if it is not already installed `user-setup-macos.sh:55-68`
- **ask_yes_no** — Asks the user a yes/no question with a default answer `build-native-libs-macos.sh:73-90`
- **askSkip** — Asks to skip a step `postinstall.cjs:158-170`
- **askYesNo** — Asks the user a yes/no question and returns the answer `build-faiss-node.js:481-496`
- **askYesNo** — Asks a yes/no question `postinstall.cjs:145-156`
- **asset** — Not present in the provided code `download-native-libs.js:288-288`
- **benchmark** — A function to perform a benchmark test and return a BenchmarkResult `benchmark-runtime.ts:52-79`
- **benchmarkOllama** — Benchmarks the Ollama model for embedding entities `benchmark-large-entities.ts:186-247`
- **benchmarkOpenVINO** — Benchmarks the OpenVINO model for embedding entities `benchmark-large-entities.ts:315-359`
- **benchmarks** — An array of benchmark files parsed from the current directory `compare-benchmarks.ts:34-37`
- **benchmarkTEI** — Benchmarks the TEI model for embedding entities `benchmark-large-entities.ts:249-313`
- **best512** — Tests real code entities from the database that exceed 512 token limit `benchmark-large-entities.ts:546-546`
- **best8K** — Finds the best benchmark result for 8K token models based on total time `benchmark-large-entities.ts:547-547`
- **build_cpu_simd** — Builds CPU SIMD acceleration libraries for all Macs `build-native-libs-macos.sh:608-623`
- **build_metal_backend** — Builds the Metal backend for Apple Silicon, ensuring the Metal Toolchain is available `build-native-libs-macos.sh:267-602`
- **buildMetalBackend** — Builds the Metal backend `postinstall.cjs:172-197`
- **buildNativeAddon** — Builds the native addon for the faiss-node library `build-faiss-node.js:399-431`
- **buildWASM** — Asynchronously builds the WASM SIMD backend, checking for Rust and wasm-pack installations, and executing the build script `postinstall-gpu.js:84-148`
- **bunData** — The benchmark file for Bun `compare-benchmarks.ts:41-41`
- **bunMap** — A map of benchmark results for Bun `compare-benchmarks.ts:57-57`
- **check_cmake** — Checks if CMake is installed and installs it if necessary `build-native-libs-macos.sh:174-202`
- **check_command** — Checks if a command is available in the environment `dev-setup.sh:23-25`
- **check_command** — Checks if a command is available `install-nvidia-container-toolkit.sh:19-21`
- **check_homebrew** — Checks if Homebrew is installed and installs it if necessary `build-native-libs-macos.sh:140-172`
- **check_homebrew** — Checks if Homebrew is installed and installs it if not `user-setup-macos.sh:70-81`
- **check_node** — Checks if Node.js is installed and installs it if necessary `build-native-libs-macos.sh:204-232`
- **check_npm_deps** — Checks if npm dependencies are installed and installs them if necessary `build-native-libs-macos.sh:234-261`
- **check_xcode** — Checks if Xcode Command Line Tools are installed and provides installation instructions if not `build-native-libs-macos.sh:116-138`
- **checkCMake** — Not present in the provided code `build-faiss-node.js:145-153`
- **checkCommand** — Checks if a command is available by running it with version arguments `build-faiss-node.js:78-85`
- **checkCommand** — Checks if a command is available by attempting to run it `postinstall-gpu.js:46-56`
- **checkCudaLibExists** — Checks if CUDA library exists `postinstall.cjs:121-130`
- **checkCUDAToolkit** — Checks if the CUDA Toolkit is installed and returns its version `postinstall-gpu.js:58-82`
- **checkExistingInstallation** — Checks if the OVMS native binary is already installed `install-ovms-native.ts:301-305`
- **checkGit** — Not present in the provided code `build-faiss-node.js:135-143`
- **checkMetalLibExists** — Checks if Metal library exists `postinstall.cjs:116-119`
- **checkNodeGyp** — Not present in the provided code `build-faiss-node.js:192-200`
- **checkOpenBLAS** — Not present in the provided code `build-faiss-node.js:213-221`
- **checkPython** — Not present in the provided code `build-faiss-node.js:155-165`
- **checkVcpkg** — Not present in the provided code `build-faiss-node.js:202-211`
- **checkVSBuildTools** — Not present in the provided code `build-faiss-node.js:167-190`
- **cleanupTestData** — Not present in the provided code `benchmark-runtime.ts:143-150`
- **cloneFaissNode** — Clones the faiss-node repository from GitHub `build-faiss-node.js:387-397`
- **command_exists** — Checks if a command exists in the system `user-setup-linux.sh:45-47`, `user-setup-macos.sh:45-47`
- **compute_hash** — Computes the hash of the source files `build-roslyn.sh:27-31`
- **convert_model** — Converts a Jina model to OpenVINO IR format using the optimum-cli tool `convert-jina-models.sh:12-40`
- **convertModel** — Not present in the provided code `convert-tokenizer-simple.ts:167-275`
- **createStartupScript** — Creates a startup script for the OVMS native binary to run on the specified platform `install-ovms-native.ts:216-263`
- **createSystemdService** — Creates a systemd user service for the OVMS native binary on Linux `install-ovms-native.ts:268-296`
- **createTtyReadline** — Creates a readline interface for terminal input `postinstall.cjs:136-143`
- **detect_mac_type** — Detects the architecture of the Mac and prints relevant information `build-native-libs-macos.sh:92-114`
- **detect_package_manager** — Detects the package manager being used on the system `user-setup-linux.sh:70-86`
- **detectPlatformInfo** — Detects platform information `postinstall.cjs:237-254`
- **downloadAndExtract** — Not present in the provided code `download-native-libs.js:204-252`
- **downloadFile** — Not present in the provided code `build-faiss-node.js:91-129`
- **downloadFile** — Downloads a file from HuggingFace Hub `convert-tokenizer-simple.ts:62-94`
- **downloadFile** — Downloads a file from a given URL and saves it to a specified destination `download-comm-binary.js:29-60`
- **downloadFile** — Parses a URL and downloads the file to a specified destination path, handling redirects and errors `download-native-libs.js:164-199`
- **downloadFile** — Asynchronously downloads a file from a given URL to a specified destination path `download-openvino-model.ts:67-85`
- **downloadFile** — Downloads the OVMS native binary from the specified URL to a temporary location `install-ovms-native.ts:119-168`
- **downloadModel** — Not explicitly defined in the provided code `download-openvino-model.ts:87-139`
- **ensureDir** — Ensures a directory exists, creating it if necessary `convert-tokenizer-simple.ts:53-57`
- **err** — Outputs an error message in red `build-ovms-nvidia.sh:47-47`
- **err** — Outputs an error message with a red color `setup-ovms-nvidia.sh:21-21`
- **err** — Outputs an error message with a red ANSI color `setup-tome-tools.sh:21-21`
- **estimateTokens** — Estimate tokens based on the number of lines in the content `benchmark-large-entities.ts:43-46`
- **exec** — Executes a command and returns the result or null if it fails `build-faiss-node.js:59-76`
- **execCommand** — Executes a command and returns true if successful, false otherwise `postinstall-gpu.js:32-44`
- **extractArchive** — Extracts the downloaded OVMS native binary archive to the specified destination directory `install-ovms-native.ts:173-211`
- **fastest512** — Finds the fastest benchmark result for 512 token models `benchmark-large-entities.ts:524-524`
- **fastest8K** — Finds the fastest benchmark result for 8K token models `benchmark-large-entities.ts:535-535`
- **fetchJson** — Not present in the provided code `download-native-libs.js:126-159`
- **files** — An array of benchmark files found in the current directory `compare-benchmarks.ts:25-25`
- **find_mcp_processes** — Finds processes related to ultracode `restart-mcp-server.sh:69-78`
- **findAsset** — Not present in the provided code `download-native-libs.js:276-293`
- **formatResult** — Not present in the provided code `benchmark-runtime.ts:81-89`
- **generateTokenizerJson** — Not present in the provided code `convert-tokenizer-simple.ts:99-133`
- **get_version** — Retrieves the version of a command `user-setup-linux.sh:49-53`, `user-setup-macos.sh:49-53`
- **getDataDir** — Get the storage directory based on the operating system `benchmark-large-entities.ts:49-62`
- **getDownloadUrl** — Determines the URL and filename for downloading the OVMS native binary based on the platform `install-ovms-native.ts:91-114`
- **getLatestRelease** — Not present in the provided code `download-native-libs.js:257-271`
- **getLibraryInfo** — Returns platform-specific library information `download-native-libs.js:65-121`
- **getModelsDir** — Returns the directory for models based on the operating system `install-ovms-native.ts:77-86`
- **getOVMSDir** — Returns the directory for OVMS installation based on the operating system `install-ovms-native.ts:63-72`
- **getTtyStdio** — Gets terminal standard input/output `postinstall.cjs:320-328`
- **handleAppleSilicon** — Handles Apple Silicon-specific logic `postinstall.cjs:199-235`
- **hasModel** — Checks if the specified model is available in Ollama `benchmark-large-entities.ts:195-195`
- **install_brew_dep** — A function to check and install Homebrew dependencies `build-faiss-cpu.sh:73-81`
- **install_package** — Installs a package using the detected package manager `user-setup-linux.sh:88-126`
- **install_with_brew** — Installs a package using Homebrew `user-setup-macos.sh:83-93`
- **install_with_brew_cask** — Installs a package using Homebrew Cask `user-setup-macos.sh:95-105`
- **installCMake** — Not present in the provided code `build-faiss-node.js:234-260`
- **installGit** — Not present in the provided code `build-faiss-node.js:227-232`
- **installNodeGyp** — Not present in the provided code `build-faiss-node.js:323-327`
- **installOpenBLAS** — Not present in the provided code `build-faiss-node.js:350-381`
- **installPython** — Not present in the provided code `build-faiss-node.js:262-286`
- **installToExternalLibs** — Installs the built faiss-node binary to the external-libs directory `build-faiss-node.js:433-456`
- **installVcpkg** — Not present in the provided code `build-faiss-node.js:329-348`
- **installVSBuildTools** — Not present in the provided code `build-faiss-node.js:288-321`
- **isAppleSilicon** — Checks if the system is Apple Silicon `postinstall.cjs:108-110`
- **isIntelMac** — Checks if the system is Intel Mac `postinstall.cjs:112-114`
- **isServerReachable** — Checks if a server is reachable by attempting to fetch health or info endpoints `build-global-embeddings.ts:36-48`
- **jsonData** — Not present in the provided code `benchmark-runtime.ts:121-125`
- **kill_processes** — Not fully described in the excerpt `restart-mcp-server.sh:99-135`
- **libraryExists** — Not present in the provided code `download-native-libs.js:298-303`
- **listModels** — Not explicitly defined in the provided code `download-openvino-model.ts:141-151`
- **loadLargeEntities** — Load large entities from the database that exceed 512 tokens `benchmark-large-entities.ts:65-162`
- **log** — Logs a message with a timestamp `build-faiss-node.js:44-47`
- **log** — Logs messages with specified levels `convert-tokenizer-simple.ts:42-51`
- **log** — Logs a message with optional color formatting `dev-setup.sh:19-21`
- **log** — Logs messages to the console with a prefix `download-comm-binary.js:25-27`
- **log** — Outputs a log message with optional color formatting `install-nvidia-container-toolkit.sh:15-17`
- **log** — Logs a message with an optional color `postinstall-gpu.js:28-30`
- **log** — Logs messages to the terminal or stderr `postinstall.cjs:55-63`
- **logSection** — Logs a section header with a separator `build-faiss-node.js:49-53`
- **main** — Asynchronously runs the benchmark for large entities, logging statistics and benchmark results `benchmark-large-entities.ts:361-586`
- **main** — The main function that runs the benchmark suite `benchmark-runtime.ts:727-786`
- **main** — The main function that orchestrates the build process `build-faiss-node.js:502-575`
- **main** — The main function that orchestrates the build process for global embeddings `build-global-embeddings.ts:50-223`
- **main** — Not present in the provided code `convert-tokenizer-simple.ts:281-319`
- **main** — Main function that orchestrates the download and setup of the ultracode.com binary `download-comm-binary.js:62-99`
- **main** — Skips native library download in CI environments and when disabled, checks for existing libraries, and downloads or extracts them if necessary `download-native-libs.js:352-432`
- **main** — Not explicitly defined in the provided code `download-openvino-model.ts:153-170`
- **main** — Main function to handle the installation process of the OVMS native binary `install-ovms-native.ts:310-464`
- **main** — Asynchronously runs the main function to configure GPU backends, attempting to build the WASM backend and skipping the CUDA build during installation `postinstall-gpu.js:202-261`
- **main** — Main function to execute the post-install script `postinstall.cjs:256-313`
- **main** — Main function of the script `restart-mcp-server.sh:175-217`
- **maxTokensEntity** — Finds the entity with the maximum estimated tokens `benchmark-large-entities.ts:379-380`
- **modelToSlug** — Converts a model name to a slug by replacing slashes with underscores `build-global-embeddings.ts:32-34`
- **nodeData** — The benchmark file for Node.js `compare-benchmarks.ts:40-40`
- **nodeMap** — A map of benchmark results for Node.js `compare-benchmarks.ts:56-56`
- **normalizedTexts** — Normalizes the texts by trimming and lowercasing each text `build-global-embeddings.ts:151-151`
- **ok** — Outputs a success message with a green color `setup-ovms-nvidia.sh:20-20`
- **ok** — Outputs a success message with a green ANSI color `setup-tome-tools.sh:20-20`
- **prepareChunks** — Prepares chunks of text from entities, ensuring they fit within token limits `benchmark-large-entities.ts:165-184`
- **print_error** — Prints an error message with a red cross prefix `build-native-libs-macos.sh:61-63`
- **print_error** — Prints an error message with the specified text `user-setup-linux.sh:42-42`
- **print_error** — Prints an error message with red color `user-setup-macos.sh:42-42`
- **print_header** — Prints a header with the script name and a separator `build-native-libs-macos.sh:45-51`
- **print_header** — Prints a header for the script `restart-mcp-server.sh:62-67`
- **print_header** — Prints a header message with the UltraCode environment setup title `user-setup-linux.sh:32-38`
- **print_header** — Prints a header message with the UltraCode environment setup `user-setup-macos.sh:32-38`
- **print_info** — Prints an information message with a blue information sign prefix `build-native-libs-macos.sh:69-71`
- **print_info** — Prints an information message with the specified text `user-setup-linux.sh:43-43`
- **print_info** — Prints an informational message with cyan color. `user-setup-macos `user-setup-macos.sh:43-43`
- **print_step** — Prints a step message with a cyan prefix `build-native-libs-macos.sh:53-55`
- **print_success** — Prints a success message with a green checkmark prefix `build-native-libs-macos.sh:57-59`
- **print_success** — Prints a success message with the specified text `user-setup-linux.sh:40-40`
- **print_success** — Prints a success message with green color `user-setup-macos.sh:40-40`
- **print_warning** — Prints a warning message with a yellow warning sign prefix `build-native-libs-macos.sh:65-67`
- **print_warning** — Prints a warning message with the specified text `user-setup-linux.sh:41-41`
- **print_warning** — Prints a warning message with yellow color `user-setup-macos.sh:41-41`
- **printBox** — Prints a box with a title and lines `postinstall.cjs:77-90`
- **printBuildInstructions** — Not present in the provided code `download-native-libs.js:308-347`
- **printError** — Logs an error message with red color `download-native-libs.js:50-52`
- **printError** — Prints a message indicating an error in red `install-ovms-native.ts:56-58`
- **printError** — Prints an error message `postinstall.cjs:104-106`
- **printInfo** — Logs an info message with blue color `download-native-libs.js:58-60`
- **printInfo** — Prints a message indicating information in cyan `install-ovms-native.ts:50-52`
- **printInfo** — Prints an informational message `postinstall.cjs:96-98`
- **printOK** — Prints a message indicating success in green `install-ovms-native.ts:47-49`
- **printStep** — Logs a step message with cyan color `download-native-libs.js:42-44`
- **printSuccess** — Logs a success message with green color `download-native-libs.js:46-48`
- **printSuccess** — Prints a success message `postinstall.cjs:92-94`
- **printTable** — Prints a table of benchmark results, sorted by per-entity time `benchmark-large-entities.ts:480-508`
- **printTable** — Iterates over the sorted benchmark results to print each row in the table `benchmark-large-entities.ts:493-493`
- **printWarn** — Prints a message indicating a warning in yellow `install-ovms-native.ts:53-55`
- **printWarning** — Logs a warning message with yellow color `download-native-libs.js:54-56`
- **provider** — Configures the OpenVINO provider with logging settings `benchmark-large-entities.ts:326-326`
- **provider** — Represents a logger object with methods for logging messages `benchmark-large-entities.ts:326-326`
- **provider** — Represents a logger object with methods for logging messages at different levels `benchmark-large-entities.ts:326-326`
- **provider** — Represents a logger object with methods for logging `benchmark-large-entities.ts:326-326`
- **request** — Not present in the provided code `build-faiss-node.js:96-115`
- **request** — Handles HTTP requests, including redirects, and pipes the response to a writable stream `download-comm-binary.js:33-56`
- **results** — Processes chunks asynchronously to fetch embeddings `benchmark-large-entities.ts:214-222`
- **runCodebaseMetricsBenchmarks** — Measures codebase metrics such as source file count and codebase metrics `benchmark-runtime.ts:445-470`
- **runCryptoBenchmarks** — Benchmarks cryptographic operations `benchmark-runtime.ts:644-679`
- **runDirectoryBenchmarks** — Not present in the provided code `benchmark-runtime.ts:330-375`
- **runFetchBenchmarks** — Benchmarks HTTP fetch operations `benchmark-runtime.ts:681-721`
- **runFileReadBenchmarks** — Not present in the provided code `benchmark-runtime.ts:156-209`
- **runFileWriteBenchmarks** — Not present in the provided code `benchmark-runtime.ts:211-328`
- **runGlobBenchmarks** — Not present in the provided code `benchmark-runtime.ts:377-416`
- **runSetupWizard** — Runs the setup wizard `postinstall.cjs:330-393`
- **runShellBenchmarks** — Executes shell commands and measures their performance `benchmark-runtime.ts:418-443`
- **runSQLiteBenchmarks** — Benchmarks SQLite operations using both bun:sqlite and better-sqlite3 `benchmark-runtime.ts:513-642`
- **runStartupBenchmarks** — Measures the startup time of Node.js and Bun `benchmark-runtime.ts:472-511`
- **separator** — Prints a separator line with bold formatting `dev-setup.sh:27-29`
- **separator** — Prints a separator line `install-nvidia-container-toolkit.sh:23-25`
- **server** — Starts a local server for HTTP fetch benchmarks `benchmark-runtime.ts:688-691`
- **setupTestData** — Not present in the provided code `benchmark-runtime.ts:98-141`
- **show_help** — Displays help message for the script `restart-mcp-server.sh:32-60`
- **show_process_info** — Not fully described in the excerpt `restart-mcp-server.sh:80-97`
- **show_restart_instructions** — Not fully described in the excerpt `restart-mcp-server.sh:137-169`
- **sleep** — Pauses the execution for a specified duration `build-faiss-node.js:477-479`
- **step** — Outputs a step message in cyan `build-ovms-nvidia.sh:44-44`
- **success** — Outputs a success message in green `build-ovms-nvidia.sh:45-45`
- **teiInfo** — Handles the response from a fetch request, parsing JSON or returning null on error `benchmark-large-entities.ts:455-455`
- **teiInfo** — Handles errors by returning null `benchmark-large-entities.ts:456-456`
- **testBuiltAddon** — Tests the built faiss-node binary `build-faiss-node.js:458-471`
- **texts** — Maps batch entries to their embedding text or text if embedding text is missing `build-global-embeddings.ts:150-150`
- **totalMs** — The total time taken for the benchmark test in milliseconds `benchmark-runtime.ts:72-72`
- **totalTokens** — Calculates the total estimated tokens of all entities `benchmark-large-entities.ts:377-377`
- **txInsert** — Inserts a transaction into the items table `benchmark-runtime.ts:620-624`
- **uniqueEntries** — Filters entries to ensure each key is unique by trimming and lowercasing the text `build-global-embeddings.ts:135-140`
- **verifyTokenizerJson** — Not present in the provided code `convert-tokenizer-simple.ts:138-161`
- **warn** — Outputs a warning message in yellow `build-ovms-nvidia.sh:46-46`
- **warn** — Outputs a warning message with a yellow color `setup-ovms-nvidia.sh:22-22`
- **warn** — Outputs a warning message with a yellow ANSI color `setup-tome-tools.sh:22-22`

### Interface
- **BenchmarkFile** — Contains benchmark results for a specific runtime and version `compare-benchmarks.ts:15-21`
- **BenchmarkResult** — Stores benchmark results for embedding providers on large entities `benchmark-large-entities.ts:27-40`
- **BenchmarkResult** — Represents the result of a benchmark test with various performance metrics `benchmark-runtime.ts:42-50`
- **BenchmarkResult** — Represents the average time and operations per second for a benchmark `compare-benchmarks.ts:9-13`
- **LargeEntity** — Represents a large code entity with properties like id, name, type, filePath, content, lines, and estimatedTokens `benchmark-large-entities.ts:17-25`
- **ModelConfig** — Represents a configuration for downloading an OpenVINO model from HuggingFace `download-openvino-model.ts:13-18`

### Variable
- **ARCH** — Determines the architecture of the current machine `build-comm.sh:28-28`
- **ARCH** — The architecture of the current machine `build-faiss-cpu.sh:20-20`
- **ARCH** — Detects the architecture of the system (Apple Silicon or Intel) `build-faiss-macos.sh:13-13`
- **arch_name** — Not present in the provided code `setup-tei.sh:106-106`
- **architecture** — Specifies the model architecture for HuggingFace TEI `setup-tei.sh:12-12`
- **AUTO_INSTALL** — A boolean flag indicating whether auto-installation is enabled `user-setup-linux.sh:27-27`
- **AUTO_INSTALL** — A boolean flag indicating whether to auto-install dependencies `user-setup-macos.sh:27-27`
- **base_image** — Sets the base Docker image for TEI `setup-tei.sh:50-50`
- **bash_version** — Represents the command to check Bash version `user-setup-linux.sh:267-267`
- **BINARIES** — Represents the binaries generated during the build `build-ovms-nvidia.sh:570-570`
- **BLUE** — Represents the ANSI color code for blue `build-native-libs-macos.sh:34-34`
- **BLUE** — Color for blue output `restart-mcp-server.sh:20-20`
- **BOLD** — Represents the ANSI color code for bold text `build-native-libs-macos.sh:36-36`
- **BUILD_CACHE** — Specifies the directory for caching build artifacts `build-faiss-wsl.sh:9-9`
- **BUILD_DIR** — The directory for building the FAISS CPU addon `build-faiss-cpu.sh:17-17`
- **BUILD_DIR** — Defines the directory for building Faiss `build-faiss-macos.sh:107-107`
- **BUILD_DIR** — Represents the directory where the build process is executed `build-ovms-nvidia.sh:506-506`
- **BUILD_DIR** — Sets the build directory for model server `setup-ovms-nvidia.sh:181-181`
- **BUILD_TYPE** — Stores the build type (Release or Debug) `build-ovms-nvidia.sh:53-53`
- **BUILT_ADDON** — Assigns the path to the built addon to the variable BUILT_ADDON `build-faiss-wsl.sh:105-105`
- **BUILT_FILE** — Defines the path to the built file for the ultracode_faiss node `build-faiss-cpu.sh:122-122`
- **BUN_VERSION** — Shows the version of Bun being used `build.sh:58-58`
- **CLEAN** — A flag indicating whether to clean the previous build `build-linux-wsl.sh:20-20`
- **CLEAN_BUILD** — Indicates whether to clean the existing build directory `build-ovms-nvidia.sh:56-56`
- **CMAKE_ARGS** — Stores the arguments passed to CMake for the build process `build-ovms-nvidia.sh:520-524`
- **CMAKE_DEFINES** — Stores additional CMake definitions `build-linux-wsl.sh:24-24`
- **CMAKE_VERSION** — Stores the version of CMake used `build-ovms-nvidia.sh:130-130`
- **COLORS_BLUE** — Applies blue color to the terminal `dev-setup.sh:15-15`
- **COLORS_BLUE** — Applies blue text color `install-nvidia-container-toolkit.sh:11-11`
- **COLORS_BOLD** — Applies bold formatting to the terminal `dev-setup.sh:12-12`
- **COLORS_BOLD** — Applies bold text formatting `install-nvidia-container-toolkit.sh:8-8`
- **COLORS_GRAY** — Applies gray color to the terminal `dev-setup.sh:17-17`
- **COLORS_GRAY** — Applies gray text color `install-nvidia-container-toolkit.sh:13-13`
- **COLORS_GREEN** — Applies green color to the terminal `dev-setup.sh:13-13`
- **COLORS_GREEN** — Applies green text color `install-nvidia-container-toolkit.sh:9-9`
- **COLORS_RED** — Applies red color to the terminal `dev-setup.sh:16-16`
- **COLORS_RED** — Applies red text color `install-nvidia-container-toolkit.sh:12-12`
- **COLORS_RESET** — Resets the terminal color `dev-setup.sh:11-11`
- **COLORS_RESET** — Resets text color `install-nvidia-container-toolkit.sh:7-7`
- **COLORS_YELLOW** — Applies yellow color to the terminal `dev-setup.sh:14-14`
- **COLORS_YELLOW** — Applies yellow text color `install-nvidia-container-toolkit.sh:10-10`
- **COMM_OUT** — Assigns the path to the output file for communication `build.sh:135-135`
- **COMM_SRC** — Assigns the path to the communication source file `build.sh:134-134`
- **container_name** — Sets the name of the Docker container `setup-tei.sh:47-47`
- **COPIED_COUNT** — Represents the count of files copied during the build `build-ovms-nvidia.sh:571-571`
- **COSMO_SRC** — Specifies the source file for the Cosmopolitan binary `build-comm.sh:20-20`
- **COSMOCC** — Initializes the variable COSMOCC to an empty string `build.sh:138-138`
- **CUDA_BUILT** — Initializes the variable CUDA_BUILT to false `build.sh:295-295`
- **CUDA_DIR** — Stores the path to the CUDA Toolkit directory `build-ovms-nvidia.sh:51-51`
- **CUDA_DIR** — Initializes the CUDA directory path `setup-ovms-nvidia.sh:132-132`
- **CUDA_SRC** — Stores the path to the CUDA source directory `build-linux-wsl.sh:16-16`
- **CURRENT_HASH** — Stores the current hash of the source files `build-roslyn.sh:33-33`
- **CYAN** — Represents the ANSI color code for cyan `build-native-libs-macos.sh:35-35`
- **CYAN** — Represents the color cyan in ANSI escape codes `build-ovms-nvidia.sh:40-40`
- **CYAN** — Represents cyan color in ANSI escape codes `setup-ovms-nvidia.sh:17-17`
- **CYAN** — Defines the color for cyan output `setup-tei.sh:38-38`
- **CYAN** — Represents the ANSI escape code for cyan color `user-setup-linux.sh:23-23`
- **CYAN** — Defines the ANSI escape code for cyan text `user-setup-macos.sh:23-23`
- **DLL_FILE** — Sets the file where the compiled DLL will be saved `build-roslyn.sh:12-12`
- **docker_cmd** — Not present in the provided code `setup-tei.sh:235-235`
- **docker_cmd** — Appends port mapping, volume mapping, and restart policy to the Docker command `setup-tei.sh:244-244`
- **docker_cmd** — Sets the maximum number of concurrent requests to 256 `setup-tei.sh:256-256`
- **docker_cmd** — Sets the maximum number of batch tokens to 16384 `setup-tei.sh:257-257`
- **docker_cmd** — Sets the maximum number of batch requests to 64 `setup-tei.sh:258-258`
- **docker_cmd** — Sets the maximum client batch size to 256 `setup-tei.sh:259-259`
- **docker_cmd** — Sets the tokenization workers to 4 `setup-tei.sh:260-260`
- **docker_cmd** — Enables auto-truncation `setup-tei.sh:261-261`
- **dtype** — Specifies the data type for the model `setup-tei.sh:13-13`
- **ENABLE_NVIDIA** — Enables NVIDIA GPU support in the build `build-ovms-nvidia.sh:185-185`
- **ENABLE_NVIDIA** — Sets the NVIDIA support flag to OFF `setup-ovms-nvidia.sh:133-133`
- **ENABLE_TOME** — Enables Token Merging (ToMe) optimization tools `build-ovms-nvidia.sh:254-254`
- **FAISS_CPU** — A flag indicating whether to enable native FAISS CPU `build-linux-wsl.sh:21-21`
- **FAISS_GPU** — A flag indicating whether to enable FAISS GPU `build-linux-wsl.sh:22-22`
- **FAISS_LIB_DIR** — Stores the path to the FAISS GPU library directory `build-linux-wsl.sh:18-18`
- **FAISS_PREFIX** — Sets the prefix for the FAISS library using Homebrew `build-faiss-cpu.sh:106-106`
- **FORCE** — Sets a flag to force a rebuild `build-roslyn.sh:13-13`
- **FORCE_MODE** — Boolean flag indicating force mode `restart-mcp-server.sh:24-24`
- **GPU_NAME** — Stores the name of the detected NVIDIA GPU `install-nvidia-container-toolkit.sh:54-54`
- **GREEN** — Represents the ANSI color code for green `build-native-libs-macos.sh:32-32`
- **GREEN** — Represents the color green in ANSI escape codes `build-ovms-nvidia.sh:38-38`
- **GREEN** — Color for green output `restart-mcp-server.sh:18-18`
- **GREEN** — Represents green color in ANSI escape codes `setup-ovms-nvidia.sh:15-15`
- **GREEN** — Defines the color for green output `setup-tei.sh:36-36`
- **GREEN** — Defines a green ANSI color code `setup-tome-tools.sh:16-16`
- **GREEN** — Represents the ANSI escape code for green color `user-setup-linux.sh:21-21`
- **GREEN** — Defines the ANSI escape code for green text `user-setup-macos.sh:21-21`
- **HAS_PYTHON** — Indicates whether Python is available `build-ovms-nvidia.sh:148-148`
- **HASH_FILE** — Sets the file to store the hash of the source files `build-roslyn.sh:11-11`
- **image_tag** — Not present in the provided code `setup-tei.sh:107-107`
- **INSTALL_DIR** — Stores the target installation directory for OVMS `build-ovms-nvidia.sh:59-59`
- **INSTALL_DIR** — Sets the installation directory for OVMS `setup-ovms-nvidia.sh:33-33`
- **INSTALL_DIR** — Stores the directory path for ToMe tools installation `setup-tome-tools.sh:33-33`
- **JINA_CODE_RESULT** — Stores the result of converting the Jina Code V2 model `convert-jina-models.sh:46-46`
- **JINA_V3_RESULT** — Stores the result of converting the Jina V3 model `convert-jina-models.sh:52-52`
- **MAGENTA** — Represents the color magenta in ANSI escape codes `build-ovms-nvidia.sh:41-41`
- **MAGENTA** — Represents the ANSI escape code for magenta color `user-setup-linux.sh:24-24`
- **MAGENTA** — Represents the ANSI color code for magenta `user-setup-macos.sh:24-24`
- **max_wait** — Not present in the provided code `setup-tei.sh:274-274`
- **METAL_SRC_DIR** — Stores the directory path for Metal source files `build-native-libs-macos.sh:43-43`
- **missing** — Represents a missing package or dependency `user-setup-linux.sh:281-281`
- **missing** — Represents a missing dependency `user-setup-macos.sh:262-262`
- **model** — Sets the model to use for HuggingFace TEI `setup-tei.sh:48-48`
- **MODEL_ID** — The ID of the Jina Embeddings V2 Base Code model `convert-jina-code.sh:4-4`
- **model_id** — Specifies the model ID for HuggingFace TEI `setup-tei.sh:11-11`
- **MODEL_NAME** — The name of the Jina Embeddings V2 Base Code model `convert-jina-code.sh:5-5`
- **MODELS_DIR** — Specifies the directory where Jina models are stored `convert-jina-models.sh:5-5`
- **MODELS_DIR** — Stores the directory path for model files `setup-tome-tools.sh:34-34`
- **NATIVE_SRC** — Specifies the source file for the native platform binary `build-comm.sh:19-19`
- **NC** — Represents the ANSI color code for no color `build-native-libs-macos.sh:37-37`
- **NC** — Represents the no color in ANSI escape codes `build-ovms-nvidia.sh:42-42`
- **NC** — No color `restart-mcp-server.sh:21-21`
- **NC** — Represents no color in ANSI escape codes `setup-ovms-nvidia.sh:18-18`
- **NC** — Defines the color for no color output `setup-tei.sh:39-39`
- **NC** — Defines a normal color code `setup-tome-tools.sh:18-18`
- **NC** — Represents the ANSI escape code for no color `user-setup-linux.sh:25-25`
- **NC** — Defines the ANSI escape code to reset text color `user-setup-macos.sh:25-25`
- **NO_CUDA** — A flag indicating whether to build without CUDA `build-linux-wsl.sh:23-23`
- **NODE_ABI** — Gets the ABI version of Node.js `build-faiss-wsl.sh:34-34`
- **node_count** — Counts the number of .node files in the dist directory `build.sh:345-345`
- **NODE_VERSION** — Checks the installed Node.js version and ensures it is at least version 24 `build-faiss-macos.sh:73-73`
- **NODE_VERSION** — Retrieves the version of Node.js installed `build-faiss-wsl.sh:33-33`
- **NODE_VERSION** — Stores the version of Node.js installed `dev-setup.sh:43-43`
- **NPROC** — Represents the number of processors to use during the build `build-ovms-nvidia.sh:553-553`
- **NPROC** — Determines the number of processors for parallel tasks `setup-ovms-nvidia.sh:197-197`
- **OMP_PREFIX** — Sets the prefix for the OpenMP library using Homebrew `build-faiss-cpu.sh:107-107`
- **OPENBLAS_PREFIX** — Sets the prefix path for OpenBLAS using Homebrew `build-faiss-macos.sh:98-98`
- **OPENVINO_DIR** — Stores the path to the OpenVINO installation directory `build-ovms-nvidia.sh:50-50`
- **OPENVINO_ROOT** — Represents the root directory of the OpenVINO installation `build-ovms-nvidia.sh:513-513`
- **optional** — Represents an optional package or dependency `user-setup-linux.sh:282-282`
- **optional** — Represents an optional dependency `user-setup-macos.sh:263-263`
- **OS** — Determines the operating system of the current machine `build-comm.sh:27-27`
- **OUTPUT_DIR** — Defines the directory for output files `build-faiss-wsl.sh:10-10`
- **OUTPUT_DIR** — Stores the output directory for the build `build-linux-wsl.sh:17-17`
- **OUTPUT_DIR** — Stores the directory path for output files `build-native-libs-macos.sh:42-42`
- **OUTPUT_DIR** — The directory where the converted OpenVINO model will be saved `convert-jina-code.sh:6-6`
- **OV_DIR** — Initializes the OpenVINO directory path `setup-ovms-nvidia.sh:81-81`
- **OV_INSTALL_DIR** — Sets the installation directory for OpenVINO `setup-ovms-nvidia.sh:82-82`
- **OV_ROOT** — Sets the root directory for OpenVINO based on the directory path `setup-ovms-nvidia.sh:185-185`
- **OVMS_BRANCH** — Stores the branch name for the OVMS repository `build-ovms-nvidia.sh:62-62`
- **OVMS_BRANCH** — Sets the branch for OVMS `setup-ovms-nvidia.sh:36-36`
- **OVMS_REPO_URL** — Stores the URL for the OVMS repository `build-ovms-nvidia.sh:61-61`
- **PACKAGE_NAME** — Name of the package, "ultracode" `restart-mcp-server.sh:25-25`
- **port** — Sets the port for the TEI server `setup-tei.sh:49-49`
- **PREREQS_OK** — Checks if all required tools and dependencies are available `build-native-libs-macos.sh:637-637`
- **PROCESS_PATTERN** — Pattern to search for processes, "ultracode" `restart-mcp-server.sh:26-26`
- **PROJECT_ROOT** — Determines the root directory of the project based on the script's location `_build-linux-wsl-run.sh:31-31`
- **PROJECT_ROOT** — Sets the root directory of the project `build-comm.sh:18-18`, `setup.sh:19-19`
- **PROJECT_ROOT** — The root directory of the project `build-faiss-cpu.sh:16-16`
- **PROJECT_ROOT** — Determines the root directory of the project `build-faiss-wsl.sh:8-8`
- **PROJECT_ROOT** — Stores the root directory of the project `build-linux-wsl.sh:15-15`
- **PROJECT_ROOT** — Sets the PROJECT_ROOT variable to the directory of the current script `build-native-libs-macos.sh:41-41`, `build-roslyn.sh:8-8`
- **PUBLISH_DIR** — Sets the directory where the Roslyn addon will be published `build-roslyn.sh:10-10`
- **PYTHON_CMD** — Stores the command for Python `build-ovms-nvidia.sh:147-147`
- **PYTHON_CMD** — Stores the command for Python 3.9+ installation `setup-tome-tools.sh:42-42`
- **python_cmd** — Represents the command to check Python version `user-setup-linux.sh:153-153`
- **python_cmd** — Initializes a variable to store the Python command `user-setup-macos.sh:132-132`
- **RED** — Represents the ANSI color code for red `build-native-libs-macos.sh:31-31`
- **RED** — Represents the color red in ANSI escape codes `build-ovms-nvidia.sh:37-37`
- **RED** — Color for red output `restart-mcp-server.sh:17-17`
- **RED** — Represents red color in ANSI escape codes `setup-ovms-nvidia.sh:14-14`
- **RED** — Defines the color for red output `setup-tei.sh:35-35`
- **RED** — Defines a red ANSI color code `setup-tome-tools.sh:15-15`
- **RED** — Represents the ANSI escape code for red color `user-setup-linux.sh:20-20`
- **RED** — Defines the ANSI escape code for red text `user-setup-macos.sh:20-20`
- **REPO_DIR** — Represents the directory where the OVMS repository is cloned `build-ovms-nvidia.sh:223-223`
- **REPO_DIR** — Sets the repository directory for model server `setup-ovms-nvidia.sh:167-167`
- **results["Bash"]** — Stores the result of checking Bash version `user-setup-linux.sh:269-269`
- **results["Shell"]** — Represents the shell version result `user-setup-macos.sh:250-250`
- **ROSLYN_BUILT** — Indicates whether the Roslyn C# addon has been built `build.sh:80-80`
- **ROSLYN_DIR** — Sets the directory containing the Roslyn source code `build-roslyn.sh:9-9`
- **SCRIPT_DIR** — Resolves the directory of the current script `_build-linux-wsl-run.sh:30-30`
- **SCRIPT_DIR** — Sets the directory of the current script `build-comm.sh:17-17`, `setup.sh:18-18`
- **SCRIPT_DIR** — The directory of the current script `build-faiss-cpu.sh:15-15`
- **SCRIPT_DIR** — Gets the directory of the current script `build-faiss-wsl.sh:7-7`
- **SCRIPT_DIR** — Stores the directory of the current script `build-linux-wsl.sh:14-14`
- **SCRIPT_DIR** — Stores the directory path of the script file `build-native-libs-macos.sh:40-40`
- **SCRIPT_DIR** — Sets the directory of the script `build-roslyn.sh:7-7`
- **SCRIPT_DIR** — Sets the directory of the script to the current working directory `postinstall.sh:7-7`
- **SETUP_FILE_JS** — Represents the JavaScript file for the setup command `setup.sh:24-24`
- **SETUP_FILE_TS** — Represents the TypeScript file for the setup command `setup.sh:25-25`
- **SKIP_TOME** — Indicates whether to skip installing ToMe tools `build-ovms-nvidia.sh:55-55`
- **SKIP_TOME** — Determines whether ToMe tools are skipped `setup-ovms-nvidia.sh:55-55`
- **TARGET_DIR** — The directory where the built FAISS CPU addon will be placed `build-faiss-cpu.sh:30-30`
- **TARGET_DIR** — Specifies the target directory for Faiss libraries `build-faiss-macos.sh:150-150`
- **TARGET_FILE** — The file path of the built FAISS CPU addon `build-faiss-cpu.sh:31-31`
- **TEMP_BUILD** — Sets the temporary build directory `setup-ovms-nvidia.sh:34-34`
- **TEMP_BUILD_DIR** — Stores the temporary build directory `build-ovms-nvidia.sh:60-60`
- **TOME_DIR** — Represents the directory where the ToMe repository is cloned `build-ovms-nvidia.sh:253-253`
- **TOME_RATIO** — Stores the token merge ratio for ToMe optimization `build-ovms-nvidia.sh:54-54`
- **TOME_RATIO** — Sets the ToMe ratio for embeddings `setup-ovms-nvidia.sh:35-35`
- **TOME_RATIO** — Stores the ToMe ratio for token merging `setup-tome-tools.sh:35-35`
- **TOME_REPO_URL** — Stores the URL for the ToMe repository `build-ovms-nvidia.sh:63-63`
- **use_gpu** — Not present in the provided code `setup-tei.sh:105-105`
- **VCPKG_ROOT** — Stores the path to the vcpkg root directory `build-ovms-nvidia.sh:52-52`
- **VCPKG_ROOT** — Sets the root directory for vcpkg `setup-ovms-nvidia.sh:153-153`
- **VCPKG_TOOLCHAIN** — Specifies the vcpkg toolchain for dependency management `build-ovms-nvidia.sh:211-211`
- **version** — Sets the version of the TEI server `setup-tei.sh:51-51`
- **waited** — The script waits for user input to decide the action to take with an existing container `setup-tei.sh:275-275`
- **WASM_BUILT** — Initializes the variable WASM_BUILT to false `build.sh:189-189`
- **wasm_count** — Counts the number of .wasm files in the dist directory `build.sh:352-352`
- **YELLOW** — Represents the ANSI color code for yellow `build-native-libs-macos.sh:33-33`
- **YELLOW** — Represents the color yellow in ANSI escape codes `build-ovms-nvidia.sh:39-39`
- **YELLOW** — Color for yellow output `restart-mcp-server.sh:19-19`
- **YELLOW** — Represents yellow color in ANSI escape codes `setup-ovms-nvidia.sh:16-16`
- **YELLOW** — Defines the color for yellow output `setup-tei.sh:37-37`
- **YELLOW** — Defines a yellow ANSI color code `setup-tome-tools.sh:17-17`
- **YELLOW** — Represents the ANSI escape code for yellow color `user-setup-linux.sh:22-22`
- **YELLOW** — Defines the ANSI escape code for yellow text `user-setup-macos.sh:22-22`

### Import_decl
- **../src/agents/semantic/provider-config.js** — Imports `../src/agents/semantic/provider-config.js` from `../src/agents/semantic/provider-config.js`. `build-global-embeddings.ts:24-24`
- **../src/semantic/embedding-generator.js** — Imports `../src/semantic/embedding-generator.js` from `../src/semantic/embedding-generator.js`. `build-global-embeddings.ts:25-25`
- **../src/semantic/global-cache/index.js** — Imports `../src/semantic/global-cache/index.js` from `../src/semantic/global-cache/index.js`. `build-global-embeddings.ts:26-26`
- **../src/semantic/smart-chunker.js** — Imports `../src/semantic/smart-chunker.js` from `../src/semantic/smart-chunker.js`. `benchmark-large-entities.ts:12-12`
- **../src/utils/config-paths.js** — Imports `../src/utils/config-paths.js` from `../src/utils/config-paths.js`. `build-global-embeddings.ts:27-27`
- **../src/utils/fast-hash.js** — Imports `../src/utils/fast-hash.js` from `../src/utils/fast-hash.js`. `build-global-embeddings.ts:28-28`
- **../src/utils/file-ops.js** — Imports `../src/utils/file-ops.js`. `benchmark-runtime.ts:25-34`
- **../src/utils/glob.js** — Imports `../src/utils/glob.js` from `../src/utils/glob.js`. `benchmark-runtime.ts:35-35`
- **../src/utils/runtime.js** — Imports `../src/utils/runtime.js` from `../src/utils/runtime.js`. `benchmark-runtime.ts:24-24`
- **../src/utils/shell.js** — Imports `../src/utils/shell.js` from `../src/utils/shell.js`. `benchmark-runtime.ts:36-36`
- **better-sqlite3** — Imports `better-sqlite3` from `better-sqlite3`. `benchmark-large-entities.ts:9-9`
- **fs** — Imports `fs` from `fs`. `benchmark-large-entities.ts:11-11`
- **node:child_process** — Imports `node:child_process` from `node:child_process`. `build-faiss-node.js:17-17`, `install-ovms-native.ts:16-16`, `postinstall-gpu.js:9-9`
- **node:fs** — Imports `node:fs` from `node:fs`. `build-faiss-node.js:18-18`, `build-global-embeddings.ts:21-21`, `compare-benchmarks.ts:6-6`, `convert-tokenizer-simple.ts:16-16`, `download-comm-binary.js:9-9`, `download-native-libs.js:15-15`, `download-openvino-model.ts:8-8`, `postinstall-gpu.js:10-10`
- **node:fs** — Imports `node:fs`. `install-ovms-native.ts:17-27`
- **node:https** — Imports `node:https` from `node:https`. `build-faiss-node.js:19-19`, `download-comm-binary.js:10-10`, `download-native-libs.js:16-16`
- **node:os** — Imports `node:os` from `node:os`. `benchmark-runtime.ts:23-23`, `build-faiss-node.js:20-20`, `download-native-libs.js:17-17`
- **node:path** — Imports `node:path` from `node:path`. `benchmark-runtime.ts:22-22`, `build-faiss-node.js:21-21`, `build-global-embeddings.ts:22-22`, `compare-benchmarks.ts:7-7`, `convert-tokenizer-simple.ts:17-17`, `download-comm-binary.js:11-11`, `download-native-libs.js:18-18`, `download-openvino-model.ts:9-9`, `install-ovms-native.ts:28-28`, `postinstall-gpu.js:11-11`
- **node:perf_hooks** — Imports `node:perf_hooks` from `node:perf_hooks`. `benchmark-runtime.ts:21-21`
- **node:stream/promises** — Imports `node:stream/promises` from `node:stream/promises`. `install-ovms-native.ts:29-29`
- **node:url** — Imports `node:url` from `node:url`. `build-global-embeddings.ts:23-23`, `download-comm-binary.js:12-12`, `download-native-libs.js:19-19`, `postinstall-gpu.js:12-12`
- **node:zlib** — Imports `node:zlib` from `node:zlib`. `download-native-libs.js:20-20`, `install-ovms-native.ts:30-30`
- **path** — Imports `path` from `path`. `benchmark-large-entities.ts:10-10`
- **tar** — Imports `tar` from `tar`. `install-ovms-native.ts:31-31`

### Property
- **avgMs** — The average time per iteration in milliseconds `benchmark-runtime.ts:46-46`
- **avgMs** — The average time in milliseconds for the benchmark `compare-benchmarks.ts:11-11`
- **avgTokensPerChunk** — Average tokens per chunk `benchmark-large-entities.ts:37-37`
- **baseUrl** — Extracts the base URL from the Ollama options or defaults to an empty string `build-global-embeddings.ts:111-111`
- **chunkCount** — Number of chunks processed in the benchmark `benchmark-large-entities.ts:33-33`
- **chunks** — Represents the chunks of text generated from entities `benchmark-large-entities.ts:168-168`
- **content** — Content of the code entity `benchmark-large-entities.ts:22-22`
- **dimensions** — Dimensions of the embedding `benchmark-large-entities.ts:31-31`
- **effectiveTokensPerSec** — Effective tokens processed per second `benchmark-large-entities.ts:39-39`
- **entityCount** — Number of entities processed in the benchmark `benchmark-large-entities.ts:32-32`
- **entityCount** — Represents the count of entities processed `benchmark-large-entities.ts:168-168`
- **estimatedTokens** — Estimated number of tokens in the code entity `benchmark-large-entities.ts:24-24`
- **features** — A record of features enabled in the benchmark file `compare-benchmarks.ts:19-19`
- **filename** — Returns the filename for the OVMS native binary based on the platform `install-ovms-native.ts:91-91`
- **filePath** — File path of the code entity `benchmark-large-entities.ts:21-21`
- **files** — An array of file names for the model `download-openvino-model.ts:16-16`
- **id** — Unique identifier for a code entity `benchmark-large-entities.ts:18-18`
- **iterations** — The number of iterations for the benchmark test `benchmark-runtime.ts:44-44`
- **lines** — Number of lines in the code entity `benchmark-large-entities.ts:23-23`
- **maxMs** — The maximum time taken for any iteration in milliseconds `benchmark-runtime.ts:48-48`
- **maxTokens** — Maximum token limit for the embedding provider `benchmark-large-entities.ts:30-30`
- **minMs** — The minimum time taken for any iteration in milliseconds `benchmark-runtime.ts:47-47`
- **model** — Model used by the embedding provider `benchmark-large-entities.ts:29-29`
- **name** — Name of the code entity `benchmark-large-entities.ts:19-19`
- **name** — The name of the benchmark test `benchmark-runtime.ts:43-43`
- **name** — The name of the benchmark `compare-benchmarks.ts:10-10`
- **name** — The name of the model `download-openvino-model.ts:14-14`
- **opsPerSec** — The number of operations per second based on the average time `benchmark-runtime.ts:49-49`
- **opsPerSec** — The number of operations per second for the benchmark `compare-benchmarks.ts:12-12`
- **perChunkMs** — Time taken per chunk in milliseconds `benchmark-large-entities.ts:36-36`
- **perEntityMs** — Time taken per entity in milliseconds `benchmark-large-entities.ts:35-35`
- **port** — Specifies the port number for the local server `benchmark-runtime.ts:697-697`
- **provider** — Represents a string provider `benchmark-large-entities.ts:28-28`
- **repo** — The repository URL for the model on HuggingFace `download-openvino-model.ts:15-15`
- **results** — An array of benchmark results for the benchmark file `compare-benchmarks.ts:20-20`
- **runtime** — The runtime (Node.js or Bun) for the benchmark file `compare-benchmarks.ts:16-16`
- **subdir** — The subdirectory within the repository where the model files are located `download-openvino-model.ts:17-17`
- **timestamp** — The timestamp of the benchmark file `compare-benchmarks.ts:18-18`
- **totalMs** — Represents the total runtime in milliseconds `benchmark-runtime.ts:45-45`
- **totalTimeMs** — Total time taken for the benchmark in milliseconds `benchmark-large-entities.ts:34-34`
- **totalTokens** — Returns an object containing chunks, entity count, and total tokens `benchmark-large-entities.ts:168-168`
- **totalTokensProcessed** — Total tokens processed in the benchmark `benchmark-large-entities.ts:38-38`
- **type** — Type of the code entity `benchmark-large-entities.ts:20-20`
- **url** — Returns the URL for downloading the OVMS native binary based on the platform `install-ovms-native.ts:91-91`
- **version** — The version of the runtime for the benchmark file `compare-benchmarks.ts:17-17`

### embedded_sql
- **CREATE TABLE IF NOT EXISTS items (id INTEGER PRIMARY KEY, name TEXT, value REAL)** — Creates a table named `items` if it does not exist `benchmark-runtime.ts:526-526`
- **CREATE TABLE IF NOT EXISTS items (id INTEGER PRIMARY KEY, name TEXT, value REAL)** — Creates a table for storing items if it doesn't exist `benchmark-runtime.ts:584-584`
- **DELETE FROM items** — Deletes all rows from the `items` table `benchmark-runtime.ts:527-527`
- **DELETE FROM items** — Deletes all items from the database `benchmark-runtime.ts:544-544`, `benchmark-runtime.ts:585-585`, `benchmark-runtime.ts:602-602`
- **INSERT INTO items (name, value) VALUES (?, ?)** — Prepares an insert statement for the `items` table `benchmark-runtime.ts:530-530`
- **INSERT INTO items (name, value) VALUES (?, ?)** — Prepares an SQL statement to insert new items into the database `benchmark-runtime.ts:588-588`
- **SELECT * FROM items WHERE value > ?** — Prepares a select statement for filtering items by value `benchmark-runtime.ts:550-550`
- **SELECT * FROM items WHERE value > ?** — Prepares an SQL statement to select items with values greater than a specified value `benchmark-runtime.ts:608-608`
- **SELECT COUNT(*) as c FROM entities** — Parses a SQL query to count the number of entities `benchmark-large-entities.ts:89-89`
- **SELECT id, name, type, file_path, location, size_bytes FROM entities WHERE location IS NOT NULL ORDE** — Prepares a SQL query to select specific fields from entities where location is not null, ordered by size_bytes descending, and limited to 500 rows `benchmark-large-entities.ts:111-117`

## Embeddings Setup

**Unified script for all embedding providers:**

```bash
# Linux/macOS
./scripts/setup-embeddings.sh

# Windows
scripts\setup-embeddings.cmd
```

### Features

- **Interactive Mode**: Step-by-step wizard for provider and model selection
- **Auto GPU Detection**: Detects NVIDIA GPUs (RTX 30xx/40xx/50xx)
- **Dependency Installation**: Auto-installs Docker, NVIDIA Container Toolkit, or Ollama
- **Centralized Config**: Models defined in `config/embedding-models.json`

### Supported Providers

| Provider | Description | Requirements |
|----------|-------------|-------------|
| **TEI** | HuggingFace Text Embeddings Inference, GPU acceleration | Docker Desktop |
| **Ollama** | Simple local inference, auto-detects GPU | Ollama binary |
| **Memory** | Hash-based (no ML), instant start | None |

### Non-Interactive Mode

```bash
./scripts/setup-embeddings.sh --provider tei
./scripts/setup-embeddings.sh --provider tei --model granite-embedding-278m
./scripts/setup-embeddings.sh --provider tei --force-cpu
./scripts/setup-embeddings.sh --provider ollama
./scripts/setup-embeddings.sh --provider memory
```

### Available Models

Defined in `config/embedding-models.json`: IBM Granite (125M, 278M, 30M), BGE (Small/Base/Large/M3), E5 (Small/Base/Large), GTE Base, Nomic Embed Text, MxBai Embed Large, and more.

---

## FAISS Native Build

Prebuilt `faiss-node` binaries for npm distribution. Targets Node 24 (ABI v137).

### Quick Start

```bash
# Linux (Docker - recommended)
npm run build:faiss:docker

# Windows (auto-installs vcpkg + OpenBLAS)
npm run build:faiss

# macOS (Apple Silicon or Intel)
npm run build:faiss:macos

# Linux (WSL alternative)
npm run build:faiss:wsl
```

### Output Structure

```
external-libs/
├── faiss-linux-x64/faiss-node.node       (Docker, ~5.5 MB)
├── faiss-win32-x64/faiss-node.node       (vcpkg, ~3.5 MB + DLLs)
├── faiss-darwin-arm64/faiss-node.node    (Homebrew, ~5 MB)
└── faiss-darwin-x64/faiss-node.node      (Homebrew, ~5 MB)
```

Total package: ~34 MB (all platforms) or ~24 MB (Linux + Windows only).

### Windows BLAS Requirement

Windows build requires BLAS/LAPACK (not auto-installed):
1. **Intel MKL** (recommended) — download from Intel oneAPI
2. **OpenBLAS via vcpkg** — `vcpkg install openblas:x64-windows`
3. **Skip Windows** — use Linux binary for production/Docker

### Testing

```bash
node -e "const f=require('./external-libs/faiss-linux-x64/faiss-node.node');console.log('OK')"
```

---

## OVMS Setup

OpenVINO Model Server for embeddings.

### Option 1: Docker (Simplest)

```bash
docker run -d --name ovms -p 8082:8082 \
  -v ~/.local/share/ultracode/ovms/models:/models \
  openvino/model_server:latest \
  --model_path /models/multilingual-e5-base --model_name embeddings --port 8082
```

### Option 2: Native Build

```bash
# Linux
./scripts/setup-ovms-nvidia.sh

# Windows (requires VS2019 toolset v142!)
scripts\setup-ovms-nvidia.cmd
```

**Important:** OVMS on Windows requires Visual Studio 2019 (toolset v142). If you have VS2022/VS2026, install VS2019 Build Tools additionally.

### ToMe (Token Merging) — Optional

1.5-2x speedup with <1% accuracy loss:

```bash
# Windows: scripts\setup-tome-tools.cmd
# Linux: ./scripts/setup-tome-tools.sh
python convert_tome_model.py --model intfloat/multilingual-e5-base --output ./models
```

| Ratio | Speedup | Accuracy Loss |
|-------|---------|--------------|
| 0.0 | 1.0x | 0% |
| 0.3 | ~1.4x | <0.5% |
| 0.5 | ~2.0x | <1% |
| 0.7 | ~3.3x | ~2% |

Recommended for embeddings: ratio=0.3.

### Recommended Models

| Model | Size | Languages | Dimensions |
|-------|------|-----------|-----------|
| multilingual-e5-base | 278M | 100+ | 768 |
| multilingual-e5-small | 118M | 100+ | 384 |
| all-MiniLM-L6-v2 | 23M | EN | 384 |
| bge-m3 | 567M | 100+ | 1024 |

### Configuration

After OVMS setup, configure `semantic-config.json`:

```json
{
  "enabled": true,
  "embedding": {
    "platform": "ovms",
    "ovms": {
      "endpoint": "http://localhost:8082",
      "batch_size": 32,
      "selected_model": "multilingual-e5-base",
      "target_device": "CPU"
    }
  }
}
```

Or run: `npx ultracode setup`

---

## Build Scripts

### CUDA Backend

```bash
npm run build:cuda          # Windows (PowerShell)
npm run build:cuda:debug    # Debug build
npm run build:cuda:clean    # Clean rebuild
```

Requirements: CUDA Toolkit 12.x, cmake-js, node-addon-api.

### Comm Proxy (Cosmopolitan)

```bash
./src/comm/build.ps1        # Build APE binary (~50KB)
```

### Native Libraries

```bash
# Windows
scripts\build-native-libs.ps1

# Linux (WSL)
scripts/build-linux-wsl.sh

# macOS
scripts/build-native-libs-macos.sh
```

### Dawn/WebGPU

```bash
scripts\build-dawn-x64.bat       # Build Dawn addon
scripts\install-dawn-blackwell.bat # Install for Blackwell GPUs
```

---

## Script Reference

| Script | Description |
|--------|-------------|
| `benchmark-large-entities.ts` | Benchmark with large entities |
| `benchmark-runtime.ts` | Node.js vs Bun runtime comparison |
| `download-comm-binary.js` | Download Comm proxy binary |
| `download-native-libs.js` | Download prebuilt native libraries |
| `download-openvino-model.ts` | Download OpenVINO embedding models |
| `postinstall.js` | Post-install: copy native binaries, show welcome |
| `setup-embeddings.*` | Interactive embedding provider setup |
| `setup-ovms-nvidia.*` | OVMS native build with NVIDIA support |
| `setup-tome-tools.*` | Install ToMe conversion tools |
| `build-cuda.*` | Build CUDA native addon |
| `build-native-libs.*` | Build all native libraries |
| `build-roslyn.*` | Build Roslyn addon for C# analysis |
| `dev-setup.*` | Development environment setup |
| `read-logs.ps1` | Log analysis with filtering |
| `pack-npm.ps1` | Build and package for npm |

---

## Troubleshooting

### Docker not found (TEI/OVMS)
Install Docker Desktop and start it.

### GPU not detected
- Verify: `nvidia-smi`
- For WSL2: Enable GPU support in Docker Desktop settings

### OVMS build fails on Windows
OVMS requires VS2019 toolset (v142). Install VS2019 Build Tools or use Docker.

### FAISS build: "Could NOT find BLAS"
Install Intel MKL or use Docker build: `npm run build:faiss:docker`

### Port already in use
Use `--port <number>` or check: `docker ps`

## New (pending description)

- **BenchmarkResult** — `compare-benchmarks.ts:9-13`
- **BenchmarkFile** — `compare-benchmarks.ts:15-21`
- **log** — `build-faiss-node.js:44-47`
- **<anonymous>** — `build-faiss-node.js:44-44`
- **logSection** — `build-faiss-node.js:49-53`
- **<anonymous>** — `build-faiss-node.js:49-49`
- **exec** — `build-faiss-node.js:59-76`
- **<anonymous>** — `build-faiss-node.js:59-59`
- **checkCommand** — `build-faiss-node.js:78-85`
- **<anonymous>** — `build-faiss-node.js:78-78`
- **downloadFile** — `build-faiss-node.js:91-129`
- **<anonymous>** — `build-faiss-node.js:91-91`
- **resolve** — `build-faiss-node.js:94-128`
- **res** — `build-faiss-node.js:96-115`
- **file** — `build-faiss-node.js:111-114`
- **err** — `build-faiss-node.js:117-121`
- **err** — `build-faiss-node.js:123-127`
- **checkGit** — `build-faiss-node.js:135-143`
- **<anonymous>** — `build-faiss-node.js:135-135`
- **checkCMake** — `build-faiss-node.js:145-153`
- **<anonymous>** — `build-faiss-node.js:145-145`
- **checkPython** — `build-faiss-node.js:155-165`
- **<anonymous>** — `build-faiss-node.js:155-155`
- **checkVSBuildTools** — `build-faiss-node.js:167-190`
- **<anonymous>** — `build-faiss-node.js:167-167`
- **checkNodeGyp** — `build-faiss-node.js:192-200`
- **<anonymous>** — `build-faiss-node.js:192-192`
- **checkVcpkg** — `build-faiss-node.js:202-211`
- **<anonymous>** — `build-faiss-node.js:202-202`
- **checkOpenBLAS** — `build-faiss-node.js:213-221`
- **<anonymous>** — `build-faiss-node.js:213-213`
- **installGit** — `build-faiss-node.js:227-232`
- **<anonymous>** — `build-faiss-node.js:227-227`
- **installCMake** — `build-faiss-node.js:234-260`
- **<anonymous>** — `build-faiss-node.js:234-234`
- **installPython** — `build-faiss-node.js:262-286`
- **<anonymous>** — `build-faiss-node.js:262-262`
- **installVSBuildTools** — `build-faiss-node.js:288-321`
- **<anonymous>** — `build-faiss-node.js:288-288`
- **installNodeGyp** — `build-faiss-node.js:323-327`
- **<anonymous>** — `build-faiss-node.js:323-323`
- **installVcpkg** — `build-faiss-node.js:329-348`
- **<anonymous>** — `build-faiss-node.js:329-329`
- **installOpenBLAS** — `build-faiss-node.js:350-381`
- **<anonymous>** — `build-faiss-node.js:350-350`
- **cloneFaissNode** — `build-faiss-node.js:387-397`
- **<anonymous>** — `build-faiss-node.js:387-387`
- **buildNativeAddon** — `build-faiss-node.js:399-431`
- **<anonymous>** — `build-faiss-node.js:399-399`
- **installToExternalLibs** — `build-faiss-node.js:433-456`
- **<anonymous>** — `build-faiss-node.js:433-433`
- **testBuiltAddon** — `build-faiss-node.js:458-471`
- **<anonymous>** — `build-faiss-node.js:458-458`
- **sleep** — `build-faiss-node.js:477-479`
- **<anonymous>** — `build-faiss-node.js:477-477`
- **resolve** — `build-faiss-node.js:478-478`
- **askYesNo** — `build-faiss-node.js:481-496`
- **<anonymous>** — `build-faiss-node.js:481-481`
- **resolve** — `build-faiss-node.js:490-495`
- **answer** — `build-faiss-node.js:491-494`
- **main** — `build-faiss-node.js:502-575`
- **<anonymous>** — `build-faiss-node.js:502-502`
- **err** — `build-faiss-node.js:578-584`
- **modelToSlug** — `build-global-embeddings.ts:32-34`
- **<anonymous>** — `build-global-embeddings.ts:32-32`
- **isServerReachable** — `build-global-embeddings.ts:36-48`
- **<anonymous>** — `build-global-embeddings.ts:36-36`
- **main** — `build-global-embeddings.ts:50-223`
- **<anonymous>** — `build-global-embeddings.ts:50-50`
- **f** — `build-global-embeddings.ts:68-69`
- **r** — `build-global-embeddings.ts:87-87`
- **e** — `build-global-embeddings.ts:135-140`
- **e** — `build-global-embeddings.ts:150-150`
- **t** — `build-global-embeddings.ts:151-151`
- **err** — `build-global-embeddings.ts:225-228`
- **f** — `compare-benchmarks.ts:25-25`
- **f** — `compare-benchmarks.ts:34-37`
- **b** — `compare-benchmarks.ts:40-40`
- **b** — `compare-benchmarks.ts:41-41`
- **r** — `compare-benchmarks.ts:56-56`
- **r** — `compare-benchmarks.ts:57-57`
- **kw** — `compare-benchmarks.ts:137-137`
- **convert_model** — `convert-model-for-npu.py:16-80`
- **main** — `convert-model-for-npu.py:80-107`
- **log** — `convert-tokenizer-simple.ts:42-51`
- **<anonymous>** — `convert-tokenizer-simple.ts:42-42`
- **ensureDir** — `convert-tokenizer-simple.ts:53-57`
- **<anonymous>** — `convert-tokenizer-simple.ts:53-53`
- **downloadFile** — `convert-tokenizer-simple.ts:62-94`
- **<anonymous>** — `convert-tokenizer-simple.ts:62-62`
- **generateTokenizerJson** — `convert-tokenizer-simple.ts:99-133`
- **<anonymous>** — `convert-tokenizer-simple.ts:99-99`
- **verifyTokenizerJson** — `convert-tokenizer-simple.ts:138-161`
- **<anonymous>** — `convert-tokenizer-simple.ts:138-138`
- **convertModel** — `convert-tokenizer-simple.ts:167-275`
- **<anonymous>** — `convert-tokenizer-simple.ts:167-167`
- **file** — `convert-tokenizer-simple.ts:248-253`
- **main** — `convert-tokenizer-simple.ts:281-319`
- **<anonymous>** — `convert-tokenizer-simple.ts:281-281`
- **error** — `convert-tokenizer-simple.ts:323-326`
- **convert_to_fast_tokenizer** — `convert-tokenizer-to-fast.py:28-141`
- **cutensorStatus_t** — `cutensor_compat.h:13-15`
- **cutensorStatus_t** — `cutensor_compat.h:20-31`
- **cutensorStatus_t** — `cutensor_compat.h:34-88`
- **printOK** — `install-ovms-native.ts:47-49`
- **<anonymous>** — `install-ovms-native.ts:47-47`
- **printInfo** — `install-ovms-native.ts:50-52`
- **<anonymous>** — `install-ovms-native.ts:50-50`
- **printWarn** — `install-ovms-native.ts:53-55`
- **<anonymous>** — `install-ovms-native.ts:53-53`
- **printError** — `install-ovms-native.ts:56-58`
- **<anonymous>** — `install-ovms-native.ts:56-56`
- **getOVMSDir** — `install-ovms-native.ts:63-72`
- **<anonymous>** — `install-ovms-native.ts:63-63`
- **getModelsDir** — `install-ovms-native.ts:77-86`
- **<anonymous>** — `install-ovms-native.ts:77-77`
- **getDownloadUrl** — `install-ovms-native.ts:91-125`
- **<anonymous>** — `install-ovms-native.ts:91-91`
- **downloadFile** — `install-ovms-native.ts:130-179`
- **<anonymous>** — `install-ovms-native.ts:130-130`
- **resolve** — `install-ovms-native.ts:171-175`
- **extractArchive** — `install-ovms-native.ts:184-222`
- **<anonymous>** — `install-ovms-native.ts:184-184`
- **createStartupScript** — `install-ovms-native.ts:227-274`
- **<anonymous>** — `install-ovms-native.ts:227-227`
- **createSystemdService** — `install-ovms-native.ts:279-307`
- **<anonymous>** — `install-ovms-native.ts:279-279`
- **checkExistingInstallation** — `install-ovms-native.ts:312-316`
- **<anonymous>** — `install-ovms-native.ts:312-312`
- **main** — `install-ovms-native.ts:321-475`
- **<anonymous>** — `install-ovms-native.ts:321-321`
- **resolve** — `install-ovms-native.ts:343-348`
- **ans** — `install-ovms-native.ts:344-347`
- **error** — `install-ovms-native.ts:477-480`
- **log** — `postinstall-gpu.js:28-30`
- **<anonymous>** — `postinstall-gpu.js:28-28`
- **execCommand** — `postinstall-gpu.js:32-44`
- **<anonymous>** — `postinstall-gpu.js:32-32`
- **checkCommand** — `postinstall-gpu.js:46-56`
- **<anonymous>** — `postinstall-gpu.js:46-46`
- **checkCUDAToolkit** — `postinstall-gpu.js:58-82`
- **<anonymous>** — `postinstall-gpu.js:58-58`
- **buildWASM** — `postinstall-gpu.js:84-148`
- **<anonymous>** — `postinstall-gpu.js:84-84`
- **_buildCUDA** — `postinstall-gpu.js:150-200`
- **<anonymous>** — `postinstall-gpu.js:150-150`
- **main** — `postinstall-gpu.js:202-261`
- **<anonymous>** — `postinstall-gpu.js:202-202`
- **error** — `postinstall-gpu.js:265-269`
- **args** — `postinstall.cjs:22-22`
- **printBox** — `postinstall.cjs:36-49`
- **<anonymous>** — `postinstall.cjs:36-36`
- **printSuccess** — `postinstall.cjs:51-53`
- **<anonymous>** — `postinstall.cjs:51-51`
- **printInfo** — `postinstall.cjs:55-57`
- **<anonymous>** — `postinstall.cjs:55-55`
- **_printWarning** — `postinstall.cjs:59-61`
- **<anonymous>** — `postinstall.cjs:59-59`
- **printError** — `postinstall.cjs:63-65`
- **<anonymous>** — `postinstall.cjs:63-63`
- **isAppleSilicon** — `postinstall.cjs:67-69`
- **<anonymous>** — `postinstall.cjs:67-67`
- **isIntelMac** — `postinstall.cjs:71-73`
- **<anonymous>** — `postinstall.cjs:71-71`
- **checkMetalLibExists** — `postinstall.cjs:75-78`
- **<anonymous>** — `postinstall.cjs:75-75`
- **checkCudaLibExists** — `postinstall.cjs:80-89`
- **<anonymous>** — `postinstall.cjs:80-80`
- **askYesNo** — `postinstall.cjs:91-109`
- **<anonymous>** — `postinstall.cjs:91-91`
- **resolve** — `postinstall.cjs:97-108`
- **answer** — `postinstall.cjs:104-107`
- **askSkip** — `postinstall.cjs:111-130`
- **<anonymous>** — `postinstall.cjs:111-111`
- **resolve** — `postinstall.cjs:117-129`
- **answer** — `postinstall.cjs:124-128`
- **buildMetalBackend** — `postinstall.cjs:132-157`
- **<anonymous>** — `postinstall.cjs:132-132`
- **handleAppleSilicon** — `postinstall.cjs:159-194`
- **<anonymous>** — `postinstall.cjs:159-159`
- **detectPlatformInfo** — `postinstall.cjs:196-213`
- **<anonymous>** — `postinstall.cjs:196-196`
- **main** — `postinstall.cjs:215-267`
- **<anonymous>** — `postinstall.cjs:215-215`
- **runSetupWizard** — `postinstall.cjs:269-320`
- **<anonymous>** — `postinstall.cjs:269-269`
- **error** — `postinstall.cjs:322-326`
- **main** — `reshape-model-for-npu.py:20-124`
- **CONFIG** — `build-faiss-node.js:27-38`
- **timestamp** — `build-faiss-node.js:45-45`
- **silent** — `build-faiss-node.js:60-60`
- **allowFail** — `build-faiss-node.js:61-61`
- **result** — `build-faiss-node.js:66-70`
- **file** — `build-faiss-node.js:95-95`
- **request** — `build-faiss-node.js:96-115`
- **version** — `build-faiss-node.js:137-137`
- **version** — `build-faiss-node.js:147-147`
- **version** — `build-faiss-node.js:158-158`
- **vswhere** — `build-faiss-node.js:168-168`
- **output** — `build-faiss-node.js:176-179`
- **version** — `build-faiss-node.js:182-182`
- **version** — `build-faiss-node.js:194-194`
- **vcpkgExe** — `build-faiss-node.js:203-203`
- **version** — `build-faiss-node.js:205-205`
- **openblasPath** — `build-faiss-node.js:214-214`
- **tempDir** — `build-faiss-node.js:237-237`
- **installerPath** — `build-faiss-node.js:240-240`
- **tempDir** — `build-faiss-node.js:265-265`
- **installerPath** — `build-faiss-node.js:268-268`
- **answer** — `build-faiss-node.js:298-298`
- **tempDir** — `build-faiss-node.js:304-304`
- **installerPath** — `build-faiss-node.js:307-307`
- **vcpkgExe** — `build-faiss-node.js:354-354`
- **openblasPath** — `build-faiss-node.js:362-362`
- **binPath** — `build-faiss-node.js:367-367`
- **vcpkgToolchain** — `build-faiss-node.js:371-371`
- **depsDir** — `build-faiss-node.js:401-401`
- **nodeModulesDir** — `build-faiss-node.js:402-402`
- **buildDir** — `build-faiss-node.js:403-403`
- **vcpkgToolchain** — `build-faiss-node.js:415-415`
- **builtAddon** — `build-faiss-node.js:434-434`
- **plat** — `build-faiss-node.js:440-440`
- **architecture** — `build-faiss-node.js:441-441`
- **targetDir** — `build-faiss-node.js:446-446`
- **targetPath** — `build-faiss-node.js:449-449`
- **readline** — `build-faiss-node.js:484-484`
- **rl** — `build-faiss-node.js:485-488`
- **nodeVersion** — `build-faiss-node.js:505-505`
- **abiVersion** — `build-faiss-node.js:506-506`
- **deps** — `build-faiss-node.js:519-527`
- **addonPath** — `build-faiss-node.js:556-556`
- **success** — `build-faiss-node.js:560-560`
- **BATCH_SIZE** — `build-global-embeddings.ts:30-30`
- **resp** — `build-global-embeddings.ts:38-38`
- **resp** — `build-global-embeddings.ts:42-42`
- **semanticConfig** — `build-global-embeddings.ts:52-52`
- **modelArg** — `build-global-embeddings.ts:55-55`
- **model** — `build-global-embeddings.ts:56-59`
- **modelSlug** — `build-global-embeddings.ts:61-61`
- **scriptDir** — `build-global-embeddings.ts:62-62`
- **outDir** — `build-global-embeddings.ts:63-63`
- **forceRebuild** — `build-global-embeddings.ts:67-67`
- **allFilesExist** — `build-global-embeddings.ts:68-70`
- **execSync** — `build-global-embeddings.ts:83-83`
- **{ execSync }** — `build-global-embeddings.ts:83-83`
- **providerKind** — `build-global-embeddings.ts:93-93`
- **genOptions** — `build-global-embeddings.ts:95-101`
- **serverUrl** — `build-global-embeddings.ts:108-112`
- **reachable** — `build-global-embeddings.ts:114-114`
- **gen** — `build-global-embeddings.ts:126-126`
- **dim** — `build-global-embeddings.ts:129-129`
- **entries** — `build-global-embeddings.ts:133-133`
- **seen** — `build-global-embeddings.ts:134-134`
- **uniqueEntries** — `build-global-embeddings.ts:135-140`
- **key** — `build-global-embeddings.ts:136-136`
- **hashToEmbedding** — `build-global-embeddings.ts:144-144`
- **hashToText** — `build-global-embeddings.ts:145-145`
- **generated** — `build-global-embeddings.ts:147-147`
- **i** — `build-global-embeddings.ts:148-148`
- **batch** — `build-global-embeddings.ts:149-149`
- **texts** — `build-global-embeddings.ts:150-150`
- **normalizedTexts** — `build-global-embeddings.ts:151-151`
- **embeddings** — `build-global-embeddings.ts:153-153`
- **j** — `build-global-embeddings.ts:155-155`
- **normalized** — `build-global-embeddings.ts:156-156`
- **hash** — `build-global-embeddings.ts:157-157`
- **textsRecord** — `build-global-embeddings.ts:170-170`
- **hashes** — `build-global-embeddings.ts:177-177`
- **buffer** — `build-global-embeddings.ts:178-178`
- **offset** — `build-global-embeddings.ts:179-179`
- **emb** — `build-global-embeddings.ts:181-181`
- **k** — `build-global-embeddings.ts:182-182`
- **hashesBin** — `build-global-embeddings.ts:191-191`
- **i** — `build-global-embeddings.ts:192-192`
- **entryCounts** — `build-global-embeddings.ts:198-198`
- **files** — `compare-benchmarks.ts:24-26`
- **benchmarks** — `compare-benchmarks.ts:34-37`
- **content** — `compare-benchmarks.ts:35-35`
- **nodeData** — `compare-benchmarks.ts:40-40`
- **bunData** — `compare-benchmarks.ts:41-41`
- **nodeMap** — `compare-benchmarks.ts:56-56`
- **bunMap** — `compare-benchmarks.ts:57-57`
- **allTests** — `compare-benchmarks.ts:60-60`
- **totalNodeTime** — `compare-benchmarks.ts:68-68`
- **totalBunTime** — `compare-benchmarks.ts:69-69`
- **comparisons** — `compare-benchmarks.ts:70-70`
- **nodeResult** — `compare-benchmarks.ts:73-73`
- **bunResult** — `compare-benchmarks.ts:74-74`
- **nodeMs** — `compare-benchmarks.ts:78-78`
- **bunMs** — `compare-benchmarks.ts:79-79`
- **speedup** — `compare-benchmarks.ts:80-80`
- **speedupStr** — `compare-benchmarks.ts:86-86`
- **overallSpeedup** — `compare-benchmarks.ts:104-104`
- **categories** — `compare-benchmarks.ts:118-129`
- **catNodeTime** — `compare-benchmarks.ts:132-132`
- **catBunTime** — `compare-benchmarks.ts:133-133`
- **count** — `compare-benchmarks.ts:134-134`
- **nodeResult** — `compare-benchmarks.ts:139-139`
- **bunResult** — `compare-benchmarks.ts:140-140`
- **speedup** — `compare-benchmarks.ts:149-149`
- **emoji** — `compare-benchmarks.ts:150-150`
- **HUGGINGFACE_BASE** — `convert-tokenizer-simple.ts:23-23`
- **REQUIRED_FILES** — `convert-tokenizer-simple.ts:26-36`
- **prefix** — `convert-tokenizer-simple.ts:43-48`
- **url** — `convert-tokenizer-simple.ts:67-67`
- **response** — `convert-tokenizer-simple.ts:72-72`
- **content** — `convert-tokenizer-simple.ts:83-83`
- **sizeMB** — `convert-tokenizer-simple.ts:86-86`
- **config** — `convert-tokenizer-simple.ts:103-103`
- **tokenizerJson** — `convert-tokenizer-simple.ts:106-123`
- **tokenizer** — `convert-tokenizer-simple.ts:147-147`
- **downloadedCount** — `convert-tokenizer-simple.ts:184-184`
- **tokenizerJsonDownloaded** — `convert-tokenizer-simple.ts:185-185`
- **outputPath** — `convert-tokenizer-simple.ts:188-188`
- **downloaded** — `convert-tokenizer-simple.ts:189-189`
- **configPath** — `convert-tokenizer-simple.ts:209-209`
- **tokenizerPath** — `convert-tokenizer-simple.ts:210-210`
- **generated** — `convert-tokenizer-simple.ts:213-213`
- **tokenizerPath** — `convert-tokenizer-simple.ts:231-231`
- **valid** — `convert-tokenizer-simple.ts:232-232`
- **files** — `convert-tokenizer-simple.ts:247-247`
- **filePath** — `convert-tokenizer-simple.ts:249-249`
- **stats** — `convert-tokenizer-simple.ts:250-250`
- **sizeMB** — `convert-tokenizer-simple.ts:251-251`
- **absPath** — `convert-tokenizer-simple.ts:261-261`
- **args** — `convert-tokenizer-simple.ts:282-282`
- **modelId** — `convert-tokenizer-simple.ts:297-297`
- **outputDir** — `convert-tokenizer-simple.ts:298-298`
- **success** — `convert-tokenizer-simple.ts:300-300`
- **OVMS_VERSION** — `install-ovms-native.ts:33-35`
- **c** — `install-ovms-native.ts:37-45`
- **localAppData** — `install-ovms-native.ts:65-66`
- **home** — `install-ovms-native.ts:69-69`
- **localAppData** — `install-ovms-native.ts:79-80`
- **home** — `install-ovms-native.ts:83-83`
- **baseUrl** — `install-ovms-native.ts:92-92`
- **ubuntuVersion** — `install-ovms-native.ts:103-103`
- **osRelease** — `install-ovms-native.ts:105-107`
- **response** — `install-ovms-native.ts:133-135`
- **totalSize** — `install-ovms-native.ts:141-141`
- **totalMB** — `install-ovms-native.ts:142-142`
- **fileStream** — `install-ovms-native.ts:146-146`
- **reader** — `install-ovms-native.ts:147-147`
- **downloadedSize** — `install-ovms-native.ts:153-153`
- **lastProgress** — `install-ovms-native.ts:154-154`
- **done** — `install-ovms-native.ts:157-157`
- **{ done, value }** — `install-ovms-native.ts:157-157`
- **progress** — `install-ovms-native.ts:163-163`
- **winArchive** — `install-ovms-native.ts:192-192`
- **winDest** — `install-ovms-native.ts:193-193`
- **result** — `install-ovms-native.ts:196-204`
- **stderr** — `install-ovms-native.ts:207-207`
- **scriptPath** — `install-ovms-native.ts:228-229`
- **ovmsBin** — `install-ovms-native.ts:231-231`
- **modelsPathArg** — `install-ovms-native.ts:234-234`
- **batchContent** — `install-ovms-native.ts:237-250`
- **shellContent** — `install-ovms-native.ts:253-266`
- **serviceContent** — `install-ovms-native.ts:282-296`
- **serviceDir** — `install-ovms-native.ts:298-298`
- **servicePath** — `install-ovms-native.ts:301-301`
- **ovmsBin** — `install-ovms-native.ts:313-313`
- **ovmsDir** — `install-ovms-native.ts:328-328`
- **modelsDir** — `install-ovms-native.ts:329-329`
- **readline** — `install-ovms-native.ts:340-340`
- **rl** — `install-ovms-native.ts:341-341`
- **answer** — `install-ovms-native.ts:343-348`
- **url** — `install-ovms-native.ts:360-360`
- **{ url, filename }** — `install-ovms-native.ts:360-360`
- **tempDir** — `install-ovms-native.ts:361-361`
- **archivePath** — `install-ovms-native.ts:362-362`
- **altUrl** — `install-ovms-native.ts:373-373`
- **extractTempDir** — `install-ovms-native.ts:392-392`
- **extractedOvms** — `install-ovms-native.ts:397-397`
- **sourceDir** — `install-ovms-native.ts:398-398`
- **result** — `install-ovms-native.ts:413-415`
- **startScript** — `install-ovms-native.ts:445-445`
- **ovmsBin** — `install-ovms-native.ts:459-459`
- **fs** — `patch-subsystem.cjs:2-2`
- **path** — `patch-subsystem.cjs:3-3`
- **buf** — `patch-subsystem.cjs:10-10`
- **peOffset** — `patch-subsystem.cjs:19-19`
- **optionalHeaderOffset** — `patch-subsystem.cjs:29-29`
- **magic** — `patch-subsystem.cjs:30-30`
- **subsystemOffset** — `patch-subsystem.cjs:34-34`
- **currentSubsystem** — `patch-subsystem.cjs:37-37`
- **subsystemNames** — `patch-subsystem.cjs:38-38`
- **dryRun** — `patch-subsystem.cjs:45-45`
- **__filename** — `postinstall-gpu.js:14-14`
- **__dirname** — `postinstall-gpu.js:15-15`
- **rootDir** — `postinstall-gpu.js:16-16`
- **COLORS** — `postinstall-gpu.js:18-26`
- **version** — `postinstall-gpu.js:71-74`
- **match** — `postinstall-gpu.js:75-75`
- **cudaVersion** — `postinstall-gpu.js:76-76`
- **installed** — `postinstall-gpu.js:99-99`
- **wasmDiffDir** — `postinstall-gpu.js:111-111`
- **wasmVectorDir** — `postinstall-gpu.js:112-112`
- **buildScript** — `postinstall-gpu.js:120-123`
- **buildCommand** — `postinstall-gpu.js:130-133`
- **success** — `postinstall-gpu.js:135-137`
- **cudaCheck** — `postinstall-gpu.js:154-154`
- **success** — `postinstall-gpu.js:181-181`
- **addonPath** — `postinstall-gpu.js:188-188`
- **results** — `postinstall-gpu.js:210-213`
- **backends** — `postinstall-gpu.js:231-244`
- **spawnSync** — `postinstall.cjs:13-13`
- **{ spawnSync }** — `postinstall.cjs:13-13`
- **existsSync** — `postinstall.cjs:14-14`
- **{ existsSync }** — `postinstall.cjs:14-14`
- **arch** — `postinstall.cjs:15-15`
- **{ arch, platform }** — `postinstall.cjs:15-15`
- **join** — `postinstall.cjs:16-16`
- **{ join }** — `postinstall.cjs:16-16`
- **readline** — `postinstall.cjs:17-17`
- **projectRoot** — `postinstall.cjs:19-19`
- **log** — `postinstall.cjs:22-22`
- **colors** — `postinstall.cjs:25-34`
- **width** — `postinstall.cjs:37-37`
- **border** — `postinstall.cjs:38-38`
- **metalPath** — `postinstall.cjs:76-76`
- **plat** — `postinstall.cjs:81-81`
- **rl** — `postinstall.cjs:92-95`
- **rl** — `postinstall.cjs:112-115`
- **skip** — `postinstall.cjs:126-126`
- **buildScript** — `postinstall.cjs:136-136`
- **result** — `postinstall.cjs:143-148`
- **shouldBuild** — `postinstall.cjs:179-179`
- **success** — `postinstall.cjs:183-183`
- **plat** — `postinstall.cjs:197-197`
- **architecture** — `postinstall.cjs:198-198`
- **platformInfo** — `postinstall.cjs:227-227`
- **shouldSkip** — `postinstall.cjs:277-277`
- **setupScript** — `postinstall.cjs:289-290`
- **setupJs** — `postinstall.cjs:293-293`
- **result** — `postinstall.cjs:295-298`
