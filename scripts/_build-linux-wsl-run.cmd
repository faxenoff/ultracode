@echo off
REM Build CUDA+FAISS addon for Linux via WSL2
REM Usage: scripts\_build-linux-wsl-run.cmd [--clean]
REM
REM Prerequisites (one-time in WSL):
REM   sudo apt-get install -y cmake build-essential libfaiss-dev libopenblas-dev

echo === Building Linux CUDA addon via WSL ===

REM Convert Windows path to WSL /mnt/ path
set "WIN_PATH=%~dp0.."
for %%I in ("%WIN_PATH%") do set "WIN_PATH=%%~fI"
REM Replace backslashes with forward slashes and drive letter
set "WSL_PATH=%WIN_PATH:\=/%"
set "WSL_PATH=/mnt/%WSL_PATH:~0,1%/%WSL_PATH:~3%"
REM Lowercase drive letter
for %%a in (a b c d e f g h i j k l m n o p q r s t u v w x y z) do (
    set "WSL_PATH=!WSL_PATH:%WSL_PATH:~5,1%=%%a!"
)

wsl -d Ubuntu-24.04 -e bash /mnt/d/github/ultracode/scripts/_build-linux-wsl-run.sh %*

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo BUILD FAILED
    exit /b %ERRORLEVEL%
)

echo.
echo BUILD SUCCEEDED
