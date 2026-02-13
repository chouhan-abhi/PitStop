import { useQuery } from '@tanstack/react-query';

import { APP_CACHE_CONFIG } from '../../common/AppConfig';

const OPENF1_BASE_URL = 'https://api.openf1.org/v1';
const JOLPI_BASE_URL = 'https://api.jolpi.ca/ergast/f1';

const fetchJson = async (url) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed (${response.status})`);
  }
  return response.json();
};

const toOpenF1Meeting = (meeting) => {
  if (!meeting?.meeting_key) return null;

  const dateStart = meeting?.date_start || null;
  return {
    meeting_key: Number(meeting.meeting_key),
    meeting_name: meeting?.meeting_name || meeting?.meeting_official_name || 'Grand Prix',
    circuit_short_name: meeting?.circuit_short_name || 'Circuit',
    circuit_name: meeting?.circuit_short_name || 'Circuit',
    location: meeting?.location || '',
    country_name: meeting?.country_name || '',
    country_code: meeting?.country_code || null,
    year: Number(meeting?.year || (dateStart ? new Date(dateStart).getFullYear() : new Date().getFullYear())),
    date_start: dateStart,
    gmt_offset: meeting?.gmt_offset || null,
    session_key: null,
  };
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

const filterByCountry = (meetings = [], countryName) => {
  if (!countryName) return meetings;

  const normalizedCountry = countryName.toLowerCase().trim();
  return meetings.filter((meeting) =>
    meeting.country_name?.toLowerCase().includes(normalizedCountry)
  );
};

const sortMeetings = (meetings = []) =>
  [...meetings].sort((a, b) => new Date(a?.date_start || 0) - new Date(b?.date_start || 0));

const fetchEventsFromOpenF1 = async (year, countryName) => {
  const url = `${OPENF1_BASE_URL}/meetings?year=${encodeURIComponent(year)}`;
  const data = await fetchJson(url);
  const meetings = Array.isArray(data) ? data.map(toOpenF1Meeting).filter(Boolean) : [];
  return sortMeetings(filterByCountry(meetings, countryName));
};

const fetchEventsFromJolpi = async (year, countryName) => {
  const attempts = [
    `${JOLPI_BASE_URL}/${year}/races/?format=json`,
    `${JOLPI_BASE_URL}/${year}/races?format=json`,
  ];

  for (const url of attempts) {
    try {
      const data = await fetchJson(url);
      const races = data?.MRData?.RaceTable?.Races || [];
      if (!Array.isArray(races)) continue;

      const meetings = races.map(mapJolpiRaceToMeeting);
      return sortMeetings(filterByCountry(meetings, countryName));
    } catch {
      // try next URL variation
    }
  }

  throw new Error('Event feeds unavailable');
};

const fetchEvents = async ({ queryKey }) => {
  const [_, year, countryName] = queryKey;
  const resolvedYear = year || String(new Date().getFullYear());

  try {
    const openF1Meetings = await fetchEventsFromOpenF1(resolvedYear, countryName);
    if (openF1Meetings.length) {
      return openF1Meetings;
    }
  } catch {
    // fallback to Jolpi
  }

  return fetchEventsFromJolpi(resolvedYear, countryName);
};

export function useEvents(year = '2025', country_name) {
  return useQuery({
    queryKey: ['events', year, country_name],
    queryFn: fetchEvents,
    ...APP_CACHE_CONFIG,
  });
}
