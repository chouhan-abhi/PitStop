// src/components/StintsGraph.jsx

import React, { useMemo, useState } from "react";

import { getTeamColorWithOpacity, getTeamColorBorder } from "../../common/utils/colors";

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

const DriverAvatar = ({ driver, driverNumber }) => {
  const [imageError, setImageError] = useState(false);
  const driverInitials = driver?.full_name
    ? formatDriverShort(driver.full_name).replace(/\./g, '').substring(0, 2).toUpperCase()
    : '?';
  const showImage = driver?.headshot_url && !imageError;

  if (showImage) {
    return (
      <img
        src={driver.headshot_url}
        alt={driver?.full_name}
        loading="lazy"
        decoding="async"
        className="w-7 h-7 rounded-full mr-2 border"
        style={{
          borderColor: driver?.team_colour
            ? getTeamColorBorder(driver.team_colour)
            : "transparent"
        }}
        onError={() => setImageError(true)}
      />
    );
  }

  return (
    <div
      className="w-7 h-7 rounded-full mr-2 border flex items-center justify-center text-[10px] font-semibold"
      style={{
        borderColor: driver?.team_colour
          ? getTeamColorBorder(driver.team_colour)
          : "var(--border-color)",
        backgroundColor: driver?.team_colour
          ? getTeamColorWithOpacity(driver.team_colour, '20')
          : "var(--panel-color)",
        color: "var(--text-color)",
      }}
    >
      {driverInitials}
    </div>
  );
};

const StintsGraph = ({ stintsByDriver = {}, allDrivers = [], totalLaps = 71 }) => {
  const sortedDrivers = useMemo(() => {
    return Object.entries(stintsByDriver)
      .map(([driverNumber, stints]) => {
        const driver = allDrivers?.find((d) => d.driver_number === Number.parseInt(driverNumber, 10));
        const finalPosition = driver?.position ?? 999;
        return { driverNumber, driver, stints, finalPosition };
      })
      .sort((a, b) => a.finalPosition - b.finalPosition);
  }, [stintsByDriver, allDrivers]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[var(--md-surface-container-high)] p-3 border border-[var(--md-outline-variant)]" style={{ borderRadius: "var(--shape-md)" }}>
        <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
          🏎️ TYRE STRATEGY & STINT PROGRESSION
        </h3>
        <div className="flex items-center gap-3 text-[11px] font-mono font-bold">
          <span className="flex items-center gap-1.5 text-red-400">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff4d4d]" /> SOFT
          </span>
          <span className="flex items-center gap-1.5 text-amber-300">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ffdb4d]" /> MEDIUM
          </span>
          <span className="flex items-center gap-1.5 text-slate-200">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ffffff]" /> HARD
          </span>
          <span className="flex items-center gap-1.5 text-sky-400">
            <span className="w-2.5 h-2.5 rounded-full bg-[#4bb2ff]" /> INTER
          </span>
          <span className="flex items-center gap-1.5 text-blue-600">
            <span className="w-2.5 h-2.5 rounded-full bg-[#003b88]" /> WET
          </span>
        </div>
      </div>

      <div className="space-y-2.5 w-full p-4 border border-[var(--md-outline-variant)] bg-[var(--md-surface-container)]" style={{ borderRadius: "var(--shape-md)" }}>
      {sortedDrivers.map(({ driverNumber, driver, stints }) => (
        <div key={driverNumber} className="flex items-center pb-1 w-full">
          <div className="flex items-center min-w-[120px]">
            <DriverAvatar driver={driver} driverNumber={driverNumber} />
            <span className="text-sm font-semibold" style={{ color: "var(--text-color)" }}>
              {formatDriverShort(driver?.full_name) || `Driver ${driverNumber}`}
            </span>
          </div>

          <div className="flex-1 h-7 rounded-md flex overflow-hidden border border-[var(--border-color)]" style={{ width: '100%' }}>
            {(() => {
              // Calculate all stint laps first
              const stintLapsArray = stints.map(stint =>
                Math.max(0, (stint.lap_end - stint.lap_start + 1) || 0)
              );

              // Calculate total covered laps
              const totalCoveredLaps = stintLapsArray.reduce((sum, laps) => sum + laps, 0);

              // Use the larger of totalCoveredLaps or totalLaps to ensure full width
              const effectiveTotalLaps = Math.max(totalCoveredLaps, totalLaps, 1);

              // Calculate flex-basis values based on laps
              const totalLapsValue = stintLapsArray.reduce((sum, laps) => sum + laps, 0) || effectiveTotalLaps;

              return stints.map((stint, index) => {
                const stintLaps = stintLapsArray[index];
                const flexBasis = totalLapsValue > 0 ? (stintLaps / totalLapsValue) * 100 : 0;
                const color = compoundColors[(stint.compound || "").toUpperCase()] || "#888";
                const isLast = index === stints.length - 1;

                return (
                  <div
                    key={index}
                    className="flex items-center justify-center text-[10px] font-semibold whitespace-nowrap"
                    style={{
                      flexBasis: `${flexBasis}%`,
                      flexGrow: isLast ? 1 : 0,
                      flexShrink: 0,
                      minWidth: stintLaps > 0 ? '2px' : '0',
                      backgroundColor: color,
                      color: stint.compound?.toUpperCase() === "SOFT" ? "#fff" : "#000",
                      borderRight: index < stints.length - 1 ? "1px solid rgba(0,0,0,0.06)" : "none",
                    }}
                  >
                    {stintLaps > 0 ? `${stintLaps}` : ""}
                  </div>
                );
              });
            })()}
          </div>
        </div>
      ))}
      </div>
    </div>
  );
};

export default React.memo(StintsGraph);
