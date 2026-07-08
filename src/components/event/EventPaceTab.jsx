import React, { Suspense } from "react";

import Surface from "../ui/Surface";
import LoadingState from "../ui/LoadingState";

const SessionPaceAnalytics = React.lazy(() => import("../Common/SessionPaceAnalytics"));

const EventPaceTab = ({ sessionKey, meetingKey, year }) => {
  if (!sessionKey) {
    return <p className="md3-body-md text-[var(--md-on-surface-variant)]">No session selected for pace analysis.</p>;
  }

  return (
    <Surface tier="container" className="p-2 sm:p-3">
      <Suspense fallback={<LoadingState message="Loading pace analytics..." />}>
        <SessionPaceAnalytics sessionKey={sessionKey} meetingKey={meetingKey} year={year} />
      </Suspense>
    </Surface>
  );
};

export default EventPaceTab;
