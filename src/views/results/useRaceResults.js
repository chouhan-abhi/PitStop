import { useQuery } from "@tanstack/react-query";

const API_URL = "https://api.openf1.org/v1/session_result";

const fetchRaceResults = async ({ sessionKey, positions }) => {
    // Build query string
    const params = [];
    params.push(`session_key=${sessionKey}`);
    params.push(`position<=${positions}`);
    const url = params.length ? `${API_URL}?${params.join("&")}` : API_URL;

    const res = await fetch(url, {
        method: "GET",
        cache: "no-store",
        mode: "cors",
    });

    if (!res.ok) {
        throw new Error(`Failed to fetch race results: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    return Array.isArray(data) ? data : [];
};

export const useRaceResults = (sessionKey = "latest", positions = 20) => {
    return useQuery({
        queryKey: ["raceResults", sessionKey, positions],
        queryFn: () => fetchRaceResults({ sessionKey, positions }),
        enabled: Boolean(sessionKey && positions),
        staleTime: 1000 * 60 * 5, // 5 mins
        retry: 1,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        refetchOnMount: false,
        networkMode: "always",
    });
};
