import React, { useMemo } from "react";

import { getTeamColorBorder } from "../../common/utils/colors";
import DriverAvatar from "../Common/DriverAvatar";
import WinnerDriverCard from "../Common/WinnerDriverCard";
import SectionHeader from "../ui/SectionHeader";

export const TopDriversCard = ({
  driversData,
  driversLoading,
  driversIsError,
  driversError,
}) => {
  const top3 = useMemo(() => driversData?.slice(0, 3) || [], [driversData]);

  const ShimmerRow = () => (
    <div className="flex items-center gap-3 p-3">
      <div className="w-12 h-12 rounded-full bg-[var(--skeleton-color)]" />
      <div className="flex flex-col gap-2">
        <div className="h-3 w-32 bg-[var(--skeleton-color)] rounded" />
        <div className="h-3 w-20 bg-[var(--skeleton-color)] rounded" />
      </div>
    </div>
  );

  if (driversLoading) {
    return (
      <div className="p-4 rounded-xl bg-[var(--panel-color)] border border-[var(--border-color)] animate-pulse">
        <ShimmerRow />
        <ShimmerRow />
        <ShimmerRow />
      </div>
    );
  }

  if (driversIsError) {
    return <p className="text-red-400">{driversError?.message || "Failed to load driver data"}</p>;
  }

  if (!top3.length) {
    return <p className="opacity-60">No podium results available.</p>;
  }

  const winner = top3[0];
  const runnerUps = top3.slice(1);

  return (
    <div className="text-[var(--text-color)]">
      <SectionHeader title="Podium Finishers" subtitle="Latest classified order" compact />

      <div className="flex flex-col sm:flex-row gap-4">
        <WinnerDriverCard driver={winner} />

        <div className="flex flex-col gap-3 sm:w-[48%]">
          {runnerUps.map((driver, idx) => (
            <div
              key={driver.driver_number}
              className="relative overflow-hidden flex items-center gap-3 p-3 rounded-xl bg-[var(--panel-color)] border border-[var(--border-color)]"
              style={{ borderLeft: `4px solid ${getTeamColorBorder(driver.team_colour)}` }}
            >
              <div
                className="absolute -right-1 -top-3 text-[74px] display-title font-black tracking-tight text-white/10 select-none"
                aria-hidden="true"
              >
                {driver.driver_number}
              </div>

              <DriverAvatar
                driver={driver}
                sizeClass="w-14 h-14"
                roundedClass="rounded-full"
                className="shadow-inner"
                textClass="text-sm"
              />

              <div className="flex flex-col">
                <span className="text-base font-semibold tracking-tight">
                  P{idx + 2} {driver.broadcast_name}
                </span>
                <span className="text-sm opacity-70">{driver.team_name}</span>
                <span className="text-xs opacity-60 mt-1">Driver #{driver.driver_number}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
