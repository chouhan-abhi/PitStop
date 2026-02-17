import { normalizeHackerNewsHit } from "../normalizeNewsItem";
import { requestJson } from "../../../common/api/httpClient";

export const fetchHackerNewsFallback = async ({ limit = 15 }) => {
  const query = encodeURIComponent('"formula 1" OR f1 grand prix');
  const url = `https://hn.algolia.com/api/v1/search?query=${query}&tags=story&hitsPerPage=${limit}`;

  const json = await requestJson(url, { source: "hn-fallback" });
  const items = (json?.hits || [])
    .map((hit) => normalizeHackerNewsHit(hit))
    .filter((item) => Boolean(item.id && item.title && item.url));

  return {
    source: "hn-fallback",
    usedFallback: true,
    total: json?.nbHits || items.length,
    items,
  };
};
