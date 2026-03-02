@echo off
setlocal enabledelayedexpansion

REM ASCII Art Banner - BBS Graffiti Style

echo.
echo         ██  ██
echo         ██  ██  ██    ██████ █████▄  ▄████▄
echo         ██  ██  ██      ██   ██▄▄██▄ ██▄▄██
echo         ██  ██  ██      ██   ██   ██ ██  ██
echo         ██  ██  ██████  ██   ██   ██ ██  ██
echo         ▀████▀          ▄████ ▄████▄ █████▄ █████
echo                         ██    ██  ██ ██  ██ ██▄▄▄
echo                         ▀████ ▀████▀ █████▀ ██▄▄▄
echo.

REM Build script for UltraCode Server using Bun
REM Compiles TypeScript to dist/ directory using tsup with Bun runtime

REM Get project root (parent of Dev.Scripts)
set "SCRIPT_DIR=%~dp0"
REM Normalize path by using pushd/popd trick
pushd "%SCRIPT_DIR%.."
set "PROJECT_ROOT=%CD%"
popd

REM Check if Bun is installed
where bun >nul 2>nul
if errorlevel 1 (
    echo ERROR: Bun is not installed!
    echo.
    echo Please install Bun from: https://bun.sh
    echo   Windows: powershell -c "irm bun.sh/install.ps1 | iex"
    echo   Unix:    curl -fsSL https://bun.sh/install ^| bash
    echo.
    exit /b 1
)

REM Show Bun version
for /f "tokens=*" %%v in ('bun --version') do set BUN_VERSION=%%v
echo Using Bun v%BUN_VERSION%
echo.

REM Check if node_modules exists, install with Bun if not
if not exist "node_modules\" (
    echo node_modules not found, installing dependencies with Bun...
    set "ULTRACODE_SKIP_POSTINSTALL=1"
    bun install
    set "ULTRACODE_SKIP_POSTINSTALL="
    echo.
)

