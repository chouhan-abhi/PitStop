import React, { Suspense } from "react";

import Panel from "../ui/Panel";
import LoadingState from "../ui/LoadingState";

const SessionPaceAnalytics = React.lazy(() => import("../Common/SessionPaceAnalytics"));

const EventPaceTab = ({ sessionKey, meetingKey, year }) => {
  if (!sessionKey) {
    return <p className="text-sm text-[var(--text-muted)]">No session selected for pace analysis.</p>;
  }

  return (
    <Panel className="p-2 sm:p-3">
      <Suspense fallback={<LoadingState message="Loading pace analytics..." />}>
        <SessionPaceAnalytics sessionKey={sessionKey} meetingKey={meetingKey} year={year} />
      </Suspense>
    </Panel>
  );
};

export default EventPaceTab;
