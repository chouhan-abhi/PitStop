import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, ChevronRight } from "lucide-react";

import { useEvents } from "./Events/useEvents";
import { usePositions } from "./Drivers/usePositions";
import { useDriverRegistry } from "../common/drivers/useDriverRegistry";
import { getLatestSessionFromPositions, getLatestPositionsForDrivers } from "../common/utils/dataProcessing";
import HomeCountdownHero from "./HomeCountdownHero";
import PageShell from "./ui/PageShell";
import Panel from "./ui/Panel";
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
        <Panel className="p-8 text-center text-[var(--text-secondary)]">Loading archives...</Panel>
      </PageShell>
    );
  }

  if (isError) {
    return (
      <PageShell title="Archives" subtitle="Archive feed unavailable">
        <Panel className="p-8 text-center text-[var(--danger)]">{error?.message || "Failed to load events"}</Panel>
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
          <Panel className="p-4 text-[var(--text-secondary)]">
            Season hasn't started. Next race:{" "}
            <span className="text-[var(--text-primary)] font-semibold">{nextEvent.meeting_name}</span>
          </Panel>
        </div>
      )}

      <div className="flex gap-2 mb-4">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-[var(--radius-md)] border transition-colors ${
              filter === f.key
                ? "bg-[var(--accent-red-subtle)] border-[var(--accent-red-border)] text-[var(--text-primary)]"
                : "border-[var(--border-color)] text-[var(--text-secondary)]"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filteredEvents.length === 0 ? (
        <EmptyState title="No events" message={`No ${filter} events for ${year}.`} />
      ) : (
        <div className="space-y-2">
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
    <Panel className="overflow-hidden p-0">
      <div className="flex items-center gap-3 p-3 sm:p-4 hover:bg-[var(--surface-2)]/30 transition-colors">
        <span className="display-title text-lg font-bold w-8 text-[var(--text-muted)] tabular-nums">
          R{event.round}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-[var(--text-primary)] truncate">{event.meeting_name}</p>
            <StatusPill tone={statusTone}>{event.status}</StatusPill>
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            {event.circuit_short_name} · {formatDate(event.date_start)}
          </p>
        </div>
        {winner && (
          <div className="hidden sm:flex items-center gap-2">
            <DriverAvatar driver={winner} sizeClass="w-8 h-8" textClass="text-[10px]" />
            <span className="text-xs text-[var(--text-secondary)] truncate max-w-[100px]">
              {winner.full_name}
            </span>
          </div>
        )}
        <button type="button" onClick={onToggle} className="p-1 text-[var(--text-muted)]" aria-label="Expand">
          {expanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
        </button>
        <Button variant="accent" size="sm" onClick={onOpen}>
          Open
        </Button>
      </div>
      {expanded && (
        <div className="px-4 pb-4 border-t border-[var(--border-color)] pt-3 text-sm text-[var(--text-secondary)]">
          <p>{event.location}, {event.country_name}</p>
          {winner && <p className="mt-1">Winner: {winner.full_name}</p>}
        </div>
      )}
    </Panel>
  );
};

export default ArchivesPage;
