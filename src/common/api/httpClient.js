const DEFAULT_TIMEOUT_MS = 8000;
const DEFAULT_MAX_RETRIES = 2;
const RETRYABLE_STATUS = new Set([408, 429]);
const inflightRequests = new Map();

// ── Rate Limiter & Pacing Queue for OpenF1 ──────────────────────────────────────
const OPENF1_HOST_FRAGMENT = "openf1";
const MIN_REQUEST_INTERVAL_MS = 360; // Max ~2.7 req/sec, safely within OpenF1's 3 req/sec limit
let lastOpenF1RequestTime = 0;
let globalRateLimitCooldownUntil = 0;

// Promise chain to sequence OpenF1 requests smoothly
let openF1Queue = Promise.resolve();

const scheduleOpenF1Request = () => {
  openF1Queue = openF1Queue.then(async () => {
    const now = Date.now();
    // 1. If currently in rate-limit cooldown, pause until cooldown expires
    if (globalRateLimitCooldownUntil > now) {
      const waitTime = globalRateLimitCooldownUntil - now;
      await sleep(waitTime);
    }

    // 2. Space requests to respect rate limit (< 3 req/sec)
    const timeSinceLast = Date.now() - lastOpenF1RequestTime;
    if (timeSinceLast < MIN_REQUEST_INTERVAL_MS) {
      await sleep(MIN_REQUEST_INTERVAL_MS - timeSinceLast);
    }
    lastOpenF1RequestTime = Date.now();
  });
  return openF1Queue;
};

// ── In-Memory L1 Cache (Prevents duplicate API calls across tabs/components) ────
const responseCache = new Map();
const DEFAULT_CACHE_TTL_MS = 1000 * 60 * 5; // 5 minutes default in-memory cache

const getCacheKey = (url, options = {}) => {
  const method = (options.method || "GET").toUpperCase();
  return `${method}:${url}`;
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const parseRetryAfterMs = (retryAfterHeader) => {
  if (!retryAfterHeader) return null;

  const seconds = Number(retryAfterHeader);
  if (Number.isFinite(seconds) && seconds >= 0) {
    return Math.round(seconds * 1000);
  }

  const dateMs = new Date(retryAfterHeader).getTime();
  if (!Number.isFinite(dateMs)) return null;

  const delta = dateMs - Date.now();
  return delta > 0 ? delta : null;
};

export const isRetryableStatus = (status) => {
  if (!Number.isFinite(status)) return false;
  return RETRYABLE_STATUS.has(status) || status >= 500;
};

export class ApiRequestError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = "ApiRequestError";
    this.status = details.status ?? null;
    this.code = details.code ?? "REQUEST_FAILED";
    this.url = details.url ?? null;
    this.source = details.source ?? null;
    this.retryAfterMs = details.retryAfterMs ?? null;
    this.retryable = details.retryable ?? false;
    this.originalError = details.originalError;
  }
}

const toApiRequestError = (error, details) => {
  if (error instanceof ApiRequestError) return error;

  const retryable = details.retryable ?? isRetryableStatus(details.status);
  const message = details.message || error?.message || "Request failed";

  return new ApiRequestError(message, {
    ...details,
    retryable,
    originalError: error,
  });
};

const computeRetryDelay = (attemptIndex, retryAfterMs = null, baseDelayMs = 500) => {
  if (retryAfterMs != null) return retryAfterMs;

  const expDelay = baseDelayMs * 2 ** Math.max(0, attemptIndex);
  const jitter = Math.round(Math.random() * 250);
  return expDelay + jitter;
};

const shouldRetry = (error, attempt, maxRetries) => {
  if (attempt >= maxRetries) return false;
  if (!(error instanceof ApiRequestError)) return false;
  if (!error.retryable) return false;
  return true;
};

const parseResponse = async (response, parseAs = "json") => {
  if (parseAs === "text") {
    return response.text();
  }
  if (parseAs === "raw") {
    return response;
  }

  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    throw new ApiRequestError("Invalid JSON response", {
      status: response.status,
      code: "INVALID_JSON",
      url: response.url || null,
      retryable: false,
    });
  }
};

