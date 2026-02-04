import React, { useMemo, Suspense } from "react";

import { useEvents } from "../Events/useEvents";
import { getLatestEvent } from "../../common/utils/dataProcessing";

const SessionDriversGrid = React.lazy(() => import("./DriversGrid"));

const DriversPage = ({ year }) => {
  const {
    data: eventsData,
    isLoading,
    isError,
    error,
  } = useEvents(year, null);

  const latestEvent = useMemo(() => getLatestEvent(eventsData), [eventsData]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <p className="text-lg text-[var(--text-color)] opacity-60">
          Loading drivers...
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <p className="text-lg text-red-500">
          {error?.message || "Failed to load drivers"}
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 px-3 sm:px-5 lg:px-8 py-4 lg:py-8 space-y-5">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-color)]">
            Drivers
          </h2>
          <p className="text-sm opacity-60">
            Live roster from the latest {year} session
          </p>
        </div>
        {latestEvent && (
          <div className="text-xs uppercase tracking-[0.2em] text-red-300">
            {latestEvent.meeting_name}
          </div>
        )}
      </header>

      <div className="rounded-3xl border border-[var(--border-color)] bg-[var(--panel-color)]/80 p-3 sm:p-4 shadow-[0_10px_24px_rgba(0,0,0,0.18)]">
        <Suspense
          fallback={
            <div className="flex items-center justify-center p-8">
              <p className="text-[var(--text-color)] opacity-60">
                Loading driver grid...
              </p>
            </div>
          }
        >
          <SessionDriversGrid
            meetingKey={latestEvent?.meeting_key}
            sessionKey={latestEvent?.session_key}
            year={year}
          />
        </Suspense>
      </div>
    </div>
  );
};

export default DriversPage;
