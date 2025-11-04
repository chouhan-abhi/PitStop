import React from "react";
import DriverAvatar from "../../assets/driver_avatar.png";

export default function DriverCard({ driver }) {
  const {
    full_name,
    last_name,
    team_name,
    driver_number,
    country_code,
    headshot_url,
    team_colour,
    name_acronym,
  } = driver;

  const teamColor = `#${team_colour || "ff0000"}`;

  return (
    <div
      className="
        group relative overflow-hidden rounded-xl
        bg-neutral-900/80 border border-neutral-800
        transition-all duration-300
        hover:border-neutral-700 hover:shadow-[0_0_15px_rgba(255,0,0,0.1)]
        cursor-pointer
      "
    >
      {/* Subtle team accent line */}
      <div
        className="absolute left-0 top-0 h-full w-[3px] rounded-l-xl"
        style={{ backgroundColor: teamColor }}
      />

      {/* Card Content */}
      <div className="flex flex-col items-center text-center px-4 py-5 relative z-10">
        {/* Driver Image */}
        <div className="relative w-20 h-20 mb-3">
          <div
            className="absolute inset-0 rounded-full blur-xl opacity-25"
            style={{ backgroundColor: teamColor }}
          />
          <img
            src={headshot_url || DriverAvatar}
            alt={full_name}
            className="w-20 h-20 rounded-full object-cover border border-neutral-700 group-hover:border-red-500 transition-all duration-300"
          />
        </div>

        {/* Driver Info */}
        <h2 className="text-sm font-semibold text-white leading-tight truncate max-w-[8rem]">
          {full_name || "Unknown Driver"}
        </h2>
        <p className="text-xs text-neutral-400 mt-0.5 truncate max-w-[8rem]">
          {team_name || "—"}
        </p>

        {/* Stats */}
        <div className="flex items-center justify-center gap-1.5 mt-2">
          <span
            className="px-1.5 py-0.5 rounded-md text-[11px] font-mono border border-neutral-700 text-neutral-300"
            style={{ color: teamColor }}
          >
            #{driver_number}
          </span>
          <span className="px-1.5 py-0.5 rounded-md text-[11px] font-mono bg-neutral-800 border border-neutral-700 text-neutral-400">
            {name_acronym || "DRV"}
          </span>
          {country_code && (
            <span className="px-1.5 py-0.5 rounded-md text-[11px] bg-neutral-800 border border-neutral-700 text-neutral-400">
              {country_code}
            </span>
          )}
        </div>
      </div>

      {/* Hover Overlay */}
      <div
        className="
          absolute inset-0 rounded-xl 
          bg-gradient-to-t from-black/60 via-transparent to-transparent 
          opacity-0 group-hover:opacity-70 transition-opacity duration-300
        "
      />
    </div>
  );
}
