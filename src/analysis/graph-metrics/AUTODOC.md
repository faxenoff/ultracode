# Graph Metrics

Analyzes code dependency graphs to compute metrics like PageRank, community detection, centrality, and bus factor.

## Exports

| Name | Type | Description | Location |
|------|------|-------------|----------|
| `BusFactorFileEntry` | interface | Bus factor metrics and risk for single file | [→ types.ts:61-65] |
| `BusFactorModuleEntry` | interface | Bus factor metrics and risk for code module | [→ types.ts:67-67] |
| `BusFactorResult` | interface | Overall and per-file bus factor analysis results | [→ types.ts:76-81] |
| `BusFactorRiskLevel` | type | Risk level types for author dependency severity | [→ types.ts:67] |
| `CentralityEntry` | interface | Entity centrality metrics and network role classification | [→ types.ts:48-48] |
| `CentralityResult` | interface | Centrality results for all graph entities | [→ types.ts:61-65] |
| `CentralityRole` | type | Network role classification from entity degree patterns | [→ types.ts:48] |
| `GraphMetricsAnalyzer` | class | Analyzer computing PageRank, Louvain, centrality, and bus factor metrics | [→ graph-metrics-analyzer.ts:22-25] |
| `GraphMetricsFormatter` | class | Formatter for metric results as text or JSON output | [→ metrics-formatter.ts:9-145] |
| `GraphMetricsParams` | interface | Parameters for metric computation and result persistence | [→ types.ts:95-95] |
| `GraphMetricsResult` | type | Union type of all possible metric results | [→ types.ts:95] |
| `GraphMetricType` | type | Type of available metric computation operations for analysis | [→ types.ts:1] |
| `LouvainCommunity` | interface | Detected community cluster from Louvain detection algorithm | [→ types.ts:25-38] |
| `LouvainResult` | interface | Louvain results with communities and modularity score | [→ types.ts:40-46] |
| `PageRankEntry` | interface | Single entity PageRank score with degree information | [→ types.ts:1-1] |
| `PageRankResult` | interface | PageRank results with score distribution statistics | [→ types.ts:13-23] |

## Files

- **graph-metrics-analyzer.ts** — Main analyzer computing PageRank, Louvain, centrality, bus factor metrics
- **index.ts** — Public module exports for graph metric analysis
- **metrics-formatter.ts** — Formats metric results as text or JSON output
- **types.ts** — Type definitions for all graph metric operations
