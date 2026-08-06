# comm

## 🤖 Overview

The `src/comm` module provides a framework for communication between different components of a system. It includes both native and cross-platform communication functionalities, making it versatile for various applications. Developers can use this module to handle data transmission and receive responses efficiently.

The `src/comm` module is utilized by developers and system architects to ensure reliable and secure communication protocols. It supports multiple communication methods, allowing for seamless integration with different hardware and software components.

## 🤖 Architecture

```
+---------------------+
|     comm-native.c    |
+---------------------+
|     comm.c          |
+---------------------+
```

## 🤖 Flow

```
+---------------------+
|     comm-native.c    |
+---------------------+     +---------------------+
|     comm.c          |     |     comm.c          |
+---------------------+     +---------------------+
|     Native API     |     |     Cross-Platform API |
+---------------------+     +---------------------+
```

## 🤖 Entity Listing

### Function
- **ascii_to_utf16** — Converts ASCII strings to UTF-16 strings `comm.c:251-257`
- **build_init_message** — Not present in the provided code `comm-native.c:110-128`
- **build_init_message** — Function to build an initialization message `comm.c:130-151`
- **convert_unix_to_win_path** — Function to convert Unix paths to Windows paths `comm.c:98-113`
- **find_runtime** — Not present in the provided code `comm-native.c:191-208`
- **find_runtime** — Finds the runtime environment `comm.c:260-283`
- **get_cwd** — Not present in the provided code `comm-native.c:150-161`
- **get_exe_dir** — Not present in the provided code `comm-native.c:164-183`
- **json_escape** — Not present in the provided code `comm-native.c:98-108`
- **json_escape** — Function to escape JSON characters `comm.c:116-126`
- **main** — Main function entry point `comm-native.c:457-478`
- **main** — Main function for the application `comm.c:1005-1011`
- **parse_args** — Not present in the provided code `comm-native.c:130-148`
- **parse_args** — Parses command-line arguments for transport mode, directory, branch, and agent ID `comm.c:205-227`
- **print_help** — Function to print application help information `comm-native.c:79-92`
- **print_help** — Function to print help information `comm.c:77-91`
- **print_version** — Function to print version information `comm.c:93-95`
- **signal_handler** — Signal handler for Unix platforms `comm-native.c:73-76`
- **signal_handler** — Handler for signals `comm.c:72-75`
- **unix_find_runtime** — Not present in the provided code `comm-native.c:326-354`
- **unix_get_exe_dir** — Retrieves the directory of the current executable on Unix `comm.c:722-739`
- **unix_main** — Main function for Unix transport mode `comm.c:975-999`
- **unix_pipe_main** — Main function for Unix named pipe transport mode `comm.c:862-969`
- **unix_send_init_message** — Function to send an initialization message via Unix `comm.c:182-202`
- **unix_stdio_main** — Not present in the provided code `comm-native.c:356-449`
- **unix_stdio_main** — Main function for Unix stdio transport mode `comm.c:745-855`
- **win_get_exe_dir** — Retrieves the directory of the current executable on Windows `comm.c:233-248`
- **win_main** — Main function for Windows transport mode `comm.c:697-716`
- **win_pipe_main** — Main function for Windows named pipe transport mode `comm.c:499-691`
- **win_send_init_message** — Function to send an initialization message via Windows `comm.c:154-179`
- **win_signal_handler** — Windows-specific signal handler `comm-native.c:67-71`
- **win_stdio_main** — Not present in the provided code `comm-native.c:210-314`
- **win_stdio_main** — Main function for Windows stdio transport mode `comm.c:289-493`

### Struct_decl
- **NtProcessInformation** — Structure for process information in Windows NT API `comm.c:319-319`
- **NtProcessInformation** — Initializes a structure for process information `comm.c:529-529`
- **NtStartupInfo** — Structure for startup information in Windows NT API `comm.c:349-349`
- **NtStartupInfo** — Initializes a structure for startup information `comm.c:556-556`
- **pollfd** — Not present in the provided code `comm-native.c:422-422`
- **pollfd** — Structure for poll file descriptor in Unix `comm.c:818-818`
- **pollfd** — Declares an array of pollfd structures for file descriptor monitoring `comm.c:934-934`

