import { useQuery } from "@tanstack/react-query";
import { requestJson } from "../../common/api/httpClient";
import { APP_LIVE_CACHE_CONFIG } from "../../common/AppConfig";

const OPENF1_BASE_URL = "https://api.openf1.org/v1";

const fetchWeatherDirect = async (meetingKey) => {
  const data = await requestJson(
    `${OPENF1_BASE_URL}/weather?meeting_key=${encodeURIComponent(meetingKey)}`,
    { source: "openf1" }
  );
  return Array.isArray(data) ? data : [];
};

export const useWeather = (meetingKey, options = {}) => {
  return useQuery({
    queryKey: ["weather", meetingKey],
    queryFn: () => fetchWeatherDirect(meetingKey),
    enabled: Boolean(meetingKey),
    ...APP_LIVE_CACHE_CONFIG,
    ...options,
  });
};
