import React, { useEffect, useMemo, useState } from "react";
import { CalendarClock, Gauge, Loader2, Medal, Trophy } from "lucide-react";

import DriverAvatar from "../Common/DriverAvatar";
import { useLatestSessionDrivers } from "./useLatestSessionDrivers";

const formatAvg = (value) => (value == null ? "-" : value.toFixed(2));

const getTeamColor = (teamColour) => {
  if (!teamColour) return "var(--primary-color)";
  return teamColour.startsWith("#") ? teamColour : `#${teamColour}`;
};

const getTeamBadgeStyle = (teamColor) =>
  teamColor.startsWith("#")
    ? { color: teamColor, borderColor: `${teamColor}66`, backgroundColor: `${teamColor}1A` }
    : {
        color: "var(--primary-color)",
        borderColor: "color-mix(in srgb, var(--primary-color) 40%, transparent)",
        backgroundColor: "color-mix(in srgb, var(--primary-color) 12%, transparent)",
      };

const DriverDetailPanel = ({ driver }) => {
  if (!driver) {
    return (
      <div className="f1-card rounded-md border border-[var(--border-color)] bg-[var(--panel-color)]/90 p-5 h-full">
        <p className="text-sm text-[var(--text-secondary)]">Select a driver to view season stats.</p>
      </div>
    );
  }

  const season = driver.season || {};
  const teamColor = getTeamColor(driver.team_colour);
  const teamBadgeStyle = getTeamBadgeStyle(teamColor);

  return (
    <div className="f1-card rounded-md border border-[var(--border-color)] bg-[var(--panel-color)]/90 p-4 sm:p-5 h-full">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <DriverAvatar driver={driver} sizeClass="w-14 h-14" roundedClass="rounded-md" textClass="text-base" />
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)]">Driver Detail</p>
            <h3 className="display-title text-xl sm:text-2xl font-bold mt-1 truncate">{driver.full_name}</h3>
            <p className="text-sm text-[var(--text-secondary)] mt-1 truncate">{driver.team_name || "F1 Team"}</p>
          </div>
        </div>
        <span
          className="inline-flex items-center justify-center rounded-full px-2.5 py-1 text-xs font-semibold border"
          style={teamBadgeStyle}
        >
          #{driver.driver_number}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-4 text-sm">
        <div className="f1-card rounded-sm border border-[var(--border-color)] bg-black/20 p-2">
          <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--text-muted)]">Position</p>
          <p className="text-lg font-bold">{season.position || "-"}</p>
        </div>
        <div className="f1-card rounded-sm border border-[var(--border-color)] bg-black/20 p-2">
          <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--text-muted)]">Points</p>
          <p className="text-lg font-bold">{season.points || 0}</p>
        </div>
        <div className="f1-card rounded-sm border border-[var(--border-color)] bg-black/20 p-2">
          <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--text-muted)]">Wins / Podiums</p>
          <p className="text-lg font-bold">{season.wins || 0} / {season.podiums || 0}</p>
        </div>
        <div className="f1-card rounded-sm border border-[var(--border-color)] bg-black/15 p-2">
          <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--text-muted)]">Races</p>
          <p className="text-lg font-bold">{season.races || 0}</p>
        </div>
        <div className="f1-card rounded-sm border border-[var(--border-color)] bg-black/15 p-2">
          <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--text-muted)]">Best Finish</p>
          <p className="text-lg font-bold">P{season.bestFinish || "-"}</p>
        </div>
        <div className="f1-card rounded-sm border border-[var(--border-color)] bg-black/15 p-2">
          <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--text-muted)]">Avg Finish</p>
          <p className="text-lg font-bold">{formatAvg(season.averageFinish)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 text-sm">
        <div className="f1-card rounded-sm border border-[var(--border-color)] bg-black/15 p-3">
          <div className="flex items-center gap-2 text-[var(--text-secondary)] text-xs uppercase tracking-[0.14em]">
            <Trophy size={14} /> Nationality
          </div>
          <p className="text-base font-semibold mt-2">{driver.ergast?.nationality || "Unknown"}</p>
        </div>
        <div className="f1-card rounded-sm border border-[var(--border-color)] bg-black/15 p-3">
          <div className="flex items-center gap-2 text-[var(--text-secondary)] text-xs uppercase tracking-[0.14em]">
            <Gauge size={14} /> Season Pace
          </div>
          <p className="text-base font-semibold mt-2">{formatAvg(season.averageFinish)} average finish</p>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center gap-2 text-[var(--text-secondary)] text-xs uppercase tracking-[0.14em]">
          <CalendarClock size={14} /> Recent Results
        </div>
        <div className="mt-2 space-y-1.5">
          {(season.lastFive || []).length ? (
            season.lastFive
              .slice()
              .reverse()
              .map((result) => (
                <div
                  key={`${driver.driver_number}-${result.round}`}
                  className="f1-card rounded-sm border border-[var(--border-color)] bg-black/25 px-2 py-1.5 text-xs flex items-center justify-between gap-2"
                >
                  <span className="truncate">{result.raceName || `Round ${result.round}`}</span>
                  <span className="font-semibold">P{result.position || "-"} · {result.points || 0} pts</span>
                </div>
              ))
          ) : (
            <span className="text-xs text-[var(--text-secondary)]">No recent race records.</span>
          )}
        </div>
      </div>

      {driver.ergast?.url && (
        <a
          href={driver.ergast.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-xs mt-4 text-[var(--primary-color)]"
        >
          Profile source <Medal size={12} />
        </a>
      )}
    </div>
  );
};

