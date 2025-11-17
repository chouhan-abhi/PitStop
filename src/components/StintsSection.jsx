// src/components/StintsSection.jsx
import React from "react";
import ShimmerLoader from "./ShimmerLoader";
const StintsGraph = React.lazy(() => import("./Common/StintsGraph"));

const StintsSection = ({ stintsData, stintsByDriver, allDriversRaw, stintsLoading }) => {
  return (
    <div>
      <h3 className="text-base font-semibold mb-3" style={{ color: "var(--text-color)", opacity: 0.8 }}>
        Stints
      </h3>

      {stintsLoading ? (
        <div>
          <ShimmerLoader rows={4} compact />
        </div>
      ) : stintsData && stintsData.length > 0 ? (
        <div className="rounded-md border border-[var(--border-color)] p-3 bg-[var(--panel-color)]">
          <StintsGraph stintsByDriver={stintsByDriver} allDrivers={allDriversRaw} totalLaps={71} />
        </div>
      ) : (
        <p className="text-sm" style={{ color: "var(--text-color)", opacity: 0.5 }}>
          No stints data available.
        </p>
      )}
    </div>
  );
};

export default React.memo(StintsSection);
