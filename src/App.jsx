import React, { Suspense, useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  NavLink,
} from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

import "./App.css";
import { AppConfig } from "./common/AppConfig";
import { getBucket, setActiveSubApp } from "./common/storage";

import { Dashboard } from "./components/Dashboard";
import { EventDetails } from "./components/EventDetails";
import ArchivesPage from "./components/ArchivesPage";
import DriversPage from "./components/Drivers/DriversPage";
import ScoreCardPage from "./components/ScoreCard/ScoreCardPage";

import {
  Loader2,
  Sun,
  Moon,
  Sparkles,
  Laptop,
  RefreshCw,
  SlidersHorizontal,
  X,
} from "lucide-react";

const prefsBucket = getBucket("app", "prefs", "prefs");

/* Scroll to top on route change */
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);
  return null;
};

const RouteStorageSync = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    if (pathname.startsWith("/drivers")) {
      setActiveSubApp("drivers");
    } else if (pathname.startsWith("/archives")) {
      setActiveSubApp("archives");
    } else if (pathname.startsWith("/score-card")) {
      setActiveSubApp("score-card");
    } else if (pathname.startsWith("/event")) {
      setActiveSubApp("event-details");
    } else if (pathname.startsWith("/")) {
      setActiveSubApp("dashboard");
    }
  }, [pathname]);

  return null;
};

const PageFallback = () => (
  <div className="flex items-center justify-center h-[60vh]">
    <Loader2 className="animate-spin w-8 h-8 opacity-60" />
  </div>
);

// Theme order including system mode
const THEME_ORDER = ["system", "dark", "light", "saint"];
const CURRENT_YEAR = String(new Date().getFullYear());
const YEAR_OPTIONS = ["2026", "2025", "2024", "2023", "2022", "2021", "2020"];

// Detect OS theme
const getSystemTheme = () =>
  window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

