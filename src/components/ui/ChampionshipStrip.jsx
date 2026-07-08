import React from "react";

import DriverAvatar from "../Common/DriverAvatar";
import CountryFlag from "./CountryFlag";
import { useAnimatedNumber } from "../../hooks/useAnimatedNumber";
import Surface from "./Surface";
import { getTeamColorBorder } from "../../common/utils/colors";

const ChampionshipStrip = ({ leaders = [], title = "Championship", className = "" }) => {
  if (!leaders.length) return null;

  return (
    <Surface tier="container-high" className={`p-4 ${className}`}>
      <p className="md3-label-md text-[var(--md-on-surface-variant)] mb-3 uppercase tracking-wider">{title}</p>
      <div className="space-y-2">
        {leaders.slice(0, 3).map((driver) => (
          <LeaderRow key={driver.driverId || driver.driver_number} driver={driver} />
        ))}
      </div>
    </Surface>
  );
};

const LeaderRow = ({ driver }) => {
  const animatedPoints = useAnimatedNumber(driver.season?.points ?? 0);
  const teamColor = getTeamColorBorder(driver.team_colour);

  return (
    <div className="atlassian-card flex items-center gap-3 rounded-[var(--shape-md)] bg-[var(--md-surface-container)] border border-[var(--md-outline-variant)] pl-4 pr-3 py-2.5" style={{ "--card-accent": teamColor }}>
      <span className="md3-title-md w-6 tabular-nums text-[var(--md-on-surface-variant)] font-mono shrink-0">
        {driver.season?.position || "—"}
      </span>
      <DriverAvatar driver={driver} size="sm" variant="circle" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="md3-title-md truncate">{driver.full_name}</p>
          <CountryFlag countryCode={driver.country_code} size="sm" />
        </div>
        <p className="md3-label-md truncate" style={{ color: teamColor }}>{driver.team_name}</p>
      </div>
      <span className="md3-title-md font-mono tabular-nums shrink-0">{animatedPoints}</span>
    </div>
  );
};

export default ChampionshipStrip;
