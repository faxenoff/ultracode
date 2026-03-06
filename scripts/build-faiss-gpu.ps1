#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Build FAISS from source with GPU support
.DESCRIPTION
    Clones and builds facebook/faiss with CUDA GPU support.
    Produces faiss.dll + faiss_gpu.dll (or .so on Linux).
    Requires: CUDA Toolkit 12.x+, Visual Studio Build Tools, CMake 3.18+, vcpkg with OpenBLAS
.EXAMPLE
    .\scripts\build-faiss-gpu.ps1
    .\scripts\build-faiss-gpu.ps1 -Clean
    .\scripts\build-faiss-gpu.ps1 -FaissTag v1.11.0
#>

param(
    [switch]$Clean,
    [string]$FaissTag = "",
    [string]$CudaArch = "89;120",  # Ada(89)=RTX 4060+, Blackwell(120)=RTX 5060+
    [switch]$Minimal                       # Strip unused FAISS components for smaller DLL
)

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)

# Auto-detect latest stable tag if not specified
if (-not $FaissTag) {
    Write-Host "[FAISS-GPU Build] Detecting latest FAISS release..." -ForegroundColor Yellow
    $FaissTag = (git ls-remote --tags --sort=-v:refname https://github.com/facebookresearch/faiss.git "v*" 2>$null |
        Select-String "refs/tags/(v\d+\.\d+\.\d+)$" |
        ForEach-Object { $_.Matches[0].Groups[1].Value } |
        Select-Object -First 1)
    if (-not $FaissTag) {
        $FaissTag = "v1.14.1"
        Write-Host "[FAISS-GPU Build] Could not detect latest, using fallback: $FaissTag" -ForegroundColor Yellow
    } else {
        Write-Host "[FAISS-GPU Build] Latest release: $FaissTag" -ForegroundColor Green
    }
}
$BuildDir = Join-Path $ProjectRoot "build/faiss-gpu"
$FaissSource = Join-Path $BuildDir "faiss"
$InstallDir = Join-Path $ProjectRoot "external-libs/faiss-gpu-win32-x64"

Write-Host "`n[FAISS-GPU Build] Starting FAISS GPU build..." -ForegroundColor Cyan
Write-Host "[FAISS-GPU Build] Tag: $FaissTag, CUDA Architectures: $CudaArch" -ForegroundColor Yellow

# Check prerequisites
Write-Host "[FAISS-GPU Build] Checking prerequisites..." -ForegroundColor Yellow

# 1. Check CUDA Toolkit
$cudaPath = $env:CUDA_PATH
if (-not $cudaPath -or -not (Test-Path "$cudaPath/bin/nvcc.exe")) {
    Write-Host "[FAISS-GPU Build] ERROR: CUDA Toolkit not found!" -ForegroundColor Red
    Write-Host "  Set CUDA_PATH or install from: https://developer.nvidia.com/cuda-downloads" -ForegroundColor Yellow
    exit 1
}
$cudaVersion = & "$cudaPath/bin/nvcc.exe" --version 2>&1 | Select-String "release" | ForEach-Object { $_ -match "release (\d+\.\d+)" | Out-Null; $Matches[1] }
Write-Host "[FAISS-GPU Build] Found CUDA $cudaVersion at $cudaPath" -ForegroundColor Green

# 2. Check CMake
$cmake = Get-Command cmake -ErrorAction SilentlyContinue
if (-not $cmake) {
    Write-Host "[FAISS-GPU Build] ERROR: CMake not found!" -ForegroundColor Red
    exit 1
}
Write-Host "[FAISS-GPU Build] Found CMake: $(cmake --version | Select-Object -First 1)" -ForegroundColor Green

# 3. Check Git
$git = Get-Command git -ErrorAction SilentlyContinue
if (-not $git) {
    Write-Host "[FAISS-GPU Build] ERROR: Git not found!" -ForegroundColor Red
    exit 1
}

# Clean if requested — remove source and CMake build cache
if ($Clean) {
    Write-Host "[FAISS-GPU Build] Cleaning previous build..." -ForegroundColor Yellow
    # Remove CMake build cache
    $cmakeBuildCache = Join-Path $FaissSource "build"
    if (Test-Path $cmakeBuildCache) {
        Remove-Item -Recurse -Force $cmakeBuildCache -ErrorAction SilentlyContinue
    }
    # Remove .git to release locks, then source
    $gitDir = Join-Path $FaissSource ".git"
    if (Test-Path $gitDir) {
        Remove-Item -Recurse -Force $gitDir -ErrorAction SilentlyContinue
    }
    if (Test-Path $FaissSource) {
        Remove-Item -Recurse -Force $FaissSource -ErrorAction SilentlyContinue
    }
}

# Create build directory
if (-not (Test-Path $BuildDir)) {
    New-Item -ItemType Directory -Path $BuildDir -Force | Out-Null
}

