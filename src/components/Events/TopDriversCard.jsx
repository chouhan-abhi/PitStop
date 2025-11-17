import React, { useMemo } from "react";
import {
  getTeamColorWithOpacity,
  getTeamColorBorder,
} from "../../common/utils/colors";
import WinnerDriverCard from "../Common/WinnerDriverCard";

export const TopDriversCard = ({
  driversData,
  driversLoading,
  driversIsError,
  driversError,
}) => {
  const top3 = useMemo(() => driversData?.slice(0, 3) || [], [driversData]);

  /* ---------------------- SHIMMER ---------------------- */
  const ShimmerRow = () => (
    <div className="flex items-center gap-3 p-3">
      <div className="w-12 h-12 rounded-full bg-[var(--skeleton-color)]"></div>
      <div className="flex flex-col gap-2">
        <div className="h-3 w-32 bg-[var(--skeleton-color)] rounded"></div>
        <div className="h-3 w-20 bg-[var(--skeleton-color)] rounded"></div>
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
    return (
      <p className="text-red-400">
        {driversError?.message || "Failed to load driver data"}
      </p>
    );
  }

  if (!top3.length) {
    return <p className="opacity-60">No podium results available.</p>;
  }

  const winner = top3[0];
  const runnerUps = top3.slice(1);

  return (
    <div className="bg-[var(--card-bg)] text-[var(--text-color)]">
      <h3 className="text-lg font-semibold mb-4 tracking-tight">
        Podium Finishers
      </h3>

      <div className="flex flex-col sm:flex-row gap-6">
        <WinnerDriverCard driver={winner} />

        <div className="flex flex-col gap-4 sm:w-1/3">
          {runnerUps.map((d, idx) => (
            <div
              key={d.driver_number}
              className="
                flex items-center gap-4 p-4 rounded-sm
                bg-[var(--panel-color)]
                hover:shadow-md transition-all
              "
              style={{
                borderLeft: `4px solid ${getTeamColorBorder(d.team_colour)}`,
              }}
            >
              <div
                className="w-18 h-18 rounded-full flex items-center justify-center shadow-inner"
                style={{
                  background: d.team_colour
                    ? `conic-gradient(#${d.team_colour} 0%, #${d.team_colour}80 40%, transparent 40%)`
                    : "conic-gradient(var(--primary-color) 0%, transparent 40%)",
                }}
              >
                <img
                  src={d.headshot_url}
                  alt={d.full_name}
                  className="w-16 h-16 rounded-full object-cover shadow-lg"
                />
              </div>

              <div className="flex flex-col">
                <span className="text-lg font-semibold tracking-tight">
                  {idx === 0 ? "🥈" : "🥉"} {d.broadcast_name}
                </span>
                <span className="text-sm opacity-70">{d.team_name}</span>
                <span className="text-xs opacity-60 mt-1">
                  Driver No: <b>{d.driver_number}</b>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
