import React, { useState } from 'react';
import { MessageSquare, ArrowUp, ExternalLink, Clock, RefreshCw, Loader2, ChevronDown, ChevronUp } from 'lucide-react';

import { useNews } from './useNews';

const DEFAULT_VISIBLE_COUNT = 6;

// Format large numbers (e.g., 38044 -> 38K)
const formatNumber = (num) => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
};

// Format relative time
const formatTimeAgo = (timestamp) => {
  const seconds = Math.floor(Date.now() / 1000 - timestamp);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return `${Math.floor(seconds / 604800)}w ago`;
};

// Get flair color based on flair text
const getFlairColor = (flairText) => {
  if (!flairText) return null;
  const text = flairText.toLowerCase();
  if (text.includes('featured')) return '#ff6b6b';
  if (text.includes('news')) return '#4dabf7';
  if (text.includes('video')) return '#ff922b';
  if (text.includes('photo')) return '#51cf66';
  if (text.includes('discussion')) return '#9b5de5';
  if (text.includes('rumour') || text.includes('rumor')) return '#fcc419';
  return '#868e96';
};

const NewsCard = ({ post }) => {
  const {
    title,
    thumbnail,
    thumbnail_height,
    score,
    num_comments,
    permalink,
    created_utc,
    link_flair_text,
    author,
    is_video,
    post_hint,
    preview,
  } = post.data;

  // Get the best image URL
  const getImageUrl = () => {
    if (preview?.images?.[0]?.source?.url) {
      return preview.images[0].source.url.replace(/&amp;/g, '&');
    }
    if (thumbnail && thumbnail !== 'self' && thumbnail !== 'default' && thumbnail !== 'nsfw') {
      return thumbnail;
    }
    return null;
  };

  const imageUrl = getImageUrl();
  const hasImage = imageUrl && thumbnail_height > 0;
  const flairColor = getFlairColor(link_flair_text);
  const cleanFlairText = link_flair_text?.replace(/:[a-z0-9-]+:/gi, '').trim();

  return (
    <a
      href={`https://www.reddit.com${permalink}`}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-xl border overflow-hidden transition-all duration-200 hover:shadow-lg hover:scale-[1.01] hover:ring-1 hover:ring-red-500/40"
      style={{
        borderColor: 'var(--border-color)',
        backgroundColor: 'var(--panel-color)',
      }}
    >
      <div className="flex flex-col sm:flex-row">
        {/* Thumbnail */}
        {hasImage && (
          <div className="sm:w-32 lg:w-40 shrink-0 overflow-hidden bg-black/20">
            <img
              src={imageUrl}
              alt=""
              className="w-full h-32 sm:h-full object-cover"
              loading="lazy"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 p-2 sm:p-3 flex flex-col justify-between min-w-0">
          {/* Flair */}
          {cleanFlairText && (
            <div className="mb-1">
              <span
                className="text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: flairColor ? `${flairColor}20` : 'var(--panel-color)',
                  color: flairColor || 'var(--text-color)',
                }}
              >
                {cleanFlairText}
              </span>
            </div>
          )}

          {/* Title */}
          <h3
            className="text-sm sm:text-base font-semibold leading-snug line-clamp-2 mb-2"
            style={{ color: 'var(--text-color)' }}
          >
            {title}
          </h3>

          {/* Meta info */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap text-[10px] sm:text-xs" style={{ color: 'var(--text-color)', opacity: 0.6 }}>
            {/* Score */}
            <div className="flex items-center gap-1">
              <ArrowUp className="w-3 h-3" />
              <span>{formatNumber(score)}</span>
            </div>

            {/* Comments */}
            <div className="flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />
              <span>{formatNumber(num_comments)}</span>
            </div>

            {/* Time */}
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{formatTimeAgo(created_utc)}</span>
            </div>

            {/* Author */}
            <span className="hidden sm:inline truncate max-w-[100px]">u/{author}</span>

            {/* External link indicator */}
            {post_hint === 'link' && (
              <ExternalLink className="w-3 h-3" />
            )}

            {/* Video indicator */}
            {is_video && (
              <span style={{ color: 'var(--primary-color)' }}>▶ Video</span>
            )}
          </div>
        </div>
      </div>
    </a>
  );
};

const FeaturedCard = ({ post }) => {
  const {
    title,
    permalink,
    preview,
    thumbnail,
    thumbnail_height,
    link_flair_text,
  } = post.data;

  const imageUrl =
    preview?.images?.[0]?.source?.url?.replace(/&amp;/g, "&") ||
    (thumbnail && thumbnail !== "self" && thumbnail !== "default" && thumbnail !== "nsfw"
      ? thumbnail
      : null);

  const flairColor = getFlairColor(link_flair_text);
  const cleanFlairText = link_flair_text?.replace(/:[a-z0-9-]+:/gi, "").trim();

  return (
    <a
      href={`https://www.reddit.com${permalink}`}
      target="_blank"
      rel="noopener noreferrer"
      className="relative overflow-hidden rounded-2xl border border-red-500/30 bg-black/40 h-[320px] sm:h-[280px] flex items-end group"
    >
      {imageUrl && (
        <div
          className="absolute inset-0 bg-center bg-cover"
          style={{ backgroundImage: `url(${imageUrl})` }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />

      <div className="relative z-10 p-4 sm:p-5">
        {cleanFlairText && (
          <span
            className="text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: flairColor ? `${flairColor}30` : "rgba(255,255,255,0.1)",
              color: flairColor || "#fff",
            }}
          >
            {cleanFlairText}
          </span>
        )}
        <div className="mt-2 text-[10px] uppercase tracking-[0.3em] text-red-300/80">
          Top Story
        </div>
        <h3 className="mt-2 text-lg sm:text-xl font-extrabold leading-tight text-white line-clamp-2">
          {title}
        </h3>
        <span className="mt-2 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-red-300">
          Read Story →
        </span>
      </div>
    </a>
  );
};

const NewsCarousel = ({ posts }) => {
  const [index, setIndex] = useState(0);
  const featured = posts.slice(0, 5);

  if (!featured.length) {
    return (
      <div className="rounded-2xl border border-[var(--border-color)] p-6 text-sm opacity-60">
        No top stories available.
      </div>
    );
  }

  const next = () => setIndex((prev) => (prev + 1) % featured.length);
  const prev = () => setIndex((prev) => (prev - 1 + featured.length) % featured.length);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-[var(--text-color)]">
            Top Stories
          </h3>
          <p className="text-[11px] opacity-60">Weekly highlights from the grid</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={prev}
            className="h-8 w-8 rounded-full border border-[var(--border-color)] text-xs opacity-70 hover:opacity-100"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={next}
            className="h-8 w-8 rounded-full border border-[var(--border-color)] text-xs opacity-70 hover:opacity-100"
          >
            ›
          </button>
        </div>
      </div>

      <div className="rounded-2xl p-1">
        <FeaturedCard post={featured[index]} />
      </div>
    </div>
  );
};

const News = ({ showHeader = true, layout = "standard" }) => {
  const [expanded, setExpanded] = useState(false);

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
    dataUpdatedAt
  } = useNews('week', 15);

  const posts = data?.posts || [];
  const displayedPosts = expanded ? posts : posts.slice(0, DEFAULT_VISIBLE_COUNT);
  const hasMorePosts = posts.length > DEFAULT_VISIBLE_COUNT;

  // Format last updated time
  const getLastUpdated = () => {
    if (!dataUpdatedAt) return null;
    return formatTimeAgo(Math.floor(dataUpdatedAt / 1000));
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-center p-8">
          <Loader2 className="w-6 h-6 animate-spin opacity-60" />
          <span className="ml-2 text-sm opacity-60">Loading F1 news...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (isError && posts.length === 0) {
    return (
      <div className="w-full">
        <div className="flex flex-col items-center justify-center p-6 gap-3">
          <div className="text-center">
            <p className="text-sm text-red-400 mb-1">Unable to load news</p>
            <p className="text-xs opacity-50">{error?.message || 'Reddit API may be unavailable'}</p>
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border hover:bg-white/5 transition-colors"
            style={{ borderColor: 'var(--border-color)' }}
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
            {isFetching ? 'Retrying...' : 'Try Again'}
          </button>
          <a
            href="https://www.reddit.com/r/formula1/top/?t=week"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs hover:underline"
            style={{ color: 'var(--primary-color)' }}
          >
            Open Reddit directly →
          </a>
        </div>
      </div>
    );
  }

  // Empty state
  if (posts.length === 0) {
    return (
      <div className="w-full">
        <div className="flex flex-col items-center justify-center p-8 gap-2">
          <p className="text-sm opacity-60">No news available</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg border hover:bg-white/5 transition-colors"
            style={{ borderColor: 'var(--border-color)' }}
          >
            <RefreshCw className="w-3 h-3" />
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {layout === "carousel" && <NewsCarousel posts={posts} />}

      {layout === "carousel" && (
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-[var(--text-color)]">
              My Feed
            </h4>
            <p className="text-[11px] opacity-60">More from the paddock</p>
          </div>
          <span className="text-[10px] uppercase tracking-[0.2em] text-red-400">
            Latest
          </span>
        </div>
      )}

      {showHeader && layout === "standard" && (
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text-color)' }}>
              Top Stories This Week
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: 'var(--primary-color)' }}>
              r/formula1
            </span>
          </div>

          <div className="flex items-center gap-2">
            {dataUpdatedAt && (
              <span className="text-[10px] opacity-50 hidden sm:inline">
                Updated {getLastUpdated()}
              </span>
            )}
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="p-1.5 rounded-lg hover:bg-white/5 transition-colors disabled:opacity-50"
              title="Refresh news"
            >
              <RefreshCw
                className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`}
                style={{ color: 'var(--text-color)', opacity: 0.6 }}
              />
            </button>
          </div>
        </div>
      )}

      <div className={`grid grid-cols-1 md:grid-cols-2 ${layout === "carousel" ? "lg:grid-cols-3" : ""} gap-2 sm:gap-3`}>
        {displayedPosts.map((post) => (
          <NewsCard key={post.data.id} post={post} />
        ))}
      </div>

      {hasMorePosts && (
        <div className="mt-3 text-center">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors hover:bg-white/5"
            style={{
              color: 'var(--text-color)',
              borderColor: 'var(--border-color)',
            }}
          >
            {expanded ? (
              <>
                Show Less
                <ChevronUp className="w-3.5 h-3.5" />
              </>
            ) : (
              <>
                Show More ({posts.length - DEFAULT_VISIBLE_COUNT} more)
                <ChevronDown className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      )}

      <div className="mt-2 text-center">
        <a
          href="https://www.reddit.com/r/formula1/top/?t=week"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[10px] hover:opacity-70 transition-opacity"
          style={{ color: 'var(--primary-color)' }}
        >
          View more on Reddit
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};

export default News;
