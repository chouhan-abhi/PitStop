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
    <div className={`flex items-center gap-4 min-w-0 ${className}`}>
      <span className="md3-headline-md w-10 text-center tabular-nums text-[var(--md-on-surface-variant)]">
        {final ?? "—"}
      </span>
      <DriverAvatar
        driver={driver}
        size={large ? "lg" : "md"}
        variant={large ? "portrait" : "circle"}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="md3-title-md truncate">{driver?.full_name || "Unknown"}</p>
          <CountryFlag countryCode={driver?.country_code} size="sm" />
        </div>
        <p className="md3-body-md truncate" style={{ color: getTeamColorBorder(driver?.team_colour) }}>
          {driver?.team_name || "—"}
        </p>
      </div>
      {start != null && (
        <div className="text-right hidden sm:block">
          <p className="md3-label-md text-[var(--md-on-surface-variant)]">Grid</p>
          <p className="md3-title-md font-mono tabular-nums">{start}</p>
        </div>
      )}
      {delta != null && delta !== 0 && (
        <span
          className={`md3-label-md font-mono px-2 py-1 rounded-[var(--shape-sm)] ${
            delta > 0 ? "text-[var(--success)]" : "text-[var(--danger)]"
          }`}
        >
          {delta > 0 ? `+${delta}` : delta}
        </span>
      )}
      {showPoints && points != null && (
        <span className="md3-title-md font-mono tabular-nums w-10 text-right">{points}</span>
      )}
    </div>
  );
};

export default DriverRow;
