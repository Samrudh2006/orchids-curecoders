/**
 * Shared error types for the CureCoders multi-provider AI service.
 *
 * These give the ProviderManager enough structured information to implement
 * automatic fallback without crashing the server:
 *
 *  - AIConfigurationError  → missing/invalid API key or provider config.
 *                            Falls through to the next provider.
 *  - AITimeoutError        → the request/stream exceeded the configured
 *                            timeout. Falls through to the next provider.
 *  - AIProviderError       → the provider returned an error (network, HTTP,
 *                            auth, etc.). Falls through to the next provider.
 *  - AIUnavailableError    → no provider could fulfil the request at all.
 *                            Thrown to the caller as the final result.
 */

export class AIConfigurationError extends Error {
  constructor(message, { provider = null, cause } = {}) {
    super(message, cause ? { cause } : undefined);
    this.name = "AIConfigurationError";
    this.provider = provider;
    this.config = true;
  }
}

export class AITimeoutError extends Error {
  constructor(message, { provider = null, timeoutMs = 0, cause } = {}) {
    super(message, cause ? { cause } : undefined);
    this.name = "AITimeoutError";
    this.provider = provider;
    this.timeout = true;
    this.timeoutMs = timeoutMs;
  }
}

export class AIProviderError extends Error {
  constructor(message, { provider = null, status = undefined, cause } = {}) {
    super(message, cause ? { cause } : undefined);
    this.name = "AIProviderError";
    this.provider = provider;
    this.status = status;
    this.transient = true;
  }
}

export class AIUnavailableError extends Error {
  constructor(message, { attempts = [], cause } = {}) {
    super(message, cause ? { cause } : undefined);
    this.name = "AIUnavailableError";
    this.attempts = attempts;
  }
}

/**
 * Normalize a thrown error into a structured AI error so the manager can
 * decide whether to fall back or stop.
 *
 * @param {Error} error
 * @param {string|null} provider
 * @returns {Error}
 */
export function normalizeError(error, provider = null) {
  if (
    error instanceof AIConfigurationError ||
    error instanceof AITimeoutError ||
    error instanceof AIProviderError ||
    error instanceof AIUnavailableError
  ) {
    return error;
  }

  // AbortController abort due to our own timeout → classify as timeout.
  if (error && error.name === "AbortError") {
    return new AITimeoutError(
      `Provider "${provider}" request aborted (timeout).`,
      { provider },
    );
  }

  // Fetch network errors (TypeError: fetch failed, ECONNREFUSED, etc.)
  if (error && (error.name === "TypeError" || error.code === "ECONNREFUSED")) {
    return new AIProviderError(
      `Provider "${provider}" network error: ${error.message}`,
      { provider, cause: error },
    );
  }

  return new AIProviderError(
    `Provider "${provider}" failed: ${error.message}`,
    { provider, cause: error },
  );
}
