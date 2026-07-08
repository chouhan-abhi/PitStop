import { requestJson } from "../api/httpClient";
import { buildNameKey, normalizeDriverName, toDriverId, toDriverNumber } from "./driverKeys";

const OPENF1_BASE_URL = "https://api.openf1.org/v1";
const JOLPI_BASE_URL = "https://api.jolpi.ca/ergast/f1";

const NATIONALITY_TO_COUNTRY_CODE = {
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

const fetchJson = async (url, source) => {
  try {
    return await requestJson(url, { source });
  } catch {
    return null;
  }
};

const maybeFetchArray = async (url, source) => {
  const data = await fetchJson(url, source);
  return Array.isArray(data) ? data : [];
};

export const nationalityToCountryCode = (nationality) => {
  const key = (nationality || "").toLowerCase().trim();
  return NATIONALITY_TO_COUNTRY_CODE[key] || null;
};

export const teamNameToColor = (teamName) => {
  const normalized = (teamName || "").toLowerCase();
  if (!normalized) return null;
  const matchedRule = TEAM_COLOR_RULES.find((rule) =>
    rule.match.some((token) => normalized.includes(token))
  );
  return matchedRule?.color || null;
};

const fetchJolpi = async (paths = []) => {
  for (const path of paths) {
    for (const url of [`${path}/?format=json`, `${path}?format=json`]) {
      const data = await fetchJson(url, "jolpi");
      if (data) return data;
    }
  }
  return null;
};

export const resolveErgastRound = async (meetingKey, year) => {
  const key = Number(meetingKey);
  if (!Number.isFinite(key)) return null;
  if (key > 0 && key <= 30) return key;

  const [openF1Meetings, jolpiData] = await Promise.all([
    maybeFetchArray(`${OPENF1_BASE_URL}/meetings?meeting_key=${key}`, "openf1"),
    fetchJolpi([`${JOLPI_BASE_URL}/${year}/races`]),
  ]);

  const meeting = openF1Meetings[0];
  const races = jolpiData?.MRData?.RaceTable?.Races || [];
  if (!meeting || !races.length) return null;

  const meetingDate = meeting?.date_start ? new Date(meeting.date_start).toDateString() : null;
  const circuit = (meeting?.circuit_short_name || "").toLowerCase();

  const byDate = races.find((race) => {
    if (!meetingDate || !race?.date) return false;
    const raceDate = new Date(`${race.date}T${race.time || "00:00:00Z"}`).toDateString();
    return raceDate === meetingDate;
  });
  if (byDate) return Number(byDate.round);

  const byCircuit = races.find((race) => {
    const raceCircuit = (race?.Circuit?.circuitName || "").toLowerCase();
    return circuit && raceCircuit.includes(circuit);
  });
  if (byCircuit) return Number(byCircuit.round);

  return null;
};

const buildStandingsIndex = (standings = []) => {
  const map = new Map();
  standings.forEach((entry) => {
    const driverId = entry?.Driver?.driverId;
    if (!driverId) return;
    map.set(driverId, {
      position: Number(entry?.position || 0) || null,
      points: Number(entry?.points || 0),
      wins: Number(entry?.wins || 0),
      team: entry?.Constructors?.[0]?.name || null,
    });
  });
  return map;
};

const buildSeasonStatsIndex = (races = []) => {
  const map = new Map();
  const sorted = [...races].sort((a, b) => Number(a?.round || 0) - Number(b?.round || 0));

  sorted.forEach((race) => {
    const round = Number(race?.round || 0);
    const raceName = race?.raceName || `Round ${round}`;

    (race?.Results || []).forEach((result) => {
      const driverId = result?.Driver?.driverId;
      if (!driverId) return;

      const position = Number(result?.position || 0) || null;
      const points = Number(result?.points || 0);
      const constructor = result?.Constructor?.name || null;

      if (!map.has(driverId)) {
        map.set(driverId, {
          races: 0,
          podiums: 0,
          wins: 0,
          totalFinish: 0,
          bestFinish: null,
          team: constructor,
          lastFive: [],
        });
      }

      const stats = map.get(driverId);
      stats.races += 1;
      if (position) {
        stats.totalFinish += position;
        stats.bestFinish = stats.bestFinish ? Math.min(stats.bestFinish, position) : position;
        if (position <= 3) stats.podiums += 1;
        if (position === 1) stats.wins += 1;
      }
      if (constructor) stats.team = constructor;
      stats.lastFive.push({ round, raceName, position, points });
      if (stats.lastFive.length > 5) stats.lastFive = stats.lastFive.slice(-5);
      map.set(driverId, stats);
    });
  });

  return map;
};

const ergastDriverToBase = (driver, index, standing, seasonStats) => {
  const given = driver?.givenName || "";
  const family = driver?.familyName || "";
  const permanentNumber = toDriverNumber(driver?.permanentNumber);
  const teamName = standing?.team || seasonStats?.team || "F1 Team";
  const races = seasonStats?.races || 0;
  const averageFinish = races ? Number((seasonStats.totalFinish / races).toFixed(2)) : null;

  return {
    driverId: driver?.driverId || null,
    driver_number: permanentNumber,
    first_name: given,
    last_name: family,
    full_name: `${given} ${family}`.trim(),
    broadcast_name: `${given ? `${given[0]}. ` : ""}${family}`.trim() || family,
    name_acronym: driver?.code || family.slice(0, 3).toUpperCase(),
    team_name: teamName,
    team_colour: teamNameToColor(teamName),
    country_code: nationalityToCountryCode(driver?.nationality),
    headshot_url: null,
    session_key: null,
    season: {
      position: standing?.position || null,
      points: standing?.points || 0,
      wins: standing?.wins || seasonStats?.wins || 0,
      podiums: seasonStats?.podiums || 0,
      races,
      bestFinish: seasonStats?.bestFinish || null,
      averageFinish,
      lastFive: seasonStats?.lastFive || [],
    },
    ergast: {
      driverId: driver?.driverId,
      code: driver?.code,
      givenName: driver?.givenName,
      familyName: driver?.familyName,
      dateOfBirth: driver?.dateOfBirth,
      nationality: driver?.nationality,
      url: driver?.url,
      permanentNumber: driver?.permanentNumber,
    },
  };
};

const openF1DriverToBase = (driver) => ({
  driverId: null,
  driver_number: toDriverNumber(driver?.driver_number),
  first_name: driver?.first_name || "",
  last_name: driver?.last_name || "",
  full_name: driver?.full_name || `${driver?.first_name || ""} ${driver?.last_name || ""}`.trim(),
  broadcast_name: driver?.broadcast_name || driver?.full_name || "",
  name_acronym: driver?.name_acronym || "",
  team_name: driver?.team_name || "F1 Team",
  team_colour: driver?.team_colour || teamNameToColor(driver?.team_name),
  country_code: driver?.country_code || null,
  headshot_url: driver?.headshot_url || null,
  session_key: toDriverNumber(driver?.session_key),
  season: null,
  ergast: null,
});

/**
 * Merge OpenF1 session drivers with Ergast season roster.
 */
export const mergeDriverRecords = (ergastDrivers = [], openF1Drivers = []) => {
  const byNumber = new Map();
  const byDriverId = new Map();
  const byName = new Map();

  const register = (driver) => {
    const num = toDriverNumber(driver?.driver_number);
    if (num) byNumber.set(num, driver);
    const id = toDriverId(driver?.driverId);
    if (id) byDriverId.set(id, driver);
    const nameKey = buildNameKey(driver);
    if (nameKey) byName.set(nameKey, driver);
  };

  const findMatch = (candidate) => {
    const num = toDriverNumber(candidate?.driver_number);
    if (num && byNumber.has(num)) return byNumber.get(num);

    const id = toDriverId(candidate?.driverId);
    if (id && byDriverId.has(id)) return byDriverId.get(id);

    const nameKey = buildNameKey(candidate);
    if (nameKey && byName.has(nameKey)) return byName.get(nameKey);

    const ergastNum = toDriverNumber(candidate?.ergast?.permanentNumber);
    if (ergastNum && byNumber.has(ergastNum)) return byNumber.get(ergastNum);

    return null;
  };

  ergastDrivers.forEach((driver) => register(driver));

  openF1Drivers.forEach((openDriver) => {
    const base = openF1DriverToBase(openDriver);
    const match = findMatch(base);

    if (match) {
      const merged = {
        ...match,
        driver_number: base.driver_number || match.driver_number,
        first_name: base.first_name || match.first_name,
        last_name: base.last_name || match.last_name,
        full_name: base.full_name || match.full_name,
        broadcast_name: base.broadcast_name || match.broadcast_name,
        name_acronym: base.name_acronym || match.name_acronym,
        team_name: base.team_name || match.team_name,
        team_colour: base.team_colour || match.team_colour,
        country_code: base.country_code || match.country_code,
        headshot_url: base.headshot_url || match.headshot_url,
        session_key: base.session_key || match.session_key,
      };
      register(merged);
      byNumber.set(merged.driver_number, merged);
      if (merged.driverId) byDriverId.set(merged.driverId, merged);
      byName.set(buildNameKey(merged), merged);
      return;
    }

    register(base);
  });

  const seen = new Set();
  const result = [];

  ergastDrivers.forEach((driver) => {
    const key = driver.driverId || driver.driver_number || buildNameKey(driver);
    if (seen.has(key)) return;
    seen.add(key);
    const updated = findMatch(driver) || driver;
    result.push(updated);
  });

  openF1Drivers.forEach((openDriver) => {
    const base = openF1DriverToBase(openDriver);
    const match = findMatch(base);
    if (match) return;
    const key = base.driver_number || buildNameKey(base);
    if (seen.has(key)) return;
    seen.add(key);
    result.push(base);
  });

  return result.sort((a, b) => {
    const apos = a.season?.position || Number.POSITIVE_INFINITY;
    const bpos = b.season?.position || Number.POSITIVE_INFINITY;
    if (apos !== bpos) return apos - bpos;
    return (b.season?.points || 0) - (a.season?.points || 0);
  });
};

export const buildDriversByNumber = (drivers = []) =>
  new Map(
    drivers
      .map((driver) => [toDriverNumber(driver?.driver_number), driver])
      .filter(([num]) => Number.isFinite(num))
  );

export const enrichDriversWithPositions = (drivers = [], positions = []) => {
  const byNumber = buildDriversByNumber(drivers);
  const positionByNumber = new Map(
    positions
      .map((pos) => [toDriverNumber(pos?.driver_number), pos])
      .filter(([num]) => Number.isFinite(num))
  );

  const merged = new Map();

  positions.forEach((pos) => {
    const num = toDriverNumber(pos?.driver_number);
    if (!num) return;
    const driver = byNumber.get(num);
    merged.set(num, {
      ...(driver || {
        driver_number: num,
        full_name: pos.full_name,
        team_name: pos.team_name,
        headshot_url: null,
      }),
      position: pos.finalPosition ?? pos.position,
      startingPosition: pos.startingPosition ?? pos.starting_grid_position,
      team_name: pos.team_name || driver?.team_name,
      full_name: driver?.full_name || pos.full_name,
    });
  });

  drivers.forEach((driver) => {
    const num = toDriverNumber(driver?.driver_number);
    if (!num || merged.has(num)) return;
    const pos = positionByNumber.get(num);
    merged.set(num, {
      ...driver,
      position: pos?.finalPosition ?? pos?.position,
      startingPosition: pos?.startingPosition ?? pos?.starting_grid_position,
    });
  });

  return Array.from(merged.values()).sort(
    (a, b) => (a.position || 999) - (b.position || 999)
  );
};

export const fetchErgastSeasonDrivers = async (year) => {
  const [driversData, standingsData, resultsData] = await Promise.all([
    fetchJolpi([`${JOLPI_BASE_URL}/${year}/drivers`]),
    fetchJolpi([`${JOLPI_BASE_URL}/${year}/driverstandings`]),
    fetchJolpi([`${JOLPI_BASE_URL}/${year}/results`]),
  ]);

  const drivers = driversData?.MRData?.DriverTable?.Drivers || [];
  const standings = standingsData?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings || [];
  const seasonResults = resultsData?.MRData?.RaceTable?.Races || [];

  const standingsIndex = buildStandingsIndex(standings);
  const seasonStatsIndex = buildSeasonStatsIndex(seasonResults);

  const baseDrivers = drivers.length
    ? drivers
    : standings.map((entry) => entry?.Driver).filter(Boolean);

  return baseDrivers.map((driver, index) => {
    const driverId = driver?.driverId;
    return ergastDriverToBase(
      driver,
      index,
      standingsIndex.get(driverId),
      seasonStatsIndex.get(driverId)
    );
  });
};

export const fetchOpenF1SessionDrivers = async (sessionKey) => {
  if (!sessionKey) return [];
  return maybeFetchArray(
    `${OPENF1_BASE_URL}/drivers?session_key=${encodeURIComponent(sessionKey)}`,
    "openf1"
  );
};

export const fetchDriverRegistry = async ({ year, sessionKey = null }) => {
  const resolvedYear = year || String(new Date().getFullYear());
  const [ergastDrivers, openF1Drivers] = await Promise.all([
    fetchErgastSeasonDrivers(resolvedYear),
    sessionKey ? fetchOpenF1SessionDrivers(sessionKey) : Promise.resolve([]),
  ]);

  const merged = mergeDriverRecords(ergastDrivers, openF1Drivers);
  return {
    payload: merged,
    source: openF1Drivers.length ? "openf1+jolpi" : "jolpi",
  };
};

export const lookupDriverByNumber = (drivers, driverNumber) => {
  const num = toDriverNumber(driverNumber);
  if (!num) return null;
  return drivers.find((d) => toDriverNumber(d.driver_number) === num) || null;
};

export const lookupDriverByName = (drivers, name) => {
  const key = normalizeDriverName(name);
  if (!key) return null;
  return drivers.find((d) => buildNameKey(d) === key) || null;
};
