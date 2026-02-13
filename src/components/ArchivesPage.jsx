import React, { useMemo, Suspense } from "react";

import { useEvents } from "./Events/useEvents";
import { getOlderEvents, getLatestEvent } from "../common/utils/dataProcessing";
import PageShell from "./ui/PageShell";
import Panel from "./ui/Panel";
import StatusPill from "./ui/StatusPill";

const EventCard = React.lazy(() => import("./Events/EventCard"));

const ArchivesPage = ({ year }) => {
  const { data: eventsData, isLoading, isError, error } = useEvents(year, null);

  const olderEvents = useMemo(() => getOlderEvents(eventsData), [eventsData]);
  const latestEvent = useMemo(() => getLatestEvent(eventsData), [eventsData]);

  if (isLoading) {
    return (
      <PageShell title="Archives" subtitle="Loading archived weekends...">
        <Panel className="p-8 text-center text-[var(--text-secondary)]">Loading archives...</Panel>
      </PageShell>
    );
  }

  if (isError) {
    return (
      <PageShell title="Archives" subtitle="Archive feed unavailable">
        <Panel className="p-8 text-center text-red-400">{error?.message || "Failed to load events"}</Panel>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Archives"
      subtitle={`Past events from the ${year} season`}
      actions={latestEvent ? <StatusPill tone="live">Latest: {latestEvent.meeting_name}</StatusPill> : null}
    >
      <Suspense
        fallback={
          <Panel className="p-8 text-center text-[var(--text-secondary)]">Loading archived events...</Panel>
        }
      >
        {latestEvent && (
          <div className="mb-4">
            <EventCard event={latestEvent} isLatest />
          </div>
        )}

        {olderEvents && olderEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
            {olderEvents.map((event) => (
              <div key={event.meeting_key} className="rounded-2xl">
                <EventCard event={event} />
              </div>
            ))}
          </div>
        ) : (
          <Panel className="p-4 text-[var(--text-secondary)]">No archived events available for {year}.</Panel>
        )}
      </Suspense>
    </PageShell>
  );
};

export default ArchivesPage;
