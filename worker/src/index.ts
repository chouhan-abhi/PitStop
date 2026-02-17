type JsonRecord = Record<string, unknown>;
type ExecutionContext = { waitUntil(promise: Promise<unknown>): void };

type FetchResult<T> = {
  items: T;
  source: string;
};

type CachedEnvelope<T> = {
  cachedAt: number;
  source: string;
  items: T;
};

const OPENF1_BASE_URL = "https://api.openf1.org/v1";
const JOLPI_BASE_URL = "https://api.jolpi.ca/ergast/f1";

const TTL_MS = {
  events: 1000 * 60 * 30,
  positions: 1000 * 60 * 10,
  seasonDrivers: 1000 * 60 * 30,
  laps: 1000 * 60 * 10,
  stints: 1000 * 60 * 10,
  driverStandings: 1000 * 60 * 30,
  constructorStandings: 1000 * 60 * 30,
  raceResults: 1000 * 60 * 30,
};

const SWR_MS = 1000 * 60 * 30;

const TEAM_COLOR_RULES = [
  { match: ["mclaren"], color: "FF8000" },
  { match: ["ferrari"], color: "E80020" },
  { match: ["red bull"], color: "3671C6" },
  { match: ["mercedes"], color: "27F4D2" },
  { match: ["aston martin"], color: "229971" },
  { match: ["alpine"], color: "FF87BC" },
  { match: ["williams"], color: "64C4FF" },
  { match: ["haas"], color: "B6BABD" },
  { match: ["racing bulls", "visa cash app rb", "rb f1"], color: "6692FF" },
  { match: ["sauber", "kick"], color: "52E252" },
];

const NATIONALITY_TO_COUNTRY_CODE: Record<string, string> = {
  british: "GB",
  dutch: "NL",
  spanish: "ES",
  monegasque: "MC",
  australian: "AU",
  french: "FR",
  german: "DE",
  thai: "TH",
  canadian: "CA",
  japanese: "JP",
  chinese: "CN",
  mexican: "MX",
  danish: "DK",
  finnish: "FI",
  american: "US",
  argentine: "AR",
  zealander: "NZ",
  brazilian: "BR",
  italian: "IT",
};

const originState = new Map<string, { active: number; queue: Array<() => void> }>();

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const toNumber = (value: unknown): number | null => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const parseRetryAfterMs = (value: string | null): number | null => {
  if (!value) return null;
  const seconds = Number(value);
  if (Number.isFinite(seconds) && seconds >= 0) {
    return Math.round(seconds * 1000);
  }

  const dateMs = new Date(value).getTime();
  if (!Number.isFinite(dateMs)) return null;
  const delta = dateMs - Date.now();
  return delta > 0 ? delta : null;
};

const isRetryableStatus = (status: number) => status === 408 || status === 429 || status >= 500;

async function withOriginLimit<T>(origin: string, limit: number, task: () => Promise<T>): Promise<T> {
  const state = originState.get(origin) || { active: 0, queue: [] };
  originState.set(origin, state);

  if (state.active >= limit) {
    await new Promise<void>((resolve) => state.queue.push(resolve));
  }

  state.active += 1;
  try {
    return await task();
  } finally {
    state.active = Math.max(0, state.active - 1);
    const next = state.queue.shift();
    if (next) next();
  }
}

async function requestJson(url: string, source: string, maxRetries = 2): Promise<unknown> {
  const origin = new URL(url).origin;
  let attempt = 0;

  while (true) {
    try {
      return await withOriginLimit(origin, 3, async () => {
        const response = await fetch(url, { method: "GET" });
        if (!response.ok) {
          const retryAfterMs = parseRetryAfterMs(response.headers.get("retry-after"));
          const retryable = isRetryableStatus(response.status);
          const message = `Request failed (${response.status})`;
          const error = new Error(message) as Error & { status?: number; retryable?: boolean; retryAfterMs?: number | null };
          error.status = response.status;
          error.retryable = retryable;
          error.retryAfterMs = retryAfterMs;
          throw error;
        }
        return await response.json();
      });
    } catch (error) {
      const err = error as Error & { status?: number; retryable?: boolean; retryAfterMs?: number | null };
      const status = Number(err?.status);
      const retryable = err?.retryable ?? (!Number.isFinite(status) || isRetryableStatus(status));
      if (attempt >= maxRetries || !retryable) {
        throw error;
      }
      const retryAfterMs = Number(err?.retryAfterMs);
      const delay = Number.isFinite(retryAfterMs)
        ? retryAfterMs
        : 400 * 2 ** attempt + Math.round(Math.random() * 250);
      attempt += 1;
      await sleep(delay);
    }
  }
}

