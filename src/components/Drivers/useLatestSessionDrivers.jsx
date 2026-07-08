import { useDriverRegistry } from "../../common/drivers/useDriverRegistry";

/**
 * Season driver roster enriched with OpenF1 session data when available.
 * @deprecated Prefer useDriverRegistry directly.
 */
export function useLatestSessionDrivers(meetingKey, sessionKey = null, options = {}) {
  const { year, enrichErgast = true, enabled, ...queryOptions } = options;

  void meetingKey;
  void enrichErgast;

  return useDriverRegistry(meetingKey, sessionKey, {
    year,
    enabled,
    ...queryOptions,
  });
}
