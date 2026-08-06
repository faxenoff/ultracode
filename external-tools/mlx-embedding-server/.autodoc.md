# MLX Embedding Server

## Overview

FastAPI server providing OpenAI-compatible embedding generation using Apple MLX framework for Metal GPU acceleration on Apple Silicon. Wraps the mlx-embedding-models library to offer a drop-in compatible endpoint for embedding inference, with configurable model loading, batch processing, and health monitoring. Designed as a standalone service accessible via HTTP with support for multiple models and request batching.

## Flow

```
HTTP Request
    ↓
FastAPI Router
    ├─→ GET  /health        → health() → HealthResponse
    ├─→ GET  /v1/models     → list_models() → ModelsResponse
    └─→ POST /v1/embeddings → create_embeddings() 
           ↓
       Load Model (if needed)
           ↓
       MLX Embedding Model.encode()
           ↓
       Normalize vectors
           ↓
       Format to OpenAI schema
           ↓
       EmbeddingResponse
```

## Entities

### Request/Response Models

- **EmbeddingRequest** — `server.py:60-66` — Pydantic model defining the incoming POST payload with text input and optional model name field.
- **EmbeddingData** — `server.py:66-72` — Pydantic model representing a single embedding vector with its embedding array, index, and object type marker.
- **EmbeddingUsage** — `server.py:72-77` — Pydantic model tracking token consumption with prompt_tokens and total_tokens counters.
- **EmbeddingResponse** — `server.py:77-84` — Pydantic model forming the complete response envelope with data list, usage stats, model name, and object type.
- **HealthResponse** — `server.py:84-90` — Pydantic model returning server status, loaded model name, and MLX framework availability.
- **ModelInfo** — `server.py:90-96` — Pydantic model describing a single available model with its identifier and object type.
- **ModelsResponse** — `server.py:96-101` — Pydantic model listing all available models as an array of ModelInfo objects.

### Endpoint Handlers

- **health** — `server.py:105-111` — GET endpoint returning HealthResponse with current model status and server readiness check.
- **list_models** — `server.py:112-118` — GET endpoint returning ModelsResponse listing the currently loaded embedding model.
- **create_embeddings** — `server.py:119-172` — POST endpoint processing EmbeddingRequest by encoding text via MLX model and returning embeddings in OpenAI format.

### Core Functions

- **load_model** — `server.py:175-194` — Initializes and caches the MLX EmbeddingModel from HuggingFace, returning the loaded model instance for inference.
- **main** — `server.py:194-215` — Entry point parsing command-line arguments (model name, port, batch size) and starting the uvicorn server with configured settings.

## Dependencies

**External:**
- `fastapi` — HTTP framework for routing and request handling
- `pydantic` — Data validation and serialization via BaseModel
- `uvicorn` — ASGI application server runner
- `mlx-embedding-models` — Apple MLX embedding model loader and inference engine
- `numpy` — Vector math for embedding normalization

**Design Pattern:**
- **Singleton Model Cache** — `load_model()` caches the model to avoid reloading on each request
- **OpenAI Schema Compatibility** — Response structures (EmbeddingResponse, EmbeddingData) mirror OpenAI's embedding API for drop-in compatibility