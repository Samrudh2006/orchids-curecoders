import GeminiProvider from "./providers/geminiProvider.js";
import GroqProvider from "./providers/groqProvider.js";
import OpenRouterProvider from "./providers/openRouterProvider.js";
import CohereProvider from "./providers/cohereProvider.js";
import MistralProvider from "./providers/mistralProvider.js";
import NVIDIAProvider from "./providers/nvidiaProvider.js";
import LegacyProvider from "./providers/legacyProvider.js";
import {
  AIUnavailableError,
  AIConfigurationError,
  normalizeError,
} from "./errors.js";

/**
 * ProviderManager
 *
 * Responsibilities:
 *   - Load the configured providers (only those whose API keys exist).
 *   - Detect missing/commented-out API keys and disable those providers.
 *   - Select the requested provider (by name) from the available set.
 *   - Automatically fall back to the next provider in the configured order
 *     when a provider fails (network, timeout, HTTP error, etc.).
 *   - Log provider errors WITHOUT crashing the server.
 *   - Keep a single shared instance of each provider (lazy init, reuse).
 *
 * The default fallback order (configurable via AI_PROVIDER_FALLBACK_ORDER):
 *   gemini → groq → openrouter → mistral → nvidia → cohere → legacy
 */
export default class ProviderManager {
  /**
   * @param {object} [opts]
   * @param {string} [opts.defaultProvider]  default provider name
   * @param {string[]} [opts.fallbackOrder]  explicit fallback order
   * @param {boolean} [opts.includeLegacy]   include the legacy fallback provider
   */
  constructor(opts = {}) {
    this.defaultProvider = opts.defaultProvider || "gemini";
    this.includeLegacy =
      opts.includeLegacy !== undefined ? opts.includeLegacy : true;

    // Build the provider registry keyed by provider name.
    this.providers = this._buildProviders();

    // Resolve the fallback order (configurable, not hardcoded through the app).
    this.fallbackOrder = this._resolveFallbackOrder(opts.fallbackOrder);

    // Cache of the last error per provider (for diagnostics).
    this.lastErrors = new Map();
  }

  _buildProviders() {
    const registry = {};
    const add = (provider) => {
      if (provider && provider.providerName) {
        registry[provider.providerName()] = provider;
      }
    };

    add(new GeminiProvider({ apiKey: process.env.GEMINI_API_KEY }));
    add(new GroqProvider({ apiKey: process.env.GROQ_API_KEY }));
    add(new OpenRouterProvider({ apiKey: process.env.OPENROUTER_API_KEY }));
    add(new MistralProvider({ apiKey: process.env.MISTRAL_API_KEY }));
    add(new NVIDIAProvider({ apiKey: process.env.NVIDIA_API_KEY }));
    add(new CohereProvider({ apiKey: process.env.COHERE_API_KEY }));
    if (this.includeLegacy) {
      add(new LegacyProvider({}));
    }

    return registry;
  }

  /**
   * Resolve the fallback order. Priority:
   *   1. Explicit opts.fallbackOrder
   *   2. AI_PROVIDER_FALLBACK_ORDER env var (comma-separated)
   *   3. Built-in default
   */
  _resolveFallbackOrder(explicit) {
    const builtin = [
      "gemini",
      "groq",
      "openrouter",
      "mistral",
      "nvidia",
      "cohere",
      "legacy",
    ];

    if (explicit && Array.isArray(explicit) && explicit.length) {
      return explicit;
    }

    if (process.env.AI_PROVIDER_FALLBACK_ORDER) {
      const parsed = process.env.AI_PROVIDER_FALLBACK_ORDER.split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);
      if (parsed.length) {
        // Ensure any built-in providers not mentioned are appended after, so a
        // provider is never silently dropped from the available pool.
        const merged = [...parsed];
        for (const name of builtin) {
          if (!merged.includes(name)) merged.push(name);
        }
        return merged;
      }
    }

