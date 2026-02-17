import { useQuery } from "@tanstack/react-query";

import { APP_CACHE_CONFIG } from "../../common/AppConfig";
import { requestJson } from "../../common/api/httpClient";
import { buildApiEndpoint, isProxyEnabled } from "../../common/api/endpoints";
import { queryKeys, toStaleCacheKey } from "../../common/api/queryKeys";
import { withQueryDataMeta, withStaleFallback } from "../../common/api/staleCache";

const fetchConstructorStandingsDirect = async (year) => {
  const data = await requestJson(
    `https://api.jolpi.ca/ergast/f1/${year}/constructorstandings/?format=json`,
    { source: "jolpi" }
  );
  return {
    payload: data?.MRData?.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings || [],
    source: "jolpi",
  };
};

const fetchConstructorStandingsFromProxy = async (year) => {
  const url = buildApiEndpoint("/api/constructor-standings", { year });
  const payload = await requestJson(url, { source: "worker" });
  const standings = Array.isArray(payload?.items) ? payload.items : (Array.isArray(payload) ? payload : []);
  return {
    payload: standings,
    source: payload?.source || "worker",
  };
};

const fetchConstructorStandings = async ({ queryKey }) => {
  const [, year] = queryKey;

  return withStaleFallback({
    cacheKey: toStaleCacheKey(queryKey),
    source: isProxyEnabled() ? "worker" : "jolpi",
    fetcher: () =>
      (isProxyEnabled()
        ? fetchConstructorStandingsFromProxy(year)
        : fetchConstructorStandingsDirect(year)),
  });
};

export const useConstructorStandings = (year) => {
  const queryResult = useQuery({
    queryKey: queryKeys.constructorStandings(year),
    queryFn: fetchConstructorStandings,
    enabled: Boolean(year),
    ...APP_CACHE_CONFIG,
  });

  return withQueryDataMeta(queryResult, []);
};
