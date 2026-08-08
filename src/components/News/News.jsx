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
  MessageSquare,
  TrendingUp,
} from "lucide-react";

import { useNews } from "./useNews";
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
  if (value.includes("news") || value.includes("official")) return "live";
  if (value.includes("video") || value.includes("rumour") || value.includes("rumor")) return "warn";
  return "neutral";
};

const sanitizePosts = (items) => {
  if (!Array.isArray(items)) return [];
  return items.filter((post) => Boolean(post?.id && post?.title && post?.url));
};

/* ── Immersive Featured Hero Card ────────────────────────── */
const FeaturedHeroCard = ({ post }) => {
  const { title, url, image, flair, source, summary, author, score, comments, createdAt, updatedAt } = post;
  const timeAgo = formatTimeAgo(updatedAt || createdAt);

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "block",
        position: "relative",
        height: "380px",
        borderRadius: "var(--shape-md)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        overflow: "hidden",
        textDecoration: "none",
        color: "inherit",
      }}
      className="group"
    >
      {/* Cover Image */}
      {image ? (
        <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
          <img
            src={image}
            alt=""
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transition: "transform 400ms ease",
            }}
            className="group-hover:scale-[1.02]"
          />
        </div>
      ) : (
        <div style={{ position: "absolute", inset: 0, background: "var(--md-surface-container-highest)", zIndex: 0 }} />
      )}

      {/* Cyber gradient mask */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to top, rgba(5, 5, 8, 0.95) 0%, rgba(5, 5, 8, 0.5) 55%, rgba(5, 5, 8, 0.2) 100%)",
          zIndex: 1,
        }}
      />

      {/* Flair/Source row */}
      <div style={{
        position: "absolute",
        top: "1rem",
        right: "1rem",
        zIndex: 2,
      }}>
        <span style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.55rem",
          color: "rgba(255, 255, 255, 0.6)",
          background: "rgba(0,0,0,0.5)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "var(--shape-xs)",
          padding: "0.15rem 0.45rem",
        }}>
          {source || "FEED"}
        </span>
      </div>

      {/* Foreground Content */}
      <div style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        padding: "1.5rem",
        zIndex: 2,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
      }}>
        <span style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.55rem",
          fontWeight: 700,
          color: "var(--md-primary)",
          letterSpacing: "0.15em",
          marginBottom: "0.4rem",
        }}>
          FEATURED REPORT
        </span>

        <h3
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.4rem",
            fontWeight: 900,
            color: "#fff",
            textTransform: "uppercase",
            lineHeight: 1.15,
            margin: 0,
            letterSpacing: "0.02em",
            transition: "color 150ms ease",
          }}
          className="group-hover:text-[var(--md-primary)]"
        >
          {title}
        </h3>

        {summary && (
          <p style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.75rem",
            color: "var(--md-on-surface-variant)",
            marginTop: "0.5rem",
            lineHeight: 1.4,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}>
            {summary}
          </p>
        )}

        {/* Technical metadata footer */}
        <div style={{
          marginTop: "0.875rem",
          borderTop: "1px solid rgba(255, 255, 255, 0.08)",
          paddingTop: "0.75rem",
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          fontFamily: "var(--font-mono)",
          fontSize: "0.58rem",
          color: "rgba(255, 255, 255, 0.5)",
        }}>
          {author && <span className="truncate" style={{ maxWidth: "120px" }}>BY {author}</span>}
          {typeof score === "number" && <span>{score}↑</span>}
          {typeof comments === "number" && (
            <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
              <MessageSquare size={10} /> {comments} CMT
            </span>
          )}
          <span style={{ display: "flex", alignItems: "center", gap: "0.25rem", marginLeft: "auto" }}>
            <Clock size={10} /> {timeAgo}
          </span>
        </div>
      </div>
    </a>
  );
};

/* ── Immersive Trending Item ─────────────────────────────── */
const TrendingItem = ({ post }) => {
  const { title, url, image, source, createdAt, updatedAt } = post;
  const timeAgo = formatTimeAgo(updatedAt || createdAt);

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "flex",
        gap: "0.75rem",
        padding: "0.75rem 0",
        borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
        textDecoration: "none",
        color: "inherit",
      }}
      className="group"
    >
      {/* Thumbnail */}
      {image && (
        <div style={{
          width: "64px",
          height: "44px",
          borderRadius: "var(--shape-xs)",
          border: "1px solid rgba(255, 255, 255, 0.05)",
          overflow: "hidden",
          flexShrink: 0,
        }}>
          <img
            src={image}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      )}

      {/* Text Details */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <h4
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "0.7rem",
            fontWeight: 700,
            lineHeight: 1.3,
            color: "#fff",
            margin: 0,
            textTransform: "uppercase",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            letterSpacing: "0.01em",
            transition: "color 150ms ease",
          }}
          className="group-hover:text-[var(--md-primary)]"
        >
          {title}
        </h4>

        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontFamily: "var(--font-mono)",
          fontSize: "0.55rem",
          color: "var(--md-on-surface-variant)",
          marginTop: "0.15rem",
        }}>
          <span>{source || "FEED"}</span>
          <span>{timeAgo}</span>
        </div>
      </div>
    </a>
  );
};

