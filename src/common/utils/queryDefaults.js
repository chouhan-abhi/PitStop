const BASE_RETRY_DELAY_MS = 400;

const jitter = () => Math.round(Math.random() * 250);

const isRetryableStatus = (status) =>
  status === 408 || status === 429 || (Number.isFinite(status) && status >= 500);

export const queryRetry = (failureCount, error) => {
  if (failureCount >= 2) return false;
  const status = Number(error?.status);
  if (!Number.isFinite(status)) return true;
  return isRetryableStatus(status);
};

export const queryRetryDelay = (attemptIndex, error) => {
  const retryAfter = Number(error?.retryAfterMs);
  if (Number.isFinite(retryAfter) && retryAfter > 0) {
    return retryAfter;
  }

  return BASE_RETRY_DELAY_MS * 2 ** Math.max(0, attemptIndex) + jitter();
};

export const QUERY_DEFAULTS = {
  staleTime: 1000 * 60 * 30,
  gcTime: 1000 * 60 * 60 * 24,
  refetchOnWindowFocus: false,
  refetchOnMount: false,
  refetchOnReconnect: false,
  retry: queryRetry,
  retryDelay: queryRetryDelay,
};

export const QUERY_ARCHIVE_DEFAULTS = {
  ...QUERY_DEFAULTS,
  staleTime: 1000 * 60 * 30,
  gcTime: 1000 * 60 * 60 * 24,
};

export const QUERY_LIVE_DEFAULTS = {
  ...QUERY_DEFAULTS,
  staleTime: 1000 * 60 * 10,
  gcTime: 1000 * 60 * 60 * 24,
  refetchOnReconnect: true,
};
