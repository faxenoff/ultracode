#!/bin/bash
# Build CUDA+FAISS addon for Linux inside WSL
#
# This script runs INSIDE WSL. Invoke it from Windows via:
#   wsl -d Ubuntu-24.04 -e bash /mnt/d/github/ultracode/scripts/_build-linux-wsl-run.sh [--clean]
#
# Or use the .cmd wrapper from Windows shell:
#   scripts\_build-linux-wsl-run.cmd [--clean]
#
# Prerequisites (one-time in WSL):
#   sudo apt-get install -y cmake build-essential libfaiss-dev libopenblas-dev
#   CUDA Toolkit must be installed (e.g. cuda-toolkit-13-1)

set -e

# Setup CUDA paths
if [ -d "/usr/local/cuda" ]; then
    export PATH="/usr/local/cuda/bin:$PATH"
    export CUDA_PATH="/usr/local/cuda"
    export LD_LIBRARY_PATH="/usr/local/cuda/lib64:${LD_LIBRARY_PATH:-}"
fi

echo "=== WSL Linux Build: CUDA + FAISS CPU ==="
echo "nvcc: $(/usr/local/cuda/bin/nvcc --version 2>&1 | grep release || echo 'not found')"
echo "node: $(node --version 2>&1 || echo 'not found')"
echo "cmake: $(cmake --version 2>&1 | head -1 || echo 'not found')"
echo ""

# Resolve project root from script location
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "Project root: $PROJECT_ROOT"
echo ""

cd "$PROJECT_ROOT"
bash scripts/build-linux-wsl.sh --faiss-cpu "$@"