function responseJson(payload: JsonRecord, options: {
  status?: number;
  source?: string;
  cache?: string;
  stale?: boolean;
} = {}): Response {
  const status = options.status ?? 200;
  const source = options.source ?? "worker";
  const cacheStatus = options.cache ?? "bypass";
  const stale = options.stale ? "true" : "false";

  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "x-pitstop-source": source,
      "x-pitstop-cache": cacheStatus,
      "x-pitstop-stale": stale,
    },
  });
}

function errorResponse(message: string, status = 500): Response {
  return responseJson({ error: message }, { status, source: "worker", cache: "bypass", stale: false });
}

async function putCache<T>(cache: Cache, cacheKey: Request, payload: CachedEnvelope<T>): Promise<void> {
  const response = new Response(JSON.stringify(payload), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  });
  await cache.put(cacheKey, response);
}

async function readCache<T>(cache: Cache, cacheKey: Request): Promise<CachedEnvelope<T> | null> {
  const hit = await cache.match(cacheKey);
  if (!hit) return null;
  try {
    const json = await hit.json() as CachedEnvelope<T>;
    if (!json || typeof json !== "object") return null;
    return json;
  } catch {
    return null;
  }
}

async function cachedFetch<T>(
  requestUrl: URL,
  cacheNamespace: string,
  ttlMs: number,
  ctx: ExecutionContext,
  fetcher: () => Promise<FetchResult<T>>
): Promise<Response> {
  const cache = caches.default;
  const cacheKey = new Request(`https://pitstop-cache.internal/${cacheNamespace}${requestUrl.search}`);
  const now = Date.now();

  const cached = await readCache<T>(cache, cacheKey);
  if (cached) {
    const age = now - Number(cached.cachedAt || 0);
    if (age <= ttlMs) {
      return responseJson(
        { items: cached.items, source: cached.source },
        { source: cached.source, cache: "hit", stale: false }
      );
    }

    if (age <= ttlMs + SWR_MS) {
      ctx.waitUntil((async () => {
        try {
          const fresh = await fetcher();
          await putCache(cache, cacheKey, {
            cachedAt: Date.now(),
            source: fresh.source,
            items: fresh.items,
          });
        } catch {
          // keep stale
        }
      })());

      return responseJson(
        { items: cached.items, source: cached.source },
        { source: cached.source, cache: "stale", stale: true }
      );
    }
  }

  const fresh = await fetcher();
  await putCache(cache, cacheKey, {
    cachedAt: now,
    source: fresh.source,
    items: fresh.items,
  });
  return responseJson(
    { items: fresh.items, source: fresh.source },
    { source: fresh.source, cache: "miss", stale: false }
  );
}

const filterByCountry = (meetings: Array<JsonRecord>, countryName: string | null) => {
  if (!countryName) return meetings;
  const normalizedCountry = countryName.toLowerCase().trim();
  return meetings.filter((meeting) =>
    String(meeting.country_name || "").toLowerCase().includes(normalizedCountry)
  );
};

const sortByDateAsc = (rows: Array<JsonRecord>) =>
  [...rows].sort((a, b) => new Date(String(a.date_start || 0)).getTime() - new Date(String(b.date_start || 0)).getTime());

