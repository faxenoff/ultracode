/**
 * UltraCode Skills Installer for Claude Code
 *
 * Automatically installs UltraCode Skills to ~/.claude/skills/
 * Skills are auto-activated by Claude Code based on description triggers.
 *
 * Features:
 * - Version tracking via manifest.json
 * - Automatic updates when package version is newer
 * - Non-blocking installation at MCP server startup
 *
 * @module skills-installer
 */

import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { log } from "./logging/index.js";

/**
 * Manifest structure for version tracking
 */
interface SkillsManifest {
  name: string;
  version: string;
  description: string;
  skills: Array<{
    name: string;
    description: string;
  }>;
  minClaudeCodeVersion?: string;
  updatedAt: string;
}

/**
 * Installed manifest with additional metadata
 */
interface InstalledManifest extends SkillsManifest {
  installedAt: string;
  installedFrom: string;
}

const MANIFEST_FILE = "manifest.json";
const INSTALLED_MANIFEST_FILE = ".ultracode-installed.json";

/**
 * Get the package's claude-skills directory path
 */
function getPackageSkillsDir(): string {
  const currentFile = fileURLToPath(import.meta.url);
  const srcDir = dirname(currentFile);
  const packageRoot = dirname(srcDir);
  return join(packageRoot, "claude-skills");
}

/**
 * Get the user's Claude skills directory (~/.claude/skills/)
 */
function getUserSkillsDir(): string {
  return join(homedir(), ".claude", "skills");
}

/**
 * Get the user's Claude directory (~/.claude/)
 */
function getUserClaudeDir(): string {
  return join(homedir(), ".claude");
}

/**
 * Parse semantic version string to comparable number
 */
function parseVersion(version: string): number {
  const parts = version.split(".").map((p) => parseInt(p, 10) || 0);
  return (parts[0] || 0) * 10000 + (parts[1] || 0) * 100 + (parts[2] || 0);
}

/**
 * Compare two version strings
 * @returns positive if v1 > v2, negative if v1 < v2, 0 if equal
 */
function compareVersions(v1: string, v2: string): number {
  return parseVersion(v1) - parseVersion(v2);
}

/**
 * Read manifest from package
 */
function readPackageManifest(): SkillsManifest | null {
  const manifestPath = join(getPackageSkillsDir(), MANIFEST_FILE);
  if (!existsSync(manifestPath)) {
    return null;
  }
  try {
    const content = readFileSync(manifestPath, "utf-8");
    return JSON.parse(content) as SkillsManifest;
  } catch {
    return null;
  }
}

/**
 * Read installed manifest from user's Claude directory
 */
function readInstalledManifest(): InstalledManifest | null {
  const manifestPath = join(getUserClaudeDir(), INSTALLED_MANIFEST_FILE);
  if (!existsSync(manifestPath)) {
    return null;
  }
  try {
    const content = readFileSync(manifestPath, "utf-8");
    return JSON.parse(content) as InstalledManifest;
  } catch {
    return null;
  }
}

/**
 * Write installed manifest to user's Claude directory
 */
function writeInstalledManifest(manifest: SkillsManifest, packagePath: string): void {
  const claudeDir = getUserClaudeDir();
  if (!existsSync(claudeDir)) {
    mkdirSync(claudeDir, { recursive: true });
  }

  const installedManifest: InstalledManifest = {
    ...manifest,
    installedAt: new Date().toISOString(),
    installedFrom: packagePath,
  };

  const manifestPath = join(claudeDir, INSTALLED_MANIFEST_FILE);
  writeFileSync(manifestPath, JSON.stringify(installedManifest, null, 2), "utf-8");
}

/**
 * Check if skills need to be updated based on version comparison
 */
