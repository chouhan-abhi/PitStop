import React, { useMemo, useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Calendar, CheckCircle2, Clock3 } from "lucide-react";

import { useEvents } from "./Events/useEvents";
import { usePositions } from "./Drivers/usePositions";
import { useDriverRegistry } from "../common/drivers/useDriverRegistry";
import { getLatestSessionFromPositions, getLatestPositionsForDrivers } from "../common/utils/dataProcessing";
import { getTeamColorBorder } from "../common/utils/colors";
import { formatDate } from "../common/utils/dataProcessing";
import HomeCountdownHero from "./HomeCountdownHero";
import PageShell from "./ui/PageShell";
import DataStatusBanner from "./ui/DataStatusBanner";

// Driver CDN headshot mappings
const DRIVER_IMAGES = {
  VER: "https://www.formula1.com/content/dam/fom-website/drivers/M/MAXVER01_Max_Verstappen/maxver01.png",
  HAM: "https://www.formula1.com/content/dam/fom-website/drivers/L/LEWHAM01_Lewis_Hamilton/lewham01.png",
  LEC: "https://www.formula1.com/content/dam/fom-website/drivers/C/CHALEC01_Charles_Leclerc/chalec01.png",
  NOR: "https://www.formula1.com/content/dam/fom-website/drivers/L/LANNOR01_Lando_Norris/lannor01.png",
  ALO: "https://www.formula1.com/content/dam/fom-website/drivers/F/FERALO01_Fernando_Alonso/feralo01.png",
  PIA: "https://www.formula1.com/content/dam/fom-website/drivers/O/OSCPIA01_Oscar_Piastri/oscpia01.png",
  PER: "https://www.formula1.com/content/dam/fom-website/drivers/S/SERPER01_Sergio_Perez/serper01.png",
  SAI: "https://www.formula1.com/content/dam/fom-website/drivers/C/CARSAI01_Carlos_Sainz/carsai01.png",
  RUS: "https://www.formula1.com/content/dam/fom-website/drivers/G/GEORUS01_George_Russell/georus01.png",
  TSU: "https://www.formula1.com/content/dam/fom-website/drivers/Y/YAUTSU01_Yuki_Tsunoda/yautsu01.png",
  OCO: "https://www.formula1.com/content/dam/fom-website/drivers/E/ESTOCO01_Esteban_Ocon/estoco01.png",
  GAS: "https://www.formula1.com/content/dam/fom-website/drivers/P/PIEGAS01_Pierre_Gasly/piegas01.png",
  ALB: "https://www.formula1.com/content/dam/fom-website/drivers/A/ALEALB01_Alexander_Albon/alealb01.png",
  HUL: "https://www.formula1.com/content/dam/fom-website/drivers/N/NICHUL01_Nico_Hulkenberg/nichul01.png",
  STR: "https://www.formula1.com/content/dam/fom-website/drivers/L/LANSTR01_Lance_Stroll/lanstr01.png",
  MAG: "https://www.formula1.com/content/dam/fom-website/drivers/K/KEVMAG01_Kevin_Magnussen/kevmag01.png",
  RIC: "https://www.formula1.com/content/dam/fom-website/drivers/D/DANRIC01_Daniel_Ricciardo/danric01.png",
  BOT: "https://www.formula1.com/content/dam/fom-website/drivers/V/VALBOT01_Valtteri_Bottas/valbot01.png",
  ZHO: "https://www.formula1.com/content/dam/fom-website/drivers/Z/ZHOGUA01_Zhou_Guanyu/zhogua01.png",
  SAR: "https://www.formula1.com/content/dam/fom-website/drivers/L/LOGSAR01_Logan_Sargeant/logsar01.png",
  COL: "https://www.formula1.com/content/dam/fom-website/drivers/F/FRACOL01_Franco_Colapinto/fracol01.png",
  LAW: "https://www.formula1.com/content/dam/fom-website/drivers/L/LIALAW01_Liam_Lawson/lialaw01.png",
};

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

const FILTERS = [
  { key: "all",       label: "ALL RACES" },
  { key: "completed", label: "COMPLETED" },
  { key: "upcoming",  label: "UPCOMING" },
];

const CHUNK_SIZE = 8;

