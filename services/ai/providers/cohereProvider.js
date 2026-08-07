import AIProvider from "../aiProvider.js";
import { AIProviderError, normalizeError } from "../errors.js";

/**
 * Cohere provider — native REST chat API.
 * Docs: https://docs.cohere.com/reference/chat
 *
 * Note: Cohere does NOT use the OpenAI-compatible chat/completions shape, so
 * it gets its own implementation.
 */
export default class CohereProvider extends AIProvider {
  constructor(opts) {
    super(opts);
    this.name = "cohere";
    this.model = opts.model || process.env.COHERE_MODEL || "command-r-plus";
    this.baseUrl = opts.baseUrl || "https://api.cohere.com";
    // Cohere streaming support is optional; we default to non-streaming but
    // keep the interface satisfying via the base fallback.
    this.streamSupported = false;
  }

  buildClient() {
    if (!this.apiKey) {
      throw new AIProviderError("Cohere has no API key configured.", {
        provider: this.providerName(),
      });
    }
    return { baseUrl: this.baseUrl };
  }

  providerName() {
    return "cohere";
  }

  _url() {
    return `${this.baseUrl.replace(/\/+$/, "")}/v2/chat`;
  }

  _headers() {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.apiKey}`,
    };
  }

  _buildBody(prompt, model) {
    const body = {
      model,
      messages: [{ role: "user", content: prompt }],
    };
    return body;
  }

  async generateResponse(input, options = {}) {
    if (!this.enabled) {
      throw new AIProviderError("Cohere is disabled (no API key).", {
        provider: this.providerName(),
      });
    }
    let prompt = this._toPrompt(input);
    if (this._isJsonRequest(input)) {
      prompt = this._injectJsonInstruction(prompt, input);
    }
    const model = this._resolveModel(options, this.model);
    const url = this._url();
    const timeoutMs = options.timeoutMs || this.timeoutMs;

    this._log(`Request | URL: ${url} | Model: ${model}`);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    let response;
    try {
      response = await fetch(url, {
        method: "POST",
        headers: this._headers(),
        body: JSON.stringify(this._buildBody(prompt, model)),
        signal: controller.signal,
      });
    } catch (fetchError) {
      clearTimeout(timer);
      throw normalizeError(fetchError, this.providerName());
    }
    clearTimeout(timer);

    const bodyText = await response.text();
    if (!response.ok) {
      this._logError(`HTTP ${response.status} | ${bodyText.slice(0, 500)}`);
      throw new AIProviderError(
        `${this.providerName()} HTTP ${response.status} for model "${model}"`,
        { provider: this.providerName(), status: response.status },
      );
    }

    let data;
    try {
      data = JSON.parse(bodyText);
    } catch (e) {
      throw new AIProviderError(
        `${this.providerName()} returned invalid JSON.`,
        { provider: this.providerName(), cause: e },
      );
    }

    // Cohere v2 returns { message: { content: [{ type: 'text', text }] } }
    const text =
      data.message &&
      data.message.content &&
      Array.isArray(data.message.content)
        ? data.message.content.map((c) => (c && c.text ? c.text : "")).join("")
        : data.text;

    if (typeof text !== "string") {
      throw new AIProviderError(
        `${this.providerName()} returned an unexpected payload shape.`,
        { provider: this.providerName() },
      );
    }
    return { text };
  }
}
