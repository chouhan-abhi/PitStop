import { useQuery } from "@tanstack/react-query";

import { APP_CACHE_CONFIG } from "../../common/AppConfig";

const fetchConstructorStandings = async (year) => {
  const response = await fetch(
    `https://api.jolpi.ca/ergast/f1/${year}/constructorstandings/?format=json`
  );
  if (!response.ok) {
    throw new Error("Failed to load constructor standings");
  }
  const data = await response.json();
  return (
    data?.MRData?.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings ||
    []
  );
};

export const useConstructorStandings = (year) =>
  useQuery({
    queryKey: ["constructor-standings", year],
    queryFn: () => fetchConstructorStandings(year),
    enabled: Boolean(year),
    ...APP_CACHE_CONFIG,
  });
