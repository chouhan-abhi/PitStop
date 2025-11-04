import React from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { Trophy, UsersRound } from "lucide-react";
import Results from "./views/results/Results";
import DriversPage from "./views/driver/DriversPage";
import DriverProfile from "./views/driversStat/DriverProfile";
import { useDrivers } from "./views/driver/useDrivers";

const PageSwitcher = () => {
  const navigate = useNavigate();
  const location = useLocation();
  useDrivers();
  
  const currentPage = location.pathname === "/drivers" ? "drivers" : "results";

  const pages = [
    { key: "results", label: "Results", icon: Trophy, path: "/" },
    { key: "drivers", label: "Drivers", icon: UsersRound, path: "/drivers" },
  ];

  return (
    <>
      {/* Main Routed Content */}
      <main className="pt-20 pb-24 overflow-y-auto flex-1 transition-all duration-300">
        <Routes>
          <Route path="/" element={<Results />} />
          <Route path="/drivers" element={<DriversPage />} />
          <Route path="/drivers/:driverNumber" element={<DriverProfile />} />
        </Routes>
      </main>

      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
        <div
          className="
            flex items-center justify-around gap-6 
            px-6 py-3 
            bg-gradient-to-r from-gray-900 via-black to-gray-900 
            border border-red-700/60 
            rounded-full 
            shadow-[0_0_20px_rgba(255,0,0,0.4),inset_0_0_10px_rgba(255,0,0,0.2)]
            backdrop-blur-md 
            min-w-[180px]
          "
        >
          {pages.map(({ key, label, icon: Icon, path }) => {
            const active = currentPage === key;
            return (
              <div key={key} className="relative group">
                <button
                  onClick={() => navigate(path)}
                  className={`flex items-center justify-center transition-all duration-300 p-2 rounded-full
                    ${
                      active
                        ? "text-red-500 scale-110 bg-red-600/20 border border-red-600/50 shadow-[0_0_12px_rgba(255,0,0,0.8)]"
                        : "text-gray-400 hover:text-red-400 hover:bg-gray-800/60"
                    }
                  `}
                >
                  <Icon size={22} strokeWidth={2.2} />
                </button>

                {/* Tooltip */}
                <span
                  className="
                    absolute -top-10 left-1/2 -translate-x-1/2 
                    text-xs font-semibold tracking-wide uppercase 
                    bg-black/90 text-white px-3 py-1 rounded-md 
                    opacity-0 group-hover:opacity-100 
                    transition-opacity duration-200 
                    pointer-events-none 
                    shadow-[0_0_10px_rgba(255,0,0,0.3)]
                  "
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default PageSwitcher;
