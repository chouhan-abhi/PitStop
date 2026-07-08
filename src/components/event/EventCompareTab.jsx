import React, { Suspense } from "react";

import Panel from "../ui/Panel";
import LoadingState from "../ui/LoadingState";

const SessionPaceAnalytics = React.lazy(() => import("../Common/SessionPaceAnalytics"));

const EventCompareTab = ({ sessionKey, meetingKey, year }) => {
  if (!sessionKey) {
    return <p className="text-sm text-[var(--text-muted)]">Select a session to compare drivers.</p>;
  }

  return (
    <Panel className="p-2 sm:p-3">
      <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] mb-3 px-1">
        Sector comparison — select drivers in the panel below
      </p>
      <Suspense fallback={<LoadingState message="Loading comparison view..." />}>
        <SessionPaceAnalytics
          sessionKey={sessionKey}
          meetingKey={meetingKey}
          year={year}
        />
      </Suspense>
    </Panel>
  );
};

export default EventCompareTab;