/* ── Filter Bar ───────────────────────────────────────────── */
const FilterBar = ({ filter, setFilter, counts }) => (
  <div style={{ display: "flex", gap: "0.25rem" }}>
    {FILTERS.map((f) => {
      const active = filter === f.key;
      return (
        <button
          key={f.key}
          type="button"
          onClick={() => setFilter(f.key)}
          style={{
            padding: "0.4rem 0.8rem",
            fontFamily: "var(--font-mono)",
            fontSize: "0.6rem",
            fontWeight: active ? 700 : 500,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            borderRadius: "var(--shape-xs)",
            border: active
              ? "1px solid var(--md-primary)"
              : "1px solid rgba(255, 255, 255, 0.08)",
            background: active
              ? "rgba(0, 229, 200, 0.08)"
              : "var(--md-surface-container-high)",
            color: active ? "var(--md-primary)" : "rgba(255, 255, 255, 0.8)",
            cursor: "pointer",
            transition: "all 100ms ease",
            outline: "none",
          }}
        >
          {f.label}
          {counts[f.key] !== undefined && (
            <span style={{ marginLeft: "0.4rem", opacity: 0.5, fontWeight: 400 }}>
              {counts[f.key]}
            </span>
          )}
        </button>
      );
    })}
  </div>
);

/* ── Season Stats Bar ─────────────────────────────────────── */
const SeasonStats = ({ total, completed, upcoming, year }) => {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
      gap: "1px",
      background: "rgba(255, 255, 255, 0.06)",
      border: "1px solid rgba(255, 255, 255, 0.06)",
      borderRadius: "var(--shape-md)",
      overflow: "hidden",
      marginBottom: "1.5rem",
    }}>
      {[
        { label: "SEASON", value: year },
        { label: "TOTAL ROUNDS", value: total },
        { label: "COMPLETED", value: completed, color: "var(--status-green)" },
        { label: "UPCOMING", value: upcoming, color: "var(--warning)" },
        { label: "SEASON PROGRESS", value: `${pct}%`, color: "var(--md-primary)" },
      ].map((item) => (
        <div
          key={item.label}
          style={{
            background: "var(--md-surface-container)",
            padding: "0.75rem 1rem",
          }}
        >
          <div style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.55rem",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--md-on-surface-variant)",
            marginBottom: "0.3rem",
          }}>
            {item.label}
          </div>
          <div style={{
            fontFamily: "var(--font-mono)",
            fontSize: "1.25rem",
            fontWeight: 700,
            letterSpacing: "-0.01em",
            color: item.color || "#fff",
            lineHeight: 1,
          }}>
            {item.value}
          </div>
        </div>
      ))}
    </div>
  );
};

