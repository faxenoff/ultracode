# GPU Backends & Native Libraries

Consolidated documentation covering GPU acceleration backends, CUDA setup, WebGPU, FAISS, and native library builds for all platforms.

---

## GPU Backends Overview

UltraCode supports GPU acceleration through multiple backends with automatic fallback:

| Backend | Priority | Performance | GPU Support | Installation |
|---------|----------|-------------|-------------|--------------|
| **CUDA Native** | 100 | 0.1-0.2ms (100-200x) | NVIDIA only | CUDA Toolkit + build |
| **Metal Native** | 95 | Similar to CUDA | Apple Silicon | Build on macOS |
| **WebGPU** | 80 | 0.2-0.3ms (50-100x) | All GPUs (NVIDIA/AMD/Intel) | `npm install webgpu` |
| **WASM SIMD** | 50 | 2-3ms (4-8x) | CPU only | Always available |
| **Pure JS** | 1 | 10ms (baseline) | CPU only | Always available |

The system automatically selects the highest-priority available backend at runtime.

### GPU Architecture Reference (NVIDIA)

| Architecture | Compute Cap | GPUs | WebGPU Status | CUDA Status |
|--------------|-------------|------|---------------|-------------|
| Kepler | 3.x | GTX 600/700 | Supported | Supported |
| Maxwell | 5.x | GTX 900 | Supported | Supported |
| Pascal | 6.x | GTX 10xx | Supported | Supported |
| Volta | 7.0 | Titan V | Supported | Supported |
| Turing | 7.5 | RTX 20xx | Supported | Supported |
| Ampere | 8.x | RTX 30xx | Supported | Supported |
| Ada Lovelace | 8.9 | RTX 40xx | Supported | Supported |
| Blackwell | 12.x | RTX 50xx | Auto-disabled | Supported |

### Programmatic API

```typescript
import { GPUDetector } from "./src/gpu/detection/gpu-detector.js";

// Safe detection (doesn't load WebGPU)
const compat = await GPUDetector.testWebGPUCompatibility();
// { cudaDetected, computeCapability, model, webgpuSafe, skipReason, envOverride }

// Full detection (skips WebGPU on Blackwell)
const info = await GPUDetector.detect();
// { vendor, model, cudaAvailable, webgpuAvailable, webgpuSkipped, webgpuSkipReason }

// Manual safety check
const safety = GPUDetector.isWebGPUSafe({ computeCapability: 12.0, model: "RTX 5060" });
```

### Known Issues

**NVIDIA Blackwell (RTX 50xx):** Dawn/WebGPU crashes on Blackwell GPUs (CC >= 12.0). WebGPU is auto-disabled for these GPUs until the `webgpu` npm package updates Dawn with support.

---

## CUDA Setup

### System Requirements

- NVIDIA GPU (Compute Capability 5.0+, recommended 7.5+)
- NVIDIA drivers (version 450+ for CUDA 11.x)
- Windows 10/11 or Linux (macOS not supported for CUDA)

### Critical: Installation Order (Windows)

The installation order is critical for proper CUDA integration:

1. **Visual Studio Build Tools** (FIRST!)
2. **CMake** 3.18+
3. **CUDA Toolkit** (AFTER Visual Studio!)
4. **Node.js** 24+

### Step-by-Step: Windows

#### 1. Install Visual Studio Build Tools

```powershell
# Install VS 2022 Build Tools (recommended for CUDA compatibility)
winget install Microsoft.VisualStudio.2022.BuildTools --override "--add Microsoft.VisualStudio.Workload.VCTools --includeRecommended"
```

Required components:
- MSVC v143 - VS 2022 C++ x64/x86 build tools
- C++ CMake tools for Windows
- Windows 10/11 SDK

> **Note:** VS 2026 has compatibility issues with CUDA 13.0 (CVTRES bugs). Build scripts automatically prefer VS 2022.

#### 2. Install CMake

```powershell
winget install --id Kitware.CMake
# Restart PowerShell after installation
```

