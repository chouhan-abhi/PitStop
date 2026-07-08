import React from "react";

import DriverAvatar from "../Common/DriverAvatar";
import CountryFlag from "./CountryFlag";
import { getTeamColorBorder } from "../../common/utils/colors";

const DriverRow = ({
  driver,
  position,
  startPosition,
  points,
  showPoints = false,
  large = false,
  className = "",
}) => {
  const final = position ?? driver?.position;
  const start = startPosition ?? driver?.startingPosition;
  const delta = final && start ? start - final : null;

  return (
    <div className={`flex items-center gap-3 min-w-0 ${className}`}>
      <span className="md3-title-md w-8 text-center tabular-nums text-[var(--md-on-surface-variant)] font-mono shrink-0">
        {final ?? "—"}
      </span>
      <DriverAvatar
        driver={driver}
        size={large ? "md" : "sm"}
        variant="circle"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="md3-title-md truncate">{driver?.full_name || "Unknown"}</p>
          <CountryFlag countryCode={driver?.country_code} size="sm" />
        </div>
        <p className="md3-label-md truncate" style={{ color: getTeamColorBorder(driver?.team_colour) }}>
          {driver?.team_name || "—"}
        </p>
      </div>
      {start != null && (
        <div className="text-right hidden sm:block shrink-0">
          <p className="md3-label-md text-[var(--md-on-surface-variant)]">Grid</p>
          <p className="md3-label-lg font-mono tabular-nums">{start}</p>
        </div>
      )}
      {delta != null && delta !== 0 && (
        <span
          className={`md3-label-md font-mono px-1.5 py-0.5 rounded-[var(--shape-xs)] shrink-0 ${
            delta > 0 ? "text-[var(--success)] bg-[color-mix(in_srgb,var(--success)_12%,transparent)]" : "text-[var(--danger)] bg-[color-mix(in_srgb,var(--danger)_12%,transparent)]"
          }`}
        >
          {delta > 0 ? `+${delta}` : delta}
        </span>
      )}
      {showPoints && points != null && (
        <span className="md3-label-lg font-mono tabular-nums w-8 text-right shrink-0">{points}</span>
      )}
    </div>
  );
};

export default DriverRow;
