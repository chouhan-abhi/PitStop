import React, { useMemo, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import Panel from "./ui/Panel";
import SectionHeader from "./ui/SectionHeader";
import StatusPill from "./ui/StatusPill";

const CARD_SCROLL_PX = 320;

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

    railRef.current.scrollBy({
      left: direction * CARD_SCROLL_PX,
      behavior: "smooth",
    });
  };

  if (!rows.length) {
    return (
      <Panel className="p-4 border-red-500/25">
        <SectionHeader title="Schedule" subtitle="Season race calendar feed unavailable" compact />
      </Panel>
    );
  }

  return (
    <Panel className="p-4 border-red-500/25">
      <SectionHeader
        title="Schedule"
        subtitle="Season timeline from live API schedule"
        actions={
          <div className="flex items-center gap-2">
            <StatusPill tone={upcomingCount > 0 ? "warn" : "neutral"}>
              {upcomingCount > 0 ? `${upcomingCount} upcoming` : "Season complete"}
            </StatusPill>
            <button
              type="button"
              className="btn btn-ghost !px-2"
              onClick={() => scrollRail(-1)}
              aria-label="Scroll schedule left"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              className="btn btn-ghost !px-2"
              onClick={() => scrollRail(1)}
              aria-label="Scroll schedule right"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        }
      />

      <div
        ref={railRef}
        className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-thin"
      >
        {rows.map((event) => {
          const date = new Date(event.date_start);
          const inFuture = date >= now;
          const isLiveWindow = Math.abs(now - date) < 1000 * 60 * 60 * 4;
          const tone = isLiveWindow ? "live" : inFuture ? "warn" : "success";
          const state = isLiveWindow ? "Soon" : inFuture ? "Upcoming" : "Done";

          return (
            <article
              key={`${event.meeting_key}-${event.meeting_name}`}
              className="snap-start shrink-0 w-[260px] sm:w-[300px] f1-card border border-[var(--border-color)] bg-black/20 p-3"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold leading-snug">{event.meeting_name || "Grand Prix"}</p>
                <StatusPill tone={tone}>{state}</StatusPill>
              </div>

              <p className="text-xs text-[var(--text-secondary)] mt-1">
                {event.circuit_short_name || event.circuit_name || "Circuit"} ·{" "}
                {event.location || event.country_name || "Location"}
              </p>

              <p className="text-xs text-[var(--text-muted)] mt-3">
                {formatRaceDate(event.date_start)}
              </p>
            </article>
          );
        })}
      </div>
    </Panel>
  );
};

export default HomeScheduleSection;
