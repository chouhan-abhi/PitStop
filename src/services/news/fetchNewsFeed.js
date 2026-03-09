import { requestJson } from "../../common/api/httpClient";
import { fetchF1OfficialNews } from "./providers/f1OfficialProvider";
import { fetchRedditNews } from "./providers/redditProvider";
import { fetchHackerNewsFallback } from "./providers/hnFallbackProvider";

const API_BASE = "https://crawler.dracket.art/api/reddit";

const normalizeItems = (items) => {
  if (!Array.isArray(items)) return [];
  return items
    .map((item, index) => {
      const url = item?.url || null;
      const createdAt = item?.publishedAt || item?.createdAt || null;
      const id = item?.id || url || `${item?.title || "news"}-${createdAt || index}`;

      return {
        id,
        title: item?.title || "Untitled",
        url: url || "#",
        image: item?.image || item?.thumbnailUrl || null,
        source: item?.source || "Reddit",
        author: item?.author || null,
        createdAt,
        updatedAt: item?.updatedAt || createdAt,
        score: typeof item?.score === "number" ? item.score : null,
        comments: typeof item?.comments === "number" ? item.comments : null,
        flair: item?.flair || "News",
        summary: item?.summary || null,
      };
    })
    .filter((item) => Boolean(item?.id && item?.title && item?.url && item.url !== "#"));
};

const normalizePrimaryPayload = (payload) => {
  const items = normalizeItems(payload?.items || payload);
  return {
    source: payload?.source || "crawler-reddit",
    usedFallback: false,
    total: Number(payload?.total || items.length),
    items,
  };
};

const toFriendlyMessage = (error, context) => {
  const status = Number(error?.status);
  if (status === 429) {
    return `${context} is rate-limited (429).`;
  }
  return error?.message || `${context} unavailable`;
};

const fetchPrimaryApi = async ({ topic, limit }) => {
  const payload = await requestJson(
    `${API_BASE}?topic=${encodeURIComponent(topic)}`,
    {
      source: "reddit-api",
    }
  );

  const normalized = normalizePrimaryPayload(payload);
  normalized.items = normalized.items.slice(0, Math.max(1, Number(limit) || 15));
  normalized.total = Number(payload?.total || payload?.count || normalized.items.length);
  if (!normalized.items.length) {
    throw new Error("Primary API returned no usable news items");
  }

  return normalized;
};

export const fetchNewsFeed = async ({ timeframe = "week", limit = 15, source }) => {
  const preferredSource = source || "crawler-reddit";
  const topic = import.meta.env.VITE_NEWS_SUBREDDIT || "formula1";

  try {
    const primary = await fetchPrimaryApi({ topic, limit });
    return {
      ...primary,
      source: primary.source || preferredSource,
      timeframe,
      fetchedAt: Date.now(),
    };
  } catch (primaryError) {
    const warnings = [toFriendlyMessage(primaryError, "Primary API")];

    try {
      const official = await fetchF1OfficialNews({ timeframe, limit });
      return {
        ...official,
        usedFallback: true,
        warning: warnings[0],
        fetchedAt: Date.now(),
      };
    } catch (officialError) {
      warnings.push(toFriendlyMessage(officialError, "Official F1 RSS"));
    }

    try {
      const reddit = await fetchRedditNews({ timeframe, limit, subreddit: topic });
      return {
        ...reddit,
        usedFallback: true,
        warning: warnings[0],
        fetchedAt: Date.now(),
      };
    } catch (redditError) {
      warnings.push(toFriendlyMessage(redditError, "Reddit fallback"));
    }

    try {
      const hn = await fetchHackerNewsFallback({ limit });
      return {
        ...hn,
        usedFallback: true,
        warning: warnings[0],
        fetchedAt: Date.now(),
      };
    } catch (hnError) {
      warnings.push(toFriendlyMessage(hnError, "Hacker News fallback"));

      const aggregateError = new Error(`All news sources failed. ${warnings.join(" ")}`);
      aggregateError.status = Number(primaryError?.status || 0) || null;
      throw aggregateError;
    }
  }
};
