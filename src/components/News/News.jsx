import React, { useMemo, useState } from "react";
import {
  ExternalLink,
  Clock,
  RefreshCw,
  Loader2,
  ChevronDown,
  ChevronUp,
  TriangleAlert,
} from "lucide-react";

import { useNews } from "./useNews";
import SectionHeader from "../ui/SectionHeader";
import StatusPill from "../ui/StatusPill";
import DataStatusBanner from "../ui/DataStatusBanner";

const DEFAULT_VISIBLE_COUNT = 6;

const formatTimeAgo = (iso) => {
  if (!iso) return "-";
  const seconds = Math.floor((Date.now() - new Date(iso)) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return `${Math.floor(seconds / 604800)}w ago`;
};

const getFlairTone = (flair = "") => {
  const value = flair.toLowerCase();
  if (value.includes("news")) return "live";
  if (value.includes("video")) return "warn";
  if (value.includes("rumour") || value.includes("rumor")) return "warn";
  return "neutral";
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
  } = post;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="panel f1-card group block overflow-hidden hover:border-red-500/40 transition-colors"
    >
      <div className="flex flex-col sm:flex-row">
        {image && (
          <div className="sm:w-36 lg:w-44 shrink-0 overflow-hidden">
            <img
              src={image}
              alt=""
              className="w-full h-32 sm:h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          </div>
        )}

        <div className="flex-1 p-3 min-w-0">
          {flair && <StatusPill tone={getFlairTone(flair)}>{flair}</StatusPill>}

          <h3 className="text-sm sm:text-base font-semibold line-clamp-2 mt-2">
            {title}
          </h3>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-[var(--text-secondary)] mt-2">
            <span>{source}</span>
            {author && <span className="truncate">{author}</span>}
            {typeof score === "number" && <span>{score} pts</span>}
            {typeof comments === "number" && <span>{comments} comments</span>}
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatTimeAgo(updatedAt || createdAt)}
            </span>
            <ExternalLink className="w-3 h-3" />
          </div>
        </div>
      </div>
    </a>
  );
};

const FeaturedCard = ({ post }) => {
  const { title, url, image, flair } = post;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="f1-card relative overflow-hidden rounded-lg border border-red-500/30 h-[320px] flex items-end"
    >
      {image && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${image})` }}
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/15" />

      <div className="relative z-10 p-4 w-full">
        {flair && <StatusPill tone={getFlairTone(flair)}>{flair}</StatusPill>}
        <div className="mt-2 text-[10px] uppercase tracking-[0.3em] text-red-300">
          Top Story
        </div>
        <h3 className="mt-2 text-lg font-extrabold text-white line-clamp-2">{title}</h3>
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
      <div className="flex justify-between items-center">
        <h3 className="display-title text-sm tracking-[0.2em] uppercase">Top Stories</h3>
        <div className="flex gap-2">
          <button
            type="button"
            className="btn btn-ghost !px-2"
            onClick={() => setIndex((i) => (i - 1 + featured.length) % featured.length)}
          >
            ‹
          </button>
          <button
            type="button"
            className="btn btn-ghost !px-2"
            onClick={() => setIndex((i) => (i + 1) % featured.length)}
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

  const posts = useMemo(() => data?.items || [], [data]);
  const displayedPosts = expanded ? posts : posts.slice(0, DEFAULT_VISIBLE_COUNT);

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin opacity-60" />
      </div>
    );
  }

  if (isError && posts.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-sm text-red-400">Unable to load news</p>
        <p className="text-xs opacity-60">{error?.message}</p>
        <button type="button" onClick={refetch} className="btn mt-3">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <DataStatusBanner meta={dataMeta} />
      {layout === "carousel" && <NewsCarousel posts={posts} />}

      {showHeader && (
        <SectionHeader
          compact
          title="Formula 1 News"
          subtitle={typeof data?.total === "number" ? `${data.total} results` : "Latest motorsport headlines"}
          actions={(
            <button type="button" className="btn btn-ghost !px-2" onClick={refetch} disabled={isFetching}>
              <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
            </button>
          )}
        />
      )}

      {data?.usedFallback && (
        <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-2 text-xs text-amber-100 flex items-center gap-2">
          <TriangleAlert className="w-3.5 h-3.5" />
          Primary feed unavailable. Showing fallback source.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
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
