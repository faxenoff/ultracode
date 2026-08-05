---
module_name: hooks
description: "Git hook installation and pre-commit documentation reference validation"
status: active
language: typescript
---

# Hooks

> Installs and manages Git pre-commit hooks that validate documentation references before commits, ensuring no broken links are committed to the repository.

## Overview

The hooks module provides two complementary capabilities: a hook installer that manages the lifecycle of Git pre-commit hooks (install, uninstall, status check), and a pre-commit checker that validates all markdown link references in staged files. The checker supports entity references, doc references, file references with line ranges, and external URLs, processing files and references in parallel for performance.

## Data Flow

- **Inputs**: Project path for hook installation; staged `.md` file paths and an entity-existence checker function for pre-commit validation.
- **Processing**: Hook installer locates the Git hooks directory (respecting `core.hooksPath`), writes or appends the AutoDoc shell script, and sets executable permissions. Pre-commit checker extracts markdown links from staged files, resolves each target (entity, doc, file, URL), and collects broken references.
- **Outputs**: `HookInstallResult` with installed/skipped/error lists; `PreCommitCheckResult` with broken references and warnings.

## Public API

| Export | Type | Description | Location |
|--------|------|-------------|----------|
| `getGitHooksDir` | function | Locates the Git hooks directory for a project, respecting custom hooksPath | [`hook-installer.ts:61-84`](./hook-installer.ts) |
| `isHookInstalled` | function | Checks whether AutoDoc hook is already installed in hooks dir | [`hook-installer.ts:89-100`](./hook-installer.ts) |
| `installPreCommitHook` | function | Installs or appends AutoDoc pre-commit hook script | [`hook-installer.ts:105-161`](./hook-installer.ts) |
| `uninstallHooks` | function | Removes AutoDoc section from pre-commit hook | [`hook-installer.ts:166-230`](./hook-installer.ts) |
| `getHookStatus` | function | Returns installation status (gitRepo, hooksDir, preCommit) | [`hook-installer.ts:235-239`](./hook-installer.ts) |
| `HookInstallResult` | interface | Result of hook install/uninstall operations | [`hook-installer.ts:19-24`](./hook-installer.ts) |
| `getStagedMdFiles` | function | Gets staged markdown files from git index | [`pre-commit-check.ts:35-45`](./pre-commit-check.ts) |
| `getStagedCodeFiles` | function | Gets staged code files from git index | [`pre-commit-check.ts:50-64`](./pre-commit-check.ts) |
| `extractReferences` | function | Extracts markdown link references from content | [`pre-commit-check.ts:65-65`](./pre-commit-check.ts) |
| `checkReferenceTarget` | function | Validates a single reference target (entity, doc, file, URL) | [`pre-commit-check.ts:99-146`](./pre-commit-check.ts) |
| `runPreCommitCheck` | function | Runs full pre-commit validation on all staged .md files | [`pre-commit-check.ts:153-216`](./pre-commit-check.ts) |
| `formatPreCommitResult` | function | Formats check results for console output | [`pre-commit-check.ts:225-249`](./pre-commit-check.ts) |
| `PreCommitCheckResult` | interface | Result of pre-commit check with broken refs and warnings | [`pre-commit-check.ts:20-29`](./pre-commit-check.ts) |

## Dependencies

### Internal Modules

| Module | Purpose |
|--------|---------|
| `utils/file-ops` | File existence checks, directory creation, text reading |
| `utils/parallel` | `mapParallel` and `collectParallel` for concurrent file/reference validation |

### External Packages

| Package | Purpose |
|---------|---------|
| `node:child_process` | Git command execution (diff, config) |
| `node:fs/promises` | File writing and chmod for hook scripts |
| `node:path` | Path resolution for hook and reference targets |
| `node:util` | `promisify` wrapper for exec |

## Behavioral Properties

| Property | Value |
|----------|-------|
| Max file concurrency | 8 parallel file checks |
| Max ref concurrency per file | 4 parallel reference validations |
| External URL handling | Skipped during pre-commit (not validated) |

## Error Handling

Hook installation gracefully handles missing `.git` directories, existing hooks (appends rather than overwrites), and permission errors. Pre-commit check aggregates file-level errors as warnings without blocking the commit, and individual reference validation failures are collected in the `brokenRefs` array.

## Known Limitations

- The pre-commit hook shell script currently only warns about staged `.md` files rather than running full MCP validation.
- Uninstall uses line-based matching for the AutoDoc section, which may not handle all edge cases if the hook was manually edited.
- External URLs are not validated during pre-commit to avoid network dependencies.

## Exports



## Files

| File | Description |
|------|-------------|
| [`hook-installer.ts`](./hook-installer.ts) | Git hook lifecycle management: install, uninstall, status check, hooks directory detection |
| [`pre-commit-check.ts`](./pre-commit-check.ts) | Staged file reference validation: extracts links, checks targets, formats results |
| [`index.ts`](./index.ts) | Module barrel file re-exporting hook-installer and pre-commit-check |
