import React from "react";
import { Trophy } from "lucide-react";

import DriverAvatar from "../Common/DriverAvatar";
import CountryFlag from "./CountryFlag";
import { getTeamColorBorder } from "../../common/utils/colors";

const PODIUM_TIERS = {
  1: "bg-[var(--md-primary-container)]",
  2: "bg-[var(--md-surface-container-high)]",
  3: "bg-[var(--md-surface-container)]",
};

const DriverCard = ({
  driver,
  position,
  compact = false,
  featured = false,
  onClick,
  className = "",
}) => {
  const pos = position ?? driver?.position;
  const tierClass = PODIUM_TIERS[pos] || "bg-[var(--md-surface-container)]";
  const teamColor = getTeamColorBorder(driver?.team_colour);

  const Wrapper = onClick ? "button" : "div";

  return (
    <Wrapper
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={`md3-state-layer text-left w-full overflow-hidden rounded-[var(--shape-xl)] ${tierClass} ${
        onClick ? "cursor-pointer" : ""
      } ${featured ? "sm:col-span-2" : ""} ${className}`}
    >
      <div
        className="h-1 w-full"
        style={{ backgroundColor: teamColor }}
        aria-hidden
      />
      <div className={`p-4 ${featured ? "sm:flex sm:gap-4 sm:items-end" : ""}`}>
        <DriverAvatar
          driver={driver}
          variant="portrait"
          size={featured ? "xl" : compact ? "md" : "lg"}
          className={featured ? "sm:w-40 sm:shrink-0 mb-3 sm:mb-0" : "w-full mb-3"}
          priority={featured}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {pos && (
              <span className="md3-label-md text-[var(--md-on-surface-variant)]">P{pos}</span>
            )}
            {pos === 1 && <Trophy size={16} className="text-[var(--warning)]" aria-hidden />}
            <CountryFlag countryCode={driver?.country_code} size="sm" />
          </div>
          <p className={`md3-headline-md truncate ${featured ? "sm:text-2xl" : ""}`}>
            {driver?.full_name || "Driver"}
          </p>
          <p className="md3-body-md truncate mt-1" style={{ color: teamColor }}>
            {driver?.team_name}
          </p>
          {driver?.season?.points != null && (
            <p className="md3-label-lg text-[var(--md-on-surface-variant)] mt-2 font-mono tabular-nums">
              {driver.season.points} pts
            </p>
          )}
        </div>
      </div>
    </Wrapper>
  );
};

export default DriverCard;
