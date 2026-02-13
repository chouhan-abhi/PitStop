import { useQuery } from "@tanstack/react-query";

import { APP_LIVE_CACHE_CONFIG } from "../../common/AppConfig";

const OPENF1_BASE_URL = "https://api.openf1.org/v1";

const toNumber = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

const fetchLaps = async ({ queryKey }) => {
  const sessionKey = queryKey[1];
  if (!sessionKey) return [];

  const response = await fetch(
    `${OPENF1_BASE_URL}/laps?session_key=${encodeURIComponent(sessionKey)}`
  );
  if (!response.ok) {
    throw new Error(`Failed to load laps (${response.status})`);
  }

  const data = await response.json();
  if (!Array.isArray(data)) return [];

  return data
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
    .filter((lap) => lap.driver_number && lap.lap_number)
    .sort((a, b) => {
      if (a.driver_number !== b.driver_number) {
        return a.driver_number - b.driver_number;
      }
      return (a.lap_number || 0) - (b.lap_number || 0);
    });
};

export const useLaps = (sessionKey, options = {}) =>
  useQuery({
    queryKey: ["laps", sessionKey],
    queryFn: fetchLaps,
    enabled: options.enabled !== undefined ? options.enabled : Boolean(sessionKey),
    ...APP_LIVE_CACHE_CONFIG,
    ...options,
  });
