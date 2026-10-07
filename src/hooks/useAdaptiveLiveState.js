import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { requestJson } from "../common/api/httpClient";

const OPENF1_BASE_URL = "https://api.openf1.org/v1";

export const useAdaptiveLiveState = (currentMeetingKey) => {
  // Query sessions for the meeting
  const { data: sessions = [], isLoading: sessionsLoading } = useQuery({
    queryKey: ["liveSessions", currentMeetingKey],
    queryFn: async () => {
      if (!currentMeetingKey) return [];
      try {
        const data = await requestJson(
          `${OPENF1_BASE_URL}/sessions?meeting_key=${encodeURIComponent(currentMeetingKey)}`,
          { source: "openf1", timeoutMs: 10000, maxRetries: 1 }
        );
        return Array.isArray(data) ? data : [];
      } catch {
        return [];
      }
    },
    enabled: Boolean(currentMeetingKey),
    staleTime: 5 * 60 * 1000, // 5 min cache
    refetchInterval: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const liveInfo = useMemo(() => {
    if (!sessions.length) {
      return { isLive: false, activeSession: null, nextSession: null };
    }

    const now = new Date();
    // Sort chronologically
    const sorted = [...sessions].sort(
      (a, b) => new Date(a.date_start).getTime() - new Date(b.date_start).getTime()
    );

    // Active session: now between date_start and date_end
    const active = sorted.find((s) => {
      const start = new Date(s.date_start);
      const end = new Date(s.date_end);
      // add 15 min buffer to end for podium / interviews
      return now >= start && now <= new Date(end.getTime() + 15 * 60 * 1000);
    });

    const upcoming = sorted.find((s) => new Date(s.date_start) > now);

    return {
      isLive: Boolean(active),
      activeSession: active || null,
      nextSession: upcoming || null,
    };
  }, [sessions]);

  return {
    ...liveInfo,
    sessions,
    isLoading: sessionsLoading,
    // Recommend polling interval for telemetry hooks based on live status
    recommendedPollInterval: liveInfo.isLive ? 6000 : false,
    recommendedStaleTime: liveInfo.isLive ? 4000 : 5 * 60 * 1000,
  };
};

export default useAdaptiveLiveState;