export default function App() {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMobileControlsOpen, setIsMobileControlsOpen] = useState(false);

  // Load theme from storage
  const [themeMode, setThemeMode] = useState(() => {
    return prefsBucket.getRecord("theme") || "system";
  });

  const [seasonYear, setSeasonYear] = useState(() => {
    return prefsBucket.getRecord("seasonYear") || CURRENT_YEAR;
  });

  // Active theme (actual applied theme)
  const [activeTheme, setActiveTheme] = useState(
    themeMode === "system" ? getSystemTheme() : themeMode
  );

  // Apply themeMode changes
  useEffect(() => {
    let themeToApply = themeMode;

    if (themeMode === "system") {
      themeToApply = getSystemTheme();
      setActiveTheme(themeToApply);
    } else {
      setActiveTheme(themeMode);
    }

    document.documentElement.setAttribute("data-theme", themeToApply);
    // Theme is a user preference, not cache data, so it should never expire
    prefsBucket.setRecord("theme", themeMode);
  }, [themeMode]);

  useEffect(() => {
    prefsBucket.setRecord("seasonYear", seasonYear);
  }, [seasonYear]);

  // Auto-update when OS theme changes
  useEffect(() => {
    if (themeMode !== "system") return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e) => {
      const newTheme = e.matches ? "dark" : "light";
      setActiveTheme(newTheme);
      document.documentElement.setAttribute("data-theme", newTheme);
    };

    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, [themeMode]);

  // Cycle theme
  const cycleTheme = () => {
    const currentIndex = THEME_ORDER.indexOf(themeMode);
    const next = (currentIndex + 1) % THEME_ORDER.length;
    setThemeMode(THEME_ORDER[next]);
  };

  // Manual refresh handler
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Invalidate all queries to force refetch
      await queryClient.invalidateQueries();
      // Refetch all active queries
      await queryClient.refetchQueries();
    } catch (error) {
      console.error("Failed to refresh data:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const closeMobileControls = () => setIsMobileControlsOpen(false);

  return (
    <Router>
      <ScrollToTop />
      <RouteStorageSync />

      <div
        className="min-h-screen flex flex-col transition-colors duration-300 relative z-10 grid-background"
        style={{
          backgroundColor: "var(--bg-color)",
          color: "var(--text-color)",
        }}
      >
        {/* Header */}
        <header
          className="sticky top-0 z-50 backdrop-blur-md shadow-md relative"
          style={{
            backgroundColor: "var(--header-bg)",
          }}
        >
          <div className="mx-auto px-4 sm:px-6 py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="w-full grid grid-cols-[1fr_auto_1fr] items-center sm:w-auto sm:flex sm:items-center sm:gap-4">
              <div className="sm:hidden" />
              <h1
                className="text-2xl font-bold tracking-tight text-center sm:mx-0 sm:text-left"
                style={{ color: "var(--primary-color)" }}
              >
                {AppConfig.name}
              </h1>
              <div className="flex justify-end sm:hidden">
                <button
                  onClick={() => setIsMobileControlsOpen(true)}
                  className="p-2 rounded-full border border-[var(--border-color)] bg-[var(--panel-color)]"
                  aria-label="Open controls"
                >
                  <SlidersHorizontal className="w-5 h-5" />
                </button>
              </div>

              <nav className="hidden md:flex items-center gap-4 text-sm font-semibold">
                {[
                  { to: "/", label: "Home" },
                  { to: "/archives", label: "Archives" },
                  { to: "/drivers", label: "Drivers" },
                  { to: "/score-card", label: "Score Card" },
                ].map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `transition-colors ${
                        isActive
                          ? "text-red-400"
                          : "text-[var(--text-color)] opacity-70 hover:opacity-100"
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </nav>
            </div>

            <div className="hidden sm:flex items-center gap-3">
              <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[var(--text-color)] opacity-70">
                <span className="hidden sm:inline">Season</span>
                <div className="relative">
                  <select
                    value={seasonYear}
                    onChange={(e) => setSeasonYear(e.target.value)}
                    className="appearance-none rounded-full border border-[var(--border-color)] bg-[var(--panel-color)] px-3 py-1 pr-7 text-xs font-semibold tracking-wide text-[var(--text-color)]"
                  >
                    {YEAR_OPTIONS.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] opacity-60">
                    ▼
                  </span>
                </div>
              </div>

              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="p-1 rounded-full hover:scale-110 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Refresh Data"
                title="Refresh data cache"
              >
                <RefreshCw
                  className={`w-6 h-6 ${isRefreshing ? "animate-spin" : ""}`}
                />
              </button>

              {/* Theme Mode Button */}
              <button
                onClick={cycleTheme}
                className="p-1 rounded-full hover:scale-110 transition-transform"
                aria-label="Switch Theme"
              >
                {themeMode === "system" && <Laptop className="w-6 h-6" />}
                {themeMode === "dark" && <Moon className="w-6 h-6 text-slate-300" />}
                {themeMode === "light" && <Sun className="w-6 h-6 text-yellow-500" />}
                {themeMode === "saint" && (
                  <Sparkles className="w-6 h-6 text-purple-300" />
                )}
              </button>
            </div>

          </div>
        </header>

        {/* Mobile Controls Modal */}
        {isMobileControlsOpen && (
          <div className="fixed inset-0 z-[60] flex items-end sm:hidden">
            <button
              className="absolute inset-0 bg-black/60"
              onClick={closeMobileControls}
              aria-label="Close controls"
            />
            <div
              className="relative w-full rounded-t-2xl p-4 border-t"
              style={{
                backgroundColor: "var(--panel-color)",
                borderColor: "var(--border-color)",
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold">Quick Controls</h2>
                <button
                  onClick={closeMobileControls}
                  className="p-1 rounded-full"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-widest opacity-70">
                    Season
                  </span>
                  <div className="relative">
                    <select
                      value={seasonYear}
                      onChange={(e) => setSeasonYear(e.target.value)}
                      className="appearance-none rounded-full border border-[var(--border-color)] bg-[var(--panel-color)] px-3 py-1 pr-7 text-xs font-semibold tracking-wide text-[var(--text-color)]"
                    >
                      {YEAR_OPTIONS.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                    <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] opacity-60">
                      ▼
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-widest opacity-70">
                    Refresh
                  </span>
                  <button
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="p-2 rounded-full border border-[var(--border-color)] bg-[var(--panel-color)] disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Refresh Data"
                  >
                    <RefreshCw
                      className={`w-5 h-5 ${isRefreshing ? "animate-spin" : ""}`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-widest opacity-70">
                    Theme
                  </span>
                  <button
                    onClick={cycleTheme}
                    className="p-2 rounded-full border border-[var(--border-color)] bg-[var(--panel-color)]"
                    aria-label="Switch Theme"
                  >
                    {themeMode === "system" && <Laptop className="w-5 h-5" />}
                    {themeMode === "dark" && (
                      <Moon className="w-5 h-5 text-slate-300" />
                    )}
                    {themeMode === "light" && (
                      <Sun className="w-5 h-5 text-yellow-500" />
                    )}
                    {themeMode === "saint" && (
                      <Sparkles className="w-5 h-5 text-purple-300" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 w-full relative z-10 pb-16 md:pb-0">
          <Suspense fallback={<PageFallback />}>
            <Routes>
              <Route path="/" element={<Dashboard year={seasonYear} />} />
              <Route path="/archives" element={<ArchivesPage year={seasonYear} />} />
              <Route path="/drivers" element={<DriversPage year={seasonYear} />} />
              <Route path="/score-card" element={<ScoreCardPage year={seasonYear} />} />
              <Route path="/event/:meetingKey" element={<EventDetails year={seasonYear} />} />
            </Routes>
          </Suspense>
        </main>

        {/* Mobile Bottom Nav */}
        <nav
          className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t backdrop-blur-md"
          style={{
            backgroundColor: "var(--header-bg)",
            borderColor: "var(--border-color)",
          }}
        >
          <div className="mx-auto px-4 py-2 flex items-center justify-around text-xs font-semibold">
            {[
              { to: "/", label: "Home" },
              { to: "/archives", label: "Archives" },
              { to: "/drivers", label: "Drivers" },
              { to: "/score-card", label: "Score Card" },
            ].map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `px-2 py-1 transition-colors ${
                    isActive
                      ? "text-red-400"
                      : "text-[var(--text-color)] opacity-70 hover:opacity-100"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Footer */}
        <footer
          className="py-4 text-center text-sm relative z-10 hidden md:block"
          style={{
            backgroundColor: "var(--header-bg)",
            color: "var(--text-color)",
            opacity: 0.75,
          }}
        >
          © 2025 {AppConfig.name} — All data © Formula 1
        </footer>
      </div>
    </Router>
  );
}
