import React from "react";

import DriverAvatar from "../Common/DriverAvatar";
import { getTeamColorBorder } from "../../common/utils/colors";

const DriverRow = ({
  driver,
  position,
  startPosition,
  points,
  showPoints = false,
  className = "",
}) => {
  const final = position ?? driver?.position;
  const start = startPosition ?? driver?.startingPosition;
  const delta = final && start ? start - final : null;

  return (
    <div className={`flex items-center gap-3 min-w-0 ${className}`}>
      <span className="display-title text-lg font-bold w-8 text-center text-[var(--text-primary)] tabular-nums">
        {final ?? "—"}
      </span>
      <div
        className="rounded-[var(--radius-full)] p-0.5"
        style={{ boxShadow: `0 0 0 2px ${getTeamColorBorder(driver?.team_colour)}` }}
      >
        <DriverAvatar driver={driver} sizeClass="w-9 h-9" textClass="text-xs" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[var(--text-primary)] truncate">
          {driver?.full_name || "Unknown"}
        </p>
        <p
          className="text-xs truncate"
          style={{ color: getTeamColorBorder(driver?.team_colour) }}
        >
          {driver?.team_name || "—"}
        </p>
      </div>
      {start != null && (
        <div className="text-right hidden sm:block">
          <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Grid</p>
          <p className="text-sm font-mono text-[var(--text-secondary)]">{start}</p>
        </div>
      )}
      {delta != null && delta !== 0 && (
        <span
          className={`text-xs font-mono px-1.5 py-0.5 rounded ${
            delta > 0 ? "text-[var(--success)]" : "text-[var(--danger)]"
          }`}
        >
          {delta > 0 ? `+${delta}` : delta}
        </span>
      )}
      {showPoints && points != null && (
        <span className="text-sm font-mono font-semibold text-[var(--text-primary)] w-8 text-right">
          {points}
        </span>
      )}
    </div>
  );
};

export default DriverRow;
