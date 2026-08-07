# Phase 3 – Multi-LLM Provider Integration for ARIA

This guide documents the shared multi-provider AI service that powers every
LLM interaction in CureCoders. It centralizes Gemini, Groq, OpenRouter,
Cohere, Mistral, NVIDIA, and a legacy fallback provider behind one unified
interface, with automatic fallback and robust error handling.

---

## 1. Files Created

All new files live under `services/ai/`:

| File                                                | Responsibility                                                                                                                                                                                         |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `services/ai/index.js`                              | Barrel export — the single import point for the rest of the app.                                                                                                                                       |
| `services/ai/aiService.js`                          | `AIService` — the facades the rest of the application talks to. Exposes `generateResponse`, `streamResponse`, `chat`, `generate`, `healthCheck`, `status`, plus a backward-compatible `models` object. |
| `services/ai/providerManager.js`                    | `ProviderManager` — loads providers, detects missing keys, selects the requested provider, automatic fallback, error logging.                                                                          |
| `services/ai/aiProvider.js`                         | `AIProvider` — abstract base class / interface with lazy client init and input normalization.                                                                                                          |
| `services/ai/errors.js`                             | Structured error classes (`AIConfigurationError`, `AITimeoutError`, `AIProviderError`, `AIUnavailableError`) and `normalizeError`.                                                                     |
| `services/ai/providers/openAiCompatibleProvider.js` | Base class for any OpenAI-compatible endpoint (chat-completions + SSE streaming + timeout).                                                                                                            |
| `services/ai/providers/geminiProvider.js`           | Gemini via `@google/genai` SDK (native JSON schema + streaming).                                                                                                                                       |
| `services/ai/providers/groqProvider.js`             | Groq (OpenAI-compatible).                                                                                                                                                                              |
| `services/ai/providers/openRouterProvider.js`       | OpenRouter (OpenAI-compatible).                                                                                                                                                                        |
| `services/ai/providers/mistralProvider.js`          | Mistral (OpenAI-compatible).                                                                                                                                                                           |
| `services/ai/providers/nvidiaProvider.js`           | NVIDIA NIM (OpenAI-compatible).                                                                                                                                                                        |
| `services/ai/providers/cohereProvider.js`           | Cohere native REST chat API.                                                                                                                                                                           |
| `services/ai/providers/legacyProvider.js`           | Preserves the previous `CustomAIClient` behavior (key-source discovery + Kimi-K2.6 fallback).                                                                                                          |
| `services/ai/providers/README.md`                   | (optional) provider notes.                                                                                                                                                                             |

## 2. Files Modified

| File             | Change                                                                                                                                                                                                                                                                                                                    |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `server.js`      | Replaced the inline `CustomAIClient` with a shared `AIService`. Wired the voice router, chat router, `/api/generate`, `/api/decompose`, `/api/synthesize`, `/api/voice-chat`, `/api/agent-data` all through the shared service. Added `/api/ai/providers` (status) and `/api/ai/generate` (unified generation) endpoints. |
| `routes/chat.js` | Converted to a factory `createChatRouter(getAi)` that receives the shared `AIService` — no more direct `VITE_GEMINI_API_KEY` fetch.                                                                                                                                                                                       |
| `TODO.md`        | Progress tracking for Phase 3.                                                                                                                                                                                                                                                                                            |

No frontend changes were required. The voice assistant flow is unchanged from
the client's perspective.

## 3. Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Acting Application                       │
│  voice router · chat router · agents · /api/generate · ...  │
└───────────────────────────┬─────────────────────────────────┘
                            │  (only talks to the service)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Shared AI Service (AIService)            │
│   generateResponse() · streamResponse() · healthCheck()    │
│   chat() · status() · models.* (backward-compatible)       │
└───────────────────────────┬─────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     ProviderManager                         │
│  load providers · detect missing keys · select · fallback  │
└───────────┬───────────┬──────────┬───────────┬──────────────┘
            ▼           ▼          ▼           ▼
     ┌────────────┐ ┌──────────┐ ┌─────────┐ ┌──────────┐
     │  Gemini    │ │   Groq   │ │ Cohere  │ │  Legacy  │
     │ Provider   │ │ Provider │ │ Provider│ │ Provider │
     │  (SDK)     │ │ (OpenAI) │ │ (REST)  │ │ (OpenAI) │
     └────────────┘ └──────────┘ └─────────┘ └──────────┘
        + OpenRouter · Mistral · NVIDIA (OpenAI-compatible)
