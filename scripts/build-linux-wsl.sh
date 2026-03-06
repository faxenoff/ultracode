#!/bin/bash
set -e

echo "=== WSL CUDA Build Script ==="
echo ""
echo "Usage: $0 [--clean] [--faiss-cpu] [--faiss-gpu] [--no-cuda]"
echo "  --clean      Clean previous build"
echo "  --faiss-cpu  Enable native FAISS CPU (replaces faiss-napi)"
echo "  --faiss-gpu  Enable FAISS GPU (requires FAISS GPU libs)"
echo "  --no-cuda    Build without CUDA (FAISS CPU only, no GPU ops)"
echo ""

# Get the script directory and project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
CUDA_SRC="$PROJECT_ROOT/external-tools/native/cuda"
OUTPUT_DIR="$PROJECT_ROOT/external-libs/cuda-linux-x64"
FAISS_LIB_DIR="$PROJECT_ROOT/external-libs/faiss-gpu-linux-x64"

CLEAN=false
FAISS_CPU=false
FAISS_GPU=false
NO_CUDA=false
CMAKE_DEFINES=""

# Parse args
while [[ $# -gt 0 ]]; do
    case $1 in
        --clean) CLEAN=true; shift ;;
        --faiss-cpu) FAISS_CPU=true; shift ;;
        --faiss-gpu) FAISS_GPU=true; shift ;;
        --no-cuda) NO_CUDA=true; shift ;;
        *) echo "Unknown option: $1"; exit 1 ;;
    esac
done

echo "Project root: $PROJECT_ROOT"
echo "CUDA source: $CUDA_SRC"
echo "Options: clean=$CLEAN faiss-cpu=$FAISS_CPU faiss-gpu=$FAISS_GPU no-cuda=$NO_CUDA"
echo ""

# Check prerequisites
echo "Checking prerequisites..."

if ! command -v cmake &> /dev/null; then
    echo "ERROR: cmake not found!"
    echo "Install with: sudo apt-get update && sudo apt-get install -y cmake build-essential"
    exit 1
fi
echo "✓ cmake found"

if [ "$NO_CUDA" = false ]; then
    if ! command -v nvcc &> /dev/null; then
        echo "ERROR: CUDA (nvcc) not found!"
        echo "Install with: sudo apt-get install -y nvidia-cuda-toolkit"
        echo "Or use --no-cuda for CPU-only FAISS build"
        exit 1
    fi
    echo "✓ nvcc found: $(nvcc --version | grep release)"
fi

if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js not found!"
    echo "Install with: curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash - && sudo apt-get install -y nodejs"
    exit 1
fi
echo "✓ node found: $(node --version)"

# Clean if requested
if [ "$CLEAN" = true ]; then
    echo ""
    echo "Cleaning previous build..."
    rm -rf "$CUDA_SRC/build"
fi

# Install dependencies
cd "$PROJECT_ROOT"
if [ ! -d "node_modules/node-addon-api" ]; then
    echo ""
    echo "Installing node-addon-api..."
    npm install node-addon-api
fi

# Build CMake defines
if [ "$FAISS_CPU" = true ]; then
    CMAKE_DEFINES="$CMAKE_DEFINES --CDENABLE_FAISS_CPU=ON"
    # Check FAISS libs
    if [ -d "$FAISS_LIB_DIR/lib" ]; then
        CMAKE_DEFINES="$CMAKE_DEFINES --CDFAISS_ROOT=$FAISS_LIB_DIR"
        echo "✓ FAISS libs found at: $FAISS_LIB_DIR"
    else
        echo "WARNING: FAISS libs not found at $FAISS_LIB_DIR"
        echo "Attempting system FAISS (apt: libfaiss-dev)..."
    fi
fi

if [ "$FAISS_GPU" = true ]; then
    CMAKE_DEFINES="$CMAKE_DEFINES --CDENABLE_FAISS_GPU=ON"
fi

# Build
cd "$CUDA_SRC"
echo ""
echo "Building CUDA addon..."
if [ -n "$CMAKE_DEFINES" ]; then
    echo "CMake defines: $CMAKE_DEFINES"
fi
npx cmake-js compile $CMAKE_DEFINES

# Copy output
mkdir -p "$OUTPUT_DIR"
if [ -f "build/Release/ultracode_cuda.node" ]; then
    cp build/Release/ultracode_cuda.node "$OUTPUT_DIR/"
elif [ -f "build/Debug/ultracode_cuda.node" ]; then
    cp build/Debug/ultracode_cuda.node "$OUTPUT_DIR/"
elif [ -f "build/ultracode_cuda.node" ]; then
    cp build/ultracode_cuda.node "$OUTPUT_DIR/"
else
    echo ""
    echo "ERROR: Build output not found!"
    echo "Contents of build directory:"
    find build -name "*.node" 2>/dev/null || echo "No .node files found"
    exit 1
fi

# Copy FAISS shared libs if project-local FAISS available
if [ "$FAISS_CPU" = true ] && [ -d "$FAISS_LIB_DIR/lib" ]; then
    echo ""
    echo "Copying FAISS shared libraries from project..."
    cp "$FAISS_LIB_DIR"/lib/libfaiss*.so* "$OUTPUT_DIR/" 2>/dev/null || true
    echo "Copied FAISS libs to $OUTPUT_DIR/"
fi

# Copy runtime .so dependencies (required when FAISS is statically linked)
if [ "$FAISS_CPU" = true ]; then
    echo ""
    echo "Copying runtime .so dependencies..."
    for lib in libopenblas.so.0 libgfortran.so.5 libgomp.so.1; do
        src="/lib/x86_64-linux-gnu/$lib"
        if [ -f "$src" ]; then
            cp "$src" "$OUTPUT_DIR/"
            echo "  copied $lib"
        fi
    done
fi

echo ""
echo "SUCCESS: Built Linux CUDA addon"
ls -lh "$OUTPUT_DIR/"
echo ""
echo "Features:"
[ "$FAISS_CPU" = true ] && echo "  ✓ Native FAISS CPU (replaces faiss-napi)" || echo "  ✗ No FAISS CPU"
[ "$FAISS_GPU" = true ] && echo "  ✓ FAISS GPU" || echo "  ✗ No FAISS GPU"
[ "$NO_CUDA" = false ] && echo "  ✓ CUDA vector ops" || echo "  ✗ No CUDA (CPU only)"