#### 3. Install CUDA Toolkit

Download from https://developer.nvidia.com/cuda-downloads

During installation, select **Custom Installation** and ensure:
- CUDA -> Development (Headers, Libraries)
- CUDA -> Visual Studio Integration
- CUDA -> Runtime

#### 4. Verify Installation

```powershell
nvcc --version
cmake --version

# Verify CUDA integration files exist
dir "C:\Program Files (x86)\Microsoft Visual Studio\2022\BuildTools\MSBuild\Microsoft\VC\v170\BuildCustomizations\CUDA*.props"
```

#### 5. Build CUDA Backend

```powershell
# Automatic build
npm run build:cuda

# Or quick build (auto-detects VS 2022, handles npm rc shim conflict)
scripts\build-cuda-x64.bat
```

### Step-by-Step: Linux

```bash
# 1. Install NVIDIA drivers
sudo ubuntu-drivers autoinstall
sudo reboot

# 2. Install CUDA Toolkit
wget https://developer.download.nvidia.com/compute/cuda/repos/ubuntu2204/x86_64/cuda-keyring_1.1-1_all.deb
sudo dpkg -i cuda-keyring_1.1-1_all.deb
sudo apt-get update
sudo apt-get install cuda

# 3. Configure environment
echo 'export PATH=/usr/local/cuda/bin:$PATH' >> ~/.bashrc
echo 'export LD_LIBRARY_PATH=/usr/local/cuda/lib64:$LD_LIBRARY_PATH' >> ~/.bashrc
source ~/.bashrc

# 4. Install build tools
sudo apt-get install build-essential cmake

# 5. Verify
nvcc --version
nvidia-smi
```

### CUDA Version Compatibility

| CUDA Version | Min Driver | Recommended |
|--------------|------------|-------------|
| 11.8 | 450.80 | Best compatibility |
| 12.x | 525.60 | Latest features |
| 13.0 | 560+ | Newest (requires VS 2022) |

### Troubleshooting (CUDA)

**"No CUDA toolset found":** CUDA was installed before Visual Studio. Reinstall CUDA Toolkit.

**"nvcc not found":**
```powershell
# Windows
$env:Path += ";C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v13.0\bin"
```
```bash
# Linux
export PATH=/usr/local/cuda/bin:$PATH
```

**npm `rc` package conflict (Windows):** The npm `rc` package creates a shim `node_modules\.bin\rc.cmd` that CMake finds instead of Windows SDK Resource Compiler. Build scripts automatically handle this by temporarily renaming the shim.

**"CUDA Development Headers NOT found":** Reinstall CUDA Toolkit with "CUDA -> Development" component selected.

---

## WebGPU Setup

WebGPU provides cross-platform GPU acceleration for NVIDIA, AMD, and Intel GPUs.

### Installation

```bash
npm install webgpu --save-optional
```

### Platform Backends

| Platform | Backend | Requirements |
|----------|---------|-------------|
| Windows | DirectX 12 (Dawn) | Windows 10+ with DX12 GPU |
| Linux | Vulkan (Dawn) | Vulkan 1.1+, Mesa 20.0+ |
| macOS | Metal (wgpu) | macOS 10.15+, any 2012+ Mac |

### Linux Vulkan Setup

```bash
# Ubuntu/Debian
sudo apt-get install mesa-vulkan-drivers vulkan-tools

# Verify
vulkaninfo | grep apiVersion
```

### Performance by GPU Vendor

| GPU | WebGPU Performance | Notes |
|-----|-------------------|-------|
| NVIDIA GTX 1650 Ti | 0.2-0.3ms | ~70-80% of CUDA |
| NVIDIA RTX 3060 | 0.15-0.2ms | |
| AMD RX 6600 | 0.2-0.25ms | No CUDA alternative |
| Intel Arc A750 | 0.2-0.3ms | |
| Intel Iris Xe | 0.3-0.5ms | Integrated GPU |

---

## FAISS Build Guide

