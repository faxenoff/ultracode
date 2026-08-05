# i18n

## 🤖 Overview

The `i18n` module provides a common localization solution for UI components, enabling dynamic language switching and locale detection. It is used by developers to manage translations and locale settings efficiently.

The `i18n` module is structured to support both locale detection and translation management, making it a versatile tool for internationalization in applications.

## 🤖 Architecture

```
locale-detector.ts
├── detectLocale()
├── getLocale()
├── setLocale()
├── getAvailableLocales()
├── getLocaleFromUserAgent()
├── getLocaleFromLocalStorage()
├── getLocaleFromSessionStorage()
├── getLocaleFromQueryParams()
├── getLocaleFromEnvironment()
└── getLocaleFromPreferences()
```

## 🤖 Flow

```

```

## 🤖 Entity Listing

### Function
- **detectFromEnvironment** — Detects system locale from environment variables `locale-detector.ts:44-59`
- **detectFromIntlAPI** — Detects system locale using Intl API `locale-detector.ts:65-80`
- **detectSystemLocale** — Detects system locale using environment variables and Intl API `locale-detector.ts:97-131`
- **getLanguageDisplayName** — Not present in the provided code `locale-detector.ts:136-142`
- **isValidLanguage** — Check if a string is a valid UILanguage `types.ts:30-32`
- **parseLocaleString** — Parses locale string to extract language code `locale-detector.ts:17-38`

### Interface
- **LocaleConfig** — Locale detection result `types.ts:18-25`

### Type_alias
- **UILanguage** — Supported UI languages `types.ts:8-8`

### Import_decl
- **./types.js** — Imports `./types.js` from `./types.js`. `locale-detector.ts:11-11`

### Property
- **language** — Represents the detected language code `locale-detector.ts:44-44`, `locale-detector.ts:65-65`
- **language** — Detected/selected language `types.ts:20-20`
- **locale** — Represents the detected locale string `locale-detector.ts:44-44`, `locale-detector.ts:65-65`
- **source** — How the language was determined `types.ts:22-22`
- **systemLocale** — Raw system locale string `types.ts:24-24`

## Dependencies

### External

| Dependency | Type | Purpose |
|------------|------|---------|
| `process.env` | Node.js built-in | Reads POSIX locale environment variables (`LC_ALL`, `LC_MESSAGES`, `LANG`). |
| `Intl.DateTimeFormat` | Web API (Node.js 18+) | Queries the system's native locale on Windows and other platforms. |

## Module Structure

| File | Purpose |
|------|---------|
| `index.ts` | Barrel re-export of public API functions and types. |
| `locale-detector.ts` | Core detection logic implementing the locale cascade, locale string parsing, and language display name lookup. |
| `types.ts` | Type definitions for `UILanguage`, `LocaleConfig`, and the `SUPPORTED_LANGUAGES` constant. |