```

Every provider implements the same interface:

- `providerName()` → string
- `generateResponse(input, options)` → `{ text }`
- `streamResponse(input, onDelta, options)` → `{ text }`
- `healthCheck()` → `{ ok, latencyMs }`
- `enabled` flag (false when no API key)

Because callers only depend on the interface, providers can be swapped
without changing any business logic.

## 4. Provider Selection Flow

1. A caller invokes `ai.generateResponse(input, { provider, model })` (or uses
   `ai.models.generateContent(...)` for backward compatibility).
2. `AIService` delegates to `ProviderManager.generateResponse`.
3. The manager builds the ordered candidate list starting at the requested
   provider (or the default, `gemini`), following the configured fallback
   order.
4. It filters out disabled providers (missing API key).
5. It calls the first enabled candidate's `generateResponse`.
6. If it fails, the error is normalized, logged, and the manager tries the
   next candidate (automatic fallback) — the server never crashes.
7. If all candidates fail, an `AIUnavailableError` is thrown.

## 5. Fallback Flow

Default fallback order (configurable via `AI_PROVIDER_FALLBACK_ORDER`):

```
gemini → groq → openrouter → mistral → nvidia → cohere → legacy
```

- **Missing API key** → that provider is disabled only (skipped).
- **Provider init failure** → logged, next provider tried.
- **Network / HTTP / auth failure** → logged, next provider tried.
- **Timeout** → AbortController aborts after `timeoutMs` (default 15s), next
  provider tried.
- **All fail** → `AIUnavailableError` returned to the caller as the final
  response (e.g. HTTP 503 from `/api/ai/generate`).

The `legacy` provider additionally preserves the old single-provider
model-fallback behavior (primary → Kimi-K2.6).

## 6. Request Flow

```
User request
   │
   ▼
Sarvam STT ──► text ──► Shared AI Service
                            │
                            ▼
                     Selected Provider
                     (Gemini, Groq, ... )
                            │
                            ▼  { text }
                     Sarvam TTS ──► audio ──► User
```

The voice assistant previously was:

```
Sarvam STT → AI → Sarvam TTS
```

and is now:

```
Sarvam STT → Shared AI Service → Selected Provider → Sarvam TTS
```

No frontend changes are needed.

## 7. Configuration Summary

Environment variables (all read from `.env` / `dotenv`):

| Variable                                                                                               | Purpose                                                        |
| ------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------- |
| `GEMINI_API_KEY`                                                                                       | Enables the Gemini provider (default).                         |
| `GROQ_API_KEY`                                                                                         | Enables the Groq provider.                                     |
| `OPENROUTER_API_KEY`                                                                                   | Enables the OpenRouter provider.                               |
| `COHERE_API_KEY`                                                                                       | Enables the Cohere provider.                                   |
| `MISTRAL_API_KEY`                                                                                      | Enables the Mistral provider.                                  |
| `NVIDIA_API_KEY`                                                                                       | Enables the NVIDIA provider.                                   |
| `DEFAULT_AI_PROVIDER`                                                                                  | Overrides the default provider (default `gemini`).             |
| `AI_PROVIDER_FALLBACK_ORDER`                                                                           | Comma-separated fallback order override.                       |
| `DEFAULT_AI_BASE_URL`                                                                                  | Legacy provider base URL (default `https://api.hcnsec.cn/v1`). |
| `DEFAULT_AI_API_KEY` / `PATENTS_API_KEY` / `MARKET_DATA_API_KEY` / `VITE_GEMINI_API_KEY`               | Legacy key-source discovery for the `legacy` provider.         |
| `DEFAULT_AI_MODEL`                                                                                     | Legacy primary model (default `Kimi-K2.6`).                    |
| `GEMINI_MODEL` / `GROQ_MODEL` / `OPENROUTER_MODEL` / `COHERE_MODEL` / `MISTRAL_MODEL` / `NVIDIA_MODEL` | Optional per-provider model overrides.                         |

No API key is hardcoded anywhere in the project.

## 8. Testing Instructions

### 8.1 Boot the server

```bash
npm run server
# or
node server.js
```

You should see:

```
Server running on http://localhost:3001
✅ Database connection configured (DATABASE_URL present).
```

### 8.2 Check provider status

```bash
curl http://localhost:3001/api/ai/providers
```

Returns `defaultProvider`, `fallbackOrder`, and per-provider
`enabled`/`hasKey` status.

### 8.3 Unified generation (with automatic fallback)

```bash
curl -X POST http://localhost:3001/api/ai/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Say OK"}'
```

Returns `{ "text": "...", "provider": "..." }`. If the default provider
(Gemini) hits a quota/limit, the manager automatically falls back to the next
working provider (e.g. Groq).

### 8.4 Force a specific provider

```bash
curl -X POST http://localhost:3001/api/ai/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Say OK","provider":"groq"}'
```

### 8.5 Voice assistant (unchanged)

Use the existing voice chat endpoint:

```bash
curl -X POST http://localhost:3001/api/voice/chat \
  -H "Content-Type: application/json" \
  -d '{"text":"What is ARIA?","stream":true}'
```

The voice assistant continues to work exactly as before; the only difference
is that its conversational brain now routes through the shared multi-provider
service.

### 8.6 Unit / syntax checks

```bash
node --check server.js
node --check routes/chat.js
node --check services/ai/aiService.js
node --check services/ai/providerManager.js
```

All should exit cleanly.

## 9. Future Agent Compatibility

Future agents (Research, Drug Analysis, Patent, Clinical Trial, Report) should
call the Shared AI Service directly, e.g.:

```js
import { AIService } from "./services/ai/index.js";

const ai = new AIService();
const { text, provider } = await ai.generate("Analyze this molecule");
```

Each agent uses the same single service, so they never need to know which
provider is behind the scenes, and they automatically benefit from provider
selection, fallback, health checks, and error handling.
