import OpenAICompatibleProvider from "./openAiCompatibleProvider.js";

/**
 * NVIDIA NIM provider — OpenAI-compatible chat completions.
 * Docs: https://integrate.api.nvidia.com (NIM API)
 */
export default class NVIDIAProvider extends OpenAICompatibleProvider {
  constructor(opts) {
    super({
      ...opts,
      name: "nvidia",
      baseUrl: opts.baseUrl || "https://integrate.api.nvidia.com/v1",
      model:
        opts.model || process.env.NVIDIA_MODEL || "meta/llama-3.3-70b-instruct",
    });
  }
}
