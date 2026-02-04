import React, { useEffect, useMemo, useState } from "react";

import calendarText from "../assets/calendar.ics?raw";
import CircuitModel from "./Common/CircuitModel";

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

const HomeCountdownHero = () => {
  const events = useMemo(() => parseIcsEvents(calendarText), []);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const nextEvent = events.find((event) => event.date >= now) || null;
  const countdown = nextEvent ? formatCountdown(nextEvent.date - now) : null;

  if (!nextEvent) {
    return (
      <div className="rounded-3xl border border-[var(--border-color)] bg-[var(--panel-color)]/75 p-5 sm:p-7 shadow-[0_16px_40px_rgba(0,0,0,0.2)]">
        <p className="text-lg text-[var(--text-color)] opacity-70">
          Awaiting season start
        </p>
      </div>
    );
  }

  return (
    <section className="relative overflow-hidden rounded-3xl border border-red-500/20 bg-[var(--panel-color)]/80 p-5 sm:p-7 shadow-[0_16px_40px_rgba(0,0,0,0.22)]">
      <div className="absolute inset-0 bg-gradient-to-r from-red-600/25 via-transparent to-transparent" />
      <div className="absolute -right-6 -top-8 text-[120px] sm:text-[160px] font-black tracking-tight text-white/5 select-none">
        NEXT
      </div>
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 items-center">
        <div className="space-y-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.35em] text-red-300/80">
              Next Session
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-color)] mt-2">
              {nextEvent.summary.replace("RN365 ", "")}
            </h2>
            {nextEvent.location && (
              <p className="text-sm opacity-70 mt-1">{nextEvent.location}</p>
            )}
            <p className="text-sm opacity-60 mt-1">
              {nextEvent.date.toLocaleString()}
            </p>
          </div>

          <div className="text-left">
            <div className="text-[10px] uppercase tracking-[0.35em] text-red-200/80">
              Countdown
            </div>
            <div className="mt-2 text-3xl font-extrabold text-white tracking-[0.2em]">
              {String(countdown.days).padStart(2, "0")}D :
              {String(countdown.hours).padStart(2, "0")}H :
              {String(countdown.minutes).padStart(2, "0")}M :
              {String(countdown.seconds).padStart(2, "0")}S
            </div>
            <div className="mt-2 text-[9px] uppercase tracking-[0.4em] text-white/40">
              F1 INSIDER
            </div>
          </div>
        </div>

        {nextEvent.location && (
          <div className="flex justify-center lg:justify-center">
            <CircuitModel
              circuitName={nextEvent.summary}
              location={nextEvent.location}
              width={500}
              height={300}
            />
          </div>
        )}
      </div>
    </section>
  );
};

export default HomeCountdownHero;
