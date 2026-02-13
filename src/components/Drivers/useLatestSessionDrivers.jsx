import { useQuery } from '@tanstack/react-query';

import { APP_CACHE_CONFIG } from '../../common/AppConfig';

const NATIONALITY_TO_COUNTRY_CODE = {
  british: 'GB',
  dutch: 'NL',
  spanish: 'ES',
  monegasque: 'MC',
  australian: 'AU',
  french: 'FR',
  german: 'DE',
  thai: 'TH',
  canadian: 'CA',
  japanese: 'JP',
  chinese: 'CN',
  mexican: 'MX',
  danish: 'DK',
  finnish: 'FI',
  american: 'US',
  argentine: 'AR',
  zealander: 'NZ',
  brazilian: 'BR',
  italian: 'IT',
};

const TEAM_COLOR_RULES = [
  { match: ['mclaren'], color: 'FF8000' },
  { match: ['ferrari'], color: 'E80020' },
  { match: ['red bull'], color: '3671C6' },
  { match: ['mercedes'], color: '27F4D2' },
  { match: ['aston martin'], color: '229971' },
  { match: ['alpine'], color: 'FF87BC' },
  { match: ['williams'], color: '64C4FF' },
  { match: ['haas'], color: 'B6BABD' },
  { match: ['racing bulls', 'visa cash app rb', 'rb f1'], color: '6692FF' },
  { match: ['sauber', 'kick'], color: '52E252' },
];

const fetchJolpi = async (paths = []) => {
  for (const path of paths) {
    const attempts = [`${path}/?format=json`, `${path}?format=json`];

    for (const url of attempts) {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          continue;
        }

        return response.json();
      } catch {
        // try next URL
      }
    }
  }

  throw new Error('Jolpi endpoint unavailable');
};

const fetchErgastDrivers = async (year) => {
  if (!year) return [];

  try {
    const data = await fetchJolpi([`https://api.jolpi.ca/ergast/f1/${year}/drivers`]);
    return data?.MRData?.DriverTable?.Drivers || [];
  } catch {
    return [];
  }
};

const fetchDriverStandings = async (year) => {
  if (!year) return [];

  try {
    const data = await fetchJolpi([`https://api.jolpi.ca/ergast/f1/${year}/driverstandings`]);
    return data?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings || [];
  } catch {
    return [];
  }
};

const fetchSeasonRaceResults = async (year) => {
  if (!year) return [];

  try {
    const data = await fetchJolpi([`https://api.jolpi.ca/ergast/f1/${year}/results`]);
    return data?.MRData?.RaceTable?.Races || [];
  } catch {
    return [];
  }
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

      if (constructor) {
        stats.team = constructor;
      }

      stats.lastFive.push({ round, raceName, position, points });
      if (stats.lastFive.length > 5) {
        stats.lastFive = stats.lastFive.slice(-5);
      }

      map.set(driverId, stats);
    });
  });

  return map;
};

const nationalityToCountryCode = (nationality) => {
  const key = (nationality || '').toLowerCase().trim();
  return NATIONALITY_TO_COUNTRY_CODE[key] || null;
};

const teamNameToColor = (teamName) => {
  const normalized = (teamName || '').toLowerCase();
  if (!normalized) return null;

  const matchedRule = TEAM_COLOR_RULES.find((rule) =>
    rule.match.some((token) => normalized.includes(token))
  );

  return matchedRule?.color || null;
};

const toUiDriver = (driver, index, standing, seasonStats) => {
  const given = driver?.givenName || '';
  const family = driver?.familyName || '';
  const permanentNumber = Number(driver?.permanentNumber || 0);

  const races = seasonStats?.races || 0;
  const averageFinish = races
    ? Number((seasonStats.totalFinish / races).toFixed(2))
    : null;

  const teamName = standing?.team || seasonStats?.team || 'F1 Team';

  return {
    driver_number: permanentNumber || index + 1,
    first_name: given,
    last_name: family,
    full_name: `${given} ${family}`.trim(),
    broadcast_name: `${given ? `${given[0]}. ` : ''}${family}`.trim() || family,
    name_acronym: driver?.code || family.slice(0, 3).toUpperCase(),
    team_name: teamName,
    team_colour: teamNameToColor(teamName),
    country_code: nationalityToCountryCode(driver?.nationality),
    headshot_url: null,
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

const fetchLatestSessionDrivers = async ({ queryKey }) => {
  const year = queryKey[3];
  const resolvedYear = year || String(new Date().getFullYear());

  const [drivers, standings, seasonResults] = await Promise.all([
    fetchErgastDrivers(resolvedYear),
    fetchDriverStandings(resolvedYear),
    fetchSeasonRaceResults(resolvedYear),
  ]);

  if (!drivers.length && !standings.length) {
    return [];
  }

  const standingsIndex = buildStandingsIndex(standings);
  const seasonStatsIndex = buildSeasonStatsIndex(seasonResults);

  const baseDrivers = drivers.length
    ? drivers
    : standings.map((entry) => entry?.Driver).filter(Boolean);

  return baseDrivers
    .map((driver, index) => {
      const driverId = driver?.driverId;
      const standing = standingsIndex.get(driverId);
      const seasonStats = seasonStatsIndex.get(driverId);
      return toUiDriver(driver, index, standing, seasonStats);
    })
    .sort((a, b) => {
      const apos = a.season?.position || Number.POSITIVE_INFINITY;
      const bpos = b.season?.position || Number.POSITIVE_INFINITY;
      if (apos !== bpos) return apos - bpos;
      return (b.season?.points || 0) - (a.season?.points || 0);
    });
};

export function useLatestSessionDrivers(meetingKey, sessionKey = null, options = {}) {
  const {
    year,
    enrichErgast = true,
    enabled,
    ...queryOptions
  } = options;

  const resolvedYear = year || String(new Date().getFullYear());

  return useQuery({
    queryKey: ['latestSessionDrivers', meetingKey, sessionKey, resolvedYear, enrichErgast],
    queryFn: fetchLatestSessionDrivers,
    enabled: enabled !== undefined ? enabled : Boolean(resolvedYear),
    ...APP_CACHE_CONFIG,
    ...queryOptions,
  });
}
