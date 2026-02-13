import { useQuery } from '@tanstack/react-query';

import { APP_CACHE_CONFIG } from '../../common/AppConfig';

const fetchJson = async (url) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed (${response.status})`);
  }
  return response.json();
};

const mapJolpiRaceToMeeting = (race) => {
  const date = race?.date || '';
  const time = race?.time || '00:00:00Z';
  const round = Number(race?.round || 0);

  return {
    meeting_key: round,
    meeting_name: race?.raceName || 'Grand Prix',
    circuit_short_name: race?.Circuit?.circuitName || 'Circuit',
    circuit_name: race?.Circuit?.circuitName || 'Circuit',
    location: race?.Circuit?.Location?.locality || '',
    country_name: race?.Circuit?.Location?.country || '',
    country_code: null,
    year: Number(race?.season || new Date().getFullYear()),
    date_start: date ? `${date}T${time}` : null,
    session_key: round,
  };
};

const fetchEventsFromJolpi = async (year, country_name) => {
  const attempts = [
    `https://api.jolpi.ca/ergast/f1/${year}/races/?format=json`,
    `https://api.jolpi.ca/ergast/f1/${year}/races?format=json`,
  ];
  let sawValidResponse = false;

  for (const url of attempts) {
    try {
      const data = await fetchJson(url);
      const races = data?.MRData?.RaceTable?.Races || [];
      if (!Array.isArray(races)) {
        continue;
      }
      sawValidResponse = true;
      if (!races.length) {
        return [];
      }

      const meetings = races.map(mapJolpiRaceToMeeting);

      if (!country_name) {
        return meetings;
      }

      const normalizedCountry = country_name.toLowerCase().trim();
      return meetings.filter((meeting) =>
        meeting.country_name?.toLowerCase().includes(normalizedCountry)
      );
    } catch {
      // try next URL variation
    }
  }

  if (sawValidResponse) {
    return [];
  }

  throw new Error('Jolpi events feed unavailable');
};

const fetchEvents = async ({ queryKey }) => {
  const [_, year, country_name] = queryKey;

  const resolvedYear = year || String(new Date().getFullYear());
  return fetchEventsFromJolpi(resolvedYear, country_name);
};

export function useEvents(year = '2025', country_name) {
  return useQuery({
    queryKey: ['events', year, country_name],
    queryFn: fetchEvents,
    ...APP_CACHE_CONFIG,
  });
}
