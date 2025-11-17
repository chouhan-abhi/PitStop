import React, { useMemo, lazy, Suspense } from "react";
import { useEvents } from "./Events/useEvents";
import { getLatestEvent, getOlderEvents } from "../common/utils/dataProcessing";
import ShimmerLoader from './Common/ShimmerLoader';
// Lazy-load the EventDashboard
const EventDashboard = lazy(() =>
  import("./EventDashboard").then((module) => ({
    default: module.EventDashboard,
  }))
);

export const Dashboard = () => {
  const {
    data: eventsData,
    isLoading: eventsLoading,
    isError: eventsIsError,
    error: eventsError,
  } = useEvents("2025", null);

  const latestEvent = useMemo(() => getLatestEvent(eventsData), [eventsData]);
  const olderEvents = useMemo(() => getOlderEvents(eventsData), [eventsData]);

  return (
    <Suspense fallback={<ShimmerLoader />}>
      <EventDashboard
        eventsData={eventsData}
        eventsLoading={eventsLoading}
        eventsIsError={eventsIsError}
        eventsError={eventsError}
        latestEvent={latestEvent}
        olderEvents={olderEvents}
      />
    </Suspense>
  );
};
