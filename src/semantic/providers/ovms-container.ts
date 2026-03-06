/**
 * OVMS Container Management
 *
 * Docker and Native container management for OVMS provider.
 */

import { toError } from "../../utils/error-handling.js";
import type { ProviderLogger } from "./base.js";
import { sleep } from "./ovms-utils.js";

export interface ContainerConfig {
  baseUrl: string;
  isNative: boolean;
  log?: ProviderLogger | undefined;
}

/**
 * Ensure OVMS server is running (Docker or Native)
 */
export async function ensureContainerRunning(config: ContainerConfig): Promise<void> {
  const { baseUrl, isNative, log } = config;

  try {
    // Check if server is already running
    const healthCheck = await fetch(`${baseUrl}/v2/health/ready`, {
      method: "GET",
      signal: AbortSignal.timeout(2000),
    }).catch(() => null);

    if (healthCheck?.ok) {
      log?.debug("OVMS server already running");
      return;
    }

    // Server not responding
    if (isNative) {
      // Native mode: managed by ovms-native-manager, don't try Docker
      throw new Error(
        `OVMS Native not responding at ${baseUrl}.\n` +
          `Native mode is enabled - OVMS should be started by MCP server.\n` +
          `Check logs or run: setup-embedding to reinstall.`,
      );
    }

    // Docker mode: try to start container
    log?.info("OVMS Docker container not running, attempting to start...");

    const { exec } = await import("node:child_process");
    const { promisify } = await import("node:util");
    const execPromise = promisify(exec);

    // Check if container exists
    const { stdout: containerList } = await execPromise(
      'docker ps -a --filter "name=ovms-embedding" --format "{{.Names}}"',
      { windowsHide: true },
    ).catch(() => ({ stdout: "" }));

    if (!containerList.includes("ovms-embedding")) {
      throw new Error("OVMS Docker container 'ovms-embedding' not found. Please run setup script first.");
    }

    // Start the container
    await execPromise("docker start ovms-embedding", { windowsHide: true });
    log?.info("Started OVMS Docker container");

    // Wait for container to be ready
    const maxWaitTime = 30000;
    const startTime = Date.now();
    while (Date.now() - startTime < maxWaitTime) {
      const check = await fetch(`${baseUrl}/v2/health/ready`, {
        method: "GET",
        signal: AbortSignal.timeout(2000),
      }).catch(() => null);

      if (check?.ok) {
        log?.info("OVMS container is ready");
        return;
      }

      await sleep(2000);
    }

    throw new Error("OVMS container started but did not become ready within 30 seconds");
  } catch (error: unknown) {
    const err = toError(error);
    log?.warn("Failed to auto-start OVMS", { error: err.message, isNative });
    if (isNative) {
      throw new Error(`OVMS Native not available: ${err.message}`);
    }
    throw new Error(`OVMS auto-start failed: ${err.message}\nPlease start manually: docker start ovms-embedding`);
  }
}

/**
 * Wait for OVMS server to be ready
 */
export async function waitForReady(baseUrl: string, maxWaitMs: number, log?: ProviderLogger): Promise<void> {
  const startTime = Date.now();
  const checkInterval = 2000;

  log?.info("Waiting for OVMS to be ready...");

  while (Date.now() - startTime < maxWaitMs) {
    try {
      const healthRes = await fetch(`${baseUrl}/v2/health/ready`, {
        method: "GET",
        signal: AbortSignal.timeout(5000),
      });

      if (healthRes.ok) {
        const elapsed = Math.round((Date.now() - startTime) / 1000);
        log?.info("OVMS is ready", { waitedSeconds: elapsed });
        return;
      }
    } catch (error: unknown) {
      const err = toError(error);
      if (!err.message.includes("ECONNREFUSED")) {
        log?.debug("OVMS health check error", { error: err.message });
      }
    }

    await sleep(checkInterval);
  }

  throw new Error(
    `OVMS did not become ready within ${maxWaitMs / 1000} seconds.\n` + `Check: docker logs ovms-embedding`,
  );
}
