import React, { lazy, Suspense } from "react";

import { useEvents } from "./Events/useEvents";
import ShimmerLoader from './Common/ShimmerLoader';

// Lazy-load the EventDashboard
const EventDashboard = lazy(() =>
  import("./EventDashboard").then((module) => ({
    default: module.EventDashboard,
  }))
);

export const Dashboard = ({ year }) => {
  const {
    data: eventsData,
    dataMeta: eventsMeta,
    isLoading: eventsLoading,
    isError: eventsIsError,
    error: eventsError,
  } = useEvents(year, null);

  return (
    <Suspense fallback={<ShimmerLoader />}>
      <EventDashboard
        eventsData={eventsData}
        eventsMeta={eventsMeta}
        eventsLoading={eventsLoading}
        eventsIsError={eventsIsError}
        eventsError={eventsError}
      />
    </Suspense>
  );
};
