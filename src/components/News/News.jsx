import React, { useState } from 'react';
import {
  ExternalLink,
  Clock,
  RefreshCw,
  Loader2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

import { useNews } from './useNews';

const DEFAULT_VISIBLE_COUNT = 6;

/* ---------------- utils ---------------- */

const formatTimeAgo = (iso) => {
  if (!iso) return '—';
  const seconds = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return `${Math.floor(seconds / 604800)}w ago`;
};

const getFlairColor = (flair) => {
  if (!flair) return '#868e96';
  const t = flair.toLowerCase();
  if (t.includes('news')) return '#4dabf7';
  if (t.includes('video')) return '#ff922b';
  if (t.includes('photo')) return '#51cf66';
  if (t.includes('rumour') || t.includes('rumor')) return '#fcc419';
  return '#9b5de5';
};

/* ---------------- cards ---------------- */

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

  const flairColor = getFlairColor(flair);

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-xl border overflow-hidden transition-all hover:shadow-lg hover:ring-1 hover:ring-red-500/40"
      style={{
        borderColor: 'var(--border-color)',
        backgroundColor: 'var(--panel-color)',
      }}
    >
      <div className="flex flex-col sm:flex-row">
        {image && (
          <div className="sm:w-32 lg:w-40 shrink-0 overflow-hidden">
            <img
              src={image}
              alt=""
              className="w-full h-32 sm:h-full object-cover"
              loading="lazy"
            />
          </div>
        )}

        <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
          {flair && (
            <span
              className="text-[10px] px-2 py-0.5 rounded-full w-fit mb-1"
              style={{
                backgroundColor: `${flairColor}20`,
                color: flairColor,
              }}
            >
              {flair}
            </span>
          )}

          <h3 className="text-sm sm:text-base font-semibold line-clamp-2 mb-2">
            {title}
          </h3>

          <div className="flex items-center gap-3 text-[10px] opacity-60">
            <span>{source}</span>
            {author && <span className="hidden sm:inline truncate">{author}</span>}
            {typeof score === 'number' && <span>{score} points</span>}
            {typeof comments === 'number' && <span>{comments} comments</span>}
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
  const flairColor = getFlairColor(flair);

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="relative overflow-hidden rounded-2xl border border-red-500/30 h-[320px] flex items-end group"
    >
      {image && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${image})` }}
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />

      <div className="relative z-10 p-4">
        {flair && (
          <span
            className="text-[10px] px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: `${flairColor}30`,
              color: '#fff',
            }}
          >
            {flair}
          </span>
        )}
        <div className="mt-2 text-[10px] uppercase tracking-[0.3em] text-red-300">
          Top Story
        </div>
        <h3 className="mt-2 text-lg font-extrabold text-white line-clamp-2">
          {title}
        </h3>
      </div>
    </a>
  );
};

/* ---------------- carousel ---------------- */

const NewsCarousel = ({ posts }) => {
  const [index, setIndex] = useState(0);
  const featured = posts.slice(0, 5);

  if (!featured.length) return null;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-semibold">Top Stories</h3>
        <div className="flex gap-2">
          <button onClick={() => setIndex((i) => (i - 1 + featured.length) % featured.length)}>‹</button>
          <button onClick={() => setIndex((i) => (i + 1) % featured.length)}>›</button>
        </div>
      </div>
      <FeaturedCard post={featured[index]} />
    </div>
  );
};

/* ---------------- main ---------------- */

const News = ({ showHeader = true, layout = 'standard' }) => {
  const [expanded, setExpanded] = useState(false);

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
    dataUpdatedAt,
  } = useNews('week', 15);

  const posts = (data?.hits || []).map((hit) => ({
    id: hit.objectID,
    title: hit.title || hit.story_title || 'Untitled',
    url: hit.url || hit.story_url || `https://news.ycombinator.com/item?id=${hit.objectID}`,
    source: 'Hacker News',
    score: hit.points,
    createdAt: hit.created_at,
    updatedAt: hit.updated_at,
    author: hit.author,
    comments: hit.num_comments,
  }));
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
        <button onClick={refetch} className="mt-3 text-xs underline">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {layout === 'carousel' && <NewsCarousel posts={posts} />}

      {showHeader && (
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-semibold">Formula 1 News</h3>
          <div className="flex items-center gap-3">
            {typeof data?.nbHits === 'number' && (
              <span className="text-[10px] opacity-60">{data.nbHits} results</span>
            )}
            <button onClick={refetch} disabled={isFetching}>
              <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
            </button>
          </div>
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
            onClick={() => setExpanded(!expanded)}
            className="text-xs flex items-center gap-1 mx-auto"
          >
            {expanded ? 'Show Less' : 'Show More'}
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      )}

      {dataUpdatedAt && (
        <div className="text-center text-[10px] opacity-50">
          Updated {formatTimeAgo(new Date(dataUpdatedAt).toISOString())}
        </div>
      )}
    </div>
  );
};

export default News;
