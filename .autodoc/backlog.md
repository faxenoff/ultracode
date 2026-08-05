# Backlog

> Open tasks and roadmap items. Updated: 2026-02-28.

## Ready

### TEI gRPC Migration

**Documentation:** ~~[TEI_GRPC_MIGRATION_PLAN.md](../docs/TEI_GRPC_MIGRATION_PLAN.md)~~ (deleted)

**Status:** READY -- TEI 1.9.1+ supports Blackwell natively. gRPC image available (`120-1.9.1-grpc`).

**Current speed (HTTP):** 1169 emb/s (Accumulator), peak 2442 emb/s (RTX 5090, e5-small)

**Expected results (gRPC):**
- Latency: ~10ms -> ~3-5ms (HTTP overhead eliminated)
- Throughput: 1169 -> 1500+ emb/s (estimate)
- GPU utilization: higher due to streaming

**gRPC image tags for Blackwell:** `120-1.9.1-grpc`, `120-latest-grpc`

### Benchmark New Models

**Status:** Models added to catalog, not yet tested.

- [ ] **EmbeddingGemma-300M** (`tei-embeddinggemma-300m`) -- SOTA <500M params, 768D, 100+ languages. Action: launch container with `120-latest`, run indexing, measure emb/s and search quality vs e5-small.
- [ ] **Qwen3-Embedding-0.6B** (`vllm-qwen3-embedding-0.6b`) -- code search model, 1024D. Action: launch vLLM container, run indexing, compare code search quality vs e5-base.
- [ ] **vLLM on Blackwell** -- current benchmark 1352 emb/s was obtained before switching to `120-latest`. Needs re-measurement.

## Medium Priority

### TEI Accumulator Tuning

**Status:** Basic optimizations applied, room for improvement.

**Completed:**
- [x] Configurable `parallelBatches` (instead of hardcoded 12)
- [x] TEI-specific: `queueBatchSize=50`, `parallelBatches=4`
- [x] Backoff 500ms on 429 "overloaded"

**TODO:**
- [ ] Exponential backoff instead of fixed 500ms (500 -> 1000 -> 2000ms, max retries)
- [ ] Adaptive `parallelBatches` -- auto-decrease on 429, increase on success
- [ ] Verify `concurrency: 16` in TEI config vs `parallelBatches: 4` -- possible desync
- [ ] Profiling: identify bottleneck -- network, TEI inference, or FAISS flush?

### Git Delta & Incremental Indexing

- [ ] `src/layered/delta-maintenance-service.ts:348` -- Add `getAllBranches()` to BranchManager
- [ ] `src/layered/git-delta-computer.ts:28-513` -- Implement `getEntitiesByFilePath` method
- [ ] `src/layered/incremental-update-queue.ts:248` -- Trigger full rebuild

### Parser Improvements

- [ ] ~~`src/parsers/swift-analyzer.ts:150`~~ (deleted) -- Create import relationships
- [ ] `src/agents/workers/worker-pool-manager.ts:305` -- Restart worker if needed

### Tool Parity (UltraSharp <-> UltraCode)

| Tool | UltraSharp | UltraCode |
|------|------------|-----------|
| `clean_index` | Done | TODO |
| `add_member` | Done | TODO |
| `rename_symbol` | Done | TODO |
| `find_and_replace` | Done | TODO |
| `create_file` | Done | TODO |
| `format_code` | Done | TODO |
| `analyze_code_impact` | TODO | Done |
| `copy_file` | TODO | Done |
| `rename_file` | TODO | Done |
| `analyze_hotspots` | TODO | Done |
| `suggest_refactoring` | TODO | Done |
| `validate_file` | TODO | Done |

### Multi-Process Architecture

**Documentation:** ~~[MULTIPROCESS_ARCHITECTURE.md](../docs/MULTIPROCESS_ARCHITECTURE.md)~~ (deleted)

- [ ] Move embeddings to worker thread
- [ ] Testing with multiple VS Code windows

### AI Conflict Resolver

**File:** `src/merge/engine/ai-conflict-resolver.ts:258`

- [ ] Implement more advanced heuristics for conflict resolution

## Success Metrics

| Metric | Target Value |
|--------|-------------|
| Fast Path coverage | >90% |
| Semantic matching accuracy | >80% |
| Auto-merge rate | >60% |
| Indexing speed | <10 sec / 1000 methods |
| Total merge time | <30 sec / 100K LOC |
| False positive conflicts | <5% |
| Missed conflicts | <2% |
