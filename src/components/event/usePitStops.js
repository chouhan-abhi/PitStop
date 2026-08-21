import { useQuery } from "@tanstack/react-query";
import { requestJson } from "../../common/api/httpClient";
import { APP_LIVE_CACHE_CONFIG } from "../../common/AppConfig";

const OPENF1_BASE_URL = "https://api.openf1.org/v1";

const fetchPitStopsDirect = async (sessionKey) => {
  const data = await requestJson(
    `${OPENF1_BASE_URL}/pit?session_key=${encodeURIComponent(sessionKey)}`,
    { source: "openf1" }
  );
  return Array.isArray(data) ? data : [];
};

export const usePitStops = (sessionKey, options = {}) => {
  return useQuery({
    queryKey: ["pitStops", sessionKey],
    queryFn: () => fetchPitStopsDirect(sessionKey),
    enabled: Boolean(sessionKey),
    ...APP_LIVE_CACHE_CONFIG,
    ...options,
  });
};
