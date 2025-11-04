import { useQuery } from "@tanstack/react-query";
import LocalStorageManager from "../../common/utils/LocalStorageManager";

const API_URL = "https://api.openf1.org/v1/drivers";
const storage = new LocalStorageManager("f1pitstop");

/**
 * Fetch driver data from OpenF1 API safely using fetch.
 */
export const fetchDrivers = async (driverNumber, sessionKey) => {
  try {
    // ✅ Build clean query parameters
    const params = new URLSearchParams();
    if (sessionKey && sessionKey !== "latest")
      params.append("session_key", sessionKey);
    if (driverNumber && driverNumber !== "all")
      params.append("driver_number", driverNumber);

    const url = `${API_URL}?${params.toString()}`;

    const res = await fetch(url, {
      method: "GET",
      cache: "no-store",
    });

    if (!res.ok)
      throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);

    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("❌ fetchDrivers error:", err);
    return [];
  }
};

/**
 * React Query hook for fetching driver data and caching it to localStorage.
 */
export const useDrivers = (driverNumber = "all", sessionKey = "latest") => {
  return useQuery({
    queryKey: ["drivers", driverNumber, sessionKey],
    queryFn: async () => {
      const data = await fetchDrivers(driverNumber, sessionKey);

      // ✅ Always cache the data response
      if (Array.isArray(data) && data.length > 0) {
        storage.set("drivers", data); // global fallback cache
      }

      return data;
    },
    enabled: Boolean(sessionKey),
    staleTime: 1000 * 60 * 5, // 5 min
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    networkMode: "always",
  });
};
