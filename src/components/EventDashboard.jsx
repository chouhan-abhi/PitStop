import React, { Suspense } from "react";
const EventCard = React.lazy(() => import("./Events/EventCard"));
const SessionDriversGrid = React.lazy(() => import("./Drivers/DriversGrid"));
const StandingsGrid = React.lazy(() => import("./Standings/StandingsGrid"));
const News = React.lazy(() => import("./News/News"));

export const EventDashboard = ({
  eventsLoading,
  eventsIsError,
  eventsError,
  latestEvent,
  olderEvents,
}) => {
  /* -------------------- Loading State --------------------- */
  if (eventsLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <p className="text-lg text-[var(--text-color)] opacity-60">
          Loading events...
        </p>
      </div>
    );
  }

  /* -------------------- Error State --------------------- */
  if (eventsIsError) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <p className="text-lg text-red-500">
          {eventsError?.message || "Failed to load events"}
        </p>
      </div>
    );
  }

  /* ======================= MAIN UI ======================== */
  return (
    <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-2 sm:gap-3 lg:gap-4 p-2 sm:p-4 lg:p-6">

      {/* ---------------------- LATEST EVENT -------------------------- */}
      <div className="lg:col-span-2 flex flex-col">
        <div className="relative">
          <h2 
            className="text-sm font-semibold text-[var(--text-color)] opacity-90 tracking-tight inline-block px-4 py-2 rounded-t-lg border-t border-l border-r border-b-0"
            style={{
              backgroundColor: 'var(--card-bg)',
              borderColor: 'var(--border-color)',
              marginBottom: '-1px',
            }}
          >
            Latest Event
          </h2>
        </div>

        <div className="rounded-2xl rounded-tl-none p-2 sm:p-3 lg:p-4 bg-[var(--card-bg)] shadow-[0_4px_12px_rgba(0,0,0,0.08)] border border-[var(--border-color)] transition-all">
          {latestEvent ? (
            <EventCard event={latestEvent} isLatest={true} />
          ) : (
            <p className="text-[var(--text-color)] opacity-60">
              No latest event available.
            </p>
          )}
        </div>

        {/* ---------------------- F1 NEWS -------------------------- */}
        <div className="mt-3 sm:mt-4 lg:mt-6">
          <div className="relative">
            <h2 
              className="text-sm font-semibold text-[var(--text-color)] opacity-90 tracking-tight inline-block px-4 py-2 rounded-t-lg border-t border-l border-r border-b-0"
              style={{
                backgroundColor: 'var(--card-bg)',
                borderColor: 'var(--border-color)',
                marginBottom: '-1px',
              }}
            >
              Top Stories
            </h2>
          </div>
          <div className="rounded-2xl rounded-tl-none p-2 sm:p-3 lg:p-4 bg-[var(--card-bg)] shadow-[0_4px_12px_rgba(0,0,0,0.08)] border border-[var(--border-color)] transition-all">
            <Suspense fallback={
              <div className="flex items-center justify-center p-8">
                <p className="text-[var(--text-color)] opacity-60">Loading news...</p>
              </div>
            }>
              <News />
            </Suspense>
          </div>
        </div>

        {/* ---------------------- STANDINGS GRID -------------------------- */}
        <div className="mt-3 sm:mt-4 lg:mt-6">
          <div className="relative">
            <h2 
              className="text-sm font-semibold text-[var(--text-color)] opacity-90 tracking-tight inline-block px-4 py-2 rounded-t-lg border-t border-l border-r border-b-0"
              style={{
                backgroundColor: 'var(--card-bg)',
                borderColor: 'var(--border-color)',
                marginBottom: '-1px',
              }}
            >
              2025 Standings
            </h2>
          </div>
          <div className="rounded-2xl rounded-tl-none p-2 sm:p-3 lg:p-4 bg-[var(--card-bg)] shadow-[0_4px_12px_rgba(0,0,0,0.08)] border border-[var(--border-color)] transition-all">
            <Suspense fallback={
              <div className="flex items-center justify-center p-8">
                <p className="text-[var(--text-color)] opacity-60">Loading standings...</p>
              </div>
            }>
              <StandingsGrid />
            </Suspense>
          </div>
        </div>

        <div className="mt-2 sm:mt-3 lg:mt-4 mb-1">
          <div className="relative">
            <h2 
              className="text-sm font-semibold text-[var(--text-color)] opacity-90 tracking-tight inline-block px-4 py-2 rounded-t-lg border-t border-l border-r border-b-0"
              style={{
                backgroundColor: 'var(--card-bg)',
                borderColor: 'var(--border-color)',
                marginBottom: '-1px',
              }}
            >
              Our Grid
            </h2>
          </div>
        <div className="border border-[var(--border-color)] rounded-2xl rounded-tl-none p-4 bg-[var(--card-bg)] shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
          <SessionDriversGrid  meetingKey={latestEvent?.meeting_key} sessionKey={latestEvent?.session_key} />
        </div>
        </div>
      </div>

      {/* ---------------------- SIDEBAR (OLDER EVENTS) -------------------------- */}
      <div className="lg:col-span-1 flex flex-col h-screen">
        <div className="relative">
          <h3 
            className="text-sm font-semibold text-[var(--text-color)] opacity-90 tracking-tight inline-block px-4 py-2 rounded-t-lg border-t border-l border-r border-b-0"
            style={{
              backgroundColor: 'var(--card-bg)',
              borderColor: 'var(--border-color)',
              marginBottom: '-1px',
            }}
          >
            Older Events
          </h3>
        </div>

        <div
            className="
            flex-1 
            rounded-2xl 
            rounded-tl-none
            p-2 sm:p-3 lg:p-4 
            h-screen
            bg-[var(--card-bg)] 
            shadow-[0_4px_12px_rgba(0,0,0,0.08)] 
            border 
            border-[var(--border-color)]
            overflow-y-auto 
            relative
          "
        >
          {/* Fade overlay for better UX */}
          <div className="pointer-events-none absolute top-0 left-0 h-6 w-full bg-gradient-to-b from-[var(--card-bg)] to-transparent" />
          <div className="pointer-events-none absolute bottom-0 left-0 h-6 w-full bg-gradient-to-t from-[var(--card-bg)] to-transparent" />

          {olderEvents && olderEvents.length > 0 ? (
            <div className="grid grid-cols-1 gap-2 sm:gap-3 lg:gap-4 pb-3 sm:pb-4 lg:pb-6">
              {olderEvents.map((event) => (
                <div
                  key={event.meeting_key}
                  className="
                    p-1 sm:p-2 rounded-xl
                    transition-all 
                    duration-200 
                    hover:scale-[1.015]
                    hover:shadow-[0_6px_16px_rgba(0,0,0,0.12)]
                    bg-[var(--surface-bg)]
                    border 
                    border-[var(--border-color)]
                  "
                >
                  <EventCard event={event} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[var(--text-color)] opacity-60">
              No older events available.
            </p>
          )}
        </div>
      </div>

    </div>
  );
};
