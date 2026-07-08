import { useQuery } from "@tanstack/react-query";

import { APP_CACHE_CONFIG } from "../AppConfig";
import { buildApiEndpoint, isProxyEnabled } from "../api/endpoints";
import { requestJson } from "../api/httpClient";
import { queryKeys, toStaleCacheKey } from "../api/queryKeys";
import { withQueryDataMeta, withStaleFallback } from "../api/staleCache";
import { fetchDriverRegistry } from "./driverRegistry";

const fetchFromProxy = async (year, sessionKey) => {
  const url = buildApiEndpoint("/api/season-drivers", {
    year,
    sessionKey: sessionKey || undefined,
  });
  const payload = await requestJson(url, { source: "worker" });
  const drivers = Array.isArray(payload?.items)
    ? payload.items
    : Array.isArray(payload)
      ? payload
      : [];
  return {
    payload: drivers,
    source: payload?.source || "worker",
  };
};

const fetchRegistry = async ({ queryKey }) => {
  const [, year, sessionKey] = queryKey;
  const resolvedYear = year || String(new Date().getFullYear());
  const cacheKey = toStaleCacheKey(queryKey);

  return withStaleFallback({
    cacheKey,
    source: isProxyEnabled() ? "worker" : "openf1+jolpi",
    fetcher: () =>
      isProxyEnabled()
        ? fetchFromProxy(resolvedYear, sessionKey)
        : fetchDriverRegistry({ year: resolvedYear, sessionKey }),
  });
};

export function useDriverRegistry(meetingKey, sessionKey = null, options = {}) {
  const { year, enabled, ...queryOptions } = options;
  const resolvedYear = year || String(new Date().getFullYear());

  void meetingKey;

  const queryResult = useQuery({
    queryKey: queryKeys.seasonDrivers(resolvedYear, sessionKey),
    queryFn: fetchRegistry,
    enabled: enabled !== undefined ? enabled : Boolean(resolvedYear),
    ...APP_CACHE_CONFIG,
    ...queryOptions,
  });

  return withQueryDataMeta(queryResult, []);
}
