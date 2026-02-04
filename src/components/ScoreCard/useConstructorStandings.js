import { useQuery } from "@tanstack/react-query";

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
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60 * 2,
  });
