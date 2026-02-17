import { useQuery } from "@tanstack/react-query";

import { APP_LIVE_CACHE_CONFIG } from "../../common/AppConfig";
import { requestJson } from "../../common/api/httpClient";
import { buildApiEndpoint, isProxyEnabled } from "../../common/api/endpoints";
import { queryKeys, toStaleCacheKey } from "../../common/api/queryKeys";
import { withQueryDataMeta, withStaleFallback } from "../../common/api/staleCache";

const OPENF1_BASE_URL = "https://api.openf1.org/v1";

const toNumber = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

const normalizeStints = (data = []) =>
  data
    .map((stint) => ({
      ...stint,
      session_key: toNumber(stint?.session_key),
      meeting_key: toNumber(stint?.meeting_key),
      driver_number: toNumber(stint?.driver_number),
      stint_number: toNumber(stint?.stint_number),
      lap_start: toNumber(stint?.lap_start) || 0,
      lap_end: toNumber(stint?.lap_end) || 0,
    }))
    .filter((stint) => stint.driver_number && stint.lap_end >= stint.lap_start)
    .sort((a, b) => {
      if (a.driver_number !== b.driver_number) {
        return a.driver_number - b.driver_number;
      }
      return (a.stint_number || 0) - (b.stint_number || 0);
    });

const fetchStintsDirect = async (sessionKey) => {
  const payload = await requestJson(
    `${OPENF1_BASE_URL}/stints?session_key=${encodeURIComponent(sessionKey)}`,
    { source: "openf1" }
  );
  return {
    payload: normalizeStints(Array.isArray(payload) ? payload : []),
    source: "openf1",
  };
};

const fetchStintsFromProxy = async (sessionKey) => {
  const url = buildApiEndpoint("/api/stints", { sessionKey });
  const payload = await requestJson(url, { source: "worker" });
  const rows = Array.isArray(payload?.items) ? payload.items : (Array.isArray(payload) ? payload : []);
  return {
    payload: normalizeStints(rows),
    source: payload?.source || "worker",
  };
};

const fetchStints = async ({ queryKey }) => {
  const [, sessionKey] = queryKey;
  if (!sessionKey) {
    return {
      payload: [],
      dataMeta: {
        isStale: false,
        source: null,
        warning: null,
        fetchedAt: null,
      },
    };
  }

  return withStaleFallback({
    cacheKey: toStaleCacheKey(queryKey),
    source: isProxyEnabled() ? "worker" : "openf1",
    fetcher: () =>
      (isProxyEnabled()
        ? fetchStintsFromProxy(sessionKey)
        : fetchStintsDirect(sessionKey)),
  });
};

export function useStints(sessionKey, options = {}) {
  const queryResult = useQuery({
    queryKey: queryKeys.stints(sessionKey),
    queryFn: fetchStints,
    enabled: options.enabled !== undefined ? options.enabled : Boolean(sessionKey),
    ...APP_LIVE_CACHE_CONFIG,
    ...options,
  });

  return withQueryDataMeta(queryResult, []);
}