/* ── Immersive News Card ─────────────────────────────────── */
const NewsCard = ({ post }) => {
  const { title, url, image, source, author, createdAt, updatedAt, score, comments, flair, summary } = post;
  const timeAgo = formatTimeAgo(updatedAt || createdAt);

  return (
    <Surface
      tier="container-high"
      interactive
      as="a"
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block overflow-hidden p-0 no-underline text-inherit"
      style={{
        borderRadius: "var(--shape-md)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: "290px",
        transition: "all 150ms ease",
      }}
    >
      {/* Cover Image Block */}
      {image ? (
        <div style={{ height: "135px", overflow: "hidden", position: "relative" }}>
          <img
            src={image}
            alt=""
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transition: "transform 350ms ease",
            }}
            className="group-hover:scale-[1.03]"
            loading="lazy"
            decoding="async"
          />
          {/* Subtle overlay gradient on image */}
          <div style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to top, rgba(9, 9, 15, 0.4) 0%, transparent 100%)",
          }} />
        </div>
      ) : (
        <div style={{ height: "135px", background: "var(--md-surface-container-highest)" }} />
      )}

      {/* Card Info Section */}
      <div style={{ padding: "0.875rem", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div>
          {/* Tag row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
            {flair ? (
              <span style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.5rem",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                padding: "0.15rem 0.35rem",
                borderRadius: "2px",
                ...(getFlairTone(flair) === "live"
                  ? { background: "rgba(0, 229, 200, 0.06)", color: "var(--md-primary)", border: "1px solid rgba(0, 229, 200, 0.2)" }
                  : { background: "rgba(245, 158, 11, 0.06)", color: "var(--warning)", border: "1px solid rgba(245, 158, 11, 0.2)" }),
              }}>
                {flair}
              </span>
            ) : (
              <span />
            )}
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.55rem", color: "var(--md-on-surface-variant)" }}>
              {source || "FEED"}
            </span>
          </div>

          {/* Title */}
          <h3
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "0.85rem",
              fontWeight: 700,
              color: "#fff",
              lineHeight: 1.3,
              margin: 0,
              textTransform: "uppercase",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              letterSpacing: "0.01em",
              transition: "color 150ms ease",
            }}
            className="group-hover:text-[var(--md-primary)]"
          >
            {title}
          </h3>

          {/* Brief Summary */}
          {summary && (
            <p style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.7rem",
              color: "var(--md-on-surface-variant)",
              marginTop: "0.35rem",
              lineHeight: 1.3,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}>
              {summary}
            </p>
          )}
        </div>

        {/* Technical metadata footer */}
        <div style={{
          borderTop: "1px solid rgba(255, 255, 255, 0.05)",
          paddingTop: "0.6rem",
          marginTop: "0.6rem",
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          fontFamily: "var(--font-mono)",
          fontSize: "0.55rem",
          color: "rgba(255, 255, 255, 0.45)",
        }}>
          {author && <span className="truncate" style={{ maxWidth: "90px" }}>{author}</span>}
          {typeof score === "number" && <span>{score}↑</span>}
          {typeof comments === "number" && (
            <span style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}>
              <MessageSquare size={9} /> {comments}
            </span>
          )}
          <span style={{ display: "flex", alignItems: "center", gap: "0.2rem", marginLeft: "auto" }}>
            <Clock size={9} /> {timeAgo}
          </span>
        </div>
      </div>
    </Surface>
  );
};

