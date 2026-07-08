import React from "react";
import { Trophy } from "lucide-react";

import DriverAvatar from "../Common/DriverAvatar";
import { getTeamColorBorder } from "../../common/utils/colors";

const PODIUM_STYLES = {
  1: "border-[var(--accent-red-border)] bg-[var(--accent-red-subtle)]",
  2: "border-[var(--border-color)] bg-[var(--surface-2)]/60",
  3: "border-[var(--border-color)] bg-[var(--surface-2)]/40",
};

const DriverCard = ({ driver, position, compact = false, onClick, className = "" }) => {
  const pos = position ?? driver?.position;
  const podiumStyle = PODIUM_STYLES[pos] || "border-[var(--border-color)] bg-[var(--panel-color)]";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={`text-left w-full rounded-[var(--radius-lg)] border p-3 sm:p-4 transition-all ${
        onClick ? "hover:border-[var(--accent-red-border)] cursor-pointer" : "cursor-default"
      } ${podiumStyle} ${className}`}
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <div
            className="rounded-[var(--radius-full)] p-0.5"
            style={{ boxShadow: `0 0 0 2px ${getTeamColorBorder(driver?.team_colour)}` }}
          >
            <DriverAvatar
              driver={driver}
              sizeClass={compact ? "w-12 h-12" : "w-16 h-16"}
              textClass={compact ? "text-sm" : "text-base"}
            />
          </div>
          {pos === 1 && (
            <Trophy
              size={14}
              className="absolute -top-1 -right-1 text-[var(--accent-amber)]"
              aria-hidden
            />
          )}
        </div>
        <div className="flex-1 min-w-0">
          {pos && (
            <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)]">
              P{pos}
            </p>
          )}
          <p className={`display-title font-bold truncate ${compact ? "text-lg" : "text-xl"}`}>
            {driver?.full_name || "Driver"}
          </p>
          <p
            className="text-xs truncate mt-0.5"
            style={{ color: getTeamColorBorder(driver?.team_colour) }}
          >
            {driver?.team_name}
          </p>
          {driver?.season?.points != null && (
            <p className="text-xs text-[var(--text-secondary)] mt-1 font-mono">
              {driver.season.points} pts
            </p>
          )}
        </div>
      </div>
    </button>
  );
};

export default DriverCard;
