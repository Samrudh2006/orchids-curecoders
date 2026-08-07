import OpenAICompatibleProvider from "./openAiCompatibleProvider.js";

/**
 * Legacy fallback provider.
 *
 * Preserves the exact behavior of the existing server.js AI client so the
 * application keeps working identically when no new provider key is present.
 * It points at the historical DEFAULT_AI_BASE_URL with the same key-source
 * discovery order used previously (DEFAULT_AI_API_KEY → PATENTS_API_KEY →
 * GROQ_API_KEY → MARKET_DATA_API_KEY → VITE_GEMINI_API_KEY).
 *
 * The OpenAI-compatible base class already implements the timeout + fallback
 * mechanics that the old CustomAIClient had hardcoded.
 */
export default class LegacyProvider extends OpenAICompatibleProvider {
  constructor(opts) {
    const keySources = [
      ["DEFAULT_AI_API_KEY", process.env.DEFAULT_AI_API_KEY],
      ["PATENTS_API_KEY", process.env.PATENTS_API_KEY],
      ["GROQ_API_KEY", process.env.GROQ_API_KEY],
      ["MARKET_DATA_API_KEY", process.env.MARKET_DATA_API_KEY],
      ["VITE_GEMINI_API_KEY", process.env.VITE_GEMINI_API_KEY],
    ];
    const active = keySources.find(([, v]) => v);
    const apiKey = opts.apiKey || (active ? active[1] : undefined);
    const keySourceName = opts.keySourceName || (active ? active[0] : "none");
    const model = opts.model || process.env.DEFAULT_AI_MODEL || "Kimi-K2.6";
    const baseUrl =
      opts.baseUrl ||
      process.env.DEFAULT_AI_BASE_URL ||
      "https://api.hcnsec.cn/v1";

    super({
      ...opts,
      name: "legacy",
      apiKey,
      model,
      baseUrl,
      // Expose the source name for diagnostics.
      keySourceName,
    });
    // The legacy route also used a verified fallback model (Kimi-K2.6). Since
    // the primary model here defaults to Kimi-K2.6 already, we keep it simple:
    // the OpenAI-compatible provider handles one model. If a different model is
    // configured via DEFAULT_AI_MODEL, we keep the verified fallback logic.
    this.fallbackModel = process.env.VERIFIED_FALLBACK_MODEL || "Kimi-K2.6";
  }

  providerName() {
    return "legacy";
  }

  async generateResponse(input, options = {}) {
    try {
      return await super.generateResponse(input, options);
    } catch (primaryError) {
      // Automatic fallback to the verified working model, mirroring the
      // original CustomAIClient behavior.
      if (this.model !== this.fallbackModel) {
        this._logError(
          `Primary model "${this.model}" failed. Retrying with verified fallback "${this.fallbackModel}".`,
        );
        try {
          return await super.generateResponse(input, {
            ...options,
            model: this.fallbackModel,
          });
        } catch (fallbackError) {
          this._logError(
            `Fallback model "${this.fallbackModel}" also failed:`,
            fallbackError.message,
          );
          throw primaryError;
        }
      }
      throw primaryError;
    }
  }

  async streamResponse(input, onDelta, options = {}) {
    try {
      return await super.streamResponse(input, onDelta, options);
    } catch (primaryError) {
      if (this.model !== this.fallbackModel) {
        this._logError(
          `Primary stream model "${this.model}" failed. Retrying with verified fallback "${this.fallbackModel}".`,
        );
        try {
          return await super.streamResponse(input, onDelta, {
            ...options,
            model: this.fallbackModel,
          });
        } catch (fallbackError) {
          this._logError(
            `Fallback stream model "${this.fallbackModel}" also failed:`,
            fallbackError.message,
          );
          throw primaryError;
        }
      }
      throw primaryError;
    }
  }
}
