const toIsoFromUtcSeconds = (value) => {
  if (!value && value !== 0) return null;
  const millis = Number(value) * 1000;
  return Number.isFinite(millis) ? new Date(millis).toISOString() : null;
};

const sanitizeImage = (value) => {
  if (!value || typeof value !== "string") return null;
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  return null;
};

export const normalizeRedditPost = (post) => ({
  id: post?.id || post?.name,
  title: post?.title || "Untitled",
  url:
    post?.url ||
    (post?.permalink ? `https://www.reddit.com${post.permalink}` : "#"),
  image: sanitizeImage(post?.preview?.images?.[0]?.source?.url?.replaceAll("&amp;", "&")) || sanitizeImage(post?.thumbnail),
  source: post?.domain || "Reddit",
  author: post?.author || null,
  createdAt: toIsoFromUtcSeconds(post?.created_utc),
  updatedAt: toIsoFromUtcSeconds(
    typeof post?.edited === "number" ? post.edited : post?.created_utc
  ),
  score: typeof post?.score === "number" ? post.score : null,
  comments: typeof post?.num_comments === "number" ? post.num_comments : null,
  flair: post?.link_flair_text || "News",
});

export const normalizeHackerNewsHit = (hit) => ({
  id: hit?.objectID,
  title: hit?.title || hit?.story_title || "Untitled",
  url:
    hit?.url ||
    hit?.story_url ||
    (hit?.objectID ? `https://news.ycombinator.com/item?id=${hit.objectID}` : "#"),
  image: null,
  source: "Hacker News",
  author: hit?.author || null,
  createdAt: hit?.created_at || null,
  updatedAt: hit?.updated_at || hit?.created_at || null,
  score: typeof hit?.points === "number" ? hit.points : null,
  comments: typeof hit?.num_comments === "number" ? hit.num_comments : null,
  flair: "Community",
});