/* ── Grand Prix Card ──────────────────────────────────────── */
const GrandPrixCard = ({ event, year, navigate }) => {
  const [hovered, setHovered] = useState(false);
  const eventYear = event?.date_start ? new Date(event.date_start).getFullYear() : year;
  const isComplete = event.status === "complete";
  const isUpcoming = event.status === "upcoming";

  const { data: positions } = usePositions(event.meeting_key, null, null, {
    enabled: isComplete,
    year: eventYear,
  });

  const latestSession = useMemo(() => {
    if (!positions?.length) return null;
    return getLatestSessionFromPositions(positions, event.meeting_key);
  }, [positions, event.meeting_key]);

  const { data: drivers } = useDriverRegistry(event.meeting_key, latestSession?.session_key, {
    enabled: Boolean(latestSession?.session_key),
    year: eventYear,
  });

  const winner = useMemo(() => {
    if (!positions?.length || !latestSession) return null;
    const latest = getLatestPositionsForDrivers(positions, latestSession.session_key);
    const p1 = latest.find((p) => (p.finalPosition ?? p.position) === 1);
    if (!p1) return null;
    const roster = Array.isArray(drivers) ? drivers : [];
    return roster.find((d) => Number(d.driver_number) === Number(p1.driver_number)) || p1;
  }, [positions, latestSession, drivers]);

  const teamColor = winner?.team_colour ? getTeamColorBorder(winner.team_colour) : "rgba(255, 255, 255, 0.08)";
  const winnerAcronym = winner?.name_acronym || "";
  const headshotUrl = DRIVER_IMAGES[winnerAcronym] || winner?.headshot_url || "";
  const dateFormatted = event.date_start ? formatDate(event.date_start) : "TBD";
  const specs = getSpecs(event.meeting_name, event.circuit_short_name);

  return (
    <div
      onClick={() => navigate(`/event/${event.meeting_key}`)}
      style={{
        background: "var(--md-surface-container)",
        border: `1px solid ${hovered ? (isComplete ? teamColor : "var(--md-primary)") : "rgba(255, 255, 255, 0.08)"}`,
        borderTop: `3.5px solid ${isComplete ? teamColor : "rgba(255, 255, 255, 0.15)"}`,
        borderRadius: "var(--shape-md)",
        padding: "1.25rem",
        position: "relative",
        overflow: "hidden",
        height: "190px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        cursor: "pointer",
        transition: "all 150ms ease",
        boxShadow: hovered ? `0 4px 20px rgba(0, 0, 0, 0.5), 0 0 12px ${isComplete ? teamColor : "var(--md-primary)"}15` : "none",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Faded Driver Headshot Watermark Background */}
      {isComplete && headshotUrl && (
        <div style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          width: "120px",
          height: "100%",
          zIndex: 0,
          pointerEvents: "none",
          overflow: "hidden",
        }}>
          <img
            src={headshotUrl}
            alt=""
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: hovered ? 0.14 : 0.08,
              transition: "opacity 150ms ease",
              WebkitMaskImage: "linear-gradient(to left, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 100%)",
              maskImage: "linear-gradient(to left, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 100%)",
            }}
          />
        </div>
      )}

      {/* Upcoming F1 Car Watermark */}
      {isUpcoming && (
        <div style={{
          position: "absolute",
          bottom: "-5px",
          right: "-10px",
          width: "100px",
          height: "100px",
          zIndex: 0,
          pointerEvents: "none",
          opacity: hovered ? 0.05 : 0.03,
          transition: "opacity 150ms ease",
          transform: "rotate(-10deg)",
        }}>
          <span style={{ fontSize: "5rem", userSelect: "none" }}>🏎️</span>
        </div>
      )}

      {/* Header Area */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative", zIndex: 1 }}>
        <span style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.6rem",
          fontWeight: 700,
          letterSpacing: "0.1em",
          color: "var(--md-primary)",
          background: "rgba(0, 229, 200, 0.06)",
          border: "1px solid rgba(0, 229, 200, 0.15)",
          borderRadius: "var(--shape-xs)",
          padding: "0.15rem 0.45rem",
        }}>
          ROUND {String(event.round).padStart(2, "0")}
        </span>

        <span style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.25rem",
          fontFamily: "var(--font-mono)",
          fontSize: "0.58rem",
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          padding: "0.2rem 0.45rem",
          borderRadius: "var(--shape-xs)",
          ...(isComplete
            ? { background: "rgba(34, 197, 94, 0.08)", color: "var(--status-green)", border: "1px solid rgba(34, 197, 94, 0.2)" }
            : { background: "rgba(245, 158, 11, 0.08)", color: "var(--warning)", border: "1px solid rgba(245, 158, 11, 0.2)" }),
        }}>
          {isComplete ? (
            <><CheckCircle2 size={10} style={{ color: "var(--status-green)" }} /> DONE</>
          ) : (
            <><Clock3 size={10} style={{ color: "var(--warning)" }} /> UPCOMING</>
          )}
        </span>
      </div>

      {/* Grand Prix Details */}
      <div style={{ margin: "0.85rem 0 auto 0", position: "relative", zIndex: 1 }}>
        <h3 style={{
          fontFamily: "var(--font-display)",
          fontSize: "0.95rem",
          fontWeight: 700,
          color: "#fff",
          textTransform: "uppercase",
          lineHeight: 1.2,
          margin: 0,
          letterSpacing: "0.02em",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}>
          {event.meeting_name}
        </h3>

        <p style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.6rem",
          color: "var(--md-on-surface-variant)",
          marginTop: "0.35rem",
          letterSpacing: "0.03em",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          display: "flex",
          alignItems: "center",
          gap: "0.25rem",
        }}>
          <MapPin size={10} style={{ color: "var(--md-primary)", opacity: 0.7 }} />
          {event.circuit_short_name || "Circuit"} · {event.location || event.country_name || "Location"}
        </p>

        <p style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.55rem",
          color: "var(--md-primary)",
          opacity: 0.85,
          marginTop: "0.25rem",
          letterSpacing: "0.05em",
        }}>
          DIST: {specs.length} · LAPS: {specs.laps}
        </p>

        <p style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.58rem",
          color: "rgba(255, 255, 255, 0.45)",
          marginTop: "0.2rem",
          display: "flex",
          alignItems: "center",
          gap: "0.25rem",
        }}>
          <Calendar size={10} style={{ color: "var(--md-primary)", opacity: 0.7 }} />
          {dateFormatted}
        </p>
      </div>

      {/* Winner classification row */}
      <div style={{
        marginTop: "0.75rem",
        borderTop: "1px solid rgba(255, 255, 255, 0.05)",
        paddingTop: "0.75rem",
        position: "relative",
        zIndex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        {isComplete && winner ? (
          <div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.5rem", color: "var(--md-on-surface-variant)", letterSpacing: "0.05em" }}>
              WINNER
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "0.8rem", fontWeight: 700, color: "#fff", textTransform: "uppercase", marginTop: "0.1rem" }}>
              {winner.full_name || "Driver"}
            </div>
          </div>
        ) : (
          <div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.5rem", color: "var(--md-on-surface-variant)", letterSpacing: "0.05em" }}>
              TELEMETRY STATUS
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "0.8rem", fontWeight: 700, color: "var(--warning)", textTransform: "uppercase", marginTop: "0.1rem" }}>
              SCHEDULED
            </div>
          </div>
        )}

        <span style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.55rem",
          fontWeight: 700,
          color: hovered ? "var(--md-primary)" : "var(--md-on-surface-variant)",
          letterSpacing: "0.05em",
          transition: "color 150ms ease",
        }}>
          VIEW DETAILS →
        </span>
      </div>
    </div>
  );
};

