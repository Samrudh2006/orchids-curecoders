import OpenAICompatibleProvider from "./openAiCompatibleProvider.js";

/**
 * Groq provider — OpenAI-compatible chat completions.
 * Docs: https://console.groq.com/docs/openai
 */
export default class GroqProvider extends OpenAICompatibleProvider {
  constructor(opts) {
    super({
      ...opts,
      name: "groq",
      baseUrl: opts.baseUrl || "https://api.groq.com/openai/v1",
      model: opts.model || "llama-3.3-70b-versatile",
    });
  }
}
