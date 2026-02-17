import { useQuery } from "@tanstack/react-query";

import { APP_LIVE_CACHE_CONFIG } from "../../common/AppConfig";
import { requestJson } from "../../common/api/httpClient";
import { buildApiEndpoint, isProxyEnabled } from "../../common/api/endpoints";
import { queryKeys, toStaleCacheKey } from "../../common/api/queryKeys";
import { withQueryDataMeta, withStaleFallback } from "../../common/api/staleCache";

const OPENF1_BASE_URL = "https://api.openf1.org/v1";
const JOLPI_BASE_URL = "https://api.jolpi.ca/ergast/f1";
const OPENF1_CONCURRENCY = 2;

const toNumber = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

const fetchJson = (url, source) => requestJson(url, { source });

const maybeFetch = async (url, source) => {
  try {
    const data = await fetchJson(url, source);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
};

const mapJolpiResultsToPositions = (race, meetingKey, driverNumberFilter, positionFilter) => {
  const raceDate = race?.date || "";
  const raceTime = race?.time || "00:00:00Z";
  const raceDateIso = raceDate ? `${raceDate}T${raceTime}` : new Date().toISOString();
  const results = race?.Results || [];

  return results
    .map((result, index) => {
      const driverNum = Number(
        result?.Driver?.permanentNumber || result?.number || index + 1
      );

      const finalPos = Number(result?.position || 0) || null;
      const startPos = Number(result?.grid || 0) || null;

      return {
        meeting_key: Number(meetingKey),
        session_key: Number(meetingKey),
        session_name: race?.raceName || "Race",
        circuit_short_name: race?.Circuit?.circuitName || "",
        date: raceDateIso,
        driver_number: driverNum,
        full_name: `${result?.Driver?.givenName || ""} ${result?.Driver?.familyName || ""}`.trim(),
        team_name: result?.Constructor?.name || "",
        position: finalPos,
        finalPosition: finalPos,
        startingPosition: startPos,
        starting_grid_position: startPos,
      };
    })
    .filter((item) => {
      const byDriver = driverNumberFilter ? Number(driverNumberFilter) === item.driver_number : true;
      const byPosition = positionFilter ? Number(positionFilter) === item.position : true;
      return byDriver && byPosition;
    });
};

const fetchJolpiRacePositions = async ({ meetingKey, driverNumber, position, year }) => {
  if (!meetingKey) return [];

  const resolvedYear = year || String(new Date().getFullYear());
  const attempts = [
    `${JOLPI_BASE_URL}/${resolvedYear}/${meetingKey}/results/?format=json`,
    `${JOLPI_BASE_URL}/${resolvedYear}/${meetingKey}/results?format=json`,
  ];

  for (const url of attempts) {
    try {
      const data = await fetchJson(url, "jolpi");
      const race = data?.MRData?.RaceTable?.Races?.[0];
      if (!race) continue;

      return mapJolpiResultsToPositions(race, meetingKey, driverNumber, position);
    } catch {
      // try next URL variation
    }
  }

  return [];
};

const isRaceSession = (sessionName = "", sessionType = "") => {
  const value = `${sessionName} ${sessionType}`.toLowerCase();
  return value.includes("race") && !value.includes("sprint shootout");
};

const buildDriverIndex = (drivers = []) =>
  new Map(
    drivers
      .map((driver) => {
        const driverNum = toNumber(driver?.driver_number);
        if (!driverNum) return null;
        return [driverNum, driver];
      })
      .filter(Boolean)
  );

const mapOpenF1SessionRows = ({
  session,
  positions,
  results,
  startingGrid,
  driverIndex,
  meetingKey,
  driverNumber,
  position,
}) => {
  const latestPositionByDriver = new Map();
  for (const positionRow of positions) {
    const driverNum = toNumber(positionRow?.driver_number);
    if (!driverNum) continue;

    const previous = latestPositionByDriver.get(driverNum);
    const previousDate = previous?.date ? new Date(previous.date).getTime() : 0;
    const nextDate = positionRow?.date ? new Date(positionRow.date).getTime() : 0;

    if (!previous || nextDate >= previousDate) {
      latestPositionByDriver.set(driverNum, positionRow);
    }
  }

  const resultByDriver = new Map(
    results
      .map((result) => {
        const driverNum = toNumber(result?.driver_number);
        if (!driverNum) return null;
        return [driverNum, result];
      })
      .filter(Boolean)
  );

  const gridByDriver = new Map(
    startingGrid
      .map((row) => {
        const driverNum = toNumber(row?.driver_number);
        const gridPos = toNumber(row?.position);
        if (!driverNum) return null;
        return [driverNum, gridPos];
      })
      .filter(Boolean)
  );

  const allDriverNumbers = new Set([
    ...latestPositionByDriver.keys(),
    ...resultByDriver.keys(),
  ]);

  return Array.from(allDriverNumbers)
    .map((driverNum) => {
      const latestPosition = latestPositionByDriver.get(driverNum);
      const result = resultByDriver.get(driverNum);
      const driver = driverIndex.get(driverNum);

      const finalPosition = toNumber(result?.position)
        || toNumber(result?.classified_position)
        || toNumber(latestPosition?.position);
      const startPosition = toNumber(result?.grid_position) || gridByDriver.get(driverNum) || null;

      return {
        meeting_key: toNumber(session?.meeting_key) || toNumber(meetingKey),
        session_key: toNumber(session?.session_key),
        session_name: session?.session_name || session?.session_type || "Session",
        circuit_short_name: session?.circuit_short_name || "",
        date: latestPosition?.date || session?.date_end || session?.date_start || "",
        driver_number: driverNum,
        full_name: driver?.full_name || result?.full_name || latestPosition?.full_name || `Driver #${driverNum}`,
        team_name: driver?.team_name || result?.team_name || "",
        position: finalPosition,
        finalPosition,
        startingPosition: startPosition,
        starting_grid_position: startPosition,
      };
    })
    .filter((row) => {
      const byDriver = driverNumber ? row.driver_number === Number(driverNumber) : true;
      const byPosition = position ? row.position === Number(position) : true;
      return byDriver && byPosition;
    });
};

const runWithConcurrency = async (items, limit, worker) => {
  if (!items.length) return [];
  const results = [];
  let index = 0;

  const run = async () => {
    while (index < items.length) {
      const current = index;
      index += 1;
      results[current] = await worker(items[current], current);
    }
  };

  const workers = Array.from(
    { length: Math.min(limit, items.length) },
    () => run()
  );
  await Promise.all(workers);
  return results;
};

const fetchOpenF1MeetingPositions = async ({ meetingKey, driverNumber, position }) => {
  if (!meetingKey) return [];

  const sessions = await maybeFetch(
    `${OPENF1_BASE_URL}/sessions?meeting_key=${encodeURIComponent(meetingKey)}`,
    "openf1"
  );
  if (!sessions.length) return [];

  const sessionKeys = sessions
    .map((session) => toNumber(session?.session_key))
    .filter(Boolean);

  const primarySessionKey = sessionKeys[sessionKeys.length - 1] || sessionKeys[0];
  const meetingDrivers = primarySessionKey
    ? await maybeFetch(`${OPENF1_BASE_URL}/drivers?session_key=${primarySessionKey}`, "openf1")
    : [];
  const driverIndex = buildDriverIndex(meetingDrivers);

  const perSessionRows = await runWithConcurrency(
    sessions,
    OPENF1_CONCURRENCY,
    async (session) => {
      const sessionKey = toNumber(session?.session_key);
      if (!sessionKey) return [];

      const [positions, results, startingGrid] = await Promise.all([
        maybeFetch(`${OPENF1_BASE_URL}/position?session_key=${sessionKey}`, "openf1"),
        maybeFetch(`${OPENF1_BASE_URL}/session_result?session_key=${sessionKey}`, "openf1"),
        isRaceSession(session?.session_name, session?.session_type)
          ? maybeFetch(`${OPENF1_BASE_URL}/starting_grid?session_key=${sessionKey}`, "openf1")
          : Promise.resolve([]),
      ]);

      return mapOpenF1SessionRows({
        session,
        positions,
        results,
        startingGrid,
        driverIndex,
        meetingKey,
        driverNumber,
        position,
      });
    }
  );

  return perSessionRows.flat();
};

const fetchPositionsDirect = async ({ meetingKey, driverNumber, position, year }) => {
  try {
    const openF1Rows = await fetchOpenF1MeetingPositions({
      meetingKey,
      driverNumber,
      position,
    });
    if (openF1Rows.length) {
      return { payload: openF1Rows, source: "openf1" };
    }
  } catch {
    // fallback for unavailable OpenF1 data
  }

  const jolpiRows = await fetchJolpiRacePositions({
    meetingKey,
    driverNumber,
    position,
    year,
  });
  return { payload: jolpiRows, source: "jolpi" };
};

const fetchPositionsFromProxy = async ({ meetingKey, driverNumber, position, year }) => {
  const url = buildApiEndpoint("/api/positions", {
    meetingKey,
    driverNumber,
    position,
    year,
  });
  const payload = await requestJson(url, { source: "worker" });
  const rows = Array.isArray(payload?.items) ? payload.items : (Array.isArray(payload) ? payload : []);
  return {
    payload: rows,
    source: payload?.source || "worker",
  };
};

const fetchPositions = async ({ queryKey }) => {
  const [, meetingKey, driverNumber, position, year] = queryKey;
  if (!meetingKey) {
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

  const cacheKey = toStaleCacheKey(queryKey);
  return withStaleFallback({
    cacheKey,
    source: isProxyEnabled() ? "worker" : "openf1",
    fetcher: () =>
      (isProxyEnabled()
        ? fetchPositionsFromProxy({ meetingKey, driverNumber, position, year })
        : fetchPositionsDirect({ meetingKey, driverNumber, position, year })),
  });
};

export function usePositions(meetingKey, driverNumber, position, options = {}) {
  const { year, ...queryOptions } = options;
  const resolvedYear = year || String(new Date().getFullYear());

  const queryResult = useQuery({
    queryKey: queryKeys.positions(meetingKey, driverNumber, position, resolvedYear),
    queryFn: fetchPositions,
    enabled: queryOptions.enabled !== undefined ? queryOptions.enabled : Boolean(meetingKey),
    ...APP_LIVE_CACHE_CONFIG,
    ...queryOptions,
  });

  return withQueryDataMeta(queryResult, []);
}
