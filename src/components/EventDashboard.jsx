import React, { Suspense, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Activity, AlertTriangle, CheckCircle2 } from "lucide-react";

import HomeCountdownHero from "./HomeCountdownHero";
import HomeScheduleSection from "./HomeScheduleSection";
import SectionHeader from "./ui/SectionHeader";
import Surface from "./ui/Surface";
import DataStatusBanner from "./ui/DataStatusBanner";
import ChampionshipStrip from "./ui/ChampionshipStrip";
import DriverCard from "./ui/DriverCard";
import Button from "./ui/Button";
import WeekendSummary from "./Common/WeekendSummary";
import { useDriverRegistry } from "../common/drivers/useDriverRegistry";
import { usePositions } from "./Drivers/usePositions";
import { useRevealOnScroll } from "../hooks/useRevealOnScroll";
import {
  getLatestSessionFromPositions,
  getLatestPositionsForDrivers,
  mergeDriversWithPositions,
} from "../common/utils/dataProcessing";

const News = React.lazy(() => import("./News/News"));

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

/* ── stat tile ─────────────────────────────────────────────── */
const StatRow = ({ label, value, accent }) => (
  <div style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0.5rem 0",
    borderBottom: "1px solid rgba(255,255,255,0.04)",
  }}>
    <span style={{
      fontFamily: "var(--font-mono)",
      fontSize: "0.6rem",
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      color: "var(--md-on-surface-variant)",
    }}>
      {label}
    </span>
    <span style={{
      fontFamily: "var(--font-mono)",
      fontSize: "0.68rem",
      fontWeight: 700,
      letterSpacing: "0.02em",
      color: accent || "var(--md-on-surface)",
    }}>
      {value}
    </span>
  </div>
);

/* ── race control log entry ─────────────────────────────────── */
const LogEntry = ({ tag, tagColor, message, time }) => (
  <div style={{
    display: "flex",
    alignItems: "center",
    gap: "0.625rem",
    padding: "0.45rem 0.625rem",
    background: "rgba(0,0,0,0.3)",
    border: "1px solid rgba(255,255,255,0.04)",
    borderRadius: "var(--shape-xs)",
    marginBottom: "0.375rem",
  }}>
    <span style={{
      fontFamily: "var(--font-mono)",
      fontSize: "0.58rem",
      fontWeight: 700,
      color: tagColor,
      letterSpacing: "0.04em",
      flexShrink: 0,
    }}>
      {tag}
    </span>
    <span style={{
      flex: 1,
      fontFamily: "var(--font-mono)",
      fontSize: "0.6rem",
      color: "var(--md-on-surface)",
      letterSpacing: "0.02em",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    }}>
      {message}
    </span>
    <span style={{
      fontFamily: "var(--font-mono)",
      fontSize: "0.55rem",
      color: "var(--md-on-surface-variant)",
      letterSpacing: "0.04em",
      flexShrink: 0,
    }}>
      {time}
    </span>
  </div>
);

