import React, { useMemo, useRef } from "react";
import { ChevronLeft, ChevronRight, MapPin, Clock } from "lucide-react";

import SectionHeader from "./ui/SectionHeader";

const CARD_SCROLL_PX = 280;

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

  const rows = useMemo(() => {
    if (!Array.isArray(eventsData) || !eventsData.length) return [];
    return [...eventsData]
      .filter((event) => event?.date_start)
      .sort((a, b) => new Date(a.date_start) - new Date(b.date_start));
  }, [eventsData]);

  const upcomingCount = rows.filter((event) => new Date(event.date_start) >= now).length;

  const scrollRail = (direction) => {
    if (!railRef.current) return;
    railRef.current.scrollBy({ left: direction * CARD_SCROLL_PX, behavior: "smooth" });
  };

  if (!rows.length) {
    return (
      <div style={{
        background: "var(--md-surface-container)",
        border: "1px solid var(--md-outline-variant)",
        borderRadius: "var(--shape-md)",
        padding: "1rem",
      }}>
        <SectionHeader title="Schedule" subtitle="Season race calendar feed unavailable" compact />
      </div>
    );
  }

  return (
    <div style={{
      background: "var(--md-surface-container)",
      border: "1px solid var(--md-outline-variant)",
      borderRadius: "var(--shape-md)",
      padding: "1rem",
    }}>
      <SectionHeader
        title="Race Calendar"
        subtitle="Season timeline from live API"
        actions={
          <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
            <span style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.6rem",
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: upcomingCount > 0 ? "var(--warning)" : "var(--md-on-surface-variant)",
              background: upcomingCount > 0 ? "rgba(245,158,11,0.08)" : "var(--md-surface-container-high)",
              border: `1px solid ${upcomingCount > 0 ? "rgba(245,158,11,0.25)" : "var(--md-outline-variant)"}`,
              borderRadius: "var(--shape-xs)",
              padding: "0.2rem 0.5rem",
            }}>
              {upcomingCount > 0 ? `${upcomingCount} UPCOMING` : "SEASON COMPLETE"}
            </span>
            <button
              type="button"
              onClick={() => scrollRail(-1)}
              aria-label="Scroll schedule left"
              style={{
                width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center",
                background: "var(--md-surface-container-high)", border: "1px solid var(--md-outline-variant)",
                borderRadius: "var(--shape-xs)", color: "var(--md-on-surface-variant)", cursor: "pointer",
              }}
            >
              <ChevronLeft size={13} />
            </button>
            <button
              type="button"
              onClick={() => scrollRail(1)}
              aria-label="Scroll schedule right"
              style={{
                width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center",
                background: "var(--md-surface-container-high)", border: "1px solid var(--md-outline-variant)",
                borderRadius: "var(--shape-xs)", color: "var(--md-on-surface-variant)", cursor: "pointer",
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
          gap: "0.625rem",
          overflowX: "auto",
          paddingBottom: "0.5rem",
          paddingTop: "0.5rem",
          scrollSnapType: "x mandatory",
          scrollbarWidth: "thin",
        }}
      >
        {rows.map((event, idx) => {
          const date = new Date(event.date_start);
          const inFuture = date >= now;
          const isLiveWindow = Math.abs(now - date) < 1000 * 60 * 60 * 4;

          const statusColor = isLiveWindow
            ? "var(--status-green)"
            : inFuture
              ? "var(--warning)"
              : "var(--md-on-surface-variant)";
          const statusLabel = isLiveWindow ? "LIVE" : inFuture ? "UPCOMING" : "DONE";
          const leftBorder = isLiveWindow
            ? "var(--status-green)"
            : inFuture
              ? "var(--warning)"
              : "var(--md-outline)";

          return (
            <div
              key={`${event.meeting_key}-${event.meeting_name}`}
              style={{
                flexShrink: 0,
                scrollSnapAlign: "start",
                width: "clamp(220px, 28vw, 280px)",
                background: "var(--md-surface-container-high)",
                border: "1px solid var(--md-outline-variant)",
                borderRadius: "var(--shape-md)",
                borderLeft: `3px solid ${leftBorder}`,
                padding: "0.75rem 0.875rem",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Round + status */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                <span style={{
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
                }}>
                  R{idx + 1}
                </span>
                <span style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.58rem",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: statusColor,
                }}>
                  {statusLabel}
                </span>
              </div>

              {/* Race name */}
              <div style={{
                fontFamily: "var(--font-display)",
                fontSize: "0.9rem",
                fontWeight: 700,
                color: "var(--md-on-surface)",
                letterSpacing: "0.01em",
                lineHeight: 1.2,
                marginBottom: "0.375rem",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}>
                {event.meeting_name || "Grand Prix"}
              </div>

              {/* Circuit */}
              <div style={{
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
              }}>
                <MapPin size={9} style={{ flexShrink: 0, color: "var(--md-primary)", opacity: 0.7 }} />
                {event.circuit_short_name || event.circuit_name || "Circuit"} · {event.location || event.country_name || "Location"}
              </div>

              {/* Separator */}
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "0.5rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontFamily: "var(--font-mono)", fontSize: "0.58rem", color: "var(--md-on-surface-variant)" }}>
                  <Clock size={9} style={{ color: "var(--md-primary)", opacity: 0.6 }} />
                  START
                </div>
                <span style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  color: inFuture ? "var(--md-on-surface)" : "var(--md-on-surface-variant)",
                  letterSpacing: "0.02em",
                }}>
                  {formatRaceDate(event.date_start)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HomeScheduleSection;
