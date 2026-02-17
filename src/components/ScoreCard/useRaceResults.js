import { useQuery } from "@tanstack/react-query";

import { APP_CACHE_CONFIG } from "../../common/AppConfig";
import { requestJson } from "../../common/api/httpClient";
import { buildApiEndpoint, isProxyEnabled } from "../../common/api/endpoints";
import { queryKeys, toStaleCacheKey } from "../../common/api/queryKeys";
import { withQueryDataMeta, withStaleFallback } from "../../common/api/staleCache";

const mergeRacePages = (allRaces, year) => {
  const merged = new Map();

  allRaces.forEach((race) => {
    const key = `${race.season || year}-${race.round}`;
    if (!merged.has(key)) {
      merged.set(key, { ...race, Results: [...(race.Results || [])] });
      return;
    }
    const existing = merged.get(key);
    const existingResults = existing.Results || [];
    const incomingResults = race.Results || [];
    const combined = [...existingResults, ...incomingResults];
    const uniq = new Map();
    combined.forEach((result) => {
      const driverId = result?.Driver?.driverId || result?.number || result?.position;
      if (driverId) uniq.set(driverId, result);
    });
    existing.Results = Array.from(uniq.values());
    merged.set(key, existing);
  });

  return Array.from(merged.values());
};

const fetchRaceResultsDirect = async (year) => {
  const baseUrl = `https://api.jolpi.ca/ergast/f1/${year}/results/?format=json`;
  const pageLimit = 1000;
  const firstData = await requestJson(`${baseUrl}&limit=${pageLimit}&offset=0`, { source: "jolpi" });
  const total = Number(firstData?.MRData?.total || 0);
  const limit = Number(firstData?.MRData?.limit || pageLimit);
  const races = firstData?.MRData?.RaceTable?.Races || [];

  if (total <= limit) {
    return { payload: races, source: "jolpi" };
  }

  const extraRaces = [];
  for (let offset = limit; offset < total; offset += limit) {
    const data = await requestJson(`${baseUrl}&limit=${limit}&offset=${offset}`, { source: "jolpi" });
    extraRaces.push(...(data?.MRData?.RaceTable?.Races || []));
  }

  return {
    payload: mergeRacePages([...races, ...extraRaces], year),
    source: "jolpi",
  };
};

const fetchRaceResultsFromProxy = async (year) => {
  const url = buildApiEndpoint("/api/race-results", { year });
  const payload = await requestJson(url, { source: "worker" });
  const races = Array.isArray(payload?.items) ? payload.items : (Array.isArray(payload) ? payload : []);
  return {
    payload: races,
    source: payload?.source || "worker",
  };
};

const fetchRaceResults = async ({ queryKey }) => {
  const [, year] = queryKey;
  return withStaleFallback({
    cacheKey: toStaleCacheKey(queryKey),
    source: isProxyEnabled() ? "worker" : "jolpi",
    fetcher: () =>
      (isProxyEnabled()
        ? fetchRaceResultsFromProxy(year)
        : fetchRaceResultsDirect(year)),
  });
};

export const useRaceResults = (year) => {
  const queryResult = useQuery({
    queryKey: queryKeys.raceResults(year),
    queryFn: fetchRaceResults,
    enabled: Boolean(year),
    ...APP_CACHE_CONFIG,
  });

  return withQueryDataMeta(queryResult, []);
};
