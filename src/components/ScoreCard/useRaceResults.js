import { useQuery } from "@tanstack/react-query";

const fetchRaceResults = async (year) => {
  const baseUrl = `https://api.jolpi.ca/ergast/f1/${year}/results/?format=json`;
  const pageLimit = 1000;
  const firstResponse = await fetch(`${baseUrl}&limit=${pageLimit}&offset=0`);
  if (!firstResponse.ok) {
    throw new Error("Failed to load race results");
  }
  const firstData = await firstResponse.json();
  const total = Number(firstData?.MRData?.total || 0);
  const limit = Number(firstData?.MRData?.limit || pageLimit);
  const races = firstData?.MRData?.RaceTable?.Races || [];

  if (total <= limit) {
    return races;
  }

  const extraRaces = [];
  for (let offset = limit; offset < total; offset += limit) {
    const response = await fetch(`${baseUrl}&limit=${limit}&offset=${offset}`);
    if (!response.ok) {
      throw new Error("Failed to load race results");
    }
    const data = await response.json();
    extraRaces.push(...(data?.MRData?.RaceTable?.Races || []));
  }

  const allRaces = [...races, ...extraRaces];
  const merged = new Map();

  allRaces.forEach((race) => {
    const key = `${race.season || year}-${race.round}`;
    if (!merged.has(key)) {
      merged.set(key, { ...race, Results: [...(race.Results || [])] });
      return;
    }
    const existing = merged.get(key);
    const existingResults = existing.Results || [];
    const incomingResults = race.Results || [];
    const combined = [...existingResults, ...incomingResults];
    const uniq = new Map();
    combined.forEach((result) => {
      const driverId = result?.Driver?.driverId || result?.number || result?.position;
      if (driverId) uniq.set(driverId, result);
    });
    existing.Results = Array.from(uniq.values());
    merged.set(key, existing);
  });

  return Array.from(merged.values());
};

export const useRaceResults = (year) =>
  useQuery({
    queryKey: ["race-results", year],
    queryFn: () => fetchRaceResults(year),
    enabled: Boolean(year),
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60 * 2,
  });