REM ============================================================================
REM STEP 1: Build/Copy WASM modules (required for TypeScript type checking)
REM ============================================================================
REM Check if WASM sources exist in external-tools/wasm/*/pkg/
set WASM_SRC_EXISTS=0
if exist "%PROJECT_ROOT%\external-tools\wasm\diff-simd\pkg\diff_simd.js" (
    if exist "%PROJECT_ROOT%\external-tools\wasm\vector-ops-simd\pkg\vector_ops_simd.js" (
        set WASM_SRC_EXISTS=1
    )
)

if %WASM_SRC_EXISTS% equ 1 (
    echo [1/4] WASM modules found in external-tools, copying to dist...

    REM Create target directories
    if not exist "%PROJECT_ROOT%\dist\external-tools\wasm\diff-simd" mkdir "%PROJECT_ROOT%\dist\external-tools\wasm\diff-simd"
    if not exist "%PROJECT_ROOT%\dist\external-tools\wasm\vector-ops-simd" mkdir "%PROJECT_ROOT%\dist\external-tools\wasm\vector-ops-simd"

    REM Copy WASM modules
    xcopy /Y /Q "%PROJECT_ROOT%\external-tools\wasm\diff-simd\pkg\*" "%PROJECT_ROOT%\dist\external-tools\wasm\diff-simd\" >nul
    xcopy /Y /Q "%PROJECT_ROOT%\external-tools\wasm\vector-ops-simd\pkg\*" "%PROJECT_ROOT%\dist\external-tools\wasm\vector-ops-simd\" >nul

    echo [OK] WASM modules copied to dist
    echo.
) else (
    REM Try to build WASM modules if wasm-pack available
    where wasm-pack >nul 2>nul
    if not errorlevel 1 (
        echo [1/4] Building WASM modules with Rust/wasm-pack...

        REM Use PowerShell script with absolute path
        if exist "%PROJECT_ROOT%\scripts\build-wasm.ps1" (
            powershell -ExecutionPolicy Bypass -File "%PROJECT_ROOT%\scripts\build-wasm.ps1"
            if errorlevel 1 (
                echo [WARNING] WASM build failed, TypeScript check may fail...
            ) else (
                echo.
                echo [OK] WASM modules built successfully

                REM Copy to dist after successful build
                if not exist "%PROJECT_ROOT%\dist\external-tools\wasm\diff-simd" mkdir "%PROJECT_ROOT%\dist\external-tools\wasm\diff-simd"
                if not exist "%PROJECT_ROOT%\dist\external-tools\wasm\vector-ops-simd" mkdir "%PROJECT_ROOT%\dist\external-tools\wasm\vector-ops-simd"
                xcopy /Y /Q "%PROJECT_ROOT%\external-tools\wasm\diff-simd\pkg\*" "%PROJECT_ROOT%\dist\external-tools\wasm\diff-simd\" >nul
                xcopy /Y /Q "%PROJECT_ROOT%\external-tools\wasm\vector-ops-simd\pkg\*" "%PROJECT_ROOT%\dist\external-tools\wasm\vector-ops-simd\" >nul
            )
        ) else (
            echo [WARNING] build-wasm.ps1 not found, skipping WASM build
        )

        echo.
    ) else (
        echo [1/4] wasm-pack not installed, skipping WASM build
        echo      Run dev-setup.cmd first or install Rust + wasm-pack
        echo.
    )
)

REM ============================================================================
REM STEP 2: TypeScript type checking
REM ============================================================================
echo [2/4] Running TypeScript type check...
bun run typecheck
if errorlevel 1 (
    echo.
    echo ERROR: TypeScript type check failed!
    echo Please fix type errors before building.
    exit /b 1
)
echo Type check passed!
echo.

REM ============================================================================
REM STEP 2.5: Build Roslyn C# addon (UltraCode.CSharp)
REM ============================================================================
echo [2.5/4] Checking Roslyn C# addon...

call "%PROJECT_ROOT%\scripts\build-roslyn.cmd"
if errorlevel 1 (
    echo [WARNING] Roslyn build failed, continuing without C# addon...
)

:skip_roslyn_build
echo.

REM ============================================================================
REM STEP 3: Build/Copy CUDA native module
REM ============================================================================
REM Check if CUDA module exists in external-tools (built by dev-setup)
if exist "%PROJECT_ROOT%\external-tools\native\cuda\build\ultracode_cuda.node" (
    echo [3/4] CUDA module found in external-tools, copying to dist...
    if not exist "%PROJECT_ROOT%\dist\native\cuda" mkdir "%PROJECT_ROOT%\dist\native\cuda"
    copy /Y "%PROJECT_ROOT%\external-tools\native\cuda\build\ultracode_cuda.node" "%PROJECT_ROOT%\dist\native\cuda\" >nul
    echo [OK] CUDA module copied to dist
    echo.
    goto skip_cuda_build
)

REM Check if CUDA module already in dist
if exist "%PROJECT_ROOT%\dist\native\cuda\ultracode_cuda.node" (
    echo [3/4] CUDA module already in dist, skipping rebuild
    echo.
    goto skip_cuda_build
)

REM Build CUDA native module if available (Windows only)
if exist "%PROJECT_ROOT%\external-tools\native\cuda\" (
    echo [3/4] Checking for CUDA Toolkit and Visual Studio Build Tools...

    REM Detect CUDA Toolkit
    set "CUDA_PATH="
    if exist "C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v13.0\bin\nvcc.exe" (
        set "CUDA_PATH=C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v13.0"
    ) else if exist "C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v12.0\bin\nvcc.exe" (
        set "CUDA_PATH=C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v12.0"
    ) else if exist "C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v11.8\bin\nvcc.exe" (
        set "CUDA_PATH=C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v11.8"
    )

    if defined CUDA_PATH (
        echo Found CUDA Toolkit: !CUDA_PATH!

        REM Check for CMake
        where cmake >nul 2>nul
        if errorlevel 1 (
            echo [WARNING] CMake not found - CUDA build skipped
            echo.
            echo To enable CUDA acceleration ^(100-200x faster^):
            echo   1. Install CMake: https://cmake.org/download/
            echo   2. Add CMake to PATH
            echo   3. Re-run this build script
            echo.
        ) else (
            REM Check for Visual Studio C++ compiler
            where cl.exe >nul 2>nul
            if errorlevel 1 (
                echo [INFO] Visual Studio C++ compiler not in PATH, searching...

                REM Try to auto-initialize Visual Studio environment
                REM Priority: 1) VS 2022 Build Tools, 2) VS 2022 editions, 3) vswhere for others
                set "VS_PATH="

                REM Priority 1: VS 2022 Build Tools (most stable for CUDA)
                if exist "%ProgramFiles(x86)%\Microsoft Visual Studio\2022\BuildTools\Common7\Tools\VsDevCmd.bat" (
                    set "VS_PATH=%ProgramFiles(x86)%\Microsoft Visual Studio\2022\BuildTools"
                    echo [INFO] Found VS 2022 Build Tools (prioritized for CUDA)
                )

                REM Priority 2: VS 2022 Community/Professional/Enterprise
                if not defined VS_PATH (
                    if exist "%ProgramFiles(x86)%\Microsoft Visual Studio\2022\Community\Common7\Tools\VsDevCmd.bat" (
                        set "VS_PATH=%ProgramFiles(x86)%\Microsoft Visual Studio\2022\Community"
                        echo [INFO] Found VS 2022 Community
                    ) else if exist "%ProgramFiles(x86)%\Microsoft Visual Studio\2022\Professional\Common7\Tools\VsDevCmd.bat" (
                        set "VS_PATH=%ProgramFiles(x86)%\Microsoft Visual Studio\2022\Professional"
                        echo [INFO] Found VS 2022 Professional
                    ) else if exist "%ProgramFiles(x86)%\Microsoft Visual Studio\2022\Enterprise\Common7\Tools\VsDevCmd.bat" (
                        set "VS_PATH=%ProgramFiles(x86)%\Microsoft Visual Studio\2022\Enterprise"
                        echo [INFO] Found VS 2022 Enterprise
                    )
                )

                REM Priority 3: Use vswhere for other versions (VS 2019, VS 2026, etc.)
                if not defined VS_PATH (
                    set "VSWHERE=%ProgramFiles(x86)%\Microsoft Visual Studio\Installer\vswhere.exe"
                    if exist "!VSWHERE!" (
                        for /f "usebackq tokens=*" %%i in (`"!VSWHERE!" -latest -products * -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64 -property installationPath`) do (
                            set "VS_PATH=%%i"
                            echo [WARNING] Using Visual Studio at: !VS_PATH!
                            echo [WARNING] VS 2022 is recommended for CUDA builds
                        )
                    )
                )

                if defined VS_PATH (
                    if exist "!VS_PATH!\Common7\Tools\VsDevCmd.bat" (
                        echo [INFO] Initializing VS environment...
                        call "!VS_PATH!\Common7\Tools\VsDevCmd.bat" -arch=x64 -host_arch=x64 >nul 2>nul

                        REM Check again after initialization
                        where cl.exe >nul 2>nul
                        if errorlevel 1 (
                            echo [WARNING] Failed to initialize Visual Studio environment
                            goto :skip_cuda_build
                        )
                        echo [INFO] Visual Studio environment initialized successfully
                    ) else (
                        echo [WARNING] VsDevCmd.bat not found at: !VS_PATH!
                        goto :skip_cuda_build
                    )
                ) else (
                    echo [WARNING] Visual Studio 2022 with C++ not found
                    echo.
                    echo To enable CUDA acceleration ^(100-200x faster^):
                    echo   1. Install Visual Studio 2022 Build Tools
                    echo      Download: https://aka.ms/vs/17/release/vs_BuildTools.exe
                    echo   2. Select workload: "Desktop development with C++"
                    echo   3. Re-run this build script
                    echo.
                    echo IMPORTANT: Install VS 2022 BEFORE installing CUDA Toolkit!
                    echo See CUDA_SETUP_GUIDE.md for detailed instructions.
                    echo.
                    goto :skip_cuda_build
                )
            )

            REM If we reach here, cl.exe is available (either was in PATH or initialized)
            echo Found CMake:
            cmake --version | findstr /C:"version"
            echo Found Visual Studio C++ compiler
            echo.
            echo [3/4] Building CUDA native module...

            REM Set CUDA working directory (use delayed expansion for nested if blocks)
            set "CUDA_DIR=!PROJECT_ROOT!\external-tools\native\cuda"

            REM Install dependencies if node_modules doesn't exist
            if not exist "!CUDA_DIR!\node_modules\" (
                echo [INFO] Installing CUDA addon dependencies...
                pushd "!CUDA_DIR!"
                call npm install --legacy-peer-deps
                popd
            )

            REM Re-set CUDA_DIR after npm install (call may reset environment)
            set "CUDA_DIR=!PROJECT_ROOT!\external-tools\native\cuda"

            REM Install cmake-js if not present
            where cmake-js >nul 2>nul
            if errorlevel 1 (
                echo Installing cmake-js...
                call npm install -g cmake-js
            )

            REM Build with cmake-js using Ninja generator (works with any VS version)
            REM First, initialize VS environment to get compiler in PATH
            call "!VS_PATH!\Common7\Tools\VsDevCmd.bat" -arch=x64 -host_arch=x64 >nul 2>nul

            REM Set CMake environment variables
            set "CMAKE_GENERATOR=Ninja"
            set "CMAKE_BUILD_TYPE=Release"
            set "CMAKE_CUDA_COMPILER=!CUDA_PATH!\bin\nvcc.exe"
            set "CUDAToolkit_ROOT=!CUDA_PATH!"
            set "CUDA_TOOLKIT_ROOT_DIR=!CUDA_PATH!"

            REM Check if Ninja is available
            where ninja >nul 2>nul
            if errorlevel 1 (
                echo [INFO] Installing Ninja build system...
                call npm install -g ninja-build
            )

            REM Build with Ninja generator - use separate cmd to avoid junction issues
            REM Use cmd /c with explicit cd to work around junction/symlink issues
            cmd /c "cd /d !CUDA_DIR! && cmake-js rebuild --CDCUDA_TOOLKIT_ROOT_DIR=!CUDA_PATH! --arch=x64 --generator=Ninja"
            set "BUILD_EXIT_CODE=!ERRORLEVEL!"

            set "EXIT_CODE_TEMP=!BUILD_EXIT_CODE!"
            if !EXIT_CODE_TEMP! neq 0 (
                echo [WARNING] CUDA build failed - exit code: !EXIT_CODE_TEMP!
                echo [WARNING] Continuing without GPU acceleration...
                set "CUDA_BUILD_SUCCESS=0"
            ) else (
                echo CUDA module built successfully!
                set "CUDA_BUILD_SUCCESS=1"
                echo [INFO] CUDA module will be copied to dist after TypeScript build
            )
            echo.
        )
    ) else (
        echo [SKIP] CUDA Toolkit not found at standard paths
        echo.
        echo To enable CUDA acceleration ^(100-200x faster^):
        echo   1. Install CUDA Toolkit: https://developer.nvidia.com/cuda-downloads
        echo      ^(Requires NVIDIA GPU - RTX 2060+ recommended^)
        echo   2. Install to: C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\
        echo   3. Re-run this build script
        echo.
    )
) else (
    echo [SKIP] external-tools\native\cuda directory not found
    echo.
)

:skip_cuda_build

REM ============================================================================
REM STEP 3.5: Build Comm proxy (Cosmopolitan binary)
REM ============================================================================
echo [3.5/4] Checking Comm proxy (ultracode.com)...

set "COMM_SRC=%PROJECT_ROOT%\src\comm\comm.c"
set "COMM_OUT=%PROJECT_ROOT%\src\comm\ultracode.com"

REM Check if cosmocc is available (APE binary without .exe)
set "COSMOCC="
set "COSMOCC_PATH=%LOCALAPPDATA%\cosmocc\bin\cosmocc"
if exist "!COSMOCC_PATH!" (
    set "COSMOCC=!COSMOCC_PATH!"
) else (
    where cosmocc >nul 2>nul
    if not errorlevel 1 set "COSMOCC=cosmocc"
)

if not defined COSMOCC goto :no_cosmocc

REM Check if source is newer than binary
set "NEED_BUILD=0"
if not exist "!COMM_OUT!" (
    set "NEED_BUILD=1"
    echo [INFO] Comm binary not found, building...
    goto :do_comm_build_check
)

REM Compare timestamps using PowerShell
for /f %%a in ('powershell -Command "(Get-Item '!COMM_SRC!').LastWriteTime -gt (Get-Item '!COMM_OUT!').LastWriteTime"') do (
    if "%%a"=="True" (
        set "NEED_BUILD=1"
        echo [INFO] Comm source updated, rebuilding...
    )
)

:do_comm_build_check
if "!NEED_BUILD!"=="1" (
    echo [INFO] Building Comm proxy with cosmocc...
    REM Use Git Bash for APE binaries - convert C:\path to /c/path
    set "CC_U=!COSMOCC:C:=/c!"
    set "CC_U=!CC_U:D:=/d!"
    set "CC_U=!CC_U:\=/!"
    set "OUT_U=!COMM_OUT:C:=/c!"
    set "OUT_U=!OUT_U:D:=/d!"
    set "OUT_U=!OUT_U:\=/!"
    set "SRC_U=!COMM_SRC:C:=/c!"
    set "SRC_U=!SRC_U:D:=/d!"
    set "SRC_U=!SRC_U:\=/!"
    "%ProgramFiles%\Git\bin\bash.exe" -c "\"!CC_U!\" -Os -DNDEBUG -o \"!OUT_U!\" \"!SRC_U!\""
    if errorlevel 1 (
        echo [WARNING] Comm build failed, using existing binary
    ) else (
        echo [OK] Comm proxy built successfully
    )
) else (
    echo [OK] Comm binary is up to date
)
goto :comm_done

:no_cosmocc
if exist "!COMM_OUT!" (
    echo [OK] Using pre-built Comm binary ^(cosmocc not installed^)
) else (
    echo [WARNING] cosmocc not found and no pre-built binary!
    echo          Install cosmocc: https://github.com/jart/cosmopolitan
    echo          Or run: powershell -File src\comm\setup.ps1
)

:comm_done
echo.

REM Clean TypeScript artifacts before build (preserve WASM and native modules)
if exist "%PROJECT_ROOT%\dist\index.js" del /q "%PROJECT_ROOT%\dist\index.js" >nul 2>&1
if exist "%PROJECT_ROOT%\dist\index.js.map" del /q "%PROJECT_ROOT%\dist\index.js.map" >nul 2>&1
if exist "%PROJECT_ROOT%\dist\index.d.ts" del /q "%PROJECT_ROOT%\dist\index.d.ts" >nul 2>&1
if exist "%PROJECT_ROOT%\dist\agents" rmdir /s /q "%PROJECT_ROOT%\dist\agents" >nul 2>&1
if exist "%PROJECT_ROOT%\dist\utils" rmdir /s /q "%PROJECT_ROOT%\dist\utils" >nul 2>&1

REM Run build with Bun
echo [4/4] Building with tsup (Bun runtime)...
bun run build
if errorlevel 1 (
    echo.
    echo ERROR: Build failed!
    exit /b 1
)
echo Build completed successfully!
echo.

REM Copy CUDA module if build was successful (after tsup to avoid it being cleaned)
if defined CUDA_BUILD_SUCCESS (
    if "!CUDA_BUILD_SUCCESS!"=="1" (
        echo [INFO] Copying CUDA module to dist...
        set "DIST_CUDA_DIR=!PROJECT_ROOT!\dist\native\cuda"
        if not exist "!DIST_CUDA_DIR!" mkdir "!DIST_CUDA_DIR!"

        for %%f in ("!CUDA_DIR!\build\*.node") do (
            copy /Y "%%f" "!DIST_CUDA_DIR!\" >nul
            if errorlevel 1 (
                echo [WARNING] Failed to copy CUDA module
            ) else (
                echo [OK] CUDA module copied to dist\native\cuda\
            )
        )
        echo.
    )
)

REM ============================================================================
REM STEP 5: Build global embedding cache (pre-compute embeddings for builtins)
REM ============================================================================
echo [5/5] Building global embedding cache...
echo       Generating pre-computed embeddings for stdlib/framework patterns...

bun run build:global-cache
if errorlevel 1 (
    echo [WARNING] Global embedding cache build failed.
    echo          This is non-fatal - embeddings will be generated on first use.
    echo          To generate pre-built cache, start TEI server and run:
    echo            bun run build:global-cache
) else (
    echo [OK] Global embedding cache built successfully!
)
echo.

REM Show colored build summary
powershell -ExecutionPolicy Bypass -File "%PROJECT_ROOT%\scripts\show-build-summary.ps1" -ProjectRoot "%PROJECT_ROOT%"

exit /b 0

