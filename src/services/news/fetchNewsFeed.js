const API_BASE = "http://dracket.art/api/reddit";

export const fetchNewsFeed = async ({
  timeframe = "week",
  limit = 15,
  source,
}) => {
  const preferredSource = source || "reddit";
  const topic = import.meta.env.VITE_NEWS_SUBREDDIT || "formula1";

  try {
    const response = await fetch(
      `${API_BASE}?topic=${encodeURIComponent(topic)}&limit=${limit}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-Admin-Key": import.meta.env.VITE_ADMIN_KEY || "AbhiVani",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`API failed with status ${response.status}`);
    }

    const data = await response.json();

    return {
      source: preferredSource,
      timeframe,
      items: data?.items || data || [],
      fetchedAt: Date.now(),
    };
  } catch (error) {
    console.error("Primary API failed:", error);

    // Optional fallback to HN if your API fails
    try {
      const fallbackResponse = await fetch(
        `https://hnrss.org/frontpage`
      );

      const text = await fallbackResponse.text();

      return {
        source: "hn-fallback",
        warning: error?.message || "Primary API unavailable",
        items: text,
        fetchedAt: Date.now(),
      };
    } catch (fallbackError) {
      return {
        source: "error",
        warning:
          fallbackError?.message ||
          error?.message ||
          "All sources unavailable",
        items: [],
        fetchedAt: Date.now(),
      };
    }
  }
};
