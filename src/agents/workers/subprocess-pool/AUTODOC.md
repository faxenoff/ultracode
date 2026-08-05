---
module_name: subprocess-pool
description: "Type definitions and subprocess spawning for the parsing subprocess pool"
status: active
language: typescript
---

# Subprocess Pool

> Provides type definitions for IPC messages, subprocess state, pool configuration, and platform-specific subprocess spawning for Bun and Node.js runtimes.

## Overview

The subprocess-pool submodule defines the foundational types and spawning logic used by `ParsingSubprocessPool`. It provides interfaces for IPC messages (parse requests/responses), subprocess state tracking with concurrent task handling via `Map<taskId, PendingTask>`, pool statistics, embedding callback types, and configuration options (pool size, memory limits, keepalive mode, streaming). The spawner module handles platform-specific subprocess creation: Bun.spawn with native IPC or Node.js fork() with V8 serialization, with wrappers to provide a unified interface.

## Data Flow

- **Inputs**: Worker ID, subprocess state reference, spawn context with runtime info and callbacks.
- **Processing**: Spawns subprocess using Bun.spawn or Node.js fork(), sets up IPC message handlers, configures stderr logging, registers unexpected exit handlers.
- **Outputs**: Initialized subprocess with IPC channel, ready for parse request messages.

## Public API

| Export | Type | Description | Location |
|--------|------|-------------|----------|
| `spawnProcess` | function | Spawns subprocess based on runtime (Bun or Node.js) | [`spawner.ts:151-157`](./spawner.ts) |
| `spawnBunProcess` | function | Spawns Bun subprocess with native IPC | [`spawner.ts:57-100`](./spawner.ts) |
| `spawnNodeProcess` | function | Spawns Node.js subprocess via fork() with IPC | [`spawner.ts:107-146`](./spawner.ts) |
| `killProcess` | function | Safely terminates a subprocess | [`spawner.ts:162-169`](./spawner.ts) |
| `SpawnContext` | interface | Context with runtime info, callbacks, and worker script path | [`spawner.ts:25-32`](./spawner.ts) |
| `BunProcess` | interface | Bun process interface with IPC support | [`types.ts:18-25`](./types.ts) |
| `PendingTask` | interface | Task resolve/reject callbacks with timing metadata | [`types.ts:30-35`](./types.ts) |
| `SubprocessState` | interface | Worker state with process, pending tasks map, and flags | [`types.ts:40-60`](./types.ts) |
| `ParseRequest` | interface | IPC parse request with files, language, and options | [`types.ts:69-76`](./types.ts) |
| `ParseResponse` | interface | IPC response with results, errors, or streaming data | [`types.ts:81-99`](./types.ts) |
| `SubprocessPoolStats` | interface | Pool statistics (workers, tasks, timing, restarts) | [`types.ts:108-119`](./types.ts) |
| `SubprocessPoolOptions` | interface | Pool creation options (size, memory, keepalive, streaming) | [`types.ts:168-199`](./types.ts) |
| `QueuedTask` | interface | Queued task with files and resolve/reject | [`types.ts:204-210`](./types.ts) |
| `BinaryEmbedding` | interface | Binary embedding with vector buffer and metadata | [`types.ts:124-129`](./types.ts) |
| `EmbeddingTextItem` | interface | Text item for centralized embedding generation | [`types.ts:140-147`](./types.ts) |
| `EmbeddingsCallback` | type | Callback for receiving binary embeddings | [`types.ts:134-134`](./types.ts) |
| `EmbeddingTextsCallback` | type | Callback for receiving embedding texts | [`types.ts:153-153`](./types.ts) |
| `StreamingResultCallback` | type | Callback for streaming parse results | [`types.ts:158-199`](./types.ts) |

## Dependencies

### Internal Modules

| Module | Purpose |
|--------|---------|
| `types/parser` | ParseResult, ParserOptions types |
| `types/semantic` | WorkerEmbeddingConfig type |
| `logging` | Structured logging |

### External Packages

| Package | Purpose |
|---------|---------|
| (none) | Uses Node.js built-in `child_process` module |

## Behavioral Properties

| Property | Value |
|----------|-------|
| IPC serialization | V8 native `advanced` mode (structured clone) |
| Concurrent task handling | `Map<taskId, PendingTask>` per worker (no race conditions) |
| Process types | Bun.spawn or Node.js fork(), auto-detected |

## Error Handling

Subprocess kill errors are silently ignored (process may already be dead). Unexpected exit events are forwarded to the parent pool via `onUnexpectedExit` callback. Bun stderr is read asynchronously with read errors suppressed on process exit.

## Known Limitations

- Bun process wrapper provides only a subset of ChildProcess interface (no full event emitter support).
- Legacy `pendingResolve`/`pendingReject` fields on SubprocessState are kept for backward compatibility but should not be used.
- Worker environment variables are the only way to pass initial configuration (language, worker ID).

## Exports



## Files

| File | Description |
|------|-------------|
| `types.ts` | Type definitions for processes, IPC messages, pool configuration, and embeddings |
| `spawner.ts` | Platform-specific subprocess creation for Bun and Node.js |
| `index.ts` | Re-exports spawner functions and all types |
