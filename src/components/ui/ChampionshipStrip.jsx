import React from "react";

import DriverAvatar from "../Common/DriverAvatar";
import CountryFlag from "./CountryFlag";
import { useAnimatedNumber } from "../../hooks/useAnimatedNumber";
import Surface from "./Surface";

const ChampionshipStrip = ({ leaders = [], title = "Championship", className = "" }) => {
  if (!leaders.length) return null;

  return (
    <Surface tier="container-high" className={`p-5 ${className}`}>
      <p className="md3-label-md text-[var(--md-on-surface-variant)] mb-4">{title}</p>
      <div className="space-y-4">
        {leaders.slice(0, 3).map((driver) => (
          <LeaderRow key={driver.driverId || driver.driver_number} driver={driver} />
        ))}
      </div>
    </Surface>
  );
};

const LeaderRow = ({ driver }) => {
  const animatedPoints = useAnimatedNumber(driver.season?.points ?? 0);

  return (
    <div className="flex items-center gap-4">
      <span className="md3-headline-md w-8 tabular-nums text-[var(--md-on-surface-variant)]">
        {driver.season?.position || "—"}
      </span>
      <DriverAvatar driver={driver} size="lg" variant="portrait" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="md3-title-md truncate">{driver.full_name}</p>
          <CountryFlag countryCode={driver.country_code} size="sm" />
        </div>
        <p className="md3-body-md text-[var(--md-on-surface-variant)] truncate">{driver.team_name}</p>
      </div>
      <span className="md3-title-md font-mono tabular-nums">{animatedPoints}</span>
    </div>
  );
};

export default ChampionshipStrip;
