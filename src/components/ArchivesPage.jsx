import React, { useMemo, Suspense } from "react";

import { useEvents } from "./Events/useEvents";
import { getOlderEvents, getLatestEvent } from "../common/utils/dataProcessing";

const EventCard = React.lazy(() => import("./Events/EventCard"));

const ArchivesPage = ({ year }) => {
  const {
    data: eventsData,
    isLoading,
    isError,
    error,
  } = useEvents(year, null);

  const olderEvents = useMemo(() => getOlderEvents(eventsData), [eventsData]);
  const latestEvent = useMemo(() => getLatestEvent(eventsData), [eventsData]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <p className="text-lg text-[var(--text-color)] opacity-60">
          Loading archives...
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <p className="text-lg text-red-500">
          {error?.message || "Failed to load events"}
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 px-3 sm:px-5 lg:px-8 py-4 lg:py-8 space-y-5">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-color)]">
            Archives
          </h2>
          <p className="text-sm opacity-60">
            Past events from the {year} season
          </p>
        </div>
        {latestEvent && (
          <div className="hidden sm:flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-red-300">
            <span className="inline-flex h-2 w-2 rounded-full bg-red-500 shadow-[0_0_12px_rgba(255,0,0,0.7)]" />
            Latest: {latestEvent.meeting_name}
          </div>
        )}
      </header>

      <Suspense
        fallback={
          <div className="flex items-center justify-center p-8">
            <p className="text-[var(--text-color)] opacity-60">
              Loading archived events...
            </p>
          </div>
        }
      >
        {latestEvent && (
          <div className="mb-4 rounded-3xl shadow-[0_12px_28px_rgba(0,0,0,0.18)]">
            <EventCard event={latestEvent} isLatest />
          </div>
        )}

        {olderEvents && olderEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
            {olderEvents.map((event) => (
              <div
                key={event.meeting_key}
                className="rounded-2xl shadow-[0_8px_20px_rgba(0,0,0,0.12)] hover:-translate-y-0.5 transition-all"
              >
                <EventCard event={event} />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[var(--text-color)] opacity-60">
            No archived events available for {year}.
          </p>
        )}
      </Suspense>
    </div>
  );
};

export default ArchivesPage;
