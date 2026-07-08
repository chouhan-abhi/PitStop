import React from "react";
import { Trophy } from "lucide-react";

import DriverAvatar from "../Common/DriverAvatar";
import CountryFlag from "./CountryFlag";
import { getTeamColorBorder } from "../../common/utils/colors";

const POSITION_BADGE = {
  1: { bg: "bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/30", icon: true },
  2: { bg: "bg-slate-400/20 text-slate-300 ring-1 ring-slate-400/30", icon: false },
  3: { bg: "bg-orange-600/20 text-orange-300 ring-1 ring-orange-500/30", icon: false },
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
  const teamColor = getTeamColorBorder(driver?.team_colour);
  const posStyle = POSITION_BADGE[pos] || null;

  const Wrapper = onClick ? "button" : "div";

  if (compact) {
    return (
      <Wrapper
        type={onClick ? "button" : undefined}
        onClick={onClick}
        className={`md3-state-layer md3-card-hover atlassian-card w-full text-left overflow-hidden rounded-[var(--shape-md)] bg-[var(--md-surface-container-high)] border border-[var(--md-outline-variant)] ${
          onClick ? "cursor-pointer" : ""
        } ${className}`}
        style={{ "--card-accent": teamColor }}
      >
        <div className="flex items-center gap-3 pl-4 pr-3 py-3">
          <DriverAvatar driver={driver} size="sm" variant="circle" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              {pos && (
                <span className={`inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-[var(--shape-xs)] ${posStyle?.bg || "bg-[var(--md-surface-container-highest)] text-[var(--md-on-surface-variant)]"}`}>
                  {posStyle?.icon && <Trophy size={9} />}
                  P{pos}
                </span>
              )}
              <CountryFlag countryCode={driver?.country_code} size="sm" />
            </div>
            <p className="md3-title-md truncate leading-tight mt-0.5">{driver?.full_name || "Driver"}</p>
            <p className="md3-label-md truncate" style={{ color: teamColor }}>{driver?.team_name}</p>
          </div>
          {driver?.season?.points != null && (
            <span className="md3-label-lg font-mono tabular-nums text-[var(--md-on-surface-variant)] shrink-0">
              {driver.season.points}p
            </span>
          )}
        </div>
      </Wrapper>
    );
  }

  return (
    <Wrapper
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={`md3-state-layer md3-card-hover atlassian-card w-full text-left overflow-hidden rounded-[var(--shape-lg)] bg-[var(--md-surface-container)] border border-[var(--md-outline-variant)] ${
        onClick ? "cursor-pointer" : ""
      } ${featured ? "sm:col-span-2" : ""} ${className}`}
      style={{ "--card-accent": teamColor }}
    >
      <div className={`flex ${featured ? "sm:flex-row flex-col" : "flex-col"} gap-0`}>
        <div className={`relative overflow-hidden bg-[var(--md-surface-container-high)] ${featured ? "sm:w-44 shrink-0" : "w-full"}`}>
          <DriverAvatar
            driver={driver}
            variant="portrait"
            size={featured ? "xl" : "lg"}
            className="w-full"
            priority={featured}
          />
          {pos && (
            <div className={`absolute top-2 right-2 inline-flex items-center gap-1 px-2 py-1 rounded-[var(--shape-sm)] backdrop-blur-sm text-xs font-bold ${posStyle?.bg || "bg-black/50 text-white"}`}>
              {posStyle?.icon && <Trophy size={11} />}
              P{pos}
            </div>
          )}
        </div>

        <div className="p-3 flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1.5">
            <CountryFlag countryCode={driver?.country_code} size="sm" />
          </div>
          <p className={`md3-headline-md truncate leading-tight`}>
            {driver?.full_name || "Driver"}
          </p>
          <p className="md3-body-md mt-0.5 truncate font-semibold" style={{ color: teamColor }}>
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
