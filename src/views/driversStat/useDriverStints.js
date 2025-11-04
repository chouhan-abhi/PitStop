// src/views/driversStat/useDriverStints.js
import { useQuery } from "@tanstack/react-query";

const API_URL = "https://api.openf1.org/v1/stints";

export const fetchDriverStints = async (sessionKey = "latest", driverNumber) => {
  if (!sessionKey || !driverNumber) return [];

  const params = new URLSearchParams({
    session_key: sessionKey,
    driver_number: driverNumber,
  });

  const res = await fetch(`${API_URL}?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch stints");

  const data = await res.json();
  return Array.isArray(data) ? data : [];
};

export const useDriverStints = (sessionKey, driverNumber) => {
  return useQuery({
    queryKey: ["driver-stints", sessionKey, driverNumber],
    queryFn: () => fetchDriverStints(sessionKey, driverNumber),
    enabled: Boolean(sessionKey && driverNumber),
    staleTime: 1000 * 60 * 5, // cache 5 min
  });
};