### Variable
- **g_running** — Static variable to control the running state `comm-native.c:64-64`
- **g_running** — Flag indicating if the program is running `comm.c:70-70`

### Constant
- **_COSMO_SOURCE** — Enable IsWindows(), IsLinux(), etc `comm.c:11-12`
- **access** — A function to check file access permissions `comm-native.c:23-24`
- **APP_NAME** — A macro defining the name of the application `comm-native.c:46-47`
- **APP_NAME** — "UltraCode.Comm" `comm.c:50-51`
- **BUFFER_SIZE** — A macro defining the size of the buffer used for data `comm-native.c:47-48`
- **BUFFER_SIZE** — 8192 `comm.c:51-52`
- **F_OK** — A flag to check if a file exists `comm-native.c:25-26`
- **INIT_PREFIX** — A macro defining the prefix for initialization messages `comm-native.c:49-50`
- **INIT_PREFIX** — "ULTRACODE_INIT:" `comm.c:53-54`
- **NDEBUG** — Enable MS ABI thunks `comm.c:12-13`
- **PIPE_NAME** — A macro defining the name of the named pipe used for communication `comm-native.c:48-49`
- **PIPE_NAME** — "\\\\.\\pipe\\UltraCode_Core" `comm.c:52-53`
- **R_OK** — A flag to check if a file is readable `comm-native.c:28-29`
- **snprintf** — A function to format and store a string in a buffer `comm-native.c:32-33`
- **VERSION** — A macro defining the version of the application `comm-native.c:45-46`
- **VERSION** — "3.0.0" `comm.c:49-50`
- **WIN32_LEAN_AND_MEAN** — A macro to reduce the Windows SDK to only the necessary components `comm-native.c:19-20`

### Type_alias
- **CommArgs** — Structure containing communication arguments `comm-native.c:56-62`
- **CommArgs** — Struct for parsed CLI arguments `comm.c:62-68`
- **TransportMode** — Enumerates transport modes for communication `comm-native.c:51-54`
- **TransportMode** — Enum for transport modes: stdio and pipe `comm.c:56-59`