/* ── TechnicalPanel ─────────────────────────────────────────── */
const PanelHeader = ({ dot, dotColor = "var(--status-drs)", title, badge, badgeColor }) => (
  <div style={{
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "0.75rem",
    paddingBottom: "0.5rem",
    borderBottom: "1px solid var(--md-outline-variant)",
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
      {dot && (
        <span style={{
          width: 6, height: 6, borderRadius: "50%",
          background: dotColor,
          boxShadow: `0 0 6px ${dotColor}`,
          animation: "pulse-glow 2s infinite",
          flexShrink: 0,
        }} />
      )}
      <span style={{
        fontFamily: "var(--font-display)",
        fontSize: "0.75rem",
        fontWeight: 700,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        color: "var(--md-on-surface)",
      }}>
        {title}
      </span>
    </div>
    {badge && (
      <span style={{
        fontFamily: "var(--font-mono)",
        fontSize: "0.55rem",
        fontWeight: 700,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        padding: "0.15rem 0.4rem",
        borderRadius: "var(--shape-xs)",
        background: "rgba(34,197,94,0.08)",
        color: "var(--status-green)",
        border: "1px solid rgba(34,197,94,0.2)",
      }}>
        {badge}
      </span>
    )}
  </div>
);

export const EventDashboard = ({
  eventsData,
  eventsMeta,
  eventsLoading,
  eventsIsError,
  eventsError,
  year,
}) => {
  const navigate = useNavigate();

  const eventsBannerMeta = {
    ...eventsMeta,
    warning:
      eventsMeta?.warning ||
      (eventsIsError ? eventsError?.message || "Some event data is unavailable." : null),
  };

  const { data: seasonDrivers } = useDriverRegistry(null, null, { year, enabled: Boolean(year) });
  const leaders = useMemo(() => {
    const roster = Array.isArray(seasonDrivers) ? seasonDrivers : [];
    return roster.filter((d) => d.season?.position).slice(0, 3);
  }, [seasonDrivers]);

  if (eventsLoading) {
    return (
      <div className="app-shell py-8">
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
          LOADING EVENTS...
        </div>
      </div>
    );
  }

  if (eventsIsError && (!eventsData || eventsData.length === 0)) {
    return (
      <div className="app-shell py-8">
        <div style={{
          padding: "2rem",
          textAlign: "center",
          fontFamily: "var(--font-mono)",
          fontSize: "0.7rem",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--danger)",
          background: "rgba(239,68,68,0.05)",
          border: "1px solid rgba(239,68,68,0.2)",
          borderRadius: "var(--shape-md)",
        }}>
          {eventsError?.message || "FAILED TO LOAD EVENTS"}
        </div>
      </div>
    );
  }

  const noEvents = !eventsLoading && (!eventsData || eventsData.length === 0);
  if (noEvents) {
    return (
      <div className="app-shell py-8">
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
          AWAITING SEASON START
        </div>
      </div>
    );
  }

  const now = new Date();
  const sortedEvents = Array.isArray(eventsData)
    ? [...eventsData].sort((a, b) => new Date(a?.date_start || 0) - new Date(b?.date_start || 0))
    : [];
  const completedEvents = sortedEvents.filter(
    (event) => event?.date_start && new Date(event.date_start) <= now
  );
  const upcomingEvents = sortedEvents.filter(
    (event) => event?.date_start && new Date(event.date_start) > now
  );
  const latestCompletedEvent = completedEvents[completedEvents.length - 1] || null;
  const hasSeasonStarted = completedEvents.length > 0;
  const hasUpcomingEvent = upcomingEvents.length > 0;

  return (
    <HomeDashboardContent
      eventsBannerMeta={eventsBannerMeta}
      hasUpcomingEvent={hasUpcomingEvent}
      eventsData={eventsData}
      hasSeasonStarted={hasSeasonStarted}
      latestCompletedEvent={latestCompletedEvent}
      leaders={leaders}
      year={year}
      navigate={navigate}
    />
  );
};

const HomeDashboardContent = ({
  eventsBannerMeta,
  hasUpcomingEvent,
  eventsData,
  hasSeasonStarted,
  latestCompletedEvent,
  leaders,
  year,
  navigate,
}) => {
  const podiumReveal = useRevealOnScroll();
  const newsReveal = useRevealOnScroll();

  const eventYear = latestCompletedEvent?.date_start
    ? new Date(latestCompletedEvent.date_start).getFullYear()
    : year;

  const targetEvent = latestCompletedEvent || (Array.isArray(eventsData) ? eventsData[0] : null);
  const specs = getSpecs(targetEvent?.meeting_name, targetEvent?.circuit_short_name);

  const { data: positionsData } = usePositions(
    latestCompletedEvent?.meeting_key,
    null,
    null,
    { enabled: Boolean(latestCompletedEvent?.meeting_key), year: eventYear }
  );

  const latestSession = useMemo(() => {
    if (!positionsData?.length || !latestCompletedEvent?.meeting_key) return null;
    return getLatestSessionFromPositions(positionsData, latestCompletedEvent.meeting_key);
  }, [positionsData, latestCompletedEvent]);

  const { data: sessionDrivers } = useDriverRegistry(
    latestCompletedEvent?.meeting_key || null,
    latestSession?.session_key || null,
    { year: eventYear }
  );

  const driversWithPositions = useMemo(() => {
    if (!sessionDrivers?.length || !positionsData?.length || !latestSession) return [];
    const positions = getLatestPositionsForDrivers(positionsData, latestSession.session_key);
    return mergeDriversWithPositions(sessionDrivers, positions);
  }, [sessionDrivers, positionsData, latestSession]);

  const podium = useMemo(() => {
    return driversWithPositions.slice(0, 3);
  }, [driversWithPositions]);

  return (
    <div className="app-shell py-4 lg:py-6" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <DataStatusBanner meta={eventsBannerMeta} />
      {hasUpcomingEvent && <HomeCountdownHero eventsData={eventsData} />}
      <HomeScheduleSection eventsData={eventsData} />

      {targetEvent && (
        <WeekendSummary event={targetEvent} positions={driversWithPositions} />
      )}

      {/* Technical panels row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.75fr", gap: "1rem" }}
           className="grid-cols-1 lg:grid-cols-[1fr_1.75fr]">
        {/* Circuit Specs */}
        <Surface tier="container-high" style={{ padding: "1rem" }}>
          <PanelHeader title="CIRCUIT SPECS" />
          <div>
            <StatRow label="CIRCUIT NAME" value={targetEvent?.circuit_short_name || "—"} />
            <StatRow label="LOCATION" value={targetEvent?.location || "—"} />
            <StatRow label="CIRCUIT LENGTH" value={specs.length} />
            <StatRow label="TOTAL LAPS" value={specs.laps} accent="var(--md-primary)" />
          </div>
        </Surface>

        {/* Race Control Feed */}
        <Surface tier="container-high" style={{ padding: "1rem" }}>
          <PanelHeader
            title="EVENT ACTIVITY FEED"
          />
          <LogEntry tag="[RACE CTRL]" tagColor="var(--status-green)" message="TRACK CONDITION: DRY · SESSION COMPLETE" time="10:00:00" />
          <LogEntry tag="[RACE CTRL]" tagColor="var(--status-green)" message="GREEN FLAG - ALL SECTORS CLEAR" time="10:02:15" />
          <LogEntry tag="[RACE CTRL]" tagColor="var(--md-primary)" message="FINAL SECTOR CLASSIFICATION LOCKED" time="10:05:40" />
        </Surface>
      </div>

      {/* Championship + Podium row */}
      {hasSeasonStarted && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.7fr", gap: "1rem" }}
             className="grid-cols-1 lg:grid-cols-[1fr_1.7fr]">
          <ChampionshipStrip leaders={leaders} title="Championship Top 3" />
          <Surface
            tier="container-high"
            style={{ padding: "1rem" }}
            className={podiumReveal.className}
            ref={podiumReveal.ref}
          >
            <SectionHeader
              title="Latest Race Podium"
              subtitle={latestCompletedEvent?.meeting_name}
              compact
              actions={
                <Button
                  variant="outlined"
                  size="sm"
                  onClick={() => navigate(`/event/${latestCompletedEvent.meeting_key}`)}
                >
                  View Weekend
                </Button>
              }
            />
            <div style={{ marginTop: "0.75rem", display: "flex", flexDirection: "column", gap: "0.375rem" }}>
              {podium.length > 0 ? (
                podium.map((driver) => (
                  <DriverCard
                    key={driver.driver_number}
                    driver={driver}
                    position={driver.position}
                    compact
                  />
                ))
              ) : (
                <p style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.65rem",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--md-on-surface-variant)",
                }}>
                  PODIUM DATA LOADING...
                </p>
              )}
            </div>
          </Surface>
        </div>
      )}

      {/* News */}
      <Surface
        tier="container"
        style={{ padding: "1rem" }}
        className={newsReveal.className}
        ref={newsReveal.ref}
      >
        <Suspense
          fallback={
            <div style={{
              padding: "2rem",
              textAlign: "center",
              fontFamily: "var(--font-mono)",
              fontSize: "0.65rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--md-on-surface-variant)",
            }}>
              LOADING NEWS FEED...
            </div>
          }
        >
          <News layout="carousel" showHeader={false} />
        </Suspense>
      </Surface>
    </div>
  );
};
