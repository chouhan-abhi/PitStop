import { requestJson, requestText } from "../../../common/api/httpClient";

const DEFAULT_F1_FEED_URL = "https://www.formula1.com/en/latest/all.xml";

const TIMEFRAME_TO_MS = {
  day: 1000 * 60 * 60 * 24,
  week: 1000 * 60 * 60 * 24 * 7,
  month: 1000 * 60 * 60 * 24 * 30,
  year: 1000 * 60 * 60 * 24 * 365,
};

const parseIso = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

const stripHtml = (value = "") => value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

const extractImageFromDescription = (description = "") => {
  const match = description.match(/<img[^>]+src=["']([^"']+)["']/i);
  return match?.[1] || null;
};

const getTextContent = (node, tagNames = []) => {
  for (const tag of tagNames) {
    const value = node.getElementsByTagName(tag)?.[0]?.textContent?.trim();
    if (value) return value;
  }
  return null;
};

const getImageFromItem = (item, description) => {
  const mediaContent = item.getElementsByTagName("media:content")?.[0]?.getAttribute("url");
  if (mediaContent) return mediaContent;

  const mediaThumbnail = item.getElementsByTagName("media:thumbnail")?.[0]?.getAttribute("url");
  if (mediaThumbnail) return mediaThumbnail;

  const enclosure = item.getElementsByTagName("enclosure")?.[0]?.getAttribute("url");
  if (enclosure) return enclosure;

  return extractImageFromDescription(description);
};

const parseXmlItems = (xmlText) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, "application/xml");

  const parserError = doc.getElementsByTagName("parsererror")[0];
  if (parserError) {
    throw new Error("Failed to parse F1 RSS feed");
  }

  const items = Array.from(doc.getElementsByTagName("item"));

  return items
    .map((item) => {
      const description = getTextContent(item, ["description"]) || "";
      const link = getTextContent(item, ["link", "guid"]);
      const createdAt = parseIso(getTextContent(item, ["pubDate", "dc:date"]));

      return {
        id: getTextContent(item, ["guid"]) || link,
        title: getTextContent(item, ["title"]) || "Untitled",
        url: link || "#",
        image: getImageFromItem(item, description),
        source: "Formula1.com",
        author: getTextContent(item, ["dc:creator", "author"]),
        createdAt,
        updatedAt: createdAt,
        score: null,
        comments: null,
        flair: getTextContent(item, ["category"]) || "Official",
        summary: stripHtml(description),
      };
    })
    .filter((item) => Boolean(item.id && item.title && item.url));
};

const filterByTimeframe = (items, timeframe) => {
  if (!timeframe || timeframe === "all") return items;
  const windowMs = TIMEFRAME_TO_MS[timeframe];
  if (!windowMs) return items;

  const threshold = Date.now() - windowMs;
  return items.filter((item) => {
    if (!item.createdAt) return true;
    const created = new Date(item.createdAt).getTime();
    return Number.isFinite(created) ? created >= threshold : true;
  });
};

const fetchFeedXmlWithFallbacks = async (feedUrl) => {
  const encodedFeedUrl = encodeURIComponent(feedUrl);

  const attempts = [
    () => requestText(feedUrl, { source: "f1-rss" }),
    () =>
      requestText(
        `https://api.allorigins.win/raw?url=${encodedFeedUrl}`,
        { source: "f1-rss-fallback" }
      ),
    async () => {
      const payload = await requestJson(
        `https://api.allorigins.win/get?url=${encodedFeedUrl}`,
        { source: "f1-rss-fallback" }
      );
      if (!payload?.contents) {
        throw new Error("AllOrigins returned empty payload");
      }
      return payload.contents;
    },
  ];

  let lastError;
  for (const runAttempt of attempts) {
    try {
      return await runAttempt();
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error("Failed to fetch F1 RSS feed");
};

export const fetchF1OfficialNews = async ({ timeframe = "week", limit = 15 }) => {
  const feedUrl = import.meta.env.VITE_F1_NEWS_FEED_URL || DEFAULT_F1_FEED_URL;

  const xmlText = await fetchFeedXmlWithFallbacks(feedUrl);
  const parsedItems = parseXmlItems(xmlText);
  const filtered = filterByTimeframe(parsedItems, timeframe);
  const items = filtered.slice(0, limit);

  if (!items.length) {
    throw new Error("Official F1 RSS returned no usable items");
  }

  return {
    source: "f1-rss",
    usedFallback: false,
    total: filtered.length,
    items,
  };
};
