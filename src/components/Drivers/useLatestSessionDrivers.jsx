import { useQuery } from '@tanstack/react-query';

import { APP_CACHE_CONFIG } from '../../common/AppConfig';

const normalizeToken = (value = '') =>
  value
    .toLowerCase()
    .replace(/[^a-z]/g, '');

const buildErgastIndex = (drivers = []) => {
  const index = new Map();

  drivers.forEach((driver) => {
    const family = normalizeToken(driver.familyName);
    const given = normalizeToken(driver.givenName);
    const code = normalizeToken(driver.code || '');
    const driverId = normalizeToken(driver.driverId || '');

    if (code) index.set(`code:${code}`, driver);
    if (driverId) index.set(`id:${driverId}`, driver);
    if (family && given) index.set(`name:${family}:${given[0]}`, driver);
    if (family) index.set(`family:${family}`, driver);
  });

  return index;
};

const fetchErgastDrivers = async (year) => {
  if (!year) return [];
  const url = `https://api.jolpi.ca/ergast/f1/${year}/drivers/?format=json`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to load Ergast drivers');
  }
  const data = await response.json();
  return data?.MRData?.DriverTable?.Drivers || [];
};

const mergeErgastDrivers = (openF1Drivers, ergastDrivers) => {
  if (!ergastDrivers?.length) return openF1Drivers;
  const index = buildErgastIndex(ergastDrivers);
  const ergastIds = new Set(
    ergastDrivers.map((driver) => normalizeToken(driver.driverId || ''))
  );

  return openF1Drivers
    .map((driver) => {
    const acronym = normalizeToken(driver.name_acronym || '');
    const family = normalizeToken(driver.last_name || '');
    const given = normalizeToken(driver.first_name || '');

    const match =
      (acronym && index.get(`code:${acronym}`)) ||
      (acronym && index.get(`id:${acronym}`)) ||
      (family && given && index.get(`name:${family}:${given[0]}`)) ||
      (family && index.get(`family:${family}`)) ||
      null;

    if (!match) return driver;

    return {
      ...driver,
      ergast: {
        driverId: match.driverId,
        code: match.code,
        givenName: match.givenName,
        familyName: match.familyName,
        dateOfBirth: match.dateOfBirth,
        nationality: match.nationality,
        url: match.url,
        permanentNumber: match.permanentNumber,
      },
    };
  })
    .filter((driver) => {
      if (!ergastIds.size) return true;
      const driverId = normalizeToken(driver?.ergast?.driverId || '');
      return Boolean(driverId && ergastIds.has(driverId));
    });
};

const fetchLatestSessionDrivers = async ({ queryKey }) => {
  const [_, meetingKey, sessionKey, year, enrichErgast] = queryKey;
  let url = `https://api.openf1.org/v1/drivers`;
  const params = new URLSearchParams();

  if (meetingKey) {
    params.append('meeting_key', meetingKey);
  }
  if (sessionKey) {
    params.append('session_key', sessionKey);
  }

  if (params.toString()) {
    url += `?${params.toString()}`;
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  const openF1Drivers = await response.json();

  if (!enrichErgast || !year) {
    return openF1Drivers;
  }

  const ergastDrivers = await fetchErgastDrivers(year);
  return mergeErgastDrivers(openF1Drivers, ergastDrivers);
};

export function useLatestSessionDrivers(meetingKey, sessionKey = null, options = {}) {
  const {
    year,
    enrichErgast = true,
    enabled,
    ...queryOptions
  } = options;

  const resolvedYear = year || '2026';

  return useQuery({
    queryKey: ['latestSessionDrivers', meetingKey, sessionKey, resolvedYear, enrichErgast],
    queryFn: fetchLatestSessionDrivers,
    enabled: enabled !== undefined ? enabled : Boolean(meetingKey),
    ...APP_CACHE_CONFIG,
    ...queryOptions,
  });
}
