import React from "react";
import { X } from "lucide-react";

import DriverAvatar from "../Common/DriverAvatar";
import Button from "../ui/Button";
import Panel from "../ui/Panel";

const formatAvg = (value) => (value == null ? "-" : value.toFixed(2));

const DriverDetailDrawer = ({ driver, onClose }) => {
  if (!driver) return null;

  const season = driver.season || {};

  return (
    <div className="fixed inset-0 z-[70] flex justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-label="Close drawer"
      />
      <Panel className="relative w-full max-w-md h-full overflow-y-auto rounded-none border-l border-[var(--border-color)] p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <DriverAvatar driver={driver} sizeClass="w-16 h-16" textClass="text-base" />
            <div>
              <p className="display-title text-xl font-bold">{driver.full_name}</p>
              <p className="text-sm text-[var(--text-secondary)]">{driver.team_name}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close">
            <X size={16} />
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-2 text-sm">
          <Stat label="Position" value={season.position || "—"} />
          <Stat label="Points" value={season.points || 0} />
          <Stat label="Wins" value={season.wins || 0} />
          <Stat label="Podiums" value={season.podiums || 0} />
          <Stat label="Best" value={season.bestFinish ? `P${season.bestFinish}` : "—"} />
          <Stat label="Avg" value={formatAvg(season.averageFinish)} />
        </div>

        {(season.lastFive || []).length > 0 && (
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] mb-2">
              Recent Results
            </p>
            <div className="space-y-1.5">
              {season.lastFive.slice().reverse().map((r) => (
                <div
                  key={`${driver.driver_number}-${r.round}`}
                  className="flex justify-between text-xs border border-[var(--border-color)] rounded-[var(--radius-sm)] px-2 py-1.5"
                >
                  <span className="truncate">{r.raceName}</span>
                  <span className="font-mono">P{r.position} · {r.points}pts</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Panel>
    </div>
  );
};

const Stat = ({ label, value }) => (
  <div className="border border-[var(--border-color)] rounded-[var(--radius-sm)] p-2 bg-[var(--surface-2)]/40">
    <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">{label}</p>
    <p className="text-lg font-bold font-mono">{value}</p>
  </div>
);

export default DriverDetailDrawer;
