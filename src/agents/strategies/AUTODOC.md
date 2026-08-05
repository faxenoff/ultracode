# Strategies

## 🤖 Overview

The `strategies` module provides a flexible task delegation strategy for agents, enabling dynamic task assignment based on complexity and agent capabilities. This module is used by the conductor-orchestrator to manage task distribution efficiently, reducing the need for large if-else chains.

## 🤖 Architecture

```
[DelegationStrategy]
    |
    v
[ComplexityBasedStrategy]
    |
    v
[Agent]
    |
    v
[AgentTask]
    |
    v
[Task Complexity Score]
```

## 🤖 Flow

```
[AgentTask] → [DelegationStrategy] → [ComplexityBasedStrategy] → [Agent] → [Task Complexity Score]
```

## 🤖 Entity Listing

### Function
- **capableAgents** — Filters agents that support the task type `delegation-strategy.ts:52-52`
- **capableAgents** — Filters available agents to those capable of handling the task type `delegation-strategy.ts:97-97`
- **capableAgents** — Filters available agents to those that can handle the task type `delegation-strategy.ts:129-129`

### Method
- **calculateComplexity** — Calculates the complexity score of a task `delegation-strategy.ts:62-83`
- **calculateComplexity** — Calculates the complexity score of a task based on its priority, payload size, and type `delegation-strategy.ts:109-111`
- **calculateComplexity** — Calculates the complexity of a task based on its priority and payload size `delegation-strategy.ts:141-150`
- **constructor** — Initializes a ComplexityBasedStrategy with a complexity threshold `delegation-strategy.ts:43-43`
- **constructor** — Initializes the delegation strategy with complexity threshold and agent load getter `delegation-strategy.ts:118-121`
- **selectAgent** — Selects the best agent for a task based on available agents `delegation-strategy.ts:50-60`
- **selectAgent** — Selects an agent based on task type and available agents `delegation-strategy.ts:96-107`
- **selectAgent** — Selects an agent with the lowest current load for the task `delegation-strategy.ts:128-139`
- **shouldDelegate** — Determines if a task should be delegated based on its complexity `delegation-strategy.ts:45-48`
- **shouldDelegate** — Always delegates in round-robin `delegation-strategy.ts:92-94`
- **shouldDelegate** — Determines whether a task should be delegated based on its complexity `delegation-strategy.ts:123-126`

### Class
- **ComplexityBasedStrategy** — Strategy for delegating tasks based on complexity threshold `delegation-strategy.ts:42-84`
- **LeastLoadedStrategy** — Strategy for delegating tasks based on the least loaded agent `delegation-strategy.ts:117-151`
- **RoundRobinStrategy** — Strategy for delegating tasks using a round-robin approach `delegation-strategy.ts:89-112`

### Interface
- **Agent** — Represents an agent with an ID, type, and capabilities `delegation-strategy.ts:10-17`
- **DelegationStrategy** — Interface for task delegation strategies `delegation-strategy.ts:22-37`

### Import_decl
- **../../types/agent.js** — Imports `../../types/agent.js` from `../../types/agent.js`. `delegation-strategy.ts:8-8`

### Property
- **capabilities** — Object containing supported task types and maximum concurrency `delegation-strategy.ts:13-16`
- **id** — Unique identifier for an agent `delegation-strategy.ts:11-11`
- **lastSelectedIndex** — Index of the last selected agent `delegation-strategy.ts:90-90`
- **maxConcurrency** — Maximum number of tasks the agent can handle concurrently `delegation-strategy.ts:15-15`
- **supportedTaskTypes** — Array of task types supported by the agent `delegation-strategy.ts:14-14`
- **type** — Type of the agent `delegation-strategy.ts:12-12`

## Data Flow

- **Inputs**: `AgentTask` with type, priority, and payload; list of available `Agent` objects with capabilities.
- **Processing**: Calculates complexity score from task metadata, filters agents by supported task types, selects best agent based on strategy-specific criteria.
- **Outputs**: Boolean delegation decision, selected `Agent` or null, numeric complexity score (1-10).

## Public API

| Export | Type | Description | Location |
|--------|------|-------------|----------|
| `DelegationStrategy` | interface | Strategy interface for delegation decisions | [`delegation-strategy.ts:22-37`](./delegation-strategy.ts) |
| `Agent` | interface | Agent descriptor with id, type, and capabilities | [`delegation-strategy.ts:10-17`](./delegation-strategy.ts) |
| `ComplexityBasedStrategy` | class | Delegates tasks above a configurable complexity threshold | [`delegation-strategy.ts:42-84`](./delegation-strategy.ts) |
| `RoundRobinStrategy` | class | Always delegates, rotating across capable agents | [`delegation-strategy.ts:89-112`](./delegation-strategy.ts) |
| `LeastLoadedStrategy` | class | Delegates above threshold, selects least-loaded agent | [`delegation-strategy.ts:117-151`](./delegation-strategy.ts) |

## Dependencies

### Internal Modules

| Module | Purpose |
|--------|---------|
| `types/agent` | `AgentTask` type definition |

### External Packages

| Package | Purpose |
|---------|---------|
| (none) | No external dependencies |

## Behavioral Properties

| Property | Value |
|----------|-------|
| Complexity score range | 1-10, capped at 10 |
| Default complexity threshold | 8 |
| Agent selection | Highest concurrency (complexity), round-robin (RR), lowest load (least-loaded) |

## Error Handling

All methods return safe defaults (null for agent selection, 5 for round-robin complexity). No exceptions are thrown for empty agent lists or missing task metadata.

## Known Limitations

- `LeastLoadedStrategy` requires an external `getAgentLoad` callback function to be provided at construction.
- Complexity scoring is based on payload size heuristics rather than actual resource requirements.
- No strategy supports weighted multi-criteria agent selection.

## Files

| File | Description |
|------|-------------|
| `delegation-strategy.ts` | DelegationStrategy interface and three concrete implementations |
