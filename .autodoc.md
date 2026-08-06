# ultracode

## Module Description

The `ultracode` module provides configuration for building a TypeScript project using `tsup`. This module is responsible for setting up the transpilation and build process, including support for various output file formats and optimization for use in different runtime environments.

## Files

- `oxlint.config.ts`
- `tsup.config.ts`

## Exports



## Usage

This module is used as part of the project build configuration and does not require direct import in application code. To use it, include it in the `tsup` build configuration:

```ts
// Example usage in tsup.config.ts
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  outDir: 'dist',
  format: ['esm', 'cjs'],
  splitting: false,
  sourcemap: true,
  clean: true,
})
```

## Biome Trust in Bun

The project uses Biome for code formatting and linting. Biome has a postinstall script (platform check) that requires trust in Bun.

**Already configured:** Biome is added to `trustedDependencies` in package.json.

**If you see "Blocked 1 postinstall":**
```bash
bun pm trust @biomejs/biome
```

**Note:** Biome v2.0 will remove the postinstall script, eliminating this requirement.
