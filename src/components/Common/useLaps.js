import { useQuery } from "@tanstack/react-query";

import { APP_LIVE_CACHE_CONFIG } from "../../common/AppConfig";

const fetchLaps = async () => {
  return [];
};

export const useLaps = (sessionKey, options = {}) =>
  useQuery({
    queryKey: ["laps", sessionKey],
    queryFn: fetchLaps,
    enabled: options.enabled !== undefined ? options.enabled : Boolean(sessionKey),
    ...APP_LIVE_CACHE_CONFIG,
    ...options,
  });
