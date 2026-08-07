/**
 * Shared Multi-LLM Provider service — barrel export.
 *
 * The rest of the application should import from this single entry point so
 * it never talks to provider SDKs directly.
 */
export { default as AIService } from "./aiService.js";
export { default as ProviderManager } from "./providerManager.js";
export { default as AIProvider } from "./aiProvider.js";
export {
  AIProviderError,
  AIConfigurationError,
  AITimeoutError,
  AIUnavailableError,
  normalizeError,
} from "./errors.js";

export { default as GeminiProvider } from "./providers/geminiProvider.js";
export { default as GroqProvider } from "./providers/groqProvider.js";
export { default as OpenRouterProvider } from "./providers/openRouterProvider.js";
export { default as CohereProvider } from "./providers/cohereProvider.js";
export { default as MistralProvider } from "./providers/mistralProvider.js";
export { default as NVIDIAProvider } from "./providers/nvidiaProvider.js";
export { default as LegacyProvider } from "./providers/legacyProvider.js";
export { default as OpenAICompatibleProvider } from "./providers/openAiCompatibleProvider.js";
