#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Build CUDA native addon for UltraCode
.DESCRIPTION
    Compiles the CUDA vector operations addon using cmake-js.
    Requires: CUDA Toolkit 11.x+, Visual Studio Build Tools, cmake-js
.EXAMPLE
    .\scripts\build-cuda.ps1
    .\scripts\build-cuda.ps1 -Debug
#>

param(
    [switch]$Debug,
    [switch]$Clean,
    [switch]$FaissGpu,
    [switch]$FaissCpu,
    [string]$CudaArch = ""
)

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$CudaDir = Join-Path $ProjectRoot "external-tools/native/cuda"
$DistDir = Join-Path $ProjectRoot "dist/native/cuda"

Write-Host "`n[CUDA Build] Starting CUDA addon build..." -ForegroundColor Cyan

# Check prerequisites
Write-Host "[CUDA Build] Checking prerequisites..." -ForegroundColor Yellow

# 1. Check CUDA Toolkit
$nvccPath = Get-Command nvcc -ErrorAction SilentlyContinue
if (-not $nvccPath) {
    $cudaPath = $env:CUDA_PATH
    if ($cudaPath -and (Test-Path "$cudaPath/bin/nvcc.exe")) {
        $env:PATH = "$cudaPath/bin;$env:PATH"
        Write-Host "[CUDA Build] Found CUDA at: $cudaPath" -ForegroundColor Green
    } else {
        Write-Host "[CUDA Build] ERROR: CUDA Toolkit not found!" -ForegroundColor Red
        Write-Host "  Install from: https://developer.nvidia.com/cuda-downloads" -ForegroundColor Yellow
        exit 1
    }
} else {
    $cudaVersion = & nvcc --version | Select-String "release" | ForEach-Object { $_ -match "release (\d+\.\d+)" | Out-Null; $Matches[1] }
    Write-Host "[CUDA Build] Found CUDA $cudaVersion" -ForegroundColor Green
}

# 2. Check cmake-js
$cmakejs = Get-Command cmake-js -ErrorAction SilentlyContinue
if (-not $cmakejs) {
    Write-Host "[CUDA Build] Installing cmake-js..." -ForegroundColor Yellow
    npm install -g cmake-js
}

# 3. Check node-addon-api
$nodeAddonApi = Join-Path $ProjectRoot "node_modules/node-addon-api"
if (-not (Test-Path $nodeAddonApi)) {
    Write-Host "[CUDA Build] node-addon-api not found, running npm install..." -ForegroundColor Yellow
    Push-Location $ProjectRoot
    npm install
    Pop-Location
}

# Clean if requested
if ($Clean) {
    Write-Host "[CUDA Build] Cleaning previous build..." -ForegroundColor Yellow
    $buildDir = Join-Path $CudaDir "build"
    if (Test-Path $buildDir) {
        Remove-Item -Recurse -Force $buildDir
    }
}

# Build
Write-Host "[CUDA Build] Compiling CUDA addon..." -ForegroundColor Yellow
Push-Location $CudaDir

$cmakeArgs = @("compile")
if ($Debug) {
    $cmakeArgs += "--debug"
}

# Ensure CUDA compiler is found
$cudaBin = "$env:CUDA_PATH/bin/nvcc.exe"
if (-not $cudaBin -or -not (Test-Path $cudaBin)) {
    # Fallback: find from PATH
    $nvccCmd = Get-Command nvcc -ErrorAction SilentlyContinue
    if ($nvccCmd) {
        $cudaBin = $nvccCmd.Source
    }
}
if ($cudaBin -and (Test-Path $cudaBin)) {
    $cmakeArgs += "--CDCMAKE_CUDA_COMPILER=$cudaBin"
    $cudaRoot = Split-Path (Split-Path $cudaBin)
    $cmakeArgs += "--CDCUDAToolkit_ROOT=$cudaRoot"
    $cmakeArgs += "--CDCMAKE_CUDA_FLAGS=-allow-unsupported-compiler"
}

if ($CudaArch) {
    $cmakeArgs += "--CDCMAKE_CUDA_ARCHITECTURES=$CudaArch"
}
if ($FaissGpu -or $FaissCpu) {
    $faissGpuDir = Join-Path $ProjectRoot "external-libs/faiss-gpu-win32-x64"
    if (-not (Test-Path $faissGpuDir)) {
        Write-Host "[CUDA Build] ERROR: FAISS libs not found at $faissGpuDir" -ForegroundColor Red
        Write-Host "[CUDA Build] Run build-faiss-gpu.ps1 first!" -ForegroundColor Yellow
        exit 1
    }
    if ($FaissGpu) {
        $cmakeArgs += "--CDENABLE_FAISS_GPU=ON"
        Write-Host "[CUDA Build] FAISS GPU enabled: $faissGpuDir" -ForegroundColor Green
    }
    if ($FaissCpu) {
        $cmakeArgs += "--CDENABLE_FAISS_CPU=ON"
        Write-Host "[CUDA Build] FAISS CPU (native) enabled: $faissGpuDir" -ForegroundColor Green
    }
}