### Import_decl
- **errno.h** — Imports `errno.h`. `comm-native.c:16-17`, `comm.c:20-21`
- **fcntl.h** — Imports `fcntl.h`. `comm-native.c:36-37`, `comm.c:19-20`
- **io.h** — Core I/O streams. `comm-native.c:21-22`
- **libc/dce.h** — Imports `libc/dce.h`. `comm.c:28-29`
- **libc/nt/createfile.h** — Imports `libc/nt/createfile.h`. `comm.c:31-32`
- **libc/nt/enum/accessmask.h** — Imports `libc/nt/enum/accessmask.h`. `comm.c:37-38`
- **libc/nt/enum/creationdisposition.h** — Imports `libc/nt/enum/creationdisposition.h`. `comm.c:38-39`
- **libc/nt/enum/fileflagandattributes.h** — Imports `libc/nt/enum/fileflagandattributes.h`. `comm.c:39-40`
- **libc/nt/enum/processcreationflags.h** — Imports `libc/nt/enum/processcreationflags.h`. `comm.c:40-41`
- **libc/nt/enum/startf.h** — Imports `libc/nt/enum/startf.h`. `comm.c:41-42`
- **libc/nt/files.h** — Imports `libc/nt/files.h`. `comm.c:32-33`
- **libc/nt/ipc.h** — Imports `libc/nt/ipc.h`. `comm.c:36-37`
- **libc/nt/process.h** — Imports `libc/nt/process.h`. `comm.c:35-36`
- **libc/nt/runtime.h** — Imports `libc/nt/runtime.h`. `comm.c:33-34`
- **libc/nt/struct/processinformation.h** — Imports `libc/nt/struct/processinformation.h`. `comm.c:43-44`
- **libc/nt/struct/securityattributes.h** — Imports `libc/nt/struct/securityattributes.h`. `comm.c:44-45`
- **libc/nt/struct/startupinfo.h** — Imports `libc/nt/struct/startupinfo.h`. `comm.c:42-43`
- **libc/nt/synchronization.h** — Imports `libc/nt/synchronization.h`. `comm.c:34-35`
- **mach-o/dyld.h** — Imports `mach-o/dyld.h`. `comm-native.c:41-42`
- **poll.h** — Imports `poll.h`. `comm-native.c:39-40`, `comm.c:25-26`
- **process.h** — Imports `process.h`. `comm-native.c:22-23`
- **signal.h** — Imports `signal.h`. `comm-native.c:15-16`, `comm.c:21-22`
- **stdbool.h** — Imports `stdbool.h`. `comm-native.c:14-15`, `comm.c:17-18`
- **stdio.h** — Imports `stdio.h`. `comm-native.c:11-12`, `comm.c:14-15`
- **stdlib.h** — Imports `stdlib.h`. `comm-native.c:12-13`, `comm.c:15-16`
- **string.h** — Imports `string.h`. `comm-native.c:13-14`, `comm.c:16-17`
- **sys/stat.h** — Imports `sys/stat.h`. `comm.c:23-24`
- **sys/types.h** — Imports `sys/types.h`. `comm-native.c:37-38`, `comm.c:22-23`
- **sys/wait.h** — Imports `sys/wait.h`. `comm-native.c:38-39`, `comm.c:24-25`
- **unistd.h** — Imports `unistd.h`. `comm-native.c:35-36`, `comm.c:18-19`
- **windows.h** — Imports `windows.h`. `comm-native.c:20-21`

### Property
- **agent_id** — String to store the agent ID `comm-native.c:61-61`
- **agent_id** — Agent identifier `comm.c:67-67`
- **branch** — String to store the branch name `comm-native.c:60-60`
- **branch** — Branch name `comm.c:66-66`
- **directory** — String to store the directory path `comm-native.c:59-59`
- **directory** — Directory path override `comm.c:65-65`
- **mode** — Variable to store the transport mode `comm-native.c:57-57`
- **mode** — Transport mode `comm.c:63-63`
- **mode_arg_idx** — Index for the mode argument `comm-native.c:58-58`
- **mode_arg_idx** — Index for mode argument `comm.c:64-64`

## Entities

### Type Aliases

- **bool32** — `comm.c:47-47` — 32-bit boolean type for consistent platform representation.

### Enums

- **MODE_STDIO** — `comm.c:56-59` — Transport mode enumeration for stdio-based communication.
- **TransportMode** — `comm.c:62-68` — Enumeration of available transport modes (stdio, named pipes).

### Structs

- **TransportMode** — `comm.c:62-68` — Defines available transport mechanisms and their parameters.
- **pollfd** — `comm.c:818-821` — File descriptor polling structure for Unix I/O multiplexing (first definition).
- **pollfd** — `comm.c:934-937` — File descriptor polling structure for Unix I/O multiplexing (second definition).
- **NtStartupInfo** — `comm.c:349-349` — Windows process startup information structure.
- **NtStartupInfo** — `comm.c:556-556` — Windows process startup information structure (second reference).
- **NtProcessInformation** — `comm.c:529-529` — Windows process handle and thread information.

### Functions

