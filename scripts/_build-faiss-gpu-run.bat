@echo off
call "C:\Program Files\Microsoft Visual Studio\18\Professional\VC\Auxiliary\Build\vcvarsall.bat" x64
set CUDA_PATH=C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v13.1
set VCPKG_ROOT=C:\vcpkg
cd /d D:\github\ultracode
powershell.exe -ExecutionPolicy Bypass -File .\scripts\build-faiss-gpu.ps1 -Clean
