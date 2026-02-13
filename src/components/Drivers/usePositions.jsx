import { useQuery } from '@tanstack/react-query';

import { APP_CACHE_CONFIG } from '../../common/AppConfig';

const mapJolpiResultsToPositions = (race, meeting_key, driver_number, position) => {
  const raceDate = race?.date || '';
  const raceTime = race?.time || '00:00:00Z';
  const raceDateIso = raceDate ? `${raceDate}T${raceTime}` : new Date().toISOString();
  const results = race?.Results || [];

  return results
    .map((result, index) => {
      const driverNum = Number(
        result?.Driver?.permanentNumber || result?.number || index + 1
      );

      const finalPos = Number(result?.position || 0);
      const startPos = Number(result?.grid || 0) || null;

      return {
        meeting_key: Number(meeting_key),
        session_key: Number(meeting_key),
        session_name: race?.raceName || 'Race',
        circuit_short_name: race?.Circuit?.circuitName || '',
        date: raceDateIso,
        driver_number: driverNum,
        full_name: `${result?.Driver?.givenName || ''} ${result?.Driver?.familyName || ''}`.trim(),
        team_name: result?.Constructor?.name || '',
        position: finalPos || null,
        finalPosition: finalPos || null,
        startingPosition: startPos,
        starting_grid_position: startPos,
      };
    })
    .filter((item) => {
      const byDriver = driver_number ? Number(driver_number) === item.driver_number : true;
      const byPosition = position ? Number(position) === item.position : true;
      return byDriver && byPosition;
    });
};

const fetchJolpiRacePositions = async ({ meeting_key, driver_number, position, year }) => {
  if (!meeting_key) return [];

  const resolvedYear = year || String(new Date().getFullYear());
  const attempts = [
    `https://api.jolpi.ca/ergast/f1/${resolvedYear}/${meeting_key}/results/?format=json`,
    `https://api.jolpi.ca/ergast/f1/${resolvedYear}/${meeting_key}/results?format=json`,
  ];

  for (const url of attempts) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        continue;
      }

      const data = await response.json();
      const race = data?.MRData?.RaceTable?.Races?.[0];
      if (!race) {
        continue;
      }

      return mapJolpiResultsToPositions(race, meeting_key, driver_number, position);
    } catch {
      // try next URL variation
    }
  }

  return [];
};

const fetchDrivers = async ({ queryKey }) => {
  const [_, meeting_key, driver_number, position, year] = queryKey;
  return fetchJolpiRacePositions({ meeting_key, driver_number, position, year });
};

export function usePositions(meeting_key, driver_number, position, options = {}) {
  const { year, ...queryOptions } = options;
  const resolvedYear = year || String(new Date().getFullYear());

  return useQuery({
    queryKey: ['drivers', meeting_key, driver_number, position, resolvedYear],
    queryFn: fetchDrivers,
    enabled: queryOptions.enabled !== undefined ? queryOptions.enabled : Boolean(meeting_key),
    ...APP_CACHE_CONFIG,
    ...queryOptions,
  });
}
