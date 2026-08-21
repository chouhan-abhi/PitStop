import React from "react";
import { Wrench, ShieldAlert } from "lucide-react";
import Surface from "../ui/Surface";
import LoadingState from "../ui/LoadingState";
import { usePitStops } from "./usePitStops";

const compoundBadgeColor = (compound) => {
  const c = String(compound || "").toUpperCase();
  if (c.includes("SOFT")) return { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/30" };
  if (c.includes("MEDIUM")) return { bg: "bg-yellow-500/10", text: "text-yellow-400", border: "border-yellow-500/30" };
  if (c.includes("HARD")) return { bg: "bg-white/10", text: "text-white", border: "border-white/20" };
  if (c.includes("INTER")) return { bg: "bg-green-500/10", text: "text-green-400", border: "border-green-500/30" };
  if (c.includes("WET")) return { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/30" };
  return { bg: "bg-gray-500/10", text: "text-gray-400", border: "border-gray-500/30" };
};

const EventPitStrategyTab = ({ sessionKey, allDrivers = [], stintsByDriver = {} }) => {
  const { data: pitStops = [], isLoading } = usePitStops(sessionKey);

  // Build drivers mapping
  const driverMap = React.useMemo(() => {
    const map = {};
    allDrivers.forEach((d) => {
      map[d.driver_number] = d;
    });
    return map;
  }, [allDrivers]);

  if (isLoading) {
    return <LoadingState message="Analyzing pit stop logs…" />;
  }

  // Sort pit stops by stop duration ascending to find the fastest stop, but display sorted by lap number
  const validStops = pitStops.filter((p) => p.stop_duration != null);
  const sortedStops = [...validStops].sort((a, b) => (a.lap_number || 0) - (b.lap_number || 0));

  const hasPits = sortedStops.length > 0;

  return (
    <Surface tier="container" className="p-4 space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-white/5">
        <Wrench size={16} className="text-[var(--md-primary)]" />
        <h3 className="font-display font-black text-sm text-white uppercase tracking-wider">
          PIT STRATEGY & DURATIONS
        </h3>
        <span className="text-[10px] font-mono text-[var(--md-on-surface-variant)] uppercase ml-auto">
          {sortedStops.length} STOPS RECORDED
        </span>
      </div>

      {!hasPits ? (
        <div className="flex flex-col items-center justify-center py-8 text-center text-[var(--md-on-surface-variant)] font-mono text-xs">
          <ShieldAlert size={20} className="mb-2 text-[var(--warning)]" />
          <p>NO PIT STOP DATA AVAILABLE FOR THIS SESSION.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-white/5 text-[var(--md-on-surface-variant)]">
                <th className="py-2.5 font-bold">DRIVER</th>
                <th className="py-2.5 font-bold text-center">LAP</th>
                <th className="py-2.5 font-bold text-right">STATIONARY STOP</th>
                <th className="py-2.5 font-bold text-right">LANE DURATION</th>
                <th className="py-2.5 font-bold text-center">COMPOUNDS</th>
              </tr>
            </thead>
            <tbody>
              {sortedStops.map((stop, idx) => {
                const driver = driverMap[stop.driver_number];
                const name = driver?.full_name || `Driver #${stop.driver_number}`;
                const acronym = driver?.name_acronym || `#${stop.driver_number}`;
                const teamColor = driver?.team_colour ? `#${driver.team_colour}` : "var(--md-primary)";

                // Try to find tyres changed
                const driverStints = stintsByDriver[stop.driver_number] || [];
                const nextStintIdx = driverStints.findIndex((s) => s.lap_start > stop.lap_number);
                const prevStint = nextStintIdx > 0 ? driverStints[nextStintIdx - 1] : null;
                const nextStint = nextStintIdx !== -1 ? driverStints[nextStintIdx] : null;

                const cPrev = prevStint?.compound;
                const cNext = nextStint?.compound;
                const colorsPrev = compoundBadgeColor(cPrev);
                const colorsNext = compoundBadgeColor(cNext);

                return (
                  <tr key={idx} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 flex items-center gap-2">
                      <span className="w-1.5 h-3 inline-block" style={{ backgroundColor: teamColor }} />
                      <span className="font-bold text-white">{acronym}</span>
                      <span className="text-[var(--md-on-surface-variant)] text-[10px] hidden sm:inline">{name}</span>
                    </td>
                    <td className="py-3 text-center text-white font-bold">L{stop.lap_number}</td>
                    <td className="py-3 text-right text-amber-400 font-bold">{Number(stop.stop_duration).toFixed(3)}s</td>
                    <td className="py-3 text-right text-white">{Number(stop.lane_duration).toFixed(3)}s</td>
                    <td className="py-3 text-center">
                      {cPrev && cNext ? (
                        <div className="inline-flex items-center gap-1.5 text-[9px] font-bold">
                          <span className={`px-1.5 py-0.5 border ${colorsPrev.bg} ${colorsPrev.text} ${colorsPrev.border}`} style={{ borderRadius: "1px" }}>
                            {cPrev.slice(0, 1)}
                          </span>
                          <span className="text-[var(--md-on-surface-variant)]">→</span>
                          <span className={`px-1.5 py-0.5 border ${colorsNext.bg} ${colorsNext.text} ${colorsNext.border}`} style={{ borderRadius: "1px" }}>
                            {cNext.slice(0, 1)}
                          </span>
                        </div>
                      ) : cNext ? (
                        <span className={`px-1.5 py-0.5 border text-[9px] font-bold ${colorsNext.bg} ${colorsNext.text} ${colorsNext.border}`} style={{ borderRadius: "1px" }}>
                          NEW {cNext.slice(0, 1)}
                        </span>
                      ) : (
                        <span className="text-[var(--md-on-surface-variant)]">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Surface>
  );
};

export default EventPitStrategyTab;
