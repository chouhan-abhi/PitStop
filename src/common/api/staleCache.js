import { getBucket } from "../storage";

const STALE_SUBAPP = "api-cache";
const STALE_SOURCE = "stale";
const STALE_TYPE = "query";

const staleBucket = getBucket(STALE_SUBAPP, STALE_SOURCE, STALE_TYPE);

export const STALE_MAX_AGE_MS = 1000 * 60 * 60 * 24;

export const DEFAULT_DATA_META = Object.freeze({
  isStale: false,
  source: null,
  warning: null,
  fetchedAt: null,
});

const normalizeWarning = (error) => {
  if (!error) return null;
  return error?.message || "Primary feed unavailable. Showing cached data.";
};

export const writeStaleRecord = (cacheKey, payload, source = null) => {
  if (!cacheKey) return;

  const fetchedAt = Date.now();
  staleBucket.setRecord(cacheKey, {
    payload,
    source,
    fetchedAt,
  }, { ttlMs: STALE_MAX_AGE_MS });
};

export const readStaleRecord = (cacheKey, maxAgeMs = STALE_MAX_AGE_MS) => {
  if (!cacheKey) return null;

  const record = staleBucket.getRecord(cacheKey);
  if (!record) return null;

  const fetchedAt = Number(record?.fetchedAt || 0);
  const ageMs = Date.now() - fetchedAt;
  if (!Number.isFinite(fetchedAt) || ageMs > maxAgeMs) {
    staleBucket.removeRecord(cacheKey);
    return null;
  }

  return {
    payload: record?.payload,
    source: record?.source || "cache",
    fetchedAt,
  };
};

export async function withStaleFallback({
  cacheKey,
  source: defaultSource = null,
  fetcher,
  maxAgeMs = STALE_MAX_AGE_MS,
}) {
  try {
    const result = await fetcher();
    const payload = result?.payload ?? result;
    const source = result?.source || defaultSource;

    writeStaleRecord(cacheKey, payload, source);
    return {
      payload,
      dataMeta: {
        isStale: false,
        source,
        warning: null,
        fetchedAt: Date.now(),
      },
    };
  } catch (error) {
    const staleRecord = readStaleRecord(cacheKey, maxAgeMs);
    if (!staleRecord) {
      throw error;
    }

    return {
      payload: staleRecord.payload,
      dataMeta: {
        isStale: true,
        source: "cache",
        warning: normalizeWarning(error),
        fetchedAt: staleRecord.fetchedAt,
      },
    };
  }
}

export const withQueryDataMeta = (queryResult, emptyData) => ({
  ...queryResult,
  data: queryResult?.data?.payload ?? emptyData,
  dataMeta: queryResult?.data?.dataMeta ?? DEFAULT_DATA_META,
});
