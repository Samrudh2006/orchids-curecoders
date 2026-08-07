import AIProvider from "../aiProvider.js";
import { AIProviderError, AITimeoutError, normalizeError } from "../errors.js";

/**
 * Base provider for any OpenAI-compatible chat-completions endpoint.
 *
 * Used by Groq, OpenRouter, Mistral, NVIDIA and the legacy CureCoders proxy.
 * Implements:
 *   - NON-streaming chat/completions (with JSON-instruction injection)
 *   - SSE streaming chat/completions (with onDelta callbacks)
 *   - Automatic timeout via AbortController
 *   - Reusable fetch (no extra SDK dependency)
 *
 * The interface mirrors what the old CustomAIClient exposed (models.*) while
 * being provider-agnostic.
 */
export default class OpenAICompatibleProvider extends AIProvider {
  constructor(opts) {
    super(opts);
    // Most OpenAI-compatible providers use /chat/completions under {baseUrl}.
    this.endpoint = opts.endpoint || "/chat/completions";
    this.streamSupported = opts.streamSupported !== false;
    this.extraHeaders = opts.extraHeaders || {};
    this.jsonProvider = opts.jsonProvider || false;
  }

  buildClient() {
    // No persistent SDK client needed — we use fetch. But we still validate
    // that we have an apiKey + baseUrl so misconfiguration fails fast.
    if (!this.apiKey) {
      throw new AIProviderError(
        `${this.providerName()} has no API key configured.`,
        { provider: this.providerName() },
      );
    }
    if (!this.baseUrl) {
      throw new AIProviderError(
        `${this.providerName()} has no base URL configured.`,
        { provider: this.providerName() },
      );
    }
    // Return a lightweight marker client.
    return { endpoint: this.endpoint };
  }

  _url() {
    const base = this.baseUrl.replace(/\/+$/, "");
    return base + this.endpoint;
  }

  _headers() {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.apiKey}`,
      ...this.extraHeaders,
    };
  }

  _buildMessages(prompt) {
    return [{ role: "user", content: prompt }];
  }

  /**
   * Perform a non-streaming chat completion.
   */
  async generateResponse(input, options = {}) {
    if (!this.enabled) {
      throw new AIProviderError(
        `${this.providerName()} is disabled (no API key).`,
        { provider: this.providerName() },
      );
    }

    let prompt = this._toPrompt(input);
    if (this._isJsonRequest(input)) {
      prompt = this._injectJsonInstruction(prompt, input);
    }

    const model = this._resolveModel(options, this.model);
    const url = this._url();
    const timeoutMs = options.timeoutMs || this.timeoutMs;

    this._log(
      `Request | URL: ${url} | Model: ${model} | inspects json=${this._isJsonRequest(input)}`,
    );

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    let response;
    try {
      response = await fetch(url, {
        method: "POST",
        headers: this._headers(),
        body: JSON.stringify({ model, messages: this._buildMessages(prompt) }),
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
      const err = new AIProviderError(
        `${this.providerName()} HTTP ${response.status} for model "${model}" at ${url}`,
        { provider: this.providerName(), status: response.status },
      );
      err.responseBody = bodyText;
      throw err;
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

    const text =
      data.choices &&
      data.choices[0] &&
      data.choices[0].message &&
      data.choices[0].message.content;
    if (typeof text !== "string") {
      throw new AIProviderError(
        `${this.providerName()} returned an unexpected payload shape.`,
        { provider: this.providerName() },
      );
    }

    return { text };
  }

  /**
   * Stream a chat completion via SSE. Calls onDelta(delta) per token and
   * returns the fully accumulated text.
   */
  async streamResponse(input, onDelta, options = {}) {
    if (!this.enabled) {
      throw new AIProviderError(
        `${this.providerName()} is disabled (no API key).`,
        { provider: this.providerName() },
      );
    }
    if (!this.streamSupported) {
      // Fall back to non-streaming for providers without SSE support.
      return super.streamResponse(input, onDelta, options);
    }

    let prompt = this._toPrompt(input);
    if (this._isJsonRequest(input)) {
      prompt = this._injectJsonInstruction(prompt, input);
    }
    const model = this._resolveModel(options, this.model);
    const url = this._url();
    const timeoutMs = options.timeoutMs || this.timeoutMs;

    this._log(`Stream | URL: ${url} | Model: ${model}`);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    let response;
    try {
      response = await fetch(url, {
        method: "POST",
        headers: this._headers(),
        body: JSON.stringify({
          model,
          stream: true,
          messages: this._buildMessages(prompt),
        }),
        signal: controller.signal,
      });
    } catch (fetchError) {
      clearTimeout(timer);
      throw normalizeError(fetchError, this.providerName());
    }
    clearTimeout(timer);

    if (!response.ok) {
      const errText = await response.text();
      this._logError(
        `Stream HTTP ${response.status} | ${errText.slice(0, 500)}`,
      );
      throw new AIProviderError(
        `${this.providerName()} streaming error: HTTP ${response.status}`,
        { provider: this.providerName(), status: response.status },
      );
    }

    if (!response.body) {
      throw new AIProviderError(
        `${this.providerName()} streaming returned no body.`,
        { provider: this.providerName() },
      );
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";
    let fullText = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const frames = buffer.split("\n\n");
        buffer = frames.pop() || "";
        for (const frame of frames) {
          const dataLine = frame.split("\n").find((l) => l.startsWith("data:"));
          if (!dataLine) continue;
          const payload = dataLine.slice(5).trim();
          if (payload === "[DONE]") continue;
          try {
            const json = JSON.parse(payload);
            const delta =
              json.choices &&
              json.choices[0] &&
              json.choices[0].delta &&
              (json.choices[0].delta.content || "");
            if (delta) {
              fullText += delta;
              if (onDelta) onDelta(delta);
            }
          } catch {
            /* ignore malformed frames */
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    return { text: fullText };
  }
}
