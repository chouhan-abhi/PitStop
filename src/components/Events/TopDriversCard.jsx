import React, { useMemo } from "react";
import { getTeamColorWithOpacity, getTeamColorBorder } from "../../common/utils/colors";

export const TopDriversCard = ({
  driversData,
  driversLoading,
  driversIsError,
  driversError,
}) => {
  const top3Drivers = useMemo(() => driversData?.slice(0, 3) || [], [driversData]);

  /* ------------------------- SHIMMER SKELETON ------------------------- */
  const ShimmerRow = () => (
    <div className="flex items-center gap-3 p-3 w-96">
      <div className="w-10 h-10 rounded-full bg-[var(--skeleton-color)]"></div>

      <div className="flex flex-col gap-2">
        <div className="h-3 w-28 rounded bg-[var(--skeleton-color)]"></div>
        <div className="h-3 w-20 rounded bg-[var(--skeleton-color)]"></div>
      </div>
    </div>
  );

  if (driversLoading) {
    return (
      <div className="p-4 rounded-xl bg-[var(--panel-color)] border border-[var(--border-color)] animate-pulse">
        <div className="h-5 w-40 rounded bg-[var(--skeleton-color)] mb-4"></div>

        <div className="space-y-3">
          <ShimmerRow />
          <ShimmerRow />
          <ShimmerRow />
        </div>
      </div>
    );
  }

  /* ------------------------------ ERROR ------------------------------ */
  if (driversIsError) {
    return (
      <div className="p-4 rounded-xl bg-[var(--panel-color)] border border-[var(--border-color)]">
        <p className="text-red-400">{driversError?.message || "Failed to load drivers"}</p>
      </div>
    );
  }

  /* ------------------------------ MAIN ------------------------------ */
  return (
    <div className="bg-[var(--card-bg)]">
      <h3 className="text-base font-semibold mb-3 text-[var(--text-color)] opacity-90 tracking-tight">
        Podium Finishers
      </h3>

      {top3Drivers.length > 0 ? (
        <div className="space-y-3">
          {top3Drivers.map((driver) => {
            const borderColor = getTeamColorBorder(driver.team_colour);
            const bg = getTeamColorWithOpacity(driver.team_colour, "10");

            return (
              <div
                key={driver.driver_number}
                className="
                  flex items-center w-72 gap-3 p-3
                  transition-colors duration-150
                  hover:bg-[var(--hover-bg)]
                "
                style={{
                  borderLeft: `4px solid ${borderColor}`,
                  backgroundColor: bg,
                }}
              >
                {/* Driver Photo */}
                {driver.headshot_url && (
                  <img
                    src={driver.headshot_url}
                    alt={driver.full_name}
                    className="w-10 h-10 rounded-full object-cover border border-[var(--border-color)]"
                  />
                )}

                {/* Info */}
                <div className="flex flex-col">
                  <p className="text-sm font-medium text-[var(--text-color)]">
                    {driver.position ? `${driver.position}. ` : ""}
                    {driver.broadcast_name}
                  </p>

                  <p className="text-xs text-[var(--text-color)] opacity-60">
                    {driver.team_name}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-[var(--text-color)] opacity-60">No top drivers found.</p>
      )}
    </div>
  );
};
