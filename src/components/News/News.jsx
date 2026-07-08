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
import Surface from "../ui/Surface";
import Button from "../ui/Button";
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
    <Surface
      tier="container-high"
      interactive
      as="a"
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block overflow-hidden p-0 no-underline text-inherit transition-transform hover:-translate-y-0.5"
    >
      <div className="flex min-h-[180px] flex-col sm:flex-row">
        {image && (
          <div className="sm:w-40 lg:w-48 shrink-0 overflow-hidden aspect-[16/10] sm:aspect-auto">
            <img
              src={image}
              alt=""
              className="h-full w-full object-cover transition-transform duration-[var(--motion-standard)] group-hover:scale-[1.03]"
              loading="lazy"
              decoding="async"
            />
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col p-4">
          <div className="flex items-center justify-between gap-2">
            {flair && <StatusPill tone={getFlairTone(flair)}>{flair}</StatusPill>}
            <span className="md3-label-md text-[var(--md-on-surface-variant)]">{source || "Source"}</span>
          </div>

          <h3 className="mt-3 line-clamp-2 md3-title-md">{title}</h3>

          {summary && (
            <p className="mt-2 line-clamp-2 md3-body-md text-[var(--md-on-surface-variant)]">{summary}</p>
          )}

          <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-3 md3-label-md text-[var(--md-on-surface-variant)]">
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
    </Surface>
  );
};

const FeaturedCard = ({ post }) => {
  const { title, url, image, flair, source } = post;

  return (
    <Surface
      tier="container-highest"
      interactive
      as="a"
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="relative flex h-[320px] items-end overflow-hidden p-0 no-underline text-inherit"
    >
      {image && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${image})` }}
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-[var(--md-surface-dim)] via-[color-mix(in_srgb,var(--md-surface-dim)_55%,transparent)] to-transparent" />

      <div className="relative z-10 w-full p-5">
        <div className="flex items-center justify-between gap-3">
          {flair && <StatusPill tone={getFlairTone(flair)}>{flair}</StatusPill>}
          <span className="md3-label-md text-[var(--md-on-surface-variant)]">{source || "Feed"}</span>
        </div>
        <div className="mt-3 md3-label-md text-[var(--md-primary)]">Featured</div>
        <h3 className="mt-2 line-clamp-2 md3-headline-md">{title}</h3>
      </div>
    </Surface>
  );
};

const NewsCarousel = ({ posts }) => {
  const [index, setIndex] = useState(0);
  const featured = posts.slice(0, 5);

  if (!featured.length) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="md3-title-md">Top Stories</h3>
        <div className="flex gap-2">
          <Button
            variant="text"
            size="sm"
            onClick={() => setIndex((i) => (i - 1 + featured.length) % featured.length)}
            aria-label="Previous story"
          >
            ‹
          </Button>
          <Button
            variant="text"
            size="sm"
            onClick={() => setIndex((i) => (i + 1) % featured.length)}
            aria-label="Next story"
          >
            ›
          </Button>
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
      <Surface tier="container" className="p-6 text-center">
        <p className="md3-body-md text-[var(--danger)]">Unable to load news</p>
        <p className="md3-label-md text-[var(--md-on-surface-variant)] mt-1">{error?.message}</p>
        <Button variant="tonal" className="mt-3" onClick={refetch}>
          Retry
        </Button>
      </Surface>
    );
  }

  return (
    <div className="space-y-4">
      <Surface tier="container-high" className="p-4 sm:p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2 md3-label-md text-[var(--md-primary)]">
              <Radio className="h-3.5 w-3.5" />
              Race Control Feed
            </div>
            <h2 className="mt-2 md3-headline-md">Formula 1 Newsroom</h2>
            <p className="mt-1 md3-body-md text-[var(--md-on-surface-variant)]">
              Breaking updates, paddock stories, and technical headlines.
            </p>
          </div>
          <div className="md3-label-md text-[var(--md-on-surface-variant)]">
            {posts.length} active stories
          </div>
        </div>
      </Surface>

      <DataStatusBanner meta={dataMeta} />
      {layout === "carousel" && <NewsCarousel posts={posts} />}

      {showHeader && (
        <SectionHeader
          compact
          title="Grid Headlines"
          subtitle={typeof data?.total === "number" ? `${data.total} results` : "Latest motorsport headlines"}
          actions={(
            <Button variant="text" size="sm" onClick={refetch} disabled={isFetching}>
              <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
            </Button>
          )}
        />
      )}

      {data?.usedFallback && (
        <Surface tier="container" className="flex items-center gap-2 p-3 md3-body-md text-[var(--md-on-surface-variant)]">
          <TriangleAlert className="h-3.5 w-3.5 shrink-0" />
          Primary feed unavailable. Showing fallback sources.
        </Surface>
      )}

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 md3-content-auto">
        {displayedPosts.map((post) => (
          <NewsCard key={post.id} post={post} />
        ))}
      </div>

      {posts.length > DEFAULT_VISIBLE_COUNT && (
        <div className="text-center">
          <Button variant="text" onClick={() => setExpanded((prev) => !prev)}>
            {expanded ? "Show Less" : "Show More"}
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </Button>
        </div>
      )}

      {dataUpdatedAt && (
        <div className="text-center md3-label-md text-[var(--md-on-surface-variant)]">
          Updated {formatTimeAgo(new Date(dataUpdatedAt).toISOString())}
        </div>
      )}
    </div>
  );
};

export default News;