const toOpenF1Meeting = (meeting: JsonRecord): JsonRecord | null => {
  if (!meeting?.meeting_key) return null;

  const dateStart = String(meeting?.date_start || "");
  return {
    meeting_key: Number(meeting.meeting_key),
    meeting_name: String(meeting?.meeting_name || meeting?.meeting_official_name || "Grand Prix"),
    circuit_short_name: String(meeting?.circuit_short_name || "Circuit"),
    circuit_name: String(meeting?.circuit_short_name || "Circuit"),
    location: String(meeting?.location || ""),
    country_name: String(meeting?.country_name || ""),
    country_code: meeting?.country_code ? String(meeting.country_code) : null,
    year: Number(meeting?.year || (dateStart ? new Date(dateStart).getFullYear() : new Date().getFullYear())),
    date_start: dateStart || null,
    gmt_offset: meeting?.gmt_offset ? String(meeting.gmt_offset) : null,
    session_key: null,
  };
};

const mapJolpiRaceToMeeting = (race: JsonRecord): JsonRecord => {
  const date = String(race?.date || "");
  const time = String(race?.time || "00:00:00Z");
  const round = Number(race?.round || 0);
  const circuit = (race?.Circuit || {}) as JsonRecord;
  const location = (circuit?.Location || {}) as JsonRecord;
  return {
    meeting_key: round,
    meeting_name: String(race?.raceName || "Grand Prix"),
    circuit_short_name: String(circuit?.circuitName || "Circuit"),
    circuit_name: String(circuit?.circuitName || "Circuit"),
    location: String(location?.locality || ""),
    country_name: String(location?.country || ""),
    country_code: null,
    year: Number(race?.season || new Date().getFullYear()),
    date_start: date ? `${date}T${time}` : null,
    session_key: round,
  };
};

async function fetchEvents(year: string, countryName: string | null): Promise<FetchResult<Array<JsonRecord>>> {
  try {
    const openF1 = await requestJson(
      `${OPENF1_BASE_URL}/meetings?year=${encodeURIComponent(year)}`,
      "openf1"
    ) as Array<JsonRecord>;
    const mapped = Array.isArray(openF1) ? openF1.map(toOpenF1Meeting).filter(Boolean) as Array<JsonRecord> : [];
    const filtered = sortByDateAsc(filterByCountry(mapped, countryName));
    if (filtered.length) {
      return { items: filtered, source: "openf1" };
    }
  } catch {
    // fallback to Jolpi
  }

  const attempts = [
    `${JOLPI_BASE_URL}/${year}/races/?format=json`,
    `${JOLPI_BASE_URL}/${year}/races?format=json`,
  ];
  for (const url of attempts) {
    try {
      const data = await requestJson(url, "jolpi") as JsonRecord;
      const races = (((data?.MRData as JsonRecord)?.RaceTable as JsonRecord)?.Races || []) as Array<JsonRecord>;
      const meetings = races.map(mapJolpiRaceToMeeting);
      return { items: sortByDateAsc(filterByCountry(meetings, countryName)), source: "jolpi" };
    } catch {
      // try next
    }
  }

  throw new Error("Event feeds unavailable");
}

const nationalityToCountryCode = (nationality: unknown) => {
  const key = String(nationality || "").toLowerCase().trim();
  return NATIONALITY_TO_COUNTRY_CODE[key] || null;
};

const teamNameToColor = (teamName: unknown) => {
  const normalized = String(teamName || "").toLowerCase();
  if (!normalized) return null;
  const matched = TEAM_COLOR_RULES.find((rule) =>
    rule.match.some((token) => normalized.includes(token))
  );
  return matched?.color || null;
};

const fetchJolpiAny = async (paths: Array<string>) => {
  for (const path of paths) {
    const attempts = [`${path}/?format=json`, `${path}?format=json`];
    for (const url of attempts) {
      try {
        return await requestJson(url, "jolpi") as JsonRecord;
      } catch {
        // try next variant
      }
    }
  }
  throw new Error("Jolpi endpoint unavailable");
};

const buildStandingsIndex = (standings: Array<JsonRecord>) => {
  const map = new Map<string, JsonRecord>();
  standings.forEach((entry) => {
    const driver = (entry?.Driver || {}) as JsonRecord;
    const driverId = String(driver?.driverId || "");
    if (!driverId) return;
    map.set(driverId, {
      position: Number(entry?.position || 0) || null,
      points: Number(entry?.points || 0),
      wins: Number(entry?.wins || 0),
      team: String((((entry?.Constructors as Array<JsonRecord>) || [])[0]?.name || "")) || null,
    });
  });
  return map;
};

