const normalizeText = (value) => {
  if (value == null) return null;
  const text = String(value).trim();
  return text.length ? text : null;
};

const normalizeNumericId = (value) => {
  if (value == null || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : normalizeText(value);
};

const normalizeYear = (year) => {
  const normalized = normalizeText(year);
  if (!normalized) return String(new Date().getFullYear());
  return normalized;
};

export const queryKeys = {
  events: (year, countryName = null) => ["events", normalizeYear(year), normalizeText(countryName)],
  positions: (meetingKey, driverNumber = null, position = null, year = null) => [
    "positions",
    normalizeNumericId(meetingKey),
    normalizeNumericId(driverNumber),
    normalizeNumericId(position),
    normalizeYear(year),
  ],
  seasonDrivers: (year) => ["season-drivers", normalizeYear(year)],
  stints: (sessionKey) => ["stints", normalizeNumericId(sessionKey)],
  laps: (sessionKey) => ["laps", normalizeNumericId(sessionKey)],
  driverStandings: (year) => ["driver-standings", normalizeYear(year)],
  constructorStandings: (year) => ["constructor-standings", normalizeYear(year)],
  raceResults: (year) => ["race-results", normalizeYear(year)],
  news: (timeframe, limit, source) => [
    "news",
    normalizeText(timeframe) || "week",
    Number(limit) || 15,
    normalizeText(source) || "crawler-reddit",
  ],
};

export const queryPrefixesByRoute = {
  "/": ["events", "news", "positions", "season-drivers"],
  "/archives": ["events", "positions", "season-drivers"],
  "/drivers": ["events", "season-drivers"],
  "/score-card": ["driver-standings", "constructor-standings", "race-results"],
  "/event": ["events", "positions", "season-drivers", "stints", "laps"],
};

export const toStaleCacheKey = (queryKey) => JSON.stringify(queryKey);
