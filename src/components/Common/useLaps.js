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

const normalizeLaps = (data = []) =>
  data
    .map((lap) => ({
      ...lap,
      session_key: toNumber(lap?.session_key),
      meeting_key: toNumber(lap?.meeting_key),
      driver_number: toNumber(lap?.driver_number),
      lap_number: toNumber(lap?.lap_number),
      lap_duration: toNumber(lap?.lap_duration),
      duration_sector_1: toNumber(lap?.duration_sector_1),
      duration_sector_2: toNumber(lap?.duration_sector_2),
      duration_sector_3: toNumber(lap?.duration_sector_3),
      i1_speed: toNumber(lap?.i1_speed),
      i2_speed: toNumber(lap?.i2_speed),
      st_speed: toNumber(lap?.st_speed),
    }))
    .filter((lap) => lap.driver_number && lap.lap_number)
    .sort((a, b) => {
      if (a.driver_number !== b.driver_number) {
        return a.driver_number - b.driver_number;
      }
      return (a.lap_number || 0) - (b.lap_number || 0);
    });

const fetchLapsDirect = async (sessionKey) => {
  const payload = await requestJson(
    `${OPENF1_BASE_URL}/laps?session_key=${encodeURIComponent(sessionKey)}`,
    { source: "openf1" }
  );
  return {
    payload: normalizeLaps(Array.isArray(payload) ? payload : []),
    source: "openf1",
  };
};

const fetchLapsFromProxy = async (sessionKey) => {
  const url = buildApiEndpoint("/api/laps", { sessionKey });
  const payload = await requestJson(url, { source: "worker" });
  const rows = Array.isArray(payload?.items) ? payload.items : (Array.isArray(payload) ? payload : []);
  return {
    payload: normalizeLaps(rows),
    source: payload?.source || "worker",
  };
};

const fetchLaps = async ({ queryKey }) => {
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
        ? fetchLapsFromProxy(sessionKey)
        : fetchLapsDirect(sessionKey)),
  });
};

export const useLaps = (sessionKey, options = {}) => {
  const queryResult = useQuery({
    queryKey: queryKeys.laps(sessionKey),
    queryFn: fetchLaps,
    enabled: options.enabled !== undefined ? options.enabled : Boolean(sessionKey),
    ...APP_LIVE_CACHE_CONFIG,
    ...options,
  });

  return withQueryDataMeta(queryResult, []);
};
