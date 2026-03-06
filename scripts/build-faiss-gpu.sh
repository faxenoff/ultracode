#!/bin/bash
# Build FAISS from source with GPU support (Linux/WSL)
#
# Usage:
#   ./scripts/build-faiss-gpu.sh
#   ./scripts/build-faiss-gpu.sh --clean
#   ./scripts/build-faiss-gpu.sh --tag v1.11.0

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BUILD_DIR="$PROJECT_ROOT/build/faiss-gpu"
FAISS_SOURCE="$BUILD_DIR/faiss"
INSTALL_DIR="$PROJECT_ROOT/external-libs/faiss-gpu-linux-x64"

FAISS_TAG="${FAISS_TAG:-v1.14.1}"
CUDA_ARCH="${CUDA_ARCH:-75;80;86;89;90;100;120}"
CLEAN=false

# Parse args
while [[ $# -gt 0 ]]; do
  case $1 in
    --clean) CLEAN=true; shift ;;
    --tag) FAISS_TAG="$2"; shift 2 ;;
    --arch) CUDA_ARCH="$2"; shift 2 ;;
    *) echo "Unknown option: $1"; exit 1 ;;
  esac
done

echo ""
echo "[FAISS-GPU Build] Starting FAISS GPU build..."
echo "[FAISS-GPU Build] Tag: $FAISS_TAG, CUDA Architectures: $CUDA_ARCH"

# Check prerequisites
echo "[FAISS-GPU Build] Checking prerequisites..."

# CUDA
if ! command -v nvcc &> /dev/null; then
  if [ -n "${CUDA_PATH:-}" ] && [ -f "$CUDA_PATH/bin/nvcc" ]; then
    export PATH="$CUDA_PATH/bin:$PATH"
  else
    echo "[FAISS-GPU Build] ERROR: nvcc not found. Install CUDA Toolkit."
    exit 1
  fi
fi
echo "[FAISS-GPU Build] Found CUDA: $(nvcc --version | grep release)"

# CMake
if ! command -v cmake &> /dev/null; then
  echo "[FAISS-GPU Build] ERROR: cmake not found."
  exit 1
fi
echo "[FAISS-GPU Build] Found CMake: $(cmake --version | head -1)"

# Clean
if $CLEAN && [ -d "$BUILD_DIR" ]; then
  echo "[FAISS-GPU Build] Cleaning previous build..."
  rm -rf "$BUILD_DIR"
fi

mkdir -p "$BUILD_DIR"

# Clone FAISS
if [ ! -d "$FAISS_SOURCE" ]; then
  echo "[FAISS-GPU Build] Cloning facebook/faiss ($FAISS_TAG)..."
  git clone --depth 1 --branch "$FAISS_TAG" https://github.com/facebookresearch/faiss.git "$FAISS_SOURCE"
else
  echo "[FAISS-GPU Build] FAISS source already present"
fi

# Configure
echo "[FAISS-GPU Build] Configuring CMake..."
cmake_build_dir="$FAISS_SOURCE/build"
mkdir -p "$cmake_build_dir"

cmake -S "$FAISS_SOURCE" -B "$cmake_build_dir" \
  -DCMAKE_BUILD_TYPE=Release \
  -DFAISS_ENABLE_GPU=ON \
  -DFAISS_ENABLE_PYTHON=OFF \
  -DBUILD_TESTING=OFF \
  -DBUILD_SHARED_LIBS=ON \
  -DCMAKE_CUDA_ARCHITECTURES="$CUDA_ARCH" \
  -DFAISS_OPT_LEVEL=avx2 \
  -DCMAKE_INSTALL_PREFIX="$INSTALL_DIR"

# Build
echo "[FAISS-GPU Build] Building (this may take a while)..."
cmake --build "$cmake_build_dir" --config Release -j "$(nproc)"

# Install
echo "[FAISS-GPU Build] Installing to $INSTALL_DIR..."
mkdir -p "$INSTALL_DIR"
cmake --install "$cmake_build_dir" --config Release

# Verify
echo ""
echo "[FAISS-GPU Build] Verifying output..."
find "$INSTALL_DIR" -name "libfaiss*" -o -name "faiss*" 2>/dev/null | head -20

echo ""
echo "[FAISS-GPU Build] SUCCESS! FAISS GPU libraries installed to: $INSTALL_DIR"
echo "[FAISS-GPU Build] Done!"