- **signal_handler** — `comm.c:72-75` — Handles system signals (SIGINT, SIGTERM) for graceful shutdown.
- **print_help** — `comm.c:77-91` — Outputs command-line help text describing available options and usage.
- **print_version** — `comm.c:93-95` — Outputs module version information.
- **memmove** — `comm.c:104-104` — Memory copying utility function for internal buffer management.
- **json_escape** — `comm.c:140-140` — Escapes special characters in strings for JSON serialization (first overload).
- **json_escape** — `comm.c:145-145` — Escapes special characters in strings for JSON serialization (second overload).
- **win_send_init_message** — `comm.c:154-179` — Sends initialization handshake message via Windows named pipe to parent process.
- **unix_send_init_message** — `comm.c:182-202` — Sends initialization handshake message via Unix stdio to parent process.
- **CommArgs** — `comm.c:205-227` — Parses and validates command-line arguments specifying transport mode and pipe identifiers.
- **win_get_exe_dir** — `comm.c:233-493` — Resolves the directory path of the current executable on Windows.
- **win_pipe_main** — `comm.c:499-855` — Main message loop for Windows pipe-based IPC, handles bidirectional message transport.
- **unix_pipe_main** — `comm.c:862-969` — Main message loop for Unix stdio/pipe-based IPC, handles bidirectional message transport with polling.
- **unix_main** — `comm.c:975-999` — Unix platform entry point, initializes communication and dispatches to message loop.
- **main** — `comm.c:1005-1011` — Primary entry point, detects platform and delegates to platform-specific initialization.

### Constants

- **define** — `comm.c:11-12` — Preprocessor constant defining buffer or limit value.
- **define** — `comm.c:12-13` — Preprocessor constant for configuration or compatibility.
- **define** — `comm.c:49-50` — Boolean true constant definition.
- **define** — `comm.c:50-51` — Boolean false constant definition.
- **define** — `comm.c:51-52` — Preprocessor constant for internal logic gate.
- **define** — `comm.c:52-53` — Preprocessor constant for success status code.
- **define** — `comm.c:53-54` — Preprocessor constant for failure status code.


### Added Entities

- **pollfd** — `comm-native.c:422-422`
- **win_signal_handler** — `comm-native.c:67-71`
- **signal_handler** — `comm-native.c:73-76`
- **print_help** — `comm-native.c:79-92`
- **json_escape** — `comm-native.c:98-108`
- **build_init_message** — `comm-native.c:110-128`
- **parse_args** — `comm-native.c:130-148`
- **get_cwd** — `comm-native.c:150-161`
- **get_exe_dir** — `comm-native.c:164-183`
- **find_runtime** — `comm-native.c:191-208`
- **win_stdio_main** — `comm-native.c:210-314`
- **unix_find_runtime** — `comm-native.c:326-354`
- **unix_stdio_main** — `comm-native.c:356-449`
- **main** — `comm-native.c:457-478`
- **WIN32_LEAN_AND_MEAN** — `comm-native.c:19-20`
- **access** — `comm-native.c:23-24`
- **F_OK** — `comm-native.c:25-26`
- **R_OK** — `comm-native.c:28-29`
- **snprintf** — `comm-native.c:32-33`
- **VERSION** — `comm-native.c:45-46`
- **APP_NAME** — `comm-native.c:46-47`
- **BUFFER_SIZE** — `comm-native.c:47-48`
- **PIPE_NAME** — `comm-native.c:48-49`
- **INIT_PREFIX** — `comm-native.c:49-50`
- **g_running** — `comm-native.c:64-64`
- **TransportMode** — `comm-native.c:51-54`
- **CommArgs** — `comm-native.c:56-62`

## Dependencies

**Internal:** No interdependencies with other src/comm modules (single-file module).

**External:**
- Windows API: `CreateNamedPipeA`, `CreateProcessA`, `WriteFile`, `ReadFile` (process creation, pipe I/O)
- Unix/POSIX: `poll()`, `read()`, `write()`, `fork()`, `signal()` (event multiplexing, IPC primitives)
- Standard C: `stdio.h`, `stdlib.h`, `string.h` (memory, string, I/O operations)
- JSON serialization: String escaping utilities for message encoding/decoding
```