const buildSeasonStatsIndex = (races: Array<JsonRecord>) => {
  const map = new Map<string, JsonRecord>();
  const sorted = [...races].sort((a, b) => Number(a?.round || 0) - Number(b?.round || 0));

  sorted.forEach((race) => {
    const round = Number(race?.round || 0);
    const raceName = String(race?.raceName || `Round ${round}`);
    const results = (race?.Results || []) as Array<JsonRecord>;

    results.forEach((result) => {
      const driver = (result?.Driver || {}) as JsonRecord;
      const driverId = String(driver?.driverId || "");
      if (!driverId) return;

      const position = Number(result?.position || 0) || null;
      const points = Number(result?.points || 0);
      const constructor = String(((result?.Constructor as JsonRecord)?.name || "")) || null;

      const existing = map.get(driverId) || {
        races: 0,
        podiums: 0,
        wins: 0,
        totalFinish: 0,
        bestFinish: null,
        team: constructor,
        lastFive: [] as Array<JsonRecord>,
      };

      existing.races = Number(existing.races || 0) + 1;
      if (position) {
        existing.totalFinish = Number(existing.totalFinish || 0) + position;
        existing.bestFinish = existing.bestFinish ? Math.min(Number(existing.bestFinish), position) : position;
        if (position <= 3) existing.podiums = Number(existing.podiums || 0) + 1;
        if (position === 1) existing.wins = Number(existing.wins || 0) + 1;
      }
      if (constructor) {
        existing.team = constructor;
      }

      const lastFive = (existing.lastFive || []) as Array<JsonRecord>;
      lastFive.push({ round, raceName, position, points });
      existing.lastFive = lastFive.slice(-5);

      map.set(driverId, existing);
    });
  });

  return map;
};

async function fetchSeasonDrivers(year: string): Promise<FetchResult<Array<JsonRecord>>> {
  const [driversData, standingsData, resultsData] = await Promise.all([
    fetchJolpiAny([`${JOLPI_BASE_URL}/${year}/drivers`]),
    fetchJolpiAny([`${JOLPI_BASE_URL}/${year}/driverstandings`]),
    fetchJolpiAny([`${JOLPI_BASE_URL}/${year}/results`]),
  ]);

  const drivers = ((((driversData?.MRData as JsonRecord)?.DriverTable as JsonRecord)?.Drivers) || []) as Array<JsonRecord>;
  const standings = (((((standingsData?.MRData as JsonRecord)?.StandingsTable as JsonRecord)?.StandingsLists as Array<JsonRecord>) || [])[0]?.DriverStandings || []) as Array<JsonRecord>;
  const seasonResults = ((((resultsData?.MRData as JsonRecord)?.RaceTable as JsonRecord)?.Races) || []) as Array<JsonRecord>;

  if (!drivers.length && !standings.length) {
    return { items: [], source: "jolpi" };
  }

  const standingsIndex = buildStandingsIndex(standings);
  const seasonStatsIndex = buildSeasonStatsIndex(seasonResults);
  const baseDrivers = drivers.length
    ? drivers
    : standings.map((entry) => (entry?.Driver || {}) as JsonRecord);

  const items = baseDrivers
    .map((driver, index) => {
      const driverId = String(driver?.driverId || "");
      const standing = standingsIndex.get(driverId) || {};
      const seasonStats = seasonStatsIndex.get(driverId) || {};

      const given = String(driver?.givenName || "");
      const family = String(driver?.familyName || "");
      const races = Number(seasonStats?.races || 0);
      const totalFinish = Number(seasonStats?.totalFinish || 0);
      const teamName = String(standing?.team || seasonStats?.team || "F1 Team");

      return {
        driver_number: Number(driver?.permanentNumber || 0) || index + 1,
        first_name: given,
        last_name: family,
        full_name: `${given} ${family}`.trim(),
        broadcast_name: `${given ? `${given[0]}. ` : ""}${family}`.trim() || family,
        name_acronym: String(driver?.code || family.slice(0, 3).toUpperCase()),
        team_name: teamName,
        team_colour: teamNameToColor(teamName),
        country_code: nationalityToCountryCode(driver?.nationality),
        headshot_url: null,
        season: {
          position: Number(standing?.position || 0) || null,
          points: Number(standing?.points || 0),
          wins: Number(standing?.wins || seasonStats?.wins || 0),
          podiums: Number(seasonStats?.podiums || 0),
          races,
          bestFinish: Number(seasonStats?.bestFinish || 0) || null,
          averageFinish: races ? Number((totalFinish / races).toFixed(2)) : null,
          lastFive: (seasonStats?.lastFive || []) as Array<JsonRecord>,
        },
        ergast: {
          driverId: driver?.driverId || null,
          code: driver?.code || null,
          givenName: driver?.givenName || null,
          familyName: driver?.familyName || null,
          dateOfBirth: driver?.dateOfBirth || null,
          nationality: driver?.nationality || null,
          url: driver?.url || null,
          permanentNumber: driver?.permanentNumber || null,
        },
      };
    })
    .sort((a, b) => {
      const apos = Number((a as JsonRecord).season ? ((a as JsonRecord).season as JsonRecord).position : Infinity) || Infinity;
      const bpos = Number((b as JsonRecord).season ? ((b as JsonRecord).season as JsonRecord).position : Infinity) || Infinity;
      if (apos !== bpos) return apos - bpos;
      const apoints = Number(((a as JsonRecord).season as JsonRecord)?.points || 0);
      const bpoints = Number(((b as JsonRecord).season as JsonRecord)?.points || 0);
      return bpoints - apoints;
    });

  return { items, source: "jolpi" };
}

