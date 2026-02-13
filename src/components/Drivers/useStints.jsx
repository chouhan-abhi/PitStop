import { useQuery } from '@tanstack/react-query';

import { APP_CACHE_CONFIG } from '../../common/AppConfig';

const OPENF1_BASE_URL = 'https://api.openf1.org/v1';

const toNumber = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

const fetchStints = async ({ queryKey }) => {
  const sessionKey = queryKey[1];
  if (!sessionKey) return [];

  const response = await fetch(
    `${OPENF1_BASE_URL}/stints?session_key=${encodeURIComponent(sessionKey)}`
  );
  if (!response.ok) {
    throw new Error(`Failed to load stints (${response.status})`);
  }

  const data = await response.json();
  if (!Array.isArray(data)) return [];

  return data
    .map((stint) => ({
      ...stint,
      session_key: toNumber(stint?.session_key),
      meeting_key: toNumber(stint?.meeting_key),
      driver_number: toNumber(stint?.driver_number),
      stint_number: toNumber(stint?.stint_number),
      lap_start: toNumber(stint?.lap_start) || 0,
      lap_end: toNumber(stint?.lap_end) || 0,
    }))
    .filter((stint) => stint.driver_number && stint.lap_end >= stint.lap_start)
    .sort((a, b) => {
      if (a.driver_number !== b.driver_number) {
        return a.driver_number - b.driver_number;
      }
      return (a.stint_number || 0) - (b.stint_number || 0);
    });
};

export function useStints(sessionKey, options = {}) {
  return useQuery({
    queryKey: ['stints', sessionKey],
    queryFn: fetchStints,
    enabled: options.enabled !== undefined ? options.enabled : Boolean(sessionKey),
    ...APP_CACHE_CONFIG,
    ...options,
  });
}
