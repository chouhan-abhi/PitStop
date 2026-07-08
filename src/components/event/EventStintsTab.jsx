import React, { Suspense } from "react";

import Surface from "../ui/Surface";
import LoadingState from "../ui/LoadingState";

const StintsGraph = React.lazy(() => import("../Common/StintsGraph"));

const EventStintsTab = ({ stintsByDriver, driversWithPositions, stintsLoading, totalLaps = 71 }) => {
  if (stintsLoading) {
    return <LoadingState message="Loading stints…" />;
  }

  const hasStints = stintsByDriver && Object.keys(stintsByDriver).length > 0;

  if (!hasStints) {
    return <p className="md3-body-md text-[var(--md-on-surface-variant)] py-6 text-center">No stints data available.</p>;
  }

  return (
    <Surface tier="container" className="p-3">
      <Suspense fallback={<LoadingState message="Loading stints graph..." />}>
        <StintsGraph
          stintsByDriver={stintsByDriver}
          allDrivers={driversWithPositions}
          totalLaps={totalLaps}
        />
      </Suspense>
    </Surface>
  );
};

export default EventStintsTab;
