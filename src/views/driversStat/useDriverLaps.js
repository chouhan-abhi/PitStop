// src/queries/useDriverLaps.js
import { useQuery } from "@tanstack/react-query";

const API_URL = "https://api.openf1.org/v1/laps";

const fetchDriverLaps = async (sessionKey, driverNumber) => {
  if (!sessionKey || !driverNumber) return [];

  const params = new URLSearchParams({ session_key: sessionKey, driver_number: driverNumber });
  const res = await fetch(`${API_URL}?${params.toString()}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch driver lap data");

  return res.json();
};

export const useDriverLaps = (sessionKey, driverNumber) => {
  return useQuery({
    queryKey: ["driverLaps", sessionKey, driverNumber],
    queryFn: () => fetchDriverLaps(sessionKey, driverNumber),
    enabled: Boolean(sessionKey && driverNumber),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
};
