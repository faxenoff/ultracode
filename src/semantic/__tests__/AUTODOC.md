# src/semantic/__tests__

## 🤖 Overview

This module contains test cases for the `provider-mapping` and `turbo-quant-plus` providers, focusing on their configuration and validation. It is used by developers to ensure that the providers are correctly set up and behave as expected.

## 🤖 Architecture

```
  +-------------------+
  | provider-mapping |
  | (test cases)     |
  +-------------------+
    |
    v
  +-------------------+
  | turbo-quant-plus |
  | (test cases)     |
  +-------------------+
```

## 🤖 Flow

```
  +-------------------+
  | provider-mapping |
  | (test cases)     |
  +-------------------+
    |
    v
  +-------------------+
  | turbo-quant-plus |
  | (test cases)     |
  +-------------------+
```

## 🤖 Entity Listing

### Function
- **makeVec** — Not present in the provided code `turbo-quant-plus.test.ts:84-88`

### Import_decl
- **../embedding-generator.js** — Imports `../embedding-generator.js` from `../embedding-generator.js`. `provider-mapping.test.ts:2-2`
- **../native-vector-index.js** — Imports `../native-vector-index.js` from `../native-vector-index.js`. `turbo-quant-plus.test.ts:6-6`
- **../providers/factory.js** — Imports `../providers/factory.js` from `../providers/factory.js`. `provider-mapping.test.ts:3-3`, `provider-mapping.test.ts:4-4`
- **../quantization.js** — Imports `../quantization.js` from `../quantization.js`. `turbo-quant-plus.test.ts:7-7`
- **../turbo-quant.js** — Imports `../turbo-quant.js` from `../turbo-quant.js`. `turbo-quant-plus.test.ts:8-8`
- **bun:test** — Imports `bun:test` from `bun:test`. `provider-mapping.test.ts:1-1`, `turbo-quant-plus.test.ts:5-5`

### Property
- **expectedBatch** — Indicates the expected batch size for the provider `provider-mapping.test.ts:133-133`
- **expectedModel** — Defines the expected model for the provider `provider-mapping.test.ts:132-132`
- **expectedName** — Specifies the expected name of the provider `provider-mapping.test.ts:131-131`
- **name** — Represents the name of the provider mapping case `provider-mapping.test.ts:129-129`
- **options** — Contains the configuration options for the provider mapping case `provider-mapping.test.ts:130-130`

## Dependencies

- **Imports:**
  - `bun:test` — Test framework providing `describe`, `it`, `expect` assertions
  - `EmbeddingGenerator` — Embedding generation orchestrator from ~~`../embedding-generator.js`~~ (deleted)
  - `ProviderFactoryOptions` — Configuration type for provider factory from ~~`../providers/factory.js`~~ (deleted)
  - `createProvider` — Factory function creating provider instances from ~~`../providers/factory.js`~~ (deleted)

- **Implicit Internal Connections:**
  - Tests validate the factory pattern (`createProvider`) used to instantiate provider implementations
  - Tests ensure configuration schema mapping from MCP settings to provider-specific options
  - Tests verify EmbeddingGenerator correctly accepts and uses configured providers
