import React, { useMemo, Suspense } from "react";

import { useEvents } from "../Events/useEvents";
import PageShell from "../ui/PageShell";
import Panel from "../ui/Panel";
import StatusPill from "../ui/StatusPill";

const SessionDriversGrid = React.lazy(() => import("./DriversGrid"));

const DriversPage = ({ year }) => {
  const { data: eventsData, isLoading, isError, error } = useEvents(year, null);

  const latestEvent = useMemo(() => {
    if (!Array.isArray(eventsData) || !eventsData.length) return null;
    const now = new Date();
    const completed = eventsData
      .filter((event) => event?.date_start && new Date(event.date_start) <= now)
      .sort((a, b) => new Date(b.date_start) - new Date(a.date_start));
    return completed[0] || null;
  }, [eventsData]);

  if (isLoading) {
    return (
      <PageShell title="Drivers" subtitle="Loading season driver intelligence...">
        <Panel className="p-8 text-center text-[var(--text-secondary)]">Loading drivers...</Panel>
      </PageShell>
    );
  }

  if (isError) {
    return (
      <PageShell title="Drivers" subtitle="Unable to read live roster">
        <Panel className="p-8 text-center text-red-400">{error?.message || "Failed to load drivers"}</Panel>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Drivers"
      subtitle={`Season ${year} roster in list view with side-by-side details`}
      actions={latestEvent ? <StatusPill tone="live">Latest Round: {latestEvent.meeting_name}</StatusPill> : null}
    >
      <Panel className="p-3 sm:p-4 border-red-500/20">
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
