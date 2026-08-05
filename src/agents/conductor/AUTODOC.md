# Conductor

## 🤖 Overview

The `conductor` module is responsible for orchestrating tasks and managing agent capabilities, providing a configuration and task analysis framework. It is used by developers to define and manage task execution strategies and agent behavior.

## 🤖 Architecture

```
[Config] → [Method Proposals] → [Task Analysis] → [Types]
```

## 🤖 Flow

```
[Config] → [Method Proposals] → [Task Analysis] → [Types]
```

## 🤖 Entity Listing

### Function
- **analyzeTaskComplexity** — Analyze task complexity and determine delegation strategy `task-analysis.ts:25-75`
- **createMethodProposalTemplate** — Creates a method proposal template based on task type `method-proposals.ts:78-101`
- **generateMethodProposals** — Generates method proposals for a task based on complexity analysis, always returning 5 proposals `method-proposals.ts:14-73`
- **getConductorAgentDefaults** — Returns default capabilities and configuration for Conductor agents `config.ts:29-67`
- **getTaskTypeKey** — Determines the key for a task based on its payload and type `method-proposals.ts:106-120`
- **initializeMethodProposalTemplates** — Creates a map of method proposal templates for different task types `method-proposals.ts:125-134`
- **isDirectImplementation** — Returns true if the task is of type "direct" or if the payload contains "directImplementation" or "bypassDelegation" set to true `task-analysis.ts:91-97`
- **isIndexingTask** — Check if a task is an indexing operation (automated, no approval needed) `task-analysis.ts:80-86`

### Interface
- **ConductorConfig** — Represents the configuration for the Conductor orchestrator agent `types.ts:9-18`
- **MethodProposal** — Represents a method proposal with its details `types.ts:37-46`
- **SubTask** — Represents a subtask with its properties `types.ts:28-35`
- **TaskComplexityAnalysis** — Analyzes the complexity of a task and provides a score `types.ts:20-26`
- **TaskPayload** — Task payload interface for complexity analysis `task-analysis.ts:13-20`

### Type_alias
- **ConductorConfigOverrides** — Represents partial overrides for the Conductor configuration `types.ts:48-50`

### Import_decl
- **../../config/yaml-config.js** — Imports `../../config/yaml-config.js` from `../../config/yaml-config.js`. `config.ts:7-7`
- **../../types/agent.js** — Imports `../../types/agent.js` from `../../types/agent.js`. `config.ts:8-8`, `method-proposals.ts:7-7`, `task-analysis.ts:7-7`, `types.ts:7-7`
- **./types.js** — Imports `./types.js` from `./types.js`. `config.ts:9-9`, `method-proposals.ts:8-8`, `task-analysis.ts:8-8`

### Property
- **bypassDelegation** — Task payload field indicating whether delegation should be bypassed `task-analysis.ts:18-18`
- **capabilities** — Represents the capabilities of Conductor agents, including max concurrency, memory limit, and priority `config.ts:30-30`
- **complexityThreshold** — Sets the complexity threshold for task delegation `types.ts:13-13`
- **config** — Contains the configuration for Conductor agents, including resource constraints, task queue limit, load balancing strategy, complexity threshold, and mandatory delegation `config.ts:31-31`
- **cons** — Lists the disadvantages of a task or method proposal `types.ts:42-42`
- **delegationStrategy** — Specifies the delegation strategy for the task `types.ts:24-24`
- **dependencies** — Dependencies for a subtask `types.ts:32-32`
- **description** — Description of a subtask `types.ts:30-30`
- **description** — Provides a detailed description of a task or method proposal `types.ts:40-40`
- **directImplementation** — Task payload field indicating whether direct implementation is needed `task-analysis.ts:17-17`
- **factors** — Lists the factors contributing to the complexity score `types.ts:22-22`
- **fileCount** — Task payload field indicating the number of files affected `task-analysis.ts:14-14`
- **id** — Unique identifier for a subtask `types.ts:29-29`
- **id** — Represents a unique identifier for a task or method proposal `types.ts:38-38`
- **loadBalancingStrategy** — Determines the load balancing strategy for task distribution `types.ts:12-12`
- **mandatoryDelegation** — Indicates whether delegation is mandatory `types.ts:14-14`
- **maxConcurrency** — Specifies the maximum number of concurrent agents allowed `config.ts:30-30`
- **maxConcurrency** — Defines the maximum number of concurrent tasks `types.ts:15-15`
- **memoryLimit** — Defines the maximum memory limit for agents `config.ts:30-30`
- **memoryLimit** — Specifies the memory limit for the Conductor orchestrator agent `types.ts:16-16`
- **name** — Specifies the name of a task or method proposal `types.ts:39-39`
- **payload** — Additional payload for a subtask `types.ts:34-34`
- **priority** — Determines the priority level of agents `config.ts:30-30`
- **priority** — Sets the priority level for the Conductor orchestrator agent `types.ts:17-17`, `types.ts:33-33`
- **pros** — Lists the advantages of a task or method proposal `types.ts:41-41`
- **recommended** — Indicates whether a task or method proposal is recommended `types.ts:45-45`
- **requiresApproval** — Indicates whether approval is required for the task `types.ts:23-23`
- **requiresResearch** — Checks if the payload contains a `requiresResearch` property `method-proposals.ts:112-112`
- **requiresResearch** — Task payload field indicating whether research is required `task-analysis.ts:15-15`
- **requiresTesting** — Task payload field indicating whether testing is required `task-analysis.ts:16-16`
- **resourceConstraints** — Defines the resource constraints for the Conductor orchestrator agent `types.ts:10-10`
- **resourceConstraints** — Defines resource constraints for the Conductor orchestrator `types.ts:49-49`
- **riskLevel** — Defines the risk level of a task or method proposal `types.ts:44-44`
- **score** — Represents the complexity score of a task on a 1-10 scale `types.ts:21-21`
- **subtasks** — Contains subtasks for the task `types.ts:25-25`
- **targetAgent** — Target agent for a subtask `types.ts:31-31`
- **taskQueueLimit** — Specifies the maximum number of tasks that can be in the task queue `types.ts:11-11`
- **timeline** — Indicates the timeline or schedule for a task or method proposal `types.ts:43-43`
- **type** — Type of a subtask `types.ts:34-34`

