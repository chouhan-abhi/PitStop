import React, { useEffect, useMemo, useState } from "react";
import { ChevronRight, Loader2, Trophy, Medal, Gauge, CalendarClock } from "lucide-react";

import { useLatestSessionDrivers } from "./useLatestSessionDrivers";

const formatAvg = (value) => (value == null ? "-" : value.toFixed(2));

const DriverDetailPanel = ({ driver, onClose }) => {
  if (!driver) return null;

  const season = driver.season || {};

  return (
    <div className="f1-card rounded-md border border-[var(--border-color)] bg-[var(--panel-color)]/90 p-4 mb-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)]">Driver Detail</p>
          <h3 className="display-title text-2xl font-bold mt-1">{driver.full_name}</h3>
          <p className="text-sm text-[var(--text-secondary)] mt-1">{driver.team_name || "F1 Team"}</p>
        </div>
        <button type="button" className="btn btn-ghost" onClick={onClose}>
          Close
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">
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
        <div className="f1-card rounded-sm border border-[var(--border-color)] bg-black/20 p-2">
          <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--text-muted)]">Races</p>
          <p className="text-lg font-bold">{season.races || 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 text-sm">
        <div className="f1-card rounded-sm border border-[var(--border-color)] bg-black/15 p-3">
          <div className="flex items-center gap-2 text-[var(--text-secondary)] text-xs uppercase tracking-[0.14em]">
            <Medal size={14} /> Best Finish
          </div>
          <p className="text-xl font-bold mt-1">P{season.bestFinish || "-"}</p>
        </div>
        <div className="f1-card rounded-sm border border-[var(--border-color)] bg-black/15 p-3">
          <div className="flex items-center gap-2 text-[var(--text-secondary)] text-xs uppercase tracking-[0.14em]">
            <Gauge size={14} /> Avg Finish
          </div>
          <p className="text-xl font-bold mt-1">{formatAvg(season.averageFinish)}</p>
        </div>
        <div className="f1-card rounded-sm border border-[var(--border-color)] bg-black/15 p-3">
          <div className="flex items-center gap-2 text-[var(--text-secondary)] text-xs uppercase tracking-[0.14em]">
            <Trophy size={14} /> Nationality
          </div>
          <p className="text-base font-semibold mt-2">{driver.ergast?.nationality || "Unknown"}</p>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center gap-2 text-[var(--text-secondary)] text-xs uppercase tracking-[0.14em]">
          <CalendarClock size={14} /> Recent Results
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {(season.lastFive || []).length ? (
            season.lastFive.map((result) => (
              <span
                key={`${driver.driver_number}-${result.round}`}
                className="f1-card rounded-sm border border-[var(--border-color)] bg-black/25 px-2 py-1 text-xs"
              >
                R{result.round} · P{result.position || "-"} · {result.points || 0} pts
              </span>
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
          Profile source <ChevronRight size={12} />
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
      (selectedNumber !== null &&
        !filteredDrivers.some((driver) => driver.driver_number === selectedNumber))
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
    <div>
      <DriverDetailPanel driver={selectedDriver} onClose={() => setSelectedNumber(null)} />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 max-h-[72vh] sm:max-h-none overflow-y-auto sm:overflow-visible pr-1">
        {filteredDrivers.map((driver) => {
          const season = driver.season || {};
          const isSelected = selectedNumber === driver.driver_number;

          return (
            <button
              key={driver.driver_number}
              type="button"
              onClick={() => setSelectedNumber(driver.driver_number)}
              className={`f1-card text-left relative flex items-start gap-3 p-3 rounded-md border bg-[var(--panel-color)]/85 transition-all hover:-translate-y-0.5 ${
                isSelected ? 'border-red-500/70 ring-1 ring-red-500/40' : 'border-[var(--border-color)]'
              }`}
            >
              <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: 'var(--primary-color)' }} />

              <div className="w-12 h-12 rounded-sm border border-[var(--border-color)] bg-black/25 flex items-center justify-center text-sm font-bold">
                {driver.name_acronym || '?'}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="display-title text-lg font-bold truncate">{driver.last_name}</span>
                  <span className="text-xs text-[var(--text-muted)]">#{driver.driver_number}</span>
                </div>

                <p className="text-xs text-[var(--text-secondary)] truncate">{driver.full_name}</p>
                <p className="text-xs text-[var(--text-secondary)] truncate mt-0.5">{driver.team_name || 'F1 Team'}</p>

                <div className="grid grid-cols-3 gap-1 mt-2 text-[11px]">
                  <div className="f1-card rounded-sm border border-[var(--border-color)] bg-black/20 px-1.5 py-1">
                    <p className="text-[9px] uppercase text-[var(--text-muted)]">Pos</p>
                    <p className="font-semibold">{season.position || '-'}</p>
                  </div>
                  <div className="f1-card rounded-sm border border-[var(--border-color)] bg-black/20 px-1.5 py-1">
                    <p className="text-[9px] uppercase text-[var(--text-muted)]">Pts</p>
                    <p className="font-semibold">{season.points || 0}</p>
                  </div>
                  <div className="f1-card rounded-sm border border-[var(--border-color)] bg-black/20 px-1.5 py-1">
                    <p className="text-[9px] uppercase text-[var(--text-muted)]">Pod</p>
                    <p className="font-semibold">{season.podiums || 0}</p>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default React.memo(SessionDriversGrid);
