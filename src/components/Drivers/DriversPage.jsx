import React, { useMemo, useState } from "react";
import { Users, Flag, Trophy, LayoutGrid, List } from "lucide-react";

import { useEvents } from "../Events/useEvents";
import { useDriverRegistry } from "../../common/drivers/useDriverRegistry";
import { useAnimatedNumber } from "../../hooks/useAnimatedNumber";
import PageShell from "../ui/PageShell";
import Surface from "../ui/Surface";
import StatusPill from "../ui/StatusPill";
import DataStatusBanner from "../ui/DataStatusBanner";
import Button from "../ui/Button";
import DriversGridView from "./DriversGridView";
import DriversListView from "./DriversListView";
import DriverDetailDrawer from "./DriverDetailDrawer";

const StatCard = ({ label, value, iconNode }) => (
  <Surface tier="container-high" className="p-4">
    <div className="flex items-center justify-between">
      <p className="md3-label-md text-[var(--md-on-surface-variant)]">{label}</p>
      {iconNode}
    </div>
    <p className="md3-headline-md mt-2 tabular-nums">{value}</p>
  </Surface>
);

const DriversPage = ({ year }) => {
  const [viewMode, setViewMode] = useState("grid");
  const [selectedDriver, setSelectedDriver] = useState(null);

  const {
    data: eventsData,
    dataMeta: eventsMeta,
    isError: eventsIsError,
    error: eventsError,
  } = useEvents(year, null);

  const {
    data: driversData,
    dataMeta: driversMeta,
    isLoading: driversLoading,
    isError: driversIsError,
    error: driversError,
  } = useDriverRegistry(null, null, { year });

  const { latestEvent, isUpcomingEvent } = useMemo(() => {
    if (!Array.isArray(eventsData) || !eventsData.length) {
      return { latestEvent: null, isUpcomingEvent: false };
    }
    const now = new Date();
    const completed = eventsData
      .filter((event) => event?.date_start && new Date(event.date_start) <= now)
      .sort((a, b) => new Date(b.date_start) - new Date(a.date_start));
    if (completed.length > 0) return { latestEvent: completed[0], isUpcomingEvent: false };
    const upcoming = eventsData
      .filter((event) => event?.date_start && new Date(event.date_start) > now)
      .sort((a, b) => new Date(a.date_start) - new Date(b.date_start));
    return { latestEvent: upcoming[0] || null, isUpcomingEvent: true };
  }, [eventsData]);

  const roster = Array.isArray(driversData) ? driversData : [];
  const teamsCount = useMemo(
    () => new Set(roster.map((d) => d?.team_name).filter(Boolean)).size,
    [roster]
  );
  const championshipLeader = useMemo(
    () => roster.find((d) => Number(d?.season?.position) === 1) || roster[0] || null,
    [roster]
  );

  const animatedDriverCount = useAnimatedNumber(roster.length || 0);
  const animatedTeamCount = useAnimatedNumber(teamsCount || 0);
  const animatedLeaderPoints = useAnimatedNumber(championshipLeader?.season?.points ?? 0);

  const dataBannerMeta = useMemo(() => ({
    isStale: Boolean(driversMeta?.isStale || eventsMeta?.isStale),
    warning:
      driversMeta?.warning ||
      eventsMeta?.warning ||
      (driversIsError ? driversError?.message : null) ||
      (eventsIsError ? eventsError?.message : null),
    source: driversMeta?.source || eventsMeta?.source || null,
    fetchedAt: driversMeta?.fetchedAt || eventsMeta?.fetchedAt || null,
  }), [driversError, driversIsError, driversMeta, eventsError, eventsIsError, eventsMeta]);

  return (
    <PageShell
      title="Drivers"
      subtitle={`Season ${year} roster and championship form`}
      actions={(
        <>
          <StatusPill tone="neutral">Season {year}</StatusPill>
          {latestEvent && (
            <StatusPill tone={isUpcomingEvent ? "warn" : "live"}>
              {isUpcomingEvent ? "Next" : "Latest"}: {latestEvent.meeting_name}
            </StatusPill>
          )}
          <div className="flex gap-1">
            <Button
              variant={viewMode === "grid" ? "tonal" : "text"}
              size="sm"
              onClick={() => setViewMode("grid")}
              aria-label="Grid view"
            >
              <LayoutGrid size={14} />
            </Button>
            <Button
              variant={viewMode === "list" ? "tonal" : "text"}
              size="sm"
              onClick={() => setViewMode("list")}
              aria-label="List view"
            >
              <List size={14} />
            </Button>
          </div>
        </>
      )}
    >
      <DataStatusBanner meta={dataBannerMeta} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <StatCard
          label="Active Drivers"
          value={driversLoading ? "…" : animatedDriverCount}
          iconNode={<Users size={18} className="text-[var(--md-on-surface-variant)]" />}
        />
        <StatCard
          label="Teams"
          value={driversLoading ? "…" : animatedTeamCount}
          iconNode={<Flag size={18} className="text-[var(--md-on-surface-variant)]" />}
        />
        <Surface tier="container-high" className="p-4">
          <div className="flex items-center justify-between">
            <p className="md3-label-md text-[var(--md-on-surface-variant)]">Leader</p>
            <Trophy size={18} className="text-[var(--md-on-surface-variant)]" />
          </div>
          <p className="md3-title-lg mt-2 truncate">
            {championshipLeader?.full_name || (driversLoading ? "…" : "N/A")}
          </p>
          <p className="md3-body-md text-[var(--md-on-surface-variant)] mt-1 tabular-nums">
            {championshipLeader ? `${animatedLeaderPoints} pts` : ""}
          </p>
        </Surface>
      </div>

      <Surface tier="container" className="p-3 sm:p-4 md3-content-auto">
        {driversIsError && !roster.length ? (
          <p className="text-center py-8 text-[var(--danger)]">{driversError?.message || "Unable to load drivers."}</p>
        ) : viewMode === "grid" ? (
          <DriversGridView drivers={roster} loading={driversLoading} onSelect={setSelectedDriver} />
        ) : (
          <DriversListView drivers={roster} loading={driversLoading} onSelect={setSelectedDriver} />
        )}
      </Surface>

      <DriverDetailDrawer driver={selectedDriver} onClose={() => setSelectedDriver(null)} />
    </PageShell>
  );
};

export default DriversPage;