/* ── Archives Page ────────────────────────────────────────── */
const ArchivesPage = ({ year }) => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all");
  const [visibleCount, setVisibleCount] = useState(CHUNK_SIZE);

  const sentinelRef = useRef(null);

  const {
    data: eventsData,
    dataMeta: eventsMeta,
    isLoading,
    isError,
    error,
  } = useEvents(year, null);

  const now = new Date();
  const sortedEvents = useMemo(
    () =>
      Array.isArray(eventsData)
        ? [...eventsData].sort((a, b) => new Date(a?.date_start || 0) - new Date(b?.date_start || 0))
        : [],
    [eventsData]
  );

  const eventsWithStatus = useMemo(
    () =>
      sortedEvents.map((event, index) => {
        const start = event?.date_start ? new Date(event.date_start) : null;
        const status = start && start <= now ? "complete" : "upcoming";
        return { ...event, status, round: index + 1 };
      }),
    [sortedEvents, now]
  );

  const filteredEvents = useMemo(() => {
    if (filter === "completed") return eventsWithStatus.filter((e) => e.status === "complete");
    if (filter === "upcoming")  return eventsWithStatus.filter((e) => e.status === "upcoming");
    return eventsWithStatus;
  }, [eventsWithStatus, filter]);

  const completedCount = eventsWithStatus.filter((e) => e.status === "complete").length;
  const upcomingCount  = eventsWithStatus.filter((e) => e.status === "upcoming").length;
  const nextEvent      = eventsWithStatus.find((e) => e.status === "upcoming") || null;

  // Infinite Scroll logic: select top visibleCount events
  const visibleEvents = useMemo(() => {
    return filteredEvents.slice(0, visibleCount);
  }, [filteredEvents, visibleCount]);

  // IntersectionObserver for autoloading more events on scroll to bottom
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && filteredEvents.length > visibleCount) {
        setVisibleCount((prev) => Math.min(prev + CHUNK_SIZE, filteredEvents.length));
      }
    }, {
      rootMargin: "150px", // Trigger loading slightly before reaching the bottom
    });

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    return () => observer.disconnect();
  }, [filteredEvents.length, visibleCount]);

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setVisibleCount(CHUNK_SIZE);
  };

  if (isLoading) {
    return (
      <PageShell title={null} subtitle={null}>
        <div style={{
          padding: "3rem",
          textAlign: "center",
          fontFamily: "var(--font-mono)",
          fontSize: "0.7rem",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--md-on-surface-variant)",
          background: "var(--md-surface-container)",
          border: "1px solid var(--md-outline-variant)",
          borderRadius: "var(--shape-md)",
        }}>
          LOADING SEASON TIMELINE...
        </div>
      </PageShell>
    );
  }

  if (isError) {
    return (
      <PageShell title={null} subtitle={null}>
        <div style={{
          padding: "2rem",
          textAlign: "center",
          fontFamily: "var(--font-mono)",
          fontSize: "0.7rem",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--danger)",
          background: "rgba(239, 68, 68, 0.05)",
          border: "1px solid rgba(239, 68, 68, 0.2)",
          borderRadius: "var(--shape-md)",
        }}>
          {error?.message || "FAILED TO LOAD EVENTS"}
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell title={null} subtitle={null}>
      <DataStatusBanner meta={eventsMeta} />

      {/* Redesigned Header: slanted badge, uppercase title, details description, filter controls on right */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
        flexWrap: "wrap",
        gap: "1.5rem",
        marginBottom: "2rem",
        marginTop: "0.5rem",
      }}>
        {/* Left column details */}
        <div style={{ flex: "1 1 300px" }}>
          {/* Slanted Active Roster Tag */}
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            background: "rgba(0, 229, 200, 0.08)",
            borderLeft: "3px solid var(--md-primary)",
            padding: "0.25rem 1rem 0.25rem 0.5rem",
            fontFamily: "var(--font-mono)",
            fontSize: "0.6rem",
            fontWeight: 700,
            color: "var(--md-primary)",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            clipPath: "polygon(0 0, 100% 0, calc(100% - 10px) 100%, 0 100%)",
            marginBottom: "0.6rem",
          }}>
            SEASON TIMELINE {year}
          </div>

          <h1 style={{
            fontFamily: "var(--font-display)",
            fontSize: "2.25rem",
            fontWeight: 900,
            color: "#fff",
            textTransform: "uppercase",
            lineHeight: 1.1,
            margin: 0,
            letterSpacing: "0.04em",
          }}>
            RACE ARCHIVES
          </h1>

          <p style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.8rem",
            color: "var(--md-on-surface-variant)",
            marginTop: "0.5rem",
            lineHeight: 1.5,
            maxWidth: "520px",
          }}>
            Detailed telemetry logs and historical race records for the Formula 1 championship season. Access session data, starting grids, and final classifications.
          </p>
        </div>

        {/* Right column filter tabs */}
        <FilterBar
          filter={filter}
          setFilter={handleFilterChange}
          counts={{ all: eventsWithStatus.length, completed: completedCount, upcoming: upcomingCount }}
        />
      </div>

      {/* Countdown hero if season hasn't started */}
      {completedCount === 0 && nextEvent && (
        <div style={{ marginBottom: "1.5rem" }}>
          <HomeCountdownHero eventsData={eventsData} />
        </div>
      )}

      {/* Season stats banner */}
      <SeasonStats
        year={year}
        total={eventsWithStatus.length}
        completed={completedCount}
        upcoming={upcomingCount}
      />

      {/* Grid of Grand Prix cards */}
      {filteredEvents.length === 0 ? (
        <div style={{
          padding: "3rem",
          textAlign: "center",
          fontFamily: "var(--font-mono)",
          fontSize: "0.7rem",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--md-on-surface-variant)",
          background: "var(--md-surface-container)",
          border: "1px solid var(--md-outline-variant)",
          borderRadius: "var(--shape-md)",
        }}>
          NO {filter.toUpperCase()} EVENTS FOR {year}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {visibleEvents.map((event) => (
            <GrandPrixCard
              key={event.meeting_key}
              event={event}
              year={year}
              navigate={navigate}
            />
          ))}
        </div>
      )}

      {/* Sentinel indicator at list end for autoloading */}
      {filteredEvents.length > visibleCount && (
        <div
          ref={sentinelRef}
          style={{
            padding: "1.5rem",
            textAlign: "center",
            fontFamily: "var(--font-mono)",
            fontSize: "0.65rem",
            color: "var(--md-primary)",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          LOADING TELEMETRY CHUNK...
        </div>
      )}

      {/* List End Status Footer */}
      {!isLoading && filteredEvents.length > 0 && (
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: "2rem",
          borderTop: "1px solid rgba(255, 255, 255, 0.05)",
          paddingTop: "1.25rem",
          fontFamily: "var(--font-mono)",
          fontSize: "0.65rem",
          color: "var(--md-on-surface-variant)",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
        }}>
          <div>
            DISPLAYING {visibleEvents.length} OF {filteredEvents.length} EVENTS
          </div>
          <div style={{ fontSize: "0.55rem", opacity: 0.6 }}>
            {visibleEvents.length === filteredEvents.length ? "TIMELINE COMPLETED" : "SCROLL FOR DETAILED FEED"}
          </div>
        </div>
      )}
    </PageShell>
  );
};

export default ArchivesPage;
