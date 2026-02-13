import React, { Suspense, lazy, useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  NavLink,
} from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
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

import "./App.css";
import { AppConfig } from "./common/AppConfig";
import { getBucket, setActiveSubApp } from "./common/storage";

const Dashboard = lazy(() =>
  import("./components/Dashboard").then((module) => ({ default: module.Dashboard }))
);
const EventDetails = lazy(() =>
  import("./components/EventDetails").then((module) => ({ default: module.EventDetails }))
);
const ArchivesPage = lazy(() => import("./components/ArchivesPage"));
const DriversPage = lazy(() => import("./components/Drivers/DriversPage"));
const ScoreCardPage = lazy(() => import("./components/ScoreCard/ScoreCardPage"));

const prefsBucket = getBucket("app", "prefs", "prefs");
const THEME_ORDER = ["system", "dark", "light", "saint"];
const CURRENT_YEAR = String(new Date().getFullYear());
const YEAR_OPTIONS = ["2026", "2025", "2024", "2023", "2022", "2021", "2020"];

const getSystemTheme = () =>
  window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

const APP_ROUTES = [
  { to: "/", label: "Home" },
  { to: "/archives", label: "Archives" },
  { to: "/drivers", label: "Drivers" },
  { to: "/score-card", label: "Score Card" },
];

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
  <div className="app-shell py-10">
    <div className="panel h-[52vh] flex items-center justify-center">
      <Loader2 className="animate-spin w-8 h-8 opacity-60" />
    </div>
  </div>
);

const ThemeButton = ({ themeMode, cycleTheme }) => (
  <button
    type="button"
    onClick={cycleTheme}
    className="btn btn-ghost !px-2"
    aria-label="Switch Theme"
  >
    {themeMode === "system" && <Laptop className="w-4 h-4" />}
    {themeMode === "dark" && <Moon className="w-4 h-4" />}
    {themeMode === "light" && <Sun className="w-4 h-4" />}
    {themeMode === "saint" && <Sparkles className="w-4 h-4" />}
  </button>
);

export default function App() {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMobileControlsOpen, setIsMobileControlsOpen] = useState(false);
  const [themeMode, setThemeMode] = useState(() => prefsBucket.getRecord("theme") || "system");
  const [seasonYear, setSeasonYear] = useState(() => prefsBucket.getRecord("seasonYear") || CURRENT_YEAR);

  useEffect(() => {
    const themeToApply = themeMode === "system" ? getSystemTheme() : themeMode;
    document.documentElement.setAttribute("data-theme", themeToApply);
    prefsBucket.setRecord("theme", themeMode);
  }, [themeMode]);

  useEffect(() => {
    prefsBucket.setRecord("seasonYear", seasonYear);
  }, [seasonYear]);

  useEffect(() => {
    if (themeMode !== "system") return undefined;

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (event) => {
      document.documentElement.setAttribute("data-theme", event.matches ? "dark" : "light");
    };

    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, [themeMode]);

  const cycleTheme = () => {
    const currentIndex = THEME_ORDER.indexOf(themeMode);
    setThemeMode(THEME_ORDER[(currentIndex + 1) % THEME_ORDER.length]);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);

    try {
      await queryClient.invalidateQueries();
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

      <div className="angular-ui app-chrome grid-background flex flex-col relative z-10">
        <header className="race-header sticky top-0 z-50 relative">
          <div className="app-shell py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="w-full grid grid-cols-[1fr_auto_1fr] items-center sm:w-auto sm:flex sm:items-center sm:gap-5">
              <div className="sm:hidden" />

              <div className="text-center sm:text-left">
                <p className="text-[10px] uppercase tracking-[0.24em] text-[var(--text-muted)]">
                  Race Control
                </p>
                <h1 className="display-title text-xl sm:text-2xl font-bold tracking-wider text-[var(--text-primary)]">
                  {AppConfig.name}
                </h1>
              </div>

              <div className="flex justify-end sm:hidden">
                <button
                  type="button"
                  onClick={() => setIsMobileControlsOpen(true)}
                  className="btn btn-ghost !px-2"
                  aria-label="Open controls"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                </button>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em]">
              {APP_ROUTES.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `race-tab ${isActive ? "race-tab-active" : ""}`
                  }
                  end={item.to === "/"}
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <div className="hidden sm:flex items-center gap-2">
              <label className="text-[10px] uppercase tracking-[0.22em] text-[var(--text-muted)]">
                Season
              </label>
              <select
                value={seasonYear}
                onChange={(event) => setSeasonYear(event.target.value)}
                className="btn btn-ghost !text-[11px] !tracking-[0.1em] !normal-case"
                aria-label="Select season year"
              >
                {YEAR_OPTIONS.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="btn btn-ghost !px-2"
                aria-label="Refresh Data"
                title="Refresh data cache"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
              </button>

              <ThemeButton themeMode={themeMode} cycleTheme={cycleTheme} />
            </div>
          </div>
        </header>

        {isMobileControlsOpen && (
          <div className="fixed inset-0 z-[60] flex items-end sm:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-black/70"
              onClick={closeMobileControls}
              aria-label="Close controls"
            />
            <div className="relative w-full rounded-t-2xl p-4 border-t border-[var(--border-color)] bg-[var(--panel-color)]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="display-title text-sm tracking-[0.2em] uppercase">Quick Controls</h2>
                <button type="button" onClick={closeMobileControls} className="btn btn-ghost !px-2" aria-label="Close">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">Season</span>
                  <select
                    value={seasonYear}
                    onChange={(event) => setSeasonYear(event.target.value)}
                    className="btn btn-ghost !text-[11px] !normal-case"
                  >
                    {YEAR_OPTIONS.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">Refresh</span>
                  <button
                    type="button"
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="btn btn-ghost !px-2"
                    aria-label="Refresh Data"
                  >
                    <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">Theme</span>
                  <ThemeButton themeMode={themeMode} cycleTheme={cycleTheme} />
                </div>
              </div>
            </div>
          </div>
        )}

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

        <nav
          className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t backdrop-blur-md bg-[var(--header-bg)] border-[var(--border-color)]"
          aria-label="Mobile navigation"
        >
          <div className="app-shell py-2 flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.14em]">
            {APP_ROUTES.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `px-2 py-1 rounded-md transition-colors ${
                    isActive
                      ? "text-[var(--text-primary)] bg-red-500/20"
                      : "text-[var(--text-secondary)]"
                  }`
                }
                end={item.to === "/"}
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </nav>

        <footer className="relative z-10 hidden md:block border-t border-[var(--border-color)]">
          <div className="app-shell py-4 text-xs text-[var(--text-muted)]">
            © 2026 {AppConfig.name} | data partner Jolpica (Ergast mirror)
          </div>
        </footer>
      </div>
    </Router>
  );
}