function SessionDriversGrid({ meetingKey, sessionKey, year }) {
  const { data: drivers, isLoading, isError } = useLatestSessionDrivers(meetingKey, sessionKey, { year });
  const [selectedNumber, setSelectedNumber] = useState(undefined);

  const filteredDrivers = useMemo(() => {
    if (!drivers) return [];

    const map = new Map();
    for (const driver of drivers) {
      if (!map.has(driver.driver_number)) {
        map.set(driver.driver_number, driver);
      }
    }

    return Array.from(map.values()).sort((a, b) => {
      const apos = a?.season?.position || Number.POSITIVE_INFINITY;
      const bpos = b?.season?.position || Number.POSITIVE_INFINITY;
      if (apos !== bpos) return apos - bpos;
      return Number(a.driver_number) - Number(b.driver_number);
    });
  }, [drivers]);

  useEffect(() => {
    if (!filteredDrivers.length) {
      setSelectedNumber(undefined);
      return;
    }

    if (
      selectedNumber === undefined ||
      !filteredDrivers.some((driver) => driver.driver_number === selectedNumber)
    ) {
      setSelectedNumber(filteredDrivers[0].driver_number);
    }
  }, [filteredDrivers, selectedNumber]);

  const selectedDriver = useMemo(
    () => filteredDrivers.find((driver) => driver.driver_number === selectedNumber) || null,
    [filteredDrivers, selectedNumber]
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10 opacity-70">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    );
  }

  if (isError || !filteredDrivers.length) {
    return (
      <p className="text-center py-10 text-[var(--text-secondary)]">
        No driver data available for this season.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)] gap-4">
      <div className="f1-card rounded-md border border-[var(--border-color)] bg-[var(--panel-color)]/70 p-2 sm:p-3">
        <p className="px-2 pb-2 text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)]">
          Driver List
        </p>
        <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1 scrollbar-thin">
          {filteredDrivers.map((driver) => {
            const isSelected = selectedNumber === driver.driver_number;
            const teamColor = getTeamColor(driver.team_colour);

            return (
              <button
                key={driver.driver_number}
                type="button"
                onClick={() => setSelectedNumber(driver.driver_number)}
                className={`w-full text-left relative flex items-center gap-3 p-3 rounded-md border transition-all ${
                  isSelected
                    ? "border-red-500/70 ring-1 ring-red-500/40 bg-black/30"
                    : "border-[var(--border-color)] bg-black/20 hover:border-red-500/35"
                }`}
              >
                <div
                  className="absolute left-0 top-0 bottom-0 w-1 rounded-l-md"
                  style={{ backgroundColor: teamColor }}
                />

                <DriverAvatar driver={driver} sizeClass="w-10 h-10" roundedClass="rounded-md" textClass="text-sm" />

                <div className="min-w-0 flex-1">
                  <p className="display-title text-base font-bold truncate">{driver.full_name}</p>
                  <p className="text-xs text-[var(--text-secondary)] truncate">{driver.team_name || "F1 Team"}</p>
                </div>

                <div className="flex flex-col items-end">
                  <span className="text-xs text-[var(--text-muted)]">#{driver.driver_number}</span>
                  <span className="inline-flex items-center gap-1 text-[10px] text-[var(--text-secondary)]">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: teamColor }} />
                    Team
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <DriverDetailPanel driver={selectedDriver} />
    </div>
  );
}

export default React.memo(SessionDriversGrid);