# Clone FAISS if not present
if (-not (Test-Path $FaissSource)) {
    Write-Host "[FAISS-GPU Build] Cloning facebook/faiss ($FaissTag)..." -ForegroundColor Yellow
    Push-Location $BuildDir
    git clone --depth 1 --branch $FaissTag https://github.com/facebookresearch/faiss.git faiss
    Pop-Location
} else {
    Write-Host "[FAISS-GPU Build] FAISS source already present" -ForegroundColor Green
}

# Apply MSVC/Win32 compatibility patches
# Fixes: 'small' macro conflict (Windows SDK), OpenMP signed loop vars, NVCC template disambiguation
$patchFile = Join-Path $ProjectRoot "scripts/faiss-gpu-msvc-win32.patch"
if (Test-Path $patchFile) {
    Write-Host "[FAISS-GPU Build] Applying MSVC/Win32 patches..." -ForegroundColor Yellow
    Push-Location $FaissSource
    $ErrorActionPreference = "Continue"
    $null = & git apply --check $patchFile 2>&1
    if ($LASTEXITCODE -eq 0) {
        & git apply $patchFile 2>&1
        Write-Host "[FAISS-GPU Build] Patches applied via git apply" -ForegroundColor Green
    } else {
        # Fallback: apply fixes via sed (works across FAISS versions)
        Write-Host "[FAISS-GPU Build] git apply failed, applying fixes directly..." -ForegroundColor Yellow
        # 1. Windows SDK: #define small char — rename to isSmall
        & sed -i 's/bool small = !(laneId/bool isSmall = !(laneId/g; s/bool s = small ?/bool s = isSmall ?/g' faiss/gpu/utils/MergeNetworkWarp.cuh
        # 2. MSVC OpenMP: requires signed int loop variable
        $ompFiles = @("faiss/invlists/OnDiskInvertedLists.cpp", "faiss/utils/distances_fused/avx512.cpp", "faiss/utils/distances_fused/simdlib_based.cpp", "faiss/utils/sorting.cpp")
        foreach ($f in $ompFiles) {
            if (Test-Path $f) {
                & sed -i '/#pragma omp parallel/{n; s/for (size_t \(.\) = 0/for (int64_t \1 = 0/}' $f
            }
        }
        # 3. NVCC template disambiguation
        if (Test-Path "faiss/gpu/impl/PQCodeDistances-inl.cuh") {
            & sed -i 's/outCodeDistancesView\.view<2>/outCodeDistancesView.template view<2>/' faiss/gpu/impl/PQCodeDistances-inl.cuh
        }
        # 4. MSVC __restrict mangling mismatch: definition has __restrict but declaration doesn't
        #    MSVC includes __restrict in name mangling → LNK2019 unresolved external
        $restrictFiles = @("faiss/utils/simd_impl/distances_avx2.cpp", "faiss/utils/distances_simd.cpp")
        foreach ($f in $restrictFiles) {
            if (Test-Path $f) {
                & sed -i 's/const float\* __restrict a/const float* a/g; s/const float\* __restrict b/const float* b/g; s/float\* __restrict c/float* c/g' $f
            }
        }
        Write-Host "[FAISS-GPU Build] Patches applied via sed fallback" -ForegroundColor Green
    }
    $ErrorActionPreference = "Stop"
    Pop-Location
}

# Find OpenBLAS (from vcpkg or system)
$openblasDir = ""
$vcpkgRoot = $env:VCPKG_ROOT
if ($vcpkgRoot) {
    $openblasDir = Join-Path $vcpkgRoot "installed/x64-windows"
    if (Test-Path "$openblasDir/lib/openblas.lib") {
        Write-Host "[FAISS-GPU Build] Found OpenBLAS from vcpkg: $openblasDir" -ForegroundColor Green
    } else {
        Write-Host "[FAISS-GPU Build] OpenBLAS not found in vcpkg, installing..." -ForegroundColor Yellow
        & vcpkg install openblas:x64-windows
    }
} else {
    Write-Host "[FAISS-GPU Build] WARNING: VCPKG_ROOT not set, OpenBLAS may not be found" -ForegroundColor Yellow
}

# Configure with CMake
Write-Host "[FAISS-GPU Build] Configuring CMake..." -ForegroundColor Yellow
$cmakeBuildDir = Join-Path $FaissSource "build"
if (-not (Test-Path $cmakeBuildDir)) {
    New-Item -ItemType Directory -Path $cmakeBuildDir -Force | Out-Null
}

# Find cl.exe from VS
$vsInstallPath = & "${env:ProgramFiles(x86)}/Microsoft Visual Studio/Installer/vswhere.exe" -latest -property installationPath 2>$null
if (-not $vsInstallPath) {
    $vsInstallPath = "C:\Program Files\Microsoft Visual Studio\18\Professional"
}
$msvcVersions = Get-ChildItem "$vsInstallPath/VC/Tools/MSVC" -Directory | Sort-Object Name -Descending | Select-Object -First 1
$clExe = Join-Path $msvcVersions.FullName "bin/Hostx64/x64/cl.exe"
Write-Host "[FAISS-GPU Build] Using cl.exe: $clExe" -ForegroundColor Green

