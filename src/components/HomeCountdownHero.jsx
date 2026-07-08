import React, { useEffect, useMemo, useState } from "react";

import calendarText from "../assets/calendar.ics?raw";
import HeroSurface from "./ui/HeroSurface";
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
        circuitName: event.circuit_short_name || event.meeting_name,
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
      <div className="md3-surface-container p-6 rounded-[var(--shape-xl)]">
        <p className="md3-body-md text-[var(--md-on-surface-variant)]">
          No upcoming events in this schedule.
        </p>
      </div>
    );
  }

  return (
    <HeroSurface
      circuitName={nextEvent.circuitName || nextEvent.summary}
      location={nextEvent.location}
      eager3D
      minHeight="min-h-[320px] sm:min-h-[380px]"
    >
      <StatusPill tone="live">Next Session</StatusPill>
      <h2 className="md3-headline-lg mt-3 max-w-xl">
        {(nextEvent.summary || "Next Session").replace("RN365 ", "")}
      </h2>
      {nextEvent.location && (
        <p className="md3-body-md text-[var(--md-on-surface-variant)] mt-2">{nextEvent.location}</p>
      )}
      <p className="md3-label-md text-[var(--md-on-surface-variant)] mt-1">
        {nextEvent.date.toLocaleString()}
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 max-w-lg">
        <StatChip label="Days" value={String(countdown.days).padStart(2, "0")} />
        <StatChip label="Hours" value={String(countdown.hours).padStart(2, "0")} />
        <StatChip label="Minutes" value={String(countdown.minutes).padStart(2, "0")} />
        <StatChip label="Seconds" value={String(countdown.seconds).padStart(2, "0")} />
      </div>
    </HeroSurface>
  );
};

export default HomeCountdownHero;