const isRaceSession = (sessionName: unknown, sessionType: unknown) => {
  const value = `${String(sessionName || "")} ${String(sessionType || "")}`.toLowerCase();
  return value.includes("race") && !value.includes("sprint shootout");
};

const mapJolpiResultsToPositions = (race: JsonRecord, meetingKey: string, driverNumber: string | null, position: string | null) => {
  const raceDate = String(race?.date || "");
  const raceTime = String(race?.time || "00:00:00Z");
  const raceDateIso = raceDate ? `${raceDate}T${raceTime}` : new Date().toISOString();
  const results = (race?.Results || []) as Array<JsonRecord>;

  return results
    .map((result, index) => {
      const driver = (result?.Driver || {}) as JsonRecord;
      const constructor = (result?.Constructor || {}) as JsonRecord;
      const driverNum = Number(driver?.permanentNumber || result?.number || index + 1);
      const finalPos = Number(result?.position || 0) || null;
      const startPos = Number(result?.grid || 0) || null;

      return {
        meeting_key: Number(meetingKey),
        session_key: Number(meetingKey),
        session_name: String(race?.raceName || "Race"),
        circuit_short_name: String(((race?.Circuit as JsonRecord)?.circuitName || "")),
        date: raceDateIso,
        driver_number: driverNum,
        full_name: `${String(driver?.givenName || "")} ${String(driver?.familyName || "")}`.trim(),
        team_name: String(constructor?.name || ""),
        position: finalPos,
        finalPosition: finalPos,
        startingPosition: startPos,
        starting_grid_position: startPos,
      };
    })
    .filter((item) => {
      const byDriver = driverNumber ? Number(driverNumber) === item.driver_number : true;
      const byPosition = position ? Number(position) === item.position : true;
      return byDriver && byPosition;
    });
};

const runWithConcurrency = async <T, R>(
  items: Array<T>,
  limit: number,
  worker: (item: T, index: number) => Promise<R>
): Promise<Array<R>> => {
  if (!items.length) return [];

  const results: Array<R> = [];
  let index = 0;

  const run = async () => {
    while (index < items.length) {
      const current = index;
      index += 1;
      results[current] = await worker(items[current], current);
    }
  };

  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, () => run())
  );

  return results;
};

