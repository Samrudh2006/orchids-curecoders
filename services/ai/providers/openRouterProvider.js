import OpenAICompatibleProvider from "./openAiCompatibleProvider.js";

/**
 * OpenRouter provider — OpenAI-compatible chat completions.
 * Docs: https://openrouter.ai/docs/api-reference
 */
export default class OpenRouterProvider extends OpenAICompatibleProvider {
  constructor(opts) {
    super({
      ...opts,
      name: "openrouter",
      baseUrl: opts.baseUrl || "https://openrouter.ai/api/v1",
      model: opts.model || process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini",
    });
  }
}
