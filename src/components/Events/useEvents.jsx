import { useQuery } from "@tanstack/react-query";

import { APP_CACHE_CONFIG } from "../../common/AppConfig";
import { requestJson } from "../../common/api/httpClient";
import { buildApiEndpoint, isProxyEnabled } from "../../common/api/endpoints";
import { queryKeys, toStaleCacheKey } from "../../common/api/queryKeys";
import { withQueryDataMeta, withStaleFallback } from "../../common/api/staleCache";

const OPENF1_BASE_URL = "https://api.openf1.org/v1";
const JOLPI_BASE_URL = "https://api.jolpi.ca/ergast/f1";

const fetchJson = (url, source) => requestJson(url, { source });

const toOpenF1Meeting = (meeting) => {
  if (!meeting?.meeting_key) return null;

  const dateStart = meeting?.date_start || null;
  return {
    meeting_key: Number(meeting.meeting_key),
    meeting_name: meeting?.meeting_name || meeting?.meeting_official_name || "Grand Prix",
    circuit_short_name: meeting?.circuit_short_name || "Circuit",
    circuit_name: meeting?.circuit_short_name || "Circuit",
    location: meeting?.location || "",
    country_name: meeting?.country_name || "",
    country_code: meeting?.country_code || null,
    year: Number(meeting?.year || (dateStart ? new Date(dateStart).getFullYear() : new Date().getFullYear())),
    date_start: dateStart,
    gmt_offset: meeting?.gmt_offset || null,
    session_key: null,
  };
};

const mapJolpiRaceToMeeting = (race) => {
  const date = race?.date || "";
  const time = race?.time || "00:00:00Z";
  const round = Number(race?.round || 0);

  return {
    meeting_key: round,
    meeting_name: race?.raceName || "Grand Prix",
    circuit_short_name: race?.Circuit?.circuitName || "Circuit",
    circuit_name: race?.Circuit?.circuitName || "Circuit",
    location: race?.Circuit?.Location?.locality || "",
    country_name: race?.Circuit?.Location?.country || "",
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
  const data = await fetchJson(url, "openf1");
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
      const data = await fetchJson(url, "jolpi");
      const races = data?.MRData?.RaceTable?.Races || [];
      if (!Array.isArray(races)) continue;

      const meetings = races.map(mapJolpiRaceToMeeting);
      return sortMeetings(filterByCountry(meetings, countryName));
    } catch {
      // try next URL variation
    }
  }

  throw new Error("Event feeds unavailable");
};

const fetchEventsDirect = async (year, countryName) => {
  try {
    const openF1Meetings = await fetchEventsFromOpenF1(year, countryName);
    if (openF1Meetings.length) {
      return { payload: openF1Meetings, source: "openf1" };
    }
  } catch {
    // fallback to Jolpi
  }

  const jolpiMeetings = await fetchEventsFromJolpi(year, countryName);
  return { payload: jolpiMeetings, source: "jolpi" };
};

const fetchEventsFromProxy = async (year, countryName) => {
  const url = buildApiEndpoint("/api/events", { year, country: countryName });
  const payload = await requestJson(url, { source: "worker" });
  const meetings = Array.isArray(payload?.items) ? payload.items : (Array.isArray(payload) ? payload : []);
  return {
    payload: sortMeetings(filterByCountry(meetings, countryName)),
    source: payload?.source || "worker",
  };
};

const fetchEvents = async ({ queryKey }) => {
  const [, year, countryName] = queryKey;
  const resolvedYear = year || String(new Date().getFullYear());
  const cacheKey = toStaleCacheKey(queryKey);

  return withStaleFallback({
    cacheKey,
    source: isProxyEnabled() ? "worker" : "openf1",
    fetcher: () =>
      (isProxyEnabled()
        ? fetchEventsFromProxy(resolvedYear, countryName)
        : fetchEventsDirect(resolvedYear, countryName)),
  });
};

export function useEvents(year = "2025", countryName) {
  const queryResult = useQuery({
    queryKey: queryKeys.events(year, countryName),
    queryFn: fetchEvents,
    ...APP_CACHE_CONFIG,
  });

  return withQueryDataMeta(queryResult, []);
}
