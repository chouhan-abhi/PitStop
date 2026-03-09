import React, { useMemo, useState } from "react";
import {
  ExternalLink,
  Clock,
  RefreshCw,
  Loader2,
  ChevronDown,
  ChevronUp,
  TriangleAlert,
  Radio,
} from "lucide-react";

import { useNews } from "./useNews";
import SectionHeader from "../ui/SectionHeader";
import StatusPill from "../ui/StatusPill";
import DataStatusBanner from "../ui/DataStatusBanner";

const DEFAULT_VISIBLE_COUNT = 6;

const formatTimeAgo = (iso) => {
  if (!iso) return "-";
  const seconds = Math.floor((Date.now() - new Date(iso)) / 1000);

  if (!Number.isFinite(seconds)) return "-";
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return `${Math.floor(seconds / 604800)}w ago`;
};

const getFlairTone = (flair = "") => {
  const value = flair.toLowerCase();
  if (value.includes("news")) return "live";
  if (value.includes("official")) return "live";
  if (value.includes("video")) return "warn";
  if (value.includes("rumour") || value.includes("rumor")) return "warn";
  return "neutral";
};

const sanitizePosts = (items) => {
  if (!Array.isArray(items)) return [];
  return items.filter((post) => Boolean(post?.id && post?.title && post?.url));
};

const NewsCard = ({ post }) => {
  const {
    title,
    url,
    image,
    source,
    author,
    createdAt,
    updatedAt,
    score,
    comments,
    flair,
    summary,
  } = post;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative block overflow-hidden rounded-2xl border border-red-500/20 bg-[linear-gradient(145deg,rgba(10,10,12,0.96),rgba(24,24,28,0.85))] p-0 transition-all duration-300 hover:-translate-y-0.5 hover:border-red-400/40 hover:shadow-[0_16px_32px_rgba(255,30,30,0.18)]"
    >
      <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-red-600 via-red-400 to-transparent" />

      <div className="flex min-h-[180px] flex-col sm:flex-row">
        {image && (
          <div className="sm:w-40 lg:w-48 shrink-0 overflow-hidden">
            <img
              src={image}
              alt=""
              className="h-36 w-full object-cover transition-transform duration-300 group-hover:scale-105 sm:h-full"
              loading="lazy"
            />
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col p-4">
          <div className="flex items-center justify-between gap-2">
            {flair && <StatusPill tone={getFlairTone(flair)}>{flair}</StatusPill>}
            <span className="text-[10px] uppercase tracking-[0.2em] text-red-200/70">{source || "Source"}</span>
          </div>

          <h3 className="mt-3 line-clamp-2 text-sm font-bold sm:text-base">{title}</h3>

          {summary && (
            <p className="mt-2 line-clamp-2 text-xs text-[var(--text-secondary)]">{summary}</p>
          )}

          <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-3 text-[10px] text-[var(--text-secondary)]">
            {author && <span className="truncate">{author}</span>}
            {typeof score === "number" && <span>{score} pts</span>}
            {typeof comments === "number" && <span>{comments} comments</span>}
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatTimeAgo(updatedAt || createdAt)}
            </span>
            <ExternalLink className="h-3 w-3" />
          </div>
        </div>
      </div>
    </a>
  );
};

const FeaturedCard = ({ post }) => {
  const { title, url, image, flair, source } = post;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="relative flex h-[320px] items-end overflow-hidden rounded-2xl border border-red-500/35"
    >
      {image && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${image})` }}
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-black/10" />
      <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-red-500 via-red-300 to-transparent" />

      <div className="relative z-10 w-full p-5">
        <div className="flex items-center justify-between gap-3">
          {flair && <StatusPill tone={getFlairTone(flair)}>{flair}</StatusPill>}
          <span className="text-[10px] uppercase tracking-[0.3em] text-red-200/80">{source || "Feed"}</span>
        </div>
        <div className="mt-3 text-[10px] uppercase tracking-[0.35em] text-red-300">Pole Position</div>
        <h3 className="mt-2 line-clamp-2 text-xl font-extrabold text-white">{title}</h3>
      </div>
    </a>
  );
};

const NewsCarousel = ({ posts }) => {
  const [index, setIndex] = useState(0);
  const featured = posts.slice(0, 5);

  if (!featured.length) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="display-title text-sm uppercase tracking-[0.22em]">Top Stories</h3>
        <div className="flex gap-2">
          <button
            type="button"
            className="btn btn-ghost !px-2"
            onClick={() => setIndex((i) => (i - 1 + featured.length) % featured.length)}
            aria-label="Previous story"
          >
            ‹
          </button>
          <button
            type="button"
            className="btn btn-ghost !px-2"
            onClick={() => setIndex((i) => (i + 1) % featured.length)}
            aria-label="Next story"
          >
            ›
          </button>
        </div>
      </div>
      <FeaturedCard post={featured[index]} />
    </div>
  );
};

const News = ({ showHeader = true, layout = "standard" }) => {
  const [expanded, setExpanded] = useState(false);

  const {
    data,
    dataMeta,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
    dataUpdatedAt,
  } = useNews({ timeframe: "week", limit: 15 });

  const posts = useMemo(() => sanitizePosts(data?.items), [data]);
  const displayedPosts = expanded ? posts : posts.slice(0, DEFAULT_VISIBLE_COUNT);

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin opacity-60" />
      </div>
    );
  }

  if (isError && posts.length === 0) {
    return (
      <div className="rounded-2xl border border-red-500/30 bg-red-950/30 p-6 text-center">
        <p className="text-sm text-red-300">Unable to load news</p>
        <p className="text-xs opacity-60">{error?.message}</p>
        <button type="button" onClick={refetch} className="btn mt-3">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-2xl border border-red-500/25 bg-[radial-gradient(circle_at_85%_10%,rgba(255,40,40,0.28),rgba(12,12,14,0.95)_50%)] p-4">
        <div className="pointer-events-none absolute inset-0 opacity-25 [background-image:linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:26px_26px]" />
        <div className="relative flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.35em] text-red-200/85">
              <Radio className="h-3.5 w-3.5" />
              Race Control Feed
            </div>
            <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">Formula 1 Newsroom</h2>
            <p className="mt-1 text-xs text-[var(--text-secondary)]">Breaking updates, paddock stories, and technical headlines.</p>
          </div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-red-200/80">
            {posts.length} active stories
          </div>
        </div>
      </div>

      <DataStatusBanner meta={dataMeta} />
      {layout === "carousel" && <NewsCarousel posts={posts} />}

      {showHeader && (
        <SectionHeader
          compact
          title="Grid Headlines"
          subtitle={typeof data?.total === "number" ? `${data.total} results` : "Latest motorsport headlines"}
          actions={(
            <button type="button" className="btn btn-ghost !px-2" onClick={refetch} disabled={isFetching}>
              <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
            </button>
          )}
        />
      )}

      {data?.usedFallback && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 p-2 text-xs text-amber-100">
          <TriangleAlert className="h-3.5 w-3.5" />
          Primary feed unavailable. Showing fallback sources.
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {displayedPosts.map((post) => (
          <NewsCard key={post.id} post={post} />
        ))}
      </div>

      {posts.length > DEFAULT_VISIBLE_COUNT && (
        <div className="text-center">
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            className="btn btn-ghost"
          >
            {expanded ? "Show Less" : "Show More"}
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      )}

      {dataUpdatedAt && (
        <div className="text-center text-[10px] text-[var(--text-muted)]">
          Updated {formatTimeAgo(new Date(dataUpdatedAt).toISOString())}
        </div>
      )}
    </div>
  );
};

export default News;
