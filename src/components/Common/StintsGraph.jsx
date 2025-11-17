// src/components/StintsGraph.jsx
import React, { useMemo } from "react";

const compoundColors = {
  HARD: "#ffffff",
  MEDIUM: "#ffdb4d",
  SOFT: "#ff4d4d",
  INTERMEDIATE: "#4bb2ff",
  WET: "#003b88",
};

const formatDriverShort = (fullName) => {
  if (!fullName) return "";
  const parts = fullName.trim().split(" ");
  if (parts.length === 1) return parts[0];
  const firstInitial = parts[0][0];
  const lastThree = parts[1].substring(0, 3).toUpperCase();
  return `${firstInitial}. ${lastThree}`;
};

const StintsGraph = ({ stintsByDriver = {}, allDrivers = [], totalLaps = 71 }) => {
  const sortedDrivers = useMemo(() => {
    return Object.entries(stintsByDriver)
      .map(([driverNumber, stints]) => {
        const driver = allDrivers?.find((d) => d.driver_number === parseInt(driverNumber));
        const finalPosition = driver?.position ?? 999;
        return { driverNumber, driver, stints, finalPosition };
      })
      .sort((a, b) => a.finalPosition - b.finalPosition);
  }, [stintsByDriver, allDrivers]);

  return (
    <div className="space-y-4 w-full p-2 border border-(--border-color) ">
      {sortedDrivers.map(({ driverNumber, driver, stints }) => (
        <div key={driverNumber} className="flex items-center pb-1 gap-4 w-full">
          <div className="flex items-center min-w-[120px]">
            {driver?.headshot_url && (
              <img
                src={driver.headshot_url}
                alt={driver?.full_name}
                loading="lazy"
                decoding="async"
                className="w-7 h-7 rounded-full mr-2 border"
                style={{ borderColor: driver?.team_colour ? `#${driver.team_colour}` : "transparent" }}
              />
            )}
            <span className="text-sm font-semibold" style={{ color: "var(--text-color)" }}>
              {formatDriverShort(driver?.full_name)}
            </span>
          </div>

          <div className="flex-1 h-7 rounded-md flex overflow-hidden border border-[var(--border-color)]">
            {stints.map((stint, index) => {
              const stintLaps = Math.max(0, (stint.lap_end - stint.lap_start + 1) || 0);
              const widthPercent = totalLaps > 0 ? (stintLaps / totalLaps) * 100 : 0;
              const color = compoundColors[(stint.compound || "").toUpperCase()] || "#888";

              return (
                <div
                  key={index}
                  className="flex items-center justify-center text-[10px] font-semibold whitespace-nowrap"
                  style={{
                    width: `${widthPercent}%`,
                    backgroundColor: color,
                    color: stint.compound?.toUpperCase() === "SOFT" ? "#fff" : "#000",
                    borderRight: "1px solid rgba(0,0,0,0.06)",
                  }}
                >
                  {stintLaps > 0 ? `${stintLaps}` : ""}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default React.memo(StintsGraph);
