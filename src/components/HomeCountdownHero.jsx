import React, { useEffect, useMemo, useState } from "react";

import calendarText from "../assets/calendar.ics?raw";
import CircuitModel from "./Common/CircuitModel";
import StatusPill from "./ui/StatusPill";
import StatChip from "./ui/StatChip";

const parseIcsEvents = (icsText) => {
  const events = [];
  const blocks = icsText.split("BEGIN:VEVENT").slice(1);

  blocks.forEach((block) => {
    const body = block.split("END:VEVENT")[0] || "";
    const lines = body.split(/\r?\n/).map((line) => line.trim());

    const summaryLine = lines.find((line) => line.startsWith("SUMMARY:"));
    const locationLine = lines.find((line) => line.startsWith("LOCATION:"));
    const dtstartLine = lines.find((line) => line.startsWith("DTSTART"));

    if (!dtstartLine) return;
    const dtValue = dtstartLine.split(":")[1];
    if (!dtValue) return;

    const year = Number(dtValue.slice(0, 4));
    const month = Number(dtValue.slice(4, 6));
    const day = Number(dtValue.slice(6, 8));
    const hour = Number(dtValue.slice(9, 11));
    const minute = Number(dtValue.slice(11, 13));
    const second = Number(dtValue.slice(13, 15));

    if (!year || !month || !day) return;

    const date = new Date(year, month - 1, day, hour, minute, second || 0);

    events.push({
      summary: summaryLine?.replace("SUMMARY:", "") || "Next Session",
      location: locationLine?.replace("LOCATION:", "") || "",
      date,
    });
  });

  return events.sort((a, b) => a.date - b.date);
};

const formatCountdown = (ms) => {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds };
};

const normalizeScheduleEvents = (eventsData = []) =>
  eventsData
    .filter((event) => event?.date_start)
    .map((event) => {
      const date = new Date(event.date_start);
      if (Number.isNaN(date.getTime())) return null;

      const parts = [event.location, event.country_name].filter(Boolean);
      return {
        summary: event.meeting_name || "Next Session",
        location: parts.join(", "),
        date,
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.date - b.date);

const HomeCountdownHero = ({ eventsData = [] }) => {
  const fallbackEvents = useMemo(() => parseIcsEvents(calendarText), []);
  const scheduleEvents = useMemo(() => normalizeScheduleEvents(eventsData), [eventsData]);
  const events = scheduleEvents.length ? scheduleEvents : fallbackEvents;
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const nextEvent = events.find((event) => event.date >= now) || null;
  const countdown = nextEvent ? formatCountdown(nextEvent.date - now) : null;

  if (!nextEvent) {
    return (
      <div className="panel p-6">
        <p className="text-lg text-[var(--text-secondary)]">No upcoming events in this schedule.</p>
      </div>
    );
  }

  return (
    <section className="f1-card relative overflow-hidden rounded-xl border border-red-500/25 bg-gradient-to-r from-red-900/30 via-[var(--panel-color)] to-black/25 p-5 sm:p-7 shadow-[var(--shadow-md)]">
      <div className="absolute -right-6 -top-8 text-[120px] sm:text-[160px] display-title font-black tracking-tight text-white/5 select-none">
        NEXT
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 items-center">
        <div className="space-y-4">
          <div>
            <StatusPill tone="live">Next Session</StatusPill>
            <h2 className="display-title text-2xl sm:text-3xl font-bold mt-2">
              {(nextEvent.summary || "Next Session").replace("RN365 ", "")}
            </h2>
            {nextEvent.location && <p className="text-sm text-[var(--text-secondary)] mt-1">{nextEvent.location}</p>}
            <p className="text-sm text-[var(--text-muted)] mt-1">{nextEvent.date.toLocaleString()}</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <StatChip label="Days" value={String(countdown.days).padStart(2, "0")} />
            <StatChip label="Hours" value={String(countdown.hours).padStart(2, "0")} />
            <StatChip label="Minutes" value={String(countdown.minutes).padStart(2, "0")} />
            <StatChip label="Seconds" value={String(countdown.seconds).padStart(2, "0")} />
          </div>
        </div>

        {nextEvent.location && (
          <div className="flex justify-center lg:justify-end">
            <CircuitModel
              circuitName={nextEvent.summary}
              location={nextEvent.location}
              width={460}
              height={280}
              enabled
              defer
            />
          </div>
        )}
      </div>
    </section>
  );
};

export default HomeCountdownHero;
