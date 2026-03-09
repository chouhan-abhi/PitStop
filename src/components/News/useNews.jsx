import { useQuery } from "@tanstack/react-query";

import { APP_LIVE_CACHE_CONFIG } from "../../common/AppConfig";
import { queryKeys, toStaleCacheKey } from "../../common/api/queryKeys";
import { withQueryDataMeta, withStaleFallback } from "../../common/api/staleCache";
import { fetchNewsFeed } from "../../services/news/fetchNewsFeed";

const fetchNews = async ({ queryKey }) => {
  const [, timeframe, limit, source] = queryKey;

  return withStaleFallback({
    cacheKey: toStaleCacheKey(queryKey),
    source: source || "crawler-reddit",
    fetcher: () => fetchNewsFeed({ timeframe, limit, source }),
  });
};

export function useNews(options = {}) {
  const {
    timeframe = "week",
    limit = 15,
    source = "crawler-reddit",
    enabled = true,
    ...queryOptions
  } = options;

  const queryResult = useQuery({
    queryKey: queryKeys.news(timeframe, limit, source),
    queryFn: fetchNews,
    enabled,
    ...APP_LIVE_CACHE_CONFIG,
    staleTime: 1000 * 60,
    refetchOnMount: "always",
    refetchOnReconnect: "always",
    refetchOnWindowFocus: true,
    ...queryOptions,
  });

  return withQueryDataMeta(queryResult, {
    source: null,
    usedFallback: false,
    total: 0,
    items: [],
  });
}