const createInflightKey = (url, options) => {
  const method = (options.method || "GET").toUpperCase();
  const body = options.body || "";
  return `${method}:${url}:${body}`;
};

async function executeRequest(url, options = {}) {
  const {
    timeoutMs = DEFAULT_TIMEOUT_MS,
    parseAs = "json",
    source = null,
    maxRetries = DEFAULT_MAX_RETRIES,
    retry = true,
    retryOnStatus,
    cacheTtl = DEFAULT_CACHE_TTL_MS,
    ...fetchOptions
  } = options;

  const isGet = String(fetchOptions.method || "GET").toUpperCase() === "GET";
  const cacheKey = getCacheKey(url, fetchOptions);

  // 1. Check in-memory cache for GET requests
  if (isGet && responseCache.has(cacheKey)) {
    const cached = responseCache.get(cacheKey);
    if (cached.expiresAt > Date.now()) {
      return cached.data;
    }
    responseCache.delete(cacheKey);
  }

  // 2. If hitting OpenF1, pace requests through queue
  const isOpenF1 = url.includes(OPENF1_HOST_FRAGMENT);
  if (isOpenF1) {
    await scheduleOpenF1Request();
  }

  const resolvedRetryOnStatus = retryOnStatus || isRetryableStatus;
  let attempt = 0;

  while (true) {
    const controller = new AbortController();
    const timeoutHandle = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      });
      clearTimeout(timeoutHandle);

      if (!response.ok) {
        const retryAfterMs = parseRetryAfterMs(response.headers.get("retry-after"));
        const retryable = resolvedRetryOnStatus(response.status);

        // If rate-limited (429), activate global cooldown
        if (response.status === 429) {
          const cooldownDuration = retryAfterMs || 10_000;
          globalRateLimitCooldownUntil = Date.now() + cooldownDuration;
        }

        throw new ApiRequestError(
          `Request failed (${response.status})`,
          {
            status: response.status,
            code: response.status === 429 ? "RATE_LIMITED" : "HTTP_ERROR",
            url,
            source,
            retryAfterMs,
            retryable,
          }
        );
      }

      const parsedData = await parseResponse(response, parseAs);

      // Save to memory cache if successful GET
      if (isGet && parsedData != null && cacheTtl > 0) {
        responseCache.set(cacheKey, {
          data: parsedData,
          expiresAt: Date.now() + cacheTtl,
        });
      }

      return parsedData;
    } catch (error) {
      clearTimeout(timeoutHandle);

      let normalizedError;
      if (error?.name === "AbortError") {
        normalizedError = new ApiRequestError(`Request timed out after ${timeoutMs}ms`, {
          status: 408,
          code: "TIMEOUT",
          url,
          source,
          retryAfterMs: null,
          retryable: true,
          originalError: error,
        });
      } else if (error instanceof ApiRequestError) {
        normalizedError = error;
      } else {
        normalizedError = toApiRequestError(error, {
          status: null,
          code: "NETWORK_ERROR",
          url,
          source,
          retryable: true,
        });
      }

      const canRetry = retry && shouldRetry(normalizedError, attempt, maxRetries);
      if (!canRetry) {
        throw normalizedError;
      }

      const waitMs = computeRetryDelay(attempt, normalizedError.retryAfterMs);
      attempt += 1;
      await sleep(waitMs);
    }
  }
}

export async function request(url, options = {}) {
  const {
    dedupe = true,
    method = "GET",
  } = options;

  const dedupeEligible = dedupe && String(method).toUpperCase() === "GET";
  if (!dedupeEligible) {
    return executeRequest(url, options);
  }

  const inflightKey = createInflightKey(url, options);
  const existing = inflightRequests.get(inflightKey);
  if (existing) {
    return existing;
  }

  const promise = executeRequest(url, options)
    .finally(() => {
      inflightRequests.delete(inflightKey);
    });

  inflightRequests.set(inflightKey, promise);
  return promise;
}

export const requestJson = (url, options = {}) =>
  request(url, { ...options, parseAs: "json" });

export const requestText = (url, options = {}) =>
  request(url, { ...options, parseAs: "text" });

export const clearResponseCache = () => {
  responseCache.clear();
};
