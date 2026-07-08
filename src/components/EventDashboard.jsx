import React, { Suspense, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import HomeCountdownHero from "./HomeCountdownHero";
import HomeScheduleSection from "./HomeScheduleSection";
import SectionHeader from "./ui/SectionHeader";
import Surface from "./ui/Surface";
import DataStatusBanner from "./ui/DataStatusBanner";
import ChampionshipStrip from "./ui/ChampionshipStrip";
import DriverCard from "./ui/DriverCard";
import Button from "./ui/Button";
import { useDriverRegistry } from "../common/drivers/useDriverRegistry";
import { usePositions } from "./Drivers/usePositions";
import { useRevealOnScroll } from "../hooks/useRevealOnScroll";
import {
  getLatestSessionFromPositions,
  getLatestPositionsForDrivers,
  mergeDriversWithPositions,
} from "../common/utils/dataProcessing";

const News = React.lazy(() => import("./News/News"));

export const EventDashboard = ({
  eventsData,
  eventsMeta,
  eventsLoading,
  eventsIsError,
  eventsError,
  year,
}) => {
  const navigate = useNavigate();

  const eventsBannerMeta = {
    ...eventsMeta,
    warning:
      eventsMeta?.warning ||
      (eventsIsError ? eventsError?.message || "Some event data is unavailable." : null),
  };

  const { data: seasonDrivers } = useDriverRegistry(null, null, { year, enabled: Boolean(year) });
  const leaders = useMemo(() => {
    const roster = Array.isArray(seasonDrivers) ? seasonDrivers : [];
    return roster.filter((d) => d.season?.position).slice(0, 3);
  }, [seasonDrivers]);

  if (eventsLoading) {
    return (
      <div className="app-shell py-8">
        <Surface className="p-8 text-center md3-body-md text-[var(--md-on-surface-variant)]">
          Loading events...
        </Surface>
      </div>
    );
  }

  if (eventsIsError && (!eventsData || eventsData.length === 0)) {
    return (
      <div className="app-shell py-8">
        <Surface className="p-8 text-center text-[var(--danger)]">
          {eventsError?.message || "Failed to load events"}
        </Surface>
      </div>
    );
  }

  const noEvents = !eventsLoading && (!eventsData || eventsData.length === 0);
  if (noEvents) {
    return (
      <div className="app-shell py-8">
        <Surface className="p-8 text-center md3-body-md text-[var(--md-on-surface-variant)]">
          Awaiting season start
        </Surface>
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
    <HomeDashboardContent
      eventsBannerMeta={eventsBannerMeta}
      hasUpcomingEvent={hasUpcomingEvent}
      eventsData={eventsData}
      hasSeasonStarted={hasSeasonStarted}
      latestCompletedEvent={latestCompletedEvent}
      leaders={leaders}
      year={year}
      navigate={navigate}
    />
  );
};

const HomeDashboardContent = ({
  eventsBannerMeta,
  hasUpcomingEvent,
  eventsData,
  hasSeasonStarted,
  latestCompletedEvent,
  leaders,
  year,
  navigate,
}) => {
  const podiumReveal = useRevealOnScroll();
  const newsReveal = useRevealOnScroll();

  const eventYear = latestCompletedEvent?.date_start
    ? new Date(latestCompletedEvent.date_start).getFullYear()
    : year;

  const { data: positionsData } = usePositions(
    latestCompletedEvent?.meeting_key,
    null,
    null,
    { enabled: Boolean(latestCompletedEvent?.meeting_key), year: eventYear }
  );

  const latestSession = useMemo(() => {
    if (!positionsData?.length || !latestCompletedEvent) return null;
    return getLatestSessionFromPositions(positionsData, latestCompletedEvent.meeting_key);
  }, [positionsData, latestCompletedEvent]);

  const { data: sessionDrivers } = useDriverRegistry(
    latestCompletedEvent?.meeting_key,
    latestSession?.session_key,
    { enabled: Boolean(latestSession?.session_key), year: eventYear }
  );

  const podium = useMemo(() => {
    if (!sessionDrivers?.length || !positionsData?.length || !latestSession) return [];
    const positions = getLatestPositionsForDrivers(positionsData, latestSession.session_key);
    return mergeDriversWithPositions(sessionDrivers, positions).slice(0, 3);
  }, [sessionDrivers, positionsData, latestSession]);

  return (
    <div className="app-shell py-4 lg:py-8 space-y-6 lg:space-y-8">
      <DataStatusBanner meta={eventsBannerMeta} />
      {hasUpcomingEvent && <HomeCountdownHero eventsData={eventsData} />}
      <HomeScheduleSection eventsData={eventsData} />

      {hasSeasonStarted && (
        <section className="grid grid-cols-1 lg:grid-cols-[1fr_1.6fr] gap-5">
          <ChampionshipStrip leaders={leaders} title="Championship Top 3" />
          <Surface tier="container-high" className={`p-5 sm:p-6 ${podiumReveal.className}`} ref={podiumReveal.ref}>
            <SectionHeader
              title="Latest Race Podium"
              subtitle={latestCompletedEvent?.meeting_name}
              actions={
                <Button
                  variant="filled"
                  size="sm"
                  onClick={() => navigate(`/event/${latestCompletedEvent.meeting_key}`)}
                >
                  View Weekend
                </Button>
              }
            />
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {podium.length > 0 ? (
                podium.map((driver, idx) => (
                  <DriverCard
                    key={driver.driver_number}
                    driver={driver}
                    position={driver.position}
                    featured={idx === 0}
                    compact={idx > 0}
                  />
                ))
              ) : (
                <p className="md3-body-md text-[var(--md-on-surface-variant)] col-span-full">
                  Podium data loading…
                </p>
              )}
            </div>
          </Surface>
        </section>
      )}

      <Surface tier="container" className={`p-4 sm:p-5 ${newsReveal.className}`} ref={newsReveal.ref}>
        <Suspense
          fallback={
            <div className="flex items-center justify-center p-8 md3-body-md text-[var(--md-on-surface-variant)]">
              Loading news...
            </div>
          }
        >
          <News layout="carousel" showHeader={false} />
        </Suspense>
      </Surface>
    </div>
  );
};
