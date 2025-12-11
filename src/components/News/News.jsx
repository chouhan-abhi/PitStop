import React, { useState } from 'react';
import { MessageSquare, ArrowUp, ExternalLink, Clock, RefreshCw, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { useNews } from './useNews';

const DEFAULT_VISIBLE_COUNT = 3;

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
      className="block rounded-lg border overflow-hidden transition-all duration-200 hover:shadow-lg hover:scale-[1.01]"
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
            className="text-sm sm:text-base font-medium leading-snug line-clamp-2 mb-2"
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

const News = () => {
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
    <div className="w-full">
      {/* Header */}
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

      {/* Posts grid */}
      <div className="grid grid-cols-1 gap-2 sm:gap-3">
        {displayedPosts.map((post) => (
          <NewsCard key={post.data.id} post={post} />
        ))}
      </div>

      {/* Show More / Show Less button */}
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

      {/* View more on Reddit link */}
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

