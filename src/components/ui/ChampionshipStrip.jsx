import React from "react";

import DriverAvatar from "../Common/DriverAvatar";
import Panel from "./Panel";

const ChampionshipStrip = ({ leaders = [], title = "Championship", className = "" }) => {
  if (!leaders.length) return null;

  return (
    <Panel className={`p-4 ${className}`}>
      <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] mb-3">
        {title}
      </p>
      <div className="space-y-2">
        {leaders.slice(0, 3).map((driver) => (
          <div key={driver.driverId || driver.driver_number} className="flex items-center gap-3">
            <span className="display-title text-lg font-bold w-6 text-[var(--text-muted)] tabular-nums">
              {driver.season?.position || "—"}
            </span>
            <DriverAvatar driver={driver} sizeClass="w-8 h-8" textClass="text-[10px]" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{driver.full_name}</p>
              <p className="text-xs text-[var(--text-muted)] truncate">{driver.team_name}</p>
            </div>
            <span className="text-sm font-mono font-semibold text-[var(--text-primary)]">
              {driver.season?.points ?? 0}
            </span>
          </div>
        ))}
      </div>
    </Panel>
  );
};

export default ChampionshipStrip;
