import { useQuery } from "@tanstack/react-query";

import { APP_CACHE_CONFIG } from "../../common/AppConfig";
import { requestJson } from "../../common/api/httpClient";
import { buildApiEndpoint, isProxyEnabled } from "../../common/api/endpoints";
import { queryKeys, toStaleCacheKey } from "../../common/api/queryKeys";
import { withQueryDataMeta, withStaleFallback } from "../../common/api/staleCache";

const fetchDriverStandingsDirect = async (year) => {
  const data = await requestJson(
    `https://api.jolpi.ca/ergast/f1/${year}/driverstandings/?format=json`,
    { source: "jolpi" }
  );
  return {
    payload: data?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings || [],
    source: "jolpi",
  };
};

const fetchDriverStandingsFromProxy = async (year) => {
  const url = buildApiEndpoint("/api/driver-standings", { year });
  const payload = await requestJson(url, { source: "worker" });
  const standings = Array.isArray(payload?.items) ? payload.items : (Array.isArray(payload) ? payload : []);
  return {
    payload: standings,
    source: payload?.source || "worker",
  };
};

const fetchDriverStandings = async ({ queryKey }) => {
  const [, year] = queryKey;

  return withStaleFallback({
    cacheKey: toStaleCacheKey(queryKey),
    source: isProxyEnabled() ? "worker" : "jolpi",
    fetcher: () =>
      (isProxyEnabled()
        ? fetchDriverStandingsFromProxy(year)
        : fetchDriverStandingsDirect(year)),
  });
};

export const useDriverStandings = (year) => {
  const queryResult = useQuery({
    queryKey: queryKeys.driverStandings(year),
    queryFn: fetchDriverStandings,
    enabled: Boolean(year),
    ...APP_CACHE_CONFIG,
  });

  return withQueryDataMeta(queryResult, []);
};