function needsUpdate(
  packageManifest: SkillsManifest,
  installedManifest: InstalledManifest | null,
): {
  needsUpdate: boolean;
  reason: string;
} {
  if (!installedManifest) {
    return { needsUpdate: true, reason: "not_installed" };
  }

  const versionDiff = compareVersions(packageManifest.version, installedManifest.version);
  if (versionDiff > 0) {
    return {
      needsUpdate: true,
      reason: `version_upgrade:${installedManifest.version}->${packageManifest.version}`,
    };
  }

  // Check if updatedAt changed (same version but content updated)
  if (packageManifest.updatedAt !== installedManifest.updatedAt) {
    return {
      needsUpdate: true,
      reason: `content_updated:${installedManifest.updatedAt}->${packageManifest.updatedAt}`,
    };
  }

  return { needsUpdate: false, reason: "up_to_date" };
}

/**
 * Copy a directory recursively
 */
function copyDirSync(source: string, target: string): void {
  if (!existsSync(target)) {
    mkdirSync(target, { recursive: true });
  }

  const entries = readdirSync(source);
  for (const entry of entries) {
    const sourcePath = join(source, entry);
    const targetPath = join(target, entry);

    const stat = statSync(sourcePath);
    if (stat.isDirectory()) {
      copyDirSync(sourcePath, targetPath);
    } else {
      copyFileSync(sourcePath, targetPath);
    }
  }
}

/**
 * Remove old skills that are no longer in manifest
 */
function removeOldSkills(installedManifest: InstalledManifest | null, packageManifest: SkillsManifest): string[] {
  if (!installedManifest) return [];

  const userSkillsDir = getUserSkillsDir();
  const currentSkillNames = new Set(packageManifest.skills.map((s) => s.name));
  const removed: string[] = [];

  for (const skill of installedManifest.skills) {
    if (!currentSkillNames.has(skill.name)) {
      const skillDir = join(userSkillsDir, skill.name);
      if (existsSync(skillDir)) {
        try {
          rmSync(skillDir, { recursive: true, force: true });
          removed.push(skill.name);
        } catch {
          // Ignore removal errors
        }
      }
    }
  }

  return removed;
}

/**
 * Install UltraCode Skills to ~/.claude/skills/
 *
 * This function is called at MCP server startup and:
 * 1. Checks manifest version against installed version
 * 2. Skips if already up-to-date
 * 3. Updates skills if package version is newer
 * 4. Removes old skills that are no longer in manifest
 *
 * @returns Object with installation status
 */
export async function installSkillsIfNeeded(): Promise<{
  action: "installed" | "updated" | "skipped";
  version: string;
  skills: string[];
  reason: string;
  removed?: string[];
}> {
  const packageSkillsDir = getPackageSkillsDir();
  const userSkillsDir = getUserSkillsDir();

  // Read package manifest
  const packageManifest = readPackageManifest();
  if (!packageManifest) {
    log.w("SKILLS", "manifest_not_found", { path: packageSkillsDir });
    return {
      action: "skipped",
      version: "unknown",
      skills: [],
      reason: "manifest_not_found",
    };
  }

  // Read installed manifest
  const installedManifest = readInstalledManifest();

  // Check if update needed
  const updateCheck = needsUpdate(packageManifest, installedManifest);

  if (!updateCheck.needsUpdate) {
    log.t("SKILLS", "up_to_date", { version: packageManifest.version });
    return {
      action: "skipped",
      version: packageManifest.version,
      skills: packageManifest.skills.map((s) => s.name),
      reason: updateCheck.reason,
    };
  }

  // Ensure user skills directory exists
  if (!existsSync(userSkillsDir)) {
    try {
      mkdirSync(userSkillsDir, { recursive: true });
    } catch (error) {
      log.e("SKILLS", "mkdir_failed", { path: userSkillsDir, err: (error as Error).message });
      return {
        action: "skipped",
        version: packageManifest.version,
        skills: [],
        reason: `mkdir_failed: ${(error as Error).message}`,
      };
    }
  }

  // Remove old skills that are no longer in manifest
  const removed = removeOldSkills(installedManifest, packageManifest);

  // Install each skill
  const installedSkills: string[] = [];
  for (const skill of packageManifest.skills) {
    const sourceDir = join(packageSkillsDir, skill.name);
    const targetDir = join(userSkillsDir, skill.name);

    if (!existsSync(sourceDir)) {
      log.w("SKILLS", "skill_source_not_found", { skill: skill.name });
      continue;
    }

    try {
      // Remove existing skill directory for clean update
      if (existsSync(targetDir)) {
        rmSync(targetDir, { recursive: true, force: true });
      }
      copyDirSync(sourceDir, targetDir);
      installedSkills.push(skill.name);
    } catch (error) {
      log.e("SKILLS", "skill_install_failed", { skill: skill.name, err: (error as Error).message });
    }
  }

  // Write installed manifest
  writeInstalledManifest(packageManifest, packageSkillsDir);

  const action = installedManifest ? "updated" : "installed";
  log.i("SKILLS", action, {
    version: packageManifest.version,
    skills: installedSkills,
    reason: updateCheck.reason,
    ...(removed.length > 0 ? { removed } : {}),
  });

  return {
    action,
    version: packageManifest.version,
    skills: installedSkills,
    reason: updateCheck.reason,
    ...(removed.length > 0 ? { removed } : {}),
  };
}