/* ── Immersive News Layout ────────────────────────────────── */
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

  // Extract featured (1st item) and trending list (next 3 items)
  const heroPost = posts[0] || null;
  const trendingPosts = useMemo(() => posts.slice(1, 4), [posts]);

  // Headlines feed (all remaining items, paginated by DEFAULT_VISIBLE_COUNT)
  const headlinePosts = useMemo(() => posts.slice(4), [posts]);
  const displayedPosts = expanded ? headlinePosts : headlinePosts.slice(0, DEFAULT_VISIBLE_COUNT);

  if (isLoading) {
    return (
      <div style={{
        padding: "3rem",
        textAlign: "center",
        fontFamily: "var(--font-mono)",
        fontSize: "0.65rem",
        color: "var(--md-on-surface-variant)",
        background: "var(--md-surface-container)",
        border: "1px solid var(--md-outline-variant)",
        borderRadius: "var(--shape-md)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.5rem",
      }}>
        <Loader2 className="w-4 h-4 animate-spin text-[var(--md-primary)]" />
        LOADING MOTORSPORT TELEMETRY STREAM...
      </div>
    );
  }

  if (isError && posts.length === 0) {
    return (
      <Surface tier="container" className="p-6 text-center" style={{ borderRadius: "var(--shape-md)" }}>
        <p className="font-mono text-xs text-[var(--danger)]">ERROR RESOLVING NEWSROOM DATA FEED</p>
        <p className="font-mono text-[10px] text-[var(--md-on-surface-variant)] mt-1">{error?.message}</p>
        <Button variant="tonal" className="mt-3" onClick={refetch}>
          RECONNECT FEED
        </Button>
      </Surface>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* Header bar */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "0.75rem",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <Radio size={14} style={{ color: "var(--md-primary)" }} />
          <h2 style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.25rem",
            fontWeight: 900,
            color: "#fff",
            textTransform: "uppercase",
            letterSpacing: "0.02em",
            margin: 0,
          }}>
            F1 Newsroom
          </h2>
        </div>

        {/* Right actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.55rem", color: "var(--md-on-surface-variant)" }}>
            {posts.length} STORIES
          </span>
          <button
            onClick={refetch}
            disabled={isFetching}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: isFetching ? "var(--md-primary)" : "var(--md-on-surface-variant)",
              display: "flex",
              alignItems: "center",
              outline: "none",
            }}
            aria-label="Refresh news"
          >
            <RefreshCw size={12} className={isFetching ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      <DataStatusBanner meta={dataMeta} />

      {data?.usedFallback && (
        <Surface tier="container" className="flex items-center gap-2 p-3 text-xs font-mono text-[var(--md-on-surface-variant)]" style={{ borderRadius: "var(--shape-sm)", border: "1px solid var(--md-outline-variant)" }}>
          <TriangleAlert className="h-3.5 w-3.5 shrink-0 text-amber-500" />
          PRIMARY SPEED FEED OFFLINE. ROUTING fallback TELEMETRY SOURCES.
        </Surface>
      )}

      {/* Immersive Hero Layout: 2/3 Feature Split on Desktop */}
      {heroPost && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Main Hero Card (takes 2/3) */}
          <div className="lg:col-span-2">
            <FeaturedHeroCard post={heroPost} />
          </div>

          {/* Trending Feed Sidebar (takes 1/3) */}
          <div
            style={{
              background: "var(--md-surface-container)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "var(--shape-md)",
              padding: "1.25rem",
              display: "flex",
              flexDirection: "column",
              height: "380px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.5rem" }}>
              <TrendingUp size={12} style={{ color: "var(--md-primary)" }} />
              <h3 style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.6rem",
                fontWeight: 700,
                color: "var(--md-primary)",
                margin: 0,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}>
                Trending Feed
              </h3>
            </div>

            <div style={{ display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between" }}>
              {trendingPosts.length > 0 ? (
                trendingPosts.map((post) => (
                  <TrendingItem key={post.id} post={post} />
                ))
              ) : (
                <div style={{
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.6rem",
                  color: "var(--md-on-surface-variant)",
                }}>
                  NO TRENDING POSTS
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Grid Headlines Section Header */}
      {displayedPosts.length > 0 && (
        <div style={{
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          paddingBottom: "0.5rem",
          marginTop: "0.5rem",
        }}>
          <h3 style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.65rem",
            fontWeight: 700,
            color: "var(--md-on-surface-variant)",
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            margin: 0,
          }}>
            Grid Headlines
          </h3>
        </div>
      )}

      {/* News Headlines Grid */}
      {displayedPosts.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 md3-content-auto">
          {displayedPosts.map((post) => (
            <NewsCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {/* Show More Actions */}
      {headlinePosts.length > DEFAULT_VISIBLE_COUNT && (
        <div style={{ textAlign: "center", marginTop: "0.5rem" }}>
          <Button variant="text" size="sm" onClick={() => setExpanded((prev) => !prev)} style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.65rem",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            fontWeight: 700,
            display: "inline-flex",
            alignItems: "center",
            gap: "0.3rem",
          }}>
            {expanded ? "Show Less" : "Show More"}
            {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </Button>
        </div>
      )}

      {dataUpdatedAt && (
        <div style={{
          textAlign: "center",
          fontFamily: "var(--font-mono)",
          fontSize: "0.55rem",
          color: "var(--md-on-surface-variant)",
          marginTop: "0.25rem",
        }}>
          UPDATED {formatTimeAgo(new Date(dataUpdatedAt).toISOString())}
        </div>
      )}
    </div>
  );
};

export default News;