FAISS (Facebook AI Similarity Search) provides native vector search. Prebuilt binaries are included in the npm package for Windows and Linux.

### Supported Platforms

| Platform | Architecture | Build Script | Size |
|----------|-------------|-------------|------|
| Windows | x64 | `npm run build:faiss` | 3.5 MB + 15 MB DLLs |
| Linux | x64 | `npm run build:faiss:docker` | 5.5 MB |
| macOS | ARM64 (M1/M2/M3) | `npm run build:faiss:macos` | ~5 MB |
| macOS | Intel x64 | `npm run build:faiss:macos` | ~5 MB |

### Build Methods

**Windows (vcpkg + OpenBLAS):**
```powershell
npm run build:faiss
# Auto-installs vcpkg, OpenBLAS, LAPACK. Build time: 15-25 min
```

**Linux via Docker (recommended):**
```powershell
npm run build:faiss:docker
# Clean isolated build. Requires Docker Desktop. Build time: 10-20 min
```

**Linux via WSL:**
```powershell
npm run build:faiss:wsl
# Alternative to Docker. Requires WSL2 + Ubuntu
```

**macOS:**
```bash
bash scripts/build-faiss-macos.sh
# Auto-detects ARM64/x64. Requires Homebrew + OpenBLAS
```

### macOS Quick Start

```bash
# Prerequisites
brew install openblas cmake node@24
brew link node@24 --force

# Build
npm run build:faiss:macos

# Verify
node -e "require('./external-libs/faiss-darwin-arm64/faiss-node.node'); console.log('Success')"
```

### Output Structure

```
external-libs/
├── faiss-win32-x64/
│   ├── faiss-node.node     # Native module
│   ├── openblas.dll        # ~8 MB
│   ├── liblapack.dll       # ~3 MB
│   └── ... (4 more DLLs)
├── faiss-linux-x64/
│   └── faiss-node.node     # Statically linked
├── faiss-darwin-arm64/
│   └── faiss-node.node     # Apple Silicon
└── faiss-darwin-x64/
    └── faiss-node.node     # Intel Mac
```

### Troubleshooting (FAISS)

**"Could NOT find BLAS" (Windows):**
```powershell
C:\vcpkg\vcpkg.exe install openblas:x64-windows
C:\vcpkg\vcpkg.exe install lapack:x64-windows
C:\vcpkg\vcpkg.exe integrate install
```

**"Node ABI mismatch":** Rebuild with the correct Node version:
```bash
node -p "process.versions.modules"  # Should be 137 for Node 24
npm run build:faiss:docker:clean
```

---

## Native Libraries Build

### Platform Distribution

| Platform | Library | Technology | Distribution |
|----------|---------|-----------|-------------|
| Windows x64 | `ultracode_cuda.node` | NVIDIA CUDA | Bundled in npm |
| Linux x64 | `ultracode_cuda.node` | NVIDIA CUDA | Bundled in npm |
| macOS ARM64 | `ultracode_metal.node` | Apple Metal | Built at install time |
| macOS Intel | -- | -- | WASM fallback |
| All platforms | WASM SIMD | WebAssembly | Bundled in npm |
| All platforms | tree-sitter prebuilds | Node.js N-API | Bundled in npm |

### What Happens at `npm install`

1. npm package is unpacked (CUDA and WASM binaries already included)
2. `postinstall.js` runs:
   - Windows/Linux: Ready immediately (CUDA built-in)
   - macOS Apple Silicon: Offers to build Metal backend
   - macOS Intel: WASM fallback (Metal not supported)

### Build Commands

```powershell
# All platforms (Windows + Linux via WSL)
npm run build:native

# Windows only
npm run build:native:windows

# Linux only (via WSL)
npm run build:native:linux

# Quick Windows CUDA build
scripts\build-cuda-x64.bat

# Quick Linux/WSL build
bash scripts/build-linux-wsl.sh

# Clean build
npm run build:native:clean

# Build + package for GitHub Releases
.\scripts\build-native-libs.ps1 -Package
```

### macOS Metal Backend