/**
 * Get current installation status
 */
export function getInstallationStatus(): {
  installed: boolean;
  version: string | null;
  installedAt: string | null;
  skills: string[];
  packageVersion: string | null;
  needsUpdate: boolean;
  updateReason: string;
} {
  const packageManifest = readPackageManifest();
  const installedManifest = readInstalledManifest();

  if (!installedManifest) {
    return {
      installed: false,
      version: null,
      installedAt: null,
      skills: [],
      packageVersion: packageManifest?.version ?? null,
      needsUpdate: true,
      updateReason: "not_installed",
    };
  }

  const updateCheck = packageManifest
    ? needsUpdate(packageManifest, installedManifest)
    : { needsUpdate: false, reason: "package_not_found" };

  return {
    installed: true,
    version: installedManifest.version,
    installedAt: installedManifest.installedAt,
    skills: installedManifest.skills.map((s) => s.name),
    packageVersion: packageManifest?.version ?? null,
    needsUpdate: updateCheck.needsUpdate,
    updateReason: updateCheck.reason,
  };
}

/**
 * Force reinstall skills (ignore version check)
 */
export async function forceReinstallSkills(): Promise<{
  success: boolean;
  version: string;
  skills: string[];
  error?: string;
}> {
  const claudeDir = getUserClaudeDir();

  // Remove installed manifest to force reinstall
  const installedManifestPath = join(claudeDir, INSTALLED_MANIFEST_FILE);
  if (existsSync(installedManifestPath)) {
    try {
      rmSync(installedManifestPath);
    } catch {
      // Ignore
    }
  }

  // Run normal install
  const result = await installSkillsIfNeeded();
  return {
    success: result.action !== "skipped" || result.reason === "up_to_date",
    version: result.version,
    skills: result.skills,
    ...(result.action === "skipped" && result.reason !== "up_to_date" ? { error: result.reason } : {}),
  };
}

/**
 * Uninstall all UltraCode skills
 */
export function uninstallSkills(): { removed: string[]; errors: string[] } {
  const userSkillsDir = getUserSkillsDir();
  const claudeDir = getUserClaudeDir();
  const result = { removed: [] as string[], errors: [] as string[] };

  const installedManifest = readInstalledManifest();
  if (!installedManifest) {
    return result;
  }

  // Remove each skill
  for (const skill of installedManifest.skills) {
    const skillDir = join(userSkillsDir, skill.name);
    if (existsSync(skillDir)) {
      try {
        rmSync(skillDir, { recursive: true, force: true });
        result.removed.push(skill.name);
      } catch (error) {
        result.errors.push(`${skill.name}: ${(error as Error).message}`);
      }
    }
  }

  // Remove installed manifest
  const installedManifestPath = join(claudeDir, INSTALLED_MANIFEST_FILE);
  if (existsSync(installedManifestPath)) {
    try {
      rmSync(installedManifestPath);
    } catch {
      // Ignore
    }
  }

  if (result.removed.length > 0) {
    log.i("SKILLS", "uninstalled", { skills: result.removed });
  }

  return result;
}
