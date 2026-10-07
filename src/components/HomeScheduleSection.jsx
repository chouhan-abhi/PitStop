import React, { useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, MapPin, Clock, Activity, Radio, Calendar } from "lucide-react";
import SectionHeader from "./ui/SectionHeader";
import { getEventTimelineStatus } from "../common/utils/dataProcessing";

const CARD_SCROLL_PX = 290;

const formatRaceDate = (dateValue) => {
  if (!dateValue) return "TBD";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "TBD";
  return date.toLocaleString(undefined, {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const HomeScheduleSection = ({ eventsData }) => {
  const now = new Date();
  const railRef = useRef(null);

  // Filter ONLY currently running events (3-day weekend window) and upcoming races
  const rows = useMemo(() => {
    if (!Array.isArray(eventsData) || !eventsData.length) return [];
    return [...eventsData]
      .filter((event) => event?.date_start)
      .map((event) => ({
        ...event,
        timeline: getEventTimelineStatus(event, now),
      }))
      // Show ONLY live running 3-day events and future upcoming races
      .filter((item) => item.timeline.isLive || item.timeline.isUpcoming)
      .sort((a, b) => new Date(a.date_start) - new Date(b.date_start));
  }, [eventsData]);

  const liveEvents = rows.filter((r) => r.timeline.isLive);
  const upcomingEvents = rows.filter((r) => r.timeline.isUpcoming);

  const scrollRail = (direction) => {
    if (!railRef.current) return;
    railRef.current.scrollBy({ left: direction * CARD_SCROLL_PX, behavior: "smooth" });
  };

  if (!rows.length) {
    return (
      <div
        style={{
          background: "var(--md-surface-container)",
          border: "1px solid var(--md-outline-variant)",
          borderRadius: "var(--shape-md)",
          padding: "1.25rem",
        }}
      >
        <SectionHeader
          title="Upcoming Race Calendar"
          subtitle="All championship Grand Prix events for this season have concluded"
          compact
        />
      </div>
    );
  }

  return (
    <div
      style={{
        background: "var(--md-surface-container)",
        border: "1px solid var(--md-outline-variant)",
        borderRadius: "var(--shape-md)",
        padding: "1rem",
      }}
    >
      <SectionHeader
        title="Upcoming Race Calendar"
        subtitle={
          liveEvents.length > 0
            ? `${liveEvents.length} Grand Prix currently LIVE · ${upcomingEvents.length} upcoming`
            : `${upcomingEvents.length} upcoming Grand Prix events remaining`
        }
        actions={
          <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
            {liveEvents.length > 0 && (
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.6rem",
                  fontWeight: 800,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "#ef4444",
                  background: "rgba(239, 68, 68, 0.12)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  borderRadius: "var(--shape-xs)",
                  padding: "0.2rem 0.5rem",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.3rem",
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "#ef4444",
                    animation: "pulse 1.5s infinite",
                  }}
                />
                LIVE WEEKEND
              </span>
            )}
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.6rem",
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--warning)",
                background: "rgba(245,158,11,0.08)",
                border: "1px solid rgba(245,158,11,0.25)",
                borderRadius: "var(--shape-xs)",
                padding: "0.2rem 0.5rem",
              }}
            >
              {upcomingEvents.length} UPCOMING
            </span>
            <button
              type="button"
              onClick={() => scrollRail(-1)}
              aria-label="Scroll schedule left"
              style={{
                width: 26,
                height: 26,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "var(--md-surface-container-high)",
                border: "1px solid var(--md-outline-variant)",
                borderRadius: "var(--shape-xs)",
                color: "var(--md-on-surface-variant)",
                cursor: "pointer",
              }}
            >
              <ChevronLeft size={13} />
            </button>
            <button
              type="button"
              onClick={() => scrollRail(1)}
              aria-label="Scroll schedule right"
              style={{
                width: 26,
                height: 26,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "var(--md-surface-container-high)",
                border: "1px solid var(--md-outline-variant)",
                borderRadius: "var(--shape-xs)",
                color: "var(--md-on-surface-variant)",
                cursor: "pointer",
              }}
            >
              <ChevronRight size={13} />
            </button>
          </div>
        }
      />

      <div
        ref={railRef}
        style={{
          display: "flex",
          gap: "0.75rem",
          overflowX: "auto",
          paddingBottom: "0.5rem",
          paddingTop: "0.5rem",
          scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch",
          overscrollBehaviorX: "contain",
          scrollbarWidth: "none",
        }}
        className="scrollbar-none"
      >
        {rows.map((event, idx) => {
          const isLive = event.timeline.isLive;
          const statusColor = isLive ? "#ef4444" : "var(--warning)";
          const statusLabel = isLive ? "LIVE NOW" : "UPCOMING";
          const leftBorder = isLive ? "#ef4444" : "var(--warning)";

          return (
            <div
              key={`${event.meeting_key}-${event.meeting_name}`}
              className="apple-interactive"
              style={{
                flexShrink: 0,
                scrollSnapAlign: "start",
                width: "min(82vw, 290px)",
                background: isLive ? "rgba(239, 68, 68, 0.05)" : "var(--md-surface-container-high)",
                border: isLive ? "1px solid rgba(239, 68, 68, 0.3)" : "1px solid var(--md-outline-variant)",
                borderRadius: "var(--shape-md)",
                borderLeft: `4px solid ${leftBorder}`,
                padding: "0.85rem 1rem",
                position: "relative",
                overflow: "hidden",
                boxShadow: isLive ? "0 4px 20px rgba(239, 68, 68, 0.15)" : "none",
              }}
            >
              {/* Header row */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "0.5rem",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.58rem",
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "var(--md-primary)",
                    background: "rgba(0, 229, 200, 0.06)",
                    border: "1px solid rgba(0, 229, 200, 0.15)",
                    borderRadius: "var(--shape-xs)",
                    padding: "0.15rem 0.4rem",
                  }}
                >
                  NEXT #{idx + 1}
                </span>

                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.58rem",
                    fontWeight: 800,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: statusColor,
                    display: "flex",
                    alignItems: "center",
                    gap: "0.25rem",
                  }}
                >
                  {isLive && (
                    <span
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: "50%",
                        backgroundColor: "#ef4444",
                        animation: "ping 1.5s infinite",
                      }}
                    />
                  )}
                  {statusLabel}
                </span>
              </div>

              {/* Race name */}
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "0.92rem",
                  fontWeight: 700,
                  color: "var(--md-on-surface)",
                  letterSpacing: "0.01em",
                  lineHeight: 1.25,
                  marginBottom: "0.375rem",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {event.meeting_name || "Grand Prix"}
              </div>

              {/* Circuit & Location */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.3rem",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.6rem",
                  color: "var(--md-on-surface-variant)",
                  letterSpacing: "0.03em",
                  marginBottom: "0.625rem",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                <MapPin size={10} style={{ flexShrink: 0, color: "var(--md-primary)", opacity: 0.8 }} />
                <span>{event.circuit_short_name || event.circuit_name || "Circuit"}</span>
                <span>·</span>
                <span>{event.location || event.country_name || "Location"}</span>
              </div>

              {/* Start Date / Live Action */}
              <div
                style={{
                  borderTop: "1px solid rgba(255,255,255,0.06)",
                  paddingTop: "0.5rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.3rem",
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.58rem",
                    color: "var(--md-on-surface-variant)",
                  }}
                >
                  <Clock size={10} style={{ color: "var(--md-primary)", opacity: 0.7 }} />
                  {isLive ? "3-DAY EVENT" : "STARTS"}
                </div>

                {isLive ? (
                  <Link
                    to={`/event/${event.meeting_key}`}
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.62rem",
                      fontWeight: 700,
                      color: "#fff",
                      background: "#ef4444",
                      padding: "0.2rem 0.5rem",
                      borderRadius: "var(--shape-xs)",
                      textDecoration: "none",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.25rem",
                    }}
                  >
                    <Activity size={10} />
                    LIVE TELEMETRY
                  </Link>
                ) : (
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.65rem",
                      fontWeight: 700,
                      color: "var(--md-on-surface)",
                      letterSpacing: "0.02em",
                    }}
                  >
                    {formatRaceDate(event.date_start)}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HomeScheduleSection;
