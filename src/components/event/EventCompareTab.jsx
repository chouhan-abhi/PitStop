import React, { Suspense } from "react";

import Surface from "../ui/Surface";
import LoadingState from "../ui/LoadingState";

const SessionPaceAnalytics = React.lazy(() => import("../Common/SessionPaceAnalytics"));

const EventCompareTab = ({ sessionKey, meetingKey, year }) => {
  if (!sessionKey) {
    return <p className="md3-body-md text-[var(--md-on-surface-variant)]">Select a session to compare drivers.</p>;
  }

  return (
    <Surface tier="container" className="p-2 sm:p-3">
      <p className="md3-label-md text-[var(--md-on-surface-variant)] mb-3 px-1">
        Sector comparison — select drivers in the panel below
      </p>
      <Suspense fallback={<LoadingState message="Loading comparison view..." />}>
        <SessionPaceAnalytics
          sessionKey={sessionKey}
          meetingKey={meetingKey}
          year={year}
        />
      </Suspense>
    </Surface>
  );
};

export default EventCompareTab;