async function fetchOpenF1Positions(meetingKey: string, driverNumber: string | null, position: string | null): Promise<Array<JsonRecord>> {
  const sessions = await requestJson(
    `${OPENF1_BASE_URL}/sessions?meeting_key=${encodeURIComponent(meetingKey)}`,
    "openf1"
  ) as Array<JsonRecord>;
  if (!Array.isArray(sessions) || !sessions.length) return [];

  const sessionKeys = sessions.map((session) => toNumber(session?.session_key)).filter(Boolean) as Array<number>;
  const primarySessionKey = sessionKeys[sessionKeys.length - 1] || sessionKeys[0];
  const meetingDrivers = primarySessionKey
    ? await requestJson(`${OPENF1_BASE_URL}/drivers?session_key=${primarySessionKey}`, "openf1") as Array<JsonRecord>
    : [];

  const driverIndex = new Map<number, JsonRecord>(
    (meetingDrivers || [])
      .map((driver) => {
        const driverNum = toNumber(driver?.driver_number);
        if (!driverNum) return null;
        return [driverNum, driver] as [number, JsonRecord];
      })
      .filter(Boolean) as Array<[number, JsonRecord]>
  );

  const perSessionRows = await runWithConcurrency(sessions, 2, async (session) => {
    const sessionKey = toNumber(session?.session_key);
    if (!sessionKey) return [] as Array<JsonRecord>;

    const [positionsRows, resultsRows, startingGrid] = await Promise.all([
      requestJson(`${OPENF1_BASE_URL}/position?session_key=${sessionKey}`, "openf1").catch(() => []) as Promise<Array<JsonRecord>>,
      requestJson(`${OPENF1_BASE_URL}/session_result?session_key=${sessionKey}`, "openf1").catch(() => []) as Promise<Array<JsonRecord>>,
      isRaceSession(session?.session_name, session?.session_type)
        ? requestJson(`${OPENF1_BASE_URL}/starting_grid?session_key=${sessionKey}`, "openf1").catch(() => [])
        : Promise.resolve([] as Array<JsonRecord>),
    ]);

    const latestPositionByDriver = new Map<number, JsonRecord>();
    positionsRows.forEach((row) => {
      const driverNum = toNumber(row?.driver_number);
      if (!driverNum) return;
      const prev = latestPositionByDriver.get(driverNum);
      const prevDate = prev?.date ? new Date(String(prev.date)).getTime() : 0;
      const nextDate = row?.date ? new Date(String(row.date)).getTime() : 0;
      if (!prev || nextDate >= prevDate) {
        latestPositionByDriver.set(driverNum, row);
      }
    });

    const resultByDriver = new Map<number, JsonRecord>(
      resultsRows
        .map((row) => {
          const driverNum = toNumber(row?.driver_number);
          if (!driverNum) return null;
          return [driverNum, row] as [number, JsonRecord];
        })
        .filter(Boolean) as Array<[number, JsonRecord]>
    );

    const gridByDriver = new Map<number, number>(
      startingGrid
        .map((row) => {
          const driverNum = toNumber(row?.driver_number);
          const gridPos = toNumber(row?.position);
          if (!driverNum || !gridPos) return null;
          return [driverNum, gridPos] as [number, number];
        })
        .filter(Boolean) as Array<[number, number]>
    );

    const allDriverNums = new Set<number>([
      ...latestPositionByDriver.keys(),
      ...resultByDriver.keys(),
    ]);

    const mapped = Array.from(allDriverNums).map((driverNum) => {
      const latest = latestPositionByDriver.get(driverNum);
      const result = resultByDriver.get(driverNum);
      const driver = driverIndex.get(driverNum);

      const finalPosition = toNumber(result?.position)
        || toNumber(result?.classified_position)
        || toNumber(latest?.position);
      const startPosition = toNumber(result?.grid_position) || gridByDriver.get(driverNum) || null;

      return {
        meeting_key: toNumber(session?.meeting_key) || toNumber(meetingKey),
        session_key: sessionKey,
        session_name: String(session?.session_name || session?.session_type || "Session"),
        circuit_short_name: String(session?.circuit_short_name || ""),
        date: String(latest?.date || session?.date_end || session?.date_start || ""),
        driver_number: driverNum,
        full_name: String(driver?.full_name || result?.full_name || latest?.full_name || `Driver #${driverNum}`),
        team_name: String(driver?.team_name || result?.team_name || ""),
        position: finalPosition,
        finalPosition,
        startingPosition: startPosition,
        starting_grid_position: startPosition,
      };
    });

    return mapped.filter((row) => {
      const byDriver = driverNumber ? row.driver_number === Number(driverNumber) : true;
      const byPosition = position ? row.position === Number(position) : true;
      return byDriver && byPosition;
    });
  });

  return perSessionRows.flat();
}

