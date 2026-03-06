import { defineConfig } from "tsup";

// Build mode: "dev" (default) or "package" (for npm publishing)
// dev: sourcemaps, no minification
// package: minification, no sourcemaps
const BUILD_MODE = process.env.BUILD_MODE || "dev";
const isPackageMode = BUILD_MODE === "package";

// Common external dependencies (for reference, actual externals are in noExternal: false)
const _EXTERNAL_DEPS = ["@modelcontextprotocol/sdk", "@lenml/tokenizers"];

// Common esbuild options (kept for potential future use)
const _commonEsbuildOptions = (options: any) => {
  options.logOverride = {
    ...options.logOverride,
    "direct-eval": "silent",
    "import-is-undefined": "silent",
  };
  options.loader = {
    ...options.loader,
    ".wasm": "file",
  };
};

export default defineConfig([
  // Main MCP server
  {
    entry: {
      index: "src/index.ts",
      "pipe-preload": "src/pipe-preload.ts", // Quiet mode entry point for --pipe
      "bun-proxy": "src/bun-proxy.ts", // Lightweight proxy for Claude's Bun
    },
    outDir: "dist",
    sourcemap: !isPackageMode, // Sourcemaps only in dev mode
    clean: false, // Don't clean - preserve WASM and native modules
    format: ["esm"],
    platform: "node",
    target: "node24",
    shims: false,

    // Optimizations - enable splitting for dynamic imports
    splitting: true,
    minify: isPackageMode, // Minify only for npm package
    treeshake: true,

    // Suppress warnings and configure loaders
    esbuildOptions(options) {
      options.logOverride = {
        ...options.logOverride,
        "direct-eval": "silent", // Suppress eval warnings from third-party dependencies (onnxruntime-web)
        "import-is-undefined": "silent", // Suppress wasm-bindgen __wbindgen_start warnings
      };
      // Add loader for WASM files
      options.loader = {
        ...options.loader,
        ".wasm": "file",
      };
      // Name chunks by content for better caching and debugging
      // Lazy-loaded handlers will be split into separate chunks
      options.chunkNames = "chunks/[name]-[hash]";
    },

    // Bundle size optimizations
    external: [
      // Keep heavy dependencies external to reduce memory footprint
      "@modelcontextprotocol/sdk",

      // Bun runtime modules (not available in Node.js)
      "bun:sqlite",

      // Native modules with dynamic requires - must not be bundled
      "faiss-napi", // Legacy fallback (faiss-client.ts) - main path uses native addon
      "@lenml/tokenizers", // Lightweight tokenizer for OVMS provider
    ],

    // Type generation
    dts: {
      resolve: true,
    },

    // Ensure executable permissions for CLI and copy binaries
    onSuccess: async () => {
      const { chmod, copyFile, access, mkdir } = await import("node:fs/promises");
      const { join } = await import("node:path");

      if (process.platform !== "win32") {
        await chmod("./dist/index.js", 0o755);
      }

      // Copy Cosmopolitan binary if it exists (built separately)
      const commSource = join("src", "comm", "ultracode.com");
      const commDest = join("dist", "ultracode.com");
      const cmdDest = join("dist", "ultracode.cmd");
      try {
        await access(commSource);
        await copyFile(commSource, commDest);
        if (process.platform !== "win32") {
          await chmod(commDest, 0o755);
        }
        console.log("[tsup] Copied ultracode.com to dist/");

        // Generate .cmd wrapper for Windows (Claude Code doesn't recognize .com)
        const { writeFile } = await import("node:fs/promises");
        await writeFile(cmdDest, '@echo off\r\n"%~dp0ultracode.com" %*\r\n');
        console.log("[tsup] Generated ultracode.cmd wrapper");
      } catch {
        // Binary not built yet - that's fine, it's optional
      }

      // Copy gRPC proto files for OVMS provider
      const protoDir = join("dist", "semantic", "providers", "proto");
      const protoSource = join("src", "semantic", "providers", "proto", "grpc_predict_v2.proto");
      const protoDest = join(protoDir, "grpc_predict_v2.proto");
      try {
        await mkdir(protoDir, { recursive: true });
        await copyFile(protoSource, protoDest);
        console.log("[tsup] Copied gRPC proto files to dist/");
      } catch (e: any) {
        console.warn("[tsup] Proto copy warning:", e.message);
      }

      // Copy pattern rules and exemplars YAML files
      const patternsSrc = join("src", "analysis", "patterns");
      const patternsDstChunks = join("dist", "chunks");
      for (const subdir of ["rules", "exemplars"]) {
        const src = join(patternsSrc, subdir);
        const dst = join(patternsDstChunks, subdir);
        try {
          await mkdir(dst, { recursive: true });
          const { readdirSync } = await import("node:fs");
          for (const f of readdirSync(src).filter((f) => f.endsWith(".yaml") || f.endsWith(".yml"))) {
            await copyFile(join(src, f), join(dst, f));
          }
          console.log(`[tsup] Copied pattern ${subdir}/ to dist/chunks/${subdir}/`);
        } catch (e: any) {
          console.warn(`[tsup] Pattern ${subdir} copy warning:`, e.message);
        }
      }

      // Copy prompts/ markdown files for get_help tool
      const promptsSrc = join("prompts");
      const promptsDst = join("dist", "prompts");
      try {
        await mkdir(promptsDst, { recursive: true });
        const { readdirSync } = await import("node:fs");
        for (const f of readdirSync(promptsSrc).filter((f) => f.endsWith(".md"))) {
          await copyFile(join(promptsSrc, f), join(promptsDst, f));
        }
        console.log("[tsup] Copied prompts/ to dist/prompts/");
      } catch (e: any) {
        console.warn("[tsup] Prompts copy warning:", e.message);
      }

      // Copy CUDA addon + DLLs from external-libs/ to dist/native/cuda/
      const { cpSync, existsSync, readdirSync } = await import("node:fs");
      const { resolve } = await import("node:path");

      const plat = process.platform === "win32" ? "win32" : "linux";
      const cudaSrc = resolve("external-libs", `cuda-${plat}-x64`);
      const cudaDst = join("dist", "native", "cuda");
      const cudaNode = join(cudaSrc, "ultracode_cuda.node");

      if (existsSync(cudaNode)) {
        try {
          await mkdir(cudaDst, { recursive: true });
          const files = readdirSync(cudaSrc).filter(
            (f) => f.endsWith(".node") || f.endsWith(".dll") || f.includes(".so"),
          );
          for (const f of files) {
            await copyFile(join(cudaSrc, f), join(cudaDst, f));
          }
          console.log(`[tsup] Copied CUDA addon + ${files.length - 1} libs to dist/native/cuda/`);
        } catch (e: any) {
          console.warn("[tsup] CUDA addon copy warning:", e.message);
        }
      } else {
        console.log("[tsup] CUDA addon not found (optional — run scripts/build-cuda.ps1 to build)");
      }

      // Copy Roslyn addon if available (built by scripts/build-roslyn)
      const addonDst = join("dist", "roslyn-addon");
      const addonDll = join(addonDst, "UltraCode.CSharp.dll");

      if (existsSync(addonDll)) {
        // Already built by build-roslyn scripts — nothing to copy
        console.log("[tsup] Roslyn addon already in dist/roslyn-addon/ (built by build-roslyn)");
      } else {
        // Fallback: try external-libs
        const fallbackSrc = resolve("external-libs", "roslyn-addon");
        if (existsSync(fallbackSrc)) {
          try {
            await mkdir(addonDst, { recursive: true });
            cpSync(fallbackSrc, addonDst, { recursive: true });
            console.log(`[tsup] Copied Roslyn addon from ${fallbackSrc} to dist/roslyn-addon/`);
          } catch (e: any) {
            console.warn("[tsup] Roslyn addon copy warning:", e.message);
          }
        } else {
          console.log("[tsup] Roslyn addon not found (optional — run scripts/build-roslyn to build)");
        }
      }
    },
  },

  // Worker threads - separate builds for isolated execution
  // Generic language worker replaces individual language workers
  {
    entry: {
      "agents/workers/generic-language-worker": "src/agents/workers/generic-language-worker.ts",
    },
    outDir: "dist",
    sourcemap: !isPackageMode,
    format: ["esm"],
    platform: "node",
    target: "node24",
    shims: false,
    splitting: false,
    minify: isPackageMode,
    treeshake: true,
    silent: true, // Suppress tsup output including warnings

    // Suppress warnings and configure loaders
    esbuildOptions(options) {
      options.logOverride = {
        ...options.logOverride,
        "direct-eval": "silent",
        "import-is-undefined": "silent", // Suppress wasm-bindgen warnings
      };
      // Add loader for WASM files
      options.loader = {
        ...options.loader,
        ".wasm": "file",
      };
      // Suppress tree-shaking warnings about unused external imports (from TypeScript compiler)
      options.logLevel = "error";
      options.drop = ["console"]; // Remove console.* in worker for cleaner output
    },

    // Mark fs as external to avoid "unused import" warnings from tree-shaking
    // Some dependencies import from "fs", others from "node:fs" - need both
    // TypeScript compiler must be external - uses dynamic require("fs") internally
    external: [
      "fs",
      "node:fs",
      "typescript", // Must be external - uses require("fs") internally which fails in ESM bundle
      "@modelcontextprotocol/sdk",
      "@lenml/tokenizers",
    ],

    // No DTS for workers
    dts: false,
  },

  // GPU worker - Unified Node.js subprocess for Faiss + CUDA operations
  // Runs under Node.js (not Bun) for native module compatibility
  {
    entry: {
      "semantic/gpu/gpu-worker": "src/semantic/gpu/gpu-worker.ts",
    },
    outDir: "dist",
    sourcemap: !isPackageMode,
    format: ["esm"],
    platform: "node",
    target: "node22", // Node.js target (native module compatibility)
    shims: false,
    splitting: false, // Single file for subprocess
    minify: isPackageMode,
    treeshake: true,
    silent: true,

    esbuildOptions(options) {
      options.logOverride = {
        ...options.logOverride,
        "direct-eval": "silent",
        "import-is-undefined": "silent",
      };
    },

    external: [
      "faiss-napi", // Legacy fallback - main path uses native FAISS addon
      // CUDA addon (ultracode_cuda.node) is loaded via require() at runtime, not bundled
    ],

    dts: false,
  },

  // CLI ulog command - log query utility
  {
    entry: {
      "cli/log-query/log-query-cli": "src/cli/log-query/log-query-cli.ts",
    },
    outDir: "dist",
    sourcemap: !isPackageMode,
    format: ["esm"],
    platform: "node",
    target: "node24",
    shims: false,
    splitting: false,
    minify: isPackageMode,
    treeshake: true,
    silent: true,

    esbuildOptions(options) {
      options.logOverride = {
        ...options.logOverride,
        "direct-eval": "silent",
        "import-is-undefined": "silent",
      };
    },

    external: ["@modelcontextprotocol/sdk"],

    dts: false,
  },

  // CLI setup command - used by setup-embeddings scripts
  {
    entry: {
      "cli/setup-command": "src/cli/setup-command.ts",
    },
    outDir: "dist",
    sourcemap: !isPackageMode,
    format: ["esm"],
    platform: "node",
    target: "node24",
    shims: false,
    splitting: false, // Single file for CLI
    minify: isPackageMode,
    treeshake: true,
    silent: true,

    esbuildOptions(options) {
      options.logOverride = {
        ...options.logOverride,
        "direct-eval": "silent",
        "import-is-undefined": "silent",
      };
    },

    external: ["@modelcontextprotocol/sdk", "@lenml/tokenizers"],

    dts: false,
  },

  // SIMD utilities - separate build for benchmarking
  {
    entry: {
      "utils/simd-vector-ops": "src/utils/simd-vector-ops.ts",
    },
    outDir: "dist",
    sourcemap: !isPackageMode,
    format: ["esm"],
    platform: "node",
    target: "node24",
    shims: false,
    splitting: false,
    minify: isPackageMode,
    treeshake: true,

    // Suppress warnings and configure loaders
    esbuildOptions(options) {
      options.logOverride = {
        ...options.logOverride,
        "direct-eval": "silent",
        "import-is-undefined": "silent", // Suppress wasm-bindgen warnings
      };
      // Add loader for WASM files
      options.loader = {
        ...options.loader,
        ".wasm": "file",
      };
    },

    dts: false,
  },

  // NOTE: Commer (lightweight proxy) is now built as Cosmopolitan C binary
  // See src/comm/ for the portable ultracode.com binary
  // Build with: npm run build:comm

  // NOTE: Old src/core/index.ts IPC server is deprecated
  // We now use pipe transport in main src/index.ts (MCP JSON-RPC over Named Pipe)
]);
