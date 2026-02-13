import { useQuery } from "@tanstack/react-query";

import { APP_CACHE_CONFIG } from "../../common/AppConfig";

const fetchDriverStandings = async (year) => {
  const response = await fetch(
    `https://api.jolpi.ca/ergast/f1/${year}/driverstandings/?format=json`
  );
  if (!response.ok) {
    throw new Error("Failed to load driver standings");
  }
  const data = await response.json();
  return (
    data?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings || []
  );
};

export const useDriverStandings = (year) =>
  useQuery({
    queryKey: ["driver-standings", year],
    queryFn: () => fetchDriverStandings(year),
    enabled: Boolean(year),
    ...APP_CACHE_CONFIG,
  });