try {
    & cmake-js @cmakeArgs
    if ($LASTEXITCODE -ne 0) {
        throw "cmake-js failed with exit code $LASTEXITCODE"
    }
} finally {
    Pop-Location
}

# =============================================================================
# Copy to external-libs/ (canonical location, npm run build copies to dist/)
# =============================================================================

$plat = if ($IsLinux) { "linux" } else { "win32" }
$ExtLibDir = Join-Path $ProjectRoot "external-libs/cuda-$plat-x64"

Write-Host "[CUDA Build] Copying to $ExtLibDir ..." -ForegroundColor Yellow

if (-not (Test-Path $ExtLibDir)) {
    New-Item -ItemType Directory -Path $ExtLibDir -Force | Out-Null
}

$buildNode = Join-Path $CudaDir "build/Release/ultracode_cuda.node"
if (-not (Test-Path $buildNode)) {
    $buildNode = Join-Path $CudaDir "build/Debug/ultracode_cuda.node"
}

if (Test-Path $buildNode) {
    Copy-Item $buildNode -Destination $ExtLibDir -Force
    Write-Host "[CUDA Build] Copied: $ExtLibDir/ultracode_cuda.node" -ForegroundColor Green
} else {
    Write-Host "[CUDA Build] WARNING: .node file not found at expected location" -ForegroundColor Yellow
    Write-Host "[CUDA Build] Looking for .node files..." -ForegroundColor Yellow
    Get-ChildItem -Path (Join-Path $CudaDir "build") -Recurse -Filter "*.node" | ForEach-Object {
        Write-Host "  Found: $($_.FullName)" -ForegroundColor Cyan
        Copy-Item $_.FullName -Destination $ExtLibDir -Force
    }
}

# Copy FAISS and dependency DLLs to external-libs/
if ($FaissGpu -or $FaissCpu) {
    # 1. faiss.dll (from GPU build)
    $faissDll = Join-Path $ProjectRoot "external-libs/faiss-gpu-win32-x64/bin/faiss.dll"
    if (Test-Path $faissDll) {
        Copy-Item $faissDll -Destination $ExtLibDir -Force
        $dllSize = (Get-Item $faissDll).Length / 1MB
        Write-Host "[CUDA Build] Copied faiss.dll (${dllSize:N1} MB)" -ForegroundColor Green
    }

    # 2. OpenBLAS/LAPACK runtime DLLs (from faiss-win32-x64 prebuilt)
    $blasDir = Join-Path $ProjectRoot "external-libs/faiss-win32-x64"
    $runtimeDlls = @("openblas.dll", "liblapack.dll", "libgcc_s_seh-1.dll", "libgfortran-5.dll", "libquadmath-0.dll", "libwinpthread-1.dll")
    foreach ($dll in $runtimeDlls) {
        $src = Join-Path $blasDir $dll
        if (Test-Path $src) {
            Copy-Item $src -Destination $ExtLibDir -Force
            Write-Host "[CUDA Build] Copied $dll" -ForegroundColor DarkGreen
        }
    }

    # 3. CUDA runtime DLLs (cuBLAS) — from CUDA Toolkit
    $cudaBinDir = "$env:CUDA_PATH/bin/x64"
    if (-not (Test-Path $cudaBinDir)) { $cudaBinDir = "$env:CUDA_PATH/bin" }
    $cudaDlls = @("cublas64_*.dll", "cublasLt64_*.dll")
    foreach ($pattern in $cudaDlls) {
        $found = Get-ChildItem -Path $cudaBinDir -Filter $pattern -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($found) {
            Copy-Item $found.FullName -Destination $ExtLibDir -Force
            Write-Host "[CUDA Build] Copied $($found.Name)" -ForegroundColor DarkGreen
        }
    }
}

# Also copy to dist/ for immediate use (npm run build normally handles this)
Write-Host "[CUDA Build] Also copying to dist/native/cuda/ ..." -ForegroundColor Yellow
if (-not (Test-Path $DistDir)) {
    New-Item -ItemType Directory -Path $DistDir -Force | Out-Null
}
Get-ChildItem -Path $ExtLibDir -Filter "*.node" | Copy-Item -Destination $DistDir -Force
Get-ChildItem -Path $ExtLibDir -Filter "*.dll" | Copy-Item -Destination $DistDir -Force

# Verify
$finalNode = Join-Path $ExtLibDir "ultracode_cuda.node"
if (Test-Path $finalNode) {
    $size = (Get-Item $finalNode).Length / 1KB
    Write-Host "`n[CUDA Build] SUCCESS! Built: $finalNode (${size:N0} KB)" -ForegroundColor Green
} else {
    Write-Host "`n[CUDA Build] FAILED: Output file not created" -ForegroundColor Red
    exit 1
}

Write-Host "[CUDA Build] Done!`n" -ForegroundColor Cyan
