import ProviderManager from "./providerManager.js";
import { AIUnavailableError } from "./errors.js";

/**
 * Shared AI Service
 *
 * The single entry point for the rest of the application to talk to any LLM
 * provider. It:
 *   - hides provider-specific SDKs / HTTP details,
 *   - exposes ONE unified interface (generate, stream, healthCheck, etc.),
 *   - prevents duplicated provider initialization (single ProviderManager),
 *   - preserves backward compatibility with the existing voice assistant via
 *     the `models` object (models.generateContent / models.streamGenerateContent),
 *     so the voice router and legacy callers keep working unchanged.
 *
 * Future agents (Research, Drug Analysis, Patent, Clinical Trial, Report)
 * should call this service directly without knowing which provider is used.
 */
export default class AIService {
  constructor(opts = {}) {
    this.manager = opts.manager || new ProviderManager(opts);
    this.defaultProvider = this.manager.defaultProvider;

    // Backward-compatible view that mirrors the old Gemini/CustomAIClient
    // `models` interface used by the voice assistant and other routes.
    this.models = {
      generateContent: async (params, options = {}) => {
        // Extract an optional `model` from the params (legacy callers pass
        // `model` alongside `contents`/`config`) and forward it as an option.
        const modelOverride =
          params && typeof params === "object" ? params.model : undefined;
        const result = await this.generateResponse(params, {
          ...options,
          ...(modelOverride ? { model: modelOverride } : {}),
        });
        return { text: result.text };
      },
      streamGenerateContent: async (params, onDelta, options = {}) => {
        const modelOverride =
          params && typeof params === "object" ? params.model : undefined;
        const result = await this.streamResponse(params, onDelta, {
          ...options,
          ...(modelOverride ? { model: modelOverride } : {}),
        });
        return { text: result.text };
      },
    };
  }

  /**
   * Unified generation entry point.
   * @param {string|object} input
   * @param {object} [options] { provider, model, timeoutMs }
   * @returns {Promise<{ text: string, provider: string }>}
   */
  async generateResponse(input, options = {}) {
    return this.manager.generateResponse(input, options);
  }

  /**
   * Unified streaming entry point.
   * @param {string|object} input
   * @param {(delta: string) => void} onDelta
   * @param {object} [options] { provider, model, timeoutMs }
   */
  async streamResponse(input, onDelta, options = {}) {
    return this.manager.streamResponse(input, onDelta, options);
  }

  /** Convenience: just get the text. */
  async chat(prompt, options = {}) {
    const result = await this.generateResponse(prompt, options);
    return result.text;
  }

  /** Convenience: get text + provider used. */
  async generate(prompt, options = {}) {
    return this.generateResponse(prompt, options);
  }

  /** Health-check a specific provider (or default). Never throws. */
  async healthCheck(providerName) {
    return this.manager.healthCheck(providerName);
  }

  /** Health-check all providers. Never throws. */
  async healthCheckAll() {
    return this.manager.healthCheckAll();
  }

  /** List registered providers. */
  listProviders() {
    return this.manager.listProviders();
  }

  /** List providers with their enabled/missing-key status. */
  status() {
    return this.manager.detectMissingKeys();
  }

  /** The default provider name (configurable). */
  providerName() {
    return this.defaultProvider;
  }
}
