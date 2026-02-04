import { useQuery } from "@tanstack/react-query";

const fetchLaps = async (sessionKey) => {
  const response = await fetch(
    `https://api.openf1.org/v1/laps?session_key=${sessionKey}`
  );
  if (!response.ok) {
    throw new Error("Failed to load laps");
  }
  const data = await response.json();
  return Array.isArray(data) ? data : [];
};

export const useLaps = (sessionKey, options = {}) =>
  useQuery({
    queryKey: ["laps", sessionKey],
    queryFn: () => fetchLaps(sessionKey),
    enabled: options.enabled !== undefined ? options.enabled : Boolean(sessionKey),
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
    ...options,
  });
