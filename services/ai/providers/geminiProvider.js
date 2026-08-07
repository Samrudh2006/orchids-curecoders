import AIProvider from "../aiProvider.js";
import { AIProviderError, normalizeError } from "../errors.js";

/**
 * Gemini provider backed by the official @google/genai SDK.
 *
 * Supports:
 *   - generateContent (non-streaming)
 *   - streamGenerateContent (per-token delta)
 *   - Native JSON structured output via config.responseSchema
 *
 * The SDK client is created lazily and reused (avoiding repeated auth).
 */
export default class GeminiProvider extends AIProvider {
  constructor(opts) {
    super(opts);
    // Default Gemini model.
    this.model = opts.model || "gemini-2.0-flash";
    this.apiVersion = opts.apiVersion || "v1beta";
    this.streamSupported = true;
  }

  buildClient() {
    if (!this.apiKey) {
      throw new AIProviderError("Gemini has no API key configured.", {
        provider: this.providerName(),
      });
    }
    // Lazy import so the module graph stays light if Gemini is never used.
    // @google/genai is already a dependency of the project.
    return import("@google/genai").then(({ GoogleGenAI }) => {
      return new GoogleGenAI({ apiKey: this.apiKey });
    });
  }

  async _getClient() {
    const value = this._initClient();
    return value instanceof Promise ? await value : value;
  }

  providerName() {
    return "gemini";
  }

  _toGeminiContents(prompt) {
    // Gemini expects [{ role: 'user', parts: [{ text }] }]
    return [{ role: "user", parts: [{ text: prompt }] }];
  }

  _buildConfig(input) {
    const config = this._extractConfig(input);
    if (config) {
      return { ...config };
    }
    return undefined;
  }

  async generateResponse(input, options = {}) {
    if (!this.enabled) {
      throw new AIProviderError("Gemini is disabled (no API key).", {
        provider: this.providerName(),
      });
    }
    const client = await this._getClient();
    const prompt = this._toPrompt(input);
    const model = this._resolveModel(options, this.model);
    const geminiConfig = this._buildConfig(input);

    this._log(`generateContent | Model: ${model}`);

    try {
      const response = await client.models.generateContent({
        model,
        contents: this._toGeminiContents(prompt),
        config: geminiConfig,
      });
      const text =
        response.candidates &&
        response.candidates[0] &&
        response.candidates[0].content &&
        response.candidates[0].content.parts &&
        response.candidates[0].content.parts.map((p) => p.text || "").join("");
      if (typeof text !== "string") {
        throw new AIProviderError(
          "Gemini returned an unexpected payload shape.",
          { provider: this.providerName() },
        );
      }
      return { text };
    } catch (error) {
      throw normalizeError(error, this.providerName());
    }
  }

  async streamResponse(input, onDelta, options = {}) {
    if (!this.enabled) {
      throw new AIProviderError("Gemini is disabled (no API key).", {
        provider: this.providerName(),
      });
    }
    const client = await this._getClient();
    const prompt = this._toPrompt(input);
    const model = this._resolveModel(options, this.model);
    const geminiConfig = this._buildConfig(input);

    this._log(`streamGenerateContent | Model: ${model}`);

    try {
      let fullText = "";
      const stream = await client.models.streamGenerateContent({
        model,
        contents: this._toGeminiContents(prompt),
        config: geminiConfig,
      });
      for await (const chunk of stream) {
        const text =
          chunk.candidates &&
          chunk.candidates[0] &&
          chunk.candidates[0].content &&
          chunk.candidates[0].content.parts &&
          chunk.candidates[0].content.parts.map((p) => p.text || "").join("");
        if (text) {
          fullText += text;
          if (onDelta) onDelta(text);
        }
      }
      return { text: fullText };
    } catch (error) {
      throw normalizeError(error, this.providerName());
    }
  }
}
