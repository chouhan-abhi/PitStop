// src/views/driver/DriversPage.jsx
import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useDrivers } from "./useDrivers";
import DriverCard from "./DriverCard";
import AppLoader from "../../helperComponents/AppLoader";
import AppError from "../../helperComponents/AppError";
import { Grid, List } from "lucide-react";
import DriverAvatar from "../../assets/driver_avatar.png";

export default function DriversPage() {
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const navigate = useNavigate();
  const { data: drivers = [], isLoading, isError } = useDrivers("all", "latest");

  const uniqueDrivers = useMemo(() => {
    const seen = new Set();
    return drivers.filter((d) => {
      if (seen.has(d.driver_number)) return false;
      seen.add(d.driver_number);
      return true;
    });
  }, [drivers]);

  const filteredDrivers = useMemo(() => {
    const term = search.toLowerCase().trim();
    if (!term) return uniqueDrivers;
    return uniqueDrivers.filter((d) =>
      [d.full_name, d.team_name, d.driver_number?.toString()].some((v) =>
        v?.toLowerCase().includes(term)
      )
    );
  }, [uniqueDrivers, search]);

  if (isLoading && !drivers.length)
    return (
      <div className="flex items-center justify-center h-screen bg-black text-gray-400">
        <AppLoader />
      </div>
    );

  if (isError)
    return <AppError message="Failed to load driver data. Please try again later." />;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* ===== FIXED HEADER ===== */}
      <header className="fixed top-16 left-0 right-0 z-20 bg-black/90 backdrop-blur-xl border-b border-gray-800 shadow-[0_2px_10px_rgba(255,0,0,0.15)]">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-xl sm:text-2xl font-semibold tracking-wide uppercase text-white">
            F1 Drivers
          </h1>

          {/* Search + Toggle */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search driver, team, or number"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 sm:w-72 px-4 py-2 rounded-lg bg-gray-900 text-gray-200 text-sm border border-gray-700 focus:ring-2 focus:ring-red-600 focus:outline-none placeholder-gray-500"
            />
            <button
              onClick={() =>
                setViewMode((v) => (v === "grid" ? "list" : "grid"))
              }
              className="p-2 rounded-lg border border-gray-700 bg-gray-900 hover:bg-gray-800 transition-colors"
              title={`Switch to ${viewMode === "grid" ? "List" : "Grid"} View`}
            >
              {viewMode === "grid" ? (
                <List size={20} className="text-gray-300" />
              ) : (
                <Grid size={20} className="text-gray-300" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ===== CONTENT ===== */}
      <main className="pt-28 max-w-7xl mx-auto px-4 pb-10">
        {!filteredDrivers.length ? (
          <div className="text-center text-gray-400 mt-20">
            No drivers found.
          </div>
        ) : viewMode === "grid" ? (
          // 🔹 GRID VIEW
          <div
            className="
              grid gap-4
              grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5
              transition-all
            "
          >
            {filteredDrivers.map((driver) => (
              <div
                key={driver.driver_number}
                onClick={() => navigate(`/drivers/${driver.driver_number}`)}
                className="cursor-pointer transition-transform hover:scale-[1.02]"
              >
                <DriverCard driver={driver} />
              </div>
            ))}
          </div>
        ) : (
          // 🔹 LIST VIEW — Team color border (no left rounding)
          <div className="space-y-3 transition-all">
            {filteredDrivers.map((driver) => {
              const teamColor = `#${driver.team_colour || "ff0000"}`;
              return (
                <div
                  key={driver.driver_number}
                  onClick={() => navigate(`/drivers/${driver.driver_number}`)}
                  className="
                    flex items-center gap-5 p-4
                    bg-gray-900/70 hover:bg-gray-800/80
                    border border-gray-800 cursor-pointer
                    transition-all hover:scale-[1.01] hover:border-gray-700
                  "
                  style={{
                    borderLeft: `6px solid ${teamColor}`,
                    borderTopLeftRadius: 0,
                    borderBottomLeftRadius: 0,
                    borderTopRightRadius: "12px",
                    borderBottomRightRadius: "12px",
                  }}
                >
                  {/* Driver Image */}
                  <img
                    src={driver.headshot_url || DriverAvatar}
                    alt={driver.full_name}
                    className="w-14 h-14 rounded-full object-cover border border-gray-700"
                    onError={(e) =>
                      (e.target.src = "/assets/default-driver.png")
                    }
                  />

                  {/* Driver Info */}
                  <div className="flex-1 min-w-0">
                    <h2 className="text-white font-semibold truncate">
                      {driver.full_name}
                    </h2>
                    <p className="text-sm text-gray-400 truncate">
                      {driver.team_name}
                    </p>
                  </div>

                  {/* Driver Number + Acronym */}
                  <div className="flex flex-col items-end">
                    <span className="text-xs text-gray-400 border border-gray-700 rounded-md px-2 py-1">
                      #{driver.driver_number}
                    </span>
                    <span
                      className="text-xs mt-1 font-semibold"
                      style={{ color: teamColor }}
                    >
                      {driver.name_acronym}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