    return builtin;
  }

  /** List all registered providers. */
  listProviders() {
    return Object.values(this.providers);
  }

  /** Get a provider by name (or null if not registered). */
  getProvider(name) {
    return this.providers[name] || null;
  }

  /**
   * Return the ordered list of providers we can actually try, starting from
   * the requested provider (or the default), following the fallback order.
   */
  _orderedCandidates(requested) {
    const start = requested || this.defaultProvider;
    const order = this.fallbackOrder;
    const startIdx = order.indexOf(start);
    const ordered = [];
    if (startIdx >= 0) {
      ordered.push(...order.slice(startIdx));
      ordered.push(...order.slice(0, startIdx));
    } else {
      // Unknown requested provider → use the full configured order.
      ordered.push(...order);
      // Still attempt the specifically requested provider first if it exists.
      if (this.providers[start]) {
        ordered.unshift(start);
      }
    }
    return ordered;
  }

  /**
   * Whether a provider is enabled (has a valid API key).
   */
  isEnabled(name) {
    const provider = this.providers[name];
    return Boolean(provider && provider.enabled);
  }

  /**
   * Detect which providers are missing API keys. Returns a list of
   * { name, enabled, hasKey } entries for diagnostics.
   */
  detectMissingKeys() {
    return this.fallbackOrder.map((name) => {
      const provider = this.providers[name];
      return {
        name,
        enabled: Boolean(provider && provider.enabled),
        hasKey: Boolean(provider && provider.apiKey),
      };
    });
  }

  /**
   * Run a provider method across the ordered candidates with automatic
   * fallback. `fn` should be `(provider) => Promise<T>`.
   */
  async _withFallback(fn, requested, label) {
    const candidates = this._orderedCandidates(requested).filter((name) =>
      this.isEnabled(name),
    );

    if (candidates.length === 0) {
      throw new AIUnavailableError(
        "No AI provider is configured. Set at least one provider API key in .env.",
        { attempts: [] },
      );
    }

    const attempts = [];
    for (const name of candidates) {
      const provider = this.providers[name];
      try {
        const result = await fn(provider);
        this.lastErrors.delete(name);
        return result;
      } catch (error) {
        const normalized = normalizeError(error, name);
        this.lastErrors.set(name, normalized);
        attempts.push({ provider: name, error: normalized.message });
        // Log clearly but never crash.
        console.error(
          `[AI:Manager] Provider "${name}" failed during ${label}: ${normalized.message}`,
        );
        // Continue to the next candidate (automatic fallback).
      }
    }

    throw new AIUnavailableError(`All AI providers failed during ${label}.`, {
      attempts,
    });
  }

  /**
   * Generate a response using the requested (or default) provider, with
   * automatic fallback.
   *
   * @param {string|object} input
   * @param {object} [options]  { provider, model, timeoutMs }
   * @returns {Promise<{ text: string, provider: string }>}
   */
  async generateResponse(input, options = {}) {
    const requested = options.provider || this.defaultProvider;
    const result = await this._withFallback(
      (provider) => provider.generateResponse(input, options),
      requested,
      "generateResponse",
    );
    return { ...result, provider: result.provider || null };
  }

  /**
   * Stream a response. Falls back to non-streaming across providers.
   *
   * @param {string|object} input
   * @param {(delta: string) => void} onDelta
   * @param {object} [options]  { provider, model, timeoutMs }
   * @returns {Promise<{ text: string, provider: string }>}
   */
  async streamResponse(input, onDelta, options = {}) {
    const requested = options.provider || this.defaultProvider;
    const result = await this._withFallback(
      (provider) => provider.streamResponse(input, onDelta, options),
      requested,
      "streamResponse",
    );
    return { ...result, provider: result.provider || null };
  }

  /**
   * Health-check the requested provider (or default). Never throws — returns
   * a status object.
   */
  async healthCheck(providerName) {
    const name = providerName || this.defaultProvider;
    const provider = this.providers[name];
    if (!provider) {
      return { ok: false, provider: name, error: "Unknown provider." };
    }
    if (!provider.enabled) {
      return {
        ok: false,
        provider: name,
        error: "Provider disabled (no API key).",
      };
    }
    return provider.healthCheck();
  }

  /** Health-check ALL providers (best-effort, never throws). */
  async healthCheckAll() {
    const results = [];
    for (const name of this.fallbackOrder) {
      const provider = this.providers[name];
      if (!provider) {
        results.push({ provider: name, enabled: false, ok: false });
        continue;
      }
      if (!provider.enabled) {
        results.push({ provider: name, enabled: false, ok: false });
        continue;
      }
      try {
        const check = await provider.healthCheck();
        results.push({ provider: name, enabled: true, ...check });
      } catch (error) {
        results.push({
          provider: name,
          enabled: true,
          ok: false,
          error: normalizeError(error, name).message,
        });
      }
    }
    return results;
  }
}
