import { fetchF1OfficialNews } from "./providers/f1OfficialProvider";
import { fetchRedditNews } from "./providers/redditProvider";
import { fetchHackerNewsFallback } from "./providers/hnFallbackProvider";

const F1_SOURCE_KEYS = new Set(["f1", "f1-rss", "f1-official", "formula1"]);

export const fetchNewsFeed = async ({ timeframe = "week", limit = 15, source }) => {
  const preferredSource = source || import.meta.env.VITE_NEWS_SOURCE || "reddit";
  const subreddit = import.meta.env.VITE_NEWS_SUBREDDIT || "formula1";

  if (preferredSource === "hn") {
    return fetchHackerNewsFallback({ limit });
  }

  if (preferredSource === "reddit") {
    try {
      return await fetchRedditNews({ timeframe, limit, subreddit });
    } catch (error) {
      const fallbackData = await fetchHackerNewsFallback({ limit });
      return {
        ...fallbackData,
        warning: error?.message || "Reddit source unavailable, fallback engaged",
      };
    }
  }

  if (F1_SOURCE_KEYS.has(preferredSource)) {
    try {
      return await fetchF1OfficialNews({ timeframe, limit });
    } catch (f1Error) {
      try {
        const redditData = await fetchRedditNews({ timeframe, limit, subreddit });
        return {
          ...redditData,
          usedFallback: true,
          warning: f1Error?.message || "Official F1 RSS unavailable, using Reddit fallback",
        };
      } catch (redditError) {
        const hnData = await fetchHackerNewsFallback({ limit });
        return {
          ...hnData,
          warning:
            redditError?.message ||
            f1Error?.message ||
            "Official RSS and Reddit unavailable, using HN fallback",
        };
      }
    }
  }

  try {
    return await fetchRedditNews({ timeframe, limit, subreddit });
  } catch (error) {
    const fallbackData = await fetchHackerNewsFallback({ limit });
    return {
      ...fallbackData,
      warning: error?.message || "Primary source unavailable, fallback engaged",
    };
  }
};
