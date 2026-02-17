import React, { useMemo, Suspense } from "react";

import { useEvents } from "./Events/useEvents";
import HomeCountdownHero from "./HomeCountdownHero";
import PageShell from "./ui/PageShell";
import Panel from "./ui/Panel";
import StatusPill from "./ui/StatusPill";
import DataStatusBanner from "./ui/DataStatusBanner";

const EventCard = React.lazy(() => import("./Events/EventCard"));

const ArchivesPage = ({ year }) => {
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
  const completedEvents = useMemo(
    () =>
      sortedEvents.filter((event) => event?.date_start && new Date(event.date_start) <= now),
    [sortedEvents, now]
  );
  const latestCompletedEvent = completedEvents[completedEvents.length - 1] || null;
  const olderEvents = useMemo(
    () => completedEvents.slice(0, -1).reverse(),
    [completedEvents]
  );
  const nextEvent = useMemo(
    () => sortedEvents.find((event) => event?.date_start && new Date(event.date_start) >= now) || null,
    [sortedEvents, now]
  );

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
      subtitle={
        latestCompletedEvent
          ? `Past events from the ${year} season`
          : `No completed events yet in ${year}`
      }
      actions={
        latestCompletedEvent ? (
          <StatusPill tone="live">Latest: {latestCompletedEvent.meeting_name}</StatusPill>
        ) : (
          <StatusPill tone="warn">Event yet to start</StatusPill>
        )
      }
    >
      <DataStatusBanner
        meta={{
          ...eventsMeta,
          warning: eventsMeta?.warning || (isError ? (error?.message || "Some event data is unavailable.") : null),
        }}
      />
      {!latestCompletedEvent ? (
        <div className="space-y-4">
          {nextEvent && <HomeCountdownHero eventsData={eventsData} />}
          <Panel className="p-4 text-[var(--text-secondary)]">
            {nextEvent ? (
              <>
                Event yet to start for this season. Next scheduled race is{" "}
                <span className="text-[var(--text-primary)] font-semibold">{nextEvent.meeting_name}</span>.
              </>
            ) : (
              "Event yet to start for this season."
            )}
          </Panel>
        </div>
      ) : (
        <Suspense
          fallback={
            <Panel className="p-8 text-center text-[var(--text-secondary)]">Loading archived events...</Panel>
          }
        >
          <div className="mb-4">
            <EventCard event={latestCompletedEvent} isLatest />
          </div>

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
      )}
    </PageShell>
  );
};

export default ArchivesPage;
