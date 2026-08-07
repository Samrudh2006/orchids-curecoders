import OpenAICompatibleProvider from "./openAiCompatibleProvider.js";

/**
 * Mistral provider — OpenAI-compatible chat completions.
 * Docs: https://docs.mistral.ai/api/
 */
export default class MistralProvider extends OpenAICompatibleProvider {
  constructor(opts) {
    super({
      ...opts,
      name: "mistral",
      baseUrl: opts.baseUrl || "https://api.mistral.ai/v1",
      model: opts.model || process.env.MISTRAL_MODEL || "mistral-small-latest",
    });
  }
}
