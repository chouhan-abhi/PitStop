// src/components/SessionsTable.jsx
import React, { useMemo } from "react";

/**
 * Props:
 * - session: session object with drivers
 * - allDriversRaw: array of driver metadata
 * - getTeamColorWithOpacity/getTeamColorBorder: functions
 * - compact: optional boolean for compact rendering
 */
const SessionsTable = ({ session, allDriversRaw = [], getTeamColorWithOpacity, getTeamColorBorder, compact = false }) => {
  // sort driver list by finalPosition/position
  const driversList = useMemo(() => {
    if (!session?.drivers) return [];
    return Object.values(session.drivers).sort((a, b) => (a.finalPosition || a.position || 999) - (b.finalPosition || b.position || 999));
  }, [session]);

  return (
    <div>
      <h3 className="text-base font-semibold mb-3" style={{ color: "var(--text-color)", opacity: 0.8 }}>
        {/* header handled externally; this remains if needed */}
      </h3>

      <div className="overflow-x-auto rounded-md border border-[var(--border-color)] bg-[var(--panel-color)]">
        <table className={`min-w-full ${compact ? "text-sm" : ""}`}>
          <thead>
            <tr>
              <th className="py-2 px-4 text-left text-sm font-semibold" style={{ color: "var(--text-color)", opacity: 0.7, borderBottom: `1px solid var(--border-color)` }}>Pos</th>
              <th className="py-2 px-4 text-left text-sm font-semibold" style={{ color: "var(--text-color)", opacity: 0.7, borderBottom: `1px solid var(--border-color)` }}>Driver</th>
              <th className="py-2 px-4 text-left text-sm font-semibold" style={{ color: "var(--text-color)", opacity: 0.7, borderBottom: `1px solid var(--border-color)` }}>Team</th>
              <th className="py-2 px-4 text-left text-sm font-semibold" style={{ color: "var(--text-color)", opacity: 0.7, borderBottom: `1px solid var(--border-color)` }}>Start</th>
            </tr>
          </thead>
          <tbody>
            {driversList.map((driverPos) => {
              const fullDriverInfo = allDriversRaw?.find((d) => d.driver_number === driverPos.driver_number);
              const finalPosition = driverPos.finalPosition ?? driverPos.position;
              const startingPosition = driverPos.startingPosition ?? driverPos.starting_grid_position;

              const bg = fullDriverInfo?.team_colour ? getTeamColorWithOpacity(fullDriverInfo.team_colour, "12") : "transparent";
              const borderClr = fullDriverInfo?.team_colour ? getTeamColorBorder(fullDriverInfo.team_colour) : "#fff";

              return (
                <tr key={driverPos.driver_number} className="hover:opacity-85 transition-opacity" style={{ backgroundColor: bg, borderBottom: "1px solid var(--border-color)" }}>
                  <td className="py-2 px-4" style={{ color: "var(--text-color)" }}>{finalPosition}</td>
                  <td className="py-2 px-4">
                    <div className="flex items-center">
                      {fullDriverInfo?.headshot_url && (
                        <img
                          src={fullDriverInfo.headshot_url}
                          alt={fullDriverInfo.full_name}
                          loading="lazy"
                          decoding="async"
                          className="w-8 h-8 rounded-full mr-3 border"
                          style={{ borderColor: borderClr }}
                        />
                      )}
                      <span className="text-base font-medium" style={{ color: "var(--text-color)" }}>
                        {fullDriverInfo?.full_name || driverPos.full_name}
                      </span>
                    </div>
                  </td>
                  <td className="py-2 px-4 text-base" style={{ color: borderClr }}>
                    {fullDriverInfo?.team_name || driverPos.team_name}
                  </td>
                  <td className="py-2 px-4" style={{ color: "var(--text-color)", opacity: 0.6 }}>
                    {startingPosition || "N/A"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default React.memo(SessionsTable);
