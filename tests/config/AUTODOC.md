# tests/config

## 🤖 Overview

This module provides functions for mapping semantic configurations to provider options and retrieving model names from semantic configurations. It is used by developers to configure and test semantic providers in their applications.

## 🤖 Architecture

```
  +-------------------+
  | provider-config   |
  | (test)           |
  +-------------------+
  |                   |
  |  mapSemanticConfigToProvider |
  |                   |
  +-------------------+
  |                   |
  |  getModelNameFromSemanticConfig |
  |                   |
  +-------------------+
```

## 🤖 Flow

```
  +-------------------+
  | semantic-config   |
  | (test)           |
  +-------------------+
  |                   |
  |  mapSemanticConfigToProvider |
  |                   |
  +-------------------+
  |                   |
  |  getModelNameFromSemanticConfig |
  |                   |
  +-------------------+
```

## 🤖 Entity Listing

### Import_decl
- **../../src/agents/semantic/provider-config.js** — Imports `../../src/agents/semantic/provider-config.js`. `provider-config.test.ts:2-8`
- **../../src/config/yaml-config.js** — Imports `../../src/config/yaml-config.js` from `../../src/config/yaml-config.js`. `provider-config.test.ts:9-9`, `yaml-config.test.ts:4-4`
- **../../src/utils/config-paths.js** — Imports `../../src/utils/config-paths.js` from `../../src/utils/config-paths.js`. `provider-config.test.ts:10-10`
- **bun:test** — Imports `bun:test` from `bun:test`. `provider-config.test.ts:1-1`, `yaml-config.test.ts:1-1`

## Dependencies

- `src/agents/semantic/provider-config.ts` — Provider configuration mapping and option building functions
- `src/config/yaml-config.ts` — YAML configuration loader and validator
- `src/utils/config-paths.ts` — Configuration path resolution and loading utilities
- `bun:test` — Test framework (describe, it, expect)
