import React, { Suspense } from "react";

import HomeCountdownHero from "./HomeCountdownHero";
const EventCard = React.lazy(() => import("./Events/EventCard"));
const News = React.lazy(() => import("./News/News"));

export const EventDashboard = ({
  eventsData,
  eventsLoading,
  eventsIsError,
  eventsError,
  latestEvent,
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

  const noEvents = !eventsLoading && (!eventsData || eventsData.length === 0);
  if (noEvents) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <p className="text-lg text-[var(--text-color)] opacity-60">
          Awaiting season start
        </p>
      </div>
    );
  }

  const now = new Date();
  const hasSeasonStarted = Array.isArray(eventsData)
    ? eventsData.some((event) => new Date(event.date_start) <= now)
    : false;

  /* ======================= MAIN UI ======================== */
  return (
    <div className="flex-1 px-3 sm:px-5 lg:px-8 py-4 lg:py-8 space-y-5 lg:space-y-7">
      <HomeCountdownHero />

      {hasSeasonStarted && (
        <section className="relative overflow-hidden rounded-3xl border border-[var(--border-color)] bg-[var(--panel-color)] shadow-[0_16px_40px_rgba(0,0,0,0.25)]">
          <div
            className="absolute inset-0 opacity-90"
            style={{
              background:
                "linear-gradient(120deg, rgba(120,0,0,0.75), rgba(0,0,0,0.95) 55%, rgba(0,0,0,0.35))",
            }}
          />
          <div
            className="absolute -right-6 -top-10 text-[120px] sm:text-[180px] font-black uppercase tracking-tight opacity-10 text-white select-none"
            aria-hidden="true"
          >
            {latestEvent?.meeting_name?.split(" ")[0] || "F1"}
          </div>

          <div className="relative z-10 p-4 sm:p-6 lg:p-8">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-red-300/80">
              <span className="inline-flex h-2 w-2 rounded-full bg-red-500 shadow-[0_0_12px_rgba(255,0,0,0.7)]" />
              Latest Event
            </div>
            <div className="mt-3">
              {latestEvent ? (
                <EventCard event={latestEvent} isLatest={true} />
              ) : (
                <p className="text-[var(--text-color)] opacity-60">
                  No latest event available.
                </p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ---------------------- TOP STORIES -------------------------- */}
      <section className="grid grid-cols-1 gap-4 lg:gap-6">
        <div className="rounded-2xl border border-red-500/20 bg-[var(--panel-color)]/90 shadow-[0_10px_24px_rgba(0,0,0,0.18)]">
          <div className="p-3 sm:p-4" style={{
            borderRadius: "1rem",
            background:
              "linear-gradient(-30deg, rgba(120,0,0,0.65), rgba(0,0,0,0.95) 55%, rgba(0,0,0,0.35))",
          }}>
            <Suspense
              fallback={
                <div className="flex items-center justify-center p-8">
                  <p className="text-[var(--text-color)] opacity-60">
                    Loading news...
                  </p>
                </div>
              }
            >
              <News layout="carousel" showHeader={false} />
            </Suspense>
          </div>
        </div>
      </section>
    </div>
  );
};
