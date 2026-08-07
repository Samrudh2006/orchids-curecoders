import { AIProviderError, normalizeError } from "./errors.js";

/**
 * Base provider interface for the CureCoders multi-provider AI service.
 *
 * Every concrete provider extends this class and implements the common
 * contract so the rest of the application can swap providers without knowing
 * which SDK / HTTP endpoint is behind the scenes.
 *
 * Required methods (implemented by subclasses):
 *   generateResponse(input)  → { text }
 *   streamResponse(input, onDelta)  → { text }   (optional support)
 *   healthCheck()            → { ok, latencyMs }
 *   providerName()           → string
 *
 * Input normalization (generateResponse / streamResponse):
 *   @param {string|{contents: any, config?: object}|{prompt: string}} input
 *   @param {object} [options]  { model, timeoutMs }
 *
 * The provider keeps a single shared client instance (lazy-initialized) so we
 * avoid repeated authentication and duplicate object creation.
 */
export default class AIProvider {
  constructor({ name, apiKey, model, baseUrl, timeoutMs = 15000 } = {}) {
    this.name = name || "unknown";
    this.apiKey = apiKey;
    this.model = model;
    this.baseUrl = baseUrl;
    this.timeoutMs = timeoutMs;
    this._client = null;
    this._clientInitError = null;
    this.enabled = Boolean(apiKey);
  }

  /** Human-readable provider identifier. Override in subclasses. */
  providerName() {
    return this.name;
  }

  /**
   * Lazy client initializer. Subclasses override this to build their SDK or
   * HTTP client. If it fails, the failure is cached so we don't retry bad
   * initialization repeatedly, and a configuration error is thrown.
   *
   * Supports both synchronous and Promise-returning `buildClient()` (e.g. the
   * Gemini provider dynamically imports the SDK). When a Promise is returned,
   * it is cached and awaited on subsequent calls.
   */
  _initClient() {
    if (this._client) {
      return this._client instanceof Promise ? this._client : this._client;
    }
    if (this._clientInitError) throw this._clientInitError;
    try {
      const built = this.buildClient();
      if (built && typeof built.then === "function") {
        // Cache the promise so we don't re-import/re-auth every call.
        this._client = built.catch((err) => {
          this._client = null;
          this._clientInitError = err;
          throw err;
        });
        return this._client;
      }
      this._client = built;
      return this._client;
    } catch (err) {
      this._clientInitError = err;
      throw err;
    }
  }

  /** Override in subclasses. */
  buildClient() {
    return null;
  }

  /**
   * Normalize a wide variety of caller inputs into a single prompt string.
   * Existing callers pass:
   *   - a plain string
   *   - { contents: "..." }
   *   - { contents: [{ parts: [{ text }] }] }
   *   - { prompt: "..." }
   */
  _toPrompt(input) {
    if (typeof input === "string") return input;
    if (input && typeof input === "object") {
      if (input.prompt) return input.prompt;
      if (input.contents) {
        const c = input.contents;
        if (typeof c === "string") return c;
        if (Array.isArray(c) && c.length) {
          const first = c[0];
          if (first && typeof first === "object") {
            if (first.parts && Array.isArray(first.parts)) {
              const t = first.parts
                .map((p) => (p && p.text ? p.text : ""))
                .join(" ");
              if (t) return t;
            }
            if (first.text) return first.text;
          }
          if (first && typeof c[0] === "string") return c.join(" ");
        }
      }
      if (input.prompt) return input.prompt;
    }
    return String(input || "");
  }

  /**
   * Extract the response schema (used for JSON-mode requests) from the input,
   * mirroring the shape the old Gemini integration passed through `config`.
   */
  _extractConfig(input) {
    if (input && typeof input === "object" && input.config) {
      return input.config;
    }
    return null;
  }

  /** Whether the caller asked for raw JSON output. */
  _isJsonRequest(input) {
    const config = this._extractConfig(input);
    return Boolean(config && config.responseMimeType === "application/json");
  }

  /**
   * Append a strict JSON instruction to the prompt when the caller requested
   * `responseMimeType: application/json`. Providers that natively support
   * structured output (e.g. Gemini) override generateResponse/streamResponse
   * and use the schema directly; OpenAI-compatible providers rely on this.
   */
  _injectJsonInstruction(prompt, input) {
    const config = this._extractConfig(input);
    if (config && config.responseMimeType === "application/json") {
      const schema = config.responseSchema || {};
      prompt += `\n\nCRITICAL: You MUST return ONLY valid json matching this schema: ${JSON.stringify(schema)}. Do NOT wrap the json in markdown blocks (e.g. \`\`\`json). Return pure, raw json object only.`;
    }
    return prompt;
  }

  /**
   * Optional model override. Subclasses may ignore (e.g. use their own
   * default model if none provided).
   */
  _resolveModel(options, fallback) {
    if (options && options.model) return options.model;
    return fallback || this.model;
  }

  /**
   * Generate a text response. Must be implemented by subclasses.
   * @abstract
   */
  async generateResponse() {
    throw new AIProviderError(
      `Provider "${this.providerName()}" does not implement generateResponse().`,
      { provider: this.providerName() },
    );
  }

  /**
   * Stream a text response. Must be implemented by subclasses that support
   * streaming. Defaults to a non-streaming fallback so every provider can
   * satisfy the interface.
   */
  async streamResponse(input, onDelta) {
    const { text } = await this.generateResponse(input);
    if (onDelta && text) onDelta(text);
    return { text };
  }

  /**
   * Health check. Defaults to a lightweight generateResponse probe.
   * Subclasses may override for a cheaper check.
   */
  async healthCheck() {
    const start = Date.now();
    try {
      const { text } = await this.generateResponse({
        prompt: "Reply with the single word: OK",
      });
      return {
        ok: Boolean(text),
        provider: this.providerName(),
        latencyMs: Date.now() - start,
      };
    } catch (error) {
      return {
        ok: false,
        provider: this.providerName(),
        latencyMs: Date.now() - start,
        error: normalizeError(error, this.providerName()).message,
      };
    }
  }

  /** Uniform logging helper used by subclasses. */
  _log(...args) {
    console.log(`[AI:${this.providerName()}]`, ...args);
  }

  _logError(...args) {
    console.error(`[AI:${this.providerName()}]`, ...args);
  }
}
