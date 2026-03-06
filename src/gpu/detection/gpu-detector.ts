/**
 * GPU Detection System
 *
 * Automatically detects available GPU capabilities:
 * - CUDA (NVIDIA via nvidia-smi or native addon)
 * - WebGPU (All GPUs via adapter query)
 * - Compute Capability (NVIDIA only)
 *
 * Cache results for performance.
 *
 * Environment Variables:
 * - WEBGPU_FORCE_ENABLE=1  - Force enable WebGPU even on unsupported architectures (Blackwell)
 * - WEBGPU_FORCE_DISABLE=1 - Force disable WebGPU detection entirely
 *
 * Known Issues:
 * - NVIDIA Blackwell (CC 12.x, RTX 50xx) causes Dawn/WebGPU crashes
 * - WebGPU is auto-disabled for CC >= 12.0 until Dawn adds support
 */

import { execSync } from "node:child_process";
import { log } from "../../logging/index.js";

// =============================================================================
// CONSTANTS
// =============================================================================

/**
 * Minimum compute capability that causes WebGPU/Dawn crashes
 * Blackwell architecture (RTX 50xx series) = CC 12.0+
 */
const WEBGPU_UNSAFE_MIN_CC = 12.0;

/**
 * Known unstable GPU architectures for WebGPU
 */
const WEBGPU_UNSTABLE_ARCHITECTURES = ["blackwell", "rtx 50", "rtx50"];

// =============================================================================
// WEBGPU TYPE DEFINITIONS
// =============================================================================

interface GPUAdapterInfo {
  vendor?: string;
  device?: string;
  description?: string;
}

interface GPUAdapter {
  requestAdapterInfo?: () => Promise<GPUAdapterInfo>;
  vendor?: string;
  name?: string;
  description?: string;
  limits?: {
    maxBufferSize?: number;
    [key: string]: unknown;
  };
}

interface GPU {
  requestAdapter: (options?: unknown) => Promise<GPUAdapter | null>;
}

interface WebGPUModule {
  GPU?: GPU;
  requestAdapter?: (options?: unknown) => Promise<GPUAdapter | null>;
}

type NavigatorWithGPU = Navigator & {
  gpu?: GPU;
};

export interface GPUInfo {
  vendor: "nvidia" | "amd" | "intel" | "unknown";
  model: string;
  computeCapability?: number | undefined; // NVIDIA only (e.g. 7.5 for GTX 1650 Ti)
  memoryMB: number;
  cudaAvailable: boolean;
  webgpuAvailable: boolean;
  webgpuSkipped?: boolean | undefined; // True if WebGPU was skipped due to unstable architecture
  webgpuSkipReason?: string | undefined; // Reason why WebGPU was skipped
}

export class GPUDetector {
  private static cachedInfo: GPUInfo | null = null;

  /**
   * Detect all available GPU capabilities
   */
  static async detect(): Promise<GPUInfo> {
    if (GPUDetector.cachedInfo) return GPUDetector.cachedInfo;

    const info: GPUInfo = {
      vendor: "unknown",
      model: "Unknown",
      memoryMB: 0,
      cudaAvailable: false,
      webgpuAvailable: false,
    };

    // Check environment overrides
    const forceEnableWebGPU = process.env["WEBGPU_FORCE_ENABLE"] === "1";
    const forceDisableWebGPU = process.env["WEBGPU_FORCE_DISABLE"] === "1";

    // 1. Try CUDA detection (NVIDIA only) - always safe, uses nvidia-smi
    try {
      const cudaInfo = await GPUDetector.detectCUDA();
      if (cudaInfo) {
        info.vendor = "nvidia";
        info.model = cudaInfo.name;
        info.computeCapability = cudaInfo.computeCapability;
        info.memoryMB = cudaInfo.totalMemory;
        info.cudaAvailable = true;

        log.i("GPUDETECT", "cuda_found", {
          model: cudaInfo.name,
          cc: cudaInfo.computeCapability,
          memGB: (cudaInfo.totalMemory / 1024).toFixed(1),
        });
      }
    } catch (_e) {
      log.d("GPUDETECT", "cuda_unavail");
    }

    // 2. Check if WebGPU should be skipped for this GPU
    // Dawn/WebGPU crashes on Blackwell (CC >= 12.0) in all runtimes (Bun, Node)
    const webgpuSafetyCheck = GPUDetector.isWebGPUSafe(info);

    if (forceDisableWebGPU) {
      info.webgpuSkipped = true;
      info.webgpuSkipReason = "Disabled via WEBGPU_FORCE_DISABLE=1";
      log.i("GPUDETECT", "webgpu_disabled", { env: "WEBGPU_FORCE_DISABLE" });
    } else if (!webgpuSafetyCheck.safe && !forceEnableWebGPU) {
      info.webgpuSkipped = true;
      info.webgpuSkipReason = webgpuSafetyCheck.reason;
      log.w("GPUDETECT", "webgpu_skipped", { reason: webgpuSafetyCheck.reason });
      log.i("GPUDETECT", "webgpu_hint", { hint: "set WEBGPU_FORCE_ENABLE=1" });
    } else {
      // 3. Try WebGPU detection (all vendors)
      if (forceEnableWebGPU && !webgpuSafetyCheck.safe) {
        log.w("GPUDETECT", "webgpu_forced", { issue: webgpuSafetyCheck.reason });
      }

      try {
        const webgpuInfo = await GPUDetector.detectWebGPU();
        if (webgpuInfo) {
          info.webgpuAvailable = true;

          // Update vendor/model if CUDA didn't detect
          if (!info.cudaAvailable) {
            info.vendor = GPUDetector.parseVendor(webgpuInfo.vendor);
            info.model = webgpuInfo.adapter;
            info.memoryMB = webgpuInfo.memoryMB;
          }

          log.i("GPUDETECT", "webgpu_avail", {
            vendor: webgpuInfo.vendor,
            adapter: webgpuInfo.adapter,
          });
        }
      } catch (_e) {
        log.d("GPUDETECT", "webgpu_unavail");
      }
    }

    GPUDetector.cachedInfo = info;
    return info;
  }

