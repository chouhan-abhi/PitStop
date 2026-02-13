import { normalizeRedditPost } from "../normalizeNewsItem";

const TIMEFRAME_MAP = {
  day: "day",
  week: "week",
  month: "month",
  year: "year",
  all: "all",
};

export const fetchRedditNews = async ({ timeframe = "week", limit = 15, subreddit = "formula1" }) => {
  const t = TIMEFRAME_MAP[timeframe] || "week";
  const query = encodeURIComponent('flair_name:"News" OR "Formula 1" OR F1');
  const url = `https://www.reddit.com/r/${subreddit}/search.json?q=${query}&restrict_sr=on&sort=new&t=${t}&limit=${limit}`;

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Reddit news request failed (${response.status})`);
  }

  const json = await response.json();
  const children = json?.data?.children || [];

  const items = children
    .map((entry) => normalizeRedditPost(entry?.data || {}))
    .filter((item) => Boolean(item.id && item.title && item.url));

  return {
    source: "reddit",
    usedFallback: false,
    total: json?.data?.dist || items.length,
    items,
  };
};
