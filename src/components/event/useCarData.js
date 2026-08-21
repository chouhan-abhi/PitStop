import { useQuery } from "@tanstack/react-query";
import { requestJson } from "../../common/api/httpClient";

const OPENF1_BASE_URL = "https://api.openf1.org/v1";

/**
 * Fetch raw car telemetry from OpenF1 /car_data endpoint.
 * Optionally filter to a lap window using ISO date strings.
 * Note: this endpoint is NOT proxied through the worker — it hits OpenF1 directly.
 */
const fetchCarData = async (sessionKey, driverNumber, dateFrom, dateTo) => {
  let url =
    `${OPENF1_BASE_URL}/car_data` +
    `?session_key=${encodeURIComponent(sessionKey)}` +
    `&driver_number=${encodeURIComponent(driverNumber)}`;

  // OpenF1 supports comparison operators as query params
  if (dateFrom) url += `&date>=${encodeURIComponent(dateFrom)}`;
  if (dateTo)   url += `&date<=${encodeURIComponent(dateTo)}`;

  const data = await requestJson(url, {
    source: "openf1",
    timeoutMs: 30_000, // large payload can take a while
    maxRetries: 2,
  });

  return Array.isArray(data) ? data : [];
};

/**
 * useCarData — React Query hook for OpenF1 /car_data.
 *
 * @param {string|number} sessionKey  — OpenF1 session key
 * @param {string|number} driverNumber — driver racing number
 * @param {object}        options
 *   @param {string|null} options.dateFrom — ISO timestamp (lap start, optional)
 *   @param {string|null} options.dateTo   — ISO timestamp (lap end, optional)
 *   @param {boolean}     options.enabled  — override enabled state
 */
export const useCarData = (sessionKey, driverNumber, options = {}) => {
  const { dateFrom = null, dateTo = null, ...queryOptions } = options;

  return useQuery({
    queryKey: [
      "carData",
      String(sessionKey ?? ""),
      String(driverNumber ?? ""),
      dateFrom ?? "",
      dateTo   ?? "",
    ],
    queryFn: () => fetchCarData(sessionKey, driverNumber, dateFrom, dateTo),
    enabled:
      Boolean(sessionKey) &&
      Boolean(driverNumber) &&
      (queryOptions.enabled !== undefined ? queryOptions.enabled : true),

    // Historical car data never changes once a session ends → cache aggressively
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60, // 1 hour in memory

    retry: 2,
    retryDelay: (attemptIndex, error) => {
      // Honour Retry-After header from OpenF1 (429 responses)
      const retryAfterMs = Number(error?.retryAfterMs);
      if (Number.isFinite(retryAfterMs) && retryAfterMs > 0) return retryAfterMs;
      // Exponential back-off: 800ms, 1600ms
      return 800 * Math.pow(2, attemptIndex) + Math.round(Math.random() * 200);
    },

    ...queryOptions,
  });
};
