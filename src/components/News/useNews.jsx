import { useQuery } from "@tanstack/react-query";

import { APP_LIVE_CACHE_CONFIG } from "../../common/AppConfig";
import { fetchNewsFeed } from "../../services/news/fetchNewsFeed";

export function useNews(options = {}) {
  const {
    timeframe = "week",
    limit = 15,
    source,
    enabled = true,
    ...queryOptions
  } = options;

  return useQuery({
    queryKey: ["news", timeframe, limit, source || "reddit"],
    queryFn: () => fetchNewsFeed({ timeframe, limit, source }),
    enabled,
    ...APP_LIVE_CACHE_CONFIG,
    ...queryOptions,
  });
}
