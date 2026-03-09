import React, { useMemo, Suspense } from "react";
import { Users, Flag, Trophy } from "lucide-react";

import { useEvents } from "../Events/useEvents";
import { useLatestSessionDrivers } from "./useLatestSessionDrivers";
import PageShell from "../ui/PageShell";
import Panel from "../ui/Panel";
import StatusPill from "../ui/StatusPill";
import DataStatusBanner from "../ui/DataStatusBanner";

const SessionDriversGrid = React.lazy(() => import("./DriversGrid"));

const DriversPage = ({ year }) => {
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
  } = useLatestSessionDrivers(null, null, { year });

  const { latestEvent, isUpcomingEvent } = useMemo(() => {
    if (!Array.isArray(eventsData) || !eventsData.length) {
      return { latestEvent: null, isUpcomingEvent: false };
    }

    const now = new Date();
    const completed = eventsData
      .filter((event) => event?.date_start && new Date(event.date_start) <= now)
      .sort((a, b) => new Date(b.date_start) - new Date(a.date_start));

    if (completed.length > 0) {
      return { latestEvent: completed[0], isUpcomingEvent: false };
    }

    const upcoming = eventsData
      .filter((event) => event?.date_start && new Date(event.date_start) > now)
      .sort((a, b) => new Date(a.date_start) - new Date(b.date_start));

    return { latestEvent: upcoming[0] || null, isUpcomingEvent: true };
  }, [eventsData]);

  const roster = Array.isArray(driversData) ? driversData : [];

  const teamsCount = useMemo(
    () => new Set(roster.map((driver) => driver?.team_name).filter(Boolean)).size,
    [roster]
  );
  const championshipLeader = useMemo(
    () => roster.find((driver) => Number(driver?.season?.position) === 1) || roster[0] || null,
    [roster]
  );
  const dataBannerMeta = useMemo(() => {
    const warning =
      driversMeta?.warning ||
      eventsMeta?.warning ||
      (driversIsError ? (driversError?.message || "Some driver data is unavailable.") : null) ||
      (eventsIsError ? (eventsError?.message || "Some schedule data is unavailable.") : null);

    return {
      isStale: Boolean(driversMeta?.isStale || eventsMeta?.isStale),
      warning,
      source: driversMeta?.source || eventsMeta?.source || null,
      fetchedAt: driversMeta?.fetchedAt || eventsMeta?.fetchedAt || null,
    };
  }, [driversError?.message, driversIsError, driversMeta, eventsError?.message, eventsIsError, eventsMeta]);
  const shouldShowFatalDriversError = driversIsError && roster.length === 0;

  return (
    <PageShell
      title="Drivers Command Center"
      subtitle={`Season ${year} lineup, standings intelligence, and driver-by-driver breakdown`}
      actions={(
        <>
          <StatusPill tone="neutral">Season {year}</StatusPill>
          {latestEvent && (
            <StatusPill tone={isUpcomingEvent ? "warn" : "live"}>
              {isUpcomingEvent ? "Next Round" : "Latest Round"}: {latestEvent.meeting_name}
            </StatusPill>
          )}
        </>
      )}
    >
      <DataStatusBanner meta={dataBannerMeta} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Panel className="p-4">
          <div className="flex items-center justify-between">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)]">Active Drivers</p>
            <Users size={15} className="text-[var(--text-secondary)]" />
          </div>
          <p className="display-title text-3xl font-bold mt-2">{roster.length || (driversLoading ? "..." : 0)}</p>
        </Panel>

        <Panel className="p-4">
          <div className="flex items-center justify-between">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)]">Teams Tracked</p>
            <Flag size={15} className="text-[var(--text-secondary)]" />
          </div>
          <p className="display-title text-3xl font-bold mt-2">{teamsCount || (driversLoading ? "..." : 0)}</p>
        </Panel>

        <Panel className="p-4">
          <div className="flex items-center justify-between">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)]">Championship Leader</p>
            <Trophy size={15} className="text-[var(--text-secondary)]" />
          </div>
          <p className="display-title text-xl font-bold mt-2 truncate">{championshipLeader?.full_name || (driversLoading ? "Loading..." : "N/A")}</p>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            {championshipLeader ? `${championshipLeader?.season?.points || 0} pts` : "No standings available"}
          </p>
        </Panel>
      </div>

      {shouldShowFatalDriversError && (
        <Panel className="p-6 text-center text-red-400">
          {driversError?.message || "Unable to load season driver roster."}
        </Panel>
      )}

      <Panel className="p-3 sm:p-4">
        <Suspense
          fallback={
            <div className="flex items-center justify-center p-8 text-[var(--text-secondary)]">
              Loading driver grid...
            </div>
          }
        >
          <SessionDriversGrid
            meetingKey={latestEvent?.meeting_key}
            sessionKey={latestEvent?.session_key}
            year={year}
          />
        </Suspense>
      </Panel>
    </PageShell>
  );
};

export default DriversPage;
