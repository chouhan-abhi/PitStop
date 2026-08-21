import { useQuery } from "@tanstack/react-query";
import { requestJson } from "../../common/api/httpClient";
import { APP_LIVE_CACHE_CONFIG } from "../../common/AppConfig";

const OPENF1_BASE_URL = "https://api.openf1.org/v1";

const fetchTeamRadioDirect = async (meetingKey) => {
  const data = await requestJson(
    `${OPENF1_BASE_URL}/team_radio?meeting_key=${encodeURIComponent(meetingKey)}`,
    { source: "openf1" }
  );
  return Array.isArray(data) ? data : [];
};

export const useTeamRadio = (meetingKey, options = {}) => {
  return useQuery({
    queryKey: ["teamRadio", meetingKey],
    queryFn: () => fetchTeamRadioDirect(meetingKey),
    enabled: Boolean(meetingKey),
    ...APP_LIVE_CACHE_CONFIG,
    ...options,
  });
};