  /**
   * Check if WebGPU is safe to use on this GPU
   * Returns { safe: true } or { safe: false, reason: string }
   */
  static isWebGPUSafe(info: Partial<GPUInfo>): { safe: boolean; reason?: string } {
    // Check compute capability (NVIDIA Blackwell = CC 12.x)
    if (info.computeCapability && info.computeCapability >= WEBGPU_UNSAFE_MIN_CC) {
      return {
        safe: false,
        reason: `NVIDIA Blackwell architecture (CC ${info.computeCapability}) - Dawn/WebGPU crashes. Wait for webgpu package update.`,
      };
    }

    // Check model name for known unstable architectures
    if (info.model) {
      const modelLower = info.model.toLowerCase();
      for (const pattern of WEBGPU_UNSTABLE_ARCHITECTURES) {
        if (modelLower.includes(pattern)) {
          return {
            safe: false,
            reason: `GPU model "${info.model}" matches unstable architecture pattern "${pattern}"`,
          };
        }
      }
    }

    return { safe: true };
  }

  /**
   * Detect CUDA via nvidia-smi or native addon
   */
  private static async detectCUDA(): Promise<{
    name: string;
    computeCapability: number;
    totalMemory: number;
  } | null> {
    try {
      // Option 1: Try native CUDA addon (if compiled)
      // Skip in bundled builds - use nvidia-smi instead
      if (typeof process !== "undefined" && !process.env["BUNDLED"]) {
        try {
          // Dynamic require to avoid bundler resolution
          const modulePath = "../../../build/Release/cuda_vector_ops.node";
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          const cudaAddon = require(/* webpackIgnore: true */ modulePath);
          const deviceInfo = cudaAddon.getDeviceInfo();

          return {
            name: deviceInfo.name,
            computeCapability: deviceInfo.major + deviceInfo.minor / 10,
            totalMemory: deviceInfo.totalMemory / (1024 * 1024), // bytes → MB
          };
        } catch {
          // Addon not compiled, try nvidia-smi
        }
      }

      // Option 2: nvidia-smi CLI
      const output = execSync("nvidia-smi --query-gpu=name,compute_cap,memory.total --format=csv,noheader,nounits", {
        encoding: "utf8",
        timeout: 2000,
        stdio: ["pipe", "pipe", "ignore"], // Suppress stderr
        windowsHide: true, // Hide console window on Windows
      }).trim();

      if (!output) return null;

      const [name, cc, memory] = output.split(",").map((s) => s.trim());

      return {
        name: name || "Unknown NVIDIA GPU",
        computeCapability: Number.parseFloat(cc || "0"),
        totalMemory: Number.parseInt(memory || "0", 10),
      };
    } catch {
      return null;
    }
  }

