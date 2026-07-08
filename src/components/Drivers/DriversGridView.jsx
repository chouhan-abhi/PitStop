import React from "react";

import DriverCard from "../ui/DriverCard";
import LoadingState from "../ui/LoadingState";

const DriversGridView = ({ drivers, loading, onSelect }) => {
  if (loading) return <LoadingState message="Loading driver grid..." />;

  if (!drivers.length) {
    return <p className="text-center py-8 text-[var(--text-muted)]">No drivers available.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
      {drivers.map((driver) => (
        <DriverCard
          key={driver.driverId || driver.driver_number}
          driver={driver}
          position={driver.season?.position}
          compact
          onClick={() => onSelect(driver)}
        />
      ))}
    </div>
  );
};

export default DriversGridView;
