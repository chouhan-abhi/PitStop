import React from "react";
import { X } from "lucide-react";

/** Pill showing which slot (A or B) a driver occupies, or an empty drop-target */
const SlotBadge = ({ label, driver, onClear, accentColor }) => {
  const teamColor = driver?.team_colour ? `#${driver.team_colour}` : accentColor;

  if (!driver) {
    return (
      <div
        className="flex items-center gap-2 px-3 py-2.5 border border-dashed border-white/10 flex-1 min-w-0"
        style={{ borderRadius: "var(--shape-xs)" }}
      >
        <span className="font-mono text-[10px] font-black shrink-0" style={{ color: accentColor }}>
          {label}
        </span>
        <span className="font-mono text-[9px] text-[var(--md-on-surface-variant)] uppercase tracking-wider truncate">
          SELECT DRIVER
        </span>
      </div>
    );
  }

  return (
    <div
      className="flex items-center gap-2 px-3 py-2.5 border flex-1 min-w-0"
      style={{
        borderRadius: "var(--shape-xs)",
        borderLeft: `3px solid ${teamColor}`,
        borderTop: `1px solid ${teamColor}30`,
        borderRight: `1px solid ${teamColor}20`,
        borderBottom: `1px solid ${teamColor}20`,
        backgroundColor: `${teamColor}10`,
      }}
    >
      <span className="font-mono text-[10px] font-black shrink-0" style={{ color: accentColor }}>
        {label}
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-[11px] font-bold text-white truncate">
          {driver.name_acronym} · {driver.last_name || driver.full_name}
        </div>
        <div className="text-[9px] font-mono text-[var(--md-on-surface-variant)] truncate">
          {driver.team_name}
        </div>
      </div>
      <button
        type="button"
        onClick={onClear}
        aria-label={`Remove driver ${label}`}
        className="shrink-0 text-[var(--md-on-surface-variant)] hover:text-white transition-colors p-0.5"
      >
        <X size={11} />
      </button>
    </div>
  );
};

/**
 * DriverSelectorPanel — pick up to 2 drivers for telemetry comparison.
 *
 * Selection logic:
 *   • Click unselected driver with A empty  → assigns to A
 *   • Click unselected driver with A filled → assigns to B (replaces B if occupied)
 *   • Click already-selected driver          → clears that slot
 */
const DriverSelectorPanel = ({
  drivers = [],
  driverA = null,
  driverB = null,
  onSelectA,
  onSelectB,
}) => {
  const handleTile = (num) => {
    if (num === driverA) {
      onSelectA(null);
      return;
    }
    if (num === driverB) {
      onSelectB(null);
      return;
    }
    if (driverA === null) {
      onSelectA(num);
    } else {
      // A is already set → assign / replace B
      onSelectB(num);
    }
  };

  const driverAObj = drivers.find((d) => d.driver_number === driverA) || null;
  const driverBObj = drivers.find((d) => d.driver_number === driverB) || null;

  return (
    <div className="space-y-3">
      {/* Active slots row */}
      <div className="flex items-stretch gap-2">
        <SlotBadge
          label="A"
          driver={driverAObj}
          onClear={() => { onSelectA(null); onSelectB(null); }}
          accentColor="var(--md-primary)"
        />
        <div className="flex items-center shrink-0 font-mono text-[9px] text-[var(--md-on-surface-variant)] font-bold px-1">
          VS
        </div>
        <SlotBadge
          label="B"
          driver={driverBObj}
          onClear={() => onSelectB(null)}
          accentColor="#fb923c"
        />
      </div>

      {/* Driver grid */}
      <div
        className="grid gap-1.5"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(148px, 1fr))" }}
      >
        {drivers.map((driver) => {
          const num = driver.driver_number;
          const isA = driverA === num;
          const isB = driverB === num;
          const teamColor = driver.team_colour ? `#${driver.team_colour}` : "var(--md-primary)";

          return (
            <button
              key={num}
              type="button"
              onClick={() => handleTile(num)}
              className={[
                "flex items-center gap-2 p-2.5 text-left transition-colors border",
                isA
                  ? "bg-[var(--md-primary)]/15 border-[var(--md-primary)]/40"
                  : isB
                  ? "bg-orange-500/10 border-orange-500/35"
                  : "bg-[var(--md-surface-container)] border-[var(--md-outline-variant)] hover:border-white/20 hover:bg-white/[0.02]",
              ].join(" ")}
              style={{
                borderRadius: "var(--shape-xs)",
                borderLeft: `3px solid ${teamColor}`,
              }}
            >
              {/* Acronym badge */}
              <span
                className="font-mono text-[10px] font-black px-1.5 py-0.5 shrink-0"
                style={{
                  color: teamColor,
                  backgroundColor: `${teamColor}18`,
                  borderRadius: "2px",
                  border: `1px solid ${teamColor}28`,
                }}
              >
                {driver.name_acronym || `#${num}`}
              </span>

              <div className="min-w-0 flex-1">
                <div className="text-[11px] font-bold text-white truncate leading-tight">
                  {driver.last_name || driver.full_name || `Driver #${num}`}
                </div>
                <div className="text-[9px] font-mono text-[var(--md-on-surface-variant)] truncate">
                  {driver.team_name || ""}
                </div>
              </div>

              {/* Slot indicator */}
              {(isA || isB) && (
                <span
                  className="shrink-0 font-mono text-[9px] font-black"
                  style={{ color: isA ? "var(--md-primary)" : "#fb923c" }}
                >
                  {isA ? "A" : "B"}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {drivers.length === 0 && (
        <p className="font-mono text-[10px] text-[var(--md-on-surface-variant)] text-center py-4">
          NO DRIVER DATA AVAILABLE FOR THIS SESSION.
        </p>
      )}
    </div>
  );
};

export default DriverSelectorPanel;