  /**
   * Detect WebGPU via webgpu package or browser API
   */
  private static async detectWebGPU(): Promise<{
    vendor: string;
    adapter: string;
    memoryMB: number;
  } | null> {
    try {
      let gpu: GPU | undefined;

      // Try Node.js WebGPU (webgpu package - Dawn/wgpu bindings)
      try {
        const webgpu = (await import("webgpu")) as WebGPUModule;
        // webgpu package exports GPU instance directly
        gpu = webgpu.GPU ? webgpu.GPU : (webgpu as unknown as GPU);
      } catch {
        // Try browser native WebGPU
        if (typeof navigator !== "undefined" && "gpu" in navigator) {
          gpu = (navigator as NavigatorWithGPU).gpu;
        } else {
          return null;
        }
      }

      if (!gpu) return null;

      const adapter = await gpu.requestAdapter();
      if (!adapter) return null;

      // Get adapter info
      let vendor = "unknown";
      let adapterName = "Unknown Adapter";
      let memoryMB = 0;

      try {
        // WebGPU standard API
        const info = await adapter.requestAdapterInfo?.();
        if (info) {
          vendor = info.vendor || vendor;
          adapterName = info.device || info.description || adapterName;
        }
      } catch {
        // Fallback: try getting info from adapter directly
        vendor = adapter.vendor || vendor;
        adapterName = adapter.name || adapter.description || adapterName;
      }

      // Estimate memory from limits
      const limits = adapter.limits;
      if (limits?.maxBufferSize) {
        memoryMB = limits.maxBufferSize / (1024 * 1024);
      }

      return {
        vendor,
        adapter: adapterName,
        memoryMB,
      };
    } catch {
      return null;
    }
  }

  /**
   * Parse vendor string to normalized vendor type
   */
  private static parseVendor(vendor: string): "nvidia" | "amd" | "intel" | "unknown" {
    const v = vendor.toLowerCase();
    if (v.includes("nvidia") || v.includes("0x10de")) return "nvidia";
    if (v.includes("amd") || v.includes("radeon") || v.includes("0x1002")) return "amd";
    if (v.includes("intel") || v.includes("0x8086")) return "intel";
    return "unknown";
  }

  /**
   * Check if specific backend is likely available
   */
  static async checkBackendAvailability(type: "cuda" | "webgpu" | "wasm"): Promise<boolean> {
    const info = await GPUDetector.detect();

    switch (type) {
      case "cuda":
        return info.cudaAvailable && info.vendor === "nvidia";
      case "webgpu":
        return info.webgpuAvailable;
      case "wasm":
        return true; // WASM SIMD always available (with fallback)
      default:
        return false;
    }
  }

  /**
   * Clear cached GPU info (useful for testing)
   */
  static clearCache(): void {
    GPUDetector.cachedInfo = null;
  }

  /**
   * Get current cached info without re-detection
   */
  static getCachedInfo(): GPUInfo | null {
    return GPUDetector.cachedInfo;
  }

  /**
   * Test WebGPU compatibility without actually loading Dawn
   * Safe to call on any architecture
   */
  static async testWebGPUCompatibility(): Promise<{
    cudaDetected: boolean;
    computeCapability: number | null;
    model: string | null;
    webgpuSafe: boolean;
    skipReason: string | null;
    envOverride: "force_enable" | "force_disable" | null;
  }> {
    // Detect CUDA first (always safe)
    let cudaInfo: { name: string; computeCapability: number; totalMemory: number } | null = null;
    try {
      cudaInfo = await GPUDetector.detectCUDA();
    } catch {
      // CUDA not available
    }

    const partialInfo: Partial<GPUInfo> = {
      ...(cudaInfo?.name != null ? { model: cudaInfo.name } : {}),
      ...(cudaInfo?.computeCapability != null ? { computeCapability: cudaInfo.computeCapability } : {}),
    };

    const safetyCheck = GPUDetector.isWebGPUSafe(partialInfo);

    let envOverride: "force_enable" | "force_disable" | null = null;
    if (process.env["WEBGPU_FORCE_ENABLE"] === "1") envOverride = "force_enable";
    if (process.env["WEBGPU_FORCE_DISABLE"] === "1") envOverride = "force_disable";

    return {
      cudaDetected: cudaInfo !== null,
      computeCapability: cudaInfo?.computeCapability ?? null,
      model: cudaInfo?.name ?? null,
      webgpuSafe: safetyCheck.safe,
      skipReason: safetyCheck.reason ?? null,
      envOverride,
    };
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

export { WEBGPU_UNSAFE_MIN_CC, WEBGPU_UNSTABLE_ARCHITECTURES };