$cmakeArgs = @(
    "-S", $FaissSource,
    "-B", $cmakeBuildDir,
    "-G", "Ninja",
    "-DCMAKE_BUILD_TYPE=Release",
    "-DCMAKE_C_COMPILER=$clExe",
    "-DCMAKE_CXX_COMPILER=$clExe",
    "-DFAISS_ENABLE_GPU=ON",
    "-DFAISS_ENABLE_PYTHON=OFF",
    "-DBUILD_TESTING=OFF",
    "-DBUILD_SHARED_LIBS=ON",
    "-DCUDAToolkit_ROOT=$cudaPath",
    "-DCMAKE_CUDA_ARCHITECTURES=$CudaArch",
    "-DFAISS_OPT_LEVEL=generic",  # avx2 creates separate faiss_avx2.dll which fails to link on MSVC (__restrict mangling bug)
    "-DCMAKE_INSTALL_PREFIX=$InstallDir"
)

if ($openblasDir) {
    $cmakeArgs += "-DCMAKE_PREFIX_PATH=$openblasDir"
    $cmakeArgs += "-DBLA_VENDOR=OpenBLAS"
    $lapackLib = Join-Path $openblasDir "lib/lapack.lib"
    if (Test-Path $lapackLib) {
        $cmakeArgs += "-DLAPACK_LIBRARIES=$lapackLib"
        Write-Host "[FAISS-GPU Build] Found LAPACK: $lapackLib" -ForegroundColor Green
    }
}

# Disable unused FAISS components
$cmakeArgs += "-DFAISS_ENABLE_RAFT=OFF"
$cmakeArgs += "-DFAISS_ENABLE_CUVS=OFF"

# Allow unsupported compiler (VS 2026 compat)
$cmakeArgs += "-DCMAKE_CUDA_FLAGS=-allow-unsupported-compiler -DCCCL_IGNORE_MSVC_TRADITIONAL_PREPROCESSOR_WARNING"
$cmakeArgs += "-DCMAKE_CXX_FLAGS=/EHsc -DCCCL_IGNORE_MSVC_TRADITIONAL_PREPROCESSOR_WARNING"

# Linker optimizations — strip unused code for smaller DLL
$cmakeArgs += "-DCMAKE_SHARED_LINKER_FLAGS=/OPT:REF /OPT:ICF"

& cmake @cmakeArgs
if ($LASTEXITCODE -ne 0) {
    Write-Host "[FAISS-GPU Build] CMake configure failed!" -ForegroundColor Red
    exit 1
}

# Build
Write-Host "[FAISS-GPU Build] Building (this may take a while)..." -ForegroundColor Yellow
& cmake --build $cmakeBuildDir --config Release -j ([Environment]::ProcessorCount)
if ($LASTEXITCODE -ne 0) {
    Write-Host "[FAISS-GPU Build] Build failed!" -ForegroundColor Red
    exit 1
}

# Install
Write-Host "[FAISS-GPU Build] Installing to $InstallDir..." -ForegroundColor Yellow
if (-not (Test-Path $InstallDir)) {
    New-Item -ItemType Directory -Path $InstallDir -Force | Out-Null
}

& cmake --install $cmakeBuildDir --config Release
if ($LASTEXITCODE -ne 0) {
    Write-Host "[FAISS-GPU Build] Install failed!" -ForegroundColor Red
    exit 1
}

# Verify output
$faissLib = Join-Path $InstallDir "lib/faiss.lib"
$faissGpuLib = Join-Path $InstallDir "lib/faiss_gpu.lib"
$faissDll = Join-Path $InstallDir "bin/faiss.dll"

$found = @()
foreach ($f in @($faissLib, $faissGpuLib, $faissDll)) {
    if (Test-Path $f) {
        $found += $f
        Write-Host "  Found: $f" -ForegroundColor Green
    }
}

# Also look for alternative locations
if ($found.Count -eq 0) {
    Write-Host "[FAISS-GPU Build] Looking for output files..." -ForegroundColor Yellow
    Get-ChildItem -Path $InstallDir -Recurse -Include "faiss*" | ForEach-Object {
        Write-Host "  Found: $($_.FullName)" -ForegroundColor Cyan
    }
}

Write-Host "`n[FAISS-GPU Build] SUCCESS! FAISS GPU libraries installed to: $InstallDir" -ForegroundColor Green
Write-Host "[FAISS-GPU Build] Next step: .\scripts\build-cuda.ps1 -FaissGpu" -ForegroundColor Yellow
Write-Host "[FAISS-GPU Build] Done!`n" -ForegroundColor Cyan
