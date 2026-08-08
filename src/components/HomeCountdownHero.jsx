import React, { useEffect, useMemo, useState } from "react";
import { MapPin, Calendar, Activity, Zap } from "lucide-react";

import calendarText from "../assets/calendar.ics?raw";
import HeroSurface from "./ui/HeroSurface";

const CIRCUIT_SPECS = {
  bahrain: { length: "5.412 KM", laps: "57 LAPS" },
  jeddah: { length: "6.174 KM", laps: "50 LAPS" },
  albert: { length: "5.278 KM", laps: "58 LAPS" },
  suzuka: { length: "5.807 KM", laps: "53 LAPS" },
  shanghai: { length: "5.451 KM", laps: "56 LAPS" },
  miami: { length: "5.412 KM", laps: "57 LAPS" },
  imola: { length: "4.909 KM", laps: "63 LAPS" },
  monaco: { length: "3.337 KM", laps: "78 LAPS" },
  gilles: { length: "4.361 KM", laps: "70 LAPS" },
  catalunya: { length: "4.657 KM", laps: "66 LAPS" },
  red_bull: { length: "4.318 KM", laps: "71 LAPS" },
  silverstone: { length: "5.891 KM", laps: "52 LAPS" },
  hungaroring: { length: "4.381 KM", laps: "70 LAPS" },
  spa: { length: "7.004 KM", laps: "44 LAPS" },
  zandvoort: { length: "4.259 KM", laps: "72 LAPS" },
  monza: { length: "5.793 KM", laps: "53 LAPS" },
  baku: { length: "6.003 KM", laps: "51 LAPS" },
  marina_bay: { length: "4.940 KM", laps: "62 LAPS" },
  americas: { length: "5.513 KM", laps: "56 LAPS" },
  hermanos: { length: "4.304 KM", laps: "71 LAPS" },
  interlagos: { length: "4.309 KM", laps: "71 LAPS" },
  vegas: { length: "6.201 KM", laps: "50 LAPS" },
  lusail: { length: "5.419 KM", laps: "57 LAPS" },
  yas_marina: { length: "5.281 KM", laps: "58 LAPS" },
};

const getSpecs = (eventName = "", circuitName = "") => {
  const str = `${eventName} ${circuitName}`.toLowerCase();
  if (str.includes("bahrain")) return CIRCUIT_SPECS.bahrain;
  if (str.includes("jeddah") || str.includes("saudi")) return CIRCUIT_SPECS.jeddah;
  if (str.includes("albert") || str.includes("melbourne") || str.includes("australia")) return CIRCUIT_SPECS.albert;
  if (str.includes("suzuka") || str.includes("japan")) return CIRCUIT_SPECS.suzuka;
  if (str.includes("shanghai") || str.includes("china")) return CIRCUIT_SPECS.shanghai;
  if (str.includes("miami")) return CIRCUIT_SPECS.miami;
  if (str.includes("imola") || str.includes("romagna")) return CIRCUIT_SPECS.imola;
  if (str.includes("monaco")) return CIRCUIT_SPECS.monaco;
  if (str.includes("gilles") || str.includes("villeneuve") || str.includes("canada") || str.includes("montreal")) return CIRCUIT_SPECS.gilles;
  if (str.includes("catalunya") || str.includes("barcelona") || str.includes("spain")) return CIRCUIT_SPECS.catalunya;
  if (str.includes("red bull") || str.includes("spielberg") || str.includes("austria")) return CIRCUIT_SPECS.red_bull;
  if (str.includes("silverstone") || str.includes("british") || str.includes("uk")) return CIRCUIT_SPECS.silverstone;
  if (str.includes("hungaroring") || str.includes("budapest") || str.includes("hungary")) return CIRCUIT_SPECS.hungaroring;
  if (str.includes("spa-francorchamps") || str.includes("spa") || str.includes("belgium")) return CIRCUIT_SPECS.spa;
  if (str.includes("zandvoort") || str.includes("dutch") || str.includes("netherlands")) return CIRCUIT_SPECS.zandvoort;
  if (str.includes("monza") || str.includes("italy")) return CIRCUIT_SPECS.monza;
  if (str.includes("baku") || str.includes("azerbaijan")) return CIRCUIT_SPECS.baku;
  if (str.includes("marina bay") || str.includes("singapore")) return CIRCUIT_SPECS.marina_bay;
  if (str.includes("americas") || str.includes("austin") || str.includes("united states") || str.includes("usa")) return CIRCUIT_SPECS.americas;
  if (str.includes("rodríguez") || str.includes("hermanos") || str.includes("mexico")) return CIRCUIT_SPECS.hermanos;
  if (str.includes("interlagos") || str.includes("são paulo") || str.includes("brazil")) return CIRCUIT_SPECS.interlagos;
  if (str.includes("las vegas") || str.includes("vegas")) return CIRCUIT_SPECS.vegas;
  if (str.includes("lusail") || str.includes("qatar")) return CIRCUIT_SPECS.lusail;
  if (str.includes("yas marina") || str.includes("abu dhabi")) return CIRCUIT_SPECS.yas_marina;

  return { length: "—", laps: "—" };
};

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

