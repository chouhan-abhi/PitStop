// src/views/driver/hooks.js
import { useQuery } from "@tanstack/react-query";

// ✅ Helper to safely fetch and slice locally (instead of using ?limit=)
const safeFetch = async (url, maxItems = 1000) => {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `Fetch failed: ${res.status}`);
    }

    const data = await res.json();
    // Slice only if array and too large
    return Array.isArray(data) ? data.slice(0, maxItems) : data;
  } catch (err) {
    console.warn("Fetch error:", err.message);
    return [];
  }
};

// 1️⃣ Event Summary — small data set, keep as-is
export const useEventSummary = (sessionKey) =>
  useQuery({
    queryKey: ["eventSummary", sessionKey],
    queryFn: async () => {
      const data = await safeFetch(
        `https://api.openf1.org/v1/meetings?session_key=${sessionKey}`,
        1
      );
      return data[0] || {};
    },
    staleTime: 1000 * 60 * 10,
    retry: 2,
    enabled: !!sessionKey,
  });

// 2️⃣ Telemetry Overview — heavy dataset, we slice locally
export const useTelemetry = (sessionKey, driverNumber) =>
  useQuery({
    queryKey: ["telemetry", sessionKey, driverNumber],
    queryFn: async () =>
      safeFetch(
        `https://api.openf1.org/v1/car_data?session_key=${sessionKey}&driver_number=${driverNumber}`,
        2000
      ),
    staleTime: 1000 * 60 * 5,
    retry: 2,
    gcTime: 1000 * 60 * 30,
    enabled: !!sessionKey && !!driverNumber,
  });

// 3️⃣ Position Trend — small dataset, keep full
export const usePositionTrend = (sessionKey, driverNumber) =>
  useQuery({
    queryKey: ["positions", sessionKey, driverNumber],
    queryFn: async () =>
      safeFetch(
        `https://api.openf1.org/v1/position?session_key=${sessionKey}&driver_number=${driverNumber}`,
        1000
      ),
    staleTime: 1000 * 60 * 5,
    retry: 2,
    enabled: !!sessionKey && !!driverNumber,
  });

// 4️⃣ Pit Stop Summary — small dataset, full data fine
export const usePitStops = (sessionKey, driverNumber) =>
  useQuery({
    queryKey: ["pitStops", sessionKey, driverNumber],
    queryFn: async () =>
      safeFetch(
        `https://api.openf1.org/v1/pit?session_key=${sessionKey}&driver_number=${driverNumber}`,
        300
      ),
    staleTime: 1000 * 60 * 10,
    retry: 2,
    enabled: !!sessionKey && !!driverNumber,
  });

// 5️⃣ Race Control Messages — moderate dataset, slice safely
export const useRaceControl = (sessionKey, driverNumber) =>
  useQuery({
    queryKey: ["raceControl", sessionKey, driverNumber],
    queryFn: async () =>
      safeFetch(
        `https://api.openf1.org/v1/race_control?session_key=${sessionKey}&driver_number=${driverNumber}`,
        500
      ),
    staleTime: 1000 * 60 * 10,
    retry: 2,
    enabled: !!sessionKey && !!driverNumber,
  });
