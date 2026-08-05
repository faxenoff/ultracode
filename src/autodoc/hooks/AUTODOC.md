# Hooks

## 🤖 Overview

The hooks module provides two complementary capabilities: a hook installer that manages the lifecycle of Git pre-commit hooks (install, uninstall, status check), and a pre-commit checker that validates all markdown link references in staged files. The checker supports entity references, doc references, file references with line ranges, and external URLs, processing files and references in parallel for performance.

## 🤖 Entity Listing

### Function
- **checkReferenceTarget** — Validates the target of a reference `pre-commit-check.ts:99-146`
- **extractReferences** — Extracts references from markdown content `pre-commit-check.ts:69-94`
- **fileResults** — Stores the results of the pre-commit check for each file `pre-commit-check.ts:176-203`
- **formatPreCommitResult** — Formats the result of the pre-commit check into a structured object `pre-commit-check.ts:225-249`
- **getGitHooksDir** — Retrieves the directory path for git hooks `hook-installer.ts:61-84`
- **getHookStatus** — Not present in the provided code `hook-installer.ts:235-247`
- **getStagedCodeFiles** — Retrieves staged code files (for reference validation) from the git repository `pre-commit-check.ts:50-64`
- **getStagedMdFiles** — Retrieves staged .md files from the git repository `pre-commit-check.ts:35-45`
- **installPreCommitHook** — Not present in the provided code `hook-installer.ts:105-161`
- **isHookInstalled** — Not present in the provided code `hook-installer.ts:89-100`
- **refChecks** — Manages reference checks for markdown files `pre-commit-check.ts:183-186`
- **runPreCommitCheck** — Executes the pre-commit check to validate documentation references `pre-commit-check.ts:157-220`
- **uninstallHooks** — Not present in the provided code `hook-installer.ts:166-230`
- **writeHookFile** — Not present in the provided code `hook-installer.ts:132-135`

### Interface
- **HookInstallResult** — Represents the result of installing git hooks, including success status, installed hooks, skipped hooks, and errors `hook-installer.ts:19-24`
- **PreCommitCheckResult** — Represents the result of a pre-commit check, including success status, broken references, and warnings `pre-commit-check.ts:21-30`

### Import_decl
- **../../agents/dev/file-extensions.js** — Imports `../../agents/dev/file-extensions.js` from `../../agents/dev/file-extensions.js`. `pre-commit-check.ts:15-15`
- **../../utils/file-ops.js** — Imports `../../utils/file-ops.js` from `../../utils/file-ops.js`. `hook-installer.ts:15-15`, `pre-commit-check.ts:16-16`
- **../../utils/parallel.js** — Imports `../../utils/parallel.js` from `../../utils/parallel.js`. `pre-commit-check.ts:17-17`
- **node:child_process** — Imports `node:child_process` from `node:child_process`. `hook-installer.ts:11-11`, `pre-commit-check.ts:12-12`
- **node:fs/promises** — Imports `node:fs/promises` from `node:fs/promises`. `hook-installer.ts:12-12`
- **node:path** — Imports `node:path` from `node:path`. `hook-installer.ts:13-13`, `pre-commit-check.ts:13-13`
- **node:util** — Imports `node:util` from `node:util`. `hook-installer.ts:14-14`, `pre-commit-check.ts:14-14`

### Property
- **brokenRefs** — An array of objects containing details about broken references found in the staged files `pre-commit-check.ts:23-28`
- **error** — The error message associated with the broken reference `pre-commit-check.ts:27-27`
- **error** — Represents an error object used in the pre-commit check `pre-commit-check.ts:103-103`
- **errors** — Contains the list of errors encountered during hook installation `hook-installer.ts:23-23`
- **file** — The file path where a broken reference was found `pre-commit-check.ts:24-24`
- **gitRepo** — Not present in the provided code `hook-installer.ts:236-236`
- **hooksDir** — Not present in the provided code `hook-installer.ts:237-237`
- **installed** — Contains the list of installed hooks `hook-installer.ts:21-21`
- **line** — The line number in the file where the broken reference was found `pre-commit-check.ts:25-25`, `pre-commit-check.ts:69-69`, `pre-commit-check.ts:70-70`
- **preCommit** — Not present in the provided code `hook-installer.ts:238-238`
- **skipped** — Contains the list of skipped hooks `hook-installer.ts:22-22`
- **success** — Indicates whether the hook installation was successful `hook-installer.ts:20-20`
- **success** — Indicates whether the pre-commit check was successful `pre-commit-check.ts:22-22`
- **syntax** — The syntax used for the reference in the markdown content `pre-commit-check.ts:69-69`, `pre-commit-check.ts:70-70`
- **target** — The target of the broken reference `pre-commit-check.ts:26-26`, `pre-commit-check.ts:69-69`, `pre-commit-check.ts:70-70`
- **valid** — Indicates whether the target of a reference is valid `pre-commit-check.ts:103-103`
- **warnings** — An array of warning messages from the pre-commit check `pre-commit-check.ts:29-29`

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

## Files

| File | Description |
|------|-------------|
| [`hook-installer.ts`](./hook-installer.ts) | Git hook lifecycle management: install, uninstall, status check, hooks directory detection |
| [`pre-commit-check.ts`](./pre-commit-check.ts) | Staged file reference validation: extracts links, checks targets, formats results |
| [`index.ts`](./index.ts) | Module barrel file re-exporting hook-installer and pre-commit-check |
