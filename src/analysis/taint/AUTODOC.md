# Taint

Taint analysis system detecting security vulnerabilities in untrusted data flows.

## Response Handling

The taint analysis results are paginated at the handler level:

- **Handler** (`TaintAnalysisToolHandler`): accepts `offset`/`limit` params, applies `paginate()` from `response-limits.ts` to `result.vulnerabilities`, formats text only for the current page. Default: 20 vulnerabilities per page (from `SAFE_LIMITS.taintVulnerabilities`), max 200 (from `MAX_PAGE_SIZE`).
- **Transport safety net** (`enforceResponseLimit` in `index.ts`): if the final response exceeds 50KB (`MAX_RESPONSE_SIZE_BYTES`), it is truncated and a `_responseMeta` hint is injected.
- **Serialization**: `taint_analysis` is in `HEAVY_ANALYSIS_TOOLS` set, routed through `pLimit(1)` queue to prevent concurrent memory spikes.

Response structure:
```json
{
  "summary": "Taint: 5 flows (2 critical, 3 high, 4 unsanitized)",
  "pagination": { "offset": 0, "limit": 20, "total": 5, "hasMore": false },
  "stats": { "sources": 100, "sinks": 68, "sanitizers": 325, "vulnerabilities": 5 },
  "formatted": "# Taint Analysis Report\n..."
}
```

## Exports

| Name | Type | Description | Location |
|------|------|-------------|----------|
| `classifyAsSanitizer` | function | Function to classify entities as sanitizers | [→ catalogs.ts:163-165] |
| `classifyAsSink` | function | Function to classify entities as dangerous sinks | [→ catalogs.ts:149-151] |
| `classifyAsSource` | function | Function to classify entities as taint sources | [→ catalogs.ts:135-137] |
| `SANITIZER_PATTERNS` | const | Array of regex patterns detecting protective functions | [→ catalogs.ts:105-107] |
| `SanitizerPattern` | interface | Interface for protective function patterns offered | [→ catalogs.ts:18-23] |
| `SINK_PATTERNS` | const | Array of regex patterns detecting dangerous operations | [→ catalogs.ts:64-66] |
| `SinkPattern` | interface | Interface for dangerous operation patterns and categories | [→ catalogs.ts:10-16] |
| `SOURCE_PATTERNS` | const | Array of regex patterns detecting untrusted data | [→ catalogs.ts:28-30] |
| `SourcePattern` | interface | Interface for untrusted data entry point patterns | [→ catalogs.ts:3-8] |
| `TaintAnalysisParams` | interface | Interface for taint analysis parameters and options | [→ types.ts:62-67] |
| `TaintAnalysisResult` | interface | Interface for complete taint analysis report results | [→ types.ts:62-67] |
| `TaintCategory` | type | Type for vulnerability categories SQL injection XSS command | [→ types.ts:1-7] |
| `TaintFlowAnalyzer` | class | Class analyzing data flow paths source to sink | [→ taint-flow-analyzer.ts:19-605] |
| `TaintFlowRole` | type | Type for role in taint analysis flow | [→ types.ts:40] |
| `TaintFlowStep` | interface | Interface for single step in vulnerability flow | [→ types.ts:40-40] |
| `TaintFormatter` | class | Class formatting taint analysis results into reports | [→ taint-formatter.ts:3-90] |
| `TaintSanitizer` | interface | Interface for protective function with protections offered | [→ types.ts:31-38] |
| `TaintSeverity` | type | Type for vulnerability severity critical high medium low | [→ types.ts:9] |
| `TaintSink` | interface | Interface for dangerous operation sink and categories | [→ types.ts:21-29] |
| `TaintSource` | interface | Interface for discovered taint source with location | [→ types.ts:9-9] |
| `TaintVulnerability` | interface | Interface for detected vulnerability with flow details | [→ types.ts:51-60] |

## Files

- **catalogs.ts** — Regex patterns for detecting sources sinks sanitizers
- **index.ts** — Public module exports and re-exports
- **taint-flow-analyzer.ts** — Core taint flow analysis engine
- **taint-formatter.ts** — Formats taint analysis results into text reports
- **types.ts** — Type definitions and interfaces for taint analysis
