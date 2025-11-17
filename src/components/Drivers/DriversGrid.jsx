import React, { useMemo } from "react";
import { useLatestSessionDrivers } from "./useLatestSessionDrivers";
import { Loader2 } from "lucide-react";

function SessionDriversGrid({ meetingKey, sessionKey }) {
  const { data: drivers, isLoading, isError } =
    useLatestSessionDrivers(meetingKey, sessionKey);

  // 🧹 Deduplicate by driver_number & sort
  const filteredDrivers = useMemo(() => {
    if (!drivers) return [];

    const map = new Map();
    for (const d of drivers) {
      if (!map.has(d.driver_number)) {
        map.set(d.driver_number, d);
      }
    }

    return Array.from(map.values()).sort(
      (a, b) => Number(a.driver_number) - Number(b.driver_number)
    );
  }, [drivers]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10 opacity-70">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    );
  }

  if (isError || !filteredDrivers.length) {
    return (
      <p className="text-center py-10 opacity-70">
        No driver data available for this session.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-6 p-2

    /* Small devices: fix height & allow scrolling */
    max-h-[70vh] overflow-y-auto

    /* Larger screens: normal layout */
    sm:max-h-none sm:overflow-visible">
      {filteredDrivers.map((d) => (
        <div
          key={d.driver_number}
          className="
    relative flex items-center gap-5 p-5 rounded-2xl
    bg-[var(--panel-color)]/70 backdrop-blur-md
    transition-all hover:shadow-lg hover:-translate-y-1

    /* Small devices fixed height + scroll */
    h-48 overflow-y-auto

    /* Larger screens normal layout */
    sm:h-auto sm:overflow-visible
  "
        >

          {/* Team Accent Bar */}
          <div
            className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl"
            style={{
              backgroundColor: d.team_colour ? `#${d.team_colour}` : "var(--primary-color)",
            }}
          />

          {/* Headshot */}
          <div
            className="w-28 h-28 rounded-full flex items-center justify-center shadow-inner"
            style={{
              background: d.team_colour
                ? `conic-gradient(#${d.team_colour} 0%, #${d.team_colour}80 40%, transparent 40%)`
                : "conic-gradient(var(--primary-color) 0%, transparent 40%)",
            }}
          >
            <img
              src={d.headshot_url}
              alt={d.full_name}
              className="w-24 h-24 rounded-full object-cover shadow"
              onError={(e) =>
              (e.currentTarget.src =
                "https://via.placeholder.com/200?text=No+Image")
              }
            />
          </div>

          {/* Details */}
          <div className="flex flex-col justify-center gap-1">

            {/* Driver Code */}
            <span
              className="text-sm font-bold tracking-widest uppercase opacity-80"
              style={{
                color: d.team_colour ? `#${d.team_colour}` : "var(--primary-color)",
              }}
            >
              {d.name_acronym}
            </span>

            {/* Last Name Big */}
            <span className="text-xl font-extrabold leading-tight">
              {d.last_name}
            </span>

            {/* Broadcast Name Small */}
            <span className="text-sm opacity-70 -mt-1">
              {d.broadcast_name}
            </span>

            {/* Number Badge */}
            <span
              className="
        text-sm font-bold px-2 py-1 rounded-full w-fit
      "
              style={{
                backgroundColor: d.team_colour
                  ? `#${d.team_colour}22`
                  : "var(--primary-color)33",
                color: d.team_colour
                  ? `#${d.team_colour}`
                  : "var(--primary-color)",
              }}
            >
              #{d.driver_number}
            </span>

            {/* Flag + Team */}
            <div className="flex items-center gap-2 mt-1 opacity-80">
              {d.country_code && (
                <img
                  src={`https://flagsapi.com/${d.country_code}/flat/32.png`}
                  className="w-5 h-4 rounded"
                />
              )}
              <span className="text-sm">{d.team_name ?? "Unknown Team"}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default React.memo(SessionDriversGrid);