```bash
# Prerequisites
xcode-select --install
brew install cmake

# Build
chmod +x scripts/build-native-libs-macos.sh
./scripts/build-native-libs-macos.sh
```

Result:
```
external-libs/metal-darwin-arm64/
├── ultracode_metal.node    # Node.js N-API addon
└── vector_ops.metallib     # Compiled Metal shaders
```

### Tree-sitter Prebuilds (Node.js 24+)

Node.js 24 requires C++20, but tree-sitter compiles with C++17. Precompiled native modules solve this:

```bash
# Windows
npm run build:tree-sitter

# Linux/macOS
bash scripts/build-tree-sitter-prebuilds.sh
```

The script automatically patches `binding.gyp` files (C++17 -> C++20), rebuilds all tree-sitter modules, and copies `.node` files to `external-libs/tree-sitter-{platform}-{arch}/`.

Supported modules (17 total): tree-sitter, tree-sitter-javascript, tree-sitter-typescript, tree-sitter-python, tree-sitter-c, tree-sitter-cpp, tree-sitter-c-sharp, tree-sitter-go, tree-sitter-rust, tree-sitter-java, tree-sitter-kotlin, tree-sitter-swift, tree-sitter-ruby, tree-sitter-php, tree-sitter-bash, tree-sitter-json, tree-sitter-yaml.

### Output File Structure

```
external-libs/
├── cuda-win32-x64/ultracode_cuda.node
├── cuda-linux-x64/ultracode_cuda.node
├── metal-darwin-arm64/
│   ├── ultracode_metal.node
│   └── vector_ops.metallib
├── tree-sitter-win32-x64/    (~26 MB, 17 files)
├── tree-sitter-linux-x64/
├── tree-sitter-darwin-arm64/
└── tree-sitter-darwin-x64/
```

---

## Environment Variables

### GPU Control

| Variable | Values | Description |
|----------|--------|-------------|
| `WEBGPU_FORCE_DISABLE` | `1` | Disable WebGPU detection entirely |
| `WEBGPU_FORCE_ENABLE` | `1` | Force WebGPU even on unsafe architectures (may crash) |
| `CUDA_FORCE_DISABLE` | `1` | Disable CUDA native addon |
| `CUDA_PATH` | path | CUDA Toolkit installation directory |
| `ULTRACODE_SKIP_POSTINSTALL` | `1` | Skip postinstall script |
| `CI` | `true` | Skip interactive prompts during install |

### Testing GPU Backends

```bash
# Auto-detection (safe on all GPUs)
bun test

# Disable both CUDA and WebGPU
CUDA_FORCE_DISABLE=1 WEBGPU_FORCE_DISABLE=1 bun test

# Test WebGPU compatibility without loading Dawn
bun test tests/gpu/webgpu-blackwell.test.ts

# Force WebGPU (danger - may crash on Blackwell!)
WEBGPU_FORCE_ENABLE=1 bun test
```

### Checking Active Backend

Server logs at startup show the selected backend:
```
[BackendSelector] Selected: CUDA Native (priority: 100)
[BackendSelector] Selected: Metal Native (priority: 95)
[BackendSelector] Selected: WebGPU Compute (priority: 80)
[BackendSelector] Selected: WASM SIMD (priority: 50)
```

---

## Key Source Files

| File | Purpose |
|------|---------|
| `src/gpu/detection/gpu-detector.ts` | GPU detection with safety checks |
| `src/gpu/backends/cuda-backend.ts` | CUDA native addon backend |
| `src/gpu/backends/webgpu-backend.ts` | WebGPU backend |
| `src/gpu/backends/metal-backend.ts` | Apple Metal backend |
| `src/gpu/backend-selector.ts` | Automatic backend selection |
| `external-tools/native/cuda/` | C++ CUDA addon source |
| `scripts/build-native-libs.ps1` | Multi-platform build script |
| ~~`scripts/postinstall.js`~~ (deleted) | npm postinstall (FAISS copy, Metal prompt) |