async function fetchPositions(meetingKey: string, year: string, driverNumber: string | null, position: string | null): Promise<FetchResult<Array<JsonRecord>>> {
  try {
    const openRows = await fetchOpenF1Positions(meetingKey, driverNumber, position);
    if (openRows.length) {
      return { items: openRows, source: "openf1" };
    }
  } catch {
    // fallback to Jolpi
  }

  const attempts = [
    `${JOLPI_BASE_URL}/${year}/${meetingKey}/results/?format=json`,
    `${JOLPI_BASE_URL}/${year}/${meetingKey}/results?format=json`,
  ];

  for (const url of attempts) {
    try {
      const data = await requestJson(url, "jolpi") as JsonRecord;
      const race = (((data?.MRData as JsonRecord)?.RaceTable as JsonRecord)?.Races as Array<JsonRecord>)?.[0];
      if (!race) continue;
      return {
        items: mapJolpiResultsToPositions(race, meetingKey, driverNumber, position),
        source: "jolpi",
      };
    } catch {
      // try next
    }
  }

  return { items: [], source: "jolpi" };
}

const normalizeLaps = (rows: Array<JsonRecord>) =>
  rows
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
    .filter((lap) => lap.driver_number && lap.lap_number);

const normalizeStints = (rows: Array<JsonRecord>) =>
  rows
    .map((stint) => ({
      ...stint,
      session_key: toNumber(stint?.session_key),
      meeting_key: toNumber(stint?.meeting_key),
      driver_number: toNumber(stint?.driver_number),
      stint_number: toNumber(stint?.stint_number),
      lap_start: toNumber(stint?.lap_start) || 0,
      lap_end: toNumber(stint?.lap_end) || 0,
    }))
    .filter((stint) => stint.driver_number && Number(stint.lap_end) >= Number(stint.lap_start));

async function fetchLaps(sessionKey: string): Promise<FetchResult<Array<JsonRecord>>> {
  const payload = await requestJson(
    `${OPENF1_BASE_URL}/laps?session_key=${encodeURIComponent(sessionKey)}`,
    "openf1"
  ) as Array<JsonRecord>;
  return {
    items: normalizeLaps(Array.isArray(payload) ? payload : []),
    source: "openf1",
  };
}

async function fetchStints(sessionKey: string): Promise<FetchResult<Array<JsonRecord>>> {
  const payload = await requestJson(
    `${OPENF1_BASE_URL}/stints?session_key=${encodeURIComponent(sessionKey)}`,
    "openf1"
  ) as Array<JsonRecord>;
  return {
    items: normalizeStints(Array.isArray(payload) ? payload : []),
    source: "openf1",
  };
}

async function fetchDriverStandings(year: string): Promise<FetchResult<Array<JsonRecord>>> {
  const payload = await requestJson(
    `${JOLPI_BASE_URL}/${year}/driverstandings/?format=json`,
    "jolpi"
  ) as JsonRecord;

  const items = (((((payload?.MRData as JsonRecord)?.StandingsTable as JsonRecord)?.StandingsLists as Array<JsonRecord>) || [])[0]?.DriverStandings || []) as Array<JsonRecord>;
  return { items, source: "jolpi" };
}

async function fetchConstructorStandings(year: string): Promise<FetchResult<Array<JsonRecord>>> {
  const payload = await requestJson(
    `${JOLPI_BASE_URL}/${year}/constructorstandings/?format=json`,
    "jolpi"
  ) as JsonRecord;

  const items = (((((payload?.MRData as JsonRecord)?.StandingsTable as JsonRecord)?.StandingsLists as Array<JsonRecord>) || [])[0]?.ConstructorStandings || []) as Array<JsonRecord>;
  return { items, source: "jolpi" };
}

