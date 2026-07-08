import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, ChevronRight } from "lucide-react";

import { useEvents } from "./Events/useEvents";
import { usePositions } from "./Drivers/usePositions";
import { useDriverRegistry } from "../common/drivers/useDriverRegistry";
import { getLatestSessionFromPositions, getLatestPositionsForDrivers } from "../common/utils/dataProcessing";
import HomeCountdownHero from "./HomeCountdownHero";
import PageShell from "./ui/PageShell";
import Surface from "./ui/Surface";
import StatusPill from "./ui/StatusPill";
import DataStatusBanner from "./ui/DataStatusBanner";
import DriverAvatar from "./Common/DriverAvatar";
import Button from "./ui/Button";
import { formatDate } from "../common/utils/dataProcessing";
import EmptyState from "./ui/EmptyState";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "completed", label: "Completed" },
  { key: "upcoming", label: "Upcoming" },
];

const ArchivesPage = ({ year }) => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all");
  const [expandedKey, setExpandedKey] = useState(null);

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
        let status = "upcoming";
        if (start && start <= now) status = "complete";
        return { ...event, status, round: index + 1 };
      }),
    [sortedEvents, now]
  );

  const filteredEvents = useMemo(() => {
    if (filter === "completed") return eventsWithStatus.filter((e) => e.status === "complete");
    if (filter === "upcoming") return eventsWithStatus.filter((e) => e.status === "upcoming");
    return eventsWithStatus;
  }, [eventsWithStatus, filter]);

  const nextEvent = eventsWithStatus.find((e) => e.status === "upcoming") || null;

  if (isLoading) {
    return (
      <PageShell title="Archives" subtitle="Loading season timeline...">
        <Surface tier="container" className="p-8 text-center md3-body-md text-[var(--md-on-surface-variant)]">Loading archives...</Surface>
      </PageShell>
    );
  }

  if (isError) {
    return (
      <PageShell title="Archives" subtitle="Archive feed unavailable">
        <Surface tier="container" className="p-8 text-center md3-body-md text-[var(--danger)]">{error?.message || "Failed to load events"}</Surface>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Archives"
      subtitle={`${year} season timeline`}
      actions={<StatusPill tone="neutral">{filteredEvents.length} events</StatusPill>}
    >
      <DataStatusBanner meta={eventsMeta} />

      {!eventsWithStatus.some((e) => e.status === "complete") && nextEvent && (
        <div className="space-y-4 mb-6">
          <HomeCountdownHero eventsData={eventsData} />
          <Surface tier="container" className="p-4 md3-body-md text-[var(--md-on-surface-variant)]">
            Season hasn't started. Next race:{" "}
            <span className="text-[var(--md-on-surface)] md3-title-md">{nextEvent.meeting_name}</span>
          </Surface>
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-5">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={`md3-state-layer h-8 px-4 rounded-[var(--shape-sm)] md3-label-lg transition-colors ${
              filter === f.key
                ? "bg-[var(--md-secondary-container)] text-[var(--md-on-secondary-container)]"
                : "bg-[var(--md-surface-container-high)] text-[var(--md-on-surface-variant)]"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filteredEvents.length === 0 ? (
        <EmptyState title="No events" message={`No ${filter} events for ${year}.`} />
      ) : (
        <div className="space-y-3 md3-content-auto">
          {filteredEvents.map((event) => (
            <TimelineRow
              key={event.meeting_key}
              event={event}
              year={year}
              expanded={expandedKey === event.meeting_key}
              onToggle={() =>
                setExpandedKey((prev) => (prev === event.meeting_key ? null : event.meeting_key))
              }
              onOpen={() => navigate(`/event/${event.meeting_key}`)}
            />
          ))}
        </div>
      )}
    </PageShell>
  );
};

const TimelineRow = ({ event, year, expanded, onToggle, onOpen }) => {
  const eventYear = event?.date_start ? new Date(event.date_start).getFullYear() : year;
  const { data: positions } = usePositions(event.meeting_key, null, null, {
    enabled: event.status === "complete",
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

  const statusTone = event.status === "complete" ? "neutral" : event.status === "upcoming" ? "warn" : "live";

  return (
    <Surface tier="container" interactive className="overflow-hidden p-0 md3-content-auto">
      <div className="flex items-center gap-4 p-4 sm:p-5 hover:bg-[color-mix(in_srgb,var(--md-on-surface)_4%,transparent)] transition-colors">
        <span className="md3-title-lg font-bold w-10 text-[var(--md-on-surface-variant)] tabular-nums">
          R{event.round}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="md3-title-md text-[var(--md-on-surface)] truncate">{event.meeting_name}</p>
            <StatusPill tone={statusTone}>{event.status}</StatusPill>
          </div>
          <p className="md3-body-md text-[var(--md-on-surface-variant)] mt-0.5">
            {event.circuit_short_name} · {formatDate(event.date_start)}
          </p>
        </div>
        {winner && (
          <div className="hidden sm:flex items-center gap-2">
            <DriverAvatar driver={winner} size="lg" variant="portrait" />
            <span className="md3-body-md truncate max-w-[120px]">{winner.full_name}</span>
          </div>
        )}
        <button type="button" onClick={onToggle} className="md3-state-layer p-2 rounded-[var(--shape-full)] text-[var(--md-on-surface-variant)]" aria-label="Expand">
          {expanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
        </button>
        <Button variant="tonal" size="sm" onClick={onOpen}>
          Open
        </Button>
      </div>
      {expanded && (
        <div className="px-5 pb-5 border-t border-[var(--md-outline-variant)]/40 pt-4 md3-body-md text-[var(--md-on-surface-variant)]">
          <p>{event.location}, {event.country_name}</p>
          {winner && <p className="mt-1">Winner: {winner.full_name}</p>}
        </div>
      )}
    </Surface>
  );
};

export default ArchivesPage;
