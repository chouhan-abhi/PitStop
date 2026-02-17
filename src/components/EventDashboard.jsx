import React, { Suspense } from "react";

import HomeCountdownHero from "./HomeCountdownHero";
import HomeScheduleSection from "./HomeScheduleSection";
import SectionHeader from "./ui/SectionHeader";
import Panel from "./ui/Panel";
import StatusPill from "./ui/StatusPill";
import DataStatusBanner from "./ui/DataStatusBanner";

const EventCard = React.lazy(() => import("./Events/EventCard"));
const News = React.lazy(() => import("./News/News"));

export const EventDashboard = ({
  eventsData,
  eventsMeta,
  eventsLoading,
  eventsIsError,
  eventsError,
}) => {
  const eventsBannerMeta = {
    ...eventsMeta,
    warning: eventsMeta?.warning || (eventsIsError ? (eventsError?.message || "Some event data is unavailable.") : null),
  };
  if (eventsLoading) {
    return (
      <div className="app-shell py-8">
        <Panel className="p-8 text-center text-[var(--text-secondary)]">Loading events...</Panel>
      </div>
    );
  }

  if (eventsIsError && (!eventsData || eventsData.length === 0)) {
    return (
      <div className="app-shell py-8">
        <Panel className="p-8 text-center text-red-400">
          {eventsError?.message || "Failed to load events"}
        </Panel>
      </div>
    );
  }

  const noEvents = !eventsLoading && (!eventsData || eventsData.length === 0);
  if (noEvents) {
    return (
      <div className="app-shell py-8">
        <Panel className="p-8 text-center text-[var(--text-secondary)]">Awaiting season start</Panel>
      </div>
    );
  }

  const now = new Date();
  const sortedEvents = Array.isArray(eventsData)
    ? [...eventsData].sort((a, b) => new Date(a?.date_start || 0) - new Date(b?.date_start || 0))
    : [];
  const completedEvents = sortedEvents.filter(
    (event) => event?.date_start && new Date(event.date_start) <= now
  );
  const upcomingEvents = sortedEvents.filter(
    (event) => event?.date_start && new Date(event.date_start) > now
  );
  const latestCompletedEvent = completedEvents[completedEvents.length - 1] || null;
  const hasSeasonStarted = completedEvents.length > 0;
  const hasUpcomingEvent = upcomingEvents.length > 0;

  return (
    <div className="app-shell py-4 lg:py-8 space-y-5 lg:space-y-6">
      <DataStatusBanner meta={eventsBannerMeta} />
      {hasUpcomingEvent && <HomeCountdownHero eventsData={eventsData} />}
      <HomeScheduleSection eventsData={eventsData} />

      {hasSeasonStarted && (
        <section className="f1-card relative overflow-hidden rounded-xl border border-red-500/30 bg-[var(--panel-color)] shadow-[var(--shadow-md)]">
          <div className="absolute inset-0 opacity-90 bg-gradient-to-r from-red-900/70 via-black/75 to-black/30" />
          <div className="absolute -right-6 -top-10 text-[120px] sm:text-[180px] display-title font-black uppercase tracking-tight opacity-10 text-white select-none" aria-hidden="true">
            {latestCompletedEvent?.meeting_name?.split(" ")[0] || "F1"}
          </div>

          <div className="relative z-10 p-4 sm:p-6 lg:p-8">
            <SectionHeader
              title="Latest Event"
              subtitle="Fastest route to current weekend insights"
              actions={<StatusPill tone="live">Live telemetry view</StatusPill>}
            />
            <div className="mt-3">
              {latestCompletedEvent ? (
                <EventCard event={latestCompletedEvent} isLatest />
              ) : (
                <p className="text-[var(--text-secondary)]">No latest event available.</p>
              )}
            </div>
          </div>
        </section>
      )}

      <Panel className="p-3 sm:p-4 border-red-500/25">
        <Suspense
          fallback={
            <div className="flex items-center justify-center p-8 text-[var(--text-secondary)]">
              Loading news...
            </div>
          }
        >
          <News layout="carousel" showHeader={false} />
        </Suspense>
      </Panel>
    </div>
  );
};