## Data Flow

- **Inputs**: `AgentTask` objects with type, payload, and priority metadata.
- **Processing**: Scores task complexity based on type, scope, and payload; generates 5 method proposals with pros/cons/risk assessment; resolves configuration from YAML with fallback defaults.
- **Outputs**: `TaskComplexityAnalysis` with score, factors, and delegation strategy; `MethodProposal[]` arrays; resolved `ConductorConfig`.

## Public API

| Export | Type | Description | Location |
|--------|------|-------------|----------|
| `analyzeTaskComplexity` | function | Scores task complexity and determines delegation strategy | [`task-analysis.ts:25-75`](./task-analysis.ts) |
| `isIndexingTask` | function | Checks whether a task is an automated indexing operation | [`task-analysis.ts:80-86`](./task-analysis.ts) |
| `isDirectImplementation` | function | Checks if a task attempts to bypass delegation | [`task-analysis.ts:91-97`](./task-analysis.ts) |
| `generateMethodProposals` | function | Generates 5 method execution proposals for a task | [`method-proposals.ts:14-73`](./method-proposals.ts) |
| `createMethodProposalTemplate` | function | Creates proposal templates for a given task type | [`method-proposals.ts:78-101`](./method-proposals.ts) |
| `getTaskTypeKey` | function | Determines the task type key for template lookup | [`method-proposals.ts:106-120`](./method-proposals.ts) |
| `initializeMethodProposalTemplates` | function | Initializes proposal templates for common task types | [`method-proposals.ts:125-134`](./method-proposals.ts) |
| `DEFAULT_CONDUCTOR_CONFIG` | const | Full default conductor configuration | [`config.ts:18-27`](./config.ts) |
| `DEFAULT_RESOURCE_CONSTRAINTS` | const | Default resource constraint values | [`config.ts:11-16`](./config.ts) |
| `getConductorAgentDefaults` | function | Resolves conductor config from YAML with defaults | [`config.ts:29-32`](./config.ts) |
| `ConductorConfig` | interface | Conductor orchestrator configuration | [`types.ts:9-18`](./types.ts) |
| `TaskComplexityAnalysis` | interface | Complexity analysis result with score and strategy | [`types.ts:20-26`](./types.ts) |
| `SubTask` | interface | Subtask definition with target agent | [`types.ts:28-35`](./types.ts) |
| `MethodProposal` | interface | Method execution proposal with risk/timeline | [`types.ts:37-46`](./types.ts) |
| `ConductorConfigOverrides` | type | Partial overrides for conductor configuration | [`types.ts:48-50`](./types.ts) |

## Dependencies

### Internal Modules

| Module | Purpose |
|--------|---------|
| `config/yaml-config` | Read application configuration |
| `types/agent` | `AgentTask` and `ResourceConstraints` types |

### External Packages

| Package | Purpose |
|---------|---------|
| (none) | No external dependencies |

## Behavioral Properties

| Property | Value |
|----------|-------|
| Complexity scale | 1-10, capped at 10 |
| Proposals per task | Always exactly 5 |
| Delegation strategies | `dev-agent`, `dora`, `multi-agent` |

## Error Handling

Functions are pure and do not throw exceptions. Invalid or missing payload fields are handled gracefully with default scores.

## Known Limitations

- Complexity scoring uses fixed heuristics rather than ML-based analysis.
- Method proposals are static templates, not dynamically adapted to project context.

## Files

| File | Description |
|------|-------------|
| `config.ts` | Default configuration and YAML-based config resolution |
| `index.ts` | Re-exports all conductor module members |
| `method-proposals.ts` | Method proposal generation and template management |
| `task-analysis.ts` | Task complexity scoring and delegation determination |
| `types.ts` | TypeScript interfaces for conductor types |