/* Countdown digit card */
const DigitCard = ({ label, value }) => (
  <div
    style={{
      background: "rgba(0, 0, 0, 0.6)",
      border: "1px solid rgba(0, 229, 200, 0.15)",
      borderRadius: "var(--shape-md)",
      padding: "0.75rem 0.5rem",
      textAlign: "center",
      backdropFilter: "blur(12px)",
      position: "relative",
      overflow: "hidden",
      minWidth: "3.5rem",
    }}
  >
    {/* Corner marks */}
    <span
      style={{
        position: "absolute",
        top: 3,
        left: 3,
        width: 6,
        height: 6,
        borderTop: "1px solid rgba(0, 229, 200, 0.4)",
        borderLeft: "1px solid rgba(0, 229, 200, 0.4)",
      }}
    />
    <span
      style={{
        position: "absolute",
        bottom: 3,
        right: 3,
        width: 6,
        height: 6,
        borderBottom: "1px solid rgba(0, 229, 200, 0.4)",
        borderRight: "1px solid rgba(0, 229, 200, 0.4)",
      }}
    />
    <div
      style={{
        fontFamily: "var(--font-mono)",
        fontWeight: 700,
        fontSize: "clamp(1.5rem, 4vw, 2.5rem)",
        color: "#fff",
        lineHeight: 1,
        letterSpacing: "-0.02em",
      }}
    >
      {value}
    </div>
    <div
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: "0.55rem",
        fontWeight: 600,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: "var(--md-primary)",
        marginTop: "0.3rem",
      }}
    >
      {label}
    </div>
  </div>
);

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
      <div
        style={{
          background: "var(--md-surface-container)",
          border: "1px solid var(--md-outline-variant)",
          borderRadius: "var(--shape-lg)",
          padding: "1.5rem",
          fontFamily: "var(--font-mono)",
          fontSize: "0.7rem",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--md-on-surface-variant)",
        }}
      >
        NO UPCOMING EVENTS IN SCHEDULE
      </div>
    );
  }

  const raceName = (nextEvent.summary || "Next Session").replace("RN365 ", "");
  const specs = getSpecs(nextEvent.meeting_name || nextEvent.summary, nextEvent.circuitName);

  return (
    <HeroSurface
      circuitName={nextEvent.circuitName || nextEvent.summary}
      location={nextEvent.location}
      eager3D
      minHeight="min-h-[320px] sm:min-h-[380px]"
    >
      {/* Top badges */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.5rem", marginBottom: "0.875rem" }}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.375rem",
            fontFamily: "var(--font-mono)",
            fontSize: "0.6rem",
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--status-green)",
            background: "rgba(34, 197, 94, 0.08)",
            border: "1px solid rgba(34, 197, 94, 0.25)",
            borderRadius: "var(--shape-sm)",
            padding: "0.25rem 0.625rem",
          }}
        >
          <span className="status-dot-live" />
          NEXT RACE WEEKEND
        </span>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.3rem",
            fontFamily: "var(--font-mono)",
            fontSize: "0.6rem",
            fontWeight: 600,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--md-primary)",
            background: "rgba(0, 229, 200, 0.06)",
            border: "1px solid rgba(0, 229, 200, 0.2)",
            borderRadius: "var(--shape-sm)",
            padding: "0.25rem 0.625rem",
          }}
        >
          DIST: {specs.length} · LAPS: {specs.laps}
        </span>
      </div>

      {/* Race name */}
      <h2
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: "clamp(1.5rem, 5vw, 2.75rem)",
          color: "#fff",
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          lineHeight: 1.1,
          margin: "0 0 0.5rem",
          maxWidth: "28rem",
          textShadow: "0 2px 20px rgba(0,0,0,0.6)",
        }}
      >
        {raceName}
      </h2>

      {/* Location + date row */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "1rem",
          marginBottom: "1.25rem",
        }}
      >
        {nextEvent.location && (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.35rem",
              fontFamily: "var(--font-mono)",
              fontSize: "0.68rem",
              letterSpacing: "0.06em",
              color: "rgba(255, 255, 255, 0.65)",
            }}
          >
            <MapPin size={11} style={{ color: "var(--md-primary)", flexShrink: 0 }} />
            {nextEvent.location}
          </span>
        )}
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.35rem",
            fontFamily: "var(--font-mono)",
            fontSize: "0.68rem",
            letterSpacing: "0.06em",
            color: "rgba(255, 255, 255, 0.65)",
          }}
        >
          <Calendar size={11} style={{ color: "var(--md-primary)", flexShrink: 0 }} />
          {nextEvent.date.toLocaleString([], {
            weekday: "short",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>

      {/* Countdown cards */}
      {countdown && (
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <DigitCard label="DAYS" value={String(countdown.days).padStart(2, "0")} />
          <DigitCard label="HOURS" value={String(countdown.hours).padStart(2, "0")} />
          <DigitCard label="MINS" value={String(countdown.minutes).padStart(2, "0")} />
          <DigitCard label="SECS" value={String(countdown.seconds).padStart(2, "0")} />
        </div>
      )}
    </HeroSurface>
  );
};

export default HomeCountdownHero;
