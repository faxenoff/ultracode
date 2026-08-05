# src/semantic/__tests__

## Overview

This module contains integration tests for the embedding provider factory and configuration mapping system. It validates that provider configurations defined in the MCP settings are correctly parsed, mapped, and instantiated into their corresponding provider implementations (Ollama, OpenAI, etc.), ensuring the embedding generation pipeline receives properly configured provider instances.

## Entity Listing

### Test Cases

- **mappingCases** — `provider-mapping.test.ts:6-126` — Test dataset validating provider configuration mapping from MCP configuration structure to provider-specific settings for multiple providers (Ollama, OpenAI, Anthropic, etc.).

- **creationCases** — `provider-mapping.test.ts:128-203` — Test dataset validating successful instantiation of provider instances from factory given valid configurations.

- **generatorCases** — `provider-mapping.test.ts:205-232` — Test dataset validating embedding generator creation and behavior with different provider configurations.

### Test Execution

- **describe** — `provider-mapping.test.ts:234-284` — Test suite grouping all provider factory and configuration tests.

- **describe (embedding provider mapping)** — `provider-mapping.test.ts:235-258` — Nested test suite validating configuration mapping logic for embedding providers.

- **embedding** — `provider-mapping.test.ts:237-256` — Per-provider test iteration validating configuration structure mapping.

- **describe (provider creation)** — `provider-mapping.test.ts:260-272` — Nested test suite validating factory instantiation of configured providers.

- **provider** — `provider-mapping.test.ts:262-270` — Per-provider test iteration validating successful provider creation from factory.

- **describe (generator creation)** — `provider-mapping.test.ts:274-283` — Nested test suite validating embedding generator instantiation with configured providers.

- **expect** — `provider-mapping.test.ts:276-281` — Assertion validating generator instance properties and provider assignment.

- **generator** — `provider-mapping.test.ts:277-280` — Per-case test iteration validating generator creation behavior.

### Test Variables (Runtime)

- **embedding** — `provider-mapping.test.ts:238-238` — Current embedding provider configuration being tested from mappingCases dataset.

- **providerSection** — `provider-mapping.test.ts:239-239` — Provider-specific configuration section extracted from MCP configuration for assertion.

- **actual** — `provider-mapping.test.ts:249-249` — Actual provider instance created by factory for comparison against expected properties.

- **provider** — `provider-mapping.test.ts:263-263` — Current provider configuration being tested from creationCases dataset.

- **generator** — `provider-mapping.test.ts:278-278` — Current embedding generator test case being validated from generatorCases dataset.


### Added Entities

- **makeVec** — `turbo-quant-plus.test.ts:84-88`
- **tq** — `turbo-quant-plus.test.ts:50-50`
- **tq** — `turbo-quant-plus.test.ts:56-56`
- **tq** — `turbo-quant-plus.test.ts:62-62`
- **tq** — `turbo-quant-plus.test.ts:68-68`
- **tq** — `turbo-quant-plus.test.ts:74-74`
- **v** — `turbo-quant-plus.test.ts:85-85`
- **tq** — `turbo-quant-plus.test.ts:93-93`
- **vec** — `turbo-quant-plus.test.ts:94-94`
- **encoded** — `turbo-quant-plus.test.ts:95-95`
- **storedNorm** — `turbo-quant-plus.test.ts:98-98`
- **originalNorm** — `turbo-quant-plus.test.ts:99-99`
- **tq** — `turbo-quant-plus.test.ts:105-105`
- **vec** — `turbo-quant-plus.test.ts:106-106`
- **encoded** — `turbo-quant-plus.test.ts:107-107`
- **rn** — `turbo-quant-plus.test.ts:108-108`
- **tq1** — `turbo-quant-plus.test.ts:114-114`
- **tq2** — `turbo-quant-plus.test.ts:115-115`
- **vec** — `turbo-quant-plus.test.ts:116-116`
- **e1** — `turbo-quant-plus.test.ts:117-117`
- **e2** — `turbo-quant-plus.test.ts:118-118`
- **vec32** — `turbo-quant-plus.test.ts:128-131`
- **tq** — `turbo-quant-plus.test.ts:134-134`
- **encoded** — `turbo-quant-plus.test.ts:135-135`
- **rotated** — `turbo-quant-plus.test.ts:136-136`
- **qn** — `turbo-quant-plus.test.ts:137-137`
- **tq** — `turbo-quant-plus.test.ts:142-142`
- **encoded** — `turbo-quant-plus.test.ts:143-143`
- **rotated** — `turbo-quant-plus.test.ts:144-144`
- **qn** — `turbo-quant-plus.test.ts:145-145`
- **tq** — `turbo-quant-plus.test.ts:150-150`
- **encoded** — `turbo-quant-plus.test.ts:151-151`
- **rotated** — `turbo-quant-plus.test.ts:152-152`
- **qn** — `turbo-quant-plus.test.ts:153-153`
- **tq** — `turbo-quant-plus.test.ts:164-164`
- **a** — `turbo-quant-plus.test.ts:165-165`
- **b** — `turbo-quant-plus.test.ts:166-166`
- **encA** — `turbo-quant-plus.test.ts:168-168`
- **rotB** — `turbo-quant-plus.test.ts:169-169`
- **baseIP** — `turbo-quant-plus.test.ts:171-171`
- **jlProj** — `turbo-quant-plus.test.ts:172-172`
- **correctedIP** — `turbo-quant-plus.test.ts:173-173`
- **tq** — `turbo-quant-plus.test.ts:182-182`
- **a** — `turbo-quant-plus.test.ts:183-183`
- **b** — `turbo-quant-plus.test.ts:184-184`
- **encA** — `turbo-quant-plus.test.ts:186-186`
- **rotB** — `turbo-quant-plus.test.ts:187-187`
- **qn** — `turbo-quant-plus.test.ts:188-188`
- **jlProj** — `turbo-quant-plus.test.ts:189-189`
- **cos** — `turbo-quant-plus.test.ts:191-191`
- **tq** — `turbo-quant-plus.test.ts:203-203`
- **esize** — `turbo-quant-plus.test.ts:204-204`
- **vecs** — `turbo-quant-plus.test.ts:206-210`
- **packed** — `turbo-quant-plus.test.ts:212-212`
- **enc** — `turbo-quant-plus.test.ts:214-214`
- **rotated** — `turbo-quant-plus.test.ts:218-218`
- **qn** — `turbo-quant-plus.test.ts:219-219`
- **scores** — `turbo-quant-plus.test.ts:220-220`
- **tq** — `turbo-quant-plus.test.ts:229-229`
- **esize** — `turbo-quant-plus.test.ts:230-230`
- **vecs** — `turbo-quant-plus.test.ts:232-232`
- **packed** — `turbo-quant-plus.test.ts:234-234`
- **enc** — `turbo-quant-plus.test.ts:236-236`
- **rotated** — `turbo-quant-plus.test.ts:240-240`
- **qn** — `turbo-quant-plus.test.ts:241-241`
- **jlProj** — `turbo-quant-plus.test.ts:242-242`
- **scores** — `turbo-quant-plus.test.ts:243-243`
- **tq** — `turbo-quant-plus.test.ts:257-257`
- **buf** — `turbo-quant-plus.test.ts:258-258`
- **{ tq: tq2, bytesRead }** — `turbo-quant-plus.test.ts:259-259`
- **i** — `turbo-quant-plus.test.ts:86-86`
- **i** — `turbo-quant-plus.test.ts:213-213`
- **i** — `turbo-quant-plus.test.ts:235-235`

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