async function fetchRaceResults(year: string): Promise<FetchResult<Array<JsonRecord>>> {
  const baseUrl = `${JOLPI_BASE_URL}/${year}/results/?format=json`;
  const pageLimit = 1000;
  const firstPayload = await requestJson(`${baseUrl}&limit=${pageLimit}&offset=0`, "jolpi") as JsonRecord;

  const total = Number((firstPayload?.MRData as JsonRecord)?.total || 0);
  const limit = Number((firstPayload?.MRData as JsonRecord)?.limit || pageLimit);
  const races = ((((firstPayload?.MRData as JsonRecord)?.RaceTable as JsonRecord)?.Races) || []) as Array<JsonRecord>;

  if (total <= limit) {
    return { items: races, source: "jolpi" };
  }

  const extra: Array<JsonRecord> = [];
  for (let offset = limit; offset < total; offset += limit) {
    const page = await requestJson(`${baseUrl}&limit=${limit}&offset=${offset}`, "jolpi") as JsonRecord;
    extra.push(...(((((page?.MRData as JsonRecord)?.RaceTable as JsonRecord)?.Races) || []) as Array<JsonRecord>));
  }

  return { items: [...races, ...extra], source: "jolpi" };
}

function getYear(searchParams: URLSearchParams): string {
  return searchParams.get("year") || String(new Date().getFullYear());
}

function requireParam(searchParams: URLSearchParams, name: string): string {
  const value = searchParams.get(name);
  if (!value) {
    throw new Error(`Missing required query param: ${name}`);
  }
  return value;
}

export default {
  async fetch(request: Request, _env: unknown, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET,OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    if (request.method !== "GET") {
      return errorResponse("Method not allowed", 405);
    }

    try {
      if (url.pathname === "/api/events") {
        const year = getYear(url.searchParams);
        const country = url.searchParams.get("country");
        return cachedFetch(url, "events", TTL_MS.events, ctx, () => fetchEvents(year, country));
      }

      if (url.pathname === "/api/positions") {
        const meetingKey = requireParam(url.searchParams, "meetingKey");
        const year = getYear(url.searchParams);
        const driverNumber = url.searchParams.get("driverNumber");
        const position = url.searchParams.get("position");
        return cachedFetch(url, "positions", TTL_MS.positions, ctx, () =>
          fetchPositions(meetingKey, year, driverNumber, position)
        );
      }

      if (url.pathname === "/api/season-drivers") {
        const year = getYear(url.searchParams);
        return cachedFetch(url, "season-drivers", TTL_MS.seasonDrivers, ctx, () => fetchSeasonDrivers(year));
      }

      if (url.pathname === "/api/laps") {
        const sessionKey = requireParam(url.searchParams, "sessionKey");
        return cachedFetch(url, "laps", TTL_MS.laps, ctx, () => fetchLaps(sessionKey));
      }

      if (url.pathname === "/api/stints") {
        const sessionKey = requireParam(url.searchParams, "sessionKey");
        return cachedFetch(url, "stints", TTL_MS.stints, ctx, () => fetchStints(sessionKey));
      }

      if (url.pathname === "/api/driver-standings") {
        const year = getYear(url.searchParams);
        return cachedFetch(url, "driver-standings", TTL_MS.driverStandings, ctx, () => fetchDriverStandings(year));
      }

      if (url.pathname === "/api/constructor-standings") {
        const year = getYear(url.searchParams);
        return cachedFetch(url, "constructor-standings", TTL_MS.constructorStandings, ctx, () => fetchConstructorStandings(year));
      }

      if (url.pathname === "/api/race-results") {
        const year = getYear(url.searchParams);
        return cachedFetch(url, "race-results", TTL_MS.raceResults, ctx, () => fetchRaceResults(year));
      }

      return errorResponse("Not found", 404);
    } catch (error) {
      return errorResponse((error as Error)?.message || "Internal server error", 500);
    }
  },
};
